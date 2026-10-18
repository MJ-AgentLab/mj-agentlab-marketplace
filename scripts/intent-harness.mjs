import path from "node:path";
import { isAlias, isMap, isScalar, isPair, parseDocument, visit } from "yaml";

export const INTENT_TEMPLATE = "docs/_templates/TEMPLATE_INTENT.md";
export const INTENT_INDEX = "docs/intent/INDEX.md";
const ID = /^INT-(\d{4})-(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
const FIELDS = ["type", "scope", "summary", "owner", "created", "updated", "state", "version", "layer", "intent-id"];
const SECTIONS = ["问题与现状", "期望结果", "成功判断", "范围与约束", "未决项"];
const PROVENANCE = ["提出者", "原始来源", "接受责任人", "原意核对记录", "内容接受记录", "当前内容与适用基线", "主跟踪 Issue"];
const nonempty = value => typeof value === "string" && !!value.trim();
const prefix = relative => /^(?:\[DEPRECATED\]_)?\[INTENT\]/i.test(path.posix.basename(relative));
const date = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  return { source: match[1], document: parseDocument(match[1], { uniqueKeys: true }), body: text.slice(match[0].length) };
}

/** Filename, type and identity declarations are inspected even in malformed archives. */
export function declaresIntent(relative, text) {
  if (prefix(relative)) return true;
  const parsed = frontmatter(text);
  // A broken opening block is still a declaration. It cannot disappear into
  // the archive/template exclusions just because its closing delimiter is lost.
  const source = parsed?.source ?? (/^---\r?\n/.test(text) ? text.slice(text.indexOf("\n") + 1) : "");
  const rawIdentity = /(?:^|\n)(?:intent-id|["']intent-id["'])\s*:/m.test(source);
  if (!parsed) return rawIdentity || /(?:^|\n)\s*(?:type|["']type["'])\s*:\s*(?:!!str\s+)?["']?intent["']?(?:\s*(?:#.*)?$)/m.test(source);
  try {
    for (const value of [parsed.document.toJS(), parseDocument(parsed.source, { merge: true }).toJS()]) {
      if (value?.type === "intent" || value && Object.hasOwn(value, "intent-id")) return true;
    }
  } catch { /* inspect raw declaration below */ }
  return rawIdentity || /(?:^|\n)\s*(?:type|["']type["'])\s*:\s*(?:!!str\s+)?["']?intent(?:["']?(?:\s*(?:#.*)?$))/m.test(source);
}

function parseIntent(text) {
  const parsed = frontmatter(text);
  if (!parsed) throw new Error("INTENT requires YAML frontmatter");
  if (parsed.document.errors.length) throw new Error(`invalid INTENT YAML: ${parsed.document.errors.map(error => error.message).join("; ")}`);
  if (!isMap(parsed.document.contents)) throw new Error("INTENT frontmatter must be a mapping");
  visit(parsed.document, (_key, node) => {
    if (isAlias(node) || isPair(node) && isScalar(node.key) && node.key.value === "<<") throw new Error("INTENT metadata must not use YAML aliases or merge keys");
  });
  const metadata = parsed.document.toJS();
  for (const field of FIELDS) {
    const node = parsed.document.get(field, true);
    if (!isScalar(node) || !nonempty(metadata[field])) throw new Error(`INTENT requires explicit nonempty scalar field ${field}`);
  }
  if (metadata.type !== "intent" || metadata.layer !== "canonical") throw new Error("INTENT must declare type intent and canonical layer");
  return { metadata, body: parsed.body };
}

function structure(body) {
  // Code samples cannot stand in for the maintained prose contract.
  const prose = body.replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1\s*$/gm, "");
  const headings = [...prose.matchAll(/^##[ \t]+(?:\d+[.、．)]\s*)?([^\r\n]+)\r?$/gm)];
  let previous = -1;
  for (const section of SECTIONS) {
    const matches = headings.filter(match => match[1].trim() === section);
    if (matches.length !== 1 || matches[0].index <= previous) throw new Error(`INTENT requires ordered unique second-level section ${section}`);
    const match = matches[0], end = headings.find(heading => heading.index > match.index)?.index ?? prose.length;
    if (!prose.slice(match.index + match[0].length, end).trim()) throw new Error(`INTENT section must not be empty: ${section}`);
    previous = match.index;
  }
  const introduction = prose.slice(0, headings.find(match => match[1].trim() === SECTIONS[0]).index);
  for (const label of PROVENANCE) {
    const rows = introduction.split(/\r?\n/).filter(line => line.startsWith("|")).map(line => line.split(/(?<!\\)\|/).slice(1, -1).map(cell => cell.trim()));
    const values = rows.filter(row => row[0] === label);
    if (values.length !== 1 || values[0].length !== 2 || !values[0][1]) throw new Error(`INTENT requires one nonempty provenance table row ${label} before its sections`);
  }
}

/** Structural identity evidence only: never a claim of faithful meaning or actual acceptance. */
export function validateIntentInventory(files, { complete = true, excludedSnapshots = new Set() } = {}) {
  const errors = [], identities = new Map(), resources = [], documents = new Map();
  let readable = complete;
  for (const { relative, text, error } of files) {
    if (error) { readable = false; errors.push(`${relative}: INTENT inventory read failed: ${error.message}`); continue; }
    if (excludedSnapshots.has(relative)) continue;
    const declaration = declaresIntent(relative, text);
    if (relative === INTENT_INDEX) {
      try {
        const parsed = frontmatter(text);
        if (!parsed || parsed.document.errors.length || parsed.document.get("type") !== "guide" || parsed.document.get("layer") !== "canonical" || parsed.document.has("intent-id")) throw new Error("INTENT INDEX must be guide/canonical navigation without intent-id");
      } catch (error) { errors.push(`${relative}: ${error.message}`); }
      resources.push(relative);
      continue;
    }
    if (!declaration && !relative.startsWith("docs/intent/")) continue;
    resources.push(relative);
    try {
      const { metadata, body } = parseIntent(text);
      if (relative === INTENT_TEMPLATE) continue; // Only this exact official template has placeholder identity/dates.
      if (!ID.test(metadata["intent-id"])) throw new Error("invalid INTENT stable ID (INT-YYYY-001 through INT-YYYY-999)");
      // Reserve the declared ID even if later location or content checks fail.
      const id = metadata["intent-id"];
      if (!identities.has(id)) identities.set(id, []);
      identities.get(id).push(relative);
      if (!["draft", "active", "deprecated", "archived"].includes(metadata.state)) throw new Error("unsupported INTENT state");
      if (!date(metadata.created) || !date(metadata.updated) || metadata.updated < metadata.created) throw new Error("invalid INTENT dates");
      const [_, year] = id.match(ID);
      if (year !== metadata.created.slice(0, 4)) throw new Error("INTENT ID year must match first allocation created year");
      const name = path.posix.basename(relative), archived = relative.startsWith("docs/archive/");
      const expected = new RegExp(`^${archived ? "\\[DEPRECATED\\]_" : ""}\\[INTENT\\]_${id}_[A-Za-z0-9][A-Za-z0-9_-]*\\.md$`);
      if (!expected.test(name)) throw new Error("INTENT filename must match its stable ID and topic");
      if (!/^docs\/(?:intent|archive)\/[^/]+\.md$/.test(relative)) throw new Error("INTENT must use docs/intent or flat docs/archive directory");
      if (archived && !["deprecated", "archived"].includes(metadata.state)) throw new Error("archived INTENT must retain deprecated or archived state");
      structure(body);
      documents.set(relative, { metadata, body });
    } catch (error) { errors.push(`${relative}: ${error.message}`); }
  }
  for (const [id, locations] of identities) if (locations.length > 1) errors.push(`duplicate INTENT identity ${id}: ${locations.join(", ")}`);
  if (!readable) errors.push("INTENT identity uniqueness not established: inventory is incomplete");
  return { ok: errors.length === 0, errors, documents, resources, identities: identities.size, uniqueness: { checked: readable && errors.length === 0, complete: readable } };
}
