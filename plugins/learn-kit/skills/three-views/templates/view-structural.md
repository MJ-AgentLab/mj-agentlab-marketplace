# View: Structural （结构版）· Dual-Purpose Template

This file is loaded by `three-views` SKILL.md in two distinct phases:

- **Step 3 (markdown generation)** reads the `MARKDOWN_GENERATION_PROMPT` block to drive AI generation of `[LEARNING]_<topic>_structural.md`.
- **Step 5B (NLM artifact generation)** reads the `NLM_VIEW_PREFIX` block as the `===== VIEW PURPOSE =====` section of each `view=structural` NLM artifact's `focus_prompt`.

The two blocks are strongly delimited by HTML comments so the SKILL.md parser cannot accidentally feed one as the other. Both blocks must exist; SKILL.md aborts if either is missing (per failsafe lint in SKILL.md §"Template integrity checks"). The `NLM_VIEW_PREFIX` block must contain §1-§5 in order.

---

<!-- BEGIN:MARKDOWN_GENERATION_PROMPT -->

# Structural Tier (结构版) Prompt Template

## INSTRUCTIONS TO CLAUDE (skill-internal preamble — do NOT include in rendered output)

Substitute these placeholders before executing the PROMPT BODY:

- `{user_question}` — verbatim user question from three-views Step 1
- `{uploaded_docs_summary}` — 3-5 line summary of source_manifest entries, keyed by `S<n>` ids
- `{topic_name}` — confirmed topic slug

Read the source corpus (tracked in `source_manifest`) into context before executing. The prompt body's "上传文档" instructions operate on the loaded source.

After execution, prepend the YAML frontmatter from three-views Step 3. Write to `<output_dir>/[LEARNING]_<topic>_structural.md`.

Keep all 14 top-level sections in the order below. Tables must use the column headers exactly as specified — they are part of the contract.

---

## PROMPT BODY

请根据"用户问题"和"用户上传的文档"，为我生成一份【结构版学习文档】。

用户问题是：
{user_question}

上传文档包括：
{uploaded_docs_summary}

我的背景：
- 我已经对这个主题有初步印象，但知识还比较零散。
- 我希望建立系统结构，而不是只看摘要。
- 请重点帮助我理解概念之间的关系、层级、前置知识、适用边界和常见误用。
- 请把这个主题整理成一张可以复习、讲解和继续深入学习的知识地图。

生成要求：
1. 请优先围绕"用户问题"展开，而不是泛泛介绍整个领域。
2. 请充分利用上传文档中的内容。
3. 如果文档中有明确依据，请引用或指出依据来自哪个 source id（如 `[S1]` / `[S2]`），并写明章节或段落。
4. 如果文档没有覆盖某些内容，但为了帮助理解需要补充背景知识，请明确标注为"背景补充"。
5. 如果某些判断只是根据文档推断出来的，请标注为"推断"。
6. 不要编造文档中不存在的案例、数据、人名、结论或社区经验。
7. 如果文档信息不足，请明确指出"不足在哪里"。

请用 Markdown 格式输出，结构如下：

# {topic_name} 结构版学习文档

## 1. 用户问题的结构化拆解

请先拆解用户问题。

请回答：

- 用户问题中的核心对象是什么？
- 用户想理解的是概念、方法、案例、判断标准，还是应用边界？
- 这个问题涉及哪些关键词？
- 上传文档中哪些内容最相关？（按 source id 指明）
- 这个问题可以拆成哪些子问题？
- 哪些子问题是基础问题？
- 哪些子问题是进阶问题？

请用表格输出：

| 子问题 | 所属层级 | 相关概念 | 对应文档内容 | 重要性 |
|---|---|---|---|---|

## 2. 主题定位

请说明：

- 这个主题属于什么领域？
- 它主要处理什么对象？
- 它通常输入什么信息？
- 它通常产出什么结论、工具、判断或行动？
- 它和哪些相邻领域容易混淆？
- 它在整个知识体系中处于什么位置？

请用表格输出：

| 维度 | 说明 | 文档依据或说明 |
|---|---|---|
| 所属领域 |  |  |
| 处理对象 |  |  |
| 典型问题 |  |  |
| 典型产出 |  |  |
| 相邻领域 |  |  |
| 容易混淆点 |  |  |

## 3. 这个主题解决问题的基本路径

请把这个主题解决问题的过程拆成一个流程。

要求：
- 用步骤说明。
- 每一步说明输入、处理方式、输出和常见错误。
- 尽量用流程图式文本表达。
- 优先使用上传文档中的结构；如果文档没有明确流程，可以基于文档进行合理整理，并标注为"结构化整理"。

输出格式：

1. 第一步：【步骤名称】
   - 输入：
   - 要做的判断：
   - 输出：
   - 常见错误：
   - 文档依据：

2. 第二步：【步骤名称】
   - 输入：
   - 要做的判断：
   - 输出：
   - 常见错误：
   - 文档依据：

最后请给出一个完整流程总结：

```text
原始问题 → 关键概念 A → 关键概念 B → 判断标准 → 应用或结论
```

## 4. 概念地图

请从用户问题和上传文档中提取 15–25 个核心概念，并按照层级组织。

至少分为以下几类：

- 前置概念 — 不懂这些，很难理解主题本身。
- 核心概念 — 这是主题的骨架。
- 方法概念 — 用来分析、操作或判断。
- 边界概念 — 用来说明什么时候适用、什么时候不适用。
- 高级概念 — 可以先知道名字，但不必立刻掌握。

请输出为表格：

| 层级 | 概念 | 日常解释 | 它和哪些概念有关 | 为什么重要 | 文档依据 |
|---|---|---|---|---|---|

然后请用文字描述这些概念之间的关系。

请特别说明：

- 哪些概念是因果关系
- 哪些概念是包含关系
- 哪些概念是对比关系
- 哪些概念是前后步骤关系
- 哪些概念只是名称相似，但本质不同

## 5. 概念之间的关系表

请选择最重要的 10 组概念关系，按照以下格式分析：

| 概念 A | 概念 B | 关系类型 | 如何区分 | 常见误解 | 文档依据 |
|---|---|---|---|---|---|

关系类型可以包括：

- 前置关系
- 包含关系
- 因果关系
- 对比关系
- 工具与目标关系
- 问题与解决方案关系
- 现象与解释关系
- 输入与输出关系

## 6. 前置知识路线

请告诉我理解这个主题前，需要哪些前置知识。

请分成三类：

### 6.1 必须先懂

这些不懂，就很难继续。

### 6.2 最好了解

这些会提高理解质量，但不一定要完全掌握。

### 6.3 可以暂时跳过

这些属于高级内容，不影响第一轮理解。

输出格式：

| 类型 | 前置知识 | 为什么需要 | 最低掌握标准 | 文档依据或说明 |
|---|---|---|---|---|

请注意：最低掌握标准要具体，不要写"熟练掌握"。

## 7. 适用边界

请系统分析这个主题什么时候适用，什么时候不适用。

### 7.1 适用条件

请列出 5–8 个适用条件。

每个条件包括：

- 条件是什么
- 为什么需要这个条件
- 不满足会怎样
- 一个例子
- 文档依据或说明

### 7.2 不适用场景

请列出 5–8 个不适用场景。

每个场景包括：

- 场景是什么
- 为什么不适用
- 新手为什么容易误用
- 更合适的替代思路是什么
- 文档依据或说明

## 8. 成功案例结构分析

请从上传文档中提取成功案例、实践案例、正面应用案例或能够说明问题的例子。

如果文档中没有足够成功案例，请明确说：

"上传文档中没有足够成功案例。"

如果需要补充假设案例，请标注为"假设案例"。

每个成功案例按照以下格式输出：

### 成功案例 X：案例名称

- 案例背景：
- 原始问题：
- 使用了哪些核心概念：
- 解决路径：
- 成功的关键条件：
- 哪些条件不可复制：
- 可以迁移出的原则：
- 对理解这个主题有什么帮助：
- 文档依据：

最后请总结成功案例的共同模式：

| 共同模式 | 说明 | 可迁移性 | 文档依据或说明 |
|---|---|---|---|

## 9. 失败案例结构分析

请从上传文档中提取失败案例、踩坑经验、错误应用、反面案例或常见误用。

如果文档中没有足够失败案例，请明确说：

"上传文档中没有足够失败案例。"

如果需要补充假设案例，请标注为"假设案例"。

每个失败案例按照以下格式输出：

### 失败案例 X：案例名称

- 案例背景：
- 原始目标：
- 实际做法：
- 失败结果：
- 失败原因：
  - 概念误解：
  - 方法误用：
  - 条件不满足：
  - 反馈缺失：
  - 目标错误：
- 如何修正：
- 对理解这个主题有什么帮助：
- 文档依据：

最后请总结失败案例的共同模式：

| 失败模式 | 表现 | 根本原因 | 避免方式 | 文档依据或说明 |
|---|---|---|---|---|

## 10. 判断清单

请生成一份"遇到新问题时，如何判断能不能使用这个主题"的检查清单。

要求：

- 清单要可操作。
- 每一项都要能回答"是/否"或"程度如何"。
- 不要写抽象口号。
- 尽量结合用户问题和上传文档。

输出格式：

| 检查问题 | 为什么要问 | 是，意味着什么 | 否，意味着什么 | 文档依据或说明 |
|---|---|---|---|---|

检查问题可以包括：

- 这个问题是否属于该主题能处理的问题类型？
- 是否具备必要输入？
- 是否有评价标准？
- 是否满足适用条件？
- 是否存在更简单的替代方法？
- 是否可能被相邻领域更好地处理？

## 11. 学习路径图

请把这个主题整理成一条学习路线。

分为四个阶段：

### 阶段 1：建立直觉

目标：

- 听懂主题是什么
- 能说出它解决什么问题
- 能举一个例子

需要掌握：

- 概念 A
- 概念 B
- 概念 C

### 阶段 2：建立结构

目标：

- 理解概念关系
- 知道前置知识
- 能区分相邻概念

需要掌握：

- 概念 D
- 概念 E
- 概念 F

### 阶段 3：理解边界

目标：

- 知道什么时候适用
- 知道什么时候不适用
- 能识别失败案例

需要掌握：

- 概念 G
- 概念 H
- 概念 I

### 阶段 4：迁移应用

目标：

- 能把这个主题用于新案例
- 能判断适用性
- 能解释成功和失败机制

需要掌握：

- 概念 J
- 概念 K
- 概念 L

请结合用户问题和上传文档具体填写，不要使用空泛模板。

## 12. 结构化复习卡片

请生成 15 张复习卡片。

每张卡片包括：

- 正面问题
- 背面答案
- 关联概念
- 容易混淆点
- 对应文档内容

卡片类型包括：

- 定义卡
- 对比卡
- 流程卡
- 边界卡
- 案例卡
- 反例卡

## 13. 结构版自测题

请生成 12 道自测题。

题型要求：

- 3 道概念关系题 — 考察概念之间的关系，不只是定义。
- 3 道边界判断题 — 判断某个场景是否适用。
- 3 道案例分析题 — 分析成功或失败机制。
- 3 道迁移应用题 — 把概念用于新场景。

每道题请给出：

- 题目
- 参考答案
- 评分标准
- 常见错误
- 错误背后的概念漏洞
- 对应文档内容

## 14. 最终结构总结

请用以下三种形式总结：

- 一句话结构总结 — 这个主题的核心结构是什么？
- 一张表格总结 — 概念、作用、关系、边界。
- 一个学习建议 — 我下一步应该进入挑战版，还是先回到零基础版补直觉？请说明原因。

<!-- END:MARKDOWN_GENERATION_PROMPT -->

<!-- BEGIN:NLM_VIEW_PREFIX -->

# View: Structural NLM Focus-Prompt Prefix

This block is loaded by `three-views` Step 5B as the `===== VIEW PURPOSE =====` section of each `view=structural` NLM artifact's `focus_prompt`. Five sections required (per failsafe lint).

## §1 Pedagogical purpose

让已经接触过 `<topic>` 但只有「散点知识」的人完成「从 1 到 N」的
结构化扩展。具体讲：

- 能在脑中画出 `<topic>` 的概念地图：核心是什么、外延是什么、
  边界在哪里。
- 能区分 must-know（必须掌握）vs nice-to-know（了解即可）。
- 能讲出 `<topic>` 的 prerequisites（前置知识）和 follow-ups（后
  续延伸）。
- 能在被问到「`<topic>` 由哪几部分组成」时给出一个可信、可教别人
  的回答。

Structural is for the learner who can recognize the concept but
can't yet organize it. They have the pieces; they need the map.

## §2 Audience profile

- **Background**: 该领域已有一些接触，可能用过几次 / 听过同事讨论 /
  看过文档但没系统读完。术语听得懂但不一定能解释。
- **Motivation**: 建立全局观、查漏补缺、为教别人做准备、为深入
  学习做铺垫、面试 / 评审前的系统复习。
- **Common confusions**: 散点知识无法整合；记不住层级关系；分不
  清「这是 `<topic>` 的一部分」vs「这是相邻概念」。
- **Reading speed**: Comfortable with terminology. Wants
  structure, not motivation.

## §3 Style mandate

- **Lead with the map**. 在前 10% 的篇幅里给出 `<topic>` 的整体
  结构（N 维 / N 个层级 / N 个阶段），让听者知道「我接下来要去
  哪里」。Open with the destination, not the journey.
- **Concept maps over narratives**. 用层级关系 / 决策树 / 比较
  表 / 维度对照 表达结构。Foundation 用故事，structural 用图。
- **Mark prerequisites and scope boundaries explicitly**. 直说
  「要懂这个，先要懂 X」「这个 topic 不覆盖 Y，那是另一个领域」。
- **Use structural language**: 「the 3 dimensions」「2 axes」「4
  phases」「5-step lifecycle」「N+1 layered architecture」。
  Numbered groupings help the listener build a mental skeleton.
- **End with a self-check list** — "if you understood this artifact,
  you should now be able to: …" (3-5 items). This anchors the
  scope.
- **Citation tag**: `[LEARNING:structural]`.

## §4 Anti-patterns（绝对不能做的）

- **不要退回 foundation 档的故事化讲解**. 用类比 illustrate 单点
  概念可以，但 structural 的主轴是结构而非故事。If you're spending
  more than 20% of the artifact telling stories, you've drifted.
- **不要罗列细节而无层级**. 一份 "X 包含 a, b, c, d, e, f, g..."
  的清单是 structural 的失败。把它分组、给每组一个名字。
- **不要假装结构存在**. 不要因为「应该有 3 个维度」就硬凑 3 个。
  If the topic naturally has 2 axes, say 2.
- **不要用术语而不指明它在结构中的位置**. Every term used must
  link back to "this belongs to bucket X of the N-dimension map
  you saw in the opening".
- **不要忘记 boundary**. 一个不说「`<topic>` 不包含什么」的结构
  化讲解是不完整的。Boundary clarification 跟 inclusion 同等重要。

## §5 Success criteria（dogfood 可观察特征）

一个不知道 view 标签的旁人在体验完本 artifact 后，应该能：

1. 用「`<topic>` 由 N 个部分组成，分别是 X / Y / Z」的句式回答
   构成问题。
2. 指出至少一个 explicit 结构图（slide 中是 layout、video 中是
   on-screen 框架）。
3. 回答「什么不属于 `<topic>`」并说出 prerequisites。
4. **关键反向测试**: 旁人是否说「这是讲系统结构的」「这帮我建
   立了全局观」？如果他说「我学了点新东西」但说不出结构 ——
   未达标。如果他说「这有点难懂 / 太多反例」—— 那是 challenge
   的特征，本档不达标。
5. **结构密度**: 30 分钟 audio / 15 张 slides 中至少 3 处明确的
   "N 维 / 层级 / 分组" 语言。0-1 = 不合格；2-3 = 临界；≥ 4 = 通过。

These criteria distinguish structural from its neighbors. A
structural artifact that gets confused for foundation has too much
story; one that gets confused for challenge has too much
counter-example. Aim for the middle: a clean, organized map.

<!-- END:NLM_VIEW_PREFIX -->
