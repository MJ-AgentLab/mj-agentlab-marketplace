// Tests for scripts/run-cli.mjs and the pure comparison logic in check-tool-versions.mjs.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnCli, runCli } from "../scripts/run-cli.mjs";
import { evaluateVersion, extractVersion, parseSemver, compareSemver } from "../scripts/check-tool-versions.mjs";

// ------------------------------------------------------------------ run-cli
test("runCli captures stdout and a zero exit status", async () => {
  const r = await runCli(process.execPath, ["-e", "process.stdout.write('hello')"]);
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "hello");
});

test("runCli reports a non-zero exit status without throwing", async () => {
  const r = await runCli(process.execPath, ["-e", "process.exit(3)"]);
  assert.equal(r.status, 3);
});

test("runCli captures stderr", async () => {
  const r = await runCli(process.execPath, ["-e", "process.stderr.write('boom')"]);
  assert.equal(r.stderr, "boom");
});

test("runCli returns an error object for a missing command instead of throwing", async () => {
  const r = await runCli("definitely-not-a-real-command-xyz", ["--version"]);
  assert.ok(r.error, "expected an error for a missing executable");
  assert.equal(r.status, null);
});

test("runCli honours timeoutMs", async () => {
  const r = await runCli(process.execPath, ["-e", "setTimeout(()=>{}, 60000)"], { timeoutMs: 300 });
  assert.ok(r.error, "expected a timeout error");
  assert.match(r.error.message, /timed out/);
});

test("args are passed as a real argv array — no shell re-interpretation", async () => {
  // A path with spaces, quotes and CJK must survive verbatim. This is the property that makes
  // shell:false mandatory: through a shell, this argument would be split or mangled.
  const tricky = 'C:/tmp/我的 项目/a b/"q".md';
  const r = await runCli(process.execPath, ["-e", "process.stdout.write(process.argv[1])", tricky]);
  assert.equal(r.stdout, tricky);
});

test("spawnCli rejects options.shell", () => {
  assert.throws(() => spawnCli("node", ["-v"], { shell: true }), TypeError);
});

test("spawnCli validates its arguments", () => {
  assert.throws(() => spawnCli("", []), TypeError);
  assert.throws(() => spawnCli("node", "not-an-array"), TypeError);
  assert.throws(() => spawnCli("node", [1, 2]), TypeError);
});

test("spawnCli returns a live child process", async () => {
  const child = spawnCli(process.execPath, ["-e", "process.exit(0)"]);
  const code = await new Promise((r) => child.on("close", r));
  assert.equal(code, 0);
});

// ------------------------------------------------------- version comparison
test("parseSemver / compareSemver basics", () => {
  assert.deepEqual(parseSemver("2.1.211"), { major: 2, minor: 1, patch: 211 });
  assert.equal(parseSemver("not-a-version"), null);
  assert.ok(compareSemver("2.1.211", "2.1.210") > 0);
  assert.ok(compareSemver("2.1.210", "2.1.211") < 0);
  assert.equal(compareSemver("1.0.0", "1.0.0"), 0);
  // Numeric, not lexicographic: "2.1.9" < "2.1.10".
  assert.ok(compareSemver("2.1.9", "2.1.10") < 0);
});

test("extractVersion pulls the version out of real --version output shapes", () => {
  assert.equal(extractVersion("codex-cli 0.144.3"), "0.144.3");
  assert.equal(extractVersion("2.1.211 (Claude Code)"), "2.1.211");
  assert.equal(extractVersion("uv 0.11.21 (5aa65dd7a 2026-06-11 x86_64-pc-windows-msvc)"), "0.11.21");
  assert.equal(extractVersion("no version here"), null);
});

// Supply-chain inputs are pinned exactly; the rolling host CLI is a minimum.
test("exact-pinned tools reject any drift", () => {
  for (const tool of ["codex", "uv", "bridge", "nlm"]) {
    assert.equal(evaluateVersion(tool, "1.2.3", "1.2.3").ok, true);
    assert.equal(evaluateVersion(tool, "1.2.3", "1.2.4").ok, false, `${tool} must reject a newer patch`);
    assert.equal(evaluateVersion(tool, "1.2.3", "1.2.2").ok, false, `${tool} must reject an older patch`);
  }
});

test("claude is a minimum: newer passes, older fails", () => {
  assert.equal(evaluateVersion("claude", "2.1.210", "2.1.210").ok, true);
  // The actual local version at implementation time — must not redden the build.
  assert.equal(evaluateVersion("claude", "2.1.210", "2.1.211").ok, true);
  assert.equal(evaluateVersion("claude", "2.1.210", "2.2.0").ok, true);
  assert.equal(evaluateVersion("claude", "2.1.210", "2.1.209").ok, false);
  assert.equal(evaluateVersion("claude", "2.1.210", "2.0.999").ok, false);
});

test("evaluateVersion reports the comparison mode it used", () => {
  assert.equal(evaluateVersion("claude", "2.1.210", "2.1.211").mode, "minimum");
  assert.equal(evaluateVersion("codex", "0.144.3", "0.144.3").mode, "exact");
});

test("undetected or unparseable versions fail closed", () => {
  assert.equal(evaluateVersion("codex", "0.144.3", null).ok, false);
  assert.equal(evaluateVersion("codex", "0.144.3", null).reason, "not-detected");
  assert.equal(evaluateVersion("codex", "0.144.3", "garbage").ok, false);
  assert.equal(evaluateVersion("codex", "0.144.3", "garbage").reason, "unparseable");
});

test("unknown tools fail closed", () => {
  assert.equal(evaluateVersion("mystery", "1.0.0", "1.0.0").ok, false);
});
