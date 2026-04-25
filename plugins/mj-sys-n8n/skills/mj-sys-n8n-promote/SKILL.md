---
name: mj-sys-n8n-promote
description: This skill guides the final stage of the n8n workflow lifecycle — environment promotion through three phases (DEV testing, TEST promotion, PRODUCTION deployment), each with prerequisite checks, execution steps, and post-deployment verification. It should be invoked when promoting workflows between environments or executing rollback in MJ System. Triggers on "n8n晋升", "workflow部署", "环境迁移", "promote workflow", "n8n测试验证", "DEV测试", "TEST晋升", "PROD部署", "工作流上线", "n8n rollback", "回滚工作流", "n8n环境晋级", "部署验证".
---

# MJ N8N Workflow Promote

## Overview

本技能是 n8n 工作流生命周期的最后一环。它引导环境晋升流程的三个阶段：DEV 测试 → TEST 晋升 → PRODUCTION 部署。每个阶段包含前置检查、执行步骤和部署后验证。

工作流生命周期：`/mj-sys-n8n-plan` → `/mj-sys-n8n-author` (或 `/mj-sys-n8n-template`) → `/mj-sys-n8n-config` → `/mj-sys-n8n-doc` → `/mj-sys-n8n-render` → **`/mj-sys-n8n-promote`**

## Prerequisites

在开始晋升流程前，请确认：

1. **渲染文件已就绪**：目标环境目录下存在已渲染的 JSON 文件（`n8n/workflows/{dev,test,production}/`）
2. **渲染验证已通过**：使用 `/mj-sys-n8n-render` 完成渲染和验证（占位符无残留、JSON 合法）
3. **配置文件正确**：`_config/{env}.yaml` 中的 trigger 配置已确认

若渲染未完成，请先使用 `/mj-sys-n8n-render` 完成渲染流程。

## Stage Detection（阶段识别）

首先确定当前晋升阶段，询问用户：

| 阶段 | 说明 | 入口条件 |
|------|------|----------|
| **DEV 环境测试** | 新工作流首次在 DEV 中测试 | 渲染文件就绪 |
| **TEST 环境晋升** | 将已验证的工作流晋升到 TEST | DEV 测试全部通过 |
| **PROD 生产部署** | 从 TEST 晋升到 PRODUCTION | TEST 验证全部通过 |

---

## Stage 1 — DEV 环境测试

### 1.1 启动 DEV 环境

```bash
docker compose up -d
```

访问 n8n UI：`http://localhost:5678`

### 1.2 验证清单

逐项检查以下内容：

- [ ] 工作流出现在 n8n UI 中（名称正确，DEV- 前缀）
- [ ] 凭据已绑定（Postgres-MJ-DataWarehouse 显示为已连接）
- [ ] API 连通性（手动执行 HTTP Request 节点，返回 200）
- [ ] 手动完整执行（Trigger → 全流程无报错）
- [ ] 输出格式正确（通知消息内容、日志格式）
- [ ] 错误分支验证（模拟异常输入，IF FALSE 分支正常处理）
- [ ] 环境变量正确（日志中显示 `environment: "dev"`）
- [ ] 标签正确（`env:dev`, `trigger:*`, `domain:*`）

### 1.3 触发方式测试指引

根据工作流触发类型选择对应测试方式：

| 触发类型 | 测试方式 |
|----------|----------|
| Schedule / Interval | 在 n8n UI 中点击 "Execute Workflow" 手动触发 |
| DBTrigger | 在数据库中 INSERT 测试数据触发 |
| Webhook | 发送 HTTP 请求到 webhook URL |
| Manual | 直接点击 "Execute Workflow" |

**DBTrigger 测试示例**：
```sql
-- 根据工作流监听的表和 schema 插入测试数据
INSERT INTO ops_ods.ods_data_quality_validator (raw_payload, created_at)
VALUES ('{"test": true}'::jsonb, NOW());
```

**Webhook 测试示例**：
```bash
curl -X POST http://localhost:5678/webhook/{path} \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## Stage 2 — TEST 环境晋升

### 2.1 晋升前置条件

所有条件必须满足后才能晋升到 TEST：

- [ ] DEV 连续成功执行 >= 3 次
- [ ] DEV 稳定运行 >= 3 天
- [ ] 零执行失败（排除已知外部因素）
- [ ] 性能基线已建立（执行时间在预期范围内）
- [ ] PR 代码审查已通过
- [ ] 文档完整（README.md + CHANGELOG.md）

### 2.2 晋升执行步骤

1. **确认配置**：检查 `_config/test.yaml` 中的 trigger 配置正确
2. **渲染 TEST 工作流**：
   ```bash
   uv run python scripts/render_n8n_workflows.py test
   ```
3. **验证渲染结果**：
   ```bash
   uv run python scripts/render_n8n_workflows.py --verify test
   ```
4. **导入到 TEST n8n 实例**：将渲染后的 JSON 通过 n8n UI 导入
5. **绑定凭据**：在 TEST 环境中绑定 `Postgres-MJ-DataWarehouse` 凭据
6. **手动冒烟测试**：执行一次完整工作流，确认无错误
7. **激活工作流**：确认无误后在 n8n UI 中设为 Active

### 2.3 TEST 环境 Docker 命令

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml up -d
```

---

## Stage 3 — PRODUCTION 生产部署

### 3.1 部署前检查清单

- [ ] TEST 环境验证全部通过
- [ ] `production.yaml` 配置已确认（特别是 Webhook URL 不是占位符）
- [ ] 回滚方案已准备（当前 PROD 工作流已导出备份）
- [ ] 团队已通知
- [ ] 部署时间窗口已确认（建议非高峰时段）

### 3.2 部署执行步骤

1. **渲染 PROD 工作流**：
   ```bash
   uv run python scripts/render_n8n_workflows.py production
   ```
2. **验证渲染结果**：
   ```bash
   uv run python scripts/render_n8n_workflows.py --verify production
   ```
3. **备份当前 PROD 工作流**：从 n8n UI 导出当前版本（JSON 文件保存备用）
4. **导入渲染后的 JSON**：通过 n8n UI 导入到 PROD n8n 实例
5. **创建/绑定凭据**：PROD 凭据手动管理，确认 `Postgres-MJ-DataWarehouse` 已绑定
6. **手动冒烟测试**：执行一次完整工作流，确认无错误
7. **激活工作流**：确认无误后在 n8n UI 中设为 Active

### 3.3 PRODUCTION 环境 Docker 命令

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3.4 即时验证（部署后 30 分钟内）

- [ ] 工作流状态为 Active
- [ ] 首次执行成功（等待触发或手动执行）
- [ ] 无错误日志
- [ ] 下游系统正常接收数据/通知
- [ ] 通知正常送达（WeChat 群消息确认）

### 3.5 观测期验证（部署后 24 小时）

- [ ] 执行次数符合预期频率
- [ ] 执行时间在正常范围
- [ ] 无资源泄漏（内存/连接数稳定）
- [ ] 通知正常送达
- [ ] 无异常告警

---

## Rollback Strategy（回滚策略）

### 回滚触发条件

以下任一条件触发回滚：

- 连续 3+ 次执行失败
- 执行时间超过正常值 3 倍
- 数据错误（输出数据不正确）
- 下游系统报告异常

### 回滚执行步骤

1. **立即停用工作流**：n8n UI → 将工作流设为 Inactive
2. **通知团队**：通过 WeChat/Slack 通知相关人员
3. **恢复备份版本**：从之前导出的 JSON 文件重新导入到 n8n
4. **重新绑定凭据**：确认 `Postgres-MJ-DataWarehouse` 凭据已绑定
5. **激活恢复的版本**：在 n8n UI 中设为 Active
6. **验证恢复后的执行**：手动触发或等待自动触发，确认执行成功
7. **记录回滚事件**：更新 CHANGELOG.md（记录回滚原因和时间）

### 回滚决策树

```
执行失败?
  ├── 单次失败 → 观察下一次
  ├── 2 次失败 → 检查日志，准备回滚
  └── 3+ 次失败 → 立即回滚

执行超时?
  ├── < 2x 正常值 → 监控
  ├── 2-3x 正常值 → 告警 + 准备回滚
  └── > 3x 正常值 → 立即回滚

数据错误?
  └── 任何数据错误 → 立即回滚
```

---

## Human Intervention Points（人工交互节点）

| # | 触发条件 | 行为 |
|---|---------|------|
| H1 | 晋升前置条件未全部满足 | 展示未满足条件列表，询问用户是否仍要继续 |
| H2 | `production.yaml` 中 Webhook URL 仍为占位符 | **硬性阻断**："生产环境 Webhook URL 仍为占位符，必须替换为真实密钥后才能继续" |
| H3 | 用户请求回滚 | 确认回滚范围（单个工作流 vs 全部），引导执行回滚步骤 |
| H4 | 部署后验证未通过 | 评估严重性，若为关键问题则建议立即回滚 |

---

## Output（输出）

每个阶段完成后输出以下摘要：

```
{Stage}验证完成 / 晋升条件检查完成
  通过项: N / 总项: M
  [如有未通过项列表]
  建议：{next action}
```

示例：

```
DEV 环境测试验证完成
  通过项: 8 / 总项: 8
  建议：所有验证通过，可以准备 TEST 环境晋升。使用 /mj-sys-n8n-promote 选择 "TEST 环境晋升" 阶段。
```

```
TEST → PROD 晋升条件检查完成
  通过项: 5 / 总项: 6
  未通过:
    - [ ] 文档完整（README.md + CHANGELOG.md）— CHANGELOG.md 尚未更新
  建议：请先更新 CHANGELOG.md，然后重新检查晋升条件。
```

---

## Reference

- `-> promotion-checklist.md` — 精简晋升检查清单（快速参考，基于 `n8n/_templates/TEMPLATE_WORKFLOW_PROMOTION_CHECKLIST.md` 的简化版）
- `n8n/_templates/TEMPLATE_WORKFLOW_PROMOTION_CHECKLIST.md` — 完整晋升检查清单模板（权威版本）
- `docs/infrastructure/n8n/` — n8n 基础设施文档
- `n8n/workflows/_config/*.yaml` — 环境配置文件
- `scripts/render_n8n_workflows.py` — 渲染脚本
- `docker-compose.yml` / `docker-compose.test.yml` / `docker-compose.prod.yml` — Docker 环境配置
