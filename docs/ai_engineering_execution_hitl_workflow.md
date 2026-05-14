---
title: AI 辅助工程执行闭环与 HITL 提问规范（通用版）
purpose: 提供 plugin-agnostic / domain-agnostic 的 AI 工程执行 + HITL 哲学锚点；可供新项目直接采用，也可供 specialized 变体 fork
version: v2.0
updated: 2026-05-14
audience: 项目负责人 / AI Agent / 想引入 HITL 工作流的团队
related: |
  - mj-system specialized 变体：docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md（17 阶段；DB / n8n / ETL / FastAPI / Flyway 域）
  - mj-agentlab-marketplace specialized 变体：docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md（11 阶段；plugin spec / .claude-plugin / MCP / release.yml 域）
---

# AI 辅助工程执行闭环与 HITL 提问规范（通用版）

## 0. 本文与 specialized 变体的关系

本文是 AI 工程执行闭环 + HITL 哲学的**通用版本**——保持 plugin-agnostic / domain-agnostic，可被任何项目采用作为起点。

**3 层关系**：

| 文档 | 定位 | 阶段数 | 域细节 |
|------|------|--------|--------|
| **本文（通用版）** | 哲学锚点 + 新项目起点 | 18 步 | 无域细节 |
| `mj-system` specialized 变体 | DB / n8n / ETL / FastAPI / Flyway 项目用 | 17 阶段 | 数据架构域 |
| `mj-agentlab-marketplace` specialized 变体 | Claude Code 插件市场用 | 11 阶段 | plugin spec / MCP / release.yml |

三者「**同款骨架，不同细节**」：共享 HITL 哲学 + Plan → Design → Implement → Verify → Self-review → PR → Merge → Post-merge 流程框架；具体阶段集 / Reference Docs / Skill 矩阵 / Rules 各自独立维护。

**通用版的作用**：

1. **哲学锚点**——任何 specialized 变体不能突破本文核心原则（§13 列出）；
2. **新项目起点**——还没有 specialized STANDARD 的项目可以采用本文当临时框架，需要时再 fork 出 specialized 变体；
3. **跨域复用**——本文的 HITL prompt（§7 + §8）可直接拷贝到任何项目使用，无需 fork。

**何时 fork 出 specialized 变体**：

- 项目有重复出现的 domain-specific 决策（如 "改 DB migration 必走 X 步骤"），通用版表达不出来
- 项目有 specialized 工具链（如 `gh CLI` + `release.yml` + plugin spec），通用版不能引用
- 阶段集需要压缩或扩展（marketplace 把 17 阶段压成 11，mj-system 保留全部）

---

## 1. 文档目的

本文档用于规范在实际项目中，AI 从 `plan` 进入执行阶段时的工作流程。

目标是将开发流程从“AI 按 plan 直接执行”升级为：

> AI 根据 plan 执行，但在关键不确定点主动暴露假设、提出选项，并等待人工确认。

本文档重点解决两个问题：

1. 当前从 plan 到 PR 的流程是否缺少关键步骤。
2. 在关键步骤中如何加入 HITL（Human-in-the-loop，人类参与决策），并设计可复用的追问 prompt。

---

## 2. 当前流程

当前执行习惯如下：

```text
1. 根据 plan，发布 issue；
2. 根据 plan，建立 branch；
3. 根据项目当前实际情况（代码为主，文档为辅），评估 plan 是否有遗漏，是否存在潜在风险；
   如果有，更新 plan，写入项目根目录中的 plans 文件夹，然后进行下一步；
   如果没有，写入项目根目录中的 plans 文件夹，进入下一步；
4. 根据上一步中的 plan，编写 spec；
   根据项目当前实际情况（代码为主，文档为辅），review spec，评估是否需要优化，
   在对应的文件夹中写入 spec；
5. 根据 spec 文件进行编写代码；
6. 提交改动；
7. 推送 GitHub；
8. 提交 PR。
```

该流程已经覆盖了主链路：

```text
plan → issue → branch → spec → code → commit → push → PR
```

但仍建议补充：

1. 执行前的 Intake、风险分级与验收标准。
2. 执行中的 HITL 决策点。
3. 编码后的本地验证与 AI self-review。
4. PR 后的 CI、review、merge、发布/回滚与复盘。

---

## 3. 推荐的完整工程执行闭环

推荐流程如下：

```text
0. Intake：明确任务目标、范围、验收标准、风险等级
1. 创建 issue：把问题、目标、范围、验收标准、风险、关联 plan 写清楚
2. 创建 branch：从最新目标分支创建，并和 issue 关联
3. Repo scan：检查当前代码、文档、测试、依赖、配置、CI、历史实现
4. Plan review：基于实际项目情况修订 plan，写入 /plans
5. HITL Gate 1：请人确认 plan 是否可以进入 spec
6. Spec drafting：根据 plan 编写 spec
7. Spec review：基于代码现状、边界条件、测试策略 review spec
8. HITL Gate 2：请人确认 spec 是否可以进入实现
9. Implementation：根据 spec 编码，尽量小步提交
10. Local verification：运行测试、lint、typecheck、build、必要的安全检查
11. Self-review：AI 自查 diff、需求覆盖、潜在风险、是否偏离 spec
12. HITL Gate 3：重大变更或高风险变更，在提交前请人确认
13. Commit：提交改动，commit message 关联 issue/任务
14. Push：推送分支
15. PR：提交 PR，链接 issue，说明改动、测试结果、风险、回滚方式
16. Review & CI：处理 review comments 和 CI failures
17. Merge gate：确认 review、CI、风险、发布策略都满足后再 merge
18. Post-merge：验证、监控、清理 branch、关闭 issue、记录复盘
```

---

## 4. 当前流程中建议补充的步骤

### 4.1 Issue 创建前增加 Intake

在发布 issue 前，建议先让 AI 做一次任务 Intake。

Intake 需要明确：

```text
任务目标是什么？
解决哪个用户、业务或技术问题？
本次做什么？
本次明确不做什么？
验收标准是什么？
是否涉及数据、权限、支付、安全、生产配置、数据库迁移？
风险等级是低、中、高？
是否需要人工确认后才能继续？
```

AI 不仅要知道“做什么”，还要知道“做到什么程度算完成”。

---

### 4.2 Issue 应成为任务追踪锚点

建议 issue 固定包含以下结构：

```markdown
## Problem
要解决的问题是什么？

## Goal
本 issue 完成后希望达到什么结果？

## Scope
本次包含什么？

## Out of Scope
本次不包含什么？

## Acceptance Criteria
- [ ] 条件 1
- [ ] 条件 2
- [ ] 条件 3

## Risk Level
Low / Medium / High

## Related Plan
/plans/xxx.md

## Related Spec
/specs/xxx.md

## Notes
上下文、限制、历史决策、相关 PR
```

---

### 4.3 Branch 创建前确认 base branch 与命名规范

在创建 branch 前，建议确认：

```text
目标 base branch 是 main / develop / release/x.y？
是否已经同步最新 base branch？
branch 类型是什么？feature / fix / chore / refactor / docs / test？
branch name 是否能关联 issue？
```

示例：

```text
feature/123-ai-demand-parser
fix/456-login-timeout
chore/789-update-plan-template
refactor/321-clean-user-service
```

---

### 4.4 将 Plan Review 升级为 Repo Scan

你当前第 3 步已经很关键。建议将它明确为：

```text
Repo Scan / Context Scan / Reality Check
```

Repo Scan 不只是 review plan，而是让 AI 系统检查项目真实状态。

需要检查：

```text
代码结构：相关模块在哪里？
已有实现：是否已有类似功能？
依赖关系：会影响哪些模块？
测试现状：是否已有测试？测试怎么跑？
接口契约：API、schema、event、message 是否会变化？
数据影响：是否涉及 DB、migration、缓存、索引？
权限影响：是否涉及 auth、role、token、secret？
配置影响：是否涉及 env、feature flag、CI、部署配置？
文档影响：是否需要更新 README、docs、ADR、changelog？
历史约束：是否有相关 issue、PR、注释、TODO？
潜在风险：兼容性、性能、安全、回滚难度。
```

Repo Scan 应输出：

```text
Plan 是否仍然成立？
Plan 有哪些遗漏？
是否需要拆分 issue？
是否需要先补测试？
是否需要先做 spike / PoC？
是否需要人工确认？
```

---

### 4.5 区分 Plan 与 Spec

Plan 和 Spec 的职责不同。

| 文件 | 解决的问题 | 重点 |
|---|---|---|
| Plan | 怎么推进 | 步骤、顺序、风险、任务拆分、执行策略 |
| Spec | 要实现什么 | 行为、接口、数据、边界、验收、测试场景 |

#### Plan 示例

```markdown
# Plan: Add customer demand parser

## Goal
实现客户需求解析能力。

## Steps
1. 检查现有 customer feedback 结构
2. 新增 parser service
3. 新增 extraction schema
4. 增加单元测试
5. 更新 API 文档

## Risks
- 现有 feedback 字段可能不完整
- parser output 需要兼容旧格式

## HITL Required
- schema 变更前需要确认
- parser 输出字段需要确认
```

#### Spec 示例

```markdown
# Spec: Customer Demand Parser

## Input
客户访谈文本、销售邮件、客服记录。

## Output
结构化需求对象：
- customer_background
- pain_points
- requested_features
- business_value
- urgency
- open_questions

## Behavior
当输入为空时，返回 validation error。
当无法判断优先级时，urgency = "unknown"。
当存在多个需求时，应返回数组。

## Acceptance Criteria
- [ ] 能解析单条客户反馈
- [ ] 能解析多需求文本
- [ ] 无法判断的信息标记为 unknown
- [ ] 不编造客户未表达的信息
```

---

### 4.6 Spec 后增加正式 HITL Gate

Spec 完成后，建议加入硬门槛：

```text
HITL Gate 2：Spec Approval
```

AI 应暂停，并询问：

```text
我已经根据 plan 和项目现状生成了 spec。
以下是我认为会影响实现路径的关键点，请确认后我再编码。
```

适合确认：

```text
接口字段是否正确？
错误处理是否符合预期？
是否允许修改已有行为？
是否需要兼容旧版本？
测试范围是否足够？
是否有不能触碰的模块？
```

---

### 4.7 编码后增加 Local Verification

编码完成后，不建议直接提交。应先运行：

```text
测试
lint
typecheck
build
格式化检查
secret 检查
不应修改文件检查
```

---

### 4.8 Commit 前增加 AI Self-review

AI 写完代码后，应先自查。结构化为 4 段（受 marketplace v4.0.0 specialized STANDARD §4.8 启发的通用版本）：

**5a 改动 vs Plan/Spec 对应（"是否做了对的事"）**

```text
我改了哪些文件？
这些改动是否全部对应 spec？
是否有超出 scope 的修改？
是否有死代码、重复逻辑、硬编码、隐藏副作用？
```

**5b 反向扫描（"是否漏改了应同步的地方"）**

```text
本次 diff 中 rename / move / delete 的标识符 / 接口 / schema 字段，
grep 所有 docs / 文档 / README / CLAUDE.md / CHANGELOG 中的引用——
命中后必须更新或在 PR body 中注明"不更新的理由"。
```

特别要扫的引用类别：
- 代码引用（grep 函数 / 类 / 字段名）
- 文档引用（grep 路径 / 文件名 / 锚点）
- INDEX / TOC 类索引
- frontmatter 字段（version / state / type）
- skill description / trigger phrases（如有 plugin 体系）

**5c 文档与索引同步（"是否漏了文档同步"）**

```text
是否需要更新 README / docs / ADR / CHANGELOG？
是否需要更新 INDEX 类索引文件？
是否需要更新对应 frontmatter 字段（version / updated）？
是否需要更新 CLAUDE.md / AGENTS.md 等 AI 上下文文件？
```

**5d Delta Check（"差异是否在意料之中"）**

```text
是否有未覆盖的边界条件？
测试是否覆盖 acceptance criteria？
是否需要用户确认（中高风险残留）？
是否触发版本 bump / 发布 workflow / 自动 tag？
是否引入了未在 plan 声明的依赖 / 服务 / 外部 API？
```

这一步用于防止：

```text
过度实现：顺手改了不该改的模块。
局部正确：代码能跑，但没有覆盖真实业务边界。
单向同步：代码改了但文档 / 索引 / frontmatter 没跟上，造成 desync。
意料之外的副作用：触发了发布 / tag / CI workflow 而本次没打算 release。
```

**双段输出建议**（specialized 变体可强制）：

- **本地验证段**（人类客观可重复检查）：git status / git diff / 测试命令输出 / lint 输出等
- **AI 自检段**（AI 生成内容可信度自查）：5a-5d 逐条勾选 + 理由

---

### 4.9 PR 后增加 Review、CI、Merge 与 Post-merge

当前流程到提交 PR 为止。建议补充：

```text
等待 CI
处理 CI failure
请求 review
处理 review comments
必要时更新 spec / plan
再次运行测试
确认 merge 条件
merge
发布或部署
post-merge smoke test
关闭 issue
清理 branch
记录复盘
```

---

## 5. 建议加入 HITL 的关键节点

### 5.1 必须 HITL 的情况

以下情况 AI 必须暂停，不能继续执行：

```text
[需求与目标层]
需求目标不清楚
验收标准不清楚
发现 plan 与代码现状冲突
发现 spec 和现有实现冲突
实现过程中 scope 明显扩大

[数据与持久化层]
需要修改数据库 schema
需要数据 migration / backfill
需要删除数据或删除文件
需要修改 cache / index 结构

[权限与安全层]
需要修改权限、认证、支付、安全逻辑
需要处理 secret / 凭据 / token
需要新增 OAuth / 外部认证流

[接口与公共行为层]
需要改变公共 API
需要改变用户可见行为
需要改 schema 契约（marketplace.json / plugin.json / .proto 等）

[依赖与配置层]
需要引入新依赖
需要新增外部服务依赖（如 MCP server / 第三方 API / OAuth provider）
需要修改生产配置 / CI/CD pipeline / release workflow
需要绕过 hook / pre-commit / CI check（如 --no-verify / --force）

[发布与版本层]
需要主版本 bump（major version）
需要删除整个 module / package / plugin
需要 force push 到 main / master / 已发布分支
需要 amend 已 push 的 commit

[质量与验证层]
测试失败但 AI 准备继续
关键测试失败且 root cause 不明
review comment 会改变需求、API、schema、权限或用户行为
```

按主题分组而非平铺，便于团队 fork 后裁剪不适用的层（例：纯前端项目可去掉「数据与持久化层」整块）。

---

### 5.2 建议 HITL 的情况

这些情况 AI 可以给出建议，但最好让人确认：

```text
有多种实现方案
需要在简单实现和可扩展实现之间取舍
需要修改文档口径
需要决定错误提示文案
需要决定字段命名
需要决定测试覆盖范围
需要拆分 issue 或 PR
```

---

### 5.3 不需要 HITL 的情况

这些情况 AI 可以直接处理：

```text
格式化
补充明显缺失的单元测试
修复 lint
补充局部注释
根据已有模式实现重复性代码
修正拼写
更新和代码直接对应的文档
```

---

## 6. HITL 通用追问框架

通用规则：

```text
当你发现不确定性时，不要直接假设。
请先判断该不确定性是否会影响：
1. 实现路径
2. 用户可见行为
3. 数据结构
4. 安全权限
5. 测试策略
6. 兼容性
7. 发布或回滚

如果会影响，请暂停并向我提问。
每次最多问 3-5 个关键问题。
每个问题必须包含：
- 你观察到的事实
- 你不确定的点
- 为什么这个问题重要
- 可选方案
- 你的推荐选项
- 如果我不回答，你建议采用的默认假设
```

---

## 7. HITL 总 Prompt

可放入 AI agent system prompt、项目执行 prompt 或团队流程规范中。

```text
你正在作为 AI 工程执行助手参与项目开发。

在执行任务时，请遵守以下 HITL 规则：

1. 你可以自主完成低风险、局部、可逆、符合现有代码模式的改动。
2. 遇到以下情况必须暂停并向我提问：
   - 需求目标或验收标准不明确
   - plan 与代码现状冲突
   - spec 与现有实现冲突
   - 需要修改数据库 schema、权限、认证、支付、安全逻辑
   - 需要删除文件、删除数据或改变生产配置
   - 需要引入新依赖
   - 需要改变公共 API 或用户可见行为
   - 发现 scope 扩大
   - 测试失败且无法确定原因
   - 存在多个合理实现方案且取舍会影响维护成本或业务行为

3. 提问时不要泛泛地问“你想怎么做”。
   请按照以下格式提出问题：

【需要确认的问题】
问题 1：
- 当前观察：
- 不确定点：
- 为什么重要：
- 选项：
  A.
  B.
  C.
- 我的建议：
- 默认假设：

4. 每次最多问 3-5 个问题。
5. 如果某个问题可以用项目已有模式合理推断，请直接采用默认假设，并记录在 plan 或 spec 中。
6. 如果问题会影响安全、数据、权限、API、兼容性或发布风险，不能使用默认假设，必须等待人工确认。
7. 在我回答后，请更新对应的 plan 或 spec，再继续执行。
```

---

## 8. 关键步骤专用 Prompt

### 8.1 Issue 创建前 HITL Prompt

```text
请基于当前 plan，先不要创建 issue。
请检查这个 plan 是否已经足够转化为 GitHub issue。

请重点判断：
1. 问题是否清楚？
2. 目标是否清楚？
3. scope 和 out-of-scope 是否清楚？
4. acceptance criteria 是否可验证？
5. 是否存在高风险改动？
6. 是否需要拆成多个 issue？
7. 是否有必须人工确认的业务或技术决策？

请输出：
- 我理解的任务目标
- 已明确的信息
- 缺失或模糊的信息
- 建议创建的 issue 标题
- 建议 issue body
- 是否建议拆分 issue
- 需要我确认的 3-5 个关键问题

每个问题请包含：
- 为什么这个问题会影响后续执行
- 可选方案
- 你的推荐选项
```

---

### 8.2 Branch 创建前 HITL Prompt

```text
请在创建 branch 前进行检查。

请基于 issue 和 plan 判断：
1. 应该从哪个 base branch 创建？
2. branch 类型是什么？feature / fix / chore / refactor / docs / test
3. branch name 应该是什么？
4. 这个任务是否应独立成一个 branch？
5. 是否存在和其他进行中任务冲突的风险？

请输出：
- 推荐 base branch
- 推荐 branch name
- 命名理由
- 是否需要先同步最新 base branch
- 是否需要我确认

如果存在以下情况，请暂停向我确认：
- 不确定 base branch
- 任务可能影响 release branch
- 任务和其他分支存在潜在冲突
- 任务 scope 太大，可能需要拆分
```

---

### 8.3 Repo Scan / Plan Review Prompt

```text
请基于当前 issue、plan 和项目代码现状进行 Repo Scan。

你的任务不是直接编码，而是验证 plan 是否适合当前项目。

请检查：
1. 相关代码入口在哪里？
2. 是否已有类似实现可以复用？
3. plan 是否遗漏了必要模块？
4. plan 是否与现有架构冲突？
5. 是否涉及 API、数据结构、权限、配置、依赖、测试、文档？
6. 是否存在潜在破坏性改动？
7. 是否需要先补测试或先做 spike？
8. 是否需要拆分任务？
9. 是否需要人工确认？

请输出：
- 当前代码现状摘要
- plan 与代码现状的一致点
- plan 的遗漏点
- 潜在风险
- 建议更新后的 plan
- 需要写入 /plans 的最终 plan 内容
- 是否可以进入 spec 阶段

如果存在高风险或多方案选择，请暂停并向我提出 3-5 个关键问题。
每个问题包含：
- 当前观察
- 不确定点
- 可选方案
- 推荐方案
- 不确认的风险
```

---

### 8.4 Plan Approval HITL Prompt

```text
我已经完成 plan review，并基于项目现状更新了 plan。

请你确认是否可以进入 spec 阶段。

请重点确认：
1. 目标是否正确？
2. scope 是否正确？
3. out-of-scope 是否正确？
4. 执行顺序是否合理？
5. 风险是否被识别？
6. 是否需要拆分任务？
7. 是否有必须先确认的技术决策？

我将输出：
- 最终 plan 摘要
- 高风险点
- 我建议采用的默认假设
- 需要你确认的问题

只有当你确认后，我才进入 spec 编写。
```

自动化规则版本：

```text
如果所有风险均为低风险，并且没有 API、数据、权限、安全、生产配置变更，可以自动进入 spec。
否则必须暂停确认。
```

---

### 8.5 Spec 编写 Prompt

```text
请根据已确认的 plan 编写 spec。

请不要直接编码。

Spec 必须包含：
1. 背景与目标
2. 用户或系统场景
3. 功能需求
4. 非功能需求
5. 输入与输出
6. API / interface / schema 变化
7. 数据结构变化
8. 错误处理
9. 边界条件
10. 兼容性要求
11. 测试策略
12. 验收标准
13. 不做什么
14. 风险与回滚
15. 需要人工确认的问题

请基于当前代码现状 review spec：
- 是否符合现有架构？
- 是否遗漏测试场景？
- 是否存在破坏性变更？
- 是否需要更新文档？
- 是否需要拆分实现？

最后把 spec 写入对应文件夹，并说明文件路径。
如果存在必须确认的问题，请暂停，不要进入编码。
```

---

### 8.6 Spec Review HITL Prompt

```text
我已经根据 plan 和项目代码现状编写了 spec。
请在进入编码前确认以下内容。

请你重点确认：
1. 需求行为是否正确？
2. 输入输出是否正确？
3. API / schema / interface 设计是否正确？
4. 错误处理是否符合预期？
5. 边界条件是否完整？
6. 测试策略是否足够？
7. 是否允许修改现有行为？
8. 是否有不能触碰的模块、文件或依赖？

请输出：
- spec 摘要
- 与 plan 的对应关系
- 可能影响实现的关键决策
- 我建议采用的默认方案
- 需要你确认的问题

请等待我确认后再开始编码。
```

---

### 8.7 编码中 Scope Drift HITL Prompt

```text
在实现过程中，如果发现实际情况与 spec 或 plan 不一致，请暂停并执行以下流程。

请输出：
- 原 plan/spec 的假设
- 当前代码中发现的事实
- 差异点
- 影响范围
- 可选处理方案
- 推荐方案
- 是否需要更新 plan/spec
- 是否需要拆分新的 issue

以下情况必须暂停：
1. 需要修改超出 spec 的文件或模块
2. 需要改变公共 API
3. 需要修改数据结构
4. 需要引入新依赖
5. 需要删除或替换已有逻辑
6. 发现测试无法按原方案通过
7. 发现原方案可能造成安全、性能或兼容性问题

请向我提出最多 3 个关键问题，并等待确认。
```

---

### 8.8 提交前 Self-review Prompt

```text
请在提交改动前进行 self-review。

请检查：
1. 本次改动是否完全对应 spec？
2. 是否有超出 scope 的改动？
3. 是否改变了用户可见行为？
4. 是否改变了 API、schema、权限、配置或依赖？
5. 是否有未处理的边界条件？
6. 是否有潜在安全问题？
7. 是否有 hardcode、重复逻辑、死代码、调试代码？
8. 是否需要更新文档？
9. 是否需要新增或更新测试？
10. 是否已经运行必要检查？

请输出：
- 改动文件列表
- 每个文件为什么被修改
- 与 acceptance criteria 的对应关系
- 已运行的检查及结果
- 未运行检查及原因
- 风险清单
- 是否建议提交

如果存在中高风险，请暂停并向我确认。
如果风险低，请给出建议 commit message。
```

---

### 8.9 Commit Prompt

```text
请基于当前 diff 生成 commit 方案。

要求：
1. commit message 简洁、准确
2. 能体现本次改动目的
3. 如适用，关联 issue 编号
4. 如果改动可以拆成多个逻辑提交，请建议拆分
5. 不要把无关改动放入同一个 commit

请输出：
- 是否建议单个 commit 或多个 commit
- 每个 commit 包含哪些文件
- 每个 commit message
- 拆分理由
- 是否存在不应提交的文件

如果发现临时文件、敏感信息、无关修改，请暂停并提醒我。
```

---

### 8.10 Push 前 HITL Prompt

```text
请在 push 到 GitHub 前做最终检查。

请确认：
1. 当前 branch 是否正确？
2. base branch 是否正确？
3. 是否已经同步最新 base？
4. 是否有未提交文件？
5. 是否有不应提交的文件？
6. 是否包含 secret、token、个人信息或本地配置？
7. 是否已经运行必要测试？
8. 是否存在需要先让我确认的风险？

请输出：
- 当前 branch
- 即将 push 的 commits
- 检查结果
- 风险判断
- 是否可以 push

如果发现敏感信息、错误分支、测试失败或高风险改动，请暂停。
```

---

### 8.11 PR 创建 Prompt

```text
请基于 issue、plan、spec、commit history 和当前 diff 生成 PR 内容。

PR 内容必须包含：
1. Summary：本次改动做了什么
2. Problem：解决了什么问题
3. Changes：主要改动点
4. Acceptance Criteria Mapping：如何满足验收标准
5. Tests：已运行哪些测试，结果如何
6. Screenshots / Logs：如适用
7. Risks：潜在风险
8. Rollback Plan：如何回滚
9. Related Issue：关联 issue
10. Related Plan / Spec：关联 plan 和 spec 文件路径
11. Review Focus：希望 reviewer 重点看什么
12. Out of Scope：本次没有做什么

请同时判断：
- 这个 PR 是否过大，需要拆分？
- 是否应该先作为 draft PR？
- 是否需要指定 reviewer？
- 是否需要更新 issue 状态？

如果 PR 存在中高风险，请在 PR body 中明确标注。
```

---

### 8.12 PR Review Response Prompt

```text
请根据 PR review comments 帮我制定处理方案。

请逐条分析 reviewer 的意见：
1. reviewer 说了什么？
2. 这是 bug、建议、风格问题、架构问题，还是需求问题？
3. 是否必须修改？
4. 是否影响 plan 或 spec？
5. 建议如何回应？
6. 需要修改哪些文件？
7. 修改后需要重新运行哪些测试？

请输出：
- review comment 分类
- 处理优先级
- 修改计划
- 建议回复文案
- 是否需要更新 plan/spec
- 是否需要我确认

如果 reviewer 的意见会改变需求、API、schema、权限或用户行为，请暂停并让我确认。
```

---

### 8.13 Merge 前 HITL Prompt

```text
请在 merge 前做最终 gate 检查。

请确认：
1. PR 是否链接了正确 issue？
2. acceptance criteria 是否全部满足？
3. required checks 是否通过？
4. review comments 是否全部处理？
5. 是否存在 unresolved conversation？
6. 是否存在 merge conflict？
7. 是否需要 rebase 或同步 base？
8. 是否有发布、部署或迁移步骤？
9. 是否有 rollback plan？
10. 是否需要 post-merge 验证？

请输出：
- Merge readiness：Ready / Not Ready
- 未完成事项
- 风险
- 推荐 merge 方式：merge / squash / rebase
- merge 后需要执行的动作

如果 checks 未通过、review 未完成、风险未确认，不要 merge。
```

---

### 8.14 Post-merge Prompt

```text
请在 PR merge 后完成收尾检查。

请执行或生成：
1. 确认 issue 是否关闭
2. 确认 branch 是否需要删除
3. 确认是否需要发布或部署
4. 确认是否需要 smoke test
5. 确认是否需要更新文档、changelog、release note
6. 记录本次任务中的偏差、风险和经验
7. 如 plan/spec 有变更，确认最终版本已保存

请输出：
- Post-merge checklist
- 验证结果
- 是否有 follow-up issue
- 复盘摘要
```

---

## 9. 推荐的项目文件结构

### 方案一：根目录集中管理

```text
/
├── plans/
│   └── 123-ai-demand-parser-plan.md
├── specs/
│   └── 123-ai-demand-parser-spec.md
├── docs/
│   └── ...
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
```

### 方案二：按 feature 管理

```text
/
├── features/
│   └── ai-demand-parser/
│       ├── plan.md
│       ├── spec.md
│       ├── test-plan.md
│       └── decisions.md
```

---

## 10. 推荐 Plan 模板

```markdown
# Plan: <title>

## Metadata
- Issue:
- Branch:
- Owner:
- Risk Level: Low / Medium / High
- Status: Draft / Approved / In Progress / Done

## Goal
本任务要达成什么结果？

## Context
当前背景、相关代码、相关文档、历史约束。

## Scope
本次包含什么？

## Out of Scope
本次不包含什么？

## Current State
基于 repo scan 发现的当前项目状态。

## Proposed Steps
1.
2.
3.

## Files Likely to Change
- path/to/file
- path/to/file

## Risks
| Risk | Impact | Mitigation |
|---|---|---|

## HITL Checkpoints
- [ ] Plan approval
- [ ] Spec approval
- [ ] Pre-commit review
- [ ] Pre-merge review

## Acceptance Criteria
- [ ]
- [ ]

## Test Strategy
- Unit:
- Integration:
- E2E:
- Manual:

## Rollback Plan
如果失败，如何回滚？

## Open Questions
- [ ]
```

---

## 11. 推荐 Spec 模板

```markdown
# Spec: <title>

## Related
- Issue:
- Plan:
- Branch:

## Objective
要实现的具体能力。

## Requirements

### Functional Requirements
- FR1:
- FR2:

### Non-functional Requirements
- Performance:
- Security:
- Compatibility:
- Observability:

## Input
输入是什么？

## Output
输出是什么？

## Behavior
正常情况、异常情况、边界情况。

## API / Interface Changes
是否新增或修改接口？

## Data Model Changes
是否涉及 schema、migration、cache、index？

## Error Handling
错误如何处理？

## Permission / Security
是否涉及权限、安全、敏感数据？

## Acceptance Criteria Mapping
| AC | Spec Behavior | Test |
|---|---|---|

## Test Cases
- [ ] case 1
- [ ] case 2

## Out of Scope
本次不做什么？

## Risks
潜在风险。

## Open Questions
需要人工确认的问题。
```

---

## 12. 最终推荐流程

```text
0. 明确目标、范围、验收标准、风险等级
1. 创建 issue
2. 从最新 base branch 创建并关联 branch
3. Repo scan：检查代码、文档、测试、依赖、CI、风险
4. 更新 plan，写入 /plans
5. HITL：确认 plan
6. 编写 spec，写入 /specs 或对应 feature 文件夹
7. HITL：确认 spec
8. 根据 spec 编码
9. 编码中如发现 scope drift，暂停 HITL
10. 本地验证：test / lint / typecheck / build / security check
11. AI self-review：diff、scope、风险、文档、测试
12. HITL：中高风险改动提交前确认
13. commit
14. push
15. 创建 PR，链接 issue、plan、spec，填写测试和风险
16. 处理 CI 和 review comments
17. HITL：merge 前确认
18. merge
19. post-merge 验证、清理 branch、关闭 issue、复盘
```

---

## 13. 核心原则

最重要的规则是：

```text
低风险、可逆、符合现有模式的事项，AI 可以自主推进；
高风险、不可逆、影响用户行为、数据、API、权限、安全或发布的事项，AI 必须暂停并请求人工确认。
```

不要让 AI 泛泛地问：

```text
你想怎么做？
```

而是让 AI 结构化地问：

```text
我观察到什么？
我不确定什么？
为什么重要？
有哪些选项？
我推荐哪个？
如果不确认会有什么风险？
```

这样，HITL 才不会变成低效打断，而会成为工程风险控制机制。
