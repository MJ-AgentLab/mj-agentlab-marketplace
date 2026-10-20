---
type: adr
scope: html-guide-kit
summary: "Keep the explicit learning artifact workflow and add confirmed design and agreed local delivery"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-20
state: active
version: v1.1
layer: canonical
---

# [ADR] HTML learning artifact extension

| Field | Value |
|---|---|
| Status | 本次明确实施范围已授权；本文为 Agent 据来源的工程承接，不声称新稿逐字接受或成品接受 |
| Date | 首次承接2026-10-19，本次修订2026-10-20；准确Owner消息时间按主PLAN记录，不以捕获时间替代 |
| Decision owner | 当前聊天的项目 Owner；完整决定正本见主 PLAN |
| Scope | 同一html-guide-kit显式site、包内资源/工具、按需grilling/共识确认、可选主题及约定Sites/本地交付；本次唯一决定正本见主PLAN选择性统一基线 |
| Reversibility | 独立输出可重建；包级回退用新受保护PR；Sites按已知良好保存版本恢复或前向修复，历史不删除 |

## §1 Context

[原意 INT-2026-003](../intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md)承接从学习材料到可阅读、可操作、可追溯网页的需求。既有 guide 只交付聊天指南，不能承担制作。Owner 本轮要求实施[完整原计划](../../plans/274-html-learning-artifact/evidence/sources/HTML-Learning-Artifact-Plugin-Implementation-Plan.md)，并用七原则及最新 plan 机制约束执行。

实施核查 HTML 为 0.1.36，五包七公开/四显式/三自然；原计划较旧的0.1.0与HEAD仅保历史事实。旧[HTML新增ADR](./[ADR]_HTML_Guide_Kit_Addition.md)及[验收SPEC](../spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)继续保存 guide 和原验收历史。本文件单独承接新 site，不将旧 FAIL、双端缺证或批准缺项追认通过。

本次Owner选择以Slack完整制作提示词B2为基准，保留本地生成器和工程检查，并按U2保护既有材料、允许独立目录产物，补按需Matt grilling、设计共识确认、可选主题及本地交付。B2完整API正文采用外部快照恢复，不公开研究全文；决定、出处及捕获限制唯一维护于[选择性统一基线](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#selective-alignment-baseline)。修订前完整合同由固定Git a4892f51f4163fb5bd4457d99229eaf1a4683e8f恢复，旧核心ACCEPTED_LIMITED不扩张为新稿逐字接受或完整计划接受。当前0.1.38仍为修复候选，本批准备0.1.39，新增验证尚未完成，Marketplace版本不动。

## §2 Decision

保留原插件显式 `$html-guide-kit:site`，`allow_implicit_invocation: false`、插件身份和已批准图标。guide原运行字节、Read聊天合同与历史接受保持；插件级Write不产生入口独立权限沙箱，site/guide边界由指令和行为核验维护。0.1.36→0.1.37为初次扩展历史，本批0.1.39准备不自动升Marketplace或其他插件，也不表示正式公开。

site按B2使用六步方法、本地AICS原则/术语，Markdown、视图及用户反馈分开；保留样式注入、复制反馈、静态检查和通用渲染检查。方法/模板/主题/脚本/必要来源说明相对实际安装SKILL locator定位，不依赖研究仓库、个人绝对路径、历史聊天、其他插件缓存或运行时下载。未读完整AICS文本不宣称全部检查通过。主题按内容与已确认偏好选择，暖白陶土是候选；生成器的artifact.json可选theme为warm-paper/neutral，省略兼容warm-paper，其他方向由Sites独立实现并验证。

已有设计与交付选择直接复用，不重复访谈或确认。仅关键未决才按需读取并使用Matt grilling，按依赖分轮，提供编号选项、推荐和理由；解决关键问题后简述设计共识并确认，才实现依赖部分。需要Matt但缺失时记该阶段依赖缺口，保持同一待答、继续独立工作，不自动安装，不以包内问答冒称已执行Matt或完成该阶段。普通实现细节由Agent判断；必要答案缺失只停依赖部分，原生持续窗口必须真实客户端证据，当前仍DEFERRED非PASS。

默认新建并私有发布Sites，也支持已约定的已有Site或仅本地HTML。Sites模式实际读取当前工作流，处理明确新建/更新对象、精确源码、保存版本和部署，核对地址、版本、状态与访问范围；更新保持原身份/受众，未知创建/部署先回读避免重复。已约定本地模式在独立目录交付HTML、独立内容源、来源、设计理由、源码/恢复说明、版本及实际检查，明确未发布Sites。Sites不可用不自动改为本地完成；本地模式不要求额外部署。安装后消费者主流程仍按模式实证，不由工程会话权限推定成功，不编造依赖ID或公共目录资格。

采用[SPEC](../spec/[SPEC]_HTML_Learning_Artifact.md)四项最小检查，新增设计/主题/本地验收另取实际证据，旧Sites判准及结果由原完整基线保留，不追认新通过。完整双客户端、视觉/扩展/可访问性与原生窗口可后移；必要答案未取得不推进依赖，Sites模式核心未完成不能作为非核心延期。理解效果无真实学习者表现则NOT_MEASURED，不宣称改善；本次不重启旧模型/桌面矩阵。

任务使用单Issue #274、同时一个活动主PR→develop，需要多子PR时指向任务集成分支；内部路径经实际规则核查为不受保护时，Agent在独立审查及Harness后可合并。#284保持open且冻结，本批同Issue排队，不开第二活动主PR。最终保护批准/CI/线程仍须满足，不bypass。最新计划机制覆盖原计划旧子Issue/文档安排；旧任务拓扑与证据不追溯改写。

## §3 Consequences

安装包维持五包八公开/五显式/三自然，仓库技能20不变，不增加访谈技能或自动依赖。既有材料/研究原件/安装缓存保持，约定产物输出独立目录，冲突首写前拒绝。Sites写入、部署、认证和受众风险以有界交接包、私有默认、精确版本/输出、权限回读和发布监控控制。本地文件存在、工具退出零或截图正常不能代替语义、实际操作、真实客户端或Owner接受；跳过浏览器检查如实报未检查。

guide保持现行产品边界；原历史矩阵不扩大成本次site最小门槛，也不因本次通过而关闭旧未完成项。延期逐项保存影响/责任/恢复条件，Owner体检与最终接受保留真实决定位置。

## §4 Alternatives

| 方案 | 实际取舍及本次方向 |
|---|---|
| 改写guide承担制作 | 混合原Read聊天边界；本次采用独立显式site并保guide字节 |
| 新建重复插件或复制Sites | 增加身份和托管/凭据维护；本次复用现有包及实际Sites |
| 全客户端/视觉/效果矩阵阻断首版 | 与来源采用最小上线检查相冲突；非核心后移，核心四门槛保持 |
| 将固定主题用于全部网站 | B2允许按内容选择；本地保留warm-paper兼容并提供neutral，其他方向由Sites实现及验证 |
| 本地HTML一律等同Sites发布或一律不许交付 | 两者都不符合本次模式约定；已约定本地可按自身验收完成，Sites模式仍须真实发布，新规则不追认旧通过 |

## §5 Implementation

唯一[任务入口](../../plans/274-html-learning-artifact/INDEX.md)与[主PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md)复用P0–P5历史、完整来源、工程覆盖和恢复；原文档bootstrap/两个子PR为初批拓扑，本批按[选择性统一基线](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#selective-alignment-baseline)排队，不启动第二活动主PR。真实PR链接与进度留[#274](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274)。逐项结果由唯一REPORT报告，不增平行计划。原子同步技能/方法/主题/生成器/检查/文档、严格资源登记、Unicode预算、安装字节比较/测试、A6和公共索引，不登记空资源或降低已有检查。

第三方迁入按实际文件/固定版本/完整路径/hash/改动/许可记录，只在决定采用后读取适配必要文件；来源方法摘要不冒充原始规范或自动转MIT，不迁入已延期工具或无用途vendor。既有材料和原件不改写，生成资产许可继续传递，所有输出独立于输入、缓存与研究目录。

## §6 Acceptance

按[SPEC](../spec/[SPEC]_HTML_Learning_Artifact.md)执行安装闭包、代表材料语义与设计、一个客户端的约定交付流程及当前工程/发布门禁；本批新增验收未完成。分别核已有确认复用、关键澄清依赖、主题选择、材料保持、本地交付及必要失败路径。保留失败、修复重跑、未执行及延期，绑定实际SHA/tree/缓存字节。旧核心ACCEPTED_LIMITED、窗口DEFERRED、效果NOT_MEASURED及保护批准NOT_MET不因修订变为通过；合成验收不冒充非作者批准或Owner接受。

## §7 References

- [INTENT](../intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md)、[PLAN授权记录](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#accepted-baseline-and-authorization)、[完整来源清单](../../plans/274-html-learning-artifact/source-bindings.json)。
- [使用指南](../guide/[GUIDE]_HTML_Learning_Artifact.md)、[执行规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)、[文档框架](../rule/[STANDARD]_Documentation_Framework.md)、[发布操作](../runbook/[RUNBOOK]_Release_Operations.md)。

## §8 Decision Log

| 时间 | 性质/责任 | 来源及范围 |
|---|---|---|
| 消息时间未知；真实捕获时钟另记 | Owner明确实施指令 | 完整原计划与本轮七原则；不等同新文档逐字接受、当前工程通过或最终成品接受 |
| 2026-10-19 | Agent工程承接 | 据实际版本/最新机制细化，不改原计划/旧接受原件；差距只阻依赖部分 |
| 2026-10-20；准确消息时间见主PLAN | Owner本次选择/Agent增量承接 | B2/U2完整来源、唯一决定及范围见[选择性统一基线](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#selective-alignment-baseline)；本表仅导航，不另存决定正本，新验收未完成 |
