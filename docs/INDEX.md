---
type: guide
scope: marketplace
summary: "当前 ChatGPT/Codex 文档、历史决策与退役资料导航"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-10
state: active
version: v2.12
---

# 文档索引

[Marketplace v8.1.1](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.1.1) 已通过 #205 合入 main 并自动发布，注册 diagram-kit 0.3.1 / arch-diagram、understanding-kit 0.1.2 / pop-quiz 与 explain-kit 0.1.1 / glossary、concept。客户端为 ChatGPT 桌面端和 Codex 本地环境。实际发布 SHA 的四种 canonical 安装、图标比较及 Python 校验通过；Owner 截图、完整客户端记录缺项和未提供的 GitHub 独立批准分别保留。#206 已将 main 回同步到 develop，本分支为未发布 8.1.2 pre-bump，插件版本保持；同期 #207 main 文档合并记录继续同步。

#203/#204 接入 A 仓库主标、D 插件图标及 20 号开发技能，随 v8.1.1 分发；实现阶段的验收、未完成项和历史证据见 [品牌验收](runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。历史 v8.1.0 包含三个插件，v8.0.0 仅包含 Diagram Kit。

8.1.1 的实际 tag、Release、正文身份、发布后安装及保留缺项见 [发布记录](runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。

## 入口

- [项目说明](../README.md)
- [贡献流程](../CONTRIBUTING.md)
- [项目指令](../AGENTS.md)
- [术语](../GLOSSARY.md)
- [历史发布日志](../CHANGELOG.md)
- [迁移与退役 ADR](adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)
- [Understanding Kit 新增决定](adr/[ADR]_Understanding_Kit_Addition.md)

- [Explain Kit 新增决策](adr/[ADR]_Explain_Kit_Addition.md)
- [Explain Kit 实际验收](runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)

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
- [[GUIDE]_Understanding_Pop_Quiz.md](guide/[GUIDE]_Understanding_Pop_Quiz.md)
- [[SPEC]_Marketplace_Json_Schema.md](spec/[SPEC]_Marketplace_Json_Schema.md)
- [[SPEC]_Plugin_Json_Schema.md](spec/[SPEC]_Plugin_Json_Schema.md)
- [[SPEC]_Understanding_Pop_Quiz.md](spec/[SPEC]_Understanding_Pop_Quiz.md)
- [[RUNBOOK]_Doc_Archive_Procedure.md](runbook/[RUNBOOK]_Doc_Archive_Procedure.md)
- [[RUNBOOK]_Release_Operations.md](runbook/[RUNBOOK]_Release_Operations.md)

- [迁移实际验收记录](runbook/[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md)
- [发布准备、实际发布与后续记录](runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)
- [Marketplace 8.1.0 发布事实、复查与未完成验收](runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)
- [Understanding Kit 合并后安装、行为及客户端验收](runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)

## 决策与故障历史

以下旧 ADR 保留原有决策正文；涉及 Claude、learn-kit 或 NotebookLM 的方案由迁移 ADR 替代，不作为当前安装说明。Understanding Kit 新增 ADR 仅替代迁移 ADR 的单插件集合及版本权威范围；退役、客户端、发布和历史保留规则继续有效。

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
