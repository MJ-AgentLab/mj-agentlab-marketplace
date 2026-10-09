import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runCli } from "./run-cli.mjs";
import { validateRepository } from "./validate-portable.mjs";
import { runSmoke } from "./smoke-codex-plugin.mjs";

/** Validate and install the exact canonical Git tree with an isolated Codex home. */
export async function verifyReleaseInstall({ canonicalSha, repoRoot = path.resolve(import.meta.dirname, ".."), install = runSmoke }) {
  if (!/^[0-9a-f]{40}$/.test(canonicalSha)) throw new Error("canonicalSha must be a 40-character SHA");
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "release-install-"));
  const worktree = path.join(root, "canonical");
  let attached = false;
  const git = async args => {
    const r = await runCli("git", args, { cwd: repoRoot, timeoutMs: 60000 });
    if (r.error || r.status !== 0) throw new Error(r.error?.message ?? r.stderr);
    return r.stdout.trim();
  };
  try {
    await git(["worktree", "add", "--detach", worktree, canonicalSha]);
    attached = true;
    const head = await runCli("git", ["rev-parse", "HEAD"], { cwd: worktree, timeoutMs: 10000 });
    if (head.status !== 0 || head.stdout.trim() !== canonicalSha) throw new Error("release installation tree does not match canonical SHA");
    const validation = validateRepository(worktree);
    if (!validation.ok) throw new Error(validation.errors.join("\n"));
    const result = await install({ repoRoot: worktree });
    if (result?.ok !== true) throw new Error("canonical installation verification failed");
    return result;
  } finally {
    if (attached) await git(["worktree", "remove", worktree]);
    const relative = path.relative(fs.realpathSync(os.tmpdir()), fs.realpathSync(root));
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("unsafe release verification cleanup path");
    fs.rmSync(root, { recursive: true, force: true });
  }
}
