---
name: mp-flow-author
description: "Use for marketplace plugin or skill implementation / 插件技能开发 under an approved plan; execute edits and preserve scope and evidence."
---

# mp-flow-author

按已批准范围修改各插件根 portable plugin.json 与 skills/。当前候选注册 diagram-kit / arch-diagram、learning-evidence-kit / pop-quiz、learning-record-check 与 explain-kit / glossary、concept：三插件/五公开技能/两个显式学习策略。开发技能放 .agents/skills，配置放 .codex；Learning Evidence 共用 Python scripts 归属插件，安装后由实际 SKILL.md locator 定位，仓库 scripts/learning-evidence 过渡位置在 PR4 删除。frontmatter 用合法 YAML name/description，OpenAI 展示字段放 extensions.com.openai，没有 MCP 需求时无需空配置。新包边界见 [迁移 ADR](../../../docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)及[记录/API](../../../docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)：Pop Quiz 只读诊断，明确移交后共用保存；两阶段核验分开。精确校验不容纳未完成切换，修改后运行 npm run validate 并核对授权范围。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

解释技能按 [新增 ADR](../../../docs/adr/[ADR]_Explain_Kit_Addition.md) 实现；agents/openai.yaml 的自然启用策略为 true，保留 pop-quiz 显式策略。

新增插件、仓库主标或图标修改时使用 [mp-design-icon](../mp-design-icon/SKILL.md)，读取品牌规范、复用已有批准并核对候选选择及实际尺寸预览。
