---
type: runbook
scope: marketplace
summary: "Explain Kit installation and behavior acceptance evidence"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: draft
version: v1.1
related:
  - "../adr/[ADR]_Explain_Kit_Addition.md"
---

# [RUNBOOK] Explain Kit acceptance

Explain Kit 0.1.0 已随 #198 / Marketplace v8.1.0 发布；发布后的 canonical 安装复查与具体身份见 [发布记录](./[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。以下样本与开发候选身份保留历史来源；ChatGPT 桌面端真实验收仍未执行，保持 draft。

## Development candidate and execution (historical)

起始基线 develop 95f2e32；候选分支 codex/add-explain-kit。实施期间普通 merge 同步 develop b76def7，保留 #195 的 understanding-kit / pop-quiz 与 canary 路径兼容修复。市场 8.0.1、diagram-kit 0.3.0、understanding-kit 0.1.0 均不变，新增 explain-kit 0.1.0。本记录不构成正式发布授权。

代理执行检查、隔离安装、模型行为及可用客户端操作；owner 只决定真正未决事项。无法自动执行的步骤明确列为未执行并说明能力或身份约束，不把手工操作作为例行要求。

## Structural and installation checks

依次运行 npm test、npm run validate、npm run check:baseline-tools、npm run smoke:codex。测试执行时要求 REQUIRE_PYTHON=1 和 REQUIRE_PWSH=1，避免环境缺失被当作成功。

| 场景 | 普通 prompt：仓库外 / 内公开 | 原生 skills/list：仓库外 / 内公开 | 其他要求 |
|---|---|---|---|
| diagram-kit | 1 / 1 | 1 / 1 | 实际执行安装缓存中的 Python 校验器 |
| explain-kit | 2 / 2 | 2 / 2 | 两技能来自对应安装缓存 |
| diagram-kit + explain-kit | 3 / 3 | 3 / 3 | 身份/版本/资源正确，绘图回归 |
| 三插件组合 | 3 / 3 | 4 / 4 | pop-quiz 仍显式启用，包内资源与原生展示一致 |

四个场景均为仓库外 0 个、仓库内 19 个开发技能，使用独立用户目录、缓存和 consumer cwd，均没有 MCP；来源、数量和名称同时核对。发布安装复查在精确 canonical SHA 上调用相同的严格验证和完整安装场景。

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
| 结构与自动测试 | PASS | 同步 develop 后 230/230，0 fail、0 skipped；REQUIRE_PYTHON=1 / REQUIRE_PWSH=1 |
| 技能格式校验 | PASS | skill-creator quick_validate.py 分别验证 glossary 与 concept；在隔离 uv 环境提供 PyYAML，不新增仓库依赖 |
| Codex CLI 0.147.0 隔离安装与发现 | PASS | 四场景普通提示 / 原生 skills/list 均符合上表，作用域、身份、版本、包内字节与显式策略通过 |
| Codex 模型行为 | 已执行 | CLI 默认 gpt-5.6-sol / reasoning none；11 个解释案例及 1 个绘图案例，逐项观察见下文 |
| 已安装 Python 图表校验 | PASS | 隔离安装 fixture 与模型 D1 输出均实际执行；D1 共扫描 1 张图，FAIL 0，WARN 0 |
| ChatGPT 桌面端安装、composer 发现和调用 | 未执行 | 原生 UI API 不可用；Computer Use 指导明确禁止自动化 ChatGPT 桌面 UI，CLI 不能替代 |
| canonical SHA 发布安装复查 | PASS | 124bd6fb37c122d5c963a03b2bea6f72acccdc95；完整四场景通过，Explain Kit Git tree 为 9cc69e60051a2f10c0ddc82cee3e3335152a2556 |

2026-10-09 的真实 CLI 观察：G1 正确区分 OAuth 授权与 OIDC 登录，面向产品经理中文短答；C1 / R2 区分覆盖赋值与请求去重，不把幂等键或乐观锁写成普遍保证，保留并发、过期和外部副作用边界；R1 读取安装缓存中的 glossary，正确说明 PostgreSQL 协调冲突锁申请；A1 读取 concept 并检索 react.dev，说明依赖比较、setup/cleanup、Strict Mode 开发检查与不适用场景。

F1 读取 glossary 并按 80 字、无类比交付；F2 按两个术语分别提供中英段落；U1 不编造 ABC-47，指出所需最小语境；U2 首次错误选择 concept，收紧两个 description 后重新安装，最终读取 glossary 并短答。N1 保留 JavaScript 调试任务并给可执行修复；N2 保留安全审查任务、指出哈希被当密码重放的风险，没有加载解释模板。

同步 develop 后，在三插件的新隔离安装中再次运行 U2 / R2 / N1：U2 读取已安装 glossary 并短答，R2 读取 concept 并解释天然幂等、去重、并发及副作用边界，N1 直接给出 optional chaining / 空值回退等 JavaScript 修复。没有加载 pop-quiz，现有显式策略保留。这三次补测与前述样本分开保存，仍属于有限的模型行为观察。

D1 首次保存/Python 调用被 CLI 执行策略拒绝。代理随后让同一安装客户端在聊天生成 container 图及证据表，再保存真实输出并执行安装缓存的 Python 校验器；该分步结果通过，不宣称只读 CLI 完成了写文件或 Python 操作。图仅包含源码证明的 HTTP 客户端、Node.js 服务和本地 JSON 文件；节点/边证据定位到 demo/server.mjs 与 demo/data.json。

模型调用最初沿用桌面应用 gpt-6.1-sol 名称时被 CLI 服务拒绝；移除隔离环境中的模型覆盖后使用 CLI 内置默认值，未改用户日常配置。模型采样不证明全部输入、所有模型或桌面 UI；原始输入、响应与路由事件保存为本任务验收证据，必要信息在此记录，不把发现结果或退出码直接当行为 PASS。

## Failure, recovery and release

失败先由代理诊断并修复授权范围内的问题，再重跑受影响检查。隔离目录按已验证的临时路径清理；不修改日常用户的插件设置或缓存。行为失败按观察结果修正规则，不为单次措辞差异添加模板测试。

本任务完成的代码与证据可准备到 develop 的草稿 PR。缺失客户端证据按实际状态保留；正式发布前必须完成验收、独立批准、CI 和发布授权，不以旧 v8.0.0 记录替代新候选验收。
