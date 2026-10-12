---
name: mp-flow-author
description: "Use for marketplace plugin or skill implementation / 插件技能开发 under an approved plan; execute edits and preserve scope and evidence."
---

# mp-flow-author

按已批准范围修改各插件根 portable plugin.json 与 skills/。PR3 候选包含 Diagram、Understanding、Explain 与 Communication；开发技能放 .agents/skills，配置放 .codex，通用脚本保留 scripts 的职责。frontmatter 用严格 YAML name/description，资源相对当前 SKILL.md locator 定位。OpenAI 展示字段放 extensions.com.openai；无 MCP 需求保持无服务配置。understanding-kit 的只读流程和对旧单插件约束的局部替代见 [新增 ADR](../../../docs/adr/[ADR]_Understanding_Kit_Addition.md)。修改后运行 npm run validate 并核对授权范围。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

解释技能按 [新增 ADR](../../../docs/adr/[ADR]_Explain_Kit_Addition.md) 实现；agents/openai.yaml 的自然启用策略为 true，保留 pop-quiz 显式策略。

Communication 实现先读[行为契约](../../../docs/spec/[SPEC]_Communication_Communicate.md)：communicate 为唯一显式入口，Read/Write，manifest/原生提示仅自身，allow_implicit_invocation 为布尔 false；关键缺口等待、保义和明确文件请求后的执行/回读按契约实现。插件、注册、严格校验、冻结摘要/记录、图标与安装预期原子接入。来源精选为原创 Lab Proposal / Informative 摘要，记录实际脏状态与源字节身份，重算三份包内摘要哈希；研究路径只追溯。完成工程修改后按[验收契约](../../../docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)记录实际验证、失败及未覆盖项，缺项保持对应 draft。

新增插件、仓库主标或图标修改时使用 [mp-design-icon](../mp-design-icon/SKILL.md)，读取品牌规范、复用已有批准并核对候选选择及实际尺寸预览。
