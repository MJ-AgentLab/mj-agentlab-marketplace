# Changelog

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Fixed
- mj-git-pr 部署策略检测从 2-case 升级为 4-case，区分基线 SQL、Flyway 迁移、双轨同步和纯代码变更，与 CI `detect-strategy` 对齐，避免误推荐 `partial-reset` 导致测试环境数据丢失

## [1.1.1] - 2026-03-18

### Added
- 导入 4 篇项目文档：项目概览、插件开发测试工作流、版本管理指南、发布操作手册
- 新增 `docs/INDEX.md` 文档导航中心（含角色推荐阅读顺序）
- 新增根 `CLAUDE.md`（marketplace 级 Claude Code agent 上下文）
- `README.md` 新增文档索引链接

### Removed
- 删除 `docs/superpowers/` 临时规划文件

### Changed
- `.gitignore` 新增 `.serena/` 规则，优化 `.claude/` 忽略模式
- 提交 `.claude/settings.json` 项目级插件启用配置

## [1.1.0] - 2026-03-17

### Changed
- 所有 26 个 SKILL.md `name` 字段从短名改为全限定名（目录名），支持短前缀调用（如 `/mj-git-commit`）
- 同步更新 4 个 Plugin 的 CLAUDE.md 和 README.md 命令表

## [1.0.0] - 2026-03-16

### Added
- 初始发布：4 个 Plugin（mj-doc, mj-git, mj-n8n, mj-ops），26 个 Skill
- Plugin Marketplace 元数据结构（marketplace.json）
- 各 Plugin 含 CLAUDE.md、README.md、plugin.json、SKILL.md
