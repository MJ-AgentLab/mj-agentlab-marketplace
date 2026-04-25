# mj-sys-n8n

MJ System n8n 工作流技能家族 — 提供工作流设计、编写、模板、配置、文档、渲染和晋升能力。

## Skills

| Skill | 命令 | 触发场景 |
|-------|------|---------|
| plan | `/mj-sys-n8n:mj-sys-n8n-plan` | 新工作流需求分析、命名规划 |
| author | `/mj-sys-n8n:mj-sys-n8n-author` | 从零生成 workflow JSON |
| template | `/mj-sys-n8n:mj-sys-n8n-template` | 导出 JSON 转模板 |
| config | `/mj-sys-n8n:mj-sys-n8n-config` | 配置触发器参数 |
| doc | `/mj-sys-n8n:mj-sys-n8n-doc` | 生成工作流文档 |
| render | `/mj-sys-n8n:mj-sys-n8n-render` | 渲染模板为环境 JSON |
| promote | `/mj-sys-n8n:mj-sys-n8n-promote` | 环境晋升 DEV→TEST→PROD |

## 安装

```bash
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install mj-sys-n8n@mj-agentlab-marketplace
```

## 前置条件

无需额外配置。n8n-docs MCP 为公共 HTTP 端点，自动注册。

## 许可证

MIT
