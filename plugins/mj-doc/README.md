# mj-doc

MJ System 文档工作流技能家族 — 提供文档规划、编写、校验、迁移、同步和审查能力。

## Skills

| Skill | 命令 | 触发场景 |
|-------|------|---------|
| author | `/mj-doc:author` | 编写 GUIDE/RUNBOOK/ADR/SPEC/POSTMORTEM/STANDARD |
| migrate | `/mj-doc:migrate` | 将旧格式文档迁移为 Framework v4 |
| plan | `/mj-doc:plan` | 评估文档需求、规划多文档工作 |
| review | `/mj-doc:review` | PR 文档质量审查 |
| sync | `/mj-doc:sync` | 代码变更后同步文档 |
| validate | `/mj-doc:validate` | 校验文档格式合规性 |

## 安装

```bash
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install mj-doc@mj-agentlab-marketplace
```

## 依赖

无 MCP Server 依赖。纯指令型技能。

## 许可证

MIT
