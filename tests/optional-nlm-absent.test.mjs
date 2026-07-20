// Tests for scripts/smoke-codex-plugin.mjs, and the release-blocking property that the OPTIONAL NLM
// bridge being absent must never break either host.
//
// Two layers:
//   1. Pure unit tests of the smoke's parsers/assertions — always run, no codex needed.
//   2. Gated integration: with `learn-kit-nlm-bridge` / `notebooklm-mcp` / `nlm` ABSENT from PATH,
//      run the three Codex modes and a Claude isolated install, and prove plugin install / list /
//      four-skill discovery / prompt construction do NOT fatal, with at most one allowlisted
//      "NLM server unavailable"-style diagnostic. Skips when codex/claude are unavailable, or when
//      those executables happen to be installed (then absence cannot be guaranteed here).

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  normSep,
  containsPath,
  parsePromptInputSkills,
  assertPromptInputSkills,
  parseMarketplaceNames,
  assertOnlyOurMarketplace,
  parsePluginList,
  assertPluginList,
  assertMcpList,
  pruneMirror,
  mirrorRepo,
  runSmokeMode,
  CONCRETE_MODES,
  MARKETPLACE_NAME,
  EXPECTED_PLUGINS,
  EXPECTED_SKILLS,
} from "../scripts/smoke-codex-plugin.mjs";
import { runCli } from "../scripts/run-cli.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const BRIDGE_EXES = ["learn-kit-nlm-bridge", "notebooklm-mcp", "nlm"];

// ------------------------------------------------------------------ fixtures / helpers

function skillFile(codexHome, plugin, skill, ver = "9.9.9") {
  return `${normSep(codexHome)}/plugins/cache/${MARKETPLACE_NAME}/${plugin}/${ver}/skills/${skill}/SKILL.md`;
}

/** Build a `codex debug prompt-input` JSON blob for the given skills. */
function makePromptInput(codexHome, skills = EXPECTED_SKILLS, { duplicate, overrideFile } = {}) {
  const lines = skills.map((s) => {
    const file = overrideFile ? overrideFile(s) : skillFile(codexHome, s.plugin, s.skill);
    return `- ${s.qualified}: a one line description of the skill (file: ${file})`;
  });
  if (duplicate) {
    const s = skills.find((x) => x.qualified === duplicate);
    lines.push(`- ${s.qualified}: duplicate entry (file: ${skillFile(codexHome, s.plugin, s.skill)})`);
  }
  const text = ["<available skills>", ...lines, "</available skills>"].join("\n");
  return JSON.stringify([{ type: "message", role: "developer", content: [{ type: "input_text", text }] }]);
}

const PATH_EXTS =
  process.platform === "win32"
    ? (process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD").split(";").map((e) => e.trim()).filter(Boolean)
    : [""];

function pathDirs() {
  return (process.env.PATH || process.env.Path || "").split(path.delimiter).filter(Boolean);
}

/** First resolution of `name` across `dirs` (respecting PATHEXT on Windows), or null. */
function findOnPathIn(name, dirs) {
  for (const dir of dirs) {
    for (const ext of PATH_EXTS) {
      const candidate = path.join(dir, name + ext);
      try {
        if (fs.statSync(candidate).isFile()) return candidate;
      } catch {
        /* not here */
      }
    }
  }
  return null;
}

function findOnPath(name) {
  return findOnPathIn(name, pathDirs());
}

/**
 * A PATH string with every directory holding a bridge/connector executable removed, so none of
 * learn-kit-nlm-bridge / notebooklm-mcp / nlm resolves for a spawned host or its children. Returns
 * null when absence cannot be guaranteed (a bridge exe still resolves after scrubbing). The host CLI
 * is launched by ABSOLUTE path, so removing its own directory does not make it unreachable — on this
 * platform claude.EXE happens to sit alongside the connector, and that colocation is handled here.
 */
function bridgeAbsentPath() {
  const dirs = pathDirs();
  const dirty = new Set();
  for (const name of BRIDGE_EXES) {
    for (const dir of dirs) {
      if (findOnPathIn(name, [dir])) dirty.add(dir.toLowerCase());
    }
  }
  const clean = dirs.filter((d) => !dirty.has(d.toLowerCase()));
  for (const name of BRIDGE_EXES) if (findOnPathIn(name, clean)) return null;
  return clean.join(path.delimiter);
}

/** Overwrite PATH regardless of its existing key casing (Windows has `Path`; a stray `PATH` sibling
 *  would otherwise let the un-scrubbed value win in the child). */
function withPath(baseEnv, value) {
  const env = { ...baseEnv };
  for (const k of Object.keys(env)) if (k.toLowerCase() === "path") delete env[k];
  env.PATH = value;
  return env;
}

// ------------------------------------------------------------------ unit: path helpers

test("normSep unifies backslashes to forward slashes", () => {
  assert.equal(normSep("C:\\a\\b"), "C:/a/b");
  assert.equal(normSep("/a/b"), "/a/b");
});

test("containsPath compares separator-normalized (and case-insensitive on win32)", () => {
  assert.equal(containsPath("C:\\Home\\.codex\\plugins\\cache\\x", "/plugins/cache/"), true);
  assert.equal(containsPath("/a/b/c", "/x/y/"), false);
  if (process.platform === "win32") {
    assert.equal(containsPath("C:/HOME/.CODEX/plugins/cache/", "c:/home/.codex/plugins/cache/"), true);
  }
});

// ------------------------------------------------------------------ unit: prompt-input

test("parsePromptInputSkills extracts qualified name + file per entry", () => {
  const codexHome = path.join(os.tmpdir(), "fake-home", ".codex");
  const entries = parsePromptInputSkills(makePromptInput(codexHome));
  assert.equal(entries.length, EXPECTED_SKILLS.length);
  for (const s of EXPECTED_SKILLS) {
    const e = entries.find((x) => x.qualified === s.qualified);
    assert.ok(e, `missing ${s.qualified}`);
    assert.ok(e.file.endsWith(`/skills/${s.skill}/SKILL.md`));
  }
});

test("assertPromptInputSkills passes for the four skills under this cache", () => {
  const codexHome = path.join(os.tmpdir(), "fake-home", ".codex");
  assert.doesNotThrow(() => assertPromptInputSkills({ stdout: makePromptInput(codexHome), codexHome }));
});

test("assertPromptInputSkills fails when a skill is missing", () => {
  const codexHome = path.join(os.tmpdir(), "fake-home", ".codex");
  const three = EXPECTED_SKILLS.filter((s) => s.qualified !== "learn-kit:concept");
  assert.throws(
    () => assertPromptInputSkills({ stdout: makePromptInput(codexHome, three), codexHome }),
    /did not register learn-kit:concept/,
  );
});

test("assertPromptInputSkills fails when a skill path is outside this mode's cache", () => {
  const codexHome = path.join(os.tmpdir(), "fake-home", ".codex");
  const stdout = makePromptInput(codexHome, EXPECTED_SKILLS, {
    overrideFile: (s) => `/some/other/place/${s.plugin}/skills/${s.skill}/SKILL.md`,
  });
  assert.throws(() => assertPromptInputSkills({ stdout, codexHome }), /not under this mode's cache/);
});

test("assertPromptInputSkills fails on a double-registered skill", () => {
  const codexHome = path.join(os.tmpdir(), "fake-home", ".codex");
  const stdout = makePromptInput(codexHome, EXPECTED_SKILLS, { duplicate: "diagram-kit:arch-diagram" });
  assert.throws(() => assertPromptInputSkills({ stdout, codexHome }), /registered diagram-kit:arch-diagram 2 times/);
});

test("parsePromptInputSkills throws a contract error on non-JSON", () => {
  assert.throws(() => parsePromptInputSkills("not json at all"), /prompt-input was not JSON/);
});

// ------------------------------------------------------------------ unit: list assertions

test("marketplace list: only ours passes, a foreign one fails", () => {
  const ours = JSON.stringify({ marketplaces: [{ name: MARKETPLACE_NAME, root: "/x" }] });
  assert.deepEqual(parseMarketplaceNames(ours), [MARKETPLACE_NAME]);
  assert.doesNotThrow(() => assertOnlyOurMarketplace(ours));

  const polluted = JSON.stringify({ marketplaces: [{ name: MARKETPLACE_NAME }, { name: "someones-personal" }] });
  assert.throws(() => assertOnlyOurMarketplace(polluted), /isolation leak/);

  const missing = JSON.stringify({ marketplaces: [] });
  assert.throws(() => assertOnlyOurMarketplace(missing), /not listed after add/);
});

test("plugin list: both installed+enabled passes; disabled/missing fail", () => {
  const good = JSON.stringify({
    installed: EXPECTED_PLUGINS.map((name) => ({ name, installed: true, enabled: true })),
  });
  assert.doesNotThrow(() => assertPluginList(good));

  const disabled = JSON.stringify({
    installed: [
      { name: "learn-kit", installed: true, enabled: false },
      { name: "diagram-kit", installed: true, enabled: true },
    ],
  });
  assert.throws(() => assertPluginList(disabled), /learn-kit reports enabled=false/);

  const missing = JSON.stringify({ installed: [{ name: "learn-kit", installed: true, enabled: true }] });
  assert.throws(() => assertPluginList(missing), /diagram-kit is not installed/);
});

test("mcp list: the notebooklm-mcp server must launch the bridge command", () => {
  const good = JSON.stringify([{ name: "notebooklm-mcp", transport: { command: "learn-kit-nlm-bridge", args: [] } }]);
  assert.doesNotThrow(() => assertMcpList(good));

  const wrongCmd = JSON.stringify([{ name: "notebooklm-mcp", transport: { command: "notebooklm-mcp" } }]);
  assert.throws(() => assertMcpList(wrongCmd), /command is notebooklm-mcp, expected learn-kit-nlm-bridge/);

  const missing = JSON.stringify([{ name: "something-else", transport: { command: "x" } }]);
  assert.throws(() => assertMcpList(missing), /missing server notebooklm-mcp/);
});

// ------------------------------------------------------------------ unit: prune

test("pruneMirror keeps only the layout each publish mode ships", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "lk-prune-"));
  try {
    const seed = () => {
      const base = fs.mkdtempSync(path.join(root, "m-"));
      for (const rel of [
        ".claude-plugin/marketplace.json",
        ".agents/plugins/marketplace.json",
        "plugins/learn-kit/.claude-plugin/plugin.json",
        "plugins/learn-kit/.codex-plugin/plugin.json",
        "plugins/diagram-kit/.claude-plugin/plugin.json",
        "plugins/diagram-kit/.codex-plugin/plugin.json",
      ]) {
        fs.mkdirSync(path.join(base, path.dirname(rel)), { recursive: true });
        fs.writeFileSync(path.join(base, rel), "{}");
      }
      return base;
    };
    const has = (base, rel) => fs.existsSync(path.join(base, rel));

    const dual = seed();
    pruneMirror(dual, "dual");
    assert.ok(has(dual, ".claude-plugin") && has(dual, ".agents"));
    assert.ok(has(dual, "plugins/learn-kit/.codex-plugin") && has(dual, "plugins/learn-kit/.claude-plugin"));

    const native = seed();
    pruneMirror(native, "native-only");
    assert.ok(!has(native, ".claude-plugin") && has(native, ".agents"));
    assert.ok(!has(native, "plugins/learn-kit/.claude-plugin") && has(native, "plugins/learn-kit/.codex-plugin"));
    assert.ok(!has(native, "plugins/diagram-kit/.claude-plugin") && has(native, "plugins/diagram-kit/.codex-plugin"));

    const legacy = seed();
    pruneMirror(legacy, "legacy-only");
    assert.ok(has(legacy, ".claude-plugin") && !has(legacy, ".agents"));
    assert.ok(has(legacy, "plugins/learn-kit/.claude-plugin") && !has(legacy, "plugins/learn-kit/.codex-plugin"));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ------------------------------------------------------------------ integration gating

const requireCodex = process.env.REQUIRE_CODEX === "1";
const requireClaude = process.env.REQUIRE_CLAUDE === "1";
// Host CLIs are launched by absolute path so a scrubbed PATH cannot hide them from us.
const codexAbs = findOnPath("codex");
const claudeAbs = findOnPath("claude");
const scrubbedPath = bridgeAbsentPath();

function absentReason(hostAbs, required, label) {
  if (!scrubbedPath) return "cannot construct a bridge-absent PATH (a bridge executable shares a needed dir)";
  if (hostAbs) return false;
  return required ? false : `${label} CLI not available`;
}
const codexSkip = absentReason(codexAbs, requireCodex, "codex");
const claudeSkip = absentReason(claudeAbs, requireClaude, "claude");

// Any error-ish diagnostic other than the allowlisted NLM-unavailable one is a failure.
const NLM_UNAVAILABLE_RE = /(notebooklm-mcp|learn-kit-nlm-bridge|nlm)[^\n]*(unavailable|not found|failed to start|could not start|no such file|enoent)/i;
const HARD_ERROR_RE = /\b(error|fatal|panic|traceback|unhandled|exception)\b/i;

function scanDiagnostics(results) {
  const disallowed = [];
  const nlm = [];
  for (const r of results) {
    for (const raw of String(r.stderr || "").split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (NLM_UNAVAILABLE_RE.test(line)) {
        nlm.push(line);
      } else if (HARD_ERROR_RE.test(line)) {
        disallowed.push(line);
      }
    }
  }
  return { disallowed, nlm };
}

// ------------------------------------------------------------------ integration: Codex

for (const mode of CONCRETE_MODES) {
  test(`Codex ${mode}: install/list/discovery/prompt survive the bridge being absent`, { skip: codexSkip }, async () => {
    // Sanity: the constructed child PATH really resolves none of the bridge executables.
    for (const exe of BRIDGE_EXES) {
      assert.equal(findOnPathIn(exe, scrubbedPath.split(path.delimiter)), null, `${exe} still on scrubbed PATH`);
    }
    const report = await runSmokeMode({
      mode,
      codexCommand: codexAbs,
      baseEnv: withPath(process.env, scrubbedPath),
      repoRoot: REPO_ROOT,
      timeoutMs: 180000,
    });
    assert.equal(report.ok, true);

    // Four skills really were discovered (re-derive from the captured prompt-input).
    const promptInput = report.results.find((r) => r.label === "prompt-input");
    const skills = parsePromptInputSkills(promptInput.stdout).map((s) => s.qualified);
    for (const s of EXPECTED_SKILLS) assert.ok(skills.includes(s.qualified), `missing ${s.qualified} in ${mode}`);

    // No disallowed error diagnostics; at most one allowlisted NLM-unavailable note.
    const { disallowed, nlm } = scanDiagnostics(report.results);
    assert.deepEqual(disallowed, [], `unexpected diagnostics in ${mode}: ${disallowed.join(" | ")}`);
    assert.ok(nlm.length <= 1, `more than one NLM-unavailable diagnostic in ${mode}: ${nlm.join(" | ")}`);
  });
}

// ------------------------------------------------------------------ integration: Claude (isolated install)

function makeClaudeDirs() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "lk-claude-absent-"));
  const home = path.join(root, "home");
  const tmp = path.join(root, "tmp");
  const src = path.join(root, "src");
  const cwd = path.join(root, "cwd");
  const cfg = path.join(home, ".claude");
  for (const d of [home, tmp, src, cwd, cfg, path.join(home, "Roaming"), path.join(home, "Local"), path.join(home, "config")]) {
    fs.mkdirSync(d, { recursive: true });
  }
  return { root, home, tmp, src, cwd, cfg };
}

function teardownContained(root) {
  const realRoot = fs.realpathSync(root);
  const realTmp = fs.realpathSync(os.tmpdir());
  const rel = path.relative(realTmp, realRoot);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`refusing to clean a path outside OS temp: ${realRoot}`);
  }
  fs.rmSync(root, { recursive: true, force: true });
}

test("Claude: isolated install/list/discovery survive the bridge being absent", { skip: claudeSkip }, async () => {
  for (const exe of BRIDGE_EXES) {
    assert.equal(findOnPathIn(exe, scrubbedPath.split(path.delimiter)), null, `${exe} still on scrubbed PATH`);
  }
  const dirs = makeClaudeDirs();
  try {
    mirrorRepo(REPO_ROOT, dirs.src);
    const env = withPath(
      {
        ...process.env,
        CLAUDE_CONFIG_DIR: dirs.cfg,
        HOME: dirs.home,
        USERPROFILE: dirs.home,
        APPDATA: path.join(dirs.home, "Roaming"),
        LOCALAPPDATA: path.join(dirs.home, "Local"),
        XDG_CONFIG_HOME: path.join(dirs.home, "config"),
        TEMP: dirs.tmp,
        TMP: dirs.tmp,
        TMPDIR: dirs.tmp,
      },
      scrubbedPath,
    );
    const cl = (args) => runCli(claudeAbs, args, { env, cwd: dirs.cwd, timeoutMs: 120000 });
    const results = [];
    const step = async (args) => {
      const r = await cl(args);
      results.push({ args, ...r });
      assert.ok(!r.error, `claude ${args.join(" ")} failed to spawn: ${r.error?.message}`);
      assert.equal(r.status, 0, `claude ${args.join(" ")} exited ${r.status}: ${(r.stderr || "").trim()}`);
      return r;
    };

    await step(["plugin", "marketplace", "add", dirs.src]);
    for (const name of EXPECTED_PLUGINS) await step(["plugin", "install", `${name}@${MARKETPLACE_NAME}`]);

    const list = await step(["plugin", "list", "--json"]);
    const installed = JSON.parse(list.stdout);
    for (const name of EXPECTED_PLUGINS) {
      const row = installed.find((p) => p.id === `${name}@${MARKETPLACE_NAME}`);
      assert.ok(row, `claude did not install ${name}`);
      assert.equal(row.enabled, true, `${name} not enabled`);
    }

    // Skills are inventoried per plugin even though the bridge is absent.
    const learn = await step(["plugin", "details", "learn-kit"]);
    for (const skill of ["three-views", "glossary", "concept"]) {
      assert.match(learn.stdout, new RegExp(skill), `learn-kit details missing skill ${skill}`);
    }
    assert.match(learn.stdout, /notebooklm-mcp/, "learn-kit details missing the MCP server entry");
    const diagram = await step(["plugin", "details", "diagram-kit"]);
    assert.match(diagram.stdout, /arch-diagram/, "diagram-kit details missing arch-diagram");

    const { disallowed, nlm } = scanDiagnostics(results);
    assert.deepEqual(disallowed, [], `unexpected diagnostics: ${disallowed.join(" | ")}`);
    assert.ok(nlm.length <= 1, `more than one NLM-unavailable diagnostic: ${nlm.join(" | ")}`);
  } finally {
    teardownContained(dirs.root);
  }
});
