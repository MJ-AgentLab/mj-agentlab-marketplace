import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { parse } from "yaml";

const source = fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const workflow = parse(source), job = workflow.jobs["deduplicate-push"];
const require = createRequire(import.meta.url);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const hash = value => crypto.createHash("sha256").update(value).digest("hex");
const H = "a".repeat(40), BASE = "b".repeat(40), MERGE = "c".repeat(40), OTHER = "d".repeat(40);
const repository = { id: 1183002256, full_name: "MJ-AgentLab/mj-agentlab-marketplace", fork: false };
const branch = "codex/issue-245-dedup", workflowId = 247197116;
const jobNames = ["Baseline compat (ubuntu-latest)", "Baseline compat (windows-latest)"];
const clone = value => structuredClone(value);
function content(text = source) {
  const bytes = Buffer.from(text);
  return { type: "file", name: "ci.yml", path: ".github/workflows/ci.yml", encoding: "base64", size: bytes.length,
    content: bytes.toString("base64") + "\n", sha: crypto.createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") };
}
function marker(event, head = H, base = BASE) {
  return `ci-v1|event=${event}|pr=${event === "push" ? 0 : 251}|repo=1183002256|headrepo=1183002256|head=${head}|baserepo=1183002256|base=${event === "push" ? head : base}|target=${event === "push" ? "-" : "develop"}`;
}
function run(id = 200, number = 20, changes = {}) {
  return { id, workflow_id: workflowId, run_number: number, run_attempt: 1, event: "pull_request", repository, head_repository: repository,
    path: ".github/workflows/ci.yml", head_branch: branch, head_sha: H, status: "queued", conclusion: null,
    display_title: marker("pull_request"), pull_requests: [], ...changes };
}
function scenario({ carrier = run(), runs, overrides = {} } = {}) {
  const live = { id: 2510, number: 251, state: "open", merge_commit_sha: MERGE, head: { sha: H, ref: branch, repo: clone(repository) }, base: { sha: BASE, ref: "develop", repo: clone(repository) } };
  const push = run(300, 30, { event: "push", status: "in_progress", display_title: marker("push") });
  const jobs = jobNames.map((name, index) => ({ id: 1000 + index, run_id: carrier.id, run_attempt: carrier.run_attempt, head_sha: H, name, status: "queued", conclusion: null }));
  const context = { eventName: "push", runId: 300, sha: H, ref: `refs/heads/${branch}`, repo: { owner: "MJ-AgentLab", repo: "mj-agentlab-marketplace" }, payload: { after: H, ref: `refs/heads/${branch}`, repository: clone(repository) } };
  const env = { GITHUB_RUN_ATTEMPT: "1", GITHUB_WORKFLOW_SHA: H };
  const state = { live, push, carrier, jobs, runs: runs ?? [carrier], context, env, calls: [], outputs: [], logs: [], counts: {} };
  const invoke = async (operation, input, fallback) => {
    state.calls.push([operation, clone(input)]);
    const count = state.counts[operation] = (state.counts[operation] ?? 0) + 1;
    return clone({ status: 200, ...(overrides[operation] ? await overrides[operation]({ input, count, ...state }) : fallback()) });
  };
  const github = { rest: {
    pulls: {
      list: input => invoke("listPrs", input, () => ({ data: [live], headers: {} })),
      get: input => invoke("getPr", input, () => ({ data: live })),
    },
    repos: { getContent: input => invoke("source", input, () => ({ data: content() })) },
    git: {
      getRef: input => invoke("ref", input, () => ({ data: { ref: "refs/" + input.ref, object: { type: "commit", sha: input.ref === `heads/${branch}` ? H : BASE } } })),
      getCommit: input => invoke("merge", input, () => ({ data: { sha: MERGE, parents: [{ sha: BASE }, { sha: H }] } })),
    },
    actions: {
      getWorkflow: input => invoke("workflow", input, () => ({ data: { id: workflowId, path: ".github/workflows/ci.yml", state: "active" } })),
      getWorkflowRun: input => invoke("getRun", input, () => ({ data: input.run_id === push.id ? push : carrier })),
      getWorkflowRunAttempt: input => invoke("attempt", input, () => ({ data: carrier })),
      listWorkflowRuns: input => invoke("listRuns", input, () => ({ data: { total_count: state.runs.length, workflow_runs: state.runs }, headers: {} })),
      listJobsForWorkflowRunAttempt: input => invoke("jobs", input, () => ({ data: { total_count: jobs.length, jobs }, headers: {} })),
      getPendingDeploymentsForRun: input => invoke("pending", input, () => ({ data: [] })),
    },
  } };
  state.execute = async () => {
    const execute = new AsyncFunction("github", "context", "core", "require", "process", job.steps[0].with.script);
    return execute(github, context, { setOutput: (key, value) => { state.outputs.push([key, value]); if (overrides.output) overrides.output({ key, value, ...state }); }, info: text => { state.logs.push(text); if (overrides.log) overrides.log(text); } }, require, { env });
  };
  return state;
}
const skipped = state => state.outputs.at(-1)?.[1] === "true";

test("the actual read-only push gate first emits false and does nothing on a PR event", async () => {
  assert.ok(job, "actual inline deduplicate-push job is required");
  const outputs = [], calls = [];
  const execute = new AsyncFunction("github", "context", "core", "require", "process", job.steps[0].with.script);
  await execute({ rest: new Proxy({}, { get: (_, name) => { calls.push(name); throw Error("unexpected API"); } }) },
    { eventName: "pull_request" }, { setOutput: (key, value) => outputs.push([key, value]), info: () => {} }, require, { env: {} });
  assert.deepEqual(outputs, [["skip_push", "false"]]);
  assert.deepEqual(calls, []);
  assert.deepEqual(job.permissions, { actions: "read", "pull-requests": "read", contents: "read" });
  assert.equal(job["timeout-minutes"], 3);
  assert.equal(job.steps.length, 1);
  assert.equal(job.steps[0].uses, "actions/github-script@v7");
  assert.equal(job.steps[0].with.retries, 0);
});

test("queued PR jobs with the exact fresh merge/source identity can carry the push matrix now", async () => {
  const s = scenario();
  await s.execute();
  assert.equal(skipped(s), true);
  assert.deepEqual(s.outputs, [["skip_push", "false"], ["skip_push", "true"]]);
  assert.ok(s.calls.filter(([operation]) => operation === "source").length >= 3);
  assert.ok(s.calls.filter(([operation]) => operation === "listRuns").length >= 2);
});

test("a listed failure cannot be laundered by an active detail response for the same attempt", async () => {
  const s = scenario({ runs: [run(200, 20, { status: "completed", conclusion: "failure" })] });
  await s.execute();
  assert.equal(skipped(s), false);
});

const matrixIf = "!cancelled() && (github.event_name != 'push' || needs.deduplicate-push.result != 'success' || needs.deduplicate-push.outputs.skip_push != 'true')";
function matrixRuns(event, result, output, cancelled = false) {
  // GitHub compares expression strings case-insensitively; missing properties are empty.
  const lower = value => typeof value === "string" ? value.toLowerCase() : "";
  const expression = workflow.jobs["codex-compat"].if.replaceAll("needs.deduplicate-push", 'needs["deduplicate-push"]');
  return new Function("github", "needs", "cancelled", "return " + expression)(
    { event_name: event }, { "deduplicate-push": { result: lower(result), outputs: { skip_push: lower(output) } } }, () => cancelled);
}
test("actual job wrappers keep every PR and all unproved pushes while cancelled workflows start no matrix", () => {
  assert.equal(workflow.jobs["codex-compat"].if, matrixIf);
  assert.equal(workflow.jobs["codex-compat"].needs, "deduplicate-push");
  assert.equal(job.if, "!cancelled() && github.event_name == 'push'");
  assert.equal(job.outputs.skip_push, "$" + "{{ steps.prove.outputs.skip_push }}");
  assert.equal(job.steps[0].id, "prove");
  for (const event of ["push", "pull_request"]) for (const result of ["success", "failure", "skipped", "cancelled", undefined]) {
    for (const output of ["true", "false", "", "garbage", undefined]) {
      assert.equal(matrixRuns(event, result, output), event !== "push" || result !== "success" || output !== "true", `${event}/${result}/${output}`);
      assert.equal(matrixRuns(event, result, output, true), false);
    }
  }
  const normalized = source.replace(/\r\n/g, "\n");
  const cancel = normalized.slice(normalized.indexOf("  cancel-superseded:"), normalized.indexOf("  deduplicate-push:"));
  assert.equal(hash(cancel), "7c55fe2f6fd778ea8db06728efc2d61aa14ce6c18f77964e486ed648c84d6f95");
  assert.equal(workflow.jobs.validate.needs, undefined);
  assert.equal(job.needs, undefined);
  assert.equal(job["continue-on-error"], undefined);
  assert.doesNotMatch(job.steps[0].with.script, /cancelWorkflowRun|reRunWorkflow|forceCancelWorkflowRun|import\(|checkout|execFile|spawn\(/);
  assert.equal(job.steps[0].with.script.includes("${{"), false);
});

test("queued, running and successful exact carriers require both instantiated OS jobs", async () => {
  for (const status of ["queued", "in_progress", "completed"]) {
    const s = scenario({ carrier: run(200, 20, { status, conclusion: status === "completed" ? "success" : null }) });
    if (status === "completed") s.jobs.forEach(value => Object.assign(value, { status: "completed", conclusion: "success" }));
    s.jobs.push({ id: 1003, run_id: 200, run_attempt: 1, head_sha: H, name: job.name, status: "completed", conclusion: "skipped" });
    await s.execute(); assert.equal(skipped(s), true, status);
    const reports = s.logs.filter(value => value.startsWith("MJ_PR5_DEDUP_REPORT "));
    assert.equal(reports.length, 1);
    const report = JSON.parse(reports[0].slice("MJ_PR5_DEDUP_REPORT ".length));
    assert.equal(report.skipPush, true); assert.deepEqual(report.carrier, { id: 200, attempt: 1, status, conclusion: status === "completed" ? "success" : null });
    assert.equal(report.base, BASE); assert.equal(report.head, H);
    const calls = s.calls.filter(([operation]) => operation === "source").map(([, input]) => input);
    assert.deepEqual(calls.map(input => input.ref), [H, H, MERGE]);
    assert.ok(calls.every(input => input.path === ".github/workflows/ci.yml"));
    assert.ok(s.calls.filter(([operation]) => operation === "jobs").every(([, input]) => input.attempt_number === 1 && input.filter === undefined));
    assert.ok(s.calls.filter(([operation]) => operation === "listRuns").every(([, input]) => input.head_sha === undefined && input.status === undefined && input.event === "pull_request" && input.branch === branch));
  }
});

test("a later carrier failure is not retroactively converted into automatic push restoration", async () => {
  const s = scenario(); await s.execute(); assert.equal(skipped(s), true);
  const reads = s.calls.length;
  Object.assign(s.carrier, { status: "completed", conclusion: "failure" });
  assert.equal(s.calls.length, reads); assert.equal(skipped(s), true);
  // Deliberate decision-time contract: actual later PR failure must block merge.
});

test("fork, stale workflow SHA, malformed context and wrong current push all fail open", async () => {
  const mutations = [s => { s.env.GITHUB_WORKFLOW_SHA = OTHER; }, s => { s.env.GITHUB_RUN_ATTEMPT = "01"; },
    s => { s.context.payload.repository.fork = true; }, s => { s.context.payload.repository.id = 2; },
    s => { s.context.payload.after = OTHER; }, s => { s.context.payload.ref = "refs/heads/other"; },
    s => { s.context.ref = "refs/tags/v1"; }, s => { s.context.repo.owner = "other"; },
    s => { s.push.run_attempt = 2; }, s => { s.push.event = "pull_request"; },
    s => { s.push.head_sha = OTHER; }, s => { s.push.display_title = "user title"; },
    s => { s.push.repository = { ...repository, id: 2 }; }, s => { s.push.head_branch = "other"; },
    s => { s.push.status = "completed"; s.push.conclusion = "cancelled"; }];
  for (const mutate of mutations) { const s = scenario(); mutate(s); await s.execute(); assert.equal(skipped(s), false, mutate.toString()); }
});

test("no PR, multiple PRs, a fork or any head/base identity mismatch retains full push", async () => {
  for (const transform of [live => [], live => [live, { ...live, id: 2511, number: 252 }],
    live => [{ ...live, state: "closed" }], live => [{ ...live, merge_commit_sha: null }],
    live => [{ ...live, head: { ...live.head, sha: OTHER } }], live => [{ ...live, head: { ...live.head, ref: "other" } }],
    live => [{ ...live, head: { ...live.head, repo: { ...repository, fork: true } } }],
    live => [{ ...live, base: { ...live.base, ref: "other" } }]]) {
    const s = scenario({ overrides: { listPrs: ({ live }) => ({ data: transform(live), headers: {} }) } });
    await s.execute(); assert.equal(skipped(s), false);
  }
});

test("latest selection never falls back from a newer failed, cancelled, waiting or malformed run", async () => {
  const old = run(100, 10, { status: "completed", conclusion: "success" });
  const variants = [{ status: "completed", conclusion: "failure" }, { status: "completed", conclusion: "cancelled" },
    { status: "completed", conclusion: "skipped" }, { status: "waiting" }, { status: "action_required" },
    { status: "pending" }, { status: "requested" }, { status: "unknown" }, { display_title: "legacy title" },
    { display_title: marker("pull_request", H, OTHER) }, { head_sha: OTHER, display_title: marker("pull_request", OTHER) },
    { run_attempt: undefined }, { workflow_id: 42 }, { path: ".github/workflows/other.yml" }, { head_repository: { ...repository, id: 2 } }];
  for (const fields of variants) {
    const carrier = run(200, 20, fields), s = scenario({ carrier, runs: [old, carrier] });
    await s.execute(); assert.equal(skipped(s), false, JSON.stringify(fields));
  }
  const duplicateOrder = scenario({ runs: [run(100, 20), run(200, 20)] }); await duplicateOrder.execute(); assert.equal(skipped(duplicateOrder), false);
});

test("nonempty associations match fresh PR SHAs exactly on listed, detail and push runs", async () => {
  const associationFor = live => ({ number: live.number, head: clone(live.head), base: clone(live.base) });
  const good = scenario(); good.carrier.pull_requests = [associationFor(good.live)]; good.push.pull_requests = [associationFor(good.live)];
  await good.execute(); assert.equal(skipped(good), true);
  for (const mutate of [a => { a.number = 252; }, a => { a.head.sha = OTHER; }, a => { a.base.sha = OTHER; },
    a => { a.head.ref = "other"; }, a => { a.head.repo.id = 2; }, a => { a.base.repo.id = 2; }, a => { a.base.ref = "main"; }]) {
    for (const target of ["carrier", "push"]) { const s = scenario(), linked = associationFor(s.live); mutate(linked); s[target].pull_requests = [linked]; await s.execute(); assert.equal(skipped(s), false); }
  }
  for (const value of [null, undefined, {}, [associationFor(good.live), associationFor(good.live)]]) {
    const s = scenario(); s.carrier.pull_requests = value; await s.execute(); assert.equal(skipped(s), false);
  }
});

test("full source equality rejects a different merge body even with the exact fixed run-name", async () => {
  const alternative = source.replace("run: npm test", "run: echo omitted tests");
  assert.notEqual(content(alternative).sha, content().sha);
  const s = scenario({ overrides: { source: ({ input }) => ({ data: content(input.ref === MERGE ? alternative : source) }) } });
  await s.execute(); assert.equal(skipped(s), false);
  const legacy = scenario({ overrides: { source: () => ({ data: content(source.replace(/^run-name: >-\r?\n[^\r\n]*\r?\n/m, "")) }) } });
  await legacy.execute(); assert.equal(skipped(legacy), false);
});

test("strict source file, path, base64, UTF8, size and Git blob proofs fail closed to full push", async () => {
  const invalid = [{ type: "dir" }, { path: "other.yml" }, { name: "other.yml" }, { encoding: "none" }, { size: 0 },
    { size: 1000001 }, { size: content().size + 1 }, { sha: OTHER }, { content: "!!!!" }, { content: "Zg=" },
    { content: "" }, { content: content().content.replace(/^./, "A") }];
  for (const fields of invalid) { const s = scenario({ overrides: { source: () => ({ data: { ...content(), ...fields } }) } }); await s.execute(); assert.equal(skipped(s), false); }
  const bytes = Buffer.from([0xff]);
  const malformed = { ...content(), content: bytes.toString("base64"), size: 1, sha: crypto.createHash("sha1").update("blob 1\0").update(bytes).digest("hex") };
  const s = scenario({ overrides: { source: () => ({ data: malformed }) } }); await s.execute(); assert.equal(skipped(s), false);
});

test("the actual PR merge commit requires ordered current base and head parents", async () => {
  for (const data of [{ sha: MERGE, parents: [] }, { sha: MERGE, parents: [{ sha: H }, { sha: BASE }] },
    { sha: MERGE, parents: [{ sha: BASE }, { sha: OTHER }] }, { sha: OTHER, parents: [{ sha: BASE }, { sha: H }] },
    { sha: MERGE, parents: [{ sha: BASE }, { sha: H }, { sha: OTHER }] }]) {
    const s = scenario({ overrides: { merge: () => ({ data }) } }); await s.execute(); assert.equal(skipped(s), false);
  }
});

test("missing, duplicated, wrong-attempt or nonpassing OS jobs prevent carrying", async () => {
  const variants = [jobs => [], jobs => jobs.slice(0, 1), jobs => [jobs[0], { ...jobs[1], name: jobs[0].name }],
    jobs => [jobs[0], { ...jobs[1], status: "completed", conclusion: "failure" }],
    jobs => [jobs[0], { ...jobs[1], status: "completed", conclusion: "cancelled" }],
    jobs => [jobs[0], { ...jobs[1], status: "completed", conclusion: "skipped" }],
    jobs => [jobs[0], { ...jobs[1], status: "waiting" }], jobs => [jobs[0], { ...jobs[1], status: "unknown" }],
    jobs => [jobs[0], { ...jobs[1], run_attempt: 2 }], jobs => [jobs[0], { ...jobs[1], run_id: 201 }],
    jobs => [jobs[0], { ...jobs[1], head_sha: MERGE }], jobs => [jobs[0], { ...jobs[1], name: "Baseline compat (other)" }]];
  for (const transform of variants) {
    const s = scenario({ overrides: { jobs: ({ jobs }) => { const result = transform(jobs); return { data: { total_count: result.length, jobs: result }, headers: {} }; } } });
    await s.execute(); assert.equal(skipped(s), false);
  }
  const completed = scenario({ carrier: run(200, 20, { status: "completed", conclusion: "success" }) });
  await completed.execute(); assert.equal(skipped(completed), false);
});

test("any API error, timeout, unexpected read status or pending approval keeps complete push", async () => {
  for (const operation of ["workflow", "getRun", "listPrs", "getPr", "ref", "listRuns", "attempt", "merge", "source", "jobs", "pending"]) {
    for (const status of [403, 500, null]) {
      const s = scenario({ overrides: { [operation]: () => { throw Object.assign(new Error(status === null ? "timeout" : "API failure"), { status }); } } });
      await s.execute(); assert.equal(skipped(s), false, operation);
    }
  }
  for (const data of [null, {}, [{ environment: { id: 1 } }]]) {
    const s = scenario({ overrides: { pending: () => ({ data }) } }); await s.execute(); assert.equal(skipped(s), false);
  }
  const unexpected = scenario({ overrides: { workflow: () => ({ status: 503, data: { id: workflowId, path: ".github/workflows/ci.yml", state: "active" } }) } });
  await unexpected.execute(); assert.equal(skipped(unexpected), false);
});

test("incomplete, duplicate, capped, malformed or unstable pagination never emits true", async () => {
  const variants = [() => ({ data: { total_count: 2, workflow_runs: [run()] }, headers: {} }),
    () => ({ data: { total_count: 2, workflow_runs: [run(), run()] }, headers: {} }),
    () => ({ data: { total_count: 1000, workflow_runs: [] }, headers: {} }),
    () => ({ data: { total_count: 1, workflow_runs: [run()] }, headers: { link: "unknown" } }),
    () => ({ data: { total_count: 1, workflow_runs: [run()] }, headers: { link: '<https://api.github.com/repos/a/b?page=2&per_page=100>; rel="next"' } }),
    () => ({ data: { total_count: 1, workflow_runs: [run()] }, headers: { link: '<https://api.github.com/repos/a/b?page=2&per_page=100>; rel="last"' } })];
  for (const listRuns of variants) { const s = scenario({ overrides: { listRuns } }); await s.execute(); assert.equal(skipped(s), false); }
  for (const listPrs of [() => ({ data: [], headers: { link: "bad" } }), () => ({ data: Array(100).fill(null).map((_, i) => ({ id: i + 1 })), headers: { link: '<https://api.github.com/a?page=3&per_page=100>; rel="next"' } })]) {
    const s = scenario({ overrides: { listPrs } }); await s.execute(); assert.equal(skipped(s), false);
  }
});

test("complete numbered run pages are read before choosing the highest run number", async () => {
  const older = Array.from({ length: 100 }, (_, index) => run(1000 + index, index + 1));
  const carrier = run(200, 200);
  const s = scenario({ carrier, overrides: { listRuns: ({ input }) => input.page === 1
    ? { data: { total_count: 101, workflow_runs: older }, headers: { link: `<https://api.github.com/repositories/1183002256/actions/workflows/247197116/runs?page=2&per_page=100&event=pull_request&branch=${encodeURIComponent(branch)}>; rel="next"` } }
    : { data: { total_count: 101, workflow_runs: [carrier] }, headers: {} } } });
  await s.execute(); assert.equal(skipped(s), true);
  assert.deepEqual(s.calls.filter(([operation]) => operation === "listRuns").map(([, input]) => input.page), [1, 2, 1, 2]);
  const unstable = scenario({ overrides: { listRuns: ({ input }) => input.page === 1
    ? { data: { total_count: 101, workflow_runs: older }, headers: { link: `<https://api.github.com/repositories/1183002256/actions/workflows/247197116/runs?page=2&per_page=100&event=pull_request&branch=${encodeURIComponent(branch)}>; rel="next"` } }
    : { data: { total_count: 102, workflow_runs: [carrier] }, headers: {} } } });
  await unstable.execute(); assert.equal(skipped(unstable), false);
});

test("final PR, Git refs, push, latest run, exact attempt, jobs and approvals are revalidated", async () => {
  const variants = {
    getPr: ({ count, live }) => ({ data: count > 1 ? { ...live, merge_commit_sha: OTHER } : live }),
    listPrs: ({ count, live }) => ({ data: count > 1 ? [live, { ...live, id: 2520, number: 252 }] : [live], headers: {} }),
    ref: ({ count, input }) => ({ data: { ref: "refs/" + input.ref, object: { type: "commit", sha: count > 2 ? OTHER : input.ref === `heads/${branch}` ? H : BASE } } }),
    listRuns: ({ count, carrier }) => ({ data: { total_count: 1, workflow_runs: [count > 1 ? { ...carrier, run_attempt: 2 } : carrier] }, headers: {} }),
    getRun: ({ count, input, push, carrier }) => ({ data: input.run_id === push.id ? count > 2 ? { ...push, status: "completed", conclusion: "cancelled" } : push : carrier }),
    attempt: ({ count, carrier }) => ({ data: count > 1 ? { ...carrier, run_attempt: 2 } : carrier }),
    jobs: ({ count, jobs }) => ({ data: { total_count: 2, jobs: count > 1 ? [jobs[0], { ...jobs[1], status: "completed", conclusion: "failure" }] : jobs }, headers: {} }),
    pending: ({ count }) => ({ data: count > 1 ? [{ environment: { id: 1 } }] : [] }),
  };
  for (const [operation, override] of Object.entries(variants)) {
    const s = scenario({ overrides: { [operation]: override } }); await s.execute(); assert.equal(skipped(s), false, operation);
  }
});

test("output and log failures fail the gate so even partial true cannot suppress the matrix", async () => {
  for (const value of ["false", "true"]) {
    const s = scenario({ overrides: { output: item => { if (item.value === value) throw Error("output write failed"); } } });
    await assert.rejects(s.execute(), /output write failed/);
    assert.equal(matrixRuns("push", "failure", s.outputs.at(-1)?.[1]), true);
  }
  const log = scenario({ overrides: { log: () => { throw Error("log failed"); } } });
  await assert.rejects(log.execute(), /log failed/); assert.equal(matrixRuns("push", "failure", "true"), true);
});

test("a next Link for another route cannot certify a complete run inventory", async () => {
  const older = Array.from({ length: 100 }, (_, index) => run(1000 + index, index + 1));
  const carrier = run(200, 200);
  const s = scenario({ carrier, overrides: { listRuns: ({ input }) => input.page === 1
    ? { data: { total_count: 101, workflow_runs: older }, headers: { link: '<https://api.github.com/unrelated?page=2&per_page=100>; rel="next"' } }
    : { data: { total_count: 101, workflow_runs: [carrier] }, headers: {} } } });
  await s.execute(); assert.equal(skipped(s), false);
});

test("a next Link contradicting an already complete total is rejected", async () => {
  const carrier = run(200, 200), first = [carrier, ...Array.from({ length: 99 }, (_, index) => run(1000 + index, index + 1))];
  const s = scenario({ carrier, overrides: { listRuns: ({ input }) => input.page === 1
    ? { data: { total_count: 100, workflow_runs: first }, headers: { link: `<https://api.github.com/repositories/1183002256/actions/workflows/247197116/runs?page=2&per_page=100&event=pull_request&branch=${encodeURIComponent(branch)}>; rel="next"` } }
    : { data: { total_count: 100, workflow_runs: [] }, headers: {} } } });
  await s.execute(); assert.equal(skipped(s), false);
});

test("each PR head/base and Git ref drift, and a newer final failure, retain the push matrix", async () => {
  for (const part of ["head", "base"]) {
    const pr = scenario({ overrides: { getPr: ({ count, live }) => ({ data: count > 1 ? { ...live, [part]: { ...live[part], sha: OTHER } } : live }) } });
    await pr.execute(); assert.equal(skipped(pr), false, part);
    const ref = scenario({ overrides: { ref: ({ count, input }) => ({ data: { ref: "refs/" + input.ref, object: { type: "commit", sha: count > 2 && input.ref === `heads/${part === "head" ? branch : "develop"}` ? OTHER : input.ref === `heads/${branch}` ? H : BASE } } }) } });
    await ref.execute(); assert.equal(skipped(ref), false, part + " ref");
  }
  for (const operation of ["listRuns", "getRun", "attempt"]) {
    const override = operation === "listRuns" ? ({ count, carrier }) => ({ data: { total_count: 1, workflow_runs: [count > 1 ? { ...carrier, status: "completed", conclusion: "failure" } : carrier] }, headers: {} })
      : operation === "getRun" ? ({ count, input, push, carrier }) => ({ data: input.run_id === push.id ? push : count > 2 ? { ...carrier, run_attempt: 2 } : carrier })
      : ({ count, carrier }) => ({ data: count > 1 ? { ...carrier, status: "completed", conclusion: "cancelled" } : carrier });
    const s = scenario({ overrides: { [operation]: override } }); await s.execute(); assert.equal(skipped(s), false, operation);
  }
});
