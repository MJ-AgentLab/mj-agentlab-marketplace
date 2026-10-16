---
type: runbook
scope: marketplace
summary: "Actual 8.3.1 publication, fresh tag checks and ordered closeout"
owner: marketplace-maintainers
created: 2026-10-16
updated: 2026-10-16
state: active
version: v1.2
last-verified: 2026-10-16
---

# [RUNBOOK] Marketplace 8.3.1 release readiness

## §1 Owner decision and frozen scope

本节保留 v1.0 发布准备时的范围与来源；实际发布、治理及复验见 §3.1，新授权顺序见 §3.2。

Owner 本次明确要求“进行发布”，授权 Marketplace 8.3.1 补丁发布及必要发布后核验。范围为已合入 develop 的 [#244](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/244) Windows 临时目录清理修复与 [#245](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/245) CI 性能维护；本准备只补文档与证据，不修改插件运行内容、版本、登记、图标或既有验收规则。沿用已接受的有限客户端证据，不新增模型、桌面或真人效果测试。

- 候选从实际 develop `6df7e12ec700277fa133c63ddaa89c8b32f7bdf6` / tree `378c6cd30db1dd9fa1ba31a476de3f96660423f6` 派生，隔离分支为 `codex/release-8-3-1`。
- 本次 main 基准为 `31cb2cbbefaf1ca55a2d43d7cce74780b40ee31e`；已发布 8.3.0 的实际 main/tag/Release SHA 为 `ae2754dbae2a9acaedf6965ecc4a7b3df7dadd64`。
- Marketplace VERSION 与派生 badge 已预升为 8.3.1；不重复 bump。Diagram 0.3.1、Learning Evidence 0.1.0、Explain 0.1.1、Communication 0.1.0、HTML Guide 0.1.36 保持，共五插件、七公开技能、四显式入口。
- 五包 `plugins` tree 为 `c0fada8bf89e2bd32ade4f4ac47420c574eec9fc`；`.agents/plugins/marketplace.json` blob 为 `43f083c3678b6da99e66f64ad8a888b7125f153e`，均与上述 main 及实际 8.3.0 发布源相同。候选冻结后仍须重新绑定其实际 head/tree。

#245 于 `2026-10-16T13:09:52Z` 关闭。Owner 明确接受的历史批准/bypass 例外仅限该 Issue；[最终收尾回执](evidence/ci-performance-245-final-closeout.json)记录决定、实际合并后检查及证据哈希。此例外不延伸到本次 release PR，不追认历史 GitHub 批准，也不改变 main 保护要求。

## §2 Inherited entry qualifications and limits

依据 [8.3.0 账本的 Accepted limitations 与 R05](./[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)，未变包资源可以匹配原有限入口证据；旧结果保留原客户端、版本、来源和方法身份，不写成本次新交互或完整双端 PASS。

- **Learning Evidence**：沿用 [Entry activation ledger](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md) 的限定 CLI core；handoff 仍限预配置 Git exclude。桌面/Side Chat 未运行、严格原生持续待答入口 DEFERRED、真实学习效果与 Owner 最终产品接受分别保留；未答、默认、超时、关闭不算答复。#215/Epic 不因此关闭。
- **Communication**：保留 [验收 §4/§6](./[RUNBOOK]_Communication_Kit_Acceptance.md) 的 CLI 15 PASS / 3 PARTIAL，以及同一桌面应用两个本机入口的三任务、聊天等待与新 MD/TXT 保存回读限定结果。它们不证明两个独立客户端；既有文件编辑、原生窗口生命周期/预选/关闭/超时、其他经典或云端入口及完整 Office 覆盖仍未验证。
- **HTML Guide**：0.1.36 的 #239 已知 FAIL、完整双端与扩展未覆盖继续保留；旧版有限 Work/Codex 路径不迁移为当前版本全通过。原生空返回、关闭、超时及现实效果未测仍按 [验收账本](./[RUNBOOK]_HTML_Guide_Kit_Acceptance.md) 记录，Owner 最终接受独立。#239 及相关 Epic 不关闭。

所有插件的原 FAIL、PARTIAL、延期、未覆盖、历史批准缺项及 NOT_MEASURED 不因补丁发布升级。若运行资源实际改变，重新界定受影响证据；本轮不扩展功能或恢复延期入口。

## §3 Historical release preparation snapshot

以下步骤与准备表保留 v1.0 当时状态；PENDING 只属于该准备快照，当前实际发布结果见 §3.1。

1. 冻结完整隔离发布候选，保留全部 develop ancestry；核对实际 main 差异、VERSION/CHANGELOG 与包资源身份。按当前候选执行必要工程、文档/A6、准确 CLI 0.147.0 与十三 canonical 安装及缓存 Python 检查，记录新 head/tree 和原始结果。
2. 由 `codex/release-8-3-1` 直接向 main 创建正常 release PR。当前 head 的真实非作者批准、最新推送要求、适用 code-owner 规则、required checks、最新 base 和已解决线程全部满足后才普通合并；不 bypass。任一分支移动，刷新受影响核验与批准。
3. 普通 main merge 触发既有 [draft-first 发布状态机](./[RUNBOOK]_Release_Operations.md)。核对实际 main/tag/Release SHA、发布状态、版本与正文；不竞逐同号发行，不覆盖历史标签、正文或资产。未知结果先回读再决定重试。
4. 发布后从真实 tag 解析 SHA，新执行十三 canonical 安装、资源核对与实际缓存 Python，包括六次 Diagram 校验和六组 Learning 保存/重放/结构核验；Python 调用数、清理与临时路径结果按该次真实日志记录，不借用候选或先前批次。
5. 归档实际发布和复验回执。main → develop 回同步、下一补丁预升及后续收尾另按既有 Post-release 流程和实际授权执行，不预记完成。

| Item | Preparation snapshot | Evidence still required |
| --- | --- | --- |
| Actual develop6df post-merge checks | 已在先前独立批次执行：全套 492/492、十三准确安装、6 Diagram + 18 LEK Python 调用、15 cleanup；见 #245 最终回执 | 只属于该实际 merge，不当作本候选的新执行 |
| New release candidate engineering/CI | PENDING | 最终 head 的实际工程、文档/A6、baseline/commit checks 与服务 CI |
| New candidate exact installation | PENDING | 其实际 SHA 的十三安装、资源及缓存 Python 原始结果 |
| Current-head independent approval/base/threads | PENDING | 真实非作者最新 head 批准、适用 main 规则、required checks 与线程实况 |
| Release PR and ordinary main merge | PENDING | 实际 PR、冻结 head/base、普通 merge SHA/tree；无 bypass |
| Tag and public Release | PENDING | main/tag/Release 身份、自动工作流、published/assets/immutability 的实际观察 |
| Fresh post-publication installation | PENDING | 从真实 tag SHA 新执行十三 canonical 与实际缓存 Python，不复用旧批次 |
| Client evidence | ACCEPTED LIMITED COVERAGE | 仅匹配未变资源；保留 §2 原状态，无新模型/桌面/真人结果 |

v1.0 原说明（历史）：本账本 `last-verified: null` 表示本次发布闭环尚未完成。已有 6df 检查、#245 闭环和 8.3.0 发布事实不提供本次候选批准、main merge、8.3.1 tag/Release 或发布后验收。

### §3.1 Actual publication and fresh tag verification — 2026-10-16

[PR #253](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/253) 由 Owner 于 `2026-10-16T14:27:14Z` 实际合入 main：merge `4e4d4172fb27c812d3be8847f792dae5313daec8`，parents 为 main `31cb2cbbefaf1ca55a2d43d7cce74780b40ee31e` 与候选 `b830f5657f00ce80ab1d833a25353e5df5184664`；tree `9824218ac867b84e5c39eb2109c1d1bd1852f01f` 与已测候选相同。五包、插件版本及登记身份保持 §1 的未变范围。

[v8.3.1 Release](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.3.1) id `415053101` 于 `2026-10-16T14:28:02Z` 由 `github-actions[bot]` 公开；direct tag、Release target 和实际 main merge 均为上述 `4e4d4172`。该次读回 draft=false、prerelease=false、assets=[]、immutable=false、latest=true；immutable=false 是观察值，不是历史不可变保证。[发布工作流 38915888301](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38915888301) attempt1 SUCCESS，流程记录 canonical verified；未取得该内部步骤逐场景/Python raw，不为其补写十三安装或调用计数。

原治理门禁仍为 **NOT_MET**：rule-suite `4563052548` 实际结果 bypass，approval evaluation fail，reviews=[]、REVIEW_REQUIRED。发布身份和技术验收 PASS 不等于原非作者批准 PASS；#245 的限定例外不适用于 #253，也不为后续文档、同步或预升 PR 提供豁免。

发布后新执行从真实 tag SHA `4e4d4172` 开始，UTC `14:30:44.124–14:31:40.255Z`、wall `56131.6758ms`、exit0，开始晚于 publishedAt `162.124s`。本批实际十三安装全部通过、170 命令零错误、6 Diagram + 18 LEK Python 调用及六组 Learning 保存/重放/结构核验通过；130 phases 全部成功、15 cleanup，15 个自有临时根经独立实际 absence 检查。51 项源文件哈希前后保持，完整实际登记列表 `18→18` 一致。宿主保持 `b830` 未切换，目标明确为不同提交 `4e4`，不复用候选安装结果；canonical AGENTS read-time bytes 仍 NOT_MEASURED。此批未重跑 full、24-sample、模型、桌面或效果测试，§2 全部原限制保持。

[发布后汇总回执](evidence/marketplace-8-3-1-postrelease.json)绑定发布身份、工作流、原治理缺项、新 tag 原始输出及独立 raw 重数/路径检查哈希。当前 `last-verified: 2026-10-16` 只覆盖上述实际发布身份与发布后技术复验，不表示原批准满足或后续三步已完成。

### §3.2 Newly authorized ordered closeout

Owner 已明确授权以下三个 PR 顺序推进；每一步使用其实际已交付前序身份，保留正常非作者批准、required checks、最新 base 和已解决线程门禁，不 bypass。

| Step | Current state | Required next identity and boundary |
| --- | --- | --- |
| 1. main 发布记录 PR | MERGED #254 / TECHNICAL_PASS / GOVERNANCE_NOT_MET | actual main761/treeb323 与已测6a4同树；原治理NOT_MET保留，新actual761复验见§3.3 |
| 2. 实际新 main → develop 同步 PR | SYNC_PREPARATION / MERGE_PENDING | 本次从actual main761建立codex/sync-main-8-3-1、base为develop6df；当前head真实批准/CI/线程与actual sync merge后新精确十三安装/Python分别待验 |
| 3. 实际同步后的 8.3.2 pre-bump PR | NOT_STARTED / DEPENDENT_ON_ACTUAL_SYNC | 从已复验的实际 sync 派生，先 dry-run，仅将 Marketplace VERSION/README badge 从 8.3.1 预升 8.3.2，并正常同步 AGENTS/A6；插件版本与运行内容不动，不创建 8.3.2 tag/Release |

第1步实际合并和原治理NOT_MET分别记于§3.3；第2步实际develop merge/复验及第3步apply/merge不预填。各阶段继续分别记录真实head/tree、批准、CI、merge及必要复验；8.3.1已公开身份和历史资产不改写。

### §3.3 Actual #254 merge and main-to-develop synchronization

[PR #254](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/254) 已实际合入 main `7615ca58f410876fc7393b0d93017250fe712091`，tree `b323da8a764120c23544ef9b65df479d9ca7a20f` 与已测候选 `6a4dc55dccb8f19085ca36e0cde06c4fd8e67546` 相同；develop 同步基准仍为实际 `6df7e12ec700277fa133c63ddaa89c8b32f7bdf6`。五包、插件版本和登记不变；已公开 v8.3.1 的 tag/Release 仍绑定 #253 的 `4e4d4172`，不随文档 main 前移。

原治理结果继续 **NOT_MET**：rule-suite `4563644321` 为 bypass，reviews=[]，非作者批准未满足。实际合并不产生独立批准，也不改变本次 sync 或后续 pre-bump 的正常门禁；#245 历史例外不外推。

actual main761 的新精确核验：UTC `15:03:12.936–15:04:07.552Z`，wall `54616.4894ms`，十三准确安装全部通过、170 命令零错误、6 Diagram + 18 LEK 实际 Python 调用及六组 Learning 保存/重放/结构核验通过；130 phases 全部成功、15 cleanup、15 个自有临时根经实际 absence 核对。本次实际执行目标为 main761，宿主仍是原 `6a4`；52 项源文件哈希保持，完整实际登记列表 `19→19` 相同；CLI 0.147.0 / Python 3.12.13 属于该本地批次，原 Git `60000ms` 不变，canonical AGENTS read-time bytes 未测。本次未新跑 full、24-sample、模型或 UI。不得将旧 4e4 发布后或 6a4 候选结果记为 actual761 新执行；原治理 NOT_MET 与技术结果分别记录。计数、时间、独立 raw 核对及治理原件哈希由[发布后汇总回执](evidence/marketplace-8-3-1-postrelease.json)的 `recordPRPostMerge` 附录绑定。

本次复用既有隔离工作区建立 `codex/sync-main-8-3-1`，从实际 main761 派生，准备向 develop 提同步 PR；不新增登记 worktree。候选新检查、当前非作者批准/CI/线程、实际 develop merge 及其新精确十三安装/Python 均待各自实证。stage3 当前不 apply，须依赖实际已合入且复验的 sync 身份。所有 §2 客户端/原生/效果及 Owner 接受边界保持。

## §4 Failure and recovery

失败保留原输出与身份，修复后绑定新候选并补受影响检查。发布结果未知时先核对实际状态，避免重复或同号竞争；已公开版本的问题通过新受保护修复版本处理，不改写历史。客户端或外部批准缺项按原限定边界记录，不制造 PASS、不绕过保护。

## §5 Change history

| Version | Date | last-verified | Summary |
| --- | --- | --- | --- |
| v1.2 | 2026-10-16 | 2026-10-16 | Record actual #254/main761, source-bound verification and historical governance NOT_MET; prepare ordered main-to-develop sync while leaving stage3 dependent and unapplied. |
| v1.1 | 2026-10-16 | 2026-10-16 | Record actual #253 publication, fresh post-tag installation, original governance NOT_MET and newly authorized ordered three-PR closeout; retain preparation history and all client limits. |
| v1.0 | 2026-10-16 | null | Prepare authorized 8.3.1 maintenance release from actual6df with unchanged five packages, inherited limits and separate pending candidate/publication gates. |
