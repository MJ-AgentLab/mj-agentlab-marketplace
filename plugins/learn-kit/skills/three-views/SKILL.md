---
name: three-views
description: |-
  Use when the user wants to learn a topic by generating one or more tiered learning documents from project files, URLs, or pasted text: foundation for beginners, structural for systems thinking, and challenge for deeper reasoning. Also use when the user asks to render learning HTML or optionally generate NotebookLM audio, video, slides, or a mind map. Trigger on requests such as “我想学习某主题”, “为某主题出三档学习材料”, “三视角学习”, “generate learning docs”, “render learning HTML”, or “推到 NotebookLM 出多媒体”. The workflow collects sources, lets the user choose tiers, writes Markdown, then offers optional outputs. The personal-NotebookLM branch requires Node.js 22+, uv 0.11.21+, Python 3.12 available to uv, and the pinned learn-kit NLM bridge 4.0.0 with connector 0.8.7; run nlm login if prompted. Do not use for a short definition or a single-concept explanation; use glossary or concept instead.
allowed-tools: 'Read Write Glob Grep AskUserQuestion Agent WebFetch Bash(node "${CLAUDE_SKILL_DIR}/scripts/hash-upload-corpus.mjs" *) mcp__plugin_learn-kit_notebooklm-mcp__notebook_list mcp__plugin_learn-kit_notebooklm-mcp__notebook_get mcp__plugin_learn-kit_notebooklm-mcp__notebook_create mcp__plugin_learn-kit_notebooklm-mcp__source_add mcp__plugin_learn-kit_notebooklm-mcp__studio_create mcp__plugin_learn-kit_notebooklm-mcp__studio_status'
---

# three-views · Topic → 1-3 Tier Learning Markdown (+ Optional HTML + Optional NLM)

The single learn-kit skill (v3.0.0+; v3.1.0 added tier multi-select + 5-cell artifact-type granularity). Generates a user-chosen subset of foundation / structural / challenge markdown for any topic, with opt-in HTML rendering and opt-in NotebookLM multimedia artifacts.

## Slash invocation

This skill is auto-discovered by Claude Code's plugin loader; no separate `commands/` file is required. Invoke explicitly via:

```
/learn-kit:three-views <topic>
```

Natural-language triggers (listed in frontmatter `description`) activate the same skill — e.g. "我想学习 X" / "为 X 出三档学习材料" / "把 X 推到 NotebookLM 出多媒体".

## Why this skill exists

Three layers of pedagogical artifact are commonly needed when a learner first meets a topic:

1. **Three reading tiers per topic** — each addresses a different stage of comprehension:
   - **Foundation 零基础版**: few terms, many analogies; first-pass understanding
   - **Structural 结构版**: concept maps, prerequisite ladders, applicability boundaries; system-building
   - **Challenge 挑战版**: counter-examples, failure-case diagnosis, transfer problems; active mastery

   Together they form a learning curve. Manual authoring is slow; this skill drives an AI-templated generation flow with quality constraints baked in.

2. **Interactive HTML companion** (opt-in, per-tier) — markdown is good for reading and grepping; a static interactive HTML page (SVG diagrams, syntax-highlighted code, tabbed comparison, "copy as prompt" buttons, dark/light theme) compresses 30 minutes of deep digestion into a single self-contained file. **Dual-mode grounding**: if source includes project files AND cwd is a git repo, spawn Explore subagent for concept→code grounding (file:line+snippet); otherwise use source_manifest entries for concept→source-section grounding (no fabrication). Generated for whichever tiers the user produced markdown for.

3. **NotebookLM multimedia artifacts** (opt-in, per-type) — NotebookLM transforms the generated markdown files into multimedia formats suited to different study contexts (commute / meeting prep / poster review). Up to **9 view-cycled artifacts** when all 3 tiers + all 3 view-cycled types selected (audio + video + slide_deck × 3 views) + **1 shared mind_map** (view-agnostic). Output is terminal-only (URLs); nothing is downloaded.

v3.0.0 absorbs the complete generate-tier + nlm-studio capabilities (with NLM 13 → max 10 artifact range scaled per [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](../../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md)). All nlm-studio dogfood防护 are preserved.

## When to invoke

**Do invoke** for queries shaped like:

- "我想学习 `<topic>`" / "学习材料生成 / `<topic>`"
- "为 `<topic>` 生成 foundation/structural/challenge 三档文档"
- "基于 `<source-doc>` 出三档学习材料"
- "三视角学习 `<topic>`" / "AI 三档生成"
- "Generate learning docs for `<topic>`" / "make an interactive learning page about `<X>`"
- "把 `<topic>` 推到 NotebookLM" / "Make NLM artifacts for `<topic>`"

**Do not invoke** — be careful with these near-misses:

- "What does `<X>` mean?" / "解释一下 `<X>`" → general explanation, not artifact creation
- "Edit the existing foundation doc to fix typo X" → direct file edit, not regeneration
- "What can I learn in this project?" → general exploration via Glob/Grep, no need for full 3-tier pipeline

## Variables this skill listens for

Extract these from the user's prompt before asking anything:

- **`topic`** (preferred) — subject slug; from user's most specific noun phrase. Heuristic: kebab-case the topic (e.g., "React useEffect 内部原理" → `react-useeffect-internals`). Defer to Step 1 if not inferable.
- **`user_question`** (required) — verbatim user question / learning intent. Becomes a template variable driving generation of each tier in `requested_tiers` (Step 1.3).
- **`source_hints`** (optional) — `@file.md` paths / "用 docs/X.md" → pre-select Step 1 input mechanism.
- **`html_hint` / `nlm_hint`** (optional) — if user explicitly says "also generate HTML" / "and NLM", pre-check Step 4 options but **still require Step 4 confirmation** (HITL gate per [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](../../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) §3.2 risk mitigation).

## Execution flow

The skill runs a 5-step workflow. Step 1 (4 sub-prompts: source mechanism / output dir / **tier selection** / conflict policy) and Step 4 use `AskUserQuestion`; Step 5 may use more for re-run guard / quota gate. Each step gates on the prior's output — do not skip ahead.

**State variables** the skill threads through the workflow (single source of truth):

| Var | Set at | Consumed by | Meaning |
|-----|--------|-------------|---------|
| `requested_tiers` | Step 1.3 HITL | Step 3 loop | User-intent subset of `{foundation, structural, challenge}` (≥1) |
| `generated_tiers` | end of Step 3 | Steps 5A, 5B | `requested_tiers − conflict_skipped − generation_failed` (tiers actually written) |
| `html_selected: bool` | Step 4 HITL | Step 5A | Whether HTML cell was checked |
| `selected_view_cycled_types` | Step 4 HITL | Step 5B | `⊆ {audio, video, slide_deck}` from Step 4 cells |
| `mind_map_selected: bool` | Step 4 HITL | Step 5B | Whether mind_map cell was checked |
| `selected_nlm_artifacts` | Step 5B build | Step 5B loop | `cartesian(generated_tiers, selected_view_cycled_types) + (mind_map if selected)` |
| `source_corpus_key` | Step 5B notebook setup | Step 5B re-run guard | Stable hash of `(topic, sorted(generated_tiers), sorted([s.content_sha256 for s in source_manifest]))`; computed live from `notebook_get` source list on re-run |

**Invariants**:

- Steps 5A/5B consume `generated_tiers`, **not** `requested_tiers` (handles conflict-skip + generation-fail).
- Step 5B.3 `source_add` count = `len(generated_tiers)`, not hardcoded 3.
- mind_map prompt and template refer to "selected source corpus" / "selected tiers"; never "all three tiers".

### Step 1 — Intake

1. **Resolve `<topic>`**:
   - From args if provided.
   - From `user_question` heuristic.
   - Otherwise AskUserQuestion (free-text) prompting for topic + sanitize to kebab-case ASCII safe chars.

2. **Source mechanism selection** — AskUserQuestion(multiSelect=true, ≥1 must be checked):
   - 外部 URL（WebFetch fetch）
   - 项目内文件路径（Read 1+ files）
   - 粘贴文本（inline）

3. **Tier selection** (new in v3.1.0) — AskUserQuestion(`multiSelect: true`, ≥1 must be checked):

   ```
   AskUserQuestion(
     header: "Tiers",
     question: "要生成哪些视角？（默认 3 项全选；至少选 1 项）",
     multiSelect: true,
     options: [
       { label: "Foundation 零基础版",
         description: "少术语 + 多类比 + 故事；first-pass 理解",
         default: true },
       { label: "Structural 结构版",
         description: "概念地图 + 适用边界 + 自检清单；system-building",
         default: true },
       { label: "Challenge 挑战版",
         description: "反例 + 失败案例诊断 + 迁移题；active mastery",
         default: true }
     ]
   )
   ```

   **Validation**: if user submits 0 selections → re-prompt **once** with explicit "至少选 1 项；默认 3 项全选 = 维持 v3.0.0 行为". Second 0-selection → abort with `"至少选 1 项——三档全部跳过 = 整个 skill 无产出，等同直接取消"`. Do NOT silently fall back to default.

   Persist as `requested_tiers` (ordered subset of `[foundation, structural, challenge]` in canonical order). Consumed by Step 1.4 conflict check, Step 3 markdown loop, and (via `generated_tiers`) Steps 5A/5B.

4. **Output directory**:
   - Default `./learning/<topic>/`.
   - User may override via free-text prompt (default shown).
   - **Path safety check**: if output dir is absolute path OR escapes cwd (compare against `pwd` heuristic by Glob-checking `./<rel-path>` resolution), AskUserQuestion 二次确认 (Proceed / Abort).
   - **Repo detection** (best-effort, no Bash): Glob `.git/HEAD` succeeds → assume git repo (worktree-mode .git file works too if Glob resolves through it; otherwise treat as non-repo).
   - **Conflict check**: if `<output_dir>/[LEARNING]_<topic>_<view>.md` exists for any `view ∈ requested_tiers` → AskUserQuestion(Overwrite / Append `.v2` suffix / Skip conflicting view / Abort). Record any "Skip conflicting view" choices in `_skipped_tiers` for later subtraction (consumed at end of Step 3 to compute `generated_tiers`).

5. **Pre-flight scaffold** (only when output dir = default `./learning/<topic>/`):
   - Create `./learning/<topic>/` if missing (Write tool auto-creates parent dirs).
   - Create `./learning/INDEX.md` skeleton if missing (one H1 title + a table-header row for topics). Multiple-topic later: append a row. **Do NOT create `_meta/METHODOLOGY.md` or `_archive/`** (per `[ADR]_LearnKit_Consolidation_To_Single_Skill` §2.3.11 Option B — manual methodology scaffold retired).

### Step 2 — Source acquisition

Collect each selected source into the **source_manifest** (structured tracking; never plain concat):

```yaml
source_manifest:
  - id: S1
    kind: url
    locator: https://example.com/article
    fetched_at: <ISO8601 UTC>
    title: <h1 or <title>>
    content_sha256: <first 16 chars>
    char_count: <int>
  - id: S2
    kind: file
    path: docs/example.md
    line_range: "1-200" or "full"
    content_sha256: <...>
    char_count: <int>
  - id: S3
    kind: pasted_text
    label: user-paste-1
    char_count: <int>
```

**Source fallback table**:

| Source kind | Failure mode | Behavior |
|-------------|--------------|----------|
| URL | 404 / 网络错 | AskUserQuestion(skip / retry / abort) |
| URL | 登录墙 (403, HTML redirect to login) | skip + 警告（不留 placeholder, manifest 标 `kind: url-skipped`） |
| URL | 超大 (> 50k char) | 自动 split-summarize（每 chunk summary 再 merge；manifest 标 `content_summarized: true`） |
| File | 不存在 | abort (fail-fast) |
| File | > 50k char | split-summarize（同上） |
| Pasted | > 50k char | split-summarize |

**Prompt context** uses source boundary wrapping (no concat):

```
===== SOURCE S1: <locator> =====
<content or summary>
===== END SOURCE S1 =====

===== SOURCE S2: <path> =====
...
===== END SOURCE S2 =====
```

Compute `uploaded_docs_summary`: 3-5 line summary listing source ids + sizes, keyed by `S<n>` for cross-reference in markdown frontmatter and prompt body.

### Step 3 — N-view markdown generation

For each view in `requested_tiers` (1-3 iterations):

1. `Read` the corresponding template at `${CLAUDE_PLUGIN_ROOT}/skills/three-views/templates/view-<view>.md`.
2. **Extract `MARKDOWN_GENERATION_PROMPT` block** between `<!-- BEGIN:MARKDOWN_GENERATION_PROMPT -->` and `<!-- END:MARKDOWN_GENERATION_PROMPT -->` markers. **Template integrity check** (see "Template integrity checks" section below) — if the markers are missing or mal-paired, abort.
3. Substitute placeholders in the extracted block:
   - `{user_question}` → verbatim from Step 1
   - `{topic_name}` → confirmed slug from Step 1
   - `{uploaded_docs_summary}` → from Step 2
4. Execute the substituted prompt against source_corpus — Claude reads the wrapped source blocks and renders the markdown per the template body.
5. Prepend YAML frontmatter:

   ```yaml
   ---
   type: learning-tier
   topic: <topic>
   view: <foundation | structural | challenge>
   source_question: <user_question>
   source_manifest:
     - id: S1
       kind: url
       locator: https://...
     - id: S2
       kind: file
       path: docs/...
   generated_at: <ISO8601 UTC>
   generator: learn-kit/three-views@3.1.0
   grounding_mode_for_html: (pending, decided at Step 5A if HTML opted in)
   ---
   ```

6. `Write` to `<output_dir>/[LEARNING]_<topic>_<view>.md`.

7. **INDEX update** (only when output_dir = default `./learning/<topic>/` AND `learning/INDEX.md` exists from Step 1.5):
   - Append (or update existing rows) under `## Tier Documents` (only for tiers in `requested_tiers`):
     ```
     | <topic> | <view> | [LEARNING]_<topic>_<view>.md | — | <ISO8601 date> |
     ```
   - Deterministic ordering: `(topic ASC, view canonical-order ASC)` where canonical view order is foundation < structural < challenge.

**After the loop completes**, compute and log:

```
generated_tiers = requested_tiers − _skipped_tiers − _failed_tiers
```

Emit one log line stating the final `generated_tiers` (which Steps 5A/5B will consume). Examples:
- `requested_tiers = {foundation, structural, challenge}`, no conflicts → `generated_tiers = {foundation, structural, challenge}`
- `requested_tiers = {foundation, structural}`, structural Step 1.4 conflict-skipped → `generated_tiers = {foundation}`
- `requested_tiers = {challenge}`, challenge generation failed → `generated_tiers = {}` → **abort with explicit error** ("markdown 必出 invariant violated: no tier successfully generated").

### Step 4 — Multi-select 询问额外产出 (5-cell, v3.1.0)

Let `N = len(generated_tiers)` (computed at end of Step 3). Interpolate `N` and the actual `generated_tiers` list into the question text.

```
AskUserQuestion(
  header: "Extras",
  question: "已生成 <N> 份 md（views: <generated_tiers list>）。要哪些额外产出？（默认全不选；勾几格生几格）",
  multiSelect: true,
  options: [
    {
      label: "HTML 渲染",
      description: "交互式单页 HTML × <N> 份（每生成 tier 一份）；自动选 grounding 模式（有仓库代码 → concept→code 经 Explore subagent；外部 URL/文本 → concept→source-section）"
    },
    {
      label: "NLM audio",
      description: "NotebookLM audio (deep_dive) × <N> 份（每生成 tier 一份）；需 nlm login；进入 quota right-sizing gate"
    },
    {
      label: "NLM video",
      description: "NotebookLM video (explainer) × <N> 份；同上"
    },
    {
      label: "NLM slide_deck",
      description: "NotebookLM slide_deck (detailed_deck) × <N> 份；同上"
    },
    {
      label: "NLM mind_map",
      description: "1 个 shared mind_map（view-agnostic；dogfood finding #5：NLM 媒介对 mind_map 无视 view 差异化指令；与 generated_tiers 数量解耦——总是 1 个）"
    }
  ]
)
```

**Hint behavior** (3-level granularity; preserves explicit user intent):

| Hint kind | Detection | Pre-check action |
|-----------|-----------|------------------|
| HTML | `html_hint=true` (e.g. "also output HTML" / "出 HTML") | Pre-check `HTML 渲染` cell |
| Explicit-type NLM | User names specific types (e.g. "just an audio podcast" / "只要 audio" / "video + slide_deck") | Pre-check only the named NLM type cell(s) |
| Generic-NLM | User says "NLM" / "多媒体" / "推到 NotebookLM" without type | Pre-check all 4 NLM cells (audio + video + slide_deck + mind_map) |
| No hint | Default | All cells unchecked |

All hint-driven pre-checks **still require explicit confirmation** (HITL gate; never auto-trigger HTML / NLM without explicit user yes per [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](../../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) §3.2 risk mitigation). User can uncheck pre-checked cells before submitting.

**Persist Step 4 outputs**:

- `html_selected: bool` ← whether "HTML 渲染" was checked
- `selected_view_cycled_types: set ⊆ {audio, video, slide_deck}` ← which NLM view-cycled cells were checked
- `mind_map_selected: bool` ← whether "NLM mind_map" was checked

**If user un-selects all 5 cells (empty multiSelect)**: skip Step 5 entirely; jump to terminal recap with just the `len(generated_tiers)` md paths. Emit explicit log line `"No extras selected. Terminal output: markdown only."`.

### Step 5 — Execute selected

#### Step 5A — HTML rendering (if "HTML 渲染" selected)

1. **Decide grounding mode** (per `templates/html-renderer.md` decision table):
   - `repo-code`: source_manifest has ≥1 `file` kind AND `.git/HEAD` Glob succeeds
   - `source-evidence`: source_manifest is URL- or pasted-text-only OR cwd not git repo
   - `mixed`: both file + (URL/pasted) AND cwd is git repo

2. **Concept extraction** (for each `view ∈ generated_tiers`, from the just-written tier markdown):
   - All H2 / H3 headings
   - Frontmatter `aliases` if present
   - Tag rows marked "术语" / "Term"
   - Cap 30 concepts per tier

3. **For `repo-code` / `mixed` modes**: spawn Explore subagent (`subagent_type: "Explore"`) with this prompt. The difference between the two modes is the data passed to the renderer (Step 5A.5): `repo-code` passes `concept_to_code_map_json` non-empty and `source_manifest_json` URL-only filter empty; `mixed` passes BOTH non-empty so the renderer can fall back to source-evidence for any concept the Explore subagent returned `file=null`.

   ```
   Background: rendering interactive HTML learning doc for tier <view> of topic <topic> in repo at <repo_path>.
   Need code grounding for these concepts:
     - <concept 1>
     - ...
   For each concept, find ONE most-representative code reference. Return JSON (≤200 lines):
   [
     {
       "concept": "<original text>",
       "file": "<absolute path or null>",
       "line_start": <int or null>,
       "line_end": <int or null>,
       "snippet": "<≤15 lines, exact>",
       "why": "<1 sentence>"
     }
   ]
   Use breadth: medium. If no code embodiment, file=null + explain in why. Do NOT invent file paths.
   ```

   One subagent per `view ∈ generated_tiers`; parallel via single-message multi-tool-call when `len(generated_tiers) > 1`.

4. **For `source-evidence` mode**: do NOT spawn Explore. Pass `source_manifest_json` directly to html-renderer template; it will resolve concept→source-section grounding inline.

5. **Render HTML**: `Read` `${CLAUDE_PLUGIN_ROOT}/skills/three-views/templates/html-renderer.md`. Substitute placeholders:
   - `{tier_md_content}` — the just-written tier markdown
   - `{repo_path}` — cwd absolute path
   - `{grounding_mode}` — from step 5A.1
   - `{concept_to_code_map_json}` — Explore subagent output (or `[]` in source-evidence)
   - `{source_manifest_json}` — from Step 2
   - `{topic_name}` / `{view}` / `{output_path}`

   Execute renderer prompt body. Output must be single self-contained HTML (offline-viewable; no external CDN). For grounding failures, **use `<missing-evidence concept="<name>"/>` tag — do NOT fabricate file paths.**

6. `Write` to `<output_dir>/[LEARNING]_<topic>_<view>.html`. Update corresponding INDEX row (if default path).

#### Step 5B — NLM artifact generation (if any NLM cell selected in Step 4)

**Build the adaptive working set** from Step 4 outputs + Step 3 `generated_tiers`:

```text
selected_nlm_artifacts = []
for view in generated_tiers:
  for artifact_type in selected_view_cycled_types:   # ⊆ {audio, video, slide_deck}
    selected_nlm_artifacts.append((artifact_type, view))
if mind_map_selected:
  selected_nlm_artifacts.append(("mind_map", None))  # view=None, view-agnostic

N = len(selected_nlm_artifacts)
# = len(generated_tiers) × len(selected_view_cycled_types) + (1 if mind_map_selected else 0)
```

If `N == 0` (Step 4 only checked HTML, no NLM cells) → skip Step 5B entirely.

**Workflow:**

1. **Auth gate** (per nlm-studio dogfood finding #1):
   - `refresh_auth` → `server_info` (local-only checks; `success` expected)
   - `notebook_list` (no args) — **真 auth gate**. Failure → abort + instruct `! nlm login`.

2. **Re-run guard** (per nlm-studio dogfood + v3.1.0 source-corpus equivalence):
   - Compute canonical notebook name: `learn-kit:<topic>`
   - `notebook_get` to check existence
   - **Compute `source_corpus_key`** for the current run: stable hash (SHA-256 hex) of canonical-JSON `{topic, sorted(generated_tiers), sorted([s.content_sha256 for s in source_manifest])}`.
   - **If existing notebook found**: derive `existing_source_corpus_key` from `notebook_get` source list (re-hash using the same algorithm against the uploaded sources' metadata; if NLM server doesn't expose per-source content_sha256, fall back to `(topic, len(sources))` tuple comparison).
   - **Mismatch warning gate**: if `existing_source_corpus_key != source_corpus_key` (e.g. existing notebook has 3 sources but current run has 1 tier), emit a **warning banner**:
     > ⚠️ Existing notebook `learn-kit:<topic>` has source corpus `{tiers: [foundation, structural, challenge], count: 3}` but current run has `{tiers: [foundation], count: 1}`. Reusing the existing notebook would produce artifacts grounded in a SUPERSET of what you selected — likely contaminating partial-output intent. Recommended: **New timestamped notebook**.
   - AskUserQuestion 4 选 1 (the default-recommended option depends on the mismatch banner):
     - **Regenerate missing**: reuse notebook + sources; skip `(artifact_type, view)` pairs already present (via `studio_status` lookup). **Definition of "missing"**: relative to CURRENT `selected_nlm_artifacts`. If a previously-generated `(audio, structural)` pair exists but `structural ∉ generated_tiers`, it is NOT regenerated (out of scope) but surfaces in recap as `previously-generated-out-of-current-subset`. Best for resuming partial run when corpus matches.
     - **Replace sources + new notebook**: `notebook_create` with timestamp suffix (`learn-kit:<topic>-<ISO8601-compact>`); old notebook untouched for history. **Default-recommended when source_corpus_key mismatches.**
     - **New timestamped notebook**: same as above but reason 为 "保留 A/B 对比"
     - **Abort**

3. **Notebook setup** (if no existing or "new" chosen):
   - `notebook_create(title="learn-kit:<topic>" [+ optional timestamp])`
   - `source_add` × `len(generated_tiers)` (only the tiers actually generated in Step 3; parallel allowed); `wait=True`
   - **Source validation** (per nlm-studio dogfood finding #4): `notebook_get` to verify all `len(generated_tiers)` sources actually uploaded (source_add error responses are unreliable). Retry-once per missing; if still missing, surface in recap and degrade gracefully.

4. **Quota right-sizing gate** (per nlm-studio dogfood; MANDATORY because no API for prior day usage):
   - Compose summary text (adaptive `N`):
     > About to generate **N artifacts** on notebook `learn-kit:<topic>`:
     > - `len(selected_view_cycled_types)` × `len(generated_tiers)` = V view-cycled (types: `<selected_view_cycled_types>`; views: `<generated_tiers>`)
     > - 1 shared mind_map (if `mind_map_selected`)
     >
     > Estimated ETA: ~30-60s per studio_create × N (mostly NLM-side async). Full default batch (3 tiers × 3 types + mind_map = 10) ≈ 5-12 min. Minimal selection (1 tier × 1 type) ≈ 1-2 min.
     >
     > ⚠️ This skill cannot detect prior same-day Studio usage. Reduce subset below if you've generated other artifacts today.
   - AskUserQuestion (4 选 1 OR 3 选 1 — see degeneracy rules below):
     - **Confirm all N** — proceed full batch
     - **Reduce subset** — multiSelect cells from `selected_nlm_artifacts` to drop (e.g., uncheck `video_foundation`, `slide_deck_challenge`); persist refined `selected_nlm_artifacts`
     - **Pick single tier** — limit `generated_tiers` to ONE tier (chosen from current `generated_tiers`); rebuild `selected_nlm_artifacts` with that single tier × `selected_view_cycled_types`; mind_map stays if selected. **Hidden** when `len(generated_tiers) == 1` (degenerate — no choice) OR `selected_view_cycled_types == {}` (mind_map-only run; tier picking is moot)
     - **Abort**

5. **Artifact generation loop**:
   - **Pre-loop idempotency lookup**: `studio_status(notebook_id)` → set of existing `(artifact_type, view)` pairs (mind_map keyed by `artifact_type` only). For pairs in this set ∩ `selected_nlm_artifacts` → skip in loop, record as `previously-generated`. For pairs in this set ∖ `selected_nlm_artifacts` (e.g. previously-generated `(audio, structural)` but `structural ∉ generated_tiers` this run) → record as `previously-generated-out-of-current-subset` for transparency.
   - For each artifact in `selected_nlm_artifacts` (sequential to respect per-step auth refresh):
     - **`refresh_auth`** before each studio_create (token short-lived per dogfood finding #3)
     - **Build focus_prompt** via composition contract (see "focus_prompt composition" section below)
     - **Call `studio_create(notebook_id, artifact_type, focus_prompt, confirm=True, ...)`**:
       - audio: `audio_format="deep_dive"`
       - video: `video_format="explainer"`
       - slide_deck: `slide_format="detailed_deck"`
       - mind_map: synchronous (response includes generated JSON directly)
     - **Bounded polling** (for async artifacts: audio/video/slide_deck): `studio_status` every 10s, max 12 attempts (~2 min). If still in_progress, record as `pending` + return URL; do NOT block indefinitely.
     - **Mid-run auth failure** (dogfood finding #3): refresh_auth + retry-once. Still failing → abort + recap so far.
     - **Other failures** (quota / format / 5xx): record `skipped-error: <reason>`, continue loop (do NOT auto-retry).

6. **Terminal recap**:
   ```
   ## NLM Artifacts for `<topic>`
   
   Notebook URL: <url>
   
   | # | Artifact Type | View | Status | URL / ID |
   |---|---------------|------|--------|----------|
   | 1 | audio | foundation | done | <url> |
   | ... | | | | |
   ```
   Status enum: `done` / `pending` / `previously-generated` / `previously-generated-out-of-current-subset` / `skipped-by-subset` / `skipped-error: <reason>` / `aborted`. The `View` column shows `—` for mind_map rows (view-agnostic).

### Terminal summary (always)

Print a concise summary:
- All generated paths (markdown + HTML grouped by tier; NLM URLs if any)
- Recommended reading order: foundation → structural → challenge
- For HTML on Windows: `start <abs-path>` to preview
- Reminder pointers (e.g., "re-run with different multi-select for refreshed outputs")

## focus_prompt composition contract (for Step 5B)

The composition uses 3 view-prefix templates (from view-{view}.md NLM_VIEW_PREFIX block) + 3 artifact-suffix templates (artifact-{audio,video,slide_deck}.md) + 1 mind_map-only template (artifact-mind_map.md) + interaction-overrides + language-directive.

### Composition for the 3 view-cycled types (audio / video / slide_deck)

```
focus_prompt = """
===== VIEW PURPOSE =====
{NLM_VIEW_PREFIX block extracted from templates/view-{view}.md, §1-§5}

===== MEDIUM CONSTRAINTS =====
{contents of templates/artifact-{type}.md, ~30 lines}

===== INTERACTION OVERRIDE =====
{the `inject:` value from templates/interaction-overrides.md if a row exists for this (view, type) pair; otherwise omit this section entirely}

===== LANGUAGE & TERMINOLOGY =====
{contents of templates/language-directive.md — appended verbatim to every artifact}

===== SOURCE TOPIC =====
Topic: {topic}
View: {view}
Source files: {len(generated_tiers)} .md learning documents (views: {generated_tiers list})
This is the {view}-tier {type}. It must be distinguishable from other view variants by the View-Purpose criteria above.
"""
```

### Composition for the shared mind_map (view-agnostic)

```
focus_prompt = """
===== MEDIUM CONSTRAINTS =====
{contents of templates/artifact-mind_map.md, ~30 lines}

===== LANGUAGE & TERMINOLOGY =====
{contents of templates/language-directive.md — same single block as view-cycled}

===== SOURCE TOPIC =====
Topic: {topic}
This mind_map is the structural skeleton across the selected source corpus. View-agnostic (nlm-studio v1.0.0 dogfood finding #5: NLM mind_map output is structural-hierarchy regardless of prompting). One mind_map per topic.
Sources: {len(generated_tiers)} .md learning documents covering {generated_tiers list}.
"""
```

## Template integrity checks (failsafe lint)

Before composing each view-cycled artifact's focus_prompt (Step 5B) AND before Step 3 markdown generation, verify the loaded `view-<view>.md` template against this checklist:

1. **MARKDOWN_GENERATION_PROMPT block**: exactly one `<!-- BEGIN:MARKDOWN_GENERATION_PROMPT -->` paired with one `<!-- END:MARKDOWN_GENERATION_PROMPT -->`. Body must be non-empty.
2. **NLM_VIEW_PREFIX block**: exactly one `<!-- BEGIN:NLM_VIEW_PREFIX -->` paired with one `<!-- END:NLM_VIEW_PREFIX -->`. Body must contain five `## §<N>` headers in order; the header line must **start with** these exact slug prefixes (parenthetical Chinese suffixes are allowed, e.g., `## §4 Anti-patterns（绝对不能做的）`):
   - `## §1 Pedagogical purpose`
   - `## §2 Audience profile`
   - `## §3 Style mandate`
   - `## §4 Anti-patterns`
   - `## §5 Success criteria`
3. Each §-section must have at least one non-blank body line.

**If any check fails**: abort the whole skill. Tell the user which template, which check failed, and where to fix it. This is the View-Purpose Preservation principle's last line of defense — partial run with broken template would silently produce off-tier output.

The failsafe runs **once per template load** (not once per session), so mid-run template edits are detected. Cost is negligible (re-reading ~400-LOC template is cheap).

The mind_map composition does NOT need the failsafe (no view-prefix loaded).

## Multi-select UX rules

- AskUserQuestion `header` ≤ 12 chars: "Source", "Tiers", "Output dir", "Conflict", "Extras", "Re-run", "Quota"
- Step 1.2 (Source mechanism), Step 1.3 (Tier selection), and Step 4 (Extras) use `multiSelect: true`
- Step 1.1, 1.4, 1.5, 5B.2 (re-run guard), 5B.4 (quota) use single-select
- Step 4: if all 5 options un-selected, skip Step 5 entirely (graceful exit with just `len(generated_tiers)` md)

## Templates layout

```
${CLAUDE_PLUGIN_ROOT}/skills/three-views/
├── SKILL.md                          # this file
└── templates/
    ├── view-foundation.md            # dual-purpose: MARKDOWN_GENERATION_PROMPT + NLM_VIEW_PREFIX
    ├── view-structural.md            # 同
    ├── view-challenge.md             # 同
    ├── html-renderer.md              # dual-mode grounding (repo-code / source-evidence / mixed)
    ├── artifact-audio.md             # NLM audio medium constraints (含 dual-lock Chinese narration v2.0.1+)
    ├── artifact-video.md             # NLM video medium constraints (含 dual-lock Chinese narration v2.0.1+)
    ├── artifact-slide_deck.md        # NLM slide_deck medium constraints
    ├── artifact-mind_map.md          # NLM mind_map medium constraints (view-agnostic only)
    ├── interaction-overrides.md      # YAML overrides for 3 of 9 view-cycled cells
    └── language-directive.md         # single Chinese-narration + English-term policy (appended to all artifacts)
```

Templates are read on-demand:
- Step 3 reads view-{}.md for each `view ∈ requested_tiers` (1-3 files; MARKDOWN_GENERATION_PROMPT blocks only)
- Step 5A reads html-renderer.md (once if HTML opted in)
- Step 5B reads view-{}.md (NLM_VIEW_PREFIX blocks) + artifact-*.md + interaction-overrides.md + language-directive.md per artifact

## Output convention

Default files land at:

```
<output_dir>/[LEARNING]_<topic>_<view>.md       # one per view in generated_tiers (always ≥1)
<output_dir>/[LEARNING]_<topic>_<view>.html     # one per view in generated_tiers (only if html_selected)
```

Pair the markdown and HTML by basename — same directory, same stem, only extension differs.

NLM artifacts produce **NO local files** — terminal-only URL recap. Notebook URL + per-artifact URLs are emitted; nothing is downloaded.

### Artifact count formulas (v3.1.0 adaptive)

| Artifact | Count |
|----------|-------|
| Markdown (.md) | `len(generated_tiers)` — always ≥1 by skill invariant |
| HTML (.html) | `len(generated_tiers)` if `html_selected`, else 0 |
| NLM view-cycled (audio/video/slide_deck) | `len(generated_tiers) × len(selected_view_cycled_types)` |
| NLM mind_map | `1` if `mind_map_selected`, else 0 (view-agnostic regardless of `len(generated_tiers)`) |
| **Total NLM** | `len(generated_tiers) × len(selected_view_cycled_types) + (1 if mind_map_selected)` |

Maximum NLM count when user accepts all defaults + checks all 5 Step 4 cells: `3 × 3 + 1 = 10`. Minimum non-zero: `1` (e.g. 1 tier + 1 NLM type, or just mind_map).

## Performance notes

- Step 3 generation cost scales with `source_corpus` size × `len(requested_tiers)`. For sources > 50 KB (combined), warn user that generation may take 30-60s per tier; offer split-summarize per Step 2 fallback.
- Step 5A spawns one Explore subagent per `view ∈ generated_tiers` (repo-code / mixed modes). Parallelize via single-message multi-tool-call when `len(generated_tiers) > 1`.
- Step 5B sequential per artifact (refresh_auth + studio_create pairs); wall-clock scales as ~30-60s × N (mostly NLM-side async). Default full batch (3 tiers + all 5 Step 4 cells = 10 artifacts) ≈ 5-12 min. Minimal selection (1 tier × 1 NLM type) ≈ 1-2 min.
- The skill is stateless: every invocation re-reads source, re-extracts concepts, re-grounds. No cache, no manifest persisted between runs. Cost is acceptable for typical "one topic per learning session" pattern.

## Migration from removed skills (v3.0.0 BREAKING)

learn-kit v3.0.0 consolidates 5 skills into this one. Old → new mapping:

| Removed skill | Migration |
|---------------|-----------|
| `/learn-kit:scaffold-learning` | Step 1.5 auto-creates `./learning/<topic>/` + INDEX skeleton (no METHODOLOGY/_archive; per ADR Option B) |
| `/learn-kit:locate <query>` | See `plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md` §"Locate Recipe" (Grep + Glob patterns + confidence scoring) |
| `/learn-kit:scan` | See same GUIDE §"Scan Recipe" (canonical doc enumeration + cross-reference + ranking) |
| `/learn-kit:generate-tier <topic>` | `/learn-kit:three-views <topic>` — same 3-view markdown generation, expanded with URL input + source_manifest + dual-mode HTML + (v3.1.0) tier multi-select for 1-3 subset |
| `/learn-kit:nlm-studio <topic>` | `/learn-kit:three-views <topic>` Step 4 → check any of `NLM audio` / `NLM video` / `NLM slide_deck` / `NLM mind_map`. Infographic permanently retired (4 artifact loss); per-type granularity added in v3.1.0. |

See [`docs/guide/[GUIDE]_Migration_From_v3_to_v4.md`](../../../docs/guide/[GUIDE]_Migration_From_v3_to_v4.md) §6 for full v5.0.x → v6.0.0 migration walkthrough.

## Non-goals

- This skill does not edit existing tier documents — only writes (with conflict policy in Step 1.4). For incremental edits, direct file edit.
- This skill does not validate generated markdown content — leave to user review or markdownlint. The frontmatter `generator:` field is the audit trail.
- This skill does not invoke external services beyond Claude tools + Explore subagent (Step 5A) + WebFetch (Step 2) + NotebookLM MCP (Step 5B if opted in). All opt-in steps gated by Step 4 AskUserQuestion.
- This skill does not generate cross-tier internal links (e.g., foundation HTML linking to structural HTML). Each artifact is self-contained.
- This skill does not maintain regeneration history. Each run overwrites or `.v2`-suffixes per Step 1.4 conflict policy.
- This skill does not provide NLM notebook lifecycle ops beyond create + source_add + studio_create + studio_status. For rename / delete / share / individual source manipulation, use notebooklm.google.com web UI. `source_delete` MCP tool intentionally omitted from `allowed-tools` — Step 5B re-run guard's "Replace sources" branch creates a new timestamped notebook rather than deleting (cleaner audit trail).
- This skill does not produce infographic NLM artifacts (permanently retired in marketplace v6.0.0 per [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](../../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) §3.2).
- This skill does not revise individual NLM slide_deck slides via `studio_revise` MCP tool, nor download artifacts locally via `download_artifact` — both intentionally omitted from `allowed-tools`. Terminal-only URL output is the contract; for granular slide editing or offline copies, use NotebookLM web UI.
- This skill does not handle mind_map `studio_status` response in a special branch — mind_map's pre-loop idempotency lookup uses `studio_status` keyed by `artifact_type` only (no view dim), trusting the MCP server to return mind_map records in the same shape as other artifacts. If a future MCP server schema change causes mind_map response shape to diverge, add a branch in Step 5B 5 to handle it.
