---
type: report
scope: communication-kit
summary: "Communication delivery references and plan-path migration facts"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-21
state: active
version: v1.2
layer: working
task: 222-communication-kit
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222
---

# [REPORT] Communication Kit

[任务入口](./INDEX.md) · [主 PLAN](./[PLAN]_Communication_Kit.md)

## Existing delivery and limits

固定 develop 91f982f7 的 [8.3.1 发行账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_1_Release_Readiness.md)记录五包七技能的 8.3.1 公开交付，Communication 包为 0.1.0；[原验收账本](../../docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)保存原 PR1–PR5、CLI C16–C18 PARTIAL、限定客户端实证、批准缺项、原失败和未覆盖。本文只导航这些有界事实，不以旧计划中“待执行”推翻实际交付，也不因目录整合补写任何缺证 PASS。

本批没有重新执行 Communication 模型行为、原生窗口或现实效果验收，没有发布操作，Owner 对最终成品的接受不由本文推定。

## Path migration facts

2026-10-19，#269 的 Agent 在隔离工作树中把原实施计划及 provenance 的固定 Git 原字节迁入本任务 evidence/sources，生成[来源清单](./source-bindings.json)，建立唯一主 PLAN/REPORT 和入口，删除当前根 plan/。当前规范/导航/消费者的迁移和后续拒绝旧目录门禁由 #269 主 REPORT 记录，内部 PR/最终 develop 合入及复验尚须各自真实证据，不在此提前写完成。

| 原件 | 固定 Git 来源 | SHA-256 / 本批复制后核对 |
|---|---|---|
| communication-kit-implementation-plan | 91f982f70552fc0bfdf4015da943e257a22d4c7b:plan/communication-kit-implementation-plan.md | 6d0de62b597ce2807278e165428cb28408fc774b3fba4059298f7a77b88e3fc3，复制后逐字节一致 |
| communication-kit-plan-provenance | 91f982f70552fc0bfdf4015da943e257a22d4c7b:plan/communication-kit-plan-provenance.json | 7d38da72b09311e255bdccd8d1ec7bffa6d4be17e3ff56de4115873658be545e，复制后逐字节一致 |

原件内历史路径只作当时来源事实，不提供旧路径 alias、回退或豁免；读者从本 INDEX 抵达唯一现行计划。原始 405 行计划及完整 provenance 都可由任务内快照或固定 Git 对象恢复；摘要不单独替代原件。

## 2026-10-21 English display-name maintenance — #298

本批依据 [#298](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/298) 和[主 PLAN 的完整选择基线](./[PLAN]_Communication_Kit.md#2026-10-21-english-display-name-maintenance--298)，唯一主 PR 为 [#299](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/299)。固定目标基线为 `6b4612b4968f5172944f61b180c032df913037f1`。界面子 PR [#300](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/300) 的 head 为 `ca63004d998d3825b0925e6b9251400b4ca8d466`，正常合入集成分支的实际 merge 为 `eaff692a31c295afab5cdea07963ca66ad088374`、tree 为 `c6fcf9bde793c5598272ec63968c137a12ccee21`，与合入前候选 merge-tree 一致；内部 base 无保护，合入时 A6 / Validate Structure 和本批相关 Harness 已通过，跨平台 baseline 当时仍运行中，随后两端均实际 PASS。文档子 PR 为 [#301](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/301)；完整产品与文档候选 `5a28eba5af4691cb31bba9b41ef5b9ab08ba1cdf` / tree `c2ac01a4962af4e8ba417538cc12b66687295ba2` 执行以下全量检查，后继仅补证据/报告不扩展该测试对象。

### Implemented scope and recoverable checks

插件 manifest 与技能 agents/openai.yaml 的两个展示字段统一为 `Communication Kit` 和 `Draft clear messages and documents while preserving meaning.`（60 Unicode scalars）；包 README 和技能标题同步。结构化比对恢复两个旧展示字段后，manifest/native 与固定基线深度相等；技能正文恢复旧标题后逐字一致。内部 identity、公开路由、默认提示、显式策略、能力、图标、版本及冻结摘要保持。文档子批同步现行指南、ADR/SPEC、术语、公共导航和任务入口；旧候选段落明确适用时点，历史 RUNBOOK、发布 CHANGELOG 和 evidence 原件不改写。

初次应用创建 worktree 因 Windows 长路径 FAIL，短路径完整检出恢复；没有改 Git 全局配置。界面子批首次结构校验因 AGENTS.md 新说明超出 16384 字节 FAIL；改为精简任务指针后相同校验 PASS，门禁预算未变。原失败、重跑和一次性展示/接口比对见[本批证据目录](./evidence/naming298/)。脚本以固定基线和实际候选核验，不把未提交状态的 HEAD 当成已提交候选身份。

### Verification and AI assessment

| 项目 | 实际结果/边界 |
|---|---|
| 界面子批结构/元数据 | `npm run validate` 重跑 PASS，20 仓库技能/8 公开技能；首次预算 FAIL 保留 |
| 默认提示、接口及资源保持 | 一次性结构化比对 PASS；恢复展示字段后 manifest/native 深度相等，技能仅标题变化，冻结摘要/图标和历史验收 diff 为空 |
| A6 / whitespace / 提交规范 | 实际 diff 的 A6 返回 agents-md-synced；git diff --check 和提交规范 PASS |
| 界面相关测试 | communication-foundation / validate-portable 共 30 tests PASS，见 ui-tests.log |
| 文档子批 | 现行名称与完整简介逐项对照；九字段/layer、导航及原件完整性由完整候选 npm run validate 核对 PASS |
| 完整候选 npm test | 首轮 637 PASS / 14 FAIL / 1 SKIP，14 项因测试未发现本机已有 Python；设置进程内 PYTHON / HTML_SITE_PYTHON 为实际 Python 3.12.13 后，同一候选全量重跑 651 PASS / 0 FAIL / 1 SKIP（Linux 专用用例在 Windows 跳过），不改源码/门禁 |
| 完整候选 npm run smoke:codex | 13 隔离安装 / 178 命令全部 PASS；实际缓存 Python 图表 6 组、Learning 共用能力 6 组、HTML site 4 组；13 场景隔离根全部核对已清理；安装元数据/完整资源及原生 displayName 与源一致 |
| 版本工具基线 | npm run check:baseline-tools 精确 Codex 0.147.0 PASS |
| 远端 CI | #300 两端 baseline 后续 PASS；#301 首轮 push 的 Ubuntu PASS、PR merge-ref 的 Ubuntu 两项既有 HTML 浏览器启动 FAIL，原 DevTools endpoint 缺失/超时证据保留。单项复跑当时因同 workflow 仍运行被 API 403 拒绝，不报告复跑成功；后继实际 CI 按当前 head 另记，不能覆盖旧失败 |
| 合成产品读者/集成维护者 | 同一 OpenAI Codex 以独立检查步骤模拟两角色，核对 Owner 完整文案、入口不变和历史范围；这是 AI 判断与运行比对，不声称独立另一 Agent 或 GitHub 非作者批准 |
| 新 GUI 显示、原生窗口/现实效果 | 本次未执行；旧缺口与延期保持，CLI 元数据不能替代 GUI |

完整运行摘要、原始日志哈希/本机位置、每个安装组合及执行版本见 [candidate-checks.json](./evidence/naming298/candidate-checks.json)，首轮失败与全量重跑摘要见 [test-run-summaries.txt](./evidence/naming298/test-run-summaries.txt)，候选结构化比对见 [candidate-naming.json](./evidence/naming298/candidate-naming.json)。远端原失败及准确 job 来源见 [ci-browser-failure.json](./evidence/naming298/ci-browser-failure.json)；完整本机原日志保留在摘要列出的隔离检查目录，已提交摘要与固定候选/命令支持复现。

本地工程验收和现行名称一致性已通过本批范围；正式发布未执行，市场/插件版本未改，受保护 develop 合入、当前 head 真实批准及 Owner 最终成品接受仍分别待实际证据。内部子 PR 按实际相关 Harness、A6、最新 base 与线程门禁正常合入；远端其他场景失败/运行中保持各自状态，最终主 PR 不 bypass。恢复用后继 PR 撤回展示及现行文档文案，不覆盖公开历史。

## 2026-10-21 Actual merge and publication preparation

#299 实际于 `2026-10-21T07:06:01Z` 合入 develop `1503563f7733c1dbbddcbafcfd5cba2a359b8096`，tree `363e2c90625faaaa1e8a50fba1f37110ea62cb7e` 与已验冲突同步源 `e7600415cd2e7b8d125e243c056f1c59a82f7aaa` 相同。同步后的实际全量为 653 total / 652 PASS / 0 FAIL / 1 Linux-only SKIP，13 安装 / 178 命令及实际 Python Diagram6 / Learning6 / site4 通过；实际 merge 又执行 strict validate 和全新隔离 Communication 安装、原生 skills/list，名称/完整英文简介精确一致，4 CLI 命令及显式策略/资源检查通过、隔离根清理。原始日志及回执保留在 `D:/worktrees/comm-checks/`，固定 Git 源与执行范围在 #299/#298 的合并后回执中可追溯。上述为原批次结果，本次不重跑不变内容。

#299 checks 全通过，但 reviews=[]；实际规则 suite `4635853564` 为 bypass，pull_request 因缺非最后推送者批准 FAIL。实际合并由现有账号执行，Agent 未执行该保护合并；技术通过、Issue 工程交付关闭和实际 merge 不补造保护批准或 Owner 最终接受，也不授权后继 bypass。

本次正式发布依据[主 PLAN 的后续原话与决定](./[PLAN]_Communication_Kit.md#2026-10-21-publication-continuation--298--303)。现有 #303 原 head `ae77ab98f4b1916f736814ec2082501a1860838f` 以 b242947 为产品源、明确排除 #299；Owner 选择并入 8.3.5 后由既有发行会话整合 #299 与本补丁。独立 worktree `D:/worktrees/comm-release` 从实际1503563创建；版本工具 DryRun 和 Apply 均只匹配 manifest L4，Communication `0.1.0 → 0.1.1`，市场 `8.3.5`/HTML `0.1.40`/其他版本不变。包说明/CHANGELOG及任务入口/PLAN/REPORT同步本候选；中央发行文档、市场 CHANGELOG、根 AGENTS 和835账本由既有发行会话单写，避免并行冲突。

新增实际候选为 `7f06eddd9eafa7df6d20024248ecd6d8ae962dbf` / tree `5651a72ba8accebaa89d0e7d45de101c0d809993`。六文件 diff 只含包 manifest/README/CHANGELOG 和222任务 INDEX/PLAN/REPORT；[版本/未变资源比对](./evidence/release303/version-scope.json)恢复 version 后 manifest 与实际150深度相等，除 manifest 和两个说明文件外的九个包资源 Git 对象保持，市场注册/VERSION/根README/脚本/测试/冻结来源无 diff。产品读者角色核对完整文案与接口，发行维护者角色核对版本、来源、复用闭包和回退；执行者为同一 OpenAI Codex 的独立检查步骤，不声称另一 Agent 审查或 GitHub 批准。

[新版本隔离安装回执](./evidence/release303/version-install.json)绑定该候选，实际 Codex0.147.0 完成4个CLI命令及原生 skills/list：安装缓存为 `communication-kit/0.1.1`，插件/技能 displayName 和完整 shortDescription 精确匹配，默认提示/完整包资源一致，普通发现不含 communicate，allow_implicit_invocation=false；隔离根核对已删除。未运行新的模型/GUI/窗口或不变插件/Python/十三组合；原已验内容按 Owner 决定复用。

版本工具单锚点、结构化边界与提交规范 PASS。新增文档第一次 strict validate 因 PLAN 内普通 `codex://` 链接不支持 FAIL；改为纯会话来源标识后复跑 PASS，未放宽规则，原失败留 `D:/worktrees/comm-checks/release-version-validate-initial-fail.log`。最终文档追加后的校验结果在提交/PR回执中记录。当前是版本准备，尚未宣称 #303 完成整合、受保护 main 合入或公开；最终发布身份、治理门禁和 Owner 接受由 #303/发行账本分别登记。
