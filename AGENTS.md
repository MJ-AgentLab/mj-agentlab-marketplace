# MJ AgentLab Marketplace

## 项目上下文

当前 PR3 开发候选原子接入 communication-kit / communicate，公开集合为 Diagram、Understanding、Explain、HTML Guide 与 Communication；目标客户端为 ChatGPT 桌面端和 Codex 本地环境，Codex CLI 验收基线 0.147.0。运行信息以市场索引、各插件 manifest 和 VERSION 为准；main / 最新 Release 8.1.1 仍为前三插件，Communication 尚未发布。

understanding-kit 是显式调用的只读理解测验，Codex 优先 Side Chat；其他会话使用明确的上下文快照，不假定持续同步。插件边界及对旧单插件约束的局部替代见 [新增决定](docs/adr/[ADR]_Understanding_Kit_Addition.md)，真实客户端证据见 [验收记录](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)。learn-kit、NotebookLM 与 Claude 退役规则继续有效。

实施 Learning Evidence Kit 时读取 [迁移 ADR](docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)、[记录/API 契约](docs/spec/[SPEC]_Learning_Evidence_Record_And_API.md)与[验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。Epic #209 已获集中实施及条件发布授权，目标 8.2.0 / 0.1.0；PR1 不改当前注册、运行包或版本。Owner 接受保留双技能/接口、核心独立验收后交付，原生严格窗口不合格入口延期；PR5 按实际入口列证据，文字重述或 pending 状态不算持续显示通过。核心交付、原计划完成及 Owner 最终接受分别记录，Epic 保留延期项。

Marketplace v8.1.1 已通过 #205 合入 main 并于 2026-10-10 自动发布，包含 diagram-kit 0.3.1 / understanding-kit 0.1.2 / explain-kit 0.1.1。已发布 merge 与已测 head 的 Git tree 相同，发布后四种 canonical 安装、图标内容比较与实际 Python 校验通过。Owner 截图支持详情页图标和版本，两端完整客户端记录及 #205 GitHub 独立批准未提供；事实见 [8.1.1 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。#206 已将实际发布 main 同步回 develop；本分支应用未发布的 8.1.2 pre-bump，只更新 VERSION / README badge，插件版本保持，不创建同号 Release。同期 main 文档 PR #207 的实际 merge ancestry 在收尾时继续纳入。

历史 v8.1.0 通过 #198 发布，#199 完成 main → develop 同步，#200 修正发布记录，#201 将 develop 预升为当时未发布的 8.1.1。历史验收失败、回放、未覆盖客户端结果与缺失批准分别保留，见 [8.1.0 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

explain-kit 0.1.0 提供速解和深讲，默认中文、保留术语原文，按深度路由并适应用户格式。新增解释能力的 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md) 与 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 不改变测验策略。

Communication实施与发布使用[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)。候选[包说明](plugins/communication-kit/README.md)和[communicate](plugins/communication-kit/skills/communicate/SKILL.md)定义显式单入口、沟通/编写/保义改写、关键缺口等待、成稿＋关键提示及明确请求才保存编辑。冻结AICS保持Lab Proposal / Informative，运行只依赖包内摘要。工程307测试、十三组canonical及六次缓存Python通过；旧行为失败与CLI C16–C18 PARTIAL保留。2026-10-13代理亲自执行同一26.1007.2314.0桌面应用内Codex本地和ChatGPT/Work本机两个入口，安装、图标、三任务、聊天等待及新MD/TXT保存回读限定范围PASS；身份、原生窗口/其他客户端未覆盖项见[验收记录§4](docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。发布未执行，PR1–3保持draft，独立批准及Learning先发依赖尚缺；现实效果测试本轮延期。

## 执行与决策

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

仓库主标使用 Owner 选定的 A（MJ＋斜向模块连接），插件采用已批准的 D 风格；Communication 复用 Owner 选定的第二轮 D“地球＋清晰文字”，为 ASD-STE100 意象的原创 MJ 图标。品牌与图标修改读取 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md) 并使用 [.agents/skills/mp-design-icon](.agents/skills/mp-design-icon/SKILL.md)。开发技能保持 20 项，PR3 候选为五插件六公开技能，其中 pop-quiz / guide / communicate 显式调用。新增候选先选择后接入，已有批准直接复用。#203/#204 已完成前三插件品牌实现和验收记录，并随 v8.1.1 发布；资源、隔离安装、独立技能演练及当时未完成项见 [品牌验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。后续发布不追认历史验收或批准。

Owner 于 2026-10-10 明确要求发布 8.1.1，发布授权已提供，不重复确认。候选从 develop 9bd54d7 派生，运行版本已匹配目标，无额外 bump。Owner 补充三张桌面截图，显示三插件详情页图标与候选版本，Diagram/Explain 示例提示区亦显示小图标；客户端版本、来源及实际输入框结果按已提供的具体证据记录，截图不补写未展示项。当前 main ruleset 要求当前 head 的非作者批准与 Validate Structure；门禁和后续发布事实见 [8.1.1 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。

Learning Evidence PR2 的共用本机能力暂存于 scripts/learning-evidence，旧运行包保持字节；保存、完整基线、身份、关联、恢复、导入导出和保留归档按新记录契约执行。测试显式隔离库；PR3 加入手动 GitHub 流转，PR4 才原子移入新包，当前公开注册不提前切换。实际测试、独立审查及未合并状态见验收账本。

Learning Evidence PR3 同一暂存接口提供显式范围的完整 PR 评论发布、未知结果回读和缺段恢复，以及手动增量收集。收集先判定人/任务/时间范围再保存正文，翻页须观察连续稳定清单；失败保留已确认范围的快照与旧完成游标。工程验收使用独立临时库及替身 gh，真实账号权限、客户端和 GitHub 非作者批准另记，PR2/3 合入后才进入 PR4 原子迁移。

PR2 已同步 #226 合入的 HTML Guide Kit 0.1.0，当前 develop 基准四插件、五公开技能、两项显式策略，marketplace 保持未发布 8.1.2；本阶段全部运行包、登记及 VERSION 相对该基准不变。Owner 已决定 develop 保留已合入 HTML 内容；8.2.0 从独立发行候选交付 Diagram、Learning Evidence、Explain 三插件与五公开技能，HTML 另行发行，不因并行合入扩大本次公开发行范围。

## Communication 工具准备

Epic #222 的 PR2 扩展提交和版本工具的 `communication-kit` 候选 scope，并让品牌预览按行容纳第四张图。当前同步基线的运行集合为四个插件、五个公开技能；缺少实际 manifest 时版本工具应零写入失败，未执行真实 bump。Owner 已选择第二轮 D 地球＋清晰文字候选；初轮未选和导出失败保留，正式资源与注册等待 PR3 原子接入；候选、实测及未覆盖项见 [品牌验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。本阶段仍依赖 PR1 实际合并和当前 head 独立批准，不把准备工作写成上线完成。

## HTML Guide Kit 阶段实施

Owner 已授权按 [Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217) 与三个子 Issue 推进 HTML Guide Kit，分阶段顺序合并 develop；[ADR](docs/adr/[ADR]_HTML_Guide_Kit_Addition.md) 记录已确定合同。PR1 #221 已合并，实际 merge 70267a5 与已测 head tree 相同，四种 canonical 安装与缓存 Python 复验通过；#218 已显式关闭，独立批准缺项按实际记录保留。PR2 [#226](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/226) 接入完整 HTML Guide Kit 0.1.0 包、Owner 选定的第二轮 A 图标与严格登记；开发运行集合为四插件、五公开技能、三个自然启用技能和 20 项仓库开发技能。版本工具缺 manifest 仍失败。候选 1cd0f1c 的 279 测试、严格七安装及四次缓存 Python、六组14指定变体30连续轮次独立评审通过，未覆盖 UI/扩展/现实效果不据此追认。最初无效调用、工具拒绝、额外重试和 B5.2 来源措辞 note 保留。当前 head 独立批准及实际 merge 复验仍须满足，完成前 #219 不关闭；PR3 完成扩展工程验收、双客户端交互和实际 merge 复验。判准与事实见 [SPEC](docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md) 和 [RUNBOOK](docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)。

HTML Guide Kit 初始 0.1.0，仅显式 $html-guide-kit:guide，Read、聊天文本新建指南；读者/任务/理解问题须明确确认后生成。未答、推荐、预选、沉默、超时、无关回复或窗口消失不是确认，不能承诺锁宿主窗口。研究项目及指南聊天只作只读设计参考，运行包无本机路径或研究治理依赖。Owner 2026-10-12 调整：本次不做现实场景效果测试，实际效果另测，未测量不得写 PASS；安装、模型行为、客户端交互和工程门禁继续有效。

本任务保持 marketplace 未发布 8.1.2 及其他插件版本，无 Release、发布 tag 或 main 发布 PR。首次修改已合并的新插件运行内容时推进 0.1.1，其后补丁递增；纯评审资料/记录保持版本，以哈希核对运行内容。npm run check / smoke 为既有基线检查/隔离安装入口。每阶段满足当前 head 非作者批准、CI 与线程门禁后合并，不 bypass；合并复验后才关闭子 Issue，最终行为和双客户端及 merge 验收完整后才关闭 Epic。

Learning Evidence #224 已于 2026-10-13 获 yrk666 对当前 c1d7bab 的非作者批准并合入 a2090ff8；merge 与已验收 head 的 Git tree 相同，七种精确 canonical 安装和四次已安装 Python 校验通过，#211 显式关闭。PR3 同步实际 merge 后运行内容不变，311/311、33 存储/31 离线 GitHub 实际 Python、严格校验、精确 CLI 基线与七隔离安装通过；当前最终 head 的独立批准和合入另核对。旧 pending 文字按原时点保留，完整合并回执见验收账本。Owner 再次确认按 #227 → #228 → #230 → #232 推进并条件发布三插件 8.2.0，HTML 留 develop 另发，Epic 延期项继续开放。
