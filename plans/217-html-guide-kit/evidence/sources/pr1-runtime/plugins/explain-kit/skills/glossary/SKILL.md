---
name: glossary
description: >-
  Explain an unfamiliar technical, business or domain term briefly when the user asks
  what it means, wants a quick explanation, or requests one paragraph. Default to Chinese
  and a compact everyday analogy, plain definition, distinction and concrete example.
  For an explanation request with unclear depth, start here. Explicit skill selection
  takes priority. A bare “帮我理解 X”, “解释 X” or “X 是什么” is a quick explanation
  unless the user also requests depth, mechanisms, counter-examples or boundaries.
  Requests for mechanisms, counter-examples, tradeoffs or limits use
  concept. Keep debugging, research, code review, documentation maintenance and drawing
  as the main task when the user is asking for those workflows.
---

# glossary · 一段话建立术语直觉

使用 `$explain-kit:glossary`，或在 ChatGPT 桌面端选择 **Glossary**。
默认中文，保留英文术语、代码标识符、API 和产品的原文；默认受众是有技术背景但不熟悉该词的同事。
解释在聊天中交付。用户明确要求保存时才在授权位置写文件。

## 处理请求

1. 从请求提取术语、语境、受众和已给出的长度、语言、格式要求。`@产品经理`、`@后端工程师`、`@非技术同事` 等受众提示影响类比、例子和术语密度。
2. 显式选择本技能时保留该选择并适应用户要求。“帮我理解 X”“解释 X”“X 是什么”没有额外深讲要求时先速解。自然语言深讲请求由 [concept](../concept/SKILL.md) 处理；当前环境没有该技能时直接完成解释。不要将主任务中的一句“解释”改造成独立术语卡。
3. 利用已有上下文确定含义。普通宽泛词可先给通用定义；多义词只有在不同语境会改变答案且上下文不足时才问一个带 2–3 个选项和推荐理由的问题，等待必要选择。陌生的内部代号先查授权上下文，无法确定时说明缺口并索取最小必要信息。
4. 不确定、专门领域、产品/API 的版本行为或其他可能变化的事实，使用当前可用工具核对一手资料。给关键查证结论附直接来源；工具或资料不可用时说明不确定之处，不补造定义。无需为稳定、已确定的普通解释执行固定工具流程。
5. 按下面的默认骨架写作，然后检查定义、类比和例子的准确性。达到用户要求的理解深度即可交付，不要求用户确认完成。

## 默认骨架与适应

单个术语、单种语言默认一段，约 150–250 字，按以下六要素组织：

1. 日常类比。
2. 类比与术语的对应关系。
3. 它属于哪类事物。
4. 解决的痛点与白话定义。
5. 和易混概念的关键差异。
6. 有角色、动作、结果的具体例子。

骨架服务理解。准确性、用户明确要求和语境优先；不适用的类比或分类可以省略或替换。
类比优先来自日常生活，并指出会误导理解的对应边界；需要前置概念时就地解释。
构造例子可以使用“假设”或“例如”，不能声称是实际发生的案例。

- “更短”可约 100 字或遵从指定字数，不强塞六要素；“更详细”可约 300–400 字。
- 双语时每种语言各一段；用户要求列表、表格等格式时遵从该格式。
- 多术语输入逐个解释，避免混成一段。已明确的数量和顺序直接执行；只在无法判断优先级且影响交付时询问。
- “少术语”“偏工程”“偏产品”分别调整表达密度和例子。

## 示例：PostgreSQL 语境的 Advisory Lock

Advisory Lock 像打印机上的“使用中”牌子：大家先约定，同一块牌子只能由一个任务持有，取得它的任务再操作打印机。它是一种由应用定义用途的数据库锁，用来协调任务访问同一业务资源。和行锁不同，数据库不会自动知道哪些业务操作该抢这把锁，也不强制绕过约定的程序遵守它；但同一锁标识的冲突申请仍由数据库协调。例如，两个数据同步任务先申请同一把排他锁，未取得锁的任务等待，取得锁的任务才开始同步。

准确性参考：[PostgreSQL Advisory Locks](https://www.postgresql.org/docs/18/explicit-locking.html#ADVISORY-LOCKS)。
