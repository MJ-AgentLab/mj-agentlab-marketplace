---
type: standard
scope: marketplace
summary: "Preserve original meaning, recoverable acceptance and engineering coverage"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: canonical
---

# [STANDARD] AI engineering intent

## Original and adoption

INTENT 保存提出者的问题、期望结果和有出处的原话；项目事实从代码、配置和运行证据核实。两者有差距时分别保留依据，由有职责的人决定处置。规范依据见[新增 ADR](../adr/[ADR]_Intent_Mechanism_Addition.md)。

同一原意维护一份正本。跨任务、长期演进、涉及插件对外行为或重要治理变化时使用独立 INTENT；简单明确的单任务使用 Issue 原意区；纯格式维护不另建原意记录。已有明确 Issue、完整来源和同范围决定时直接复用，无需形式访谈。下游链接正本，不复制另一套业务含义。

新需求及后续实质修订增量接入；直接受影响的旧任务补来源和覆盖关系。既有有效决定继续引用，缺失历史证据保持缺失，不追认历史接受。仅缺必要决定时暂停依赖部分，独立调查和旧接受仍覆盖的工作继续。

## Independent INTENT and Issue original section

独立文件位于 `docs/intent/`，命名 `[INTENT]_INT-YYYY-NNN_Topic.md`；`YYYY` 为首次分配年份，`NNN` 为该年三位序号（001–999）。先扫描全正式集合再分配，`intent-id` 为 `INT-YYYY-NNN`。ID 是身份，`version` 是内容修订，`owner` 是维护责任，均不推定接受权。

按[文档框架](./[STANDARD]_Documentation_Framework.md)，独立 INTENT 使用九公共字段，增加 `intent-id`，共十字段，`type: intent`、`layer: canonical`；`state` 使用现行生命周期。草稿仍为正本。创建使用[模板](../_templates/TEMPLATE_INTENT.md)，同步[INTENT 索引](../intent/INDEX.md)及公共导航。

正文前使用二列表格，七行名称为：提出者、原始来源、接受责任人、原意核对记录、内容接受记录、当前内容与适用基线、主跟踪 Issue。每项非空，未发生的核对/接受/跟踪如实说明；职责、授权和决定正本通过对应记录链接。未知身份或准确消息时间如实标未知，不用 Git 作者或捕获时钟替代。正文使用五个二级标题（可前数字编号）：问题与现状、期望结果、成功判断、范围与约束、未决项。区分原话、事实、反馈、假设，未知阈值/期限/统计范围保持未知。

轻量 Issue 原意区采用同样五部分，可简写已明确项并链接来源和决定；以仓库及 Issue 编号标识，不强加独立文件 ID。选用独立正本后，Issue 原意区改为引用和本任务承担范围，原 Issue 基线保留。来源与内容足够即进入工程承接；关键含义缺口按实际职责澄清，业务问题中性，工程取舍可以推荐。

## Decisions and recoverable acceptance

| 判断 | 实际责任与记录 |
|---|---|
| 原意核对 | 提出者或有依据的代表判断整理是否忠实 |
| 内容接受 | Owner 或明确授权代表选择完整版本及采用范围 |
| 文档状态 | draft / active / deprecated / archived 只表达生命周期 |
| 操作授权 | 明确当下允许的动作及目标、对象、环境、权限、风险边界 |

同一人可在一次明确表态中完成多种决定，已有同范围证据直接复用。维护身份、active、校验通过、PR 合并或 Issue 关闭不能自动替代真实接受或操作授权。接受与未覆盖部分分别记录。

决定正本只维护一处，INTENT、PLAN、Issue 链接它。记录至少含性质、实际责任人及职责、真实时间、完整基线、接受和未覆盖范围、未决项处置、证据位置。来源无法提供实际消息时间时注明未知，同时另记真实捕获时间。Agent 整理稿必须标明整理来源及尚未获得的核对/接受，不能将旧接受扩大为新稿逐字接受。

基线优先绑定固定 Git 提交中的文件；无提交则保存完整快照及准确位置。Issue 正文/评论会被编辑，URL 仅供定位，须保留当时被接受的完整内容、来源及决定。版本号、摘要或单独 hash 不足以恢复；哈希用于验证完整原件。快照按[来源清单合同](./[STANDARD]_Documentation_Framework.md#source-bindings-and-incremental-adoption)保存实际字节和出处，不要求凭空取得不可得的宿主消息标识。

## Identity, revision and history

改名、跨年维护和拆分工程任务保留 ID；原意实质变化保留旧决定、旧完整基线，记录变化来源、原因、影响条目及工程文档。旧接受只覆盖旧内容，新增/变更范围由有职责的人决定；纯格式及链接修复无需机械重走接受。

退役/归档保留身份与历史，不重新分配 ID。不同原意替代时使用新 ID 并建立关系。正式正本集合包含 `docs/intent/` 和 `docs/archive/` 内的 INTENT，包括 deprecated/archived；仍维护的历史正本必须唯一。固定 Git 版本、任务 `evidence/sources/` 下声明用途的完整基线快照是恢复材料，不是第二正本，不能以复制正式正本到其他目录规避治理。移动和归档同时更新路径及索引，原来源按文档框架保留。

## Engineering handoff and coverage

INTENT 回答问题与结果；Intake 核实承接、差距和风险；SPEC 定义行为/边界/口径/验收，重要取舍用 ADR；PLAN 安排实施与验证；Issue 维护承担者、进度和证据；REPORT 或既有 RUNBOOK 报告实际结果和限制。按现有 canonical/working、稳定任务 INDEX 和主 PLAN/REPORT 组织，保持 20 个开发技能，无新增访谈技能。

一个原意可以暂时没有 Issue；进入待办后指定一个主跟踪入口。一个原意可拆多个任务，共享 Issue 也可承接多个原意，但分别列出正本、接受基线、承担范围、验收标准和依赖。关联标明实际交付、依赖支撑或背景参考，不以关联数充交付。

工程覆盖逐条绑定：

| 原意条目/来源 | 完整接受基线与范围 | 关系 | Issue/PR 承担范围 | 验收与实际证据 | 差距/处置 |
|---|---|---|---|---|---|
| 稳定条目定位 | 固定文件或完整快照及决定 | 实际交付 / 依赖支撑 / 背景参考 | 有界责任、依赖 | 判准与实际结果分开 | 达成 / 部分 / 延期 / 未覆盖 / 无法判断 |

INTENT 保留必要关联，进度正本为 Issue。REPORT 对照原意报告工程交付和业务原意达成，核心交付、全计划完成、发布及 Owner 最终接受各自判断。合成角色可核验忠实性和工程质量，但不能扮演真实 Owner 作接受决定。

## Harness and evidence boundaries

首版即纳入现有严格校验/CI，沿用结构化诊断及非零失败退出：类型、十字段、真实日期及先后、目录/命名/ID 一致、索引/链接、全正式集合唯一性和扫描完整性。单文件检查仍扫描完整集合；集合不可读/不完整不得报告唯一性通过。声明为 INTENT 的文件名前缀或类型/身份字段不能通过格式错误退出治理；模板与完整历史快照按各自用途识别。

机器提供结构证据；来源忠实、未知是否补造、职责/接受真实性及范围由语义审查和决定证据核实。Agent 按[执行规范](./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)自主验证/修复、隔离风险、保留失败和重跑、完成独立合成验收；子 PR 与受保护主 PR 使用各自实际门禁，不扩大到全仓历史回填。

未提交、默认、推荐、预选、沉默、超时及关闭/消失不算答复。原生未答窗口持续显示须实际客户端实证；文字 pending 不是窗口证据。缺非核心能力只延期对应入口，记录影响、责任和恢复条件，核心通过自身验收可先交付；延期不标 PASS，Owner 最终接受另记。
