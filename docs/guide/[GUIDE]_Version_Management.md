---
type: guide
scope: marketplace
summary: "Marketplace and per-plugin authorities with transactional version preparation"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-10
state: active
version: v2.10
---

# [GUIDE] Version management

版本按职责独立管理：市场 VERSION 与各 plugins/*/plugin.json 的根 version 分别权威。Marketplace v8.1.1 已随 #205 合入 main 发布，diagram-kit 为 0.3.1，explain-kit 为 0.1.1，understanding-kit 为 0.1.2。#206 已将发布 main 同步回 develop；本分支先 dry-run 再实际应用 8.1.2 pre-bump，只修改 VERSION / README badge 两锚点。市场索引不携带版本，插件不连带预升，8.1.2 不创建标签或 Release。发布身份、安装复查及未完成项见 [8.1.1 发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。

历史 Marketplace v8.1.0 随 #198 发布，插件分别为 diagram-kit 0.3.0 / explain-kit 0.1.0 / understanding-kit 0.1.1。#199 将 main 同步回 develop，merge `a220688d0f46c32f775d4284feb6f9c935085089`；#201 merge `1781e28c37c09a962c0c0edccd6fa2ec574e48d9` 将 VERSION / README badge 预升为当时未发布的 8.1.1。当时 main 保持 8.1.0，pre-bump 没有创建标签或 Release；历史事实及验收缺项见 [8.1.0 发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

代理先执行 scripts/bump-version.ps1 的 -DryRun，使用 -Scope marketplace、diagram-kit、understanding-kit 或 explain-kit；这是版本工具的参数，与 Git 提交 scope 分开。From 必须匹配真实版本，To 必须合法 semver。脚本在所有目标预检成功后写入；任何写入或校验失败恢复原字节，清理失败只保留备份并报告。历史正文不做全局版本替换。

owner 于 2026-10-09 授权先应用 8.0.0 / 0.3.0，并同步 CHANGELOG 和发布说明；版本准备不替代未完成的桌面端验收，正式发布仍需完整验收、检查、独立批准与发布授权。learn-kit 不发布新版本。阶段调整与 diagram-kit 的 0.x breaking 规则例外见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。develop 的发布后 pre-bump 保护继续运行。

新增 Understanding Kit 的初始授权覆盖 0.1.0 的实现与 develop PR 准备；owner 在 #195 合并后要求继续后续工作，验收发现的技能修正按插件自身补丁推进到 0.1.1，并通过 #197 合入 develop。当时 marketplace VERSION 保持 8.0.1；[新增 ADR](../adr/[ADR]_Understanding_Kit_Addition.md) 本身不构成正式发布授权。owner 在 8.1.0 准备阶段明确要求“继续后续工作，并发布”，据此准备 8.1.0；正式发布仍受客户端证据、required checks 和当前提交独立批准约束。该次发布完成后的 8.1.1 pre-bump 只更新 VERSION 和派生 README badge，各插件按自身变更推进。

Explain Kit 初始版本已批准为 0.1.0 并通过 #196 合入 develop；其新增时保持市场与既有插件版本。原功能发布建议 8.1.0 随该次授权准备并发布，插件根版本不连带变化，见 [Explain Kit ADR](../adr/[ADR]_Explain_Kit_Addition.md)。

2026-10-10 品牌实施阶段：Owner 批准 Diagram 0.3.1、Understanding 0.1.2、Explain 0.1.1；三个转换分别执行版本工具 dry-run 和实际写入，当时 marketplace 保持未发布 8.1.1、正式身份为 v8.1.0。#203/#204 证据见 [品牌验收](../runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)，随后 #205 发布为 v8.1.1。旧版本正文和公开资产保持。
