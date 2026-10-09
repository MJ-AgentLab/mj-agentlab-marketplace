---
name: mp-flow-author
description: "Use for marketplace plugin or skill implementation / 插件技能开发 under an approved plan; execute edits and preserve scope and evidence."
---

# mp-flow-author

按已批准范围修改根 portable plugin.json 与 skills/。市场只注册 diagram-kit，公开技能只有 arch-diagram；开发技能放 .agents/skills，配置放 .codex，通用脚本保留 scripts 的职责。frontmatter 用合法 YAML name/description，资源相对当前 SKILL.md locator 定位。OpenAI 展示字段放 extensions.com.openai；没有 MCP 需求时无需空配置。修改后运行 npm run validate 并核对授权范围。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
