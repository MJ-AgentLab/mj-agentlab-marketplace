---
type: runbook
scope: marketplace
summary: "Marketplace 8.2.0 preparation, entry boundaries and protected release evidence"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-13
state: active
version: v1.10
last-verified: 2026-10-13
verification-scope: scoped-cli-core-publication-and-two-actual-post-release-merges
---

# [RUNBOOK] Marketplace 8.2.0 release readiness

## §1 Preconditions and current state

本账本记录 **8.2.0 实际公开发布与复查**，保留所有较早候选/失败快照及未完成项。Owner 已授权 Epic [#209](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/209) 的集中实施及条件发布，并接受保留两个公开技能和共用接口、核心独立验收后分段交付；不能满足严格原生窗口的入口延期，Epic 保留未完成事项。遵循 [迁移 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[记录/API 契约](../spec/[SPEC]_Learning_Evidence_Record_And_API.md)和[发布操作](./[RUNBOOK]_Release_Operations.md)，不重复索取已提供的授权。

当前main与公开Release为 **8.2.0**。#232实际merge `ebc4bdc3abc62c36348d9ba28de7161b04b3b466` 与已测6d83c8e同树5c7557fe；v8.2.0 tag/Release 411293170 target均绑定该merge，2026-10-13 05:00:19 UTC已公开，非draft/prerelease、无资产。发布后五种精确canonical安装及实际Python通过，发布脚本再运行仅验证并noop。#232 reviews为空、独立批准NOT_OBSERVED，不能因发布补记批准/豁免；repo API未提供immutable配置字段、流程使用false默认值；实际Release immutable=false，不声称已锁定。完整原始事实和输出见[发布回执](evidence/learning-evidence-8-2-0-post-release.json)。较早段落的8.1.1/未发布描述均为相应时点历史，不代表当前公开状态。

| 对象 | 当前身份或状态 | 本记录的证据边界 |
| --- | --- | --- |
| Marketplace已发布 | 8.2.0；develop未发布8.2.1 | #232/main/tag/Release同SHA；#234同步实际main ancestry、#235预升均已合入并精确复验，HTML仍仅在开发集合 |
| Learning Evidence Kit | 0.1.0 | 直接替换 Understanding 注册，pop-quiz / learning-record-check 均显式启动；共用能力不是第三技能 |
| Diagram / Explain | 0.3.1 / 0.1.1 | 本 Epic 保持其版本；批准图标复用和包归属见技术验收账本 |
| 已发布公开集合 | 三插件、五公开技能、两项显式学习策略 | 安装/发现通过不能代替实际模型、桌面调用或原生窗口验收 |
| 最新运行修复来源 | PR4 新核验生成信息修复已正常继承至 PR5 | Stage1 先确立适用性再读取应用材料；第五轮限定核心通过，保留实际生成信息、原件、错误与超时 |
| 已冻结并安装的 8.2.0 技术来源 | `36ef16cd8798b107e16673e1520f3086964c4e3e` | [技术回执](evidence/learning-evidence-acceptance-checks.json)记录精确 Git tree、290-test 日志、五种 canonical 安装及模型冻结摘要 |
| 新修复精确技术来源 | `8546aef1143642057693303fd334a09538081efa` / tree `85cf4d0c565d7e5bdd5ecfbc34e76b7e69d5307f` | [新技术回执](evidence/learning-evidence-generator-repair-checks.json)：290/290、零跳过，严格 baseline 和五种 canonical 安装通过；第四轮整体失败与后续修复分别保留 |
| 第五轮冻结技术/模型来源 | `acf3c9d48a314cab153632bd5c09a141823789c3` / tree `ae61349bd01513f8ac36cd4702c5d440dae550e2` | [当前来源回执](evidence/learning-evidence-fifth-source-checks.json)：290/290、五种 canonical 安装及六场景核心判据通过；七次自然完成/一次超时分开 |
| 最终已测发行head / Git tree | #232 `6d83c8ec995de209acba782b578b9cb94539693e` / `5c7557fe42a01cc4ada243ebdde64a20562f8881` | 精确最终head五种安装/Python及全部CI通过；Windows290零跳过、Ubuntu289和一项Windows专属跳过分别记录；实际merge同树 |
| Main merge / tag / Release | `ebc4bdc3abc62c36348d9ba28de7161b04b3b466` / v8.2.0 / 411293170 | 自动draft-first发布成功，发布后canonical5/Python通过；原正文/tag/资产不改写，immutable=false如实记录 |

阶段依赖及关闭条件继续按 [验收账本](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)追踪：

| 阶段 | 实际 PR / 子 Issue | 当前状态 |
| --- | --- | --- |
| 契约与迁移 | [#216](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/216) / [#210](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/210) | 已合入，子 Issue 已关闭；不追认未提供的非作者批准 |
| 本机证据库 | [#224](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/224) / [#211](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/211) | 已获当前head非作者批准并合入a2090ff8；同树七canonical安装/缓存Python通过，#211关闭 |
| GitHub 流转 | [#227](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/227) / [#212](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/212) | 已实际合入f958908e；同树七canonical安装/缓存Python通过，#212关闭；当前reviews为空，不补记批准 |
| 原子插件切换 | [#228](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/228) / [#213](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/213) | 已实际合入434d053；八精确canonical安装/143资源/实际Python通过，#213关闭；当前reviews为空不补记批准 |
| 技术验收与 8.2.0 准备 | [#230](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/230) / [#214](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/214) | 已实际合入6b5a19e，与已测f1fe48b同树2084d6e3；八精确canonical/143资源/实际Python通过，#214分段完成关闭；当前reviews为空，不追认批准 |
| 正式发布与跟踪 | [#215](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/215) | #232公开三插件v8.2.0；#234同步与#235预升已依序合入/精确复验。原生/客户端/效果/Owner接受仍待，#215/Epic继续OPEN |

2026-10-13 较早依赖快照：#224 的实际批准/merge/关闭见[PR2合并回执](evidence/learning-evidence-pr224-post-merge.json)，#227 的真实merge、空reviews/关闭及#228同树317/八安装/四共用模块和十九模型资源闭包见[PR3合并回执](evidence/learning-evidence-pr227-post-merge.json)。#228未合入，#230/#232继续Draft；公开候选b7bdd769未因开发侧新账本改变，main/latest Release仍8.1.1。Owner再次确认三插件8.2.0条件发布和依赖顺序，并要求后续不指定人发出请求审查。此偏好不解除当前head非作者批准、CI及已解决线程门禁，也不追认历史#216/#227缺失批准。

本次PR5文档同步初次严格校验发现根AGENTS摘要为16413字节，超过既有16384字节预算；生产代码未变。已将五段重复/过时阶段摘要合并为当前状态与账本指针，完整修复前文本、原错误及变更边界保留在[指令预算修复回执](evidence/learning-evidence-pr5-instruction-budget-repair.json)。不提高预算、不修改校验器；修复后摘要14704字节，实际严格校验及65/65文档/A6检查通过；原失败与成功输出的来源和hash分别保留。

2026-10-13 较早PR4交付快照：#228已实际合入并完成八canonical/实际缓存Python复验，#213关闭，空reviews历史保留；#230同步后的8.2.0开发候选完整317/八安装及不变十九资源/原始模型证据核对通过，详见[PR4合并回执](evidence/learning-evidence-pr228-post-merge.json)。本阶段不指定审查人，当前head批准/CI/线程和实际合入仍按门禁；#232继续三插件Draft，尚未公开8.2.0。

此前独立公开发行文档同步快照：本 worktree 在此前三插件b7bdd769上仅保存实际开发交付/失败回执与当前依赖账本，未合并develop运行集合，所有生产/脚本/测试/版本保持原三插件来源。#230当前f1fe48b可审查，其独立批准和实际合入仍待；#232继续Draft。新发行head在本次提交后冻结并执行精确canonical安装，不能把此前b7身份当作新的当前head通过。历史空reviews缺项保留，后续不指定审查人；main/latest Release仍8.1.1，正式8.2.0未公开。

2026-10-13 较早PR5交付/发行准备快照：#230已实际合入6b5a19e，完整[合并回执](evidence/learning-evidence-pr230-post-merge.json)记录同树身份、八精确canonical/143资源/四图表Python/三保存重放检查与清理，#214按已接受分段技术边界关闭。GitHub reviews为空，历史缺项不补造。#232前序依赖全部交付；此前7341481五种安装实际通过，本次仅文档更新，运行/脚本/测试/版本及原模型证据与已验收acf3相同。提交后冻结新的当前head，精确canonical通过后转为可审查；当前head非作者批准/CI/线程满足后执行已有三插件8.2.0发布授权，不指定审查人。HTML保留develop另发，main/latest Release仍8.1.1；原生/桌面/效果/Owner接受及两个收尾PR仍未完成。

2026-10-13 发布复查快照（两项收尾的实际交付见§3）：自动Release run38349173340实际create-draft→canonical安装→紧邻publish回读→published→状态复查成功；代理未重复publish、改正文、覆盖tag或资产。精确发布merge五安装/三图表Python/两Learning保存重放检查及清理通过，原模型资源和证据不变，实际published-noop核查通过。一次网络读取连接重置的失败与后续有界重读分别保留；未将错误当发布失败或执行重复写入。同步保留develop四插件/六技能/三个显式策略及HTML证据。

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

第三轮的完整原始回执见 [第三轮证据](evidence/learning-evidence-third-model-round.json)：等待、范围选择、原件移交、应用比较及限定分享有各自正面观察；新增条目却误用原作者或 Pop Quiz 来源，他人记录另伪造晚于保存时间的事件时间。候选已明确使用实际生成代理、当前 LRC 版本/上下文、真实操作及观察到的时钟，重试保持相同请求字节；共用 Python、schema 与原件保持。第四轮已实际执行六场景/八回合，整体 FAIL：他人记录在适用性核验前读取实现；listing 未启动。完整[第四轮证据](evidence/learning-evidence-fourth-model-round.json)与[独立审查](evidence/learning-evidence-fourth-model-independent-review.json)保留，auth 为零。新核验生成信息已分别通过，但不能覆盖顺序失败。新文本明确 Stage1 适用性建立后才读取应用材料/实现，第五轮六 LRC/八回合待新来源实际复验。

Owner 已确认 8.2.0 仍为原定三插件/五技能/两项学习策略。develop 保留 #226 的 HTML，Learning Evidence 替换后开发集合为四插件/六技能；独立公开候选只含 Diagram、Learning Evidence、Explain，HTML 另行发行。不得以原公开集合校验删除 develop 的已合并 HTML。

第五轮完整限定核心结果见[原始回执](evidence/learning-evidence-fifth-model-round.json)和[独立最终审查](evidence/learning-evidence-fifth-model-independent-review.json)。六 fresh/八实际调用、86 命令尝试、九条新核验；七次自然完成与一次输运超时分开，所有历史失败和错误保留。材料到达等待新手动请求后再核验，身份不适用停止在应用读取前；十二资源闭包只限定沿用第四轮移交。真实原件字节保留，最后作者场景的说明/校验材料仅换行格式差异明确列出，不宣称全材料字节相同。独立审查通过核心行为判据不替代保护合入、正式发布或 Owner 签收。

### §2.3 Classify entries before enabling publication scope

| 实际入口/能力 | 当前状态 | 影响、条件及解除要求 |
| --- | --- | --- |
| Codex CLI 完整输入的非交互核心操作与显式技能调用 | QUALIFIED_SCOPED_CLI_CORE | 第五轮 acf3 六 fresh/八调用通过限定核心判据；七次自然完成/一次超时及原错误保留。仅明确选择、可访问库、适用版本与完整材料的手动路线；实际账号权限不由离线 gh 推定 |
| 新建 worktree 本地 Git exclude | BLOCKED_IN_RESTRICTED_ROUTE | native sandbox 限制首次 Git 元数据写入；不宣称该受限模型入口自动创建 exclude。PR2 隔离实际 Python 的自动 exclude 证据保留其原范围 |
| 已有本地 exclude 的完整记录移交 | QUALIFIED_CONDITIONAL | 第四轮实际保存/关联/引用清单由十二项未变资源闭包限定沿用至 acf3；原件精确保留，只限已有本地排除配置，不能推定自动创建 exclude |
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
| 8.1.2 → 8.2.0 版本准备 | APPLIED_AND_PUBLISHED | 当时VERSION / README badge两锚点；最终6d83c8e、main ebc4bdc3同树且正式公开 |
| 8.2.0 技术来源完整工程及 canonical 安装 | PASS_FOR_ACF3C9D | 290/290、零跳过，严格校验/精确 baseline、五种精确 Git 安装和实际图表/共用 Python 通过；未来最终交付另核当前身份 |
| 修复后完整核心实际模型验收 | FIFTH_SCOPED_CORE_CRITERIA_PASS_WITH_RETAINED_ERRORS | 各场景输入/source/模型版本、实际操作与独立审查；不得合并不同轮次为无失败 PASS |
| #232最终head真实非作者APPROVED review | NOT_OBSERVED | 实际reviews为空；已发布不补造批准或推断豁免，后续各PR当前head门禁保持 |
| #232 Required checks / threads | PASS / ZERO_UNRESOLVED | 最终6d83c8e全部CI成功，Windows290零跳过/Ubuntu平台跳过分别保留；线程为空 |
| main 发布merge | ACTUAL #232/ebc4bdc3 | 与已测6d83c8e同树5c7557fe；空reviews缺项保留 |
| v8.2.0标签 / Release | PUBLISHED | tag/target ebc4bdc3，Release411293170，05:00:19UTC公开，正文与canonical CHANGELOG一致，无资产、immutable=false |
| 发布后安装/资源/实际Python | PASS_SCOPED | 实际ebc4bdc3五canonical、三Diagram Python/两Learning保存重放检查通过并清理；未代替桌面验收 |
| 核心交付 | PUBLISHED_SCOPED_WITH_REVIEW_GAP | 已接受限定CLI核心公开/复查完成；历史外部批准缺项保留，不称全部治理/客户端通过 |
| 原计划全部完成 / Epic #209 | INCOMPLETE | 发布、安装复查及两个发布后PR已完成；原生入口、真实客户端/效果和Owner接受继续追踪，部分发布不关闭Epic |
| Owner 最终成品接受 | NOT_ACCEPTED | 等待 Owner 基于实际交付作出最终接受；Agent 不代签 |
| 现实学习收益、长期保持/迁移、管理判断效果 | DEFERRED / NOT_MEASURED | 后续独立授权和真实使用评估；技术运行或发布成功不证明这些效果 |

发布后两个短期PR已依序合入并复验：[#234](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/234) merge `2c0a83172507bcb77d105d9f9294fec2e6672ac1` 与已测756e3b8同树 `6f67589b7b277eb0aef39fdc2a1e6fa5b5df0f2a`，纳入实际main ancestry并保留HTML开发集合；[#235](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/235) merge `3af6837338478ef49a7cea6bb935c07c5c19400c` 与已测796b510同树 `e3769e0f5bcb9c5af69956245dc198ab1a220e06`。两次实际merge各八canonical安装、四图表Python/三Learning保存重放检查及清理通过。版本工具先dry-run再只更新VERSION/README badge为8.2.1，各插件manifest版本保持；#235原两文件/[skip a6]缺签核的真实失败保留，Owner要求修复后补根AGENTS真实摘要并移除跳过标记，最终三路径按正常A6通过，未改checker/workflow/批准规则。#234/#235 reviews均为空，批准NOT_OBSERVED，不追认豁免。当前develop是未发布8.2.1，main/public是原三插件8.2.0，无8.2.1 tag/Release。完整原失败、修复、远端CI、实际merge与安装见[收尾回执](evidence/learning-evidence-8-2-0-closeout.json)。

子 Issue 1–5 仅在各自交付已合入且约定验收通过后显式关闭。#215 和 Epic 不能因核心发布而关闭；若仍有原计划延期项，保持其解除条件与责任追踪。只有 Owner 明确调整完成范围且后续责任有明确归属，才可按调整后的标准关闭。

## §4 Recovery and traceable follow-up

发布前失败由代理诊断并修复，保留原输入、失败、修复范围和重跑结果。未知 CI 提前退出只能记录未知原因；同 head 成功不补写根因修复。未知 GitHub 发布或评论结果先回读并核对版本/ID/digest，仅恢复缺失操作。

公开后保留历史 Release、标签、正文和资产；本次沿用无附加资产发布流程。发现安装、发现、数据恢复或流转回归时记录受影响版本、范围、实际状态及修复 PR，使用适当的新修复版本恢复并验证，不覆盖旧公开身份。原始证据库、完整基线、历史回执、导出包和来源快照保留；工作区清理不删除独立证据库。本 Epic 不新增定时采集、通知或自动管理决定。

## §5 Change history and references

| Version | Date | last-verified | Change |
| --- | --- | --- | --- |
| v1.10 | 2026-10-13 | #234/#235实际合并和精确复验 | 完成main同步及未发布8.2.1预升；保存原A6失败/正常摘要修复/空reviews，保持三插件公开范围与全部延期 |
| v1.9.1 | 2026-10-13 | immutable配置字段未提供/Release flag=false | 保留原脚本false默认值及原输出，明确配置unknown与实际未锁定发布；不推断已关闭配置 |
| v1.9 | 2026-10-13 | 实际公开/tag/Release/精确安装复查 | 保存自动draft-first与published-noop、same-tree身份、empty reviews、immutable=false；同步保留四插件开发范围，后续两文件pre-bump独立 |
| v1.8 | 2026-10-13 | PR5实际合并同树精确验收及分段关闭 | #230/6b5a19e八canonical与实际Python通过；#214关闭并保留reviews缺项/全部延期；公开依赖已交付，新发行head仍需精确安装及保护门禁 |
| v1.7 | 2026-10-13 | 三插件公开文档同步；新head待精确canonical/保护门禁 | 保持全部运行/测试/版本及原模型证据，复制实际依赖回执与历史缺项；P5/发行当前head批准/合入/正式发布另核对 |
| v1.6 | 2026-10-13 | PR4实际合并和PR5最新完整工程验收 | 保留空reviews历史，#213交付关闭，317/八安装及资源/原模型证据闭包通过；PR5/正式发行当前head门禁仍待完成 |
| v1.5 | 2026-10-13 | 前序实际交付与PR4当前可审查来源 | #224/#227合并复验及#211/#212关闭，保留空reviews历史与不指定审查人偏好；后续依赖/当前head门禁和正式发布仍待完成 |
| v1.4 | 2026-10-13 | 实际发行草稿及最终 Git 提交安装 | #232/b7bdd76 三插件，五种 canonical 安装及实际 Python 通过；依赖/批准/保护合入/正式发布待实际完成 |
| v1.3 | 2026-10-13 | 第五轮限定 CLI 核心及两种集合的实际工程结果 | 保存完整回执/独立审查、原超时和错误，核心资格与实际交付/发布/Owner接受分别记录 |
| v1.2 | 2026-10-13 | 完整第四轮失败和阶段顺序修复 | 保留生成信息的有限正向、未运行 listing 与全部原错误；第五轮核心接受和正式发布仍待完成 |
| v1.1 | 2026-10-13 | 原精确技术结果、完整第三轮失败及新修复范围 | 保留三插件公开范围与四插件开发集合；第四轮实际验收、保护合入和正式发布仍待完成 |
| v1.0 | 2026-10-12 | 2026-10-12，准备/已有证据范围 | 建立 8.2.0 未发布准备账本，保留两轮模型与 CI 原失败、入口条件/延期、当前 head 门禁及发布后待办；Refs #214 / #215 / #209 |

- [Learning Evidence 技术验收账本](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)
- [记录/API 契约](../spec/[SPEC]_Learning_Evidence_Record_And_API.md)、[使用指南](../guide/[GUIDE]_Learning_Evidence_Kit.md)
- [迁移 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[发布后预升决定](../adr/[ADR]_Develop_PreBump_Adoption.md)
- [发布操作](./[RUNBOOK]_Release_Operations.md)、[历史 8.1.1 发布记录](./[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)
