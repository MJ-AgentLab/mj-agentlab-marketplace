---
name: mj-sys-n8n-config
description: This skill adds trigger configuration entries to n8n environment YAML files (_config/dev.yaml, test.yaml, production.yaml), handling cron expressions, interval minutes, and environment-specific parameters with format validation. It should be invoked when configuring triggers for a new workflow or updating existing trigger parameters in MJ System. Triggers on "配置n8n触发器", "n8n config", "yaml配置", "添加cron", "环境配置", "trigger configuration", "n8n yaml", "配置调度", "定时任务配置", "n8n环境参数".
---

# mj-sys-n8n-config Skill

## Overview

本技能为新工作流添加环境配置条目到 YAML 配置文件（`_config/dev.yaml`、`test.yaml`、`production.yaml`）。这些配置驱动渲染脚本的占位符替换——每个工作流的触发参数、通知 URL 和环境元数据都在此定义。

配置文件路径：
- `n8n/workflows/_config/dev.yaml`
- `n8n/workflows/_config/test.yaml`
- `n8n/workflows/_config/production.yaml`

## Prerequisites

在使用本技能前，请确认以下条件：

1. **工作流模板已存在于 `_base/` 目录**：`workflow.json` 模板文件必须已经创建。如果尚未创建，请先使用 `/mj-sys-n8n-template` 或 `/mj-sys-n8n-author` 完成模板编写。
2. **已知工作流的 TriggerType 和目录名称**：需要明确工作流的触发类型（Cron、Interval、DBTrigger、Webhook、Manual）和 `_base/` 下的目录路径。

## Main Workflow

### Step 1 — 确定触发类型

读取 `_base/` 中的 `workflow.json` 模板文件，扫描占位符以推断触发类型：

- `{{TRIGGER_CRON_*}}` 存在 → **Cron 类型**（定时调度）
- `{{TRIGGER_INTERVAL_*}}` 存在 → **Interval 类型**（间隔调度）
- 两者均不存在（DBTrigger / Webhook / Manual）→ **无需 trigger 配置**（仅使用 environment/notifications 占位符，这些已在基础 YAML 中定义）

扫描命令参考：
```bash
grep -oP '\{\{TRIGGER_CRON_[^}]+\}\}' n8n/workflows/_base/{Category}/{Name}/workflow.json
grep -oP '\{\{TRIGGER_INTERVAL_[^}]+\}\}' n8n/workflows/_base/{Category}/{Name}/workflow.json
```

### Step 2 — 读取现有 YAML

读取全部 3 个配置文件，了解当前结构和已有条目：

- `n8n/workflows/_config/dev.yaml`
- `n8n/workflows/_config/test.yaml`
- `n8n/workflows/_config/production.yaml`

当前 YAML 结构示例：

```yaml
environment:
  prefix: DEV          # 或 TEST, PROD
  tag: "env:dev"       # 或 env:test, env:production
  name: dev            # 或 test, production

notifications:
  wechat_webhook_url: "https://qyapi.weixin.qq.com/..."

triggers:
  WorkflowName-TriggerType:
    cron: "0 11,17,21,23 * * *"
    timezone: "Asia/Shanghai"
  AnotherWorkflow-Scheduled:
    interval_minutes: 30
```

注意 `environment` 和 `notifications` 部分是所有工作流共享的基础配置，无需修改。只需在 `triggers` 部分添加新条目。

### Step 3 — 生成配置条目

根据 Step 1 确定的触发类型，生成对应的 YAML 配置片段：

**Cron 类型：**
```yaml
triggers:
  {Name}-{TriggerType}:
    cron: "{cron_expression}"
    timezone: "Asia/Shanghai"
```

**Interval 类型：**
```yaml
triggers:
  {Name}-{TriggerType}:
    interval_minutes: {N}
```

**DBTrigger / Webhook / Manual 类型：**
无需添加 trigger 条目。通知用户 environment/notifications 占位符已由现有 YAML 基础条目覆盖。跳至 Step 6 输出说明。

### Step 4 — 展示配置预览

向用户展示将要插入到全部 3 个文件中的 YAML 片段。重点确认：

- **Cron 表达式的含义**：用人类可读的方式解释（例如 `0 11,17 * * *` = 每天 11:00 和 17:00 执行）
- **各环境是否使用相同频率**：询问 dev/test/production 是否需要不同的触发频率
- **配置 key 名称**：确认与工作流目录名完全匹配

示例预览输出：

```
即将添加以下配置到 3 个环境文件：

  triggers:
    MissingDataNotification-Schedule:
      cron: "0 11,17 * * *"
      timezone: "Asia/Shanghai"

含义：每天 11:00 和 17:00 执行
目标文件：dev.yaml, test.yaml, production.yaml

请确认是否正确？各环境是否使用相同的调度频率？
```

### Step 5 — 写入 YAML

将 trigger 条目追加到全部 3 个配置文件的 `triggers:` 部分。

写入规则：
- 使用 2 空格缩进（YAML 标准）
- 禁止使用 Tab 字符
- 新条目追加到 `triggers:` 部分末尾
- 保持与现有条目的格式一致
- 如果用户要求各环境使用不同频率，分别写入对应值

### Step 6 — 验证

执行以下验证检查：

1. **YAML 语法正确性**：确认无 Tab 字符、缩进正确、格式合法
2. **Key 名称匹配**：验证 trigger key 与工作流目录名完全一致（区分大小写）
3. **production.yaml Webhook URL 检查**：如果 `wechat_webhook_url` 仍包含 `REPLACE_WITH_PROD_KEY` 占位符，发出警告

验证命令参考：
```bash
# 检查 YAML 语法（使用 Python）
python -c "import yaml; yaml.safe_load(open('n8n/workflows/_config/dev.yaml'))"
python -c "import yaml; yaml.safe_load(open('n8n/workflows/_config/test.yaml'))"
python -c "import yaml; yaml.safe_load(open('n8n/workflows/_config/production.yaml'))"

# 检查 Tab 字符
grep -P '\t' n8n/workflows/_config/*.yaml
```

## YAML Key 与占位符匹配规则

渲染脚本使用**前缀匹配**查找配置条目。占位符中的名称不含 TriggerType 后缀（因为正则 `\w+` 不匹配连字符 `-`），而 YAML key 使用完整目录名。

| 组件 | 值 | 说明 |
|------|-----|------|
| 目录路径 | `_base/CollectionNodes/MissingDataNotification-Schedule/` | 工作流目录 |
| YAML key | `MissingDataNotification-Schedule` | 完整目录名（含 TriggerType 后缀） |
| 模板占位符 | `{{TRIGGER_CRON_MissingDataNotification}}` | 仅工作流名称（不含后缀） |
| 匹配过程 | 占位符提取 `MissingDataNotification` → 前缀匹配 YAML key `MissingDataNotification-Schedule` | 渲染脚本自动关联 |

渲染脚本从占位符中提取触发器名称（例如 `{{TRIGGER_CRON_RawDataCollection}}` 提取 `RawDataCollection`），然后通过前缀匹配在 YAML 中查找 `triggers.RawDataCollection-Scheduled` 条目。

## Human Intervention Points

| # | 触发条件 | 行为 |
|----|----------|------|
| H1 | Cron 表达式需要确认 | 展示人类可读的含义（例如 `0 11,17 * * *` = 每天 11:00 和 17:00），请求用户确认 |
| H2 | 各环境可能需要不同调度频率 | 询问 dev/test/production 是否使用相同的 trigger 频率 |
| H3 | production.yaml Webhook URL 仍为占位符 | 警告："生产环境 Webhook URL 仍为占位符，部署前需要替换为真实密钥" |
| H4 | DBTrigger 类型，无需 trigger 配置 | 通知："DBTrigger 类型无需 trigger 配置，环境参数已由基础 YAML 条目覆盖" |

## Output & Handoff

任务完成后输出以下摘要：

```
环境配置完成 ✓
  已更新：dev.yaml、test.yaml、production.yaml
  触发类型：{Cron/Interval/无需配置}
  配置 key：{WorkflowName-TriggerType}
下一步：使用 /mj-sys-n8n-doc 编写工作流文档。
```

如果是 DBTrigger/Webhook/Manual 类型（无需配置），输出：

```
环境配置检查完成 ✓
  触发类型：DBTrigger（事件驱动）
  无需添加 trigger 配置条目
  环境参数（ENV_PREFIX、ENV_TAG、ENV_NAME、WECHAT_WEBHOOK_URL）已由基础 YAML 覆盖
下一步：使用 /mj-sys-n8n-doc 编写工作流文档。
```

## Reference

详细的触发器配置参考（cron 语法、常用表达式、环境差异等）请查阅：

→ `trigger-reference.md`
