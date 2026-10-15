---
type: runbook
scope: marketplace
summary: "Issue 245 staged Windows CI performance acceptance and evidence"
owner: marketplace-maintainers
created: 2026-10-15
updated: 2026-10-15
state: active
version: v1.0
last-verified: null
---

# [RUNBOOK] Windows CI performance acceptance

## 1. Authority and boundaries

[Issue #245](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/245) tracks the Owner-approved five-PR implementation. The Owner explicitly requested implementation on 2026-10-15. Agents perform technical operations, synthetic role exercises and independent verification; the Owner supplies only necessary information, substantive decisions and authorization. Reuse this authorization while scope remains materially unchanged.

Preserve plugin runtime bytes, manifests, public entries, versions, historical evidence originals, actual Python execution, strict validation and the release workflow. No release or ruleset change is part of this task. Keep the bounded asynchronous cleanup repair from [#244](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/244), including transient lock, retry exhaustion and unrelated-error regressions.

Native unanswered-window requirements remain strict: defaults, preselection, silence, timeout, closure and disappearance are not answers. Synthetic role results cannot establish persistent native-window visibility. An unsupported entry stays deferred; core delivery may proceed independently. This maintenance task does not reopen unrelated plugin client acceptance.

## 2. Stages and inventory

| Stage | Deliverable | Completion condition |
|---|---|---|
| PR1 | Opt-in phase metrics and controlled Windows benchmark | Existing engineering behavior preserved; benchmark entry actually exercised; exact source/environment/raw results recorded |
| PR2 | Shared minimal repository fixtures | Coverage mapping and true resource bytes preserved; copied fixture bytes reduced at least 95% |
| PR3 | Lightweight isolated smoke sources and measured concurrency | All thirteen scenarios and actual Python pass; all performance thresholds pass for the adopted configuration |
| PR4 | Cancel superseded PR runs in the main CI only | Actual scheduling evidence preserves newest PR, other PRs and other workflows |
| PR5 | Deduplicate push compatibility matrices | Actual scheduling and failure-path evidence preserve every PR merge-result matrix and required gates |

Stages merge sequentially into develop from separate worktrees. PR1-PR4 reference #245 without closing it. Close #245 only after the complete acceptance set and post-merge verification; otherwise retain an explicit unfinished/deferred state. Core delivery after PR3 is separate from whole-Issue completion.

Current implementation base: `b1937b26dfe33ecabc55e9e88d692e9a5f0aa90b`, the actual #244 merge. Its tree matches the tested repair head `ffdc03e8b876b6cf068645901dcca2ab97e6ece9`; this identity match is not a claim that the merge was newly tested. The repair-head Windows evidence has 349 passing tests and thirteen successful smoke scenarios. The older 346-test performance history remains historical evidence.

The expanded inventory is **at least 22 complete-docs copies**: canonical 7, portable validation 8, HTML 5, icons 2. Earlier #245 analysis counted at least 21; one HTML call site expands into two parameterized tests. Smoke separately prepares thirteen full sources. Record call sites and runtime expansion separately.

## 3. Profiling and benchmark procedure

`MJ_PERF_DIR` enables per-process NDJSON phase reports. Without it, profiling creates no report and changes no normal JSON/stdout contract. Record elapsed time for copy, Git initialization/add/commit, worktree creation/removal, validation, installation and cleanup, including test after hooks. An operation's `ok/error` metric is not the semantic result of an installation callback or a test assertion.

PR1 `fixtureCopiedBytes` counts controlled-file checkout content for tagged copies: a lower bound excluding untracked/generated files, not actual disk I/O. PR2 must report actual candidate copied bytes and generated fixture totals separately. The 95% gate uses actual candidate copies divided by the controlled baseline lower bound, a conservative lower bound on the true reduction; missing actual candidate totals cannot pass. Existing Python caches exposed this distinction during draft review; do not rename the controlled count into an actual-copy result.

The benchmark entry uses a separate pull-request labeled workflow: `perf-245`, same repository, base develop and a `codex/issue-245-` head. It uses the actual PR merge SHA, read-only checkout permissions and no privileged pull-request-target execution. The Agent applies the label; no Owner console operation is required. Main CI, canary and release scheduling stay unchanged in PR1.

PR1 starts in baseline-only mode. After its actual protected merge, freeze that complete SHA/tree in `config/ci-performance-baseline.json`; do not substitute a moving branch or reset the denominator in later PRs. Baseline-only output must not claim a speed improvement. If changed runtime or source contracts make comparison inequivalent, record the invalidation and establish an equivalent instrumented baseline before accepting new results.

Run baseline and candidate serially on the same Windows runner, with the same tools, source volume and cache policy. Record image, Node/Python/Git/Codex versions and available/resolved parallelism. Use a fresh temporary fixture/home/cache per command; do not prebuild measured fixtures or smoke sources. Alternate ordering to reduce warm-cache bias; record that operating-system file caching remains uncontrolled.

At least three rounds compare baseline default with candidate default/1/2. Run baseline only once per round, not once for each candidate configuration. Measure canonical as its whole isolated test-file process, and smoke as its whole thirteen-scenario process. Outer wall time includes internal source validation/preparation, all installation and finally/after cleanup through process exit. Benchmark worktree checkout, dependency installation and external inventory collection are separate overheads, not deductions from measured commands.

The existing `npm test` stays unchanged. Explicit concurrency uses `npm run test:concurrency-1` and `npm run test:concurrency-2`, with Node's option before the test-file glob. Actual isolated runner probes verify the effective option; merely observing a successful command or inspecting an argument array is insufficient. Runtime-equivalence checks include the complete `.agents` input, so unrelated development-skill contract changes also invalidate comparison.

Retain every attempted round. Failure or interruption cannot be filled in by silently selecting successful samples; repair and obtain a fresh complete comparison. Budget below the hosted-job limit, report incomplete rounds as incomplete, and retain diagnostics on failure. Detailed logs/reports are Actions artifacts with 30-day retention. Keep per-round numbers, environment, source identities, report hashes and links here so artifact expiration does not erase the numerical evidence. Do not commit repeated source snapshots or full logs.

## 4. Acceptance

| Metric | Required reduction relative to the frozen baseline |
|---|---:|
| Total copied bytes for the 22 repository fixtures | At least 95% |
| Windows whole test-command median | At least 50% |
| Whole canonical test-file command median, including cleanup | At least 80% |
| Whole smoke-command median, including preparation and cleanup | At least 30% |

The adopted candidate configuration must meet all gates with no timeout or cleanup failure in its complete acceptance rounds. Among valid configurations within 5% of the fastest test median, select the lower actual concurrency; the default resolves from the recorded host and is not a fixed number. Keep Linux's default unless a separate measured need is established.

Preserve original assertions by a coverage map rather than a test-count comparison. Retain real full-repository validation, missing/tampered resource rejection, SHA/dirty-checkout isolation, no premature installer call, boundary/junction rejection, cleanup, thirteen real installations and installed-cache Python. New regressions cover fixture independence, historical-evidence growth isolation, template/installation failures and keepRoot behavior. Synthetic documents are test-only and cannot replace actual installation sources.

PR5 may omit only the push compatibility matrix after finding an exact current-workflow/PR/head-repository/ref/SHA/base/latest-attempt match that is queued, running or successful. PR merge-result matrices always run independently. Forks, no match, missing permissions, query failure, timeout, incomplete pagination, pending external approval and ambiguous results run the full push matrix. Gate failure/missing output must not implicitly skip the matrix; a cancelled run must not start fresh matrix work.

Current develop service-required contexts are `Validate Structure` and `A6 / Check`; both baseline OS compatibility jobs additionally remain mandatory Agent engineering/merge checks. Record actual current-head non-author approval and resolved threads. Synthetic or independent Agent reviews do not fabricate a GitHub approval or bypass branch protection.

## 5. Execution ledger

| Item | Status | Evidence |
|---|---|---|
| Owner scope and thresholds | CONFIRMED | Conversation: minimum fixtures; two broad phases/five PRs; 95/50/80/30 reductions; queued/running/success PR deduplication |
| Historical analysis | VERIFIED | #245 preserves actual Actions samples and limitations |
| PR1 implementation | IN_PROGRESS | Isolated branch `codex/issue-245-metrics`, base b1937b26 |
| PR1 initial local instrumentation checks | PASS, WORKING SNAPSHOT | Full `npm test`: 354/354, zero failures/skips, 451206.4497 ms; original 349 plus five metrics tests. This run preceded final harness fixes and copy-accounting tags; final committed-head CI remains required. |
| PR1 local regression checks | PASS, WORKING SNAPSHOT | Final benchmark 13 + metrics 5 + release-cleanup 3 + documentation 10 = 31/31; earlier run-cli 16/16. Node 22.18.0, Python 3.12.13, Codex 0.147.0; this is not the pinned hosted benchmark environment. |
| PR1 real local smoke with profiling enabled | PASS, WORKING SNAPSHOT | 13/13 scenarios, six installed diagram Python validations and six installed Learning Evidence Python validations; 303 phase records, zero operation errors, thirteen cleanup records. Final committed-head hosted verification remains separate. |
| PR1 independent review round 1 | FINDINGS, REPAIRED | P1: trailing concurrency options did not establish effective scheduling. P2: interrupted worktree-add registration cleanup. P2: repository-copy accounting included a separate partial-brand fixture. Original findings retained; fixed scripts, registered-worktree cleanup and explicit repository-copy tags now have regressions. |
| PR1 independent review round 2 | NO BLOCKING FINDINGS | Independent Agent re-read the complete diff and ran final benchmark regressions: 13/13, zero failures/skips. This does not replace hosted CI or a GitHub non-author approval. |
| PR1 copy-domain follow-up | REPAIRED, LOCAL 32/32 | PR2 draft review exposed generated Python caches outside the controlled inventory. Explicitly identify PR1 counts as a lower bound; actual candidate copy totals are now required for the 95% gate. The first independent 13/14 run exposed an obsolete missing-value assertion; corrected to the actual-byte field, then benchmark 14 + metrics 5 + cleanup 3 + docs 10 passed 32/32. The first hosted attempt on head 53f7f5c remains an earlier source, not final-head evidence. |
| PR1 hosted benchmark entry | NOT_RUN | No native/Actions entry pass inferred from local simulation |
| Frozen performance baseline | NOT_ESTABLISHED | Requires actual PR1 merge SHA |
| PR2-PR5 / final Issue closure | NOT_STARTED | Sequential dependency and normal gates retained |

Local logs remain outside the checkout. Initial full-test log SHA-256: `d8a58e6d748bbcb6d42227afc625c09121934aace7aa30b4f54faa028f0caf5d` (80,933 bytes); profiling-enabled smoke stdout SHA-256: `d6ddbd9eb4fea874c5f75471a4589abc5fea8d4f16e630d549098f7f5a7a9688` (324,246 bytes). These working-snapshot checks are not a substitute for the final commit's required CI.

On regression, retain failure evidence and fix within the authorized stage or revert that stage through a normal protected PR. Never delete historical evidence or weaken acceptance to achieve a lower time.

## 6. Change history

| Version | Date | Summary |
|---|---|---|
| v1.0 | 2026-10-15 | Establish authorized stages, expanded inventory, performance gates and an initially unexecuted ledger. |
