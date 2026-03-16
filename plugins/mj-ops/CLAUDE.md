# CLAUDE.md — mj-ops Plugin

## Plugin 概述

mj-ops 是 MJ System 的运维技能家族 Plugin，提供 4 个 skill：

| Skill | 命令 | 职责 |
|-------|------|------|
| **env-setup** | `/mj-ops:env-setup` | 本地开发环境搭建（Docker full-stack + DB 初始化 + n8n 配置） |
| **env-teardown** | `/mj-ops:env-teardown` | 环境停止/清理（3 级清理 + 安全确认） |
| **etl-ods-to-dwd** | `/mj-ops:etl-ods-to-dwd` | 手动触发 QVL ETL（biz_ods → biz_dwd） |
| **etl-dwd-to-dws** | `/mj-ops:etl-dwd-to-dws` | 手动触发 QCM ETL（biz_dwd → biz_dws） |

## MCP 依赖

本 plugin 通过 `.mcp.json` 自动注册 3 个 MCP server：

- **postgres-dev**: 开发环境 PostgreSQL（`${MJ_POSTGRES_DEV_URL}` 或默认 localhost:5432）
- **postgres-test**: 测试环境 PostgreSQL（`${MJ_POSTGRES_TEST_URL}` 或默认 192.168.0.179:5432）
- **ssh-manager**: 三环境 SSH 管理（需 `SSH_SERVER_*_PASSWORD` 系统环境变量）

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
