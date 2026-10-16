---
type: runbook
scope: marketplace
summary: "8.3.1 maintenance release scope, inherited limits and pending gates"
owner: marketplace-maintainers
created: 2026-10-16
updated: 2026-10-16
state: draft
version: v1.0
last-verified: null
---

# [RUNBOOK] Marketplace 8.3.1 release readiness

## §1 Owner decision and frozen scope

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

## §3 Normal release procedure and verification ledger

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

本账本 `last-verified: null` 表示本次发布闭环尚未完成。已有 6df 检查、#245 闭环和 8.3.0 发布事实不提供本次候选批准、main merge、8.3.1 tag/Release 或发布后验收。

## §4 Failure and recovery

失败保留原输出与身份，修复后绑定新候选并补受影响检查。发布结果未知时先核对实际状态，避免重复或同号竞争；已公开版本的问题通过新受保护修复版本处理，不改写历史。客户端或外部批准缺项按原限定边界记录，不制造 PASS、不绕过保护。

## §5 Change history

| Version | Date | last-verified | Summary |
| --- | --- | --- | --- |
| v1.0 | 2026-10-16 | null | Prepare authorized 8.3.1 maintenance release from actual6df with unchanged five packages, inherited limits and separate pending candidate/publication gates. |
