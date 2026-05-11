# Changelog

All notable changes to the learn-kit plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
