# SPEC frontmatter 模板

```yaml
---
type: spec
domain: <按 mj-agent 仓 domain 列表选 1>
summary: <一句话定位本 SPEC 规定什么接口/schema/协议>
owner: <填写 SPEC owner，通常是相关接口的实现负责人>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: draft
version: v1.0
track: code
schema_ref: <可选：指向 schema 文件的相对路径，如 schemas/job_run_request.json>
tags:
  - spec
  - <按接口主题加 tag>
---
```

## 字段说明

- `type`：固定 `spec`
- `version`：**必填**，必须与文件名 `_vX.Y` 后缀一致（A1 校验）
- `schema_ref`（可选）：如果有对应的 JSON Schema / OpenAPI / proto 文件，引用到这里；CONTRACT-tool 类型同样需要
- `track`：通常 `code`；如果是 agent-facing tool 的 SPEC，`track: agent`

## 路径

`docs/spec/[SPEC]_<Title>_v<X.Y>.md`

版本号规则：major（X）变化 → 不向后兼容；minor（Y）变化 → 向后兼容。新版本不覆盖旧文件，**新建带新版本号的文件**，旧文件移到 `docs/archive/spec/` 并加 status banner。

## 范例

参考 mj-agent 仓现有 SPEC（注：v0.1 阶段 SPEC 实例较少，主要参考 STANDARD 命名与版本演进规则）。

## 反例

- ❌ `version: v1.0` 但文件名是 `_v1.1.md`（违反 A1）
- ❌ 缺 version 字段（SPEC 必须有版本）
- ❌ 在原 SPEC 文件上做 incompatible 改动（应新建 v2.0 文件）
- ❌ `schema_ref` 指向不存在的文件（A10 校验失败）
