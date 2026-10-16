import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { measureSync } from "./perf-metrics.mjs";

export const SMOKE_SOURCE_INPUTS = Object.freeze([".agents", "plugins", "AGENTS.md", ".codex", "VERSION", ".gitattributes"]);
const DIRECTORY_INPUTS = new Set([".agents", "plugins", ".codex"]);
const PYTHON_ROOTS = new Set(["plugins/learning-evidence-kit/scripts", "plugins/diagram-kit/skills/arch-diagram/scripts"]);
const RECORD_PATH = "tests/fixtures/learning-evidence/learning-record.json";
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const text = error => error?.message ?? String(error);
const combined = (original, cleanup) => new AggregateError([original, cleanup], `${text(original)}; source cleanup failed: ${text(cleanup)}`, { cause: original });

function ordinaryRoot(root) {
  const stat = fs.lstatSync(root);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error("smoke source root must be an ordinary directory");
  return fs.realpathSync.native(root);
}
function owned(root, relative) {
  if (!relative || path.isAbsolute(relative) || /[\\:\0]/.test(relative) || relative.split("/").some(part => !part || part === "." || part === "..")) throw new Error(`invalid smoke source path: ${relative}`);
  let file = root;
  for (const part of relative.split("/")) {
    file = path.join(file, part);
    if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`smoke source link is forbidden: ${relative}`);
  }
  const stat = fs.lstatSync(file);
  if (!stat.isFile() && !stat.isDirectory()) throw new Error(`smoke source must be an ordinary file or directory: ${relative}`);
  return { file, stat };
}
function inventory(root, relative, excludeGenerated) {
  const entry = owned(root, relative);
  if (entry.stat.isFile()) {
    const bytes = fs.readFileSync(entry.file);
    return [{ path: relative, kind: "file", bytes: bytes.length, sha256: hash(bytes) }];
  }
  const children = fs.readdirSync(entry.file, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(child => {
    const next = `${relative}/${child.name}`;
    if (child.isSymbolicLink()) throw new Error(`smoke source link is forbidden: ${next}`);
    if (excludeGenerated && PYTHON_ROOTS.has(relative) && ((child.name === "__pycache__" && child.isDirectory()) || (child.isFile() && child.name.endsWith(".pyc")))) return [];
    return inventory(root, next, excludeGenerated);
  });
  return [{ path: relative, kind: "directory", bytes: 0 }, ...children];
}
function manifest(root, excludeGenerated) {
  return SMOKE_SOURCE_INPUTS.flatMap(relative => {
    const entry = owned(root, relative);
    if (entry.stat.isDirectory() !== DIRECTORY_INPUTS.has(relative)) throw new Error(`wrong smoke source input type: ${relative}`);
    return inventory(root, relative, excludeGenerated);
  });
}
function sameManifest(expected, actual, label) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error(`smoke source bytes or inventory differ: ${label}`);
}
function freeze(value) {
  if (value && typeof value === "object") { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
}
function readLearningRecord(root) {
  const source = owned(root, RECORD_PATH);
  if (!source.stat.isFile()) throw new Error("smoke learning record input must be an ordinary file");
  const bytes = fs.readFileSync(source.file), record = JSON.parse(bytes.toString("utf8"));
  if (!record || Array.isArray(record) || record.schema_version !== 1 || record.kind !== "learning" || !Number.isInteger(record.record_version) || !record.identity || !record.task || !Array.isArray(record.knowledge_units) || !record.knowledge_units.length || !Array.isArray(record.observations) || !record.observations.length) throw new Error("smoke learning record input has an invalid basic shape");
  // Full record validation remains the installed Python entry's responsibility.
  return { learningRecord: freeze(record), learningRecordSha256: hash(bytes) };
}
function copyEntries(source, destination, entries, details) {
  const fileCount = entries.filter(entry => entry.kind === "file").length;
  const bytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  measureSync("copy", () => {
    for (const entry of entries) {
      const sourceEntry = owned(source, entry.path), target = path.join(destination, ...entry.path.split("/"));
      if (entry.kind === "directory") {
        if (!sourceEntry.stat.isDirectory()) throw new Error(`smoke source directory changed: ${entry.path}`);
        fs.mkdirSync(target, { recursive: true });
      } else {
        if (!sourceEntry.stat.isFile()) throw new Error(`smoke source file changed: ${entry.path}`);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(sourceEntry.file, target);
      }
    }
  }, { scope: "smoke", sourceRoot: source, destinationRoot: destination, copiedFiles: fileCount, copiedBytes: bytes, ...details });
}

/** Verify the real projection; a prepared template/src must contain no generated extras. */
export function assertSmokeSource(snapshot, directory, { git = false } = {}) {
  const root = ordinaryRoot(directory), expected = [...SMOKE_SOURCE_INPUTS, ...(git ? [".git"] : [])].sort();
  if (JSON.stringify(fs.readdirSync(root).sort()) !== JSON.stringify(expected)) throw new Error("smoke source root inventory differs");
  if (git) {
    const entry = owned(root, ".git");
    if (!entry.stat.isDirectory()) throw new Error("scenario Git metadata must be its own ordinary directory");
  }
  measureSync("validate", () => sameManifest(snapshot.entries, manifest(root, false), root), { scope: "smoke", stage: "source-integrity", sourceRoot: snapshot.sourceRoot, repositoryRoot: root });
}

export function removeSmokeSource(snapshot) {
  return measureSync("cleanup", () => {
    const root = ordinaryRoot(snapshot.root), temporary = fs.realpathSync.native(os.tmpdir()), relative = path.relative(temporary, root);
    if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || !path.basename(root).startsWith("marketplace-smoke-source-")) throw new Error("refusing smoke template cleanup outside its owned temporary root");
    fs.rmSync(root, { recursive: true, force: true });
  }, { scope: "smoke", stage: "template" });
}

/** Called only after complete original-repository validation; creates no synthetic documents. */
export function prepareSmokeSource(repoRoot) {
  const sourceRoot = ordinaryRoot(repoRoot);
  const entries = freeze(manifest(sourceRoot, true)), record = readLearningRecord(sourceRoot);
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "marketplace-smoke-source-"));
  const templateRoot = path.join(root, "template"), snapshot = Object.freeze({ root, sourceRoot, templateRoot, entries, ...record });
  try {
    fs.mkdirSync(templateRoot);
    copyEntries(sourceRoot, templateRoot, entries, { stage: "template" });
    sameManifest(entries, manifest(sourceRoot, true), sourceRoot);
    assertSmokeSource(snapshot, templateRoot);
    return snapshot;
  } catch (error) {
    try { removeSmokeSource(snapshot); } catch (cleanup) { throw combined(error, cleanup); }
    throw error;
  }
}

/** Each scenario receives a fresh ordinary source directory, never a shared or linked tree. */
export function materializeSmokeSource(snapshot, destination, installed) {
  const root = ordinaryRoot(destination);
  if (fs.readdirSync(root).length) throw new Error("scenario source destination must be empty");
  const nested = value => value === "" || (!value.startsWith(`..${path.sep}`) && value !== ".." && !path.isAbsolute(value));
  for (const source of [snapshot.root, snapshot.sourceRoot]) if (nested(path.relative(source, root)) || nested(path.relative(root, source))) throw new Error("scenario source must be separate from the original and template trees");
  assertSmokeSource(snapshot, snapshot.templateRoot);
  copyEntries(snapshot.templateRoot, root, snapshot.entries, { stage: "scenario", installed, originalSourceRoot: snapshot.sourceRoot });
  assertSmokeSource(snapshot, root);
}
