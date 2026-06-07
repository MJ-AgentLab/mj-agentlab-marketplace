# Deployment Diagram — 部署图绘制

> 〔命名规范见 `domain-acquisition.md` §6〕规范名 **〔物理〕部署图·<env>**；slug `phys-deployment-<env>`（物理正交轴，无缩放层级；env = 目标环境，如 prod / staging）。每张图须紧跟 `flowchart TB` 落 `%% Name` / `%% Slug`（见骨架）。

## ⚠️ Pre-check：项目类型适用性（**必先跑**）

画图前**必须**确认项目是 **运行时服务** 或 **IaC** 类型。判定信号：

- ✓ 适用：仓库有 `k8s/` / `terraform/` / `pulumi/` / `ansible/` / `docker-compose.yml` 等部署描述
- ✗ 不适用：仓库是以下类型——**立即触发 HITL 让用户改图类型**

| 项目类型 | Deployment 图 | 推荐替代 |
|---------|--------------|---------|
| 库 / SDK / framework | 不适用（没有"部署"概念） | Component 图 |
| 插件市场 / 工具集合 | 不适用 | Context 图（描述生态环境） |
| 静态文档站 | 不适用（除非要画 Hosting 拓扑） | Context only |
| CLI 工具 | 不适用 | Component 图 |
| **IaC 仓库** | **适用，但语义特殊** | 见下 |

**IaC 仓库的特殊处理**：IaC（terraform / pulumi / ansible）描述的是它**配置的目标系统**的部署，不是仓库自身。此时 Deployment 图的"画什么"要先 HITL 澄清：

```
我看到这是一个 <terraform / pulumi / ansible> 仓库。Deployment 图在这种
情况下有两种画法，请选：

(a) 画"IaC 配置出来的目标系统"的部署拓扑——从 *.tf / *.yaml 抽出云资源、
    网络拓扑、节点。**对应 C4 的 Deployment 视角，这是这张图的标准用法**。
(b) 画"IaC 仓库本身"的工作流（git push → CI → terraform apply → 云）——
    这种更接近 Sequence 图，建议改画 Sequence。

请选 a/b，或描述：___
```

### Pre-check 触发的非 IaC HITL 输出格式

如果是库 / 插件市场 / CLI 等不适用的项目类型，参考 container-diagram.md 同款 HITL 提示格式，建议 Context / Component 等替代图。

只有项目类型适配（或用户明确选了 c "准 Deployment 图"）才继续下面的标准流程。

---

## 框架定位

- **4+1 视图**：Physical
- **C4 定位**：Deployment Diagram（**C4 supporting diagram，非 Context/Container/Component/Code 核心层级图**；**跨 L1–L3 的正交视角**，通常对应 L2 容器的物理放置）
- **主要受众**：运维 / SRE / 系统工程师 / 安全 / 合规审计 / 云成本管理
- **使用场景**：上线评审、灾备规划、合规审计（等保 / PCI-DSS / 个保法 / 数据出境）、网络安全评审、成本测算、IaC 设计参考

## 必含元素

1. 网络拓扑：公网 / VPC / 子网 / 可用区——用**嵌套 subgraph** 表达层级
2. 物理或虚拟节点：VM / Pod / 托管服务（RDS / S3 / SQS 等）
3. 每个节点上跑的容器实例（与 Container 图能对应）
4. 流量边：标明协议、端口、流量类型
5. **跨信任边界的连接必须用前缀语法显式标注**（见下方"跨边界标注语法"）
6. 数据复制 / 备份路径
7. 负载均衡 / 反代 / NAT 节点

## 禁含元素

- ❌ 容器内部组件细节（那是 Component 图）
- ❌ 业务时序（那是 Sequence 图）
- ❌ 代码组织信息
- ❌ 已废弃的旧部署（**单图只画一个目标环境**，禁止把旧环境与目标环境混画；目标环境本身由 HITL Q1 选定）
- ❌ 不标端口和协议的"裸网络线"

## 边的语义规则

| 符号 | 视觉 | 含义 |
|------|------|------|
| `-->` 实线 | 实线箭头 | 常规请求流量，必标 `协议:端口` |
| `==>` 加粗 | 加粗箭头 | **主流量 / 数据复制 / 集群同步** |
| `-.->` 虚线 | 虚线箭头 | 备份 / 监控 / 日志等次要流量 |

⚠️ **跨图符号警示**：`==>` 在 **Deployment 图**表"主流量 / 数据复制"（运行时行为），但在 **Component 图**表"接口实现"（静态结构关系）——含义**完全相反**。这两张图并置时必须显式标注图类型。

### 跨边界标注语法（强制）

跨信任边界的边**必须**在标签前缀加显式标记：

| 标记 | 适用场景 |
|------|---------|
| `[跨VPC]` | 跨 VPC 通信（VPC Peering / Transit Gateway） |
| `[跨region]` | 跨地理区域 |
| `[公网]` | 流量出公网（如调用第三方 SaaS） |
| `[跨驻留]` | 跨数据驻留边界（**合规审查的核心标记**） |

**组合用法**：

```text
Web -->|[跨VPC] HTTPS:443| Payment
API -->|[公网] HTTPS:443 [ADR-007]| ThirdPartyAPI
DB_M ==>|[跨region] 同步复制 [ADR-009]| DB_DR
```

**配套规则**：

- 用 `subgraph` 包围**同一信任域**的节点——VPC、region、数据中心、合规边界各成一个 subgraph
- subgraph 标题写明域名称（如 `subgraph "VPC-prod (cn-shenzhen)"`）
- 这三层组合（subgraph + 前缀标记 + ADR）能让审计人员一眼识别所有需要安全/合规复核的通信路径

### Legend 强制规则

本图使用 `-->` / `==>` / `-.->` 三种线型区分流量类型，按新版方法论 §5.0 属于"团队约定语义"，**必须附 legend**。

### ADR 引用规则（Deployment 图为高优先级）

新版方法论明确：以下三类边**必须**引用 `[ADR-N]`，**Deployment 图是这三类边的集中地**：

- **合规边**：跨数据驻留（`[跨驻留]`）、加密要求、PII 传输、审计追踪
- **跨边界边**：跨 VPC / 跨 region / 出公网 / 跨信任域
- **跨副本同步边**：数据复制（`==>`）、集群心跳、状态同步、leader election

未引用 ADR 的合规边会显著增加审计沟通成本——审计人员第一眼会扫所有带前缀标记和 `⚠️` 符号的边，然后追问每条边的 ADR-N。

## Mermaid 输出格式

- 图类型：`flowchart TB` + 多层 `subgraph` 表达 VPC / 子网 / AZ
- 节点格式：`[实例规格 实例名]`，如 `[c5.large Web Pod ×2]`
- 数据库：`[(...)]`
- 托管服务：`[[...]]` 或在名称里写 "Managed"
- 边标签：`-->|[跨边界前缀]? 协议:端口 [ADR-N]?|`
- **必须附 legend**（解释三种线型的语义）
- **图名与 slug**（命名见 `domain-acquisition.md` §6）：紧跟 `flowchart TB` 落 `%% Name: 〔物理〕部署图·<env>` / `%% Slug: phys-deployment-<env>`
- **不使用 `graph` 关键字**——统一用 `flowchart`

## 自检清单

- [ ] 网络分层清晰？（公网 → DMZ → 应用层 → 数据层）
- [ ] 每条跨信任边界的边都用了 `[跨VPC]` / `[跨region]` / `[公网]` / `[跨驻留]` 前缀标注？
- [ ] 数据持久化位置都画了？
- [ ] 容灾 / 备份 / 复制路径有标注？
- [ ] 出公网的边都标了？（合规审计核心）
- [ ] **合规边 / 跨边界边 / 跨副本同步边都引用了 ADR**？
- [ ] Container 图里每个 container 都能在 Deployment 图找到对应实例？
- [ ] 实例规格写了？（成本测算需要）
- [ ] **附了 legend**？（用 `==>` 或 `-.->` 区分语义必备）
- [ ] 顶层语法是 `flowchart`（不是 `graph`）？
- [ ] 图块紧跟类型声明行有 `%% Name:` / `%% Slug:` 两行（命名见 `domain-acquisition.md` §6）？

## 输出骨架模板

````text
flowchart TB
    %% Name: 〔物理〕部署图·prod
    %% Slug: phys-deployment-prod
    subgraph "公网"
        Browser[用户浏览器]
    end

    subgraph "VPC-prod (cn-shenzhen)"
        subgraph "DMZ 子网"
            ALB[[ALB Managed]]
        end

        subgraph "应用子网 / AZ-a"
            Web1[c5.large Web Pod ×2]
            API1[c5.large API Pod ×3]
        end

        subgraph "数据子网"
            DB_M[(RDS PG 主<br/>db.r6g.xlarge)]
            DB_S[(RDS PG 从)]
            Cache[[Redis Cluster Managed]]
        end
    end

    subgraph "VPC-dr (cn-shanghai)"
        DB_DR[(RDS PG 灾备)]
    end

    subgraph "外部"
        Ext[第三方支付网关]
    end

    Browser -->|[公网] HTTPS:443| ALB
    ALB -->|HTTP:8080| Web1
    Web1 -->|HTTPS:443| API1
    API1 -->|SQL:5432 TLS| DB_M
    DB_M ==>|同步复制 [ADR-009]| DB_S
    DB_M ==>|[跨region] 异步复制 ⚠️ [ADR-014]| DB_DR
    API1 -->|Redis:6379| Cache
    API1 -->|[公网] HTTPS:443 ⚠️ [ADR-007]| Ext
    API1 -.->|监控指标| ALB

    %% Legend:
    %%   -->   常规请求流量
    %%   ==>   主流量 / 数据复制 / 集群同步
    %%   -.->  备份 / 监控 / 日志等次要流量
    %%   ⚠️    需安全/合规复核的边
````

## 信息获取要点（针对本图）

> 获取阶梯（L0 声明扫描 → L1 结构推断 → L2 命名归类 → L3 HITL）定义见 `domain-acquisition.md` §3；下方「Layer 0 重点抽」即本图型的 L0 源清单。

**Layer 0 重点抽**：

- `k8s/**/*.yaml`（Deployment / Service / Ingress / NetworkPolicy）→ 副本数、暴露方式、网络策略
- `docker-compose.yml` 的 `networks` 块 → 网络分段
- `terraform/` / `pulumi/` → 完整云资源拓扑（如果有）
- `.github/workflows/*.yml` → 部署目标环境推断

**典型 HITL 问题**（针对本图最常缺失的字段，需要运维侧信息）：

```
Q1（纯选项）：本图画哪个环境？
   (a) 生产
   (b) 预发
   (c) 测试 / 开发

Q2（开放结构化）：列出主要网络分段，按层级嵌套，每行一个：
   ___
   （例：公网 → ALB DMZ → 应用子网 → 数据子网）

Q3（混合）：是否有跨 region / 跨可用区部署？
   (a) 单 region 单 AZ
   (b) 单 region 多 AZ
   (c) 多 region
   若选 (b) 或 (c)，主要数据复制方向？___
```
