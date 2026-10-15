import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const fixture = fileURLToPath(new URL("./fixtures/release-cleanup-lock.mjs", import.meta.url));
for (const [mode, behavior] of [
  ["transient", "recovers from a transient canonical-directory lock and preserves the Git failure"],
  ["persistent", "bounds retries and reports a persistent verification-directory lock"],
  ["other", "reports unrelated cleanup errors without retrying"],
]) {
  test(`release cleanup ${behavior}`, () => {
    const result = spawnSync(process.execPath, [fixture, mode], { encoding: "utf8", timeout: 15000 });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    assert.equal(JSON.parse(result.stdout).mode, mode);
  });
}
