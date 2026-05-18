## 变更摘要
<!-- 简述本次变更的内容和目的 -->

## 关联 Issue
Closes #

## 影响范围
<!-- 受影响的 Plugin / Skill / 基础设施 -->

## 自检结果
- [ ] plugin.json 字段完整（name, description, version, author, license, skills）
- [ ] SKILL.md frontmatter 有效（name, description）
- [ ] 无残留调试代码
- [ ] Commit message 符合 `<type>(<scope>): <summary>` 规范
- [ ] CHANGELOG.md `[Unreleased]` 区块已更新（如属用户可见变更）
- [ ] **A6 CLAUDE.md sync** — 本 PR 若触及 [Framework §2.7](../docs/rule/[STANDARD]_Documentation_Framework.md#§27-claudemd-sync-allowlist-v16-new) allowlist 任一类（global standards `docs/rule/[STANDARD]_*.md` / runtime info `VERSION` + `marketplace.json` + plugin.json major/minor / directory entries `.claude/skills/mp-*/` + plugin skill 目录 + `docs/` 子目录结构变更）则 root `CLAUDE.md` 已同步更新；不涉及则勾选「N/A — 未触发 allowlist」；如触发但 CLAUDE.md 真无变化面，PR title 加 `[skip a6]` token + reviewer sign-off 「A6 N/A confirmed」

## 审核要点
<!-- 提示 Reviewer 重点关注的内容 -->
