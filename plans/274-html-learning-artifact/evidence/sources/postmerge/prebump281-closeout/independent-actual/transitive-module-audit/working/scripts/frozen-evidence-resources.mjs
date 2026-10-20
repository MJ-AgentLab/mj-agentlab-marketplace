import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const digest = value => typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
const count = value => Number.isSafeInteger(value) && value >= 0;
function child(directory, relative) {
  if (typeof relative !== "string" || !relative || /[\\:\0]/.test(relative) || relative.split("/").some(part => !part || part === "." || part === "..")) throw new Error("frozen evidence reference must remain in its public container");
  return path.posix.join(directory, relative);
}
function verify(bytes, record, label) {
  if (!count(record.bytes) || !digest(record.sha256) || bytes.length !== record.bytes || hash(bytes) !== record.sha256) throw new Error(`frozen evidence bytes/hash differ: ${label}`);
}
function restored(entry) {
  if (typeof entry.content !== "string" || !["utf8", "base64"].includes(entry.encoding)) throw new Error("invalid frozen packet content/encoding");
  if (entry.encoding === "utf8" && !entry.content.isWellFormed()) throw new Error("invalid frozen UTF-8 packet content");
  const bytes = Buffer.from(entry.content, entry.encoding);
  if (entry.encoding === "base64" && bytes.toString("base64") !== entry.content) throw new Error("invalid canonical frozen base64");
  verify(bytes, entry, entry.relativeOriginalPath);
  return bytes;
}

/** Existing public HTML evidence formats only; original absolute locators are never opened. */
export function frozenEvidenceResources(root, relative, readResource) {
  const reviewer = /^docs\/runbook\/evidence\/html-guide-kit\/pr[23]-reviewer\/(?:[^/]+\/)*index\.json$/.test(relative);
  const archive = /^docs\/runbook\/evidence\/html-guide-kit\/pr3-post-merge\/[^/]+\/archive-index\.json$/.test(relative);
  if (!reviewer && !archive) return null;
  const value = JSON.parse(fs.readFileSync(readResource(root, relative), "utf8")), directory = path.posix.dirname(relative);
  const resources = [], read = local => {
    const resolved = child(directory, local);
    resources.push(resolved);
    return fs.readFileSync(readResource(root, resolved));
  };
  if (reviewer) {
    if (value.schemaVersion !== 1 || value.kind !== "lossless-reviewer-evidence-index" || !Array.isArray(value.packets) || !value.packets.length || !Array.isArray(value.files) || value.fileCount !== value.files.length) throw new Error("invalid known reviewer evidence index");
    const packets = new Map(), entries = new Map(), names = new Set();
    let originalBytes = 0;
    for (const descriptor of value.packets) {
      if (typeof descriptor.file !== "string" || !descriptor.file.startsWith("packets/") || packets.has(descriptor.file)) throw new Error("invalid or duplicate frozen packet reference");
      const bytes = read(descriptor.file); verify(bytes, descriptor, descriptor.file);
      const packet = JSON.parse(bytes);
      if (packet.schemaVersion !== 1 || packet.kind !== "lossless-reviewer-packet" || !Array.isArray(packet.entries) || packet.entries.length !== descriptor.fileCount || packet.scope !== descriptor.scope) throw new Error("invalid frozen packet identity/count/scope");
      packets.set(descriptor.file, packet);
      packet.entries.forEach((entry, index) => {
        child("original", entry.relativeOriginalPath); // lexical identity only, no source read
        if (names.has(entry.relativeOriginalPath)) throw new Error("duplicate frozen original identity");
        names.add(entry.relativeOriginalPath);
        originalBytes += restored(entry).length;
        entries.set(`${descriptor.file}#${index}`, entry);
      });
    }
    const mapped = new Set();
    for (const record of value.files) {
      if (typeof record.packet !== "string" || !count(record.entryIndex)) throw new Error("invalid frozen inventory packet locator");
      const key = `${record.packet}#${record.entryIndex}`, entry = entries.get(key);
      if (!entry || mapped.has(key) || record.jsonPointer !== `/entries/${record.entryIndex}` || ["relativeOriginalPath", "sha256", "bytes", "encoding"].some(field => record[field] !== entry[field])) throw new Error("frozen inventory does not locate its exact packet entry");
      mapped.add(key);
    }
    if (mapped.size !== entries.size || originalBytes !== value.originalBytes) throw new Error("incomplete frozen original inventory");
    for (const [name, expected] of Object.entries(value.pinnedOriginalByteSha256 ?? {})) {
      if (!digest(expected) || ![...entries.values()].some(entry => entry.relativeOriginalPath === name && entry.sha256 === expected)) throw new Error(`frozen pinned original is unavailable: ${name}`);
    }
    if (!digest(value.identityEvidenceSha256) || hash(read("identities.json")) !== value.identityEvidenceSha256) throw new Error("frozen identity evidence bytes differ");
    return { resources, coverage: { path: relative, format: value.kind, status: "PASS", packets: packets.size, restoredFiles: entries.size, originalBytes, inventoryDigest: "historical locator; aggregate serialization not recomputed", semantics: "opaque historical grades; no model/client rerun or external source access" } };
  }
  // The repository has five explicit generations of public receipt indexes.
  // Source/sourcePath/file/original fields remain provenance; only these owned
  // receipt locators are resource references. No generic JSON path guessing.
  let records, locator;
  if (Array.isArray(value.entries) && value.entries.every(record => typeof record.name === "string")) { records = value.entries; locator = "name"; }
  else if (Array.isArray(value.rows) && value.rows.every(record => typeof record.relative === "string")) { records = value.rows; locator = "relative"; }
  else if (Array.isArray(value.files) && value.files.every(record => typeof record.relative === "string")) { records = value.files; locator = "relative"; }
  else if (Array.isArray(value.files) && value.files.every(record => typeof record.archiveRelative === "string")) { records = value.files; locator = "archiveRelative"; }
  else if (Array.isArray(value.files) && value.files.every(record => typeof record.rel === "string")) { records = value.files; locator = "rel"; }
  else throw new Error(`unrecognized public archive index receipt format: ${relative}`);
  const unique = new Set();
  for (const record of records) {
    if (unique.has(record[locator])) throw new Error("duplicate archived receipt locator");
    unique.add(record[locator]); verify(read(record[locator]), record, record[locator]);
  }
  return { resources, coverage: { path: relative, format: `public-receipt-index/${locator}`, status: "PASS", receipts: records.length, inventoryDigest: "historical locator; aggregate serialization not recomputed", semantics: "original receipts only; historical verdicts unchanged" } };
}
