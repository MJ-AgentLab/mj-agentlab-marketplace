# RUNBOOK frontmatter 模板

```yaml
---
type: runbook
domain: <按 mj-agent 仓 domain 列表选 1>
summary: <一句话定位本 RUNBOOK 处理什么操作 / 故障>
owner: <填写 oncall team 或维护人>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: draft
track: code
severity_levels:
  - low
  - medium
  - high
  - critical
estimated_time_minutes: <预计执行总时长，整数分钟>
prerequisites:
  - <前置条件 1，如"需 production 数据库 admin 权限"〉
tags:
  - runbook
  - <按主题加 tag>
---
```

## 字段说明

- `type`：固定 `runbook`
- `severity_levels`（可选）：本 RUNBOOK 对应的事故严重等级；如果 RUNBOOK 是常规操作类（非故障应对），可省略
- `estimated_time_minutes`（可选）：让 oncall 快速判断"我有没有时间执行"；如果是流式持续操作，可省略
- `prerequisites`（可选）：执行前需要的权限 / 环境 / 工具
- `track`：通常 `code`；故障应对类几乎都是 `code`

## 路径

`docs/runbook/[RUNBOOK]_<Title>.md`

通常不带版本号（RUNBOOK 是活文档，inline 更新）；如果整体重写，加 `_v2` 后缀。

## 范例

参考 mj-agent 仓现有 RUNBOOK（v0.1 阶段实例较少；可参考 mj-system 仓 / Anthropic 公开 SRE runbook 范本）。

## 反例

- ❌ summary 模糊（譬如"数据库相关"——具体哪个故障？）
- ❌ 没列前置权限要求（oncall 在执行中才发现没权限）
- ❌ severity_levels 错配（routine maintenance 标 `critical` → reviewer 困惑）
- ❌ RUNBOOK 没对应的 POSTMORTEM trigger（事故应对类 RUNBOOK 应在 References 引用相关 POSTMORTEM 作为依据）
