// Run in a separate process so the native recursive remover captures only this
// process's injected rmdir failure; other tests retain their original fs methods.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const mode = process.argv[2];
assert.ok(["transient", "persistent", "other"].includes(mode));
const temp = fs.realpathSync(os.tmpdir());
const repo = fs.mkdtempSync(path.join(temp, "cleanup-lock-fixture-"));
const makeTemp = fs.mkdtempSync;
const removeDir = fs.rmdirSync;
const removeDirAsync = fs.rmdir;
let root, attempts = 0, inject = true;

fs.mkdtempSync = function (prefix, ...args) {
  const result = makeTemp.call(fs, prefix, ...args);
  if (path.basename(String(prefix)) === "release-install-") {
    root = result;
    fs.mkdirSync(path.join(root, "canonical"));
  }
  return result;
};
function capturedFailure(target) {
  const locked = root && (mode === "persistent" ? root : path.join(root, "canonical"));
  if (inject && locked && path.resolve(String(target)).toLowerCase() === locked.toLowerCase()) {
    attempts++;
    if (mode !== "transient" || attempts === 1) {
      const error = new Error(`captured cleanup lock: ${target}`);
      error.code = mode === "other" ? "EACCES" : "EBUSY";
      return error;
    }
  }
}
fs.rmdirSync = function (target, ...args) {
  const error = capturedFailure(target);
  if (error) throw error;
  return removeDir.call(fs, target, ...args);
};
fs.rmdir = function (target, ...args) {
  const error = capturedFailure(target);
  if (error) return queueMicrotask(() => args.at(-1)(error));
  return removeDirAsync.call(fs, target, ...args);
};

try {
  const init = spawnSync("git", ["init", "--quiet"], { cwd: repo, encoding: "utf8" });
  assert.equal(init.status, 0, init.stderr);
  const { verifyReleaseInstall } = await import("../../scripts/release-verify-install.mjs");
  let failure;
  try {
    // Invalid source fails before checkout/installation; the real finally path
    // still removes the canonical directory carrying the captured CI lock.
    await verifyReleaseInstall({ canonicalSha: "0".repeat(40), repoRoot: repo });
  } catch (error) {
    failure = error;
  }
  assert.ok(failure, "invalid canonical ref must remain a failure");
  if (mode === "transient") {
    assert.notEqual(failure.code, "EBUSY", "transient cleanup lock must not replace the original Git error");
    assert.match(failure.message, /invalid reference/);
    assert.ok(attempts > 1, "transient lock must be retried");
    assert.equal(fs.existsSync(root), false, "temporary verification root must be removed");
  } else if (mode === "persistent") {
    assert.equal(failure.code, "EBUSY");
    assert.ok(attempts > 1 && attempts < 20, "persistent lock must retry within a finite bound");
  } else {
    assert.equal(failure.code, "EACCES");
    assert.equal(attempts, 1, "unrelated cleanup errors must not retry");
  }
  console.log(JSON.stringify({ mode, attempts, errorCode: failure.code ?? null }));
} finally {
  inject = false;
  fs.mkdtempSync = makeTemp;
  for (const target of [root, repo].filter(Boolean)) {
    if (!fs.existsSync(target)) continue;
    const relative = path.relative(temp, fs.realpathSync(target));
    assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative), "fixture cleanup must stay in temp");
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  fs.rmdirSync = removeDir;
  fs.rmdir = removeDirAsync;
}
