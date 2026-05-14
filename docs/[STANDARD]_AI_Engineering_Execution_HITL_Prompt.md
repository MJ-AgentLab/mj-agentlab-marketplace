# [STANDARD] AI Engineering Execution HITL Prompt — MJ AgentLab Marketplace

| Field | Value |
|-------|-------|
| **Status** | Active |
| **Version** | v1.0 |
| **Created** | 2026-05-11 |
| **Updated** | 2026-05-11 |
| **Scope** | mj-agentlab-marketplace 仓库（不含 mj-system / mj-agent / 任何下游消费者）|
| **Audience** | Marketplace 维护者 / 插件贡献者 / Claude Code agent |

---

## §0 适用范围 与 mj-system 同名 STANDARD 的关系

本 STANDARD 规范 mj-agentlab-marketplace 仓库内 AI Agent 从任务准入到合并发布的完整闭环，并明确何时需要 HITL（Human-in-the-Loop）确认。

**核心原则**：AI 自主推进低风险、可逆、符合既有 plugin spec 与 marketplace 治理资产的事项；凡涉及 plugin 删除 / 重命名 / 主版本 bump / CI workflow / 公共 plugin API / 发布动作的事项，必须暂停并请求人工确认。

**与 mj-system `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` 的关系**：本 STANDARD 与 mj-system 同名文档是「同款骨架，不同细节」。mj-system 服务的是数据处理与服务架构系统（DB / n8n / ETL / FastAPI / Flyway），marketplace 服务的是 Claude Code 插件市场，业务实体完全不同。**两者共享 HITL 哲学（low/med/high risk 分级）+ Plan→Design→Implement→Verify→Self-review→PR→Merge→Post-merge 流程框架，但具体阶段集 / Reference Docs / Skill 矩阵 / Rules 各自独立维护**。两者不强同步。

**适用边界**：本 STANDARD 不约束：
- mj-system / mj-agent 等下游消费者的项目内部流程
- 用户全局 `~/.claude/settings.json` 启用配置
- 外部 plugin 上游仓库（如 `ranzuozhou/my-marketplace`）

**Working-doc 边界**：marketplace **不维护** `plans/` 目录（与 mj-system 不同）。任务过程中的 working plan 写在用户本地（`~/.claude/plans/`）或嵌入 PR description，不进 marketplace repo。

---

## §1 总体流程

mj-agentlab-marketplace 把 mj-system 的 17 阶段压缩为 marketplace 实际使用的 11 阶段：

```text
0.  Intake：任务准入评估（risk-level / scope / 文档需求）
1.  Repo Scan：marketplace 事实核查（marketplace.json / plugin.json / SKILL.md / CI rules / VERSION）
2.  Plan：执行计划（落 ~/.claude/plans/ 或工作环境临时位置；marketplace 不维护 plans/ 目录）
3.  Design Decision (ADR)：架构 / 命名 / 重命名 / 拆分等决策（合并 mj-system Stage 6 SPEC/ADR/RUNBOOK 为单一 ADR）
4.  Plugin / Skill Authoring：用 /plugin-dev:create-plugin + /skill-creator:skill-creator 创建 / 改造
5.  Plugin Compliance：/plugin-dev:plugin-validator + /plugin-dev:skill-reviewer 双重审
6.  Local Dogfood / Verification：plugin install 验证 + read-only 算法模拟真实场景跑通
7.  AI Self-review：双段（本地验证 / AI 自检）+ 11-item checklist
8.  Commit / Push / PR：logical commit + 6 PR template 选型 + --body-file
9.  Review → Merge → Release：CI 6 步 / review / merge / release.yml VERSION-trigger 自动 tag
10. Post-merge Cleanup：worktree remove + branch delete + tag verify
```

**与 mj-system 17 阶段对应表**：

| Marketplace 阶段 | mj-system 阶段 | 备注 |
|-----------------|---------------|------|
| 0 Intake | 0 Intake + 1 Issue Draft | 合并；marketplace Issue 较少（小仓） |
| 1 Repo Scan | 3 Repo Scan | fact-check 矩阵不同 |
| 2 Plan | 4 Plan | 同 |
| 3 Design Decision (ADR) | 6 SPEC/ADR/RUNBOOK | 合并；marketplace 主用 ADR |
| 4 Plugin/Skill Authoring | 8 Implementation | 改写：skill 工具链不同 |
| 5 Plugin Compliance | 10 Local Verification（部分） | 工具特化 |
| 6 Local Dogfood | 10 Local Verification（部分） | 真实跑通 |
| 7 AI Self-review | 11 Self-review | 同框架，5a-5d 重定义 |
| 8 Commit/Push/PR | 12+13+14 | 合并 |
| 9 Review→Merge→Release | 15+16+17（部分） | 合并；含 release.yml 自动化 |
| 10 Post-merge Cleanup | 17 Post-merge（部分） | 简化 |
| — | 2 Branch/Worktree | 隐含于 plan workflow，不单列 |
| — | 5/7 HITL Gates | 隐含于各阶段尾段 |
| — | 9 Scope Drift | 合并入 Implementation Rules |

---

## §2 Prompt 通用结构

每个阶段 Prompt 推荐使用以下结构：

```markdown
## Task

说明当前阶段要完成什么。

## Reference Docs

### Must Follow
- `必须遵守的规范文档`

### Use As Template
- `输出结构模板`

### Consult If Affected
- `仅当涉及对应领域时参考的文档`

## Skill Hint

Preferred Skill:
- `/plugin-name:skill-name`

Use When:
- 说明何时使用该 skill

Fallback:
- 如果 skill 不可用，按哪些规则手动执行

## Rules

列出本阶段禁止事项、必须事项、HITL 触发条件。

## Output

说明期望输出格式。
```

### §2.1 Reference Docs 规则

- 标准文档用于约束行为
- 模板文档用于约束输出结构
- Plan / ADR 用于约束任务边界
- `plugin.json` / `marketplace.json` / `SKILL.md` 是 marketplace 真相源——任何不一致以这些为准
- 不要写"参考所有 docs/**"
- 如果参考文档、Plan、代码现状冲突，必须触发 HITL

### §2.2 Skill Hint 规则

marketplace 引用的 skill **大部分来自外部插件**（plugin-dev / skill-creator / superpowers），名称随上游版本演进可能变化。Prompt 推荐 skill 时按以下格式：

```markdown
## Skill Hint

Preferred Skill:
- `/plugin-dev:create-plugin`

Use When:
- 新建 plugin 或在已有 plugin 内系统化加 skill

Fallback:
- 如果 skill 不可用，按 plugin spec 手工搭建（.claude-plugin/plugin.json + 必备 5 文件 + skills/<name>/SKILL.md）
```

调用前先 `/plugin list` 或 Skill tool 列表确认可达性，详见 §5 Skill 矩阵。

---

## §3 HITL 通用规则

### §3.1 必须暂停确认

出现以下情况时，AI 必须暂停：

- 任务目标 / 范围 / 验收标准不清楚
- Issue / Plan / ADR 与代码现状冲突
- 涉及 `marketplace.json` schema 变更（plugins 数组结构 / metadata 字段）
- 涉及 `plugin.json` 字段约定（spec compliance 边界 / 6 必需字段 / 新增 / 删除 plugin 条目）
- 涉及 `SKILL.md` frontmatter 字段（name / description / disable-model-invocation / allowed-tools）
- 涉及 plugin 删除 / 重命名 / 主版本 bump（breaking change for downstream consumers）
- 涉及 marketplace `VERSION` 主版本 bump
- 涉及 CI workflow 修改（`ci.yml` / `release.yml`）
- 涉及 plugin secrets / 凭据管理（即使当前 v3.x 无 plugin 持有 secrets，约束仍保留）
- 涉及发布动作（PR develop → main，merge 会触发 release.yml 自动 tag）
- Review comment 改变 plugin 行为 / SKILL description / allowed-tools 边界
- 测试失败且原因不明确
- 实现中 scope 明显扩大（如本来只加 skill，演变成改 marketplace.json schema）

### §3.2 可以默认处理

以下情况 AI 可以自主处理，但需记录假设：

- 低风险格式修正
- 拼写 / 链接 / frontmatter 小修
- CHANGELOG `[Unreleased]` 段累加
- README.md 例子更新（不改语义）
- 新 plugin 配套文档骨架（CLAUDE.md / README / CHANGELOG / LICENSE 5 件套）
- 既有 plugin 内 skill 增加（如 v3.1.0 加 locate / scan）
- 修复 lint / 格式标准化
- 与代码变更直接对应的文档更新

### §3.3 提问格式

```text
问题 N：
- 当前观察：
- 不确定点：
- 为什么重要：
- 可选方案：
  A.
  B.
  C.
- 我的建议：
- 默认假设：
- 是否必须等待人工确认：是 / 否
```

每次最多提出 3-5 个关键问题（参考 mj-system §3.3 提问格式；上述 7 字段对应 Goal / Problem / Solutions / Context / Self-suggestion / Default / Stop-or-not）。

---

## §4 分阶段 Prompt

### §4.1 Intake Prompt

```markdown
## Task

请先做 mj-agentlab-marketplace 任务 Intake。不要创建 branch / worktree / 文件，不要修改代码。

## Reference Docs

### Must Follow
- 本 STANDARD §3 HITL 通用规则
- `docs/CONTRIBUTING.md`

### Consult If Affected
- `docs/[GUIDE]_Marketplace_Project_Overview.md`
- `docs/[GUIDE]_Version_Management.md`

## Skill Hint

无固定 skill。可选 `superpowers:brainstorming` 辅助澄清模糊需求。

## Rules

请判断：
1. 任务类型：feature / bugfix / documentation / maintain / hotfix / release（其中 release 不是源任务类型，由开发者人工发起 develop → main release PR，对应 `release.md` template）
2. base branch：develop（feature/bugfix/documentation/maintain）/ main（hotfix）/ develop（release PR）
3. 涉及范围：marketplace 元数据 / 单个 plugin / 多个 plugin / docs / CI
4. 是否涉及版本 bump（plugin 级 / marketplace 级 / 两者）
5. 风险等级：Low / Medium / High（按 §3.1 清单）
6. 是否需要 Plan / ADR / GUIDE / RUNBOOK 新增
7. 是否存在必须 HITL 的问题

## Output

输出：Intake Result / 推荐分支名 / Affected Areas / Documentation Needed / Verification Plan / HITL Questions
```

---

### §4.2 Repo Scan Prompt

```markdown
## Task

请基于 Intake Result 执行 marketplace 事实核查。不要修改任何文件。

## Reference Docs

### Must Follow
- `docs/[GUIDE]_Marketplace_Project_Overview.md`
- `docs/[GUIDE]_Version_Management.md`
- `.github/workflows/ci.yml`（6 步验证清单）

## Skill Hint

无固定 skill。手工 Glob / Grep / Read 完成。

## Rules

请检查（marketplace 事实核查 8 维）：
1. 当前 branch / worktree / diff / 未跟踪文件
2. 受影响 plugin（`plugins/*/`）
3. `marketplace.json` plugins 数组当前状态（版本 / description / keywords）
4. 各 `plugin.json` 字段（version / description / keywords / 6 必需字段）
5. SKILL.md frontmatter（受影响 plugin 的所有 skill）
6. `VERSION` 与 `marketplace.json metadata.version` 一致性
7. 顶层 `CLAUDE.md` + `CHANGELOG.md` + `docs/INDEX.md` 是否需更新
8. `.github/workflows/ci.yml` 6 步验证是否覆盖本次改动

涉及版本变更时，必须读取真实 `plugin.json.version` 与 `marketplace.json plugins[].version`，不得仅凭命名推断。

## Output

输出：Repo Scan Result / Current State / Affected Areas / Documentation Decision / Plan Verdict / HITL Questions
```

---

### §4.3 Plan Prompt

```markdown
## Task

基于 Repo Scan Result 编写或更新执行 Plan。

## Reference Docs

### Must Follow
- 本 STANDARD §3
- `docs/CONTRIBUTING.md`

## Skill Hint

可选 `superpowers:writing-plans`。无 marketplace 自有 plans/ skill。

## Rules

Plan 写入位置（按使用环境）：
- 用户本地工作环境：`~/.claude/plans/<topic>.md`
- 协作环境：在 PR description 中嵌入压缩版 plan

marketplace **不维护** `plans/` 目录（与 mj-system 不同）；working plan 在用户本地。

Plan 只写：怎么推进 / 步骤顺序 / 风险控制 / 文档决策 / 验证计划 / 完成标准。
Plan 不写：详细 plugin 接口契约 / 完整实现代码。

## Output

输出：Plan 摘要 / Plan 正文草案 / 是否需要 ADR / HITL Questions
```

---

### §4.4 Design Decision (ADR) Prompt

```markdown
## Task

请根据已确认的 Plan 编写或更新 ADR。

## Reference Docs

### Must Follow
- `docs/[ADR]_LearnKit_Discovery_Skills.md`（写作风格样板）

## Skill Hint

无固定 skill。按既有 ADR 风格手工编写。

## Rules

判断：
- 架构 / 命名 / 重命名 / 拆分决策：新建或更新 ADR
- 运维操作 / 回滚（如 marketplace 重大重构）：新建 RUNBOOK 而非 ADR
- 单 plugin 实现细节（rare）：可考虑 `[SPEC]_*.md`，但 marketplace 暂无此 tag 实例——按需引入

ADR 写作要求：
- 标题：`[ADR]_<topic>.md`
- 必备段：Context / Decision / Consequences (positive / negative / risks) / Alternatives Considered / Implementation Plan / Acceptance Criteria / References / Decision Log
- 落 `docs/[ADR]_*.md`（marketplace 使用扁平 docs/ 结构，不建 docs/adr/ 子目录）

涉及 marketplace.json schema / CI workflow / 主版本 bump 时，必须 HITL。

## Output

输出：文档类型 / 目标路径 / 文档正文草案 / 与 Plan 的对应关系 / HITL Questions
```

---

### §4.5 Plugin / Skill Authoring Prompt

```markdown
## Task

严格按已确认的 Plan / ADR 创建或修改 plugin / skill。

## Reference Docs

### Must Follow
- 已确认的 Plan / ADR
- `docs/[GUIDE]_Marketplace_Project_Overview.md`（plugin 目录结构 + 官方约束）
- 现有 plugin 作为风格样板：`plugins/learn-kit/`（v4.0.0 起本 marketplace 唯一 plugin；含 5 个不同复杂度的 skill 可参照）

### Consult If Affected
- `docs/[GUIDE]_Plugin_Development_Testing_Workflow.md`（跨仓库测试三阶段）

## Skill Hint

Preferred Skill（新 plugin 整体设计）：
- `/plugin-dev:create-plugin` — 8 阶段 workflow framework（Discovery / Component Planning / Detailed Design / Structure / Implementation / Validation / Testing / Documentation）

Preferred Skill（每个 SKILL.md 单独创建）：
- `/skill-creator:skill-creator` — SKILL.md 起草 + frontmatter 校对 + description 触发性优化

Use When：
- 新建 plugin 或在既有 plugin 内加 skill
- description 需要 trigger words / pushy 调优
- 验证 SKILL.md frontmatter / progressive disclosure

Fallback：
- 若 `/plugin-dev:create-plugin` 不可用：手工按 plugin spec 创建 `.claude-plugin/plugin.json` + 必备 5 文件（CLAUDE.md / README.md / CHANGELOG.md / LICENSE / skills/）
- 若 `/skill-creator:skill-creator` 不可用：手工参照 `plugins/learn-kit/skills/init/SKILL.md` 等同款 SKILL.md 写
- 通用兜底：`superpowers:test-driven-development` / `superpowers:verification-before-completion`

## Rules

必须：
1. 保持改动范围最小（不混入无关 plugin 改动）
2. 遵循官方 plugin spec：`plugin.json` 在 `.claude-plugin/` 子目录；skills 自动发现；不用 `components` 字段
3. SKILL.md frontmatter：`name` + `description` 必填；`disable-model-invocation` / `allowed-tools` 按需
4. description 写成第三人称 + 强 trigger phrases（中英双语兼顾时双语都写）
5. 严格 read-only 工具的 skill 必须显式声明 `allowed-tools: [Read, Glob, Grep]` 等
6. v3.1.0 起 **推荐** skill 用 `/plugin-dev:skill-reviewer` 审一次（详见 §4.6；不可用时按 §5.2 fallback 路径替代）

以下情况暂停：
- 需要越过 Plan / ADR
- 需要新增 plugin 依赖（如新 MCP server / 新 external service）
- 需要改 plugin.json schema 或 marketplace.json schema
- 发现原方案 SKILL.md 无法满足 trigger 准确度

## Output

输出：计划修改 / 新增文件清单 / 每个文件的目的 / 是否发现 scope drift / HITL Questions
```

---

### §4.6 Plugin Compliance Prompt

```markdown
## Task

新建或修改 plugin / skill 后，验证合规性。

## Reference Docs

### Must Follow
- `.github/workflows/ci.yml`（6 步验证清单）

## Skill Hint

Preferred Skill：
- `/plugin-dev:skill-reviewer`（agent）— 单 SKILL.md 质量审：description 触发性 / progressive disclosure / 第三人称 / 写作风格 / 与 sibling skill 边界
- `/plugin-dev:plugin-validator`（agent）— 整插件合规审：plugin.json schema (6 必需字段) / SKILL.md frontmatter 全集 / 目录结构（`.claude-plugin/` subdir / CLAUDE.md / README.md / LICENSE / CHANGELOG / skills/ 齐备）/ 版本一致性（plugin.json ↔ marketplace.json）/ CHANGELOG 存在

Use When：
- 新建 / 修改 skill 后立刻跑 skill-reviewer
- 合并 PR 前必跑 plugin-validator（替代手工 CI 6 步检查）
- bump version 后再跑一次 plugin-validator 确认版本一致

Fallback：
- skill-reviewer 不可用：人工对照 marketplace 既有 SKILL.md（如 learn-kit 的 init / locate / scan / generate-tier / nlm-studio 5 件）的 description 风格 + 写作规范
- plugin-validator 不可用：人工跑 CI 6 步等价检查

## Rules

经验法则（来自 v3.0.0 + v3.1.0 实战）：
1. skill-reviewer 第一轮通常给出 5-8 个 high-priority issues；全部 fix 后再跑第二轮确认
2. plugin-validator 经常抓出 plugin.json version 漂移（如 v3.1.0 中 plugin.json 0.1.0 未升）→ **PR 前必跑一次**
3. 若 Edit 工具 "success" 但实际未改文件，立刻用 Write 强制覆盖
4. CI failures 单 fix commit 即可（不必逐项拆分），同 v3.0.0 PR #61 fix 模式

涉及 W 级（warning）issue 时按需修，不阻 ship；critical issue 必修后才能 commit。

## Output

输出：skill-reviewer 报告（每个 skill）/ plugin-validator 报告 / Critical / Warnings / Verified 分级 / 修复计划 / HITL Questions
```

---

### §4.7 Local Dogfood / Verification Prompt

```markdown
## Task

模拟真实环境验证 plugin / skill 行为符合 SKILL.md 描述。

## Reference Docs

### Must Follow
- 已确认的 Plan / ADR
- 受影响 plugin 的 README.md + SKILL.md

### Consult If Affected
- `docs/[GUIDE]_Plugin_Development_Testing_Workflow.md`（跨仓库测试三阶段）

## Skill Hint

无固定 skill（手工 Glob + Grep + Read 模拟 skill 算法跑通）。
推荐 `superpowers:verification-before-completion` 兜底。

## Rules

1. **read-only 算法模拟**（首选）：对纯查询 / 枚举类 skill，用 Glob + Grep + Read 在真实项目（如 mj-system / mj-agent / 外部样本项目）跑通 skill 的内部步骤
2. **真实 plugin install 验证**：对涉及副作用或 0% 信任的 skill 必须做（`/plugin install <plugin>@mj-agentlab-marketplace --scope local`）
3. **disable-model-invocation skill** 必须手工 `/<plugin>:<skill>` 调用一次
4. **跨项目 dogfood**：marketplace 通用 skill 应在 ≥ 2 个外部项目跑通至少 1 个测试 case（v3.1.0 dogfood 用 mj-system + mj-agent；blank-project 场景作为 confidence-< 0.7 warning 路径模拟验证）
5. 关键测试失败且原因不明时必须 HITL

## Output

输出：验证矩阵表 `| Test | Project | Query | Expected | Actual | Pass |` / Pass rate / 性能基线（若适用） / 失败项 / 是否可进入 self-review
```

---

### §4.8 AI Self-review Prompt

```markdown
## Task

commit 前做 AI self-review。

## Reference Docs

### Must Follow
- 已确认的 Plan / ADR
- 对应 PR template（`.github/PULL_REQUEST_TEMPLATE/<type>.md`）

## Skill Hint

可选 `superpowers:verification-before-completion`。无 marketplace 自有 review skill。

## Rules

检查 11 项：
1. 改动是否完全对应 Plan / ADR
2. 是否超出 scope
3. 是否改变 plugin API / SKILL description / allowed-tools / marketplace.json schema
4. 是否有 hardcode / secret / 绝对路径 / 调试代码
5. 文档同步检查（拆为 4 段）：
   - **5a 反向扫描**：本次 git diff 中 rename / move / delete 的 SKILL.md / plugin.json 字段 → grep 所有 `docs/**` 与 `plugins/*/CLAUDE.md` / `README.md` 中引用，命中后必须更新或在 PR 中注明不更新
   - **5b 新文档创建确认**：对比 Plan 中 Documentation Decision，确认 ADR / GUIDE / RUNBOOK 已建并填 frontmatter
   - **5c INDEX / CLAUDE.md / CHANGELOG 同步**：`docs/INDEX.md` + 顶层 `CLAUDE.md` "v X.Y.Z Update Note" + 顶层 `CHANGELOG.md` `[Unreleased]` 或 `[X.Y.Z]` + 各 plugin `CHANGELOG.md` 全部同步
   - **5d Plugin Delta Check**：plugin.json version / description / keywords 与 marketplace.json plugins[] 一致？SKILL.md 数量与 plugin 实际 `skills/` 目录一致？METHODOLOGY 等模板文件 version 字段同步？
6. AC 是否都有验证证据（指向 §4.7 Dogfood Matrix）
7. 是否有不应提交文件（PR_BODY.md 临时 / 个人配置 / IDE 缓存）
8. commit message 是否符合 `<type>(<scope>): <summary>`
9. PR template 自检 6 项是否全部满足
10. 是否触发 release.yml（VERSION 文件变更）→ 是则需要 HITL 确认发布意图
11. 涉及 secret / 凭据时必须暂停

发现 secret / 无关改动 / 关键测试失败 / 中高风险残留时必须 HITL。

**Output 必须按 marketplace 双段拆分**（与 mj-system v5.2 §4.7 同名设计，但本 STANDARD 独立维护，不强同步上游版本号）：
- 「**本地验证**」（人类客观可重复检查）— git status / git diff / 文件版本号 / ls / 命令输出等
- 「**AI 自检**」（AI 生成内容可信度自查）— 上述 11 项逐条勾选 + 理由

## Output

输出：文件清单 / 改动理由 / AC 映射 / 测试结果 / 风险清单 / Plugin Delta Check 结果 / 「本地验证」段 + 「AI 自检」段（双段）/ 是否建议提交
```

---

### §4.9 Commit / Push / PR Prompt

```markdown
## Task

提交、推送、创建 PR。

## Reference Docs

### Must Follow
- `docs/CONTRIBUTING.md`（commit format / branch strategy）
- `.github/PULL_REQUEST_TEMPLATE/<type>.md`（按分支类型选）

## Skill Hint

无固定 skill。直接用 `git` + `gh` CLI。

## Rules

**Commit**：
1. 单 commit 或多 logical commit（同 v3.0.0 / v3.1.0 经验：3-5 logical commits 比单大 commit 更利 review）
2. 不暂存 PR_BODY.md / 临时文件 / 个人配置
3. commit message 严格 `<type>(<scope>): <summary>` + 多行 body（why）
4. Co-Authored-By 行带在 commit message 尾部（如 AI 协作）
5. 不使用 `--no-verify` / 不绕过 pre-commit hook

**Push**：
1. 首次 push 用 `git push -u origin <branch>`
2. 推前确认无 secret / 大文件 / 临时调试文件
3. 不向 main 直接 push（不允许）

**PR**：
1. 用 `gh pr create --base develop --head <feature-branch> --title "..." --body-file PR_BODY.md`
2. 非交互模式必须用 `--body-file`（不要依赖 `--template` 打开编辑器）
3. PR title ≤ 70 字符
4. PR body 必须含：变更摘要 / 影响范围 / 审核要点 / 本地验证 / AI 自检 / 风险 / 回滚 / 关联
5. 临时 PR_BODY.md 文件 push 后立即 `rm`（不要 commit 进仓库）
6. PR_BODY.md 不能放 `.git/`（worktree 模式下 `.git` 是 file 不是 dir）；放 worktree 根目录或 OS TEMP

按 branch type 选 template：feature.md / bugfix.md / documentation.md / maintain.md / hotfix.md / release.md。

## Output

输出：推荐提交拆分 / 每条 commit message / PR title / PR body（按 template + 双段）/ 推荐 reviewer / 是否需要 HITL 确认发布意图
```

---

### §4.10 Review → Merge → Release Prompt

```markdown
## Task

CI 通过后协调 review / merge / release。

## Reference Docs

### Must Follow
- `docs/[RUNBOOK]_Release_Operations.md`
- `docs/[GUIDE]_Version_Management.md`
- `.github/workflows/release.yml`

## Skill Hint

无固定 skill。`gh pr checks` + `gh pr merge` + `gh release view`。

## Rules

**Review / CI**：
1. CI 6 步全过后才能进 merge 阶段
2. PR template 自检 6 项必须勾选完整
3. CI 失败时单 fix commit 即可（不必逐项拆分）
4. Review comment 涉及 plugin 行为 / SKILL description / allowed-tools 变化时必须 HITL

**Merge**：
1. feature/bugfix/documentation/maintain → develop：manual review + manual merge（HITL）
2. hotfix → main + develop 双向同步
3. release PR：develop → main（含 VERSION 已 bump + CHANGELOG `[Unreleased]` 已转 `[X.Y.Z]`）
4. Merge 默认用 merge commit（保留 commit 历史）；squash 仅适用于纯文档 PR 整理
5. **merge 到 main 必须 HITL**（main 分支保护 + 涉及发布）；Claude 不得 auto-merge release PR
6. 如 sandbox classifier 拒绝 `gh pr merge` 到 main：报告用户，让用户在终端跑 `! gh pr merge <PR#> --merge -R MJ-AgentLab/mj-agentlab-marketplace`

**Release**：
1. release PR merge 后 release.yml 自动触发（trigger: push to main + paths: VERSION）
2. workflow 在 ~10s 内自动 tag `vX.Y.Z` + 创建 GitHub Release
3. Release notes 自动从 CHANGELOG `[X.Y.Z]` 段抽取
4. 验证：`git fetch --tags` + `gh release view vX.Y.Z`

## Output

输出：Merge readiness: Ready / Not Ready / 未完成事项 / 预期 merge 后动作（release.yml 自动触发 + tag vX.Y.Z + GitHub Release 创建）/ post-merge 验证清单
```

---

### §4.11 Post-merge Cleanup Prompt

```markdown
## Task

PR merge + release 完成后，本地 cleanup。

## Reference Docs

### Must Follow
- `docs/CONTRIBUTING.md`（worktree 模式）

## Skill Hint

无固定 skill。`git worktree remove` + `git branch -D`。

## Rules

执行：
1. `cd <worktree-root>/develop`
2. `git pull origin develop`（取回 merge commit）
3. `git worktree remove <feature-worktree-path>`
4. `git branch -D <feature-branch>`（已 merge 到 main 后安全删；本地 branch 不与 remote 同步）
5. `git fetch --tags`（取回 release.yml 新建的 tag）
6. 验证 `gh release view vX.Y.Z` 输出包含 url / tagName / createdAt
7. 不删 remote branch（让 GitHub 保留历史）

## Output

输出：Post-merge checklist / 清理动作 / follow-up（如有未完成的消费者侧迁移）/ 复盘摘要
```

---

## §5 Skill 矩阵

### §5.1 总览

> **调用语义注**：表中标 `(agent)` 的工具通过 Task 工具的 `subagent_type` 参数调用，不是 `/plugin:skill` slash command 调用；其余是 `/plugin:skill` 形式的 skill。

| 阶段 | Preferred Skill | Use When | Fallback |
|------|----------------|----------|----------|
| 0 Intake | — | 用户提需求 | `superpowers:brainstorming` |
| 1 Repo Scan | — | Plan 前事实核查 | 手工 Glob/Grep/Read 8 维清单 |
| 2 Plan | — | 任务拆解 | `superpowers:writing-plans` |
| 3 Design Decision (ADR) | — | 架构 / 命名 / 拆分决策 | 按既有 `[ADR]_LearnKit_Discovery_Skills.md` 格式手工写 |
| 4 Plugin / Skill Authoring | `/plugin-dev:create-plugin` + `/skill-creator:skill-creator` | 新建 plugin / 加 skill | 手工按 plugin spec + 现有 SKILL.md 模板写 |
| 5 Plugin Compliance | `/plugin-dev:skill-reviewer` (agent) + `/plugin-dev:plugin-validator` (agent) | skill 创建后 + PR 前 | 手工 CI 6 步等价检查 |
| 6 Local Dogfood | — | 实施完成后 + commit 前 | `superpowers:verification-before-completion` |
| 7 AI Self-review | — | commit 前 | 手工 11-item checklist |
| 8 Commit / Push / PR | — | gh + git | — |
| 9 Review → Merge → Release | — | CI ✓ 后 | — |
| 10 Post-merge | — | merge 后 | — |

### §5.2 外部插件来源声明

**重要**：本 STANDARD 引用的 skill **大部分来自外部 marketplace plugin**，不是 mj-agentlab-marketplace 自有 skill。这些工具的可用性 / 名称 / 行为可能随上游版本演进而变。调用前先：

1. `/plugin list` 或 Skill tool 内置 list 确认可达性
2. 若名称变化，按 fallback 路径手工执行等价工作
3. 本节内容是 **2026-05-11 快照**，未来上游变更后需要修订本节

**Skill 来源清单**（截至 2026-05-11）：

| Skill | 来源 plugin | 来源 marketplace |
|-------|-----------|-----------------|
| `/plugin-dev:create-plugin` | plugin-dev | claude-plugins-official |
| `/plugin-dev:skill-reviewer` (agent) | plugin-dev | 同上 |
| `/plugin-dev:plugin-validator` (agent) | plugin-dev | 同上 |
| `/plugin-dev:agent-creator` (agent) | plugin-dev | 同上 |
| `/skill-creator:skill-creator` | skill-creator | 同上 |
| `superpowers:*` | superpowers | 同上 |
| `/learn-kit:*` | learn-kit | **本 marketplace（self-hosted）** |

### §5.3 选用原则

- **优先 marketplace 自有 skill**（`/learn-kit:*`）：随本 repo 同 commit 演进，最稳定。v4.0.0 起 marketplace 唯一 plugin，含 5 个 skill（init / locate / scan / generate-tier / nlm-studio）
- **其次 plugin-dev 工具链**：marketplace 维护工作流的事实标准（v3.0.0 + v3.1.0 实战验证）
- **最后 superpowers 兜底**：通用方法学增强，跨任意 Claude Code 使用场景可用

---

## §6 与现有文档边界

新 STANDARD **不重复**以下既有内容，只**引用**：

| 既有文档 | 本 STANDARD 引用方式 |
|---------|--------------------|
| `docs/CONTRIBUTING.md` | branch strategy / commit format / PR 流程 → §4.1 / §4.9 / §4.10 / §4.11 引用 |
| `docs/[GUIDE]_Marketplace_Project_Overview.md` | plugin 目录结构 + CI/CD 体系 → §0 + §4.2 引用 |
| `docs/[GUIDE]_Version_Management.md` | dual-layer 版本规则 + bump 工具 → §4.2 / §4.10 引用 |
| `docs/[GUIDE]_Plugin_Development_Testing_Workflow.md` | 跨仓库 plugin 开发测试 → §4.5 / §4.7 引用 |
| `docs/[RUNBOOK]_Release_Operations.md` | release.yml 触发 + 失败处理 → §4.10 引用 |
| `docs/[ADR]_LearnKit_Discovery_Skills.md` | ADR 写作风格样板 → §4.4 引用 |
| `.github/PULL_REQUEST_TEMPLATE/*.md` | 6 PR template 自检清单 → §4.9 引用 |
| `.github/workflows/ci.yml` | 6 步验证清单 → §4.2 / §4.6 / §4.10 引用 |
| `.github/workflows/release.yml` | VERSION-trigger 自动 tag → §4.10 引用 |

如发现本 STANDARD 与上述任一文档冲突，**HITL 哲学层以本 STANDARD 为准** + **具体规则细节按被引文档为准**。

---

## §7 最终推荐原则

```text
Intake         解决能不能立项。
Repo Scan      解决 marketplace 事实是否支持原计划。
Plan           解决怎么推进。
ADR            解决要实现什么和为什么这样设计。
Authoring      只执行已确认方案。
Compliance + Dogfood 防止局部正确但整体失控。
Self-review + PR + Review + Merge Gate 防发布事故。
Post-merge     负责闭环。
```

Reference Docs 与 Skill Hint 的定位：

```text
Reference Docs 是知识与规则锚点。
Skill Hint     是工具与流程入口。
HITL           是风险与决策边界。
```

最终规则：

```text
低风险事项（拼写 / CHANGELOG 累加 / 例子更新）：AI 自主推进并记录假设。
中风险事项（新 plugin / skill 创建 / plugin 内部重构）：AI 给出推荐方案，必要时 HITL。
高风险事项（plugin 删除 / 重命名 / 主版本 bump / marketplace.json schema 变 / CI workflow 改 / 发布 main）：AI 必须暂停，等待人工确认。
```

---

## §8 版本历史

- **v1.0**（2026-05-11）：初版。剥离 mj-system HITL STANDARD 中 DB / n8n / ETL / FastAPI / Flyway / pg_cron / 双域架构等 marketplace 不适用内容；保留 HITL 哲学骨架；嵌入 marketplace 实际 11 阶段；引入 Hybrid Skill 矩阵（plugin-dev + skill-creator + superpowers + marketplace self-hosted）；与现有 docs/CONTRIBUTING + GUIDE_* + RUNBOOK_* + ADR_* 引用关系明确化。依据：v3.0.0 generic restructure（PR #61 + #62）+ v3.1.0 learn-kit discovery skills（PR #63 + #64）两轮实战经验。

---

> **结语**：本 STANDARD 是 marketplace 工作流的 single source of truth。它不替代 CONTRIBUTING.md / GUIDE / RUNBOOK / ADR，而是把 HITL 哲学 + 阶段编排 + Skill 工具链固化下来，让 AI agent 和人类维护者在两轮 v3.x 实战之后形成稳定的协作锚点。如有 HITL 哲学层冲突，以本文档为准；具体规则细节按被引文档为准。
