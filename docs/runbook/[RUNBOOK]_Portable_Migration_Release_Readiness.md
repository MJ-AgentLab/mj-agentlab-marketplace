---
type: runbook
scope: marketplace
summary: "Portable 迁移合并后的验收门禁、版本准备顺序与发布说明草稿"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: draft
version: v1.1
related:
  - "./[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md"
  - "./[RUNBOOK]_Release_Operations.md"
  - "../guide/[GUIDE]_ChatGPT_Codex_Upgrade.md"
  - "../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md"
---

# 合并后发布准备

治理 #186 / #187 与迁移 #188 均已合并。develop 的迁移 merge SHA 为 cea7744b90694ff71b0ed846a87bc292c6633279。owner 随后回复“更新即可”，授权在 #189 中先完成 Marketplace 8.0.0 / diagram-kit 0.3.0 的版本与发布说明准备。当前 worktree 权威版本已更新，正式 CHANGELOG 已编写；尚无 v8.0.0 标签或本次正式发布。桌面端验收仍未执行。

## 当前完成条件

| 条件 | 状态与证据 |
|---|---|
| 两个目标分支治理门禁 | 完成：develop 17252dc / main 473f606，检查器均以 AGENTS.md 为同步目标 |
| 迁移与过渡清理 | 完成：#188 已合并，旧入口、临时校验参数和允许分支已移除 |
| 合并提交的验证 | 完成：198 项强制 PowerShell/Python 测试、严格结构及精确 Git tree 的 Codex CLI 0.147.0 安装/发现复验通过 |
| CLI 模型行为 | 已记录：arch-diagram 生成、证据与 Python 校验；19 技能只读触发回放。未声称完整外部副作用链均执行 |
| ChatGPT 桌面端安装及调用 | 待完成：须有客户端版本、准确的市场/插件来源、安装与发现结果、生成图证据和实际校验摘要 |
| 版本应用与正式 CHANGELOG | 已准备于 #189：两个版本 dry-run 后应用，VERSION / manifest / README badge、CHANGELOG 和发布说明已同步 |
| 版本准备提交的本地复验 | 完成：严格结构、198 项强制 PowerShell/Python 测试、版本基线与目标 develop 检查器 A6 均通过；1608470 的 CLI 0.147.0 canonical 安装确认缓存版本为 0.3.0，仓库内外技能数量为 1/19 与 1/0 |
| 正式发布 PR | 待完整验收及 #189 合入 develop；其最新提交 checks、独立批准及发布授权须满足 |
| 历史版本和资产 | 保留：合并后复查 v7.0.0 / v7.0.1 原 wheel 与 checksum 均存在 |

## 桌面端验收记录要求

验收须绑定当前 portable 实现。上述 develop 提交可复现迁移实现；若声称验收 8.0.0 / 0.3.0，则须绑定 #189 的具体提交或其后续 merge SHA。目前 main 仍为旧产品内容。通过 [升级指南](../guide/[GUIDE]_ChatGPT_Codex_Upgrade.md) 安装待测市场，并使用 [合成源码](../../tests/fixtures/arch-diagram/demo/server.js) 与 [进程内存储模块](../../tests/fixtures/arch-diagram/demo/store.js) 进行可复验调用。

记录客户端版本、市场来源和提交 SHA、安装后的插件/技能列表、arch-diagram 的真实调用结果、节点与边的文件行号证据、从安装资源定位的 Python 校验结果，以及需要的权限和任何失败。预期只提供 diagram-kit / arch-diagram，不安装 MCP；store.js 是进程内模块。不能以网页端结果、CLI 发现成功或已经合并来替代桌面端实际验收。owner 提供的结果应注明由 owner 执行，保留与代理实际执行证据的区别。

## 代理后续执行顺序

1. 按 owner 的后续授权在 worktree 先执行两个版本工具 dry-run，统一应用 VERSION 8.0.0 / 根 manifest 0.3.0、派生 README badge、正式 CHANGELOG 和发布说明；保留旧正文与版本记录。这一步已完成，不把版本更新视作桌面验收。
2. 完成严格校验、相关测试、Codex CLI 0.147.0 精确提交安装复查和 CI，通过版本准备 #189 进入 develop。
3. 收齐并核对桌面端结果，更新 [实际验收记录](./[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md)，将正式版本验收绑定具体提交。
4. 从完成版本准备的 develop 准备 release PR 到 main。满足完整客户端验收、独立批准、最新检查和发布授权后再合并；main 的 VERSION 变化会触发实际发布。
5. 按 [发布操作](./[RUNBOOK]_Release_Operations.md) 核对标签精确绑定、空资产 draft、安装复查、紧邻发布前查询与 published 状态。既有 v7.x 资产不覆盖、不删除。
6. 正式发布后核对版本和 Release，再准备 develop 的下一补丁 pre-bump PR 与工作树清理。

## 8.0.0 发布说明草稿

以下内容已同步到 8.0.0 CHANGELOG，供正式发布使用；记录为草稿状态表示尚未创建或发布 GitHub Release。

### 主要变化

- 支持客户端收敛为 ChatGPT 桌面端和 Codex 本地环境，Codex CLI 验收基线为 0.147.0。停止 Claude 支持。
- 市场只保留 Diagram Kit 0.3.0，公开技能只保留 Architecture Diagram（arch-diagram）。Learn Kit 及 NotebookLM 集成退役，不发布 learn-kit 新版本。
- Diagram Kit 使用根 plugin.json 和 skills/；19 个仓库开发技能迁至 .agents/skills，项目指令入口为 AGENTS.md，Codex 配置位于 .codex。
- 架构图继续要求节点和边具有可追溯的代码证据，保留资源定位及 Python 校验器。
- 通过 Git 仓库和版本标签分发，不再构建或上传 NotebookLM wheel / checksum。历史资料、旧标签及旧发布资产继续保留。

### 用户升级步骤

1. 保留个人学习产物和所需数据，明确卸载已安装的 Learn Kit；市场移除条目不会自动删除客户端缓存。独立 NLM bridge 使用对应旧版本的卸载入口处理，NotebookLM notebooks 不随插件退役删除。
2. 正式发布后刷新市场并安装 Diagram Kit；核对已安装列表只提供 arch-diagram。Codex 使用 0.147.0 的市场更新与插件安装流程，ChatGPT 桌面端使用其插件目录。
3. 仓库开发工作改用 .agents/skills 和根 AGENTS.md；原 Claude 入口和宿主专属包装不再提供。
4. 生成架构图后核对文件行号证据，并实际运行从已安装技能资源定位的 Python 校验器。完整操作与历史卸载入口见 [升级指南](../guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。

Marketplace 8.0.0 表达支持面缩减；diagram-kit 保持 0.x，本次使用 0.3.0 的规则例外见迁移 ADR。正式发布后通过新修复版本处理问题，保留已发布版本和标签。
