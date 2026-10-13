# MJ AgentLab Marketplace

<img src="assets/brand/marketplace/logo.svg" width="128" height="128" alt="MJ AgentLab Marketplace — MJ letters with connected modules">

![Version](https://img.shields.io/badge/version-8.1.2-blue)

面向 ChatGPT 桌面端与 Codex 本地环境（CLI 验收基线 0.147.0）的插件市场。当前开发候选保持 marketplace 8.1.2，注册四个 portable 插件、六个公开技能，无需 MCP 服务。Owner 已确认公开 8.2.0 保持 Diagram、Learning Evidence、Explain 三插件/五技能；develop 保留 HTML，另行发行：

| 插件 / 公开技能 | 用途 | 版本与分发状态 |
| --- | --- | --- |
| **diagram-kit / arch-diagram** | 从源码事实生成七类 Mermaid 架构/UML 图，节点与边追溯到文件行号，实际运行 Python 校验器 | 0.3.1，已随市场 v8.1.1 发布 |
| **explain-kit / glossary、concept** | 陌生术语速解与机制、反例、边界深讲，遵从受众、语言和长度要求 | 0.1.1，已随市场 v8.1.1 发布 |
| **learning-evidence-kit / pop-quiz、learning-record-check** | 显式诊断并移交完整记录，保留本机原件；分开核验指定记录有效性与任务应用，按授权共享 | 0.1.0 候选，尚未发布 |
| **html-guide-kit / guide** | 确认读者、任务和理解问题后，新建可复制的交互教材绘制指南文本 | 0.1.6，develop 修正候选，未正式发布 |

[Marketplace v8.1.1](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.1.1) 于 2026-10-10 随 #205 合入 main 自动发布，仍包含 Understanding Kit 0.1.2 / pop-quiz，采用 A 仓库主标和 D 插件图标。该次发布后的四种隔离安装、图标内容比较与实际 Python 校验通过；Owner 截图、两端完整客户端记录缺项及未提供的 GitHub 独立批准见 [8.1.1 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。这些历史结果不证明新候选的客户端或窗口通过。

### Codex

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref v8.1.1
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin add understanding-kit@mj-agentlab-marketplace
codex plugin add explain-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

上面固定已发布的旧集合，不包含 Learning Evidence Kit。三个插件可按需独立安装；调用 `$diagram-kit:arch-diagram` 或请求“给这个仓库画架构图”。新包的隔离候选验收使用待测 branch 或精确 SHA：

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref codex/learning-evidence-switch
codex plugin add learning-evidence-kit@mj-agentlab-marketplace
codex plugin list --json
~~~

该 branch 只表示候选来源，实际运行必须核对来源和版本，并记录待测 SHA。开发 badge 保持 8.1.2；已发布身份以 [GitHub Releases](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases) 为准。

### Explain Kit

安装 Explain Kit 后，调用 `$explain-kit:glossary` 或 `$explain-kit:concept`。默认中文、保留术语原文；骨架允许适应，深度模糊先速解，不抢占调试或审查主任务。范围见 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md)，实际证据见 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。

### HTML Guide Kit

开发候选安装后显式调用 `$html-guide-kit:guide` 并提供文档或明确对话快照。先获得 2–3 套读者、任务和理解问题选项；明确选择或修改确认后才编排。输出为聊天指南文本，篇幅按材料调整。技能能力 Read，不制作 HTML、代码或文件，不提供具体制作工具操作说明；只新建指南，既有指南修订、方案比较和 HTML 审查另属范围。使用方法见 [指南](docs/guide/[GUIDE]_HTML_Guide_Kit.md)。

上面的 main / v8.1.1 安装范围仍为已发布三插件。验证 HTML Guide 开发候选时，对准备好的独立候选目录运行 `codex plugin marketplace add <候选目录>`，再安装 `html-guide-kit@mj-agentlab-marketplace`；合入 develop 后可以显式选择 --ref develop。开发安装与正式发布分别记录。

### ChatGPT desktop

在 repo marketplace 中核对实际分支/标签及插件版本。已发布 v8.1.1 与新候选集合不同；候选桌面端安装、发现和实际调用单独登记。代理执行可用自动化；能力限制和延期入口据实记录，不要求 owner 例行手工操作，CLI 发现不替代桌面或窗口证据。

### Learning Evidence Kit

候选包提供 `$learning-evidence-kit:pop-quiz` 与 `$learning-evidence-kit:learning-record-check`，均显式启动。前者只读诊断并输出完整可移交记录；明确移交保存后结束诊断，由共用能力保存、关联并返回回执。后者先检查指定记录有效性，再根据本人解释和既有验证材料检查任务应用，两个结论分开。保存不自动发布，材料补齐不自动核验。见 [使用指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)、[迁移 ADR](docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md)和[验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。

Codex 优先在 Side Chat 提供任务片段、职责与可定位的源码、规格或测试记录；ChatGPT 桌面端及普通会话采用明确的上下文快照。快照不会自动同步主会话后续变化。缺少职责时先提出暂定职责并等待确认；不会据此推断个人能力。

默认检查 1 个 KU，第二个 KU 需要明确继续；每轮最多 2 个 KU、5 道题。所有启用提问入口严格待答；未提交、默认项、超时或关闭不算回答。原生窗口提交前持续显示须单独验收，文字重述不算窗口通过；无法满足的入口延期，PR5 按实际证据列可启用入口。两个公开接口继续保留；核心交付、全部 Epic 完成和 Owner 最终接受分开记录。

完整原件默认保存于系统用户数据目录；worktree 清单只含引用且本地 Git 排除。共用能力提供恢复、完整导入导出、保留归档、授权普通 PR 评论共享及手动历史增量采集。更正/重测追加，跨 PR 复用不重复计为学习。技术运行不证明真实学习收益、长期保持或管理判断效果。

### Upgrade and retirement

停止 Claude 支持，learn-kit 及 NotebookLM 集成退役；Learning Evidence Kit 直接替换候选 Understanding 注册，不恢复旧 NLM 运行链。已安装旧包不会因索引删除而自动卸载；确认来源和所需数据后按 [升级与卸载步骤](docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)处理。旧文档正文、版本、Git 来源、CHANGELOG、ADR 和公开资产保留，新结果不追认历史验收。

### Development

Epic #209 的 PR4 原子切换候选包：Learning Evidence 0.1.0，Diagram 0.3.1 / Explain 0.1.1 保持；当前 VERSION / badge 仍为未发布 8.1.2，PR5 才准备 8.2.0。共用脚本已归属新插件，安装运行不能依赖仓库或 worktree 过渡路径。品牌图标复用既有批准；候选尚未正式分发。

20 个开发技能位于 .agents/skills，公开技能为 arch-diagram、pop-quiz、learning-record-check、glossary、concept 和 guide。项目指令见 [AGENTS.md](AGENTS.md)，规范和历史见 [文档索引](docs/INDEX.md)，贡献见 [CONTRIBUTING.md](CONTRIBUTING.md)。代理运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 和 npm run smoke:codex；真实 Python 必须执行。Owner 已提供本 Epic 条件发布授权并接受分段边界；正式发布仍需合格入口的实际证据、当前提交非作者批准、required checks 和已解决审查线程。延期入口、整个 Epic 及最终接受独立追踪。

仓库主标与 D 插件图标遵循 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md)。新插件或图标修改可调用 `$mp-design-icon`，先展示候选再接入；当前批准与实际验收见 [记录](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。
