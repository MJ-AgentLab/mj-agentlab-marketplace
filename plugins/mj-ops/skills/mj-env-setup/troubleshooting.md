# 常见问题排查

> Phase 5 H4 引导目标。统一格式：症状 → 原因 → 诊断 → 修复。

---

## 1. 容器反复重启

**症状**：`docker ps` 显示容器 STATUS 为 `Restarting` 或 restart count 持续增加。

**原因**：
- OOM（内存不足）：Docker Desktop 默认内存限制过低
- 依赖未就绪：mj-app 启动时 postgres 尚未完成初始化

**诊断**：
```bash
# 查看容器日志
docker logs mj-system-app --tail 50
docker logs mj-system-postgres --tail 50

# 检查 Docker 资源限制
docker info | grep -i memory
```

**修复**：
- OOM → Docker Desktop Settings → Resources → Memory 调至 4 GB+
- 依赖问题 → 通常自动恢复（`docker-compose.yml` 有 `depends_on` + healthcheck），等待 1-2 分钟
- 仍未恢复 → `docker compose down && docker compose up -d --build`

---

## 2. 端口冲突（8000/5432/5678）

**症状**：`docker compose up` 报错 `Bind for 0.0.0.0:XXXX failed: port is already allocated`。

**原因**：端口被其他进程占用。

**诊断**：
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5432
netstat -ano | findstr :5678

# macOS/Linux
lsof -i :8000
lsof -i :5432
lsof -i :5678
```

**修复**：
- 关闭占用端口的进程：`taskkill /PID <PID> /F`（Windows）或 `kill <PID>`（macOS/Linux）
- 或修改 `docker-compose.override.yml` 中的端口映射

---

## 3. Shell 脚本 CRLF 行尾错误

**症状**：容器日志出现 `/bin/bash^M: bad interpreter` 或 `$'\r': command not found`。

**原因**：Windows 环境下 Git 自动将 LF 转为 CRLF，Docker 容器（Linux）无法执行 CRLF 脚本。

**诊断**：
```bash
# 检查文件行尾
file docker/01-init-mj-db.sh
# 应为 "ASCII text"，不应包含 "CRLF"
```

**修复**：
```bash
# 方法 1：设置 Git 不自动转换
git config core.autocrlf input

# 方法 2：转换已有文件
# Windows (Git Bash):
sed -i 's/\r$//' docker/*.sh scripts/*.sh

# 方法 3：重新 clone（设置 .gitattributes 后）
```

---

## 4. 数据库 unhealthy

**症状**：`mj-system-postgres` 容器 STATUS 为 `unhealthy`，mj-app 无法连接数据库。

**原因**：
- init 脚本执行失败（SQL 语法错误或权限问题）
- volume 数据损坏（之前异常关闭导致）

**诊断**：
```bash
# 查看 postgres 日志
docker logs mj-system-postgres --tail 100

# 尝试直接连接
docker exec mj-system-postgres psql -U admin -d mj_system_db -c "SELECT 1;"

# 检查 schema
docker exec mj-system-postgres psql -U admin -d mj_system_db -c "\dn"
```

**修复**：
- init 脚本失败 → 查看日志定位具体 SQL 错误，修复后重建：
  ```bash
  docker compose down -v
  docker compose up -d --build
  ```
- volume 损坏 → Level 2 清理（`docker compose down -v`）后重建

---

## 5. n8n-setup 容器失败

**症状**：`mj-system-n8n-setup` 容器 exit code 非 0，n8n 无 Owner 账号。

**原因**：
- `N8N_OWNER_PASSWORD` 不满足 n8n 要求（8-64 字符，含大写+数字）
- n8n 服务尚未就绪（setup 脚本 retry 超时）

**诊断**：
```bash
# 查看 setup 脚本日志
docker logs mj-system-n8n-setup

# 检查 n8n 是否可访问
curl -s http://localhost:5678/healthz
```

**修复**：
- 密码不合规 → 修改 `.env` 中的 `N8N_OWNER_PASSWORD`，然后：
  ```bash
  docker compose down
  docker compose up -d --build
  ```
- n8n 未就绪 → 手动重新执行 setup：
  ```bash
  docker compose run --rm mj-n8n-setup
  ```

---

## 6. DNS 解析失败（mj-postgres 不可达）

**症状**：mj-app 日志报 `could not translate host name "mj-postgres" to address`。

**原因**：容器不在同一 Docker 网络中，或 Docker 网络异常。

**诊断**：
```bash
# 检查网络
docker network ls | grep mj-system
docker network inspect mj-system_default

# 检查容器是否在同一网络
docker inspect mj-system-app --format '{{json .NetworkSettings.Networks}}'
docker inspect mj-system-postgres --format '{{json .NetworkSettings.Networks}}'
```

**修复**：
```bash
# 重建网络
docker compose down
docker compose up -d --build
```

---

## 7. psycopg2 编译失败

**症状**：`docker compose build` 报 `error: pg_config executable not found` 或 psycopg2 编译错误。

**原因**：Dockerfile 修改后缺少 PostgreSQL 开发库。

**诊断**：
```bash
# 检查 Dockerfile 中是否安装了 libpq-dev
grep -i "libpq\|postgresql-dev" Dockerfile
```

**修复**：确认 `Dockerfile` 中包含：
```dockerfile
RUN apt-get update && apt-get install -y libpq-dev
# 或 Alpine:
RUN apk add --no-cache postgresql-dev
```

---

## 8. Windows 绑定挂载性能慢

**症状**：文件保存后 hot reload 延迟 5-10 秒，磁盘 I/O 高。

**原因**：这是**预期行为**。Windows 上 Docker Desktop 通过 WSL2 后端访问 NTFS 文件系统，绑定挂载（bind mount）性能天然不如 Linux native。

**缓解措施**：
- 将项目放在 WSL2 文件系统中（`\\wsl$\Ubuntu\home\...`）可大幅提升性能
- 或使用 Docker volume 替代 bind mount（需修改 `docker-compose.override.yml`）
- 接受当前延迟作为开发环境的已知限制
