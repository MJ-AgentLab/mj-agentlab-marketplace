import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { populateRepositoryFixture, reportRepositoryFixture, FIXTURE_MANIFEST, SYNTHETIC_DOCUMENTS, PYTHON_CACHE_ROOTS } from "./helpers/repository-fixture.mjs";
import { validateRepository } from "../scripts/validate-portable.mjs";

const REPO = path.resolve(import.meta.dirname, ".."), suite = "repository-fixture-boundary";
function temporary(t) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "repository-fixture-boundary-"));
  t.after(() => {
    const relative = path.relative(fs.realpathSync.native(os.tmpdir()), fs.realpathSync.native(root));
    assert.ok(relative && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  return root;
}
function build(parent, name, sourceRoot = REPO) {
  const root = path.join(parent, name);
  fs.mkdirSync(root);
  return populateRepositoryFixture(root, { sourceRoot, suite });
}
function files(root, relative = "") {
  return fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap(entry => {
    assert.equal(entry.isSymbolicLink(), false);
    const next = path.posix.join(relative, entry.name);
    return entry.isDirectory() ? files(root, next) : [next];
  }).sort();
}
const digest = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const inventory = root => files(root).map(relative => [relative, fs.statSync(path.join(root, relative)).size, digest(path.join(root, relative))]);

test("minimal repository fixture preserves real bytes and reports generated and total bytes accurately", t => {
  const summary = build(temporary(t), "fixture"), all = inventory(summary.root);
  const synthetic = new Set([...FIXTURE_MANIFEST.syntheticRootDocuments, ...SYNTHETIC_DOCUMENTS]);
  const actualBytes = all.reduce((total, [, bytes]) => total + bytes, 0);
  assert.equal(summary.sourceRoot, fs.realpathSync.native(REPO));
  assert.equal(summary.fixtureTotalBytes, actualBytes);
  assert.equal(summary.fixtureTotalFiles, all.length);
  assert.equal(summary.fixtureTotalBytes, summary.copiedBytes + summary.syntheticBytes);
  assert.equal(summary.preparationDeltaBytes, 0);
  assert.equal(summary.syntheticFiles, synthetic.size);
  assert.equal(summary.syntheticBytes, all.filter(([relative]) => synthetic.has(relative)).reduce((total, [, bytes]) => total + bytes, 0));
  for (const [relative, , sha] of all) {
    if (synthetic.has(relative)) assert.match(fs.readFileSync(path.join(summary.root, relative), "utf8"), /Synthetic|synthetic/);
    else assert.equal(sha, digest(path.join(REPO, relative)), relative);
  }
  const result = validateRepository(summary.root);
  assert.equal(result.ok, true, result.errors.join("\n"));
  for (const relative of ["docs/runbook/evidence", "plan", ".github", ".codex", "tests", "package.json", "package-lock.json"]) assert.equal(fs.existsSync(path.join(summary.root, relative)), false, relative);
  assert.deepEqual(fs.readdirSync(path.join(summary.root, "scripts")), []);
  assert.equal(files(path.join(summary.root, "assets")).length, 44);
  assert.deepEqual(files(path.join(summary.root, "docs")).map(relative => `docs/${relative}`), [...SYNTHETIC_DOCUMENTS].sort());
});

test("fixture copies remain independent and ignore historical or unrelated source documents", t => {
  const parent = temporary(t), source = build(parent, "source");
  const historical = path.join(source.root, "docs/runbook/evidence/unrelated.json");
  fs.mkdirSync(path.dirname(historical), { recursive: true });
  fs.writeFileSync(historical, JSON.stringify({ synthetic: true, marker: "do-not-copy", payload: "x".repeat(1024 * 1024) }));
  fs.writeFileSync(path.join(source.root, "docs/unrelated.md"), "malformed document must not enter fixture");
  const before = inventory(source.root), first = build(parent, "first", source.root), second = build(parent, "second", source.root);
  assert.ok(fs.statSync(historical).size >= 1024 * 1024);
  assert.ok(before.reduce((total, [, bytes]) => total + bytes, 0) - source.fixtureTotalBytes >= 1024 * 1024);
  for (const generated of [first, second]) {
    assert.equal(generated.copiedBytes, source.copiedBytes);
    assert.equal(generated.syntheticBytes, source.syntheticBytes);
    assert.equal(generated.fixtureTotalBytes, source.fixtureTotalBytes);
    assert.equal(generated.fixtureTotalFiles, source.fixtureTotalFiles);
  }
  assert.equal(fs.existsSync(path.join(first.root, "docs/runbook/evidence")), false);
  assert.equal(fs.existsSync(path.join(first.root, "docs/unrelated.md")), false);
  const relative = "plugins/html-guide-kit/skills/guide/references/guide-framework.md";
  fs.appendFileSync(path.join(first.root, relative), "\nchanged only first fixture\n");
  assert.equal(digest(path.join(second.root, relative)), digest(path.join(source.root, relative)));
  assert.notEqual(digest(path.join(first.root, relative)), digest(path.join(source.root, relative)));
  assert.deepEqual(inventory(source.root), before);
});

test("existing generated caches in known Python roots do not enter fixture copies or byte accounting", t => {
  const parent = temporary(t), source = build(parent, "source");
  for (const relative of PYTHON_CACHE_ROOTS) {
    const cache = path.join(source.root, relative, "__pycache__"); fs.mkdirSync(cache);
    fs.writeFileSync(path.join(cache, "synthetic.cpython-312.pyc"), "synthetic existing bytecode");
    fs.writeFileSync(path.join(source.root, relative, "legacy.pyc"), "synthetic existing legacy bytecode");
  }
  const before = inventory(source.root), destination = build(parent, "destination", source.root);
  assert.equal(destination.copiedBytes, source.copiedBytes);
  assert.equal(destination.copiedFiles, source.copiedFiles);
  assert.equal(destination.fixtureTotalBytes, source.fixtureTotalBytes);
  for (const relative of PYTHON_CACHE_ROOTS) {
    assert.equal(fs.existsSync(path.join(destination.root, relative, "__pycache__")), false);
    assert.equal(fs.existsSync(path.join(destination.root, relative, "legacy.pyc")), false);
  }
  assert.deepEqual(inventory(source.root), before);
});

test("a separate process generating caches during copy cannot change the frozen file list or totals", t => {
  const parent = temporary(t), source = build(parent, "source"), destination = path.join(parent, "destination");
  fs.mkdirSync(destination);
  const originalCopy = fs.copyFileSync;
  let generated = false, result;
  fs.copyFileSync = (...args) => {
    const copied = originalCopy(...args);
    if (!generated) {
      generated = true;
      const writer = spawnSync(process.execPath, ["--input-type=module", "-e", `
import fs from "node:fs";import path from "node:path";
for(const relative of ${JSON.stringify(PYTHON_CACHE_ROOTS)}){
 const cache=path.join(process.argv[1],relative,"__pycache__");fs.mkdirSync(cache,{recursive:true});
 fs.writeFileSync(path.join(cache,"during-copy.cpython-312.pyc"),"synthetic concurrent bytecode");
 fs.writeFileSync(path.join(process.argv[1],relative,"during-copy.pyc"),"synthetic concurrent legacy bytecode");
}
`, source.root], { encoding: "utf8", timeout: 10000 });
      assert.equal(writer.status, 0, writer.stderr);
    }
    return copied;
  };
  try { result = populateRepositoryFixture(destination, { sourceRoot: source.root, suite }); }
  finally { fs.copyFileSync = originalCopy; }
  assert.equal(generated, true);
  assert.equal(result.copiedBytes, source.copiedBytes);
  assert.equal(result.fixtureTotalBytes, inventory(destination).reduce((total, [, bytes]) => total + bytes, 0));
  for (const relative of PYTHON_CACHE_ROOTS) {
    assert.equal(fs.existsSync(path.join(source.root, relative, "__pycache__/during-copy.cpython-312.pyc")), true);
    assert.equal(fs.existsSync(path.join(destination, relative, "__pycache__")), false);
    assert.equal(fs.existsSync(path.join(destination, relative, "during-copy.pyc")), false);
  }
});

test("bytecode-looking extras outside known Python roots remain visible and invalidate the exact HTML package", t => {
  const parent = temporary(t), source = build(parent, "source"), skill = path.join(source.root, "plugins/html-guide-kit/skills/guide");
  const extra = path.join(skill, "extra.pyc"); fs.writeFileSync(extra, "synthetic unapproved resource");
  const first = path.join(parent, "extra-file"); fs.mkdirSync(first);
  assert.throws(() => populateRepositoryFixture(first, { sourceRoot: source.root, suite }), /guide/);
  assert.equal(fs.existsSync(path.join(first, "plugins/html-guide-kit/skills/guide/extra.pyc")), true);
  fs.unlinkSync(extra);
  const cache = path.join(skill, "__pycache__"); fs.mkdirSync(cache); fs.writeFileSync(path.join(cache, "extra.pyc"), "synthetic unapproved directory");
  const second = path.join(parent, "extra-directory"); fs.mkdirSync(second);
  assert.throws(() => populateRepositoryFixture(second, { sourceRoot: source.root, suite }), /guide/);
  assert.equal(fs.existsSync(path.join(second, "plugins/html-guide-kit/skills/guide/__pycache__/extra.pyc")), true);
  fs.unlinkSync(path.join(cache, "extra.pyc")); fs.rmdirSync(cache);
  const emptyExtra = path.join(source.root, "plugins/html-guide-kit/skills/unapproved-empty"); fs.mkdirSync(emptyExtra);
  const third = path.join(parent, "empty-skill-directory"); fs.mkdirSync(third);
  assert.throws(() => populateRepositoryFixture(third, { sourceRoot: source.root, suite }), /unexpected public skill set/);
  assert.equal(fs.existsSync(path.join(third, "plugins/html-guide-kit/skills/unapproved-empty")), true);
});

test("missing real runtime, metadata, version and brand resources fail before writing the destination", t => {
  const parent = temporary(t), source = build(parent, "source");
  const required = [
    "VERSION", ".gitattributes", ".agents/plugins/marketplace.json",
    "plugins/communication-kit/skills/communicate/references/aics-policy.md",
    "plugins/learning-evidence-kit/scripts/storage.py",
    "assets/brand/references/team-logo-original.png", "assets/brand/previews/html-guide-kit-32.png",
  ];
  for (const [index, relative] of required.entries()) {
    const file = path.join(source.root, relative), held = `${file}.held`, destination = path.join(parent, `missing-${index}`);
    fs.mkdirSync(destination);
    fs.renameSync(file, held);
    try {
      assert.throws(() => populateRepositoryFixture(destination, { sourceRoot: source.root, suite }), /ENOENT|resource|file/i, relative);
      assert.deepEqual(fs.readdirSync(destination), []);
    } finally { fs.renameSync(held, file); }
  }
});

test("fixture preparation rejects traversal and junction dependencies rather than repairing them", t => {
  const parent = temporary(t), source = build(parent, "source");
  const exportsFile = path.join(source.root, "assets/brand/exports.json"), bytes = fs.readFileSync(exportsFile), config = JSON.parse(bytes);
  config.icons[0].source = "../../outside.svg";
  fs.writeFileSync(exportsFile, JSON.stringify(config));
  const escaped = path.join(parent, "escaped"); fs.mkdirSync(escaped);
  assert.throws(() => populateRepositoryFixture(escaped, { sourceRoot: source.root, suite }), /invalid fixture resource path/);
  assert.deepEqual(fs.readdirSync(escaped), []);
  fs.writeFileSync(exportsFile, bytes);
  const references = path.join(source.root, "plugins/html-guide-kit/skills/guide/references"), foreign = path.join(parent, "foreign-references");
  fs.renameSync(references, foreign);
  try {
    try { fs.symlinkSync(foreign, references, process.platform === "win32" ? "junction" : "dir"); }
    catch (error) { if (["EPERM", "EACCES", "ENOSYS"].includes(error.code)) { t.skip("junctions unavailable"); return; } throw error; }
    const destination = path.join(parent, "junction"); fs.mkdirSync(destination);
    assert.throws(() => populateRepositoryFixture(destination, { sourceRoot: source.root, suite }), /symlink|junction/);
    assert.deepEqual(fs.readdirSync(destination), []);
  } finally {
    if (fs.existsSync(references)) fs.unlinkSync(references);
    fs.renameSync(foreign, references);
  }
  const foreignCache = path.join(parent, "foreign-cache"); fs.mkdirSync(foreignCache);
  fs.writeFileSync(path.join(foreignCache, "linked.pyc"), "synthetic linked cache");
  for (const [index, relative] of PYTHON_CACHE_ROOTS.entries()) {
    const cache = path.join(source.root, relative, "__pycache__");
    fs.symlinkSync(foreignCache, cache, process.platform === "win32" ? "junction" : "dir");
    try {
      const destination = path.join(parent, `cache-junction-${index}`); fs.mkdirSync(destination);
      assert.throws(() => populateRepositoryFixture(destination, { sourceRoot: source.root, suite }), /symlink|junction/);
      assert.deepEqual(fs.readdirSync(destination), []);
    } finally { fs.unlinkSync(cache); }
  }
});

test("synthetic document closure remains strict and is not expanded to mask missing links", t => {
  const source = build(temporary(t), "fixture"), target = path.join(source.root, SYNTHETIC_DOCUMENTS[0]);
  fs.unlinkSync(target);
  const missing = validateRepository(source.root);
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.some(error => error.includes("missing linked file")), missing.errors.join("\n"));
  fs.writeFileSync(target, "# Missing required frontmatter\n");
  const malformed = validateRepository(source.root);
  assert.equal(malformed.ok, false);
  assert.ok(malformed.errors.some(error => error.includes("frontmatter")), malformed.errors.join("\n"));
});

test("destination scope checks preserve existing contents and final totals include local overlays", t => {
  const parent = temporary(t), source = build(parent, "source"), before = inventory(source.root);
  assert.throws(() => populateRepositoryFixture(source.root, { sourceRoot: source.root, suite }), /separate directory trees/);
  const occupied = path.join(parent, "occupied"); fs.mkdirSync(occupied); fs.writeFileSync(path.join(occupied, "keep.txt"), "keep");
  assert.throws(() => populateRepositoryFixture(occupied, { sourceRoot: source.root, suite }), /must be empty/);
  assert.equal(fs.readFileSync(path.join(occupied, "keep.txt"), "utf8"), "keep");
  assert.deepEqual(inventory(source.root), before);
  const overlay = "\nsynthetic local overlay\n";
  fs.appendFileSync(path.join(source.root, ".gitattributes"), overlay);
  const final = reportRepositoryFixture(source, { suite, stage: "local-overlay" });
  assert.equal(final.preparationDeltaBytes, Buffer.byteLength(overlay));
  assert.equal(final.fixtureTotalBytes, inventory(source.root).reduce((total, [, bytes]) => total + bytes, 0));
  const unexpectedCache = path.join(source.root, PYTHON_CACHE_ROOTS[0], "__pycache__"); fs.mkdirSync(unexpectedCache);
  fs.writeFileSync(path.join(unexpectedCache, "unexpected.pyc"), "synthetic fixture-side leak");
  const leaked = reportRepositoryFixture(source, { suite, stage: "unexpected-cache" });
  assert.equal(leaked.fixtureTotalBytes, inventory(source.root).reduce((total, [, bytes]) => total + bytes, 0));
  assert.ok(leaked.preparationDeltaBytes > final.preparationDeltaBytes);
  assert.equal(leaked.copiedBytes, source.copiedBytes);
  fs.mkdirSync(path.join(source.root, ".git"));
  assert.throws(() => reportRepositoryFixture(final, { suite }), /before Git initialization/);
});
