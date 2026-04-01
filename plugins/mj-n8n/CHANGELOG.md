# Changelog — mj-n8n

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Fixed
- 修正 WeChat 通知模板时间字段：从 `toISOString()`（UTC）改为 Luxon `DateTime` 显示北京时间
- 新增 node-patterns.md Section 10「DateTime Formatting Conventions」，明确用户可见时间 vs 内部日志的处理约定
- author SKILL.md Step 3 新增 DateTime 处理规则，Step 4 Log 模板增加时区注释
- naming-reference.md 新增 DateTime 约定指针引用
- promotion-checklist.md DEV 验证清单新增「通知时间戳显示北京时间」检查项
- template SKILL.md Common Pitfalls 新增 Pitfall 8：不要模板化 Luxon 时区字符串

## [1.1.0] - 2026-03-17

### Changed
- Skill 调用快捷方式统一使用 fully-qualified 名称（`mj-n8n:skill-name`）
- 标准化所有 SKILL.md 描述格式

## [1.0.0] - 2026-03-16

### Added
- 初始发布：7 个 Skill
- Skills: plan, author, template, config, doc, render, promote
- MCP 依赖自动注册（n8n-docs）
