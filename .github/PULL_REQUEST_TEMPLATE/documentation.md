---
name: Documentation PR
about: 纯文档变更 (documentation/*) 的 Pull Request
---

## 文档变更内容
<!-- 列出新增或修改的文档及变更摘要 -->

## 变更原因
<!-- 为什么需要这次文档更新 -->

## 自检结果
- [ ] 文件命名符合 [`[STANDARD]_Documentation_Framework.md`](../../docs/rule/[STANDARD]_Documentation_Framework.md) §2.4（`[TAG]_<Topic>.md`；无 `_vX.Y` 后缀除非 archived）
- [ ] frontmatter 含 8 必需字段（type / scope / summary / owner / created / updated / state / version）
- [ ] 文件位于正确子目录（`docs/rule/` / `docs/adr/` / `docs/guide/` / `docs/runbook/` / `docs/spec/` / `docs/postmortem/`）
- [ ] markdown 风格符合 [`[STANDARD]_GitHub_Markdown.md`](../../docs/rule/[STANDARD]_GitHub_Markdown.md)（ATX headings / GFM tables / native alerts）
- [ ] 内部链接有效（相对路径，无 broken wikilinks）
- [ ] `docs/INDEX.md` 已同步更新
- [ ] CLAUDE.md 已同步更新（如涉及 Plugin 文档结构变更）
- [ ] Commit message 符合 [`[STANDARD]_Commit_Message_Convention.md`](../../docs/rule/[STANDARD]_Commit_Message_Convention.md)（documentation/* 分支仅允许 `docs` 类型；scope 推荐 `docs-rule` / `docs-adr` / `docs-guide` / `docs-runbook` / `docs-spec` 中之一）

## Related STANDARDs
- [Documentation Framework](../../docs/rule/[STANDARD]_Documentation_Framework.md) — 文档规范元框架
- [GitHub Markdown](../../docs/rule/[STANDARD]_GitHub_Markdown.md) — markdown 风格
- [Commit Message Convention](../../docs/rule/[STANDARD]_Commit_Message_Convention.md) — commit 格式
