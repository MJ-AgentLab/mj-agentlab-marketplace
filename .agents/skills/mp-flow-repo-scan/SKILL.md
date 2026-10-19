---
name: mp-flow-repo-scan
description: "Use for marketplace repo scan / 事实核查 before implementation: inspect worktrees, plugin facts, versions, documentation and CI without changing files."
---

# mp-flow-repo-scan

需求承接先读已选原意和接受基线，再按[INTENT 规范](../../../docs/rule/[STANDARD]_AI_Engineering_Intent.md)核实代码/配置/运行事实与差距；来源意思、项目事实和假设分别标记，不以实现现状推定提出者原意。

只读核查当前 worktree、未提交改动、远端和目标分支；扫描 .agents/plugins/marketplace.json、各 plugins/*/plugin.json、公开 arch-diagram / pop-quiz / learning-record-check / glossary / concept / guide 和 .agents/skills 下的 20 个开发技能。核对PR3 开发精确五插件/七技能/四个显式策略、独立公开候选三插件/五技能/两个学习策略，以及安装包共用脚本归属。对照 VERSION、当前文档、历史归档和 CI，区分未发布候选与公开 v8.1.1 的旧 Understanding 集合；候选安装使用待测 branch/SHA。记录事实位置、漂移和受影响文件，不用历史 ADR 或发现成功推断当前集合、运行或原生窗口通过。输出可支持实施的事实与约束。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

涉及视觉资源时核查品牌 STANDARD、assets/brand 与各包图标，核对来源、批准和 manifest 引用。

涉及 Communication 时读[新增 ADR](../../../docs/adr/[ADR]_Communication_Kit_Addition.md)与[冻结来源记录](../../../plugins/communication-kit/skills/communicate/references/source-provenance.md)，核对四显式入口、Read/Write、自身提示、三份摘要哈希和来源实际 Git 状态。源路径只用于追溯；消费端运行依赖限于包内资源。版本准备另核对 Learning 先8.2.0、Communication 随后独立 minor 的依赖和实际 From/To，不从候选版本猜发布状态。

HTML Guide Kit 的新建只读文本和显式确认合同见 [ADR](../../../docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)。验证当前授权集合时，保留 Communication 九组合和 HTML 七组合的并集，并增加全五插件安装，共十三组合；guide、communicate、pop-quiz 和 learning-record-check 仅显式调用，普通提示仍仅三个自然启用技能。合并后运行修正按插件自身补丁推进，评审/安装/模型/客户端结果分别记录。

Communication 的旧九组合与当前 Learning/HTML 基线并集经 Understanding → Learning 替换后为十三组合；全五插件普通3/原生7/显式4。冻结包内容与摘要哈希保持，工程、行为和实际客户端证据分层记录，Refs #222。
