# STANDARD body 骨架

```markdown
# <STANDARD Title> v<X.Y>

## 0. 范围（Scope）

<本 STANDARD 适用于什么 / 不适用于什么；明确边界以避免后续 PR 反复争议>

## 1. 设计目标（Goals）

| 目标 | 解释 |
|---|---|
| <Goal 1> | <为什么这是目标> |
| <Goal 2> | <...> |

## 2. 核心规则（Rules）

### 2.1 <规则类别 1>

#### Rule X.X.1: <规则名>

<规则正文：明确"必须 / 不得 / 应当">

**正例**：
```
<allowed pattern>
```

**反例**：
```
<disallowed pattern>
```

#### Rule X.X.2: ...

### 2.2 <规则类别 2>

...

## 3. 可执行校验（Validation）

### 3.1 自动化校验

| Rule | 检查方式 | 工具 |
|---|---|---|
| Rule X.X.1 | <譬如 grep / lint script> | <工具名> |

### 3.2 PR 审查 checklist

- [ ] Rule X.X.1: <检查问句>
- [ ] Rule X.X.2: ...

## 4. 例外（Exceptions）

<什么情况下可以违反本 STANDARD；如何申请例外>

## 5. 演进（Evolution）

| 版本 | 日期 | 变更 |
|---|---|---|
| v<X.Y> | <date> | <主要变更> |

## 6. 参考（References）

- 派生自：<上级 STANDARD wikilink>
- 关联 ADR：<wikilink>
- 行业精度：<外部资料>
```

## 段落填写要点

- **Scope**：明确边界 / 例外；避免"什么都管"或"什么都不管"
- **Goals**：让 reviewer 理解 STANDARD 想达成什么；规则的合理性要靠 Goals 支撑
- **Rules**：用清晰的"必须 / 不得 / 应当"；每条规则配正反例
- **Validation**：必含；至少有 PR checklist；尽可能有自动化（lint / grep / script）
- **Exceptions**：必含；空 STANDARD 是僵化的，应允许例外但要明确审批路径
- **Evolution**：版本演进表；不删旧条目，加新行

## 反例

- ❌ Rules 没有正反例（reviewer 难判断边界）
- ❌ 没有 Validation 段（规则形同虚设；A6 校验失败）
- ❌ Exception 段缺（导致每次例外都要改 STANDARD，僵化）
- ❌ STANDARD 与 ADR 混淆（STANDARD 是规则，ADR 是决策；规则的来源应引用 ADR）
- ❌ 用 v1.1 inline 改动到 v1.2，未更新 frontmatter `version` 和 Evolution 表
