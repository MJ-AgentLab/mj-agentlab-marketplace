// tests/documentation-contract.test.mjs (plan §4 Task 5 / §6)
//
// Locks the v7.0.0 release-doc surface with a heading/code-fence parser so a matching phrase in a
// HISTORICAL section can't make a naive whole-file substring check pass. Two rules of thumb:
//   - "current release section" = the content of the FIRST `## [...]` block in a CHANGELOG (works
//     for both `[Unreleased]` and the post-release `[7.0.0]` transform).
//   - forbidden install tokens are checked inside CODE FENCES only — the READMEs legitimately
//     mention `uv tool install` / `--force` / bare `$three-views` in *negation* prose ("do NOT use
//     …"), which must stay allowed.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8");

/** All fenced code blocks: [{ lang, code, lines }]. */
function fences(text) {
  const out = [];
  const re = /```([^\n]*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ lang: m[1].trim(), code: m[2], lines: m[2].split("\n") });
  }
  return out;
}

/** Content of the first `## [...]` CHANGELOG block (the current, not-yet-historical release). */
function firstChangelogSection(text) {
  const idx = text.indexOf("## [");
  assert.ok(idx !== -1, "changelog has no version section");
  const rest = text.slice(idx + 4);
  const next = rest.indexOf("\n## [");
  return next === -1 ? text.slice(idx) : text.slice(idx, idx + 4 + next);
}

/** True if any fenced block contains `needle`. */
const inAnyFence = (text, needle) => fences(text).some((f) => f.code.includes(needle));

// ------------------------------------------------------------------ CHANGELOGs

test("root CHANGELOG current section carries the NLM-only BREAKING anchors", () => {
  const section = firstChangelogSection(read("CHANGELOG.md"));
  assert.ok(section.trim().length > 200, "current changelog section must not be a hollow heading");
  for (const anchor of [
    "NLM-only BREAKING",
    "7.0.0",
    "4.0.0",
    "0.2.0",
    "Node.js 22+",
    "uv 0.11.21+",
    "Python 3.12",
    "connector 0.8.7",
    "6-tool",
    "Gate A/B",
    "learn-kit-nlm-bridge",
    "nlm login",
  ]) {
    assert.ok(section.includes(anchor), `root CHANGELOG current section must mention "${anchor}"`);
  }
});

test("learn-kit CHANGELOG current section marks the 4.0.0 NLM break", () => {
  const section = firstChangelogSection(read("plugins/learn-kit/CHANGELOG.md"));
  assert.ok(section.trim().length > 100, "hollow section");
  for (const anchor of ["4.0.0", "BREAKING", "learn-kit-nlm-bridge", "Node.js 22+", "6-tool", "Gate A/B"]) {
    assert.ok(section.includes(anchor), `learn-kit CHANGELOG must mention "${anchor}"`);
  }
});

test("diagram-kit CHANGELOG current section marks the 0.2.0 bump", () => {
  const section = firstChangelogSection(read("plugins/diagram-kit/CHANGELOG.md"));
  assert.ok(section.includes("0.2.0"), "diagram-kit CHANGELOG must mention 0.2.0");
  assert.match(section, /Codex|dual-host|host-neutral/, "must note the Codex / host-neutral change");
});

// ------------------------------------------------------------------ root README

test("root README has both host install sections + 5 Codex onboarding commands", () => {
  const rd = read("README.md");
  assert.match(rd, /^###\s+Claude Code\s*$/m, "must have a Claude Code install section");
  assert.match(rd, /^###\s+Codex\s*$/m, "must have a Codex install section");
  // The Codex fence must carry the five onboarding commands.
  const codexFence = fences(rd).find((f) => f.code.includes("codex plugin marketplace add"));
  assert.ok(codexFence, "root README must have a Codex onboarding fence");
  const codexCmds = codexFence.lines.filter((l) => /^\s*codex\s/.test(l));
  assert.ok(codexCmds.length >= 5, `expected >=5 codex commands, got ${codexCmds.length}`);
  for (const c of [
    "codex plugin marketplace add",
    "codex plugin add learn-kit --marketplace",
    "codex plugin add diagram-kit --marketplace",
    "codex plugin list",
    "codex debug prompt-input",
  ]) {
    assert.ok(codexFence.code.includes(c), `Codex onboarding must include "${c}"`);
  }
});

test("root README shows all four qualified Codex invocations", () => {
  const rd = read("README.md");
  for (const q of ["$learn-kit:three-views", "$learn-kit:glossary", "$learn-kit:concept", "$diagram-kit:arch-diagram"]) {
    assert.ok(rd.includes(q), `root README must show qualified "${q}"`);
  }
});

// ------------------------------------------------------------------ plugin READMEs

test("plugin READMEs keep their own add command", () => {
  const lk = read("plugins/learn-kit/README.md");
  const dk = read("plugins/diagram-kit/README.md");
  assert.ok(inAnyFence(lk, "/plugin install learn-kit@mj-agentlab-marketplace"), "learn-kit README add cmd");
  assert.ok(inAnyFence(lk, "codex plugin add learn-kit --marketplace"), "learn-kit README Codex add cmd");
  assert.ok(inAnyFence(dk, "/plugin install diagram-kit@mj-agentlab-marketplace"), "diagram-kit README add cmd");
  assert.ok(inAnyFence(dk, "codex plugin add diagram-kit --marketplace"), "diagram-kit README Codex add cmd");
});

test("learn-kit README installer fence is the bridge installer, not the direct connector", () => {
  const lk = read("plugins/learn-kit/README.md");
  const installer = fences(lk).find((f) => f.code.includes("install-nlm-bridge.mjs"));
  assert.ok(installer, "learn-kit README must show the bridge installer template");
  assert.ok(installer.code.includes("--wheel-url"), "installer must pass --wheel-url");
  assert.ok(installer.code.includes("--checksum-url"), "installer must pass --checksum-url");
  // Forbidden in the installer command itself.
  for (const bad of ["uv tool install", "--force", "--with-executables-from", "uvx ", "@latest", "'"]) {
    assert.ok(!installer.code.includes(bad), `installer fence must not contain ${JSON.stringify(bad)}`);
  }
});

test("no install fence anywhere uses the forbidden direct-connector / auto-latest forms", () => {
  for (const rel of ["README.md", "plugins/learn-kit/README.md", "plugins/diagram-kit/README.md"]) {
    const text = read(rel);
    for (const f of fences(text)) {
      for (const bad of ["uv tool install", "--force", "--with-executables-from", "@latest"]) {
        assert.ok(!f.code.includes(bad), `${rel} fence must not contain ${JSON.stringify(bad)}`);
      }
      // A bare `$three-views` USAGE line (not the prose "裸 $three-views 不解析") is forbidden.
      for (const l of f.lines) {
        assert.ok(!/^\s*\$(three-views|glossary|concept|arch-diagram)\b/.test(l), `${rel}: bare $skill usage in a fence: ${l}`);
      }
    }
  }
});

test("learn-kit README carries every required NLM disclosure clause", () => {
  const lk = read("plugins/learn-kit/README.md");
  for (const [label, re] of [
    ["personal-only", /个人版/],
    ["no-account-binding", /不(?:枚举|绑定)/],
    ["no-headless-guard", /headless/],
    ["mind-map limitation", /mind_map|mind-map/],
    ["direct-TLS", /direct-TLS|https:\/\/notebooklm\.google\.com/],
    ["verified OS", /Windows.*Ubuntu|Ubuntu.*Windows/],
    ["Gate is not a trusted boundary", /不是可信授权边界|behavioral/],
    ["optional local flow unaffected", /不受影响|optional/],
    ["restart host", /重启宿主|restart/],
    ["fixed public bin / PATH", /public bin|LOCALAPPDATA|XDG_BIN_HOME/],
  ]) {
    assert.match(lk, re, `learn-kit README must disclose: ${label}`);
  }
  // Enterprise may only appear as "not supported".
  if (/Enterprise/.test(lk)) assert.match(lk, /Enterprise[^\n]*不支持|不支持[^\n]*Enterprise/, "Enterprise must be marked unsupported");
});

// ------------------------------------------------------------------ html-renderer static security contract

test("html-renderer is a fixed safe-subset renderer with a strict CSP", () => {
  const hr = read("plugins/learn-kit/skills/three-views/templates/html-renderer.md");
  assert.ok(hr.includes("Content-Security-Policy"), "renderer must ship a CSP");
  assert.ok(hr.includes("default-src 'none'"), "CSP must default-src 'none'");
  for (const bad of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write"]) {
    assert.ok(!hr.includes(bad), `renderer must not use ${bad}`);
  }
  assert.ok(hr.includes("textContent"), "renderer must build DOM via textContent");
  assert.ok(hr.includes("u003c"), "renderer must escape < as its JSON unicode escape in the data island");
  assert.match(hr, /protocol\s*===\s*"https?:"|http\(s\)|noopener/, "links must be restricted to validated http(s)");
});

test("malicious-runtime-source fixture exists and carries the injection vectors", () => {
  const fx = read("tests/fixtures/malicious-runtime-source.md");
  for (const vec of ["</script><script>", "onerror", "srcdoc", "javascript:", "IGNORE ALL PREVIOUS INSTRUCTIONS", "id_rsa"]) {
    assert.ok(fx.includes(vec), `fixture must include the "${vec}" vector`);
  }
});
