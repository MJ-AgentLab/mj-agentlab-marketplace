#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseDocument } from "yaml";

export const REPOSITORY_SKILLS = [
  "mp-doc-author", "mp-doc-bump-version", "mp-doc-validate", "mp-flow-author",
  "mp-flow-compliance", "mp-flow-design-adr", "mp-flow-dogfood", "mp-flow-intake",
  "mp-flow-plan", "mp-flow-post-merge", "mp-flow-repo-scan", "mp-flow-self-review",
  "mp-git-branch", "mp-git-cleanup", "mp-git-commit", "mp-git-merge-gate",
  "mp-git-pr", "mp-git-push", "mp-git-sync",
];
export const PORTABLE_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
export const PUBLIC_PLUGINS = Object.freeze({
  "diagram-kit": Object.freeze(["arch-diagram"]),
  "explain-kit": Object.freeze(["glossary", "concept"]),
});
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const read = (root, rel) => fs.readFileSync(path.join(root, rel), "utf8");

export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("missing YAML frontmatter");
  const doc = parseDocument(match[1], { uniqueKeys: true });
  if (doc.errors.length) throw new Error(doc.errors.map(e => e.message).join("; "));
  const metadata = doc.toJS();
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new Error("frontmatter must be a mapping");
  return { metadata, body: text.slice(match[0].length) };
}

export function validateSkill(text, expectedName) {
  const { metadata, body } = parseFrontmatter(text);
  if (metadata.name !== expectedName || !NAME.test(metadata.name) || metadata.name.length > 64) throw new Error("name must match its kebab-case directory, at most 64 characters");
  if (typeof metadata.description !== "string" || !metadata.description.trim() || [...metadata.description].length > 1024) throw new Error("description must be a nonempty string within the 1024-character repository budget");
  if (/<[^>]+>|\{\{[^}]+\}\}|\b(?:TODO|TBD)\b/.test(metadata.description)) throw new Error("description contains a placeholder");
  if (Object.keys(metadata).some(k => !["name", "description", "metadata", "license", "compatibility"].includes(k))) throw new Error("unsupported skill frontmatter field");
  if (!body.trim()) throw new Error("skill body is empty");
  if (/CLAUDE_SKILL_DIR|CLAUDE_PLUGIN_ROOT|AskUserQuestion|plugin-dev:|superpowers:|learn-kit:/.test(body)) throw new Error("skill body depends on a retired host or workflow");
  return metadata;
}

function inside(root, candidate) {
  const rel = path.relative(fs.realpathSync(root), fs.realpathSync(candidate));
  return rel !== "" && !rel.startsWith(`..${path.sep}`) && rel !== ".." && !path.isAbsolute(rel);
}

/** Validates the portable fields and the maintained OpenAI extension subset. */
export function validateManifest(manifest, expectedName = manifest?.name) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("manifest must be an object");
  if (manifest.$schema !== PORTABLE_SCHEMA) throw new Error("portable schema is required");
  if (!Object.hasOwn(PUBLIC_PLUGINS, expectedName) || manifest.name !== expectedName || (typeof manifest.version !== "string" || !SEMVER.test(manifest.version))) throw new Error("invalid portable identity/version");
  if (typeof manifest.description !== "string" || !manifest.description.trim() || manifest.description.length > 4000) throw new Error("invalid description");
  if (typeof manifest.author?.name !== "string" || !manifest.author.name.trim()) throw new Error("author.name is required");
  if (manifest.license !== "MIT") throw new Error("expected MIT license");
  const keys = ["$schema", "name", "version", "description", "author", "homepage", "repository", "license", "keywords", "extensions"];
  if (Object.keys(manifest).some(k => !keys.includes(k))) throw new Error("unsupported portable root field (skills and MCP use fixed package paths)");
  if (!Array.isArray(manifest.keywords) || manifest.keywords.some(k => typeof k !== "string")) throw new Error("keywords must be strings");
  const ui = manifest.extensions?.["com.openai"]?.interface;
  for (const key of ["displayName", "shortDescription", "longDescription", "developerName", "category"]) {
    if (typeof ui?.[key] !== "string" || !ui[key].trim()) throw new Error(`interface.${key} is required`);
  }
  const expected = PUBLIC_PLUGINS[expectedName].map(skill => `${expectedName}:${skill}`);
  const seen = new Set();
  if (ui.category !== "Developer Tools" || !Array.isArray(ui.defaultPrompt) || !ui.defaultPrompt.length) throw new Error("invalid OpenAI listing/routing metadata");
  for (const prompt of ui.defaultPrompt) {
    if (typeof prompt !== "string") throw new Error("invalid OpenAI listing/routing metadata");
    const calls = [...prompt.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)/g)].map(m => `${m[1]}:${m[2]}`);
    if (!calls.length || calls.some(call => !expected.includes(call))) throw new Error("invalid OpenAI listing/routing metadata");
    calls.forEach(call => seen.add(call));
  }
  if (expected.some(call => !seen.has(call))) throw new Error("listing must expose every public skill");
}

export function validateSkillInterface(text, qualifiedName) {
  const doc = parseDocument(text, { uniqueKeys: true });
  if (doc.errors.length) throw new Error(doc.errors.map(e => e.message).join("; "));
  const ui = doc.toJS();
  if (typeof ui?.interface?.display_name !== "string" || !ui.interface.display_name.trim()) throw new Error("skill display_name is required");
  const short = ui.interface.short_description;
  if (typeof short !== "string" || [...short].length < 25 || [...short].length > 64) throw new Error("skill short_description must contain 25–64 characters");
  const prompt = ui.interface.default_prompt;
  const calls = typeof prompt === "string" ? [...prompt.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)/g)].map(m => `${m[1]}:${m[2]}`) : [];
  if (calls.length !== 1 || calls[0] !== qualifiedName || ui.policy?.allow_implicit_invocation !== true) throw new Error("invalid skill invocation metadata");
}

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

/** Check local file destinations, ignoring fenced examples and remote/anchor links. */
export function validateLinks(text, file) {
  const prose = text.replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1\s*$/gm, "");
  const targets = [...prose.replace(/`[^`\n]+`/g, "").matchAll(/\]\(([^)\r\n]+)\)/g)].map(m => m[1]);
  const { metadata } = text.startsWith("---") ? parseFrontmatter(text) : { metadata: {} };
  for (const key of ["related", "supersedes"]) {
    const values = metadata[key];
    if (Array.isArray(values)) targets.push(...values.filter(v => typeof v === "string"));
  }
  for (let target of targets) {
    target = target.trim().replace(/^<|>$/g, "");
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(target) || /[{}<>]/.test(target)) continue;
    const pathname = decodeURIComponent(target.split("#")[0]);
    if (!pathname) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file), pathname))) throw new Error(`missing linked file: ${target}`);
  }
}

export function validateRepository(repoRoot) {
  const root = path.resolve(repoRoot);
  const errors = [];
  const check = (label, operation) => { try { operation(); } catch (e) { errors.push(`${label}: ${e.message}`); } };
  check("marketplace", () => {
    const m = JSON.parse(read(root, ".agents/plugins/marketplace.json"));
    if (m.name !== "mj-agentlab-marketplace" || typeof m.interface?.displayName !== "string") throw new Error("invalid marketplace identity");
    const expected = Object.keys(PUBLIC_PLUGINS).sort();
    if (!Array.isArray(m.plugins) || JSON.stringify(m.plugins.map(p => p?.name).sort()) !== JSON.stringify(expected)) throw new Error("marketplace must contain exactly diagram-kit and explain-kit");
    if ("version" in m) throw new Error("catalog must not become a version authority");
    for (const p of m.plugins) {
      if (p.source?.source !== "local" || p.source?.path !== `./plugins/${p.name}`) throw new Error("only the declared local plugin source is supported");
      if (p.policy?.installation !== "AVAILABLE" || p.policy?.authentication !== "ON_INSTALL" || p.category !== "Developer Tools") throw new Error("invalid installation policy/category");
      if ("version" in p) throw new Error("catalog must not become a version authority");
      if (!inside(root, path.join(root, p.source.path))) throw new Error("plugin source escapes repository");
    }
  });
  check("plugin inventory", () => {
    const plugins = fs.readdirSync(path.join(root, "plugins")).sort();
    if (JSON.stringify(plugins) !== JSON.stringify(Object.keys(PUBLIC_PLUGINS).sort())) throw new Error("unexpected runtime plugin directory");
  });
  for (const [plugin, names] of Object.entries(PUBLIC_PLUGINS)) {
    check(`${plugin} manifest`, () => validateManifest(JSON.parse(read(root, `plugins/${plugin}/plugin.json`)), plugin));
    check(`${plugin} inventory`, () => {
      const pluginRoot = path.join(root, "plugins", plugin);
      if (!inside(root, pluginRoot)) throw new Error("plugin source escapes repository");
      const skills = fs.readdirSync(path.join(pluginRoot, "skills")).sort();
      if (JSON.stringify(skills) !== JSON.stringify([...names].sort())) throw new Error(`unexpected public skill set for ${plugin}`);
      for (const rel of ["plugin.json", "README.md", "LICENSE", "CHANGELOG.md", ...names.flatMap(name => [`skills/${name}/SKILL.md`, `skills/${name}/agents/openai.yaml`])]) {
        if (!inside(pluginRoot, path.join(pluginRoot, rel)) || !fs.statSync(path.join(pluginRoot, rel)).isFile()) throw new Error(`invalid package resource: ${rel}`);
      }
      for (const rel of ["mcp.json", ".mcp.json", ".claude-plugin", ".codex-plugin", "CLAUDE.md"]) if (fs.existsSync(path.join(pluginRoot, rel))) throw new Error(`unneeded compatibility/config surface: ${rel}`);
      for (const name of names) if (!inside(pluginRoot, path.join(pluginRoot, "skills", name))) throw new Error(`skill escapes plugin: ${name}`);
    });
    for (const name of names) {
      check(`${plugin}:${name}`, () => validateSkill(read(root, `plugins/${plugin}/skills/${name}/SKILL.md`), name));
      check(`${plugin}:${name} interface`, () => validateSkillInterface(read(root, `plugins/${plugin}/skills/${name}/agents/openai.yaml`), `${plugin}:${name}`));
    }
  }
  check("repository skill inventory", () => {
    const actual = fs.readdirSync(path.join(root, ".agents/skills")).sort();
    if (JSON.stringify(actual) !== JSON.stringify([...REPOSITORY_SKILLS].sort())) throw new Error("repository must expose exactly the 19 mp-* skills");
  });
  for (const name of REPOSITORY_SKILLS) check(name, () => validateSkill(read(root, `.agents/skills/${name}/SKILL.md`), name));
  check("project instruction budget", () => {
    if (Buffer.byteLength(read(root, "AGENTS.md")) > 16384) throw new Error("AGENTS.md exceeds configured instruction budget");
    for (const rel of ["CLAUDE.md", ".claude", ".claude-plugin"]) if (fs.existsSync(path.join(root, rel))) throw new Error(`retired instruction surface: ${rel}`);
    if (!read(root, "AGENTS.md").includes(".agents/references/session-maintenance.md")) throw new Error("session maintenance pointer is missing");
  });
  check("version display", () => {
    const version = read(root, "VERSION").trim();
    if (!SEMVER.test(version)) throw new Error("VERSION is not semver");
    const badges = [...read(root, "README.md").matchAll(/badge\/version-(\d+\.\d+\.\d+)-blue/g)];
    if (badges.length !== 1 || badges[0][1] !== version) throw new Error("README version badge does not match VERSION");
  });
  check("diagram resources", () => {
    const skillRoot = path.join(root, "plugins/diagram-kit/skills/arch-diagram");
    for (const rel of ["scripts/validate_diagram.py", "references/architecture-methodology.md", "references/domain-acquisition.md", ...["context", "container", "component", "code", "sequence", "state-machine", "deployment"].map(t => `references/${t}-diagram.md`)]) {
      if (!inside(skillRoot, path.join(skillRoot, rel))) throw new Error(`resource escapes skill: ${rel}`);
    }
  });
  for (const file of files(path.join(root, "docs")).filter(p => p.endsWith(".md") && !p.includes(`${path.sep}archive${path.sep}`) && !p.includes(`${path.sep}_templates${path.sep}`))) {
    check(path.relative(root, file), () => {
      const { metadata } = parseFrontmatter(fs.readFileSync(file, "utf8"));
      for (const key of ["type", "scope", "summary", "owner", "created", "updated", "state", "version"]) if (!metadata[key]) throw new Error(`missing document field ${key}`);
      validateLinks(fs.readFileSync(file, "utf8"), file);
    });
  }
  for (const rel of ["README.md", "CONTRIBUTING.md", "GLOSSARY.md", "AGENTS.md", ...REPOSITORY_SKILLS.map(n => `.agents/skills/${n}/SKILL.md`), ...Object.entries(PUBLIC_PLUGINS).flatMap(([plugin, names]) => [`plugins/${plugin}/README.md`, ...names.map(name => `plugins/${plugin}/skills/${name}/SKILL.md`)])]) {
    check(`${rel} links`, () => validateLinks(read(root, rel), path.join(root, rel)));
  }
  return { ok: errors.length === 0, errors, repositorySkills: REPOSITORY_SKILLS.length, publicSkills: Object.entries(PUBLIC_PLUGINS).flatMap(([plugin, names]) => names.map(name => `${plugin}:${name}`)) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => arg.startsWith("--"))) throw new Error("expected an optional repository path");
  const result = validateRepository(args[0] ?? path.resolve(import.meta.dirname, ".."));
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exitCode = result.ok ? 0 : 1;
}
