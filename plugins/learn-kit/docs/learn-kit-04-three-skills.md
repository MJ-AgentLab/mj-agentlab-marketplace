# learn-kit 04 · 5 个 Skill 的分工

> 学习目标：理解 learn-kit 的 5 个 skill（init / scan / locate / generate-tier / nlm-studio）各自做什么、什么时候用哪个、它们如何拼成"scaffold → 发现 → 锁定 → 撰写 → 多媒体"的完整闭环。
>
> **版本说明**：本文反映 learn-kit v1.1.0 / marketplace v4.4.8（2026-05-15）状态。早期版本只有 3 个 skill（init / locate / scan），v0.3.0 加 generate-tier，v1.0.0 加 nlm-studio 并退役 notebooklm-kit。v1.1.0 起补 plugin-internal 文档框架（不改 skill surface）。

---

## 0 一张表对照

| Skill | 触发方式 | 干什么 | 何时用 | 写文件吗 | 网络 |
|-------|---------|--------|-------|---------|------|
| **init** | `/learn-kit:init`（user-triggered，`disable-model-invocation: true`） | scaffold `learning/` 骨架 | 项目首次启用 learn-kit | ✅ 一次性 | ❌ |
| **scan** | 自然语言提示（model-invocable） | 枚举项目可学候选 + 标已解读 vs 未解读 | 用户**开放式探索**（没有具体概念）| ❌ 只读 | ❌ |
| **locate** | 自然语言提示（model-invocable） | 反向定位概念 → 文档 | 用户脑中**已有具体概念名** | ❌ 只读 | ❌ |
| **generate-tier** | 自然语言提示（model-invocable） | AI 生成三档（foundation/structural/challenge）学习 markdown + 可选 HTML | 用户**有源材料 + user_question**，想一键产出 | ✅ 多次（每次 3-6 文件）| ❌ 本地 LLM |
| **nlm-studio** | 自然语言提示（model-invocable） | 把三档 markdown 推 NotebookLM 出至多 13 个多媒体 artifact | 用户已有 `learning/<topic>/*.md`，**想要 audio / video / slide / mind_map / infographic** | ❌ 零本地落盘 | ✅ NotebookLM API |

5 个 skill 中 4 个 read-only / 不联网（init / scan / locate / generate-tier 的 LLM 调用走 Claude Code 内部），**仅 nlm-studio 联网到 NotebookLM**（依赖 `nlm login` OAuth）。

---

## 1 Skill 1 · init（一次性 scaffold）

### 1.1 触发条件

- 显式调用：用户在项目根敲 `/learn-kit:init`
- frontmatter `disable-model-invocation: true` → 模型**不会**自动触发，必须用户主动调用

### 1.2 干什么

在 `<project-root>/learning/` 创建：

```text
learning/
├── INDEX.md                          # 子系统总入口
├── _meta/
│   └── METHODOLOGY.md                # 完整 8 阶段方法论（602 行）
└── _archive/
    └── .gitkeep                      # 软归档区占位
```

> v0.2.x 时代还创建过 `_meta/NLM_RECORD_TEMPLATE.md`；v0.3.0 起删除（learn-kit 主动与 notebooklm-kit 解绑），v1.0.0 不再有此文件。若你升级到 v1.0.0 后发现 vault 里残留该模板，可手动删。

### 1.3 Pre-flight 检查

1. 检测 `<project-root>/learning/` 是否已存在
   - 已存在 → **不覆盖**，询问用户：skip / merge missing only / abort
2. 检测是否在 git repo
   - 不在 → warn（scaffold 不会被追踪）

### 1.4 完成后的"next steps"提示

init 不只是创建文件，还会打印 6 步引导：

1. **Read** `learning/_meta/METHODOLOGY.md` 理解 8 阶段方法论
2. **Study** `<plugin-root>/skills/init/references/rfc-2119-keywords-pedagogy.md`（worked example）
3. **Pick a source** —— 第一个要解读的枚举型规则清单
4. **Create a topic folder**：`mkdir learning/<topic-slug>/`
5. **Author** `learning/<topic-slug>/[LEARNING]_<Source>_<Aspect>.md` 按 8 阶段；或直接走 AI 流 `/learn-kit:generate-tier`
6. **Optional NLM multimedia**：跑 `/learn-kit:nlm-studio <topic>` 把 markdown 推 NotebookLM 出多媒体（v1.0.0 起内置；不再需要装额外插件）

### 1.5 边界（明确声明不做什么）

| Non-goal | 原因 |
|----------|------|
| 不交互式引导 8 阶段 | 方法论是认知框架，需用户读 + 手动应用（或直接走 generate-tier 的 AI 流） |
| 不 LLM 生成内容 | LLM 生成走 `/learn-kit:generate-tier`；NLM 多媒体走 `/learn-kit:nlm-studio` |
| 不修改 / 校验已有 learning 内容 | 校验交给 markdownlint |

---

## 2 Skill 2 · scan（开放式枚举）

### 2.1 触发条件

用户表达**开放式探索意图**，没有具体概念名：

- "What can I learn in this project?"
- "项目里有什么可学的"
- "推荐学习路径"
- "Where do I start learning this project?"
- "show me uninterpreted standards"

### 2.2 不触发

- "学 DLSRS" → 具体概念 → 用 **locate**
- "list all files in docs/" → 用 `ls` / `Glob`
- "write me a learning doc for X" → 写作任务 → 用 **generate-tier**

### 2.3 执行流程（4 步）

**Step 0 · Project recognition**（与 locate 共享同一逻辑——见 §6）

**Step 1 · 枚举源 canonical 候选**

对每个 tag prefix `T`：
- Glob `docs/**/[T]_*.md`（skip `[LEARNING]`，那是解读层）
- 每个候选抓 first H1 或 frontmatter `summary`（read 前 30 行）

**Step 2 · 交叉引用已解读 [LEARNING]**

如 `has_learning`：

1. Glob `learning/**/[LEARNING]_*.md`
2. 对每篇读 frontmatter 的 `source` 字段，支持 4 种形态：
   - scalar path string
   - wikilink with `|alias` suffix
   - markdown link
   - list（一篇解读可对应多个源）
3. 构建 `<canonical-path> → [<interpreted-path>, ...]` map
4. 每个 Step 1 候选标记 **interpreted** 或 **uninterpreted**

**Step 3 · 排序、过滤、展示**

**PageRank-lite 排序**：

```text
Search pattern = 文件完整 basename（含 .md 后缀）
                 e.g. [STANDARD]_HITL.md
Literal-string mode = 是  ([ ] 当字面括号，不当 regex)
Output mode = files_with_matches  (distinct 文件列表)
Self-exclusion = 减去候选自身路径
```

按引用计数降序排——被引次数多 = 项目"承重墙"。

**过滤**：
- `unread_only=true` → 隐藏 interpreted
- `tag=<X>` → 按 tag 过滤
- `path=<subdir>` → 按子目录过滤

### 2.4 输出格式

```markdown
## Scan: <project root>

### Project recognition
- has_learning, tag_set, confidence, totals ...

### Top uninterpreted canonical docs (suggested next interpretations)
| Path | Tag | Cited | First-line summary |
|------|-----|-------|--------------------|
| docs/.../[STANDARD]_X.md | [STANDARD] | 43 | <summary> |

### Interpreted canonical docs (already have [LEARNING] material)
| Canonical | Interpretation(s) | Cited |

### Recommended next actions
- Top reading priority: ...
- Next interpretation to author: ...
- For named concept: use /learn-kit:locate
- To author a new interpretation: use /learn-kit:generate-tier
```

---

## 3 Skill 3 · locate（概念反向定位）

### 3.1 触发条件

用户提示中**包含具体的概念名 / 口诀 / 部分文档名 / 段号引用**。例子：

| 中文 | 英文 |
|------|------|
| "学 DLSRS" | "I want to learn DLSRS" |
| "解释一下 ADR-006" | "What is ISFSV" |
| "讲讲 §3.3 of the HITL prompt" | "Where is RelativePath documented" |
| "找一下关于服务架构的文档" | "Show me the source for `<concept>`" |

### 3.2 不触发（容易混淆的反例）

| 用户提示 | 为什么不触发 locate |
|---------|-------------------|
| "How is RelativePath implemented" | 代码问题 → 用 code search |
| "Change X to Y" | 编辑请求 → 不是学习意图 |
| "学习这个项目" | 无具体概念 → 应路由到 **scan** |
| "Write a [LEARNING] doc for X" | 写作任务 → 用 **generate-tier**（AI 流）或按方法论手写 |

### 3.3 执行流程（5 步）

**Step 0 · Project recognition**（始终执行；与 scan 共享，见 §6）

构建 `project_profile`：
- Read `<project-root>/CLAUDE.md` → grep tag 前缀（`[STANDARD]_` / `[SPEC]_` / `[ADR]_` 等）
- Glob `learning/INDEX.md` 检测 `has_learning`
- Glob `docs/INDEX.md` 检测 `has_docs_index`
- 计算 confidence（4 档半开区间）

**Step 1 · 搜已解读 [LEARNING] 文档**（preferred tier，仅当 `has_learning`）

| 优先级 | confidence | 搜哪 |
|--------|-----------|------|
| 1 | 0.95 | `learning/INDEX.md` 表格命中 |
| 2 | 0.85 | `learning/**/[LEARNING]_*.md` 的 frontmatter（`summary` / `aliases` / `tags`）|
| 3 | 0.70 | `learning/**/[LEARNING]_*.md` 文件 body grep |

**Step 2 · 搜源 canonical 文档**（secondary tier）

按 `tag_set` 中每个 tag prefix `T`：
- 文件名命中 0.85
- body grep 0.70

**段号自动提取**（query 含 `§3.3` / `section 3.3` / `第 3 节` 等）→ 输出 `section_hint`，**不**附加到 path（markdown anchor 不可点）

**Step 3 · 合并、排序、展示**：
- 主键：tier（interpreted > canonical）
- 次键：confidence 降序
- 取 top 3–5

**Step 4 · Fallback**（前 3 步无命中）

Glob `**/*.md` 排除 `node_modules/` / `.git/` / `dist/` / `build/` / `.venv/` / `target/`，再 grep query。

### 3.4 置信度分级（关键设计）

```text
≥ 0.95  CLAUDE.md ≥ 2 个 tag prefix AND learning/INDEX.md 存在
0.85  CLAUDE.md ≥ 2 个 tag prefix，无 learning/
0.70  无 CLAUDE.md 但 Glob docs/**/*.md 找到 ≥ 3 个 [TAG]_*.md
< 0.70 无法确认 → 仍尝试 best-effort，但 prepend warning
```

### 3.5 输出格式

```markdown
## Locate: "<query>"

### Interpreted [LEARNING] docs (preferred)
1. **<path>** (confidence <0.xx>, hit: <step description>)
   - Snippet: "<1-line context>"
   - Next: Open with Read tool. (section_hint: "after reading, search for §3.3")

### Source canonical docs
1. **<path>** ...

### Project recognition
- has_learning: <true|false>
- tag_set: [<list>]
- confidence: <0.xx>

### Recommended next
- 如 Top1 是 canonical 但 uninterpreted：建议 /learn-kit:generate-tier 出三档解读
- 如 Top1 是 [LEARNING]：直接 Read 该文件
```

---

## 4 Skill 4 · generate-tier（AI 三档生成）⭐ v0.3.0 新增

### 4.1 触发条件

用户**有 user_question + 源材料**（项目内文件路径 / scan-locate 发现 / 粘贴长文本 / 整目录），想 AI 一键产出学习文档。

**触发例子**：

- "为 HITL 主题生成零基础版学习文档"
- "基于 [STANDARD]_X 出三版学习材料"
- "generate foundation+challenge tier docs for service-architecture"
- "我想做一份 HITL 主题的学习文档 + 交互式 HTML"
- "生成学习 HTML"

### 4.2 不触发（容易混淆的反例）

- "学 X" → 反查现存文档 → 用 **locate**
- "项目里有什么可学的" → 枚举发现 → 用 **scan**
- "改一下 foundation 第 3 节" → 编辑请求，不是重新生成
- "解释 X 是什么" → 一次性回答，不是生成持久文档

### 4.3 10 步交互流程（v1.0.0 起 8 → 10 步）

```text
Step 0  Intake             从 prompt 抽 topic + user_question
Step 1  Pre-flight         检 learning/INDEX.md（没有则提示先 /init）
Step 2  Source acquisition AskUserQuestion 多选 4 种来源：
                            ☐ 项目内文件路径（paste @file 或路径）
                            ☐ 复用 scan/locate 发现
                            ☐ 用户粘贴长文本
                            ☐ 整目录扫描
Step 3  Tier selection     AskUserQuestion 多选 3 档（默认全选）：
                            ☐ foundation 零基础版（Recommended）
                            ☐ structural 结构版
                            ☐ challenge  挑战版
Step 4  Topic confirmation 单选 / 输入 topic-slug + 冲突策略
Step 5  Per-tier generate  按 tier 分别 AI 生成 markdown
Step 6  INDEX update       自动追加到 learning/INDEX.md §Tier Documents
Step 7  HTML offer         AskUserQuestion 单选「是否生成 HTML?」
Step 8  HTML render        spawn Explore subagent 做 concept→code grounding
                          → 渲染单文件 HTML（SVG 图 + Tab + 暗亮主题 + 复制为 prompt）
Step 9  NLM offer ⭐ v1.0.0 AskUserQuestion 单选「是否推到 NotebookLM 出多媒体?」
                          → 默认 Skip；选 Yes 则调 /learn-kit:nlm-studio <topic>
                          → 选 Skip 不会自动触发；可日后手动跑
Step 10 Summary            列所有路径 + 推荐阅读顺序 + （若 step 9 = Yes）NLM 表格
```

### 4.4 输出文件

```text
learning/<topic>/
├── [LEARNING]_<topic>_foundation.md      # 零基础（少术语 + 多类比）
├── [LEARNING]_<topic>_foundation.html    # 配对 HTML（可选；step 7 = Yes 才生成）
├── [LEARNING]_<topic>_structural.md      # 结构（概念地图 + 边界）
├── [LEARNING]_<topic>_structural.html
├── [LEARNING]_<topic>_challenge.md       # 挑战（反例 + 迁移题 + 诊断）
└── [LEARNING]_<topic>_challenge.html
```

**关键约定**：
- HTML 与 markdown **同目录、同 basename**，仅扩展名不同
- HTML 全离线（无 CDN），双击或 `start <file>` 直接看
- 每个概念挂真实仓库代码引用（file:line + snippet），不空泛
- HTML 仅供人类浏览器查看；**`/learn-kit:nlm-studio` 不上传 HTML 到 NLM**（v1.0.0 dogfood 发现 NLM 拒收 HTML 源）

### 4.5 6 类源头变量（写在 prompt 里可加速）

如果 prompt 里已含以下信息，skill 跳过对应 AskUserQuestion 步骤：

| 变量 | 例子 | 跳过哪步 |
|------|------|---------|
| `topic` | "为 HITL 主题..." | step 4 topic confirmation 默认值 |
| `user_question` | quoted 的具体学习意图 | step 0 已抽 |
| `tiers_hint` | "只要零基础版" / "foundation + challenge" | step 3 tier selection |
| `source_paths_hint` | `@file.md` 或显式路径 | step 2 source acquisition |
| `html_hint` | "也生成 HTML" / "skip HTML" | step 7 HTML offer |
| `nlm_hint` ⭐ v1.0.0 | "完了直接推 NLM" / "不要 NLM" | step 9 NLM offer |

### 4.6 边界（明确声明不做什么）

| Non-goal | 原因 |
|----------|------|
| 不增量编辑已有 [LEARNING] 文档 | 冲突策略只提供 Overwrite / `.v2` 后缀 / Skip / Abort |
| 不直接调 NLM API | NLM 调用走 **nlm-studio**（step 9 仅询问是否触发） |
| 不维护 generation history | 每次重跑覆盖（或 `.v2`） |
| 不生成跨 tier 内部链接 | 每档 markdown / HTML self-contained，by design |

---

## 5 Skill 5 · nlm-studio（NotebookLM 多媒体）⭐ v1.0.0 新增

### 5.1 触发条件

用户已有 `learning/<topic>/` 下至少 3 个 `.md`（generate-tier 产出），**想出多媒体**（audio / video / slide / mind_map / infographic）在线浏览。

**触发例子**：

- "为 <topic> 出 NLM 多媒体" / "make NLM artifacts for <topic>"
- "/learn-kit:nlm-studio <topic>"
- "学完 <topic> 想要个音频版"
- "把 <topic> 喂给 NotebookLM" / "feed <topic> to NotebookLM"
- "publish <topic> learning to NotebookLM"

### 5.2 不触发（容易混淆的反例）

- "为 X 生成学习文档" → markdown 生成，不是 NLM 推送 → 用 **generate-tier**
- "出考试题 / quiz" → v4.0.0 永久放弃（v3.x notebooklm-kit:learn-test 已退役）
- "跨 notebook 查询" → v4.0.0 永久放弃（用 notebooklm.google.com web UI）
- "删 notebook / 分享 notebook" → 用 NotebookLM web UI

### 5.3 前置依赖（一次性配置）

```bash
# 装 notebooklm-mcp CLI（learn-kit 的 .mcp.json 自动调用它）
uv tool install notebooklm-mcp-cli --with socksio --force

# Google OAuth 登录（token 自动 refresh，但寿命 15-30 min，长跑会用尽）
nlm login
```

### 5.4 输出：至多 13 个在线 artifact（不下载二进制）

| Artifact | Foundation | Structural | Challenge | 备注 |
|----------|-----------|-----------|-----------|------|
| audio | ✓ | ✓ | ✓ | deep_dive 双主持人对谈，15-20 min |
| video | ✓ | ✓ | ✓ | 8-12 min，4-6 scene + visual cue |
| slide_deck | ✓ | ✓ | ✓ | 15-25 张 |
| infographic | ✓ | ✓ | ✓ | 单 poster，5-8 panel |
| mind_map | — 1 shared / topic（view-agnostic）— | | | 不三档循环；NLM 媒介限制（见 §5.6 dogfood finding #5）|

合计：4 view-cycled × 3 + 1 shared mind_map = **13 个 artifact**。

### 5.5 5 步 workflow（每 Step 都 refresh auth）

```text
Step 1  Pre-flight       refresh_auth + server_info（本地检查）
                        → notebook_list（**真 auth gate**，本地检查不充分）
                        → 检 3 必需 .md（HTML 不检）
Step 2  Re-run guard     notebook_list 查 learn-kit:<topic> 是否已存
                        → 存在则 AskUserQuestion 4 选 1：
                          regenerate / replace sources / new-timestamped / abort
Step 3  Notebook setup   notebook_create（按需）
                        → 3 个 source_add 并发上传 .md
                        → **强制 notebook_get 核验真实 source 列表**
                          （source_add 错误响应不可靠）
Step 3.5 Quota gate ⚠️  AskUserQuestion："13 artifact ≈ 65% NLM Studio 日上限
                        （~20/天）；本 skill 看不见账户当日已用量"
                        → confirm / reduce subset / abort
Step 4  Artifact gen    3 parallel batches:
                        - Round 1（foundation）: 5 calls（含 mind_map）
                        - Round 2（structural）: 4 calls（跳过 mind_map）
                        - Round 3（challenge）:  4 calls（跳过 mind_map）
                        每 batch 间 refresh_auth；mid-run auth 失败 retry-once 后 abort；
                        studio_status 幂等查跳过 existing
Step 5  Terminal recap   markdown 表格 + notebook URL；**零本地落盘**
```

### 5.6 5 个 dogfood findings（v1.0.0 release 前已应用）

| # | Finding | 设计响应 |
|---|---|---|
| 1 | `refresh_auth` + `server_info` 仅本地检查（token 是否还被 Google 接受不知）| Step 1.4 用 `notebook_list` 作真 auth gate |
| 2 | NLM 在 file-mode 与 text-mode 都拒收 .html 源 | **HTML 整体不上传**；L2 fallback 代码删除；只传 3 个 .md |
| 3 | NLM token 寿命 ~15-30 min，长跑会用尽 | 每 Step 起始 `refresh_auth`；mid-run 失败 retry-once 后 abort |
| 4 | `source_add` 错误响应不可靠（server 可能 async 成功）| 3 source_add 后**强制 `notebook_get` 核验** |
| 5 | NLM `mind_map` artifact 对 view 差异化指令无视 | mind_map 收敛为 **1 shared / topic**（不三档循环）|

### 5.7 质量原则一：View-Purpose Preservation

4 个 view-cycled 类型的同一 type 三档应**风格上可盲测分类**：

| Tier | audio 风格 | video 风格 | slide_deck 风格 | infographic 风格 |
|------|-----------|-----------|----------------|-----------------|
| foundation | 日常类比开场 + 5 条 TL;DR 收尾 | 5-pack TL;DR on-screen 双模收尾 | 类比 + 5-pack 收 | 每板 ≤7 数字 + 生活化图标 |
| structural | 系统化概念地图 + 自检清单收 | 结构图框架 + 自检清单 | 层级图 + 比较表 + 自检 | 维度对照 + 层级图 |
| challenge | 每段以挑战性提问收（probing question）| 反例对比 + 未答问题收 | 70% 反例 + 对比 + 开放问题收 | 看似 X / 实际 Y 对比 |

实现机制：每个 view 配一份 `view-<view>.md` 模板（§1 Pedagogical purpose / §2 Audience / §3 Style / §4 Anti-patterns / §5 Success criteria 五段必备），SKILL.md 内置 **failsafe** 在每个 artifact 生成前校验五段完整性，缺则 abort。

mind_map 是 NLM 媒介本身的限制例外（finding #5），不强求差异化。

### 5.8 质量原则二：LANGUAGE & TERMINOLOGY

每个 artifact 的 `focus_prompt` 注入统一的语言策略指令（单文件源 `templates/language-directive.md`，13 artifact 共用）：

- **主体内容用简体中文**：标题 / 旁白 / 解说 / slide 正文 / mind_map 节点 / infographic panel
- **行业标准技术术语保留英文原词**：`frontmatter` / `schema` / `ADR` / `SKILL.md` / `track` / `canonical` / `deprecated` / `YAML` / `MCP server` / `loader` / `governance` / `hygiene` / `lint` 等
- **代码 / 路径 / 标识符 verbatim**：`/learn-kit:nlm-studio` / `notebook_id` / `mcp__plugin_learn-kit_notebooklm-mcp__*`

合格样例：「ADR 是一次性决策记录，state 字段可以是 draft / active / deprecated，但绝不能用 completed —— 那是 working 四态的终态。」

反面样例（错译）：「架构决策记录是一次性决策记录，状态字段可以是草稿 / 活跃 / 弃用……」（强译反而难查源文档）

### 5.9 边界（明确声明不做什么）

| Non-goal | 原因 |
|----------|------|
| 不下载二进制 artifact | 设计为在线浏览（终端只打印 URL） |
| 不本地持久化 artifact URL | 零本地落盘；需保存自己 bookmark |
| 不生成 quiz / flashcards / data_table | v4.0.0 永久放弃（用外部评估工具） |
| 不上传 HTML 到 NLM | dogfood finding #2；HTML 仅供浏览器 |
| 不支持 append-keep-old re-run | NLM 不去重 source；Step 2 只提供 replace |
| 不并发 > 5 calls/round | dogfood 验证 5 parallel 零 rate-limit；更多未验证 |

---

## 6 五者如何拼成完整闭环

```text
                            ┌──────────────────────────┐
                            │  项目首次启用 learn-kit    │
                            └────────────┬─────────────┘
                                         │
                                         ▼
                            ┌──────────────────────────┐
                            │  /learn-kit:init         │ ← Skill 1（一次性 scaffold）
                            │  scaffold learning/      │
                            └────────────┬─────────────┘
                                         │
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
                              │                   │
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
                                                       │
                                                       ▼
                                          ┌─────────────────────────┐
                                          │ Step 9 想要 NLM 多媒体？ │
                                          └────────┬────────────┬───┘
                                                   │ 是          │ 否
                                                   ▼             ▼
                                       ┌─────────────────┐   结束
                                       │ /learn-kit:     │← Skill 5 (NLM)
                                       │ nlm-studio      │
                                       │ 13 个在线 artifact│
                                       └─────────────────┘
```

**简版口诀**：**scan 看大图 → locate 锁目标 → 已解读读 / 未解读 generate-tier 写 → 想要多媒体上 nlm-studio**。

---

## 7 共享的 project_profile recognition

locate 和 scan **共享 Step 0**——刻意保持一致，避免两个 skill 对项目识别不一致：

| 共享要素 | 设计目的 |
|---------|---------|
| CLAUDE.md tag 扫描 | 零配置项目识别 |
| 半开区间置信度（0.95 / 0.85 / 0.70）| 边界明确，0.95 不歧义 |
| `has_learning` / `has_docs_index` 检测 | 决定走哪个 tier |
| `learning_topics` 提取 | 支持 topic hint 过滤 |

**唯一差异**：scan 对低置信度更宽容（< 0.7 仍枚举 `*.md`，加 warning）——理由是枚举可优雅降级，反向查询需要明确赢家。

**generate-tier 和 nlm-studio 不共享此 recognition**：

- generate-tier 假设用户已知 topic + source，不做反向识别（信息从 AskUserQuestion 显式来）
- nlm-studio 假设 `learning/<topic>/` 已建好（generate-tier 已产出 3 .md），直接按 topic-slug 走

discovery（locate / scan）和 authoring（generate-tier / nlm-studio）在职责上分离——前者识别**项目**，后者已知**主题** + **内容**。

---

## 8 设计取舍亮点

### 8.1 Stateless 设计（全部 5 个 skill）

5 个 skill 全部 stateless：
- 无 cache、无 manifest、无持久索引（除 generate-tier 创建的 `learning/` 文件本身）
- 每次调用 re-scan / re-generate / re-push
- 代价：500 文件项目 1–3 秒；generate-tier ~30-60s/tier；nlm-studio 7-15 min/13 artifact
- 收益：文件 add/rename/delete 不会 desync，零维护负担

nlm-studio 通过 NLM 端 `studio_status` 查既存 artifact 做幂等性，**不**用本地状态文件——这是 Stateless 在网络场景的延伸。

### 8.2 `allowed-tools` 严格限制

| Skill | allowed-tools |
|-------|--------------|
| init | `Write`（scaffold 必需）|
| scan | `[Read, Glob, Grep]`（只读）|
| locate | `[Read, Glob, Grep]`（只读）|
| generate-tier | `[Read, Write, Glob, Grep, AskUserQuestion, Agent]`（Agent 用于 HTML grounding）|
| nlm-studio | `[Read, Glob, AskUserQuestion]` + 9 个 `mcp__plugin_learn-kit_notebooklm-mcp__*`（仅 NLM MCP，不能 Write 本地）|

read-only / 限定写 = 用户随便用，不会被改坏。nlm-studio 显式不要 `Write` 工具——强化「零本地落盘」契约。

### 8.3 触发例子写在 description 里

skill frontmatter 的 `description` 字段**就是触发契约**——Claude 根据 description 决定何时自动调用。learn-kit 5 个 skill 的 description 都很长，包含：

1. "Do invoke" 例子（中英双语）
2. "Do not invoke" 反例
3. Concrete contrast pairs（成对触发 vs 不触发）
4. Sibling skills 提示（避免自己抢任务）

nlm-studio 的 description 额外含 5 段 (`Trigger phrases` / `Sources per topic` / `Notebook name` / `Key quality principle` / `Do NOT use this skill for`)，是 v1.0.0 全 marketplace 最长的 description——刻意「pushy」防 undertriggering。

### 8.4 模板化提示词架构（v1.0.0 起 nlm-studio 引入）

nlm-studio 的 13 artifact 的 `focus_prompt` 用**可组合模板**：

```
focus_prompt = view-prefix（3 中选 1）
             + artifact-suffix（5 中选 1）
             + interaction-override（4/12 cell 有）
             + language-directive（单一文件源，全 13 cell 共享）
             + source-topic
```

DRY 设计：4 view-cycled × 3 view = 12 cell + 1 mind_map = 13 artifact 用 8 个模板文件 + 1 个 override YAML + 1 个 language directive = 10 文件搞定。改语言策略只改一个文件即影响全部 13 artifact。

### 8.5 Dogfood-driven design（v1.0.0 独有）

nlm-studio v1.0.0 release 前完整 dogfood 一次，5 findings 全部反应到设计（§5.6）。比起前 4 skill「先发布再观察」的演化路径，nlm-studio 是 v1.0.0 release 前做完 dogfood 才 ship 的。

---

## 9 关键源文件指针

| 想知道什么 | 读哪里 |
|----------|--------|
| init skill 定义 | `plugins/learn-kit/skills/init/SKILL.md` |
| scan skill 定义 | `plugins/learn-kit/skills/scan/SKILL.md` |
| locate skill 定义 | `plugins/learn-kit/skills/locate/SKILL.md` |
| generate-tier skill 定义 | `plugins/learn-kit/skills/generate-tier/SKILL.md`（10 step workflow） |
| generate-tier 4 prompt templates | `plugins/learn-kit/skills/generate-tier/templates/{foundation,structural,challenge,html-renderer}.md` |
| nlm-studio skill 定义 | `plugins/learn-kit/skills/nlm-studio/SKILL.md`（5 step workflow + composition contract） |
| nlm-studio 9 模板 | `plugins/learn-kit/skills/nlm-studio/templates/{view-foundation,view-structural,view-challenge,artifact-audio,artifact-video,artifact-slide_deck,artifact-mind_map,artifact-infographic,interaction-overrides,language-directive}.md`（共 10 文件）|
| Discovery 设计决策 | `docs/adr/[ADR]_LearnKit_Discovery_Skills.md` |
| v4.0.0 NLM 收编决策 | `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md`（v1.0.0 起新增）|
| v3.x → v4.0.0 迁移 | `docs/MIGRATION_GUIDE.md` §2 |
| 方法论 §1.5 推荐工作流 | `METHODOLOGY.md` §1.5 Project Discovery |

---

## 10 自检问题

1. 为什么 init 设 `disable-model-invocation: true` 而其他 4 个 skill 不设？
2. locate 找到一个 source canonical 但还没解读，应该建议用户做什么？
3. scan 的 PageRank-lite 排序为什么用 basename 而不是 stem？
4. locate 和 scan 都做 project recognition，差异是什么？为什么 scan 容忍更低置信度？
5. 用户说"学一下这个项目"应该路由到 locate 还是 scan？为什么？
6. 三个 read-only skill（init / scan / locate）都是 stateless 的代价是什么？为什么这个代价可接受？
7. generate-tier 为什么把 NLM 询问做成 step 9 而不是 step 1 / step 2 / 直接默认？（提示：opt-in 设计哲学）
8. nlm-studio 为什么不下载 binary artifact？（提示：使用场景 + 文件大小 + 维护负担三角）
9. nlm-studio 为什么 mind_map 不三档循环？（提示：dogfood finding #5 + ROI）
10. nlm-studio 为什么 HTML 不上传？dogfood 之前的设计草稿曾考虑过 L2 file→text fallback，为什么 v1.0.0 release 时删掉了？
11. v1.0.0 起 learn-kit 不再是 "Independent plugin"。这个变化的代价是什么？收益是什么？
12. 如果 NotebookLM 未来允许 mind_map view-cycled，nlm-studio 应该怎么改？（提示：interaction-overrides.md + artifact-mind_map.md）
