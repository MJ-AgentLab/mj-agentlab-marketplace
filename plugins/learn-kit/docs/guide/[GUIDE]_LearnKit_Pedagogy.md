---
type: guide
scope: learn-kit
summary: learn-kit 教学方法论合卷 — 定位 + 8 阶段方法论 + RFC 2119 worked example + 6 类质量门 / 8 反模式；新读者 30 分钟掌握 learn-kit 全部教学层面
owner: marketplace-maintainers
created: 2026-05-18
updated: 2026-05-18
state: active
version: v1.0
domain: plugin-internal
tags:
  - pedagogy
  - methodology
  - learn-kit
  - worked-example
related:
  - ./[GUIDE]_LearnKit_Design.md
  - ../../README.md
  - ../../CLAUDE.md
supersedes:
  - ../../../../docs/archive/[DEPRECATED]_learn-kit-01-positioning_v1.0.md
  - ../../../../docs/archive/[DEPRECATED]_learn-kit-02-eight-stage-methodology_v1.0.md
  - ../../../../docs/archive/[DEPRECATED]_learn-kit-03-rfc-2119-worked-example_v1.0.md
revision: |
  2026-05-18 — v1.0: 合并自原 learn-kit-01-positioning.md (222) + learn-kit-02-eight-stage-methodology.md (269) + learn-kit-03-rfc-2119-worked-example.md (274)；改名为 [GUIDE]_ 合规命名；放入 docs/guide/ 子目录；加 8 字段 frontmatter
---

# [GUIDE] learn-kit Pedagogy

> 教学合卷。涵盖 learn-kit 的定位与差异化、8 阶段手工方法论、RFC 2119 完整 worked example、6 类质量门 + 8 跨阶段反模式。**新读者建议顺序阅读**；老读者可按 §1 / §2 / §3 / §4 分别跳读。

---

## §1 Positioning（learn-kit 是什么 / 不是什么 / 何时用）

### §1.1 一句话定位

> **从一堆「必须 / 不应」条款，到一份可读（markdown）/ 可看（HTML）/ 可听（NLM audio）/ 可演（slide / video）的学习产物。**

learn-kit 是把**枚举型规则清单**转化为**多形态学习材料**的插件家族，提供 3 种产出模式:

| 模式 | 由谁主导 | 产出形态 |
|------|---------|---------|
| **手工流**（v0.1+ 原始能力）| 人 | 5 件套 `[LEARNING]_*.md`（按 8 阶段手写）|
| **AI 流**（v0.3.0+）| AI（人指挥）| 三档 `[LEARNING]_<topic>_{F,S,C}.md` + 可选交互式 HTML |
| **多媒体流**（v1.0.0+）| AI（NLM 后端）| 至多 13 个在线 audio / video / slide / mind_map / infographic |

外加 2 个 discovery skill（locate / scan）服务全部三种模式的「发现 → 进入」。

### §1.2 适用 vs 不适用（最关键的边界）

**适用源材料**:

| 形态 | 例子 |
|------|------|
| 编号或并列的规则清单 | RFC keyword list、API style guide §「必须 / 不应」小节 |
| 5–30 条最优 | 少于 5 不需要框架；多于 30 需要先分组 |
| 同类型条款扎堆 | 「必须 / 不应」二分、「高 / 低」二分 |
| 条款之间有共性可归纳 | 不是完全异质的散点信息 |

**适用产出形态**:

- **手工流**：人类阅读用，建立 mental model，目标是**一份 framework 文档**
- **AI 流**：按读者深度切三档，目标是**学习课程式**分层教学
- **多媒体流**：同一主题多模态，目标是**适应不同学习场景**（通勤 / 评审 / poster）

**不适用** —— 8 项 checklist:

| 不适用 | 应换的工具 |
|------|-----------|
| 顺序教程（Tutorial flow） | Tutorial 模板 |
| 查阅参考（Reference manual） | Lookup 模板 |
| 故障复盘 | POSTMORTEM 模板 |
| 架构图 / 数据流 / 代码逻辑 | 非规则枚举源材料，暂不适用本方法论 |
| 规则少于 5 条 | 3 条规则脑子直接记，强行抽象出 3 个轴反而扭曲 |
| 规则之间完全异质 | 归纳不出共性轴 |
| 源材料是流程 / 时间序列 | 用 BPMN / Mermaid sequence |
| 团队尚无项目治理框架 | learn-kit 的产物 `learning/` 是子系统，需寄生在主治理上 |
| 想要 quiz / flashcards / 跨 notebook 查询 | v4.0.0 永久放弃；用外部评估工具或 NotebookLM web UI 直接跑 |
| 完全离线环境 | 手工流可离线；AI 流需 Claude Code 联网；多媒体流需 NotebookLM 在线账号 |

**判别口诀**：源材料是「枚举型规则清单」且读者要建 mental model → 用 learn-kit；否则用别的。

### §1.3 与同类思路的差异

| 工具 | 输入 | 输出 | learn-kit 差异 |
|------|------|------|---------------|
| LLM auto-summarize | 任意文本 | 几段摘要 | 摘要无框架、无类别、不可复用学习；learn-kit 手工流交付 5 件套，AI 流交付**分层三档** |
| RAG 检索 | 任意文本 + query | 相关片段 | 检索不建框架，每次查询都重做；learn-kit 产出物**持久化**到 `learning/`|
| 教程生成器 | 规则清单 | 「1, 2, 3」顺序教程 | 顺序教程是过程导向，learn-kit 是决策框架导向（手工流）或分层教学导向（AI 流）|
| 思维导图工具 | 任意主题 | 树状视觉化 | 思维导图只是 5 件套中的 1 件；learn-kit 手工流要求全 5 件，多媒体流 mind_map 只是 13 artifact 之一 |
| 干读 STANDARD 文档 | 30 条规则 | 记不住 | learn-kit 的存在前提：原始清单「密度太高人脑承不住」|
| 通用 LLM「把这个文档解释给我」| 文档 + 一次性 prompt | 一次性会话 | learn-kit AI 流**产出持久化文档**（写到 `learning/<topic>/`），可重复阅读、可挂代码 grounding、可推 NLM 出多媒体 |
| NotebookLM 直接用 | 自己丢 docs 进 NLM | NLM artifact | learn-kit 多媒体流的 source 是**精炼后的三档** markdown（已经分层 + 已经做过 view-purpose 设计），artifact 质量上限更高；且不用手工管 notebook |

**核心差异**：learn-kit 强制「**先把源材料消化成 mental-model-friendly 的结构，再多形态输出**」——而其他工具要么只做摘要、要么只做检索、要么不做结构化、要么直接吃原料丢 NLM。

### §1.4 起源与成熟度（N=5 跨域验证）

- **上游**：从邻居项目的 STANDARD-tier 学习子系统剥离而来；本仓内通用化处理后不引用原始上游
- **验证基础**：**N=5 跨域 case 验证**
  - 5 个独立行业（HITL 协作 / 服务架构 / SQL 语法 / DB 设计 / DB 命名）
  - rules 跨度 8–63 条
  - dimensions 跨度 3–5 维
  - 5 个独立比喻世界
  - 全部 N 维 AND-gate 几何不变量
- **通用化**：剥离上游引用，保留方法论核心 + 子系统元规则 + 6 类失真自检
- **演化里程碑**：
  - v0.1（2026-05-11）：init + METHODOLOGY scaffold
  - v0.2（2026-05-11）：加 scan + locate 两个 discovery skill
  - v0.3（2026-05-13）：加 generate-tier AI 三档生成 + 交互式 HTML
  - v1.0（2026-05-14）：加 nlm-studio NLM 多媒体；吸收原 notebooklm-kit 核心场景；marketplace 收敛为 1 plugin
  - v1.2（2026-05-18）：plugin-internal docs 重组（6 教学系列 → 2 份 [GUIDE]）

N=5 跨域验证是手工流方法论核心说服力的来源——方法论不是单一案例的产物，是 5 个独立域都验证通过后才稳定下来的。

---

## §2 8 阶段手工方法论

> 教学序：把散乱的 N 条规则压成 5 件套（框架 + 类别 + 比喻 + 图 + 口诀）。每阶段配「目标 / 原则 / 示例 / 反例 / 检查清单」5 件。

| # | 阶段 | 核心动作 | 交付 |
|---|------|---------|------|
| 1 | **Source Intake** | 摸源材料的 shape | 条款数、原始分组、伪框架标记 |
| 2 | **Framework Induction** | 诱出 3–7 个独立轴 | N 维抽象框架 |
| 3 | **Categorical Alignment** | 类别对仗轴 | N 个类别小标题 |
| 4 | **Asymmetry Handling** | 显式处理非对称 | 对比表（多数端 vs 少数端） |
| 5 | **Terminology Pairing** | 英文术语 + 本地比喻名 | 每类四件齐备 |
| 6 | **Metaphor Unification** | 选定单一比喻世界 | 同域内所有比喻 |
| 7 | **Page Assembly** | 演绎序装订 | TL;DR → 框架 → 类别 → 图 → 口诀 |
| 8 | **Quality Gates** | 6 类失真自检 | 通过 = 可交付 |

### §2.1 Stage 1 · Source Intake（源材料入料）

**核心目标**：动笔前先看源材料的 shape。

**3 个动作**:

1. **数清条款数**——规模决定颗粒度：5–15 条 → 3–5 轴；20–30 条 → 5–7 轴
2. **找原始分组**——「必须 / 不应」、「高 / 低」等二分作归纳起点，**但不是最终框架**
3. **不被原始顺序绑架**——源呈现顺序是历史成因，不是逻辑成因；归纳时打散重排

**反例**：直接按源顺序逐条解读 → 变成翻译，无抽象增量。

**检查清单**:
- [ ] 知道总条款数
- [ ] 列出所有原始分组
- [ ] 标记可疑的「伪框架」（容易被错认成骨架的原始二分）

### §2.2 Stage 2 · Framework Induction（框架归纳）

**核心目标**：诱出抽象骨架——通常 3–7 个独立维度。

**4 条原则**（最关键的阶段）:

1. **骨架先于细节**：先找轴，再让规则归位
2. **维度独立**：每个轴必须能独立判定，**不能两轴同时触发同一情形**
3. **行业有词根**：每个轴都应有标准工程术语（Wikipedia / 经典工程书可查到）
4. **轴的总数 3–7**：少于 3 太粗，多于 7 记不住

**典型反例**:

| 反例 | 为什么错 |
|------|---------|
| 按「风险高低」分 | 这是程度，不是维度 |
| 按「动作类型」分 | 与源结构重合，无抽象增量 |
| 把 MUST 和 SHOULD 合成「高强制」 | 维度不独立 |
| 自造词（「严格度」、「刚性」）| 没有行业知识网络可挂 |

**检查清单**:
- [ ] 每个轴对应至少 1 条源规则
- [ ] 每条源规则只归一个轴
- [ ] 每个轴有标准行业术语
- [ ] 轴的总数 3–7

### §2.3 Stage 3 · Categorical Alignment（类别对仗框架）

**核心目标**：正文小标题与框架轴**一一对应**——不能「框架在 §1，类别用别的分法」。

**3 条原则**:

1. **类别 = 轴的具象化**：类别 A 必须是 X 轴的某个极
2. **类别命名三件齐备**：「类别 X · {EnglishTerm} {极性}：{LocalMetaphor}」
3. **类别数 = 轴数**（对仗端）：5 轴对仗端必有 5 类

**反例**:
- 框架 2 轴 / 正文 3 类 → 对仗破裂
- 类别只用比喻名（「打分式」），不挂轴名 → 框架与类别脱节
- 类别数多于轴数 → 一个轴被拆开

### §2.4 Stage 4 · Asymmetry Handling（非对称处理）

**核心目标**：当源材料两端不对称时，**显式承认**，不要伪装成对称。

**关键原则**:

1. **危险源 ≠ 安全来源**：风险常有 N 个独立维度（OR-gate，每维都能触发暂停）；安全常只有 1 个状态（AND-gate，所有维度同时绿才放行）。**这是结构性非对称，不是文档错漏**
2. **对仗的不是「轴」，是「分类问题」**：一端问「为什么不安全」，另一端问「为什么安全」

**非对称的显式表达模板**:

| 分类视角 | 多数端 | 少数端 |
|----------|-------|-------|
| 分类问题 | 「为什么不安全？」 | 「为什么安全？」 |
| 分类对象 | Hazard Source | Safety Source |
| 分类维度 | 5 轴 | 3 类 |
| 类别数 | 5（A–E） | 3（a–c） |

**反例**:
- 伪 5↔5 镜像（5 轴 ↔ 5 反面），实则少数端只有 3 类
- 强行把 3 类拉成 5 类填位（造作的同义词）

### §2.5 Stage 5 · Terminology Pairing（术语成对）

**核心目标**：每个类别都有「英文专业词」+「本地语言比喻名」并置。

**4 条原则**:

1. **英文术语必须是行业标准词**——可借自需求工程 / SRE / 安全架构 / 决策科学 / 项目管理 / 信任建模 / typography / DDD-arch / warehouse-DB 等学科
2. **不在标准词库找到时不要硬造**——宁可换概念也不要造词
3. **本地比喻名是图像，不是翻译**——「前提模糊」不是 Determinacy 的字面翻译，是 Determinacy 危险极的**具体场景画面**
4. **格式统一**：`类别 X · {EnglishTerm} {极性 / 来源}：{LocalMetaphor}（{count} 条）`

**示例**:
- 类别 A · **Determinacy** 危险极：前提模糊（4 条）
- 类别 a · **Verifiability** 安全来源：可验证类（3 条）

**反例**:
- 只用比喻名（「前提模糊类」），无行业 anchor
- 英文术语用普通词（「Information」/「Cleanup」）→ 不可挂知识网
- 术语前后不一致（A 用 Determinacy，B 用 Information Gap，C 用 Underspecification）

### §2.6 Stage 6 · Metaphor Unification（比喻统一）

**核心目标**：N 个类别的比喻统一到一个「世界」——读完整篇相当于在同一个场景里走 N 次。

**4 条原则**:

1. **骨架先于比喻**：英文术语是骨架，比喻是辅助
2. **意外重叠是体系化的种子**：如果 N 个比喻里有 ≥ 3 个已落入同一域，把剩下的收过去
3. **统一世界的认知经济性**：vs 比喻分散，单一世界让读者不切换心智模型
4. **每个 sub-metaphor 仍要保留局部锐度**：统一 ≠ 平庸

**候选世界举例**：医院 / 餐厅 / 法律文书 / 仓库工厂 / 邮政地址 / 装修工地 / 交通信号灯。

**反例**:
- 半体系化（部分统一，部分分散）→ 读者既感到模式又感到混乱（最常见的失误）
- 强行体系化导致明显牵强
- README 承诺「系列比喻」但实际完全不统一

### §2.7 Stage 7 · Page Assembly（版式装订）

**核心目标**：固定的演绎序装订。

**版式模板**:

```text
0 TL;DR（30 字预览：核心模型名 + 1 句操作规则）
1 顶层框架 N 维（N 个轴 + 安全极 / 危险极 + 行业出处 + 布尔合取）
2 类别（按 N 轴归类，源规则 → N 类）
3 决策图（ASCII 树 / Mermaid / 表，N 灯 AND-gate）
4 口诀（轴名缩写 + 关键动作）
```

**4 条原则**:

1. **演绎序优于归纳序**：参考文档会被反复重读，骨架前置经济
2. **TL;DR 必须 < 50 字**：30 字框架预览
3. **决策图是骨架的可视化**：统一画 AND-gate 或 OR-gate 流向
4. **口诀绑动作**：不光列轴名，要绑具体动作

**反例**:
- 归纳序（先 N 条规则 → 类别 → 维度 → 图 → 口诀）→ 反复阅读时每次都得爬到框架
- TL;DR 写 200 字 → 不是 TL;DR
- 口诀只列名（「轴 A / 轴 B」）不绑动作 → 背完不知道做什么

### §2.8 阶段间依赖与迭代节奏

```text
   1 Intake ─────► 2 Framework ─────► 3 Alignment
                        │                    │
                        ▼                    ▼
                  4 Asymmetry ──────► 5 Terminology
                        │                    │
                        ▼                    ▼
                  6 Metaphor ──────► 7 Assembly ───► 8 Gates
                                              │           │
                                              └───回炉────┘
                                              (任一 gate 失败回到对应阶段)
```

**推荐迭代节奏**:

| 节点 | 行动 |
|------|------|
| 阶段 1–2 | 一气呵成，得到框架草案 |
| 阶段 3–4 | 同行 / 自己确认轴和分类方式 |
| 阶段 5–6 | 同行 / 自己确认术语和比喻 |
| 阶段 7 | 装订 + 内部自检 |
| 阶段 8 | 交付前自检 |
| 落盘 | 按子系统元规则同步 INDEX |

---

## §3 Worked Example · RFC 2119

> 通过 RFC 2119 完整 worked example，把抽象的 8 阶段方法论「贴着实例走一遍」。本案例 6 类失真全部 pass，可作正向对照。

### §3.0 为什么用 RFC 2119 作为范例

RFC 2119 是 IETF 1997 年发布的 BCP 14，定义了 5 个核心 normative keyword:

> **MUST / MUST NOT / SHOULD / SHOULD NOT / MAY**（外加 3 个同义词：REQUIRED / SHALL / RECOMMENDED 等）

它是 learn-kit 方法论的**完美靶子**:

| 特性 | 为什么适合范例 |
|------|--------------|
| 规则数 = 5（去同义后）| 在 5–30 适用区间内，刚好够诱出 2 维框架 |
| 同类型条款扎堆 | 「必须 / 不应」+「绝对 / 强烈 / 可选」二分结构 |
| 跨文化通用 | 任何工程师都熟悉 |
| 已有原始三分 | 提供「伪框架陷阱」练习机会 |
| 验证全 6 项失真 | 本案例 6 类失真全部 pass，可作正向对照 |

### §3.1 Stage 1 · Source Intake

**第一轮扫描**:

- 8 个 keyword（5 unique + 3 同义词）
- 源材料预存「绝对要求 / 强烈建议 / 可选」**三分**
- 这是源的**原始分组**，**不一定是最终框架**

**关键判断**：三分结构是分类起点，但隐含**双轴可挖**——强制度（mandate level）× 极性（positive / negative）。

> 如果停在三分，就会变成「按原始结构复述」——犯 §2.1 反例。

### §3.2 Stage 2 · Framework Induction

**诱出 2 个独立轴**:

**轴 1 · Mandate Level（强制度）**:

| 值 | 含义 | 违反后果 |
|----|------|---------|
| **Absolute** | 绝对要求 / 绝对禁止 | 不合规（non-compliant）|
| **Strong** | 强烈建议 / 强烈反对 | 需有充分理由 + 文档化偏离 |
| **Optional** | 真正可选 | 无后果 |

行业术语锚：**RFC normative language（IETF 学派）**；与 ISO 标准的 「shall / should / may」一脉相承。

**轴 2 · Polarity（极性）**:

| 值 | 含义 |
|----|------|
| **Positive** | 要做（do X）|
| **Negative** | 不要做（don't do X）|
| **Neutral** | 任选（may do or not）|

行业术语锚：**语言学 / 命题逻辑**（affirmative / negative / neutral）。

**验证 §2.2 的 4 条原则**:

| 原则 | 本例满足吗 |
|------|----------|
| 骨架先于细节 | ✅ 先有 2 轴，再让 5 keyword 归位 |
| 维度独立 | ✅ Mandate 与 Polarity 互不干扰 |
| 行业有词根 | ✅ RFC normative language + 语言学 |
| 轴的总数 3–7 | ✅ 2 轴（下限放宽到 2 因为本例只有 5 条规则）|

### §3.3 Stage 3 · Categorical Alignment

**2×3 笛卡尔积 → 5 类**:

|  | Positive | Negative | Neutral |
|---|---|---|---|
| **Absolute** | MUST / REQUIRED / SHALL | MUST NOT / SHALL NOT | — |
| **Strong** | SHOULD / RECOMMENDED | SHOULD NOT / NOT RECOMMENDED | — |
| **Optional** | — | — | MAY / OPTIONAL |

笛卡尔积本应 6 格，但 **Optional 极性不分**（语义上没有「必须可选地做」或「必须可选地不做」），合并 1 格 → **5 类**。

5 类小标题格式:

```text
类别 A · Absolute / Positive · MUST · 红灯·必须做
类别 B · Absolute / Negative · MUST NOT · 红灯·必须不做
类别 C · Strong / Positive · SHOULD · 黄灯·应该做
类别 D · Strong / Negative · SHOULD NOT · 黄灯·不应做
类别 E · Optional / Neutral · MAY · 绿灯·可任选
```

### §3.4 Stage 4 · Asymmetry Handling

MAY 是 **极性中立**——这是非对称:

| 分类视角 | 强制部分（MUST / SHOULD）| 可选部分（MAY）|
|----------|------------------------|---------------|
| 分类问题 | 「做这事的强制度？」 | 「做或不做都行」 |
| 极性 | 明确（positive / negative）| 中立（neutral）|
| 类别数 | 4（2 强制 × 2 极性）| 1 |

**显式声明**：MAY 不强制 Polarity 分类——一个 MAY 句子可以是 「MAY do X」也可以隐含 「MAY not do X」，本质上极性中立。

如果硬把 MAY 拆成「MAY do / MAY not do」两类填满 6 格，就会犯 §2.4 反例（伪对称）。

### §3.5 Stage 5 · Terminology Pairing

每类挂的英文术语 + 本地比喻名:

| 类别 | 英文术语 anchor | 本地比喻名 |
|------|---------------|-----------|
| A | Absolute / Positive | 红灯·必须做 |
| B | Absolute / Negative | 红灯·必须不做 |
| C | Strong / Positive | 黄灯·应该做 |
| D | Strong / Negative | 黄灯·不应做 |
| E | Optional / Neutral | 绿灯·可任选 |

英文术语 anchor 是 IETF RFC normative language——可在 Wikipedia 查到，可挂行业知识网。本地比喻名是「信号灯颜色 + 极性动作」，是**图像而非翻译**。

### §3.6 Stage 6 · Metaphor Unification

**选定单一比喻世界**：**交通信号灯系统**。

| 类别 | 信号灯 | 现实场景对应 |
|------|--------|-------------|
| A. MUST | 🔴 红灯（必须停 / 必须做）| 红灯禁止通行——必须停车 |
| B. MUST NOT | 🔴 红灯（禁止 X）| 红灯禁止右转——某操作被禁止 |
| C. SHOULD | 🟡 黄灯·正向 | 黄灯减速——强烈建议这样做 |
| D. SHOULD NOT | 🟡 黄灯·反向 | 黄灯警示——强烈不建议这样做 |
| E. MAY | 🟢 绿灯 | 绿灯通行——任选 |

**为什么选交通信号灯**（4 个理由）:

1. **国际通用**——任何文化都识别红黄绿三色
2. **三色对应 3 个强制度**（Absolute / Strong / Optional）
3. **红灯有「必须」+「禁止」的双极性**——恰好覆盖 MUST + MUST NOT 两类
4. **黄灯有「减速」语义**——对应「偏离需理由」

✅ 5 个 sub-metaphor 全部落在同一域内——**完全统一**，无半体系化。

### §3.7 Stage 7 · Page Assembly

最终交付的版式:

```text
0 TL;DR (Mandate × Polarity = N, 5 keyword 形成 2 维布尔模型, 信号灯比喻)
1 框架 (轴 1 Mandate Level 表 + 轴 2 Polarity 表 + 2×3 笛卡尔积)
2 类别 A-E (每类 4 件齐备)
3 决策图 (5 灯 AND-gate ASCII 树)
4 非对称处理表 (MAY 中立)
5 比喻系统表 (5 类→信号灯)
6 口诀 (MPN)
7 §8 quality gates 自检 (6 类全 pass)
```

**5 灯 AND-gate 决策图**:

```text
你看到一个 normative 句子：
                            ↓
              ┌─────────────────────────┐
              │  Mandate Level 是什么？  │
              └─────────────────────────┘
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
    Absolute            Strong              Optional
        │                   │                   │
        ↓                   ↓                   ↓
    红灯：违反=不合规     黄灯：偏离需理由        绿灯：任选
        │                   │                   │
    ┌───┴───┐          ┌───┴───┐                │
    ↓       ↓          ↓       ↓                │
  MUST   MUST NOT   SHOULD  SHOULD NOT          MAY
```

### §3.8 口诀 · MPN

**MPN**：**M**andate × **P**olarity = **N**ormative

```text
看红灯停（MUST），看红叉禁（MUST NOT），
看黄灯让（SHOULD），看黄叉避（SHOULD NOT），
看绿灯随你（MAY）。
```

**怎么用**：每读到 RFC 中的 normative keyword，第一反应是「信号灯什么颜色」:
- 🔴 红 → 不合规警报
- 🟡 黄 → 偏离要文档化
- 🟢 绿 → 实现者自由

5 字母绑 5 个具体动作，验证 §2.7 原则 4「口诀绑动作」。

### §3.9 方法论 8 阶段在本案例的映射

| 方法论阶段 | 本案例应用 |
|-----------|----------|
| §2.1 Source Intake | 8 keyword（5 unique + 3 同义）+ 三分预存 |
| §2.2 Framework Induction | 2 轴：Mandate Level × Polarity |
| §2.3 Categorical Alignment | 5 类 = 2×2 + 1 neutral |
| §2.4 Asymmetry Handling | MAY 极性中立显式声明 |
| §2.5 Terminology Pairing | IETF normative language + 语言学 |
| §2.6 Metaphor Unification | 交通信号灯单一比喻世界 |
| §2.7 Page Assembly | TL;DR → 框架 → 类别 → 比喻 → 口诀 |
| §2.8 Quality Gates | 6 类失真全部 pass（见 §4.1）|

### §3.10 改造为你自己的 [LEARNING] 文档

要把本 worked example 改造成 RFC 2119 之外的解读:

1. **替换 §0 TL;DR**：换核心模型名（「Mandate × Polarity」）和具体规则数
2. **替换 §1 框架**：换轴名 + 行业术语
3. **替换 §2 类别**：按你的 N 维笛卡尔积调整
4. **§3 非对称端**：如有，按 MAY 模式显式声明
5. **§4 比喻世界**：选 1 个统一的（不一定是交通信号灯）
6. **§5 口诀**：设计 N 字母（如 MPN）+ 绑动作
7. **§6 自检**：跑一遍 6 类失真闸门

---

## §4 Quality Gates + Anti-patterns（出文前自检）

### §4.1 6 类失真闸门（§2.8 Quality Gates 详解 + RFC 2119 正例对照）

| # | 失真名 | 现象 | 修法 | RFC 2119 本例 |
|---|-------|------|------|--------------|
| 1 | **半体系化**（Half-system）| 比喻 / 术语部分统一，部分散落 | 要么完全统一（回 §2.6），要么完全打散并显式说明 | ❌ 不命中 — 全部统一在「交通信号灯」 |
| 2 | **伪对称**（False-symmetry）| 两端类别数不同却画 N↔N 镜像 | 加对比表显式承认（回 §2.4）| ❌ 不命中 — §3.4 显式声明 MAY 极性中立 |
| 3 | **术语脱靶**（Term-miss）| 类别用民间词，无行业 anchor | 给每个类别加英文标准词（回 §2.5）| ❌ 不命中 — 每类挂 IETF RFC normative language |
| 4 | **框架隐藏**（Framework-buried）| N 条规则前置，N 维框架在 §4 才出现 | TL;DR 前置框架（回 §2.7）| ❌ 不命中 — §0 TL;DR 前置 2 维布尔模型 |
| 5 | **悬空引用**（Dangling-ref）| 文中提「§X.Y 提问模板」但全文没解释 | 就地展开（一行带过即可）| ❌ 不命中 — 无未解释引用 |
| 6 | **三段冗余**（Redundant-triplet）| 镜像表 / 框架表 / ASCII 树重复同一信息 | 删掉中间过渡版，留一个最干净的 | ❌ 不命中 — 信息递进，非重复 |

**出文前的最终 checklist**:

- [ ] 比喻是否在同一域内？
- [ ] 两端类别数不同时是否有显式对比表？
- [ ] 每个类别是否都挂了行业英文术语？
- [ ] TL;DR 是否前置框架？
- [ ] 任何 §X.Y 引用是否就地解释？
- [ ] 同一信息是否被表达 ≥ 3 次？

### §4.2 8 跨阶段反模式速查

跨阶段最常见的 8 个失误（与 §4.1 的 6 类失真互补）:

1. **直接翻译式解读**（§2.1 反例）：按源顺序逐条复述
2. **伪框架**（§2.2 反例）：把源已有二分误当骨架
3. **类别不对仗轴**（§2.3 反例）：框架 N 轴但写 M 类
4. **伪对称**（§2.4 反例）：两端类别数不同却画 N↔N 镜像
5. **民间词类别**（§2.5 反例）：无英文术语 anchor
6. **半体系化比喻**（§2.6 反例）：部分统一部分散
7. **归纳序版式**（§2.7 反例）：案例前置框架后置
8. **三段冗余**（§2.8 反例）：同一信息重复 3 次

---

## §5 关键源文件指针

| 想知道什么 | 读哪里 |
|----------|--------|
| 完整 8 阶段方法论（602 行）| `plugins/learn-kit/skills/init/templates/METHODOLOGY.md` §1-§8 |
| RFC 2119 worked example 原文（249 行）| `plugins/learn-kit/skills/init/references/rfc-2119-keywords-pedagogy.md` |
| 子系统元规则 | METHODOLOGY.md §9 |
| 治理边界详情 | `./[GUIDE]_LearnKit_Design.md` §4-§6 |
| 5 skills 工作流 | `./[GUIDE]_LearnKit_Design.md` §1 |
| RFC 2119 原文 | https://www.rfc-editor.org/rfc/rfc2119 |
