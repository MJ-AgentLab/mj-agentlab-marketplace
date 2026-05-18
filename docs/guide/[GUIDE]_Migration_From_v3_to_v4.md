---
type: guide
scope: marketplace
summary: Marketplace migration guide — v2.x→v3.0.0 (general restructure) + v3.2.x→v4.0.0 (notebooklm-kit retirement) + v4.0.0→v4.3.x (doc framework rollout) + v4.4.x→v4.5.0 (§1 exemption cancellation)
owner: marketplace-maintainers
created: 2026-03-16
updated: 2026-05-18
state: active
version: v4.0
domain: release
tags:
  - migration
  - release
  - upgrade
related:
  - ../rule/[STANDARD]_Documentation_Framework.md
  - ../adr/[ADR]_NotebookLM_Kit_Retirement.md
  - ../adr/[ADR]_Documentation_Framework_Exemption_Reversal.md
revision: |
  2026-05-18 — v4.0: rename docs/MIGRATION_GUIDE.md → docs/guide/[GUIDE]_Migration_From_v3_to_v4.md + 加 frontmatter（Framework v1.5 §1 cancel single-file exemption）；§3 末尾加 v4.5.0 §1 exemption cancellation 说明；§3.2 path mapping 更新对应原 §1 豁免文件的新去向
---

# Migration Guide

This file covers four migrations:

- §1 — **v2.x → v3.0.0** (Original general restructure) — consumer-impactful
- §2 — **v3.2.x → v4.0.0** (notebooklm-kit 退场 + nlm-studio 吸收到 learn-kit) — consumer-impactful
- §3 — **v4.0.0 → v4.3.x** (doc framework rollout) — mostly **contributor-facing**
- §4 — **v4.4.x → v4.5.0** (Framework §1 exemption mechanism cancellation + learn-kit 1.1.0 → 1.2.0 docs 重组) — contributor-facing

---

# §1 · v2.x → v3.0.0

## Overview

`mj-agentlab-marketplace` v3.0.0 是一次 **major restructure**——marketplace 定位从 "MJ System 团队专属工具集" 变为 "通用 Claude Code 插件市场"。

**核心变化**：

| 变更类型 | 详情 |
|---------|------|
| 删除 | 5 个 mj-system / mj-agent 专属插件（mj-sys-doc / mj-sys-git / mj-sys-n8n / mj-sys-ops / mj-agent-code-doc） |
| 新增 | 1 个通用方法论 plugin `learn-kit` v0.1.0 |
| 迁入 + 重命名 | `mj-nlm` v2.4.1（原 ranzuozhou/my-marketplace）→ `notebooklm-kit` v2.4.1（mj-agentlab-marketplace） |
| metadata | description 重写 + version bump 2.1.1 → 3.0.0 |

最终插件清单：**notebooklm-kit + learn-kit** 两个通用插件。

## 旧插件去向

### mj-sys-doc / mj-sys-git / mj-sys-n8n / mj-sys-ops

这 4 个插件原本是 mj-system 项目的工作流自动化，已被 mj-system 项目迁回 **in-tree skills**（同 commit 演进，与代码紧耦合）。

**当前状态**：marketplace 端**已删除**（v3.0.0）。mj-system 项目内 `.claude/skills/mj-sys-*/SKILL.md` 是新家。

**对消费者的影响**：

- mj-system 项目用户：本地 settings.json 中如有 `mj-sys-*@mj-agentlab-marketplace` 启用条目，迁移后这些条目会是 **orphan plugin reference**（无害但建议清理）。mj-system 项目实际使用 in-tree skills（同名 + `mj-sys-` 前缀），无功能损失。
- 非 mj-system 项目用户：本就不应使用这些 MJ 专属插件；无影响。

**清理消费者侧**（可选，由项目维护者执行）：

```bash
# 在 mj-system 项目根
# 编辑 .claude/settings.json：删除 mj-sys-*@mj-agentlab-marketplace 条目
# 编辑 .claude/settings.local.json：同上
```

### mj-agent-code-doc

mj-agent 项目的 code-side 文档工作流插件，已被 mj-agent 项目迁回 in-tree skills。

**当前状态**：marketplace 端**已删除**（v3.0.0）。mj-agent 项目内 `.claude/skills/mj-agent-doc-author/SKILL.md` 等是新家。

**对消费者的影响**：

mj-agent 项目用户通常已通过 `settings.local.json` override 关闭该 marketplace 插件，转用 in-tree skills。删除后影响：

- `.claude/settings.json` 中 `mj-agent-code-doc@mj-agentlab-marketplace: true` → orphan reference
- `.claude/skills/mj-agent-doc-author/SKILL.md` 中 4 处 "coexist with marketplace mj-agent-code-doc-author" boundary 声明 → 可清理
- ADR-016 中如有相关引用 → 按需更新

**清理消费者侧**（可选）：

```bash
# 在 mj-agent 项目根
# 删除 .claude/settings.json + .local.json 中的条目
# 清理 SKILL.md 4 处文档级 boundary 声明
# 查 docs/adr/[ADR]_016_*.md
```

### mj-nlm → notebooklm-kit

`mj-nlm` v2.4.1 原本位于 `ranzuozhou/my-marketplace`。本次迁移到 `MJ-AgentLab/mj-agentlab-marketplace` 并重命名为 `notebooklm-kit`。

**功能保留 1:1**：7 个 skill 完整保留（auth / build / studio / query / manage / learn-make / learn-test）+ \_shared/ 公共内容；插件 plugin.json `version` 保持 2.4.1，未做版本 bump（迁移与升级解耦）。

> ⚠️ **v4.0.0 注**：`notebooklm-kit` 在 marketplace v4.0.0 整个退场（见 §2）。如本节描述的迁移路径已被 v4.0.0 进一步替换：用户应直接走 §2 的路径，不必再经过 v3.x 状态。

## 新增：learn-kit

learn-kit v0.1.0 是全新插件，提供 8 阶段方法论 + 模板 + scaffold 命令；后续 v0.2.0 加 locate + scan，v0.3.0 加 generate-tier。

## v3.0.0 时间线

| 日期 | 事件 |
|------|------|
| 2026-05-11 | v3.0.0 release 发布 |
| 2026-05-14 | v4.0.0（见 §2 进一步重构）|

---

# §2 · v3.2.x → v4.0.0

## Overview

`mj-agentlab-marketplace` v4.0.0 又一次 **major restructure**——把 v3.x 的 2 plugin 收敛为 1 plugin。`notebooklm-kit` 整个退场，其核心多媒体场景（build + studio + learn-make 的 audio/video/slide_deck/mind_map/infographic 5 类制品生成）吸收到 `learn-kit` 新增的 `nlm-studio` skill 中，并植入 **View-Purpose Preservation** 原则。

**核心变化**：

| 变更类型 | 详情 |
|---------|------|
| 删除 | `notebooklm-kit` 整个插件（v2.4.1，含 7 个 skill：auth / build / studio / learn-make / learn-test / manage / query + nlm-shared/ 10 份共享参考）|
| 新增 | `learn-kit/skills/nlm-studio/` —— 上传 3 tier .md + 3 tier .html 到 NotebookLM 出 5 类 × 3 view = 至多 15 个多媒体 artifact（在线浏览，不下载） |
| 迁 | `plugins/notebooklm-kit/.mcp.json` → `plugins/learn-kit/.mcp.json`（server name `notebooklm-mcp` 不变；MCP 工具前缀自然变化）|
| 改 | `/learn-kit:generate-tier` workflow 8-step → 10-step（HTML 渲染后加 step 9 可选 NLM 询问；原 step 9 (Summary) 改名 step 10）|
| version | marketplace `3.2.1 → 4.0.0`，learn-kit `0.3.1 → 1.0.0` |
| 决策记录 | [docs/[ADR]_NotebookLM_Kit_Retirement.md](<./[ADR]_NotebookLM_Kit_Retirement.md>) |

## 退役 skill 的替代方案

| v3.x notebooklm-kit skill | v4.0.0 替代方案 |
|---|---|
| `/notebooklm-kit:auth` | 直接在终端跑 `! nlm login`；`/learn-kit:nlm-studio` 内部 pre-flight 自动检查 auth，失败时给出 instruction |
| `/notebooklm-kit:build` | `/learn-kit:nlm-studio <topic>` 内部 Step 3 完成 source 上传（输入限定为 `learning/<topic>/` 3 tier 文件） |
| `/notebooklm-kit:studio` | `/learn-kit:nlm-studio <topic>` 内部 Step 4 完成 artifact 生成（4 view-cycled 类型 × 3 view + 1 shared mind_map = ≤13 artifact；不再支持 quiz / flashcards / data_table / report） |
| `/notebooklm-kit:learn-make` | `/learn-kit:nlm-studio <topic>` 等价场景（甚至更精细：View-Purpose Preservation） |
| **`/notebooklm-kit:learn-test`（quiz + flashcards）** | **无替代** —— 永久退役。如需评估学习效果，用外部工具或自建 |
| **`/notebooklm-kit:manage`（notebook 增删改 / 分享）** | **无替代** —— 直接用 notebooklm.google.com web UI 操作 |
| **`/notebooklm-kit:query`（跨 notebook 查询 / Deep Research）** | **无替代** —— 同上 |

## 工具前缀变化

v3.x 状态下 MCP 工具前缀（绑 plugin.json `name` 字段）：

```
mcp__plugin_notebooklm-kit_notebooklm-mcp__<tool>
```

v4.0.0 .mcp.json 迁到 learn-kit 后：

```
mcp__plugin_learn-kit_notebooklm-mcp__<tool>
```

server name `notebooklm-mcp` 不变；底层 `notebooklm-mcp` CLI 也不变；只是 Claude Code 加载位置变了。该变化对用户**透明**（只在 nlm-studio SKILL.md 的 allowed-tools 里显式出现）。

## 用户侧迁移步骤

### A. 升级到 v4.0.0

```
/plugin update learn-kit@mj-agentlab-marketplace
```

Claude Code 会按 marketplace.json 自动卸载 notebooklm-kit。

### B. 如曾安装 legacy `mj-nlm@my-marketplace` 也卸载

若你的 `~/.claude/settings.json` 中**额外**手动注册过 legacy `mj-nlm@my-marketplace` plugin（来自 ranzuozhou/my-marketplace），强烈建议卸载它 —— 否则会出现两个 MCP server 同名 `notebooklm-mcp` 重复加载，工具列表会显示两套前缀（`mj-nlm_*` 与 `learn-kit_*`），导致 Claude 困惑。

```
/plugin uninstall mj-nlm@my-marketplace
```

### C. NotebookLM 历史数据 / `nlm login` 状态

不受影响：

- `notebooklm.google.com` 上的 notebook + source + artifact **完全保留**（数据在 Google 端）
- `nlm` CLI 配置 / refresh token **完全保留**（缓存在用户本地 home 目录）

### D. 用户记忆切换

| 旧命令 | 新命令 |
|--------|--------|
| `/notebooklm-kit:learn-make <topic>` | `/learn-kit:nlm-studio <topic>` |
| `/notebooklm-kit:build <project>/<topic>` | `/learn-kit:nlm-studio <topic>` |
| `/notebooklm-kit:studio <notebook_id> audio` | `/learn-kit:nlm-studio <topic>`（产 5 类，含 audio）|
| `/notebooklm-kit:auth` | 终端 `! nlm login` |
| `/notebooklm-kit:learn-test <notebook_id>` | （无替代）|
| `/notebooklm-kit:manage delete <notebook_id>` | 浏览器打开 notebooklm.google.com 手动操作 |
| `/notebooklm-kit:query <notebook_id> <question>` | （无替代）|

### E. 已有的 learning/ 内容 / NotebookLM 工作流

如果你之前用 v3.x 的 `/learn-kit:generate-tier` 产出过 `learning/<topic>/` 目录（mj-system / mj-agent 等项目）：

- **完全兼容** v4.0.0 nlm-studio：直接调 `/learn-kit:nlm-studio <topic>` 即可
- Schema 无变化（generate-tier 仍产 3 md + 3 html；命名约定 `[LEARNING]_<topic>_{F,S,C}.{md,html}` 保持）。nlm-studio 自身只读 3 个 .md —— v1.0.0 dogfood 发现 NLM 对 HTML 源拒收，故 v4.0.0 起 nlm-studio 不上传 HTML。HTML 仍可用于人类浏览器本地查看

如果你曾用 v3.x 的 `/notebooklm-kit:learn-make` 在 NotebookLM 上创建过 notebook：

- 这些 notebook 在 google 端**保留**；可继续在 web UI 浏览
- 它们 **不会**自动迁移到 `learn-kit:<topic>` 命名 —— 如要让新 nlm-studio 看到现有 notebook，需手动在 web UI 重命名为 `learn-kit:<topic>`，或者跑一次 `/learn-kit:nlm-studio <topic>` 用 "create new notebook" 路径让 nlm-studio 创新的

## 回滚路径

如果 v4.0.0 出现重大问题：

1. **Marketplace 回滚**：`git revert <v4.0.0-merge-commit>` → 发 v4.0.1 hotfix 恢复 v3.2.1 状态
2. **用户回滚**：手动重新 `/plugin install notebooklm-kit@<old-commit>`（marketplace 历史 commit 仍包含 plugin 文件）
3. NotebookLM 端数据无影响

## v4.0.0 时间线

| 日期 | 事件 |
|------|------|
| 2026-05-14 | v4.0.0 release 发布 |

## 询问

- Marketplace 相关 issue：[MJ-AgentLab/mj-agentlab-marketplace](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues)
- learn-kit 相关：见 plugin README
- ADR 决策原因：见 [docs/adr/[ADR]_NotebookLM_Kit_Retirement.md](<./adr/[ADR]_NotebookLM_Kit_Retirement.md>)

---

# §3 · v4.0.0 → v4.3.x

## Overview & Audience

v4.0.0 → v4.3.4 是一系列 8 个 PR 的 doc framework rollout，**不改变任何 plugin 行为或 marketplace 公开 surface**。learn-kit 的 5 skills 行为完全不变；end-user 通过 `/plugin install learn-kit@mj-agentlab-marketplace` 拿到的体验在 v4.0.0 与 v4.3.4 之间无任何差异（除了 plugin.json `description` 字段提到的新增 plugin-internal docs framework metadata）。

**本节适用于**：

- **Marketplace 仓贡献者**：本地有 worktree、git hook、scripts/、docs/ 引用、CHANGELOG 习惯被 v4.x rollout 影响的开发者
- **下游消费者**：基本无影响。如果你只是 `/plugin install learn-kit`，可跳过本节
- **Plugin 引用 marketplace docs 的项目**：如果你在外部项目的文档里有 `https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/main/docs/...` 链接，需校对路径（见 §3.2 子节）

## §3.1 Release-by-Release 速查表

| Version | PR | 用户行动 (contributor) | 用户行动 (consumer) |
|---------|-----|------------------------|---------------------|
| **v4.1.0** | #74 | 拉最新 develop 后 `.claude/skills/mp-*/` 18 件项目本地 Track C skill 自动可用；可选 `/plugin list` 验证发现 | 无（plugin 行为不变） |
| **v4.2.0** | #75 | 阅读新 3 个 STANDARD（Documentation Framework / Commit Message / GitHub Markdown）作为之后 doc 工作的依据；新 docs 用 6 个 templates 起草 | 无 |
| **v4.2.1** | #76 | **docs 路径已搬迁**：`docs/[STANDARD]_*.md` / `docs/[GUIDE]_*.md` / `docs/[RUNBOOK]_*.md` / `docs/[ADR]_*.md` 全部移到 `docs/{rule,guide,runbook,adr}/` 子目录。如有外部链接 / 内部 grep 脚本依赖旧 path 需更新 | 极小影响：仅 GitHub 上的 docs URL bookmark 失效 |
| **v4.3.0** | #77 | **plugin-internal ADR 已迁移**：`docs/adr/[ADR]_LearnKit_Discovery_Skills.md` → `plugins/learn-kit/docs/adr/[ADR]_LearnKit_Discovery_Skills.md`。`plugins/learn-kit/docs/INDEX.md` 是 plugin-internal docs 新入口 | 极小影响：仅 ADR URL bookmark 失效 |
| **v4.3.1** | #78 | `/learning/` 进 .gitignore：在 marketplace worktree 内跑 `/learn-kit:init` 后产出物不再误入 git index。如本地 develop worktree 已有 `learning/` tracked 内容，需手动 `git rm -r --cached learning/` 一次后再 commit | 无 |
| **v4.3.2** | #79 | **真 bug 修复，需用户行动**：scripts/bump-version.ps1 + scripts/install-hooks.ps1 PATTERN regex 与 v3.x scope 白名单脱钩。如曾跑过 `pwsh -File scripts/install-hooks.ps1` 装过 commit-msg hook，**必须重跑**否则当前 v4.x scope commit 会被 hook reject。详见 v4.3.4 加的 CONTRIBUTING § Git Hooks 段。`scripts/bump-version.ps1 -Scope "learn-kit"` 现在合法（v3.x 时会 ValidateSet error） | 无 |
| **v4.3.3** | #80 | Documentation Framework v1.0 → v1.1：codify 「plugin-internal teaching series」§1 豁免条款；不动现有 doc 行为；plugin-internal teaching docs (`plugins/learn-kit/docs/learn-kit-*.md` 6 件) **正式**豁免 frontmatter 要求 | 无 |
| **v4.3.4** | #81 | CONTRIBUTING.md § Git Hooks 段已加入。新 contributor 直接读该段；老 contributor 如 v4.3.2 重跑过 hook 可忽略 | 无 |

## §3.2 路径搬迁速查表 (v4.2.1)

如果你的外部链接 / 文档 / 脚本引用 marketplace 文档，按下表更新：

| 旧路径 (pre-v4.2.1) | 新路径 (v4.2.1+) |
|---------------------|-------------------|
| `docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` | `docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` |
| `docs/[GUIDE]_Marketplace_Project_Overview.md` | `docs/guide/[GUIDE]_Marketplace_Project_Overview.md` |
| `docs/[GUIDE]_Plugin_Development_Testing_Workflow.md` | `docs/guide/[GUIDE]_Plugin_Development_Testing_Workflow.md` |
| `docs/[GUIDE]_Version_Management.md` | `docs/guide/[GUIDE]_Version_Management.md` |
| `docs/[GUIDE]_Marketplace_Agent_Execution_Checklist.md` | `docs/guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md` |
| `docs/[RUNBOOK]_Release_Operations.md` | `docs/runbook/[RUNBOOK]_Release_Operations.md` |
| `docs/[ADR]_NotebookLM_Kit_Retirement.md` | `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md` |
| `docs/[ADR]_LearnKit_Discovery_Skills.md` (v4.2.1) | `plugins/learn-kit/docs/adr/[ADR]_LearnKit_Discovery_Skills.md` (v4.3.0+ — moved to plugin-internal) |
| `docs/INDEX.md` | **不变**（保留名 + v4.5.0 起加 8 字段 frontmatter）|
| `docs/CONTRIBUTING.md` | **v4.5.0 rename** → `docs/guide/[GUIDE]_Contributing.md`；**v4.6.3 restore** → repo-root `CONTRIBUTING.md`（per Framework v1.6 §1.1）；v4.5.0 guide 版本 archive 至 `docs/archive/[DEPRECATED]_[GUIDE]_Contributing_v1.1.md` |
| `docs/MIGRATION_GUIDE.md` | **v4.5.0 rename** → `docs/guide/[GUIDE]_Migration_From_v3_to_v4.md`（即本文档）|
| `docs/ai_engineering_execution_hitl_workflow.md` | **v4.5.0 删除** — 关键内容内化到 `[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` §0 |
| `plugins/learn-kit/docs/learn-kit-{01..05}-*.md` + `learn-kit-使用手册.md`（v4.4.x exempt teaching series）| **v4.5.0 合并 + 拆分** — 合并为 `plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_{Pedagogy,Design}.md`；用户手册内容拆入 README + CLAUDE.md |

## §3.3 Commit-msg Hook 升级 (v4.3.2) — 最重要的用户操作

如果你曾装过本仓库的 commit-msg hook，**必须重跑安装命令**：

```powershell
pwsh -File scripts/install-hooks.ps1
```

**为什么**：v4.0.0 之前 hook PATTERN regex 是 v3.x 的 `mj-sys-*` scope 白名单；v4.3.2 (PR #79) 修复为 v4.x canonical 白名单（`learn-kit | marketplace | ci | scripts | deps | infra | docs-rule | docs-adr | docs-guide | docs-runbook | docs-spec | release`）。如果不重跑，本地装的旧 hook 会拒绝所有合法 v4.x commit。

**如何判断 hook 是否过期**：

```powershell
# PowerShell: 解析 worktree pointer 找 hooks dir
$hooksDir = Join-Path ((Get-Content .git) -replace '^gitdir:\s*','').Trim() 'hooks'
Select-String -Pattern '^PATTERN=' (Join-Path $hooksDir 'commit-msg')
# v4.x 正确版本应含: learn-kit|marketplace|ci|scripts|deps|infra|docs-rule|...
# 旧版含: mj-sys-git|mj-sys-doc|mj-sys-n8n|mj-sys-ops|... → 需重跑安装
```

完整 hook 维护指南：[Contributing § Git Hooks](<../../CONTRIBUTING.md#git-hooks>) (v4.3.4 加入；v4.6.3+ 路径回归 repo root)。

## §3.4 Scripts API 变化 (v4.3.2)

`scripts/bump-version.ps1` 的 `-Scope` ValidateSet 变化:

| Scope | v3.x ValidateSet | v4.x ValidateSet |
|-------|------------------|------------------|
| `marketplace` | ✅ | ✅ |
| `mj-sys-doc` / `mj-sys-git` / `mj-sys-n8n` / `mj-sys-ops` | ✅ | ❌ (retired) |
| `learn-kit` | ❌ (didn't exist) | ✅ |

任何 scripted 调用 `bump-version.ps1 -Scope "mj-sys-git"` 现在会失败 (PowerShell parameter validation error)。改用 `-Scope "learn-kit"`。

> Note: 实际上自 v4.0.0 起 v3.x 4 个 mj-sys-* plugin 已不存在，所以 v3.x ValidateSet 即使保留也是死代码 —— 之前调用就找不到目标 file 也会失败，只是失败方式不同。

## §3.5 Plugin-Internal Docs Framework 引入 (v4.3.0, v4.3.3)

如果你**给 learn-kit 加新 plugin-internal 文档**：

- **架构决策** → `plugins/learn-kit/docs/adr/[ADR]_<Title>.md`（含 frontmatter）
- **使用指南** → `plugins/learn-kit/docs/guide/[GUIDE]_<Title>.md`（含 frontmatter）
- **技术规格** → `plugins/learn-kit/docs/spec/[SPEC]_<Title>.md`（含 frontmatter）
- **教学系列**（顺序教程，文件名以 `learn-kit-` 开头） → `plugins/learn-kit/docs/learn-kit-NN-<Title>.md`（**不需要** frontmatter；v1.1 framework §1 豁免，per 3-point criteria）

如果你**给 marketplace 顶层加新文档**：

- 走 `docs/{rule,guide,runbook,adr,spec,postmortem}/` 子目录 + 完整 frontmatter（参考 `docs/_templates/`）
- 跨 plugin / 治理性质 ADR 留在 marketplace `docs/adr/`；plugin-internal 决策放在 plugin 自己的 `docs/adr/`

完整 framework: [`docs/rule/[STANDARD]_Documentation_Framework.md`](<./rule/[STANDARD]_Documentation_Framework.md>) v1.1.

## §3.6 Commit Convention v1.0 (v4.2.0+)

旧的 `docs/CONTRIBUTING.md` § 提交规范 表格已抽到独立 STANDARD：

- **新位置**：[`docs/rule/[STANDARD]_Commit_Message_Convention.md`](<./rule/[STANDARD]_Commit_Message_Convention.md>)
- **CONTRIBUTING.md § 提交规范**：简化为 5 行 summary + 指向 STANDARD 的链接

如果你的 fork / mirror 还在引用 CONTRIBUTING.md 的旧表格行号，需要重新定位到 STANDARD。

## §3.7 时间线

| 日期 | Version | PR | 主题 |
|------|---------|-----|------|
| 2026-05-15 | v4.1.0 | #74 | 18 件项目本地 mp-* skill + HITL Standard v1.1 |
| 2026-05-15 | v4.2.0 | #75 | Doc Framework Foundation (3 STANDARDs + 6 templates + 2 SPECs) |
| 2026-05-15 | v4.2.1 | #76 | Doc Framework Retrofit (8 docs into subdirs) |
| 2026-05-15 | v4.3.0 | #77 | Plugin Extension (learn-kit docs framework) |
| 2026-05-15 | v4.3.1 | #78 | `.gitignore /learning/` |
| 2026-05-15 | v4.3.2 | #79 | Content drift + 2 script bugs |
| 2026-05-15 | v4.3.3 | #80 | Framework v1.0 → v1.1 |
| 2026-05-15 | v4.3.4 | #81 | CONTRIBUTING § Git Hooks |
| 2026-05-15 | v4.3.5 | #82 | 本 PR (MIGRATION_GUIDE §3 添加) |

## §3.8 回滚指引（如果需要）

整个 v4.0.0 → v4.3.x 系列没有不可逆改动；任一 commit 都可 `git revert` 单独撤回。**Plugin 行为完全不变**：learn-kit 1.1.0 与 1.0.0 在外部用户视角下等价（仅 plugin.json description metadata 变长，加了 plugin-internal docs framework 段描述）。

如要从 v4.3.4 完整回滚到 v4.0.0（极端情况），按 commit 倒序 revert 8 个 PR 即可。但实际上这没有 use case —— rollout 是 additive 的。

## §3.9 询问

- 8 PR 详细 CHANGELOG: 见 [CHANGELOG.md](../../CHANGELOG.md) `[4.1.0]` 到 `[4.3.5]` 段
- Doc Framework 规范: [`../rule/[STANDARD]_Documentation_Framework.md`](../rule/[STANDARD]_Documentation_Framework.md)
- 18 件 mp-* skill 工作流编排: [`../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)

---

# §4 · v4.4.x → v4.5.0

## Overview

v4.5.0 是一次 governance refactor —— **取消 Documentation Framework v1.1 §1 豁免机制 + 顺势重组 learn-kit/docs**。Plugin 行为对终端用户**无变化**；主要是 doc 体系收紧 + plugin-internal docs 重组。

## 用户面影响（终端用户 / plugin install user）

| 维度 | 影响 |
|------|------|
| `/learn-kit:*` skill 触发 / 行为 | **无变化** |
| `/plugin install learn-kit@mj-agentlab-marketplace` | 装到 v1.2.0；功能等价 v1.1.0 |
| README / 安装步骤 | README 中文 TL;DR / 5-min flow / Worked Cases / Troubleshooting **新增内容** |
| 多媒体生成 | 无变化（同 v1.0.0+ 设计）|

## Contributor 面影响

### Doc Framework v1.4 → v1.5

§1 完全重写: 取消 v1.1 「plugin-internal teaching series」pattern exemption + 4 项 v1.1 single-file exemption（INDEX 保留名加 frontmatter；CONTRIBUTING + MIGRATION_GUIDE rename 到 docs/guide/[GUIDE]_*.md；ai_engineering_execution_hitl_workflow.md 删除 + 内容内化）。保留 5 类 community/external-spec exclusion（README / CHANGELOG / CLAUDE.md / SKILL.md / templates+references）由外部规范刚性约束不可绕过。

完整决策见 [`../adr/[ADR]_Documentation_Framework_Exemption_Reversal.md`](../adr/[ADR]_Documentation_Framework_Exemption_Reversal.md)。旧决策 ADR 已归档至 [`../archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md`](../archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md)。

### HITL STANDARD v1.3 → v1.4

§0 重写为 Universal Skeleton + Compression Heritage（浓缩 19 步骤 universal skeleton + universal → marketplace 11 阶段 compression mapping + fork guidance）；原 §0「适用范围 / Working-doc 边界」迁移到 §0.4 Scope；移除所有 cross-project 引用（marketplace 独立性原则）。

### learn-kit 1.1.0 → 1.2.0

`plugins/learn-kit/docs/` 6 份 lowercase 教学系列合并为 2 份合规 `[GUIDE]_*`:

| 旧 | 新 |
|------|------|
| `learn-kit-01-positioning.md` + `learn-kit-02-eight-stage-methodology.md` + `learn-kit-03-rfc-2119-worked-example.md` | `docs/guide/[GUIDE]_LearnKit_Pedagogy.md` |
| `learn-kit-04-three-skills.md` + `learn-kit-05-governance-boundary.md` | `docs/guide/[GUIDE]_LearnKit_Design.md` |
| `learn-kit-使用手册.md` | 拆入 `plugins/learn-kit/README.md`（§中文 TL;DR + §Worked Cases + §Troubleshooting）+ `plugins/learn-kit/CLAUDE.md`（§Advanced Tips）|

### Contributor 操作

- 如果你 fork / 自动化引用了任何被删 / 改名文件路径，需要更新到新路径
- commit hook PATTERN regex 无变化（仍是 v4.3.2 制定的 v4.x canonical 白名单）；不需要重跑 install-hooks.ps1
- 如果你引用过 `docs/CONTRIBUTING.md` / `docs/MIGRATION_GUIDE.md` 原路径，重定向到 `docs/guide/[GUIDE]_*.md`

## §4.1 时间线

| 日期 | Version | PR | 主题 |
|------|---------|-----|------|
| 2026-05-17 | v4.4.10 | #95 | maintain: develop sync |
| 2026-05-17 | v4.4.11 | #97 / #98 | maintain: release sync |
| 2026-05-17 | （内部）| #99 | docs: flat archive layout（Framework v1.3 → v1.4 + RUNBOOK v1.0 → v1.1）|
| 2026-05-17 | （内部）| #100 | docs: HITL v1.2 → v1.3 archive integration |
| 2026-05-18 | **v4.5.0** | （本 PR）| **docs governance refactor**: Framework v1.4 → v1.5 cancel §1 exemptions + HITL v1.3 → v1.4 universal skeleton §0 + learn-kit 1.1.0 → 1.2.0 + 7 superseded doc deletions |

## §4.2 回滚指引

v4.5.0 涉及 7 个文件删除 + 3 个 git mv rename + 14 个 edit。回滚需 revert 整个 PR。**Plugin 行为零变化**，外部用户无回滚 use case；仅 contributor 工作流如需 fork 旧版本 docs 体系才考虑回滚。
