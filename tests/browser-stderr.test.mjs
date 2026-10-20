import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { captureBrowserStderr, STDERR_LIMIT, STDERR_LOGGER_SOURCE } from "./helpers/capture-browser-stderr.mjs";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checker = path.join(repo, "plugins/html-guide-kit/skills/site/scripts/check_renderings.py");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
let interpreter;
function python() {
  if (interpreter) return interpreter;
  const candidates = [];
  if (process.env.HTML_SITE_PYTHON || process.env.PYTHON) candidates.push([process.env.HTML_SITE_PYTHON || process.env.PYTHON, []]);
  candidates.push(["python3", []], ["python", []], ["py", ["-3"]]);
  for (const [command, args] of candidates) {
    const result = spawnSync(command, [...args, "-c", "import sys; assert sys.version_info >= (3,10)"], { encoding: "utf8", shell: false, timeout: 10000 });
    if (!result.error && result.status === 0) return interpreter = { command, args };
  }
  assert.fail("stderr capture tests require actual Python >=3.10");
}
function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "browser-stderr-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 }));
  return directory;
}

test("actual Python drains a large stderr stream into a bounded exact tail and byte counters", { timeout: 20000 }, t => {
  const directory = temporary(t), py = python();
  const attempt = path.join(directory, "capture ' quoted directory");
  fs.mkdirSync(attempt);
  const bytes = Buffer.concat([Buffer.alloc(2 * 1024 * 1024, 0x61), Buffer.from("LAST stderr bytes\n")]);
  const result = spawnSync(py.command, [...py.args, "-c", STDERR_LOGGER_SOURCE, attempt, String(process.pid)], {
    input: bytes, encoding: "utf8", shell: false, timeout: 15000,
    env: { ...process.env, PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" },
  });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const tail = fs.readFileSync(path.join(attempt, "stderr.tail"));
  const metadata = JSON.parse(fs.readFileSync(path.join(attempt, "metadata.json"), "utf8"));
  assert.equal(tail.length, STDERR_LIMIT);
  assert.deepEqual(tail, bytes.subarray(-STDERR_LIMIT));
  assert.equal(metadata.totalBytes, bytes.length);
  assert.equal(metadata.storedBytes, STDERR_LIMIT);
  assert.equal(metadata.truncated, true);
  assert.equal(metadata.complete, true);
  assert.equal(metadata.acceptanceStatus, "NOT_RUN");
});

test("Linux exec capture preserves original checker args, failure, owned-session cleanup and foreign isolation", { skip: process.platform !== "linux", timeout: 30000 }, async t => {
  const directory = temporary(t), py = python();
  const root = path.join(directory, "artifact ' original");
  fs.mkdirSync(root);
  for (const [name, content] of Object.entries({
    "index.html": "<!doctype html><html><head><meta charset=\"utf-8\"></head><body>unchanged</body></html>",
    "theme.css": "body{color:black}",
    "learning.js": "\"use strict\";",
  })) fs.writeFileSync(path.join(root, name), content);
  const original = Object.fromEntries(fs.readdirSync(root).map(name => [name, hash(fs.readFileSync(path.join(root, name)))]));
  const checkerBefore = hash(fs.readFileSync(checker));
  const recordPath = path.join(directory, "fake args.json");
  const fake = path.join(directory, "fake browser ' ; no shell evaluation");
  const fakeSource = [
    "#!/usr/bin/env python3",
    "import json, os, sys",
    "with open(os.environ['CAPTURE_BROWSER_RECORD'], 'w') as output:",
    "    json.dump({'pid': os.getpid(), 'sid': os.getsid(0), 'argv': sys.argv[1:]}, output)",
    "data = b'x' * (2 * 1024 * 1024) + b'FAKE BROWSER EXIT 23\\n'",
    "while data:",
    "    written = os.write(2, data)",
    "    data = data[written:]",
    "raise SystemExit(23)",
    "",
  ].join("\n");
  fs.writeFileSync(fake, fakeSource, { mode: 0o700 });
  const capture = captureBrowserStderr({ directory, executable: fake, pythonCommand: py.command, pythonArgs: py.args });
  assert.deepEqual(capture.diagnostics().attempts, [], "missing diagnostic files must be safe before launch");
  const foreign = spawn(py.command, [...py.args, "-c", "import time; time.sleep(60)"], { detached: true, stdio: "ignore" });
  await once(foreign, "spawn");
  t.after(async () => {
    if (foreign.exitCode === null && foreign.signalCode === null) {
      const exited = once(foreign, "exit");
      foreign.kill("SIGTERM");
      await exited;
    }
  });
  const result = spawnSync(py.command, [...py.args, checker, "--input", root, "--browser", capture.executable, "--screenshots", path.join(directory, "shots")], {
    encoding: "utf8", shell: false, timeout: 20000, maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1", CAPTURE_BROWSER_RECORD: recordPath },
  });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 2, result.stdout + result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "NOT_RUN");
  assert.deepEqual(report.viewports, []);
  assert.ok(report.lifecycle.some(row => row.phase === "browser-process-exit" && row.returnCode === 23 && row.status === "PASS"));
  assert.ok(report.lifecycle.some(row => row.phase === "owned-browser-session-exit" && row.status === "PASS"));
  assert.equal(report.lifecycle.at(-1).phase, "temporary-cleanup");
  assert.equal(report.lifecycle.at(-1).status, "PASS");
  const recorded = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  const profile = recorded.argv.find(value => value.startsWith("--user-data-dir=")).slice("--user-data-dir=".length);
  const expected = ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=0", "--user-data-dir=" + profile, "--allow-file-access-from-files", "about:blank"];
  if (process.getuid() === 0) expected.unshift("--no-sandbox");
  assert.deepEqual(recorded.argv, expected);
  assert.equal(recorded.pid, recorded.sid, "exec must preserve the launcher's owned session identity");
  assert.equal(fs.existsSync(path.dirname(profile)), false, "original checker must clean its own QA root");
  const diagnostics = capture.diagnostics();
  assert.equal(diagnostics.instrumented, true);
  assert.equal(diagnostics.acceptanceStatus, "NOT_RUN");
  assert.equal(diagnostics.attempts.length, 1);
  const observed = diagnostics.attempts[0];
  assert.equal(observed.metadata.browserPid, recorded.pid);
  assert.equal(observed.metadata.sessionId, recorded.sid);
  assert.equal(observed.metadata.truncated, true);
  assert.equal(observed.metadata.totalBytes, 2 * 1024 * 1024 + Buffer.byteLength("FAKE BROWSER EXIT 23\n"));
  assert.equal(observed.stderr.bytes, STDERR_LIMIT);
  assert.ok(observed.stderr.tail.endsWith("FAKE BROWSER EXIT 23\n"));
  const inspection = spawnSync(py.command, [...py.args, "-c", "import importlib.util,json,sys; s=importlib.util.spec_from_file_location('qa',sys.argv[1]); q=importlib.util.module_from_spec(s); s.loader.exec_module(q); print(json.dumps(q.live_session_groups(int(sys.argv[2]))))", checker, String(recorded.sid)], {
    encoding: "utf8", shell: false, timeout: 10000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
  });
  assert.equal(inspection.status, 0, inspection.stderr);
  assert.deepEqual(JSON.parse(inspection.stdout), {});
  assert.doesNotThrow(() => process.kill(foreign.pid, 0), "foreign process must survive owned-session cleanup");
  for (const [name, digest] of Object.entries(original)) assert.equal(hash(fs.readFileSync(path.join(root, name))), digest);
  assert.equal(hash(fs.readFileSync(checker)), checkerBefore);
  fs.rmSync(diagnostics.captureRoot, { recursive: true, force: true });
  assert.doesNotThrow(() => capture.diagnostics(), "missing files must not cover the original failure");
});
