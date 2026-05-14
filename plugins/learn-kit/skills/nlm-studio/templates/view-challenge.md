# View: Challenge （挑战版）

This file is loaded by `nlm-studio` as the `===== VIEW PURPOSE =====`
section of `focus_prompt` for any artifact whose `view=challenge`.
Five sections required (per SKILL.md failsafe).

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
5. **挑战密度**: 30 分钟 audio / 15 张 slides / 1 张 infographic
   中至少 5 个具体的反例 / 边界 / 迁移题。每个都要带「乍看像 X，
   实际应该 Y」的张力。0-2 = 不合格；3-4 = 临界；≥ 5 = 通过。
6. **probing 结尾**: 每个主要段落收尾应是「问题 / 挑战」而非
   「总结 / 复述」。检查最后 3 段中至少有 2 段以 question 结尾。

The signature of a challenge artifact is *productive doubt*. If
the listener walks away thinking "I need to revisit my assumptions
about X", challenge succeeded. If they walk away thinking "I got
it", challenge failed — that's a structural outcome.
