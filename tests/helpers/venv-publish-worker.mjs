// A worker process for the bridge-venv atomic-publish concurrency test. Each worker builds a small
// FAKE staged venv (no real uv build — the race we test is in the publish, not the build), waits on
// a shared wall-clock barrier so all workers call publishVenvAtomically at ~the same instant, then
// publishes to the shared `dest`. It prints a one-line JSON verdict:
//   { id, outcome: "won" | "reused" | "error", error, stagingExists }
// argv: <dest> <id> <startTimeMs>
//
// The staged tree carries the interpreter path publishVenvAtomically checks, a .ready marker, and a
// batch of filler files — ALL stamped with this worker's id. An atomic rename publishes exactly one
// worker's tree, so every file under `dest` shares one id. A non-atomic copy would let concurrent
// publishers interleave and leave a mix of ids (the more filler files, the wider that window), which
// the test detects.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { publishVenvAtomically, venvPython } from "./nlm-bridge-venv.mjs";

const FILLER_COUNT = 40;
const [dest, id, startTimeMs] = process.argv.slice(2);

const staging = fs.mkdtempSync(path.join(os.tmpdir(), "lk-bridge-build-"));
const pyPath = venvPython(staging);
fs.mkdirSync(path.dirname(pyPath), { recursive: true });
fs.writeFileSync(pyPath, id);
fs.writeFileSync(path.join(staging, ".ready"), id);
const fillerDir = path.join(staging, "venv", "lib");
fs.mkdirSync(fillerDir, { recursive: true });
for (let i = 0; i < FILLER_COUNT; i++) fs.writeFileSync(path.join(fillerDir, `f${i}`), id);

async function main() {
  await new Promise((r) => setTimeout(r, Math.max(0, Number(startTimeMs) - Date.now())));
  let outcome;
  let error = null;
  try {
    publishVenvAtomically(staging, dest);
    outcome = fs.readFileSync(path.join(dest, ".ready"), "utf8") === id ? "won" : "reused";
  } catch (e) {
    outcome = "error";
    error = e.message;
  }
  process.stdout.write(`${JSON.stringify({ id, outcome, error, stagingExists: fs.existsSync(staging) })}\n`);
}

main();
