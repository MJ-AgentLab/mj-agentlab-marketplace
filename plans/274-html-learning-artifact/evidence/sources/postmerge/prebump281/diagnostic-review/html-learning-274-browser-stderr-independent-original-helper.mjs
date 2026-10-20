import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const STDERR_LIMIT = 64 * 1024;

// This collector drains after reaching the limit; a full pipe must never stall Chromium.
export const STDERR_LOGGER_SOURCE = [
  "import json, os, select, signal, sys, time",
  "directory, browser_pid = sys.argv[1], int(sys.argv[2])",
  "limit, total, tail, stopping = 65536, 0, b'', None",
  "tail_path = os.path.join(directory, 'stderr.tail')",
  "metadata_path = os.path.join(directory, 'metadata.json')",
  "def stop(signum, frame):",
  "    global stopping",
  "    stopping = time.monotonic() + 0.25",
  "if os.name == 'posix':",
  "    signal.signal(signal.SIGTERM, stop)",
  "def persist(complete=False, reason=None):",
  "    with open(tail_path, 'wb', buffering=0) as output:",
  "        output.write(tail)",
  "    record = {'instrumented': True, 'acceptanceStatus': 'NOT_RUN',",
  "              'pid': os.getpid(), 'browserPid': browser_pid,",
  "              'sessionId': os.getsid(0) if hasattr(os, 'getsid') else None,",
  "              'totalBytes': total, 'storedBytes': len(tail), 'limitBytes': limit,",
  "              'truncated': total > limit, 'complete': complete, 'reason': reason}",
  "    pending = metadata_path + '.pending'",
  "    with open(pending, 'w', encoding='utf-8') as output:",
  "        json.dump(record, output)",
  "        output.write('\\n')",
  "    os.replace(pending, metadata_path)",
  "persist()",
  "try:",
  "    while True:",
  "        if stopping is not None and time.monotonic() >= stopping:",
  "            persist(reason='owned-session termination before EOF')",
  "            break",
  "        if os.name == 'posix' and not select.select([0], [], [], 0.05)[0]:",
  "            continue",
  "        block = os.read(0, 8192)",
  "        if not block:",
  "            persist(complete=True)",
  "            break",
  "        total += len(block)",
  "        tail = (tail + block)[-limit:]",
  "        persist()",
  "except Exception as error:",
  "    persist(reason=type(error).__name__ + ': ' + str(error)[:200])",
  "    raise",
  "",
].join("\n");

const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const argument = value => {
  if (typeof value !== "string" || value.includes("\0")) throw new Error("capture arguments must be strings without NUL");
  return "'" + value.replaceAll("'", "'\\''") + "'";
};

function boundedFile(file, limit) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("diagnostic must be an ordinary file");
  const descriptor = fs.openSync(file, "r");
  try {
    const bytes = Buffer.alloc(Math.min(stat.size, limit));
    const length = fs.readSync(descriptor, bytes, 0, bytes.length, Math.max(0, stat.size - bytes.length));
    return bytes.subarray(0, length);
  } finally {
    fs.closeSync(descriptor);
  }
}

export function captureBrowserStderr({ directory, executable, pythonCommand, pythonArgs = [] }) {
  if (process.platform !== "linux") throw new Error("browser stderr exec capture is Linux-only");
  if (!path.isAbsolute(directory) || !path.isAbsolute(executable)) throw new Error("capture directory and executable must be absolute");
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("capture directory must be an ordinary directory");
  if (!Array.isArray(pythonArgs)) throw new Error("pythonArgs must be an array");
  for (const value of [executable, pythonCommand, ...pythonArgs]) argument(value);
  const realExecutable = fs.realpathSync(executable);
  if (!fs.statSync(realExecutable).isFile()) throw new Error("browser executable must be a file");
  fs.accessSync(realExecutable, fs.constants.X_OK);
  const captureRoot = fs.mkdtempSync(path.join(fs.realpathSync(directory), "browser-stderr-"));
  const logger = path.join(captureRoot, "drain.py");
  const shim = path.join(captureRoot, "browser");
  fs.writeFileSync(logger, STDERR_LOGGER_SOURCE, { flag: "wx", mode: 0o600 });
  const loggerCommand = [pythonCommand, ...pythonArgs, "-u", logger].map(argument).join(" ");
  const shimSource = [
    "#!/usr/bin/env bash",
    "set -e",
    "attempt=$(mktemp -d -- " + argument(path.join(captureRoot, "attempt-XXXXXX")) + ")",
    "browser_pid=$$",
    "exec " + argument(realExecutable) + ' "$@" 2> >(' + loggerCommand + ' "$attempt" "$browser_pid")',
    "",
  ].join("\n");
  fs.writeFileSync(shim, shimSource, { flag: "wx", mode: 0o700 });
  const identity = {
    instrumented: true,
    acceptanceStatus: "NOT_RUN",
    scope: "stderr capture only; checker arguments, logic and deadlines are unchanged; no independent acceptance substitute",
    realExecutable,
    captureRoot,
    limitBytes: STDERR_LIMIT,
    shimSha256: hash(Buffer.from(shimSource)),
    loggerSha256: hash(Buffer.from(STDERR_LOGGER_SOURCE)),
  };
  let version;
  function browserVersion() {
    if (version) return version;
    try {
      const result = spawnSync(realExecutable, ["--version"], {
        shell: false, encoding: "utf8", timeout: 5000, maxBuffer: 4096,
      });
      version = {
        purpose: "bounded executable identity probe; not a rendering or acceptance result",
        args: ["--version"], status: result.status, signal: result.signal,
        error: result.error ? { code: result.error.code ?? null, message: result.error.message.slice(0, 300) } : null,
        output: Buffer.from((result.stdout ?? "") + (result.stderr ?? "")).subarray(-4096).toString("utf8"),
      };
    } catch (error) {
      version = { purpose: "executable identity probe", error: error.message.slice(0, 300) };
    }
    return version;
  }
  return {
    executable: shim,
    diagnostics() {
      // Diagnostics must never replace the original checker failure with a read error.
      try {
        const entries = fs.readdirSync(captureRoot, { withFileTypes: true })
          .filter(entry => entry.isDirectory() && entry.name.startsWith("attempt-"))
          .map(entry => ({ name: entry.name, modified: fs.statSync(path.join(captureRoot, entry.name)).mtimeMs }))
          .sort((a, b) => a.modified - b.modified);
        const attempts = entries.slice(-4).map(({ name }) => {
          const result = { name };
          try { result.metadata = JSON.parse(boundedFile(path.join(captureRoot, name, "metadata.json"), 16384)); }
          catch (error) { result.metadataError = error.message.slice(0, 300); }
          try {
            const bytes = boundedFile(path.join(captureRoot, name, "stderr.tail"), STDERR_LIMIT);
            result.stderr = { bytes: bytes.length, sha256: hash(bytes), tail: bytes.toString("utf8") };
          } catch (error) { result.stderrError = error.message.slice(0, 300); }
          return result;
        });
        return { ...identity, attempts, omittedAttempts: Math.max(0, entries.length - attempts.length),
          executableVersion: attempts.length ? browserVersion() : null };
      } catch (error) {
        return { ...identity, attempts: [], diagnosticError: error.message.slice(0, 300) };
      }
    },
  };
}
