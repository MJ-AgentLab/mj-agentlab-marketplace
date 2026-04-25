# Trigger Configuration Reference

n8n 工作流触发器配置速查手册。

## 1. Cron 5-Field Format

```
┌───────────── minute (0-59)
│ ┌─────────── hour (0-23)
│ │ ┌───────── day of month (1-31)
│ │ │ ┌─────── month (1-12)
│ │ │ │ ┌───── day of week (0-7, 0 and 7 = Sunday)
│ │ │ │ │
* * * * *
```

## 2. Common Cron Expressions

| Expression | Meaning |
|-----------|---------|
| `0 11,17,21,23 * * *` | 每天 11:00, 17:00, 21:00, 23:00 |
| `0 9 * * 1-5` | 工作日每天 09:00 |
| `*/30 * * * *` | 每 30 分钟 |
| `0 0 * * *` | 每天午夜 |
| `0 8 * * 1` | 每周一 08:00 |
| `0 */2 * * *` | 每 2 小时整点 |
| `30 9 * * 1-5` | 工作日每天 09:30 |
| `0 6-22 * * *` | 每天 06:00 到 22:00 每小时 |
| `0 9 1 * *` | 每月 1 日 09:00 |

## 3. Interval Configuration

```yaml
interval_minutes: 30    # bare integer, unit is minutes
```

Common values: 5, 10, 15, 30, 60

Interval 类型在 YAML 中只需一个字段，无需 timezone（n8n 内部按 UTC 间隔执行）。

## 4. YAML Key Must Match Directory Name

```
Directory: _base/CollectionNodes/RawDataCollection-Scheduled/
YAML key:  RawDataCollection-Scheduled
```

渲染脚本从占位符中提取触发器名称（例如 `{{TRIGGER_CRON_RawDataCollection}}` 提取 `RawDataCollection`），然后通过前缀匹配查找 YAML 中的 `triggers.RawDataCollection-Scheduled` 条目。注意占位符中不含 TriggerType 后缀（正则 `\w+` 不匹配连字符 `-`）。

Key 匹配是**区分大小写**的。YAML key 使用完整目录名（含连字符和 TriggerType 后缀）。

## 5. Environment Differences

| Item | dev | test | production |
|------|-----|------|------------|
| `environment.prefix` | DEV | TEST | PROD |
| `environment.tag` | env:dev | env:test | env:production |
| `environment.name` | dev | test | production |
| `notifications.wechat_webhook_url` | team webhook | team webhook | **production webhook (must be real)** |
| `triggers.*` | usually same | usually same | usually same (can differ) |

通常三个环境的 trigger 配置相同。少数情况下 production 可能需要不同频率（例如 dev 每小时执行一次用于调试，production 每天执行一次）。

## 6. DBTrigger Workflows

DBTrigger workflows (like `RawDataArchiveNotification-DBTrigger`, `DataLoader-DBTrigger`) do NOT need entries in the `triggers:` section. They are event-driven by PostgreSQL NOTIFY/LISTEN, so there's no cron or interval to configure.

The only environment-specific values for DBTrigger workflows are already covered by the base YAML entries: `{{ENV_PREFIX}}`, `{{ENV_TAG}}`, `{{ENV_NAME}}`, `{{WECHAT_WEBHOOK_URL}}`.

同理，Webhook 和 Manual 触发类型也无需 trigger 配置条目。
