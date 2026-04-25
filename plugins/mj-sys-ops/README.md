# mj-sys-ops

MJ System 运维技能家族 — 提供环境搭建/清理和 ETL 触发能力。

## Skills

| Skill | 命令 | 触发场景 |
|-------|------|---------|
| env-setup | `/mj-sys-ops:mj-sys-ops-env-setup` | 本地开发环境搭建 |
| env-teardown | `/mj-sys-ops:mj-sys-ops-env-teardown` | 环境停止/清理 |
| etl-ods-to-dwd | `/mj-sys-ops:mj-sys-ops-etl-ods-to-dwd` | 手动触发 ODS→DWD ETL |
| etl-dwd-to-dws | `/mj-sys-ops:mj-sys-ops-etl-dwd-to-dws` | 手动触发 DWD→DWS ETL |

## 安装

```bash
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install mj-sys-ops@mj-agentlab-marketplace
```

## 前置条件

以下环境变量需通过 setup 脚本配置（见 Post-Install Setup）：

- `MJ_SYS_SSH_SERVER_CLOUD_PASSWORD` / `MJ_SYS_SSH_SERVER_RUNNER_PASSWORD` / `MJ_SYS_SSH_SERVER_TEST_PASSWORD` / `MJ_SYS_SSH_SERVER_PROD_PASSWORD`
- `MJ_SYS_POSTGRES_DEV_URL` / `MJ_SYS_POSTGRES_TEST_LAN_URL` / `MJ_SYS_POSTGRES_TEST_WAN_URL` / `MJ_SYS_POSTGRES_PROD_LAN_URL` / `MJ_SYS_POSTGRES_PROD_WAN_URL`

## Post-Install Setup

秘密值配置（首次使用 + 密码更新时运行）：

```powershell
cd <marketplace>/plugins/mj-sys-ops
.\scripts\setup-sys-ops-env.ps1        # 解密 → .env → 9 个 OS 环境变量
```

终端重启后重载（无需密码）：

```powershell
.\scripts\setup-sys-ops-env.ps1 -Reload
```

详见 `config/secrets-sys-ops.example` 查看变量清单。

## 许可证

MIT
