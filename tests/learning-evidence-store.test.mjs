import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function python312() {
  const candidates = process.env.LEK_PYTHON ? [[process.env.LEK_PYTHON, []]] : [];
  candidates.push(["python3.12", []], ["python3", []], ["python", []], ["py", ["-3.12"]]);
  const located = spawnSync("uv", ["python", "find", "3.12"], { encoding: "utf8", shell: false, timeout: 10000 });
  if (!located.error && located.status === 0 && located.stdout.trim()) candidates.push([located.stdout.trim(), []]);
  for (const [command, args] of candidates) {
    const probe = spawnSync(command, [...args, "-c", "import sys; print(sys.version); raise SystemExit(0 if sys.version_info[:2] == (3,12) else 1)"],
      { encoding: "utf8", shell: false, timeout: 10000 });
    if (!probe.error && probe.status === 0) return { command, args, version: probe.stdout.trim() };
  }
  assert.fail("Learning evidence storage tests require an actual Python 3.12 interpreter; they cannot be skipped.");
}

test("Learning evidence storage: actual Python 3.12 isolated recovery/import/attribution cases", { timeout: 180000 }, (t) => {
  const interpreter = python312();
  t.diagnostic(`Interpreter: ${interpreter.version}`);
  const cases = path.join(root, "tests", "fixtures", "learning-evidence", "store_cases.py");
  const lek = path.join(root, "plugins", "learning-evidence-kit", "scripts", "lek.py");
  const result = spawnSync(interpreter.command, [...interpreter.args, cases, lek], {
    encoding: "utf8", shell: false, timeout: 170000,
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1", PYTHONUTF8: "1" },
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.stdout.trim()) t.diagnostic(result.stdout.trim());
  if (result.stderr.trim()) t.diagnostic(result.stderr.trim());
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
