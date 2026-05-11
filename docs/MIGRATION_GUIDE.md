# Migration Guide: v2.x → v3.0.0

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

**结构变化**：

| 元素 | 旧（mj-nlm）| 新（notebooklm-kit）|
|------|-----------|------------------|
| 插件目录 | `plugins/mj-nlm/` | `plugins/notebooklm-kit/` |
| Skill 文件夹 | `mj-nlm-auth/` / `mj-nlm-build/` / ... | `auth/` / `build/` / ...（去 `mj-nlm-` 前缀）|
| 共享目录 | `mj-nlm-shared/` | `_shared/`（下划线表示非 skill）|
| Slash 命令 | `/mj-nlm:learn-make` / `/mj-nlm:auth` / etc. | `/notebooklm-kit:learn-make` / `/notebooklm-kit:auth` / etc. |
| MCP server 名 | `notebooklm-mcp`（未变）| `notebooklm-mcp` |
| 历史 CHANGELOG | 保留原文，标注 rename note | 同上 |
| `author.name` | `ranzuozhou` | `ranzuozhou`（保留创作者归属）|

**对消费者的影响**：

1. 旧来源 `ranzuozhou/my-marketplace/mj-nlm` **仍可用**（my-marketplace 未删除该插件，用户可继续使用旧版本）
2. 新来源 `MJ-AgentLab/mj-agentlab-marketplace/notebooklm-kit` 提供同样的 v2.4.1 功能，名字和 slash 命令更新

**迁移消费者侧**（可选，由用户决定何时切换）：

```bash
# 1. 注册新 marketplace（若未注册）
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace

# 2. 安装新插件
/plugin install notebooklm-kit@mj-agentlab-marketplace

# 3.（可选）停用旧插件
# 编辑 ~/.claude/settings.json：
#   删除：mj-nlm@my-marketplace: true
#   增加：notebooklm-kit@mj-agentlab-marketplace: true

# 4. 用户记忆切换
# /mj-nlm:learn-make → /notebooklm-kit:learn-make
# /mj-nlm:auth → /notebooklm-kit:auth
# /mj-nlm:studio → /notebooklm-kit:studio
# 等等
```

## 新增：learn-kit

learn-kit 是全新插件 v0.1.0，提供把枚举型规则清单转化为人类可学习决策框架的 8 阶段方法论 + 模板 + scaffold 命令。

**起源**：从 mj-system 项目的 `learning/_meta/[LEARNING]_Rule_List_Interpretation_Authoring.md` v2.0 STANDARD-tier 方法论（N=5 跨域验证）剥离 MJ 引用通用化而来。

**使用**：

```
/plugin install learn-kit@mj-agentlab-marketplace
/learn-kit:init   # 在你项目根初始化 learning/ 子系统骨架
```

详见 [plugins/learn-kit/README.md](../plugins/learn-kit/README.md)。

## 时间线

| 日期 | 事件 |
|------|------|
| 2026-05-11 | v3.0.0 release 发布 |
| TBD | 用户可按需切换 ~/.claude/settings.json |
| TBD | mj-system / mj-agent 各自项目按需清理 settings + 文档 |

## 回滚路径

如果 v3.0.0 出现重大问题：

1. **Marketplace 回滚**：`git revert <v3.0.0-merge-commit>` → 发 v3.0.1 hotfix 恢复 v2.1.1 状态
2. **用户回滚**：把 `notebooklm-kit@mj-agentlab-marketplace` 改回 `mj-nlm@my-marketplace`（my-marketplace 未删除，立刻可用）
3. **mj-system / mj-agent 不受影响**：本次迁移不修改这两个项目，无回滚成本

## 询问

- Marketplace 相关 issue：[MJ-AgentLab/mj-agentlab-marketplace](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues)
- notebooklm-kit 相关：见插件 README
- learn-kit 相关：见插件 README
