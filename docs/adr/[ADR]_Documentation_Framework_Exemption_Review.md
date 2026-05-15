---
type: adr
scope: marketplace
summary: Re-examine §1 exemptions of Documentation Framework v1.2; decide to keep both
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-15
state: active
version: v1.0
domain: governance
related:
  - ../rule/[STANDARD]_Documentation_Framework.md
  - ./[ADR]_NotebookLM_Kit_Retirement.md
  - ../ai_engineering_execution_hitl_workflow.md
  - ../../plugins/learn-kit/docs/INDEX.md
---

# [ADR] Documentation Framework §1 Exemption Review

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-05-15 |
| Author | marketplace-maintainers |
| Scope | marketplace |
| Reversibility | reversible (single revert restores v1.2 framework + outlier frontmatter) |

## §1 Context

A user-initiated re-examination on 2026-05-15 questioned whether the seven currently-exempt documentation files conform to `docs/rule/[STANDARD]_Documentation_Framework.md`. Investigation traced both exemptions to the framework's own §1 Out-of-scope table:

- **Single-file exemption** (since v1.0): `docs/ai_engineering_execution_hitl_workflow.md` — "generic HITL philosophy doc parent to specialized marketplace variant".
- **Pattern exemption** (codified in v1.1, PR #80): `plugins/<name>/docs/<plugin>-NN-*.md` and `plugins/<name>/docs/<plugin>-*.md` plugin-internal teaching series. Six files match: `learn-kit-{01..05}-*.md` + `learn-kit-使用手册.md`.

Two soft drift signals surfaced during the audit:

1. Two of seven exempt files (`ai_engineering_execution_hitl_workflow.md` + `learn-kit-使用手册.md`) carry **legacy non-canonical YAML keys** (`title / purpose / audience`); file 1 additionally uses a malformed `related: |` literal-block scalar. The other five teaching files have no frontmatter at all.
2. `docs/INDEX.md` line 11 still listed Documentation Framework as `v1.0`; actual frontmatter had been bumped to `v1.2` (v1.0 → v1.1 in PR #80, v1.1 → v1.2 in PR #83) — neither bump propagated to INDEX.

The current §1 rule says `/mp-doc-validate` "skips frontmatter and path-prefix checks" against exempt files but does not forbid mixing canonical and legacy frontmatter. This ADR decides whether to revoke the exemptions and retrofit the seven files, or keep them and tighten the rule.

## §2 Decision

**Keep both §1 exemptions; tighten the frontmatter rule; normalize the two outlier files; fix the INDEX drift — all in a coordinated v1.3 minor bump.**

- §1 gains a v1.3 normative clause: exempt files MAY (a) omit frontmatter entirely OR (b) carry the canonical 8-field schema. Legacy non-canonical keys (`title / purpose / audience`) and YAML literal-block-scalar list fields (`related: |`) are forbidden.
- `/mp-doc-validate` adds Step 2.7: scan exempt-file frontmatter for forbidden legacy keys and emit Warning (not Critical) per occurrence. Continues to skip required-field and path-prefix checks against exempt files.
- The two outlier files have their legacy frontmatter dropped (consistency with the five sibling no-frontmatter teaching docs; preserves fork-source portability of the generic HITL doc).
- `docs/INDEX.md` line 11 corrected to `v1.3`.
- Framework v1.3 is a backward-compatible MAY/MUST clarification — does not trigger §2.3.1 archive criteria.

Boundary:

- **In-scope**: the two §1 exemption rows + their interaction with frontmatter discipline; the two outlier files; INDEX line 11 drift; `/mp-doc-validate` warn-mode for legacy keys.
- **Out-of-scope**: `scope` enum extension (no `shared` value); new tag taxonomy entries (no `[LEARNING]`); marketplace `docs/INDEX.md` restructure; `plugins/learn-kit/docs/INDEX.md` content; any of the 7 file paths (no renames); rewrite of any of the 7 file bodies; marketplace `VERSION` bump (release manager decides).
- **Open questions**: when (if ever) might the teaching-series exemption need additional 3-criteria refinement? Deferred until a second plugin proposes a teaching series of its own.

## §3 Consequences

### §3.1 Positive

- **Pedagogical numbered ordering preserved.** The `learn-kit-NN-*` series keeps its sortable reading-order signal. Tag-prefixing (`[GUIDE]_LearnKit_NN_*.md`) is structurally fragile because any future non-numbered LearnKit GUIDE (e.g., `[GUIDE]_LearnKit_NLM_Quota.md`) would sort lexically before `_01_` — breaking the series order. The exemption sidesteps this entirely.
- **Fork-source portability preserved.** `ai_engineering_execution_hitl_workflow.md` remains a copy-pastable parent doc that downstream projects (mj-system, future adopters) can absorb without inheriting marketplace-specific frontmatter pollution. This is its declared purpose per its own §0 three-layer table.
- **Minimal blast radius.** Four files touched (framework, INDEX, file 1, file 7) plus one new ADR plus one skill update. No file moves; no link breakage; no INDEX restructure; no archive ceremony; no cross-reference cascade.
- **Reversible.** A single PR revert restores the v1.2 framework, the legacy frontmatter on the outliers, and the INDEX drift. The cleanup is self-contained.
- **Compatible with `/mp-doc-validate`** without behavioral regressions: the warn-mode addition is additive (new Step 2.7), not a modification of existing checks.

### §3.2 Negative

- **Two parallel "shapes" remain** for exempt files (no-frontmatter vs canonical-frontmatter). AI agents and humans must learn that exempt files are permitted both forms. This is an improvement over the previous three-shape state (no-frontmatter / canonical / legacy-keys) but not as crisp as a single uniform schema.
- **Exemption surface unchanged.** Seven files plus two patterns continue to exist as a "soft zone" outside `/mp-doc-validate`'s strict checks. Future contributors might still treat the zone as a relaxation rather than a special-case carve-out, repeating today's mistake.
- **Documentation Framework version count grows** (v1.0 → v1.1 → v1.2 → v1.3 within a short window). v1.3 is an honest minor bump but adds another row reviewers must skim in §5 Change History.

### §3.3 Risks

- **Risk 1 — Drift recurrence.** A future contributor adds a new exempt file with `title / purpose / audience` legacy keys despite the rule. *Mitigation*: `/mp-doc-validate` Step 2.7 warn-mode catches it at PR review; the v1.3 §1 paragraph is normative (MUST NOT), not advisory.
- **Risk 2 — Validator scope creep.** Step 2.7 is a new code path that must distinguish "exempt file with canonical frontmatter" (silent OK) from "exempt file with legacy frontmatter" (warn) from "exempt file with no frontmatter" (silent OK). *Mitigation*: small key-set check (`title / purpose / audience` literal match plus `^related: \|` regex); test on the seven existing exempt files first (post-cleanup, all should pass silent).
- **Risk 3 — Fork divergence on file 1.** If a future maintainer adds canonical 8-field frontmatter to `ai_engineering_execution_hitl_workflow.md`, downstream forks will inherit marketplace-scoped metadata. *Mitigation*: §3 of this ADR's Implementation Plan drops the file's frontmatter entirely; future canonical-frontmatter additions would need to defend why they break fork portability.
- **Risk 4 — ADR weight on a small change.** ADRs are weighty artifacts; some reviewers may feel a procedural cleanup does not warrant one. *Counter-defense*: the user explicitly requested re-examination of §1 — an architectural question. The ADR's primary value is the durable record so future "why two shapes for exempt files?" questions land on a single answer.

## §4 Alternatives Considered

### §4.1 Option A: Revoke + Retrofit (Plan A from brainstorming)

Revoke both §1 exemptions. Rename and retrofit all seven files into the canonical `[TAG]_<TitleCase_Topic>.md` shape with the 8-field frontmatter. Specifically: file 1 → `docs/guide/[GUIDE]_AI_Engineering_HITL_Workflow_Generic.md`; learn-kit teaching series → `plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_NN_<Topic>.md` (with `_NN_` infix preserving order); file 6 (governance boundary) → `plugins/learn-kit/docs/adr/[ADR]_LearnKit_Governance_Boundary.md`; file 7 (使用手册) → `[GUIDE]_LearnKit_User_Manual.md`. Bump framework to v2.0 (split/merge/rename trigger per §2.3.1) with full archive ceremony for v1.2.

- **Pros**: single uniform schema for all docs; `/mp-doc-validate` covers everything with no special cases; no future "two-shape tax" on AI agents.
- **Cons**: ~14 file moves + ~18 cross-reference updates + 4 PRs (ADR → framework v2.0 + archive → file 1 retrofit → 6 learn-kit retrofits) + framework v2.0 archive ceremony per RUNBOOK Phase 1-4 + all `related:` chains, INDEX entries, and `mp-doc-validate` exemption-list comments updated.
- **Why rejected**: two specific load-bearing harms.
  1. **Pedagogical ordering becomes structurally fragile**. `[GUIDE]_LearnKit_NN_<Topic>.md` keeps the number in the title, but any future non-numbered LearnKit GUIDE sorts lexically before `_01_`, breaking the series-as-sortable-unit invariant. The proposed `series-order:` frontmatter field is invisible to `ls`/Glob and forces "open file to see ordering" — defeating the original "ordering is the pedagogical signal" purpose that the framework authors (v1.1) named when codifying the exemption.
  2. **Fork-source portability is destroyed for `ai_engineering_execution_hitl_workflow.md`**. The doc explicitly bills itself in its own §0 as "通用版本，可被任何项目采用作为起点". Marketplace-style frontmatter (`scope: marketplace`, `owner: marketplace-maintainers`, `[GUIDE]_` prefix) contradicts that role: downstream forks (mj-system, future projects) must either strip frontmatter (extra friction) or inherit irrelevant marketplace bookkeeping. The §1 exemption explicitly exists to spare this doc; voluntarily reintroducing the obligation undoes a deliberate design choice.

### §4.2 Option B: Status Quo + INDEX-only fix

Patch only the `docs/INDEX.md` line 11 drift. Leave §1 untouched. Leave file 1 + file 7 frontmatter untouched.

- **Pros**: smallest possible diff (1 line); no ADR; no framework version bump; no validator change.
- **Cons**: ignores the actual root cause (rule permissiveness allowed legacy keys to mix with no-frontmatter for these exempt files); guarantees recurrence; provides no durable signal that the exemption is intentional-but-bounded rather than lax.
- **Why rejected**: under-treats the user's request. The user asked for re-examination of the exemption itself, not for cosmetic INDEX cleanup. Without an ADR, future maintainers asking "why do exempt files exist and why is their frontmatter inconsistent?" land on no answer.

## §5 Implementation Plan

This ADR ships as part of a single PR alongside the framework v1.3 bump and outlier cleanup. Suggested commit sequence (within the PR):

1. `docs(framework): bump Documentation Framework v1.2 -> v1.3, tighten §1 exempt-file frontmatter rule` — framework file edits + `docs/INDEX.md` line 11 drift fix
2. `docs(adr): add ADR for Documentation Framework §1 exemption review — keep both` — this ADR + `docs/INDEX.md` ADR section row
3. `docs: drop legacy frontmatter from 2 exempt files (per Framework v1.3 §1)` — `docs/ai_engineering_execution_hitl_workflow.md` + `plugins/learn-kit/docs/learn-kit-使用手册.md`
4. `infra(skill): mp-doc-validate — warn on forbidden legacy frontmatter keys for exempt files` — `.claude/skills/mp-doc-validate/SKILL.md` Step 2.7 addition

Related documentation updates:

- `docs/rule/[STANDARD]_Documentation_Framework.md`: add §1 v1.3 normative clause (insert after v1.1 note); add §5 Change History row for v1.3; bump frontmatter `version: v1.2` → `v1.3` and `summary:`
- `docs/INDEX.md`: line 11 `v1.0` → `v1.3` + add ADR row in §"Architecture Decision Records"
- `docs/ai_engineering_execution_hitl_workflow.md`: delete frontmatter (lines 1-10)
- `plugins/learn-kit/docs/learn-kit-使用手册.md`: delete frontmatter (lines 1-8)
- `.claude/skills/mp-doc-validate/SKILL.md`: add Step 2.7 (exempt-file frontmatter discipline check); update workflow diagram; update Anti-pattern bullet at line 344; bump description to mention v1.3

Marketplace `VERSION` bump (e.g., `4.4.10` → `4.5.0`) is left to the release manager and decided when this PR's commits batch with other develop commits at release-cut time.

## §6 Acceptance Criteria

- [ ] `docs/rule/[STANDARD]_Documentation_Framework.md` frontmatter `version: v1.3`; §5 history has a v1.3 row; §1 has the v1.3 normative blockquote inserted between the v1.1 note and §2 heading.
- [ ] `docs/INDEX.md` line 11 reads `v1.3` (matches framework frontmatter); §"Architecture Decision Records" lists this ADR.
- [ ] `docs/ai_engineering_execution_hitl_workflow.md` has no frontmatter (file starts directly with `# AI 辅助工程执行闭环…` H1).
- [ ] `plugins/learn-kit/docs/learn-kit-使用手册.md` has no frontmatter (file starts directly with `# learn-kit 使用手册` H1).
- [ ] `.claude/skills/mp-doc-validate/SKILL.md` has a Step 2.7 (or equivalent) for exempt-file frontmatter discipline; Anti-pattern bullet at line 344 (or current equivalent line) updated to clarify v1.3 scoping.
- [ ] Running `/mp-doc-validate` on the post-PR working tree reports 0 Critical and 0 Warnings on the seven historically-exempt files (because all 7 either have no frontmatter or, after this PR, none of them carry legacy keys).
- [ ] No `related:` link in any other doc breaks (no path changes here; only frontmatter deletions on files that are not `related:` targets of other docs).

## §7 References

- Issue: user request 2026-05-15 (in-conversation; no GitHub issue)
- Plan: `~/.claude/plans/d-workspace-10-software-project-projects-agile-pixel.md` (user-local plan file)
- Framework precedent: `docs/rule/[STANDARD]_Documentation_Framework.md` §1 + §5 (v1.0 PR #75 v4.2.0; v1.1 PR #80 v4.3.3; v1.2 PR #83 v4.4.0)
- Cross-plugin ADR precedent: `[ADR]_NotebookLM_Kit_Retirement.md` (marketplace-scope ADR also touching learn-kit)
- Affected files (this PR): `docs/rule/[STANDARD]_Documentation_Framework.md`, `docs/INDEX.md`, `docs/ai_engineering_execution_hitl_workflow.md`, `plugins/learn-kit/docs/learn-kit-使用手册.md`, `.claude/skills/mp-doc-validate/SKILL.md`
- Skill impacted: `/mp-doc-validate` (Step 2.7 added; description bumped to mention v1.3 exempt-file discipline)

## §8 Decision Log

| Date | State | By | Note |
|------|-------|----|------|
| 2026-05-15 | proposed | marketplace-maintainers | initial draft based on 2 independent Plan-agent designs (revoke+retrofit vs keep+tighten); both converged on keep+tighten as load-bearing recommendation |
| 2026-05-15 | accepted | marketplace-maintainers | adopted in PR #XX (framework v1.3 + this ADR + outlier cleanup + skill warn-mode) |
