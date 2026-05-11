---
name: locate
description: Use this skill whenever the user names a specific concept, mnemonic, partial doc title, or section reference and wants to learn or understand it but is unclear which document covers it. Trigger examples include "I want to learn DLSRS", "学 5 维 HITL 规则", "what is ISFSV", "解释一下 ADR-006", "讲讲 §3.3 of the HITL prompt", "find the doc about service architecture", "where is ADR naming convention documented", "学这个项目的提交规范". The skill performs reverse-lookup, scanning both the project's learning/ subsystem (already-interpreted [LEARNING] docs) and the canonical docs/ tree (source [STANDARD]/[SPEC]/[ADR]/[GUIDE]/[RUNBOOK]), and returns ranked candidates with confidence scores. For open-ended exploration without a named concept ("what can I learn here?"), use sibling /learn-kit:scan instead. Invoke proactively when the user names any project-specific concept they want to study — do not wait for them to say "locate".
allowed-tools: [Read, Glob, Grep]
---

# Locate Skill

Find the right document for the user to learn a named concept. The user typically remembers a *mnemonic* ("DLSRS", "ISFSV", "LSAT"), a *partial title* ("service architecture"), or a *natural-language fragment* ("5 维 HITL 规则", "ADR 命名规范"). They expect to be pointed at the most relevant document — preferably a pedagogical interpretation already authored under `learning/`, falling back to the source canonical document the interpretation would derive from.

## Why this skill exists

A project that uses `learn-kit` typically has two layers of learnable material:

1. **Source canonical docs** in `docs/` — `[STANDARD]_*.md`, `[SPEC]_*.md`, `[ADR]_*.md`, etc. — dense, enumerated, hard to absorb directly.
2. **Pedagogical interpretations** in `learning/` — `[LEARNING]_*.md` — frameworks, metaphors, decision diagrams, mnemonics, authored by following the 8-stage methodology in `learning/_meta/METHODOLOGY.md`.

Without this skill the user has to grep manually, often guessing whether to start in `learning/` or `docs/`. The reverse-lookup closes that gap in a single pass: try `learning/` first (already-distilled material wins), then `docs/` (raw source), and report which tier each hit belongs to so the user can choose whether to learn from the interpretation or go back to the source.

## When to invoke

**Do invoke** for queries shaped like:

- "I want to learn `<concept>`" / "学 `<concept>`"
- "What is `<concept>`?" / "解释一下 `<concept>`" / "讲讲 `<concept>`"
- "Where is `<concept>` documented?" / "`<concept>` 在哪个文档"
- "Find the doc about `<concept>`" / "找一下关于 `<concept>` 的文档"
- "Show me the source for `<concept>`"
- "Interpret §X.Y of `<doc-name>`" / "讲讲 `<doc-name>` 的 §X.Y"

**Do not invoke** — be careful with these near-misses:

- "How is `<X>` implemented?" — that's a code question; let Claude handle it via code search, not this skill.
- "Change `<X>` to `<Y>`" or "fix `<X>`" — editing requests; not a learning intent.
- "What can I learn in this project?" with no named concept — open-ended; route to `/learn-kit:scan` instead.
- "Write a [LEARNING] doc for `<X>`" — that's the user's authoring job, guided by METHODOLOGY.

Concrete contrast pairs:

- "where is RelativePath documented" → **invoke** (lookup)
- "how is RelativePath implemented" → **do not invoke** (code question)
- "学 DLSRS" → **invoke** (named concept)
- "学习这个项目" → **do not invoke** (no named concept → use scan)

## Variables this skill listens for in the user's prompt

The skill is invoked via natural-language prompt, not a structured CLI call. Extract these variables from the prompt:

- **`query`** (always required) — the concept name, mnemonic, partial doc title, or fragment. Extract from the user's most specific noun phrase.
- **`topic`** (optional hint) — if the user says "in learning/hitl/" or "for HITL topic" or "在 svc-arch 里", restrict Step 1 search to that folder.
- **`include_source`** (optional hint, default true) — if the user says "only interpreted docs" or "skip raw STANDARD" or "我只想看已有的学习文档", set `include_source=false` (skip Step 2).

Extraction examples:

- "Locate DLSRS" → `query="DLSRS"`
- "学一下 service architecture" → `query="service architecture"`
- "Find HITL §3.3 in the prompt standard" → `query="HITL §3.3 prompt standard"` (section anchor handled in Step 2)
- "学 5 维 HITL 规则，只看已有的解读" → `query="5 维 HITL 规则"`, `include_source=false`

## Execution flow

Run four steps. Steps 0 and 3 always execute; Steps 1, 2, 4 are gated on prior results and project state. The structure exists so a query that hits early (e.g., a direct INDEX match) doesn't waste cycles in fallback paths, but accumulate candidates rather than short-circuiting — the user benefits from seeing multiple options.

### Step 0: Project recognition (always do this first)

Build a `project_profile`. This determines *what* to search and *how* to weight results, and prevents wasted work in projects that don't follow `learn-kit`'s expected conventions.

1. Try to `Read` `<project-root>/CLAUDE.md`. If present, `Grep` for tag prefixes appearing as either path components or backtick-quoted tokens: `[STANDARD]_`, `[SPEC]_`, `[ADR]_`, `[GUIDE]_`, `[RUNBOOK]_`, `[POLICY]_`, `[RFC]_`, `[POSTMORTEM]_`, `[ASSESSMENT]_`, `[LEARNING]_`. Collect the distinct set.
2. `Glob learning/INDEX.md` to set `has_learning`. If present, also `Read` it and extract topic folder names (typically appearing as `learning/<topic>/` references in tables or section headers).
3. `Glob docs/INDEX.md` to set `has_docs_index`.
4. Compute `confidence` using strict half-open bands (boundaries written explicitly so the 0.95 case is unambiguous):
   - **≥ 0.95**: CLAUDE.md declares ≥ 2 tag prefixes AND `learning/INDEX.md` exists
   - **0.85 ≤ x < 0.95**: CLAUDE.md declares ≥ 2 tag prefixes, no `learning/`
   - **0.7 ≤ x < 0.85**: No CLAUDE.md, but `Glob docs/**/*.md` finds ≥ 3 files matching `[TAG]_*.md` patterns
   - **< 0.7**: Cannot confidently identify project convention — still attempt best-effort search but prepend a warning to the final output

Record internally:

```yaml
project_profile:
  has_learning: <bool>
  has_docs_index: <bool>
  tag_set: [<detected tag prefixes>]
  learning_topics: [<topic folder names if has_learning>]
  confidence: <float 0–1>
```

### Step 1: Search interpreted [LEARNING] docs (preferred tier)

If `has_learning` is true, search the already-authored pedagogical material first. Rank these highest because they're explicitly designed for human comprehension. If `topic` was extracted from the prompt, restrict all three sub-searches to `learning/<topic>/**`.

1. **INDEX hit** (confidence 0.95) — `Read` `learning/INDEX.md` and `Grep query` against table cells, especially columns labeled "解读对象", "topic", "concept", "mnemonic", or any column whose header suggests the concept space. An INDEX match is the strongest signal — the INDEX explicitly catalogs this concept; trust this confidence level.
2. **Frontmatter hit** (confidence 0.85) — `Glob learning/**/[LEARNING]_*.md`. For each file, `Read` its YAML frontmatter (first ~30 lines) and `Grep query` inside `summary`, `aliases`, and `tags` fields. The `aliases` field commonly contains Chinese↔English variants that body grep would miss.
3. **Body hit** (confidence 0.70) — `Grep query` across `learning/**/[LEARNING]_*.md` file contents. If a file already matched in step 1.1 or 1.2, keep only the higher-confidence record — do not double-count.

For each match, record:

- `path`
- `confidence` (per the step that matched)
- `hit_location` (e.g., "INDEX table row 5", "frontmatter aliases", "body line 42")
- `snippet` — 1-line context from the match

### Step 2: Search canonical source docs (secondary tier)

Unless `include_source=false`, also search source canonical docs. These rank below interpreted docs but are still valuable — they're the raw material the user can interpret next, or read directly if no interpretation exists yet.

For each tag prefix `T` in `project_profile.tag_set` (skip `[LEARNING]` — already covered in Step 1):

1. `Glob docs/**/[T]_*.md` — collect candidate files. If `project_profile.tag_set` is empty (low-confidence project), fall back to `Glob docs/**/*.md`.
2. **Filename hit** (confidence 0.85) — if the filename contains `query` (case-insensitive, with word-boundary tolerance — `service-architecture` and `service_architecture` both match `service architecture`), record a high-confidence hit.
3. **Body hit** (confidence 0.70) — `Grep query` against the file body.

**Section anchor extraction** — if `query` contains a section reference matching any of:

- `§\s*\d+(\.\d+)*` (e.g., "§3.3")
- `section\s+\d+(\.\d+)*` (e.g., "section 3.3")
- `第\s*\d+\s*节` or `第\s*\d+(\.\d+)*\s*章`

…extract the section number and emit it as a separate `section_hint` field on each candidate. Do **not** append `#§3.3` to the path itself — neither the `Read` tool nor most IDEs resolve markdown anchors as navigation targets. Display the hint in the output as "(after reading, search for §3.3 in the file)".

### Step 3: Merge, rank, present

Combine Step 1 and Step 2 results into a single ranked list:

- Primary key (descending): tier — interpreted [LEARNING] > canonical source
- Secondary key (descending): confidence within tier
- Tertiary key (ascending): path (deterministic ordering for ties)

Take the top 3–5 candidates. For each, generate a recommended next action phrased as instructions to the user, not as a slash command:

- **Interpreted [LEARNING] hit**: "Open with `Read` tool: `<path>`. This is prebuilt pedagogical material covering the concept."
- **Source-only hit, project has `learning/`**: "Open with `Read` tool: `<path>` (raw source). After reading, consider authoring an interpretation at `learning/<new-topic>/[LEARNING]_*.md` following `learning/_meta/METHODOLOGY.md`."
- **Source-only hit, project has no `learning/`**: "Open with `Read` tool: `<path>` (raw source). Then run `/learn-kit:init` to scaffold the learning subsystem, then apply METHODOLOGY to the source."

### Step 4: Fallback (when Steps 1–3 produce no hits)

Do a broad sweep:

1. `Glob **/*.md` from project root (use `**/` to recurse — bare `*.md` only matches root-level files in most Glob implementations). Filter out common build/dependency directories afterwards: `node_modules/`, `.git/`, `dist/`, `build/`, `.venv/`, `target/`.
2. `Grep query` across the results.
3. If still empty, report "No matches" and suggest the user refine the query — try synonyms, partial mnemonic letters, or fragments of the canonical title.

## Output format

Produce a markdown report with these three sections in this order, even when sections are empty (state "(no matches)" explicitly so users know the search was performed):

```markdown
## Locate: "<query>"

### Interpreted [LEARNING] docs (preferred)

1. **<path>** (confidence <0.xx>, hit: <step description>)
   - Snippet: "<1-line context from the match>"
   - Next: Open with `Read` tool. When `section_hint` applies, append plain-text advice such as: "after reading, search for §3.3 in the file" — this is guidance to the user, not a clickable anchor.

2. ...

### Source canonical docs

1. **<path>** (confidence <0.xx>, hit: <step description>)
   - Snippet: "<1-line context>"
   - Next: Open with `Read` tool. Then consider authoring `learning/<topic>/[LEARNING]_*.md` per METHODOLOGY.

2. ...

### Project recognition

- has_learning: <true|false>
- tag_set: [<list>]
- confidence: <0.xx>
```

If `project_profile.confidence < 0.7`, prepend the entire report with:

```
⚠️ Project structure could not be confidently identified. Results below are best-effort. To improve accuracy:
- Add tag prefix conventions to CLAUDE.md (e.g., document the use of [STANDARD]_, [SPEC]_, etc.)
- Or re-run with a narrower query that includes a path fragment (e.g., "service architecture in docs/rule/").
```

## Performance notes

For projects under ~500 markdown files, this skill completes in 1–3 seconds. For larger projects, suggest the user invoke `/learn-kit:scan --path docs/<subdir>` first to identify which subdirectory to focus on, then re-run locate scoped to that area.

The skill is stateless by design — every invocation re-scans the filesystem. No cache, no manifest, no persistent index. The cost is acceptable for typical project sizes, and statelessness keeps the skill robust to file additions, renames, and deletes without any maintenance burden.

## Sibling skills

- **`/learn-kit:init`** — scaffold the `learning/` subsystem in a fresh project. Must run once before `locate` can find any interpreted docs.
- **`/learn-kit:scan`** — enumerate *all* learnable candidates in the project. Use when the user has not named a specific concept yet ("what can I learn here?"). This is the open-ended counterpart to `locate`'s named-concept lookup.
- **`/notebooklm-kit:learn-make <topic>`** (sibling plugin) — after the user opens an interpreted doc, optionally generate audio / mind-map / quiz artifacts via NotebookLM.

## Non-goals

- This skill does not generate, edit, or validate [LEARNING] documents. Authoring is the user's job, guided by `learning/_meta/METHODOLOGY.md`.
- This skill does not invoke external services or LLMs beyond Claude's own tools. NotebookLM integration is delegated to the `notebooklm-kit` plugin.
- This skill does not modify any files — `allowed-tools` is restricted to `Read`, `Glob`, `Grep`.
