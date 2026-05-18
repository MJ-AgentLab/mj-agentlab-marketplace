# Glossary — MJ AgentLab Marketplace

> Marketplace terminology dictionary. Terms sorted alphabetically with 1-line definitions and anchor links to authoritative STANDARD / ADR / GUIDE / RUNBOOK. Append new terms in correct alphabetical position; do NOT add YAML frontmatter (per [Documentation Framework §1.1](docs/rule/[STANDARD]_Documentation_Framework.md#§11-root-level-named-special-files--individual-responsibilities-v16-new) editorial convention for root-level named special files).

## A

- **A6 Gate** — CI workflow check enforcing CLAUDE.md sync allowlist per Framework §4.3.1; blocking on PR diff with `[skip a6]` bypass token. See [`docs/rule/[STANDARD]_Documentation_Framework.md`](docs/rule/[STANDARD]_Documentation_Framework.md) §4.3.1.
- **ADR (Architecture Decision Record)** — `[ADR]_*.md` document recording a binding architectural decision; Michael Nygard 5-section format (Context / Decision / Consequences / Alternatives / References) + marketplace extensions. Lives in `docs/adr/`.
- **Allowlist (CLAUDE.md sync)** — 3-category trigger list in Framework §2.7; PRs touching listed paths must also update root `CLAUDE.md`. Categories: global standards / runtime info / directory entries.
- **Archive (doc lifecycle)** — `state: archived` transition; physical move from active subdir to `docs/archive/` (flat layout per §2.3.5) per RUNBOOK 4-phase ceremony.

## B

- **Bare Repo + Worktree Model** — Marketplace clone layout: shared `.bare/` git object store + N peer worktree directories, one per active branch. See [`CONTRIBUTING.md`](CONTRIBUTING.md) §Bare Repo + Worktree.

## C

- **CHANGELOG.md** — Root + per-plugin Keep-a-Changelog format release log. `[Unreleased]` section accumulates changes between releases; bumped to `[X.Y.Z]` at release time. Per §1.1 a named special file.
- **CLAUDE.md** — Root-level AI agent + maintainer context summary; Claude Code runtime loads on session start. Subject to §2.7 sync allowlist + §4.3.1 A6 CI gate.
- **Command vs Skill** — Skills are auto-discovered prompt assets in `skills/`; commands are legacy. Marketplace prefers SKILL.md (per `plugins/<name>/.claude-plugin/plugin.json` spec).
- **CONTRIBUTING.md** — Root-level contributor onboarding (branch / commit / version / PR flow). Per §1.1 a named special file; restored to repo root in v4.6.3 to enable GitHub "New Issue/PR" auto-prompt.

## D

- **Develop Pre-Bump** — Marketplace convention since v4.6.1: after each release + sync-main-to-develop, `develop` VERSION is bumped one patch ahead so `develop VERSION > main VERSION` always holds. See [`docs/adr/[ADR]_Develop_PreBump_Adoption.md`](docs/adr/[ADR]_Develop_PreBump_Adoption.md).
- **Documentation Framework** — `[STANDARD]_Documentation_Framework.md` governing tag prefixes / 8-field frontmatter / state machine / path stability / INDEX sync / flat archive layout. Currently v1.6.

## E

- **Editorial Convention (§1.1)** — Soft exclusion rule in Framework §1.1: certain root files (CONTRIBUTING.md / GLOSSARY.md) technically COULD carry 8-field frontmatter but DON'T, by editorial choice (GitHub UI integration / reading purity). Distinct from §1 hard external-contract exclusion.

## F

- **Frontmatter (8-field)** — Marketplace doc YAML header: type / scope / summary / owner / created / updated / state / version. Required on all `[TAG]_*` docs and `INDEX.md`. See [`docs/rule/[STANDARD]_Documentation_Framework.md`](docs/rule/[STANDARD]_Documentation_Framework.md) §2.2.

## G

- **GitHub Markdown** — Marketplace's adopted markdown style (ATX headings, GFM tables, native alerts). See [`docs/rule/[STANDARD]_GitHub_Markdown.md`](docs/rule/[STANDARD]_GitHub_Markdown.md).
- **GLOSSARY.md** — This file. Root-level terminology dictionary; per §1.1 a named special file with editorial-convention exclusion (no frontmatter).

## H

- **HITL (Human-In-The-Loop)** — AI agent execution model with mandatory pause-for-human-confirmation gates. See [`docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md).
- **Hook (Claude Code)** — Event-driven shell script triggered by lifecycle events (PreToolUse / PostToolUse / Stop / SessionStart / etc.). Configured in `.claude/settings.json`.

## I

- **INDEX.md** — `docs/INDEX.md` is the canonical documentation navigation hub; required 8-field frontmatter per Framework v1.5 §1 INDEX special clause.

## L

- **Living vs Frozen Reference** — Framework §2.3.4 judgment rule for cross-doc refs during archive: Living refs cite current state (upgrade to successor path); Frozen refs cite historical fact (preserve archive path).

## M

- **marketplace.json** — `.claude-plugin/marketplace.json` registry of plugins + metadata; part of the version triangle (metadata.version ↔ VERSION ↔ plugin.json).
- **MCP Server (Model Context Protocol)** — External tool/resource provider for Claude Code; plugins declare via `.mcp.json`. learn-kit uses `notebooklm-mcp` for NotebookLM integration.

## N

- **Named Special File** — One of 5 root-level files (README/CONTRIBUTING/CHANGELOG/GLOSSARY/CLAUDE.md) with fixed individual responsibility per Framework §1.1; exempt from `[TAG]_` prefix.

## P

- **Plugin (Claude Code)** — Self-contained `plugins/<name>/` directory with `.claude-plugin/plugin.json` + skills + optional MCP servers. Marketplace ships 1 plugin since v4.0.0: learn-kit.

## R

- **README.md** — Per §1.1 a named special file. Root variant: project entry point (badges / TL;DR / plugin listing / quick-start / links). Per-plugin variant: user guide.
- **RUNBOOK** — `[RUNBOOK]_*.md` operational procedure doc; carries `last-verified:` date (90-day staleness rule per Framework §4.1).

## S

- **Skill (Claude Code)** — Auto-discovered prompt asset in `skills/<name>/SKILL.md` with native frontmatter (`name` / `description` / `allowed-tools` / `disable-model-invocation`).
- **Stage (11-stage workflow)** — Marketplace AI engineering closed loop: Intake → Repo Scan → Plan → Design ADR → Author → Compliance → Dogfood → Self-review → Commit/Push/PR → Merge/Release → Post-merge Cleanup. See HITL STANDARD §1.

## T

- **TAG prefix** — One of 6 uppercase bracketed prefixes for tagged docs: `[STANDARD]` / `[ADR]` / `[GUIDE]` / `[RUNBOOK]` / `[SPEC]` / `[POSTMORTEM]`. See Framework §2.1.

## V

- **VERSION file** — Repo-root single-line semver authoritative source for marketplace level. Develop pre-bumped per v4.6.1 ADR.

## W

- **Worktree** — `git worktree` directory pointing to a single branch; marketplace uses 1 worktree per active branch under bare-repo layout.
