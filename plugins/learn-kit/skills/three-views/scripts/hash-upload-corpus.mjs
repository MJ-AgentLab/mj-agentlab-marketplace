#!/usr/bin/env node
// Upload-corpus staging + hashing helper for the three-views NotebookLM branch (plan §2.5).
//
//   node <skill-dir>/scripts/hash-upload-corpus.mjs --self-check
//   node <skill-dir>/scripts/hash-upload-corpus.mjs --nlm-preflight
//   node <skill-dir>/scripts/hash-upload-corpus.mjs --stage --root <output-dir> --entry foundation=<file.md> [...]
//   node <skill-dir>/scripts/hash-upload-corpus.mjs --verify-manifest <manifest.json> \
//        --expected-manifest-sha256 <hex> --expected-corpus-sha256 <hex>
//   node <skill-dir>/scripts/hash-upload-corpus.mjs --cleanup-manifest <manifest.json> \
//        --expected-manifest-sha256 <hex>
//
// Exit codes: 0 ok | 1 runtime/verification failure | 2 bad arguments or unsafe path.
// stdout carries exactly one JSON document on success; stderr carries diagnostics only.
//
// NODE STDLIB ONLY. This file ships INSIDE the installed plugin, where the repo's devDependencies
// and scripts/run-cli.mjs do not exist. It must never import from outside its own directory.
//
// Why the model must not compute these hashes itself: the corpus hash is bound into the Gate A/B
// consent fingerprint. A guessed or hallucinated SHA-256 would make the consent record meaningless,
// so every value here is produced by reading real bytes off disk.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const MIN_NODE_MAJOR = 22;
const TIERS = ["foundation", "structural", "challenge"]; // canonical order
const STAGING_PREFIX = "learn-kit-upload-";
const MANIFEST_NAME = "manifest.json";
const SENTINEL_NAME = "ownership-sentinel.json";
const FORMAT_VERSION = 1;
const ALGORITHM = "sha256";

class UsageError extends Error {} // -> exit 2
class SafetyError extends Error {} // -> exit 2
class RuntimeError extends Error {} // -> exit 1

// ---------------------------------------------------------------- primitives

/** Deterministic JSON: recursively sorted keys, no incidental whitespace. */
export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
}

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

/**
 * @param {string} version e.g. process.version ("v22.18.0"). Injected by tests.
 * @returns {{ok: boolean, version: string, major: number|null, reason: string}}
 */
export function checkNodePrerequisite(version = process.version) {
  if (typeof version !== "string") throw new UsageError("version must be a string");
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!m) throw new UsageError(`unparseable Node version: ${JSON.stringify(version)}`);
  const major = Number(m[1]);
  if (major < MIN_NODE_MAJOR) {
    return { ok: false, version, major, reason: `Node ${major} < required ${MIN_NODE_MAJOR}` };
  }
  return { ok: true, version, major, reason: "ok" };
}

const toPosix = (p) => p.split(path.sep).join("/");

/** realpath that reports a safety error instead of throwing ENOENT-shaped noise. */
function realpathOrThrow(p, what) {
  try {
    return fs.realpathSync(p);
  } catch {
    throw new SafetyError(`${what} does not resolve: ${p}`);
  }
}

/** True when `child` is inside `parent` after both are realpath-resolved. */
function isContained(parentReal, childReal) {
  const rel = path.relative(parentReal, childReal);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/**
 * Assert a path is a helper-owned staging root: an OS-temp child named learn-kit-upload-*.
 * This is a path / accidental-upload guard only. The same OS user can forge it, so it must never
 * be presented as a trust boundary.
 */
function assertStagingRoot(dirReal) {
  const tmpReal = realpathOrThrow(os.tmpdir(), "os.tmpdir()");
  if (!isContained(tmpReal, dirReal) || dirReal === tmpReal) {
    throw new SafetyError(`staging root is not inside the OS temp dir: ${dirReal}`);
  }
  if (!path.basename(dirReal).startsWith(STAGING_PREFIX)) {
    throw new SafetyError(`staging root is not helper-owned (expected ${STAGING_PREFIX}* ): ${dirReal}`);
  }
  // Exactly one level below temp: refuses ".../tmp/learn-kit-upload-x/nested".
  if (path.dirname(dirReal) !== tmpReal) {
    throw new SafetyError(`staging root must sit directly under the OS temp dir: ${dirReal}`);
  }
}

// ------------------------------------------------------------------ stage

/** corpus hash: tier + normalised original relative path + bytes + file hash. */
function corpusHash(files) {
  return sha256(
    canonicalJson(
      files.map((f) => ({ tier: f.tier, original_path: f.original_path, bytes: f.bytes, sha256: f.sha256 })),
    ),
  );
}

export function stageCorpus({ root, entries }) {
  if (!entries.length) throw new UsageError("--stage requires at least one --entry");

  const seen = new Set();
  for (const e of entries) {
    if (!TIERS.includes(e.tier)) throw new UsageError(`unknown tier "${e.tier}"; expected ${TIERS.join("|")}`);
    if (seen.has(e.tier)) throw new UsageError(`duplicate tier: ${e.tier}`);
    seen.add(e.tier);
  }

  const rootReal = realpathOrThrow(root, "--root");
  if (!fs.statSync(rootReal).isDirectory()) throw new UsageError(`--root is not a directory: ${root}`);

  // Resolve + containment-check every source BEFORE creating anything.
  const resolved = entries.map((e) => {
    if (!e.file.toLowerCase().endsWith(".md")) throw new UsageError(`not a .md file: ${e.file}`);
    const abs = path.resolve(rootReal, e.file);
    const real = realpathOrThrow(abs, `entry ${e.tier}`);
    // realpath first, THEN containment: a symlink pointing outside --root must be rejected.
    if (!isContained(rootReal, real)) {
      throw new SafetyError(`entry ${e.tier} resolves outside --root: ${real}`);
    }
    let st;
    try {
      st = fs.statSync(real);
    } catch {
      throw new RuntimeError(`cannot stat ${real}`);
    }
    if (!st.isFile()) throw new SafetyError(`entry ${e.tier} is not a regular file: ${real}`);
    return { tier: e.tier, real, original_path: toPosix(path.relative(rootReal, real)) };
  });

  resolved.sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier));

  const tmpReal = realpathOrThrow(os.tmpdir(), "os.tmpdir()");
  const stagingRoot = fs.mkdtempSync(path.join(tmpReal, STAGING_PREFIX));

  try {
    const files = [];
    for (const r of resolved) {
      let buf;
      try {
        buf = fs.readFileSync(r.real);
      } catch (e) {
        throw new RuntimeError(`cannot read ${r.real}: ${e.message}`);
      }
      const stagedPath = path.join(stagingRoot, `${r.tier}.md`);
      // Exclusive create: never overwrite anything already at the target.
      fs.writeFileSync(stagedPath, buf, { flag: "wx" });
      try {
        fs.chmodSync(stagedPath, 0o444); // best effort; not a guarantee on Windows
      } catch {
        /* ignore */
      }
      files.push({
        tier: r.tier,
        original_path: r.original_path,
        staged_path: toPosix(stagedPath),
        bytes: buf.length,
        sha256: sha256(buf),
      });
    }

    const nonce = crypto.randomBytes(16).toString("hex");
    const manifest = {
      format: FORMAT_VERSION,
      algorithm: ALGORITHM,
      sentinel_nonce: nonce, // manifest -> sentinel
      staging_root: toPosix(stagingRoot),
      files,
      corpus_sha256: corpusHash(files),
    };
    // manifest_sha256 covers the full canonical manifest and is NOT part of it.
    const manifestSha = sha256(canonicalJson(manifest));

    const manifestPath = path.join(stagingRoot, MANIFEST_NAME);
    fs.writeFileSync(manifestPath, canonicalJson(manifest), { flag: "wx" });
    // sentinel -> manifest, closing the mutual reference.
    fs.writeFileSync(
      path.join(stagingRoot, SENTINEL_NAME),
      canonicalJson({ format: FORMAT_VERSION, nonce, manifest_sha256: manifestSha }),
      { flag: "wx" },
    );

    return {
      algorithm: ALGORITHM,
      manifest_path: toPosix(manifestPath),
      manifest_sha256: manifestSha,
      files,
      corpus_sha256: manifest.corpus_sha256,
    };
  } catch (e) {
    // Never leave a half-built staging root behind.
    try {
      forceRemove(stagingRoot);
    } catch {
      /* ignore */
    }
    throw e;
  }
}

// ----------------------------------------------------------------- verify

/** Load + structurally validate a staging root from its manifest path. */
function loadStaging(manifestPath) {
  const manifestReal = realpathOrThrow(manifestPath, "manifest");
  if (path.basename(manifestReal) !== MANIFEST_NAME) {
    throw new SafetyError(`not a manifest file: ${manifestReal}`);
  }
  const stagingRoot = path.dirname(manifestReal);
  assertStagingRoot(stagingRoot);

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestReal, "utf8"));
  } catch (e) {
    throw new SafetyError(`manifest is not valid JSON: ${e.message}`);
  }
  if (manifest?.format !== FORMAT_VERSION) throw new SafetyError(`unsupported manifest format: ${manifest?.format}`);
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) throw new SafetyError("manifest has no files");

  let sentinel;
  try {
    sentinel = JSON.parse(fs.readFileSync(path.join(stagingRoot, SENTINEL_NAME), "utf8"));
  } catch (e) {
    throw new SafetyError(`ownership sentinel unreadable: ${e.message}`);
  }
  if (sentinel?.format !== FORMAT_VERSION) throw new SafetyError(`unsupported sentinel format: ${sentinel?.format}`);
  // Mutual reference: manifest names the nonce, sentinel names the manifest hash.
  if (sentinel.nonce !== manifest.sentinel_nonce) {
    throw new SafetyError("sentinel nonce does not match the manifest");
  }
  const actualManifestSha = sha256(canonicalJson(manifest));
  if (sentinel.manifest_sha256 !== actualManifestSha) {
    throw new SafetyError("sentinel does not match the manifest content");
  }

  // Bind the manifest to the directory it is actually being read from. Copying a staging root
  // leaves the manifest bytes — and therefore manifest_sha256 and the sentinel — perfectly
  // valid, so hash checks alone cannot notice that every recorded path now describes a DIFFERENT
  // directory. Without this, verify could read one set of files while reporting another.
  if (typeof manifest.staging_root !== "string") throw new SafetyError("manifest has no staging_root");
  const recordedRootReal = realpathOrThrow(manifest.staging_root, "manifest.staging_root");
  if (recordedRootReal !== stagingRoot) {
    throw new SafetyError(`manifest was staged in ${recordedRootReal} but loaded from ${stagingRoot}`);
  }
  return { stagingRoot, manifestReal, manifest, sentinel, actualManifestSha };
}

export function verifyManifest({ manifestPath, expectedManifestSha256, expectedCorpusSha256 }) {
  const { stagingRoot, manifest, actualManifestSha } = loadStaging(manifestPath);

  if (actualManifestSha !== expectedManifestSha256) {
    throw new RuntimeError(`manifest hash mismatch: expected ${expectedManifestSha256}, got ${actualManifestSha}`);
  }

  // Re-read every staged file: the point is to detect a change since staging.
  const files = [];
  for (const f of manifest.files) {
    if (typeof f.staged_path !== "string") throw new SafetyError(`file entry ${f.tier} has no staged_path`);
    // Resolve the RECORDED path, not a basename re-derived from it. The caller uploads from the
    // staged_path this function returns, so the path read+hashed here and the path reported back
    // must be the same file — otherwise verify blesses bytes it never looked at.
    const real = realpathOrThrow(f.staged_path, `staged file ${f.tier}`);
    if (!isContained(stagingRoot, real)) throw new SafetyError(`staged file escapes the staging root: ${real}`);
    if (path.dirname(real) !== stagingRoot) throw new SafetyError(`staged file is not directly in the staging root: ${real}`);
    let buf;
    try {
      buf = fs.readFileSync(real);
    } catch (e) {
      throw new RuntimeError(`cannot re-read staged file ${real}: ${e.message}`);
    }
    if (buf.length !== f.bytes) throw new RuntimeError(`byte-length drift for ${f.tier}: ${buf.length} != ${f.bytes}`);
    const h = sha256(buf);
    if (h !== f.sha256) throw new RuntimeError(`content drift for ${f.tier}: ${h} != ${f.sha256}`);
    // Report the path that was actually read, resolved — never echo back an unverified string.
    files.push({ tier: f.tier, original_path: f.original_path, staged_path: toPosix(real), bytes: f.bytes, sha256: h });
  }

  const actualCorpus = corpusHash(files);
  if (actualCorpus !== manifest.corpus_sha256) {
    throw new RuntimeError(`corpus hash inconsistent with the manifest: ${actualCorpus} != ${manifest.corpus_sha256}`);
  }
  if (actualCorpus !== expectedCorpusSha256) {
    throw new RuntimeError(`corpus hash mismatch: expected ${expectedCorpusSha256}, got ${actualCorpus}`);
  }

  return {
    ok: true,
    algorithm: ALGORITHM,
    manifest_path: toPosix(manifestPath),
    manifest_sha256: actualManifestSha,
    files,
    corpus_sha256: actualCorpus,
  };
}

// ---------------------------------------------------------------- cleanup

function forceRemove(dir) {
  // Staged files are chmod 0444; Windows refuses to unlink a read-only file.
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) forceRemove(p);
    else {
      try {
        fs.chmodSync(p, 0o644);
      } catch {
        /* ignore */
      }
      fs.rmSync(p, { force: true });
    }
  }
  fs.rmdirSync(dir);
}

export function cleanupManifest({ manifestPath, expectedManifestSha256 }) {
  const { stagingRoot, actualManifestSha } = loadStaging(manifestPath);
  if (actualManifestSha !== expectedManifestSha256) {
    // Never widen the deletion: on any doubt keep the directory and let a human look.
    throw new RuntimeError(
      `refusing to delete: manifest hash mismatch (expected ${expectedManifestSha256}, got ${actualManifestSha})`,
    );
  }
  assertStagingRoot(stagingRoot); // re-assert immediately before rm
  forceRemove(stagingRoot);
  return { ok: true, removed: toPosix(stagingRoot) };
}

// ------------------------------------------------------------- preflight

/**
 * Local-only NotebookLM prerequisite check.
 *
 * NOTE (increment boundary): the full contract — receipt-owned canonical shims in the fixed
 * public bin, PATHEXT/.ps1 shadowing checks, absolute-uv and receipt-bound-Python module
 * invocations, and the five SHA fingerprints (install-receipt / environment / public-schema /
 * upstream-schema / auth-guard) — lands together with the bridge package, which defines the
 * receipt format those checks read. Until then this FAILS CLOSED: with no bridge installed the
 * only correct answer is "optional component unavailable, revoke the NLM selection", which is
 * exactly what it returns. It can only ever become more permissive once the real checks exist.
 */
export function nlmPreflight({ env = process.env, nodeVersion = process.version } = {}) {
  const node = checkNodePrerequisite(nodeVersion);
  if (!node.ok) return { ok: false, reason: "NODE_TOO_OLD", detail: node.reason };

  const publicBin =
    process.platform === "win32"
      ? path.join(env.LOCALAPPDATA ?? "", "MJ-AgentLab", "bin")
      : path.join(env.XDG_BIN_HOME ?? path.join(env.HOME ?? "", ".local", "bin"));

  const shim = path.join(publicBin, process.platform === "win32" ? "learn-kit-nlm-bridge.cmd" : "learn-kit-nlm-bridge");
  if (!fs.existsSync(shim)) {
    return {
      ok: false,
      reason: "NLM_BRIDGE_NOT_INSTALLED",
      detail: `no receipt-owned bridge shim at ${toPosix(shim)}`,
      public_bin: toPosix(publicBin),
    };
  }
  // A shim exists but the receipt/contract verification is not implemented yet: fail closed
  // rather than imply the contract was checked.
  return {
    ok: false,
    reason: "CONTRACT_VERIFICATION_UNAVAILABLE",
    detail:
      "bridge shim found, but receipt/contract verification lands with the bridge package; refusing to report a pass",
    public_bin: toPosix(publicBin),
  };
}

// ------------------------------------------------------------------ CLI

function parseArgs(argv) {
  const modes = ["--self-check", "--nlm-preflight", "--stage", "--verify-manifest", "--cleanup-manifest"];
  const found = argv.filter((a) => modes.includes(a));
  if (found.length === 0) throw new UsageError(`exactly one mode required: ${modes.join(" | ")}`);
  if (found.length > 1) throw new UsageError(`modes are mutually exclusive; got ${found.join(" ")}`);
  const mode = found[0];

  const opts = { mode, entries: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const need = (name) => {
      const v = argv[++i];
      if (v === undefined) throw new UsageError(`${name} requires a value`);
      return v;
    };
    switch (a) {
      case "--self-check":
      case "--nlm-preflight":
      case "--stage":
        break;
      case "--verify-manifest":
      case "--cleanup-manifest":
        opts.manifestPath = need(a);
        break;
      case "--root":
        opts.root = need(a);
        break;
      case "--entry": {
        const v = need(a);
        const eq = v.indexOf("=");
        if (eq <= 0) throw new UsageError(`--entry must be tier=path, got ${JSON.stringify(v)}`);
        opts.entries.push({ tier: v.slice(0, eq), file: v.slice(eq + 1) });
        break;
      }
      case "--expected-manifest-sha256":
        opts.expectedManifestSha256 = need(a);
        break;
      case "--expected-corpus-sha256":
        opts.expectedCorpusSha256 = need(a);
        break;
      default:
        throw new UsageError(`unknown argument: ${a}`);
    }
  }
  return opts;
}

const isHex64 = (s) => typeof s === "string" && /^[0-9a-f]{64}$/.test(s);

export function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`hash-upload-corpus: ${e.message}\n`);
    return 2;
  }

  try {
    switch (opts.mode) {
      case "--self-check": {
        const r = checkNodePrerequisite();
        if (!r.ok) {
          process.stderr.write(`hash-upload-corpus: ${r.reason}\n`);
          return 1;
        }
        process.stdout.write(JSON.stringify({ ok: true, node: r.version }) + "\n");
        return 0;
      }
      case "--nlm-preflight": {
        const r = nlmPreflight();
        if (!r.ok) {
          process.stderr.write(`hash-upload-corpus: NLM prerequisite unavailable: ${r.reason} — ${r.detail}\n`);
          return 1;
        }
        process.stdout.write(JSON.stringify(r) + "\n");
        return 0;
      }
      case "--stage": {
        if (!opts.root) throw new UsageError("--stage requires --root");
        process.stdout.write(JSON.stringify(stageCorpus({ root: opts.root, entries: opts.entries })) + "\n");
        return 0;
      }
      case "--verify-manifest": {
        if (!isHex64(opts.expectedManifestSha256)) throw new UsageError("--expected-manifest-sha256 must be 64 lowercase hex chars");
        if (!isHex64(opts.expectedCorpusSha256)) throw new UsageError("--expected-corpus-sha256 must be 64 lowercase hex chars");
        process.stdout.write(JSON.stringify(verifyManifest(opts)) + "\n");
        return 0;
      }
      case "--cleanup-manifest": {
        if (!isHex64(opts.expectedManifestSha256)) throw new UsageError("--expected-manifest-sha256 must be 64 lowercase hex chars");
        process.stdout.write(JSON.stringify(cleanupManifest(opts)) + "\n");
        return 0;
      }
      default:
        throw new UsageError(`unhandled mode ${opts.mode}`);
    }
  } catch (e) {
    process.stderr.write(`hash-upload-corpus: ${e.message}\n`);
    if (e instanceof UsageError || e instanceof SafetyError) return 2;
    return 1;
  }
}

if (process.argv[1]?.endsWith("hash-upload-corpus.mjs")) {
  process.exit(main(process.argv.slice(2)));
}
