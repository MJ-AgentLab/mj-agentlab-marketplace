---
type: adr
scope: learn-kit
summary: learn-kit v0.2.0 引入 locate + scan 两个 discovery skill 的决策
owner: marketplace-maintainers
created: 2026-05-11
updated: 2026-05-15
state: active
version: v1.0
domain: plugin-internal
tags:
  - learn-kit
  - discovery
  - skill-design
related:
  - ../../CLAUDE.md
  - ../../README.md
  - ../../../../docs/rule/[STANDARD]_Documentation_Framework.md
---

# [ADR] learn-kit Discovery & Locate Skills

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-11 |
| **Decision drivers** | learn-kit v0.1.0 only ships `init` (scaffolding); cannot help users find what to learn in existing projects |
| **Scope** | `plugins/learn-kit/` v0.1.0 → v0.2.0; marketplace v3.0.0 → v3.1.0 |
| **Supersedes** | — |

> **Migration note (v4.3.0)**: This ADR was migrated from marketplace `docs/adr/` to `plugins/learn-kit/docs/adr/` per the Documentation Framework's plugin-internal-decision boundary. The decision content concerns learn-kit-internal skill design only; cross-plugin marketplace governance ADRs (e.g., `[ADR]_NotebookLM_Kit_Retirement`) remain at marketplace level.

## 1. Context

`learn-kit` v0.1.0 ships a single skill `init` that scaffolds a generic `learning/` subsystem (METHODOLOGY + INDEX + NLM_RECORD_TEMPLATE). The 8-stage pedagogical methodology in `METHODOLOGY.md` assumes the user has already chosen a source canonical document to interpret.

Three initial-use scenarios surface this gap:

| Scenario | Project state | User query | v0.1.0 behavior |
|----------|---------------|-----------|-----------------|
| A | Existing `learning/` with [LEARNING] docs | "I want to learn DLSRS" | No response; user must grep INDEX manually |
| B | `docs/` exists, no `learning/` | "I want to learn ADR naming convention" | Only `/init` scaffolds skeleton — does not point to source doc |
| C | Blank project | "Learn this RFC" | `/init` + worked example OK |

Scenarios A and B expose a missing capability: **discovery / locate**. The plugin cannot map a user-supplied concept name back to candidate source documents or already-interpreted [LEARNING] docs.

Full assessment captured in §1-§5 of this ADR (self-contained — marketplace does not maintain a `plans/` directory).

## 2. Decision

Add **two new skills** to `learn-kit`:

| Skill | Purpose |
|-------|---------|
| `locate` | Reverse-lookup: user supplies a concept name or partial doc name → returns ranked candidates (already-interpreted [LEARNING] first, then source canonical docs) |
| `scan` | Project-wide enumeration: list all candidate learnable docs (by tag), cross-reference with existing [LEARNING] docs, mark interpreted vs uninterpreted |

Both skills use a **pure heuristic** project recognition strategy — **no manifest, no persistent doc-map, no configuration**. Recognition signals:

1. `CLAUDE.md` (project root) — extract tag prefix conventions
2. `learning/INDEX.md` (if present) — extract existing topics
3. `docs/INDEX.md` (if present) — extract canonical doc structure
4. File-name tag globbing (`[STANDARD]_*` / `[SPEC]_*` / `[ADR]_*` etc.)

Confidence scoring:
- ≥ 0.95: CLAUDE.md declares tags + `learning/` exists
- 0.85–0.95: CLAUDE.md declares tags, no `learning/`
- 0.7–0.85: No CLAUDE.md, but ≥ 3 `[TAG]_*.md` files
- < 0.7: Warn user; return best-effort results

A new `METHODOLOGY.md §1.5 "Project Discovery"` section documents the locate/scan workflow as the recommended path **before** `§1 Source Intake`.

## 3. Consequences

### Positive
- External docs-heavy project scenario A: `/learn-kit:locate "DLSRS"` jumps directly to existing [LEARNING] doc
- External codebase-heavy project scenario B: `/learn-kit:scan` enumerates 13 [STANDARD] + 27 [ADR] candidates with "uninterpreted" markers
- Fresh projects: METHODOLOGY §1.5 + worked example chain provides end-to-end guidance
- Zero state introduced — each invocation re-scans (cost ≪ 3s for ~200-doc projects)

### Negative / Trade-offs
- Heuristic recognition fails on projects without tag prefix conventions → user must use explicit `--path` parameter
- No cache → repeated queries do redundant work (acceptable at current scale)
- Plugin skill surface area grows from 1 → 3 (init + locate + scan)

### Risks
- Performance: degrades on > 1000-doc projects → mitigated by `--path` filter
- Vocabulary drift: user query "5 维 HITL 规则" requires natural-language matching → mitigated by INDEX summary grep + frontmatter aliases grep
- Recognition false positive on multi-language projects → mitigated by confidence threshold warning

## 4. Alternatives Considered

| Option | Rejected because |
|--------|------------------|
| **P1 single skill** (locate only) | Scenario B (codebase-heavy project blank) still has no "what can I learn" entry; weak |
| **P3 full lifecycle** (locate + scan + scaffold-topic) | scaffold-topic value marginal — METHODOLOGY template already guides manual creation; surface area triples |
| **P4 manifest-driven** (LEARN_KIT_CONFIG.md required) | Violates zero-configuration goal for generic plugin; external adopters won't write manifests |
| **Persistent doc-map cache** (`.learn-kit/doc-map.json`) | State maintenance overhead > runtime cost; change-detection complexity |
| **Augment `init` skill** instead of adding skills | Conflates scaffolding (one-shot lifecycle) with query (per-invocation lifecycle); poor cohesion |

## 5. Implementation Plan

| Phase | Deliverable | Tool |
|-------|-------------|------|
| 1 | This ADR + skill directory scaffolds | manual + `/plugin-dev:create-plugin` for workflow framework |
| 2 | `skills/locate/SKILL.md` | `/skill-creator:skill-creator` + `/plugin-dev:skill-reviewer` |
| 3 | `skills/scan/SKILL.md` | `/skill-creator:skill-creator` + `/plugin-dev:skill-reviewer` |
| 4 | `METHODOLOGY.md §1.5` | manual Edit |
| 5 | Plugin compliance | `/plugin-dev:plugin-validator` + version bump 0.1.0 → 0.2.0 |
| 6 | Dogfood matrix | manual (external docs-heavy + codebase-heavy + fresh-project samples) |
| 7 | Marketplace release | manual (`marketplace.json` 3.0.0 → 3.1.0 + PR + tag) |

Detailed dogfood matrix in plan §8.1.

## 6. Acceptance Criteria

- [ ] Both `locate` and `scan` skills validated by `/plugin-dev:skill-reviewer`
- [ ] `/plugin-dev:plugin-validator` passes on learn-kit v0.2.0
- [ ] Dogfood: external docs-heavy project `/locate "DLSRS"` returns top-1 = `learning/hitl/[LEARNING]_HITL_Common_Rules_Interpretation.md` with confidence ≥ 0.9
- [ ] Dogfood: external codebase-heavy project `/scan` returns ≥ 13 [STANDARD] + ≥ 27 [ADR] candidates
- [ ] Dogfood: blank project `/locate "anything"` returns "low confidence" warning, not crash
- [ ] METHODOLOGY.md v2.0 → v2.1 (new §1.5)
- [ ] marketplace.json v3.0.0 → v3.1.0; learn-kit v0.1.0 → v0.2.0
- [ ] PR merged + tag v3.1.0 created

## 7. References

> **Note (v2.0.0)**: skill 名 `init` 已在 marketplace v5.0.0 / learn-kit v2.0.0 改名为 `scaffold-learning`（详见 [`../../../../docs/adr/[ADR]_LearnKit_Init_Skill_Rename.md`](../../../../docs/adr/[ADR]_LearnKit_Init_Skill_Rename.md)）。本 ADR 撰写于 v0.2.0 当时使用 `init` 命名；下面路径已更新为当前真实位置。

- Existing skill: `plugins/learn-kit/skills/scaffold-learning/SKILL.md`
- Existing methodology: `plugins/learn-kit/skills/scaffold-learning/templates/METHODOLOGY.md`
- Worked example: `plugins/learn-kit/skills/scaffold-learning/references/rfc-2119-keywords-pedagogy.md`
- Marketplace structure: `docs/guide/[GUIDE]_Marketplace_Project_Overview.md`
- Version policy: `docs/guide/[GUIDE]_Version_Management.md`
- Release flow: `docs/runbook/[RUNBOOK]_Release_Operations.md`

## 8. Decision Log

- **2026-05-11**: Initial intake from user request "评估 learn-kit 插件初次使用场景" → 3-agent parallel explore → AskUserQuestion (3 decisions: P2 + heuristic + evaluation-then-implement) → plan written → user authorized implementation referencing the marketplace HITL STANDARD
