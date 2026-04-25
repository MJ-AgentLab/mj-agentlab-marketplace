# Node Patterns Reference

n8n workflow JSON 节点模板完整参考，供 `mj-n8n-author` 技能生成工作流时使用。

---

## 1. Workflow JSON Top-Level Schema

```json
{
  "name": "{{ENV_PREFIX}}-{Category}-{Name}-{TriggerType}",
  "nodes": [/* node objects array */],
  "pinData": {},
  "connections": {/* source → target mapping */},
  "active": false,
  "settings": { "executionOrder": "v1" },
  "versionId": "xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx",
  "tags": [{ "name": "string" }]
}
```

**规则**：
- 模板中不包含顶层 `id`（导入时自动分配）
- `active` 始终 `false`
- `versionId` 为 UUID v4 格式

---

## 2. Node Object Schema

```json
{
  "parameters": { /* node-type specific */ },
  "type": "n8n-nodes-base.{nodeType}",
  "typeVersion": 1,
  "position": [x, y],
  "id": "xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx",
  "name": "{Action}_{Target}"
}
```

含 credential 的节点追加：
```json
{
  "credentials": {
    "postgres": {
      "id": "PLACEHOLDER",
      "name": "Postgres-MJ-DataWarehouse"
    }
  }
}
```

---

## 3. Complete Node Type Templates

### 3a. Schedule Trigger — Cron

```json
{
  "parameters": {
    "rule": {
      "interval": [{
        "field": "cronExpression",
        "expression": "{{TRIGGER_CRON_{Name}}}"
      }]
    }
  },
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [-176, -256],
  "id": "uuid",
  "name": "Trigger_ScheduledDataCheck"
}
```

注意：`expression` 值在引号内，渲染后替换为实际 cron 表达式。

### 3b. Schedule Trigger — Interval

```json
{
  "parameters": {
    "rule": {
      "interval": [{
        "field": "minutes",
        "minutesInterval": {{TRIGGER_INTERVAL_{Name}}}
      }]
    }
  },
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [-608, 192],
  "id": "uuid",
  "name": "Trigger_ScheduledStart"
}
```

**重要**：`minutesInterval` 是裸整数（无引号），因此模板文件不是合法 JSON。渲染脚本使用字符串级替换处理此情况。

### 3c. PostgreSQL Trigger — DBTrigger

```json
{
  "parameters": {
    "schema": {
      "__rl": true,
      "value": "{schema_name}",
      "mode": "list",
      "cachedResultName": "{schema_name}"
    },
    "tableName": {
      "__rl": true,
      "value": "{table_name}",
      "mode": "list",
      "cachedResultName": "{table_name}"
    },
    "additionalFields": {},
    "options": {}
  },
  "type": "n8n-nodes-base.postgresTrigger",
  "typeVersion": 1,
  "position": [-400, 100],
  "id": "uuid",
  "name": "Trigger_{EventName}",
  "credentials": {
    "postgres": {
      "id": "PLACEHOLDER",
      "name": "Postgres-MJ-DataWarehouse"
    }
  }
}
```

注意：schema 和 tableName 使用 `__rl` 格式（n8n 资源定位器），包含 `mode: "list"` 和 `cachedResultName`。

### 3d. Webhook Trigger

```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "{webhook-path}"
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [-200, 0],
  "id": "uuid",
  "name": "Trigger_WebhookReceive"
}
```

### 3e. Manual Trigger

```json
{
  "parameters": {},
  "type": "n8n-nodes-base.manualTrigger",
  "typeVersion": 1,
  "position": [-200, 0],
  "id": "uuid",
  "name": "Trigger_ManualExecution"
}
```

### 3f. HTTP Request — POST（API 调用）

```json
{
  "parameters": {
    "method": "POST",
    "url": "http://mj-app:8000/{service-prefix}/{endpoint}",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify($json) }}",
    "options": {
      "timeout": 120000
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.3,
  "position": [x, y],
  "id": "uuid",
  "name": "Execute_{ServiceName}"
}
```

带自定义 Headers 的变体：
```json
{
  "parameters": {
    "method": "POST",
    "url": "http://mj-app:8000/{service-prefix}/{endpoint}",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "X-Flow-ID", "value": "={{ $json.flow_id }}" },
        { "name": "X-Parent-Execution-ID", "value": "={{ $json.execution_id }}" }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "{}",
    "options": {
      "timeout": 120000
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.3,
  "position": [x, y],
  "id": "uuid",
  "name": "Execute_{ServiceName}"
}
```

带字符串拼接 body 的变体：
```json
{
  "parameters": {
    "method": "POST",
    "url": "http://mj-app:8000/{service-prefix}/{endpoint}",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({\"source_path\": $json.payload.destination_path}) }}",
    "options": {
      "timeout": 30000
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.3,
  "position": [x, y],
  "id": "uuid",
  "name": "Execute_{ServiceName}"
}
```

### 3g. HTTP Request — GET

```json
{
  "parameters": {
    "url": "http://mj-app:8000/{service-prefix}/{endpoint}",
    "options": {
      "timeout": 10000
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.3,
  "position": [x, y],
  "id": "uuid",
  "name": "Fetch_{ResourceName}"
}
```

### 3h. HTTP Request — POST（WeChat 通知）

```json
{
  "parameters": {
    "method": "POST",
    "url": "{{WECHAT_WEBHOOK_URL}}",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify($json) }}",
    "options": {
      "timeout": 10000
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.3,
  "position": [x, y],
  "id": "uuid",
  "name": "Send_WeChatNotification"
}
```

### 3i. PostgreSQL Query

```json
{
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT ... FROM {schema}.{table} WHERE ...",
    "options": {
      "connectionTimeout": 5000
    }
  },
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 2.6,
  "position": [x, y],
  "id": "uuid",
  "name": "Query_{DataName}",
  "credentials": {
    "postgres": {
      "id": "PLACEHOLDER",
      "name": "Postgres-MJ-DataWarehouse"
    }
  }
}
```

也可命名为 `Fetch_{DataName}` 当用途偏向"获取"时。

### 3j. Code — JavaScript

```json
{
  "parameters": {
    "jsCode": "// ============================================================\n// Node: {NodeName}\n// Purpose: {description}\n// Input: {input description}\n// Output: {output description}\n// ============================================================\n\nconst items = $input.all();\n// Process...\nreturn items;"
  },
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [x, y],
  "id": "uuid",
  "name": "Transform_{DataName}"
}
```

Code 节点命名规范：
- `Transform_{DataName}` — 数据转换
- `Log_{EventName}` — 日志记录
- 头部注释块必须包含 Node name、Purpose、Input、Output

### 3k. IF — Condition

```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "loose"
      },
      "conditions": [
        {
          "id": "{descriptive-id}",
          "leftValue": "={{ $json.fieldName }}",
          "rightValue": "",
          "operator": {
            "type": "string",
            "operation": "exists"
          }
        }
      ],
      "combinator": "and"
    },
    "options": {}
  },
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "position": [x, y],
  "id": "uuid",
  "name": "Validate_{ConditionName}"
}
```

**常用 operator**：
| type | operation | 说明 |
|------|-----------|------|
| `string` | `exists` | 字段存在且非空 |
| `string` | `equals` | 等于指定值 |
| `boolean` | `true` | 布尔值为 true |
| `any` | `exists` | 任意类型存在 |

**条件组合**：
- `combinator: "and"` — 所有条件满足
- `combinator: "or"` — 任一条件满足

**输出分支**：
- `main[0]` — TRUE 分支（条件满足）
- `main[1]` — FALSE 分支（条件不满足）

IF 节点命名规范：
- `Validate_{ConditionName}` — 验证输入数据
- `Filter_{DataType}` — 过滤特定数据类型

---

## 4. Connection Format

### Standard — Single Output

```json
"SourceNode": {
  "main": [
    [{ "node": "TargetNode", "type": "main", "index": 0 }]
  ]
}
```

### IF Node — Dual Output

```json
"Validate_InputData": {
  "main": [
    [{ "node": "TruePathNode", "type": "main", "index": 0 }],
    [{ "node": "FalsePathNode", "type": "main", "index": 0 }]
  ]
}
```

### Fan-out — Multiple Targets

```json
"SourceNode": {
  "main": [
    [
      { "node": "Target1", "type": "main", "index": 0 },
      { "node": "Target2", "type": "main", "index": 0 }
    ]
  ]
}
```

### Chain — Sequential Steps

```json
"Step1": { "main": [[{ "node": "Step2", "type": "main", "index": 0 }]] },
"Step2": { "main": [[{ "node": "Step3", "type": "main", "index": 0 }]] },
"Step3": { "main": [[{ "node": "Step4", "type": "main", "index": 0 }]] }
```

---

## 5. Expression Syntax Quick Reference

| 表达式 | 用途 |
|--------|------|
| `$json.fieldName` | 当前 item 字段 |
| `$json['fieldName']` | 同上（含特殊字符时） |
| `$input.first().json` | 第一个输入 item |
| `$input.all()` | 所有输入 items |
| `$('NodeName').first().json` | 引用其他节点数据 |
| `$('NodeName').item.json` | 引用其他节点当前 item |
| `$execution.id` | 当前执行 ID |
| `$execution.resumeUrl` | 恢复 URL |
| `={{ expression }}` | n8n 表达式语法（在 JSON 参数中使用） |

**注意**：n8n 表达式 `{{ $json.x }}` 与模板占位符 `{{ENV_PREFIX}}` 的区别：
- n8n 表达式：以 `=` 开头或在 Code 节点的 JS 中使用 `$` 前缀
- 模板占位符：全大写字母+下划线，如 `{{ENV_PREFIX}}`、`{{WECHAT_WEBHOOK_URL}}`

---

## 6. MJ System API Endpoints

| Service | Prefix | Key Endpoints | Recommended Timeout |
|---------|--------|---------------|---------------------|
| AutoEmailCollector | `/auto-email-collector` | `POST /collect` | 60s-120s |
| DataQualityValidator | `/data-quality-validator` | `POST /process` | 120s |
| StageAreaCleaner | `/stage-area-cleaner` | `POST /clean` | 60s |
| QueryVolumeLoader | `/query-volume-loader` | `POST /load` | 30s-120s |
| QueryCommonMetrics | `/query-common-metrics` | `POST /calculate` | 300s |
| FileCleaner | `/file-cleaner` | `POST /clean` | 60s |

**通用端点**（所有服务均有）：
- `GET /` — 服务信息
- `GET /health` — 健康检查（timeout: 10s）

所有 URL 格式：`http://mj-app:8000{prefix}{endpoint}`（Docker 内部 DNS）

---

## 7. WeChat Work Notification Templates

### markdown_v2 格式（推荐，不支持 font color）

```javascript
// ============================================================
// Node: Transform_BuildWeChatMarkdown
// Purpose: Build WeChat markdown_v2 message
// Input: Processed data from previous nodes
// Output: WeChat markdown_v2 message format
// Reference: https://developer.work.weixin.qq.com/document/path/91770
// Note: markdown_v2 does not support font color tags
// ============================================================

const formatDateTime = (date) => {
  return DateTime.fromJSDate(new Date(date))
    .setZone('Asia/Shanghai')
    .toFormat('yyyy-MM-dd HH:mm');
};

const data = $input.first().json;

const content = `${statusIcon} **${title}**

> 环境: {{ENV_NAME}}
> 时间: ${formatDateTime(new Date())}
> 执行ID: ${$execution.id}

**状态**: ${status}

${details}`;

return [{
  json: {
    msgtype: 'markdown_v2',
    markdown_v2: {
      content: content
    }
  }
}];
```

### 表格格式通知

```javascript
let content = `## 📊 ${title}\n\n| 列1 | 列2 |\n| :----- | :----- |\n`;

for (const item of items) {
  content += `| ${item.json.col1} | ${item.json.col2} |\n`;
}

return [{
  json: {
    msgtype: 'markdown_v2',
    markdown_v2: { content: content }
  }
}];
```

### Status icon mapping

```javascript
const STATUS_MAP = {
  'passed':   { icon: '✅', text: '验证通过' },
  'bypassed': { icon: '☑️', text: '无需验证' },
  'skipped':  { icon: '⚠️', text: '前置条件不满足' },
  'failed':   { icon: '❌', text: '验证失败' }
};
```

---

## 8. Credential Reference

项目中使用的 credential 名称：

| Credential Name | Type | 用途 |
|----------------|------|------|
| `Postgres-MJ-DataWarehouse` | `postgres` | 主数据仓库连接 |

模板中所有 credential `id` 值为 `"PLACEHOLDER"`：
```json
"credentials": {
  "postgres": {
    "id": "PLACEHOLDER",
    "name": "Postgres-MJ-DataWarehouse"
  }
}
```

导入 n8n 时由 setup container 或手动配置替换为实际 credential ID。

---

## 9. Log Node Output Format Reference

### WORKFLOW_EXECUTION（工作流整体结果）

```javascript
return [{
  json: {
    logType: 'WORKFLOW_EXECUTION',
    workflowName: '{{ENV_PREFIX}}-{Category}-{Name}-{TriggerType}',
    executionId: $execution.id,
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',          // SUCCESS | FAILED | COMPLETED_WITH_WARNINGS
    environment: '{{ENV_NAME}}',
    responseCode: inputData.errcode,
    responseMessage: inputData.errmsg
  }
}];
```

### VALIDATION_SKIPPED（输入验证失败）

```javascript
return [{
  json: {
    logType: 'VALIDATION_SKIPPED',
    workflowName: '{{ENV_PREFIX}}-{Category}-{Name}-{TriggerType}',
    executionId: $execution.id,
    timestamp: new Date().toISOString(),
    status: 'SKIPPED',
    reason: 'Invalid or missing payload data',
    inputReceived: JSON.stringify(inputData).substring(0, 500),
    environment: '{{ENV_NAME}}'
  }
}];
```

### STEP_ERROR（步骤错误）

```javascript
return [{
  json: {
    logType: 'STEP_ERROR',
    workflowName: '{{ENV_PREFIX}}-{Category}-{Name}-{TriggerType}',
    executionId: $execution.id,
    timestamp: new Date().toISOString(),
    status: 'ERROR',
    step: '{FailedNodeName}',
    reason: '{error description}',
    responseReceived: JSON.stringify(inputData).substring(0, 1000),
    environment: '{{ENV_NAME}}',
    recommendation: '{suggested action}'
  }
}];
```

### NO_DATA_FOUND（查询无结果）

```javascript
return [{
  json: {
    logType: 'NO_DATA_FOUND',
    workflowName: '{{ENV_PREFIX}}-{Category}-{Name}-{TriggerType}',
    executionId: $execution.id,
    timestamp: new Date().toISOString(),
    status: 'NO_ACTION',
    message: '{description of what was checked}',
    environment: '{{ENV_NAME}}'
  }
}];
```

---

## 10. DateTime Formatting Conventions

n8n Code 节点中 `DateTime`（Luxon）为全局对象，无需 import。这是 n8n 官方推荐的日期处理方式。

### 用户可见时间（通知、报告、消息）

所有面向用户的时间显示必须使用北京时间。推荐使用显式 `.setZone()` 确保代码自包含、不依赖容器配置：

**单次使用（inline）**：
```javascript
DateTime.fromJSDate(new Date()).setZone('Asia/Shanghai').toFormat('yyyy-MM-dd HH:mm')
// 输出示例：2026-04-01 10:00
```

**多次使用（辅助函数）**：
```javascript
const formatDateTime = (date) => {
  return DateTime.fromJSDate(new Date(date))
    .setZone('Asia/Shanghai')
    .toFormat('yyyy-MM-dd HH:mm');
};
```

**替代方案**：`$now.toFormat('yyyy-MM-dd HH:mm')` 也可用于当前时间（`$now` 是 Luxon 对象，遵循 `GENERIC_TIMEZONE` 配置），但显式 `.setZone()` 更安全——不依赖环境配置。

### 避免在用户可见内容中使用的方法

| 方法 | 问题 |
|------|------|
| `new Date().getHours()` / `.getMinutes()` | 返回容器操作系统时区时间；若 Docker 未设 `TZ`，返回 UTC，比北京时间早 8 小时 |
| `new Date().toLocaleString()` | 输出依赖 Node.js 打包的 ICU 数据，不同版本格式可能不一致（如有无逗号分隔符），Docker 容器中不可预测 |
| `new Date().toISOString()` | 输出 `2026-04-01T02:00:00.000Z` 格式，语义正确但用户无法直观识读为北京时间 |

### 内部日志时间戳

Log 节点的 `timestamp` 字段保持 ISO 8601 UTC 格式（与 Section 9 一致）：

```javascript
// 正确：内部日志使用 UTC ISO 格式，带 Z 后缀语义明确
timestamp: new Date().toISOString()
// 输出示例：2026-04-01T02:00:00.000Z
```

### n8n 时区控制面

| 层级 | 配置 | 影响范围 |
|------|------|---------|
| 操作系统层 | `TZ: Asia/Shanghai`（Docker 环境变量） | vanilla JS `Date` 对象的本地时间方法 |
| n8n 应用层 | `GENERIC_TIMEZONE: Asia/Shanghai` | Luxon `$now` / `$today` / `DateTime.now()` + cron 调度 |
| 代码层 | `.setZone('Asia/Shanghai')` | 显式指定，不依赖上述任何配置 |

三层独立。代码层 `.setZone()` 是最安全的选择——即使容器或 n8n 配置变更，通知时间仍正确。
