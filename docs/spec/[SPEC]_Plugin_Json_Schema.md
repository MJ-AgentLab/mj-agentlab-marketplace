---
type: spec
scope: marketplace
summary: plugin.json local conventions — 6 required fields, repository as string, SKILL.md auto-discovery
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-15
state: active
version: v1.0
domain: plugin-dev
related:
  - ./[SPEC]_Marketplace_Json_Schema.md
  - ../rule/[STANDARD]_Documentation_Framework.md
  - ../guide/[GUIDE]_Plugin_Development_Testing_Workflow.md
---

# [SPEC] Plugin JSON Schema

## §1 Purpose

This SPEC documents the **local conventions** that `mj-agentlab-marketplace` plugins follow for their `plugins/<name>/.claude-plugin/plugin.json` files. The file's authoritative schema is the Claude Code plugin spec maintained upstream; this SPEC only captures **what marketplace requires beyond upstream**: 6 required fields, repository-as-string rule, allowed `category` values, auto-discovery contract for `skills/`.

**Audience**: plugin authors, AI agents (`/mp-flow-author`, `/plugin-dev:create-plugin`), validators (`/plugin-dev:plugin-validator`).

## §2 Required Fields (6)

Every `plugins/<name>/.claude-plugin/plugin.json` MUST contain these 6 fields, all populated:

| Field | Type | Marketplace convention |
|-------|------|------------------------|
| `name` | string | matches plugin directory name; lowercase kebab-case |
| `version` | string | semver `X.Y.Z` (e.g., `1.0.0`); must match `plugins[<name>].version` in marketplace.json |
| `description` | string | 100-400 chars; user-facing; mentions skills + dependencies |
| `author` | object | `{ "name": "MJ-AgentLab" }` (or override per plugin) |
| `repository` | **string** | full HTTPS URL to plugin repo (typically `https://github.com/MJ-AgentLab/mj-agentlab-marketplace`) — see §3.1 for the string-not-object rule |
| `keywords` | array of strings | 10-25 search keywords |

### §2.1 Optional but Recommended

| Field | Purpose |
|-------|---------|
| `license` | SPDX identifier; marketplace plugins use `MIT` |
| `homepage` | plugin-specific homepage URL if different from `repository` |
| `bugs` | issue tracker URL |
| `category` | one Claude-Code-allowed category enum (`documentation`, `learning`, etc.) |

## §3 Marketplace-Specific Rules

### §3.1 `repository` MUST be String, Not Object

The Claude Code plugin schema allows `repository` to be:
- a string (URL), OR
- an object `{ "type": "git", "url": "..." }` (npm-style)

**Marketplace convention**: always use the **string form**. Background: PR #70 (commit `f046a4d`, 2026-05-14) fixed the historical bug where `repository` was set as `{ url: "..." }` which the plugin manifest validator rejects. The skill `/mp-flow-author` Step 3 enforces this check.

```json
{
  "repository": "https://github.com/MJ-AgentLab/mj-agentlab-marketplace"   // ✅
}

{
  "repository": { "url": "https://github.com/MJ-AgentLab/mj-agentlab-marketplace" }   // ❌
}
```

### §3.2 No `components` Field

The plugin manifest does NOT use a `components` field to list skills. Claude Code auto-discovers skills from the `skills/` directory at plugin load. Do not list skills explicitly in `plugin.json`.

```json
{
  "components": [...]   // ❌ deprecated; remove
}
```

### §3.3 Directory Layout Required

Each plugin MUST have this structure:

```
plugins/<name>/
├── .claude-plugin/
│   └── plugin.json          # ← this SPEC governs this file
├── CLAUDE.md                # plugin overview (Claude Code spec contract)
├── README.md                # user guide
├── CHANGELOG.md             # Keep-a-Changelog format
├── LICENSE                  # MIT (or whatever license declared)
└── skills/
    └── <skill-name>/
        ├── SKILL.md         # required; Claude Code spec native frontmatter
        ├── templates/       # optional
        ├── references/      # optional
        └── scripts/         # optional
```

`.mcp.json` at plugin root is optional; required only when the plugin registers an MCP server (e.g., `plugins/learn-kit/.mcp.json` registers `notebooklm-mcp`).

### §3.4 `keywords` Composition

Recommended keyword mix (per learn-kit v1.0.0 pattern):

- 4-6 domain concepts (`learning`, `pedagogy`, `methodology`, ...)
- 4-6 specific skill / feature names (`locate`, `scan`, `three-tier`, ...)
- 4-6 tool / format names (`nlm-studio`, `notebooklm`, `audio`, ...)

Total: 15-25 keywords. Used by marketplace search and Claude Code's plugin discovery UI.

## §4 Examples

### §4.1 Compliant (current learn-kit v1.0.0)

```json
{
  "name": "learn-kit",
  "version": "2.0.0",
  "description": "Pedagogical kit for learnable knowledge artifacts. Five skills: (1) /learn-kit:scaffold-learning scaffolds the learning subsystem; (2) /learn-kit:locate reverse-looks up concepts; (3) /learn-kit:scan enumerates learnable docs; (4) /learn-kit:generate-tier AI-generates three-tier (foundation/structural/challenge) learning markdown plus optional interactive HTML; (5) /learn-kit:nlm-studio pushes a topic's three-tier markdown corpus to NotebookLM and generates up to 13 online-viewable multimedia artifacts. nlm-studio requires notebooklm-mcp MCP server (bundled) + nlm login; the other four skills run with no external dependencies.",
  "author": { "name": "MJ-AgentLab" },
  "repository": "https://github.com/MJ-AgentLab/mj-agentlab-marketplace",
  "keywords": [
    "learning", "pedagogy", "methodology", "rule-list",
    "interpretation", "discovery", "locate", "scan",
    "three-tier", "foundation", "structural", "challenge",
    "ai-generation", "html-render", "nlm-studio",
    "notebooklm", "audio", "video", "multimedia",
    "slide-deck", "mind-map", "infographic"
  ],
  "license": "MIT"
}
```

### §4.2 Non-Compliant (with reason)

```json
{
  "name": "learn-kit",
  "version": 1.0,                                    // ❌ must be string
  "description": "A plugin.",                        // ❌ too short, no skill list, no dependencies
  "repository": { "url": "https://..." },            // ❌ must be string (per §3.1)
  "components": ["init", "locate"]                    // ❌ no components field (auto-discovery)
}
```

## §5 Validation

### §5.1 Manual

```bash
plugin=learn-kit
jq . plugins/$plugin/.claude-plugin/plugin.json > /dev/null && echo "valid JSON"

# 6 required fields
for f in name version description author repository keywords; do
  jq -e ".$f" plugins/$plugin/.claude-plugin/plugin.json >/dev/null || echo "MISSING: $f"
done

# repository must be string
[ "$(jq -r '.repository | type' plugins/$plugin/.claude-plugin/plugin.json)" = "string" ] || echo "ERROR: repository must be string"

# version matches plugins[].version in marketplace.json
v_self=$(jq -r '.version' plugins/$plugin/.claude-plugin/plugin.json)
v_mp=$(jq -r ".plugins[] | select(.name==\"$plugin\") | .version" .claude-plugin/marketplace.json)
[ "$v_self" = "$v_mp" ] || echo "DRIFT: plugin.json.version ≠ marketplace.json plugins[].version"

# auto-discovery: every skills/<name>/ has SKILL.md
find plugins/$plugin/skills -mindepth 1 -maxdepth 1 -type d | while read d; do
  [ -f "$d/SKILL.md" ] || echo "ORPHAN: $d missing SKILL.md"
done
```

### §5.2 Skill-Backed

- `/plugin-dev:plugin-validator` (agent) — full plugin compliance audit including these checks
- `/mp-flow-compliance` — orchestrator that delegates to plugin-validator at Stage 5
- `/mp-flow-author` — pre-emptive check at Stage 4 authoring time

### §5.3 CI

`.github/workflows/ci.yml` steps 2-3 validate each plugin.json's 6 required fields and SKILL.md presence.

## §6 Versioning

This SPEC versions independently from `plugin.json` content:

| Change Type | Bump |
|-------------|------|
| New optional field added to required list | minor |
| New required field | major (breaks existing plugins until they update) |
| Required field removed | major |
| Validation rule strictened (e.g., new pattern) | minor or major (case-by-case) |

## §7 Change History

| Version | Date | Summary |
|---------|------|---------|
| v1.0 | 2026-05-15 | Initial SPEC. Captures marketplace v4.0.0+ plugin convention (1 plugin: learn-kit v1.0.0). Documents the historical repository-as-string fix (PR #70, v3.2.1 → v3.2.2). |
