# ADR body 骨架（5 段标准式）

```markdown
# ADR <NNN>: <Title>

## Context

<3-5 段：问题陈述 / 当前状态 / 触发本决策的原因 / 相关背景。让读者理解"为什么需要做决策"。>

### 子背景 1（可选）

<拆解某个复杂背景因素>

### 子背景 2（可选）

...

## Decision

<明确选定的方案；用 1-3 段写清"我们决定 X，X 长什么样"。如有多个决策点，分子段：>

### 决策点 1：<标题>

<选择内容>

### 决策点 2：<标题>

...

## Consequences

### 正面

- <好处 1>
- <好处 2>

### 负面

- <代价 1>
- <代价 2>

### 中性

- <影响但难评好坏的事>

### 风险

- <可能但未发生的负面后果>

## Alternatives considered

- **方案 I（<名称>）**：<描述>。**采纳/未采纳**：<理由>
- **方案 II（<名称>）**：<描述>。**采纳/未采纳**：<理由>
- **方案 III（<名称>）**：<描述>。**采纳/未采纳**：<理由>

## References

- 关联 ADR：<wikilink>
- 关联 STANDARD：<wikilink>
- 关联 SPEC：<wikilink>
- 关联 ASSESSMENT（如有）：<wikilink>
- 外部资料：<URL / 文献>
```

## 段落填写要点

- **Context**：足够长（3-5 段），让一个不在场的 reviewer 也能理解决策动机。最好包含"如果什么都不做的代价"。
- **Decision**：必须是肯定句。"我们决定 X"，不是"我们考虑 X 或 Y"。如果还在讨论，应该是 ASSESSMENT，不是 ADR。
- **Consequences**：正/负/中/风险至少各 1 项；如果某类没有，明确写"无"或"暂未识别"。
- **Alternatives**：至少 2 个真实考虑过的方案 + 拒绝理由。"用别的"不算 alternative。
- **References**：必须有；至少 1 条内部 wikilink + 1 条外部参考（除非纯内部决策）。

## 反例

- ❌ Context 只 1 句话（reviewer 没法理解动机）
- ❌ Decision 段写成讨论体（"我们觉得 X 可能比较好"——不是决策）
- ❌ Consequences 只写好处（reviewer 怀疑决策不诚实）
- ❌ Alternatives 段省略（A4 校验失败；ADR 必须有"为什么不选别的"的论证）
- ❌ References 段空或只列 README（无法追溯具体设计依据）
