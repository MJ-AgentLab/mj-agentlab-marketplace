import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const REPO = path.resolve(import.meta.dirname, "..");
const PACKAGE = path.join(REPO, "plugins/html-guide-kit");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
function copy(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name), to = path.join(target, entry.name);
    if (entry.isDirectory()) copy(from, to); else fs.writeFileSync(to, fs.readFileSync(from));
  }
}
async function fixture(t) {
  const temp = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(temp, "html-site-license-"));
  t.after(() => {
    const relative = path.relative(temp, fs.realpathSync.native(root));
    assert(relative && !path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`));
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  const installed = path.join(root, "installation/plugins/html-guide-kit"), input = path.join(root, "学习材料"), output = path.join(root, "独立制品");
  copy(PACKAGE, installed); copy(path.join(installed, "skills/site/examples/representative"), input);
  const renderer = await import(pathToFileURL(path.join(installed, "skills/site/scripts/render-site.mjs")).href);
  return { root, installed, input, output, render: renderer.renderSite };
}
function python() {
  const candidates = [process.env.HTML_SITE_PYTHON, process.env.PYTHON, "python3", "python"].filter(Boolean).map(command => [command, []]);
  candidates.push(["py", ["-3"]]);
  for (const [command, prefix] of candidates) {
    const probe = spawnSync(command, [...prefix, "-c", "import sys; raise SystemExit(0 if sys.version_info >= (3,10) else 1)"], { encoding: "utf8", timeout: 10000 });
    if (!probe.error && probe.status === 0) return { command, prefix };
  }
  assert.fail("Actual Python >=3.10 is required for generated license validation.");
}
function check(f) {
  const py = python(), result = spawnSync(py.command, [...py.prefix, path.join(f.installed, "skills/site/scripts/check_artifact.py"), "--input", f.output], { encoding: "utf8", timeout: 30000, env: { ...process.env, PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" } });
  assert.equal(result.error, undefined, result.error?.message);
  return { status: result.status, report: JSON.parse(result.stdout) };
}

test("installed renderer carries asset rights without relicensing learning materials", async t => {
  const f = await fixture(t), material = fs.readFileSync(path.join(f.input, "content.md"));
  fs.appendFileSync(path.join(f.input, "content.md"), "\n材料权利由原权利人保留。\n");
  f.render(f);
  for (const relative of ["LICENSE", "licenses/Apache-2.0.txt"]) assert.deepEqual(fs.readFileSync(path.join(f.output, relative)), fs.readFileSync(path.join(f.installed, relative)));
  const original = fs.readFileSync(path.join(f.installed, "THIRD_PARTY_NOTICES.md")), generated = fs.readFileSync(path.join(f.output, "THIRD_PARTY_NOTICES.md"));
  assert.deepEqual(generated.subarray(-original.length), original);
  const prefix = generated.subarray(0, -original.length).toString("utf8");
  assert(prefix.includes("do not relicense")); assert(prefix.includes("original installed plugin"));
  assert.equal(generated.indexOf(original), generated.length - original.length, "the complete package notice has one unmodified tail");
  assert.deepEqual(fs.readFileSync(path.join(f.output, "content.md")), Buffer.concat([material, Buffer.from("\n材料权利由原权利人保留。\n")]));
  const manifest = JSON.parse(fs.readFileSync(path.join(f.output, "artifact-manifest.json")));
  for (const relative of ["LICENSE", "THIRD_PARTY_NOTICES.md", "licenses/Apache-2.0.txt"]) {
    const item = manifest.files.find(item => item.path === relative), bytes = fs.readFileSync(path.join(f.output, relative));
    assert(item); assert.equal(item.sha256, hash(bytes)); assert.equal(item.bytes, bytes.length);
  }
  assert.equal(check(f).status, 0);
  fs.appendFileSync(path.join(f.output, "LICENSE"), "tampered"); assert.equal(check(f).status, 1);
  fs.writeFileSync(path.join(f.output, "LICENSE"), fs.readFileSync(path.join(f.installed, "LICENSE")));
  fs.unlinkSync(path.join(f.output, "licenses/Apache-2.0.txt")); assert.equal(check(f).status, 1);
  // A self-consistent manifest is not independent license/source authentication.
  for (const relative of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) fs.unlinkSync(path.join(f.output, relative));
  manifest.files = manifest.files.filter(item => !["LICENSE", "THIRD_PARTY_NOTICES.md", "licenses/Apache-2.0.txt"].includes(item.path));
  fs.writeFileSync(path.join(f.output, "artifact-manifest.json"), JSON.stringify(manifest));
  assert.equal(check(f).status, 0);
});

test("missing installed license or notice fails before any output is created", async t => {
  const f = await fixture(t);
  for (const [i, relative] of ["LICENSE", "THIRD_PARTY_NOTICES.md", "licenses/Apache-2.0.txt"].entries()) {
    const file = path.join(f.installed, relative), bytes = fs.readFileSync(file), output = path.join(f.root, `missing-${i}`);
    fs.unlinkSync(file); assert.throws(() => f.render({ input: f.input, output })); assert.equal(fs.existsSync(output), false);
    fs.writeFileSync(file, bytes);
  }
});

test("license output names reject case aliases and nested material collisions before writes", async t => {
  const f = await fixture(t), original = JSON.parse(fs.readFileSync(path.join(f.input, "artifact.json")));
  for (const [i, name] of ["LICENSE/source.md", "license/source.md", "THIRD_PARTY_NOTICES.MD", "third_party_notices.md", "LICENSES/own.txt", "licenses/own.txt", "Licenſes/own.txt", "lıcenses/own.txt", "licenses./own.txt", "LICENSE./source.md", "licenses /own.txt"].entries()) {
    const config = structuredClone(original); config.sources[0].path = name;
    fs.mkdirSync(path.dirname(path.join(f.input, name)), { recursive: true }); fs.writeFileSync(path.join(f.input, name), "source rights retained\n");
    fs.writeFileSync(path.join(f.input, "artifact.json"), JSON.stringify(config));
    const output = path.join(f.root, `rejected-${i}`);
    assert.throws(() => f.render({ input: f.input, output }), /conflict|normal relative file path/); assert.equal(fs.existsSync(output), false);
  }
});
