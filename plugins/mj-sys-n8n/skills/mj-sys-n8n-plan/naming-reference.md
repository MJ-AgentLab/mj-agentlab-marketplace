# Naming Reference — n8n Workflow Planner 快速查询表

## Category 完整对照表

| Category | 缩写 | 说明 | 现有工作流示例 |
|----------|------|------|---------------|
| CollectionNodes | cn | 数据收集：邮件收集、文件下载、API 抓取、监控告警、通知 | RawDataCollection, MissingDataNotification, RawDataArchiveNotification |
| ProcessingNodes | pn | 数据处理：ETL、数据转换、数据加载、格式转换 | DataLoader |
| ServiceNodes | sn | 系统服务：健康检查、资源清理、系统维护（规划中） | — |
| TaskNodes | tn | 任务调度：批量任务、定期处理、工作流编排（规划中） | — |

### Category 判断辅助

| 用户描述关键词 | 推荐 Category |
|---------------|--------------|
| 收集、采集、下载、抓取、邮件 | CollectionNodes |
| 监控、检查、告警、通知、缺失 | CollectionNodes |
| 归档、备份、暂存清理 | CollectionNodes |
| 加载、导入、转换、ETL、写入 | ProcessingNodes |
| 计算、统计、聚合、指标 | ProcessingNodes |
| 健康检查、服务管理、清理维护 | ServiceNodes |
| 批量、编排、串联、定期汇总 | TaskNodes |

---

## TriggerType 完整对照表

| TriggerType | 缩写 | n8n 节点 | 适用场景 | 占位符 |
|-------------|------|----------|---------|--------|
| Schedule | sched | `n8n-nodes-base.scheduleTrigger` (Cron) | 每天固定时间点执行 | `{{TRIGGER_CRON_{Name}}}` |
| Scheduled | sched | `n8n-nodes-base.scheduleTrigger` (Interval) | 固定间隔执行（分钟级）| `{{TRIGGER_INTERVAL_{Name}}}` |
| DBTrigger | dbt | `n8n-nodes-base.postgresTrigger` | 数据库表 INSERT 事件驱动 | 无（事件驱动） |
| Webhook | wh | `n8n-nodes-base.webhook` | HTTP 请求触发 | 无（按需触发） |
| Manual | man | `n8n-nodes-base.manualTrigger` | 仅手动执行 | 无 |

### Schedule vs Scheduled

- **Schedule** (Cron)：使用 cron 表达式指定精确时间点。推荐用于新建工作流。
  - 配置示例：`"cron": "0 9,18 * * *"` → 每天 9:00 和 18:00
- **Scheduled** (Interval)：以分钟为单位的固定间隔。历史兼容名称。
  - 配置示例：`"interval_minutes": 30` → 每 30 分钟
- 新建工作流统一使用 `Schedule`；仅当明确需要固定间隔且现有命名为 `Scheduled` 时保留。

### TriggerType 选型对比

| 考量 | Schedule | DBTrigger | Webhook | Manual |
|------|----------|-----------|---------|--------|
| 延迟 | 秒~分钟（依赖 cron） | 亚秒级（INSERT 即触发） | 实时（HTTP 请求即触发） | 人工操作 |
| 可靠性 | 高（n8n 内置调度） | 高（PostgreSQL LISTEN/NOTIFY） | 中（依赖调用方） | 低 |
| 适用 | 定期轮询、报告 | 数据管道、事件响应 | 外部系统集成 | 开发调试 |
| _config 要求 | 需添加 cron/interval | 无需配置 | 无需配置 | 无需配置 |

---

## 标签体系完整列表

每个工作流至少 3 个标签：`env` + `trigger` + `domain`。

| 命名空间 | 格式 | 可选值 | 说明 |
|----------|------|--------|------|
| env | `env:{environment}` | `env:dev`, `env:test`, `env:production` | 环境标签（模板中使用 `{{ENV_TAG}}`） |
| trigger | `trigger:{type}` | `trigger:schedule`, `trigger:database`, `trigger:webhook`, `trigger:manual` | 触发类型 |
| domain | `domain:{category-kebab}` | `domain:collection-nodes`, `domain:processing-nodes`, `domain:service-nodes`, `domain:task-nodes` | 所属域 |
| tech | `tech:{technology}` | `tech:postgres`, `tech:api`, `tech:http`, `tech:wechat` | 使用的技术 |
| function | `function:{function}` | `function:notification`, `function:data-collection`, `function:data-loading`, `function:monitoring`, `function:etl` | 业务功能 |
| schedule | `schedule:{frequency}` | `schedule:cron-daily`, `schedule:interval-30min`, `schedule:realtime` | 调度频率 |

### TriggerType → trigger 标签映射

| TriggerType | trigger 标签 |
|-------------|-------------|
| Schedule | `trigger:schedule` |
| Scheduled | `trigger:schedule` |
| DBTrigger | `trigger:database` |
| Webhook | `trigger:webhook` |
| Manual | `trigger:manual` |

### Category → domain 标签映射

| Category | domain 标签 |
|----------|------------|
| CollectionNodes | `domain:collection-nodes` |
| ProcessingNodes | `domain:processing-nodes` |
| ServiceNodes | `domain:service-nodes` |
| TaskNodes | `domain:task-nodes` |

---

## 节点命名规范

### 格式

```
{Action}_{Target}
```

### Action 动词完整列表

| Action | 适用节点类型 | 说明 | 示例 |
|--------|------------|------|------|
| Trigger | scheduleTrigger, postgresTrigger, webhook | 触发工作流 | `Trigger_ScheduledDataCheck` |
| Execute | httpRequest | 调用 MJ System API | `Execute_AutoEmailCollector` |
| Fetch | postgres, httpRequest | 查询/获取数据 | `Fetch_MissingDataReport` |
| Validate | if | 验证数据/响应 | `Validate_CollectorResponse` |
| Filter | if, switch | 筛选/路由数据 | `Filter_DataType` |
| Transform | code | 转换数据格式 | `Transform_BuildMarkdownTable` |
| Build | code | 构建消息内容 | `Build_NotificationPayload` |
| Format | code | 格式化输出 | `Format_ReportData` |
| Send | httpRequest | 发送通知 | `Send_WeChatNotification` |
| Log | code | 记录日志 | `Log_ExecutionResult` |
| Check | httpRequest, postgres | 检查状态 | `Check_ServiceHealth` |

### 常见节点命名模式

| 场景 | 节点名称 |
|------|---------|
| Cron 触发 | `Trigger_Scheduled{Purpose}` 或 `Trigger_ScheduledStart` |
| DB 触发 | `Trigger_{DataChange\|Event}` |
| 调用服务 API | `Execute_{ServiceName}` |
| 验证 API 响应 | `Validate_{Service}Response` |
| 数据库查询 | `Fetch_{DataDescription}` |
| 构建微信消息 | `Transform_BuildWeChatMarkdown` 或 `Transform_Build{Purpose}` |
| 发送微信通知 | `Send_WeChatNotification` |
| 成功日志 | `Log_ExecutionResult` |
| 错误日志 | `Log_{Service}Error` 或 `Log_{Situation}Skipped` |
| 无数据日志 | `Log_NoDataFound` |

---

## API 地址规范

### Docker 内部地址

```
http://mj-app:8000/{service-prefix}/{endpoint}
```

### 服务端点速查

| 服务 | 路由前缀 | 常用端点 | 推荐超时 |
|------|---------|---------|---------|
| AutoEmailCollector | `/auto-email-collector` | `POST /collect` | 60s (60000ms) |
| DataQualityValidator | `/data-quality-validator` | `POST /process` | 120s (120000ms) |
| StageAreaCleaner | `/stage-area-cleaner` | `POST /clean` | 60s (60000ms) |
| QueryVolumeLoader | `/query-volume-loader` | `POST /load` | 30s (30000ms) |
| QueryCommonMetrics | `/query-common-metrics` | `POST /calculate` | 120s (120000ms) |
| FileCleaner | `/file-cleaner` | `POST /clean` | 60s (60000ms) |

---

## 超时参考

| 操作类型 | 推荐超时 | 说明 |
|----------|---------|------|
| 数据库查询 | 5-10 秒 (5000-10000ms) | 简单 SELECT、聚合查询 |
| MJ System API 调用 | 60-120 秒 (60000-120000ms) | 服务处理时间因数据量而异 |
| 文件处理 API | 120-300 秒 (120000-300000ms) | 大文件解压、批量处理 |
| 企业微信通知 | 10 秒 (10000ms) | 外部 API 调用 |
| 数据库连接 | 5 秒 (5000ms) | `connectionTimeout` 参数 |

---

## Workflow ID 构建规则

### 格式

```
wf_{category_abbr}_{name_abbr}_{seq}
```

### 缩写对照

| 要素 | 全称 | 缩写 |
|------|------|------|
| Category: CollectionNodes | CollectionNodes | `cn` |
| Category: ProcessingNodes | ProcessingNodes | `pn` |
| Category: ServiceNodes | ServiceNodes | `sn` |
| Category: TaskNodes | TaskNodes | `tn` |

Name 缩写取各单词首字母小写（如 `MissingDataNotification` → `mdn`，`DataLoader` → `dl`）。

### 现有 ID 示例

| 工作流 | Workflow ID |
|--------|-------------|
| MissingDataNotification-Schedule | `wf_cn_missnotif_01` |
| RawDataArchiveNotification-DBTrigger | `wf_cn_rdan_01` |
| RawDataCollection-Scheduled | `wf_cn_rdc_01` |
| DataLoader-DBTrigger | `wf_pn_dataloader_01` |

---

## _config YAML 快速参考

仅 Schedule/Scheduled 类型需要在 `_config/*.yaml` 添加配置。DBTrigger/Webhook/Manual 无需配置。

### Cron 模式

```yaml
triggers:
  {Name}-{TriggerType}:
    cron: "0 9,18 * * *"
    timezone: "Asia/Shanghai"
```

### Interval 模式

```yaml
triggers:
  {Name}-{TriggerType}:
    interval_minutes: 30
```

### 注意事项

- 三个环境文件（`dev.yaml`, `test.yaml`, `production.yaml`）均需更新
- production 可使用不同的 cron 表达式或间隔
- `timezone` 固定使用 `"Asia/Shanghai"`

---

## DateTime 处理约定

用户可见时间使用 Luxon `DateTime`，内部日志使用 `toISOString()`。详见 `node-patterns.md` Section 10。
