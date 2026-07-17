// A controllable stand-in for the real NLM bridge, driven entirely by the FAKE_SCENARIO env var
// (a JSON object). tests/probe-learn-kit-nlm-bridge.test.mjs spawns it as `node fake-nlm-bridge.mjs`
// to exercise the probe's logic without the expensive real venv, and to inject drift the real
// bridge would never produce.
//
// It has two shapes, selected by whether a `--verify-*` flag is present in argv (just like the real
// module dispatch):
//
//   no flag       -> a line-delimited JSON-RPC MCP server: initialize / ping / tools/list.
//   --verify-*    -> print a canned report to stdout and exit with a canned code.
//
// FAKE_SCENARIO knobs (all optional):
//   protocolVersion, serverInfoName, instructions, tools   -> shape the MCP responses
//   spawnChild: true                                        -> spawn a lingering descendant process
//   report (object) | rawStdout (string), exitCode         -> the verify-mode stdout + exit code

import { spawn } from "node:child_process";

const scn = JSON.parse(process.env.FAKE_SCENARIO || "{}");
const argv = process.argv.slice(2);
const verifyFlag = argv.find((a) => a.startsWith("--verify-"));

if (scn.spawnChild) {
  // A descendant that outlives the handshake, so the probe's process-tree scan can catch it. The
  // trailing "chrome-renderer" arg puts a browser marker on its command line — the probe's threat
  // detector looks for exactly that (a bare node/python child is not a threat by itself).
  const c = spawn(process.execPath, ["-e", "setTimeout(() => {}, 60000)", "chrome-renderer-simulated"], {
    stdio: "ignore",
    windowsHide: true,
  });
  c.unref();
}

if (verifyFlag) {
  const out = scn.rawStdout !== undefined ? scn.rawStdout : JSON.stringify(scn.report ?? {});
  process.stdout.write(out);
  process.exit(scn.exitCode ?? 0);
}

const DEFAULT_TOOLS = [
  "notebook_create",
  "notebook_get",
  "notebook_list",
  "source_add",
  "studio_create",
  "studio_status",
].map((name) => ({ name, inputSchema: { type: "object", additionalProperties: false } }));

const proto = scn.protocolVersion ?? "2025-06-18";
const serverInfoName = scn.serverInfoName ?? "learn-kit-nlm-bridge";
const instructions =
  scn.instructions ??
  "This server exposes a narrowed, read-mostly view of a personal NotebookLM account. " +
    "Authentication is managed entirely by the user. If a call returns AUTH_REQUIRED, stop and " +
    "ask the user to run `nlm login` themselves in a terminal.";
const tools = scn.tools ?? DEFAULT_TOOLS;

function send(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
}

let buf = "";
process.stdin.on("data", (d) => {
  buf += d.toString();
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    handle(msg);
  }
});
process.stdin.on("end", () => process.exit(0));

function handle(msg) {
  if (msg.method === "initialize") {
    send({
      jsonrpc: "2.0",
      id: msg.id,
      result: { protocolVersion: proto, capabilities: {}, serverInfo: { name: serverInfoName }, instructions },
    });
  } else if (msg.method === "notifications/initialized") {
    // a notification: never answered
  } else if (msg.method === "ping") {
    send({ jsonrpc: "2.0", id: msg.id, result: {} });
  } else if (msg.method === "tools/list") {
    send({ jsonrpc: "2.0", id: msg.id, result: { tools } });
  } else if (msg.id != null) {
    send({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: "unknown method" } });
  }
}
