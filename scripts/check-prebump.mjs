#!/usr/bin/env node
// Develop pre-bump policy evaluator (plan §2.6; [ADR]_Develop_PreBump_Adoption).
//
//   node scripts/check-prebump.mjs --develop-version 7.0.1 --main-version 7.0.0 \
//        --main-version-epoch 1780000000 --now-epoch 1780003600 \
//        --mode enforce --grace-hours 72
//
// Exit 0 = policy satisfied (or a warning under push mode), 1 = policy violated,
// 2 = bad input / the check could not be run.
//
// Node stdlib only: this runs in CI ahead of any `npm ci`, and it must not import the
// version helpers in check-tool-versions.mjs — those reach run-cli.mjs and therefore
// cross-spawn, a devDependency. It also needs STRICTER parsing than those helpers, which
// deliberately match a leading semver substring.
//
// MODE, AND WHY BOTH EXIST:
//   push    — never blocks; emits a warning. This is the ratified policy:
//             [ADR]_Develop_PreBump_Adoption states the CI check "永不 exit 1" / "永不阻塞",
//             and [RUNBOOK]_Release_Operations §3.7 repeats it. verify-develop-prebumped.yml
//             uses this mode.
//   enforce — blocks on overdue/inverted. Specified by plan §2.6 and implemented here, but
//             NOT wired to any always-on gate: doing so would contradict the ADR above.
//             Reachable via workflow_dispatch for a deliberate hard check. Turning it on by
//             default is a policy change and needs its own ADR amendment first.
//
// The caller supplies both epochs explicitly. This script never resolves a git ref: the
// workflow decides what "main's VERSION last moved" means
// (`git log -1 --format=%ct origin/main -- VERSION`) and passes the number in.

const MODES = new Set(["push", "enforce"]);
const STRICT_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/** Parse an exact X.Y.Z. Returns null for anything else — including a -dev suffix. */
export function parseVersion(v) {
  if (typeof v !== "string") return null;
  const m = STRICT_SEMVER.exec(v);
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

/** Numeric ordering. Returns <0, 0, >0, or null if either side is unparseable. */
export function compareVersions(a, b) {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (!x || !y) return null;
  return x.major - y.major || x.minor - y.minor || x.patch - y.patch;
}

function requireEpoch(name, v) {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 0) {
    throw new TypeError(`${name} must be a non-negative integer epoch (got ${JSON.stringify(v)})`);
  }
}

/**
 * @param {{ developVersion: string, mainVersion: string, mainVersionCommitEpoch: number,
 *           nowEpoch: number, mode: "push"|"enforce", graceHours: number }} input
 * @returns {{ state: "prebumped"|"grace"|"overdue"|"inverted", ok: boolean,
 *             reason: string, ageSeconds: number }}
 */
// graceHours is deliberately NOT defaulted here. It is policy, not a fact, and a silent
// default would let a caller evaluate against a window nobody chose. The ADR's 72h lives in
// exactly one visible place: the CLI's argument default.
export function evaluatePrebump({ developVersion, mainVersion, mainVersionCommitEpoch, nowEpoch, mode, graceHours }) {
  if (!MODES.has(mode)) throw new TypeError(`mode must be "push" or "enforce" (got ${JSON.stringify(mode)})`);
  if (typeof graceHours !== "number" || !Number.isFinite(graceHours) || graceHours < 0) {
    throw new TypeError(`graceHours must be a non-negative finite number (got ${JSON.stringify(graceHours)})`);
  }
  requireEpoch("mainVersionCommitEpoch", mainVersionCommitEpoch);
  requireEpoch("nowEpoch", nowEpoch);

  const cmp = compareVersions(developVersion, mainVersion);
  if (cmp === null) {
    throw new TypeError(`versions must be exactly X.Y.Z (develop=${JSON.stringify(developVersion)}, main=${JSON.stringify(mainVersion)})`);
  }

  const ageSeconds = nowEpoch - mainVersionCommitEpoch;
  // A negative age means a broken clock or the wrong ref. Clamping it would silently
  // manufacture a "grace" verdict, which is the one answer that hides a real violation.
  if (ageSeconds < 0) {
    throw new TypeError(`nowEpoch (${nowEpoch}) precedes mainVersionCommitEpoch (${mainVersionCommitEpoch})`);
  }

  const graceSeconds = graceHours * 3600;

  if (cmp > 0) {
    return { state: "prebumped", ok: true, ageSeconds, reason: `develop ${developVersion} is ahead of main ${mainVersion}` };
  }

  if (cmp === 0) {
    if (ageSeconds < graceSeconds) {
      return {
        state: "grace",
        ok: true,
        ageSeconds,
        reason: `develop and main are both ${developVersion}; main's VERSION moved ${Math.floor(ageSeconds / 3600)}h ago, inside the ${graceHours}h grace window`,
      };
    }
    return {
      state: "overdue",
      ok: mode === "push",
      ageSeconds,
      reason: `develop and main are both ${developVersion} and main's VERSION moved ${Math.floor(ageSeconds / 3600)}h ago (>= ${graceHours}h grace) — the post-release pre-bump is overdue`,
    };
  }

  // A rollback is wrong on arrival; there is no window to wait out.
  return {
    state: "inverted",
    ok: mode === "push",
    ageSeconds,
    reason: `develop ${developVersion} is BEHIND main ${mainVersion} — hotfix not synced back, or VERSION rolled back`,
  };
}

// ------------------------------------------------------------------------------ CLI

const FLAGS = {
  "--develop-version": "developVersion",
  "--main-version": "mainVersion",
  "--main-version-epoch": "mainVersionCommitEpoch",
  "--now-epoch": "nowEpoch",
  "--mode": "mode",
  "--grace-hours": "graceHours",
};

function usage(msg) {
  process.stderr.write(
    `check-prebump: ${msg}\n` +
      `usage: node scripts/check-prebump.mjs --develop-version X.Y.Z --main-version X.Y.Z \\\n` +
      `         --main-version-epoch <int> --now-epoch <int> --mode push|enforce [--grace-hours 72]\n`,
  );
  return 2;
}

function main(argv) {
  const raw = {};
  for (let i = 0; i < argv.length; i++) {
    const key = FLAGS[argv[i]];
    if (!key) return usage(`unknown argument: ${argv[i]}`);
    const value = argv[++i];
    if (value === undefined) return usage(`${argv[i - 1]} requires a value`);
    raw[key] = value;
  }

  for (const need of ["developVersion", "mainVersion", "mainVersionCommitEpoch", "nowEpoch", "mode"]) {
    if (raw[need] === undefined) return usage(`missing required argument for ${need}`);
  }

  // Numbers arrive as strings from argv; convert strictly so "abc" or "1.5" reach the
  // evaluator as something it will reject rather than as NaN-shaped surprises.
  const toInt = (s) => (/^\d+$/.test(s) ? Number(s) : NaN);
  const input = {
    developVersion: raw.developVersion,
    mainVersion: raw.mainVersion,
    mainVersionCommitEpoch: toInt(raw.mainVersionCommitEpoch),
    nowEpoch: toInt(raw.nowEpoch),
    mode: raw.mode,
    graceHours: raw.graceHours === undefined ? 72 : /^\d+(\.\d+)?$/.test(raw.graceHours) ? Number(raw.graceHours) : NaN,
  };

  let result;
  try {
    result = evaluatePrebump(input);
  } catch (e) {
    return usage(e.message);
  }

  // stdout stays exactly one line of JSON so the workflow can parse it; everything human
  // goes to stderr.
  process.stdout.write(JSON.stringify(result) + "\n");

  if (result.state === "overdue" || result.state === "inverted") {
    const level = result.ok ? "WARNING" : "ERROR";
    process.stderr.write(`${level}: ${result.state} — ${result.reason}\n`);
    if (result.state === "overdue") {
      process.stderr.write(
        `Fix: on develop, run scripts/bump-version.ps1 -From ${input.developVersion} -To <next-patch>\n` +
          `See docs/runbook/[RUNBOOK]_Release_Operations.md §3.7\n`,
      );
    }
  }

  return result.ok ? 0 : 1;
}

if (process.argv[1]?.endsWith("check-prebump.mjs")) {
  process.exit(main(process.argv.slice(2)));
}
