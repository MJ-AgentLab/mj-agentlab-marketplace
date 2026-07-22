#!/usr/bin/env node
// Sole generator for the NLM bridge's locked contract (plan §2.3.1, §2.4).
//
//   node scripts/generate-nlm-contract.mjs <mode> --root . --uv 0.11.21 --python 3.12 \
//        --exclude-newer 2026-07-16T00:00:00Z [--check]
//
//   modes: runtime-lock | build-lock | snapshots | all
//
// Exit 0 = ok (or --check found no drift), 1 = --check drift, 2 = bad input / wrong tooling.
//
// WHY A GENERATOR AND NOT A CHECKED-IN BLOB EDITED BY HAND: the locks are the root of the
// installer's --require-hashes guarantee. If a human could hand-edit one, the hash set would
// stop describing anything a resolver ever produced. `--check` in CI is what keeps the
// checked-in files honest: it regenerates and byte-compares.
//
// REPRODUCIBILITY DETAIL THAT DRIVES THE DESIGN: `uv pip compile` writes its own argv into
// the file header, INCLUDING the -o path. So a naive "regenerate into a temp file and
// compare" always differs on the header alone. --check therefore mirrors the inputs into a
// temp directory and runs uv there with byte-identical RELATIVE arguments, so the recorded
// command — and thus the header — is identical. It never writes to the working tree.
//
// The cutoff is a fixed instant in the past, not "now": it freezes the transitive closure so
// regenerating months later yields the same answer.
//
//   NOTE ON THE CUTOFF VALUE: plan §2.3.1 specifies 2026-07-15T00:00:00Z. That value cannot
//   work — PyPI published notebooklm-mcp-cli 0.8.7 at 2026-07-15T01:31:19.945Z, 91 minutes
//   after it, so the cutoff filters out the very release the bridge pins and resolution fails
//   outright. Corrected to the next clean date boundary, which is still a fixed past instant.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

export const BRIDGE_DIR = "plugins/learn-kit/nlm-bridge";
export const RUNTIME_LOCK = "requirements/notebooklm-mcp-cli-0.8.7-py312.lock.txt";
export const BUILD_LOCK = "constraints/build-hatchling-1.27.0-py312.txt";
export const BUILD_INPUT = "constraints/build-requirements.in";
export const PYPROJECT = "pyproject.toml";

export const DATA_DIR = "src/learn_kit_nlm_bridge/_data";
export const PUBLIC_TOOLS = `${DATA_DIR}/public-tools-v1.json`;
export const ENV_LOCK = `${DATA_DIR}/environment-lock.json`;
export const SNAPSHOT_TOOL = "tools/generate_contract_snapshots.py";

/** The exact tool surface the bridge exposes. Neither the policy nor upstream may drift from it. */
export const PUBLIC_TOOL_NAMES = [
  "notebook_create",
  "notebook_get",
  "notebook_list",
  "source_add",
  "studio_create",
  "studio_status",
];

/**
 * The ONLY keys each tool may force onto the upstream call, and it must be exactly these.
 *
 * An allowlist rather than a denylist on purpose. The inject map is forwarded to the connector
 * verbatim, so it is a second way — beside the advertised schema — for a policy edit to reach a
 * parameter the bridge is supposed to have closed off (a url source, a rename action, a video
 * style prompt). A denylist can always miss the next dangerous key; this cannot. `status` and
 * `100` are the two constants the narrowed surface deliberately pins, so those are the only
 * injections allowed; every other tool injects nothing.
 */
export const INJECT_ALLOWLIST = {
  notebook_list: ["max_results"],
  notebook_get: [],
  notebook_create: [],
  source_add: [],
  studio_status: ["action"],
  studio_create: [],
};

export const MODES = ["runtime-lock", "build-lock", "snapshots", "all"];

export class InputError extends Error {}
export class DriftError extends Error {}

// ------------------------------------------------------------------ lock grammar

const REQUIREMENT_RE = /^[a-zA-Z0-9._-]+==[^\s;\\]+\s*(;.*?)?\s*\\?$/;
const HASH_RE = /^\s+--hash=sha256:[0-9a-f]{64}\s*\\?$/;

/**
 * The lock may contain only: comments, blanks, canonical `name==version` (optionally with a
 * PEP 508 marker), and --hash=sha256:<64 hex> continuations.
 *
 * Everything else is rejected by name rather than by omission, because each forbidden form is
 * a way for the installer's --require-hashes promise to be quietly voided: an index or
 * find-links line redirects where artifacts come from; a direct URL or path bypasses hashing;
 * an editable install points at mutable source; -r/-c pulls in a file nobody audited.
 */
export function validateLockGrammar(text, label = "lock") {
  const problems = [];
  const lines = String(text).split(/\r?\n/);
  lines.forEach((line, i) => {
    const n = i + 1;
    if (line === "" || line.trimStart().startsWith("#")) return;
    if (HASH_RE.test(line)) return;
    if (REQUIREMENT_RE.test(line)) {
      if (/@/.test(line)) problems.push(`${label}:${n}: direct reference (@) is forbidden: ${line.trim()}`);
      return;
    }
    problems.push(`${label}:${n}: not a canonical requirement or hash line: ${JSON.stringify(line)}`);
  });
  return problems;
}

/** Every pinned requirement must carry at least one hash — an unhashed pin is unpinned. */
export function requirementsWithoutHashes(text) {
  const lines = String(text).split(/\r?\n/);
  const missing = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "" || line.trimStart().startsWith("#") || HASH_RE.test(line)) continue;
    if (!REQUIREMENT_RE.test(line)) continue;
    // A hashed requirement ends with a backslash and is followed by hash continuations.
    let j = i + 1;
    let hashes = 0;
    while (j < lines.length && HASH_RE.test(lines[j])) {
      hashes++;
      j++;
    }
    if (hashes === 0) missing.push(line.trim());
  }
  return missing;
}

export function sha256(text) {
  return crypto.createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");
}

/**
 * Parse a hashed lock into its closure: `[{ name, version, marker, hashes }]`.
 *
 * The environment lock records this so the bridge can check an installed venv against the
 * same closure the wheel was verified with, using importlib.metadata — reading versions of
 * what is actually imported rather than trusting the archive hashes, which only describe the
 * artifacts at install time.
 */
export function parseLock(text) {
  const lines = String(text).split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "" || line.trimStart().startsWith("#") || HASH_RE.test(line)) continue;
    if (!REQUIREMENT_RE.test(line)) continue;
    const body = line.replace(/\s*\\$/, "").trim();
    const [spec, ...markerParts] = body.split(";");
    const [name, version] = spec.trim().split("==");
    const hashes = [];
    for (let j = i + 1; j < lines.length && HASH_RE.test(lines[j]); j++) {
      hashes.push(lines[j].trim().replace(/\s*\\$/, "").replace(/^--hash=/, ""));
    }
    out.push({
      name: name.trim(),
      version: version.trim(),
      marker: markerParts.length ? markerParts.join(";").trim() : null,
      hashes,
    });
  }
  return out;
}

/**
 * The single serialization for generated JSON, matching canonical_json() in
 * tools/generate_contract_snapshots.py: sorted keys, two-space indent, pure ASCII, LF, one
 * trailing newline. Sorting makes regeneration byte-stable; escaping non-ASCII means the
 * bytes — and so the SHA-256 — cannot depend on an encoding assumption.
 */
export function canonicalJson(value) {
  const sortDeep = (v) => {
    if (Array.isArray(v)) return v.map(sortDeep);
    if (v && typeof v === "object") {
      return Object.fromEntries(
        Object.keys(v)
          .sort()
          .map((k) => [k, sortDeep(v[k])]),
      );
    }
    return v;
  };
  // Escape per UTF-16 code unit, which is what Python's ensure_ascii does — including
  // emitting surrogate pairs as two \uXXXX escapes — so both writers agree byte for byte.
  const ascii = JSON.stringify(sortDeep(value), null, 2).replace(/[\u0080-\uffff]/g, (c) =>
    `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
  return `${ascii}\n`;
}

/**
 * Validate the hand-written public policy, and cross-check it against what upstream really
 * offers.
 *
 * This is the check that keeps "narrowed" honest. The policy is the only _data file a human
 * writes, so it is the only one where a widening can be introduced by editing rather than by
 * upstream drift. Every rule below closes a specific way the bridge's promise could be voided:
 * an unknown tool name, an argument upstream would reject, a re-opened `additionalProperties`,
 * or a studio_create branch that lets `source_ids` go missing — which upstream documents as
 * "default: all sources".
 */
export function validatePublicPolicy(policy, upstream) {
  const problems = [];
  const p = (m) => problems.push(m);

  if (policy?.format !== "learn-kit-nlm-bridge/public-tools") p(`format must be "learn-kit-nlm-bridge/public-tools"`);
  if (policy?.format_version !== 1) p("format_version must be 1");
  if (policy?.policy_version !== "v1") p(`policy_version must be "v1" to match the filename`);
  if (!Array.isArray(policy?.tools)) {
    p("tools must be an array");
    return problems;
  }

  const names = policy.tools.map((t) => t?.name);
  if (JSON.stringify([...names].sort()) !== JSON.stringify([...PUBLIC_TOOL_NAMES].sort())) {
    p(`tools must be exactly ${PUBLIC_TOOL_NAMES.join(", ")} (got ${names.join(", ") || "<none>"})`);
  }

  const upstreamByName = new Map((upstream?.tools ?? []).map((t) => [t.name, t]));

  for (const tool of policy.tools) {
    const at = `tools[${tool?.name}]`;
    const schema = tool?.inputSchema;
    if (!schema || schema.type !== "object") {
      p(`${at}: inputSchema must be an object schema`);
      continue;
    }

    const up = upstreamByName.get(tool?.upstream?.tool);
    if (!up) {
      p(`${at}: upstream.tool ${JSON.stringify(tool?.upstream?.tool)} is not a tool upstream advertises`);
      continue;
    }
    const upProps = new Set(Object.keys(up.inputSchema?.properties ?? {}));

    // Branches are the unit of closure: studio_create is a oneOf over four closed objects,
    // because a top-level additionalProperties:false cannot see into oneOf branches and would
    // reject every valid payload. Every other tool is a single closed object.
    const branches = Array.isArray(schema.oneOf) ? schema.oneOf : [schema];
    if (Array.isArray(schema.oneOf) && tool.name !== "studio_create") {
      p(`${at}: only studio_create may use oneOf`);
    }

    for (const [i, b] of branches.entries()) {
      const bat = Array.isArray(schema.oneOf) ? `${at}.oneOf[${b?.title ?? i}]` : at;
      if (b?.additionalProperties !== false) p(`${bat}: additionalProperties must be false`);
      const props = Object.keys(b?.properties ?? {});
      for (const key of props) {
        // Anything the bridge advertises must be something upstream would accept; otherwise a
        // host could send a well-formed call the connector rejects.
        if (!upProps.has(key)) p(`${bat}: property ${JSON.stringify(key)} does not exist upstream`);
      }
    }

    const allowedInject = INJECT_ALLOWLIST[tool.name] ?? [];
    for (const key of Object.keys(tool?.upstream?.inject ?? {})) {
      if (!upProps.has(key)) p(`${at}: injected ${JSON.stringify(key)} does not exist upstream`);
      // The inject map reaches the connector verbatim, so a forbidden key smuggled in here
      // bypasses the advertised-schema checks entirely. Only the pinned constants may appear.
      if (!allowedInject.includes(key)) p(`${at}: ${JSON.stringify(key)} must not be injected`);
      for (const b of branches) {
        if (Object.keys(b?.properties ?? {}).includes(key)) {
          p(`${at}: ${JSON.stringify(key)} is both injected and caller-supplied — pick one`);
        }
      }
    }
  }

  const byName = Object.fromEntries(policy.tools.map((t) => [t.name, t]));

  // studio_create is where an omission is most costly, so its invariants are asserted by name.
  const sc = byName["studio_create"];
  if (sc) {
    const branches = sc.inputSchema?.oneOf;
    if (!Array.isArray(branches) || branches.length !== 4) {
      p("studio_create: must be a oneOf over exactly the four artifact branches");
    } else {
      const kinds = branches.map((b) => b?.properties?.artifact_type?.const).sort();
      if (JSON.stringify(kinds) !== JSON.stringify(["audio", "mind_map", "slide_deck", "video"])) {
        p(`studio_create: branches must be const audio|video|slide_deck|mind_map (got ${kinds.join("|")})`);
      }
      for (const b of branches) {
        const kind = b?.properties?.artifact_type?.const ?? "?";
        const at = `studio_create.oneOf[${kind}]`;
        const req = b?.required ?? [];
        for (const must of ["notebook_id", "artifact_type", "source_ids", "confirm"]) {
          if (!req.includes(must)) p(`${at}: ${must} must be required`);
        }
        const ids = b?.properties?.source_ids;
        if (ids?.minItems !== 1) p(`${at}: source_ids.minItems must be 1 — upstream reads an absent value as all sources`);
        if (ids?.maxItems !== 3) p(`${at}: source_ids.maxItems must be 3`);
        if (ids?.uniqueItems !== true) p(`${at}: source_ids.uniqueItems must be true`);
        if (b?.properties?.confirm?.const !== true) p(`${at}: confirm must be const true`);
        if (b?.properties?.video_style_prompt) p(`${at}: video_style_prompt must not be exposed`);
        // v0.8.7 builds a mind map from source IDs alone and drops focus/language, so
        // accepting them would advertise an effect that never happens.
        if (kind === "mind_map") {
          for (const forbidden of ["focus_prompt", "language"]) {
            if (b?.properties?.[forbidden]) p(`${at}: ${forbidden} must not be accepted — v0.8.7 ignores it`);
          }
        } else if (b?.properties?.focus_prompt?.type !== "string") {
          p(`${at}: focus_prompt must be a string`);
        }
      }
    }
  }

  const sa = byName["source_add"];
  if (sa) {
    const props = sa.inputSchema?.properties ?? {};
    if (props.source_type?.const !== "file") p("source_add: source_type must be const 'file'");
    if (props.wait?.const !== true) p("source_add: wait must be const true");
    for (const must of ["notebook_id", "source_type", "file_path", "wait"]) {
      if (!(sa.inputSchema?.required ?? []).includes(must)) p(`source_add: ${must} must be required`);
    }
    for (const forbidden of ["url", "urls", "text", "document_id", "doc_type"]) {
      if (props[forbidden]) p(`source_add: ${forbidden} must not be exposed`);
    }
  }

  const ss = byName["studio_status"];
  if (ss) {
    for (const forbidden of ["action", "artifact_id", "new_title"]) {
      if (ss.inputSchema?.properties?.[forbidden]) p(`studio_status: ${forbidden} must not be exposed`);
    }
    if (ss.upstream?.inject?.action !== "status") p("studio_status: must inject action='status'");
  }

  const nl = byName["notebook_list"];
  if (nl) {
    if (Object.keys(nl.inputSchema?.properties ?? {}).length !== 0) p("notebook_list: must take no arguments");
    if (nl.upstream?.inject?.max_results !== 100) p("notebook_list: must inject max_results=100");
  }

  const nc = byName["notebook_create"];
  // Upstream leaves title optional; an untitled create would still create a notebook.
  if (nc && !(nc.inputSchema?.required ?? []).includes("title")) p("notebook_create: title must be required");

  return problems;
}

// ------------------------------------------------------------------ production deps

function realRunUv(args, cwd) {
  return execFileSync("uv", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}

function realUvVersion() {
  const out = execFileSync("uv", ["--version"], { encoding: "utf8" });
  const m = /(\d+\.\d+\.\d+)/.exec(out);
  return m ? m[1] : null;
}

function realRunPython(exe, args, cwd) {
  return execFileSync(exe, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}

export const PRODUCTION_DEPS = { runUv: realRunUv, uvVersion: realUvVersion, runPython: realRunPython };

// ------------------------------------------------------------------ generation

function compileArgs({ input, output, pythonVersion, excludeNewer }) {
  // Relative paths only. These exact strings land in the generated header, so anything
  // absolute here would make the output machine-specific and break --check everywhere else.
  return [
    "pip", "compile", input,
    "--python-version", pythonVersion,
    "--exclude-newer", excludeNewer,
    "--universal",
    "--generate-hashes",
    "--no-sources",
    "--no-config",
    "-o", output,
  ];
}

const TARGETS = {
  "runtime-lock": { input: PYPROJECT, output: RUNTIME_LOCK, mirror: [PYPROJECT] },
  "build-lock": { input: BUILD_INPUT, output: BUILD_LOCK, mirror: [BUILD_INPUT] },
};

/**
 * Pull the pinned facts out of pyproject.toml rather than restating them here, so the bridge
 * version and the connector pin have exactly one source. Regex rather than a TOML parser:
 * this file has no dependencies by design, and each value is asserted immediately below.
 */
export function readPyprojectFacts(text) {
  const version = /^\s*version\s*=\s*"([^"]+)"\s*$/m.exec(text)?.[1];
  const requiresPython = /^\s*requires-python\s*=\s*"([^"]+)"\s*$/m.exec(text)?.[1];
  const connector = /"notebooklm-mcp-cli==([^"]+)"/.exec(text)?.[1];
  const problems = [];
  if (!version) problems.push("pyproject.toml: no [project] version");
  if (requiresPython !== "==3.12.*") problems.push(`pyproject.toml: requires-python must be "==3.12.*" (got ${requiresPython ?? "<none>"})`);
  if (!connector) problems.push("pyproject.toml: no exact notebooklm-mcp-cli== pin");
  // Anchored to the start of a line: a TOML table header can only appear there, and
  // pyproject.toml discusses this very rule in a comment that must not trip the check.
  if (/^\s*\[project\.scripts\]/m.test(text)) {
    // Two distributions competing for the same console-script name would let install order
    // decide which `nlm` wins; the installer owns those names as shims instead.
    problems.push("pyproject.toml: the bridge must declare no [project.scripts]");
  }
  if (problems.length) throw new InputError(problems.join("\n  "));
  return { bridgeVersion: version, connectorVersion: connector, requiresPython };
}

function venvPythonPath(venvDir) {
  return process.platform === "win32"
    ? path.join(venvDir, "Scripts", "python.exe")
    : path.join(venvDir, "bin", "python");
}

/**
 * `snapshots`: install the locked closure into a throwaway venv, fingerprint the real
 * connector through it, and fold everything into the environment lock.
 *
 * Division of labour is deliberate. The Python tool is the only thing that touches upstream,
 * because fingerprinting it requires importing it. Everything the bridge must not get wrong
 * on trust — the build lock, the hand-written policy, the closure — is parsed and hashed here,
 * independently of anything the connector said about itself.
 *
 * The build closure is hashed but never installed into the runtime venv: hatchling builds the
 * wheel, it has no business inside the environment that talks to Google.
 */
function generateSnapshots({ bridgeDir, pythonVersion, excludeNewer, uvVersion, check }, deps) {
  const read = (rel) => {
    const p = path.join(bridgeDir, rel);
    if (!fs.existsSync(p)) throw new InputError(`${rel} is missing; generate the locks first`);
    return fs.readFileSync(p, "utf8");
  };

  const facts = readPyprojectFacts(read(PYPROJECT));
  const runtimeLockText = read(RUNTIME_LOCK);
  const buildLockText = read(BUILD_LOCK);

  for (const [label, text] of [[RUNTIME_LOCK, runtimeLockText], [BUILD_LOCK, buildLockText]]) {
    const problems = validateLockGrammar(text, label);
    const unhashed = requirementsWithoutHashes(text);
    if (unhashed.length) problems.push(`${label}: requirement(s) with no hashes: ${unhashed.join(", ")}`);
    if (problems.length) throw new InputError(`checked-in lock is not acceptable:\n  ${problems.join("\n  ")}`);
  }

  const closure = parseLock(runtimeLockText);
  const pinned = closure.find((r) => r.name === "notebooklm-mcp-cli");
  if (pinned?.version !== facts.connectorVersion) {
    throw new InputError(
      `pyproject pins notebooklm-mcp-cli==${facts.connectorVersion} but the runtime lock resolves ${pinned?.version ?? "<absent>"}`,
    );
  }

  const policyText = read(PUBLIC_TOOLS);
  if (policyText.includes("\r")) throw new InputError(`${PUBLIC_TOOLS}: must use LF only (see .gitattributes)`);
  if (policyText.charCodeAt(0) === 0xfeff) throw new InputError(`${PUBLIC_TOOLS}: must not start with a BOM`);
  if (!policyText.endsWith("\n") || policyText.endsWith("\n\n")) {
    throw new InputError(`${PUBLIC_TOOLS}: must end with exactly one newline`);
  }
  let policy;
  try {
    policy = JSON.parse(policyText);
  } catch (e) {
    throw new InputError(`${PUBLIC_TOOLS}: not valid JSON: ${e.message}`);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nlm-snapshots-"));
  try {
    const venvDir = path.join(tmp, "venv");
    const outDir = path.join(tmp, "out");
    fs.mkdirSync(outDir, { recursive: true });

    // Absolute paths are correct here, unlike for `pip compile`. Nothing in this step records
    // its own argv into a checked-in file, and the child runs with cwd=tmp, so a repo-relative
    // path would not resolve. The relative-only rule exists solely to keep the lock header —
    // which literally contains uv's argv — free of this machine's paths.
    const absBridge = path.resolve(bridgeDir);

    deps.runUv(["venv", "--python", pythonVersion, "--no-python-downloads", "--no-config", venvDir], tmp);
    const py = venvPythonPath(venvDir);
    deps.runUv(
      [
        "pip", "install",
        "--python", py,
        "--require-hashes",
        "--no-build",
        "--no-config",
        "-r", path.join(absBridge, RUNTIME_LOCK),
      ],
      tmp,
    );

    const toolPath = path.join(absBridge, SNAPSHOT_TOOL);
    const reported = JSON.parse(
      deps.runPython(py, [toolPath, "--out", outDir, "--connector-version", facts.connectorVersion], tmp),
    );
    if (!/^3\.12\./.test(reported.python_version ?? "")) {
      throw new InputError(`the snapshot venv must be Python 3.12.x (got ${reported.python_version ?? "<unknown>"})`);
    }

    const upstreamToolsName = `upstream-tools-v${facts.connectorVersion}.json`;
    const authGuardName = `upstream-auth-guard-v${facts.connectorVersion}.json`;
    const upstreamToolsText = fs.readFileSync(path.join(outDir, upstreamToolsName), "utf8");
    const authGuardText = fs.readFileSync(path.join(outDir, authGuardName), "utf8");
    const upstream = JSON.parse(upstreamToolsText);

    const policyProblems = validatePublicPolicy(policy, upstream);
    if (policyProblems.length) {
      throw new InputError(
        `${PUBLIC_TOOLS} is not an acceptable minimal-permission policy:\n  ${policyProblems.join("\n  ")}`,
      );
    }

    // Recorded as argv, not a shell string, and with repo-relative paths only: an absolute
    // path here would brand the checked-in lock with whichever machine last ran the generator.
    const envLock = {
      _comment: [
        "Generated by scripts/generate-nlm-contract.mjs (snapshots mode). Do not hand-edit.",
        "Binds the bridge to one exact, reproducible environment. The installer builds the",
        "private venv from the runtime lock with --require-hashes; this file is what preflight",
        "and the bridge check that venv against.",
        "The hashes below are the PyPI artifact hashes verified at INSTALL time. They are not",
        "evidence that the installed files are still intact later: the runtime re-checks the",
        "closure with importlib.metadata instead.",
        "The build closure is recorded by hash only and never installed into the runtime venv.",
        "No exact Python patch is recorded on purpose. Patch level is free to move inside",
        "3.12.* and does vary across the Windows/Ubuntu matrix; pinning it here would make this",
        "checked-in file fail --check on any machine with a different patch. The actual exact",
        "patch is bound at runtime, by the install receipt and the Gate fingerprint.",
      ],
      format: "learn-kit-nlm-bridge/environment-lock",
      format_version: 1,
      bridge_version: facts.bridgeVersion,
      connector_version: facts.connectorVersion,
      python_requires: facts.requiresPython,
      generated_with: { uv: uvVersion, python_version: pythonVersion, exclude_newer: excludeNewer },
      replay: {
        runtime_lock: ["uv", ...compileArgs({ input: PYPROJECT, output: RUNTIME_LOCK, pythonVersion, excludeNewer })],
        build_lock: ["uv", ...compileArgs({ input: BUILD_INPUT, output: BUILD_LOCK, pythonVersion, excludeNewer })],
        install: [
          "uv", "pip", "install",
          "--python", "<private-venv-python>",
          "--require-hashes",
          "--no-build",
          "--no-config",
          "-r", RUNTIME_LOCK,
        ],
      },
      locks: {
        runtime: { path: RUNTIME_LOCK, sha256: sha256(runtimeLockText) },
        build: { path: BUILD_LOCK, sha256: sha256(buildLockText) },
      },
      contracts: {
        public_tools: { path: PUBLIC_TOOLS, sha256: sha256(policyText) },
        upstream_tools: { path: `${DATA_DIR}/${upstreamToolsName}`, sha256: sha256(upstreamToolsText) },
        upstream_auth_guard: { path: `${DATA_DIR}/${authGuardName}`, sha256: sha256(authGuardText) },
      },
      closure_count: closure.length,
      closure,
    };

    const produced = [
      { rel: `${DATA_DIR}/${upstreamToolsName}`, text: upstreamToolsText },
      { rel: `${DATA_DIR}/${authGuardName}`, text: authGuardText },
      { rel: ENV_LOCK, text: canonicalJson(envLock) },
    ];

    const outputs = [];
    for (const { rel, text } of produced) {
      const finalPath = path.join(bridgeDir, rel);
      const existing = fs.existsSync(finalPath) ? fs.readFileSync(finalPath, "utf8") : null;
      const changed = existing !== text;
      if (check) {
        if (changed) {
          throw new DriftError(
            existing === null
              ? `${rel} does not exist; run the generator`
              : `${rel} is not what the generator produces — regenerate it`,
          );
        }
      } else if (changed) {
        fs.mkdirSync(path.dirname(finalPath), { recursive: true });
        fs.writeFileSync(finalPath, text);
      }
      outputs.push({ path: `${BRIDGE_DIR}/${rel}`, sha256: sha256(text), changed });
    }
    return outputs;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function mirrorInputs(bridgeDir, tmp, files) {
  for (const rel of files) {
    const dest = path.join(tmp, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(bridgeDir, rel), dest);
  }
  // pyproject.toml names a readme; keep the mirrored tree faithful enough to parse.
  const readme = path.join(bridgeDir, "README.md");
  if (fs.existsSync(readme)) fs.copyFileSync(readme, path.join(tmp, "README.md"));
  else fs.writeFileSync(path.join(tmp, "README.md"), "");
}

function generateOne(key, { bridgeDir, pythonVersion, excludeNewer, check }, deps) {
  const t = TARGETS[key];
  const finalPath = path.join(bridgeDir, t.output);

  // Always compile inside a temp mirror with identical relative arguments. For a real
  // generation the result is then copied into place; for --check it is only compared. This
  // keeps the recorded header identical in both cases.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nlm-contract-"));
  try {
    mirrorInputs(bridgeDir, tmp, t.mirror);
    fs.mkdirSync(path.join(tmp, path.dirname(t.output)), { recursive: true });
    deps.runUv(compileArgs({ input: t.input, output: t.output, pythonVersion, excludeNewer }), tmp);

    const produced = fs.readFileSync(path.join(tmp, t.output), "utf8");

    const problems = validateLockGrammar(produced, t.output);
    const unhashed = requirementsWithoutHashes(produced);
    if (unhashed.length) problems.push(`${t.output}: requirement(s) with no hashes: ${unhashed.join(", ")}`);
    if (problems.length) throw new InputError(`generated lock is not acceptable:\n  ${problems.join("\n  ")}`);

    const existing = fs.existsSync(finalPath) ? fs.readFileSync(finalPath, "utf8") : null;
    const changed = existing !== produced;

    if (check) {
      if (changed) {
        throw new DriftError(
          existing === null
            ? `${t.output} does not exist; run the generator`
            : `${t.output} is not what the generator produces — regenerate it`,
        );
      }
    } else if (changed) {
      fs.mkdirSync(path.dirname(finalPath), { recursive: true });
      fs.writeFileSync(finalPath, produced);
    }

    return { path: `${BRIDGE_DIR}/${t.output}`, sha256: sha256(produced), changed };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/**
 * @param {{mode, root, uvVersion, pythonVersion, excludeNewer, check}} opts
 * @returns {{ outputs: Array<{path, sha256, changed}>, changed: boolean }}
 */
export function generateNlmContract(opts, deps = PRODUCTION_DEPS) {
  const { mode, root, uvVersion, pythonVersion, excludeNewer, check = false } = opts ?? {};
  if (!MODES.includes(mode)) throw new InputError(`mode must be one of ${MODES.join("|")} (got ${JSON.stringify(mode)})`);
  if (typeof root !== "string" || root === "") throw new InputError("root is required");
  if (!/^\d+\.\d+\.\d+$/.test(String(uvVersion))) throw new InputError(`--uv must be exactly X.Y.Z (got ${JSON.stringify(uvVersion)})`);
  if (!/^\d+\.\d+$/.test(String(pythonVersion))) throw new InputError(`--python must be X.Y (got ${JSON.stringify(pythonVersion)})`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(String(excludeNewer))) {
    throw new InputError(`--exclude-newer must be an exact UTC instant (got ${JSON.stringify(excludeNewer)})`);
  }

  // The lock's content depends on the resolver. A different uv may resolve differently, so a
  // mismatch is a wrong-tooling error rather than something to work around.
  const actualUv = deps.uvVersion();
  if (actualUv !== uvVersion) {
    throw new InputError(`this contract is generated with uv ${uvVersion}, but uv ${actualUv ?? "<not found>"} is on PATH`);
  }

  const bridgeDir = path.join(root, BRIDGE_DIR);
  if (!fs.existsSync(path.join(bridgeDir, PYPROJECT))) throw new InputError(`no ${PYPROJECT} under ${bridgeDir}`);

  const wantsSnapshots = mode === "snapshots" || mode === "all";
  if (wantsSnapshots) {
    // Fail honestly rather than pass silently: snapshots fingerprints the real connector, so
    // it cannot run without the tool that does the fingerprinting.
    const tool = path.join(bridgeDir, SNAPSHOT_TOOL);
    if (!fs.existsSync(tool)) {
      throw new InputError(
        `mode "${mode}" needs ${BRIDGE_DIR}/${SNAPSHOT_TOOL}, which does not exist yet.\n` +
          `Use "runtime-lock" or "build-lock" until it lands.`,
      );
    }
  }

  // `all` runs the locks first: snapshots installs from the runtime lock and records both
  // lock hashes, so it must observe their final contents, not the previous generation's.
  const lockKeys = mode === "all" ? ["runtime-lock", "build-lock"] : mode === "snapshots" ? [] : [mode];
  const outputs = lockKeys.map((k) => generateOne(k, { bridgeDir, pythonVersion, excludeNewer, check }, deps));
  if (wantsSnapshots) {
    outputs.push(...generateSnapshots({ bridgeDir, pythonVersion, excludeNewer, uvVersion, check }, deps));
  }
  return { outputs, changed: outputs.some((o) => o.changed) };
}

// ------------------------------------------------------------------------------ CLI

const FLAGS = { "--root": "root", "--uv": "uvVersion", "--python": "pythonVersion", "--exclude-newer": "excludeNewer" };

function usage(msg) {
  process.stderr.write(
    `generate-nlm-contract: ${msg}\n` +
      `usage: node scripts/generate-nlm-contract.mjs <${MODES.join("|")}> --root . --uv X.Y.Z \\\n` +
      `         --python X.Y --exclude-newer YYYY-MM-DDTHH:MM:SSZ [--check]\n`,
  );
  return 2;
}

function main(argv) {
  try {
    const mode = argv[0];
    const rest = argv.slice(1);
    const opts = { mode, check: false };
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === "--check") {
        opts.check = true;
        continue;
      }
      const key = FLAGS[rest[i]];
      if (!key) throw new InputError(`unknown argument: ${rest[i]}`);
      const v = rest[++i];
      if (v === undefined) throw new InputError(`${rest[i - 1]} requires a value`);
      opts[key] = v;
    }

    const r = generateNlmContract(opts);
    for (const o of r.outputs) {
      process.stdout.write(`${opts.check ? "OK   " : o.changed ? "WROTE" : "SAME "} ${o.path}  sha256=${o.sha256}\n`);
    }
    return 0;
  } catch (e) {
    if (e instanceof DriftError) {
      process.stderr.write(`generate-nlm-contract: ${e.message}\n`);
      return 1;
    }
    if (e instanceof InputError) return usage(e.message);
    return usage(`unexpected: ${e.message}`);
  }
}

if (process.argv[1]?.endsWith("generate-nlm-contract.mjs")) {
  process.exit(main(process.argv.slice(2)));
}
