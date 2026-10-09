# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-8.0.1-blue)

面向 ChatGPT 桌面端与 Codex 本地环境（CLI 验收基线 0.147.0）的插件市场。当前开发版本提供两个 portable 插件，无需 MCP 服务：

| 插件 / 公开技能 | 用途 | 版本与分发状态 |
| --- | --- | --- |
| **diagram-kit / arch-diagram** | 从源码事实生成七类 Mermaid 架构/UML 图，节点与边追溯到文件行号，实际运行 Python 校验器 | 0.3.0，已随市场 v8.0.0 发布 |
| **understanding-kit / pop-quiz** | 从当前职责和关键判断选取必要知识，进行 2+1 自适应理解测验并给出简要反馈 | 初始 0.1.0 已合入 develop；0.1.1 为后续验收修正候选，尚未正式发布 |

市场 VERSION 保持 8.0.1 的 develop pre-bump；当前新增插件不能从已发布 main / v8.0.0 获取。

### Codex

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref main
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

上面的 main 指向正式分发分支；固定版本可将 --ref main 换为 --ref v8.0.0。调用 $diagram-kit:arch-diagram 或请求“给这个仓库画架构图”。开发分支的版本 badge 表示预计下一版本，已发布版本以 [GitHub Releases](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases) 为准。

### ChatGPT desktop

在 repo marketplace 中选择 MJ AgentLab Marketplace，安装 Diagram Kit，在新聊天选择 Architecture Diagram 并提供可访问的目标源码。实际桌面端安装与调用必须单独验收，不能以 CLI 发现替代。

### Pop Quiz 开发试用

验收当前 worktree 的本地 marketplace 后，可安装 Understanding Kit 并显式调用 `$understanding-kit:pop-quiz`。正式安装示例中的 main 仍只提供 Diagram Kit；新插件的本地安装及验收步骤见 [Pop Quiz 使用指南](docs/guide/[GUIDE]_Understanding_Pop_Quiz.md) 和 [验收记录](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)。

Codex 优先在 Side Chat 提供任务片段、职责与可定位的源码、规格或测试记录；ChatGPT 桌面端及普通会话采用明确的上下文快照。快照不会自动同步主会话后续变化。缺少职责时先提出暂定职责并等待确认；不会据此推断个人能力。

默认检查 1 个 KU，第二个 KU 需要明确继续；每轮最多 2 个 KU、5 道题。问题弹窗由客户端控制，技能无法锁定窗口；未答不推进，窗口失效时保留同一道题等待答复。反馈提供局部理解证据，不代替工程验收或长期能力评价。

### Upgrade and retirement

停止 Claude 支持，learn-kit 及 NotebookLM 集成退役；Understanding Kit 是独立的新插件，未恢复旧学习技能或 NLM 运行链。已安装旧版不会因市场删除而自动卸载。请参阅 [升级与卸载步骤](docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。旧版本、CHANGELOG、ADR 和已发布资产继续保留。[Marketplace v8.0.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.0.0) / diagram-kit 0.3.0 已正式发布；其桌面端实际验收仍未执行，发布事实及后续步骤见 [发布记录](docs/runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)。新增插件的结果独立记录，不追认旧发布验收。

### Development

19 个开发技能位于 .agents/skills，公开技能为 arch-diagram 与 pop-quiz。项目指令见 [AGENTS.md](AGENTS.md)，规范和历史见 [文档索引](docs/INDEX.md)，贡献见 [CONTRIBUTING.md](CONTRIBUTING.md)。运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 和 npm run smoke:codex。新增插件仅准备 develop PR；正式发布需要独立授权与两个目标客户端的验收证据。
