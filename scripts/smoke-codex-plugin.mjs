#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runCli } from "./run-cli.mjs";
import { REPOSITORY_SKILLS, PUBLIC_PLUGINS } from "./validate-portable.mjs";

export const MARKETPLACE_NAME = "mj-agentlab-marketplace";
export const BASELINE_VERSION = "0.147.0";
const norm = p => String(p).replaceAll("\\", "/");
// Native realpath expands Windows 8.3 aliases used by hosted runner temp paths.
const real = p => fs.realpathSync.native(p);
const same = (a, b) => process.platform === "win32" ? norm(real(a)).toLowerCase() === norm(real(b)).toLowerCase() : real(a) === real(b);

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

export function assertDiscovery(entries, { cacheRoot, repositoryRoot, inRepository, installed = Object.keys(PUBLIC_PLUGINS) }) {
  if (!installed.length || new Set(installed).size !== installed.length || installed.some(p => !Object.hasOwn(PUBLIC_PLUGINS, p))) throw new Error("invalid expected plugin set");
  const expected = installed.flatMap(plugin => PUBLIC_PLUGINS[plugin].map(skill => `${plugin}:${skill}`)).sort();
  const publicSkills = entries.filter(e => e.name.includes(":"));
  if (JSON.stringify(publicSkills.map(e => e.name).sort()) !== JSON.stringify(expected)) throw new Error("public discovery must contain the installed skills exactly once");
  for (const entry of publicSkills) {
    const [plugin, skill] = entry.name.split(":");
    const rel = path.relative(real(cacheRoot), real(entry.file));
    const suffix = process.platform === "win32" ? norm(rel).toLowerCase() : norm(rel);
    const expectedSuffix = `/skills/${skill}/${process.platform === "win32" ? "skill.md" : "SKILL.md"}`;
    if (rel.startsWith("..") || path.isAbsolute(rel) || !suffix.endsWith(expectedSuffix)) throw new Error(`public skill did not resolve from isolated installed cache: ${entry.name}`);
    const pluginRoot = path.resolve(path.dirname(entry.file), "..", "..");
    const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, "plugin.json"), "utf8"));
    const source = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "plugins", plugin, "plugin.json"), "utf8"));
    if (manifest.name !== plugin || manifest.version !== source.version || !same(entry.file, path.join(pluginRoot, "skills", skill, "SKILL.md"))) throw new Error(`incorrect installed plugin identity/version: ${entry.name}`);
  }
  const development = entries.filter(e => e.name.startsWith("mp-"));
  if (!inRepository && development.length) throw new Error("repository skills leaked to consumer cwd");
  if (inRepository) {
    if (development.length !== REPOSITORY_SKILLS.length || new Set(development.map(e => e.name)).size !== REPOSITORY_SKILLS.length || development.some(e => !REPOSITORY_SKILLS.includes(e.name))) throw new Error("repository discovery must contain the 19 distinct mp-* skills");
    for (const e of development) if (!same(e.file, path.join(repositoryRoot, ".agents/skills", e.name, "SKILL.md"))) throw new Error(`incorrect repository skill scope: ${e.name}`);
  }
  return { publicSkills: publicSkills.length, repositorySkills: development.length };
}

export function cleanupIsolatedRoot(root) {
  const rel = path.relative(real(os.tmpdir()), real(root));
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) throw new Error("refusing cleanup outside the OS temporary directory");
  fs.rmSync(root, { recursive: true, force: true });
}

async function runScenario({ repoRoot, codexCommand, baseEnv, keepRoot, allowVersionDrift, installed }) {
  const root = fs.mkdtempSync(path.join(real(os.tmpdir()), "marketplace-smoke-"));
  const home = path.join(root, "home"), tmp = path.join(root, "tmp"), src = path.join(root, "src"), cwd = path.join(root, "consumer"), codexHome = path.join(home, ".codex");
  for (const dir of [home, tmp, src, cwd, codexHome]) fs.mkdirSync(dir, { recursive: true });
  const env = { ...baseEnv, HOME: home, USERPROFILE: home, CODEX_HOME: codexHome, APPDATA: path.join(home, "Roaming"), LOCALAPPDATA: path.join(home, "Local"), XDG_CONFIG_HOME: path.join(home, "config"), TEMP: tmp, TMP: tmp, TMPDIR: tmp };
  const commands = [];
  let complete = false;
  const execute = async (name, args, at = cwd) => {
    const r = await runCli(name, args, { cwd: at, env, timeoutMs: 60000 });
    commands.push({ command: name, args, status: r.status });
    if (r.error || r.status !== 0) throw new Error(`${name} ${args.join(" ")}: ${r.error?.message ?? `${r.stderr}${r.stdout}`}`);
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
    for (const plugin of installed) await execute(codexCommand, ["plugin", "add", plugin, "--marketplace", MARKETPLACE_NAME, "--json"]);
    const list = JSON.parse(await execute(codexCommand, ["plugin", "list", "--json"]));
    if (!Array.isArray(list.installed) || JSON.stringify(list.installed.map(p => p.name).sort()) !== JSON.stringify([...installed].sort()) || list.installed.some(p => !p.installed || !p.enabled)) throw new Error("installed and enabled plugin set is incorrect");
    const external = parsePromptInputSkills(await execute(codexCommand, ["debug", "prompt-input", "public skill discovery check"]));
    const cacheRoot = path.join(codexHome, "plugins/cache", MARKETPLACE_NAME);
    const outside = assertDiscovery(external, { cacheRoot, repositoryRoot: src, inRepository: false, installed });
    const entries = parsePromptInputSkills(await execute(codexCommand, ["debug", "prompt-input", "repository skill discovery check"], src));
    const repository = assertDiscovery(entries, { cacheRoot, repositoryRoot: src, inRepository: true, installed });
    const mcp = JSON.parse(await execute(codexCommand, ["mcp", "list", "--json"]));
    if (!Array.isArray(mcp) || mcp.length) throw new Error("public plugins should not install an MCP server");
    const diagram = external.find(e => e.name === "diagram-kit:arch-diagram");
    let diagramValidation;
    if (diagram) {
      const validatorPath = path.join(path.dirname(diagram.file), "scripts/validate_diagram.py");
      if (!fs.existsSync(validatorPath)) throw new Error("installed validator is absent");
      let python;
      for (const [command, pre] of [["python3", []], ["python", []], ["py", ["-3"]]]) {
        const r = await runCli(command, [...pre, "--version"], { cwd, env, timeoutMs: 10000 });
        if (!r.error && r.status === 0) { python = { command, pre }; break; }
      }
      if (!python) {
        const r = await runCli("uv", ["python", "find", "3.12"], { cwd, env: baseEnv, timeoutMs: 10000 });
        const command = r.stdout.trim();
        if (!r.error && r.status === 0 && command && fs.existsSync(command)) python = { command, pre: [] };
      }
      if (!python) throw new Error("installed diagram validation requires an existing Python interpreter");
      const fixture = path.join(cwd, "installed context 中文 diagram.md");
      fs.writeFileSync(fixture, '```text\nflowchart TD\n%% Name: 系统上下文图 (system context)\n%% Slug: struct-l1-context\n  U["用户 (User)"] --> S["系统 (System)"]\n```\n');
      const output = await execute(python.command, [...python.pre, validatorPath, fixture]);
      if (!/共扫描\s*1\s*张图/.test(output) || !/FAIL\s+0/.test(output)) throw new Error("installed Python validator did not validate the one-diagram fixture");
      diagramValidation = { skillPath: diagram.file, validatorPath, output: output.trim() };
    }
    complete = true;
    return { ok: true, version, marketplaces: names, installed, outside, repository, publicSkillPaths: Object.fromEntries(external.filter(e => e.name.includes(":")).map(e => [e.name, e.file])), ...(diagramValidation ? { skillPath: diagram.file, validatorPath: diagramValidation.validatorPath, diagramValidation } : {}), ...(keepRoot ? { root, codexHome, repositoryRoot: src, consumerRoot: cwd } : {}), commands };
  } finally {
    if (!keepRoot || !complete) cleanupIsolatedRoot(root);
  }
}

/** Exercise each standalone package and the combined install with separate caches. */
export async function runSmoke({ repoRoot = path.resolve(import.meta.dirname, ".."), codexCommand = "codex", baseEnv = process.env, keepRoot = false, allowVersionDrift = false } = {}) {
  const scenarios = [];
  try {
    for (const installed of [["diagram-kit"], ["explain-kit"], Object.keys(PUBLIC_PLUGINS)]) {
      scenarios.push(await runScenario({ repoRoot, codexCommand, baseEnv, keepRoot, allowVersionDrift, installed }));
    }
    return { ...scenarios.at(-1), scenarios };
  } catch (error) {
    if (keepRoot) for (const result of scenarios) cleanupIsolatedRoot(result.root);
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.some(a => !["--keep-root", "--allow-version-drift"].includes(a))) throw new Error("unknown smoke argument");
  runSmoke({ keepRoot: args.includes("--keep-root"), allowVersionDrift: args.includes("--allow-version-drift") }).then(r => console.log(JSON.stringify(r, null, 2))).catch(e => { console.error(e.message); process.exitCode = 1; });
}
