---
type: guide
scope: marketplace
summary: "Marketplace and per-plugin authorities with transactional version preparation"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-12
state: active
version: v2.12
---

# [GUIDE] Version management

版本按职责独立管理：市场 VERSION 与各 plugins/*/plugin.json 的根 version 分别权威。Marketplace v8.1.1 已随 #205 合入 main 发布，diagram-kit 为 0.3.1，explain-kit 为 0.1.1，understanding-kit 为 0.1.2。#206 已将发布 main 同步回 develop；#208 预升阶段先 dry-run 再实际应用 8.1.2 pre-bump，当时只修改 VERSION / README badge 两锚点。市场索引不携带版本，插件不连带预升，8.1.2 不创建标签或 Release。发布身份、安装复查及未完成项见 [8.1.1 发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。

历史 Marketplace v8.1.0 随 #198 发布，插件分别为 diagram-kit 0.3.0 / explain-kit 0.1.0 / understanding-kit 0.1.1。#199 将 main 同步回 develop，merge `a220688d0f46c32f775d4284feb6f9c935085089`；#201 merge `1781e28c37c09a962c0c0edccd6fa2ec574e48d9` 将 VERSION / README badge 预升为当时未发布的 8.1.1。当时 main 保持 8.1.0，pre-bump 没有创建标签或 Release；历史事实及验收缺项见 [8.1.0 发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

当前 PR4 原子替换候选注册为 learning-evidence-kit 0.1.0，diagram-kit 0.3.1 / explain-kit 0.1.1 不变；marketplace VERSION / badge 暂保持 8.1.2。Owner 授权的目标为 8.2.0，PR5 才执行该市场版本准备；新版本尚未发布。正式发布后先同步实际 main，再以另一个 PR 准备 8.2.1 marketplace pre-bump，仅 VERSION / badge 改变。

代理先执行 scripts/bump-version.ps1 的 -DryRun，当前使用 -Scope marketplace、diagram-kit、learning-evidence-kit、explain-kit、html-guide-kit 或 communication-kit；这是版本工具的参数，与 Git 提交 scope 分开。understanding-kit 已退出候选，不再接受新 bump。From 必须匹配真实版本，To 必须合法 semver。脚本在所有目标预检成功后写入；任何写入或校验失败恢复原字节，清理失败只保留备份并报告。历史正文不做全局版本替换。

本 Epic 的集中实施及条件发布授权已提供，分段边界见 [新 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)。发布需要当前 head 非作者批准、required checks、已解决审查线程及实际合格入口证据；严格窗口不合格入口延期并保留 Epic，不用文本 pending 代替窗口验收。版本准备、核心发布、全部计划完成和 Owner 接受分别记录。

owner 于 2026-10-09 授权先应用 8.0.0 / 0.3.0，并同步 CHANGELOG 和发布说明；版本准备不替代未完成的桌面端验收，正式发布仍需完整验收、检查、独立批准与发布授权。learn-kit 不发布新版本。阶段调整与 diagram-kit 的 0.x breaking 规则例外见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。develop 的发布后 pre-bump 保护继续运行。

新增 Understanding Kit 的初始授权覆盖 0.1.0 的实现与 develop PR 准备；owner 在 #195 合并后要求继续后续工作，验收发现的技能修正按插件自身补丁推进到 0.1.1，并通过 #197 合入 develop。当时 marketplace VERSION 保持 8.0.1；[新增 ADR](../adr/[ADR]_Understanding_Kit_Addition.md) 本身不构成正式发布授权。owner 在 8.1.0 准备阶段明确要求“继续后续工作，并发布”，据此准备 8.1.0；正式发布仍受客户端证据、required checks 和当前提交独立批准约束。该次发布完成后的 8.1.1 pre-bump 只更新 VERSION 和派生 README badge，各插件按自身变更推进。

Explain Kit 初始版本已批准为 0.1.0 并通过 #196 合入 develop；其新增时保持市场与既有插件版本。原功能发布建议 8.1.0 随该次授权准备并发布，插件根版本不连带变化，见 [Explain Kit ADR](../adr/[ADR]_Explain_Kit_Addition.md)。

2026-10-10 品牌实施阶段：Owner 批准 Diagram 0.3.1、Understanding 0.1.2、Explain 0.1.1；三个转换分别执行版本工具 dry-run 和实际写入，当时 marketplace 保持未发布 8.1.1、正式身份为 v8.1.0。#203/#204 证据见 [品牌验收](../runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)，随后 #205 发布为 v8.1.1。旧版本正文和公开资产保持。

## Communication 候选工具准备

Epic #222 的 PR2 只让工具接受 `communication-kit` scope；实际插件尚未注册，也没有创建空插件目录。缺少 `plugins/communication-kit/plugin.json` 时，实际运行和 `-DryRun` 都在预检阶段零写入失败。合成夹具验证独立更新、零写入 DryRun 及失败后原字节回滚。真实 From/To 仍须按权威文件与 Owner 版本决定在后续阶段执行；工具支持不等于版本转换或发布。

HTML Guide Kit 的 [新增 ADR](../adr/[ADR]_HTML_Guide_Kit_Addition.md) 预留独立版本工具 scope，但 PR1 不创建 manifest：对缺失包的 dry-run 与实际调用均须失败且零写入。PR2 原子接入初始 0.1.0；首次修改已合并的技能、参考、行为 metadata 或分发资源推进至 0.1.1，其后同范围修正补丁递增。PR3 只修改评审资料或验收记录时保持插件版本，以运行资源哈希证明可复用证据。市场与其他插件版本保持，任务没有正式发布授权。

PR1 #221 实际合入 develop；PR2 创建 HTML Guide Kit 初始根版本 0.1.0，无其它插件或市场版本转换。首次合并前同范围修正仍是初始候选；合并后首次运行变更按既定合同推进0.1.1，再按补丁递增。纯评审或记录变更通过运行哈希证明等价；独立版本工具范围和缺manifest失败合同继续有效。
