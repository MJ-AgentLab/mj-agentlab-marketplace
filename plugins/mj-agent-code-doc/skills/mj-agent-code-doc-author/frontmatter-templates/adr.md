# ADR frontmatter 模板

```yaml
---
type: adr
domain: <按 mj-agent 仓 domain 列表选 1>
summary: <一句话定位本 ADR 决策什么>
owner: 项目负责人
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: draft
decision: accepted
track: <code / agent / shared 之一>
tags:
  - adr
  - <按主题加 tag>
---
```

## 字段说明

- `type`：固定 `adr`
- `decision`：必填，4 选 1：
  - `accepted` — 决定接受此方案
  - `rejected` — 决定不采纳此方案（仍写成 ADR 记录"为什么拒绝"）
  - `superseded` — 被新 ADR 替代（在 References 段引用替代它的新 ADR）
  - `proposed` — 提议中，尚未决议（极少用，通常用 `state: draft` 表达提议中）
- `track`：按决策影响范围选；如果决策跨代码 + agent 双侧（譬如部署架构）选 `shared`
- `tags`：必含 `adr` + 表征决策主题的 tag

## 路径

`docs/adr/[ADR]_<NNN>_<Title>.md`，编号严格连续（在新建前 `ls docs/adr/[ADR]_*.md | sort` 确认下一个编号）。

## 范例

参考 mj-agent 仓：
- `docs/adr/[ADR]_012_Two_Track_Documentation_Governance.md`（完整长形）
- `docs/adr/[ADR]_013_Plugin_SKILL_md_Schema_Separation.md`（紧凑形）

## 反例

- ❌ 缺 `decision` 字段（违反 A3）
- ❌ ADR 编号跳号或重复
- ❌ summary 写成"决策点 1"（太抽象）
- ❌ `decision: TBD` 或 `decision: pending`（应该用 `state: draft` 表达"还在讨论"，`decision` 字段不接受非 4 个枚举值）
- ❌ track 选错（譬如纯代码部署决策选 `agent`）
