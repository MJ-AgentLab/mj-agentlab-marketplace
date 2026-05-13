# MJ AgentLab Marketplace

通用 Claude Code 插件市场 — NotebookLM 集成 + 教学方法论工具集，对外通用，已在 mj-system / mj-agent 两项目实战。

## Project Structure

- `plugins/` — 2 个通用插件：
  - `notebooklm-kit` v2.4.1（NotebookLM 集成；2026-05 从 `mj-nlm` 重命名而来）
  - `learn-kit` v0.3.0（教学方法论 kit；从 mj-system v2.0 STANDARD-tier 剥离通用化；v3.1.0 起含 discovery skills: `/learn-kit:locate` + `/learn-kit:scan`；v3.2.0 起含 AI 三档生成 skill: `/learn-kit:generate-tier` + 4 prompt templates，可选渲染交互式 HTML，与 notebooklm-kit 解绑）
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

## v3.2.0 Update Note

2026-05-13 marketplace 从 v3.1.0 → v3.2.0 minor 升级：

- **learn-kit v0.2.0 → v0.3.0** — 两条主线：
  - **新增 `/learn-kit:generate-tier`** — AI 一键生成三档（零基础 / 结构 / 挑战）reading-tier 学习文档，8 步工作流：intake → pre-flight → source acquisition (4 机制多选: project paths / scan-locate / pasted text / dir scan) → tier selection (multi-select) → topic confirmation → per-tier markdown gen → INDEX update → optional HTML render (per-tier, spawn Explore subagent 做概念→代码 grounding)。配 4 个 prompt templates: `templates/{foundation,structural,challenge,html-renderer}.md`
  - **与 notebooklm-kit 解绑** — 删除 `templates/NLM_RECORD_TEMPLATE.md`；移除 METHODOLOGY §10.1 NLM integration 段；清理 init/locate/scan SKILL 中所有 `/notebooklm-kit:*` 互引；plugin.json + marketplace.json learn-kit description 重写为「Independent plugin — no external service dependencies」。两插件可继续在同一 marketplace 共存，但 learn-kit 不再 promote 任何 NotebookLM 工作流
- **notebooklm-kit** 不变（v2.4.1）
- HTML 渲染默认全离线（无 CDN，inline CSS/JS，手写语法高亮 + SVG 流程图 + Tab/折叠/复制为 prompt 按钮 + 暗亮主题）
- v0.2.x 用户迁移：见 learn-kit `CHANGELOG.md` [0.3.0] §Migration note 段（手动删除已 init 的 `learning/_meta/NLM_RECORD_TEMPLATE.md` + INDEX §NotebookLM Notebooks 段即可）

## AI Engineering

marketplace AI agent 工作流规范（v3.2.0 起）：

- **STANDARD（完整规范）**：[docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md](docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)
- **GUIDE（运行时勾选清单）**：[docs/[GUIDE]_Marketplace_Agent_Execution_Checklist.md](docs/[GUIDE]_Marketplace_Agent_Execution_Checklist.md)

### 11 阶段速查表

| # | Stage | Brief | Preferred Skill |
|---|-------|-------|----------------|
| 0 | Intake | 任务准入 + risk/scope/文档需求 | — (可选 `superpowers:brainstorming`) |
| 1 | Repo Scan | 事实核查 8 维 | — |
| 2 | Plan | 执行计划（落用户本地 `~/.claude/plans/`） | — (可选 `superpowers:writing-plans`) |
| 3 | Design Decision (ADR) | 架构 / 命名 / 拆分决策 | — |
| 4 | Plugin / Skill Authoring | 新建 / 改造 plugin / skill | `/plugin-dev:create-plugin` + `/skill-creator:skill-creator` |
| 5 | Plugin Compliance | 合规审 + 版本一致性 | `/plugin-dev:skill-reviewer` + `/plugin-dev:plugin-validator` (agents) |
| 6 | Local Dogfood | 真实场景验证 | — |
| 7 | AI Self-review | 双段 + 11-item checklist | — |
| 8 | Commit / Push / PR | gh + git + 6 PR template | — |
| 9 | Review → Merge → Release | CI / merge / release.yml | — |
| 10 | Post-merge Cleanup | worktree + branch + tag | — |

### HITL 触发摘要

| 类别 | 例子 |
|------|------|
| plugin 高风险 | 删除 / 重命名 / 主版本 bump |
| marketplace schema | marketplace.json metadata / plugins 数组结构 |
| CI/CD | ci.yml / release.yml 修改 |
| 发布 | merge 到 main / VERSION bump major |
| 安全 | secret / 凭据 / token 处理 |
| Review 改变需求 | review 改 plugin 行为 / SKILL description / allowed-tools |
| 测试失败原因不明 | 关键测试失败但 root cause 不清 |

完整 HITL 规则详见 STANDARD §3.1；勾选清单详见 GUIDE §2 各 stage Verification 段。

### 关系

与 mj-system 同名 STANDARD 是「同款骨架，不同细节」；两者独立维护，不强同步。

## Documentation

完整文档索引：[docs/INDEX.md](docs/INDEX.md)
