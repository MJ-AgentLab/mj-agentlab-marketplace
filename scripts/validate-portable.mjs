#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { parseDocument } from "yaml";
import { ICON_FIELDS, validateIconReference, validatePluginIcons } from "./plugin-icons.mjs";
import { validateBrandAssets } from "./brand-assets.mjs";

export const REPOSITORY_SKILLS = [
  "mp-design-icon",
  "mp-doc-author", "mp-doc-bump-version", "mp-doc-validate", "mp-flow-author",
  "mp-flow-compliance", "mp-flow-design-adr", "mp-flow-dogfood", "mp-flow-intake",
  "mp-flow-plan", "mp-flow-post-merge", "mp-flow-repo-scan", "mp-flow-self-review",
  "mp-git-branch", "mp-git-cleanup", "mp-git-commit", "mp-git-merge-gate",
  "mp-git-pr", "mp-git-push", "mp-git-sync",
];
export const PORTABLE_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
export const RUNTIME_PLUGINS = Object.freeze({
  "diagram-kit": Object.freeze(["arch-diagram"]),
  "learning-evidence-kit": Object.freeze(["pop-quiz", "learning-record-check"]),
  "explain-kit": Object.freeze(["glossary", "concept"]),
  "html-guide-kit": Object.freeze(["guide"]),
});
export const PUBLIC_SKILLS = Object.freeze(Object.entries(RUNTIME_PLUGINS).flatMap(([plugin, skills]) => skills.map(skill => `${plugin}:${skill}`)));
export const EXPLICIT_ONLY_SKILLS = Object.freeze(["learning-evidence-kit:pop-quiz", "learning-evidence-kit:learning-record-check", "html-guide-kit:guide"]);
export const SKILL_RESOURCES = Object.freeze({
  "diagram-kit:arch-diagram": Object.freeze(["SKILL.md", "agents/openai.yaml", "scripts/validate_diagram.py", "references/architecture-methodology.md", "references/domain-acquisition.md", ...["context", "container", "component", "code", "sequence", "state-machine", "deployment"].map(t => `references/${t}-diagram.md`)]),
  "learning-evidence-kit:pop-quiz": Object.freeze(["SKILL.md", "agents/openai.yaml", "references/ku-selection.md", "references/quiz-policy.md"]),
  "learning-evidence-kit:learning-record-check": Object.freeze(["SKILL.md", "agents/openai.yaml"]),
  "explain-kit:glossary": Object.freeze(["SKILL.md", "agents/openai.yaml"]),
  "explain-kit:concept": Object.freeze(["SKILL.md", "agents/openai.yaml"]),
  "html-guide-kit:guide": Object.freeze(["SKILL.md", "agents/openai.yaml", "references/guide-framework.md", "references/interaction-design.md"]),
});
const PLUGIN_CAPABILITIES = Object.freeze({
  "diagram-kit": Object.freeze(["Read", "Write"]),
  "learning-evidence-kit": Object.freeze(["Read", "Write"]),
  "explain-kit": Object.freeze(["Read"]),
  "html-guide-kit": Object.freeze(["Read"]),
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
export function validateManifest(manifest, expectedName) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("manifest must be an object");
  if (manifest.$schema !== PORTABLE_SCHEMA) throw new Error("portable schema is required");
  if (typeof manifest.name !== "string" || !Object.hasOwn(RUNTIME_PLUGINS, manifest.name) || (expectedName && manifest.name !== expectedName) || (typeof manifest.version !== "string" || !SEMVER.test(manifest.version))) throw new Error("invalid portable identity/version");
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
  for (const field of ICON_FIELDS) {
    if (Object.hasOwn(ui, field) || field === "logo" || field === "composerIcon") {
      try { validateIconReference(ui[field]); } catch (error) { throw new Error(`interface.${field}: ${error.message}`); }
    }
  }
  const capabilities = PLUGIN_CAPABILITIES[manifest.name];
  if (!Array.isArray(ui.capabilities) || ui.capabilities.length !== capabilities.length || new Set(ui.capabilities).size !== ui.capabilities.length || ui.capabilities.some(value => !capabilities.includes(value))) throw new Error("interface.capabilities must match the plugin's approved capabilities");
  if (ui.category !== "Developer Tools" || !Array.isArray(ui.defaultPrompt) || !ui.defaultPrompt.length || ui.defaultPrompt.some(p => !routesToOwnedSkill(p, manifest.name))) throw new Error("invalid OpenAI listing/routing metadata");
  if (ui.defaultPrompt.length > 3) throw new Error("interface.defaultPrompt supports at most 3 prompts");
  for (const [index, prompt] of ui.defaultPrompt.entries()) {
    if (!prompt.isWellFormed()) throw new Error(`interface.defaultPrompt[${index}] must contain well-formed Unicode scalar values`);
    // Codex 0.147.0 counts Unicode scalars after whitespace normalization. Keep the
    // repository's raw listing text within that budget so no normalization is needed.
    if ([...prompt].length > 128) throw new Error(`interface.defaultPrompt[${index}] must be at most 128 Unicode scalar values before normalization`);
  }
  for (const skill of RUNTIME_PLUGINS[manifest.name]) {
    if (!ui.defaultPrompt.some(prompt => [...prompt.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)(?![A-Za-z0-9_-])/g)].some(([, plugin, name]) => plugin === manifest.name && name === skill))) throw new Error("listing must expose every public skill");
  }
}

function routesToOwnedSkill(prompt, plugin, skill) {
  if (typeof prompt !== "string") return false;
  const invocations = [...prompt.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)(?![A-Za-z0-9_-])/g)];
  return invocations.length > 0 && invocations.every(([, p, s]) => p === plugin && RUNTIME_PLUGINS[plugin]?.includes(s) && (!skill || s === skill));
}

/** Validate native skill presentation and the explicit-only quiz policy. */
export function validateOpenAIConfig(text, plugin, skill) {
  const doc = parseDocument(text, { uniqueKeys: true });
  if (doc.errors.length) throw new Error(doc.errors.map(e => e.message).join("; "));
  const config = doc.toJS();
  if (!RUNTIME_PLUGINS[plugin]?.includes(skill) || !config || typeof config !== "object" || Array.isArray(config)) throw new Error("invalid native skill identity/configuration");
  for (const key of ["display_name", "short_description", "default_prompt"]) {
    if (typeof config.interface?.[key] !== "string" || !config.interface[key].trim()) throw new Error(`interface.${key} is required`);
  }
  if (!routesToOwnedSkill(config.interface.default_prompt, plugin, skill)) throw new Error("native default_prompt must invoke its own skill");
  if (typeof config.policy?.allow_implicit_invocation !== "boolean") throw new Error("native invocation policy must be an explicit boolean");
  if (EXPLICIT_ONLY_SKILLS.includes(`${plugin}:${skill}`) && config.policy.allow_implicit_invocation !== false) throw new Error(`${plugin}:${skill} must require explicit invocation`);
  if (plugin === "explain-kit") {
    const length = [...config.interface.short_description].length;
    const calls = [...config.interface.default_prompt.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)(?![A-Za-z0-9_-])/g)];
    if (length < 25 || length > 64 || calls.length !== 1 || config.policy.allow_implicit_invocation !== true) throw new Error("invalid explanation skill presentation or implicit policy");
  }
  if (plugin === "html-guide-kit") {
    const length = [...config.interface.short_description].length;
    const calls = [...config.interface.default_prompt.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)(?![A-Za-z0-9_-])/g)];
    if (length < 25 || length > 64 || calls.length !== 1) throw new Error("invalid guide skill presentation");
  }
  return config;
}

export function validateSkillInterface(text, qualifiedName) {
  const [plugin, skill] = qualifiedName.split(":");
  return validateOpenAIConfig(text, plugin, skill);
}

function validateResourceTree(skillRoot) {
  for (const entry of fs.readdirSync(skillRoot, { withFileTypes: true })) {
    const candidate = path.join(skillRoot, entry.name);
    if (!inside(skillRoot, candidate)) throw new Error(`resource escapes skill: ${entry.name}`);
    if (entry.isSymbolicLink()) throw new Error(`resource must be a package-owned file or directory: ${entry.name}`);
    if (entry.isDirectory()) validateResourceTree(candidate);
  }
}

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

function ownedResource(root, rel) {
  if (fs.lstatSync(root).isSymbolicLink() || path.isAbsolute(rel) || rel.includes("\\") || rel.split("/").some(p => !p || p === "." || p === "..")) throw new Error(`resource must be an owned file: ${rel}`);
  let file = root;
  for (const part of rel.split("/")) {
    file = path.join(file, part);
    if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`resource must not be a symlink or reparse link: ${rel}`);
  }
  if (!inside(root, file) || !fs.statSync(file).isFile()) throw new Error(`resource is not an owned file: ${rel}`);
  return file;
}

/** Match package-owned raw bytes, including references not mentioned by a Markdown link. */
export function assertInstalledSkillResources(sourceSkillRoot, installedSkillRoot, qualifiedName) {
  const required = SKILL_RESOURCES[qualifiedName];
  if (!required) throw new Error("unapproved installed skill identity");
  validateResourceTree(sourceSkillRoot);
  validateResourceTree(installedSkillRoot);
  const [plugin, skill] = qualifiedName.split(":");
  for (const root of [sourceSkillRoot, installedSkillRoot]) {
    validateSkill(fs.readFileSync(ownedResource(root, "SKILL.md"), "utf8"), skill);
    validateOpenAIConfig(fs.readFileSync(ownedResource(root, "agents/openai.yaml"), "utf8"), plugin, skill);
  }
  if (qualifiedName === "html-guide-kit:guide") {
    for (const root of [sourceSkillRoot, installedSkillRoot]) {
      const actual = files(root).map(file => path.relative(root, file).replaceAll("\\", "/")).sort();
      if (JSON.stringify(actual) !== JSON.stringify([...required].sort())) throw new Error("guide must contain exactly its approved skill resources");
    }
  }
  return Object.fromEntries(required.map(rel => {
    const source = ownedResource(sourceSkillRoot, rel), installed = ownedResource(installedSkillRoot, rel);
    const bytes = fs.readFileSync(source);
    if (!bytes.equals(fs.readFileSync(installed))) throw new Error(`installed skill resource differs: ${qualifiedName}/${rel}`);
    return [rel, { sha256: crypto.createHash("sha256").update(bytes).digest("hex"), source, installed }];
  }));
}

/** Validate both identities and compare distributed manifest, icons and approved skill files. */
export function assertInstalledPluginResources(sourcePluginRoot, installedPluginRoot, expectedName) {
  const source = JSON.parse(fs.readFileSync(ownedResource(sourcePluginRoot, "plugin.json"), "utf8"));
  const installed = JSON.parse(fs.readFileSync(ownedResource(installedPluginRoot, "plugin.json"), "utf8"));
  validateManifest(source, expectedName); validateManifest(installed, expectedName);
  if (source.name !== installed.name || source.version !== installed.version) throw new Error("installed plugin identity/version differs");
  const rootFiles = Object.fromEntries(["plugin.json", "assets/icon.svg", "assets/icon.png"].map(rel => {
    const a = ownedResource(sourcePluginRoot, rel), b = ownedResource(installedPluginRoot, rel), bytes = fs.readFileSync(a);
    if (!bytes.equals(fs.readFileSync(b))) throw new Error(`installed plugin resource differs: ${expectedName}/${rel}`);
    return [rel, { sha256: crypto.createHash("sha256").update(bytes).digest("hex"), source: a, installed: b }];
  }));
  validatePluginIcons(source, sourcePluginRoot); validatePluginIcons(installed, installedPluginRoot);
  for (const root of [sourcePluginRoot, installedPluginRoot]) {
    const skillsRoot = path.join(root, "skills");
    if (fs.lstatSync(skillsRoot).isSymbolicLink()) throw new Error("installed skills must not borrow a symlink or reparse directory");
    if (JSON.stringify(fs.readdirSync(skillsRoot).sort()) !== JSON.stringify([...RUNTIME_PLUGINS[source.name]].sort())) throw new Error("installed public skill set differs");
  }
  const skills = Object.fromEntries(RUNTIME_PLUGINS[source.name].map(skill => [skill, assertInstalledSkillResources(path.join(sourcePluginRoot, "skills", skill), path.join(installedPluginRoot, "skills", skill), `${source.name}:${skill}`)]));
  return { name: source.name, version: source.version, rootFiles, skills };
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
    if (!Array.isArray(m.plugins) || JSON.stringify(m.plugins.map(p => p?.name).sort()) !== JSON.stringify(Object.keys(RUNTIME_PLUGINS).sort())) throw new Error("marketplace must contain exactly the approved plugins");
    if ("version" in m) throw new Error("catalog must not become a version authority");
    for (const p of m.plugins) {
      if (p.source?.source !== "local" || p.source?.path !== `./plugins/${p.name}`) throw new Error("only approved local plugin sources are supported");
      if (p.policy?.installation !== "AVAILABLE" || p.policy?.authentication !== "ON_INSTALL" || p.category !== "Developer Tools") throw new Error("invalid installation policy/category");
      if ("version" in p) throw new Error("catalog must not become a version authority");
      if (!inside(root, path.join(root, p.source.path))) throw new Error("plugin source escapes repository");
    }
  });
  for (const name of Object.keys(RUNTIME_PLUGINS)) check(`${name} manifest`, () => validateManifest(JSON.parse(read(root, `plugins/${name}/plugin.json`)), name));
  for (const name of Object.keys(RUNTIME_PLUGINS)) check(`${name} icons`, () => validatePluginIcons(JSON.parse(read(root, `plugins/${name}/plugin.json`)), path.join(root, "plugins", name)));
  check("brand resources", () => validateBrandAssets(root));
  check("plugin inventory", () => {
    const plugins = fs.readdirSync(path.join(root, "plugins")).sort();
    if (JSON.stringify(plugins) !== JSON.stringify(Object.keys(RUNTIME_PLUGINS).sort())) throw new Error("unexpected runtime plugin directory");
    for (const [plugin, expectedSkills] of Object.entries(RUNTIME_PLUGINS)) {
      const pluginRoot = path.join(root, "plugins", plugin);
      if (!inside(root, pluginRoot)) throw new Error(`plugin escapes repository: ${plugin}`);
      validateResourceTree(pluginRoot);
      const skills = fs.readdirSync(path.join(pluginRoot, "skills")).sort();
      if (JSON.stringify(skills) !== JSON.stringify([...expectedSkills].sort())) throw new Error(`unexpected public skill set: ${plugin}`);
      for (const rel of ["plugin.json", "README.md", "LICENSE", "CHANGELOG.md", ...expectedSkills.flatMap(skill => [`skills/${skill}/SKILL.md`, `skills/${skill}/agents/openai.yaml`])]) {
        if (!inside(pluginRoot, path.join(pluginRoot, rel)) || !fs.statSync(path.join(pluginRoot, rel)).isFile()) throw new Error(`invalid package resource: ${rel}`);
      }
      for (const rel of ["mcp.json", ".mcp.json", ".claude-plugin", ".codex-plugin", "CLAUDE.md"]) if (fs.existsSync(path.join(pluginRoot, rel))) throw new Error(`unneeded compatibility/config surface: ${plugin}/${rel}`);
    }
  });
  check("repository skill inventory", () => {
    const actual = fs.readdirSync(path.join(root, ".agents/skills")).sort();
    if (JSON.stringify(actual) !== JSON.stringify([...REPOSITORY_SKILLS].sort())) throw new Error(`repository must expose exactly the ${REPOSITORY_SKILLS.length} mp-* skills`);
  });
  for (const name of REPOSITORY_SKILLS) check(name, () => validateSkill(read(root, `.agents/skills/${name}/SKILL.md`), name));
  for (const [plugin, skills] of Object.entries(RUNTIME_PLUGINS)) for (const skill of skills) {
    const skillRoot = path.join(root, "plugins", plugin, "skills", skill);
    check(`${plugin}:${skill}`, () => {
      if (!inside(path.join(root, "plugins", plugin), skillRoot)) throw new Error("skill escapes plugin");
      validateResourceTree(skillRoot);
      validateSkill(read(skillRoot, "SKILL.md"), skill);
      validateOpenAIConfig(read(skillRoot, "agents/openai.yaml"), plugin, skill);
      for (const rel of SKILL_RESOURCES[`${plugin}:${skill}`]) ownedResource(skillRoot, rel);
      if (plugin === "html-guide-kit") {
        const actual = files(skillRoot).map(file => path.relative(skillRoot, file).replaceAll("\\", "/")).sort();
        if (JSON.stringify(actual) !== JSON.stringify([...SKILL_RESOURCES[`${plugin}:${skill}`]].sort())) throw new Error("guide must contain exactly its approved skill resources");
      }
    });
  }
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
  check("quiz resources", () => {
    const skillRoot = path.join(root, "plugins/learning-evidence-kit/skills/pop-quiz");
    for (const rel of ["references/ku-selection.md", "references/quiz-policy.md"]) {
      if (!inside(skillRoot, path.join(skillRoot, rel)) || !fs.statSync(path.join(skillRoot, rel)).isFile()) throw new Error(`resource is not an owned skill file: ${rel}`);
    }
  });
  check("learning evidence common resources", () => {
    const pluginRoot = path.join(root, "plugins/learning-evidence-kit");
    for (const rel of ["scripts/lek.py", "scripts/common.py", "scripts/storage.py", "scripts/github_flow.py", "references/record-contract.md", "references/record-template.json", "references/client-entries.json"]) {
      const file = path.join(pluginRoot, rel);
      if (!inside(pluginRoot, file) || !fs.statSync(file).isFile()) throw new Error(`common resource is not package-owned: ${rel}`);
    }
    if (fs.existsSync(path.join(root, "scripts/learning-evidence"))) throw new Error("transitional learning evidence scripts must be removed atomically");
    const entries = JSON.parse(read(pluginRoot, "references/client-entries.json"));
    if (entries.schema_version !== 1 || entries.plugin_version !== JSON.parse(read(pluginRoot, "plugin.json")).version || !Array.isArray(entries.entries)) throw new Error("invalid client entry ledger");
    const expectedEntries = ["chatgpt-desktop-native-questions", "codex-native-questions"];
    if (JSON.stringify(entries.entries.map(e => e?.id).sort()) !== JSON.stringify(expectedEntries)) throw new Error("client ledger must preserve both known deferred entries");
    for (const entry of entries.entries) {
      if (!entry || typeof entry !== "object" || Object.keys(entry).sort().join(",") !== "id,reason,removal_condition,status" || entry.status !== "deferred" || typeof entry.reason !== "string" || !entry.reason.trim() || typeof entry.removal_condition !== "string" || !entry.removal_condition.trim()) throw new Error("0.1.0 native entries require explicit deferral and removal conditions");
    }
  });
  for (const file of files(path.join(root, "docs")).filter(p => p.endsWith(".md") && !p.includes(`${path.sep}archive${path.sep}`) && !p.includes(`${path.sep}_templates${path.sep}`))) {
    check(path.relative(root, file), () => {
      const { metadata } = parseFrontmatter(fs.readFileSync(file, "utf8"));
      for (const key of ["type", "scope", "summary", "owner", "created", "updated", "state", "version"]) if (!metadata[key]) throw new Error(`missing document field ${key}`);
      validateLinks(fs.readFileSync(file, "utf8"), file);
    });
  }
  for (const rel of ["README.md", "CONTRIBUTING.md", "GLOSSARY.md", "AGENTS.md", ...Object.keys(RUNTIME_PLUGINS).map(n => `plugins/${n}/README.md`), ...REPOSITORY_SKILLS.map(n => `.agents/skills/${n}/SKILL.md`), ...PUBLIC_SKILLS.map(n => { const [plugin, skill] = n.split(":"); return `plugins/${plugin}/skills/${skill}/SKILL.md`; })]) {
    check(`${rel} links`, () => validateLinks(read(root, rel), path.join(root, rel)));
  }
  return { ok: errors.length === 0, errors, repositorySkills: REPOSITORY_SKILLS.length, publicSkills: [...PUBLIC_SKILLS] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => arg.startsWith("--"))) throw new Error("expected an optional repository path");
  const result = validateRepository(args[0] ?? path.resolve(import.meta.dirname, ".."));
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exitCode = result.ok ? 0 : 1;
}
