---
type: guide
scope: marketplace
summary: "当前 ChatGPT/Codex 文档、历史决策与退役资料导航"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.0
---

# 文档索引

当前市场提供 diagram-kit / arch-diagram；客户端为 ChatGPT 桌面端和 Codex 本地环境。市场版本与插件版本仍为 7.0.2 / 0.2.0，计划 8.0.0 / 0.3.0 待验收完成统一更新。

## 入口

- [项目说明](../README.md)
- [贡献流程](../CONTRIBUTING.md)
- [项目指令](../AGENTS.md)
- [术语](../GLOSSARY.md)
- [历史发布日志](../CHANGELOG.md)
- [迁移与退役 ADR](adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)

## 当前规范和指南

- [[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md](rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)
- [[STANDARD]_Commit_Message_Convention.md](rule/[STANDARD]_Commit_Message_Convention.md)
- [[STANDARD]_Documentation_Framework.md](rule/[STANDARD]_Documentation_Framework.md)
- [[STANDARD]_GitHub_Markdown.md](rule/[STANDARD]_GitHub_Markdown.md)
- [[GUIDE]_ChatGPT_Codex_Upgrade.md](guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)
- [[GUIDE]_Marketplace_Agent_Execution_Checklist.md](guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md)
- [[GUIDE]_Marketplace_Project_Overview.md](guide/[GUIDE]_Marketplace_Project_Overview.md)
- [[GUIDE]_Plugin_Development_Testing_Workflow.md](guide/[GUIDE]_Plugin_Development_Testing_Workflow.md)
- [[GUIDE]_Version_Management.md](guide/[GUIDE]_Version_Management.md)
- [[SPEC]_Marketplace_Json_Schema.md](spec/[SPEC]_Marketplace_Json_Schema.md)
- [[SPEC]_Plugin_Json_Schema.md](spec/[SPEC]_Plugin_Json_Schema.md)
- [[RUNBOOK]_Doc_Archive_Procedure.md](runbook/[RUNBOOK]_Doc_Archive_Procedure.md)
- [[RUNBOOK]_Release_Operations.md](runbook/[RUNBOOK]_Release_Operations.md)

- [迁移实际验收记录](runbook/[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md)
- [合并后发布准备与发布说明草稿](runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)

## 决策与故障历史

以下旧 ADR 保留原有决策正文；涉及 Claude、learn-kit 或 NotebookLM 的方案由新迁移 ADR 替代，不作为当前安装说明。

- [[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md](adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)
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
