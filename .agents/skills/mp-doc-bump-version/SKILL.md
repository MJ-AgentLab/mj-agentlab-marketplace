---
name: mp-doc-bump-version
description: "Use for marketplace or plugin version preparation / 版本更新: inspect authoritative versions, execute dry-run, and apply only the authorized version transition."
---

# mp-doc-bump-version

读取 VERSION（marketplace）、plugins/diagram-kit/plugin.json 和 plugins/explain-kit/plugin.json 三个权威版本。README badge 是派生展示，市场索引不承载版本。先执行 scripts/bump-version.ps1 -From 当前版本 -To 已授权目标 -Scope marketplace、diagram-kit 或 explain-kit -DryRun；核对全部目标后由代理执行实际变更和验证。explain-kit 初始版本 0.1.0 已获授权，市场 8.0.1 和 diagram-kit 0.3.0 保持；后续版本转换须有对应授权，见 [Explain Kit ADR](../../../docs/adr/[ADR]_Explain_Kit_Addition.md)。正式发布仍需完整客户端验收、检查、独立批准与发布授权。learn-kit 已退役，不再 bump。CHANGELOG 与发布说明单独按实际版本更新，保留历史段。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
