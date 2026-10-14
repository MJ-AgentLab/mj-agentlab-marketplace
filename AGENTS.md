# MJ AgentLab Marketplace

## 项目上下文

当前develop注册Diagram、Learning Evidence、Explain、HTML、Communication五包七技能/四显式，VERSION8.3.0为Communication PR4未发布版本准备；main/latest Release8.2.0仅前三包五技能，tag/发布目标ebc4bdc3。Communication正式范围按Owner Q3为前三包加Communication四包六技能，HTML留develop另发；后续独立minor目标8.3.0，PR4核对实际From/To。目标为ChatGPT桌面和Codex本地，CLI基线0.147.0；版本与来源以权威文件为准。

manifest 的公开示例按[插件契约](docs/spec/[SPEC]_Plugin_Json_Schema.md)保留完整路由，最多三条，各原值不超过 128 个 Unicode scalar values；严格校验防止客户端忽略超长示例而丢失公开入口，不依赖空白归一化。

Learning Evidence Kit 的 Pop Quiz 诊断只读，明确移交后结束诊断，由包内共用能力保存和关联；Learning Record Check 分开核验指定记录有效性与任务应用。两个技能显式启动，不假定持续同步；共用能力不是第三技能。learn-kit、NotebookLM 与 Claude 退役规则继续有效，旧 [Understanding 决定](docs/adr/[ADR]_Understanding_Kit_Addition.md)与[验收](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)保留历史范围。

实施或验收 Learning Evidence Kit 时读取 [迁移 ADR](docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[记录/API 契约](docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)、[使用指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)与[验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。Epic #209 已获集中实施及条件发布授权；PR4 原子切换包及精确校验，安装脚本归属新插件，不依赖仓库过渡路径。Owner 接受双技能/接口不变、核心独立验收后交付；所有启用提问入口严格待答，未提交/默认/超时/关闭不算答复，原生持续显示须实证，文字重述或 pending 不算窗口通过。PR5 列实际可启用与延期入口；核心交付、原计划完成及 Owner 最终接受分别记录，Epic 保留延期。

历史v8.1.1的main/merge/tag、四种canonical与真实Python、Owner截图、两端完整客户端及独立批准缺项见[发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。#206回同步、#208当时8.1.2预升及同期文档历史保留，公开历史和未覆盖项不由后续发布追认。

历史#198公开8.1.0，#199回同步/#200记录修正/#201预升8.1.1；失败/回放/客户端未覆盖/批准缺项见[8.1.0记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)，不追认。

Explain初始0.1.0速解/深讲、中文/原术语、深度/格式适应见[ADR](docs/adr/[ADR]_Explain_Kit_Addition.md)及[验收](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)，不改测验策略。

Communication实施与发布使用[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)。候选[包说明](plugins/communication-kit/README.md)和[communicate](plugins/communication-kit/skills/communicate/SKILL.md)定义显式单入口、沟通/编写/保义改写、关键缺口等待、成稿＋关键提示及明确请求才保存编辑。冻结AICS保持Lab Proposal / Informative，运行只依赖包内摘要。工程307测试、十三组canonical及六次缓存Python通过；旧行为失败与CLI C16–C18 PARTIAL保留。2026-10-13代理亲自执行同一26.1007.2314.0桌面应用内Codex本地和ChatGPT/Work本机两个入口，安装、图标、三任务、聊天等待及新MD/TXT保存回读限定范围PASS；身份、原生窗口/其他客户端未覆盖项见[验收记录§4](docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。Communication发布未执行，此前PR1–4保持draft；Learning先发已完成，当前阶段独立批准与合并仍缺；现实效果测试本轮延期。

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

Epic #222 PR2仅准备Communication提交/版本scope和图标工具；实际基线为Diagram、Learning、Explain、HTML四包六技能。缺Communication manifest时apply/DryRun必须零写入失败。D地球＋文字图标已获Owner选择并在PR3原子接入；旧失败见[品牌验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。Q3已确认正式只公开Learning三包＋Communication四包六技能，HTML留develop另发。PR4已准备未发布8.3.0，Communication尚未正式公开；当前head批准及阶段依赖仍须满足。

## HTML Guide Kit 阶段实施

[Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)授权三阶段/worktree/codex。#221 merge70267a5复验/#218关闭；#226 d106e766同72cdd08树，0.1.0/第二轮A/七安装四Python复验/#219关闭。旧批准缺项保留。#231实际merge71e2同head树、CI全P/reviews空；原批准缺项保留，不bypass或指定审查人。

合同见[ADR](docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)及[SPEC](docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)：仅显式$html-guide-kit:guide，Read、中文/原术语、聊天文本新建。实际读材料/明确快照，分原料/核验背景/构造，保原文、定位、冲突/缺口。每次2–3不同读者/任务/问题及推荐理由，明确选择或修改确认才编排；默认/推荐/预选/沉默/超时/无关/消失非确认，未答保同一待确认，不锁宿主。深度随材料；按需演示/模拟/自检含操作、变化、结果、反馈、恢复、理由/误区和重试；无可靠判准给有界参考，不评分/长期掌握。不修订/比较/审查，不输出HTML/代码/文件/制作步骤或越权；仅SKILL及两参考，无Owner路径/研究治理依赖。

HTML22/71e2已合并，同树/十三安装六PythonP，reviews空留缺项；五包七技能/四显式/三自然/20repo-only，市场8.3/其他包保持。旧22双端有限P及核心F、23–26停止见RUNBOOK§44–52，不追认。27/00d59工程CIP、9UUID18C为5P3F1U5N停止；28/83b3完整346/十三安装六PythonP，实际high核心5UUID10C为2P1F2U9N停止。29/0.1.29已接入entry/FW两处拒因纪律修正，ID保持；工程检查中，defaultlow/旧失败不改，新安装/模型/双端待实证，见§53–57。

现实效果另测NOT_MEASURED；原生接口已可用，源20 Work三轮有限路径独立通过、Codex应用另三轮有限路径独立通过；普通Chat入口不可用。原生空返回/超时/关闭未执行，CLI不替代。核心可分段交付，延期不当通过，#220/Epic开放、Owner接受独立。控制修正/来源/准确会话及历史见[RUNBOOK](docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)§11–42；不继承旧PASS。研究项目只读。

第五轮来源 acf3c9d 的六 fresh 会话/八调用已通过限定 CLI 核心判据：七次自然完成、一次执行器超时保留；九条新核验、两次限定离线共享及原件/生成信息均经独立核对。四轮原失败、两次策略拒绝、换行格式差异和幂等重放分别保留，不称所有调用成功。原移交仅按十二项未变资源闭包沿用并限已有本地 Git exclude；原生提问仍延期、桌面/Side Chat 未运行，实际保护合入、发布和 Owner 最终接受待各自证据。完整入口资格与限制见上述 Learning Evidence 验收账本。

Learning当前收尾：main/tag/published v8.2.0为ebc4bdc3三包五技能；#234同步2c0a831与#235预升3af6837实际合入，各八精确安装/实际Python通过，develop8.2.1仍未发布。#236/98068a8已收敛当前记录，原A6例外失败、正常摘要修复与空reviews保留，不追认批准；immutable配置UNKNOWN、Release immutable=false。详见[8.2.0账本](docs/runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)与[收尾回执](docs/runbook/evidence/learning-evidence-8-2-0-closeout.json)；原生延期、桌面/Side Chat及效果未测、Owner接受仍由#215/Epic独立追踪。

Communication PR3已普通继承PR2 c198f5c及最新#236/develop98068a8的文档收尾，VERSION/badge8.2.1保持；生产包、脚本/测试/注册与cf63337零新差异，仍五包七技能/四显式/普通三/开发20。正式仅D/L/E/Comm四包六技能，HTML留develop；旧失败、CLI PARTIAL及限定UI身份保持，未重跑安装或客户端。当前head批准、CI/线程及保护合并另核对，Refs #222。

Communication PR4普通合入PR3 c6d40a8与最新develop98068a8，仅同步文档/evidence；VERSION/badge8.3.0、根8.3及Comm0.1正式CH保持，不重复bump。当前仍五包七技能/四显式，正式仅四包六技能、HTML另发；生产与48437be零新差异，Comm170fcad除CH外与实际UI源000e803一致。历史失败/PARTIAL与限定客户端身份保留，实际phase merge、批准、正式四包及R未完成，见[8.3账本](docs/runbook/[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)，Refs #222。

收尾原日志见[证据](docs/runbook/evidence/communication-kit-2026-10-13-closeout-sync-01.json)；原字节保留，AI审查不替代GitHub批准。

PR4继承空白修复检查完整PR范围；冻结计划、来源及原失败证据保留原字节。

PR1 #223已实际合入develop bca7b5c（2026-10-13，源5a9d845同树）；reviews=[]不追认独立批准。本分支普通同步，Refs #222。
