// Shared test harness for the Python NLM bridge (plan §2.3.1). Not a test file itself
// (no `.test.` in the name), so `node --test` never runs it directly.
//
// The bridge is Python, and its security-critical paths — the auth guard, the MCP state
// machine, the adapters, AUTH_REQUIRED normalization — cannot be faked from Node. So these
// tests drive the REAL bridge in a venv shaped like the production private environment: the
// hashed connector closure plus the bridge installed editable. That is expensive to build, so
// it is done once and cached, keyed on the runtime lock so a lock change forces a rebuild while
// a source edit (picked up by the editable install) does not.
//
// Availability mirrors the repo's REQUIRE_* convention. If uv cannot produce the venv and
// REQUIRE_PYTHON is unset, python-dependent tests skip; with REQUIRE_PYTHON=1 (CI) they must run.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync, spawn } from "node:child_process";

import { canonicalJson, sha256 } from "../../scripts/generate-nlm-contract.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
const BRIDGE_DIR = path.join(REPO_ROOT, "plugins/learn-kit/nlm-bridge");
const RUNTIME_LOCK = path.join(BRIDGE_DIR, "requirements/notebooklm-mcp-cli-0.8.7-py312.lock.txt");

export const REQUIRE_PYTHON = process.env.REQUIRE_PYTHON === "1";

function uvAvailable() {
  try {
    execFileSync("uv", ["--version"], { stdio: ["ignore", "ignore", "ignore"] });
    return true;
  } catch {
    return false;
  }
}

export function venvPython(root) {
  return process.platform === "win32"
    ? path.join(root, "venv", "Scripts", "python.exe")
    : path.join(root, "venv", "bin", "python");
}

/**
 * Publish a fully-built staging directory to `dest` with a single atomic rename (both live under
 * os.tmpdir(), so one filesystem). `node --test` runs the two bridge-venv test files in parallel
 * worker processes, so on a cold cache both call buildVenv() at once. Building in place would let
 * them clobber a shared directory (the old rmSync + shared-path uv build); building into a private
 * staging dir and renaming instead lets the first finisher win. A loser's rename fails because
 * `dest` already exists — if it is a complete venv, discard the loser's staging and reuse the
 * winner's; otherwise (a genuinely broken `dest`) surface the error. Exported for the concurrency
 * test. uv venvs are relocatable for the `python -m/-c` invocation used here (sys.prefix is derived
 * from the interpreter location, and the editable bridge install points at an absolute path).
 */
export function publishVenvAtomically(staging, dest) {
  try {
    fs.renameSync(staging, dest);
  } catch (e) {
    if (fs.existsSync(path.join(dest, ".ready")) && fs.existsSync(venvPython(dest))) {
      fs.rmSync(staging, { recursive: true, force: true });
      return;
    }
    throw e;
  }
}

/** Build (or reuse a cached) venv shaped like the production private environment. */
function buildVenv() {
  const lockBytes = fs.readFileSync(RUNTIME_LOCK);
  const key = crypto
    .createHash("sha256")
    .update(lockBytes)
    .update(BRIDGE_DIR)
    .digest("hex")
    .slice(0, 16);
  const root = path.join(os.tmpdir(), `lk-bridge-testvenv-${key}`);
  const py = venvPython(root);
  const marker = path.join(root, ".ready");

  if (fs.existsSync(marker) && fs.existsSync(py)) return { root, python: py };

  // Build into a private staging dir, then atomically publish it to `root`. See
  // publishVenvAtomically for why an in-place build would race under parallel `node --test`.
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), "lk-bridge-build-"));
  try {
    const stagedPy = venvPython(staging);
    const run = (args) =>
      execFileSync("uv", args, { stdio: ["ignore", "ignore", "pipe"], encoding: "utf8" });

    // uv honours UV_OFFLINE from the environment; local runs set it, CI does not.
    run(["venv", "--python", "3.12", "--no-python-downloads", "--no-config", path.join(staging, "venv")]);
    run([
      "pip", "install",
      "--python", stagedPy,
      "--require-hashes", "--no-build", "--no-config",
      "-r", RUNTIME_LOCK,
    ]);
    run(["pip", "install", "--python", stagedPy, "--no-deps", "-e", BRIDGE_DIR]);
    fs.writeFileSync(path.join(staging, ".ready"), key);
    publishVenvAtomically(staging, root);
  } catch (e) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw e;
  }
  return { root, python: py };
}

let CACHED;
/**
 * Resolve the bridge venv, or null when Python is unavailable and not required.
 *
 * `LEARN_KIT_BRIDGE_VENV_PY` short-circuits the build with a pre-made venv python — used for
 * fast local iteration. The private root is derived as the interpreter's grandparent's parent
 * (venv/{Scripts,bin}/python -> venv -> root), matching where the installer puts the receipt.
 */
export function bridgeVenv() {
  if (CACHED !== undefined) return CACHED;
  const override = process.env.LEARN_KIT_BRIDGE_VENV_PY;
  if (override && fs.existsSync(override)) {
    CACHED = { root: path.dirname(path.dirname(path.dirname(override))), python: override };
    return CACHED;
  }
  if (!uvAvailable()) {
    if (REQUIRE_PYTHON) throw new Error("REQUIRE_PYTHON=1 but uv is not available to build the bridge venv");
    CACHED = null;
    return CACHED;
  }
  try {
    CACHED = buildVenv();
  } catch (e) {
    if (REQUIRE_PYTHON) throw e;
    CACHED = null;
  }
  return CACHED;
}

/** node:test's { skip } reason, or false when the venv is present. */
export function skipUnlessBridge() {
  return bridgeVenv() ? false : "no Python 3.12 / uv available to build the bridge venv";
}

const RECEIPT_NAME = "install-receipt.json";

/** Pull the live SHAs / interpreter facts out of the installed bridge, via its own contract code. */
export function bridgeFacts(python) {
  const code = [
    "import json,sys",
    "from pathlib import Path",
    "from learn_kit_nlm_bridge import contract",
    "env,es=contract.load_environment_lock()",
    "env['_environment_sha256']=es",
    "shas=contract.compute_contract_shas(env)",
    "print(json.dumps({",
    " 'env_sha':es,'public':shas['public_tools'],'upstream':shas['upstream_tools'],'auth':shas['upstream_auth_guard'],",
    " 'runtime_lock':env['locks']['runtime']['sha256'],'build_lock':env['locks']['build']['sha256'],",
    " 'python':'.'.join(str(v) for v in sys.version_info[:3]),",
    " 'venv':str(Path(sys.executable).resolve().parents[1]),",
    " 'receipt_path':str(contract.receipt_path())}))",
  ].join("\n");
  const out = execFileSync(python, ["-I", "-X", "utf8", "-c", code], { encoding: "utf8" });
  return JSON.parse(out.trim());
}

/** A fully valid receipt for these facts. Tests clone and mutate it to build negatives. */
export function validReceipt(facts) {
  const url = "https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/download/v7.0.0/";
  const wheel = "learn_kit_nlm_bridge-4.0.0-py3-none-any.whl";
  const bin = path.join(path.dirname(facts.venv), "bin");
  const target = venvPython(path.dirname(facts.venv));
  return {
    format: "learn-kit-nlm-bridge/install-receipt",
    format_version: 1,
    installer_format: "install-nlm-bridge/v1",
    installer_source_sha256: "a".repeat(64),
    release_tag: "v7.0.0",
    wheel_url: url + wheel,
    checksum_url: url + wheel + ".sha256",
    wheel_sha256: "b".repeat(64),
    runtime_lock_sha256: facts.runtime_lock,
    build_lock_sha256: facts.build_lock,
    uv_path: "C:/uv/uv.exe",
    uv_version: "0.11.21",
    python_version: facts.python,
    bridge_version: "4.0.0",
    connector_version: "0.8.7",
    environment_sha256: facts.env_sha,
    public_schema_sha256: facts.public,
    upstream_schema_sha256: facts.upstream,
    auth_guard_sha256: facts.auth,
    private_env: facts.venv,
    shims: {
      "learn-kit-nlm-bridge": { path: path.join(bin, "learn-kit-nlm-bridge.cmd"), sha256: "c".repeat(64), target },
      nlm: { path: path.join(bin, "nlm.cmd"), sha256: "d".repeat(64), target },
    },
  };
}

/** Write a receipt (canonical bytes) at the location the bridge looks for it. */
export function writeReceipt(facts, receipt) {
  const bytes = canonicalJson(receipt);
  fs.writeFileSync(facts.receipt_path, bytes);
  return { path: facts.receipt_path, sha256: sha256(bytes) };
}

export function removeReceipt(facts) {
  fs.rmSync(facts.receipt_path, { force: true });
}

/** Run the bridge module with argv, returning status/stdout/stderr. `-I -X utf8` like production. */
export function runBridgeModule(python, moduleArgs, { input, env, timeoutMs = 30000 } = {}) {
  const r = spawnSync(python, ["-I", "-X", "utf8", ...moduleArgs], {
    input: input ?? undefined,
    encoding: "utf8",
    timeout: timeoutMs,
    env: env ?? process.env,
  });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", signal: r.signal, error: r.error };
}

/** An env whose home / config dirs all point at a fresh empty directory, so the guarded child
 *  the bridge spawns sees no saved credentials — the automated AUTH_REQUIRED condition. */
export function emptyHomeEnv() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "nlm-empty-home-"));
  for (const sub of ["Roaming", "Local", "config"]) fs.mkdirSync(path.join(home, sub), { recursive: true });
  return {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    XDG_CONFIG_HOME: path.join(home, "config"),
    APPDATA: path.join(home, "Roaming"),
    LOCALAPPDATA: path.join(home, "Local"),
  };
}

/** An interactive MCP stdio client for the running bridge: request() resolves by id, notify()
 *  sends a no-id notification, close() tears it down. */
export function openBridge(python, { env } = {}) {
  const child = spawn(python, ["-I", "-X", "utf8", "-m", "learn_kit_nlm_bridge"], { env: env ?? process.env });
  let buf = "";
  const pending = new Map();
  const errbuf = [];
  child.stderr.on("data", (d) => errbuf.push(d.toString()));
  child.stdout.on("data", (d) => {
    buf += d.toString();
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (!line.trim()) continue;
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      if (msg.id != null && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    }
  });
  let idc = 0;
  return {
    request(method, params = {}, { timeoutMs = 30000 } = {}) {
      const id = ++idc;
      return new Promise((resolve, reject) => {
        const t = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`timeout waiting for ${method}: ${errbuf.join("")}`));
        }, timeoutMs);
        pending.set(id, (msg) => {
          clearTimeout(t);
          resolve(msg);
        });
        child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
      });
    },
    notify(method, params = {}) {
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);
    },
    stderr: () => errbuf.join(""),
    close() {
      try {
        child.stdin.end();
      } catch {
        /* already gone */
      }
      child.kill();
    },
  };
}

export { REPO_ROOT, BRIDGE_DIR };
