---
type: guide
scope: marketplace
summary: "Upgrade, retirement and uninstall steps for existing users"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.1
---

# [GUIDE] ChatGPT / Codex upgrade

仅 ChatGPT 桌面端和 Codex 本地继续支持；停止 Claude 支持。[Marketplace v8.0.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.0.0) / diagram-kit 0.3.0 已正式发布；桌面端实际验收仍未执行，状态见 [发布记录](../runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)。新市场仅 diagram-kit，公开技能仅 arch-diagram，开发技能迁到 .agents/skills；根项目入口改为 AGENTS.md。

## Existing learn-kit users

市场删除条目不会自动卸载已安装缓存。Codex 用户在自己的已安装列表中确认准确的 learn-kit@mj-agentlab-marketplace 身份后卸载，ChatGPT 桌面端在 Plugins Directory 的 Installed 中卸载 Learn Kit。独立 NLM bridge 使用旧已安装包中的 install-nlm-bridge.mjs uninstall 移除；当前新仓库不再提供该安装器，必要时从 [v7.0.1 原安装器](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/v7.0.1/plugins/learn-kit/scripts/install-nlm-bridge.mjs) 使用对应历史版本。保留自己的学习产物、NotebookLM notebooks 和所需用户数据；插件退役不删除这些内容。

## Codex CLI 0.147.0

通过 Git 添加/更新市场，再安装唯一插件；固定本次发布可将 --ref main 换为 --ref v8.0.0：

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref main
codex plugin marketplace upgrade mj-agentlab-marketplace
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

本地验证可将第一步 source 替换为当前 worktree 的绝对根路径，实际隔离验收由代理运行 npm run smoke:codex。插件资源从已安装 SKILL.md locator 定位。

## ChatGPT desktop

将已发布/待测仓库的 .agents/plugins/marketplace.json 作为 repo marketplace，重启/刷新后选择 MJ AgentLab Marketplace，确认只显示 Diagram Kit 并安装。在新聊天选择 Architecture Diagram 或请求“给这个仓库画组件依赖图”，检查图源、文件行号证据和 Python 校验结果。旧 Learn Kit 须独立卸载。

历史版本和资产继续保留；旧工作流仅通过固定标签复现。[决策与回退](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

Codex CLI 0.147.0 的卸载命令（从本机配置和插件缓存移除）：

```text
codex plugin remove learn-kit@mj-agentlab-marketplace
```
