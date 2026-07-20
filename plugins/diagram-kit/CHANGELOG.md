# Changelog

All notable changes to the diagram-kit plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Codex native wrapper** — `.codex-plugin/plugin.json` + `skills/arch-diagram/agents/openai.yaml`, so the plugin installs and the skill discovers on Codex as well as Claude Code.

### Changed

- **`0.1.0 → 0.2.0`** (backward-compatible minor) — **host-neutral runtime**: `arch-diagram` resolves the bundled `scripts/validate_diagram.py` from the current SKILL.md locator (realpath-contained), not `${CLAUDE_PLUGIN_ROOT}`, passing the absolute script path + each `.md` as separate quoted arguments.
- **Dual-host invocation** — Claude `/diagram-kit:arch-diagram`, Codex `$diagram-kit:arch-diagram`; internal routing uses bare qualified skill names, not host-specific slashes.
- Interpreter probe order aligned to `python3 → python → py -3`.

### Fixed

- **`validate_diagram.py` UTF-8 output on non-UTF-8 locales** — the linter prints CJK (diagram names, rule messages, the `共扫描 N 张图` tally) and the scanned file path; on a Windows pipe/console whose active code page is not UTF-8 (e.g. `cp1252`), that raised `UnicodeEncodeError` and aborted the lint. The CLI entry point now reconfigures `stdout`/`stderr` to UTF-8, so linting a diagram whose path or content contains non-ASCII characters works on any platform locale.

## [0.1.0] - 2026-06-05

### Added

- **Initial release of `diagram-kit`** — architecture / UML diagramming plugin, functionally orthogonal to `learn-kit`. Single skill `arch-diagram`.
- **`arch-diagram` skill** (`/diagram-kit:arch-diagram <target>`) — turns a codebase / system's source facts into evidence-bound Mermaid diagrams across **7 types**: context / container / component / code (C4 structural L1–L4) + sequence / state-machine (behavior) + deployment (physical), for any domain (docker / python / postgreSQL / claude-code-plugin / ...). 5-step fact-first flow: scope + domain auto-detect → acquire facts via the L0–L3 ladder (L0 声明扫描 → L1 结构推断 → L2 命名归类 → L3 HITL 补缺) → pick high-value types via the §5.1 applicability matrix → draft Mermaid (§5 edge semantics + §6 naming) → validate-fix-repeat. **铁律**: every node/edge traces to `file:行号` evidence, never fabricated. Frontmatter `name` + `description` + `allowed-tools` (Read / Glob / Grep / Bash / Write / AskUserQuestion); no MCP / no network.
- **9-file `references/` bundle** (progressive disclosure, one level deep) — `architecture-methodology.md` (4+1 视图 / C4 / §4.1 Mermaid 语法 / §5 边语义) + `domain-acquisition.md` (bridge + §2 六类画像 + §3 L0–L3 阶梯 + §5.1 全局适用性矩阵 + §6 命名唯一事实源) + 7 per-type drawing prompts. Domain-agnostic; introduced verbatim from a self-contained vault corpus.
- **`scripts/validate_diagram.py`** — pure-stdlib (Python 3.7+, no pip) Mermaid linter. Generalized from a PostgreSQL-specific version: removed the PG-only role↔shape map (ROLE-03), widened the slug regex to the general baseline (`struct-l[1234] | dyn | phys`, per `domain-acquisition §6`), and added the `classDiagram` naming gate. Validates generated diagrams (NAME-01/02 / MM-01 / CLS-01·02·03 / LEG-01 / TXT-01·03 / STATE-01·02 / SEQ-02·03·04). Interpreter detection (`python` → `python3` → `py -3`) + graceful degradation when no Python.

### Notes

- **Output convention**: generated diagrams use ` ```text ` fences (NOT ` ```mermaid `) so they display as source — preserving `%% Name` / `%% Slug` metadata, team line-style legend, and dual-labels — rather than auto-rendering.
- **Initial version `0.1.0`** (not `1.0.0`): signals "functionality not yet settled" — the classDiagram structural lint gap (only the naming gate runs on code diagrams; full structure lint is a `0.x → 1.0.0` item) + marketplace-domain dogfood pending + awaiting field evaluation. Mirrors learn-kit's own `0.1.0` origin.
- **Validator dual-source fork**: this generalized validator now evolves independently from the PostgreSQL handbook's `validate_diagram.py`; PG-specific tightenings will not flow back.
- Design, the "why a second plugin" reconciliation (marketplace's first 1 → 2 plugin count), and the validator-generalization decisions are recorded in marketplace-layer [`docs/adr/[ADR]_Diagram_Kit_Addition.md`](../../docs/adr/[ADR]_Diagram_Kit_Addition.md).
