// The learn-kit NLM bridge conformance probe (plan §2.4).
//
// This is the OUTER, OS-level harness that attests the bridge's runtime behaviour. It runs one of
// three isolated modes and returns/asserts what it observed:
//
//   bootstrap          Drive the bridge as an MCP client (initialize/initialized/ping/tools/list).
//                      Prove it answers LOCALLY with its own safe instructions and exactly the six
//                      narrowed tools, spawns no browser/login launcher IN ITS PROCESS SUBTREE, opens
//                      no external connection from that subtree, and never surfaces a credential
//                      marker on instructions/tools/stderr. Run twice: once with a completely empty
//                      home, once with a synthetic credential sentinel (directory shape, no real
//                      secret) so a stray read echoed anywhere shows up as a leak. Bootstrap drives
//                      only the inert handshake (no tool call) with no --audit hook, so its browser
//                      check is subtree-scoped — a browser reparented to the OS shell is out of reach
//                      here; the audited verify modes catch that vector via classifyAudit.
//   upstream-contract  CI / manual only. Run `learn-kit-nlm-bridge --verify-upstream-contract` in a
//                      credential-free, isolated home. The bridge's own run_verify drives the single
//                      allowed child (the receipt-bound guarded runner) and proves the exact v0.8.7
//                      initialize/initialized/paginated tools/list against the pinned snapshot. The
//                      probe asserts exit 0, tools_verified, no egress audit family, no unexpected
//                      descendant. No NotebookLM tool is called.
//   auth-required      CI / manual only. Run `--verify-auth-required`: the guarded runner makes one
//                      real notebook_list and one schema-valid studio_create against the real
//                      connector with no credentials; both must normalize to AUTH_REQUIRED with zero
//                      Google request, zero browser/login child, zero mutation.
//
// The bridge's in-process sys.audit hook (installed by upstream_runner in --audit mode) is the
// evidence for what the guarded child did on the verify (tool) path; this probe's OS-level
// process-tree + connection scan is the authoritative outer check. Nothing here is a trusted
// authorization boundary — it fails closed on drift/missing-evidence and detects a browser or
// network reached from the bridge's process subtree (verify modes additionally catch a reparented
// browser via the audit). It cannot prove the absence of a browser opened via the OS shell during
// the inert bootstrap handshake; that residual is out of the subtree scan's reach and is only ever
// a concern for the audited tool path, which is fully covered.
//
// Exit codes: config / server / JSON / unsafe-harness errors -> 2; a contract or runtime
// conformance failure -> 1; success -> 0.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

import { spawnCli, runCli } from "./run-cli.mjs";

// --------------------------------------------------------------------------- constants

export const CONCRETE_MODES = ["bootstrap", "upstream-contract", "auth-required"];
export const MODES = [...CONCRETE_MODES, "all"];

// The six narrowed tools, sorted — the exact public surface both hosts must see.
export const PUBLIC_TOOL_NAMES = [
  "notebook_create",
  "notebook_get",
  "notebook_list",
  "source_add",
  "studio_create",
  "studio_status",
];

export const NEGOTIATED_PROTOCOL = "2025-06-18";

// sys.audit event families that mark real network egress. The loopback asyncio self-pipe on
// Windows fires socket.__new__ / socket.bind / socket.connect against 127.0.0.1, so those bare
// socket verbs are NOT egress; DNS (getaddrinfo/gethostby*), TLS (ssl.), and any HTTP client are.
export const NETWORK_EGRESS_FAMILIES = [
  "ssl.",
  "http.client.",
  "urllib.",
  "socket.getaddrinfo",
  "socket.gethostby",
];

// sys.audit families that mark an unexpected process launch (a browser, a login shell, a helper).
export const PROCESS_SPAWN_FAMILIES = [
  "subprocess.",
  "os.exec",
  "os.fork",
  "os.posix_spawn",
  "os.spawn",
  "os.startfile",
  "webbrowser",
];

// A browser image name or command fragment — the headless-Chrome path the auth guard exists to
// prevent. Safe to test against a full command line (unlike a bare "nlm", which also appears inside
// the sanctioned module name learn_kit_nlm_bridge).
export const FORBIDDEN_BROWSER_RE = /(chrome|chromium|msedge|firefox|webkit|headless[-_ ]?chrome)/i;

/** True if `name` is a raw nlm / notebooklm login launcher IMAGE (name only — the sanctioned
 *  runner's command line legitimately contains "nlm" inside learn_kit_nlm_bridge). */
export function isLoginLauncherName(name) {
  const base = String(name).replace(/\.(exe|cmd|bat|ps1)$/i, "").toLowerCase();
  return base === "nlm" || base === "notebooklm" || base === "notebooklm-mcp";
}

/**
 * A descendant that must never appear under the bridge: a browser (image or command line) or a raw
 * login launcher (image name). The uv venv python.exe is itself a launcher that spawns the base
 * interpreter, and the guarded runner is a python child on the tool path, so a bare "there is a
 * child process" is NOT a threat — only these signatures are.
 */
export function isThreatChild({ name = "", cmdline = "" } = {}) {
  return FORBIDDEN_BROWSER_RE.test(name) || FORBIDDEN_BROWSER_RE.test(cmdline) || isLoginLauncherName(name);
}

// Credential / profile sentinels that must never appear in captured output. `@\S+\.\S+` catches a
// bare email; the rest are cookie/token/session markers.
const LEAK_MARKERS = [
  /NOTEBOOKLM_COOKIES/i,
  /Set NOTEBOOKLM/i,
  /\bcsrf\b/i,
  /session[-_ ]?id/i,
  /\bcookie\b/i,
  /\bbearer\b/i,
  /authenticate via Chrome/i,
  /@[\w.-]+\.\w{2,}/,
];

const HANDSHAKE_TIMEOUT_MS = 30000;

// --------------------------------------------------------------------------- errors

export class ProbeHarnessError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProbeHarnessError";
    this.exitCode = 2;
  }
}

export class ProbeContractError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProbeContractError";
    this.exitCode = 1;
  }
}

// --------------------------------------------------------------------------- audit / leak scan

/**
 * Classify a bridge audit-event count map into the offending event names.
 * @param {Record<string, number>} events
 * @returns {{ network: string[], process: string[] }}
 */
export function classifyAudit(events) {
  const network = [];
  const proc = [];
  for (const name of Object.keys(events || {})) {
    if (NETWORK_EGRESS_FAMILIES.some((f) => name.startsWith(f))) network.push(name);
    if (PROCESS_SPAWN_FAMILIES.some((f) => name.startsWith(f))) proc.push(name);
  }
  return { network: network.sort(), process: proc.sort() };
}

/** Return the leak markers (and the synthetic sentinel, if any) that appear in `text`. */
export function scanLeaks(text, sentinel) {
  const hits = [];
  if (typeof text !== "string" || text.length === 0) return hits;
  for (const re of LEAK_MARKERS) if (re.test(text)) hits.push(re.source);
  if (sentinel && text.includes(sentinel)) hits.push("synthetic-credential-sentinel");
  return [...new Set(hits)];
}

// --------------------------------------------------------------------------- process tree

/** List every process as { pid, ppid, name, cmdline }, or null when the query is unavailable. The
 *  command line is needed to tell the sanctioned python runner apart from a browser one wraps. */
async function listProcesses() {
  if (process.platform === "win32") {
    const cmd =
      "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress";
    for (const shell of ["pwsh", "powershell"]) {
      const r = await runCli(shell, ["-NoProfile", "-NonInteractive", "-Command", cmd], {
        timeoutMs: 15000,
      });
      if (r.status !== 0 || !r.stdout.trim()) continue;
      try {
        const raw = JSON.parse(r.stdout);
        const rows = Array.isArray(raw) ? raw : [raw];
        return rows
          .filter((x) => x && x.ProcessId != null)
          .map((x) => ({
            pid: Number(x.ProcessId),
            ppid: Number(x.ParentProcessId),
            name: String(x.Name ?? ""),
            cmdline: String(x.CommandLine ?? ""),
          }));
      } catch {
        /* try the next shell */
      }
    }
    return null;
  }
  const r = await runCli("ps", ["-eo", "pid=,ppid=,comm=,args="], { timeoutMs: 15000 });
  if (r.status !== 0) return null;
  const rows = [];
  for (const line of r.stdout.split("\n")) {
    const m = line.trim().match(/^(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/);
    if (m) rows.push({ pid: Number(m[1]), ppid: Number(m[2]), name: m[3], cmdline: m[4] });
  }
  return rows;
}

/** Transitive descendants of `rootPid` from an already-fetched process list. Pure, so it can be
 *  unit-tested and reused across two scans without re-querying the OS. */
export function descendantsOf(rows, rootPid) {
  const byParent = new Map();
  for (const r of rows) {
    if (!byParent.has(r.ppid)) byParent.set(r.ppid, []);
    byParent.get(r.ppid).push(r);
  }
  const out = [];
  const seen = new Set([rootPid]);
  const queue = [rootPid];
  while (queue.length) {
    const parent = queue.shift();
    for (const child of byParent.get(parent) ?? []) {
      if (seen.has(child.pid)) continue; // guard against a pid-reuse cycle
      seen.add(child.pid);
      out.push({ pid: child.pid, name: child.name, cmdline: child.cmdline });
      queue.push(child.pid);
    }
  }
  return out;
}

/**
 * Transitive descendants of `rootPid`.
 * @returns {Promise<{ supported: boolean, descendants: Array<{ pid, name, cmdline }> }>}
 */
export async function enumerateDescendants(rootPid) {
  const rows = await listProcesses();
  if (!rows) return { supported: false, descendants: [] };
  return { supported: true, descendants: descendantsOf(rows, rootPid) };
}

/** Parse Windows `netstat -ano -p TCP` for external endpoints owned by a pid in `pidSet`. Pure. */
export function parseNetstat(stdout, pidSet) {
  const found = [];
  for (const line of stdout.split("\n")) {
    const cols = line.trim().split(/\s+/);
    if (cols.length < 5 || cols[0] !== "TCP") continue;
    const foreign = cols[2];
    const pid = Number(cols[cols.length - 1]);
    if (!pidSet.has(pid)) continue;
    if (isExternalEndpoint(foreign)) found.push(foreign);
  }
  return found;
}

/** Parse POSIX `ss -tanp` for external peers owned by a pid in `pidSet`. Pure. Columns are
 *  State(0) Recv-Q(1) Send-Q(2) Local(3) Peer(4) Process(5) — the peer is index 4, NOT the process
 *  field at 5 (getting that wrong classified every pid-tagged loopback socket as external). */
export function parseSs(stdout, pidSet) {
  const found = [];
  for (const line of stdout.split("\n")) {
    const m = line.match(/pid=(\d+)/);
    if (!m || !pidSet.has(Number(m[1]))) continue;
    const peer = line.trim().split(/\s+/)[4] ?? "";
    if (isExternalEndpoint(peer)) found.push(peer);
  }
  return found;
}

/** External (non-loopback) TCP endpoints owned by any pid in `pids`. Best-effort. */
async function scanConnections(pids) {
  const set = new Set(pids.map(Number));
  if (process.platform === "win32") {
    const r = await runCli("netstat", ["-ano", "-p", "TCP"], { timeoutMs: 15000 });
    return r.status !== 0 ? [] : parseNetstat(r.stdout, set);
  }
  // POSIX best-effort: ss may not tag pids without privilege; treat absence as "unsupported".
  const r = await runCli("ss", ["-tanp"], { timeoutMs: 15000 });
  return r.status !== 0 ? [] : parseSs(r.stdout, set);
}

export function isExternalEndpoint(endpoint) {
  if (!endpoint || endpoint === "*:*") return false;
  let host;
  const v6 = endpoint.match(/^\[(.+)\]:\d+$/); // [ipv6]:port
  if (v6) {
    host = v6[1];
  } else {
    const i = endpoint.lastIndexOf(":");
    host = i >= 0 ? endpoint.slice(0, i) : endpoint;
  }
  host = host.toLowerCase();
  if (!host || host === "*" || host === "0.0.0.0" || host === "::" || host === "::1" || host === "localhost") {
    return false;
  }
  if (host.startsWith("127.")) return false;
  return true;
}

/** Kill a process and every descendant. Best-effort; teardown must not throw. */
async function killTree(pid) {
  if (pid == null) return;
  if (process.platform === "win32") {
    await runCli("taskkill", ["/PID", String(pid), "/T", "/F"], { timeoutMs: 15000 }).catch(() => {});
    return;
  }
  let descendants = [];
  try {
    descendants = (await enumerateDescendants(pid)).descendants;
  } catch {
    /* best-effort */
  }
  for (const d of descendants) safeKill(d.pid);
  safeKill(pid);
}

function safeKill(pid) {
  try {
    process.kill(pid, "SIGKILL");
  } catch {
    /* already gone */
  }
}

// --------------------------------------------------------------------------- isolation

/** Build a fresh isolated home + temp under one probe root, so nothing touches the real user. */
function makeIsolatedDirs(mode) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `lk-probe-${mode}-`));
  // home and temp must be siblings, not nested, so neither is an ancestor of the other.
  const home = path.join(root, "home");
  const tmp = path.join(root, "tmp");
  for (const d of [path.join(home, "Roaming"), path.join(home, "Local"), path.join(home, "config"), tmp]) {
    fs.mkdirSync(d, { recursive: true });
  }
  return { root, home, tmp };
}

/** An env whose home/config/temp all point at the isolated dirs; everything else is carried over
 *  so the command still resolves, but no real credential store is reachable. */
function isolatedEnv(baseEnv, dirs) {
  return {
    ...baseEnv,
    HOME: dirs.home,
    USERPROFILE: dirs.home,
    APPDATA: path.join(dirs.home, "Roaming"),
    LOCALAPPDATA: path.join(dirs.home, "Local"),
    XDG_CONFIG_HOME: path.join(dirs.home, "config"),
    TEMP: dirs.tmp,
    TMP: dirs.tmp,
    TMPDIR: dirs.tmp, // the bridge's build_child_env keeps TMPDIR, so isolate it too (POSIX temp)
  };
}

/** Realpath-containment check before deleting a probe root, so a symlink can never redirect the
 *  teardown outside the OS temp dir. */
function assertContained(root) {
  const realRoot = fs.realpathSync(root);
  const realTmp = fs.realpathSync(os.tmpdir());
  const rel = path.relative(realTmp, realRoot);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new ProbeHarnessError(`refusing to clean a path outside OS temp: ${realRoot}`);
  }
}

function teardownDirs(root) {
  try {
    assertContained(root);
    fs.rmSync(root, { recursive: true, force: true });
  } catch (e) {
    if (e instanceof ProbeHarnessError) throw e;
    /* best-effort otherwise */
  }
}

// --------------------------------------------------------------------------- MCP client

/** A minimal line-delimited JSON-RPC client over the bridge's stdio, for the bootstrap mode. */
class McpSession {
  constructor(command, args, env) {
    this.child = spawnCli(command, args, { env, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    this.pid = this.child.pid;
    this.buf = "";
    this.pending = new Map();
    this.errbuf = [];
    this.idc = 0;
    this.exited = false;
    this.fatal = null;
    // A spawn failure (ENOENT / EACCES) surfaces as an async 'error' event, not a throw — without a
    // listener it crashes the process. Capture it and fail every pending/future request cleanly.
    this.child.on("error", (err) => this._fail(err));
    this.child.on("exit", () => {
      this.exited = true;
    });
    this.child.stderr?.on("data", (d) => this.errbuf.push(d.toString()));
    this.child.stdout?.on("data", (d) => this._onData(d));
  }

  _fail(err) {
    this.fatal = err;
    for (const { reject, timer } of this.pending.values()) {
      clearTimeout(timer);
      reject(new ProbeHarnessError(`could not run the bridge: ${err.message}`));
    }
    this.pending.clear();
  }

  _onData(d) {
    this.buf += d.toString();
    let nl;
    while ((nl = this.buf.indexOf("\n")) >= 0) {
      const line = this.buf.slice(0, nl);
      this.buf = this.buf.slice(nl + 1);
      if (!line.trim()) continue;
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      if (msg && msg.id != null && this.pending.has(msg.id)) {
        const { resolve, timer } = this.pending.get(msg.id);
        clearTimeout(timer);
        this.pending.delete(msg.id);
        resolve(msg);
      }
    }
  }

  request(method, params = {}, { timeoutMs = HANDSHAKE_TIMEOUT_MS } = {}) {
    if (this.fatal) return Promise.reject(new ProbeHarnessError(`could not run the bridge: ${this.fatal.message}`));
    const id = ++this.idc;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new ProbeContractError(`timed out waiting for ${method}: ${this.stderr()}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      try {
        this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
      } catch (e) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(new ProbeContractError(`could not write ${method}: ${e.message}`));
      }
    });
  }

  notify(method, params = {}) {
    try {
      this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);
    } catch {
      /* peer gone */
    }
  }

  stderr() {
    return this.errbuf.join("");
  }

  async close() {
    try {
      this.child.stdin?.end();
    } catch {
      /* already closed */
    }
    await killTree(this.pid);
  }
}

// --------------------------------------------------------------------------- bootstrap

async function bootstrapSession({ command, args, env, dirs, sentinel, timeoutMs }) {
  if (sentinel) {
    // A synthetic credential store: directory shape a connector might look for, a unique token but
    // no real secret. bootstrap must never read or surface it (it spawns no child at all).
    fs.mkdirSync(path.join(dirs.home, "config", "notebooklm"), { recursive: true });
    fs.writeFileSync(
      path.join(dirs.home, "config", "notebooklm", "cookies.json"),
      JSON.stringify({ note: "synthetic", value: sentinel }),
    );
    fs.writeFileSync(path.join(dirs.home, ".nlm-sentinel"), sentinel);
  }

  const session = new McpSession(command, args, isolatedEnv(env, dirs));
  try {
    const init = await session.request(
      "initialize",
      { protocolVersion: NEGOTIATED_PROTOCOL, capabilities: {}, clientInfo: { name: "probe", version: "1" } },
      { timeoutMs },
    );
    if (init.error) throw new ProbeContractError(`initialize errored: ${JSON.stringify(init.error)}`);
    const result = init.result ?? {};
    if (result.protocolVersion !== NEGOTIATED_PROTOCOL) {
      throw new ProbeContractError(`initialize negotiated ${result.protocolVersion}, expected ${NEGOTIATED_PROTOCOL}`);
    }
    if (result.serverInfo?.name !== "learn-kit-nlm-bridge") {
      throw new ProbeContractError(`unexpected serverInfo.name: ${result.serverInfo?.name}`);
    }
    const instructions = String(result.instructions ?? "");
    if (!/Authentication is managed entirely by the user/.test(instructions)) {
      throw new ProbeContractError("initialize did not return the bridge's own safe instructions");
    }
    if (/Set NOTEBOOKLM_COOKIES/i.test(instructions) || /authenticate via Chrome/i.test(instructions)) {
      throw new ProbeContractError("initialize leaked upstream login advice");
    }

    session.notify("notifications/initialized");

    const ping = await session.request("ping", {}, { timeoutMs });
    if (ping.error || JSON.stringify(ping.result) !== "{}") {
      throw new ProbeContractError(`ping did not return an empty result: ${JSON.stringify(ping)}`);
    }

    const list = await session.request("tools/list", {}, { timeoutMs });
    if (list.error) throw new ProbeContractError(`tools/list errored: ${JSON.stringify(list.error)}`);
    const tools = list.result?.tools ?? [];
    const names = tools.map((t) => t.name).sort();
    if (JSON.stringify(names) !== JSON.stringify(PUBLIC_TOOL_NAMES)) {
      throw new ProbeContractError(`tools/list surface drifted: ${JSON.stringify(names)}`);
    }
    for (const t of tools) {
      if (!t.inputSchema || typeof t.inputSchema !== "object") {
        throw new ProbeContractError(`tool ${t.name} is missing an inputSchema`);
      }
    }

    // While the bridge is still alive and answering locally, prove it started no browser and no raw
    // login launcher IN ITS PROCESS SUBTREE (the uv venv python.exe launcher itself is expected, so
    // a bare python child is not a threat). Enumeration must not silently no-op — a skipped scan
    // must never look clean — so an unsupported scan fails closed. NOTE: this is subtree-scoped; a
    // browser the bridge opens via the OS shell (reparented, so not a descendant) is out of reach
    // here — the audited verify modes catch that vector regardless of reparenting (classifyAudit),
    // and bootstrap drives only the inert initialize/ping/tools-list handshake, never a tool call.
    const { supported, descendants } = await enumerateDescendants(session.pid);
    if (!supported) throw new ProbeHarnessError("cannot enumerate processes to attest bootstrap safety");
    const threats = descendants.filter(isThreatChild);
    if (threats.length > 0) {
      throw new ProbeContractError(`bootstrap spawned a forbidden child: ${threats.map((d) => d.name).join(", ")}`);
    }
    const external = await scanConnections([session.pid, ...descendants.map((d) => d.pid)]);
    if (external.length > 0) {
      throw new ProbeContractError(`bootstrap opened external connections: ${external.join(", ")}`);
    }

    return {
      protocolVersion: result.protocolVersion,
      instructions,
      stderr: session.stderr(),
      tools: tools.map((t) => ({ name: t.name, inputSchema: t.inputSchema })),
      children: threats.map((d) => d.name),
      networkAttempts: external,
    };
  } finally {
    await session.close();
  }
}

async function probeBootstrap({ command, args, env, dirs, timeoutMs }) {
  const sentinel = `LK-PROBE-CRED-${crypto.randomBytes(9).toString("hex")}`;
  let report = null;
  // Two sub-states: a completely empty home, then a synthetic credential sentinel.
  for (const useSentinel of [false, true]) {
    const subDirs = makeIsolatedDirs("bootstrap-sub");
    try {
      const r = await bootstrapSession({
        command,
        args,
        env,
        dirs: subDirs,
        sentinel: useSentinel ? sentinel : null,
        timeoutMs,
      });
      // Scan every channel the bridge could surface a credential on — instructions, the tool
      // payloads, AND stderr (a stdio server's natural log channel) — for a marker or the sentinel.
      const haystacks = [r.instructions, r.stderr, JSON.stringify(r.tools)];
      const leaks = [...new Set(haystacks.flatMap((h) => scanLeaks(h, sentinel)))];
      if (leaks.length) {
        throw new ProbeContractError(`bootstrap leaked a credential marker in output: ${leaks.join(", ")}`);
      }
      report = {
        mode: "bootstrap",
        protocolVersion: r.protocolVersion,
        instructions: r.instructions,
        tools: r.tools,
        children: r.children,
        networkAttempts: r.networkAttempts,
        redactions: [],
      };
    } finally {
      teardownDirs(subDirs.root);
    }
  }
  // dirs (the outer root) is unused by bootstrap's sub-states; return the last sub-state's report.
  void dirs;
  return report;
}

// --------------------------------------------------------------------------- verify modes

const VERIFY_FLAG = {
  "upstream-contract": "--verify-upstream-contract",
  "auth-required": "--verify-auth-required",
};

/** Spawn `command args flag`, poll the process tree while it runs, and collect stdout/stderr. */
async function runVerifyChild(command, args, flag, env, timeoutMs) {
  const child = spawnCli(command, [...args, flag], { env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  const pid = child.pid;
  let stdout = "";
  let stderr = "";
  child.stdout?.on("data", (d) => (stdout += d.toString()));
  child.stderr?.on("data", (d) => (stderr += d.toString()));

  const observedChildren = new Map();
  const observedExternal = new Set();
  let alive = true;
  const scanOnce = async () => {
    try {
      const { descendants } = await enumerateDescendants(pid);
      for (const d of descendants) observedChildren.set(d.pid, d);
      for (const e of await scanConnections([pid, ...descendants.map((d) => d.pid)])) observedExternal.add(e);
    } catch {
      /* best-effort */
    }
  };
  const poller = setInterval(() => {
    if (alive) scanOnce();
  }, 400);

  const status = await new Promise((resolve) => {
    let settled = false;
    const finish = (v) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    const timer = setTimeout(() => {
      finish({ status: null, timedOut: true });
    }, timeoutMs);
    child.on("error", (error) => {
      clearTimeout(timer);
      finish({ status: null, error });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      finish({ status: code });
    });
  });
  alive = false;
  clearInterval(poller);
  await scanOnce(); // a real final scan (the interval callback is fire-and-forget and may be mid-flight)
  await killTree(pid);

  const threats = [...observedChildren.values()].filter(isThreatChild);
  return {
    ...status,
    stdout,
    stderr,
    children: threats.map((d) => d.name),
    external: [...observedExternal],
  };
}

/**
 * The pure conformance judgment for a verify run. Separated from the (hard-to-test) OS spawn so
 * every rule can be exercised directly. Throws ProbeHarnessError (exit 2) for a config/JSON/harness
 * fault, ProbeContractError (exit 1) for a conformance failure; returns the mode's report on pass.
 * @param {object} raw { status, stdout, stderr, error?, timedOut?, children: string[], external: string[] }
 */
export function judgeVerifyResult(mode, raw, timeoutMs) {
  if (raw.error) throw new ProbeHarnessError(`${mode}: could not start the bridge: ${raw.error.message}`);
  if (raw.timedOut) throw new ProbeContractError(`${mode}: the bridge did not finish within ${timeoutMs}ms`);
  if (raw.status === 2) throw new ProbeHarnessError(`${mode}: the bridge rejected its arguments: ${raw.stderr.trim()}`);
  if (raw.status !== 0) throw new ProbeContractError(`${mode}: verify exited ${raw.status}: ${raw.stderr.trim()}`);

  let report;
  try {
    report = JSON.parse(raw.stdout);
  } catch (e) {
    throw new ProbeHarnessError(`${mode}: verify stdout was not JSON: ${e.message}`);
  }
  if (report.mode !== mode) throw new ProbeContractError(`${mode}: report is for mode ${report.mode}`);
  if (report.tools_verified !== true) throw new ProbeContractError(`${mode}: tools/list was not verified against the snapshot`);

  const callResults = [];
  if (mode === "auth-required") {
    if (report.notebook_list_auth_required !== true || report.studio_create_auth_required !== true) {
      throw new ProbeContractError(`${mode}: a call did not normalize to AUTH_REQUIRED: ${JSON.stringify(report)}`);
    }
    callResults.push(
      { tool: "notebook_list", code: "AUTH_REQUIRED" },
      { tool: "studio_create", code: "AUTH_REQUIRED" },
    );
  }

  // The child's in-process audit is the evidence; classify its egress families. A missing/null audit
  // (which the honest bridge emits when it cannot read the guarded runner's audit.json — precisely
  // when tail egress events would be lost) is MISSING EVIDENCE, not proof of safety: fail closed
  // rather than pass vacuously. An empty events object is fine (nothing recorded).
  const auditObj = report.audit;
  const events = auditObj && typeof auditObj === "object" && !Array.isArray(auditObj) ? auditObj.events : undefined;
  if (!events || typeof events !== "object" || Array.isArray(events)) {
    throw new ProbeContractError(`${mode}: verify report is missing its audit evidence (audit.events); cannot attest no-egress`);
  }
  const audit = classifyAudit(events);
  if (audit.network.length) throw new ProbeContractError(`${mode}: upstream child touched the network: ${audit.network.join(", ")}`);
  if (audit.process.length) throw new ProbeContractError(`${mode}: upstream child spawned a subprocess/browser: ${audit.process.join(", ")}`);

  // The OS-level scan is authoritative for the outer view. `raw.children` is already filtered to
  // threat descendants (a browser or a login launcher); the guarded python runner is not one. Any
  // such child, or any external connection, is a hard failure.
  if ((raw.children ?? []).length) throw new ProbeContractError(`${mode}: forbidden child process(es): ${raw.children.join(", ")}`);
  if ((raw.external ?? []).length) throw new ProbeContractError(`${mode}: external network connection(s): ${raw.external.join(", ")}`);

  const leaks = [...scanLeaks(raw.stdout), ...scanLeaks(raw.stderr)];
  if (leaks.length) throw new ProbeContractError(`${mode}: captured output leaked a credential marker: ${leaks.join(", ")}`);

  return {
    mode,
    protocolVersion: NEGOTIATED_PROTOCOL,
    instructions: "",
    tools: PUBLIC_TOOL_NAMES.map((name) => ({ name })),
    callResults,
    children: raw.children ?? [],
    networkAttempts: raw.external ?? [],
    redactions: [],
    audit: report.audit ?? null,
  };
}

async function probeVerify(mode, { command, args, env, dirs, timeoutMs }) {
  const flag = VERIFY_FLAG[mode];
  const raw = await runVerifyChild(command, args, flag, isolatedEnv(env, dirs), timeoutMs);
  return judgeVerifyResult(mode, raw, timeoutMs);
}

// --------------------------------------------------------------------------- public entry

/**
 * Run one concrete probe mode against a bridge command.
 * @returns {Promise<{ protocolVersion, instructions, tools, callResults?, children, networkAttempts, redactions }>}
 */
export async function probeLearnKitNlmBridge({ command, args = [], env, mode, timeoutMs = 180000 } = {}) {
  if (typeof command !== "string" || command.length === 0) {
    throw new ProbeHarnessError("probe: command must be a non-empty string");
  }
  if (!Array.isArray(args) || args.some((a) => typeof a !== "string")) {
    throw new ProbeHarnessError("probe: args must be a string[]");
  }
  if (!CONCRETE_MODES.includes(mode)) {
    throw new ProbeHarnessError(`probe: mode must be one of ${CONCRETE_MODES.join(", ")}`);
  }
  if (typeof timeoutMs !== "number" || !(timeoutMs > 0)) {
    throw new ProbeHarnessError("probe: timeoutMs must be a positive number");
  }
  const baseEnv = env ?? process.env;
  const dirs = makeIsolatedDirs(mode);
  try {
    if (mode === "bootstrap") return await probeBootstrap({ command, args, env: baseEnv, dirs, timeoutMs });
    return await probeVerify(mode, { command, args, env: baseEnv, dirs, timeoutMs });
  } finally {
    teardownDirs(dirs.root);
  }
}

// --------------------------------------------------------------------------- config

/** Read a `.mcp.json`, return the { command, args } for `server`. Every failure is a harness error. */
export function readServerConfig(configPath, server) {
  let text;
  try {
    text = fs.readFileSync(configPath, "utf8");
  } catch (e) {
    throw new ProbeHarnessError(`could not read config ${configPath}: ${e.message}`);
  }
  let doc;
  try {
    doc = JSON.parse(text);
  } catch (e) {
    throw new ProbeHarnessError(`config ${configPath} is not valid JSON: ${e.message}`);
  }
  const servers = doc?.mcpServers;
  if (!servers || typeof servers !== "object") {
    throw new ProbeHarnessError(`config ${configPath} has no mcpServers object`);
  }
  const entry = servers[server];
  if (!entry || typeof entry !== "object") {
    throw new ProbeHarnessError(`config ${configPath} has no server named ${server}`);
  }
  if (typeof entry.command !== "string" || entry.command.length === 0) {
    throw new ProbeHarnessError(`server ${server} has no command`);
  }
  const args = entry.args ?? [];
  if (!Array.isArray(args) || args.some((a) => typeof a !== "string")) {
    throw new ProbeHarnessError(`server ${server} has a non-string-array args`);
  }
  return { command: entry.command, args };
}

// --------------------------------------------------------------------------- CLI

export function parseArgs(argv) {
  const opts = { config: null, server: null, mode: "all", timeoutMs: 180000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new ProbeHarnessError(`missing value for ${a}`);
      return v;
    };
    if (a === "--config") opts.config = next();
    else if (a === "--server") opts.server = next();
    else if (a === "--mode") opts.mode = next();
    else if (a === "--timeout-ms") opts.timeoutMs = Number(next());
    else throw new ProbeHarnessError(`unknown argument ${a}`);
  }
  if (!opts.config) throw new ProbeHarnessError("--config is required");
  if (!opts.server) throw new ProbeHarnessError("--server is required");
  if (!MODES.includes(opts.mode)) throw new ProbeHarnessError(`--mode must be one of ${MODES.join(", ")}`);
  if (!(opts.timeoutMs > 0)) throw new ProbeHarnessError("--timeout-ms must be a positive number");
  return opts;
}

async function main(argv) {
  const opts = parseArgs(argv);
  const { command, args } = readServerConfig(opts.config, opts.server);
  const modes = opts.mode === "all" ? CONCRETE_MODES : [opts.mode];
  const reports = [];
  for (const mode of modes) {
    const report = await probeLearnKitNlmBridge({ command, args, mode, timeoutMs: opts.timeoutMs });
    reports.push(report);
    process.stderr.write(`probe: ${mode} OK\n`);
  }
  process.stdout.write(`${JSON.stringify({ ok: true, modes, reports }, null, 2)}\n`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((e) => {
      process.stderr.write(`${e.name ?? "Error"}: ${e.message}\n`);
      process.exit(typeof e.exitCode === "number" ? e.exitCode : 2);
    });
}
