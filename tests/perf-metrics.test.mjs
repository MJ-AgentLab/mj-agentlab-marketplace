import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const moduleUrl = pathToFileURL(path.resolve(import.meta.dirname, "../scripts/perf-metrics.mjs")).href;
const imports = `import assert from "node:assert/strict"; import {measureSync,measureAsync} from ${JSON.stringify(moduleUrl)};`;
function temporary(t) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "perf-metrics-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }));
  return root;
}
function child(source, directory, cwd) {
  const env = { ...process.env };
  if (directory === undefined) delete env.MJ_PERF_DIR;
  else env.MJ_PERF_DIR = directory;
  return spawnSync(process.execPath, ["--input-type=module", "-e", imports + source], { env, cwd, encoding: "utf8", timeout: 10000 });
}
function entries(directory) {
  return fs.readdirSync(directory).flatMap(file => fs.readFileSync(path.join(directory, file), "utf8").trim().split("\n").map(line => JSON.parse(line)));
}
const operations = `
const value={same:"reference"}, syncError={kind:"sync"}, asyncError={kind:"async"};
assert.equal(measureSync("sync.return",()=>value,{scope:"regression"}),value);
assert.throws(()=>measureSync("sync.throw",()=>{throw syncError;}),error=>error===syncError);
let finished=false;
assert.equal(await measureAsync("async.return",async()=>{await new Promise(resolve=>setTimeout(resolve,10));finished=true;return value;}),value);
assert.equal(finished,true);
await assert.rejects(measureAsync("async.reject",async()=>{await Promise.resolve();throw asyncError;}),error=>error===asyncError);
await assert.rejects(measureAsync("async.throw",()=>{throw syncError;}),error=>error===syncError);
process.stdout.write("operations preserved\\n");
`;

test("disabled profiling preserves sync and awaited async outcomes without creating output", t => {
  const root = temporary(t);
  const result = child(operations + `assert.equal(process.env.MJ_PERF_DIR,undefined);`, undefined, root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "operations preserved\n");
  assert.equal(result.stderr, "");
  assert.deepEqual(fs.readdirSync(root), []);
  const empty = child(operations, "", root);
  assert.equal(empty.status, 0, empty.stderr);
  assert.equal(empty.stdout, "operations preserved\n");
  assert.equal(empty.stderr, "");
  assert.deepEqual(fs.readdirSync(root), []);
});

test("enabled profiling records successful and exceptional operations without changing output", t => {
  const directory = path.join(temporary(t), "nested", "reports");
  const result = child(operations, directory);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "operations preserved\n");
  assert.equal(result.stderr, "");
  assert.equal(fs.readdirSync(directory).length, 1);
  const rows = entries(directory);
  assert.deepEqual(rows.map(({ phase, status }) => [phase, status]), [
    ["sync.return", "ok"], ["sync.throw", "error"], ["async.return", "ok"], ["async.reject", "error"], ["async.throw", "error"],
  ]);
  assert.equal(new Set(rows.map(row => row.pid)).size, 1);
  assert.deepEqual(rows[0].details, { scope: "regression" });
  for (const row of rows) {
    assert.ok(Number.isFinite(row.durationMs) && row.durationMs >= 0);
    assert.ok(Number.isInteger(row.pid) && row.pid > 0);
  }
});

test("separate processes write separate reports in the same profiling directory", t => {
  const directory = path.join(temporary(t), "reports");
  for (let index = 0; index < 2; index++) {
    const result = child(`measureSync("process",()=>${index});`, directory);
    assert.equal(result.status, 0, result.stderr);
  }
  assert.equal(fs.readdirSync(directory).length, 2);
  assert.equal(new Set(entries(directory).map(row => row.pid)).size, 2);
});

test("profiling write failure is visible and invalidates the run without replacing operation outcomes", t => {
  const root = temporary(t), blocked = path.join(root, "not-a-directory");
  fs.writeFileSync(blocked, "blocked");
  const result = child(operations, blocked);
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "operations preserved\n");
  assert.match(result.stderr, /MJ_PERF_DIR profile write failed:/);
  assert.equal(fs.readFileSync(blocked, "utf8"), "blocked");
});

test("a later profile failure removes partial output and preserves the original thrown object", t => {
  const directory = path.join(temporary(t), "reports");
  const result = child(`
measureSync("first",()=>42);
const original={kind:"original"},circular={};circular.self=circular;
assert.throws(()=>measureSync("throw",()=>{throw original;},circular),error=>error===original);
assert.equal(measureSync("after.failure",()=>17),17);
process.stdout.write("original preserved\\n");
`, directory);
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "original preserved\n");
  assert.match(result.stderr, /MJ_PERF_DIR profile write failed:/);
  assert.deepEqual(fs.readdirSync(directory), []);
});
