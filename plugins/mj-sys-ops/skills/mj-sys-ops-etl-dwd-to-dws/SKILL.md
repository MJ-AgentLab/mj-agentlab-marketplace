---
name: mj-sys-ops-etl-dwd-to-dws
description: This skill manually triggers the QCM ETL 5-Phase parallel pipeline from biz_dwd to biz_dws, bypassing the pg_cron 5-minute polling wait. It should be invoked whenever DWS metrics need immediate update after DWD data is ready, when DWS tables appear empty, or when metrics have not refreshed after DWD data loading. The pipeline executes preprocess via dblink independent transaction, then 5 phases with up to 13 functions running in parallel (max 7 concurrent). Triggers on "触发QCM", "DWD到DWS", "手动指标计算", "QCM ETL", "trigger dws", "指标没更新", "DWS没数据", "跑指标", "run qcm", "计算指标", "等了好久还没算完", "DWS是空的".
---

# mj-sys-ops-etl-dwd-to-dws

## Overview

手动触发 QCM ETL 5-Phase 并行管线，跳过 pg_cron 5 分钟轮询。

WHY this skill exists: QCM cron 每 5 分钟轮询一次，加上 5 分钟静默窗口，最慢需等 10 分钟才能看到 DWS 指标结果。手动触发用 `p_quiet_minutes=0` 立即执行，完整管线处理 65 张 DWS 表，耗时约 30-60 秒。

Normal flow: DWD ready signal → pg_cron 每 5 分钟检查 → 5 分钟静默窗口 → preprocess → 5 Phase x 13 函数 dblink 并行（max 7 concurrent） → DWS ready

Manual flow: `run_qcm_etl_if_ready(0)` → 跳过静默 → 立即执行

Architecture: 5 Phases (monthly → daily → weekly → quarterly → yearly), each phase runs multiple metric functions in parallel via dblink async, with max 7 concurrent connections. Phases execute serially. If parallel fails, falls back to `_serial_etl_executor()`.

## 前置条件

- PostgreSQL 可连接（Docker 运行中或直连）
- biz_dwd 中有 `status = 'ready'` 的 DWD ready signal
- 维度表已加载（`biz_dwd.dwd_dim_product_interface` + `biz_dwd.dwd_dim_institution`）

## 快速开始

| 已知信息 | 行动 |
|---------|------|
| 用户说"跑指标" | 直接 Step 1 检查 → Step 2 执行 |
| 用户说"DWS 没数据" | Step 1 检查 signal，可能需先触发 ODS→DWD |
| 完整链路 | 先使用 `mj-sys-ops-etl-ods-to-dwd`，再回到本 skill |

## 执行方式说明

**重要**：ETL 函数包含写操作（TRUNCATE + INSERT），`mcp__postgres-dev__query` 为 **read-only** 连接，写操作会被静默回滚。

| 操作类型 | 使用工具 |
|---------|---------|
| 信号检查、结果验证（只读） | `mcp__postgres-dev__query` |
| ETL 执行（写入） | `docker exec mj-system-postgres psql -U admin -d mj_system_db -c "SQL"` |

---

## Workflow — 3 步

### Step 1 — Check DWD Signal Status（检查 DWD 信号状态）

WHY: QCM ETL 依赖 DWD ready signal。如果没有 signal，执行 ETL 会空跑。

使用 `mcp__postgres-dev__query`（只读，可用）：

```sql
SELECT * FROM biz_dws.check_qcm_ready();
```

Returns: `ready`, `pending_count`, `last_signal_at`, `last_rows`

- **[H1] Conditional**: `ready = FALSE` → 无 DWD ready signal，提示先触发 ODS→DWD（引导到 `mj-sys-ops-etl-ods-to-dwd`）
- `ready = TRUE` → 继续 Step 2

### Step 2 — Execute QCM ETL（执行 QCM ETL）

WHY: `p_quiet_minutes=0` 跳过静默窗口，立即开始 5-Phase 并行计算。

**必须使用 docker exec 执行**（MCP 为只读连接，ETL 写操作会被静默回滚）：

```bash
docker exec mj-system-postgres psql -U admin -d mj_system_db -c \
  "SELECT * FROM biz_dws.run_qcm_etl_if_ready(0);"
```

Returns: `was_ready`, `rows_preprocessed`, `tables_processed`, `signals_consumed`, `dws_signal_emitted`, `duration_ms`

WHY check `tables_processed`: 完整管线应处理 65 张 DWS 表。如果 < 65 说明部分表执行失败。

- **[H2] Warning**: `tables_processed < 65` → 部分表执行失败，需检查 metrics 日志（见 Step 3 第一条查询）

### Step 3 — Verify Results（验证结果）

WHY: 确认所有 Phase 执行成功、DWS signal 已发出、DWD signal 已消费。

使用 `mcp__postgres-dev__query`（只读，可用）：

```sql
-- 检查最近一批 ETL 执行详情（每个函数的耗时和状态）
SELECT phase, table_name, rows_inserted, duration_ms, status, error_message
FROM biz_dws.dws_qcm_etl_metrics
WHERE etl_batch_at = (SELECT MAX(etl_batch_at) FROM biz_dws.dws_qcm_etl_metrics)
ORDER BY id;
```

```sql
-- 检查 DWS ready signal
SELECT * FROM biz_dws.dws_qcm_ready_signal ORDER BY signaled_at DESC LIMIT 3;
```

```sql
-- 检查 DWD signal 已消费
SELECT status, COUNT(*) FROM biz_dwd.dwd_qvl_ready_signal GROUP BY status;
```

展示每个 Phase 的执行结果和耗时。

---

## 人工介入场景（STOP & ASK）

| ID | 类型 | 触发条件 | 行为 |
|----|------|---------|------|
| **H1** | Conditional | `check_qcm_ready()` 返回 `ready = FALSE` | 告知无 DWD ready signal，引导到 `mj-sys-ops-etl-ods-to-dwd` 先触发上游 |
| **H2** | Warning | `tables_processed < 65` | 展示失败表详情（从 `dws_qcm_etl_metrics` 查 `status != 'success'`），提示检查 error_message |

> **H1** 不阻断但改变流程方向。**H2** 展示诊断信息后由用户决定是否重试。

---

## Handoff

成功后输出摘要：

```
QCM ETL 完成
  tables_processed: 65/65
  rows_preprocessed: <N>
  duration_ms: <N>ms

Phase 执行摘要：
  Phase 1 (monthly):    <N> tables, <N>ms
  Phase 2 (daily):      <N> tables, <N>ms
  Phase 3 (weekly):     <N> tables, <N>ms
  Phase 4 (quarterly):  <N> tables, <N>ms
  Phase 5 (yearly):     <N> tables, <N>ms

DWS ready signal 已发出，DWD signal 已消费。
```

---

## 示例

### 示例 1：完整链路 ODS→DWD→DWS 手动触发

```
用户：跑一下完整链路，从 ODS 到 DWS

# 1. 先调用 mj-sys-ops-etl-ods-to-dwd 完成 ODS→DWD
#    （该 skill 结束后 DWD ready signal 已写入）

# 2. 回到本 skill
# Step 1: check_qcm_ready() → ready = TRUE
# Step 2: run_qcm_etl_if_ready(0) → tables_processed = 65
# Step 3: 验证 etl_metrics 全部 success
```

### 示例 2：DWD 已就绪，仅触发 DWS 计算

```
用户：DWD 数据已经好了，帮我跑指标

# Step 1: check_qcm_ready() → ready = TRUE, pending_count = 3
# Step 2: run_qcm_etl_if_ready(0)
#   → was_ready = TRUE, tables_processed = 65, duration_ms = 42000
# Step 3: 验证全部 success，展示摘要
```

### 示例 3：部分表失败后排查和重试

```
用户：跑指标

# Step 1: ready = TRUE
# Step 2: run_qcm_etl_if_ready(0)
#   → tables_processed = 62 (< 65) → H2 触发
# Step 3: 查询 etl_metrics WHERE status != 'success'
#   → 发现 3 张表 error_message: "relation does not exist"
# 告知用户：3 张表失败，原因是关系不存在，可能需要检查 DWS 建表脚本
# 用户修复后可再次执行 Step 2 重试
```
