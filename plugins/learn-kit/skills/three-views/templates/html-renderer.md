# HTML Learning Page Renderer · Dual-Mode Grounding Prompt Template

## INSTRUCTIONS TO CLAUDE (skill-internal preamble — do NOT include in rendered output)

Substitute these placeholders before executing the PROMPT BODY:

- `{tier_md_content}` — the full markdown of the just-generated tier doc
- `{repo_path}` — absolute path of the current working directory (defaults to cwd; may not be a git repo)
- `{grounding_mode}` — `repo-code` | `source-evidence` | `mixed` (decided by SKILL.md Step 5A based on source_manifest contents + `.git/HEAD` Glob existence)
- `{concept_to_code_map_json}` — JSON array returned by the Explore subagent (concept ↔ file:line+snippet+why) **only populated in repo-code or mixed mode**; in source-evidence mode this is `[]`
- `{source_manifest_json}` — JSON of source_manifest from SKILL.md Step 2 (always populated; structure: `[{id, kind, locator/path, line/char range, title?, ...}]`)
- `{topic_name}` — topic slug
- `{view}` — `foundation` | `structural` | `challenge`
- `{output_path}` — `<output_dir>/[LEARNING]_<topic>_<view>.html`

### Grounding mode decision (SKILL.md decides BEFORE calling this template)

| `{grounding_mode}` | When SKILL.md chooses it | Behavior |
|--------------------|--------------------------|----------|
| `repo-code` | source_manifest has ≥1 `file` kind AND `.git/HEAD` Glob succeeds (cwd is git repo) | Spawn Explore subagent for concept→code grounding; consume `{concept_to_code_map_json}` |
| `source-evidence` | source_manifest is URL- or pasted-text-only OR cwd is not a git repo | Skip Explore subagent; use `{source_manifest_json}` as grounding evidence; render concept→source-section references |
| `mixed` | source_manifest has both file + URL/pasted AND cwd is git repo | Prefer code grounding (consume `{concept_to_code_map_json}`); fall back to source-evidence for concepts not grounded to code |

Execute the prompt body in three phases (Phase 1 摄入 → Phase 2 设计 → Phase 3 生成 HTML). Do not skip phases. Do not write the HTML file until Phase 3 completes self-check.

The PROMPT BODY explicitly forbids ASCII art for diagrams (use SVG), forbids external CDN dependencies (full offline), and requires every concept to hang on real evidence — either code (`repo-code`/`mixed`) or source section (`source-evidence`/`mixed` fallback). **Do NOT invent file paths**: if a concept has no code grounding and no source grounding, emit a `<missing-evidence/>` tag inline; do not fabricate.

After Phase 3 emits the final HTML, also emit a ≤10-line summary listing: which diagram types were used, which grounding mode was active, which key files/sources were referenced, and any concepts left as `<missing-evidence/>`.

---

## PROMPT BODY

# 角色

你是一位资深技术写作者 + 前端工程师，擅长把学习材料与真实证据（代码或源材料）融合，产出供人在 30 分钟内深度消化的单文件交互式 HTML 学习文档。

# 任务

基于 [LEARNING_DOC] + grounding 证据，生成一个 HTML 文档，目标：读完后我能 (1) 理解核心概念 (2) 在证据中精确定位到对应原文或代码 (3) 知道踩坑点 (4) 能立刻动手改/扩展或继续追问。

# 输入

- 学习文档内容（已经加载好，不必再读）：

```markdown
{tier_md_content}
```

- 当前工作目录：`{repo_path}`
- Grounding 模式：`{grounding_mode}` —— 可能是 `repo-code` / `source-evidence` / `mixed`
- 关注重点：tier `{view}` of topic `{topic_name}`

## 概念 ↔ 代码定位对照表（仅 repo-code / mixed 模式由 Explore subagent 预产出）

```json
{concept_to_code_map_json}
```

- 在 `source-evidence` 模式下，此 JSON 为空数组 `[]`，不使用。

## Source manifest（始终提供）

```json
{source_manifest_json}
```

每条 source 含 `id` (S1, S2, …) + `kind` (file/url/pasted_text) + `locator`/`path` + 可选 `line_range`/`char_count`/`title`/`fetched_at`/`content_sha256`。

- 输出位置：`{output_path}`

# 工作流（请按阶段执行，不要跳过）

## Phase 1 — 摄入（读，不要急着写）

1. 完整阅读上述学习文档内容，提取：核心概念、关键术语、原理图、可操作的最佳实践、典型错误。
2. 根据 `{grounding_mode}` 准备 grounding evidence：
   - **repo-code / mixed**：`concept_to_code_map_json` 已经给出"概念 ↔ 文件路径 + 行号 + 关键片段"对照表。**不要再自己 Glob/Grep**；直接消费这份 JSON。必要时可读取 JSON 中提到的文件以扩展上下文（但不要超出 JSON 列出的范围）。
   - **source-evidence**：使用 `source_manifest_json` 作为唯一证据来源。对每个学习文档概念，从对应 source 中找出最接近的段落 / 行范围 / 段落标题作为引用。
   - **mixed**：先尝试 code grounding；某概念在 `concept_to_code_map_json` 中 `file=null` 时退回 source-evidence。
3. 如发现学习文档中提到的概念**任何一种 grounding 都没有命中**，单独记录，进入"文档 vs 证据"段；在 HTML 中用 `<missing-evidence concept="<name>"/>` 占位，**不虚构 file path 或 source line**。

## Phase 2 — 设计（先想清楚再写）

明确三件事再开工：

- 读者画像：这是给谁看？什么场景？（结合 `{view}` 推断：foundation = 第一次接触；structural = 已有印象想建结构；challenge = 想挑战盲区）
- 阅读路径：线性叙事？双栏对照？还是探索式导航？
- Must-take-away：读者必须带走的 3–5 条核心结论是什么？

## Phase 3 — 生成 HTML（自检完再交付）

# 输出要求

## 结构（必须包含）

- 单 HTML 文件，CSS/JS 内嵌，离线可看；**不允许任何外链 CDN**（包括字体、highlight.js、图标库等）。
- 头部：标题 / TL;DR（3–5 条） / 预估阅读时长 / 锚点目录 / **顶部 badge 标注当前 grounding mode**（repo-code / source-evidence / mixed）。
- 主体每章节统一三段式：**概念 → 证据 → 易错点/最佳实践**。
  - "证据"段在 `repo-code` 模式呈现为代码块（含 file path + line numbers + snippet）；在 `source-evidence` 模式呈现为引用块（含 source id + 原文摘录 + locator/path link）；在 `mixed` 模式按概念逐条择优呈现。
- 底部：参考链接（学习文档 anchor + 证据条目）、生成时间、grounding mode 总结。

## 视觉表达（**避免 Markdown 能做到的事**，至少用 3 种）

- SVG 画流程图 / 架构图 / 时序图（**不要用 ASCII 画图**）
- 带语法高亮的代码块（**手写 token 着色**，不引外部 highlight.js）
- `<details>` 折叠的"深入挖掘"区块
- Tab 切换对比多方案 / 多实现 / 多 source 引用
- 表格呈现参数、配置、对比矩阵
- 行号高亮 + 内联批注（hover 显示）
- 语义色徽章（warning / success / info / deprecated / missing-evidence）

## 交互（至少包含 2 项）

- 浮动目录跟随阅读位置高亮（scroll-spy）
- 每个代码块 / 引用块一键复制按钮
- **"复制为 Prompt" 按钮**：把当前章节的概念 + 证据 + grounding mode 信息打包成一段可直接粘回 Claude Code 继续追问的提示词
- 若涉及参数调优：滑块/输入框 + 实时预览
- 亮 / 暗主题切换（默认跟系统）

## 设计约束

- 中文优先排版：line-height ≥ 1.7，正文 15–16px，中英文混排留白合理。
- 响应式：768px 断点要可读。
- 风格克制、信息为先；不用花哨渐变；优先系统字体栈（`-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`）。
- 语义色不超过 5 种；代码块 / 引用块与正文要有清晰对比。

## 内容质量红线

- **每个概念必须挂一个真实证据**：
  - `repo-code` / `mixed`（代码命中）：file path + 行号 + snippet（来自 `concept_to_code_map_json`）
  - `source-evidence` / `mixed`（fallback）：source id + 原文摘录 + locator/path（来自 `source_manifest_json`）
- **不要泛泛而谈**，不要复述学习文档全文；做"提炼 + 联动 + 补强"。
- 易错点要写出：踩坑场景 / 症状 / 修复方式。
- 若学习文档与证据有差异（如 `repo-code` 中 file=null 的概念），单独列一节"文档 vs 证据"。
- **不编造 JSON / source_manifest 中不存在的文件、函数、参数、原文段落**。`<missing-evidence/>` 占位是允许的，虚构是禁止的。

# 完成后

1. 将文件写入 `{output_path}`。
2. 输出一份 ≤ 10 行的总结：
   - 用了哪些图
   - 当前 grounding mode
   - 引用了哪些关键文件 / source id
   - 学习文档中提到但 grounding 未命中的概念清单（即 `<missing-evidence/>` 实际出现位置）
