# MJ AgentLab Marketplace

## 项目上下文

当前develop注册 diagram-kit / arch-diagram、learning-evidence-kit / pop-quiz、learning-record-check、explain-kit / glossary、concept 与 html-guide-kit / guide，共四插件、六公开技能、三个显式入口。公开 Marketplace v8.2.0 已经 #232 合入main并自动发布，只有原定Diagram 0.3.1 / Learning Evidence 0.1.0 / Explain 0.1.1三个插件、五技能、两显式学习策略；HTML保留develop另发，本分支0.1.8修正候选未发行。目标客户端为ChatGPT桌面端和Codex本地环境，CLI验收基线0.147.0；各运行版本与清单以VERSION、索引和manifest为准。

manifest 的公开示例按[插件契约](docs/spec/[SPEC]_Plugin_Json_Schema.md)保留完整路由，最多三条，各原值不超过 128 个 Unicode scalar values；严格校验防止客户端忽略超长示例而丢失公开入口，不依赖空白归一化。

Learning Evidence Kit 的 Pop Quiz 诊断只读，明确移交后结束诊断，由包内共用能力保存和关联；Learning Record Check 分开核验指定记录有效性与任务应用。两个技能显式启动，不假定持续同步；共用能力不是第三技能。learn-kit、NotebookLM 与 Claude 退役规则继续有效，旧 [Understanding 决定](docs/adr/[ADR]_Understanding_Kit_Addition.md)与[验收](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)保留历史范围。

实施或验收 Learning Evidence Kit 时读取 [迁移 ADR](docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[记录/API 契约](docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)、[使用指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)与[验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。Epic #209 已获集中实施及条件发布授权；PR4 原子切换包及精确校验，安装脚本归属新插件，不依赖仓库过渡路径。Owner 接受双技能/接口不变、核心独立验收后交付；所有启用提问入口严格待答，未提交/默认/超时/关闭不算答复，原生持续显示须实证，文字重述或 pending 不算窗口通过。PR5 列实际可启用与延期入口；核心交付、原计划完成及 Owner 最终接受分别记录，Epic 保留延期。

Marketplace v8.1.1 已通过 #205 合入 main 并于 2026-10-10 自动发布，包含 diagram-kit 0.3.1 / understanding-kit 0.1.2 / explain-kit 0.1.1。已发布 merge 与已测 head 的 Git tree 相同，发布后四种 canonical 安装、图标内容比较与实际 Python 校验通过。Owner 截图支持详情页图标和版本，两端完整客户端记录及 #205 GitHub 独立批准未提供；事实见 [8.1.1 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。#206 已将实际发布 main 同步回 develop；此前 #208 应用未发布的 8.1.2 pre-bump，当时只更新 VERSION / README badge，保持旧插件版本，不创建同号 Release。同期 main 文档 PR #207 的实际 merge ancestry 在收尾时继续纳入。

历史 v8.1.0 通过 #198 发布，#199 完成 main → develop 同步，#200 修正发布记录，#201 将 develop 预升为当时未发布的 8.1.1。历史验收失败、回放、未覆盖客户端结果与缺失批准分别保留，见 [8.1.0 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

explain-kit 0.1.0 提供速解和深讲，默认中文、保留术语原文，按深度路由并适应用户格式。新增解释能力的 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md) 与 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 不改变测验策略。

## 执行与决策

代理负责在已有授权范围内执行文件修改、环境检查、测试、隔离安装验证、提交、推送及 PR 准备。owner 作出决定后，由代理执行，不要求 owner 复制命令，不重复确认已授权的操作。CI、分支保护、独立审查及外部身份验证按实际约束处理；无法完成时说明具体原因，只请求最小必要参与。

需要 owner 决策时，提供 2–3 个明确选项，说明主要影响，标记推荐项及理由。常规实现细节由代理判断；必须由 owner 决定的事项等待答复。已有决定不重复询问，推荐项不视为默认批准。

## 开发流程

使用独立 worktree 分支实施，保持 main / develop 工作区干净。变更执行前读取受影响的规范：治理用 [AI 工程规范](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)，文档用 [文档框架](docs/rule/[STANDARD]_Documentation_Framework.md)，提交用 [提交规范](docs/rule/[STANDARD]_Commit_Message_Convention.md)，发布用 [发布操作](docs/runbook/[RUNBOOK]_Release_Operations.md)。

A6 同步目标为根 AGENTS.md；过渡触发器继续识别旧路径，当前技能位于 .agents/skills，插件使用根 plugin.json。运行 npm test、npm run validate、npm run smoke:codex；Python 图表校验必须实际执行。正式发布需独立的发布授权与两个目标客户端的验收证据。

Codex latest canary 的技能路径须按同一提示文本的 Skill roots 表展开别名，再核对实际缓存与仓库作用域；缺失映射或路径越界须失败。兼容 canary 不改变 0.147.0 验收基线，实际复验见 [迁移验收记录](docs/runbook/[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md)。

develop 与 main 已完成治理迁移；结构校验与发布安装复查使用相同的严格校验，项目指令只从根 AGENTS.md 加载。

v8.0.0 已经 #190 合入 main 并自动发布，实际状态和未完成的桌面验收见 [发布记录](docs/runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)。发布后按 [发布操作](docs/runbook/[RUNBOOK]_Release_Operations.md) 同步 main 到 develop 并准备下一补丁 pre-bump；只更新 marketplace VERSION 与派生 README badge，插件版本按自身变更推进。

## Codex 会话维护

用户明确请求会话归档、推荐标题或重命名当前任务时，读取并遵循 [会话维护规则](.agents/references/session-maintenance.md)。引用、示例、否定和机制讨论不触发；普通任务“收尾”按实际对象处理。

## 品牌与图标

仓库主标使用 Owner 选定的 A（MJ＋斜向模块连接），三个插件采用已批准的 D 风格；品牌与图标修改读取 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md) 并使用 [.agents/skills/mp-design-icon](.agents/skills/mp-design-icon/SKILL.md)。开发技能为 20 项，开发候选四插件/六公开技能；Learning Evidence 复用旧 Understanding 批准图标并迁移资源归属。新增候选先选择后接入，已有批准直接复用。#203/#204 已完成品牌实现和验收记录，并随 v8.1.1 发布；[品牌验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)保留当时范围。后续发布不追认历史验收或批准。

Owner 于 2026-10-10 明确要求发布 8.1.1，发布授权已提供，不重复确认。候选从 develop 9bd54d7 派生，运行版本已匹配目标，无额外 bump。Owner 补充三张桌面截图，显示三插件详情页图标与候选版本，Diagram/Explain 示例提示区亦显示小图标；客户端版本、来源及实际输入框结果按已提供的具体证据记录，截图不补写未展示项。当前 main ruleset 要求当前 head 的非作者批准与 Validate Structure；门禁和后续发布事实见 [8.1.1 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。

Learning Evidence PR2 的本机能力和 PR3 的手动 GitHub 流转曾暂存于 scripts/learning-evidence，保持旧运行包字节；PR4 候选原子迁入 plugins/learning-evidence-kit/scripts 并删除暂存位置。保存、完整基线、身份、关联、恢复、导入导出和保留归档按记录契约执行，测试显式隔离库；实际分阶段测试、独立审查及合并状态见验收账本。

Learning Evidence PR3 的同一共用接口提供显式范围的完整 PR 评论发布、未知结果回读和缺段恢复，以及手动增量收集。收集先判定人/任务/时间范围再保存正文，翻页须观察连续稳定清单；失败保留已确认范围的快照与旧完成游标。工程验收使用独立临时库及替身 gh，真实账号权限、客户端和 GitHub 非作者批准另记，PR4 迁移只改变包归属，冻结共用模块内容保持。

Learning Record Check 先确认本会话已选定的记录或任务范围；已有选择可复用，命名任务/PR或明确移交记录足够，不强求 ID。仅库路径、身份或 cwd 不算选定，缺选择时停止，不枚举并擅选唯一/最新原件。先获取选定原件并完成本人/任务/KU/版本适用性判断，再读取应用说明、校验材料和实现；身份不适用立即停止，不把 Stage2 读取混入 Stage1 命令批次。应用检查须在实现调查或运行探针前确认手动请求、适用记录、当前版本、本人解释及既有验证材料齐备；缺前提立即停止应用阶段，不制造替代材料或先验证实现再记 not_run。材料到达不自动恢复，须新手动触发。新增核验条目使用实际生成代理、当前 LRC 技能/上下文、实际操作与真实时钟时间；原学习作者/技能/时间保留在不可改写原件及关联历史，不复制成新条目的生成信息。未知操作账号可 null 并说明，不能据 Git/PR 猜测或反复要求确认。真实模型各轮失败、修复、环境阻断及后续重跑按验收账本分别保留。[8.2.0 发布准备](docs/runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)分开记录技术候选、逐入口资格、外部批准、实际发布及发布后收尾。

PR2 已同步 #226 合入的 HTML Guide Kit 0.1.0，当时基准为四插件、五技能；PR4 替换 Learning Evidence 后开发集合为四插件、六公开技能、三项显式策略，PR4 当时 marketplace 为未发布 8.1.2，PR5 已准备未发布 8.2.0。HTML 包/其他插件/版本相对当前 develop 基准保持，旧 Understanding 只按已批准迁移替换。Owner 已决定 develop 保留已合入 HTML 内容；8.2.0 从独立发行候选交付 Diagram、Learning Evidence、Explain 三插件与五公开技能，HTML 另行发行，不因并行合入扩大本次公开发行范围。

第五轮来源 acf3c9d 的六 fresh 会话/八调用已通过限定 CLI 核心判据：七次自然完成、一次执行器超时保留；九条新核验、两次限定离线共享及原件/生成信息均经独立核对。四轮原失败、两次策略拒绝、换行格式差异和幂等重放分别保留，不称所有调用成功。原移交仅按十二项未变资源闭包沿用并限已有本地 Git exclude；原生提问仍延期、桌面/Side Chat 未运行，实际保护合入、发布和 Owner 最终接受待各自证据。完整入口资格与限制见上述 Learning Evidence 验收账本。

较早发行准备快照（当前状态见下段）：三插件发行草稿 #232 已创建，head b7bdd769 / tree 428760eb；该最终 Git 提交的五种 canonical 安装及实际缓存 Python 通过，运行/测试代码与模型源 acf3 一致。develop 的四插件仍保留，main/latest Release 仍 8.1.1；最后依赖 #230、当前 head 非作者批准、main 合入与公开发布仍待完成，详见发行准备账本。

Learning Evidence 当前交付：#216/#224/#227/#228/#230已实际交付，#210–214关闭；#232于2026-10-13合入main ebc4bdc3并自动公开v8.2.0，tag/Release同SHA，merge与已测6d83c8e同树5c7557fe。发布后五精确canonical/三图表Python/两组记录保存重放检查通过，发布脚本复核noop。#224有实际当前head批准；#216/#227/#228/#230/#232未提供或空reviews缺项保留，不推定豁免。仓库API未提供immutable配置字段，实际Release immutable=false，不声称锁定。完整来源/原始模型失败及发布事实见[发布账本](docs/runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)。本同步保留develop全部四插件运行/脚本/测试/版本和HTML证据，只接入实际main ancestry及当前记录；同步与下一8.2.1两文件pre-bump分两个PR执行，实际状态以VERSION/各PR回执为准，不创建8.2.1 Release。Owner要求不指定审查人；当前head批准/CI/线程门禁保持。原生入口延期、桌面/Side Chat未运行、现实效果/Owner最终接受和两个收尾PR分别追踪，#215/Epic保持OPEN。

## HTML Guide Kit 阶段实施

Owner 已授权 [Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217) 的三个阶段、独立 worktree 和 codex/ 分支。PR1 #221 实际 merge 70267a5 已复验，#218 已关闭；PR2 [#226](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/226) 于2026-10-12接入完整0.1.0包、第二轮已选A图标与严格合同，merge d106e766 与已测head72cdd08 tree相同，七安装/四缓存Python通过，#219已显式关闭。历史GitHub reviews缺少独立批准如实保留，不追认门禁。PR3 #231 继续扩展工程、双客户端及最终merge复验；当前head非作者批准、required checks和已解决审查线程仍须满足，不bypass。

当前分支 HTML Guide Kit 0.1.8 是未合并修正候选；marketplace保持上游8.2.0；已发布main只含三插件，develop四插件集合未发行。已同步并发origin/develop2c0a831（前期6b5a19e/434d053）的Learning Evidence迁移，保留四插件、六公开技能、三个自然启用技能、三个显式策略和20项仓库开发技能，本任务不修改其他插件版本。公开8.2.0三插件发行范围按并行任务决定，HTML保留develop、另行发行；本任务无Release、tag或main发布授权。版本工具缺manifest仍失败。

唯一入口 $html-guide-kit:guide，显式调用、Read、默认中文/原术语，聊天文本新建指南。每次实际读材料/快照并区分证据、保留冲突缺口；给2–3套不同读者/任务/理解问题，推荐及理由。明确选择或修改确认后才生成；推荐、预选、沉默、超时、无关回复或窗口消失不算确认，未答保留同一待确认，不承诺锁宿主窗口。深度按材料调整；保留来源、条件、例外与未知；需要的演示/模拟/自检含反馈及恢复，无可靠判准仅有限参考，不评分或推断长期掌握。只新建，不修订/比较/审查，不输出HTML/代码/文件/具体制作工具步骤或越权执行。运行资源仅SKILL及两份参考，无Owner路径/研究治理/历史聊天依赖。

0.1.0–0.1.3真实失败、修正调用、回放、控制INVALID_RUN、未覆盖及操作中断分别保留；788历史文件及506个0.1.2文件已lossless封存并经Node/.NET复原，不能追认PASS。0.1.3独立评审发现重复操作整体未知、拒绝回显HTML及重叠反馈；中间0.1.4安装通过但模型NOT_RUN。0.1.5原生SKILL注入截断，B6 revise无补读为UNKNOWN/INVALID_RUN，其他三项有工具全文补读的局部PASS不消除缺陷。0.1.6精简入口实际完整加载，但新B6.1给未标构造的通用输入域，独立补充fidelity FAIL。0.1.7安装通过但模型NOT_RUN。0.1.8完整修正源字段归因、值域、自检必要前提、局部排他范围、未知组合及替换源的例外清理；保留已知局部结果，须新cache全部六组/受影响/连续流程。仓库/安装共用6144 UTF-8字节保守预算；须新canonical安装、完整实际加载及全部六组/受影响行为复验，不能继承旧PASS。

Owner调整现实场景效果另测，本次NOT_MEASURED。当前操作工具仅浏览器，原生应用API禁用；Codex应用UI、ChatGPT桌面及空返回/超时/关闭事件未执行，CLI不替代。合格核心可分段交付，延期入口不视为通过；Issue #220与Epic保持开放，Owner最终接受独立记录。决定见[ADR](docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)，判准见[SPEC](docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)，完整历史/实际证据/当前候选见[RUNBOOK](docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)§11–22。研究项目只读，不整理或提交其沉淀。
