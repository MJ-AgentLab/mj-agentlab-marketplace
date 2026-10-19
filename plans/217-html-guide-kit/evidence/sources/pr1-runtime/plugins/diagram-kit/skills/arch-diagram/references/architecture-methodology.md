# Architecture Methodology — 共享方法论速查

本文件是 arch-diagram skill 的方法论基础，全部 7 类图（结构缩放轴 L1–L4：Context / Container / Component / Code；正交轴：Sequence / State Machine / Deployment）的绘制 prompt 都基于此。绘图前必读。

> **图型集的分层叙事**（全文统一口径）：日常最高频的是**核心 5 张**——Context / Container / Component / Sequence / Deployment；**状态机图**是行为轴与时序图 co-equal 的独立第 6 类；**代码图（L4）**罕见手绘、是第 7 类。下文 §四主表为保持"最常用对应关系"的可读性，仅列核心 5 张；**完整 7 类的规范图名、slug、视图归属见命名规范唯一事实源 `domain-acquisition.md §6`（§4.2 给出命名的设计依据并指向 §6）**。边语义（§五）覆盖全部 7 类。

## 一、架构的"是什么"——三要素与四要素

### 1.1 三要素（Shaw & Garlan, 1996）

软件架构 = **Components（构件） + Connectors（连接件） + Constraints（约束）**

- **Components**：可独立理解、独立替换的模块（服务、库、子系统）
- **Connectors**：模块之间如何交互（同步调用、消息、共享内存、事件订阅、文件传输）
- **Constraints**：组合不能违反的规则（分层不许反向调用、领域边界不许穿透）

这是架构的**静态骨架**，但不显式建模"行为"和"决策"。

### 1.2 四要素（团队工作定义，受 IEEE 42010 与 ADR 实践启发）

软件架构 = **Structure + Behavior + Constraints + Design Decisions**

- **Structure** = 三要素中的 Components + Connectors（静态拓扑）
- **Behavior** = Connectors 的动态语义（协议、时序、消息流）
- **Constraints** = 同三要素
- **Design Decisions** = 三要素未覆盖的"为什么这么定"（用 ADR 记录）

四要素是三要素的真超集——把"行为"从 Connectors 里拆出来独立讨论，把"决策"从工程师脑子里提升为一等公民。

## 二、架构的"给谁看"——Kruchten 4+1 视图

Philippe Kruchten 1995 年提出，**核心洞察**：架构没法用一张图说清楚，因为看图的人不止一种。

| 视图 | 关注者 | 关注点 | 典型工件 |
|------|--------|--------|----------|
| **Logical** | 终端用户 / 产品 | 系统功能 / 业务对象 | 类图、状态图 |
| **Process** | 系统集成 / 运维 | 并发、性能、扩展性 | 时序图、活动图 |
| **Development** | 程序员 / PM | 代码组织 / 模块依赖 | 包图、组件图 |
| **Physical** | 系统工程师 / 运维 | 部署 / 网络 / 硬件 | 部署图 |
| **Scenarios (+1)** | 所有人 | 用例驱动 + 校验其他四视图 | 用例图 |

Scenarios 是 "+1" 而非第 5 张：它**不描述架构本身**，而是用具体业务场景把其他四张图穿起来，确保它们说的是同一个系统。是验证机制，不是切片。

## 三、架构的"看多细"——C4 模型

Simon Brown 2006 年提出，**按缩放层级**重组架构图。

| 层级 | 关注点 | 工件 |
|------|--------|------|
| **L1 Context** | 系统在世界里的位置 | Context Diagram |
| **L2 Container** | 系统内部的独立 runtime 边界 | Container Diagram |
| **L3 Component** | 单个 container 内部的代码模块 | Component Diagram |
| **L4 Code** | 类级别（极少手画） | UML 类图 |
| **Dynamic** | 运行时行为 | Sequence / Flow Diagram |
| **Deployment** | 部署在哪些机器 | Deployment Diagram |

**关于 Container 的粒度**：C4 的 Container 不是 Docker Container，**核心定义是 runtime boundary**——独立运行的代码执行单位或数据存储，强调"运行边界"而非"部署单位"或"开发模块"。部署粒度是另一个正交问题（在 Deployment 图中表达）。在 Kubernetes 场景下进一步约定：

- 一个 **Deployment / StatefulSet** 对应一个 Container 节点
- **Sidecar**（envoy、log-shipper、配置代理等基础设施附属）**不单独画**，除非承担独立业务职责
- **副本数**通过边标签或节点角标标注，不画多个节点
- **CronJob / Job** 视具体场景判断：长期承担业务职责的画出，临时性运维作业不画

**关于 Dynamic 和 Deployment**：这两者**不是缩放层级**，而是跨 L1–L3 的正交视角——同一系统可在不同层级各画一张 Sequence 图（容器间时序、组件间时序）；Deployment 图通常对应 L2 容器的物理放置。

## 四、三套框架的常见对应关系（非严格等价，**核心**）

| 我们画的图 | C4 层级 | 4+1 视图（主→次）|
|-----------|--------|-------------------|
| **Context Diagram** | L1 | Scenarios + Logical |
| **Container Diagram** | L2 | Logical + Development |
| **Component Diagram** | L3 | Development |
| **Sequence Diagram** | Dynamic | Process |
| **Deployment Diagram** | Deployment | Physical |

观察：

- **Process 和 Physical** 是"独立维度"——运行时和部署位置各自有不可替代的工件，C4 里直接对应到 Dynamic / Deployment。
- **Scenarios / Logical / Development** 是"同一静态结构的不同切面"，C4 把它们按缩放层级（L1 → L2 → L3）重新组合到一起：
  - L1 Context 主要承担 Scenarios + Logical 视角（系统与外界）
  - L2 Container 主要承担 Logical + Development 视角（系统内部大块）
  - L3 Component 主要承担 Development 视角（单个 container 内部代码组织）

**实践启示**：核心 5 张图合起来覆盖 4+1 的全部五个视图，但**不是一对一映射**（状态机图与代码图作为补充，分别强化 Logical+Process 与 Development 视图，完整视图归属见 `domain-acquisition.md §6` 表）：

- **Process、Physical、Scenarios** 各由单张图（Sequence、Deployment、Context）独立承担
- **Logical 视图**被 Context 和 Container 共同切片——前者是系统对外的逻辑边界，后者是系统内部的逻辑分块
- **Development 视图**被 Container 和 Component 共同切片——前者是部署单元粒度，后者是代码模块粒度

所以画图时应记住：**Container 图同时服务 Logical 和 Development 两类读者**，需在抽象层级上做权衡，不能把它当作"纯 Logical"或"纯 Development"图来画。

**操作建议**：Container 图的节点命名兼顾两类读者——业务语义优先（如"订单服务"而非 `order-service-v2`），但保留可追溯到代码仓库的别名（如"订单服务（order-service）"）。一张图，不画两版；如果业务语义和代码模块严重不对齐（如一个微服务承担多个领域），优先按业务语义拆分节点，在 ADR 中记录代码层面的实际归属。

**关于 Scenarios 的承担方式**：Context 图承载业务入口场景，但 Scenarios 作为"验证机制"的职责（驱动识别架构元素 + 验证四视图）**不能完全由 Context 图承担**。落地分工：

- **业务入口场景**——主用户/外部系统如何接触系统，在 Context 图中表达
- **运行时关键场景**——主流程、异常流、超时、并发、降级，**各画一张专项 Sequence 图**
- **场景驱动追溯**——为什么这样设计、覆盖了哪些质量场景，由 ADR 或测试用例补足

这样 Scenarios 的"识别"和"验证"两层职责都有落点，不会因 Context 图过载而丢失验证视角。

### 4.1 Mermaid 语法对照

全部 7 类图对应的 Mermaid 顶层语法**统一规定**如下，避免渲染差异：

| 我们画的图 | Mermaid 顶层声明 | 默认方向 | 备注 |
|-----------|-----------------|---------|------|
| Context | `flowchart TB` | 自顶向下 | 分层布局：用户/参与者在上，系统居中，外部系统在下；系统是**语义焦点**而非视觉中心 |
| Container | `flowchart TB` | 自顶向下 | 用 `subgraph` 表达系统边界 |
| Component | 见下方分情况 | 见下方 | 依赖链主导 vs 分层架构主导，两种风格 |
| Code | `classDiagram` | —— | L4 类/接口级，罕见手绘；类图专用语法 |
| Sequence | `sequenceDiagram` | —— | 时序图专用语法 |
| State Machine | `stateDiagram-v2` | —— | 状态机专用语法（不用旧版 `stateDiagram`）|
| Deployment | `flowchart TB` | 自顶向下 | 用 `subgraph` 表达 VPC / region / 信任边界 |

**Component 图按架构风格分两种**：

| 架构风格 | Mermaid 声明 | 适用场景 |
|---------|-------------|---------|
| **依赖链主导** | `flowchart LR` | Pipe-and-Filter、流水线系统、Text-to-SQL agent 这类按阶段处理的系统 |
| **分层主导** | `flowchart TB` + `subgraph` | DDD、Clean Architecture、六边形架构等显式分层的系统（如 mj-system 的 ODS→DWD→DWS） |

判别原则：如果模块间的关系**主要是"上层依赖下层"**，用 TB + subgraph 分层；如果主要是"前序产出喂给后序"，用 LR。混合型系统倾向 TB。

**不使用 `graph` 关键字**——它是 Mermaid 的早期别名，与 `flowchart` 同义但已不推荐。新代码统一用 `flowchart`。

### 4.2 图命名规范（altitude + aspect 编码）

每张图的**名字**应让读者不打开图就能判断它的**抽象高度（altitude）**与**所画内容**。**禁用不透明序列码**（`图1` / `A2` / `D3`）——无权威框架这样命名：C4 的图型名本身就是 `System Context / Container / Component / Code`〔源：c4model.com〕，Structurizr DSL 把它们落为 view 关键字 `systemContext / container / component`〔源：docs.structurizr.com〕；DFD 把 `Level 0/1/2` 数字写进图名；UML 按 structure / behavior 给描述性名〔源：uml-diagrams.org〕。

**本节只讲命名规范的"为什么"（设计依据与两轴推导）；可操作的命名规则、完整 7 类规范图名 / slug 词表、落图机制（`%% Name` / `%% Slug` 注释），唯一事实源在 [`domain-acquisition.md §6`](domain-acquisition.md)。** 七份绘制提示词均引用 §6，本节不重复定义，以免分叉。

**两段式规则的依据（对齐 §三 / §四 两轴）**：

- **缩放轴图**（Context / Container / Component / Code）——名字带 C4 **altitude** `L1 / L2 / L3 / L4`；层级是名字的一部分。
- **正交轴图**（Dynamic 行为：时序 / 状态机；Physical 物理：部署）——**不是缩放层级**（§四已述「Dynamic / Deployment 是横穿 L1–L3 的正交视角」），故**无 altitude**，按 **aspect**（画哪种行为 / 物理面）命名，可加 scope 后缀。

由此推出命名 pattern `〔轴·层级?〕图型名 [· 变体]`（层级段仅缩放轴出现）与稳定 kebab-case **slug** 作交叉引用 / 机检锚点（先例：Structurizr 显式 view `[key]`；auto-key 不保证稳定，须显式给）——**具体词表见 §6**。

> **C4 vs UML 切法**：UML 2.5 按「静态 structure vs 动态 behavior」二分（部署图→structure、时序 / 状态机→behavior）〔源：uml-diagrams.org〕；本方法论沿用 **C4 的「缩放轴 + 正交补充」**切法（与 §三 / §四 一致）。二者沿不同维度切分、不冲突；本规范取 C4「图名 / 角色编码抽象层级、记法无关」原则，让 slug 承载身份而非记法。

**领域特化 hook（通用机制）**：领域手册可在本命名规范上特化——(a) 把轴名改成领域名、(b) 定义本领域的 slug token 词表、(c) 增加非标准扩展视图（须显式标注「非 C4」）、(d) 加 linter 机检规则。这是一个**通用扩展点**：任何反复使用的领域都可据此沉淀出一份"领域特化手册"，把领域专属的角色映射、命名 token、扩展轴固化下来（沉淀配方见 [`domain-acquisition.md §7`](domain-acquisition.md)）。通用层（本方法论 + 七份提示词 + domain-acquisition）本身保持领域无关，不内嵌任何具体领域的 token。

## 五、边语义（**最常被忽视，但关键**）

同样的箭头，在不同图里含义完全不同。

| 图 | 边表达什么 | 一条典型边在说什么 |
|---|------------|-------------------|
| **Context** | 系统与外界的关系 + 数据交换通道 | "用户通过浏览器向系统发起查询" |
| **Container** | 进程间通信 + 协议 + 通信模式 | "API 通过 HTTP/JSON 同步调用支付服务" |
| **Component** | 代码级依赖 **或** 组件协作（二选一，见 5.1） | "Planner 模块调用 ToolBus 接口" |
| **Sequence** | 时序消息 + 同步/异步 + 请求/响应 | "第 3 步，Worker 同步调用 DB，等待返回" |
| **Deployment** | 物理网络路径 + 信任边界 + 流量类型 | "Web Pod 通过 VPC 内网 TLS 访问 RDS" |

从 Context 到 Deployment，边的语义从"关系"→"协议"→"调用"→"时序"→"物理路径"逐层下沉。**抽象层级在变，所以同一根线必须读出不同含义**。

### 5.0 跨图符号警示（前置必读）

Mermaid 同一箭头语法在不同图中含义不同。**绘图人员不得跨图复用样式**——读者解码时必须先确认所看图的类型。

| Mermaid 语法 | Container 图 | Component 图 | Deployment 图 |
|---|---|---|---|
| `-->` 实线 | 同步调用 | 直接调用 / 控制流 | 常规流量（标 `协议:端口`） |
| `-.->` 虚线 | 异步通信 | 弱依赖 / 事件订阅 / 读取 | 备份 / 监控次要流量 |
| `==>` 加粗 | 不使用 | 接口实现 | 主流量 / 数据复制 / 集群同步 |

注意事项：

- **`-.->` 在三张图中含义无重叠**——Container 表"异步"是运行时行为，Component 表"弱依赖"是静态代码关系，Deployment 表"次要流量"是物理通道属性。读者必须先确认图类型才能解码。
- **`==>` 在 Component 和 Deployment 中含义完全相反**——前者是静态结构（实现关系），后者是运行时行为（主流量）。强烈不建议在同一份架构文档中让这两张图并置而不加说明；若必须并置，应在图标题处显式标注图类型。
- **Sequence 图采用独立的箭头语法**（`->>` / `-->>` / `-)` / `--)` / `-x`），与上表不交叉，按 5.1 节 Sequence 子表使用。
- **State Machine 图与 Code 图同样采用工具原生语义**——状态机的所有转换在 `stateDiagram-v2` 里都是 `-->`（差异全由 `event [guard] / action` 标签表达，见 state-machine-diagram.md）；代码图用 `classDiagram` 的关系符号（`<|--` 继承、`<|..` 实现、`*--` 组合、`o--` 聚合、`-->` 关联、`..>` 依赖，见 code-diagram.md）。这两类图**都不参与上表三类 flowchart 的团队约定线型**，读者按工具文档解码即可。
- **Context 图的边语义最弱**（仅"关系 + 数据交换"），通常**不在 Context 图中区分线型**——所有边用实线即可，差异通过标签表达。

**图例（legend）强制规则**：

- **flowchart 中**使用 `-.->` 或 `==>` 区分语义的图（Container / Component / Deployment），**必须在图旁附三行以内的 legend**，明确该图中各线型的含义。例如：

  ```text
  %% Legend:
  %%   -->   同步调用
  %%   -.->  异步通信
  %%   ==>   主流量 / 数据复制
  ```

- **Sequence 图不强制 legend**——其箭头是 Mermaid sequenceDiagram 的工具原生语义（`->>` 同步调用、`-->>` 响应、`-)` 异步、`-x` 失败消息），按工具文档解读即可
- **State Machine 图、Code 图同样不强制 legend**——状态机的转换全是 `stateDiagram-v2` 的 `-->`（语义在 `event [guard] / action` 标签里）、代码图用 `classDiagram` 的原生关系符号，二者都是工具原生语义
- **Context 图不需要 legend**——只用实线，无需说明

这条规则的核心区分是：**工具原生语义不强制 legend，团队约定语义必须强制**。

### 5.1 各图边语义详解

**Context Diagram 边语义**：
- 必标：交互内容（业务语义）+ 触发模式（实时/批量/事件）
- 选标：通道（HTTPS / SFTP / 邮件），仅合规审查相关时
- 不标：协议参数、状态码、JSON schema

**Container Diagram 边语义**：
- 必标：协议（HTTP/REST、gRPC、AMQP/Kafka、SQL、Redis Protocol）
- 必标：通信模式——**同步用实线 `-->`，异步用虚线 `-.->`，强制视觉区分**
- 选标：数据方向（read/write）、流量量级
- 不标：消息体细节、超时配置（那是详细设计）

**Component Diagram 边语义**：

**前置规则——主语义二选一**：每张 Component 图开头必须用注释声明这是"**静态依赖图**"还是"**组件协作图**"，**两种语义不可在一张图里混用**。

- **静态依赖图**：边表达编译/导入依赖（A 知道 B 的接口/类型）。常用于评审耦合、循环依赖、分层违规
- **组件协作图**：边表达运行时控制流或数据流（A 调用 B、A 把数据传给 B）。常用于评审职责分工、协作模式

为什么必须二选一：编译依赖、运行时调用、数据流向**三者方向可以不一致**（典型反例：A 轮询 B，编译依赖 A→B，但业务数据 B→A）。一条边同时表达三种含义必然与 Sequence 图冲突。运行时调用顺序一律转到 Sequence 图，不在 Component 图中表达。

**符号规则**（在所选主语义内）：
- 实线 `-->` = 直接调用 / 依赖
- 虚线 `-.->` = 弱依赖 / 事件订阅 / 数据读取
- 加粗 `==>` = 接口实现
- 标签用动词："调用"、"订阅"、"读取"、"实现"
- 方向严格表达**依赖方向**（A→B = A 知道 B，B 不知道 A）
- **发布-订阅场景的箭头方向**：箭头从**订阅者指向发布者**（订阅者知道事件类型/topic，发布者不知道有谁在订阅）。事件的实际流向（数据从发布者流向订阅者）通过标签表达，如 `订阅者 -.->|订阅 OrderCreated| 发布者`。这条规则与"依赖方向"原则一致，避免与 Sequence 图的数据流箭头混淆。
- 不允许循环依赖（除非显式说明）

**Sequence Diagram 边语义**（最丰富，每种箭头有特定语义）：

| Mermaid 语法 | 视觉 | 语义 |
|------------|-----|-----|
| `A->>B` | 实线 + 实心 | **同步调用**，等待返回 |
| `A-->>B` | 虚线 + 实心 | **同步返回值** |
| `A-)B` | 实线 + 开口 | **异步消息**，不等待 |
| `A--)B` | 虚线 + 开口 | **异步响应** |
| `A-xB` | 实线 + X | **失败消息**（异常 / 超时） |

**Sequence 致命错误**：同步和异步混用同一种箭头——会直接误导性能分析。

**Deployment Diagram 边语义**：
- 实线 `-->` = 常规请求流量，标 `协议:端口`
- 加粗 `==>` = 主流量 / 数据复制 / 集群同步
- 虚线 `-.->` = 备份 / 监控等次要流量
- **必须显式标注**：跨 VPC 通信、跨 region 通信、出公网的边、跨数据驻留边界的边

**跨边界标注的具体形式**：

1. **用 `subgraph` 包围同一信任域的节点**——VPC、region、数据中心、合规边界各成一个 subgraph。subgraph 标题写明域名称（如 `subgraph "VPC-prod (cn-shenzhen)"`）
2. **跨 subgraph 的边在标签前缀加显式标记**：
   - `[跨VPC]` 跨 VPC 通信
   - `[跨region]` 跨地理区域
   - `[公网]` 流量出公网（如调用第三方 SaaS）
   - `[跨驻留]` 跨数据驻留边界（涉及合规审查的核心标记）
3. **示例**：`Web -->|[跨VPC] HTTPS:443| Payment`

这三层组合能让审计人员一眼识别出所有需要安全/合规复核的通信路径。

**ADR 引用规则**（所有图通用）：

边标签或节点角标里允许出现 `[ADR-N]` 引用，例如：

```text
Web -->|HTTPS:443 [ADR-007]| Payment
OrderSvc -.->|订阅 OrderCreated [ADR-012]| EventBus
```

读者点击或搜索 ADR-N 即可跳转到对应决策。**不强制每条边都引用**，但以下三类边**必须引用 ADR**：

- **合规边**：跨数据驻留、加密要求、PII 传输、审计追踪
- **跨边界边**：跨 VPC / 跨 region / 出公网 / 跨信任域
- **跨副本同步边**：数据复制、集群心跳、状态同步、leader election

这三类是审计和运维事故复盘时首先被追问"为什么这样设计"的位置，缺失 ADR 引用会显著增加沟通成本。其余边的 ADR 引用可选。

### 5.2 同一外部实体承担多角色

> **适用范围**：本节示例使用 `-.->` 虚线区分语义，**适用于 Container / Component / Deployment 图**。若在 **Context 图**中遇到同样情况，所有边请改为实线（按 5.0 规则），通过标签区分多角色——这是 Context 图边语义最弱（仅"关系"层级）的必然约束。

实际项目里经常遇到"一个外部实体同时扮演多种角色"的情况——典型例子：

- **GitHub** 同时是源码托管 + Actions CI + Issue 跟踪
- **AWS** 同时是计算（EC2）+ 存储（S3）+ DNS（Route53）
- **公司内网 Active Directory** 同时是 SSO + 用户目录 + 邮件路由

处理这种情况有两种合规画法，按图密度选：

**画法 A — 多条边**（推荐用于节点少、关系语义差异大时）：把同一外部实体作为一个节点，但拉**多条边**分别表达不同语义：

```text
flowchart TB
    Sys((你的系统))
    GH[GitHub]
    
    Sys -.->|源码托管| GH
    Sys -->|Actions CI 触发, push 时| GH
    Sys -->|Issue 同步, 实时| GH
```

**画法 B — 边标签合并**（推荐用于密集图节点多时，或用于 Context 图——因 Context 图禁用虚线）：用一条边但在标签里用 ` + ` 显式列出多个语义：

```text
Sys -->|源码托管 + Actions CI + Issue 同步| GH
```

**禁止做法**：用一条无标签或语义模糊的边代表多个角色——会让读者必须脑补，破坏图的可审计性。

## 六、一句话总结

每张图的核心动词：

> **Context 谈关系，Container 谈协议，Component 谈依赖/协作，Code 谈类关系，Sequence 谈时序，State Machine 谈生命周期与合法转换，Deployment 谈路径。**

把这七个动词刻在脑子里，看任何架构图都不会读错抽象层级。其中 Context / Container / Component / Sequence / Deployment 是日常最高频的核心 5 张；State Machine 是行为轴与 Sequence co-equal 的补充；Code 是 L4 罕见手绘。
