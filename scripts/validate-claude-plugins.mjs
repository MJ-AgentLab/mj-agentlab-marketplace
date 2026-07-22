// Claude Code plugin/marketplace validation wrapper (plan §2.4).
//
// Runs `claude plugin validate` three times and classifies each result:
//   marketplace   `claude plugin validate --strict .`   MUST exit 0 with zero warnings/errors.
//   learn-kit     `claude plugin validate plugins/learn-kit`    (non-strict)
//   diagram-kit   `claude plugin validate plugins/diagram-kit`  (non-strict)
//
// Each plugin MUST exit 0 with EXACTLY ONE known warning — the plugin-root CLAUDE.md notice — after
// ANSI/CRLF normalization. A missing, extra, or different warning, or any error, fails. We do NOT
// pretend plugin-level `--strict` can pass: Claude Code >=2.1.210 upgrades that one warning to exit
// 1, and both plugin-root CLAUDE.md files are deliberately kept as human docs (plan §1 fact 15).
//
// Every executable is launched through run-cli.mjs (cross-spawn) so the Windows `claude.cmd` shim
// resolves. Exit codes: harness/config errors -> 2; a classification failure -> 1; success -> 0.

import path from "node:path";
import { pathToFileURL } from "node:url";

import { runCli } from "./run-cli.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

// The single warning each plugin is allowed to emit (non-strict), verbatim. `<name>` is literal.
export const CLAUDE_PLUGIN_ROOT_WARNING =
  "root: CLAUDE.md at the plugin root is not loaded as project context. To ship context with your plugin, use a skill (skills/<name>/SKILL.md) instead.";

export const CLAUDE_PLUGIN_SCOPES = ["learn-kit", "diagram-kit"];

// Strip ANSI CSI sequences (colour/cursor/erase): ESC '[' params intermediates final-byte.
const ANSI_RE = new RegExp(String.fromCharCode(27) + "[[][0-9;?]*[ -/]*[@-~]", "g");

export class ClaudeValidateHarnessError extends Error {
  constructor(message) {
    super(message);
    this.name = "ClaudeValidateHarnessError";
    this.exitCode = 2;
  }
}

/** Strip ANSI colour and normalize CRLF/CR to LF so classification is platform-stable. */
function normalizeOutput(output) {
  return String(output ?? "")
    .replace(ANSI_RE, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

/** Warning/error bullet texts. The validator renders them as "  ❯ <text>" under a "Found N …" header;
 *  we also accept a plain leading dash/star as a defensive fallback. */
function extractBullets(norm) {
  const out = [];
  for (const line of norm.split("\n")) {
    const m = line.match(/^\s*(?:❯|>|\*|-)\s+(.*\S)\s*$/);
    if (m) out.push(m[1].trim());
  }
  return out;
}

/**
 * Classify one `claude plugin validate` run. Pure — no I/O — so every branch is unit-testable.
 * @param {{ scope: string, exitCode: number, output: string }} args
 *   scope: "marketplace" for the strict root run, otherwise the plugin name for a non-strict run.
 * @returns {{ ok: boolean, findings: string[] }}
 */
export function classifyClaudeValidation({ scope, exitCode, output }) {
  const norm = normalizeOutput(output);
  const findings = [];

  const failed = /Validation failed/.test(norm);
  const passed = /Validation passed/.test(norm);
  const foundMatch = norm.match(/Found\s+(\d+)\s+warning/);
  const warningCount = foundMatch ? Number(foundMatch[1]) : 0;
  const hasKnownWarning = norm.includes(CLAUDE_PLUGIN_ROOT_WARNING);

  if (scope === "marketplace") {
    if (exitCode !== 0) findings.push(`marketplace: expected exit 0, got ${exitCode}`);
    if (failed) findings.push("marketplace: reported validation failure");
    if (!passed) findings.push("marketplace: did not report 'Validation passed'");
    if (warningCount !== 0) findings.push(`marketplace: expected 0 warnings, found ${warningCount}`);
    // strict marketplace must be spotless — any bullet at all is a problem.
    for (const b of extractBullets(norm)) findings.push(`marketplace: unexpected diagnostic: ${b}`);
    return { ok: findings.length === 0, findings };
  }

  // Plugin scope (non-strict): exactly the one known warning, nothing else.
  if (exitCode !== 0) findings.push(`${scope}: expected exit 0 (non-strict), got ${exitCode}`);
  if (failed) findings.push(`${scope}: reported validation failure`);
  if (!passed) findings.push(`${scope}: did not report 'Validation passed'`);
  if (warningCount !== 1) findings.push(`${scope}: expected exactly 1 warning, found ${warningCount}`);
  if (!hasKnownWarning) findings.push(`${scope}: missing the allowlisted plugin-root CLAUDE.md warning`);
  const unexpected = extractBullets(norm).filter((b) => b !== CLAUDE_PLUGIN_ROOT_WARNING);
  for (const b of unexpected) findings.push(`${scope}: unexpected diagnostic: ${b}`);
  return { ok: findings.length === 0, findings };
}

/** True when the Claude CLI can be launched. */
export async function claudeAvailable(claudeCommand = "claude") {
  const r = await runCli(claudeCommand, ["--version"], { timeoutMs: 30000 });
  return !r.error && r.status === 0;
}

/**
 * Run all three validations against `root`. Returns the aggregate result; a spawn failure throws a
 * harness error. `claudeCommand` and `runner` are injectable for tests.
 * @returns {Promise<{ ok: boolean, results: Array<{ scope, exitCode, ok, findings }> }>}
 */
export async function validateClaudePlugins({
  root = REPO_ROOT,
  claudeCommand = "claude",
  runner = runCli,
} = {}) {
  const jobs = [
    { scope: "marketplace", args: ["plugin", "validate", "--strict", root] },
    ...CLAUDE_PLUGIN_SCOPES.map((name) => ({
      scope: name,
      args: ["plugin", "validate", path.join(root, "plugins", name)],
    })),
  ];

  const results = [];
  for (const job of jobs) {
    const r = await runner(claudeCommand, job.args, { timeoutMs: 120000 });
    if (r.error) {
      throw new ClaudeValidateHarnessError(`could not run claude (${job.scope}): ${r.error.message}`);
    }
    const output = `${r.stdout || ""}\n${r.stderr || ""}`;
    const { ok, findings } = classifyClaudeValidation({ scope: job.scope, exitCode: r.status, output });
    results.push({ scope: job.scope, exitCode: r.status, ok, findings });
  }
  return { ok: results.every((r) => r.ok), results };
}

// --------------------------------------------------------------------------- CLI

export function parseArgs(argv) {
  const opts = { root: REPO_ROOT };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") {
      const v = argv[++i];
      if (v === undefined) throw new ClaudeValidateHarnessError("missing value for --root");
      opts.root = v;
    } else {
      throw new ClaudeValidateHarnessError(`unknown argument ${a}`);
    }
  }
  return opts;
}

async function main(argv) {
  const opts = parseArgs(argv);

  if (!(await claudeAvailable())) {
    if (process.env.REQUIRE_CLAUDE === "1") {
      throw new ClaudeValidateHarnessError("REQUIRE_CLAUDE=1 but the claude CLI is not available");
    }
    process.stderr.write("validate-claude: skipped (claude CLI not found; set REQUIRE_CLAUDE=1 to require it)\n");
    return 0;
  }

  const { ok, results } = await validateClaudePlugins({ root: opts.root });
  for (const r of results) {
    if (r.ok) {
      process.stderr.write(`validate-claude: ${r.scope} OK\n`);
    } else {
      for (const f of r.findings) process.stderr.write(`validate-claude: ${f}\n`);
    }
  }
  if (!ok) {
    process.stdout.write(`${JSON.stringify({ ok: false, results }, null, 2)}\n`);
    return 1;
  }
  process.stdout.write(`${JSON.stringify({ ok: true, results }, null, 2)}\n`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((e) => {
      process.stderr.write(`${e.name ?? "Error"}: ${e.message}\n`);
      process.exit(typeof e.exitCode === "number" ? e.exitCode : 2);
    });
}
