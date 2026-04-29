# ISSUE body 骨架

```markdown
# ISSUE: <Title>

## Symptom

<可观察的失败现象；不是"系统坏了"，是"在 X 操作下，Y 输出 Z 错误，预期 W"。>

## Reproduction

```bash
# 最小复现步骤
$ <step 1>
$ <step 2>
```

预期：
```
<expected>
```

实际：
```
<actual>
```

## Impact

- 影响范围：<哪些用户 / 哪些功能 / 多少 PR/feature 被 blocked>
- 严重度：<frontmatter severity 字段一致>
- 是否阻塞：<frontmatter blocking 字段一致；详述 blocking 关系>

## Hypothesized cause

<猜测的根因；可以多个候选>

- 候选 1：<...>
- 候选 2：<...>

## Workaround

<如果有临时绕过方法，描述；明确是绕过而非修复>

## Permanent fix plan

<最终方案；如果还在评估多个候选，列出 + 标记选定的>

## Status updates

| 日期 | 更新 |
|---|---|
| <YYYY-MM-DD> | <进展 / 发现> |

## Related

- 关联 POSTMORTEM（如本 issue 来源于事故）：<wikilink>
- 关联 PR：<URL>
- 关联 GitHub / Linear：<URL>
- 关联 RUNBOOK（如需运维步骤绕过）：<wikilink>
```

## 段落填写要点

- **Symptom**：必须 specific + 可观察。"X 不工作"不算；"在 Y 输入下 X 返回 Z 错误码"才是。
- **Reproduction**：最小复现步骤；如果不可复现，明确写"间歇性"+ 出现频率
- **Impact**：与 frontmatter `severity` / `blocking` 字段一致；扩展说明
- **Hypothesized cause**：可以多候选；不要装作已知根因
- **Workaround**：如有，明确写。注意区分 workaround vs fix
- **Status updates**：定期更新（譬如每周）；让 reviewer 看到 issue 是否还活着

## 反例

- ❌ Symptom 写"系统不稳定"（太宽泛；无法验证修好了没）
- ❌ 没有 Reproduction 段（无法复现 → 无法修）
- ❌ `status: open` 但 status updates 段空且 6 个月未更新（应升级 blocked / wontfix）
- ❌ Workaround 与 fix 混淆（譬如"绕过：暂时不开 feature X"——这是 workaround，但写在 Permanent fix plan 段）
- ❌ ISSUE 实际是 feature request（应该用 GitHub Discussions 或别的渠道，不是 ISSUE 文档）
