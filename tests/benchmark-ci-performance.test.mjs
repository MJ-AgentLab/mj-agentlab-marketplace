import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import spawn from "cross-spawn";
import { parseOptions, validateBaselineConfig, makePlan, commandFor, statistics, parseTreeListing, copiedInventory, actualFixtureInventory, FIXTURE_COUNTS, inspectOutput, summarize, phaseSummary, canonicalPath, addOwnedWorktree, removeOwnedWorktrees } from "../scripts/benchmark-ci-performance.mjs";

function temporary(t) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "ci-benchmark-unit-"));
  t.after(async () => {
    const relative = path.relative(canonicalPath(os.tmpdir()), canonicalPath(root));
    assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative) && path.basename(root).startsWith("ci-benchmark-unit-"));
    await fs.promises.rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  return root;
}

test("benchmark arguments require exact sources, a fresh report location and at least three rounds", () => {
  const args = ["--candidate-sha", "a".repeat(40), "--report-dir", path.resolve("report")];
  assert.equal(parseOptions(args).repetitions, 3);
  assert.equal(parseOptions(args).stage, "core");
  assert.equal(parseOptions([...args, "--stage", "fixtures"]).stage, "fixtures");
  assert.throws(() => parseOptions([...args, "--stage", "injected; command"]), /stage must/);
  assert.throws(() => parseOptions([...args, "--stage", "fixtures", "--baseline-only"]), /frozen comparison/);
  assert.throws(() => parseOptions([...args, "--repetitions", "2"]), /at least 3/);
  assert.throws(() => parseOptions(["--candidate-sha", "main", "--report-dir", path.resolve("report")]), /full lowercase/);
  assert.throws(() => parseOptions(["--candidate-sha", "a".repeat(40), "--report-dir", "relative"]), /absolute/);
  assert.throws(() => parseOptions([...args, "--baseline-only", "--baseline-sha", "b".repeat(40)]), /candidate source itself/);
  assert.throws(() => validateBaselineConfig({ baselineSha: "a".repeat(40) }), /baselineTree/);
  assert.deepEqual(validateBaselineConfig({ baselineSha: "a".repeat(40), baselineTree: "b".repeat(40) }), { baselineSha: "a".repeat(40), baselineTree: "b".repeat(40) });
});

test("serial plan has B3 and O3 per concurrency, alternates order and measures whole canonical/smoke commands", () => {
  const plan = makePlan();
  assert.equal(plan.length, 24);
  const count = (source, command, concurrency = "default") => plan.filter(item => item.source === source && item.command === command && item.concurrency === concurrency).length;
  assert.equal(count("baseline", "test"), 3);
  for (const concurrency of ["default", 1, 2]) assert.equal(count("candidate", "test", concurrency), 3);
  for (const command of ["canonical", "smoke"]) for (const source of ["baseline", "candidate"]) assert.equal(count(source, command), 3);
  assert.equal(plan[0].source, "baseline");
  assert.equal(plan.find(item => item.round === 2).source, "candidate");
  assert.equal(makePlan(3, true).length, 9);
  assert.ok(makePlan(3, true).every(item => item.source === "baseline"));
  const fixtures = makePlan(3, false, "fixtures");
  assert.equal(fixtures.length, 6);
  assert.ok(fixtures.every(item => item.command === "test" && item.concurrency === "default"));
  assert.deepEqual(fixtures.map(item => item.source), ["baseline", "candidate", "candidate", "baseline", "baseline", "candidate"]);
  assert.throws(() => makePlan(3, true, "fixtures"), /invalid benchmark stage/);
});

test("frozen performance reference is the actual PR1 merge and tree", () => {
  const config = validateBaselineConfig(JSON.parse(fs.readFileSync(new URL("../config/ci-performance-baseline.json", import.meta.url), "utf8")));
  assert.equal(config.baselineSha, "30665998dda2ebbbae1806b946ec63f840bd98e0");
  assert.equal(config.baselineTree, "20f540fcabba740e549ecdbf01cf78f2ce3473f5");
});

test("benchmark selects fixed npm scripts with Node flags before the test glob", () => {
  assert.deepEqual(commandFor({ command: "test", concurrency: 2 }), { executable: "npm", args: ["run", "test:concurrency-2"] });
  assert.deepEqual(commandFor({ command: "test", concurrency: "default" }), { executable: "npm", args: ["test"] });
  assert.throws(() => commandFor({ command: "test", concurrency: 99 }), /unsupported/);
  assert.deepEqual(commandFor({ command: "canonical" }, "node"), { executable: "node", args: ["--test", "tests/release-verify-install.test.mjs"] });
  assert.deepEqual(commandFor({ command: "smoke" }), { executable: "npm", args: ["run", "smoke:codex"] });
});

test("actual isolated npm scripts set runner execArgv; the legacy trailing flag fails that same probe", t => {
  const root = temporary(t), scripts = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")).scripts;
  assert.equal(scripts.test, "node --test tests/*.test.mjs");
  fs.mkdirSync(path.join(root, "tests"));
  fs.writeFileSync(path.join(root, "tests/probe.test.mjs"), `import test from 'node:test'; import assert from 'node:assert/strict'; test('runner option is active', () => assert.ok(process.execArgv.includes('--test-concurrency=' + process.env.MJ_EXPECT_CONCURRENCY), JSON.stringify({ execArgv: process.execArgv, argv: process.argv })));\n`);
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ private: true, scripts: { "test:concurrency-1": scripts["test:concurrency-1"], "test:concurrency-2": scripts["test:concurrency-2"], "test:legacy-trailing": "node --test tests/*.test.mjs --test-concurrency=1" } }));
  const probeEnvironment = { ...process.env };
  delete probeEnvironment.NODE_TEST_CONTEXT; // Each probe starts its own runner, not an inherited test worker.
  for (const concurrency of [1, 2]) {
    const command = commandFor({ command: "test", concurrency });
    const result = spawn.sync(command.executable, command.args, { cwd: root, env: { ...probeEnvironment, MJ_EXPECT_CONCURRENCY: String(concurrency) }, encoding: "utf8", timeout: 20_000, windowsHide: true });
    assert.equal(result.status, 0, result.stderr || result.stdout || result.error?.message);
    assert.equal(inspectOutput("test", result.stdout).ok, true, result.stdout);
  }
  const legacy = spawn.sync("npm", ["run", "test:legacy-trailing"], { cwd: root, env: { ...probeEnvironment, MJ_EXPECT_CONCURRENCY: "1" }, encoding: "utf8", timeout: 20_000, windowsHide: true });
  assert.equal(legacy.error == null, true, legacy.error?.message);
  assert.notEqual(legacy.status, 0, "a trailing flag must not pass the execArgv assertion");
  assert.equal(inspectOutput("test", legacy.stdout).fail, 1, legacy.stderr || legacy.stdout);
});

test("statistics retain original units and report even medians and range", () => {
  assert.deepEqual(statistics([9, 1, 7, 3]), { count: 4, median: 5, min: 1, max: 9 });
  assert.equal(statistics([]), null);
  assert.equal(statistics([NaN]), null);
});

test("controlled bytes differ from checkout copy bytes; secondary and unknown copies cannot claim savings", () => {
  const tree = parseTreeListing(`100644 blob ${"a".repeat(40)} 5\tdocs/a.md\0`);
  assert.equal(tree.files, 1);
  assert.equal(tree.bytes, 5);
  const root = path.resolve("source"), entries = [{ path: "docs/a.md", bytes: 5, checkoutBytes: 7 }, { path: "assets/icon.svg", bytes: 4, checkoutBytes: 6 }];
  const copy = (target, repositoryFixture = true) => ({ phase: "copy", status: "ok", details: { scope: "fixture", suite: "html-guide-kit", path: target, repositoryFixture } });
  const result = copiedInventory([copy(path.join(root, "docs")), copy(path.join(root, "assets"), false), copy(path.join(root, "assets")), copy(path.resolve("secondary", "source"))], root, entries);
  assert.equal(result.bytes, 13);
  assert.equal(result.counted[0].controlledBytes, 5);
  assert.equal(result.excluded.length, 2);
  assert.equal(copiedInventory([copy(path.join(root, "assets"), false)], root, entries).bytes, null);
  assert.equal(copiedInventory([copy(path.join(root, "missing"))], root, entries).bytes, null);
  assert.equal(copiedInventory([], root, entries).bytes, null);
});

test("native source aliases map to owned inventory; Windows short-name forms normalize consistently", t => {
  const root = temporary(t), source = path.join(root, "Long Source"), alias = path.join(root, "alias");
  fs.mkdirSync(path.join(source, "docs"), { recursive: true });
  fs.writeFileSync(path.join(source, "docs/a.md"), "data");
  fs.symlinkSync(source, alias, process.platform === "win32" ? "junction" : "dir");
  const events = [{ phase: "copy", status: "ok", details: { scope: "fixture", suite: "plugin-icons", repositoryFixture: true, path: path.join(alias, "docs") } }];
  assert.equal(copiedInventory(events, source, [{ path: "docs/a.md", bytes: 4, checkoutBytes: 4 }]).bytes, 4);
  assert.equal(canonicalPath("C:\\TEMP\\BENCHM~1\\docs", { pathImpl: path.win32, realpath: () => "C:\\Temp\\Benchmark Long Name\\docs" }), "c:\\temp\\benchmark long name\\docs");
  const missingSecondary = copiedInventory([{ ...events[0], details: { ...events[0].details, path: path.join(root, "missing-secondary/docs") } }], source, [{ path: "docs/a.md", bytes: 4, checkoutBytes: 4 }]);
  assert.equal(missingSecondary.excluded.length, 1);
  assert.equal(missingSecondary.bytes, null);
});

test("registered checkout failures are removed; absent registration is ignored and failed removal retains owned data", async t => {
  const root = temporary(t), source = path.join(root, "source"), attempted = [], registered = new Set();
  let removed = 0, failRemoval = false;
  const git = async (_executable, args) => {
    if (args[1] === "add") { fs.mkdirSync(source); registered.add(source); throw new Error("checkout hook failed after registration"); }
    if (args[1] === "list") return [...registered].map(item => `worktree ${item}\0HEAD ${"a".repeat(40)}\0\0`).join("");
    if (args[1] === "remove") { if (failRemoval) throw new Error("persistent removal failure"); removed++; registered.delete(source); fs.rmdirSync(source); return ""; }
    throw new Error("unexpected git operation");
  };
  await assert.rejects(addOwnedWorktree(source, "a".repeat(40), { temporary: root, repoRoot: root, attempted, git }), /after registration/);
  assert.deepEqual(attempted, [source]);
  assert.equal((await removeOwnedWorktrees({ temporary: root, repoRoot: root, attempted }, git))[0].status, "ok");
  assert.equal(removed, 1);
  assert.equal(registered.size, 0);
  assert.equal((await removeOwnedWorktrees({ temporary: root, repoRoot: root, attempted }, git))[0].status, "not_registered");
  assert.equal(removed, 1);
  fs.mkdirSync(source); registered.add(source); failRemoval = true;
  const failed = await removeOwnedWorktrees({ temporary: root, repoRoot: root, attempted }, git);
  assert.equal(failed[0].status, "error");
  assert.equal(fs.existsSync(source), true);
  assert.equal(registered.has(source), true);
});

test("command success requires complete Windows TAP or all thirteen real smoke results", () => {
  const tap = "# tests 2\n# pass 2\n# fail 0\n# cancelled 0\n# skipped 0\n";
  assert.equal(inspectOutput("test", tap).ok, true);
  assert.equal(inspectOutput("test", tap.replaceAll("\n", "\r\n")).ok, true);
  assert.equal(inspectOutput("canonical", tap.replace("# skipped 0", "# skipped 1")).ok, false);
  const smoke = { ok: true, scenarios: Array.from({ length: 13 }, () => ({ ok: true })) };
  assert.equal(inspectOutput("smoke", "npm preamble\n" + JSON.stringify(smoke, null, 2)).ok, true);
  smoke.scenarios[0].ok = false;
  assert.equal(inspectOutput("smoke", JSON.stringify(smoke, null, 2)).ok, false);
  assert.equal(inspectOutput("smoke", "{}\n").ok, false);
});

function measured({ baselineOnly = false, stage = "core", mutate = record => record } = {}) {
  return makePlan(3, baselineOnly, stage).map(sample => mutate({ ...sample, durationMs: sample.source === "baseline" ? 1000 : sample.command === "test" ? ({ default: 400, 1: 410, 2: 390 })[sample.concurrency] : sample.command === "canonical" ? 100 : 500, fixtureCopiedBytes: sample.source === "baseline" ? 10_000 : null, fixtureActualCopiedBytes: sample.source === "candidate" ? 120 : null, fixtureSyntheticBytes: sample.source === "candidate" ? 10 : null, fixturePreparationDeltaBytes: sample.source === "candidate" ? -5 : null, fixtureTotalBytes: sample.source === "candidate" ? 125 : null, fixtureTotals: sample.source === "candidate" ? { valid: true, fixtureCount: 22, bySuite: FIXTURE_COUNTS, copiedBytes: 120 } : null, ok: true }));
}

function assertUnmeasured(summary, names = ["fixtureBytes", "test", "canonical", "smoke"]) {
  assert.equal(summary.status, "not_accepted");
  assert.deepEqual(Object.keys(summary.gates), names);
  for (const name of names) {
    const { improvement, status, ok } = summary.gates[name];
    assert.deepEqual({ improvement, status, ok }, { improvement: null, status: "not_measured", ok: false }, name);
  }
  assert.equal(summary.selectedConcurrency, null);
}

test("baseline-only measurements never become a frozen baseline or speed PASS", () => {
  const summary = summarize(measured({ baselineOnly: true }), { baselineOnly: true });
  assert.equal(summary.status, "baseline_only");
  assert.equal(summary.frozenBaseline, false);
  assert.equal(summary.gates, null);
});

test("one selected configuration meets all gates; five-percent tie chooses actual lower concurrency", () => {
  const summary = summarize(measured(), { defaultConcurrency: 4, eligibleEnvironment: true });
  assert.equal(summary.status, "pass");
  // 410 exceeds 390 by >5%; default=400 is within 5%, but resolves to 4 versus explicit 2.
  assert.deepEqual(summary.selectedConcurrency, { configured: 2, resolved: 2, withinFivePercentOfFastest: true });
  const tied = summarize(measured({ mutate: item => item.source === "candidate" && item.command === "test" && item.concurrency === 1 ? { ...item, durationMs: 405 } : item }), { defaultConcurrency: 4, eligibleEnvironment: true });
  assert.equal(tied.selectedConcurrency.configured, 1);
});

test("actual copy reduction uses a conservative baseline lower bound and rejects missing or oversized candidate totals", () => {
  const options = { defaultConcurrency: 4, eligibleEnvironment: true };
  const valid = summarize(measured(), options);
  assert.equal(valid.gates.fixtureBytes.improvement, 1 - 120 / 10_000);
  const missing = summarize(measured({ mutate: item => ({ ...item, fixtureActualCopiedBytes: null }) }), options);
  assert.equal(missing.status, "not_accepted");
  assert.equal(missing.gates.fixtureBytes.status, "not_measured");
  const generated = summarize(measured({ mutate: item => item.source === "candidate" ? { ...item, fixtureActualCopiedBytes: 600, fixtureTotals: { ...item.fixtureTotals, copiedBytes: 600 } } : item }), options);
  assert.equal(generated.gates.fixtureBytes.status, "fail");
  assert.equal(generated.status, "not_accepted");
});

test("failed, partial, non-Windows and unmeasured-copy runs cannot pass by replacement or zero filling", () => {
  const full = measured();
  assert.equal(summarize(full.slice(1), { eligibleEnvironment: true }).status, "not_accepted");
  assert.equal(summarize(full.map((item, i) => i === 0 ? { ...item, ok: false } : item), { eligibleEnvironment: true }).status, "not_accepted");
  assert.equal(summarize(full, { eligibleEnvironment: false }).status, "not_accepted");
  assert.equal(summarize(full, { eligibleEnvironment: true, frozenBaseline: false }).status, "not_accepted");
  const noCopies = summarize(full.map(item => ({ ...item, fixtureCopiedBytes: null })), { eligibleEnvironment: true });
  assert.equal(noCopies.status, "not_accepted");
  assert.equal(noCopies.gates.fixtureBytes.improvement, null);
  const oneMissing = summarize(full.map((item, i) => i === 1 ? { ...item, fixtureActualCopiedBytes: null } : item), { eligibleEnvironment: true });
  assert.equal(oneMissing.status, "not_accepted");
  assert.equal(oneMissing.gates.fixtureBytes.improvement, null);
});

test("the failed fourteen-sample core prefix preserves observations without admitting any gates", () => {
  // Real run 38793803097 stopped at baseline canonical round two after thirteen successes.
  const samples = measured().slice(0, 14);
  assert.deepEqual([samples[13].source, samples[13].command, samples[13].round], ["baseline", "canonical", 2]);
  samples[13] = { ...samples[13], ok: false, durationMs: 1400 };
  const summary = summarize(samples, { eligibleEnvironment: true, complete: false });
  assertUnmeasured(summary);
  assert.deepEqual(summary.groups["baseline/canonical/default"].wallMs, { count: 2, median: 1200, min: 1000, max: 1400 });
  assert.equal(summary.groups["baseline/canonical/default"].valid, false);
  assert.equal(summary.groups["candidate/canonical/default"].wallMs.count, 2);
  assert.equal(summary.groups["baseline/smoke/default"].wallMs.count, 1);
});

test("one-round canonical and smoke pairs remain unmeasured even when their times meet thresholds", () => {
  const samples = measured().filter(record => record.round === 1 && ["canonical", "smoke"].includes(record.command));
  const summary = summarize(samples, { eligibleEnvironment: true, complete: false });
  assertUnmeasured(summary);
  assert.equal(summary.groups["candidate/canonical/default"].wallMs.median, 100);
  assert.equal(summary.groups["candidate/smoke/default"].wallMs.median, 500);
  assert.ok(Object.values(summary.groups).every(group => group.wallMs.count === 1 && !group.valid));
});

test("an invalid baseline cannot select among otherwise complete candidate test configurations", () => {
  const full = measured();
  for (const samples of [full.slice(1), full.map((record, index) => index === 0 ? { ...record, ok: false } : record)]) {
    const summary = summarize(samples, { eligibleEnvironment: true });
    assertUnmeasured(summary);
    for (const concurrency of ["default", 1, 2]) assert.equal(summary.groups[`candidate/test/${concurrency}`].valid, true);
    assert.equal(summary.groups["baseline/test/default"].valid, false);
  }
});

test("an unexpected replacement group cannot admit core gates or concurrency", () => {
  const samples = measured({ mutate: record => record.source === "candidate" && record.command === "canonical" ? { ...record, command: "unexpected" } : record });
  const summary = summarize(samples, { eligibleEnvironment: true });
  assertUnmeasured(summary);
  assert.equal(Object.keys(summary.groups).length, 8);
  assert.equal(summary.groups["candidate/unexpected/default"].wallMs.count, 3);
  assert.ok(Object.values(summary.groups).every(group => group.valid));
});

test("direct comparison summaries require at least three integer rounds", () => {
  for (const repetitions of [1, 2, 3.5]) for (const stage of ["core", "fixtures"]) {
    const samples = measured({ stage }).filter(record => record.round <= repetitions);
    const summary = summarize(samples, { repetitions, stage, eligibleEnvironment: true });
    assertUnmeasured(summary, stage === "fixtures" ? ["fixtureBytes"] : undefined);
    assert.ok(Object.values(summary.groups).every(group => group.wallMs.count > 0));
  }
});

test("baseline-only summaries also require three integer rounds and their exact command groups", () => {
  for (const repetitions of [1, 2, 3.5]) {
    const samples = measured({ baselineOnly: true }).filter(record => record.round <= repetitions);
    const summary = summarize(samples, { repetitions, baselineOnly: true });
    assert.equal(summary.status, "incomplete");
    assert.equal(summary.gates, null);
    assert.equal(summary.selectedConcurrency, null);
  }
  const samples = measured({ baselineOnly: true, mutate: record => record.command === "smoke" ? { ...record, command: "unexpected" } : record });
  assert.equal(summarize(samples, { baselineOnly: true }).status, "incomplete");
});

for (const [reason, override] of [["incomplete cleanup", { complete: false }], ["unfrozen baseline", { frozenBaseline: false }], ["ineligible environment", { eligibleEnvironment: false }]]) {
  test(`all complete core groups remain unmeasured with ${reason}`, () => {
    const summary = summarize(measured(), { eligibleEnvironment: true, ...override });
    assertUnmeasured(summary);
    assert.equal(Object.keys(summary.groups).length, 8);
    assert.ok(Object.values(summary.groups).every(group => group.valid && group.wallMs.count === 3));
  });
}

test("a complete eligible core comparison still reports a measured threshold failure and concurrency", () => {
  const samples = measured({ mutate: record => record.source === "candidate" && record.command === "canonical" ? { ...record, durationMs: 250 } : record });
  const summary = summarize(samples, { defaultConcurrency: 4, eligibleEnvironment: true });
  assert.equal(summary.status, "not_accepted");
  assert.deepEqual(summary.gates.canonical, { improvement: .75, required: .80, status: "fail", ok: false });
  for (const name of ["fixtureBytes", "test", "smoke"]) assert.equal(summary.gates[name].status, "pass");
  assert.deepEqual(summary.selectedConcurrency, { configured: 2, resolved: 2, withinFivePercentOfFastest: true });
});

test("fixtures stage suppresses copy PASS until completion, frozen source, environment and shape are eligible", () => {
  const samples = measured({ stage: "fixtures" }), options = { stage: "fixtures", eligibleEnvironment: true };
  for (const override of [{ complete: false }, { frozenBaseline: false }, { eligibleEnvironment: false }]) {
    const summary = summarize(samples, { ...options, ...override });
    assertUnmeasured(summary, ["fixtureBytes"]);
    assert.ok(Object.values(summary.groups).every(group => group.valid));
    assert.equal(summary.coreAcceptance, "deferred");
  }
  const extraGroup = measured().filter(record => record.source === "candidate" && record.command === "canonical");
  const summary = summarize([...samples, ...extraGroup], options);
  assertUnmeasured(summary, ["fixtureBytes"]);
  assert.equal(Object.keys(summary.groups).length, 3);
  assert.equal(summary.groups["candidate/test/default"].fixtureActualCopiedBytes.median, 120);
});

test("phase sums preserve expected negative operations without treating them as command failures", () => {
  assert.deepEqual(phaseSummary([{ phase: "validate", durationMs: 10, status: "error", details: { scope: "canonical" } }, { phase: "validate", durationMs: 5, status: "ok", details: { scope: "canonical" } }]), { "canonical/validate": { count: 2, durationSumMs: 15, operationErrors: 1 } });
});

const protocolSource = path.resolve("benchmark-source");
function fixtureEvents() {
  const result = [];
  for (const [suite, count] of Object.entries(FIXTURE_COUNTS)) for (let index = 0; index < count; index++) {
    const root = path.join(os.tmpdir(), `benchmark-counter-${suite}-${index}`);
    const common = { scope: "fixture", suite, repositoryFixture: true, sourceRoot: protocolSource };
    result.push({ phase: "copy", status: "ok", durationMs: 1, details: { ...common, fixtureRoot: root, copiedBytes: 100, copiedFiles: 2, inventoryMode: "explicit-entries-verified" } });
    result.push({ phase: "fixture.total", status: "ok", durationMs: 1, details: { ...common, root, stage: "prepared", copiedBytes: 100, copiedFiles: 2, syntheticBytes: 10, syntheticFiles: 1, preparationDeltaBytes: 0, fixtureTotalBytes: 110, fixtureTotalFiles: 3 } });
  }
  return result;
}

test("actual fixture totals use final suite/root snapshots, preserve signed overlays and exclude boundary/local copies", () => {
  const events = fixtureEvents();
  events.push({ ...events[1], details: { ...events[1].details, stage: "syntheticCommunication", preparationDeltaBytes: -5, fixtureTotalBytes: 105 } });
  events.push({ phase: "copy", status: "error", details: { scope: "fixture", suite: "repository-fixture-boundary", repositoryFixture: true } });
  events.push({ phase: "copy", status: "ok", details: { scope: "fixture", suite: "plugin-icons", repositoryFixture: false } });
  const actual = actualFixtureInventory(events, protocolSource);
  assert.equal(actual.valid, true, actual.errors.join("\n"));
  assert.equal(actual.fixtureCount, 22);
  assert.deepEqual(actual.bySuite, FIXTURE_COUNTS);
  assert.equal(actual.copiedBytes, 2200);
  assert.equal(actual.syntheticBytes, 220);
  assert.equal(actual.preparationDeltaBytes, -5);
  assert.equal(actual.fixtureTotalBytes, 2415);
});

test("missing prepared/copy segments and failed operations cannot be hidden by a later successful total", () => {
  const base = fixtureEvents();
  const variants = [base.slice(1), base.filter((_, index) => index !== 1)];
  variants.push(base.map((event, index) => index === 0 ? { ...event, status: "error" } : event));
  variants.push([...base.map((event, index) => index === 1 ? { ...event, status: "error" } : event), { ...base[1], details: { ...base[1].details, stage: "overlay" } }]);
  variants.push([...base, base[1]]);
  for (const events of variants) {
    const actual = actualFixtureInventory(events, protocolSource);
    assert.equal(actual.valid, false);
    assert.equal(actual.copiedBytes, null);
  }
});

test("counter types, source/root consistency, exact suite counts and duplicate cross-suite identities fail closed", () => {
  for (const [field, value] of [["copiedBytes", -1], ["copiedFiles", .5], ["syntheticBytes", NaN], ["fixtureTotalFiles", null], ["preparationDeltaBytes", Infinity], ["fixtureTotalBytes", 109]]) {
    const events = fixtureEvents(); events[1].details[field] = value;
    assert.equal(actualFixtureInventory(events, protocolSource).valid, false, field);
  }
  for (const change of [
    events => { events[0].details.copiedBytes++; },
    events => { events[0].details.sourceRoot = path.resolve("other-source"); },
    events => { events[0].details.fixtureRoot = path.join(os.tmpdir(), "different-root"); },
    events => { events[0].details.inventoryMode = "planned-only"; },
    events => { events[0].details.copiedBytes = 0; events[1].details.copiedBytes = 0; events[1].details.fixtureTotalBytes = 10; },
    events => { events.splice(0, 2); },
    events => { const target = events.find(event => event.details.suite === "plugin-icons" && event.phase === "fixture.total").details.root; events[0].details.fixtureRoot = target; events[1].details.root = target; },
  ]) {
    const events = fixtureEvents(); change(events);
    assert.equal(actualFixtureInventory(events, protocolSource).valid, false);
  }
});

test("fixtures stage accepts copy reduction only and keeps core timing/concurrency acceptance deferred", () => {
  const samples = measured({ stage: "fixtures", mutate: record => record.source === "candidate" ? { ...record, durationMs: 2000 } : record });
  const options = { stage: "fixtures", frozenBaseline: true, eligibleEnvironment: true };
  const summary = summarize(samples, options);
  assert.equal(summary.status, "fixtures_pass");
  assert.equal(summary.coreAcceptance, "deferred");
  assert.equal(summary.selectedConcurrency, null);
  assert.deepEqual(Object.keys(summary.gates), ["fixtureBytes"]);
  assert.deepEqual(summary.deferredGates, ["test", "canonical", "smoke"]);
  assert.equal(summary.groups["candidate/test/default"].fixtureCopiedBytes, null);
  assert.equal(summary.groups["candidate/test/default"].fixturePreparationDeltaBytes.median, -5);
  for (const override of [{ eligibleEnvironment: false }, { frozenBaseline: false }, { complete: false }, { baselineOnly: true }]) assert.equal(summarize(samples, { ...options, ...override }).status, "not_accepted");
  for (const invalid of [samples.slice(1), samples.map((record, index) => index === 1 ? { ...record, fixtureTotals: { ...record.fixtureTotals, fixtureCount: 21 } } : record), samples.map((record, index) => index === 1 ? { ...record, round: 3 } : record)]) assert.equal(summarize(invalid, options).status, "not_accepted");
  const tooLarge = samples.map(record => record.source === "candidate" ? { ...record, fixtureActualCopiedBytes: 600, fixtureTotals: { ...record.fixtureTotals, copiedBytes: 600 } } : record);
  assert.equal(summarize(tooLarge, options).gates.fixtureBytes.status, "fail");
});
