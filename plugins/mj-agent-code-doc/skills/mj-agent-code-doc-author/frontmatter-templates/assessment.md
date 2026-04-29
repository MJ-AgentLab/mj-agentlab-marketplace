# ASSESSMENT frontmatter 模板

```yaml
---
type: assessment
domain: <按 mj-agent 仓 domain 列表选 1>
summary: <一句话定位本 ASSESSMENT 评估什么主题（含候选清单）>
owner: <评估发起人 / 负责人>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: draft
track: <code / agent / shared 之一>
candidates:
  - <候选方案 1>
  - <候选方案 2>
decision_date: <YYYY-MM-DD：预计或实际决策日期>
outcome: <选定方案，或 "pending"，或 "no-decision"（评估完成但决定不选）>
related_adr: <可选：本 assessment 决议后产出的 ADR 路径>
tags:
  - assessment
  - <按主题加 tag>
---
```

## 字段说明

- `type`：固定 `assessment`
- `candidates`：列被评估的候选方案；至少 2 个（单候选不需要评估）
- `decision_date`：预计或实际决议日期
- `outcome`：必填；3 种取值
  - 具体方案名（譬如 `pgvector`）— 已选
  - `pending` — 评估完成但决议未做（在 ADR 落地前的过渡状态）
  - `no-decision` — 评估发现现有方案足够 / 暂不引入新方案
- `related_adr`（可选）：决议后产出的 ADR；ASSESSMENT 是 ADR 的前置依据

## 路径

`docs/assessment/[ASSESSMENT]_<Title>.md`

## 范例

mj-agent v0.1 阶段尚无 ASSESSMENT 正例。可参考 RFC（Request for Comments）风格 + decision matrix 格式。

## 反例

- ❌ 没有 `candidates` 字段（评估对象不明确）
- ❌ `candidates` 只列 1 个候选（不是真评估，应直接写 ADR）
- ❌ 评估完成但 `outcome: pending` 持续超过 30 天（应转 `no-decision` 或推进 ADR 落地）
- ❌ `related_adr` 引用不存在的 ADR
- ❌ ASSESSMENT 没有评估维度（譬如性能/成本/可维护性）的 column 对比表
