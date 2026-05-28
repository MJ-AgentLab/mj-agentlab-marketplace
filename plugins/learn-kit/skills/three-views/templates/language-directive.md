# Output language & terminology directive

This file is appended verbatim to every artifact's `focus_prompt`
as the `===== LANGUAGE & TERMINOLOGY =====` section (both
view-cycled compositions and the shared mind_map composition).
Editing this file changes the output-language policy for all 13
artifacts per topic in a single place.

## Directive (sent verbatim to NotebookLM)

**OUTPUT LANGUAGE: 简体中文 (Simplified Chinese, zh-CN)** — 所有讲解、对白、
旁白、on-screen 文字、节点 label、章节标题都必须以普通话 / 简体中文表达。

**禁止失败模式**：不允许整段英文讲解、不允许整段英文对白、不允许 on-screen
正文以英文为主语言。如果上游 source markdown 中夹杂英文段落，请用中文复述
其内容，不要照搬英文原文成段播报。

**唯一例外**：行业标准技术术语保留英文原词（见下方 hard-constraint bullet
的完整术语清单与中英混排规则）。术语保留 ≠ 整段英文 —— 中文句子框架内嵌
入英文术语原词才是正确形态。

输出语言规则（hard constraint）：

- **主体内容用中文（简体）**呈现：包括但不限于
  - 章节标题 / heading / 段落标题
  - 解说 / 叙述 / 旁白文本（audio 对话、video 旁白）
  - slide 正文 / bullet / on-screen 文字
  - mind_map 节点 label
  - infographic panel 文字
  - 自检题 / TL;DR / 总结
- **行业标准技术术语保留英文原词**，不强行翻译为中文。例：
  - 文档治理：`frontmatter`, `schema`, `ADR`, `SPEC`, `STANDARD`,
    `RUNBOOK`, `SKILL.md`, `PR`, `track`, `canonical`, `working`,
    `legacy`, `deprecated`, `active`, `draft`, `completed`,
    `archived`
  - 格式与协议：`YAML`, `Markdown`, `JSON`, `MCP`, `MCP server`,
    `loader`, `wikilink`
  - 工程实践：`hygiene`, `governance`, `lint`, `CI`, `CD`,
    `worktree`, `branch`, `commit`, `merge`, `rebase`, `gh CLI`
  - 通用 CS：`hash`, `cache`, `enum`, `glob`, `regex`, `parser`,
    `pipeline`, `repository`
  - 不要把上述词翻成「前置元信息 / 模式 / 决策记录 / 规范文档 /
    操作手册 / 技能文件 / 拉取请求 / 轨道 / 权威 / 工作 / 遗留 /
    弃用 / ……」之类强译——读者反而会被迫做反向翻译再去查源文档
- **代码 / 文件路径 / 标识符 / 命令名 verbatim**，不翻译也不加引号。例：
  - `mcp__plugin_learn-kit_notebooklm-mcp__refresh_auth`
  - `notebook_id`, `artifact_id`, `source_id`
  - `/learn-kit:three-views`
  - `learning/<topic>/[LEARNING]_<topic>_<view>.md`
  - `docs/rule/[STANDARD]_*.md`
  - 函数 / 类 / 字段名（如 `studio_create`, `state`, `track`）
- **中英混排原则**：
  - 句子主干用中文（动词、连接词、表语）
  - 名词术语 / 标识符用英文原词
  - 不在英文词外加引号 / 书名号 / 括号——除非该词本就是引用
  - 中英之间不强制空格（NotebookLM 渲染时自动处理）

参考样例（合格的中英混排）：

> "ADR 是一次性决策记录，state 字段可以是 draft / active /
> deprecated，但绝不能用 completed —— 那是 working 四态的终态。"

> "PR 门禁分三层：A1-A6 hygiene 全 track 通用，A7-A11 agent
> 触发，A12-A14 engineering-workflow 触发。"

反面样例（错误的强译）：

> "架构决策记录是一次性决策记录，状态字段可以是草稿 / 活跃 /
> 弃用，但绝不能用完成 —— 那是工作四态的终态。"
> （把所有术语强译成中文，反而难以查回源文档）

## Why a separate file (single-source-of-truth)

This directive applies to all 13 artifacts per topic. Embedding it
in each of the 9 templates (3 view-prefix + 5 artifact-suffix + 1
interaction-overrides) would duplicate the same block 9 times and
risk drift. Keeping it as a single appended block guarantees:

1. **Consistency** — every artifact's focus_prompt gets the same
   language policy.
2. **Single-edit policy change** — to adjust the policy (e.g.,
   add more English-preserved terms, or switch to a different
   language entirely for a non-Chinese topic), edit this one file.
3. **Lower template cognitive load** — view-prefix and
   artifact-suffix templates focus purely on pedagogical purpose /
   medium format respectively, without language concerns mixed in.