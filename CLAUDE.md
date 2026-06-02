# MJ AgentLab Marketplace

通用 Claude Code 插件市场 — 教学方法论 + NotebookLM 多媒体集成的整合工具集，对外通用，已在 mj-system / mj-agent 两项目实战。

## Project Structure

- `plugins/` — **1 个通用插件**（v4.0.0 起整合）：
  - `learn-kit` v3.2.0（**v6.2.0 additive：3 skill 化** —— 在 v3.0.0–v3.1.0 单 skill `three-views` 之外加 `glossary`（六槽术语速记卡 ~150-250字）+ `concept`（六节概念深讲 ~500-800字，2 跨域正例 + 1 反例 + 失效边界）两个纯 prompt in-chat 解释 skill（单 SKILL.md，无 tool / 无 file / 无 MCP；frontmatter `name`+`description` only），填补 `three-views` 明确 disclaim 的 pure-explanation / Q&A niche；三 skill description 加 `Do not use for: …（use X）` routing clause；learn-kit picker 1→3 在 [docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md](docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md) 显式 reconcile。**v6.1.0 additive HITL expansion**：在 v3.0.0 单一 `three-views` skill 内加 Step 1.3 视角 multi-select（default 3 全选 / min 1）+ Step 4 升级 5-cell granular multi-select（HTML / NLM audio / NLM video / NLM slide_deck / NLM mind_map 独立勾选）+ Step 5B re-run guard `source_corpus_key` 等价性 + 3-level hint granularity；默认产物等同 v3.0.0；详见 [docs/adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md](docs/adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md)）。**v6.0.0 BREAKING baseline**：5 skill 收敛为单 skill `three-views`——删 scaffold-learning/locate/scan/nlm-studio + 重命名 generate-tier → three-views；NLM artifact 范围 13 → max 10（删 infographic，mind_map 转 opt-in）；新增 URL 输入 + source_manifest 结构化追踪 + HTML dual-mode grounding；保留 nlm-studio 全套 dogfood防护；详见 [docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md](docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) + [docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md) §6。历史 v2.x 5-skill 设计：scaffold-learning（一次性 bootstrap）+ locate/scan（discovery，算法保留为 plugin-internal [GUIDE]_LearnKit_Discovery_Recipes manual recipes）+ generate-tier（AI 三档）+ nlm-studio（NLM 多媒体）；v2.0.0 BREAKING init → scaffold-learning rename；v2.0.1 nlm-studio Chinese narration dual-lock）
- `scripts/` — 基础设施脚本（bump-version, install-hooks, validate-commits, clone-bare）
- `.claude-plugin/marketplace.json` — 市场元数据（版本 + 插件注册表）
- `VERSION` — 市场整体版本号（权威源）
- `docs/` — 项目文档（见 [INDEX.md](docs/INDEX.md)），含 rule / guide / runbook / adr / spec 5 子目录 + 迁移指引 [docs/guide/[GUIDE]_Migration_From_v3_to_v4.md](docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)

## Key Conventions

- **Bare repo worktree model**: 每个分支对应独立 worktree 目录，不使用 `git checkout`
- **Dual-layer versioning**: marketplace 整体版本（`VERSION`）和各插件版本（`plugin.json`）独立管理
- **Develop post-release pre-bump (v4.6.1 起)**: 每次 release + sync-main-to-develop 完成后，在 `develop` 上额外 `bump-version.ps1 -From X.Y.Z -To X.Y.(Z+1)` 一个 commit；保证 `develop VERSION > main VERSION` 恒成立。Pure patch 风格无 `-dev` 后缀；只 bump 顶层 VERSION，不连带 plugin.json。详见 [docs/adr/[ADR]_Develop_PreBump_Adoption.md](docs/adr/[ADR]_Develop_PreBump_Adoption.md) + [docs/runbook/[RUNBOOK]_Release_Operations.md](docs/runbook/[RUNBOOK]_Release_Operations.md) §3.7。
- **Develop README badge 语义**：`develop` 分支的 Version badge = 预计下一个 release 号（因 post-release pre-bump 机制）；实际已发布版本以 GitHub Releases / `main` 分支 badge 为准。
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

## Documentation Framework (v4.2.0 起；当前 v1.6 / marketplace v6.2.0)

marketplace 文档体系遵循以下三层 STANDARD（位于 `docs/rule/`）:

- **[Documentation Framework](docs/rule/[STANDARD]_Documentation_Framework.md)** v1.6 — 6 tag prefixes（STANDARD/ADR/GUIDE/RUNBOOK/SPEC/POSTMORTEM）+ 8-field frontmatter + 3-state machine + path stability + INDEX sync；v1.5 起取消 §1 豁免机制保留 5 类 community/external-spec hard exclusion；v1.6 新增 §1.1 root-level named files 正向 codification（5 files 各自固定责任 + Source of exclusion 列）+ §2.7 CLAUDE.md sync allowlist（3 类 trigger）+ §4.3.1 A6 active CI gate
- **[Commit Message Convention](docs/rule/[STANDARD]_Commit_Message_Convention.md)** v1.1 — `<type>(<scope>): <summary>` + 7 types + marketplace scope whitelist + branch-type matrix + §11 Common Mistakes
- **[GitHub Markdown](docs/rule/[STANDARD]_GitHub_Markdown.md)** — ATX headings + GFM tables + native alerts + frontmatter syntax

文档目录子结构（v4.6.3 起 v1.6 §1.1 root-level named files 编码完整）:

```
docs/
├── INDEX.md            # 唯一豁免 frontmatter (Framework v1.5 §1 INDEX special clause)
├── rule/        — STANDARDs (Framework / Commit / GitHub Markdown / HITL Prompt 4 active)
├── guide/       — GUIDEs (Migration_From_v3_to_v4 / Marketplace_Project_Overview / Plugin_Development_Testing_Workflow / Version_Management / Marketplace_Agent_Execution_Checklist 5 active；Contributing 自 v4.6.3 回 repo root)
├── runbook/     — RUNBOOKs (Release_Operations / Doc_Archive_Procedure 2 active)
├── adr/         — ADRs (v4.5.0 加 Exemption Reversal v1.1；v4.6.1 加 Develop_PreBump_Adoption；v4.6.3 加 Root_Level_Named_Files_Codification)
├── spec/        — SPECs (2 seeds in v4.2.0)
├── postmortem/  — POSTMORTEM (v4.6.2 add Bulk_Cleanup_Trap_Analysis P3)
├── archive/     — flat layout (Framework v1.4 §2.3.5；`[DEPRECATED]_[TAG]_*_vX.Y.md` 命名)
└── _templates/  — 6 templates (TEMPLATE_{STANDARD,ADR,GUIDE,RUNBOOK,SPEC,POSTMORTEM}.md)
```

**v4.6.3 起 Root-Level Named Files**（per Framework v1.6 §1.1）：仓库根目录 5 个 named special files 各承担固定独立责任，免 `[TAG]_` prefix 约束：

- [`README.md`](README.md) — GitHub 公开入口（badges + TL;DR + 插件目录 + quick-start + 链路）
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — 贡献入口（branch / commit / version / PR / hooks；v4.6.3 起回 root 触发 GitHub New Issue/PR auto-prompt）
- [`CHANGELOG.md`](CHANGELOG.md) — Keep-a-Changelog 发布日志
- [`GLOSSARY.md`](GLOSSARY.md) — marketplace 术语词典（v4.6.3 新建；按字母顺序术语 → 1 句定义）
- `CLAUDE.md`（本文件）— AI agent + 维护者上下文摘要

`CLAUDE.md` 内容受 [§2.7 Sync Allowlist](docs/rule/[STANDARD]_Documentation_Framework.md#§27-claudemd-sync-allowlist-v16-new) 约束：触及 global standards（`docs/rule/[STANDARD]_*.md`）/ runtime info（`VERSION` + `marketplace.json` + plugin.json major/minor）/ directory entries（`.claude/skills/mp-*/` + plugin skill dirs + `docs/` 子目录结构变更）的 PR 必须同步本文件（§4.3.1 A6 CI gate 阻断，`[skip a6]` PR title token 可绕过 + reviewer sign-off）。

Templates 与 mp-doc-author skill 协作起草新文档；mp-doc-validate skill 审计合规（v4.6.3 起含 Step 3.5 CLAUDE.md sync Warning 检测）。详见 [docs/INDEX.md](docs/INDEX.md)。

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
- **v4.6.x**（2026-05-18）：v4.6.1 develop post-release pre-bump 机制 (per [ADR]_Develop_PreBump_Adoption)；v4.6.2 POSTMORTEM Bulk_Cleanup_Trap_Analysis P3 + bump-version script regex fix；v4.6.3 Framework v1.5 → v1.6 root-level named files codification + §2.7 CLAUDE.md sync allowlist + §4.3.1 A6 active CI gate + Reversal ADR v1.0 → v1.1 amendment + CONTRIBUTING.md restore to root + GLOSSARY.md create + [GUIDE]_Contributing archive ceremony
- **v5.0.0**（2026-05-18）：**BREAKING** — learn-kit `1.2.1 → 2.0.0` scaffold skill `init` → `scaffold-learning` 物理重命名（消除与 Claude Code 内置 `/init` 的 slash-picker 冲突；详见 [`[ADR]_LearnKit_Init_Skill_Rename`](docs/adr/[ADR]_LearnKit_Init_Skill_Rename.md) + Migration §5）；同 release 吸收 v4.6.3 [Unreleased] 的 Framework v1.6 工作（Stream 2，由 BREAKING 触发的 major bump 吞掉原计划 v4.6.3 patch）
- **v5.0.1**（2026-05-18）：post-release develop pre-bump (post-v5.0.0)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 2.0.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)
- **v5.0.1 release**（2026-05-19）：`mp-git-sync` side-loop sync skill 落地（mp-git-* family 6 → 7；3 mode：dev-sync / hotfix-backmerge / self-update；10 条 H-code HITL 网格 + H8 bare-worktree config 漂移自动修复 PowerShell 脚本）；post-v5.0.0 housekeeping CLAUDE.md A6 gate sync 一并入版本节。无 plugin 版本变化（learn-kit `2.0.0` dual-layer 独立）
- **v5.0.2**（2026-05-19）：post-release develop pre-bump (post-v5.0.1)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 2.0.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)
- **v6.0.0**（2026-05-28）：**BREAKING** — learn-kit `2.0.1 → 3.0.0` 5 skill 收敛为单一 `three-views` skill（删 scaffold-learning / locate / scan / nlm-studio + 重命名 generate-tier → three-views；NLM artifact 默认 max 10（9 view-cycled + 1 optional mind_map），infographic 永久退场；新增 URL 输入 + source_manifest 结构化追踪 + HTML dual-mode grounding；保 nlm-studio 全 dogfood防护）；marketplace `5.0.2 → 6.0.0` 跟随 plugin major + 5 个 user-facing slash command 消失/重命名 = consumer-facing API breaking；详见 [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) + Migration §6；新增 plugin-internal [`[GUIDE]_LearnKit_Discovery_Recipes`](plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md) 保留 v2.x locate/scan 算法为 manual recipes
- **v6.0.0 release**（2026-05-29）：marketplace 6.0.0 release.yml 自动 tag v6.0.0 + GitHub Release published；release/v6.0.0 branch 加 1 marker commit（CHANGELOG 加 inherited 2.0.1 fix subsection + Notes 加 dual-version-chain 说明：learn-kit `2.0.0 → 2.0.1 → 3.0.0` 双链合并 + marketplace `5.0.1 → 6.0.0` 跳过 5.0.2 pre-bump-only 中间态）。无 plugin 版本变化（learn-kit `3.0.0` dual-layer 独立）
- **v6.0.1**（2026-05-29）：post-release develop pre-bump (post-v6.0.0)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 3.0.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)
- **v6.1.0**（2026-05-29）：learn-kit `3.0.0 → 3.1.0`（minor，additive HITL gate 扩展）：Step 1 新增 tier multi-select（Step 1.3，default 3 全选，min 1）；Step 4 重设计为 5-cell granular multi-select（HTML / NLM audio / NLM video / NLM slide_deck / NLM mind_map，默认全不选；per-type NLM 控制前移）；Step 3/5A/5B 循环泛化为 `generated_tiers` 子集；Step 5B re-run guard 加 `source_corpus_key` 等价性检查（partial-rerun 防 source-corpus contamination）；Quota gate adaptive `N = len(generated_tiers) × len(view-cycled types) + (1 if mind_map)`；"Pick single view" → "Pick single tier" 重命名 + 退化条件隐藏；`templates/artifact-mind_map.md` 改 "across all three tiers" → "selected source corpus"；frontmatter `generator @3.0.0 → @3.1.0`；3-level hint granularity（explicit-type / generic-NLM / no-hint）。默认产物等同 v3.0.0；交互流程多 1 个 tier confirmation gate。marketplace VERSION + metadata.version 跟随 plugin minor 升 `6.0.1 → 6.1.0`（消耗 pre-bump slot 并跟进 plugin minor，historical pattern v3.1.0/v3.2.0/v4.5.0）。详见 [`[ADR]_LearnKit_ThreeViews_HITL_Expansion`](docs/adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md)
- **v6.1.0 release**（2026-05-29）：marketplace 6.1.0 release.yml 自动 tag v6.1.0 + GitHub Release published；release/v6.1.0 branch 加 1 marker commit（root CHANGELOG `[Unreleased]` → `[6.1.0] - 2026-05-29` transform，包含 v3.1.0 Added/Changed/Notes 完整 release notes 由 release.yml 抽取上 GitHub Release）。无 plugin 版本变化（learn-kit `3.1.0` dual-layer 独立）
- **v6.1.1**（2026-05-29）：post-release develop pre-bump (post-v6.1.0)；只 bump marketplace VERSION + marketplace.json metadata.version + README badge；plugin.json `learn-kit 3.1.0` 不动；per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)。同 PR 第 2 个 logical commit 完成 A6 CLAUDE.md sync（v5.0.2 / v6.0.1 pre-bump 同款 2-commit-in-1-PR pattern）
- **v6.2.0**（2026-06-02）：learn-kit `3.1.0 → 3.2.0`（minor，additive）：加 `glossary`（`/learn-kit:glossary`；六槽 150–250字 术语速记卡）+ `concept`（`/learn-kit:concept`；六节 500–800字 概念深讲，2 跨域正例 + 1 反例 + 失效边界）两个纯 prompt in-chat 解释 skill（单 SKILL.md，无 tool / 无 templates / 无 MCP / 无 file I/O；frontmatter `name`+`description` only，与 tool-light mp-* 同款约定）。填补 `three-views` 明确 disclaim 的 "pure explanation / Q&A" niche；三 skill description 加仓库签名式 `Do not use for: …（use X）` routing clause。learn-kit slash picker 1→3——显式 reconcile v6.0.0 consolidation 的 "1 候选" 收益（删的是低价值 pipeline helper，加的是高价值正交工具）。marketplace VERSION + metadata.version 跟随 plugin minor 升 `6.1.1 → 6.2.0`（消耗 pre-bump slot + 跟进 plugin minor，historical pattern v3.1.0/v3.2.0/v6.1.0）。`three-views` 不动；默认行为不变。源自一个独立两-skill bundle 近-verbatim 集成（仅改集成层：slash 命名空间 + routing clause + frontmatter 规范化）。详见 [`[ADR]_LearnKit_Explanation_Skills_Addition`](docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md)

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

v4.1.0 起 19 件 `mp-*` 工作流 skill 随 repo commit 演进，划分 3 family：

| Family | 数量 | Skills |
|--------|------|--------|
| `mp-flow-*` | 9 | intake / repo-scan / plan / design-adr / author / compliance / dogfood / self-review / post-merge |
| `mp-git-*` | 7 | branch / commit / push / pr / merge-gate / cleanup / sync |
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
