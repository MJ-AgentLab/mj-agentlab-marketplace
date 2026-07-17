// Tests for the Python NLM bridge (plan §2.3.1). Drives the REAL bridge in a production-shaped
// venv (hashed connector closure + editable bridge); see tests/helpers/nlm-bridge-venv.mjs.
//
// Skips when Python 3.12 / uv is unavailable, unless REQUIRE_PYTHON=1 (CI), matching the repo's
// REQUIRE_* convention. This file covers the LOCAL contract surface — `--contract-json` for the
// bridge and the restricted login module, and the receipt binding. The MCP host state machine,
// the adapters, and the guarded upstream runner are covered alongside them as they land.

import test from "node:test";
import assert from "node:assert/strict";

import path from "node:path";

import {
  bridgeVenv,
  skipUnlessBridge,
  bridgeFacts,
  validReceipt,
  writeReceipt,
  removeReceipt,
  runBridgeModule,
  openBridge,
  emptyHomeEnv,
  BRIDGE_DIR,
} from "./helpers/nlm-bridge-venv.mjs";

const skip = skipUnlessBridge();
const venv = bridgeVenv();
const facts = venv ? bridgeFacts(venv.python) : null;
const PY = venv?.python;

/** Write a receipt, run fn, always remove the receipt afterwards. */
function withReceipt(receipt, fn) {
  const meta = writeReceipt(facts, receipt);
  try {
    return fn(meta);
  } finally {
    removeReceipt(facts);
  }
}

const contractJson = (mod = "learn_kit_nlm_bridge") =>
  runBridgeModule(PY, ["-m", mod, "--contract-json"]);

// ---------------------------------------------------------------- bridge --contract-json

test("--contract-json returns the full local fingerprint with a valid receipt", { skip }, () => {
  withReceipt(validReceipt(facts), (meta) => {
    const r = contractJson();
    assert.equal(r.status, 0, r.stderr);
    const c = JSON.parse(r.stdout);
    assert.equal(c.bridge_version, "4.0.0");
    assert.equal(c.connector_version, "0.8.7");
    assert.match(c.python_version, /^3\.12\.\d+$/);
    assert.equal(c.base_url, "https://notebooklm.google.com");
    assert.equal(c.transport, "stdio");
    assert.equal(c.instructions_policy, "prompt-user-only");
    // The five Gate-binding SHAs, plus the receipt's own SHA.
    assert.equal(c.install_receipt_sha256, meta.sha256);
    assert.equal(c.environment_sha256, facts.env_sha);
    assert.equal(c.public_schema_sha256, facts.public);
    assert.equal(c.upstream_schema_sha256, facts.upstream);
    assert.equal(c.auth_guard_sha256, facts.auth);
    for (const s of [c.install_receipt_sha256, c.environment_sha256, c.public_schema_sha256, c.upstream_schema_sha256, c.auth_guard_sha256]) {
      assert.match(s, /^[0-9a-f]{64}$/);
    }
    // Exactly the six narrowed tools, and no internal routing leaks out.
    assert.deepEqual(
      c.tools.map((t) => t.name).sort(),
      ["notebook_create", "notebook_get", "notebook_list", "source_add", "studio_create", "studio_status"],
    );
    for (const t of c.tools) {
      assert.ok(t.inputSchema, `${t.name} needs an inputSchema`);
      assert.ok(!("upstream" in t), `${t.name} must not leak its upstream routing`);
    }
  });
});

test("--contract-json fails closed when no receipt is installed", { skip }, () => {
  removeReceipt(facts); // ensure absent
  const r = contractJson();
  assert.equal(r.status, 1);
  assert.equal(r.stdout.trim(), "", "no payload may be printed on failure");
  assert.match(r.stderr, /no install receipt/);
});

test("every receipt tamper is rejected and prints no payload", { skip }, () => {
  // Mutation sweep in the repo's style: clone the valid receipt, break one binding, assert the
  // contract refuses it. The `notEqual(before)` guard rejects a mutation that silently no-ops.
  const mutations = {
    "environment SHA drift": (r) => (r.environment_sha256 = "0".repeat(64)),
    "public schema SHA drift": (r) => (r.public_schema_sha256 = "0".repeat(64)),
    "upstream schema SHA drift": (r) => (r.upstream_schema_sha256 = "0".repeat(64)),
    "auth guard SHA drift": (r) => (r.auth_guard_sha256 = "0".repeat(64)),
    "runtime lock SHA drift": (r) => (r.runtime_lock_sha256 = "0".repeat(64)),
    "build lock SHA drift": (r) => (r.build_lock_sha256 = "0".repeat(64)),
    "wrong Python patch": (r) => (r.python_version = "3.12.0"),
    "wrong bridge version": (r) => (r.bridge_version = "4.0.1"),
    "wrong connector version": (r) => (r.connector_version = "0.8.6"),
    "receipt describes a different venv": (r) => (r.private_env = `${r.private_env}-elsewhere`),
    "wrong format tag": (r) => (r.format = "something-else"),
    "wrong format version": (r) => (r.format_version = 2),
    "a shim is missing": (r) => delete r.shims.nlm,
    "an extra shim is smuggled in": (r) => (r.shims.evil = { path: "x", target: "y", sha256: "0".repeat(64) }),
  };
  for (const [label, mutate] of Object.entries(mutations)) {
    const receipt = validReceipt(facts);
    const before = JSON.stringify(receipt);
    mutate(receipt);
    assert.notEqual(JSON.stringify(receipt), before, `mutation "${label}" changed nothing`);
    withReceipt(receipt, () => {
      const r = contractJson();
      assert.equal(r.status, 1, `must reject: ${label} (stderr: ${r.stderr})`);
      assert.equal(r.stdout.trim(), "", `no payload for: ${label}`);
    });
  }
});

test("importing the contract module pulls in no upstream code", { skip }, () => {
  // --contract-json must stay stdlib-only (plan §2.3.1): it reads metadata, never imports the
  // connector. If contract.py grew an upstream import, this would light up.
  const r = runBridgeModule(PY, [
    "-c",
    "import sys; from learn_kit_nlm_bridge import contract; print('notebooklm_tools' in sys.modules or 'fastmcp' in sys.modules)",
  ]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), "False");
});

// ---------------------------------------------------------------- login --contract-json + gate

test("login --contract-json returns only the receipt/interpreter/shim subset", { skip }, () => {
  withReceipt(validReceipt(facts), (meta) => {
    const r = contractJson("learn_kit_nlm_bridge.login");
    assert.equal(r.status, 0, r.stderr);
    const c = JSON.parse(r.stdout);
    assert.equal(c.bridge_version, "4.0.0");
    assert.equal(c.install_receipt_sha256, meta.sha256);
    assert.equal(c.instructions_policy, "prompt-user-only");
    assert.deepEqual(Object.keys(c.shims).sort(), ["learn-kit-nlm-bridge", "nlm"]);
    // The subset must NOT leak the full tool surface or the upstream/public schema SHAs.
    assert.ok(!("tools" in c), "login contract must not advertise tools");
    assert.ok(!("public_schema_sha256" in c), "login contract must not carry schema SHAs");
    assert.ok(!("base_url" in c));
  });
});

test("the login module refuses everything except `login` and `--contract-json`", { skip }, () => {
  // `nlm login switch x` arrives here as ["login","switch","x"]; the exact-match gate blocks
  // profile switching before the connector is ever imported. --version and extras are refused too.
  for (const args of [["login", "switch", "default"], ["--version"], ["login", "--force"], ["whoami"], ["login", "extra"], []]) {
    const r = runBridgeModule(PY, ["-m", "learn_kit_nlm_bridge.login", ...args]);
    assert.equal(r.status, 2, `must refuse argv ${JSON.stringify(args)} (got ${r.status})`);
    assert.equal(r.stdout.trim(), "", `refusal must print no stdout for ${JSON.stringify(args)}`);
    assert.match(r.stderr, /refused|accepts exactly/);
  }
});

test("the login reject path imports no upstream connector", { skip }, () => {
  // A refusal must not have loaded notebooklm_tools — the reject branch returns before the import.
  const r = runBridgeModule(PY, [
    "-c",
    "import sys; from learn_kit_nlm_bridge import login; rc=login.main(['login','switch','x']); print(rc, 'notebooklm_tools' in sys.modules)",
  ]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), "2 False");
});

// ---------------------------------------------------------------- host MCP state machine

async function handshake(session) {
  const init = await session.request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "test", version: "1" },
  });
  session.notify("notifications/initialized");
  return init;
}

test("initialize answers locally with safe instructions and no upstream login advice", { skip }, async () => {
  // No receipt needed: initialize/tools/list are pure-local, so bootstrap works before any install
  // is fully verified and never contacts upstream.
  removeReceipt(facts);
  const b = openBridge(PY, { env: emptyHomeEnv() });
  try {
    const init = await handshake(b);
    assert.equal(init.result.protocolVersion, "2025-06-18");
    assert.equal(init.result.serverInfo.name, "learn-kit-nlm-bridge");
    // The bridge's own instructions, not upstream's "you should run nlm login" auto-advice.
    assert.match(init.result.instructions, /Authentication is managed entirely by the user/);
    assert.doesNotMatch(init.result.instructions, /Set NOTEBOOKLM_COOKIES/);
    const list = await b.request("tools/list");
    assert.deepEqual(
      list.result.tools.map((t) => t.name).sort(),
      ["notebook_create", "notebook_get", "notebook_list", "source_add", "studio_create", "studio_status"],
    );
    assert.equal(await b.request("ping").then((r) => JSON.stringify(r.result)), "{}");
  } finally {
    b.close();
  }
});

test("the state machine rejects a second initialize and a call before ready", { skip }, async () => {
  const b1 = openBridge(PY, { env: emptyHomeEnv() });
  try {
    await handshake(b1);
    const again = await b1.request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } });
    assert.ok(again.error, "a second initialize must be an error");
  } finally {
    b1.close();
  }
  const b2 = openBridge(PY, { env: emptyHomeEnv() });
  try {
    const call = await b2.request("tools/call", { name: "notebook_list", arguments: {} });
    assert.ok(call.error, "tools/call before initialize must be an error");
  } finally {
    b2.close();
  }
});

test("tools/list is single-page and refuses a cursor", { skip }, async () => {
  const b = openBridge(PY, { env: emptyHomeEnv() });
  try {
    await handshake(b);
    const withCursor = await b.request("tools/list", { cursor: "anything" });
    assert.ok(withCursor.error, "a cursor must be refused — the public list is single-page");
    assert.equal(withCursor.error.code, -32602);
  } finally {
    b.close();
  }
});

test("an unknown tool is a JSON-RPC error; a schema violation is an error result without a spawn", { skip }, async () => {
  const b = openBridge(PY, { env: emptyHomeEnv() });
  try {
    await handshake(b);
    // refresh_auth / server_info are deliberately not advertised -> method-not-found.
    const unknown = await b.request("tools/call", { name: "refresh_auth", arguments: {} });
    assert.equal(unknown.error?.code, -32601);

    // A schema violation on a known tool returns an error RESULT locally. If it had spawned the
    // guarded child and reached upstream it would come back AUTH_REQUIRED, not a schema message —
    // so the absence of AUTH_REQUIRED is the proof no child was spawned.
    const bad = await b.request("tools/call", {
      name: "studio_create",
      arguments: { notebook_id: "n", artifact_type: "mind_map", confirm: true }, // missing source_ids + title
    });
    assert.ok(bad.result?.isError, "schema violation must be an error result");
    assert.notEqual(bad.result?.structuredContent?.code, "AUTH_REQUIRED", "must not have spawned the child");
  } finally {
    b.close();
  }
});

test("with no credentials, a valid call normalizes to AUTH_REQUIRED and leaks no upstream text", { skip }, async () => {
  // The real guarded child starts, the real connector answers with no auth, and the bridge turns
  // that into a credential-free AUTH_REQUIRED before terminating the child.
  writeReceipt(facts, validReceipt(facts));
  const b = openBridge(PY, { env: emptyHomeEnv() });
  try {
    await handshake(b);
    for (const args of [
      { name: "notebook_list", arguments: {} },
      {
        name: "studio_create",
        arguments: { notebook_id: "n", artifact_type: "mind_map", source_ids: ["s1"], confirm: true, title: "t" },
      },
    ]) {
      const r = await b.request("tools/call", args, { timeoutMs: 120000 });
      assert.equal(r.result?.structuredContent?.code, "AUTH_REQUIRED", `${args.name}: ${JSON.stringify(r)}`);
      assert.ok(r.result?.isError);
      const blob = JSON.stringify(r);
      for (const leak of ["NOTEBOOKLM_COOKIES", "Set NOTEBOOKLM", "csrf", "Chrome"]) {
        assert.ok(!blob.includes(leak), `must not leak upstream text: ${leak}`);
      }
    }
  } finally {
    b.close();
    removeReceipt(facts);
  }
});

test("the Python white-box internals suite passes (auth guard, adapters, child protocol)", { skip }, () => {
  // Runs the bundled unittest suite with the private-venv interpreter. It covers what Node cannot
  // reach: the patched auth path, the six adapters' fixtures, ChildClient drift/loop handling.
  const r = runBridgeModule(PY, [path.join(BRIDGE_DIR, "tests", "test_internals.py")], { timeoutMs: 60000 });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
});
