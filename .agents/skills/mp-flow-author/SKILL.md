---
name: mp-flow-author
description: "Use for marketplace plugin or skill implementation / 插件技能开发 under an approved plan; execute edits and preserve scope and evidence."
---

# mp-flow-author

按已批准范围修改各插件根 portable plugin.json 与 skills/。当前市场注册 diagram-kit / arch-diagram 、understanding-kit / pop-quiz 与 explain-kit / glossary、concept；开发技能放 .agents/skills，配置放 .codex，通用脚本保留 scripts 的职责。frontmatter 用合法 YAML name/description，资源相对当前 SKILL.md locator 定位。OpenAI 展示字段放 extensions.com.openai；没有 MCP 需求时无需空配置。understanding-kit 的只读流程和对旧单插件约束的局部替代见 [新增 ADR](../../../docs/adr/[ADR]_Understanding_Kit_Addition.md)。修改后运行 npm run validate 并核对授权范围。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

解释技能按 [新增 ADR](../../../docs/adr/[ADR]_Explain_Kit_Addition.md) 实现；agents/openai.yaml 的自然启用策略为 true，保留 pop-quiz 显式策略。
