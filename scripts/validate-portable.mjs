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
export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("manifest must be an object");
  if (manifest.$schema !== PORTABLE_SCHEMA) throw new Error("portable schema is required");
  if (manifest.name !== "diagram-kit" || (typeof manifest.version !== "string" || !SEMVER.test(manifest.version))) throw new Error("invalid portable identity/version");
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
  if (ui.category !== "Developer Tools" || !Array.isArray(ui.defaultPrompt) || !ui.defaultPrompt.length || ui.defaultPrompt.some(p => typeof p !== "string" || !p.includes("$diagram-kit:arch-diagram"))) throw new Error("invalid OpenAI listing/routing metadata");
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
    if (!Array.isArray(m.plugins) || m.plugins.length !== 1) throw new Error("marketplace must contain exactly one plugin");
    const p = m.plugins[0];
    if (p.name !== "diagram-kit" || p.source?.source !== "local" || p.source?.path !== "./plugins/diagram-kit") throw new Error("only the local diagram-kit source is supported");
    if (p.policy?.installation !== "AVAILABLE" || p.policy?.authentication !== "ON_INSTALL" || p.category !== "Developer Tools") throw new Error("invalid installation policy/category");
    if ("version" in m || "version" in p) throw new Error("catalog must not become a version authority");
    if (!inside(root, path.join(root, p.source.path))) throw new Error("plugin source escapes repository");
  });
  check("manifest", () => validateManifest(JSON.parse(read(root, "plugins/diagram-kit/plugin.json"))));
  check("plugin inventory", () => {
    const plugins = fs.readdirSync(path.join(root, "plugins")).sort();
    if (JSON.stringify(plugins) !== JSON.stringify(["diagram-kit"])) throw new Error("unexpected runtime plugin directory");
    const skills = fs.readdirSync(path.join(root, "plugins/diagram-kit/skills")).sort();
    if (JSON.stringify(skills) !== JSON.stringify(["arch-diagram"])) throw new Error("public skill set must contain only arch-diagram");
    for (const rel of ["mcp.json", ".mcp.json", ".claude-plugin", ".codex-plugin", "CLAUDE.md"]) if (fs.existsSync(path.join(root, "plugins/diagram-kit", rel))) throw new Error(`unneeded compatibility/config surface: ${rel}`);
  });
  check("repository skill inventory", () => {
    const actual = fs.readdirSync(path.join(root, ".agents/skills")).sort();
    if (JSON.stringify(actual) !== JSON.stringify([...REPOSITORY_SKILLS].sort())) throw new Error("repository must expose exactly the 19 mp-* skills");
  });
  for (const name of REPOSITORY_SKILLS) check(name, () => validateSkill(read(root, `.agents/skills/${name}/SKILL.md`), name));
  check("arch-diagram", () => validateSkill(read(root, "plugins/diagram-kit/skills/arch-diagram/SKILL.md"), "arch-diagram"));
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
  for (const rel of ["README.md", "CONTRIBUTING.md", "GLOSSARY.md", "AGENTS.md", "plugins/diagram-kit/README.md", ...REPOSITORY_SKILLS.map(n => `.agents/skills/${n}/SKILL.md`), "plugins/diagram-kit/skills/arch-diagram/SKILL.md"]) {
    check(`${rel} links`, () => validateLinks(read(root, rel), path.join(root, rel)));
  }
  return { ok: errors.length === 0, errors, repositorySkills: REPOSITORY_SKILLS.length, publicSkills: ["arch-diagram"] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = validateRepository(process.argv[2] ?? path.resolve(import.meta.dirname, ".."));
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exitCode = result.ok ? 0 : 1;
}
