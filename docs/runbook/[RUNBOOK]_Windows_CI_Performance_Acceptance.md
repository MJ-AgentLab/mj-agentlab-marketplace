---
type: runbook
scope: marketplace
summary: "Issue 245 staged Windows CI performance acceptance and evidence"
owner: marketplace-maintainers
created: 2026-10-15
updated: 2026-10-16
state: active
version: v1.3
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

PR1 implementation base: `b1937b26dfe33ecabc55e9e88d692e9a5f0aa90b`, the actual #244 merge. Its tree matches the tested repair head `ffdc03e8b876b6cf068645901dcca2ab97e6ece9`; this identity match is not a claim that the merge was newly tested. The repair-head Windows evidence has 349 passing tests and thirteen successful smoke scenarios. The older 346-test performance history remains historical evidence.

PR2 implementation base and frozen denominator: actual [#246](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/246) merge `30665998dda2ebbbae1806b946ec63f840bd98e0`, tree `20f540fcabba740e549ecdbf01cf78f2ce3473f5`. It is byte-identical to the tested head `ed94d7fcc030989f647362f143133ca61362ae60` and PR test merge `8a4512ba3c0575f2954e55a305aeb3ef57034b1f`. The merge occurred at 2026-10-16 00:25:46 Asia/Taipei. GitHub returned an empty reviews list; record the actual merge without inferring a missing non-author approval. Subsequent PRs retain normal review and protection gates. A same-tree comparison is not a new full-test run of the actual merge.

PR3 implementation base: actual [#247](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/247) merge `02724de060543ff587d07ac713e3f299a8f91407`, tree `ebf37fd92a63fa67983eff2fc08293d174bbeabc`, merged by ranzuozhou at 2026-10-16 02:12:35 Asia/Taipei. The tested head `7f109a13a52817e09d1d69fa5461083e1d7fc6de` and PR test merge `ef5555aba97ba62a8cd6c3cc2edb39654f7bcbed` have this same tree. GitHub still reports `reviews=[]` and `reviewDecision=REVIEW_REQUIRED`; actual merge does not establish an approval or a waiver. The performance denominator remains the PR1 merge `30665998`, never the PR2 merge.

The expanded inventory is **at least 22 complete-docs copies**: canonical 7, portable validation 8, HTML 5, icons 2. Earlier #245 analysis counted at least 21; one HTML call site expands into two parameterized tests. Smoke separately prepares thirteen full sources. Record call sites and runtime expansion separately.

## 3. Profiling and benchmark procedure

`MJ_PERF_DIR` enables per-process NDJSON phase reports. Without it, profiling creates no report and changes no normal JSON/stdout contract. Record elapsed time for copy, Git initialization/add/commit, worktree creation/removal, validation, installation and cleanup, including test after hooks. An operation's `ok/error` metric is not the semantic result of an installation callback or a test assertion.

PR1 `fixtureCopiedBytes` counts controlled-file checkout content for tagged copies: a lower bound excluding untracked/generated files, not actual disk I/O. PR2 must report actual candidate copied bytes and generated fixture totals separately. The 95% gate uses actual candidate copies divided by the controlled baseline lower bound, a conservative lower bound on the true reduction; missing actual candidate totals cannot pass. Existing Python caches exposed this distinction during draft review; do not rename the controlled count into an actual-copy result.

The benchmark entry uses a separate pull-request labeled workflow: `perf-245`, same repository, base develop and a `codex/issue-245-` head. It uses the actual PR merge SHA, read-only checkout permissions and no privileged pull-request-target execution. The Agent applies the label; no Owner console operation is required. Main CI, canary and release scheduling stay unchanged in PR1.

PR1 starts in baseline-only mode. After its actual protected merge, freeze that complete SHA/tree in `config/ci-performance-baseline.json`; do not substitute a moving branch or reset the denominator in later PRs. Baseline-only output must not claim a speed improvement. If changed runtime or source contracts make comparison inequivalent, record the invalidation and establish an equivalent instrumented baseline before accepting new results.

Run baseline and candidate serially on the same Windows runner, with the same tools, source volume and cache policy. Record image, Node/Python/Git/Codex versions and available/resolved parallelism. Use a fresh temporary fixture/home/cache per command; do not prebuild measured fixtures or smoke sources. Alternate ordering to reduce warm-cache bias; record that operating-system file caching remains uncontrolled.

At least three rounds compare baseline default with candidate default/1/2. Run baseline only once per round, not once for each candidate configuration. Measure canonical as its whole isolated test-file process, and smoke as its whole thirteen-scenario process. Outer wall time includes internal source validation/preparation, all installation and finally/after cleanup through process exit. Benchmark worktree checkout, dependency installation and external inventory collection are separate overheads, not deductions from measured commands.

The existing `npm test` stays unchanged. Explicit concurrency uses `npm run test:concurrency-1` and `npm run test:concurrency-2`, with Node's option before the test-file glob. Actual isolated runner probes verify the effective option; merely observing a successful command or inspecting an argument array is insufficient. Runtime-equivalence checks include the complete `.agents` input, so unrelated development-skill contract changes also invalidate comparison.

PR2 uses `--stage fixtures`: three alternating baseline/candidate pairs of the unchanged default full-test command, six samples on the same pinned Windows runner. Only the 95% copy gate may yield `fixtures_pass`; core acceptance remains deferred, with no concurrency selection or speed-gate PASS. Other stage branches keep the default core plan, which requires all four gates and the complete concurrency comparison. This stage split does not lower any core threshold.

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
| PR1 implementation | MERGED, SAME TREE | #246 actual merge 30665998, tree 20f540fc; original implementation base b1937b26. Empty reviews remain separately recorded. |
| PR1 initial local instrumentation checks | PASS, WORKING SNAPSHOT | Full `npm test`: 354/354, zero failures/skips, 451206.4497 ms; original 349 plus five metrics tests. This run preceded final harness fixes and copy-accounting tags; final committed-head CI remains required. |
| PR1 local regression checks | PASS, WORKING SNAPSHOT | Final benchmark 13 + metrics 5 + release-cleanup 3 + documentation 10 = 31/31; earlier run-cli 16/16. Node 22.18.0, Python 3.12.13, Codex 0.147.0; this is not the pinned hosted benchmark environment. |
| PR1 real local smoke with profiling enabled | PASS, WORKING SNAPSHOT | 13/13 scenarios, six installed diagram Python validations and six installed Learning Evidence Python validations; 303 phase records, zero operation errors, thirteen cleanup records. Final committed-head hosted verification remains separate. |
| PR1 independent review round 1 | FINDINGS, REPAIRED | P1: trailing concurrency options did not establish effective scheduling. P2: interrupted worktree-add registration cleanup. P2: repository-copy accounting included a separate partial-brand fixture. Original findings retained; fixed scripts, registered-worktree cleanup and explicit repository-copy tags now have regressions. |
| PR1 independent review round 2 | NO BLOCKING FINDINGS | Independent Agent re-read the complete diff and ran final benchmark regressions: 13/13, zero failures/skips. This does not replace hosted CI or a GitHub non-author approval. |
| PR1 copy-domain follow-up | REPAIRED, LOCAL 32/32 | PR2 draft review exposed generated Python caches outside the controlled inventory. Explicitly identify PR1 counts as a lower bound; actual candidate copy totals are now required for the 95% gate. The first independent 13/14 run exposed an obsolete missing-value assertion; corrected to the actual-byte field, then benchmark 14 + metrics 5 + cleanup 3 + docs 10 passed 32/32. The first hosted attempt on head 53f7f5c remains an earlier source, not final-head evidence. |
| PR1 hosted engineering | PASS | PR/push Windows each 368/368, zero fail/skip; Ubuntu each 368 total, 367 pass, one existing Windows-only skip; all thirteen real smoke scenarios per job. PR/push Windows test steps 19m24s/18m22s, smoke 3m11s/3m9s. Each Windows job executes six installed Diagram checks and six Learning groups (18 lek.py calls), all exit zero. |
| PR1 hosted benchmark entry | PASS, BASELINE ONLY | Run 38751596782 completed all nine samples. Full-test rounds each 368/368, canonical each 7/7, smoke each 13/13. No timeout or harness failure; final owned-worktree cleanup passed. |
| Frozen performance baseline | FROZEN | config/ci-performance-baseline.json pins actual merge 30665998 and tree 20f540fc. Future acceptance reruns it beside the candidate in the same environment. |
| PR1 actual-merge installation | PASS | Fresh exact 30665998 canonical verification on 2026-10-16 00:29:01–00:31:24 Asia/Taipei: full-source strict validation and thirteen actual installations, six installed Diagram checks and six Learning groups. Log SHA-256 a281d227c9ef536cd9b45d9cac5e68629955b76f92e4f2f79f760481393ee108. |
| PR2 fixture implementation | MERGED, SAME TREE | #247 actual merge 02724de0; shared test-only builder, original assertion mapping and nine new boundary cases. Tested head and PR test merge share tree ebf37fd9. Empty reviews remain recorded separately. |
| PR2 local fixture checks | PASS, WORKING SNAPSHOT | Latest nine boundaries plus four original suites: 81/81, zero failures/skips, 64.814 seconds; original assertion lines 25/80/59/54 unchanged and 29 canonical worktree create/remove pairs retained. Full-suite and hosted checks remain separate. |
| PR2 full local engineering | PASS, WORKING SNAPSHOT | npm test 382/382, zero failures/skips, Node TAP duration 65674.828 ms; profiling enabled, REQUIRE_PYTHON/PWSH=1. Real profile aggregation confirms 22 roots and all counters. Harness 19/19, documentation 10/10, validate and exact Codex 0.147.0 check pass. This is the local Node 22.18.0 / Python 3.12.13 environment, not hosted paired acceptance. |
| PR2 independent Agent review | NO BLOCKING FINDINGS | Separate Spec/correctness and Standards reviews of the complete diff; original assertions, counters, fixture/core stage separation and scope verified. This is not a GitHub non-author approval. |
| PR2 exact candidate installation | PASS | Exact head 7f109a13 on 2026-10-16 00:42:16–00:44:35 Asia/Taipei: 13/13 canonical real installations, six installed Diagram checks and six Learning groups, zero command failures. Log SHA-256 a3e5e46d61aab7e356fe55bdf9d65b40134779c54e27788f6363068b26b14ce6. |
| PR2 hosted engineering | PASS | PR 38771466668 and push 38771457469 both successful: Windows 382/382, Ubuntu 381 pass plus one existing Windows-only skip; all four jobs 13/13 actual smoke scenarios, six installed Diagram checks and six Learning groups each. See §5.3 and compact receipt. |
| PR2 staged copy acceptance | PASS, FIXTURES ONLY | Run 38771487907 completed six same-runner samples; every candidate has 22 roots and 69,933,534 actual copied bytes. Conservative reduction 99.447896% exceeds 95%; independent raw-profile audit passed. Core speed/concurrency remain deferred. |
| PR2 actual-merge installation | PASS | Fresh exact 02724de0 verification on 2026-10-16 02:17:32–02:19:50 Asia/Taipei: 13/13 actual canonical installations, six installed Diagram checks and six Learning groups with valid replay/structure, zero command errors, Codex 0.147.0. Log SHA-256 f58e627a767c3cabbe87b2b7e2c4eae882b3aafdd4f8ad10038eece768e43de0. This is not a new full-test run of the actual merge. |
| PR3 smoke source implementation | IN_PROGRESS | Isolated codex/issue-245-smoke from actual PR2 merge; real-source template, thirteen independent contexts, original validation and Python contracts retained. Initial two static coverage gaps, the 23-case supplement and actual rerun are recorded in §5.4. |
| PR3 first targeted regression | 18 PASS / 5 PRECONDITION FAIL / 0 SKIP | First 23-case attempt took TAP 45143.6767 ms. A concurrent documentation write added the compact receipt link before its file existed, so five cases (19–23) failed full-source validation before fault injection. Their intended paths were NOT_RUN in that attempt; original failed log is retained. The subsequent complete rerun is separate. |
| PR3 complete targeted rerun | PASS, WORKING SNAPSHOT | Stable-source rerun on 2026-10-16 02:24:12.925–02:25:02.843 Asia/Taipei: 23/23, zero failures/skips, exit zero; process wall 49917.452 ms and TAP 49881.2414 ms. All five previously blocked intended paths executed and passed. No implementation/test repair was needed. Operation doubles do not establish actual Codex/Python acceptance. |
| PR3 complete local suite | PASS, WORKING SNAPSHOT | 405/405, zero failures/skips/cancellations, TAP 70328.4381 ms; 3,396 profile events, approved 22 original fixture roots and unchanged valid copied/synthetic/overlay/total counters. Node 22.18.0 / Python 3.12.13; not the pinned hosted benchmark. |
| PR3 real local CLI smoke | PASS, WORKING SNAPSHOT | Fresh npm run smoke:codex on 2026-10-16 02:28:58.816–02:29:53.396 Asia/Taipei: 13/13, actual Codex 0.147.0, six installed Diagram checks and six valid Learning groups; zero command/phase errors, all fourteen cleanups successful. Process wall 54575.2803 ms; no hosted speed acceptance inferred. |
| PR3 independent Agent review | NO BLOCKING FINDINGS | Separate Spec/correctness and Standards reviews cover the complete eight-file change. This does not establish a GitHub non-author approval. |
| PR3 original exact candidate installation | PASS, HEAD 5faf67f ONLY | Exact 5faf67f/tree 1c5bc470 on 2026-10-16 02:33:31.662–02:34:33.213 Asia/Taipei: 13/13 actual Codex 0.147.0 installations, six installed Diagram checks and six valid Learning groups, zero command/phase errors and fifteen cleanups successful including the outer canonical worktree. This does not validate the later one-line repair. |
| PR3 original hosted engineering | PASS, HEAD 5faf67f ONLY | PR run38787257881 and push38786853355 succeeded: Windows each405/405, Ubuntu each404 pass/one existing Windows-only skip; all four jobs13/13 smoke with six Diagram and six valid Learning groups. PR jobs actually check out a7e6b1b, push jobs5faf67f, all tree1c5bc470. A6 run38787258161 passed; later current-head gates remain required. |
| PR3 first core comparison | NOT_ACCEPTED, INCOMPLETE | Run38787278684 attempted2/24 samples, only one successful. B368/368 passed; O404/405 failed the single-read observer (0 observed,1 expected) through RUNNER~1/native-path mismatch. Both final owned worktrees cleaned successfully; no sample timeout. All four gates remain not_measured and concurrency remains null. See §5.5 and the preserved receipt. |
| PR3 short-alias repair | LOCAL RED/GREEN, WORKING SNAPSHOT | Original5faf67f fails the existing strict test through an actual local8.3 alias (exit1); fs.realpathSync.native canonicalization of test REPO alone passes the same invocation (exit0). reads===1 is unchanged. This is not a repaired final-commit or hosted result. |
| PR3 repaired final candidate / ordinary CI | NOT_RUN | New full-suite, exact-candidate thirteen-installation/Python and ordinary hosted checks remain required for the new committed source; original5faf67f results cannot be relabeled as repaired-head evidence. |
| PR3 fresh full core comparison | NOT_RUN | Requires a fresh complete24-sample comparison, all four gates and default/1/2 selection. Do not replace the failed sample or reuse the incomplete run as three-round acceptance. Windows adoption still awaits valid measurements; Linux default stays. |
| PR4-PR5 / final Issue closure | NOT_STARTED | Main-CI scheduling remains separate; Issue stays open. |

Local logs remain outside the checkout. Initial full-test log SHA-256: `d8a58e6d748bbcb6d42227afc625c09121934aace7aa30b4f54faa028f0caf5d` (80,933 bytes); profiling-enabled smoke stdout SHA-256: `d6ddbd9eb4fea874c5f75471a4589abc5fea8d4f16e630d549098f7f5a7a9688` (324,246 bytes). These working-snapshot checks are not a substitute for the final commit's required CI.

### 5.1 PR1 measured observations

[PR CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38751562174), [push CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38751552478), and [three-round observation](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38751596782) all succeeded on the stated final source. The performance report is `baseline_only`, `frozenBaseline=false`; its historical observations do not establish a speed improvement or replace a new paired comparison.

| Complete command | Three wall times, seconds | Median | Range |
|---|---|---:|---|
| npm test | 1053.087 / 873.900 / 871.425 | 873.900 | 871.425–1053.087 |
| Canonical test file | 882.137 / 739.054 / 675.090 | 739.054 | 675.090–882.137 |
| Thirteen-scenario smoke | 156.510 / 139.170 / 149.457 | 149.457 | 139.170–156.510 |

Environment: Windows image `20260925.250.1`, Node 22.23.3, Python 3.12.10, Codex 0.147.0, Git 2.55.0.windows.5, npm 10.9.9, Intel Xeon Platinum 8370C, four available logical processors, default file concurrency three. Source: 6,065 controlled files, 575,546,324 content bytes; checkout 575,777,560 bytes. Each full round's tagged repository-input lower bound is 12,666,735,598 bytes; canonical is 4,030,348,588 bytes. Each raw profile expands docs inputs 7/8/5/2 = 22; PR2 additionally records explicit fixture-root identities. OS file caching is uncontrolled.

Each full-test profile contains two expected injected cleanup errors from passing persistent-lock/EACCES regressions. Independent canonical/smoke and final owned cleanup succeed; do not call all raw cleanup events error-free. The old head 53f7f5c attempt was superseded and manually cancelled with nine planned/zero complete samples, not silently substituted as a successful round. Its report SHA-256 is `51d005e8d4a11ad7bbb3ea87e62df65e99bd3b863a4b8c725d0b3f118f8c162f`.

Complete artifact 11989850027 expires 2026-11-14T16:01:09Z. Report SHA-256: `d6645c961903237abc01e1ead328b14101d00317aa06809b49214757f24aabe7`; ZIP: `bbc183a83cf26269df9a3894834a9db1efbe5a14a07d09b139eeed8c9f61019f`; independent numerical receipt: `a5e6177bc9c1719ed5f612aa1837d4e70163694e12a340dcf1528f793d6a8e6d`. Engineering receipt: `db295ac8eb0228fbd507a74ae81d6dfdd3a07a1d10832af66a5163a38f2894aa`. Raw logs stay outside Git; these compact numbers and identities remain after artifact expiry.

### 5.2 PR2 coverage and preparation

The shared test-only builder copies real plugins, repository skills/catalog, VERSION, .gitattributes and the exact 44-file brand closure. It generates four clearly synthetic root documents and fourteen explicit contract link targets, then calls the unchanged production validator. It excludes historical evidence and unrelated repository trees. Complete real-source validation and thirteen real-source installations remain separate; smoke preparation is unchanged until PR3.

Only ordinary generated caches directly beneath the two known Python script roots are omitted. Symlinks/junctions are rejected before cache exclusions; HTML extra files, cache-looking directories and empty illegal skill directories remain visible. Actual copied bytes, synthetic write bytes, signed overlay delta and complete prepared fixture bytes are distinct. Final metrics use the last successful total for each suite/root after the canonical local overlay, before Git initialization.

The [coverage map](evidence/ci-performance-245-fixture-coverage.json) records all 22 existing fixture preparations, original destructive cases, preserved assertions and new boundary cases. Local fixture numbers do not substitute for hosted three-round acceptance. The helper never fabricates missing real runtime/brand resources or arbitrary new documentation targets.

Local profiled preparation of the 22 original fixtures reports 69,933,534 verified input-copy bytes, 119,020 synthetic-write bytes and 70,094,295 final fixture bytes. The signed canonical-overlay delta is +41,741 bytes. A normal fixture contains 3,178,797 copied plus 5,410 synthetic bytes, total 3,184,207. These are actual checkout measurements, not the earlier 3,172,762-byte controlled-source estimate. They are working-snapshot observations, not the hosted paired 95% gate. The new growth boundary adds at least 1 MiB of synthetic evidence to an isolated source and confirms prepared copy/synthetic/total counts remain constant; it does not write original historical evidence.

Full local test-log SHA-256: `44e95440715eaa1c102ecfff6120dc8148f4b5177b69cc6e98410b7754c160c8`. Its measured 3,036 copied files plus 396 synthetic files give 3,432 prepared files across the 22 original fixtures. Additional boundary-test fixtures are excluded from this approved 22-fixture copy criterion and remain included in whole-command elapsed time. No local timing ratio is presented as a hosted speed-gate PASS.

### 5.3 PR2 hosted acceptance and actual merge

[PR CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38771466668), [push CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38771457469), and [six-sample copy acceptance](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38771487907) succeeded. The [compact receipt](evidence/ci-performance-245-pr2-hosted.json) preserves exact sources, per-sample numbers, environment, hashes and actual merge/review facts. Raw NDJSON, logs and ZIP remain outside Git.

| Complete default npm test | Baseline wall seconds | Candidate wall seconds |
|---|---:|---:|
| Round 1 | 1411.639 | 173.969 |
| Round 2 | 1186.446 | 158.265 |
| Round 3 | 1285.769 | 186.923 |
| Median | 1285.769 | 173.969 |
| Range | 1186.446–1411.639 | 158.265–186.923 |

All six commands completed in serial order B1/O1/O2/B2/B3/O3, without timeout, cancellation, skip or failed test. Baseline rounds pass 368/368 and candidate rounds 382/382. Each baseline tagged-copy lower bound is 12,666,735,598 content bytes; each candidate independently reconstructed profile reports 22 roots (canonical 7, portable 8, HTML 5, icons 2), 69,933,534 actual copied bytes, 119,020 synthetic-write bytes, +41,741 overlay delta and 70,094,295 prepared bytes. Copy reduction has conservative lower bound **99.447896%**, passing the 95% gate. Status is only `fixtures_pass`, `coreAcceptance=deferred`, `selectedConcurrency=null`.

The observed whole-command median reduction is 86.469684%; this is not formal core speed acceptance. No independent canonical/smoke command timing or 1/2/default comparison was performed in this stage. Timing includes internal preparation and cleanup through process exit; outer benchmark worktree setup, npm ci and inventory are separately recorded overheads. Input-content bytes do not measure physical disk I/O; baseline copied bytes remain a controlled-checkout lower bound.

The paired runner reports Windows image `20261007.264.1`, Node 22.23.3, Python 3.12.10, Codex 0.147.0, Git 2.56.0.windows.2, npm 10.9.9, Xeon Platinum 8573C, four available logical processors and resolved default concurrency three. OS file caching is uncontrolled. Hardware identities are runner-reported, not independently sampled telemetry. Every full sample retains two expected injected cleanup errors from passing persistent-lock/EACCES regressions; all three related cleanup tests pass, and both final owned worktrees are successfully removed. Do not call all phase operations error-free.

The ordinary PR/push Windows test steps take 114/218 seconds (TAP 113343.8402/216351.5107 ms) and smoke steps 122/275 seconds. Each Windows job actually executes six installed Diagram checks and six Learning groups. Ubuntu uses Python 3.12.15 in ordinary CI, distinct from the fixed benchmark 3.12.10; its one skip is the existing Windows-equivalent file-casing test. Windows log SHA-256 values are `bc4d6a49dea39735ce29d4bb1a635adbe4f92a8a266ad4c541701b1c81418fe5` (PR) and `5924aaa8b92d2873356c7dd1ec24625abcf173592b6090c97b91e2537544092a` (push).

Artifact [11995448259](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38771487907/artifacts/11995448259) expires `2026-11-14T17:59:27Z`. Report SHA-256: `088d566898ee6d24f43af566464a6e99ffeab7639a6d56d881e7bee117c2857e`; ZIP: `c33ad2710f11860a1dddac7f3413cc632f1c6885a996d92b005886ff77ac8767` (matches the GitHub API digest); job log: `5d0c781e2ebae9c02044b9aca5bf25db70bfd393ece63314aa1dbb3b537a9139`. Independent raw-profile audit receipt SHA-256: `86228895c03639255ad5261578b470eea9d9dd39def0241d29eb32b89bc92af9`. The auditor reconstructed counters and root multiplicities from raw NDJSON; removed temporary targets cannot be rehashed from the artifact. Actual merge and empty reviews are separate facts from technical acceptance; subsequent review/protection gates remain unchanged.

### 5.4 PR3 source preparation and pending coverage

Formal implementation begins from actual PR2 merge `02724de0`. Complete original-repository validation remains before preparation. One immutable inventory of real source bytes covers `.agents`, `plugins`, `AGENTS.md`, `.codex`, `VERSION` and `.gitattributes`; no PR2 synthetic document fixture enters the installation source. The Learning record JSON is read once from the original source with basic shape validation, followed by the unchanged installed Python checks. Only ordinary generated caches directly in the two explicit Python roots are excluded; links/cache junctions fail, other extra files remain visible.

The single template is never initialized as a Git repository or passed to Codex. All thirteen scenarios retain separate source Git repositories, homes, Codex homes/caches, consumer directories and temporary/environment paths. Success removes contexts unless `keepRoot` requests retention; only complete success and successful template cleanup permit retaining all thirteen. Failures remove prior retained/current contexts and the template; combined operation and cleanup failures preserve both errors.

Initial independent static draft review recorded two material coverage gaps: the separate source helper lacked direct link/cache-boundary, destination ownership/type and source-during-copy regressions; the smoke lifecycle lacked context/materialize-before-runner, `ok:false` and post-success integrity-failure cleanup cases. Fifteen supplemental cases retain the original eight and bring the suite to **23**. They were all NOT_RUN in the draft; the complete formal rerun now passes 23/23. Source projection and lifecycle regressions remain separate from actual Codex/Git/Python acceptance. A static review and operation doubles do not establish executed installation or Windows performance acceptance.

The first targeted attempt passed eighteen cases and failed five full-source preconditions before their intended fault injections because a concurrent documentation update temporarily referenced the not-yet-written compact receipt. Its TAP duration is 45143.6767 ms; filesystem log-envelope timestamps are 2026-10-15T18:20:29.802Z–18:21:14.977Z, not separately instrumented process start/end. Original log SHA-256: `d0335d0b8c4664ee06b6e0c9963a3d46ac8eee04f0e2f7b1f7076dd69a9a3e80`. No source-helper behavior failure is inferred, and validation was not relaxed.

After completing and validating the documentation set, all 23 cases reran without concurrent writes. Exact orchestrating-process timestamps are 2026-10-15T18:24:12.925Z–18:25:02.843Z, wall 49917.452 ms, TAP 49881.2414 ms; 23 pass, zero fail/skip, exit zero. All five previously blocked injections now executed and passed. No implementation/test repair was needed between attempts. Final log SHA-256: `6cdd16fb4d5929f8462aec1ce59965454558192e90675ed5fc1b7e3806c62a06`. Both original logs and summaries remain outside Git; targeted lifecycle evidence is separate from the subsequent actual installation checks.

The complete local working-snapshot suite then passes **405/405**, zero failures/skips/cancellations, TAP 70328.4381 ms. Its 3,396 profiling events preserve all 22 original fixture roots (7/8/5/2), 69,933,534 copied bytes, 119,020 synthetic-write bytes, +41,741 overlay delta and 70,094,295 prepared bytes. Full-test log SHA-256: `8c8e0d77a10ff3dfd156460c8c47e085178b9d4feb881d67f9a5f9069309c221`.

Fresh real npm run smoke:codex completes **13/13** with Codex 0.147.0, six installed Diagram Python checks and six Learning groups with replay/structure valid, zero command errors and zero phase errors. All fourteen cleanups succeed. Exact process timestamps are 2026-10-15T18:28:58.8164413Z–18:29:53.3961914Z; npm wall duration is 54575.2803 ms. The fourteen source-copy events cover one template and thirteen independent scenario sources, each 97 files / 1,027,296 content bytes, total 14,382,144 copied content bytes. This does not measure physical disk I/O. Smoke log SHA-256: `60d69461ebf65294b692291157e2b7e086305ad6db732c6c5b4b5a222f705cb9`.

These local checks use Node 22.18.0 / Python 3.12.13 and the same implementation throughout. At the v1.2 commit, final committed-candidate installation, hosted engineering and the pinned complete core comparison were NOT_RUN; subsequent original-head results and the first failed core attempt are recorded in §5.5. The repaired candidate still requires its own fresh verification. Separate complete-diff Spec/correctness and Standards reviews reported no blocking findings on the original eight-file snapshot; this did not predict the later short-alias observer failure or replace GitHub approval.

No concurrency adoption or core speed PASS is claimed. The upcoming complete 24-sample comparison keeps the PR1 frozen denominator and all four thresholds; any source-integrity, timeout, cleanup or incomplete-round failure remains visible. If the exact candidate selects default, retain main CI's existing npm test command. A selection of one or two wires only Windows to the existing corresponding concurrency script; Linux default and event scope stay unchanged. Any resulting new Git tree requires ordinary CI and a fresh complete 24-sample run for that final exact candidate. Preserve the initial selection run under its real source identity; accept core delivery only when the adopted configuration matches the final selection and all four gates pass. Main-CI cancellation/deduplication, runtime/versions, public entries, production validation and release behavior remain outside PR3 changes.

### 5.5 PR3 first core failure and short-alias repair

The original [PR3 #248](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/248) head is `5faf67fa6550f0f4a8cc9a3004915165807ad260`, tree `1c5bc4705e1dfde4ffebef24ad9b7a8d989c4be8`. Its exact thirteen-installation verification passed at UTC2026-10-15T18:33:31.662Z–18:34:33.213Z; log SHA-256 `9fda48d0c159a44530e7bc703e9bb222c62cf53a1b33153f3ddae8edafdd84a6`. The separate ordinary [PR](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38787257881) and [push](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38786853355) CI runs passed. Their Windows test/smoke steps took195/52 seconds and170/147 seconds respectively; these cross-job observations do not establish paired performance acceptance. The actual PR checkout is temporary merge `a7e6b1b4227282a78950bba50daf29b8a4f3bb69`, with the same tree. Neither the original ordinary-CI success nor the exact installation covers the subsequent repair.

The [first core run38787278684](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38787278684), job116602423217, then failed. The [compact authentic receipt](evidence/ci-performance-245-pr3-core-attempt1.json) preserves sources, raw numbers, all four unmeasured gates, cleanup and actual local reproduction. Its candidate is that temporary PR merge a7e6b1b/tree1c5bc470; the frozen denominator remains actual PR1 merge30665998/tree20f540fc. It planned24 samples, attempted only2, and has only1 successful sample:

| Attempted full-test command | Actual result | Whole command wall | Copy content measurement |
|---|---|---:|---:|
| B/default round1 | 368/368, exit0 | 1512815.6194ms | 12,666,735,598 bytes controlled-checkout lower bound |
| O/default round1 | 404 pass/1 fail of405, exit1 | 230775.0608ms | 69,933,534 actual input-copy bytes |

Both commands report no timeout and `profileError=null`. The candidate still reports119,020 synthetic bytes, +41,741 signed overlay delta and70,094,295 prepared bytes; these counters do not turn the failed/incomplete comparison into accepted performance evidence. The benchmark stopped without replacement samples. `fixtureBytes`, `test`, `canonical` and `smoke` are all `not_measured`, `selectedConcurrency=null`, and final cleanup of both owned source worktrees is `ok`. No median, speed PASS or concurrency choice can be inferred from this run.

The failed existing test is `real projection copies exact source bytes without synthetic documents and captures the record once`, assertion at `tests/smoke-source.test.mjs:67`: expected1 observed read, got0. The observer compared a lexical root containing `RUNNER~1` with the production helper's native long path `runneradmin`; it missed the same file read. This is a test-path identity failure, not a command timeout or evidence that production skipped the record.

An actual local8.3 alias invocation reproduces the failure on original5faf67f at UTC2026-10-15T19:12:22.0356155Z–19:12:22.5208487Z, exit1, wall480.7645ms. The sole working test change canonicalizes `REPO` with `fs.realpathSync.native(path.resolve(import.meta.dirname, ".."))`; the same alias invocation at UTC19:12:57.4876961Z–19:12:58.5734769Z exits0, wall1082.4087ms. The strict `reads === 1` assertion and production code remain unchanged. Red log SHA-256: `5dc8be06a5bda9674853e3b7ea3cb59e4aa74b1f2566d2b86ef0087cdee3313a`; green: `36f88e92a72e50ad72377de1138c88dd18f02a21edd3498841ec43abc7e84150`. This verifies only the working one-line repair through that actual short alias; it is not final-commit, full-suite or hosted acceptance.

The failed runner reports image20261007.264.1, Node22.23.3, Python3.12.10, Codex0.147.0, Git2.56.0.windows.2 and npm10.9.9, AMD EPYC7763, four available logical processors and default concurrency3. Keep this environment separate from the earlier Xeon8573C copy-only run. Artifact[11999953850](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38787278684/artifacts/11999953850) expires `2026-11-14T19:08:50Z`; ZIP SHA-256 `eb904e506928102d9c2d02c520b3fc1f3c4cf7341060f0debcb8fbdb4e85e7dd`, report `9a897ace804f0ed6cab2f62aa219a72ba06316b0de263e97e76f4464cdff1b30`, job log `7a406980c256d21f284cd47ad93d948b8dfefb9861b6bb87cbb8b9cc9ff77ab8`.

The repaired source's final commit identity, new full suite, exact thirteen-installation/Python verification, ordinary hosted CI and fresh complete24-sample core comparison are all NOT_RUN at this revision. Preserve the original failure and local red/green logs; never fill the failed round from a later run. PR3 remains incomplete; PR4/PR5 formal changes do not begin. Runtime/versions, frozen baseline and main-CI events/concurrency/cancellation/deduplication remain unchanged.

On regression, retain failure evidence and fix within the authorized stage or revert that stage through a normal protected PR. Never delete historical evidence or weaken acceptance to achieve a lower time.

## 6. Change history

| Version | Date | Summary |
|---|---|---|
| v1.3 | 2026-10-16 | Preserve original5faf67f exact-install/ordinary-CI success separately from the failed2/24 core attempt; record the actual Windows8.3 observer red/green reproduction and one-line test-root repair. All four core gates remain unmeasured; repaired-source final and fresh complete acceptance remain NOT_RUN. |
| v1.2 | 2026-10-16 | Record PR2 hosted copy acceptance, audit, actual merge and fresh installation with empty reviews; preserve PR3's first precondition failures, complete 23/23 rerun, local 405/405 and real 13-scenario smoke. Final committed/hosted/core-speed acceptance remains pending. |
| v1.1 | 2026-10-16 | Freeze actual PR1 merge, retain complete hosted observations and review limitations, and begin isolated minimal-fixture implementation and staged copy acceptance. |
| v1.0 | 2026-10-15 | Establish authorized stages, expanded inventory, performance gates and an initially unexecuted ledger. |
