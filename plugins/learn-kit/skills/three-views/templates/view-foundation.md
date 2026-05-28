# View: Foundation （零基础版）· Dual-Purpose Template

This file is loaded by `three-views` SKILL.md in two distinct phases:

- **Step 3 (markdown generation)** reads the `MARKDOWN_GENERATION_PROMPT` block to drive AI generation of `[LEARNING]_<topic>_foundation.md`.
- **Step 5B (NLM artifact generation)** reads the `NLM_VIEW_PREFIX` block as the `===== VIEW PURPOSE =====` section of each `view=foundation` artifact's `focus_prompt`.

The two blocks are **strongly delimited by HTML comments** so the SKILL.md parser cannot accidentally feed one as the other. Both blocks must exist; SKILL.md aborts if either is missing (per failsafe lint described in SKILL.md §"Template integrity checks").

The `NLM_VIEW_PREFIX` block must contain the five `## §<N>` headers (§1-§5) in order. Failsafe lint also enforces this.

---

<!-- BEGIN:MARKDOWN_GENERATION_PROMPT -->

# Foundation Tier (零基础版) Prompt Template

## INSTRUCTIONS TO CLAUDE (skill-internal preamble — do NOT include in rendered output)

Substitute these placeholders before executing the PROMPT BODY:

- `{user_question}` — verbatim user question from three-views Step 1
- `{uploaded_docs_summary}` — 3-5 line summary of source_manifest entries (paths / URLs / "用户粘贴文本 N 字"), keyed by `S<n>` ids
- `{topic_name}` — confirmed topic slug

Read the actual source corpus contents (tracked in `source_manifest` from Step 2) into context before executing the prompt body. The prompt body's "上传文档" instructions then operate on the loaded source.

After execution, prepend the YAML frontmatter that three-views Step 3 specifies (含 generator / topic / view / source_manifest / generated_at fields). Then write to `<output_dir>/[LEARNING]_<topic>_foundation.md`.

Keep all 13 sections of the rendered output in the order below — do not reorder, do not skip. Section depth and table shapes are part of the contract.

---

## PROMPT BODY

请根据"用户问题"和"用户上传的文档"，为我生成一份【零基础版学习文档】。

用户问题是：
{user_question}

上传文档包括：
{uploaded_docs_summary}

我的背景：
- 我对这个主题几乎没有系统背景。
- 请不要假设我已经懂专业术语。
- 请先用日常语言解释，再逐步引入专业表达。
- 我的目标不是马上成为专家，而是第一次真正听懂这个主题在讲什么、解决什么问题、为什么重要。

生成要求：
1. 请优先围绕"用户问题"展开，不要泛泛介绍整个领域。
2. 请充分利用上传文档中的内容。
3. 如果文档中有明确依据，请引用或指出依据来自哪个 source id（如 `[S1]` / `[S2]`），并写明章节或段落。
4. 如果文档没有覆盖某些内容，但为了帮助理解需要补充背景知识，请明确标注为"背景补充"。
5. 如果某些判断只是根据文档推断出来的，请标注为"推断"。
6. 不要编造文档中不存在的案例、数据、人名、结论或社区经验。
7. 如果文档信息不足，请明确指出"不足在哪里"，不要假装完整。

请用 Markdown 格式输出，结构如下：

# {topic_name} 零基础版学习文档

## 1. 用户真正想理解的问题是什么

请先不要急着解释术语，而是帮我拆解用户问题。

请回答：

- 用户表面上问的是什么？
- 用户真正想解决的理解困难可能是什么？
- 这个问题属于哪个领域或主题？
- 上传文档中哪些内容和这个问题最相关？（按 source id 指明）
- 如果用户是零基础，最可能卡在哪里？

请用简单语言说明。

## 2. 这个主题一句话讲是什么

请用三种方式解释：

### 2.1 一句话版本

用最简单的话说明这个主题是什么。

### 2.2 生活类比版本

请用一个生活中的类比帮助我理解。

要求：
- 类比要简单。
- 说明这个类比哪里准确。
- 也说明这个类比哪里不准确，避免我误解。

### 2.3 稍微专业一点的版本

在我已经理解生活类比后，再引入这个领域的正式说法。

## 3. 为什么这个问题值得理解

请围绕用户问题回答：

- 这个问题为什么会出现？
- 它通常和哪些现实场景有关？
- 不理解它，可能会造成什么误解？
- 上传文档中是否提到了类似问题、案例或背景？（标 source id）
- 这个问题和普通学习者、实践者、决策者有什么关系？

请避免抽象宣传，要用具体例子说明。

## 4. 新手最常见的原始困惑

请列出 5–8 个零基础学习者可能提出的"日常语言问题"。

要求：
- 不要一开始就用专业术语。
- 每个问题后面，请把它翻译成更专业的领域问题。
- 再说明这个问题需要哪些前置概念才能真正理解。
- 尽量结合上传文档中的内容。

输出格式：

| 新手的日常问题 | 翻译成领域问题 | 需要理解的前置概念 | 文档依据或说明 |
|---|---|---|---|

## 5. 这个主题通常能解决什么，不能解决什么

请分成两部分。

### 5.1 它通常能解决的问题

列出 3–5 类典型问题。

每一类包括：

- 问题是什么
- 一个简单例子
- 这个主题如何帮助解决
- 解决这个问题需要什么条件
- 上传文档中是否有相关依据（标 source id）

### 5.2 它不能解决或容易被误用的问题

列出 3–5 类边界或误用。

每一类包括：

- 误用是什么
- 为什么它不能这样用
- 新手为什么容易误解
- 正确的理解方式是什么
- 上传文档中是否有相关依据；如果没有，请标注为"背景补充"

## 6. 核心术语翻译表

请从用户问题和上传文档中提取 10–15 个最重要的术语。

每个术语请按照以下格式解释：

| 术语 | 日常语言解释 | 稍微专业的解释 | 最小例子 | 反例或容易混淆的情况 | 文档依据 |
|---|---|---|---|---|---|

要求：
- 日常语言解释必须让没有背景的人也能看懂。
- 不要堆砌定义。
- 每个术语至少给一个最小例子。
- 尽量指出它和相邻概念有什么不同。
- 如果某个术语不是文档中的术语，而是为了帮助理解补充的，请标注为"背景补充"。

## 7. 用一个完整故事串起来

请用一个连续的小故事，把这个主题的核心概念串起来。

要求：
- 故事要从用户问题或一个现实困惑开始。
- 逐步引出核心概念。
- 不要一次性堆砌术语。
- 每出现一个新概念，都解释它为什么此时需要被引入。
- 最后说明这个故事对应到上传文档中的哪些内容（标 source id）。
- 如果故事是为了教学目的构造的，请标注为"教学示例"。

目标是让我感觉：

"原来这些概念不是孤立的，它们是在解决一个连续问题。"

## 8. 成功案例：什么时候这样理解是有用的

请从上传文档中提取成功案例、实践案例、正面应用案例或有启发的例子。

如果文档中没有足够成功案例，请明确说：

"上传文档中没有足够成功案例。"

如果为了帮助理解需要补充一个假设案例，请明确标注为"假设案例"。

每个案例请按照以下格式分析：

### 成功案例 X：案例名称

- 案例背景：
- 做了什么：
- 用到了哪些核心概念：
- 为什么有效：
- 成功依赖什么条件：
- 哪些经验可以迁移：
- 哪些经验不能盲目迁移：
- 对零基础学习者的启发：
- 文档依据：

请注意：不要只复述故事，要分析成功机制。

## 9. 失败案例：什么时候会误解或误用

请从上传文档中提取失败案例、反面案例、踩坑经验、错误理解或常见误用。

如果文档中没有足够失败案例，请明确说：

"上传文档中没有足够失败案例。"

如果为了帮助理解需要补充一个假设失败案例，请明确标注为"假设案例"。

每个案例请按照以下格式分析：

### 失败案例 X：案例名称

- 案例背景：
- 做了什么：
- 为什么失败：
- 是概念误解、执行问题、环境问题、目标问题，还是资料不足？
- 新手为什么容易犯这个错：
- 如何避免：
- 文档依据：

请特别关注：
- 看似理解但其实没有理解的情况
- 只记住术语但不会使用的情况
- 把这个主题用到不适合场景里的情况

## 10. 新手最容易产生的 10 个误解

请列出 10 个误解。

每个误解按照以下格式输出：

| 误解 | 为什么容易这样想 | 正确理解 | 一个例子 | 文档依据或说明 |
|---|---|---|---|---|

要求：
- 这些误解要具体。
- 不要只写"概念不清楚"这种空泛表述。
- 尽量结合上传文档。
- 文档没有覆盖的误解，请标注为"背景补充"。

## 11. 我现在应该掌握到什么程度

请把学习目标分成三个层级。

### 第一层：听懂

我应该能：
- 用自己的话解释这个主题是什么
- 说出它解决什么问题
- 说出 3 个核心术语

### 第二层：看懂

我应该能：
- 看懂上传文档中的主要论点
- 知道哪些地方是核心，哪些是细节
- 识别 3 个常见误解

### 第三层：初步使用

我应该能：
- 判断一个新问题是否适合用这个主题来分析
- 举出一个最小例子和一个反例
- 解释一个成功案例和一个失败案例背后的原因

请结合用户问题和上传文档，具体填写每一层。

## 12. 零基础自测题

请生成 10 道自测题，难度从低到高。

题型包括：

- 3 道概念理解题
- 2 道例子判断题
- 2 道反例判断题
- 2 道案例分析题
- 1 道迁移应用题

每道题后面请给出：

- 参考答案
- 常见错误答案
- 为什么这个错误容易出现
- 对应回上传文档中的哪部分内容

## 13. 下一步学习路线

请给出一条非常具体的下一步路线。

要求：
- 不要让我"系统学习全部理论"。
- 请告诉我下一步最应该理解的 3–5 个概念。
- 请告诉我应该优先回看上传文档中的哪些部分。
- 请告诉我可以先忽略哪些高级内容。
- 请告诉我什么时候可以进入"结构版学习"。

最后，请用 5 句话总结这份文档最重要的内容。

<!-- END:MARKDOWN_GENERATION_PROMPT -->

<!-- BEGIN:NLM_VIEW_PREFIX -->

# View: Foundation NLM Focus-Prompt Prefix

This block is loaded by `three-views` Step 5B as the `===== VIEW PURPOSE =====` section of each `view=foundation` NLM artifact's `focus_prompt`. The five `## §<N>` sections below are not optional — SKILL.md failsafe lint checks their presence + slugs (§1 Pedagogical purpose / §2 Audience profile / §3 Style mandate / §4 Anti-patterns / §5 Success criteria) before allowing generation to proceed.

## §1 Pedagogical purpose

让从未接触过 `<topic>` 的人在听 / 看 / 读完本 artifact 后完成「从 0
到 1」的心智模型搭建。具体讲：

- 能用一两句话准确复述 `<topic>` 的核心命题。
- 能说出 `<topic>` 为什么重要（场景化的「如果掌握了，我能做什么」）。
- 不必能展开技术细节，但听完之后再遇到这个词不再陌生。

This is the first rung on the learning ladder. Everything else
depends on the listener crossing it.

## §2 Audience profile

- **Background**: 完全的领域新人。可能在某处听过名词，但从未真正
  用过。可能完全没听过。
- **Motivation**: 好奇 / 入门 / 工作上即将接触这个概念 / 想知道是
  否值得深入学。
- **Common confusions**: 术语堆叠让人放弃；跳跃式推导造成「我不会」
  的挫败；隐含的 prerequisites 没说清楚就开始用。
- **Reading speed**: Slow. Each new term needs a beat to register.

## §3 Style mandate

- **Open with a relatable scenario**, not an abstract definition.
  例：「想象你第一次走进一家从未来过的餐厅……」
- **Use analogies aggressively**. 类比可以失精确，但要先建立直觉。
  然后再回头精修。
- **5-pack TL;DR is mandatory**. Toward the end (audio: closing
  segment; slides: final slide; video: closing 30s on-screen text),
  the 5 most important takeaways must appear as short sentences
  (≤ 20 中文字符 / ≤ 12 English words each). These 5 lines must be
  self-standing — a reader who scans only the TL;DR pack should
  still walk away with the foundation tier's core message.
- **Introduce each concept by stating what real problem it solves**
  before defining it. 「先讲为什么有这个东西，再讲它是什么。」
- **Citation tag**: When referencing source material, use
  `[LEARNING:foundation]` so downstream review can verify lineage.

## §4 Anti-patterns（绝对不能做的）

- **不要罗列定义**. A bullet list of definitions without motivation
  is foundation's #1 failure mode. Every term needs a "why" before
  the "what".
- **不要假设用户『应该知道』前置知识**. If a concept relies on
  prerequisites, either explain them inline (preferred) or say
  explicitly "if you don't know X yet, that's fine for now —
  here's the one-sentence version".
- **不要用术语解释术语**. "REST is the architectural style for
  RESTful APIs" — circular and useless. Foundation never does this.
- **不要跳步推导**. If steps A→B→C lead to a conclusion, walk
  through B. Don't say "obviously" or "as you can see".
- **不要堆砌例子**. One excellent grounded example beats five
  abstract ones. Pick the one that maps best to everyday
  experience.

## §5 Success criteria（dogfood 可观察特征）

一个不知道 view 标签的旁人在体验完本 artifact 后，应该能：

1. 用 1 句话复述 `<topic>` 的核心命题 — 准确即可，不必技术性。
2. 列出 ≥ 2 个具体应用场景。
3. 默写出 TL;DR 5-pack 中至少 3 条的大意。
4. **关键反向测试**: 旁人是否说「这听起来像是给初学者讲的」？
   如果他形容为「专业 / 进阶 / 系统化」—— 那是 structural 或
   challenge 的特征，本档不达标。
5. **类比密度**: 30 分钟 audio / 10 张 slides 中至少出现 3 个明确
   的「类比 / 比喻 / 生活化场景」。0 个 = 不合格；1-2 个 = 临界；
   ≥ 3 = 通过。

These criteria are what makes a foundation artifact recognizable
from across the room. Strip them away and the artifact drifts
toward structural, which means a newcomer can no longer use it.

<!-- END:NLM_VIEW_PREFIX -->
