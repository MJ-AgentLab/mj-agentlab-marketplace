# GUIDE frontmatter 模板

```yaml
---
type: guide
domain: <运行时 / 数据 / 部署 / 测试 / 工具 等；按 mj-agent 仓 domain 列表>
summary: <一句话定位本 GUIDE 解决什么场景问题，含目标受众>
owner: <填写 GUIDE 维护人，默认 项目负责人>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: draft
track: code
tags:
  - guide
  - <按主题加 tag>
---
```

## 字段说明

- `type`：固定 `guide`
- `domain`：按 mj-agent 仓 15 domain 选 1（参考 Code_Side_Documentation_Framework v1.0 §2 domain 列表）
- `summary`：含"目标受众"很重要——譬如"教 Python 后端工程师在本地搭 LangGraph Studio"
- `track`：默认 `code`；如果 GUIDE 同时面向代码 + agent 两侧（譬如调试 + prompt tuning 双 workflow），可以 `track: shared`
- `tags`：必含 `guide`；其他按主题（譬如 `langgraph`、`local-dev`、`debugging`）

## 路径

`docs/guide/[GUIDE]_<Title>.md`（GUIDE 通常无版本号；如果 GUIDE 大改导致结构变化，新建一个文件 `_v2` 后缀更直观）。

## 反例（不要这样写）

- ❌ `type: GUIDE`（大写错）
- ❌ `domain: ` 留空
- ❌ summary 只写"GUIDE for langgraph"（太宽泛，未明确目标受众）
- ❌ 把多个 GUIDE 合并为单文件（每个 GUIDE 应解决一个具体场景；多场景应拆多文件）
