# MJ AgentLab Marketplace

## 项目上下文

当前候选注册 diagram-kit / arch-diagram、learning-evidence-kit / pop-quiz、learning-record-check 与 explain-kit / glossary、concept，共三插件、五公开技能、两个显式学习入口；目标客户端为 ChatGPT 桌面端和 Codex 本地环境，CLI 验收基线 0.147.0。marketplace 暂为未发布 8.1.2，Learning Evidence 0.1.0、Diagram 0.3.1 / Explain 0.1.1；PR5 才准备 8.2.0。运行信息以索引、manifest 和 VERSION 为准；公开 v8.1.1 仍包含旧 Understanding，候选须从待测 branch/SHA 安装。

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

仓库主标使用 Owner 选定的 A（MJ＋斜向模块连接），三个插件采用已批准的 D 风格；品牌与图标修改读取 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md) 并使用 [.agents/skills/mp-design-icon](.agents/skills/mp-design-icon/SKILL.md)。开发技能为 20 项，候选三插件/五公开技能；Learning Evidence 复用旧 Understanding 批准图标并迁移资源归属。新增候选先选择后接入，已有批准直接复用。#203/#204 已完成品牌实现和验收记录，并随 v8.1.1 发布；[品牌验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)保留当时范围。后续发布不追认历史验收或批准。

Owner 于 2026-10-10 明确要求发布 8.1.1，发布授权已提供，不重复确认。候选从 develop 9bd54d7 派生，运行版本已匹配目标，无额外 bump。Owner 补充三张桌面截图，显示三插件详情页图标与候选版本，Diagram/Explain 示例提示区亦显示小图标；客户端版本、来源及实际输入框结果按已提供的具体证据记录，截图不补写未展示项。当前 main ruleset 要求当前 head 的非作者批准与 Validate Structure；门禁和后续发布事实见 [8.1.1 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。

Learning Evidence PR2 的本机能力和 PR3 的手动 GitHub 流转曾暂存于 scripts/learning-evidence，保持旧运行包字节；PR4 候选原子迁入 plugins/learning-evidence-kit/scripts 并删除暂存位置。保存、完整基线、身份、关联、恢复、导入导出和保留归档按记录契约执行，测试显式隔离库；实际分阶段测试、独立审查及合并状态见验收账本。

Learning Evidence PR3 的同一共用接口提供显式范围的完整 PR 评论发布、未知结果回读和缺段恢复，以及手动增量收集。收集先判定人/任务/时间范围再保存正文，翻页须观察连续稳定清单；失败保留已确认范围的快照与旧完成游标。工程验收使用独立临时库及替身 gh，真实账号权限、客户端和 GitHub 非作者批准另记，PR4 迁移只改变包归属，冻结共用模块内容保持。

## HTML Guide Kit 阶段实施

Owner 已授权按 [Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217) 与三个子 Issue 推进 HTML Guide Kit，分阶段顺序合并 develop；[ADR](docs/adr/[ADR]_HTML_Guide_Kit_Addition.md) 记录已确定合同。PR1 仅前置治理、提交 scope、版本工具和验收判准，运行仍为原三个插件、四公开技能、三个自然启用技能和 20 项仓库开发技能，不注册或创建空包。独立版本工具虽支持 html-guide-kit，缺 manifest 仍失败。PR2 必须完整包、已选图标、严格合同和登记原子接入，并通过六组真实连续行为；PR3 完成扩展工程验收、双客户端交互和实际 merge 复验。判准与事实见 [SPEC](docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md) 和 [RUNBOOK](docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)。

HTML Guide Kit 初始 0.1.0，仅显式 $html-guide-kit:guide，Read、聊天文本新建指南；读者/任务/理解问题须明确确认后生成。未答、推荐、预选、沉默、超时、无关回复或窗口消失不是确认，不能承诺锁宿主窗口。研究项目及指南聊天只作只读设计参考，运行包无本机路径或研究治理依赖。Owner 2026-10-12 调整：本次不做现实场景效果测试，实际效果另测，未测量不得写 PASS；安装、模型行为、客户端交互和工程门禁继续有效。

本任务保持 marketplace 未发布 8.1.2 及其他插件版本，无 Release、发布 tag 或 main 发布 PR。首次修改已合并的新插件运行内容时推进 0.1.1，其后补丁递增；纯评审资料/记录保持版本，以哈希核对运行内容。npm run check / smoke 为既有基线检查/隔离安装入口。每阶段满足当前 head 非作者批准、CI 与线程门禁后合并，不 bypass；合并复验后才关闭子 Issue，最终行为和双客户端及 merge 验收完整后才关闭 Epic。
