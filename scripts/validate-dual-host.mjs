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
            } else if (!exists(path.join("plugins", name, "skills", r[3]))) {
              errors.push(
                finding("PROMPT_UNKNOWN_SKILL", nativeRel, `"$${r[1]}:${r[3]}" has no matching skills/ directory`),
              );
            }
          }
        }
      }
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
      // A directory with no SKILL.md is a shared-resource folder (the repo's `*-shared`
      // convention), not a skill. Key off the absence of SKILL.md rather than the name suffix:
      // both hosts auto-discover ANY directory that does contain one, so a `-shared` suffix
      // must not become a way to skip the description and capability gates.
      if (!exists(skillRel)) continue;
      const text = fs.readFileSync(abs(skillRel), "utf8");
      const { raw } = splitFrontmatter(text);
      if (raw === null) {
        errors.push(finding("SKILL_FRONTMATTER_MISSING", skillRel, "no --- frontmatter block"));
        continue;
      }
      const fm = parseFm(raw, skillRel, errors);
      if (!fm) continue;

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

      // Capability contract — enforced for EVERY skill, keyed on whether the plugin actually
      // ships an MCP server rather than on a hard-coded skill path.
      const at = fm["allowed-tools"];
      if (at !== undefined) {
        if (typeof at !== "string") {
          errors.push(finding("ALLOWED_TOOLS_NOT_SCALAR", skillRel, "allowed-tools must be a quoted space-separated scalar"));
        } else {
          checkAllowedTools(at, skillRel, exists(`plugins/${name}/.mcp.json`), errors);
        }
      }

      // openai.yaml
      const yRel = `plugins/${name}/skills/${skill}/agents/openai.yaml`;
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
          if (y.dependencies?.tools !== undefined) {
            errors.push(finding("OPENAI_YAML_DEPENDENCY_TOOLS", yRel, "dependencies.tools must be omitted: it cannot express an opt-in dependency"));
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

/**
 * Validate one skill's allowed-tools scalar against the capability contract.
 *
 * Applies to EVERY skill, but the strict regime is keyed on whether the skill actually DECLARES
 * MCP tools — not on a hard-coded skill name. That is the security-relevant property and it is
 * rename-proof: any skill (renamed, or newly added) that grants NotebookLM access gets the full
 * narrowing, while a skill that grants none cannot reach the remote surface at all.
 *
 * Deliberately NOT global: the plan constrains "no general Bash" to the MCP-bearing skill only.
 * arch-diagram legitimately holds bare `Bash` — it shells out to the bundled Python validator —
 * and flagging that would contradict the spec.
 *
 * @param {boolean} pluginShipsMcp whether the owning plugin has a .mcp.json
 */
function checkAllowedTools(value, rel, pluginShipsMcp, errors) {
  const tokens = tokenizeAllowedTools(value);
  const mcpTokens = tokens.filter((t) => t.startsWith("mcp__"));
  const declaresMcp = mcpTokens.length > 0;

  // --- rules that hold for every skill -------------------------------------
  for (const bad of FORBIDDEN_MCP_TOOLS) {
    if (tokens.includes(bad)) {
      errors.push(finding("ALLOWED_TOOLS_FORBIDDEN_MCP", rel, `${bad} must not be pre-authorized`));
    }
  }
  // The installer is never pre-authorized: users run it manually (§2.3 / §2.5).
  for (const t of tokens) {
    if (/install-nlm-bridge/.test(t)) {
      errors.push(finding("ALLOWED_TOOLS_INSTALLER", rel, `the installer must never be pre-authorized: ${t}`));
    }
  }
  if (declaresMcp && !pluginShipsMcp) {
    errors.push(finding("ALLOWED_TOOLS_MCP_WITHOUT_SERVER", rel, `declares MCP tools but the plugin ships no .mcp.json`));
  }

  if (!declaresMcp) return; // e.g. arch-diagram: bare Bash is allowed by spec.

  // --- strict regime: this skill can reach NotebookLM -----------------------
  for (const want of ALLOWED_MCP_TOOLS) {
    if (!tokens.includes(want)) {
      errors.push(finding("ALLOWED_TOOLS_MISSING_MCP", rel, `missing required MCP tool: ${want}`));
    }
  }
  // Reject by NAME as well as by count, so an unknown or future tool cannot ride along.
  for (const t of mcpTokens) {
    if (!ALLOWED_MCP_TOOLS.includes(t)) {
      errors.push(finding("ALLOWED_TOOLS_UNKNOWN_MCP", rel, `MCP tool not on the 6-tool allowlist: ${t}`));
    }
  }
  if (mcpTokens.length !== ALLOWED_MCP_TOOLS.length) {
    errors.push(finding("ALLOWED_TOOLS_MCP_COUNT", rel, `expected exactly ${ALLOWED_MCP_TOOLS.length} MCP tools, found ${mcpTokens.length}`));
  }
  if (!tokens.includes(SCOPED_HELPER_PERMISSION)) {
    errors.push(finding("ALLOWED_TOOLS_SCOPED_HELPER", rel, `missing scoped helper permission: ${SCOPED_HELPER_PERMISSION}`));
  }
  // Bash here is an ALLOWLIST, not a denylist. `Bash(*)` / `Bash(:*)` are Claude's
  // unrestricted-shell grants — strictly broader than bare `Bash` — so a denylist keyed on the
  // literal token "Bash" never sees them. Every Bash grant must equal the scoped helper.
  for (const t of tokens) {
    if (t === "Bash") {
      errors.push(finding("ALLOWED_TOOLS_BARE_BASH", rel, "bare Bash must not be pre-authorized on the MCP-bearing skill"));
    } else if (t.startsWith("Bash(") && t !== SCOPED_HELPER_PERMISSION) {
      errors.push(
        finding("ALLOWED_TOOLS_UNSCOPED_BASH", rel, `Bash permission must be exactly the scoped helper; got: ${t}`),
      );
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
