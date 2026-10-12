---
type: adr
scope: marketplace
summary: "Replace Understanding Kit with two explicit skills and recoverable learning evidence"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-12
state: active
version: v1.0
supersedes:
  - "./[ADR]_Understanding_Kit_Addition.md"
---

# [ADR] Learning Evidence Kit migration

| Field | Value |
| --- | --- |
| Status | accepted for implementation; runtime acceptance and publication outstanding |
| Date | 2026-10-12 (Asia/Taipei) |
| Author | marketplace-maintainers, following Owner decisions |
| Scope | marketplace / learning-evidence-kit; Epic #209 |
| Reversibility | isolated changes before release; published faults use a new repair version |

## §1 Context

Owner accepted the `2026-10-12-reviewer-two-plus-one` revision of Learning Evidence Loop and authorized this Epic's implementation, Issues, isolated worktrees, testing, commits, pushes, PRs and conditional formal publication. The earlier research-only planning restriction does not apply to this implementation. The research project remains read-only.

The current published marketplace is 8.1.1; develop is the unpublished 8.1.2 pre-bump. The PR1 base is develop `b2e5a74109f47ecee7471ba741fb4c1348457f3b` (#208). Commit `fff175afcd8f7a3edd10849e3c88ac759f72de93` includes main `0c681a8` ancestry while preserving develop's content. Runtime authority remains VERSION, the marketplace index and each plugin's root manifest. This contract PR changes none of those runtime files.

The existing Understanding Kit supplies explicit, read-only local quiz observations. The accepted extension keeps that diagnostic boundary and adds a complete transferable record, independent local retention, manual PR sharing and task application checks. Design acceptance and source verification establish implementation authority; they do not establish functioning persistence, client behavior or learning benefits.

## §2 Decision

Replace the registered **understanding-kit** directly with **learning-evidence-kit 0.1.0** for **marketplace 8.2.0**. Keep two public skills, **pop-quiz** and **learning-record-check**, both explicitly invoked. Shared capabilities are package scripts, not a third public skill. Diagram Kit and Explain Kit retain their versions; the approved Understanding Kit icon is reused with its new package ownership.

This ADR replaces the earlier Understanding addition's package identity, no-persistence boundary and permissive host-window fallback for the new release. Its original decision and evidence remain historical. Existing Learn Kit, NotebookLM and Claude retirement, portable packaging, protected branches, independent approval and immutable release history continue to apply.

### Execution principles

| Principle | Execution contract |
| --- | --- |
| Agent execution, Owner decisions | Agents perform authorized technical operations; Owner supplies necessary information, substantive decisions and final product acceptance. Routine construction reviews are not a prerequisite. |
| Independent synthetic acceptance | Agents independently simulate relevant roles with reproducible evidence. Synthetic identities and observations are labelled; this does not replace Owner acceptance or an actual GitHub nonauthor approval. |
| Strict windows, staged delivery | Core capabilities may ship after their own acceptance. Keep both skills and interfaces; defer any native entry that cannot meet strict-window conditions. PR5 names every enabled and deferred entry with actual evidence. |
| Concentrated authorization | Reuse authorization while goal, object, environment, permissions and risk boundaries remain materially unchanged. A material expansion requires a new decision. |
| Executable, evidence-led constraints | The Harness runs required engineering checks; agents diagnose and repair failures. Missing evidence remains missing. This adds no learning gate to consumer projects. |
| Isolated risk and recovery | Stay within actual technical permissions. Release controls, traceable state checks and a suitable repair-version path protect irreversible publication and retained evidence. |

### Seven retained mechanisms

| Mechanism | Adopted implementation boundary |
| --- | --- |
| Independent local original | Store complete authoritative JSON outside worktree lifecycle; generated Markdown is its reading form. Pop Quiz produces the record, and an explicit handoff ends the diagnostic before common save/association runs. |
| Worktree association | `.learning-evidence/manifest.json` stores only references and library location, with local Git exclusion. Restore references after worktree replacement; answers and baselines remain in the independent library. |
| PR sharing | Explicitly publish a complete record through ordinary PR comments; retain frozen content, IDs, URLs, versions, digests and actual receipts. Read back unknown outcomes before retrying. |
| Reviewer acquisition | Manually collect visible shared comments into snapshots; complete exports support explicit handoff when a PR is absent or records are unshared. Private local files are not presumed accessible to reviewers. |
| Requirement, learning and application linkage | Preserve confirmed identity, stable evidence ID, task/KU, original intention, requirement items and a complete recoverable baseline. Each PR application check retains its own code version; reuse is not additional learning. |
| Check and collection separation | Learning Record Check targets specified records/tasks. Common capabilities perform save, association, restore, import/export, retained archive, publication recovery and historical collection. |
| Incremental collection | Index visible open, closed and merged PR comments by update time with pagination, a five-minute overlap and deduplication. Preserve partial snapshots and the previous complete cursor on failure. Unavailable sources are gaps, not proven deletions. |

Python 3.12 standard-library scripts use the [record and JSON API contract](../spec/[SPEC]_Learning_Evidence_Record_And_API.md). Windows defaults to `%LOCALAPPDATA%\learning-evidence-kit`; other systems use their user data directory. Explicit library overrides are absolute. Use the existing authenticated `gh` executable for GitHub operations; no MCP service or additional credential store is introduced.

Pop Quiz remains read-only during diagnosis, defaults to one KU and permits at most two KUs/five displayed questions. A second KU needs explicit continuation. Knowledge choices have no recommended or preselected answer. An unsubmitted, timed-out or closed question remains unanswered; handoff saving preserves pending/interrupted status. Learning Record Check separates record validity from knowledge application using the person's explanation and existing verification materials. Saving does not publish; new materials do not trigger checking. One explicit request with complete inputs and scope may execute both stages and their authorized publications.

### Strict entry acceptance and external interfaces

For each native question entry, separately verify that its window remains displayed before explicit submission. A JSON pending state, textual restatement or model assertion does not satisfy that display requirement. On 2026-10-12 Owner chose staged delivery with unchanged dual-skill/common interfaces: entries unable to meet this condition are deferred; qualified core delivery does not complete the Epic. No entry is declared qualified by this ADR.

The reviewer interface preserves two required actions (start review; review and confirm judgment/feedback) and one optional action (publish a confirmed background version). This Epic provides shared acquisition/export data only. Reviewer decisions, team-management skills/personnel updates, mj-system changes and Space publication remain outside implementation. Long-term retention, transfer, real-task learning benefits and management judgment effects are deferred evaluations, not technical acceptance claims. No scheduled collection, automatic learning/checks, management decisions or notifications are added.

## §3 Consequences

Complete local originals and frozen PR copies allow restoration after worktree cleanup, requirement changes and interrupted sharing. Stable learning identity separates copied records from distinct observations and PR application results. Reusable confirmed metadata reduces repeated input without inferring missing identity or authority.

The package acquires storage, serialization, locking, import validation and remote-recovery responsibilities. Missing comment parts, source permission gaps and version conflicts require explicit partial or blocked receipts. Recoverable content increases storage and disclosure volume; publication must remain bound to the specified target and record rather than the entire private library.

Client-window behavior is a separate technical risk. Unsupported entries remain deferred while independently qualified core capabilities can progress. Synthetic role evidence cannot establish human learning, actual desktop interaction or formal repository approval. Actual runtime and window outcomes are tracked in the [acceptance ledger](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md).

## §4 Alternatives Considered

1. **Adopted: direct package replacement with independent local originals and staged entries.** Preserves the accepted two-skill interface, complete lineage and publication boundaries without a transitional plugin.
2. **Keep a transition Understanding Kit or store originals only in worktrees/PRs.** Would retain an unapproved parallel runtime surface or leave pre-PR/unpublished observations dependent on task cleanup and sharing availability; not adopted.
3. **Add a service, third collection skill or implement team/Space management here.** Would expand deployment, public interfaces and external authority beyond this Epic; not adopted.

## §5 Implementation Plan

Use six short-lived worktree PRs, merging in dependency order into develop. Use `Refs` for each child and Epic; the release PR does not close Epic automatically.

| PR | Child Issue | Delivery and dependency |
| --- | --- | --- |
| 1 | [#210](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/210) | This ADR, record/API SPEC, migration and acceptance contract; no runtime or version bump |
| 2 | [#211](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/211) | Local library, recoverable baseline, association, restore, import/export and retained archive; after PR1 |
| 3 | [#212](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/212) | PR comments, segmented publication/recovery and incremental collection; after PR2 |
| 4 | [#213](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/213) | Atomic package/skill/permission/UI/icon/version-tool/strict-validator migration; after PR2/3 |
| 5 | [#214](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/214) | Actual technical acceptance, enabled/deferred entry list, 8.2.0 preparation and CHANGELOG; after PR4 |
| 6 | [#215](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/215) | Protected develop → main release and publication verification; after PR5 |

PR2/3 stage code in `scripts/learning-evidence/` and preserve old runtime-package bytes. PR4 moves it to `plugins/learning-evidence-kit/scripts/` and removes the staging location while replacing every runtime registration and exact-validation dependency in one PR. Installed execution derives the entry point from the actual SKILL locator and proves independence from repository/worktree paths. Archive replaced current documents, fix removed-resource links to exact historical commits and synchronize INDEX and root AGENTS.

After publication, use two additional PRs for actual main → develop synchronization and 8.2.1 marketplace pre-bump. The latter changes only VERSION and the derived README badge. Close children 1–5 explicitly only after merged delivery and their agreed acceptance. Keep #215 and Epic #209 open while original-plan deferred entries or required closeout work remain; adjusted closure requires an explicit scope decision and assigned follow-up responsibility.

## §6 Acceptance Criteria

The [ledger](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md) records actual pass, failure, not-run and deferred items. Acceptance here is a future criterion, not a result.

- [ ] PR1 contracts, migration sequence, source identity and entry-defer decision are consistent; old runtime bytes and versions are preserved.
- [ ] Actual Python tests prove isolated save/retry/conflict/recovery, complete-baseline retention, identity attribution, task associations, export/import and retained archive.
- [ ] Controlled GitHub-write tests cover unknown results, segmented/missing parts, duplicate recovery, pagination, overlap, edits, permission gaps and incomplete progress.
- [ ] Exact validation and Codex 0.147.0 isolation prove three plugins/five public skills/two explicit policies, package-owned resource execution and real Python diagram regression.
- [ ] Independent synthetic roles exercise quiz and both check stages; every enabled client entry has its own installation, call and strict-window evidence. Unqualified entries have recorded impacts and removal conditions.
- [ ] Release uses current-head nonauthor approval, required checks, resolved threads, authorized scope, draft-first canonical installation, tag/version/SHA checks and post-publication verification.
- [ ] Core delivery, complete original plan, release closeout and Owner final acceptance remain separately recorded; deferred evaluations are not counted as learning success.

## §7 References

- [Epic #209](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/209), [contract child #210](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/210)
- [Record and common API SPEC](../spec/[SPEC]_Learning_Evidence_Record_And_API.md), [acceptance ledger](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)
- [Earlier Understanding decision](./[ADR]_Understanding_Kit_Addition.md), [portable migration/retirement](./[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)
- [Execution STANDARD](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md), [documentation framework](../rule/[STANDARD]_Documentation_Framework.md), [release operations](../runbook/[RUNBOOK]_Release_Operations.md)

Read-only design sources reside in `D:\workspace\11-knowledge\03-work-learning-loop-lab`. SHA-256 was checked on 2026-10-12 against the accepted revision; those files are not runtime dependencies or marketplace modifications.

| Source | SHA-256 |
| --- | --- |
| `PROJECT.md` | `3076f40f251b871d58f7dcb602a89435e6dad223cd5f9c36ae7f4eeb7593aa8d` |
| `STATE.md` | `a7082209fdb96e9d8eaecfa306736c5f5a4e196331285e994968ffd8ec8aed37` |
| `artifacts/PR-001-learning-evidence-loop.md` | `2afa3771e43d10d1298271db7c817d412cf5b6ae947b79d363b84828307e06f2` |

PR-001's content revision is `2026-10-12-reviewer-two-plus-one`. Its seven-mechanism and reviewer-operation design applies only within the narrower implementation boundary adopted here. Any material source drift is reported before scope changes.

## §8 Decision Log

| Date | State | By | Note |
| --- | --- | --- | --- |
| 2026-10-12 | accepted | Owner | Authorized Epic/multi-PR implementation and conditional formal release; fixed two skills, direct replacement, local originals, manual flow and six execution principles. |
| 2026-10-12 | accepted | Owner | Chose independently accepted core delivery with unchanged dual-skill/interfaces; strict-window-incompatible native entries are deferred and Epic remains incomplete. |
| 2026-10-12 | verified source | Agent | Three source digests match the accepted revision; PR1 records contracts, not implemented or accepted runtime behavior. |
