---
type: runbook
scope: marketplace
summary: "Learning Evidence Kit technical acceptance, staged entries and release evidence ledger"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-12
state: active
version: v1.0
last-verified: 2026-10-12
verification-scope: contract-and-isolated-local-library
---

# [RUNBOOK] Learning Evidence Kit acceptance

## §1 Preconditions and evidence boundaries

Follow the [migration ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md) and [record/API SPEC](../spec/[SPEC]_Learning_Evidence_Record_And_API.md). Epic [#209](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/209) targets marketplace 8.2.0 / learning-evidence-kit 0.1.0, directly replacing Understanding Kit with two explicit public skills. At PR1, current runtime remains develop 8.1.2 with Diagram 0.3.1, Understanding 0.1.2 and Explain 0.1.1; no new version or package is installed by this document.

`last-verified` and `verification-scope` describe source, read-only intake and document-structure verification only. No new-package runtime, native-window or client acceptance is established by that date. Existing releases' evidence stays historical and is not reused as a PASS for 8.2.0.

Owner authorized technical execution and conditional formal publication, then accepted staged delivery: preserve both public skills/common interfaces; defer native entries unable to meet strict-window conditions, and keep the Epic incomplete. PR5 records actual enabled entries individually. Synthetic role checks provide reproducible engineering evidence and remain distinct from real human learning, actual desktop interaction, GitHub nonauthor approval and Owner final product acceptance.

Before each run, record the exact source/head tree, interpreter/client/plugin versions, method, synthetic identity, input fixture, isolated evidence-library path, target repository/PR scope, actual result and limitations. Test save operations always specify temporary absolute libraries. GitHub-write automation uses a controlled fake `gh`; real writes occur only in their explicit authorized scope. Agents perform required engineering checks and repairs; users provide only missing substantive information or externally required identity/approval.

## §2 Execution procedure

1. Verify current remote ancestry, source revision and authorization. Preserve main/develop workspaces; use the current PR's short-lived isolated worktree. Report material source or scope changes before dependent work.
2. Execute tests appropriate to that PR plus `npm test`, `npm run validate`, `npm run check:baseline-tools` and `npm run smoke:codex` as applicable to the delivered runtime. Require actual Python execution, not a static assertion. Inspect failures and repair before reporting completion.
3. For PR2/3, prove old runtime packages remain byte-identical while common scripts are staged in `scripts/learning-evidence/`. For PR4, prove staging removal and package-owned execution after installation from an unrelated cwd.
4. Independently exercise synthetic responsible-person/operator/reviewer roles. Label their attribution and support; test user-observable transitions, preservation and recovery instead of treating an instruction's existence as behavior.
5. Inspect each supported client entry with actual available client controls. Test explicit invocation, unsubmitted/default/timeout/close behavior and pre-submission native-window persistence separately. Record inaccessible or unsupported entries and keep them deferred; a textual restatement or pending state cannot satisfy native display acceptance.
6. Before release, record every enabled/deferred entry, current-head independent approval, required checks, resolved review threads and canonical tested tree. Follow [draft-first release operations](./[RUNBOOK]_Release_Operations.md), then retain actual tag/Release/SHA/install verification.
7. Complete main → develop synchronization and dry-run/actual 8.2.1 pre-bump in separate PRs. Close delivered children explicitly. Keep original-plan deferred work, #215 and Epic open until their completion or an expressly adjusted scope with assigned responsibility.

## §3 Acceptance matrix

Use `PASS` only for the observed criterion and tested version. `FAIL` records an actual failed run; `NOT_RUN` means no execution; `DEFERRED` identifies an agreed postponed surface with follow-up. A limited result states its covered subset. A receipt's `ok` proves its requested operation, not learning, overall task or Epic completion.

| Area | Required reproducible observations | Current new-package result |
| --- | --- | --- |
| Contract and migration | Source revision/hash, two skills, direct replacement, staged code placement, preserved runtime/version, INDEX/A6 and history consistency | PASS for contract delivery: #216 merged f64fc957; reviews empty, no retroactive approval claim |
| Local save and identity | Explicit/reused identity confirmation; person/source author/operator separation; stable IDs without Issue; atomic save, idempotent retry, changed-input conflict and concurrent/interrupted recovery | PASS for PR2 isolated implementation below; merge pending |
| Baseline and association | Complete recoverable requirement content survives source edits/worktree deletion; reference-only locally excluded manifest; new-worktree restore and distinct PR applications with stable learning ID | PASS for PR2 isolated implementation below; merge pending |
| Export/import/archive | Complete linked export and digest manifest; import retains identity/history; malicious member paths, corrupt content and conflicting existing IDs fail safely; retained archive remains exportable | PASS for PR2 isolated implementation below; merge pending |
| Ordinary PR sharing | Complete JSON/reading content and actual receipts; explicit scope; all segments read back; unknown result reconciliation, duplicate prevention and missing-parts-only recovery | NOT_RUN; PR3 fake-gh tests and separately scoped actual evidence |
| Incremental acquisition | Visible open/closed/merged PR coverage; all pages; comment update time; five-minute overlap, equal-time deduplication and edited versions; failure retains snapshots and complete cursor; unavailability exposed as a gap | NOT_RUN; PR3 |
| Pop Quiz behavior | Explicit start; one default KU, explicit second KU, two-KU/five-question budget; withheld diagnostic feedback; no recommended answer; unanswered/default/timeout/close does not progress; explicit save handoff retains actual status | NOT_RUN; PR4/5 independent synthetic-role runs |
| Learning Record Check | Specified record/task prerequisite; separate validity/application conclusions; person's explanation and matching existing materials; missing materials allow authorized record sharing only; later application needs a new manual trigger | NOT_RUN; PR4/5 independent synthetic-role runs |
| Package and installation | Exactly three plugins, five public skills and two explicit policies; other plugin versions unchanged; approved icon bytes; no repository-skill leakage; installed common-script resolution/execution and no staging dependency | NOT_RUN; PR4/5, Codex 0.147.0 isolation |
| Engineering regression | Required repository tests/strict validation/CI; real Python diagram validator; common-script save tests isolate libraries; controlled GitHub-write substitute | NOT_RUN for new implementation; unchanged-package checks belong to their actual PR |
| Codex client entries | Exact client/source/version; installation and actual calls; each native-window criterion separately observed; Side Chat/context snapshot evidence identified | NOT_RUN; PR5 entry ledger |
| ChatGPT desktop entries | Exact client/source/version; installation, discovery and actual calls; each native-window criterion separately observed | NOT_RUN; PR5 entry ledger |
| Protected release | Current head nonauthor approval, required checks and resolved threads; 8.2.0 notes; draft/canonical install/read-back; tag/version/tree/Release match; post-publication installation | NOT_RUN; PR6 |
| Closeout | Actual main synchronization, 8.2.1 dry-run/application and preserved plugin versions; remaining entry/evaluation tracking | NOT_RUN; two post-release PRs |
| Owner final acceptance | Owner's explicit acceptance of the delivered product and its recorded limits | NOT_RUN; Agent does not sign on Owner's behalf |

For every native entry, separately record pre-submission continued display, no advancement on silence/default/timeout, closure behavior and acceptance of an explicit response. A successful logical pending-state test covers only that logical behavior. A window that disappears before submission fails the strict display criterion even if the same question survives in text.

## §4 Verified facts, unexecuted work and deferred entries

### PR1 intake facts (2026-10-12)

| Fact | Evidence and limit |
| --- | --- |
| Accepted source revision | PR-001 identifies `2026-10-12-reviewer-two-plus-one`; three actual SHA-256 values match the ADR source table. Research project was read only. |
| Repository base | develop `b2e5a74109f47ecee7471ba741fb4c1348457f3b` includes #208; isolated HEAD `fff175afcd8f7a3edd10849e3c88ac759f72de93` includes main `0c681a8` ancestry while preserving develop content. |
| Current version | Actual VERSION reads 8.1.2; this PR does not bump marketplace/plugin versions or change registration. |
| Local document checks | `git diff --check` and `node scripts/validate-portable.mjs` exited 0. Strict validation reported `ok: true`, 20 repository skills and the unchanged four public skills; this validates document links/metadata and the old runtime inventory, not new-package behavior. |
| Tracking | Epic #209 and children #210–215 exist; PR numbers and merged/tested identities will be recorded as they occur. |
| Staged-delivery decision | Owner explicitly accepted core delivery after independent acceptance with unchanged dual-skill/interfaces, deferral of strict-window-incompatible entries, and an open Epic for remaining work. |

PR1 root review compared all contracts with the accepted scope and source revision. [Reproducible check receipt](evidence/learning-evidence-contract-checks.json) records the 240/240 test run (zero skips), exact Codex 0.147.0 baseline, four isolated installation scenarios, actual installed Python diagram result, strict inventory and unchanged runtime diff. These passes cover the contract and existing packages only; remote CI and nonauthor approval are separate.

These facts do not prove the new library, publication, collection, skill behavior, clients or release. No new runtime results are available at PR1. There are no new-package failure runs to report yet; later failures retain original input/output alongside repaired reruns.


### PR2 local implementation and independent review (2026-10-12)

PR2 stages only Python standard-library common/storage/JSON entry scripts in `scripts/learning-evidence/`; current packages, VERSION and registration remain byte-identical to develop. All storage operations use explicitly isolated synthetic libraries. The source authority is schema 1 JSON; Markdown is derived.

Standards axis: no unresolved documented violations or maintenance findings after request digest calculation was centralized. Spec axis: independently reproduced duplicate-original import and contradictory-save-receipt import failures; both were fixed before submission. Independent actual Python reruns now return `import_conflict` / `invalid_import` without invalid writes, and valid export/import/get restores exact records, baselines and associations. Earlier independent review found recovery dry-run conflict misreporting, also fixed through shared no-write preflight.

Final checks: 241/241 Node tests, zero skipped, including 33 actual Python 3.12.13 storage cases; strict validation; Codex 0.147.0 four-scenario isolated installations; actual cached diagram Python result `FAIL 0 / WARN 0`. [Structured receipt](evidence/learning-evidence-store-checks.json) captures methods, inputs, tested source digests and limitations. The prior 31-case snapshot passed but was not treated as final acceptance after two later import fixes.

#216 merged as `f64fc957b9fa595ac483724e2f60c1314b276574`; its Git tree equals tested `b83db6a`, all remote checks succeeded, review threads are absent, and GitHub reviews remain empty. #210 was explicitly closed on its contract delivery criteria; this does not retroactively establish a GitHub nonauthor approval. PR2 uses that current develop ancestry. No new-package installation, native question window, actual desktop route, formal publication, learning benefit or Owner final acceptance is established by these local-library results.

### Entry activation ledger

PR5 fills one row for each actual host/entry combination, retaining method, client version, install source/plugin/head identity, actual call evidence, individual window results, impact and removal condition. No entry is enabled solely by the contract or a static metadata check.

| Entry category | Current status | Enablement or deferral condition |
| --- | --- | --- |
| Codex normal/Side Chat invocation routes | NOT_RUN; no enablement claim | Identify actual routes and independently pass their applicable criteria; defer any native question route failing strict display. |
| ChatGPT desktop invocation routes | NOT_RUN; no enablement claim | Obtain actual installation/call/window evidence through available Agent controls; defer inaccessible or failing entries with stated impact. |
| Native entry unable to meet strict windows | DEFERRED when observed; none classified by PR1 | Owner accepted deferral policy. Resume after a supported client/version/control can reproducibly keep the window displayed until explicit submission and pass remaining criteria. |

Deferring an entry restricts availability for that host/route; it does not remove either public skill or relax the common interface. Qualified core delivery, full original-plan completion and Owner final acceptance are independent states. Keep the original Epic open for deferred entries until they are accepted or Owner expressly adjusts completion scope and assigns follow-up responsibility.

Real-task learning benefits, long-term retention, transfer and management judgment effects are DEFERRED evaluations. mj-system, team-management and Space implementation are outside this Epic. The reviewer two-required-plus-one-optional interface is preserved through common acquisition/export data; no reviewer management skill, personnel change or Space publication is claimed. Evaluation removal requires a separately authorized real-use study with its own participants, baseline and conclusion limits.

## §5 PR and issue completion tracking

All PRs use `Refs` for the corresponding child and Epic. A merged contract is not a passing implementation; each child closes only after its own merged delivery and agreed acceptance. The release PR must not use `Closes #209`.

| PR stage | Child | Depends on | State at PR1 | Completion evidence to record |
| --- | --- | --- | --- | --- |
| 1 Contract and migration | [#210](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/210) | Intake | IN_PROGRESS; files prepared, local structure passed, broader validation/contract root review passed; nonauthor approval pending | Actual PR, tested head/tree, checks, merge and contract review |
| 2 Local evidence library | [#211](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/211) | 1 | PREPARED; 33 isolated cases, full regression and independent review passed; merge pending | Isolated Python runs, runtime-byte equality, merge and scoped receipts |
| 3 GitHub flow/collection | [#212](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/212) | 2 | NOT_RUN | Substitute writes/recovery/coverage evidence, byte equality and merge |
| 4 Atomic skill/package switch | [#213](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/213) | 2, 3 | NOT_RUN | Exact inventory, new package/version identity, staging removal, installed execution and merge |
| 5 Technical acceptance/preparation | [#214](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/214) | 4 | NOT_RUN | Per-entry results/deferred list, independent synthesis, tests, 8.2.0 notes and merge |
| 6 Release and tracking | [#215](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/215) | 5 | NOT_RUN | Approval/checks/threads, release identity, canonical and post-publication results |
| Post-release main → develop sync | Refs #215 / #209 | 6 publication | NOT_RUN | Actual main ancestry and content/installation verification |
| Post-release 8.2.1 pre-bump | Refs #215 / #209 | Synchronization | NOT_RUN | Version dry-run, VERSION/badge-only diff, checks and merge; no 8.2.1 Release |

At full planned completion, release, installation recheck, sync and pre-bump must all be complete before closing #215 and Epic. Under the accepted staged boundary, retain unresolved original-plan entries and their removal criteria here and in issue tracking. A core release alone supplies no Epic completion or Owner acceptance.

## §6 Recovery and publication monitoring

Retain authoritative local records, baselines, old receipts and collected snapshots. Recovery reconciles actual files/comments first and targets only missing work; conflicting IDs/content or incomplete publication return their actual blocked/partial state. Export is an explicit backup; archive retains history. Clearing a worktree never deletes the independent library.

Use existing draft-first release controls and record actual remote state before publication and after it. A failed release is reconciled against tag/Release/canonical identity before any retry. After a public release, preserve tags, published notes and assets; address defects through an appropriate new repair version and verify its installation. Record actual discovery/installation or data-recovery regressions with affected version, scope and corrective PR. This Epic creates no scheduled monitoring or notification automation.

## §7 Change history

| Version | Date | Verification scope | Summary |
| --- | --- | --- | --- |
| v1.0 | 2026-10-12 | Source/intake/document structure; new runtime NOT_RUN | Contract acceptance matrix, actual intake facts, strict-window staged-entry policy, six delivery PRs and two closeout PRs; Refs #210 and Epic #209 |
