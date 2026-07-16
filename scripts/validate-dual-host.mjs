#!/usr/bin/env node
// Dual-host structural validator (plan §2.4).
//
// Asserts that the Claude Code SSOT (.claude-plugin/**) and the Codex native wrapper
// (.agents/plugins/marketplace.json + plugins/*/.codex-plugin/plugin.json +
// plugins/*/skills/*/agents/openai.yaml) stay mutually consistent, and that shared runtime
// (SKILL.md body / templates / references) does not hard-code a single host.
//
//   node scripts/validate-dual-host.mjs --root . --host-neutral warn
//   node scripts/validate-dual-host.mjs --root . --host-neutral error
//
// exit 2 = bad arguments; exit 1 = structural or blocking rule failure; exit 0 = clean.

import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const LEGACY_CATALOG = ".claude-plugin/marketplace.json";
const NATIVE_CATALOG = ".agents/plugins/marketplace.json";

// Shared between both manifests these must be character-identical. `description` is
// deliberately excluded: the native one is intentionally short and host-neutral (§2.2).
const SHARED_MANIFEST_FIELDS = ["name", "version", "author", "repository", "license", "skills"];

// The exact 6 business tools three-views may pre-authorize. `refresh_auth` (probes the default
// profile / can trigger headless auth), `server_info` (remote probe) and `source_delete`
// (unneeded destructive surface) are intentionally absent — see plan §2.3.1.
const MCP_PREFIX = "mcp__plugin_learn-kit_notebooklm-mcp__";
const ALLOWED_MCP_TOOLS = [
  "notebook_list",
  "notebook_get",
  "notebook_create",
  "source_add",
  "studio_create",
  "studio_status",
].map((t) => MCP_PREFIX + t);
const FORBIDDEN_MCP_TOOLS = ["refresh_auth", "server_info", "source_delete"].map(
  (t) => MCP_PREFIX + t,
);

const SCOPED_HELPER_PERMISSION =
  'Bash(node "${CLAUDE_SKILL_DIR}/scripts/hash-upload-corpus.mjs" *)';

const MCP_COMMAND = "learn-kit-nlm-bridge";
const CATALOG_CATEGORIES = new Set(["Education & Research", "Developer Tools"]);

// §2.1 / §2.2 fix one category per plugin. Pin them: a mere membership test would let the two
// plugins swap categories and still validate clean.
const EXPECTED_CATEGORY = {
  "learn-kit": "Education & Research",
  "diagram-kit": "Developer Tools",
};

// The skill that owns the NotebookLM branch. Used ONLY for the positive half of the capability
// contract (see checkSkillCapabilities); the negative half is keyed on content, not on this.
const NLM_SKILL = { plugin: "learn-kit", skill: "three-views" };

// Claude Code truncates injected descriptions at 1536; Codex's bundled skill validator rejects
// angle brackets and caps at 1024. The repo authors to the stricter intersection.
const CLAUDE_DESC_MAX = 1536;
const CODEX_DESC_MIN = 1;
const CODEX_DESC_MAX = 1024;

const DEFAULT_PROMPT_MAX_ITEMS = 3;
const DEFAULT_PROMPT_MAX_LEN = 128;

const HOST_COUPLING_PATTERNS = [
  { needle: "${CLAUDE_PLUGIN_ROOT}", code: "HOST_COUPLED_PLUGIN_ROOT" },
  { needle: "mcp__plugin_", code: "HOST_COUPLED_MCP_PREFIX" },
];

const finding = (code, p, message) => ({ code, path: p, message });

// A whitespace-only value is not a value: a blank displayName would ship an unnamed card to the
// Codex UI, which is exactly what these presence checks exist to prevent.
const isBlank = (v) => typeof v !== "string" || v.trim().length === 0;

function readJson(abs, rel, errors) {
  try {
    return JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch (e) {
    errors.push(finding("JSON_UNPARSEABLE", rel, `cannot parse JSON: ${e.message}`));
    return null;
  }
}

function readYamlFile(abs, rel, errors) {
  try {
    return parseYaml(fs.readFileSync(abs, "utf8"));
  } catch (e) {
    errors.push(finding("YAML_UNPARSEABLE", rel, `cannot parse YAML: ${e.message}`));
    return null;
  }
}

/** Split SKILL.md into { frontmatter (raw), body }. Body excludes frontmatter entirely. */
function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { raw: null, body: text };
  return { raw: m[1], body: text.slice(m[0].length) };
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const toPosix = (p) => p.split(path.sep).join("/");

/**
 * @param {string} root repo root
 * @param {{hostNeutral?: "warn"|"error"}} opts
 * @returns {{errors: Array<{code,path,message}>, warnings: Array<{code,path,message}>}}
 */
export function validateTree(root, { hostNeutral = "warn" } = {}) {
  if (hostNeutral !== "warn" && hostNeutral !== "error") {
    throw new TypeError(`validateTree: hostNeutral must be "warn" or "error"`);
  }
  const errors = [];
  const warnings = [];
  const hostBucket = hostNeutral === "error" ? errors : warnings;
  const abs = (rel) => path.join(root, rel);
  const exists = (rel) => fs.existsSync(abs(rel));

  // ---------------------------------------------------------------- catalogs
  if (!exists(LEGACY_CATALOG)) {
    errors.push(finding("CATALOG_MISSING", LEGACY_CATALOG, "legacy catalog not found"));
    return { errors, warnings };
  }
  if (!exists(NATIVE_CATALOG)) {
    errors.push(finding("CATALOG_MISSING", NATIVE_CATALOG, "native Codex catalog not found"));
    return { errors, warnings };
  }
  const legacy = readJson(abs(LEGACY_CATALOG), LEGACY_CATALOG, errors);
  const native = readJson(abs(NATIVE_CATALOG), NATIVE_CATALOG, errors);
  if (!legacy || !native) return { errors, warnings };

  const legacyPlugins = Array.isArray(legacy.plugins) ? legacy.plugins : [];
  const nativePlugins = Array.isArray(native.plugins) ? native.plugins : [];

  if (native.name !== legacy.name) {
    errors.push(
      finding(
        "CATALOG_NAME_DRIFT",
        NATIVE_CATALOG,
        `native name "${native.name}" != legacy name "${legacy.name}"`,
      ),
    );
  }

  // The native catalog intentionally carries no version (§2.1): versions live in the manifests.
  if ("version" in native || native.metadata?.version !== undefined) {
    errors.push(
      finding("CATALOG_NATIVE_HAS_VERSION", NATIVE_CATALOG, "native catalog must not carry a version"),
    );
  }

  const legacyNames = legacyPlugins.map((p) => p?.name);
  const nativeNames = nativePlugins.map((p) => p?.name);
  // Compare via JSON rather than a joined string: no separator can collide with a plugin name.
  if (JSON.stringify(legacyNames) !== JSON.stringify(nativeNames)) {
    errors.push(
      finding(
        "CATALOG_SET_DRIFT",
        NATIVE_CATALOG,
        `plugin set/order drift: native [${nativeNames}] != legacy [${legacyNames}]`,
      ),
    );
  }

  // §2.1: the native catalog must mirror the legacy catalog's local source, not just its names.
  for (const np of nativePlugins) {
    const lp = legacyPlugins.find((p) => p?.name === np?.name);
    if (!lp) continue;
    // Legacy uses a bare string source; native uses { source: "local", path }.
    const legacySource = typeof lp.source === "string" ? lp.source : lp.source?.path;
    const nativeSource = np?.source?.path;
    if (legacySource !== undefined && nativeSource !== undefined && legacySource !== nativeSource) {
      errors.push(
        finding(
          "CATALOG_SOURCE_DRIFT",
          `${NATIVE_CATALOG}#${np.name}`,
          `native source.path "${nativeSource}" != legacy source "${legacySource}"`,
        ),
      );
    }
  }

  for (const p of nativePlugins) {
    const rel = `${NATIVE_CATALOG}#${p?.name}`;
    // "native catalog 不保存版本" applies per-entry too, not just at the top level: a stale
    // per-plugin version here is exactly the drift a PR2 bump would introduce.
    if (p && "version" in p) {
      errors.push(finding("CATALOG_NATIVE_HAS_VERSION", rel, "native catalog entries must not carry a version"));
    }
    if (isBlank(p?.category)) {
      errors.push(finding("CATALOG_CATEGORY_INVALID", rel, "category must be a non-empty string"));
    } else if (!CATALOG_CATEGORIES.has(p.category)) {
      errors.push(
        finding(
          "CATALOG_CATEGORY_UNEXPECTED",
          rel,
          `category "${p.category}" is not one of ${[...CATALOG_CATEGORIES].join(" | ")}`,
        ),
      );
    } else if (EXPECTED_CATEGORY[p.name] && p.category !== EXPECTED_CATEGORY[p.name]) {
      errors.push(
        finding("CATALOG_CATEGORY_UNEXPECTED", rel, `category "${p.category}" != the fixed category for ${p.name} ("${EXPECTED_CATEGORY[p.name]}")`),
      );
    }
    if (p?.source?.source !== "local" || typeof p?.source?.path !== "string") {
      errors.push(finding("CATALOG_SOURCE_INVALID", rel, "source must be { source: local, path }"));
    } else {
      const expected = `./plugins/${p.name}`;
      if (p.source.path !== expected) {
        errors.push(
          finding("CATALOG_SOURCE_PATH", rel, `source.path "${p.source.path}" != "${expected}"`),
        );
      }
      if (!exists(path.join("plugins", p.name))) {
        errors.push(finding("CATALOG_SOURCE_MISSING", rel, `plugins/${p.name} does not exist`));
      }
    }
    const inst = p?.policy?.installation;
    const auth = p?.policy?.authentication;
    if (inst !== "AVAILABLE") {
      errors.push(finding("CATALOG_POLICY_INSTALL", rel, `policy.installation "${inst}" != AVAILABLE`));
    }
    if (!["ON_USE", "ON_INSTALL"].includes(auth)) {
      errors.push(
        finding("CATALOG_POLICY_AUTH", rel, `policy.authentication "${auth}" not ON_USE|ON_INSTALL`),
      );
    }
    // learn-kit authenticates only for the opt-in NLM branch → must not imply login at install.
    if (p?.name === "learn-kit" && auth !== "ON_USE") {
      errors.push(
        finding(
          "CATALOG_POLICY_AUTH",
          rel,
          "learn-kit must be ON_USE: auth serves only the opt-in NLM branch",
        ),
      );
    }
  }

  // ------------------------------------------------- per-plugin dual manifests
  for (const name of legacyNames.filter(Boolean)) {
    const legacyRel = `plugins/${name}/.claude-plugin/plugin.json`;
    const nativeRel = `plugins/${name}/.codex-plugin/plugin.json`;
    if (!exists(legacyRel)) {
      errors.push(finding("MANIFEST_MISSING", legacyRel, "legacy plugin manifest not found"));
      continue;
    }
    if (!exists(nativeRel)) {
      errors.push(finding("MANIFEST_MISSING", nativeRel, "native Codex plugin manifest not found"));
      continue;
    }
    const lm = readJson(abs(legacyRel), legacyRel, errors);
    const nm = readJson(abs(nativeRel), nativeRel, errors);
    if (!lm || !nm) continue;

    for (const f of SHARED_MANIFEST_FIELDS) {
      // Presence first: equality alone would accept a field deleted from BOTH manifests
      // (undefined === undefined), which §2.2 fixes as required.
      if (lm[f] === undefined) {
        errors.push(finding("MANIFEST_FIELD_MISSING", legacyRel, `required field "${f}" is missing`));
      }
      if (nm[f] === undefined) {
        errors.push(finding("MANIFEST_FIELD_MISSING", nativeRel, `required field "${f}" is missing`));
      }
      const a = JSON.stringify(lm[f]);
      const b = JSON.stringify(nm[f]);
      if (a !== b) {
        errors.push(
          finding("MANIFEST_FIELD_DRIFT", nativeRel, `${f}: native ${b} != legacy ${a}`),
        );
      }
    }

    // Catalog version must track the legacy manifest version (existing repo invariant).
    const catEntry = legacyPlugins.find((p) => p?.name === name);
    if (catEntry && catEntry.version !== lm.version) {
      errors.push(
        finding(
          "VERSION_TRIANGLE_DRIFT",
          LEGACY_CATALOG,
          `plugins[${name}].version ${catEntry.version} != plugin.json ${lm.version}`,
        ),
      );
    }

    // native keywords must be a NON-EMPTY SUBSET of legacy keywords.
    const lk = Array.isArray(lm.keywords) ? lm.keywords : [];
    const nk = Array.isArray(nm.keywords) ? nm.keywords : [];
    if (nk.length === 0) {
      errors.push(finding("MANIFEST_KEYWORDS_EMPTY", nativeRel, "native keywords must be non-empty"));
    }
    const notSubset = nk.filter((k) => !lk.includes(k));
    if (notSubset.length) {
      errors.push(
        finding(
          "MANIFEST_KEYWORDS_NOT_SUBSET",
          nativeRel,
          `keywords not present in legacy manifest: ${notSubset.join(", ")}`,
        ),
      );
    }

    if (isBlank(nm.description)) {
      errors.push(finding("MANIFEST_DESC_EMPTY", nativeRel, "native description must be non-empty"));
    }

    // interface block
    const iface = nm.interface;
    if (!iface || typeof iface !== "object") {
      errors.push(finding("MANIFEST_INTERFACE_MISSING", nativeRel, "interface block required"));
    } else {
      for (const f of ["displayName", "shortDescription", "longDescription", "developerName", "category"]) {
        if (isBlank(iface[f])) {
          errors.push(
            finding("MANIFEST_INTERFACE_FIELD", nativeRel, `interface.${f} must be a non-empty string`),
          );
        }
      }
      if (iface.category && !CATALOG_CATEGORIES.has(iface.category)) {
        errors.push(
          finding("MANIFEST_INTERFACE_CATEGORY", nativeRel, `interface.category "${iface.category}" unexpected`),
        );
      }
      const catalogCategory = nativePlugins.find((p) => p?.name === name)?.category;
      if (catalogCategory && iface.category !== catalogCategory) {
        errors.push(
          finding(
            "MANIFEST_CATEGORY_DRIFT",
            nativeRel,
            `interface.category "${iface.category}" != catalog category "${catalogCategory}"`,
          ),
        );
      }
      // defaultPrompt: canonical form is a string[] of at most 3 × 128 chars (§1 fact 6).
      const dp = iface.defaultPrompt;
      if (!Array.isArray(dp) || dp.length === 0) {
        errors.push(finding("MANIFEST_DEFAULT_PROMPT", nativeRel, "interface.defaultPrompt must be a non-empty array"));
      } else {
        if (dp.length > DEFAULT_PROMPT_MAX_ITEMS) {
          errors.push(
            finding("MANIFEST_DEFAULT_PROMPT", nativeRel, `defaultPrompt has ${dp.length} > ${DEFAULT_PROMPT_MAX_ITEMS} entries`),
          );
        }
        for (const entry of dp) {
          if (typeof entry !== "string") {
            errors.push(finding("MANIFEST_DEFAULT_PROMPT", nativeRel, "defaultPrompt entries must be strings"));
            continue;
          }
          if ([...entry].length > DEFAULT_PROMPT_MAX_LEN) {
            errors.push(
              finding("MANIFEST_DEFAULT_PROMPT", nativeRel, `defaultPrompt entry exceeds ${DEFAULT_PROMPT_MAX_LEN} chars: "${entry.slice(0, 40)}…"`),
            );
          }
          // Codex registers plugin skills as `plugin:skill`; `$` injection matches the FULL
          // qualified name, so a bare `$skill` silently never resolves (§1 fact 8).
          const refs = [...entry.matchAll(/\$([A-Za-z0-9_-]+)(:([A-Za-z0-9_-]+))?/g)];
          for (const r of refs) {
            if (!r[3]) {
              errors.push(
                finding("PROMPT_UNQUALIFIED_SKILL", nativeRel, `bare "$${r[1]}" must be qualified as "$plugin:skill"`),
              );
            } else if (r[1] !== name) {
              errors.push(
                finding("PROMPT_FOREIGN_PLUGIN", nativeRel, `"$${r[1]}:${r[3]}" does not belong to plugin "${name}"`),
              );
            } else if (!exists(path.join("plugins", name, "skills", r[3], "SKILL.md"))) {
              // A directory alone is not a skill — both hosts register a skill only when it has
              // a SKILL.md, so check for that rather than for the folder.
              errors.push(
                finding("PROMPT_UNKNOWN_SKILL", nativeRel, `"$${r[1]}:${r[3]}" has no matching skills/<name>/SKILL.md`),
              );
            }
          }
        }
      }
    }

    // Both manifests may only POINT at ./.mcp.json — never inline a server object. Claude Code
    // accepts an inline `mcpServers` object in plugin.json, which would route straight around
    // the .mcp.json exact-shape / no-runner / bridge-command gates below (e.g. an inline
    // `npx -y notebooklm-mcp-cli@latest` would start the third-party connector directly).
    for (const [mrel, m] of [
      [legacyRel, lm],
      [nativeRel, nm],
    ]) {
      if (m.mcpServers !== undefined && typeof m.mcpServers !== "string") {
        errors.push(
          finding(
            "MANIFEST_INLINE_MCP",
            mrel,
            "mcpServers must be a pointer to ./.mcp.json, never an inline server object",
          ),
        );
      }
    }
    if (typeof lm.mcpServers === "string" && lm.mcpServers !== "./.mcp.json") {
      errors.push(finding("MANIFEST_MCP_POINTER", legacyRel, `mcpServers must be "./.mcp.json" (got ${JSON.stringify(lm.mcpServers)})`));
    }

    // mcpServers is declared iff the plugin ships a .mcp.json (§2.2 / §2.3.1).
    const mcpRel = `plugins/${name}/.mcp.json`;
    const hasMcpFile = exists(mcpRel);
    if (hasMcpFile && nm.mcpServers !== "./.mcp.json") {
      errors.push(
        finding("MANIFEST_MCP_POINTER", nativeRel, `plugin ships .mcp.json → mcpServers must be "./.mcp.json" (got ${JSON.stringify(nm.mcpServers)})`),
      );
    }
    if (!hasMcpFile && nm.mcpServers !== undefined) {
      errors.push(
        finding("MANIFEST_MCP_POINTER", nativeRel, "plugin ships no .mcp.json → mcpServers must be omitted"),
      );
    }

    if (hasMcpFile) {
      const mcp = readJson(abs(mcpRel), mcpRel, errors);
      if (mcp) {
        const servers = mcp.mcpServers;
        if (!servers || typeof servers !== "object") {
          errors.push(finding("MCP_WRAPPER", mcpRel, 'expected camelCase "mcpServers" wrapper object'));
        } else {
          const keys = Object.keys(servers);
          if (keys.length !== 1 || keys[0] !== "notebooklm-mcp") {
            errors.push(
              finding("MCP_SERVER_KEY", mcpRel, `expected exactly one server key "notebooklm-mcp", got [${keys}]`),
            );
          }
          const s = servers["notebooklm-mcp"];
          if (s) {
            if (s.command !== MCP_COMMAND) {
              errors.push(
                finding("MCP_COMMAND", mcpRel, `command must be "${MCP_COMMAND}" (the local bridge), got ${JSON.stringify(s.command)}`),
              );
            }
            if (!Array.isArray(s.args) || s.args.length !== 0) {
              errors.push(finding("MCP_ARGS", mcpRel, "args must be an empty array"));
            }
            // §2.3.1 fixes .mcp.json to an EXACT shape. Assert the exact key set rather than
            // denylisting known-bad names: the bridge — not a host-mergeable config — must own
            // environment policy, and a denylist cannot express "fixed content" (any unforeseen
            // key, e.g. a future `envPassthrough`, would sail straight through).
            const allowedKeys = ["command", "args"];
            for (const k of Object.keys(s)) {
              if (!allowedKeys.includes(k)) {
                errors.push(
                  finding(
                    "MCP_FORBIDDEN_FIELD",
                    mcpRel,
                    `unexpected key "${k}": the server object is fixed to {command, args}; the bridge owns environment policy`,
                  ),
                );
              }
            }
            // Never a startup-time auto-install / latest runner (§1 fact 9).
            const runner = /^(npx|uvx|pipx|pip|uv|python|python3|node)$/i;
            if (typeof s.command === "string" && runner.test(s.command)) {
              errors.push(finding("MCP_RUNNER_FORBIDDEN", mcpRel, `command "${s.command}" is a runner; only the installed bridge executable is allowed`));
            }
          }
        }
      }
    }
  }

  // ------------------------------------------------------------ skills
  for (const name of legacyNames.filter(Boolean)) {
    const skillsDir = abs(path.join("plugins", name, "skills"));
    if (!fs.existsSync(skillsDir)) continue;
    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skill = entry.name;
      const skillRel = `plugins/${name}/skills/${skill}/SKILL.md`;
      const yRel = `plugins/${name}/skills/${skill}/agents/openai.yaml`;
      const hasSkillMd = exists(skillRel);
      const hasAgents = fs.existsSync(abs(path.join("plugins", name, "skills", skill, "agents")));

      // A directory with neither SKILL.md nor agents/ is a shared-resource folder (the repo's
      // `*-shared` convention). Key off content rather than a name suffix: both hosts
      // auto-discover ANY directory containing a SKILL.md, so the suffix must not become a way
      // to skip the gates. But absence of SKILL.md must not silently disable the OTHER gates
      // either — a directory that ships agents/ is a skill whose SKILL.md has gone missing.
      if (!hasSkillMd && !hasAgents) continue;
      if (!hasSkillMd) {
        errors.push(finding("SKILL_MISSING", skillRel, "skill directory ships agents/ but has no SKILL.md"));
      }

      let fm = null;
      if (hasSkillMd) {
        const { raw } = splitFrontmatter(fs.readFileSync(abs(skillRel), "utf8"));
        if (raw === null) {
          errors.push(finding("SKILL_FRONTMATTER_MISSING", skillRel, "no --- frontmatter block"));
        } else {
          fm = parseFm(raw, skillRel, errors);
        }
      }

      if (fm) {
        if (fm.name !== skill) {
          errors.push(finding("SKILL_NAME_DRIFT", skillRel, `frontmatter name "${fm.name}" != directory "${skill}"`));
        }

        const desc = fm.description;
        if (isBlank(desc)) {
          errors.push(finding("SKILL_DESC_MISSING", skillRel, "description must be a non-empty string"));
        } else {
          const len = [...desc].length;
          if (len > CLAUDE_DESC_MAX) {
            errors.push(finding("SKILL_DESC_TOO_LONG_CLAUDE", skillRel, `description ${len} chars > ${CLAUDE_DESC_MAX} (Claude truncates)`));
          }
          if (len < CODEX_DESC_MIN || len > CODEX_DESC_MAX) {
            errors.push(finding("SKILL_DESC_TOO_LONG_CODEX", skillRel, `description ${len} chars outside Codex ${CODEX_DESC_MIN}-${CODEX_DESC_MAX}`));
          }
          if (/[<>]/.test(desc)) {
            errors.push(finding("SKILL_DESC_ANGLE_BRACKET", skillRel, "description contains < or >, rejected by Codex skill validator"));
          }
        }

        checkSkillCapabilities(fm, name, skill, skillRel, exists(`plugins/${name}/.mcp.json`), errors);
      }

      // openai.yaml — validated independently of SKILL.md. It is a DIFFERENT file, and gating it
      // on SKILL.md would let a missing SKILL.md take the whole UI-metadata contract offline.
      if (!exists(yRel)) {
        errors.push(finding("OPENAI_YAML_MISSING", yRel, "Codex skill UI metadata not found"));
      } else {
        const y = readYamlFile(abs(yRel), yRel, errors);
        if (y) {
          const iface = y.interface;
          if (!iface || typeof iface !== "object") {
            errors.push(finding("OPENAI_YAML_INTERFACE", yRel, "interface block required"));
          } else {
            for (const f of ["display_name", "short_description", "default_prompt"]) {
              if (isBlank(iface[f])) {
                errors.push(finding("OPENAI_YAML_FIELD", yRel, `interface.${f} must be a non-empty scalar string`));
              }
            }
            const dp = iface.default_prompt;
            if (typeof dp === "string") {
              const refs = [...dp.matchAll(/\$([A-Za-z0-9_-]+)(:([A-Za-z0-9_-]+))?/g)];
              if (refs.length === 0) {
                errors.push(finding("OPENAI_YAML_PROMPT_NO_REF", yRel, `default_prompt must reference the qualified name "$${name}:${skill}"`));
              }
              for (const r of refs) {
                if (!r[3]) {
                  errors.push(finding("PROMPT_UNQUALIFIED_SKILL", yRel, `bare "$${r[1]}" never resolves; Codex matches the full "$plugin:skill"`));
                } else if (r[1] !== name || r[3] !== skill) {
                  errors.push(finding("PROMPT_WRONG_SKILL", yRel, `default_prompt references "$${r[1]}:${r[3]}" but this skill is "$${name}:${skill}"`));
                }
              }
            }
          }
          if (y.policy?.allow_implicit_invocation !== true) {
            errors.push(finding("OPENAI_YAML_POLICY", yRel, "policy.allow_implicit_invocation must be true (and live under `policy`)"));
          }
          if (y.allow_implicit_invocation !== undefined) {
            errors.push(finding("OPENAI_YAML_POLICY_MISPLACED", yRel, "allow_implicit_invocation must be nested under `policy`, not top-level"));
          }
          // dependencies.tools has no `optional` semantics; NotebookLM is opt-in, so all four
          // skills must omit it and let the native plugin manifest aggregate the server (§2.3).
          // Reject the whole `dependencies` block, not just `.tools`: the plan's assertion is
          // that these files declare no dependency at all, and keying on one subkey would let
          // any sibling key through.
          if (y.dependencies !== undefined) {
            errors.push(finding("OPENAI_YAML_DEPENDENCY_TOOLS", yRel, "dependencies must be omitted entirely: it cannot express an opt-in dependency"));
          }
        }
      }
    }
  }

  // ------------------------------------------------- host-neutrality scan
  // Shared runtime = SKILL.md BODY (frontmatter stripped) + templates/** + references/**.
  // Human-facing docs (README / CLAUDE.md / CHANGELOG / ADR) and .claude/settings.json are
  // explicitly out of scope (§ Global Constraints).
  for (const name of legacyNames.filter(Boolean)) {
    const skillsDir = abs(path.join("plugins", name, "skills"));
    if (!fs.existsSync(skillsDir)) continue;
    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const base = path.join(skillsDir, entry.name);
      const targets = [];
      const skillMd = path.join(base, "SKILL.md");
      if (fs.existsSync(skillMd)) targets.push({ file: skillMd, stripFm: true });
      for (const sub of ["templates", "references"]) {
        for (const f of walk(path.join(base, sub))) targets.push({ file: f, stripFm: false });
      }
      for (const { file, stripFm } of targets) {
        let content;
        try {
          content = fs.readFileSync(file, "utf8");
        } catch {
          continue;
        }
        // Frontmatter is excluded from the scan (allowed-tools legitimately names Claude MCP
        // IDs), but reported line numbers must still address the real file, so keep the offset.
        let lineOffset = 0;
        if (stripFm) {
          const split = splitFrontmatter(content);
          if (split.raw !== null) {
            lineOffset = content.slice(0, content.length - split.body.length).split("\n").length - 1;
          }
          content = split.body;
        }
        const rel = toPosix(path.relative(root, file));
        for (const { needle, code } of HOST_COUPLING_PATTERNS) {
          let idx = content.indexOf(needle);
          while (idx !== -1) {
            const line = content.slice(0, idx).split("\n").length + lineOffset;
            hostBucket.push(
              finding(code, `${rel}:${line}`, `shared runtime references host-specific "${needle}"`),
            );
            idx = content.indexOf(needle, idx + needle.length);
          }
        }
      }
    }
  }

  return { errors, warnings };
}

function parseFm(raw, rel, errors) {
  try {
    return parseYaml(raw);
  } catch (e) {
    errors.push(finding("YAML_UNPARSEABLE", rel, `frontmatter YAML invalid: ${e.message}`));
    return null;
  }
}

/**
 * Split an allowed-tools scalar into tokens.
 *
 * A scoped permission such as Bash(node "..." *) contains spaces inside its parentheses, so we
 * split on TOP-LEVEL whitespace only (parenthesis depth 0).
 *
 * Splits on ALL whitespace, not just U+0020: a tab between tokens would otherwise fuse two
 * entries into one opaque token, so `...studio_status\tmcp__..._refresh_auth` would be counted
 * as a single unrecognised token — the MCP count check would still read "6" while a 7th tool
 * was in fact granted. Splitting on \s closes that.
 */
export function tokenizeAllowedTools(value) {
  const tokens = [];
  let depth = 0;
  let cur = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (/\s/.test(ch) && depth === 0) {
      if (cur) tokens.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

/** True when every parenthesis in an allowed-tools scalar is balanced. */
export function hasBalancedParens(value) {
  let depth = 0;
  for (const ch of value) {
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth < 0) return false;
    }
  }
  return depth === 0;
}

/**
 * Validate one skill's capability contract.
 *
 * The contract has TWO halves, and they must be keyed differently — conflating them is what
 * makes a validator pass vacuously:
 *
 *   POSITIVE ("three-views must declare exactly these 6 tools + the scoped helper") is keyed by
 *   NAME. What a skill MUST have cannot be inferred from what it happens to declare: deriving it
 *   from the declaration means deleting the declaration deletes the rule requiring it.
 *
 *   NEGATIVE ("nothing may grant refresh_auth / an unscoped shell / an unknown MCP tool") is
 *   keyed by PROPERTY, so it is rename-proof and also covers skills that do not exist yet.
 *
 * Deliberately NOT global: the plan constrains "no general Bash" to the MCP-bearing skill only.
 * arch-diagram legitimately holds bare `Bash` to run the bundled Python validator.
 */
function checkSkillCapabilities(fm, plugin, skill, rel, pluginShipsMcp, errors) {
  const at = fm["allowed-tools"];
  const isNlmSkill = pluginShipsMcp && plugin === NLM_SKILL.plugin && skill === NLM_SKILL.skill;

  // Omitting allowed-tools is the WIDEST grant, not the narrowest: the skill then inherits the
  // session's full tool set. It must never be the one case the contract skips.
  if (at === undefined) {
    if (isNlmSkill) {
      errors.push(
        finding(
          "ALLOWED_TOOLS_ABSENT",
          rel,
          "the MCP-bearing skill must declare allowed-tools; omitting it grants the full session tool set",
        ),
      );
    }
    return;
  }
  if (typeof at !== "string") {
    errors.push(finding("ALLOWED_TOOLS_NOT_SCALAR", rel, "allowed-tools must be a quoted space-separated scalar"));
    return;
  }
  // An unbalanced "(" would leave the tokenizer at depth > 0 forever, fusing every later entry
  // into one opaque token — which silently drops the mcp__ tokens and disables the whole regime.
  // Fail closed rather than tokenize something we cannot faithfully split.
  if (!hasBalancedParens(at)) {
    errors.push(finding("ALLOWED_TOOLS_UNBALANCED_PAREN", rel, "allowed-tools has unbalanced parentheses; refusing to tokenize"));
    return;
  }

  const tokens = tokenizeAllowedTools(at);
  const mcpTokens = tokens.filter((t) => t.startsWith("mcp__"));

  // --- NEGATIVE half: applies to every skill, keyed on raw content ----------
  // Substring tests on the RAW value, so they cannot be evaded by anything that perturbs
  // tokenization.
  for (const bad of FORBIDDEN_MCP_TOOLS) {
    if (at.includes(bad)) {
      errors.push(finding("ALLOWED_TOOLS_FORBIDDEN_MCP", rel, `${bad} must not be pre-authorized`));
    }
  }
  if (/install-nlm-bridge/.test(at)) {
    errors.push(finding("ALLOWED_TOOLS_INSTALLER", rel, "the installer must never be pre-authorized; users run it manually"));
  }
  const declaresMcp = /mcp__/.test(at);
  if (declaresMcp && !pluginShipsMcp) {
    errors.push(finding("ALLOWED_TOOLS_MCP_WITHOUT_SERVER", rel, "declares MCP tools but the plugin ships no .mcp.json"));
  }
  if (declaresMcp) {
    for (const t of mcpTokens) {
      if (!ALLOWED_MCP_TOOLS.includes(t)) {
        errors.push(finding("ALLOWED_TOOLS_UNKNOWN_MCP", rel, `MCP tool not on the 6-tool allowlist: ${t}`));
      }
    }
    for (const t of tokens) {
      if (t === "Bash") {
        errors.push(finding("ALLOWED_TOOLS_BARE_BASH", rel, "bare Bash must not be pre-authorized on an MCP-bearing skill"));
      } else if (t.startsWith("Bash(") && t !== SCOPED_HELPER_PERMISSION) {
        // Bash is an ALLOWLIST: `Bash(*)` is an unrestricted-shell grant strictly broader than
        // bare `Bash`, and invisible to a check keyed on the literal token.
        errors.push(finding("ALLOWED_TOOLS_UNSCOPED_BASH", rel, `Bash permission must be exactly the scoped helper; got: ${t}`));
      }
    }
  }

  if (!isNlmSkill) return;

  // --- POSITIVE half: pinned to the known NLM skill by name ----------------
  for (const want of ALLOWED_MCP_TOOLS) {
    if (!tokens.includes(want)) {
      errors.push(finding("ALLOWED_TOOLS_MISSING_MCP", rel, `missing required MCP tool: ${want}`));
    }
  }
  if (mcpTokens.length !== ALLOWED_MCP_TOOLS.length) {
    errors.push(finding("ALLOWED_TOOLS_MCP_COUNT", rel, `expected exactly ${ALLOWED_MCP_TOOLS.length} MCP tools, found ${mcpTokens.length}`));
  }
  if (!tokens.includes(SCOPED_HELPER_PERMISSION)) {
    errors.push(finding("ALLOWED_TOOLS_SCOPED_HELPER", rel, `missing scoped helper permission: ${SCOPED_HELPER_PERMISSION}`));
  }
  if (tokens.includes("Bash")) {
    errors.push(finding("ALLOWED_TOOLS_BARE_BASH", rel, "bare Bash must not be pre-authorized on the MCP-bearing skill"));
  }
  for (const t of tokens) {
    if (t.startsWith("Bash(") && t !== SCOPED_HELPER_PERMISSION) {
      errors.push(finding("ALLOWED_TOOLS_UNSCOPED_BASH", rel, `Bash permission must be exactly the scoped helper; got: ${t}`));
    }
  }
}

// ------------------------------------------------------------------ CLI
function main(argv) {
  let root = ".";
  let hostNeutral = "warn";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") {
      root = argv[++i];
      if (root === undefined) return usage("--root requires a value");
    } else if (a === "--host-neutral") {
      hostNeutral = argv[++i];
      if (hostNeutral !== "warn" && hostNeutral !== "error") return usage(`--host-neutral must be warn|error`);
    } else return usage(`unknown argument: ${a}`);
  }
  if (!fs.existsSync(root)) return usage(`--root does not exist: ${root}`);

  let result;
  try {
    result = validateTree(root, { hostNeutral });
  } catch (e) {
    process.stderr.write(`validate-dual-host: ${e.message}\n`);
    return 2;
  }
  for (const w of result.warnings) process.stdout.write(`WARN  ${w.code}  ${w.path}  ${w.message}\n`);
  for (const e of result.errors) process.stdout.write(`ERROR ${e.code}  ${e.path}  ${e.message}\n`);
  process.stdout.write(`\n${result.errors.length} error(s), ${result.warnings.length} warning(s)\n`);
  return result.errors.length ? 1 : 0;
}

function usage(msg) {
  process.stderr.write(`validate-dual-host: ${msg}\nusage: node scripts/validate-dual-host.mjs --root <dir> --host-neutral warn|error\n`);
  return 2;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("validate-dual-host.mjs")) {
  process.exit(main(process.argv.slice(2)));
}
