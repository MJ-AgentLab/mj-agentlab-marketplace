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
  "understanding-kit": Object.freeze(["pop-quiz"]),
  "explain-kit": Object.freeze(["glossary", "concept"]),
  "communication-kit": Object.freeze(["communicate"]),
});
export const PUBLIC_SKILLS = Object.freeze(Object.entries(RUNTIME_PLUGINS).flatMap(([plugin, skills]) => skills.map(skill => `${plugin}:${skill}`)));
export const EXPLICIT_ONLY_SKILLS = Object.freeze(["understanding-kit:pop-quiz", "communication-kit:communicate"]);
export const COMMUNICATION_REFERENCES = Object.freeze(["references/aics-policy.md", "references/task-patterns.md", "references/source-provenance.md", "references/aics-snapshot.json"]);
const PLUGIN_CAPABILITIES = Object.freeze({
  "diagram-kit": Object.freeze(["Read", "Write"]),
  "understanding-kit": Object.freeze(["Read"]),
  "explain-kit": Object.freeze(["Read"]),
  "communication-kit": Object.freeze(["Read", "Write"]),
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
  if (expectedName === "communicate") exactKeys(metadata, ["name", "description"], "communicate frontmatter");
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
  if (manifest.name === "communication-kit" && ui.defaultPrompt.some(prompt => [...prompt].length > 128)) throw new Error("communication listing prompt exceeds the 128-character client budget");
  for (const skill of RUNTIME_PLUGINS[manifest.name]) {
    if (!ui.defaultPrompt.some(prompt => [...prompt.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)(?![A-Za-z0-9_-])/g)].some(([, plugin, name]) => plugin === manifest.name && name === skill))) throw new Error("listing must expose every public skill");
  }
}

function routesToOwnedSkill(prompt, plugin, skill) {
  if (typeof prompt !== "string") return false;
  const invocations = [...prompt.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)(?![A-Za-z0-9_-])/g)];
  return invocations.length > 0 && invocations.every(([, p, s]) => p === plugin && RUNTIME_PLUGINS[plugin]?.includes(s) && (!skill || s === skill));
}

/** Validate native presentation and each skill's approved invocation policy. */
export function validateOpenAIConfig(text, plugin, skill) {
  const doc = parseDocument(text, { uniqueKeys: true });
  if (doc.errors.length) throw new Error(doc.errors.map(e => e.message).join("; "));
  const config = doc.toJS();
  if (!RUNTIME_PLUGINS[plugin]?.includes(skill) || !config || typeof config !== "object" || Array.isArray(config)) throw new Error("invalid native skill identity/configuration");
  for (const key of ["display_name", "short_description", "default_prompt"]) {
    if (typeof config.interface?.[key] !== "string" || !config.interface[key].trim()) throw new Error(`interface.${key} is required`);
  }
  if (!routesToOwnedSkill(config.interface.default_prompt, plugin, skill)) throw new Error("native default_prompt must invoke its own skill");
  if (plugin === "communication-kit" && [...config.interface.default_prompt].length > 128) throw new Error("communication native prompt exceeds the 128-character client budget");
  if (typeof config.policy?.allow_implicit_invocation !== "boolean") throw new Error("native invocation policy must be an explicit boolean");
  if (EXPLICIT_ONLY_SKILLS.includes(`${plugin}:${skill}`) && config.policy.allow_implicit_invocation !== false) throw new Error(`${skill} must require explicit invocation`);
  if (plugin === "communication-kit" && ([...config.interface.short_description].length < 25 || [...config.interface.short_description].length > 64)) throw new Error("invalid communication skill presentation");
  if (plugin === "explain-kit") {
    const length = [...config.interface.short_description].length;
    const calls = [...config.interface.default_prompt.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)(?![A-Za-z0-9_-])/g)];
    if (length < 25 || length > 64 || calls.length !== 1 || config.policy.allow_implicit_invocation !== true) throw new Error("invalid explanation skill presentation or implicit policy");
  }
  return config;
}

export function validateSkillInterface(text, qualifiedName) {
  const [plugin, skill] = qualifiedName.split(":");
  return validateOpenAIConfig(text, plugin, skill);
}

/** Resolve an ordinary owned resource, checking every link/junction component. */
export function resolveOwnedResource(resourceRoot, reference) {
  if (typeof reference !== "string" || !reference.startsWith("./") || /[\\:\0]/.test(reference)) throw new Error("resource path must be ./-prefixed and package-owned");
  const parts = reference.slice(2).split("/");
  if (parts.some(part => !part || part === "." || part === "..")) throw new Error("resource path must not contain traversal");
  if (fs.lstatSync(resourceRoot).isSymbolicLink()) throw new Error("resource root must not be a symlink or junction/reparse link");
  const root = fs.realpathSync.native(resourceRoot);
  let file = root;
  for (const [index, part] of parts.entries()) {
    file = path.join(file, part);
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error("resource must not contain a symlink or junction/reparse link");
    if (!inside(root, file) || (index < parts.length - 1 ? !stat.isDirectory() : !stat.isFile())) throw new Error("resource must be an ordinary owned file");
  }
  return file;
}

const SHA256 = /^[0-9a-f]{64}$/;
const nonempty = value => typeof value === "string" && !!value.trim();
function exactKeys(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...keys].sort())) throw new Error(`${label} must have exactly its approved fields`);
}
function uniqueStrings(value, label, allowEmpty = false) {
  if (!Array.isArray(value) || (!allowEmpty && !value.length) || value.some(item => !nonempty(item)) || new Set(value).size !== value.length) throw new Error(`${label} must be a distinct string array`);
}
function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

/** Validate captured identities and owned summary bytes; never read source paths. */
export function validateCommunicationSnapshot(skillRoot) {
  const file = resolveOwnedResource(skillRoot, "./references/aics-snapshot.json");
  const text = fs.readFileSync(file, "utf8"), snapshot = JSON.parse(text);
  const json = parseDocument(text, { uniqueKeys: true });
  if (json.errors.length) throw new Error(`snapshot JSON has duplicate/invalid keys: ${json.errors.map(error => error.message).join("; ")}`);
  exactKeys(snapshot, ["schemaVersion", "snapshotId", "status", "capturedAt", "captureDate", "timezone", "sources", "summaries", "mapping"], "snapshot");
  if (snapshot.schemaVersion !== 1 || !nonempty(snapshot.snapshotId) || snapshot.status !== "Lab Proposal / Informative" || snapshot.timezone !== "Asia/Taipei") throw new Error("invalid frozen snapshot identity/status/timezone");
  if (typeof snapshot.capturedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?Z$/.test(snapshot.capturedAt) || !validDate(snapshot.capturedAt.slice(0, 10)) || !Number.isFinite(Date.parse(snapshot.capturedAt)) || !validDate(snapshot.captureDate)) throw new Error("invalid snapshot capture date/time");
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: snapshot.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(snapshot.capturedAt)).map(part => [part.type, part.value]));
  if (snapshot.captureDate !== `${parts.year}-${parts.month}-${parts.day}`) throw new Error("captureDate must match capturedAt in Asia/Taipei");
  if (!Array.isArray(snapshot.sources) || snapshot.sources.length !== 2 || JSON.stringify(snapshot.sources.map(source => source?.id).sort()) !== JSON.stringify(["PROJECT-current-learning", "RN-02"].sort())) throw new Error("snapshot must contain the two approved source identities");
  for (const source of snapshot.sources) {
    exactKeys(source, ["id", "title", "path", "sections", "updated", "sha256", "git"], "source");
    if (!nonempty(source.title) || !nonempty(source.path) || !validDate(source.updated) || typeof source.sha256 !== "string" || !SHA256.test(source.sha256)) throw new Error("invalid source title/path/date/hash");
    uniqueStrings(source.sections, "source.sections");
    exactKeys(source.git, ["repo", "head", "dirty", "status", "fileState"], "source.git");
    const git = source.git;
    if (!nonempty(git.repo) || typeof git.head !== "string" || !/^[0-9a-f]{40}$/.test(git.head) || typeof git.dirty !== "boolean" || !["clean", "modified", "untracked"].includes(git.fileState)) throw new Error("invalid source Git identity/state");
    uniqueStrings(git.status, "source.git.status", true);
    if (git.dirty !== (git.status.length > 0) || (git.fileState !== "clean" && !git.dirty) || git.status.some(line => !/^(?:\?\?|[ MARCUD][ MARCUD]) [^\r\n\0]+$/.test(line) || line.startsWith("  "))) throw new Error("source Git dirty/fileState/status are inconsistent");
    const repo = git.repo.replaceAll("\\", "/").replace(/\/$/, ""), sourcePath = source.path.replaceAll("\\", "/");
    if (sourcePath.startsWith(`${repo}/`)) {
      const relative = sourcePath.slice(repo.length + 1);
      const statuses = git.status.filter(line => {
        const target = line.slice(3).split(" -> ").at(-1);
        return target === relative || (target.endsWith("/") && relative.startsWith(target));
      });
      if (git.fileState === "clean" ? statuses.length > 0 : !statuses.some(line => git.fileState === "untracked" ? line.startsWith("?? ") : !line.startsWith("?? "))) throw new Error("source fileState does not match recorded porcelain status");
    }
  }
  const expectedSummaries = COMMUNICATION_REFERENCES.filter(reference => reference.endsWith(".md")).map(reference => `./${path.posix.basename(reference)}`);
  if (!Array.isArray(snapshot.summaries) || snapshot.summaries.length !== 3 || JSON.stringify(snapshot.summaries.map(summary => summary?.path).sort()) !== JSON.stringify(expectedSummaries.sort())) throw new Error("snapshot must contain exactly the three owned summaries");
  const sourceIds = new Set(snapshot.sources.map(source => source.id)), headings = new Map();
  for (const summary of snapshot.summaries) {
    exactKeys(summary, ["path", "sha256", "sourceIds"], "summary");
    uniqueStrings(summary.sourceIds, "summary.sourceIds");
    if (summary.sourceIds.some(id => !sourceIds.has(id)) || typeof summary.sha256 !== "string" || !SHA256.test(summary.sha256)) throw new Error("invalid summary source reference/hash");
    const summaryFile = resolveOwnedResource(skillRoot, `./references/${summary.path.slice(2)}`), bytes = fs.readFileSync(summaryFile);
    if (crypto.createHash("sha256").update(bytes).digest("hex") !== summary.sha256) throw new Error(`summary SHA-256 differs from frozen bytes: ${summary.path}`);
    const prose = bytes.toString("utf8").replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1\s*$/gm, "");
    headings.set(summary.path, new Set([...prose.matchAll(/^ {0,3}#{1,6}\s+(.+)$/gm)].map(match => match[1].trim().replace(/\s+#+$/, ""))));
  }
  if (!Array.isArray(snapshot.mapping) || !snapshot.mapping.length) throw new Error("snapshot mapping must be nonempty");
  const mappedSources = new Set(), mappedSummaries = new Set(), mappingIds = new Set();
  for (const mapping of snapshot.mapping) {
    exactKeys(mapping, ["sourceId", "section", "summaryPath", "summarySection", "disposition", "reason"], "mapping");
    const source = snapshot.sources.find(candidate => candidate.id === mapping.sourceId);
    if (!source || !source.sections.includes(mapping.section) || !nonempty(mapping.reason) || !["extract", "adapt", "exclude"].includes(mapping.disposition)) throw new Error("invalid mapping source/section/disposition/reason");
    const identity = JSON.stringify([mapping.sourceId, mapping.section, mapping.summaryPath, mapping.summarySection, mapping.disposition]);
    if (mappingIds.has(identity)) throw new Error("duplicate source mapping");
    mappingIds.add(identity); mappedSources.add(source.id);
    if (mapping.disposition === "exclude") {
      if (mapping.summaryPath !== null || mapping.summarySection !== null) throw new Error("excluded mapping must have null summary locators");
    } else {
      const summary = snapshot.summaries.find(candidate => candidate.path === mapping.summaryPath);
      if (!summary || !summary.sourceIds.includes(mapping.sourceId) || !nonempty(mapping.summarySection) || !headings.get(mapping.summaryPath).has(mapping.summarySection)) throw new Error("mapping must locate an owned summary heading and source reference");
      mappedSummaries.add(summary.path);
    }
  }
  if (mappedSources.size !== 2 || mappedSummaries.size !== 3) throw new Error("each source and summary must have a locatable mapping");
  return snapshot;
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
    if (!Array.isArray(m.plugins) || JSON.stringify(m.plugins.map(p => p?.name).sort()) !== JSON.stringify(Object.keys(RUNTIME_PLUGINS).sort())) throw new Error("marketplace must contain exactly the four approved plugins");
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
  check("brand resources", () => {
    validateBrandAssets(root);
    const config = JSON.parse(read(root, "assets/brand/exports.json"));
    for (const plugin of Object.keys(RUNTIME_PLUGINS)) {
      const icons = config.icons.filter(candidate => candidate.id === plugin);
      if (icons.length !== 1 || icons[0].source !== `plugins/${plugin}/assets/icon.svg` || icons[0].output !== `plugins/${plugin}/assets/icon.png`) throw new Error(`registered plugin requires its own brand export: ${plugin}`);
    }
  });
  check("plugin inventory", () => {
    const plugins = fs.readdirSync(path.join(root, "plugins")).sort();
    if (JSON.stringify(plugins) !== JSON.stringify(Object.keys(RUNTIME_PLUGINS).sort())) throw new Error("unexpected runtime plugin directory");
    for (const [plugin, expectedSkills] of Object.entries(RUNTIME_PLUGINS)) {
      const pluginRoot = path.join(root, "plugins", plugin);
      if (!inside(root, pluginRoot)) throw new Error(`plugin escapes repository: ${plugin}`);
      const skills = fs.readdirSync(path.join(pluginRoot, "skills")).sort();
      if (JSON.stringify(skills) !== JSON.stringify([...expectedSkills].sort())) throw new Error(`unexpected public skill set: ${plugin}`);
      for (const rel of ["plugin.json", "README.md", "LICENSE", "CHANGELOG.md", ...expectedSkills.flatMap(skill => [`skills/${skill}/SKILL.md`, `skills/${skill}/agents/openai.yaml`])]) {
        try { resolveOwnedResource(root, `./plugins/${plugin}/${rel}`); } catch (error) { throw new Error(`invalid package resource: ${rel}: ${error.message}`); }
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
    const skillRoot = path.join(root, "plugins/understanding-kit/skills/pop-quiz");
    for (const rel of ["references/ku-selection.md", "references/quiz-policy.md"]) {
      if (!inside(skillRoot, path.join(skillRoot, rel)) || !fs.statSync(path.join(skillRoot, rel)).isFile()) throw new Error(`resource is not an owned skill file: ${rel}`);
    }
  });
  check("communication resources", () => validateCommunicationSnapshot(path.join(root, "plugins/communication-kit/skills/communicate")));
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
