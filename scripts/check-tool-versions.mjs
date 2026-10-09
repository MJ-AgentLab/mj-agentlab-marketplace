#!/usr/bin/env node
// Exact Codex acceptance baseline; no retired runtime probes.
import { runCli } from "./run-cli.mjs";

const EXACT = new Set(["codex"]);
const MINIMUM = new Set();

const SEMVER = /^(\d+)\.(\d+)\.(\d+)/;

export function parseSemver(s) {
  const m = SEMVER.exec(String(s).trim());
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

export function compareSemver(a, b) {
  const x = parseSemver(a);
  const y = parseSemver(b);
  if (!x || !y) return null;
  return x.major - y.major || x.minor - y.minor || x.patch - y.patch;
}

/** Pure comparison so tests can drive it without spawning anything. */
export function evaluateVersion(tool, expected, actual) {
  if (actual == null) return { tool, expected, actual: null, ok: false, reason: "not-detected" };
  const cmp = compareSemver(actual, expected);
  if (cmp === null) return { tool, expected, actual, ok: false, reason: "unparseable" };
  if (EXACT.has(tool)) {
    return { tool, expected, actual, ok: cmp === 0, reason: cmp === 0 ? "exact-match" : "exact-mismatch", mode: "exact" };
  }
  if (MINIMUM.has(tool)) {
    return { tool, expected, actual, ok: cmp >= 0, reason: cmp >= 0 ? "minimum-satisfied" : "below-minimum", mode: "minimum" };
  }
  return { tool, expected, actual, ok: false, reason: "unknown-tool" };
}

/** Extract the first semver-looking token from a CLI's --version output. */
export function extractVersion(output) {
  const m = /(\d+\.\d+\.\d+)/.exec(String(output ?? ""));
  return m ? m[1] : null;
}

async function detectCli(command, args = ["--version"]) {
  const r = await runCli(command, args, { timeoutMs: 20000 });
  if (r.error || r.status !== 0) return null;
  return extractVersion(r.stdout || r.stderr);
}

async function detectAll() {
  return {codex: await detectCli('codex'), node: process.version.slice(1)};
}

function usage(msg) {
  process.stderr.write(
    `check-tool-versions: ${msg}\n` +
      `usage: node scripts/check-tool-versions.mjs [--codex X]\n` +
      `       node scripts/check-tool-versions.mjs --report-only\n`,
  );
  return 2;
}

async function main(argv) {
  const expected = {};
  let reportOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--report-only") {
      reportOnly = true;
      continue;
    }
    const m = /^--(codex)$/.exec(a);
    if (!m) return usage(`unknown argument: ${a}`);
    const v = argv[++i];
    if (v === undefined) return usage(`${a} requires a value`);
    if (!parseSemver(v)) return usage(`${a} value is not semver: ${v}`);
    expected[m[1]] = v;
  }
  if (reportOnly && Object.keys(expected).length) return usage("--report-only takes no pins");
  if (!reportOnly && Object.keys(expected).length === 0) return usage("no pins given; use --report-only to just print versions");

  const actual = await detectAll();

  if (reportOnly) {
    process.stdout.write(JSON.stringify(actual, null, 2) + "\n");
    return 0;
  }

  const results = Object.entries(expected).map(([tool, want]) => evaluateVersion(tool, want, actual[tool]));
  let failed = 0;
  for (const r of results) {
    const mode = r.mode === "minimum" ? ">=" : "==";
    const status = r.ok ? "OK  " : "FAIL";
    if (!r.ok) failed++;
    process.stdout.write(`${status} ${r.tool.padEnd(7)} ${mode} ${String(r.expected).padEnd(9)} actual=${r.actual ?? "<not detected>"}  (${r.reason})\n`);
  }
  process.stdout.write(`\n${failed} of ${results.length} pin(s) failed\n`);
  return failed ? 1 : 0;
}

if (process.argv[1]?.endsWith("check-tool-versions.mjs")) {
  main(process.argv.slice(2)).then((c) => process.exit(c));
}
