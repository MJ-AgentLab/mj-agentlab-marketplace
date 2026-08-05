// Always-run tests for the bridge-venv harness helper (tests/helpers/nlm-bridge-venv.mjs) that do
// NOT need a real Python venv. Covers publishVenvAtomically — the concurrency-safe publish that
// replaced the racy in-place build. `node --test` runs the two bridge-venv test files in parallel
// worker processes, so on a cold cache both used to build into the same directory and clobber each
// other; this proves the atomic staging -> rename publish tolerates concurrent cold builders.

import test from "node:test";
import assert from "node:assert/strict";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { publishVenvAtomically, venvPython } from "./helpers/nlm-bridge-venv.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORKER = path.join(HERE, "helpers", "venv-publish-worker.mjs");

function runWorker(dest, id, startTimeMs) {
  return new Promise((resolve, reject) => {
    const c = spawn(process.execPath, [WORKER, dest, id, String(startTimeMs)], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    c.stdout.on("data", (d) => (out += d.toString()));
    c.stderr.on("data", (d) => (err += d.toString()));
    c.on("error", reject);
    c.on("close", (code) => {
      if (code !== 0) return reject(new Error(`worker ${id} exited ${code}: ${err}`));
      try {
        resolve(JSON.parse(out.trim()));
      } catch {
        reject(new Error(`worker ${id} bad output: <${out}> stderr:<${err}>`));
      }
    });
  });
}

/** Every file under a published venv must carry a single builder's id — an atomic rename publishes
 *  exactly one staged tree, so a mix of ids proves two builders clobbered each other. */
function collectIds(dir, out = new Set()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collectIds(p, out);
    else out.add(fs.readFileSync(p, "utf8"));
  }
  return out;
}

test("bridge venv publish is atomic: concurrent cold builders never corrupt the shared venv", async () => {
  const ROUNDS = 4;
  const N = 8;
  for (let round = 0; round < ROUNDS; round++) {
    const dest = path.join(os.tmpdir(), `lk-bridge-pubtest-${process.pid}-${Date.now()}-${round}`);
    fs.rmSync(dest, { recursive: true, force: true });
    try {
      const startTimeMs = Date.now() + 600; // barrier: every worker publishes at ~the same instant
      const results = await Promise.all(
        Array.from({ length: N }, (_, i) => runWorker(dest, `builder-${round}-${i}`, startTimeMs)),
      );

      // The published venv is complete and coherent — no torn tree, no mixed ids.
      assert.ok(fs.existsSync(path.join(dest, ".ready")), `round ${round}: dest .ready present`);
      assert.ok(fs.existsSync(venvPython(dest)), `round ${round}: dest interpreter present`);
      const winnerId = fs.readFileSync(path.join(dest, ".ready"), "utf8");
      const ids = collectIds(dest);
      assert.deepEqual(
        [...ids],
        [winnerId],
        `round ${round}: every published file came from one builder (no clobbering mix): ${[...ids]}`,
      );

      // Exactly one builder won the rename; the rest reused it; none errored.
      assert.deepEqual(
        results.filter((r) => r.outcome === "error"),
        [],
        `round ${round}: no builder errored`,
      );
      const winners = results.filter((r) => r.outcome === "won");
      assert.equal(winners.length, 1, `round ${round}: exactly one builder won the publish`);
      assert.equal(winners[0].id, winnerId, `round ${round}: the reported winner is the published one`);
      assert.equal(
        results.filter((r) => r.outcome === "reused").length,
        N - 1,
        `round ${round}: every other builder reused the winner's venv`,
      );

      // No builder leaked a staging dir (winner's became `dest`; losers cleaned theirs).
      assert.ok(
        results.every((r) => r.stagingExists === false),
        `round ${round}: every builder's staging dir was consumed or cleaned`,
      );
    } finally {
      fs.rmSync(dest, { recursive: true, force: true });
    }
  }
});

test("publishVenvAtomically surfaces a genuinely broken destination instead of reusing it", () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "lk-bridge-pubneg-"));
  try {
    const dest = path.join(base, "dest");
    // A dest that exists but is NOT a complete venv (no .ready / interpreter) — must not be reused.
    fs.mkdirSync(dest, { recursive: true });
    fs.writeFileSync(path.join(dest, "junk"), "x");

    const staging = fs.mkdtempSync(path.join(os.tmpdir(), "lk-bridge-build-"));
    const py = venvPython(staging);
    fs.mkdirSync(path.dirname(py), { recursive: true });
    fs.writeFileSync(py, "id");
    fs.writeFileSync(path.join(staging, ".ready"), "id");

    assert.throws(() => publishVenvAtomically(staging, dest), /EEXIST|ENOTEMPTY|EPERM|EACCES/);
    fs.rmSync(staging, { recursive: true, force: true });
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});
