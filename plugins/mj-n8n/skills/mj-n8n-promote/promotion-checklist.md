# N8N Workflow Promotion Checklist

精简晋升检查清单，供各阶段快速参考。

---

## 1. DEV 环境验证清单

```
□ 工作流在 n8n UI 中可见且名称正确（DEV- 前缀）
□ 凭据绑定成功（Postgres-MJ-DataWarehouse）
□ API 端点连通（HTTP 200）
□ 手动完整执行成功
□ 输出格式正确（通知/日志）
□ 错误分支处理正常
□ 环境变量值正确（environment: "dev"）
□ 标签正确（env:dev, trigger:*, domain:*）
```

---

## 2. TEST → PROD 晋升条件

```
□ DEV 连续成功 >= 3 次
□ DEV 稳定运行 >= 3 天
□ 零执行失败
□ 性能基线已建立
□ PR 代码审查通过
□ README.md 完整
□ CHANGELOG.md 已更新
□ production.yaml Webhook URL 已替换为真实密钥
```

---

## 3. 部署后验证 — 即时 (30 min)

```
□ 工作流 Active 状态
□ 首次执行成功
□ 无错误日志
□ 下游系统正常
□ 通知送达确认
```

---

## 4. 部署后验证 — 观测期 (24 hr)

```
□ 执行次数符合预期
□ 执行时间正常范围
□ 无资源泄漏
□ 通知正常送达
□ 无异常告警
```

---

## 5. 回滚决策树

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

## 6. 回滚步骤

```
1. n8n UI → 停用工作流 (Inactive)
2. 通知团队 (WeChat/Slack)
3. 导入备份 JSON (之前导出的版本)
4. 重新绑定凭据
5. 激活恢复版本
6. 验证执行
7. 更新 CHANGELOG.md (记录回滚)
```

---

## 7. Docker 命令速查

```bash
# 启动环境
docker compose up -d

# 查看 n8n 日志
docker compose logs -f mj-n8n

# 重启 n8n
docker compose restart mj-n8n

# TEST 环境
docker compose -f docker-compose.yml -f docker-compose.test.yml up -d

# PRODUCTION 环境
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 8. 性能基线参考（现有工作流）

| Workflow | Expected Execution Time | Frequency |
|----------|------------------------|-----------|
| RawDataCollection-Scheduled | 60-180s | Every 30 min |
| MissingDataNotification-Schedule | 5-15s | 4x daily |
| RawDataArchiveNotification-DBTrigger | 2-5s | Event-driven |
| DataLoader-DBTrigger | 30-120s | Event-driven |
