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
  assert.match(r.stdout + r.stderr, /expected exactly 1 anchor \(root version\)/);
  assert.match(r.stdout + r.stderr, /NOTHING was written/);
  assert.equal(read(w, "plugins/learn-kit/.claude-plugin/plugin.json"), before, "no partial write");
});

test("CLAUDE.md's plugin line is actually bumped", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // CLAUDE.md is the only version site with no CI net, and was the only one with no test.
  const w = makeTree();
  const r = await bump(w, "3.2.1", "4.0.0", "learn-kit");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(read(w, "CLAUDE.md"), /`learn-kit` v4\.0\.0/, "the plugin line must move");
  assert.ok(!/`learn-kit` v3\.2\.1/.test(read(w, "CLAUDE.md")), "no stale plugin line left");
});

test("CLAUDE.md's history section is not rewritten by a bump", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // Same class as the README history bug: CLAUDE.md's 历史版本记录 names past releases.
  const w = makeTree();
  const histBefore = read(w, "CLAUDE.md").split(/\r?\n/).filter((l) => /^- \*\*v\d+\.\d+\.\d+\*\*/.test(l)).join("\n");
  await bump(w, "3.2.1", "4.0.0", "learn-kit");
  const histAfter = read(w, "CLAUDE.md").split(/\r?\n/).filter((l) => /^- \*\*v\d+\.\d+\.\d+\*\*/.test(l)).join("\n");
  assert.equal(histAfter, histBefore);
});

test("a drifted CLAUDE.md plugin line fails loudly instead of SKIPping", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // Regression: every other site was converted to fail-loud while CLAUDE.md kept `continue`,
  // so a drifted line left four sites bumped, CLAUDE.md stale, and exit 0 with "[Done]".
  const w = makeTree();
  const claude = path.join(w, "CLAUDE.md");
  fs.writeFileSync(claude, fs.readFileSync(claude, "utf8").replace("`learn-kit` v3.2.1", "`learn-kit` v3.2.0"));
  const manifestBefore = read(w, "plugins/learn-kit/.claude-plugin/plugin.json");

  const r = await bump(w, "3.2.1", "4.0.0", "learn-kit");
  assert.notEqual(r.status, 0, "must exit non-zero on CLAUDE.md drift");
  assert.match(r.stdout + r.stderr, /expected exactly 1 anchor \(`learn-kit` plugin line\)/);
  assert.ok(!/\$\{PluginName\}/.test(r.stdout), "the message must name the plugin, not print a literal ${PluginName}");
  assert.equal(read(w, "plugins/learn-kit/.claude-plugin/plugin.json"), manifestBefore, "earlier targets must not be written");
});

test("a drifted catalog entry never rewrites a DIFFERENT plugin's version", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // The lazy [\s\S]*? in the catalog plugin-entry regex backtracks: with learn-kit drifted and
  // diagram-kit sitting at the -From value, `-Scope learn-kit` matched 3697 chars spanning into
  // diagram-kit and rewrote ITS version, with MatchCount == 1 so a count check missed it.
  const w = makeTree();
  const catPath = path.join(w, ".claude-plugin/marketplace.json");
  let cat = fs.readFileSync(catPath, "utf8");
  cat = cat.replace(/("name": "learn-kit",[\s\S]*?"version": ")3\.2\.1"/, '$13.2.0"');
  cat = cat.replace(/("name": "diagram-kit",[\s\S]*?"version": ")0\.1\.0"/, '$13.2.1"');
  fs.writeFileSync(catPath, cat);

  const r = await bump(w, "3.2.1", "4.0.0", "learn-kit");
  const after = JSON.parse(read(w, ".claude-plugin/marketplace.json"));
  const diagram = after.plugins.find((p) => p.name === "diagram-kit").version;
  assert.equal(diagram, "3.2.1", "diagram-kit was never named on the command line and must not move");
  assert.notEqual(r.status, 0, "a drifted learn-kit entry must fail loudly, not cross into a sibling");
});

test("a missing required target fails loudly", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  const w = makeTree();
  fs.rmSync(path.join(w, "plugins/learn-kit/.codex-plugin/plugin.json"));
  const before = read(w, "plugins/learn-kit/.claude-plugin/plugin.json");
  const r = await bump(w, "3.2.1", "4.0.0", "learn-kit");
  assert.notEqual(r.status, 0, "the 'mandatory' native manifest must not be silently skipped");
  assert.match(r.stdout + r.stderr, /required file not found/);
  assert.equal(read(w, "plugins/learn-kit/.claude-plugin/plugin.json"), before);
});

test("a non-semver -From / -To is rejected before any file is opened", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // -To lands in a .NET replacement string where $0/$1/$& are substitution tokens: a -To of
  // '$0-x' previously wrote invalid JSON across five files and exited 0.
  const w = makeTree();
  const before = read(w, "plugins/learn-kit/.claude-plugin/plugin.json");
  for (const [from, to] of [
    ["3.2.1", "$0-x"],
    ["3.2.1", "v4.0.0"],
    ["3.2.1", "4.0"],
    ["v3.2.1", "4.0.0"],
  ]) {
    const r = await bump(w, from, to, "learn-kit");
    assert.notEqual(r.status, 0, `-From ${from} -To ${to} must be rejected`);
    assert.equal(read(w, "plugins/learn-kit/.claude-plugin/plugin.json"), before, "nothing written");
  }
  assert.ok(JSON.parse(read(w, "plugins/learn-kit/.claude-plugin/plugin.json")), "manifest is still valid JSON");
});

test("the README badge anchor is scoped, not a whole-file replace", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  // Inject the marketplace version into README prose; only the badge may move.
  const w = makeTree();
  const readme = path.join(w, "README.md");
  fs.appendFileSync(readme, "\n\nNote: version 6.3.2 was a routine pre-bump.\n");
  const r = await bump(w, "6.3.2", "7.0.0", null);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(read(w, "README.md").includes("badge/version-7.0.0-blue"), "badge moves");
  assert.ok(read(w, "README.md").includes("Note: version 6.3.2 was a routine pre-bump."), "prose must not move");
});

test("a drifted README fails loudly rather than silently skipping", { skip: !HAVE_PWSH && "pwsh unavailable" }, async () => {
  const w = makeTree();
  const readme = path.join(w, "README.md");
  fs.writeFileSync(readme, fs.readFileSync(readme, "utf8").replace("badge/version-6.3.2-blue", "badge/version-9.9.9-blue"));
  const r = await bump(w, "6.3.2", "7.0.0", null);
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /expected exactly 1 anchor \(version badge\)/);
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
