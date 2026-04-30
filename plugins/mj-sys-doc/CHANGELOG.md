# Changelog — mj-doc

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [3.0.1] - 2026-04-30

### Fixed

- **`mj-sys-doc-validate` A3 enum check 误报 (#56)** — `parse_frontmatter` 未剥离 YAML quoted scalar 引号，导致 `state: "active"` / `type: "adr"` / `domain: "N8N"` 等合法 frontmatter 都被检查为字面值（含引号）→ 与 `VALID_STATES` / `VALID_TYPES` / `VALID_DOMAINS` 比较后报 FAIL。修复后引号自动剥离，所有 v5.0 合法文档恢复 A3 PASS（验证：mj-system 仓 ADR-001 ~ ADR-006 + STANDARD/SPEC/GUIDE 文档全部通过）

## [3.0.0] - 2026-04-25

### Breaking Changes
- **Plugin renamed**: `mj-doc` → `mj-sys-doc`（为 mj-agent 家族预留命名空间）
- **All skills renamed**: `mj-doc-*` → `mj-sys-doc-*`（6 个 skill + shared 目录）
- 用户需执行 `/plugin uninstall mj-doc@mj-agentlab-marketplace` 后 `/plugin install mj-sys-doc@mj-agentlab-marketplace`

## [2.0.0] - 2026-04-03

### Breaking Changes
- **v5.0-only compatibility**: mj-doc v2.0 仅支持已完成 Framework v5.0 迁移的仓库
- Frontmatter 模式从 v4.5（tags/aliases/date/updated/version/status/owner）变更为 v5.0（type/domain/summary/owner/created/updated/state + 类型特定字段）
- 状态生命周期从 6+ 中文状态简化为 3 个英文状态：`draft` / `active` / `deprecated`
- `[DEPRECATED]` 文件名前缀移除，改用 `state: deprecated`
- 校验检查从 A1-A4 + SA1-SA3 重编号为 A1-A6（阻断性）+ OB1-OB5（非阻断性）
- `docs/plans/` 路径变更为顶级 `plans/`

### Added
- A4: 内部链接目标存在性校验（支持 Wikilink、相对路径、标题锚点）
- A5: INDEX.md 管理块同步校验（`<!-- mj-doc:index:start/end -->` 标记）
- A6: CLAUDE.md 允许列表触发（PR 模式，`--pr-mode --base-ref`）
- `SKIP` 状态：根特殊文件和不适用检查返回 SKIP 而非虚假 PASS
- `--repo-root` CLI 参数（A4、A5、A6 和 INDEX 生成必需）
- `--write-managed-indexes` 使用与 A5 相同的渲染函数生成 INDEX 管理块
- `--pr-mode --base-ref [--head-ref]` 启用 A6 检查
- Q-12: 文档层级归属歧义（canonical vs working）交互节点
- v4.5 → v5.0 frontmatter 映射和状态映射表（migration-rules.md）
- `[DEPRECATED]` 文件迁移重命名规则
- 三层治理模型文档（canonical / working / legacy）
- Domain Registry（14 个有效域缩写）
- unittest 回归测试套件（tests/ + fixtures/）

### Changed
- 全部 SKILL.md: Framework v4.5 引用更新为 Framework v5.0
- validate_doc.py: 完全重写，支持 A1-A6 + OB1-OB5 + 管理块生成
- validation-rules.md: 完全重写为 v5.0 规则参考
- quality-gate.md: 完全重写，中文状态矩阵替换为 3 状态模型
- migration-rules.md: 完全重写，新增 v4.5→v5.0 映射表
- obsidian-rules.md: 新增 v5.0 链接格式场景和 A4 范围说明
- template-patterns.md: Service Abbreviation Registry 重命名为 Domain Registry，INDEX.md 改为管理块文档
- code-doc-mapping.md: 字段名更新（status→state, date→created），新增 INDEX 管理块再生触发
- mj-doc-sync: INDEX 更新改为通过 validator 管理块生成
- mj-doc-plan: 计划输出路径从 `docs/plans/` 变更为 `plans/`，使用 v5.0 轻量 frontmatter
- mj-doc-migrate: 新增 v4.5→v5.0 迁移为主要用例

## [1.2.0] - 2026-03-27

### Added
- 支持 Framework v4.5 新增的 `[ISSUE]` 和 `[ASSESSMENT]` 文档类型
- validation-rules.md: 新增 ISSUE/ASSESSMENT 的 A1 frontmatter 字段、A2 文件名正则、A3 行数范围、A4 时态规则、SA1/SA2 内容边界
- validate_doc.py: 新增 ISSUE_EXTRA_FIELDS / ASSESSMENT_EXTRA_FIELDS 常量及对应校验逻辑
- type-decision-reference.md: 新增决策树分支、5 组混淆对、内容边界表
- template-patterns.md: 新增 TEMPLATE_ISSUE / TEMPLATE_ASSESSMENT 模板条目及 8 个域缩写
- question-patterns.md: 新增 Q-10（ISSUE vs POSTMORTEM 歧义）和 Q-11（ISSUE 深度判断）
- plan-checklist.md: 新增 ISSUE/ASSESSMENT 缺口分析条目和 §11 扩展触发条件
- quality-gate.md: 更新状态转换矩阵（新增 已修复 状态），新增不可变/追加式文档说明
- migration-rules.md: 新增问题分析/优化报告内容的迁移映射
- code-doc-mapping.md: 新增 ISSUE/ASSESSMENT 权威来源说明
- author SKILL.md: 新增 ISSUE/ASSESSMENT 目录归属和编号规则

### Changed
- 全部 SKILL.md: Framework v4 引用更新为 Framework v4.5
- author SKILL.md 描述: 文档类型列表从 6 种扩展为 8 种

## [1.1.0] - 2026-03-17

### Changed
- Skill 调用快捷方式统一使用 fully-qualified 名称（`mj-doc:skill-name`）
- 标准化所有 SKILL.md 描述格式

## [1.0.0] - 2026-03-16

### Added
- 初始发布：6 个 Skill + 1 个共享资源（mj-doc-shared）
- Skills: plan, author, validate, review, sync, migrate
- 共享资源: question-patterns（Q-01 ~ Q-09, D-01 ~ D-04）
