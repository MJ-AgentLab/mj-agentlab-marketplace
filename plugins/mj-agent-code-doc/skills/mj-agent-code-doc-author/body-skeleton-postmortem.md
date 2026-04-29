# POSTMORTEM body 骨架（仿 Google SRE Workbook §15）

```markdown
# POSTMORTEM: <Incident Title>

> **Incident date**: <YYYY-MM-DD>
> **Duration**: <分钟>
> **Severity**: <level>
> **Status**: <open / mitigated / closed>

## Summary

<2-3 段：发生了什么 / 影响范围 / 根因摘要 / 已采取的措施。reviewer 读完此段就能理解事故全貌。>

## Timeline (UTC)

| 时间 | 事件 |
|---|---|
| <HH:MM> | <什么发生了 / 谁做了什么> |
| <HH:MM> | <...> |
| <HH:MM> | <事故开始> |
| <HH:MM> | <检测到> |
| <HH:MM> | <开始响应> |
| <HH:MM> | <缓解> |
| <HH:MM> | <完全解决> |

## Impact

- 受影响用户：<估计数 / 百分比>
- 受影响功能：<列表>
- 数据丢失：<是 / 否 / 部分>
- 财务影响：<估计 USD / N/A>

## Root cause

<根因分析（5 Whys 或 fishbone）。注意：根因不应该是"人为失误"——人会犯错是正常的，要分析"为什么系统允许这个错误发生"。>

### Why 1: <现象>

<解释>

### Why 2: <上一层的原因>

<解释>

...（继续追问到 systemic 原因）

## Detection

- 如何被发现的：<alert / 用户反馈 / oncall 巡检 / ...>
- MTTD（mean time to detect，从事故开始到被检测到）：<分钟>
- 改进点：<怎样下次能更早检测>

## Response

- 响应过程评估：<什么做对了 / 什么可以更快>
- MTTR（mean time to repair）：<分钟>
- 改进点：<怎样下次响应更快>

## Action items

| ID | 描述 | Owner | Due | Status |
|---|---|---|---|---|
| AI-1 | <譬如：增加 monitoring 检测此现象> | <person> | <date> | open |
| AI-2 | <...> | ... | ... | ... |

## What went well

- <值得复用的好做法 1>
- <好做法 2>

## What went wrong

- <可改进点 1>
- <可改进点 2>

## What we got lucky with

- <幸运因素：如果没这个，事故可能更糟>

## Lessons learned

<跨职能的经验教训；可能引发新的 STANDARD / RUNBOOK / SPEC 修订>

## References

- 相关 alert：<dashboard URL>
- 相关 RUNBOOK：<wikilink>
- 相关 ADR：<wikilink>
- Slack / chat 记录：<URL>
```

## 段落填写要点

- **Blameless**：POSTMORTEM 必须 blameless（不指责个人）；写"系统允许了 X"，不是"某人做错了 X"
- **Timeline**：用 UTC 时间统一；至少含"开始 / 检测 / 响应 / 缓解 / 解决"5 个时间点
- **5 Whys**：根因分析必须追问到 systemic 层面，不能停在表面
- **Action items**：必须 actionable + 有 owner + 有 due date；status 用 open/in-progress/done
- **What we got lucky with**：经常被忽略但很重要——揭示"下次可能没这么走运"
- **Lessons learned**：可能驱动新文档（STANDARD / RUNBOOK / SPEC）；如有，明确指向

## 反例

- ❌ Root cause 写"人为失误"（违反 blameless 原则）
- ❌ Timeline 缺 MTTD / MTTR 数字（无法量化改进）
- ❌ Action items 没 owner 或 due date（不可执行）
- ❌ POSTMORTEM 直接放 docs/runbook/（路径错；POSTMORTEM 是事后，RUNBOOK 是事前/中）
- ❌ 没有 What went well 段（POSTMORTEM 不只是检讨，也是肯定）
