# Sequence Diagram — 时序图绘制

> 〔命名规范见 `domain-acquisition.md` §6〕规范名 **〔行为〕时序图·<用例>**；slug `dyn-sequence-<用例>`（行为正交轴，无缩放层级）。每张图须紧跟 `sequenceDiagram` 落 `%% Name` / `%% Slug`（见骨架）。

## 框架定位

- **4+1 视图**：Process（运行时视图）
- **C4 定位**：Dynamic Diagram（**C4 supporting diagram，非 Context/Container/Component/Code 核心层级图**；**跨 L1–L3 的正交视角**，同一系统可在不同层级各画一张：容器间时序、组件间时序）
- **主要受众**：性能工程师 / SRE / 测试 / 业务流参与者 / 安全审计
- **使用场景**：
  - 复杂流程梳理、SLA 推演、故障复盘、并发评审、HITL 卡点设计
  - **作为 Scenarios 视图的验证机制**——异常流、超时、并发、降级各画一张专项 Sequence
  - 与 Context 图配对：Context 图承载**业务入口场景**，Sequence 图承载**运行时关键场景**

**与 Context 图的分工**：Context 图无法承担 Scenarios 视图的"验证"职责（识别架构元素 + 验证四视图）。运行时关键场景必须由专项 Sequence 图承担，否则 Scenarios 验证视角会丢失。这是新版方法论 §4 明确的分工。

## 必含元素

1. **一个且仅一个**核心用例（一张图只讲一件事）
2. 所有参与该用例的容器 / 组件作为 participant（与 Container / Component 图一致）
3. 时间从上往下流，消息严格按时间顺序排列
4. 同步 / 异步**严格视觉区分**
5. 关键决策点和分支（用 alt / opt / par）
6. 重要的错误路径（如果对推理关键）
7. 关键超时 / 重试 / HITL 中断点

## 禁含元素

- ❌ 多个独立用例混在一张图（happy path 和 error path 应分两张）
- ❌ 静态结构信息（参与者之间的依赖关系——那是 Container / Component 图）
- ❌ 部署节点信息（在哪个 Pod 跑——那是 Deployment 图）
- ❌ 同步 / 异步使用同一种箭头（**致命错误**，会误导性能分析）

## 边的语义规则（严格使用 Mermaid 语法）

| Mermaid 语法 | 视觉 | 语义 |
|------------|-----|-----|
| `A->>B` | 实线 + 实心箭头 | **同步调用**，调用方阻塞等待 |
| `A-->>B` | 虚线 + 实心箭头 | **同步返回值** |
| `A-)B` | 实线 + 开口箭头 | **异步消息**，fire-and-forget |
| `A--)B` | 虚线 + 开口箭头 | **异步响应**（如果有） |
| `A-xB` | 实线 + X | **失败消息**（超时 / 异常） |

标签 = 方法名 / 消息名 + 关键参数。

### Legend 不强制（与 Container / Component / Deployment 不同）

Sequence 图箭头是 Mermaid `sequenceDiagram` 的**工具原生语义**，按新版方法论 §5.0 **不强制附 legend**。

Container / Component / Deployment 图的"用 `-.->` 或 `==>` 必须附 legend"规则在此**不适用**——那些是团队约定语义，本图是工具原生语义。如果用户对箭头不熟悉，可在图旁附简短说明，但不是强制要求。

### ADR 引用规则

关键决策点（用 `Note over X: ...` 标注的）建议引用 `[ADR-N]`：

```text
Note over B: 检测到超时，进入降级路径 [ADR-018]
```

特别是以下情况**强烈建议**附 ADR：

- HITL 卡点（为什么人在回路）
- 降级 / 熔断决策
- 超时阈值
- 并发控制策略
- 重试策略

## Mermaid 输出格式

- 图类型：`sequenceDiagram`
- 人类用 `actor`，系统用 `participant`
- 用 `Note over X: ...` 标注关键决策、超时、约束（可附 ADR 引用）
- 用 `alt / else / end` 表示分支
- 用 `opt` 表示可选步骤
- 用 `par` 表示并行
- **图名与 slug**（命名见 `domain-acquisition.md` §6）：紧跟 `sequenceDiagram` 落 `%% Name: 〔行为〕时序图·<用例>` / `%% Slug: dyn-sequence-<用例>`（用例名转 kebab）

## 自检清单

- [ ] 一张图只讲了一个用例？没塞多个流程？
- [ ] 同步和异步的箭头样式严格区分了？
- [ ] 每条消息都有名字和必要参数？
- [ ] 关键超时 / 重试 / HITL 卡点显式标注了？
- [ ] participant 列表跟对应的 Container 图一致？（命名对得上）
- [ ] 消息条数 ≤ 20？（太多就该拆成多个用例分图）
- [ ] 关键决策点引用了 ADR？
- [ ] 图块紧跟 `sequenceDiagram` 有 `%% Name:` / `%% Slug:` 两行（命名见 `domain-acquisition.md` §6）？

## 输出骨架模板

````text
sequenceDiagram
    %% Name: 〔行为〕时序图·<用例>
    %% Slug: dyn-sequence-<用例>
    actor U as 用户
    participant A as 服务 A
    participant B as 服务 B
    participant DB as 数据库
    participant NotifySvc as 通知服务

    U->>A: 发起请求(参数)
    A->>B: 同步调用(参数)
    B->>DB: SELECT 查询
    DB-->>B: 结果集
    Note over B: 关键决策点 [ADR-012]
    alt 校验通过
        B-->>A: 200 + 数据
        A-->>U: 响应
    else 校验失败
        B-xA: 422 错误
        A-->>U: 错误信息
    end
    A-)NotifySvc: 异步通知
````

## 信息获取要点（针对本图）

> 获取阶梯（L0 声明扫描 → L1 结构推断 → L2 命名归类 → L3 HITL）定义见 `domain-acquisition.md` §3；下方「Layer 0 重点抽」即本图型的 L0 源清单。

**Layer 0 重点抽**：

- `openapi.yaml` / `*.proto` → 接口定义可推断参数与同步/异步
- 业务代码中的 `@router.post(...)` / `@app.route(...)` → 端点 → 推断用例
- `tests/integration/` → 测试用例往往直接对应核心业务流
- 文档中已有的时序图 / 业务流程描述

**典型 HITL 问题**（针对本图最常缺失的字段）：

```
Q1（开放带示例）：要画哪个用例的时序图？
   （例：用户登录、订单创建、AI 查询的完整链路）

Q2（开放结构化）：这个用例涉及哪些参与者？每行一个：
   ___
   （提示：跟 Container 图的服务对得上）

Q3（纯选项）：错误 / 异常路径要不要画？
   (a) 只画 happy path
   (b) Happy path + 主要错误分支（alt/else）
   (c) 重点画错误处理（用于故障复盘）
```

## 常见错误深度提醒

**致命错误：同步异步混淆**

如果一张时序图全用 `->>` 实线箭头，等于在告诉读者"所有调用都是同步阻塞的"——这会让性能优化的人完全误判系统行为。**异步调用必须用 `-)` 开口箭头**。

**致命错误：多个用例混塞**

"用户下单 + 退款 + 取消订单"塞一张图，分支多到无人能读。应拆 3 张，每张一个用例。

**软错误：参与者命名不一致**

时序图里的 `API` 和 Container 图里的 `order-api` 必须能对应起来。命名一致才能让两张图互相验证——这是 Scenarios 视图"验证机制"职责的落地。命名建议直接沿用 Container 图里的"业务名（代码别名）"形式：`participant OrderAPI as 订单服务（order-api）`。
