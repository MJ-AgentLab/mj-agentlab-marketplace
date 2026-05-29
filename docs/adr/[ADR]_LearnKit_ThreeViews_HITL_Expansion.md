---
type: adr
scope: marketplace
summary: learn-kit 3.1.0 — tier multi-select + 5-cell artifact-type multi-select HITL expansion
owner: marketplace-maintainers
created: 2026-05-29
updated: 2026-05-29
state: active
version: v1.0
domain: plugin-internal
related:
  - ./[ADR]_LearnKit_Consolidation_To_Single_Skill.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../rule/[STANDARD]_Documentation_Framework.md
---

# [ADR] LearnKit `three-views` HITL Expansion (v3.1.0)

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-05-29 |
| Author | marketplace-maintainers |
| Scope | learn-kit |
| Reversibility | reversible (collapsible back to v3.0.0 3-cell + always-3-tier layout in a future patch) |

## §1 Context

learn-kit v3.0.0 (marketplace v6.0.0; shipped 2026-05-28) consolidated 5 skills into a single `three-views` skill with a 5-step workflow. Two interaction constraints emerged from dogfood:

1. **Hardcoded 3-tier output** — Step 3 always loops over `(foundation, structural, challenge)`. Users who explicitly only need one tier (e.g. "just give me the foundation primer for git rebase") had to wait through 3-tier generation and discard the unused 2 tiers. The pedagogical 3-tier methodology is sound; mandatory 3-tier *output* is not.
2. **Step 4 NLM granularity** — only 2 coarse NLM checkboxes ("9 view-cycled bundle" + "1 shared mind_map"). Per-artifact-type control (only audio, or audio+slide_deck without video) was only available deep at Step 5B.4 quota-gate "Reduce subset" — too late in the workflow, surprising for users who knew upfront they only wanted "an audio podcast".

A reviewer pass on the first draft of this expansion also identified state-divergence and source-corpus contamination risks that the design must address:

- **Conflict-skip path** drops a user-requested tier between Step 1 and Step 3 → downstream Steps 5A/5B must consume the actually-generated tier set, not the user-requested set. Without distinction, "Skip conflicting view" silently breaks downstream loops.
- **Re-run with different tier subset** — if a user previously ran the full 3-tier flow for a topic, then re-runs with only 1 tier selected, "Regenerate missing" silently reuses the existing 3-source notebook. Resulting NLM artifacts would be grounded in 2 tiers the user did NOT select this time — partial-output contamination.
- **Hardcoded constants** in `templates/artifact-mind_map.md` ("across all three tiers") and SKILL.md line 394 (`Sources: 3 .md ...`) hardcode the 3-tier assumption at the template + prompt layer, would have broken under partial runs.

Constraint: must preserve v3.0.0 default product output (a user who accepts all defaults must see no behavior change in what artifacts are produced).

## §2 Decision

We decide to **expand `three-views` HITL surface from 1 tier-implicit + 3-cell Step 4 to 3 tier-explicit cells + 5-cell Step 4**, while preserving v3.0.0 product defaults and adding state correctness for partial-run scenarios:

- **Step 1.3 (NEW)**: `AskUserQuestion(multiSelect=true, header="Tiers")` with 3 cells (Foundation / Structural / Challenge), all `default: true`, minimum 1 enforced (0-selection → re-prompt once → abort).
- **Step 4 redesign**: 3 coarse cells → 5 granular cells (HTML / NLM audio / NLM video / NLM slide_deck / NLM mind_map), all multiSelect, all `default: false`.
- **State separation**: `requested_tiers` (set at Step 1.3) ≠ `generated_tiers` (computed at end of Step 3 = `requested_tiers − skipped − failed`). Steps 5A/5B consume `generated_tiers`.
- **Step 5B re-run guard**: add `source_corpus_key` (stable SHA-256 hash of `(topic, sorted(generated_tiers), sorted(source content_sha256))`). On mismatch with existing notebook, default-recommend "Replace sources + new notebook" or "New timestamped notebook"; do NOT silently reuse.
- **Step 5B.4 Quota gate**: adaptive `N`; rename "Pick single view" → "Pick single tier"; hide the option when degenerate (`len(generated_tiers) == 1` or `selected_view_cycled_types == {}`).
- **3-level hint granularity** for Step 4 pre-checks: explicit-type hints (e.g. "just audio") pre-check only that cell; generic-NLM hints ("and NLM") pre-check all 4 NLM cells; no hint → unchecked.
- **Default asymmetry preserved**: Step 1.3 defaults all-checked (preserves "always 3 tiers" historical behavior); Step 4 defaults all-unchecked (preserves opt-in posture per [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](./[ADR]_LearnKit_Consolidation_To_Single_Skill.md) §3.2 risk mitigation). The asymmetry is intentional and load-bearing — see §3.3 risk.
- **`templates/artifact-mind_map.md` edited**: reframe "across all three tiers" to "across the selected source corpus"; correct "4 other artifact types" (stale v6.0-pre wording) to "3 other artifact types".
- **`generator: learn-kit/three-views@3.0.0`** in Step 3 frontmatter template → `@3.1.0`.
- **Slash invocation doc**: add explicit "Slash invocation" section near the top of SKILL.md showing `/learn-kit:three-views <topic>` (auto-discovered, no `commands/` file needed).

Boundary:

- **In-scope**: SKILL.md HITL expansion + 1 template file edit + plugin docs sync + marketplace metadata sync.
- **Out-of-scope**: changing the 3-view pedagogical methodology itself; new NLM artifact types beyond the existing 4 (audio/video/slide_deck/mind_map); reviving infographic (retired in v6.0.0 per consolidation ADR §3.2); per-tier NLM control beyond view-cycled cartesian.
- **Open questions**: none; all reviewer-flagged items addressed in this ADR.

## §3 Consequences

### §3.1 Positive

- **Partial-output use cases unlocked**: `/learn-kit:three-views "git rebase 只要 foundation 和 audio"` → 1 md + 1 audio artifact ≈ 1-2 min wall-clock vs the v3.0.0 forced 3-tier ≈ 5-10 min for the same effective output.
- **Per-type NLM upfront control**: users who want "only slide_deck" or "audio + mind_map" no longer wait until Step 5B.4 quota gate to filter.
- **Source-corpus contamination prevented**: partial re-runs surface explicit mismatch warning + recommend safer notebook path; eliminates silent multi-tier corpus reuse for single-tier intent.
- **State model documented**: `requested_tiers` vs `generated_tiers` distinction documented inline in SKILL.md state-variables table — future maintainers can reason about conflict-skip / generation-fail paths without re-deriving.

### §3.2 Negative

- **One additional HITL gate** (Step 1.3) in every invocation — adds one keypress when user accepts defaults. Net interaction cost: ~1 second.
- **Quota gate UI complexity** — adaptive `N` + 3-way vs 4-way prompt conditional. Documented inline; minor reviewer learning curve.
- **CHANGELOG asymmetry visible**: v3.0.0 was BREAKING; v3.1.0 is additive. Users coming from v3.0.0 release notes may not initially notice v3.1.0 features unless they read the new Step 1.3 prompt.

### §3.3 Risks

- **Risk**: Future "consistency" PR flips Step 1.3 default-checked to default-unchecked (or vice versa for Step 4), thinking the asymmetry is an oversight. *Mitigation*: this ADR §2 explicitly documents the asymmetry as load-bearing — Step 1.3 default-all preserves v3.0.0 product output; Step 4 default-none preserves v3.0.0 opt-in posture for NLM cost / quota / HTML rendering time. Flipping either side regresses default behavior.
- **Risk**: `source_corpus_key` hash computation drift if NLM server doesn't expose per-source `content_sha256`. *Mitigation*: fallback documented in SKILL.md Step 5B.2 — compare `(topic, len(sources))` tuple as degraded equivalence; emit warning that finer detection unavailable. Live-compute approach (no NLM-side state to maintain) chosen for safety.
- **Risk**: 3-level hint granularity false-positive on ambiguous user phrasing (e.g. "make NLM-style audio podcast" — does "NLM-style" mean all NLM or just audio?). *Mitigation*: pre-check is always non-blocking; user confirms or unchecks. HITL gate is sacred.
- **Risk**: `templates/artifact-mind_map.md` edit may regress mind_map output quality if NLM consumes the prose differently than expected. *Mitigation*: dogfood Scenario C (mind_map with 1-tier corpus) verifies output shape unchanged; dogfood finding #5 invariant (view-agnostic structural hierarchy) is the operating contract, not the prose itself.

## §4 Alternatives Considered

### §4.1 Option A: `commands/` directory with positional args (e.g. `/learn-kit:three-views-foundation`)

- **Pros**: Explicit slash forms; no AskUserQuestion gate; user can compose CLI-style invocations.
- **Cons**: Requires creating + maintaining commands/*.md files for each tier subset (`/three-views-foundation`, `/three-views-foundation-and-audio`, ...). Exponential combinatorial explosion (2^3 tier subsets × 2^5 Step-4-cell subsets = 256 thin wrappers). HITL gate is the more scalable interaction primitive for combinatorial choice.
- **Why rejected**: combinatorial wrapper count infeasible; auto-discovery already handles `/learn-kit:three-views <topic>` slash without additional files; HITL gates are the appropriate primitive for multi-dimensional choice.

### §4.2 Option B: Keep tier hardcoded; only redesign Step 4

- **Pros**: Smaller diff; no Step 1.3 addition; no `requested_tiers` / `generated_tiers` state distinction needed.
- **Cons**: Doesn't solve the most-requested partial-output use case (user only wants 1 tier of markdown). Per-type NLM granularity alone is half the win.
- **Why rejected**: solves half the problem at not much smaller cost — both Step 1.3 and Step 4 redesign are independent additive changes with similar review surface; bundling is more efficient than 2 sequential PRs.

### §4.3 Option C: Split Step 4 into 2 sequential AskUserQuestions (HTML, then NLM types)

- **Pros**: Each prompt semantically narrower (HTML standalone; NLM types together).
- **Cons**: 2 round-trips instead of 1. HTML and NLM types are non-correlated; users with strong opinions on both want to set both at once.
- **Why rejected**: extra round-trip without semantic gain; merging into 1 multiSelect with 5 cells is the most efficient form.

## §5 Implementation Plan

Single PR (`feature/learn-kit-three-views-hitl-expansion` → `develop`):

1. Edit `plugins/learn-kit/skills/three-views/SKILL.md` — frontmatter description; new Slash invocation section; State variables table; Step 1.3 Tier selection; reorder Step 1 sub-steps; Step 3 loop generalization + `@3.1.0` generator + `generated_tiers` computation + abort invariant; Step 4 redesign (5-cell, 3-level hints); Step 5A loop generalization; Step 5B working-set + source_corpus_key re-run guard + adaptive Quota gate + recap state; mind_map focus_prompt; Multi-select UX rules; Output convention formula table; Performance notes; Migration table.
2. Edit `plugins/learn-kit/skills/three-views/templates/artifact-mind_map.md` — "across all three tiers" → "across the selected source corpus"; "4 other artifact types" → "3 other artifact types".
3. Edit `plugins/learn-kit/CHANGELOG.md` — new `## [3.1.0] - 2026-05-29` section.
4. Edit `plugins/learn-kit/.claude-plugin/plugin.json` — `version: "3.0.0" → "3.1.0"`; description refresh.
5. Edit `plugins/learn-kit/CLAUDE.md` — sync per Framework §2.7 Category 2/3 (plugin minor + SKILL.md change).
6. Edit `plugins/learn-kit/README.md` — TL;DR + Quick Start + Scenarios A-D + output tree + troubleshooting + version table.
7. Edit `VERSION` + `.claude-plugin/marketplace.json` — `6.0.1 → 6.1.0`; plugin version sync; description refresh.
8. Edit root `README.md` — Version badge + plugin row + v6.1.0 note + v6.0.0 stale `/learn-kit:scaffold-learning/scan/locate/generate-tier/nlm-studio` example cleanup.
9. Edit root `CLAUDE.md` — sync per Framework §2.7 Category 2 (plugin minor + VERSION change); append v6.1.0 entry to 历史版本记录.
10. Create this ADR (`docs/adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md`).
11. Register new ADR in `docs/INDEX.md` ADR table.

Related documentation updates:

- `docs/INDEX.md`: add ADR row (Framework v1.6 §1 hard rule)
- `docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`: no edit needed (this ADR adds HITL gates within an existing skill; doesn't change the 11-stage workflow)

## §6 Acceptance Criteria

- [ ] `plugin.json` version == `marketplace.json plugins[0].version` == `3.1.0`
- [ ] `VERSION` == `marketplace.json metadata.version` == `6.1.0` == root README badge
- [ ] SKILL.md frontmatter description ≤ 1,536 chars
- [ ] `artifact-mind_map.md` contains no "all three tiers" hardcode (verified via grep)
- [ ] SKILL.md hardcoded-3 sweep clean: `3 md` / `3 .md` / `× 3` / `9 view-cycled` / `all three` references either in migration history (acceptable) or rewritten as adaptive formula
- [ ] `docs/INDEX.md` ADR section contains row for this ADR
- [ ] Root + plugin CLAUDE.md synced (A6 CI gate passes)
- [ ] CHANGELOG `[3.1.0] - 2026-05-29` entry exists in plugin CHANGELOG
- [ ] Dogfood scenarios A/B/C/D/E/F (per plan §verification) produce expected output counts when run on develop

## §7 References

- Issue: (none; planning artifact at `~/.claude/plans/1-foundation-sleepy-emerson.md`)
- Plan: `~/.claude/plans/1-foundation-sleepy-emerson.md`
- Related ADR: [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](./[ADR]_LearnKit_Consolidation_To_Single_Skill.md) (v3.0.0 baseline)
- Related ADR: [`[ADR]_Develop_PreBump_Adoption`](./[ADR]_Develop_PreBump_Adoption.md) (marketplace 6.0.1 → 6.1.0 minor bump consumes pre-bump slot per its §3)
- Related STANDARD: [`[STANDARD]_Documentation_Framework`](../rule/[STANDARD]_Documentation_Framework.md) §2.7 (CLAUDE.md sync allowlist trigger), §1 (docs/INDEX.md registration hard rule)

## §8 Decision Log

| Date | State | By | Note |
|------|-------|----|------|
| 2026-05-29 | proposed | marketplace-maintainers | Initial draft after Plan review cycle |
| 2026-05-29 | accepted | marketplace-maintainers | All 13 reviewer-flagged items folded into plan + ADR; co-authored with implementation PR |
