// Shared command resolution for every executable this repo starts.
//
// Rationale (plan §2.4): repo-level Claude wrapper, Codex smoke, baseline version probing and
// the MCP stdio probe must all launch executables through ONE entry point. Node's builtin
// spawn(logicalName, { shell: false }) cannot start a Windows `.cmd` shim (ENOENT), so every
// caller would otherwise grow its own divergent workaround. cross-spawn@7.0.6 is pinned and
// performs the PATHEXT-aware resolution centrally.
//
// NOTE: the in-package NLM helper (plan §2.5) deliberately does NOT use this module — it must
// stay dependency-free inside the installed plugin. It carries its own stdlib resolver.

import crossSpawn from "cross-spawn";

/**
 * Start a command. Always argv-array + shell:false — never a concatenated string.
 * @param {string} name logical command name or absolute path
 * @param {string[]} args
 * @param {object} [options] passed through to cross-spawn
 * @returns {import("node:child_process").ChildProcess}
 */
export function spawnCli(name, args = [], options = {}) {
  if (typeof name !== "string" || name.length === 0) {
    throw new TypeError("spawnCli: name must be a non-empty string");
  }
  if (!Array.isArray(args) || args.some((a) => typeof a !== "string")) {
    throw new TypeError("spawnCli: args must be a string[]");
  }
  if (options.shell) {
    // A shell would re-interpret quoting and reintroduce injection via user-controlled paths.
    throw new TypeError("spawnCli: options.shell is forbidden");
  }
  return crossSpawn(name, args, { ...options, shell: false });
}

/**
 * Run a command to completion and collect its output. Built on spawnCli.
 * @returns {Promise<{ status: number|null, stdout: string, stderr: string, error?: Error }>}
 */
export function runCli(name, args = [], options = {}) {
  const { timeoutMs, input, ...rest } = options;
  return new Promise((resolve) => {
    let child;
    try {
      child = spawnCli(name, args, { ...rest, stdio: ["pipe", "pipe", "pipe"] });
    } catch (error) {
      resolve({ status: null, stdout: "", stderr: String(error?.message ?? error), error });
      return;
    }

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timer;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve(result);
    };

    child.stdout?.on("data", (d) => {
      stdout += d;
    });
    child.stderr?.on("data", (d) => {
      stderr += d;
    });
    child.on("error", (error) => finish({ status: null, stdout, stderr, error }));
    child.on("close", (status) => finish({ status, stdout, stderr }));

    if (typeof timeoutMs === "number" && timeoutMs > 0) {
      timer = setTimeout(() => {
        child.kill();
        finish({
          status: null,
          stdout,
          stderr,
          error: new Error(`runCli: timed out after ${timeoutMs}ms`),
        });
      }, timeoutMs);
    }

    if (input !== undefined) child.stdin?.end(input);
  });
}
