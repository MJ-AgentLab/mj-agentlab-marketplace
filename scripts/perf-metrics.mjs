import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

const directory = process.env.MJ_PERF_DIR;
const report = directory ? path.join(directory, `perf-${process.pid}-${randomUUID()}.ndjson`) : undefined;
let failed = false;
let ready = false;

function record(phase, started, status, details) {
  if (failed) return;
  try {
    const entry = { phase, durationMs: performance.now() - started, status, pid: process.pid, details };
    const line = JSON.stringify(entry) + "\n";
    if (!ready) {
      fs.mkdirSync(directory, { recursive: true });
      ready = true;
    }
    fs.appendFileSync(report, line, "utf8");
  } catch (error) {
    failed = true;
    // An incomplete profile must not be accepted as a successful measurement run.
    process.exitCode = process.exitCode || 1;
    try { process.stderr.write(`MJ_PERF_DIR profile write failed: ${error.message}\n`); } catch { /* Preserve the operation's original outcome even if stderr is unavailable. */ }
    try { fs.rmSync(report, { force: true }); } catch { /* The failing run remains invalid. */ }
  }
}

/** Opt-in timing; instrumentation never replaces an operation's return value or error. */
export function measureSync(phase, operation, details = {}) {
  if (!directory) return operation();
  const started = performance.now();
  let status = "ok";
  try {
    return operation();
  } catch (error) {
    status = "error";
    throw error;
  } finally {
    record(phase, started, status, details);
  }
}

export async function measureAsync(phase, operation, details = {}) {
  if (!directory) return await operation();
  const started = performance.now();
  let status = "ok";
  try {
    return await operation();
  } catch (error) {
    status = "error";
    throw error;
  } finally {
    record(phase, started, status, details);
  }
}
