# CLAUDE.md — learn-kit Plugin (v3.2.0+)

learn-kit 是一个通用 Claude Code 插件，提供把"用户想学的主题"转化为可学习材料的统一工作流。**v3.0.0–v3.1.0 仅含 1 个 skill** `three-views`；**v3.2.0 起含 3 个 skill**——主 skill `three-views` + 两个轻量一问一答式解释 skill `glossary` / `concept`（纯 prompt，不写文件、不调工具，填补 three-views 明确 disclaim 的 "pure explanation / Q&A" 场景；详见 [`docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md`](../../docs/adr/[ADR]_LearnKit_Explanation_Skills_Addition.md)）。`three-views` 工作流（v3.1.0 起 Step 1.3 视角 multi-select + Step 4 5-cell 细粒度 NLM 类型 multi-select；additive，默认产物等同 v3.0.0）：

1. 接收主题 + 源材料（项目文件 / 外部 URL / 粘贴文本，三种 mixin）
2. **(v3.1.0 新)** Step 1.3 视角 multi-select：foundation / structural / challenge 默认 3 项全选、min 1；用户可单选/双选实现局部产出
3. 生成 `len(requested_tiers)` 份 markdown 学习文档（1-3 份；invariant: ≥1，否则 abort）
4. 可选生成交互式 HTML（dual-mode grounding：项目文件源走 concept→code，URL/文本源走 concept→source-section）；每 generated tier 一份 HTML
5. 可选推送到 NotebookLM 生成多媒体 artifact：**(v3.1.0)** Step 4 升级为 5-cell 独立 multi-select（HTML / NLM audio / NLM video / NLM slide_deck / NLM mind_map；默认全不选）；NLM 笛卡尔 = `len(generated_tiers) × len(selected view-cycled types) + (1 if mind_map)`；默认全勾时 max = 3 × 3 + 1 = 10 个（max 10 < v2.x 的 13；infographic v6.0.0 永久退场）

## 上下文

- **起源**：从 mj-system 项目的 `learning/_meta/[LEARNING]_Rule_List_Interpretation_Authoring.md` v2.0 STANDARD-tier 方法论（N=5 跨域验证）剥离 MJ 引用通用化而来
- **定位**：通用、外部项目可独立采纳、无 MJ 上下文假设
- **v3.0.0 BREAKING**：5 个 skill（scaffold-learning / locate / scan / generate-tier / nlm-studio）整合为单 skill `three-views`。详见 [`docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md`](../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md)（marketplace 层）+ [`docs/guide/[GUIDE]_Migration_From_v3_to_v4.md`](../../docs/guide/[GUIDE]_Migration_From_v3_to_v4.md) §6

## 插件内容

```
plugins/learn-kit/
├── .claude-plugin/plugin.json    # version 3.2.0
├── .mcp.json                     # 注册 notebooklm-mcp server (NLM 部分需要)
├── CLAUDE.md                     # 本文件
├── README.md                     # 用户指南
├── CHANGELOG.md                  # v3.0.0 BREAKING entry
├── LICENSE                       # MIT
├── docs/                         # plugin-internal docs
│   ├── INDEX.md
│   ├── adr/                      # 历史 ADR（含 [ADR]_LearnKit_Discovery_Skills）
│   └── guide/                    # 含 [GUIDE]_LearnKit_Pedagogy / Design / Discovery_Recipes (v3.0.0 新)
└── skills/                       # v3.2.0 起 3 个 skill
    ├── three-views/              # 主 skill
    │   ├── SKILL.md              # 5-step workflow (Intake / Source / 3-view md / Multi-select / Execute)
    │   └── templates/            # 10 templates
    │       ├── view-foundation.md       # 双段 BEGIN/END marker: markdown gen prompt + NLM view-prefix §1-§5
    │       ├── view-structural.md       # 同
    │       ├── view-challenge.md        # 同
    │       ├── html-renderer.md         # 双模式 grounding (repo-code / source-evidence / mixed)
    │       ├── artifact-audio.md        # NLM audio 媒介约束 (Chinese narration dual-lock v2.0.1 保留)
    │       ├── artifact-video.md        # NLM video 媒介约束 (同)
    │       ├── artifact-slide_deck.md   # NLM slide_deck 媒介约束
    │       ├── artifact-mind_map.md     # NLM mind_map 媒介约束 (view-agnostic 单例)
    │       ├── interaction-overrides.md # 3 of 9 view × artifact 联合调优 (v6.0.0 删 foundation×infographic 行)
    │       └── language-directive.md    # Chinese 主体 + 英文术语 single-source-of-truth
    ├── glossary/                 # v3.2.0 新增 · 术语速记卡 (纯 prompt; 单 SKILL.md; 无 templates / 无 tools)
    │   └── SKILL.md              # 六槽结构, ~150-250 字一段成文
    └── concept/                  # v3.2.0 新增 · 概念深讲 (纯 prompt; 单 SKILL.md; 无 templates / 无 tools)
        └── SKILL.md              # 六节结构, ~500-800 字, 2 跨域正例 + 1 反例 + 失效边界
```

加 `.mcp.json` 一份（注册 `notebooklm-mcp` server，依赖未变）。

## 命名约定 · skill slash 调用全限定

本插件 3 个 skill（`three-views` / `glossary` / `concept`）的 slash 调用**统一使用全限定形式**（`/learn-kit:three-views` / `/learn-kit:glossary` / `/learn-kit:concept`）。

- **历史动机**：marketplace v5.0.0 起本插件 scaffold skill 重命名为 `scaffold-learning`（原 `init` 与宿主 `/init` 撞名）；v6.0.0 起 scaffold 整体退场。统一全限定调用约定继承自 v2.0.0 + v3.0.0 ADR 的未来防御思路（避免与未来 Claude Code 内置同名冲突）

## 触发 `/learn-kit:three-views`

```
/learn-kit:three-views <topic>
```

或自然语言触发（trigger phrases 详见 `skills/three-views/SKILL.md` frontmatter description）：

- 「我想学习 React useEffect 内部原理」
- 「为 [STANDARD]_HITL 出三档学习材料」
- 「generate learning docs for service-architecture」
- 「把 X 推到 NotebookLM 出多媒体」

5-step 流程（详见 SKILL.md "Execution flow" 段；v3.1.0 起 Step 1 5 个 sub-step + Step 4 5-cell 升级）：

1. **Intake** — 主题 + 输入源 multiSelect (URL / 文件路径 / 粘贴) + **视角 multiSelect (Step 1.3 新, default 3 全选 / min 1)** + 输出目录 + 冲突策略 + Pre-flight 脚手架
2. **Source acquisition** — 用 source_manifest 结构化追踪；fallback table 处理 URL 404 / 登录墙 / 超大页面
3. **N-view 生成** — `view-<view>.md` MARKDOWN_GENERATION_PROMPT 段驱动 for each `view ∈ requested_tiers` (1-3 次)；带 source_manifest 引用 frontmatter；结束时计算 `generated_tiers = requested_tiers − skipped − failed`（必须 ≥1，否则 abort）
4. **Multi-select 询问 (v3.1.0 5-cell)** — 1 个 AskUserQuestion，5 项独立 multiSelect，默认全不选：HTML 渲染 / NLM audio / NLM video / NLM slide_deck / NLM mind_map；3-level hint granularity（explicit-type / generic-NLM / no-hint 决定预勾粒度）
5. **执行选中项**:
   - HTML：自动选 grounding 模式（有 file 源 + git repo → repo-code via Explore；URL/文本 → source-evidence）；loop over `generated_tiers`
   - NLM：refresh_auth → notebook_list (真 auth gate) → re-run guard 4 选（**v3.1.0 加 source_corpus_key 等价性 mismatch warning**）→ notebook_create → source_add × `len(generated_tiers)` + notebook_get 校验 → quota right-sizing 4 选（**v3.1.0 adaptive N + "Pick single tier" 重命名**）→ studio_create 循环（per-step refresh_auth + bounded polling 12×10s）→ 终端 URL 表格

## 治理边界

`learning/` 子系统是**项目主治理框架的并行子系统**：

- 共享底层（markdown 语法 OB1-OB6）
- 自管上层（命名 `[LEARNING]_*` / 路径 `learning/<topic>/` / frontmatter schema）
- v3.0.0 起 `_meta/METHODOLOGY.md` + `_archive/` scaffold 退场（per ADR Option B；manual methodology 实际独立调用极少；AI 三档已覆盖核心价值）

输出目录默认 `./learning/<topic>/`，用户可自定义任意路径。仓库外路径触发二次确认（path-traversal 安全防护）。

## Documentation

plugin-internal documentation 遵循 marketplace 文档框架（Framework v1.6 起；适配为 `scope: learn-kit`）。完整索引见 [docs/INDEX.md](docs/INDEX.md)。

子目录:

- [`docs/adr/`](docs/adr/) — plugin-internal ADRs（如历史的 `[ADR]_LearnKit_Discovery_Skills.md`；marketplace 层有 v3.0.0 决策的 `[ADR]_LearnKit_Consolidation_To_Single_Skill.md`）
- [`docs/guide/`](docs/guide/) — plugin-internal GUIDEs：
  - [`[GUIDE]_LearnKit_Pedagogy.md`](docs/guide/[GUIDE]_LearnKit_Pedagogy.md) — 教学合卷（定位 + 8 阶段方法论 + RFC 2119 worked example + 6 类质量门）
  - [`[GUIDE]_LearnKit_Design.md`](docs/guide/[GUIDE]_LearnKit_Design.md) — 设计合卷（v3.0.0 起 5 skill 分工章节标注 historical，新章节描述 three-views 单 skill 内部分段）
  - [`[GUIDE]_LearnKit_Discovery_Recipes.md`](docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md) — **v3.0.0 新增**：保留 v2.x locate/scan 算法核心（Grep + Glob 模板 + 置信度评分 + 引用排名）作为 manual recipes
- [`docs/spec/`](docs/spec/) — plugin-internal SPECs（暂无；schema 工作目前在 SKILL.md 内联）

## Advanced Tips（power-user 提示，源自 v1.0.0 dogfood + v3.0.0 升级经验 + v3.1.0 HITL 扩展）

- **多源混搭 source**：Step 1.2 multiSelect 可同时勾「URL + 项目文件 + 粘贴」，source_manifest 自动结构化追踪每个 source 的 id / kind / locator / line range / char count
- **(v3.1.0) 局部产出最便宜路径**：Step 1.3 仅勾 1 视角 + Step 4 仅勾 1 NLM 类型 = 1 个 NLM artifact ≈ 1-2 min 跑完；例如 `structural + slide_deck` 适合做主题快速 deck，或 `challenge + mind_map` 适合做思路梳理（mind_map 1-tier corpus 仍正常工作 per dogfood finding #5）
- **(v3.1.0) 视角默认行为**：Step 1.3 默认 3 项全选 = 等同 v3.0.0；用户不动默认 = 产物完全不变（只多一个 confirmation gate）
- **(v3.1.0) Step 4 hint 粒度**：自然语言说 "just audio" / "只要 audio" → 只预勾 audio cell；说 "出 NLM" / "推到 NotebookLM" → 预勾全 4 NLM cells；不提 NLM → 全不勾
- **HTML grounding 自动判**：源含 file 且 cwd 是 git repo → repo-code mode (spawn Explore subagent)；纯 URL/文本 → source-evidence mode (用 source_manifest 引用)；不会虚构 file path
- **跨项目 dogfood**：learn-kit 通用，可在任意外部项目装；输出目录默认 `./learning/<topic>/`，可改任意路径（仓库外触发二次确认）
- **NLM 节奏建议**：默认全勾 (3 + 3 + 3 + 1 = 10 artifact) ≈ 50% 日 quota；Step 4 各 cell 独立可控制粒度；Step 5B Quota gate 的「Reduce subset」/「Pick single tier」（v3.1.0 重命名）再次缩小批量；中途 auth 失败 retry-once 兜底，长跑前先 `! nlm login` 一遍刷新 token 更稳
- **NLM artifact 持久化**：skill **不**本地落盘 URL；想长期追溯请自己在浏览器加 bookmark 或在外部笔记里记 notebook URL
- **View-Purpose 盲测**：跑完 9 view-cycled artifact 后挑同 type 的三档（如 audio_foundation / audio_structural / audio_challenge），让一个没看过 view 标签的旁人听后猜哪是哪——3/3 正确 = 健康；如果分不清，回去看 Step 3 三档 markdown 是否本身差异化不足
- **(v3.1.0) Partial-rerun source-corpus mismatch 警告**：对同一 topic 之前跑过完整 3-tier，本次只勾 1 tier，Step 5B re-run guard 会检测 `source_corpus_key` 不一致，警告并默认推荐 "Replace sources + new notebook" 或 "New timestamped notebook"，不会静默复用 3-source notebook 给 1-tier 产物
- **Re-run guard 续跑**：CTRL+C 半途中断后，重跑选 "Regenerate missing" 路径 + Step 5B 5 中 `studio_status` 自动跳过已生成的 (type, view) 对（前提：source_corpus_key 匹配）
- **mind_map view-agnostic**：dogfood 验证 NLM 媒介对 mind_map 无视 view 差异化指令；单一 shared，可独立要也可与 view-cycled 一起要；与 generated_tiers 数量解耦（1-3 tier 都是 1 个 mind_map）
- **infographic 永久丢失提醒**：v6.0.0 删；用户依赖请用 NLM web UI 手动建（per `[ADR]_LearnKit_Consolidation_To_Single_Skill` §3.2）

## NLM 集成 · 工具前缀

`.mcp.json` 注册 `notebooklm-mcp` MCP server。Claude Code 加载后，MCP 工具命名规则为：

```
mcp__plugin_<plugin.json-name>_<.mcp.json-server-key>__<tool>
```

代入：plugin name = `learn-kit`, server key = `notebooklm-mcp`，所以 three-views SKILL.md `allowed-tools` 字段全部使用 `mcp__plugin_learn-kit_notebooklm-mcp__*` 前缀（9 个：refresh_auth / server_info / notebook_list / notebook_get / notebook_create / source_add / source_delete / studio_create / studio_status）。

工具前缀 v3.0.0 与 v2.x 完全一致（plugin name 不变 + server key 不变）。
