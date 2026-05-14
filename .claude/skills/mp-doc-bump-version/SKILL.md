---
name: mp-doc-bump-version
description: Bumps marketplace versions atomically across all version-bearing files — `VERSION`, `.claude-plugin/marketplace.json` (metadata.version + plugins[].version per plugin), `plugins/<name>/.claude-plugin/plugin.json` (version), and aligns CHANGELOG entries (top-level + per-plugin) by promoting `[Unreleased]` to `[X.Y.Z]` with date. Make sure to use this skill whenever the user says "bump version", "升版本", "版本号 bump", "marketplace patch / minor / major", "plugin bump", "version sync", "Stage 8 / release-prep version", "VERSION update", "bump marketplace", "bump learn-kit", "release prep", or when preparing a release PR (release/v<X.Y.Z>) or any change that warrants version increment per `[GUIDE]_Version_Management`. Calls `scripts/bump-version.ps1` if it exists (uses its semantics); otherwise performs the equivalent edits directly. Enforces version triangle invariants: `VERSION` ↔ `marketplace.json metadata.version` ↔ each `plugin.json version` ↔ `marketplace.json plugins[entry].version`. Outputs the proposed version transitions + ready commands; does NOT auto-execute — user reviews. Do not use for: tag creation (release.yml automates after PR merge to main), CHANGELOG content authoring (use the existing CHANGELOG semantics; this skill only structurally promotes [Unreleased] → [X.Y.Z]), or non-version metadata updates.
---

# Marketplace Doc Bump Version

## Overview

Atomically bumps versions across the marketplace's 4 version sites and aligns CHANGELOG headers. Enforces the version triangle invariant.

**Version Triangle**:

```text
VERSION (root file)
   ↕
.claude-plugin/marketplace.json metadata.version
   ↕
plugins/<name>/.claude-plugin/plugin.json version  ↔  .claude-plugin/marketplace.json plugins[<name>].version
```

**Reference**: [[../../../docs/[GUIDE]_Version_Management|Version Management]] + [[../../../scripts/bump-version.ps1|bump-version.ps1]] (if exists).

**Workflow position**: Stage 8 pre-step (typical part of release/* PR or any minor+ bump).

## Workflow

```dot
digraph bump {
  rankdir=TB;
  start [label="Want to bump version" shape=doublecircle];

  s1 [label="Step 1: Determine scope\n(marketplace / plugin / both)" shape=box];
  s2 [label="Step 2: Determine bump type\n(patch / minor / major) per file" shape=box];
  s3 [label="Step 3: Calculate target versions" shape=box];
  s4 [label="Step 4: Check bump-version.ps1 exists" shape=diamond];

  script [label="Use scripts/bump-version.ps1" shape=box];
  manual [label="Manual atomic edits" shape=box];

  s5 [label="Step 5: Update CHANGELOGs\n[Unreleased] → [X.Y.Z] + date" shape=box];
  s6 [label="Step 6: Verify version triangle" shape=box];

  done [label="ready commands" shape=doublecircle];

  start -> s1 -> s2 -> s3 -> s4;
  s4 -> script [label="exists"];
  s4 -> manual [label="absent"];
  script -> s5;
  manual -> s5;
  s5 -> s6 -> done;
}
```

## Step 1: Determine Scope

| Scope | When | Files Affected |
|---|---|---|
| **plugin-only** | plugin 内部改动（不影响 marketplace registry） | `plugins/<name>/plugin.json` + `plugins/<name>/CHANGELOG.md` |
| **marketplace-only** | docs / CI / scripts 改动（不影响任何 plugin） | `VERSION` + `marketplace.json metadata.version` + `CHANGELOG.md` (顶层) |
| **both** | plugin 改动 + marketplace 注册条目同步 | 全部 4 个版本字段 + 2 个 CHANGELOG |

## Step 2: Determine Bump Type

Semver:
- **patch**: bugfix / typo / 小修
- **minor**: 新功能 / 新 skill / backward-compatible
- **major**: breaking change / plugin delete-rename / API 改

判断:

| 改动 | plugin bump | marketplace bump |
|---|---|---|
| 加 1 个 skill 到 learn-kit | minor (1.0.0 → 1.1.0) | minor (4.0.0 → 4.1.0) |
| learn-kit bugfix | patch (1.0.0 → 1.0.1) | patch (4.0.0 → 4.0.1) |
| 删 plugin | major (1.0.0 → 2.0.0 or 退役) | major (4.x → 5.0.0) |
| 仅 marketplace docs/CI | — | patch 或 minor (视 docs 范围) |
| 添加新 plugin | (new) 0.1.0 或 1.0.0 | minor (4.x → 4.y) |

## Step 3: Calculate Target Versions

```bash
# Read current
current_marketplace=$(cat VERSION)
current_plugin=$(jq -r '.version' plugins/<name>/.claude-plugin/plugin.json)

# Calculate target (per Step 2)
# e.g., add skill to learn-kit:
target_marketplace=4.1.0
target_plugin=1.1.0
```

## Step 4: Check `scripts/bump-version.ps1`

```bash
[ -f scripts/bump-version.ps1 ] && echo "exists" || echo "absent"
```

如 exists: prefer 用 script（保证 atomic + sync 逻辑）

```powershell
.\scripts\bump-version.ps1 -Marketplace 4.1.0 -Plugin learn-kit -PluginVersion 1.1.0
```

如 absent: manual edits

## Step 5: Manual Atomic Edits (if no script)

```powershell
# 1. VERSION
Set-Content VERSION "4.1.0"

# 2. marketplace.json
$json = Get-Content .claude-plugin/marketplace.json | ConvertFrom-Json
$json.metadata.version = "4.1.0"
($json.plugins | Where-Object name -eq learn-kit).version = "1.1.0"
$json | ConvertTo-Json -Depth 10 | Set-Content .claude-plugin/marketplace.json

# 3. plugin.json
$pjson = Get-Content plugins/learn-kit/.claude-plugin/plugin.json | ConvertFrom-Json
$pjson.version = "1.1.0"
$pjson | ConvertTo-Json -Depth 10 | Set-Content plugins/learn-kit/.claude-plugin/plugin.json

# 4. CHANGELOG (top-level)
# Promote [Unreleased] → [4.1.0] - 2026-05-15
# See Step 5 below
```

## Step 6: Update CHANGELOGs

Marketplace top-level `CHANGELOG.md`:

```markdown
## [Unreleased]
<entries 已写好>
```

Promote to:

```markdown
## [4.1.0] - 2026-05-15

<existing entries from [Unreleased]>

## [Unreleased]

(empty / next cycle starts)
```

Per-plugin `plugins/<name>/CHANGELOG.md`: same pattern。

Date: 用 `Get-Date -Format yyyy-MM-dd` 取本地日期，目前是 `2026-05-15`。

## Step 7: Verify Version Triangle

```bash
# 三角一致性
v_root=$(cat VERSION)
v_mp_meta=$(jq -r '.metadata.version' .claude-plugin/marketplace.json)
v_plugin_in_mp=$(jq -r '.plugins[] | select(.name=="learn-kit") | .version' .claude-plugin/marketplace.json)
v_plugin_self=$(jq -r '.version' plugins/learn-kit/.claude-plugin/plugin.json)

echo "VERSION = $v_root"
echo "marketplace.json metadata = $v_mp_meta"
echo "marketplace.json plugins[learn-kit] = $v_plugin_in_mp"
echo "learn-kit plugin.json = $v_plugin_self"

[ "$v_root" = "$v_mp_meta" ] && echo "marketplace OK" || echo "MISMATCH: VERSION ≠ metadata"
[ "$v_plugin_in_mp" = "$v_plugin_self" ] && echo "learn-kit OK" || echo "MISMATCH: plugins[].version ≠ plugin.json.version"
```

## Output Format

```markdown
## Version Bump Plan

### Scope
- Scope: plugin-only / marketplace-only / both
- Target: marketplace=<X.Y.Z>, plugin learn-kit=<A.B.C>

### Bump Type Rationale
- marketplace: minor (added 18 mp-* skills to .claude/skills/, no plugin behavior change)
- learn-kit: none (this PR doesn't touch plugin)

### Current → Target
| File | Current | Target |
|---|---|---|
| VERSION | 4.0.0 | 4.1.0 |
| marketplace.json metadata.version | 4.0.0 | 4.1.0 |
| marketplace.json plugins[learn-kit].version | 1.0.0 | 1.0.0 (no change) |
| plugins/learn-kit/plugin.json version | 1.0.0 | 1.0.0 (no change) |
| CHANGELOG.md [Unreleased] | (entries) | promote → [4.1.0] - 2026-05-15 |
| plugins/learn-kit/CHANGELOG.md | (no entry needed) | (no change) |

### Strategy
- `scripts/bump-version.ps1` exists ✅ — use it
  - Command: `.\scripts\bump-version.ps1 -Marketplace 4.1.0`
- Or manual edits (4 atomic file changes + 1 CHANGELOG promote)

### Verification
```bash
.\scripts\bump-version.ps1 -Marketplace 4.1.0
# After:
cat VERSION  # 4.1.0
jq '.metadata.version' .claude-plugin/marketplace.json  # "4.1.0"
jq '.plugins[] | select(.name=="learn-kit") | .version' .claude-plugin/marketplace.json  # "1.0.0"
```

### Next Step
- 用户确认 → run commands
- → /mp-flow-self-review (Stage 7) 验证 version 改动是 §3.1 #7 必停 trigger (marketplace VERSION 主版本) — 本次是 minor, 不触
- → /mp-git-commit
```

## What This Skill DOES NOT DO

- ❌ 不写 CHANGELOG entry content (those should already be in [Unreleased] before bump; this skill 只 promote 段头)
- ❌ 不创建 git tag (release.yml 自动；手工创建会 race)
- ❌ 不创建 release PR (Stage 8 `/mp-git-pr`)
- ❌ 不 commit / push (Stage 8 `/mp-git-commit` / `/mp-git-push`)
- ❌ 不更新 plugin's `nlm-shared/` 或其他模板 version 字段 (那些是 plugin-internal 范畴；不在 version 三角中)

## Sub-skill / Tool Calls

| Tool | 用途 |
|---|---|
| Bash `scripts/bump-version.ps1` | 优选执行路径 |
| Edit | manual atomic edits 各 JSON / VERSION / CHANGELOG |
| Bash `jq` | parse JSON for verification |
| Bash `Get-Date` | CHANGELOG 日期戳 |
| Read | 确认当前值 |

## Reference Files

- [[../../../docs/[GUIDE]_Version_Management|Version Management]]
- `scripts/bump-version.ps1` (if exists)
- [[../../../docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt|HITL Standard]] §3.1 #7 (VERSION 主版本 bump 必 HITL)

## Anti-patterns

- **不要** 仅改一个版本字段（必同步全 4 个）
- **不要** Major bump 自主推进（§3.1 #7 必 HITL）
- **不要** 跳 CHANGELOG promote（release.yml 抽 release notes 时会出错）
- **不要** 手工 git tag（release.yml 自动）
- **不要** 改 plugin.json 字段以外的 plugin metadata（用 `/mp-flow-author`）

## Handoff to Next Stage

```text
Version bumped + CHANGELOG promoted
→ /mp-flow-self-review (Stage 7) 检查 bump 类型是否触 §3.1 #7
→ /mp-git-commit ("infra(release): bump marketplace 4.0.0 → 4.1.0")
→ /mp-git-push
→ /mp-git-pr (release PR if major; otherwise inline in current branch)
```
