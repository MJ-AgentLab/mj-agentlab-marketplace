---
name: mp-doc-bump-version
description: "Use for marketplace or plugin version preparation / 版本更新: inspect authoritative versions, execute dry-run, and apply only the authorized version transition."
---

# mp-doc-bump-version

读取 VERSION（marketplace）与各 plugins/*/plugin.json 的根 version（各插件权威）。README badge 是派生展示，市场索引不承载版本。先执行 scripts/bump-version.ps1 -From 当前版本 -To 已授权目标 -Scope marketplace、diagram-kit、understanding-kit 或 explain-kit -DryRun；这里的 Scope 是版本工具参数，不是 Git 提交 scope。核对全部目标后由代理执行实际变更和验证。Understanding Kit 初始新增授权见 [ADR](../../../docs/adr/[ADR]_Understanding_Kit_Addition.md)，不能将该初始授权当成发布授权；当前版本、后续授权与候选状态从权威文件及 [8.1.0 发布记录](../../../docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md) 核实。历史版本准备顺序见 [迁移 ADR](../../../docs/adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。正式发布仍需完整客户端验收、检查、独立批准与发布授权。learn-kit 已退役，不再 bump。CHANGELOG 与发布说明按实际版本更新，保留历史段。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

Explain Kit 初始 0.1.0 已获授权；后续版本转换依据权威文件、当前会话授权与 [Explain Kit ADR](../../../docs/adr/[ADR]_Explain_Kit_Addition.md)，不连带更新其他插件版本。
