// Tests for plugins/learn-kit/skills/three-views/scripts/hash-upload-corpus.mjs
//
// The helper ships inside the installed plugin and may only use Node stdlib, so these tests
// import it directly rather than through any repo-level wrapper.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  checkNodePrerequisite,
  canonicalJson,
  stageCorpus,
  verifyManifest,
  cleanupManifest,
  nlmPreflight,
  winShimPathUnsafe,
  main,
} from "../plugins/learn-kit/skills/three-views/scripts/hash-upload-corpus.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HELPER = path.join(REPO, "plugins/learn-kit/skills/three-views/scripts/hash-upload-corpus.mjs");

/** An output dir holding generated tier markdown, like Step 3 would leave behind. */
function makeOutput(contents = { foundation: "# F\n", structural: "# S\n", challenge: "# C\n" }) {
  const d = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "lk-output-"));
  for (const [tier, body] of Object.entries(contents)) fs.writeFileSync(path.join(d, `${tier}.md`), body);
  return d;
}

const entriesFor = (tiers) => tiers.map((t) => ({ tier: t, file: `${t}.md` }));

const cleanupTracked = [];
function track(dir) {
  cleanupTracked.push(dir);
  return dir;
}
test.after(() => {
  for (const d of cleanupTracked) {
    try {
      for (const f of fs.readdirSync(d)) {
        try {
          fs.chmodSync(path.join(d, f), 0o644);
        } catch {}
      }
      fs.rmSync(d, { recursive: true, force: true });
    } catch {}
  }
});

/** Stage and register the staging root for teardown. */
function stage(root, tiers) {
  const r = stageCorpus({ root, entries: entriesFor(tiers) });
  track(path.dirname(r.manifest_path));
  return r;
}

// -------------------------------------------------------- Node prerequisite
test("checkNodePrerequisite accepts an injected version string", () => {
  assert.equal(checkNodePrerequisite("v22.18.0").ok, true);
  assert.equal(checkNodePrerequisite("v22.0.0").major, 22);
  assert.equal(checkNodePrerequisite("v24.1.0").ok, true);
});

test("checkNodePrerequisite rejects Node 21 and below", () => {
  const r = checkNodePrerequisite("v21.7.3");
  assert.equal(r.ok, false);
  assert.equal(r.major, 21);
  assert.match(r.reason, /21 < required 22/);
});

test("checkNodePrerequisite throws on an unparseable version", () => {
  assert.throws(() => checkNodePrerequisite("banana"));
  assert.throws(() => checkNodePrerequisite(22));
});

test("--self-check succeeds on the current runtime and emits one JSON line", () => {
  // This suite cannot run at all below Node 22, so the live check must pass here.
  assert.equal(checkNodePrerequisite().ok, true);
  assert.equal(main(["--self-check"]), 0);
});

// -------------------------------------------------------------- canonicalJson
test("canonicalJson sorts keys recursively and is stable", () => {
  assert.equal(canonicalJson({ b: 1, a: 2 }), '{"a":2,"b":1}');
  assert.equal(canonicalJson({ z: { y: 1, x: 2 } }), '{"z":{"x":2,"y":1}}');
  assert.equal(canonicalJson([{ b: 1, a: 2 }]), '[{"a":2,"b":1}]');
  // Key insertion order must not change the output.
  const a = { one: 1, two: [{ q: 1, p: 2 }] };
  const b = { two: [{ p: 2, q: 1 }], one: 1 };
  assert.equal(canonicalJson(a), canonicalJson(b));
});

// --------------------------------------------------------------------- stage
test("stage produces canonical tier order regardless of --entry order", () => {
  const out = track(makeOutput());
  const r = stage(out, ["challenge", "foundation", "structural"]);
  assert.deepEqual(
    r.files.map((f) => f.tier),
    ["foundation", "structural", "challenge"],
  );
});

test("stage copies real bytes and reports their true hash", () => {
  const out = track(makeOutput({ foundation: "# hello\n" }));
  const r = stage(out, ["foundation"]);
  const expected = crypto.createHash("sha256").update("# hello\n").digest("hex");
  assert.equal(r.files[0].sha256, expected);
  assert.equal(r.files[0].bytes, Buffer.byteLength("# hello\n"));
  assert.equal(fs.readFileSync(r.files[0].staged_path, "utf8"), "# hello\n");
});

test("staged copies live in an OS-temp learn-kit-upload-* root, not in --root", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const stagingRoot = path.dirname(r.manifest_path);
  assert.match(path.basename(stagingRoot), /^learn-kit-upload-/);
  assert.equal(path.dirname(fs.realpathSync(stagingRoot)), fs.realpathSync(os.tmpdir()));
  assert.ok(!fs.realpathSync(stagingRoot).startsWith(fs.realpathSync(out)));
});

test("stage is deterministic for identical content but uses a fresh root each time", () => {
  const out = track(makeOutput());
  const a = stage(out, ["foundation", "structural"]);
  const b = stage(out, ["foundation", "structural"]);
  assert.equal(a.corpus_sha256, b.corpus_sha256, "same bytes -> same corpus hash");
  assert.notEqual(a.manifest_path, b.manifest_path, "each run gets its own staging root");
  // ...but the manifests differ, because each carries a fresh sentinel nonce.
  assert.notEqual(a.manifest_sha256, b.manifest_sha256);
});

test("corpus hash changes when any tier's content changes", () => {
  const out1 = track(makeOutput({ foundation: "# a\n" }));
  const out2 = track(makeOutput({ foundation: "# b\n" }));
  assert.notEqual(stage(out1, ["foundation"]).corpus_sha256, stage(out2, ["foundation"]).corpus_sha256);
});

test("corpus hash changes when the tier SET changes", () => {
  const out = track(makeOutput());
  const one = stage(out, ["foundation"]);
  const two = stage(out, ["foundation", "structural"]);
  assert.notEqual(one.corpus_sha256, two.corpus_sha256);
});

test("manifest_sha256 covers the manifest and does not include itself", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const raw = JSON.parse(fs.readFileSync(r.manifest_path, "utf8"));
  assert.ok(!("manifest_sha256" in raw), "manifest must not contain its own hash");
  const recomputed = crypto.createHash("sha256").update(canonicalJson(raw)).digest("hex");
  assert.equal(recomputed, r.manifest_sha256);
});

test("manifest and sentinel reference each other", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const root = path.dirname(r.manifest_path);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  const sentinel = JSON.parse(fs.readFileSync(path.join(root, "ownership-sentinel.json"), "utf8"));
  assert.equal(manifest.sentinel_nonce, sentinel.nonce, "manifest -> sentinel");
  assert.equal(sentinel.manifest_sha256, r.manifest_sha256, "sentinel -> manifest");
});

test("stage rejects a duplicate tier by the guard, not by an incidental filesystem error", () => {
  // Two entries for one tier would collide on the same <tier>.md target, so an exclusive-create
  // EPERM/EEXIST would ALSO throw — and the test would pass without the guard existing. Assert
  // the guard's own message so it cannot pass for the wrong reason.
  const out = track(makeOutput());
  assert.throws(
    () =>
      stageCorpus({
        root: out,
        entries: [{ tier: "foundation", file: "foundation.md" }, { tier: "foundation", file: "foundation.md" }],
      }),
    /duplicate tier: foundation/,
  );
  // Same tier via two DIFFERENT source files: no filesystem collision is possible here, so only
  // the duplicate guard can reject it.
  fs.writeFileSync(path.join(out, "other.md"), "# other\n");
  assert.throws(
    () =>
      stageCorpus({
        root: out,
        entries: [{ tier: "foundation", file: "foundation.md" }, { tier: "foundation", file: "other.md" }],
      }),
    /duplicate tier: foundation/,
  );
});

test("stage rejects an unknown tier", () => {
  const out = track(makeOutput());
  assert.throws(() => stageCorpus({ root: out, entries: [{ tier: "advanced", file: "foundation.md" }] }), /unknown tier "advanced"/);
});

test("stage validates tiers before creating any staging root", () => {
  const out = track(makeOutput());
  const before = fs.readdirSync(fs.realpathSync(os.tmpdir())).filter((n) => n.startsWith("learn-kit-upload-"));
  assert.throws(() => stageCorpus({ root: out, entries: [{ tier: "advanced", file: "foundation.md" }] }));
  const after = fs.readdirSync(fs.realpathSync(os.tmpdir())).filter((n) => n.startsWith("learn-kit-upload-"));
  assert.deepEqual(after, before, "argument validation must not leave a staging root behind");
});

test("stage rejects a non-.md file", () => {
  const out = track(makeOutput());
  fs.writeFileSync(path.join(out, "notes.txt"), "x");
  assert.throws(() => stageCorpus({ root: out, entries: [{ tier: "foundation", file: "notes.txt" }] }));
});

test("stage rejects a missing file", () => {
  const out = track(makeOutput());
  assert.throws(() => stageCorpus({ root: out, entries: [{ tier: "foundation", file: "absent.md" }] }));
});

test("stage rejects an entry escaping --root via ..", () => {
  const out = track(makeOutput());
  const outside = track(makeOutput({ foundation: "# secret\n" }));
  const rel = path.relative(out, path.join(outside, "foundation.md"));
  assert.throws(() => stageCorpus({ root: out, entries: [{ tier: "foundation", file: rel }] }), /outside --root|does not resolve/);
});

test("stage rejects a symlink pointing outside --root", (t) => {
  const out = track(makeOutput());
  const outside = track(makeOutput({ foundation: "# secret\n" }));
  const link = path.join(out, "linked.md");
  try {
    fs.symlinkSync(path.join(outside, "foundation.md"), link);
  } catch {
    // Windows without Developer Mode cannot create symlinks unprivileged.
    t.skip("symlink creation not permitted on this host");
    return;
  }
  // realpath happens BEFORE containment, so the link's target is what gets checked.
  assert.throws(() => stageCorpus({ root: out, entries: [{ tier: "foundation", file: "linked.md" }] }), /outside --root/);
});

test("stage leaves no staging root behind when it fails AFTER the root is created", () => {
  // A missing file is rejected during pre-resolution, before mkdtemp — so that case never
  // exercises the try/catch cleanup handler at all. To reach it, the failure must happen while
  // copying: make the second source vanish between resolution and read.
  const out = track(makeOutput({ foundation: "# f\n", structural: "# s\n" }));
  const before = fs.readdirSync(fs.realpathSync(os.tmpdir())).filter((n) => n.startsWith("learn-kit-upload-"));

  const realRead = fs.readFileSync;
  let calls = 0;
  fs.readFileSync = function (p, ...rest) {
    // Fail on the SECOND staged copy, i.e. after mkdtemp has already created the root.
    if (typeof p === "string" && p.endsWith("structural.md") && ++calls >= 1) {
      const e = new Error("ENOENT: simulated disappearance");
      e.code = "ENOENT";
      throw e;
    }
    return realRead.call(this, p, ...rest);
  };
  try {
    assert.throws(
      () =>
        stageCorpus({
          root: out,
          entries: [{ tier: "foundation", file: "foundation.md" }, { tier: "structural", file: "structural.md" }],
        }),
      /cannot read/,
      "must fail during the copy phase, i.e. after mkdtemp",
    );
  } finally {
    fs.readFileSync = realRead;
  }

  const after = fs.readdirSync(fs.realpathSync(os.tmpdir())).filter((n) => n.startsWith("learn-kit-upload-"));
  assert.deepEqual(after, before, "the cleanup handler must remove the half-built staging root");
});

test("stage rejects a missing file before creating a staging root", () => {
  const out = track(makeOutput({ foundation: "# f\n" }));
  const before = fs.readdirSync(fs.realpathSync(os.tmpdir())).filter((n) => n.startsWith("learn-kit-upload-"));
  assert.throws(() =>
    stageCorpus({ root: out, entries: [{ tier: "foundation", file: "foundation.md" }, { tier: "structural", file: "missing.md" }] }),
  );
  const after = fs.readdirSync(fs.realpathSync(os.tmpdir())).filter((n) => n.startsWith("learn-kit-upload-"));
  assert.deepEqual(after, before, "no staging root should ever have been created");
});

// -------------------------------------------------------------------- verify
test("verify passes for a freshly staged corpus", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation", "structural", "challenge"]);
  const v = verifyManifest({
    manifestPath: r.manifest_path,
    expectedManifestSha256: r.manifest_sha256,
    expectedCorpusSha256: r.corpus_sha256,
  });
  assert.equal(v.ok, true);
  assert.equal(v.corpus_sha256, r.corpus_sha256);
});

test("verify fails when a staged byte changes after staging", () => {
  // This is the whole point: the upload corpus must be frozen once consent is bound to it.
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const staged = r.files[0].staged_path;
  fs.chmodSync(staged, 0o644);
  fs.writeFileSync(staged, "# tampered\n");
  assert.throws(
    () =>
      verifyManifest({
        manifestPath: r.manifest_path,
        expectedManifestSha256: r.manifest_sha256,
        expectedCorpusSha256: r.corpus_sha256,
      }),
    /content drift|byte-length drift/,
  );
});

test("verify detects a SAME-LENGTH content change (not just a length change)", () => {
  // A length-only check would pass this. Only the per-file sha256 comparison catches it, so
  // without this case that comparison is unproven.
  const out = track(makeOutput({ foundation: "# aaaa\n" }));
  const r = stage(out, ["foundation"]);
  const staged = r.files[0].staged_path;
  fs.chmodSync(staged, 0o644);
  fs.writeFileSync(staged, "# bbbb\n"); // identical byte length
  assert.equal(fs.statSync(staged).size, r.files[0].bytes, "precondition: length is unchanged");
  assert.throws(
    () =>
      verifyManifest({
        manifestPath: r.manifest_path,
        expectedManifestSha256: r.manifest_sha256,
        expectedCorpusSha256: r.corpus_sha256,
      }),
    /content drift/,
  );
});

test("verify enforces the sentinel nonce cross-check on READ, not just on write", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const root = path.dirname(r.manifest_path);
  const sentinelPath = path.join(root, "ownership-sentinel.json");
  const s = JSON.parse(fs.readFileSync(sentinelPath, "utf8"));
  s.nonce = "f".repeat(32); // manifest still names the original nonce
  fs.writeFileSync(sentinelPath, canonicalJson(s));
  assert.throws(
    () =>
      verifyManifest({
        manifestPath: r.manifest_path,
        expectedManifestSha256: r.manifest_sha256,
        expectedCorpusSha256: r.corpus_sha256,
      }),
    /sentinel nonce does not match/,
  );
});

test("loadStaging rejects a wrong format version and an empty file list", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const root = path.dirname(r.manifest_path);

  const rewrite = (mutate) => {
    const m = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
    mutate(m);
    const sha = crypto.createHash("sha256").update(canonicalJson(m)).digest("hex");
    fs.writeFileSync(path.join(root, "manifest.json"), canonicalJson(m));
    // Keep the sentinel consistent so the format/empty rule is what fires, not the hash rule.
    fs.writeFileSync(
      path.join(root, "ownership-sentinel.json"),
      canonicalJson({ format: 1, nonce: m.sentinel_nonce, manifest_sha256: sha }),
    );
    return sha;
  };

  let sha = rewrite((m) => {
    m.format = 99;
  });
  assert.throws(() => verifyManifest({ manifestPath: r.manifest_path, expectedManifestSha256: sha, expectedCorpusSha256: r.corpus_sha256 }), /unsupported manifest format/);

  sha = rewrite((m) => {
    m.format = 1;
    m.files = [];
  });
  assert.throws(() => verifyManifest({ manifestPath: r.manifest_path, expectedManifestSha256: sha, expectedCorpusSha256: r.corpus_sha256 }), /manifest has no files/);
});

test("verify fails on an expected-hash mismatch", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const wrong = "0".repeat(64);
  assert.throws(() => verifyManifest({ manifestPath: r.manifest_path, expectedManifestSha256: wrong, expectedCorpusSha256: r.corpus_sha256 }), /manifest hash mismatch/);
  assert.throws(() => verifyManifest({ manifestPath: r.manifest_path, expectedManifestSha256: r.manifest_sha256, expectedCorpusSha256: wrong }), /corpus hash mismatch/);
});

test("verify rejects a tampered manifest (sentinel no longer matches)", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const m = JSON.parse(fs.readFileSync(r.manifest_path, "utf8"));
  m.files[0].sha256 = "1".repeat(64);
  fs.writeFileSync(r.manifest_path, canonicalJson(m));
  assert.throws(() => verifyManifest({ manifestPath: r.manifest_path, expectedManifestSha256: r.manifest_sha256, expectedCorpusSha256: r.corpus_sha256 }), /sentinel does not match/);
});

test("verify rejects a manifest outside the helper-owned staging root", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const elsewhere = track(fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "not-staging-")));
  fs.copyFileSync(r.manifest_path, path.join(elsewhere, "manifest.json"));
  assert.throws(() => verifyManifest({ manifestPath: path.join(elsewhere, "manifest.json"), expectedManifestSha256: r.manifest_sha256, expectedCorpusSha256: r.corpus_sha256 }), /not helper-owned/);
});

test("verify rejects a path that is not a manifest.json", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  assert.throws(() => verifyManifest({ manifestPath: r.files[0].staged_path, expectedManifestSha256: r.manifest_sha256, expectedCorpusSha256: r.corpus_sha256 }), /not a manifest file/);
});

// ------------------------------------------------------------------- cleanup
test("cleanup removes only the matching helper-owned staging root", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation", "structural"]);
  const root = path.dirname(r.manifest_path);
  assert.ok(fs.existsSync(root));
  const res = cleanupManifest({ manifestPath: r.manifest_path, expectedManifestSha256: r.manifest_sha256 });
  assert.equal(res.ok, true);
  assert.ok(!fs.existsSync(root), "staging root removed");
  assert.ok(fs.existsSync(path.join(out, "foundation.md")), "original outputs preserved");
});

test("cleanup refuses on a hash mismatch and keeps the directory", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const root = path.dirname(r.manifest_path);
  assert.throws(() => cleanupManifest({ manifestPath: r.manifest_path, expectedManifestSha256: "0".repeat(64) }), /refusing to delete/);
  assert.ok(fs.existsSync(root), "directory kept for human inspection");
});

test("cleanup refuses an arbitrary directory", () => {
  const elsewhere = track(fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "victim-")));
  fs.writeFileSync(path.join(elsewhere, "manifest.json"), canonicalJson({ format: 1, files: [] }));
  assert.throws(() => cleanupManifest({ manifestPath: path.join(elsewhere, "manifest.json"), expectedManifestSha256: "0".repeat(64) }), /not helper-owned/);
  assert.ok(fs.existsSync(elsewhere), "must not delete a non-staging directory");
});

// assertStagingRoot has three independent rules; each is the sole guard on the only destructive
// code path in the helper, so each needs its own case.
test("cleanup refuses a learn-kit-upload-* directory OUTSIDE the OS temp dir", () => {
  // Correct name, wrong location: only the "inside os.tmpdir()" rule can reject this.
  const outsideParent = track(fs.mkdtempSync(path.join(fs.realpathSync(process.cwd()), "outside-tmp-")));
  const forged = path.join(outsideParent, "learn-kit-upload-forged");
  fs.mkdirSync(forged);
  fs.writeFileSync(path.join(forged, "manifest.json"), canonicalJson({ format: 1, files: [] }));
  assert.throws(
    () => cleanupManifest({ manifestPath: path.join(forged, "manifest.json"), expectedManifestSha256: "0".repeat(64) }),
    /not inside the OS temp dir/,
  );
  assert.ok(fs.existsSync(forged), "must not delete a directory outside OS temp");
});

test("cleanup refuses a nested learn-kit-upload-* directory", () => {
  // Correct name, inside temp, but not a DIRECT child: only the depth rule rejects this.
  const parent = track(fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "nest-")));
  const nested = path.join(parent, "learn-kit-upload-nested");
  fs.mkdirSync(nested);
  fs.writeFileSync(path.join(nested, "manifest.json"), canonicalJson({ format: 1, files: [] }));
  assert.throws(
    () => cleanupManifest({ manifestPath: path.join(nested, "manifest.json"), expectedManifestSha256: "0".repeat(64) }),
    /directly under the OS temp dir/,
  );
  assert.ok(fs.existsSync(nested), "must not delete a nested directory");
});

test("verify binds the manifest to the directory it is read from (a copied root is rejected)", () => {
  // Copying a staging root leaves manifest bytes — and thus manifest_sha256 and the sentinel —
  // perfectly valid, so hash checks alone cannot notice the recorded paths now describe a
  // DIFFERENT directory. Without the staging_root binding, verify reads one set of files while
  // reporting another.
  const out = track(makeOutput({ foundation: "# REAL\n" }));
  const r = stage(out, ["foundation"]);
  const clone = track(fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "learn-kit-upload-")));
  for (const f of fs.readdirSync(path.dirname(r.manifest_path))) {
    fs.copyFileSync(path.join(path.dirname(r.manifest_path), f), path.join(clone, f));
  }
  assert.throws(
    () =>
      verifyManifest({
        manifestPath: path.join(clone, "manifest.json"),
        expectedManifestSha256: r.manifest_sha256,
        expectedCorpusSha256: r.corpus_sha256,
      }),
    /was staged in .* but loaded from/,
  );
});

test("verify reports only paths it actually read", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation", "structural"]);
  const v = verifyManifest({
    manifestPath: r.manifest_path,
    expectedManifestSha256: r.manifest_sha256,
    expectedCorpusSha256: r.corpus_sha256,
  });
  for (const f of v.files) {
    const real = fs.realpathSync(f.staged_path);
    assert.equal(
      crypto.createHash("sha256").update(fs.readFileSync(real)).digest("hex"),
      f.sha256,
      `${f.tier}: the reported staged_path must hold the reported hash`,
    );
  }
});

// ----------------------------------------------------------------- preflight

// The exact 12-key fingerprint the skill binds into the Gate A/B consent record (SKILL.md 5B.2).
// Hardcoded here as an independent SSOT: if the helper's projection list drifts, this catches it.
const FP_KEYS = [
  "bridge_version",
  "connector_version",
  "python_version",
  "install_receipt_sha256",
  "environment_sha256",
  "public_schema_sha256",
  "upstream_schema_sha256",
  "auth_guard_sha256",
  "base_url",
  "transport",
  "tools",
  "instructions_policy",
];

/** A well-formed `--contract-json` payload; override any field to force a fail-closed path. */
function validContract(overrides = {}) {
  return {
    bridge_version: "4.0.0",
    connector_version: "0.8.7",
    python_version: "3.12.13",
    install_receipt_sha256: "a".repeat(64),
    environment_sha256: "b".repeat(64),
    public_schema_sha256: "c".repeat(64),
    upstream_schema_sha256: "d".repeat(64),
    auth_guard_sha256: "e".repeat(64),
    base_url: "https://notebooklm.google.com",
    transport: "stdio",
    tools: [{ name: "notebook_list" }, { name: "notebook_get" }],
    instructions_policy: "prompt-user-only",
    ...overrides,
  };
}

/** A public bin holding a real dummy shim at the platform-derived path (so existsSync passes). */
function fakeBridgeBin(platform) {
  const parent = track(fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "fake-bin-")));
  const binDir = platform === "win32" ? path.join(parent, "MJ-AgentLab", "bin") : parent;
  fs.mkdirSync(binDir, { recursive: true });
  const shimPath = path.join(binDir, platform === "win32" ? "learn-kit-nlm-bridge.cmd" : "learn-kit-nlm-bridge");
  fs.writeFileSync(shimPath, "dummy");
  const env = platform === "win32" ? { LOCALAPPDATA: parent } : { XDG_BIN_HOME: parent };
  return { env, shimPath };
}

/** A fake spawn returning `result`, recording every call so argv can be asserted. */
function capturingSpawn(result) {
  const calls = [];
  return { spawn: (command, args, options) => (calls.push({ command, args, options }), result), calls };
}

const okStdout = (contract = validContract()) => ({ status: 0, stdout: JSON.stringify(contract), stderr: "" });

test("preflight fails closed when no bridge is installed", () => {
  const r = nlmPreflight({ platform: "linux", env: { XDG_BIN_HOME: path.join(os.tmpdir(), "nonexistent-" + Date.now()) } });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "NLM_BRIDGE_NOT_INSTALLED");
});

test("preflight fails closed on an old Node even before touching the filesystem", () => {
  const r = nlmPreflight({ nodeVersion: "v21.0.0" });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "NODE_TOO_OLD");
});

test("preflight returns ok with exactly the fingerprint when the bridge contract passes", () => {
  const { env } = fakeBridgeBin("linux");
  const contract = validContract({ install_receipt_sha256: "1".repeat(64) });
  const r = nlmPreflight({ platform: "linux", env, spawn: () => okStdout(contract) });
  assert.equal(r.ok, true);
  // Non-vacuous: surfaces the REAL SHA off the contract, not a stub.
  assert.equal(r.install_receipt_sha256, "1".repeat(64));
  // The projection is a whitelist: exactly ok + the 12 keys, nothing more, nothing less.
  assert.deepEqual(Object.keys(r).sort(), ["ok", ...FP_KEYS].sort());
});

test("preflight drops any extra key the bridge prints (no leak into the consent record)", () => {
  const { env } = fakeBridgeBin("linux");
  const contract = validContract({ secret_cookie: "leak", protocol: "2025-06-18" });
  const r = nlmPreflight({ platform: "linux", env, spawn: () => okStdout(contract) });
  assert.equal(r.ok, true);
  assert.equal(r.secret_cookie, undefined, "must not surface an un-whitelisted key");
  assert.equal(r.protocol, undefined);
});

test("preflight (posix) spawns the shim directly with --contract-json", () => {
  const { env, shimPath } = fakeBridgeBin("linux");
  const { spawn, calls } = capturingSpawn(okStdout());
  const r = nlmPreflight({ platform: "linux", env, spawn });
  assert.equal(r.ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].command, shimPath);
  assert.deepEqual(calls[0].args, ["--contract-json"]);
  assert.equal(calls[0].options.shell, false);
  assert.notEqual(calls[0].options.windowsVerbatimArguments, true);
});

test("preflight (win32) invokes ComSpec with the verbatim quoted /d /s /c tail", () => {
  const { env, shimPath } = fakeBridgeBin("win32");
  const { spawn, calls } = capturingSpawn(okStdout());
  const r = nlmPreflight({ platform: "win32", env, spawn });
  assert.equal(r.ok, true);
  assert.equal(calls[0].command, process.env.ComSpec || "cmd.exe");
  assert.deepEqual(calls[0].args, ["/d", "/s", "/c", `""${shimPath}" --contract-json"`]);
  assert.equal(calls[0].options.windowsVerbatimArguments, true);
  assert.equal(calls[0].options.shell, false);
});

test("preflight fails closed when the bridge contract exits non-zero", () => {
  const { env } = fakeBridgeBin("linux");
  const r = nlmPreflight({ platform: "linux", env, spawn: () => ({ status: 3, stdout: "", stderr: "install receipt: environment SHA drift\n" }) });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "CONTRACT_CHECK_FAILED");
  assert.equal(r.exit_status, 3, "must read and surface the real exit status");
});

test("preflight fails closed on unparseable / non-object contract output", () => {
  const { env } = fakeBridgeBin("linux");
  assert.equal(nlmPreflight({ platform: "linux", env, spawn: () => ({ status: 0, stdout: "not json{" }) }).reason, "CONTRACT_UNPARSEABLE");
  assert.equal(nlmPreflight({ platform: "linux", env, spawn: () => ({ status: 0, stdout: "[1,2,3]" }) }).reason, "CONTRACT_UNPARSEABLE");
  assert.equal(nlmPreflight({ platform: "linux", env, spawn: () => ({ status: 0, stdout: "null" }) }).reason, "CONTRACT_UNPARSEABLE");
});

test("preflight fails closed when ANY fingerprint key is missing (all 12 required)", () => {
  const { env } = fakeBridgeBin("linux");
  for (const key of FP_KEYS) {
    const c = validContract();
    delete c[key];
    const r = nlmPreflight({ platform: "linux", env, spawn: () => okStdout(c) });
    assert.equal(r.ok, false, `missing ${key} must fail closed`);
    assert.equal(r.reason, "CONTRACT_INCOMPLETE", `missing ${key} -> CONTRACT_INCOMPLETE`);
    assert.ok(r.detail.includes(key), `detail must name the missing key ${key}, got: ${r.detail}`);
  }
});

test("preflight fails closed when a SHA field is not 64 lowercase hex", () => {
  const { env } = fakeBridgeBin("linux");
  const r = nlmPreflight({ platform: "linux", env, spawn: () => okStdout(validContract({ environment_sha256: "abc" })) });
  assert.equal(r.reason, "CONTRACT_INCOMPLETE");
  assert.ok(r.detail.includes("environment_sha256"));
  // Uppercase hex is also non-canonical and must fail.
  const up = nlmPreflight({ platform: "linux", env, spawn: () => okStdout(validContract({ auth_guard_sha256: "A".repeat(64) })) });
  assert.equal(up.reason, "CONTRACT_INCOMPLETE");
});

test("preflight fails closed on instructions_policy drift", () => {
  const { env } = fakeBridgeBin("linux");
  const r = nlmPreflight({ platform: "linux", env, spawn: () => okStdout(validContract({ instructions_policy: "allow-auto" })) });
  assert.equal(r.reason, "CONTRACT_POLICY_DRIFT");
});

test("preflight fails closed on base_url / transport drift", () => {
  const { env } = fakeBridgeBin("linux");
  assert.equal(nlmPreflight({ platform: "linux", env, spawn: () => okStdout(validContract({ base_url: "https://evil.example" })) }).reason, "CONTRACT_INVARIANT_DRIFT");
  assert.equal(nlmPreflight({ platform: "linux", env, spawn: () => okStdout(validContract({ transport: "http" })) }).reason, "CONTRACT_INVARIANT_DRIFT");
});

test("preflight fails closed when the spawn errors or throws", () => {
  const { env } = fakeBridgeBin("linux");
  const enoent = nlmPreflight({ platform: "linux", env, spawn: () => ({ error: Object.assign(new Error("spawn ENOENT"), { code: "ENOENT" }), status: null }) });
  assert.equal(enoent.reason, "BRIDGE_SPAWN_FAILED");
  const timeout = nlmPreflight({ platform: "linux", env, spawn: () => ({ error: Object.assign(new Error("ETIMEDOUT"), { code: "ETIMEDOUT" }), signal: "SIGTERM", status: null }) });
  assert.equal(timeout.reason, "BRIDGE_SPAWN_FAILED");
  const noStatus = nlmPreflight({ platform: "linux", env, spawn: () => ({ status: null }) });
  assert.equal(noStatus.reason, "BRIDGE_SPAWN_FAILED");
  const threw = nlmPreflight({ platform: "linux", env, spawn: () => { throw new Error("boom"); } });
  assert.equal(threw.reason, "BRIDGE_SPAWN_FAILED");
});

test("winShimPathUnsafe rejects cmd.exe metacharacters but allows spaces", () => {
  assert.equal(winShimPathUnsafe("C:\\Users\\John Doe\\AppData\\Local\\MJ-AgentLab\\bin\\learn-kit-nlm-bridge.cmd"), false, "spaces are safe (inner quotes handle them)");
  for (const bad of ["a&b", "a%b", "a|b", "a<b", "a>b", "a^b", 'a"b']) {
    assert.equal(winShimPathUnsafe(`C:\\x\\${bad}\\s.cmd`), true, `${bad} must be rejected`);
  }
});

test("preflight (win32) fails closed on an unsafe shim path BEFORE spawning", () => {
  const parent = track(fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "fake-bin-")));
  const bin = path.join(parent, "a&b"); // '&' is legal in a Windows account name -> in LOCALAPPDATA
  const binDir = path.join(bin, "MJ-AgentLab", "bin");
  fs.mkdirSync(binDir, { recursive: true });
  fs.writeFileSync(path.join(binDir, "learn-kit-nlm-bridge.cmd"), "dummy");
  let spawned = false;
  const r = nlmPreflight({ platform: "win32", env: { LOCALAPPDATA: bin }, spawn: () => ((spawned = true), okStdout()) });
  assert.equal(r.reason, "BRIDGE_SHIM_PATH_UNSAFE");
  assert.equal(spawned, false, "must not spawn when the path is unsafe");
});

// ---------------------------------------------------------------------- CLI
test("CLI exit codes: modes are mutually exclusive", () => {
  assert.equal(main(["--self-check", "--nlm-preflight"]), 2);
  assert.equal(main(["--self-check", "--stage"]), 2);
});

test("CLI exit codes: missing / unknown arguments are exit 2", () => {
  assert.equal(main([]), 2, "no mode");
  assert.equal(main(["--bogus"]), 2, "unknown arg with no mode");
  assert.equal(main(["--self-check", "--bogus"]), 2, "unknown arg WITH a valid mode present");
  assert.equal(main(["--stage"]), 2, "--stage without --root");
  assert.equal(main(["--stage", "--root"]), 2, "--root without a value");
  // A real root, so the ONLY defect is the malformed --entry.
  const out = track(makeOutput());
  assert.equal(main(["--stage", "--root", out, "--entry", "foundation"]), 2, "--entry without =");
  assert.equal(main(["--stage", "--root", out, "--entry", "=x.md"]), 2, "--entry with an empty tier");
  assert.equal(main(["--stage", "--root", out]), 2, "--stage with no --entry at all");
  // Sanity: the same shape WITH a well-formed entry succeeds, proving the above fail on the
  // entry parsing rather than on something earlier.
  assert.equal(main(["--stage", "--root", out, "--entry", "foundation=foundation.md"]), 0);
  for (const n of fs.readdirSync(fs.realpathSync(os.tmpdir()))) {
    if (n.startsWith("learn-kit-upload-")) track(path.join(fs.realpathSync(os.tmpdir()), n));
  }
});

test("CLI exit codes: a non-hex expected hash is exit 2 — proven against a REAL manifest", () => {
  // Passing a bogus manifest path ("x") makes these pass whether or not isHex64 exists, because
  // the unsafe-path guard also returns 2. Use a real staged manifest so the ONLY thing that can
  // produce exit 2 is the hex validation itself.
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  const good = r.manifest_sha256;

  assert.equal(main(["--verify-manifest", r.manifest_path, "--expected-manifest-sha256", "nope", "--expected-corpus-sha256", r.corpus_sha256]), 2);
  assert.equal(main(["--verify-manifest", r.manifest_path, "--expected-manifest-sha256", good, "--expected-corpus-sha256", "NOPE"]), 2);
  // Uppercase hex is not canonical.
  assert.equal(main(["--cleanup-manifest", r.manifest_path, "--expected-manifest-sha256", good.toUpperCase()]), 2);
  // 63 and 65 chars must both fail.
  assert.equal(main(["--cleanup-manifest", r.manifest_path, "--expected-manifest-sha256", "a".repeat(63)]), 2);
  assert.equal(main(["--cleanup-manifest", r.manifest_path, "--expected-manifest-sha256", "a".repeat(65)]), 2);
  // Sanity: the same call with a well-formed hash gets PAST validation (and fails on mismatch).
  assert.equal(main(["--cleanup-manifest", r.manifest_path, "--expected-manifest-sha256", "a".repeat(64)]), 1);
  assert.ok(fs.existsSync(path.dirname(r.manifest_path)), "the mismatching cleanup must not have deleted anything");
});

test("CLI exit codes: an unsafe path is exit 2, a verification failure is exit 1", () => {
  const out = track(makeOutput());
  const r = stage(out, ["foundation"]);
  assert.equal(
    main(["--verify-manifest", r.manifest_path, "--expected-manifest-sha256", "0".repeat(64), "--expected-corpus-sha256", r.corpus_sha256]),
    1,
    "hash mismatch is a verification failure",
  );
  assert.equal(
    main(["--verify-manifest", path.join(out, "manifest.json"), "--expected-manifest-sha256", "0".repeat(64), "--expected-corpus-sha256", "0".repeat(64)]),
    2,
    "path outside a staging root is unsafe",
  );
});

test("the helper imports nothing outside its own directory (it ships inside the plugin)", () => {
  const src = fs.readFileSync(HELPER, "utf8");
  const imports = [...src.matchAll(/^\s*import\s+[\s\S]*?from\s+"([^"]+)"/gm)].map((m) => m[1]);
  for (const spec of imports) {
    assert.ok(spec.startsWith("node:"), `helper must only import node: builtins, found "${spec}"`);
  }
  assert.ok(imports.length > 0, "sanity: imports were actually parsed");
});
