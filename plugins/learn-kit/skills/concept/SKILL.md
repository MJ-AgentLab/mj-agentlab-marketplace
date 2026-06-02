---
name: concept
description: >
  Explain an abstract concept in a structured ~500–800-character Chinese response with six
  sections: origin pain point, core intuition, mechanism & definition, 2 cross-domain
  positive examples + 1 counter-example, neighboring concepts, failure boundaries.
  Goal: the reader can APPLY the concept (recognize it in new contexts, compare
  alternatives, judge tradeoffs), not just recite it.
  ALWAYS use this skill when the user types `/learn-kit:concept` or `/concept`
  (optionally with a concept name), or says: "讲透这个概念", "深入理解 X", "帮我吃透 X",
  "X 到底是什么", "理解概念 X", "explain the concept of X", "deep dive into X",
  "help me really understand X". Prefer this over `/learn-kit:glossary` whenever the user
  wants to USE a concept (apply it, compare alternatives, recognize it in new contexts,
  understand tradeoffs) — not just recognize it. Also prefer this when the topic is a
  *concept* (idempotency, eventual consistency, backpressure, ownership, monad, CAP,
  referential transparency) rather than a specific named tool, API, or product.
  Default language Chinese; technical terms preserved verbatim.
  Do not use for: a quick one-paragraph term card when the user only needs to recognize a
  term in 30 seconds (use `/learn-kit:glossary`); generating multi-tier learning documents /
  files — saved markdown / interactive HTML / NotebookLM audio·video·slides, i.e. when the user
  wants saved learning artifacts rather than a single in-chat explanation (use `/learn-kit:three-views`).
---

# Concept — 把一个概念讲到"能用"

把一个抽象的专业概念讲到对方不仅"懂"、还能在新场景里**识别和使用**。整段输出**分六个小节、约 500–800 字**(中文,术语原文保留)。

## 触发与输入解析

- `/learn-kit:concept <概念>`（亦可直接 `/concept <概念>`）→ 直接对 `<概念>` 执行下面的六要素流程。
- `/learn-kit:concept <概念> @<受众>` → 受众影响**类比物**(第 2 节)和**正例场景**(第 4 节)的选取。例:`/learn-kit:concept 幂等性 @产品经理` 与 `@后端工程师` 应给出不同正例。
- 用户用自然语言提问("讲透 X"、"深入理解 X"、"X 到底是什么"、"explain the concept of X")时,同样走此流程。
- 若概念本身是英文或代码标识符,**原文保留**,不要硬翻成中文(例:`Idempotency`、`Backpressure`、`Eventual Consistency` 都保持原样,中文译名作为辅助)。

## 何时用 concept 而不是 glossary

- 用户只想"听过就行" → 用 `/learn-kit:glossary`(术语速记卡,一段 200 字)
- 用户想"能识别 / 能应用 / 能选型" → 用本 skill(分层 600 字,带正反例和边界)
- 不确定时,默认用本 skill;输出一遍后由用户决定要不要切回 glossary
- 用户想要的是**成体系的学习材料**(多档 markdown 文档 / HTML / 音视频) → 那是 `/learn-kit:three-views` 的领域,不是单次问答

## 六要素结构(必须按顺序,每节一个小标题)

### 1. 起源痛点
没有这个概念的世界长什么样?谁最先被这个问题烧到?
- 一两句话,不超过 80 字。
- 不要写成"X 是为了解决 Y";要写成"在没有 X 之前,工程师每天都在被 Y 咬"。

### 2. 核心直觉
一句**日常类比** + 一句"aha"句子。
- 类比必须是非技术的日常事物(厨房、交通、办公室、排队、便利贴……)。
- 禁止用另一个技术概念充当类比。
- 不超过 100 字。

### 3. 机制与定义
它内部由哪些部分构成?工作流程是什么?最后用一句精准的形式化定义收口。
- 150–250 字。
- 如果有 2–3 种典型实现路径,逐条列出。
- 形式化定义放在段落最后一句,作为收口。

### 4. 正例 × 2 + 反例 × 1
- **正例 A**:典型场景,**有角色、有动作、有结果**,越具体越好。
- **正例 B**:和 A **形态不同**的另一个场景。如果 A 在分布式系统,B 就换到单机/前端/生活;如果 A 是后端,B 就换到 DNS / Git / 操作系统。**跨域是硬性要求**,不能给两个邻近场景。
- **反例 ×**:看起来像但其实不是的场景,**显式说明"差在哪"**。

### 5. 邻居概念
列 2–3 个最容易混淆的相邻概念,每条一句话:
- **父类**:它属于哪个更大的范畴?
- **兄弟**:和它平级、容易混的是?(说清楚区别)
- **对立 / 替代**:它在和谁竞争?什么场景下用对方更合适?

### 6. 失效边界
什么时候这个概念会失灵 / 反咬一口 / 被滥用?**给一个具体的"它不该出现的地方"**,不要写抽象的"使用时需要注意"。

## 硬规则

- **能用日常类比就不用技术类比**。
- **新冒出来的术语必须就地解释**(半句话足够),不能术语堆术语。
- **正例必须画面化**:有角色、动作、结果,严禁"比如在分布式系统中……"这种空话。
- **正例 A 和 B 必须跨域**——这是本 skill 最重要的设计,目的是逼出迁移能力。
- 默认中文输出,术语原文保留;受众未指定时,默认"有一定技术背景但未深入接触该概念的同事"。
- **输出前自检四件事**:六个槽位是否都到位?正例 B 和 A 是否真的跨域?有没有未解释的新术语?失效边界是不是具体场景而非抽象说教?

## 参考输出(Few-shot)

**输入**:`/learn-kit:concept 幂等性`

**输出**:

> ### 1. 起源痛点
> 网络不靠谱、客户端会重试。如果"扣款 100 元"这个动作执行两次就真的扣两次,那所有重试机制都会变成事故。没有幂等性,分布式系统里"再试一次"就等于"再坏一次"。
>
> ### 2. 核心直觉
> 幂等性就像电梯按钮——你慌了再按十次,电梯也只来一次。重复触发不会让事情更"多"发生。
>
> ### 3. 机制与定义
> 实现幂等性通常有三类做法:(a) 操作本身天然就是覆盖式的,比如"把状态设为 X",再做几次结果都一样;(b) 通过唯一标识(idempotency key、订单号)记录"这个动作我已经做过了",再来就直接返回上次的结果;(c) 通过版本号 / 乐观锁,让重复请求落到旧版本上自动失败。形式化地说:一个操作 f 是幂等的,当且仅当 f(f(x)) = f(x),无论执行多少次,系统最终状态都和执行一次相同。
>
> ### 4. 正例 × 2 + 反例 × 1
> - **正例 A**:用户在支付页面网络卡顿,慌得点了三次"确认支付",服务端用 order_id 去重,最终只扣了一次款、只生成了一个订单。
> - **正例 B**:你在 DNS 控制台把 example.com 的 A 记录设为 1.2.3.4,无论这条指令重放多少次,最终记录都是 1.2.3.4,不会变成 1.2.3.4.4.4。
> - **反例 ×**:转账接口写成"账户余额 -= 100"——看上去也是一个"扣 100"的动作,但每调用一次都真的少 100。它不是幂等的,因为它描述的是"变化量"而不是"目标状态"。
>
> ### 5. 邻居概念
> - **父类**:可靠性设计(fault tolerance / retry safety)。
> - **兄弟**:去重(dedup)、Exactly-Once 语义——都在解决"重复",但侧重不同:去重是事后清理,幂等是事前免疫,Exactly-Once 是端到端保证。
> - **对立 / 替代**:有状态的累加操作(`INCR`、`append`)——它们故意不幂等,因为业务就需要"每次都让世界多一点"。在计数、日志这种场景下,强行套幂等反而是错的。
>
> ### 6. 失效边界
> 幂等性只覆盖"操作的最终效果",不覆盖**去重凭证的生成**。一个邮件发送接口声明幂等:"重复调用只发一封邮件"——但前提是你能识别出"这是同一封"。如果客户端每次重试都换一个 message_id,幂等性立刻失效,用户会收到 N 封一样的邮件。换句话说:幂等性是一种**契约**,服务端单方面"声明幂等"是不够的,需要客户端和服务端共同维护去重凭证。

## 失败兜底

- **概念太宽泛**(如"面向对象编程"、"函数式编程"、"敏捷"):先反问用户希望聚焦哪个具体侧面(封装/不变性/纯函数/Scrum/Kanban……),再走六要素;不要硬讲一个空泛版本。
- **概念太抽象**(如范畴论的 monad、type-level 编程):日常类比会很勉强,可放宽硬规则,允许"半技术类比"(如用 Promise 链类比 monad);并在第 3 节多花一些字数铺垫前置概念。
- **概念有多个学派 / 定义**(如"DDD"、"REST"、"微服务"):在第 3 节开头说明"按 X 原版的说法",不要混合多种定义混杂输出。
- **正例 A 和 B 同质化**:这是最常见的失败模式。模型容易给两个分布式场景。自检阶段如果发现 A 和 B 同域,必须重写 B,跨到非技术领域或不同技术栈。
- **用户连续问多个概念**:每个概念独立成段,各自走完整的六要素;不要因为相关就合并讲。

## 调整开关(用户可在调用时指定)

- `@<受众>` — 切换类比与正例的口味(如 `@应届生`、`@产品经理`、`@架构师`)
- `更短` — 压到 ~300 字,但六个槽位一个都不能省;主要从第 3、4 节挤压
- `更详细` — 放宽到 ~1000 字,可在第 3 节展开实现细节,第 5 节增加邻居概念
- `双语` — 在每节中文后追加同结构的英文段落
- `换正例` — 用户对当前正例不满意时,跨到另一个域重写正例 A/B
