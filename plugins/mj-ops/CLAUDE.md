# CLAUDE.md — mj-ops Plugin

## Plugin 概述

mj-ops 是 MJ System 的运维技能家族 Plugin，提供 4 个 skill：

| Skill | 命令 | 职责 |
|-------|------|------|
| **env-setup** | `/mj-ops:mj-env-setup` | 本地开发环境搭建（Docker full-stack + DB 初始化 + n8n 配置） |
| **env-teardown** | `/mj-ops:mj-env-teardown` | 环境停止/清理（3 级清理 + 安全确认） |
| **etl-ods-to-dwd** | `/mj-ops:mj-etl-ods-to-dwd` | 手动触发 QVL ETL（biz_ods → biz_dwd） |
| **etl-dwd-to-dws** | `/mj-ops:mj-etl-dwd-to-dws` | 手动触发 QCM ETL（biz_dwd → biz_dws） |

## MCP 依赖

本 plugin 通过 `.mcp.json` 自动注册以下 MCP server：

**PostgreSQL（5 个）：**
- **postgres-dev**: 本地开发环境（`${MJ_POSTGRES_DEV_URL}` 或默认 localhost:5432）
- **postgres-test-lan**: 测试环境 LAN（`${MJ_POSTGRES_TEST_LAN_URL}` 或默认 192.168.0.179:5432）
- **postgres-test-wan**: 测试环境 WAN（需配置 `MJ_POSTGRES_TEST_WAN_URL`，无 fallback 默认值）
- **postgres-prod-lan**: 生产环境 LAN（`${MJ_POSTGRES_PROD_LAN_URL}` 或默认 192.168.0.106:5432）
- **postgres-prod-wan**: 生产环境 WAN（需配置 `MJ_POSTGRES_PROD_WAN_URL`，无 fallback 默认值）

**SSH（ssh-manager，7 台服务器）：**
- **CLOUD**: 云服务器 8.135.38.175（需 `SSH_SERVER_CLOUD_PASSWORD`）
- **RUNNER_LAN / RUNNER_WAN**: Runner 服务器 LAN/WAN（需 `SSH_SERVER_RUNNER_PASSWORD`）
- **TEST_LAN / TEST_WAN**: 测试服务器 LAN/WAN（需 `SSH_SERVER_TEST_PASSWORD`）
- **PROD_LAN / PROD_WAN**: 生产服务器 LAN/WAN（需 `SSH_SERVER_PROD_PASSWORD`）

## Skill 调用约定

- `env-setup` 完成后可衔接 `etl-ods-to-dwd` → `etl-dwd-to-dws`
- 破坏性操作（env-teardown 的 Level 2/3 清理）需用户二次确认
- ETL skill 用于绕过 pg_cron 等待，直接触发管道

## 文件结构

```
skills/
├── mj-env-setup/         # 环境搭建技能 + env-reference.md + troubleshooting.md
├── mj-env-teardown/      # 环境清理技能
├── mj-etl-ods-to-dwd/    # QVL ETL 触发技能
└── mj-etl-dwd-to-dws/    # QCM ETL 触发技能
```
