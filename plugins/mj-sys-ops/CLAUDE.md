# CLAUDE.md — mj-sys-ops Plugin

## Plugin 概述

mj-sys-ops 是 MJ System 的运维技能家族 Plugin，提供 4 个 skill：

| Skill | 命令 | 职责 |
|-------|------|------|
| **env-setup** | `/mj-sys-ops:mj-sys-ops-env-setup` | 本地开发环境搭建（Docker full-stack + DB 初始化 + n8n 配置） |
| **env-teardown** | `/mj-sys-ops:mj-sys-ops-env-teardown` | 环境停止/清理（3 级清理 + 安全确认） |
| **etl-ods-to-dwd** | `/mj-sys-ops:mj-sys-ops-etl-ods-to-dwd` | 手动触发 QVL ETL（biz_ods → biz_dwd） |
| **etl-dwd-to-dws** | `/mj-sys-ops:mj-sys-ops-etl-dwd-to-dws` | 手动触发 QCM ETL（biz_dwd → biz_dws） |

## MCP 依赖

本 plugin 通过 `.mcp.json` 自动注册以下 MCP server：

**PostgreSQL（5 个）：**
- **postgres-dev**: 本地开发环境（`${MJ_SYS_POSTGRES_DEV_URL}` 或默认 localhost:5432）
- **postgres-test-lan**: 测试环境 LAN（`${MJ_SYS_POSTGRES_TEST_LAN_URL}` 或默认 192.168.0.179:5432）
- **postgres-test-wan**: 测试环境 WAN（需配置 `MJ_SYS_POSTGRES_TEST_WAN_URL`，无 fallback 默认值）
- **postgres-prod-lan**: 生产环境 LAN（`${MJ_SYS_POSTGRES_PROD_LAN_URL}` 或默认 192.168.0.106:5432）
- **postgres-prod-wan**: 生产环境 WAN（需配置 `MJ_SYS_POSTGRES_PROD_WAN_URL`，无 fallback 默认值）

> **时间戳格式修复 (#38)**：所有 PostgreSQL MCP server 通过 `scripts/pg-server-start.cmd` → `pg-server-wrapper.mjs` 启动，覆盖了 `pg.types` 的 timestamp/timestamptz 解析器（OID 1114/1184），确保查询结果中的时间戳返回 PostgreSQL 原始格式（如 `2026-04-01 16:51:19+08`）而非 node-postgres 默认的 UTC ISO 格式（`2026-04-01T08:51:14.755Z`）。

**SSH（ssh-manager，7 台服务器）：**
- **CLOUD**: 云服务器 8.135.38.175（需 `MJ_SYS_SSH_SERVER_CLOUD_PASSWORD`）
- **RUNNER_LAN / RUNNER_WAN**: Runner 服务器 LAN/WAN（需 `MJ_SYS_SSH_SERVER_RUNNER_PASSWORD`）
- **TEST_LAN / TEST_WAN**: 测试服务器 LAN/WAN（需 `MJ_SYS_SSH_SERVER_TEST_PASSWORD`）
- **PROD_LAN / PROD_WAN**: 生产服务器 LAN/WAN（需 `MJ_SYS_SSH_SERVER_PROD_PASSWORD`）

## Secrets Setup

MCP 服务器需要的密码和连接 URL 通过加密文件管理：

- `config/secrets-sys-ops.enc` — AES-256-CBC 加密文件（提交到 Git）
- `config/secrets-sys-ops.example` — 变量模板（提交到 Git）
- `.env` — 解密后生成（.gitignore，供调试查看 + 重载）

**配置命令**：

```powershell
.\scripts\setup-sys-ops-env.ps1           # 首次：解密 → .env → OS 环境变量
.\scripts\setup-sys-ops-env.ps1 -Reload   # 重载：从 .env 加载（不需要密码）
.\scripts\setup-sys-ops-env.ps1 -Force    # 强制覆盖（跳过确认）
```

**管理员更新秘密值**：

```powershell
.\scripts\encrypt-sys-ops-secrets.ps1     # 加密 secrets-sys-ops.conf → secrets-sys-ops.enc
```

## Skill 调用约定

- `env-setup` 完成后可衔接 `etl-ods-to-dwd` → `etl-dwd-to-dws`
- 破坏性操作（env-teardown 的 Level 2/3 清理）需用户二次确认
- ETL skill 用于绕过 pg_cron 等待，直接触发管道

## 文件结构

```
scripts/
├── setup-sys-ops-env.ps1         # 秘密值解密 + 环境变量加载
├── encrypt-sys-ops-secrets.ps1   # 秘密值加密
├── pg-server-start.cmd       # PG MCP server 启动器（发现 npx 缓存 + 设置 NODE_PATH）
└── pg-server-wrapper.mjs     # PG timestamp 修复（覆盖 pg.types 解析器）
skills/
├── mj-sys-ops-env-setup/         # 环境搭建技能 + env-reference.md + troubleshooting.md
├── mj-sys-ops-env-teardown/      # 环境清理技能
├── mj-sys-ops-etl-ods-to-dwd/    # QVL ETL 触发技能
└── mj-sys-ops-etl-dwd-to-dws/    # QCM ETL 触发技能
```
