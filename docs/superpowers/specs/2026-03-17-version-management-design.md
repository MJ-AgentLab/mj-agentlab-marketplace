# 插件市场版本管理基础设施设计

## Context

mj-agentlab-marketplace 当前仅有 2 个 commit，4 个插件 26 个 skill，全部 v1.0.0。无版本管理、CHANGELOG、CI/CD、git tag、release 脚本。需要建立完整的版本管理机制，并与 GitHub/Gitee 同步，复用 mj-system 的 bare repo + worktree 模式和 Git Flow 规范。

## 设计决策

| 决策 | 选择 |
|------|------|
| Repo 模式 | bare repo + worktree（与 mj-system 一致） |
| 版本粒度 | 独立版本管理（marketplace 整体 + 各插件独立） |
| 自动化范围 | bump 脚本 + CHANGELOG + GitHub Actions CI/CD |
| Clone 脚本 | marketplace 专用 `mj-agentlab-marketplace-clone-bare.ps1` |
| 插件归属 | 仅基础设施（脚本 + CI），不新增 skill/plugin |
| 远程仓库 | GitHub (origin) + Gitee (mirror: ranzuozhou/mj-agentlab-marketplace) |

## 文件清单（24 个新文件 + 1 个外部脚本 + 2 个文件更新）

### Phase 1 — 版本基础（3 文件）

| 文件 | 用途 |
|------|------|
| `VERSION` | marketplace 整体版本单一权威源，纯文本 `1.0.0` |
| `CHANGELOG.md` | 根级变更日志，Keep a Changelog 格式 |
| `scripts/bump-version.ps1` | 多目标版本升级脚本 |

### Phase 2 — 插件 CHANGELOG（4 文件）

| 文件 | 用途 |
|------|------|
| `plugins/mj-doc/CHANGELOG.md` | mj-doc 插件变更日志 |
| `plugins/mj-git/CHANGELOG.md` | mj-git 插件变更日志 |
| `plugins/mj-n8n/CHANGELOG.md` | mj-n8n 插件变更日志 |
| `plugins/mj-ops/CHANGELOG.md` | mj-ops 插件变更日志 |

### Phase 3 — GitHub 模板（13 文件）

| 文件 | 用途 |
|------|------|
| `.github/PULL_REQUEST_TEMPLATE.md` | 默认 PR 模板 |
| `.github/PULL_REQUEST_TEMPLATE/feature.md` | Feature PR 模板 |
| `.github/PULL_REQUEST_TEMPLATE/bugfix.md` | Bugfix PR 模板 |
| `.github/PULL_REQUEST_TEMPLATE/documentation.md` | Documentation PR 模板 |
| `.github/PULL_REQUEST_TEMPLATE/maintain.md` | Maintain PR 模板 |
| `.github/PULL_REQUEST_TEMPLATE/hotfix.md` | Hotfix PR 模板 |
| `.github/PULL_REQUEST_TEMPLATE/release.md` | Release PR 模板 |
| `.github/ISSUE_TEMPLATE/feature.md` | Feature Issue 模板 |
| `.github/ISSUE_TEMPLATE/bugfix.md` | Bugfix Issue 模板 |
| `.github/ISSUE_TEMPLATE/documentation.md` | Documentation Issue 模板 |
| `.github/ISSUE_TEMPLATE/maintain.md` | Maintain Issue 模板 |
| `.github/ISSUE_TEMPLATE/hotfix.md` | Hotfix Issue 模板 |
| `.github/ISSUE_TEMPLATE/config.yml` | Issue 模板选择器配置 |

### Phase 4 — CI/CD（2 文件）

| 文件 | 用途 |
|------|------|
| `.github/workflows/ci.yml` | PR 验证：结构校验 + Gitee 同步 |
| `.github/workflows/release.yml` | 发布自动化：tag + GitHub Release + Gitee 同步 |

### Phase 5 — 文档（1 文件）

| 文件 | 用途 |
|------|------|
| `docs/CONTRIBUTING.md` | 面向人类贡献者的分支策略 + commit 规范 + 版本管理 + 发布流程（与 mj-git skill 互补不重复，mj-git 是 Claude Code agent 行为规范） |

### Phase 6 — Clone 脚本（1 文件，仓库外）

| 文件 | 用途 |
|------|------|
| `../mj-agentlab-marketplace-clone-bare.ps1` | 专用 bare repo + worktree 克隆脚本 |

### Phase 7 — 现有文件更新（2 文件）

| 文件 | 变更 |
|------|------|
| `README.md` | 添加版本徽章、Contributing 链接、版本管理说明 |
| `.gitignore` | 添加 `*.bak`, `*.tmp` 等脚本输出模式 |

### Phase 8 — Git Hook（1 文件）

| 文件 | 用途 |
|------|------|
| `scripts/install-hooks.ps1` | commit-msg hook 安装器（验证 commit 格式） |

## 版本管理架构

### 版本存储位置

| 版本 | 权威源 | 同步目标 |
|------|--------|----------|
| Marketplace 整体 | `VERSION` | `.claude-plugin/marketplace.json` → `metadata.version` |
| mj-doc | `plugins/mj-doc/.claude-plugin/plugin.json` → `version` | `marketplace.json` → `plugins[name=mj-doc].version` |
| mj-git | `plugins/mj-git/.claude-plugin/plugin.json` → `version` | `marketplace.json` → `plugins[name=mj-git].version` |
| mj-n8n | `plugins/mj-n8n/.claude-plugin/plugin.json` → `version` | `marketplace.json` → `plugins[name=mj-n8n].version` |
| mj-ops | `plugins/mj-ops/.claude-plugin/plugin.json` → `version` | `marketplace.json` → `plugins[name=mj-ops].version` |

### bump-version.ps1 设计

**参数：**

```powershell
param(
    [Parameter(Mandatory=$true)]  [string]$From,
    [Parameter(Mandatory=$true)]  [string]$To,
    [ValidateSet("marketplace","mj-doc","mj-git","mj-n8n","mj-ops")]
    [string]$Scope = "marketplace",
    [switch]$DryRun
)
```

**Scope 行为：**

| Scope | 更新文件 |
|-------|----------|
| `marketplace` | `VERSION`, `.claude-plugin/marketplace.json`(metadata.version), `README.md` |
| `mj-git` | `plugins/mj-git/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`(plugins[name=mj-git].version) |
| 其他插件 | 同 mj-git 模式（路径为 `plugins/<name>/.claude-plugin/plugin.json`） |

**使用示例：**

```powershell
# 升级 marketplace 版本
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -DryRun
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0"

# 升级某个插件版本
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "mj-git"
```

### 版本升级场景

**场景 A：仅插件变更**（如给 mj-git 新增 skill）
1. 在 `feature/xx-new-skill` 分支开发
2. 更新 `plugins/mj-git/CHANGELOG.md` 的 `[Unreleased]`
3. 发布时 bump mj-git: `-Scope "mj-git" -From "1.0.0" -To "1.1.0"`
4. Marketplace 版本不变

**场景 B：市场级变更**（如新增插件）
1. 更新根 `CHANGELOG.md` 的 `[Unreleased]`
2. 发布时 bump marketplace: `-From "1.0.0" -To "1.1.0"`
3. 各插件版本不变

**场景 C：混合变更**
1. 先分别 bump 变更的插件
2. 再 bump marketplace 版本

## CI/CD 设计

### ci.yml — PR 验证

**触发：**
- push: `feature/*`, `bugfix/*`, `documentation/*`, `maintain/*`, `hotfix/*`
- pull_request: `develop`, `main`

**Jobs：**
1. `sync-to-gitee` — 推送到 Gitee 镜像
2. `validate` — 6 项结构校验

| 检查项 | 验证内容 |
|--------|----------|
| plugin.json 校验 | name, description, version, author, license, skills 字段 |
| marketplace.json 完整性 | 每个插件条目有对应目录 |
| SKILL.md 前置元数据 | YAML frontmatter 含 name + description（排除 `*-shared/` 等非 skill 目录） |
| 目录结构 | 每个插件含 `.claude-plugin/plugin.json`, CLAUDE.md, README.md, skills/（`.mcp.json` 为可选） |
| 版本一致性 | VERSION ↔ `.claude-plugin/marketplace.json`；`plugin.json` ↔ `.claude-plugin/marketplace.json` |
| CHANGELOG 存在性 | 根级 + 各插件级 |

### release.yml — 发布自动化

**触发：** push to `main`（仅当 `VERSION` 文件变更时）

```yaml
on:
  push:
    branches: [main]
    paths: ['VERSION']
```

**流程：**
1. 读取 `VERSION` 文件
2. 检查 tag 是否已存在（幂等，已存在则跳过整个 job）
3. 创建 git tag `vX.Y.Z`，推送到 origin + gitee
4. 从 `CHANGELOG.md` 提取版本发布说明
5. 创建 GitHub Release

## 分支策略

复用 mj-system Git Flow：

| 分支类型 | 用途 | 来源 |
|----------|------|------|
| `main` | 生产就绪（受保护） | — |
| `develop` | 集成主线（受保护） | — |
| `feature/*` | 新功能 | develop |
| `bugfix/*` | Bug 修复 | develop |
| `documentation/*` | 纯文档变更 | develop |
| `maintain/*` | 基础设施维护 | develop |
| `hotfix/*` | 紧急修复 | main |

**Commit 规范：** `<type>(<scope>): <summary>`
- Types: feat, fix, perf, refactor, test, docs, infra
- Scopes: mj-git, mj-doc, mj-n8n, mj-ops, ci, deps, scripts, marketplace（release 相关 commit 使用 `marketplace` scope）

## Clone-Bare 脚本

位置：`../mj-agentlab-marketplace-clone-bare.ps1`（与项目目录同级，同时也在仓库内保留一份 `scripts/clone-bare.ps1` 供新成员参考）

基于 mj-system-clone-bare.ps1，仅修改默认 GiteeUrl：

```powershell
param(
    [Parameter(Mandatory=$true)]   [string]$RepoUrl,
    [Parameter(Mandatory=$false)]  [string]$Branches = "develop",
    [Parameter(Mandatory=$false)]  [string]$GiteeUrl = "https://gitee.com/ranzuozhou/mj-agentlab-marketplace.git"
)
```

功能与 mj-system 脚本完全一致：bare clone → .git 指针 → worktree 创建 → Gitee 远程 → pushall alias。

## 实施提交序列

在 `maintain/add-version-management` 分支上执行：

| 顺序 | Commit | 文件 |
|------|--------|------|
| 1 | `infra(marketplace): add VERSION file and root CHANGELOG` | VERSION, CHANGELOG.md |
| 2 | `infra(marketplace): add plugin CHANGELOGs` | plugins/mj-{doc,git,n8n,ops}/CHANGELOG.md |
| 3 | `infra(scripts): add bump-version script` | scripts/bump-version.ps1 |
| 4 | `infra(ci): add CI validation workflow` | .github/workflows/ci.yml |
| 5 | `infra(ci): add release workflow` | .github/workflows/release.yml |
| 6 | `infra(marketplace): add PR and issue templates` | .github/PULL_REQUEST_TEMPLATE/, .github/ISSUE_TEMPLATE/ |
| 7 | `docs(marketplace): add contributing guide` | docs/CONTRIBUTING.md |
| 8 | `docs(marketplace): update README with version info` | README.md, .gitignore |
| 9 | `infra(scripts): add git hooks installer` | scripts/install-hooks.ps1 |

Clone-bare 脚本在仓库外单独管理。

## 前置条件

1. 在 GitHub 创建并设置 `develop` 分支为受保护分支
2. 配置 GitHub Secrets: `GITEE_USERNAME`, `GITEE_TOKEN`
3. 确认 Gitee 仓库 `ranzuozhou/mj-agentlab-marketplace` 已创建
4. 从 `main` 创建 `develop` 分支

## 验证方式

1. **版本升级验证**：运行 `bump-version.ps1 -DryRun` 确认文件修改预览正确
2. **CI 验证**：推送 feature 分支并创建 PR，确认 CI 通过
3. **Release 验证**：合并到 main，确认自动创建 tag 和 GitHub Release
4. **Clone-bare 验证**：使用脚本克隆项目，确认 worktree 和双远程配置正确
5. **Hook 验证**：运行 install-hooks.ps1，提交非规范 commit 确认被拒绝

## 故障处理

| 验证步骤 | 失败时处理 |
|----------|-----------|
| bump-version DryRun | 检查 -From 版本号是否与当前文件内容匹配 |
| CI 不通过 | 查看 GitHub Actions 日志，修复结构校验错误后重新推送 |
| Release 未触发 | 确认 VERSION 文件有变更且已推送到 main |
| Clone-bare 失败 | 检查网络连接、Gitee 仓库是否存在、Git 版本 ≥ 2.30 |
| Hook 未生效 | 确认 .git 指向正确（bare repo 场景下 hooks 在 .bare/hooks/） |
