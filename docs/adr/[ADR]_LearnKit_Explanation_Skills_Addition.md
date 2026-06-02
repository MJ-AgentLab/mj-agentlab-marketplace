---
type: adr
scope: marketplace
summary: learn-kit 加 glossary + concept 两个纯 prompt 解释 skill（1 → 3 skill）；additive minor；reconciles v6.0.0 single-skill 收敛的 picker-noise 论点；marketplace 6.2.0
owner: marketplace-maintainers
created: 2026-06-02
updated: 2026-06-02
state: active
version: v1.0
domain: plugin-dev
tags:
  - learn-kit
  - skill-addition
  - explanation
  - additive
  - v6.2.0
related:
  - ./[ADR]_LearnKit_Consolidation_To_Single_Skill.md
  - ./[ADR]_LearnKit_ThreeViews_HITL_Expansion.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
---

# [ADR] learn-kit + `glossary` + `concept` 解释 skill（marketplace v6.2.0）

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-06-02 |
| Author | ranzuozhou |
| Scope | learn-kit + marketplace |
| Reversibility | reversible（纯 prompt skill 物理删除即回退；无依赖、无 schema、无 state） |
| Marketplace version impacted | 6.1.1 (develop) → **6.2.0** |
| Plugin version impacted | learn-kit 3.1.0 → **3.2.0** |

## §1 Context

外部有一个独立的两-skill bundle（`C:\Users\Admin\Downloads\skills-bundle`），含两个配套的知识讲解 skill：

| Skill | 输出契约 | 场景 |
|-------|---------|------|
| `glossary` | 一段 150–250 字，固定六槽（类比 → 大类归位 → 痛点 + 大白话定义 → 对比锚定 → 具体例子） | "听过就行" 的术语速记卡（30 秒读完） |
| `concept` | 六节 500–800 字（起源痛点 / 核心直觉 / 机制与定义 / 2 跨域正例 + 1 反例 / 邻居概念 / 失效边界） | "能识别 / 能应用 / 能选型" 的概念深讲 |

两者均为**纯 prompt skill**：单 `SKILL.md`，无 MCP、无 scripts、无 templates、无 file I/O、无 tool 调用。它们是一对刻意互补的设计（README + `concept` SKILL.md 互相 cross-reference）。

### §1.1 为什么落 learn-kit

- learn-kit 是 marketplace 的教学方法论 kit。其主 skill `three-views` 生成**成体系的学习文档 / HTML / 多媒体**，且 frontmatter **明确 disclaim** *"Do NOT use for: pure explanation / Q&A"*（`plugins/learn-kit/skills/three-views/SKILL.md`）。
- `glossary` / `concept` 正好填补这个被 disclaim 的 in-chat 解释 niche——**补全** kit，而非与 `three-views` 重叠（一个出文件，一个出当场解释）。
- 维持 marketplace 自 v4.0.0 起的「1 plugin」收敛文化（历史方向是 8 → 3 → 1 plugin；新建第 2 个 plugin 会逆转该方向）。

### §1.2 触发本 ADR 的张力

v6.0.0 的 [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](./[ADR]_LearnKit_Consolidation_To_Single_Skill.md) §3.1 把 *"slash-picker 5 候选 → 1 候选"* 列为收敛的正面收益。把 `glossary` / `concept` 加进 learn-kit 会让 picker 从 **1 → 3 候选**，部分回走该收益。本 ADR 需要显式 reconcile 这一点，而不是静默违背既有 ADR。

## §2 Decision

把 `glossary` 与 `concept` 作为两个新 skill **近-verbatim** 加入 learn-kit，只改集成层。

### §2.1 Tier-1（核心动作）

1. 新增 `plugins/learn-kit/skills/glossary/SKILL.md` + `plugins/learn-kit/skills/concept/SKILL.md`。教学正文（六槽 / 六节结构 + 硬规则 + few-shot 范例）**逐字保留**。
2. **集成层适配**（仅此三处）：
   - **Frontmatter = `name` + `description` only**。两 skill 不调任何 tool（纯文本生成），故 **省略 `allowed-tools`**（与 tool-light 的 `mp-git-commit` / `mp-doc-author` 同款约定；仅 `three-views` 因要 scope MCP 工具才声明），并 **省略 `argument-hint`**（仓库无任何 skill 用此字段——arg / switch 在 description + body 内文字记录）。不引入 create-plugin / skill-creator 通用模板里的 `argument-hint` / `compatibility`；仓库约定优先。
   - **Slash 全限定**：canonical `/learn-kit:glossary` / `/learn-kit:concept`（plugin skill 命名空间化；项目约定禁用 legacy `commands/` wrapper）。description 保留裸 `/glossary` / `/concept` + 自然语言 trigger 作为别名。
   - **routing clause**：两 skill 的 description 末尾加仓库签名式 `Do not use for: …（use X）` 子句（每个 `mp-*` description 都有此结尾；bundle 原文没有）——`glossary` ↔ `concept` 互相路由，并都让位 `three-views` 处理「落盘学习文档 / HTML / 多媒体」。这是 3-skill 同居下 trigger 路由的主要 mitigation。

### §2.2 Tier-2（picker-noise reconciliation）

3. **接受 picker 1 → 3，理由**：v6.0.0 删的是**低价值 pipeline helper**（scaffold / locate / scan，可被 Read/Glob/Grep 替代），而 `glossary` / `concept` 是**高价值、形态清晰、高频**的顶层动作。三个清晰入口 ≠ 一个动作碎成五步。所以这不是「un-consolidate three-views」，而是「在同一个 kit 里加两个正交工具」。description 的 routing clause + 自然语言 trigger 让三者自动选对，picker 噪音的实际代价被压到可接受。

### §2.3 Tier-3（配套工程动作）

4. **bump version**：
   - learn-kit `3.1.0 → 3.2.0`（minor；additive——加 2 skill，`three-views` 不动；前例 v3.1.0 加 locate+scan / v3.2.0 加 generate-tier）。
   - marketplace `6.1.1 → 6.2.0`（消耗 develop pre-bump slot + 跟随 plugin minor；与 v6.1.0 entry 同款机制 per [`[ADR]_Develop_PreBump_Adoption`](./[ADR]_Develop_PreBump_Adoption.md)）。
5. **A6 CI gate 必触发**（plugin.json + marketplace.json + plugin SKILL.md 改）→ marketplace 根 `CLAUDE.md` 必须同步 per Framework v1.6 §2.7 sync allowlist。
6. **双层 CHANGELOG**：`plugins/learn-kit/CHANGELOG.md` 新 `[3.2.0]` 段 + 顶层 `CHANGELOG.md` `[Unreleased]`（release 时转 `[6.2.0]`）。
7. **元数据同步**：plugin.json（version / description / keywords）+ marketplace.json（metadata.version + plugins[0] version / description / keywords）+ VERSION + 根 README badge + 插件目录表 + learn-kit README / CLAUDE.md skill inventory + `docs/INDEX.md` 注册本 ADR。

### §2.4 范围边界

- **In-scope**: 2 skill 新增 + 集成层适配 + 双层 version bump + 本 ADR + 元数据 / 文档同步。
- **Out-of-scope**: `three-views` 行为（不动）；`notebooklm-mcp` 依赖（两新 skill 不用）；bundle README 的 `~/.claude/skills/` 部署说明（被 plugin 模型取代，不迁入）；description-optimizer 量化调参（列为可选 follow-up，非本次 blocking）。

## §3 Consequences

### §3.1 正面

- **补全 pedagogy kit**：三个互补入口——`three-views`（出文件）/ `concept`（深讲）/ `glossary`（速记卡）覆盖从「当场听懂」到「成体系学习」的全梯度。
- **零依赖、零风险**：纯 prompt skill，无 MCP / scripts / file I/O；删除即完全回退。
- **维持 1-plugin 文化**：不新建 plugin，marketplace catalog 不膨胀。
- **集成质量**：补上 bundle 原文缺的仓库签名式 routing clause，三 skill 路由比裸 bundle 更稳。

### §3.2 负面 / 代价

- **picker 1 → 3 候选**：部分回走 v6.0.0 的「1 候选」收益（§2.2 已论证可接受 + mitigation）。
- **slash UX 命名空间化**：裸 `/glossary` / `/concept` 变 `/learn-kit:glossary` / `/learn-kit:concept`（plugin 模型固有；自然语言 trigger 不受影响）。
- **learn-kit 身份微调**：从「the three-views plugin」回到「pedagogy kit（含多个工具）」——与 plugin 名 `learn-kit` + description "Pedagogical kit" 本义一致，非真负担。

### §3.3 风险

- **trigger 误路由**（如裸术语问题误触 `three-views` 落盘）：mitigation = description routing clause + Stage 6 dogfood 的 routing 核查；可选 description-optimizer 量化验证。
- **教学正文与 three-views 风格漂移**：两 skill 自包含、无共享模板，漂移面极小。

## §4 Alternatives Considered

| 方案 | 描述 | 否决理由 |
|------|------|---------|
| **B — 新建 `explain-kit` plugin** | 两 skill 放独立 plugin | marketplace 1 → 2 plugin（仓库史上首次 plugin 数增加，逆转 8→3→1 收敛方向）；2 个微型 prompt skill 不值一套完整 plugin 脚手架（LICENSE / README / CHANGELOG / 独立 version 生命周期）。YAGNI。 |
| **C — 合并为 1 个 `explain` skill** | 单 skill 带 quick/deep 模式 | picker 1 → 2（最省），但违背 source 刻意的双命令设计（两种不同认知契约：一段 vs 六节），丢失清晰的 `/glossary` vs `/concept` 心智模型。 |
| **A — 两 skill 入 learn-kit**（选中） | 本 ADR | 见 §2。 |

用户在 brainstorming 阶段显式选 A。

## §5 Implementation Plan

1. worktree `feature/learn-kit-explanation-skills`（off develop，per G1 `git worktree add`）。
2. 写 2 个 SKILL.md（集成层适配）。
3. plugin 元数据：plugin.json + CHANGELOG + README + CLAUDE.md。
4. 本 ADR + `docs/INDEX.md`。
5. marketplace 元数据：marketplace.json + VERSION + 根 README + 根 CHANGELOG + 根 CLAUDE.md（A6 sync）。
6. Stage 5 合规：`plugin-dev:plugin-validator` + `plugin-dev:skill-reviewer`。
7. Stage 6 dogfood（qualitative，subjective prose 输出）。
8. Stage 7 self-review → Stage 8 commit / push / PR（feature → develop，**HITL: 人工 merge**）。

## §6 Acceptance Criteria

- [ ] `plugins/learn-kit/skills/{glossary,concept}/SKILL.md` 存在，frontmatter = `name` + `description`（无 `allowed-tools` / `argument-hint`），含 routing clause。
- [ ] `three-views` 未改动。
- [ ] 版本三角一致：plugin.json `3.2.0` ↔ marketplace.json plugins[0] `3.2.0` ↔ marketplace.json metadata.version `6.2.0` ↔ VERSION `6.2.0` ↔ 根 README badge `6.2.0`。
- [ ] `plugin-validator` 通过（6 必需字段 / 目录结构 / 版本一致）；`skill-reviewer` 对两新 skill 无 critical。
- [ ] A6：根 `CLAUDE.md` 已同步（plugin 描述 3 skill + 历史版本记录 v6.2.0 行）。
- [ ] dogfood：`/learn-kit:glossary <term>` 出六槽一段；`/learn-kit:concept <concept>` 出六节且正例 A/B 跨域；裸术语不误触 `three-views`。

## §7 References

- [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](./[ADR]_LearnKit_Consolidation_To_Single_Skill.md) — v6.0.0 收敛（本 ADR reconcile 其 picker-noise 论点）
- [`[ADR]_LearnKit_ThreeViews_HITL_Expansion`](./[ADR]_LearnKit_ThreeViews_HITL_Expansion.md) — v6.1.0 additive 扩展（同款 additive-minor + 双 commit 模式先例）
- [`[ADR]_Develop_PreBump_Adoption`](./[ADR]_Develop_PreBump_Adoption.md) — pre-bump slot 消耗机制
- [`[STANDARD]_AI_Engineering_Execution_HITL_Prompt`](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) §3.2（既有 plugin 内 skill 增加 = 可默认处理）/ §4.10（feature → develop 人工 merge）

## §8 Decision Log

- 2026-06-02 — v1.0 Accepted。用户 brainstorming 选 Option A；`/plugin-dev:create-plugin` + `/skill-creator:skill-creator` 双 rubric 评估确认近-verbatim 集成 + frontmatter `name`+`description` only + routing clause 为唯一实质补充。
