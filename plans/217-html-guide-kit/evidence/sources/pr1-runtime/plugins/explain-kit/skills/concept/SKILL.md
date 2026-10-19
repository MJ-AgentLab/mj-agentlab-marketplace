---
name: concept
description: >-
  Explain a concept, tool, API, protocol or product in depth when the user asks to
  understand its mechanism, application, tradeoffs, counter-examples or limits, or
  says “讲透”, “深入理解” or “吃透”. Default to Chinese and six adaptable sections
  connecting intuition, definition, examples, neighboring ideas and boundaries.
  Explicit skill selection takes priority. Quick term explanations and explanation
  requests with unclear depth use glossary. “帮我理解 X” or “解释 X” alone does not
  request depth; use glossary unless deeper mechanisms, examples or limits are asked for.
  Keep debugging, research, code review,
  documentation maintenance and drawing as the main task when requested.
---

# concept · 从理解推进到应用

使用 `$explain-kit:concept`，或在 ChatGPT 桌面端选择 **Concept**。
默认中文，保留英文术语、代码标识符、API 和产品的原文；默认受众是有技术背景但未深入接触主题的同事。
解释在聊天中交付。用户明确要求保存时才在授权位置写文件。

## 处理请求

1. 提取主题、语境、受众和用户指定的深度、长度、语言、格式。解释深度决定路由，工具/API/产品也可以深讲。显式选择本技能时保留该选择；普通短解释或深度模糊的解释请求优先 [glossary](../glossary/SKILL.md)，该技能不可用时直接给简答。
2. 明确当前定义与版本语境。主题很宽但目标已给出时按目标聚焦；仅在缺失语境会改变答案或范围无法合理确定时，提出一个含 2–3 个选项及推荐理由的问题，等待必要选择。不要询问已有上下文能确定的事实。
3. 使用授权上下文和必要的一手资料核对专门知识、不确定事实、历史起源、流派区别及产品/API 版本行为。引用关键来源并区分事实、推断和假设。资料或工具不可用时说明知识缺口；未知词不能为了填满章节编造解释。
4. 按默认六节组织解释，适应受众和用户要求。完成后检查：定义是否在声明的语境中成立，例子是否支持机制，反例与边界是否具体，类比是否夸大，是否把某个实现方案写成普遍必要条件。
5. 达到用户要求的理解深度后交付，不要求用户确认完成。主任务是调试、研究、审查或绘图时继续完成主任务，不仅返回概念解释。

## 默认六节与适应

默认约 500–800 字：

1. **问题背景**：谁遇到了什么问题。教学痛点与经查证的历史起源分开；无历史证据时讲需求背景。
2. **核心直觉**：优先用日常类比说明关键关系，并指出类比边界。日常类比会失真时用简化模型或解释过前置知识的技术例子。
3. **机制与定义**：讲清组成、工作过程和有辨识度的实现路径，在已声明的语境中给出精准定义。
4. **两个正例与一个反例**：例子有角色、动作和结果，优先跨不同应用领域；跨域迁移不成立时说明适用范围，保留准确的场景对比。反例说明“看起来像却不是”的关键差异。构造场景标作假设或例子，不冒充实际事件。
5. **相邻概念**：选择 2–3 个能帮助辨义的概念并说明差别。确有父类、同类或替代关系才使用这些标签。
6. **适用边界**：给出具体的失败、误用或选型场景，解释条件和原因。区分概念边界与某个实现方案的限制。

准确性、用户明确要求和语境优先于章节数量、例子数量及字数。
“更短”可约 300 字，“更详细”可约 1000 字，或遵从指定长度；不将默认字数分配当硬限制。
双语按用户要求组织；多主题逐个解释，遵从已明确的顺序和数量。
`@产品经理`、`@后端工程师` 等受众提示及“少术语”“偏工程”“偏产品”影响铺垫和例子。
“换正例”只调整相应例子，保持定义和语境一致。

## 示例校准：幂等性

在状态变换语境中，操作 f 满足 f(f(x)) = f(x) 时是幂等的。
工程解释要声明考察的效果及范围：把配置值设为目标值，重复执行仍得到同一配置；为同一次付款使用请求标识去重，是另一种实现途径。
覆盖式操作不普遍依赖请求凭证；采用请求去重方案时，重试标识变化、去重记录过期或并发处理不当才是该方案的具体边界。
乐观锁可以拒绝过期更新，但它本身不保证整个操作的外部副作用幂等。
描述 HTTP 方法时按协议的“预期服务器效果”说明，不声称重复响应内容或所有附带活动都相同。

准确性参考：[RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)。
