#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import spawn from "cross-spawn";

const SHA = /^[a-f0-9]{40}$/;
const MINUTE = 60_000;
const ROOT = path.resolve(import.meta.dirname, "..");
const COMMAND_TIMEOUT = 60 * MINUTE;
const RUN_BUDGET = 320 * MINUTE; // Leave time for finally and artifact upload in the 330-minute job.
export const THRESHOLDS = Object.freeze({ fixtureBytes: .95, test: .50, canonical: .80, smoke: .30 });
export const COPY_MEASUREMENT_DOMAIN = "controlled checkout content copied by tagged repository inputs; lower bound, excluding generated/untracked files and physical I/O";
export const FIXTURE_COUNTS = Object.freeze({ "release-verify-install": 7, "validate-portable": 8, "html-guide-kit": 5, "plugin-icons": 2 });
export const RUNTIME_PATHS = Object.freeze(["plugins", "assets", ".agents", ".codex", ".gitattributes", "VERSION"]);

export function validateBaselineConfig(config) {
  if (!config || !SHA.test(config.baselineSha) || !SHA.test(config.baselineTree)) throw new Error("frozen config requires full baselineSha and baselineTree");
  return config;
}

export function parseOptions(argv) {
  const result = { repetitions: 3, baselineOnly: false, stage: "core" };
  const names = { "--baseline-sha": "baselineSha", "--candidate-sha": "candidateSha", "--report-dir": "reportDir", "--repetitions": "repetitions", "--stage": "stage" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--baseline-only") { result.baselineOnly = true; continue; }
    const name = names[argv[i]];
    if (!name || !argv[i + 1] || argv[i + 1].startsWith("--")) throw new Error(`invalid argument: ${argv[i]}`);
    if (Object.hasOwn(result, name) && !["repetitions", "stage"].includes(name)) throw new Error(`duplicate argument: ${argv[i]}`);
    result[name] = argv[++i];
  }
  result.repetitions = Number(result.repetitions);
  if (!Number.isInteger(result.repetitions) || result.repetitions < 3) throw new Error("repetitions must be an integer of at least 3");
  if (!["core", "fixtures"].includes(result.stage)) throw new Error("stage must be core or fixtures");
  if (result.stage === "fixtures" && result.baselineOnly) throw new Error("fixtures stage requires a frozen comparison, not baseline-only");
  for (const name of ["baselineSha", "candidateSha"]) if (result[name] && !SHA.test(result[name])) throw new Error(`${name} must be a full lowercase commit SHA`);
  if (!result.candidateSha) throw new Error("--candidate-sha is required (use the actual PR merge SHA)");
  if (!result.reportDir || !path.isAbsolute(result.reportDir)) throw new Error("--report-dir must be an absolute path");
  if (result.baselineOnly && result.baselineSha && result.baselineSha !== result.candidateSha) throw new Error("baseline-only must measure the candidate source itself");
  return result;
}

export function makePlan(repetitions = 3, baselineOnly = false, stage = "core") {
  if (!Number.isInteger(repetitions) || repetitions < 3) throw new Error("at least three rounds are required");
  if (!["core", "fixtures"].includes(stage) || (stage === "fixtures" && baselineOnly)) throw new Error("invalid benchmark stage or baseline-only combination");
  const plan = [];
  for (let round = 1; round <= repetitions; round++) {
    const baseline = { round, source: "baseline", command: "test", concurrency: "default" };
    if (stage === "fixtures") {
      const candidate = { ...baseline, source: "candidate" };
      plan.push(...(round % 2 ? [baseline, candidate] : [candidate, baseline]));
      continue;
    }
    if (baselineOnly) plan.push(baseline);
    else {
      const configs = ["default", 1, 2];
      const rotation = (round - 1) % configs.length;
      const candidates = [...configs.slice(rotation), ...configs.slice(0, rotation)].map(concurrency => ({ round, source: "candidate", command: "test", concurrency }));
      plan.push(...(round % 2 ? [baseline, ...candidates] : [...candidates, baseline]));
    }
    for (const command of ["canonical", "smoke"]) {
      const sources = baselineOnly ? ["baseline"] : round % 2 ? ["baseline", "candidate"] : ["candidate", "baseline"];
      for (const source of sources) plan.push({ round, source, command, concurrency: "default" });
    }
  }
  return plan.map((sample, index) => ({ ...sample, id: `${String(index + 1).padStart(2, "0")}-${sample.source}-${sample.command}-${sample.concurrency}-r${sample.round}` }));
}

export function commandFor(sample, node = process.execPath) {
  if (sample.command === "test") {
    if (!["default", 1, 2].includes(sample.concurrency)) throw new Error("unsupported test concurrency");
    return { executable: "npm", args: sample.concurrency === "default" ? ["test"] : ["run", `test:concurrency-${sample.concurrency}`] };
  }
  if (sample.command === "canonical") return { executable: node, args: ["--test", "tests/release-verify-install.test.mjs"] };
  if (sample.command === "smoke") return { executable: "npm", args: ["run", "smoke:codex"] };
  throw new Error(`unknown measured command: ${sample.command}`);
}

export function statistics(values, { signed = false } = {}) {
  if (!values.length || values.some(value => !Number.isFinite(value) || (!signed && value < 0))) return null;
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return { count: sorted.length, median: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2, min: sorted[0], max: sorted.at(-1) };
}

export function parseTreeListing(listing) {
  const entries = String(listing).split("\0").filter(Boolean).map(line => {
    const match = /^\d+ blob [a-f0-9]+\s+(\d+)\t([\s\S]+)$/.exec(line);
    if (!match) throw new Error("unexpected controlled-file inventory entry");
    return { bytes: Number(match[1]), path: match[2] };
  });
  return { files: entries.length, bytes: entries.reduce((total, entry) => total + entry.bytes, 0), entries };
}

const FIXTURE_SUITES = new Set(["release-verify-install", "validate-portable", "html-guide-kit", "plugin-icons"]);
export function canonicalPath(target, { pathImpl = path, realpath = fs.realpathSync.native } = {}) {
  const original = pathImpl.resolve(target), suffix = [];
  let current = original;
  for (;;) {
    try { current = pathImpl.join(realpath(current), ...suffix); break; }
    catch (error) {
      if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
      const parent = pathImpl.dirname(current);
      if (parent === current) { current = original; break; }
      suffix.unshift(pathImpl.basename(current)); current = parent;
    }
  }
  const normalized = pathImpl.normalize(current);
  return process.platform === "win32" || pathImpl === path.win32 ? normalized.toLowerCase() : normalized;
}

export function copiedInventory(events, sourceRoot, entries) {
  const counted = [], excluded = [], unresolved = [];
  const described = events.map(event => ({ ...event.details, ...event }));
  for (const event of described.filter(item => item.phase === "copy" && item.status === "ok" && item.scope === "fixture" && FIXTURE_SUITES.has(item.suite))) {
    if (event.repositoryFixture !== true) { excluded.push({ suite: event.suite, path: event.path, reason: "copy is not tagged as a repository fixture input" }); continue; }
    if (typeof event.path !== "string") { unresolved.push({ suite: event.suite, reason: "copy has no source path" }); continue; }
    let relative;
    try { relative = path.relative(canonicalPath(sourceRoot), canonicalPath(path.resolve(sourceRoot, event.path))).split(path.sep).join("/"); }
    catch (error) { unresolved.push({ suite: event.suite, path: event.path, reason: `cannot resolve source path: ${error.message}` }); continue; }
    // Only explicitly tagged repository inputs count, including future nested minimal inputs.
    if (!relative || relative.startsWith("../") || path.isAbsolute(relative)) {
      excluded.push({ suite: event.suite, path: event.path, reason: "secondary or non-repository fixture copy" }); continue;
    }
    const matches = entries.filter(entry => {
      const name = process.platform === "win32" ? entry.path.toLowerCase() : entry.path;
      return name === relative || name.startsWith(relative + "/");
    });
    if (!matches.length) { unresolved.push({ suite: event.suite, path: event.path, reason: "source is absent from controlled-file inventory" }); continue; }
    counted.push({ suite: event.suite, path: relative, files: matches.length, controlledBytes: matches.reduce((sum, entry) => sum + entry.bytes, 0), checkoutBytes: matches.reduce((sum, entry) => sum + entry.checkoutBytes, 0) });
  }
  return { counted, excluded, unresolved, bytes: counted.length && !unresolved.length ? counted.reduce((sum, entry) => sum + entry.checkoutBytes, 0) : null, files: counted.reduce((sum, entry) => sum + entry.files, 0) };
}

export function actualFixtureInventory(events, sourceRoot, expectedCounts = FIXTURE_COUNTS) {
  const errors = [], identities = new Map(), owners = new Map();
  const counterNames = ["copiedBytes", "syntheticBytes", "preparationDeltaBytes", "fixtureTotalBytes", "copiedFiles", "syntheticFiles", "fixtureTotalFiles"];
  const expectedSource = canonicalPath(sourceRoot);
  const count = value => Number.isSafeInteger(value) && value >= 0;
  for (const event of events) {
    const details = event.details ?? {};
    if (!["copy", "fixture.total"].includes(event.phase) || details.scope !== "fixture" || !FIXTURE_SUITES.has(details.suite) || details.repositoryFixture !== true) continue;
    const rootName = event.phase === "copy" ? details.fixtureRoot : details.root;
    if (typeof rootName !== "string" || !path.isAbsolute(rootName)) { errors.push("repository fixture record has no absolute root identity"); continue; }
    let root;
    try {
      root = canonicalPath(rootName);
      if (typeof details.sourceRoot !== "string" || !path.isAbsolute(details.sourceRoot) || canonicalPath(details.sourceRoot) !== expectedSource) throw new Error("fixture sourceRoot differs from the measured source");
      const nested = relative => relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
      if (nested(path.relative(expectedSource, root)) || nested(path.relative(root, expectedSource))) throw new Error("fixture and measured source overlap");
    } catch (error) { errors.push(error.message); continue; }
    if (owners.has(root) && owners.get(root) !== details.suite) errors.push("one canonical fixture root is reused across suites");
    owners.set(root, details.suite);
    const identity = `${details.suite}\0${root}`;
    const state = identities.get(identity) ?? { suite: details.suite, root, copies: [], prepared: 0, last: null };
    identities.set(identity, state);
    if (event.status !== "ok") errors.push(`failed fixture preparation operation for ${identity}`);
    if (event.phase === "copy") {
      if (details.inventoryMode !== "explicit-entries-verified" || !count(details.copiedBytes) || !count(details.copiedFiles)) errors.push(`invalid actual copy counters for ${identity}`);
      state.copies.push(details);
    } else {
      if (details.stage === "prepared") state.prepared++;
      if (typeof details.stage !== "string" || !details.stage) errors.push(`missing fixture preparation stage for ${identity}`);
      for (const name of counterNames) {
        if (name === "preparationDeltaBytes" ? !Number.isSafeInteger(details[name]) : !count(details[name])) errors.push(`invalid ${name} for ${identity}`);
      }
      if (!(details.copiedBytes > 0) || !(details.copiedFiles > 0)) errors.push(`fixture has no real copied content for ${identity}`);
      if (details.fixtureTotalBytes !== details.copiedBytes + details.syntheticBytes + details.preparationDeltaBytes) errors.push(`inconsistent final fixture byte counters for ${identity}`);
      state.last = details;
    }
  }
  const bySuite = {};
  for (const state of identities.values()) {
    bySuite[state.suite] = (bySuite[state.suite] ?? 0) + 1;
    if (state.prepared !== 1 || !state.last || !state.copies.length) errors.push(`fixture requires one prepared total and verified copies: ${state.suite}/${state.root}`);
    if (state.last && (state.copies.reduce((sum, copy) => sum + copy.copiedBytes, 0) !== state.last.copiedBytes || state.copies.reduce((sum, copy) => sum + copy.copiedFiles, 0) !== state.last.copiedFiles)) errors.push(`final copied totals differ from verified copy records: ${state.suite}/${state.root}`);
  }
  for (const suite of FIXTURE_SUITES) if ((bySuite[suite] ?? 0) !== (expectedCounts[suite] ?? 0)) errors.push(`unexpected fixture count for ${suite}: ${bySuite[suite] ?? 0}`);
  const totals = [...identities.values()].filter(state => state.last).map(state => ({ suite: state.suite, root: state.root, ...Object.fromEntries(counterNames.map(name => [name, state.last[name]])), stage: state.last.stage }));
  const sums = Object.fromEntries(counterNames.map(name => [name, errors.length ? null : totals.reduce((sum, total) => sum + total[name], 0)]));
  if (!errors.length && counterNames.some(name => !Number.isSafeInteger(sums[name]))) errors.push("aggregate fixture counters exceed safe integer precision");
  return { valid: !errors.length, fixtureCount: identities.size, expectedCount: Object.values(expectedCounts).reduce((sum, value) => sum + value, 0), bySuite, errors, totals, ...Object.fromEntries(counterNames.map(name => [name, errors.length ? null : sums[name]])), measurementDomain: "verified tagged repository input copies; synthetic writes and signed preparation deltas reported separately; not physical I/O" };
}

export function inspectOutput(command, output) {
  output = output.replace(/\r\n/g, "\n");
  if (command === "smoke") {
    const start = output.search(/^\{\s*$/m);
    if (start < 0) return { ok: false, reason: "missing smoke JSON" };
    try {
      const report = JSON.parse(output.slice(start));
      return { ok: report.ok === true && report.scenarios?.length === 13 && report.scenarios.every(scenario => scenario.ok === true), scenarios: report.scenarios?.length ?? null };
    } catch { return { ok: false, reason: "invalid smoke JSON" }; }
  }
  const counts = {};
  for (const field of ["tests", "pass", "fail", "cancelled", "skipped"]) {
    const matches = [...output.matchAll(new RegExp(`^# ${field} (\\d+)$`, "gm"))];
    counts[field] = matches.length ? Number(matches.at(-1)[1]) : null;
  }
  return { ...counts, ok: counts.tests > 0 && counts.pass === counts.tests && counts.fail === 0 && counts.cancelled === 0 && counts.skipped === 0 };
}

function key(sample) { return `${sample.source}/${sample.command}/${sample.concurrency}`; }
function validTestMeasurement(record) {
  if (record.command !== "test") return true;
  if (record.source === "baseline") return Number.isFinite(record.fixtureCopiedBytes) && record.fixtureCopiedBytes > 0;
  const actual = record.fixtureTotals;
  return actual?.valid === true && actual.fixtureCount === 22 && Object.entries(FIXTURE_COUNTS).every(([suite, count]) => actual.bySuite?.[suite] === count) && Number.isFinite(record.fixtureActualCopiedBytes) && record.fixtureActualCopiedBytes > 0 && record.fixtureActualCopiedBytes === actual.copiedBytes;
}
export function summarize(samples, { repetitions = 3, baselineOnly = false, frozenBaseline = true, defaultConcurrency = 1, eligibleEnvironment = false, complete = true, stage = "core" } = {}) {
  const groups = {};
  for (const sample of samples) (groups[key(sample)] ??= []).push(sample);
  const stats = Object.fromEntries(Object.entries(groups).map(([name, records]) => [name, {
    wallMs: statistics(records.map(record => record.durationMs)),
    fixtureCopiedBytes: statistics(records.map(record => record.fixtureCopiedBytes)),
    fixtureActualCopiedBytes: statistics(records.map(record => record.fixtureActualCopiedBytes)),
    fixtureSyntheticBytes: statistics(records.map(record => record.fixtureSyntheticBytes)),
    fixturePreparationDeltaBytes: statistics(records.map(record => record.fixturePreparationDeltaBytes), { signed: true }),
    fixtureTotalBytes: statistics(records.map(record => record.fixtureTotalBytes)),
    valid: records.length === repetitions && new Set(records.map(record => record.round)).size === repetitions && records.every(record => record.ok && Number.isInteger(record.round) && record.round >= 1 && record.round <= repetitions && validTestMeasurement(record)),
  }]));
  const improvement = (baseline, candidate) => baseline > 0 && Number.isFinite(candidate) ? 1 - candidate / baseline : null;
  const gate = (value, threshold) => ({ improvement: value, required: threshold, status: value === null ? "not_measured" : value >= threshold ? "pass" : "fail", ok: value !== null && value >= threshold });
  if (baselineOnly && stage === "core") return { status: complete && Object.keys(stats).length === 3 && Object.values(stats).every(group => group.valid) ? "baseline_only" : "incomplete", frozenBaseline: false, groups: stats, selectedConcurrency: null, gates: null };
  const baselineTest = stats["baseline/test/default"];
  const copyGate = candidate => ({ ...gate(baselineTest?.valid && candidate?.valid && baselineTest.fixtureCopiedBytes?.count === repetitions && candidate.fixtureActualCopiedBytes?.count === repetitions ? improvement(baselineTest.fixtureCopiedBytes.median, candidate.fixtureActualCopiedBytes.median) : null, THRESHOLDS.fixtureBytes), method: "actual candidate copied bytes / controlled baseline lower bound; reduction lower bound" });
  if (stage === "fixtures") {
    const fixtureGate = copyGate(stats["candidate/test/default"]);
    const valid = complete && !baselineOnly && frozenBaseline && eligibleEnvironment && samples.length === repetitions * 2 && Object.keys(stats).length === 2 && Object.values(stats).every(group => group.valid);
    return { status: valid && fixtureGate.ok ? "fixtures_pass" : "not_accepted", stage, coreAcceptance: "deferred", frozenBaseline, groups: stats, selectedConcurrency: null, gates: { fixtureBytes: fixtureGate }, deferredGates: ["test", "canonical", "smoke"], eligibleEnvironment, complete };
  }
  if (stage !== "core") throw new Error("unknown acceptance stage");
  const candidates = ["default", 1, 2].map(concurrency => ({ concurrency, resolvedConcurrency: concurrency === "default" ? defaultConcurrency : concurrency, ...stats[`candidate/test/${concurrency}`] })).filter(candidate => candidate.valid);
  const eligible = candidates.filter(candidate => improvement(baselineTest?.wallMs?.median, candidate.wallMs?.median) >= THRESHOLDS.test);
  const pool = eligible.length ? eligible : candidates;
  const fastest = [...pool].sort((a, b) => a.wallMs.median - b.wallMs.median)[0];
  const chosen = fastest && pool.filter(candidate => candidate.wallMs.median <= fastest.wallMs.median * 1.05).sort((a, b) => a.resolvedConcurrency - b.resolvedConcurrency || a.wallMs.median - b.wallMs.median)[0];
  const compared = command => improvement(stats[`baseline/${command}/default`]?.wallMs?.median, stats[`candidate/${command}/default`]?.wallMs?.median);
  // Baseline controlled bytes are a lower bound. Only actual candidate copies
  // can conservatively establish the approved reduction in all copied bytes.
  const completeCopyMeasurements = baselineTest?.fixtureCopiedBytes?.count === repetitions && ["candidate/test/default", "candidate/test/1", "candidate/test/2"].every(name => stats[name]?.fixtureActualCopiedBytes?.count === repetitions);
  const gates = {
    fixtureBytes: completeCopyMeasurements ? copyGate(chosen) : { ...gate(null, THRESHOLDS.fixtureBytes), method: "actual candidate copied bytes / controlled baseline lower bound; reduction lower bound" },
    test: gate(improvement(baselineTest?.wallMs?.median, chosen?.wallMs?.median), THRESHOLDS.test),
    canonical: gate(compared("canonical"), THRESHOLDS.canonical), smoke: gate(compared("smoke"), THRESHOLDS.smoke),
  };
  const valid = complete && frozenBaseline && Object.values(stats).length === 8 && Object.values(stats).every(group => group.valid) && eligibleEnvironment;
  return { status: valid && Object.values(gates).every(result => result.ok) ? "pass" : "not_accepted", frozenBaseline, groups: stats, selectedConcurrency: chosen ? { configured: chosen.concurrency, resolved: chosen.resolvedConcurrency, withinFivePercentOfFastest: true } : null, gates, eligibleEnvironment, complete };
}

export function phaseSummary(events) {
  const result = {};
  for (const event of events) {
    const name = `${event.details?.scope ?? "unknown"}/${event.phase}`;
    const group = result[name] ??= { count: 0, durationSumMs: 0, operationErrors: 0 };
    group.count++; group.durationSumMs += event.durationMs;
    if (event.status === "error") group.operationErrors++;
  }
  return result; // Nested/parallel operation sums are explanatory, not exclusive command wall time.
}

export function assertOwnedPath(root, target) {
  if (!fs.existsSync(root)) throw new Error("owned benchmark temporary root does not exist");
  const relative = path.relative(canonicalPath(root), canonicalPath(target));
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("benchmark path must stay inside its owned temporary directory");
}

export async function addOwnedWorktree(source, sha, { temporary, repoRoot, attempted, git = checked }) {
  assertOwnedPath(temporary, source);
  // Git can register a worktree before checkout, a hook or a timeout fails.
  attempted.push(source);
  await git("git", ["worktree", "add", "--detach", source, sha], { cwd: repoRoot });
}

export async function removeOwnedWorktrees({ temporary, repoRoot, attempted }, git = checked) {
  const records = [];
  if (!attempted.length) return records;
  let registered;
  try {
    const listing = await git("git", ["worktree", "list", "--porcelain", "-z"], { cwd: repoRoot, timeoutMs: MINUTE });
    registered = new Set(listing.split("\0").filter(line => line.startsWith("worktree ")).map(line => canonicalPath(line.slice(9))));
  } catch (error) { return [{ status: "error", message: `cannot establish worktree registration: ${error.message}` }]; }
  for (const source of [...attempted].reverse()) {
    const start = performance.now();
    try {
      assertOwnedPath(temporary, source);
      if (!registered.has(canonicalPath(source))) { records.push({ source, status: "not_registered", durationMs: performance.now() - start }); continue; }
      await git("git", ["worktree", "remove", "--force", source], { cwd: repoRoot, timeoutMs: MINUTE });
      records.push({ source, status: "ok", durationMs: performance.now() - start });
    } catch (error) { records.push({ source, status: "error", durationMs: performance.now() - start, message: error.message }); }
  }
  return records;
}

// cross-spawn handles Windows .cmd executables; arguments stay arrays, never shell-built strings.
export async function runCommand(executable, args, { cwd, env = process.env, timeoutMs = COMMAND_TIMEOUT, stdoutFile, stderrFile } = {}) {
  const startedAt = new Date().toISOString(), start = performance.now();
  let stdout = "", stderr = "", timedOut = false, spawnError = null, killError = null, stopping = Promise.resolve();
  const out = stdoutFile && fs.openSync(stdoutFile, "w"), err = stderrFile && fs.openSync(stderrFile, "w");
  try {
    return await new Promise(resolve => {
      const child = spawn(executable, args, { cwd, env, shell: false, detached: process.platform !== "win32", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      child.stdout.on("data", data => { if (out !== undefined && out !== false) fs.writeSync(out, data); stdout += data.toString(); });
      child.stderr.on("data", data => { if (err !== undefined && err !== false) fs.writeSync(err, data); stderr += data.toString(); });
      const timer = setTimeout(() => {
        timedOut = true;
        stopping = new Promise(done => {
          if (!child.pid) return done();
          if (process.platform === "win32") {
            const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore", shell: false });
            killer.on("error", error => { killError = error.message; child.kill("SIGKILL"); });
            killer.on("close", code => { if (code !== 0) child.kill("SIGKILL"); done(); });
          } else {
            try { process.kill(-child.pid, "SIGKILL"); } catch (error) { if (error.code !== "ESRCH") killError = error.message; child.kill("SIGKILL"); }
            done();
          }
        });
      }, timeoutMs);
      child.on("error", error => { spawnError = error.message; });
      child.on("close", async (exitCode, signal) => {
        clearTimeout(timer);
        await stopping;
        resolve({ executable, args, startedAt, endedAt: new Date().toISOString(), durationMs: performance.now() - start, exitCode, signal, timedOut, spawnError, killError, stdout, stderr });
      });
    });
  } finally { if (out !== undefined && out !== false) fs.closeSync(out); if (err !== undefined && err !== false) fs.closeSync(err); }
}

async function checked(executable, args, options) {
  const result = await runCommand(executable, args, options);
  if (result.exitCode !== 0 || result.timedOut || result.spawnError) throw new Error(`${executable} failed: ${result.stderr || result.spawnError || result.exitCode}`);
  return result.stdout.trim();
}
function writeReport(directory, report) {
  fs.writeFileSync(path.join(directory, "report.json"), JSON.stringify(report, null, 2) + "\n");
  if (report.summary) {
    const rows = Object.entries(report.summary.groups).map(([name, group]) => `| ${name} | ${group.wallMs?.count ?? 0} | ${group.wallMs?.median?.toFixed(1) ?? "unknown"} | ${group.wallMs?.min?.toFixed(1) ?? "unknown"}–${group.wallMs?.max?.toFixed(1) ?? "unknown"} | ${group.valid} |`);
    const byteRows = Object.entries(report.summary.groups).map(([name, group]) => `| ${name} | ${group.fixtureCopiedBytes?.median ?? "not measured"} | ${group.fixtureActualCopiedBytes?.median ?? "not measured"} | ${group.fixtureSyntheticBytes?.median ?? "not measured"} | ${group.fixturePreparationDeltaBytes?.median ?? "not measured"} | ${group.fixtureTotalBytes?.median ?? "not measured"} |`);
    const text = `Issue #245 benchmark: ${report.summary.status}\n\nMode: ${report.mode ?? "setup failed"}. Stage: ${report.stage}. Frozen baseline: ${report.frozenBaseline === true}. Core acceptance: ${report.summary.coreAcceptance ?? "see status; baseline-only claims no acceptance"}.\n\nAll command times include internal preparation and cleanup; harness source checkout/npm ci/inventory are excluded.\n\n| Source / command / concurrency | Rounds | Median ms | Range ms | Complete and successful |\n|---|---:|---:|---:|---|\n${rows.join("\n")}\n\nMedian content-byte measurements (not physical I/O). Synthetic writes and signed preparation deltas remain separate from the copy-reduction gate. No baseline total-fixture reduction is claimed.\n\n| Source / command / concurrency | Controlled copy lower bound | Actual copied | Synthetic | Signed preparation delta | Final fixture total |\n|---|---:|---:|---:|---:|---:|\n${byteRows.join("\n")}\n\nFailures: ${report.failures.length}. Baseline-only measurements do not claim speed improvement.\n`;
    fs.writeFileSync(path.join(directory, "summary.md"), text);
  }
}
function readProfiles(directory) {
  const events = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".ndjson")) continue;
    for (const line of fs.readFileSync(path.join(directory, entry.name), "utf8").split(/\r?\n/).filter(Boolean)) {
      const event = JSON.parse(line);
      if (typeof event.phase !== "string" || !Number.isFinite(event.durationMs) || !["ok", "error"].includes(event.status)) throw new Error(`invalid phase record in ${entry.name}`);
      events.push(event);
    }
  }
  return events;
}
async function environment() {
  const probe = { timeoutMs: 20_000 };
  const python = JSON.parse(await checked("python", ["-c", "import json,sys; print(json.dumps({'version':'.'.join(map(str,sys.version_info[:3])), 'executable':sys.executable}))"], probe));
  const codex = await checked("codex", ["--version"], probe), git = await checked("git", ["--version"], probe), npm = await checked("npm", ["--version"], probe);
  const availableParallelism = os.availableParallelism();
  return { node: process.version, python, codex, git, npm, nodeOptionsInherited: Boolean(process.env.NODE_OPTIONS), platform: process.platform, arch: process.arch, release: os.release(), cpuModel: os.cpus()[0]?.model ?? null, logicalCpus: os.cpus().length, availableParallelism, defaultConcurrency: Math.max(1, availableParallelism - 1), totalMemory: os.totalmem(), runner: Object.fromEntries(["RUNNER_OS", "RUNNER_ARCH", "RUNNER_ENVIRONMENT", "ImageOS", "ImageVersion", "GITHUB_RUN_ID", "GITHUB_RUN_ATTEMPT", "GITHUB_SHA"].map(name => [name, process.env[name] ?? null])) };
}

export async function benchmark(options, repoRoot = ROOT) {
  const stage = options.stage ?? "core";
  const reportDir = path.resolve(options.reportDir);
  fs.mkdirSync(reportDir, { recursive: true });
  if (fs.existsSync(path.join(reportDir, "report.json"))) throw new Error("report directory already contains a run; use a fresh directory");
  const report = { schemaVersion: 1, stage, copyMeasurementDomain: COPY_MEASUREMENT_DOMAIN, candidateCopyMeasurementDomain: "actual verified repository input copy bytes; synthetic writes and signed preparation deltas are separate, not physical I/O", startedAt: new Date().toISOString(), options: { ...options, stage, reportDir }, sources: {}, samples: [], preparation: [], cleanup: [], failures: [], summary: null };
  const started = performance.now(), temporary = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "mj-ci-benchmark-")), attempted = [];
  let baselineOnly = options.baselineOnly;
  const inventories = {};
  try {
    report.environment = await environment();
    const pinned = report.environment.node === "v22.23.3" && report.environment.python.version === "3.12.10" && /^codex-cli 0\.147\.0\b/.test(report.environment.codex);
    if (!pinned) throw new Error("benchmark requires Node 22.23.3, Python 3.12.10 and Codex CLI 0.147.0");
    let baselineSha = options.baselineSha;
    const configFile = path.join(repoRoot, "config/ci-performance-baseline.json");
    const config = fs.existsSync(configFile) ? validateBaselineConfig(JSON.parse(fs.readFileSync(configFile, "utf8"))) : null;
    if (!baselineSha && !baselineOnly && config) baselineSha = config.baselineSha;
    if (!baselineSha) baselineOnly = true;
    if (baselineOnly) baselineSha = options.candidateSha;
    if (!SHA.test(baselineSha)) throw new Error("frozen baseline must contain a full commit SHA");
    report.mode = baselineOnly ? "baseline_only" : "comparison";
    report.frozenBaseline = !baselineOnly && config?.baselineSha === baselineSha;
    if (stage === "fixtures" && (!report.frozenBaseline || baselineOnly)) throw new Error("fixtures stage requires the registered frozen baseline");
    report.baselineProvenance = baselineOnly ? "candidate baseline-only; no frozen comparison" : report.frozenBaseline ? "repository baseline config" : "explicit SHA; not a frozen acceptance baseline";
    const sources = baselineOnly ? { baseline: baselineSha } : { baseline: baselineSha, candidate: options.candidateSha };
    for (const [name, sha] of Object.entries(sources)) {
      const source = path.join(temporary, name); assertOwnedPath(temporary, source);
      const start = performance.now();
      await addOwnedWorktree(source, sha, { temporary, repoRoot, attempted });
      const actualSha = await checked("git", ["rev-parse", "HEAD"], { cwd: source });
      if (actualSha !== sha) throw new Error("source checkout does not match exact requested SHA");
      const tree = await checked("git", ["rev-parse", "HEAD^{tree}"], { cwd: source });
      if (name === "baseline" && report.frozenBaseline && tree !== config.baselineTree) throw new Error("frozen baseline tree does not match the actual source commit");
      const scale = parseTreeListing(await checked("git", ["ls-tree", "-r", "-l", "-z", "HEAD"], { cwd: source }));
      // Only the legacy baseline needs a controlled checkout lower-bound map.
      // Candidate actual copy accounting comes exclusively from verified helper records.
      inventories[name] = name === "baseline" ? scale.entries.map(entry => ({ ...entry, checkoutBytes: fs.lstatSync(path.join(source, entry.path)).size })) : null;
      await checked("npm", ["ci"], { cwd: source });
      report.sources[name] = { sha, tree, controlledFiles: scale.files, controlledBytes: scale.bytes, checkoutBytes: inventories[name]?.reduce((sum, entry) => sum + entry.checkoutBytes, 0) ?? null, checkoutInventory: name === "baseline" ? "controlled files statted outside measured commands" : "not_measured; no candidate checkout size scan", workspace: source };
      report.preparation.push({ source: name, durationMs: performance.now() - start, status: "ok", excludedFromCommandWall: true });
    }
    if (!baselineOnly) {
      const differences = await checked("git", ["diff", "--name-only", baselineSha, options.candidateSha, "--", ...RUNTIME_PATHS], { cwd: repoRoot });
      if (differences) throw new Error(`runtime/catalog/version differences invalidate performance equivalence: ${differences}`);
      report.runtimeEquivalence = { ok: true, paths: RUNTIME_PATHS };
    }
    const plan = makePlan(options.repetitions, baselineOnly, stage);
    report.plannedSamples = plan.length;
    writeReport(reportDir, report);
    for (const sample of plan) {
      const remaining = RUN_BUDGET - (performance.now() - started);
      if (remaining < MINUTE) throw new Error("benchmark job budget exhausted before next sample; no replacement rounds are allowed");
      const directory = path.join(reportDir, sample.id); fs.mkdirSync(directory);
      const cwd = report.sources[sample.source].workspace;
      await checked("git", ["diff", "--exit-code", "HEAD"], { cwd });
      const command = commandFor(sample);
      const result = await runCommand(command.executable, command.args, { cwd, env: { ...process.env, MJ_PERF_DIR: directory, REQUIRE_PWSH: "1", REQUIRE_PYTHON: "1" }, timeoutMs: Math.min(COMMAND_TIMEOUT, remaining - 30_000), stdoutFile: path.join(directory, "stdout.log"), stderrFile: path.join(directory, "stderr.log") });
      const output = inspectOutput(sample.command, result.stdout);
      let phases = [], profileError = null;
      try { phases = readProfiles(directory); if (!phases.length) profileError = "no phase records were produced"; } catch (error) { profileError = error.message; }
      const copies = sample.source === "baseline" ? copiedInventory(phases, cwd, inventories[sample.source]) : null;
      const fixtureTotals = sample.source === "candidate" && sample.command !== "smoke" ? actualFixtureInventory(phases, cwd, sample.command === "canonical" ? { "release-verify-install": 7 } : FIXTURE_COUNTS) : null;
      if (fixtureTotals && !fixtureTotals.valid) profileError = [profileError, ...fixtureTotals.errors].filter(Boolean).join("; ");
      const { stdout, stderr, ...metadata } = result;
      const record = { ...sample, ...metadata, output, phases, phaseSummary: phaseSummary(phases), profileError, copies, fixtureTotals, fixtureCopiedBytes: copies?.bytes ?? null, fixtureActualCopiedBytes: fixtureTotals?.copiedBytes ?? null, fixtureSyntheticBytes: fixtureTotals?.syntheticBytes ?? null, fixturePreparationDeltaBytes: fixtureTotals?.preparationDeltaBytes ?? null, fixtureTotalBytes: fixtureTotals?.fixtureTotalBytes ?? null, ok: result.exitCode === 0 && !result.timedOut && !result.spawnError && !result.killError && output.ok && !profileError };
      report.samples.push(record);
      writeReport(reportDir, report);
      process.stderr.write(`[benchmark ${report.samples.length}/${plan.length}] ${sample.id}: ${record.ok ? "ok" : "error"}, ${record.durationMs.toFixed(1)} ms\n`);
      if (!record.ok) throw new Error(`sample ${sample.id} failed; preserve this run without replacement samples`);
    }
  } catch (error) { report.failures.push({ at: new Date().toISOString(), message: error.stack ?? error.message }); }
  finally {
    report.cleanup = await removeOwnedWorktrees({ temporary, repoRoot, attempted });
    for (const record of report.cleanup.filter(item => item.status === "error")) report.failures.push({ message: record.message });
    try {
      if (report.cleanup.some(item => item.status === "error")) throw new Error(`retained owned temporary root after worktree cleanup failure: ${temporary}`);
      const relative = path.relative(canonicalPath(os.tmpdir()), canonicalPath(temporary));
      if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("unsafe benchmark temporary root cleanup");
      await fs.promises.rm(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch (error) { report.failures.push({ message: `temporary cleanup failed: ${error.message}` }); }
    report.endedAt = new Date().toISOString();
    report.durationMs = performance.now() - started;
    report.summary = summarize(report.samples, { repetitions: options.repetitions, stage, baselineOnly, frozenBaseline: report.frozenBaseline, defaultConcurrency: report.environment?.defaultConcurrency, eligibleEnvironment: report.environment?.platform === "win32", complete: !report.failures.length && report.samples.length === report.plannedSamples });
    writeReport(reportDir, report);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = await benchmark(parseOptions(process.argv.slice(2)));
    process.stdout.write(JSON.stringify({ report: path.join(report.options.reportDir, "report.json"), mode: report.mode, failures: report.failures, summary: report.summary }, null, 2) + "\n");
    if (report.failures.length || !["baseline_only", "fixtures_pass", "pass"].includes(report.summary.status)) process.exitCode = 1;
  } catch (error) { process.stderr.write(`${error.stack ?? error}\n`); process.exitCode = 1; }
}
