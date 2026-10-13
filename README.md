# MJ AgentLab Marketplace

<img src="assets/brand/marketplace/logo.svg" width="128" height="128" alt="MJ AgentLab Marketplace — MJ letters with connected modules">

![Version](https://img.shields.io/badge/version-8.1.2-blue)

面向 ChatGPT 桌面端与 Codex 本地环境（CLI 验收基线 0.147.0）的插件市场，无需 MCP 服务。已发布 main / v8.1.1 提供三个 portable 插件、四个公开技能；当前 PR3 开发候选原子接入 Communication Kit，候选集合为五插件、六公开技能：

| 插件 / 公开技能 | 用途 | 版本与分发状态 |
| --- | --- | --- |
| **diagram-kit / arch-diagram** | 从源码事实生成七类 Mermaid 架构/UML 图，节点与边追溯到文件行号，实际运行 Python 校验器 | 0.3.1，已随市场 v8.1.1 发布 |
| **explain-kit / glossary、concept** | 陌生术语速解与机制、反例、边界深讲，遵从受众、语言和长度要求 | 0.1.1，已随市场 v8.1.1 发布 |
| **understanding-kit / pop-quiz** | 从当前职责和关键判断选取必要知识，进行 2+1 自适应理解测验并给出简要反馈 | 0.1.2，已随市场 v8.1.1 发布 |
| **html-guide-kit / guide** | 确认读者、任务和理解问题后，新建可复制的交互教材绘制指南文本 | 0.1.0，develop 开发候选，未正式发布 |
| **communication-kit / communicate** | 显式调用，沟通、编写与保义改写；关键缺口先问并等待，交付成稿和关键提示 | 0.1.0，PR3 开发候选，尚未发布 |

[Marketplace v8.1.1](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.1.1) 于 2026-10-10 随 #205 合入 main 自动发布，采用 A 仓库主标和 D 插件图标。发布后的四种隔离安装、图标内容比较与实际 Python 校验通过。Owner 提供的三张截图显示候选版本和详情页图标；两端完整客户端记录及 GitHub 独立批准仍未提供，具体证据见 [8.1.1 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。历史 v8.1.0 也包含三个插件，v8.0.0 仅包含 Diagram Kit。

### Codex

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref main
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin add understanding-kit@mj-agentlab-marketplace
codex plugin add explain-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

上面的 main 指向正式分发分支；固定当前版本可将 --ref main 换为 --ref v8.1.1。三个插件可按需独立安装。调用 $diagram-kit:arch-diagram 或请求“给这个仓库画架构图”。开发分支的版本 badge 表示预计下一版本，已发布版本以 [GitHub Releases](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases) 为准。

### Explain Kit

安装 Explain Kit 后，调用 `$explain-kit:glossary` 或 `$explain-kit:concept`。默认中文、保留术语原文；骨架允许适应，深度模糊先速解，不抢占调试或审查主任务。范围见 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md)，实际证据见 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。

### HTML Guide Kit

开发候选安装后显式调用 `$html-guide-kit:guide` 并提供文档或明确对话快照。先获得 2–3 套读者、任务和理解问题选项；明确选择或修改确认后才编排。输出为聊天指南文本，篇幅按材料调整。技能能力 Read，不制作 HTML、代码或文件，不提供具体制作工具操作说明；只新建指南，既有指南修订、方案比较和 HTML 审查另属范围。使用方法见 [指南](docs/guide/[GUIDE]_HTML_Guide_Kit.md)。

上面的 main / v8.1.1 安装范围仍为已发布三插件。验证尚未合并的 HTML Guide 候选时，对准备好的独立候选目录运行 `codex plugin marketplace add <候选目录>`，再安装 `html-guide-kit@mj-agentlab-marketplace`；合入 develop 后可以显式选择 --ref develop。开发安装与正式发布分别记录。

### ChatGPT desktop

在 repo marketplace 中选择 MJ AgentLab Marketplace，安装 Diagram Kit，在新聊天选择 Architecture Diagram 并提供可访问的目标源码。实际桌面端安装与调用必须单独验收，不能以 CLI 发现替代。代理执行可用自动化；能力限制据实记录，不要求 owner 例行手工操作。

### Pop Quiz

从 main / v8.1.1 安装 Understanding Kit 并显式调用 `$understanding-kit:pop-quiz`。安装及验收步骤见 [Pop Quiz 使用指南](docs/guide/[GUIDE]_Understanding_Pop_Quiz.md) 和 [验收记录](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)。

Codex 优先在 Side Chat 提供任务片段、职责与可定位的源码、规格或测试记录；ChatGPT 桌面端及普通会话采用明确的上下文快照。快照不会自动同步主会话后续变化。缺少职责时先提出暂定职责并等待确认；不会据此推断个人能力。

默认检查 1 个 KU，第二个 KU 需要明确继续；每轮最多 2 个 KU、5 道题。问题弹窗由客户端控制，技能无法锁定窗口；未答不推进，窗口失效时保留同一道题等待答复。反馈提供局部理解证据，不代替工程验收或长期能力评价。

### Communication Kit candidate

Communication 尚未进入 main / v8.1.1。在隔离候选安装中显式调用 `$communication-kit:communicate`，处理沟通、文档编写与保义改写，保留事实、立场、条件、例外、责任和真实承诺。关键缺口先问并等待，默认聊天交付成稿＋关键提示，明确要求后才保存或编辑 Markdown/TXT 并回读。见[候选包说明](plugins/communication-kit/README.md)与[公开技能](plugins/communication-kit/skills/communicate/SKILL.md)。

包内原创 AICS 摘要冻结为 Lab Proposal / Informative，研究路径只供来源追溯，运行无需访问研究目录。实际CLI行为15项PASS、3项PARTIAL；另有工具角色三项限定功能PASS，身份和覆盖分开记录。必要双客户端实际交互仍NOT RUN，完整验收尚未完成；本轮延期现实场景效果、九例个人试用、三稿对照、读者反馈、采用度和效率评价。基础功能通过不代表现实效果已验证。

### Upgrade and retirement

停止 Claude 支持，learn-kit 及 NotebookLM 集成退役；Understanding Kit 是独立的新插件，未恢复旧学习技能或 NLM 运行链。已安装旧版不会因市场删除而自动卸载。请参阅 [升级与卸载步骤](docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。旧版本、CHANGELOG、ADR 和已发布资产继续保留。[Marketplace v8.0.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.0.0) / diagram-kit 0.3.0 已正式发布；其桌面端实际验收仍未执行，发布事实及后续步骤见 [发布记录](docs/runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)。新增插件的结果独立记录，不追认旧发布验收。

### Development

8.1.1 已正式发布，包含 #203/#204 的品牌实现及 #205 的版本说明。#206 已将发布 main 同步回 develop；本分支的 8.1.2 badge 表示未发布 pre-bump，PR3 不执行市场版本转换。现有插件保持 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1，HTML Guide 0.1.0 开发基线与新增 Communication 0.1.0 候选；pre-bump 不创建同号标签或 Release。同期 main 文档 PR #207 的实际合并记录会继续同步。

20 个开发技能位于 .agents/skills，候选公开技能为 arch-diagram、pop-quiz、glossary、concept、guide 和 communicate。pop-quiz、guide 与 communicate 为显式入口；全量普通发现预期为三个技能，原生清单为六个；Communication 独装普通发现为零、原生清单为一个。十三组合安装、包内资源字节核对、实际 Python 回归与无 MCP 检查的执行结果单独记录。

[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222) 管理 Communication PR1–PR5。Owner 已选择 Learning 先发布 8.2.0，Communication 随后独立 minor（预计 8.3.0）；PR4 重查实际 From/To、基线和发布范围。项目指令见 [AGENTS.md](AGENTS.md)，规范和历史见 [文档索引](docs/INDEX.md)，贡献见 [CONTRIBUTING.md](CONTRIBUTING.md)。代理运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 和 npm run smoke:codex。正式发布需要发布授权、两个目标客户端的验收证据、当前发布提交独立批准与 required checks；本轮授权和证据分项记录。

仓库主标与 D 插件图标遵循 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md)。新插件或图标修改可调用 `$mp-design-icon`，先展示候选再接入；当前批准与实际验收见 [记录](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。
