# MJ AgentLab Marketplace

MJ System 团队插件市场 — 提供文档、Git、n8n、运维等 Claude Code 插件。

## 插件目录

| Plugin | 描述 | Skills |
|--------|------|--------|
| **mj-doc** | 文档工作流：规划、编写、校验、迁移、同步、审查 | 7 |
| **mj-git** | Git 工作流：分支、提交、推送、PR、Review、同步、清理 | 9 |
| **mj-n8n** | n8n 工作流：设计、编写、模板、配置、文档、渲染、晋升 | 7 |
| **mj-ops** | 运维操作：环境搭建/清理、ETL 触发 | 4 |

## 安装

```bash
# 1. 注册 marketplace
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace

# 2. 安装所需 plugin
/plugin install mj-doc@mj-agentlab-marketplace
/plugin install mj-git@mj-agentlab-marketplace
/plugin install mj-n8n@mj-agentlab-marketplace
/plugin install mj-ops@mj-agentlab-marketplace
```

## 更新

```bash
/plugin update mj-doc@mj-agentlab-marketplace
```

## 许可证

MIT
