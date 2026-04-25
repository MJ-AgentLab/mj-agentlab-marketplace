---
name: mj-sys-n8n-render
description: This skill executes the rendering pipeline — transforming _base/ templates plus _config/ YAML configurations into environment-specific JSON files under dev/, test/, and production/ directories, then validating output for placeholder residuals and JSON syntax. It should be invoked when rendering workflow templates or verifying rendered output in MJ System. Triggers on "渲染n8n", "n8n render", "验证workflow", "检查占位符", "渲染工作流", "render workflow", "verify n8n", "n8n验证", "占位符检查", "生成环境JSON".
---

# mj-sys-n8n-render Skill

## Overview

本技能执行渲染管线——将 `_base/` 模板 + `_config/` YAML 配置转换为 `dev/`、`test/`、`production/` 目录下的环境特定 JSON 文件。同时验证输出文件的占位符残留和 JSON 合法性。

渲染脚本路径：`scripts/render_n8n_workflows.py`
模板目录：`n8n/workflows/_base/{Category}/{WorkflowName}/workflow.json`
配置目录：`n8n/workflows/_config/{dev,test,production}.yaml`
输出目录：`n8n/workflows/{dev,test,production}/{Category}/{WorkflowName}/`

## Prerequisites

在执行渲染前，请确认以下条件：

1. **模板文件存在**：`_base/` 目录下对应工作流的 `workflow.json` 模板已创建
2. **配置文件就绪**：`_config/dev.yaml`、`_config/test.yaml`、`_config/production.yaml` 已包含该工作流所需的全部 trigger 条目（如有 Cron/Interval 占位符）
3. **Python 环境可用**：渲染脚本依赖标准库 + PyYAML（`import yaml`）（推荐通过 `uv run python` 调用，避免 Windows Store 占位符问题）

## Main Workflow

### Step 1 — 渲染所有环境

执行渲染脚本，将模板 + 配置转换为环境特定 JSON：

```bash
uv run python scripts/render_n8n_workflows.py all
```

此命令处理 `_base/` 下所有工作流模板，分别输出到 `dev/`、`test/`、`production/` 目录。

如需渲染单个环境：
```bash
uv run python scripts/render_n8n_workflows.py dev
uv run python scripts/render_n8n_workflows.py test
uv run python scripts/render_n8n_workflows.py production
```

输出文件命名规则：`{ENV_PREFIX}-{Category}-{WorkflowDirName}.json`（例如 `DEV-CollectionNodes-MissingDataNotification-Schedule.json`）

### Step 2 — 检查占位符残留

搜索渲染输出中是否存在未替换的 `{{...}}` 占位符：

```bash
grep -r "{{[A-Z]" n8n/workflows/dev/ n8n/workflows/test/ n8n/workflows/production/
```

**预期结果**：无任何匹配。任何匹配都表示 `_config/` YAML 缺少对应条目或占位符名称有拼写错误。

### Step 3 — 验证 JSON 合法性

确认所有渲染文件都是合法 JSON：

```bash
uv run python -c "import json, pathlib; [json.loads(f.read_text(encoding='utf-8')) for f in pathlib.Path('n8n/workflows').rglob('*.json') if f.parts[2] in ('dev','test','production')]"
```

如果抛出 `JSONDecodeError`，说明模板中存在语法错误（括号不匹配、尾部逗号等）。

### Step 4 — Verify 模式（推荐）

对比当前已渲染文件与脚本重新渲染的预期结果，执行语义 JSON 比较（忽略 key 顺序和空白差异）：

```bash
uv run python scripts/render_n8n_workflows.py --verify dev
uv run python scripts/render_n8n_workflows.py --verify test
uv run python scripts/render_n8n_workflows.py --verify production
```

输出 `OK` 表示一致，`DIFF` 表示已渲染文件过时需要重新渲染，`MISSING` 表示输出文件不存在。

### Step 5 — 报告结果

统计各环境渲染的工作流数量，汇总验证结果：

```
渲染验证完成 ✓
  dev/:        N 个工作流 ✓
  test/:       N 个工作流 ✓
  production/: N 个工作流 ✓
  占位符残留:   无 ✓
  JSON 合法性:  全部通过 ✓
  Verify 模式:  全部一致 ✓
```

## Troubleshooting

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `{{TRIGGER_CRON_X}}` 未替换 | YAML 中缺少 trigger 条目 | 在 `_config/*.yaml` 中添加对应条目（使用 `/mj-sys-n8n-config`） |
| `{{WECHAT_WEBHOOK_URL}}` 未替换 | YAML 缺少 notifications 部分 | 检查 `_config/*.yaml` 是否包含 `notifications.wechat_webhook_url` |
| JSON parse error | 模板语法错误 | 检查 `_base/` 模板中的括号匹配、尾部逗号等问题 |
| Verify 显示 DIFF | 已渲染文件过时 | 重新执行 `uv run python scripts/render_n8n_workflows.py all` |
| Script not found | 工作目录不正确 | 从项目根目录执行（`scripts/` 目录所在位置） |
| exit code 49 / 脚本未执行 | Windows Store stub 拦截 bare `python` 命令 | 使用 `uv run python` 调用 |

## Human Intervention Points

| # | 触发条件 | 行为 |
|----|----------|------|
| H1 | 渲染脚本报告未解析的占位符 | 展示错误详情，定位问题来源（`_base/` 模板或 `_config/` YAML） |
| H2 | JSON 验证失败 | 展示解析错误位置，引导用户修复模板 |
| H3 | Verify 显示 DIFF | 展示差异内容，询问用户是否重新渲染并覆盖 |

## Output & Handoff

任务完成后输出以下摘要：

```
渲染验证完成 ✓
  dev/:        N 个工作流 ✓
  test/:       N 个工作流 ✓
  production/: N 个工作流 ✓
  占位符残留:   无 ✓
  JSON 合法性:  全部通过 ✓
下一步：使用 /mj-sys-n8n-promote 进行 DEV 环境测试验证。
```

## Render Script Reference

- **脚本路径**：`scripts/render_n8n_workflows.py`
- **输入**：`n8n/workflows/_base/` 模板 + `n8n/workflows/_config/` YAML
- **输出**：`n8n/workflows/{dev,test,production}/` 渲染后的 JSON
- **替换顺序**：ENV_PREFIX -> ENV_TAG -> ENV_NAME -> WECHAT_WEBHOOK_URL -> TRIGGER_CRON_* -> TRIGGER_INTERVAL_*
- **输出文件命名**：`{ENV_PREFIX}-{Category}-{WorkflowDirName}.json`
- **验证模式**：`--verify {env}` 执行语义 JSON 比较（`json.loads()` 后对比，忽略 key 顺序）
