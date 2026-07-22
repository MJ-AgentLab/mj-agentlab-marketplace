#!/usr/bin/env node
// Pre-publish verification that a freshly built release *installs* (plan §3 Task 3, line 524).
//
//   node scripts/release-verify-install.mjs --wheel <wheel-path> --checksum <checksum-path>
//
// Exit 0 = the assets install and the bridge's own contract passes, 1 = a verification failure,
// 2 = bad input / the check could not be run.
//
// WHY AN INJECTED CORE AND NOT THE PRODUCTION CLI. The production installer only ever downloads
// the exact pinned PUBLIC v7.0.0 URLs (install-nlm-bridge.mjs validateUrls). A *draft* release's
// assets are not at those public URLs yet — they are only reachable through the authenticated API.
// So the release workflow downloads the draft assets itself, and this module drives the SAME
// installer core with an injected httpRequest that serves those downloaded bytes for the canonical
// URLs. No install logic is duplicated: installNlmBridge does the whole job, including its own
// post-install `--contract-json` gate and rollback-on-failure. A successful install here is the
// proof the release wheel + checksum are installable; the post-publish public-URL check
// (un-injected, real network) is a separate, final step in the workflow.
//
// The install lands entirely under a throwaway OS-temp HOME (deps.env), so nothing here touches
// the runner's real user directories. uv itself runs under the real environment so it can discover
// its Python 3.12 and warm cache, exactly as tests/install-nlm-bridge.test.mjs proved works; the
// wheel install is still `--require-hashes` against the checked-in runtime lock regardless.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  installNlmBridge,
  resolveRoots,
  PRODUCTION_DEPS,
  CANONICAL_WHEEL_URL,
  CANONICAL_CHECKSUM_URL,
  WHEEL_NAME,
  CHECKSUM_NAME,
  BRIDGE_VERSION,
  CONNECTOR_VERSION,
} from "../plugins/learn-kit/scripts/install-nlm-bridge.mjs";

/** A verification rule failed — the release is not installable as built. Exit 1. */
export class VerifyError extends Error {}
/** Bad input / the check could not be run. Exit 2. */
export class VerifyUsageError extends Error {}

const sha256Hex = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

/**
 * A one-shot httpRequest that serves exactly the two downloaded assets by their canonical URL and
 * refuses anything else. A redirect or an unexpected URL is a harness bug, never a soft pass —
 * these bytes were already digest-verified by the caller before they got here.
 */
export function localAssetHttp(wheelBuf, checksumBuf) {
  const map = new Map([
    [CANONICAL_WHEEL_URL, wheelBuf],
    [CANONICAL_CHECKSUM_URL, checksumBuf],
  ]);
  return async (urlObj) => {
    const href = typeof urlObj === "string" ? urlObj : urlObj?.href ?? String(urlObj);
    const body = map.get(href);
    if (!body) throw new VerifyError(`install-verify: unexpected request for ${href}`);
    return { statusCode: 200, headers: {}, body };
  };
}

/**
 * Build installer deps whose install location is a throwaway temp HOME but whose uv/Python run for
 * real. `resolveUv` and `envPath` are overridable so the REQUIRE_PYTHON test can stub uv resolution
 * and pass an empty PATH (the dev box carries a foreign `nlm` that would otherwise trip the
 * installer's launcher-collision guard); production passes the real ones.
 */
export function buildVerifyDeps({ wheelBuf, checksumBuf, home, resolveUv, envPath, platform } = {}) {
  const plat = platform ?? process.platform;
  const realHome = home ?? fs.mkdtempSync(path.join(os.tmpdir(), "lk-release-verify-"));
  const PATH = envPath ?? process.env.PATH ?? "";
  const env =
    plat === "win32"
      ? {
          LOCALAPPDATA: path.join(realHome, "LocalAppData"),
          SystemRoot: process.env.SystemRoot,
          PATHEXT: process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD",
          PATH,
        }
      : {
          HOME: realHome,
          XDG_DATA_HOME: path.join(realHome, ".local", "share"),
          XDG_BIN_HOME: path.join(realHome, ".local", "bin"),
          PATH,
        };
  // The bin dir must exist for the shim write; the private root must NOT (the installer demands an
  // empty private root and creates it itself).
  fs.mkdirSync(plat === "win32" ? env.LOCALAPPDATA : env.XDG_BIN_HOME, { recursive: true });

  return {
    home: realHome,
    deps: {
      platform: plat,
      env,
      installerSource: PRODUCTION_DEPS.installerSource,
      tmpdir: () => os.tmpdir(),
      resolveUv: resolveUv ?? PRODUCTION_DEPS.resolveUv,
      httpRequest: localAssetHttp(wheelBuf, checksumBuf),
      // uv runs under the REAL environment (Python + warm cache discovery); the venv still lands in
      // the temp private root via an explicit path argument, and the install is --require-hashes.
      runUv: (uvPath, args) => spawnSync(uvPath, args, { env: process.env, encoding: "utf8", timeout: 10 * 60_000, maxBuffer: 64 * 1024 * 1024 }),
      runPython: (py, args, { env: e }) => spawnSync(py, args, { env: e, encoding: "utf8", timeout: 5 * 60_000, maxBuffer: 64 * 1024 * 1024 }),
    },
  };
}

/**
 * Install the built release assets through the injected core, prove the bridge's own
 * `--contract-json` agrees, then uninstall and clean the temp tree. Returns a small summary.
 *
 * `overrides.install` and `overrides.runPython` let tests exercise the orchestration without a real
 * toolchain; by default they are the production installer and a real spawn.
 */
export async function verifyReleaseInstall({ wheelPath, checksumPath }, overrides = {}) {
  if (typeof wheelPath !== "string" || wheelPath === "") throw new VerifyUsageError("--wheel is required");
  if (typeof checksumPath !== "string" || checksumPath === "") throw new VerifyUsageError("--checksum is required");

  let wheelBuf;
  let checksumBuf;
  try {
    wheelBuf = fs.readFileSync(wheelPath);
    checksumBuf = fs.readFileSync(checksumPath);
  } catch (e) {
    throw new VerifyUsageError(`cannot read a release asset: ${e.message}`);
  }

  const install = overrides.install ?? installNlmBridge;
  const built = overrides.deps
    ? { home: overrides.home ?? null, deps: overrides.deps }
    : buildVerifyDeps({ wheelBuf, checksumBuf, resolveUv: overrides.resolveUv, envPath: overrides.envPath });
  const { deps, home } = built;

  const wheelSha = sha256Hex(wheelBuf);

  try {
    const result = await install(
      { action: "install", wheelUrl: CANONICAL_WHEEL_URL, checksumUrl: CANONICAL_CHECKSUM_URL },
      deps,
    );
    if (!result || result.status !== "installed") {
      throw new VerifyError(`install did not report success: ${JSON.stringify(result)}`);
    }

    const receipt = JSON.parse(fs.readFileSync(result.receiptPath, "utf8"));
    if (receipt.wheel_sha256 !== wheelSha) throw new VerifyError(`receipt wheel_sha256 ${receipt.wheel_sha256} != built wheel ${wheelSha}`);
    if (receipt.bridge_version !== BRIDGE_VERSION) throw new VerifyError(`receipt bridge_version ${receipt.bridge_version} != ${BRIDGE_VERSION}`);
    if (receipt.connector_version !== CONNECTOR_VERSION) throw new VerifyError(`receipt connector_version ${receipt.connector_version} != ${CONNECTOR_VERSION}`);
    if (!/^3\.12\.\d+$/.test(receipt.python_version || "")) throw new VerifyError(`installed Python ${receipt.python_version} is not 3.12.x`);
    const shimKeys = Object.keys(receipt.shims || {}).sort();
    if (shimKeys.length !== 2 || shimKeys[0] !== "learn-kit-nlm-bridge" || shimKeys[1] !== "nlm") {
      throw new VerifyError(`receipt shims are ${JSON.stringify(shimKeys)}, expected learn-kit-nlm-bridge + nlm`);
    }
    for (const logical of shimKeys) {
      const p = receipt.shims[logical].path;
      if (!fs.existsSync(p)) throw new VerifyError(`${logical} shim missing at ${p}`);
      if (sha256Hex(fs.readFileSync(p)) !== receipt.shims[logical].sha256) throw new VerifyError(`${logical} shim bytes drifted from the receipt`);
    }

    // Re-run the bridge's own contract for proof (the installer already gated on it; this confirms
    // the receipt binding independently).
    const { privateRoot } = resolveRoots(deps);
    const py =
      deps.platform === "win32"
        ? path.join(privateRoot, "venv", "Scripts", "python.exe")
        : path.join(privateRoot, "venv", "bin", "python");
    const runPython = overrides.runPython ?? ((exe, args) => spawnSync(exe, args, { encoding: "utf8", timeout: 5 * 60_000, maxBuffer: 64 * 1024 * 1024 }));
    const cj = runPython(py, ["-I", "-X", "utf8", "-m", "learn_kit_nlm_bridge", "--contract-json"]);
    if (!cj || cj.status !== 0) throw new VerifyError(`post-install --contract-json failed: ${(cj && cj.stderr ? cj.stderr : "").toString().trim()}`);
    let contract;
    try {
      contract = JSON.parse(cj.stdout);
    } catch (e) {
      throw new VerifyError(`--contract-json did not return JSON: ${e.message}`);
    }
    if (contract.install_receipt_sha256 !== result.receiptSha256) throw new VerifyError("contract install_receipt_sha256 != the receipt just written");
    if (contract.instructions_policy !== "prompt-user-only") throw new VerifyError(`contract instructions_policy ${JSON.stringify(contract.instructions_policy)} != "prompt-user-only"`);

    // Clean install -> uninstall proves the release also uninstalls cleanly and leaves no residue.
    const un = await install({ action: "uninstall" }, deps);
    if (!un || un.status !== "uninstalled") throw new VerifyError(`uninstall did not report success: ${JSON.stringify(un)}`);

    return {
      ok: true,
      wheel_sha256: wheelSha,
      python_version: receipt.python_version,
      bridge_version: receipt.bridge_version,
      connector_version: receipt.connector_version,
      install_receipt_sha256: result.receiptSha256,
      instructions_policy: contract.instructions_policy,
    };
  } finally {
    if (home) fs.rmSync(home, { recursive: true, force: true });
  }
}

// ------------------------------------------------------------------------------ CLI

function fail(msg, code) {
  process.stderr.write(`release-verify-install: ${msg}\n`);
  return code;
}

async function main(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k !== "--wheel" && k !== "--checksum") return fail(`unknown argument: ${k}`, 2);
    const v = argv[++i];
    if (v === undefined) return fail(`${k} requires a value`, 2);
    a[k] = v;
  }
  try {
    const r = await verifyReleaseInstall({ wheelPath: a["--wheel"], checksumPath: a["--checksum"] });
    process.stdout.write(JSON.stringify(r) + "\n");
    return 0;
  } catch (e) {
    if (e instanceof VerifyUsageError) return fail(e.message, 2);
    if (e instanceof VerifyError) return fail(e.message, 1);
    return fail(`unexpected: ${e.stack || e.message}`, 2);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
