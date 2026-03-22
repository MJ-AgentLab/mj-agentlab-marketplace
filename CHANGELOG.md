# Changelog

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added
- mj-ops: 加密秘密值管理 — `config/secrets-ops.enc`（9 变量: 4 SSH 密码 + 5 PG URLs）+ `scripts/setup-ops-env.ps1`（支持 `-Reload`、`-Force`）+ `scripts/encrypt-ops-secrets.ps1`
- mj-git: 加密秘密值管理 — `config/secrets-git.enc`（1 变量: GitHub PAT）+ `scripts/setup-git-env.ps1`（支持 `-Reload`、`-Force`）+ `scripts/encrypt-git-secrets.ps1`
- 两个插件 README.md 新增 Post-Install Setup 章节
- 两个插件 CLAUDE.md 新增 Secrets Setup 章节
- marketplace CLAUDE.md 新增 Plugin Secrets Management 章节
- docs/INDEX.md 新增 Plugin References 章节

## [1.1.5] - 2026-03-20

### Changed
- mj-ops: PostgreSQL WAN MCP 条目移除 fallback 硬编码凭据，未配置环境变量时连接失败而非静默使用默认凭据

## [1.1.4] - 2026-03-20

### Fixed
- mj-ops: PostgreSQL WAN 默认端口适配 FRP 实际范式（543202→25432、543203→35432）

## [1.1.3] - 2026-03-20

### Added
- mj-ops: 云服务器 SSH 条目 `SSH_SERVER_CLOUD_*`（8.135.38.175:22）
- mj-ops: 3 组 WAN 穿透 SSH 条目（RUNNER_WAN :2201、TEST_WAN :2202、PROD_WAN :2203）
- mj-ops: PostgreSQL MCP 服务器 postgres-test-wan、postgres-prod-lan、postgres-prod-wan
- mj-ops: env-reference.md 新增 5 个 PostgreSQL MCP URL 覆盖变量文档

### Changed
- **BREAKING** mj-ops: SSH 环境变量 `SSH_SERVER_DEV_*` 重命名为 `SSH_SERVER_RUNNER_LAN_*`
- **BREAKING** mj-ops: PostgreSQL MCP `postgres-test` 重命名为 `postgres-test-lan`
- mj-ops: SSH/PostgreSQL 条目统一 LAN/WAN 对称命名
- mj-ops: 版本 1.1.0 → 1.2.0

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
