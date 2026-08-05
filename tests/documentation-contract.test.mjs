// tests/documentation-contract.test.mjs (plan §4 Task 5 / §6)
//
// Locks the release-doc surface with a heading/code-fence parser rather than substring matching.
// Four rules of thumb:
//   - a disclosure set is locked to whichever SINGLE `## [...]` section carries all of it —
//     deliberately including HISTORICAL sections, because these disclosures belong to the release
//     that introduced them and must survive every later release landing on top. Anchoring to the
//     newest section instead makes the lock lapse the moment anything is released after it. What
//     stops a false pass is co-occurrence: every anchor must appear in ONE section, so phrases
//     scattered across unrelated entries cannot add up to a pass.
//   - structure is enforced separately: every heading must parse, and a line that merely LOOKS
//     like a section heading is reported. See HEADING_LOOKALIKE for why an ignored heading is the
//     dangerous case rather than a merely malformed one.
//   - substance is checked on the newest section that ships content; an empty `## [Unreleased]`
//     may sit above it ([RUNBOOK]_Release_Operations §3.3 prescribes exactly that after a cut).
//   - forbidden install tokens are checked inside CODE FENCES only — the READMEs legitimately
//     mention `uv tool install` / `--force` / bare `$three-views` in *negation* prose ("do NOT use
//     …"), which must stay allowed.
//
// Deliberately NOT coupled to `VERSION`: this repo pre-bumps `develop` one patch ahead of the
// released CHANGELOG (see [ADR]_Develop_PreBump_Adoption), so `VERSION` and the newest CHANGELOG
// section legitimately disagree on `develop` and agree only on `main`. Asserting they match would
// fail on `develop` in the normal steady state.

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

const CHANGELOGS = ["CHANGELOG.md", "plugins/learn-kit/CHANGELOG.md", "plugins/diagram-kit/CHANGELOG.md"];

const FENCE_LINE = /^ {0,3}(?:```|~~~)/;
/** A real section heading — the exact form `run-release.mjs` greps for. */
const SECTION_HEADING = /^## \[([^\]]+)\]/;
/**
 * A line TRYING to be a section heading: any ATX heading whose text opens with an optional `[`
 * then `Unreleased` or a semver. `SECTION_HEADING` silently ignores near-misses (`##  [x]` with
 * two spaces, `  ## [x]` indented, `### [x]`, unbracketed `## x`) — all of which render as
 * ordinary headings, so the defect is invisible on GitHub. An ignored heading is worse than a
 * malformed one: its release merges into the section ABOVE it, which both hides a hollow entry
 * and lets anchors scattered across two releases look co-occurring, while `run-release.mjs` —
 * whose lookup is likewise `^## [X.Y.Z]` — misses it and fails the release closed.
 */
const HEADING_LOOKALIKE = /^ {0,3}#{1,6}[ \t]*\[?\s*(?:Unreleased|v?\d+\.\d+\.\d+)/i;
const RELEASED_HEADING = /^## \[\d+\.\d+\.\d+\] - \d{4}-\d{2}-\d{2}$/;
const isReleaseLabel = (label) => /^\d+\.\d+\.\d+$/.test(label);

/**
 * Parse a CHANGELOG into `{ sections, malformed }`. `sections` is newest-first, each with `body`
 * EXCLUDING its heading line so an anchor can never be satisfied by the version number in the
 * heading itself. `malformed` collects heading lookalikes that did not parse as sections.
 *
 * Fence-aware: a `## [` line inside a code fence is content, not a section boundary — a release
 * note that shows a CHANGELOG snippet must not split the entry containing it.
 */
function parseChangelog(text) {
  const sections = [];
  const malformed = [];
  let cur = null;
  let inFence = false;
  text.split(/\r?\n/).forEach((line, i) => {
    if (FENCE_LINE.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      const m = SECTION_HEADING.exec(line);
      if (m) {
        cur = { label: m[1], heading: line, line: i + 1, body: [] };
        sections.push(cur);
        return;
      }
      if (HEADING_LOOKALIKE.test(line)) malformed.push({ line: i + 1, text: line });
    }
    if (cur) cur.body.push(line);
  });
  return { sections: sections.map((s) => ({ ...s, body: s.body.join("\n") })), malformed };
}

/**
 * The single section whose body carries EVERY anchor (string or RegExp), or null. Only
 * `[Unreleased]` / `[X.Y.Z]` sections are searched, so a stray `## [notes]` block cannot be
 * appended to host a disclosure set. Because all anchors must co-occur in ONE section, phrases
 * scattered across unrelated entries cannot fake a pass — while the lock still survives any
 * number of newer sections landing above it.
 */
function sectionCarryingAll(text, anchors) {
  return (
    parseChangelog(text)
      .sections.filter((s) => s.label === "Unreleased" || isReleaseLabel(s.label))
      .find((s) => anchors.every((a) => (a instanceof RegExp ? a.test(s.body) : s.body.includes(a)))) ?? null
  );
}

/** True if any fenced block contains `needle`. */
const inAnyFence = (text, needle) => fences(text).some((f) => f.code.includes(needle));

// ------------------------------------------------------------------ CHANGELOGs

// Parser self-tests. Every CHANGELOG check below is only as strong as this parser, and its failure
// mode is SILENCE — an unrecognised heading merges into the section above rather than erroring — so
// it is exercised directly against synthetic input, not only against the real files.
test("parseChangelog: section boundaries, heading-free bodies, fence blindness fixed", () => {
  const { sections, malformed } = parseChangelog(
    [
      "# Changelog",
      "",
      "## [Unreleased]",
      "",
      "## [1.2.0] - 2026-01-02",
      "",
      "- real 1.2.0 content",
      "",
      "```markdown",
      "## [9.9.9] - 2020-01-01",
      "```",
      "",
      "- still 1.2.0",
      "",
      "## [1.1.0] - 2026-01-01",
      "",
      "- older",
    ].join("\n"),
  );
  assert.deepEqual(malformed, [], "well-formed input must report no lookalikes");
  assert.deepEqual(
    sections.map((s) => s.label),
    ["Unreleased", "1.2.0", "1.1.0"],
    "a fenced heading must not open a section",
  );
  assert.equal(sections[0].body.trim(), "", "an empty [Unreleased] must have an empty body");
  assert.ok(sections[1].body.includes("still 1.2.0"), "a fenced heading must not close the section either");
  assert.ok(!sections[1].body.includes("## [1.2.0]"), "a body must exclude its own heading line");
  assert.ok(sections[1].body.includes("## [9.9.9]"), "fenced text stays in the body as content");
});

test("parseChangelog: flags heading lookalikes, leaves ordinary prose alone", () => {
  for (const bad of [
    "##  [1.2.0] - 2026-01-02", // two spaces
    "  ## [1.2.0] - 2026-01-02", // indented
    "### [1.2.0] - 2026-01-02", // wrong level
    "## 1.2.0 - 2026-01-02", // unbracketed
    "### Unreleased",
  ]) {
    const { sections, malformed } = parseChangelog(`## [1.0.0] - 2026-01-01\n\n- x\n\n${bad}\n\n- y\n`);
    assert.equal(malformed.length, 1, `must flag lookalike: ${JSON.stringify(bad)}`);
    assert.equal(malformed[0].text, bad);
    assert.equal(sections.length, 1, `lookalike must not open a section: ${JSON.stringify(bad)}`);
  }
  for (const fine of ["### Added", "### Fixed", "# Changelog", "- 1.2.0 shipped on Tuesday", "## Notes"]) {
    const { malformed } = parseChangelog(`## [1.0.0] - 2026-01-01\n\n${fine}\n\n- y\n`);
    assert.deepEqual(malformed, [], `must not flag ordinary line: ${JSON.stringify(fine)}`);
  }
});

// A heading that only LOOKS like a section heading is the failure this parser exists to surface:
// it renders identically on GitHub, so nothing but a byte-level check catches it.
test("no CHANGELOG has a heading that only looks like a section heading", () => {
  for (const rel of CHANGELOGS) {
    const { malformed } = parseChangelog(read(rel));
    assert.deepEqual(
      malformed,
      [],
      `${rel}: heading(s) that neither parse as "## [label]" nor read as prose — ` +
        `run-release.mjs would miss them too: ${JSON.stringify(malformed)}`,
    );
  }
});

test("every CHANGELOG section heading has the exact shape run-release.mjs greps for", () => {
  for (const rel of CHANGELOGS) {
    for (const s of parseChangelog(read(rel)).sections) {
      if (s.label === "Unreleased") {
        assert.equal(s.heading.trim(), "## [Unreleased]", `${rel}:${s.line}: malformed Unreleased heading`);
      } else {
        assert.ok(isReleaseLabel(s.label), `${rel}:${s.line}: label must be [Unreleased] or [X.Y.Z], got "${s.label}"`);
        assert.match(
          s.heading,
          RELEASED_HEADING,
          `${rel}:${s.line}: released heading must be "## [X.Y.Z] - YYYY-MM-DD", got "${s.heading}"`,
        );
      }
    }
  }
});

// Substance is checked on the newest section that actually SHIPS content. An empty `## [Unreleased]`
// may legitimately sit on top — [RUNBOOK]_Release_Operations §3.3 prescribes exactly that shape
// after a release cut — so anchoring this to the literally-newest section would reject the repo's
// own documented transform.
test("the newest shipping CHANGELOG section is substantive and names its own version", () => {
  for (const [rel, minBody] of [
    ["CHANGELOG.md", 200],
    ["plugins/learn-kit/CHANGELOG.md", 100],
    ["plugins/diagram-kit/CHANGELOG.md", 100],
  ]) {
    const { sections } = parseChangelog(read(rel));
    assert.ok(sections.length, `${rel}: changelog has no version section`);
    const s = sections.find((x) => !(x.label === "Unreleased" && x.body.trim() === ""));
    assert.ok(s, `${rel}: every section is an empty [Unreleased] staging block`);
    assert.ok(s.body.trim().length > minBody, `${rel}: [${s.label}] must not be a hollow heading`);
    if (isReleaseLabel(s.label)) {
      assert.ok(s.body.includes(s.label), `${rel}: [${s.label}] body must name its own version`);
    }
  }
});

// Permanent disclosure locks. These stay pinned to whichever section carries them (today the
// v7.0.0 / learn-kit 4.0.0 entries) no matter how many releases land on top.
test("root CHANGELOG permanently carries the NLM-only BREAKING disclosures in one section", () => {
  const section = sectionCarryingAll(read("CHANGELOG.md"), [
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
  ]);
  assert.ok(section, "no single root CHANGELOG section carries the full NLM-only BREAKING disclosure set");
});

test("learn-kit CHANGELOG permanently marks the 4.0.0 NLM break in one section", () => {
  const section = sectionCarryingAll(read("plugins/learn-kit/CHANGELOG.md"), [
    "4.0.0",
    "BREAKING",
    "learn-kit-nlm-bridge",
    "Node.js 22+",
    "6-tool",
    "Gate A/B",
  ]);
  assert.ok(section, "no single learn-kit CHANGELOG section marks the 4.0.0 NLM break");
});

test("diagram-kit CHANGELOG permanently marks the 0.2.0 Codex bump in one section", () => {
  const section = sectionCarryingAll(read("plugins/diagram-kit/CHANGELOG.md"), [
    "0.2.0",
    /Codex|dual-host|host-neutral/,
  ]);
  assert.ok(section, "no single diagram-kit CHANGELOG section marks the 0.2.0 Codex / host-neutral change");
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
  // Lock the specific hardened directives, not just the default-src fallback, so widening
  // connect-src / object-src / etc. would be caught.
  for (const directive of [
    "default-src 'none'",
    "connect-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ]) {
    assert.ok(hr.includes(directive), `CSP must keep ${directive}`);
  }
  for (const bad of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write"]) {
    assert.ok(!hr.includes(bad), `renderer must not use ${bad}`);
  }
  assert.ok(hr.includes("textContent"), "renderer must build DOM via textContent");
  assert.ok(hr.includes("u003c"), "renderer must escape < as its JSON unicode escape in the data island");
  // safeUrl must gate on the http/https protocol allowlist itself — not merely mention "noopener".
  assert.match(hr, /protocol\s*===\s*"http:"/, "safeUrl must gate on the http: protocol");
  assert.match(hr, /protocol\s*===\s*"https:"/, "safeUrl must gate on the https: protocol");
  assert.ok(hr.includes("noopener"), "external links must set rel=noopener");
});

test("malicious-runtime-source fixture exists and carries the injection vectors", () => {
  const fx = read("tests/fixtures/malicious-runtime-source.md");
  for (const vec of ["</script><script>", "onerror", "srcdoc", "javascript:", "IGNORE ALL PREVIOUS INSTRUCTIONS", "id_rsa"]) {
    assert.ok(fx.includes(vec), `fixture must include the "${vec}" vector`);
  }
});
