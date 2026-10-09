---
name: mp-flow-dogfood
description: "Use for marketplace installation and invocation acceptance / 本地验收: execute isolated tests and distinguish actual client results from static checks."
---

# mp-flow-dogfood

运行 npm run check:baseline-tools 和 npm run smoke:codex。冒烟使用隔离 HOME / CODEX_HOME / cache 和市场镜像，检查 diagram-kit / arch-diagram 与 understanding-kit / pop-quiz 的安装元数据。全部安装时普通 prompt 含 arch-diagram、glossary、concept，pop-quiz 显式加载另查 app-server 元数据与实际调用；开发技能只在仓库作用域发现，外部 cwd 不泄露。分别在 Codex CLI 0.147.0 与 ChatGPT 桌面端安装并实际调用公开技能：arch-diagram 检查图源、证据表、资源定位和 Python 结果；pop-quiz 按 [验收记录](../../../docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md) 检查只读、快照、未答不推进、诊断反馈和题量。把静态、发现、模型执行、Side Chat 和桌面端 UI 结果分开记录；未执行写明原因，不把发现成功称作行为通过。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

Explain Kit 单独/组合安装与解释行为按 [Explain Kit 验收](../../../docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 执行，Python 必须实际运行；能力限制如实记录，不要求 owner 例行手工操作。
