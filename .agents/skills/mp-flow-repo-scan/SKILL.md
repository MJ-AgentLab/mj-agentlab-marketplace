---
name: mp-flow-repo-scan
description: "Use for marketplace repo scan / 事实核查 before implementation: inspect worktrees, plugin facts, versions, documentation and CI without changing files."
---

# mp-flow-repo-scan

只读核查当前 worktree、未提交改动、远端和目标分支；扫描 .agents/plugins/marketplace.json、各 plugins/*/plugin.json、公开技能与 .agents/skills 开发技能。对照 VERSION、当前文档、历史归档和 CI，区分开发候选与已发布 main/tag/Release 的集合、版本和验收身份。PR3 候选为四插件五公开技能、20开发技能，新增 communicate 只在候选中；数量与能力均从权威文件核对。记录事实位置、漂移和受影响文件，不用历史 ADR 推断当前集合。输出可支持实施的事实与约束。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

涉及视觉资源时核查品牌 STANDARD、assets/brand 与各包图标，核对来源、批准和 manifest 引用。

涉及 Communication 时读[新增 ADR](../../../docs/adr/[ADR]_Communication_Kit_Addition.md)与[冻结来源记录](../../../plugins/communication-kit/skills/communicate/references/source-provenance.md)，核对两显式入口、Read/Write、自身提示、三份摘要哈希和来源实际 Git 状态。源路径只用于追溯；消费端运行依赖限于包内资源。版本准备另核对 Learning 先8.2.0、Communication 随后独立 minor 的依赖和实际 From/To，不从候选版本猜发布状态。
