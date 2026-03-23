# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-1.2.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
[![CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/workflows/ci.yml)

MJ System 团队的 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 插件市场 — 集中管理和分发文档、Git、n8n、运维等领域的自动化技能。

4 个插件，26 个技能，覆盖从文档编写到环境搭建的完整开发工作流。

## 插件目录

| Plugin | 描述 | Skills | Version | 前置条件 |
|--------|------|--------|---------|----------|
| [**mj-doc**](plugins/mj-doc/README.md) | 文档工作流：规划、编写、校验、迁移、同步、审查 | 6 | 1.1.0 | — |
| [**mj-git**](plugins/mj-git/README.md) | Git 工作流：分支、提交、推送、PR、Review、同步、清理 | 9 | 1.1.0 | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| [**mj-n8n**](plugins/mj-n8n/README.md) | n8n 工作流：设计、编写、模板、配置、文档、渲染、晋升 | 7 | 1.1.0 | — |
| [**mj-ops**](plugins/mj-ops/README.md) | 运维操作：环境搭建/清理、ETL 触发 | 4 | 1.2.0 | `SSH_SERVER_*_PASSWORD` |

## 安装

> 前提：已安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)。

### 1. 注册 Marketplace

```
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
```

### 2. 安装插件

Claude Code 插件支持三种安装级别：

| 级别 | 命令 flag | 配置文件 | 共享 | 适用场景 |
|------|-----------|----------|------|----------|
| 用户级 | （默认） | `~/.claude/settings.json` | 否 | 个人常用插件，跨项目生效 |
| 项目级 | `--scope project` | `.claude/settings.json` | 是（提交到 git） | 团队共享，新成员自动获取 |
| 本地级 | `--scope local` | `.claude/settings.local.json` | 否（gitignore） | 仅本项目、仅本人，不影响团队 |

#### 用户级安装（默认，所有项目可用）

```
/plugin install mj-doc@mj-agentlab-marketplace
/plugin install mj-git@mj-agentlab-marketplace
/plugin install mj-n8n@mj-agentlab-marketplace
/plugin install mj-ops@mj-agentlab-marketplace
```

#### 项目级安装（提交到 git，团队共享）

```
/plugin install mj-doc@mj-agentlab-marketplace --scope project
/plugin install mj-git@mj-agentlab-marketplace --scope project
/plugin install mj-n8n@mj-agentlab-marketplace --scope project
/plugin install mj-ops@mj-agentlab-marketplace --scope project
```

#### 本地级安装（gitignore，仅本人本项目）

```
/plugin install mj-doc@mj-agentlab-marketplace --scope local
/plugin install mj-git@mj-agentlab-marketplace --scope local
/plugin install mj-n8n@mj-agentlab-marketplace --scope local
/plugin install mj-ops@mj-agentlab-marketplace --scope local
```

### 3. 使用示例

安装后在 Claude Code 中直接调用技能：

```
/mj-doc:mj-doc-plan          # 规划某模块需要哪些文档
/mj-git:mj-git-branch        # 按规范创建新分支
/mj-n8n:mj-n8n-author        # 从零生成 n8n workflow JSON
/mj-ops:mj-env-setup         # 搭建本地开发环境
```

## 更新

```
/plugin update mj-doc@mj-agentlab-marketplace
```

## 文档

- 完整文档索引：[docs/INDEX.md](docs/INDEX.md)
- 贡献指引与发布流程：[CONTRIBUTING.md](docs/CONTRIBUTING.md)
- 变更日志：[CHANGELOG.md](CHANGELOG.md)

## 贡献

欢迎贡献！本项目采用 **bare repo + worktree** 开发模型，详见 [CONTRIBUTING.md](docs/CONTRIBUTING.md)。

## 许可证

MIT
