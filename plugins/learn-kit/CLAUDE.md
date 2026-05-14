# CLAUDE.md — learn-kit Plugin

learn-kit 是一个通用 Claude Code 插件，提供把枚举型规则清单（RFC keyword lists、安全策略、API style guides、STANDARD/POLICY 文档）转化为人类可学习决策框架文档的 8 阶段方法论 + 模板 + scaffold 命令；支持基于「用户问题 + 上传文档」AI 生成三档（零基础 / 结构 / 挑战）reading-tier 学习文档与配套交互式 HTML；并支持把三档学习文档作为 source 推到 NotebookLM 生成多媒体 artifact（audio / video / slide / mind_map / infographic × 3 view = 至多 15 个在线可看的制品）。

## 上下文

- **起源**：从 mj-system 项目的 `learning/_meta/[LEARNING]_Rule_List_Interpretation_Authoring.md` v2.0 STANDARD-tier 方法论（N=5 跨域验证）剥离 MJ 引用通用化而来
- **定位**：通用、外部项目可独立采纳、无 MJ 上下文假设
- **v1.0.0 起的依赖**：nlm-studio skill 需要 notebooklm-mcp MCP server（由本插件 `.mcp.json` 自动注册）+ 一次性 `nlm login`（用户在终端运行）。其他 4 个 skill（init / locate / scan / generate-tier）零外部依赖

## 插件内容

5 个 skill：

- `skills/init/SKILL.md` — `/learn-kit:init` 命令（scaffold，`disable-model-invocation: true`）
- `skills/init/templates/METHODOLOGY.md` — 完整 8 阶段方法论（de-MJ-ified）
- `skills/init/templates/INDEX.md` — `learning/INDEX.md` 模板
- `skills/init/references/rfc-2119-keywords-pedagogy.md` — worked example：RFC 2119 五关键词
- `skills/locate/SKILL.md` — `/learn-kit:locate <query>` 概念反查
- `skills/scan/SKILL.md` — `/learn-kit:scan` 项目枚举
- `skills/generate-tier/SKILL.md` — `/learn-kit:generate-tier` AI 生成三档学习文档（10-step workflow，含可选 HTML 渲染 + step 9 可选 NLM artifact 询问）
- `skills/generate-tier/templates/{foundation,structural,challenge,html-renderer}.md` — 4 个 prompt 模板
- **`skills/nlm-studio/SKILL.md`** — **v1.0.0 新增** — `/learn-kit:nlm-studio <topic>` 把 `learning/<topic>/` 的 3 tier .md + 3 tier .html 推到 NotebookLM 出 15 个多媒体 artifact
- `skills/nlm-studio/templates/{view-foundation,view-structural,view-challenge,artifact-audio,artifact-video,artifact-slide_deck,artifact-mind_map,artifact-infographic,interaction-overrides}.md` — 9 个 prompt 模板组合（3 view × 5 artifact，加上 5 个 view × artifact 联合 override）

加 `.mcp.json` 一份（注册 `notebooklm-mcp` server）。

## 触发 `/learn-kit:init`

在项目根运行 `/learn-kit:init`，会创建：

```
learning/
├── INDEX.md
├── _meta/
│   └── METHODOLOGY.md
└── _archive/.gitkeep
```

用户随后按 METHODOLOGY 8 阶段方法**手动**编写 `learning/<topic>/[LEARNING]_*.md`（手工流），或用下面的 generate-tier 走 AI 生成流。

## 触发 `/learn-kit:generate-tier`

输入「用户问题 + 上传文档」+ 多选三档（零基础 / 结构 / 挑战）后，AI 直接生成 markdown 学习文档落到 `learning/<topic>/[LEARNING]_<topic>_<view>.md`。可选 step 8 再为每档渲染交互式单文件 HTML 学习页（同目录、同 basename、`.html` 扩展名）。

源材料 4 种来源混用：项目内文件路径 / 复用 scan-locate 发现 / 用户粘贴长文本 / 整目录扫描。HTML 渲染 spawn Explore subagent 做「概念 ↔ 仓库代码」grounding，确保每个概念挂真实 file:line+snippet。

**v1.0.0 新增 step 9**：HTML 渲染完毕后询问用户是否调用 `/learn-kit:nlm-studio` 把三档推到 NotebookLM 出多媒体。**必须用户显式说 yes 才会触发**，默认 skip。

## 触发 `/learn-kit:nlm-studio`（v1.0.0 新增）

```
/learn-kit:nlm-studio <topic-slug>
```

把 `learning/<topic>/` 下的 3 个 .md + 3 个 .html（HTML 缺失时 graceful degrade 到仅 3 md）作为 NotebookLM source 上传到一个名为 `learn-kit:<topic>` 的 notebook，再生成 5 类 × 3 view = 至多 15 个 multimedia artifact，每个 artifact 通过组合「view-prefix（pedagogical purpose）+ artifact-suffix（medium constraints）+ interaction-override（joint tuning）」三段式 focus_prompt 严格继承源 view 的教学目的。

**关键质量原则 View-Purpose Preservation**：foundation/structural/challenge 的 audio 不能听起来一样。foundation audio 以日常类比开场 + 5 条 TL;DR 结尾；challenge audio 每段以挑战性提问结尾；structural audio 以系统化概念地图为主轴。其他 4 类 artifact 同理。SKILL.md 内置 failsafe 校验三段 view-prefix 模板完整性（§1-§5 必备），缺则 abort。

**零本地落盘**：15 个 artifact 全在 notebooklm.google.com 在线访问；skill 只把 URL 表格打到终端，不动 INDEX.md，不下载二进制。

**Step 3.5 Quota confirm gate**：15 artifact ≈ 75% NLM Studio empirical 日上限（~20/天）。本 skill 没有 API 能查账户当日已用量；调用前显式 AskUserQuestion 让用户在「Confirm all 15 / Reduce subset / Abort」三选，避免半路 quota 失败。

**Re-run guard**：同名 notebook 存在则 4 选 1（regenerate / replace sources / new-timestamped / abort）；regenerate 路径用 `studio_status` 查已存在的 (type, view) 对跳过 —— CTRL+C 半途中断后重跑能续上。

## 治理边界

`learning/` 子系统是**项目主治理框架的并行子系统**：

- 共享底层（markdown 语法 OB1-OB6）
- 自管上层（命名 `[LEARNING]_*` / 路径 `learning/<topic>/` / frontmatter schema）
- v1.0.0 起 nlm-studio 引入外部 MCP server 依赖；其他 4 个 skill（init / locate / scan / generate-tier）仍然零外部依赖

详见 `skills/init/templates/METHODOLOGY.md` §9（Subsystem Meta-Rules）+ §10（Optional Integrations）。

## NLM 集成 · 工具前缀

`.mcp.json` 注册 `notebooklm-mcp` MCP server。Claude Code 加载后，MCP 工具命名规则为：

```
mcp__plugin_<plugin.json-name>_<.mcp.json-server-key>__<tool>
```

代入：plugin name = `learn-kit`, server key = `notebooklm-mcp`，所以 nlm-studio SKILL.md 的 `allowed-tools` 字段全部使用 `mcp__plugin_learn-kit_notebooklm-mcp__*` 前缀（refresh_auth / server_info / notebook_list / notebook_get / notebook_create / source_add / source_delete / studio_create / studio_status）。

之前 v3.x marketplace 中工具前缀挂在 `notebooklm-kit`（即 `mcp__plugin_notebooklm-kit_notebooklm-mcp__*`）；v4.0.0 起 `.mcp.json` 迁到 learn-kit 后前缀随之变化。
