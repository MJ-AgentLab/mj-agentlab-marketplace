# learn-kit 05 · 治理边界

> 学习目标：理解 learn-kit 是"并行子系统"而不是"独立王国"——它如何寄生在项目主治理框架上、自管什么、不管什么、为什么这样划分。
>
> **版本说明**：本文反映 learn-kit v1.0.0 / marketplace v4.0.0（2026-05-14）状态。v0.3.0 起 learn-kit 与 notebooklm-kit 解绑，v1.0.0 起把 NLM 多媒体能力**内化为 `/learn-kit:nlm-studio`**——治理边界从「learn-kit + notebooklm-kit 双插件协作」变为「learn-kit 单插件 5 skill 自洽」。

---

## 0 核心模型：并行子系统

**learn-kit 的 `learning/` 是项目主治理框架的并行子系统**——这是它最重要的治理决策。

```text
                  ┌──────────────────────────────┐
                  │  项目主治理框架               │
                  │  (root CLAUDE.md / docs/...)  │
                  └──────┬───────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  markdown 语法 OB1-OB6 │   ← 共享底层
              │  (heading / list /     │
              │   table / wikilink)    │
              └──────┬───────────────┘
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
   docs/         learning/    项目其他子系统
   主索引        子索引       (tests/ adr/ ...)
   tag 集合      命名 schema
                 frontmatter
                 INDEX 同步
```

**共享底层** + **自管上层** = 既不与主框架冲突，又能独立演化。

> v1.0.0 起 learn-kit 自身**不再是 "Independent plugin"**——它通过 `nlm-studio` skill 引入 `notebooklm-mcp` MCP server 依赖。但**子系统 `learning/` 仍是并行子系统**这一治理立场不变；产物（`.md` / `.html`）仍是纯文本，不锁定。差异在 §4 详述。

---

## 1 共享层：markdown 语法 OB1-OB6

learn-kit `learning/` 下的所有文档都遵守项目通用的 markdown 语法规则：

| 规则 | 内容 |
|------|------|
| OB1 | wikilink 语法（`[[link]]`） |
| OB2 | heading 格式（无 trailing punctuation） |
| OB3 | list marker 一致性 |
| OB4 | code block language tag |
| OB5 | callout 类型限制 |
| OB6 | table pipe escaping |

**意涵**：learn-kit 不重复发明 markdown 规则，依赖项目自带的 `markdownlint` / `prettier` / 自定义 validator 扫 `learning/**/*.md`。

---

## 2 自管层：命名 / 路径 / frontmatter / INDEX / 归档

### 2.1 命名约定

**手工流**：

```text
[LEARNING]_<Source>_<Aspect>.md
```

| 部分 | 规则 |
|------|------|
| `[LEARNING]_` 前缀 | **固定**，与其他 doc tag（`[STANDARD]_` / `[GUIDE]_`）正交 |
| `<Source>` | 源材料简短描述（`RFC_2119` / `OWASP_Top10` / `Security_Policy`） |
| `<Aspect>` | 可选，指明解读哪一面；单一文档可省略 |

**AI 流（v0.3.0+ generate-tier 产出）**：

```text
[LEARNING]_<topic>_<view>.{md,html}
```

| 部分 | 规则 |
|------|------|
| `[LEARNING]_` 前缀 | 与手工流共用 |
| `<topic>` | topic-slug（kebab-case），与目录一级名一致 |
| `<view>` | `foundation` / `structural` / `challenge` 三档之一 |
| `.md` / `.html` | markdown + 可选配对 HTML（同 basename）|

**两种命名共存**：手工流交付**单一 framework 文档**（用 `<Aspect>` 描述切面），AI 流交付**三档分层教学**（用 `<view>` 标 tier）。同 topic 可同时存两种产物。

### 2.2 路径约定（按 topic 分组）

```text
learning/
├── INDEX.md                     # 子系统总入口（独立 INDEX）
├── _meta/                       # 子系统基础设施
│   └── METHODOLOGY.md
├── <topic>/                     # 每 topic 一目录
│   ├── [LEARNING]_<Source>_<Aspect>.md      # 手工流产物（可选）
│   ├── [LEARNING]_<topic>_foundation.md     # AI 流产物（可选）
│   ├── [LEARNING]_<topic>_foundation.html   # AI 流配对 HTML（可选）
│   ├── [LEARNING]_<topic>_structural.md
│   ├── [LEARNING]_<topic>_structural.html
│   ├── [LEARNING]_<topic>_challenge.md
│   └── [LEARNING]_<topic>_challenge.html
└── _archive/                    # 软归档区
    └── <topic>/[LEARNING]_*.md
```

> v0.2.x 时代曾创建 `_meta/NLM_RECORD_TEMPLATE.md` + `<topic>/_nlm/` 目录（NotebookLM 元信息持久化）。v0.3.0 起删除（与 notebooklm-kit 解绑）；v1.0.0 起 `/learn-kit:nlm-studio` 改为**零本地落盘**——所有 NLM artifact URL 仅打印到终端，**不**再写 `_nlm/` 任何文件。若仍残留请手动删。

**topic 选取原则**：

| 场景 | topic 选取 |
|------|-----------|
| 单 STANDARD / POLICY 解读 | 以源材料缩写为 topic |
| 跨多源解读 | 以主题域为 topic |
| 多 RFC 解读聚类 | `rfc/` 总目录 |
| 不确定 | 先建较粗的 topic，后续按需细分 |

### 2.3 Frontmatter Schema

**手工流 schema**（9 字段，由人按方法论填写）：

```yaml
---
type: "learning"                                       # 固定值
topic: "<topic>"                                       # 与路径一级目录一致；_meta 表示基础设施
summary: "<1-2 行说明本文学习目的>"
source: "<source ref, e.g., 'RFC 2119' or '[[STANDARD]_X#§Y]]'>"
methodology: "[[../_meta/METHODOLOGY|本方法论]]"        # 引用方法论
tags: [learning, <topic>, ...]                         # 自由标签
aliases: [..., ...]                                    # 别名（Obsidian / wiki 等）
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
state: "draft | active | archived"                     # 三态枚举
version: "vX.Y"                                        # 必需——学习材料随源演化
---
```

**AI 流 schema**（由 generate-tier 自动写）：

```yaml
---
type: learning-tier                                    # 与手工流区分
topic: <topic>
view: <foundation | structural | challenge>            # AI 流专有
source_question: <user_question 原文>
source_docs:
  - <path1>
  - <path2>
generated_at: <ISO8601 UTC>
generator: learn-kit/generate-tier v1.0.0              # 审计 trail
---
```

**两种 schema 区分**：

| 字段 | 手工流 | AI 流 |
|------|--------|-------|
| `type` | `learning` | `learning-tier` |
| `summary` / `source` / `methodology` / `aliases` | ✓ 必备 | — |
| `view` | — | ✓ 必备（三档之一）|
| `source_question` / `source_docs` / `generated_at` / `generator` | — | ✓ 必备（审计 trail）|
| `created` / `updated` / `state` / `version` | ✓ | — |

scan / locate skill 通过 `type` 字段区分两类产物：

- `type: learning` → 手工流 framework 文档（locate 命中后建议 Read）
- `type: learning-tier` → AI 流分层文档（locate 命中后建议先读 foundation 再 structural / challenge）

### 2.4 INDEX 同步策略（关键设计）

**独立 `learning/INDEX.md`**——**与项目主索引解耦**：

| 选项 | 选择 | 理由 |
|------|------|------|
| A. 与主 INDEX 合并 | ❌ | 污染面向 AI / 检索的 canonical 索引 |
| B. 完全不维护 INDEX | ❌ | locate 无法做 INDEX 命中（confidence 0.95 失效） |
| **C. 独立 learning/INDEX.md** | ✅ | 子系统自管 + 主索引可外链一行 |

**主索引可加一行外链**：

```markdown
- [Learning Subsystem](./learning/INDEX.md)
```

**不展开内部条目**——主索引保持简洁。

**`learning/INDEX.md` 内部结构**（v0.3.0+ 起增加 §Tier Documents 段）：

```markdown
## Topics (手工流)
| Topic | Document | Source | Updated |

## Tier Documents (AI 流，由 generate-tier 自动追加 / 更新)
| Topic | View | Markdown | HTML | Last Generated |
```

**强制规则**：新建 / 重命名 / 归档 learning 文档时**必须同步** `learning/INDEX.md`。AI 流的 generate-tier 自动写 §Tier Documents 行；手工流的 §Topics 段由作者手动维护。

### 2.5 链接规则

| 链接方向 | 建议格式 |
|---------|---------|
| learning → 项目 canonical docs | 项目自定（wikilink 或 markdown link） |
| learning → learning（同 topic） | 相对 markdown link 或 wikilink |
| learning → `_meta`（方法论） | 相对 link |
| 项目 canonical docs → learning | **不强求**（避免 canonical 被 learning 污染） |
| AI 流 HTML 中 → 仓库代码 | 相对路径 + line range（Explore subagent 做 concept→code grounding 时自动生成） |

**禁止**：

- 绝对路径
- 不可控的外部 URL（除真正的外部参考资源）

### 2.6 删除 / 归档策略（4 选项 + 推荐）

源材料演化后，对应学习文档怎么处理？

| 选项 | 描述 | 优势 | 劣势 |
|------|------|------|------|
| A. **永久保留** | 旧解读永远在主目录，加 `state: archived` | 完整教学历史 | INDEX 杂乱 |
| B. **硬覆盖** | 源演化立即重写，旧版不留 | 主目录始终最新 | 丢失教学历史 |
| **C. 软归档**（**推荐**） | 主目录始终"当前最新"；旧版移 `learning/_archive/` | 主目录干净 + 历史可追 | 需维护 `_archive/` 索引段 |
| D. **版本并存** | 同 topic 多版本同存 | 不删任何东西 | 读者困惑 + 维护成本高 |

**推荐 C 软归档的标准操作**：

1. 旧解读移 `learning/_archive/<topic>/`，保持原文件名
2. frontmatter 加：
   ```yaml
   state: archived
   replaced-by: "<link to current>"
   ```
3. 主目录 INDEX **不展开** `_archive/`；archive 区单独维护索引段

> **AI 流的 generate-tier 不支持归档**：它只提供 Overwrite / `.v2` 后缀 / Skip / Abort 四种冲突策略；要归档必须用户手动执行 §2.6 软归档流程。

---

## 3 不带额外自动化 skill 的决策（v1.0.0 修订）

**learn-kit 保持轻量**——5 skill 各自单一职责，不引入额外编排：

### 3.1 不做哪些

| 不做 | 原因 |
|------|------|
| ❌ 交互式 8 阶段引导 skill | 8 阶段是认知框架，需用户**手动**应用建立 mental model |
| ❌ 自带 markdown validator | 用项目通用 markdownlint / prettier |
| ❌ 集中索引服务 | 索引在 `learning/INDEX.md`，locate / scan 即时扫描 |
| ❌ 持久 cache | stateless = robust + 零维护 |
| ❌ NLM artifact 二进制下载 | v1.0.0 nlm-studio 设计为**在线浏览**；下载会增加维护负担 + 不是核心场景 |
| ❌ 出 quiz / flashcards / data_table | v4.0.0 永久放弃（外部工具替代）|
| ❌ 跨 notebook query / Deep Research | v4.0.0 永久放弃（NLM web UI 替代）|
| ❌ Append-keep-old NLM source 模式 | NLM 不去重 source；append 会让 12 个 mixed-vintage source 共存，混淆 LLM |

### 3.2 这样划分的好处

1. **学习者主导**：方法论是认知工具，过度自动化会让人略过思考
2. **5 skill 边界清晰**：init scaffold / scan 枚举 / locate 反查 / generate-tier AI 生成 / nlm-studio 多媒体——各自单一职责，互不抢任务
3. **零本地状态**：除 generate-tier 写 `learning/` 文件 + init scaffold 外，其他 skill stateless（nlm-studio 通过 NLM 端 `studio_status` 查既存 artifact 做幂等，**不**用本地状态文件）
4. **无锁定**：用户随时弃用 learn-kit 不留技术债（只是一堆 `.md` 文件 + 一些 NLM 上的 notebook，notebook 可在 web UI 手动删）
5. **正交于主框架**：不干涉项目主治理决策

---

## 4 v1.0.0 起的依赖与可选集成

v0.x 时代 learn-kit 的「治理边界」段强调与 `notebooklm-kit` 的协作（生成 NLM 制品委托外部插件）。v1.0.0 这部分**整体重构**：

### 4.1 v0.x → v1.0.0 关键变化

| 维度 | v0.2.x（双插件协作）| v0.3.0（解绑过渡）| v1.0.0（单插件内化）|
|------|-------------------|------------------|-------------------|
| NLM 多媒体场景 | 委托 `notebooklm-kit:learn-make` | **不主动 promote**（learn-kit 不再引 notebooklm-kit）| **内化为 `/learn-kit:nlm-studio`** |
| `_nlm/` 元信息目录 | 推荐建（NLM_RECORD_TEMPLATE schema）| 模板删除（learn-kit 不再 scaffold）| **零本地落盘**（终端打印 URL）|
| Independent plugin 宣称 | ✓ 显式声明 | ✓ 显式声明 | ❌ **撤销**——nlm-studio 引入 notebooklm-mcp MCP 依赖 |
| Marketplace 插件数 | learn-kit + notebooklm-kit | 同上 | **仅 learn-kit**（notebooklm-kit 整退役）|

完整决策记录见 `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md`（v4.0.0 ADR）。

### 4.2 当前依赖矩阵（v1.0.0）

| Skill | 外部依赖 | 联网 |
|-------|---------|------|
| init | ❌ 无 | ❌ |
| scan | ❌ 无 | ❌ |
| locate | ❌ 无 | ❌ |
| generate-tier | Claude Code LLM 调用（内置）| ❌ 本地 |
| **nlm-studio** | **notebooklm-mcp MCP server**（一次性 `uv tool install`）+ **`nlm login` OAuth**（一次性，token 短寿 15-30 min 内自动 refresh）| ✅ NotebookLM API |

前 4 个 skill **零外部依赖**；仅 nlm-studio 联网。

### 4.3 与 markdownlint / 其他 validator

learn-kit 不带验证 skill——建议项目自带：

- `markdownlint-cli`
- `prettier`
- 项目自定 validator

扫 `learning/**/*.md` 检查 OB1-OB6 类基础语法。这条**未变**——与 v0.x 一致。

### 4.4 与 mj-system / mj-agent 等下游消费者

learn-kit 是**通用插件**，可在任意项目安装。下游消费者（mj-system / mj-agent / 任意外部项目）只需：

1. `/plugin install learn-kit@mj-agentlab-marketplace`
2. 在项目根 CLAUDE.md 声明 `[STANDARD]_/[SPEC]_/...` tag prefix（提高 scan / locate 识别 confidence）
3. 跑 `/learn-kit:init` scaffold `learning/` 子系统骨架

不强制下游消费者做任何 marketplace-side 治理同步——learn-kit 的产物 `learning/` 完全由下游项目自管。

---

## 5 子系统元规则一图速查

```text
┌─────────────────────────────────────────────────────────────┐
│  learning/ 子系统元规则（METHODOLOGY.md §9）                │
├─────────────────────────────────────────────────────────────┤
│  9.1 何时建      │ 不预设触发，用户手动判断                │
│  9.2 命名        │ 手工流: [LEARNING]_<Source>_<Aspect>.md  │
│                  │ AI 流:  [LEARNING]_<topic>_<view>.{md,html}│
│  9.3 路径        │ learning/<topic>/                       │
│  9.4 frontmatter │ 手工流 9 字段 / AI 流 7 字段（type 区分） │
│  9.5 INDEX       │ 独立 learning/INDEX.md，强制同步         │
│                  │ §Topics（手工流）+ §Tier Documents（AI 流）│
│  9.6 链接        │ 相对 link，禁绝对路径                   │
│  9.7 归档        │ C 软归档推荐（_archive/<topic>/）        │
└─────────────────────────────────────────────────────────────┘
```

---

## 6 版本演化策略（vX.Y 语义版本）

learn-kit 自身的版本约定：

| 版本变化 | 触发 |
|---------|------|
| **vX.0 Major** | (a) sub-framework 整体成熟度跨阶段；§9 元规则结构化扩展；(b) **新增 / 删除外部依赖**（如 v1.0.0 引入 NLM 依赖、退役 notebooklm-kit）|
| **vX.Y Minor** | 加新 case 后某章节小幅扩展；加新 skill（如 v0.2 加 scan/locate；v0.3 加 generate-tier）；不破坏既有 frontmatter schema |
| **vX.Y.Z Patch** | 措辞 / 例子 / typo 修正 / 单字段补 |

**Tier 升级条件**：

| 升级方向 | 触发条件 |
|---------|---------|
| GUIDE-tier → STANDARD-tier | ≥ 5 case 跨域验证（覆盖 ≥ 4 个独立行业 / 比喻世界）+ 几何不变量证实 |
| STANDARD-tier 内部 minor | 新加 ≥ 1 case 暴露的边界 |
| STANDARD-tier 重构 | 几何不变量被否（某 case 不能成 N 维 AND-gate）→ 重新验证基础假设 |

**版本里程碑**：

| 版本 | 关键事件 |
|------|---------|
| v0.1（2026-05-11）| 剥离自上游 mj-system v2.0；含 init + METHODOLOGY |
| v0.2（2026-05-11）| 加 scan + locate；METHODOLOGY 加 §1.5 Project Discovery |
| v0.3（2026-05-13）| 加 generate-tier；与 notebooklm-kit 主动解绑 |
| v0.3.1 | plugin.json repository field schema fix（patch） |
| **v1.0**（2026-05-14）| 加 nlm-studio NLM 多媒体；吸收 notebooklm-kit 核心场景；marketplace 收敛 1 plugin；首个 stable release；撤销 "Independent plugin" 宣称（**触发 major 的标志**：新增外部依赖）|

---

## 7 与上游 mj-system 的关系

| 维度 | 上游 mj-system v2.0 | 通用化 learn-kit v1.0 |
|------|-------------------|----------------------|
| 覆盖 case | HITL / svc-arch / sql-format / db-design / db-naming | RFC 2119 单 worked example + 用户自跑案例 |
| 引用 | 含 MJ 特有路径 / 文档 | 完全 de-MJ-ified |
| 方法论核心 | 8 阶段 + N=5 几何不变量 | **保留不变** |
| 子系统元规则 | 9 节 | **保留**（v1.0.0 扩 §9.4 frontmatter 增加 AI 流 schema 描述） |
| 6 类失真自检 | 6 类 | **保留不变** |
| 产出模式 | 单一手工流 | **扩展为 3 种**：手工流 + AI 流（generate-tier）+ 多媒体流（nlm-studio）|
| 外部依赖 | 无声明 | nlm-studio 依赖 notebooklm-mcp + nlm login |

**关键设计选择**：上游证据（N=5 验证）的**结论**保留，但具体案例**不**移植——通用版本只保留 RFC 2119 单一 worked example，用户自己跑案例验证。

**v1.0.0 起的新选择**：把 AI 自动化（generate-tier + nlm-studio）**内化**到通用 learn-kit 里；上游 mj-system v2.0 时代是纯手工流，没有 AI 自动化层。

---

## 8 治理边界关键判断题

| 问题 | 答案 |
|------|------|
| `learning/INDEX.md` 应该并入主 `docs/INDEX.md` 吗？ | ❌ 不要——会污染 canonical 索引 |
| `[LEARNING]_*.md` 应该归 `docs/` 还是 `learning/`？ | `learning/` —— 不混入 canonical |
| 项目主 INDEX 要不要展开 `learning/` 内部条目？ | ❌ 不要——只放一行外链 |
| canonical docs 要不要回链 learning？ | 不强求，避免反向污染 |
| 旧解读源演化后怎么办？ | C 软归档（`_archive/<topic>/` + `state: archived` + `replaced-by`） |
| 改方法论自身（METHODOLOGY.md）算什么变更？ | 看影响：触发 vX.0 / vX.Y / vX.Y.Z |
| markdown 语法错怎么办？ | 用项目通用 markdownlint，learn-kit 不重复发明 |
| 想加自动 8 阶段引导 skill？ | 刻意不做——破坏认知框架的手动应用价值 |
| 同 topic 有手工流 framework + AI 流三档，怎么共存？ | 共存于 `learning/<topic>/`，frontmatter `type` 字段区分（`learning` vs `learning-tier`）。两者职责互补：手工流交付 framework 一份，AI 流交付分层教学三份 |
| AI 流的 generate-tier 写错了，怎么回滚？ | 当前不支持自动归档；用户走 §2.6 软归档流程手动操作；或重跑 generate-tier 选 `.v2` 后缀 |
| nlm-studio 产生的 NLM 上 13 个 artifact 算 `learning/` 的一部分吗？ | **不算**。它们在 `notebooklm.google.com`，不在本地仓库；nlm-studio 零本地落盘。要管理 artifact 用 NLM web UI |
| v1.0.0 起 learn-kit 不再是 Independent plugin，治理影响是？ | 主要影响 (a) plugin.json description 改写；(b) 用户必须 `nlm login` 才能用 nlm-studio；(c) 前 4 个 skill 仍零外部依赖。`learning/` 子系统的并行子系统立场**不变** |
| 项目无 CLAUDE.md tag 约定时，locate / scan 还能用吗？怎么改善置信度？ | 能用，走低置信度 fallback；改善方式：(a) 在 CLAUDE.md 声明 ≥ 2 个 tag prefix；(b) 跑 `/learn-kit:init` 建 learning/INDEX.md |

---

## 9 关键源文件指针

| 想知道什么 | 读哪里 |
|----------|--------|
| 子系统元规则全文 | `plugins/learn-kit/skills/init/templates/METHODOLOGY.md` §9 |
| 可选集成声明（v1.0.0 已重写）| METHODOLOGY.md §10（建议读 plugins/learn-kit/CLAUDE.md「NLM 集成」段获取最新）|
| 版本演化策略 | METHODOLOGY.md §12 |
| 插件治理边界声明 | `plugins/learn-kit/CLAUDE.md` |
| README 的"治理边界"段 | `plugins/learn-kit/README.md` §"治理边界" |
| v4.0.0 退役决策（决定不再 Independent 的 ADR） | `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md` |
| v3.x → v4.0.0 迁移（含 `_nlm/` 残留清理）| `docs/MIGRATION_GUIDE.md` §2 |
| nlm-studio 零本地落盘的设计 | `plugins/learn-kit/skills/nlm-studio/SKILL.md` §5 + §"focus_prompt composition contract" |

---

## 10 自检问题

1. 为什么 `learning/INDEX.md` 不并入主 `docs/INDEX.md`？
2. C 软归档相比 B 硬覆盖的优势是什么？为什么不选 A 永久保留？
3. learn-kit 为什么刻意不带交互式 8 阶段引导 skill？
4. 手工流 frontmatter 9 字段中，`version: vX.Y` 为什么必需？AI 流 frontmatter 没有 version 字段，怎么追溯？（提示：`generator` + `generated_at`）
5. 同 topic 怎么区分手工流 vs AI 流的产物？scan / locate 用哪个字段识别？
6. learn-kit v1.0.0 起声明撤销 "Independent plugin"，这是治理上的退步还是改进？为什么？
7. AI 流的 generate-tier 是否会自动归档旧 tier？为什么这样设计？用户应该怎么手动归档？
8. nlm-studio 生成的 13 个 NLM artifact 不在本地 `learning/` 中——这违反"零外部依赖"原则吗？为什么仍把 nlm-studio 划归 learn-kit 而不是外部插件？
9. 项目无 CLAUDE.md tag 约定时，locate / scan 还能用吗？怎么改善置信度？
10. v0.x → v1.0.0 主版本 bump 触发条件是「新增 / 删除外部依赖」。这个规则跟 §6 §6 「vX.0 Major 触发条件」原先只有 (a) 一条，v1.0.0 加 (b) 是 retrofit；还是 v0.x 时代就该有？为什么补充？
11. 把方法论从 v0.x 升到 v1.0 需要什么条件？升到 v0.2 / v0.3 呢？
12. 假设 NotebookLM 明天倒闭，learn-kit 受什么影响？哪几个 skill 仍可用？这种"局部依赖"是否值得付出失去 "Independent plugin" 标签的代价？
