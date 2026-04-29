# STANDARD frontmatter 模板

```yaml
---
type: standard
domain: <按 mj-agent 仓 domain 列表选 1，跨域用 SYS>
summary: <一句话定位本 STANDARD 强制什么规则>
owner: 项目负责人
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: draft
version: v1.0
track: <code / agent / shared 之一>
supersedes: <可选：被本 STANDARD 取代的旧 STANDARD 路径>
tags:
  - standard
  - <按主题加 tag>
---
```

## 字段说明

- `type`：固定 `standard`
- `version`：**必填**，与文件名 `_vX.Y` 后缀一致（A1 校验）
- `supersedes`（可选）：如果本 STANDARD 取代旧版本，引用旧文件相对路径；旧文件移 `docs/archive/rule/` 并加 status banner
- `track`：影响范围；跨轨规则用 `shared`，仅代码侧用 `code`，仅 agent 侧用 `agent`

## 路径

`docs/rule/[STANDARD]_<Title>_v<X.Y>.md`

升级规则：major 变化（不向后兼容） → 新建 `_v2.0`，旧文件 archive；minor 变化（兼容） → inline 更新 `version` 与 `updated` 日期。

## 范例

参考 mj-agent 仓：
- `docs/rule/[STANDARD]_MJ_Agent_Documentation_Meta_Framework_v2.0.md`（复杂跨轨）
- `docs/rule/[STANDARD]_MJ_Agent_Code_Side_Documentation_Framework_v1.0.md`（单轨子框架）
- `docs/rule/[STANDARD]_GitHub_Markdown_v1.0.md`（简版）

## 反例

- ❌ 缺 `version` 字段（违反 A1）
- ❌ 文件名 `_v1.0` 但 frontmatter `version: v0.9`（A1 不一致）
- ❌ 在 v1.0 文件上 inline 改动到 v1.1，未更新 `version` 字段
- ❌ STANDARD 没有 supersedes 但实际取代了旧版本（reviewer 无法追溯）
- ❌ track 选 `shared` 但实际只影响代码侧（提高 reviewer 成本而无收益）
