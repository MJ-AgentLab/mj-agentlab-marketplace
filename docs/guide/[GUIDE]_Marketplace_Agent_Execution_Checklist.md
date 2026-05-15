---
type: guide
scope: marketplace
summary: STANDARD HITL Prompt 的运行时勾选清单 — 11 stage × 4 段 (Entry / Actions / Verification / Exit)
owner: marketplace-maintainers
created: 2026-05-11
updated: 2026-05-15
state: active
version: v1.1
domain: governance
tags:
  - hitl
  - checklist
  - workflow
related:
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
---

# [GUIDE] Marketplace Agent Execution Checklist

> Pairs with [`../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`](<../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md>) v1.2.

---

## §0 用途

本 GUIDE 是 marketplace `[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` 的**运行时配套**。

- **STANDARD** 定义 11 阶段的 Prompt 结构、Reference Docs、Skill Hint、Rules、Output 五段
- **本 GUIDE** 把每个阶段压缩为 4 段可勾选清单（Entry / Actions / Verification / Exit），方便 agent 与人类在执行中快速对照

读法建议：
- 第一次接触 marketplace AI 工作流：先读 STANDARD §1 + §3，再回到本 GUIDE 找具体 stage
- 已熟悉 STANDARD 的回访者：直接跳到本 GUIDE 对应 stage，按勾选清单推进
- 卡在某个 stage 不确定下一步：本 GUIDE 的 **Exit** 段给出明确触发下一阶段的信号

---

## §1 通用约定

- 每个 stage 4 段：**Entry**（进入条件）/ **Actions**（要做的事）/ **Verification**（勾选清单）/ **Exit**（出 stage 的信号）
- Verification 全部勾完才允许进入下个 stage；如有未勾项，要么补做、要么显式注明"不适用 + 理由"
- Exit 段描述触发下一阶段的具体信号（不是抽象描述）
- 本 GUIDE 与 STANDARD §4 一对一映射；冲突时**以 STANDARD 为准**（本 GUIDE 是浓缩版）
- 通用验证工具：`git status` / `git diff --stat` / `git log --oneline` / `Glob` / `Grep` / `Read` / `gh pr checks` / `gh release view`

---

## §2 各阶段 Checklist

### Stage 0 — Intake

**Preferred Skill**: `/mp-flow-intake`

**Entry**：用户提需求 / 现有 GitHub Issue / 维护请求 / 第三方反馈

**Actions**：
- 调 `/mp-flow-intake` (自动触发) 或手工:
  - 评估任务类型（feature / bugfix / documentation / maintain / hotfix / release）
  - 评估 base branch（develop / main）
  - 评估 risk-level（Low / Medium / High，按 STANDARD §3.1）
  - 评估 scope 与 out-of-scope
  - 出推荐分支名（按 `<type>/<description>` 或 `<type>/<issue-id>-<description>` 命名）
  - 列 Documentation Needed（ADR / GUIDE / RUNBOOK / SPEC / CHANGELOG / INDEX / CLAUDE.md 影响）
  - 出 HITL Questions（如需）

**Verification**：
- [ ] 任务类型已确定（≥1 type label）
- [ ] base branch 已确定
- [ ] risk-level 已评估
- [ ] scope 边界清晰
- [ ] 推荐分支名已出（符合命名约定）
- [ ] Documentation Needed 清单已出
- [ ] HITL Questions 已列（risk M/H 时必有）

**Exit**：Intake Result 输出完成 + (若 risk M/H) 用户确认后进入 Stage 1

---

### Stage 1 — Repo Scan

**Preferred Skill**: `/mp-flow-repo-scan`

**Entry**：Intake Result 已完成 + 用户授权进入实施

**Actions**（marketplace 事实核查 8 维）：
1. 当前 branch / worktree / diff / 未跟踪文件
2. 受影响 plugin（`plugins/*/`）
3. `marketplace.json` plugins 数组当前状态
4. 各 `plugin.json` 字段
5. SKILL.md frontmatter（受影响 plugin 全部 skill）
6. `VERSION` 与 `marketplace.json metadata.version` 一致性
7. 顶层 `CLAUDE.md` + `CHANGELOG.md` + `docs/INDEX.md` 是否需更新
8. `.github/workflows/ci.yml` 6 步验证是否覆盖

**Verification**：
- [ ] 8 维事实清单全部检查
- [ ] Current State 快照已出（受影响文件 + 版本号）
- [ ] Documentation Decision 已出（哪些文档需 Create / Update / 不动）
- [ ] Plan Verdict 已出（已有 plan 是否仍成立）

**Exit**：Repo Scan Result 输出 + Plan 不冲突 → Stage 2；Plan 冲突 → 回到 Stage 0

---

### Stage 2 — Plan

**Preferred Skill**: `/mp-flow-plan`

**Entry**：Repo Scan Result 已确认 Plan 成立

**Actions**：
- 写 Plan（用户本地 `~/.claude/plans/<topic>.md` 或嵌入 PR description）
- Plan 内容：步骤顺序 / 风险控制 / 文档决策 / 验证计划 / 完成标准
- Plan **不**写：详细 plugin 接口 / 完整实现代码

**Verification**：
- [ ] Plan 落到用户本地或 PR 草稿（不入 marketplace repo）
- [ ] 步骤可执行（每步有明确产出）
- [ ] 文档决策与 Stage 1 Documentation Needed 对齐
- [ ] 验证计划具体（不是"测一下"）
- [ ] 完成标准可勾选

**Exit**：用户确认 Plan → Stage 3 或直接进 Stage 4（如无设计决策需要）

---

### Stage 3 — Design Decision (ADR)

**Preferred Skill**: `/mp-flow-design-adr` (ADR) / `/mp-doc-author` (post-PR 2 GUIDE/SPEC/RUNBOOK)

**Entry**：Plan 含架构 / 命名 / 重命名 / 拆分等决策

**Actions**：
- 判断文档类型：ADR（最常用）/ RUNBOOK（运维操作）/ SPEC（接口契约，rare）
- 写 ADR 到 `docs/[ADR]_<topic>.md`（marketplace 扁平 docs/ 结构）
- ADR 必备段：Context / Decision / Consequences (positive/negative/risks) / Alternatives Considered / Implementation Plan / Acceptance Criteria / References / Decision Log

**Verification**：
- [ ] 文档类型已选（ADR / RUNBOOK / SPEC）
- [ ] 文档路径符合 marketplace 扁平 docs/ 约定
- [ ] 必备 8 段全部填充（如选 ADR）
- [ ] 与 Plan 对应关系明示
- [ ] 涉及 marketplace.json schema / CI workflow / 主版本 bump 时已 HITL

**Exit**：ADR 草稿就绪（可在最终 commit 时落地）→ Stage 4

---

### Stage 4 — Plugin / Skill Authoring

**Preferred Skill**: `/mp-flow-author` (orchestrator; 内调 `/plugin-dev:create-plugin` + `/skill-creator:skill-creator`)

**Entry**：Plan + ADR 就绪；分支 / worktree 已创建

**Actions**：
- 新 plugin：调 `/plugin-dev:create-plugin` workflow framework
- 新 skill：调 `/skill-creator:skill-creator`
- 改既有 skill：手工 Edit + 参照 sibling SKILL.md 风格
- 保持改动范围最小（不混入无关 plugin）
- SKILL.md frontmatter：`name` + `description` 必填；按需加 `disable-model-invocation` / `allowed-tools`
- description：第三人称 + 强 trigger phrases（中英双语兼顾）

**Verification**：
- [ ] 改动范围与 Plan 一致
- [ ] plugin.json 在 `.claude-plugin/` 子目录
- [ ] SKILL.md frontmatter 合规（必填字段齐备）
- [ ] description 第三人称 + 含 trigger phrases
- [ ] read-only skill 已显式声明 `allowed-tools`
- [ ] 未发现 scope drift

**Exit**：所有 plugin / skill 文件就绪 → Stage 5

---

### Stage 5 — Plugin Compliance

**Preferred Skill**: `/mp-flow-compliance` (orchestrator; 内调 `/plugin-dev:skill-reviewer` + `/plugin-dev:plugin-validator` agents)

**Entry**：Stage 4 所有 plugin / skill 改动完成

**Actions**：
- 每个新建 / 修改的 SKILL.md 用 `/plugin-dev:skill-reviewer` **(agent — Task tool with `subagent_type: plugin-dev:skill-reviewer`，非 slash command)** 跑一次
- PR 前必跑一次 `/plugin-dev:plugin-validator` **(agent — 同上调用方式)**
- bump version 后再跑一次 plugin-validator 确认版本一致
- 修 Critical issues；W 级 warning 按需修

**Verification**：
- [ ] 每个新 / 改 SKILL.md 已经 skill-reviewer agent 审一次
- [ ] plugin-validator agent critical issues 全部 fix
- [ ] plugin.json version 与 marketplace.json plugins[].version 一致
- [ ] CHANGELOG `[X.Y.Z]` 或 `[Unreleased]` 段已加
- [ ] Edit 工具 "success" 但实际未改的情况已用 Write 强制覆盖（v3.1.0 实战教训）

**Exit**：合规审通过 → Stage 6

---

### Stage 6 — Local Dogfood / Verification

**Preferred Skill**: `/mp-flow-dogfood`

**Entry**：Stage 5 合规通过；功能可在真实环境跑

**Actions**：
- 纯查询 / 枚举类 skill：用 Glob + Grep + Read 在真实项目（mj-system / mj-agent / 外部样本）跑算法模拟
- 涉及副作用或 0% 信任 skill：`/plugin install <plugin>@mj-agentlab-marketplace --scope local`
- `disable-model-invocation: true` skill：手工 `/<plugin>:<skill>` 调用至少 1 次
- 跨项目 dogfood：≥ 2 个外部项目 + 1 个 blank-project warning 路径

**Verification**：
- [ ] 验证矩阵表已出（`| Test | Project | Query | Expected | Actual | Pass |`）
- [ ] 失败 case 已记录原因（不要求 100% pass；具体阈值由 Plan / ADR 规定）
- [ ] 性能基线满足（若适用，如 locate < 3s for 200-doc）
- [ ] 关键测试失败已 HITL

**Exit**：验证全过或失败已 HITL 解决 → Stage 7

---

### Stage 7 — AI Self-review

**Preferred Skill**: `/mp-flow-self-review` (+ `/mp-doc-validate` 检 docs frontmatter when applicable)

**Entry**：Stage 6 验证通过；准备 commit

**Actions**：检查 11 项（详见 STANDARD §4.8 Rules 1-11；其中 Rule 5「文档同步检查」内含 5a/5b/5c/5d 四个子项，下方扁平展开为 14 个 checkbox 便于逐项勾选）

**Verification**（STANDARD 11 items，含 Rule 5 的 4 子项扁平化共 14 个 checkbox + 双段输出）：
- [ ] 1. 改动完全对应 Plan / ADR
- [ ] 2. 未超 scope
- [ ] 3. 未改 plugin API / SKILL description / allowed-tools / marketplace.json schema（或已 HITL）
- [ ] 4. 无 hardcode / secret / 绝对路径 / 调试代码
- [ ] **5. 文档同步检查**（含 5a-5d 子项）：
  - [ ] 5a. 反向扫描（git diff 中 rename/delete 命中 docs / README 引用已处理）
  - [ ] 5b. 新文档创建确认（ADR / GUIDE / RUNBOOK 已建并填 frontmatter）
  - [ ] 5c. INDEX / CLAUDE.md / CHANGELOG 同步
  - [ ] 5d. Plugin Delta Check（plugin.json ↔ marketplace.json / SKILL 数量 ↔ skills/ 目录）
- [ ] 6. AC 全部有验证证据（指向 Stage 6 Dogfood Matrix）
- [ ] 7. 无不应提交文件（PR_BODY.md 临时 / 个人配置 / IDE 缓存）
- [ ] 8. commit message 符合 `<type>(<scope>): <summary>`
- [ ] 9. PR template 自检项已勾
- [ ] 10. 是否触发 release.yml（VERSION 变 → HITL 确认发布意图）
- [ ] 11. 涉及 secret / 凭据已暂停

**Output 双段**：
- 「**本地验证**」（人类客观可重复检查）— git status / git diff / 文件版本 / ls / 命令输出
- 「**AI 自检**」（AI 生成内容可信度自查）— 上述 11 项逐条勾选 + 理由

**Exit**：双段输出完成 + 全 Verification 勾选 → Stage 8

---

### Stage 8 — Commit / Push / PR

**Preferred Skill Chain**: `/mp-git-commit` → `/mp-git-push` → `/mp-git-pr`

**Entry**：Stage 7 self-review 通过

**Actions**：
- 拆分 logical commits（marketplace 经验：3-5 logical commits 优于单大 commit）
- 不 stage PR_BODY.md / 临时文件 / 个人配置
- commit message: `<type>(<scope>): <summary>` + multi-line body 解释 why
- Co-Authored-By 行加在 commit message 尾（如 AI 协作）
- Push: `git push -u origin <branch>`
- PR：`gh pr create --base develop --head <branch> --title "..." --body-file PR_BODY.md`
- PR_BODY.md 临时文件 push 后 `rm`（不 commit）
- 按 branch type 选 PR template（feature / bugfix / documentation / maintain / hotfix / release）

**Verification**：
- [ ] commit 拆分合理（按 logical group）
- [ ] commit message 符合规范
- [ ] 无 secret / 大文件 / 临时调试文件被 stage
- [ ] PR 创建成功（拿到 PR URL）
- [ ] PR_BODY.md 临时文件已删除
- [ ] PR body 含双段（本地验证 + AI 自检）

**Exit**：PR 创建 + CI 开始跑 → Stage 9

---

### Stage 9 — Review → Merge → Release

**Preferred Skill**: `/mp-git-merge-gate`

**Entry**：PR 创建；等 CI 完成 + review

**Actions**：
- 等 CI 6 步全过（`gh pr checks <PR#>`）
- CI 失败 → 单 fix commit；不必逐项拆分
- Review comment 涉及 plugin 行为 / SKILL description / allowed-tools 变化 → HITL
- Merge：
  - feature/bugfix/documentation/maintain → develop：manual review + manual merge（HITL）
  - hotfix → main + develop 双向同步
  - release PR：develop → main（含 VERSION 已 bump + CHANGELOG `[Unreleased]` → `[X.Y.Z]`）
- **merge 到 main 必须 HITL**；Claude 不得 auto-merge release PR
- 如 sandbox 拒绝 `gh pr merge` 到 main：report user → user 在终端跑 `! gh pr merge <PR#> --merge -R <owner>/<repo>`（占位符替换为实际 marketplace 仓库路径）
- Release：release PR merge → release.yml 自动触发 → 10s 内 auto tag `vX.Y.Z` + GitHub Release

**Verification**：
- [ ] CI 6 步全过
- [ ] PR template 自检项已勾完
- [ ] Review comments 已全部处理
- [ ] merge 决策已确认（HITL 通过）
- [ ] （仅 release PR）release.yml workflow 已 success
- [ ] （仅 release PR）`git fetch --tags` 拿到新 tag
- [ ] （仅 release PR）`gh release view vX.Y.Z` 输出含 url / tagName / createdAt

**Exit**：PR merged + (若是 release PR) tag + Release 已建 → Stage 10

---

### Stage 10 — Post-merge Cleanup

**Preferred Skill Chain**: `/mp-flow-post-merge` + `/mp-git-cleanup`

**Entry**：PR merged；本地 worktree 仍存在

**Actions**：
- `cd <worktree-root>/develop`
- `git pull origin develop`（取 merge commit）
- `git worktree remove <feature-worktree-path>`
- `git branch -D <feature-branch>`
- `git fetch --tags`（如有新 release）
- 验证 STANDARD / GUIDE / 新文件在 develop 存在（`ls` / `Glob`）
- 不删 remote branch（让 GitHub 保留历史）

**Verification**：
- [ ] develop 已 fast-forward 到 merge commit
- [ ] worktree 已移除（`git worktree list` 不含）
- [ ] 本地 branch 已删除
- [ ] tags 已 fetch（若适用）
- [ ] 新文件在 develop 可访问
- [ ] follow-up issue 已记录（如有）

**Exit**：cleanup 完成 → 闭环结束；归档复盘摘要给用户

---

## §3 通用 HITL 触发摘要

详见 STANDARD §3.1。本 GUIDE 浓缩版：

| 触发类 | 例子 |
|-------|------|
| plugin 高风险 | 删除 plugin / 重命名 plugin / 主版本 bump |
| marketplace schema | marketplace.json metadata 字段改 / plugins 数组结构改 |
| CI/CD | ci.yml / release.yml 修改 |
| 发布 | merge 到 main / VERSION bump major |
| 安全 | secret / 凭据 / token 处理 |
| Review 改变需求 | review comment 改 plugin 行为 / SKILL description / allowed-tools |
| 测试失败原因不明 | 关键测试失败但不知 root cause |

---

## §4 关联

本 GUIDE 直接继承 STANDARD 的 Reference Docs 集合——下列文档是 STANDARD § Reference Docs 系列被各 Stage 引用的真实出处。GUIDE 自身不重复引用，按 Stage 需要时回查 STANDARD §4.N 对应 Reference Docs 段：

- **`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`**：本 GUIDE 的母规范（提供完整 Prompt 结构 + Rules + Skill 矩阵）
- **`docs/CONTRIBUTING.md`**：STANDARD §4.1 / §4.9 / §4.10 / §4.11 引用——分支 / commit / PR 既有约定
- **`docs/[GUIDE]_Version_Management.md`**：STANDARD §4.2 / §4.10 引用——dual-layer 版本规则
- **`docs/[RUNBOOK]_Release_Operations.md`**：STANDARD §4.10 引用——发布操作手册（Stage 9 release 详情）
- **`docs/[GUIDE]_Plugin_Development_Testing_Workflow.md`**：STANDARD §4.5 / §4.7 引用——跨仓库测试三阶段（Stage 6 dogfood 详情）

---

## §5 版本历史

- **v1.1**（2026-05-15）：配套 STANDARD v1.1；每 stage 增加 **Preferred Skill** 标记（指向新建的 18 件 `.claude/skills/mp-*` 项目本地 Track C skill）；Stage 8 改为 3-skill chain，Stage 10 改为 2-skill chain。skill 描述详见 STANDARD §5.1 矩阵。
- **v1.0**（2026-05-11）：初版。配套 STANDARD v1.0；11 stage × 4 段（Entry / Actions / Verification / Exit）；浓缩版 HITL 触发表 + 通用约定。

---

> **结语**：本 GUIDE 是 STANDARD 的"勾选清单视图"。如发现本 GUIDE 与 STANDARD 冲突，**以 STANDARD 为准**——本 GUIDE 是浓缩版，丢失了 STANDARD 中的细微规则。两者保持同步演进（STANDARD 版本 bump → 本 GUIDE 同步 minor bump）。
