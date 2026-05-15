# 贡献指南 — MJ AgentLab Marketplace

本文档面向人类贡献者，说明分支策略、提交规范、版本管理和发布流程。
Claude Code agent 行为规范请参考 [docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md](rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)（marketplace 11 阶段闭环 + Skill 矩阵）以及 `.claude/skills/mp-*/SKILL.md` 项目本地工作流 skill。

## 分支策略

采用 Git Flow 模型，与 [mj-system](https://github.com/MJ-AgentLab/mj-system) 保持一致。

### 永久分支

| 分支 | 用途 | 保护 |
|------|------|------|
| `main` | 生产就绪 | PR-only |
| `develop` | 集成主线 | PR-only |

### 临时分支

| 类型 | 来源 | 用途 |
|------|------|------|
| `feature/*` | develop | 新功能、新 Skill |
| `bugfix/*` | develop | Bug 修复 |
| `documentation/*` | develop | 纯文档变更 |
| `maintain/*` | develop | CI/CD、脚本、依赖维护 |
| `hotfix/*` | main | 紧急修复（PR 目标也是 main，合并后需同步 develop） |

### 命名规范

```
<type>/<issue-id>-<description>    # 有 Issue 时
<type>/<description>               # 无 Issue 时
```

示例：
- `feature/12-add-release-skill`
- `bugfix/25-commit-scope-error`
- `maintain/add-ci-workflow`

## 提交规范

简要约定:

- **格式**: `<type>(<scope>): <summary>` — 单行 header ≤72 字符，imperative mood，无句号
- **7 types**: `feat` / `fix` / `perf` / `refactor` / `test` / `docs` / `infra`
- **Marketplace scope whitelist (v4.x)**: `marketplace` / `learn-kit` / `ci` / `scripts` / `deps` / `infra` / `docs-rule` / `docs-adr` / `docs-guide` / `docs-runbook` / `docs-spec` / `release`
- **示例**: `feat(marketplace): add 18 mp-* workflow skills` / `infra(release): bump marketplace 4.1.0 → 4.2.0`

**完整规范**（含 branch × type 矩阵、commit 拆分指导、Co-Authored-By 模式、违规示例）见 [`docs/rule/[STANDARD]_Commit_Message_Convention.md`](rule/[STANDARD]_Commit_Message_Convention.md)。

CI / `/mp-git-commit` skill 按该 STANDARD 强制 enforcement。

## 版本管理

### 语义化版本

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：`MAJOR.MINOR.PATCH`

### 双层版本

| 层级 | 权威源 | 说明 |
|------|--------|------|
| Marketplace 整体 | `VERSION` 文件 | 新增/删除 Plugin、跨 Plugin 变更 |
| 各 Plugin 独立 | `plugins/<name>/.claude-plugin/plugin.json` | Plugin 内部变更 |

两者独立升级，互不影响。

### 版本升级

```powershell
# 升级 marketplace 版本
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -DryRun
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0"

# 升级某个 plugin 版本
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "learn-kit"
```

### 规则

- Feature/bugfix 分支**不**修改版本号
- 版本升级在 develop 分支上执行，合并到 main 时触发自动发布

## CHANGELOG 规范

格式：[Keep a Changelog](https://keepachangelog.com/zh-CN/)

- 根 `CHANGELOG.md`：Marketplace 级事件
- 各 Plugin `CHANGELOG.md`：Plugin 内部变更
- 所有变更先写入 `[Unreleased]`，发布时转为正式版本节
- 分类：Added / Changed / Fixed / Removed

## 发布流程

1. 在 develop 分支上 bump 版本号（marketplace 和/或各 plugin）
2. 更新 CHANGELOG.md：`[Unreleased]` → `[X.Y.Z] - YYYY-MM-DD`
3. Commit: `infra(marketplace): release v1.1.0`
4. 创建 PR：develop → main（使用 release PR 模板）
5. 合并后自动触发：创建 git tag → GitHub Release → Gitee 同步

## 回滚流程

如发布版本存在问题，按以下步骤回滚：

1. 从 main 创建 hotfix 分支修复问题
2. 修复后 bump 为 patch 版本（如 1.1.0 → 1.1.1）
3. 走正常的 hotfix PR 流程
4. 如需删除错误的 GitHub Release：`gh release delete vX.Y.Z --yes`
5. 如需删除错误的 tag：`git tag -d vX.Y.Z && git push origin --delete vX.Y.Z`

## Bare Repo + Worktree

本项目使用 bare repo + worktree 模式管理多分支：

```bash
# 首次克隆（使用专用脚本）
powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 \
  -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace

# 添加新分支 worktree
powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 \
  -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace \
  -Branches "feature/12-add-release-skill"
```

结构：
```
mj-agentlab-marketplace/
├── .bare/       # bare repo（共享对象库）
├── .git         # 指针文件 (gitdir: ./.bare)
├── develop/     # develop worktree
├── feature/     # feature 分支 worktree
└── main/        # main worktree
```

## Git Hooks

本项目提供 `commit-msg` git hook 在 commit 时校验消息格式（`<type>(<scope>): <summary>` + scope ∈ canonical 白名单）。Hook 是可选的——CI 也会跑同样的校验，hook 主要用于本地早发现违规。

### 首次安装

```powershell
pwsh -File scripts/install-hooks.ps1
```

Hook 安装到 bare repo 共享 hooks 目录（`.bare/hooks/commit-msg`），所有 worktree 共享。

### 升级（当 hook 规则变更时）

`scripts/install-hooks.ps1` 内置的 PATTERN regex 会随 [`docs/rule/[STANDARD]_Commit_Message_Convention.md`](rule/[STANDARD]_Commit_Message_Convention.md) §4 scope 白名单演进而变化（每次新增 / 移除合法 scope 都会同步更新）。**如果 CHANGELOG 提到 `install-hooks.ps1` 更新**，需要**重跑安装脚本**以同步本地 hook:

```powershell
pwsh -File scripts/install-hooks.ps1
```

> **已知历史**：v4.0.0 之前 hook 用 v3.x 的 `mj-sys-*` scope 白名单；v4.3.2 (PR #79) 更新为 v4.x canonical 白名单。如果你的本地 hook 是 v4.3.2 之前装的，会拒绝当前所有合法 v4.x scope commit；按上述命令重跑即可同步。

### 移除

```powershell
# 从 .bare/hooks/ 删除即可
Remove-Item (Join-Path ((Get-Content .git) -replace '^gitdir:\s*','').Trim() 'hooks/commit-msg')
```

### Canonical 来源

| 内容 | 来源 |
|------|------|
| Scope 白名单（hook PATTERN regex 应反映此清单） | [`docs/rule/[STANDARD]_Commit_Message_Convention.md`](rule/[STANDARD]_Commit_Message_Convention.md) §4 |
| Hook 安装脚本 | `scripts/install-hooks.ps1` |
| 测试 hook 行为 | `pwsh -c 'echo "feat(learn-kit): test" \| git hook run commit-msg /dev/stdin'`（hook 标准 git interface） |

## 推送

```bash
git push origin HEAD
```
