---
type: guide
scope: marketplace
summary: "Agent-operated development and acceptance checklist"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.1
---

# [GUIDE] Agent execution checklist

按 [AI 工程规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) 执行已授权阶段。检查目标 worktree 和用户改动、具体 scope、当前 manifest/技能、A6 指令同步、历史链接、实际测试、隔离安装、调用证据、版本 dry-run、PR 的依赖与独立审查。

代理记录结果并修复可独立处理的问题；owner 只决定真正未决事项或必要外部身份，不承担例行手工执行。两插件单独/组合安装及新解释技能实际行为见 [验收记录](../runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。版本准备按已有授权执行；旧阶段决定见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。未完成桌面端验收继续限制正式发布，不把未执行项目打勾。
