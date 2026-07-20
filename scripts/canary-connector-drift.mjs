// Weekly-canary drift check: does the LATEST notebooklm-mcp connector still advertise the exact
// 6-tool schema the bridge is pinned against? (plan §2.4 / §3 codex-canary.yml)
//
// This is the ONLY new judgment the canary adds. The CAPTURE of the latest connector's tools/list
// is done by the SAME code the bridge fingerprints with — plugins/learn-kit/nlm-bridge/tools/
// generate_contract_snapshots.py, run against a throwaway venv holding the latest connector — so
// nothing here re-implements the MCP handshake or contract logic (plan §2.4 line 446). This module
// only compares two already-captured tool documents and reports drift.
//
// It is INFORMATIONAL and lives only in the non-required weekly canary: it never updates a lock, a
// pin, or an allowlist, and a drift here is a red canary conclusion, not a merge gate.
//
// Exit codes: bad input / unreadable file -> 2; drift detected -> 1; no drift -> 0.

import fs from "node:fs";
import { pathToFileURL } from "node:url";

import { canonicalJson, PUBLIC_TOOL_NAMES } from "./generate-nlm-contract.mjs";

export class CanaryInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "CanaryInputError";
    this.exitCode = 2;
  }
}

/** Both documents are produced by generate_contract_snapshots.py, which writes a Python
 *  `tools_sha256` over the connector's tools array. The DRIFT DECISION compares those stored,
 *  Python-computed hashes — that is exactly the value the bridge checks its child against, so the
 *  canary is as sensitive as the bridge (including a `120.0` -> `120` numeric change, which JS's
 *  JSON round-trip silently loses and so cannot be re-derived in Node). Node is used only to explain
 *  a difference, never to decide it. */
function requireSnapshot(doc, label) {
  if (!doc || typeof doc !== "object") throw new CanaryInputError(`${label} is not an object`);
  if (typeof doc.tools_sha256 !== "string" || !/^[0-9a-f]{64}$/.test(doc.tools_sha256)) {
    throw new CanaryInputError(`${label} has no valid tools_sha256`);
  }
  if (!Array.isArray(doc.tools)) throw new CanaryInputError(`${label} has no tools array`);
}

/** Best-effort, human-readable reasons for a drift, derived in Node. May under-report a numeric-
 *  format-only change (see requireSnapshot) — the decision never depends on this. */
function explainDrift(latestTools, baselineTools) {
  const reasons = [];
  const lNames = new Set(latestTools.map((t) => t?.name));
  const bNames = new Set(baselineTools.map((t) => t?.name));
  for (const n of [...bNames].sort()) if (!lNames.has(n)) reasons.push(`tool removed: ${n}`);
  for (const n of [...lNames].sort()) if (!bNames.has(n)) reasons.push(`tool added: ${n}`);
  const lMap = new Map(latestTools.map((t) => [t?.name, t]));
  const bMap = new Map(baselineTools.map((t) => [t?.name, t]));
  for (const n of [...bNames].filter((x) => lNames.has(x)).sort()) {
    if (canonicalJson(lMap.get(n)) !== canonicalJson(bMap.get(n))) reasons.push(`tool definition changed: ${n}`);
  }
  return reasons;
}

/**
 * Compare a freshly-captured LATEST connector tools document against the checked-in pinned baseline.
 * Pure — no I/O — so every branch is unit-testable. The decision is the stored Python `tools_sha256`
 * (authoritative); `reasons` is a best-effort Node explanation.
 * @returns {{ drift: boolean, reasons: string[], latestVersion, baselineVersion, latestSha, baselineSha }}
 */
export function compareConnectorTools(latest, baseline) {
  requireSnapshot(latest, "latest snapshot");
  requireSnapshot(baseline, "baseline snapshot");
  const latestSha = latest.tools_sha256;
  const baselineSha = baseline.tools_sha256;
  const latestVersion = latest.connector_version ?? null;
  const baselineVersion = baseline.connector_version ?? null;

  if (latestSha === baselineSha) {
    return { drift: false, reasons: [], latestVersion, baselineVersion, latestSha, baselineSha };
  }

  const reasons = explainDrift(latest.tools, baseline.tools);
  if (reasons.length === 0) {
    reasons.push(
      "tools_sha256 differs but no per-tool cause could be isolated in Node (e.g. a numeric-format-only " +
        "change such as 120.0 vs 120, or a tool reorder); inspect the raw snapshots for the exact change",
    );
  }
  return { drift: true, reasons, latestVersion, baselineVersion, latestSha, baselineSha };
}

function readJson(path, label) {
  let text;
  try {
    text = fs.readFileSync(path, "utf8");
  } catch (e) {
    throw new CanaryInputError(`could not read ${label} ${path}: ${e.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new CanaryInputError(`${label} ${path} is not valid JSON: ${e.message}`);
  }
}

export function parseArgs(argv) {
  const opts = { latest: null, baseline: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new CanaryInputError(`missing value for ${a}`);
      return v;
    };
    if (a === "--latest") opts.latest = next();
    else if (a === "--baseline") opts.baseline = next();
    else throw new CanaryInputError(`unknown argument ${a}`);
  }
  if (!opts.latest) throw new CanaryInputError("--latest is required");
  if (!opts.baseline) throw new CanaryInputError("--baseline is required");
  return opts;
}

function main(argv) {
  const opts = parseArgs(argv);
  const latest = readJson(opts.latest, "latest snapshot");
  const baseline = readJson(opts.baseline, "baseline snapshot");
  const result = compareConnectorTools(latest, baseline);

  const summary = {
    baseline_connector: result.baselineVersion,
    latest_connector: result.latestVersion,
    baseline_tools_sha256: result.baselineSha,
    latest_tools_sha256: result.latestSha,
    expected_tool_names: PUBLIC_TOOL_NAMES,
    drift: result.drift,
    reasons: result.reasons,
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (result.drift) {
    process.stderr.write(
      `canary-connector-drift: DRIFT — the latest connector (${result.latestVersion}) no longer ` +
        `matches the pinned ${result.baselineVersion} 6-tool schema:\n  - ${result.reasons.join("\n  - ")}\n`,
    );
    return 1;
  }
  process.stderr.write(
    `canary-connector-drift: no drift — latest connector (${result.latestVersion}) tool schema matches the pinned baseline (${result.baselineVersion}).\n`,
  );
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write(`${e.name ?? "Error"}: ${e.message}\n`);
    process.exit(typeof e.exitCode === "number" ? e.exitCode : 2);
  }
}
