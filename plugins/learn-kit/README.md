# learn-kit

> **v3.1.0+**: Single-skill pedagogical kit — `/learn-kit:three-views` generates 1-3 tier learning markdown (foundation 零基础版 / structural 结构版 / challenge 挑战版) for any topic, with opt-in interactive HTML and NotebookLM multimedia outputs. v3.1.0 adds tier multi-select (Step 1.3, default all 3) + 5-cell granular Step 4 artifact-type multi-select.

`learn-kit` 提供把"你想学习的主题"快速变成可读 / 可看 / 可听材料的统一工作流。一个 skill，按需选档 + 按需扩展：

1. **N 阶段 markdown 学习文档**（必出 ≥1）— Step 1.3 视角 multi-select（foundation / structural / challenge；默认 3 项全选 / min 1），AI 围绕主题 + 源材料直接生成所选视角的 markdown
2. **交互式 HTML 学习页**（可选；per generated tier）— 同名同目录的 `.html`；双模式 grounding：项目源 → concept→code via Explore subagent；外部 URL/文本 → concept→source-section
3. **NotebookLM 多媒体 artifact**（可选；5-cell granular）— Step 4 独立勾选 audio / video / slide_deck / mind_map / HTML；NLM 笛卡尔 = `len(generated_tiers) × len(selected view-cycled types) + (1 if mind_map)`；默认全勾时 max 10 个

## v3.0.0 BREAKING（注意！）

v3.0.0 整合 v2.x 的 5 个 skill 为 1 个 `three-views`。**4 个公开 slash command 永久消失 + 1 个重命名**：

| v2.x 老命令 | v3.0.0 新做法 |
|-------------|---------------|
| `/learn-kit:scaffold-learning` | 由 `/learn-kit:three-views` Step 1 在默认路径下自动建 `learning/<topic>/` + `INDEX.md` 骨架（不再建 `_meta/METHODOLOGY.md` 与 `_archive/`） |
| `/learn-kit:locate <query>` | 见 [`docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md`](docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md) §"Locate Recipe" — manual Grep + Glob 模板 + 置信度评分 |
| `/learn-kit:scan` | 见同 GUIDE §"Scan Recipe" — canonical doc 枚举 + 交叉引用 + ranking |
| `/learn-kit:generate-tier <topic>` | `/learn-kit:three-views <topic>` — 同样的 3 阶段 markdown，新增 URL 输入 + source_manifest + dual-mode HTML |
| `/learn-kit:nlm-studio <topic>` | `/learn-kit:three-views <topic>` 然后 Step 4 multiSelect 勾选 NLM 选项 |

**infographic artifact 永久丢失**（v6.0.0 marketplace BREAKING）—— 需要 infographic 请用 NotebookLM web UI 手动生成。详见 [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) §3.2 取舍依据 + [`[GUIDE]_Migration_From_v3_to_v4`](../../docs/guide/[GUIDE]_Migration_From_v3_to_v4.md) §6 完整迁移指引。

## 适用场景

当你想**深度学习一个主题**而不只是查阅时：

- 项目内有 STANDARD / SPEC / ADR 类规则清单，想转化为可教别人的材料
- 想理解一个外部 URL / 论文 / RFC 内容并建立 mental model
- 已有学习笔记但希望换 3 个视角再消化一遍
- 想把学习材料变成音频 / 视频 / 幻灯方便通勤 / 多模态学习

**不适用**：单纯查阅 / 故障复盘 / 架构图 / 数据流。

## 安装

通过 `mj-agentlab-marketplace` 安装：

```bash
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install learn-kit@mj-agentlab-marketplace
```

或在 `~/.claude/settings.json` 中显式启用：

```json
{
  "enabledPlugins": {
    "learn-kit@mj-agentlab-marketplace": true
  }
}
```

## 前置依赖

- **核心 markdown 生成**: 零外部依赖
- **HTML 渲染**（可选）: 零外部依赖（spawn Explore subagent 内部完成 concept→code grounding，不需要额外配置）
- **NLM 多媒体**（可选）需要：
  - `notebooklm-mcp` MCP server（本插件 `.mcp.json` 自动加载；首次需在终端 `uv tool install notebooklm-mcp-cli` 一次）
  - NotebookLM 账户 + 一次性 `nlm login`（在终端运行；token 自动 refresh）

如不需要 NLM，可以忽略 nlm-* 依赖。

> **Legacy plugin 提示**：如果之前装过 `mj-nlm@my-marketplace`（来自外部 marketplace 的 legacy NLM plugin），**建议卸载**避免 MCP server 重复加载：`/plugin uninstall mj-nlm@my-marketplace`。判断方法：工具列表同时出现 `mcp__plugin_mj-nlm_*` 和 `mcp__plugin_learn-kit_*` 前缀即为重复。

## Quick Start

```text
/learn-kit:three-views "我想学习 React useEffect 内部原理"
```

即可触发完整 5-step flow：

- **Step 1.3** 弹出视角 multiSelect（3 项默认全选）；想只生成 foundation 就取消勾另两个
- **Step 4** 弹出 5-cell multiSelect（默认全不选）；想要 audio podcast 就只勾 NLM audio
- 想完全保持 v3.0.0 行为？两步都按默认（全选 + 全不选）= 3 份 markdown，无 HTML / 无 NLM

## 命名约定 · slash 调用必须全限定

本插件唯一 skill `three-views`，slash 调用**统一使用 `/learn-kit:three-views`**。理由：

1. **避免与 Claude Code 内置冲突** — 历史上本插件 `init` skill 曾与内置 `/init` 冲突（v2.0.0 起 init → `scaffold-learning` 重命名物理消除；v3.0.0 起 scaffold-learning 整体退场）。统一全限定是未来防御。
2. **可发现性** — 读者看到 `/learn-kit:three-views` 立刻知道来源；裸 `/three-views` 在长 PR 上下文里语义二义。

## 中文 TL;DR · 30 秒认知

1 个 skill，5 步流程（v3.1.0 起 Step 1 加视角 multiSelect / Step 4 升级 5-cell）：

```
Step 1 Intake          → 主题 + 输入源 (URL / 文件 / 粘贴) + 视角 multiSelect (default 3 全选) + 输出目录 + 冲突
Step 2 Source acquire  → source_manifest 结构化追踪每个 source
Step 3 N-view 生成     → len(generated_tiers) 个 [LEARNING]_<topic>_<view>.md (≥1)
Step 4 Multi-select 问 → 5 cell: HTML / NLM audio / NLM video / NLM slide_deck / NLM mind_map (默认全不选)
Step 5 执行选中项      → HTML × generated_tiers (双模式 grounding) + NLM artifact (URL 表格)
```

输出永远 ≥ 1 个 markdown（必出 invariant）；HTML 和 NLM 各 cell 均显式 opt-in，按勾几格生几格。

## 5 分钟上手 · 端到端流程

**场景 A**：项目内 STANDARD 转学习材料（kitchen sink）

```text
/learn-kit:three-views "为 STANDARD_HITL 出三档学习材料"
→ Step 1.3: 视角 3 项全选默认
→ Step 1.4: 选项目内文件路径 + 输出 ./learning/hitl/
→ Step 2: 自动 Read 文件，构 source_manifest [S1]
→ Step 3: 生成 [LEARNING]_hitl_{foundation,structural,challenge}.md (3 份)
→ Step 4: 勾 HTML + NLM audio + NLM video + NLM slide_deck (不勾 mind_map)
→ Step 5A HTML: repo-code mode (cwd 是 git repo)，spawn Explore × 3
→ Step 5B NLM: refresh_auth → re-run guard → notebook_create →
            source_add × 3 + verify → quota gate (N=9, Confirm all) →
            studio_create × 9 (bounded poll 12×10s/artifact) →
            终端 URL 表
→ 总耗时 ~10-15 min
```

**场景 B**：学外部 URL 内容 + HTML only

```text
/learn-kit:three-views "我想学习 React useEffect 内部原理"
→ Step 1.3: 视角 3 项全选默认
→ Step 1.4: 选外部 URL，粘贴 react.dev/reference/react/useEffect
→ Step 2: WebFetch 拉取，构 source_manifest [S1 kind=url]
→ Step 3: 生成 3 md
→ Step 4: 勾 HTML（4 个 NLM cell 不勾）
→ Step 5A HTML: source-evidence mode（无 repo file），引 source_manifest 段落
→ 完成
```

**场景 C**：只要 mind_map（minimal NLM）

```text
/learn-kit:three-views "RFC 2119 五关键词"
→ Step 1.3: 视角 3 项全选默认
→ Step 1.4-3: 3 md
→ Step 4: 只勾 NLM mind_map（HTML / audio / video / slide_deck 不勾）
→ Step 5B: 跳过 view-cycled，只 studio_create mind_map（synchronous）
→ 1 个 mind_map URL
```

**场景 D**：局部产出（v3.1.0 新）— 单 tier + 单 NLM 类型

```text
/learn-kit:three-views "git rebase，只要 foundation 和 audio podcast"
→ Step 1.3: 自然语言 hint 检测到 "foundation" → 仅 foundation 预勾；structural/challenge 不勾
→ Step 1.4-3: 1 md (foundation only)
→ Step 4: 自然语言 hint 检测到 "audio podcast" → 仅 NLM audio cell 预勾
→ Step 5B: 1 个 NLM audio artifact
→ 总耗时 ~1-2 min
```

## 三视角怎么选 / 输出文件结构

输出目录默认 `./learning/<topic>/`，结构（v3.1.0 起 generated tier 子集决定文件数）：

```
./learning/<topic>/
├── [LEARNING]_<topic>_<view>.md       # 每 view ∈ generated_tiers 一份 (≥1 份)
│                                      # 全选时: foundation + structural + challenge 共 3 份
├── [LEARNING]_<topic>_<view>.html     # 仅当 Step 4 勾 HTML；每 view ∈ generated_tiers 一份
└── ...
```

NLM artifact 不本地落盘 — 终端打 URL 表格（每 cell 选中数 × generated tier 个数；mind_map 单独 1 个）。

## 常见踩坑 + 排错

| 症状 | 原因 | 处理 |
|------|------|------|
| skill 不触发 | 关键词不在 description trigger 列表 | 改用直接触发词："我想学习 X" / "为 X 出三档学习材料" |
| 生成内容空洞 | source 太少或不相关 | Step 1 多选几个 source 来源；或粘贴更多文本 |
| HTML 概念未挂代码 | repo-code mode 但仓库里没有对应代码 | HTML 自动 `<missing-evidence concept="X"/>` 占位，不虚构；或换 source-evidence mode |
| NLM 中途「Authentication expired」| NLM token 寿命 15-30 min | 终端 `! nlm login` 再调；mid-run retry-once 已兜底；重跑选 "Regenerate missing" 续 |
| NLM 中途「quota exceeded」| 当日已用过 NLM Studio quota | Step 5B Quota gate 选 "Reduce subset" 或 "Pick single tier"（v3.1.0 重命名）缩小批量；或重跑时 Step 1.3 只选 1 视角 + Step 4 只勾少数 NLM cell |
| **(v3.1.0)** Step 5B re-run 报 source corpus mismatch warning | 同 topic 之前跑过完整 3-tier，本次只跑 1 tier，但 notebook 还在 | 默认推荐 "Replace sources + new notebook" 或 "New timestamped notebook"；不要强行 "Regenerate missing"（会用 3-source 给 1-tier 产物，contamination） |
| 同 topic 三档 mind_map 看起来差不多 | NLM 媒介对 mind_map 无视 view 差异化（dogfood finding #5）| 设计决定：1 shared mind_map / topic（v3.0.0 起 mind_map 仅作为 Step 4 可选项） |
| 想生成 infographic | v6.0.0 永久删除 | 用 NotebookLM web UI 手动建；ADR §3.2 解释 |
| `nlm login` 报错 | OAuth flow 故障 / proxy 干扰 / token 已损 | 重跑 `nlm login`；检查 `~/.nlm/` 权限；看 [notebooklm-mcp-cli upstream](https://pypi.org/project/notebooklm-mcp-cli/) |
| 路径穿越警告 | 输出目录给了 absolute path 或 escape cwd | 二次确认 prompt 出现；选 Proceed 继续，或改路径 |

## 学习材料 / 用户文档

`docs/guide/` 子目录含 3 份合规教学 / 设计 / 算法保留文档：

| 文档 | 用途 |
|------|------|
| [docs/guide/[GUIDE]_LearnKit_Pedagogy.md](./docs/guide/[GUIDE]_LearnKit_Pedagogy.md) | **教学合卷** — 定位 + 8 阶段方法论 + RFC 2119 worked example + 6 类质量门 |
| [docs/guide/[GUIDE]_LearnKit_Design.md](./docs/guide/[GUIDE]_LearnKit_Design.md) | **设计合卷** — 历史 5 skill 分工 + v3.0.0 收敛决策 + dogfood findings + parallel subsystem 治理模型 |
| [docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md](./docs/guide/[GUIDE]_LearnKit_Discovery_Recipes.md) | **v3.0.0 新** — 保留 v2.x locate/scan 算法（Grep+Glob 模板、置信度评分、引用排名）作为 manual recipes |

推荐阅读顺序：

- **新用户**：本 README 「中文 TL;DR」+「5 分钟上手」+「常见踩坑」即可上手
- **想深入方法论**：[GUIDE]_LearnKit_Pedagogy.md
- **想理解 skill 设计与 v3.0.0 收敛决策**：[GUIDE]_LearnKit_Design.md + marketplace 层 [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md)
- **需要 v2.x locate/scan 行为**：[GUIDE]_LearnKit_Discovery_Recipes.md

## License

MIT — see `LICENSE`.

## 演进历史

本方法论经 N=5 跨域验证（rules 8–63 / dimensions 3–5 / 5 个独立比喻世界 / 全部 N 维 AND-gate 几何不变量）后稳定，通用化为 `learn-kit` v0.1.0 起作为 marketplace 独立插件维护。

| Version | Highlight |
|---------|-----------|
| v0.1.0 | Initial release: 8 阶段方法论 + init scaffold |
| v0.2.0 | Discovery skills: locate + scan |
| v0.3.0 | AI 流: generate-tier + 4 prompt templates + HTML render |
| v0.3.1 | plugin.json repository field schema fix |
| **v1.0.0** | **nlm-studio + 9 templates；notebooklm-kit 退场配套（marketplace v4.0.0）；first stable release** |
| v1.1.0 | plugin-internal docs 框架（6 教学系列）|
| v1.2.0 | plugin-internal docs 重组（6 教学系列 → 2 份 [GUIDE]）|
| v1.2.1 | nlm-studio SKILL.md description 压缩 < 1,536 char cap |
| **v2.0.0** | **BREAKING: init → scaffold-learning 重命名（消除与 Claude Code `/init` 冲突）** |
| v2.0.1 | nlm-studio zh-CN narration constraint 双锁加固 |
| **v3.0.0** | **BREAKING: 5 skill → 1 `three-views` 收敛；删 scaffold-learning/locate/scan/nlm-studio；NLM artifact 13→max 10（删 infographic，mind_map 转可选）；marketplace v6.0.0 配套** |
| **v3.1.0** | **Additive: Step 1.3 视角 multi-select（default 3 全选 / min 1）+ Step 4 升级 5-cell granular NLM 类型 multi-select（HTML / audio / video / slide_deck / mind_map 独立勾选）；Step 5B re-run guard 加 source-corpus equivalence；3-level hint granularity；marketplace v6.1.0 配套；默认产物等同 v3.0.0** |
