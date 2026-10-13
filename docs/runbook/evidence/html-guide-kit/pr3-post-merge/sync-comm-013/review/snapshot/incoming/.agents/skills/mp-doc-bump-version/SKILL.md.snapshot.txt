---
name: mp-doc-bump-version
description: "Use for marketplace or plugin version preparation / 版本更新: inspect authoritative versions, execute dry-run, and apply only the authorized version transition."
---

# mp-doc-bump-version

读取 VERSION（marketplace）与各 plugins/*/plugin.json 的根 version（各插件权威）。README badge 是派生展示，市场索引不承载版本。先执行 scripts/bump-version.ps1 -From 当前版本 -To 已授权目标 -Scope marketplace、diagram-kit、learning-evidence-kit、explain-kit、html-guide-kit 或 communication-kit -DryRun；这里的 Scope 是版本工具参数，不是 Git 提交 scope。核对全部目标后由代理执行变更和验证。PR4 保持 market 8.1.2、Learning Evidence 0.1.0 / Diagram 0.3.1 / Explain 0.1.1；PR5 才准备已授权 8.2.0，公开 v8.1.1 仍为旧 Understanding。当前授权、分段入口和实际证据见 [新 ADR](../../../docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)及[验收账本](../../../docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。正式发布保留当前提交非作者批准、required checks、已解决审查线程和合格入口证据；延期项不写通过。发布后先同步 main，再只预升市场 VERSION/badge 为 8.2.1，不创建同号 Release。learn-kit 和退出候选的 understanding-kit 不再 bump；CHANGELOG 保留历史段。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

Explain Kit 初始 0.1.0 已获授权；后续版本转换依据权威文件、当前会话授权与 [Explain Kit ADR](../../../docs/adr/[ADR]_Explain_Kit_Addition.md)，不连带更新其他插件版本。

Communication 工具准备阶段只扩展候选 scope，尚未注册运行包。目标 manifest 缺失时，实际运行和 DryRun 都应零写入失败；不得为让工具通过而创建空插件。插件原子接入后才读取其真实版本，并按 Owner 已明确的转换执行。阶段及实测见 [品牌验收](../../../docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)，Refs #222。
