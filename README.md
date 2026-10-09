# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-8.0.1-blue)

支持 ChatGPT 桌面端与 Codex 本地环境（CLI 验收基线 0.147.0）的插件市场。**diagram-kit** 的 **arch-diagram** 从源码事实生成七类 Mermaid 架构/UML 图，并使用 Python 校验器验证；新增候选 **explain-kit 0.1.0** 提供 **glossary** 术语速解和 **concept** 深讲。两个插件均无需 MCP 服务。Explain Kit 的边界及实际证据见 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md) 和 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。

### Codex

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref main
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

上面的 main 指向正式分发分支；固定版本可将 --ref main 换为 --ref v8.0.0。调用 $diagram-kit:arch-diagram 或请求“给这个仓库画架构图”。开发分支的版本 badge 表示预计下一版本，已发布版本以 [GitHub Releases](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases) 为准。

Explain Kit 尚未进入 main/v8.0.0。代理验收时将独立 worktree 作为本地 marketplace source，安装 explain-kit，再调用 `$explain-kit:glossary` 或 `$explain-kit:concept`。明确快速解释用 glossary，机制、反例和边界用 concept；深度模糊先速解，遵从用户的受众、长度、语言和格式要求。

### ChatGPT desktop

repo marketplace 可提供 Diagram Kit / Architecture Diagram，以及候选 Explain Kit / Glossary / Concept。实际桌面端市场、安装、composer 发现及调用须单独验收，不能以 CLI 发现替代；代理执行可用自动化，能力限制据实记录。

### Upgrade and retirement

停止 Claude 支持，learn-kit 及 NotebookLM 集成退役；已安装旧版不会因市场删除而自动卸载。请参阅 [升级与卸载步骤](docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。旧版本、CHANGELOG、ADR 和已发布资产继续保留。[Marketplace v8.0.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.0.0) / diagram-kit 0.3.0 已正式发布；桌面端实际验收仍未执行，发布事实及后续步骤见 [发布记录](docs/runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)。

### Development

19 个开发技能位于 .agents/skills，公开技能为 arch-diagram、glossary、concept。项目指令见 [AGENTS.md](AGENTS.md)，规范和历史见 [文档索引](docs/INDEX.md)，贡献见 [CONTRIBUTING.md](CONTRIBUTING.md)。代理运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 和 npm run smoke:codex；隔离安装分别覆盖两个单插件和组合场景。
