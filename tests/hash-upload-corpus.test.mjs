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

test("stage rejects a duplicate tier", () => {
  const out = track(makeOutput());
  assert.throws(() =>
    stageCorpus({ root: out, entries: [{ tier: "foundation", file: "foundation.md" }, { tier: "foundation", file: "foundation.md" }] }),
  );
});

test("stage rejects an unknown tier", () => {
  const out = track(makeOutput());
  assert.throws(() => stageCorpus({ root: out, entries: [{ tier: "advanced", file: "foundation.md" }] }));
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

test("stage leaves no staging root behind when it fails midway", () => {
  const out = track(makeOutput({ foundation: "# f\n" }));
  const before = fs.readdirSync(fs.realpathSync(os.tmpdir())).filter((n) => n.startsWith("learn-kit-upload-"));
  assert.throws(() =>
    stageCorpus({ root: out, entries: [{ tier: "foundation", file: "foundation.md" }, { tier: "structural", file: "missing.md" }] }),
  );
  const after = fs.readdirSync(fs.realpathSync(os.tmpdir())).filter((n) => n.startsWith("learn-kit-upload-"));
  assert.deepEqual(after, before, "no orphaned staging root");
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

// ----------------------------------------------------------------- preflight
test("preflight fails closed when no bridge is installed", () => {
  const r = nlmPreflight({ env: { LOCALAPPDATA: path.join(os.tmpdir(), "nonexistent-" + Date.now()), HOME: "/nonexistent" } });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "NLM_BRIDGE_NOT_INSTALLED");
});

test("preflight fails closed on an old Node even before touching the filesystem", () => {
  const r = nlmPreflight({ nodeVersion: "v21.0.0" });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "NODE_TOO_OLD");
});

test("preflight never returns ok while contract verification is unimplemented", () => {
  // Guards the increment boundary: it must not report a pass it cannot substantiate.
  assert.equal(nlmPreflight().ok, false);
});

// ---------------------------------------------------------------------- CLI
test("CLI exit codes: modes are mutually exclusive", () => {
  assert.equal(main(["--self-check", "--nlm-preflight"]), 2);
  assert.equal(main(["--self-check", "--stage"]), 2);
});

test("CLI exit codes: missing / unknown arguments are exit 2", () => {
  assert.equal(main([]), 2);
  assert.equal(main(["--bogus"]), 2);
  assert.equal(main(["--stage"]), 2, "--stage without --root");
  assert.equal(main(["--stage", "--root"]), 2, "--root without a value");
  assert.equal(main(["--stage", "--root", ".", "--entry", "foundation"]), 2, "--entry without =");
});

test("CLI exit codes: a non-hex expected hash is exit 2", () => {
  assert.equal(main(["--verify-manifest", "x", "--expected-manifest-sha256", "nope", "--expected-corpus-sha256", "0".repeat(64)]), 2);
  assert.equal(main(["--verify-manifest", "x", "--expected-manifest-sha256", "0".repeat(64), "--expected-corpus-sha256", "NOPE"]), 2);
  // Uppercase hex is not canonical.
  assert.equal(main(["--cleanup-manifest", "x", "--expected-manifest-sha256", "A".repeat(64)]), 2);
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
