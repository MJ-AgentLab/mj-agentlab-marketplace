---
type: runbook
scope: marketplace
summary: "ChatGPT/Codex 迁移验收的实际结果、限制和待完成门禁"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.0
last-verified: 2026-10-09
---

# 迁移验收记录

验收日期：2026-10-09。环境：Windows、本地 Codex CLI 0.147.0、Node.js 22.18.0、PowerShell 7、Python。实现位于隔离工作树；正式发布尚未推进，权威版本保持 marketplace 7.0.2 / diagram-kit 0.2.0。

| 验收项 | 实际结果 | 证据 / 范围 |
|---|---|---|
| portable manifest 与市场 | PASS（治理过渡模式） | npm run validate -- --allow-governance-transition：单 diagram-kit、单 arch-diagram、根 manifest、无 MCP、19 技能 YAML 与描述；默认正式校验拒绝根过渡说明 |
| 隔离 CLI 安装 | PASS | Codex CLI 0.147.0 使用临时 HOME / USERPROFILE / CODEX_HOME，添加本地市场并真实安装 diagram-kit |
| 插件公开技能作用域 | PASS | consumer cwd 发现一个 qualified arch-diagram；资源来自隔离安装缓存，不是工作区 |
| 19 个仓库开发技能作用域 | PASS | 仓库 cwd 发现全部 19 个不同 mp-* 技能，路径为 .agents/skills；consumer cwd 数量为 0 |
| 19 个技能实际触发回放 | PASS（只读回放） | Codex CLI 0.147.0 显式加载全部 19 个 SKILL，读取当前包/版本/AGENTS，逐项生成入口、具体下一步和决策边界；未执行回放中明确禁止的 Git 外部写入 |
| 图表 Python 校验 | PASS | 保留实际执行合同测试：非仓库 cwd，含空格、中文及单引号路径，合法/非法图的真实退出码 |
| arch-diagram CLI 实际调用 | PASS（指定权限） | Codex CLI 0.147.0 读取安装缓存中的 SKILL、methodology/domain/Container refs，分析两份源码，生成一张 Container 图；每个节点/边列文件行号。Python 3.12.14：扫描 1 张图，FAIL 0 / WARN 0 / exit 0 |
| ChatGPT 桌面安装与调用 | 未执行 | 桌面进程存在，但 Computer Use 技能的操作指南禁止自动化 ChatGPT 桌面 UI；没有声称替代验收 |
| 版本工具 dry-run | PASS | marketplace 7.0.2→8.0.0 只列 VERSION/README badge；diagram-kit 0.2.0→0.3.0 只列根 manifest。未应用 |
| 退役运行依赖 | PASS | learn-kit 和 NotebookLM 专用目录、入口、CI 及新发布资产路径删除；旧 A6 触发器与历史提交 scope 作为工程保护保留 |
| 历史资料 | PASS | 原 CHANGELOG / ADR / 指南 / 验收记录保留，来源 SHA 与 Git blob 哈希记录在 archive/history-sources.json，正文和 metadata 引用按新位置修复 |
| GitHub required checks / 独立审查 | 检查 PASS；独立批准待完成 | #188 修复提交 3264eae 的 A6、结构与 Linux/Windows baseline 均 SUCCESS；临时保留固定 CLAUDE.md 同步说明。#186/#187 检查均通过，独立批准、治理合并及 #188 过渡清理仍待完成 |
| 正式版本 / 发布 | 未执行 | 按已批准计划，两个客户端验收完成后统一 bump 8.0.0 / 0.3.0、更新 CHANGELOG / release notes，再发布 |

## 可复验入口

- npm test（CI 强制 REQUIRE_PWSH=1 / REQUIRE_PYTHON=1）
- npm run validate -- --allow-governance-transition（治理未合并时的 CI 入口；清理后恢复 npm run validate）
- npm run check:baseline-tools
- npm run smoke:codex
- 版本工具按 [版本指南](../guide/[GUIDE]_Version_Management.md) 执行 dry-run

实际模型调用的完整 JSONL 和临时安装目录留在本机验收临时目录，未提交认证数据。公开 PR 仅记录结论与必要证据；测试不替代桌面端验收。

[迁移与退役决定](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md) / [升级与卸载](../guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。

## CLI 实际调用证据

[合成源码与生成图](../../tests/fixtures/arch-diagram/container.md) / [真实校验摘要](../../tests/fixtures/arch-diagram/validator-output.txt)。输出路径含中文、空格和单引号；Python 以脚本路径和文件路径两个参数运行，缓存资源路径独立于 cwd。正确把 store.js 识别为进程内模块，没有虚构额外容器。

第一次调用使用 workspace-write，但本机 Windows 执行环境仍限制为只读，写入被拒绝。复验仅在已授权的合成临时目录中显式使用 danger-full-access，完成生成与校验；不据此声称默认 Windows sandbox 配置也已通过。临时 auth.json 只用于本机既有登录，调用后删除。

198 项测试通过，0 失败、0 跳过（强制 PowerShell/Python）；包括原 A6 55 项、防错版本事务、精确 canonical Git 工作树安装、无资产草稿发布/安装失败/相邻复查和历史哈希链接。新增测试验证：CI 仅允许固定过渡说明，额外旧指令/目录仍失败；canonical 发布安装在旧入口存在时拒绝且不调用安装器。

## 19 技能回放与远端检查

[实际回放](../../tests/fixtures/repository-skills/replay.md) 包含全部 19 个技能的源位置及当前流程判断。实际调用成功读取所有 SKILL 内容，保留无提交/无远端的隔离 fixture 限制；只读沙箱拒绝的命令明确记录，未冒充已执行合并、发布或清理。

新版 A6 以治理基线 e90d735 对迁移 head 检查通过。GitHub develop 的旧版 A6 要求 CLAUDE.md 的 A/M；删除旧入口导致 #188 失败，已用目标 base 3401e384 的原检查器本地复现（exit 1）。修复临时保留固定同步说明，CI 显式接受该说明，默认及正式发布校验仍拒绝；检查器、workflow 信任源和 required-check 名称保持原样。修复后的远端结果以 PR 最新 head 为准。#186/#187 均仍需要独立批准。迁移初版 Linux/Windows baseline 和 Validate Structure 已通过（[CI run](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37878794897)）。Windows 初次冒烟的短路径/大小写问题通过 native realpath 和作用域回归修复。

修复提交 3264eaecb1db0f61d2b67a93e432382df1b3db5b：原目标 base 检查器与新版检查器本地均 exit 0；[GitHub A6](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37880144933) 与 [PR 结构/双平台 CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37880054174) 均 SUCCESS（push CI 同样通过）。198 项本地测试、0.147.0 隔离安装和两路修复复核通过；默认严格校验对过渡文件 exit 1，与正式发布阻断要求一致。

合并顺序为 #186 → #187 → #188。两项治理合并后，代理先在 #188 删除 CLAUDE.md、CI 临时选项、校验器允许分支，并恢复严格仓库测试；重跑新版 A6、结构校验、完整测试及隔离安装后，再满足其 draft 解除与独立审查条件。当前检查通过不代替该清理，也不代替桌面端验收。

GitHub 只读查询确认 v7.0.0 / v7.0.1 的 NLM wheel 与 checksum 资产仍存在；未执行发布修改。

精确提交 eba75ff88d2d72e6e9120a234e2eab7fef74f8ce 已实际执行 release-verify-install 的完整组合验证：临时 detached Git 工作树、portable 校验、Codex CLI 0.147.0 隔离安装、仓库内外作用域均通过，安装结束后清理临时 Git 工作树。该测试只执行安装复查，不创建标签、草稿或发布。
