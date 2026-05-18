# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-5.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
[![CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/workflows/ci.yml)

> 浏览本仓库 `develop` 分支时看到的 Version badge 是**预计下一个 release 号**（per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)）；当前实际已发布版本以顶部 [GitHub Releases](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases) 或 `main` 分支 badge 为准。

通用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 插件市场——教学方法论 + NotebookLM 多媒体集成整合在单一 plugin。不绑定特定项目，可服务任意 Claude Code 使用者；在 [mj-system](https://github.com/MJ-AgentLab/mj-system) 与 mj-agent 两个项目上长期实战验证。

> **v4.0.0 重大变更**：marketplace 从 "2 plugin（notebooklm-kit + learn-kit）" 收敛为 "1 plugin（learn-kit）"。原 `notebooklm-kit` 整个退场（7 个 skill 退役），其核心 build + studio 多媒体场景被 `learn-kit` 新增的 `nlm-studio` skill 吸收，并加入 **View-Purpose Preservation** 原则使生成的 artifact 严格匹配源 view（foundation/structural/challenge）的教学目的。详见 [docs/adr/[ADR]_NotebookLM_Kit_Retirement.md](docs/adr/[ADR]_NotebookLM_Kit_Retirement.md) + [docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)。

## 插件目录

| Plugin | 描述 | Skills | Version | 适用项目 |
|--------|------|--------|---------|---------|
| [**learn-kit**](plugins/learn-kit/README.md) | 教学方法论 kit：把枚举型规则清单转化为人类可学习的决策框架解读文档（8 阶段方法 + 模板 + scaffold + locate / scan 项目内文档发现 + generate-tier AI 三档生成 + nlm-studio NotebookLM 多媒体生成） | **5** | **2.0.0** | 任意 |

learn-kit 5 个 skill 用法：

| Skill | 命令 | 用途 |
|-------|------|------|
| scaffold-learning | `/learn-kit:scaffold-learning` | 在项目根 scaffold learning/ 子系统（v2.0.0 从 init 改名）|
| locate | `/learn-kit:locate <query>` | 反查概念名 → 已解读 [LEARNING] 文档或源 canonical 文档 |
| scan | `/learn-kit:scan` | 枚举项目可学候选文档，标 interpreted vs uninterpreted |
| generate-tier | `/learn-kit:generate-tier` | AI 生成三档（foundation/structural/challenge）学习 markdown + 可选 HTML（10-step workflow，含 step 9 可选 NLM 询问） |
| **nlm-studio** | `/learn-kit:nlm-studio <topic>` | **v4.0.0 新增** — 把 3 tier .md 推到 NotebookLM 出 4 view-cycled × 3 view + 1 shared mind_map = 至多 13 个多媒体 artifact（在线浏览，不下载；HTML 不上传）|

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
/plugin install learn-kit@mj-agentlab-marketplace
```

#### 项目级安装（提交到 git，团队共享）

```
/plugin install learn-kit@mj-agentlab-marketplace --scope project
```

### 3. 前置依赖（仅 nlm-studio 需要）

如要用 `/learn-kit:nlm-studio` 出 NotebookLM 多媒体，需在终端先做一次配置：

```bash
# 安装 notebooklm-mcp CLI（一次性）
uv tool install notebooklm-mcp-cli --with socksio --force

# Google OAuth 登录（一次性；token 自动 refresh）
nlm login
```

其余 4 个 skill（scaffold-learning / locate / scan / generate-tier）**零外部依赖**，可独立使用。

### 4. 使用示例

```
/learn-kit:scaffold-learning                 # 在项目根初始化 learning/ 子系统骨架
/learn-kit:scan                              # 枚举项目可学候选文档
/learn-kit:locate "DLSRS"                    # 反向定位概念
/learn-kit:generate-tier                     # AI 生成三档学习文档（可选 HTML + NLM 多媒体）
/learn-kit:nlm-studio documentation-framework # 把已生成的三档推到 NotebookLM 出 13 个多媒体 artifact
```

完整使用文档：[learn-kit/README.md](plugins/learn-kit/README.md)

## 更新

```
/plugin update learn-kit@mj-agentlab-marketplace
```

## v3.x → v4.0.0 迁移指引

如果你在 v3.x 使用过 `notebooklm-kit`：

- **`/notebooklm-kit:build` + `/notebooklm-kit:studio` + `/notebooklm-kit:learn-make`** 的核心场景（上传文档 + 出多媒体 artifact）→ 用 `/learn-kit:nlm-studio <topic>` 替代，并且新版会严格保持 foundation/structural/challenge 三档的教学目的差异
- **`/notebooklm-kit:auth`** → 直接在终端跑 `! nlm login`（nlm-studio 的 pre-flight 自动检查 auth）
- **`/notebooklm-kit:learn-test`（quiz / flashcards）** → 永久退役，无替代。如需评估学习效果，用外部工具
- **`/notebooklm-kit:manage`（notebook 增删改 / 分享）** → 永久退役。直接用 notebooklm.google.com web UI
- **`/notebooklm-kit:query`（跨 notebook 查询）** → 永久退役。同上

完整迁移指引：[docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)。

## 历史版本

- v2.x — MJ System 团队专属工具集
- v3.0.0（2026-05-11）— 通用化重构：删 5 个 MJ-system 专属插件 + mj-nlm 改名为 notebooklm-kit + 新增 learn-kit
- v3.1.0 — learn-kit 加 locate + scan 两个发现 skill
- v3.2.0 — learn-kit 加 generate-tier AI 三档生成 + HTML 渲染
- v3.2.1 — plugin.json schema 修复
- **v4.0.0**（2026-05-14）— notebooklm-kit 整个退役；nlm-studio 吸收到 learn-kit；marketplace 收敛为 1 plugin

## 文档

- 完整文档索引：[docs/INDEX.md](docs/INDEX.md)
- 贡献指引与发布流程：[CONTRIBUTING.md](CONTRIBUTING.md)（repo root，v4.6.3+ per Framework v1.6 §1.1）
- 变更日志：[CHANGELOG.md](CHANGELOG.md)
- 迁移指引：[docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)
- ADR：[v4.0.0 notebooklm-kit 退场决策](docs/adr/[ADR]_NotebookLM_Kit_Retirement.md)

## 贡献

欢迎贡献！本项目采用 **bare repo + worktree** 开发模型，详见 [CONTRIBUTING.md](CONTRIBUTING.md)（v4.6.3 起回 repo root per Framework v1.6 §1.1）。

## 许可证

MIT
