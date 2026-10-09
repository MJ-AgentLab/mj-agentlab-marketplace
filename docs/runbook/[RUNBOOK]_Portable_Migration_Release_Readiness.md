---
type: runbook
scope: marketplace
summary: "Portable 迁移的发布事实、安装复验与未完成验收"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.4
related:
  - "./[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md"
  - "./[RUNBOOK]_Release_Operations.md"
  - "../guide/[GUIDE]_ChatGPT_Codex_Upgrade.md"
  - "../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md"
---

# 发布准备与实际发布记录

治理 #186 / #187、迁移 #188、版本准备 #189 和发布 #190 均已合并。#190 的 main merge SHA 为 733bd3de7829bbf68d0849d93d731509d9447af8；[Marketplace v8.0.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.0.0) / diagram-kit 0.3.0 已于 2026-10-09 05:20:06 UTC（Asia/Taipei 13:20:06）自动发布。标签和 Release 均绑定该提交，无附加资产；桌面端实际验收仍未执行。

## 当前完成条件

| 条件 | 状态与证据 |
|---|---|
| 两个目标分支治理门禁 | 完成：develop 17252dc / main 473f606，检查器均以 AGENTS.md 为同步目标 |
| 迁移与过渡清理 | 完成：#188 已合并，旧入口、临时校验参数和允许分支已移除 |
| 合并提交的验证 | 完成：198 项强制 PowerShell/Python 测试、严格结构及精确 Git tree 的 Codex CLI 0.147.0 安装/发现复验通过 |
| CLI 模型行为 | 已记录：arch-diagram 生成、证据与 Python 校验；19 技能只读触发回放。未声称完整外部副作用链均执行 |
| ChatGPT 桌面端安装及调用 | 待完成：须有客户端版本、准确的市场/插件来源、安装与发现结果、生成图证据和实际校验摘要 |
| 版本应用与正式 CHANGELOG | 已发布：main VERSION 8.0.0、diagram-kit 0.3.0；公开升级基线为 7.0.1，7.0.2 是未发布的 develop pre-bump |
| 版本准备提交的本地复验 | 完成：严格结构、198 项强制 PowerShell/Python 测试、版本基线与目标 develop 检查器 A6 均通过；1608470 的 CLI 0.147.0 canonical 安装确认缓存版本为 0.3.0，仓库内外技能数量为 1/19 与 1/0 |
| main 同步与冲突处理 | 完成：88b5e6f 合入 origin/main 473f606 的治理历史，23 处冲突按迁移决定解决；结果 Git tree 与 develop 3041432 完全相同，保留执行/决策、A6 和会话维护规则 |
| 发布候选本地验证 | 完成：冲突解决后 198 项强制 PowerShell/Python 测试、严格校验、精确 88b5e6f 的 CLI 0.147.0 canonical 安装和 main 原检查器 A6 均通过 |
| 正式发布 PR / CI | [#190](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/190) 已合并；最终 head 00abbc2 的结构、Windows、Ubuntu 与 A6 均通过；[发布 workflow](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37888047611) SUCCESS |
| 发布身份与状态 | Release ID 407540658，tag v8.0.0 与 target_commitish 均为 733bd3d；draft=false、prerelease=false、assets=[]，published_at=2026-10-09T05:20:06Z |
| 发布后精确安装 | PASS：733bd3d 的 CLI 0.147.0 canonical 安装与 0.3.0 缓存资源通过，consumer 技能 1/0、repo 技能 1/19；安装缓存 Python 校验已有图 FAIL 0 / WARN 0 / exit 0，临时目录和 Git 工作树清理完成 |
| 独立批准记录 | 未见记录：#190 reviews 查询为空，合并与 AI 复核不作为独立 APPROVED review 的证据 |
| main 实际保护规则 | 发布前已查询 active rules：只允许 merge 方法，要求 1 项独立批准、最后推送批准、过期批准撤销、对话解决及最新 Validate Structure。合并事实不证明存在批准记录 |
| 平台 immutability | 未启用：Release API immutable=false，workflow 明确不声称平台不可变；保持已发布正文、标签与资产，通过新修复版本处理问题 |
| 历史版本和资产 | 保留：合并后复查 v7.0.0 / v7.0.1 原 wheel 与 checksum 均存在 |

## Develop 同步与下一补丁

发布后候选分支 codex/post-v8.0.0-develop 已包含 main 733bd3d 及相同发布记录。按既有 pre-bump 决策，代理实际执行 marketplace 8.0.0→8.0.1 的 dry-run（只命中 VERSION 与 README badge），再应用这两个目标；diagram-kit 根 manifest 保持 0.3.0，市场索引不携带版本。8.0.1 为未发布的 develop 标记，等待同步/预升 PR 合入 develop；没有创建 v8.0.1 标签或 Release。发布记录修正 PR 先合入 main，再合入本同步 PR。

候选的严格结构/技能/文档校验和 198 项强制 PowerShell/Python 测试均通过（0 失败、0 跳过）；CLI 基线实际为 0.147.0。pre-bump 检查在 enforce 模式判定 develop 8.0.1 领先 main 8.0.0，未连带变更插件 manifest 或市场索引。

## 桌面端验收记录要求

补充验收绑定实际发布标签 v8.0.0 / 733bd3de7829bbf68d0849d93d731509d9447af8；该文件树与最终 head 00abbc2 相同。通过 [升级指南](../guide/[GUIDE]_ChatGPT_Codex_Upgrade.md) 安装固定标签市场，并使用 [合成源码](../../tests/fixtures/arch-diagram/demo/server.js) 与 [进程内存储模块](../../tests/fixtures/arch-diagram/demo/store.js) 进行可复验调用。

记录客户端版本、市场来源和提交 SHA、安装后的插件/技能列表、arch-diagram 的真实调用结果、节点与边的文件行号证据、从安装资源定位的 Python 校验结果，以及需要的权限和任何失败。预期只提供 diagram-kit / arch-diagram，不安装 MCP；store.js 是进程内模块。不能以网页端结果、CLI 发现成功或已经合并来替代桌面端实际验收。owner 提供的结果应注明由 owner 执行，保留与代理实际执行证据的区别。

## 发布过程与后续

1. 按 owner 的后续授权在 worktree 先执行两个版本工具 dry-run，统一应用 VERSION 8.0.0 / 根 manifest 0.3.0、派生 README badge、正式 CHANGELOG 和发布说明；保留旧正文与版本记录。这一步已完成，不把版本更新视作桌面验收。
2. 版本准备 #189 已进入 develop；从其精确 merge SHA 建立发布工作树，同步 main 并解决治理/迁移冲突，验证结果与已批准迁移内容一致。
3. #190 先创建为草稿并完成本地验证、精确提交安装、A6 及双平台 CI。清理夹具的 ENOTEMPTY 失败已修复并复验；owner 随后告知 #190 已合并。
4. main 的 VERSION 变化已触发实际发布；没有收到桌面端结果或明确的验收豁免，#190 reviews 查询为空。继续在 [实际验收记录](./[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md) 保留缺失状态；后续补齐时绑定发布提交并注明执行方，不用发布成功追认 PASS。
5. 按 [发布操作](./[RUNBOOK]_Release_Operations.md) 已核对标签精确绑定、空资产 draft、安装复查、紧邻发布前查询及 published 状态；本地复验发布提交的 canonical 安装。既有 v7.x 资产不覆盖、不删除。
6. 通过窄范围 PR 更新 main 的发布事实，再将 main 与相同记录同步回 develop，按既有 pre-bump 决策准备 marketplace 8.0.1 / diagram-kit 0.3.0；8.0.1 仅为预计下一版本，不创建标签或 Release。已合并且无需保留的任务分支清理，仍待合并的工作树保留。

## 8.0.0 发布说明摘要

原草稿已用于 [正式发布](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.0.0)。以下保留主要变化与升级步骤；已发布 Release 正文和 CHANGELOG 8.0.0 历史节保持原样。

### 主要变化

- 支持客户端收敛为 ChatGPT 桌面端和 Codex 本地环境，Codex CLI 验收基线为 0.147.0。停止 Claude 支持。
- 市场只保留 Diagram Kit 0.3.0，公开技能只保留 Architecture Diagram（arch-diagram）。Learn Kit 及 NotebookLM 集成退役，不发布 learn-kit 新版本。
- Diagram Kit 使用根 plugin.json 和 skills/；19 个仓库开发技能迁至 .agents/skills，项目指令入口为 AGENTS.md，Codex 配置位于 .codex。
- 架构图继续要求节点和边具有可追溯的代码证据，保留资源定位及 Python 校验器。
- 通过 Git 仓库和版本标签分发，不再构建或上传 NotebookLM wheel / checksum。历史资料、旧标签及旧发布资产继续保留。

### 用户升级步骤

1. 保留个人学习产物和所需数据，明确卸载已安装的 Learn Kit；市场移除条目不会自动删除客户端缓存。独立 NLM bridge 使用对应旧版本的卸载入口处理，NotebookLM notebooks 不随插件退役删除。
2. 刷新市场并安装 Diagram Kit；核对已安装列表只提供 arch-diagram。Codex 使用 0.147.0 的市场更新与插件安装流程，ChatGPT 桌面端使用其插件目录。
3. 仓库开发工作改用 .agents/skills 和根 AGENTS.md；原 Claude 入口和宿主专属包装不再提供。
4. 生成架构图后核对文件行号证据，并实际运行从已安装技能资源定位的 Python 校验器。完整操作与历史卸载入口见 [升级指南](../guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。

Marketplace 8.0.0 表达支持面缩减；diagram-kit 保持 0.x，本次使用 0.3.0 的规则例外见迁移 ADR。正式发布后通过新修复版本处理问题，保留已发布版本和标签。
