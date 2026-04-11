# Changelog — mj-ops

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.2.5] - 2026-04-11

### Fixed
- `pg-server-start.cmd` npx 缓存下载中断后留下空目录占位，导致 postgres-* MCP server 永久 `failed` 且无法自愈。新增 6 项关键依赖完整性校验（`pg-types`, `postgres-date` 等），检测损坏时自动清理缓存并重新下载 (#46)
- `pg-server-wrapper.mjs` 捕获 `MODULE_NOT_FOUND` 错误时输出明确的缓存损坏诊断信息和修复命令 (#46)

## [1.2.4] - 2026-04-02

### Fixed
- MCP postgres 查询结果中 `timestamp`/`timestamptz` 字段被 node-postgres 转换为 UTC `Z` 格式（如 `2026-04-01T08:51:14.755Z`），现返回 PostgreSQL 原始格式（如 `2026-04-01 16:51:19+08`）(#38)

### Added
- `scripts/pg-server-start.cmd` — PostgreSQL MCP server 启动脚本，自动发现 npx 缓存并设置 `NODE_PATH`
- `scripts/pg-server-wrapper.mjs` — ESM wrapper，通过 `pg.types.setTypeParser` 覆盖 OID 1114/1184 的默认解析器

### Changed
- `.mcp.json` 中 5 个 postgres server 的启动命令从 `npx -y @modelcontextprotocol/server-postgres` 改为 `${CLAUDE_PLUGIN_ROOT}/scripts/pg-server-start.cmd`

## [1.2.3] - 2026-03-24

### Fixed
- `Find-OpenSSL` 改为从 `git.exe` 动态推导 OpenSSL 路径，支持非标准 Git 安装路径

## [1.2.2] - 2026-03-24

### Fixed
- `Find-OpenSSL` 优先使用 Git for Windows 标准 OpenSSL，避免 Anaconda PATH 中的非标准构建导致 `bad decrypt`

## [1.2.1] - 2026-03-23

### Fixed
- `setup-ops-env.ps1` / `encrypt-ops-secrets.ps1` 添加 `-md sha256` 参数，修复 OpenSSL 1.x/3.x 跨版本解密失败

### Changed
- PostgreSQL WAN MCP 条目（postgres-test-wan、postgres-prod-wan）移除 fallback 硬编码凭据，未配置环境变量时连接失败而非静默使用默认凭据
- env-reference.md 中 WAN URL 变量从「可选」调整为「WAN 必填」

## [1.2.0] - 2026-03-20

### Fixed
- PostgreSQL WAN 默认端口适配 FRP 实际范式：543202→25432（test-wan）、543203→35432（prod-wan）

### Changed
- **BREAKING**: SSH 环境变量 `SSH_SERVER_DEV_*` 重命名为 `SSH_SERVER_RUNNER_LAN_*`，消除与 `POSTGRES_DEV_*`（localhost）的语义冲突
- **BREAKING**: PostgreSQL MCP 服务器 `postgres-test` 重命名为 `postgres-test-lan`，环境变量 `MJ_POSTGRES_TEST_URL` → `MJ_POSTGRES_TEST_LAN_URL`
- SSH 服务器 Description 从 "10-Dev-Server" 更新为 "10-Runner-Server-LAN"
- SSH TEST/PROD 条目新增 LAN 后缀（`SSH_SERVER_TEST_*` → `SSH_SERVER_TEST_LAN_*`）

### Added
- 云服务器 SSH 条目 `SSH_SERVER_CLOUD_*`（8.135.38.175:22）
- 3 组 WAN 穿透 SSH 条目：RUNNER_WAN (:2201)、TEST_WAN (:2202)、PROD_WAN (:2203)
- PostgreSQL MCP 服务器：postgres-test-wan、postgres-prod-lan、postgres-prod-wan
- env-reference.md 新增 5 个 PostgreSQL MCP URL 覆盖变量文档

## [1.0.0] - 2026-03-16

### Added
- 初始发布：4 个 Skill
- Skills: env-setup, env-teardown, etl-ods-to-dwd, etl-dwd-to-dws
- MCP 依赖自动注册（postgres-dev, postgres-test, ssh-manager）
