# Documentation Index — MJ AgentLab Marketplace

Navigation hub for all marketplace documentation.

## Guides

| Document | Description |
|----------|-------------|
| [Marketplace Project Overview](<./[GUIDE]_Marketplace_Project_Overview.md>) | 项目架构、插件目录、CI/CD 体系、开发环境搭建 |
| [Plugin Development Testing Workflow](<./[GUIDE]_Plugin_Development_Testing_Workflow.md>) | 跨仓库插件开发测试的三阶段工作流 |
| [Version Management](<./[GUIDE]_Version_Management.md>) | 双层版本架构、bump 工具、CHANGELOG 规范 |
| [Marketplace Agent Execution Checklist](<./[GUIDE]_Marketplace_Agent_Execution_Checklist.md>) | STANDARD 的运行时勾选清单——11 stage × 4 段（Entry / Actions / Verification / Exit） |

## Standards

| Document | Description |
|----------|-------------|
| [AI Engineering Execution HITL Prompt](<./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md>) | marketplace 自有 HITL 规范——11 阶段闭环 + Prompt 通用结构 + HITL 触发规则 + Hybrid Skill 矩阵 |
| [AI Engineering HITL Workflow (Generic)](./ai_engineering_execution_hitl_workflow.md) | plugin-agnostic / domain-agnostic 哲学锚点；18 步通用版工作流 + 14 个可复用 HITL prompt。本 marketplace 的 specialized STANDARD（上一行）即基于此 fork 而来 |

## Runbooks

| Document | Description |
|----------|-------------|
| [Release Operations](<./[RUNBOOK]_Release_Operations.md>) | 从开发到发布的完整操作流程 |

## Architecture Decision Records

| Document | Description |
|----------|-------------|
| [ADR: learn-kit Discovery & Locate Skills](<./[ADR]_LearnKit_Discovery_Skills.md>) | v3.1.0 增加 locate + scan 两个 skill 的决策；为什么不引入 manifest / 持久化缓存 |
| [ADR: NotebookLM Kit Retirement](<./[ADR]_NotebookLM_Kit_Retirement.md>) | v4.0.0 删除 notebooklm-kit 整个插件 + 把核心 build / studio 多媒体场景吸收到 learn-kit `/learn-kit:nlm-studio` 的决策；备选方案与代价 |

## Contributing

| Document | Description |
|----------|-------------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 分支策略、提交规范、版本管理、发布流程 |

## Plugin References

> v4.0.0 起 marketplace 仅含 1 个 plugin（learn-kit）。learn-kit `nlm-studio` skill 需要 `notebooklm-mcp` MCP server（plugin 内自带 `.mcp.json`）+ 一次性 `nlm login`；其余 4 个 skill 零外部依赖。详见 [plugins/learn-kit/README.md](../plugins/learn-kit/README.md) 与 [plugins/learn-kit/CLAUDE.md](../plugins/learn-kit/CLAUDE.md)。

### learn-kit 用户文档（`plugins/learn-kit/docs/`）

6 份学习材料覆盖「5 分钟上手 → 定位 → 方法论 → RFC 范例 → 5 skills 分工 → 治理边界」完整路径，详见 [plugins/learn-kit/docs/](../plugins/learn-kit/docs/) 或 plugin README 的 §学习材料 段。

## Suggested Reading Order

### New Team Members

1. [Marketplace Project Overview](<./[GUIDE]_Marketplace_Project_Overview.md>) — 了解整体架构
2. [CONTRIBUTING.md](./CONTRIBUTING.md) — 了解贡献规范
3. [Version Management](<./[GUIDE]_Version_Management.md>) — 了解版本体系

### Plugin Developers

1. [Marketplace Project Overview](<./[GUIDE]_Marketplace_Project_Overview.md>) — 插件结构和技能链
2. [AI Engineering Execution HITL Prompt](<./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md>) — AI agent 工作流规范（v3.2.0 起）
3. [Marketplace Agent Execution Checklist](<./[GUIDE]_Marketplace_Agent_Execution_Checklist.md>) — STANDARD 的勾选清单（执行时对照用）
4. [Plugin Development Testing Workflow](<./[GUIDE]_Plugin_Development_Testing_Workflow.md>) — 开发测试流程
5. [CONTRIBUTING.md](./CONTRIBUTING.md) — 提交和 PR 规范

### Release Managers

1. [Version Management](<./[GUIDE]_Version_Management.md>) — bump 工具和 CHANGELOG
2. [Release Operations](<./[RUNBOOK]_Release_Operations.md>) — 发布操作手册
