---
type: runbook
scope: marketplace
summary: "ChatGPT/Codex 迁移验收的实际结果、限制和待完成门禁"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.3
last-verified: 2026-10-09
---

# 迁移验收记录

验收日期：2026-10-09。环境：Windows、本地 Codex CLI 0.147.0、Node.js 22.18.0、PowerShell 7、Python。实现经 #188 合入 develop；#189 准备 Marketplace 8.0.0 / diagram-kit 0.3.0；#190 已合入 main，自动流程已经发布 v8.0.0。桌面端验收仍未执行。下方保留各次执行所绑定的提交与范围，发布事实不替代缺失验收。

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
| 版本工具 dry-run / 应用 | PASS | owner 后续授权后再次 dry-run，再实际应用 marketplace 7.0.2→8.0.0（VERSION / README badge）与 diagram-kit 0.2.0→0.3.0（根 manifest）；历史正文未全局替换 |
| 退役运行依赖 | PASS | learn-kit 和 NotebookLM 专用目录、入口、CI 及新发布资产路径删除；旧 A6 触发器与历史提交 scope 作为工程保护保留 |
| 历史资料 | PASS | 原 CHANGELOG / ADR / 指南 / 验收记录保留，来源 SHA 与 Git blob 哈希记录在 archive/history-sources.json，正文和 metadata 引用按新位置修复 |
| GitHub required checks / 合并记录 | PASS；已合并 | #186 合入 develop（17252dc），#187 合入 main（473f606），#188 合入 develop（cea7744）；#188 最终 head dc58f2e 的 7 项有效检查 SUCCESS，另一次 A6 因并发取消 |
| GitHub 独立批准记录 | 未见记录 | 合并后查询 #188 / #189 / #190 reviews 为空；合并事实及 AI 复核不作为独立 APPROVED review 的证据 |
| 版本准备 / 正式发布 | 已发布 | #190 merge 733bd3d；v8.0.0 于 2026-10-09 05:20:06 UTC 自动发布。桌面端未执行状态保留，没有据此推定验收豁免 |

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

2026-10-09：#186 于 03:41:10 UTC 合并（develop 17252dc42f248e0ff995e3f198869549944b06af），#187 于 03:41:24 UTC 合并（main 473f606427e8b77a04290ce072893fbf03063912）；两个分支的 AGENTS.md 检查器 Git blob 完全相同。#188 同步最新 develop 后，已删除 CLAUDE.md、CI 临时选项与校验器允许分支，恢复严格仓库测试。严格结构校验、198 项测试和 Codex CLI 0.147.0 隔离安装再次通过；其最终 head dc58f2e 的 7 项有效检查全部 SUCCESS。

清理提交 b79156644491461cfbd8f399ea32ce86e145fdb7（补齐 Codex 协作署名前为 71d368d，Git tree 相同）的新版 A6 已用真实 develop base 17252dc 中提取的检查器复验（无签核例外，exit 0）。补署名后的精确提交也重新完成 release-verify-install 全链路复验：临时 detached Git 工作树、严格 portable 校验、Codex CLI 0.147.0 实际安装和 1/19 技能作用域均 PASS；结束后临时 Git 工作树清理完成。仅验证安装，不创建标签、草稿或发布。后续验收记录提交不改运行代码。

GitHub 只读查询确认 v7.0.0 / v7.0.1 的 NLM wheel 与 checksum 资产仍存在；未执行发布修改。

精确提交 eba75ff88d2d72e6e9120a234e2eab7fef74f8ce 已实际执行 release-verify-install 的完整组合验证：临时 detached Git 工作树、portable 校验、Codex CLI 0.147.0 隔离安装、仓库内外作用域均通过，安装结束后清理临时 Git 工作树。该测试只执行安装复查，不创建标签、草稿或发布。

## #188 合并后复验

#188 于 2026-10-09 04:08:34 UTC 合入 develop，merge SHA 为 cea7744b90694ff71b0ed846a87bc292c6633279。本地 develop 从干净工作区 fast-forward 至该提交，后续记录在新的隔离工作树中准备。

该 merge SHA 的严格校验与 198 项测试再次通过，0 失败、0 跳过，强制执行 PowerShell/Python。release-verify-install 对其精确 Git tree 的实际安装/发现通过：Codex CLI 0.147.0、仅 diagram-kit、仓库外 1 个 arch-diagram / 0 个开发技能、仓库内 1 个公开技能 / 19 个开发技能，临时 Git 工作树正常清理。

两个计划版本 dry-run 再次通过，未写入权威版本。合并后只读复查确认 v7.0.0 / v7.0.1 均仍保留原 wheel 和 checksum。桌面端结果尚缺；已向 owner 请求客户端版本、安装方式及实际调用/校验摘要，未把迁移合并当作验收通过。[后续发布准备与说明草稿](./[RUNBOOK]_Portable_Migration_Release_Readiness.md) 明确记录剩余条件。

## #189 版本准备

owner 在上述桌面端验收提问后回复“更新即可”。按该授权，代理在新的 worktree 中再次执行两项 dry-run，然后实际应用 Marketplace 8.0.0 / diagram-kit 0.3.0、README badge、正式 CHANGELOG 与发布说明，并在 ADR 记录版本准备顺序的调整。没有收到桌面客户端版本、安装来源及实际调用结果，因此桌面端仍标为未执行；没有创建新标签、草稿或正式发布。

版本准备提交 1608470d2eb64d1d2457206462c2c6536592e7fe：严格结构校验及 198 项强制 PowerShell/Python 测试通过（0 失败、0 跳过），CLI 0.147.0 基线检测通过。精确 Git tree 的 release-verify-install 实际执行通过：隔离缓存路径为 diagram-kit/0.3.0/skills/arch-diagram，consumer cwd 1 个公开技能 / 0 个开发技能，repo cwd 1 个公开技能 / 19 个开发技能，验证结束后临时 Git 工作树清理。使用 origin/develop 的原始 A6 检查器复验通过，正常 AGENTS.md 同步，无签核例外。历史 CHANGELOG 正文保留，正式发布模板已改为两个版本权威及客户端/发布门禁检查。

## #189 合并后与 main 发布候选

#189 于 2026-10-09 12:39:30（Asia/Taipei）合入 develop，merge SHA 为 304143239eb6e96b4f6a0be55a91bd70b08540ea；本地 develop 从干净状态 fast-forward 至该提交。GitHub 查询确认其最终 head 的 A6、严格结构和 Linux/Windows CI 全部通过；reviews 为空，合并不作为独立批准证据。

发布分支 codex/release-8.0.0 从 3041432 派生并合入 main 473f606。19 个旧技能的 modify/delete、旧 CLAUDE.md 删除、AGENTS.md 和两项规范共 23 处冲突均按已批准迁移解决。合并提交 88b5e6f6fef4a4431ce4086033e78ff32358e2aa 的 Git tree 为 3d53450d6ba47e66847fc1e201d732e1714a1b3a，与 3041432 完全相同；没有因同步恢复退役入口或改动运行行为。后续提交仅更新发布准备记录和未发布的 8.0.0 说明。

冲突解决后实际执行严格校验及 198 项强制 PowerShell/Python 测试，0 失败、0 跳过；CLI 基线 0.147.0 通过。精确 88b5e6f 的 canonical Git tree 安装复查通过：仅 diagram-kit 0.3.0，仓库外技能 1/0、仓库内 1/19，临时工作树清理成功。提取 origin/main 的原始检查器执行 A6，正常 AGENTS 同步通过，没有使用签核例外。

main 的 active rules 查询确认独立批准、最后推送批准、过期批准撤销、对话解决、仅 merge 方法和严格 Validate Structure 要求；经典保护接口返回 404，但实际 rules 仍在生效。没有新建 v8.0.0 标签或 GitHub Release；发布 PR 按未完成桌面验收保持 draft。

发布草稿 [#190](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/190) 初轮 CI 的 [Linux PR run](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37885848441) 在四项 canonical 安装断言均通过后，after hook 删除临时仓库的 .git/objects 时遇到 ENOTEMPTY；同一 head 的 push CI 和 Windows PR CI 通过。本机单独测试及六轮强制自动维护压力运行未复现，不能据此断定是哪一后台写入导致。

修复仅限测试夹具：禁止自动维护，校验清理路径位于临时目录，使用 [Node.js 支持的有界重试](https://nodejs.org/docs/latest-v22.x/api/fs.html#fsrmsyncpath-options) 处理短暂删除冲突，并断言目录确已清理；持续失败仍使测试失败。四项安装保护断言、生产发布验证器和 CI 要求保持原样。

## #190 合并与发布后复验

#190 于 2026-10-09 05:19:41 UTC（Asia/Taipei 13:19:41）合入 main，merge SHA 为 733bd3de7829bbf68d0849d93d731509d9447af8。最终 head 00abbc2932ed775252ed3a4ab75b6c651f744166 的 [PR CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37886953166)、[push CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37886832572) 和 [A6](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37887073452) 均通过；临时目录清理失败在该提交的双平台执行中通过复验。

[自动发布流程](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37888047611) SUCCESS：创建空 draft、验证 canonical Git tree 安装、相邻发布前复查并发布；[v8.0.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.0.0) 的 Release ID 为 407540658，published_at 为 05:20:06 UTC，draft=false、prerelease=false、assets=[]。标签与 target_commitish 均绑定 733bd3d；immutable=false，仓库未启用 GitHub immutable releases，因此不声称平台不可变。代理未修改已发布正文、标签或资产。

本地对精确 733bd3d 再次实际执行 release-verify-install：严格 portable 校验、CLI 0.147.0 安装、diagram-kit 0.3.0 缓存资源、consumer 技能 1/0、repo 技能 1/19 均 PASS；从安装缓存定位 Python 校验器，在 consumer cwd 实际校验已记录的 Container 图，扫描 1 张、FAIL 0 / WARN 0 / exit 0。临时安装和 detached Git 工作树正常清理。该提交的文件树与已验收最终 head 00abbc2 相同；未声称本次重新进行模型生成。

只读复验确认 Release 正文与发布提交的 CHANGELOG 8.0.0 节规范化后相同；v7.0.0 / v7.0.1 的原 wheel/checksum 资产 ID 和 SHA-256 digest 与前次查询相同。没有覆盖发布历史。

合并后查询 #190 reviews 为空；没有提供桌面客户端版本、安装来源及实际调用/校验结果。发布成功、标签绑定、CI 和 CLI 结果各有证据，但不替代这两项缺失记录，不追认为桌面 PASS 或独立批准，也不推定 owner 已批准本次验收豁免。

## 发布后 canary 路径兼容复验

#191 / #192 已分别合入 main f2905e2 / develop 95f2e32；develop 准备版本为 8.0.1，diagram-kit 仍为 0.3.0。闲置停用的 develop pre-bump workflow 已恢复为 active，并在精确 95f2e32 上实际运行 [检查](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37890328663)，结果 SUCCESS；没有创建 8.0.1 标签或 Release。

main f2905e2 的 [latest canary](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/37890332543) 在 Codex CLI 0.162.0 的真实安装后失败：提示目录使用 Skill roots 表和 r1 / r2 文件别名，旧检测脚本把别名当作 cwd 相对路径，realpath 报 ENOENT。Windows 的隔离安装复现相同错误，实际缓存文件存在；未把该失败归因于插件缺失。

修复先通过三个新增回归测试复现失败，再按同一提示文本的根映射展开路径，继续执行真实文件、缓存范围及 19 个仓库技能作用域检查。缺失、相对、冲突和越界映射均拒绝，多个提示文本间不共享根映射。既有绝对路径、空格和括号路径、Windows 大小写及重复/越界技能保护仍保留。

修复后的本地真实隔离安装已分别通过 CLI 0.147.0 与临时安装的 0.162.0：只安装 diagram-kit 0.3.0，consumer 技能 1/0、repo 技能 1/19，资源来自各自的隔离缓存，无 MCP，安装资源包含 Python 校验器；测试完成后清理临时安装目录。该复验仅覆盖安装与发现，没有重新声称模型生成或桌面调用。固定验收基线与已发布 v8.0.0 正文、标签、旧资产保持原样。

严格结构校验与 201 项本地测试通过，0 失败、0 跳过，强制执行 PowerShell/Python；其中七项技能发现回归覆盖旧绝对路径和新别名目录。
