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

## 原意与工程覆盖
<!-- 按 INTENT 规范链接唯一独立INTENT或Issue原意区、完整接受基线及决定正本；逐项列本PR范围、验收、实际证据/差距，区分交付/依赖支撑/背景参考。实质变化保留旧接受，工程完成不自动等于原意达成或Owner接受。 -->

## 自检结果
- [ ] plugin.json 字段完整（如涉及新增/变更 Plugin）—— 参 [`[SPEC]_Plugin_Json_Schema.md`](../../docs/spec/[SPEC]_Plugin_Json_Schema.md)
- [ ] SKILL.md 的 portable YAML frontmatter 与原生调用策略有效（遵循自身格式，不应用普通文档九字段）
- [ ] 文档合规（如涉及 `docs/**/*.md` 或 `plans/<task>/*.md`）—— 参 [`[STANDARD]_Documentation_Framework.md`](../../docs/rule/[STANDARD]_Documentation_Framework.md)
- [ ] 无硬编码（IP、密码、路径、Token）
- [ ] 无残留调试代码
- [ ] Commit message 符合 [`[STANDARD]_Commit_Message_Convention.md`](../../docs/rule/[STANDARD]_Commit_Message_Convention.md)（feature/* 分支允许类型：`feat` / `perf` / `refactor` / `test` / `docs` / `infra`）
- [ ] CHANGELOG.md `[Unreleased]` 区块已更新

## Related STANDARDs
- [INTENT](../../docs/rule/[STANDARD]_AI_Engineering_Intent.md) — 唯一原意、完整接受与工程覆盖
- [Documentation Framework](../../docs/rule/[STANDARD]_Documentation_Framework.md) — 文档规范元框架
- [Commit Message Convention](../../docs/rule/[STANDARD]_Commit_Message_Convention.md) — commit 格式
- [GitHub Markdown](../../docs/rule/[STANDARD]_GitHub_Markdown.md) — markdown 风格
- [AI Engineering HITL Prompt](../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) — 工作流 + skill 矩阵
