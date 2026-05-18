---
type: guide
scope: learn-kit
summary: learn-kit 设计合卷 — 5 skill 分工 + 闭环 + 共享 project_profile + dogfood findings + parallel subsystem 治理模型 + 命名/路径/frontmatter/INDEX/归档规则 + v1.0.0 依赖矩阵与版本演化策略
owner: marketplace-maintainers
created: 2026-05-18
updated: 2026-05-18
state: active
version: v1.0
domain: plugin-internal
tags:
  - design
  - skills
  - governance
  - dogfood
  - subsystem
related:
  - ./[GUIDE]_LearnKit_Pedagogy.md
  - ../../README.md
  - ../../CLAUDE.md
  - ../adr/[ADR]_LearnKit_Discovery_Skills.md
supersedes:
  - ../../../../docs/archive/[DEPRECATED]_learn-kit-04-three-skills_v1.0.md
  - ../../../../docs/archive/[DEPRECATED]_learn-kit-05-governance-boundary_v1.0.md
revision: |
  2026-05-18 — v1.0: 合并自原 learn-kit-04-three-skills.md (615) + learn-kit-05-governance-boundary.md (432)；改名为 [GUIDE]_ 合规命名；放入 docs/guide/ 子目录；加 8 字段 frontmatter；清理所有 cross-project 引用（marketplace 独立性原则）
---

# [GUIDE] learn-kit Design

> 设计合卷。涵盖 5 skill 分工 + 闭环 + 共享设计 + dogfood findings；并行子系统治理模型 + 命名 / 路径 / frontmatter / INDEX / 归档 5 类规则；v1.0.0 依赖矩阵 + 版本演化策略。**适合维护者 / 贡献者**了解 learn-kit 内部架构与治理决策。

---

## §1 5 Skill 的分工与闭环

> **slash 调用约定**：本节及全文所有 5 个 skill 的 slash 调用一律写 `/learn-kit:<skill>` 全限定形式，不裸写 `/<skill>`。理由：(1) `init` 撞 Claude Code 内置 `init`（生成 CLAUDE.md），统一前缀消除二义；(2) 未来防御任意 Claude Code 内置新增同名 skill；(3) `init` 的 `disable-model-invocation: true` 是额外护栏，与本约定独立 —— 用户显式入口的全限定规则适用于全部 5 个 skill。完整规则见 plugin README §"命名约定 · slash 调用必须全限定"。

### §1.1 一张表对照

| Skill | 触发方式 | 干什么 | 何时用 | 写文件吗 | 网络 |
|-------|---------|--------|-------|---------|------|
| **scaffold-learning** | `/learn-kit:scaffold-learning`（user-triggered，`disable-model-invocation: true`）| scaffold `learning/` 骨架 | 项目首次启用 learn-kit | ✅ 一次性 | ❌ |
| **scan** | 自然语言提示（model-invocable）| 枚举项目可学候选 + 标已解读 vs 未解读 | 用户**开放式探索**（没有具体概念）| ❌ 只读 | ❌ |
| **locate** | 自然语言提示（model-invocable）| 反向定位概念 → 文档 | 用户脑中**已有具体概念名** | ❌ 只读 | ❌ |
| **generate-tier** | 自然语言提示（model-invocable）| AI 生成三档（foundation/structural/challenge）学习 markdown + 可选 HTML | 用户**有源材料 + user_question**，想一键产出 | ✅ 多次（每次 3-6 文件）| ❌ 本地 LLM |
| **nlm-studio** | 自然语言提示（model-invocable）| 把三档 markdown 推 NotebookLM 出至多 13 个多媒体 artifact | 用户已有 `learning/<topic>/*.md`，**想要多媒体** | ❌ 零本地落盘 | ✅ NotebookLM API |

5 个 skill 中 4 个 read-only / 不联网（scaffold-learning / scan / locate / generate-tier 的 LLM 调用走 Claude Code 内部），**仅 nlm-studio 联网到 NotebookLM**（依赖 `nlm login` OAuth）。

### §1.2 scaffold-learning — 一次性 scaffold

**触发**：显式 `/learn-kit:scaffold-learning`；`disable-model-invocation: true` 防自动触发。

**Pre-flight**: 检 `learning/` 已存 → skip / merge / abort；检 git repo → warn 若不在。

**创建**:

```text
learning/
├── INDEX.md
├── _meta/
│   └── METHODOLOGY.md
└── _archive/
    └── .gitkeep
```

**完成后提示 6 步引导**: Read METHODOLOGY / Study worked example / Pick a source / Create topic folder / Author markdown 或走 generate-tier / Optional NLM multimedia。

**边界 (Non-goals)**: 不交互式引导 8 阶段（认知框架需用户手动应用）；不 LLM 生成内容（走 generate-tier）；不修改 / 校验已有 learning 内容（交给 markdownlint）。

### §1.3 scan — 开放式枚举

**触发**：用户开放式探索意图（无具体概念名）— "What can I learn in this project?" / "项目里有什么可学的" / "show me uninterpreted standards"。

**不触发**: 「学 DLSRS」（具体概念 → locate）; 「list all files」（→ Glob）; 「write me a learning doc」（→ generate-tier）。

**4 步执行**:
- **Step 0** Project recognition（与 locate 共享，见 §2）
- **Step 1** 枚举源 canonical 候选（每 tag prefix）
- **Step 2** 交叉引用已解读 `[LEARNING]`，标 interpreted / uninterpreted
- **Step 3** PageRank-lite 排序（按引用次数）+ 过滤（unread_only / tag / path）

**输出** 含: Project recognition + Top uninterpreted + Interpreted with refs + Recommended next actions。

### §1.4 locate — 概念反向定位

**触发**：用户提示中**包含具体概念名 / 口诀 / 部分文档名 / 段号引用**。

**不触发**: "How is X implemented"（→ code search）; "Change X to Y"（→ edit）; "学习这个项目"（无具体概念 → scan）; "Write a [LEARNING] doc"（→ generate-tier）。

**5 步执行**:
- **Step 0** Project recognition（始终；与 scan 共享）
- **Step 1** 搜已解读 `[LEARNING]` 文档（preferred tier；3 优先级：INDEX 表 0.95 / frontmatter 0.85 / body grep 0.70）
- **Step 2** 搜源 canonical 文档（secondary tier；filename 0.85 / body grep 0.70）；段号自动提取（§3.3 → section_hint）
- **Step 3** 合并 + 排序（tier > confidence）+ 取 top 3-5
- **Step 4** Fallback：Glob `**/*.md` 排除 node_modules/.git/dist/build/.venv/target，再 grep

**置信度分级**:

```text
≥ 0.95  CLAUDE.md ≥ 2 个 tag prefix AND learning/INDEX.md 存在
≥ 0.85  CLAUDE.md ≥ 2 个 tag prefix，无 learning/
≥ 0.70  无 CLAUDE.md 但 Glob docs/**/*.md 找到 ≥ 3 个 [TAG]_*.md
< 0.70  无法确认 → 仍尝试 best-effort，但 prepend warning
```

### §1.5 generate-tier — AI 三档生成（v0.3.0+）

**触发**：用户**有 user_question + 源材料**，想 AI 一键产出学习文档。例：「为 HITL 主题生成零基础版学习文档」/「generate foundation+challenge tier docs for X」/「我想做一份 X 主题的学习文档 + 交互式 HTML」。

**不触发**: 「学 X」（→ locate）; 「项目里有什么可学的」（→ scan）; 「改一下 foundation 第 3 节」（编辑请求）; 「解释 X 是什么」（一次性回答）。

**10 步交互流程（v1.0.0 起 8 → 10 步）**:

```text
Step 0  Intake             从 prompt 抽 topic + user_question
Step 1  Pre-flight         检 learning/INDEX.md（无则提示先 /init）
Step 2  Source acquisition AskUserQuestion 多选 4 种来源（path / scan-locate / 粘贴 / 整目录）
Step 3  Tier selection     AskUserQuestion 多选 3 档（默认全选）
Step 4  Topic confirmation 单选 / 输入 topic-slug + 冲突策略
Step 5  Per-tier generate  按 tier 分别 AI 生成 markdown
Step 6  INDEX update       自动追加到 learning/INDEX.md §Tier Documents
Step 7  HTML offer         AskUserQuestion 单选「是否生成 HTML?」
Step 8  HTML render        spawn Explore subagent 做 concept→code grounding
                          → 渲染单文件 HTML（SVG 图 + Tab + 暗亮主题 + 复制为 prompt）
Step 9  NLM offer ⭐ v1.0.0 AskUserQuestion 单选「是否推 NotebookLM?」（默认 Skip）
Step 10 Summary            列所有路径 + 推荐阅读顺序 + （若 step 9=Yes）NLM 表格
```

**输出文件结构**:

```text
learning/<topic>/
├── [LEARNING]_<topic>_foundation.md      # 零基础（少术语 + 多类比）
├── [LEARNING]_<topic>_foundation.html    # 配对 HTML（可选；step 7=Yes 才生成）
├── [LEARNING]_<topic>_structural.md      # 结构（概念地图 + 边界）
├── [LEARNING]_<topic>_structural.html
├── [LEARNING]_<topic>_challenge.md       # 挑战（反例 + 迁移题 + 诊断）
└── [LEARNING]_<topic>_challenge.html
```

**关键约定**: HTML 与 markdown 同目录、同 basename；HTML 全离线（无 CDN）；每概念挂真实仓库代码引用；**HTML 不上传 NLM**（dogfood finding #2）。

**6 类源头变量** （prompt 含则跳过对应 AskUserQuestion）: `topic` / `user_question` / `tiers_hint` / `source_paths_hint` / `html_hint` / `nlm_hint`（v1.0.0+）。

### §1.6 nlm-studio — NotebookLM 多媒体（v1.0.0+）

**触发**：用户已有 `learning/<topic>/` 下 ≥ 3 个 `.md`（generate-tier 产出），想出多媒体在线浏览。例：「为 X 出 NLM 多媒体」/「/learn-kit:nlm-studio X」/「学完 X 想要个音频版」。

**不触发**: 「为 X 生成学习文档」（→ generate-tier）; 「出考试题 / quiz」（v4.0.0 永久放弃）; 「跨 notebook 查询」（v4.0.0 永久放弃）; 「删 notebook / 分享」（用 NLM web UI）。

**前置依赖（一次性配置）**:

```bash
uv tool install notebooklm-mcp-cli --with socksio --force
nlm login                                # Google OAuth；token 自动 refresh，但寿命 15-30 min
```

**输出：至多 13 个在线 artifact（不下载二进制）**:

| Artifact | Foundation | Structural | Challenge | 备注 |
|----------|-----------|-----------|-----------|------|
| audio | ✓ | ✓ | ✓ | deep_dive 双主持人对谈，15-20 min |
| video | ✓ | ✓ | ✓ | 8-12 min，4-6 scene + visual cue |
| slide_deck | ✓ | ✓ | ✓ | 15-25 张 |
| infographic | ✓ | ✓ | ✓ | 单 poster，5-8 panel |
| mind_map | — 1 shared / topic（view-agnostic）— | | | NLM 媒介限制（见 §3 finding #5）|

合计：4 view-cycled × 3 + 1 shared mind_map = **13 个 artifact**。

**5 步 workflow（每 Step 都 refresh auth）**:

```text
Step 1  Pre-flight       refresh_auth + server_info（本地检查）
                        → notebook_list（**真 auth gate**，本地检查不充分）
                        → 检 3 必需 .md（HTML 不检）
Step 2  Re-run guard     notebook_list 查 learn-kit:<topic> 是否已存
                        → AskUserQuestion 4 选 1: regenerate / replace sources / new-timestamped / abort
Step 3  Notebook setup   notebook_create（按需）+ 3 source_add 并发上传 .md
                        → **强制 notebook_get 核验真实 source 列表**（source_add 错误响应不可靠）
Step 3.5 Quota gate ⚠️  AskUserQuestion: "13 artifact ≈ 65% NLM Studio 日上限（~20/天）"
                        → confirm / reduce subset / abort
Step 4  Artifact gen    3 parallel batches:
                        - Round 1 (foundation): 5 calls（含 mind_map）
                        - Round 2 (structural): 4 calls（跳过 mind_map）
                        - Round 3 (challenge):  4 calls（跳过 mind_map）
                        每 batch 间 refresh_auth；mid-run auth 失败 retry-once 后 abort；
                        studio_status 幂等查跳过 existing
Step 5  Terminal recap   markdown 表格 + notebook URL；**零本地落盘**
```

**View-Purpose Preservation 原则**: 4 view-cycled 类型的同一 type 三档应**风格上可盲测分类**:

| Tier | audio | video | slide_deck | infographic |
|------|-------|-------|----------|------------|
| foundation | 日常类比开场 + 5 条 TL;DR 收尾 | 5-pack TL;DR on-screen 双模收尾 | 类比 + 5-pack 收 | 每板 ≤7 数字 + 生活化图标 |
| structural | 系统化概念地图 + 自检清单收 | 结构图框架 + 自检清单 | 层级图 + 比较表 + 自检 | 维度对照 + 层级图 |
| challenge | 每段以挑战性提问收 | 反例对比 + 未答问题收 | 70% 反例 + 对比 + 开放问题收 | 看似 X / 实际 Y 对比 |

实现机制：每 view 配 `view-<view>.md` 模板（§1-§5 5 段必备）；SKILL.md 内置 **failsafe** 校验五段完整性，缺则 abort。mind_map 是 NLM 媒介本身的限制例外（finding #5）。

**LANGUAGE & TERMINOLOGY 原则** （`templates/language-directive.md` 单文件源，13 cell 共享）:

- 主体内容用简体中文（标题 / 旁白 / slide 正文 / mind_map 节点 / infographic panel）
- 行业标准技术术语**保留英文原词**（`frontmatter` / `schema` / `ADR` / `SKILL.md` / `track` / `canonical` / `deprecated` / `YAML` / `MCP server` 等）
- 代码 / 路径 / 标识符 **verbatim**（`/learn-kit:nlm-studio` / `notebook_id` / `mcp__plugin_learn-kit_notebooklm-mcp__*`）

### §1.7 五者如何拼成完整闭环

```text
                            ┌──────────────────────────┐
                            │  项目首次启用 learn-kit    │
                            └────────────┬─────────────┘
                                         ▼
                            ┌──────────────────────────┐
                            │  /learn-kit:scaffold-    │ ← Skill 1（scaffold）
                            │  learning                │
                            └────────────┬─────────────┘
                                         ▼
                       ┌────────────────────────────────┐
                       │  用户有具体目标吗？             │
                       └─────────┬────────────┬─────────┘
                                 │ 有         │ 没有
                                 ▼            ▼
                      ┌────────────────┐  ┌────────────────┐
                      │ /learn-kit:    │  │ /learn-kit:    │
                      │ locate <name>  │  │ scan           │← Skill 2/3 (read-only)
                      └───────┬────────┘  └───────┬────────┘
                              ▼                   ▼
                  ┌───────────────────────────────────────┐
                  │  Top1 是已解读？                       │
                  └───┬───────────────────────────────┬───┘
                      │ 是                             │ 否（uninterpreted canonical）
                      ▼                               ▼
              ┌──────────────┐            ┌─────────────────────────┐
              │ Read 已解读  │            │ /learn-kit:generate-tier │← Skill 4 (AI gen)
              │ 文档结束     │            │ AI 生成三档 + 可选 HTML  │
              └──────────────┘            └────────────┬────────────┘
                                                       ▼
                                          ┌─────────────────────────┐
                                          │ Step 9 想要 NLM 多媒体？ │
                                          └────────┬────────────┬───┘
                                                   │ 是          │ 否
                                                   ▼             ▼
                                       ┌─────────────────┐   结束
                                       │ /learn-kit:     │← Skill 5 (NLM)
                                       │ nlm-studio      │
                                       │ 13 在线 artifact │
                                       └─────────────────┘
```

**简版口诀**：**scan 看大图 → locate 锁目标 → 已解读读 / 未解读 generate-tier 写 → 想要多媒体上 nlm-studio**。

### §1.8 设计取舍亮点

| 亮点 | 详情 |
|------|------|
| **Stateless 设计（全部 5 skill）** | 无 cache / manifest / 持久索引（除 generate-tier 创建的 `learning/` 文件本身）；每次 re-scan / re-generate / re-push；nlm-studio 通过 NLM 端 `studio_status` 查既存 artifact 做幂等，**不**用本地状态文件 |
| **`allowed-tools` 严格限制** | init: `Write` 仅 scaffold 必需 / scan + locate: `[Read, Glob, Grep]` 只读 / generate-tier: `[Read, Write, Glob, Grep, AskUserQuestion, Agent]`（Agent 用于 HTML grounding）/ nlm-studio: `[Read, Glob, AskUserQuestion]` + 9 个 `mcp__plugin_learn-kit_notebooklm-mcp__*`（**不能 Write 本地**，强化零本地落盘契约）|
| **触发例子写在 description 里** | 5 skill description 都含 "Do invoke" 例子（中英双语）+ "Do not invoke" 反例 + concrete contrast pairs + sibling skills 提示；nlm-studio 含 5 段是全 marketplace 最长 description—— 刻意「pushy」防 undertriggering |
| **模板化提示词架构（v1.0.0 起）** | nlm-studio 的 13 artifact 用可组合模板: `view-prefix（3 中选 1）+ artifact-suffix（5 中选 1）+ interaction-override（4/12 cell 有）+ language-directive（13 cell 共享）+ source-topic`。DRY: 8 模板 + 1 override YAML + 1 language directive = 10 文件搞定 13 artifact |
| **Dogfood-driven design** | nlm-studio v1.0.0 release 前完整 dogfood 一次，5 findings 全部反应到设计（见 §3）；比起前 4 skill「先发布再观察」的演化路径，nlm-studio 是 release 前做完 dogfood 才 ship 的 |

---

## §2 共享的 project_profile recognition

locate 和 scan **共享 Step 0**——刻意保持一致，避免两个 skill 对项目识别不一致：

| 共享要素 | 设计目的 |
|---------|---------|
| CLAUDE.md tag 扫描 | 零配置项目识别 |
| 半开区间置信度（0.95 / 0.85 / 0.70）| 边界明确，0.95 不歧义 |
| `has_learning` / `has_docs_index` 检测 | 决定走哪个 tier |
| `learning_topics` 提取 | 支持 topic hint 过滤 |

**唯一差异**：scan 对低置信度更宽容（< 0.7 仍枚举 `*.md`，加 warning）——理由是枚举可优雅降级，反向查询需要明确赢家。

**generate-tier 和 nlm-studio 不共享此 recognition**:

- generate-tier 假设用户已知 topic + source，不做反向识别（信息从 AskUserQuestion 显式来）
- nlm-studio 假设 `learning/<topic>/` 已建好（generate-tier 已产出 3 .md），直接按 topic-slug 走

Discovery（locate / scan）和 authoring（generate-tier / nlm-studio）在职责上分离——前者识别**项目**，后者已知**主题** + **内容**。

---

## §3 Dogfood findings（v1.0.0 release 前已应用 nlm-studio）

| # | Finding | 设计响应 |
|---|---|---|
| 1 | `refresh_auth` + `server_info` 仅本地检查（token 是否还被 Google 接受不知）| Step 1.4 用 `notebook_list` 作真 auth gate |
| 2 | NLM 在 file-mode 与 text-mode 都拒收 .html 源 | **HTML 整体不上传**；L2 fallback 代码删除；只传 3 个 .md |
| 3 | NLM token 寿命 ~15-30 min，长跑会用尽 | 每 Step 起始 `refresh_auth`；mid-run 失败 retry-once 后 abort |
| 4 | `source_add` 错误响应不可靠（server 可能 async 成功）| 3 source_add 后**强制 `notebook_get` 核验** |
| 5 | NLM `mind_map` artifact 对 view 差异化指令无视 | mind_map 收敛为 **1 shared / topic**（不三档循环）|

**Dogfood 哲学**: nlm-studio 是 v1.0.0 release 前做完 dogfood 才 ship 的。比起前 4 skill「先发布再观察」的演化路径，先做 dogfood 让 release 时设计已经反映了真实约束。

---

## §4 Parallel Subsystem 治理模型

### §4.1 核心模型

**learn-kit 的 `learning/` 是项目主治理框架的并行子系统**——这是 learn-kit 最重要的治理决策。

```text
                  ┌──────────────────────────────┐
                  │  项目主治理框架               │
                  │  (root CLAUDE.md / docs/...)  │
                  └──────┬───────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  markdown 语法 OB1-OB6 │   ← 共享底层
              │  (heading / list /     │
              │   table / wikilink)    │
              └──────┬───────────────┘
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
   docs/         learning/    项目其他子系统
   主索引        子索引       (tests/ adr/ ...)
   tag 集合      命名 schema
                 frontmatter
                 INDEX 同步
```

**共享底层** + **自管上层** = 既不与主框架冲突，又能独立演化。

> v1.0.0 起 learn-kit 自身**不再是 "Independent plugin"**——它通过 `nlm-studio` skill 引入 `notebooklm-mcp` MCP server 依赖。但**子系统 `learning/` 仍是并行子系统**这一治理立场不变；产物（`.md` / `.html`）仍是纯文本，不锁定。差异在 §6 详述。

### §4.2 共享层：markdown 语法 OB1-OB6

learn-kit `learning/` 下的所有文档都遵守项目通用的 markdown 语法规则:

| 规则 | 内容 |
|------|------|
| OB1 | wikilink 语法（`[[link]]`）|
| OB2 | heading 格式（无 trailing punctuation）|
| OB3 | list marker 一致性 |
| OB4 | code block language tag |
| OB5 | callout 类型限制 |
| OB6 | table pipe escaping |

learn-kit 不重复发明 markdown 规则，依赖项目自带的 `markdownlint` / `prettier` / 自定义 validator 扫 `learning/**/*.md`。

---

## §5 自管层：命名 / 路径 / Frontmatter / INDEX / 归档规则

### §5.1 命名约定

**手工流**:

```text
[LEARNING]_<Source>_<Aspect>.md
```

| 部分 | 规则 |
|------|------|
| `[LEARNING]_` 前缀 | **固定**，与其他 doc tag（`[STANDARD]_` / `[GUIDE]_`）正交 |
| `<Source>` | 源材料简短描述（`RFC_2119` / `OWASP_Top10` / `Security_Policy`）|
| `<Aspect>` | 可选，指明解读哪一面；单一文档可省略 |

**AI 流（v0.3.0+ generate-tier 产出）**:

```text
[LEARNING]_<topic>_<view>.{md,html}
```

| 部分 | 规则 |
|------|------|
| `[LEARNING]_` 前缀 | 与手工流共用 |
| `<topic>` | topic-slug（kebab-case），与目录一级名一致 |
| `<view>` | `foundation` / `structural` / `challenge` 三档之一 |
| `.md` / `.html` | markdown + 可选配对 HTML（同 basename）|

**两种命名共存**：手工流交付**单一 framework 文档**（用 `<Aspect>` 描述切面），AI 流交付**三档分层教学**（用 `<view>` 标 tier）。同 topic 可同时存两种产物。

### §5.2 路径约定（按 topic 分组）

```text
learning/
├── INDEX.md                     # 子系统总入口（独立 INDEX）
├── _meta/                       # 子系统基础设施
│   └── METHODOLOGY.md
├── <topic>/                     # 每 topic 一目录
│   ├── [LEARNING]_<Source>_<Aspect>.md      # 手工流产物（可选）
│   ├── [LEARNING]_<topic>_foundation.md     # AI 流产物（可选）
│   ├── [LEARNING]_<topic>_foundation.html
│   ├── [LEARNING]_<topic>_structural.md
│   ├── [LEARNING]_<topic>_structural.html
│   ├── [LEARNING]_<topic>_challenge.md
│   └── [LEARNING]_<topic>_challenge.html
└── _archive/                    # 软归档区
    └── <topic>/[LEARNING]_*.md
```

**topic 选取原则**:

| 场景 | topic 选取 |
|------|-----------|
| 单 STANDARD / POLICY 解读 | 以源材料缩写为 topic |
| 跨多源解读 | 以主题域为 topic |
| 多 RFC 解读聚类 | `rfc/` 总目录 |
| 不确定 | 先建较粗的 topic，后续按需细分 |

### §5.3 Frontmatter Schema

**手工流 schema**（9 字段，由人按方法论填写）:

```yaml
---
type: "learning"                                       # 固定值
topic: "<topic>"                                       # 与路径一级目录一致；_meta 表示基础设施
summary: "<1-2 行说明本文学习目的>"
source: "<source ref, e.g., 'RFC 2119' or '[[STANDARD]_X#§Y]]'>"
methodology: "[[../_meta/METHODOLOGY|本方法论]]"        # 引用方法论
tags: [learning, <topic>, ...]                         # 自由标签
aliases: [..., ...]                                    # 别名
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
state: "draft | active | archived"                     # 三态枚举
version: "vX.Y"                                        # 必需——学习材料随源演化
---
```

**AI 流 schema**（7 字段，由 generate-tier 自动写）:

```yaml
---
type: learning-tier                                    # 与手工流区分
topic: <topic>
view: <foundation | structural | challenge>            # AI 流专有
source_question: <user_question 原文>
source_docs:
  - <path1>
  - <path2>
generated_at: <ISO8601 UTC>
generator: learn-kit/generate-tier v1.2.0              # 审计 trail
---
```

**两种 schema 区分**:

| 字段 | 手工流 | AI 流 |
|------|--------|-------|
| `type` | `learning` | `learning-tier` |
| `summary` / `source` / `methodology` / `aliases` | ✓ 必备 | — |
| `view` | — | ✓ 必备（三档之一）|
| `source_question` / `source_docs` / `generated_at` / `generator` | — | ✓ 必备（审计 trail）|
| `created` / `updated` / `state` / `version` | ✓ | — |

scan / locate skill 通过 `type` 字段区分两类产物：`learning` → 手工流；`learning-tier` → AI 流。

### §5.4 INDEX 同步策略

**独立 `learning/INDEX.md`**——**与项目主索引解耦**:

| 选项 | 选择 | 理由 |
|------|------|------|
| A. 与主 INDEX 合并 | ❌ | 污染面向 AI / 检索的 canonical 索引 |
| B. 完全不维护 INDEX | ❌ | locate 无法做 INDEX 命中（confidence 0.95 失效）|
| **C. 独立 learning/INDEX.md** | ✅ | 子系统自管 + 主索引可外链一行 |

**主索引可加一行外链**: `- [Learning Subsystem](./learning/INDEX.md)`，不展开内部条目。

**`learning/INDEX.md` 内部结构**（v0.3.0+ 起增加 §Tier Documents 段）:

```markdown
## Topics (手工流)
| Topic | Document | Source | Updated |

## Tier Documents (AI 流，由 generate-tier 自动追加 / 更新)
| Topic | View | Markdown | HTML | Last Generated |
```

**强制规则**：新建 / 重命名 / 归档 learning 文档时**必须同步** `learning/INDEX.md`。AI 流的 generate-tier 自动写 §Tier Documents 行；手工流的 §Topics 段由作者手动维护。

### §5.5 链接规则

| 链接方向 | 建议格式 |
|---------|---------|
| learning → 项目 canonical docs | 项目自定（wikilink 或 markdown link）|
| learning → learning（同 topic）| 相对 markdown link 或 wikilink |
| learning → `_meta`（方法论）| 相对 link |
| 项目 canonical docs → learning | **不强求**（避免 canonical 被 learning 污染）|
| AI 流 HTML 中 → 仓库代码 | 相对路径 + line range（Explore subagent 做 grounding 时自动生成）|

**禁止**：绝对路径；不可控的外部 URL（除真正的外部参考资源）。

### §5.6 删除 / 归档策略（4 选项 + 推荐）

源材料演化后，对应学习文档怎么处理？

| 选项 | 描述 | 优势 | 劣势 |
|------|------|------|------|
| A. **永久保留** | 旧解读永远在主目录，加 `state: archived` | 完整教学历史 | INDEX 杂乱 |
| B. **硬覆盖** | 源演化立即重写，旧版不留 | 主目录始终最新 | 丢失教学历史 |
| **C. 软归档**（**推荐**）| 主目录始终「当前最新」；旧版移 `learning/_archive/` | 主目录干净 + 历史可追 | 需维护 `_archive/` 索引段 |
| D. **版本并存** | 同 topic 多版本同存 | 不删任何东西 | 读者困惑 + 维护成本高 |

**推荐 C 软归档的标准操作**:

1. 旧解读移 `learning/_archive/<topic>/`，保持原文件名
2. frontmatter 加: `state: archived` + `replaced-by: "<link to current>"`
3. 主目录 INDEX **不展开** `_archive/`；archive 区单独维护索引段

> **AI 流的 generate-tier 不支持归档**：它只提供 Overwrite / `.v2` 后缀 / Skip / Abort 四种冲突策略；要归档必须用户手动执行软归档流程。

### §5.7 子系统元规则速查

```text
┌─────────────────────────────────────────────────────────────┐
│  learning/ 子系统元规则（METHODOLOGY.md §9）                │
├─────────────────────────────────────────────────────────────┤
│  9.1 何时建      │ 不预设触发，用户手动判断                │
│  9.2 命名        │ 手工流: [LEARNING]_<Source>_<Aspect>.md  │
│                  │ AI 流:  [LEARNING]_<topic>_<view>.{md,html}│
│  9.3 路径        │ learning/<topic>/                       │
│  9.4 frontmatter │ 手工流 9 字段 / AI 流 7 字段（type 区分） │
│  9.5 INDEX       │ 独立 learning/INDEX.md，强制同步         │
│                  │ §Topics（手工流）+ §Tier Documents（AI 流）│
│  9.6 链接        │ 相对 link，禁绝对路径                   │
│  9.7 归档        │ C 软归档推荐（_archive/<topic>/）        │
└─────────────────────────────────────────────────────────────┘
```

---

## §6 v1.0.0 依赖矩阵 + 版本演化策略

### §6.1 不做哪些 + 这样划分的好处（轻量原则）

**learn-kit 保持轻量**——5 skill 各自单一职责，不引入额外编排：

| 不做 | 原因 |
|------|------|
| ❌ 交互式 8 阶段引导 skill | 8 阶段是认知框架，需用户**手动**应用建立 mental model |
| ❌ 自带 markdown validator | 用项目通用 markdownlint / prettier |
| ❌ 集中索引服务 | 索引在 `learning/INDEX.md`，locate / scan 即时扫描 |
| ❌ 持久 cache | stateless = robust + 零维护 |
| ❌ NLM artifact 二进制下载 | v1.0.0 nlm-studio 设计为**在线浏览**；下载会增加维护负担 + 不是核心场景 |
| ❌ 出 quiz / flashcards / data_table | v4.0.0 永久放弃（外部工具替代）|
| ❌ 跨 notebook query / Deep Research | v4.0.0 永久放弃（NLM web UI 替代）|
| ❌ Append-keep-old NLM source 模式 | NLM 不去重 source；append 会让 12 个 mixed-vintage source 共存，混淆 LLM |

**好处**:

1. **学习者主导**：方法论是认知工具，过度自动化会让人略过思考
2. **5 skill 边界清晰**：init / scan / locate / generate-tier / nlm-studio 各自单一职责，互不抢任务
3. **零本地状态**：除 generate-tier 写 `learning/` 文件 + init scaffold 外，其他 skill stateless
4. **无锁定**：用户随时弃用 learn-kit 不留技术债（只是一堆 `.md` 文件 + 一些 NLM notebook）
5. **正交于主框架**：不干涉项目主治理决策

### §6.2 v1.0.0 起的依赖矩阵

| Skill | 外部依赖 | 联网 |
|-------|---------|------|
| init | ❌ 无 | ❌ |
| scan | ❌ 无 | ❌ |
| locate | ❌ 无 | ❌ |
| generate-tier | Claude Code LLM 调用（内置）| ❌ 本地 |
| **nlm-studio** | **notebooklm-mcp MCP server**（一次性 `uv tool install`）+ **`nlm login` OAuth**（一次性，token 短寿 15-30 min 内自动 refresh）| ✅ NotebookLM API |

前 4 个 skill **零外部依赖**；仅 nlm-studio 联网。

**v0.x → v1.0.0 关键变化**:

| 维度 | v0.2.x（双插件协作）| v0.3.0（解绑过渡）| v1.0.0（单插件内化）|
|------|-------------------|------------------|-------------------|
| NLM 多媒体场景 | 委托外部 NLM 插件 | **不主动 promote** | **内化为 `/learn-kit:nlm-studio`** |
| `_nlm/` 元信息目录 | 推荐建（NLM_RECORD_TEMPLATE schema）| 模板删除 | **零本地落盘**（终端打印 URL）|
| Independent plugin 宣称 | ✓ 显式声明 | ✓ 显式声明 | ❌ **撤销**——nlm-studio 引入 notebooklm-mcp MCP 依赖 |
| Marketplace 插件数 | learn-kit + 外部 NLM 插件 | 同上 | **仅 learn-kit**（外部 NLM 插件整退役）|

完整决策记录见 `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md`。

### §6.3 与 markdownlint / 其他 validator

learn-kit 不带验证 skill——建议项目自带 `markdownlint-cli` / `prettier` / 项目自定 validator 扫 `learning/**/*.md` 检查 OB1-OB6 类基础语法。

### §6.4 跨项目消费模式（learn-kit 作为通用插件）

learn-kit 是**通用插件**，可在任意项目安装。下游消费项目只需：

1. `/plugin install learn-kit@mj-agentlab-marketplace`
2. 在项目根 CLAUDE.md 声明 `[STANDARD]_/[SPEC]_/...` tag prefix（提高 scan / locate 识别 confidence）
3. 跑 `/learn-kit:scaffold-learning` scaffold `learning/` 子系统骨架

不强制下游做任何 marketplace-side 治理同步——learn-kit 的产物 `learning/` 完全由下游项目自管。Marketplace 本身不引用任何下游项目（marketplace 独立性原则）。

### §6.5 版本演化策略（vX.Y 语义版本）

learn-kit 自身的版本约定：

| 版本变化 | 触发 |
|---------|------|
| **vX.0 Major** | (a) sub-framework 整体成熟度跨阶段；§9 元规则结构化扩展；(b) **新增 / 删除外部依赖**（如 v1.0.0 引入 NLM 依赖、退役 notebooklm-kit）|
| **vX.Y Minor** | 加新 case 后某章节小幅扩展；加新 skill（如 v0.2 加 scan/locate；v0.3 加 generate-tier）；不破坏既有 frontmatter schema |
| **vX.Y.Z Patch** | 措辞 / 例子 / typo 修正 / 单字段补 |

**Tier 升级条件**:

| 升级方向 | 触发条件 |
|---------|---------|
| GUIDE-tier → STANDARD-tier | ≥ 5 case 跨域验证（覆盖 ≥ 4 个独立行业 / 比喻世界）+ 几何不变量证实 |
| STANDARD-tier 内部 minor | 新加 ≥ 1 case 暴露的边界 |
| STANDARD-tier 重构 | 几何不变量被否 → 重新验证基础假设 |

**版本里程碑**:

| 版本 | 关键事件 |
|------|---------|
| v0.1（2026-05-11）| 含 init + METHODOLOGY |
| v0.2（2026-05-11）| 加 scan + locate；METHODOLOGY 加 §1.5 Project Discovery |
| v0.3（2026-05-13）| 加 generate-tier；与外部 NLM 插件主动解绑 |
| v0.3.1 | plugin.json repository field schema fix（patch）|
| **v1.0**（2026-05-14）| 加 nlm-studio NLM 多媒体；吸收外部 NLM 插件核心场景；marketplace 收敛 1 plugin；首个 stable release；撤销 "Independent plugin" 宣称（**触发 major 的标志**：新增外部依赖）|
| v1.1（2026-05-15）| plugin-internal docs 框架（6 教学系列）|
| **v1.2**（2026-05-18）| plugin-internal docs 重组（6 教学系列 → 2 份 [GUIDE]）|

### §6.6 通用化的设计取舍

learn-kit 是 marketplace 通用插件，与上游设计相比的取舍：

| 维度 | 通用化前（上游手工流方法论）| 通用化后 learn-kit v1.x |
|------|----------------------|----------------------|
| 覆盖 case | 多个内部 case 验证 | RFC 2119 单 worked example + 用户自跑案例 |
| 引用 | 含上游特有路径 / 文档 | 完全 de-coupled 通用化 |
| 方法论核心 | 8 阶段 + N=5 几何不变量 | **保留不变** |
| 子系统元规则 | 9 节 | **保留**（v1.0.0 扩 §9.4 frontmatter 增加 AI 流 schema 描述）|
| 6 类失真自检 | 6 类 | **保留不变** |
| 产出模式 | 单一手工流 | **扩展为 3 种**：手工流 + AI 流（generate-tier）+ 多媒体流（nlm-studio）|
| 外部依赖 | 无声明 | nlm-studio 依赖 notebooklm-mcp + nlm login |

**关键设计选择**：通用化保留方法论 + N=5 验证 + 6 类失真自检；具体内部案例**不**移植——通用版本只保留 RFC 2119 单一 worked example，用户自己跑案例验证。

### §6.7 治理判断速查表

| 问题 | 答案 |
|------|------|
| `learning/INDEX.md` 应该并入主 `docs/INDEX.md` 吗？ | ❌ 不要——会污染 canonical 索引 |
| `[LEARNING]_*.md` 应该归 `docs/` 还是 `learning/`？ | `learning/` —— 不混入 canonical |
| 项目主 INDEX 要不要展开 `learning/` 内部条目？ | ❌ 不要——只放一行外链 |
| canonical docs 要不要回链 learning？ | 不强求，避免反向污染 |
| 旧解读源演化后怎么办？ | C 软归档（`_archive/<topic>/` + `state: archived` + `replaced-by`）|
| 改方法论自身（METHODOLOGY.md）算什么变更？ | 看影响：触发 vX.0 / vX.Y / vX.Y.Z |
| markdown 语法错怎么办？ | 用项目通用 markdownlint，learn-kit 不重复发明 |
| 想加自动 8 阶段引导 skill？ | 刻意不做——破坏认知框架的手动应用价值 |
| 同 topic 有手工流 framework + AI 流三档，怎么共存？ | 共存于 `learning/<topic>/`，frontmatter `type` 字段区分 |
| AI 流的 generate-tier 写错了，怎么回滚？ | 当前不支持自动归档；用户走 §5.6 软归档流程手动操作；或重跑 generate-tier 选 `.v2` 后缀 |
| nlm-studio 产生的 NLM 上 13 个 artifact 算 `learning/` 的一部分吗？ | **不算**。它们在 `notebooklm.google.com`，不在本地仓库；nlm-studio 零本地落盘 |
| v1.0.0 起 learn-kit 不再是 Independent plugin，治理影响是？ | (a) plugin.json description 改写；(b) 用户必须 `nlm login` 才能用 nlm-studio；(c) 前 4 个 skill 仍零外部依赖。`learning/` 子系统的并行子系统立场**不变** |
| 项目无 CLAUDE.md tag 约定时，locate / scan 还能用吗？ | 能用，走低置信度 fallback；改善方式：(a) 在 CLAUDE.md 声明 ≥ 2 个 tag prefix；(b) 跑 `/learn-kit:scaffold-learning` 建 learning/INDEX.md |

---

## §7 关键源文件指针

| 想知道什么 | 读哪里 |
|----------|--------|
| scaffold-learning skill 定义 | `plugins/learn-kit/skills/scaffold-learning/SKILL.md` |
| scan skill 定义 | `plugins/learn-kit/skills/scan/SKILL.md` |
| locate skill 定义 | `plugins/learn-kit/skills/locate/SKILL.md` |
| generate-tier skill 定义 | `plugins/learn-kit/skills/generate-tier/SKILL.md`（10 step workflow）|
| generate-tier 4 prompt templates | `plugins/learn-kit/skills/generate-tier/templates/{foundation,structural,challenge,html-renderer}.md` |
| nlm-studio skill 定义 | `plugins/learn-kit/skills/nlm-studio/SKILL.md`（5 step workflow + composition contract）|
| nlm-studio 10 模板 | `plugins/learn-kit/skills/nlm-studio/templates/{view-foundation,view-structural,view-challenge,artifact-audio,artifact-video,artifact-slide_deck,artifact-mind_map,artifact-infographic,interaction-overrides,language-directive}.md` |
| Discovery 设计决策 | `docs/adr/[ADR]_LearnKit_Discovery_Skills.md` |
| v4.0.0 NLM 收编决策 | `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md` |
| 方法论全文 | `plugins/learn-kit/skills/scaffold-learning/templates/METHODOLOGY.md` §9 子系统元规则 |
| 教学合卷（定位 + 方法论 + worked example + 质量门） | `./[GUIDE]_LearnKit_Pedagogy.md` |
