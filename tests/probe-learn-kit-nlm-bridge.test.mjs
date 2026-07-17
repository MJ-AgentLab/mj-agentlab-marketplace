// Tests for the NLM bridge conformance probe (plan §2.4).
//
// Three layers:
//   1. Pure unit tests for the judgment/classification helpers — every conformance rule, so the
//      later mutation pass can prove none of them no-op.
//   2. Fake-bridge integration (tests/helpers/fake-nlm-bridge.mjs) driving the REAL spawn / MCP
//      client / process-tree path with injected drift, without the expensive venv.
//   3. Real-bridge conformance for the three modes, skipped when Python 3.12 / uv is unavailable
//      (REQUIRE_PYTHON=1 in CI forces them to run), matching the repo's REQUIRE_* convention.

import test from "node:test";
import assert from "node:assert/strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  probeLearnKitNlmBridge,
  judgeVerifyResult,
  classifyAudit,
  scanLeaks,
  isExternalEndpoint,
  isThreatChild,
  isLoginLauncherName,
  enumerateDescendants,
  readServerConfig,
  parseArgs,
  ProbeHarnessError,
  ProbeContractError,
  PUBLIC_TOOL_NAMES,
  NEGOTIATED_PROTOCOL,
} from "../scripts/probe-learn-kit-nlm-bridge.mjs";

import { bridgeVenv, skipUnlessBridge } from "./helpers/nlm-bridge-venv.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..");
const FAKE = path.join(HERE, "helpers", "fake-nlm-bridge.mjs");
const NODE = process.execPath;

const isHarness = (e) => e instanceof ProbeHarnessError && e.exitCode === 2;
const isContract = (e) => e instanceof ProbeContractError && e.exitCode === 1;

// A base env that runs the fake bridge with a given scenario.
function fakeEnv(scenario) {
  return { ...process.env, FAKE_SCENARIO: JSON.stringify(scenario ?? {}) };
}

// ---------------------------------------------------------------- classifyAudit

test("classifyAudit: loopback socket plumbing is benign, egress families are flagged", () => {
  // The asyncio self-pipe on Windows fires these against 127.0.0.1 — never egress.
  assert.deepEqual(classifyAudit({ "socket.__new__": 2, "socket.bind": 1, "socket.connect": 1 }), {
    network: [],
    process: [],
  });
  assert.deepEqual(classifyAudit({ "ssl.__init__": 1, "socket.getaddrinfo": 1 }).network, [
    "socket.getaddrinfo",
    "ssl.__init__",
  ]);
  assert.deepEqual(classifyAudit({ "http.client.connect": 1 }).network, ["http.client.connect"]);
  assert.deepEqual(classifyAudit({ "urllib.Request": 1 }).network, ["urllib.Request"]);
  assert.deepEqual(classifyAudit({ "subprocess.Popen": 1 }).process, ["subprocess.Popen"]);
  assert.deepEqual(classifyAudit({ "webbrowser.open": 1 }).process, ["webbrowser.open"]);
  assert.deepEqual(classifyAudit({ "os.exec": 1, "os.fork": 1 }).process, ["os.exec", "os.fork"]);
  assert.deepEqual(classifyAudit({}), { network: [], process: [] });
  assert.deepEqual(classifyAudit(undefined), { network: [], process: [] });
});

// ---------------------------------------------------------------- scanLeaks

test("scanLeaks: catches credential markers and the synthetic sentinel", () => {
  assert.deepEqual(scanLeaks(""), []);
  assert.deepEqual(scanLeaks("just plain text"), []);
  assert.ok(scanLeaks("Set NOTEBOOKLM_COOKIES to ...").length > 0);
  assert.ok(scanLeaks("csrf token here").length > 0);
  assert.ok(scanLeaks("contact me at user@example.com").includes("@[\\w.-]+\\.\\w{2,}"));
  assert.deepEqual(scanLeaks("nothing here", "SENT-123"), []);
  assert.deepEqual(scanLeaks("leaked SENT-123 value", "SENT-123"), ["synthetic-credential-sentinel"]);
});

// ---------------------------------------------------------------- isExternalEndpoint

test("isExternalEndpoint: loopback / wildcard are not external, a real host is", () => {
  for (const local of ["127.0.0.1:5000", "[::1]:443", "0.0.0.0:0", "*:*", "localhost:1", ""]) {
    assert.equal(isExternalEndpoint(local), false, local);
  }
  for (const ext of ["142.250.72.14:443", "[2607:f8b0::1]:443", "example.com:443"]) {
    assert.equal(isExternalEndpoint(ext), true, ext);
  }
});

test("isThreatChild flags browsers and login launchers but never the sanctioned python runner", () => {
  // A browser, by image name or anywhere on the command line.
  assert.ok(isThreatChild({ name: "chrome.exe" }));
  assert.ok(isThreatChild({ name: "msedge.exe" }));
  assert.ok(isThreatChild({ name: "node.exe", cmdline: "node -e x chrome-renderer" }));
  // A raw login launcher, by image name.
  assert.ok(isThreatChild({ name: "nlm.exe" }));
  assert.ok(isThreatChild({ name: "notebooklm" }));
  assert.ok(isLoginLauncherName("nlm.cmd"));
  // The critical false-positive guard: the guarded runner's command line CONTAINS "nlm" inside
  // learn_kit_nlm_bridge, but it is python.exe and must never be treated as a threat.
  assert.ok(
    !isThreatChild({ name: "python.exe", cmdline: "python.exe -I -X utf8 -m learn_kit_nlm_bridge.upstream_runner" }),
  );
  for (const benign of [{ name: "python.exe" }, { name: "node.exe" }, { name: "conhost.exe" }]) {
    assert.ok(!isThreatChild(benign), benign.name);
  }
});

// ---------------------------------------------------------------- judgeVerifyResult

const goodUpstreamReport = () =>
  JSON.stringify({ mode: "upstream-contract", tools_verified: true, audit: { events: { "socket.connect": 1 } } });
const goodAuthReport = () =>
  JSON.stringify({
    mode: "auth-required",
    tools_verified: true,
    notebook_list_auth_required: true,
    studio_create_auth_required: true,
    audit: { events: {} },
  });

function mkRaw(over = {}) {
  return { status: 0, stdout: goodUpstreamReport(), stderr: "", children: [], external: [], ...over };
}

test("judgeVerifyResult: a clean upstream-contract run passes", () => {
  const r = judgeVerifyResult("upstream-contract", mkRaw(), 1000);
  assert.equal(r.mode, "upstream-contract");
  assert.equal(r.protocolVersion, NEGOTIATED_PROTOCOL);
  assert.equal(r.tools.length, 6);
  assert.deepEqual(r.children, []);
  assert.deepEqual(r.networkAttempts, []);
  assert.deepEqual(r.callResults, []);
});

test("judgeVerifyResult: auth-required requires both calls to normalize", () => {
  const ok = judgeVerifyResult("auth-required", mkRaw({ stdout: goodAuthReport() }), 1000);
  assert.equal(ok.callResults.length, 2);
  assert.ok(ok.callResults.every((c) => c.code === "AUTH_REQUIRED"));

  const half = JSON.stringify({
    mode: "auth-required",
    tools_verified: true,
    notebook_list_auth_required: true,
    studio_create_auth_required: false,
    audit: { events: {} },
  });
  assert.throws(() => judgeVerifyResult("auth-required", mkRaw({ stdout: half }), 1000), isContract);
});

test("judgeVerifyResult: exit-code and harness faults map to the right class", () => {
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ status: 1, stderr: "boom" }), 1000), isContract);
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ status: 2, stderr: "bad arg" }), 1000), isHarness);
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ status: 0, stdout: "not json" }), 1000), isHarness);
  assert.throws(
    () => judgeVerifyResult("upstream-contract", mkRaw({ status: null, error: new Error("ENOENT") }), 1000),
    isHarness,
  );
  assert.throws(
    () => judgeVerifyResult("upstream-contract", mkRaw({ status: null, timedOut: true }), 1000),
    isContract,
  );
});

test("judgeVerifyResult: report drift is a contract failure", () => {
  // wrong mode
  assert.throws(
    () => judgeVerifyResult("upstream-contract", mkRaw({ stdout: JSON.stringify({ mode: "auth-required", tools_verified: true }) }), 1000),
    isContract,
  );
  // tools not verified
  assert.throws(
    () => judgeVerifyResult("upstream-contract", mkRaw({ stdout: JSON.stringify({ mode: "upstream-contract", tools_verified: false }) }), 1000),
    isContract,
  );
});

test("judgeVerifyResult: any egress or spawn audit family fails closed", () => {
  const withAudit = (events) =>
    JSON.stringify({ mode: "upstream-contract", tools_verified: true, audit: { events } });
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ stdout: withAudit({ "ssl.__init__": 1 }) }), 1000), (e) =>
    isContract(e) && /network/.test(e.message),
  );
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ stdout: withAudit({ "socket.getaddrinfo": 1 }) }), 1000), isContract);
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ stdout: withAudit({ "subprocess.Popen": 1 }) }), 1000), (e) =>
    isContract(e) && /subprocess|browser/.test(e.message),
  );
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ stdout: withAudit({ "webbrowser.open": 1 }) }), 1000), isContract);
});

test("judgeVerifyResult: a forbidden child or external connection or leak fails closed", () => {
  // `children` reaches the judge already filtered to threat descendants — any entry is a failure.
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ children: ["chrome.exe"] }), 1000), (e) =>
    isContract(e) && /forbidden/.test(e.message),
  );
  // No threats observed -> passes (the sanctioned python runner never reaches this list).
  assert.doesNotThrow(() => judgeVerifyResult("upstream-contract", mkRaw({ children: [] }), 1000));
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ external: ["142.250.72.14:443"] }), 1000), (e) =>
    isContract(e) && /external/.test(e.message),
  );
  assert.throws(() => judgeVerifyResult("upstream-contract", mkRaw({ stderr: "leaked cookie: abc" }), 1000), (e) =>
    isContract(e) && /leak/.test(e.message),
  );
});

// ---------------------------------------------------------------- readServerConfig

test("readServerConfig: reads the real .mcp.json and rejects every malformation", () => {
  const cfg = readServerConfig(path.join(REPO_ROOT, "plugins/learn-kit/.mcp.json"), "notebooklm-mcp");
  assert.equal(cfg.command, "learn-kit-nlm-bridge");
  assert.deepEqual(cfg.args, []);

  assert.throws(() => readServerConfig(path.join(REPO_ROOT, "does-not-exist.json"), "x"), isHarness);

  const tmp = fs.mkdtempSync(path.join(REPO_ROOT, ".probe-cfg-"));
  try {
    const write = (name, body) => {
      const p = path.join(tmp, name);
      fs.writeFileSync(p, body);
      return p;
    };
    assert.throws(() => readServerConfig(write("bad.json", "{not json"), "s"), isHarness);
    assert.throws(() => readServerConfig(write("noservers.json", "{}"), "s"), isHarness);
    assert.throws(() => readServerConfig(write("missing.json", '{"mcpServers":{}}'), "s"), isHarness);
    assert.throws(() => readServerConfig(write("nocmd.json", '{"mcpServers":{"s":{}}}'), "s"), isHarness);
    assert.throws(
      () => readServerConfig(write("badargs.json", '{"mcpServers":{"s":{"command":"c","args":"x"}}}'), "s"),
      isHarness,
    );
    const okp = write("ok.json", '{"mcpServers":{"s":{"command":"c","args":["a"]}}}');
    assert.deepEqual(readServerConfig(okp, "s"), { command: "c", args: ["a"] });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- parseArgs

test("parseArgs: defaults, requireds, and rejections", () => {
  const ok = parseArgs(["--config", "c.json", "--server", "notebooklm-mcp"]);
  assert.equal(ok.config, "c.json");
  assert.equal(ok.server, "notebooklm-mcp");
  assert.equal(ok.mode, "all");

  assert.equal(parseArgs(["--config", "c", "--server", "s", "--mode", "bootstrap"]).mode, "bootstrap");
  assert.throws(() => parseArgs(["--server", "s"]), isHarness); // missing --config
  assert.throws(() => parseArgs(["--config", "c"]), isHarness); // missing --server
  assert.throws(() => parseArgs(["--config", "c", "--server", "s", "--mode", "nope"]), isHarness);
  assert.throws(() => parseArgs(["--config", "c", "--server", "s", "--frob"]), isHarness);
  assert.throws(() => parseArgs(["--config"]), isHarness); // missing value
});

// ---------------------------------------------------------------- input validation

test("probeLearnKitNlmBridge rejects bad inputs as harness errors before spawning", async () => {
  await assert.rejects(() => probeLearnKitNlmBridge({ command: "", mode: "bootstrap" }), isHarness);
  await assert.rejects(() => probeLearnKitNlmBridge({ command: NODE, args: [1], mode: "bootstrap" }), isHarness);
  await assert.rejects(() => probeLearnKitNlmBridge({ command: NODE, args: [FAKE], mode: "all" }), isHarness);
  await assert.rejects(() => probeLearnKitNlmBridge({ command: NODE, args: [FAKE], mode: "nope" }), isHarness);
  await assert.rejects(
    () => probeLearnKitNlmBridge({ command: NODE, args: [FAKE], mode: "bootstrap", timeoutMs: 0 }),
    isHarness,
  );
});

test("a bridge command that cannot be spawned is a clean harness error, not a crash", async () => {
  // Regression: a spawn ENOENT surfaces as an async 'error' event; without a handler it crashed the
  // process instead of exiting 2. Both the MCP (bootstrap) and one-shot (verify) paths must map it.
  const bogus = "learn-kit-nlm-bridge-does-not-exist-xyz";
  await assert.rejects(() => probeLearnKitNlmBridge({ command: bogus, args: [], mode: "bootstrap" }), isHarness);
  await assert.rejects(
    () => probeLearnKitNlmBridge({ command: bogus, args: [], mode: "upstream-contract", timeoutMs: 15000 }),
    isHarness,
  );
});

// ---------------------------------------------------------------- fake-bridge: bootstrap

test("fake bootstrap: a well-behaved bridge passes and reports the six tools", async () => {
  const r = await probeLearnKitNlmBridge({ command: NODE, args: [FAKE], mode: "bootstrap", env: fakeEnv({}) });
  assert.equal(r.mode, "bootstrap");
  assert.equal(r.protocolVersion, "2025-06-18");
  assert.deepEqual(r.tools.map((t) => t.name).sort(), PUBLIC_TOOL_NAMES);
  assert.deepEqual(r.children, []);
  assert.deepEqual(r.networkAttempts, []);
});

test("fake bootstrap: every handshake drift is a contract failure", async () => {
  const cases = {
    "wrong protocol": { protocolVersion: "1999-01-01" },
    "wrong serverInfo": { serverInfoName: "evil-server" },
    "no safe instructions": { instructions: "hello there" },
    "leaks upstream login advice": {
      instructions: "Authentication is managed entirely by the user. Set NOTEBOOKLM_COOKIES to log in.",
    },
    "too few tools": { tools: [{ name: "notebook_list", inputSchema: { type: "object" } }] },
    "a tool without inputSchema": {
      tools: PUBLIC_TOOL_NAMES.map((name) => (name === "source_add" ? { name } : { name, inputSchema: { type: "object" } })),
    },
  };
  for (const [label, scn] of Object.entries(cases)) {
    await assert.rejects(
      () => probeLearnKitNlmBridge({ command: NODE, args: [FAKE], mode: "bootstrap", env: fakeEnv(scn) }),
      isContract,
      label,
    );
  }
});

test("fake bootstrap: a bridge that spawns a child is caught by the process-tree scan", async (t) => {
  const supported = (await enumerateDescendants(process.pid)).supported;
  if (!supported) {
    t.skip("process enumeration unavailable on this platform");
    return;
  }
  await assert.rejects(
    () => probeLearnKitNlmBridge({ command: NODE, args: [FAKE], mode: "bootstrap", env: fakeEnv({ spawnChild: true }) }),
    (e) => isContract(e) && /forbidden child/.test(e.message),
  );
});

// ---------------------------------------------------------------- fake-bridge: verify

test("fake verify: a clean report passes, a failing exit code is a contract failure", async () => {
  const okScn = { report: { mode: "upstream-contract", tools_verified: true, audit: { events: {} } } };
  const r = await probeLearnKitNlmBridge({
    command: NODE,
    args: [FAKE],
    mode: "upstream-contract",
    env: fakeEnv(okScn),
    timeoutMs: 30000,
  });
  assert.equal(r.mode, "upstream-contract");

  await assert.rejects(
    () =>
      probeLearnKitNlmBridge({
        command: NODE,
        args: [FAKE],
        mode: "upstream-contract",
        env: fakeEnv({ ...okScn, exitCode: 1 }),
        timeoutMs: 30000,
      }),
    isContract,
  );
});

// ---------------------------------------------------------------- real bridge

const skip = skipUnlessBridge();
const venv = skip ? null : bridgeVenv();
const bridgeArgs = ["-I", "-X", "utf8", "-m", "learn_kit_nlm_bridge"];

test("real bridge: bootstrap answers locally with no child and no network", { skip }, async () => {
  const r = await probeLearnKitNlmBridge({
    command: venv.python,
    args: bridgeArgs,
    mode: "bootstrap",
    timeoutMs: 120000,
  });
  assert.equal(r.protocolVersion, "2025-06-18");
  assert.match(r.instructions, /Authentication is managed entirely by the user/);
  assert.deepEqual(r.tools.map((t) => t.name).sort(), PUBLIC_TOOL_NAMES);
  assert.deepEqual(r.children, []);
  assert.deepEqual(r.networkAttempts, []);
});

test("real bridge: upstream-contract verifies the pinned tools/list with no egress", { skip }, async () => {
  const r = await probeLearnKitNlmBridge({
    command: venv.python,
    args: bridgeArgs,
    mode: "upstream-contract",
    timeoutMs: 180000,
  });
  assert.equal(r.mode, "upstream-contract");
  assert.deepEqual(r.networkAttempts, []);
  assert.deepEqual(classifyAudit(r.audit?.events), { network: [], process: [] });
});

test("real bridge: auth-required normalizes both calls to AUTH_REQUIRED with no browser", { skip }, async () => {
  const r = await probeLearnKitNlmBridge({
    command: venv.python,
    args: bridgeArgs,
    mode: "auth-required",
    timeoutMs: 180000,
  });
  assert.equal(r.callResults.length, 2);
  assert.ok(r.callResults.every((c) => c.code === "AUTH_REQUIRED"));
  assert.deepEqual(classifyAudit(r.audit?.events), { network: [], process: [] });
  assert.deepEqual(r.networkAttempts, []);
});
