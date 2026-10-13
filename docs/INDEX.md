---
type: guide
scope: marketplace
summary: "当前 ChatGPT/Codex 文档、历史决策与退役资料导航"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-13
state: active
version: v2.28
---

# 文档索引

本Communication正式PR5候选按Owner Q3限定Diagram0.3.1、Learning Evidence0.1.0、Explain0.1.1、Communication0.1.0四包六技能/三显式/开发20，VERSION未发布8.3.0。develop的Communication PR3保留HTML五包七技能，当前上游M4 c1fa458已准备未发布8.3.0；已发布main/v8.2.0仍为前三包五技能。本候选已从实际M4 c1fa458派生，接入7548四包投影；实际main/Release及发布后复查仍待完成。

[Communication验收](runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)保留S01–S12、C01–C18、原失败/修复和同应用Codex本地与ChatGPT/Work本机两个入口的限定实测身份；[8.3.0发行账本](runbook/[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)分开记录版本准备、预备投影与R01–R05。现实沟通效果本轮另测，不由基础功能通过推断。Refs [Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)。

Learning [8.2.0发行](runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)已通过#232/main ebc4bdc3公开，发布后canonical/Python与#234同步/#235预升/#236文档收尾见原账本；[验收](runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)保留原生延期、桌面/Side Chat未测、历史批准缺项及Owner最终接受限制。#215/Epic #209保持OPEN。本次不补写其他任务通过或关闭。

HTML [ADR](adr/[ADR]_HTML_Guide_Kit_Addition.md)、[验收SPEC](spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)与[RUNBOOK](runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)继续维护develop另发范围。历史[8.1.1发行](runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)保留Understanding旧集合，历史版本、失败和批准不由新结果追认；[品牌验收](runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)保存A主标、D图标及实际客户端覆盖。

四阶段文档收尾实际head、生产零差异、限定65项检查及43原始日志/hash见[Closeout sync 01](runbook/evidence/communication-kit-2026-10-13-closeout-sync-01.json)，原字节与失败链保留，AI审查不替代GitHub批准。

继承空白失败、窄修复、四实际head完整PR范围复验及原字节manifest见[Inherited whitespace 01](runbook/evidence/communication-kit-2026-10-13-inherited-whitespace-01.json)。

PR1 #223实际合入bca、head同tree与限定M1 postmerge原始证据见[M1 postmerge 01](runbook/evidence/communication-kit-2026-10-13-pr1-merge-01.json)；空reviews不追认独立批准。

实际M1 merge后的普通下游继承与限定最终检查来源见[PR1 merge sync 01](runbook/evidence/communication-kit-2026-10-13-pr1-merge-sync-01.json)，独立批准/后续正式合并仍分别核对。

正式PR5实际M4派生、318工程、九固定canonical及失败原件见[formal PR5 01](runbook/evidence/communication-kit-2026-10-13-formal-pr5-01.json)，实际开发M4十三组与M2/M3闭包沿用边界见[postmerge M2–M4 01](runbook/evidence/communication-kit-2026-10-13-postmerge-m2-m4-01-manifest.json)；main/Release/R仍待完成。

## 入口

- [Communication Marketplace 8.3.0 发布准备](runbook/[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)：已授权四包六技能，版本准备与实际合并/发布/安装复查分开记录。

Communication PR4同步验收证据和实际发布基线，见[验收记录§6](runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。Learning8.2已published，正式Communication范围为四包六技能、HTML另发；M1–4已合并，历史reviews缺项保留；PR5当前head独立批准和main实际合入仍未满足。

Owner Q3已确认Communication正式发行仅为Learning已公开三包加Communication（四包六技能），HTML保留develop另发；开发集成五包七技能，两个集合各自精确验证。

- [Communication 完整实施计划](../plan/communication-kit-implementation-plan.md)与[原稿捕获](../plan/communication-kit-plan-provenance.json)
- [Communication Kit 新增决定](adr/[ADR]_Communication_Kit_Addition.md)
- [Communicate 行为契约](spec/[SPEC]_Communication_Communicate.md)
- [沟通助手使用指南](guide/[GUIDE]_Communication_Communicate.md)
- [Communication 基础验收与发布检查](runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)

- [项目说明](../README.md)
- [贡献流程](../CONTRIBUTING.md)
- [项目指令](../AGENTS.md)
- [术语](../GLOSSARY.md)
- [历史发布日志](../CHANGELOG.md)
- [迁移与退役 ADR](adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)
- [Understanding Kit 新增决定](adr/[ADR]_Understanding_Kit_Addition.md)
- [Learning Evidence Kit 迁移决定](adr/[ADR]_Learning_Evidence_Kit_Migration.md)

- [Explain Kit 新增决策](adr/[ADR]_Explain_Kit_Addition.md)
- [Explain Kit 实际验收](runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)
- [HTML Guide Kit 新增决定](adr/[ADR]_HTML_Guide_Kit_Addition.md)
- [HTML Guide Kit 验收判准](spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)
- [HTML Guide Kit 阶段验收](runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)
- [HTML Guide Kit 使用指南](guide/[GUIDE]_HTML_Guide_Kit.md)

- [Communication 未发布候选包](../plugins/communication-kit/README.md)
- [Communicate 显式公开技能](../plugins/communication-kit/skills/communicate/SKILL.md)
- [Communication 精选冻结来源](../plugins/communication-kit/skills/communicate/references/source-provenance.md)

- [品牌统一决定](adr/[ADR]_Brand_Identity_And_Icon_Workflow.md)
- [品牌和图标验收](runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)

## 当前规范和指南

- [品牌规范](rule/[STANDARD]_Brand_Identity.md)

- [[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md](rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)
- [[STANDARD]_Commit_Message_Convention.md](rule/[STANDARD]_Commit_Message_Convention.md)
- [[STANDARD]_Documentation_Framework.md](rule/[STANDARD]_Documentation_Framework.md)
- [[STANDARD]_GitHub_Markdown.md](rule/[STANDARD]_GitHub_Markdown.md)
- [[GUIDE]_ChatGPT_Codex_Upgrade.md](guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)
- [[GUIDE]_Marketplace_Agent_Execution_Checklist.md](guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md)
- [[GUIDE]_Marketplace_Project_Overview.md](guide/[GUIDE]_Marketplace_Project_Overview.md)
- [[GUIDE]_Plugin_Development_Testing_Workflow.md](guide/[GUIDE]_Plugin_Development_Testing_Workflow.md)
- [[GUIDE]_Version_Management.md](guide/[GUIDE]_Version_Management.md)
- [[GUIDE]_Learning_Evidence_Kit.md](guide/[GUIDE]_Learning_Evidence_Kit.md)
- [[SPEC]_Marketplace_Json_Schema.md](spec/[SPEC]_Marketplace_Json_Schema.md)
- [[SPEC]_Plugin_Json_Schema.md](spec/[SPEC]_Plugin_Json_Schema.md)
- [[SPEC]_Learning_Evidence_Record_And_API.md](spec/[SPEC]_Learning_Evidence_Record_And_API.md)
- [[RUNBOOK]_Doc_Archive_Procedure.md](runbook/[RUNBOOK]_Doc_Archive_Procedure.md)
- [[RUNBOOK]_Release_Operations.md](runbook/[RUNBOOK]_Release_Operations.md)

- [Communicate 行为契约](spec/[SPEC]_Communication_Communicate.md)
- [沟通助手使用指南](guide/[GUIDE]_Communication_Communicate.md)
- [Communication 基础验收与发布检查](runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)

- [迁移实际验收记录](runbook/[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md)
- [发布准备、实际发布与后续记录](runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)
- [Marketplace 8.1.0 发布事实、复查与未完成验收](runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)
- [Understanding Kit 合并后安装、行为及客户端验收](runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)
- [Learning Evidence Kit 分段验收、发行与 Epic 追踪](runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)
- [Marketplace 8.2.0 候选、入口限制与发布门槛](runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)

## 决策与故障历史

以下旧 ADR 保留原有决策正文；涉及 Claude、learn-kit 或 NotebookLM 的方案由 portable 迁移 ADR 替代。Understanding 新增 ADR 是历史局部扩展决定，当前 Learning Evidence 迁移替代其包身份、持久化及入口边界；历史正文和结论保持，运行/验收以新契约及实际账本为准。

- [[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md](adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)
- [[ADR]_Understanding_Kit_Addition.md](adr/[ADR]_Understanding_Kit_Addition.md)
- [[ADR]_Codex_Dual_Native_Plugin_Support.md](adr/[ADR]_Codex_Dual_Native_Plugin_Support.md)
- [[ADR]_Develop_PreBump_Adoption.md](adr/[ADR]_Develop_PreBump_Adoption.md)
- [[ADR]_Diagram_Kit_Addition.md](adr/[ADR]_Diagram_Kit_Addition.md)
- [[ADR]_Documentation_Framework_Exemption_Reversal.md](adr/[ADR]_Documentation_Framework_Exemption_Reversal.md)
- [[ADR]_LearnKit_Consolidation_To_Single_Skill.md](adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md)
- [[ADR]_LearnKit_Explanation_Skills_Addition.md](adr/[ADR]_LearnKit_Explanation_Skills_Addition.md)
- [[ADR]_LearnKit_Init_Skill_Rename.md](adr/[ADR]_LearnKit_Init_Skill_Rename.md)
- [[ADR]_LearnKit_ThreeViews_HITL_Expansion.md](adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md)
- [[ADR]_NotebookLM_Kit_Retirement.md](adr/[ADR]_NotebookLM_Kit_Retirement.md)
- [[ADR]_Root_Level_Named_Files_Codification.md](adr/[ADR]_Root_Level_Named_Files_Codification.md)
- [[POSTMORTEM]_2026-05-18_Bulk_Cleanup_Trap_Analysis.md](postmortem/[POSTMORTEM]_2026-05-18_Bulk_Cleanup_Trap_Analysis.md)

## 归档

历史正文、版本及来源保留在平面归档目录。账本记录来源提交和 Git blob 的 SHA-256；链接按归档位置修复，已删除运行文件指向固定提交。

- [来源账本](archive/history-sources.json)
- [Understanding Pop Quiz 历史 SPEC v1.0](archive/[DEPRECATED]_[SPEC]_Understanding_Pop_Quiz_v1.0.md)
- [Understanding Pop Quiz 历史 GUIDE v1.3](archive/[DEPRECATED]_[GUIDE]_Understanding_Pop_Quiz_v1.3.md)
- [[DEPRECATED]_GLOSSARY_Pre_Portable_v7.0.2.md](archive/[DEPRECATED]_GLOSSARY_Pre_Portable_v7.0.2.md)
- [[DEPRECATED]_INDEX_Pre_Portable_v7.0.0.md](archive/[DEPRECATED]_INDEX_Pre_Portable_v7.0.0.md)
- [[DEPRECATED]_LearnKit_CHANGELOG_v4.0.1.md](archive/[DEPRECATED]_LearnKit_CHANGELOG_v4.0.1.md)
- [[DEPRECATED]_LearnKit_CLAUDE_v4.0.1.md](archive/[DEPRECATED]_LearnKit_CLAUDE_v4.0.1.md)
- [[DEPRECATED]_LearnKit_INDEX_v1.3.md](archive/[DEPRECATED]_LearnKit_INDEX_v1.3.md)
- [[DEPRECATED]_LearnKit_README_v4.0.1.md](archive/[DEPRECATED]_LearnKit_README_v4.0.1.md)
- [[DEPRECATED]_LearnKit_[ADR]_LearnKit_Discovery_Skills_v1.0.md](archive/[DEPRECATED]_LearnKit_[ADR]_LearnKit_Discovery_Skills_v1.0.md)
- [[DEPRECATED]_LearnKit_[GUIDE]_LearnKit_Design_v1.1.md](archive/[DEPRECATED]_LearnKit_[GUIDE]_LearnKit_Design_v1.1.md)
- [[DEPRECATED]_LearnKit_[GUIDE]_LearnKit_Discovery_Recipes_v1.0.md](archive/[DEPRECATED]_LearnKit_[GUIDE]_LearnKit_Discovery_Recipes_v1.0.md)
- [[DEPRECATED]_LearnKit_[GUIDE]_LearnKit_Pedagogy_v1.0.md](archive/[DEPRECATED]_LearnKit_[GUIDE]_LearnKit_Pedagogy_v1.0.md)
- [[DEPRECATED]_README_Pre_Portable_v7.0.2.md](archive/[DEPRECATED]_README_Pre_Portable_v7.0.2.md)
- [[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md](archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md)
- [[DEPRECATED]_[GUIDE]_Contributing_v1.1.md](archive/[DEPRECATED]_[GUIDE]_Contributing_v1.1.md)
- [[DEPRECATED]_[GUIDE]_Marketplace_Agent_Execution_Checklist_v1.3.md](archive/[DEPRECATED]_[GUIDE]_Marketplace_Agent_Execution_Checklist_v1.3.md)
- [[DEPRECATED]_[GUIDE]_Marketplace_Project_Overview_v1.0.md](archive/[DEPRECATED]_[GUIDE]_Marketplace_Project_Overview_v1.0.md)
- [[DEPRECATED]_[GUIDE]_Migration_From_v3_to_v4_v6.0.md](archive/[DEPRECATED]_[GUIDE]_Migration_From_v3_to_v4_v6.0.md)
- [[DEPRECATED]_[GUIDE]_Plugin_Development_Testing_Workflow_v1.1.md](archive/[DEPRECATED]_[GUIDE]_Plugin_Development_Testing_Workflow_v1.1.md)
- [[DEPRECATED]_[GUIDE]_Version_Management_v1.1.md](archive/[DEPRECATED]_[GUIDE]_Version_Management_v1.1.md)
- [[DEPRECATED]_[RUNBOOK]_Codex_Dual_Native_Manual_Acceptance_v1.1.md](archive/[DEPRECATED]_[RUNBOOK]_Codex_Dual_Native_Manual_Acceptance_v1.1.md)
- [[DEPRECATED]_[RUNBOOK]_NotebookLM_Smoke_Acceptance_v1.1.md](archive/[DEPRECATED]_[RUNBOOK]_NotebookLM_Smoke_Acceptance_v1.1.md)
- [[DEPRECATED]_[RUNBOOK]_Release_Operations_v1.5.md](archive/[DEPRECATED]_[RUNBOOK]_Release_Operations_v1.5.md)
- [[DEPRECATED]_[SPEC]_Marketplace_Json_Schema_v1.1.md](archive/[DEPRECATED]_[SPEC]_Marketplace_Json_Schema_v1.1.md)
- [[DEPRECATED]_[SPEC]_Plugin_Json_Schema_v1.1.md](archive/[DEPRECATED]_[SPEC]_Plugin_Json_Schema_v1.1.md)
- [[DEPRECATED]_[STANDARD]_AI_Engineering_Execution_HITL_Prompt_v1.5.md](archive/[DEPRECATED]_[STANDARD]_AI_Engineering_Execution_HITL_Prompt_v1.5.md)
- [[DEPRECATED]_[STANDARD]_Documentation_Framework_v1.9.md](archive/[DEPRECATED]_[STANDARD]_Documentation_Framework_v1.9.md)

## 模板

- [TEMPLATE_ADR.md](_templates/TEMPLATE_ADR.md)
- [TEMPLATE_GUIDE.md](_templates/TEMPLATE_GUIDE.md)
- [TEMPLATE_POSTMORTEM.md](_templates/TEMPLATE_POSTMORTEM.md)
- [TEMPLATE_RUNBOOK.md](_templates/TEMPLATE_RUNBOOK.md)
- [TEMPLATE_SPEC.md](_templates/TEMPLATE_SPEC.md)
- [TEMPLATE_STANDARD.md](_templates/TEMPLATE_STANDARD.md)

- [[DEPRECATED]_[RUNBOOK]_Doc_Archive_Procedure_v1.1.md](archive/[DEPRECATED]_[RUNBOOK]_Doc_Archive_Procedure_v1.1.md)

- [[DEPRECATED]_[STANDARD]_GitHub_Markdown_v1.0.md](archive/[DEPRECATED]_[STANDARD]_GitHub_Markdown_v1.0.md)

| Version | Date | Summary |
|---|---|---|
| v2.23 | 2026-10-13 | 加入Communication8.3.0版本准备入口与Learning迁移原始工程证据，保留实际未解除门禁 |
| v2.22 | 2026-10-13 | 普通同步#234发布后基线及真实学习Release记录，保持Communication五包候选与四包正式范围 |
| v2.19 | 2026-10-13 | 同步 Learning 原子替代与 Communication 完整集成，按当前集合验收，发行范围另核对 |

| Version | Date | Summary |
| --- | --- | --- |
| v2.25 | 2026-10-13 | 四包发行预备来源、开发五包与正式已发布三包分开导航，保存全部历史记录 |

| Version | Date | Summary |
| --- | --- | --- |
| v2.26 | 2026-10-13 | 合入PR4实际49036ad文档归档，保留四包预备canonical与五包开发来源；生产保持cd7未变 |

| Version | Date | Summary |
| --- | --- | --- |
| v2.27 | 2026-10-13 | 导入实际8a841a7完整范围空白修复及原日志，冻结原稿/运行包保持，正式发布门禁未完成 |
