---
type: guide
scope: marketplace
summary: "Upgrade, retirement and uninstall steps for existing users"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-21
state: active
version: v1.11
layer: canonical
---

# [GUIDE] ChatGPT / Codex upgrade

仅ChatGPT桌面端和Codex本地继续支持；停止Claude支持。[Marketplace v8.2.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.2.0)已公开Diagram0.3.1、Learning Evidence0.1.0、Explain0.1.1三包五技能，实际身份见[8.2.0账本](../runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)。历史v8.1.1仍含Understanding，旧[8.1.1记录](../runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)及未覆盖项保持。Communication0.1.0与HTML0.1.0仅属开发候选，当前VERSION沿用8.2.0基线；开发技能位于.agents/skills，根入口为AGENTS.md。

## Existing learn-kit users

市场删除条目不会自动卸载已安装缓存。Codex 用户在自己的已安装列表中确认准确的 learn-kit@mj-agentlab-marketplace 身份后卸载，ChatGPT 桌面端在 Plugins Directory 的 Installed 中卸载 Learn Kit。独立 NLM bridge 使用旧已安装包中的 install-nlm-bridge.mjs uninstall 移除；当前新仓库不再提供该安装器，必要时从 [v7.0.1 原安装器](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/v7.0.1/plugins/learn-kit/scripts/install-nlm-bridge.mjs) 使用对应历史版本。保留自己的学习产物、NotebookLM notebooks 和所需用户数据；插件退役不删除这些内容。

## Codex CLI 0.147.0

通过Git固定已发布v8.2.0，再按需独立安装插件；Communication候选来源单独指定：

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref v8.2.0
codex plugin marketplace upgrade mj-agentlab-marketplace
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

已发布v8.2.0包含Learning Evidence与Explain。使用`codex plugin add explain-kit@mj-agentlab-marketplace`后调用`$explain-kit:glossary`或`$explain-kit:concept`。旧Understanding与`$understanding-kit:pop-quiz`只在[归档指南](../archive/[DEPRECATED]_[GUIDE]_Understanding_Pop_Quiz_v1.3.md)和历史标签保留。

## Learning Evidence migration

8.2.0已原子替换Understanding注册，保持Learning Evidence0.1.0/Diagram0.3.1/Explain0.1.1。先核对现有来源、包身份和必要原件，再刷新已发布来源并安装Learning；已安装Understanding缓存不会自动卸载。入口资格、延期及实际发布身份见[8.2.0账本](../runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)。

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref v8.2.0
codex plugin add learning-evidence-kit@mj-agentlab-marketplace
codex plugin list --json
~~~

正式标签v8.2.0已创建；工作树及其他待测SHA仅用于隔离测试。确认要移除旧包时使用`codex plugin remove understanding-kit@mj-agentlab-marketplace`，移除缓存不授权删除学习资料。新包采用`$learning-evidence-kit:pop-quiz`和`$learning-evidence-kit:learning-record-check`，旧限定名退出当前注册。

安装本身不启用尚未验收的提问入口。所有启用入口严格待答，原生窗口提交前持续显示单独核验；默认、超时、关闭和文字重述均不能冒充答案或窗口通过。不合格入口延期，双技能接口保留。行为、保存移交与两阶段核验见 [新指南](./[GUIDE]_Learning_Evidence_Kit.md)，具体入口结果见 [账本](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。

Communication 仅从隔离候选来源验证，不从 main / v8.2.0 安装。候选来源安装后以 `$communication-kit:communicate` 显式调用，使用[包说明](../../plugins/communication-kit/README.md)和[技能](../../plugins/communication-kit/skills/communicate/SKILL.md)。独装预期普通发现0、原生1；五插件全量普通3、原生7，pop-quiz、learning-record-check、guide 与 communicate 均显式调用。安装包只依赖冻结参考资源，研究路径不是运行前提。候选实际功能与客户端可用性按实际结果分别登记，按[验收记录](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)独立登记。

## ChatGPT desktop

将准确已发布标签或待测SHA的.agents/plugins/marketplace.json作为repo marketplace，刷新后核对来源与版本。v8.2.0为Diagram/Learning Evidence/Explain；开发候选另含HTML/Communication。桌面安装、composer发现、实际调用和原生窗口条件独立验收，本指南不提供通过证据；不合格入口明确延期，旧包在核对身份后独立卸载。

核验本次文案维护候选时，插件详情与技能入口应显示 **Communication Kit**，英文简介为 “Draft clear messages and documents while preserving meaning.”；内部仍用 `$communication-kit:communicate`。本批尚未发布，已安装旧版可保留旧名“沟通助手”，无内部标识迁移或自动更新声明。沿用原验收边界核对图标与版本、沟通/编写/改写、关键澄清等待、聊天交付及明确请求才写文件；新 GUI 显示须另有实证。Owner 选定的 D“地球＋清晰文字”图标保持，旧截图或 CLI 元数据不替代新客户端证据。文案维护结果见[任务 REPORT](../../plans/222-communication-kit/[REPORT]_Communication_Kit.md)，原实际结果及效果延期见[验收账本](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。

历史版本和资产继续保留；旧工作流仅通过固定标签复现。[决策与回退](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

Codex CLI 0.147.0 的卸载命令（从本机配置和插件缓存移除）：

```text
codex plugin remove learn-kit@mj-agentlab-marketplace
```

| Version | Date | Summary |
|---|---|---|
| v1.7 | 2026-10-12 | 区分正式三插件安装与 Communication 未发布候选、显式入口和证据边界 |

| Version | Date | Summary |
|---|---|---|
| v1.8 | 2026-10-13 | 同步 HTML 开发基线，保留 Communication 合同并更新五插件集合与十三组合预期 |

| Version | Date | Summary |
|---|---|---|
| v1.9 | 2026-10-13 | 同步 Learning 原子替代与 Communication 完整集成，按当前集合验收，发行范围另核对 |
| v1.10 | 2026-10-13 | 同步已公开Learning8.2.0基线，保留Communication开发五包与正式四包范围及历史限制 |
