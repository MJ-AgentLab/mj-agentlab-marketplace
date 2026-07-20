// Isolated Codex plugin smoke (plan §2.4).
//
// For each mode it builds a throwaway source mirror of the repo (the exact bytes a marketplace
// consumer sees), fully isolates the Codex/OS home + temp so nothing touches the real user, runs a
// real `codex` install/list/prompt-input/mcp-list flow against that mirror, and asserts what the two
// hosts must observe. Three concrete modes exercise the three publish layouts:
//
//   dual         both .claude-plugin (legacy) and .agents/.codex-plugin (native) present — the actual
//                published layout; must NOT double-register a plugin or skill.
//   native-only  only .agents/plugins/marketplace.json + per-plugin .codex-plugin/plugin.json.
//   legacy-only  only .claude-plugin/marketplace.json + per-plugin .claude-plugin/plugin.json.
//
// `all` (the default) runs the three concrete modes in turn.
//
// This is a config/registration attestation only. `codex mcp list` proves the aggregated stdio MCP
// entry is configured to point at the repo bridge; it does NOT start the server or prove any runtime
// safety (that is the probe's job), so the bridge need not be installed to run this smoke.
//
// Every executable is launched through run-cli.mjs (cross-spawn): Node's builtin spawn(shell:false)
// cannot resolve the Windows `codex.cmd` shim (ENOENT), which is exactly why that module exists.
//
// Exit codes: config / harness / unsafe-cleanup errors -> 2; a registration/contract failure -> 1;
// success -> 0.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { runCli } from "./run-cli.mjs";

// --------------------------------------------------------------------------- constants

export const MARKETPLACE_NAME = "mj-agentlab-marketplace";
export const CONCRETE_MODES = ["dual", "native-only", "legacy-only"];
export const MODES = [...CONCRETE_MODES, "all"];

// Repo-root entries a marketplace consumer needs. Everything is copied, then pruned per mode.
export const MIRROR_ROOTS = [".claude-plugin", ".agents", "plugins"];

export const EXPECTED_PLUGINS = ["learn-kit", "diagram-kit"];

// The four qualified skills both hosts must register (Codex uses `plugin:skill`).
export const EXPECTED_SKILLS = [
  { qualified: "learn-kit:three-views", plugin: "learn-kit", skill: "three-views" },
  { qualified: "learn-kit:glossary", plugin: "learn-kit", skill: "glossary" },
  { qualified: "learn-kit:concept", plugin: "learn-kit", skill: "concept" },
  { qualified: "diagram-kit:arch-diagram", plugin: "diagram-kit", skill: "arch-diagram" },
];

// The aggregated stdio MCP server that must resolve to the repo bridge (config, not a live server).
export const MCP_SERVER_NAME = "notebooklm-mcp";
export const MCP_COMMAND = "learn-kit-nlm-bridge";

const DEFAULT_TIMEOUT_MS = 180000;
const REPO_ROOT = path.resolve(import.meta.dirname, "..");

// --------------------------------------------------------------------------- errors

export class SmokeHarnessError extends Error {
  constructor(message) {
    super(message);
    this.name = "SmokeHarnessError";
    this.exitCode = 2;
  }
}

export class SmokeContractError extends Error {
  constructor(message) {
    super(message);
    this.name = "SmokeContractError";
    this.exitCode = 1;
  }
}

// --------------------------------------------------------------------------- pure path helpers

/** Unify `\` and `/` so a Codex-reported path (mixed per subcommand) compares stably. */
export function normSep(p) {
  return String(p ?? "").replace(/\\/g, "/");
}

/** Case-insensitive on win32 (drive-letter / path case is not significant there). */
function foldCase(s) {
  return process.platform === "win32" ? s.toLowerCase() : s;
}

/** True if the normalized `needle` path segment appears in the normalized `haystack`. */
export function containsPath(haystack, needle) {
  return foldCase(normSep(haystack)).includes(foldCase(normSep(needle)));
}

// --------------------------------------------------------------------------- prompt-input parsing

/**
 * Extract every skill entry from `codex debug prompt-input` stdout. The prompt input is a JSON array
 * of messages; skills are rendered inside message text as one line each:
 *   `- <plugin>:<skill>: <description> (file: <absolute path to SKILL.md>)`
 * The JSON escapes real newlines, so we must parse first, then split on genuine line boundaries —
 * matching the raw string would let one entry's `[^\n]` run across the whole blob.
 * @returns {Array<{ qualified: string, file: string }>}
 */
export function parsePromptInputSkills(stdout) {
  let doc;
  try {
    doc = JSON.parse(stdout);
  } catch (e) {
    throw new SmokeContractError(`prompt-input was not JSON: ${e.message}`);
  }
  const texts = [];
  const walk = (node) => {
    if (Array.isArray(node)) {
      for (const v of node) walk(v);
    } else if (node && typeof node === "object") {
      if (typeof node.text === "string") texts.push(node.text);
      for (const v of Object.values(node)) if (v && typeof v === "object") walk(v);
    }
  };
  walk(doc);

  const combined = texts.join("\n");
  const entries = [];
  const re = /^\s*-\s+([a-z0-9-]+:[a-z0-9-]+):\s.*?\(file:\s*([^)\n]+)\)\s*$/gm;
  let m;
  while ((m = re.exec(combined)) !== null) {
    entries.push({ qualified: m[1], file: m[2].trim() });
  }
  return entries;
}

/**
 * Assert the four qualified skills are registered, each traced to a SKILL.md under THIS mode's
 * isolated Codex plugin cache, and (always, since each layout registers a plugin once) that no
 * skill is double-registered. Throws SmokeContractError on any violation.
 */
export function assertPromptInputSkills({ stdout, codexHome }) {
  const entries = parsePromptInputSkills(stdout);
  const cachePrefix = `${normSep(codexHome)}/plugins/cache/${MARKETPLACE_NAME}/`;

  for (const { qualified, plugin, skill } of EXPECTED_SKILLS) {
    const matches = entries.filter((e) => e.qualified === qualified);
    if (matches.length === 0) {
      throw new SmokeContractError(`prompt-input did not register ${qualified}`);
    }
    if (matches.length > 1) {
      throw new SmokeContractError(`prompt-input registered ${qualified} ${matches.length} times (expected 1)`);
    }
    const file = matches[0].file;
    if (!containsPath(file, cachePrefix)) {
      throw new SmokeContractError(
        `${qualified} SKILL path ${file} is not under this mode's cache ${cachePrefix}`,
      );
    }
    if (!containsPath(file, `/${plugin}/`)) {
      throw new SmokeContractError(`${qualified} SKILL path ${file} is not under plugin dir /${plugin}/`);
    }
    if (!containsPath(file, `/skills/${skill}/SKILL.md`)) {
      throw new SmokeContractError(`${qualified} does not resolve to skills/${skill}/SKILL.md: ${file}`);
    }
  }
  return entries;
}

// --------------------------------------------------------------------------- list parsing

/** Parse `codex plugin marketplace list --json` -> the configured marketplace names. */
export function parseMarketplaceNames(stdout) {
  let doc;
  try {
    doc = JSON.parse(stdout);
  } catch (e) {
    throw new SmokeContractError(`marketplace list was not JSON: ${e.message}`);
  }
  const list = Array.isArray(doc?.marketplaces) ? doc.marketplaces : [];
  return list.map((m) => m?.name).filter((n) => typeof n === "string");
}

/** Isolation check: the ONLY configured marketplace is this test's, so a personal `.agents`/`.claude`
 *  never leaked in. Throws SmokeContractError otherwise. */
export function assertOnlyOurMarketplace(stdout) {
  const names = parseMarketplaceNames(stdout);
  const foreign = names.filter((n) => n !== MARKETPLACE_NAME);
  if (foreign.length) {
    throw new SmokeContractError(`unexpected marketplace(s) present (isolation leak): ${foreign.join(", ")}`);
  }
  if (!names.includes(MARKETPLACE_NAME)) {
    throw new SmokeContractError(`marketplace ${MARKETPLACE_NAME} not listed after add`);
  }
}

/** Parse `codex plugin list --json` -> [{ name, installed, enabled }]. */
export function parsePluginList(stdout) {
  let doc;
  try {
    doc = JSON.parse(stdout);
  } catch (e) {
    throw new SmokeContractError(`plugin list was not JSON: ${e.message}`);
  }
  const installed = Array.isArray(doc?.installed) ? doc.installed : [];
  return installed.map((p) => ({ name: p?.name, installed: p?.installed === true, enabled: p?.enabled === true }));
}

/** Both expected plugins must be installed AND enabled. Throws SmokeContractError otherwise. */
export function assertPluginList(stdout) {
  const rows = parsePluginList(stdout);
  for (const name of EXPECTED_PLUGINS) {
    const row = rows.find((r) => r.name === name);
    if (!row) throw new SmokeContractError(`plugin ${name} is not installed`);
    if (!row.installed) throw new SmokeContractError(`plugin ${name} reports installed=false`);
    if (!row.enabled) throw new SmokeContractError(`plugin ${name} reports enabled=false`);
  }
  return rows;
}

/** The aggregated MCP server must be configured to launch the repo bridge (config assertion only). */
export function assertMcpList(stdout) {
  let doc;
  try {
    doc = JSON.parse(stdout);
  } catch (e) {
    throw new SmokeContractError(`mcp list was not JSON: ${e.message}`);
  }
  const servers = Array.isArray(doc) ? doc : [];
  const entry = servers.find((s) => s?.name === MCP_SERVER_NAME);
  if (!entry) throw new SmokeContractError(`mcp list is missing server ${MCP_SERVER_NAME}`);
  const command = entry?.transport?.command;
  if (command !== MCP_COMMAND) {
    throw new SmokeContractError(`mcp server ${MCP_SERVER_NAME} command is ${command}, expected ${MCP_COMMAND}`);
  }
}

// --------------------------------------------------------------------------- mirror + prune

/** Copy the marketplace-consumer subset of the repo into `srcDir`. */
export function mirrorRepo(repoRoot, srcDir) {
  for (const rel of MIRROR_ROOTS) {
    const from = path.join(repoRoot, rel);
    if (!fs.existsSync(from)) {
      throw new SmokeHarnessError(`repo is missing ${rel}; cannot mirror`);
    }
    fs.cpSync(from, path.join(srcDir, rel), { recursive: true });
  }
}

/** Remove the manifests that a given publish layout would NOT ship. */
export function pruneMirror(srcDir, mode) {
  const rm = (rel) => fs.rmSync(path.join(srcDir, rel), { recursive: true, force: true });
  if (mode === "native-only") {
    rm(".claude-plugin");
    for (const p of EXPECTED_PLUGINS) rm(path.join("plugins", p, ".claude-plugin"));
  } else if (mode === "legacy-only") {
    rm(".agents");
    for (const p of EXPECTED_PLUGINS) rm(path.join("plugins", p, ".codex-plugin"));
  } else if (mode !== "dual") {
    throw new SmokeHarnessError(`unknown mode ${mode}`);
  }
}

// --------------------------------------------------------------------------- isolation

/** One probe root with home / temp / mirror / cwd as SIBLINGS (home and temp must not be ancestors
 *  of each other, or Codex refuses to build its helper alias under temp). CODEX_HOME nests in home. */
function makeIsolatedDirs(mode) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `lk-smoke-${mode}-`));
  const home = path.join(root, "home");
  const tmp = path.join(root, "tmp");
  const src = path.join(root, "src");
  const cwd = path.join(root, "cwd");
  const codexHome = path.join(home, ".codex");
  for (const d of [
    path.join(home, "Roaming"),
    path.join(home, "Local"),
    path.join(home, "config"),
    tmp,
    src,
    cwd,
    codexHome,
  ]) {
    fs.mkdirSync(d, { recursive: true });
  }
  return { root, home, tmp, src, cwd, codexHome };
}

/** An env whose home/config/temp/CODEX_HOME point at the isolated dirs; PATH etc. carry over so the
 *  command still resolves, but no real Codex/OS config is reachable. */
function isolatedEnv(baseEnv, dirs) {
  return {
    ...baseEnv,
    CODEX_HOME: dirs.codexHome,
    HOME: dirs.home,
    USERPROFILE: dirs.home,
    APPDATA: path.join(dirs.home, "Roaming"),
    LOCALAPPDATA: path.join(dirs.home, "Local"),
    XDG_CONFIG_HOME: path.join(dirs.home, "config"),
    TEMP: dirs.tmp,
    TMP: dirs.tmp,
    TMPDIR: dirs.tmp,
  };
}

/** Realpath-containment check before deleting a probe root, so a symlink can never redirect the
 *  teardown outside the OS temp dir. */
function assertContained(root) {
  const realRoot = fs.realpathSync(root);
  const realTmp = fs.realpathSync(os.tmpdir());
  const rel = path.relative(realTmp, realRoot);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new SmokeHarnessError(`refusing to clean a path outside OS temp: ${realRoot}`);
  }
}

function teardownDirs(root) {
  try {
    assertContained(root);
    fs.rmSync(root, { recursive: true, force: true });
  } catch (e) {
    if (e instanceof SmokeHarnessError) throw e;
    /* best-effort otherwise */
  }
}

// --------------------------------------------------------------------------- one mode

/**
 * Run the full smoke for one concrete mode and return a structured report. Every `codex` invocation
 * goes through runCli; a spawn failure is a harness error, a non-zero exit or failed assertion is a
 * contract error. The isolated root is always torn down.
 * @returns {Promise<{ mode, ok, codexHome, results: Array<{ label, args, status, stdout, stderr }> }>}
 */
export async function runSmokeMode({
  mode,
  codexCommand = "codex",
  repoRoot = REPO_ROOT,
  baseEnv = process.env,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (!CONCRETE_MODES.includes(mode)) {
    throw new SmokeHarnessError(`runSmokeMode: mode must be one of ${CONCRETE_MODES.join(", ")}`);
  }
  const dirs = makeIsolatedDirs(mode);
  const results = [];
  try {
    mirrorRepo(repoRoot, dirs.src);
    pruneMirror(dirs.src, mode);
    const env = isolatedEnv(baseEnv, dirs);

    const cx = async (label, args) => {
      const r = await runCli(codexCommand, args, { env, cwd: dirs.cwd, timeoutMs });
      const entry = { label, args, status: r.status, stdout: r.stdout, stderr: r.stderr };
      results.push(entry);
      if (r.error) throw new SmokeHarnessError(`could not run codex (${label}): ${r.error.message}`);
      return entry;
    };
    const requireOk = (entry) => {
      if (entry.status !== 0) {
        throw new SmokeContractError(`codex ${entry.label} exited ${entry.status}: ${(entry.stderr || "").trim()}`);
      }
      return entry;
    };

    // Register the mirror as a marketplace and confirm nothing else leaked into this isolated home.
    requireOk(await cx("marketplace-add", ["plugin", "marketplace", "add", dirs.src, "--json"]));
    const mktList = requireOk(await cx("marketplace-list", ["plugin", "marketplace", "list", "--json"]));
    assertOnlyOurMarketplace(mktList.stdout);

    // Install both plugins.
    for (const name of EXPECTED_PLUGINS) {
      requireOk(await cx(`add-${name}`, ["plugin", "add", name, "--marketplace", MARKETPLACE_NAME, "--json"]));
    }

    // Both plugins installed + enabled.
    const pluginList = requireOk(await cx("plugin-list", ["plugin", "list", "--json"]));
    assertPluginList(pluginList.stdout);

    // The four qualified skills, each traced to this mode's isolated cache, none double-registered.
    const promptInput = requireOk(await cx("prompt-input", ["debug", "prompt-input", "smoke discovery check"]));
    assertPromptInputSkills({ stdout: promptInput.stdout, codexHome: dirs.codexHome });

    // The aggregated MCP server points at the bridge (config only — server never started).
    const mcpList = requireOk(await cx("mcp-list", ["mcp", "list", "--json"]));
    assertMcpList(mcpList.stdout);

    return { mode, ok: true, codexHome: dirs.codexHome, results };
  } finally {
    teardownDirs(dirs.root);
  }
}

// --------------------------------------------------------------------------- availability gate

/** True when the Codex CLI can be launched. */
export async function codexAvailable(codexCommand = "codex") {
  const r = await runCli(codexCommand, ["--version"], { timeoutMs: 30000 });
  return !r.error && r.status === 0;
}

// --------------------------------------------------------------------------- CLI

export function parseArgs(argv) {
  const opts = { mode: "all", root: REPO_ROOT, timeoutMs: DEFAULT_TIMEOUT_MS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new SmokeHarnessError(`missing value for ${a}`);
      return v;
    };
    if (a === "--mode") opts.mode = next();
    else if (a === "--root") opts.root = next();
    else if (a === "--timeout-ms") opts.timeoutMs = Number(next());
    else throw new SmokeHarnessError(`unknown argument ${a}`);
  }
  if (!MODES.includes(opts.mode)) throw new SmokeHarnessError(`--mode must be one of ${MODES.join(", ")}`);
  if (!(opts.timeoutMs > 0)) throw new SmokeHarnessError("--timeout-ms must be a positive number");
  return opts;
}

async function main(argv) {
  const opts = parseArgs(argv);

  if (!(await codexAvailable())) {
    if (process.env.REQUIRE_CODEX === "1") {
      throw new SmokeHarnessError("REQUIRE_CODEX=1 but the codex CLI is not available");
    }
    process.stderr.write("smoke-codex: skipped (codex CLI not found; set REQUIRE_CODEX=1 to require it)\n");
    return 0;
  }

  const modes = opts.mode === "all" ? CONCRETE_MODES : [opts.mode];
  const reports = [];
  for (const mode of modes) {
    const report = await runSmokeMode({ mode, repoRoot: opts.root, timeoutMs: opts.timeoutMs });
    reports.push({ mode: report.mode, ok: report.ok });
    process.stderr.write(`smoke-codex: ${mode} OK\n`);
  }
  process.stdout.write(`${JSON.stringify({ ok: true, modes, reports }, null, 2)}\n`);
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
