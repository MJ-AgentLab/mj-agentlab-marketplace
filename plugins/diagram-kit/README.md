# diagram-kit

> Architecture / UML diagramming kit for Claude Code — turn a codebase's **source facts** into **evidence-bound Mermaid diagrams**, for any domain.

`diagram-kit` is a general-purpose Claude Code plugin. Its single skill `arch-diagram` draws
7 types of architecture diagram (the C4 structural ladder L1–L4 + behavior + physical),
**grounded in source evidence** — every node and edge traces back to a `file:行号` reference,
never invented.

It is functionally orthogonal to the marketplace's other plugin, `learn-kit` (which generates
*learning material*). diagram-kit generates *architecture diagrams*. See the marketplace
`[ADR]_Diagram_Kit_Addition` for the design and the "why a second plugin" reconciliation.

## Install

Both hosts are supported; full steps (marketplace registration + install levels) are in the
[root README install section](../../README.md#安装). The plugin's own add command:

```
# Claude Code
/plugin install diagram-kit@mj-agentlab-marketplace
# Codex
codex plugin add diagram-kit --marketplace mj-agentlab-marketplace
```

(Claude Code also accepts `--scope local` for a project-local install while developing.)

## Use

```
# Claude Code
/diagram-kit:arch-diagram <target>
# Codex
$diagram-kit:arch-diagram <target>
```

Codex registers plugin skills as `plugin:skill`, so the bare `$arch-diagram` never resolves.

Or just ask in natural language — the skill triggers on phrases like:

- 「画架构图」/「给这个项目画 C4 图」/「把系统架构画出来」
- 「生成时序图 / 状态机图 / 部署图 / 组件依赖图」
- "diagram this codebase" / "draw a sequence/deployment/component diagram for X"

No MCP server, no network, no API key — it only reads your local files and writes `.md`
diagram source.

## The 5-step flow

1. **Scope** — picks the target (cwd / a subdirectory / a described system), auto-detects the
   domain from signature files (`docker-compose.yml`, `pyproject.toml`, `sql/**/V*.sql`,
   `.claude/skills/**/SKILL.md`, …), and confirms with you.
2. **Acquire facts (L0 → L3)** — a fact-first ladder:
   - **L0 声明扫描** — `Glob`/`Grep` the domain's source-of-truth declarations → entities (with `file:行号`).
   - **L1 结构推断** — directory layers / imports / `depends_on` → edges + layering.
   - **L2 命名归类** — prefixes / keywords / directory families → roles → shapes.
   - **L3 HITL 补缺** — asks you ONLY what source can't answer (sync vs async, reachability, why).
3. **Pick diagrams** — shows the applicability matrix (project type × 7 diagrams, ★ density),
   you pick the high-value subset.
4. **Draft** — for each picked type, applies the facts + edge semantics + naming rules and
   writes Mermaid into a ` ```text ` fence (shows source + metadata; doesn't auto-render).
5. **Validate → fix → repeat** — runs the bundled linter, fixes every hard FAIL, lists
   heuristic WARNs for you, and recaps with the evidence table.

**铁律 (the iron rule)**: every node and edge must trace to L0–L2 evidence. Unknowns go to L3
HITL — they are never fabricated.

## The 7 diagram types

| Axis | Altitude | Diagram | Mermaid | Slug base |
|------|----------|---------|---------|-----------|
| 结构 Structural | L1 | 系统上下文图 Context | `flowchart` | `struct-l1-context` |
| 结构 Structural | L2 | 容器图 Container | `flowchart` | `struct-l2-container` |
| 结构 Structural | L3 | 组件依赖图 Component | `flowchart` | `struct-l3-component` |
| 结构 Structural | L4 | 代码图 Code（rarely hand-drawn）| `classDiagram` | `struct-l4-code-<簇>` |
| 行为 Behavior | — | 时序图 Sequence | `sequenceDiagram` | `dyn-sequence-<用例>` |
| 行为 Behavior | — | 状态机图 State machine | `stateDiagram-v2` | `dyn-state-<owner>` |
| 物理 Physical | — | 部署图 Deployment | `flowchart` | `phys-deployment-<env>` |

Only the structural scaling axis carries `L1–L4`; the orthogonal behavior / physical axes
have no level. Naming is governed by `domain-acquisition.md §6` (the single source of truth).

## Domains it knows (extensible)

The bundled `domain-acquisition.md §4` source-map ships four worked domains; new domains add a
row mechanically:

| Domain | L0 declaration source | Classification lever |
|--------|----------------------|----------------------|
| **docker** | `docker-compose*.yml` services / `*.Dockerfile` | compose keys; `*-import`/`*-setup` → init container |
| **python** | `main.py` router reg / `src/**` tree / `pyproject.toml` | DDD layer dirs; `*Middleware` / `*Repository` |
| **postgreSQL** | `sql/**/V*.sql`·`R*.sql` DDL; `cron.schedule(...)` | table prefixes `ods_/dwd_/dws_/dim_` |
| **claude-code-plugin** | `.claude/skills/**/SKILL.md`; `.mcp.json` | skill naming families; MCP server type |

## The bundled validator

`skills/arch-diagram/scripts/validate_diagram.py` — a pure-stdlib (Python 3.7+, no pip)
Mermaid linter. It checks naming (NAME-01/02), orphan nodes (CLS-03), missing legends
(LEG-01), dual-labels (TXT-01), single-owner state machines (STATE-01), sequence pairing
(SEQ-04), and more.

```
python "skills/arch-diagram/scripts/validate_diagram.py" <your-diagram.md>
# exit 0 = no FAIL (may have WARNs) · 1 = FAIL · 2 = usage
```

- **Interpreter detection**: tries `python` → `python3` → `py -3` (Windows-aware).
- **Graceful degradation**: with no Python it does NOT block — diagrams are produced and you
  fall back to each diagram's built-in 自检清单 (self-check checklist).
- **Known gap (0.x → 1.0.0)**: `classDiagram` (code diagrams) get only the naming gate; full
  structural lint (relation pairing, class count, interface-impl direction) is a future item —
  fall back to `code-diagram.md`'s checklist for those.

Validate **generated** diagrams (real slugs), not the bundled prompt skeletons (they carry
`<用例>` / `<簇>` placeholders that aren't valid slugs until instantiated).

## Output convention

Generated diagrams use ` ```text ` fences (not ` ```mermaid `) so they display as source —
preserving the `%% Name` / `%% Slug` metadata, team line-style legend, and dual-labels — and
don't auto-render (which hides metadata and often breaks on Chinese / complex subgraphs).
Switch a fence to `mermaid` yourself if you want it rendered.

## License

MIT — see [LICENSE](./LICENSE).
