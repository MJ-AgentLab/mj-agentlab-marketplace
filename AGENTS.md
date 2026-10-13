# MJ AgentLab Marketplace

## 项目上下文

当前develop注册Diagram、Learning Evidence、Explain、HTML四包六技能/三显式，VERSION8.2.1（未发布开发预升）；main/latest Release8.2.0仅Diagram、Learning、Explain三包五技能，tag/发布目标ebc4bdc3，HTML未公开。Communication在PR1仅契约，正式范围按Q3在公开三包上加自身，目标后续独立minor；CLI基线0.147.0，版本/来源以权威文件为准。 本分支HTML0.1.12为未合并修正候选。

manifest 的公开示例按[插件契约](docs/spec/[SPEC]_Plugin_Json_Schema.md)保留完整路由，最多三条，各原值不超过 128 个 Unicode scalar values；严格校验防止客户端忽略超长示例而丢失公开入口，不依赖空白归一化。

Learning Evidence Kit 的 Pop Quiz 诊断只读，明确移交后结束诊断，由包内共用能力保存和关联；Learning Record Check 分开核验指定记录有效性与任务应用。两个技能显式启动，不假定持续同步；共用能力不是第三技能。learn-kit、NotebookLM 与 Claude 退役规则继续有效，旧 [Understanding 决定](docs/adr/[ADR]_Understanding_Kit_Addition.md)与[验收](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)保留历史范围。

实施或验收 Learning Evidence Kit 时读取 [迁移 ADR](docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[记录/API 契约](docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)、[使用指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)与[验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。Epic #209 已获集中实施及条件发布授权；PR4 原子切换包及精确校验，安装脚本归属新插件，不依赖仓库过渡路径。Owner 接受双技能/接口不变、核心独立验收后交付；所有启用提问入口严格待答，未提交/默认/超时/关闭不算答复，原生持续显示须实证，文字重述或 pending 不算窗口通过。PR5 列实际可启用与延期入口；核心交付、原计划完成及 Owner 最终接受分别记录，Epic 保留延期。

Marketplace v8.1.1 已通过 #205 合入 main 并于 2026-10-10 自动发布，包含 diagram-kit 0.3.1 / understanding-kit 0.1.2 / explain-kit 0.1.1。已发布 merge 与已测 head 的 Git tree 相同，发布后四种 canonical 安装、图标内容比较与实际 Python 校验通过。Owner 截图支持详情页图标和版本，两端完整客户端记录及 #205 GitHub 独立批准未提供；事实见 [8.1.1 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。#206 已将实际发布 main 同步回 develop；此前 #208 应用未发布的 8.1.2 pre-bump，当时只更新 VERSION / README badge，保持旧插件版本，不创建同号 Release。同期 main 文档 PR #207 的实际 merge ancestry 在收尾时继续纳入。

历史 v8.1.0 通过 #198 发布，#199 完成 main → develop 同步，#200 修正发布记录，#201 将 develop 预升为当时未发布的 8.1.1。历史验收失败、回放、未覆盖客户端结果与缺失批准分别保留，见 [8.1.0 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

explain-kit 0.1.0 提供速解和深讲，默认中文、保留术语原文，按深度路由并适应用户格式。新增解释能力的 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md) 与 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 不改变测验策略。

## 执行与决策

Communication正式发行范围已由Owner通过grilling Q3明确为Learning已公开三包＋Communication（四包六技能），HTML保留develop另发；PR3开发集成仍保留HTML，形成五包七技能。范围决定不等于版本转换、GitHub独立批准或发布已完成，沿[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)记录实际门禁。

communication-kit 首版按已保存的[完整计划](plan/communication-kit-implementation-plan.md)实施，来源与授权见[捕获记录](plan/communication-kit-plan-provenance.json)，由 [Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222) 管理 PR1–PR5 与正式上线。产品方向、显式 communicate 单入口、保义改写和文件边界已确认；设计与验收契约见[新增 ADR](docs/adr/[ADR]_Communication_Kit_Addition.md)及[验收 RUNBOOK](docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。PR1/PR2 保持现有运行集合，PR3 原子接入新包。Owner 选择 Learning 先发布 8.2.0，Communication 随后独立 minor（预计 8.3.0），PR4 重查实际版本和基线；现实效果测试本次延期，基础通过不代表效果已验证。

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

Learning Record Check 先确认已选定记录或任务，分开适用性与应用阶段；实际作者/当前技能/真实时钟、手动触发及既有材料要求按[新指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)和[记录/API](docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)执行，原学习信息保留原件。失败、阻断与重跑见验收账本。

PR2 已同步 #226 合入的 HTML Guide Kit 0.1.0，当时基准为四插件、五技能；PR4 替换 Learning Evidence 后开发集合为四插件、六公开技能、三项显式策略，PR4 当时 marketplace 为未发布 8.1.2，PR5 已准备未发布 8.2.0。HTML 包/其他插件/版本相对当前 develop 基准保持，旧 Understanding 只按已批准迁移替换。Owner 已决定 develop 保留已合入 HTML 内容；8.2.0 从独立发行候选交付 Diagram、Learning Evidence、Explain 三插件与五公开技能，HTML 另行发行，不因并行合入扩大本次公开发行范围。

第五轮来源 acf3c9d 的六 fresh 会话/八调用已通过限定 CLI 核心判据：七次自然完成、一次执行器超时保留；九条新核验、两次限定离线共享及原件/生成信息均经独立核对。四轮原失败、两次策略拒绝、换行格式差异和幂等重放分别保留，不称所有调用成功。原移交仅按十二项未变资源闭包沿用并限已有本地 Git exclude；原生提问仍延期、桌面/Side Chat 未运行，实际保护合入、发布和 Owner 最终接受待各自证据。完整入口资格与限制见上述 Learning Evidence 验收账本。

较早发行准备快照（当前状态见下段）：三插件发行草稿 #232 已创建，head b7bdd769 / tree 428760eb；该最终 Git 提交的五种 canonical 安装及实际缓存 Python 通过，运行/测试代码与模型源 acf3 一致。develop 的四插件仍保留，main/latest Release 仍 8.1.1；最后依赖 #230、当前 head 非作者批准、main 合入与公开发布仍待完成，详见发行准备账本。

Learning Evidence 当前交付：#216/#224/#227/#228/#230已交付，#210–214关闭。#232/main ebc4bdc3于2026-10-13公开v8.2.0，tag/Release同SHA，发布后五精确安装/实际Python及published-noop复查通过。#234实际merge 2c0a8317同步main ancestry，#235实际merge 3af68373完成未发布8.2.1预升，均与已测head同树且各八精确安装/实际Python通过；HTML四插件开发集合及插件版本保持。版本工具只更新VERSION/badge两锚点，#235按Owner要求修复failing check另补真实根摘要，三路径走正常A6；原例外失败保留，checker/workflow/批准规则未改。main/public仍原三插件8.2.0，无8.2.1 tag/Release；版本清单以VERSION、索引和manifest为准。#224实际批准与其他交付PR的空reviews分别留档，不推定豁免；repo immutable配置UNKNOWN，Release immutable=false。完整事实见[发行账本](docs/runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)与[收尾回执](docs/runbook/evidence/learning-evidence-8-2-0-closeout.json)。后续不指定审查人；原生延期、桌面/Side Chat未运行、效果未测和Owner最终接受仍由#215/Epic独立追踪。

## HTML Guide Kit 阶段实施

Owner授权[Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)三阶段、独立worktree/codex分支。PR1 #221 merge70267a5已复验，#218关闭；PR2 #226 merge d106e766与已测72cdd08同树，完整0.1.0/第二轮A图标/严格合同、七安装/四缓存Python已复验，#219关闭。历史reviews缺独立批准如实保留。PR3 #231继续扩展及双客户端/最终merge复验；当前head非作者批准、CI和线程门禁须满足，不bypass。

HTML0.1.12未合并修正候选；marketplace未发布8.2.1，main公开三插件、develop四插件未发行。已同步并发origin/developbca7b5c（#223契约，#236收口及前期3af6837/2c0a831/6b5a19e/434d053）的Learning Evidence迁移，保留四插件、六公开技能、三个自然启用技能、三个显式策略和20项仓库开发技能，本任务不修改其他插件版本。公开8.2.0仅三包，HTML留develop另发；本任务无Release/tag/main发布授权。版本工具缺manifest仍失败。

唯一入口 $html-guide-kit:guide，显式调用、Read、默认中文/原术语，聊天文本新建指南。每次实际读材料/快照并区分证据、保留冲突缺口；给2–3套不同读者/任务/理解问题，推荐及理由。明确选择或修改确认后才生成；推荐、预选、沉默、超时、无关回复或窗口消失不算确认，未答保留同一待确认，不承诺锁宿主窗口。深度按材料调整；保留来源、条件、例外与未知；需要的演示/模拟/自检含反馈及恢复，无可靠判准仅有限参考，不评分或推断长期掌握。只新建，不修订/比较/审查，不输出HTML/代码/文件/具体制作工具步骤或越权执行。运行资源仅SKILL及两份参考，无Owner路径/研究治理/历史聊天依赖。

0.1.0–0.1.11原FAIL/invalid/partial/未跑分别封存，Node/.NET复原通过；0.1.4/0.1.7模型NOT_RUN。源11 e3a4daec准确八安装/四缓存Python/CI通过，8UUID/16COMPLETE独立5PASS/2FAIL/1UNEXERCISED；原局部PASS不抵消遗漏当前态和已禁直接操作误归未知路径。0.1.12先整理完整源规则，逐个直接操作匹配并与后续路径分开，再组织全篇就地条件；源恢复与新增UI分项归因保持。入口6144字节等严格6144上限，未放宽。须新canonical安装及冻结六组、受影响E、重复、连续S和余扩展，不继承旧PASS。

Owner调整现实场景效果另测，本次NOT_MEASURED。当前操作工具仅浏览器，原生应用API禁用；Codex应用UI、ChatGPT桌面及空返回/超时/关闭事件未执行，CLI不替代。合格核心可分段交付，延期入口不视为通过；Issue #220与Epic保持开放，Owner最终接受独立记录。决定见[ADR](docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)，判准见[SPEC](docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)，完整历史/实际证据/当前候选见[RUNBOOK](docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)§11–29。研究项目只读，不整理或提交其沉淀。

Communication PR1 普通同步已合入的 #236 / develop `98068a8` 文档收尾；当前开发基线8.2.1仍四包六技能，Communication在本前置阶段未注册。main/tag/Release仍为 `ebc4bdc3` / published v8.2.0三包五技能；Q3正式Communication四包六技能、HTML留develop另发保持。最新来源和延期见上述发行账本与收尾回执，本轮保留原计划及历史证据，不额外bump，Refs #222。

PR1继承空白修复检查完整PR范围；冻结计划、来源及原失败证据保留原字节。
