---
name: arch-diagram
description: |-
  Use when the user wants evidence-grounded Mermaid architecture or UML diagrams for a codebase or system, including context, container, component, code, sequence, state-machine, or deployment diagrams. Trigger on “画架构图”, “画 C4 图”, “生成时序图”, “状态机图”, “部署图”, “组件依赖图”, “diagram this codebase”, or “draw a sequence or deployment diagram”. Follow the fact-first flow: define scope, acquire L0–L3 source evidence, select high-value diagram types, draft Mermaid, then validate and repair. Every node and edge must trace to file and line evidence; never fabricate architecture. Output Mermaid source in text fences with Name and Slug metadata. Do not use for learning materials or generic prose explanations.
allowed-tools: "Read Glob Grep Bash Write AskUserQuestion"
---

# arch-diagram · Codebase facts → evidence-bound architecture diagrams (Mermaid)

The single diagram-kit skill (v0.1.0). Turns a codebase / system's **source facts** into
architecture diagrams across 7 types (C4 structural L1–L4 + behavior sequence/state +
physical deployment), grounded so every node and edge traces to `file:行号` evidence.

## Slash invocation

Auto-discovered by Claude Code's plugin loader; no `commands/` file needed. Invoke via:

```
/diagram-kit:arch-diagram <target>
```

Natural-language triggers (frontmatter `description`) activate the same skill — e.g.
"画架构图" / "给这个项目画 C4 图" / "生成时序图" / "diagram this codebase".

## Why this skill exists

7 diagram-type prompts each explain "how to draw" but leave "where do the facts come from"
implicit. This skill makes diagramming **fact-first and domain-agnostic**: a fixed
L0→L3 acquisition ladder turns "switch domain" into a mechanical "fill the profile + run
the ladder" action, and a bundled linter machine-checks the output. The result is an
**auditable** diagram — not a plausible-looking sketch.

## When to invoke

**Do invoke** for queries shaped like:

- "画架构图 / 给这个项目画 C4 图 / 把系统架构画出来"
- "生成 <context|container|component|sequence|state-machine|deployment|code> 图"
- "diagram this codebase" / "draw a sequence/deployment/component diagram for `<X>`"

**Do not invoke** — route elsewhere:

- 生成分层学习文档 / 学习 HTML / NotebookLM 多媒体 → `/learn-kit:three-views`
- 一段式术语速记卡（30 秒读懂一个词）→ `/learn-kit:glossary`
- 概念深讲（六节深入理解一个概念）→ `/learn-kit:concept`
- 非架构图表（Gantt / pie / ER 数据建模 / git graph）→ direct Mermaid, no skill

## Variables this skill listens for

Extract from the user's prompt before asking:

- **`target`** — what to diagram: cwd / a subdirectory / a described system. Default cwd.
- **`domain_hint`** (optional) — user names a domain ("这是个 docker 项目" / "python 包") →
  pre-select the Step 1 domain (still confirm).
- **`type_hints`** (optional) — user names specific diagram types ("只要时序图" / "画 container
  + deployment") → pre-check those Step 3 cells (still confirm).
- **`output_dir`** (optional) — where to write `.md` files. Default `./diagrams/`.

## Execution flow

A 5-step workflow. Step 1 (scope) and Step 3 (pick diagrams) use `AskUserQuestion`; Step 2
may use it for L3 HITL gap-filling. Each step gates on the prior's output — do not skip ahead.

**The 铁律 (evidence-grounding invariant)**: every node and every edge that enters a diagram
MUST trace to L0–L2 evidence (`file:行号` / config block / declaration). What can't be found
in source goes to L3 HITL — never fabricated. This is the skill's core discipline.

### Step 1 — Scope

1. **Resolve `target`**: from args / prompt; default cwd. If a described (not-on-disk)
   system, note that L0–L2 will rely on user-provided facts (more L3).
2. **Domain auto-detect**: `Glob` for signature files and suggest a domain from
   `references/domain-acquisition.md §4` (four-domain source-map):
   - `docker-compose*.yml` / `*.Dockerfile` → **docker**
   - `pyproject.toml` / `main.py` / `src/**/__init__.py` → **python**
   - `sql/**/V*.sql` / `R*.sql` / `cron.schedule(` → **postgreSQL**
   - `.claude/skills/**/SKILL.md` / `.mcp.json` → **claude-code-plugin**
   - none / mixed → ask the user to describe the domain (new domains add a §4 row mentally).
   `AskUserQuestion` to confirm the detected domain (or pick "other / describe").
3. **Output location**: default `./diagrams/`; user may override. If absolute or escapes
   cwd, `AskUserQuestion` second-confirm (path-safety).

### Step 2 — Acquire facts (L0 → L3)

1. **Load the methodology base + bridge** (progressive disclosure — read each once):
   - `Read references/architecture-methodology.md` — "绘图前必读": 4+1 视图 / C4 缩放轴 /
     §4.1 Mermaid 顶层语法 / §五 边语义（§5.0 跨图符号警示 必读）.
   - `Read references/domain-acquisition.md` — bridge + §2 六类领域画像 + §3 L0–L3 阶梯定义
     + §6 命名唯一事实源.
2. **L0 — 声明式清单扫描**: `Glob` + `Grep` the domain's source-of-truth declaration files
   (per §4 source-map for the confirmed domain) → enumerate entities. **Record `file:行号`
   evidence for each.**
3. **L1 — 结构/关系推断**: from directory layers, imports, `depends_on`, references → infer
   edges + layering (cite the reference point `file:行号`).
4. **L2 — 命名约定自动归类**: use prefixes / keywords / directory families to mechanically
   assign roles → shapes (per the domain's classification lever, §2 类别③).
5. **L3 — HITL 补缺**: ONLY for what L0–L2 cannot yield (sync vs async, reachability,
   "why designed this way"). `AskUserQuestion` with concrete options. Do NOT ask what the
   source already answers.

Keep a running **entity → `file:行号`** evidence table; you will attach it to the recap and
must be able to defend every diagram element against it.

### Step 3 — Pick diagrams (multiSelect)

`Read references/domain-acquisition.md §5.1` (全局适用性矩阵: 项目类型 × 7 图, ★ 密度 + ✗
pre-check). Present high-value (★★★ / ★★) vs low-value (★) vs not-applicable (✗) types for
the confirmed project type, then `AskUserQuestion(multiSelect: true)` for the user to pick a
subset. Honor `type_hints` as pre-checks. ✗ types map to each prompt's pre-check HITL (e.g.
Container/Deployment for a library/CLI → suggest Component instead).

Persist `selected_types ⊆ {context, container, component, sequence, state-machine, deployment, code}`.

### Step 4 — Draft (per selected type)

For each `type ∈ selected_types`:

1. `Read references/<type>-diagram.md` — **only the selected types' prompts** (progressive
   disclosure; never bulk-read all 7).
2. Apply: the L0–L3 facts (Step 2 evidence table) + `architecture-methodology §5.0 跨图符号
   警示 / §五 各图边语义 / §4.1 Mermaid 顶层语法` + `domain-acquisition §6 命名` (write
   `%% Name:` / `%% Slug:` two-line comment 紧跟类型声明行).
3. Emit Mermaid inside a ` ```text ` fence (see "Output format" below — NOT ` ```mermaid `).
4. `Write` to `<output_dir>/<slug>.md` (slug from §6, e.g. `struct-l1-context.md`,
   `dyn-sequence-user-login.md`). **One diagram per file** (one `%% Slug` per `.md`) so
   validator output stays 1:1 with files.

Run each diagram's own **自检清单** (from its `<type>-diagram.md`) before moving on.

### Step 5 — Validate → fix → repeat

1. **Run the bundled linter** on the written file(s) — see "Validator usage" below.
2. **Parse output**: `FAIL` (hard) vs `warn` (heuristic, human-confirm).
3. **Fix every FAIL → re-run** until exit 0 (no FAIL). Common FAIL: NAME-01 (missing
   `%% Name`/`%% Slug`), NAME-02 (bad slug prefix), TXT-01 (missing dual-label), CLS-03
   (orphan node), LEG-01 (team line-style without legend), MM-01 (`graph` → `flowchart`).
4. **List `warn`s** for the user to confirm (don't auto-fix; they're heuristic).
5. **code 图 (classDiagram) caveat**: the linter only applies the **naming gate** (NAME-01/02)
   to classDiagram — structure (relation-symbol pairing, class count, interface-impl
   direction) is **not** machine-linted yet. Explicitly tell the user: "该类图退回
   `references/code-diagram.md` 自检清单人工把关" (per ADR §2.3; 完整 classDiagram 结构 lint
   是 0.x → 1.0.0 演进项).
6. **Terminal recap**: list written files + slug + unresolved warns + the entity→`file:行号`
   evidence table (audit trail).

## Output format convention (default: `text` fences)

Every generated Mermaid diagram's code fence uses ` ```text ` — **NOT** ` ```mermaid `. This
makes diagrams display as **source code** (showing `%% Name` / `%% Slug` metadata, team
line-style conventions, and the legend) in GitHub / Obsidian / VS Code rather than
auto-rendering. Rationale:

- The diagram source is itself the evidence-bound deliverable; rendering hides the `%%`
  metadata and frequently fails on Chinese labels / complex `subgraph`s.
- The bundled validator's `extract_blocks` scans `text` fences (`lang in ('text','mermaid','')`),
  so `text` output has zero machine-check friction.

If a user explicitly wants a rendered diagram, they can change a specific fence to `mermaid`
themselves — but `text` is the default this skill writes.

## Validator usage (Step 5)

Bundled stdlib linter (pure Python 3.7+, no pip):
`skills/arch-diagram/scripts/validate_diagram.py` (resolve via `${CLAUDE_PLUGIN_ROOT}`).

**Invocation** (exit 0 = no FAIL / 1 = FAIL / 2 = usage):

```
<python> "${CLAUDE_PLUGIN_ROOT}/skills/arch-diagram/scripts/validate_diagram.py" <file.md>
```

**Interpreter detection** (Windows-aware): try in order `python` → `python3` → `py -3`;
use the first that responds to `--version`. Paths with spaces / backslashes **must** be
double-quoted.

**Graceful degradation**: if NO Python interpreter is found, do **NOT** hard-fail. Produce
the diagrams, print `"validator skipped (no Python 3.7+ found)"`, and fall back to each
diagram's `自检清单` for manual review. The diagrams are still valid deliverables; the
linter is an accelerator, not a gate.

The linter validates **generated diagrams** (real slugs). Do not point it at the bundled
`references/*.md` prompt skeletons — those carry `<用例>` / `<簇>` placeholders that are not
valid kebab slugs (they become valid only after the skill instantiates them).

## References layout (progressive disclosure)

```
${CLAUDE_PLUGIN_ROOT}/skills/arch-diagram/
├── SKILL.md                          # this file
├── references/                       # 9 files, one level deep, load on demand
│   ├── architecture-methodology.md   # 绘图前必读: 4+1 / C4 / §4.1 Mermaid 语法 / §5 边语义
│   ├── domain-acquisition.md         # bridge + §2 画像 + §3 L0–L3 阶梯 + §5.1 矩阵 + §6 命名 SSOT
│   ├── context-diagram.md            # 〔结构·L1〕系统上下文图  (struct-l1-context)
│   ├── container-diagram.md          # 〔结构·L2〕容器图        (struct-l2-container)
│   ├── component-diagram.md          # 〔结构·L3〕组件依赖图    (struct-l3-component)
│   ├── code-diagram.md               # 〔结构·L4〕代码图        (struct-l4-code-<簇>)
│   ├── sequence-diagram.md           # 〔行为〕时序图          (dyn-sequence-<用例>)
│   ├── state-machine-diagram.md      # 〔行为〕状态机图        (dyn-state-<owner>)
│   └── deployment-diagram.md         # 〔物理〕部署图          (phys-deployment-<env>)
└── scripts/
    └── validate_diagram.py           # 通用 Mermaid linter (stdlib; 泛化自 PG 版)
```

Load order:
- Step 2 reads `architecture-methodology.md` + `domain-acquisition.md` (once each).
- Step 3 reads `domain-acquisition.md §5.1` (already loaded).
- Step 4 reads `<type>-diagram.md` **only for the selected types** (1–7 files).

## Naming (slug) reference

Per `domain-acquisition.md §6` (唯一事实源; the table below is a draft-time **mirror** — if
they ever diverge, §6 is authoritative). Generated diagrams carry `%% Name:` / `%% Slug:`
紧跟类型声明行:

| 轴 | altitude | 规范图名 | slug 基 |
|----|----------|---------|---------|
| 结构 | L1 | 系统上下文图 | `struct-l1-context` |
| 结构 | L2 | 容器图 | `struct-l2-container` |
| 结构 | L3 | 组件依赖图 | `struct-l3-component` |
| 结构 | L4 | 代码图（罕见手绘）| `struct-l4-code-<簇>` |
| 行为 | — | 时序图 | `dyn-sequence-<用例>` |
| 行为 | — | 状态机图 | `dyn-state-<owner>` |
| 物理 | — | 部署图 | `phys-deployment-<env>` |

只有结构缩放轴带 `L1–L4`；行为/物理正交轴无层级。禁不透明序列码（图1 / A2）.

## Non-goals

- Does **not** rasterize diagrams to PNG/SVG or build a multimedia learning artifact — it
  writes diagram **source** `.md` (default `text` fence; flip a fence to `mermaid` to render
  in-place). arch-diagram **owns architecture diagrams in all forms**; only *topic-corpus
  learning artifacts* (tiered docs / HTML study guide / NotebookLM audio·video built from a
  topic, not a diagram) defer to `/learn-kit:three-views`.
- Does **not** fabricate any node/edge — the 铁律 forbids it; unknowns go to L3 HITL.
- Does **not** lint classDiagram structure (only the naming gate); see Step 5 caveat.
- Does **not** require an MCP server or network — purely local Read/Glob/Grep/Bash/Write.
- Does **not** edit existing diagram files in place — it writes new ones (overwrite is the
  user's call when re-running on the same `output_dir`).
- Does **not** auto-generate code-level L4 class diagrams for a whole module — code-diagram
  pre-check steers that to IDE/`pyreverse` auto-generation or the Component layer.
