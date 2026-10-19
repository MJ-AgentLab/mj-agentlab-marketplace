---
type: report
scope: marketplace
summary: "Actual plan-path migration, failures, verification and remaining protected delivery"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.3
layer: working
task: 269-plans-path-unification
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269
---

# [REPORT] Plans path unification

[任务入口](./INDEX.md) · [主 PLAN](./[PLAN]_Plans_Path_Unification.md) · [Issue #269](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269) · [主 PR #270](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/270)

## Actual scope and candidate A

Owner 明确要求实施后，Agent 建立 #269 与唯一主 PR #270，实际核对内部集成分支无保护、develop 仍要求当前 head 非作者批准/CI/线程。A 工作候选基于 bootstrap 7969d6f，迁移两原件、建立 222 唯一入口/PLAN/REPORT，同步当前规范/导航，原子移除 smoke/fixture 对旧目录的必需依赖。插件/版本、53 项兼容清单原字节未改；根 AGENTS 为 15952 字节。

两原件从固定 91f982f70552fc0bfdf4015da943e257a22d4c7b 的原 Git blob 恢复，迁入快照逐字节一致，身份与实际摘要见 [222 来源清单](../222-communication-kit/source-bindings.json)。原始完整计划及 provenance 只作历史恢复，未把当时接受转授给新主 PLAN。A 已删除根 plan/，当时尚不独立宣称全部 S2 完成；B 后续删除解析豁免并拒绝重新引入，实际结果见下方集成记录。

## Failures, repair and reproducible checks

| 实际轮次 | 输入 / 方法 | 结果与边界 |
|---|---|---|
| Bootstrap 格式检查 | 初始来源记录含真实 CRLF / 末尾空行，git diff --check 报告；PowerShell 未因该 native 非零自动停止，bootstrap 仍提交 | 保留这一过程失败。A 为精确来源文件补齐字节格式属性，普通 INTENT 多余 EOF 修复；未改 checker、CI 或旧路径兼容规则 |
| A 首轮严格校验 | 新 222 INDEX 的 canonical 数组含旧未显式分层 SPEC | FAIL；改为仅登记显式 canonical 的 ADR/Standard，正文 SPEC 相关链接保留，不扩大旧文档改造 |
| A 首轮完整测试 | npm test，597 项 | 595 PASS / 2 FAIL，来源为上述 canonical 登记，见[原始失败日志](./evidence/a-initial-tests.log) |
| A 独立来源/语义评审 | /root/inspect_plan_unification 只读检查实际 diff、Git 原件、链接/接受边界 | 首轮发现历史接受误指新 PLAN，修复为历史原件；第二轮明确无阻断。独立评审是 Agent 合成核验，不是 GitHub 非作者批准或 Owner 最终接受 |
| A 修复后严格校验 | npm run validate，实际工作候选 | PASS；所有公共技能/仓库技能登记保持。最后提交的 CI 仍须绑定真实 head |
| A 修复后完整测试 | npm test，实际工作候选，211361.0614ms | 597 PASS / 0 FAIL / 0 skip，见[原始修复日志](./evidence/a-fixed-tests.log)；不外推 B 或最终集成 |
| A 源身份 / 范围 | 两原件与固定 Git blob 逐字节、53 项兼容清单不变、插件/版本 diff 空、根预算/空白检查 | PASS，独立再次核对一致；具体 PR/CI 和合并 head 以实际发生追加 |

实际日志使用来源原字节，字段/时间只报告已观察值；运行未提供准确起止墙钟时不补造，消息捕获时间不替代实际决定时间。

收据批首次暂存后，git diff --cached --check 对两份真实 CRLF 来源报错，命令按非零立即停止、未提交。为 b-premerge-checks / product-reading-round1 两精确路径声明 cr-at-eol 后复验；后续 product-reading-q4-retest 原始 CRLF 同样先被拦截，再对该精确路径声明格式。来源原字节/绑定未改，普通文本和路径 Harness 门禁保持。

## Integrated core and independent acceptance

实际内部 A [#271](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/271) 于 2026-10-19T07:48:24Z merge 8327ba99，树与已测 09e1bd5 一致；Ubuntu/Windows 基线全通过。B [#272](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/272) 于 07:51:43Z merge 43048e00，实际树 60468a954c863e5da3d39c4f692023de78e875a4 与已测 16984cc 完全相同。内部目标无实际保护、线程完整且无未解决项；两平台基线各有同 head SUCCESS。B 合入时另一个重复 Windows job 仍运行，未将该 job 写 PASS，见[实际门禁回读](./evidence/sources/b-premerge-checks.json)，未使用 bypass。

[核心运行收据](./evidence/core-verification.json)绑定实际 head/tree：612/612 完整单测，0 skip；strict validate PASS；CLI 0.147.0 下 13 canonical 组合、6 次 Diagram Python 与 6 组 Learning Python（各 save/replay/check，18 次操作）全成功。原始[完整单测日志](./evidence/b-full-tests.log)和[72 项定向测试](./evidence/b-targeted-tests.log)保留。收据/措辞修复是后续文档增量，不冒称最终收据 head 与核心测试树相同；最终文档/闭包及主 PR 检查另验。

| 独立角色 / 真实范围 | 原始结果与恢复 | 当前边界 |
|---|---|---|
| 管理阅读，/root/manager_reading | [原轮](./evidence/sources/manager-reading-round1.json)：Q1/Q2/Q4 PASS，Q3 FAIL（#222 旧顶部与实际 8.3.1 发行矛盾）；更新当前顶部、旧正文逐字保留在历史区，API[前](./evidence/sources/issue222-before.json)/[后](./evidence/sources/issue222-after.json)回读保存；[Q3 重跑](./evidence/sources/manager-reading-q3-retest.json) PASS | 原 FAIL 不覆盖，不平均抵消；对原未受影响三题沿用原限定结果 |
| 产品原意阅读，/root/product_acceptance | [原轮](./evidence/sources/product-reading-round1.json)：Q1–Q3 PASS，Q4 FAIL（INTENT 将候选迁移与最终接受合写“尚未发生”，REPORT 尚为 A 阶段） | INTENT 改为分别链接实际结果/真实接受、不复制进度，并补本节 A/B 实证；[Q4 单题复验](./evidence/sources/product-reading-q4-retest.json)在 5782807e 上 PASS，原 FAIL 不覆盖，Q1–Q3 沿用原限定结果 |
| 开发运维，/root/devops_acceptance | [原始答案/探针](./evidence/sources/devops-reading.json)：固定 Git 与无 Git 两原件恢复/篡改拒绝、五种根实体、八相对链接及合法历史正例均 PASS；Q4 NOT_COMPLETE（平台/最终门禁尚未完整） | 取证器首次 EISDIR 及修正重取分别保留，不冒充 Harness 失败；后来核心测试/安装证据由本节补足，保护合入与 Owner 接受仍未发生 |

## Receipt verification and final delivery boundary

收据批实际 [npm run validate](./evidence/receipt-validate.log) PASS；真实 [source projection 定向运行](./evidence/receipt-projection.log) 1/1 PASS、0 skip（149324.9871ms）。独立 /root/inspect_plan_unification 只读复核本收据工作增量，确认七新来源摘要、612/72 日志、13 组合与实际同树吻合，无阻断或真实凭据；没有运行新测试或冒充平台批准。后续只追加本次 Q4 原始复验、其绑定与阅读状态，最终文档校验和真实 head CI 仍各自执行。B 合入时未结束的重复 Windows job 后续 API 回读为 SUCCESS，原合入时 IN_PROGRESS 快照保留。

## Pre-merge delivery snapshot (af13e63)

以下为合并前真实待办；后来发生的合入、规则绕过与复验见下一节，不将原缺项追改为当时已满足。

- 两内部 PR、旧根/当前链接拒绝及产品 Q4 阶段措辞修复后的独立重跑已实际完成；收据批文档/来源闭包已验，最后 Q4 来源绑定仍执行严格校验，真实最终 head CI 与保护批准由主 PR 记录。
- 核心树完整单测、strict validate、13 组合 canonical / 实际 Python 已通过，角色阅读的原失败/修复与仍缺的最终条件分开；文档收据后续增量不外推旧 head 的最终平台批准。
- 保护 develop 的当前 head 非作者批准、CI、线程、基线和实际合入/复验分别记录，不 bypass，不由 Agent 自检代替。
- 未答原生窗口持续显示仍缺客户端实证，保留对应延期，不标通过；插件模型/客户端/现实效果不在本批重测范围。
- 核心工程交付、完整计划完成、实际受保护合入及 Owner 最终成品接受分别判断，尚未发生不预写完成；无正式发布。

## Actual develop merge and post-merge verification (#270)

[#270](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/270) 于 2026-10-19T08:17:52Z 由 ranzuozhou 合入 develop，实际 merge 7d6d27dad91b7d02c8cb3841825fab5ba969af43，tree 8d3222a3df1c07b57840a9de76a35000eca49b5d 与最终已测 af13e63 完全相同，父提交为 91f982f7 / af13e63。Owner 后续原话“#270 PR 已合并，继续后续工作”授权继续收尾，未据此推定最终成品接受。

[平台原始观察](./evidence/sources/postmerge-270-platform.json)中的 reviews 全页为空；[规则评估 4595587076](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/rulesets/rule-suites/4595587076)实际为 **bypass**，pull_request 规则因缺少非最后推送者批准而 FAIL，required_status_checks 为 PASS。记录这是实际 Owner 合入，不追认非作者批准，不把本次事实扩展为未来保护例外；Agent 未执行 bypass 或修改保护。

[新合并后收据](./evidence/sources/postmerge-270-verification.json)逐次绑定真实 merge、Node v22.18.0、起止时钟和前后 clean：

| 新运行 | 实际结果 | 可恢复输出 |
|---|---|---|
| npm test；08:20:30.299Z–08:23:26.045Z | 612 PASS / 0 FAIL / 0 skip；TAP 175568.5365ms | [完整日志](./evidence/sources/postmerge-270-tests.log) |
| npm run validate；08:20:30.315Z–08:20:56.809Z | PASS；完整文档/来源身份校验 | [完整日志](./evidence/sources/postmerge-270-validate.log) |
| npm run smoke:codex；08:20:30.340Z–08:29:18.343Z | 13/13；CLI 0.147.0；6 次 Diagram Python、6 组 Learning（18 次 save/replay/check）均实际成功，所有命令状态 0 | [13 组合与实际命令](./evidence/sources/postmerge-270-canonical.log) |

S1/S3 的唯一 plans 入口与主计划、S2 的拒旧根/旧当前链接、S4 的原件恢复/真实历史均由实际同树、两原件逐字节、完整回归/资源闭包及既有独立阅读支撑。原两来源仍与固定 91f982f7 Git blob 一致；插件树、VERSION/README、53 项其他文档兼容清单相对该范围基线无变更。工程侧目录治理已交付；原意范围的独立阅读保留各轮结果，Owner 最终接受没有新证据。

[独立合并后事实核验](./evidence/sources/postmerge-270-independent.json)由 /root/inspect_plan_unification 完成：同树/两原件、612/validate、13 组合与 6/18 Python、批准缺项、已合并分支祖先/归档和原工作区保持均独立确认。canonical 初读进行中、08:30:34Z 窄回读成功分别保留；没有运行真实恢复，也没有把未读的后续收尾文档或 Owner 接受写入该结论。它指出的两条 PR270 失效分支链接由 Agent 修为固定 merge SHA；本批后续文档仍单独校验。

## Safe task cleanup and remaining obligations

[清理回执](./evidence/sources/postmerge-270-cleanup.json)核对三条旧分支 head/已合并 PR/merge ancestry 与工作区状态后，以 expected-SHA leases 原子删除远端 refs，再用普通 branch -d 删除本地 codex/plans-unification、codex/plans-unification-docs、codex/plans-unification-guards。[应用回读](./evidence/sources/postmerge-270-archives.json)确认两个子 worktree 已归档，可恢复快照保留；额外两日志归档前保存并核对摘要；[原 B 定向日志](./evidence/b-targeted-tests.log)和[原 B validate 字节恢复记录](./evidence/sources/postmerge-270-preserved-guards-validate.json)继续可恢复。依赖/pycache 可重建；主隔离工作树复用为收尾分支，原 D: develop 三项未提交改动保持，未清理其他任务。

本次收尾复用原 INDEX/PLAN/REPORT 和 #269；前一主 PR 已结束，收尾证据 PR 是下一批唯一活动主 PR，不另开需求 Issue。后续文档增量不能冒称与上述 merge 测试同树，其严格文档/来源闭包、实际最终 head CI 与保护条件分别核对。

| 剩余事项 | 状态 / 责任 / 恢复条件 |
|---|---|
| 原生未答窗口持续显示 | DEFERRED / NOT_VERIFIED；Agent 取得实际客户端持显及未提交/默认/超时/关闭行为证据后再恢复对应入口；当前无待决范围问题，不以文字 pending 代替窗口实证，不计通过 |
| 本批收尾证据的保护合入 | Agent 完成本批检查/PR；按实际 develop 规则取得当前 head 非作者批准、CI/线程/基线后合入；#270 的 bypass 不提供新豁免 |
| Owner 最终成品接受 | 尚未提供；由真实 Owner 决定单独记录，工程/合并/合成核验不替代。#269 保持开放跟踪延期与接受义务 |

无新的插件模型/桌面/现实效果测试，无正式发布；原失败、PARTIAL、未覆盖和后续实证各按当时范围保留。
