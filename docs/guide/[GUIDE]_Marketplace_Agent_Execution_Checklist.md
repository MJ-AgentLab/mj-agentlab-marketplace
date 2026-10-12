---
type: guide
scope: marketplace
summary: "Agent-operated development and acceptance checklist"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-12
state: active
version: v2.4
---

# [GUIDE] Agent execution checklist

按 [AI 工程规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) 执行已授权阶段。检查目标 worktree 和用户改动、具体 scope、当前 manifest/技能、A6 指令同步、历史链接、实际测试、隔离安装、调用证据、版本 dry-run、PR 的依赖与独立审查。

代理记录结果并修复可独立处理的问题；owner 只决定真正未决事项或必要外部身份，不承担例行手工执行。Diagram、Understanding、Explain 既有结果见各自验收记录；Communication 原子集成候选的[验收契约](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)规定九组合安装与 S01–S12、C01–C18、必要双客户端基本可用性、R01–R05。版本准备按已有授权执行；旧阶段决定见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。未完成客户端验收继续限制对应 PR 与正式发布，不把未执行项目打勾。

Communication 阶段逐项确认以下条件：

- 候选为四插件五公开技能、20开发技能；新包/索引/严格集合/冻结资源/图标/安装预期同 PR 接入，已发布 main / v8.1.1 三插件范围另记。
- manifest 与原生 defaultPrompt 仅自身 communicate，Read/Write、布尔 false 显式策略；运行只读包内精选摘要，三份摘要哈希与真实来源状态可追溯。
- 九组合独立安装，源/缓存资源字节一致；全量普通3/原生5、Communication普通0/原生1、消费者无开发技能；Python 实际执行且无MCP。
- 固定案例记录多轮等待、保义、来源归属、完成范围、真实保存/回读与失败；两客户端记录候选身份、安装、图标/入口及必要交互。当前行为与客户端尚未验收，保持 NOT RUN 和 draft；失败不覆盖，以新批次复验。
- Refs #222 与依赖顺序明确，当前 head 的检查、非作者批准及解决线程满足实际门禁；Release published、身份一致及发布后 canonical 复查完成才关闭 Epic。

市场当前未发布8.1.2、新包0.1.0；Learning 先8.2.0，Communication 随后独立 minor（预计8.3.0），PR4 重查实际 From/To、基线及范围。现实场景效果测试本轮延期，不作基础上线门槛，也不由功能通过宣称效果已验证。

图标变更检查批准记录、可编辑源、实际小尺寸预览、字段/路径/解码、安装引用和内容一致性；新设计先选择再接入。品牌规则与实际限制见 [验收记录](../runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。

| Version | Date | Summary |
|---|---|---|
| v2.4 | 2026-10-12 | 原子集成、基础证据及正式发布条件；现实效果测试延期 |
