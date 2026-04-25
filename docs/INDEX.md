# Documentation Index — MJ AgentLab Marketplace

Navigation hub for all marketplace documentation.

## Guides

| Document | Description |
|----------|-------------|
| [Marketplace Project Overview](<./[GUIDE]_Marketplace_Project_Overview.md>) | 项目架构、插件目录、CI/CD 体系、开发环境搭建 |
| [Plugin Development Testing Workflow](<./[GUIDE]_Plugin_Development_Testing_Workflow.md>) | 跨仓库插件开发测试的三阶段工作流 |
| [Version Management](<./[GUIDE]_Version_Management.md>) | 双层版本架构、bump 工具、CHANGELOG 规范 |

## Runbooks

| Document | Description |
|----------|-------------|
| [Release Operations](<./[RUNBOOK]_Release_Operations.md>) | 从开发到发布的完整操作流程 |

## Contributing

| Document | Description |
|----------|-------------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 分支策略、提交规范、版本管理、发布流程 |

## Plugin References

| Resource | Location |
|----------|----------|
| **Plugin Secrets Setup** (mj-sys-ops) | `plugins/mj-sys-ops/config/secrets-ops.example` + `plugins/mj-sys-ops/scripts/setup-ops-env.ps1` |
| **Plugin Secrets Setup** (mj-sys-git) | `plugins/mj-sys-git/config/secrets-git.example` + `plugins/mj-sys-git/scripts/setup-git-env.ps1` |

> 各插件的 README.md 和 CLAUDE.md 包含完整的 Secrets 配置说明。

## Suggested Reading Order

### New Team Members

1. [Marketplace Project Overview](<./[GUIDE]_Marketplace_Project_Overview.md>) — 了解整体架构
2. [CONTRIBUTING.md](./CONTRIBUTING.md) — 了解贡献规范
3. [Version Management](<./[GUIDE]_Version_Management.md>) — 了解版本体系

### Plugin Developers

1. [Marketplace Project Overview](<./[GUIDE]_Marketplace_Project_Overview.md>) — 插件结构和技能链
2. [Plugin Development Testing Workflow](<./[GUIDE]_Plugin_Development_Testing_Workflow.md>) — 开发测试流程
3. [CONTRIBUTING.md](./CONTRIBUTING.md) — 提交和 PR 规范

### Release Managers

1. [Version Management](<./[GUIDE]_Version_Management.md>) — bump 工具和 CHANGELOG
2. [Release Operations](<./[RUNBOOK]_Release_Operations.md>) — 发布操作手册
