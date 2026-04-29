# RUNBOOK body 骨架

```markdown
# RUNBOOK: <Title>

## When to use

<触发条件：什么场景 / 什么 alert / 什么 symptom 触发本 RUNBOOK>

## Severity

| Level | 触发条件 |
|---|---|
| critical | <譬如"production 完全不可用"> |
| high | <譬如"production 部分降级"> |
| medium | <...> |
| low | <...> |

## Prerequisites

- 权限：<譬如 production DB admin 权限>
- 工具：<譬如 psql / kubectl / aws CLI>
- 知识：<譬如熟悉 PG primary/replica 拓扑>

## Steps

### Step 1: <triage / 诊断>

```bash
$ <检查命令>
```

预期输出（正常）：

```
<output>
```

判断：
- 如果输出含 X → 进 Step 2
- 如果输出含 Y → 进 Step 3 或 escalate

### Step 2: <采取行动>

```bash
$ <action 命令>
```

⚠️ **warning**：<执行前必须确认的事>

### Step 3: ...

（按需扩展）

## Verification

<操作后怎么确认成功>

```bash
$ <verify 命令>
# expected: <output pattern>
```

## Rollback

<如果操作失败 / 引入新问题，怎么回滚>

```bash
$ <rollback 命令>
```

## Escalation

如果以下情况发生，**立即** escalate：

- <情况 1，譬如"primary 数据库无法重启"〉
- <情况 2>

联系人：<oncall manager / Slack channel / phone>

## Related

- 关联 POSTMORTEM（依据本 RUNBOOK 设计）：<wikilink>
- 关联 ADR：<wikilink>
- 内外部 alert：<dashboard / alert 名>
```

## 段落填写要点

- **When to use**：必须是可观察的触发条件；"系统出问题"不算。
- **Severity 表**：让 oncall 一眼判断当前事件严重度（影响通知策略 / 升级路径）。
- **Prerequisites**：列**所有**：权限 + 工具 + 知识。oncall 在凌晨不能去找 admin 要权限。
- **Steps**：每步含**命令 + 预期输出 + 判断分支**。这是 RUNBOOK 与 GUIDE 最大区别——RUNBOOK 必须 actionable + decidable。
- **Verification**：必含；操作后必须有判定成功的方式。
- **Rollback**：必含（除非真无法回滚，明确写"不可回滚"）。
- **Escalation**：明确"什么情况下停止自己执行、call 谁"。

## 反例

- ❌ Steps 段太抽象（"重启数据库"——具体哪个命令？）
- ❌ 没有 Rollback 段（操作失败时 oncall 进退两难）
- ❌ Severity 表与 frontmatter `severity_levels` 不一致
- ❌ Escalation 段联系人是个人邮箱（应是 oncall 轮值人或 Slack channel）
- ❌ 没有 Verification（执行完不知道是否成功）
