# Container Diagram — 容器图绘制

> 〔命名规范见 `domain-acquisition.md` §6〕规范名 **〔结构·L2〕容器图**；slug `struct-l2-container`（多系统时加 scope）。每张图须紧跟类型声明行落 `%% Name` / `%% Slug`（见骨架）。

## ⚠️ Pre-check：项目类型适用性（**必先跑**）

画图前**必须**确认项目存在 **runtime boundary**（C4 Container 的核心定义——独立运行的代码执行单位或数据存储，强调"运行边界"而非"部署单位"或"开发模块"）。判定信号：

- ✓ 适用：仓库内有 `docker-compose.yml` / `Dockerfile` / `k8s/` manifests / 进程定义（main / app entrypoint）
- ✗ 不适用：仓库是以下类型——即**不存在 runtime boundary**——**立即触发 HITL 让用户改图类型**，不要硬画

| 项目类型 | Container 图 | 推荐替代 | 判定信号 |
|---------|------------|---------|---------|
| 库 / SDK / framework | 不适用 | Component 图 | 仓库根有 `setup.py` / `package.json` 但无服务 entrypoint，主体在 `src/<lib>/` |
| 插件市场 / 工具集合 | 不适用 | Context + Component | 仓库有 `plugins/` / `extensions/` 等子目录但无 Dockerfile |
| 静态文档站 / 内容仓库 | 不适用 | Context only | 主体是 `docs/` / `content/` / `posts/`，无业务代码 |
| IaC / 配置仓库 | 不适用 | Deployment 图 | 主体是 `terraform/` / `pulumi/` / `ansible/`，描述外部资源而非自身 |
| CLI 工具（无 daemon） | 不适用 | Component 图 | 入口是 `cli.py` / `main.go` 等一次性命令 |

### Pre-check 触发的 HITL 输出格式

发现项目类型不适配时，**立即停止**走正常 Container 流程，输出：

```
我看了 <项目名> 仓库，它是一个 **<识别出的类型>**（依据：<判定信号>），
不存在 runtime boundary，所以传统 Container Diagram 在这里不太适用。

你大概率想要下面三个之一，请选：

(a) <推荐替代 1> — <一句话说明为什么适合>
(b) <推荐替代 2> — <一句话说明>
(c) "准 Container 图" — 把 <分发单元 e.g. plugin/package> 当作 container，
    画打包/分发拓扑。**注**：非标准 C4 用法，但对这类项目有意义。

请选 a/b/c，或描述你具体想表达什么：___
```

只有用户选择 (c) 或明确表示"就要画 Container 图"时，才继续走下面的标准流程，且在最终输出的"显式假设"段标明"本图采用了 Container 概念的扩展性使用"。

---

## 框架定位

- **4+1 视图**：Logical + Development（一张图同时服务两类读者，需在抽象层级上做权衡）
- **C4 层级**：Level 2
- **主要受众**：新人工程师 / SRE / 运维 / 架构评审委员会 / 技术 lead
- **使用场景**：onboarding、架构评审、容量规划、监控告警体系设计、技术债梳理

**双视图职责说明**：新版方法论明确 Container 图同时承担 Logical（系统内部的逻辑分块）和 Development（部署单元粒度）两类视角——不能把它当作"纯 Logical"或"纯 Development"图来画。落地的解法是节点命名兼顾两类读者：**业务语义优先**，但保留可追溯到代码仓库的别名。如果业务语义和代码模块严重不对齐（如一个微服务承担多个领域），优先按业务语义拆分节点，在 ADR 中记录代码层面的实际归属。

## 必含元素

1. 系统内部所有**独立 runtime boundary**：Web app / API service / Worker / DB / Cache / MQ
2. container 之间的所有通信边（标协议）
3. 主要外部依赖（保留 Context 图里的外部实体，作为系统边界外的节点）
4. 系统边界用 `subgraph "系统名"` 圈出

### Container 粒度规则（K8s 场景，强制）

- 一个 **Deployment / StatefulSet** → 一个 Container 节点
- **Sidecar**（envoy、log-shipper、配置代理等基础设施附属）**不单独画**，除非承担独立业务职责
- **副本数**通过边标签或节点角标标注（如 `[API Pod ×3]`），**不画多个节点**
- **CronJob / Job**：长期承担业务职责的画出，临时性运维作业不画

## 禁含元素

- ❌ 容器内部的代码模块（那是 Component 图）
- ❌ 部署节点 / VPC / Pod 实例数 / VM（那是 Deployment 图）
- ❌ 同一进程内的子模块拆分
- ❌ 时序步骤号（那是 Sequence 图）
- ❌ 用"功能模块"代替"runtime boundary"（"订单管理"不是 container，"order-service" 才是）
- ❌ **Sidecar 单独画**（除非承担独立业务职责）
- ❌ **多副本画多个节点**（副本数应通过角标表达）

## 边的语义规则

每条边必须标注：

- **协议**：HTTP/REST、gRPC、GraphQL、AMQP/Kafka、SQL、Redis Protocol、WebSocket、SFTP
- **通信模式**：同步用实线 `-->`，异步用虚线 `-.->`，**强制视觉区分**
- **选标**：数据方向（read/write）、流量量级
- **不标**：消息体细节、超时配置（那是详细设计）

### Legend 强制规则

本图使用 `-->` / `-.->` 区分同步/异步语义，按新版方法论 §5.0 属于"团队约定语义"，**必须在图旁附 legend**：

```text
%% Legend:
%%   -->   同步调用
%%   -.->  异步通信
```

### ADR 引用规则

以下三类边**必须**在标签里附 `[ADR-N]` 引用：

- **合规边**：跨数据驻留、加密要求、PII 传输、审计追踪
- **跨边界边**：跨 VPC / 跨 region / 出公网 / 跨信任域（Container 图层一般作为外部依赖的边体现）
- **跨副本同步边**：数据复制、集群心跳、状态同步、leader election

示例：`Worker -.->|订阅 OrderCreated [ADR-012]| EventBus`

其他普通边的 ADR 引用可选。

## Mermaid 输出格式

- 图类型：`flowchart TB`
- 系统边界：`subgraph "系统名"` 圈出
- **节点命名兼顾业务语义与代码别名**：`[业务名（代码别名）· 技术栈]`，如 `[订单服务（order-service）· FastAPI]`
- 服务/进程：`[...]`
- 数据库：`[(...)]` 圆柱体
- 消息队列:`[/ Kafka topic /]` 或加文字说明
- 缓存：`[(Redis)]`
- 边标签格式：`-->|协议 + 模式 [ADR-N]?|`
- **必须附 legend**（解释 `-->` 和 `-.->` 的语义）
- **图名与 slug**（命名见 `domain-acquisition.md` §6）：紧跟 `flowchart TB` 落 `%% Name: 〔结构·L2〕容器图` / `%% Slug: struct-l2-container`
- **不使用 `graph` 关键字**——统一用 `flowchart`

## 自检清单

- [ ] 每个 container 都是独立 runtime boundary？（不是模块、不是功能）
- [ ] 每条边都标了协议？
- [ ] 同步 / 异步视觉区分了？（实线 vs 虚线）
- [ ] **附了 legend**？（用 `-.->` 区分语义必备）
- [ ] **合规边 / 跨边界边 / 跨副本同步边都引用了 ADR**？
- [ ] 节点命名是否兼顾业务语义和代码别名？
- [ ] 数据库 / 缓存 / MQ 这些被动 container 都画了？
- [ ] 主要外部依赖保留了？跟 Context 图能对得上？
- [ ] container 数量在 5~15 之间？（< 5 太粗，> 15 该拆系统）
- [ ] K8s 场景下：**Sidecar 没单独画**？**副本数走角标而不是多节点**？
- [ ] 顶层语法是 `flowchart`（不是 `graph`）？
- [ ] 图块紧跟类型声明行有 `%% Name:` / `%% Slug:` 两行（命名见 `domain-acquisition.md` §6）？

## 输出骨架模板

````text
flowchart TB
    %% Name: 〔结构·L2〕容器图
    %% Slug: struct-l2-container
    User[用户]

    subgraph "你的系统"
        Web[Web 前端（next-web）· Next.js]
        API[API 服务（order-api）· FastAPI ×3]
        Worker[后台 Worker（order-worker）]
        Cache[(Redis 缓存)]
        DB[(PostgreSQL)]
        MQ[/ Kafka /]
    end

    Ext[外部支付网关]

    User -->|HTTPS/JSON| Web
    Web -->|HTTPS/JSON| API
    API -->|SQL 读写| DB
    API -->|读| Cache
    API -.->|发布 OrderCreated| MQ
    MQ -.->|订阅 OrderCreated [ADR-012]| Worker
    Worker -->|HTTPS [ADR-007]| Ext

    %% Legend:
    %%   -->   同步调用
    %%   -.->  异步通信
````

## 信息获取要点（针对本图）

> 获取阶梯（L0 声明扫描 → L1 结构推断 → L2 命名归类 → L3 HITL）定义见 `domain-acquisition.md` §3；下方「Layer 0 重点抽」即本图型的 L0 源清单。

**Layer 0 重点抽**：

- `docker-compose.yml` 的 `services` 块 → Container 列表
- `Dockerfile` 数量 → 进程数（每个 Dockerfile 通常对应一个 container）
- `k8s/` 下的 `Deployment` / `StatefulSet` manifests → Container 节点（每份一个节点；副本数取 `spec.replicas`）
- `requirements.txt` / `package.json` → 区分内部 container（DB 客户端等）vs 外部依赖（LLM SDK 等）
- `openapi.yaml` / `*.proto` → 协议是 REST 还是 gRPC
- `depends_on` 字段 → 依赖方向（但不一定是运行时通信，HITL 阶段校正）

**典型 HITL 问题**（仅当上述挖不到时）：

```
Q1（纯选项）：<Container A> → <Container B> 是同步还是异步？
   (a) 同步 RPC
   (b) 异步队列 / 消息
   (c) 进程内调用

Q2（选项 + 其他）：是否有独立的消息队列 container？
   (a) 有 (Kafka)
   (b) 有 (RabbitMQ)
   (c) 有 (Redis Stream)
   (d) 没有，进程内传递
   (e) 其他：___

Q3（混合）：Web 前端跟 API 是同进程还是分开部署？
   (a) 同进程（Next.js SSR + API routes）
   (b) 分开（Next.js 独立 + 后端独立 API）
   若选 (b)，主要原因？___
```
