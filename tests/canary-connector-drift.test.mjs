// Tests for scripts/canary-connector-drift.mjs.
//
// The comparator decides drift from the stored Python-computed `tools_sha256` (authoritative — the
// same value the bridge checks against), and uses Node only to explain a difference. Pure-function
// tests drive synthetic snapshots with controlled hashes; a CLI test exercises exit codes against
// the real checked-in baseline; one test documents the Node/Python numeric-format divergence.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { compareConnectorTools, parseArgs, CanaryInputError } from "../scripts/canary-connector-drift.mjs";
import { canonicalJson, sha256 } from "../scripts/generate-nlm-contract.mjs";
import { runCli } from "../scripts/run-cli.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const BASELINE_PATH = path.join(
  REPO_ROOT,
  "plugins/learn-kit/nlm-bridge/src/learn_kit_nlm_bridge/_data/upstream-tools-v0.8.7.json",
);
const realBaseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));

const hex = (c) => c.repeat(64);
const tool = (name, extra = {}) => ({ name, description: "d", inputSchema: { type: "object" }, ...extra });
const snap = (tools, tools_sha256, connector_version = "0.8.7") => ({ connector_version, tools, tools_sha256 });

// ---------------------------------------------------------------- decision = stored tools_sha256

test("no drift when the stored tools_sha256 matches", () => {
  const r = compareConnectorTools(snap([tool("notebook_list")], hex("1"), "0.9.0"), snap([tool("notebook_list")], hex("1")));
  assert.equal(r.drift, false);
  assert.deepEqual(r.reasons, []);
  assert.equal(r.latestVersion, "0.9.0");
  assert.equal(r.baselineVersion, "0.8.7");
});

test("the decision uses the stored hash, not the tool bytes (matching-hash wins even if tools differ)", () => {
  // Contrived: same stored hash but a different description. A real Python snapshot could never
  // produce this, but it proves the DECISION is the stored hash and not a Node recompute.
  const latest = snap([tool("notebook_list", { description: "totally different" })], hex("1"));
  const baseline = snap([tool("notebook_list", { description: "original" })], hex("1"));
  assert.equal(compareConnectorTools(latest, baseline).drift, false);
});

test("drift with a distinct hash and no isolable per-tool cause falls back to a numeric-format note", () => {
  // Identical tools, different stored hash — the shape of a 120.0 -> 120 numeric-format-only change.
  const r = compareConnectorTools(snap([tool("notebook_list")], hex("2")), snap([tool("notebook_list")], hex("1")));
  assert.equal(r.drift, true);
  assert.equal(r.reasons.length, 1);
  assert.match(r.reasons[0], /numeric-format-only|inspect the raw snapshots/);
});

// ---------------------------------------------------------------- human-readable reasons

test("drift explains an added tool", () => {
  const r = compareConnectorTools(
    snap([tool("notebook_list"), tool("notebook_delete")], hex("2")),
    snap([tool("notebook_list")], hex("1")),
  );
  assert.equal(r.drift, true);
  assert.ok(r.reasons.some((x) => /tool added: notebook_delete/.test(x)));
});

test("drift explains a removed tool", () => {
  const r = compareConnectorTools(
    snap([tool("notebook_list")], hex("2")),
    snap([tool("notebook_list"), tool("studio_status")], hex("1")),
  );
  assert.equal(r.drift, true);
  assert.ok(r.reasons.some((x) => /tool removed: studio_status/.test(x)));
});

test("drift explains a changed tool schema", () => {
  const r = compareConnectorTools(
    snap([tool("source_add", { inputSchema: { type: "object", additionalProperties: true } })], hex("2")),
    snap([tool("source_add", { inputSchema: { type: "object", additionalProperties: false } })], hex("1")),
  );
  assert.equal(r.drift, true);
  assert.ok(r.reasons.some((x) => /tool definition changed: source_add/.test(x)));
});

// ---------------------------------------------------------------- validation

test("malformed snapshots are rejected (both the latest and the baseline argument)", () => {
  const good = snap([tool("a")], hex("1"));
  // Latest (first arg) malformed.
  assert.throws(() => compareConnectorTools(snap([tool("a")], "not-a-hash"), good), CanaryInputError);
  assert.throws(() => compareConnectorTools({ tools: [tool("a")] }, good), CanaryInputError);
  assert.throws(() => compareConnectorTools({ tools_sha256: hex("1") }, good), CanaryInputError);
  assert.throws(() => compareConnectorTools(null, good), CanaryInputError);
  // Baseline (second arg) malformed — validation must be symmetric; a valid latest must not mask it.
  assert.throws(() => compareConnectorTools(good, snap([tool("a")], "not-a-hash")), CanaryInputError);
  assert.throws(() => compareConnectorTools(good, { tools_sha256: hex("1") }), CanaryInputError);
  assert.throws(() => compareConnectorTools(good, null), CanaryInputError);
});

// ---------------------------------------------------------------- Node/Python parity note

test("DOC: the real baseline's Python tools_sha256 is NOT reproducible via Node canonicalJson (120.0 vs 120)", () => {
  // The connector schema contains a float default (120.0). JS's JSON round-trip collapses it to 120,
  // so a Node recompute cannot match Python's ensure_ascii/float-preserving hash. This is why the
  // comparator decides on the stored hash and never recomputes. If this ever starts matching, the
  // comparator could be simplified — but do not assume it will.
  assert.notEqual(sha256(canonicalJson(realBaseline.tools)), realBaseline.tools_sha256);
});

// ---------------------------------------------------------------- parseArgs

test("parseArgs requires --latest and --baseline and rejects unknown flags", () => {
  assert.deepEqual(parseArgs(["--latest", "a.json", "--baseline", "b.json"]), { latest: "a.json", baseline: "b.json" });
  assert.throws(() => parseArgs(["--latest", "a.json"]), /--baseline is required/);
  assert.throws(() => parseArgs(["--nope"]), /unknown argument/);
  assert.throws(() => parseArgs(["--latest"]), /missing value/);
});

// ---------------------------------------------------------------- CLI exit codes

test("CLI exits 0 on no drift, 1 on drift, 2 on bad input (against the real baseline)", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "canary-drift-"));
  try {
    // "latest" identical to the real baseline (same Python tools_sha256) -> no drift.
    const same = path.join(dir, "same.json");
    const sameDoc = JSON.parse(JSON.stringify(realBaseline));
    sameDoc.connector_version = "0.9.0";
    fs.writeFileSync(same, JSON.stringify(sameDoc));

    // "latest" with a different stored hash -> drift.
    const drifted = path.join(dir, "drifted.json");
    const driftDoc = JSON.parse(JSON.stringify(realBaseline));
    driftDoc.connector_version = "0.9.0";
    driftDoc.tools_sha256 = hex("f");
    fs.writeFileSync(drifted, JSON.stringify(driftDoc));

    const script = path.join(REPO_ROOT, "scripts/canary-connector-drift.mjs");
    const ok = await runCli(process.execPath, [script, "--latest", same, "--baseline", BASELINE_PATH]);
    assert.equal(ok.status, 0, ok.stderr);

    const drift = await runCli(process.execPath, [script, "--latest", drifted, "--baseline", BASELINE_PATH]);
    assert.equal(drift.status, 1);
    assert.match(drift.stderr, /DRIFT/);

    const bad = await runCli(process.execPath, [script, "--latest", "/no/such/file.json", "--baseline", BASELINE_PATH]);
    assert.equal(bad.status, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
