# Changelog

All notable changes to the learn-kit plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-05-11

### Added

- **`skills/locate/SKILL.md`** — `/learn-kit:locate <query>` reverse-lookup skill. Given a concept name, mnemonic, partial doc title, or section reference (e.g., "DLSRS", "5 维 HITL 规则", "§3.3 of the HITL prompt"), returns ranked candidates split into interpreted [LEARNING] docs (preferred tier) and source canonical docs (secondary tier), with confidence scores and a project-recognition profile. Tools: `Read`, `Glob`, `Grep` (read-only).
- **`skills/scan/SKILL.md`** — `/learn-kit:scan` enumeration skill. Lists all learnable canonical doc candidates in the project by tag prefix ([STANDARD] / [SPEC] / [ADR] / [GUIDE] / [RUNBOOK]), cross-references with interpreted [LEARNING] docs to mark interpreted vs uninterpreted, and ranks by citation frequency (PageRank-lite). Tools: `Read`, `Glob`, `Grep` (read-only).
- **`skills/init/templates/METHODOLOGY.md` §1.5 "Project Discovery"** — new section between §1 Source Intake and §2 Framework Induction. Documents the recommended scan → locate → 8-stage workflow for using learn-kit in existing projects with prior docs, with concrete scenarios (mj-system-like, mj-agent-like, blank-project). METHODOLOGY version: v0.1 → v0.2.

### Changed

- **`.claude-plugin/plugin.json`** — version 0.1.0 → 0.2.0; description amended to mention locate + scan skills.

### Design notes

- Both new skills use a **pure heuristic** project recognition strategy — no manifest, no persistent doc-map, no configuration. Recognition signals: CLAUDE.md tag declarations, learning/INDEX.md presence, docs/ tag-prefix file count. Confidence bands: ≥0.95 / 0.85–0.95 / 0.7–0.85 / <0.7-with-warning.
- Stateless by design: every invocation re-scans. Cost is acceptable for typical project sizes (<500 docs, 1–5s). Statelessness eliminates cache-invalidation complexity.
- Decision record: `docs/[ADR]_LearnKit_Discovery_Skills.md` in the marketplace repo.

### Released as part of

mj-agentlab-marketplace v3.1.0 (learn-kit discovery skills minor release).

## [0.1.0] - 2026-05-11

### Added

Initial release of learn-kit — a generic Claude Code plugin for converting enumerated rule lists into learnable knowledge artifacts.

**Plugin structure**:

- `.claude-plugin/plugin.json` (v0.1.0, MIT, MJ-AgentLab author)
- `skills/init/SKILL.md` — `/learn-kit:init` scaffold command (`disable-model-invocation: true`)
- `skills/init/templates/METHODOLOGY.md` — full 8-stage pedagogical methodology (de-MJ-ified)
- `skills/init/templates/NLM_RECORD_TEMPLATE.md` — NLM artifact metadata schema
- `skills/init/templates/INDEX.md` — `learning/INDEX.md` template
- `skills/init/references/rfc-2119-keywords-pedagogy.md` — worked example: RFC 2119 five normative keywords (MUST / MUST NOT / SHOULD / SHOULD NOT / MAY)
- `README.md` — install + usage guide
- `LICENSE` — MIT

**Provenance**:

Derived from `mj-system` project's `learning/_meta/[LEARNING]_Rule_List_Interpretation_Authoring.md` v2.0 STANDARD-tier methodology. The upstream methodology underwent N=5 cross-domain validation (HITL collaboration / service architecture / SQL formatting / database design / database naming; rules ranging 8–63; dimensions 3–5; 5 independent metaphor worlds; all N-dim AND-gate geometry) before stabilizing. MJ-specific references and case studies have been stripped to enable generic adoption across any project; the original methodology core (§1–§8 eight stages, §9 subsystem meta-rules, §11 worked example pointer, §12 versioning) is preserved.

**Pairs with**: `notebooklm-kit` v2.4.1 (NotebookLM artifact generation; sibling plugin in the same marketplace).

**Released as part of**: mj-agentlab-marketplace v3.0.0 generic restructure.
