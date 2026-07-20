// Tests for scripts/validate-dual-host.mjs
//
// Strategy: copy the real repo tree into an OS-temp fixture, then mutate ONE thing per test and
// assert the specific finding code appears. A validator that only ever sees a valid tree proves
// nothing, so every rule gets a negative case.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateTree, tokenizeAllowedTools, hasBalancedParens } from "../scripts/validate-dual-host.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const COPY_PATHS = [
  ".claude-plugin/marketplace.json",
  ".agents/plugins/marketplace.json",
  "plugins/learn-kit/.claude-plugin/plugin.json",
  "plugins/learn-kit/.codex-plugin/plugin.json",
  "plugins/learn-kit/.mcp.json",
  "plugins/diagram-kit/.claude-plugin/plugin.json",
  "plugins/diagram-kit/.codex-plugin/plugin.json",
];

const SKILLS = [
  ["learn-kit", "three-views"],
  ["learn-kit", "glossary"],
  ["learn-kit", "concept"],
  ["diagram-kit", "arch-diagram"],
];

/** Build a minimal but real fixture: manifests + SKILL.md frontmatter + openai.yaml. */
function makeFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dual-host-fixture-"));
  for (const rel of COPY_PATHS) {
    const dest = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(REPO, rel), dest);
  }
  for (const [plugin, skill] of SKILLS) {
    const srcSkill = path.join(REPO, "plugins", plugin, "skills", skill, "SKILL.md");
    const dstSkill = path.join(dir, "plugins", plugin, "skills", skill, "SKILL.md");
    fs.mkdirSync(path.dirname(dstSkill), { recursive: true });
    // Frontmatter only: keeps fixtures fast and keeps the host-neutrality scan deterministic.
    const text = fs.readFileSync(srcSkill, "utf8");
    const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    fs.writeFileSync(dstSkill, m[0] + "\n# body\n");

    const srcY = path.join(REPO, "plugins", plugin, "skills", skill, "agents", "openai.yaml");
    const dstY = path.join(dir, "plugins", plugin, "skills", skill, "agents", "openai.yaml");
    fs.mkdirSync(path.dirname(dstY), { recursive: true });
    fs.copyFileSync(srcY, dstY);
  }
  return dir;
}

const cleanup = (d) => fs.rmSync(d, { recursive: true, force: true });
const readJson = (d, rel) => JSON.parse(fs.readFileSync(path.join(d, rel), "utf8"));
const writeJson = (d, rel, o) => fs.writeFileSync(path.join(d, rel), JSON.stringify(o, null, 2));
const codes = (r) => [...r.errors, ...r.warnings].map((f) => f.code);

/**
 * Replace a SKILL.md description, independent of line endings.
 *
 * The repo checks out CRLF on Windows, so a naive /description: \|-\n/ replace silently
 * matches nothing and the test then asserts against an unmutated fixture — i.e. it would
 * pass or fail for the wrong reason. Rebuild the frontmatter instead of pattern-patching it.
 */
function setDescription(d, rel, desc) {
  const p = path.join(d, rel);
  const t = fs.readFileSync(p, "utf8");
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(m, `${rel}: no frontmatter to rewrite`);
  const out = [];
  let inDescription = false;
  for (const line of m[1].split(/\r?\n/)) {
    if (/^description:/.test(line)) {
      inDescription = true;
      out.push("description: |-", `  ${desc}`);
      continue;
    }
    if (inDescription) {
      if (/^\S/.test(line)) inDescription = false; // next top-level key ends the block
      else continue;
    }
    out.push(line);
  }
  fs.writeFileSync(p, `---\n${out.join("\n")}\n---\n\n# body\n`);
}

/** Run body with a fresh fixture, always cleaning up. */
function withFixture(fn) {
  const d = makeFixture();
  try {
    return fn(d);
  } finally {
    cleanup(d);
  }
}

test("valid fixture tree produces zero errors", () => {
  withFixture((d) => {
    const r = validateTree(d, { hostNeutral: "error" });
    assert.deepEqual(r.errors, [], `unexpected errors: ${JSON.stringify(r.errors, null, 2)}`);
  });
});

test("real repo tree: structurally valid and host-neutral clean (PR2)", () => {
  // PR2 removed every ${CLAUDE_PLUGIN_ROOT} / mcp__plugin_ hit from shared runtime, so the real repo
  // is clean in BOTH modes. Detection of the needles is still proven by the synthetic-fixture tests
  // below, so this positive assertion is not vacuous.
  const warn = validateTree(REPO, { hostNeutral: "warn" });
  assert.deepEqual(warn.errors, [], `unexpected errors: ${JSON.stringify(warn.errors, null, 2)}`);
  assert.deepEqual(warn.warnings, [], `PR2 expects zero host-coupling warnings, got: ${JSON.stringify(warn.warnings, null, 2)}`);
  const err = validateTree(REPO, { hostNeutral: "error" });
  assert.deepEqual(err.errors, [], "error mode must also be clean after PR2");
});

test("real repo tree: host-neutral=error promotes the same hits to errors", () => {
  const warn = validateTree(REPO, { hostNeutral: "warn" });
  const err = validateTree(REPO, { hostNeutral: "error" });
  assert.equal(err.errors.length, warn.warnings.length);
  assert.equal(err.warnings.length, 0);
  // Same findings, different bucket — the rule must not change, only its severity.
  assert.deepEqual(err.errors.map((f) => f.code).sort(), warn.warnings.map((f) => f.code).sort());
});

test("host-coupling findings carry file-accurate line numbers", () => {
  const r = validateTree(REPO, { hostNeutral: "warn" });
  for (const f of r.warnings) {
    const [rel, lineStr] = f.path.split(":");
    const lines = fs.readFileSync(path.join(REPO, rel), "utf8").split("\n");
    const line = lines[Number(lineStr) - 1];
    assert.ok(
      line.includes("${CLAUDE_PLUGIN_ROOT}") || line.includes("mcp__plugin_"),
      `${f.path} does not actually contain the needle: ${JSON.stringify(line)}`,
    );
  }
});

test("frontmatter allowed-tools MCP IDs do not trigger the host-neutrality scan", () => {
  // three-views frontmatter legitimately names mcp__plugin_* Claude IDs. Only the BODY is scanned.
  const r = validateTree(REPO, { hostNeutral: "error" });
  const tv = r.errors.filter((f) => f.path.startsWith("plugins/learn-kit/skills/three-views/SKILL.md"));
  for (const f of tv) {
    const line = Number(f.path.split(":")[1]);
    assert.ok(line > 5, "frontmatter lines must not be reported");
  }
});

test("invalid hostNeutral value throws", () => {
  assert.throws(() => validateTree(REPO, { hostNeutral: "nope" }), TypeError);
});

// ------------------------------------------------------------------ catalog
test("native catalog plugin-set drift is an error", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins.pop();
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_SET_DRIFT"));
  });
});

test("native catalog plugin ORDER drift is an error", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins.reverse();
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_SET_DRIFT"));
  });
});

test("native catalog must not carry a version", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.metadata = { version: "7.0.0" };
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_NATIVE_HAS_VERSION"));
  });
});

test("learn-kit must be ON_USE, never ON_INSTALL", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins.find((p) => p.name === "learn-kit").policy.authentication = "ON_INSTALL";
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_POLICY_AUTH"));
  });
});

test("catalog source must point at an existing local plugin dir", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins[0].source.path = "./plugins/ghost";
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_SOURCE_PATH"));
  });
});

test("unparseable JSON is reported, not thrown", () => {
  withFixture((d) => {
    fs.writeFileSync(path.join(d, ".agents/plugins/marketplace.json"), "{ nope");
    assert.ok(codes(validateTree(d)).includes("JSON_UNPARSEABLE"));
  });
});

test("missing native catalog is an error", () => {
  withFixture((d) => {
    fs.rmSync(path.join(d, ".agents/plugins/marketplace.json"));
    assert.ok(codes(validateTree(d)).includes("CATALOG_MISSING"));
  });
});

// ------------------------------------------------------------- dual manifest
test("shared manifest field drift (version) is an error", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.codex-plugin/plugin.json");
    m.version = "9.9.9";
    writeJson(d, "plugins/learn-kit/.codex-plugin/plugin.json", m);
    const f = validateTree(d).errors.find((x) => x.code === "MANIFEST_FIELD_DRIFT");
    assert.ok(f && f.message.includes("version"));
  });
});

test("shared manifest field drift (license/repository/skills) is an error", () => {
  for (const field of ["license", "repository", "skills"]) {
    withFixture((d) => {
      const m = readJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json");
      m[field] = "drifted";
      writeJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json", m);
      const f = validateTree(d).errors.find((x) => x.code === "MANIFEST_FIELD_DRIFT" && x.message.includes(field));
      assert.ok(f, `expected drift finding for ${field}`);
    });
  }
});

test("native description may differ from legacy description (intentional)", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.codex-plugin/plugin.json");
    m.description = "A totally different short host-neutral description.";
    writeJson(d, "plugins/learn-kit/.codex-plugin/plugin.json", m);
    assert.ok(!codes(validateTree(d)).includes("MANIFEST_FIELD_DRIFT"));
  });
});

test("native keywords must be a subset of legacy keywords", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.codex-plugin/plugin.json");
    m.keywords = [...m.keywords, "not-in-legacy"];
    writeJson(d, "plugins/learn-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("MANIFEST_KEYWORDS_NOT_SUBSET"));
  });
});

test("native keywords must be non-empty", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.codex-plugin/plugin.json");
    m.keywords = [];
    writeJson(d, "plugins/learn-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("MANIFEST_KEYWORDS_EMPTY"));
  });
});

test("missing developerName is an error", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json");
    delete m.interface.developerName;
    writeJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("MANIFEST_INTERFACE_FIELD"));
  });
});

test("defaultPrompt over 3 entries or over 128 chars is an error", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.codex-plugin/plugin.json");
    m.interface.defaultPrompt = [...m.interface.defaultPrompt, "Use $learn-kit:glossary again.", "Use $learn-kit:concept again."];
    writeJson(d, "plugins/learn-kit/.codex-plugin/plugin.json", m);
    assert.ok(validateTree(d).errors.some((f) => f.code === "MANIFEST_DEFAULT_PROMPT" && /entries/.test(f.message)));
  });
  withFixture((d) => {
    const m = readJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json");
    m.interface.defaultPrompt = ["Use $diagram-kit:arch-diagram " + "x".repeat(140)];
    writeJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json", m);
    assert.ok(validateTree(d).errors.some((f) => f.code === "MANIFEST_DEFAULT_PROMPT" && /128/.test(f.message)));
  });
});

test("bare $skill in defaultPrompt is rejected (Codex matches $plugin:skill)", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json");
    m.interface.defaultPrompt = ["Use $arch-diagram to draw diagrams."];
    writeJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("PROMPT_UNQUALIFIED_SKILL"));
  });
});

test("defaultPrompt referencing an unknown skill is an error", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json");
    m.interface.defaultPrompt = ["Use $diagram-kit:no-such-skill to draw."];
    writeJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("PROMPT_UNKNOWN_SKILL"));
  });
});

test("mcpServers must be declared iff .mcp.json exists", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json");
    m.mcpServers = "./.mcp.json";
    writeJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("MANIFEST_MCP_POINTER"));
  });
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.codex-plugin/plugin.json");
    delete m.mcpServers;
    writeJson(d, "plugins/learn-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("MANIFEST_MCP_POINTER"));
  });
});

// ----------------------------------------------------------------- .mcp.json
test(".mcp.json command must be the local bridge", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.mcp.json");
    m.mcpServers["notebooklm-mcp"].command = "notebooklm-mcp";
    writeJson(d, "plugins/learn-kit/.mcp.json", m);
    assert.ok(codes(validateTree(d)).includes("MCP_COMMAND"));
  });
});

test(".mcp.json must not use a runner (npx/uvx/pipx) as command", () => {
  for (const runner of ["npx", "uvx", "pipx", "uv", "python"]) {
    withFixture((d) => {
      const m = readJson(d, "plugins/learn-kit/.mcp.json");
      m.mcpServers["notebooklm-mcp"].command = runner;
      writeJson(d, "plugins/learn-kit/.mcp.json", m);
      assert.ok(codes(validateTree(d)).includes("MCP_RUNNER_FORBIDDEN"), `${runner} must be rejected`);
    });
  }
});

test(".mcp.json args must stay empty", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.mcp.json");
    m.mcpServers["notebooklm-mcp"].args = ["--debug"];
    writeJson(d, "plugins/learn-kit/.mcp.json", m);
    assert.ok(codes(validateTree(d)).includes("MCP_ARGS"));
  });
});

test(".mcp.json must not carry env (the bridge owns environment policy)", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.mcp.json");
    m.mcpServers["notebooklm-mcp"].env = { NOTEBOOKLM_BASE_URL: "https://evil.example" };
    writeJson(d, "plugins/learn-kit/.mcp.json", m);
    assert.ok(codes(validateTree(d)).includes("MCP_FORBIDDEN_FIELD"));
  });
});

test(".mcp.json server key must stay notebooklm-mcp", () => {
  withFixture((d) => {
    fs.writeFileSync(
      path.join(d, "plugins/learn-kit/.mcp.json"),
      JSON.stringify({ mcpServers: { renamed: { command: "learn-kit-nlm-bridge", args: [] } } }, null, 2),
    );
    assert.ok(codes(validateTree(d)).includes("MCP_SERVER_KEY"));
  });
});

// ------------------------------------------------------------- openai.yaml
test("missing openai.yaml is an error", () => {
  withFixture((d) => {
    fs.rmSync(path.join(d, "plugins/learn-kit/skills/concept/agents/openai.yaml"));
    assert.ok(codes(validateTree(d)).includes("OPENAI_YAML_MISSING"));
  });
});

test("openai.yaml must omit dependencies.tools (no optional semantics)", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/three-views/agents/openai.yaml");
    fs.appendFileSync(p, "dependencies:\n  tools:\n    - notebooklm-mcp\n");
    assert.ok(codes(validateTree(d)).includes("OPENAI_YAML_DEPENDENCY_TOOLS"));
  });
});

test("allow_implicit_invocation must live under policy", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/glossary/agents/openai.yaml");
    fs.writeFileSync(
      p,
      'interface:\n  display_name: "Glossary"\n  short_description: "x"\n  default_prompt: "Use $learn-kit:glossary to explain TERM."\nallow_implicit_invocation: true\n',
    );
    const c = codes(validateTree(d));
    assert.ok(c.includes("OPENAI_YAML_POLICY"));
    assert.ok(c.includes("OPENAI_YAML_POLICY_MISPLACED"));
  });
});

test("openai.yaml default_prompt must reference its own qualified name", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/concept/agents/openai.yaml");
    fs.writeFileSync(
      p,
      'interface:\n  display_name: "Concept"\n  short_description: "x"\n  default_prompt: "Use $learn-kit:glossary instead."\npolicy:\n  allow_implicit_invocation: true\n',
    );
    assert.ok(codes(validateTree(d)).includes("PROMPT_WRONG_SKILL"));
  });
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/concept/agents/openai.yaml");
    fs.writeFileSync(
      p,
      'interface:\n  display_name: "Concept"\n  short_description: "x"\n  default_prompt: "Use $concept to explain."\npolicy:\n  allow_implicit_invocation: true\n',
    );
    assert.ok(codes(validateTree(d)).includes("PROMPT_UNQUALIFIED_SKILL"));
  });
});

test("unparseable openai.yaml is reported, not thrown", () => {
  withFixture((d) => {
    fs.writeFileSync(path.join(d, "plugins/learn-kit/skills/glossary/agents/openai.yaml"), "interface:\n  a: [unclosed\n");
    assert.ok(codes(validateTree(d)).includes("YAML_UNPARSEABLE"));
  });
});

// -------------------------------------------------------------- descriptions
test("setDescription helper actually mutates the fixture (guards the CRLF trap)", () => {
  withFixture((d) => {
    const rel = "plugins/learn-kit/skills/glossary/SKILL.md";
    setDescription(d, rel, "SENTINEL-VALUE");
    assert.match(fs.readFileSync(path.join(d, rel), "utf8"), /SENTINEL-VALUE/);
  });
});

test("description over the Codex 1024 limit is an error", () => {
  withFixture((d) => {
    setDescription(d, "plugins/learn-kit/skills/glossary/SKILL.md", "x".repeat(1100));
    assert.ok(codes(validateTree(d)).includes("SKILL_DESC_TOO_LONG_CODEX"));
  });
});

test("description within 1024 but over the Claude 1536 limit cannot occur — 1024 is stricter", () => {
  withFixture((d) => {
    setDescription(d, "plugins/learn-kit/skills/glossary/SKILL.md", "x".repeat(1600));
    const c = codes(validateTree(d));
    assert.ok(c.includes("SKILL_DESC_TOO_LONG_CODEX"));
    assert.ok(c.includes("SKILL_DESC_TOO_LONG_CLAUDE"));
  });
});

test("description containing angle brackets is an error (Codex validator rejects them)", () => {
  withFixture((d) => {
    setDescription(d, "plugins/learn-kit/skills/glossary/SKILL.md", "Use when the user types /glossary <term> to explain it.");
    assert.ok(codes(validateTree(d)).includes("SKILL_DESC_ANGLE_BRACKET"));
  });
});

test("empty description is an error", () => {
  withFixture((d) => {
    setDescription(d, "plugins/learn-kit/skills/concept/SKILL.md", "");
    assert.ok(codes(validateTree(d)).includes("SKILL_DESC_MISSING"));
  });
});

test("all four shipped descriptions satisfy both host gates", () => {
  const r = validateTree(REPO, { hostNeutral: "warn" });
  const descCodes = r.errors.filter((f) => f.code.startsWith("SKILL_DESC"));
  assert.deepEqual(descCodes, []);
});

// ------------------------------------------------------- allowed-tools contract
/** Mutate three-views' allowed-tools scalar, line-ending agnostic. */
function patchAllowedTools(d, fn) {
  const p = path.join(d, "plugins/learn-kit/skills/three-views/SKILL.md");
  const t = fs.readFileSync(p, "utf8");
  const m = /allowed-tools: '([^']*)'/.exec(t);
  assert.ok(m, "fixture lost its allowed-tools scalar");
  const next = t.replace(m[0], `allowed-tools: '${fn(m[1])}'`);
  assert.notEqual(next, t, "mutation was a no-op — the test would prove nothing");
  fs.writeFileSync(p, next);
}

test("three-views must not pre-authorize refresh_auth / server_info / source_delete", () => {
  // Assert each rule PRECISELY. An `||` across codes cannot tell which rule fired, so the
  // denylist could be deleted while a count check keeps the suite green.
  for (const bad of ["refresh_auth", "server_info", "source_delete"]) {
    withFixture((d) => {
      patchAllowedTools(d, (v) => `${v} mcp__plugin_learn-kit_notebooklm-mcp__${bad}`);
      const c = codes(validateTree(d));
      assert.ok(c.includes("ALLOWED_TOOLS_FORBIDDEN_MCP"), `${bad}: denylist rule must fire`);
      assert.ok(c.includes("ALLOWED_TOOLS_UNKNOWN_MCP"), `${bad}: allowlist rule must fire`);
      assert.ok(c.includes("ALLOWED_TOOLS_MCP_COUNT"), `${bad}: count rule must fire`);
    });
  }
});

test("dropping a required MCP tool fires MISSING and COUNT independently", () => {
  withFixture((d) => {
    patchAllowedTools(d, (v) => v.replace(" mcp__plugin_learn-kit_notebooklm-mcp__notebook_get", ""));
    const c = codes(validateTree(d));
    assert.ok(c.includes("ALLOWED_TOOLS_MISSING_MCP"));
    assert.ok(c.includes("ALLOWED_TOOLS_MCP_COUNT"));
  });
});

test("an unknown MCP tool that keeps the count at 6 is still rejected by name", () => {
  withFixture((d) => {
    // Swap one allowed tool for an unknown one: count stays 6, so only the allowlist catches it.
    patchAllowedTools(d, (v) =>
      v.replace("mcp__plugin_learn-kit_notebooklm-mcp__studio_status", "mcp__plugin_learn-kit_notebooklm-mcp__future_tool"),
    );
    const c = codes(validateTree(d));
    assert.ok(c.includes("ALLOWED_TOOLS_UNKNOWN_MCP"), "name allowlist must catch it");
    assert.ok(!c.includes("ALLOWED_TOOLS_MCP_COUNT"), "count is still 6 — proving the count alone is insufficient");
  });
});

// Bash(*) is Claude's unrestricted-shell grant: strictly broader than bare `Bash`, and invisible
// to a denylist keyed on the literal token "Bash".
test("wildcard Bash grants are rejected on the MCP-bearing skill", () => {
  for (const wildcard of ["Bash(*)", "Bash(:*)", "Bash(node *)", "Bash(rm -rf /)"]) {
    withFixture((d) => {
      patchAllowedTools(d, (v) => `Read ${wildcard} ${v.slice(5)}`);
      assert.ok(
        codes(validateTree(d)).includes("ALLOWED_TOOLS_UNSCOPED_BASH"),
        `${wildcard} must be rejected`,
      );
    });
  }
});

test("the installer must never be pre-authorized", () => {
  withFixture((d) => {
    patchAllowedTools(d, (v) => `${v} Bash(node "\${CLAUDE_SKILL_DIR}/scripts/install-nlm-bridge.mjs" *)`);
    assert.ok(codes(validateTree(d)).includes("ALLOWED_TOOLS_INSTALLER"));
  });
});

// A tab between tokens previously fused two entries into one opaque token, so the count check
// would read "6" while a 7th tool was in fact granted.
test("whitespace other than a space cannot smuggle a tool past the tokenizer", () => {
  withFixture((d) => {
    patchAllowedTools(d, (v) => `${v}\tmcp__plugin_learn-kit_notebooklm-mcp__refresh_auth`);
    const c = codes(validateTree(d));
    assert.ok(c.includes("ALLOWED_TOOLS_FORBIDDEN_MCP"), "tab-separated refresh_auth must be seen");
  });
  withFixture((d) => {
    patchAllowedTools(d, (v) => `Read\tBash ${v.slice(5)}`);
    assert.ok(codes(validateTree(d)).includes("ALLOWED_TOOLS_BARE_BASH"), "tab-separated bare Bash must be seen");
  });
});

test("a skill declaring MCP tools without a plugin .mcp.json is rejected", () => {
  withFixture((d) => {
    fs.rmSync(path.join(d, "plugins/learn-kit/.mcp.json"));
    assert.ok(codes(validateTree(d)).includes("ALLOWED_TOOLS_MCP_WITHOUT_SERVER"));
  });
});

// The plan constrains "no general Bash" to the MCP-bearing skill only; arch-diagram shells out
// to the bundled Python validator and must keep bare Bash.
test("arch-diagram keeps bare Bash without being flagged", () => {
  const r = validateTree(REPO, { hostNeutral: "warn" });
  assert.deepEqual(
    r.errors.filter((f) => f.path.includes("arch-diagram") && f.code.startsWith("ALLOWED_TOOLS")),
    [],
  );
  const t = fs.readFileSync(path.join(REPO, "plugins/diagram-kit/skills/arch-diagram/SKILL.md"), "utf8");
  assert.match(t, /allowed-tools: "Read Glob Grep Bash Write AskUserQuestion"/);
});

test("the capability contract is keyed on declared MCP tools, not on a skill name", () => {
  // Renaming the skill directory must not disable the narrowing.
  withFixture((d) => {
    const from = path.join(d, "plugins/learn-kit/skills/three-views");
    const to = path.join(d, "plugins/learn-kit/skills/renamed-views");
    fs.renameSync(from, to);
    const sk = path.join(to, "SKILL.md");
    fs.writeFileSync(sk, fs.readFileSync(sk, "utf8").replace("name: three-views", "name: renamed-views"));
    const y = path.join(to, "agents/openai.yaml");
    fs.writeFileSync(y, fs.readFileSync(y, "utf8").replace("$learn-kit:three-views", "$learn-kit:renamed-views"));
    fs.writeFileSync(sk, fs.readFileSync(sk, "utf8").replace(/allowed-tools: '([^']*)'/, "allowed-tools: '$1 mcp__plugin_learn-kit_notebooklm-mcp__refresh_auth'"));
    assert.ok(
      codes(validateTree(d)).includes("ALLOWED_TOOLS_FORBIDDEN_MCP"),
      "a renamed MCP-bearing skill must still be narrowed",
    );
  });
});

test("three-views must not pre-authorize bare Bash", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/three-views/SKILL.md");
    const t = fs.readFileSync(p, "utf8").replace(/allowed-tools: 'Read /, "allowed-tools: 'Read Bash ");
    fs.writeFileSync(p, t);
    assert.ok(codes(validateTree(d)).includes("ALLOWED_TOOLS_BARE_BASH"));
  });
});

test("three-views must keep the scoped hash-helper permission", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/three-views/SKILL.md");
    const t = fs
      .readFileSync(p, "utf8")
      .replace(/Bash\(node "\$\{CLAUDE_SKILL_DIR\}\/scripts\/hash-upload-corpus\.mjs" \*\) /, "");
    fs.writeFileSync(p, t);
    assert.ok(codes(validateTree(d)).includes("ALLOWED_TOOLS_SCOPED_HELPER"));
  });
});

test("three-views allowed-tools must be a scalar, not a YAML list", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/three-views/SKILL.md");
    const t = fs.readFileSync(p, "utf8").replace(/allowed-tools: '.*'/, "allowed-tools:\n  - Read\n  - Write");
    fs.writeFileSync(p, t);
    assert.ok(codes(validateTree(d)).includes("ALLOWED_TOOLS_NOT_SCALAR"));
  });
});

test("shipped three-views exposes exactly the 6 allowed MCP tools", () => {
  const text = fs.readFileSync(path.join(REPO, "plugins/learn-kit/skills/three-views/SKILL.md"), "utf8");
  const at = /allowed-tools: '(.*)'/.exec(text)[1];
  const mcp = tokenizeAllowedTools(at).filter((t) => t.startsWith("mcp__plugin_"));
  assert.equal(mcp.length, 6);
  assert.deepEqual(
    mcp.map((t) => t.split("__").pop()).sort(),
    ["notebook_create", "notebook_get", "notebook_list", "source_add", "studio_create", "studio_status"],
  );
});

// -------------------------------------------------------------- tokenizer
test("tokenizeAllowedTools keeps a scoped Bash permission (with inner spaces) intact", () => {
  const v = 'Read Write Bash(node "${CLAUDE_SKILL_DIR}/scripts/hash-upload-corpus.mjs" *) Grep';
  assert.deepEqual(tokenizeAllowedTools(v), [
    "Read",
    "Write",
    'Bash(node "${CLAUDE_SKILL_DIR}/scripts/hash-upload-corpus.mjs" *)',
    "Grep",
  ]);
});

test("tokenizeAllowedTools does not mistake Bash(...) for bare Bash", () => {
  const v = 'Read Bash(node "x" *)';
  assert.ok(!tokenizeAllowedTools(v).includes("Bash"));
});

test("tokenizeAllowedTools splits on all whitespace, not just U+0020", () => {
  assert.deepEqual(tokenizeAllowedTools("Read\tBash Write"), ["Read", "Bash", "Write"]);
  assert.deepEqual(tokenizeAllowedTools("Read \t Bash"), ["Read", "Bash"]);
  // ...but whitespace INSIDE a scoped permission must not split it.
  assert.deepEqual(tokenizeAllowedTools('Bash(node "a\tb" *) Read'), ['Bash(node "a\tb" *)', "Read"]);
});

// ------------------------------------------------- host-coupling: PR2 cleared the real repo
// PR1's exit state was exactly 7 hits (6 ${CLAUDE_PLUGIN_ROOT} + 1 mcp__plugin_); PR2 flipped the
// scan to error and removed all of them. The needles' DETECTION is proven independently by the
// synthetic-fixture tests below, so asserting zero here is not vacuous.
test("real repo has zero host-coupling after PR2 (both needles cleared)", () => {
  const r = validateTree(REPO, { hostNeutral: "warn" });
  const byCode = (c) => r.warnings.filter((f) => f.code === c);
  assert.equal(byCode("HOST_COUPLED_PLUGIN_ROOT").length, 0, "PR2 removed every ${CLAUDE_PLUGIN_ROOT} hit");
  assert.equal(byCode("HOST_COUPLED_MCP_PREFIX").length, 0, "PR2 removed the mcp__plugin_ shared-runtime hit");
  assert.equal(r.warnings.length, 0, "PR2 exit state is zero host-coupling warnings");
});

test("a newly introduced host coupling in a template is detected", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/three-views/templates");
    fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(path.join(p, "t.md"), "Read ${CLAUDE_PLUGIN_ROOT}/skills/x.md\n");
    assert.ok(codes(validateTree(d, { hostNeutral: "error" })).includes("HOST_COUPLED_PLUGIN_ROOT"));
  });
});

test("a host coupling in references/ is detected", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/diagram-kit/skills/arch-diagram/references");
    fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(path.join(p, "r.md"), "use mcp__plugin_foo__bar\n");
    assert.ok(codes(validateTree(d, { hostNeutral: "error" })).includes("HOST_COUPLED_MCP_PREFIX"));
  });
});

// ------------------------------------------------------------ version triangle
test("catalog version drifting from plugin.json is an error", () => {
  withFixture((d) => {
    const c = readJson(d, ".claude-plugin/marketplace.json");
    c.plugins.find((p) => p.name === "learn-kit").version = "9.9.9";
    writeJson(d, ".claude-plugin/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("VERSION_TRIANGLE_DRIFT"));
  });
});

test("shipped tree has a consistent version triangle", () => {
  assert.deepEqual(validateTree(REPO).errors.filter((f) => f.code === "VERSION_TRIANGLE_DRIFT"), []);
});

// --------------------------------------------- remaining catalog / manifest rules
test("catalog name drift is an error", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.name = "renamed";
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_NAME_DRIFT"));
  });
});

test("a nonsense authentication policy is rejected on any plugin", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins.find((p) => p.name === "diagram-kit").policy.authentication = "NONSENSE";
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_POLICY_AUTH"));
  });
});

test("a non-AVAILABLE installation policy is rejected", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins[0].policy.installation = "NOT_AVAILABLE";
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_POLICY_INSTALL"));
  });
});

test("an unexpected category is rejected, and a blank one is invalid", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins[0].category = "Games";
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_CATEGORY_UNEXPECTED"));
  });
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins[0].category = "   ";
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_CATEGORY_INVALID"), "whitespace-only is not a value");
  });
});

test("a per-plugin version in the native catalog is rejected", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins[0].version = "3.2.1";
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_NATIVE_HAS_VERSION"));
  });
});

test("native/legacy catalog source misalignment is an error", () => {
  withFixture((d) => {
    const c = readJson(d, ".claude-plugin/marketplace.json");
    c.plugins.find((p) => p.name === "learn-kit").source = "./plugins/elsewhere";
    writeJson(d, ".claude-plugin/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_SOURCE_DRIFT"));
  });
});

test("every shared manifest field is compared — none may be dropped from the list", () => {
  for (const field of ["name", "version", "author", "repository", "license", "skills"]) {
    withFixture((d) => {
      const m = readJson(d, "plugins/learn-kit/.codex-plugin/plugin.json");
      m[field] = field === "author" ? { name: "Someone Else" } : "drifted";
      writeJson(d, "plugins/learn-kit/.codex-plugin/plugin.json", m);
      const f = validateTree(d).errors.find((x) => x.code === "MANIFEST_FIELD_DRIFT" && x.message.startsWith(field + ":"));
      assert.ok(f, `${field} drift must be detected`);
    });
  }
});

test("a required field deleted from BOTH manifests is still an error", () => {
  // Equality alone would accept this (undefined === undefined).
  withFixture((d) => {
    for (const rel of ["plugins/learn-kit/.claude-plugin/plugin.json", "plugins/learn-kit/.codex-plugin/plugin.json"]) {
      const m = readJson(d, rel);
      delete m.skills;
      writeJson(d, rel, m);
    }
    const c = codes(validateTree(d));
    assert.ok(c.includes("MANIFEST_FIELD_MISSING"));
    assert.ok(!c.includes("MANIFEST_FIELD_DRIFT"), "they still match — presence is the only thing catching this");
  });
});

test("blank interface strings are rejected", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.codex-plugin/plugin.json");
    m.interface.displayName = "   ";
    writeJson(d, "plugins/learn-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("MANIFEST_INTERFACE_FIELD"));
  });
});

test("interface.category must match the catalog category", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.codex-plugin/plugin.json");
    m.interface.category = "Developer Tools";
    writeJson(d, "plugins/learn-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("MANIFEST_CATEGORY_DRIFT"));
  });
});

test("defaultPrompt referencing another plugin's skill is an error", () => {
  withFixture((d) => {
    const m = readJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json");
    m.interface.defaultPrompt = ["Use $learn-kit:glossary to explain a term."];
    writeJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("PROMPT_FOREIGN_PLUGIN"));
  });
});

test("skill frontmatter name must match its directory", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/concept/SKILL.md");
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace("name: concept", "name: wrong"));
    assert.ok(codes(validateTree(d)).includes("SKILL_NAME_DRIFT"));
  });
});

test("a skills/ directory without SKILL.md is a resource folder, not a skill", () => {
  withFixture((d) => {
    fs.mkdirSync(path.join(d, "plugins/learn-kit/skills/nlm-shared"), { recursive: true });
    fs.writeFileSync(path.join(d, "plugins/learn-kit/skills/nlm-shared/notes.md"), "shared notes\n");
    assert.deepEqual(validateTree(d).errors, [], "a folder with no SKILL.md must be skipped silently");
  });
});

test("a -shared directory that DOES contain a SKILL.md is still validated", () => {
  // The suffix must not become a way to bypass the description/capability gates: both hosts
  // auto-discover any directory containing a SKILL.md.
  withFixture((d) => {
    const dir = path.join(d, "plugins/learn-kit/skills/sneaky-shared");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "SKILL.md"), `---\nname: sneaky-shared\ndescription: |-\n  Has a <bracket> and no openai.yaml.\n---\n\n# body\n`);
    const c = codes(validateTree(d));
    assert.ok(c.includes("SKILL_DESC_ANGLE_BRACKET"), "description gate must still apply");
    assert.ok(c.includes("OPENAI_YAML_MISSING"), "openai.yaml requirement must still apply");
  });
});

test(".mcp.json is validated against an exact shape, not a denylist", () => {
  // A denylist cannot express "fixed content": an unforeseen key would sail through.
  withFixture((d) => {
    const m = readJson(d, "plugins/learn-kit/.mcp.json");
    m.mcpServers["notebooklm-mcp"].envPassthrough = ["NLM_PROFILE"];
    writeJson(d, "plugins/learn-kit/.mcp.json", m);
    assert.ok(codes(validateTree(d)).includes("MCP_FORBIDDEN_FIELD"));
  });
});

// ---------------------------------------------------- omission & tokenizer bypasses
// Omitting allowed-tools is the WIDEST grant (the skill inherits the session's full tool set),
// so it must never be the one case the contract skips.
test("omitting allowed-tools on the MCP-bearing skill is an error", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/three-views/SKILL.md");
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace(/allowed-tools: '[^']*'\r?\n/, ""));
    assert.ok(codes(validateTree(d)).includes("ALLOWED_TOOLS_ABSENT"));
  });
});

test("pure-prompt skills may omit allowed-tools", () => {
  // glossary/concept ship name+description only, per spec.
  const r = validateTree(REPO, { hostNeutral: "warn" });
  assert.deepEqual(r.errors.filter((f) => f.code === "ALLOWED_TOOLS_ABSENT"), []);
});

test("an unbalanced parenthesis fails closed instead of silently fusing tokens", () => {
  // depth never returns to 0 -> every later entry fuses into one opaque token -> the mcp__
  // tokens vanish -> the whole strict regime would be skipped.
  for (const evil of ["Bash(foo", "Read(x Bash(*)"]) {
    withFixture((d) => {
      patchAllowedTools(d, (v) => `${v} ${evil}`);
      assert.ok(codes(validateTree(d)).includes("ALLOWED_TOOLS_UNBALANCED_PAREN"), `${evil} must fail closed`);
    });
  }
});

test("forbidden tools cannot hide behind a token-fusing paren", () => {
  withFixture((d) => {
    patchAllowedTools(
      d,
      (v) => `${v} Bash(x mcp__plugin_learn-kit_notebooklm-mcp__refresh_auth mcp__plugin_learn-kit_notebooklm-mcp__source_delete`,
    );
    assert.ok(codes(validateTree(d)).includes("ALLOWED_TOOLS_UNBALANCED_PAREN"));
  });
});

test("hasBalancedParens", () => {
  assert.equal(hasBalancedParens('Bash(node "a b" *) Read'), true);
  assert.equal(hasBalancedParens("Bash(foo"), false);
  assert.equal(hasBalancedParens("Read) x"), false);
  assert.equal(hasBalancedParens("Read Write"), true);
});

// The positive contract must be pinned by NAME: what a skill MUST declare cannot be derived from
// what it happens to declare, or deleting the declaration deletes the rule requiring it.
test("stripping every MCP ID still fires the positive contract", () => {
  withFixture((d) => {
    patchAllowedTools(d, (v) => v.split(/\s+/).filter((t) => !t.startsWith("mcp__")).join(" "));
    const c = codes(validateTree(d));
    assert.ok(c.includes("ALLOWED_TOOLS_MISSING_MCP"), "the 6 required tools must still be required");
    assert.ok(c.includes("ALLOWED_TOOLS_MCP_COUNT"));
  });
});

test("reducing three-views to an unrestricted grant is caught", () => {
  withFixture((d) => {
    patchAllowedTools(d, () => "Read Write Glob Grep AskUserQuestion Agent WebFetch Bash");
    const c = codes(validateTree(d));
    assert.ok(c.includes("ALLOWED_TOOLS_BARE_BASH"));
    assert.ok(c.includes("ALLOWED_TOOLS_SCOPED_HELPER"));
    assert.ok(c.includes("ALLOWED_TOOLS_MISSING_MCP"));
  });
});

// ------------------------------------------------------- inline mcpServers bypass
test("an inline mcpServers object in either manifest is rejected", () => {
  // Claude Code accepts an inline object here; it would route around the .mcp.json gates.
  for (const rel of [
    "plugins/learn-kit/.claude-plugin/plugin.json",
    "plugins/learn-kit/.codex-plugin/plugin.json",
  ]) {
    withFixture((d) => {
      const m = readJson(d, rel);
      m.mcpServers = { "notebooklm-mcp": { command: "npx", args: ["-y", "notebooklm-mcp-cli@latest"] } };
      writeJson(d, rel, m);
      assert.ok(codes(validateTree(d)).includes("MANIFEST_INLINE_MCP"), `${rel} inline object must be rejected`);
    });
  }
});

// --------------------------------------------------- per-skill gate independence
test("a skill dir shipping agents/ but no SKILL.md is an error, not a silent skip", () => {
  withFixture((d) => {
    fs.rmSync(path.join(d, "plugins/learn-kit/skills/three-views/SKILL.md"));
    assert.ok(codes(validateTree(d)).includes("SKILL_MISSING"));
  });
});

test("openai.yaml is still validated when SKILL.md is missing", () => {
  // The two are different files; gating one on the other takes the UI contract offline silently.
  withFixture((d) => {
    fs.rmSync(path.join(d, "plugins/learn-kit/skills/concept/SKILL.md"));
    const p = path.join(d, "plugins/learn-kit/skills/concept/agents/openai.yaml");
    fs.writeFileSync(p, 'interface:\n  display_name: ""\n  short_description: "x"\n  default_prompt: "Use $learn-kit:concept."\npolicy:\n  allow_implicit_invocation: false\ndependencies:\n  tools:\n    - nlm\n');
    const c = codes(validateTree(d));
    assert.ok(c.includes("SKILL_MISSING"));
    assert.ok(c.includes("OPENAI_YAML_FIELD"), "blank display_name must still be caught");
    assert.ok(c.includes("OPENAI_YAML_POLICY"), "allow_implicit_invocation must still be caught");
    assert.ok(c.includes("OPENAI_YAML_DEPENDENCY_TOOLS"), "dependencies must still be caught");
  });
});

test("openai.yaml rejects any dependencies subkey, not just .tools", () => {
  withFixture((d) => {
    const p = path.join(d, "plugins/learn-kit/skills/glossary/agents/openai.yaml");
    fs.appendFileSync(p, "dependencies:\n  mcp_servers:\n    - notebooklm-mcp\n");
    assert.ok(codes(validateTree(d)).includes("OPENAI_YAML_DEPENDENCY_TOOLS"));
  });
});

test("defaultPrompt must reference a skill that has a SKILL.md, not just a directory", () => {
  withFixture((d) => {
    fs.mkdirSync(path.join(d, "plugins/diagram-kit/skills/ghost"), { recursive: true });
    const m = readJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json");
    m.interface.defaultPrompt = ["Use $diagram-kit:ghost to draw."];
    writeJson(d, "plugins/diagram-kit/.codex-plugin/plugin.json", m);
    assert.ok(codes(validateTree(d)).includes("PROMPT_UNKNOWN_SKILL"));
  });
});

test("plugin categories cannot be swapped", () => {
  withFixture((d) => {
    const c = readJson(d, ".agents/plugins/marketplace.json");
    c.plugins.find((p) => p.name === "learn-kit").category = "Developer Tools";
    c.plugins.find((p) => p.name === "diagram-kit").category = "Education & Research";
    writeJson(d, ".agents/plugins/marketplace.json", c);
    assert.ok(codes(validateTree(d)).includes("CATALOG_CATEGORY_UNEXPECTED"));
  });
});
