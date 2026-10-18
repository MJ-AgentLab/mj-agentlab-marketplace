import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { stringify } from "yaml";
import { COMPATIBILITY_PATH, COMPATIBILITY_SOURCE, validateDocumentation, validateCompatibility, verifyCompatibilityGitSource, validateSourceBindings, sha256 } from "../scripts/document-harness.mjs";

const REPO = path.resolve(import.meta.dirname, ".."), TASK = "plans/321-document-test";
function temporary(t) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "document-harness-"));
  t.after(() => {
    const rel = path.relative(fs.realpathSync.native(os.tmpdir()), fs.realpathSync.native(root));
    assert.ok(rel && rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel));
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  return root;
}
function write(root, relative, value) {
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), value);
}
function document(type, extra = {}, body = "# Document\n") {
  return `---\n${stringify({ type, layer: "canonical", scope: "test", summary: "Real executable test fixture", owner: "test-owner", created: "2026-10-18", updated: "2026-10-19", state: "active", version: "v1.0", ...extra })}---\n\n${body}`;
}
function fixture(t) {
  const root = temporary(t);
  write(root, COMPATIBILITY_PATH, fs.readFileSync(path.join(REPO, COMPATIBILITY_PATH)));
  write(root, "docs/spec/[SPEC]_Contract.md", document("spec"));
  const fields = { layer: "working", task: "321-document-test", tracking: "https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/257" };
  write(root, `${TASK}/INDEX.md`, document("guide", { ...fields, plan: "./[PLAN]_Execution.md", report: "./[REPORT]_Execution.md", canonical: ["../../docs/spec/[SPEC]_Contract.md"] }));
  write(root, `${TASK}/[PLAN]_Execution.md`, document("plan", fields));
  write(root, `${TASK}/[REPORT]_Execution.md`, document("report", fields));
  return root;
}
function replace(root, relative, from, to) {
  const file = path.join(root, relative);
  const text = fs.readFileSync(file, "utf8");
  assert.ok(text.includes(from), from);
  fs.writeFileSync(file, text.replace(from, to));
}
const bad = (root, pattern) => { const result = validateDocumentation(root); assert.equal(result.ok, false); assert.match(result.errors.join("\n"), pattern); };

test("new task documents require explicit layer and preserve draft canonical/completed working distinction", t => {
  const root = fixture(t);
  replace(root, "docs/spec/[SPEC]_Contract.md", "state: active", "state: draft");
  assert.equal(validateDocumentation(root).ok, true);
  replace(root, `${TASK}/[REPORT]_Execution.md`, "state: active", "state: archived");
  assert.equal(validateDocumentation(root).ok, true);
  replace(root, `${TASK}/[REPORT]_Execution.md`, "layer: working", "layer: canonical");
  bad(root, /PLAN and REPORT must be working/);
});

for (const [from, to, expected] of [
  ["layer: canonical", "layer: other", /layer must be canonical or working/],
  ["layer: canonical\n", "", /changed\/new/],
  ["type: spec", "type: assessment", /unsupported document type/],
  ["type: spec", "type: guide", /filename must match/],
  ["state: active", "state: complete", /unsupported document state/],
  ["created: 2026-10-18", "created: 2026-02-30", /invalid document dates/],
  ["updated: 2026-10-19", "updated: 2026-01-01", /invalid document dates/],
]) test(`rejects invalid metadata ${to || "missing layer"}`, t => {
  const root = fixture(t); replace(root, "docs/spec/[SPEC]_Contract.md", from, to); bad(root, expected);
});

test("public working records require their maintained purpose and owner", t => {
  const root = fixture(t);
  write(root, "docs/runbook/[RUNBOOK]_Shared.md", document("runbook", { layer: "working", purpose: "Shared cross-task execution ledger", owner: "operations" }));
  assert.equal(validateDocumentation(root).ok, true);
  replace(root, "docs/runbook/[RUNBOOK]_Shared.md", "purpose: Shared cross-task execution ledger\n", "");
  bad(root, /requires purpose and owner/);
});

test("canonical domain paths and task nested template/evidence escape attempts are rejected", t => {
  const root = fixture(t);
  write(root, "docs/guide/[SPEC]_Wrong_Domain.md", document("spec")); bad(root, /directory must match/);
  fs.unlinkSync(path.join(root, "docs/guide/[SPEC]_Wrong_Domain.md"));
  write(root, "docs/unknown/[REPORT]_Ledger.md", document("report", { layer: "working", purpose: "Shared ledger" })); bad(root, /maintained docs domain/);
  fs.unlinkSync(path.join(root, "docs/unknown/[REPORT]_Ledger.md"));
  write(root, `${TASK}/_templates/hidden.md`, "not a native template\n"); bad(root, /missing YAML frontmatter/);
});

for (const [file, from, to, expected] of [
  ["[PLAN]_Execution.md", "task: 321-document-test", "task: other", /matching task/],
  ["[PLAN]_Execution.md", "tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/257", "tracking: https://example.com/257", /tracking URL/],
  ["INDEX.md", "plan: ./[PLAN]_Execution.md", "plan: ./[REPORT]_Execution.md", /must navigate|plan metadata/],
  ["INDEX.md", "canonical:\n  - ../../docs/spec/[SPEC]_Contract.md", "canonical: []", /canonical domain/],
  ["INDEX.md", "type: guide", "type: plan", /INDEX document type/],
]) test(`task identity and navigation reject ${file} ${to}`, t => {
  const root = fixture(t); replace(root, `${TASK}/${file}`, from, to); bad(root, expected);
});

test("required main-document metadata cannot be replaced by body links; initial tasks may omit REPORT", t => {
  const root = fixture(t), index = `${TASK}/INDEX.md`;
  const fields = { layer: "working", task: "321-document-test", tracking: "https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/257", canonical: ["../../docs/spec/[SPEC]_Contract.md"] };
  const links = "[Plan](./[PLAN]_Execution.md) [Report](./[REPORT]_Execution.md)";
  write(root, index, document("guide", fields, links)); bad(root, /INDEX plan metadata is required/);
  write(root, index, document("guide", { ...fields, plan: "./[PLAN]_Execution.md" }, links)); bad(root, /INDEX report metadata is required/);
  write(root, index, document("guide", { ...fields, plan: "./[PLAN]_Execution.md", report: "./[REPORT]_Execution.md" }, links));
  assert.equal(validateDocumentation(root).ok, true);
  write(root, `${TASK}/[PLAN]_Duplicate.md`, fs.readFileSync(path.join(root, `${TASK}/[PLAN]_Execution.md`)));
  bad(root, /exactly one main PLAN/);
  fs.unlinkSync(path.join(root, `${TASK}/[PLAN]_Duplicate.md`));
  fs.unlinkSync(path.join(root, index)); bad(root, /requires one INDEX/);
  fs.unlinkSync(path.join(root, `${TASK}/[REPORT]_Execution.md`));
  write(root, index, document("guide", { ...fields, plan: "./[PLAN]_Execution.md" }));
  assert.equal(validateDocumentation(root).ok, true);
});

test("a task without an Issue can use a stable existing conversation identity without forced issue creation", t => {
  const root = fixture(t), task = "stable-document-task", target = `plans/${task}`;
  fs.renameSync(path.join(root, TASK), path.join(root, target));
  for (const filename of ["INDEX.md", "[PLAN]_Execution.md", "[REPORT]_Execution.md"]) replace(root, `${target}/${filename}`, "task: 321-document-test", `task: ${task}`);
  const original = "https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/257";
  const codex = "codex://threads/123e4567-e89b-12d3-a456-426614174000";
  for (const filename of ["INDEX.md", "[PLAN]_Execution.md", "[REPORT]_Execution.md"]) replace(root, `${target}/${filename}`, original, codex);
  assert.equal(validateDocumentation(root).ok, true); // format only; no claim this synthetic task exists live
  replace(root, `${target}/INDEX.md`, codex, "https://chatgpt.com/c/123e4567-e89b-12d3-a456-426614174000");
  bad(root, /must share the same stable tracking/);
  for (const filename of ["[PLAN]_Execution.md", "[REPORT]_Execution.md"]) replace(root, `${target}/${filename}`, codex, "https://chatgpt.com/c/123e4567-e89b-12d3-a456-426614174000");
  assert.equal(validateDocumentation(root).ok, true);
  const text = fs.readFileSync(path.join(root, `${target}/INDEX.md`), "utf8");
  for (const tracking of ["unknown", "current", "TODO", "../current-task", "codex://threads/current", "https://chatgpt.com/c/TODO", "https://github.com/other/repo/issues/257"]) {
    write(root, `${target}/INDEX.md`, text.replace("https://chatgpt.com/c/123e4567-e89b-12d3-a456-426614174000", tracking));
    bad(root, /stable tracking URL/);
  }
});

test("local Markdown and metadata paths are checked, including encoded traversal and missing targets", t => {
  const root = fixture(t);
  for (const key of ["related", "supersedes", "replaced-by", "requirements", "acceptance", "implementation", "evidence"]) {
    const relative = "docs/spec/[SPEC]_Bad.md";
    write(root, relative, document("spec", { [key]: "./missing.md" })); bad(root, /ENOENT/);
    fs.unlinkSync(path.join(root, relative));
  }
  write(root, "docs/spec/[SPEC]_Bad.md", document("spec", {}, "[escape](../../../%2e%2e/secret.md)"));
  bad(root, /invalid owned path/);
});

test("canonical navigation cannot point to arbitrary JSON, working ledgers, archive or undeclared legacy", t => {
  const root = fixture(t), index = `${TASK}/INDEX.md`;
  write(root, "docs/evidence/unrelated.json", "{}");
  write(root, "docs/runbook/[RUNBOOK]_Working.md", document("runbook", { layer: "working", purpose: "Public ledger" }));
  write(root, "docs/archive/old.md", "historical raw format");
  const entry = validateCompatibility(root).manifest.documents[0];
  write(root, entry.path, execFileSync("git", ["show", `${COMPATIBILITY_SOURCE}:${entry.path}`], { cwd: REPO }));
  const original = fs.readFileSync(path.join(root, index), "utf8");
  for (const target of ["../../docs/evidence/unrelated.json", "../../docs/runbook/[RUNBOOK]_Working.md", "../../docs/archive/old.md", `../../${entry.path}`]) {
    write(root, index, original.replace("../../docs/spec/[SPEC]_Contract.md", target));
    bad(root, /requires validated explicit canonical/);
  }
});

test("pinned legacy inventory proves original Git bytes, supports deterministic CRLF checkout and denies changed/new bypass", t => {
  const proof = verifyCompatibilityGitSource(REPO);
  assert.equal(proof.sourceCommit, COMPATIBILITY_SOURCE); assert.equal(proof.documents, 53);
  const root = fixture(t), { manifest } = validateCompatibility(root), entry = manifest.documents[0];
  const original = execFileSync("git", ["show", `${COMPATIBILITY_SOURCE}:${entry.path}`], { cwd: REPO });
  // Original links may be absent from this small isolated fixture. The compatibility
  // assertion concerns layer eligibility only, not a fabricated complete repository.
  write(root, entry.path, original);
  assert.ok(!validateDocumentation(root).errors.some(error => error.startsWith(`${entry.path}:`) && error.includes("layer")));
  write(root, entry.path, original.toString("utf8").replaceAll("\n", "\r\n"));
  assert.ok(!validateDocumentation(root).errors.some(error => error.startsWith(`${entry.path}:`) && error.includes("layer")));
  fs.appendFileSync(path.join(root, entry.path), "\nchanged\n"); bad(root, /changed\/new documents/);
  write(root, "docs/spec/[SPEC]_New.md", document("spec").replace("layer: canonical\n", "")); bad(root, /changed\/new documents/);
  const manifestFile = path.join(root, COMPATIBILITY_PATH), modified = JSON.parse(fs.readFileSync(manifestFile));
  modified.documents.push({ path: "docs/spec/[SPEC]_New.md", sha256: sha256(fs.readFileSync(path.join(root, "docs/spec/[SPEC]_New.md"))), gitBlob: "a".repeat(40) });
  fs.writeFileSync(manifestFile, JSON.stringify(modified)); bad(root, /inventory differs from its reviewed pin/);
});

function binding(root, sources) {
  write(root, `${TASK}/source-bindings.json`, JSON.stringify({ schemaVersion: 1, task: "321-document-test", sources }));
  const index = path.join(root, `${TASK}/INDEX.md`), text = fs.readFileSync(index, "utf8");
  if (!text.includes("sources: ./source-bindings.json")) fs.writeFileSync(index, text.replace("\n---\n", "\nsources: ./source-bindings.json\n---\n"));
  if (!text.includes("[Bound sources]")) fs.appendFileSync(index, "\n[Bound sources](./source-bindings.json)\n");
}
function snapshot(root) {
  const bytes = Buffer.from("# Original unmodified source\r\nNo governance metadata.\r\n");
  write(root, `${TASK}/evidence/sources/original.md`, bytes);
  return { id: "owner-source", kind: "snapshot", path: "evidence/sources/original.md", original: "owner supplied original text", sha256: sha256(bytes), purpose: "Accepted decision", scope: "This task only" };
}

test("bound snapshot original bytes remain raw; an unbound Markdown file cannot hide in evidence", t => {
  const root = fixture(t), source = snapshot(root); binding(root, [source]);
  assert.equal(validateDocumentation(root).ok, true);
  const original = fs.readFileSync(path.join(root, `${TASK}/${source.path}`));
  write(root, `${TASK}/${source.path}`, original.toString("utf8").replaceAll("\r\n", "\n"));
  bad(root, /SHA-256 differs/);
  write(root, `${TASK}/${source.path}`, original);
  write(root, `${TASK}/evidence/unbound.md`, "unbound working document"); bad(root, /missing YAML frontmatter/);
});

test("source bindings read actual contents and reject wrong hashes, lost files, traversal and ambiguous schema", t => {
  const root = fixture(t), source = snapshot(root); binding(root, [source]);
  assert.equal(validateSourceBindings(root, TASK).sources.length, 1);
  replace(root, `${TASK}/INDEX.md`, "sources: ./source-bindings.json\n", ""); bad(root, /INDEX sources metadata/);
  binding(root, [source]);
  binding(root, [{ ...source, sha256: "0".repeat(64) }]); bad(root, /SHA-256 differs/);
  binding(root, [{ ...source, sha256: [source.sha256] }]); bad(root, /identity\/hash\/purpose\/scope/);
  binding(root, [{ ...source, path: "evidence/sources/missing.md" }]); bad(root, /ENOENT/);
  binding(root, [{ ...source, path: "evidence/sources/../../INDEX.md" }]); bad(root, /invalid owned path/);
  binding(root, [{ ...source, path: "../../outside.md" }]); bad(root, /invalid owned path/);
  binding(root, [source, source]); bad(root, /identity\/hash\/purpose\/scope/);
  binding(root, [{ ...source, kind: "html-plan" }]); bad(root, /kind must be/);
  write(root, `${TASK}/source-bindings.json`, '{"schemaVersion":1,"schemaVersion":1}');
  bad(root, /duplicate or invalid JSON keys/);
});

test("Git binding reads pinned version and verifies portable snapshot without conflating the current file", t => {
  const root = fixture(t), originalPath = "plan/communication-kit-implementation-plan.md";
  const bytes = execFileSync("git", ["show", `${COMPATIBILITY_SOURCE}:${originalPath}`], { cwd: REPO });
  write(root, `${TASK}/evidence/sources/git-original.txt`, bytes);
  const source = { id: "git-original", kind: "git", path: originalPath, commit: COMPATIBILITY_SOURCE, sha256: sha256(bytes), purpose: "Frozen accepted text", scope: "Historical mapping", snapshot: "evidence/sources/git-original.txt" };
  binding(root, [source]);
  assert.equal(validateDocumentation(root).ok, true); // no Git objects in the portable fixture
  assert.throws(() => validateSourceBindings(REPO, TASK)); // no fictitious task in the actual repo
  binding(root, [{ ...source, commit: "main" }]); bad(root, /full lowercase Git SHA/);
  binding(root, [{ ...source, commit: [source.commit] }]); bad(root, /Git SHA string/);
  binding(root, [{ ...source, snapshot: undefined }]); bad(root, /unavailable without a controlled snapshot/);
  const git = (...args) => execFileSync("git", args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
  git("init", "-q"); git("config", "user.name", "Fixture"); git("config", "user.email", "fixture@example.invalid");
  write(root, "source.txt", "first version\n"); git("add", "source.txt"); git("-c", "core.autocrlf=false", "commit", "-q", "-m", "first");
  const commit = git("rev-parse", "HEAD");
  const gitSource = { ...source, path: "source.txt", commit, sha256: sha256(Buffer.from("first version\n")), snapshot: undefined };
  binding(root, [gitSource]); assert.equal(validateSourceBindings(root, TASK).sources.length, 1);
  const blob = git("rev-parse", `${commit}:source.txt`);
  binding(root, [{ ...gitSource, commit: blob, snapshot: source.snapshot }]);
  bad(root, /source Git object must be a commit/);
  binding(root, [{ ...gitSource, path: "missing.txt", snapshot: source.snapshot }]);
  bad(root, /source is missing or is not an ordinary Git file/);
  binding(root, [gitSource]);
  write(root, "source.txt", "second version\n");
  assert.equal(validateSourceBindings(root, TASK).sources.length, 1);
  binding(root, [{ ...gitSource, sha256: sha256(Buffer.from("second version\n")) }]); bad(root, /SHA-256 differs/);
});

test("source and documentation junctions cannot escape their owned roots", t => {
  const root = fixture(t), source = snapshot(root), outside = temporary(t);
  fs.unlinkSync(path.join(root, `${TASK}/evidence/sources/original.md`));
  fs.rmdirSync(path.join(root, `${TASK}/evidence/sources`));
  fs.writeFileSync(path.join(outside, "original.md"), "external\n");
  fs.symlinkSync(outside, path.join(root, `${TASK}/evidence/sources`), process.platform === "win32" ? "junction" : "dir");
  binding(root, [source]); bad(root, /symlink or junction/);
});
