---
type: adr
scope: marketplace
summary: learn-kit v2.0.0 重命名 init skill → scaffold-learning 消除与 Claude Code 内置 /init 的 slash 拾取器冲突
owner: marketplace-maintainers
created: 2026-05-18
updated: 2026-05-18
state: active
version: v1.0
domain: plugin-dev
tags:
  - rename
  - learn-kit
  - slash-conflict
  - v5.0.0
related:
  - ./[ADR]_NotebookLM_Kit_Retirement.md
  - ../guide/[GUIDE]_Migration_From_v3_to_v4.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
---

# [ADR] learn-kit `init` Skill Rename to `scaffold-learning` (marketplace v5.0.0)

**Status**: Accepted
**Date**: 2026-05-18
**Deciders**: ranzuozhou
**Marketplace version impacted**: 4.6.3 → 5.0.0
**Plugin version impacted**: learn-kit 1.2.1 → 2.0.0
**Reversibility**: 一次性 breaking change（重命名后 `/learn-kit:init` 不再存在；保留 alias 会自我抵消本 ADR 价值，详见 Alternatives D）

---

## Context

learn-kit v1.2.1 持有 skill 名 `init`，其 slash 调用形式为 `/learn-kit:scaffold-learning`（v1.2.1 起 plugin 内部已强约定全限定调用）。**但 Claude Code 宿主端 slash-command 拾取器与该约定无关** —— 用户键入裸 `/init` 时，拾取器同时列出：

1. `/init`（宿主内置，初始化 CLAUDE.md）
2. `/init` `(learn-kit)`（learn-kit 的 init skill）

两条候选并列出现，用户必须凭借右侧描述区分。

### 触发本 ADR 的观察

1. **v1.2.1 已经做的护栏不够**：
   - SKILL.md frontmatter 已设 `disable-model-invocation: true` —— **仅阻止 LLM 自然语言自主路由，不影响用户 slash 拾取器**
   - plugin README + CLAUDE.md + CHANGELOG 已写明「全限定 `/learn-kit:init`」命名约定 —— **是 documentation-only 约束，无 enforcement 机制**
2. **拾取器对 fuzzy 友好**：`/i` / `/in` / `/init` 三种前缀输入都会拉出 learn-kit 候选，与宿主候选并列。任何 `init` 子串方案（例如 `init-learning` / `learning-init`）都受此影响
3. **plugin spec 无 alias 字段**：Claude Code plugin spec 不提供 skill rename 重定向 / 同义词 / hidden alias 机制；只有 SKILL.md `disable-model-invocation` 是部分屏蔽手段
4. **dogfood 截图证据**：用户 `develop` 上 v1.2.1 reload-plugins 后键入 `/init`，两条 `/init` 并列，确认 v1.2.1 documentation-only 约束未消除 UX 冲突

### 用户实际诉求

> "/init 在拾取器里仍能拉出 learn-kit:init，与宿主 /init 形成冲突和混淆。"

诉求是 **物理上移除 `init` 这个 skill 名**，不是 documentation-level 修缮。

---

## Decision

### Tier-1（核心动作）

1. **重命名 skill 目录**：`plugins/learn-kit/skills/init/` → `plugins/learn-kit/skills/scaffold-learning/`（git mv 保留 history）
2. **更新 SKILL.md frontmatter**：`name: init` → `name: scaffold-learning`；description 中 `/learn-kit:init` 全部替换为 `/learn-kit:scaffold-learning`；保留 `disable-model-invocation: true`（语义防御不变 —— scaffold 仍是用户显式 opt-in 动作）
3. **不保留任何 `init` 残留**：不留 `skills/init/` deprecation stub。任何残留都会让 Claude Code slash 拾取器重新列出 `/init`（learn-kit）候选 —— 与本 ADR 解决的问题自我矛盾
4. **更新跨 skill 路由**：locate / scan / generate-tier 三个 sibling skill 的 SKILL.md 中 "/learn-kit:init" 引用全部替换为 "/learn-kit:scaffold-learning"（共 8 处：locate 2 / scan 3 / generate-tier 3）
5. **更新 plugin 文档**：plugins/learn-kit/README.md（5 处） + plugins/learn-kit/CLAUDE.md 多段重写（含 §"命名约定" 重写：原"直接动机=init 同名"段已经成为过去时，改为历史回溯性表述）

### Tier-2（配套）

6. **bump version**：learn-kit `1.2.1 → 2.0.0`（major：用户可见 slash 接口 breaking；与 v1.0.0 加 MCP 依赖被判 major 同等级）；marketplace `4.6.3 → 5.0.0`（major：跟随 plugin major，参考 v4.0.0 notebooklm-kit 退役先例）
7. **CHANGELOG 双层条目**：
   - `plugins/learn-kit/CHANGELOG.md` 新 `[2.0.0] - 2026-05-18` 段，明示 Breaking + before/after 示例 + 迁移指引链接
   - 顶层 `CHANGELOG.md` 新 `[5.0.0] - 2026-05-18` 段，记录 marketplace 层 breaking change + 指向 plugin CHANGELOG + 本 ADR
8. **Migration guide 新增章节**：`docs/guide/[GUIDE]_Migration_From_v3_to_v4.md` 末尾追加 §5 `v4.5.x → v5.0.0`，给出用户搜索-替换指引（"在你项目里 grep `/learn-kit:init` 并改为 `/learn-kit:scaffold-learning`"）
9. **更新 marketplace.json**：metadata.version 4.6.3 → 5.0.0；plugins[learn-kit].version 1.2.1 → 2.0.0；description 字段中 "/learn-kit:init scaffolds..." → "/learn-kit:scaffold-learning scaffolds..."
10. **更新 .gitignore 注释**：`.gitignore` 中提及 `/learn-kit:init` 的注释段同步更新为 `/learn-kit:scaffold-learning`
11. **更新 docs/INDEX.md**：注册本 ADR 行（"Archived Documents" 段无变化，本 ADR 不归档既有 doc）

### 范围边界

- **In-scope**: 重命名 + 跨引用更新 + 双层 version bump + ADR / Migration / CHANGELOG 文档化
- **Out-of-scope**: 其他 skill 命名（locate / scan / generate-tier / nlm-studio 都不改）；plugin 行为变更；MCP 工具前缀变化（仍是 `mcp__plugin_learn-kit_notebooklm-mcp__*`）；历史 CHANGELOG entry 改写（保持事实记录）
- **Open questions**: 暂无

---

## Consequences

### 正面

- **`/init` 拾取器还原唯一性**：键入 `/init` 仅命中 Claude Code 宿主内置，learn-kit 候选完全消失，UX 二义解除
- **新名 `scaffold-learning` 自描述强**：SKILL.md §9 "Scaffold a learning/ folder ..." 是 skill 自身用词，命名与功能内在一致
- **风格对齐**：`scaffold-learning` 是 verb-noun 复合，与 `generate-tier` / `nlm-studio` 同款；plugin 内 5 个 skill 命名风格分布更平衡（2 单动词 scan/locate + 3 复合 scaffold-learning/generate-tier/nlm-studio）
- **未来防御**：未来若 Claude Code 新增其他同名内置（`/scan` / `/locate` 等），现已有 v2.0.0 重命名先例可参考，处理范式已立
- **`disable-model-invocation: true` 仍保留**：scaffold 仍是显式动作（写入文件系统），自然语言路由仍应禁止，行为不变

### 负面 / 代价

- **下游 user muscle memory 失效**：任何记得 `/learn-kit:init` 的用户首次输入会得"skill 不存在"。Migration guide + CHANGELOG before/after block 是唯一缓冲
- **跨 skill 路由 8 处硬更新**：locate / scan / generate-tier 内若有 hardcode 引用未抓到则路由失败；reviewer 必须帮抓 grep
- **marketplace 5.0.0 触发下游同步压力**：使用本 marketplace 的项目（mj-system / mj-agent / 任何外部 fork）需要做一次 version 同步与文档检查
- **历史 CHANGELOG entry 保留旧名**：v0.1.0 / v0.2.0 / v0.3.x / v1.0.0 / v1.1.0 / v1.2.x 的 CHANGELOG 历史段仍写 `/learn-kit:init` —— 这是事实记录不应改，但 grep 时会产生"已迁移但 grep 仍命中"的噪音；mitigation 是 grep 时排除 CHANGELOG.md + 本 ADR + Migration guide §5

### 风险

- **不彻底 grep 留残**：若 PR 漏改某个引用，CI 文档校验若不抓 cross-ref 完整性，会让 docs 与 plugin 实际行为脱钩。**Mitigation**: Stage 5 compliance 必须跑 `grep -rn "/learn-kit:init" plugins/ docs/ README.md .gitignore` 且仅允许在 CHANGELOG 历史段 + Migration §5 + 本 ADR 内出现
- **marketplace.json description 字段忘改**：CI 不强制校验 description 文案；reviewer 必须人工 diff plugins[learn-kit].description
- **下游 mj-system / mj-agent 项目同步延迟**：marketplace 5.0.0 发布后，下游项目的 CLAUDE.md 引用 `/learn-kit:init` 不会自动跟随；mitigation 由 Migration guide §5 触达

---

## Alternatives Considered

### A. 维持现状 + 加强 documentation-only 约束（v1.2.1 路径）

- **Pros**：零代码变动；向后兼容
- **Cons**：v1.2.1 的截图证据证明 documentation 约束**不消除拾取器二义** —— 本路径已被 dogfood 证伪
- **否决**：用户已明示这是 UX 冲突，不是文档遗漏

### B. 改用 `init-learning` / `learning-init` / 任何含 `init` 子串的名

- **Pros**：保留 init 语义连续性
- **Cons**：拾取器 fuzzy 仍可命中 `/init` 前缀 —— 与宿主候选并列问题未解决
- **否决**：违背"物理上移除 init"的核心目标

### C. 保留 `init` 作为 alias / deprecation stub skill

- **Pros**：muscle memory 兼容
- **Cons**：任何残留 `skills/init/` 目录都会被 Claude Code 自动发现并列入 slash 拾取器 —— **stub 自身就是问题**
- **否决**：技术上自我矛盾

### D. 单动词 `scaffold`

- **Pros**：最短；与 scan / locate 单动词风格完全对齐
- **Cons**：略抽象，不立刻揭示"给 learning 用"；用户首次见 `/learn-kit:scaffold` 须读 description 确认对象
- **否决**：在 `scaffold-learning` 与 `scaffold` 之间，命名自描述性能优先（learn-kit 5 个 skill 命名风格已有混合，新增一个 verb-noun 复合不增加认知负担）

### E. `bootstrap-learning` / `bootstrap`

- **Pros**：bootstrap 是常见 init-类术语
- **Cons**：bootstrap 与 web 圈"前端脚手架"语义噪音重叠；scaffold 是 SKILL.md 自身用词（§9 "Scaffold a learning/ folder ... seeded with the 8-stage methodology"），与功能内在一致
- **否决**：scaffold 更精确匹配 skill 内部 vocabulary

### F. major bump → 仅 minor bump

- **Pros**：bump 节奏更平缓；不触发下游 mj-system / mj-agent 强同步信号
- **Cons**：slash command rename 是用户可见接口变更；marketplace HITL STANDARD §3.1 明确 "plugin 重命名" 是高风险 + 主版本 bump trigger
- **否决**：违反 marketplace 自身 HITL 规则；v1.0.0（加 MCP 依赖）已建立 plugin-level breaking → major 的 precedent

---

## Compliance & Verification

实施完成后必须通过：

- **静态校验** (Stage 5)：
  - `/plugin-dev:plugin-validator` 对 learn-kit v2.0.0 全 5 skill（init 名已不存在；新名 scaffold-learning 取代）
  - `/plugin-dev:skill-reviewer` 对 `scaffold-learning/SKILL.md`（frontmatter description 长度 < 1,536 char cap；触发样例完备）
  - `/mp-doc-validate` 对新 ADR + 修改后的 Migration guide
  - **全仓 grep**：`grep -rn "/learn-kit:init" plugins/ docs/ README.md .gitignore` 应仅在以下 3 类位置命中：(1) CHANGELOG.md 历史段 (2) Migration guide §5（含 before/after 示例所需）(3) 本 ADR（含历史回溯所需）
- **行为验证** (Stage 6)：
  - 干净 worktree `/reload-plugins` 后，键入 `/init` **不**显示 learn-kit 候选
  - 键入 `/learn-kit:scaffold-learning` 成功匹配新 skill
  - 在干净测试项目跑 `/learn-kit:scaffold-learning`：`learning/INDEX.md` + `learning/_meta/METHODOLOGY.md` + `learning/_archive/.gitkeep` 三件套正确创建；pre-flight 行为不变；"next steps" 输出引用新名
  - 在缺 `learning/` 的项目跑 `/learn-kit:generate-tier` —— pre-flight 应路由到新名（不是 `/learn-kit:init`）
- **版本一致性** (Stage 7)：
  - `VERSION` == `.claude-plugin/marketplace.json` `.version` == `5.0.0`
  - `plugins/learn-kit/.claude-plugin/plugin.json` `.version` == `.claude-plugin/marketplace.json` `.plugins[learn-kit].version` == `2.0.0`
  - `plugins/learn-kit/CHANGELOG.md` 含 [2.0.0]；顶层 `CHANGELOG.md` 含 [5.0.0]
- **CI** (Stage 9)：marketplace ci.yml + release.yml 全过

---

## References

- Plan: `~/.claude/plans/image-1-marketplace-learn-kit-init-lear-smooth-bear.md`
- 既有 ADR: [`[ADR]_NotebookLM_Kit_Retirement.md`](./[ADR]_NotebookLM_Kit_Retirement.md)（v4.0.0 plugin retirement 先例 —— 同样是用户可见 breaking → marketplace major bump）
- Migration: [`[GUIDE]_Migration_From_v3_to_v4.md`](../guide/[GUIDE]_Migration_From_v3_to_v4.md) §5 v4.5.x → v5.0.0
- HITL STANDARD: [`[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) §3.1（plugin 重命名 = 必停 HITL trigger）
- v1.2.1 截图证据：用户提交，列示 `/init` 双候选并列（参 Plan §Context 段引用）

---

## Decision Log

| Date | State | By | Note |
|------|-------|----|------|
| 2026-05-18 | accepted | ranzuozhou | initial — 用户基于 v1.2.1 dogfood 截图确认 documentation-only 约束失败，决定物理重命名 |
