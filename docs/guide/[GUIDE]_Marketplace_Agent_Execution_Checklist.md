---
type: guide
scope: marketplace
summary: "Agent-operated development and acceptance checklist"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-13
state: active
version: v2.5
---

# [GUIDE] Agent execution checklist

按 [AI 工程规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) 执行已授权阶段。检查目标 worktree 和用户改动、具体 scope、当前 manifest/技能、A6 指令同步、历史链接、实际测试、隔离安装、调用证据、版本 dry-run、PR 的依赖与独立审查。

代理记录结果并修复可独立处理的问题；owner 只决定未决事项或必要外部身份，不承担例行手工执行。旧 Diagram/Explain 四场景见 [历史验收](../runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)；新开发候选检查精确四插件/六技能/三显式策略，独立公开 8.2.0 候选仍三插件/五技能/两学习策略、包内共用 Python、保存库隔离和替身 GitHub 写入。按 [Learning Evidence 账本](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)独立记录合成角色、客户端和窗口证据，所有启用提问入口严格待答，原生持续显示不合格则延期；不把文字/pending 或未执行项打勾。Owner 已接受分段核心交付和双技能/接口不变，条件发布授权复用；GitHub 当前 head 非作者批准与 required checks 保留，Epic/延期和 Owner 最终接受分别追踪。

图标变更检查批准记录、可编辑源、实际小尺寸预览、字段/路径/解码、安装引用和内容一致性；新设计先选择再接入。品牌规则与实际限制见 [验收记录](../runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。
