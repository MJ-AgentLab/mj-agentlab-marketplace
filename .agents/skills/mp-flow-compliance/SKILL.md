---
name: mp-flow-compliance
description: "Use after marketplace plugin or skill changes / 合规检查 to validate manifests, skill metadata, directory structure and documented contracts."
---

# mp-flow-compliance

运行 npm run validate 检查市场、各 portable manifest、公开和开发技能的 YAML、名称/描述预算、资源路径和当前文档。核对索引中的三插件、四公开技能和 20 个开发技能，避免固定旧单插件数量。运行受影响的有行为意义的测试；Python 校验器的执行测试不能用静态字符串扫描代替。A6 触发集合以 scripts/check-a6.mjs 为准，更新根 AGENTS.md。输出错误、已验证项和剩余限制，修复错误后重跑受影响检查。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

解释技能的展示入口、自然路由和包内资源必须一致，验收依据见 [记录](../../../docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。

新增插件、仓库主标或图标修改时使用 [mp-design-icon](../mp-design-icon/SKILL.md)，读取品牌规范、复用已有批准并核对候选选择及实际尺寸预览。
