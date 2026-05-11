# MJ AgentLab Marketplace

通用 Claude Code 插件市场 — NotebookLM 集成 + 教学方法论工具集，对外通用，已在 mj-system / mj-agent 两项目实战。

## Project Structure

- `plugins/` — 2 个通用插件：
  - `notebooklm-kit` v2.4.1（NotebookLM 集成；2026-05 从 `mj-nlm` 重命名而来）
  - `learn-kit` v0.2.0（教学方法论 kit；从 mj-system v2.0 STANDARD-tier 剥离通用化；v3.1.0 起含 discovery skills: `/learn-kit:locate` + `/learn-kit:scan`）
- `scripts/` — 基础设施脚本（bump-version, install-hooks, clone-bare）
- `.claude-plugin/marketplace.json` — 市场元数据（版本 + 插件注册表）
- `VERSION` — 市场整体版本号（权威源）
- `docs/` — 项目文档（见 [INDEX.md](docs/INDEX.md)），含 [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)

## Key Conventions

- **Bare repo worktree model**: 每个分支对应独立 worktree 目录，不使用 `git checkout`
- **Dual-layer versioning**: marketplace 整体版本（`VERSION`）和各插件版本（`plugin.json`）独立管理
- **Commit format**: `<type>(<scope>): <summary>` — types: feat, fix, perf, refactor, test, docs, infra
- **Branch types**: feature/, bugfix/, documentation/, maintain/, hotfix/

## Plugin Structure

每个插件遵循官方 Claude Code plugin spec：

```
<plugin>/
├── .claude-plugin/plugin.json   # 插件元数据（必须位于此子目录）
├── .mcp.json                    # MCP 服务器定义（可选）
├── CLAUDE.md                    # 插件概述（可选）
├── README.md                    # 用户指南
├── CHANGELOG.md                 # 变更日志
├── LICENSE                      # 许可证文件
└── skills/                      # 技能目录（自动发现）
    └── <skill-name>/
        ├── SKILL.md
        ├── templates/           # 可选
        ├── references/          # 可选
        └── scripts/             # 可选
```

**v3.0.0 起遵守的官方约束**：

- `plugin.json` 必须位于 `.claude-plugin/` 子目录（不在 plugin 根目录）
- 优先用 SKILL（不用 COMMAND，commands 是 legacy）
- 模板 / references / scripts 放在 skill 目录内部
- 不使用 `components` 字段（auto-discovery 标准）

## v3.0.0 Restructure Note

2026-05-11 marketplace 从 v2.1.1 → v3.0.0 重构：

- **删除** 5 个 MJ-system / mj-agent 专属插件（mj-sys-doc / mj-sys-git / mj-sys-n8n / mj-sys-ops / mj-agent-code-doc）—— 这些能力已迁回各自项目 in-tree skills
- **迁入 + 重命名** `mj-nlm`（ranzuozhou/my-marketplace）→ `notebooklm-kit`，功能 1:1 保留
- **新增** `learn-kit` 通用方法论插件

完整迁移指引见 [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)。

**Plugin Secrets Management**：v2.x 的 mj-sys-ops / mj-sys-git 加密 secrets 机制随着这两个插件删除而移除。当前 v3.0.0 的 2 个插件均不需要 secrets 配置——`notebooklm-kit` 使用 NotebookLM OAuth（首次运行触发）；`learn-kit` 纯静态模板。

## v3.1.0 Update Note

2026-05-11 marketplace 从 v3.0.0 → v3.1.0 minor 升级：

- **learn-kit v0.1.0 → v0.2.0** — 新增 2 个 discovery skills：
  - `/learn-kit:locate <query>` — 反向定位概念名 / 口诀 / 部分文档名到已解读 [LEARNING] 文档（首选）或源 canonical 文档（次选），含置信度分级
  - `/learn-kit:scan` — 枚举项目可学候选文档（按 tag prefix 分类，标记已解读 vs 未解读，PageRank-lite 排序）
  - METHODOLOGY §1.5 "Project Discovery" 文档化 scan → locate → 8-stage 推荐工作流
  - 设计决策：`docs/[ADR]_LearnKit_Discovery_Skills.md`
- **notebooklm-kit** 不变（v2.4.1）
- 纯启发式项目识别，零配置；扫 CLAUDE.md tag 声明 + INDEX 文件 + 文件 tag prefix 自动推断
- mj-system / mj-agent / 用户全局 settings 一律零改动

## Documentation

完整文档索引：[docs/INDEX.md](docs/INDEX.md)
