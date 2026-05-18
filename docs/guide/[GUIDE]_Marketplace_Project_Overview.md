---
type: guide
scope: marketplace
summary: MJ AgentLab Marketplace 项目概览 — 架构、插件目录、开发环境
owner: marketplace-maintainers
created: 2026-03-17
updated: 2026-05-15
state: active
version: v1.0
domain: governance
tags:
  - overview
  - onboarding
related:
  - ./[GUIDE]_Version_Management.md
  - ./[GUIDE]_Plugin_Development_Testing_Workflow.md
  - ../rule/[STANDARD]_Documentation_Framework.md
---

# [GUIDE] MJ AgentLab Marketplace 项目概览

> 面向新成员和贡献者，介绍插件市场的架构、组成和开发环境。

## 1. 项目定位

MJ AgentLab Marketplace 是 **通用 Claude Code 插件市场**（v3.0.0 起从内部团队专属重构为对外通用），集中管理和分发教学方法论 + NotebookLM 多媒体集成的整合工具集。已在多个下游 Claude Code 项目实战。

- **仓库**：[MJ-AgentLab/mj-agentlab-marketplace](https://github.com/MJ-AgentLab/mj-agentlab-marketplace)
- **许可证**：MIT
- **当前版本**：见 `VERSION` 文件（权威源）

## 2. 架构概览

> **物理目录**：本项目使用 **bare repo worktree 模式**（参考 §6.2 克隆仓库）。下图为逻辑结构，物理上每个分支对应一个 worktree 目录（如 `mj-agentlab-marketplace/develop/`、`mj-agentlab-marketplace/feature-xxx/`）。

```
mj-agentlab-marketplace/
├── .claude-plugin/
│   └── marketplace.json          # 市场元数据（整体版本 + 插件注册表）
├── .claude/
│   ├── settings.json             # 项目级 Claude Code 配置
│   └── skills/                   # v4.1.0 起 18 件项目本地 mp-* 工作流 skill
│       ├── mp-flow-*/            # 9 个：intake / repo-scan / plan / design-adr / author / compliance / dogfood / self-review / post-merge
│       ├── mp-git-*/             # 6 个：branch / commit / push / pr / merge-gate / cleanup
│       └── mp-doc-*/             # 3 个：author / validate / bump-version
├── VERSION                       # 市场整体版本号（单一权威源）
├── CHANGELOG.md                  # 市场级变更日志
├── plugins/                      # v4.0.0 起仅 1 个插件
│   └── learn-kit/                # 教学方法论 + AI 三档生成 + NotebookLM 多媒体集成
├── scripts/                      # 基础设施脚本
│   ├── bump-version.ps1          # 版本升级
│   ├── install-hooks.ps1         # Git hooks 安装
│   └── clone-bare.ps1            # Bare repo 克隆
├── .github/
│   ├── workflows/                # CI/CD
│   │   ├── ci.yml                # PR 结构校验
│   │   └── release.yml           # 自动发布
│   ├── PULL_REQUEST_TEMPLATE/    # 6 种 PR 模板
│   └── ISSUE_TEMPLATE/           # 5 种 Issue 模板
└── docs/                         # v4.2.0 起按 framework 分子目录；v4.5.0 起 CONTRIBUTING + MIGRATION 移入 guide/
    ├── INDEX.md                  # 文档索引（v1.5 §1 唯一豁免 frontmatter）
    ├── rule/                     # STANDARDs（Framework v1.5 / Commit Convention / GitHub Markdown / HITL Prompt）
    ├── guide/                    # GUIDEs（本文档 + version mgmt + agent checklist + [GUIDE]_Contributing + [GUIDE]_Migration_From_v3_to_v4）
    ├── runbook/                  # RUNBOOKs（release operations v1.2 / doc archive procedure）
    ├── adr/                      # ADRs（marketplace-scope；plugin-internal ADRs 在 plugins/learn-kit/docs/adr/）
    ├── spec/                     # SPECs（marketplace.json + plugin.json schemas）
    ├── archive/                  # flat layout (Framework v1.4 §2.3.5)
    └── _templates/               # 6 个起草骨架模板
```

## 3. 插件目录

> v3.0.0 重构（从内部团队专属改为通用工具集）+ v4.0.0 整合（notebooklm-kit 退役，核心多媒体场景吸收到 learn-kit）后，marketplace 收敛至 **1 个通用插件**。完整退役历史见 [Migration Guide](./[GUIDE]_Migration_From_v3_to_v4.md) 与 [[ADR]_NotebookLM_Kit_Retirement](../adr/[ADR]_NotebookLM_Kit_Retirement.md)。

| Plugin | 描述 | Skills | Version | MCP 依赖 |
|--------|------|--------|---------|----------|
| **learn-kit** | 教学方法论 + AI 三档（foundation/structural/challenge）reading-tier 学习文档生成 + 交互式 HTML 渲染 + NotebookLM 多媒体 artifact 生成（audio/video/slide_deck/infographic × 3 view + 1 mind_map = 至多 13 个在线制品） | 5（scaffold-learning / locate / scan / generate-tier / nlm-studio） | 2.0.0 | notebooklm-mcp（nlm-studio skill 需要；其他 4 skill 零依赖） |

### 3.1 插件标准结构

每个插件遵循统一结构：

```
<plugin>/
├── .claude-plugin/
│   └── plugin.json       # 插件元数据（name, version, author, skills）
├── .mcp.json             # MCP 服务器定义（可选）
├── CLAUDE.md             # 插件概述（Claude Code 上下文注入）
├── README.md             # 用户安装和使用指南
├── CHANGELOG.md          # 插件级变更日志
└── skills/
    └── <skill-name>/
        ├── SKILL.md      # Skill 行为规范（frontmatter + workflow）
        └── *.md          # 参考文档（规则、模板、清单）
```

### 3.2 技能工作流链

- **learn-kit**（5 skills，v4.0.0+ 唯一插件）:
  - `/learn-kit:scaffold-learning` — 在项目根 scaffold `learning/<topic>/` 子系统 + 8 阶段方法论模板
  - `/learn-kit:locate <query>` — 反查概念名 / 口诀 / 部分文档名 → 候选 [LEARNING] 文档 / canonical 源
  - `/learn-kit:scan` — 项目可学候选枚举 (PageRank-lite ranking)
  - `/learn-kit:generate-tier` — AI 生成三档（foundation / structural / challenge）reading-tier 学习 markdown + 可选交互式 HTML
  - `/learn-kit:nlm-studio <topic>` — 把三档 markdown push 到 NotebookLM 生成至多 13 个多媒体 artifact（audio/video/slide_deck/infographic × 3 view + 1 shared mind_map）

> 历史上 v3.x marketplace 含 4 个 mj-sys-* 插件（doc / git / n8n / ops），v3.0.0 把它们退役改为通用工具集。详见 [GUIDE Migration From v3 to v4](<./[GUIDE]_Migration_From_v3_to_v4.md>)。

## 4. 版本管理体系

采用 **双层独立版本管理**：

| 层级 | 权威源 | 升级时机 |
|------|--------|----------|
| Marketplace 整体 | `VERSION` 文件 | 新增/删除插件、跨插件变更 |
| 各 Plugin 独立 | `plugins/<name>/.claude-plugin/plugin.json` | 插件内部变更 |

两者独立升级，互不影响。详见 [版本管理指南](<./[GUIDE]_Version_Management.md>)。

## 5. CI/CD 体系

### 5.1 CI — 结构校验（ci.yml）

触发条件：feature/bugfix/documentation/maintain/hotfix 分支 push + PR to develop/main

| 检查项 | 内容 |
|--------|------|
| plugin.json 校验 | name, description, version, author, license, skills 字段完整 |
| marketplace.json 完整性 | 每个插件条目有对应目录 |
| SKILL.md 前置元数据 | YAML frontmatter 含 name + description |
| 目录结构 | 每个插件含 .claude-plugin/plugin.json, CLAUDE.md, README.md, skills/ |
| 版本一致性 | VERSION ↔ marketplace.json；plugin.json ↔ marketplace.json |
| CHANGELOG 存在性 | 根级 + 各插件级 |

### 5.2 Release — 自动发布（release.yml）

触发条件：VERSION 文件变更推送到 main

流程：读取版本 → 检查 tag 幂等 → 创建 git tag → 从 CHANGELOG 提取发布说明 → 创建 GitHub Release

## 6. 开发环境搭建

### 6.1 安装插件（使用者）

```bash
# 注册 marketplace
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace

# 安装所需 plugin
/plugin install learn-kit@mj-agentlab-marketplace
```

### 6.2 克隆仓库（开发者）

> [!NOTE]
> 首次克隆需要使用独立引导脚本 `mj-agentlab-marketplace-clone-bare.ps1`，
> 该脚本位于项目目录外（如 `D:\workspace\...\projects\`）。
> 仓库内的 `scripts/clone-bare.ps1` 是同一脚本的归档副本。

```powershell
# 新成员入职（创建 develop worktree）
powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 `
    -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace

# 获取特定分支（如需直接进入某开发分支）
powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 `
    -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace `
    -Branches "feature/12-add-release-skill"

# 同时创建多个 worktree
powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 `
    -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace `
    -Branches "develop,main"

# 增量添加新分支（项目已存在时自动跳过初始化）
powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 `
    -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace `
    -Branches "hotfix/fix-ci-validation"
```

克隆完成后安装 Git hooks：

```powershell
cd mj-agentlab-marketplace\develop
powershell -File ..\scripts\install-hooks.ps1
```

### 6.3 分支策略

| 分支类型 | 来源 | 目标 |
|----------|------|------|
| `main` | — | 生产就绪（受保护） |
| `develop` | — | 集成主线（受保护） |
| `feature/*` | develop | develop |
| `bugfix/*` | develop | develop |
| `documentation/*` | develop | develop |
| `maintain/*` | develop | develop |
| `hotfix/*` | main | main（合并后同步 develop） |

## 7. 相关文档

- [版本管理指南](<./[GUIDE]_Version_Management.md>) — 版本管理详细指南
- [发布操作手册](<../runbook/[RUNBOOK]_Release_Operations.md>) — 发布操作手册
- [GUIDE Contributing](<./[GUIDE]_Contributing.md>) — 贡献指南
