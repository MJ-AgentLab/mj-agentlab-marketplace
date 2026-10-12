---
name: mp-flow-author
description: "Use for marketplace plugin or skill implementation / 插件技能开发 under an approved plan; execute edits and preserve scope and evidence."
---

# mp-flow-author

按已批准范围修改各插件根 portable plugin.json 与 skills/。当前市场注册 diagram-kit / arch-diagram 、understanding-kit / pop-quiz 、explain-kit / glossary、concept 与 html-guide-kit / guide；开发技能放 .agents/skills，配置放 .codex，通用脚本保留 scripts 的职责。frontmatter 用合法 YAML name/description，资源相对当前 SKILL.md locator 定位。OpenAI 展示字段放 extensions.com.openai；没有 MCP 需求时无需空配置。understanding-kit 的只读流程和对旧单插件约束的局部替代见 [新增 ADR](../../../docs/adr/[ADR]_Understanding_Kit_Addition.md)。修改后运行 npm run validate 并核对授权范围。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

解释技能按 [新增 ADR](../../../docs/adr/[ADR]_Explain_Kit_Addition.md) 实现；agents/openai.yaml 的自然启用策略为 true，保留 pop-quiz 显式策略。

新增插件、仓库主标或图标修改时使用 [mp-design-icon](../mp-design-icon/SKILL.md)，读取品牌规范、复用已有批准并核对候选选择及实际尺寸预览。

HTML Guide Kit 的新建只读文本和显式确认合同见 [ADR](../../../docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)。验证当前授权集合时，保持旧四种安装并增加HTML单独、与Explain及全部插件；guide和pop-quiz仅显式调用，普通提示仍仅三个自然启用技能。合并后运行修正按插件自身补丁推进，评审/安装/模型/客户端结果分别记录。
