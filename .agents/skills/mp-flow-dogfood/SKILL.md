---
name: mp-flow-dogfood
description: "Use for marketplace installation and invocation acceptance / 本地验收: execute isolated tests and distinguish actual client results from static checks."
---

# mp-flow-dogfood

运行 npm run check:baseline-tools 和 npm run smoke:codex。冒烟使用隔离 HOME / CODEX_HOME / cache 和市场镜像，分别安装 diagram-kit、explain-kit、两个插件组合，公开技能数量依次为 1、2、3；19 个开发技能只在仓库作用域发现，外部 cwd 不泄露。分别在 Codex CLI 0.147.0 与 ChatGPT 桌面端验证 arch-diagram / glossary / concept，绘图检查图源、证据表、资源定位和真实 Python 结果，解释检查路由、受众、格式适应、事实及未知术语。按 [Explain Kit 验收](../../../docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 记录静态、发现、模型执行和桌面端 UI 结果；代理执行可用操作，不能执行时列明约束，不要求 owner 例行手工操作，不把发现成功称作行为通过。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
