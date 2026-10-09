#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runCli } from "./run-cli.mjs";
import { REPOSITORY_SKILLS } from "./validate-portable.mjs";

export const MARKETPLACE_NAME = "mj-agentlab-marketplace";
export const BASELINE_VERSION = "0.147.0";
const norm = p => String(p).replaceAll("\\", "/");
const same = (a, b) => process.platform === "win32" ? norm(a).toLowerCase() === norm(b).toLowerCase() : norm(a) === norm(b);

export function parsePromptInputSkills(stdout) {
  const texts = [];
  function walk(node) {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === "object") {
      if (typeof node.text === "string") texts.push(node.text);
      Object.values(node).filter(v => v && typeof v === "object").forEach(walk);
    }
  }
  walk(JSON.parse(stdout));
  return [...texts.join("\n").matchAll(/^\s*-\s+([a-z0-9-]+(?::[a-z0-9-]+)?):\s.*\(file:\s*(.+)\)\s*$/gm)].map(m => ({ name: m[1], file: m[2].trim() }));
}

export function assertDiscovery(entries, { cacheRoot, repositoryRoot, inRepository }) {
  const publicSkills = entries.filter(e => e.name.includes(":"));
  if (publicSkills.length !== 1 || publicSkills[0].name !== "diagram-kit:arch-diagram") throw new Error("public discovery must contain only diagram-kit:arch-diagram exactly once");
  const rel = path.relative(fs.realpathSync(cacheRoot), fs.realpathSync(publicSkills[0].file));
  if (rel.startsWith("..") || path.isAbsolute(rel) || !norm(rel).endsWith("/skills/arch-diagram/SKILL.md")) throw new Error("public skill did not resolve from isolated installed cache");
  const development = entries.filter(e => REPOSITORY_SKILLS.includes(e.name));
  if (!inRepository && development.length) throw new Error("repository skills leaked to consumer cwd");
  if (inRepository) {
    if (development.length !== REPOSITORY_SKILLS.length || new Set(development.map(e => e.name)).size !== REPOSITORY_SKILLS.length) throw new Error("repository discovery must contain the 19 distinct mp-* skills");
    for (const e of development) if (!same(e.file, path.join(repositoryRoot, ".agents/skills", e.name, "SKILL.md"))) throw new Error(`incorrect repository skill scope: ${e.name}`);
  }
  return { publicSkills: publicSkills.length, repositorySkills: development.length };
}

export function cleanupIsolatedRoot(root) {
  const rel = path.relative(fs.realpathSync(os.tmpdir()), fs.realpathSync(root));
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) throw new Error("refusing cleanup outside the OS temporary directory");
  fs.rmSync(root, { recursive: true, force: true });
}

export async function runSmoke({ repoRoot = path.resolve(import.meta.dirname, ".."), codexCommand = "codex", baseEnv = process.env, keepRoot = false, allowVersionDrift = false } = {}) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "diagram-smoke-"));
  const home = path.join(root, "home"), tmp = path.join(root, "tmp"), src = path.join(root, "src"), cwd = path.join(root, "consumer"), codexHome = path.join(home, ".codex");
  for (const dir of [home, tmp, src, cwd, codexHome]) fs.mkdirSync(dir, { recursive: true });
  const env = { ...baseEnv, HOME: home, USERPROFILE: home, CODEX_HOME: codexHome, APPDATA: path.join(home, "Roaming"), LOCALAPPDATA: path.join(home, "Local"), XDG_CONFIG_HOME: path.join(home, "config"), TEMP: tmp, TMP: tmp, TMPDIR: tmp };
  const commands = [];
  const execute = async (name, args, at = cwd) => {
    const r = await runCli(name, args, { cwd: at, env, timeoutMs: 60000 });
    commands.push({ command: name, args, status: r.status });
    if (r.error || r.status !== 0) throw new Error(`${name} ${args.join(" ")}: ${r.error?.message ?? r.stderr}`);
    return r.stdout;
  };
  try {
    for (const rel of [".agents", "plugins", "AGENTS.md", ".codex", ".github", "docs", "scripts", "tests", "VERSION", "README.md", "CONTRIBUTING.md", "GLOSSARY.md", "CHANGELOG.md", "package.json", "package-lock.json"]) fs.cpSync(path.join(repoRoot, rel), path.join(src, rel), { recursive: true });
    await execute("git", ["init", "-q"], src);
    fs.writeFileSync(path.join(codexHome, "config.toml"), `[projects.${JSON.stringify(norm(src))}]\ntrust_level = "trusted"\n`);
    const version = (await execute(codexCommand, ["--version"])).trim();
    if (!allowVersionDrift && version !== `codex-cli ${BASELINE_VERSION}`) throw new Error(`expected Codex CLI ${BASELINE_VERSION}, found ${version}`);
    await execute(codexCommand, ["plugin", "marketplace", "add", src, "--json"]);
    const m = JSON.parse(await execute(codexCommand, ["plugin", "marketplace", "list", "--json"]));
    const names = m.marketplaces?.map(m => m.name) ?? [];
    if (names.length !== 1 || names[0] !== MARKETPLACE_NAME) throw new Error("isolated marketplace set is incorrect");
    await execute(codexCommand, ["plugin", "add", "diagram-kit", "--marketplace", MARKETPLACE_NAME, "--json"]);
    const list = JSON.parse(await execute(codexCommand, ["plugin", "list", "--json"]));
    if (list.installed?.length !== 1 || list.installed[0].name !== "diagram-kit" || !list.installed[0].installed || !list.installed[0].enabled) throw new Error("only diagram-kit should be installed and enabled");
    const external = parsePromptInputSkills(await execute(codexCommand, ["debug", "prompt-input", "diagram discovery check"]));
    const cacheRoot = path.join(codexHome, "plugins/cache", MARKETPLACE_NAME);
    const outside = assertDiscovery(external, { cacheRoot, repositoryRoot: src, inRepository: false });
    const entries = parsePromptInputSkills(await execute(codexCommand, ["debug", "prompt-input", "repository skill discovery check"], src));
    const repository = assertDiscovery(entries, { cacheRoot, repositoryRoot: src, inRepository: true });
    const mcp = JSON.parse(await execute(codexCommand, ["mcp", "list", "--json"]));
    if (!Array.isArray(mcp) || mcp.length) throw new Error("diagram-kit should not install an MCP server");
    const skillPath = external.find(e => e.name === "diagram-kit:arch-diagram").file;
    const validatorPath = path.join(path.dirname(skillPath), "scripts/validate_diagram.py");
    if (!fs.existsSync(validatorPath)) throw new Error("installed validator is absent");
    return { ok: true, version, marketplaces: names, installed: ["diagram-kit"], outside, repository, skillPath, validatorPath, ...(keepRoot ? { root, codexHome, repositoryRoot: src, consumerRoot: cwd } : {}), commands };
  } finally {
    if (!keepRoot) cleanupIsolatedRoot(root);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.some(a => !["--keep-root", "--allow-version-drift"].includes(a))) throw new Error("unknown smoke argument");
  runSmoke({ keepRoot: args.includes("--keep-root"), allowVersionDrift: args.includes("--allow-version-drift") }).then(r => console.log(JSON.stringify(r, null, 2))).catch(e => { console.error(e.message); process.exitCode = 1; });
}
