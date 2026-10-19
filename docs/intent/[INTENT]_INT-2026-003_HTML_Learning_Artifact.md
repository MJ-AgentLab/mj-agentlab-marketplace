---
type: intent
scope: html-guide-kit
summary: "Create traceable HTML learning artifacts through an explicit local Sites workflow"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: draft
version: v1.0
layer: canonical
intent-id: INT-2026-003
---

# [INTENT] HTML learning artifact delivery

| 来源与责任 | 实际记录 |
|---|---|
| 提出者 | 当前聊天的项目 Owner；准确账号未由来源提供 |
| 原始来源 | [原计划完整字节快照](../../plans/274-html-learning-artifact/evidence/sources/HTML-Learning-Artifact-Plugin-Implementation-Plan.md)与[本轮请求原文](../../plans/274-html-learning-artifact/evidence/sources/owner-request.txt)；原计划内的历史批准陈述是来源陈述，不单独当作真实决定。消息 ID、准确消息时间及可定位聊天 URL 未提供 |
| 接受责任人 | 项目 Owner；合成角色及工程代理不代作最终接受 |
| 原意核对记录 | 本文由 Agent 据来源整理，尚无 Owner 对本整理稿的单独核对。原计划的真实历史核对不由其自述补证；不影响本轮明确实施授权 |
| 内容接受记录 | Owner 本轮明确要求“实施该计划，遵循最新的 plan 机制”，并给出七项实施原则；可恢复来源与范围决定统一见[主 PLAN 的授权记录](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#accepted-baseline-and-authorization)。不推定已接受本整理稿逐字内容、工程结果或成品 |
| 当前内容与适用基线 | v1.0 整理原计划 §1–13 与本轮七原则；完整快照及[来源清单](../../plans/274-html-learning-artifact/source-bindings.json)负责恢复。来源捕获时间另记于该任务，准确消息时间未知。旧 guide、旧接受及历史失败保持原范围 |
| 主跟踪 Issue | [#274](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274)；[任务入口](../../plans/274-html-learning-artifact/INDEX.md)导航主 PLAN/后续实际 REPORT；工程进度留 Issue |

## 1．问题与现状

O1．原计划期望提供“从学习材料到 HTML 学习制品的完整能力”，围绕特定读者、任务和理解目标，生成可阅读、可操作、可追溯的学习网页。现有 `guide` 在聊天中交付指南文本，不能据此认定已具备网页制作与发布能力。

项目事实另记：实施前基线为 develop `1d5219c1fa1bbf14cc79f630a59e9a8c857248f4`；`html-guide-kit` 实际为 0.1.36、Read、唯一显式 `guide`，Marketplace 为未发布 8.3.2，开发集合五包七公开技能。原计划的 0.1.0 与较旧 HEAD 仅描述当时事实，不作为本次版本依据。

## 2．期望结果

O2．在同一插件增加显式 `$html-guide-kit:site`。保留 `guide` 职责、既有运行字节和已批准图标。site 交付学习网页、材料源文件、检查记录和真实 Sites 地址。

O3．以六步方法完成 Understanding Needs、Learning Materials、Information Structure and Relationships、Interaction and UI/UX、HTML through Sites、Evaluation and Revision。教材按具体主题组织，深度随材料与任务变化，不强制六章、题量或交互数量。

O4．核心名称采用稳定英文并配邻近中文解释；说明、案例、学习活动、反馈和控件以中文为默认。维护本地单一术语参考和制品主题映射；忠实保留来源、条件、例外、冲突、未知及构造边界。

O5．方法、模板、主题、转换和检查资源在插件包内闭合，使用暖白纸面/陶土色主题，内容与视图分离；首版迁入样式注入、复制反馈、静态检查、通用渲染检查。交互依据理解任务选用，支持必要反馈、改答失效、重试、重置、依据回链、复制和本地导出。

O6．网页阶段实际按当前 Sites 工作流制作与发布。一次代表性材料流程同时验证安装后能力、六步制作、实际发布和正确访问范围；不将本地文件存在或工程会话可调用工具当成消费者主流程通过。

## 3．成功判断

S1．安装后的插件可发现两个显式入口，site 所需运行资源完整且与源字节对应；核心方法不依赖原研究仓库、个人路径、历史聊天、其他插件缓存或运行时下载。

S2．代表性材料的关键结论、条件、例外、关系及练习判准正确；英文核心名称、中文学习内容及术语一致性符合约定。结构和控件可用不能代替语义核验。

S3．一个目标客户端实际完成材料输入→六步制作→Sites 发布，取得可访问网页，核对真实地址、保存版本、部署状态及访问范围。Sites 主流程未完成仍是核心缺口，不能按非核心延期算通过。

S4．现行工程门禁、许可、隔离安装和资源闭包有可复现证据，发布包无凭据或非预期材料；保护分支合并仍须真实批准、CI 和线程门禁。

S5．上线前最小检查、插件上线、Sites 网页发布、Owner 体检及最终接受分别报告。第二客户端、完整视觉/可访问性/扩展场景可后移，延期不算通过；未测理解效果保持 `NOT_MEASURED`。

## 4．范围与约束

R1．唯一原意为本文，完整实施覆盖映射见[主 PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#original-meaning-and-engineering-coverage)，行为判准见[site SPEC](../spec/[SPEC]_HTML_Learning_Artifact.md)。来源计划不是第二主 PLAN。新[扩展 ADR](../adr/[ADR]_HTML_Learning_Artifact_Extension.md)只承接本次 site 与包级能力/分发边界；旧 HTML 合同及验收不重写、不追认。

R2．六步规则、语言、主题、工具和最小验收按原计划 §1–13 承接；原计划“过程计划放 Epic、子 Issue”由本轮单 Issue、单主 PR、多子 PR 及当前 plans 机制覆盖。版本从实际 0.1.36 补丁推进，Marketplace 与其他插件不随本次运行修改自动升版。

R3．七原则约束实施：Agent 技术执行与独立合成验收，Owner 实质决定和成品接受；严格待答、分段交付、五边界内授权复用、Harness 证据、风险隔离/恢复及受保护最终合并。完整原话由[本轮请求](../../plans/274-html-learning-artifact/evidence/sources/owner-request.txt)恢复，不在原意正文复制工程进度。

R4．必要回答未取得时保持同一待答状态。默认、推荐、预选、沉默、超时、未提交和关闭不算回答；原生持续显示须客户端实证，不承诺锁住宿主。非核心宿主入口可延期，必要答案缺失不能自行推进。

R5．Sites 是唯一必需外部制作能力；本地独立不等于模型或托管离线可用。不得编造连接器 ID/MCP/依赖字段，不推定公共插件目录上架资格；新站私有，更新保留身份和受众。运行时不自动安装依赖或加载远程脚本/字体/样式。

## 5．未决项

| 项目 | 实际状态、责任及依赖 |
|---|---|
| 原意整理稿 | 尚无 Owner 对本文的单独核对/逐字接受；Agent 保留来源继续已授权工作，不用 draft 抵消原实施指令 |
| 必要产品选择 | 原计划与本轮请求已给足本次范围，无需为常规技术选择重问；只有实质越界或真正缺少必要答案才停依赖部分 |
| 实际工具与发布条件 | Agent 核实安装后 Sites 发现、当前流程、一个客户端真实主流程、内部规则及最终保护批准；缺证不得自报通过 |
| 非核心及最终接受 | 原生窗口完整体验、第二客户端和完整扩展场景按影响/责任/恢复条件延期；Owner 体检与最终接受等真实决定，理解效果未测保持 NOT_MEASURED |
