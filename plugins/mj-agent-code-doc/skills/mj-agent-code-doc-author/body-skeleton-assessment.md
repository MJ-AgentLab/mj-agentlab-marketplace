# ASSESSMENT body 骨架

```markdown
# ASSESSMENT: <Title>

## Question

<本 ASSESSMENT 回答什么问题；明确 scope>

## Candidates

| 候选 | 简介 | 来源 |
|---|---|---|
| <候选 1> | <一句话> | <link> |
| <候选 2> | ... | ... |

## Evaluation criteria

| 维度 | 权重 | 评分尺度 |
|---|---|---|
| Performance | High | 1-5（1 差 / 5 好） |
| Cost | Medium | 1-5 |
| Maintainability | High | 1-5 |
| Maturity | Medium | 1-5 |
| <其他> | ... | ... |

## Scoring matrix

|  | 候选 1 | 候选 2 | 候选 3 |
|---|---|---|---|
| Performance | 4 | 3 | 5 |
| Cost | 3 | 5 | 2 |
| Maintainability | 4 | 4 | 3 |
| Maturity | 5 | 2 | 4 |
| **Weighted total** | <...> | <...> | <...> |

## Detailed analysis

### 候选 1: <名称>

#### 优点
- ...

#### 缺点
- ...

#### 实测数据 / 证据
- ...

### 候选 2: ...

...

## Recommendation

<选定的方案 + 理由（基于 scoring matrix + qualitative analysis）>

或：

`outcome: pending` — <为什么还不能决议；需要哪些前置数据>

或：

`outcome: no-decision` — <为什么决定不引入新方案>

## Next steps

- [ ] <譬如：起 ADR 落地决策>
- [ ] <譬如：起 SPEC 规定接口>
- [ ] <譬如：proof-of-concept 验证>

## Related

- 关联 ADR（产出）：<wikilink>
- 关联 issue（驱动本 assessment）：<wikilink>
- 外部参考：<URL / 论文 / blog post>
```

## 段落填写要点

- **Question**：必须明确；"评估 vector DB"太宽泛，"评估 vector DB 用于 mj-agent semantic search 场景，预算 1k QPS"才具体
- **Candidates**：至少 2 个；单候选不需要 ASSESSMENT
- **Evaluation criteria**：维度 + 权重 + 尺度；让评分可重现
- **Scoring matrix**：表格 quantitative；让 reviewer 一眼看出对比
- **Detailed analysis**：每候选至少含优 / 缺点 + 证据；不能只空有评分
- **Recommendation**：必须有结论（即使 pending / no-decision 也要明确标）
- **Next steps**：必须 actionable + 关联到 ADR / SPEC

## 反例

- ❌ Candidates 只列 1 个（不是评估）
- ❌ Scoring matrix 没维度权重（不同维度同等重要 → 误导决策）
- ❌ Detailed analysis 段空（只有数字没 reasoning）
- ❌ Recommendation 写"需要进一步研究"持续超过 30 天（应转 no-decision）
- ❌ ASSESSMENT 没产出 ADR（评估浪费）
