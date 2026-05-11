---
name: scan
description: Use this skill whenever the user wants an overview of the learnable surface of the current project — "what can I learn here", "list the docs I should study", "show me what's documented", "项目里有什么可学的", "show me uninterpreted standards", "学习路径推荐", "where do I start learning this project", "browse the canonical docs". The skill enumerates all canonical doc candidates by tag prefix ([STANDARD]/[SPEC]/[ADR]/[GUIDE]/[RUNBOOK]), cross-references with already-interpreted [LEARNING] docs to mark interpreted vs uninterpreted, ranks by citation frequency so load-bearing docs surface first, and suggests a reading order. For looking up a specific named concept ("I want to learn DLSRS"), use sibling /learn-kit:locate instead. Invoke proactively when the user expresses any open-ended discovery intent ("what's in this project", "where do I start", "browse docs") even when they don't say "scan". Caveat: if the user's previous turn named a specific concept and they now say something like "where do I start", that's typically a continuation of locate intent — defer to /learn-kit:locate in that case.
allowed-tools: [Read, Glob, Grep]
---

# Scan Skill

Enumerate the learnable surface of a project: which canonical docs exist, which have already been interpreted into pedagogical [LEARNING] material, and which are still raw source waiting for interpretation. This answers "what's in here to learn" rather than "where is concept X" (use `/learn-kit:locate` for the latter).

## Why this skill exists

Users meeting a new project — or returning to one after a gap — often have no idea what's there to learn. They face dozens or hundreds of `.md` files under `docs/` and `learning/` with no obvious starting point. Manually `ls`-ing folders and guessing what each file covers is slow and error-prone.

This skill replaces that guesswork with a single enumeration pass that:

- Lists every candidate canonical doc (by tag prefix)
- Cross-references with `learning/` to mark each as **interpreted** (a [LEARNING] doc exists) or **uninterpreted** (raw source only)
- Ranks by citation frequency — docs referenced often by other docs are usually load-bearing
- Surfaces a "suggested reading order" so the user doesn't have to invent priorities themselves

Combined with `/learn-kit:locate` (concept-driven) and `/learn-kit:init` (one-time scaffold), this completes the discovery surface of `learn-kit` without introducing any persistent state.

## When to invoke

**Do invoke** for queries shaped like:

- "What can I learn in this project?" / "项目里有什么可学的"
- "List the docs I should study" / "推荐学习路径" / "学习路径"
- "Show me what's documented here" / "show me the docs catalog"
- "What standards/specs/ADRs exist?" / "本项目有哪些 [STANDARD] / [SPEC]"
- "Which docs have been interpreted?" / "哪些文档已经有学习材料"
- "Browse the canonical docs" / "我想浏览一下文档"
- "Where do I start learning this project?"

**Do not invoke** — be careful with these near-misses:

- "I want to learn `<specific concept>`" — named concept, use `/learn-kit:locate` instead.
- "What is DLSRS?" / "解释一下 ISFSV" — named concept, use `/learn-kit:locate`.
- "List all files in `docs/`" — that's a directory listing, not a learning enumeration; use `ls` or `Glob` directly.
- "Write me a learning doc for `<X>`" — that's authoring work, guided by METHODOLOGY.

Concrete contrast pairs:

- "what should I learn in mj-system" → **invoke** (open-ended)
- "学 DLSRS" → **do not invoke** (named concept → use locate)
- "list ADRs" → **invoke** (catalog request)
- "open the ADR about auth" → **do not invoke** (named concept → use locate)

## Variables this skill listens for in the user's prompt

The skill is invoked via natural-language prompt. Extract these variables from the prompt:

- **`tag`** (optional hint) — if the user says "show me [STANDARD]s" or "list the SPECs" or "本项目的 ADR", restrict enumeration to that single tag prefix.
- **`path`** (optional hint, default `docs/`) — if the user says "in docs/infrastructure/" or "在 docs/rule 目录里", restrict to that subdir.
- **`unread_only`** (optional hint, default false) — if the user says "only uninterpreted" or "show me what's NOT yet interpreted" or "未解读的", hide already-interpreted candidates.
- **`limit`** (optional hint, default 20) — if the user says "top 10" or "前 5 个", honor that.

Extraction examples:

- "What can I learn here?" → all variables default
- "List all uninterpreted [STANDARD]s" → `tag=[STANDARD]`, `unread_only=true`
- "Show me top 5 ADRs in docs/adr/" → `tag=[ADR]`, `path=docs/adr/`, `limit=5`
- "项目里有什么可学的，未解读优先" → `unread_only=true`

## Execution flow

Run three steps. Step 0 always executes; Steps 1 and 2 build on each other.

### Step 0: Project recognition (shared with locate)

Build a `project_profile` so subsequent steps know what to enumerate. Use the same recognition logic as the `locate` skill — kept identical intentionally so both skills agree on what counts as a project's tag set.

1. Try to `Read` `<project-root>/CLAUDE.md`. If present, `Grep` for tag prefixes appearing as path components or backtick-quoted tokens: `[STANDARD]_`, `[SPEC]_`, `[ADR]_`, `[GUIDE]_`, `[RUNBOOK]_`, `[POLICY]_`, `[RFC]_`, `[POSTMORTEM]_`, `[ASSESSMENT]_`, `[LEARNING]_`. Collect the distinct set.
2. `Glob learning/INDEX.md` to set `has_learning`. If present, also extract topic folder names.
3. `Glob docs/INDEX.md` to set `has_docs_index`.
4. Compute `confidence` using strict half-open bands (same numeric thresholds as `locate`; boundaries written explicitly so 0.95 is unambiguous):
   - **≥ 0.95**: CLAUDE.md declares ≥ 2 tag prefixes AND `learning/INDEX.md` exists
   - **0.85 ≤ x < 0.95**: CLAUDE.md declares ≥ 2 tag prefixes, no `learning/`
   - **0.7 ≤ x < 0.85**: No CLAUDE.md, but `Glob docs/**/*.md` finds ≥ 3 files matching `[TAG]_*.md`
   - **< 0.7**: Cannot confidently identify project convention — Step 1's empty-`tag_set` fallback (defined at the end of Step 1) becomes the operative path; still emit a warning in the report header. Scan tolerates lower confidence than locate because enumeration degrades gracefully: we can still list `.md` files even when tag inference is shaky, whereas reverse-lookup needs to pick a winner.

Internally:

```yaml
project_profile:
  has_learning: <bool>
  has_docs_index: <bool>
  tag_set: [<detected tag prefixes>]
  learning_topics: [<topic folder names if has_learning>]
  confidence: <float 0–1>
```

### Step 1: Enumerate canonical candidates

For each tag prefix `T` in `project_profile.tag_set` (skip `[LEARNING]` — that's the interpretation layer, not source):

1. `Glob docs/**/[T]_*.md` — collect candidate paths.
2. For each candidate, capture:
   - **path**
   - **filename** (for display)
   - **first H1 or frontmatter `summary`** — fetch via small `Read` of the first 30 lines

Apply user-supplied variables:

- If `path` was extracted, restrict the Glob to `<path>/**` instead of `docs/**`.
- If `tag` was extracted, restrict to that single tag prefix.
- If `project_profile.tag_set` is empty (low-confidence project), fall back to `Glob docs/**/*.md` (or `<path>/**/*.md`) and bucket by inferred type from filename / frontmatter.

### Step 2: Cross-reference with interpreted [LEARNING] docs

If `has_learning` is true, build a *source-to-interpretation* map:

1. `Glob learning/**/[LEARNING]_*.md` — collect all interpreted docs.
2. For each interpreted doc, `Read` its YAML frontmatter and extract the `source` field. Real-world frontmatter varies — accept all of these shapes:
   - **(a) Scalar path string**: `source: docs/rule/[STANDARD]_HITL.md` → use directly
   - **(b) Wikilink with `|alias` suffix**: `source: "[[STANDARD]_HITL.md|HITL §3]]"` → strip surrounding `[[` and `]]`, then drop everything after `|`. If the resulting token is a basename only (no path), resolve via `Glob docs/**/<basename>` to find the absolute path
   - **(c) Markdown link**: `source: "[HITL §3](../../docs/rule/[STANDARD]_HITL.md)"` → extract the URL between `(` and `)`, resolve relative to the [LEARNING] file's directory
   - **(d) List**: `source: [<a>, <b>, ...]` → flatten; one interpretation can cover multiple canonical sources (e.g., a [LEARNING] doc that spans §3 of STANDARD-A and §1 of STANDARD-B)
3. If extraction fails for an entry (malformed frontmatter, unresolvable wikilink, missing file), do not drop silently — record it on an internal "unresolvable interpretations" list and surface the count in the report's project recognition section so the user can investigate.
4. Build a map: `<canonical-path> → [<interpreted-path>, ...]`. One canonical doc may have multiple interpretations covering different aspects.

For each candidate from Step 1, mark:

- **interpreted** if the canonical path appears in the map — record which [LEARNING] doc(s) cover it.
- **uninterpreted** otherwise.

### Step 3: Rank, filter, present

**Ranking** — use lightweight citation counts as a PageRank-lite proxy for "load-bearing-ness". The recipe must avoid two failure modes: (i) grepping a concept stem like `HITL` matches prose mentions of the concept rather than file references; (ii) the brackets in `[STANDARD]_*.md` are regex character classes by default and won't match literally.

1. For each canonical candidate, count how many *other* canonical docs reference it. Use this concrete `Grep` recipe:
   - **Search pattern**: the full filename including `.md` extension (e.g., `[STANDARD]_HITL.md`) — not the stem. The `.md` suffix anchors hits on link / path references rather than prose mentions of the concept.
   - **Literal-string mode**: pass the pattern as a fixed string so `[` and `]` are treated as literal brackets, not regex character classes. If the Grep tool exposes a literal flag, use it; otherwise escape `[` → `\[` and `]` → `\]` in the pattern.
   - **Output mode**: use `output_mode: files_with_matches` so the result is a distinct file list, not a raw match count.
   - **Self-exclusion**: count the list length, then subtract 1 if the candidate's own path appears (a file naturally contains its own basename in headers / frontmatter).
2. Sort by citation count descending. Ties broken alphabetically by path.

This is intentionally crude — it favors docs the project itself treats as foundational. A doc cited 30 times is almost certainly more important than one cited twice. The user can re-rank manually if they have other priorities.

**Filters** — apply user-supplied variables:

- If `unread_only=true`, drop interpreted candidates.
- If `tag=<X>`, drop candidates whose tag prefix doesn't match (usually redundant since Step 1 already restricted, but apply defensively).
- If `path=<subdir>`, already restricted in Step 1.

**Cap output** — show top `limit` candidates (default 20). If total candidates is small (≤ 30), show all regardless of `limit`.

## Output format

Produce a markdown report with these sections in order:

```markdown
## Scan: <project root or filtered path>

### Project recognition

- has_learning: <true|false>
- has_docs_index: <true|false>
- tag_set: [<list>]
- confidence: <0.xx>
- total canonical candidates: <N>
- interpreted: <I>; uninterpreted: <U>

### Top uninterpreted canonical docs (suggested next interpretations)

| Path | Tag | Cited | First-line summary |
|------|-----|-------|--------------------|
| docs/.../[STANDARD]_X.md | [STANDARD] | 43 | <summary> |
| ... | ... | ... | ... |

### Interpreted canonical docs (already have [LEARNING] material)

| Canonical | Interpretation(s) | Cited |
|-----------|-------------------|-------|
| docs/rule/[STANDARD]_HITL.md | learning/hitl/[LEARNING]_HITL_Common_Rules_Interpretation.md | 28 |
| ... | ... | ... |

### Recommended next actions

**If uninterpreted candidates exist** (the common case):

- Top reading priority: open the highest-cited uninterpreted doc with `Read` tool — that's the most foundational raw source the project hasn't yet distilled.
- Next interpretation to author: same path — apply the 8-stage methodology from `learning/_meta/METHODOLOGY.md`.
- For a specific named concept lookup, use `/learn-kit:locate <concept>`.

**If every candidate in scope is already interpreted** (rare; happens in mature projects):

- All canonical docs in scope have associated [LEARNING] material. Consider one of:
  - Re-run scan with broader scope (drop `tag` / `path` hints) to find candidates the current filter excluded
  - Review the top-cited interpreted docs to identify pedagogical gaps or outdated interpretations worth revisiting
  - Switch to `/learn-kit:locate <concept>` to dive into a specific concept rather than browse
```

If `project_profile.confidence < 0.7`, prepend:

```
⚠️ Project structure could not be confidently identified. Enumeration below is best-effort. To improve accuracy:
- Add tag prefix conventions to CLAUDE.md (document use of [STANDARD]_, [SPEC]_, etc.)
- Or re-run scoped to a specific tag or path (e.g., "list ADRs in docs/adr/").
```

If `has_learning=false`, replace the "Interpreted canonical docs" section with:

```
### Interpreted canonical docs

No `learning/` subsystem detected. Run `/learn-kit:init` to scaffold it before authoring any [LEARNING] interpretations.
```

## Performance notes

Step 3's citation count is the most expensive part — it runs `Grep <basename>` once per candidate. For a project with 50 candidates, expect ~3–5 seconds. For projects with > 200 candidates, suggest the user pass `tag:` or `path:` hints to narrow scope first, or accept a longer wait.

Like `locate`, this skill is stateless — every invocation re-scans. No cache, no manifest. The tradeoff is acceptable: file changes don't desync any index, and the typical user invokes scan only a handful of times when onboarding to a project.

## Sibling skills

- **`/learn-kit:locate <query>`** — concept-driven reverse lookup. Use when the user names a specific concept (mnemonic, doc title fragment) rather than asking for an overview.
- **`/learn-kit:init`** — scaffold the `learning/` subsystem in a fresh project. Required before scan can mark anything as "interpreted".
- **`/notebooklm-kit:learn-make <topic>`** (sibling plugin) — after the user picks a candidate to learn, optionally generate audio / mind-map / quiz artifacts via NotebookLM.

## Non-goals

- This skill does not generate, edit, or validate any documents. `allowed-tools: [Read, Glob, Grep]` is strictly enforced.
- This skill does not assess document *quality* — only existence and citation frequency. A doc could be cited 50 times and still be poor pedagogically; this skill won't tell you.
- This skill does not perform full-text content search — it's about *what exists*, not *what's in it*. Use `/learn-kit:locate <query>` for content-based search.
- This skill does not maintain or update any kind of index file. Recognition + enumeration runs from scratch every invocation, by design.
