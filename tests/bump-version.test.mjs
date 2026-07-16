// Tests for scripts/bump-version.ps1
//
// Runs the REAL script against a throwaway export of the tree, because the failure modes being
// guarded are all about which bytes in which files change — a mocked run would prove nothing.
//
// Requires pwsh. Skips when it is unavailable, unless REQUIRE_PWSH=1 (CI sets this so a missing
// shell cannot silently drop the whole suite).

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { runCli } from "../scripts/run-cli.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REQUIRE_PWSH = process.env.REQUIRE_PWSH === "1";

function pwshAvailable() {
  try {
    execSync("pwsh -NoProfile -Command exit 0", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
const HAVE_PWSH = pwshAvailable();
if (REQUIRE_PWSH) assert.ok(HAVE_PWSH, "REQUIRE_PWSH=1 but pwsh is not available");

const dirs = [];
test.after(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

/** A throwaway copy of the committed tree, with the WORKING-TREE scripts overlaid. */
function makeTree() {
  const work = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "bump-fixture-"));
  dirs.push(work);
  const posix = work.split(path.sep).join("/");
  execSync(`git archive HEAD | tar -x -C "${posix}"`, { cwd: REPO, stdio: "pipe", shell: "bash" });
  // Test the script as it stands now, not the committed one.
  fs.cpSync(path.join(REPO, "scripts"), path.join(work, "scripts"), { recursive: true });
  return work;
}

const read = (w, p) => fs.readFileSync(path.join(w, p), "utf8");
const version = (w, p) => JSON.parse(read(w, p)).version;

/** The README's historical-release lines. A bump must never rewrite these. */
const historyLines = (text) =>
  text
    .split(/\r?\n/)
    .filter((l) => /^- \*{0,2}v\d+\.\d+\.\d+/.test(l))
    .join("\n");

async function bump(work, from, to, scope) {
  const args = ["-NoProfile", "-File", "./scripts/bump-version.ps1", "-From", from, "-To", to];
  if (scope) args.push("-Scope", scope);
  return runCli("pwsh", args, { cwd: work, timeoutMs: 120000 });
}

test("plugin bump moves BOTH manifests in lockstep", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // The dual-host contract requires the two manifests to carry an identical version; bumping only
  // the legacy one leaves validate-dual-host reporting MANIFEST_FIELD_DRIFT and fails CI.
  const w = makeTree();
  const r = await bump(w, "3.2.1", "4.0.0", "learn-kit");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(version(w, "plugins/learn-kit/.claude-plugin/plugin.json"), "4.0.0");
  assert.equal(version(w, "plugins/learn-kit/.codex-plugin/plugin.json"), "4.0.0");
  assert.equal(JSON.parse(read(w, ".claude-plugin/marketplace.json")).plugins.find((p) => p.name === "learn-kit").version, "4.0.0");
});

test("plugin bump leaves the README history section byte-identical", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // Regression: a naive whole-file replace rewrote the marketplace's own
  // "- v3.2.1 — plugin.json schema 修复" history line into a fabricated "v4.0.0" entry, directly
  // above the real v4.0.0 line, because learn-kit's version happened to equal that release number.
  const w = makeTree();
  const before = historyLines(read(w, "README.md"));
  const r = await bump(w, "3.2.1", "4.0.0", "learn-kit");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(historyLines(read(w, "README.md")), before);
  assert.ok(read(w, "README.md").includes("- v3.2.1 — plugin.json schema"), "the real v3.2.1 release line must survive");
});

test("plugin bump does not rewrite version numbers inside prose", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // learn-kit's native longDescription names the NLM bridge 4.0.0 and connector 0.8.7. Bumping
  // FROM 4.0.0 with a naive replace would silently rewrite the bridge version in that sentence.
  const w = makeTree();
  await bump(w, "3.2.1", "4.0.0", "learn-kit");
  assert.ok(read(w, "plugins/learn-kit/.codex-plugin/plugin.json").includes("bridge 4.0.0 with connector 0.8.7"));

  const r = await bump(w, "4.0.0", "4.1.0", "learn-kit");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(version(w, "plugins/learn-kit/.codex-plugin/plugin.json"), "4.1.0", "root version must move");
  assert.ok(
    read(w, "plugins/learn-kit/.codex-plugin/plugin.json").includes("bridge 4.0.0 with connector 0.8.7"),
    "the bridge version in prose must NOT move",
  );
});

test("marketplace bump touches only VERSION, catalog metadata and the badge", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  const w = makeTree();
  const before = historyLines(read(w, "README.md"));
  const r = await bump(w, "6.3.2", "7.0.0", null);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(w, "VERSION").trim(), "7.0.0");
  assert.equal(JSON.parse(read(w, ".claude-plugin/marketplace.json")).metadata.version, "7.0.0");
  assert.ok(read(w, "README.md").includes("badge/version-7.0.0-blue"));
  assert.equal(historyLines(read(w, "README.md")), before);
  // Plugin versions are dual-layer independent and must not follow a marketplace bump.
  assert.equal(version(w, "plugins/learn-kit/.claude-plugin/plugin.json"), "3.2.1");
  assert.equal(version(w, "plugins/learn-kit/.codex-plugin/plugin.json"), "3.2.1");
});

test("the native catalog never gains a version", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  const w = makeTree();
  await bump(w, "6.3.2", "7.0.0", null);
  await bump(w, "3.2.1", "4.0.0", "learn-kit");
  const cat = JSON.parse(read(w, ".agents/plugins/marketplace.json"));
  assert.ok(!("version" in cat));
  assert.ok(!cat.metadata?.version);
  for (const p of cat.plugins) assert.ok(!("version" in p), `${p.name} must not carry a version`);
});

test("a wrong -From refuses and writes nothing", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  const w = makeTree();
  const before = read(w, "plugins/learn-kit/.claude-plugin/plugin.json");
  const r = await bump(w, "9.9.9", "9.9.10", "learn-kit");
  assert.notEqual(r.status, 0, "must exit non-zero");
  assert.match(r.stdout + r.stderr, /expected exactly 1 root version anchor/);
  assert.equal(read(w, "plugins/learn-kit/.claude-plugin/plugin.json"), before, "no partial write");
});

test("all three planned bumps leave validate-dual-host clean", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // The PR2 release candidate: learn-kit 3.2.1->4.0.0, diagram-kit 0.1.0->0.2.0,
  // marketplace 6.3.2->7.0.0. This is the sequence the plan actually runs.
  const w = makeTree();
  fs.cpSync(path.join(REPO, "node_modules"), path.join(w, "node_modules"), { recursive: true });
  for (const [from, to, scope] of [
    ["3.2.1", "4.0.0", "learn-kit"],
    ["0.1.0", "0.2.0", "diagram-kit"],
    ["6.3.2", "7.0.0", null],
  ]) {
    const r = await bump(w, from, to, scope);
    assert.equal(r.status, 0, `${scope ?? "marketplace"} ${from}->${to} failed: ${r.stdout}${r.stderr}`);
  }
  const v = await runCli("node", ["scripts/validate-dual-host.mjs", "--root", ".", "--host-neutral", "warn"], { cwd: w, timeoutMs: 60000 });
  assert.equal(v.status, 0, v.stdout);
  assert.match(v.stdout, /0 error\(s\)/);
});
