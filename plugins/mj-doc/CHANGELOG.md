# Changelog — mj-doc

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.2.0] - 2026-03-27

### Added
- 支持 Framework v4.5 新增的 `[ISSUE]` 和 `[ASSESSMENT]` 文档类型
- validation-rules.md: 新增 ISSUE/ASSESSMENT 的 A1 frontmatter 字段、A2 文件名正则、A3 行数范围、A4 时态规则、SA1/SA2 内容边界
- validate_doc.py: 新增 ISSUE_EXTRA_FIELDS / ASSESSMENT_EXTRA_FIELDS 常量及对应校验逻辑
- type-decision-reference.md: 新增决策树分支、5 组混淆对、内容边界表
- template-patterns.md: 新增 TEMPLATE_ISSUE / TEMPLATE_ASSESSMENT 模板条目及 8 个域缩写
- question-patterns.md: 新增 Q-10（ISSUE vs POSTMORTEM 歧义）和 Q-11（ISSUE 深度判断）
- plan-checklist.md: 新增 ISSUE/ASSESSMENT 缺口分析条目和 §11 扩展触发条件
- quality-gate.md: 更新状态转换矩阵（新增 已修复 状态），新增不可变/追加式文档说明
- migration-rules.md: 新增问题分析/优化报告内容的迁移映射
- code-doc-mapping.md: 新增 ISSUE/ASSESSMENT 权威来源说明
- author SKILL.md: 新增 ISSUE/ASSESSMENT 目录归属和编号规则

### Changed
- 全部 SKILL.md: Framework v4 引用更新为 Framework v4.5
- author SKILL.md 描述: 文档类型列表从 6 种扩展为 8 种

## [1.1.0] - 2026-03-17

### Changed
- Skill 调用快捷方式统一使用 fully-qualified 名称（`mj-doc:skill-name`）
- 标准化所有 SKILL.md 描述格式

## [1.0.0] - 2026-03-16

### Added
- 初始发布：6 个 Skill + 1 个共享资源（mj-doc-shared）
- Skills: plan, author, validate, review, sync, migrate
- 共享资源: question-patterns（Q-01 ~ Q-09, D-01 ~ D-04）
