# Validation Rules Reference

## A1: Frontmatter Required Fields

**Universal (7 fields)**: `tags`, `aliases`, `date`, `updated`, `version`, `status`, `owner`

**RUNBOOK additional**: `last-verified` (required per §5.2)

Pass: All required fields present and non-empty.

## A2: Filename Regex Patterns

```python
# docs/ files
DOCS_PATTERN = r'^\[(?:GUIDE|ADR|SPEC|RUNBOOK|POSTMORTEM|STANDARD|DEPRECATED)\](?:_\[[A-Z]+\])?(?:_[A-Za-z0-9]+)+(?:_v\d+\.\d+)?\.md$'

# Root special files
ROOT_PATTERN = r'^(README|CONTRIBUTING|CHANGELOG|GLOSSARY|CLAUDE)\.md$'

# Templates and indexes
TEMPLATE_PATTERN = r'^(TEMPLATE_[A-Z]+|INDEX)\.md$'
```

## A3: Line Count Ranges

| Type | Min | Max |
|------|-----|-----|
| README | 200 | 500 |
| `[GUIDE]` | 100 | 800 |
| `[ADR]` | 50 | 200 |
| `[SPEC]` | 200 | 1500 |
| CONTRIBUTING | 100 | 500 |
| `[RUNBOOK]` | 50 | 500 |
| `[POSTMORTEM]` | 100 | 500 |
| `[STANDARD]` | 100 | 1000 |
| GLOSSARY | 50 | 500 |
| CHANGELOG | — | — (skip) |
| INDEX | — | — (skip) |
| TEMPLATE | — | — (skip) |

## A4: Tense Word Lists

**Past tense markers** (expected in ADR, POSTMORTEM, CHANGELOG):
- Imperative verbs should NOT appear: 将要, 计划, 建议, 预计, 拟, 即将, 打算, 准备

**Imperative markers** (expected in RUNBOOK steps):
- Step lines should start with: 执行, 检查, 运行, 确认, 验证, 打开, 连接, 停止, 创建, 删除, 配置, 修改, 更新, 查看, 备份, 恢复, 重启, 部署

**Type → tense mapping**:
| Type | Expected Tense | Check |
|------|---------------|-------|
| `[ADR]`, `[POSTMORTEM]` | Past | Flag future-tense words |
| `[RUNBOOK]` | Imperative | Verify step lines use imperative verbs |
| `[SPEC]` | Future/ongoing | No check |
| README, `[GUIDE]`, GLOSSARY | Present | No check |
| CHANGELOG | Past | Flag future-tense words |

## SA1: MUST NOT One-Liners Per Type

| Type | MUST NOT contain |
|------|-----------------|
| README | 选型理由, 详细安装步骤, API 参数, 分支策略, 生产故障排查, 代码示例, 详细部署, 进度清单 |
| `[GUIDE]` | 架构决策讨论, 生产故障排查步骤, 代码规范和审查标准 |
| `[ADR]` | 详细技术实现方案, 操作步骤, >10行代码片段 |
| `[SPEC]` | 决策结论不含讨论, 线上操作步骤, 变更记录 |
| `[RUNBOOK]` | 事故根因分析, 系统设计理由, 解释性描述 |
| `[POSTMORTEM]` | 个人指责, 操作教程, 完整架构描述 |
| `[STANDARD]` | 逐步操作教程, 架构决策详细讨论 |
| CONTRIBUTING | 开发环境搭建, 项目功能描述, 架构决策 |

Edge cases → output WARN with §7.3 citation, not FAIL.

## SA2: §6.3 Authority Source Table

| Info Type | Authority Source |
|-----------|-----------------|
| 项目概述与技术栈 | README |
| 架构决策 Why | `[ADR]` |
| 特性设计 How | `[SPEC]` |
| 接口参数 | Swagger UI |
| 开发流程规范 | CONTRIBUTING |
| 术语定义 | GLOSSARY |
| 事故根因 | `[POSTMORTEM]` |
| 操作步骤 | `[RUNBOOK]` |
| 版本变更 | CHANGELOG |

If doc contains detailed info matching another type's authority, flag as duplicate.
Exception: CLAUDE.md controlled duplication (§8).

## SA3: Production Command Patterns

Flag these in `[GUIDE]` documents:
```
ssh, kubectl, psql -h production, psql -h prod,
docker exec.*prod, systemctl.*prod, pg_dump.*prod
```

For full Framework v4 rules: `docs/rule/[STANDARD]_Documentation_Management_Framework_v4.md`
