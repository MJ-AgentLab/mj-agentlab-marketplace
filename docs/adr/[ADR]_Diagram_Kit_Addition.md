---
type: adr
scope: marketplace
summary: 新建 diagram-kit plugin（arch-diagram skill + 9 references bundle + 泛化 Mermaid validator）；marketplace 史上首次 plugin 计数 1 → 2；显式 reconcile 8→3→1 收敛方向（正交能力才开新 plugin）；additive minor；marketplace 6.2.1 → 6.3.0 / plugin diagram-kit 0.1.0
owner: marketplace-maintainers
created: 2026-06-05
updated: 2026-06-05
state: active
version: v1.0
domain: plugin-dev
tags:
  - diagram-kit
  - plugin-addition
  - architecture-diagram
  - mermaid
  - validator-generalization
  - v6.3.0
related:
  - ./[ADR]_LearnKit_Explanation_Skills_Addition.md
  - ./[ADR]_LearnKit_Consolidation_To_Single_Skill.md
  - ./[ADR]_NotebookLM_Kit_Retirement.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../rule/[STANDARD]_Commit_Message_Convention.md
  - ../spec/[SPEC]_Marketplace_Json_Schema.md
---

# [ADR] diagram-kit Plugin Addition（marketplace v6.3.0）

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-06-05 |
| Author | ranzuozhou |
| Scope | marketplace（new plugin diagram-kit + 治理资产同步）|
| Reversibility | reversible（plugin 物理删除即回退；无 schema 破坏、无下游消费者已依赖、无 secrets / state；删除是 major bump per [SPEC] §4.2）|
| Marketplace version impacted | 6.2.1 (develop pre-bump) → **6.3.0** |
| Plugin version impacted | **diagram-kit 0.1.0**（new；learn-kit 3.2.0 不动）|

## §1 Context

外部有一套自洽、领域无关的「架构绘图通用层」语料 `D:\Document\My-Local-Vault\UML\for-skill\`（2026-06-05 定稿版），共 **9 份 markdown**：

| 类别 | 文件 | 角色 |
|------|------|------|
| 方法论基础（"绘图前必读"）| `architecture-methodology.md`（22 KB）| 架构三/四要素 + Kruchten 4+1 视图 + C4 缩放轴 + 三框架对应表 + §4.1 Mermaid 顶层语法 + §五 边语义（§5.0 跨图符号警示）|
| bridge + 命名 SSOT | `domain-acquisition.md`（15 KB）| §2 6 类领域画像 + §3 L0–L3 事实获取阶梯 + §4 四域 source-map + §5.1 全局适用性矩阵 + **§6 图名/slug 唯一事实源** + §7 作者配方 |
| 7 类图绘制提示词 | `context / container / component / sequence / state-machine / deployment / code-diagram.md` | 逐类图怎么画；各引用 `domain-acquisition §3`（阶梯）+ `§6`（命名）|

配套有一个 ~287 行纯 stdlib Mermaid linter，目前仅存在于 sibling 目录 `postgreSQL/validate_diagram.py`（PG 绘图手册专属；`for-skill/` 不含脚本）。

**上一版方案**把这套技能设计为**个人全局 skill** `~/.claude/skills/arch-diagram/`，明确 disclaim "个人 skill 不需 marketplace 全套 HITL / PR 流程"。**本次请求改变归属**：把它构建为 **mj-agentlab-marketplace 下受治理的 marketplace plugin**，用户指定 plugin 用 `/plugin-dev:create-plugin`、skill 用 `/skill-creator:skill-creator`，意图产出一个对外通用、与 learn-kit 并列的**第 2 个 plugin**。

### §1.1 为什么是新 plugin（而非加进 learn-kit）

learn-kit 是 marketplace 的**教学方法论 kit**（plugin.json description: "Pedagogical kit"）。其能力域是「把一个主题转成可学习产物（分层 markdown / 交互 HTML / NotebookLM 多媒体）」。arch-diagram 的能力域是「把一个**代码库 / 系统的事实**转成**架构图（Mermaid）**」——

- **域正交**：两者不共享教学契约、source 模型、产物模型。arch-diagram 产出的不是"学习材料"，而是**证据绑定的工程交付物**（每个节点/边可追 `file:行号`）。
- **无法自然内化**：v6.2.0 把 `glossary` / `concept` 加进 learn-kit 是因为它们落在 learn-kit 自己的 pedagogy/解释 niche（kit 名即"Pedagogical kit"）。arch-diagram 在 pedagogy kit 里**没有家**——硬塞会让 learn-kit 变成两件不相关的事，污染其 description 与 trigger 路由。
- **形态实质、非微**：arch-diagram 是 tool-using skill（Read/Glob/Grep/Bash/Write/AskUserQuestion），带 9 份 reference bundle + 一个 ~287 行 validator 脚本，值得独立 plugin 生命周期（独立 `0.1.0 → 1.0.0` 成熟曲线 / 独立 CHANGELOG / 独立 dogfood 域）。

### §1.2 触发本 ADR 的治理张力（最大 landmine）

marketplace 自 v3.0.0（8 plugin → 删 5 个 mj-system 专属）/ v4.0.0（notebooklm-kit 退役吸收进 learn-kit → 1 plugin）一路**收敛到 1 个 plugin**。更近的 [`[ADR]_LearnKit_Explanation_Skills_Addition`](./[ADR]_LearnKit_Explanation_Skills_Addition.md) §4 甚至**显式否决过新建第 2 个 plugin**（Alternative B「新建 explain-kit plugin」被否，理由：逆转 8→3→1 收敛 + 2 个微型 prompt skill 不值一套完整 plugin 脚手架，YAGNI），选择在 learn-kit 内加 skill。

**`diagram-kit` 是仓库史上首次 plugin 计数 1 → 2。** 这与「收敛 / 独立性」基调表面相反，必须在本 ADR 显式 reconcile，而非静默违背既有 ADR。

## §2 Decision

新建 `plugins/diagram-kit/`（与 `plugins/learn-kit/` 并列），v1 单 skill `arch-diagram`，bundle 9 份 references（verbatim cp 自 vault for-skill）+ 一份从 PG 版泛化而来的 Mermaid validator。

### §2.1 Tier-1（核心动作）

1. **新建 plugin `diagram-kit`**：mirror learn-kit 目录（`.claude-plugin/plugin.json` 8-field union / `CLAUDE.md` / `README.md` / `CHANGELOG.md` / `LICENSE` / `skills/`）。**无 `.mcp.json`**（arch-diagram 零 MCP 依赖；per [`[SPEC]_Plugin_Json_Schema`](../spec/[SPEC]_Plugin_Json_Schema.md) §3.3 optional——缺省最干净）。**无 plugin-internal `docs/`**（与 v6.2.0 加 glossary/concept 时一致；设计 rationale 全部承载在本 marketplace 层 ADR）。
2. **单 skill `arch-diagram`**：`/diagram-kit:arch-diagram`；5 步事实先行工作流（scope → L0–L3 事实获取 → 按 §5.1 适用性矩阵挑图 → 套 §5 边语义 + §6 命名出 Mermaid → validate-fix-repeat）。frontmatter = Claude-Code 原生 `name` + `description` + `allowed-tools`（**禁** marketplace 8-field doc frontmatter）。
3. **9 份 references bundle**（`skills/arch-diagram/references/`，一层深，progressive disclosure 懒载）：2 hub（architecture-methodology + domain-acquisition）+ 7 类图提示词，**全部 verbatim cp**（vault 已彻底领域无关，无需改写）。
4. **泛化 validator**（`skills/arch-diagram/scripts/validate_diagram.py`）：见 §2.3。

### §2.2 Tier-2（1 → 2 plugin reconciliation —— 本 ADR 的 linchpin）

**接受 plugin 1 → 2，理由如下**：

[`[ADR]_LearnKit_Explanation_Skills_Addition`](./[ADR]_LearnKit_Explanation_Skills_Addition.md) §4 否决第 2 个 plugin 的两条理由都是 **skill-shaped / scale-shaped**，不是「永不开新 plugin」的通则：

| 当年否决理由 | 对 glossary/concept 成立 | 对 diagram-kit 是否成立 |
|------|------|------|
| 逆转 8→3→1 收敛方向 | ✅（两个 prompt skill 本可内化进 learn-kit）| **❌ 不成立**——收敛方向针对的是**删低价值 / 冗余 / 碎片化 plugin**（v3.0.0 删 mj-system 专属 / v4.0.0 吸收 notebooklm-kit）；从来不是"永远 1 plugin"的誓言。原则是「不把相关能力碎成微 plugin、不留死重」，而非"绝不增加正交能力" |
| 2 个微 prompt skill 不值完整 plugin 脚手架（YAGNI）| ✅（纯 prompt、无 tool、无 file）| **❌ 不成立**——arch-diagram 是实质 tool-using skill + 9-file bundle + validator 脚本，**本就需要**独立 version 生命周期 / CHANGELOG / dogfood 域；脚手架不是负担而是必需 |

**核心论点**：决定「skill 进既有 plugin vs 开新 plugin」的判据是**域归属**，不是 plugin 计数。glossary/concept 进 learn-kit 是因为它们**属于** pedagogy；arch-diagram 开新 plugin 是因为它**不属于** pedagogy——**同一条逻辑**（域归属）既把 glossary/concept 放进 learn-kit，也把 arch-diagram 放到 learn-kit 之外。diagram-kit 是 marketplace 第一个**真正正交、独立成立**的能力，2 个 plugin 是**正确切分**，不是计数膨胀。

（对照记忆 `feedback_standard_overrides_plan`：与既有 STANDARD / ADR 方向有张力时，调整方案并经 ADR 显式记录，绝不静默违背——本 §2.2 即该记录。）

### §2.3 Tier-3（validator 泛化决策）

从 `postgreSQL/validate_diagram.py` 泛化出 plugin 自带的通用 linter，**自此与 PG 版双源分叉**（评审收紧点 C：泛化版独立演进，PG 后续特化不回流通用版；两版各自维护）：

1. **REMOVE PG 专属**：`role_expected_shape()` 函数 + `ROLE-03` check 块 + docstring 里 ROLE-03 行（PG `ods_/dwd_/dws_/dim_`→shape 映射是领域特化）。
2. **CRITICAL FIX —— `SLUG_VALID` / `SLUG_LEVEL_BAD`**（泛化真正难点）：PG 版 `^(?:struct-l[123]|mech|phys|runtime)…` 会 FAIL 通用模板自带的 slug（`dyn-*` 前缀 + `struct-l4`）。依 `domain-acquisition.md §6`（唯一事实源）通用基线改为：
   - `SLUG_VALID = ^(?:struct-l[1234]|dyn|phys)(?:-[a-z0-9]+)*$`
   - `SLUG_LEVEL_BAD = ^(?:dyn|phys)-.*\bl[1234]\b`
   - §6 规范表确认通用 slug 基 = `struct-l1..l4 / dyn / phys`；PG 版 `mech|runtime` 是领域特化轴名，`运行态`/runtime 为显式标注的非标准扩展轴（领域 handbook 可再特化扩展该 regex）。**不修则 bundled validator 在自己 ship 的模板 slug 上全 NAME-02 FAIL。**
3. **code 图命名门补强**（评审缺口 1）：`diagram_type()` 把 `classDiagram` 归 `'class'`（不入 skip 集），使类型无关的 NAME-01/02 命名门对 code 图也跑（此前 `classDiagram` 归 `'other'` → 整块 `continue` 跳过 → "0 FAIL" 对 code 图是假绿）。完整 classDiagram 结构 lint 仍列 `0.x → 1.0.0` 演进项；SKILL Step 5 显式注明该残留 gap → 退回 `code-diagram.md` 自检清单人工把关。
4. **docstring**：`SLUG_LEVEL_BAD` 仅对裸 `l1`-`l4` 用例名误判，词边界已护住 `level1` 类；加显性约束告诫（评审收紧点 A）+「领域 handbook 可再特化扩展该 regex」。
5. **KEEP 通用**：MM-01 / CLS-01·02·03 / LEG-01 / TXT-01·03 / NAME-01·02·03 / SEQ-02·03·04 / STATE-01·02 + 全部解析函数。

### §2.4 Tier-4（形态 / 命名 / 输出约定决策）

1. **`references/` 而非 `templates/`**：9 份是**按需懒载的知识参考**（方法论 + 命名 SSOT + 逐类提示词），不是 three-views 那种「占位符替换骨架」；`references/` 命名更贴语义（official skill spec 允许 references / templates / scripts 三种 skill 内子目录）。
2. **单 skill bundle，不拆 7 个 skill**：7 类图共享同一套 L0–L3 事实获取 + 命名 SSOT，**co-load** 才能交叉引用（画 container 时要看 context；slug 命名要查 §6）；拆 7 skill 会让 picker 噪音 +7 且割裂共享上下文。与 three-views「10 templates bundle 进单 skill」先例一致。（已用户确认。）
3. **输出 `text` 围栏约定**（本次新增需求）：生成图 `.md` 里每个 Mermaid 图的代码围栏一律用 ` ```text `（**禁** ` ```mermaid `），使图在 GitHub / Obsidian / VS Code 显示为**源码、不自动渲染**。依据：(a) for-skill 语料已核 **17 处 `text` 围栏 / 0 处 `mermaid`**——图源（含 `%% Name`/`%% Slug` + 团队约定线型 + legend）本身即证据绑定交付物，渲染会隐藏 `%%` 元信息且对中文/复杂 subgraph 易渲染失败；(b) bundled validator `extract_blocks` 本就扫 `text` 围栏（`lang in ('text','mermaid','')`），输出 `text` 与机检零摩擦。若个别用户要渲染可自行改 `mermaid`（非默认）。

### §2.5 Tier-5（配套工程动作）

1. **版本**：marketplace `6.2.1 → 6.3.0`（minor；新增 plugin 是 additive，per [`[SPEC]_Marketplace_Json_Schema`](../spec/[SPEC]_Marketplace_Json_Schema.md) §4.2「Adding a plugin is a minor bump」，且 §4.2 示例新 plugin 即用 `0.1.0`；**消耗当前 post-v6.2.0 develop pre-bump slot 并落实为真 minor**，与 v6.1.0 / v6.2.0 同款 pattern——非又一次 patch pre-bump）。plugin `diagram-kit = 0.1.0`（评审收紧点 B：code 图结构 lint 缺口 + marketplace 域未验 + 待 Stage 6 eval = "功能未定型"信号，`0.1.0` 比 "1.0.0 首个 stable" 诚实；与 learn-kit `0.1.0` 起源一致）。
2. **A6 CI gate 必触发**（命中 5 类 trigger：commit STANDARD 编辑 / VERSION / marketplace.json / 新 plugin.json / 新 SKILL.md）→ marketplace 根 `CLAUDE.md` 必须同 PR 改 per Framework v1.6 §2.7。
3. **commit scope `diagram-kit` 加入闭合白名单 4 处代码站点**（install-hooks.ps1 / validate-commits.sh / validate-commits.ps1 / 本 ADR 关联的 commit STANDARD §4）+ RUNBOOK drift 第 5 份拷贝；commit STANDARD `v1.1 → v1.2`（§4 规则：新增 scope MUST minor bump 本 STANDARD + §10 Change History）。`bump-version.ps1` ValidateSet 加 `diagram-kit`。
4. **双层 CHANGELOG**：`plugins/diagram-kit/CHANGELOG.md` `[0.1.0]` + 顶层 `CHANGELOG.md` `[6.3.0]`。
5. **元数据同步**：VERSION + marketplace.json（metadata.version + metadata.description + plugins[] append）+ 根 README（badge + 插件目录 + callout + install/usage + Skills）+ 根 CLAUDE.md（A6）+ `docs/INDEX.md`（注册本 ADR + frontmatter v6.3 + plugin 表 2）+ `[SPEC]_Marketplace_Json_Schema` §2.4 snapshot（"one plugin" → 2，直接一致性修正）。

### §2.6 范围边界

- **In-scope**：新 plugin diagram-kit（1 skill + 9 references + 泛化 validator）+ 本 ADR + 版本三角 + commit scope 白名单 5 站点 + 双层 CHANGELOG + 全量元数据/文档同步。
- **Out-of-scope**：learn-kit 任何行为（不动）；vault 原件（只读，verbatim cp，不改）；PG 版 validator（双源分叉后不回流）；完整 classDiagram 结构 lint（列 `0.x → 1.0.0` follow-up）；repo-wide grounding（v1 仅 ground 本地源；未来加 Agent 工具再扩）；`.mcp.json` / plugin-internal docs（精简路径不建）。

## §3 Consequences

### §3.1 正面

- **填补正交能力空白**：marketplace 从「教学材料生成」单一能力扩到「+ 架构图生成」，两者互不重叠、各自独立成立。
- **复用既有健全设计**：上版个人 skill 的 5 步事实先行 + validate 循环 + progressive disclosure 原样保留；仅改归属/流程/validator 泛化。
- **证据绑定纪律**：5 步铁律"每节点/边可追 L0–L2 证据，禁臆造" + bundled linter 机检，使产图可审计。
- **可逆**：plugin 物理删除即完全回退（无 schema 破坏 / 无 secrets / 无 state）。

### §3.2 负面 / 代价

- **plugin 计数 1 → 2**：逆转表面收敛基调（§2.2 已论证：判据是域归属非计数；正交能力开新 plugin 是正确切分）。marketplace catalog / `/plugin` picker 多 1 候选——但两 plugin 域清晰、description routing 互不串味。
- **validator 双源维护**：泛化版与 `postgreSQL/validate_diagram.py` 自此分叉，PG 后续特化不回流通用版（评审收紧点 C；可接受——两版受众/规则集不同）。
- **`0.1.0` 信号**：明示"功能未定型"——code 图结构 lint 缺口 + marketplace 域未必过 + 待 eval；诚实但提醒消费者 0.x 期 API 可能演进。

### §3.3 风险

- **trigger 误路由**（架构图请求误触 learn-kit 三 skill，或反向）：mitigation = arch-diagram description 的 `Do not use for: …（use /learn-kit:*）` 反向路由 clause + three-views 已 disclaim "架构图生成" + Stage 6 dogfood routing 核查。
- **Windows Python 解释器缺失**：mitigation = Step 5 优雅降级（产图 + 提示 "validator skipped" + 退回模板自检清单，不硬失败）；解释器探测 `python → python3 → py -3`。
- **本地 stale commit-msg hook 拒 `diagram-kit` 提交**（评审缺口 3 + 原计划 CRITICAL-2 误判更正）：已核 CI `validate-commits.sh` 用 HEAD 版脚本（含 diagram-kit）逐条校验、**与提交顺序无关、必过**；真卡点是已部署的旧 hook → Stage 8 前置 `! install-hooks.ps1` 重装（PowerShell sandbox 内 agent 跑不了 .ps1，须用户 `!` 跑）。

## §4 Alternatives Considered

| 方案 | 描述 | 否决理由 |
|------|------|---------|
| **B — arch-diagram 加进 learn-kit** | 作 learn-kit 第 4 个 skill | 域不正交：learn-kit 是 pedagogy kit，arch-diagram 是工程绘图，无共享契约；硬塞污染 learn-kit description / trigger 路由（§1.1）。与 v6.2.0 把 glossary/concept 放进 learn-kit 用的**同一条域归属逻辑**——结论相反（arch-diagram 不属于 pedagogy）。|
| **C — 保留为个人全局 skill** `~/.claude/skills/` | 上版方案 | 用户本次显式改归属为受治理 marketplace plugin，要对外通用 + 走完整版本/合规/发布流程。否决前提是用户需求变更。|
| **D — 拆 7 个 per-diagram-type skill** | context/container/…/code 各一 skill | 7 类共享 L0–L3 事实获取 + 命名 SSOT，co-load 才能交叉引用；拆开割裂共享上下文 + picker 噪音 +7。与 three-views bundle 先例相悖。|
| **A — 新建 diagram-kit plugin，单 skill bundle**（选中）| 本 ADR | 见 §2。用户 AskUserQuestion 已锁定 plugin 名 / 单 skill / validator 泛化三项。|

## §5 Implementation Plan

按 marketplace 11 阶段 flow（[`[STANDARD]_AI_Engineering_Execution_HITL_Prompt`](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)）：

1. worktree `feature/diagram-kit-addition`（off develop，`git worktree add`）。
2. 本 ADR（Stage 3）。
3. `/plugin-dev:create-plugin` 建 plugin 壳 + `/skill-creator:skill-creator` 写 `arch-diagram` SKILL.md（Stage 4）；`cp` 9 份 references（cp 前确认 vault 为最新定稿——本会话 2026-06-05 已核）；泛化 validator 进 `scripts/`。
4. 版本三角 + commit scope 白名单 5 站点 + bump-version ValidateSet + 元数据/文档同步。
5. Stage 5 合规：`/plugin-dev:plugin-validator` + `/plugin-dev:skill-reviewer`（0 critical）。
6. Stage 6 dogfood：≥2 真实 repo（docker / python / pg / 本 marketplace plugin 域）端到端产证据绑定 Mermaid 图；generated 图过泛化 validator 0 FAIL（验证 SLUG fix + classDiagram 命名门）。
7. Stage 7 self-review（12-item + 双段）；Stage 8 commit/push/PR（feature → develop；前置 `! install-hooks.ps1`）。
8. Stage 9 merge develop（HITL）→ release PR develop → main（**强制 HITL**）触发 release.yml 自动 tag v6.3.0。

## §6 Acceptance Criteria

- [ ] `plugins/diagram-kit/` 存在且 mirror learn-kit 必需布局（`.claude-plugin/plugin.json` 8-field union / `CLAUDE.md` / `README.md` / `CHANGELOG.md` / `skills/arch-diagram/SKILL.md`）。
- [ ] `skills/arch-diagram/references/` 含 9 份 verbatim cp（architecture-methodology + domain-acquisition + 7 类图）。
- [ ] `scripts/validate_diagram.py` 已泛化：去 ROLE-03 / SLUG_VALID 改 `struct-l[1234]|dyn|phys` / classDiagram 入命名门；对 generated 图（真 slug）0 FAIL。
- [ ] SKILL.md frontmatter = `name` + `description`（+ `allowed-tools`），含 `Do not use for: …（use /learn-kit:*）` routing clause；<500 行；references 一层深。
- [ ] 版本三角一致：plugin.json `0.1.0` ↔ marketplace.json plugins[diagram-kit] `0.1.0`；marketplace.json metadata.version `6.3.0` ↔ VERSION `6.3.0` ↔ 根 README badge `6.3.0`；learn-kit `3.2.0` 不动。
- [ ] commit scope `diagram-kit` 入 4 代码站点 + RUNBOOK drift 拷贝；commit STANDARD v1.1 → v1.2 + §10。
- [ ] A6：根 `CLAUDE.md` 已同步（Project Structure 2 plugins + diagram-kit bullet + 历史版本记录 v6.3.0 + Documentation Framework 头 v6.3.0 / commit v1.2）。
- [ ] `plugin-validator` 通过（8 字段 / 目录结构 / 版本一致 / CHANGELOG）；`skill-reviewer` 对 arch-diagram 无 critical。
- [ ] dogfood：`/diagram-kit:arch-diagram` 在 ≥2 真实 repo 产证据绑定图，抽查无臆造；裸架构图请求不误触 learn-kit。

## §7 References

- [`[ADR]_LearnKit_Explanation_Skills_Addition`](./[ADR]_LearnKit_Explanation_Skills_Addition.md) — v6.2.0 把 glossary/concept 加进 learn-kit；§4 Alt B 否决第 2 个 plugin（本 ADR §2.2 reconcile 其论点：域归属判据，非 plugin 计数）
- [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](./[ADR]_LearnKit_Consolidation_To_Single_Skill.md) — v6.0.0 收敛到 1 plugin / 1 skill（收敛方向语境）
- [`[ADR]_NotebookLM_Kit_Retirement`](./[ADR]_NotebookLM_Kit_Retirement.md) — v4.0.0 2 plugin → 1（收敛史的另一锚点）
- [`[SPEC]_Marketplace_Json_Schema`](../spec/[SPEC]_Marketplace_Json_Schema.md) §4.2 — "Adding a plugin is a minor bump"，新 plugin 示例用 `0.1.0`
- [`[SPEC]_Plugin_Json_Schema`](../spec/[SPEC]_Plugin_Json_Schema.md) — plugin.json 必需字段 + `.mcp.json` optional + 目录布局
- [`[STANDARD]_Commit_Message_Convention`](../rule/[STANDARD]_Commit_Message_Convention.md) §4 — 新增 scope MUST minor bump 本 STANDARD
- [`[STANDARD]_AI_Engineering_Execution_HITL_Prompt`](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) — 11 阶段 flow + HITL 触发

## §8 Decision Log

- 2026-06-05 — v1.0 Accepted。用户 AskUserQuestion 锁定：plugin 名 `diagram-kit` / v1 单 skill `arch-diagram` / validator 泛化（strip PG → shape，保通用语法·命名·legend·配对校验）。外部评审 3 缺口 + 4 收紧点逐条核实文件后 6 采纳 + 1 部分采纳并更正 CI 机制误判（CI 用 HEAD 脚本必过，真卡点是本地 stale hook）。源文档 2026-06-05 更新（新增 architecture-methodology + domain-acquisition 重构）经评估为**强化而非推翻**原计划（references 8→9 / 工作流引用精度 / validator 依据三处增量）。
