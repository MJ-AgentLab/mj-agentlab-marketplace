---
type: runbook
scope: marketplace
summary: "Draft-first Git/tag release with install verification and immutable history"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.0
---

# [RUNBOOK] Release operations

## Preparation

两个治理 PR 及迁移 PR 已合并。owner 已授权先完成 8.0.0 / 0.3.0 与正式 CHANGELOG 的版本准备，阶段调整见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。代理执行版本 dry-run、更新、测试与 PR 准备，未完成的桌面端验收继续据实记录。VERSION 变化合入 main 会触发发布，因此正式 release PR 的合并必须已有完整客户端验收、发布意图授权、CI 和独立批准。

## Draft-first state machine

scripts/run-release.mjs 从指定 SHA 读取 VERSION 与 CHANGELOG，要求 SHA 属于 main，新发布须绑定当前 main tip。既有标签必须 peel 到同一 SHA；既有草稿标题、tag、正文、target SHA 和 prerelease 状态必须一致。

创建空 draft → 有界等待可见 → 验证 canonical Git tree 的安装/发现 → 紧邻 publish 再取远端身份/状态 → publish → 复查 published/immutability。新发布无附加资产；unexpected assets fail closed，既有公开资产不会上传、覆盖或删除。已发布版本只能验证并 noop；故障通过新修复版本处理。

## Post-release

记录标签、Release 身份和实际验收；按既有 [pre-bump 决策](../adr/[ADR]_Develop_PreBump_Adoption.md) 准备 develop 的下一补丁 PR。回退与历史政策见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

历史带 wheel/checksum 的 v7.x 发布保留原资产。本次无资产状态机若被手工指向这类历史版本会拒绝重跑，不尝试修复、删除或覆盖资产；验证/noop 只适用于本次及后续无资产版本。
