# learn-kit

> Pedagogical kit: 8-stage manual authoring methodology + AI 3-tier learning doc generator + discovery skills + NotebookLM multimedia generator (since v1.0.0).

`learn-kit` 提供三条互补路径把枯燥的规则清单（RFC keyword lists、安全策略、API style guides、STANDARD/POLICY 文档）转化为可学习材料：

1. **手工流（METHODOLOGY 8 阶段）**：用户读方法论后自行抽框架、找比喻、写决策图，产出 `[LEARNING]_<topic>_Common.md` 类 framework 文档
2. **AI 流（generate-tier）**：给 user_question + 源文档，多选三档（零基础/结构/挑战）→ AI 直出 markdown，可选再渲染交互式 HTML
3. **多媒体流（nlm-studio，v1.0.0 新增）**：把三档学习 markdown 推到 NotebookLM 生成多媒体 artifact（4 view-cycled 类型: audio + video + slide_deck + infographic × 3 view + 1 shared mind_map = 至多 13 个），在线浏览不下载

加上两个发现层 skills（locate 反查 + scan 枚举），learn-kit 形成「init → 发现 → 撰写（手工/AI 双路径）→ 渲染 HTML → 推 NLM 多媒体」完整闭环。

## 适用场景

当项目中存在以下材料，团队成员想"建立 mental model 而不是逐条死记"时：

- 编号或并列的规则清单（5–30 条最优）
- 同类型条款扎堆（"必须 / 不应"、"高 / 低"等二分结构）
- 条款之间有共性可归纳

→ 用本插件方法论产出 5 件套（**抽象框架 + 类别归类 + 比喻系统 + 决策图 + 记忆口诀**）的解读文档；用 generate-tier AI 流产出三档学习材料 + HTML；用 nlm-studio 把三档推到 NotebookLM 出多媒体。

**不适用**：顺序教程、查阅参考、故障复盘、架构图、数据流。

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

- **init / locate / scan / generate-tier**: 零外部依赖
- **nlm-studio**（v1.0.0 新增）需要：
  - `notebooklm-mcp` MCP server（本插件 `.mcp.json` 自动加载；首次需在终端 `uv tool install notebooklm-mcp-cli` 一次）
  - NotebookLM 账户 + 一次性 `nlm login`（在终端运行；token 自动 refresh）

如只用前 4 个 skill，可以忽略 nlm-studio 的依赖。

> **Legacy plugin 提示**：如果之前装过 `mj-nlm@my-marketplace`（来自外部 marketplace 的 legacy NLM plugin），**建议卸载**避免 MCP server 重复加载：`/plugin uninstall mj-nlm@my-marketplace`。判断方法：工具列表同时出现 `mcp__plugin_mj-nlm_*` 和 `mcp__plugin_learn-kit_*` 前缀即为重复。

## 命名约定 · slash 调用必须全限定

本插件提供 5 个 skill：`scaffold-learning` / `scan` / `locate` / `generate-tier` / `nlm-studio`。所有 slash 调用**统一使用全限定形式 `/learn-kit:<skill>`**，不允许裸写 `/<skill>`。

具体规则：

- ✅ 写 `/learn-kit:scaffold-learning`、`/learn-kit:scan`、`/learn-kit:locate`、`/learn-kit:generate-tier`、`/learn-kit:nlm-studio`
- ❌ 不写裸 `/scaffold-learning`、`/scan`、`/locate`、`/generate-tier`、`/nlm-studio` 指代 learn-kit 行为

理由：

1. **避免与 Claude Code 内置冲突** —— 历史上本插件曾用 skill 名 `init` 与内置 `/init`（生成 CLAUDE.md）同名，slash 拾取器并列两条 `/init`；v2.0.0 起 init → `scaffold-learning` 重命名物理消除冲突（详见 [`docs/adr/[ADR]_LearnKit_Init_Skill_Rename.md`](../../docs/adr/[ADR]_LearnKit_Init_Skill_Rename.md)）。Claude Code 未来可能新增其他同名内置，统一全限定约定是未来防御。
2. **可发现性** —— 读者看到 `/learn-kit:<X>` 立刻知道来源是本插件；裸 `/<X>` 在长 PR / tutorial 上下文里语义二义。
3. **AI agent 自检友好** —— skill-registry 路由 token 永远带 namespace，避免大模型在自然语言指代时把不同来源的同名 skill 搞混。

**特别说明**：learn-kit 的 `scaffold-learning` SKILL.md 设置了 `disable-model-invocation: true` 作为额外护栏（防止 LLM 自然语言路由），其余 4 个 skill 没设此 flag（它们设计上允许自然语言路由）—— 但**用户显式调用入口**统一走 namespace 的规则适用于全部 5 个。

如果你看到本仓任何文档裸写 `/scaffold-learning` / `/scan` / `/locate` / `/generate-tier` / `/nlm-studio` 指代 learn-kit 行为，请提 issue 或 PR 修正。

## 中文 TL;DR · 30 秒认知

把项目里**枯燥的规则清单**（STANDARD / SPEC / ADR / RFC）变成**可学习材料**的工具集。5 个 skill 覆盖「发现 → 撰写 → 渲染 → 多媒体」全链路:

| Skill | 一句话 | 触发关键词 |
|-------|--------|-----------|
| `/learn-kit:scaffold-learning` | 在项目根 scaffold `learning/` 子系统骨架（一次性）| "初始化学习子系统" |
| `/learn-kit:scan` | 枚举项目所有可学候选文档 + 标注已解读 / 未解读 | "项目里有什么可学的" |
| `/learn-kit:locate <query>` | 反查具体概念 / 口诀 / 部分文档名到对应文档 | "学 X / 解释 X / X 在哪" |
| `/learn-kit:generate-tier` | AI 生成三档（零基础 / 结构 / 挑战）学习文档 + 可选 HTML | "为 X 生成学习文档 / 三档学习材料" |
| `/learn-kit:nlm-studio` | 把三档 markdown 推 NotebookLM 出至多 13 个多媒体 artifact | "为 X 出 NLM 多媒体 / 想要个音频版" |

## 5 分钟上手 · 端到端流程

**场景**：你想把项目里的某个 STANDARD 文档变成可学习材料 + 多媒体。

```text
Step 1 (一次性)         /learn-kit:scaffold-learning
                       → 在 <project-root>/learning/ 下创建骨架

Step 2 (开放式发现)      "项目里有什么可学的？"
                       → 触发 /learn-kit:scan
                       → 看到候选 docs 表格，按引用频率排序

Step 3 (锁定主题)        "为 HITL 主题生成三档学习文档"
                       → 触发 /learn-kit:generate-tier
                       → 多选 source 来源 → 多选三档 → 确认 topic
                       → 生成 [LEARNING]_HITL_{foundation,structural,challenge}.md

Step 4 (可选 HTML)       (skill 自动问) "是否生成 HTML 学习页？"
                       → 选「是」 → 自动渲染 3 个 .html (同目录同 basename)

Step 5 (可选 NLM 多媒体) (skill 自动问 step 9) "是否进一步推到 NotebookLM 出多媒体？"
                       → 选「是」 → 自动调 /learn-kit:nlm-studio <topic>
                       → 经过 Quota confirm gate → 跑 7-15 min → 至多 13 个在线 artifact
                       → 终端打印 notebook URL + artifact 表

Step 6 (后续追问)        "DLSRS 在哪个文档？"
                       → 触发 /learn-kit:locate
                       → 返回带置信度的候选清单
```

打开 HTML：Windows 下 `start <绝对路径>` 即可在浏览器预览。打开 NLM artifact：浏览器访问终端打印的 `notebook URL`。

## 三档怎么选

| 场景 | 推荐 |
|------|------|
| 第一次接触陌生主题 | foundation 零基础版（少术语 + 多类比 + 完整故事）|
| 已有印象想建结构 | structural 结构版（概念地图 + 关系表 + 适用边界）|
| 想检验自己是否真懂 | challenge 挑战版（反例 + 失败案例诊断 + 迁移题）|
| 学习新主题完整覆盖 | **全选三档**（推荐顺序：foundation → structural → challenge）|
| 想要随时听 / 看 / 看图 | 三档全选 → generate-tier step 9 同意调 nlm-studio 出多媒体 |

## 真实使用案例

### 案例 A：完全新人 onboard 一个项目

```text
1. /learn-kit:scaffold-learning                   # 第一天
2. "项目里有什么可学的"                            # 第一周
   → scan 返回 top 5 uninterpreted STANDARD
3. "为 STANDARD_HITL 主题生成三档学习文档"          # 锁定第一个主题
   → 多选: source = 项目文件路径 + 整目录扫描
   → tiers = 三档全选
   → HTML = 是
   → step 9 NLM = 是
   → 13 artifact 在 notebooklm.google.com 等着
4. 通勤时听 audio_foundation；办公时看 slide_structural；周末刷 challenge 反例
5. "学 DLSRS"                                     # 后续追问
   → locate 反查到 challenge 版的 §10 迁移题
```

### 案例 B：团队成员想为某个 spec 出培训材料

```text
1. /learn-kit:scaffold-learning  (如果没初始化)
2. "为 service-architecture 主题，基于 docs/rule/[STANDARD]_SvcArch.md
    + docs/[ADR]_Service_Decomposition.md 出三档学习材料 + HTML"
   → skill 直接走 step 2-8（已知 source paths + tiers + html_hint = 是）
3. step 9 NLM 提示 → 选「Skip」（不出多媒体），把 markdown + HTML 发团队
4. 一周后团队反馈想要个音频版 → 单独跑 /learn-kit:nlm-studio service-architecture
```

### 案例 C：自我检测某主题理解程度

```text
1. "为 X 主题只生成挑战版"
   → tiers = challenge (单选)
   → HTML = 否（直接看 markdown）
   → step 9 NLM = 否（自检不需要多媒体）
2. 做 §9 边界判断题 + §10 迁移应用题
3. 看 §13 盲区定位表，对应回去补 foundation / structural
```

### 案例 D：已生成的 learning/<topic>/ 出多媒体

```text
1. 项目里已有 learning/documentation-framework/ (3 md + 可选 3 html，
   之前用 /learn-kit:generate-tier 生成的)
2. "为 documentation-framework 出 NLM 多媒体"
   → 触发 /learn-kit:nlm-studio documentation-framework  (独立调用)
   → Step 1 pre-flight 检 3 .md ✓
   → Step 2 re-run: 若已存 → 4 选 1（regenerate / replace sources / new / abort）
   → Step 3 创建 notebook + 3 并发 source_add + notebook_get 核验
   → Step 3.5 Quota gate：确认 13 artifact ≈ 65% 日上限
   → Step 4 跑 3 parallel batches (5+4+4) 共 13 个 artifact，7-15 min
   → Step 5 终端打印 notebook URL + 13 行 artifact 表
3. 打开 notebook URL，在 NLM web UI 浏览/分享/下载
```

## 常见踩坑 + 排错

| 症状 | 原因 | 处理 |
|------|------|------|
| skill 不触发 | 关键词不在 description trigger 列表 | 改用更直接的触发词："为 X 生成三档学习文档" / "为 X 出 NLM 多媒体" |
| 生成内容空洞 | source 太少或不相关 | step 2 多加几个 source 来源；用户粘贴更多文本 |
| HTML 概念未挂代码 | 仓库里确实没有对应代码 | HTML 会自动列入「文档 vs 实现」段，无需手动修 |
| HTML 体积过大 (> 200KB) | source 太多 / tier 内容太长 | 减少 source；或只生成单档 |
| init 报「learning 已存在」 | 之前跑过 | 选 Skip / Merge / Abort 之一 |
| nlm-studio 跑 7-15 min 中途报「Authentication expired」 | NLM token 寿命 15-30 min，长跑用尽 | 终端 `! nlm login` 再调；skill 已含 mid-run retry-once 兜底；仍失败重跑会走 re-run guard 的 "regenerate" 路径自动跳过已成 artifact |
| 想上传 HTML 但 nlm-studio 提示「仅 .md」 | v1.0.0 起 HTML 不上传到 NLM（dogfood 发现 NLM 拒收 HTML）| 设计如此，非 bug。HTML 仅供浏览器查看；NLM artifact 由 `.md` 内容驱动 |
| nlm-studio 跑到一半「quota exceeded」 | 当日已用过 NLM Studio quota（empirical 上限 ~20/天）| 用 Step 3.5 quota gate 的「Reduce subset」选项缩小批量；或换日重跑 |
| 同一 topic 跑两次 NLM 端看到重复 source | source_add 错误响应不可靠（dogfood finding #4）| skill 已加 notebook_get 强制核验；如真重复，用 NLM web UI 手动删；或 Step 2 选 "replace sources" |
| 同 topic 三档 mind_map 看起来差不多 | NLM 媒介对 mind_map 的 view 差异化指令无视（dogfood finding #5）| 设计决定：v1.0.0 起 mind_map 收敛为 1 shared / topic |
| `nlm login` 报错或浏览器登录失败 | OAuth flow 故障 / proxy 干扰 / token 已损 | 重跑 `nlm login`；或检查 `~/.nlm/` 目录权限；问题持续看 [notebooklm-mcp-cli upstream](https://pypi.org/project/notebooklm-mcp-cli/) |
| 工具列表同时出现 `mcp__plugin_mj-nlm_*` 和 `mcp__plugin_learn-kit_*` | 同时装了 legacy plugin 和新 learn-kit —— 两套 MCP server 重复加载 | 见 §前置依赖末尾 legacy plugin 提示 |

## 使用

### 1. 初始化项目的 learning 子系统骨架

在你的项目根目录运行：

```
/learn-kit:scaffold-learning
```

执行后会在 `<project-root>/learning/` 下创建：

```
learning/
├── INDEX.md
├── _meta/
│   └── METHODOLOGY.md           # 完整 8 阶段方法论
└── _archive/
    └── .gitkeep
```

### 2. 浏览项目可学习材料 / 反查具体概念

- 开放式：`/learn-kit:scan` — 枚举 canonical 文档（按 tag 前缀），标 interpreted vs uninterpreted，按引用频率排序
- 命名概念：`/learn-kit:locate <query>` — 反查 [LEARNING] / canonical 文档，支持中英 mnemonic / partial doc title / §X.Y section anchor

### 3a. 手工流：按 METHODOLOGY 8 阶段写

- 通读 `learning/_meta/METHODOLOGY.md`（8 阶段方法）
- 参考 worked example：`<plugin-root>/skills/scaffold-learning/references/rfc-2119-keywords-pedagogy.md`（应用 8 阶段到 RFC 2119 的完整示范）
- `mkdir learning/<topic-slug>/`
- 按 8 阶段方法论编写 `learning/<topic-slug>/[LEARNING]_<Source>_<Aspect>.md`

命名 / 路径 / frontmatter 规范见 `METHODOLOGY.md §9`。

### 3b. AI 流：用 generate-tier 一键产出三档学习文档

```
/learn-kit:generate-tier
```

skill 会按以下顺序与你交互（10-step workflow，自 v1.0.0 起含 step 9 NLM 询问）：

1. **Source**（多选）：项目内文件路径 / 复用 scan-locate 发现 / 用户粘贴长文本 / 整目录扫描
2. **Tiers**（多选，默认全选）：零基础 foundation / 结构 structural / 挑战 challenge
3. **Topic**（单选 / 输入）：确认 topic 文件夹名 + 冲突策略
4. **Generate**：生成 `learning/<topic>/[LEARNING]_<topic>_<view>.md`
5. **HTML?**（单选 yes/no，默认 yes）：是否再为每档渲染交互式 HTML
6. **NLM?**（v1.0.0 新增 / 单选 yes/no，默认 skip）：是否进一步推到 NotebookLM 出多媒体 artifact

### 4. 可选 HTML 学习页

generate-tier step 8 会为每个 tier markdown 生成同目录、同 basename 的 `.html` 文件：

```
learning/hitl/
├── [LEARNING]_HITL_foundation.md
├── [LEARNING]_HITL_foundation.html
├── [LEARNING]_HITL_structural.md
├── [LEARNING]_HITL_structural.html
├── [LEARNING]_HITL_challenge.md
└── [LEARNING]_HITL_challenge.html
```

HTML 单文件离线可看，含 SVG 流程图、语法高亮代码块、Tab 切换、`<details>` 折叠、"复制为 Prompt" 按钮、亮 / 暗主题切换、浮动目录跟随。每个概念 spawn Explore subagent 反查仓库实际代码 (file:line+snippet)，确保不空泛。

Windows 下 `start <file>` 直接打开预览。

### 5. NLM 多媒体（v1.0.0 新增）

```
/learn-kit:nlm-studio <topic>
```

把 `learning/<topic>/` 下的 3 个 markdown 文件上传到 `learn-kit:<topic>` notebook（HTML 不上传 — v1.0.0 dogfood 发现 NLM 对 HTML 源拒绝率高），生成 4 view-cycled 类型 × 3 view + 1 shared mind_map = 至多 13 个 artifact：

| Artifact | Foundation | Structural | Challenge |
|----------|------------|------------|-----------|
| audio | 双人深聊，故事化 + TL;DR 收尾 | 系统化概念地图 + 自检清单收尾 | 每段以挑战性提问收尾 |
| video | 5-pack TL;DR on-screen 双模收尾 | 结构图框架 + 自检清单 | 反例对比 + 未答问题收尾 |
| slide_deck | 类比 + 5-pack TL;DR 收 | 层级图 + 比较表 + 自检 | 70% 反例 + 对比 + 开放问题收 |
| infographic | 每板 ≤7 数字 + 生活化图标 | 维度对照 + 层级图 | 看似 X / 实际 Y 对比 |
| mind_map | （单一 shared，view-agnostic：dogfood 发现 NLM 对 mind_map 媒介无视 view 差异化指令；3 层径向 ≤ 50 节点） |

调用流程（5 步 + 中间 refresh_auth）：
1. **Pre-flight**：检 3 必需 .md + refresh_auth + server_info（本地）+ notebook_list（真 auth gate）
2. **Re-run guard**：若同名 notebook 存在 → 4 选 1（regenerate / replace sources / new-timestamped / abort）
3. **Notebook setup**：3 个 source_add（parallel）+ notebook_get 强制核验真实 source 列表
4. **Quota confirm gate**：明示「13 artifact ≈ 65% 日上限，本 skill 看不见账户当日已用量」让用户 confirm / reduce / abort
5. **Generate**：3 parallel batches of 5/4/4（foundation 含 mind_map，structural/challenge 跳过 mind_map）；每 batch 间 refresh_auth；mid-run auth 失败 retry-once 后 abort
6. **Recap**：终端 markdown 表格 + notebook URL；零本地落盘

13 个 artifact 全在 notebooklm.google.com 在线访问。需保存请自行 bookmark。

## 方法论概览（8 阶段）

| 阶段 | 目标 |
|------|------|
| 1 Source Intake | 摸清源材料的 shape |
| 2 Framework Induction | 从规则中诱出 3–7 个抽象轴 |
| 3 Categorical Alignment | 让分类一一对仗轴 |
| 4 Asymmetry Handling | 处理非对称（危险源 vs 安全来源等）|
| 5 Terminology Pairing | 业内英文术语 + 本地比喻名成对 |
| 6 Metaphor Unification | 选定单一比喻世界 |
| 7 Page Assembly | TL;DR → 框架 → 细节 → 图 → 口诀 |
| 8 Quality Gates | 出 6 类典型失真前自检 |

每阶段配「目标 / 原则 / 示例片段 / 反例 / 检查清单」5 件。

## 治理边界

`learn-kit` v1.0.0：

- 8 阶段方法论由用户读 `METHODOLOGY.md` 后**手动**应用（手工流）
- generate-tier 提供 AI 生成三档学习文档 + HTML（AI 流）
- nlm-studio 提供 NotebookLM 多媒体生成（外部依赖：`notebooklm-mcp` MCP server + nlm login）
- 验证用 `markdownlint` 等通用 markdown 工具

## 与项目主治理框架的关系

`learning/` 子系统是**项目主治理框架的并行子系统**：

- 共享底层（markdown 语法 OB1-OB6 / heading / list / table 等）
- 自管上层（命名 `[LEARNING]_*` / 路径 `learning/<topic>/` / frontmatter schema 等）

详见 `METHODOLOGY.md §9` + `§11`。

## 学习材料 / 用户文档

`docs/guide/` 子目录含 2 份合规教学文档（v1.2.0 起从原 6 份 lowercase 教学系列合并而来）:

| 文档 | 用途 |
|------|------|
| [docs/guide/[GUIDE]_LearnKit_Pedagogy.md](./docs/guide/[GUIDE]_LearnKit_Pedagogy.md) | **教学合卷** — 定位 + 8 阶段方法论 + RFC 2119 worked example + 6 类质量门 / 8 反模式；新读者 30 分钟掌握 learn-kit 全部教学层面 |
| [docs/guide/[GUIDE]_LearnKit_Design.md](./docs/guide/[GUIDE]_LearnKit_Design.md) | **设计合卷** — 5 skill 分工 + 闭环 + dogfood findings + parallel subsystem 治理模型 + frontmatter / INDEX / 归档规则 + v1.0.0 依赖矩阵 + 版本演化策略 |

推荐阅读顺序:

- **新用户**：本 README 「中文 TL;DR」+「5 分钟上手」+「使用案例」+「常见踩坑」即可上手
- **想深入方法论**：[GUIDE]_LearnKit_Pedagogy.md
- **想理解 skill 设计与治理决策**：[GUIDE]_LearnKit_Design.md
- **理解 v4.0.0 NLM 收编决策**：`docs/adr/[ADR]_NotebookLM_Kit_Retirement.md`（marketplace 顶级 ADR）

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
| **v1.2.0** | plugin-internal docs 重组（6 教学系列 → 2 份 [GUIDE]）；marketplace v4.5.0 Framework v1.5 §1 取消豁免配套 |
