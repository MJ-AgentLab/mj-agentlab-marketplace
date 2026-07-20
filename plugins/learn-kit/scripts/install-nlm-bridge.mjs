#!/usr/bin/env node
// User-run installer for the learn-kit NLM bridge (plan §2.3.1). NOT part of any skill's
// permission surface: the agent may only PRINT the command below; a human runs it in a terminal.
//
//   node <plugin-root>/scripts/install-nlm-bridge.mjs install \
//     --wheel-url    https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/download/v7.0.0/learn_kit_nlm_bridge-4.0.0-py3-none-any.whl \
//     --checksum-url https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/download/v7.0.0/learn_kit_nlm_bridge-4.0.0-py3-none-any.whl.sha256
//   node <plugin-root>/scripts/install-nlm-bridge.mjs status
//   node <plugin-root>/scripts/install-nlm-bridge.mjs uninstall
//
// Exit 0 ok | 1 install/verification/safety failure | 2 bad arguments.
//
// NODE STDLIB ONLY. This file ships INSIDE the installed plugin, where the repo's
// devDependencies (cross-spawn, yaml) and scripts/run-cli.mjs do not exist. It must never import
// from outside its own directory tree. Node built-ins (fs/os/path/crypto/url/https/child_process)
// are fine; third-party packages are not.
//
// THREAT MODEL, STATED PLAINLY. This is defense in depth against an accidental or drifted install,
// not a trusted authorization boundary. The same OS user can edit the shims, the receipt or the
// venv after the fact. What the installer guarantees is narrower and worth having: the bytes it
// installs are exactly the hashed wheel + the hashed connector closure the repo pinned; it writes
// a receipt binding that environment; and it fails closed — leaving no half-built venv and no
// shim — on any hash mismatch, redirect to an unexpected host, closure drift, or foreign launcher
// that could shadow ours.
//
// TESTABILITY. installNlmBridge(opts, deps) takes ALL environment interaction through `deps`:
// the HTTP request primitive, the uv/python runners, and — crucially — `deps.env`, from which the
// fixed install roots are derived. Production passes PRODUCTION_DEPS (deps.env === process.env, so
// the real user dirs). Tests import the function and pass their own deps with a runner-temp env, so
// no test ever touches a real user directory. There is deliberately NO env var and NO hidden CLI
// flag that switches on a test mode: the CLI's main() always passes PRODUCTION_DEPS, and the module
// never reads process.env directly.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import https from "node:https";
import { spawnSync } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";

// ------------------------------------------------------------------ fixed facts

export const BRIDGE_VERSION = "4.0.0";
export const CONNECTOR_VERSION = "0.8.7";
export const RELEASE_TAG = "v7.0.0";

export const WHEEL_NAME = "learn_kit_nlm_bridge-4.0.0-py3-none-any.whl";
export const CHECKSUM_NAME = `${WHEEL_NAME}.sha256`;

const RELEASE_BASE = `https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/download/${RELEASE_TAG}/`;
export const CANONICAL_WHEEL_URL = RELEASE_BASE + WHEEL_NAME;
export const CANONICAL_CHECKSUM_URL = RELEASE_BASE + CHECKSUM_NAME;

// The only hosts a download may ever touch. Every hop of the redirect chain — the first request
// and each Location — must resolve to one of these, so a redirect off to an attacker host is
// refused before its request is even made.
export const ALLOWED_HOSTS = new Set([
  "github.com",
  "objects.githubusercontent.com",
  "release-assets.githubusercontent.com",
]);

export const MAX_REDIRECTS = 5;
export const MAX_CHECKSUM_BYTES = 256;
export const MAX_WHEEL_BYTES = 50 * 1024 * 1024;
export const REQUEST_TIMEOUT_MS = 60_000;

export const INSTALLER_FORMAT = "install-nlm-bridge/v1";
export const RECEIPT_NAME = "install-receipt.json";
export const RECEIPT_FORMAT = "learn-kit-nlm-bridge/install-receipt";
export const RECEIPT_FORMAT_VERSION = 1;

// The checked-in contract files, relative to this installer's plugin root. Read BEFORE install to
// know the SHAs the wheel must reproduce, and to tie the shipped plugin bytes to the built venv.
const BRIDGE_SUBDIR = "nlm-bridge";
const RUNTIME_LOCK_REL = "requirements/notebooklm-mcp-cli-0.8.7-py312.lock.txt";
const ENV_LOCK_REL = "src/learn_kit_nlm_bridge/_data/environment-lock.json";

const DATA_FILES = {
  public_tools: "public-tools-v1.json",
  upstream_tools: `upstream-tools-v${CONNECTOR_VERSION}.json`,
  upstream_auth_guard: `upstream-auth-guard-v${CONNECTOR_VERSION}.json`,
};

export class UsageError extends Error {} // -> exit 2
export class InstallError extends Error {} // -> exit 1 (safety, drift, download, verification)

// ------------------------------------------------------------------ primitives

/**
 * The one JSON serialization, byte-identical to canonical_json() in the bridge's contract.py and
 * canonicalJson() in generate-nlm-contract.mjs: sorted keys, two-space indent, pure ASCII, LF, one
 * trailing newline. The receipt is written with this; the bridge re-hashes the on-disk bytes, so
 * determinism keeps regeneration and cross-language hashing in agreement.
 */
export function canonicalJson(value) {
  const sortDeep = (v) => {
    if (Array.isArray(v)) return v.map(sortDeep);
    if (v && typeof v === "object") {
      return Object.fromEntries(
        Object.keys(v)
          .sort()
          .map((k) => [k, sortDeep(v[k])]),
      );
    }
    return v;
  };
  const ascii = JSON.stringify(sortDeep(value), null, 2).replace(/[-￿]/g, (c) =>
    `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
  return `${ascii}\n`;
}

const sha256Hex = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const sha256TextUtf8 = (text) => sha256Hex(Buffer.from(text, "utf8"));
// The hash form RECORD uses: urlsafe base64 of the raw digest, no padding.
const sha256RecordB64 = (buf) => crypto.createHash("sha256").update(buf).digest("base64url").replace(/=+$/, "");

const isHex64 = (s) => typeof s === "string" && /^[0-9a-f]{64}$/.test(s);

// Path logic flavoured by the TARGET platform, not the host. Production always runs where
// deps.platform === process.platform, but building a Windows shim string on either host (and
// vice-versa) must produce the target's separators, which is what lets both platforms' bytes be
// tested from one CI runner. Filesystem calls still use the ambient `path`/`fs`, which is correct
// because an actual install only ever happens on its own platform.
const P = (platform) => (platform === "win32" ? path.win32 : path.posix);

/** realpath, or null if the path does not resolve. */
function realpathOrNull(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return null;
  }
}

/** True when `child` is inside `parent` (or equal), after both are realpath-resolved. */
function isContained(parentReal, childReal) {
  const rel = path.relative(parentReal, childReal);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

// ------------------------------------------------------------------ install roots

/**
 * The fixed install layout, derived from `deps.env` and `deps.platform`.
 *
 * On Windows the public bin and the private root share a MJ-AgentLab parent, which is what makes
 * the Windows shim's relative `%~dp0..\learn-kit-nlm-bridge\4.0.0\...` path resolve. On POSIX they
 * live in different XDG trees, so the POSIX shim uses the absolute interpreter path instead.
 */
export function resolveRoots(deps) {
  const env = deps.env;
  const pp = P(deps.platform);
  if (deps.platform === "win32") {
    const localAppData = env.LOCALAPPDATA;
    if (!localAppData) throw new InstallError("LOCALAPPDATA is not set; cannot locate the install root");
    const base = pp.join(localAppData, "MJ-AgentLab");
    return {
      privateRoot: pp.join(base, "learn-kit-nlm-bridge", BRIDGE_VERSION),
      publicBin: pp.join(base, "bin"),
    };
  }
  const home = env.HOME;
  const dataHome = env.XDG_DATA_HOME || (home ? pp.join(home, ".local", "share") : null);
  const binHome = env.XDG_BIN_HOME || (home ? pp.join(home, ".local", "bin") : null);
  if (!dataHome || !binHome) throw new InstallError("HOME/XDG_* are not set; cannot locate the install root");
  return {
    privateRoot: pp.join(dataHome, "mj-agentlab", "learn-kit-nlm-bridge", BRIDGE_VERSION),
    publicBin: binHome,
  };
}

const venvDir = (privateRoot, platform) => P(platform).join(privateRoot, "venv");
const venvPython = (privateRoot, platform) =>
  platform === "win32"
    ? P(platform).join(venvDir(privateRoot, platform), "Scripts", "python.exe")
    : P(platform).join(venvDir(privateRoot, platform), "bin", "python");

const shimNames = (platform) =>
  platform === "win32"
    ? { "learn-kit-nlm-bridge": "learn-kit-nlm-bridge.cmd", nlm: "nlm.cmd" }
    : { "learn-kit-nlm-bridge": "learn-kit-nlm-bridge", nlm: "nlm" };

// The module each shim runs. learn-kit-nlm-bridge -> the server / --contract-json; nlm -> the
// restricted login shim that only ever accepts `login` or `--contract-json`.
const SHIM_MODULE = {
  "learn-kit-nlm-bridge": "learn_kit_nlm_bridge",
  nlm: "learn_kit_nlm_bridge.login",
};

// ------------------------------------------------------------------ URL validation

/** The install subcommand only ever downloads the exact pinned release URLs. */
export function validateUrls(wheelUrl, checksumUrl) {
  if (wheelUrl !== CANONICAL_WHEEL_URL) {
    throw new UsageError(`--wheel-url must be exactly ${CANONICAL_WHEEL_URL}`);
  }
  if (checksumUrl !== CANONICAL_CHECKSUM_URL) {
    throw new UsageError(`--checksum-url must be exactly ${CANONICAL_CHECKSUM_URL}`);
  }
  return { releaseTag: RELEASE_TAG };
}

// ------------------------------------------------------------------ download

/**
 * Follow up to MAX_REDIRECTS HTTPS redirects and return the response body as a Buffer.
 *
 * Every rule here closes a supply-chain hole: HTTPS-only refuses a downgrade to plaintext where an
 * on-path attacker could swap bytes; the host allowlist (checked on the first URL AND every
 * Location) refuses a redirect to an attacker host; the redirect cap refuses an infinite bounce;
 * the byte cap refuses a decompression/oversize bomb before it fills memory or disk. The bytes
 * returned here are still untrusted — the caller verifies them against the pinned checksum.
 */
export async function download(startUrl, { maxBytes, label }, deps) {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let u;
    try {
      u = new URL(current);
    } catch {
      throw new InstallError(`${label}: not a valid URL: ${current}`);
    }
    if (u.protocol !== "https:") throw new InstallError(`${label}: refusing non-HTTPS URL: ${current}`);
    if (!ALLOWED_HOSTS.has(u.hostname)) throw new InstallError(`${label}: host not allowed: ${u.hostname}`);

    const res = await deps.httpRequest(u, { timeoutMs: REQUEST_TIMEOUT_MS, maxBytes });
    const status = res.statusCode;

    if (status >= 300 && status < 400) {
      const location = res.headers?.location;
      if (!location) throw new InstallError(`${label}: ${status} redirect with no Location`);
      // Resolve relative Locations against the current URL, so a bare path still gets host-checked.
      current = new URL(location, u).href;
      continue;
    }
    if (status !== 200) throw new InstallError(`${label}: unexpected HTTP status ${status}`);

    const body = res.body ?? Buffer.alloc(0);
    if (!Buffer.isBuffer(body)) throw new InstallError(`${label}: response body was not a Buffer`);
    if (body.length > maxBytes) throw new InstallError(`${label}: body exceeds ${maxBytes} bytes`);
    return body;
  }
  throw new InstallError(`${label}: too many redirects (> ${MAX_REDIRECTS})`);
}

/**
 * Parse the checksum asset: exactly one line `<64 lowercase hex>  <wheel-name>\n`, UTF-8, no BOM,
 * no CR, no trailing junk. The two-space separator is the sha256sum convention; a lax parser here
 * would let a benign-looking file carry a second, attacker-chosen line.
 */
export function parseChecksum(buffer) {
  if (buffer.length > MAX_CHECKSUM_BYTES) throw new InstallError(`checksum asset is too large (> ${MAX_CHECKSUM_BYTES} bytes)`);
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    throw new InstallError("checksum asset must not start with a BOM");
  }
  const text = buffer.toString("utf8");
  if (text.includes("\r")) throw new InstallError("checksum asset must use LF only, no CR");
  const m = /^([0-9a-f]{64})  (.+)\n$/.exec(text);
  if (!m) throw new InstallError("checksum asset must be exactly '<64hex>  <wheel-name>\\n'");
  if (m[2] !== WHEEL_NAME) throw new InstallError(`checksum names ${JSON.stringify(m[2])}, expected ${WHEEL_NAME}`);
  return m[1];
}

// ------------------------------------------------------------------ checked-in contract

/**
 * Read the contract SHAs the bridge ships in its source tree, before anything is installed.
 *
 * The environment lock is the anchor: it records the SHA every other contract file and both locks
 * must have. We recompute each file's SHA and cross-check it here, and separately hash the
 * checked-in runtime lock and require it to match the lock SHA the env-lock records — so the wheel
 * we are about to install is tied to the exact plugin bytes on disk, not merely to itself.
 */
export function readCheckedInContract(pluginRoot) {
  const bridgeDir = path.join(pluginRoot, BRIDGE_SUBDIR);
  const dataDir = path.join(bridgeDir, "src/learn_kit_nlm_bridge/_data");

  const envLockPath = path.join(bridgeDir, ENV_LOCK_REL);
  let envLockText;
  try {
    envLockText = fs.readFileSync(envLockPath, "utf8");
  } catch (e) {
    throw new InstallError(`cannot read checked-in environment lock at ${envLockPath}: ${e.message}`);
  }
  let envLock;
  try {
    envLock = JSON.parse(envLockText);
  } catch (e) {
    throw new InstallError(`checked-in environment lock is not valid JSON: ${e.message}`);
  }
  const environmentSha = sha256TextUtf8(envLockText);

  const contracts = envLock.contracts ?? {};
  const contractShas = {};
  for (const [key, name] of Object.entries(DATA_FILES)) {
    const filePath = path.join(dataDir, name);
    let text;
    try {
      text = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      throw new InstallError(`cannot read contract data ${name}: ${e.message}`);
    }
    const actual = sha256TextUtf8(text);
    const recorded = contracts[key]?.sha256;
    if (recorded !== actual) {
      throw new InstallError(`${name} sha256 ${actual} != environment lock ${recorded}; contract data has drifted`);
    }
    contractShas[key] = actual;
  }

  const runtimeLockPath = path.join(bridgeDir, RUNTIME_LOCK_REL);
  let runtimeLockText;
  try {
    runtimeLockText = fs.readFileSync(runtimeLockPath, "utf8");
  } catch (e) {
    throw new InstallError(`cannot read checked-in runtime lock: ${e.message}`);
  }
  const runtimeLockSha = sha256TextUtf8(runtimeLockText);
  const recordedRuntime = envLock.locks?.runtime?.sha256;
  if (runtimeLockSha !== recordedRuntime) {
    throw new InstallError(
      `checked-in runtime lock sha256 ${runtimeLockSha} != environment lock ${recordedRuntime}; ` +
        "the plugin's lock and its environment lock disagree",
    );
  }
  const buildLockSha = envLock.locks?.build?.sha256;
  if (!isHex64(buildLockSha)) throw new InstallError("environment lock has no valid build lock sha256");

  if (envLock.bridge_version !== BRIDGE_VERSION) {
    throw new InstallError(`environment lock bridge_version ${envLock.bridge_version} != ${BRIDGE_VERSION}`);
  }
  const connector = envLock.connector_version ?? CONNECTOR_VERSION;
  if (connector !== CONNECTOR_VERSION) {
    throw new InstallError(`environment lock connector_version ${connector} != ${CONNECTOR_VERSION}`);
  }

  return {
    runtimeLockPath,
    runtimeLockText,
    runtimeLockSha,
    buildLockSha,
    environmentSha,
    contractShas,
  };
}

// ------------------------------------------------------------------ uv env

/**
 * The environment every uv child runs under.
 *
 * Built from an empty map, not inherited-then-deleted: only OS/home/temp/locale are copied through,
 * plus a fresh private UV_CACHE_DIR and the PyPI default index. Every UV_, PIP_, PYTHON prefix,
 * virtualenv and proxy/index/source override in the parent environment is dropped, so nothing
 * outside this function can redirect where artifacts come from or how they are (not) verified.
 */
export function buildUvEnv(deps, cacheDir) {
  const src = deps.env;
  const out = {};
  const keepExact = [
    "SystemRoot", "windir", "WINDIR", "SYSTEMDRIVE", "COMSPEC", "PATHEXT", "NUMBER_OF_PROCESSORS",
    "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA", "XDG_CONFIG_HOME", "XDG_DATA_HOME", "XDG_BIN_HOME",
    "TEMP", "TMP", "TMPDIR", "LANG", "LC_ALL", "LC_CTYPE", "TERM",
  ];
  for (const k of keepExact) if (src[k] !== undefined) out[k] = src[k];

  // A minimal, trusted PATH: OS dirs only. uv itself is invoked by absolute path, and it discovers
  // interpreters through its own managed locations, so a rich PATH is neither needed nor wanted.
  const pp = P(deps.platform);
  if (deps.platform === "win32") {
    const sysRoot = src.SystemRoot || src.windir || "C:\\Windows";
    out.PATH = [pp.join(sysRoot, "System32"), sysRoot].join(pp.delimiter);
  } else {
    out.PATH = ["/usr/bin", "/bin"].join(pp.delimiter);
  }

  out.UV_CACHE_DIR = cacheDir;
  out.PYTHONUTF8 = "1";
  return out;
}

// ------------------------------------------------------------------ shims

/**
 * The exact bytes of a public shim. Windows: a CRLF `.cmd` using the relative `%~dp0..` path so the
 * pair of dirs can move together. POSIX: an LF `/bin/sh` script using the absolute interpreter,
 * because the public bin and private root live in unrelated XDG trees.
 */
export function shimBytes(logicalName, { publicBin, privateRoot, platform }) {
  const py = venvPython(privateRoot, platform);
  const module = SHIM_MODULE[logicalName];
  if (platform === "win32") {
    const rel = P(platform).relative(publicBin, py); // e.g. ..\learn-kit-nlm-bridge\4.0.0\venv\Scripts\python.exe
    const body =
      "@echo off\r\n" +
      `"%~dp0${rel}" -I -X utf8 -m ${module} %*\r\n`;
    return Buffer.from(body, "utf8");
  }
  // POSIX-safe quoting: refuse a path that could not survive double-quoting.
  if (py.includes('"') || py.includes("\n") || py.includes("`") || py.includes("$")) {
    throw new InstallError(`interpreter path is not shell-safe: ${py}`);
  }
  const body = `#!/bin/sh\nexec "${py}" -I -X utf8 -m ${module} "$@"\n`;
  return Buffer.from(body, "utf8");
}

/**
 * Before writing any shim, refuse if a foreign launcher for either logical name could shadow ours.
 *
 * A launcher shadows ours when it sits in the managed bin (a non-matching file there) or in any PATH
 * directory that PRECEDES the managed bin (so it would be resolved first once the user adds the
 * managed bin to PATH). The Windows collision set is the extensionless name plus every PATHEXT
 * extension plus `.ps1` — PowerShell resolves `.ps1` for a bare name even though it is not in
 * PATHEXT, so a `login.ps1`-style file could intercept the login prompt.
 */
export function detectShimCollisions(deps, { publicBin }) {
  const platform = deps.platform;
  const env = deps.env;
  const names = shimNames(platform);
  const ownShims = new Set(Object.values(names).map((n) => path.join(publicBin, n)));

  const problems = [];

  let extensions;
  if (platform === "win32") {
    const pathext = (env.PATHEXT || "").split(";").map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (!pathext.includes(".cmd")) {
      problems.push("PATHEXT does not include .CMD; the Windows shim would not be executable");
    }
    extensions = ["", ...pathext, ".ps1"];
  } else {
    extensions = [""];
  }

  const publicBinReal = realpathOrNull(publicBin);
  const pathDirs = (env.PATH || "").split(path.delimiter).filter(Boolean);
  const precedingDirs = [];
  let sawPublicBin = false;
  for (const d of pathDirs) {
    const dReal = realpathOrNull(d);
    if (publicBinReal && dReal && dReal === publicBinReal) {
      sawPublicBin = true;
      break;
    }
    precedingDirs.push(d);
  }
  // Not in PATH -> effectively appended, so every PATH dir precedes it. (If it was found, we
  // stopped collecting at that point above.)
  void sawPublicBin;

  for (const logical of Object.keys(names)) {
    // Foreign candidates in directories that would win over the managed bin.
    for (const dir of precedingDirs) {
      for (const ext of extensions) {
        const candidate = path.join(dir, logical + ext);
        if (fs.existsSync(candidate)) {
          problems.push(`a launcher for '${logical}' already resolves earlier on PATH: ${candidate}`);
        }
      }
    }
    // Foreign, non-matching files sitting in the managed bin itself.
    for (const ext of extensions) {
      const candidate = path.join(publicBin, logical + ext);
      if (fs.existsSync(candidate) && !ownShims.has(candidate)) {
        problems.push(`a foreign launcher for '${logical}' occupies the managed bin: ${candidate}`);
      }
    }
  }
  return problems;
}

/**
 * Write the two public shims, or accept a byte-identical one already present (idempotent).
 *
 * A file already sitting at the exact managed shim path is deliberately let through by
 * detectShimCollisions (it is the idempotent slot), so THIS is the only guard that tells a
 * byte-identical re-install (keep) from a foreign file occupying that path (refuse). Each newly
 * created shim is recorded in `created.shims` BEFORE it is written, so rollback removes it even if
 * the write is partial or a later chmod throws — the header's "no shim on failure" guarantee.
 */
export function writeShims(shimSpecs, publicBin, deps, created) {
  fs.mkdirSync(publicBin, { recursive: true });
  for (const logical of Object.keys(shimSpecs)) {
    const spec = shimSpecs[logical];
    if (fs.existsSync(spec.path)) {
      const existing = fs.readFileSync(spec.path);
      if (!existing.equals(spec.bytes)) {
        throw new InstallError(`a different '${logical}' shim already exists at ${spec.path}; refusing to overwrite`);
      }
      continue; // byte-identical: keep it, and do NOT record it — we did not create it this run
    }
    created.shims.push(spec.path); // track before writing: a partial write or a chmod throw still rolls back
    fs.writeFileSync(spec.path, spec.bytes);
    if (deps.platform !== "win32") fs.chmodSync(spec.path, 0o755);
  }
}

// ------------------------------------------------------------------ runners (production deps)

function realHttpRequest(urlObj, { timeoutMs, maxBytes }) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      urlObj,
      { method: "GET", headers: { "user-agent": "learn-kit-nlm-bridge-installer", accept: "*/*" } },
      (res) => {
        const status = res.statusCode ?? 0;
        // Redirects: hand the status + Location back without reading a body; download() loops.
        if (status >= 300 && status < 400) {
          res.resume();
          resolve({ statusCode: status, headers: res.headers, body: Buffer.alloc(0) });
          return;
        }
        const chunks = [];
        let size = 0;
        res.on("data", (c) => {
          size += c.length;
          if (size > maxBytes) {
            req.destroy(new Error(`response exceeds ${maxBytes} bytes`));
            return;
          }
          chunks.push(c);
        });
        res.on("end", () => resolve({ statusCode: status, headers: res.headers, body: Buffer.concat(chunks) }));
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`request timed out after ${timeoutMs}ms`)));
    req.end();
  });
}

function realRunUv(uvPath, args, { env }) {
  return spawnSync(uvPath, args, { env, encoding: "utf8", timeout: 10 * 60_000, maxBuffer: 64 * 1024 * 1024 });
}

function realRunPython(pythonExe, args, { env }) {
  return spawnSync(pythonExe, args, { env, encoding: "utf8", timeout: 5 * 60_000, maxBuffer: 64 * 1024 * 1024 });
}

/**
 * Resolve uv from PATH ourselves (stdlib, no cross-spawn), record its absolute realpath and exact
 * version, and use that absolute path for every child. A logical `uv` could otherwise resolve to a
 * different binary between resolution and use.
 */
function realResolveUv(env) {
  const isWin = process.platform === "win32";
  const exts = isWin
    ? (env.PATHEXT || ".COM;.EXE;.BAT;.CMD").split(";").map((e) => e.trim()).filter(Boolean)
    : [""];
  const dirs = (env.PATH || "").split(path.delimiter).filter(Boolean);
  let found = null;
  outer: for (const dir of dirs) {
    for (const ext of exts) {
      const candidate = path.join(dir, "uv" + (isWin ? ext : ""));
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        found = candidate;
        break outer;
      }
    }
  }
  if (!found) throw new InstallError("uv was not found on PATH; install uv 0.11.21+ first");
  const real = fs.realpathSync(found);
  const r = spawnSync(real, ["--version"], { encoding: "utf8" });
  const m = /(\d+\.\d+\.\d+)/.exec(r.stdout || "");
  if (!m) throw new InstallError("could not determine uv version");
  return { path: real, version: m[1] };
}

export const PRODUCTION_DEPS = Object.freeze({
  platform: process.platform,
  env: process.env,
  httpRequest: realHttpRequest,
  resolveUv: realResolveUv,
  runUv: realRunUv,
  runPython: realRunPython,
  tmpdir: () => os.tmpdir(),
  installerSource: fileURLToPath(import.meta.url),
});

// ------------------------------------------------------------------ install

function pluginRootFromInstaller(installerSource) {
  // <plugin-root>/scripts/install-nlm-bridge.mjs -> <plugin-root>
  return path.dirname(path.dirname(installerSource));
}

function ensureEmptyPrivateRoot(privateRoot) {
  if (fs.existsSync(privateRoot)) {
    const entries = fs.readdirSync(privateRoot);
    if (entries.length > 0) {
      throw new InstallError(
        `${privateRoot} already exists and is not empty; run 'uninstall' first (there is no --force)`,
      );
    }
  }
}

function rmrf(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}

/** Locate the installed package dir by asking the interpreter, robust across site layouts. */
function installedPackageDir(deps, python, env) {
  const r = deps.runPython(
    python,
    ["-I", "-X", "utf8", "-c", "import learn_kit_nlm_bridge as m,os;print(os.path.dirname(m.__file__))"],
    { env },
  );
  if (r.status !== 0) throw new InstallError(`could not locate the installed package: ${(r.stderr || "").trim()}`);
  return r.stdout.trim();
}

/** Verify the installed _data files against the RECORD, and against the checked-in SHAs. */
function verifyInstalledData(pkgDir, checkedIn) {
  const dataDir = path.join(pkgDir, "_data");
  // Cross-check installed contract bytes reproduce the checked-in SHAs.
  for (const [key, name] of Object.entries(DATA_FILES)) {
    const buf = fs.readFileSync(path.join(dataDir, name));
    const actual = sha256Hex(buf);
    if (actual !== checkedIn.contractShas[key]) {
      throw new InstallError(`installed ${name} sha256 ${actual} != checked-in ${checkedIn.contractShas[key]}`);
    }
  }
  const envLockBuf = fs.readFileSync(path.join(dataDir, "environment-lock.json"));
  if (sha256Hex(envLockBuf) !== checkedIn.environmentSha) {
    throw new InstallError("installed environment-lock.json differs from the checked-in one");
  }

  // RECORD integrity: the four _data files must be listed and match their on-disk bytes.
  const distInfo = path.join(path.dirname(pkgDir), `learn_kit_nlm_bridge-${BRIDGE_VERSION}.dist-info`);
  const recordPath = path.join(distInfo, "RECORD");
  let record;
  try {
    record = fs.readFileSync(recordPath, "utf8");
  } catch (e) {
    throw new InstallError(`cannot read wheel RECORD: ${e.message}`);
  }
  const recorded = new Map();
  for (const line of record.split(/\r?\n/)) {
    if (!line) continue;
    const m = /^(.+?),sha256=([A-Za-z0-9_-]+),(\d+)$/.exec(line);
    if (m) recorded.set(m[1].replace(/\\/g, "/"), { hash: m[2], size: Number(m[3]) });
  }
  for (const name of ["environment-lock.json", ...Object.values(DATA_FILES)]) {
    const key = `learn_kit_nlm_bridge/_data/${name}`;
    const entry = recorded.get(key);
    if (!entry) throw new InstallError(`RECORD is missing ${key}`);
    const buf = fs.readFileSync(path.join(dataDir, name));
    if (buf.length !== entry.size || sha256RecordB64(buf) !== entry.hash) {
      throw new InstallError(`installed ${name} does not match its RECORD entry`);
    }
  }
}

export async function installNlmBridge(opts, deps) {
  const { action } = opts;
  if (action === "status") return statusAction(deps);
  if (action === "uninstall") return uninstallAction(deps);
  if (action !== "install") throw new UsageError(`unknown action: ${JSON.stringify(action)}`);

  validateUrls(opts.wheelUrl, opts.checksumUrl);

  const pluginRoot = pluginRootFromInstaller(deps.installerSource);
  const checkedIn = readCheckedInContract(pluginRoot);

  const { privateRoot, publicBin } = resolveRoots(deps);
  ensureEmptyPrivateRoot(privateRoot);

  // Refuse a shadowing launcher BEFORE touching the filesystem.
  const collisions = detectShimCollisions(deps, { publicBin });
  if (collisions.length) {
    throw new InstallError(`refusing to install — launcher conflict:\n  ${collisions.join("\n  ")}`);
  }

  const uv = deps.resolveUv(deps.env);
  if (uv.version !== "0.11.21") {
    // The lock's contents depend on the resolver; a different uv is a wrong-tooling error.
    throw new InstallError(`this installer pins uv 0.11.21, found ${uv.version}`);
  }

  const stagingDownload = fs.mkdtempSync(path.join(deps.tmpdir(), "lk-nlm-download-"));
  const created = { privateRoot: false, shims: [] };

  try {
    // 1. Download + verify the wheel and checksum. Checksum first so we know the target hash, then
    //    the wheel, then verify the wheel bytes against it.
    const checksumBuf = await download(opts.checksumUrl, { maxBytes: MAX_CHECKSUM_BYTES, label: "checksum" }, deps);
    const wheelSha = parseChecksum(checksumBuf);
    const wheelBuf = await download(opts.wheelUrl, { maxBytes: MAX_WHEEL_BYTES, label: "wheel" }, deps);
    const actualWheelSha = sha256Hex(wheelBuf);
    if (actualWheelSha !== wheelSha) {
      throw new InstallError(`wheel sha256 ${actualWheelSha} != checksum ${wheelSha}`);
    }
    const wheelPath = path.join(stagingDownload, WHEEL_NAME);
    fs.writeFileSync(wheelPath, wheelBuf);

    // 2. Synthesize the ephemeral full lock: the checked-in runtime closure + the verified wheel as
    //    a hashed direct-file requirement. --require-hashes then covers both.
    const ephemeralLock =
      checkedIn.runtimeLockText +
      `learn-kit-nlm-bridge @ ${pathToFileURL(wheelPath).href} \\\n    --hash=sha256:${wheelSha}\n`;
    const ephemeralLockPath = path.join(stagingDownload, "ephemeral-full.lock");
    fs.writeFileSync(ephemeralLockPath, ephemeralLock);

    // 3. Build the private venv and install, all uv children under a fresh, scrubbed env.
    fs.mkdirSync(privateRoot, { recursive: true });
    created.privateRoot = true;
    const cacheDir = path.join(stagingDownload, "uv-cache");
    const uvEnv = buildUvEnv(deps, cacheDir);
    const venv = venvDir(privateRoot, deps.platform);
    const python = venvPython(privateRoot, deps.platform);

    const venvRes = deps.runUv(uv.path, ["venv", "--python", "3.12", "--no-python-downloads", "--no-config", venv], { env: uvEnv });
    if (venvRes.status !== 0) {
      throw new InstallError(`uv venv failed (status ${venvRes.status}): ${(venvRes.stderr || "").trim()}`);
    }
    const installRes = deps.runUv(
      uv.path,
      [
        "pip", "install",
        "--python", python,
        "--require-hashes", "--no-build", "--no-config",
        "--default-index", "https://pypi.org/simple",
        "--index-strategy", "first-index",
        "-r", ephemeralLockPath,
      ],
      { env: uvEnv },
    );
    if (installRes.status !== 0) {
      throw new InstallError(`uv pip install failed (status ${installRes.status}): ${(installRes.stderr || "").trim()}`);
    }

    // 4. Verify the installed environment before writing anything durable.
    const pyVerRes = deps.runPython(python, ["-I", "-X", "utf8", "-c", "import sys;print('.'.join(map(str,sys.version_info[:3])))"], { env: uvEnv });
    if (pyVerRes.status !== 0) throw new InstallError(`could not read the installed Python version: ${(pyVerRes.stderr || "").trim()}`);
    const pythonVersion = pyVerRes.stdout.trim();
    if (!/^3\.12\.\d+$/.test(pythonVersion)) throw new InstallError(`installed Python ${pythonVersion} is not 3.12.x`);

    const pkgDir = installedPackageDir(deps, python, uvEnv);
    verifyInstalledData(pkgDir, checkedIn);

    // 5. Compute shim bytes and assemble the receipt. Receipt is written BEFORE the shims, because
    //    the bridge's own --contract-json (step 7) reads it, and it must be gone on rollback.
    const names = shimNames(deps.platform);
    const shimSpecs = {};
    for (const logical of Object.keys(names)) {
      const bytes = shimBytes(logical, { publicBin, privateRoot, platform: deps.platform });
      shimSpecs[logical] = {
        path: path.join(publicBin, names[logical]),
        target: python,
        bytes,
        sha256: sha256Hex(bytes),
      };
    }

    const installerSourceSha = sha256Hex(fs.readFileSync(deps.installerSource));
    const receipt = {
      format: RECEIPT_FORMAT,
      format_version: RECEIPT_FORMAT_VERSION,
      installer_format: INSTALLER_FORMAT,
      installer_source_sha256: installerSourceSha,
      release_tag: RELEASE_TAG,
      wheel_url: opts.wheelUrl,
      checksum_url: opts.checksumUrl,
      wheel_sha256: wheelSha,
      runtime_lock_sha256: checkedIn.runtimeLockSha,
      build_lock_sha256: checkedIn.buildLockSha,
      uv_path: uv.path,
      uv_version: uv.version,
      python_version: pythonVersion,
      bridge_version: BRIDGE_VERSION,
      connector_version: CONNECTOR_VERSION,
      environment_sha256: checkedIn.environmentSha,
      public_schema_sha256: checkedIn.contractShas.public_tools,
      upstream_schema_sha256: checkedIn.contractShas.upstream_tools,
      auth_guard_sha256: checkedIn.contractShas.upstream_auth_guard,
      private_env: venv,
      shims: {
        "learn-kit-nlm-bridge": {
          path: shimSpecs["learn-kit-nlm-bridge"].path,
          sha256: shimSpecs["learn-kit-nlm-bridge"].sha256,
          target: shimSpecs["learn-kit-nlm-bridge"].target,
        },
        nlm: { path: shimSpecs.nlm.path, sha256: shimSpecs.nlm.sha256, target: shimSpecs.nlm.target },
      },
    };

    const receiptBytes = Buffer.from(canonicalJson(receipt), "utf8");
    const receiptPath = path.join(privateRoot, RECEIPT_NAME);
    const receiptTmp = path.join(privateRoot, `.${RECEIPT_NAME}.tmp`);
    fs.writeFileSync(receiptTmp, receiptBytes);
    fs.renameSync(receiptTmp, receiptPath); // atomic within the same directory
    const receiptSha256 = sha256Hex(receiptBytes);

    // 6. Create the two public shims (idempotent only when byte-identical to what we would write).
    writeShims(shimSpecs, publicBin, deps, created);

    // 7. Final gate: the bridge's own local contract, which re-checks the receipt, closure, and all
    //    five SHAs from the inside. If this fails, the environment is not trustworthy — roll back.
    const contractRes = deps.runPython(python, ["-I", "-X", "utf8", "-m", "learn_kit_nlm_bridge", "--contract-json"], { env: uvEnv });
    if (contractRes.status !== 0) {
      throw new InstallError(`post-install --contract-json failed: ${(contractRes.stderr || "").trim()}`);
    }
    let contract;
    try {
      contract = JSON.parse(contractRes.stdout);
    } catch (e) {
      throw new InstallError(`post-install --contract-json did not return JSON: ${e.message}`);
    }
    for (const [field, expected] of [
      ["install_receipt_sha256", receiptSha256],
      ["environment_sha256", checkedIn.environmentSha],
      ["public_schema_sha256", checkedIn.contractShas.public_tools],
      ["upstream_schema_sha256", checkedIn.contractShas.upstream_tools],
      ["auth_guard_sha256", checkedIn.contractShas.upstream_auth_guard],
      ["python_version", pythonVersion],
    ]) {
      if (contract[field] !== expected) {
        throw new InstallError(`post-install contract ${field} ${contract[field]} != expected ${expected}`);
      }
    }

    return {
      status: "installed",
      receiptPath,
      receiptSha256,
      publicBin,
      shims: receipt.shims,
    };
  } catch (e) {
    // Roll back anything we created: the shims we wrote, then the private root. Never touch a shim
    // we did not create this run.
    for (const p of created.shims) {
      try {
        fs.rmSync(p, { force: true });
      } catch {
        /* best effort */
      }
    }
    if (created.privateRoot) rmrf(privateRoot);
    throw e;
  } finally {
    rmrf(stagingDownload);
  }
}

// ------------------------------------------------------------------ status / uninstall

function loadReceipt(privateRoot) {
  const receiptPath = path.join(privateRoot, RECEIPT_NAME);
  let bytes;
  try {
    bytes = fs.readFileSync(receiptPath);
  } catch {
    return null;
  }
  let receipt;
  try {
    receipt = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new InstallError(`install receipt at ${receiptPath} is not valid JSON`);
  }
  return { receiptPath, bytes, receipt, sha256: sha256Hex(bytes) };
}

function statusAction(deps) {
  const { privateRoot, publicBin } = resolveRoots(deps);
  const loaded = loadReceipt(privateRoot);
  if (!loaded) return { status: "not-installed", publicBin };

  const python = venvPython(privateRoot, deps.platform);
  if (!fs.existsSync(python)) return { status: "broken", receiptPath: loaded.receiptPath, publicBin };

  const cacheDir = path.join(deps.tmpdir(), "lk-nlm-status-cache");
  const uvEnv = buildUvEnv(deps, cacheDir);
  const r = deps.runPython(python, ["-I", "-X", "utf8", "-m", "learn_kit_nlm_bridge", "--contract-json"], { env: uvEnv });
  const ok = r.status === 0;
  return {
    status: ok ? "installed" : "broken",
    receiptPath: loaded.receiptPath,
    receiptSha256: loaded.sha256,
    publicBin,
    shims: loaded.receipt.shims,
  };
}

/**
 * Remove only what this installer owns, and only after proving ownership from the receipt.
 *
 * The private env must be the managed one and contained in the managed private root; each shim must
 * sit in the managed public bin and its on-disk bytes must match the receipt's recorded SHA. A shim
 * whose bytes do not match is left untouched — it belongs to someone else.
 */
function uninstallAction(deps) {
  const { privateRoot, publicBin } = resolveRoots(deps);
  const loaded = loadReceipt(privateRoot);
  if (!loaded) return { status: "not-installed", publicBin };

  const privateRootReal = realpathOrNull(privateRoot);
  const recordedEnv = loaded.receipt.private_env;
  const recordedEnvReal = recordedEnv ? realpathOrNull(recordedEnv) : null;
  if (!privateRootReal || !recordedEnvReal || !isContained(privateRootReal, recordedEnvReal)) {
    throw new InstallError("receipt's private_env is not contained in the managed private root; refusing to uninstall");
  }

  const publicBinReal = realpathOrNull(publicBin);
  const removedShims = [];
  const shims = loaded.receipt.shims ?? {};
  for (const logical of Object.keys(shims)) {
    const spec = shims[logical];
    const shimPath = spec?.path;
    if (typeof shimPath !== "string") continue;
    const shimReal = realpathOrNull(shimPath);
    if (!shimReal || !publicBinReal || path.dirname(shimReal) !== publicBinReal) continue; // not ours
    const bytes = fs.readFileSync(shimReal);
    if (sha256Hex(bytes) !== spec.sha256) continue; // bytes drifted -> someone else's, leave it
    fs.rmSync(shimReal, { force: true });
    removedShims.push(shimPath);
  }

  rmrf(privateRoot);
  return { status: "uninstalled", publicBin, removedShims };
}

// ------------------------------------------------------------------ CLI

function parseArgs(argv) {
  const action = argv[0];
  const opts = { action };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    const need = (name) => {
      const v = argv[++i];
      if (v === undefined) throw new UsageError(`${name} requires a value`);
      return v;
    };
    switch (a) {
      case "--wheel-url":
        opts.wheelUrl = need(a);
        break;
      case "--checksum-url":
        opts.checksumUrl = need(a);
        break;
      default:
        throw new UsageError(`unknown argument: ${a}`);
    }
  }
  if (!action) throw new UsageError("an action is required: install | status | uninstall");
  if (action === "install") {
    if (!opts.wheelUrl) throw new UsageError("install requires --wheel-url");
    if (!opts.checksumUrl) throw new UsageError("install requires --checksum-url");
  }
  return opts;
}

async function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`install-nlm-bridge: ${e.message}\n`);
    return 2;
  }
  try {
    const result = await installNlmBridge(opts, PRODUCTION_DEPS);
    process.stdout.write(JSON.stringify(result) + "\n");
    return 0;
  } catch (e) {
    process.stderr.write(`install-nlm-bridge: ${e.message}\n`);
    return e instanceof UsageError ? 2 : 1;
  }
}

if (process.argv[1] && process.argv[1].endsWith("install-nlm-bridge.mjs")) {
  main(process.argv.slice(2)).then((code) => process.exit(code));
}
