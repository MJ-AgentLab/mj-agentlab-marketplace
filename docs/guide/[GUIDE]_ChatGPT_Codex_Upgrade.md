---
type: guide
scope: marketplace
summary: "Upgrade, retirement and uninstall steps for existing users"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.4
---

# [GUIDE] ChatGPT / Codex upgrade

仅 ChatGPT 桌面端和 Codex 本地继续支持；停止 Claude 支持。[Marketplace v8.0.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.0.0) / diagram-kit 0.3.0 已正式发布；桌面端实际验收仍未执行，状态见 [发布记录](../runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)。该发布仅包含 diagram-kit / arch-diagram；understanding-kit 0.1.1 已通过 #197 合入 develop，explain-kit 为 0.1.0。当前 8.1.0 候选包含三个插件、四个公开技能，新插件尚不能从已发布 main 或 v8.0.0 获取，状态见 [8.1.0 发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。开发技能位于 .agents/skills，根项目入口为 AGENTS.md。

## Existing learn-kit users

市场删除条目不会自动卸载已安装缓存。Codex 用户在自己的已安装列表中确认准确的 learn-kit@mj-agentlab-marketplace 身份后卸载，ChatGPT 桌面端在 Plugins Directory 的 Installed 中卸载 Learn Kit。独立 NLM bridge 使用旧已安装包中的 install-nlm-bridge.mjs uninstall 移除；当前新仓库不再提供该安装器，必要时从 [v7.0.1 原安装器](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/v7.0.1/plugins/learn-kit/scripts/install-nlm-bridge.mjs) 使用对应历史版本。保留自己的学习产物、NotebookLM notebooks 和所需用户数据；插件退役不删除这些内容。

## Codex CLI 0.147.0

通过 Git 添加/更新已发布市场，再安装 Diagram Kit；固定本次发布可将 --ref main 换为 --ref v8.0.0：

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref main
codex plugin marketplace upgrade mj-agentlab-marketplace
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

本地验证可将第一步 source 替换为当前 worktree 的绝对根路径，实际隔离验收由代理运行 npm run smoke:codex。当前 worktree 的索引还包含 Understanding Kit 与 Explain Kit。使用 `codex plugin add understanding-kit@mj-agentlab-marketplace` 安装并按 [使用指南](./[GUIDE]_Understanding_Pop_Quiz.md) 显式调用 `$understanding-kit:pop-quiz`；使用 `codex plugin add explain-kit@mj-agentlab-marketplace` 单独安装，调用 `$explain-kit:glossary` 或 `$explain-kit:concept`。本地试用不表示正式发布；只有 v8.1.0 正式发布后才可使用 main 或固定 --ref v8.1.0 获取三个插件。插件资源从已安装 SKILL.md locator 定位。

## ChatGPT desktop

将已发布/待测仓库的 .agents/plugins/marketplace.json 作为 repo marketplace，重启/刷新后选择 MJ AgentLab Marketplace。当前已发布 main / v8.0.0 应只显示 Diagram Kit；8.1.0 候选 worktree 应显示 Diagram Kit、Understanding Kit 与 Explain Kit。在新聊天选择 Architecture Diagram 或请求“给这个仓库画组件依赖图”，检查图源、文件行号证据和 Python 校验结果。Understanding Kit 的快照和答题交互独立验收；Explain Kit 检查 Glossary 与 Concept 的发现、实际调用和深度路由。以上为预期验收步骤，真实桌面结果仍按记录据实填写；旧 Learn Kit 须独立卸载。

历史版本和资产继续保留；旧工作流仅通过固定标签复现。[决策与回退](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

Codex CLI 0.147.0 的卸载命令（从本机配置和插件缓存移除）：

```text
codex plugin remove learn-kit@mj-agentlab-marketplace
```
