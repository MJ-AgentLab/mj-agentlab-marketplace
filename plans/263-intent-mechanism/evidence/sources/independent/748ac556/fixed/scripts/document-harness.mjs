import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { parseDocument } from "yaml";
import { frozenEvidenceResources } from "./frozen-evidence-resources.mjs";
import { validateIntentInventory, declaresIntent, INTENT_INDEX } from "./intent-harness.mjs";

export const COMPATIBILITY_PATH = "docs/_meta/document-layer-compatibility.json";
export const COMPATIBILITY_SOURCE = "a2a57d11cfb2a43ccc19bf0c54c44a242a3cc9cd";
// Pins the reviewed inventory, not a signature or a replacement for PR review.
export const COMPATIBILITY_SHA256 = "88677eef5e88ed1d3e8592d2f3d0d255d37ee96c64302ca98b509fddf2ba3796";
const TYPES = new Set(["adr", "guide", "runbook", "spec", "standard", "postmortem", "plan", "report", "intent"]);
const FIELDS = ["type", "scope", "summary", "owner", "created", "updated", "state", "version"];
const LOCATORS = ["related", "supersedes", "replaced-by", "plan", "report", "canonical", "sources", "requirements", "acceptance", "implementation", "evidence"];
const SHA = /^[0-9a-f]{64}$/, COMMIT = /^[0-9a-f]{40}$/;
const nonempty = value => typeof value === "string" && !!value.trim();
export const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const blob = bytes => crypto.createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
const exact = (value, keys, optional = []) => {
  if (!value || typeof value !== "object" || Array.isArray(value) || keys.some(key => !Object.hasOwn(value, key)) || Object.keys(value).some(key => ![...keys, ...optional].includes(key))) throw new Error("unexpected or missing schema fields");
};
function parse(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("missing YAML frontmatter");
  const document = parseDocument(match[1], { uniqueKeys: true });
  if (document.errors.length) throw new Error(document.errors.map(error => error.message).join("; "));
  const metadata = document.toJS();
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new Error("frontmatter must be a mapping");
  return { metadata, body: text.slice(match[0].length) };
}
function parseJson(text) {
  const document = parseDocument(text, { uniqueKeys: true });
  if (document.errors.length) throw new Error(`duplicate or invalid JSON keys: ${document.errors.map(error => error.message).join("; ")}`);
  return JSON.parse(text);
}
function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
function relativePath(value) {
  if (!nonempty(value) || path.isAbsolute(value) || /[\\:\0]/.test(value) || value.split("/").some(part => !part || part === "." || part === "..")) throw new Error(`invalid owned path: ${value}`);
  return value;
}
export function documentResource(root, relative, { allowDirectory = false } = {}) {
  relativePath(relative);
  if (fs.lstatSync(root).isSymbolicLink()) throw new Error("document root must not be a symlink or junction");
  let file = root;
  for (const part of relative.split("/")) {
    file = path.join(file, part);
    if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`document resource must not contain a symlink or junction: ${relative}`);
  }
  const stat = fs.statSync(file);
  if (!stat.isFile() && !(allowDirectory && stat.isDirectory())) throw new Error(`document resource must be an ordinary file: ${relative}`);
  return file;
}
function walk(root, relative) {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return [];
  if (fs.lstatSync(directory).isSymbolicLink()) throw new Error(`document directory must not be a symlink or junction: ${relative}`);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const next = `${relative}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`document resource must not contain a symlink or junction: ${next}`);
    return entry.isDirectory() ? walk(root, next) : [next];
  });
}
function proseLinks(body) {
  const prose = body.replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1\s*$/gm, "").replace(/`[^`\n]+`/g, "");
  return [...prose.matchAll(/\]\(([^)\r\n]+)\)/g)].map(match => match[1]);
}
function locatorValues(metadata) {
  return LOCATORS.flatMap(key => {
    if (!Object.hasOwn(metadata, key)) return [];
    const value = metadata[key];
    if (nonempty(value)) return [value];
    if (Array.isArray(value) && value.every(nonempty)) return value;
    throw new Error(`document locator ${key} must be a string or string array`);
  });
}
function localTarget(root, relative, target) {
  target = target.trim().replace(/^<|>$/g, "");
  if (/^(?:https?:|mailto:|#)/i.test(target)) return null;
  if (/^[a-z][a-z0-9+.-]*:|^[\\/]|[{}<>\0]/i.test(target)) throw new Error(`unsupported document locator: ${target}`);
  let pathname;
  try { pathname = decodeURIComponent(target.split("#")[0]); } catch { throw new Error(`invalid document locator encoding: ${target}`); }
  if (!pathname) return null;
  const result = path.posix.normalize(path.posix.join(path.posix.dirname(relative), pathname)).replace(/\/$/, "");
  documentResource(root, result, { allowDirectory: true });
  return result;
}
function gitBytes(root, commit, relative) {
  if (typeof commit !== "string" || !COMMIT.test(commit)) throw new Error("source commit must be a full lowercase Git SHA string");
  relativePath(relative);
  if (!fs.existsSync(path.join(root, ".git"))) return null; // portable ordinary copy
  const available = spawnSync("git", ["--no-replace-objects", "cat-file", "-t", commit], { cwd: root, env: { ...process.env, LC_ALL: "C" }, encoding: "utf8", windowsHide: true, timeout: 10000 });
  if (available.error && available.error.code !== "ENOENT") throw new Error(`cannot determine Git source availability: ${available.error.message}`);
  if (available.error?.code === "ENOENT") return null;
  if (available.status !== 0) {
    if (/could not get object info|Not a valid object name/i.test(available.stderr)) return null;
    throw new Error(`cannot inspect Git source availability: ${available.stderr.trim()}`);
  }
  if (available.stdout.trim() !== "commit") throw new Error("source Git object must be a commit");
  const args = ["--no-replace-objects", "ls-tree", "-z", commit, "--", relative];
  const listing = spawnSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true, timeout: 10000, maxBuffer: 1024 * 1024 });
  if (listing.status !== 0) throw new Error(`cannot inspect available Git source: ${commit}:${relative}`);
  const record = listing.stdout.split("\0").filter(Boolean);
  if (record.length !== 1 || !record[0].startsWith("100644 blob ") && !record[0].startsWith("100755 blob ") || record[0].split("\t")[1] !== relative) throw new Error(`source is missing or is not an ordinary Git file: ${commit}:${relative}`);
  const result = spawnSync("git", ["--no-replace-objects", "show", "--no-textconv", `${commit}:${relative}`], { cwd: root, windowsHide: true, timeout: 10000, maxBuffer: 32 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`cannot read Git source: ${commit}:${relative}`);
  return result.stdout;
}

/** Real-byte closure for Agent reading in isolated smoke sources. */
export function collectNavigationResources(root, seeds, { onEvidence = () => {} } = {}) {
  const pending = [...seeds], collected = new Set();
  // An isolated projection must retain the whole formal identity collection,
  // including an unlinked deprecated original, not just the visible index links.
  for (const relative of walk(root, "docs").filter(relative => relative.endsWith(".md") || declaresIntent(relative, "") || relative.startsWith("docs/intent/"))) {
    if (relative === INTENT_INDEX || declaresIntent(relative, fs.readFileSync(documentResource(root, relative), "utf8"))) pending.push(relative);
  }
  while (pending.length) {
    const relative = pending.pop();
    if (collected.has(relative)) continue;
    const file = documentResource(root, relative, { allowDirectory: true });
    if (/(?:^|\/)(?:\.git|\.env[^/]*|credentials[^/]*)(?:\/|$)/i.test(relative)) throw new Error(`restricted navigation dependency: ${relative}`);
    collected.add(relative);
    if (fs.statSync(file).isDirectory()) {
      pending.push(...walk(root, relative));
      continue;
    }
    if (/^docs\/(?:archive|_templates)\//.test(relative) || /^\.github\/(?:PULL_REQUEST_TEMPLATE|ISSUE_TEMPLATE)\//.test(relative) || /^plans\/[^/]+\/evidence\/sources\//.test(relative) || relative.startsWith("plan/") || path.posix.basename(relative) === "CHANGELOG.md") continue;
    if (relative.endsWith(".md")) {
      const text = fs.readFileSync(file, "utf8"), parsed = text.startsWith("---") ? parse(text) : { metadata: {}, body: text };
      for (const target of [...proseLinks(parsed.body), ...locatorValues(parsed.metadata)]) {
        // Absolute provenance locators are traceability only, never a local dependency.
        if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(target.trim())) continue;
        const resolved = localTarget(root, relative, target);
        if (resolved) pending.push(resolved);
      }
    } else if (/^plans\/[^/]+\/source-bindings\.json$/.test(relative)) {
      const directory = path.posix.dirname(relative), bindings = validateSourceBindings(root, directory);
      for (const source of bindings.sources) {
        const snapshot = source.kind === "snapshot" ? source.path : source.snapshot;
        if (snapshot) pending.push(`${directory}/${snapshot}`);
        else throw new Error(`portable source binding requires a controlled snapshot: ${source.id}`);
      }
    } else if (relative.endsWith(".json")) {
      const frozen = frozenEvidenceResources(root, relative, documentResource);
      if (frozen) { pending.push(...frozen.resources); onEvidence(frozen.coverage); }
    }
  }
  return [...collected].sort();
}

export function validateCompatibility(root) {
  const file = documentResource(root, COMPATIBILITY_PATH), bytes = fs.readFileSync(file);
  if (sha256(bytes) !== COMPATIBILITY_SHA256) throw new Error("compatibility inventory differs from its reviewed pin");
  const manifest = parseJson(bytes.toString("utf8"));
  exact(manifest, ["schemaVersion", "sourceCommit", "documents"]);
  if (manifest.schemaVersion !== 1 || manifest.sourceCommit !== COMPATIBILITY_SOURCE || !Array.isArray(manifest.documents)) throw new Error("invalid compatibility source identity");
  const entries = new Map();
  for (const entry of manifest.documents) {
    exact(entry, ["path", "sha256", "gitBlob"]);
    relativePath(entry.path);
    if (!entry.path.startsWith("docs/") || /\/(?:archive|_templates|evidence)\//.test(entry.path) || !entry.path.endsWith(".md") || typeof entry.sha256 !== "string" || !SHA.test(entry.sha256) || typeof entry.gitBlob !== "string" || !COMMIT.test(entry.gitBlob) || entries.has(entry.path)) throw new Error("invalid or duplicate compatibility entry");
    entries.set(entry.path, entry);
  }
  return { manifest, entries };
}

/** Rebuildable proof of the pinned inventory against original Git objects. */
export function verifyCompatibilityGitSource(root) {
  const { manifest } = validateCompatibility(root);
  for (const entry of manifest.documents) {
    const bytes = gitBytes(root, manifest.sourceCommit, entry.path);
    if (!bytes || sha256(bytes) !== entry.sha256 || blob(bytes) !== entry.gitBlob) throw new Error(`compatibility Git bytes differ or unavailable: ${entry.path}`);
  }
  return { sourceCommit: manifest.sourceCommit, documents: manifest.documents.length };
}
function legacyMatches(bytes, entry) {
  if (sha256(bytes) === entry.sha256) return true;
  // Only the deterministic text checkout representation is accepted. Frozen evidence
  // and source snapshots are never normalized by this compatibility mechanism.
  const original = Buffer.from(bytes.toString("utf8").replaceAll("\r\n", "\n"));
  return sha256(original) === entry.sha256 && bytes.equals(Buffer.from(original.toString("utf8").replaceAll("\n", "\r\n")));
}
function trackingUrl(value) {
  if (typeof value !== "string") return false;
  if (/^https:\/\/github\.com\/MJ-AgentLab\/mj-agentlab-marketplace\/(?:issues|pull)\/[1-9]\d*$/.test(value)) return true;
  const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
  return new RegExp(`^(?:codex:\/\/threads\/|https:\/\/chatgpt\\.com\/c\/)${uuid}$`, "i").test(value);
}

export function validateSourceBindings(root, taskDirectory) {
  relativePath(taskDirectory);
  if (!/^plans\/[^/]+$/.test(taskDirectory)) throw new Error("source binding must belong to one task directory");
  const task = path.posix.basename(taskDirectory), relative = `${taskDirectory}/source-bindings.json`;
  const value = parseJson(fs.readFileSync(documentResource(root, relative), "utf8"));
  exact(value, ["schemaVersion", "task", "sources"]);
  if (value.schemaVersion !== 1 || value.task !== task || !Array.isArray(value.sources) || !value.sources.length) throw new Error("invalid task source binding identity");
  const ids = new Set();
  const snapshotBytes = local => {
    relativePath(local);
    if (!local.startsWith("evidence/sources/")) throw new Error("source snapshot must be controlled in task evidence/sources");
    return fs.readFileSync(documentResource(root, `${taskDirectory}/${local}`));
  };
  for (const source of value.sources) {
    const common = ["id", "kind", "path", "sha256", "purpose", "scope"];
    if (source.kind === "git") exact(source, [...common, "commit"], ["snapshot"]);
    else if (source.kind === "snapshot") exact(source, [...common, "original"]);
    else throw new Error("source kind must be git or snapshot");
    if (!nonempty(source.id) || ids.has(source.id) || typeof source.sha256 !== "string" || !SHA.test(source.sha256) || !nonempty(source.purpose) || !nonempty(source.scope)) throw new Error("invalid source identity/hash/purpose/scope");
    ids.add(source.id);
    let bytes;
    if (source.kind === "git") {
      bytes = gitBytes(root, source.commit, source.path);
      if (source.snapshot !== undefined) {
        const snapshot = snapshotBytes(source.snapshot);
        if (sha256(snapshot) !== source.sha256) throw new Error(`source snapshot SHA-256 differs: ${source.id}`);
        if (!bytes) bytes = snapshot;
      }
      if (!bytes) throw new Error(`Git source is unavailable without a controlled snapshot: ${source.id}`);
    } else {
      if (!nonempty(source.original)) throw new Error("snapshot original locator is required");
      bytes = snapshotBytes(source.path);
    }
    if (sha256(bytes) !== source.sha256) throw new Error(`source SHA-256 differs: ${source.id}`);
  }
  return value;
}

/** Governed documents only; frozen evidence, archive/templates and native formats retain their contracts. */
export function validateDocumentation(root, { file } = {}) {
  root = path.resolve(root);
  const errors = [], documents = new Map(), tasks = [];
  const check = (label, run) => { try { return run(); } catch (error) { errors.push(`${label}: ${error.message}`); } };
  const compatibility = check(COMPATIBILITY_PATH, () => validateCompatibility(root));
  const entries = compatibility?.entries ?? new Map();
  const inventory = check("documentation inventory", () => { documentResource(root, "docs", { allowDirectory: true }); return [...walk(root, "docs"), ...walk(root, "plans")]; });
  const paths = inventory ?? [];
  if (file !== undefined) check("requested document", () => { relativePath(file); documentResource(root, file); if (!paths.includes(file)) throw new Error("requested document is outside the formal collection"); });
  const rawSources = new Set();
  for (const relative of paths.filter(relative => /^plans\/[^/]+\/source-bindings\.json$/.test(relative))) check(relative, () => {
    const taskDirectory = path.posix.dirname(relative), bindings = validateSourceBindings(root, taskDirectory);
    for (const source of bindings.sources) {
      const snapshot = source.kind === "snapshot" ? source.path : source.snapshot;
      if (snapshot) rawSources.add(`${taskDirectory}/${snapshot}`);
    }
  });
  const contents = new Map();
  const intentFiles = paths.filter(relative => relative.endsWith(".md") || /\.(?:txt|ya?ml)$/i.test(relative) || declaresIntent(relative, "") || relative.startsWith("docs/intent/")).map(relative => {
    try { const bytes = fs.readFileSync(documentResource(root, relative)); contents.set(relative, bytes); return { relative, text: bytes.toString("utf8") }; }
    catch (error) { return { relative, error }; }
  });
  const intents = validateIntentInventory(intentFiles, { complete: inventory !== undefined, excludedSnapshots: rawSources });
  errors.push(...intents.errors);
  for (const relative of paths.filter(relative => relative.endsWith(".md") && !/^docs\/(?:archive|_templates)\//.test(relative) && !rawSources.has(relative))) check(relative, () => {
    const bytes = contents.get(relative) ?? fs.readFileSync(documentResource(root, relative)), text = bytes.toString("utf8");
    const { metadata, body } = parse(text);
    for (const field of FIELDS) if (!nonempty(metadata[field])) throw new Error(`missing or invalid document field ${field}`);
    if (!TYPES.has(metadata.type)) throw new Error("unsupported document type");
    if (!["draft", "active", "deprecated", "archived"].includes(metadata.state)) throw new Error("unsupported document state");
    if (!validDate(metadata.created) || !validDate(metadata.updated) || metadata.updated < metadata.created) throw new Error("invalid document dates");
    const filename = path.posix.basename(relative);
    if (filename !== "INDEX.md" && !filename.startsWith(`[${metadata.type.toUpperCase()}]_`)) throw new Error("document filename must match its type");
    if (filename === "INDEX.md" && metadata.type !== "guide") throw new Error("INDEX document type must be guide");
    const legacy = !Object.hasOwn(metadata, "layer") && entries.has(relative) && legacyMatches(bytes, entries.get(relative));
    if (!legacy && !["canonical", "working"].includes(metadata.layer)) throw new Error("document layer must be canonical or working; changed/new documents cannot use legacy compatibility");
    if (["plan", "report"].includes(metadata.type) && metadata.layer !== "working") throw new Error("PLAN and REPORT must be working documents");
    if (relative.startsWith("plans/")) {
      const parts = relative.split("/");
      if (parts.length !== 3 || !/^(?:[1-9]\d*-)?[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parts[1]) || metadata.layer !== "working" || metadata.task !== parts[1] || !trackingUrl(metadata.tracking)) throw new Error("task document requires plans/<stable-task>/, working layer, matching task and stable tracking URL");
    } else {
      if (relative !== "docs/INDEX.md" && !/^docs\/(?:rule|adr|spec|guide|runbook|postmortem|intent)\//.test(relative)) throw new Error("document must use a maintained docs domain directory");
      if (metadata.layer === "working" && !nonempty(metadata.purpose)) throw new Error("public/field working document requires purpose and owner");
      const directory = { standard: "rule", adr: "adr", guide: "guide", runbook: "runbook", spec: "spec", postmortem: "postmortem", intent: "intent" }[metadata.type];
      if (metadata.layer === "canonical" && relative !== "docs/INDEX.md" && relative !== INTENT_INDEX && !relative.startsWith(`docs/${directory}/`)) throw new Error("canonical document directory must match its maintained domain/type");
    }
    const targets = [...proseLinks(body), ...locatorValues(metadata)].map(target => localTarget(root, relative, target)).filter(Boolean);
    documents.set(relative, { metadata, body, targets, legacy });
  });
  const taskNames = new Set(paths.filter(relative => relative.startsWith("plans/")).map(relative => relative.split("/")[1]));
  for (const task of taskNames) check(`plans/${task}`, () => {
    const directory = `plans/${task}`, index = documents.get(`${directory}/INDEX.md`);
    const members = [...documents.entries()].filter(([relative]) => relative.startsWith(`${directory}/`));
    const plans = members.filter(([, item]) => item.metadata.type === "plan"), reports = members.filter(([, item]) => item.metadata.type === "report");
    if (!index || plans.length !== 1 || reports.length > 1) throw new Error("task requires one INDEX, exactly one main PLAN and at most one main REPORT");
    if (members.some(([, item]) => item.metadata.tracking !== index.metadata.tracking)) throw new Error("task documents must share the same stable tracking URL");
    if (!Object.hasOwn(index.metadata, "plan")) throw new Error("INDEX plan metadata is required");
    if (reports.length && !Object.hasOwn(index.metadata, "report")) throw new Error("INDEX report metadata is required when the REPORT exists");
    if (!index.targets.includes(plans[0][0]) || reports.some(([relative]) => !index.targets.includes(relative))) throw new Error("task INDEX must navigate to its main PLAN and REPORT");
    for (const [key, candidates] of [["plan", plans], ["report", reports]]) if (Object.hasOwn(index.metadata, key)) {
      if (!nonempty(index.metadata[key]) || candidates.length !== 1 || localTarget(root, `${directory}/INDEX.md`, index.metadata[key]) !== candidates[0][0]) throw new Error(`INDEX ${key} metadata must identify its main document`);
    }
    const canonical = index.metadata.canonical;
    if (!Array.isArray(canonical) || !canonical.length || canonical.some(target => {
      if (!nonempty(target)) return true;
      const resolved = localTarget(root, `${directory}/INDEX.md`, target);
      return !/^docs\/(?:rule|adr|spec|guide|runbook|postmortem|intent)\/.+\.md$/.test(resolved ?? "") || documents.get(resolved)?.metadata.layer !== "canonical";
    })) throw new Error("task INDEX requires validated explicit canonical domain-document navigation");
    if (paths.includes(`${directory}/source-bindings.json`)) {
      if (!nonempty(index.metadata.sources) || localTarget(root, `${directory}/INDEX.md`, index.metadata.sources) !== `${directory}/source-bindings.json`) throw new Error("INDEX sources metadata must identify its source-bindings.json");
      if (!index.targets.includes(`${directory}/source-bindings.json`)) throw new Error("task INDEX must navigate to source-bindings.json");
      validateSourceBindings(root, directory);
    }
    tasks.push({ task, plan: plans[0][0], report: reports[0]?.[0] ?? null });
  });
  return { ok: errors.length === 0, errors, documents: documents.size, tasks, legacyDocuments: [...documents.values()].filter(document => document.legacy).length, intents: { documents: intents.documents.size, identities: intents.identities, uniqueness: intents.uniqueness }, ...(file === undefined ? {} : { requestedFile: file, validationScope: "complete-formal-collection" }) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2), root = args[0] && !args[0].startsWith("--") ? args.shift() : path.resolve(import.meta.dirname, "..");
  if (args.length && (args.length !== 2 || args[0] !== "--file")) throw new Error("expected [repository] [--file relative-document]");
  const result = validateDocumentation(root, args.length ? { file: args[1] } : {});
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exitCode = result.ok ? 0 : 1;
}
