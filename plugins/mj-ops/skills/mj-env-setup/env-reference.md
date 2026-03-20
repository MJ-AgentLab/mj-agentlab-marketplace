# .env 环境变量参考

> Phase 3 参考文档。完整变量清单按功能分组，标注必填性和获取方式。
> 模板文件：项目根目录 `.env.example`

---

## 变量清单

### Docker Compose

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `COMPOSE_PROJECT_NAME` | 必填 | `mj-system` | Docker 项目名，影响容器名前缀 |

### 应用配置

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `MJ_ENV` | 可选 | `development` | 应用环境 (development/test/production) |
| `MJ_DEBUG` | 可选 | `true` | 调试模式 |
| `MJ_DOCS_ENABLED` | 可选 | `true` | 启用 Swagger/ReDoc |
| `MJ_HOST` | 可选 | `0.0.0.0` | 绑定地址 |
| `MJ_PORT` | 可选 | `8000` | 应用端口 |
| `MJ_RELOAD` | 可选 | `true` | 热重载 |
| `MJ_LOG_LEVEL` | 可选 | `debug` | 日志级别 |

### Config Profile

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `MJ_CONFIG_PROFILE` | 必填 | `dev` | 数据库环境 (dev/test/prod)，控制 `POSTGRES_{PROFILE}_HOST` 解析 |

### 数据库 — PostgreSQL

| 变量 | 必填 | 获取方式 | 说明 |
|------|------|---------|------|
| `POSTGRES_USER` | 必填 | Runner 同步的 .env | 所有环境共用的 DB 用户名 |
| `POSTGRES_PASSWORD` | 必填 | Runner 同步的 .env | 所有环境共用的 DB 密码 |
| `POSTGRES_DEV_HOST` | 必填 | 默认 `localhost` | 本地开发连接地址。Docker 内通过 `docker-compose.override.yml` 自动覆盖为 `mj-postgres` |
| `POSTGRES_DEV_PORT` | 必填 | 默认 `5432` | 本地开发端口 |
| `POSTGRES_TEST_HOST` | 按需 | 向团队获取 | 测试环境地址 |
| `POSTGRES_TEST_PORT` | 按需 | 默认 `5432` | 测试环境端口 |
| `POSTGRES_PROD_HOST` | 按需 | 向团队获取 | 生产环境地址 |
| `POSTGRES_PROD_PORT` | 按需 | 默认 `5432` | 生产环境端口 |

### 数据库 — MySQL

| 变量 | 必填 | 获取方式 | 说明 |
|------|------|---------|------|
| `MYSQL_USER` | 按需 | Runner 同步的 .env | MySQL 用户名 |
| `MYSQL_PASSWORD` | 按需 | Runner 同步的 .env | MySQL 密码 |
| `MYSQL_DEV_HOST` | 按需 | 默认 `localhost` | 本地开发 MySQL 地址 |
| `MYSQL_DEV_PORT` | 按需 | 默认 `3306` | 本地开发 MySQL 端口 |
| `MYSQL_TEST_HOST` | 按需 | 向团队获取 | 测试环境 MySQL 地址 |
| `MYSQL_TEST_PORT` | 按需 | 默认 `3306` | 测试环境 MySQL 端口 |
| `MYSQL_PROD_HOST` | 按需 | 向团队获取 | 生产环境 MySQL 地址 |
| `MYSQL_PROD_PORT` | 按需 | 默认 `3306` | 生产环境 MySQL 端口 |

### 邮件服务

| 变量 | 必填 | 获取方式 | 说明 |
|------|------|---------|------|
| `IMAP_SERVER` | 按需 | Runner 同步的 .env | IMAP 服务器地址 |
| `IMAP_PORT` | 按需 | `993` | IMAP 端口（SSL） |
| `SMTP_SERVER` | 按需 | Runner 同步的 .env | SMTP 服务器地址 |
| `SMTP_PORT` | 按需 | `465` | SMTP 端口（SSL） |
| `EMAIL_USERNAME` | 按需 | Runner 同步的 .env | 邮箱账号 |
| `EMAIL_PASSWORD` | 按需 | Runner 同步的 .env | 邮箱密码 |

### 压缩包解密

| 变量 | 必填 | 获取方式 | 说明 |
|------|------|---------|------|
| `AUTO_EMAIL_ZIP_PRIMARY_PASSWORD` | 按需 | Runner 同步的 .env | 主解压密码 |
| `AUTO_EMAIL_ZIP_BACKUP_PASSWORD` | 按需 | Runner 同步的 .env | 备用解压密码 |

### n8n 工作流

| 变量 | 必填 | 获取方式 | 格式要求 |
|------|------|---------|---------|
| `N8N_OWNER_EMAIL` | 必填 | 自定义 | 合法邮箱格式，默认 `admin@mj-system.local` |
| `N8N_OWNER_FIRST_NAME` | 必填 | 自定义 | 显示名（名），默认 `Admin` |
| `N8N_OWNER_LAST_NAME` | 必填 | 自定义 | 显示名（姓），默认 `MJ` |
| `N8N_OWNER_PASSWORD` | 必填 | 自定义 | **8-64 字符，必须包含大写字母 + 数字**。不合规会导致 n8n-setup 容器注册失败 |

### MCP 服务器

| 变量 | 必填 | 获取方式 | 说明 |
|------|------|---------|------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | 可选 | GitHub PAT | Claude Code MCP GitHub 服务器 |
| `SSH_SERVER_CLOUD_PASSWORD` | 可选 | 向团队获取 | SSH MCP 云服务器密码 |
| `SSH_SERVER_RUNNER_PASSWORD` | 可选 | 向团队获取 | SSH MCP Runner 服务器密码（LAN + WAN 共用） |
| `SSH_SERVER_TEST_PASSWORD` | 可选 | 向团队获取 | SSH MCP 测试服务器密码（LAN + WAN 共用） |
| `SSH_SERVER_PROD_PASSWORD` | 可选 | 向团队获取 | SSH MCP 生产服务器密码（LAN + WAN 共用） |
| `MJ_POSTGRES_DEV_URL` | 可选 | 默认 localhost:5432 | 覆盖本地开发 PostgreSQL MCP 连接串 |
| `MJ_POSTGRES_TEST_LAN_URL` | 可选 | 默认 192.168.0.179:5432 | 覆盖测试环境 LAN PostgreSQL MCP 连接串 |
| `MJ_POSTGRES_TEST_WAN_URL` | 可选 | 默认 8.135.38.175:543202 | 覆盖测试环境 WAN PostgreSQL MCP 连接串 |
| `MJ_POSTGRES_PROD_LAN_URL` | 可选 | 默认 192.168.0.106:5432 | 覆盖生产环境 LAN PostgreSQL MCP 连接串 |
| `MJ_POSTGRES_PROD_WAN_URL` | 可选 | 默认 8.135.38.175:543203 | 覆盖生产环境 WAN PostgreSQL MCP 连接串 |

---

## 常见问题

**Q: 为什么不直接手动创建 .env？**
A: Runner 同步的 `.env` 包含团队共享的凭据（数据库密码、邮件配置、解压密码），手动填写容易遗漏或出错。

**Q: Docker 内的 POSTGRES_DEV_HOST 为什么是 mj-postgres？**
A: `docker-compose.override.yml` 中设置了 `POSTGRES_DEV_HOST: mj-postgres`，覆盖 `.env` 中的 `localhost`。Docker 容器间通过 service name 互访，`mj-postgres` 是 PostgreSQL 容器的 service name。

**Q: N8N_OWNER_PASSWORD 不合规会怎样？**
A: `mj-n8n-setup` 容器（`docker/03-setup-n8n-owner.sh`）会注册失败，n8n 无法自动配置 Owner 账号和凭据。需手动通过 n8n Web UI 注册。
