# Code Diagram — 代码图绘制

> 〔命名规范见 `domain-acquisition.md` §6〕规范名 **〔结构·L4〕代码图**；slug `struct-l4-code`（按聚焦的类簇 / 模式加后缀，如 `struct-l4-code-<簇>`）。每张图须紧跟 `classDiagram` 落 `%% Name` / `%% Slug`（见骨架）。

## ⚠️ Pre-check：是否真的需要手绘（**必先跑**）

C4 的 Code（L4）层**绝大多数情况不该手绘**——类级细节由 IDE / 工具自动生成（`pyreverse`、`tplant`、IDE 的 class diagram）更准、更不易过期。**默认不画整库**；仅在以下情况手绘**一小片关键切面**：

- ✓ 值得手绘：一个核心设计模式落地（策略 / 工厂 / 状态机实现类簇）、一个 DDD 聚合根 + 值对象 + 仓储接口的关系、一段需评审的继承 / 依赖反转结构
- ✗ 不值得：整个 container 的所有类、自动可生成的 CRUD / DTO、"想全画一遍"

发现用户想"把整个模块的类都画出来"时，**先反问**：

```
Code/L4 图通常不手绘整库——类级细节交给 IDE / pyreverse 自动出更准。
你大概率只需要其中一小片，请选：

(a) 只画 <某核心模式 / 聚合根 / 关键继承簇> 的类关系（推荐，手绘有价值）
(b) 整个 container 的模块依赖 → 那其实是 Component 图（struct-l3-component），改画它
(c) 运行时对象怎么协作 → 那是 Sequence 图（dyn-sequence-*）

请选 a/b/c，或描述要评审的具体结构：___
```

只有用户明确要画某一关键类簇（a）时才继续走下面的标准流程。

---

## 框架定位

- **4+1 视图**：Development
- **C4 层级**：Level 4（最细；Component 之下的类 / 接口级，**极少手画**）
- **主要受众**：实现该模块的开发者 / code reviewer / 接手复杂设计的新人
- **使用场景**：核心设计模式评审、DDD 聚合根建模、继承 / 依赖反转结构评审、复杂算法类簇的实现前设计

## 必含元素

1. **一个聚焦的类簇**（一张图只讲一个模式 / 一个聚合根 / 一组协作类，不画整库）
2. 关键类 / 接口 / 抽象类（带**关键**字段与方法，非全部成员）
3. 类间关系：继承、实现、组合、聚合、依赖（按下方边语义）
4. 关键设计意图：用 `note` 标注，可附 `[ADR-N]`

## 禁含元素

- ❌ 整个 container / 模块的所有类（那是 Component 图 `struct-l3-component`，或交给工具自动生成）
- ❌ 琐碎 getter/setter、DTO 字段全列、框架样板
- ❌ 运行时调用时序（那是 Sequence 图 `dyn-sequence-*`）
- ❌ 多个不相关类簇混在一张图
- ❌ 类数量 > 10~12（超了说明该拆，或该退回 Component 层）

## 边的语义规则

`classDiagram` 关系是 Mermaid **工具原生语义**，按方法论 §5.0 **不强制 legend**（与 Sequence / State 图同理）：

| Mermaid | 含义 |
|---|---|
| `A <|-- B` | B 继承 A（泛化）|
| `A <|.. B` | B 实现 A 接口（realization）|
| `A *-- B` | A 组合 B（强生命周期）|
| `A o-- B` | A 聚合 B（弱）|
| `A --> B` | A 关联 / 依赖 B |
| `A ..> B` | A 临时依赖 B（参数 / 局部）|

- 方向表达依赖 / 所有权；**接口实现箭头从实现类指向接口**（与 Component 图依赖反转同源——所有权方被指向）。
- 关键设计决策（模式选型、依赖反转）建议 `note` + `[ADR-N]`。

## Mermaid 输出格式

- 图类型：`classDiagram`
- 类：`class 类名 { +字段 +方法() }`（**只列关键成员**）
- 接口 / 抽象：用 `<<interface>>` / `<<abstract>>` 注记
- 关系用上表符号；`note for 类名 "..."` 标设计意图
- **图名与 slug**（命名见 `domain-acquisition.md` §6）：紧跟 `classDiagram` 落 `%% Name: 〔结构·L4〕代码图·<簇>` / `%% Slug: struct-l4-code-<簇>`
- **不强制 legend**（工具原生语义）

## 自检清单

- [ ] 只画了一个聚焦类簇（不是整库）？类数 ≤ 12？
- [ ] 是否其实该退回 Component 图（`struct-l3-component`）或交给工具自动生成？
- [ ] 只列了关键字段 / 方法，没堆砌琐碎成员？
- [ ] 关系符号用对了？（继承 `<|--` / 实现 `<|..` / 组合 `*--` / 依赖 `-->`）
- [ ] 接口实现箭头从实现类指向接口？
- [ ] 关键设计意图 / 模式有 `note`（必要时附 ADR）？
- [ ] 图块紧跟 `classDiagram` 有 `%% Name:` / `%% Slug:` 两行（命名见 `domain-acquisition.md` §6）？
- [ ] 顶层语法是 `classDiagram`？

## 输出骨架模板

````text
classDiagram
    %% Name: 〔结构·L4〕代码图·<簇>
    %% Slug: struct-l4-code-<簇>
    class IRepository {
        <<interface>>
        +get(id) Entity
        +save(e) void
    }
    class PgRepository {
        +get(id) Entity
        +save(e) void
    }
    class DomainService {
        +execute(cmd) Result
    }
    class Entity {
        +id
        +state
    }

    IRepository <|.. PgRepository : 实现
    DomainService --> IRepository : 依赖(反转)
    DomainService ..> Entity : 操作
    PgRepository o-- Entity : 重建

    note for IRepository "依赖反转：Domain 定义接口，Infra 实现 [ADR-005]"
````

## 信息获取要点（针对本图）

> 获取阶梯（L0 声明扫描 → L1 结构推断 → L2 命名归类 → L3 HITL）定义见 `domain-acquisition.md` §3；下方「Layer 0 重点抽」即本图型的 L0 源清单。

**Layer 0 重点抽**：

- 目标类簇的源码文件（class / interface 定义）→ 类、字段、方法
- 继承 / `implements` / `extends` / ABC 声明 → 泛化与实现关系
- 构造函数注入 / 类型注解 → 组合、聚合、依赖方向
- 设计模式痕迹（`Strategy` / `Factory` / `*Repository` 命名）→ 该聚焦哪一簇
- `pyreverse` / IDE 自动类图 → 可作底稿，再裁剪到关键切面

**典型 HITL 问题**（仅当上述挖不到时）：

```
Q1（开放带示例）：要画哪一个类簇 / 设计模式？（一张图一个）
   （例：QCM 指标计算的策略+工厂、DQV 三阶段处理类、某聚合根+仓储）

Q2（纯选项）：聚焦点是？
   (a) 一个设计模式的落地类
   (b) 一个 DDD 聚合根 + 值对象 + 仓储接口
   (c) 一段需评审的继承 / 依赖反转结构

Q3（开放结构化）：列出该簇的关键类 / 接口，每行一个（标关键字段 / 方法即可）：
   ___
```
