---
type: guide
scope: marketplace
summary: "当前 ChatGPT/Codex 文档、历史决策与退役资料导航"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-13
state: active
version: v2.17.6
---

# 文档索引

[Marketplace v8.1.1](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.1.1) 已通过 #205 合入 main 并自动发布，注册 diagram-kit 0.3.1 / arch-diagram、understanding-kit 0.1.2 / pop-quiz 与 explain-kit 0.1.1 / glossary、concept。实际发布 SHA 的四种 canonical 安装、图标比较及 Python 校验通过；Owner 截图、完整客户端缺项和未提供的 GitHub 独立批准分别保留。#206 回同步发布 main，#207/#208 随后完成 ancestry 同步与当时的 8.1.2 pre-bump；该阶段保持旧插件版本。以下 PR4 候选范围独立说明。

#203/#204 接入 A 仓库主标、D 插件图标及 20 号开发技能，随 v8.1.1 分发；实现阶段的验收、未完成项和历史证据见 [品牌验收](runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。历史 v8.1.0 包含三个插件，v8.0.0 仅包含 Diagram Kit。

8.1.1 的实际 tag、Release、正文身份、发布后安装及保留缺项见 [发布记录](runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。

Epic #209 的 PR4/PR5历史候选曾为未发布8.2.0；当前公开v8.2.0包含Diagram0.3.1 / LearningEvidence0.1.0 / Explain0.1.1三插件五技能，当前develop为未发布8.2.1并保留HTML0.1.0四插件六技能。[迁移 ADR](adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[记录/API 契约](spec/[SPEC]_Learning_Evidence_Record_And_API.md)、[指南](guide/[GUIDE]_Learning_Evidence_Kit.md)及[验收账本](runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)分别维护决定、数据、使用边界与实际证据；[8.2.0发行账本](runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)维护实际公开、收尾与入口资格。Owner接受核心独立验收后分段交付；所有启用提问入口严格待答，原生窗口不合格入口延期，文字重述不算窗口通过。Epic与Owner最终接受独立追踪，公开发布不证明现实学习效果。

HTML Guide Kit 正按 [Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217) 分阶段实施：PR1 #221 已合入并复验；PR2 原子接入完整 0.1.0 插件、已选 A 图标与严格合同，当时开发集合增至四插件五技能；Learning Evidence 替换后四插件六技能，公开 8.2.0 仍原三插件五技能，HTML 另行发行。阶段门槛见 [ADR](adr/[ADR]_HTML_Guide_Kit_Addition.md)，判准见 [SPEC](spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)，实际结果及未覆盖项见 [RUNBOOK](runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)。现实场景理解效果另测，本次仍保留工程行为与双客户端交互验收。







Marketplace v8.2.0已通过#232/main ebc4bdc3公开；#234同步和#235未发布8.2.1预升已依序实际合入，两次精确merge各八安装/实际Python通过。公开三插件、开发四插件范围保持；原A6例外失败、正常摘要修复及空reviews见[收尾回执](runbook/evidence/learning-evidence-8-2-0-closeout.json)。#210–214关闭；#215/Epic保留原生延期、真实客户端/效果与Owner接受，继续OPEN。

## 入口

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
