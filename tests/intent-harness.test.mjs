import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { stringify } from "yaml";
import { COMPATIBILITY_PATH, validateDocumentation, validateSourceBindings, collectNavigationResources, sha256 } from "../scripts/document-harness.mjs";
import { validateRepository } from "../scripts/validate-portable.mjs";
import { populateRepositoryFixture } from "./helpers/repository-fixture.mjs";

const REPO = path.resolve(import.meta.dirname, ".."), ORIGINAL = "docs/intent/[INTENT]_INT-2026-001_Preserve_Intent.md";
const sections = ["问题与现状", "期望结果", "成功判断", "范围与约束", "未决项"];
const provenance = ["提出者", "原始来源", "接受责任人", "原意核对记录", "内容接受记录", "当前内容与适用基线", "主跟踪 Issue"];
export function intentDocument(extra = {}, body) {
  return `---\n${stringify({ type: "intent", layer: "canonical", scope: "marketplace", summary: "Preserve a recoverable original", owner: "fixture-maintainer", created: "2026-10-19", updated: "2026-10-19", state: "draft", version: "v1.0", "intent-id": "INT-2026-001", ...extra })}---\n\n${body ?? `# An original request\n\n| 字段 | 内容 |\n|---|---|\n${provenance.map(label => `| ${label} | 尚无；合成测试资料，不代表真实接受 |`).join("\n")}\n\n${sections.map((title, index) => `## ${index + 1}. ${title}\n\n有出处的合成需求内容；未知保持未知。`).join("\n\n")}\n`}`;
}
function write(root, relative, bytes) { fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true }); fs.writeFileSync(path.join(root, relative), bytes); }
function temporary(t) {
  const parent = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(parent, "intent-harness-"));
  t.after(() => { const relative = path.relative(parent, root); assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative)); fs.rmSync(root, { recursive: true, force: true, maxRetries: 5 }); });
  return root;
}
function fixture(t) {
  const root = temporary(t);
  write(root, COMPATIBILITY_PATH, fs.readFileSync(path.join(REPO, COMPATIBILITY_PATH)));
  write(root, ORIGINAL, intentDocument());
  return root;
}
function bad(root, expected) {
  const result = validateDocumentation(root);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), expected);
  return result;
}
function ordinaryDocument(type, extra = {}, body = "# Navigation\n") {
  return `---\n${stringify({ type, layer: "canonical", scope: "fixture", summary: "Synthetic fixture", owner: "fixture", created: "2026-10-19", updated: "2026-10-19", state: "draft", version: "v1.0", ...extra })}---\n\n${body}`;
}

test("tiered originals and canonical navigation work without manufacturing acceptance or an independent file for a small Issue", t => {
  const root = fixture(t), task = "plans/263-intent";
  write(root, "docs/intent/INDEX.md", ordinaryDocument("guide", {}, `[Original](./${path.posix.basename(ORIGINAL)})\n`));
  const fields = { layer: "working", task: "263-intent", tracking: "https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/263" };
  write(root, `${task}/INDEX.md`, ordinaryDocument("guide", { ...fields, plan: "./[PLAN]_Execution.md", canonical: [`../../${ORIGINAL}`] }));
  write(root, `${task}/[PLAN]_Execution.md`, ordinaryDocument("plan", fields, "# Plan\n\nA small separate request keeps its only original in its Issue, without a second INTENT.\n"));
  const result = validateDocumentation(root);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.intents.documents, 1);
  assert.deepEqual(result.intents.uniqueness, { checked: true, complete: true });
  assert.equal(result.tasks.length, 1);
});

for (const field of ["type", "scope", "summary", "owner", "created", "updated", "state", "version", "layer", "intent-id"]) test(`INTENT requires its explicit scalar field ${field}`, t => {
  const root = fixture(t);
  write(root, ORIGINAL, intentDocument({ [field]: null }));
  bad(root, new RegExp(`scalar field ${field}`));
});

for (const [extra, pattern] of [
  [{ type: "spec" }, /must declare type intent/],
  [{ layer: "working" }, /canonical layer/],
  [{ "intent-id": "INT-2026-000" }, /invalid INTENT stable ID/],
  [{ "intent-id": "INT-2026-1000" }, /invalid INTENT stable ID/],
  [{ "intent-id": "INT-2026-002" }, /filename must match/],
  [{ state: "accepted" }, /unsupported INTENT state/],
  [{ created: "2026-02-30" }, /invalid INTENT dates/],
  [{ updated: "2026-10-18" }, /invalid INTENT dates/],
  [{ created: "2025-10-19" }, /first allocation created year/],
]) test(`identity and lifecycle fail closed: ${JSON.stringify(extra)}`, t => {
  const root = fixture(t); write(root, ORIGINAL, intentDocument(extra)); bad(root, pattern);
});

test("changing title/version or updating in a later year preserves its first-allocation identity", t => {
  const root = fixture(t), renamed = ORIGINAL.replace("Preserve_Intent", "Renamed_Request");
  fs.unlinkSync(path.join(root, ORIGINAL));
  write(root, renamed, intentDocument({ updated: "2027-02-03", version: "v2.0" }));
  assert.equal(validateDocumentation(root).ok, true);
});

for (const [relative, text, pattern] of [
  ["docs/archive/unmarked.md", "---\ntype: intent\nowner: [broken\n---\n", /invalid INTENT YAML/],
  ["docs/archive/[INTENT]_malformed.md", "missing metadata", /requires YAML frontmatter/],
  ["docs/guide/[GUIDE]_Hidden.md", intentDocument(), /filename must match/],
  ["docs/guide/[INTENT]_INT-2026-002_Hidden.md", intentDocument({ "intent-id": "INT-2026-002" }), /must use docs\/intent/],
  ["docs/intent/nested/[INTENT]_INT-2026-002_Hidden.md", intentDocument({ "intent-id": "INT-2026-002" }), /flat docs\/archive directory/],
  ["docs/_templates/OTHER_INTENT.md", intentDocument(), /filename must match/],
  ["docs/archive/unmarked.txt", intentDocument(), /filename must match/],
  ["docs/archive/[INTENT]_unmarked.bin", "missing metadata", /requires YAML frontmatter/],
  ["docs/intent/[GUIDE]_Unregistered.md", ordinaryDocument("guide"), /scalar field intent-id/],
]) test(`type and prefix declaration cannot escape at ${relative}`, t => {
  const root = fixture(t); write(root, relative, text); bad(root, pattern);
});

test("aliases, merged type declarations and duplicate keys cannot smuggle an archived original past recognition", t => {
  const root = fixture(t);
  for (const metadata of [
    "kind: &kind intent\ntype: *kind\n",
    "base: &base {type: intent}\n<<: *base\n",
    "type: intent\ntype: guide\n",
  ]) {
    write(root, "docs/archive/unmarked.md", `---\n${metadata}---\n`);
    bad(root, /aliases or merge keys|invalid INTENT YAML/);
  }
});

for (const state of ["draft", "active", "deprecated", "archived"]) test(`all lifecycle states reserve identity: ${state}`, t => {
  const root = fixture(t), other = ORIGINAL.replace("Preserve_Intent", "Other_Title");
  write(root, other, intentDocument({ state }));
  bad(root, /duplicate INTENT identity INT-2026-001/);
});

test("a flat deprecated archive remains the only original and reserves its ID against later reuse", t => {
  const root = fixture(t), archive = `docs/archive/[DEPRECATED]_${path.posix.basename(ORIGINAL)}`;
  fs.unlinkSync(path.join(root, ORIGINAL));
  write(root, archive, intentDocument({ state: "archived" }));
  const result = validateDocumentation(root);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.intents.documents, 1);
  write(root, ORIGINAL, intentDocument());
  bad(root, /duplicate INTENT identity/);
});

test("only the exact official template exempts placeholder identity and dates", t => {
  const root = fixture(t), template = intentDocument({ "intent-id": "INT-YYYY-NNN", created: "YYYY-MM-DD", updated: "YYYY-MM-DD" });
  write(root, "docs/_templates/TEMPLATE_INTENT.md", template);
  assert.equal(validateDocumentation(root).ok, true);
  write(root, "docs/_templates/RENAMED_TEMPLATE_INTENT.md", template);
  bad(root, /invalid INTENT stable ID/);
});

for (const extra of [{ type: "intent", "intent-id": "INT-2026-001" }, { layer: "working" }, { "intent-id": "INT-2026-001" }]) test(`intent INDEX is only guide/canonical navigation: ${JSON.stringify(extra)}`, t => {
  const root = fixture(t); write(root, "docs/intent/INDEX.md", ordinaryDocument("guide", extra)); bad(root, /guide\/canonical navigation without intent-id/);
});

for (const part of [...sections, ...provenance]) test(`the maintained structure requires ${part} outside code examples`, t => {
  const root = fixture(t), original = intentDocument();
  write(root, ORIGINAL, original.replace(part, "missing") + `\n\n\x60\x60\x60markdown\n## ${part}\n| ${part} | fabricated recovery |\n\x60\x60\x60\n`);
  bad(root, /requires ordered unique second-level section|provenance table row/);
});

test("bound complete snapshots retain the old bytes without becoming a second original; tampering and unbound evidence fail", t => {
  const root = fixture(t), task = "plans/263-intent", snapshot = `${task}/evidence/sources/[INTENT]_INT-2026-001_Preserve_Intent.md`;
  const fields = { layer: "working", task: "263-intent", tracking: "https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/263" };
  write(root, `${task}/INDEX.md`, ordinaryDocument("guide", { ...fields, plan: "./[PLAN]_Execution.md", canonical: [`../../${ORIGINAL}`], sources: "./source-bindings.json" }));
  write(root, `${task}/[PLAN]_Execution.md`, ordinaryDocument("plan", fields));
  const bytes = fs.readFileSync(path.join(root, ORIGINAL)); write(root, snapshot, bytes);
  const source = { id: "accepted-original", kind: "snapshot", path: snapshot.slice(task.length + 1), original: "synthetic complete accepted input", sha256: sha256(bytes), purpose: "Recover prior complete input", scope: "Fixture only; not actual acceptance" };
  write(root, `${task}/source-bindings.json`, JSON.stringify({ schemaVersion: 1, task: "263-intent", sources: [source] }));
  assert.equal(validateSourceBindings(root, task).sources.length, 1);
  assert.equal(validateDocumentation(root).ok, true);
  write(root, ORIGINAL, intentDocument({ updated: "2026-10-20", version: "v2.0" }));
  assert.deepEqual(fs.readFileSync(path.join(root, snapshot)), bytes);
  assert.equal(validateDocumentation(root).ok, true);
  fs.appendFileSync(path.join(root, snapshot), "\nchanged\n"); bad(root, /SHA-256 differs/);
  write(root, snapshot, bytes);
  write(root, `${task}/evidence/unbound.md`, bytes); bad(root, /duplicate INTENT identity|filename must match/);
});

for (const failure of ["read", "scan", "junction"]) test(`incomplete ${failure} cannot report identity uniqueness`, t => {
  const root = fixture(t), originalRead = fs.readFileSync, originalScan = fs.readdirSync;
  try {
    if (failure === "read") fs.readFileSync = (file, ...args) => { if (path.resolve(file) === path.join(root, ORIGINAL)) throw new Error("synthetic EACCES"); return originalRead(file, ...args); };
    if (failure === "scan") fs.readdirSync = (file, ...args) => { if (path.resolve(file) === path.join(root, "docs/intent")) throw new Error("synthetic EACCES"); return originalScan(file, ...args); };
    if (failure === "junction") fs.symlinkSync(temporary(t), path.join(root, "docs/linked"), process.platform === "win32" ? "junction" : "dir");
    const result = bad(root, /uniqueness not established/);
    assert.deepEqual(result.intents.uniqueness, { checked: false, complete: false });
  } finally { fs.readFileSync = originalRead; fs.readdirSync = originalScan; }
});

test("single-file validation remains read-only and checks the whole formal collection; CLI uses structured nonzero failure", t => {
  const root = fixture(t), archive = "docs/archive/[DEPRECATED]_[INTENT]_INT-2026-001_Old_Title.md";
  write(root, archive, intentDocument({ state: "archived" }));
  const before = fs.readFileSync(path.join(root, ORIGINAL));
  const result = validateDocumentation(root, { file: ORIGINAL });
  assert.equal(result.ok, false); assert.equal(result.validationScope, "complete-formal-collection");
  assert.match(result.errors.join("\n"), /duplicate INTENT identity/);
  const cli = spawnSync(process.execPath, [path.join(REPO, "scripts/document-harness.mjs"), root, "--file", ORIGINAL], { encoding: "utf8", windowsHide: true });
  assert.equal(cli.status, 1); assert.equal(JSON.parse(cli.stdout).ok, false);
  assert.match(JSON.parse(cli.stdout).errors.join("\n"), /duplicate INTENT identity/);
  assert.deepEqual(fs.readFileSync(path.join(root, ORIGINAL)), before);
});

test("portable validation and its existing CLI fail on the actual INTENT error", t => {
  const root = temporary(t); populateRepositoryFixture(root, { sourceRoot: REPO, suite: "intent-portable" });
  write(root, ORIGINAL, intentDocument({ "intent-id": "INT-2026-000" }));
  const result = validateRepository(root);
  assert.equal(result.ok, false); assert.match(result.errors.join("\n"), /documentation:.*invalid INTENT stable ID/);
  const cli = spawnSync(process.execPath, [path.join(REPO, "scripts/validate-portable.mjs"), root], { encoding: "utf8", windowsHide: true });
  assert.equal(cli.status, 1); assert.match(JSON.parse(cli.stdout).errors.join("\n"), /invalid INTENT stable ID/);
});

test("real-byte navigation retains the entire identity collection including an unlinked archived original", t => {
  const root = fixture(t), archive = "docs/archive/[DEPRECATED]_[INTENT]_INT-2026-002_Old_Request.md";
  write(root, archive, intentDocument({ "intent-id": "INT-2026-002", state: "deprecated" }));
  write(root, "AGENTS.md", `[Original](./${ORIGINAL})\n`);
  const resources = collectNavigationResources(root, ["AGENTS.md"]);
  assert.ok(resources.includes(archive)); assert.ok(resources.includes(ORIGINAL));
  const restored = temporary(t);
  for (const relative of resources) write(restored, relative, fs.readFileSync(path.join(root, relative)));
  write(restored, COMPATIBILITY_PATH, fs.readFileSync(path.join(root, COMPATIBILITY_PATH)));
  assert.deepEqual(fs.readFileSync(path.join(root, archive)), fs.readFileSync(path.join(restored, archive)));
  const result = validateDocumentation(restored);
  assert.equal(result.ok, true, result.errors.join("\n")); assert.equal(result.intents.documents, 2);
});
