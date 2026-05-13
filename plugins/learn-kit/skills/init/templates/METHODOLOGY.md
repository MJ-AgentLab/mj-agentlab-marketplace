---
type: "learning"
tier: "standard"
topic: "_meta"
summary: "8-stage pedagogical methodology for converting enumerated rule lists into human-readable decision-framework interpretation docs. Includes subsystem meta-rules (naming / path / frontmatter / INDEX / linking / archive / optional integrations / versioning)."
methodology: "self"
tags:
  - "learning"
  - "methodology"
  - "documentation"
  - "rule-interpretation"
  - "pedagogy"
  - "standard"
aliases:
  - "Rule List Pedagogy Methodology"
  - "Rule List Interpretation Authoring"
  - "学习子系统方法论"
created: "2026-05-11"
updated: "2026-05-11"
state: "active"
version: "v0.2"
---

# Rule List Pedagogy — 8-Stage Methodology

> **角色**：本文是 `learning/` 子系统的 sub-framework STANDARD——既定义"如何写解读"（§1-8 + 附录），又定义子系统元规则（§9-§13）
> **成熟度**：从上游 mj-system v2.0 STANDARD-tier（N=5 跨域 case 验证：rules 8–63 / dimensions 3–5 / 5 个独立比喻世界 / 全部 N 维 AND-gate）剥离 MJ 引用后的通用版本
> **适用**：当你有一份枚举型规则清单（典型如 RFC keyword list、安全策略、API style guide、STANDARD/POLICY 文档的"必须 / 不应"小节），需要转化为人类可学习的"决策框架解读文档"
> **目标读者**：项目维护者（按本指南推进）+ 团队学习者（审阅 / 学习方法论）

---

## 0 TL;DR

把散乱的 N 条规则压成"框架 + 类别 + 比喻 + 图 + 口诀"5 件套人类阅读文档，遵循 8 阶段方法论：

1. **Source Intake** — 摸清源材料的 shape
2. **Framework Induction** — 从规则中诱出 3–7 个抽象轴
3. **Categorical Alignment** — 让分类一一对仗轴
4. **Asymmetry Handling** — 处理"危险源 vs 安全来源"等非对称
5. **Terminology Pairing** — 业内英文术语 + 中文 / 本地比喻名成对
6. **Metaphor Unification** — 选定单一比喻世界
7. **Page Assembly** — TL;DR → 框架 → 细节 → 图 → 口诀
8. **Quality Gates** — 出 6 类典型失真前自检

每阶段配「目标 / 原则 / 示例片段 / 反例 / 检查清单」5 件。完整 worked example 见 `references/rfc-2119-keywords-pedagogy.md`（应用本方法论到 RFC 2119 5 个关键词 MUST / MUST NOT / SHOULD / SHOULD NOT / MAY）。

---

## 适用范围

**适用源材料形态**：

- 枚举型规则清单（编号或并列）
- 通常 5–30 条；少于 5 条不需要框架抽象，多于 30 条需先分组
- 同类型条款扎堆（如"必须 / 不应"二分、"高 / 低"二分）
- 条款之间有共性可归纳，不是完全异质

**适用产出形态**：

- 人类阅读用，不是检索手册
- 目标读者需建立 mental model（决策框架），不是查具体某条规则
- 5 件套：抽象框架 + 类别归类 + 比喻系统 + 决策图 + 记忆口诀
- 篇幅 3–8 KB Markdown，单一主题

**不适用**：

- 顺序教程（Tutorial flow）→ 用 Tutorial 模板
- 查阅参考（Reference manual）→ 用 Lookup 模板
- 故障复盘 → 用 POSTMORTEM 模板
- 架构 / 数据流 / 代码逻辑等非规则枚举源材料 → 暂不适用本方法论

---

## 1 Source Intake（源材料入料）

**目标**：在动笔之前先把源材料的 shape 看清楚。

**原则**：

1. **数清条款数**：知道规模决定后续抽象的颗粒度（5–15 条偏向 3–5 轴；20–30 条偏向 5–7 轴）
2. **找原始分组**：源材料常已有"X / 非 X"、"必须 / 可选"、"高 / 低"等二分；这些往往**不**是最终框架，但提供归纳起点
3. **不要被原始顺序绑架**：源的呈现顺序通常是历史成因，不是逻辑成因；归纳时打散重排

**示例片段（参考 worked example）**：
源 = RFC 2119 §1-§5，5 个关键词（MUST / MUST NOT / REQUIRED / SHOULD / SHOULD NOT / RECOMMENDED / MAY / OPTIONAL），预先有"绝对要求 / 强烈建议 / 可选"三分。

第一轮 input scan：
- 5 个核心 + 3 个同义 = 8 个 keyword
- 三分结构是分类起点但不是最终框架
- 隐含双轴可挖：**强制度（mandate level）× 极性（positive / negative）**

**反例 / 失败模式**：
- 直接按源顺序逐条解读（变成翻译，无抽象增量）
- 把原始三分误当成最终框架（错过双轴）

**检查清单**：
- [ ] 知道源的总条款数
- [ ] 列出源已有的所有原始分组
- [ ] 标记可疑的"伪框架"（容易被错认成最终骨架的原始分组）

---

## 1.5 Project Discovery（已有项目里如何找源）

**目标**：§1 假设你已经选定了源 STANDARD。在已有项目里，"如何选 / 如何确认哪个文档是源"本身就是一个问题——本节给出零配置启发式。

**适用场景**：

- 装上 learn-kit 但项目已有 `docs/` 大量文档，不确定从哪开始
- 用户脑中只有一个概念名（"DLSRS" / "ISFSV"），不知道在哪个文档里
- 想在动笔编写新 [LEARNING] 前，先检查是否已经被人解读过

**原则**：

1. **先 scan，再 locate**：装上 learn-kit 后，先用 `/learn-kit:scan` 列出项目所有可学的源 canonical docs（按 tag 分类，标记已解读 vs 未解读）；再用 `/learn-kit:locate <concept>` 反向定位用户脑中具体概念的源
2. **已解读优先**：locate 优先返回 `learning/<topic>/[LEARNING]_*.md`（已有解读），其次返回 `docs/**/[STANDARD|SPEC|ADR|...]_*.md`（原始源）。如果已解读文档存在，直接 read 它而不是从源重做 8 阶段
3. **段号定位**：如果用户已知文档但只想学其中一段（如"§3.3 of HITL prompt"），locate 会自动提取段号 hint，引导用户 read 后跳到对应段
4. **启发式假设**：learn-kit 假设项目使用 tag prefix 命名约定（`[STANDARD]_*.md` / `[SPEC]_*.md` / `[ADR]_*.md`）；不使用此约定的项目需在 CLAUDE.md 显式声明 tag，或在 locate / scan 调用时传 `path:` 限定搜索范围

**推荐流程**：

```text
0. 装 learn-kit（已在做）
1. 跑 /learn-kit:scan
   → 看到项目有多少可学 source、哪些已解读、哪些未解读
2. 选定目标概念 / 主题：
   a. 已知概念名（"DLSRS" / "ISFSV"）→ /learn-kit:locate <concept>
   b. 想浏览未解读源        → /learn-kit:scan（提示"unread-only"则只看未解读）
3. 命中已解读 [LEARNING] → read，学习结束
4. 命中未解读源 STANDARD → 进入 §1 Source Intake，按 8 阶段编写新 [LEARNING]_*.md
```

**示例片段**：

场景 1（项目已有 learning/ 子系统）：
> 用户："学 DLSRS"
> - `/learn-kit:locate "DLSRS"` → top1: `learning/hitl/[LEARNING]_HITL_Common_Rules_Interpretation.md`（confidence 0.95，INDEX 命中）
> - 用户 read 此文档，5 分钟内掌握 DLSRS 5 维（无需自己重做 8 阶段）

场景 2（项目有 docs/ 但无 learning/）：
> 用户："学 SPEC 编写规范"
> - `/learn-kit:locate "SPEC 编写"` → top1: `docs/guide/[GUIDE]_SPEC_Authoring.md`（未解读，confidence 0.85，文件名命中）
> - 用户先 `/learn-kit:init` scaffold learning/ → 再 read 源 → 按 8 阶段编写 `learning/spec-authoring/[LEARNING]_SPEC_Authoring_Interpretation.md`

场景 3（完全白板项目）：
> 用户："这个项目里有什么可学的"
> - `/learn-kit:scan` → confidence < 0.7 warning："项目结构无法确定" + 列出顶层 `*.md` 候选
> - 用户在 CLAUDE.md 补充 tag 约定声明 → 重跑 scan 命中改善

**反例 / 失败模式**：

- 跳过 scan 直接 locate 模糊 query（"学一下这个项目"）→ 应改用 scan 列举可学项
- 在没有 tag prefix 约定的项目里盲用 locate / scan → confidence < 0.7 warning，建议先在 CLAUDE.md 声明 tag 约定，或传 `path:` 限定范围
- 命中源 canonical 后忽视已解读 [LEARNING]（如有）→ 重做 8 阶段是浪费；先看是否已解读

**检查清单**：

- [ ] 在动笔写 [LEARNING] 之前，先跑 scan 看项目可学全貌
- [ ] 用 locate 确认目标概念对应的源文档路径
- [ ] 检查 locate 输出中"Interpreted [LEARNING] docs"段——已解读则 read 即可，未解读才进 §1
- [ ] 项目无 tag prefix 约定时，先在 CLAUDE.md 补充声明，或在 query 中显式传 path

---

## 2 Framework Induction（框架归纳）

**目标**：从源清单的 N 条规则中诱出抽象骨架——通常是 3–7 个独立维度。

**原则**：

1. **骨架先于细节**：先找轴，再让规则归位；不要先按"看上去像的"分类
2. **维度独立**：每个轴必须能独立判定，不能两轴同时触发同一情形
3. **行业有词根**：每个轴都应有标准工程术语（不自造概念，不用民间词）
4. **轴的总数 3–7**：少于 3 太粗，多于 7 记不住

**示例（RFC 2119 worked example）**：

对 5 个关键词做归纳，识别出 2 个独立轴：
- **Mandate Level**（强制度）：absolute / strong-recommendation / optional
- **Polarity**（极性）：positive（要做）/ negative（不做）

2 个轴的笛卡尔积刚好覆盖 5 个核心关键词（absolute-positive=MUST，absolute-negative=MUST NOT，strong-positive=SHOULD，strong-negative=SHOULD NOT，optional=MAY；MAY 极性中立单独处理）。

**反例 / 失败模式**：
- 按"风险高低"分（这是程度，不是维度）
- 按"动作类型"分（与源结构重合，无抽象增量）
- 多个轴里塞相关项（如把 MUST 和 SHOULD 合成"高强制"）→ 维度不独立
- 自造词（"严格度"、"刚性"）→ 没有行业知识网络可挂

**检查清单**：
- [ ] 每个轴都对应至少 1 条源规则
- [ ] 每条源规则只归一个轴
- [ ] 每个轴有标准行业术语（在 Wikipedia 或经典工程书可查到）
- [ ] 轴的总数 3–7

---

## 3 Categorical Alignment（类别对仗框架）

**目标**：写正文时，类别小标题与框架轴一一对应——不能"框架在 §1，类别用别的分法"。

**原则**：

1. **类别 = 轴的具象化**：类别 A 必须是 X 轴的某个极，不能"类别 A = 信息不清，但归到第 3 轴"
2. **类别命名三件齐备**：「类别 X · {EnglishTerm} {极性}：{LocalMetaphor}」
3. **类别数 = 轴数**（在对仗端）：5 轴对仗端必有 5 类；不是 4 个或 6 个

**示例**：

2 轴成型后，正文可写成 4 类（2×2 笛卡尔积 + 1 类中立）：
- 类别 A · Absolute / Positive：MUST / REQUIRED
- 类别 B · Absolute / Negative：MUST NOT
- 类别 C · Strong / Positive：SHOULD / RECOMMENDED
- 类别 D · Strong / Negative：SHOULD NOT / NOT RECOMMENDED
- 类别 E · Optional / Neutral：MAY / OPTIONAL

**反例 / 失败模式**：

- 框架 2 轴，但正文只写 3 个类别（轴值合并讲）→ 对仗破裂
- 类别只用比喻名（"打分式 / 警告式"），不挂轴名 → 框架与类别脱节
- 类别数多于轴数 → 一个轴被拆开

**检查清单**：
- [ ] 类别数 = 对仗端轴数
- [ ] 每个类别标题都包含轴名
- [ ] 每个类别下的源规则都属于该轴

---

## 4 Asymmetry Handling（非对称处理）

**目标**：当源材料的两端不对称时，**显式承认非对称**，不要伪装成对称。

**原则**：

1. **危险源 ≠ 安全来源**：风险常有 N 个独立维度（OR-gate，每维都能触发暂停）；安全常只有 1 个状态（AND-gate，所有维度同时绿才放行）。这是结构性非对称，不是文档错漏
2. **对仗的不是"轴"，是"分类问题"**：一端问"为什么不安全"，另一端问"为什么安全"。两端都是分类问题，但对象不同
3. **少数端按"机制类型"分**：5 维全绿状态下，按"安全是哪种机制保证的"分类

**示例**（双端不对称的典型场景）：

源材料：13 条"必须暂停"+ 7 条"可以默认处理"。
- 13 条按"危险源（Hazard Source）"分 → 5 轴 → 5 类（A–E）
- 7 条按"安全来源（Safety Source）"分 → 3 类（a–c）→ 与 5 轴无对应关系

显式声明非对称：

| 分类视角 | 多数端 | 少数端 |
|----------|-------|-------|
| 分类问题 | "为什么不安全？" | "为什么安全？" |
| 分类对象 | Hazard Source | Safety Source |
| 分类维度 | 5 轴 | 3 类 |
| 类别数 | 5（A–E） | 3（a–c） |

**反例 / 失败模式**：
- 伪 5↔5 镜像（5 轴 ↔ 5 反面），实则少数端只有 3 类
- 强行把 3 类拉成 5 类填位（造作的同义词）
- 完全不提非对称，让读者自己困惑

**检查清单**：
- [ ] 两端类别数若不同，开头显式说明
- [ ] 给出对比表（两端各自的「分类问题 / 分类对象 / 分类维度 / 类别数」）
- [ ] 少数端的分类原则有标准术语（不只用比喻）

---

## 5 Terminology Pairing（术语成对）

**目标**：每个类别都有「英文专业词」+「本地语言比喻名」并置——前者挂行业知识网，后者提供记忆锚。

**原则**：

1. **英文术语必须是行业标准词**：可从需求工程 / SRE / 安全架构 / 决策科学 / 项目管理 / 信任建模 / typography / DDD-arch / warehouse-DB 等学科借词
2. **不在标准词库找到时不要硬造**：宁可换概念也不要造词
3. **本地比喻名是图像，不是翻译**："前提模糊" 不是 Determinacy 的字面翻译，是 Determinacy 危险极的具体场景画面
4. **格式统一**：「类别 X · {EnglishTerm} {极性 / 来源}：{LocalMetaphor}（{count} 条）」

**示例**：
- 类别 A · **Determinacy** 危险极：前提模糊（4 条）
- 类别 a · **Verifiability** 安全来源：可验证类（3 条）

每个类别 4 件齐备：字母 / 英文术语 / 极性或来源 / 比喻名。

**反例 / 失败模式**：
- 只用比喻名（"前提模糊类"），无行业术语 anchor
- 英文术语用普通词（"Information"、"Cleanup"）→ 不可挂知识网
- 术语前后不一致（A 用 Determinacy，B 用 Information Gap，C 用 Underspecification）→ 读者无法形成统一框架印象

**检查清单**：
- [ ] 每个英文术语在 Wikipedia 或经典工程书籍可查到
- [ ] 比喻名与英文术语意涵一致（不是表面翻译）
- [ ] 所有类别格式统一

---

## 6 Metaphor Unification（比喻统一）

**目标**：N 个类别的比喻统一到一个"世界"，让读者读完整篇相当于在同一个场景里走 N 次。

**原则**：

1. **骨架先于比喻**：英文术语是骨架，比喻是辅助；比喻只需"好记"，不需"最锐利"
2. **意外重叠是体系化的种子**：如果 N 个比喻里有 ≥ 3 个已经落入同一域，把剩下的收过去比换全部成本低
3. **统一世界的认知经济性**：vs 比喻分散（N 个不同场景），单一世界让读者不切换心智模型
4. **每个 sub-metaphor 仍要保留局部锐度**：统一世界 ≠ 平庸；每个场景在世界内部要选最锐利的图像

**示例**：

可选比喻世界：医院 / 餐厅 / 法律文书 / 仓库工厂 / 邮政地址 / 装修工地 等。

最初 8 个比喻分散在多个域。诊断后发现 ≥ 3 个已落在同一域，把剩下的收过去。

**比喻可以演化**：选定一个世界后仍可在更高契合度的世界出现时整体迁移，但**不要半截迁移**。

**反例 / 失败模式**：
- 半体系化（部分统一，部分分散）→ 读者既感到模式又感到混乱
- 强行体系化把所有比喻拉到一个域，导致明显牵强
- 完全不统一，但 README 又承诺"系列比喻"

**检查清单**：
- [ ] 所有比喻在同一域内（或显式说明为什么不统一）
- [ ] 每个比喻在该域内选了最锐利的图像
- [ ] 比喻名 + 共同点段落用词与该域一致

---

## 7 Page Assembly（版式装订）

**目标**：把骨架、类别、比喻、决策图、口诀按固定顺序组合，形成稳定的"5 件套"版式。

**原则**：

1. **演绎序优于归纳序**：参考文档会被反复重读，骨架前置（演绎序）比归纳序经济
2. **TL;DR 必须 < 50 字**：30 字框架预览，让读者第一眼就拿到全局
3. **决策图是骨架的可视化**：ASCII 树 / Mermaid / 表格三选一，统一画 AND-gate 或 OR-gate 流向
4. **口诀绑动作**：不光列轴名，要绑具体动作

**示例版式**：

```text
0 TL;DR（30 字预览：N 维布尔模型，任一红灯暂停，全绿放行还须留痕）
1 顶层框架 N 维（N 个轴 + 安全极 / 危险极 + 行业出处 + 布尔合取）
2 类别（按 N 轴归类，源规则 → N 类）
3 决策图（ASCII 树 / Mermaid / 表，N 灯 AND-gate）
4 口诀（轴名缩写 + 关键动作）
```

**反例 / 失败模式**：
- 归纳序（先 N 条规则 → 类别 → 维度 → 图 → 口诀）→ 参考阅读时每次都得从案例爬到框架
- TL;DR 写 200 字 → 不是 TL;DR
- 没有决策图 → 框架抽象但无可视化锚
- 口诀只列名（"轴 A / 轴 B"）不绑动作 → 读者背完不知道做什么

**检查清单**：
- [ ] TL;DR < 50 字且包含核心模型名 + 1 句操作规则
- [ ] 框架在 §1（不在 §4 或更晚）
- [ ] 至少一张决策图（ASCII / Mermaid / 表均可）
- [ ] 口诀同时给出"轴名 + 动作"

---

## 8 Quality Gates（质量闸门）

**目标**：交付前自检 6 类典型失真。

**6 类失真 + 修法**：

| # | 失真名 | 现象 | 修法 |
|---|-------|------|------|
| 1 | 半体系化（Half-system） | 比喻 / 术语部分统一，部分散落 | 要么完全统一（§6），要么完全打散并显式说明 |
| 2 | 伪对称（False-symmetry） | 两端类别数不同却画 N↔N 镜像表 | 加对比表显式承认非对称（§4） |
| 3 | 术语脱靶（Term-miss） | 类别用民间词，无行业术语 anchor | 给每个类别加英文标准词（§5） |
| 4 | 框架隐藏（Framework-buried） | N 条规则前置，N 维框架在 §4 才出现 | TL;DR 前置框架（§7） |
| 5 | 悬空引用（Dangling-ref） | 文中提"§X.Y 提问模板"但全文没解释 | 就地展开（一行带过即可） |
| 6 | 三段冗余（Redundant-triplet） | 镜像表 / 框架表 / ASCII 树重复同一信息三次 | 删掉中间过渡版，留一个最干净的 |

**出文前检查清单**：

- [ ] 比喻是否在同一域内？（§6 检查）
- [ ] 两端类别数若不同，是否有显式对比表？（§4 检查）
- [ ] 每个类别是否都挂了行业英文术语？（§5 检查）
- [ ] TL;DR 是否前置框架？（§7 检查）
- [ ] 任何 §X.Y 引用是否就地解释？
- [ ] 同一信息是否被表达 ≥ 3 次？

---

## 9 Subsystem Meta-Rules（子系统元规则）

> 本节定义 `learning/` 子系统的命名 / 路径 / frontmatter / INDEX / 链接 / 归档规则。子系统内文档（含本文）建议遵守。

### 9.1 何时建学习文档

**不预设触发条件**——由用户**手动触发**。

理由：
- 学习需求是高度主观的（不同人不同时间对不同源材料的密度耐受不同）
- 强制 trigger（如"源材料 ≥ 30KB 必建学习文档"）会产生大量低价值产物

实操：你认为某个 STANDARD / POLICY / RFC 太密集需要"决策框架解读"时主动触发本方法论 8 阶段流程。

### 9.2 命名约定

```text
[LEARNING]_<Source>_<Aspect>.md
```

- 前缀**固定**为 `[LEARNING]_`（与其他 doc tag 如 `[STANDARD]_` / `[GUIDE]_` 正交）
- `<Source>` 简短描述源材料（如 `RFC_2119` / `OWASP_Top10` / `Security_Policy`）
- `<Aspect>` 可选——指明解读哪一面；单一文档可省略

**例**：
- `[LEARNING]_RFC_2119_Keywords.md`
- `[LEARNING]_OWASP_Top10_Interpretation.md`
- `[LEARNING]_Rule_List_Interpretation_Authoring.md`（方法论自身的命名示例）

### 9.3 路径约定（按 topic 分组）

```text
learning/
├── INDEX.md                     # 子系统总入口
├── _meta/                       # 子系统基础设施（方法论、模板）
│   └── METHODOLOGY.md
├── <topic>/                     # 每个 topic 一个子目录
│   └── [LEARNING]_*.md
└── _archive/                    # 软归档区
    └── <topic>/[LEARNING]_*.md
```

**topic 选取**：
- 优先按"源材料聚类"分（如 `rfc/` 装多个 RFC 解读）
- 单 STANDARD / POLICY 解读：以源材料缩写为 topic
- 跨多源解读：以主题域为 topic
- 不确定时**先建较粗的 topic**，后续按需细分

### 9.4 Frontmatter Schema

```yaml
---
type: "learning"                                       # 固定值
topic: "<topic>"                                       # 与路径一级目录一致；_meta 表示子系统基础设施
summary: "<1-2 行说明本文学习目的>"
source: "<your project's source ref, e.g., 'RFC 2119' or '[[STANDARD]_X#§Y]]'>"
methodology: "[[../_meta/METHODOLOGY|本方法论]]"        # 引用本方法论
tags: [learning, <topic>, ...]                         # 自由标签
aliases: [..., ...]                                    # 别名（Obsidian / wiki 等）
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
state: "draft | active | archived"                     # 三态枚举
version: "vX.Y"                                        # 必需——学习材料随源演化需明确版本
---
```

### 9.5 INDEX 同步

**独立** `learning/INDEX.md`：
- 与项目主索引（如 `docs/INDEX.md`、`README.md`）解耦（避免污染面向 AI / 检索的 canonical 索引）
- 主索引可加一行外链 `[Learning Subsystem](./learning/INDEX.md)`，**不展开内部条目**
- `learning/INDEX.md` 自管：总览 / 方法论 / 按 topic 索引 / Tier Documents（AI 生成）/ 归档

新建 / 重命名 / 归档 learning 文档时**必须同步** `learning/INDEX.md`。

### 9.6 链接规则

| 链接方向 | 建议格式 |
|---------|---------|
| learning → 项目 canonical docs | 项目自定（wikilink 或 markdown link） |
| learning → learning（同 topic） | 相对 markdown link 或 wikilink |
| learning → \_meta（方法论） | 相对 link |
| 项目 canonical docs → learning | **不强求**（避免 canonical 被 learning 污染） |

**禁止**：
- 绝对路径
- 不可控的外部 URL（除真正的外部参考资源）

### 9.7 删除 / 归档策略（推荐 C 软归档）

源演化后，对应学习文档处理：

| 选项 | 描述 | 优势 | 劣势 |
|------|------|------|------|
| **A 永久保留** | 旧解读永远在主目录，加 `state: archived` + frontmatter 标注"对应 vX.Y" | 完整教学历史 | INDEX 杂乱 |
| **B 硬覆盖** | 源演化立即重写解读，旧版不留 | 主目录始终最新 | 丢失教学历史 |
| **C 软归档**（**推荐**）| 主目录始终"当前最新可学版本"；旧版移 `learning/_archive/<topic>/` 保留 | 主目录干净 + 历史可追 | 需维护 `_archive/` 索引段 |
| **D 版本并存** | 同 topic 多版本同存 | 不删任何东西 | 读者困惑 / 维护成本高 |

**推荐 C 软归档操作**：

1. 旧解读移 `learning/_archive/<topic>/`，保持原文件名
2. frontmatter 加 `state: archived` + `replaced-by: "<link to current>"`
3. 主目录 INDEX 不展开 `_archive/`；archive 区单独维护索引段

---

## 10 Optional Integrations（可选集成）

### 10.1 With markdownlint / Other Validators

本插件不带验证 skill。建议你项目自带 markdown 校验工具（`markdownlint-cli` / `prettier` / 项目自定 validator）扫 `learning/**/*.md` 检查 OB1-OB6 类基础语法：

- OB1 wikilink 语法
- OB2 heading 格式（无 trailing punctuation）
- OB3 list marker 一致性
- OB4 code block language tag
- OB5 callout 类型限制
- OB6 table pipe escaping

---

## 11 Worked Example pointer

完整 worked example 见 `references/rfc-2119-keywords-pedagogy.md`：把 RFC 2119 的 5 个核心关键词（MUST / MUST NOT / SHOULD / SHOULD NOT / MAY）按 8 阶段方法论产出一份完整 `[LEARNING]_RFC_2119_Keywords.md`。展示：

- §1 Source Intake：5 keyword + 3 同义词识别
- §2 Framework Induction：2 轴（Mandate Level × Polarity）
- §3 Categorical Alignment：5 类对仗
- §4 Asymmetry Handling：MAY 单极性处理
- §5 Terminology Pairing：RFC normative keyword 学派术语
- §6 Metaphor Unification：交通信号灯单一比喻世界
- §7 Page Assembly：TL;DR + 框架 + 决策图 + 口诀
- §8 Quality Gates：6 类失真自检

---

## 12 Versioning & Evolution

### 12.1 版本号语义

学习子系统方法论使用 **vX.Y** 语义版本：

| 版本变化 | 触发 |
|---------|------|
| **vX.0 Major** | sub-framework 整体成熟度跨阶段；§9 元规则结构化扩展 |
| **vX.Y Minor** | 加新 case 后某个章节小幅扩展；不破坏既有结构 |
| **vX.Y.Z Patch** | 措辞 / 例子 / typo 修正 |

### 12.2 升级触发条件

| 升级方向 | 触发条件 |
|---------|---------|
| **GUIDE-tier → STANDARD-tier** | ≥ 5 case 跨域验证（覆盖 ≥ 4 个独立行业 / 比喻世界）+ 几何不变量证实 |
| **STANDARD-tier 内部 minor** | 新加 ≥ 1 case 暴露的边界 |
| **STANDARD-tier 重构** | 几何不变量被否（如某个 case 不能成 N 维 AND-gate）→ 重新验证基础假设 |

### 12.3 当前 v0.3 状态

本文是从上游 mj-system v2.0 STANDARD-tier 剥离后的 generic v0.3 版本（v0.1 初版剥离；v0.2 加 §1.5 Project Discovery；v0.3 移除 §10.1 NLM integration，learn-kit 与 notebooklm-kit 解绑）。原 N=5 跨域验证证据（HITL 协作 / 服务架构 / SQL 语法 / DB 设计 / DB 命名；rules 8–63；dimensions 3–5；5 个独立比喻世界；全部 N 维 AND-gate 几何不变量）在通用化过程中**仍然适用**，但具体案例引用已替换为 RFC 2119 单 worked example。

---

## 附录 A · 反模式清单

跨阶段速查：

1. **直接翻译式解读**（§1 反模式）—— 按源顺序逐条复述，无抽象增量
2. **伪框架**（§2 反模式）—— 把源已有的二分误当作骨架
3. **类别不对仗轴**（§3 反模式）—— 框架 N 轴但写 M 类（N≠M）
4. **伪对称**（§4 反模式）—— 两端类别数不同却画 N↔N 镜像
5. **民间词类别**（§5 反模式）—— 无英文术语 anchor
6. **半体系化比喻**（§6 反模式）—— 部分统一部分散
7. **归纳序版式**（§7 反模式）—— 案例前置框架后置
8. **三段冗余**（§8 反模式）—— 镜像表 + 框架表 + ASCII 树重复同一信息

---

## 附录 B · 应用方式

未来当你给自己（或同事）这种任务时：

> "请把 `[STANDARD]_X.md` 的 §Y / §Z 整理成人类可读的解读文档"

按 8 阶段顺序推进；每阶段交付前过该阶段检查清单；最后过 §8 6 类失真闸门；按 §9 子系统元规则落盘到 `learning/<topic>/`。

迭代节奏（推荐）：

- 阶段 1–2 一气呵成，得到框架草案
- 阶段 3–4 同行 / 自己确认轴和分类方式
- 阶段 5–6 同行 / 自己确认术语和比喻
- 阶段 7 装订 + 内部自检
- 阶段 8 交付前自检
- §9 落盘 → 同步 `learning/INDEX.md`

---

## 版本历史

- **v0.3**（2026-05-13）：随 learn-kit v0.3.0 发布。移除 §10.1 With notebooklm-kit 子节（learn-kit 与 notebooklm-kit 解绑，learn-kit 不再推荐配套 NotebookLM 集成）；保留的 §10.1 With markdownlint / Other Validators 段从原 §10.2 上移。其余 8 阶段方法论 / 子系统元规则 / 6 类失真自检 / RFC 2119 worked example 不变。
- **v0.2**（2026-05-11）：随 learn-kit v0.2.0 发布。新增 §1.5 Project Discovery 段（在已有项目里如何用 scan → locate 工作流找源材料 / 检查既有 [LEARNING] / 三种项目场景）。其余各章不变。
- **v0.1**（2026-05-11）：从上游 mj-system `learning/_meta/[LEARNING]_Rule_List_Interpretation_Authoring.md` v2.0 剥离 MJ 引用后的通用版本。移除 MJ-specific 案例（HITL / svc-arch / sql-format / db-design / db-naming）；保留 8 阶段方法论核心 + 子系统元规则 + 6 类失真自检；新增 §10 Optional Integrations（与 notebooklm-kit 配套 + markdownlint 协作）；用 RFC 2119 单 worked example 替代原 5 case 矩阵。上游证据 N=5 几何不变量结论保留为参考。
