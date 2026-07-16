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
- [ ] **A6 CLAUDE.md sync** — 本 PR 若触及 [Framework §2.7](../docs/rule/[STANDARD]_Documentation_Framework.md#§27-claudemd-sync-allowlist-v16-new) allowlist 任一类（① global standards `docs/rule/[STANDARD]_*.md` / ② runtime info `VERSION` + `marketplace.json` + plugin.json major/minor / ③ directory entries `.claude/skills/mp-*/` + plugin skill 目录 + `docs/` 子目录结构 / ④ Codex dual-native surfaces `.agents/plugins/marketplace.json` + `.codex-plugin/plugin.json` + `agents/openai.yaml` + learn-kit `.mcp.json` + `nlm-bridge/**` + installer + contract 脚本）则 root `CLAUDE.md` 已同步更新；不涉及则勾选「N/A — 未触发 allowlist」。授权集见 `scripts/check-a6.mjs` `TRIGGERS`（authoritative）。如触发但 CLAUDE.md 真无变化面：PR title 加 `[skip a6]` **且** reviewer 对当前 head commit 提交 `APPROVED` review、body 精确等于 `A6 N/A confirmed`（两者缺一不可 —— `.github/workflows/a6.yml` 会实际校验 sign-off，仅有 token 不放行）

## 审核要点
<!-- 提示 Reviewer 重点关注的内容 -->
