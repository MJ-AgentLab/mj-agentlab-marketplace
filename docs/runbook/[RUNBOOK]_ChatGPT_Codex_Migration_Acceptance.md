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
| portable manifest 与市场 | PASS（严格模式） | npm run validate：单 diagram-kit、单 arch-diagram、根 manifest、无 MCP、19 技能 YAML 与描述；根过渡说明和校验允许分支已删除 |
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
| GitHub required checks / 独立审查 | 本地 A6 PASS；远端见 PR，独立批准待完成 | #186 合入 develop（17252dc），#187 合入 main（473f606）；两者均使用 AGENTS.md 门禁。#188 已删除过渡入口和临时校验选项；远端以 [#188 最新 head](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/188/checks) 为准 |
| 正式版本 / 发布 | 未执行 | 按已批准计划，两个客户端验收完成后统一 bump 8.0.0 / 0.3.0、更新 CHANGELOG / release notes，再发布 |

## 可复验入口

- npm test（CI 强制 REQUIRE_PWSH=1 / REQUIRE_PYTHON=1）
- npm run validate
- npm run check:baseline-tools
- npm run smoke:codex
- 版本工具按 [版本指南](../guide/[GUIDE]_Version_Management.md) 执行 dry-run

实际模型调用的完整 JSONL 和临时安装目录留在本机验收临时目录，未提交认证数据。公开 PR 仅记录结论与必要证据；测试不替代桌面端验收。

[迁移与退役决定](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md) / [升级与卸载](../guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。

## CLI 实际调用证据

[合成源码与生成图](../../tests/fixtures/arch-diagram/container.md) / [真实校验摘要](../../tests/fixtures/arch-diagram/validator-output.txt)。输出路径含中文、空格和单引号；Python 以脚本路径和文件路径两个参数运行，缓存资源路径独立于 cwd。正确把 store.js 识别为进程内模块，没有虚构额外容器。

第一次调用使用 workspace-write，但本机 Windows 执行环境仍限制为只读，写入被拒绝。复验仅在已授权的合成临时目录中显式使用 danger-full-access，完成生成与校验；不据此声称默认 Windows sandbox 配置也已通过。临时 auth.json 只用于本机既有登录，调用后删除。

过渡清理后重新执行 198 项测试，0 失败、0 跳过（强制 PowerShell/Python）；包括原 A6 55 项、防错版本事务、精确 canonical Git 工作树安装、无资产草稿发布/安装失败/相邻复查和历史哈希链接。严格校验回归逐项拒绝 CLAUDE.md、.claude 和 .claude-plugin；canonical 发布安装在旧入口存在时拒绝且不调用安装器。

## 19 技能回放与远端检查

[实际回放](../../tests/fixtures/repository-skills/replay.md) 包含全部 19 个技能的源位置及当前流程判断。实际调用成功读取所有 SKILL 内容，保留无提交/无远端的隔离 fixture 限制；只读沙箱拒绝的命令明确记录，未冒充已执行合并、发布或清理。

迁移初版曾以治理基线 e90d735 的新版 A6 检查通过。当时 develop 的旧版 A6 要求 CLAUDE.md 的 A/M，删除旧入口导致 #188 失败，已用原 base 3401e384 的检查器本地复现（exit 1）。阶段性修复保留固定同步说明，CI 显式接受该说明，默认与正式发布校验仍拒绝；检查器、workflow 信任源和 required-check 名称保持原样。迁移初版 Linux/Windows baseline 和 Validate Structure 已通过（[CI run](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37878794897)）。Windows 初次冒烟的短路径/大小写问题通过 native realpath 和作用域回归修复。

修复提交 3264eaecb1db0f61d2b67a93e432382df1b3db5b：原目标 base 检查器与新版检查器本地均 exit 0；[GitHub A6](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37880144933) 与 [PR 结构/双平台 CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37880054174) 均 SUCCESS（push CI 同样通过）。198 项本地测试、0.147.0 隔离安装和两路修复复核通过；默认严格校验对过渡文件 exit 1，与正式发布阻断要求一致。

2026-10-09：#186 于 03:41:10 UTC 合并（develop 17252dc42f248e0ff995e3f198869549944b06af），#187 于 03:41:24 UTC 合并（main 473f606427e8b77a04290ce072893fbf03063912）；两个分支的 AGENTS.md 检查器 Git blob 完全相同。#188 同步最新 develop 后，已删除 CLAUDE.md、CI 临时选项与校验器允许分支，恢复严格仓库测试。严格结构校验、198 项测试和 Codex CLI 0.147.0 隔离安装再次通过；远端 required checks 以 PR 最新 head 为准。桌面端验收与 #188 当前提交的独立批准仍待完成。

清理提交 b79156644491461cfbd8f399ea32ce86e145fdb7（补齐 Codex 协作署名前为 71d368d，Git tree 相同）的新版 A6 已用真实 develop base 17252dc 中提取的检查器复验（无签核例外，exit 0）。补署名后的精确提交也重新完成 release-verify-install 全链路复验：临时 detached Git 工作树、严格 portable 校验、Codex CLI 0.147.0 实际安装和 1/19 技能作用域均 PASS；结束后临时 Git 工作树清理完成。仅验证安装，不创建标签、草稿或发布。后续验收记录提交不改运行代码。

GitHub 只读查询确认 v7.0.0 / v7.0.1 的 NLM wheel 与 checksum 资产仍存在；未执行发布修改。

精确提交 eba75ff88d2d72e6e9120a234e2eab7fef74f8ce 已实际执行 release-verify-install 的完整组合验证：临时 detached Git 工作树、portable 校验、Codex CLI 0.147.0 隔离安装、仓库内外作用域均通过，安装结束后清理临时 Git 工作树。该测试只执行安装复查，不创建标签、草稿或发布。
