import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { prepareSmokeSource, materializeSmokeSource, assertSmokeSource, removeSmokeSource, SMOKE_SOURCE_INPUTS } from "../scripts/smoke-source.mjs";
import { runSmoke, cleanupIsolatedRoot, INSTALL_SCENARIOS } from "../scripts/smoke-codex-plugin.mjs";
import { assertInstalledSkillResources as assertProductionSkillResources } from "../scripts/validate-portable.mjs";
import { validateDocumentation, collectNavigationResources } from "../scripts/document-harness.mjs";
import { populateRepositoryFixture } from "./helpers/repository-fixture.mjs";

const REPO = fs.realpathSync.native(path.resolve(import.meta.dirname, "..")), hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
let LIFECYCLE_SOURCE;
before(() => {
  LIFECYCLE_SOURCE = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "smoke-lifecycle-source-"));
  // One small, explicitly synthetic source exercises lifecycle faults. The real
  // closure test below and actual smoke command retain complete original bytes.
  populateRepositoryFixture(LIFECYCLE_SOURCE, { sourceRoot: REPO, suite: "smoke-source-lifecycle" });
  fs.cpSync(path.join(REPO, ".codex"), path.join(LIFECYCLE_SOURCE, ".codex"), { recursive: true });
  const record = "tests/fixtures/learning-evidence/learning-record.json";
  fs.mkdirSync(path.dirname(path.join(LIFECYCLE_SOURCE, record)), { recursive: true });
  fs.copyFileSync(path.join(REPO, record), path.join(LIFECYCLE_SOURCE, record));
});
after(() => {
  if (LIFECYCLE_SOURCE && fs.existsSync(LIFECYCLE_SOURCE)) cleanupIsolatedRoot(LIFECYCLE_SOURCE);
});
function temporary(t) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "smoke-source-test-"));
  t.after(() => { if (fs.existsSync(root)) cleanupIsolatedRoot(root); });
  return root;
}
function observe(t) {
  const roots = [], sources = new Map();
  t.after(() => {
    for (const root of roots) if (fs.existsSync(root)) cleanupIsolatedRoot(root);
    for (const source of sources.values()) if (fs.existsSync(source.root)) removeSmokeSource(source);
  });
  return { roots, sources, runner: async options => {
    const { context, installed, preparedSource, keepRoot } = options;
    roots.push(context.root); sources.set(preparedSource.root, preparedSource);
    assert.deepEqual(fs.readdirSync(context.src).sort(), [...preparedSource.inputRoots].sort());
    assert.equal(fs.existsSync(path.join(preparedSource.templateRoot, ".git")), false);
    assert.equal(fs.existsSync(path.join(context.cwd, "prior-scenario.txt")), false);
    assert.equal(context.env.CODEX_HOME, context.codexHome);
    for (const key of ["HOME", "USERPROFILE", "CODEX_HOME", "APPDATA", "LOCALAPPDATA", "XDG_CONFIG_HOME", "TEMP", "TMP", "TMPDIR"]) assert.ok(path.relative(context.root, context.env[key]) && !path.relative(context.root, context.env[key]).startsWith(".."), key);
    // This operation is a lifecycle double, not a Codex/Git/installation acceptance.
    fs.mkdirSync(path.join(context.src, ".git"));
    fs.writeFileSync(path.join(context.src, ".git/scenario.txt"), installed.join(","));
    fs.writeFileSync(path.join(context.cwd, "prior-scenario.txt"), installed.join(","));
    fs.mkdirSync(path.join(context.codexHome, "plugins/cache"), { recursive: true });
    return { ok: true, installed, ...(keepRoot ? { root: context.root, repositoryRoot: context.src, codexHome: context.codexHome, consumerRoot: context.cwd } : {}) };
  } };
}

// Boundary probes use an owned real-byte projection, never the original source tree.
function isolatedSource(t) {
  const root = temporary(t), snapshot = prepareSmokeSource(LIFECYCLE_SOURCE);
  try { materializeSmokeSource(snapshot, root, []); }
  finally { removeSmokeSource(snapshot); }
  const record = "tests/fixtures/learning-evidence/learning-record.json";
  fs.mkdirSync(path.dirname(path.join(root, record)), { recursive: true });
  fs.copyFileSync(path.join(REPO, record), path.join(root, record));
  return root;
}
function retainSnapshot(t, source) {
  const snapshot = prepareSmokeSource(source);
  t.after(() => { if (fs.existsSync(snapshot.root)) removeSmokeSource(snapshot); });
  return snapshot;
}
function directoryLink(target, link) {
  fs.symlinkSync(target, link, process.platform === "win32" ? "junction" : "dir");
}

test("real projection copies exact source bytes without synthetic documents and captures the record once", t => {
  const parent = temporary(t), originalRead = fs.readFileSync;
  const record = path.join(REPO, "tests/fixtures/learning-evidence/learning-record.json");
  let reads = 0, snapshot;
  fs.readFileSync = (file, ...args) => { if (path.resolve(String(file)) === record) reads++; return originalRead(file, ...args); };
  try { snapshot = prepareSmokeSource(REPO); }
  finally { fs.readFileSync = originalRead; }
  t.after(() => { if (fs.existsSync(snapshot.root)) removeSmokeSource(snapshot); });
  assert.equal(reads, 1);
  assert.ok(Object.isFrozen(snapshot.learningRecord));
  for (const entry of snapshot.entries.filter(entry => entry.kind === "file")) assert.equal(hash(fs.readFileSync(path.join(REPO, entry.path))), entry.sha256, entry.path);
  assert.equal(fs.existsSync(path.join(snapshot.templateRoot, ".git")), false);
  for (const relative of ["docs/_meta/document-layer-compatibility.json", "plan/communication-kit-implementation-plan.md", "plans/257-task-documentation/INDEX.md"]) assert.equal(fs.existsSync(path.join(snapshot.templateRoot, relative)), true, relative);
  const docs = validateDocumentation(snapshot.templateRoot);
  assert.equal(docs.ok, true, docs.errors.join("\n"));
  assert.deepEqual(collectNavigationResources(snapshot.templateRoot, ["AGENTS.md"]), collectNavigationResources(REPO, ["AGENTS.md"]));
  for (const name of ["first", "second"]) { const root = path.join(parent, name); fs.mkdirSync(root); materializeSmokeSource(snapshot, root, []); assertSmokeSource(snapshot, root); }
  fs.appendFileSync(path.join(parent, "first/AGENTS.md"), "\ndrift\n");
  assert.throws(() => assertSmokeSource(snapshot, path.join(parent, "first")), /differ/);
  assertSmokeSource(snapshot, path.join(parent, "second"));
  fs.appendFileSync(path.join(snapshot.templateRoot, "AGENTS.md"), "\ntemplate drift\n");
  const third = path.join(parent, "third"); fs.mkdirSync(third);
  assert.throws(() => materializeSmokeSource(snapshot, third, []), /differ/);
  assert.deepEqual(fs.readdirSync(third), []);
});

test("keepRoot retains thirteen independent real source contexts while always removing the template", async t => {
  const seen = observe(t);
  const result = await runSmoke({ repoRoot: LIFECYCLE_SOURCE, keepRoot: true, scenarioRunner: seen.runner });
  assert.equal(result.scenarios.length, 13);
  assert.deepEqual(result.scenarios.map(scenario => scenario.installed), INSTALL_SCENARIOS);
  assert.equal(new Set(seen.roots).size, 13);
  assert.equal(seen.sources.size, 1);
  for (const root of seen.roots) assert.equal(fs.existsSync(path.join(root, "src/.git/scenario.txt")), true);
  for (const source of seen.sources.values()) assert.equal(fs.existsSync(source.root), false);
});

test("normal success removes all thirteen scenario contexts and the shared template", async t => {
  const seen = observe(t);
  const result = await runSmoke({ repoRoot: LIFECYCLE_SOURCE, scenarioRunner: seen.runner });
  assert.equal(result.scenarios.length, 13);
  for (const root of seen.roots) assert.equal(fs.existsSync(root), false);
  for (const source of seen.sources.values()) assert.equal(fs.existsSync(source.root), false);
});

test("a later rejected operation removes previously retained and current roots without replacing its error", async t => {
  const seen = observe(t), original = new Error("synthetic later native/Python operation failure");
  let calls = 0;
  await assert.rejects(runSmoke({ repoRoot: LIFECYCLE_SOURCE, keepRoot: true, scenarioRunner: async options => {
    const result = await seen.runner(options);
    if (++calls === 3) { await Promise.resolve(); throw original; }
    return result;
  } }), error => error === original);
  assert.equal(calls, 3);
  for (const root of seen.roots) assert.equal(fs.existsSync(root), false);
  for (const source of seen.sources.values()) assert.equal(fs.existsSync(source.root), false);
});

test("an operation and persistent cleanup failure remain visible together", async t => {
  const seen = observe(t), original = new Error("original operation failure"), cleanup = new Error("synthetic persistent EACCES");
  const originalRemove = fs.rmSync;
  try {
    await assert.rejects(runSmoke({ repoRoot: LIFECYCLE_SOURCE, keepRoot: true, scenarioRunner: async options => {
      await seen.runner(options);
      fs.rmSync = (target, ...args) => { if (path.resolve(target) === options.context.root) throw cleanup; return originalRemove(target, ...args); };
      throw original;
    } }), error => error instanceof AggregateError && error.cause === original && error.errors.includes(cleanup) && /original operation failure/.test(error.message) && /persistent EACCES/.test(error.message));
  } finally { fs.rmSync = originalRemove; }
  assert.equal(fs.existsSync(seen.roots[0]), true);
  for (const source of seen.sources.values()) assert.equal(fs.existsSync(source.root), false);
});

test("template cleanup failure fails an otherwise successful keepRoot run and removes all retained scenarios", async t => {
  const seen = observe(t), failure = new Error("synthetic template cleanup failure"), originalRemove = fs.rmSync;
  try {
    await assert.rejects(runSmoke({ repoRoot: LIFECYCLE_SOURCE, keepRoot: true, scenarioRunner: async options => {
      const result = await seen.runner(options);
      fs.rmSync = (target, ...args) => { if (path.resolve(target) === options.preparedSource.root) throw failure; return originalRemove(target, ...args); };
      return result;
    } }), error => error instanceof AggregateError && error.cause === failure && /template cleanup failure/.test(error.message));
  } finally { fs.rmSync = originalRemove; }
  assert.equal(seen.roots.length, 13);
  for (const root of seen.roots) assert.equal(fs.existsSync(root), false);
});

test("invalid complete source fails before template preparation or scenario execution", async t => {
  const root = temporary(t); fs.mkdirSync(path.join(root, "docs"));
  let called = false;
  await assert.rejects(runSmoke({ repoRoot: root, scenarioRunner: async () => { called = true; } }), /smoke source failed strict validation/);
  assert.equal(called, false);
  assert.deepEqual(fs.readdirSync(root), ["docs"]);
});

test("template preparation failure removes its partial root and retains the original failure", t => {
  const originalCopy = fs.copyFileSync, originalTemp = fs.mkdtempSync, original = new Error("synthetic template copy failure");
  let root;
  fs.copyFileSync = () => { throw original; };
  fs.mkdtempSync = (...args) => { const value = originalTemp(...args); if (String(args[0]).includes("marketplace-smoke-source-")) root = value; return value; };
  try { assert.throws(() => prepareSmokeSource(LIFECYCLE_SOURCE), error => error === original); }
  finally { fs.copyFileSync = originalCopy; fs.mkdtempSync = originalTemp; }
  assert.ok(root);
  assert.equal(fs.existsSync(root), false);
});

for (const relative of [".agents", "plugins/learning-evidence-kit/scripts/__pycache__", "plugins/diagram-kit/skills/arch-diagram/scripts/__pycache__"]) {
  test(`source rejects directory links including a cache junction: ${relative}`, t => {
    const source = isolatedSource(t), outside = temporary(t), link = path.join(source, relative);
    fs.writeFileSync(path.join(outside, "sentinel.txt"), "outside-owned-source");
    if (fs.existsSync(link)) fs.rmSync(link, { recursive: true });
    directoryLink(outside, link);
    assert.throws(() => prepareSmokeSource(source), /smoke source link is forbidden/);
    assert.equal(fs.readFileSync(path.join(outside, "sentinel.txt"), "utf8"), "outside-owned-source");
  });
}

test("only the two explicit Python roots exclude generated caches; HTML and nested extras remain visible", t => {
  const source = isolatedSource(t), baseline = retainSnapshot(t, source);
  const cacheRoots = ["plugins/learning-evidence-kit/scripts", "plugins/diagram-kit/skills/arch-diagram/scripts"];
  for (const relative of cacheRoots) {
    fs.mkdirSync(path.join(source, relative, "__pycache__"));
    fs.writeFileSync(path.join(source, relative, "__pycache__/generated.pyc"), "generated cache");
    fs.writeFileSync(path.join(source, relative, "generated.pyc"), "generated direct cache");
  }
  const cached = retainSnapshot(t, source);
  assert.deepEqual(cached.entries, baseline.entries);
  for (const relative of cacheRoots) {
    assert.equal(fs.existsSync(path.join(cached.templateRoot, relative, "__pycache__")), false);
    assert.equal(fs.existsSync(path.join(cached.templateRoot, relative, "generated.pyc")), false);
  }
  const extras = ["plugins/html-guide-kit/skills/guide/extra.pyc", "plugins/html-guide-kit/skills/guide/__pycache__/extra.pyc", "plugins/learning-evidence-kit/scripts/nested/__pycache__/visible.pyc"];
  for (const relative of extras) {
    fs.mkdirSync(path.dirname(path.join(source, relative)), { recursive: true });
    fs.writeFileSync(path.join(source, relative), `unapproved real extra: ${relative}`);
  }
  const extra = retainSnapshot(t, source);
  for (const relative of extras) {
    assert.ok(extra.entries.some(entry => entry.path === relative), relative);
    assert.deepEqual(fs.readFileSync(path.join(extra.templateRoot, relative)), fs.readFileSync(path.join(source, relative)), relative);
  }
  assert.throws(() => assertProductionSkillResources(path.join(source, "plugins/html-guide-kit/skills/guide"), path.join(extra.templateRoot, "plugins/html-guide-kit/skills/guide"), "html-guide-kit:guide"), /exactly its approved skill resources/);
});

for (const kind of ["nonempty", "file", "directory-link", "template-descendant", "source-descendant"]) {
  test(`scenario destination rejects unsafe ownership or shape: ${kind}`, t => {
    const source = isolatedSource(t), snapshot = retainSnapshot(t, source), parent = temporary(t);
    let destination = path.join(parent, "destination");
    if (kind === "file") fs.writeFileSync(destination, "ordinary file");
    else if (kind === "directory-link") directoryLink(temporary(t), destination);
    else {
      if (kind === "template-descendant") destination = path.join(snapshot.root, "nested");
      if (kind === "source-descendant") destination = path.join(source, "nested");
      fs.mkdirSync(destination);
      if (kind === "nonempty") fs.writeFileSync(path.join(destination, "sentinel"), "retain me");
    }
    const expected = kind === "nonempty" ? /must be empty/ : kind.endsWith("descendant") ? /must be separate/ : /ordinary directory/;
    assert.throws(() => materializeSmokeSource(snapshot, destination, []), expected);
    assertSmokeSource(snapshot, snapshot.templateRoot);
    if (kind === "nonempty") assert.equal(fs.readFileSync(path.join(destination, "sentinel"), "utf8"), "retain me");
    else if (kind === "file") assert.equal(fs.readFileSync(destination, "utf8"), "ordinary file");
    else assert.deepEqual(fs.readdirSync(destination), []);
  });
}

test("source changing during a template copy fails its frozen inventory and cleans the partial template", t => {
  const source = isolatedSource(t), originalCopy = fs.copyFileSync, originalTemp = fs.mkdtempSync;
  let changed = false, root;
  fs.mkdtempSync = (...args) => { const value = originalTemp(...args); if (path.basename(String(args[0])) === "marketplace-smoke-source-") root = value; return value; };
  fs.copyFileSync = (...args) => {
    const result = originalCopy(...args);
    if (!changed) { changed = true; fs.appendFileSync(path.join(source, "AGENTS.md"), "\nsource changed during copy\n"); }
    return result;
  };
  try { assert.throws(() => prepareSmokeSource(source), /smoke source bytes or inventory differ/); }
  finally { fs.copyFileSync = originalCopy; fs.mkdtempSync = originalTemp; }
  assert.equal(changed, true);
  assert.match(fs.readFileSync(path.join(source, "AGENTS.md"), "utf8"), /source changed during copy/);
  assert.ok(root);
  assert.equal(fs.existsSync(root), false);
});

for (const stage of ["context-creation", "materialize"]) {
  test(`a ${stage} failure before the second runner cleans prior/current roots and keeps its original error`, async t => {
    const seen = observe(t), allRoots = [], original = new Error(`synthetic ${stage} failure`);
    const originalTemp = fs.mkdtempSync, originalMkdir = fs.mkdirSync, originalCopy = fs.copyFileSync;
    t.after(() => { for (const root of allRoots) if (fs.existsSync(root)) cleanupIsolatedRoot(root); });
    fs.mkdtempSync = (...args) => { const value = originalTemp(...args); if (path.basename(String(args[0])) === "marketplace-smoke-") allRoots.push(value); return value; };
    fs.mkdirSync = (target, ...args) => {
      if (stage === "context-creation" && allRoots.length === 2 && path.resolve(target) === path.join(allRoots[1], "home")) throw original;
      return originalMkdir(target, ...args);
    };
    fs.copyFileSync = (source, target, ...args) => {
      if (stage === "materialize" && allRoots.length === 2 && path.resolve(target).startsWith(path.join(allRoots[1], "src") + path.sep)) throw original;
      return originalCopy(source, target, ...args);
    };
    try { await assert.rejects(runSmoke({ repoRoot: LIFECYCLE_SOURCE, keepRoot: true, scenarioRunner: seen.runner }), error => error === original); }
    finally { fs.mkdtempSync = originalTemp; fs.mkdirSync = originalMkdir; fs.copyFileSync = originalCopy; }
    assert.equal(allRoots.length, 2);
    assert.equal(seen.roots.length, 1);
    for (const root of allRoots) assert.equal(fs.existsSync(root), false);
    assert.equal(seen.sources.size, 1);
    for (const source of seen.sources.values()) assert.equal(fs.existsSync(source.root), false);
  });
}

test("a second runner returning ok:false fails the run and cleans all retained/current roots and the template", async t => {
  const seen = observe(t);
  await assert.rejects(runSmoke({ repoRoot: LIFECYCLE_SOURCE, keepRoot: true, scenarioRunner: async options => {
    const result = await seen.runner(options);
    return seen.roots.length === 2 ? { ...result, ok: false } : result;
  } }), error => error instanceof Error && !(error instanceof AggregateError) && error.message === "smoke scenario verification failed");
  assert.equal(seen.roots.length, 2);
  for (const root of seen.roots) assert.equal(fs.existsSync(root), false);
  for (const source of seen.sources.values()) assert.equal(fs.existsSync(source.root), false);
});

for (const failure of ["byte-drift", "read-error"]) {
  test(`post-success source integrity ${failure} cleans retained/current roots and preserves the failure`, async t => {
    const seen = observe(t), originalRead = fs.readFileSync, original = new Error("synthetic post-success integrity read failure");
    try {
      await assert.rejects(runSmoke({ repoRoot: LIFECYCLE_SOURCE, keepRoot: true, scenarioRunner: async options => {
        const result = await seen.runner(options);
        if (seen.roots.length === 2) {
          const target = path.join(options.context.src, "AGENTS.md");
          if (failure === "byte-drift") fs.appendFileSync(target, "\npost-operation source drift\n");
          else fs.readFileSync = (file, ...args) => { if (path.resolve(String(file)) === target) throw original; return originalRead(file, ...args); };
        }
        return result;
      } }), error => failure === "read-error" ? error === original : error instanceof Error && !(error instanceof AggregateError) && /smoke source bytes or inventory differ/.test(error.message));
    } finally { fs.readFileSync = originalRead; }
    assert.equal(seen.roots.length, 2);
    for (const root of seen.roots) assert.equal(fs.existsSync(root), false);
    for (const source of seen.sources.values()) assert.equal(fs.existsSync(source.root), false);
  });
}
