# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-8.1.1-blue)

面向 ChatGPT 桌面端与 Codex 本地环境（CLI 验收基线 0.147.0）的插件市场。Marketplace v8.1.0 已发布，提供三个 portable 插件，无需 MCP 服务：

| 插件 / 公开技能 | 用途 | 版本与分发状态 |
| --- | --- | --- |
| **diagram-kit / arch-diagram** | 从源码事实生成七类 Mermaid 架构/UML 图，节点与边追溯到文件行号，实际运行 Python 校验器 | 0.3.0，已随市场 v8.0.0 发布 |
| **explain-kit / glossary、concept** | 陌生术语速解与机制、反例、边界深讲，遵从受众、语言和长度要求 | 0.1.0，已随市场 v8.1.0 发布 |
| **understanding-kit / pop-quiz** | 从当前职责和关键判断选取必要知识，进行 2+1 自适应理解测验并给出简要反馈 | 0.1.1，已随市场 v8.1.0 发布 |

[Marketplace v8.1.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.1.0) 于 2026-10-09 随 #198 合入 main 自动发布，发布后四种隔离安装复查通过。真实桌面交互仍未执行，GitHub 未提供独立批准记录；发布事实与这些缺口分开保留，见 [8.1.0 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。main / v8.1.0 提供三个插件，历史 v8.0.0 仅包含 Diagram Kit。

### Codex

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref main
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin add understanding-kit@mj-agentlab-marketplace
codex plugin add explain-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

上面的 main 指向正式分发分支；固定当前版本可将 --ref main 换为 --ref v8.1.0。三个插件可按需独立安装。调用 $diagram-kit:arch-diagram 或请求“给这个仓库画架构图”。开发分支的版本 badge 表示预计下一版本，已发布版本以 [GitHub Releases](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases) 为准。

### Explain Kit

安装 Explain Kit 后，调用 `$explain-kit:glossary` 或 `$explain-kit:concept`。默认中文、保留术语原文；骨架允许适应，深度模糊先速解，不抢占调试或审查主任务。范围见 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md)，实际证据见 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。

### ChatGPT desktop

在 repo marketplace 中选择 MJ AgentLab Marketplace，安装 Diagram Kit，在新聊天选择 Architecture Diagram 并提供可访问的目标源码。实际桌面端安装与调用必须单独验收，不能以 CLI 发现替代。代理执行可用自动化；能力限制据实记录，不要求 owner 例行手工操作。

### Pop Quiz

从 main / v8.1.0 安装 Understanding Kit 并显式调用 `$understanding-kit:pop-quiz`。安装及验收步骤见 [Pop Quiz 使用指南](docs/guide/[GUIDE]_Understanding_Pop_Quiz.md) 和 [验收记录](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)。

Codex 优先在 Side Chat 提供任务片段、职责与可定位的源码、规格或测试记录；ChatGPT 桌面端及普通会话采用明确的上下文快照。快照不会自动同步主会话后续变化。缺少职责时先提出暂定职责并等待确认；不会据此推断个人能力。

默认检查 1 个 KU，第二个 KU 需要明确继续；每轮最多 2 个 KU、5 道题。问题弹窗由客户端控制，技能无法锁定窗口；未答不推进，窗口失效时保留同一道题等待答复。反馈提供局部理解证据，不代替工程验收或长期能力评价。

### Upgrade and retirement

停止 Claude 支持，learn-kit 及 NotebookLM 集成退役；Understanding Kit 是独立的新插件，未恢复旧学习技能或 NLM 运行链。已安装旧版不会因市场删除而自动卸载。请参阅 [升级与卸载步骤](docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。旧版本、CHANGELOG、ADR 和已发布资产继续保留。[Marketplace v8.0.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.0.0) / diagram-kit 0.3.0 已正式发布；其桌面端实际验收仍未执行，发布事实及后续步骤见 [发布记录](docs/runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)。新增插件的结果独立记录，不追认旧发布验收。

### Development

develop 的 8.1.1 badge 是已通过 #201 合并的下一补丁 pre-bump；正式发布仍为 v8.1.0，插件版本保持 0.3.0 / 0.1.1 / 0.1.0。预升不会创建同号标签或 Release。

19 个开发技能位于 .agents/skills，公开技能为 arch-diagram、pop-quiz、glossary 和 concept。项目指令见 [AGENTS.md](AGENTS.md)，规范和历史见 [文档索引](docs/INDEX.md)，贡献见 [CONTRIBUTING.md](CONTRIBUTING.md)。代理运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 和 npm run smoke:codex。正式发布需要发布授权、两个目标客户端的验收证据、当前发布提交独立批准与 required checks；本轮授权和证据分项记录。
