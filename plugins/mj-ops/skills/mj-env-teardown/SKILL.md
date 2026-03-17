---
name: mj-env-teardown
description: This skill provides 3-level Docker environment cleanup (soft stop, volume removal, full purge) with safety confirmation for destructive operations. It should be invoked when stopping Docker stack, cleaning up containers, removing volumes, resetting local development environment, freeing Docker resources, or when a developer needs a fresh start after schema changes. Triggers on "停止Docker", "关闭服务", "清理环境", "重置环境", "docker down", "docker cleanup", "teardown", "清除容器", "reset environment", "释放资源", "环境清理", "docker compose down", "docker 占空间", "环境出问题想重来", "释放磁盘".
---

# mj-env-teardown

## Overview

与 `mj-env-setup` 互补对称的环境清除 skill。新人容易搞混 `docker compose down` vs `down -v` vs `down -v --rmi local`，本 skill 提供分级引导和安全确认，避免误删数据。3 级清理选项，从轻量到彻底。

## 前置条件

- Docker Desktop 运行中
- 当前 worktree 目录下有 `docker-compose.yml`

## 快速开始（交互模式）

用户触发此技能时，先判断已有信息是否充足，再决定直接执行还是追问。

### 信息充足性判断

| 用户意图 | 行动 |
|---------|------|
| 说"清理"但未指定级别 | 先执行 Step 1 检查状态，再用 AskUserQuestion 询问级别 |
| 明确说"停止服务" / "暂时不用" | 直接执行 Level 1 |
| 说"重置" / "重来" / "数据不要了" | Level 2 或 3，需 H3 二次确认 |
| 说"Dockerfile 改了要重新构建" | Level 3，需 H3 二次确认 |

---

## Teardown Workflow (3 steps)

### Step 1 — Check Current Status（检查当前状态）

**Why**: 先检查是否有运行中的容器和 volume，避免对空环境执行无意义操作。

```bash
# 查看运行中的容器
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# 查看项目相关的 volumes
docker volume ls --filter name=mj-system
```

- **[H1]** 若无运行容器 + 无 volume → 提示"环境已是干净状态，无需清理"，结束流程。

### Step 2 — Choose Cleanup Level（选择清理级别）

**Why**: 不同场景需要不同清理深度，误选 Level 3 会导致 15 分钟重建成本。

**[H2]** 使用 AskUserQuestion 让用户选择清理级别：

| Level | 名称 | 命令 | 销毁 | 保留 | 恢复成本 |
|-------|------|------|------|------|---------|
| 1 | 停止服务 | `docker compose down` | 容器、网络 | volumes(数据)、镜像 | `docker compose up -d` 秒起 |
| 2 | 清除数据 | `docker compose down -v` | 容器、网络、**volumes(postgres+n8n 数据全丢)** | 镜像 | 需重新 `up --build` + cold start (~10min) |
| 3 | 彻底重置 | `docker compose down -v --rmi local --remove-orphans` | 容器、网络、volumes、**本地构建的镜像** | 无 | 需重新 build + init + cold start (~15min) |

**[H3] Hard Confirm (Level 2/3 only)**: 使用 AskUserQuestion 进行二次确认，明确告知将丢失的数据。

- **Level 2 确认文案**: "将删除 mj-system-postgres-data 和 mj-system-n8n-data volumes，所有数据库数据和 n8n 配置将永久丢失。确认继续？"
- **Level 3 确认文案**: "将删除所有 volumes + 本地构建的镜像。下次启动需要完全重新构建（~15 分钟）。确认继续？"

> Level 1 无需二次确认 -- 容器停止后数据仍安全保留在 volumes 中。

### Step 3 — Execute & Verify（执行并验证）

**Why**: 执行后立即验证，确保清理彻底，避免残留资源导致后续 `mj-env-setup` 冲突。

Execute the chosen command from Step 2, then verify:

```bash
# 所有 Level：确认无运行容器
docker compose ps

# Level 2/3：确认 volumes 已清除
docker volume ls --filter name=mj-system

# Level 3：确认本地构建的镜像已删除
docker images | grep mj-system
```

---

## 人工介入场景（STOP & ASK）

| ID | 类型 | 触发条件 | 行为 |
|----|------|---------|------|
| **H1** | Info | 环境已干净（无容器 + 无 volume） | 提示无需清理，结束流程 |
| **H2** | Choice | Step 2 开始时 | AskUserQuestion 询问用户选择清理级别 1/2/3 |
| **H3** | Hard Confirm | 用户选择 Level 2 或 3 | AskUserQuestion 二次确认，明确告知将丢失的数据 |

> **H3** 是保护性阻断 -- 用户必须明确确认后才执行破坏性操作。H1 是提前退出（无需操作）。

---

## Handoff

根据执行的 Level 输出对应提示：

- **Level 1**: "服务已停止。数据保留在 volumes 中，`docker compose up -d` 可快速恢复。"
- **Level 2**: "服务已停止，数据已清除。重新搭建使用 `mj-env-setup` skill。"
- **Level 3**: "环境已彻底重置。重新搭建使用 `mj-env-setup` skill（需重新构建镜像，预计 ~15 分钟）。"

---

## 示例

### 示例 1：临时释放资源（Level 1）

```bash
# 场景：开发者要跑其他项目，临时释放 Docker 资源

# Step 1: 检查状态
docker compose ps
# NAME                STATUS          PORTS
# mj-system-app       Up 2 hours      0.0.0.0:8000->8000/tcp
# mj-system-postgres  Up 2 hours      0.0.0.0:5432->5432/tcp
# mj-system-n8n       Up 2 hours      0.0.0.0:5678->5678/tcp

# Step 2: 用户选择 Level 1（停止服务）→ 无需二次确认

# Step 3: 执行
docker compose down
# [+] Running 4/4
#  ✔ Container mj-system-app       Removed
#  ✔ Container mj-system-n8n       Removed
#  ✔ Container mj-system-postgres  Removed
#  ✔ Network mj-system_default     Removed

# 验证
docker compose ps     # 无容器 ✓
docker volume ls --filter name=mj-system
# mj-system_postgres-data   ← 数据保留 ✓
# mj-system_n8n-data        ← 数据保留 ✓

# Handoff: 服务已停止。docker compose up -d 可快速恢复。
```

### 示例 2：DB schema 变更后重建（Level 2）

```bash
# 场景：SQL schema 有重大变更，需要从头初始化数据库

# Step 1: 检查状态 → 有容器运行中 + 有 volumes

# Step 2: 用户选择 Level 2（清除数据）
# → H3 触发：二次确认
# "将删除 mj-system-postgres-data 和 mj-system-n8n-data volumes，
#  所有数据库数据和 n8n 配置将永久丢失。确认继续？"
# 用户确认 ✓

# Step 3: 执行
docker compose down -v
# [+] Running 6/6
#  ✔ Container mj-system-app            Removed
#  ✔ Container mj-system-n8n            Removed
#  ✔ Container mj-system-postgres       Removed
#  ✔ Volume mj-system_postgres-data     Removed
#  ✔ Volume mj-system_n8n-data          Removed
#  ✔ Network mj-system_default          Removed

# 验证
docker compose ps                           # 无容器 ✓
docker volume ls --filter name=mj-system    # 无 volume ✓

# Handoff: 服务已停止，数据已清除。重新搭建使用 mj-env-setup skill。
```

### 示例 3：Dockerfile 改了需要彻底重来（Level 3）

```bash
# 场景：修改了 docker/postgres.Dockerfile，旧镜像已过时

# Step 1: 检查状态 → 有容器 + volumes + 本地镜像

# Step 2: 用户选择 Level 3（彻底重置）
# → H3 触发：二次确认
# "将删除所有 volumes + 本地构建的镜像。
#  下次启动需要完全重新构建（~15 分钟）。确认继续？"
# 用户确认 ✓

# Step 3: 执行
docker compose down -v --rmi local --remove-orphans
# [+] Running 8/8
#  ✔ Container mj-system-app            Removed
#  ✔ Container mj-system-n8n            Removed
#  ✔ Container mj-system-postgres       Removed
#  ✔ Volume mj-system_postgres-data     Removed
#  ✔ Volume mj-system_n8n-data          Removed
#  ✔ Image mj-system:2.8.0             Removed
#  ✔ Image mj-system-postgres:latest    Removed
#  ✔ Network mj-system_default          Removed

# 验证
docker compose ps                           # 无容器 ✓
docker volume ls --filter name=mj-system    # 无 volume ✓
docker images | grep mj-system              # 无镜像 ✓

# Handoff: 环境已彻底重置。重新搭建使用 mj-env-setup skill（~15 分钟）。
```
