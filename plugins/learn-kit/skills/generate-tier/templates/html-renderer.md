# HTML Learning Page Renderer Prompt Template

## INSTRUCTIONS TO CLAUDE (skill-internal preamble — do NOT include in rendered output)

Substitute these placeholders before executing the PROMPT BODY:

- `{tier_md_content}` — the full markdown of the just-generated tier doc
- `{repo_path}` — absolute path of the project root
- `{concept_to_code_map_json}` — JSON array returned by the Explore subagent (concept ↔ file:line+snippet+why)
- `{topic_name}` — topic slug
- `{view}` — `foundation` | `structural` | `challenge`
- `{output_path}` — `learning/<topic>/[LEARNING]_<topic>_<view>.html`

Execute the prompt body in three phases (Phase 1 摄入 → Phase 2 设计 → Phase 3 生成 HTML). Do not skip phases. Do not write the HTML file until Phase 3 completes self-check.

The PROMPT BODY explicitly forbids ASCII art for diagrams (use SVG), forbids external CDN dependencies (full offline), and requires every concept to hang on a real code reference from `{concept_to_code_map_json}`. Do not invent code references that are not in the JSON.

After Phase 3 emits the final HTML, also emit a ≤10-line summary listing: which diagram types were used, which key files were referenced, and any concepts mentioned in the tier markdown that the JSON could not ground (file=null cases).

---

## PROMPT BODY

# 角色

你是一位资深技术写作者 + 前端工程师，擅长把学习材料与真实代码融合，产出供人在 30 分钟内深度消化的单文件交互式 HTML 学习文档。

# 任务

基于 [LEARNING_DOC] 和 [REPO_PATH]，生成一个 HTML 文档，目标：读完后我能 (1) 理解核心概念 (2) 在本仓库精确定位到对应实现 (3) 知道踩坑点 (4) 能立刻动手改/扩展。

# 输入

- 学习文档内容（已经加载好，不必再读）：

```markdown
{tier_md_content}
```

- 实际仓库路径：`{repo_path}`
- 关注重点：tier `{view}` of topic `{topic_name}`
- 概念 ↔ 代码定位对照表（已由 Explore subagent 预产出）：

```json
{concept_to_code_map_json}
```

- 输出位置：`{output_path}`

# 工作流（请按阶段执行，不要跳过）

## Phase 1 — 摄入（读，不要急着写）

1. 完整阅读上述学习文档内容，提取：核心概念、关键术语、原理图、可操作的最佳实践、典型错误。
2. 上面 `concept_to_code_map_json` 已经给出"概念 ↔ 文件路径 + 行号 + 关键片段"对照表。**不要再自己 Glob/Grep**；直接消费这份 JSON。
3. 必要时可读取 JSON 中提到的文件以扩展上下文（但不要超出 JSON 列出的范围）。
4. 如发现学习文档中提到的概念在 JSON 中 `file=null`（即该概念在仓库里没有对应实现），单独记录，进入"文档 vs 实现"段。

## Phase 2 — 设计（先想清楚再写）

明确三件事再开工：

- 读者画像：这是给谁看？什么场景？（结合 `{view}` 推断：foundation = 第一次接触；structural = 已有印象想建结构；challenge = 想挑战盲区）
- 阅读路径：线性叙事？双栏对照？还是探索式导航？
- Must-take-away：读者必须带走的 3–5 条核心结论是什么？

## Phase 3 — 生成 HTML（自检完再交付）

# 输出要求

## 结构（必须包含）

- 单 HTML 文件，CSS/JS 内嵌，离线可看；**不允许任何外链 CDN**（包括字体、highlight.js、图标库等）。
- 头部：标题 / TL;DR（3–5 条） / 预估阅读时长 / 锚点目录。
- 主体每章节统一三段式：**概念 → 仓库实例 → 易错点/最佳实践**。
- 底部：参考链接（学习文档 anchor + 仓库文件路径）、生成时间。

## 视觉表达（**避免 Markdown 能做到的事**，至少用 3 种）

- SVG 画流程图 / 架构图 / 时序图（**不要用 ASCII 画图**）
- 带语法高亮的代码块（**手写 token 着色**，不引外部 highlight.js）
- `<details>` 折叠的"深入挖掘"区块
- Tab 切换对比多方案 / 多实现
- 表格呈现参数、配置、对比矩阵
- 行号高亮 + 内联批注（hover 显示）
- 语义色徽章（warning / success / info / deprecated）

## 交互（至少包含 2 项）

- 浮动目录跟随阅读位置高亮（scroll-spy）
- 每个代码块一键复制按钮
- **"复制为 Prompt" 按钮**：把当前章节的概念 + 代码片段 + 文件路径打包成一段可直接粘回 Claude Code 继续追问的提示词
- 若涉及参数调优：滑块/输入框 + 实时预览
- 亮 / 暗主题切换（默认跟系统）

## 设计约束

- 中文优先排版：line-height ≥ 1.7，正文 15–16px，中英文混排留白合理。
- 响应式：768px 断点要可读。
- 风格克制、信息为先；不用花哨渐变；优先系统字体栈（`-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`）。
- 语义色不超过 5 种；代码块与正文要有清晰对比。

## 内容质量红线

- **每个概念必须挂一个真实代码引用**（来自 `concept_to_code_map_json`，含 file 路径 + 行号 + snippet），不要泛泛而谈。
- 不要复述学习文档全文；做"提炼 + 联动 + 补强"。
- 易错点要写出：踩坑场景 / 症状 / 修复方式。
- 若学习文档与实现有差异（JSON 中标了 file=null 的概念），单独列一节"文档 vs 实现"。
- 不编造 JSON 中不存在的文件、函数、参数。

# 完成后

1. 将文件写入 `{output_path}`。
2. 输出一份 ≤ 10 行的总结：用了哪些图、引用了哪些关键文件、文档中提到但仓库里未实现的概念清单。
