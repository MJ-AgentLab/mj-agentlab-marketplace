# View: Structural （结构版）

This file is loaded by `nlm-studio` as the `===== VIEW PURPOSE =====`
section of `focus_prompt` for any artifact whose `view=structural`.
Five sections required (per SKILL.md failsafe).

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
2. 指出至少一个 explicit 结构图（slide 中是 layout、mind_map 中
   是辐射结构、video 中是 on-screen 框架）。
3. 回答「什么不属于 `<topic>`」并说出 prerequisites。
4. **关键反向测试**: 旁人是否说「这是讲系统结构的」「这帮我建
   立了全局观」？如果他说「我学了点新东西」但说不出结构 ——
   未达标。如果他说「这有点难懂 / 太多反例」—— 那是 challenge
   的特征，本档不达标。
5. **结构密度**: 30 分钟 audio / 15 张 slides / 1 张 mind_map
   中至少 3 处明确的 "N 维 / 层级 / 分组" 语言。0-1 = 不合格；
   2-3 = 临界；≥ 4 = 通过。

These criteria distinguish structural from its neighbors. A
structural artifact that gets confused for foundation has too much
story; one that gets confused for challenge has too much
counter-example. Aim for the middle: a clean, organized map.
