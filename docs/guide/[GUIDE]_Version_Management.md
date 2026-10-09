---
type: guide
scope: marketplace
summary: "Marketplace and per-plugin authorities with transactional version preparation"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.4
---

# [GUIDE] Version management

版本按职责独立管理：市场 VERSION 与各 plugins/*/plugin.json 的根 version 分别权威。#197 合并后的 develop marketplace 为未发布 pre-bump 8.0.1；本分支准备功能发布候选 8.1.0，diagram-kit 为 0.3.0，explain-kit 为 0.1.0，understanding-kit 为 0.1.1。市场索引不携带版本；README badge 是市场版本的派生展示。正式发布身份及未完成项见 [8.1.0 发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

代理先执行 scripts/bump-version.ps1 的 -DryRun，使用 -Scope marketplace、diagram-kit、understanding-kit 或 explain-kit；这是版本工具的参数，与 Git 提交 scope 分开。From 必须匹配真实版本，To 必须合法 semver。脚本在所有目标预检成功后写入；任何写入或校验失败恢复原字节，清理失败只保留备份并报告。历史正文不做全局版本替换。

owner 于 2026-10-09 授权先应用 8.0.0 / 0.3.0，并同步 CHANGELOG 和发布说明；版本准备不替代未完成的桌面端验收，正式发布仍需完整验收、检查、独立批准与发布授权。learn-kit 不发布新版本。阶段调整与 diagram-kit 的 0.x breaking 规则例外见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。develop 的发布后 pre-bump 保护继续运行。

新增 Understanding Kit 的初始授权覆盖 0.1.0 的实现与 develop PR 准备；owner 在 #195 合并后要求继续后续工作，验收发现的技能修正按插件自身补丁推进到 0.1.1，并通过 #197 合入 develop。当时 marketplace VERSION 保持 8.0.1；[新增 ADR](../adr/[ADR]_Understanding_Kit_Addition.md) 本身不构成正式发布授权。owner 本次明确要求“继续后续工作，并发布”，据此准备 8.1.0；正式发布仍受客户端证据、required checks 和当前提交独立批准约束。发布完成后准备市场 8.1.1 pre-bump，只更新 VERSION 和派生 README badge，各插件按自身变更推进。

Explain Kit 初始版本已批准为 0.1.0 并通过 #196 合入 develop；其新增时保持市场与既有插件版本。原功能发布建议 8.1.0 现按本次发布授权执行版本准备，插件根版本不连带变化，见 [Explain Kit ADR](../adr/[ADR]_Explain_Kit_Addition.md)。
