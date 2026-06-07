# Component Diagram — 组件图绘制

> 〔命名规范见 `domain-acquisition.md` §6〕规范名 **〔结构·L3〕组件依赖图**；slug `struct-l3-component`（按聚焦 container / 变体加后缀，如 `struct-l3-component-<变体>`）。每张图须紧跟类型声明行落 `%% Name` / `%% Slug`（见骨架）。

## ⚠️ 主语义二选一（每张图开头第 1 步，强制）

每张 Component 图开头必须用 Mermaid 注释**显式声明**语义类型，**两种语义不可在一张图里混用**：

```text
%% Component Diagram Type: Static Dependency (静态依赖图)
```

**或**

```text
%% Component Diagram Type: Component Collaboration (组件协作图)
```

### 两种语义的判别

| 类型 | 边表达什么 | 典型用途 |
|------|----------|---------|
| **静态依赖图** | 编译/导入依赖（A 知道 B 的接口/类型） | 评审耦合、循环依赖、分层违规 |
| **组件协作图** | 运行时控制流或数据流（A 调用 B、A 把数据传给 B） | 评审职责分工、协作模式 |

### 为什么必须二选一（核心约束）

编译依赖、运行时调用、数据流向**三者方向可以不一致**。典型反例：A 轮询 B，编译依赖是 `A→B`，但业务数据流是 `B→A`。一条边同时表达三种含义必然与 Sequence 图冲突。

**运行时调用顺序一律转 Sequence 图**，不在 Component 图中表达。

---

## 框架定位

- **4+1 视图**：Development
- **C4 层级**：Level 3
- **主要受众**：该 container 的开发者 / code reviewer / 接手这部分的新人 / 技术 lead
- **使用场景**：重构前依赖梳理、新增功能找放哪、code review 检查分层、DDD 限界上下文讨论

## 必含元素

1. **主语义类型声明**（见上方，强制）
2. 单个 container 的边界（用 subgraph 圈出，标明 container 名）
3. container 内部的代码模块 / 组件
4. 组件间的依赖关系或协作关系（按主语义类型而定）

## 禁含元素

- ❌ 多个 container 的内部（**一张图只画一个 container**）
- ❌ 跨 container 的连接（那是 Container 图）
- ❌ 代码细节：类名、方法名、属性、SQL 语句
- ❌ 部署位置、运行时实例数
- ❌ 组件总数超过 10 个（超了就该拆图）
- ❌ **在一张图里混用静态依赖和运行时协作两种语义**
- ❌ **用箭头方向表达"时序"**——时序一律去 Sequence 图

## 边的语义规则（在所选主语义内）

| 符号 | 视觉 | 含义 |
|------|------|------|
| `-->` 实线 | 实线箭头 | 直接调用 / 依赖 |
| `-.->` 虚线 | 虚线箭头 | 弱依赖 / 事件订阅 / 数据读取 |
| `==>` 加粗 | 加粗箭头 | **接口实现** |

⚠️ **跨图符号警示**：`==>` 在 **Component 图**表"接口实现"（静态结构关系），但在 **Deployment 图**表"主流量 / 数据复制"（运行时行为）——含义**完全相反**。强烈不建议在同一份架构文档中让这两张图并置而不加说明；若必须并置，应在图标题处显式标注图类型。

### 通用规则

- 标签用动词："调用"、"订阅"、"读取"、"实现"、"发布"
- **方向严格表达依赖方向**：`A→B` 表示 A 知道 B 的接口/类型，B 不知道 A 存在
- **发布-订阅场景的箭头方向**：箭头**从订阅者指向发布者**——订阅者知道事件类型/topic，发布者不知道有谁在订阅。事件实际数据流向通过标签表达，例如：

  ```text
  Listener -.->|订阅 OrderCreated| EventBus
  ```

  这条规则与"依赖方向"原则一致，避免与 Sequence 图的数据流箭头混淆。

- **不允许循环依赖**（除非有意为之，须用注释显式说明原因）

### Legend 强制规则

本图使用 `-->` / `-.->` / `==>` 三种线型，按新版方法论 §5.0 属于"团队约定语义"，**必须附 legend**。

### ADR 引用规则

关键架构决策点（如显式依赖反转、特殊耦合放行）建议引用 `[ADR-N]`，例如：

```text
Domain -.->|定义接口 [ADR-005]| IUserRepo((IUserRepo))
```

## Mermaid 输出格式（按架构风格分两种）

按你的系统架构主导风格二选一：

### 风格 A — 依赖链主导（Pipe-and-Filter、流水线、Text-to-SQL agent）

- 图类型：**`flowchart LR`**
- 节点按处理阶段从左到右排列
- 适合：前序产出喂给后序的"流"型系统

### 风格 B — 分层主导（DDD、Clean Architecture、六边形架构）

- 图类型：**`flowchart TB`** + 多个 `subgraph` 分层
- 节点按层级从上到下排列，上层依赖下层
- 适合：mj-system 这类显式分层的系统（ODS→DWD→DWS 也属于这类）

### 判别原则

- 模块间关系**主要是"上层依赖下层"** → 用**风格 B**（TB + subgraph）
- 主要是"前序产出喂给后序" → 用**风格 A**（LR）
- 混合型系统**倾向风格 B**

### 通用 Mermaid 规则

- container 边界：`subgraph "Container 名"`
- 模块：`[模块名]`
- 接口：`((接口名))`
- 数据存储位置（如内存缓存）：`[(...)]`
- **必须附 legend**（解释所用线型的语义）
- **图名与 slug**（命名见 `domain-acquisition.md` §6）：紧跟 `flowchart`（LR / TB）落 `%% Name: 〔结构·L3〕组件依赖图` / `%% Slug: struct-l3-component`
- **不使用 `graph` 关键字**——它是 Mermaid 早期别名，统一用 `flowchart`

## 自检清单

- [ ] **主语义类型已声明**？（静态依赖图 vs 组件协作图）
- [ ] 一张图里**没有混用两种主语义**？
- [ ] 只画了一个 container 的内部？
- [ ] 没有循环依赖？（或循环依赖有显式说明）
- [ ] 边方向严格表达依赖方向？（发布-订阅场景：箭头**从订阅者指向发布者**）
- [ ] 关键模块覆盖到位，但总数 ≤ 10？
- [ ] 每条边的标签是动词，表达了交互类型？
- [ ] **附了 legend**？（用 `-.->` 或 `==>` 必备）
- [ ] 关键架构决策点引用了 ADR？
- [ ] 顶层语法是 `flowchart`（不是 `graph`）？
- [ ] 架构风格匹配 LR / TB 的选择？
- [ ] 图块紧跟类型声明行有 `%% Name:` / `%% Slug:` 两行（命名见 `domain-acquisition.md` §6）？

## 输出骨架模板

### 风格 A 示例（依赖链主导）

````text
%% Component Diagram Type: Component Collaboration (组件协作图)
flowchart LR
    %% Name: 〔结构·L3〕组件依赖图
    %% Slug: struct-l3-component
    subgraph "Container 名（来自 Container 图）"
        A[入口模块] -->|调用| B[核心服务]
        B -->|调用| C[领域逻辑]
        B -->|读取| D[(本地缓存)]
        C -.->|发布事件| EventBus[事件总线]
        Listener -.->|订阅 OrderCreated| EventBus
    end

    %% Legend:
    %%   -->   直接调用 / 控制流
    %%   -.->  事件发布 / 订阅 / 数据读取
````

### 风格 B 示例（分层主导，对应 DDD / mj-system 六层架构）

````text
%% Component Diagram Type: Static Dependency (静态依赖图)
flowchart TB
    %% Name: 〔结构·L3〕组件依赖图
    %% Slug: struct-l3-component
    subgraph "某 Container（DDD 六层）"
        subgraph "上层"
            UI[Interface 层]
            APP[Application 层]
        end
        subgraph "中层"
            DOM[Domain 层]
        end
        subgraph "下层"
            INFRA[Infrastructure 层]
        end

        REPO((IUserRepo 接口))

        UI -->|依赖| APP
        APP -->|依赖| DOM
        DOM -->|定义接口 [ADR-005]| REPO
        INFRA ==>|实现| REPO
    end

    %% Legend:
    %%   -->   编译依赖 / 引用
    %%   ==>   接口实现（依赖反转）
````

**关键点**：Domain 层不依赖 Infrastructure 层——依赖反转用 `==>` 表达，箭头**从 Infrastructure 指向 Domain 定义的接口**。这正是"发布-订阅箭头方向"规则在依赖反转场景的同源应用——**所有权方（接口定义方）被指向，使用方（实现方）发起箭头**。

## 信息获取要点（针对本图）

> 获取阶梯（L0 声明扫描 → L1 结构推断 → L2 命名归类 → L3 HITL）定义见 `domain-acquisition.md` §3；下方「Layer 0 重点抽」即本图型的 L0 源清单。

**Layer 0 重点抽**：

- 源码顶层目录结构（如 `src/routers/`, `src/services/`, `src/repositories/`） → 直接对应分层模块
- DDD 项目中的 `domain/`, `application/`, `infrastructure/` → 直接对应 DDD 层
- import 关系（启发式抽样几个文件） → 推断**编译依赖方向**（静态依赖图用）
- 业务代码中的 `await foo.bar()` / pub-sub 注册 → 推断**运行时协作**（组件协作图用）
- `tests/` 目录结构 → 反推被测组件

**典型 HITL 问题**（仅当上述挖不到时）：

```
Q1（纯选项）：这张图是静态依赖图还是组件协作图？
   (a) 静态依赖图（边表达编译依赖，用于评审耦合 / 分层违规）
   (b) 组件协作图（边表达运行时调用 / 数据流，用于评审职责分工）

Q2（开放带示例）：这张图聚焦哪个 container？
   （例：order-service、orchestrator、user-api）

Q3（开放结构化）：列出该 container 内部主要模块，每行一个：
   ___

Q4（纯选项）：架构风格是依赖链主导还是分层主导？
   (a) 依赖链主导（用 flowchart LR，按处理阶段排列）
   (b) 分层主导（用 flowchart TB + subgraph 分层）
```
