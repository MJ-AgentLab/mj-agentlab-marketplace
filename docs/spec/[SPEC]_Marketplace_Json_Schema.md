---
type: spec
scope: marketplace
summary: marketplace.json local conventions — plugins[] array, metadata, version triangle invariants
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-07-20
state: active
version: v1.1
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
    "description": "<one-paragraph marketplace description; lists the currently registered plugins (v7.0.0: learn-kit + diagram-kit)>",
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

As of v7.0.0, the marketplace has **two** plugins:

| Plugin | Version | Category |
|--------|---------|----------|
| `learn-kit` | 4.0.0 | `documentation` |
| `diagram-kit` | 0.2.0 | `documentation` |

The v4.0.0–v6.2.x marketplace was a **single** plugin (learn-kit). v6.3.0 added `diagram-kit` (architecture / UML diagramming, orthogonal to learn-kit) — the first 1 → 2 plugin count since the 8→3→1 convergence; see [`[ADR]_Diagram_Kit_Addition.md`](../adr/[ADR]_Diagram_Kit_Addition.md). v7.0.0 shipped the Codex dual-native wrappers (native catalog + per-plugin `.codex-plugin/plugin.json` + per-skill `agents/openai.yaml`) alongside `.claude-plugin/**`; see [`[ADR]_Codex_Dual_Native_Plugin_Support.md`](../adr/[ADR]_Codex_Dual_Native_Plugin_Support.md). The historical v3.x marketplace held 2 plugins (`learn-kit` + `notebooklm-kit`); see [`[ADR]_NotebookLM_Kit_Retirement.md`](../[ADR]_NotebookLM_Kit_Retirement.md) for the retirement decision.

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

> **v7.0.0 起 — quintangle + Codex parity edge**：上面 4 节点是版本一致性的核心不变量。marketplace 版本在实操中扩展为 **quintangle 5-site** —— `VERSION` + `marketplace.json` `metadata.version` + README badge/cell + `CLAUDE.md` 版本行 + `plugins[].version`／`plugin.json.version`（见 [`[RUNBOOK]_Release_Operations`](../runbook/[RUNBOOK]_Release_Operations.md) §3.2.1）。此外每插件的 Codex 原生 manifest `plugins/<name>/.codex-plugin/plugin.json` 的 `version` 必须与 `.claude-plugin/plugin.json` **精确一致**（新增一条 parity edge，由 `scripts/validate-dual-host.mjs` 强制）。仓库级 Codex catalog `.agents/plugins/marketplace.json` **不保存版本**，故不在版本三角 / quintangle 内。

**Edge constraint**: while the marketplace `metadata.version` (e.g., 4.2.0) and the plugin `plugin.json.version` (e.g., 1.0.0) can differ (they evolve independently), the plugin entry inside `marketplace.json` (`plugins[learn-kit].version`) MUST equal the plugin's own `plugin.json.version`. The skill `/mp-doc-bump-version` enforces this atomically.

Common drift (caught by `/plugin-dev:plugin-validator` agent at PR time):

| Drift | Example | Fix |
|-------|---------|-----|
| Marketplace bump'd but `metadata.version` not updated | `VERSION=4.2.0` / `metadata.version=4.1.0` | sync `metadata.version` |
| Plugin bump'd in `plugin.json` but not `marketplace.json` | `plugin.json.version=1.1.0` / `plugins[learn-kit].version=1.0.0` | sync `plugins[].version` |
| Description field references plugin count incorrectly | description says "sole plugin" when reality is 2 plugins (learn-kit + diagram-kit since v6.3.0) | rewrite description |
| Codex `.codex-plugin/plugin.json` version drifts from `.claude-plugin/plugin.json` | `.claude-plugin=4.0.0` / `.codex-plugin=3.2.1` | re-run `bump-version.ps1` (transactional; syncs both) — `validate-dual-host.mjs` fails the PR otherwise |

## §4 Examples

### §4.1 Minimal Valid (current v7.0.0 state)

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "mj-agentlab-marketplace",
  "owner": {
    "name": "MJ-AgentLab",
    "url": "https://github.com/MJ-AgentLab"
  },
  "metadata": {
    "description": "Generic Claude Code plugins for AI engineering workflows. Two plugins (v6.3.0+): learn-kit (pedagogy) + diagram-kit (architecture diagramming) ...",
    "version": "7.0.0"
  },
  "plugins": [
    {
      "name": "learn-kit",
      "source": "./plugins/learn-kit",
      "description": "Pedagogical kit for learnable knowledge artifacts. Three skills (three-views / glossary / concept): ...",
      "version": "4.0.0",
      "author": { "name": "MJ-AgentLab" },
      "category": "documentation",
      "keywords": ["learning", "pedagogy", "..."],
      "license": "MIT"
    },
    {
      "name": "diagram-kit",
      "source": "./plugins/diagram-kit",
      "description": "Evidence-bound Mermaid architecture diagrams. One skill (arch-diagram): ...",
      "version": "0.2.0",
      "author": { "name": "MJ-AgentLab" },
      "category": "documentation",
      "keywords": ["mermaid", "architecture", "..."],
      "license": "MIT"
    }
  ]
}
```

> The repo-level Codex catalog `.agents/plugins/marketplace.json` mirrors this plugin list for Codex hosts but **carries no version** — the marketplace version lives only in `VERSION` + `metadata.version` here.

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
| v1.1 | 2026-07-20 | v7.0.0 sync. §2.1 + §2.4 + §4.1 updated to the 2-plugin reality (learn-kit 4.0.0 + diagram-kit 0.2.0; "sole plugin" wording dropped). §3 adds the quintangle 5-site note + Codex `.codex-plugin/plugin.json` parity edge (enforced by `validate-dual-host.mjs`) and clarifies `.agents/plugins/marketplace.json` carries no version. §3 drift table gains a Codex parity-drift row. |
| v1.0 | 2026-05-15 | Initial SPEC. Captures the marketplace v4.0.0 single-plugin state (then-current: learn-kit). Version triangle formalization. |
