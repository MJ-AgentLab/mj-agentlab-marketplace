import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { runCli } from "../scripts/run-cli.mjs";

const repo = path.resolve(import.meta.dirname, "..");
const sh = ["sh", "C:/Program Files/Git/bin/sh.exe"].find(command => spawnSync(command, ["-c", "exit 0"]).status === 0);
const pwsh = spawnSync("pwsh", ["-NoProfile", "-Command", "exit 0"]).status === 0;
if (process.env.REQUIRE_PWSH === "1") assert.ok(pwsh, "required PowerShell is missing");
if (process.env.REQUIRE_SHELL === "1") assert.ok(sh, "required shell is missing");
const options = { skip: (!sh || !pwsh) && "Git shell and PowerShell required" };
function fixture(t) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), "communication-scope-"));
  t.after(() => {
    const relative = path.relative(fs.realpathSync.native(os.tmpdir()), fs.realpathSync.native(root));
    assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(root, "scripts"));
  for (const file of ["install-hooks.ps1", "validate-commits.ps1", "validate-commits.sh"]) fs.copyFileSync(path.join(repo, "scripts", file), path.join(root, "scripts", file));
  const config = path.join(root, "empty-gitconfig");fs.writeFileSync(config, "");
  const env = { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: config, GIT_AUTHOR_NAME: "Synthetic fixture", GIT_AUTHOR_EMAIL: "fixture@example.invalid", GIT_COMMITTER_NAME: "Synthetic fixture", GIT_COMMITTER_EMAIL: "fixture@example.invalid" };
  const git = args => { const result = spawnSync("git", args, { cwd: root, env, encoding: "utf8" }); assert.equal(result.status, 0, result.stdout + result.stderr); return result; };
  git(["init", "--quiet"]);
  git(["-c", "core.hooksPath=disabled", "commit", "--quiet", "--allow-empty", "-m", "test(scripts): start synthetic history"]);
  return { root, env, git };
}

test("both commit validators accept communication-kit and preserve rejection boundaries", options, async t => {
  const { root, env, git } = fixture(t);
  for (const [subject, expected] of [["feat(communication-kit): add draft support", 0], ["fix(learn-kit): retain historical compatibility", 0], ["feat(communications-kit): reject misspelled scope", 1], ["chore(communication-kit): reject unknown type", 1]]) {
    git(["-c", "core.hooksPath=disabled", "commit", "--quiet", "--allow-empty", "-m", subject]);
    for (const [command, args] of [[sh, ["./scripts/validate-commits.sh", "HEAD~1..HEAD"]], ["pwsh", ["-NoProfile", "-File", "./scripts/validate-commits.ps1", "-Range", "HEAD~1..HEAD"]]]) {
      const result = await runCli(command, args, { cwd: root, env, timeoutMs: 60000 });
      assert.equal(result.status, expected, subject + "\n" + result.stdout + result.stderr);
      if (expected) assert.match(result.stdout + result.stderr, /communication-kit/, "diagnostics name the approved scope");
    }
  }
});

test("installed commit hook enforces the communication candidate scope", options, async t => {
  const { root, env } = fixture(t);
  const installed = await runCli("pwsh", ["-NoProfile", "-File", "./scripts/install-hooks.ps1"], { cwd: root, env, timeoutMs: 60000 });
  assert.equal(installed.status, 0, installed.stdout + installed.stderr);
  assert.ok(fs.existsSync(path.join(root, ".git/hooks/pre-push")));
  const message = path.join(root, "commit-message.txt");
  for (const [subject, expected] of [["feat(communication-kit): add draft support", 0], ["feat(communication): reject unknown scope", 1]]) {
    fs.writeFileSync(message, subject + "\n\nRefs #222\n");
    const result = await runCli(sh, ["./.git/hooks/commit-msg", message], { cwd: root, env, timeoutMs: 60000 });
    assert.equal(result.status, expected, result.stdout + result.stderr);
  }
});
