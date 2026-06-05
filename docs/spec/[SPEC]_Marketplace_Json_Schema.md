---
type: spec
scope: marketplace
summary: marketplace.json local conventions — plugins[] array, metadata, version triangle invariants
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-15
state: active
version: v1.0
domain: governance
related:
  - ./[SPEC]_Plugin_Json_Schema.md
  - ../rule/[STANDARD]_Documentation_Framework.md
  - ../guide/[GUIDE]_Version_Management.md
---

# [SPEC] Marketplace JSON Schema

## §1 Purpose

This SPEC documents the **local conventions** that `mj-agentlab-marketplace` follows for its `.claude-plugin/marketplace.json` file. The file's authoritative schema is the [Claude Code marketplace schema](https://anthropic.com/claude-code/marketplace.schema.json) maintained upstream; this SPEC only captures **what marketplace adds on top**: required-vs-optional choices, version-triangle invariants, plugins[] entry conventions, MCP server registration policy.

**Audience**: marketplace maintainers, AI agents touching marketplace metadata (e.g., `/mp-doc-bump-version`), reviewers verifying release PRs.

## §2 Schema (local additions to upstream)

### §2.1 Top-level Structure

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "mj-agentlab-marketplace",
  "owner": {
    "name": "MJ-AgentLab",
    "url": "https://github.com/MJ-AgentLab"
  },
  "metadata": {
    "description": "<one-paragraph marketplace description, must mention current sole plugin since v4.0.0>",
    "version": "<X.Y.Z, semver>"
  },
  "plugins": [
    { ... per-plugin entry, see §2.3 ... }
  ]
}
```

### §2.2 `metadata.version`

Must equal the contents of root `VERSION` file. This is the **first** invariant of the version triangle (see §3).

### §2.3 `plugins[]` entry

Each plugin entry has these required fields:

| Field | Type | Purpose | Marketplace convention |
|-------|------|---------|------------------------|
| `name` | string | plugin directory name | matches `plugins/<name>/` |
| `source` | string | relative path | always `./plugins/<name>` (no other source types currently used) |
| `description` | string | end-user discovery | 200-400 chars; lists all skills + dependencies (e.g., "requires MCP server X") |
| `version` | string | plugin version | semver, must equal `plugins/<name>/.claude-plugin/plugin.json` `version` (second triangle invariant) |
| `author` | object | author metadata | `{ "name": "MJ-AgentLab" }` |
| `category` | string | discovery taxonomy | one of `documentation` / `learning` / etc. (Anthropic-defined enum) |
| `keywords` | array of strings | search keywords | 15-25 keywords mixing concept + tool names; used for marketplace search |
| `license` | string | SPDX identifier | `MIT` |

### §2.4 Plugins Currently Listed

As of v6.3.0, the marketplace has **two** plugins:

| Plugin | Version | Category |
|--------|---------|----------|
| `learn-kit` | 3.2.0 | `documentation` |
| `diagram-kit` | 0.1.0 | `documentation` |

The v4.0.0–v6.2.x marketplace was a **single** plugin (learn-kit). v6.3.0 added `diagram-kit` (architecture / UML diagramming, orthogonal to learn-kit) — the first 1 → 2 plugin count since the 8→3→1 convergence; see [`[ADR]_Diagram_Kit_Addition.md`](../adr/[ADR]_Diagram_Kit_Addition.md). The historical v3.x marketplace held 2 plugins (`learn-kit` + `notebooklm-kit`); see [`[ADR]_NotebookLM_Kit_Retirement.md`](../[ADR]_NotebookLM_Kit_Retirement.md) for the retirement decision.

## §3 Version Triangle Invariant

Three fields **must** stay consistent:

```text
                  VERSION (root file)
                       ↕
        .claude-plugin/marketplace.json
                metadata.version
                       ↕
   .claude-plugin/marketplace.json plugins[<name>].version
                       ↕
   plugins/<name>/.claude-plugin/plugin.json version
```

**Edge constraint**: while the marketplace `metadata.version` (e.g., 4.2.0) and the plugin `plugin.json.version` (e.g., 1.0.0) can differ (they evolve independently), the plugin entry inside `marketplace.json` (`plugins[learn-kit].version`) MUST equal the plugin's own `plugin.json.version`. The skill `/mp-doc-bump-version` enforces this atomically.

Common drift (caught by `/plugin-dev:plugin-validator` agent at PR time):

| Drift | Example | Fix |
|-------|---------|-----|
| Marketplace bump'd but `metadata.version` not updated | `VERSION=4.2.0` / `metadata.version=4.1.0` | sync `metadata.version` |
| Plugin bump'd in `plugin.json` but not `marketplace.json` | `plugin.json.version=1.1.0` / `plugins[learn-kit].version=1.0.0` | sync `plugins[].version` |
| Description field references plugin count incorrectly | description says "Sole plugin since v3.0.0" when reality is v4.0.0 | rewrite description |

## §4 Examples

### §4.1 Minimal Valid (current v4.x state)

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "mj-agentlab-marketplace",
  "owner": {
    "name": "MJ-AgentLab",
    "url": "https://github.com/MJ-AgentLab"
  },
  "metadata": {
    "description": "Generic Claude Code plugins for AI engineering workflows. Sole plugin since v4.0.0: learn-kit ...",
    "version": "4.2.0"
  },
  "plugins": [
    {
      "name": "learn-kit",
      "source": "./plugins/learn-kit",
      "description": "Pedagogical kit for learnable knowledge artifacts. Five skills: ...",
      "version": "1.0.0",
      "author": { "name": "MJ-AgentLab" },
      "category": "documentation",
      "keywords": ["learning", "pedagogy", "..."],
      "license": "MIT"
    }
  ]
}
```

### §4.2 Adding a Second Plugin (hypothetical)

```json
"plugins": [
  {
    "name": "learn-kit",
    "source": "./plugins/learn-kit",
    ...
  },
  {
    "name": "<new-plugin>",
    "source": "./plugins/<new-plugin>",
    "description": "<200-400 chars>",
    "version": "0.1.0",
    "author": { "name": "MJ-AgentLab" },
    "category": "<category>",
    "keywords": [...],
    "license": "MIT"
  }
]
```

Adding a plugin is a **minor** marketplace bump (e.g., 4.2.0 → 4.3.0). Removing a plugin is a **major** bump (e.g., 4.x → 5.0.0); see `[ADR]_NotebookLM_Kit_Retirement.md` for the v3.2.1 → v4.0.0 historical example.

### §4.3 Invalid (with reason)

```json
{
  "plugins": [
    {
      "name": "learn-kit",
      "version": "1.1.0"      // ❌ doesn't match plugins/learn-kit/.claude-plugin/plugin.json
    }
  ]
}
```

```json
{
  "metadata": {
    "version": 4.2          // ❌ must be string, not number; must be full semver
  }
}
```

## §5 Validation

### §5.1 Manual

```bash
# Schema-level validation
jq . .claude-plugin/marketplace.json > /dev/null && echo "valid JSON"

# Version triangle invariants
v_root=$(cat VERSION)
v_mp=$(jq -r '.metadata.version' .claude-plugin/marketplace.json)
v_plugin_in_mp=$(jq -r '.plugins[] | select(.name=="learn-kit") | .version' .claude-plugin/marketplace.json)
v_plugin=$(jq -r '.version' plugins/learn-kit/.claude-plugin/plugin.json)

[ "$v_root" = "$v_mp" ] || echo "TRIANGLE BROKEN: VERSION ≠ metadata.version"
[ "$v_plugin_in_mp" = "$v_plugin" ] || echo "TRIANGLE BROKEN: plugins[].version ≠ plugin.json.version"
```

### §5.2 Skill-Backed

- `/mp-doc-bump-version` enforces atomic 4-site sync (VERSION + marketplace.json `metadata.version` + each plugins[].version + each `plugin.json.version`)
- `/plugin-dev:plugin-validator` (agent) catches triangle drift at PR time

### §5.3 CI

`.github/workflows/ci.yml` step 4 validates the version triangle. PR cannot merge to develop with broken invariants.

## §6 Versioning

This SPEC versions independently from `marketplace.json` content:

| Change Type | Bump |
|-------------|------|
| Add new optional `plugins[].field` | minor |
| New required `plugins[].field` | major |
| Field removal | major |
| Triangle invariant rule change | major |

## §7 Change History

| Version | Date | Summary |
|---------|------|---------|
| v1.0 | 2026-05-15 | Initial SPEC. Captures marketplace v4.0.0+ state (1 plugin: learn-kit). Version triangle formalization. |
