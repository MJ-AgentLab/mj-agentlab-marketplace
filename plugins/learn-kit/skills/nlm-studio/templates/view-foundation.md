# View: Foundation （零基础版）

This file is loaded by `nlm-studio` as the `===== VIEW PURPOSE =====`
section of `focus_prompt`. It is read by NotebookLM as part of the
generation instruction for any artifact whose `view=foundation`. The
five sections below are not optional — the SKILL.md failsafe checks
their presence before allowing generation to proceed.

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
  segment; slides: final slide; mind_map: surfaced as 5 explicit
  branches; infographic: 5 numbered tiles; video: closing 30s on-
  screen text), the 5 most important takeaways must appear as
  short sentences (≤ 20 中文字符 / ≤ 12 English words each).
  These 5 lines must be self-standing — a reader who scans only
  the TL;DR pack should still walk away with the foundation tier's
  core message.
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
5. **类比密度**: 30 分钟 audio / 10 张 slides / 1 张 infographic
   中至少出现 3 个明确的「类比 / 比喻 / 生活化场景」。0 个 = 不
   合格；1-2 个 = 临界；≥ 3 = 通过。

These criteria are what makes a foundation artifact recognizable
from across the room. Strip them away and the artifact drifts
toward structural, which means a newcomer can no longer use it.
