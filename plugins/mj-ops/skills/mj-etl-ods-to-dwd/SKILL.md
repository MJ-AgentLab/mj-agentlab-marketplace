---
name: etl-ods-to-dwd
description: Use when manually triggering QVL ETL pipeline from biz_ods to biz_dwd,
  bypassing pg_cron wait. Use this skill whenever the developer has inserted ODS data
  and wants to see DWD results immediately without waiting for the 1-minute cron poll
  and quiet window. Also use when DWD tables appear empty after cold start or data
  loading. Triggers on 触发ETL, ODS到DWD, 手动ETL, QVL ETL, run etl,
  trigger ods to dwd, 数据没出来, DWD没更新, 跑一下ETL, DWD表是空的,
  插了数据但没反应, cold start 后没数据.
---

# mj-etl-ods-to-dwd

## Overview

手动触发 QVL ETL，跳过 pg_cron 轮询等待。

WHY this skill exists: 正常流程中，pg_cron 每 1 分钟轮询 `biz_ods.check_qvl_ready()` 并带有静默窗口（默认 1 分钟），意味着插入 ODS 数据后最慢需等 2 分钟才能看到 DWD 结果。开发过程中频繁修改数据时，这个等待严重拖慢节奏。手动触发用 `p_quiet_minutes=0` 跳过静默窗口，立即执行 ETL。

```
Normal flow:  ODS loaded → pg_cron 每 1 分钟检查 → 静默窗口(1min) → ETL → DWD ready
Manual flow:  直接调用 run_qvl_etl_if_ready(0) → 跳过静默窗口 → 立即执行
```

## 前置条件

- PostgreSQL 可连接（Docker 运行中或直连）
- `biz_ods` 中有 `status = 'loaded'` 的 ready signal（否则无数据可处理）

## 快速开始

用户触发时先判断信息充分度，再决定执行路径：

| 已知信息 | 行动 |
|---------|------|
| 用户说"跑ETL"或"触发ETL" | 直接执行 Step 1 检查 → Step 2 标准触发 |
| 用户说"DWD 没数据"或"DWD表是空的" | 先 Step 1 检查 signal，若无 signal 则提示先加载 ODS |
| 用户说"强制跑"或"跳过检查" | 直接使用 Step 2 强制执行方式 |

---

## 执行方式说明

**重要**：ETL 函数包含写操作（TRUNCATE + INSERT），`mcp__postgres-dev__query` 为 **read-only** 连接，写操作会被静默回滚（返回 `rows_inserted=0` 且无报错）。

| 操作类型 | 使用工具 |
|---------|---------|
| 信号检查、结果验证（只读） | `mcp__postgres-dev__query` |
| ETL 执行（写入） | `docker exec mj-system-postgres psql -U admin -d mj_system_db -c "SQL"` |

---

## Workflow — 3 步

### Step 1 — Check Signal Status（检查信号状态）

WHY: 确认有待处理的 ODS 数据，避免空跑 ETL。

使用 `mcp__postgres-dev__query` 执行（只读，可用）：

```sql
SELECT * FROM biz_ods.check_qvl_ready(0);
```

返回字段：`ready`, `pending_count`, `last_signal_at`, `minutes_since`

- **[H1] Conditional**: 若 `ready = FALSE` 且 `pending_count = 0`，需区分两种情况：

  **情况 1 — ODS 表为空**：提示运行 `uv run python scripts/biz_ods_cold_start.py` 加载数据。

  **情况 2 — ODS 有数据但无 signal**（cold start 后的典型状态）：`biz_ods_cold_start.py` 直接 INSERT 不走信号通道，signal 表为空。此时应跳过标准触发，**直接使用 Step 2 的强制执行方式**。

  判断方法（使用 `mcp__postgres-dev__query`）：
  ```sql
  SELECT COUNT(*) FROM biz_ods.ods_query_volume_daily;
  ```
  若 count > 0 但 signal 为空 → 情况 2（使用强制执行）。

- 若 `ready = TRUE` 或 `pending_count > 0` → 继续 Step 2 标准触发。

### Step 2 — Execute ETL（执行 ETL）

**必须使用 docker exec 执行**（MCP 为只读连接，ETL 写操作会被静默回滚）。

两种方式，根据 Step 1 结果选择：

| 方式 | 命令 | 适用场景 |
|------|------|---------|
| 标准触发（推荐） | `docker exec mj-system-postgres psql -U admin -d mj_system_db -c "SELECT * FROM biz_dwd.run_qvl_etl_if_ready(0);"` | signal 正常（`ready=TRUE`） |
| 强制执行 | `docker exec mj-system-postgres psql -U admin -d mj_system_db -c "SELECT * FROM biz_dwd.etl_qvl_downstream_query();"` | cold start 后无 signal、调试场景 |

**标准触发返回字段**：`was_ready`, `rows_inserted`, `signals_marked`, `dwd_signal_emitted`, `duration_ms`

WHY 推荐标准触发: 标准触发会完成完整的 signal 生命周期管理——将 ODS signal 标记为 `aggregated`，并向 DWD 发出 ready signal。强制执行跳过这些步骤，但函数内部仍会发出 DWD ready signal，下游 QCM ETL 可正常消费。

### Step 3 — Verify Results（验证结果）

WHY: 确认 ETL 成功完成，DWD 数据已写入，下游 signal 已发出。

使用 `mcp__postgres-dev__query` 依次执行以下查询（只读，可用）：

```sql
-- 1. 检查 DWD 表行数（确认数据已写入）
SELECT COUNT(*) FROM biz_dwd.dwd_qvl_downstream_query;
```

```sql
-- 2. 检查 DWD ready signal 已发出（下游 QCM ETL 依赖此 signal）
SELECT * FROM biz_dwd.dwd_qvl_ready_signal ORDER BY signaled_at DESC LIMIT 3;
```

```sql
-- 3. 检查 ODS signal 已标记为 aggregated（确认 signal 生命周期完成）
SELECT status, COUNT(*) FROM biz_ods.ods_qvl_ready_signal GROUP BY status;
```

验证要点：
- DWD 行数应 > 0
- DWD ready signal 的 `signaled_at` 应为刚才的时间
- ODS signal 中应有 `aggregated` 状态的记录（若使用标准触发）

---

## 人工介入场景（STOP & ASK）

| ID | 类型 | 触发条件 | 行为 |
|----|------|---------|------|
| **H1** | Conditional | 无 loaded signal（`pending_count = 0`） | 检查 ODS 表是否有数据：有数据但无 signal → 强制执行；无数据 → 提示运行 `uv run python scripts/biz_ods_cold_start.py` |

---

## Handoff

成功后输出以下信息：

```
ETL 执行完成 ✓
  rows_inserted: {rows_inserted}
  duration_ms: {duration_ms}

DWD 数据已就绪。如需继续触发 DWS 指标计算，使用 mj-etl-dwd-to-dws skill。
```

---

## 示例

### 示例 1：开发者插入 ODS 数据后手动触发

```
用户：跑一下 ETL

# Step 1: 检查 signal
SELECT * FROM biz_ods.check_qvl_ready(0);
# → ready=TRUE, pending_count=3

# Step 2: 标准触发
SELECT * FROM biz_dwd.run_qvl_etl_if_ready(0);
# → was_ready=TRUE, rows_inserted=1247, signals_marked=3, dwd_signal_emitted=TRUE, duration_ms=832

# Step 3: 验证
SELECT COUNT(*) FROM biz_dwd.dwd_qvl_downstream_query;
# → 1247

# Handoff: 显示结果 + 提示 mj-etl-dwd-to-dws
```

### 示例 2：Cold start 后 DWD 表为空（无 signal 场景）

```
用户：DWD 表是空的，cold start 后没数据

# Step 1: 检查 signal
SELECT * FROM biz_ods.check_qvl_ready(0);
# → ready=FALSE, pending_count=0
# → H1 触发：检查 ODS 是否有数据
SELECT COUNT(*) FROM biz_ods.ods_query_volume_daily;
# → count=187097（有数据但无 signal — cold start 直接 INSERT 不走信号通道）

# Step 2: 强制执行（cold start 后无 signal，跳过标准触发）
docker exec mj-system-postgres psql -U admin -d mj_system_db -c \
  "SELECT * FROM biz_dwd.etl_qvl_downstream_query();"
# → rows_inserted=183370, duration_ms=1432

# Step 3: 验证 → DWD 行数 183370，DWD ready signal 已发出
# Handoff: 显示结果 + 提示 mj-etl-dwd-to-dws
```
