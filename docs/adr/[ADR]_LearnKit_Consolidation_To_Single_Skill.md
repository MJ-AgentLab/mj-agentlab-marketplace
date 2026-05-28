---
type: adr
scope: marketplace
summary: learn-kit 5 skill 收敛为单一 three-views skill；删 4 skill + 重命名 generate-tier + NLM 范围 13→max 10；marketplace 6.0.0 BREAKING
owner: marketplace-maintainers
created: 2026-05-28
updated: 2026-05-28
state: active
version: v1.0
domain: plugin-dev
tags:
  - consolidation
  - learn-kit
  - rename
  - breaking
  - v6.0.0
related:
  - ./[ADR]_LearnKit_Init_Skill_Rename.md
  - ./[ADR]_NotebookLM_Kit_Retirement.md
  - ../guide/[GUIDE]_Migration_From_v3_to_v4.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
---

# [ADR] learn-kit 5 Skills → 1 `three-views` Skill (marketplace v6.0.0)

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-28 |
| Author | ranzuozhou |
| Scope | learn-kit + marketplace |
| Reversibility | one-way door（4 skill 物理删除 + 1 skill rename；不留 alias / stub） |
| Marketplace version impacted | 5.0.2 (develop) → **6.0.0** |
| Plugin version impacted | learn-kit 2.0.1 → **3.0.0** |

## §1 Context

learn-kit v2.0.1 持有 **5 个 skill / 22 files / ~1385 LOC**：

| Skill | LOC | Files | 实际使用频率 |
|-------|-----|-------|--------------|
| scaffold-learning | 60 | 4 | 极低（一次性 bootstrap） |
| locate | 197 | 1 | 低（dogfood 中很少独立调用） |
| scan | 228 | 1 | 低（同上） |
| generate-tier | 310 | 5 (含 4 templates) | **高**（核心 AI 三档生成） |
| nlm-studio | 590 | 11 (含 10 templates) | **高**（NLM 多媒体收口） |

### 触发本 ADR 的观察

1. **多 skill 形成 slash-picker 噪音**：用户键 `/learn-kit:` 会列出 5 个候选，但 4 个里只有 generate-tier + nlm-studio 是真高频路径。scaffold/locate/scan 在 dogfood 中独立调用极少（功能可由 Read/Glob/Grep 替代）
2. **skill 内部 cross-reference 链路重**：generate-tier SKILL.md 多处 cross-refer scaffold-learning / locate / scan / nlm-studio；nlm-studio SKILL.md cross-refer generate-tier。任何一处命名变化需要同步 4 处。维护成本与价值不对称
3. **共享模板漂移风险**：generate-tier/templates/{foundation,structural,challenge}.md 与 nlm-studio/templates/view-{foundation,structural,challenge}.md 表达"同三视角"的不同侧面（markdown 生成 vs NLM focus_prompt 前缀），两套同步演化困难
4. **NLM 13 artifact 偏多**：v1.0.0 dogfood 验证 infographic 在用户接受度上明显低于 audio/video/slide_deck/mind_map；13 artifact 占 NLM Studio 日上限 65%，但 infographic 部分常被用户跳过
5. **用户意图收敛**：实测中用户的主要诉求是 "围绕一个学习主题生成多视角 markdown + 按需 HTML/NLM 加工"。3 个 helper skill 是对该诉求的分散表达

### 用户实际诉求

> "整理当前 learn-kit 的情况，评估对当前 learn-kit 下的技能进行简化重构，使其变为一个技能；功能是根据用户需要学习的内容，生成 3 阶段的 md 文档，生成 html 和 nlm studio 需要询问用户。"

诉求是 **物理上收敛为 1 个 skill**，配套 HTML 与 NLM 作 opt-in 后处理。

## §2 Decision

We decide to **物理删除 4 个辅助 skill，把 generate-tier 重命名为 `three-views` 并吸收 nlm-studio 的完整能力作为可选 opt-in**：

### §2.1 Tier-1（核心动作）

1. **删除 4 个 skill 整目录**（不留 alias / stub —— per [`[ADR]_LearnKit_Init_Skill_Rename`](./[ADR]_LearnKit_Init_Skill_Rename.md) §"任何残留都会让 Claude Code slash 拾取器重新列出候选" 同款推理）：
   - `plugins/learn-kit/skills/scaffold-learning/`
   - `plugins/learn-kit/skills/locate/`
   - `plugins/learn-kit/skills/scan/`
   - `plugins/learn-kit/skills/nlm-studio/`
2. **重命名** `plugins/learn-kit/skills/generate-tier/` → `plugins/learn-kit/skills/three-views/`（git mv 保 history）
3. **`three-views` SKILL.md 重写**：5-step workflow（Intake → Source acquisition → 3-view md → Multi-select opt-in → Execute），allowed-tools 扩张含 `WebFetch` + 9 个 `mcp__plugin_learn-kit_notebooklm-mcp__*`；保留 nlm-studio 的全部 dogfood 防护（auth refresh 4 dogfood findings / source validation / re-run guard 4-way / bounded polling / quota right-sizing 4-way）
4. **模板收敛 10 个**（原 generate-tier 4 + nlm-studio 10 - infographic 1 - 重复 view 3 = 10；其中 3 个 view template 使用 BEGIN/END marker 强分隔双段）：
   - `view-foundation.md`、`view-structural.md`、`view-challenge.md` —— 各自含 `<!-- BEGIN:MARKDOWN_GENERATION_PROMPT -->` 段（原 generate-tier 内容）+ `<!-- BEGIN:NLM_VIEW_PREFIX -->` 段（原 nlm-studio §1-§5）
   - `html-renderer.md` —— 重写支持 **dual-mode grounding**：repo-code（项目内文件源时调 Explore subagent）vs source-evidence（外部 URL / 粘贴文本源时挂 source_manifest 的 (id, locator, line/char range)）
   - `artifact-audio.md` / `artifact-video.md` / `artifact-slide_deck.md` / `artifact-mind_map.md` —— 从 nlm-studio 原样迁移（git mv 保 history）
   - `interaction-overrides.md` —— 从 nlm-studio 迁移并裁掉 `foundation × infographic` 行
   - `language-directive.md` —— 从 nlm-studio 原样迁移（v2.0.1 dual-lock Chinese 保留）

### §2.2 Tier-2（NLM 范围裁剪决策）

5. **NLM artifact 上限从 13 降到 max 10**：
   - 删 infographic：所有 3 个 view × infographic = 4 artifact 移除（infographic 在 dogfood 中用户接受度最低；视觉密集型对学习曲线增益不显著）
   - 删 13 中默认 mind_map：但保留为 Step 4 的可选第 3 项 multiSelect 选项（mind_map view-agnostic + 全局价值高；NLM 媒介限制使其不参与 view-purpose preservation）
   - **新默认**：Step 4 multiSelect 3 选 = [HTML / NLM 9 view-cycled / NLM mind_map]；max 实际产出 = 9 + 1 = 10 artifact
6. **NLM quota subset gate 保留**：即便 9+1 < 原 13，仍无 API 查当日已用量；Step 5B Step 6 保留 4 选（Confirm all / Reduce subset / Pick single view / Abort）防中途 quota 失败

### §2.3 Tier-3（配套工程动作）

7. **bump version**：
   - learn-kit `2.0.1 → 3.0.0`（major：5 → 1 skill = 公开 slash command surface 4 个消失 + 1 个重命名；与 v2.0.0 init→scaffold-learning 同级 breaking）
   - marketplace `5.0.2 → 6.0.0`（major：跟随 plugin major + marketplace.json description 字段已把 5 skill 名暴露在 consumer 契约里；参考 v4.0.0 notebooklm-kit 退役 + v5.0.0 init rename 双前例）
8. **A6 CI gate 必触发**（plugin.json + SKILL.md 改）→ marketplace 根 `CLAUDE.md` 必须同步 per Framework v1.6 §2.7 sync allowlist
9. **CHANGELOG 双层 + Migration guide 增章节**：
   - `plugins/learn-kit/CHANGELOG.md` 新 `[3.0.0] - 2026-05-28` 段
   - 顶层 `CHANGELOG.md` 新 `[6.0.0] - 2026-05-28` 段
   - `docs/guide/[GUIDE]_Migration_From_v3_to_v4.md` 末尾新增 §6 `v5.0.x → v6.0.0` 章节，给出 5 条旧→新映射 + 算法保留 GUIDE 链接
10. **新建 plugin-internal GUIDE 保留 locate/scan 算法**：`plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md` —— 把 locate（概念反查 + 置信度评分）+ scan（canonical doc 枚举 + 引用排名）的核心算法以"manual recipes"形式保留，避免知识丢失
11. **scaffold-learning 替代行为内联到 three-views Step 1**（Option B）：默认路径 `./learning/<topic>/` 下首次运行自动建 INDEX 骨架（仅主标题 + 当前 topic 行；多 topic 后续 append）；**不**再生成 `_meta/METHODOLOGY.md` 与 `_archive/`（manual methodology 在 dogfood 中独立调用极少，AI 三档已覆盖其核心价值）

### §2.4 范围边界

- **In-scope**: 5 skill → 1 skill 物理收敛 + 命名 + NLM 范围裁剪 + 双层 version bump + ADR + Migration + Discovery Recipes GUIDE + plugin/marketplace 元数据同步
- **Out-of-scope**: `notebooklm-mcp` server 本身（仍是依赖，`.mcp.json` 不动）；MCP 工具前缀（仍是 `mcp__plugin_learn-kit_notebooklm-mcp__*`）；historic CHANGELOG entries 改写（保事实记录）
- **Open questions**: 暂无（plan v2 已收齐所有 P0/P1 决策点）

## §3 Consequences

### §3.1 正面

- **认知负担降低**：slash-picker 5 候选 → 1 候选；用户不再需要记忆 5 个 skill 各自负责什么
- **维护成本下降**：22 文件 → 11 文件（含 SKILL.md 1 + templates 10）；plugin-internal cross-reference 大幅简化
- **模板漂移消除**：view-{foundation,structural,challenge}.md 单文件双段（BEGIN/END marker）杜绝两套 view 描述分别演化
- **dogfood 防护资产 100% 继承**：nlm-studio 4 条 finding（auth gate / HTML 拒收 / token 短寿 / source_add 响应不可靠）+ View-Purpose Preservation principle + failsafe lint 全部在新 SKILL.md 内继承
- **新增能力**：URL 输入（WebFetch）+ source_manifest 结构化追踪 + HTML dual-mode grounding（应对外部源场景）
- **MCP 依赖契约不变**：notebooklm-mcp server 名 + 工具前缀 + nlm login 流程全部稳定，下游 nlm-studio 用户切到 three-views Step 4 NLM 路径行为等价（除范围裁剪外）

### §3.2 负面 / 代价

- **5 个公开 slash command 消失**（user-facing breaking）：
  - `/learn-kit:scaffold-learning` 永久删
  - `/learn-kit:locate` 永久删
  - `/learn-kit:scan` 永久删
  - `/learn-kit:generate-tier` → `/learn-kit:three-views`（重命名）
  - `/learn-kit:nlm-studio` → 收入 `/learn-kit:three-views` Step 4 opt-in
  - Migration guide §6 + 顶层 CHANGELOG 是唯一缓冲
- **NLM infographic 4 artifact 永久丢失**（v2.x 用户若依赖 infographic 需用 NLM web UI 手动建）
- **view template 合并可能丢失边角细节**：双段合并时若 generate-tier `foundation.md` 与 nlm-studio `view-foundation.md` 存在隐式同名概念但语义不同会被遗漏。Mitigation: BEGIN/END marker 隔离 + Stage 5 静态 lint 检 §1-§5 完整性
- **scaffold-learning `_meta/METHODOLOGY.md` + 8 阶段方法论文档脚手架** 不再自动生成：保留在 git history 与本 ADR 引用中；如需 manual methodology workflow，用户须从历史 commit 拷贝
- **下游 marketplace consumer 同步压力**：mj-system / mj-agent / 外部 fork 均需做一次 version 同步与 slash command grep

### §3.3 风险

- **不彻底 grep 留残**：若 PR 漏改某处 `/learn-kit:<old>` 引用，会导致 docs 与 plugin 实际行为脱钩。**Mitigation**: Stage 5 compliance 必须跑 `grep -rn "/learn-kit:(scaffold-learning|locate|scan|generate-tier|nlm-studio)" plugins/ docs/ README.md` 且仅允许在 CHANGELOG 历史段 + Migration §6 + 本 ADR + Discovery Recipes GUIDE 内出现
- **dual-mode grounding 在 mixed source 场景下行为不明**：当 source_manifest 同时含 file + URL 时优先 code grounding，URL 部分概念无 file ground 时退 source-evidence。Mitigation: html-renderer.md 模板内置 `<missing-evidence/>` 占位机制，不虚构 file path
- **A6 gate 阻断**：marketplace `CLAUDE.md` 未同步即阻 PR。Mitigation: Stage 5 之前确认同步；不用 `[skip a6]`
- **mind_map 作为 Step 4 第 3 选项可能让用户误以为 mind_map 也是 view-cycled**：Step 4 description 明确"shared / view-agnostic"标签，并在 SKILL.md 内反复出现 dogfood finding #5 引用

## §4 Alternatives Considered

### §4.1 Option A: 维持 5 skill 不动 + 仅修文档减少混淆

- **Pros**：零代码变动；向后兼容
- **Cons**：dogfood 表明用户实际只用 generate-tier + nlm-studio；scaffold/locate/scan 占用 slash-picker 噪音但价值低；模板漂移问题不解决
- **否决**：用户已明示要"物理上变为一个技能"，不是 documentation-only

### §4.2 Option B: 删 scaffold/locate/scan 保留 nlm-studio 独立

- **Pros**：保留 nlm-studio 已稳定的 590 LOC 工程资产；合并风险低
- **Cons**：未达成"一个 skill"目标；generate-tier → nlm-studio 仍需用户手动跨 skill 跳转；模板漂移问题不解决
- **否决**：用户明确选最激进路线"全部删除，只保留新单 skill"

### §4.3 Option C: 删 5 skill 全部重写为单一 minimal skill（不继承 nlm-studio 防护）

- **Pros**：代码量最小；新 skill ~300 LOC 内可写完
- **Cons**：nlm-studio 4 条 dogfood finding（auth / source / token / HTML 拒收）+ View-Purpose Preservation + failsafe 等已验证防护全部丢失；新 skill 第一次实战必然再走一遍 dogfood 失败循环
- **否决**：dogfood 资产是高价值证据，主动放弃是逆工程

### §4.4 Option D: 保留 NLM 13 artifact 全集

- **Pros**：用户行为变化最小（迁 generate-tier → three-views 后 NLM 行为完全等价）
- **Cons**：infographic dogfood 数据显示低接受度；保留意味着模板维护成本不降；占 NLM Studio 日上限 65%
- **否决**：用户在 plan 阶段决策为 audio/video/slide_deck 三类（默认 9 + mind_map 可选 = 10）；选择性裁剪比保全集更符合实际使用模式

### §4.5 Option E: marketplace 升 5.1.0 而非 6.0.0

- **Pros**：bump 节奏更平缓；不触发下游强同步信号
- **Cons**：5 个用户可见 slash command 消失 + 1 个重命名 = 用户接口 breaking；marketplace.json description 字段已暴露 5 skill 给 consumer 契约；marketplace HITL STANDARD §3.1 明确"plugin 重命名 / 主版本 bump"是高风险触发器
- **否决**：违反 marketplace 自身 HITL 规则；v4.0.0（删 notebooklm-kit）+ v5.0.0（init rename）已建立"plugin user-facing breaking → marketplace major" precedent

## §5 Implementation Plan

按 HITL STANDARD §1 11 阶段闭环执行（在 `feature/learn-kit-consolidate-three-views` worktree 内）：

1. **Stage 3 ADR**（本文档）—— 决策先行
2. **Stage 4a 删除 + 重命名**：
   - `git mv plugins/learn-kit/skills/generate-tier plugins/learn-kit/skills/three-views`
   - `git mv plugins/learn-kit/skills/nlm-studio/templates/{artifact-audio,artifact-video,artifact-slide_deck,artifact-mind_map,language-directive,interaction-overrides}.md plugins/learn-kit/skills/three-views/templates/`
   - `git rm` 剩余 nlm-studio + scaffold-learning + locate + scan 整目录
3. **Stage 4b 三 view template 合并 + html-renderer 重写 + SKILL.md 重写**
4. **Stage 4c plugin meta**：plugin.json 3.0.0 + CLAUDE.md + README + CHANGELOG + docs/guide 同步
5. **Stage 4d 新建 Discovery Recipes GUIDE + Migration §6**
6. **Stage 4e marketplace meta**：VERSION 6.0.0 + marketplace.json + 根 CLAUDE.md + README + CHANGELOG（A6 gate sync）
7. **Stage 5 Compliance**：plugin-validator + skill-reviewer agent + doc validate
8. **Stage 6 Dogfood**：算法 trace 10 个 verification case
9. **Stage 7 Self-review** 双段 + 12-item checklist
10. **Stage 8 Commit + Push + PR**

Related documentation updates:

- `docs/INDEX.md`: register this ADR + new Discovery Recipes GUIDE entry
- `plugins/learn-kit/docs/INDEX.md`: register new Discovery Recipes GUIDE
- `CHANGELOG.md` (marketplace 根): v6.0.0 entry
- `plugins/learn-kit/CHANGELOG.md`: v3.0.0 entry

## §6 Acceptance Criteria

- [ ] `plugins/learn-kit/skills/` 仅有 `three-views/` 一个子目录（4 个旧 skill 目录不存在）
- [ ] `plugins/learn-kit/skills/three-views/` 有 1 SKILL.md + 10 templates（templates 文件名与本 ADR §2.1.4 完全一致）
- [ ] view template 含 `<!-- BEGIN:MARKDOWN_GENERATION_PROMPT -->` + `<!-- BEGIN:NLM_VIEW_PREFIX -->` 双 marker；NLM_VIEW_PREFIX 段含 §1-§5
- [ ] `plugins/learn-kit/.claude-plugin/plugin.json` version = `3.0.0`
- [ ] `VERSION` 与 `.claude-plugin/marketplace.json metadata.version` 均为 `6.0.0`；`.claude-plugin/marketplace.json plugins[learn-kit].version` = `3.0.0`
- [ ] `plugins/learn-kit/CHANGELOG.md` 含 `[3.0.0]` 段；顶层 `CHANGELOG.md` 含 `[6.0.0]` 段
- [ ] `docs/guide/[GUIDE]_Migration_From_v3_to_v4.md` 含 §6（v5.0.x → v6.0.0）
- [ ] `plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md` 存在
- [ ] 全仓 grep `/learn-kit:(scaffold-learning|locate|scan|generate-tier|nlm-studio)` 仅命中：CHANGELOG 历史段 + Migration §6 + 本 ADR + Discovery Recipes GUIDE
- [ ] marketplace 根 `CLAUDE.md` learn-kit 段反映 single-skill 结构（A6 gate sync 通过）
- [ ] CI 6 步全过；A6 gate green

## §7 References

- Plan: `~/.claude/plans/plugins-learn-kit-learn-kit-floating-graham.md`（v2 修订版，吸收审阅 P0/P1 反馈 18 条 + mind_map 决策）
- 前例 ADR:
  - [`[ADR]_LearnKit_Init_Skill_Rename.md`](./[ADR]_LearnKit_Init_Skill_Rename.md) — plugin user-facing rename → marketplace major bump precedent
  - [`[ADR]_NotebookLM_Kit_Retirement.md`](./[ADR]_NotebookLM_Kit_Retirement.md) — 大规模 skill / plugin 删除 + 能力吸收 precedent
- Migration guide: [`[GUIDE]_Migration_From_v3_to_v4.md`](../guide/[GUIDE]_Migration_From_v3_to_v4.md) §6 v5.0.x → v6.0.0
- HITL STANDARD: [`[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) §3.1 plugin 删除 / 重命名 / 主版本 bump 必停
- Framework: [`[STANDARD]_Documentation_Framework.md`](../rule/[STANDARD]_Documentation_Framework.md) §2.7 CLAUDE.md sync allowlist + §4.3.1 A6 CI gate

## §8 Decision Log

| Date | State | By | Note |
|------|-------|----|------|
| 2026-05-28 | accepted | ranzuozhou | initial — 用户在 plan v1 中提"5→1 收敛"诉求；plan v2 经审阅吸收 18 条 P0/P1 反馈后定稿；本 ADR 在 worktree 内 Stage 3 起草 |
