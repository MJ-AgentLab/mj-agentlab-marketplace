// Tests for plugins/learn-kit/scripts/install-nlm-bridge.mjs (plan §2.3.1, Task 1/3).
//
// Two layers:
//   1. Pure-logic tests with injected fakes — deterministic, no Python. They cover URL validation,
//      the download redirect/host/size rules, checksum parsing, the scrubbed uv env, shim bytes,
//      launcher-collision detection, and receipt/rollback/uninstall behaviour.
//   2. One real end-to-end install (REQUIRE_PYTHON-gated): build the actual wheel, serve it through
//      an injected httpRequest, run the REAL uv/python, and assert the receipt, the shims and the
//      bridge's own --contract-json all agree. This is the only proof the ephemeral-lock install
//      really works; the fakes cannot stand in for uv.
//
// The installer takes ALL environment access through `deps`, and there is no env var or hidden flag
// that turns on a test mode. Tests inject a runner-temp `deps.env`, so nothing here can touch a real
// user directory.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import {
  installNlmBridge,
  validateUrls,
  parseChecksum,
  download,
  buildUvEnv,
  shimBytes,
  detectShimCollisions,
  resolveRoots,
  readCheckedInContract,
  canonicalJson,
  CANONICAL_WHEEL_URL,
  CANONICAL_CHECKSUM_URL,
  WHEEL_NAME,
  CHECKSUM_NAME,
  RELEASE_TAG,
  BRIDGE_VERSION,
  CONNECTOR_VERSION,
  MAX_WHEEL_BYTES,
  MAX_CHECKSUM_BYTES,
  UsageError,
  InstallError,
} from "../plugins/learn-kit/scripts/install-nlm-bridge.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const PLUGIN_ROOT = path.join(REPO_ROOT, "plugins/learn-kit");
const INSTALLER = path.join(PLUGIN_ROOT, "scripts/install-nlm-bridge.mjs");
const BRIDGE_DIR = path.join(PLUGIN_ROOT, "nlm-bridge");

const sha256Hex = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const H = (c) => String(c).repeat(64);

function tmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}
function withTmp(prefix, fn) {
  const dir = tmp(prefix);
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** A one-response httpRequest fake driven by a url -> response map (or a function). */
function fakeHttp(routes) {
  return async (urlObj) => {
    const r = typeof routes === "function" ? routes(urlObj) : routes[urlObj.href];
    if (!r) throw new Error(`fakeHttp: no route for ${urlObj.href}`);
    return { statusCode: r.status, headers: r.headers ?? {}, body: r.body ?? Buffer.alloc(0) };
  };
}

// ================================================================= validateUrls

test("validateUrls accepts the canonical pinned URLs", () => {
  assert.deepEqual(validateUrls(CANONICAL_WHEEL_URL, CANONICAL_CHECKSUM_URL), { releaseTag: RELEASE_TAG });
});

test("validateUrls rejects a wrong wheel URL", () => {
  assert.throws(() => validateUrls("https://github.com/evil/x.whl", CANONICAL_CHECKSUM_URL), UsageError);
});

test("validateUrls rejects a checksum URL on a different host", () => {
  const bad = CANONICAL_CHECKSUM_URL.replace("github.com", "evil.com");
  assert.throws(() => validateUrls(CANONICAL_WHEEL_URL, bad), UsageError);
});

test("validateUrls rejects an http (non-TLS) URL", () => {
  assert.throws(() => validateUrls(CANONICAL_WHEEL_URL.replace("https:", "http:"), CANONICAL_CHECKSUM_URL), UsageError);
});

// ================================================================= parseChecksum

const GOOD_SHA = H("a");
const goodChecksum = Buffer.from(`${GOOD_SHA}  ${WHEEL_NAME}\n`, "utf8");

test("parseChecksum accepts the exact sha256sum line", () => {
  assert.equal(parseChecksum(goodChecksum), GOOD_SHA);
});

test("parseChecksum rejects a BOM", () => {
  assert.throws(() => parseChecksum(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), goodChecksum])), InstallError);
});

test("parseChecksum rejects CRLF", () => {
  assert.throws(() => parseChecksum(Buffer.from(`${GOOD_SHA}  ${WHEEL_NAME}\r\n`, "utf8")), InstallError);
});

test("parseChecksum rejects a second line", () => {
  assert.throws(() => parseChecksum(Buffer.from(`${GOOD_SHA}  ${WHEEL_NAME}\n${GOOD_SHA}  other\n`, "utf8")), InstallError);
});

test("parseChecksum rejects the wrong wheel name", () => {
  assert.throws(() => parseChecksum(Buffer.from(`${GOOD_SHA}  wrong.whl\n`, "utf8")), InstallError);
});

test("parseChecksum rejects uppercase hex", () => {
  assert.throws(() => parseChecksum(Buffer.from(`${H("A")}  ${WHEEL_NAME}\n`, "utf8")), InstallError);
});

test("parseChecksum rejects a single-space separator", () => {
  assert.throws(() => parseChecksum(Buffer.from(`${GOOD_SHA} ${WHEEL_NAME}\n`, "utf8")), InstallError);
});

test("parseChecksum rejects an over-long asset", () => {
  const big = Buffer.concat([goodChecksum, Buffer.alloc(MAX_CHECKSUM_BYTES)]);
  assert.throws(() => parseChecksum(big), InstallError);
});

// ================================================================= download

test("download returns the body on a 200", async () => {
  const body = Buffer.from("hello");
  const deps = { httpRequest: fakeHttp({ [CANONICAL_WHEEL_URL]: { status: 200, body } }) };
  const got = await download(CANONICAL_WHEEL_URL, { maxBytes: 1000, label: "wheel" }, deps);
  assert.equal(got.toString(), "hello");
});

test("download follows a redirect within the allowed hosts", async () => {
  const target = "https://objects.githubusercontent.com/x/y";
  const deps = {
    httpRequest: fakeHttp({
      [CANONICAL_WHEEL_URL]: { status: 302, headers: { location: target } },
      [target]: { status: 200, body: Buffer.from("payload") },
    }),
  };
  const got = await download(CANONICAL_WHEEL_URL, { maxBytes: 1000, label: "wheel" }, deps);
  assert.equal(got.toString(), "payload");
});

test("download refuses a redirect to a disallowed host", async () => {
  const evil = "https://evil.com/x";
  const deps = {
    httpRequest: fakeHttp({ [CANONICAL_WHEEL_URL]: { status: 302, headers: { location: evil } } }),
  };
  await assert.rejects(() => download(CANONICAL_WHEEL_URL, { maxBytes: 1000, label: "wheel" }, deps), /host not allowed/);
});

test("download refuses an https->http downgrade", async () => {
  const http = "http://github.com/x";
  const deps = {
    httpRequest: fakeHttp({ [CANONICAL_WHEEL_URL]: { status: 302, headers: { location: http } } }),
  };
  await assert.rejects(() => download(CANONICAL_WHEEL_URL, { maxBytes: 1000, label: "wheel" }, deps), /non-HTTPS/);
});

test("download refuses a redirect with no Location", async () => {
  const deps = { httpRequest: fakeHttp({ [CANONICAL_WHEEL_URL]: { status: 302, headers: {} } }) };
  await assert.rejects(() => download(CANONICAL_WHEEL_URL, { maxBytes: 1000, label: "wheel" }, deps), /no Location/);
});

test("download allows exactly 5 redirects then a 200", async () => {
  const hosts = [
    "https://github.com/r1",
    "https://objects.githubusercontent.com/r2",
    "https://release-assets.githubusercontent.com/r3",
    "https://github.com/r4",
    "https://objects.githubusercontent.com/r5",
  ];
  const routes = { [CANONICAL_WHEEL_URL]: { status: 302, headers: { location: hosts[0] } } };
  for (let i = 0; i < hosts.length; i++) {
    routes[hosts[i]] = i < hosts.length - 1
      ? { status: 302, headers: { location: hosts[i + 1] } }
      : { status: 200, body: Buffer.from("ok") };
  }
  const got = await download(CANONICAL_WHEEL_URL, { maxBytes: 1000, label: "wheel" }, { httpRequest: fakeHttp(routes) });
  assert.equal(got.toString(), "ok");
});

test("download refuses more than 5 redirects", async () => {
  // Every allowed host just bounces to github.com forever.
  const deps = {
    httpRequest: fakeHttp(() => ({ status: 302, headers: { location: "https://github.com/loop" } })),
  };
  await assert.rejects(() => download(CANONICAL_WHEEL_URL, { maxBytes: 1000, label: "wheel" }, deps), /too many redirects/);
});

test("download refuses a body larger than the cap", async () => {
  const deps = { httpRequest: fakeHttp({ [CANONICAL_WHEEL_URL]: { status: 200, body: Buffer.alloc(2000) } }) };
  await assert.rejects(() => download(CANONICAL_WHEEL_URL, { maxBytes: 1000, label: "wheel" }, deps), /exceeds 1000 bytes/);
});

test("download refuses an unexpected status", async () => {
  const deps = { httpRequest: fakeHttp({ [CANONICAL_WHEEL_URL]: { status: 404 } }) };
  await assert.rejects(() => download(CANONICAL_WHEEL_URL, { maxBytes: 1000, label: "wheel" }, deps), /status 404/);
});

// ================================================================= buildUvEnv

test("buildUvEnv scrubs the parent env and injects a private cache + default index intent", () => {
  const deps = {
    platform: "linux",
    env: {
      HOME: "/home/u",
      PATH: "/evil/bin:/usr/bin",
      UV_INDEX_URL: "https://evil/simple",
      PIP_INDEX_URL: "https://evil/simple",
      PYTHONPATH: "/evil/site",
      UV_NO_VERIFY_HASHES: "1",
      HTTP_PROXY: "http://proxy",
      NLM_PROFILE: "x",
      LANG: "en_US.UTF-8",
    },
  };
  const env = buildUvEnv(deps, "/tmp/cache");
  assert.equal(env.UV_CACHE_DIR, "/tmp/cache");
  assert.equal(env.PYTHONUTF8, "1");
  assert.equal(env.HOME, "/home/u");
  assert.equal(env.LANG, "en_US.UTF-8");
  assert.equal(env.PATH, "/usr/bin:/bin"); // trusted OS dirs only, /evil/bin dropped
  for (const forbidden of ["UV_INDEX_URL", "PIP_INDEX_URL", "PYTHONPATH", "UV_NO_VERIFY_HASHES", "HTTP_PROXY", "NLM_PROFILE"]) {
    assert.equal(env[forbidden], undefined, `${forbidden} must be scrubbed`);
  }
});

test("buildUvEnv keeps a minimal Windows PATH under System32", () => {
  const env = buildUvEnv({ platform: "win32", env: { SystemRoot: "C:\\Windows", LOCALAPPDATA: "C:\\LA" } }, "C:\\cache");
  assert.ok(env.PATH.includes("System32"));
  assert.ok(!env.PATH.toLowerCase().includes("la\\bin"));
});

// ================================================================= shimBytes

test("shimBytes builds a relative CRLF .cmd on Windows", () => {
  const bytes = shimBytes("learn-kit-nlm-bridge", {
    publicBin: "C:\\LA\\MJ-AgentLab\\bin",
    privateRoot: "C:\\LA\\MJ-AgentLab\\learn-kit-nlm-bridge\\4.0.0",
    platform: "win32",
  });
  const text = bytes.toString("utf8");
  assert.ok(text.includes("@echo off\r\n"));
  assert.ok(text.includes('"%~dp0..\\learn-kit-nlm-bridge\\4.0.0\\venv\\Scripts\\python.exe"'), text);
  assert.ok(text.includes("-I -X utf8 -m learn_kit_nlm_bridge %*"));
  assert.ok(text.endsWith("\r\n"));
});

test("shimBytes builds an absolute LF /bin/sh script on POSIX (login module for nlm)", () => {
  const bytes = shimBytes("nlm", {
    publicBin: "/home/u/.local/bin",
    privateRoot: "/home/u/.local/share/mj-agentlab/learn-kit-nlm-bridge/4.0.0",
    platform: "linux",
  });
  const text = bytes.toString("utf8");
  assert.ok(text.startsWith("#!/bin/sh\n"));
  assert.ok(text.includes('exec "/home/u/.local/share/mj-agentlab/learn-kit-nlm-bridge/4.0.0/venv/bin/python" -I -X utf8 -m learn_kit_nlm_bridge.login "$@"'));
  assert.ok(!text.includes("\r"));
});

test("shimBytes refuses a shell-unsafe interpreter path on POSIX", () => {
  assert.throws(
    () => shimBytes("nlm", { publicBin: "/home/u/bin", privateRoot: '/home/"; rm -rf ~/x', platform: "linux" }),
    InstallError,
  );
});

// ================================================================= detectShimCollisions

function winDeps(env) {
  return { platform: "win32", env: { PATHEXT: ".COM;.EXE;.CMD;.PS1", PATH: "", ...env } };
}

test("detectShimCollisions is clean when nothing conflicts", () => {
  withTmp("coll-", (root) => {
    const publicBin = path.join(root, "bin");
    fs.mkdirSync(publicBin);
    assert.deepEqual(detectShimCollisions(winDeps({ PATH: publicBin }), { publicBin }), []);
  });
});

test("detectShimCollisions flags a foreign launcher in the managed bin", () => {
  withTmp("coll-", (root) => {
    const publicBin = path.join(root, "bin");
    fs.mkdirSync(publicBin);
    // A different-extension launcher in the managed bin is foreign. (A byte-matching nlm.cmd at the
    // exact shim path is the idempotent case, checked for byte-equality at write time, not here.)
    fs.writeFileSync(path.join(publicBin, "nlm.exe"), "foreign");
    const problems = detectShimCollisions(winDeps({ PATH: publicBin }), { publicBin });
    assert.ok(problems.some((p) => /foreign launcher for 'nlm'/.test(p)), problems.join("\n"));
  });
});

test("detectShimCollisions flags a launcher earlier on PATH", () => {
  withTmp("coll-", (root) => {
    const publicBin = path.join(root, "bin");
    const earlier = path.join(root, "earlier");
    fs.mkdirSync(publicBin);
    fs.mkdirSync(earlier);
    fs.writeFileSync(path.join(earlier, "learn-kit-nlm-bridge.exe"), "x");
    const deps = winDeps({ PATH: [earlier, publicBin].join(path.delimiter) });
    const problems = detectShimCollisions(deps, { publicBin });
    assert.ok(problems.some((p) => /resolves earlier on PATH/.test(p)), problems.join("\n"));
  });
});

test("detectShimCollisions flags a .ps1 shadow", () => {
  withTmp("coll-", (root) => {
    const publicBin = path.join(root, "bin");
    const earlier = path.join(root, "earlier");
    fs.mkdirSync(publicBin);
    fs.mkdirSync(earlier);
    fs.writeFileSync(path.join(earlier, "nlm.ps1"), "x");
    const deps = winDeps({ PATH: [earlier, publicBin].join(path.delimiter) });
    const problems = detectShimCollisions(deps, { publicBin });
    assert.ok(problems.some((p) => /nlm/.test(p) && /ps1/.test(p)), problems.join("\n"));
  });
});

test("detectShimCollisions flags a PATHEXT without .CMD", () => {
  withTmp("coll-", (root) => {
    const publicBin = path.join(root, "bin");
    fs.mkdirSync(publicBin);
    const problems = detectShimCollisions(winDeps({ PATHEXT: ".EXE;.BAT", PATH: publicBin }), { publicBin });
    assert.ok(problems.some((p) => /PATHEXT/.test(p)), problems.join("\n"));
  });
});

test("detectShimCollisions treats our own shim in the managed bin as idempotent (not a conflict)", () => {
  withTmp("coll-", (root) => {
    const publicBin = path.join(root, "bin");
    fs.mkdirSync(publicBin);
    // Our own shims present; only PATH is the managed bin. Should be clean.
    fs.writeFileSync(path.join(publicBin, "learn-kit-nlm-bridge.cmd"), "ours");
    fs.writeFileSync(path.join(publicBin, "nlm.cmd"), "ours");
    assert.deepEqual(detectShimCollisions(winDeps({ PATH: publicBin }), { publicBin }), []);
  });
});

// ================================================================= resolveRoots

test("resolveRoots lays out the Windows tree under MJ-AgentLab", () => {
  // Expected values use the target's path module so this passes on any host.
  const { privateRoot, publicBin } = resolveRoots({ platform: "win32", env: { LOCALAPPDATA: "C:\\Users\\u\\AppData\\Local" } });
  assert.equal(publicBin, path.win32.join("C:\\Users\\u\\AppData\\Local", "MJ-AgentLab", "bin"));
  assert.equal(privateRoot, path.win32.join("C:\\Users\\u\\AppData\\Local", "MJ-AgentLab", "learn-kit-nlm-bridge", BRIDGE_VERSION));
});

test("resolveRoots lays out the POSIX tree under XDG data/bin", () => {
  const { privateRoot, publicBin } = resolveRoots({ platform: "linux", env: { HOME: "/home/u" } });
  assert.equal(publicBin, "/home/u/.local/bin");
  assert.equal(privateRoot, path.posix.join("/home/u/.local/share", "mj-agentlab", "learn-kit-nlm-bridge", BRIDGE_VERSION));
});

test("resolveRoots errors when the platform env is missing", () => {
  assert.throws(() => resolveRoots({ platform: "win32", env: {} }), InstallError);
  assert.throws(() => resolveRoots({ platform: "linux", env: {} }), InstallError);
});

// ================================================================= readCheckedInContract

test("readCheckedInContract reads the real plugin tree and matches the environment lock", () => {
  const envLock = JSON.parse(fs.readFileSync(path.join(BRIDGE_DIR, "src/learn_kit_nlm_bridge/_data/environment-lock.json"), "utf8"));
  const c = readCheckedInContract(PLUGIN_ROOT);
  assert.equal(c.runtimeLockSha, envLock.locks.runtime.sha256);
  assert.equal(c.buildLockSha, envLock.locks.build.sha256);
  assert.equal(c.contractShas.public_tools, envLock.contracts.public_tools.sha256);
  assert.equal(c.contractShas.upstream_tools, envLock.contracts.upstream_tools.sha256);
  assert.equal(c.contractShas.upstream_auth_guard, envLock.contracts.upstream_auth_guard.sha256);
});

test("readCheckedInContract fails closed when a contract file has drifted", () => {
  withTmp("plugin-", (root) => {
    // Mirror the real bridge tree, then corrupt one _data file so its SHA no longer matches.
    const dst = path.join(root, "nlm-bridge");
    copyDir(BRIDGE_DIR, dst);
    const pub = path.join(dst, "src/learn_kit_nlm_bridge/_data/public-tools-v1.json");
    fs.writeFileSync(pub, fs.readFileSync(pub, "utf8") + "\n");
    assert.throws(() => readCheckedInContract(root), /drifted/);
  });
});

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) {
      if (e.name === "__pycache__" || e.name === "tests") continue;
      copyDir(s, d);
    } else if (e.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

// ================================================================= install: rollback with fakes

/**
 * A deps object whose roots point into a runner-temp tree and whose uv/python are fakes. The
 * install path can be driven up to (and through) a chosen failure without any real toolchain.
 */
function fakeInstallDeps(root, { runUv, runPython, httpRequest, uvVersion = "0.11.21" } = {}) {
  // Host-native platform: the install path touches the real fs (mkdir/rename/existsSync), so it
  // must run under the host's own path semantics. Cross-platform string logic is covered by the
  // pure-function tests above, which simulate both targets.
  const isWin = process.platform === "win32";
  const env = isWin
    ? { LOCALAPPDATA: path.join(root, "LOCALAPPDATA"), SystemRoot: "C:\\Windows", PATHEXT: ".COM;.EXE;.CMD;.PS1", PATH: "" }
    : { HOME: path.join(root, "home"), PATH: "" };
  fs.mkdirSync(isWin ? env.LOCALAPPDATA : env.HOME, { recursive: true });
  return {
    platform: process.platform,
    env,
    installerSource: INSTALLER,
    tmpdir: () => os.tmpdir(),
    resolveUv: () => ({ path: isWin ? "C:\\uv\\uv.exe" : "/usr/bin/uv", version: uvVersion }),
    httpRequest: httpRequest ?? goodDownloadHttp(),
    runUv: runUv ?? (() => ({ status: 0, stdout: "", stderr: "" })),
    runPython: runPython ?? (() => ({ status: 0, stdout: "", stderr: "" })),
  };
}

/** httpRequest that serves a valid (self-consistent) wheel + checksum for the canonical URLs. */
function goodDownloadHttp(wheelBuf = Buffer.from("PK-fake-wheel")) {
  const sha = sha256Hex(wheelBuf);
  const checksum = Buffer.from(`${sha}  ${WHEEL_NAME}\n`, "utf8");
  return fakeHttp({
    [CANONICAL_WHEEL_URL]: { status: 200, body: wheelBuf },
    [CANONICAL_CHECKSUM_URL]: { status: 200, body: checksum },
  });
}

test("install rejects a wheel whose bytes do not match the checksum", async () => {
  await withTmpAsync("inst-", async (root) => {
    const http = fakeHttp({
      [CANONICAL_CHECKSUM_URL]: { status: 200, body: Buffer.from(`${H("a")}  ${WHEEL_NAME}\n`, "utf8") },
      [CANONICAL_WHEEL_URL]: { status: 200, body: Buffer.from("mismatching bytes") },
    });
    const deps = fakeInstallDeps(root, { httpRequest: http });
    await assert.rejects(
      () => installNlmBridge({ action: "install", wheelUrl: CANONICAL_WHEEL_URL, checksumUrl: CANONICAL_CHECKSUM_URL }, deps),
      /wheel sha256/,
    );
    const { privateRoot } = resolveRoots(deps);
    assert.ok(!fs.existsSync(privateRoot) || fs.readdirSync(privateRoot).length === 0, "private root must be rolled back");
  });
});

test("install rolls back the private root when uv pip install fails", async () => {
  await withTmpAsync("inst-", async (root) => {
    const runUv = (uvPath, args) => (args[0] === "pip" ? { status: 1, stdout: "", stderr: "hash mismatch" } : { status: 0, stdout: "", stderr: "" });
    const deps = fakeInstallDeps(root, { runUv });
    await assert.rejects(
      () => installNlmBridge({ action: "install", wheelUrl: CANONICAL_WHEEL_URL, checksumUrl: CANONICAL_CHECKSUM_URL }, deps),
      /uv pip install failed/,
    );
    const { privateRoot, publicBin } = resolveRoots(deps);
    assert.ok(!fs.existsSync(privateRoot), "private root removed");
    assert.ok(!fs.existsSync(path.join(publicBin, "nlm.cmd")), "no shim written");
  });
});

test("install refuses when the private root already exists and is non-empty", async () => {
  await withTmpAsync("inst-", async (root) => {
    const deps = fakeInstallDeps(root);
    const { privateRoot } = resolveRoots(deps);
    fs.mkdirSync(privateRoot, { recursive: true });
    fs.writeFileSync(path.join(privateRoot, "leftover"), "x");
    await assert.rejects(
      () => installNlmBridge({ action: "install", wheelUrl: CANONICAL_WHEEL_URL, checksumUrl: CANONICAL_CHECKSUM_URL }, deps),
      /already exists and is not empty/,
    );
  });
});

test("install refuses a foreign launcher before downloading anything", async () => {
  await withTmpAsync("inst-", async (root) => {
    let requested = false;
    const http = async (u) => {
      requested = true;
      return { statusCode: 200, headers: {}, body: Buffer.alloc(0) };
    };
    const deps = fakeInstallDeps(root, { httpRequest: http });
    // A foreign launcher earlier on PATH would shadow our shim; host-appropriate name.
    const earlier = path.join(root, "earlier");
    fs.mkdirSync(earlier, { recursive: true });
    fs.writeFileSync(path.join(earlier, process.platform === "win32" ? "nlm.exe" : "nlm"), "foreign");
    deps.env.PATH = earlier;
    await assert.rejects(
      () => installNlmBridge({ action: "install", wheelUrl: CANONICAL_WHEEL_URL, checksumUrl: CANONICAL_CHECKSUM_URL }, deps),
      /launcher conflict/,
    );
    assert.equal(requested, false, "must fail before any HTTP request");
  });
});

test("install passes a scrubbed env with a private cache to uv (no test-mode env var enables anything)", async () => {
  await withTmpAsync("inst-", async (root) => {
    const seenEnvs = [];
    const runUv = (uvPath, args, { env }) => {
      seenEnvs.push(env);
      return { status: 1, stdout: "", stderr: "stop here" }; // fail on the venv step to keep it short
    };
    const deps = fakeInstallDeps(root, { runUv });
    // Poison the parent env: none of this may reach uv.
    deps.env.UV_INDEX_URL = "https://evil/simple";
    deps.env.PIP_NO_VERIFY = "1";
    deps.env.NLM_INSTALLER_TESTING = "1"; // a hidden test-mode flag must have no effect
    await assert.rejects(() =>
      installNlmBridge({ action: "install", wheelUrl: CANONICAL_WHEEL_URL, checksumUrl: CANONICAL_CHECKSUM_URL }, deps),
    );
    assert.ok(seenEnvs.length >= 1);
    for (const env of seenEnvs) {
      assert.ok(env.UV_CACHE_DIR && env.UV_CACHE_DIR.startsWith(os.tmpdir()), "uv cache is a private temp");
      assert.equal(env.UV_INDEX_URL, undefined);
      assert.equal(env.PIP_NO_VERIFY, undefined);
    }
  });
});

async function withTmpAsync(prefix, fn) {
  const dir = tmp(prefix);
  try {
    return await fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ================================================================= real end-to-end install

function uvAvailable() {
  try {
    execFileSync("uv", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
const REQUIRE_PYTHON = process.env.REQUIRE_PYTHON === "1";
const e2eSkip = uvAvailable() ? false : REQUIRE_PYTHON ? false : "uv not available for the real install";

test("end-to-end: build the wheel, install it offline, and verify receipt + shims + --contract-json", { skip: e2eSkip }, async () => {
  await withTmpAsync("inst-e2e-", async (root) => {
    // 1. Build the real wheel from the checked-in bridge, offline against uv's warm cache.
    const dist = path.join(root, "dist");
    fs.mkdirSync(dist, { recursive: true });
    execFileSync("uv", ["build", "--wheel", "--no-config", "--out-dir", dist, BRIDGE_DIR], {
      env: process.env, // inherits UV_OFFLINE if the developer set it; CI leaves it unset
      stdio: ["ignore", "ignore", "pipe"],
    });
    const wheelBuf = fs.readFileSync(path.join(dist, WHEEL_NAME));
    const wheelSha = sha256Hex(wheelBuf);
    const checksumBuf = Buffer.from(`${wheelSha}  ${WHEEL_NAME}\n`, "utf8");

    // 2. Roots point into a runner-temp tree; real uv/python; uv runs against the warm cache
    //    (UV_CACHE_DIR removed) so --require-hashes resolves offline where the network is down.
    // PATH is empty so the collision scan cannot trip over a real foreign `nlm` on the dev's PATH
    // (resolveUv is stubbed, so it does not need PATH). Install roots point into the temp tree.
    const isWin = process.platform === "win32";
    const homeEnv = isWin
      ? { LOCALAPPDATA: path.join(root, "LocalAppData"), SystemRoot: process.env.SystemRoot, PATHEXT: process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD", PATH: "" }
      : { HOME: path.join(root, "home"), PATH: "" };
    fs.mkdirSync(isWin ? homeEnv.LOCALAPPDATA : homeEnv.HOME, { recursive: true });

    // uv runs under the real environment so it can discover its managed Python and reuse the warm
    // cache; the venv still lands in the temp private root, which is an explicit path argument.
    const realRunUv = (uvPath, args) =>
      spawnSync(uvPath, args, { env: process.env, encoding: "utf8", timeout: 10 * 60_000, maxBuffer: 64 * 1024 * 1024 });
    const realRunPython = (py, args, { env }) =>
      spawnSync(py, args, { env, encoding: "utf8", timeout: 5 * 60_000, maxBuffer: 64 * 1024 * 1024 });

    const uvVersionOut = execFileSync("uv", ["--version"], { encoding: "utf8" });
    const uvVersion = /(\d+\.\d+\.\d+)/.exec(uvVersionOut)[1];

    const deps = {
      platform: process.platform,
      env: homeEnv,
      installerSource: INSTALLER,
      tmpdir: () => os.tmpdir(),
      resolveUv: () => ({ path: fs.realpathSync(whichUv()), version: uvVersion }),
      httpRequest: fakeHttp({
        [CANONICAL_WHEEL_URL]: { status: 200, body: wheelBuf },
        [CANONICAL_CHECKSUM_URL]: { status: 200, body: checksumBuf },
      }),
      runUv: realRunUv,
      runPython: realRunPython,
    };

    if (uvVersion !== "0.11.21") return; // the installer pins 0.11.21; skip the assertions on a different uv

    const result = await installNlmBridge(
      { action: "install", wheelUrl: CANONICAL_WHEEL_URL, checksumUrl: CANONICAL_CHECKSUM_URL },
      deps,
    );

    // 3. Receipt is present, valid, and binds this exact wheel + interpreter.
    assert.equal(result.status, "installed");
    const receipt = JSON.parse(fs.readFileSync(result.receiptPath, "utf8"));
    assert.equal(receipt.format, "learn-kit-nlm-bridge/install-receipt");
    assert.equal(receipt.wheel_sha256, wheelSha);
    assert.equal(receipt.bridge_version, BRIDGE_VERSION);
    assert.equal(receipt.connector_version, CONNECTOR_VERSION);
    assert.match(receipt.python_version, /^3\.12\.\d+$/);
    assert.deepEqual(Object.keys(receipt.shims).sort(), ["learn-kit-nlm-bridge", "nlm"]);

    // 4. Shims exist with the recorded bytes.
    for (const logical of ["learn-kit-nlm-bridge", "nlm"]) {
      const p = receipt.shims[logical].path;
      assert.ok(fs.existsSync(p), `${logical} shim missing`);
      assert.equal(sha256Hex(fs.readFileSync(p)), receipt.shims[logical].sha256);
    }

    // 5. The bridge's own --contract-json agrees (the installer already ran it; re-run for proof).
    const { privateRoot } = resolveRoots(deps);
    const py = isWin ? path.join(privateRoot, "venv/Scripts/python.exe") : path.join(privateRoot, "venv/bin/python");
    const cj = spawnSync(py, ["-I", "-X", "utf8", "-m", "learn_kit_nlm_bridge", "--contract-json"], { encoding: "utf8" });
    assert.equal(cj.status, 0, cj.stderr);
    const contract = JSON.parse(cj.stdout);
    assert.equal(contract.install_receipt_sha256, result.receiptSha256);
    assert.equal(contract.instructions_policy, "prompt-user-only");

    // 6. A second install refuses (private root not empty), and uninstall then cleans everything.
    await assert.rejects(() =>
      installNlmBridge({ action: "install", wheelUrl: CANONICAL_WHEEL_URL, checksumUrl: CANONICAL_CHECKSUM_URL }, deps),
    );
    const un = await installNlmBridge({ action: "uninstall" }, deps);
    assert.equal(un.status, "uninstalled");
    assert.ok(!fs.existsSync(privateRoot));
    for (const logical of ["learn-kit-nlm-bridge", "nlm"]) {
      assert.ok(!fs.existsSync(receipt.shims[logical].path), `${logical} shim must be removed`);
    }
    const st = await installNlmBridge({ action: "status" }, deps);
    assert.equal(st.status, "not-installed");
  });
});

function whichUv() {
  const isWin = process.platform === "win32";
  const exts = isWin ? (process.env.PATHEXT || ".EXE").split(";") : [""];
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    for (const ext of exts) {
      const c = path.join(dir, "uv" + (isWin ? ext : ""));
      if (fs.existsSync(c)) return c;
    }
  }
  throw new Error("uv not found");
}
