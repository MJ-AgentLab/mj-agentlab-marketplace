---
type: intent
scope: html-guide-kit
summary: "Create traceable HTML learning artifacts with confirmed design and agreed Sites or local delivery"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-20
state: draft
version: v1.2
layer: canonical
intent-id: INT-2026-003
---

# [INTENT] HTML learning artifact delivery

| 来源与责任 | 实际记录 |
|---|---|
| 提出者 | 当前聊天的项目 Owner；准确账号未由来源提供 |
| 原始来源 | B1为[原计划完整字节快照](../../plans/274-html-learning-artifact/evidence/sources/HTML-Learning-Artifact-Plugin-Implementation-Plan.md)，U1为[原实施请求](../../plans/274-html-learning-artifact/evidence/sources/owner-request.txt)。本次B2为Slack文件F0C98A3LV5M的API完整正文，U2为Owner本次选择性统一原话；外部完整快照、定位及捕获限制见[本次基线](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#selective-alignment-baseline)，不公开研究全文。来源中的历史批准自述不单独证明真实决定；未知消息身份/时间保持未知 |
| 接受责任人 | 项目 Owner；合成角色及工程代理不代作最终接受 |
| 原意核对记录 | 本文由Agent据来源整理，尚无Owner对本v1.2整理稿的单独核对或逐字接受。已有明确选择与实施授权继续有效，来源自述不补证历史核对 |
| 内容接受记录 | 旧完整计划及七原则的[授权记录](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#accepted-baseline-and-authorization)保留。Owner本次以Slack完整提示词为基准，保留本地生成器和工程检查，保护既有材料并允许独立目录产物，补按需grilling、设计共识、可选主题及本地交付；唯一决定正本为[本次基线](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#selective-alignment-baseline)。旧核心ACCEPTED_LIMITED不扩张为本稿逐字接受、新增能力通过或全计划接受 |
| 当前内容与适用基线 | v1.2仅刷新工程时点，B2/U2的选择性统一业务原意保持v1.1；旧v1.1可从固定Git fe295a005e1659ea210a9768bbcce88d72ed64f4恢复。修订前v1.0及旧完整合同可从固定Git提交a4892f51f4163fb5bd4457d99229eaf1a4683e8f恢复，完整定位/覆盖见主PLAN。B1/U1与旧结果保留，新增范围另验；来源清单及外部快照负责恢复，捕获时间不冒充消息或决定时间 |
| 主跟踪 Issue | [#274](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274)；[任务入口](../../plans/274-html-learning-artifact/INDEX.md)导航主 PLAN/后续实际 REPORT；工程进度留 Issue |

## 1．问题与现状

O1．原计划期望提供“从学习材料到 HTML 学习制品的完整能力”，围绕特定读者、任务和理解目标，生成可阅读、可操作、可追溯的学习网页。现有 `guide` 在聊天中交付指南文本，不能据此认定已具备网页制作与发布能力。

项目事实另记：实施前基线为 develop `1d5219c1fa1bbf14cc79f630a59e9a8c857248f4`；`html-guide-kit` 实际为 0.1.36、Read、唯一显式 `guide`，Marketplace 为未发布 8.3.2，开发集合五包七公开技能。原计划的 0.1.0 与较旧 HEAD 仅描述当时事实，不作为本次版本依据。

本次修订针对完整制作提示词与已实现site合同的差异。当前公开v8.3.3/HTML0.1.38；0.1.39仍为本批未发布候选，实际工程身份/检查由同一主PLAN和REPORT报告，不由本文推定验证完成。既有核心接受、延期、历史FAIL/UNKNOWN与保护批准缺项按原范围保留。

## 2．期望结果

O2．同一插件以显式 `$html-guide-kit:site` 制作学习网页，保留 `guide` 职责、既有运行字节和已批准图标。交付包括独立内容源、来源说明、必要设计理由、源码/恢复说明、版本与实际检查记录，以及约定的可访问Sites网页或本地HTML。

O3．以六步方法完成Define Understanding Needs、Develop Learning Materials、Design Information Structure and Relationship Representation、Design Interaction, Representation, and UI UX、Build and Verify HTML、Evaluate and Revise。教材按具体主题组织，深度随材料与任务变化，不强制六章、题量或交互数量；简单任务合并必要记录，不为流程制造空文档。

O4．核心名称采用稳定英文并配邻近中文解释；说明、案例、学习活动、反馈和控件以中文为默认。维护本地单一术语参考和制品主题映射；忠实保留来源、条件、例外、冲突、未知及构造边界。

O5．方法、模板、主题、转换和检查资源在插件包内闭合，保留本地生成器、复制反馈、静态检查与通用渲染检查，内容、视图及用户反馈分开。主题按读者、任务、内容和已确认偏好选择，暖白纸面/陶土色为候选；本地生成器提供warm-paper/neutral，省略配置保留warm-paper兼容，其他方向可由Sites独立实现并验证。交互依据理解任务选用，支持必要反馈、改答失效、重试、重置、依据回链、复制和本地导出。

O6．默认以当前Sites流程新建并私有发布，也可按已约定范围维护已有Site或仅本地制作。Sites模式核真实身份、源码、保存版本、部署及访问范围；本地模式在独立目录交付可用HTML、内容源、来源、检查和恢复说明。两模式按各自必要验收判断，不能因Sites不可用静默切换，也不能将本地文件存在等同Sites发布或安装后消费者流程通过。

## 3．成功判断

S1．安装后的插件可发现两个显式入口，site 所需运行资源完整且与源字节对应；核心方法不依赖原研究仓库、个人路径、历史聊天、其他插件缓存或运行时下载。

S2．代表性材料的关键结论、条件、例外、关系及练习判准正确；英文核心名称、中文学习内容及术语一致性符合约定。结构和控件可用不能代替语义核验。

S3．一个目标客户端实际完成材料输入、六步制作和约定模式的交付。Sites模式取得可访问网页并核对真实地址、保存版本、部署状态和访问范围，缺该流程仍为该模式核心缺口；已约定本地模式核对HTML可读、内容源一致、必要操作与恢复可用，并明确未发布Sites。新本地规则不追认旧Sites判准，新增能力验证未完成时不称通过。

S4．现行工程门禁、许可、隔离安装和资源闭包有可复现证据，发布包无凭据或非预期材料；保护分支合并仍须真实批准、CI 和线程门禁。

S5．约定制品交付、上线前最小检查、插件上线、Sites网页发布、Owner体检及最终接受分别报告。第二客户端、完整视觉/可访问性/扩展场景可后移，延期不算通过；原生窗口持续显示及空返回/超时/关闭仍待实际客户端证据，文字pending不替代；未测理解效果保持 `NOT_MEASURED`。

## 4．范围与约束

R1．唯一原意为本文，完整实施覆盖映射见[主 PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#original-meaning-and-engineering-coverage)，行为判准见[site SPEC](../spec/[SPEC]_HTML_Learning_Artifact.md)。来源计划不是第二主 PLAN。新[扩展 ADR](../adr/[ADR]_HTML_Learning_Artifact_Extension.md)只承接本次 site 与包级能力/分发边界；旧 HTML 合同及验收不重写、不追认。

R2．六步、语言和AICS原则以B2全文为本次基准，按U2保留本地工具/工程检查并增量调整受影响合同；不因未读完整AICS文本而宣称全部AICS检查通过。B1/U1旧接受与完整基线保留。本任务复用单Issue、同时一个活动主PR、多子PR及当前plans机制；#284/#287已实际结束，后继完整main同步及0.1.39沿同Issue、唯一protected develop主PR推进；具体阶段由任务入口定位。Marketplace与其他插件不随本次修改自动升版。

R3．七原则约束实施：Agent 技术执行与独立合成验收，Owner 实质决定和成品接受；严格待答、分段交付、五边界内授权复用、Harness 证据、风险隔离/恢复及受保护最终合并。完整原话由[本轮请求](../../plans/274-html-learning-artifact/evidence/sources/owner-request.txt)恢复，不在原意正文复制工程进度。

R4．先查已有材料和决定，只有影响读者、目标、材料、阅读路径或交付范围的关键未决才按需读取并使用Matt Pocock grilling，分轮提问并给选项、推荐和理由；关键问题解决后简述设计共识并确认，再开始依赖实现。已确认设计直接复用，不重复访谈或确认；普通实现细节由Agent判断。触发且需要Matt但技能缺失时，记录该阶段依赖缺口，保持同一待答并继续独立工作，不能用包内问答冒称已执行Matt或完成该阶段。必要回答未取得不能推进依赖部分；默认、推荐、预选、沉默、超时、未提交和关闭均非答复。原生持续显示须客户端实证，不承诺锁住宿主，窗口延期不算通过。

R5．既有材料、研究原件和安装缓存保持，允许在独立输出目录生成约定产物，不原地改写或覆盖来源。Sites在Sites交付模式中为必需外部能力；本地模式不依赖托管，但本地独立不等于模型离线可用。不得编造连接器ID/MCP/依赖字段，不推定公共目录资格；新站私有，更新保留身份/受众。运行时不自动安装Matt或其他依赖，不加载远程脚本/字体/样式；可选第三方工具只在决定采用后核版本/许可并读取适配。

## 5．未决项

| 项目 | 实际状态、责任及依赖 |
|---|---|
| 原意整理稿 | 尚无Owner对本v1.2稿的单独核对/逐字接受；继续本次已授权范围，不用draft抵消实施授权，不扩大旧核心接受 |
| 必要产品选择 | B2/U2已决定本次统一范围；具体制作复用已确认设计，仅关键未决才触发grilling与依赖确认，不制造重复访谈 |
| 实际工具与发布条件 | 本批0.1.39准备及新增验收未完成；核实所选模式、安装后主流程、工具/材料保护、内部规则及最终保护批准；完整main同步及唯一protected develop主PR由同任务报告实际阶段，缺证不报通过 |
| 非核心及最终接受 | 原生窗口完整体验、第二客户端和完整扩展场景按影响/责任/恢复条件延期；Owner 体检与最终接受等真实决定，理解效果未测保持 NOT_MEASURED |
