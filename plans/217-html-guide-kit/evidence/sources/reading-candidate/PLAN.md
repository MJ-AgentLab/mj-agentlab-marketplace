---
type: plan
layer: working
scope: html-guide-kit
summary: "HTML PR1 历史来源映射、阅读试行与交接边界；非当时原始计划"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
task: 217-html-guide-kit
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217
---

# [PLAN] HTML Guide Kit

[任务入口](./INDEX.md) · [主 REPORT](./[REPORT]_HTML_Guide_Kit.md)

## 原意与接受来源

原任务意图与产品约定以 [Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)、[ADR](../../docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)及[验收 SPEC](../../docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)为来源。PR1 固定提交版本在[来源绑定](./source-bindings.json)中提供原件；不是用今天的正文推定当时约定。PR1 [#218](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/218)与[#221](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/221)负责合同与前置工程，不是运行包接入。

初始产品范围为显式 `$html-guide-kit:guide`、Read、仅新建可复制指南聊天文本。读者、使用任务、理解问题须明确选择或修改确认；推荐、预选、沉默、超时、无关回复及窗口消失均不算答复，不能承诺锁住宿主窗口。HTML、代码、文件和具体制作工具操作说明不在初始交付范围。具体判准仍读固定来源的 ADR/SPEC，不把此处摘要当第二正本。

## 本次试行接受基线 P1

Owner 在文档组织设计访谈中选择以 HTML 任务、限定 PR1 链试行，并明确授权“先完成规范、模板、技能和 Harness 适配，再做 HTML PR1 有界试行”。完整本次范围及真实实施授权已保存于[#257 主 PLAN](../257-task-documentation/[PLAN]_Task_Documentation.md)与其[来源清单](../257-task-documentation/source-bindings.json)。本 PLAN 创建于 2026-10-19，是事后导航重建，不冒充 2026-10-12 的原始执行计划或产品再次接受。

本批只做：稳定任务目录、PR1 固定原件与 43 项运行资源映射、当批 GitHub 状态快照、元数据审定，以及管理者/产品/开发运维独立合成阅读。原 ADR/SPEC 正文、混合 RUNBOOK、历史封存 plan.json/控制/失败记录与原路径保留；不追溯改变旧 PR 拓扑，不将退役 Understanding 改名为 Learning Evidence。canonical 的元数据接入只说明长期维护归属，不补写当时接受或测试结果。

本批不做：恢复 #239 开发、接入外部 0.1.37 草稿、修改运行插件/版本、重新安装历史 PR1、运行旧脚本、模型行为、原生窗口、桌面/Side Chat 或现实效果验收；无发布或保护绕过。历史 PR1 证据的范围不能外推当前 HTML 0.1.36。

## 执行与交接

1. 文档机制 A/B 实际内部合入后，从其集成树建立本批。原任务身份仍 #217；本批执行由 #257 / 主 PR #258 跟踪，子 PR 指向该集成分支。
2. 固定 PR1 head/merge、原规范/证据与补交的合并后回执；具名来源绑定完整 Git SHA、原路径、原始字节摘要和可恢复快照。
3. 逐项核对原 43 资源的两份清单、原 Git 原件及旧 checkout 字节，不以总数或单一摘要替代资源检查。可复现方法和结果在 REPORT；不执行原件内的命令。
4. 冻结实际候选后，三个 fresh 独立 Agent 仅从 INDEX 开始按角色回答并引用真实读取位置。预先固定四题评分：每题结论、出处、时间/版本范围均完整才通过；不能用其他题分数抵消缺口。原始输入/输出、执行身份/时间及候选单独保存，不提供答案键或其他角色输出。
5. 验证任务导航、隔离来源、文档 Harness 与必要集成检查；问题修复追加本 PLAN/REPORT，保留原轮结果。子 PR 内部正常合并，主 PR 保持 develop 真实保护与最终接受边界。

Agent 负责技术操作、核查与修复；Owner 只作实质决定和成品最终接受。非核心缺证不改 PASS，未来恢复仍依据实际授权与风险边界。若来源或范围冲突，停止依赖该结论的动作并记录；其他独立工作继续。恢复使用新提交，不删除原件或重写历史；任务完成不触发搬迁。

## 后续推广提案

试行通过后，新达到持续维护需要的任务使用本机制；小改继续复用 Issue/PR。旧任务仅在实质修订或选择性迁移时审定，优先有稳定来源且仍需交接者。混合公共账本先定位章节，不批量拆分。推广及下一批旧任务范围由 Owner 决定；本次授权不扩大为全库历史迁移。
