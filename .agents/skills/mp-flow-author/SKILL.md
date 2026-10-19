---
name: mp-flow-author
description: "Use for marketplace plugin or skill implementation / 插件技能开发 under an approved plan; execute edits and preserve scope and evidence."
---

# mp-flow-author

HTML Learning Artifact site 扩展按[当前合同](../../../docs/spec/[SPEC]_HTML_Learning_Artifact.md)与[任务入口](../../../plans/274-html-learning-artifact/INDEX.md)核对：开发候选五包八公开/五显式/三自然，新增 site 及其包内工具、来源许可和真实 Sites 主流程；guide 原四资源及历史验收保留。下文带 PR3/旧版本的七技能数字仅属其历史范围，当前集合以实际 manifest/严格登记及本次证据为准；十三安装组合与20仓库技能保持。

涉及需求实施/修订时按[INTENT 规范](../../../docs/rule/[STANDARD]_AI_Engineering_Intent.md)核对原意正本、完整接受基线及本子 PR 覆盖；新缺口保留原意与实现两侧依据，工程判断不静默改写原意，需决定时只暂停受影响工作。

先读已有任务 INDEX/主 PLAN 和适用 canonical，按[文档框架](../../../docs/rule/[STANDARD]_Documentation_Framework.md)复用主文档，决定/实施/验证分别追溯。拆分任务使用隔离子分支，通过 Harness 后由 Agent 按授权合入集成分支，最终主 PR 满足 develop 保护。冻结接受不因修复覆盖，同交付同步明确批准影响的 canonical。

按已批准范围修改各插件根 portable plugin.json 与 skills/。当前候选注册 diagram-kit / arch-diagram、learning-evidence-kit / pop-quiz、learning-record-check 、explain-kit / glossary、concept、html-guide-kit / guide 与 communication-kit / communicate：PR3 开发候选五插件/七公开技能/四个显式策略；独立 8.2.0 公开候选仍三插件/五技能/两个学习策略。开发技能放 .agents/skills，配置放 .codex；Learning Evidence 共用 Python scripts 归属插件，安装后由实际 SKILL.md locator 定位，仓库 scripts/learning-evidence 过渡位置在 PR4 删除。frontmatter 用合法 YAML name/description，OpenAI 展示字段放 extensions.com.openai，没有 MCP 需求时无需空配置。新包边界见 [迁移 ADR](../../../docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)及[记录/API](../../../docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)：Pop Quiz 只读诊断，明确移交后共用保存；两阶段核验分开。精确校验不容纳未完成切换，修改后运行 npm run validate 并核对授权范围。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

解释技能按 [新增 ADR](../../../docs/adr/[ADR]_Explain_Kit_Addition.md) 实现；agents/openai.yaml 的自然启用策略为 true，保留 pop-quiz 显式策略。

Communication 实现先读[行为契约](../../../docs/spec/[SPEC]_Communication_Communicate.md)：communicate 为唯一显式入口，Read/Write，manifest/原生提示仅自身，allow_implicit_invocation 为布尔 false；关键缺口等待、保义和明确文件请求后的执行/回读按契约实现。插件、注册、严格校验、冻结摘要/记录、图标与安装预期原子接入。来源精选为原创 Lab Proposal / Informative 摘要，记录实际脏状态与源字节身份，重算三份包内摘要哈希；研究路径只追溯。完成工程修改后按[验收契约](../../../docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)记录实际验证、失败及未覆盖项，缺项保持对应 draft。

新增插件、仓库主标或图标修改时使用 [mp-design-icon](../mp-design-icon/SKILL.md)，读取品牌规范、复用已有批准并核对候选选择及实际尺寸预览。

HTML Guide Kit 的新建只读文本和显式确认合同见 [ADR](../../../docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)。验证当前授权集合时，保留 Communication 九组合和 HTML 七组合的并集，并增加全五插件安装，共十三组合；guide、communicate、pop-quiz 和 learning-record-check 仅显式调用，普通提示仍仅三个自然启用技能。合并后运行修正按插件自身补丁推进，评审/安装/模型/客户端结果分别记录。

Communication 的旧九组合与当前 Learning/HTML 基线并集经 Understanding → Learning 替换后为十三组合；全五插件普通3/原生7/显式4。冻结包内容与摘要哈希保持，工程、行为和实际客户端证据分层记录，Refs #222。
