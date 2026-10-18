#!/usr/bin/env node
// Read-only recovery check. Imports only Node built-ins; never runs archived code.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const taskRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repository = path.resolve(taskRoot, "../..");
const merge = "70267a5b91d759af09a8f1281a33e2d5a90fdbc9";
const testedHead = "385e6919c44cc280266f9fe8c7105f379d45872f";
const historicalTree = "767ec5082451014eb224b6727b5955e6f56574a2";
const postMergeReceiptCommit = "4992d751d3a9e66a22c95a95ff08a351e75331a4";
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

function ownedBytes(relative) {
  assert.equal(typeof relative, "string");
  assert(relative.startsWith("evidence/sources/"), "snapshot must stay in controlled sources");
  assert(!/[\\:\0]/.test(relative) && !relative.split("/").some(part => !part || part === "." || part === ".."));
  let current = taskRoot;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    assert(!fs.lstatSync(current).isSymbolicLink(), `linked snapshot is forbidden: ${relative}`);
  }
  assert(fs.statSync(current).isFile());
  return fs.readFileSync(current);
}

function git(...args) {
  return spawnSync("git", ["--no-replace-objects", ...args], { cwd: repository,
    env: { ...process.env, LC_ALL: "C" }, encoding: null, maxBuffer: 20_000_000,
    timeout: 10000, windowsHide: true });
}

const bindingsBytes = fs.readFileSync(path.join(taskRoot, "source-bindings.json"));
const bindings = JSON.parse(bindingsBytes);
assert.equal(bindings.schemaVersion, 1);
assert.equal(bindings.task, "217-html-guide-kit");
const byId = new Map();
const gitAvailable = fs.existsSync(path.join(repository, ".git"));
const gitChecks = [];
for (const source of bindings.sources) {
  assert(["git", "snapshot"].includes(source.kind));
  assert(!byId.has(source.id), `duplicate source id: ${source.id}`);
  const bytes = ownedBytes(source.kind === "git" ? source.snapshot : source.path);
  assert.equal(sha(bytes), source.sha256, `snapshot bytes differ: ${source.id}`);
  if (source.kind === "git" && gitAvailable) {
    assert.match(source.commit, /^[0-9a-f]{40}$/);
    assert.equal(typeof source.path, "string");
    assert(!/[\\:\0]/.test(source.path) && !source.path.split("/").some(part => !part || part === "." || part === ".."));
    const available = git("cat-file", "-t", source.commit);
    assert(!available.error || available.error.code === "ENOENT", `Git inspection failed: ${source.id}`);
    if (available.status === 0) {
      assert.equal(available.stdout.toString("utf8").trim(), "commit", `source object is not a commit: ${source.id}`);
      const listing = git("ls-tree", "-z", source.commit, "--", source.path);
      assert.equal(listing.status, 0, `cannot inspect fixed Git path: ${source.id}`);
      const entries = listing.stdout.toString("utf8").split("\0").filter(Boolean);
      assert.equal(entries.length, 1);
      assert(/^(?:100644|100755) blob /.test(entries[0]) && entries[0].split("\t")[1] === source.path,
        `fixed source must be an ordinary Git file: ${source.id}`);
      const raw = git("show", "--no-textconv", `${source.commit}:${source.path}`);
      assert.equal(raw.status, 0, `fixed Git path missing: ${source.id}`);
      assert.equal(sha(raw.stdout), source.sha256, `Git original bytes differ: ${source.id}`);
      gitChecks.push({ id: source.id, status: "MATCHED_ORIGINAL_GIT_BYTES" });
    } else {
      assert(available.error?.code === "ENOENT" || /could not get object info|Not a valid object name/i.test(available.stderr?.toString("utf8") ?? ""),
        `cannot inspect Git source; no snapshot fallback for other failures: ${source.id}`);
      gitChecks.push({ id: source.id, status: "OBJECT_UNAVAILABLE_SNAPSHOT_VERIFIED" });
    }
  }
  byId.set(source.id, { source, bytes });
}
const original = id => {
  assert(byId.has(id), `missing named source: ${id}`);
  return byId.get(id);
};
const json = id => JSON.parse(original(id).bytes);
const maps = [json("pr1-engineering-checks").resources, json("pr1-develop-sync-checks").runtimeResources];
assert.deepEqual(maps[0], maps[1], "the two original declared resource maps must agree");
assert.equal(Object.keys(maps[0]).length, 43);
const runtimeSources = bindings.sources.filter(source => /^pr1-runtime-\d{3}$/.test(source.id));
assert.equal(runtimeSources.length, 43);
assert.deepEqual(runtimeSources.map(source => source.path).sort(), Object.keys(maps[0]).sort());
const runtime = runtimeSources.map(source => {
  assert.equal(source.commit, merge);
  const bytes = original(source.id).bytes;
  const historicalCheckoutSha256 = maps[0][source.path];
  let comparison;
  let comparedBytes;
  if (source.path.endsWith(".png")) {
    comparison = "raw";
    comparedBytes = bytes;
  } else {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    assert(Buffer.from(text, "utf8").equals(bytes), `text must be reversibly UTF-8: ${source.path}`);
    assert(!text.includes("\r"), `original must be LF-only for this explicit comparison: ${source.path}`);
    comparison = "deterministic_CRLF";
    comparedBytes = Buffer.from(text.replaceAll("\n", "\r\n"), "utf8");
  }
  assert.equal(sha(comparedBytes), historicalCheckoutSha256, `historical checkout declaration mismatch: ${source.path}`);
  return { id: source.id, originalPath: source.path, commit: source.commit, snapshot: source.snapshot,
    gitRawSha256: source.sha256, gitRawBytes: bytes.length, historicalCheckoutSha256,
    comparison, comparedBytes: comparedBytes.length, status: "MATCH" };
});
assert.equal(runtime.filter(row => row.comparison === "raw").length, 3);
assert.equal(runtime.filter(row => row.comparison === "deterministic_CRLF").length, 40);

const historicalDocuments = bindings.sources.filter(source => source.kind === "git" && !source.id.startsWith("pr1-runtime-") && source.id !== "current-html-manifest");
assert.equal(historicalDocuments.length, 12);
for (const source of historicalDocuments) assert.equal(source.commit, source.id === "pr1-post-merge-install" ? postMergeReceiptCommit : merge);
const identity = { merge, testedHead, tree: historicalTree, status: "FIXED_IDENTITIES_RECORDED" };
if (gitAvailable) {
  const trees = [merge, testedHead].map(commit => git("rev-parse", `${commit}^{tree}`));
  if (trees.every(result => result.status === 0)) {
    for (const result of trees) assert.equal(result.stdout.toString("utf8").trim(), historicalTree);
    identity.status = "BOTH_GIT_TREES_MATCH";
  }
}
const capture = json("current-github-observation-times");
for (const request of capture.requests) {
  assert.equal(request.method, "GET");
  assert.equal(request.exitCode, 0);
  assert.equal(request.sha256, original(request.id).source.sha256);
  assert(Number.isFinite(Date.parse(request.startedAt)) && Number.isFinite(Date.parse(request.completedAt)));
}
const issues = [217, 218, 239].map(number => {
  const item = json(`current-issue-${number}`);
  assert.equal(item.number, number);
  return { number, state: item.state, title: item.title, updatedAt: item.updated_at, closedAt: item.closed_at };
});
const pr = json("current-pr-221");
assert.equal(pr.number, 221);
assert.equal(pr.merge_commit_sha, merge);
const reviews = json("current-pr-221-reviews");
assert(Array.isArray(reviews));
const manifest = json("current-html-manifest");
console.log(JSON.stringify({ schemaVersion: 1, kind: "html-pr1-read-only-resource-verification",
  generatedAt: new Date().toISOString(), generatedBy: "verify-pr1-sources.mjs",
  executionIdentity: process.env.TASK_DOCUMENTATION_VERIFIER_ID ?? null,
  method: "node plans/217-html-guide-kit/evidence/verify-pr1-sources.mjs",
  verifierSha256: sha(fs.readFileSync(fileURLToPath(import.meta.url))), bindingsSha256: sha(bindingsBytes),
  ok: true, fixedHistoricalDocuments: historicalDocuments.length, declaredResourceMapsEqual: true,
  declaredRuntimeResources: runtime.length, rawPngMatches: 3, deterministicCrlfTextMatches: 40,
  identity, gitSourceChecks: gitChecks, sourceSnapshots: bindings.sources.length,
  observations: { capturedAt: capture.generatedAt, issues, pr221: { state: pr.state, mergedAt: pr.merged_at,
    mergeCommit: pr.merge_commit_sha, reviewCount: reviews.length }, currentHtmlVersion: manifest.version,
    currentManifestCommit: original("current-html-manifest").source.commit }, runtime,
  limitations: ["No original source byte or declared historical hash was changed; text comparison is a separate deterministic checkout representation.",
    "The 43 historical resources are not the current runtime closure and retired Understanding paths remain unchanged.",
    "No archived script, historical test, model, desktop UI, persistent question window or real-world effect acceptance was executed.",
    "GitHub observations and issue closure do not supply missing independent approval or Owner final acceptance."] }, null, 2));
