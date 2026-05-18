# MJ AgentLab Marketplace

通用 Claude Code 插件市场 — 教学方法论 + NotebookLM 多媒体集成的整合工具集，对外通用，已在 mj-system / mj-agent 两项目实战。

## Project Structure

- `plugins/` — **1 个通用插件**（v4.0.0 起整合）：
  - `learn-kit` v1.2.0（教学方法论 + AI 三档生成 + 交互式 HTML + nlm-studio NLM 多媒体生成；v4.0.0 起吸收 notebooklm-kit 的核心多媒体场景；v1.2.0 起 plugin 内教学文档合并为 2 份 [GUIDE]）
- `scripts/` — 基础设施脚本（bump-version, install-hooks, validate-commits, clone-bare）
- `.claude-plugin/marketplace.json` — 市场元数据（版本 + 插件注册表）
- `VERSION` — 市场整体版本号（权威源）
- `docs/` — 项目文档（见 [INDEX.md](docs/INDEX.md)），含 rule / guide / runbook / adr / spec 5 子目录 + 迁移指引 [docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)

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

## Documentation Framework (v4.2.0 起；当前 v1.5 / marketplace v4.5.0)

marketplace 文档体系遵循以下三层 STANDARD（位于 `docs/rule/`）:

- **[Documentation Framework](docs/rule/[STANDARD]_Documentation_Framework.md)** v1.5 — 6 tag prefixes（STANDARD/ADR/GUIDE/RUNBOOK/SPEC/POSTMORTEM）+ 8-field frontmatter + 3-state machine + path stability + INDEX sync；v1.5 起取消 §1 豁免机制，保留 5 类 community/external-spec exclusion
- **[Commit Message Convention](docs/rule/[STANDARD]_Commit_Message_Convention.md)** v1.1 — `<type>(<scope>): <summary>` + 7 types + marketplace scope whitelist + branch-type matrix + §11 Common Mistakes
- **[GitHub Markdown](docs/rule/[STANDARD]_GitHub_Markdown.md)** — ATX headings + GFM tables + native alerts + frontmatter syntax

文档目录子结构（v4.5.0 起所有 tag-prefixed 文档已归位 + flat archive layout）:

```
docs/
├── INDEX.md            # 唯一豁免 frontmatter (Framework v1.5 §1 INDEX special clause)
├── rule/        — STANDARDs (Framework / Commit / GitHub Markdown / HITL Prompt 4 active)
├── guide/       — GUIDEs (含 [GUIDE]_Contributing + [GUIDE]_Migration_From_v3_to_v4 自 v4.5.0 起)
├── runbook/     — RUNBOOKs
├── adr/         — ADRs (v4.5.0 加 Exemption Reversal；ADR-LearnKit 在 plugin 内)
├── spec/        — SPECs (2 seeds in v4.2.0)
├── postmortem/  — empty placeholder
├── archive/     — flat layout (Framework v1.4 §2.3.5；`[DEPRECATED]_[TAG]_*_vX.Y.md` 命名)
└── _templates/  — 6 templates (TEMPLATE_{STANDARD,ADR,GUIDE,RUNBOOK,SPEC,POSTMORTEM}.md)
```

Templates 与 mp-doc-author skill 协作起草新文档；mp-doc-validate skill 审计合规。详见 [docs/INDEX.md](docs/INDEX.md)。

## v4.0.0 Restructure Note

2026-05-14 marketplace 从 v3.2.1 → v4.0.0 重构：

- **删除** `notebooklm-kit` 整个插件（含 7 个 skill: auth / build / studio / learn-make / learn-test / manage / query 以及 nlm-shared/ 10 份共享参考）—— quiz / flashcards / cross-notebook query / source 管理等场景永久放弃
- **迁** `plugins/notebooklm-kit/.mcp.json` → `plugins/learn-kit/.mcp.json`（server name `notebooklm-mcp` 不变；工具前缀自然变为 `mcp__plugin_learn-kit_notebooklm-mcp__*`）
- **新增** `plugins/learn-kit/skills/nlm-studio/` — `/learn-kit:nlm-studio <topic>` skill：把 `learning/<topic>/` 的 3 markdown 上传 NotebookLM 出 13 个多媒体 artifact（4 view-cycled 类型 audio + video + slide_deck + infographic × foundation/structural/challenge = 12 + 1 shared view-agnostic mind_map）。HTML 不上传（dogfood 验证 NLM 拒收）。9 个 prompt 模板组合实现 View-Purpose Preservation 原则（view-prefix 5 段必备 / artifact-suffix 格式约束 / interaction-overrides YAML 处理 4 个 view × artifact 高耦合 cell；mind_map 因 NLM 媒介限制 view-agnostic 不在 cartesian 中）
- **改** `/learn-kit:generate-tier` 工作流 8-step → 10-step：HTML 渲染（step 8）后加 optional step 9 询问是否调 nlm-studio（默认 skip，opt-in）；原 step 9 (Summary) 改名 step 10
- **bump** learn-kit `0.3.1 → 1.0.0`（major：新增 MCP 依赖 + 首个 stable 版本）；marketplace `3.2.1 → 4.0.0`（major：删插件 + 跟随 v3.0.0 删 5 个插件先例）
- 决策记录：[docs/adr/[ADR]_NotebookLM_Kit_Retirement.md](docs/adr/[ADR]_NotebookLM_Kit_Retirement.md)
- 用户迁移：[docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md) §v3.2.x → v4.0.0

**Plugin Secrets Management**：v4.0.0 无 secrets 配置需求。learn-kit 的 nlm-studio 通过 `notebooklm-mcp` MCP server 直接调用，认证使用 NotebookLM OAuth（用户在终端 `nlm login` 一次完成）；其余 4 个 skill 纯静态模板 / 本地文件操作，无凭据。

## 历史版本记录（保留供参考）

- **v3.0.0**（2026-05-11）：从 "MJ System 团队专属" 改为 "通用工具集"；删 5 个 MJ-system 专属插件；mj-nlm → notebooklm-kit 重命名；新增 learn-kit
- **v3.1.0**（2026-05-11）：learn-kit v0.1.0 → v0.2.0；新增 locate + scan 两个 discovery skill
- **v3.2.0**（2026-05-13）：learn-kit v0.2.0 → v0.3.0；新增 generate-tier AI 三档生成 + 交互式 HTML；learn-kit 主动与 notebooklm-kit 解绑
- **v3.2.1**（2026-05-14）：plugin.json `repository` schema 修正
- **v4.0.0**（2026-05-14）：notebooklm-kit 退场 + nlm-studio 吸收到 learn-kit；marketplace 收敛到 1 个 plugin
- **v4.1.0**（2026-05-15）：项目本地 18 件 mp-* skill 入库（mp-flow-* × 9 + mp-git-* × 6 + mp-doc-* × 3）；11 阶段速查表稳定
- **v4.2.0**（2026-05-15）：Documentation Framework v1.0 入库；3 STANDARDs（Framework / Commit / GitHub Markdown）+ INDEX + 6 templates 落地
- **v4.3.x – v4.4.11**（2026-05-15）：framework refinement / docs reorg / hook + CI consolidation / archive 机制 v4.4.0 引入 + v4.4.x flat layout
- **v4.5.0**（2026-05-18）：Framework v1.4 → v1.5 取消 §1 豁免机制；HITL v1.3 → v1.4 §0 universal skeleton 内化；learn-kit v1.1.0 → v1.2.0 教学文档 6 → 2 [GUIDE] 合并；marketplace 独立性原则确立；8-layer commit-validation stack 完工

## AI Engineering

marketplace AI agent 工作流规范（v4.1.0 起含 18 件项目本地 mp-* skill）：

- **STANDARD（完整规范）**：[docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) (v1.4)
- **GUIDE（运行时勾选清单）**：[docs/guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md](docs/guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md)

### 11 阶段速查表

| # | Stage | Brief | Preferred Skill |
|---|-------|-------|----------------|
| 0 | Intake | 任务准入 + risk/scope/文档需求 | `/mp-flow-intake` |
| 1 | Repo Scan | 事实核查 8 维 | `/mp-flow-repo-scan` |
| 2 | Plan | 执行计划（落用户本地 `~/.claude/plans/`） | `/mp-flow-plan` |
| 3 | Design Decision (ADR) | 架构 / 命名 / 拆分决策 | `/mp-flow-design-adr` |
| 4 | Plugin / Skill Authoring | 新建 / 改造 plugin / skill | `/mp-flow-author`（内调 `/plugin-dev:create-plugin` + `/skill-creator:skill-creator`） |
| 5 | Plugin Compliance | 合规审 + 版本一致性 | `/mp-flow-compliance`（内调 `/plugin-dev:skill-reviewer` + `/plugin-dev:plugin-validator` agents） |
| 6 | Local Dogfood | 真实场景验证 | `/mp-flow-dogfood` |
| 7 | AI Self-review | 双段 + 11-item checklist | `/mp-flow-self-review` |
| 8 | Commit / Push / PR | gh + git + 6 PR template | `/mp-git-commit` → `/mp-git-push` → `/mp-git-pr` |
| 9 | Review → Merge → Release | CI / merge / release.yml | `/mp-git-merge-gate` |
| 10 | Post-merge Cleanup | worktree + branch + tag | `/mp-flow-post-merge` + `/mp-git-cleanup` |

### Project-Local Skills (`.claude/skills/`)

v4.1.0 起 18 件 `mp-*` 工作流 skill 随 repo commit 演进，划分 3 family：

| Family | 数量 | Skills |
|--------|------|--------|
| `mp-flow-*` | 9 | intake / repo-scan / plan / design-adr / author / compliance / dogfood / self-review / post-merge |
| `mp-git-*` | 6 | branch / commit / push / pr / merge-gate / cleanup |
| `mp-doc-*` | 3 | author / validate / bump-version |

详见 STANDARD §5.1-§5.3。Skill 来源优先级：**项目本地 mp-* > learn-kit > plugin-dev > superpowers**。

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
