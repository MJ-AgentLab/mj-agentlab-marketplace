# CLAUDE.md — learn-kit Plugin

learn-kit 是一个通用 Claude Code 插件，提供把枚举型规则清单（RFC keyword lists、安全策略、API style guides、STANDARD/POLICY 文档）转化为人类可学习决策框架文档的 8 阶段方法论 + 模板 + scaffold 命令；支持基于「用户问题 + 上传文档」AI 生成三档（零基础 / 结构 / 挑战）reading-tier 学习文档与配套交互式 HTML；并支持把三档学习文档（**仅 markdown**）作为 source 推到 NotebookLM 生成多媒体 artifact（4 类 view-cycled: audio + video + slide_deck + infographic × 3 view + 1 shared mind_map = 至多 13 个在线可看的制品；HTML 不上传，仅用于人类浏览器查看）。

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
- **`skills/nlm-studio/SKILL.md`** — **v1.0.0 新增** — `/learn-kit:nlm-studio <topic>` 把 `learning/<topic>/` 的 3 tier .md 推到 NotebookLM 出 13 个多媒体 artifact（4 view-cycled × 3 + 1 shared mind_map）
- `skills/nlm-studio/templates/{view-foundation,view-structural,view-challenge,artifact-audio,artifact-video,artifact-slide_deck,artifact-mind_map,artifact-infographic,interaction-overrides}.md` — 9 个 prompt 模板组合（3 view × 4 view-cycled artifact = 12 cells + 1 view-agnostic mind_map；interaction-overrides 覆盖 4 个 view × artifact 联合 cell）

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

把 `learning/<topic>/` 下的 3 个 .md 文件作为 NotebookLM source 上传到一个名为 `learn-kit:<topic>` 的 notebook，再生成 4 view-cycled 类型 × 3 view + 1 shared mind_map = 至多 13 个 multimedia artifact。view-cycled 的 4 类（audio / video / slide_deck / infographic）通过组合「view-prefix + artifact-suffix + interaction-override」三段式 focus_prompt 严格继承源 view 的教学目的；mind_map 单独 1 个（view-agnostic，因 dogfood 发现 NLM 对 mind_map 的 view 差异化无视）。

**HTML 不上传**：v1.0.0 dogfood 发现 NLM 对 HTML 源（file 模式与 text 模式均）拒绝率高且 error 响应不可靠。HTML 仅用于人类浏览器查看；`/learn-kit:generate-tier` 仍可生成 HTML。

**关键质量原则 View-Purpose Preservation**：foundation/structural/challenge 的 audio 不能听起来一样。foundation audio 以日常类比开场 + 5 条 TL;DR 结尾；challenge audio 每段以挑战性提问结尾；structural audio 以系统化概念地图为主轴。视频/幻灯/信息图同理。Mind_map 因 NLM 媒介本身的限制，不强求 view 差异化。SKILL.md 内置 failsafe 校验 view-prefix 模板的 5 段结构（§1-§5）完整性，缺则 abort。

**零本地落盘**：13 个 artifact 全在 notebooklm.google.com 在线访问；skill 只把 URL 表格打到终端，不动 INDEX.md，不下载二进制。

**Step 3.5 Quota confirm gate**：13 artifact ≈ 65% NLM Studio empirical 日上限（~20/天）。本 skill 没有 API 能查账户当日已用量；调用前显式 AskUserQuestion 让用户在「Confirm all 13 / Reduce subset / Abort」三选，避免半路 quota 失败。

**Per-step auth refresh**：dogfood 发现 NLM token 寿命短（15-30 min 内可能耗尽），SKILL.md 在每个 Step 起始 refresh_auth；Step 1 用 notebook_list 作真 auth gate（refresh_auth + server_info 是本地检查不充分）；mid-run auth 失败 retry-once 后再 abort。

**Source 上传后强制验证**：dogfood 发现 source_add 错误响应不可靠（服务端可能 async 成功）。SKILL.md 在 3 个 source_add 后强制 notebook_get 核验真实状态。

**Re-run guard**：同名 notebook 存在则 4 选 1（regenerate / replace sources / new-timestamped / abort）；regenerate 路径用 `studio_status` 查已存在的 (type, view) 对跳过 —— CTRL+C 半途中断后重跑能续上。

## 治理边界

`learning/` 子系统是**项目主治理框架的并行子系统**：

- 共享底层（markdown 语法 OB1-OB6）
- 自管上层（命名 `[LEARNING]_*` / 路径 `learning/<topic>/` / frontmatter schema）
- v1.0.0 起 nlm-studio 引入外部 MCP server 依赖；其他 4 个 skill（init / locate / scan / generate-tier）仍然零外部依赖

详见 `skills/init/templates/METHODOLOGY.md` §9（Subsystem Meta-Rules）+ §10（Optional Integrations）。

## Documentation

v1.1.0 起 plugin-internal documentation 遵循 marketplace 文档框架（v1.2.0 起对应 Framework v1.5；适配为 `scope: learn-kit`）。完整索引见 [docs/INDEX.md](docs/INDEX.md)。

子目录:

- [`docs/adr/`](docs/adr/) — plugin-internal ADRs（如 `[ADR]_LearnKit_Discovery_Skills.md`）
- [`docs/guide/`](docs/guide/) — plugin-internal GUIDEs：
  - [`[GUIDE]_LearnKit_Pedagogy.md`](docs/guide/[GUIDE]_LearnKit_Pedagogy.md) — 教学合卷（定位 + 8 阶段方法论 + RFC 2119 worked example + 6 类质量门）
  - [`[GUIDE]_LearnKit_Design.md`](docs/guide/[GUIDE]_LearnKit_Design.md) — 设计合卷（5 skill 分工 + dogfood findings + 治理模型 + frontmatter 规则 + 版本演化）
- [`docs/spec/`](docs/spec/) — plugin-internal SPECs（暂无；schema 工作目前在 `skills/init/templates/METHODOLOGY.md`）

v1.2.0 起原 6 份 `docs/learn-kit-*.md` lowercase 数字教学系列已合并为以上 2 份合规 `[GUIDE]_*.md`（Framework v1.5 §1 取消 v1.1 教学系列模式豁免配套）。

## Advanced Tips（power-user 提示，源自 v1.0.0 dogfood）

- **多选混搭 source**：`generate-tier` step 2 可同时勾「项目内文件路径 + 用户粘贴」，用 paste 补充上下文
- **tier 跳跃**：可以先只生成 foundation 看效果，再追加 structural / challenge（重跑 skill 时选「Append `.v2`」或 Overwrite）
- **跨项目 dogfood**：learn-kit 通用，可在任意外部项目装；记得在外部项目的 CLAUDE.md 声明 `[STANDARD]_/[SPEC]_/...` tag prefix 提高 scan/locate 识别 confidence
- **HTML 阅读体验优化**：30 分钟深读为目标设计；浮动 ToC + 复制为 Prompt 按钮可加速延伸学习
- **NLM 多媒体节奏建议**：13 artifact 占当日 NLM Studio quota 65%——一天最多深做 1 个 topic；多 topic 分日跑更稳。Step 4 的 mid-run auth retry-once 只兜底单次过期，长跑前先 `nlm login` 一遍刷新 token 更稳
- **NLM artifact 持久化**：skill **不**本地落盘 URL；想长期追溯请自己在浏览器加 bookmark 或在外部笔记里记 notebook URL + artifact ID
- **View-Purpose 盲测**：跑完 13 artifact 后挑同一 type 的三档（如 audio_foundation / audio_structural / audio_challenge），让一个没看过 view 标签的旁人听后猜哪是哪——3/3 正确是健康；如果分不清，回去看 generate-tier 三档 markdown 是否本身差异化不足

## NLM 集成 · 工具前缀

`.mcp.json` 注册 `notebooklm-mcp` MCP server。Claude Code 加载后，MCP 工具命名规则为：

```
mcp__plugin_<plugin.json-name>_<.mcp.json-server-key>__<tool>
```

代入：plugin name = `learn-kit`, server key = `notebooklm-mcp`，所以 nlm-studio SKILL.md 的 `allowed-tools` 字段全部使用 `mcp__plugin_learn-kit_notebooklm-mcp__*` 前缀（refresh_auth / server_info / notebook_list / notebook_get / notebook_create / source_add / source_delete / studio_create / studio_status）。

之前 v3.x marketplace 中工具前缀挂在 `notebooklm-kit`（即 `mcp__plugin_notebooklm-kit_notebooklm-mcp__*`）；v4.0.0 起 `.mcp.json` 迁到 learn-kit 后前缀随之变化。
