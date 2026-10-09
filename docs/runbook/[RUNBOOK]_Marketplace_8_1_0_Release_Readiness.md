---
type: runbook
scope: marketplace
summary: "Marketplace 8.1.0 release candidate, evidence and pending gates"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: draft
version: v1.0
last-verified: null
---

# [RUNBOOK] Marketplace 8.1.0 release readiness

2026-10-09，owner 明确要求“#197 PR 已经合并，继续后续工作，并发布”。本记录据此准备 Marketplace 8.1.0，保留已经完成的工程证据与尚未满足的发布门禁。发布意图已有授权，不重复询问是否发布；本次授权没有明确豁免真实客户端验收、当前发布 head 的独立批准或 required checks。当前候选尚未发布，因此保持 draft / `last-verified: null`。

## §1 Preconditions and candidate

| 项目 | 实际状态 |
| --- | --- |
| #197 合并 | MERGED；develop merge SHA 为 `42bbe05f8fd0e9a59974113fc228dfa40e72ca62`，与已测 head `49b0f31` 的 Git tree 相同：`83ec10b39b0e371bf8c4cdbc508305691ac99a42` |
| 隔离发布分支 | `codex/release-marketplace-8-1-0` 从 `42bbe05` 建立，复用本任务独立 worktree；main / develop 工作区不用于实施 |
| main ancestry 同步 | 普通 merge 纳入 main `2e7fa3f47fb4f2034ec08a24b3daf7ea6b44bcbd`；提交 `e1b22a7bcc191105b4bf565e036b87fb6318f11d` 的 Git tree 与 `42bbe05` 相同，零内容差异 |
| 版本准备 | 从 develop 的未发布 pre-bump `8.0.1` 准备功能版本 `8.1.0`；marketplace dry-run 的目标仅为 VERSION 与派生 README badge |
| 插件版本 | diagram-kit `0.3.0`、understanding-kit `0.1.1`、explain-kit `0.1.0`，不连带升版；各根 manifest 继续是插件版本权威 |
| 公开范围 | 三插件、四公开技能：arch-diagram、pop-quiz、glossary、concept；19 个 mp-* 开发技能保持仓库作用域 |
| 正式放行 | PENDING：本轮工作区工程检查已通过；精确提交安装、实际客户端证据、发布 PR 当前 head 独立批准及 required checks 按 §3 分别记录 |

正式发布以 [发布操作](./[RUNBOOK]_Release_Operations.md) 为准。VERSION 变化合入 main 会触发自动发布，因此到 main 的 PR 合并属于正式发布步骤，不能把它当作普通 develop 合并。

## §2 Execution and evidence

### §2.1 Version and regression preparation

代理执行版本 dry-run，确认 From 匹配 `8.0.1`，To 为 `8.1.0`，再应用市场版本与 badge。CHANGELOG 和当前文档说明此次新增理解测验、解释能力及已有修正；旧发布正文、标签和资产保留。版本准备允许先完成，不表示缺失门禁已经通过。

候选执行以下检查，并在 §3 记录真实结果和精确 SHA：

~~~text
npm run check:baseline-tools
npm run validate
npm test
npm run smoke:codex
~~~

完整测试要求 `REQUIRE_PYTHON=1` 与 `REQUIRE_PWSH=1`，图表 Python 校验必须实际执行。本轮工作区复验为 230/230、失败 0、跳过 0；强制 Python 3.12.14 / PowerShell 实际执行。首次检查发现 Explain Kit 正式节正文没有写出自身版本，修正后全量通过，未改运行文件或测试规则。升级指南再补齐三个插件后，文档合同 10/10 通过。旧候选的测试成功没有直接填作本轮结果。

非敏感本地日志位于 `%TEMP%/marketplace-8.1.0-baseline.log`、`marketplace-8.1.0-validate.log`、`marketplace-8.1.0-tests.log`（首次失败）、`marketplace-8.1.0-tests-final.log`（230 PASS）、`marketplace-8.1.0-docs-final.log`（10 PASS）和 `marketplace-8.1.0-smoke.log`（四场景 PASS）。版本准备提交为 `02e3e1e908cb15dd2b658218d3574d0e76ed6c45`；本轮测试基于含该版本内容和当前文档修改的工作区，精确最终 head 复验在发布 PR 单独补记。

### §2.2 Canonical installation

对实际待发布候选的 canonical Git SHA 使用相同严格校验与隔离安装流程。隔离 HOME / CODEX_HOME / cache / consumer cwd；核对名称、版本、资源字节及原生 skills/list，三插件场景保留 pop-quiz 的仅显式调用策略。

| 安装场景 | 普通 prompt 公开技能数 | 原生 skills/list 公开技能数 |
| --- | --- | --- |
| diagram-kit | 1 | 1 |
| explain-kit | 2 | 2 |
| diagram-kit + explain-kit | 3 | 3 |
| 全部三插件 | 3 | 4 |

以上是预期，分别核对仓库外 0 个、仓库内 19 个开发技能；普通 prompt 隐藏 pop-quiz 是预期策略，不是安装缺失。包含 diagram-kit 的场景实际执行安装缓存中的 Python 校验器。该阶段成功只证明安装、发现和资源合同，不证明真实桌面 UI。

### §2.3 Existing model behavior evidence

运行文件在合并前已取得下列有限模型行为证据，保留原样并明确来源和范围；本轮没有把旧日志改写为新的客户端执行。

| 插件 | 已有实际证据 | 证据限制 |
| --- | --- | --- |
| diagram-kit 0.3.0 | CLI 0.147.0 读取安装缓存的技能及 refs，生成 Container 图和节点/边证据；已安装 Python 校验器实际扫描图表，FAIL 0、WARN 0。详见 [迁移验收](./[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md)及 [Explain Kit 绘图回归](./[RUNBOOK]_Explain_Kit_Acceptance.md) | CLI 的生成、保存及 Python 执行按实际权限分开记录；不代表 ChatGPT 桌面行为 |
| understanding-kit 0.1.1 | 19 个中性路径 fresh forward 变体：78 turn / 44 展示题，18 scoped PASS、1 UNEXERCISED；额外 fresh forward 重试 4 turn / 3 题仍未覆盖明确同源错误分支。独立历史状态回放另为 PASS，3 turn / 1 道新 Q3。详见 [验收记录](./[RUNBOOK]_Understanding_Kit_Acceptance.md)和 [矩阵](../../plugins/understanding-kit/skills/pop-quiz/evals/results/2026-10-09-post-merge-matrix.md) | 状态回放不计为该 forward 分支通过；明确未答回复不证明原生空返回、窗口持续显示或关闭恢复；历史带标签路径 pilot 不计最终中性矩阵 |
| explain-kit 0.1.0 | CLI 0.147.0 / 默认 gpt-5.6-sol：11 个解释案例及 1 个绘图回归；三插件重新安装后另补 U2 / R2 / N1，保持解释路由、主要调试任务与 pop-quiz 显式策略。详见 [验收记录](./[RUNBOOK]_Explain_Kit_Acceptance.md) | 有限模型样本；不证明全部输入、所有模型或桌面 composer 发现 |

### §2.4 Real clients and release gates

目前三插件的 ChatGPT 桌面端安装、发现和实际调用均未取得证据；Understanding Kit 的 Codex Side Chat、原生未答窗口与关闭恢复也未执行。本会话 Native CUA 不可用，app 工具没有 Side Chat 或问卷窗口操作接口；非语音会话不能使用屏幕上下文工具。Computer Use 指导明确禁止自动化 ChatGPT desktop UI，现有 CLI 和浏览器操作不能替代此验收。

真实证据应绑定客户端版本、准确的 marketplace / 插件来源、候选版本和实际输出。pop-quiz 还需记录快照、职责确认、未答不推进及第二 KU 的明确继续；glossary / concept 检查发现与路由；arch-diagram 检查图源、证据和实际 Python 校验。该缺口不是要求 owner 例行复制命令，也不能因已有发布授权而补记 PASS 或推定豁免。

完成可由代理执行的候选准备后，按 [合并门禁技能](../../.agents/skills/mp-git-merge-gate/SKILL.md)核对 main 目标发布 PR 的最新 head、base、required checks、独立批准和未解决审查对话。AI 自检、独立 AI 复核和 #197 的合并事实分别记录，均不替代该发布 PR 的独立 GitHub 批准。门禁未齐时保留可审阅候选及具体缺口；owner 的明确例外决定若后续提供，单独记录其范围，不改写未执行结果。

## §3 Verification ledger

| 层次 | 状态 | 实际证据 / 待办 |
| --- | --- | --- |
| 发布意图授权 | AUTHORIZED | owner 本次明确要求继续后续工作并发布；不重复确认相同授权 |
| #197 精确合并树身份 | PASS | `42bbe05` 与 `49b0f31` 的 tree 均为 `83ec10b39b0e371bf8c4cdbc508305691ac99a42`；合并不追认独立批准 |
| main ancestry 同步 | PASS | `e1b22a7` 普通 merge 纳入 main `2e7fa3f`；与 `42bbe05` 零文件内容差异 |
| 版本 dry-run / 目标 | PASS（版本准备） | marketplace `8.0.1` → `8.1.0`，目标仅 VERSION / README badge；三个插件根 manifest 版本保持 |
| 本轮候选 baseline / strict validation | PASS（工作区） | Codex CLI 0.147.0 精确匹配；严格校验 errors 0、19 开发技能、4 公开技能；最终 head 复验见发布 PR |
| 本轮候选完整测试 / 真实 Python | PASS（工作区） | 230/230、失败 0、跳过 0，20,675 ms；强制 Python / PowerShell；升级指南文档合同另为 10/10。首次文案缺版本失败及修正留日志 |
| 本轮候选 smoke / canonical install | PASS（工作区 smoke）；canonical PENDING | 四场景安装、作用域、版本及资源字节通过；包含 Diagram Kit 的三个场景实际运行缓存 Python，FAIL 0 / WARN 0；精确提交 canonical 安装在提交后执行 |
| 已有 CLI 模型行为 | LIMITED EVIDENCE | §2.3 分插件记录；Understanding Kit 为 18 scoped PASS / 1 UNEXERCISED，状态回放独立记录 |
| Codex Side Chat 真实交互 | NOT RUN | 无可操作的原生 Side Chat 接口；CLI 不替代窗口及快照选段证据 |
| ChatGPT 桌面真实交互 | NOT RUN | 原生 UI 能力不可用且 Computer Use 禁止自动化该客户端；三个插件均保留缺证据状态 |
| 发布 PR / 当前 head 独立批准 | PENDING | 待创建到 main 的发布 PR，并核对当前 head 非作者批准与权限；AI 复核不替代 GitHub 批准 |
| 发布 PR required checks / 审查对话 | PENDING | 待记录当前 head 与 base 的结构、Windows / Ubuntu、A6 等结果及未解决对话 |
| main 发布 merge | PENDING | 门禁满足后才执行；当前没有发布合并 SHA |
| v8.1.0 tag / Release | PENDING | 尚未创建或发布；按 draft-first 状态机核对 canonical SHA、正文、状态和无附加资产 |
| 历史保护 | PRESERVE | v8.0.0 继续绑定 `733bd3de7829bbf68d0849d93d731509d9447af8`；既有公开 Release 与历史 v7.x 资产不改写、覆盖或删除 |
| 发布后同步与 pre-bump | PENDING | 发布完成并核验后，main 同步回 develop，再准备 marketplace `8.1.1` 及派生 badge；插件版本不连带变化 |

## §4 Failure, recovery and post-release

本地检查或 canonical 安装失败时，代理诊断、修复授权范围内的问题，重跑受影响检查；隔离缓存按核实的准确路径清理，保留非敏感日志，不改用户日常插件配置。发布之前可通过审查变更调整候选，保持版本和文档一致。

正式流程在 main 当前 tip 上按“创建空 draft → 验证 canonical Git tree 安装/发现 → publish 前重新核对远端身份与状态 → publish → 复查已发布身份与实际 immutability 字段”执行。仓库当前没有启用 immutable releases，不宣称平台提供不可变保证；历史仍按规则保留。草稿身份不一致、意外资产或标签绑定不同 SHA 时停止，不覆盖已公开资产。正式发布后通过新修复版本处理故障，保留已经发布的标签与正文。

发布完成后再记录实际 tag、Release 身份、main merge SHA 和验收状态，按 [发布后 pre-bump 决定](../adr/[ADR]_Develop_PreBump_Adoption.md)同步 main 到 develop，准备 `8.1.1` 的市场 VERSION 与 README badge，并复验、清理已经合并且无需保留的工作区。此段为预期后续步骤，目前尚未执行。

## §5 Change History

| Version | Date | last-verified | Summary |
| --- | --- | --- | --- |
| v1.0 | 2026-10-09 | PENDING | 记录 #197 合并树、main ancestry 同步、已授权 8.1.0 版本准备及本轮工作区检查；真实 UI、canonical 安装、当前发布 head 批准、CI 与正式发布身份待补，不追认 PASS 或豁免。 |
