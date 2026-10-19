---
name: Documentation PR
about: 纯文档变更 (documentation/*) 的 Pull Request
---

## 文档变更内容
<!-- 列出新增或修改的文档及变更摘要 -->

## 变更原因
<!-- 为什么需要这次文档更新 -->

## 原意与工程覆盖
<!-- 按 INTENT 规范链接唯一原意、完整接受基线及一处决定记录，本PR承担范围/验收/剩余差距，关系分实际交付/依赖支撑/背景参考。纯格式维护无需新记录；工程完成与原意达成分别判断，新稿不虚称旧接受覆盖。 -->

## 自检结果
- [ ] 文件命名符合 [`[STANDARD]_Documentation_Framework.md`](../../docs/rule/[STANDARD]_Documentation_Framework.md) §2.4（`[TAG]_<Topic>.md`；无 `_vX.Y` 后缀除非 archived）
- [ ] 新普通文档含九字段（type / scope / summary / owner / created / updated / state / version / layer）；旧文档实质修订已审定归属并按 layer 严格校验，不再使用原项兼容，外部格式和冻结证据遵循原合同
- [ ] 独立 INTENT 按十字段（公共九字段加 intent-id）、七行来源责任表和五部分校验，全集合含退役/归档唯一；正常完整基线快照不登记第二正本，真实接受仍需决定证据
- [ ] canonical 保留 docs 领域位置；working 按用途放稳定 plans 任务目录或声明 purpose/owner 的公共领域位置；任务 INDEX、task/tracking、主 PLAN/REPORT、canonical/source 链接一致
- [ ] 接受原意、真实决定、实施事实、验证结果分别追溯；复用主文件，失败/恢复/延期保留，完成不搬迁
- [ ] 按实际候选核对来源/完整资源及独立阅读或交接验收，文件校验未冒充完整验收
- [ ] 标明 Epic、当前活动主 PR 和本 PR 的内部/最终角色；内部 Harness 与受保护 develop 批准分别处理
- [ ] markdown 风格符合 [`[STANDARD]_GitHub_Markdown.md`](../../docs/rule/[STANDARD]_GitHub_Markdown.md)（ATX headings / GFM tables / native alerts）
- [ ] 内部链接有效（相对路径，无 broken wikilinks）
- [ ] `docs/INDEX.md` 已同步更新
- [ ] AGENTS.md 已同步更新（如涉及 Plugin 文档结构变更）
- [ ] Commit message 符合 [`[STANDARD]_Commit_Message_Convention.md`](../../docs/rule/[STANDARD]_Commit_Message_Convention.md)（documentation/* 分支仅允许 `docs` 类型；scope 推荐 `docs-rule` / `docs-adr` / `docs-guide` / `docs-runbook` / `docs-spec` 中之一）
- [ ] CHANGELOG.md `[Unreleased]` 区块已更新（如属内容性文档变更；纯排版 / typo / 链接修复可豁免）

## Related STANDARDs
- [INTENT](../../docs/rule/[STANDARD]_AI_Engineering_Intent.md) — 唯一原意、完整接受与工程覆盖
- [Documentation Framework](../../docs/rule/[STANDARD]_Documentation_Framework.md) — 文档规范元框架
- [GitHub Markdown](../../docs/rule/[STANDARD]_GitHub_Markdown.md) — markdown 风格
- [Commit Message Convention](../../docs/rule/[STANDARD]_Commit_Message_Convention.md) — commit 格式
