// tests/diagram-validator-contract.test.mjs (plan §4 Task 4 / §6)
//
// Two contracts for diagram-kit's arch-diagram validator wiring:
//   1. STATIC (always runs): the SKILL.md body must resolve validate_diagram.py from the SKILL.md
//      locator, never ${CLAUDE_PLUGIN_ROOT} and never a bare cwd-relative `scripts/...`.
//   2. EXECUTION (REQUIRE_PYTHON=1, or auto-skip locally when no Python): from an unrelated cwd,
//      run the bundled validator with `spawn`/`shell:false` argv on a `.md` whose directory name
//      contains spaces, Chinese, and a single quote — proving the script accepts tricky paths.
//
// The automation deliberately does NOT claim to prove the model's final shell string; that is a
// manual acceptance surface. It only proves the checked-in script + the SKILL contract.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = path.join(repoRoot, "plugins/diagram-kit/skills/arch-diagram/SKILL.md");
const VALIDATOR = path.join(repoRoot, "plugins/diagram-kit/skills/arch-diagram/scripts/validate_diagram.py");
const REQUIRE_PYTHON = process.env.REQUIRE_PYTHON === "1";

/** SKILL.md body with the YAML frontmatter stripped (host-coupling lives only in the body). */
function skillBody() {
  const text = fs.readFileSync(SKILL, "utf8");
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? text.slice(m[0].length) : text;
}

test("static: arch-diagram body has no ${CLAUDE_PLUGIN_ROOT} host coupling", () => {
  assert.ok(!skillBody().includes("${CLAUDE_PLUGIN_ROOT}"), "body must not hard-code ${CLAUDE_PLUGIN_ROOT}");
});

test("static: validator is resolved from the SKILL.md locator, not cwd", () => {
  const body = skillBody();
  assert.ok(body.includes("scripts/validate_diagram.py"), "must reference the bundled validator");
  assert.match(body, /SKILL\.md/, "must anchor resolution to the SKILL.md locator");
  assert.match(body, /locator/, "must describe locator-based resolution");
  // The instruction must forbid resolving a bare scripts/... against cwd and require separate args.
  assert.match(body, /never (?:concatenate|resolve a bare `scripts\/)/, "must forbid bare-cwd resolution / concatenation");
  assert.match(body, /separate/, "must require the script path + .md as separate arguments");
});

test("static: the bundled validator exists and is pure-stdlib python", () => {
  assert.ok(fs.existsSync(VALIDATOR), "validate_diagram.py must exist in the plugin");
  const src = fs.readFileSync(VALIDATOR, "utf8");
  assert.ok(/def\s+main|__main__/.test(src), "validator must have an entry point");
});

/** Mirror the SKILL's python3 -> python -> py -3 probe. Returns {cmd, args} or null. */
function findPython() {
  const candidates = [
    ["python3", []],
    ["python", []],
    ["py", ["-3"]],
  ];
  for (const [cmd, pre] of candidates) {
    try {
      const r = spawnSync(cmd, [...pre, "--version"], { encoding: "utf8", shell: false });
      if (!r.error && (r.status === 0 || /python/i.test(`${r.stdout}${r.stderr}`))) return { cmd, args: pre };
    } catch {
      /* keep probing */
    }
  }
  return null;
}

test("execution: validator accepts a .md path with spaces / Chinese / single-quote (shell:false)", (t) => {
  const py = findPython();
  if (!py) {
    if (REQUIRE_PYTHON) assert.fail("REQUIRE_PYTHON=1 but no python3/python/py -3 found");
    t.skip("no Python interpreter found (python3/python/py -3); static contract still ran");
    return;
  }

  // A directory name that exercises the exact hazards the plan calls out.
  const trickyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "diagram-contract-"));
  const trickyDir = path.join(trickyRoot, "a b 中文 'q dir");
  fs.mkdirSync(trickyDir, { recursive: true });
  const mdPath = path.join(trickyDir, "struct-l1-context diagram.md");
  const diagram = [
    "```text",
    "flowchart TD",
    "%% Name: 系统上下文图 (system context)",
    "%% Slug: struct-l1-context",
    '  U["用户 User"] --> S["系统 System"]',
    "```",
    "",
  ].join("\n");
  fs.writeFileSync(mdPath, diagram);

  try {
    // Run from an UNRELATED cwd with the validator addressed by ABSOLUTE path (locator-derived),
    // and the tricky .md path as a SEPARATE argv entry — never string-concatenated.
    const r = spawnSync(py.cmd, [...py.args, VALIDATOR, mdPath], {
      cwd: os.tmpdir(),
      encoding: "utf8",
      shell: false, // the whole point: no shell = no quoting/escaping of the tricky path
    });
    assert.ok(!r.error, `validator should spawn, got ${r.error?.message}`);
    // exit 2 = usage / bad-args (would happen if the path were mangled and not found). The script
    // must have OPENED the file and linted it -> 0 (no FAIL) or 1 (FAIL), never 2, never a crash.
    assert.ok(r.status === 0 || r.status === 1, `validator must read the tricky path (exit 0/1), got ${r.status}: ${r.stderr}`);
    const out = `${r.stdout}${r.stderr}`;
    assert.ok(!/No such file|not found|cannot open|Errno 2/i.test(out), `validator must find the file, output: ${out}`);
  } finally {
    fs.rmSync(trickyRoot, { recursive: true, force: true });
  }
});
