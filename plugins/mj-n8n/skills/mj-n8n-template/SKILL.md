---
name: template
description: This skill converts n8n UI-exported workflow JSON into environment-agnostic _base/ templates (Path A), replacing environment-specific values with placeholders and cleaning up credential IDs. The output templates are not valid JSON by design — they contain double-brace placeholders that the render script substitutes per environment. It should be invoked when processing exported workflow JSON in MJ System. Triggers on "转换n8n模板", "创建workflow模板", "n8n template", "占位符替换", "导出JSON转模板", "清理凭据ID", "n8n placeholder", "convert workflow json".
---

# MJ N8N Template — 导出 JSON 转环境无关模板

## Overview

本 Skill 处理 n8n workflow 生命周期中的 **Path A** —— 将从 n8n UI 导出的 JSON 转换为环境无关的 `_base/` 模板（含占位符）。产出的模板可通过渲染脚本 `scripts/render_n8n_workflows.py` 生成 dev/test/production 三套环境特定 JSON。

**核心原则**：模板文件不是合法 JSON（含 `{{...}}` 占位符），这是设计预期。渲染脚本执行字符串级替换后验证结果为合法 JSON。

## Prerequisites

- 用户已有导出的 JSON 文件（n8n UI "Download" 或粘贴内容）
- Category / Name / TriggerType 已确定（如未确定，提示用户先使用 `/mj-n8n-plan`，或直接询问）

## 参考文件布局

```
n8n/workflows/
├── _base/                                      ← 模板存放处（本 Skill 输出）
│   ├── CollectionNodes/
│   │   ├── MissingDataNotification-Schedule/
│   │   │   └── workflow.json                   ← 含占位符的模板
│   │   ├── RawDataArchiveNotification-DBTrigger/
│   │   │   └── workflow.json
│   │   └── RawDataCollection-Scheduled/
│   │       └── workflow.json
│   └── ProcessingNodes/
│       └── DataLoader-DBTrigger/
│           └── workflow.json
├── _config/                                    ← 环境配置
│   ├── dev.yaml
│   ├── test.yaml
│   └── production.yaml
├── dev/                                        ← 渲染输出
├── test/
└── production/
```

## Main Workflow

### Step 1 — 读取 JSON

解析用户提供的导出文件或粘贴的 JSON 内容。

- 如果用户给出文件路径 → 使用 `Read` 工具读取
- 如果用户粘贴了 JSON → 直接从对话中获取
- 验证是合法 JSON 且包含 n8n workflow 结构（必须有 `name`、`nodes`、`connections` 字段）

### Step 2 — 自动分析

扫描 JSON 中所有环境相关值，分类检测：

**2a. 顶层字段**
- `id`（顶层）：数字或字符串 ID → 需要**删除**（n8n 导入时自动分配）
- `name`：检查是否含环境前缀（`DEV-`、`TEST-`、`PROD-`）→ 替换为 `{{ENV_PREFIX}}-...`

**2b. Tags 数组**
- `tags[].name` 中匹配 `env:dev`、`env:test`、`env:production` → 替换为 `{{ENV_TAG}}`

**2c. Code 节点（`type: "n8n-nodes-base.code"`）**
- `jsCode` 中搜索 `environment:` 赋值，值为 `"dev"`、`"test"`、`"production"` → 替换为 `"{{ENV_NAME}}"`
- `jsCode` 中搜索 `workflowName:` 赋值含环境前缀 → 替换为含 `{{ENV_PREFIX}}` 的版本

**2d. HTTP Request 节点（`type: "n8n-nodes-base.httpRequest"`）**
- `url` 字段包含 `qyapi.weixin.qq.com/cgi-bin/webhook/send` → 替换为 `{{WECHAT_WEBHOOK_URL}}`
- 注意：`http://mj-app:8000/...` 是 Docker 内部 URL，**不替换**

**2e. Schedule Trigger 节点（`type: "n8n-nodes-base.scheduleTrigger"`）**
- `expression` 字段（cron 表达式）→ 替换为 `{{TRIGGER_CRON_{WorkflowName}}}`
- `minutesInterval` 字段（间隔分钟数）→ 替换为 `{{TRIGGER_INTERVAL_{WorkflowName}}}`
- WorkflowName 从目录名中提取（如 `MissingDataNotification` 从 `MissingDataNotification-Schedule`）

**2f. 凭据字段**
- 所有 `$.nodes[*].credentials.*.id` 中的数字字符串（如 `"7"`、`"12"`）→ 替换为 `"PLACEHOLDER"`

**2g. Execute Sub-workflow 节点（如存在）**
- 检查 `type: "n8n-nodes-base.executeWorkflow"` → 触发 **H2** 告警

### Step 3 — 展示替换计划

向用户展示所有检测到的替换，格式如下：

```
检测到以下需要替换的环境相关值：

1. [id] 顶层 ID "xxx"
   → 删除（n8n 导入时自动分配）

2. [name] "DEV-CollectionNodes-RawDataCollection-Scheduled"
   → "{{ENV_PREFIX}}-CollectionNodes-RawDataCollection-Scheduled"

3. [tags] "env:dev"
   → "{{ENV_TAG}}"

4. [Code 节点: Log_ExecutionResult] environment: "dev"
   → environment: "{{ENV_NAME}}"

5. [Code 节点: Log_ExecutionResult] workflowName: 'DEV-CollectionNodes-...'
   → workflowName: '{{ENV_PREFIX}}-CollectionNodes-...'

6. [HTTP 节点: Send_WeChatNotification] URL: "https://qyapi..."
   → "{{WECHAT_WEBHOOK_URL}}"

7. [Schedule Trigger] expression: "0 11,17,21,23 * * *"
   → "{{TRIGGER_CRON_MissingDataNotification}}"

8. [credentials] id: "7" → "PLACEHOLDER" (共 2 处)

确认以上替换？(Y/N)
```

### Step 4 — 执行替换

用户确认后，按以下顺序执行：

1. **删除**顶层 `id` 字段（如果存在）
2. **替换** `name` → `{{ENV_PREFIX}}-{Category}-{Name}-{TriggerType}`
3. **替换** tags 中环境标签 → `{{ENV_TAG}}`
4. **替换** Code 节点中 `environment` 值 → `{{ENV_NAME}}`
5. **替换** Code 节点中 `workflowName` 含环境前缀 → `{{ENV_PREFIX}}-...`
6. **替换** HTTP Request 节点中企微 URL → `{{WECHAT_WEBHOOK_URL}}`
7. **替换** Schedule Trigger 中 cron 表达式 → `{{TRIGGER_CRON_{Name}}}`
8. **替换** Schedule Trigger 中 interval → `{{TRIGGER_INTERVAL_{Name}}}`
9. **替换**所有 credential `id` 值 → `"PLACEHOLDER"`

**关键细节**:
- Cron 占位符保留在原始 `expression` 字段中（模板中不带 `=` 前缀，与现有模板一致）
- Interval 占位符直接替换数值（裸整数，不带引号）
- 对于 Code 节点中的 JS 字符串，占位符嵌入在 JS 字符串字面量中，如 `environment: '{{ENV_NAME}}'`

### Step 5 — 创建目录

目标路径：`n8n/workflows/_base/{Category}/{Name}-{TriggerType}/`

```
n8n/workflows/_base/CollectionNodes/RawDataCollection-Scheduled/
```

如果目录已存在且含 `workflow.json` → 触发 **H3**。

### Step 6 — 写入文件

保存为 `workflow.json`，使用 UTF-8 编码，缩进 2 空格。

### Step 7 — 验证

写入后执行以下检查：

**7a. 无残留环境值**
- Grep 检查文件中是否残留：
  - 硬编码 IP（除 `mj-app:8000`）
  - `env:dev` / `env:test` / `env:production` 字面量
  - 企微 Webhook URL 字面量（`qyapi.weixin.qq.com`）
  - 数字 credential ID（`"id": "数字"`，排除 UUID 格式和 `"PLACEHOLDER"`）

**7b. 占位符命名验证**
- 所有 `{{...}}` 占位符名称必须匹配渲染脚本识别的模式：
  - `{{ENV_PREFIX}}`、`{{ENV_TAG}}`、`{{ENV_NAME}}`、`{{WECHAT_WEBHOOK_URL}}`
  - `{{TRIGGER_CRON_\w+}}`、`{{TRIGGER_INTERVAL_\w+}}`

**7c. 预期非合法 JSON**
- 模板文件含 `{{...}}` 占位符，**不是合法 JSON** —— 这是设计预期
- 不要尝试 `json.loads()` 验证模板文件

**7d. 结构完整性**
- 确认 `nodes`、`connections`、`settings`、`tags` 字段存在
- 确认 `active` 设为 `false`（模板默认不激活）

## Placeholder Substitution Rules

| Placeholder | JSON 位置 | 替换说明 |
|-------------|----------|---------|
| `{{ENV_PREFIX}}` | `$.name`、Code 节点 `jsCode` 中 | 环境前缀字符串（DEV/TEST/PROD） |
| `{{ENV_TAG}}` | `$.tags[].name` | 环境标签（env:dev / env:test / env:production） |
| `{{ENV_NAME}}` | Code 节点 `jsCode` 中 | 环境名称小写（dev / test / production） |
| `{{WECHAT_WEBHOOK_URL}}` | HTTP Request 节点 `url` | 企微 Webhook 完整 URL |
| `{{TRIGGER_CRON_{Name}}}` | Schedule Trigger `expression` | Cron 表达式字符串 |
| `{{TRIGGER_INTERVAL_{Name}}}` | Schedule Trigger `minutesInterval` | 间隔分钟数（裸整数） |
| `"PLACEHOLDER"` | `$.nodes[*].credentials.*.id` | 字符串 "PLACEHOLDER" |

详细参考 → `placeholder-reference.md`

## Common Pitfalls

1. **模板不是合法 JSON** —— `{{TRIGGER_INTERVAL_*}}` 替换裸整数位置，含 `{{...}}` 后不是合法 JSON。这是设计预期，渲染脚本处理。

2. **顶层 `id` 必须删除** —— n8n 导入时自动分配 ID。但保留现有模板中的语义 ID（如 `wf_cn_rawcollect_01`）也是可接受的，因为导入器会覆盖。**观察现有模板**：现有 `_base/` 模板保留了顶层 `id`（语义 ID），新模板应遵循同样模式。如果导出 JSON 中的 `id` 是 n8n 自动分配的数字/随机 ID，替换为语义 ID（格式：`wf_{category_abbr}_{name_abbr}_{seq}`）。

3. **Cron 与 Interval 的区别** —— Cron 在 `expression` 字段（字符串），Interval 在 `minutesInterval` 字段（整数）。参见 `placeholder-reference.md`。

4. **Credential `id` 只替换值，不删除键** —— `"id": "PLACEHOLDER"` 保留结构完整性。credential `name` 不替换（各环境相同）。

5. **不要替换 Docker 内部 URL** —— `http://mj-app:8000/...` 是 Docker Compose 服务名，各环境相同。只替换外部环境相关 URL（企微 Webhook）。

6. **Code 节点中的多处替换** —— 一个 Code 节点的 `jsCode` 中可能同时包含 `workflowName`（含 `{{ENV_PREFIX}}`）和 `environment`（含 `{{ENV_NAME}}`），需要全部替换。

7. **n8n 表达式 `{{ }}` 与模板占位符 `{{ }}` 的区分** —— n8n 表达式如 `={{ $json.xxx }}` 中的 `{{ }}` 不是模板占位符。模板占位符命名格式为 `{{UPPER_CASE_NAME}}`（全大写+下划线），渲染脚本通过正则 `\{\{[A-Z][A-Z0-9_]+\}\}` 匹配。

## Human Intervention Points

| # | 触发条件 | 行为 |
|---|---------|------|
| H1 | JSON 中未检测到任何环境相关值 | 展示 JSON 结构概览，询问哪些值需要模板化 |
| H2 | 检测到 Execute Sub-workflow 节点 | 警告 sub-workflow ID 跨环境会变化，询问处理方式 |
| H3 | 目标目录已有 `workflow.json` | 询问是否覆盖 |
| H4 | Category / Name / TriggerType 未确定 | 提示使用 `/mj-n8n-plan`，或直接询问 |
| H5 | 检测到硬编码 IP 地址（非 `mj-app:8000`） | 警告并建议替换为 Docker 服务名或占位符 |

## 特殊情况处理

### 导出 JSON 来自不同 n8n 版本

- n8n 导出格式可能因版本不同而有微小差异（如 `typeVersion` 值不同）
- 本 Skill 不校验版本兼容性，仅处理占位符替换
- 如发现陌生字段，保留不动

### JSON 已经是模板（含 `{{...}}`）

- 如果输入 JSON 已包含 `{{ENV_PREFIX}}` 等占位符，说明这不是原始导出 JSON
- 告知用户这似乎已是模板，询问是否仍要继续处理

### 多个相同类型 Trigger 节点

- 如果存在多个 Schedule Trigger 节点，为每个生成独立的占位符名
- 占位符名加后缀区分：`{{TRIGGER_CRON_Name1}}`、`{{TRIGGER_CRON_Name2}}`

## Output & Handoff

```
模板创建完成
  路径：n8n/workflows/_base/{Category}/{Name}-{TriggerType}/workflow.json
  占位符数：N 个
  已删除字段：id（顶层）/ 无（保留语义 ID）
  凭据清理：M 个 credential ID → PLACEHOLDER
下一步：
  1. 使用 /mj-n8n-config 配置环境触发器参数（Cron/Interval → 必须配置；DBTrigger/Webhook/Manual → 跳过此步）
  2. 使用 /mj-n8n-doc 生成工作流 README.md 和 CHANGELOG.md
  3. 使用 /mj-n8n-render 渲染并验证各环境文件
  4. 使用 /mj-n8n-promote 执行 DEV 测试 → TEST → PROD 晋升
```

## 现有模板示例

参考已有 `_base/` 模板了解期望格式：

- **DB Trigger 类型**：`n8n/workflows/_base/CollectionNodes/RawDataArchiveNotification-DBTrigger/workflow.json`
  - 占位符：`{{ENV_PREFIX}}`、`{{ENV_TAG}}`、`{{ENV_NAME}}`、`{{WECHAT_WEBHOOK_URL}}`、`"PLACEHOLDER"`
- **Schedule (cron) 类型**：`n8n/workflows/_base/CollectionNodes/MissingDataNotification-Schedule/workflow.json`
  - 占位符：同上 + `{{TRIGGER_CRON_MissingDataNotification}}`
- **Schedule (interval) 类型**：`n8n/workflows/_base/CollectionNodes/RawDataCollection-Scheduled/workflow.json`
  - 占位符：同上 + `{{TRIGGER_INTERVAL_RawDataCollection}}`

## Reference

- **placeholder-reference.md** — 完整占位符清单、替换前后对比、渲染脚本替换顺序
- **渲染脚本**：`scripts/render_n8n_workflows.py`
- **环境配置**：`n8n/workflows/_config/{dev,test,production}.yaml`
