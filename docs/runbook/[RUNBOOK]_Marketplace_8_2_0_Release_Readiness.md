---
type: runbook
scope: marketplace
summary: "Marketplace 8.2.0 preparation, entry boundaries and protected release evidence"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-13
state: active
version: v1.1
last-verified: 2026-10-13
verification-scope: preparation-version-and-existing-evidence-only
---

# [RUNBOOK] Marketplace 8.2.0 release readiness

## §1 Preconditions and current state

本账本记录 **8.2.0 发布准备**，没有记录正式发布成功。Owner 已授权 Epic [#209](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/209) 的集中实施及条件发布，并接受保留两个公开技能和共用接口、核心独立验收后分段交付；不能满足严格原生窗口的入口延期，Epic 保留未完成事项。遵循 [迁移 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[记录/API 契约](../spec/[SPEC]_Learning_Evidence_Record_And_API.md)和[发布操作](./[RUNBOOK]_Release_Operations.md)，不重复索取已提供的授权。

当前 main 和公开 Release 仍为 **8.1.1**。8.2.0 尚未合入 main，发布标签和 Release 尚未创建。`last-verified` 仅描述本次准备、版本文件及已有证据核对，不表示最终候选、客户端或发布验证完成。实时远端状态、最终 head/tree、批准和检查须在合入/发布前重新读取。

| 对象 | 当前身份或状态 | 本记录的证据边界 |
| --- | --- | --- |
| Marketplace 候选 | 8.2.0，未发布 | PR5 对 8.1.2 → 8.2.0 执行 dry-run 后 apply；版本工具仅更新 VERSION / README badge 两文件 |
| Learning Evidence Kit | 0.1.0 | 直接替换 Understanding 注册，pop-quiz / learning-record-check 均显式启动；共用能力不是第三技能 |
| Diagram / Explain | 0.3.1 / 0.1.1 | 本 Epic 保持其版本；批准图标复用和包归属见技术验收账本 |
| 候选集合 | 三插件、五公开技能、两项显式学习策略 | 安装/发现通过不能代替实际模型、桌面调用或原生窗口验收 |
| 最新运行修复来源 | PR4 新核验生成信息修复已正常继承至 PR5 | 新作者/LRC 来源/操作/实际事件时间使用当前事实，保留原件；第四轮新源码实际验收待完成 |
| 已冻结并安装的 8.2.0 技术来源 | `36ef16cd8798b107e16673e1520f3086964c4e3e` | [技术回执](evidence/learning-evidence-acceptance-checks.json)记录精确 Git tree、290-test 日志、五种 canonical 安装及模型冻结摘要 |
| 最终交付 head / Git tree | PENDING | 完整回执及审查记录提交后重新冻结，比较运行资源并复核当前 head 门禁；不把前一候选身份冒充最终交付 |
| Main 发布 merge / v8.2.0 tag / Release 身份 | NOT_RUN | 尚无本次公开发布身份；不得用候选版本或旧发布结果代填 |

阶段依赖及关闭条件继续按 [验收账本](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)追踪：

| 阶段 | 实际 PR / 子 Issue | 当前状态 |
| --- | --- | --- |
| 契约与迁移 | [#216](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/216) / [#210](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/210) | 已合入，子 Issue 已关闭；不追认未提供的非作者批准 |
| 本机证据库 | [#224](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/224) / [#211](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/211) | 等待实际当前 head 的独立批准及合入 |
| GitHub 流转 | [#227](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/227) / [#212](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/212) | Draft，依赖 #224；批准/合入独立待办 |
| 原子插件切换 | [#228](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/228) / [#213](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/213) | Draft，依赖 #227；批准/合入独立待办 |
| 技术验收与 8.2.0 准备 | Draft [#230](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/230) / [#214](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/214) | 技术来源 36ef16cd 已冻结/安装；完整模型接受、最终交付 head 及 merge 仍 PENDING |
| 正式发布与跟踪 | [#215](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/215) | NOT_RUN；发布 PR 只写 Refs，不自动 Closes Epic |

## §2 Steps and evidence preparation

代理继续执行已有授权工作。先完成最终候选和明确入口的技术验收，再复核远端依赖、当前 head 的真实非作者 APPROVED review、required checks 和已解决线程。合成角色或本机独立审查不替代 GitHub 所要求的外部身份；不使用 bypass。只有缺少必要外部身份、技术权限或实质决定时，请求最小参与。

### §2.1 Preserve completed engineering evidence and original failures

| 方法与输入 | 已观察结果 | 版本/限制与保留证据 |
| --- | --- | --- |
| PR4 完整工程回归；临时证据库、合成身份及受控 gh 替身 | PASS：288/288，0 fail / 0 skip；33 storage / 31 GitHub 实际 Python 用例 | Python 3.12.13；[PR4 结构化回执](evidence/learning-evidence-switch-checks.json)。覆盖当时工作源候选，不能代替最终 8.2.0 冻结提交回归 |
| PR4 五种工作源安装：Diagram、Explain、Learning 单独，Diagram＋Explain，全部三插件 | PASS：Codex 0.147.0 安装/发现、两项显式策略、缓存资源比较、安装副本 save/replay/check；Diagram 实际 Python FAIL 0 / WARN 0 | 无关 cwd、独立缓存与库；属于工程安装/共用脚本运行，不是技能模型或桌面调用验收 |
| 精确 Git 来源的五种 canonical 安装 | PASS：旧来源 `e473a7b3aebc97fff2d45e9f7d1495461a9b58e4` 与修复后 8.2.0 `36ef16cd8798b107e16673e1520f3086964c4e3e` 分别实际核验 | 各来源证据分开；本次 36ef16cd 的完整结果见技术回执。未来最终交付若改变 source/tree 仍须据实际复核，不能静默沿用 |
| PR3 Windows 测试替身编码故障与独立 cp1252 复现 | 原失败保留；fixture 显式 UTF-8 流修复后 284/284、31 GitHub / 33 storage 通过 | 修复提交 `387f0ae2af609397a41f42b390111a5116958304` 的实际远端检查已成功；四个生产模块未为该 fixture 修复改写。原失败和修复范围见 [PR3 回执](evidence/learning-evidence-github-checks.json)及[验收账本](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md) |
| PR4 初始 Ubuntu 提前退出 | 原失败原因 UNKNOWN；同 head 的另一次 run 成功，原失败 run 的 attempt 2 重跑成功 | 保存失败与后续成功的独立状态；不能将成功重跑记为已定位或修复根因。最终门禁仍须复核当前 head |
| PR5 最新修复与 8.2.0 工作候选完整工程回归 | PASS：290/290，0 fail / 0 skip；33 storage / 31 GitHub 实际 Python 用例、严格结构及精确 Codex baseline 通过 | 实际完整日志保留；本次包含最终 Unicode/应用解释修复和未发布 8.2.0 文档。Canonical Git 安装和实际模型仍分别待冻结后执行 |

### §2.2 Record actual model rounds separately

第一轮是 Codex 0.147.0 安装精确来源 `e473a7b3aebc97fff2d45e9f7d1495461a9b58e4`、实际默认模型 `gpt-5.6-sol`、无模型覆盖的四个 fresh 合成会话。完整原始输入、观察、库前后 hash 和 transcript locators 保留在 [第一轮回执](evidence/learning-evidence-first-model-round.json)，不在后续成功时删除或改写。

| 场景 | 第一轮实际结果 | 后续要求 |
| --- | --- | --- |
| 自然工程请求 | PASS_LIMITED：未隐式启动学习技能或保存；部分读取被执行策略拒绝 | 第二轮首个 natural 场景已在实际 workspace-write 条件下通过；只覆盖该场景，完整第二轮回执与其余场景 PENDING |
| 原生测验延期处理 | PASS_LIMITED：读取包内入口账本后暂停，没有新增知识题/评分/写库 | 该行为不证明原生窗口持续显示；两原生测验入口仍 DEFERRED |
| 既有完整记录移交保存 | FAIL_ENVIRONMENT：直接移交路由正确，实际保存被 read-only 执行策略拒绝，没有保存/关联回执 | 第二轮实际保存/关联 PASS，原件对象精确保留，限预先配置本地 Git exclude 的 worktree；工具定位失败仍保留，不记全命令成功 |
| 未指定记录/任务的 LRC | FAIL_SEMANTIC：模型枚举库并自行选择原件 | 第二轮完整事件无库枚举或工具执行，直接等待必要选择；该分支修复在该冻结来源中已观察通过 |
| 缺材料、材料到达、不同来源作者、他人记录 | NOT_RUN 于第一轮 | 最终覆盖、方法、输入、观察及限制须逐项补录，不能由代码或说明推定 PASS |

第二轮使用现有 Windows native sandbox 实现、managed constraints、限定 TEMP 可写范围、新隔离根及模型会话，冻结来源为 `26edea32edcab682a815a19e60c974d40986bebe`。实际六会话/七回合后停止，完整中性输入、命令/API 失败、回执与哈希见 [第二轮原始回执](evidence/learning-evidence-second-model-round.json)，auth 副本清理后为零。natural、延期停止、直接保存与缺选择等待分别通过其有限判准。

缺材料场景整体 FAIL：模型先执行实现/应用探针，最终 not_run 不撤销先行动作；其记录核验、追加保存与仅指定 PR 的完整替身分享分别保留正面结果。材料到达场景两阶段也 FAIL：第一阶段将测验答案代替本人应用解释并提前评估，第二阶段没有新手动触发仍重评应用。第三阶段、不同来源作者及他人记录未执行，不把 seed 或预计分支当通过。此外，实际客户端忽略 176 字符的 LRC listing 示例。

候选已修复：应用调查/探针之前检查本人应用解释及既有材料等全部前提，禁止测验答案/AI 推断/任务文本替代；缺项立即停止应用阶段，材料到达仍须新手动触发。listing 示例缩至 89 个 Unicode scalar values，严格拒绝超 128、超过三条及未配对 surrogate。修复检查及不同测试字节快照见 [修复回执](evidence/learning-evidence-entry-gates-checks.json)；原失败不覆盖。第三轮已在精确 8.2.0 来源 36ef16cd 执行九场景/十一回合，完整实际行为结果为 FAIL；不能继续描述为未执行。

第三轮的完整原始回执见 [第三轮证据](evidence/learning-evidence-third-model-round.json)：等待、范围选择、原件移交、应用比较及限定分享有各自正面观察；新增条目却误用原作者或 Pop Quiz 来源，他人记录另伪造晚于保存时间的事件时间。候选已明确使用实际生成代理、当前 LRC 版本/上下文、真实操作及观察到的时钟，重试保持相同请求字节；共用 Python、schema 与原件保持。第四轮七场景/九回合已准备，安装、模型和独立完整审查尚未完成。

Owner 已确认 8.2.0 仍为原定三插件/五技能/两项学习策略。develop 保留 #226 的 HTML，Learning Evidence 替换后开发集合为四插件/六技能；独立公开候选只含 Diagram、Learning Evidence、Explain，HTML 另行发行。不得以原公开集合校验删除 develop 的已合并 HTML。

### §2.3 Classify entries before enabling publication scope

| 实际入口/能力 | 当前状态 | 影响、条件及解除要求 |
| --- | --- | --- |
| Codex CLI 完整输入的非交互核心操作与显式技能调用 | ACCEPTANCE_PENDING | 第二轮实际保存/指定记录有效性有有限通过，材料门槛失败已修复；最终来源完整实际模型接受前不启用应用路线 |
| 新建 worktree 本地 Git exclude | BLOCKED_IN_RESTRICTED_ROUTE | native sandbox 限制首次 Git 元数据写入；不宣称该受限模型入口自动创建 exclude。PR2 隔离实际 Python 的自动 exclude 证据保留其原范围 |
| 已有本地 exclude 的完整记录移交 | CONDITIONAL / FINAL_SOURCE_PENDING | 第二轮实际保存、关联、引用清单和回执通过，原件精确保留；只限已有排除配置，准备配置不算模型创建 exclude，通过范围须与最终来源绑定 |
| `codex-native-questions` | DEFERRED | 未取得提交前连续显示的实际窗口证据；未答、默认、超时、关闭均不算答案。须以可操作的实际客户端/版本/入口逐项验证后解除 |
| `chatgpt-desktop-native-questions` | DEFERRED | 当前缺可执行桌面安装/调用/窗口验收入口；须取得同来源的实际安装、调用及严格窗口证据后解除 |
| Codex 桌面实际调用 / Side Chat | NOT_RUN | CLI 安装、共用脚本或模型输出不能替代真实桌面入口结果；实际控制和可复现调用证据待补 |
| ChatGPT 桌面实际调用 | NOT_RUN | 原有 8.1.1 截图不证明新候选安装、技能调用或原生窗口；缺项单独保留 |

两公开技能和共用接口保持。当前没有启用新的交互知识提问入口，文字重述或逻辑 pending 不代替原生窗口通过。输入齐备、已授权的保存/核验/共享核心可按其自身实际验收交付；缺少非核心入口不自动否定已通过核心，也不得将延期入口改写成通过。Owner 已接受这项分段边界，完整原计划与最终成品接受仍分开。

### §2.4 Execute the protected draft-first release only after readiness

按 [发布操作](./[RUNBOOK]_Release_Operations.md)执行，不在本记录复制另一套发布实现：冻结最终 8.2.0 head/tree 和准确 CHANGELOG，完成该提交的工程/安装/已启用核心验收，依顺序合入 develop 并保留 HTML；从通过验收的原三插件来源准备独立 main 发布 PR，再复核其当前 head 门禁和与已验收资源的一致性。

门禁满足后由代理执行获授权的发布流程：绑定实际 main tip 创建空 draft，验证其 canonical Git tree 的安装及实际 Python 运行，紧邻 publish 重新核对 tag/draft/body/target SHA，公开后复核版本/标签/Release/提交及安装。任一步结果不明，先读取实际远端状态再恢复缺失步骤；缺少证据或权限时保持原状态，不提前标记公开成功。

## §3 Verification and pending release fields

| 核验对象 | 当前结果 | 最终须记录的事实 |
| --- | --- | --- |
| 条件发布授权与分段边界 | AUTHORIZED / ACCEPTED | 本记录 §1 与已接受 ADR；边界未实质变化时复用 |
| 8.1.2 → 8.2.0 版本准备 | APPLIED，未发布 | VERSION / README badge 两锚点；最终冻结提交及对应检查 PENDING |
| 8.2.0 技术来源完整工程及 canonical 安装 | PASS_FOR_36EF16CD | 290/290、零跳过，严格校验/精确 baseline、五种精确 Git 安装和实际图表/共用 Python 通过；未来最终交付另核当前身份 |
| 修复后完整核心实际模型验收 | THIRD_ROUND_FAIL / FOURTH_ROUND_PENDING | 各场景输入/source/模型版本、实际操作与独立审查；不得合并不同轮次为无失败 PASS |
| 当前 head 的真实非作者 APPROVED review | PENDING | 合格非作者、review 状态及绑定 head；Agent 自检不替代 |
| Required checks / resolved threads | PENDING FOR_FINAL_HEAD | 实际远端检查结论及审查线程；既有绿色 CI 不覆盖未来最终 head |
| 正式发布 PR / main merge | NOT_RUN | PR 号、head、批准/检查/线程事实、实际 merge SHA/tree |
| v8.2.0 标签 / Release | NOT_RUN | tag peel、Release ID/URL/target、正文版本、实际 publish 状态；不覆盖历史标签或资产 |
| 发布后安装、资源和实际 Python 复查 | NOT_RUN | 实际公开来源及五场景结果；与发布前工作源/canonical 运行分别记录 |
| 核心交付 | NOT_COMPLETE | 完整核心验收、保护合入及发布/复查证据完成后据实更新 |
| 原计划全部完成 / Epic #209 | INCOMPLETE | 原生入口、实际客户端及两个发布后收尾 PR 持续追踪；部分发布不能自动关闭 |
| Owner 最终成品接受 | NOT_ACCEPTED | 等待 Owner 基于实际交付作出最终接受；Agent 不代签 |
| 现实学习收益、长期保持/迁移、管理判断效果 | DEFERRED / NOT_MEASURED | 后续独立授权和真实使用评估；技术运行或发布成功不证明这些效果 |

发布后另做两个短期 PR，当前均 **NOT_RUN**：先同步实际 main → develop，再对完成同步后的 develop 执行 dry-run/实际 8.2.0 → 8.2.1 pre-bump，版本工具只更新 VERSION / README badge，插件版本保持，不创建 v8.2.1 Release。填写实际 PR、SHA/tree、合入与验收后才算相应收尾完成。

子 Issue 1–5 仅在各自交付已合入且约定验收通过后显式关闭。#215 和 Epic 不能因核心发布而关闭；若仍有原计划延期项，保持其解除条件与责任追踪。只有 Owner 明确调整完成范围且后续责任有明确归属，才可按调整后的标准关闭。

## §4 Recovery and traceable follow-up

发布前失败由代理诊断并修复，保留原输入、失败、修复范围和重跑结果。未知 CI 提前退出只能记录未知原因；同 head 成功不补写根因修复。未知 GitHub 发布或评论结果先回读并核对版本/ID/digest，仅恢复缺失操作。

公开后保留历史 Release、标签、正文和资产；本次沿用无附加资产发布流程。发现安装、发现、数据恢复或流转回归时记录受影响版本、范围、实际状态及修复 PR，使用适当的新修复版本恢复并验证，不覆盖旧公开身份。原始证据库、完整基线、历史回执、导出包和来源快照保留；工作区清理不删除独立证据库。本 Epic 不新增定时采集、通知或自动管理决定。

## §5 Change history and references

| Version | Date | last-verified | Change |
| --- | --- | --- | --- |
| v1.1 | 2026-10-13 | 原精确技术结果、完整第三轮失败及新修复范围 | 保留三插件公开范围与四插件开发集合；第四轮实际验收、保护合入和正式发布仍待完成 |
| v1.0 | 2026-10-12 | 2026-10-12，准备/已有证据范围 | 建立 8.2.0 未发布准备账本，保留两轮模型与 CI 原失败、入口条件/延期、当前 head 门禁及发布后待办；Refs #214 / #215 / #209 |

- [Learning Evidence 技术验收账本](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)
- [记录/API 契约](../spec/[SPEC]_Learning_Evidence_Record_And_API.md)、[使用指南](../guide/[GUIDE]_Learning_Evidence_Kit.md)
- [迁移 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[发布后预升决定](../adr/[ADR]_Develop_PreBump_Adoption.md)
- [发布操作](./[RUNBOOK]_Release_Operations.md)、[历史 8.1.1 发布记录](./[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)
