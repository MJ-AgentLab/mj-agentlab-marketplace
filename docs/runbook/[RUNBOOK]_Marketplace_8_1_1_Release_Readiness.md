---
type: runbook
scope: marketplace
summary: "Marketplace 8.1.1 publication identity, post-release checks and evidence gaps"
owner: marketplace-maintainers
created: 2026-10-10
updated: 2026-10-10
state: active
version: v1.1
---

# [RUNBOOK] Marketplace 8.1.1 release readiness

## Authorization and candidate identity

Owner 于 2026-10-10 在本会话明确要求“进行发布”。该授权覆盖 8.1.1 发布准备及满足门禁后的发布，不重复请求同一授权。候选分支 codex/release-marketplace-8-1-1 从已合并 develop 9bd54d739434aa5788566ee725b5e0d0d0af049b 派生，准备时 main 为 65a05a8f8e1fc908cacd7d1bbb27f2510e93adf4 且已在候选 ancestry 内。

Marketplace VERSION / README badge 已由 #201 准备为 8.1.1，插件根 manifest 已由 #203 准备为 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1。本轮没有新的版本转换，不重新 bump 已匹配的版本；只将四份 CHANGELOG 的 Unreleased 内容切为正式版本节，并保留空 Unreleased。旧版本段、标签和公开资产保持。

本次发布采用 A 仓库主标和 D 插件家族，范围保持三插件、四公开技能、20 开发技能。运行资源、SVG 导出与 PNG 解码检查、安装内容比较及设计技能已经 #203/#204 合入；发布准备只改文档，不改插件功能或图标字节。品牌验收与历史失败见 [记录](./[RUNBOOK]_Brand_Identity_Acceptance.md)。

## Actual publication

#205 于 2026-10-10 10:48:50（Asia/Taipei）合入 main，merge 为 `8f0e044a593408fadc90565f326ef4cb5906e840`，已测 head 为 `ad342df5313465ed613736f2c93384e24881af22`；两者 Git tree 均为 `db34699b781393afa4e8ab04b686b6fd14b10950`。发布 workflow [38018333785](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38018333785) SUCCESS，绑定实际 merge SHA。

[v8.1.1 Release](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.1.1) ID `408563064` 于同日 10:49:18 公开；tag peel 与 target_commitish 均为上述 merge，draft=false、prerelease=false、immutable=false、assets=[]。正文与该提交 CHANGELOG 的 8.1.1 版本节规范化后完全一致。记录 API 的实际 immutability 值，不修改已公开 Release 或旧资产。

发布后另从该完整 SHA 建立 detached checkout，运行四种 canonical 隔离安装，全部通过；各安装的 logo/composerIcon 引用、1024 尺寸、字节数和 SHA-256 与源文件一致。消费者环境 0 开发技能，仓库环境 20；组合原生发现 4 公开技能，pop-quiz 仍显式调用。含 Diagram 的三个场景实际执行安装副本 Python 校验，各扫描 1 图 / FAIL 0 / WARN 0。可复查数据见 [发布后证据](evidence/marketplace-8-1-1-post-release.json)。

本轮读取 #205 reviews API 仍为空，未见非作者批准记录；reviewThreads 为空，结构、Linux/Windows 和 A6 检查均成功。已合并/已发布不证明独立批准或下述未提供的完整客户端验收已满足，不补记 PASS 或豁免。

## Client evidence

Owner 回答两个客户端验收“已完成，可补充验收结果”，并提供三张截图。截图审阅确认如下事实，来源是 Owner 提供而非代理自动操作：

| 插件 | 截图可见版本 | 实际可见内容 |
| --- | --- | --- |
| Diagram Kit | 0.3.1 | 详情页白底节点图标；示例提示区显示同族小图标 |
| Understanding Kit | 0.1.2 | 详情页白底问号选项卡图标 |
| Explain Kit | 0.1.1 | 详情页白底气泡图标；两个示例提示区显示同族小图标 |

截图原文件名与 SHA-256 见 [截图来源账本](evidence/marketplace-8-1-1-client-screenshots.json)。原截图保留在本会话附件，不上传其完整桌面内容。截图没有显示客户端版本、Git ref/SHA、已安装插件列表或实际聊天输入框；也不能据此区分两个客户端各自的结果。Owner 的完成陈述、截图可见事实与待补具体信息分开记录，未展示项不追认 PASS。

本轮按 Computer Use SKILL 初始化了 @oai/sky，list_apps 成功返回窗口，说明该路径可以列出应用；不能沿用此前“原生接口不可用”作为本轮结论。返回的相关窗口标题为 ChatGPT。Computer Use guidance 明确要求“Do not automate the ChatGPT desktop app UI or Codex CLI or Codex extensions within Windows apps.”，因此没有操作该 UI。统一 browser 工具的 native API 仍禁用，非语音会话不使用屏幕上下文工具。CLI 安装与截图审阅不替代未提供的两端完整验收。

## Verification ledger

| 检查 | 当前证据 |
| --- | --- |
| 正式发布授权 | AUTHORIZED：Owner 明确要求发布 |
| 已合并品牌代码与安装 | PASS：#203/#204 已通过 CI；#203 merge 四种 canonical 安装及实际 Python 已通过，详见品牌记录 |
| 本轮预提交检查 | PASS：240 tests / 0 fail / 0 skip；结构校验通过，Codex CLI 0.147.0 匹配；四份既有版本说明正文逐字保持 |
| 冻结候选的 canonical 安装 | PASS：ad342df 的四种安装通过，见 #205 正文 |
| 已发布 merge 的 canonical 安装 | PASS：8f0e044 的四种安装、图标比较与实际 Python 通过，见发布后证据 |
| 两端客户端详情页图标 | OWNER SCREENSHOTS：三版本和详情页图标可见；客户端标识/版本和来源待补 |
| 两端已安装列表与实际输入框 | DETAILS PENDING：未在已提供截图中展示 |
| 发布 PR 的独立批准 | NOT RECORDED：#205 已合并，reviews API 为空；不以发布成功替代 |
| Required checks 与审查对话 | PASS：#205 检查全部成功，reviewThreads 为空 |
| 标签 / GitHub Release | PUBLISHED：v8.1.1 / ID 408563064 / target merge 8f0e044 |

main 使用 active protect-main ruleset（ID 14008213），要求 1 个批准、CODEOWNER、最新推送批准、过期批准失效、审查线程解决及严格 Validate Structure。准备时按照 [合并门禁技能](../../.agents/skills/mp-git-merge-gate/SKILL.md) 保留 draft；后续 Owner 告知 #205 已合并，代理核对实际发布事实。代理未执行管理员豁免或删除保护，不将外部合并推断为门禁记录齐全。

## Follow-up state

main 回同步 PR [#206](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/206) 直接指向发布 merge，base 为 develop 9bd54d7；不新增文件编辑或版本转换。发布记录修正通过独立 main 文档 PR 推进，其 main merge ancestry 在最终同步时继续纳入。8.1.1→8.1.2 dry-run 已成功，恰好匹配 VERSION 和 README badge，未写入；按 [发布操作](./[RUNBOOK]_Release_Operations.md) 在回同步合并后再应用 pre-bump，插件版本不动，不创建 v8.1.2 标签或 Release。

## Publication and recovery

准备阶段的发布流程要求门禁全部满足后再合并；VERSION 8.1.0→8.1.1 会触发现有 Release workflow。自动流程从实际 main tip 创建空 draft，验证该 Git tree 的四种安装，重新核对 tag/draft/body/目标 SHA 后 publish，再复查 published 和 immutability；本次不附加资产。实际已发生的合并与发布、未提供的门禁证据见上文。发布后先同步 main→develop，再准备仅 VERSION/badge 的 8.1.2 pre-bump。

准备阶段失败由代理诊断修复，不覆盖旧 Release 或历史资产。已经公开的版本只能验证，错误通过新修复版本处理。既有公开 v8.1.0 及之前版本保持，未完成门禁时不提前更新公开发布状态。

## References

- [发布操作](./[RUNBOOK]_Release_Operations.md)
- [品牌验收](./[RUNBOOK]_Brand_Identity_Acceptance.md)
- [发布后预升决定](../adr/[ADR]_Develop_PreBump_Adoption.md)
