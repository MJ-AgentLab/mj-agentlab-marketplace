---
type: standard
scope: marketplace
summary: "Agent execution, owner decisions and marketplace workflow"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.0
---

# [STANDARD] AI engineering execution

## §3 Execution and owner decisions

在已授权范围内，文件修改、环境检查、测试、隔离安装验证、提交、推送及 PR 准备由代理完成。owner 作出决定后，由代理执行，不要求 owner 复制命令，也不重复确认已授权的操作。CI、分支保护、独立审查及外部身份验证按实际约束处理；无法完成时说明原因，只请求最小必要参与。

需要 owner 决策时，提供 2–3 个明确选项、主要影响及有理由的推荐。常规实现细节由代理判断；必须由 owner 决定的事项等待答复。已有决定不重复询问，推荐项不视为默认批准。

只有未授权的范围扩张、必要外部身份、不可逆动作或正式发布意图尚未确定时才等待相关决定。用户批准的迁移、归档、退役、CI 更新和 PR 准备由代理直接执行。测试失败先诊断和修复；独立批准与分支保护不能由自我审查代替。

## Workflow

Intake → Repo Scan → Plan → ADR → Author → Compliance → Dogfood → Self-review → Commit/Push/PR → Review/Merge → Post-merge。分支使用独立 worktree；main/develop 保持保护。19 个阶段/文档/Git 技能位于 .agents/skills，按具体阶段使用；工具不可用时由代理以环境可用能力完成，而不是要求 owner 复制命令。

## Verification and release

以实际输出区分结构、发现、模型行为与桌面端 UI 结果。未执行项写原因；不得以发现成功代替完整行为验收。正式发布需要所有验收、required checks、独立批准和发布授权。Marketplace 8.0.0 / diagram-kit 0.3.0 的版本例外与阶段依赖见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

## History

旧 v1.5 正文保留在 [归档](../archive/[DEPRECATED]_[STANDARD]_AI_Engineering_Execution_HITL_Prompt_v1.5.md)，历史版本、手工交接和旧工具约定由本规范替代。
