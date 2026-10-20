# MJ AgentLab Marketplace

## 项目上下文

Marketplacev8.3.3由#284/mainfdede3cf于2026-10-20公开，tag/Release同SHA，HTML0.1.38修复许可/路径/控件，5包8技能/5显式。真实tag新13/178、实际Python/4site静态及精确根清理通过；CLI0.147.0，实际bypass/空reviews/批准NOT_MET、首TEMP路径FAIL与旧UNKNOWN/延期保留，见[8.3.3账本](docs/runbook/[RUNBOOK]_Marketplace_8_3_3_Release_Readiness.md)。

manifest 的公开示例按[插件契约](docs/spec/[SPEC]_Plugin_Json_Schema.md)保留完整路由，最多三条，各原值不超过 128 个 Unicode scalar values；严格校验防止客户端忽略超长示例而丢失公开入口，不依赖空白归一化。

Learning Evidence Kit 的 Pop Quiz 诊断只读，明确移交后结束诊断，由包内共用能力保存和关联；Learning Record Check 分开核验指定记录有效性与任务应用。两个技能显式启动，不假定持续同步；共用能力不是第三技能。learn-kit、NotebookLM 与 Claude 退役规则继续有效，旧 [Understanding 决定](docs/adr/[ADR]_Understanding_Kit_Addition.md)与[验收](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)保留历史范围。

实施或验收 Learning Evidence Kit 时读取 [迁移 ADR](docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[记录/API 契约](docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)、[使用指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)与[验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。Epic #209 已获集中实施及条件发布授权；PR4 原子切换包及精确校验，安装脚本归属新插件，不依赖仓库过渡路径。Owner 接受双技能/接口不变、核心独立验收后交付；所有启用提问入口严格待答，未提交/默认/超时/关闭不算答复，原生持续显示须实证，文字重述或 pending 不算窗口通过。PR5 列实际可启用与延期入口；核心交付、原计划完成及 Owner 最终接受分别记录，Epic 保留延期。

历史v8.1.1的main/merge/tag、四种canonical与真实Python、Owner截图、两端完整客户端及独立批准缺项见[发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。#206回同步、#208当时8.1.2预升及同期文档历史保留，公开历史和未覆盖项不由后续发布追认。

历史#198公开8.1.0，#199回同步/#200记录修正/#201预升8.1.1；失败/回放/客户端未覆盖/批准缺项见[8.1.0记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)，不追认。

Explain初始0.1.0速解/深讲、中文/原术语、深度/格式适应见[ADR](docs/adr/[ADR]_Explain_Kit_Addition.md)及[验收](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)，不改测验策略。

Communication按[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)交付；PR1–4已合并，四包#237关闭未合并，由完整五包#241发布。显式单入口与保义/等待/文件合同见[包说明](plugins/communication-kit/README.md)及[communicate](plugins/communication-kit/skills/communicate/SKILL.md)，AICS仍Lab Proposal / Informative。旧失败、CLI C16–C18 PARTIAL、同一26.1007.2314.0桌面应用两个本机入口的限定实证及未覆盖项见[验收§4](docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。R05只对应未变资源，无新GUI；基础通过不证明现实效果。

## 执行与决策

#245五阶段已合并、actual6df新492/13安装/Python复验通过并关闭；Owner仅接受该Issue历史批准/bypass例外，非未来豁免，见[账本](docs/runbook/[RUNBOOK]_Windows_CI_Performance_Acceptance.md)。

#255实际3f0b7d12完整继承main761，同已测tree，新13安装/Python通过。随后DryRun/Apply预升8.3.2仅改VERSION/badge/A6，未创建发行；当前公开与收尾见274。历史bypass/空批准保留，新PR须真实批准/CI/线程；旧快照见[8.3.1账本](docs/runbook/[RUNBOOK]_Marketplace_8_3_1_Release_Readiness.md)。

Communication 任务统一从[入口 #222](plans/222-communication-kit/INDEX.md)读取主 PLAN、交付 REPORT 与固定原件；旧路径已按[整合任务 #269](plans/269-plans-path-unification/INDEX.md)迁入 plans，当前不提供旧路径兼容。历史产品合同、接受/失败和交付版本按原账本保留，后续工作复用真实授权，不因迁移重启插件验收。

Agent承担授权技术操作，Owner补必要信息、作实质决定/授权及成品最终接受；五授权边界未变复用。独立合成验收须运行证据，Harness自主修复，严格窗口未答不算答复，延期非通过；核心/全计划/接受分记，权限/不可逆/恢复按[执行规范](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。决策给2–3选项及有理由推荐，待答不默认。

按[文档框架](docs/rule/[STANDARD]_Documentation_Framework.md)用canonical/working、九字段及稳定任务INDEX/主PLAN/REPORT；公共working声明purpose/owner，旧文件显式兼容。新需求/实质修订先读[INTENT规范](docs/rule/[STANDARD]_AI_Engineering_Intent.md)：分层唯一原意、独立INTENT十字段、完整接受基线、稳定身份/全集合校验、逐项工程覆盖；旧接受保界，缺决定仅停依赖。拆分单Epic/同时一个主PR→受保护develop，多子PR→集成分支，内部Harness后Agent合并，最终保护不bypass；旧合同不追溯套用，冻结来源不动。

Harness验文档、来源和闭包；#258合入复验、批准缺口及推广决定见[REPORT](plans/257-task-documentation/[REPORT]_Task_Documentation.md)。

INTENT验收与限制见[REPORT](plans/263-intent-mechanism/[REPORT]_Intent_Mechanism.md)。

## 开发流程

使用独立 worktree 分支实施，保持 main / develop 工作区干净。变更执行前读取受影响的规范：治理用 [AI 工程规范](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)，文档用 [文档框架](docs/rule/[STANDARD]_Documentation_Framework.md)，提交用 [提交规范](docs/rule/[STANDARD]_Commit_Message_Convention.md)，发布用 [发布操作](docs/runbook/[RUNBOOK]_Release_Operations.md)。

A6 同步目标为根 AGENTS.md；过渡触发器继续识别旧路径，当前技能位于 .agents/skills，插件使用根 plugin.json。运行 npm test、npm run validate、npm run smoke:codex；Python 图表校验必须实际执行。正式发布须已有授权及当前适用验收边界；本轮 HTML 的已知 FAIL、双端未覆盖和 Owner 接受分项登记，不重启模型或桌面测试。

Codex latest canary 的技能路径须按同一提示文本的 Skill roots 表展开别名，再核对实际缓存与仓库作用域；缺失映射或路径越界须失败。兼容 canary 不改变 0.147.0 验收基线，实际复验见 [迁移验收记录](docs/runbook/[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md)。

develop 与 main 已完成治理迁移；结构校验与发布安装复查使用相同的严格校验，项目指令只从根 AGENTS.md 加载。

历史#190公开v8.0.0与桌面缺项见[记录](docs/runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)；发布后按[操作](docs/runbook/[RUNBOOK]_Release_Operations.md)回同步main并只预升市场VERSION/badge，插件独立推进。

## Codex 会话维护

用户明确请求会话归档、推荐标题或重命名当前任务时，读取并遵循 [会话维护规则](.agents/references/session-maintenance.md)。引用、示例、否定和机制讨论不触发；普通任务“收尾”按实际对象处理。

## 品牌与图标

仓库主标使用 Owner 选定的 A（MJ＋斜向模块连接），插件采用已批准的 D 风格；Communication 复用 Owner 选定的第二轮 D“地球＋清晰文字”，为 ASD-STE100 意象的原创 MJ 图标。品牌与图标修改读取 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md) 并使用 [.agents/skills/mp-design-icon](.agents/skills/mp-design-icon/SKILL.md)。开发技能保持 20 项，PR3 候选为五插件七公开技能，其中 pop-quiz / learning-record-check / guide / communicate 显式调用。新增候选先选择后接入，已有批准直接复用。#203/#204 已完成前三插件品牌实现和验收记录，并随 v8.1.1 发布；资源、隔离安装、独立技能演练及当时未完成项见 [品牌验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。后续发布不追认历史验收或批准。

8.1.1的发布授权、Owner三张图标截图及实际门禁见[发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)；截图不补写未展示项，历史独立批准缺项不追认。

Learning Evidence PR2 的本机能力和 PR3 的手动 GitHub 流转曾暂存于 scripts/learning-evidence，保持旧运行包字节；PR4 候选原子迁入 plugins/learning-evidence-kit/scripts 并删除暂存位置。保存、完整基线、身份、关联、恢复、导入导出和保留归档按记录契约执行，测试显式隔离库；实际分阶段测试、独立审查及合并状态见验收账本。

Learning Evidence PR3 的同一共用接口提供显式范围的完整 PR 评论发布、未知结果回读和缺段恢复，以及手动增量收集。收集先判定人/任务/时间范围再保存正文，翻页须观察连续稳定清单；失败保留已确认范围的快照与旧完成游标。工程验收使用独立临时库及替身 gh，真实账号权限、客户端和 GitHub 非作者批准另记，PR4 迁移只改变包归属，冻结共用模块内容保持。

Learning Record Check 按[记录/API契约](docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)及[指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)执行：复用明确的记录/任务选择；只有库路径、身份或cwd时停止，不枚举并擅选唯一/最新原件。先取选定原件并判断本人/任务/KU/版本适用性，再读取应用材料或实现；身份不适用立即停止。Stage2须手动请求、当前版本、本人解释及既有验证材料齐备，缺前提不调查或制造替代证据；新材料须新手动触发。新增条目用实际代理、当前技能/上下文、真实动作和时钟；原学习元数据保留不可改写原件/历史，账号未知可null，不据Git猜测。[8.2.0账本](docs/runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)分开记候选、入口资格、批准、发布与收尾。

PR2 已同步 #226 合入的 HTML Guide Kit 0.1.0，当时基准为四插件、五技能；PR4 替换 Learning Evidence 后开发集合为四插件、六公开技能、三项显式策略，PR4 当时 marketplace 为未发布 8.1.2，随后PR5准备8.2.0并已发布。HTML 包/其他插件/版本相对当前 develop 基准保持，旧 Understanding 只按已批准迁移替换。Owner 已决定 develop 保留已合入 HTML 内容；8.2.0 从独立发行候选交付 Diagram、Learning Evidence、Explain 三插件与五公开技能，HTML 另行发行，不因并行合入扩大本次公开发行范围。

## Communication 工具准备

Epic #222 PR2仅准备Communication提交/版本scope和图标工具；实际基线为Diagram、Learning、Explain、HTML四包六技能。缺Communication manifest时apply/DryRun必须零写入失败。D地球＋文字图标已获Owner选择并在PR3原子接入；旧失败见[品牌验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。Q3当时确认四包、HTML另发；2026-10-15本次整体发布已替代该旧范围。PR4已准备未发布8.3.0，Communication尚未正式公开；当前head批准及阶段依赖仍须满足。

## HTML Guide Kit 阶段实施

HTML0.1.38已随v8.3.3公开；[274](plans/274-html-learning-artifact/INDEX.md)的#289已合developf3e8，0.1.39含按需Matt/共识、主题/本地交付。actual新652/651P/1skip、13安装/Python/15根清理通过，仅市场8.3.4候选待合入；插件保持。实际bypass/批准NOT_MET、旧FAIL/UNKNOWN、窗口延期/效果未测/接受保界。

[Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)授权三阶段/worktree/codex。#221 merge70267a5复验/#218关闭；#226 d106e766同72cdd08树，0.1.0/第二轮A/七安装四Python复验/#219关闭。旧批准缺项保留。#231实际merge71e2同head树、CI全P/reviews空；原批准缺项保留，不bypass或指定审查人。

合同见[ADR](docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)及[SPEC](docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)：仅显式$html-guide-kit:guide，Read、中文/原术语、聊天文本新建。实际读材料/明确快照，分原料/核验背景/构造，保原文、定位、冲突/缺口。每次2–3不同读者/任务/问题及推荐理由，明确选择或修改确认才编排；默认/推荐/预选/沉默/超时/无关/消失非确认，未答保同一待确认，不锁宿主。深度随材料；按需演示/模拟/自检含操作、变化、结果、反馈、恢复、理由/误区和重试；无可靠判准给有界参考，不评分/长期掌握。不修订/比较/审查，不输出HTML/代码/文件/制作步骤或越权；仅SKILL及两参考，无Owner路径/研究治理依赖。

HTML22/71e2合并复验/批准缺项保；开发5包7技能/4显式/3自然/20repo-only，市场8.3.0/其他不变。源23–34失败/有限UI保。35/0ed工程346/13安装6PythonP，10UUID20C全7P1F2U4N、10未发/0post/0cross，无路径断言F；Work3C含指南/本地Codex1C待选仅有限证据，双端整体U/自有复原。36仅FW一span区分一步与多步断言，entry/ID保持；36/a47d3dff工程346/13安装6PythonP，model/双端N，见§76。Refs #217/#220。

现实效果另测NOT_MEASURED；原生接口已可用，源20 Work三轮有限路径独立通过、Codex应用另三轮有限路径独立通过；普通Chat入口不可用。原生空返回/超时/关闭未执行，CLI不替代。核心可分段交付，延期不当通过，#220/Epic开放、Owner接受独立。控制修正/来源/准确会话及历史见[RUNBOOK](docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)§11–42；不继承旧PASS。研究项目只读。

第五轮来源 acf3c9d 的六 fresh 会话/八调用已通过限定 CLI 核心判据：七次自然完成、一次执行器超时保留；九条新核验、两次限定离线共享及原件/生成信息均经独立核对。四轮原失败、两次策略拒绝、换行格式差异和幂等重放分别保留，不称所有调用成功。原移交仅按十二项未变资源闭包沿用并限已有本地 Git exclude；原生提问仍延期、桌面/Side Chat 未运行，实际保护合入、发布和 Owner 最终接受待各自证据。完整入口资格与限制见上述 Learning Evidence 验收账本。

Learning当前收尾：main/tag/published v8.2.0为ebc4bdc3三包五技能；#234同步2c0a831与#235预升3af6837实际合入，各八精确安装/实际Python通过，develop8.2.1仍未发布。#236/98068a8已收敛当前记录，原A6例外失败、正常摘要修复与空reviews保留，不追认批准；immutable配置UNKNOWN、Release immutable=false。详见[8.2.0账本](docs/runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)与[收尾回执](docs/runbook/evidence/learning-evidence-8-2-0-closeout.json)；原生延期、桌面/Side Chat及效果未测、Owner接受仍由#215/Epic独立追踪。

Communication PR3/PR4历史普通继承、运行资源身份、8.2.1→8.3.0准备和当时四包/HTML另发边界保留于[验收账本](docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)及[8.3账本](docs/runbook/[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)。旧CLI PARTIAL/有限UI/批准及阶段未完成按原记录，不由后续公开追认，Refs #222。

收尾原日志见[证据](docs/runbook/evidence/communication-kit-2026-10-13-closeout-sync-01.json)；原字节保留，AI审查不替代GitHub批准。

PR4继承空白修复检查完整PR范围；冻结计划、来源及原失败证据保留原字节。

PR1 #223已实际合入develop bca7b5c（2026-10-13，源5a9d845同树）；reviews=[]不追认独立批准。本分支普通同步，Refs #222。
