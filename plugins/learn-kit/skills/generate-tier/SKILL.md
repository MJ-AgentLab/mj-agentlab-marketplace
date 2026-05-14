---
name: generate-tier
description: Use this skill whenever the user wants AI to GENERATE one or more reading-tier learning documents (foundation 零基础版 / structural 结构版 / challenge 挑战版) for a topic, driven by a user question + uploaded source documents. Trigger examples include "为 HITL 主题生成零基础版学习文档"、"基于 [STANDARD]_X 出三版学习材料"、"generate foundation+challenge tier docs for service-architecture"、"学习材料生成"、"出零基础/结构/挑战版"、"我想做一份 X 主题的学习文档"、"generate learning document for topic Y"、"生成学习 HTML"、"render the learning HTML"、"make me an interactive learning page". The skill multi-selects which tiers to generate (1-3 of foundation/structural/challenge), reads source material via 4 input mechanisms (project file paths / scan-locate discovery / pasted text / directory scan, all combinable), then writes `learning/<topic>/[LEARNING]_<topic>_<view>.md`, then optionally renders matching `.html` files in the same directory using an Explore subagent for concept→code grounding (file:line+snippet). For finding existing docs by name, route to `/learn-kit:locate`. For browsing all learnable docs in a project, route to `/learn-kit:scan`. For initial folder scaffolding, route to `/learn-kit:init`. Invoke proactively when the user expresses any intent to AI-generate a learning artifact, even if they don't say "generate-tier" or "三档" explicitly.
allowed-tools: [Read, Write, Glob, Grep, AskUserQuestion, Agent]
---

# Generate Tier Skill

AI-driven generator of three reading-tier learning documents (foundation / structural / challenge view) from a user question + uploaded source material, with optional matching interactive HTML render. The output is paired markdown (always) plus HTML (opt-in), landing under the project's `learning/<topic>/` folder using the `[LEARNING]_<topic>_<view>.{md,html}` naming convention.

## Why this skill exists

Two layers of pedagogical material are commonly needed when a learner first meets a topic:

1. **Three reading tiers per topic** — each addresses a different stage of comprehension:
   - **Foundation 零基础版**: few terms, many analogies; targets first-pass understanding
   - **Structural 结构版**: concept maps, prerequisite ladders, applicability boundaries; targets system-building
   - **Challenge 挑战版**: counter-examples, failure-case diagnosis, transfer problems; targets active mastery

   Together they form a learning curve. Authoring them by hand for every topic is slow, so this skill drives an AI-templated generation flow with quality constraints baked in.

2. **Interactive HTML companion** — markdown is good for reading and grepping, but a static interactive HTML page (SVG diagrams, syntax-highlighted code, tabbed comparison, "copy as prompt" buttons, dark/light theme) compresses 30 minutes of deep digestion into a single self-contained file. Critical demand: **every concept must hang on a real repository code reference** (file path + line numbers + snippet); no hand-waving. The skill achieves this by spawning an Explore subagent to ground concepts to code, then feeding the grounding map into the HTML renderer.

The skill is the **authoring counterpart** to the discovery skills (`/learn-kit:locate`, `/learn-kit:scan`) and the scaffolding skill (`/learn-kit:init`) — those find and prepare; this one creates.

## When to invoke

**Do invoke** for queries shaped like:

- "为 `<topic>` 主题生成零基础版/结构版/挑战版学习文档"
- "Generate foundation/structural/challenge tier docs for `<topic>`"
- "基于 `<source-doc>` 出三版学习材料"
- "我想做一份 `<topic>` 的学习文档" / "学习材料生成"
- "Make me a learning artifact for `<topic>` covering all three reading tiers"
- "为这个文档生成 HTML 学习页面" / "render learning HTML for `<X>`"
- "Make an interactive learning page about `<X>`"

**Do not invoke** — be careful with these near-misses:

- "Where is `<concept>` documented?" → use `/learn-kit:locate` (reverse-lookup, not authoring)
- "What can I learn in this project?" → use `/learn-kit:scan` (open-ended discovery)
- "Scaffold a learning subsystem here" → use `/learn-kit:init` (one-time folder creation)
- "Edit the existing foundation doc to fix typo X" → direct file edit, not regeneration
- "Help me understand `<X>`" → general explanation, not document authoring

Concrete contrast pairs:

- "生成 HITL 主题的三档学习文档" → **invoke** (authoring intent)
- "解释一下 HITL" → **do not invoke** (explanation, not artifact creation)
- "为 service-architecture 出零基础+挑战版" → **invoke** (multi-tier authoring)
- "service-architecture 在哪个文档" → **do not invoke** (use locate)

## Variables this skill listens for in the user's prompt

The skill is invoked via natural-language prompt. Extract these variables before asking the user anything:

- **`topic`** (required) — the subject slug. From the user's most specific noun phrase. Heuristic: kebab-case the topic name (e.g., "HITL collaboration" → `hitl-collaboration`).
- **`user_question`** (required) — the specific question or learning intent. Quote it verbatim from the prompt; do not paraphrase, since it becomes a prompt-template variable that drives all 3 tier outputs.
- **`tiers_hint`** (optional) — if the user names specific tiers ("只要零基础版", "foundation+challenge only"), respect that and skip the tier-selection AskUserQuestion step.
- **`source_paths_hint`** (optional) — if the user passes file paths (`@file.md`, "用 docs/X.md 当源"), pre-load those and skip the source-mechanism AskUserQuestion step.
- **`html_hint`** (optional) — if the user explicitly says "也生成 HTML" or "skip HTML", honor that and skip the HTML offer step.

## Execution flow

The skill runs a 10-step workflow. Steps 2-4, step 7, and step 9 use `AskUserQuestion`; the rest are deterministic. Each step is gated on the prior step's output — do not skip ahead.

### Step 0 — Intake

Parse the user's invocation prompt for `topic`, `user_question`, and any optional hints (see Variables section above). If `topic` cannot be inferred, do not block — defer it to step 4.

### Step 1 — Pre-flight

Check that `<project-root>/learning/INDEX.md` exists.

- **Exists**: proceed.
- **Missing**: tell the user `learning/` subsystem is not initialized yet. Offer two options via `AskUserQuestion` (single-select):
  - "Run `/learn-kit:init` first, then re-invoke generate-tier" (recommended; full scaffold including METHODOLOGY)
  - "Minimal-init now (create only `learning/INDEX.md` root entry), skip METHODOLOGY scaffold; topic folder will be auto-created in step 5" (faster but loses methodology pointer)

### Step 2 — Source acquisition

Source material drives the entire generation. Use `AskUserQuestion` with `multiSelect: true` and 4 options (mix-and-match allowed):

| Option | What happens |
|--------|--------------|
| 项目内文件路径 / Project paths | Ask user to paste paths or @-references in next turn; `Read` each |
| 复用 scan/locate 发现 / Reuse scan-locate | Run scan or locate algorithm internally to surface candidates; ask user to confirm |
| 用户粘贴长文本 / Pasted text | Ask user to paste text in next turn; treat as in-memory source |
| 整目录扫描 / Directory scan | Ask user for a path; `Glob` `**/*.md` under it; warn if > 30 files |

Aggregate all collected source into an internal `source_corpus` (a list of {path-or-label, content, line-count}). Compute `uploaded_docs_summary` for prompt-template substitution: a 3-5 line summary listing the file paths + sizes (or "用户粘贴文本 N 字").

### Step 3 — Tier selection

Use `AskUserQuestion` with `multiSelect: true` and 3 options:

- ☐ foundation 零基础版 (Recommended — start here if unsure)
- ☐ structural 结构版
- ☐ challenge 挑战版

Default all three checked. If `tiers_hint` was extracted in step 0, skip this step and use that.

### Step 4 — Topic confirmation + conflict check

Use `AskUserQuestion` (single-select with free-text override) to confirm the `topic` slug. Default to the heuristic from step 0.

After confirmation, check whether any target file `learning/<topic>/[LEARNING]_<topic>_<view>.md` already exists for the selected tiers. If yes, ask via `AskUserQuestion` (single-select):

- Overwrite (recommended for re-generation)
- Append `.v2` suffix to new files (preserves history)
- Skip the conflicting tier(s)
- Abort

### Step 5 — Per-tier markdown generation

For each selected `view` in (foundation, structural, challenge):

1. `Read` the corresponding template at `${CLAUDE_PLUGIN_ROOT}/skills/generate-tier/templates/<view>.md`.
2. Substitute placeholders in the template body:
   - `{user_question}` → verbatim from step 0
   - `{topic_name}` → confirmed slug from step 4
   - `{uploaded_docs_summary}` → from step 2
3. Execute the substituted prompt against `source_corpus` — Claude reads the corpus and renders the markdown according to the template's prompt body.
4. Prepend a YAML frontmatter to the rendered markdown:

   ```yaml
   ---
   type: learning-tier
   topic: <topic>
   view: <foundation | structural | challenge>
   source_question: <user_question>
   source_docs: [<paths or "(pasted text)">]
   generated_at: <ISO8601 UTC>
   generator: learn-kit/generate-tier v1.0.0
   ---
   ```
5. `Write` to `learning/<topic>/[LEARNING]_<topic>_<view>.md` (auto-create the topic folder if missing).

### Step 6 — INDEX update

Open `learning/INDEX.md` and append (or update existing rows for re-generation) under the `## Tier Documents` section:

| Topic | View | Markdown | HTML | Last Generated |
|-------|------|----------|------|----------------|
| `<topic>` | `<view>` | `[LEARNING]_<topic>_<view>.md` | — (filled by step 8) | `<ISO8601 date>` |

If the section does not exist yet, create it. Use deterministic ordering: `(topic ASC, view canonical-order ASC)` where canonical view order is foundation < structural < challenge.

### Step 7 — HTML offer

Use `AskUserQuestion` (single-select):

- 是 / Yes (Recommended) — proceed to step 8 to render HTML for all tiers just generated
- 否 / No — skip step 8, jump to step 9 summary

If `html_hint` from step 0 already settled this, skip the question.

### Step 8 — HTML rendering (per tier)

For each tier generated in step 5, render a matching HTML file:

#### 8.1 Concept extraction

From the just-written tier markdown, extract a concept list:

- All H2 / H3 headings
- Frontmatter `aliases` field (if present)
- Any term explicitly tagged in the markdown as core terminology (look for table rows with a "术语" or "Term" column header)

Cap at 30 concepts per tier; if more, keep the first 30 in document order (the head sections are typically the load-bearing ones).

#### 8.2 Concept → code grounding via Explore subagent

Spawn an Explore subagent with `subagent_type: "Explore"` and this prompt template:

```
Background: rendering an interactive HTML learning doc for tier `<view>` of topic `<topic>` in repo at `<repo_path>`.
Need code grounding for these concepts:
  - <concept 1>
  - <concept 2>
  - ...

For each concept, find ONE most-representative code reference in the repo. Return a JSON array (≤200 lines) with this exact shape:
[
  {
    "concept": "<original concept text>",
    "file": "<absolute path or null>",
    "line_start": <int or null>,
    "line_end": <int or null>,
    "snippet": "<≤15 lines of code, exactly as in file>",
    "why": "<1 sentence: why this code embodies the concept>"
  },
  ...
]
Use breadth: medium. If a concept has no code embodiment, set file=null and explain in 'why'. Do NOT invent file paths.
```

Set the agent description to "Concept→code grounding for `<topic>/<view>`". One subagent per tier; if multiple tiers were selected they can be spawned in parallel (single message, multiple Agent tool calls).

#### 8.3 Render HTML

`Read` `${CLAUDE_PLUGIN_ROOT}/skills/generate-tier/templates/html-renderer.md`. Substitute placeholders:

- `{tier_md_content}` — the just-written tier markdown (full)
- `{repo_path}` — project root absolute path
- `{concept_to_code_map_json}` — the JSON returned by the subagent (compact form)
- `{topic_name}` — the slug
- `{view}` — foundation / structural / challenge
- `{output_path}` — `learning/<topic>/[LEARNING]_<topic>_<view>.html`

Execute the html-renderer prompt body. The renderer must produce a single self-contained HTML file: inline CSS + JS, no external CDN (per user's "offline-viewable" hard constraint). Include at minimum: SVG diagrams (no ASCII art), syntax-highlighted code blocks, tabbed multi-implementation comparison, `<details>` collapse blocks, "copy as prompt" buttons, dark/light theme toggle, floating ToC with scroll-spy.

#### 8.4 Write + INDEX update

`Write` to `learning/<topic>/[LEARNING]_<topic>_<view>.html`. Update the corresponding row in `learning/INDEX.md` `## Tier Documents` table — replace the `—` in the HTML column with the new HTML filename.

### Step 9 — (Optional) NLM multimedia generation

After step 8 completes, ask the user via `AskUserQuestion` (single-select) whether to push the just-generated three-tier corpus to NotebookLM as multimedia artifacts via the sibling skill `/learn-kit:nlm-studio`.

Question text:

> 三档 markdown + HTML 已生成。是否进一步推到 NotebookLM 出多媒体
> artifact (5 类 × 3 view = ≤15 个：audio + video + slide_deck +
> mind_map + infographic，全程在线浏览不下载)？需 NotebookLM 账号
> + `nlm login` 配置。

Options:

- **Yes, generate now** — invoke `/learn-kit:nlm-studio <topic>` in the same turn. Pass the confirmed `topic` slug. nlm-studio handles its own pre-flight, quota confirm gate, and recap.
- **Skip** — print a one-line reminder: "日后可手动 `/learn-kit:nlm-studio <topic>`." then continue to Step 10.
- **I'll think about it** — same as Skip.

**Hard rule:** Never auto-trigger nlm-studio without explicit user yes. The 15-artifact batch costs NLM Studio quota and ETA 7-15 min — it is opt-in, never opt-out. The default selection in the AskUserQuestion should be "Skip" (or unmarked) to prevent accidental confirmation.

If the user does not have `nlm login` configured, this Step 9 still asks the question — nlm-studio's own pre-flight (Step 1) handles the auth check and provides the `! nlm login` instruction. Do not preflight nlm auth from generate-tier itself; keep the responsibility boundary clean.

### Step 10 — Summary

Print a concise summary:

- All generated paths (markdown + html), grouped by tier
- Recommended reading order: foundation → structural → challenge
- For each HTML on Windows: `start <absolute-path>` to preview
- If Step 9 was Yes: also list the NLM notebook URL + 15-artifact recap printed by `/learn-kit:nlm-studio` (it returns to the terminal naturally; do not re-render).
- If Step 9 was Skip: a one-line reminder of how to invoke nlm-studio later.
- Pointers: "Re-run with different tier selection if you want a refreshed version" + "Use `/learn-kit:locate <topic>` next time you forget where this lives"

## Multi-select UX rules

`AskUserQuestion` calls in this skill follow these conventions:

- Always set `header` to ≤ 12 chars: "Source", "Tiers", "Topic", "Conflict", "HTML"
- Step 2 (Source) and Step 3 (Tiers) use `multiSelect: true`; Steps 1, 4, 7, 9 use single-select
- Step 8 does NOT ask which tier to render — it defaults to all tiers from step 5. Pair markdown and HTML as joint delivery artifacts of the same generation event so the user's mental model treats them as a single output unit.
- When a hint variable is extracted in step 0, skip the corresponding AskUserQuestion to avoid double-asking.

## Templates layout

```
${CLAUDE_PLUGIN_ROOT}/skills/generate-tier/
├── SKILL.md                   # this file
└── templates/
    ├── foundation.md          # 零基础版 prompt template (≈300 lines)
    ├── structural.md          # 结构版 prompt template (≈350 lines)
    ├── challenge.md           # 挑战版 prompt template (≈400 lines)
    └── html-renderer.md       # HTML renderer prompt template (≈150 lines)
```

Each template file follows a two-section structure:

1. **INSTRUCTIONS TO CLAUDE** (skill-internal, not part of the rendered output) — declares which placeholders to substitute and how to interpret them.
2. **PROMPT BODY** (executed verbatim after substitution) — drives the actual content generation.

Templates are read on-demand; do not eagerly load all four when only some tiers are selected.

## Output convention

Files always land at:

```
learning/<topic>/[LEARNING]_<topic>_<view>.md
learning/<topic>/[LEARNING]_<topic>_<view>.html   # if step 7=yes
```

Pair the markdown and HTML by basename — same directory, same stem, only the extension differs. Treat this as a hard convention so that:

- Tooling can find the HTML companion of any tier markdown by basename swap
- Humans can grep `[LEARNING]_<topic>_*` to find the whole tier set
- Locate / scan stay markdown-focused without HTML-special-casing logic

## Performance notes

- Step 5 generation cost scales with `source_corpus` size. For corpora > 50 KB, warn the user that generation may take 30-60 s per tier.
- Step 8 spawns one Explore subagent per tier — parallelize via single-message multi-tool-call when multiple tiers selected.
- The skill is stateless: every invocation re-reads source, re-extracts concepts, re-grounds. No cache, no manifest. Cost is acceptable for the typical usage pattern (a learner generating a topic once per learning session).

## Sibling skills

- `/learn-kit:init` — one-time scaffold of `learning/` folder. Required before generate-tier can write anything (or accept the skill's offer to minimal-init in step 1).
- `/learn-kit:locate <query>` — concept reverse-lookup across `learning/` (preferred) and `docs/` (fallback). Use after generate-tier when you forget which tier covers what.
- `/learn-kit:scan` — open-ended enumeration of learnable canonical docs. Use *before* generate-tier to identify candidate sources for a new topic.

## Non-goals

- This skill does not edit existing tier documents — only writes (with conflict policy from step 4). For incremental edits, the user should edit the file directly.
- This skill does not validate generated content — leave that to user review or markdownlint. The frontmatter `generator:` field is the sole audit trail.
- This skill does not invoke external services or LLMs beyond Claude's own tools and subagents at generation time (Steps 0-8). Step 9 only **offers** to invoke `/learn-kit:nlm-studio` (which does talk to NotebookLM); the user must opt in explicitly. If they decline, no external API is touched.
- This skill does not generate cross-tier internal links (e.g., foundation HTML linking to structural HTML). Each artifact is self-contained, by design.
- This skill does not maintain a regeneration history. Each run overwrites (or `.v2`-suffixes per step 4 conflict policy).
