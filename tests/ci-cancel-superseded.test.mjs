import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { parse } from "yaml";

const source = fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const workflow = parse(source), job = workflow.jobs["cancel-superseded"];
const script = job.steps[0].with.script;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
// Execute the actual privileged step, including its final invocation, without a live client.
const executeInline = new AsyncFunction("github", "context", "core", "require", "process", script);
const require = createRequire(import.meta.url);
const A = "a".repeat(40), B = "b".repeat(40), C = "c".repeat(40), D = "d".repeat(40);
const repoId = 1183002256, branch = "codex/issue-245-cancel";
const hash = text => crypto.createHash("sha256").update(text).digest("hex");
const apiError = (status, message = "API failure") => Object.assign(new Error(message), { status });
function content(text = source) {
  const bytes = Buffer.from(text);
  return { type: "file", name: "ci.yml", path: ".github/workflows/ci.yml", encoding: "base64", size: bytes.length,
    content: bytes.toString("base64") + "\n", sha: crypto.createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") };
}
function association(head = B, changes = {}) {
  return { number: 249, head: { ref: branch, sha: head, repo: { id: repoId } }, base: { ref: "develop", sha: C, repo: { id: repoId } }, ...changes };
}
function run(id = 200, number = 20, head = B, changes = {}) {
  return { id, workflow_id: 247197116, run_number: number, run_attempt: 1, event: "pull_request", repository: { id: repoId },
    head_repository: { id: repoId }, path: ".github/workflows/ci.yml", head_branch: branch, head_sha: head, status: "in_progress", conclusion: null,
    display_title: `ci-v1|event=pull_request|pr=249|repo=${repoId}|headrepo=${repoId}|head=${head}|baserepo=${repoId}|base=${C}|target=develop`, pull_requests: [], ...changes };
}
function scenario({ current = run(), candidates = [run(100, 19, A)], liveHead = B, override = {} } = {}) {
  const live = { number: 249, state: "open", head: { sha: liveHead, ref: branch, repo: { id: repoId } }, base: { sha: C, ref: "develop", repo: { id: repoId } } };
  const context = { eventName: "pull_request", runId: current.id, repo: { owner: "MJ-AgentLab", repo: "mj-agentlab-marketplace" },
    payload: { repository: { id: repoId }, pull_request: structuredClone({ ...live, head: { ...live.head, sha: current.head_sha } }) } };
  const calls = [], logs = [], runs = new Map([current, ...candidates].map(item => [item.id, item]));
  let prReads = 0, runReads = 0;
  const github = { rest: {
    pulls: { get: async input => { calls.push(["getPr", input]); return { data: override.getPr ? await override.getPr({ live, prReads: ++prReads, calls }) : live }; } },
    repos: { getContent: async input => { calls.push(["source", input]); return { data: override.source ? await override.source({ input, calls }) : content() }; } },
    actions: {
      getWorkflowRun: async input => { calls.push(["getRun", input]); return { data: override.getRun ? await override.getRun({ input, current, candidates, runs, runReads: ++runReads, calls }) : runs.get(input.run_id) }; },
      listWorkflowRuns: async input => { calls.push(["list", input]); return override.list ? await override.list(input) : { data: { total_count: candidates.length, workflow_runs: candidates }, headers: {} }; },
      cancelWorkflowRun: async input => { calls.push(["cancel", input]); return override.cancel ? await override.cancel({ input, calls }) : { status: 202 }; },
    },
  } };
  return { current, live, context, github, calls, logs, async execute() {
    return executeInline(github, context, { info: item => logs.push(item) }, require, { env: { GITHUB_RUN_ATTEMPT: String(current.run_attempt) } });
  } };
}
const cancelled = s => s.calls.filter(([op]) => op === "cancel").map(([, input]) => input.run_id);

test("the read-only dedup wrapper preserves the independent cancel job and complete merged CI", () => {
  assert.equal(workflow.name, "CI — Validate Plugin Structure");
  assert.equal(hash(JSON.stringify(workflow.on)), "cdd55fa680a07d98cd103c5b193ad9fd3c7e0c4dff66bafcb0b2f14e80f36e98");
  assert.equal(hash(JSON.stringify(workflow.jobs.validate)), "8173b3512724ea21c81ed5607656be141a0d72f520a3854708b047da010eaa12");
  const { needs, if: matrixIf, ...completeMatrix } = workflow.jobs["codex-compat"];
  assert.equal(hash(JSON.stringify(completeMatrix)), "fff03f9a2af52569280023e4c4c827ac841b5418de1ae755ee990ed07ab5d77d");
  assert.equal(needs, "deduplicate-push");
  const wrapper = "    needs: deduplicate-push\n    if: >-\n      !cancelled() && (github.event_name != 'push' || needs.deduplicate-push.result != 'success' || needs.deduplicate-push.outputs.skip_push != 'true')\n";
  assert.equal(matrixIf, "!cancelled() && (github.event_name != 'push' || needs.deduplicate-push.result != 'success' || needs.deduplicate-push.outputs.skip_push != 'true')");
  assert.equal(hash(source.slice(source.indexOf("  validate:")).replace(/\r\n/g, "\n").replace(wrapper, "")), "2fb059b2b536215e6c8015128cfec5ac1765edd7d23c919fc8719ead5d23fa6f");
  assert.deepEqual(Object.keys(workflow.jobs), ["cancel-superseded", "deduplicate-push", "validate", "codex-compat"]);
  assert.equal(workflow.concurrency, undefined); assert.equal(workflow.permissions, undefined); assert.equal(job.needs, undefined);
  assert.deepEqual(job.permissions, { actions: "write", "pull-requests": "read", contents: "read" });
  assert.equal(job.steps.length, 1); assert.equal(job.steps[0].uses, "actions/github-script@v7"); assert.equal(job.steps[0].with.retries, 0);
  assert.equal(job["timeout-minutes"], 3); assert.match(job.if, /!cancelled\(\)/); assert.match(job.if, /head\.repo\.id == github\.repository_id/);
  assert.equal(script.includes("${{"), false); assert.doesNotMatch(script, /checkout|forceCancelWorkflowRun|import\(/);
  const expression = value => "$" + "{{ " + value + " }}";
  assert.equal(workflow["run-name"], `ci-v1|event=${expression("github.event_name")}|pr=${expression("github.event.pull_request.number || 0")}|repo=${expression("github.repository_id")}|headrepo=${expression("github.event.pull_request.head.repo.id || github.repository_id")}|head=${expression("github.event.pull_request.head.sha || github.sha")}|baserepo=${expression("github.event.pull_request.base.repo.id || github.repository_id")}|base=${expression("github.event.pull_request.base.sha || github.sha")}|target=${expression("github.event.pull_request.base.ref || '-'")}`);
});

test("only older obsolete same-PR queued/in-progress targets receive requests", async () => {
  const s = scenario({ candidates: [run(100, 18, A, { status: "queued" }), run(101, 19, A), run(201, 21, A), run(102, 17, B)] });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100, 101]); assert.equal(report.status, "complete");
  assert.equal(report.cancellationRequests.length, 2); assert.ok(report.cancellationRequests.every(r => r.accepted));
  assert.deepEqual(JSON.parse(s.logs.at(-1)), report);
});
test("an old rerun cannot cancel a later-created run even when current head is restored", async () => {
  const s = scenario({ current: run(100, 10, B, { run_attempt: 3 }), candidates: [run(200, 20, A)] });
  await s.execute(); assert.deepEqual(cancelled(s), []);
});
test("a delayed old-head event with a larger number can only cancel itself", async () => {
  const s = scenario({ current: run(300, 30, A), candidates: [run(200, 20, B)], liveHead: B });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [300]); assert.equal(report.status, "stale_self_cancellation_requested");
  assert.equal(s.calls.some(([op]) => op === "list"), false);
});
test("stale self-cancellation stops when its attempt changes or its head is restored", async () => {
  const changed = scenario({ current: run(300, 30, A), override: { getRun: ({ current, runReads }) => ({ ...current, run_attempt: runReads > 1 ? 2 : 1 }) } });
  await changed.execute(); assert.deepEqual(cancelled(changed), []);
  const restored = scenario({ current: run(300, 30, A), override: { getPr: ({ live, prReads }) => prReads > 1 ? { ...live, head: { ...live.head, sha: A } } : live } });
  await restored.execute(); assert.deepEqual(cancelled(restored), []);
});
test("a self-cancel permission failure does not list or request any other run", async () => {
  const s = scenario({ current: run(300, 30, A), override: { cancel: () => { throw apiError(403); } } });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [300]); assert.equal(report.cancellationRequests.length, 0);
  assert.equal(report.status, "no_further_cancellation"); assert.equal(s.calls.some(([op]) => op === "list"), false);
});
test("push and fork controllers perform no API requests", async () => {
  for (const kind of ["push", "fork"]) {
    const s = scenario(); if (kind === "push") s.context.eventName = "push"; else s.context.payload.pull_request.head.repo.id = 2;
    await s.execute(); assert.deepEqual(s.calls, []);
  }
});
test("a cancelled or completed controller cannot cancel a target", async () => {
  for (const changes of [{ status: "completed", conclusion: "cancelled" }, { status: "completed", conclusion: "success" }]) {
    const s = scenario({ current: run(200, 20, B, changes) }); await s.execute(); assert.deepEqual(cancelled(s), []);
  }
});
test("other PR/workflow/repository/branch/base markers and unknown fields remain untouched", async () => {
  const title = run(100, 19, A).display_title;
  const changes = [{ display_title: title.replace("pr=249", "pr=250") }, { workflow_id: 99 }, { event: "push" },
    { head_repository: { id: 2 } }, { repository: { id: 2 } }, { head_branch: "other" }, { path: ".github/workflows/a6.yml" },
    { display_title: title.replace("target=develop", "target=main") }, { display_title: "user PR title" },
    { display_title: title.replace("pr=249", "pr=0249") }, { run_attempt: null }];
  for (const change of changes) { const s = scenario({ candidates: [run(100, 19, A, change)] }); await s.execute(); assert.deepEqual(cancelled(s), [], JSON.stringify(change)); }
});
test("same-head and completed/waiting/action-required candidates are preserved", async () => {
  for (const state of ["completed", "waiting", "pending", "requested", "action_required", "unknown"]) {
    const s = scenario({ candidates: [run(100, 19, A, { status: state })] }); await s.execute(); assert.deepEqual(cancelled(s), []);
  }
  const s = scenario({ candidates: [run(100, 19, B)] }); await s.execute(); assert.deepEqual(cancelled(s), []);
});
test("REST pull_requests must be an array on current and target runs", async () => {
  for (const value of [undefined, null, {}]) {
    const s = scenario({ candidates: [run(100, 19, A, { pull_requests: value })] }); await s.execute(); assert.deepEqual(cancelled(s), []);
    const current = scenario({ current: run(200, 20, B, { pull_requests: value }) }); await current.execute(); assert.deepEqual(cancelled(current), []);
  }
});
test("a nonempty REST association cannot contradict marker identity or fresh PR SHAs", async () => {
  const valid = association();
  const contradictory = [{ ...valid, number: 250 }, { ...valid, head: { ...valid.head, ref: "other" } },
    { ...valid, head: { ...valid.head, repo: { id: 2 } } }, { ...valid, head: { ...valid.head, sha: D } },
    { ...valid, base: { ...valid.base, ref: "main" } }, { ...valid, base: { ...valid.base, repo: { id: 2 } } },
    { ...valid, base: { ...valid.base, sha: D } }];
  for (const item of contradictory) { const s = scenario({ candidates: [run(100, 19, A, { pull_requests: [item] })] }); await s.execute(); assert.deepEqual(cancelled(s), []); }
  const multiple = scenario({ candidates: [run(100, 19, A, { pull_requests: [valid, association(B, { number: 250 })] })] });
  await multiple.execute(); assert.deepEqual(cancelled(multiple), []);
});
test("real empty REST associations require exact current and target source proofs, cached per SHA", async () => {
  const s = scenario({ candidates: [run(100, 18, A), run(101, 19, A)] });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100, 101]);
  const reads = s.calls.filter(([op]) => op === "source").map(([, input]) => input);
  assert.deepEqual(reads.map(r => r.ref).sort(), [A, B]);
  assert.ok(reads.every(r => r.path === ".github/workflows/ci.yml" && r.owner === "MJ-AgentLab" && r.repo === "mj-agentlab-marketplace"));
  assert.equal(report.sourceProofs.length, 2);
});
test("consistent nonempty REST association is still source-proved", async () => {
  const s = scenario({ candidates: [run(100, 19, A, { pull_requests: [association()] })] });
  await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.equal(s.calls.filter(([op]) => op === "source").length, 2);
});
test("historical run SHA stays fixed while its REST association follows the fresh PR head", async () => {
  // Actual PR250 B1: run/display head 2b03c44, association head ca51f3b after B2.
  const s = scenario({ candidates: [run(100, 19, A, { pull_requests: [association(B)] })] });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100]);
  assert.equal(report.cancellationRequests[0].headSha, A);
  assert.ok(report.sourceProofs.some(p => p.headSha === A));
});
test("historical marker base stays fixed while association base follows the fresh PR base", async () => {
  const current = run(200, 20, B, { display_title: run().display_title.replace(`base=${C}`, `base=${D}`) });
  const linked = association(B, { base: { ref: "develop", sha: D, repo: { id: repoId } } });
  const s = scenario({ current, candidates: [run(100, 19, A, { pull_requests: [linked] })] });
  s.live.base.sha = D; s.context.payload.pull_request.base.sha = D;
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.equal(report.cancellationRequests[0].headSha, A);
});
test("a stale controller with current dynamic association SHAs can only cancel its own original attempt", async () => {
  const linked = association(B, { base: { ref: "develop", sha: D, repo: { id: repoId } } });
  const s = scenario({ current: run(300, 30, A, { pull_requests: [linked] }), liveHead: B });
  s.live.base.sha = D; // The original event/marker base snapshot remains C.
  const report = await s.execute(); assert.deepEqual(cancelled(s), [300]);
  assert.equal(report.status, "stale_self_cancellation_requested");
  assert.equal(report.cancellationRequests[0].headSha, A); assert.equal(s.calls.some(([op]) => op === "list"), false);
});
test("association SHAs different from the fresh PR are rejected even if they match historical snapshots", async () => {
  for (const linked of [association(A), association(B, { base: { ref: "develop", sha: D, repo: { id: repoId } } })]) {
    const target = scenario({ candidates: [run(100, 19, A, { pull_requests: [linked] })] });
    await target.execute(); assert.deepEqual(cancelled(target), []);
    const controller = scenario({ current: run(200, 20, B, { pull_requests: [linked] }) });
    await controller.execute(); assert.deepEqual(cancelled(controller), []);
  }
});
test("distinct workflow source blobs with the exact same run-name contract remain eligible", async () => {
  const s = scenario({ override: { source: ({ input }) => content(input.ref === A ? source + "\n# Earlier workflow body/comment revision.\n" : source) } });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.equal(report.sourceProofs.length, 2);
  assert.notEqual(report.sourceProofs[0].blobSha, report.sourceProofs[1].blobSha);
});
test("a legacy current run with a marker-shaped PR title cannot start cancellation", async () => {
  const legacy = source.replace(/^run-name: >-\r?\n[^\r\n]*\r?\n/m, "");
  const s = scenario({ override: { source: ({ input }) => content(input.ref === B ? legacy : source) } });
  await s.execute(); assert.deepEqual(cancelled(s), []); assert.equal(s.calls.some(([op]) => op === "list"), false);
});
test("a legacy target with a marker-shaped display title cannot be cancelled", async () => {
  const legacy = source.replace(/^run-name: >-\r?\n[^\r\n]*\r?\n/m, "");
  const s = scenario({ override: { source: ({ input }) => content(input.ref === A ? legacy : source) } });
  await s.execute(); assert.deepEqual(cancelled(s), []);
});
test("source file/type/path/base64/size/blob metadata failures stop cancellation", async () => {
  const bad = [{ type: "dir" }, { path: "other.yml" }, { name: "other.yml" }, { encoding: "none" }, { size: 0 },
    { size: content().size + 1 }, { sha: "x".repeat(40) }, { sha: A }, { content: "!!!!" }, { content: "Zg=" },
    { content: "" }, { size: 1_000_001 }, { content: content().content.replace(/^./, "A") }];
  for (const fields of bad) {
    const s = scenario({ override: { source: () => ({ ...content(), ...fields }) } });
    const report = await s.execute(); assert.deepEqual(cancelled(s), [], JSON.stringify(fields)); assert.equal(report.status, "no_further_cancellation");
  }
});
test("source API permission/network failures stop before any cancellation", async () => {
  for (const error of [apiError(403), new Error("source read timeout")]) {
    const s = scenario({ override: { source: () => { throw error; } } }); const report = await s.execute();
    assert.deepEqual(cancelled(s), []); assert.equal(report.status, "no_further_cancellation");
  }
});
test("a changed live head or controller attempt just before a request stops cancellation", async () => {
  const head = scenario({ override: { getPr: ({ live, prReads }) => prReads > 1 ? { ...live, head: { ...live.head, sha: D } } : live } });
  await head.execute(); assert.deepEqual(cancelled(head), []);
  const attempt = scenario({ override: { getRun: ({ input, current, runs, runReads }) => input.run_id === current.id && runReads > 1 ? { ...current, run_attempt: 2 } : runs.get(input.run_id) } });
  await attempt.execute(); assert.deepEqual(cancelled(attempt), []);
});
test("a target starting another attempt after listing is left alone", async () => {
  const s = scenario({ override: { getRun: ({ input, current, runs }) => input.run_id === current.id ? current : { ...runs.get(input.run_id), run_attempt: 2 } } });
  await s.execute(); assert.deepEqual(cancelled(s), []);
});
test("a target source SHA changing after its proof is left alone", async () => {
  const s = scenario({ override: { getRun: ({ input, current, runs }) => input.run_id === current.id ? current : run(input.run_id, 19, D) } });
  await s.execute(); assert.deepEqual(cancelled(s), []);
});
test("a head change after a first accepted request preserves that receipt and stops further requests", async () => {
  const s = scenario({ candidates: [run(100, 18, A), run(101, 19, A)], override: { getPr: ({ live, calls }) => calls.some(([op]) => op === "cancel") ? { ...live, head: { ...live.head, sha: D } } : live } });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.deepEqual(report.cancellationRequests.map(r => r.runId), [100]);
  assert.equal(report.status, "head_or_attempt_changed");
});
test("an unproved second source after an accepted request stops and preserves the first acceptance", async () => {
  const legacy = source.replace(/^run-name: >-\r?\n[^\r\n]*\r?\n/m, "");
  const s = scenario({ candidates: [run(100, 18, A), run(101, 19, D)], override: { source: ({ input }) => content(input.ref === D ? legacy : source) } });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.deepEqual(report.cancellationRequests.map(r => r.runId), [100]);
  assert.equal(report.status, "no_further_cancellation");
});
test("listing permission/network errors perform no cancellation", async () => {
  for (const error of [apiError(403), new Error("read timeout")]) {
    const s = scenario({ override: { list: () => { throw error; } } }); const report = await s.execute();
    assert.deepEqual(cancelled(s), []); assert.equal(report.status, "no_further_cancellation");
  }
});
test("incomplete/unstable/duplicate/capped pagination stops before any side effect", async () => {
  const variants = [() => ({ data: { total_count: 2, workflow_runs: [run(100, 19, A)] }, headers: {} }),
    () => ({ data: { total_count: 2, workflow_runs: [run(100, 19, A), run(100, 19, A)] }, headers: {} }),
    () => ({ data: { total_count: 1000, workflow_runs: [] }, headers: {} }),
    input => ({ data: { total_count: input.page === 1 ? 2 : 3, workflow_runs: [run(100 + input.page, 19, A)] }, headers: { link: '<next>; rel="next"' } })];
  for (const list of variants) { const s = scenario({ override: { list } }); const report = await s.execute(); assert.deepEqual(cancelled(s), []); assert.equal(report.status, "no_further_cancellation"); }
});
test("all bounded pages are read before any cancellation", async () => {
  const s = scenario({ override: { list: input => input.page === 1 ? { data: { total_count: 2, workflow_runs: [run(100, 19, A)] }, headers: { link: '<next>; rel="next"' } } : { data: { total_count: 2, workflow_runs: [run(101, 18, A, { workflow_id: 1 })] }, headers: {} } } });
  await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.ok(s.calls.findIndex(([op]) => op === "cancel") > s.calls.findLastIndex(([op]) => op === "list"));
});
test("a cancel 403 stops before requesting a second obsolete target", async () => {
  const s = scenario({ candidates: [run(100, 18, A), run(101, 19, A)], override: { cancel: () => { throw apiError(403); } } });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.equal(report.status, "no_further_cancellation"); assert.equal(report.cancellationRequests.length, 0);
  assert.equal(report.errors[0].runId, 100); assert.equal(report.errors[0].attempt, 1);
});
test("a cancel network timeout stops before requesting a second obsolete target", async () => {
  const s = scenario({ candidates: [run(100, 18, A), run(101, 19, A)], override: { cancel: () => { throw new Error("cancel timeout"); } } });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.equal(report.status, "no_further_cancellation");
});
test("5xx and unexpected non-202 responses stop further cancellation", async () => {
  for (const status of [500, 503, 200, 204, undefined]) {
    const s = scenario({ candidates: [run(100, 18, A), run(101, 19, A)], override: { cancel: () => ({ status }) } });
    const report = await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.equal(report.status, "no_further_cancellation");
  }
});
test("a later 403 preserves the first 202 request and prevents a third request", async () => {
  const s = scenario({ candidates: [run(100, 17, A), run(101, 18, A), run(102, 19, A)], override: { cancel: ({ input }) => { if (input.run_id === 101) throw apiError(403); return { status: 202 }; } } });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100, 101]); assert.deepEqual(report.cancellationRequests.map(r => r.runId), [100]); assert.equal(report.status, "no_further_cancellation");
});
test("only an explicit HTTP409 conflict may continue to the next target", async () => {
  for (const throws of [true, false]) {
    const s = scenario({ candidates: [run(100, 18, A), run(101, 19, A)], override: { cancel: ({ input }) => {
      if (input.run_id === 100) { if (throws) throw apiError(409, "already completed"); return { status: 409 }; } return { status: 202 };
    } } });
    const report = await s.execute(); assert.deepEqual(cancelled(s), [100, 101]); assert.equal(report.status, "complete");
    assert.deepEqual(report.cancellationRequests.map(r => r.runId), [101]); assert.deepEqual(report.conflicts.map(r => r.runId), [100]); assert.equal(report.errors.length, 0);
  }
});
test("a message mentioning 409 without an HTTP409 status is not a conflict", async () => {
  const s = scenario({ candidates: [run(100, 18, A), run(101, 19, A)], override: { cancel: () => { throw new Error("409 in a network error message"); } } });
  const report = await s.execute(); assert.deepEqual(cancelled(s), [100]); assert.equal(report.status, "no_further_cancellation");
});
test("closed PR, base drift, and missing run data leave main CI independent", async () => {
  const closed = scenario(); closed.live.state = "closed"; await closed.execute(); assert.deepEqual(cancelled(closed), []);
  const base = scenario(); base.context.payload.pull_request.base.sha = D; await base.execute(); assert.deepEqual(cancelled(base), []);
  const missing = scenario({ override: { getRun: () => undefined } }); const report = await missing.execute(); assert.equal(report.status, "no_further_cancellation"); assert.deepEqual(cancelled(missing), []);
});
