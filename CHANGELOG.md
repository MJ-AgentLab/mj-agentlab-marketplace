# Changelog

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [4.2.0] - 2026-05-15

### Added

- **Marketplace Documentation Framework v1.0** — 3 个新 STANDARD 落地 `docs/rule/`：
  - **`docs/rule/[STANDARD]_Documentation_Framework.md`** v1.0 — 6 tag prefixes (`[STANDARD]` / `[ADR]` / `[GUIDE]` / `[RUNBOOK]` / `[SPEC]` / `[POSTMORTEM]`) + 8-field frontmatter (type/scope/summary/owner/created/updated/state/version) + 3-state machine (active/deprecated/archived) + 路径稳定性（active 文件无 `_vX.Y` 后缀，version 居 frontmatter） + INDEX sync 强制 + SKILL.md 显式豁免（用 Claude Code spec native frontmatter）。Adapted from mj-agent Meta v2.2，剔除 track multiplexing / 12 文档类型 / CI gates 等过量内容。
  - **`docs/rule/[STANDARD]_Commit_Message_Convention.md`** v1.0 — `<type>(<scope>): <summary>` + 7 types (feat/fix/perf/refactor/test/docs/infra) + marketplace scope whitelist (v4.x: `learn-kit`, `marketplace`, `ci`, `scripts`, `deps`, `infra`, `docs-rule`, `docs-adr`, `docs-guide`, `docs-runbook`, `docs-spec`, `release`) + branch-type × commit-type 矩阵 + commit 拆分指导 + Co-Authored-By 模式。提取自 `docs/CONTRIBUTING.md` § 提交规范（旧版引用过期 mj-sys-* scopes），扩展为完整 STANDARD。
  - **`docs/rule/[STANDARD]_GitHub_Markdown.md`** v1.0 — Canonical 渲染环境 GitHub web；ATX headings (only) + GFM tables + GitHub native 5 alerts (`[!NOTE]` 等) + frontmatter syntax 严格约束 (ISO-8601 dates, block-style lists, lowercase enums) + 代码块语言 hint + 锚点 ID 自动生成规则 + Mermaid / DOT 用法。Adopted from mj-agent v1.0 ~95% 内容；调整路径示例。

- **`docs/_templates/` — 6 个起草骨架模板**：
  - `TEMPLATE_STANDARD.md` (5 段: Scope / Rules / Examples / Verification / History)
  - `TEMPLATE_ADR.md` (Michael Nygard 7 段: Context / Decision / Consequences / Alternatives / Implementation Plan / AC / References / Decision Log)
  - `TEMPLATE_GUIDE.md` (3 段宽松: Audience / Walkthrough / Further Reading)
  - `TEMPLATE_RUNBOOK.md` (4 段 + `last-verified`: Preconditions / Steps / Verification / Rollback)
  - `TEMPLATE_SPEC.md` (5 段: Purpose / Schema / Examples / Validation / Versioning)
  - `TEMPLATE_POSTMORTEM.md` (6 段: Summary / Timeline / Root Cause / Impact / Remediation / Action Items)

- **`docs/spec/` — 2 个 SPEC seed**：
  - **`docs/spec/[SPEC]_Marketplace_Json_Schema.md`** v1.0 — marketplace.json 本地约定：plugins[] 字段、metadata、版本三角不变量（VERSION ↔ metadata.version ↔ plugins[].version ↔ plugin.json.version）、添加/删除 plugin 的版本影响。
  - **`docs/spec/[SPEC]_Plugin_Json_Schema.md`** v1.0 — plugin.json 6 必需字段 + `repository` MUST be string（per v3.2.1 bugfix） + 不用 `components` 字段 + 必需目录布局 + keywords 组成建议（15-25 个，混 domain / skill / tool）。

- **`docs/{rule,guide,runbook,adr,spec,postmortem,_templates}/`** 子目录全部创建（`.gitkeep` 占位空目录）。本 PR 仅创建新 docs；现有 `docs/` 根目录下的 4 GUIDEs + 1 RUNBOOK + 2 ADRs + 1 STANDARD（HITL Prompt）+ 1 lowercase generic doc 暂保留原位，在 PR 3 (v4.2.1) 通过单独的 mechanical move PR 迁移并加 frontmatter。

### Changed

- **`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`** v1.1 → **v1.2** —— §4.8 Self-review checklist 从 11 项升到 **12 项**，新增 item 12: 「新建/修改 `docs/**/*.md` 必须遵循 `[STANDARD]_Documentation_Framework` 的 frontmatter 8 字段约束 + 路径规则；用 `/mp-doc-validate` 跑审计；豁免列表明确（INDEX/CONTRIBUTING/MIGRATION_GUIDE/README/CHANGELOG/plugin CLAUDE.md/SKILL.md）」。§8 版本历史新增 v1.2 条目。
- **`docs/INDEX.md`** —— Schema 升级反映新子目录结构（rule/ guide/ runbook/ adr/ spec/ postmortem/ _templates/）；明确标注「现有文档仍在 flat `docs/` 路径，PR 3 retrofit 时迁入子目录」；新增 「Templates」 段 + 「Specifications」 段 + 「Doc Authors」 reading order；reading order 表更新引用新 STANDARDs。
- **`docs/CONTRIBUTING.md`** —— § 提交规范 段从详细表改为 5-line summary + 链 [`[STANDARD]_Commit_Message_Convention.md`](rule/[STANDARD]_Commit_Message_Convention.md)。Marketplace scope whitelist 修正为 v4.x（剔除过期的 mj-sys-* scopes）。
- **`CLAUDE.md`**（marketplace 根）—— 新增 § Documentation Framework 段（v4.2.0 起），列出 3 个新 STANDARDs + docs/ 子目录结构图 + templates / mp-doc-* skill 协作模型；段位插入在 § v4.0.0 Restructure Note 之前。
- **`.github/PULL_REQUEST_TEMPLATE/feature.md`** —— § 自检结果 段增加 「文档合规」「commit STANDARD 引用」 checkbox；新增 § Related STANDARDs 段（4 项链接）。
- **`.github/PULL_REQUEST_TEMPLATE/documentation.md`** —— § 自检结果 完全重写以引用 Documentation Framework 的 8 字段 frontmatter / 子目录路径 / markdown 风格规则；新增 § Related STANDARDs 段。

### Changed (versioning)

- **`VERSION`** — 4.1.0 → 4.2.0
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.1.0 → 4.2.0；`metadata.description` 增加 v4.2.0 段描述新 framework；`plugins[].version` 不变（learn-kit 1.0.0）

### Migration notes for users (v4.1.0 → v4.2.0)

- **现有文档无需立即迁移**：本 PR 仅引入 framework + 创建子目录。`docs/` 根目录下的 12 个现有文档（GUIDEs / RUNBOOK / ADRs / HITL Standard）保留原位，引用路径不变。
- **新文档强制走 framework**：从 v4.2.0 起，任何新建的 tag-prefixed `docs/**/*.md` 必须用 `docs/_templates/TEMPLATE_*.md` 起草，含完整 8 字段 frontmatter，落正确子目录。
- **commit format 不变** but scope whitelist 升级：从本 PR 起，scope `mj-sys-*` （v3.x 遗留）不再合法；用 `marketplace` / `learn-kit` / `docs-*` / `ci` / `scripts` / `deps` / `infra` / `release` 替代。`/mp-git-commit` skill 自动验证。
- **PR 3 (v4.2.1) 即将到来**：mechanical move 把现有 12 个文档迁入 subdirs + 加 frontmatter；该 PR 仅 rename + frontmatter retrofit，无内容编辑。

### Rationale

PR 1 (v4.1.0) 给 marketplace 配齐了 11-stage 工作流 skill 与 HITL Standard v1.1 集成；但缺失文档规范本身——AI agent 写新 ADR / GUIDE 时无统一可引用的 frontmatter schema、命名规则、状态机。本 PR 引入轻量 Hybrid 深度的 marketplace 文档框架（参考 mj-agent Meta v2.2 但剔除 track multiplexing / runtime types / CI gates），落地 3 个 STANDARDs + 6 templates + 2 SPEC seeds。Phased rollout：本 PR 仅创建 framework 本身（不动现有文档；保证内部一致性，避免 v1.0 STANDARD 引用 frontmatter 规则但现有文档不合规的窗口）；PR 3 才 mechanical migrate；PR 4 延伸至 learn-kit 内部。



### Added

- **`.claude/skills/` — 18 个项目本地 Track C 工作流 skill** 覆盖 flow + git + doc 三 family。所有 skill 用 `mp-*` 命名 prefix，匹配 mj-agent `mj-agent-*` 同源对称风格。每个 SKILL.md 含 frontmatter (name + description with 双语 trigger phrases) + 10 段 body（Overview / Workflow DOT diagram / When to Run / Step-by-step / Output Format / DOES NOT DO / Sub-skill / Reference Files / Anti-patterns / Handoff）。
  - **mp-flow-* (9)**: `intake` (Stage 0 任务准入) / `repo-scan` (Stage 1 marketplace 8 维事实核查) / `plan` (Stage 2 6 段 Plan body) / `design-adr` (Stage 3 Michael Nygard 7 段 ADR) / `author` (Stage 4 orchestrator → /plugin-dev:create-plugin + /skill-creator:skill-creator) / `compliance` (Stage 5 orchestrator → /plugin-dev:plugin-validator + skill-reviewer agents) / `dogfood` (Stage 6 真实环境验证) / `self-review` (Stage 7 11-item checklist + §4.7 双段) / `post-merge` (Stage 10 post-merge orchestrator)
  - **mp-git-* (6)**: `branch` (worktree-based bare repo 分支创建；G1 hard requirement) / `commit` (7-step pre-commit + type/branch 矩阵 + scope 推导) / `push` (7-item pre-push checklist) / `pr` (gh pr create --body-file 模式 + 6 PR template) / `merge-gate` (Stage 9 readiness + main HITL) / `cleanup` (`git worktree remove` + `git branch -D` + `git fetch --tags`)
  - **mp-doc-* (3)**: `author` (tag-prefixed doc 起草 + 8-field frontmatter；post-PR 2 framework prerequisite) / `validate` (frontmatter / path / INDEX / wikilink 合规审计) / `bump-version` (4 站点 atomic 版本同步 + CHANGELOG 段头 promote)

### Changed

- **`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`** v1.0 → **v1.1**：
  - §4.1-§4.11 Skill Hint 段全部 refactor，Preferred Skill 指向新建 `mp-*` skill；外部 plugin-dev / skill-creator skill 转为 Augment（被 orchestrator 内部调用）或 Fallback（skill 不可用时手工）
  - §5.1 Skill 矩阵填全：11 阶段无「—」（每阶段 Preferred Skill + Augment/Fallback 完整）
  - §5.2 重整为 4 大类 skill 来源表（项目本地 / 本 marketplace 插件 / 外部 plugin-dev / 通用方法学），含 2026-05-15 完整快照清单
  - §5.3 选用原则按稳定性 + 域适配优先级重排：**最优先项目本地 `mp-*` > learn-kit > plugin-dev > superpowers**
  - line 357 / 703 修正：`v4.0.0 起本 marketplace 唯一 plugin` → `本 marketplace 唯一 plugin`（去 forward-looking 表述，v4.0.0 已落地）
  - §8 版本历史加 v1.1 条目
- **`docs/[GUIDE]_Marketplace_Agent_Execution_Checklist.md`** v1.0 → **v1.1**：每 stage 新增 **Preferred Skill** 标记行；Stage 8 改为 3-skill chain；Stage 10 改为 2-skill chain；§5 版本历史更新
- **`CLAUDE.md`**（marketplace 根）—— 「11 阶段速查表」Preferred Skill 列全部填上 `/mp-*` 引用；新增 **Project-Local Skills (`.claude/skills/`)** 段说明 18 件 skill 划分 3 family；AI Engineering 段头 "v3.2.0 起" → "v4.1.0 起含 18 件项目本地 mp-* skill"

### Changed (versioning)

- **`VERSION`** — 4.0.0 → 4.1.0
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.0.0 → 4.1.0；`metadata.description` 增加 v4.1.0 段（18 项目本地 skill）；`plugins[].version` 不变（learn-kit 1.0.0 仍然，本 PR 不动 plugin）

### Rationale

v4.0.0 NotebookLM_Kit 退役 + learn-kit v1.0.0 落地后，marketplace 工作流稳态化。mj-agent 同期已发展出 34 件 `.claude/skills/mj-agent-*` Track C skill；本 PR 移植其中 18 件适用于 marketplace 静态注册表场景的（剔除 runtime / infra 两 family，剔除 n8n / SQL guardrail / Docker / LLM endpoint 等 mj-agent 专属内容）。匹配 mj-agent 同源对称风格（`<project>-<family>-<action>`）以保持跨项目 AI agent 识别一致性。



### Removed

- **`plugins/notebooklm-kit/`** — 整个插件递归删除（22 个文件：plugin.json + CLAUDE.md + CHANGELOG.md + README.md + 7 个 skill + 10 份 `nlm-shared/` 共享参考）。退役 skill：`auth` / `build` / `studio` / `learn-make` / `learn-test` / `manage` / `query`。**永久退役场景**（无替代）：quiz / flashcards / data_table / report / cross-notebook query / source 增删改 / notebook 分享 / Deep Research。用户场景中需要 quiz/flashcards 的请用外部评估工具；需要 notebook 管理的请用 notebooklm.google.com web UI；需要跨 notebook 查询的同上。

### Added

- **`plugins/learn-kit/skills/nlm-studio/SKILL.md`** + **9 个 templates** — 新 skill `/learn-kit:nlm-studio <topic>` 吸收 notebooklm-kit 的核心多媒体场景（build + studio 多媒体制品生成），但加入 **View-Purpose Preservation** 原则使生成的 artifact 显著保留 foundation/structural/challenge 三档的教学目的差异。**生成 4 view-cycled 类型 × 3 view + 1 shared view-agnostic mind_map = 13 个 artifact**（mind_map 经 dogfood 发现 NLM 对其 view 差异化无视，故收敛为 1 shared / topic）。5-step workflow with per-Step auth refresh（pre-flight: real auth gate via notebook_list, not just local refresh_auth+server_info → re-run guard → notebook setup: 3 markdown source_add + mandatory notebook_get verification → quota confirm gate → artifact generation in 3 parallel batches of 5/4/4 with mid-run auth retry-once → terminal recap）。**markdown-only 源**（HTML 在 dogfood 中被 NLM 在 file 和 text 两模式下都拒，故 v1.0.0 不上传 HTML）。零本地落盘（artifact 全在 notebooklm.google.com 在线访问）。9 个 prompt 模板：3 view-prefix（pedagogical purpose 五段必备）+ 5 artifact-suffix（4 view-cycled + 1 view-agnostic mind_map）+ 1 interaction-overrides.yaml（4 个 view × artifact 高耦合 cell 联合调优；mind_map 不在 cartesian 中）。
- **`docs/[ADR]_NotebookLM_Kit_Retirement.md`** — 新 ADR：记录 v4.0.0 退场决策（context / decision / consequences / 4 个 alternative considered + 否决理由 / compliance verification 路径）。

### Moved

- **`plugins/notebooklm-kit/.mcp.json` → `plugins/learn-kit/.mcp.json`** — `notebooklm-mcp` MCP server 注册位置迁移；server name 不变；MCP 工具前缀**自然变化**从 `mcp__plugin_notebooklm-kit_notebooklm-mcp__*` 变为 `mcp__plugin_learn-kit_notebooklm-mcp__*`（规则：`mcp__plugin_<plugin.json-name>_<server-key>__<tool>`）。

### Changed

- **`VERSION`** — 3.2.1 → 4.0.0
- **`.claude-plugin/marketplace.json`** — `metadata.version` 3.2.1 → 4.0.0；`metadata.description` 重写（从 "two plugins" 变为 "sole plugin: learn-kit"）；删 `plugins[]` 中 `notebooklm-kit` 条目；`learn-kit` 条目 version 0.3.1 → 1.0.0 + description 重写覆盖 5 个 skill + `keywords` 新增 8 词（`nlm-studio` / `notebooklm` / `audio` / `video` / `multimedia` / `slide-deck` / `mind-map` / `infographic`）—— 改善 marketplace 搜索 discoverability
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version 0.3.1 → 1.0.0；description 改写删 "Independent plugin — no external service dependencies" 加 nlm-studio 描述 + 分级依赖说明；keywords 同步加 8 个新词
- **`plugins/learn-kit/CLAUDE.md`** — 删独立性宣言；新增「v1.0.0 起的依赖」段；新增「触发 `/learn-kit:nlm-studio`」段；新增「NLM 集成 · 工具前缀」段说明 MCP prefix 规则
- **`plugins/learn-kit/CHANGELOG.md`** — 加 `[1.0.0] - 2026-05-14` 完整条目（Added / Changed / Breaking / Released as part of）
- **`plugins/learn-kit/README.md`** — opener 加多媒体流；加 §前置依赖 段；§使用 step 5 详述 nlm-studio；evolution table 加 v1.0.0 行
- **`plugins/learn-kit/skills/generate-tier/SKILL.md`** — workflow 8-step → **10-step**（HTML 渲染 step 8 后插入 optional step 9 询问是否调 nlm-studio；原 step 9 Summary 改名 step 10）；`generator` frontmatter tag bumped 到 `learn-kit/generate-tier v1.0.0`；§Non-goals 中 "no NotebookLM" 改写为「step 9 only **offers** to invoke external services; user must opt in」
- **`CLAUDE.md`**（marketplace 根）— "2 个通用插件" 改为 "1 个通用插件"；新增 §v4.0.0 Restructure Note；其他 v3.x notes 折叠到「历史版本记录」段
- **`README.md`**（marketplace 根）— version badge 3.2.1 → 4.0.0；插件表只剩 learn-kit；加 5 skill 子表；§3 使用示例 / §更新 / §v3.x → v4.0.0 迁移指引 / §历史版本 全部按 1-plugin 重写
- **`docs/INDEX.md`** — Architecture Decision Records 表加新 ADR 行；Plugin References 段更新为 1-plugin 状态
- **`docs/MIGRATION_GUIDE.md`** — 重排：原内容归 §1 v2.x→v3.0.0；新增 §2 v3.2.x→v4.0.0（退役 skill 替代矩阵 + 工具前缀变化 + 用户迁移 5 步 + legacy mj-nlm 卸载提醒 + 历史 NLM 数据兼容性 + 回滚路径）
- **`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`** — 4 处 `notebooklm-kit` 引用更新（line 357 reference docs / 427 skill-reviewer fallback / 699 hybrid skill matrix / 704 marketplace 自有 skill 选用原则）

### Breaking

- **Marketplace surface 减少**：v3.x 的 2 plugin 减到 v4.0.0 的 1 plugin。用户 `~/.claude/settings.json` 中如显式 enable 过 `notebooklm-kit@mj-agentlab-marketplace` 的条目会成为 orphan reference（无害）。
- **退役 7 个 skill** 无替代（详见 §Removed）；用户场景中真依赖 quiz / cross-notebook / source 管理者需要切换到外部工具或 web UI。
- **MCP server 重复加载风险**：如用户曾手动注册 legacy `mj-nlm@my-marketplace` plugin，升级 v4.0.0 后会出现两个 `notebooklm-mcp` server 同名加载；MIGRATION_GUIDE 明示需 `/plugin uninstall mj-nlm@my-marketplace`。

### Dogfood-validated design adjustments (in v4.0.0 PR pre-merge)

End-to-end dogfooding of `/learn-kit:nlm-studio documentation-framework` against mj-agent's `learning/documentation-framework/` produced 5 findings that reshaped the v1.0.0 release before merge:

1. **HTML upload dropped** — NLM rejects `.html` source uploads in both `source_type="file"` and `source_type="text"` modes for non-trivial content. The L2 file→text fallback in earlier drafts is removed entirely. Only 3 `.md` files are uploaded per topic. HTML output of `/learn-kit:generate-tier` is now explicitly for human browser viewing only, not NLM ingestion. Source count per notebook: 6 → 3.
2. **Pre-flight strengthened** — `refresh_auth` + `server_info` are local-only checks (token presence + freshness timestamp); they do NOT verify Google still accepts the token. Step 1.4 now calls `notebook_list` as a real network-level auth gate.
3. **Per-Step auth refresh** — NLM tokens observed to expire within 15–30 min, often inside a single 7–15 min `nlm-studio` run. Every Step now refreshes auth at its start; mid-run auth failure in Step 4 retries once before aborting.
4. **Post-upload verification mandatory** — `source_add` error responses are unreliable (server may async-succeed despite client error). Step 3 now mandates `notebook_get` to cross-check the actual source list; trust notebook_get over the source_add response.
5. **Mind_map collapsed to view-agnostic** — NLM's mind_map artifact type produces near-identical structural-hierarchy output across foundation/structural/challenge prompting variants. Producing 3 view-cycled mind_maps wasted quota for redundant content. v1.0.0 ships with one shared mind_map per topic; previous structural+mind_map interaction-override removed; artifact total: 15 → 13.

Additional optimization: parallel batches of 5 `studio_create` calls per round work without rate-limiting, replacing the original strict-sequential design for ~3× speedup.

### Released

通过 release.yml 自动 tag `v4.0.0` + 创建 GitHub Release (trigger: push to main + paths: VERSION)。本次包含 marketplace v4.0.0 + learn-kit v1.0.0 双 tag（marketplace 主标签；learn-kit 跟随 marketplace tag policy）。

## [3.2.1] - 2026-05-14

### Fixed

- **`plugins/learn-kit/.claude-plugin/plugin.json`** + **`plugins/notebooklm-kit/.claude-plugin/plugin.json`** — `repository` field rewritten from `{ type, url }` object form to string form, per [Claude Code plugin manifest schema](https://code.claude.com/docs/en/plugins-reference). Prior shape caused `/plugin` install to fail with `Validation errors: repository: Invalid input: expected string, received object`. (PR #70)

### Changed

- **`VERSION`** — 3.2.0 → 3.2.1
- **`.claude-plugin/marketplace.json`** — `metadata.version` 3.2.0 → 3.2.1; `notebooklm-kit` entry version 2.4.1 → 2.4.2; `learn-kit` entry version 0.3.0 → 0.3.1
- **`plugins/notebooklm-kit/.claude-plugin/plugin.json`** — version 2.4.1 → 2.4.2 (cache-bust patch so `/plugin update` picks up the manifest fix)
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version 0.3.0 → 0.3.1 (same rationale)
- **`README.md`** — badge 3.1.0 → 3.2.1 (also corrects stale badge that was not bumped during v3.2.0); plugin table `notebooklm-kit` version 2.4.1 → 2.4.2; `learn-kit` row updated (version 0.2.0 → 0.3.1, skills 3 → 4 to reflect `generate-tier` added in v3.2.0, description appends generate-tier mention)

### Released

通过 release.yml 自动 tag `v3.2.1` + 创建 GitHub Release (trigger: push to main + paths: VERSION)

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
