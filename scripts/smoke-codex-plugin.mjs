#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runCli, spawnCli } from "./run-cli.mjs";
import { assertInstalledIcons } from "./plugin-icons.mjs";
import { REPOSITORY_SKILLS, RUNTIME_PLUGINS, PUBLIC_SKILLS, EXPLICIT_ONLY_SKILLS, validateOpenAIConfig } from "./validate-portable.mjs";

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
  return texts.flatMap(text => {
    // Newer CLI catalogs use aliases; each text block owns its root table.
    const roots = new Map();
    let inRoots = false;
    for (const line of text.split(/\r?\n/)) {
      if (/^#{1,6}\s/.test(line)) inRoots = line === "### Skill roots";
      if (!inRoots) continue;
      const m = line.match(/^\s*-\s+`(r\d+)`\s*=\s*`([^`]+)`\s*$/);
      if (!m) continue;
      const [, alias, root] = m;
      if (!path.isAbsolute(root)) throw new Error(`skill root must be absolute: ${alias}`);
      if (roots.has(alias) && roots.get(alias) !== root) throw new Error(`conflicting skill root: ${alias}`);
      roots.set(alias, root);
    }
    return [...text.matchAll(/^\s*-\s+([a-z0-9-]+(?::[a-z0-9-]+)?):\s.*\(file:\s*(.+)\)\s*$/gm)].map(m => {
      let file = m[2].trim();
      const alias = file.match(/^(r\d+)[/\\](.*)$/);
      if (alias) {
        const root = roots.get(alias[1]);
        if (!root) throw new Error(`unknown skill root: ${alias[1]}`);
        file = path.resolve(root, alias[2]);
        const rel = path.relative(root, file);
        if (rel.startsWith("..") || path.isAbsolute(rel)) throw new Error(`locator escapes skill root: ${alias[1]}`);
      }
      return { name: m[1], file };
    });
  });
}

export function assertDiscovery(entries, { cacheRoot, repositoryRoot, inRepository, expectedSkills = PUBLIC_SKILLS, pluginVersions = {} }) {
  if (expectedSkills.some(name => !PUBLIC_SKILLS.includes(name)) || new Set(expectedSkills).size !== expectedSkills.length) throw new Error("unapproved expected skill inventory");
  const publicSkills = entries.filter(e => e.name.includes(":"));
  if (JSON.stringify(publicSkills.map(e => e.name).sort()) !== JSON.stringify([...expectedSkills].sort())) throw new Error("public discovery must contain exactly the expected approved skills");
  for (const entry of publicSkills) {
    const [plugin, skill] = entry.name.split(":"), pluginCache = path.join(cacheRoot, plugin);
    const cacheRelative = norm(path.relative(real(cacheRoot), real(pluginCache)));
    if ((process.platform === "win32" ? cacheRelative.toLowerCase() : cacheRelative) !== plugin) throw new Error(`plugin cache escapes its own marketplace directory: ${plugin}`);
    const rel = path.relative(real(pluginCache), real(entry.file));
    const normalized = process.platform === "win32" ? norm(rel).toLowerCase() : norm(rel);
    const parts = normalized.split("/");
    const skillFile = process.platform === "win32" ? "skill.md" : "SKILL.md";
    if (rel.startsWith("..") || path.isAbsolute(rel) || parts.length !== 4 || parts[1] !== "skills" || parts[2] !== skill || parts[3] !== skillFile || !fs.statSync(entry.file).isFile() || (pluginVersions[plugin] && parts[0] !== pluginVersions[plugin])) throw new Error(`public skill did not resolve from its own isolated plugin/version cache: ${entry.name}, relative=${rel}`);
    const pluginRoot = path.resolve(path.dirname(entry.file), "../..");
    const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, "plugin.json"), "utf8"));
    const source = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "plugins", plugin, "plugin.json"), "utf8"));
    if (manifest.name !== plugin || manifest.version !== source.version) throw new Error(`incorrect installed plugin identity/version: ${entry.name}`);
  }
  const development = entries.filter(e => e.name.startsWith("mp-"));
  if (!inRepository && development.length) throw new Error("repository skills leaked to consumer cwd");
  if (inRepository) {
    if (development.length !== REPOSITORY_SKILLS.length || new Set(development.map(e => e.name)).size !== REPOSITORY_SKILLS.length || development.some(e => !REPOSITORY_SKILLS.includes(e.name))) throw new Error(`repository discovery must contain the ${REPOSITORY_SKILLS.length} distinct mp-* skills`);
    for (const e of development) if (!same(e.file, path.join(repositoryRoot, ".agents/skills", e.name, "SKILL.md"))) throw new Error(`incorrect repository skill scope: ${e.name}`);
  }
  return { publicSkills: publicSkills.length, repositorySkills: development.length };
}

/** Read the native skill inventory, which includes explicitly invoked skills omitted from prompt metadata. */
export function listNativeSkills({ codexCommand = "codex", cwd, cwds, env, timeoutMs = 60000, spawn = spawnCli }) {
  return new Promise((resolve, reject) => {
    const child = spawn(codexCommand, ["app-server", "--stdio"], { cwd, env, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    let buffer = "", stderr = "", settled = false;
    const finish = (error, result, alreadyClosed = false) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const deliver = () => { if (error) reject(error); else resolve(result); };
      if (alreadyClosed) { deliver(); return; }
      // Wait for stdio/working-directory handles to close before removing the isolated tree.
      child.once("close", deliver);
      child.stdin.end();
      child.kill();
    };
    const timer = setTimeout(() => finish(new Error("native skills/list timed out")), timeoutMs);
    const send = value => child.stdin.write(JSON.stringify(value) + "\n");
    child.on("error", error => finish(error));
    child.stdin.on("error", error => finish(error));
    child.on("close", code => { if (!settled) finish(new Error(`native skills/list ended early (${code}): ${stderr}`), undefined, true); });
    child.stderr.on("data", chunk => { stderr = (stderr + chunk).slice(-16384); });
    child.stdout.on("data", chunk => {
      buffer += chunk;
      if (buffer.length > 5 * 1024 * 1024) { finish(new Error("native skills/list response exceeded the output budget")); return; }
      let newline;
      while (!settled && (newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        let response;
        try { response = JSON.parse(line); } catch { finish(new Error("native skills/list returned invalid JSON")); return; }
        if (response.id !== 1 && response.id !== 2) continue;
        if (response.error) { finish(new Error(`native skills/list: ${JSON.stringify(response.error)}`)); return; }
        if (response.id === 1) {
          send({ method: "initialized" });
          send({ id: 2, method: "skills/list", params: { cwds, forceReload: true } });
        } else if (!Array.isArray(response.result?.data)) finish(new Error("native skills/list result has no inventory"));
        else finish(null, response.result.data);
      }
    });
    send({ id: 1, method: "initialize", params: { clientInfo: { name: "marketplace-smoke", version: "0.1.0" } } });
  });
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
    for (const rel of [".agents", "plugins", "assets", "AGENTS.md", ".codex", ".github", "docs", "scripts", "tests", "VERSION", "README.md", "CONTRIBUTING.md", "GLOSSARY.md", "CHANGELOG.md", "package.json", "package-lock.json"]) fs.cpSync(path.join(repoRoot, rel), path.join(src, rel), { recursive: true });
    await execute("git", ["init", "-q"], src);
    fs.writeFileSync(path.join(codexHome, "config.toml"), `[projects.${JSON.stringify(norm(src))}]\ntrust_level = "trusted"\n`);
    const version = (await execute(codexCommand, ["--version"])).trim();
    if (!allowVersionDrift && version !== `codex-cli ${BASELINE_VERSION}`) throw new Error(`expected Codex CLI ${BASELINE_VERSION}, found ${version}`);
    await execute(codexCommand, ["plugin", "marketplace", "add", src, "--json"]);
    const m = JSON.parse(await execute(codexCommand, ["plugin", "marketplace", "list", "--json"]));
    const names = m.marketplaces?.map(m => m.name) ?? [];
    if (names.length !== 1 || names[0] !== MARKETPLACE_NAME) throw new Error("isolated marketplace set is incorrect");
    const plugins = installed;
    const expectedSkills = plugins.flatMap(plugin => RUNTIME_PLUGINS[plugin].map(skill => `${plugin}:${skill}`));
    const pluginVersions = Object.fromEntries(plugins.map(name => [name, JSON.parse(fs.readFileSync(path.join(src, "plugins", name, "plugin.json"), "utf8")).version]));
    for (const plugin of plugins) await execute(codexCommand, ["plugin", "add", plugin, "--marketplace", MARKETPLACE_NAME, "--json"]);
    const list = JSON.parse(await execute(codexCommand, ["plugin", "list", "--json"]));
    if (!Array.isArray(list.installed) || JSON.stringify(list.installed.map(p => p.name).sort()) !== JSON.stringify([...plugins].sort()) || list.installed.some(p => !p.installed || !p.enabled)) throw new Error("expected plugins must be installed and enabled");
    const implicitSkills = expectedSkills.filter(name => !EXPLICIT_ONLY_SKILLS.includes(name));
    const external = parsePromptInputSkills(await execute(codexCommand, ["debug", "prompt-input", "ordinary task discovery check"]));
    const cacheRoot = path.join(codexHome, "plugins/cache", MARKETPLACE_NAME);
    const installedIcons = Object.fromEntries(plugins.map(plugin => [plugin, assertInstalledIcons(path.join(src, "plugins", plugin), path.join(cacheRoot, plugin, pluginVersions[plugin]))]));
    const outside = assertDiscovery(external, { cacheRoot, repositoryRoot: src, inRepository: false, expectedSkills: implicitSkills, pluginVersions });
    const entries = parsePromptInputSkills(await execute(codexCommand, ["debug", "prompt-input", "repository skill discovery check"], src));
    const repository = assertDiscovery(entries, { cacheRoot, repositoryRoot: src, inRepository: true, expectedSkills: implicitSkills, pluginVersions });
    const native = await listNativeSkills({ codexCommand, cwd, cwds: [cwd, src], env });
    commands.push({ command: codexCommand, args: ["app-server", "--stdio"], method: "skills/list", status: 0 });
    const nativeInventories = {};
    const skillPaths = {};
    for (const [key, at, inRepository] of [["outside", cwd, false], ["repository", src, true]]) {
      const matching = native.filter(entry => same(entry.cwd, at));
      if (matching.length !== 1 || !Array.isArray(matching[0].skills) || !Array.isArray(matching[0].errors) || matching[0].errors.length) throw new Error(`native ${key} inventory is missing or has skill errors`);
      const skills = matching[0].skills;
      for (const skill of skills.filter(s => PUBLIC_SKILLS.includes(s.name))) {
        if (skill.enabled !== true) throw new Error(`native public skill is disabled: ${skill.name}`);
        const [plugin, name] = skill.name.split(":"), installedRoot = path.dirname(skill.path), sourceRoot = path.join(src, "plugins", plugin, "skills", name);
        const config = validateOpenAIConfig(fs.readFileSync(path.join(installedRoot, "agents/openai.yaml"), "utf8"), plugin, name);
        if (skill.interface?.defaultPrompt !== config.interface.default_prompt || skill.interface?.displayName !== config.interface.display_name) throw new Error(`native presentation differs from installed metadata: ${skill.name}`);
        for (const rel of ["SKILL.md", "agents/openai.yaml", ...(plugin === "understanding-kit" ? ["references/ku-selection.md", "references/quiz-policy.md"] : plugin === "diagram-kit" ? ["scripts/validate_diagram.py"] : [])]) {
          const file = path.join(installedRoot, rel), relative = path.relative(real(installedRoot), real(file));
          if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.readFileSync(file).equals(fs.readFileSync(path.join(sourceRoot, rel)))) throw new Error(`installed skill resource is not its package-owned source: ${skill.name}/${rel}`);
        }
        skillPaths[skill.name] = skill.path;
      }
      nativeInventories[key] = assertDiscovery(skills.map(s => ({ name: s.name, file: s.path })), { cacheRoot, repositoryRoot: src, inRepository, expectedSkills, pluginVersions });
    }
    const mcp = JSON.parse(await execute(codexCommand, ["mcp", "list", "--json"]));
    if (!Array.isArray(mcp) || mcp.length) throw new Error("the approved plugins should not install an MCP server");
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
    return { ok: true, version, marketplaces: names, installed: plugins, installedIcons, outside, repository, nativeOutside: nativeInventories.outside, nativeRepository: nativeInventories.repository, explicitOnly: expectedSkills.filter(name => EXPLICIT_ONLY_SKILLS.includes(name)), skillPaths, publicSkillPaths: skillPaths, ...(diagramValidation ? { skillPath: diagram.file, validatorPath: diagramValidation.validatorPath, diagramValidation } : {}), ...(keepRoot ? { root, codexHome, repositoryRoot: src, consumerRoot: cwd } : {}), commands };
  } finally {
    if (!keepRoot || !complete) cleanupIsolatedRoot(root);
  }
}

/** Exercise each standalone package and the combined install with separate caches. */
export async function runSmoke({ repoRoot = path.resolve(import.meta.dirname, ".."), codexCommand = "codex", baseEnv = process.env, keepRoot = false, allowVersionDrift = false } = {}) {
  const scenarios = [];
  try {
    for (const installed of [["diagram-kit"], ["explain-kit"], ["diagram-kit", "explain-kit"], Object.keys(RUNTIME_PLUGINS)]) {
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
