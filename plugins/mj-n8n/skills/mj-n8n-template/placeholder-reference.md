# Placeholder Reference — N8N Workflow Template

本文档为 `mj-n8n-template` Skill 的占位符完整参考。

## 1. Full Placeholder List

| Placeholder | Source Config (YAML) | JSON Location (JSONPath-like) | Example Before | Example After |
|-------------|---------------------|------------------------------|----------------|---------------|
| `{{ENV_PREFIX}}` | `environment.prefix` | `$.name`; Code 节点 `jsCode` 中 `workflowName` 赋值 | `DEV-CollectionNodes-...` | `{{ENV_PREFIX}}-CollectionNodes-...` |
| `{{ENV_TAG}}` | `environment.tag` | `$.tags[?(@.name=~/env:/)].name` | `env:dev` | `{{ENV_TAG}}` |
| `{{ENV_NAME}}` | `environment.name` | Code 节点 `jsCode` 中 `environment` 赋值 | `environment: "dev"` | `environment: "{{ENV_NAME}}"` |
| `{{WECHAT_WEBHOOK_URL}}` | `notifications.wechat_webhook_url` | HTTP Request 节点 `url` | `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx` | `{{WECHAT_WEBHOOK_URL}}` |
| `{{TRIGGER_CRON_{Name}}}` | `triggers.{Name}.cron` | Schedule Trigger `parameters.rule.interval[].expression` | `"0 11,17,21,23 * * *"` | `{{TRIGGER_CRON_MissingDataNotification}}` |
| `{{TRIGGER_INTERVAL_{Name}}}` | `triggers.{Name}.interval_minutes` | Schedule Trigger `parameters.rule.interval[].minutesInterval` | `30` | `{{TRIGGER_INTERVAL_RawDataCollection}}` |
| `"PLACEHOLDER"` | (auto-assigned by n8n) | `$.nodes[*].credentials.*.id` | `"7"` or `"12"` | `"PLACEHOLDER"` |

## 2. Cron vs Interval Placeholder Difference

### Cron（字符串值，在 `expression` 字段中）

模板中：
```json
"expression": "{{TRIGGER_CRON_MissingDataNotification}}"
```

配置 (`dev.yaml`):
```yaml
triggers:
  MissingDataNotification-Schedule:
    cron: "0 11,17,21,23 * * *"
```

渲染后：
```json
"expression": "0 11,17,21,23 * * *"
```

### Interval（整数值，在 `minutesInterval` 字段中）

模板中：
```json
"minutesInterval": {{TRIGGER_INTERVAL_RawDataCollection}}
```

注意：Interval 占位符是**裸整数**，不带引号。这使得模板不是合法 JSON。

配置 (`dev.yaml`):
```yaml
triggers:
  RawDataCollection-Scheduled:
    interval_minutes: 30
```

渲染后：
```json
"minutesInterval": 30
```

## 3. Credential PLACEHOLDER Example

导出 JSON（before）：
```json
"credentials": {
  "postgres": {
    "id": "7",
    "name": "Postgres-MJ-DataWarehouse"
  }
}
```

模板（after）：
```json
"credentials": {
  "postgres": {
    "id": "PLACEHOLDER",
    "name": "Postgres-MJ-DataWarehouse"
  }
}
```

说明：
- `id` 是环境特定的（每个 n8n 实例分配不同的 credential ID）
- `name` 各环境相同（约定统一命名），不替换
- `PLACEHOLDER` 是字符串值（带引号），n8n import 容器启动时通过 `03-setup-n8n-owner.sh` 自动替换为实际 ID

## 4. Fields to DELETE (not replace)

| 字段 | 位置 | 说明 |
|------|------|------|
| 顶层 `id` | `$.id` | n8n 导入时自动分配。**但**：现有模板保留了语义 ID（如 `wf_cn_rawcollect_01`），新模板可沿用此模式或删除 |

**不要删除**：
- 节点级 `id`（`$.nodes[*].id`）—— 这些是稳定的 UUID，跨环境不变
- `versionId` —— 保留原值

## 5. Fields NOT to Replace

以下字段在所有环境中相同，不应替换：

| 字段 | 说明 |
|------|------|
| `credentials.*.name` | 凭据名称各环境统一 |
| `nodes[*].type` | 节点类型（如 `n8n-nodes-base.httpRequest`） |
| `nodes[*].typeVersion` | 节点版本号 |
| `settings` | 工作流设置（如 `executionOrder`） |
| `pinData` | 固定测试数据 |
| `active` | 激活状态（模板中统一为 `false`） |
| `connections` | 节点连接关系 |
| `nodes[*].position` | 节点在画布上的位置 |
| Docker 内部 URL | `http://mj-app:8000/...` 是 Docker Compose 服务名 |

## 6. Render Script Substitution Order

渲染脚本 `scripts/render_n8n_workflows.py` 中 `render_workflow()` 函数的替换顺序：

1. `{{ENV_PREFIX}}` → `config["environment"]["prefix"]`
2. `{{ENV_TAG}}` → `config["environment"]["tag"]`
3. `{{ENV_NAME}}` → `config["environment"]["name"]`
4. `{{WECHAT_WEBHOOK_URL}}` → `config["notifications"]["wechat_webhook_url"]`
5. `{{TRIGGER_CRON_*}}` → 正则匹配 `\{\{TRIGGER_CRON_(\w+)\}\}`，从 `config["triggers"]` 中按前缀查找 `.cron`
6. `{{TRIGGER_INTERVAL_*}}` → 正则匹配 `\{\{TRIGGER_INTERVAL_(\w+)\}\}`，从 `config["triggers"]` 中按前缀查找 `.interval_minutes`

替换完成后验证：
- 使用正则 `\{\{[A-Z][A-Z0-9_]+\}\}` 检查是否有未解析的占位符
- `json.loads()` 验证结果是合法 JSON

## 7. Trigger Name Matching Logic

渲染脚本使用前缀匹配来关联占位符名称与配置键：

```python
# Match by prefix: MissingDataNotification matches MissingDataNotification-Schedule
if key.startswith(workflow_name) or workflow_name.startswith(key):
    return trigger_config.get("cron", match.group(0))
```

因此占位符名称与 YAML 配置键的对应关系：

| 占位符中的 Name | YAML triggers 键 | 匹配方式 |
|----------------|------------------|---------|
| `MissingDataNotification` | `MissingDataNotification-Schedule` | key.startswith(name) |
| `RawDataCollection` | `RawDataCollection-Scheduled` | key.startswith(name) |

命名建议：占位符名取 workflow 目录名中 `-TriggerType` 之前的部分。

## 8. Environment Config Reference

`n8n/workflows/_config/dev.yaml` 示例结构：

```yaml
environment:
  prefix: DEV                    # → {{ENV_PREFIX}}
  tag: "env:dev"                 # → {{ENV_TAG}}
  name: dev                      # → {{ENV_NAME}}

notifications:
  wechat_webhook_url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
                                 # → {{WECHAT_WEBHOOK_URL}}

triggers:
  MissingDataNotification-Schedule:
    cron: "0 11,17,21,23 * * *"  # → {{TRIGGER_CRON_MissingDataNotification}}
    timezone: "Asia/Shanghai"
  RawDataCollection-Scheduled:
    interval_minutes: 30         # → {{TRIGGER_INTERVAL_RawDataCollection}}
```

新增 workflow 后，需要在三个环境配置文件中都添加对应的 trigger 配置（如果该 workflow 使用了 trigger 占位符）。
