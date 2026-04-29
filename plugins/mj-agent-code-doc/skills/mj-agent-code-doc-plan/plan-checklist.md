# PLAN PR 前自查清单（6 项）

提交 PLAN PR 前，逐项确认：

## 1. ✅ frontmatter 5 字段齐全

```yaml
---
summary: <存在且非空>
owner: <存在且非空，默认 "项目负责人">
created: <YYYY-MM-DD 格式>
updated: <YYYY-MM-DD 格式>
state: <draft / accepted / executed / superseded 之一>
---
```

如果用了 `tracking_issue` / `tags` 等可选字段，确认值有效。

## 2. ✅ body 五件套齐全

- [ ] `## Context` — 至少 1 段叙述（≥ 30 字）
- [ ] `## Decisions` — 至少 1 项已决事（不能空表格）
- [ ] `## Steps` 或 `## Verification`（至少其中之一）— 至少 1 步骤 + 验收判据
- [ ] `## Open Items` — 即使没 open item 也保留段落（写"无"）
- [ ] `## References` — 至少 1 条引用（外部 URL 或内部 wikilink）

## 3. ✅ 落点正确

- [ ] 文件路径在 `plans/` 而非 `docs/`（canonical 与 working layer 不混）
- [ ] 文件名格式 `[PLAN]_<letter>_<topic>.md`，letter 按现有字母序连续（不跳号、不重复）
- [ ] topic 部分 snake_case 或 PascalCase，≤ 5 词

## 4. ✅ 不引入未定义概念

- [ ] body 中提到的所有"术语 / 概念"在已有 STANDARD / ADR / GUIDE 中有定义
- [ ] 如果不得不引入新概念，至少在 PLAN 中给出 1 段定义 + 列出"何时升级到 STANDARD"的判据

## 5. ✅ 关联 issue

- [ ] 至少 1 条 GitHub issue / Linear ticket 关联（在 frontmatter `tracking_issue` 或 body References）
- 例外：如果 PLAN 是初始 brainstorming 产物（尚无 issue），明确在 Open Items 标注"待创建 tracking issue"

## 6. ✅ 显式 Open Items

- [ ] Open Items 段落显式列出"尚未决定的事"（即使是"无"也要写）
- [ ] 每个 Open Item 给出"谁决议 / 何时决议 / 决议后回填到哪里"

## 自查脚本（建议）

可在 mj-agent 仓 root 跑：

```bash
# 检查 frontmatter
grep -E "^(summary|owner|created|updated|state):" plans/[PLAN]_<letter>_*.md

# 检查 body 段落
grep -E "^## (Context|Decisions|Steps|Verification|Open Items|References)" plans/[PLAN]_<letter>_*.md

# 检查 letter 字母序冲突
ls plans/\[PLAN\]_*.md | grep -oE "PLAN\]_[A-Z]_" | sort -u
```

如果 4-6 项有 ✅、1-3 项有 ❌，说明 PLAN 还没准备好提 PR；建议补全后再提。
