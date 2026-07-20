// Tests for scripts/validate-claude-plugins.mjs.
//
// classifyClaudeValidation is pure, so every branch is exercised directly against fixtures shaped
// like the real `claude plugin validate` output. validateClaudePlugins is tested with an injected
// fake runner (no claude needed) plus a gated real-claude integration run.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  classifyClaudeValidation,
  validateClaudePlugins,
  claudeAvailable,
  parseArgs,
  CLAUDE_PLUGIN_ROOT_WARNING,
  CLAUDE_PLUGIN_SCOPES,
} from "../scripts/validate-claude-plugins.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

// Symbols and ESC built from code points so the source stays ASCII (tools mangle raw control /
// escape sequences — see the project's control-char trap).
const CHECK = String.fromCharCode(0x2714); // ✔
const WARN = String.fromCharCode(0x26a0); // ⚠
const CROSS = String.fromCharCode(0x2718); // ✘
const BULLET = String.fromCharCode(0x276f); // ❯
const ESC = String.fromCharCode(27);

const MARKETPLACE_PASS = ["Validating marketplace manifest: /abs/marketplace.json", "", `${CHECK} Validation passed`, ""].join("\n");

function pluginWarn(warnings, { count } = {}) {
  const list = Array.isArray(warnings) ? warnings : [warnings];
  const n = count ?? list.length;
  return [
    "Validating plugin manifest: /abs/.claude-plugin/plugin.json",
    "",
    "Validating plugin: /abs/CLAUDE.md",
    "",
    `${WARN} Found ${n} warning${n === 1 ? "" : "s"}:`,
    "",
    ...list.map((w) => `  ${BULLET} ${w}`),
    "",
    `${CHECK} Validation passed with warnings`,
    "",
  ].join("\n");
}

function pluginStrictFail(warning) {
  return [
    "Validating plugin manifest: /abs/.claude-plugin/plugin.json",
    "",
    `${WARN} Found 1 warning:`,
    "",
    `  ${BULLET} ${warning}`,
    "",
    `${CROSS} Validation failed (--strict treats warnings as errors)`,
    "",
  ].join("\n");
}

// ---------------------------------------------------------------- marketplace scope

test("marketplace: clean strict pass is ok", () => {
  const r = classifyClaudeValidation({ scope: "marketplace", exitCode: 0, output: MARKETPLACE_PASS });
  assert.equal(r.ok, true);
  assert.deepEqual(r.findings, []);
});

test("marketplace: any warning fails", () => {
  const r = classifyClaudeValidation({
    scope: "marketplace",
    exitCode: 0,
    output: pluginWarn("some unexpected marketplace warning"),
  });
  assert.equal(r.ok, false);
  assert.ok(r.findings.some((f) => /expected 0 warnings/.test(f)));
});

test("marketplace: non-zero exit fails", () => {
  const r = classifyClaudeValidation({ scope: "marketplace", exitCode: 1, output: MARKETPLACE_PASS });
  assert.equal(r.ok, false);
  assert.ok(r.findings.some((f) => /expected exit 0/.test(f)));
});

// ---------------------------------------------------------------- plugin scope

test("plugin: exactly the one known warning is ok", () => {
  for (const scope of CLAUDE_PLUGIN_SCOPES) {
    const r = classifyClaudeValidation({ scope, exitCode: 0, output: pluginWarn(CLAUDE_PLUGIN_ROOT_WARNING) });
    assert.equal(r.ok, true, `${scope} findings: ${r.findings.join("; ")}`);
    assert.deepEqual(r.findings, []);
  }
});

test("plugin: missing the warning fails", () => {
  // "Validation passed" with no warnings — the allowlisted warning must be present.
  const output = ["Validating plugin manifest: /abs/.claude-plugin/plugin.json", "", `${CHECK} Validation passed`, ""].join("\n");
  const r = classifyClaudeValidation({ scope: "learn-kit", exitCode: 0, output });
  assert.equal(r.ok, false);
  assert.ok(r.findings.some((f) => /expected exactly 1 warning, found 0/.test(f)));
  assert.ok(r.findings.some((f) => /missing the allowlisted/.test(f)));
});

test("plugin: two warnings fail", () => {
  const output = pluginWarn([CLAUDE_PLUGIN_ROOT_WARNING, "another surprise warning"], { count: 2 });
  const r = classifyClaudeValidation({ scope: "learn-kit", exitCode: 0, output });
  assert.equal(r.ok, false);
  assert.ok(r.findings.some((f) => /expected exactly 1 warning, found 2/.test(f)));
  assert.ok(r.findings.some((f) => /unexpected diagnostic: another surprise warning/.test(f)));
});

test("plugin: a different single warning fails", () => {
  const output = pluginWarn("root: something else entirely happened here.");
  const r = classifyClaudeValidation({ scope: "diagram-kit", exitCode: 0, output });
  assert.equal(r.ok, false);
  assert.ok(r.findings.some((f) => /missing the allowlisted/.test(f)));
  assert.ok(r.findings.some((f) => /unexpected diagnostic/.test(f)));
});

test("plugin: strict fail (exit 1) is rejected — plugin-level strict must never be a pass gate", () => {
  const r = classifyClaudeValidation({
    scope: "learn-kit",
    exitCode: 1,
    output: pluginStrictFail(CLAUDE_PLUGIN_ROOT_WARNING),
  });
  assert.equal(r.ok, false);
  assert.ok(r.findings.some((f) => /expected exit 0/.test(f)));
  assert.ok(r.findings.some((f) => /reported validation failure/.test(f)));
});

// ---------------------------------------------------------------- normalization

test("ANSI-coloured known warning still classifies ok", () => {
  const coloured = `${ESC}[33m${CLAUDE_PLUGIN_ROOT_WARNING}${ESC}[0m`;
  const r = classifyClaudeValidation({ scope: "learn-kit", exitCode: 0, output: pluginWarn(coloured) });
  assert.equal(r.ok, true, r.findings.join("; "));
});

test("CRLF line endings are normalized", () => {
  const crlf = pluginWarn(CLAUDE_PLUGIN_ROOT_WARNING).replace(/\n/g, "\r\n");
  const r = classifyClaudeValidation({ scope: "learn-kit", exitCode: 0, output: crlf });
  assert.equal(r.ok, true, r.findings.join("; "));
});

test("the exported warning constant matches the real validator text", () => {
  assert.match(CLAUDE_PLUGIN_ROOT_WARNING, /^root: CLAUDE\.md at the plugin root is not loaded/);
  assert.match(CLAUDE_PLUGIN_ROOT_WARNING, /skills\/<name>\/SKILL\.md\) instead\.$/);
});

// ---------------------------------------------------------------- validateClaudePlugins (injected)

test("validateClaudePlugins aggregates three scopes via an injected runner", async () => {
  const outputs = {
    "--strict": { status: 0, stdout: MARKETPLACE_PASS, stderr: "" },
    plugin: { status: 0, stdout: pluginWarn(CLAUDE_PLUGIN_ROOT_WARNING), stderr: "" },
  };
  const runner = async (_cmd, args) => {
    return args.includes("--strict") ? outputs["--strict"] : outputs.plugin;
  };
  const { ok, results } = await validateClaudePlugins({ root: REPO_ROOT, claudeCommand: "claude", runner });
  assert.equal(ok, true, JSON.stringify(results));
  assert.equal(results.length, 3);
  assert.deepEqual(results.map((r) => r.scope), ["marketplace", ...CLAUDE_PLUGIN_SCOPES]);
});

test("validateClaudePlugins fails when a plugin loses its warning", async () => {
  const runner = async (_cmd, args) => {
    if (args.includes("--strict")) return { status: 0, stdout: MARKETPLACE_PASS, stderr: "" };
    // learn-kit is fine; diagram-kit is missing the warning.
    if (args.some((a) => a.includes("diagram-kit"))) {
      return { status: 0, stdout: `${CHECK} Validation passed`, stderr: "" };
    }
    return { status: 0, stdout: pluginWarn(CLAUDE_PLUGIN_ROOT_WARNING), stderr: "" };
  };
  const { ok, results } = await validateClaudePlugins({ root: REPO_ROOT, runner });
  assert.equal(ok, false);
  assert.equal(results.find((r) => r.scope === "diagram-kit").ok, false);
});

test("validateClaudePlugins throws a harness error when claude cannot be spawned", async () => {
  const runner = async () => ({ status: null, stdout: "", stderr: "boom", error: new Error("ENOENT") });
  await assert.rejects(() => validateClaudePlugins({ runner }), /could not run claude/);
});

// ---------------------------------------------------------------- CLI parseArgs

test("parseArgs defaults root to the repo and rejects unknown flags", () => {
  const opts = parseArgs([]);
  assert.equal(typeof opts.root, "string");
  assert.throws(() => parseArgs(["--nope"]), /unknown argument/);
  assert.throws(() => parseArgs(["--root"]), /missing value/);
});

// ---------------------------------------------------------------- real claude (gated)

const requireClaude = process.env.REQUIRE_CLAUDE === "1";
const claudeOk = await claudeAvailable();
const claudeSkip = claudeOk ? false : requireClaude ? false : "claude CLI not available";

test("real: claude validates the repo marketplace + both plugins", { skip: claudeSkip }, async () => {
  const { ok, results } = await validateClaudePlugins({ root: REPO_ROOT });
  assert.equal(ok, true, JSON.stringify(results, null, 2));
  const marketplace = results.find((r) => r.scope === "marketplace");
  assert.equal(marketplace.exitCode, 0);
  for (const scope of CLAUDE_PLUGIN_SCOPES) {
    const r = results.find((x) => x.scope === scope);
    assert.equal(r.ok, true, `${scope}: ${r.findings.join("; ")}`);
    assert.equal(r.exitCode, 0);
  }
});
