# PLAN body 五件套骨架（直接 copy 起草）

> 用法：把以下内容 copy 到新建的 `plans/[PLAN]_<letter>_<topic>.md` 文件，替换 `<...>` 占位。
> 字母序在新建前先 `grep -E "^plans/\[PLAN\]_[A-Z]_" mj-agent/plans/` 看现有用到哪个字母。

```markdown
---
summary: <一句话定位：本 PLAN 解决什么问题>
owner: 项目负责人
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: draft
---

# PLAN <letter>: <Topic>

## Context — 为什么做

<3-5 段：问题陈述、当前状态的痛点、为什么现在做、相关背景>

## Decisions — 已经决定的事

| 决策 | 选择 | 偏离基线 |
|---|---|---|
| <决策项 1> | <选择 A> | <如果偏离了某 STANDARD/ADR，注明> |
| <决策项 2> | <选择 B> | — |

## Steps / Verification — 分步实施 + 自检判据

### Step 1: <第一步标题>

- 动作：<具体做什么>
- 验收：<怎样判定本步完成>

### Step 2: <第二步标题>

- 动作：...
- 验收：...

（按需扩展）

## Open Items — 尚未决定 / 待回答的事

- <Open item 1：等待 X 决议>
- <Open item 2：与 Y 协调>

## References

- 关联 ADR：<ADR 路径或编号>
- 关联 STANDARD：<STANDARD 路径>
- 关联现有 PLAN：<PLAN 路径>
- 外部参考：<URL / 文献>
```

## 字段填写细节

### summary 风格

- 一句话，明确动词 + 对象 + 范围
- 反例："文档治理改进"（太宽泛）
- 正例："Phase 0 docs governance 验证（V1-V13 全绿后 v1.1 → archive；v2.0 → active）"

### owner

- 默认 "项目负责人"；如果有具体接力人填具体名称
- 不要留空（reviewer 无法追溯）

### state

- `draft`：起草中，可被修改
- `accepted`：已批准，进入实施
- `executed`：已实施完成，可考虑 archive
- `superseded`：被新 PLAN 替代（在 References 中指向新 PLAN）

### Decisions vs Open Items 的边界

- Decisions：已经定下来的、不再回头的；写"选择 X 而非 Y，理由 Z"
- Open Items：还在讨论 / 等其他 PR / 等用户决议的；写"待 X 决议后回填"

### References 类别

- ADR / STANDARD 链接用 wikilink（mj-agent 仓 Obsidian 友好）：`[[../docs/rule/[STANDARD]_X|X]]`
- 外部 URL 用 markdown link

## 反例骨架（不要这样写）

- 没有 Verification：只有 Steps 没有"怎样确认完成"——执行时无法判断是否到达成功
- Decisions 与 Open Items 混淆：把还在讨论的事写到 Decisions，导致 PR 中出现"决议反悔"
- References 只列 URL 不列内部 ADR/STANDARD：reviewer 无法追溯设计依据
- 没有 letter 字母序：`plans/[PLAN]_New_Thing.md`（应为 `plans/[PLAN]_G_New_Thing.md`）
