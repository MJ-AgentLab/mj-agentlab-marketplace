# View: Challenge （挑战版）· Dual-Purpose Template

This file is loaded by `three-views` SKILL.md in two distinct phases:

- **Step 3 (markdown generation)** reads the `MARKDOWN_GENERATION_PROMPT` block to drive AI generation of `[LEARNING]_<topic>_challenge.md`.
- **Step 5B (NLM artifact generation)** reads the `NLM_VIEW_PREFIX` block as the `===== VIEW PURPOSE =====` section of each `view=challenge` NLM artifact's `focus_prompt`.

The two blocks are strongly delimited by HTML comments so the SKILL.md parser cannot accidentally feed one as the other. Both blocks must exist; SKILL.md aborts if either is missing (per failsafe lint in SKILL.md §"Template integrity checks"). The `NLM_VIEW_PREFIX` block must contain §1-§5 in order.

---

<!-- BEGIN:MARKDOWN_GENERATION_PROMPT -->

# Challenge Tier (挑战版) Prompt Template

## INSTRUCTIONS TO CLAUDE (skill-internal preamble — do NOT include in rendered output)

Substitute these placeholders before executing the PROMPT BODY:

- `{user_question}` — verbatim user question from three-views Step 1
- `{uploaded_docs_summary}` — 3-5 line summary of source_manifest entries, keyed by `S<n>` ids
- `{topic_name}` — confirmed topic slug

Read the source corpus (tracked in `source_manifest`) into context. After execution, prepend the YAML frontmatter from three-views Step 3 and write to `<output_dir>/[LEARNING]_<topic>_challenge.md`.

This tier's hallmark is being **challenging** — the body explicitly asks Claude to expose blind spots, design counter-examples, and design transfer-application questions. Do NOT soften the difficulty when generating; the user has opted into this tier specifically for the rigor.

---

## PROMPT BODY

请根据"用户问题"和"用户上传的文档"，为我生成一份【挑战版学习文档】。

用户问题是：
{user_question}

上传文档包括：
{uploaded_docs_summary}

我的背景：
- 我已经初步了解这个主题，也看过相关材料。
- 现在我不想要简单摘要。
- 我希望你挑战我的理解，暴露我的知识盲区。
- 请重点使用反例、失败案例、常见误用、边界问题、迁移应用题来检查我是否真的理解。

生成要求：
1. 请优先围绕"用户问题"展开，而不是泛泛介绍整个领域。
2. 请充分利用上传文档中的内容。
3. 如果文档中有明确依据，请引用或指出依据来自哪个 source id（如 `[S1]` / `[S2]`），并写明章节或段落。
4. 如果文档没有覆盖某些内容，但为了帮助理解需要补充背景知识，请明确标注为"背景补充"。
5. 如果某些判断只是根据文档推断出来的，请标注为"推断"。
6. 不要编造文档中不存在的案例、数据、人名、结论或社区经验。
7. 如果文档信息不足，请明确指出"不足在哪里"。
8. 请不要只考察我是否记住定义，要重点考察我是否能判断边界、识别误用、分析失败、迁移到新场景。

请用 Markdown 格式输出，结构如下：

# {topic_name} 挑战版学习文档

## 1. 先定义"真正理解"的标准

请说明，对于这个主题来说，真正理解不只是：

- 能复述定义
- 能听懂解释
- 能记住术语
- 能看懂摘要

真正理解应该包括：

- 能解释它解决什么问题
- 能区分相邻概念
- 能举出最小例子
- 能举出反例
- 能判断适用边界
- 能分析成功案例
- 能诊断失败案例
- 能迁移到新情境

请结合用户问题和上传文档，把这些标准具体化。

输出格式：

| 理解层级 | 表现 | 不足表现 | 检验方式 | 文档依据或说明 |
|---|---|---|---|---|

## 2. 用户问题中最容易被误解的地方

请直接围绕用户问题，指出最容易误解的地方。

请回答：

- 用户问题中哪些词容易让人误解？
- 哪些地方看起来简单，其实背后有前置知识？
- 哪些地方容易把相邻概念混在一起？
- 哪些地方容易从文档中读出过度结论？
- 哪些问题目前文档没有足够信息支持？

请用表格输出：

| 易误解点 | 表面理解 | 深层问题 | 可能后果 | 文档依据或说明 |
|---|---|---|---|---|

## 3. 最容易"假装懂了"的地方

请列出 10 个看似懂了、其实可能没懂的地方。

每个点按照以下格式分析：

### 假懂点 X：【名称】

- 表面上会说什么：
- 实际上没懂什么：
- 为什么容易产生熟悉感：
- 如何测试自己是否真的懂：
- 一个暴露理解漏洞的问题：
- 文档依据或说明：

要求：
- 不要写空泛内容。
- 要具体指出概念、边界、案例或推理上的漏洞。
- 尽量结合上传文档。

## 4. 反例训练

请基于用户问题和上传文档，设计 8–10 个反例。

每个反例按照以下格式输出：

### 反例 X：看起来像，但其实不是

- 表面上为什么像这个主题：
- 实际上为什么不属于或不适用：
- 涉及哪个核心概念：
- 新手为什么容易误判：
- 正确判断标准是什么：
- 文档依据或说明：

请特别关注：
- 名称相似但本质不同的情况
- 表面符合但条件不满足的情况
- 成功案例被错误迁移的情况
- 用错评价标准的情况
- 文档结论被过度泛化的情况

如果上传文档不足以构造反例，请明确说明哪些反例属于"背景补充"或"假设案例"。

## 5. 相邻概念混淆挑战

请找出 5–8 组最容易混淆的概念、方法、领域或判断标准。

每组按照以下格式分析：

| 概念 A | 概念 B | 表面相似点 | 本质区别 | 判断问题 | 文档依据或说明 |
|---|---|---|---|---|---|

然后为每组生成一个判断题：

- 场景描述：
- 应该用概念 A、概念 B，还是都不适合？
- 参考答案：
- 判断依据：
- 常见错误：
- 对应文档内容：

## 6. 失败案例深度诊断

请从上传文档中提取失败案例、踩坑经验、错误应用、反面案例、误解或不成立的推论。

如果上传文档中没有足够失败案例，请明确说：

"上传文档中没有足够失败案例。"

如果需要补充假设失败案例，请明确标注为"假设案例"。

每个失败案例请不要只复述，要做诊断。

### 失败案例 X：案例名称

- 案例背景：
- 原始目标：
- 实际做法：
- 结果为什么不理想：
- 表层失败原因：
- 深层失败原因：
- 失败属于哪一类：
  - 概念误解
  - 目标错误
  - 方法误用
  - 条件不满足
  - 反馈缺失
  - 指标错误
  - 过度简化
  - 错误迁移
  - 文档证据不足
- 如果重新做，应该如何修改：
- 这个案例暴露了哪些理解盲点：
- 文档依据或说明：

最后请总结：

| 失败模式 | 表面现象 | 深层原因 | 如何提前发现 | 文档依据或说明 |
|---|---|---|---|---|

## 7. 成功案例反向审查

请从上传文档中提取成功案例、实践案例、正面应用案例或支持用户问题的例子。

如果上传文档中没有足够成功案例，请明确说：

"上传文档中没有足够成功案例。"

如果需要补充假设案例，请明确标注为"假设案例"。

请不要只说为什么成功，还要反向审查它的适用条件。

每个成功案例按照以下格式分析：

### 成功案例 X：案例名称

- 案例背景：
- 为什么它成功：
- 它依赖了哪些前提条件：
- 哪些条件换掉后可能失败：
- 哪些经验可以迁移：
- 哪些经验不能盲目迁移：
- 新手可能从这个成功案例中得出什么错误结论：
- 正确的可迁移原则是什么：
- 文档依据或说明：

最后请总结：

| 成功经验 | 可迁移条件 | 不可迁移条件 | 误读风险 | 文档依据或说明 |
|---|---|---|---|---|

## 8. 常见误用清单

请列出 10 个常见误用。

每个误用按照以下格式输出：

| 误用 | 为什么看起来合理 | 为什么其实有问题 | 如何修正 | 文档依据或说明 |
|---|---|---|---|---|

要求：
- 误用要具体。
- 尽量来自上传文档中的案例、讨论或材料。
- 文档不足时，请标注为"背景补充"。

## 9. 边界判断题

请设计 10 道边界判断题。

每道题包含：
- 一个具体场景
- 问题：这个主题是否适用？
- 选项：
  A. 适用
  B. 部分适用
  C. 不适用
  D. 需要更多信息
- 参考答案
- 判断依据
- 容易误判的原因
- 需要回到上传文档中核查的点

题目难度要逐步增加。

## 10. 迁移应用题

请设计 6 道迁移应用题。

要求：
- 题目不能只是复述上传文档中的例子。
- 要换一个新场景，测试我能不能迁移概念。
- 每题都要涉及至少 2–3 个核心概念。
- 每题都要有参考答案和评分标准。
- 如果新场景属于你补充的背景，请标注为"迁移练习场景"。

输出格式：

### 迁移题 X

- 新场景：
- 需要判断的问题：
- 应该调用哪些概念：
- 解题思路：
- 参考答案：
- 评分标准：
- 常见错误：
- 错误背后的概念漏洞：
- 对应文档内容：

## 11. 解释能力挑战

请生成 5 个"向别人解释"的任务。

每个任务要求我用不同对象来解释这个主题：

1. 向 10 岁孩子解释
2. 向完全外行解释
3. 向同事解释
4. 向怀疑这个主题有用的人解释
5. 向已经有一点背景但容易误用的人解释

每个任务请给出：
- 解释目标
- 必须包含的核心点
- 不能使用的术语
- 必须举的例子
- 容易讲错的地方
- 评分标准
- 可参考的文档内容

## 12. 概念诊断测试

请生成一套 15 题的诊断测试。

题型包括：

- 3 道定义辨析题
- 3 道概念关系题
- 3 道反例判断题
- 3 道失败案例诊断题
- 3 道迁移应用题

每道题请给出：
- 题目
- 参考答案
- 满分答案应该包含什么
- 半懂答案通常是什么样
- 错误答案通常是什么样
- 这个题目在测试哪个理解点
- 对应文档内容

## 13. 我的理解盲区定位表

请根据上面的挑战题，设计一个盲区定位表。

输出格式：

| 如果我答错这类题 | 说明我可能不懂什么 | 应该回看哪些概念 | 应该重新阅读上传文档中的哪些部分 |
|---|---|---|---|

盲区类型至少包括：
- 定义模糊
- 概念关系不清
- 不会举反例
- 不懂适用边界
- 误读成功案例
- 不会诊断失败案例
- 无法迁移到新场景
- 只会复述，不会使用
- 过度相信文档中没有充分支持的结论

## 14. 挑战版最终总结

请最后用三部分总结。

### 14.1 最危险的误解

列出 3–5 个最容易导致错误使用的误解。

### 14.2 最重要的边界

列出 3–5 个判断这个主题是否适用的关键边界。

### 14.3 下一步行动

请根据挑战版内容，告诉我下一步应该怎么做：

- 哪些概念需要回炉
- 上传文档中的哪些部分需要重读
- 哪些案例需要重新分析
- 哪些题目适合用来复习
- 我什么时候可以认为自己已经从"看懂"进入"会用"

请最后生成一句话提醒我：

"如果我只能做到 ______，说明我还只是熟悉；如果我能做到 ______，才说明我真正理解。"

<!-- END:MARKDOWN_GENERATION_PROMPT -->

<!-- BEGIN:NLM_VIEW_PREFIX -->

# View: Challenge NLM Focus-Prompt Prefix

This block is loaded by `three-views` Step 5B as the `===== VIEW PURPOSE =====` section of each `view=challenge` NLM artifact's `focus_prompt`. Five sections required (per failsafe lint).

## §1 Pedagogical purpose

让已经会复述定义、能画出结构图，但没有在真实情境里实战过 `<topic>`
的人完成「从 N 到 N+1」的能力跃迁 —— 从「看懂」到「会用」。具体讲：

- 在新情境（边界情形 / 反例 / 跨领域迁移）中能做出正确决策。
- 能识别 ≥ 3 种常见误用 / anti-pattern，并说出为什么是错的。
- 知道 `<topic>` 不适合什么情况 —— 知道何时不该用 `<topic>`。
- 能在被人挑战「但 X 情况下你这么做对吗」时给出有依据的回答。

Challenge is the rung where comprehension becomes competence. It's
the hardest tier to write well because it requires the listener to
already have the foundation and structural pieces in place; the
artifact's job is to *attack* that comprehension with edge cases.

## §2 Audience profile

- **Background**: 能复述 `<topic>` 的定义、能画出结构图、能向新人
  讲清楚是什么。但**还没**在 corner case 里被打过脸。可能要参加面
  试 / 第一次在 prod 用 / 即将 review 别人的代码 / 要带新人。
- **Motivation**: 通过考试 / 实战准备 / 评审能力 / 找出盲点。
- **Common confusions**: 表面理解和深度理解的差距；以为自己懂了，
  实际只是记住了 happy path；不知道自己不知道。
- **Reading speed**: Fast on familiar territory, slow on
  surprises. Will reread challenge cases multiple times.

## §3 Style mandate

- **Lead with provocation, not summary**. 在前 10% 里抛一个让听
  者意识到「我之前以为我懂了，但好像没那么简单」的问题。Hook
  with discomfort.
- **Each example must carry a contrast tension**：「乍看像 X，
  实际应该 Y」「直觉答案是 A，正确答案是 B」。No tension =
  no challenge. A challenge artifact full of confirmations is
  just a structural review.
- **Explicitly enumerate ≥ 3 anti-patterns** and explain why each
  is wrong. 不止说「不要这样」，要说「为什么这样错，错在哪个
  原则上」。
- **Include transfer questions** — 把 `<topic>` 放到一个邻近但不
  同的场景里：「如果换成 Y，刚才的判断还成立吗」。
- **End each major segment with a probing question**, not a
  summary. 「If you had this scenario tomorrow, what would you do
  first?」 The listener should leave with productive doubt, not
  closed-book confidence.
- **Citation tag**: `[LEARNING:challenge]`.

## §4 Anti-patterns（绝对不能做的）

- **不要退回 structural 档的概念地图复习**. If you're spending
  more than 20% recapping the structure, you've drifted. Challenge
  *assumes* the listener already has the map.
- **反例必须有挑战性 — easy 反例不算**. 「Don't divide by zero」
  作为 challenge 是失败的。挑战级反例应该是「直觉会选 X 但答案
  是 Y」类型。
- **不要解释「为什么这个 case 这样判断」时含糊**. Every
  challenge example must end with a sharp principle that explains
  the verdict. 不要"it depends"地结束。
- **不要把测试题答案写在 foundation / structural 输出中能找到的
  位置**. If a learner could solve a challenge question by looking
  up the structural artifact, the challenge isn't a challenge.
- **不要堆 trivia**. 5 个真正深度的反例 > 20 个浅层 trivia 题。

## §5 Success criteria（dogfood 可观察特征）

一个不知道 view 标签的旁人在体验完本 artifact 后，应该能：

1. 列出至少 3 个 anti-pattern（不止说出，能说为什么是 anti-）。
2. 在被给一个新情境时，能区分「这跟我刚学的 case 像 / 不像」并
   做出判断。
3. 说出 `<topic>` 不适合什么场景。
4. **关键反向测试**: 旁人是否说「这有点烧脑」「我意识到我之前
   想的太简单了」「让我重新审视了我以为懂的东西」？如果他说
   「这帮我系统化了」—— 那是 structural 的反馈，本档不达标。
   如果他说「这入门讲得真清楚」—— 那是 foundation，更不达标。
5. **挑战密度**: 30 分钟 audio / 15 张 slides 中至少 5 个具体的反例 /
   边界 / 迁移题。每个都要带「乍看像 X，实际应该 Y」的张力。0-2 =
   不合格；3-4 = 临界；≥ 5 = 通过。
6. **probing 结尾**: 每个主要段落收尾应是「问题 / 挑战」而非
   「总结 / 复述」。检查最后 3 段中至少有 2 段以 question 结尾。

The signature of a challenge artifact is *productive doubt*. If
the listener walks away thinking "I need to revisit my assumptions
about X", challenge succeeded. If they walk away thinking "I got
it", challenge failed — that's a structural outcome.

<!-- END:NLM_VIEW_PREFIX -->
