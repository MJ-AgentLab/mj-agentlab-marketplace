---
name: Feature PR
about: 新功能、新 Skill、重构等功能开发 (feature/*) 的 Pull Request
---

## 变更摘要
<!-- 简述本次变更的内容和目的 -->

## 影响范围
<!-- 列出受影响的 Plugin / Skill -->

## 审核要点
<!-- 提示审核者重点关注的内容 -->

## 自检结果
- [ ] plugin.json 字段完整（如涉及新增/变更 Plugin）
- [ ] SKILL.md frontmatter 有效（如涉及新增/变更 Skill）
- [ ] 无硬编码（IP、密码、路径、Token）
- [ ] 无残留调试代码
- [ ] Commit message 符合 `<type>(<scope>): <summary>` 规范（允许类型：`feat` / `refactor` / `test` / `docs`）
- [ ] CHANGELOG.md `[Unreleased]` 区块已更新
