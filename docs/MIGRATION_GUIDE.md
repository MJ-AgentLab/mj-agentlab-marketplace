# Migration Guide

This file covers two major migrations:

- §1 — **v2.x → v3.0.0** (Original migration: MJ-system专属重构为通用)
- §2 — **v3.2.x → v4.0.0** (notebooklm-kit 退场 + nlm-studio 吸收到 learn-kit)

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
| `/notebooklm-kit:studio` | `/learn-kit:nlm-studio <topic>` 内部 Step 4 完成 artifact 生成（5 类 × 3 view = ≤15 artifact；不再支持 quiz / flashcards / data_table / report） |
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
- Schema 无变化（仍是 3 md + 3 html / `[LEARNING]_<topic>_{F,S,C}.{md,html}` 命名约定）

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
- ADR 决策原因：见 [docs/[ADR]_NotebookLM_Kit_Retirement.md](<./[ADR]_NotebookLM_Kit_Retirement.md>)
