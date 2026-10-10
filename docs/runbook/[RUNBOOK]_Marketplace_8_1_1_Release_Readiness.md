---
type: runbook
scope: marketplace
summary: "Marketplace 8.1.1 release candidate and evidence ledger"
owner: marketplace-maintainers
created: 2026-10-10
updated: 2026-10-10
state: active
version: v1.0
---

# [RUNBOOK] Marketplace 8.1.1 release readiness

## Authorization and candidate identity

Owner 于 2026-10-10 在本会话明确要求“进行发布”。该授权覆盖 8.1.1 发布准备及满足门禁后的发布，不重复请求同一授权。候选分支 codex/release-marketplace-8-1-1 从已合并 develop 9bd54d739434aa5788566ee725b5e0d0d0af049b 派生，最新 main 为 65a05a8f8e1fc908cacd7d1bbb27f2510e93adf4 且已在候选 ancestry 内。

Marketplace VERSION / README badge 已由 #201 准备为 8.1.1，插件根 manifest 已由 #203 准备为 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1。本轮没有新的版本转换，不重新 bump 已匹配的版本；只将四份 CHANGELOG 的 Unreleased 内容切为正式版本节，并保留空 Unreleased。旧版本段、标签和公开资产保持。

本次发布采用 A 仓库主标和 D 插件家族，范围保持三插件、四公开技能、20 开发技能。运行资源、SVG 导出与 PNG 解码检查、安装内容比较及设计技能已经 #203/#204 合入；发布准备只改文档，不改插件功能或图标字节。品牌验收与历史失败见 [记录](./[RUNBOOK]_Brand_Identity_Acceptance.md)。

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
| 冻结候选的 canonical 安装 | 提交后执行，具体提交和结果记录于发布 PR |
| 两端客户端详情页图标 | OWNER SCREENSHOTS：三版本和详情页图标可见；客户端标识/版本和来源待补 |
| 两端已安装列表与实际输入框 | DETAILS PENDING：未在已提供截图中展示 |
| 当前发布 head 的独立批准 | REQUIRED：创建 PR 后读取实际 reviews，不使用 AI 自检或已合并 PR 代替 |
| Required checks 与审查对话 | 创建 PR 后读取实际状态；发布前复核最新 base/head |
| 标签 / GitHub Release | NOT PUBLISHED：准备阶段不创建标签或 Release |

main 使用 active protect-main ruleset（ID 14008213），要求 1 个批准、CODEOWNER、最新推送批准、过期批准失效、审查线程解决及严格 Validate Structure。本轮不使用管理员豁免或删除保护。按照 [合并门禁技能](../../.agents/skills/mp-git-merge-gate/SKILL.md)，只接受非作者的当前提交批准；缺项时保留 draft 发布 PR，并请求最小必要参与。

## Publication and recovery

门禁全部满足后，合并发布 PR 到 main 会因 VERSION 8.1.0→8.1.1 触发现有 Release workflow。自动流程从实际 main tip 创建空 draft，验证该 Git tree 的四种安装，重新核对 tag/draft/body/目标 SHA 后 publish，再复查 published 和 immutability；本次不附加资产。发布后核对实际 tag、正文、SHA 和安装，按既有流程先同步 main→develop，再准备仅 VERSION/badge 的 8.1.2 pre-bump。

准备阶段失败由代理诊断修复，不覆盖旧 Release 或历史资产。已经公开的版本只能验证，错误通过新修复版本处理。既有公开 v8.1.0 及之前版本保持，未完成门禁时不提前更新公开发布状态。

## References

- [发布操作](./[RUNBOOK]_Release_Operations.md)
- [品牌验收](./[RUNBOOK]_Brand_Identity_Acceptance.md)
- [发布后预升决定](../adr/[ADR]_Develop_PreBump_Adoption.md)
