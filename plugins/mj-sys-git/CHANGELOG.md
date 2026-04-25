# Changelog — mj-git

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [2.0.0] - 2026-04-25

### Breaking Changes
- **Plugin renamed**: `mj-git` → `mj-sys-git`
- **All skills renamed**: `mj-git-*` → `mj-sys-git-*`（9 个 skill）
- **Secrets setup script renamed**: `setup-git-env.ps1` → `setup-sys-git-env.ps1`
- **Encrypted file renamed**: `secrets-git.enc` → `secrets-sys-git.enc`（已重加密）
- `GITHUB_PERSONAL_ACCESS_TOKEN` 变量名**保持原样**（GitHub MCP 标准）

### Fixed
- SKILL.md 中 Windows 绝对路径示例改为 `<workspace>` 占位符，提升跨平台可读性

## [1.1.3] - 2026-03-24

### Fixed
- `Find-OpenSSL` 改为从 `git.exe` 动态推导 OpenSSL 路径，支持非标准 Git 安装路径

## [1.1.2] - 2026-03-24

### Fixed
- `Find-OpenSSL` 优先使用 Git for Windows 标准 OpenSSL，避免 Anaconda PATH 中的非标准构建导致 `bad decrypt`

## [1.1.1] - 2026-03-23

### Fixed
- `setup-git-env.ps1` / `encrypt-git-secrets.ps1` 添加 `-md sha256` 参数，修复 OpenSSL 1.x/3.x 跨版本解密失败

## [1.1.0] - 2026-03-17

### Changed
- Skill 调用快捷方式统一使用 fully-qualified 名称（`mj-git:skill-name`）
- 标准化所有 SKILL.md 描述格式

## [1.0.0] - 2026-03-16

### Added
- 初始发布：9 个 Skill
- Skills: branch, check-merge, commit, delete, issue, pr, push, review-pr, sync
- MCP 依赖自动注册（github, serena）
