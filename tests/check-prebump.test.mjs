// Tests for scripts/check-prebump.mjs — the develop-pre-bump policy evaluator (plan §2.6).
//
// Policy source: [ADR]_Develop_PreBump_Adoption. develop's VERSION must sit exactly one
// patch ahead of main after each release; a 72h grace window follows a release.

import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { evaluatePrebump, compareVersions, parseVersion } from "../scripts/check-prebump.mjs";

const SCRIPT = fileURLToPath(new URL("../scripts/check-prebump.mjs", import.meta.url));
const HOUR = 3600;
const RELEASED_AT = 1780000000;

/** A pre-bumped develop, evaluated 1h after main's VERSION last moved. */
function evalWith(overrides = {}) {
  return evaluatePrebump({
    developVersion: "6.3.2",
    mainVersion: "6.3.1",
    mainVersionCommitEpoch: RELEASED_AT,
    nowEpoch: RELEASED_AT + HOUR,
    mode: "push",
    graceHours: 72,
    ...overrides,
  });
}

// ------------------------------------------------------------------ version parsing
test("parseVersion accepts a plain X.Y.Z", () => {
  assert.deepEqual(parseVersion("6.3.2"), { major: 6, minor: 3, patch: 2 });
  assert.deepEqual(parseVersion("0.0.0"), { major: 0, minor: 0, patch: 0 });
  assert.deepEqual(parseVersion("10.20.30"), { major: 10, minor: 20, patch: 30 });
});

test("parseVersion rejects anything that is not exactly X.Y.Z", () => {
  // The repo's VERSION is pure-patch style with no -dev suffix (per the pre-bump ADR),
  // so anything else is a typo the gate should refuse rather than silently coerce.
  for (const v of ["6.3", "6.3.2.1", "v6.3.2", "6.3.2-dev", "6.3.2 ", "", "abc", "6.3.x", "6..2", "-1.0.0"]) {
    assert.equal(parseVersion(v), null, `should reject: ${JSON.stringify(v)}`);
  }
});

test("parseVersion rejects leading zeros", () => {
  // "6.03.2" is not valid SemVer and is almost always a hand-edit typo.
  for (const v of ["6.03.2", "06.3.2", "6.3.02"]) {
    assert.equal(parseVersion(v), null, `should reject: ${v}`);
  }
});

test("compareVersions orders numerically, not lexically", () => {
  // The bug this pins: string comparison puts "6.3.10" before "6.3.9".
  assert.ok(compareVersions("6.3.10", "6.3.9") > 0);
  assert.ok(compareVersions("6.4.0", "6.3.99") > 0);
  assert.ok(compareVersions("7.0.0", "6.99.99") > 0);
  assert.ok(compareVersions("6.3.2", "6.3.2") === 0);
  assert.ok(compareVersions("6.3.1", "6.3.2") < 0);
  assert.ok(compareVersions("10.0.0", "9.0.0") > 0);
});

// ------------------------------------------------------------------ the truth table
test("develop ahead of main is prebumped, in either mode", () => {
  for (const mode of ["push", "enforce"]) {
    const r = evalWith({ mode });
    assert.equal(r.state, "prebumped");
    assert.equal(r.ok, true);
  }
});

test("a numerically-ahead develop is prebumped even when lexically behind", () => {
  const r = evalWith({ developVersion: "6.3.10", mainVersion: "6.3.9" });
  assert.equal(r.state, "prebumped");
  assert.equal(r.ok, true);
});

test("develop equal to main inside the grace window is ok, in either mode", () => {
  for (const mode of ["push", "enforce"]) {
    const r = evalWith({ developVersion: "6.3.1", mode, nowEpoch: RELEASED_AT + 71 * HOUR });
    assert.equal(r.state, "grace");
    assert.equal(r.ok, true);
  }
});

test("the grace window is exclusive at its upper bound", () => {
  // 72h exactly is already overdue: the ADR's window is "within 72h".
  const at72 = evalWith({ developVersion: "6.3.1", nowEpoch: RELEASED_AT + 72 * HOUR });
  assert.equal(at72.state, "overdue");

  const justUnder = evalWith({ developVersion: "6.3.1", nowEpoch: RELEASED_AT + 72 * HOUR - 1 });
  assert.equal(justUnder.state, "grace");
});

test("develop equal to main past the grace window is overdue", () => {
  const r = evalWith({ developVersion: "6.3.1", nowEpoch: RELEASED_AT + 100 * HOUR });
  assert.equal(r.state, "overdue");
});

test("overdue blocks only in enforce mode", () => {
  const args = { developVersion: "6.3.1", nowEpoch: RELEASED_AT + 100 * HOUR };
  assert.equal(evalWith({ ...args, mode: "push" }).ok, true, "push mode never blocks (ADR: 永不阻塞)");
  assert.equal(evalWith({ ...args, mode: "enforce" }).ok, false);
});

test("develop behind main is inverted, and blocks only in enforce mode", () => {
  const args = { developVersion: "6.3.0", mainVersion: "6.3.1" };
  assert.equal(evalWith({ ...args, mode: "push" }).state, "inverted");
  assert.equal(evalWith({ ...args, mode: "push" }).ok, true);
  assert.equal(evalWith({ ...args, mode: "enforce" }).ok, false);
});

test("inverted is independent of the grace window", () => {
  // A rollback is wrong immediately; there is nothing to wait for.
  const fresh = evalWith({ developVersion: "6.3.0", mainVersion: "6.3.1", nowEpoch: RELEASED_AT + 1 });
  assert.equal(fresh.state, "inverted");
});

test("ageSeconds reports the real elapsed time and zero is allowed", () => {
  assert.equal(evalWith({ nowEpoch: RELEASED_AT + 5000 }).ageSeconds, 5000);
  assert.equal(evalWith({ nowEpoch: RELEASED_AT }).ageSeconds, 0);
});

test("every result carries a non-empty reason", () => {
  for (const args of [
    {},
    { developVersion: "6.3.1" },
    { developVersion: "6.3.1", nowEpoch: RELEASED_AT + 100 * HOUR },
    { developVersion: "6.3.0", mainVersion: "6.3.1" },
  ]) {
    const r = evalWith(args);
    assert.equal(typeof r.reason, "string");
    assert.ok(r.reason.length > 0);
  }
});

// ------------------------------------------------------------------ input validation
test("evaluatePrebump rejects an unknown mode", () => {
  for (const mode of ["ENFORCE", "Push", "warn", "", null, undefined, 1]) {
    assert.throws(() => evalWith({ mode }), TypeError, `should reject mode: ${JSON.stringify(mode)}`);
  }
});

test("evaluatePrebump rejects a malformed version on either side", () => {
  assert.throws(() => evalWith({ developVersion: "6.3" }), TypeError);
  assert.throws(() => evalWith({ mainVersion: "not-a-version" }), TypeError);
  assert.throws(() => evalWith({ developVersion: "6.3.2-dev" }), TypeError);
});

test("evaluatePrebump rejects a non-integer or negative epoch", () => {
  for (const bad of [NaN, Infinity, -1, 1.5, "1780000000", null, undefined]) {
    assert.throws(() => evalWith({ mainVersionCommitEpoch: bad }), TypeError, `epoch: ${bad}`);
    assert.throws(() => evalWith({ nowEpoch: bad }), TypeError, `now: ${bad}`);
  }
});

test("evaluatePrebump rejects a clock that runs backwards", () => {
  // now < the commit epoch means a broken clock or a wrong ref; guessing would silently
  // hand back a bogus grace verdict, so refuse instead.
  assert.throws(() => evalWith({ nowEpoch: RELEASED_AT - 1 }), TypeError);
});

test("evaluatePrebump rejects a nonsensical grace window", () => {
  for (const bad of [-1, NaN, Infinity, "72", null, undefined]) {
    assert.throws(() => evalWith({ graceHours: bad }), TypeError, `graceHours: ${bad}`);
  }
});

test("a zero-hour grace window is legal and makes equality immediately overdue", () => {
  const r = evalWith({ developVersion: "6.3.1", graceHours: 0, nowEpoch: RELEASED_AT });
  assert.equal(r.state, "overdue");
});

// ------------------------------------------------------------------ CLI contract
function runCli(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
}

const BASE_ARGS = [
  "--develop-version", "6.3.2",
  "--main-version", "6.3.1",
  "--main-version-epoch", String(RELEASED_AT),
  "--now-epoch", String(RELEASED_AT + HOUR),
  "--mode", "push",
  "--grace-hours", "72",
];

function withArgs(overrides) {
  const a = [...BASE_ARGS];
  for (const [flag, value] of Object.entries(overrides)) {
    const i = a.indexOf(flag);
    if (i === -1) a.push(flag, value);
    else a[i + 1] = value;
  }
  return a;
}

test("CLI prints exactly one line of stable JSON and exits 0 when prebumped", () => {
  const r = runCli(BASE_ARGS);
  assert.equal(r.status, 0);
  const lines = r.stdout.trimEnd().split("\n");
  assert.equal(lines.length, 1, "stdout must be a single line");
  const j = JSON.parse(lines[0]);
  assert.equal(j.state, "prebumped");
  assert.equal(j.ok, true);
  assert.equal(j.ageSeconds, HOUR);
});

test("CLI exits 1 for overdue under enforce", () => {
  const r = runCli(withArgs({ "--develop-version": "6.3.1", "--mode": "enforce", "--now-epoch": String(RELEASED_AT + 100 * HOUR) }));
  assert.equal(r.status, 1);
  assert.equal(JSON.parse(r.stdout.trim()).state, "overdue");
});

test("CLI exits 0 for overdue under push, and says so on stderr", () => {
  const r = runCli(withArgs({ "--develop-version": "6.3.1", "--now-epoch": String(RELEASED_AT + 100 * HOUR) }));
  assert.equal(r.status, 0, "push mode must never block — [ADR]_Develop_PreBump_Adoption");
  assert.equal(JSON.parse(r.stdout.trim()).state, "overdue");
  assert.match(r.stderr, /overdue/i, "the warning belongs on stderr, keeping stdout pure JSON");
});

test("CLI exits 1 for inverted under enforce and 0 under push", () => {
  const inverted = { "--develop-version": "6.3.0", "--main-version": "6.3.1" };
  assert.equal(runCli(withArgs({ ...inverted, "--mode": "enforce" })).status, 1);
  assert.equal(runCli(withArgs(inverted)).status, 0);
});

test("CLI exits 2 on bad arguments rather than guessing", () => {
  assert.equal(runCli([]).status, 2, "no args");
  assert.equal(runCli(withArgs({ "--mode": "warn" })).status, 2, "unknown mode");
  assert.equal(runCli(withArgs({ "--develop-version": "6.3" })).status, 2, "bad semver");
  assert.equal(runCli(withArgs({ "--now-epoch": "abc" })).status, 2, "bad epoch");
  assert.equal(runCli(withArgs({ "--grace-hours": "-5" })).status, 2, "bad grace");
  assert.equal(runCli([...BASE_ARGS, "--unknown-flag", "x"]).status, 2, "unknown flag");
  assert.equal(runCli([...BASE_ARGS, "--mode"]).status, 2, "flag with no value");
});

test("CLI exits 2 on a backwards clock", () => {
  const r = runCli(withArgs({ "--now-epoch": String(RELEASED_AT - 1) }));
  assert.equal(r.status, 2);
});

test("CLI writes nothing to stdout on an argument error", () => {
  // The workflow parses stdout as JSON; emitting half a result on error would poison it.
  const r = runCli(withArgs({ "--mode": "warn" }));
  assert.equal(r.stdout, "");
  assert.ok(r.stderr.length > 0);
});

test("CLI defaults the grace window to the ADR's 72h when not given", () => {
  // The evaluator itself refuses to assume a window; the documented 72h default lives here,
  // in the CLI. Probe both sides of that boundary with --grace-hours omitted entirely.
  const noGrace = (nowEpoch) => [
    "--develop-version", "6.3.1",
    "--main-version", "6.3.1",
    "--main-version-epoch", String(RELEASED_AT),
    "--now-epoch", String(nowEpoch),
    "--mode", "push",
  ];

  const inside = runCli(noGrace(RELEASED_AT + 71 * HOUR));
  assert.equal(inside.status, 0);
  assert.equal(JSON.parse(inside.stdout.trim()).state, "grace", "71h must fall inside a defaulted 72h window");

  const outside = runCli(noGrace(RELEASED_AT + 73 * HOUR));
  assert.equal(JSON.parse(outside.stdout.trim()).state, "overdue", "73h must fall outside it");
});

test("evaluatePrebump refuses to assume a grace window", () => {
  // Guards the decision above: the 72h default must not creep back into the evaluator,
  // where it would silently pick a policy on the caller's behalf.
  assert.throws(
    () => evaluatePrebump({
      developVersion: "6.3.2",
      mainVersion: "6.3.1",
      mainVersionCommitEpoch: RELEASED_AT,
      nowEpoch: RELEASED_AT + HOUR,
      mode: "push",
    }),
    TypeError,
  );
});
