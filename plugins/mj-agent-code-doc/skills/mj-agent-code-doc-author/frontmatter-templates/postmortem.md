# POSTMORTEM frontmatter 模板

```yaml
---
type: postmortem
domain: <按 mj-agent 仓 domain 列表选 1>
summary: <一句话定位事故的本质（不是"X 服务挂了"，是"X 服务在 Y 时挂了导致 Z 用户受影响"）>
owner: <事故 IC，Incident Commander>
created: <YYYY-MM-DD：事故复盘文档创建日期>
updated: <YYYY-MM-DD>
state: draft
track: code
incident_date: <YYYY-MM-DD：事故实际发生日期>
incident_duration_minutes: <事故影响持续时间（分钟）>
severity: <low / medium / high / critical>
status: <open / mitigated / closed>
affected_components:
  - <受影响的组件 1>
  - <受影响的组件 2>
affected_users_estimate: <预计受影响用户数；可写"N/A"如内部组件>
tags:
  - postmortem
  - <按事故主题加 tag>
---
```

## 字段说明

- `type`：固定 `postmortem`
- `incident_date`：事故**发生**日期（与 `created`/`updated` 区分；created 是文档创建日期）
- `severity`：必填；遵循事故响应分级
- `status`：
  - `open` — 复盘进行中，根因未定
  - `mitigated` — 短期缓解措施已就位，长期方案待定
  - `closed` — 复盘完成，所有 action items 关闭
- `affected_components`：列具体服务/模块/组件名
- `track`：通常 `code`；如果事故是 agent 输出错误（譬如答案幻觉），可选 `agent`

## 路径

`docs/postmortem/[POSTMORTEM]_<incident_date_YYYYMMDD>_<Title>.md`

譬如：`docs/postmortem/[POSTMORTEM]_20260401_PG_OOM_Production.md`

## 范例

mj-agent v0.1 阶段尚无事故。可参考 Google SRE Workbook §15 / Anthropic 公开 incident reports 风格。

## 反例

- ❌ summary 写"事故复盘"（重复了 type；应写事故本质）
- ❌ `severity` 后置（reviewer 在 list 视图看不到事故严重度）
- ❌ POSTMORTEM 落在 `docs/runbook/`（应该是 `docs/postmortem/`）
- ❌ 没有 `affected_components`（reviewer 不知道事故覆盖范围）
- ❌ `status: open` 但已经过去 30 天没更新（应升级到 mitigated 或 close）
