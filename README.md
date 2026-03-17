# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

MJ System 团队插件市场 — 提供文档、Git、n8n、运维等 Claude Code 插件。

## 插件目录

| Plugin | 描述 | Skills | Version |
|--------|------|--------|---------|
| **mj-doc** | 文档工作流：规划、编写、校验、迁移、同步、审查 | 7 | 1.0.0 |
| **mj-git** | Git 工作流：分支、提交、推送、PR、Review、同步、清理 | 9 | 1.0.0 |
| **mj-n8n** | n8n 工作流：设计、编写、模板、配置、文档、渲染、晋升 | 7 | 1.0.0 |
| **mj-ops** | 运维操作：环境搭建/清理、ETL 触发 | 4 | 1.0.0 |

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

## 版本管理

- Marketplace 和各 Plugin 独立版本管理
- 变更日志详见 [CHANGELOG.md](CHANGELOG.md)
- 发布流程和贡献指引详见 [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## 许可证

MIT
