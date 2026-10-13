# MJ AgentLab Marketplace

## 项目上下文

本工作树是 Communication 四包发行预备投影，Refs #222；不是从实际 PR4 merge 派生的 PR5。VERSION 8.3.0、Communication 0.1.0 均未发布。注册、插件目录、严格资源集合、品牌导出与九组安装矩阵原子限定 Diagram、Learning Evidence、Explain、Communication，六公开技能、三显式、普通三、开发二十。正式 PR5 须从受保护 PR4 实际验收 merge 重新派生并核对差异；R01–R05 尚未执行。

develop PR3候选保留HTML，共五包七技能/四显式；main/latest Release8.2.0仅前三包五技能，tag/发布目标ebc4bdc3。Owner Q3明确HTML留develop另发，本工作树不分发它。目标为ChatGPT桌面和Codex本地，CLI基线0.147.0；版本与来源以权威文件为准。

manifest 的公开示例按[插件契约](docs/spec/[SPEC]_Plugin_Json_Schema.md)保留完整路由，最多三条，各原值不超过 128 个 Unicode scalar values；严格校验防止客户端忽略超长示例而丢失公开入口，不依赖空白归一化。

Learning Evidence Kit 的 Pop Quiz 诊断只读，明确移交后结束诊断，由包内共用能力保存和关联；Learning Record Check 分开核验指定记录有效性与任务应用。两个技能显式启动，不假定持续同步；共用能力不是第三技能。learn-kit、NotebookLM 与 Claude 退役规则继续有效，旧 [Understanding 决定](docs/adr/[ADR]_Understanding_Kit_Addition.md)与[验收](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)保留历史范围。

实施或验收 Learning Evidence Kit 时读取 [迁移 ADR](docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[记录/API 契约](docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)、[使用指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)与[验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。Epic #209 已获集中实施及条件发布授权；PR4 原子切换包及精确校验，安装脚本归属新插件，不依赖仓库过渡路径。Owner 接受双技能/接口不变、核心独立验收后交付；所有启用提问入口严格待答，未提交/默认/超时/关闭不算答复，原生持续显示须实证，文字重述或 pending 不算窗口通过。PR5 列实际可启用与延期入口；核心交付、原计划完成及 Owner 最终接受分别记录，Epic 保留延期。

历史v8.1.1的main/merge/tag、四种canonical与真实Python、Owner截图、两端完整客户端及独立批准缺项见[发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。#206回同步、#208当时8.1.2预升及同期文档历史保留，公开历史和未覆盖项不由后续发布追认。

历史 v8.1.0 通过 #198 发布，#199 完成 main → develop 同步，#200 修正发布记录，#201 将 develop 预升为当时未发布的 8.1.1。历史验收失败、回放、未覆盖客户端结果与缺失批准分别保留，见 [8.1.0 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

explain-kit 0.1.0 提供速解和深讲，默认中文、保留术语原文，按深度路由并适应用户格式。新增解释能力的 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md) 与 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 不改变测验策略。

Communication实施与发布使用[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)。候选[包说明](plugins/communication-kit/README.md)和[communicate](plugins/communication-kit/skills/communicate/SKILL.md)定义显式单入口、沟通/编写/保义改写、关键缺口等待、成稿＋关键提示及明确请求才保存编辑。冻结AICS保持Lab Proposal / Informative，运行只依赖包内摘要。工程307测试、十三组canonical及六次缓存Python通过；旧行为失败与CLI C16–C18 PARTIAL保留。2026-10-13代理亲自执行同一26.1007.2314.0桌面应用内Codex本地和ChatGPT/Work本机两个入口，安装、图标、三任务、聊天等待及新MD/TXT保存回读限定范围PASS；身份、原生窗口/其他客户端未覆盖项见[验收记录§4](docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。Communication发布未执行，PR1–4保持draft；Learning先发已完成，当前阶段独立批准与合并仍缺；现实效果测试本轮延期。

## 执行与决策

Owner Q3：Communication正式只发行Learning三包＋Communication四包六技能，HTML留develop另发；开发保持五包七技能，实际门禁见[验收记录](docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。

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

仓库主标使用 Owner 选定的 A（MJ＋斜向模块连接），插件采用已批准的 D 风格；Communication 复用 Owner 选定的第二轮 D“地球＋清晰文字”，为 ASD-STE100 意象的原创 MJ 图标。品牌与图标修改读取 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md) 并使用 [.agents/skills/mp-design-icon](.agents/skills/mp-design-icon/SKILL.md)。开发技能保持 20 项，PR3 候选为五插件七公开技能，其中 pop-quiz / learning-record-check / guide / communicate 显式调用。新增候选先选择后接入，已有批准直接复用。#203/#204 已完成前三插件品牌实现和验收记录，并随 v8.1.1 发布；资源、隔离安装、独立技能演练及当时未完成项见 [品牌验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。后续发布不追认历史验收或批准。

8.1.1的发布授权、Owner三张图标截图及实际门禁见[发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)；截图不补写未展示项，历史独立批准缺项不追认。

Learning Evidence PR2 的本机能力和 PR3 的手动 GitHub 流转曾暂存于 scripts/learning-evidence，保持旧运行包字节；PR4 候选原子迁入 plugins/learning-evidence-kit/scripts 并删除暂存位置。保存、完整基线、身份、关联、恢复、导入导出和保留归档按记录契约执行，测试显式隔离库；实际分阶段测试、独立审查及合并状态见验收账本。

Learning Evidence PR3 的同一共用接口提供显式范围的完整 PR 评论发布、未知结果回读和缺段恢复，以及手动增量收集。收集先判定人/任务/时间范围再保存正文，翻页须观察连续稳定清单；失败保留已确认范围的快照与旧完成游标。工程验收使用独立临时库及替身 gh，真实账号权限、客户端和 GitHub 非作者批准另记，PR4 迁移只改变包归属，冻结共用模块内容保持。

Learning Record Check 按[记录/API契约](docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)及[指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)执行：复用明确的记录/任务选择；只有库路径、身份或cwd时停止，不枚举并擅选唯一/最新原件。先取选定原件并判断本人/任务/KU/版本适用性，再读取应用材料或实现；身份不适用立即停止。Stage2须手动请求、当前版本、本人解释及既有验证材料齐备，缺前提不调查或制造替代证据；新材料须新手动触发。新增条目用实际代理、当前技能/上下文、真实动作和时钟；原学习元数据保留不可改写原件/历史，账号未知可null，不据Git猜测。[8.2.0账本](docs/runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)分开记候选、入口资格、批准、发布与收尾。

PR2 已同步 #226 合入的 HTML Guide Kit 0.1.0，当时基准为四插件、五技能；PR4 替换 Learning Evidence 后开发集合为四插件、六公开技能、三项显式策略，PR4 当时 marketplace 为未发布 8.1.2，随后PR5准备8.2.0并已发布。HTML 包/其他插件/版本相对当前 develop 基准保持，旧 Understanding 只按已批准迁移替换。Owner 已决定 develop 保留已合入 HTML 内容；8.2.0 从独立发行候选交付 Diagram、Learning Evidence、Explain 三插件与五公开技能，HTML 另行发行，不因并行合入扩大本次公开发行范围。

## Communication 工具准备

Epic #222 PR2仅准备Communication提交/版本scope和图标工具；实际基线为Diagram、Learning、Explain、HTML四包六技能。缺Communication manifest时apply/DryRun必须零写入失败。D地球＋文字图标已获Owner选择并在PR3原子接入；旧失败见[品牌验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。Q3已确认正式只公开Learning三包＋Communication四包六技能，HTML留develop另发。PR4已准备未发布8.3.0，Communication尚未正式公开；当前head批准及阶段依赖仍须满足。

## HTML Guide Kit 阶段实施

HTML Guide Kit 按 [Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217) 分阶段实施，[ADR](docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)固定合同。#221 / #226 的实际 merge、当时集合、测试、连续行为、缓存安装、失败和批准缺项按[RUNBOOK](docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)保留；[SPEC](docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)定义扩展工程、双客户端和 merge 验收。新基线不追认旧 UI、现实效果或批准；当前 head 门禁和本阶段验收仍逐项核对。

HTML Guide Kit 初始 0.1.0，仅显式 $html-guide-kit:guide，Read、聊天文本新建指南；读者/任务/理解问题须明确确认后生成。未答、推荐、预选、沉默、超时、无关回复或窗口消失不是确认，不能承诺锁宿主窗口。研究项目及指南聊天只作只读设计参考，运行包无本机路径或研究治理依赖。Owner 2026-10-12 调整：本次不做现实场景效果测试，实际效果另测，未测量不得写 PASS；安装、模型行为、客户端交互和工程门禁继续有效。

HTML PR1 当时保持 marketplace 未发布 8.1.2 及其他插件版本，无 Release、发布 tag 或 main 发布 PR；Learning Evidence PR5 后续单独准备未发布 8.2.0，不据此注册 HTML 包或改变其阶段边界。首次修改已合并的新插件运行内容时推进 0.1.1，其后补丁递增；纯评审资料/记录保持版本，以哈希核对运行内容。npm run check / smoke 为既有基线检查/隔离安装入口。每阶段满足当前 head 非作者批准、CI 与线程门禁后合并，不 bypass；合并复验后才关闭子 Issue，最终行为和双客户端及 merge 验收完整后才关闭 Epic。

第五轮来源 acf3c9d 的六 fresh 会话/八调用已通过限定 CLI 核心判据：七次自然完成、一次执行器超时保留；九条新核验、两次限定离线共享及原件/生成信息均经独立核对。四轮原失败、两次策略拒绝、换行格式差异和幂等重放分别保留，不称所有调用成功。原移交仅按十二项未变资源闭包沿用并限已有本地 Git exclude；原生提问仍延期、桌面/Side Chat 未运行，实际保护合入、发布和 Owner 最终接受待各自证据。完整入口资格与限制见上述 Learning Evidence 验收账本。

Learning前序#216/#224/#227/#228/#230交付与#210–214关闭、模型原失败和审查缺项见[验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。#232/main ebc4bdc3与已测6d83c8e同树，v8.2.0由bot公开，发布后五canonical/三图表Python/两组保存重放通过，发布脚本noop；immutable=false，API未提供配置字段。#224有实际批准，其他未见/空reviews不追认。原生入口延期、桌面/Side Chat未测、现实效果及Owner最终接受另记，#215/Epic仍OPEN。

Communication PR3普通同步已合并#234的develop2c0a831，完整保留HTML及Learning/Diagram/Explain运行包，接入五包七技能/四显式/普通三/开发20。十三snapshot和固定提交canonical分开，既有Comm UI/CLI PARTIAL/失败按原身份保留；正式仅D/L/E/Comm四包六技能，HTML留develop。#235现已实际合入develop3af6837，版本/badge8.2.1生效，插件/运行内容保持；其reviews为空不追认批准，PR3仅继承，不额外bump；PR4保留已准备8.3.0，不以8.2.1覆盖获准目标。Refs #222；当前head批准、CI/线程及实际保护合并仍待完成。

Communication PR4以已公开8.2.0基线先DryRun零写入后准备8.3.0 VERSION/badge；五包根版本保持，包变更仅首版CHANGELOG正式段。PR1–4仍draft，实际PR3/4受保护merge与正式四包候选未完成；R01–R05不填PASS，见[8.3.0账本](docs/runbook/[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)，Refs #222。
