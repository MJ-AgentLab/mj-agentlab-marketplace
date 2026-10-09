# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-7.0.2-blue)

仅支持 ChatGPT 桌面端与 Codex 本地环境（CLI 验收基线 0.147.0）的架构图插件市场。市场只提供 **diagram-kit**，公开技能只有 **arch-diagram**：从源码事实生成七类 Mermaid 架构/UML 图，每个节点与边可追溯到文件行号，并使用 Python 校验器验证。无需 MCP 服务。

### Codex

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref main
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

上面的 main 指向正式分发分支；未发布的迁移请在隔离环境用当前 worktree 的绝对路径安装（npm run smoke:codex）。调用 $diagram-kit:arch-diagram 或请求“给这个仓库画架构图”。

### ChatGPT desktop

在 repo marketplace 中选择 MJ AgentLab Marketplace，安装 Diagram Kit，在新聊天选择 Architecture Diagram 并提供可访问的目标源码。实际桌面端安装与调用必须单独验收，不能以 CLI 发现替代。

### Upgrade and retirement

停止 Claude 支持，learn-kit 及 NotebookLM 集成退役；已安装旧版不会因市场删除而自动卸载。请参阅 [升级与卸载步骤](docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。旧版本、CHANGELOG、ADR 和已发布资产继续保留。计划版本为 8.0.0 / 0.3.0，完整验收前保持当前版本并记录 Unreleased。

### Development

19 个开发技能位于 .agents/skills，公开插件仅包含 arch-diagram。项目指令见 [AGENTS.md](AGENTS.md)，规范和历史见 [文档索引](docs/INDEX.md)，贡献见 [CONTRIBUTING.md](CONTRIBUTING.md)。运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 和 npm run smoke:codex。
