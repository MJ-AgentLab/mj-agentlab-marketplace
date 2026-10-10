---
type: runbook
scope: marketplace
summary: "Draft-first Git/tag release with install verification and immutable history"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-10
state: active
version: v2.7
---

# [RUNBOOK] Release operations

## Preparation

两个治理 PR 及迁移 PR 已合并。owner 已授权先完成 8.0.0 / 0.3.0 与正式 CHANGELOG 的版本准备，阶段调整见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。代理执行版本 dry-run、更新、测试与 PR 准备，未完成的桌面端验收继续据实记录。VERSION 变化合入 main 会触发发布，因此正式 release PR 的合并必须已有完整客户端验收、发布意图授权、CI 和独立批准。

#197 合并后，owner 明确要求继续并发布；#198 已合入 main，marketplace v8.1.0 于 2026-10-09 自动发布，包含 diagram-kit 0.3.0 / understanding-kit 0.1.1 / explain-kit 0.1.0。发布后四种 canonical 安装复查通过。真实桌面交互未执行、GitHub 未提供独立批准记录，不能因发布成功推定豁免或补记 PASS。发布身份与后续同步见 [8.1.0 发布记录](./[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

## Draft-first state machine

scripts/run-release.mjs 从指定 SHA 读取 VERSION 与 CHANGELOG，要求 SHA 属于 main，新发布须绑定当前 main tip。既有标签必须 peel 到同一 SHA；既有草稿标题、tag、正文、target SHA 和 prerelease 状态必须一致。

创建空 draft → 有界等待可见 → 验证 canonical Git tree 的安装/发现 → 紧邻 publish 再取远端身份/状态 → publish → 复查 published/immutability。新发布无附加资产；unexpected assets fail closed，既有公开资产不会上传、覆盖或删除。已发布版本只能验证并 noop；故障通过新修复版本处理。

## Post-release

Marketplace v8.1.1 已通过 #205 合入 main 并于 2026-10-10 公开，tag 与 Release 绑定 merge 8f0e044a593408fadc90565f326ef4cb5906e840；发布后四种 canonical 安装、图标比较和实际 Python 校验通过。Owner 截图及未提供的两端完整客户端结果、#205 独立批准缺项继续分开记录，见 [8.1.1 发布记录](./[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。回同步 PR #206 已准备；8.1.2 dry-run 成功但未应用，按下述顺序执行。

记录标签、Release 身份和实际验收；按既有 [pre-bump 决策](../adr/[ADR]_Develop_PreBump_Adoption.md) 先将 main 同步回 develop，再准备 develop 的下一补丁 PR。Portable 格式仅预升 VERSION 与派生 README badge，市场索引不承载版本，各插件根 manifest 不连带更新；先执行版本工具 dry-run。develop badge 表示预计下一版本，不创建同号标签或 Release。回退与历史政策见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

Understanding Kit 初始 0.1.0 通过 #195 合入 develop；行为缺陷修正 0.1.1 已通过 #197 合入，并随 v8.1.0 发布。此前保留 marketplace 8.0.1 pre-bump，[新增决定](../adr/[ADR]_Understanding_Kit_Addition.md) 本身不构成发布授权。已有 [验收记录](./[RUNBOOK]_Understanding_Kit_Acceptance.md) 的历史失败、未覆盖行为及未执行客户端结果保留。#199 同步已发布 main 回 develop，#200 修正发布记录，#201 将 develop 预升为 8.1.1，均已合并并核对实际 Git tree；在该预升阶段 main 保持 8.1.0，各插件保持版本，8.1.1 不创建同号 Release。若并行的主分支文档 PR 产生新的 merge 身份，收尾时同步该 ancestry，保留已预升版本与现有内容。

v8.0.0 的标签、自动发布及合并后安装复查已记录在 [发布记录](./[RUNBOOK]_Portable_Migration_Release_Readiness.md)。已经发布不替代缺失的客户端验收或独立批准证据；保留未执行/未见记录状态，不追认 PASS 或未经提供的豁免。

历史带 wheel/checksum 的 v7.x 发布保留原资产。本次无资产状态机若被手工指向这类历史版本会拒绝重跑，不尝试修复、删除或覆盖资产；验证/noop 只适用于本次及后续无资产版本。
