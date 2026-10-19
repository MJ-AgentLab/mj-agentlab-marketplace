---
type: report
layer: working
scope: html-guide-kit
summary: "HTML PR1 可追溯交付事实、保留缺证与本次阅读试行结果"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.4
task: 217-html-guide-kit
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217
---

# [REPORT] HTML Guide Kit

[任务入口](./INDEX.md) · [本次主 PLAN / P1 边界](./[PLAN]_HTML_Guide_Kit.md) · [原任务 Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)

## 结论与待交接

本次将 PR1 的规范、工程事实、原件及当前交接集中导航；不搬旧证据，不新增第二套产品约定。43项资源对应核查与三角色独立合成阅读已通过；试行子PR[#261](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/261)经当前候选双平台CI和实际安装通过后正常合入任务集成分支，actual merge/tree见[实施REPORT](../257-task-documentation/[REPORT]_Task_Documentation.md)。主PR #258 现已合入 develop，actual merge 新复验及真实批准缺口见实施 REPORT R8；阅读通过不补齐下列历史缺证。

原任务 #217 于 2026-10-15 按 Owner 调整后的工程交付范围关闭；HTML 当前为 0.1.36。该决定停止继续为旧验收修正或复测，旧 FAIL / UNEXERCISED / NOT_RUN 保留。开放的 [#239](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/239)承载已知自检必要状态前提缺陷和实际使用后续；本批不自动恢复该开发。Owner 已在 #257 的 Q12 接受本次文档机制与有界阅读试行成品，保留历史缺口；来源见实施 REPORT R10，不扩大为 HTML 产品整体验收。

| 缺口 / 影响 | 下一操作与责任 | 恢复 / 接受条件 |
|---|---|---|
| #239 已知缺陷，可能影响自检反馈 | 维护 Agent 在对应范围授权后处理，Owner 决定实质范围 | 新修复绑定新版本及适用验证；旧 FAIL 保留 |
| PR1 GitHub 非作者批准未观察到 | 保留平台 reviews=[] 的事实；不能由 Agent 审查、合并或 CI 补写 | 如有真实历史来源，追加原时点证据；本批不制造批准 |
| 完整行为/双客户端/原生窗口未覆盖，现实效果 NOT_MEASURED | 按 #217 收尾决定及 #239 后续范围跟踪 | 需要新范围/实际证据；本批阅读试行不补齐 |
| 文档机制主 PR #258 已合 develop，真实批准 NOT_MET；Owner 已接受本批文档成品 | 实施 REPORT R10 保留明确接受来源；Agent 继续 #262 实际门禁 | 不追认历史批准，不扩大为 HTML 产品整体验收 |

## PR1 历史交付链（2026-10-12）

[PR #221](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/221)的 head 为 `385e6919c44cc280266f9fe8c7105f379d45872f`，actual merge 为 `70267a5b91d759af09a8f1281a33e2d5a90fdbc9`，两者 tree 均为 `767ec5082451014eb224b6727b5955e6f56574a2`。#218 于同日关闭。平台当前读取 reviews=[]，不据此追认独立批准；GitHub 原文及捕获时间在[具名来源](./source-bindings.json)。

PR1 交付 ADR、验收 SPEC、阶段记录、提交 scope/钩子/验证器及独立版本工具前置支持；缺 HTML manifest 的 dry-run/apply 均失败、零写入。运行仍为 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1，marketplace 当时未发布 8.1.2；三插件、四公开技能、20 仓库技能。没有登记 HTML 运行包，没有空包目录；这不是当前五插件集合。

原工程/同步记录记载 252/252 测试、0 skip、四安装场景及三个含 Diagram 场景的缓存 Python 实际通过。最终 head 仅补账本/证据，运行资源及执行配置未变；合并后原四安装回执在 `4992d751d3a9e66a22c95a95ff08a351e75331a4` 首次提交，其目标是上述 actual merge，不能假称已存在于 merge 树。上述证据是当时记录，本批不重新执行或外推新版本。

完整原位置为[混合 RUNBOOK §6–7](../../docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)；固定 PR1 时点的 ADR/SPEC/RUNBOOK、两轮测试日志、安装、缺 manifest 和补交回执可按来源清单恢复。后来大账本的“当前”“开放”“候选”只适用于原段时点；当前状态须读本批 Issue 快照与实际 manifest。

## 原失败与保留限制

原 SPEC 尚未落地时有缺链失败，图标测试首轮 9/10；随后补齐来源的 252/252 不抹去原失败。图标候选/静态准备不等于 HTML 行为、安装或客户端通过。PR1 的旧临时 cache 路径只作定位来源，不要求重新访问，也不将其当现存必要资源。

原任务后续模型失败、中断、封存 plan.json、reviewer-only 及实际清理记录继续由原账本/封存负责；本批不重判历史等级、不重算未知序列化的聚合摘要、不读取受限备份或外部绝对路径。旧 Understanding 资源从固定提交恢复，不能以今天的 Learning Evidence 文件代替。

## P1 — 本次资源与阅读试行（2026-10-19）

阅读时的64项来源含56项Git原件、当批平台响应和首轮校验材料。完成阅读后，再固定7项实际读本/来源清单/回执/校验器，当前[具名来源](./source-bindings.json)共71项。2026-10-19实际只读复核通过：[逐项资源回执](./evidence/pr1-resource-verification.json)列明两份43项映射完全一致、63项Git原件匹配、3 PNG raw匹配及40文本独立的确定性LF→CRLF表示匹配。每项保留原路径、Git原始字节和受控快照，不改旧哈希。该43项仅是PR1原清单范围。

| 阅读问题 | 直接来源 |
|---|---|
| PR1当时的决定、判准与执行账本 | 固定原件 [ADR](./evidence/sources/pr1-docs/docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)、[SPEC](./evidence/sources/pr1-docs/docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)、[RUNBOOK](./evidence/sources/pr1-docs/docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)；现行长期维护位置仍见INDEX |
| 252测试、43资源、先失败后修复、缺manifest | [工程记录](./evidence/sources/pr1-docs/docs/runbook/evidence/html-guide-kit/pr1-engineering-checks.json)、[同步记录](./evidence/sources/pr1-docs/docs/runbook/evidence/html-guide-kit/pr1-develop-sync-checks.json)、[缺manifest原回执](./evidence/sources/pr1-docs/docs/runbook/evidence/html-guide-kit/pr1-missing-manifest.json) |
| actual merge及补交安装回执 | [PR221当批响应](./evidence/sources/github/current-pr-221.json)、[reviews原响应](./evidence/sources/github/current-pr-221-reviews.json)、[4992d751补交回执](./evidence/sources/pr1-docs/docs/runbook/evidence/html-guide-kit/pr1-post-merge-install.json) |
| 现阶段状态、问题与版本 | [#217原文](./evidence/sources/github/current-issue-217.json)、[#239原文](./evidence/sources/github/current-issue-239.json)、[固定当前manifest](./evidence/sources/current/plugins/html-guide-kit/plugin.json)、[GET起止时间/摘要](./evidence/sources/github/capture-receipt.json) |

复现资源检查：在本仓库运行 `node plans/217-html-guide-kit/evidence/verify-pr1-sources.mjs`，输出新的只读核验JSON；执行身份默认null，可由实际执行者显式填写环境字段 `TASK_DOCUMENTATION_VERIFIER_ID`。脚本只读受控快照/可用Git对象，不执行旧代码、不访问原绝对cache路径。完整对象不可得时明确说明使用受控快照；对象错类型、现存提交缺路径及其他Git故障须失败，不能隐瞒为fallback。

首轮资源核查已通过，但独立审读发现脚本硬编码Agent身份、Git故障可能泛化为缺对象；保留[首次原回执](./evidence/pr1-resource-verification-initial.json)，对应脚本/原bindings按首次摘要恢复并绑定在sources中。修复后由实际root执行者于`2026-10-18T16:59:02.806Z`重新通过，该回执作为实际读本保留；追加读本恢复来源后于`2026-10-18T17:09:23.946Z`复核通过。不覆盖第一次证据，也不把首轮通过当作没有审查缺口。

## P2 — 独立合成阅读与交接

固定候选为`601ff07a6840653e57687e93fe856c79475de4a0`。三个fresh Agent不继承父会话，从INDEX沿实际链接阅读，未提供答案键或其他角色输出；精确模型版本未暴露，记unknown。事前在父会话固定四题及每题2分合格规则，随后按真实输出逐题评定；没有用总分抵消缺证。

| 实际Agent / 模拟角色 | 实际UTC起止 | 四题分数 | 结论 |
|---|---|---|---|
| /root/pilot_manager / 管理者 | 2026-10-18 17:01:41–17:03:17 | 2/2/2/2 | PASS：目标/边界、交付、缺证及下一责任可定位 |
| /root/pilot_product / 产品 | 2026-10-18 17:01:50–17:03:31 | 2/2/2/2 | PASS：原意/接受、正式约定、版本结果和后续接受可区分 |
| /root/pilot_devops / 开发运维 | 2026-10-18 17:01:58–17:03:44 | 2/2/2/2 | PASS：执行/合入/补交链、43资源恢复和复用限制可找到 |

[输入、完整输出、评分及逐文件摘要](./evidence/reading/)保留实际阅读顺序与困难；原Agent在试行后仅誊录其原消息，未重答或另起试行。规则在会话中事前固定，文件落盘发生在派发后，未伪称更早文件时间。实际读本INDEX/PLAN/REPORT、当时64项bindings、资源回执、校验器及父任务INDEX从601ff07固定Git原件另存受控快照，后续追加结果不能覆盖阅读输入。

三个角色实际访问的目标未遇断链；长JSON初次显示截断后按字段补读，原RUNBOOK未含后交§7、Issue/账本有多段带日期“当前”，均需结合REPORT直接来源表和捕获时间。没有测量真实人群阅读耗时，未声称检查全部链接语义。阅读只检验本次来源可找、范围可辨和责任可交接，不证明产品效果、完整客户端或Owner最终接受。

## 维护与恢复

继续复用本 PLAN/REPORT，后续轮次追加候选与原输出，不另建完整报告。长期产品/技术约定仍维护在领域 canonical；混合 RUNBOOK 维持明确旧文档兼容。本目录完成后保持原位置。任何后续扩大迁移、修复产品、发布或不可逆操作均按其真实授权与风险条件执行。
