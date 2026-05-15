---
type: guide
scope: marketplace
summary: 双层版本架构、bump 工具、CHANGELOG 规范、CI/CD 自动化
owner: marketplace-maintainers
created: 2026-03-17
updated: 2026-05-15
state: active
version: v1.0
domain: release
tags:
  - versioning
  - changelog
  - release
related:
  - ../spec/[SPEC]_Marketplace_Json_Schema.md
  - ../spec/[SPEC]_Plugin_Json_Schema.md
  - ../runbook/[RUNBOOK]_Release_Operations.md
---

# [GUIDE] 版本管理指南 — MJ AgentLab Marketplace

> 说明双层版本架构、版本升级工具、CHANGELOG 规范和 CI/CD 自动化机制。

## 1. 版本架构

### 1.1 双层独立版本

Marketplace 采用**双层独立版本管理**，marketplace 整体和各插件各自维护版本号，互不影响。

```
版本层级（v4.x reality — marketplace 已收敛至 1 个 plugin）
├── Marketplace 整体 v4.x.x      ← VERSION 文件（权威源）
│   同步 → marketplace.json metadata.version
│
└── learn-kit v1.x.x             ← plugins/learn-kit/.claude-plugin/plugin.json（权威源）
    同步 → marketplace.json plugins[name=learn-kit].version
```

> 历史上 v3.x 时代 marketplace 含 4 个 mj-sys-* 插件 + 1 个 notebooklm-kit。v3.0.0 删 mj-sys-* / v4.0.0 删 notebooklm-kit 之后定型为单 plugin。详见 [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)。如未来再扩充 plugin，把新名加进 bump-version.ps1 ValidateSet 与 install-hooks.ps1 commit-msg regex 即可。

### 1.2 语义化版本

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：`MAJOR.MINOR.PATCH`

| 组件 | 何时递增 |
|------|----------|
| MAJOR | 不兼容的 API 变更（如删除插件、重命名 skill） |
| MINOR | 向后兼容的新功能（如新增 skill、新增插件） |
| PATCH | 向后兼容的问题修复（如修复 SKILL.md 内容错误） |

### 1.3 版本文件位置

| 版本 | 权威文件 | 同步目标 |
|------|----------|----------|
| Marketplace 整体 | `VERSION`（纯文本） | `.claude-plugin/marketplace.json` → `metadata.version` |
| learn-kit | `plugins/learn-kit/.claude-plugin/plugin.json` → `version` | `.claude-plugin/marketplace.json` → `plugins[name=learn-kit].version` |

## 2. bump-version.ps1 脚本

### 2.1 参数

```powershell
param(
    [Parameter(Mandatory=$true)]  [string]$From,      # 当前版本
    [Parameter(Mandatory=$true)]  [string]$To,        # 目标版本
    [ValidateSet("marketplace","learn-kit")]
    [string]$Scope = "marketplace",                    # 升级范围（v4.x: 当前唯一插件 = learn-kit；扩充插件时同步加 ValidateSet）
    [switch]$DryRun                                    # 预览模式
)
```

### 2.2 Scope 行为

| Scope | 更新文件 |
|-------|----------|
| `marketplace` | `VERSION`, `.claude-plugin/marketplace.json`(metadata.version), `README.md` |
| `learn-kit` | `plugins/learn-kit/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`(plugins[name=learn-kit].version), `README.md` |

### 2.3 使用示例

```powershell
# 预览 marketplace 版本升级
.\scripts\bump-version.ps1 -From "4.3.0" -To "4.3.1" -DryRun

# 执行 marketplace 版本升级
.\scripts\bump-version.ps1 -From "4.3.0" -To "4.3.1"

# 预览 learn-kit 插件版本升级
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "learn-kit" -DryRun

# 执行 learn-kit 插件版本升级
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "learn-kit"
```

### 2.4 输出格式

```
[DryRun] Preview mode - no files will be modified
Scope: marketplace
Version: 1.0.0 -> 1.1.0
------------------------------------------------------------

  [MATCH] VERSION (1 occurrences)
    L1: 1.0.0
      -> 1.1.0

  [MATCH] .claude-plugin/marketplace.json (1 occurrences, scoped: marketplace)
    L10: "version": "1.0.0"
      -> "version": "1.1.0"
```

## 3. CHANGELOG 规范

### 3.1 格式

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，使用 4 种分类：

| 分类 | 用途 |
|------|------|
| **Added** | 新功能、新 Skill、新插件 |
| **Changed** | 现有功能的变更 |
| **Fixed** | Bug 修复 |
| **Removed** | 删除的功能 |

### 3.2 双层 CHANGELOG

| CHANGELOG | 记录范围 | 示例条目 |
|-----------|----------|----------|
| 根 `CHANGELOG.md` | Marketplace 级事件 | "v4.2.0 引入文档框架 v1.0"、"v4.3.0 plugin-internal docs framework 延伸" |
| `plugins/<name>/CHANGELOG.md` | 插件内部变更 | "v1.1.0 plugins/learn-kit/docs/ 子目录落地"、"修复 nlm-studio quota gate" |

### 3.3 工作流

1. **开发阶段**：所有变更写入 `[Unreleased]` 区块
2. **发布阶段**：`[Unreleased]` 内容转为 `[X.Y.Z] - YYYY-MM-DD` 正式版本节
3. 发布后 `[Unreleased]` 清空，准备接收下一轮变更

```markdown
## [Unreleased]

### Added
- 新增 release skill（branch → tag → GitHub Release）

## [1.0.0] - 2026-03-16

### Added
- 初始发布：9 个 Skill
```

## 4. CI/CD 自动化

### 4.1 CI — 结构校验（ci.yml）

**触发条件**：
- push: `feature/*`, `bugfix/*`, `documentation/*`, `maintain/*`, `hotfix/*`
- pull_request: `develop`, `main`

**6 项校验**：

| # | 检查项 | 失败示例 |
|---|--------|----------|
| 1 | plugin.json 字段完整 | `ERROR: plugins/learn-kit/.claude-plugin/plugin.json missing field: license` |
| 2 | marketplace.json 插件目录匹配 | `ERROR: marketplace.json references 'mj-foo' but directory not found` |
| 3 | SKILL.md frontmatter | `ERROR: SKILL.md missing frontmatter field: description` |
| 4 | 目录结构 | `ERROR: plugins/learn-kit missing required file: CLAUDE.md` |
| 5 | 版本一致性 | `ERROR: VERSION (4.3.1) != marketplace.json (4.3.0)` |
| 6 | CHANGELOG 存在性 | `ERROR: plugins/learn-kit/CHANGELOG.md not found` |

### 4.2 Release — 自动发布（release.yml）

**触发条件**：VERSION 文件变更推送到 main（`paths: ['VERSION']`）

**流程**：

```
读取 VERSION → 验证格式 → 检查 tag 是否已存在
  ├── 已存在 → 跳过（幂等）
  └── 不存在 → 创建 tag → 从 CHANGELOG 提取发布说明 → 创建 GitHub Release
```

**幂等性**：如果 tag 已存在（如重复推送），workflow 不会创建重复 Release。

## 5. 版本升级场景

### 场景 A：仅插件变更

例：给 learn-kit 新增一个 skill

1. 在 `feature/xx-new-skill` 分支开发
2. 更新 `plugins/learn-kit/CHANGELOG.md` 的 `[Unreleased]`
3. 发布时 bump learn-kit: `-Scope "learn-kit" -From "1.0.0" -To "1.1.0"`
4. **Marketplace 版本不变**

### 场景 B：市场级变更

例：仅文档框架更新、仅 `.claude/skills/` 工作流 skill 调整、仅 CI workflow 改动

1. 更新根 `CHANGELOG.md` 的 `[Unreleased]`
2. 发布时 bump marketplace: `-From "4.3.0" -To "4.4.0"`
3. **plugin 版本不变**（除非也有变更）

### 场景 C：混合变更

1. 先 bump 变更的 plugin（learn-kit）
2. 再 bump marketplace 版本
3. 两层 CHANGELOG 各自更新

> v4.0.0 / v4.3.0 即典型混合变更示例：marketplace bump 至 4.0.0 / 4.3.0 + learn-kit bump 至 1.0.0 / 1.1.0。

## 6. 版本规则

| 规则 | 说明 |
|------|------|
| Feature/bugfix 分支**不**修改版本号 | 版本升级只在发布时执行 |
| 版本升级在 develop worktree 中执行 | `cd` 到 develop worktree 后操作，合并到 main 时触发自动发布 |
| VERSION 文件是 marketplace 版本的唯一权威源 | bump 脚本自动同步 marketplace.json |
| plugin.json 是各插件版本的唯一权威源 | bump 脚本自动同步 marketplace.json |

## 7. 相关文档

- [项目概览](<./[GUIDE]_Marketplace_Project_Overview.md>) — 项目整体概览
- [发布操作手册](<../runbook/[RUNBOOK]_Release_Operations.md>) — 发布操作手册
- [CONTRIBUTING.md](../CONTRIBUTING.md) — 贡献指南
