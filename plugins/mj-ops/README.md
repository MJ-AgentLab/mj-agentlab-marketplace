# mj-ops

MJ System 运维技能家族 — 提供环境搭建/清理和 ETL 触发能力。

## Skills

| Skill | 命令 | 触发场景 |
|-------|------|---------|
| env-setup | `/mj-ops:mj-env-setup` | 本地开发环境搭建 |
| env-teardown | `/mj-ops:mj-env-teardown` | 环境停止/清理 |
| etl-ods-to-dwd | `/mj-ops:mj-etl-ods-to-dwd` | 手动触发 ODS→DWD ETL |
| etl-dwd-to-dws | `/mj-ops:mj-etl-dwd-to-dws` | 手动触发 DWD→DWS ETL |

## 安装

```bash
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install mj-ops@mj-agentlab-marketplace
```

## 前置条件

以下环境变量需通过 setup 脚本配置（见 Post-Install Setup）：

- `SSH_SERVER_CLOUD_PASSWORD` / `SSH_SERVER_RUNNER_PASSWORD` / `SSH_SERVER_TEST_PASSWORD` / `SSH_SERVER_PROD_PASSWORD`
- `MJ_POSTGRES_DEV_URL` / `MJ_POSTGRES_TEST_LAN_URL` / `MJ_POSTGRES_TEST_WAN_URL` / `MJ_POSTGRES_PROD_LAN_URL` / `MJ_POSTGRES_PROD_WAN_URL`

## Post-Install Setup

秘密值配置（首次使用 + 密码更新时运行）：

```powershell
cd <marketplace>/plugins/mj-ops
.\scripts\setup-ops-env.ps1        # 解密 → .env → 9 个 OS 环境变量
```

终端重启后重载（无需密码）：

```powershell
.\scripts\setup-ops-env.ps1 -Reload
```

详见 `config/secrets-ops.example` 查看变量清单。

## 许可证

MIT
