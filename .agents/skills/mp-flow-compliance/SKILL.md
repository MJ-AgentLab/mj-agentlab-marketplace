---
name: mp-flow-compliance
description: "Use after marketplace plugin or skill changes / 合规检查 to validate manifests, skill metadata, directory structure and documented contracts."
---

# mp-flow-compliance

运行 npm run validate 检查市场、各 portable manifest、公开和开发技能的严格 YAML、名称/描述预算、资源路径和当前文档。核对 PR3 候选五插件、六公开技能和20开发技能，索引/磁盘/白名单精确一致；已发布集合另核对 main/tag，不能以候选替换发布事实。运行受影响的有行为意义的测试；Python 校验器必须实际执行。A6 触发集合以 scripts/check-a6.mjs 为准，更新根 AGENTS.md。输出错误、已验证项和剩余限制，修复错误后重跑受影响检查。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

解释技能的展示入口、自然路由和包内资源必须一致，验收依据见 [记录](../../../docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。

Communication 按[验收契约](../../../docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)核对唯一 communicate、自身提示、Read/Write、严格显式策略与三显式入口，检查必需参考资源、冻结字段/实际日期、来源脏状态、三份摘要哈希及包内普通文件路径。缺失/篡改摘要、错类型/重复 YAML key、越界或链接组件均须失败；来源路径只作追溯，哈希不证明语义忠实。分开记录静态、安装、模型行为和客户端交互，现实效果测试本轮延期。

新增插件、仓库主标或图标修改时使用 [mp-design-icon](../mp-design-icon/SKILL.md)，读取品牌规范、复用已有批准并核对候选选择及实际尺寸预览。

HTML Guide Kit 的新建只读文本和显式确认合同见 [ADR](../../../docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)。验证当前授权集合时，保留 Communication 九组合和 HTML 七组合的并集，并增加全五插件安装，共十三组合；guide、communicate 和 pop-quiz 仅显式调用，普通提示仍仅三个自然启用技能。合并后运行修正按插件自身补丁推进，评审/安装/模型/客户端结果分别记录。
