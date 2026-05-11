# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
[![CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/workflows/ci.yml)

通用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 插件市场——提供 NotebookLM 集成与教学方法论工具集，**不绑定特定项目**，可服务任意 Claude Code 使用者；在 [mj-system](https://github.com/MJ-AgentLab/mj-system) 与 mj-agent 两个项目上长期实战验证。

> **v3.0.0 重大变更**：marketplace 从 "MJ System 团队专属" 重构为 "通用工具集"。原 5 个 MJ-system 专属插件已删除（迁回各自项目的 in-tree skills），保留 2 个通用插件并完成命名去 MJ 化。详见 [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)。

## 插件目录

| Plugin | 描述 | Skills | Version | 适用项目 |
|--------|------|--------|---------|---------|
| [**notebooklm-kit**](plugins/notebooklm-kit/README.md) | NotebookLM 集成：notebook lifecycle + artifact 生成（audio/video/slides/mind-map/quiz）+ learn-make / learn-test 高级 wrapper | 7 | 2.4.1 | 任意 |
| [**learn-kit**](plugins/learn-kit/README.md) | 教学方法论 kit：把枚举型规则清单（RFC keyword / 安全策略 / API style guide）转化为人类可学习的决策框架解读文档（8 阶段方法 + 模板 + scaffold 命令） | 1 | 0.1.0 | 任意 |

两插件可独立使用，也常配套：learn-kit 写文档，notebooklm-kit 生成 NotebookLM 配套学习资料（audio / video / slides / quiz 等）。

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
/plugin install notebooklm-kit@mj-agentlab-marketplace
/plugin install learn-kit@mj-agentlab-marketplace
```

#### 项目级安装（提交到 git，团队共享）

```
/plugin install notebooklm-kit@mj-agentlab-marketplace --scope project
/plugin install learn-kit@mj-agentlab-marketplace --scope project
```

### 3. 使用示例

安装后在 Claude Code 中直接调用技能：

```
/notebooklm-kit:learn-make my-topic   # 生成 NotebookLM 学习资料（audio / video / slide / mind-map / report ...）
/notebooklm-kit:learn-test <id>       # 生成考察资料（quiz / flashcards）
/learn-kit:init                       # 在项目根初始化 learning/ 子系统骨架
```

各插件的完整使用文档：

- [notebooklm-kit/README.md](plugins/notebooklm-kit/README.md) — NotebookLM 完整 7 个 skill 用法
- [learn-kit/README.md](plugins/learn-kit/README.md) — 8 阶段方法论 + 模板说明

## 更新

```
/plugin update notebooklm-kit@mj-agentlab-marketplace
/plugin update learn-kit@mj-agentlab-marketplace
```

## v3.0.0 迁移指引

如果你在 v2.x 使用过本 marketplace 的旧插件：

- `mj-sys-doc` / `mj-sys-git` / `mj-sys-n8n` / `mj-sys-ops` — **已删除**，对应能力已迁回 [mj-system](https://github.com/MJ-AgentLab/mj-system) 项目 in-tree skills
- `mj-agent-code-doc` — **已删除**，对应能力已迁回 mj-agent 项目 in-tree skills
- `mj-nlm`（如安装自 `ranzuozhou/my-marketplace`）— **更名为 `notebooklm-kit`**，功能 1:1 保留，slash 命令 `/mj-nlm:X` → `/notebooklm-kit:X`

完整迁移指引：[docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)

## 文档

- 完整文档索引：[docs/INDEX.md](docs/INDEX.md)
- 贡献指引与发布流程：[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
- 变更日志：[CHANGELOG.md](CHANGELOG.md)
- v3.0.0 迁移指引：[docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)

## 贡献

欢迎贡献！本项目采用 **bare repo + worktree** 开发模型，详见 [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)。

## 许可证

MIT
