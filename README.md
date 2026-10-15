# MJ AgentLab Marketplace

<img src="assets/brand/marketplace/logo.svg" width="128" height="128" alt="MJ AgentLab Marketplace — MJ letters with connected modules">

![Version](https://img.shields.io/badge/version-8.3.0-blue)

面向 ChatGPT 桌面端与 Codex 本地环境（CLI 验收基线 0.147.0）的插件市场，无需 MCP 服务。本分支准备将 develop 完整五插件、七公开技能、四显式入口发布为 Marketplace 8.3.0；当前已公开基线仍为 main/v8.2.0 的三插件，实际公开状态以 [GitHub Releases](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases) 为准：

| 插件 / 公开技能 | 用途 | 版本与分发状态 |
| --- | --- | --- |
| **diagram-kit / arch-diagram** | 从源码事实生成七类 Mermaid 架构/UML 图，节点与边追溯到文件行号，实际运行 Python 校验器 | 0.3.1，已随市场 v8.1.1 发布 |
| **explain-kit / glossary、concept** | 陌生术语速解与机制、反例、边界深讲，遵从受众、语言和长度要求 | 0.1.1，已随市场 v8.1.1 发布 |
| **learning-evidence-kit / pop-quiz、learning-record-check** | 显式诊断并移交完整记录，保留本机原件；分开核验指定记录有效性与任务应用，按授权共享 | 0.1.0，已随市场 v8.2.0 发布 |
| **html-guide-kit / guide** | 确认读者、任务和理解问题后，新建可复制的交互教材绘制指南文本 | 0.1.36，本次 8.3.0 候选；已知限制见下文 |
| **communication-kit / communicate** | 显式调用，沟通、编写与保义改写；关键缺口先问并等待，交付成稿和关键提示 | 0.1.0，本次 8.3.0 候选 |

历史 [Marketplace v8.1.1](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.1.1) 于 2026-10-10 随 #205 合入 main 自动发布，该历史版本包含 Understanding Kit 0.1.2 / pop-quiz，采用 A 仓库主标和 D 插件图标。该次发布后的四种隔离安装、图标内容比较与实际 Python 校验通过；Owner 截图、两端完整客户端记录缺项及未提供的 GitHub 独立批准见 [8.1.1 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。这些历史结果不证明新候选的客户端或窗口通过。

### Codex

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref v8.2.0
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin add learning-evidence-kit@mj-agentlab-marketplace
codex plugin add explain-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

上面固定已发布的三插件集合，不包含 HTML Guide Kit。三个插件可按需独立安装；调用 `$diagram-kit:arch-diagram` 或请求“给这个仓库画架构图”。开发候选安装另使用 develop 或精确 SHA：

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref develop
codex plugin add learning-evidence-kit@mj-agentlab-marketplace
codex plugin list --json
~~~

当前 develop / VERSION / badge 均为待发布的 8.3.0。Owner 已决定完整发布五插件，替代此前 HTML 另发的范围；不重复 bump，不改变插件内容。发布前使用 develop 或精确候选 SHA；8.3.0 公开后改用 --ref v8.3.0，并可安装 html-guide-kit@mj-agentlab-marketplace 与 communication-kit@mj-agentlab-marketplace。发布范围、证据与门禁见[8.3.0 账本](docs/runbook/[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)；[8.2.0 记录](docs/runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)保留历史。

### Explain Kit

安装 Explain Kit 后，调用 `$explain-kit:glossary` 或 `$explain-kit:concept`。默认中文、保留术语原文；骨架允许适应，深度模糊先速解，不抢占调试或审查主任务。范围见 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md)，实际证据见 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。

### HTML Guide Kit

开发候选安装后显式调用 `$html-guide-kit:guide` 并提供文档或明确对话快照。先获得 2–3 套读者、任务和理解问题选项；明确选择或修改确认后才编排。输出为聊天指南文本，篇幅按材料调整。技能能力 Read，不制作 HTML、代码或文件，不提供具体制作工具操作说明；只新建指南，既有指南修订、方案比较和 HTML 审查另属范围。使用方法见 [指南](docs/guide/[GUIDE]_HTML_Guide_Kit.md)。

上面的main/v8.2.0安装范围为Diagram、Learning Evidence、Explain三插件。验证 HTML Guide 开发候选时，对准备好的独立候选目录运行 `codex plugin marketplace add <候选目录>`，再安装 `html-guide-kit@mj-agentlab-marketplace`；合入 develop 后可以显式选择 --ref develop。开发安装与正式发布分别记录。

### ChatGPT desktop

在 repo marketplace 中核对实际分支/标签及插件版本。已发布v8.2.0与Communication/HTML开发候选集合不同；候选桌面端安装、发现和实际调用单独登记。代理执行可用自动化；能力限制和延期入口据实记录，不要求 owner 例行手工操作，CLI 发现不替代桌面或窗口证据。

### Learning Evidence Kit

包内提供 `$learning-evidence-kit:pop-quiz` 与 `$learning-evidence-kit:learning-record-check`，均显式启动。前者只读诊断并输出完整可移交记录；明确移交保存后结束诊断，由共用能力保存、关联并返回回执。后者先检查指定记录有效性，再根据本人解释和既有验证材料检查任务应用，两个结论分开。保存不自动发布，材料补齐不自动核验。见 [使用指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)、[迁移 ADR](docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)和[验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。

Codex 优先在 Side Chat 提供任务片段、职责与可定位的源码、规格或测试记录；ChatGPT 桌面端及普通会话采用明确的上下文快照。快照不会自动同步主会话后续变化。缺少职责时先提出暂定职责并等待确认；不会据此推断个人能力。

默认检查 1 个 KU，第二个 KU 需要明确继续；每轮最多 2 个 KU、5 道题。所有启用提问入口严格待答；未提交、默认项、超时或关闭不算回答。原生窗口提交前持续显示须单独验收，文字重述不算窗口通过；无法满足的入口延期，PR5 按实际证据列可启用入口。两个公开接口继续保留；核心交付、全部 Epic 完成和 Owner 最终接受分开记录。

完整原件默认保存于系统用户数据目录；worktree 清单只含引用且本地 Git 排除。共用能力提供恢复、完整导入导出、保留归档、授权普通 PR 评论共享及手动历史增量采集。更正/重测追加，跨 PR 复用不重复计为学习。技术运行不证明真实学习收益、长期保持或管理判断效果。

### Communication Kit

Communication尚未进入main/v8.2.0。在隔离候选安装中显式调用 `$communication-kit:communicate`，处理沟通、文档编写与保义改写，保留事实、立场、条件、例外、责任和真实承诺。关键缺口先问并等待，默认聊天交付成稿＋关键提示，明确要求后才保存或编辑 Markdown/TXT 并回读。见[候选包说明](plugins/communication-kit/README.md)与[公开技能](plugins/communication-kit/skills/communicate/SKILL.md)。

包内原创 AICS 摘要冻结为 Lab Proposal / Informative，研究路径只供来源追溯，运行无需访问研究目录。实际CLI行为15项PASS、3项PARTIAL；另有工具角色三项限定功能PASS，身份和覆盖分开记录。同应用两入口的限定实际交互与未覆盖项按验收账本分别记录，完整验收与合并门禁仍须核对；本轮延期现实场景效果、九例个人试用、三稿对照、读者反馈、采用度和效率评价。基础功能通过不代表现实效果已验证。

### Upgrade and retirement

停止 Claude 支持，learn-kit 及 NotebookLM 集成退役；Learning Evidence Kit 直接替换候选 Understanding 注册，不恢复旧 NLM 运行链。已安装旧包不会因索引删除而自动卸载；确认来源和所需数据后按 [升级与卸载步骤](docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)处理。旧文档正文、版本、Git 来源、CHANGELOG、ADR 和公开资产保留，新结果不追认历史验收。

### Development

Learning的[8.2.0 Release](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.2.0)已于2026-10-13发布，实际main merge为ebc4bdc3。Communication PR4以实际8.2.0基线先DryRun零写入再准备8.3.0 VERSION/badge，其阶段五包根版本均保持；本次完整五包范围及发布门禁见[8.3.0账本](docs/runbook/[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)。Diagram0.3.1、Learning Evidence0.1.0、Explain0.1.1已公开；当前HTML0.1.36修正候选与Communication0.1.0仅属开发候选。共用Learning脚本归属安装包，不依赖仓库过渡路径。

20 个开发技能位于 .agents/skills，候选公开技能为 arch-diagram、pop-quiz、learning-record-check、glossary、concept、guide 和 communicate。pop-quiz、learning-record-check、guide 与 communicate 为显式入口；全量普通发现预期为三个技能，原生清单为七个；Communication 独装普通发现为零、原生清单为一个。十三组合安装、包内资源字节核对、实际 Python 回归与无 MCP 检查的执行结果单独记录。

[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222) 管理 Communication PR1–PR5。Owner 已选择 Learning 先发布 8.2.0，Communication 随后独立 minor（预计 8.3.0）；PR4已核查基线并准备8.2.0→8.3.0；阶段合并与正式发行仍待实际门禁。项目指令见 [AGENTS.md](AGENTS.md)，规范和历史见 [文档索引](docs/INDEX.md)，贡献见 [CONTRIBUTING.md](CONTRIBUTING.md)。代理运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 和 npm run smoke:codex。正式发布需要授权、当前发布提交独立批准、required checks 及按 Owner 本轮决定适用的验收边界；既有客户端实证、HTML 已知失败与未覆盖项分项记录，不补写通过。

仓库主标与 D 插件图标遵循 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md)。新插件或图标修改可调用 `$mp-design-icon`，先展示候选再接入；当前批准与实际验收见 [记录](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。

### 本次发布的验收边界

Owner 于 2026-10-15 明确要求将 develop 整体发布为 Marketplace 8.3.0，并选择按当前实现发布 HTML 0.1.36：保留 #239 的已知自检前提缺陷和未覆盖项，只执行发布必需的 CI、安装与 Python 检查，不重启模型或桌面验收，也不继续功能修正。此决定取代此前 Communication 四包发行、HTML 另发的范围；旧失败不改写为 PASS。

HTML 已知问题是独立自检题缺少必要当前状态仍给出确定结论，见 [#239](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/239)。本版完整双客户端与扩展行为未完成，现实效果 NOT_MEASURED；既有安装和工程通过不证明这些项目通过。Communication 既有 CLI PARTIAL、限定本机客户端结果及其他插件延期项保留原身份。

本轮执行必要工程检查、十三组合准确安装和实际缓存 Python；公开后从真实 tag 再做十三组合复查。完成后停止，暂不回同步、预升、关闭 Issue、归档或推进延期跟踪。
