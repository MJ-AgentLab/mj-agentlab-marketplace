import fs from "node:fs";
import path from "node:path";
import { measureSync } from "../../scripts/perf-metrics.mjs";
import { validateRepository, RUNTIME_PLUGINS, REPOSITORY_SKILLS, SKILL_RESOURCES } from "../../scripts/validate-portable.mjs";

export const SYNTHETIC_DOCUMENTS = Object.freeze([
  "docs/adr/[ADR]_Communication_Kit_Addition.md",
  "docs/adr/[ADR]_Explain_Kit_Addition.md",
  "docs/adr/[ADR]_HTML_Guide_Kit_Addition.md",
  "docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md",
  "docs/adr/[ADR]_Task_Documentation_Layers_And_Delivery.md",
  "docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md",
  "docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md",
  "docs/rule/[STANDARD]_Documentation_Framework.md",
  "docs/rule/[STANDARD]_Brand_Identity.md",
  "docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md",
  "docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md",
  "docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md",
  "docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md",
  "docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md",
  "docs/spec/[SPEC]_Communication_Communicate.md",
  "docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md",
]);
export const BRAND_BASE_FILES = Object.freeze([
  "assets/brand/tokens.json",
  "assets/brand/exports.json",
  "assets/brand/provenance.json",
  "assets/brand/templates/icon.svg",
  "assets/brand/design-prompts.md",
  "assets/brand/previews/plugin-family.png",
  "assets/brand/previews/marketplace-candidates.png",
]);
export const PYTHON_CACHE_ROOTS = Object.freeze([
  "plugins/learning-evidence-kit/scripts",
  "plugins/diagram-kit/skills/arch-diagram/scripts",
]);
export const FIXTURE_MANIFEST = Object.freeze({
  schemaVersion: 1,
  realTrees: Object.freeze(["plugins", ".agents"]),
  realFiles: Object.freeze(["VERSION", ".gitattributes"]),
  syntheticRootDocuments: Object.freeze(["AGENTS.md", "README.md", "CONTRIBUTING.md", "GLOSSARY.md"]),
  syntheticDocuments: SYNTHETIC_DOCUMENTS,
  emptyDirectories: Object.freeze(["scripts"]),
});
const SHARED_LEARNING_RESOURCES = Object.freeze(["scripts/lek.py", "scripts/common.py", "scripts/storage.py", "scripts/github_flow.py", "references/record-contract.md", "references/record-template.json", "references/client-entries.json"]);
const REQUIRED_REAL_FILES = Object.freeze([
  ".agents/plugins/marketplace.json", ".agents/references/session-maintenance.md",
  ...FIXTURE_MANIFEST.realFiles,
  ...REPOSITORY_SKILLS.map(skill => `.agents/skills/${skill}/SKILL.md`),
  ...Object.entries(RUNTIME_PLUGINS).flatMap(([plugin, skills]) => [
    ...["plugin.json", "README.md", "LICENSE", "CHANGELOG.md"].map(relative => `plugins/${plugin}/${relative}`),
    ...skills.flatMap(skill => SKILL_RESOURCES[`${plugin}:${skill}`].map(relative => `plugins/${plugin}/skills/${skill}/${relative}`)),
  ]),
  ...SHARED_LEARNING_RESOURCES.map(relative => `plugins/learning-evidence-kit/${relative}`),
]);

function childPath(root, relative) {
  if (typeof relative !== "string" || !relative || path.isAbsolute(relative) || /[\\:\0]/.test(relative) || relative.split("/").some(part => !part || part === "." || part === "..")) throw new Error(`invalid fixture resource path: ${relative}`);
  return path.join(root, ...relative.split("/"));
}
function ordinaryDirectory(directory) {
  const stat = fs.lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`fixture root must be an ordinary directory: ${directory}`);
  return fs.realpathSync.native(directory);
}
function owned(root, relative) {
  childPath(root, relative);
  let file = root;
  for (const part of relative.split("/")) {
    file = path.join(file, part);
    if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`fixture resource must not contain a symlink or junction: ${relative}`);
  }
  const stat = fs.lstatSync(file);
  if (!stat.isFile() && !stat.isDirectory()) throw new Error(`fixture resource must be an ordinary file or directory: ${relative}`);
  return { file, stat };
}
function inventory(root, relative) {
  const resource = owned(root, relative);
  if (resource.stat.isFile()) return { files: 1, bytes: resource.stat.size };
  return fs.readdirSync(resource.file).reduce((total, name) => {
    const next = inventory(root, `${relative}/${name}`);
    return { files: total.files + next.files, bytes: total.bytes + next.bytes };
  }, { files: 0, bytes: 0 });
}
function sourceEntries(root, relative) {
  const resource = owned(root, relative);
  if (resource.stat.isFile()) return [{ relative, kind: "file", bytes: resource.stat.size }];
  return [{ relative, kind: "directory", bytes: 0 }, ...fs.readdirSync(resource.file, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const next = `${relative}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`fixture resource must not contain a symlink or junction: ${next}`);
    // Only known Python script roots may produce ignored bytecode. Other extra resources
    // (including HTML extra.pyc or __pycache__) remain visible to strict validation.
    const pythonRoot = PYTHON_CACHE_ROOTS.includes(relative);
    if (pythonRoot && ((entry.name === "__pycache__" && entry.isDirectory()) || (entry.isFile() && entry.name.endsWith(".pyc")))) return [];
    return sourceEntries(root, next);
  })];
}
function readJson(root, relative) {
  const resource = owned(root, relative);
  if (!resource.stat.isFile()) throw new Error(`fixture JSON resource must be a file: ${relative}`);
  return JSON.parse(fs.readFileSync(resource.file, "utf8"));
}
function brandFiles(root) {
  const config = readJson(root, "assets/brand/exports.json"), provenance = readJson(root, "assets/brand/provenance.json");
  if (!Array.isArray(config.icons) || !config.icons.length || !Array.isArray(provenance.sources)) throw new Error("invalid fixture brand dependency manifest");
  const files = new Set(BRAND_BASE_FILES);
  for (const icon of config.icons) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.id)) throw new Error("invalid fixture brand icon id");
    for (const relative of [icon.source, icon.output]) {
      childPath(root, relative);
      if (!relative.startsWith("assets/brand/") && !relative.startsWith("plugins/")) throw new Error(`brand dependency is outside approved fixture resource roots: ${relative}`);
      files.add(relative);
    }
    for (const size of [32, 48, 64]) files.add(`assets/brand/previews/${icon.id}-${size}.png`);
  }
  for (const source of provenance.sources) files.add(`assets/brand/${source.file}`);
  // Plugin-owned icons are already copied, but must still exist as ordinary owned files.
  for (const relative of files) if (!owned(root, relative).stat.isFile()) throw new Error(`fixture brand dependency must be a file: ${relative}`);
  return [...files].filter(relative => !relative.startsWith("plugins/")).sort();
}
function syntheticDocuments(version) {
  const roots = new Map([
    ["AGENTS.md", "# Synthetic test repository\n\nGenerated temporary fixture; not release evidence.\n\n[Session reference](.agents/references/session-maintenance.md).\n"],
    ["README.md", `# Synthetic test repository\n\n![Version](https://img.shields.io/badge/version-${version}-blue)\n\nGenerated temporary fixture; not release evidence.\n`],
    ["CONTRIBUTING.md", "# Synthetic contribution fixture\n\nGenerated temporary fixture; not release evidence.\n"],
    ["GLOSSARY.md", "# Synthetic glossary fixture\n\nGenerated temporary fixture; not release evidence.\n"],
  ]);
  const types = { adr: "adr", guide: "guide", rule: "standard", runbook: "runbook", spec: "spec" };
  for (const relative of SYNTHETIC_DOCUMENTS) roots.set(relative, `---\ntype: ${types[relative.split("/")[1]]}\nscope: test-fixture\nsummary: "Synthetic link target for isolated repository contract tests"\nowner: test-fixture\ncreated: 2000-01-01\nupdated: 2000-01-01\nstate: active\nversion: v0.0\n---\n\n# Synthetic repository fixture\n\nGenerated temporary fixture for ${relative}. This contains no historical evidence.\n`);
  return roots;
}

/** Count the prepared fixture outside copy timings, including generated files and local overlays. */
export function reportRepositoryFixture(summary, { suite = "repository-fixture", stage = "prepared" } = {}) {
  const root = ordinaryDirectory(summary.root);
  if (fs.existsSync(path.join(root, ".git"))) throw new Error("fixture total must be recorded before Git initialization");
  const current = fs.readdirSync(root).reduce((total, relative) => {
    const next = inventory(root, relative);
    return { files: total.files + next.files, bytes: total.bytes + next.bytes };
  }, { files: 0, bytes: 0 });
  const complete = { ...summary, fixtureTotalFiles: current.files, fixtureTotalBytes: current.bytes, preparationDeltaBytes: current.bytes - summary.copiedBytes - summary.syntheticBytes };
  // The last event for a fixture root is authoritative if a caller applies a local overlay.
  return measureSync("fixture.total", () => complete, { scope: "fixture", suite, repositoryFixture: true, stage, ...complete });
}

/** Populate an empty, caller-owned temporary directory without borrowing historical evidence. */
export function populateRepositoryFixture(destination, { sourceRoot = path.resolve(import.meta.dirname, "../.."), suite = "repository-fixture" } = {}) {
  const root = ordinaryDirectory(destination), source = ordinaryDirectory(sourceRoot);
  const relation = path.relative(source, root), reverse = path.relative(root, source);
  const nested = value => value === "" || (!value.startsWith(`..${path.sep}`) && value !== ".." && !path.isAbsolute(value));
  if (nested(relation) || nested(reverse)) throw new Error("fixture source and destination must be separate directory trees");
  if (fs.readdirSync(root).length) throw new Error("fixture destination must be empty");

  for (const relative of REQUIRED_REAL_FILES) if (!owned(source, relative).stat.isFile()) throw new Error(`required real fixture resource must be a file: ${relative}`);
  const realPaths = [...FIXTURE_MANIFEST.realTrees, ...FIXTURE_MANIFEST.realFiles, ...brandFiles(source)];
  // Preflight every real dependency before copying; missing files are never synthesized.
  const copies = realPaths.map(relative => ({ relative, ...owned(source, relative), entries: sourceEntries(source, relative) }));
  for (const resource of copies) {
    const expectedDirectory = FIXTURE_MANIFEST.realTrees.includes(resource.relative);
    if (expectedDirectory !== resource.stat.isDirectory()) throw new Error(`fixture resource has the wrong file type: ${resource.relative}`);
  }
  const version = fs.readFileSync(owned(source, "VERSION").file, "utf8").trim();
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error("invalid fixture source VERSION");
  let copiedFiles = 0, copiedBytes = 0, syntheticFiles = 0, syntheticBytes = 0;
  for (const resource of copies) {
    const plannedBytes = resource.entries.reduce((total, entry) => total + entry.bytes, 0);
    const plannedFiles = resource.entries.filter(entry => entry.kind === "file").length;
    measureSync("copy", () => {
      for (const entry of resource.entries) {
        const sourceEntry = owned(source, entry.relative);
        const target = childPath(root, entry.relative);
        if (entry.kind === "directory") {
          if (!sourceEntry.stat.isDirectory()) throw new Error(`real fixture source changed directory type: ${entry.relative}`);
          fs.mkdirSync(target, { recursive: true });
        } else {
          if (!sourceEntry.stat.isFile()) throw new Error(`real fixture source changed file type: ${entry.relative}`);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.copyFileSync(sourceEntry.file, target);
        }
      }
    }, { scope: "fixture", suite, path: resource.file, fixtureRoot: root, sourceRoot: source, repositoryFixture: true, copiedFiles: plannedFiles, copiedBytes: plannedBytes, inventoryMode: "explicit-entries-verified" });
    // Size accounting stays outside the copy timer. A changed source or incomplete
    // copy invalidates the run instead of silently presenting planned bytes as actual.
    const actual = resource.entries.reduce((total, entry) => {
      const target = owned(root, entry.relative);
      if (entry.kind === "directory") {
        if (!target.stat.isDirectory()) throw new Error(`real fixture copy directory differs: ${entry.relative}`);
        return total;
      }
      if (!target.stat.isFile() || target.stat.size !== entry.bytes) throw new Error(`real fixture copy size differs: ${entry.relative}`);
      return { files: total.files + 1, bytes: total.bytes + target.stat.size };
    }, { files: 0, bytes: 0 });
    copiedFiles += actual.files;
    copiedBytes += actual.bytes;
  }
  for (const resource of copies) {
    if (JSON.stringify(sourceEntries(source, resource.relative)) !== JSON.stringify(resource.entries)) throw new Error(`real fixture source inventory changed during preparation: ${resource.relative}`);
  }
  for (const [relative, content] of syntheticDocuments(version)) {
    const target = childPath(root, relative), bytes = Buffer.from(content, "utf8");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    measureSync("fixture.write", () => fs.writeFileSync(target, bytes), { scope: "fixture", suite, path: relative, fixtureRoot: root, synthetic: true, bytes: bytes.length });
    syntheticFiles++;
    syntheticBytes += bytes.length;
  }
  for (const relative of FIXTURE_MANIFEST.emptyDirectories) fs.mkdirSync(childPath(root, relative), { recursive: true });
  measureSync("validate", () => {
    const result = validateRepository(root);
    if (!result.ok) throw new Error(`generated repository fixture failed strict validation: ${result.errors.join("; ")}`);
  }, { scope: "fixture", suite });
  const summary = { root, sourceRoot: source, copiedFiles, copiedBytes, syntheticFiles, syntheticBytes };
  // Report generated bytes separately: copy-byte reduction alone is not the total-fixture gate.
  return reportRepositoryFixture(summary, { suite });
}
