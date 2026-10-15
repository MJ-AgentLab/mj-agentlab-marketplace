---
type: runbook
scope: marketplace
summary: "Draft-first Git/tag release with install verification and immutable history"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-15
state: active
version: v2.9.7
---

# [RUNBOOK] Release operations

## Preparation

发布前任务快照（已完成，续办状态见 Post-release）：2026-10-15 本轮按 Owner 已确认计划发布完整 develop 五插件/七技能/四显式的 8.3.0，取代旧 Communication 四包范围。HTML 0.1.36 按当前实现交付，#239 已知 FAIL、双端与扩展未覆盖继续保留；不重启模型/桌面验收，仅执行必要 CI、准确安装及缓存 Python。具体授权与逐项资格以[8.3.0 账本](./[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)为准。当前 head 批准、required checks 和线程门禁保持。完成公开和发布后必要复查即停止；以下既有 Post-release 回同步、预升、文档收尾及 Issue/归档流程留待后续，不在本轮执行。

两个治理 PR 及 portable 迁移 PR 已合并。历史 8.0.0 / 0.3.0 版本准备授权及阶段调整见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。代理执行已授权 dry-run、更新、测试与 PR 准备，缺项据实记录。VERSION 变化合入 main 会触发发布，正式 release PR 必须满足实际发布范围的客户端验收、发布授权、CI、当前 head 非作者批准及已解决审查线程。

Learning Evidence Epic #209 已获集中实施及条件发布授权，Owner 接受双技能/接口不变、核心独立验收后交付，不能满足严格原生窗口的入口延期。PR4 暂保持市场 8.1.2，PR5 准备 8.2.0 并逐项列实际可启用入口；未提交/默认/超时/关闭不算答复，文字重述/pending 不算窗口持续显示通过。按 [新 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)与[验收账本](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)核对证据；核心发布不完成原 Epic，延期项、两个收尾 PR 和 Owner 最终接受仍独立追踪。

#197 合并后，owner 明确要求继续并发布；#198 已合入 main，marketplace v8.1.0 于 2026-10-09 自动发布，包含 diagram-kit 0.3.0 / understanding-kit 0.1.1 / explain-kit 0.1.0。发布后四种 canonical 安装复查通过。真实桌面交互未执行、GitHub 未提供独立批准记录，不能因发布成功推定豁免或补记 PASS。发布身份与后续同步见 [8.1.0 发布记录](./[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

## Draft-first state machine

scripts/run-release.mjs 从指定 SHA 读取 VERSION 与 CHANGELOG，要求 SHA 属于 main，新发布须绑定当前 main tip。既有标签必须 peel 到同一 SHA；既有草稿标题、tag、正文、target SHA 和 prerelease 状态必须一致。

创建空 draft → 有界等待可见 → 验证 canonical Git tree 的安装/发现 → 紧邻 publish 再取远端身份/状态 → publish → 复查 published/immutability。新发布无附加资产；unexpected assets fail closed，既有公开资产不会上传、覆盖或删除。已发布版本只能验证并 noop；故障通过新修复版本处理。

## Post-release

v8.3.0 已由 #241 于 2026-10-15 合入 main，实际 merge/tag/Release target 为 `ae2754dbae2a9acaedf6965ecc4a7b3df7dadd64`；github-actions[bot] 07:51:33Z published，workflow 38701485705 success，assets=[]、immutable=false 为实际观察。发布后 07:55:29–07:56:54Z 十三 canonical、6 Diagram + 6 Learning 实际缓存 Python 通过；R05只对应已有有限客户端证据，不新增界面/模型/效果结论。#240/#241 reviews=[]；后续规则审计确认两次合并与develop删除的最终结果为bypass，详见账本，不写保护批准通过。用户续办的文档收尾与常规维护按原授权处理；用户明确要求关闭自动删分支和恢复develop后，设置已false、原head32e32c5普通创建恢复，规则审计4536963592为PASS且保护规则不变；同步/预升仍走受保护PR。完整回执见[8.3.0 账本](./[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)。

Marketplace v8.2.0已通过#232/main ebc4bdc3于2026-10-13自动公开，原三插件/五技能/两显式学习策略，发布后五精确canonical安装与实际Python通过；空reviews及immutable配置未提供/Release immutable=false保留，见[发行账本](./[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)。#234实际合入2c0a8317同步main ancestry并保留HTML四插件开发集合，#235实际合入3af68373完成未发布8.2.1预升；两次merge各八精确安装/实际Python通过，见[收尾回执](evidence/learning-evidence-8-2-0-closeout.json)。版本工具先dry-run再只更新VERSION/README badge，插件版本保持，无同号tag/Release。原两文件预升的[skip a6]缺当前head签核失败如实保留；Owner要求修复后补充真实根AGENTS摘要、移除跳过标记，最终三路径走正常A6，通过且不修改门禁。纯两文件例外仍须既有精确非作者签核，正常摘要同步不需专用N/A正文；普通当前head非作者批准要求保持。两PR的空reviews不追认批准/豁免，原生/桌面/效果/Owner接受仍在OPEN Epic独立追踪。

Marketplace v8.1.1 已通过 #205 合入 main 并于 2026-10-10 公开，tag 与 Release 绑定 merge 8f0e044a593408fadc90565f326ef4cb5906e840；发布后四种 canonical 安装、图标比较和实际 Python 校验通过。Owner 截图及未提供的两端完整客户端结果、#205 独立批准缺项继续分开记录，见 [8.1.1 发布记录](./[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。#206 已回同步发布 main；本分支随后先 dry-run 再实际应用仅 VERSION / README badge 的 8.1.2 pre-bump，插件版本保持。同期 main 文档 PR #207 的实际 merge ancestry 在收尾时继续纳入。

记录标签、Release 身份和实际验收；按既有 [pre-bump 决策](../adr/[ADR]_Develop_PreBump_Adoption.md) 先将 main 同步回 develop，再准备 develop 的下一补丁 PR。Portable 格式仅预升 VERSION 与派生 README badge，市场索引不承载版本，各插件根 manifest 不连带更新；先执行版本工具 dry-run。develop badge 表示预计下一版本，不创建同号标签或 Release。回退与历史政策见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

Understanding Kit 初始 0.1.0 通过 #195 合入 develop；行为缺陷修正 0.1.1 已通过 #197 合入，并随 v8.1.0 发布。此前保留 marketplace 8.0.1 pre-bump，[新增决定](../adr/[ADR]_Understanding_Kit_Addition.md) 本身不构成发布授权。已有 [验收记录](./[RUNBOOK]_Understanding_Kit_Acceptance.md) 的历史失败、未覆盖行为及未执行客户端结果保留。#199 同步已发布 main 回 develop，#200 修正发布记录，#201 将 develop 预升为 8.1.1，均已合并并核对实际 Git tree；在该预升阶段 main 保持 8.1.0，各插件保持版本，8.1.1 不创建同号 Release。若并行的主分支文档 PR 产生新的 merge 身份，收尾时同步该 ancestry，保留已预升版本与现有内容。

v8.0.0 的标签、自动发布及合并后安装复查已记录在 [发布记录](./[RUNBOOK]_Portable_Migration_Release_Readiness.md)。已经发布不替代缺失的客户端验收或独立批准证据；保留未执行/未见记录状态，不追认 PASS 或未经提供的豁免。

历史带 wheel/checksum 的 v7.x 发布保留原资产。本次无资产状态机若被手工指向这类历史版本会拒绝重跑，不尝试修复、删除或覆盖资产；验证/noop 只适用于本次及后续无资产版本。

## Current closeout revision

v2.9.5 (2026-10-15): Append actual five-package publication and fresh post-publication installation receipts, retain limited R05 and missing independent reviews; distinguish resumed maintenance from the prior release task stop boundary.

v2.9.3 (2026-10-13): Record the actual #234/#235 ordered merges and exact canonical installation/Python checks; retain original A6 failure/normal root-summary repair, missing independent reviews and all deferred Epic entries. Published three-plugin 8.2.0 and unpublished four-plugin development 8.2.1 remain separate.
