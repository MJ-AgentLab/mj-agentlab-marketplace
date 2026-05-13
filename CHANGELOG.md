# Changelog

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [3.2.0] - 2026-05-13

### Added

- **`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`** — marketplace 第一个 `[STANDARD]_*` 文档，定义 AI agent 在 marketplace 仓库内的 11 阶段闭环工作流 + Prompt 通用结构 + HITL 触发规则 + Hybrid Skill 矩阵（plugin-dev + skill-creator + superpowers + marketplace self-hosted）。从 v3.0.0 + v3.1.0 两轮实战经验提炼；剥离 mj-system 同名 STANDARD 中 DB / n8n / ETL / FastAPI / Flyway 等不适用内容；保留 HITL 哲学骨架。 (PR #65)
- **`docs/[GUIDE]_Marketplace_Agent_Execution_Checklist.md`** — STANDARD 的运行时配套勾选清单。把每个 stage 压缩为 4 段（Entry / Actions / Verification / Exit），共 11 stage × ~25 行，便于 agent 与人类在执行中对照。包含通用 HITL 触发摘要表 + 5 个关联文档指针。 (PR #66)
- **`docs/INDEX.md`** 新增 `## Standards` 段登记 STANDARD；Guides 表新增 GUIDE 行；Plugin Developers 推荐阅读顺序加入 STANDARD（步骤 2）+ GUIDE（步骤 3）
- **顶层 `CLAUDE.md`** 新增 `## AI Engineering` 段，从原 4-bullet 摘要升级为完整 11-stage 速查表 + HITL 触发摘要表 + 同时引用 STANDARD + GUIDE；v3.2.0 加 Update Note 段反映 learn-kit v0.3.0 generate-tier + NLM decoupling
- **learn-kit v0.2.0 → v0.3.0** — 两条主线 (PR #68)：
  - **新增 `/learn-kit:generate-tier`** — AI 一键生成三档（foundation 零基础版 / structural 结构版 / challenge 挑战版）reading-tier 学习文档，8 步工作流：intake → pre-flight → source acquisition (4 机制多选: project paths / scan-locate / pasted text / dir scan) → tier selection (multi-select, 默认全选) → topic confirmation + conflict policy → per-tier markdown gen → INDEX update → optional HTML render (per-tier, spawn Explore subagent 做概念→代码 grounding)。配 4 个 prompt templates: `templates/{foundation,structural,challenge,html-renderer}.md` (~1193 行总和)
  - **与 notebooklm-kit 解绑** — 删除 `templates/NLM_RECORD_TEMPLATE.md`；移除 METHODOLOGY §10.1 NLM integration 段（METHODOLOGY 内部版本 v0.2 → v0.3）；清理 init/locate/scan SKILL 中所有 `/notebooklm-kit:*` 互引；plugin.json + marketplace.json learn-kit description 重写为「Independent plugin — no external service dependencies」。两插件可继续在同一 marketplace 共存，但 learn-kit 不再 promote 任何 NotebookLM 工作流
  - **HTML 渲染策略** — 默认全离线（无 CDN，inline CSS/JS，手写语法高亮 + SVG 流程图 + Tab/折叠/复制为 prompt 按钮 + 暗亮主题）；spawn Explore subagent 在主对话外做 concept→code grounding 避免上下文淹没

### Changed

- **`docs/INDEX.md` Plugin References** — 清理 v3.0.0 已删除的 mj-sys-ops / mj-sys-git secrets setup 引用（stale reference fix-while-here）
- **`.claude-plugin/marketplace.json`** — metadata.version 3.1.0 → 3.2.0；learn-kit 条目 version 0.2.0 → 0.3.0 + description 重写（去掉 NLM coupling 主张，加 3-tier generator + HTML render 能力）+ keywords 扩展（three-tier / foundation / structural / challenge / ai-generation / html-render）
- **`VERSION`** — 3.1.0 → 3.2.0
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version 0.2.0 → 0.3.0；description / keywords mirror marketplace.json (byte-identical for description per validator)

### Removed

- **`plugins/learn-kit/skills/init/templates/NLM_RECORD_TEMPLATE.md`** (-242L) — entire file deleted；NLM artifact metadata schema is no longer maintained by learn-kit。v0.2.x 用户迁移：见 `plugins/learn-kit/CHANGELOG.md` [0.3.0] §Migration note 段
- **`plugins/learn-kit/skills/init/templates/METHODOLOGY.md` §10.1 With notebooklm-kit** — section removed；§10.2 markdownlint 提升为新 §10.1
- **`plugins/learn-kit/skills/init/templates/INDEX.md` §NotebookLM Notebooks** + 维护规则 NLM bullet — sections removed；新增 §Tier Documents 段为 generate-tier 占位
- All `/notebooklm-kit:*` cross-references in init / locate / scan SKILL.md and templates

### Decoupled

- **learn-kit ↔ notebooklm-kit** — 两插件不再互依，可独立采用。详见 `plugins/learn-kit/CHANGELOG.md` [0.3.0] §Decoupled from + §Migration note

### Released

通过 release.yml 自动 tag `v3.2.0` + 创建 GitHub Release（trigger: push to main + paths: VERSION）

## [3.1.0] - 2026-05-11

### Added

- **learn-kit v0.1.0 → v0.2.0** — 新增 2 个 discovery skills，闭环初次使用场景：
  - `/learn-kit:locate <query>` — 反向定位概念名 / 口诀 / 部分文档名 → 已解读 [LEARNING] 文档（首选）+ 源 canonical 文档（次选），含置信度分级与项目识别 profile
  - `/learn-kit:scan` — 项目可学候选枚举：按 tag prefix 分类（[STANDARD]/[SPEC]/[ADR]/[GUIDE]/[RUNBOOK]），交叉标记已解读 vs 未解读，按引用频率 (PageRank-lite) 排序
  - `skills/init/templates/METHODOLOGY.md` 新增 §1.5 "Project Discovery"（v0.1 → v0.2），文档化 scan → locate → 8-stage 推荐工作流

- **`docs/[ADR]_LearnKit_Discovery_Skills.md`** — 决策记录：为什么选 2 skill 而非 1 或 3；为什么纯启发式而非 manifest；为什么不引入持久化 cache

- **`docs/INDEX.md`** — 新增 Architecture Decision Records 段，登记 ADR

### Changed

- **`.claude-plugin/marketplace.json`** — metadata.version 3.0.0 → 3.1.0；learn-kit 条目 version 0.1.0 → 0.2.0 + description 提及 locate/scan + keywords 扩展（discovery / locate / scan）
- **`VERSION`** — 3.0.0 → 3.1.0
- **`README.md`** — version badge 3.0.0 → 3.1.0；learn-kit 插件目录行更新（skills 1 → 3、version 0.1.0 → 0.2.0、description 更新）；使用示例段补充 `/learn-kit:locate` 与 `/learn-kit:scan`

### Design notes

- Pure heuristic project recognition (零配置)：扫 CLAUDE.md tag 声明 + learning/INDEX.md / docs/INDEX.md 存在性 + 文件 tag prefix 实测；confidence 分级 ≥0.95 / 0.85–0.95 / 0.7–0.85 / <0.7-with-warning
- Stateless re-scan：每次调用全量扫描，无 cache / manifest / 持久化索引；典型项目 (<500 doc) 1–5s 完成
- 与 notebooklm-kit 解耦：learn-kit discovery 不直接调 NotebookLM；用户 read 后自行决定是否生成 NLM 制品
- mj-system / mj-agent / 用户全局 settings / ranzuozhou/my-marketplace 一律零改动；消费者侧整合保留为可选 follow-up

### Risk

- 启发式识别在 tag 不统一项目失效 → 已设 confidence < 0.7 warning + best-effort 兜底
- 大项目（>1000 doc）Grep 性能退化 → 已设 `path:` / `tag:` 限定参数

## [3.0.0] - 2026-05-11

### Breaking Changes

Marketplace 从 "MJ System 团队专属工具集" 重构为 "通用 Claude Code 插件市场"。完整迁移指引见 [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)。

### Removed

- **mj-sys-doc** v3.0.2 — 已迁回 mj-system 项目 in-tree skills（`.claude/skills/mj-sys-doc-*/`）
- **mj-sys-git** v2.0.0 — 已迁回 mj-system 项目 in-tree skills
- **mj-sys-n8n** v2.0.0 — 已迁回 mj-system 项目 in-tree skills
- **mj-sys-ops** v2.0.0 — 已迁回 mj-system 项目 in-tree skills
- **mj-agent-code-doc** v0.1.0 — 已迁回 mj-agent 项目 in-tree skills

### Added

- **learn-kit** v0.1.0 — 教学方法论 kit：8 阶段方法（Source Intake / Framework Induction / Categorical Alignment / Asymmetry Handling / Terminology Pairing / Metaphor Unification / Page Assembly / Quality Gates）+ METHODOLOGY / NLM_RECORD_TEMPLATE / INDEX 模板 + RFC 2119 worked example + `/learn-kit:init` scaffold 命令。从 mj-system v2.0 STANDARD-tier `[LEARNING]_Rule_List_Interpretation_Authoring.md`（N=5 跨域验证）剥离 MJ 引用通用化而来。

- **notebooklm-kit** v2.4.1 — NotebookLM 集成（auth / build / studio / query / manage 5 个 base skill + learn-make / learn-test 2 个高级 wrapper + _shared 公共内容）。**从 `mj-nlm` v2.4.1（ranzuozhou/my-marketplace）迁移并重命名而来**。功能 1:1 保留；8 个 skill folder 去 `mj-nlm-` 前缀；slash 命令 namespace `/mj-nlm:X` → `/notebooklm-kit:X`；MCP server 名保持 `notebooklm-mcp` 未变；`author.name` 保留 `ranzuozhou`（创作者归属）。

### Changed

- `metadata.description` 重写：从 "MJ System 团队插件市场 — 提供文档、Git、n8n、运维等 Claude Code 插件" 改为 "Generic Claude Code plugins for AI engineering workflows. NotebookLM integration (notebooklm-kit) and pedagogical methodology (learn-kit). Tested with mj-system and mj-agent."
- 顶层 `README.md` 重写：反映 generic 定位 + 新插件目录 + v3.0.0 迁移指引入口
- `VERSION` 文件：2.1.1 → 3.0.0

### Migration

旧来源 `ranzuozhou/my-marketplace/mj-nlm` 保持可用（未删除），消费者按需切换。mj-system / mj-agent 两项目本身不在本 PR 修改范围——消费者侧整合（settings.json / 文档引用清理）由各项目维护者按需推进。详见 [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)。

### Risk

- mj-system / mj-agent 项目 `.claude/settings.json` 中残留 `mj-sys-*` / `mj-agent-code-doc` 启用条目变成 orphan plugin reference（无害，可独立清理）
- 用户在 `~/.claude/settings.json` 中残留 `mj-nlm@my-marketplace` 仍可用（来源未删）

## [2.1.1] - 2026-04-30

### Fixed

- **mj-sys-doc 3.0.0 → 3.0.1** (#57, fix #56) — `validate_doc.py:parse_frontmatter` 未剥离 YAML quoted scalar 引号，导致所有 v5.0 frontmatter（默认 quoted form 如 `state: "active"`）被检查为含字面引号字符串 → 与未引号 `VALID_STATES`/`VALID_TYPES`/`VALID_DOMAINS` 集合比较后误报 A3 FAIL。新增 `_strip_yaml_quotes` 辅助函数剥离首尾匹配引号；下游所有 v5.0 文档库（mj-system + 任何 v5.0 仓）A3 误报消除

### Added

- **mj-sys-doc 3.0.1 → 3.0.2** (#59, fix #58) — `validate_doc.py:VALID_DOMAINS` 注册新服务域 `SVL`（SubmitVolumeLoader），与已登记的 `QVL` 平行；支持 mj-system #173 引入的新 biz/ops 域服务

## [2.1.0] - 2026-04-29

### Added
- 新增插件 `mj-agent-code-doc` v0.1.0 — MJ-Agent code-side 文档工作流 plugin
  （v0.1 部分骨架，含 plan + author 2 个 skill；validate + sync 推迟至 Phase 1）(#54)
  - `mj-agent-code-doc-plan` — 跨多文档大型变更的 PLAN 起草引导
  - `mj-agent-code-doc-author` — 8 类 canonical 起草引导
    （GUIDE / ADR / SPEC / RUNBOOK / POSTMORTEM / STANDARD / ISSUE / ASSESSMENT）
  - SKILL.md 采用 Claude Code 原生 schema（per mj-agent ADR-013）

### Changed
- mj-sys-git: 重新加密 `secrets-sys-git.enc`（恢复的 GitHub PAT），无代码变更 (#53)
- 各插件 CHANGELOG 对齐 Keep a Changelog 格式 (#54)
- README.md 同步至 marketplace.json 实际版本：插件目录表格修正 + 新增 mj-agent-code-doc 行 + 顶部 version 徽章更新（修正自 v1.3.2 / v2.0.0 起的版本漂移）

## [2.0.0] - 2026-04-25

### Breaking Changes
为 mj-agent 家族插件预留命名空间，所有现有 mj-system 专属插件重命名为 `mj-sys-*` 前缀：
- `mj-doc` → `mj-sys-doc` v3.0.0
- `mj-git` → `mj-sys-git` v2.0.0
- `mj-n8n` → `mj-sys-n8n` v2.0.0
- `mj-ops` → `mj-sys-ops` v2.0.0

用户迁移步骤见 `[GUIDE]_Updated_Plugin_Installation_Steps.md`。

未来 mj-agent 家族插件将采用 `mj-agent-*` 前缀，与 mj-sys-* 形成镜像结构。

## [1.3.2] - 2026-04-22

### Changed
- mj-ops: 轮换加密运维密钥，无代码变更 (#49)

## [1.3.1] - 2026-04-11

### Fixed
- mj-ops: `pg-server-start.cmd` 新增 npx 缓存依赖完整性校验，防止缓存损坏导致 postgres-* MCP server 永久 `failed` (#46)

## [1.3.0] - 2026-04-03

### Added
- mj-doc: 升级至 v2.0.0，全面支持 Documentation Management Framework v5.0
- mj-doc: 新增 A4（链接存在性）、A5（INDEX 管理块同步）、A6（CLAUDE.md 允许列表）阻断性检查
- mj-doc: 新增 `--repo-root`、`--pr-mode`、`--write-managed-indexes` CLI 参数
- mj-doc: 新增 Q-12 交互节点（文档层级归属歧义）
- mj-doc: 新增 v4.5→v5.0 前置元数据映射和状态映射表
- mj-doc: 新增 unittest 回归测试套件

### Changed
- mj-doc: **BREAKING** — v2.0 仅支持已完成 v5.0 迁移的仓库（v1.2.0 → v2.0.0）
- mj-doc: 前置元数据模式从 v4.5 切换为 v5.0（type/domain/summary/owner/created/updated/state）
- mj-doc: 状态生命周期从 6+ 中文状态简化为 draft/active/deprecated
- mj-doc: 校验检查重编号为 A1-A6（阻断性）+ OB1-OB5（非阻断性）
- mj-doc: 计划输出路径从 `docs/plans/` 变更为顶级 `plans/`

## [1.2.6] - 2026-04-02

### Fixed
- mj-ops: MCP postgres 查询结果中 timestamp/timestamptz 字段保留 PostgreSQL 原始时区格式，不再转为 UTC (#38)
- mj-n8n: WeChat 通知模板时间字段从 UTC ISO 格式改为北京时间显示，新增 DateTime 时区处理约定 (#39)

## [1.2.5] - 2026-03-27

### Changed
- mj-doc: 全部 6 个技能同步至 Documentation Management Framework v4.5，新增 `[ISSUE]` 和 `[ASSESSMENT]` 文档类型支持（v1.1.0 → v1.2.0）

### Fixed
- scripts: bump-version.ps1 同步 README 插件版本表

## [1.2.4] - 2026-03-24

### Fixed
- mj-ops + mj-git: `Find-OpenSSL` 改为从 `git.exe` 位置动态推导 OpenSSL 路径，支持非标准 Git 安装路径

## [1.2.3] - 2026-03-24

### Fixed
- mj-ops + mj-git: `Find-OpenSSL` 优先使用 Git for Windows 标准 OpenSSL，避免 Anaconda PATH 中的非标准构建导致 `bad decrypt`

## [1.2.2] - 2026-03-23

### Fixed
- mj-ops + mj-git: 加解密脚本添加 `-md sha256` 参数，修复 OpenSSL 1.x/3.x 跨版本 PBKDF2 摘要算法不一致导致 `bad decrypt`
- mj-doc/mj-git/mj-n8n: 补充遗漏的 [1.1.0] CHANGELOG 条目（版本号与变更记录对齐）

### Changed
- mj-ops: PostgreSQL WAN MCP 条目移除 fallback 硬编码凭据，未配置环境变量时连接失败而非静默使用默认凭据

## [1.2.1] - 2026-03-23

### Fixed
- bump-version.ps1 输出文件移除 UTF-8 BOM，修复 CI marketplace.json 验证失败

### Changed
- 项目级 `.claude/settings.json` 新增 permissions 配置（allow/deny 规则）并重新启用 mp-dev、mp-git 插件

## [1.2.0] - 2026-03-23

### Added
- mj-ops: 加密秘密值管理 — `config/secrets-ops.enc`（9 变量: 4 SSH 密码 + 5 PG URLs）+ `scripts/setup-ops-env.ps1`（支持 `-Reload`、`-Force`）+ `scripts/encrypt-ops-secrets.ps1`
- mj-git: 加密秘密值管理 — `config/secrets-git.enc`（1 变量: GitHub PAT）+ `scripts/setup-git-env.ps1`（支持 `-Reload`、`-Force`）+ `scripts/encrypt-git-secrets.ps1`
- 两个插件 README.md 新增 Post-Install Setup 章节
- 两个插件 CLAUDE.md 新增 Secrets Setup 章节
- marketplace CLAUDE.md 新增 Plugin Secrets Management 章节
- docs/INDEX.md 新增 Plugin References 章节

## [1.1.5] - 2026-03-20

### Changed
- mj-ops: PostgreSQL WAN MCP 条目移除 fallback 硬编码凭据，未配置环境变量时连接失败而非静默使用默认凭据

## [1.1.4] - 2026-03-20

### Fixed
- mj-ops: PostgreSQL WAN 默认端口适配 FRP 实际范式（543202→25432、543203→35432）

## [1.1.3] - 2026-03-20

### Added
- mj-ops: 云服务器 SSH 条目 `SSH_SERVER_CLOUD_*`（8.135.38.175:22）
- mj-ops: 3 组 WAN 穿透 SSH 条目（RUNNER_WAN :2201、TEST_WAN :2202、PROD_WAN :2203）
- mj-ops: PostgreSQL MCP 服务器 postgres-test-wan、postgres-prod-lan、postgres-prod-wan
- mj-ops: env-reference.md 新增 5 个 PostgreSQL MCP URL 覆盖变量文档

### Changed
- **BREAKING** mj-ops: SSH 环境变量 `SSH_SERVER_DEV_*` 重命名为 `SSH_SERVER_RUNNER_LAN_*`
- **BREAKING** mj-ops: PostgreSQL MCP `postgres-test` 重命名为 `postgres-test-lan`
- mj-ops: SSH/PostgreSQL 条目统一 LAN/WAN 对称命名
- mj-ops: 版本 1.1.0 → 1.2.0

### Fixed
- mj-git-pr 部署策略检测从 2-case 升级为 4-case，区分基线 SQL、Flyway 迁移、双轨同步和纯代码变更，与 CI `detect-strategy` 对齐，避免误推荐 `partial-reset` 导致测试环境数据丢失

## [1.1.1] - 2026-03-18

### Added
- 导入 4 篇项目文档：项目概览、插件开发测试工作流、版本管理指南、发布操作手册
- 新增 `docs/INDEX.md` 文档导航中心（含角色推荐阅读顺序）
- 新增根 `CLAUDE.md`（marketplace 级 Claude Code agent 上下文）
- `README.md` 新增文档索引链接

### Removed
- 删除 `docs/superpowers/` 临时规划文件

### Changed
- `.gitignore` 新增 `.serena/` 规则，优化 `.claude/` 忽略模式
- 提交 `.claude/settings.json` 项目级插件启用配置

## [1.1.0] - 2026-03-17

### Changed
- 所有 26 个 SKILL.md `name` 字段从短名改为全限定名（目录名），支持短前缀调用（如 `/mj-git-commit`）
- 同步更新 4 个 Plugin 的 CLAUDE.md 和 README.md 命令表

## [1.0.0] - 2026-03-16

### Added
- 初始发布：4 个 Plugin（mj-doc, mj-git, mj-n8n, mj-ops），26 个 Skill
- Plugin Marketplace 元数据结构（marketplace.json）
- 各 Plugin 含 CLAUDE.md、README.md、plugin.json、SKILL.md
