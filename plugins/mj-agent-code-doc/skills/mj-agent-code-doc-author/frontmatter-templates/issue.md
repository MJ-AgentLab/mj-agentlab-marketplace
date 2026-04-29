# ISSUE frontmatter 模板

```yaml
---
type: issue
domain: <按 mj-agent 仓 domain 列表选 1>
summary: <一句话定位本 ISSUE 描述什么问题>
owner: <issue owner，通常是发现人或负责人>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: draft
track: code
severity: <low / medium / high / critical>
status: <open / in-progress / blocked / resolved / wontfix>
blocking:
  - <被本 issue blocking 的文档 / PR / feature>
related_issues:
  - <相关 issue / PR / external ticket>
tags:
  - issue
  - <按主题加 tag>
---
```

## 字段说明

- `type`：固定 `issue`
- `severity`：4 级；与 POSTMORTEM 用同一组分级
- `status`：
  - `open` — 已知但未开始处理
  - `in-progress` — 正在处理
  - `blocked` — 等其他 issue/decision 解锁
  - `resolved` — 已解决
  - `wontfix` — 决议不修（在 References 给原因）
- `blocking`（可选）：本 issue 阻塞了哪些下游工作；让 reviewer 一眼看出影响面
- `related_issues`（可选）：链接到 GitHub issue / Linear ticket / 其他 mj-agent docs/issue/

## 路径

`docs/issue/[ISSUE]_<Title>.md`

如果 issue 是季节性 / 周期性的，可加日期前缀：`docs/issue/[ISSUE]_20260401_<Title>.md`

## 范例

参考 mj-agent 仓现有 issue（v0.1 阶段实例较少；可参考 GitHub issue tracking 风格）。

## 反例

- ❌ 没有 `status` 字段（reviewer 无法判断当前状态）
- ❌ `status: open` 但持续 6 个月没更新（应升级到 blocked 或 wontfix）
- ❌ `blocking` 列了不存在的 issue / PR（应在 References 段说明）
- ❌ ISSUE 描述是"一切都坏了"（太宽泛；应描述具体可观察的失败现象）
