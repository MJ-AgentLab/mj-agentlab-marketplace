---
type: runbook
scope: marketplace
summary: "Marketplace 8.1.0 publication, post-release checks and unresolved evidence"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.1
last-verified: 2026-10-09
---

# [RUNBOOK] Marketplace 8.1.0 release readiness

2026-10-09，owner 明确要求“#197 PR 已经合并，继续后续工作，并发布”。代理据此准备 Marketplace 8.1.0，完成工程检查并创建 #198；客户端验收处理及 reviewer 选择未收到答复。owner 随后告知 PR 已合并，代理核实 #198 于 11:06:08 UTC 合入 main，v8.1.0 于 11:06:31 UTC 自动发布。发布事实与尚未提供的验收、批准及豁免证据分别记录，不根据合并反推它们已满足。

本记录的 active / last-verified 仅表示发布身份、正文与已发布提交 canonical 安装已经复查，不能解释为完整客户端验收通过。真实桌面 UI 仍 NOT RUN，GitHub reviews=[]，没有提供独立批准记录或明确验收延期决定。

## §1 Preconditions and candidate

| 项目 | 实际状态 |
| --- | --- |
| #197 合并 | MERGED；develop merge SHA 为 `42bbe05f8fd0e9a59974113fc228dfa40e72ca62`，与已测 head `49b0f31` 的 Git tree 相同：`83ec10b39b0e371bf8c4cdbc508305691ac99a42` |
| 隔离发布分支 | `codex/release-marketplace-8-1-0` 从 `42bbe05` 建立，复用本任务独立 worktree；main / develop 工作区不用于实施 |
| main ancestry 同步 | 普通 merge 纳入 main `2e7fa3f47fb4f2034ec08a24b3daf7ea6b44bcbd`；提交 `e1b22a7bcc191105b4bf565e036b87fb6318f11d` 的 Git tree 与 `42bbe05` 相同，零内容差异 |
| 版本准备 | 从 develop 的未发布 pre-bump `8.0.1` 准备功能版本 `8.1.0`；marketplace dry-run 的目标仅为 VERSION 与派生 README badge |
| 插件版本 | diagram-kit `0.3.0`、understanding-kit `0.1.1`、explain-kit `0.1.0`，不连带升版；各根 manifest 继续是插件版本权威 |
| 公开范围 | 三插件、四公开技能：arch-diagram、pop-quiz、glossary、concept；19 个 mp-* 开发技能保持仓库作用域 |
| 发布事实 | PUBLISHED：#198 merge `d8a12d612ee0907a919e302c76bca9f906353669`，与冻结 head `a57f25b6` 的 tree 均为 `2f35986cd147b0fa9ab74a9c754a358f9ebaaee7`；实际发布与证据缺口按 §3 分别记录 |

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

以上预期已在 `425e5f656f7b37ee2238c914f9b5548c1dd5c6c2` 的 canonical Git tree 四场景实际通过：仓库外 0 个、仓库内 19 个开发技能；普通 prompt 隐藏 pop-quiz 是预期策略，不是安装缺失。包含 diagram-kit 的三个场景实际执行安装缓存中的 Python 校验器，均 FAIL 0 / WARN 0。日志为 `%TEMP%/marketplace-8.1.0-canonical-425e5f6.log`。该提交的全量测试另为 230/230、失败 0、跳过 0（21,348 ms），日志为 `%TEMP%/marketplace-8.1.0-tests-425e5f6.log`。本记录随后只补检查证据；最终冻结 head 的 canonical 复验与 required checks 在发布 PR 补记。该阶段成功只证明安装、发现和资源合同，不证明真实桌面 UI。

最终 head `a57f25b6d367e3dff5e12aad8f24c21cd914bc0b` 再次通过全量 230/230（21,066 ms，失败 0 / 跳过 0）与四种 canonical 安装，见 `%TEMP%/marketplace-8.1.0-final-head-tests.log`、`marketplace-8.1.0-final-canonical-install.log`。#198 merge tree 完全相同；发布后另对实际 SHA `d8a12d612ee0907a919e302c76bca9f906353669` 重跑四种 canonical 安装及严格校验，全部 PASS，包含 Diagram 的三个场景真实 Python 均 FAIL 0 / WARN 0。记录为 `%TEMP%/marketplace-8.1.0-post-publish-canonical-install.log`，不将安装复查写成新的模型行为或桌面执行。

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

候选阶段 #198 保持 draft，全部 checks 通过，reviews=[]，reviewDecision=REVIEW_REQUIRED，审查 threads 0；代理没有请求外部 reviewer 或执行 merge。收到 owner 合并通知后，GitHub 确认为 MERGED，但 reviews 仍为空。未取得独立批准或豁免证据，不将主分支保护配置、合并结果或发布成功当成这些证据。当前后续工作是发布复查、文档修正、main → develop 同步与预升；不再次询问已经发生的发布是否获准。

## §3 Verification ledger

| 层次 | 状态 | 实际证据 / 待办 |
| --- | --- | --- |
| 发布意图授权 | AUTHORIZED | owner 本次明确要求继续后续工作并发布；不重复确认相同授权 |
| #197 精确合并树身份 | PASS | `42bbe05` 与 `49b0f31` 的 tree 均为 `83ec10b39b0e371bf8c4cdbc508305691ac99a42`；合并不追认独立批准 |
| main ancestry 同步 | PASS | `e1b22a7` 普通 merge 纳入 main `2e7fa3f`；与 `42bbe05` 零文件内容差异 |
| 版本 dry-run / 目标 | PASS（版本准备） | marketplace `8.0.1` → `8.1.0`，目标仅 VERSION / README badge；三个插件根 manifest 版本保持 |
| 本轮候选 baseline / strict validation | PASS | Codex CLI 0.147.0 精确匹配；严格校验 errors 0、19 开发技能、4 公开技能；canonical `425e5f6` 再运行相同严格校验，最终冻结 head 见发布 PR |
| 本轮候选完整测试 / 真实 Python | PASS | 工作区 230/230（20,675 ms），提交 `425e5f6` 230/230（21,348 ms），均失败 0、跳过 0，强制 Python / PowerShell；升级指南文档合同另为 10/10。首次文案失败与修正留日志 |
| 本轮候选 smoke / canonical install | PASS | 工作区与精确 Git SHA `425e5f6` 四场景安装、作用域、版本及资源字节通过；包含 Diagram Kit 的三个场景实际运行缓存 Python，FAIL 0 / WARN 0；最终冻结 head 在发布 PR 补记 |
| 已有 CLI 模型行为 | LIMITED EVIDENCE | §2.3 分插件记录；Understanding Kit 为 18 scoped PASS / 1 UNEXERCISED，状态回放独立记录 |
| Codex Side Chat 真实交互 | NOT RUN | 无可操作的原生 Side Chat 接口；CLI 不替代窗口及快照选段证据 |
| ChatGPT 桌面真实交互 | NOT RUN | 原生 UI 能力不可用且 Computer Use 禁止自动化该客户端；三个插件均保留缺证据状态 |
| 发布 PR / 当前 head 独立批准 | MERGED；APPROVAL NOT RECORDED | [#198](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/198) head `a57f25b6`，GitHub reviews=[]，未提供独立批准记录；AI 复核不替代 GitHub 批准 |
| 发布 PR required checks / 审查对话 | PASS | 冻结 head 的结构、Ubuntu / Windows baseline compat 与 A6 全部 SUCCESS；PR CI run `37918316546`，A6 runs `37918316494` / `37918529563`；未解决审查 threads 0 |
| main 发布 merge | MERGED | `d8a12d612ee0907a919e302c76bca9f906353669`，2026-10-09 11:06:08 UTC；与已测冻结 head tree 相同 |
| v8.1.0 tag / Release | PUBLISHED / VERIFIED | [Release](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.1.0) ID `407832742`，tag peel / target 为 `d8a12d6`，title `v8.1.0`，draft=false、prerelease=false、assets=[]、immutable=false；正文与该 SHA CHANGELOG 精确匹配；11:06:31 UTC 发布，workflow `37921662685` SUCCESS |
| 已发布提交 canonical 安装 | PASS | `d8a12d6` 四场景、资源字节、作用域及实际缓存 Python 全部通过；本轮独立执行，非旧候选日志换名 |
| 历史保护 | PRESERVE | v8.0.0 继续绑定 `733bd3de7829bbf68d0849d93d731509d9447af8`；既有公开 Release 与历史 v7.x 资产不改写、覆盖或删除 |
| 发布后 main → develop 同步 | MERGED / VERIFIED | [#199](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/199) 于 11:14:47 UTC 合并，merge `a220688d0f46c32f775d4284feb6f9c935085089`；tree 与已发布 `d8a12d6` 相同，原 develop 工作区已干净快进；reviews=[] 不追认批准 |
| 下一补丁 pre-bump | PREPARATION；MERGE PENDING | 已满足 #199 同步前置条件，准备 marketplace `8.1.1` 预升 PR；版本工具仅 VERSION / badge 两目标，各插件保持版本；不创建同号 Release |

## §4 Failure, recovery and post-release

本地检查或 canonical 安装失败时，代理诊断、修复授权范围内的问题，重跑受影响检查；隔离缓存按核实的准确路径清理，保留非敏感日志，不改用户日常插件配置。发布之前可通过审查变更调整候选，保持版本和文档一致。

正式流程在 main 当前 tip 上按“创建空 draft → 验证 canonical Git tree 安装/发现 → publish 前重新核对远端身份与状态 → publish → 复查已发布身份与实际 immutability 字段”执行。仓库当前没有启用 immutable releases，不宣称平台提供不可变保证；历史仍按规则保留。草稿身份不一致、意外资产或标签绑定不同 SHA 时停止，不覆盖已公开资产。正式发布后通过新修复版本处理故障，保留已经发布的标签与正文。

发布身份与已发布提交安装已经完成复查，#199 同步也已合入 develop 并验证相同 Git tree。按 [发布后 pre-bump 决定](../adr/[ADR]_Develop_PreBump_Adoption.md)准备 `8.1.1` VERSION / README badge 预升 PR，后续 PR 的实际合并 SHA、CI 与批准仍逐项核对；保留承载未合并后续工作的 worktree。已经发布的标签、Release 正文及插件版本不受文档修正或开发预升影响。

## §5 Change History

| Version | Date | last-verified | Summary |
| --- | --- | --- | --- |
| v1.0 | 2026-10-09 | PENDING | 记录 #197 合并树、main ancestry 同步、已授权 8.1.0 版本准备、本轮 230 测试与四场景 canonical 安装；真实 UI、当前发布 head 批准、CI 与正式发布身份待补，不追认 PASS 或豁免。 |
| v1.1 | 2026-10-09 | 2026-10-09（发布身份 / 安装） | 核实 #198 merge、v8.1.0 自动发布、正文与标签身份及实际 merge SHA 四场景安装；保留 UI NOT RUN、reviews=[] 和无明确豁免记录；准备 develop 同步及预升。 |
