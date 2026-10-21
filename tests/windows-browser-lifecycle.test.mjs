import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
test("actual Windows jobs own immediate-exit detached descendants, late endpoints and fail-closed cleanup without killing a foreign canary", { skip: process.platform !== "win32", timeout: 90000 }, () => {
  const candidates = [process.env.HTML_SITE_PYTHON || process.env.PYTHON, "python3", "python", "py"].filter(Boolean);
  let interpreter;
  for (const executable of candidates) {
    const args = executable === "py" ? ["-3"] : [];
    const probe = spawnSync(executable, [...args, "-c", "import sys;assert sys.version_info >= (3,10)"], { encoding: "utf8", shell: false, timeout: 10000 });
    if (!probe.error && probe.status === 0) { interpreter = { executable, args }; break; }
  }
  assert.ok(interpreter, "actual Windows kernel tests require Python; cannot skip failed ownership prerequisites");
  const result = spawnSync(interpreter.executable, [...interpreter.args, path.join(repo, "tests/helpers/windows-browser-cases.py"), path.join(repo, "plugins/html-guide-kit/skills/site/scripts/check_renderings.py")], {
    cwd: repo, encoding: "utf8", shell: false, timeout: 75000, maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" },
  });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "PASS");
  assert.equal(report.cases.length, 14);
  assert.equal(report.foreignSurvivedEveryCase, true);
  console.log(JSON.stringify(report));
});
