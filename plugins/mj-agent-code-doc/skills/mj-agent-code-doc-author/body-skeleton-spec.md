# SPEC body 骨架

```markdown
# <SPEC Title> v<X.Y>

## Scope

<本 SPEC 规定什么、不规定什么。明确边界。>

## Glossary

| 术语 | 定义 |
|---|---|
| <术语 1> | <定义> |

## Specification

### <主要规范点 1>

<详细描述：字段 / 接口 / 协议>

```yaml
<schema 示例>
```

### <主要规范点 2>

...

## Examples

### Valid example

```json
{
  "<field>": "<value>"
}
```

### Invalid examples

```json
{
  "<field>": "<bad value>"  // 违反规则 X
}
```

## Versioning

<版本演进策略：major / minor / patch 各自的兼容性>

| 版本 | 日期 | 变更性质 | 兼容性 |
|---|---|---|---|
| v1.0 | <date> | 初始 | — |

## Validation

<如何校验某实例是否符合本 SPEC：JSON Schema / 测试代码 / 工具>

## References

- 关联 ADR：<wikilink>
- 关联实现代码：<repo path>
- schema 文件：<schema_ref 路径>
```

## 段落填写要点

- **Scope**：必含正向（"规定 X"）+ 反向（"不规定 Y，那由 Z 处理"）。避免范围歧义。
- **Glossary**：术语表是 SPEC 必需。reviewer 可能不熟悉领域；定义清楚再使用。
- **Specification**：核心；写得清晰、形式化。能用 JSON Schema / OpenAPI / proto 表达的就用，避免歧义。
- **Examples**：必含 valid + invalid 各 ≥ 1。让读者一眼看出"长什么样 + 不长什么样"。
- **Versioning**：单独段落记录版本演进；后续版本在表格新增行，不修改旧行。
- **Validation**：可执行的校验方式（脚本 / Schema / 测试）；reviewer 用此做实际验证。

## 反例

- ❌ Scope 段含糊（"about job runs"——不知道什么是 in/out scope）
- ❌ Glossary 缺（用 jargon 但不定义）
- ❌ Examples 只有 valid 没有 invalid（reviewer 不知道边界）
- ❌ Versioning 段缺（major/minor 升级规则不明，破坏向后兼容时无依据）
- ❌ schema_ref 字段在 frontmatter 但 SPEC body 不引用（A10 校验失败）
