# mj-ops

MJ System 运维技能家族 — 提供环境搭建/清理和 ETL 触发能力。

## Skills

| Skill | 命令 | 触发场景 |
|-------|------|---------|
| env-setup | `/mj-ops:env-setup` | 本地开发环境搭建 |
| env-teardown | `/mj-ops:env-teardown` | 环境停止/清理 |
| etl-ods-to-dwd | `/mj-ops:etl-ods-to-dwd` | 手动触发 ODS→DWD ETL |
| etl-dwd-to-dws | `/mj-ops:etl-dwd-to-dws` | 手动触发 DWD→DWS ETL |

## 安装

```bash
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install mj-ops@mj-agentlab-marketplace
```

## 前置条件

- `SSH_SERVER_DEV_PASSWORD` / `SSH_SERVER_TEST_PASSWORD` / `SSH_SERVER_PROD_PASSWORD` 系统环境变量

## 许可证

MIT
