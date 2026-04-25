# CLAUDE.md — mj-sys-n8n Plugin

## Plugin 概述

mj-sys-n8n 是 MJ System 的 n8n 工作流技能家族 Plugin，提供 7 个 skill：

| Skill | 命令 | 职责 |
|-------|------|------|
| **plan** | `/mj-sys-n8n:mj-sys-n8n-plan` | 工作流需求分析、命名规范、节点规划 |
| **author** | `/mj-sys-n8n:mj-sys-n8n-author` | 从零生成 workflow JSON（不用 n8n UI） |
| **template** | `/mj-sys-n8n:mj-sys-n8n-template` | 将导出 JSON 转换为模板（占位符替换） |
| **config** | `/mj-sys-n8n:mj-sys-n8n-config` | 配置触发器参数（cron/interval → YAML） |
| **doc** | `/mj-sys-n8n:mj-sys-n8n-doc` | 生成 workflow README.md / CHANGELOG.md |
| **render** | `/mj-sys-n8n:mj-sys-n8n-render` | 渲染模板为环境 JSON + 验证占位符 |
| **promote** | `/mj-sys-n8n:mj-sys-n8n-promote` | 环境晋升（DEV→TEST→PROD）+ 回滚 |

## MCP 依赖

本 plugin 通过 `.mcp.json` 自动注册 1 个 MCP server：

- **n8n-docs**: 公共 HTTP 端点（n8n 节点文档查询），无需凭据

## Skill 调用约定

- 生命周期链：`plan` → `author`/`template` → `config` → `doc` → `render` → `promote`
- Path A（从零创建）：`plan` → `author` → `config` → `doc` → `render` → `promote`
- Path B（从 UI 导出）：`plan` → `template` → `config` → `doc` → `render` → `promote`

## 文件结构

```
skills/
├── mj-sys-n8n-author/     # 编写技能 + node-patterns.md
├── mj-sys-n8n-config/     # 配置技能 + trigger-reference.md
├── mj-sys-n8n-doc/        # 文档技能
├── mj-sys-n8n-plan/       # 规划技能 + naming-reference.md
├── mj-sys-n8n-promote/    # 晋升技能 + promotion-checklist.md
├── mj-sys-n8n-render/     # 渲染技能
└── mj-sys-n8n-template/   # 模板技能 + placeholder-reference.md
```
