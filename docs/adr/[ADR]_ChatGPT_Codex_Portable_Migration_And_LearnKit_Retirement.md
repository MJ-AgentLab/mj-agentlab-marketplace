---
type: adr
scope: marketplace
summary: "ChatGPT/Codex portable migration, learn-kit retirement and 0.x version exception"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.0
supersedes:
  - "../archive/[DEPRECATED]_LearnKit_CHANGELOG_v4.0.1.md"
  - "../archive/[DEPRECATED]_LearnKit_README_v4.0.1.md"
  - "../archive/[DEPRECATED]_LearnKit_CLAUDE_v4.0.1.md"
  - "../archive/[DEPRECATED]_LearnKit_INDEX_v1.3.md"
  - "../archive/[DEPRECATED]_LearnKit_[ADR]_LearnKit_Discovery_Skills_v1.0.md"
  - "../archive/[DEPRECATED]_LearnKit_[GUIDE]_LearnKit_Design_v1.1.md"
  - "../archive/[DEPRECATED]_LearnKit_[GUIDE]_LearnKit_Discovery_Recipes_v1.0.md"
  - "../archive/[DEPRECATED]_LearnKit_[GUIDE]_LearnKit_Pedagogy_v1.0.md"
  - "../archive/[DEPRECATED]_[STANDARD]_AI_Engineering_Execution_HITL_Prompt_v1.5.md"
  - "../archive/[DEPRECATED]_[STANDARD]_Documentation_Framework_v1.9.md"
  - "../archive/[DEPRECATED]_[GUIDE]_Marketplace_Project_Overview_v1.0.md"
  - "../archive/[DEPRECATED]_[GUIDE]_Marketplace_Agent_Execution_Checklist_v1.3.md"
  - "../archive/[DEPRECATED]_[GUIDE]_Plugin_Development_Testing_Workflow_v1.1.md"
  - "../archive/[DEPRECATED]_[GUIDE]_Version_Management_v1.1.md"
  - "../archive/[DEPRECATED]_[SPEC]_Plugin_Json_Schema_v1.1.md"
  - "../archive/[DEPRECATED]_[SPEC]_Marketplace_Json_Schema_v1.1.md"
  - "../archive/[DEPRECATED]_[RUNBOOK]_Release_Operations_v1.5.md"
  - "../archive/[DEPRECATED]_[GUIDE]_Migration_From_v3_to_v4_v6.0.md"
  - "../archive/[DEPRECATED]_[RUNBOOK]_Codex_Dual_Native_Manual_Acceptance_v1.1.md"
  - "../archive/[DEPRECATED]_[RUNBOOK]_NotebookLM_Smoke_Acceptance_v1.1.md"
---

# [ADR] ChatGPT / Codex portable migration and learn-kit retirement

## Context

旧方案同时维护 Claude / Codex 包装及 learn-kit 的 NotebookLM bridge、锁文件和发布资产。用户在 2026-10-09 批准市场收敛、直接退役 learn-kit 与本地技能迁移。旧版本的行为、验收记录和公开资产仍是历史事实。

## Decision

- 仅支持 ChatGPT 桌面端与 Codex 本地环境；Codex CLI 验收基线固定 0.147.0。
- 市场只注册 diagram-kit，公开技能只含 arch-diagram。插件使用根 plugin.json 和 skills/；OpenAI 展示信息位于 extensions.com.openai。无 MCP 需求，不建立空 MCP 配置。
- learn-kit 直接退役，不发布新版本；其 bridge、安装器、锁、契约、探针、专用测试和运行技能删除。
- 19 个 mp-* 开发技能位于 .agents/skills，项目入口为 AGENTS.md，配置和执行规则为 .codex。技能使用真实可用的文件/终端能力，不依赖旧宿主工具名。
- 治理先同步 develop 与从 main 单独派生的窄 PR；两个治理 PR 的 VERSION 均不变。迁移 PR 在两者合并前保持 draft，旧入口的删除不能先进入目标分支。
- 保留 A6 / Check 和 Validate Structure 名称、当前提交的独立签核、防绕过与工程保护测试。
- 版本权威来源仅 VERSION 与 diagram-kit 根 manifest。发布以 Git 仓库和标签分发，不构建/上传 NLM wheel 或 checksum。无附加资产的草稿也能通过安装复查后发布；既有发布和资产不覆盖、不删除。

在已授权范围内，文件修改、环境检查、测试、隔离安装验证、提交、推送及 PR 准备由代理完成。owner 作出决定后，由代理执行，不要求 owner 复制命令，也不重复确认已授权的操作。CI、分支保护、独立审查及外部身份验证按实际约束处理；无法完成时说明原因，只请求最小必要参与。

需要 owner 决策时，提供 2–3 个明确选项、主要影响及有理由的推荐。常规实现细节由代理判断；必须由 owner 决定的事项等待答复。已有决定不重复询问，推荐项不视为默认批准。

## Version exception

计划 Marketplace 8.0.0 / diagram-kit 0.3.0。Marketplace 是支持面缩减的 breaking major；diagram-kit 仍在 0.x 试验阶段，本次目录与宿主变更通过 0.2.0 → 0.3.0 表达，明确豁免旧“所有 breaking 必升 1.0.0”约定。learn-kit 不 bump、不发布。**两个客户端实际验收完成前，不应用这两个计划版本**；当前权威版本保持 7.0.2 / 0.2.0，仅维护 Unreleased。

## Consequences

运行和发布链更小；学习解释及 NotebookLM 集成退出当前产品，已安装用户须明确卸载。旧标签可继续用于历史复现，历史资料通过 archive 来源清单及当前索引导航。发布阶段继续要求精确身份、标签绑定、草稿状态、相邻发布前复查与已发布版本不可覆盖。

## Alternatives considered

1. 推荐并采用：单插件 portable 迁移、直接退役 learn-kit。
2. 为 learn-kit 增加新包装后再退役：增加已确定无未来运行用途的工作，未采用。
3. 保留双宿主双 manifest：与批准的支持范围冲突，未采用。

## Implementation / Acceptance

按治理、归档退役、格式与技能、工具链、验收、版本与发布准备顺序执行。迁移只在隔离 worktree 中准备。验收证据见 [验收记录](../runbook/[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md)；未执行项明确标记。

治理 PR #186 / #187 尚未合并时，#188 临时保留根 CLAUDE.md 的固定同步说明，让目标分支的旧 A6 按原规则通过。该文件只指向 AGENTS.md 并记录当前迁移状态；CI 显式使用 --allow-governance-transition，且不接受额外旧宿主指令、目录或插件包装。默认 portable 校验与 canonical 发布安装复查仍拒绝该文件。两个治理 PR 合并后，代理必须在 #188 合并前删除过渡文件、CI 选项及校验器允许分支，并重跑新版 A6、结构校验、测试和安装冒烟。迁移 PR 保持 draft，当前绿灯不代表过渡清理已完成。

## Rollback

发布前按依赖相反顺序回退对应 PR，指令与门禁同步回退。发布后通过新的修复版本处理问题，保留原标签、版本与旧 NLM 资产。

## References / Decision log

- [官方 portable 格式](https://developers.openai.com/plugins/build/plugins)
- [官方技能格式](https://developers.openai.com/plugins/build/skills)
- [历史来源清单](../archive/history-sources.json)
- [旧双原生 ADR](./[ADR]_Codex_Dual_Native_Plugin_Support.md) 与 [diagram-kit 加入 ADR](./[ADR]_Diagram_Kit_Addition.md) 保留原路径与历史正文，由本决定替代其当前支持面和包装约定。
- 2026-10-09：owner 提供并批准迁移实施计划；代理按 worktree 执行并提交 PR。
