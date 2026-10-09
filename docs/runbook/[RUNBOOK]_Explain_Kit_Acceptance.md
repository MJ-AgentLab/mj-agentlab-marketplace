---
type: runbook
scope: marketplace
summary: "Explain Kit installation and behavior acceptance evidence"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: draft
version: v1.0
related:
  - "../adr/[ADR]_Explain_Kit_Addition.md"
---

# [RUNBOOK] Explain Kit acceptance

## Candidate and execution

基线 develop 95f2e32；候选分支 codex/add-explain-kit。市场 8.0.1、diagram-kit 0.3.0、explain-kit 0.1.0。本记录不构成正式发布授权。最终候选提交及实际结果在验证后更新。

代理执行检查、隔离安装、模型行为及可用客户端操作；owner 只决定真正未决事项。无法自动执行的步骤明确列为未执行并说明能力或身份约束，不把手工操作作为例行要求。

## Structural and installation checks

依次运行 npm test、npm run validate、npm run check:baseline-tools、npm run smoke:codex。测试执行时要求 REQUIRE_PYTHON=1 和 REQUIRE_PWSH=1，避免环境缺失被当作成功。

| 场景 | 仓库外公开 / 开发 | 仓库内公开 / 开发 | 其他要求 |
|---|---|---|---|
| diagram-kit | 1 / 0 | 1 / 19 | 实际执行安装缓存中的 Python 校验器 |
| explain-kit | 2 / 0 | 2 / 19 | 两技能来自对应安装缓存 |
| 两插件组合 | 3 / 0 | 3 / 19 | 身份/版本/资源正确，绘图回归 |

每个场景使用独立用户目录、缓存和 consumer cwd，均没有 MCP；来源、数量和名称同时核对。发布安装复查在精确 canonical SHA 上调用相同的严格验证和完整安装场景。

## Behavior cases

两个目标客户端分别运行以下代表性输入，保存真实输出与选择证据；按照语义评价，不以固定标题或模板字符串代替质量判定。

| ID | 输入 | 判定 |
|---|---|---|
| G1 | `$explain-kit:glossary OAuth @产品经理` | glossary，授权含义正确，默认中文保留原文，短解释适合受众 |
| C1 | `$explain-kit:concept 幂等性 @后端工程师` | concept，定义/实现/反例/边界正确，不把请求标识写成普遍必要条件 |
| R1 | 什么是 Advisory Lock？ | PostgreSQL 语境明确时速解；必要语境不足可澄清，不误称数据库不协调冲突申请 |
| R2 | 讲透幂等性的机制、反例和失效边界 | 自然路由 concept，不索取已明确的解释深度 |
| A1 | 深入理解 React useEffect 的机制和适用边界，面向前端新人 | 接受 API 深讲，核对所采用的 React 语境和版本事实 |
| F1 | 用 80 字解释数据库，不用类比 | 遵从长度和格式，不因宽泛或缺类比强制提问/凑结构 |
| F2 | 双语快速解释 OAuth 和 Idempotency | 按术语和语言分别组织，不混成一段或重复确认明确数量 |
| U1 | 什么是公司内部代号 ABC-47？当前没有相关资料 | 明确缺少上下文，索取最小信息，不编造定义 |
| U2 | 帮我理解 Agent | 可合理给一般定义并声明语境；语境改变正确性时才问必要问题 |
| N1 | 调试这段代码并解释报错原因 | 调试为主要任务，不仅返回 glossary/concept 模板 |
| N2 | 审查这个 PR 并解释风险 | 审查为主要任务，不抢占流程 |
| D1 | 给 demo 源码画 container 图并提供证据表 | arch-diagram 回归，资源定位正确、实际 Python 执行 |

## Actual evidence

| 层次 | 状态 | 证据 / 原因 |
|---|---|---|
| 结构与自动测试 | 未执行 | 待实施验证 |
| Codex CLI 0.147.0 隔离安装与发现 | 未执行 | 待运行三个安装场景 |
| Codex 模型行为 | 未执行 | 待真实调用 |
| 已安装 Python 图表校验 | 未执行 | 待真实执行 |
| ChatGPT 桌面端安装、composer 发现和调用 | 未执行 | 待核实可用自动化能力 |
| canonical SHA 发布安装复查 | 未执行 | 待候选提交固定后验证 |

## Failure, recovery and release

失败先由代理诊断并修复授权范围内的问题，再重跑受影响检查。隔离目录按已验证的临时路径清理；不修改日常用户的插件设置或缓存。行为失败按观察结果修正规则，不为单次措辞差异添加模板测试。

本任务完成的代码与证据可准备到 develop 的草稿 PR。缺失客户端证据按实际状态保留；正式发布前必须完成验收、独立批准、CI 和发布授权，不以旧 v8.0.0 记录替代新候选验收。
