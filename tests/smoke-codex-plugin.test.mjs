import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { assertDiscovery, parsePromptInputSkills, cleanupIsolatedRoot } from "../scripts/smoke-codex-plugin.mjs";
import { REPOSITORY_SKILLS, PUBLIC_PLUGINS } from "../scripts/validate-portable.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "discovery-fixture-"));
  const cache = path.join(root, "cache"), repo = path.join(root, "repo");
  const entries = [];
  for (const [plugin, skills] of Object.entries(PUBLIC_PLUGINS)) {
    const manifest = fs.readFileSync(path.resolve(import.meta.dirname, "..", "plugins", plugin, "plugin.json"));
    const version = JSON.parse(manifest).version;
    for (const base of [path.join(repo, "plugins", plugin), path.join(cache, plugin, version)]) {
      fs.mkdirSync(base, { recursive: true });
      fs.writeFileSync(path.join(base, "plugin.json"), manifest);
    }
    for (const skill of skills) {
      const file = path.join(cache, plugin, version, "skills", skill, "SKILL.md");
      fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, "skill");
      entries.push({ name: plugin + ":" + skill, file });
    }
  }
  const dev = REPOSITORY_SKILLS.map(name => {
    const file = path.join(repo, ".agents/skills", name, "SKILL.md");
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, name);
    return { name, file };
  });
  return { root, cache, repo, entries, dev };
}

for (const installed of [["diagram-kit"], ["explain-kit"], ["diagram-kit", "explain-kit"]]) {
  test("consumer and repository scopes match installation: " + installed.join(" + "), () => {
    const f = fixture();
    try {
      const entries = f.entries.filter(e => installed.includes(e.name.split(":")[0]));
      const opts = { cacheRoot: f.cache, repositoryRoot: f.repo, installed };
      assert.deepEqual(assertDiscovery(entries, { ...opts, inRepository: false }), { publicSkills: entries.length, repositorySkills: 0 });
      assert.deepEqual(assertDiscovery([...entries, ...f.dev], { ...opts, inRepository: true }), { publicSkills: entries.length, repositorySkills: 19 });
      assert.throws(() => assertDiscovery([...entries, ...f.dev], { ...opts, inRepository: false }));
      assert.throws(() => assertDiscovery([...entries, ...f.dev.slice(1)], { ...opts, inRepository: true }));
      assert.throws(() => assertDiscovery([...entries, { name: "mp-unknown", file: f.dev[0].file }], { ...opts, inRepository: false }));
    } finally { cleanupIsolatedRoot(f.root); }
  });
}

test("duplicate, missing, unknown and uninstalled public skills fail closed", () => {
  const f = fixture();
  try {
    const opts = { cacheRoot: f.cache, repositoryRoot: f.repo, inRepository: false };
    assert.throws(() => assertDiscovery([], opts));
    assert.throws(() => assertDiscovery(f.entries.slice(1), opts));
    assert.throws(() => assertDiscovery([...f.entries, f.entries[0]], opts));
    assert.throws(() => assertDiscovery([...f.entries, { name: "unknown:skill", file: f.entries[0].file }], opts));
    assert.throws(() => assertDiscovery(f.entries, { ...opts, installed: ["diagram-kit"] }));
  } finally { cleanupIsolatedRoot(f.root); }
});

test("locators must belong to the correct installed package, skill and source version", () => {
  const f = fixture();
  try {
    const opts = { cacheRoot: f.cache, repositoryRoot: f.repo, inRepository: false };
    const wrongSkill = f.entries.map(e => ({ ...e })); wrongSkill[1].file = wrongSkill[2].file;
    assert.throws(() => assertDiscovery(wrongSkill, opts));
    const foreign = path.join(f.root, "other/skills/arch-diagram/SKILL.md");
    fs.mkdirSync(path.dirname(foreign), { recursive: true }); fs.writeFileSync(foreign, "other");
    assert.throws(() => assertDiscovery([{ ...f.entries[0], file: foreign }, ...f.entries.slice(1)], opts));
    const manifestPath = path.resolve(path.dirname(f.entries[1].file), "../../plugin.json");
    const original = fs.readFileSync(manifestPath), manifest = JSON.parse(original);
    for (const change of [{ name: "diagram-kit" }, { version: "9.9.9" }]) {
      fs.writeFileSync(manifestPath, JSON.stringify({ ...manifest, ...change }));
      assert.throws(() => assertDiscovery(f.entries, opts));
    }
    fs.writeFileSync(manifestPath, original);
    assert.equal(assertDiscovery(f.entries, opts).publicSkills, 3);
  } finally { cleanupIsolatedRoot(f.root); }
});

test("Windows equivalent file casing still passes containment", { skip: process.platform !== "win32" }, () => {
  const f = fixture();
  try {
    assertDiscovery(f.entries.map(e => ({ ...e, file: e.file.toLowerCase() })), { cacheRoot: f.cache, repositoryRoot: f.repo, inRepository: false });
  } finally { cleanupIsolatedRoot(f.root); }
});

test("prompt parser retains spaces and closing parentheses in a locator", () => {
  const file = "C:/test folder (fixture)/SKILL.md";
  assert.deepEqual(parsePromptInputSkills(JSON.stringify([{ text: "- explain-kit:concept: explain in depth (file: " + file + ")" }])), [{ name: "explain-kit:concept", file }]);
});
