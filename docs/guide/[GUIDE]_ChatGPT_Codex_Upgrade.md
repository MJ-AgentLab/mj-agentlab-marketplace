---
type: guide
scope: marketplace
summary: "Upgrade, retirement and uninstall steps for existing users"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-13
state: active
version: v1.9
---

# [GUIDE] ChatGPT / Codex upgrade

仅 ChatGPT 桌面端和 Codex 本地继续支持；停止 Claude 支持。[Marketplace v8.1.1](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.1.1) 已发布，包含 diagram-kit 0.3.1、understanding-kit 0.1.2、explain-kit 0.1.1，三个插件、四个公开技能。main / v8.1.1 可获取这三个已发布插件，历史 v8.0.0 仅包含 Diagram Kit。Communication 0.1.0 是 PR3 原子集成的未发布候选；当前开发市场仍8.1.2，增加候选包不改变正式分发来源。发布后安装复查、Owner 截图和完整客户端证据缺项见 [8.1.1 发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。开发技能位于 .agents/skills，根项目入口为 AGENTS.md。

## Existing learn-kit users

市场删除条目不会自动卸载已安装缓存。Codex 用户在自己的已安装列表中确认准确的 learn-kit@mj-agentlab-marketplace 身份后卸载，ChatGPT 桌面端在 Plugins Directory 的 Installed 中卸载 Learn Kit。独立 NLM bridge 使用旧已安装包中的 install-nlm-bridge.mjs uninstall 移除；当前新仓库不再提供该安装器，必要时从 [v7.0.1 原安装器](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/v7.0.1/plugins/learn-kit/scripts/install-nlm-bridge.mjs) 使用对应历史版本。保留自己的学习产物、NotebookLM notebooks 和所需用户数据；插件退役不删除这些内容。

## Codex CLI 0.147.0

通过 Git 固定当前已发布 v8.1.1 的旧集合，再按需独立安装插件；新候选来源在下一节单独指定：

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref v8.1.1
codex plugin marketplace upgrade mj-agentlab-marketplace
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

当前已发布 v8.1.1 的索引还包含 Understanding Kit 与 Explain Kit。历史 Understanding 安装与 `$understanding-kit:pop-quiz` 见 [归档指南](../archive/[DEPRECATED]_[GUIDE]_Understanding_Pop_Quiz_v1.3.md)；使用 `codex plugin add explain-kit@mj-agentlab-marketplace` 单独安装，调用 `$explain-kit:glossary` 或 `$explain-kit:concept`。Learning Evidence Kit 尚未发布，不能从 v8.1.1 安装。

## Learning Evidence candidate migration

新候选直接替换 understanding-kit 注册，保持 Diagram 0.3.1 / Explain 0.1.1；marketplace 暂为 8.1.2，Learning Evidence 0.1.0，8.2.0 在 PR5 准备。代理隔离验收使用待测 branch 或固定 SHA，不改变个人插件来源。个人试用先核对现有来源、包身份和必要原件，再选择新候选；已安装 Understanding 缓存不会自动卸载。

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref codex/learning-evidence-switch
codex plugin add learning-evidence-kit@mj-agentlab-marketplace
codex plugin list --json
~~~

此 branch 是开发来源，实际验收记录待测 SHA；本地 worktree source 仅供隔离测试。正式新包标签尚未创建。确认要移除旧包时使用 `codex plugin remove understanding-kit@mj-agentlab-marketplace`；移除缓存不授权删除学习资料。新包采用 `$learning-evidence-kit:pop-quiz` 和 `$learning-evidence-kit:learning-record-check`，旧限定名不再属于候选注册。

安装本身不启用尚未验收的提问入口。所有启用入口严格待答，原生窗口提交前持续显示单独核验；默认、超时、关闭和文字重述均不能冒充答案或窗口通过。不合格入口延期，双技能接口保留。行为、保存移交与两阶段核验见 [新指南](./[GUIDE]_Learning_Evidence_Kit.md)，具体入口结果见 [账本](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。

Communication 仅从隔离候选来源验证，不从 main / v8.1.1 安装。候选来源安装后以 `$communication-kit:communicate` 显式调用，使用[包说明](../../plugins/communication-kit/README.md)和[技能](../../plugins/communication-kit/skills/communicate/SKILL.md)。独装预期普通发现0、原生1；五插件全量普通3、原生7，pop-quiz、learning-record-check、guide 与 communicate 均显式调用。安装包只依赖冻结参考资源，研究路径不是运行前提。候选实际功能与客户端可用性按实际结果分别登记，按[验收记录](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)独立登记。

## ChatGPT desktop

将准确已发布标签或待测 SHA 的 .agents/plugins/marketplace.json 作为 repo marketplace，刷新后核对实际来源和版本。v8.1.1 显示旧 Diagram/Understanding/Explain 集合；新候选定义 Diagram/Learning Evidence/Explain。桌面安装、composer 发现、实际调用和原生窗口条件独立验收；本指南没有提供通过证据。能力不可达或窗口不合格的入口明确延期，不要求 Owner 例行人工操作。旧包在准确核对身份后独立卸载。

Communication 候选另查“沟通助手”详情图标与版本、显式入口、沟通/编写/改写、关键澄清等待、聊天交付和明确请求才写文件。Owner 选定的 D“地球＋清晰文字”是原创 MJ 图标；资源校验、旧截图或 CLI 元数据不能替代此次实际显示与交互。现实效果测试本轮延期，基础客户端通过不证明收益。

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
