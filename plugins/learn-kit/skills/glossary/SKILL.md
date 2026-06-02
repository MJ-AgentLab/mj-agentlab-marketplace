---
name: glossary
description: >
  Explain an unfamiliar technical, business, or domain term in a single tight paragraph
  (~150–250 Chinese characters) using a fixed six-slot structure: analogy → category →
  pain point → plain-language definition → contrast → concrete example. The reader should
  "get it" in about 30 seconds — a speed-card, not an article.
  ALWAYS use this skill whenever the user types `/learn-kit:glossary` or `/glossary`
  (optionally followed by a term), or says any of: "解释术语", "讲讲这个概念", "什么是 X",
  "X 是什么", "帮我理解 X", "explain X", "what is X", "give me a quick explanation of X",
  or pastes a single term and asks for a digestible explanation. Also use whenever the user
  wants a short, vivid, one-paragraph explanation of a specific term rather than a long
  article, encyclopedia entry, documentation page, or tutorial — even if they don't
  explicitly say "glossary" or "速记卡". Default output language is Chinese, with the original
  term preserved verbatim (English/code identifiers stay in original form, no forced translation).
  Prefer this over `/learn-kit:concept` when the user signals brevity or speed (一句话 / 一段话 /
  快速 / quick / TL;DR) or is asking about a specific named tool, API, product, or code identifier
  (e.g. Advisory Lock, OAuth, useEffect) rather than an abstract concept.
  Do not use for: deep or applied understanding — recognizing a concept in new contexts,
  comparing alternatives, or understanding tradeoffs (use `/learn-kit:concept`); generating
  multi-tier learning documents, interactive HTML, or NotebookLM multimedia
  (use `/learn-kit:three-views`).
---

# Glossary — 一段话讲透一个术语

把一个陌生的专业术语用最少的句子讲到对方听懂为止。整段输出**一气呵成、约 150–250 字、不分小标题、不列点**。

## 触发与输入解析

- `/learn-kit:glossary <术语>`（亦可直接 `/glossary <术语>`）→ 直接对 `<术语>` 执行下面的六要素流程。
- `/learn-kit:glossary <术语> @<受众>` → 受众影响**类比物**(第 1 槽)和**例子场景**(第 6 槽)的选取。例:`/learn-kit:glossary Advisory Lock @数据分析师` 与 `@后端工程师` 应给出不同类比。
- 用户用自然语言提问("什么是 X"、"解释 X"、"X 是什么"、"explain X")时,同样走此流程。
- 若术语本身是英文或代码标识符,**原文保留**,不要硬翻成中文(例:`Advisory Lock`、`OAuth`、`useEffect` 都保持原样)。

## 六要素结构(必须按顺序、整段成文)

1. **类比** — 用对方大概率亲身体验过的**日常事物**开场;**禁止用另一个技术概念充当类比**。
2. **类比展开** — 一句话把比喻和术语的对应关系讲透,让画面立住。
3. **大类归位** — "它本质上是一种 ……",给对方一个心理货架。
4. **痛点 + 大白话定义** — 先讲它用来解决什么问题,再用大白话把定义补完。
5. **对比锚定** — 和最容易混淆的对照物比较,点出关键差异。
6. **具体例子** — 一个画面化的真实场景:**有角色、有动作、有结果**。

## 硬规则

- **一次只引入一个新概念**:定义里若冒出另一个术语,要么换大白话,要么顺手用半句话解释掉。
- 类比必须"日常可感"——办公室、厨房、交通、排队、抢座、便利贴、信箱这类场景优先。
- 默认中文输出,术语原文保留;受众未指定时,默认"有一定技术背景但不熟悉该术语的同事"。
- **输出前自检三件事**:六个槽位是否都到位?有没有未解释的新术语?类比是否真的"日常"?

## 模板(按此结构组段)

> 「**[术语]** 就像 **[类比物]**——**[类比展开]**。它本质上是一种 **[大类]**,用来解决 **[痛点]**,**[大白话定义]**。和 **[对照物]** 不一样的地方在于 **[关键差异]**。比如:**[具体场景]**。」

## 参考输出(Few-shot)

**输入**:`/learn-kit:glossary Advisory Lock`

**输出**:

> Advisory Lock 就像办公室打印机上贴的"使用中"便利贴——纸条本身物理上挡不住任何人,但只要大家约定"看到纸条就等一下",秩序就出来了。它本质上是 PostgreSQL 提供的一种锁机制,用来在不锁表、不锁行的前提下协调多个进程别同时干同一件事;锁的含义完全由应用自己约定,数据库只负责帮你举牌、不管你在锁什么。和行锁、表锁不一样的地方在于——数据库不替你判断冲突。比如多个 ETL 任务要写同一张表,约好先抢同一个 advisory lock 再开干,谁抢到谁执行。

## 失败兜底

- **术语太宽泛**(如"算法"、"数据库"、"中间件"):先反问用户具体语境或子方向,再按结构产出;不要硬讲一个空泛版本。
- **术语高度专业且需要前置概念**:用一句话铺垫前置概念,再进入六要素;不要在定义里堆叠多个未解释术语。
- **用户希望更详细/更简短**:在保留六要素结构的前提下调整长度;**不要因为缩短而丢掉类比或例子**——它们是这个提示词的核心价值。
- **用户连续问多个术语**:每个术语独立成段,各自走完整的六要素,不要因为相关就合并。
- **用户想"能识别 / 能应用 / 能选型"而不只是"听过就行"**:这是 `/learn-kit:concept` 的领域(分层 600 字 + 跨域正反例 + 失效边界)。可在结尾一句话提示用户切换;不要把本 skill 硬撑成深讲。
- **用户想要的是成套学习材料**(多档 markdown / HTML / 音视频)而非一段速记:那是 `/learn-kit:three-views` 的领域;一句话提示切换,不要把本 skill 撑成文档生成器。

## 调整开关(用户可在调用时指定)

- `@<受众>` — 切换类比与例子的口味
- `更短` — 压到 ~100 字,但六要素一个都不能省
- `更详细` — 放宽到 ~300–400 字,可在第 5 槽多展开一两个对照物
- `双语` — 在中文段后追加一段同结构的英文翻译
