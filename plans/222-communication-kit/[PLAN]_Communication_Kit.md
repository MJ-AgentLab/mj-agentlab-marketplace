---
type: plan
scope: communication-kit
summary: "Current Communication task plan and historical accepted-source boundaries"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-21
state: active
version: v1.2
layer: working
task: 222-communication-kit
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222
---

# [PLAN] Communication Kit

[任务入口](./INDEX.md) · [主 REPORT](./[REPORT]_Communication_Kit.md) · [Issue #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)

## Scope and accepted sources

这是 2026-10-19 依 #269 整理的唯一现行主 PLAN，承接原 Communication 任务身份，不冒充 2026-10-12 原计划。产品范围以 [ADR](../../docs/adr/[ADR]_Communication_Kit_Addition.md)、[SPEC](../../docs/spec/[SPEC]_Communication_Communicate.md)和对应版本/Owner 决定为准：显式 communicate、保义写作/改写、明确文件请求后的操作及必要澄清。

完整旧接受基线由[来源清单](./source-bindings.json)绑定固定提交 91f982f70552fc0bfdf4015da943e257a22d4c7b 下的两个原始 Git 文件，任务内同字节快照可恢复。原计划内“待执行”、建议版本/PR 拓扑及原路径均属于当时，不能覆盖后续交付或被当作当前操作入口。原件不继续编辑，后续计划只维护本文；原捕获事实和 Owner 接受范围不重写。

## Current work and handoff

本次[整合任务 #269](../269-plans-path-unification/INDEX.md)负责路径/导航/来源及校验，不改变插件运行、版本或发布。原任务交付与历史未覆盖由 REPORT 链接既有证据；后续 Communication 开发须按真实新请求和适用原意/授权承接，不因搬迁自动重启旧未执行测试。

1. 阅读本入口及主 REPORT，先确认当前请求属于目录治理还是 Communication 运行工作。
2. 需要还原原接受时按来源清单的固定 commit:path 或任务内快照取得原字节，逐项核对摘要和声明用途。
3. 后续已授权工作复用本 PLAN/REPORT 与 #222，不为新会话或恢复创建第二主计划；真实范围、验证和延期追加，进度仍在 Issue。

## Verification, risks and recovery

目录整合验收由 #269 对实际候选执行：唯一入口/主 PLAN、旧当前路径撤除、两原件逐字节与哈希匹配、隔离阅读和恢复。插件历史 CLI、客户端、批准及现实效果范围沿用当时记录，不因本次工程检查变成通过。

缺原件/路径错误/并行计划时停止依赖操作并修复；保留原失败与接受。普通 Git revert 或后继修复恢复整合，不覆盖原件、不改发布资产；Owner 最终接受与技术检查分开。

## 2026-10-21 English display-name maintenance — #298

本批进度与唯一轻量原意正本为 [Issue #298](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/298)；#222 保持原交付身份，本目录继续复用。Owner 在当前 Codex 会话明确选择：“采用 Communication Kit，按你的建议修改显示名称和英文简介，同步相关文档，内部标识和调用入口保持不变。”实际消息时分/消息 ID 不可得；捕获日期为 2026-10-21（Asia/Taipei）。这是文案选择和技术执行授权，成品最终接受尚未发生。

完整接受文案为显示名称 `Communication Kit`、英文简介 `Draft clear messages and documents while preserving meaning.`，同时应用于插件 manifest 和 communicate 原生界面。此段与固定基线 `6b4612b4968f5172944f61b180c032df913037f1` 可恢复本批选择；Issue 仅链接本段接受快照，后续实现不扩大该选择。内部 `communication-kit`、`communicate`、`$communication-kit:communicate`、默认提示、显式策略、能力、图标及行为保持；只调整技能标题及界面称呼，不重写写作流程。市场/插件版本和公开资产保持，正式发布不在本批。

| 原意条目 | 实际交付与验收 | 顺序/依赖 |
|---|---|---|
| 显示名称及英文简介 | manifest 与 agents/openai.yaml 精确匹配上述完整文案；接口字段与固定基线比较 | 子 PR 1 → `codex/communication-english-name` |
| 相关现行文档 | 包说明、技能标题、指南、ADR/SPEC、术语及导航同步；历史与冻结来源不改写 | 子 PR 2 在子 PR 1 实际合入后 → 同集成分支 |
| 工程质量和授权边界 | npm test / validate / smoke:codex、实际缓存 Python 图表校验、A6、来源完整性及合成角色复核；失败和未查分别记录 | 两个子 PR Harness 后内部正常合并；唯一主 PR → protected develop |

使用短路径独立 worktree；原 develop 未跟踪计划文件保留。应用创建 worktree 首次因 Windows 长路径失败，改用短路径完整检出，不放宽验证。回退用普通后继 PR 恢复界面及现行文档，不覆盖历史发布。最终主 PR 须当前 head 非作者/非最后推送者批准、required checks、最新 base 和已解决线程；不 bypass。实际客户端显示尚未执行，不用 CLI 元数据或旧截图冒充新 GUI；旧窗口/效果延期及 Owner 最终接受独立保留。

## 2026-10-21 Publication continuation — #298 / #303

Owner 在同一 Codex 会话（来源标识 `01a15ca1-4adb-7e60-8df8-bb541c6e6043`）明确要求：“继续进行正式发布，将 Communication Kit 的新名称和英文简介更新到公开版本。”Agent 说明现有 #303 的 8.3.5 候选排除了 #299，并给出另发 8.3.6 或并入 8.3.5 两项。Owner 对完整第二选项“并入 8.3.5，并允许你联系该发布会话协调更新 #303 和重验”实际回复：“2；对于已经验过的内容，无需重验”。消息准确时分/ID不可得，捕获日期 2026-10-21（Asia/Taipei）；这是正式发布范围和协调授权，不代表对尚未公开成品的最终接受。

本批复用上述完整显示文案及固定实际 develop `1503563f7733c1dbbddcbafcfd5cba2a359b8096`。为使插件发布身份和安装缓存识别本次文案，Communication 独立补丁 `0.1.0 → 0.1.1`；Marketplace 保持已准备的 `8.3.5`，HTML 保持 `0.1.40`，其他插件不动。先版本工具 DryRun 核对唯一 manifest 锚点，再 Apply；正文/默认提示/路由/策略/图标/冻结来源不扩展。

唯一发行主 PR 继续用 [#303](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/303) → protected main；本隔离子分支只准备 Communication 补丁及对应文档，交给既有发行会话整合。原 #299 的实际合并与有限安装结果按原批次保留；已验未变内容通过固定来源和字节闭包复用，不重复全量/十三组合/模型/桌面验收。新增版本与文档做必要校验，实际隔离安装核对 `0.1.1` 缓存、精确显示文案和显式策略；最终候选只验证新增差异/整合闭包及实际发布身份，CI 的必需保护检查仍保留。

发布负责人为执行 #303 的 Agent，发现版本/名称/入口/安装来源不一致或 required gate 未满足时停止发布。已知良好公开版本为 `v8.3.4` / `5898a8192740b39f41263129a5f99efeba96a6cc`；发布前可正常撤回候选，发布后以既有版本定位及后继补丁恢复，不覆盖已公开 tag/Release/资产。旧 CLI PARTIAL、窗口/客户端延期、效果未测和历史批准缺项不由此追认；真实当前 head 非作者/非最后推送者/CODEOWNER 批准、CI、线程、最新 base 与 Owner 最终接受独立保留。
