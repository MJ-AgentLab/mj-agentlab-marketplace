# State Machine Diagram — 状态机图绘制

> 〔命名规范见 `domain-acquisition.md` §6〕规范名 **〔行为〕状态机图·<owner>**；slug `dyn-state-<owner>`（行为正交轴，无缩放层级；owner = 状态拥有者）。每张图须紧跟 `stateDiagram-v2` 落 `%% Name` / `%% Slug`（见骨架）。

## ⚠️ Pre-check：状态拥有者唯一性（每张图开头第 1 步，强制）

每张状态机图开头必须用 Mermaid 注释**显式声明唯一的状态拥有者**，**一张图只能有一个状态拥有者**：

```text
%% State Machine Owner: AgentSession（mj-agent Text-to-SQL 会话）
%% Scope: 单次自然语言查询从提交到结果返回的完整生命周期
```

### 为什么必须先声明（核心约束）

状态机图最高频、最隐蔽的退化方式是：把多个对象的生命周期混塞进一张图（例如把 `User`、`Order`、`Payment` 的状态画在一起），最终退化成一张"伪流程图"。一旦状态拥有者不唯一，"哪些状态合法、哪些转换非法"这个核心审查能力立刻失效——因为读者无法判断某个状态属于谁。

**判别原则**：如果你发现自己想在一张图里画"A 完成后 B 才开始"，那是**两个状态机 + 一条跨机事件**，应拆成两张图，用 Sequence 图或事件标签表达它们之间的关系，而不是塞进同一张状态机。

---

## 框架定位

- **4+1 视图**：**Logical + Process**（双视角，按建模对象决定主次）
  - DDD 聚合根 / 业务实体 / 数据对象生命周期：**Logical 为主，Process 为辅**
  - Workflow / Agent Session / Job execution / ETL run：**Process 为主，Logical 为辅**
  - 原因：**状态本身**是对象的稳定语义（偏 Logical），**状态转换**由事件/条件/超时/HITL 触发（偏 Process）
- **C4 定位**：**扩展支撑图（C4 supporting diagram, extension）** —— **非 Context/Container/Component/Code 核心层级图**；跨 L1–L3 的正交行为视角，具体层级由"状态拥有者"决定
- **核心动词**（与其余图并列，完整七动词见方法论 §六）：
  - Context 谈关系 · Container 谈协议 · Component 谈依赖/协作 · Code 谈类关系 · Sequence 谈时序 · Deployment 谈路径
  - **State Machine 谈生命周期与合法转换**
- **主要受众**：DDD 实践者 / Workflow & Agent 设计者 / QA & 测试设计者 / 产品经理 / 业务规则评审者 / SRE（尤其关注重试、超时、降级、终止状态）
- **使用场景**：
  - DDD 聚合根生命周期建模
  - LangGraph / workflow / agent session 状态建模
  - ETL / job / batch lifecycle 建模
  - HITL、重试、降级、补偿、人工 override 设计
  - 非法转换识别、状态覆盖测试
  - 业务规则评审

### 与 Sequence 图的对偶关系（重要）

State Machine 与 Sequence 同属运行时行为视角，是**对偶子视角**，互相验证而非互相替代：

| 图 | 关注对象 | 关注范围 | 主要问题 |
|---|---|---|---|
| **Sequence** | 多个参与者 | 一次场景 / 一次交互 | 谁在什么时候给谁发了什么消息？ |
| **State Machine** | **单一状态拥有者** | **全生命周期** | 这个对象能处于哪些状态？哪些转换合法？哪些非法？ |

互检规则见本文 §"与 Sequence 图的互检规则"。

## 必含元素

1. **唯一状态拥有者**（见 Pre-check，强制；写在注释或标题中）
2. **初始状态**：`[*] --> InitialState`
3. **至少一个终止状态**：正常 `Completed --> [*]`、异常 `Failed --> [*]`、取消 `Cancelled --> [*]`
4. **稳定状态**：状态应是"可停留"的业务/运行时语义，**不是一次性动作名**（命名规则见下）
5. **转换**：每条普通转换必须标注触发事件（标签语法见下）
6. **守卫条件**：用 `[condition]` 表示关键分支，例 `timeout [retry_count < max_retry]`
7. **关键副作用**：用 `/ action` 表示，例 `/ persist_result`、`/ emit_dataref`、`/ acquire_lock`
8. **异常路径**：`Failed` / `Retrying` / `Degraded` / `Suspended` / `Cancelled` / `Expired` 等不能省略
9. **HITL 卡点**：`WaitingForApproval` / `SuspendedForReview` 等必须画成**显式状态**，不能只是 Sequence 里的一个 note
10. **关键转换的 ADR 引用**（分类规则见下）

## 禁含元素

- ❌ **多个状态拥有者混在一张图**（最致命错误，见 Pre-check）
- ❌ **把动作当状态**：`Validate` / `Route` / `Execute` 是动作；状态应写成 `Validating` / `Routed` / `Executing`
- ❌ **把 Sequence 步骤搬进状态机**：状态机不是"第 1 步、第 2 步、第 3 步"
- ❌ 把 Container / Component 节点画进状态机（状态机的节点是**状态**，不是服务/模块/数据库）
- ❌ 把物理部署、Pod、VPC、端口画进状态机（那是 Deployment 图）
- ❌ **无事件转换**：除初始转换外，普通转换不应只有箭头没有触发事件
- ❌ **只有 happy path**：没有 `Failed` / `Cancelled` / `Timeout` / `Retry` 的状态机通常不可评审
- ❌ **状态爆炸后仍强行画一张大图**：状态数 > 12~15 时，应改用 composite state 或拆子状态机
- ❌ **history state（shallow/deep history pseudostate）作为默认能力**：当前 Mermaid 渲染链路支持不稳定，除非你确认本地工具链支持，否则不要写进图

## 状态命名规则（强制）

| 反例（动作 / 步骤） | 正例（稳定状态） | 说明 |
|---|---|---|
| `Validate` | `Validating` / `Validated` | 用进行时（正在）或完成时（已完成），不用祈使动词 |
| `Route` | `Routed` | 状态描述"对象处于什么状况"，不是"对象在做什么动作" |
| `SendNotification` | `NotificationPending` / `Notified` | 动作放到转换的 `/ action`，不放到状态名 |

**判别口诀**：状态名能填进"对象现在**处于** ___ 状态"才合格。`Executing`（正在执行中）合格，`Execute`（执行这个动作）不合格。

## 转换标签语法（边的语义规则，强制）

状态机的所有转换在 `stateDiagram-v2` 里都是 `-->`（工具原生语义），**差异完全通过标签表达**。标签统一采用 UML 经典语法：

```text
event [guard] / action [ADR-N]
```

| 成分 | 含义 | 是否必需 | 示例 |
|---|---|---|---|
| `event` | 触发转换的事件 / 信号 | **普通转换必需**（初始转换除外） | `db_timeout`、`approval_granted` |
| `[guard]` | 守卫条件，决定该转换是否可发生 | 有分支时必需 | `[retry_count < max_retry]` |
| `/ action` | 转换发生时的副作用 | 有关键副作用时必需 | `/ schedule_retry`、`/ emit_dataref` |
| `[ADR-N]` | 决策记录引用 | 见 ADR 规则 | `[ADR-021]` |

完整示例：

```text
Executing --> Retrying: db_timeout [retry_count < max_retry] / schedule_retry [ADR-019]
```

读法：在 `Executing` 状态下，发生 `db_timeout` 事件，且 `retry_count < max_retry` 成立时，执行 `schedule_retry` 副作用，转入 `Retrying`，该决策见 ADR-019。

### Legend 不强制（与 Sequence 图一致）

状态机箭头是 `stateDiagram-v2` 的**工具原生语义**（所有转换都是 `-->`，无团队约定线型），按方法论 §5.0 **不强制附 legend**——这与 Sequence 图同理，与 Container/Component/Deployment 图的"团队约定线型必须附 legend"规则**不适用于本图**。差异全部通过转换标签的 `event [guard] / action` 表达。

## ADR 引用规则（状态转换类 ADR）

方法论现有 ADR 规则覆盖了 Deployment 的合规边/跨边界边/跨副本同步边。状态机图**新增一类「状态转换类 ADR」**，下列转换类型**必须**引用 `[ADR-N]`：

| 转换类型 | ADR 是否必需 | 示例 |
|---|---:|---|
| HITL 暂停 / 恢复 | **必须** | `Executing --> WaitingForApproval: interrupt [risk_high] [ADR-021]` |
| 降级 / fallback | **必须** | `Executing --> Degraded: llm_timeout / fallback_to_cache [ADR-018]` |
| 重试策略 | **必须** | `FailedAttempt --> Retrying: retry [count < 3] [ADR-019]` |
| 不可逆终止 | **必须** | `Approved --> Completed: commit / persist_final [ADR-022]` |
| 人工 override | **必须** | `Failed --> Reopened: manual_override [ADR-023]` |
| 合规 / 风控状态 | **必须** | `PendingReview --> Blocked: policy_violation [ADR-024]` |
| 普通业务转换 | 可选 | `Received --> Validating: submit` |

**原理**：这六类转换都是"为什么系统会在这里停 / 退 / 绕路"的设计决策点，缺 ADR 会让评审和故障复盘成本指数级上升。它们恰好对应 mj-agent 已有的核心决策（HITL 卡点、降级路径、重试策略、dataRef 物理链隔离的不可逆终止等）。

## 与 Sequence 图的互检规则

状态机图与 Sequence 图必须双向可追溯，这是 Scenarios 视图"验证机制"在生命周期维度的延伸：

```text
Sequence 图里的每个关键状态变化
  ↓ 必须能在
State Machine 图里找到对应 transition

State Machine 图里的每个关键 transition
  ↓ 必须能追溯到
某个外部/内部事件 · 某个定时器/超时 · 某个 HITL 操作
· 某个 Sequence 场景 · 某个测试用例 · 某个 ADR
```

这条规则能挡住两类常见错误：

1. **Sequence 图里凭空写状态变化**：如 `Note over Agent: 进入降级模式`，但状态机里根本没有 `Executing --> Degraded` 这条转换。
2. **状态机图里有无人触发的转换**：如 `WaitingForApproval --> Executing`，但没有任何 Sequence、API、HITL 操作或事件能触发它（死转换）。

四视图分工补强后的全貌：

```text
Scenario / Sequence   验证一次交互是否成立
State Machine         验证整个生命周期是否合法
ADR                   解释关键转换为什么这么设计
Test Case             验证合法 / 非法转换是否被覆盖
```

## Mermaid 输出格式

- 图类型：**`stateDiagram-v2`**（不用旧版 `stateDiagram`）
- 第 1~2 行注释声明**状态拥有者 + Scope**（Pre-check 强制）
- 初始 / 终止：`[*]`
- 转换标签统一 `event [guard] / action [ADR-N]`
- 复合状态（状态多时）：`state Parent { ... }`
- 并发区域：`state Fork <<fork>>` / `<<join>>`，或 composite state 内用 `--` 分隔并发区
- 选择伪状态：`state Choice <<choice>>`
- 关键约束 / 决策说明：`note right of State: ...`
- **不强制 legend**（工具原生语义，见上）
- **不使用 history state** 作为默认能力（渲染支持不稳定）
- **图名与 slug**（命名见 `domain-acquisition.md` §6）：紧跟 `stateDiagram-v2` 落 `%% Name: 〔行为〕状态机图·<owner>` / `%% Slug: dyn-state-<owner>`（owner 转 kebab；与下方 `%% State Machine Owner` 一致）

## 自检清单

输出前在内部跑一遍，✗ 项必须修正或在元信息里解释：

- [ ] 一张图是否只有**一个**状态拥有者？拥有者是否明确写在注释/标题中？
- [ ] 有初始状态 `[*]`？
- [ ] 有一个或多个终止状态？
- [ ] 状态名是**稳定状态**而非动作步骤？（能填进"处于 ___ 状态"？）
- [ ] 每条普通转换都有**触发事件**？（初始转换除外）
- [ ] 关键分支转换有 **guard**？
- [ ] 有副作用的转换写了 `/ action`？
- [ ] 显式画出了**失败 / 取消 / 超时 / 重试 / 降级**路径？
- [ ] HITL 卡点是**明确状态**，而不是 Sequence 里的一个 note？
- [ ] HITL / 降级 / 重试 / 不可逆终止 / override / 合规风控转换都**引用了 ADR**？
- [ ] Sequence 图里的状态变化都能**映射到本图的 transition**？
- [ ] 是否存在**无法触发的状态**（reachability）？
- [ ] 是否存在**无法离开的非终止状态**（liveness / 死锁状态）？
- [ ] 非法转换是否被测试覆盖？
- [ ] 状态数 ≤ 15？超过则用 composite state 或拆子状态机？
- [ ] 顶层语法是 `stateDiagram-v2`？
- [ ] 图块紧跟 `stateDiagram-v2` 有 `%% Name:` / `%% Slug:` 两行（命名见 `domain-acquisition.md` §6）？

## 输出骨架模板（worked example：mj-agent AgentSession）

> 说明：本示例对应 mj-agent 一次 Text-to-SQL 会话的完整生命周期，串起了
> dataRef 物理链隔离、五层实体解析、aggregate-first 结果处理、商业数据匿名化
> （静态码本）、HITL 卡点、降级与重试等既有架构决策。
> **示例中的 ADR 编号为占位**，落地时请替换为 mj-agent 真实 ADR 台账编号；
> 唯一确定的是 ADR-000（最小必要外发 / 通道隔离 / 工具中介三原则）。

````text
stateDiagram-v2
    %% Name: 〔行为〕状态机图·AgentSession
    %% Slug: dyn-state-agentsession
    %% State Machine Owner: AgentSession（mj-agent Text-to-SQL 会话）
    %% Scope: 单次自然语言查询从提交到结果返回的完整生命周期
    %% Transition Label: event [guard] / action [ADR-N]

    [*] --> Received: submit_nl_query

    Received --> Validating: start_validation
    Validating --> Rejected: auth_failed [not_in_employee_scope] / log_denial [ADR-000]
    Validating --> Resolving: auth_ok [in_employee_scope]

    Resolving --> Generating: entities_resolved / build_query_plan
    Resolving --> Failed: resolution_failed / record_error

    Generating --> WaitingForApproval: plan_ready [risk_high] / create_hitl_task [ADR-021]
    Generating --> Executing: plan_ready [risk_low] / dispatch_sql

    WaitingForApproval --> Executing: approval_granted / dispatch_sql [ADR-021]
    WaitingForApproval --> Cancelled: approval_rejected / discard_plan [ADR-021]
    WaitingForApproval --> Expired: approval_timeout [waited > sla] / discard_plan

    Executing --> Retrying: db_timeout [retry_count < max_retry] / schedule_retry [ADR-019]
    Retrying --> Executing: retry_due
    Executing --> Degraded: db_timeout [retry_count >= max_retry] / fallback_to_cache [ADR-018]

    Executing --> Aggregating: rows_returned / aggregate_first [ADR-007]
    Degraded --> Aggregating: cache_hit / aggregate_first
    Degraded --> Failed: cache_miss / record_error

    Aggregating --> Anonymizing: aggregated / apply_static_codebook [ADR-011]
    Anonymizing --> Completed: anonymized / emit_dataref [ADR-005]

    note right of Anonymizing: 商业数据匿名化（静态码本）\n结果经 dataRef 物理链隔离返回

    Completed --> [*]
    Failed --> [*]
    Cancelled --> [*]
    Rejected --> [*]
    Expired --> [*]
````

**关键点**：
- `WaitingForApproval` 是显式状态（HITL 卡点落地），不是 Sequence 里的一个 note；它有三条出边——批准、拒绝、超时，每条都有事件和 action。
- `Degraded` 状态使降级路径可评审：降级后仍要走 `Aggregating → Anonymizing`，保证"降级结果也必须匿名化"这条合规约束不被绕过。
- `Rejected`（鉴权失败）与 `ADR-000` 三原则直接挂钩——不在员工 scope 内的查询在 `Validating` 阶段即终止。

## 信息获取要点（针对本图）

> 获取阶梯（L0 声明扫描 → L1 结构推断 → L2 命名归类 → L3 HITL）定义见 `domain-acquisition.md` §3；下方「Layer 0 重点抽」即本图型的 L0 源清单。

**Layer 0 重点抽**：

- LangGraph `StateGraph` 定义：`add_node` / `add_edge` / `add_conditional_edges` → 状态与转换的直接来源
- LangGraph `interrupt()` + `Command(resume=...)` 模式 → HITL 卡点状态（`WaitingForApproval` 类）
- 业务代码里的状态枚举 / `status` 字段（`Enum` / `CHECK` 约束 / `state` 列）→ 状态集合
- ORM / DDD 聚合根里的状态转换方法（如 `order.approve()`、`session.suspend()`）→ 合法转换
- DB 里的 `status` 字段 + 状态流转的 `UPDATE ... WHERE status = ...` → 反推合法转换
- `tests/` 里针对状态流转 / 非法转换的测试 → 反推状态机边界
- 现有 Sequence 图里的 `Note over X: 状态变更` → 必须能映射到本图 transition

**典型 HITL 问题**（仅当上述挖不到时）：

```
Q1（开放带示例）：这张状态机的拥有者是谁？（一张图只能有一个）
   （例：AgentSession、CreditQueryRequest、ETLJob、QCMTask）

Q2（开放结构化）：列出该对象的主要稳定状态，每行一个（用进行时/完成时命名）：
   ___
   （提示：Validating 而非 Validate；Routed 而非 Route）

Q3（纯选项）：异常 / 非 happy-path 路径要画到什么程度？
   (a) 只画 happy path（不推荐，通常不可评审）
   (b) Happy path + 主要失败 / 取消 / 超时终止状态
   (c) 完整画出重试 / 降级 / HITL / 补偿等所有异常路径（用于故障复盘 / 合规评审）

Q4（混合）：是否有 HITL / 人工审批卡点？
   (a) 没有
   (b) 有。卡点在哪个状态、谁审批、超时怎么处理？___
```

## 常见错误深度提醒

**致命错误：状态拥有者不唯一**

把多个对象的生命周期混塞一张图，是状态机退化成"伪流程图"的头号原因。一旦拥有者不唯一，"合法/非法转换"的判断失去基准。**先声明拥有者，再画图。**

**致命错误：动作冒充状态**

`Validate`、`Route`、`SendEmail` 是动作，不是状态。动作应放到转换的 `/ action`，状态名用进行时/完成时（`Validating`/`Validated`）。混淆后会让状态机读起来像 Activity 图，丢失"对象处于何种稳定状况"这一核心语义。

**软错误：只画 happy path**

没有 `Failed` / `Cancelled` / `Timeout` / `Retry` / `Degraded` 的状态机，等于没回答"出问题时对象会怎样"——而这恰恰是状态机相对其他图的核心价值。对 mj-agent 这类有 HITL、降级、重试的系统，省略异常路径等于没画。

**软错误：死状态与死转换**

输出前务必跑一遍 reachability（每个状态都能从初始状态到达吗）和 liveness（每个非终止状态都有出边吗）。"无法到达的状态"和"进去就出不来的非终止状态"都是设计缺陷，应在自检阶段发现。
