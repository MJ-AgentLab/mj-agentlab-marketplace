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

// ------------------------------------------------------------------ production deps

function realRunUv(args, cwd) {
  return execFileSync("uv", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}

function realUvVersion() {
  const out = execFileSync("uv", ["--version"], { encoding: "utf8" });
  const m = /(\d+\.\d+\.\d+)/.exec(out);
  return m ? m[1] : null;
}

export const PRODUCTION_DEPS = { runUv: realRunUv, uvVersion: realUvVersion };

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

  if (mode === "snapshots" || mode === "all") {
    // Honest failure rather than a silent pass. `snapshots` installs the locked closure into
    // a throwaway venv and fingerprints the real upstream module; it cannot run before the
    // bridge package and tools/generate_contract_snapshots.py exist.
    const tool = path.join(bridgeDir, "tools", "generate_contract_snapshots.py");
    if (!fs.existsSync(tool)) {
      throw new InputError(
        `mode "${mode}" needs ${BRIDGE_DIR}/tools/generate_contract_snapshots.py and the bridge package, which do not exist yet.\n` +
          `Use "runtime-lock" or "build-lock" until they land.`,
      );
    }
  }

  const keys = mode === "all" ? ["runtime-lock", "build-lock"] : [mode];
  const outputs = keys.map((k) => generateOne(k, { bridgeDir, pythonVersion, excludeNewer, check }, deps));
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
