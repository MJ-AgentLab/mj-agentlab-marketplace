---
type: "template"
domain: "LEARN"
summary: "NotebookLM 制品元信息记录 markdown 模板（schema 与 notebooklm-kit 上游同步）"
tags:
  - "template"
  - "learning"
  - "nlm"
  - "metadata"
aliases:
  - "TEMPLATE_NLM_NOTEBOOK_RECORD"
  - "NLM Notebook Record Template"
created: "2026-05-11"
updated: "2026-05-11"
state: "active"
version: "v0.1"
---

# TEMPLATE — NLM Notebook Record（NotebookLM 制品元信息记录范式）

> **来源**：本文件 schema 同步自 `notebooklm-kit` 插件 `skills/_shared/artifact-metadata-template.md`。落盘到项目 `learning/_meta/` 而非引用插件 cache 路径，避免 cache 失效时模板不可读。
>
> **同步策略**：notebooklm-kit 发布新 minor / major 版本后，按文末 §同步策略 覆盖更新本文件三段（schema / body 范式 / 完整模板）。
>
> **可选性**：本模板**仅在与 `notebooklm-kit` 插件配套使用时需要**。若你不使用 NotebookLM 集成，可保留本文件不动（无害），或从 `learning/_meta/` 删除。

## 用途

每生成一个 NotebookLM Studio 制品（artifact），项目侧**仅留一份 record markdown** 落盘到 `learning/<topic>/_nlm/<artifact>.md`：

- 不复述制品内容（让用户在线读 NotebookLM）
- 仅记录访问入口、focus prompt 关键参数、与项目侧学习文档的双向关联
- 大小约束：**body ≤ 50 行**（不含 frontmatter）

适用方向：

- `learning/<topic>/_nlm/<artifact>.md`（与 `[LEARNING]_*.md` 同级）
- 任何需要把 NLM 在线产物登记进 git 而不污染 binary 的场景

## 生成入口（推荐）

| 入口 | 用途 | 透传旗标 |
|---|---|---|
| `/notebooklm-kit:learn-make <topic>` | 生成学习资料 wrapper（编排 build + studio 上游 7 类制品） | `--triple-view` / `--with-download` / `--download-only` / `--resume` |
| `/notebooklm-kit:learn-test <notebook_id>` | 生成考察资料 wrapper（quiz + flashcards 默认锁定） | `--full` / `--rootcause` / `--selfcheck` / `--sourcecheck` |
| `/notebooklm-kit:studio --mode record` | 单步生成单类制品（advanced） | 直传 studio 全旗标 |

---

## Frontmatter Schema

```yaml
---
type: "nlm-artifact-record"           # 固定值，便于检索
notebook_id: "<uuid>"                 # NotebookLM notebook ID
notebook_title: "<your-naming-scheme>"  # build skill 命名（建议 `<project>-<scope>-<topic>-<YYYYMMDD>`）
artifact_id: "<artifact uuid 或 unknown>"     # 若 API 不返回则填 unknown
artifact_type: "audio"                # 9 种之一：audio | video | infographic | slide_deck | report | flashcards | quiz | data_table | mind_map
view: "default"                       # default | foundation | structural | challenge
notebook_url: "https://notebooklm.google.com/notebook/<id>"
artifact_url: "<notebook_url 同值或 NLM 暴露的 artifact 直链>"
sources_count: 0                      # 生成时 notebook 拥有的 source 数
focus_prompt_summary: "<1 行说明本制品 prompt 主题>"
guardrails_enabled: true
created: "YYYY-MM-DDTHH:MM:SSZ"       # ISO8601 UTC
expires: "unknown"
related_learning_doc: "[[../[LEARNING]_*]]"  # 项目侧关联学习文档（可空）
state: "active"                       # active | archived
version: "v1.0"                       # record markdown 自身版本（与 NLM 制品无关）
---
```

### 字段填写规则

| 字段 | 来源 | 备注 |
|---|---|---|
| `notebook_id` / `notebook_title` | `notebooklm-kit` build skill | 建议命名 `<project>-<scope>-<topic>-<YYYYMMDD>` |
| `artifact_id` | studio_status() 返回 | NotebookLM 当前不保证暴露；未拿到填 `unknown` |
| `artifact_type` / `view` | studio_create 调用参数 | 9 种 × 4 view |
| `artifact_url` | 回退方案：与 `notebook_url` 同值 | 若 NLM 后续暴露 artifact-level URL，可由 studio 自动填实 |
| `sources_count` | notebook_describe() 返回 | source 列表长度 |
| `focus_prompt_summary` | studio prompt 拼接摘要 | 只写一行，不复述完整 prompt |
| `guardrails_enabled` | `not disable_guardrails` | high-risk tag 强制 true |
| `related_learning_doc` | 学习子系统路径 | 双向 wikilink |

---

## Body 范式（≤ 50 行）

```markdown
# <Notebook 标题> · <Artifact Type> (<view>)

## 主题（2-3 行）

<本制品要解释什么 / 解决什么学习问题，1-3 句话>

## 在线访问

- [打开 NotebookLM](<artifact_url 或 notebook_url>)
- 在 notebook 内定位本制品：在 NotebookLM 的 Studio 面板中按 `<artifact_type>` + 标题 `<生成时使用的标题>` 找到
- 若链接失效：搜 notebook 标题 `<notebook_title>` 重新打开

## Focus Prompt（关键参数，不复述全文）

- 学习视角：<view>
- 锚定 source：<source 名>
- 防护约束：<enabled / disabled + 原因>
- 子参数（如适用）：<audio_format=brief / report_format=Briefing Doc / ...>

## 与项目的关系

- 解读对象：<wikilink 或 source 路径>
- 衍生学习文档：<[[../[LEARNING]_*]]>
- 来源 sources 概要（≤ 5 项要点）：
  - <source 1 简介>
  - <source 2 简介>

## 变更历史

- v1.0 / YYYY-MM-DD：初次记录
```

**约束**：

- ≤ 50 行 markdown body（不含 frontmatter）
- 不复述 NotebookLM 已生成的完整内容（让用户在线读）
- 仅记录**元信息 + 项目侧链接 + 一行学习意图**

---

## 命名与存放

### 文件命名

`<artifact_type>-<view>-<short-topic>.md`

例：

- `audio-foundation-overview.md`
- `slide_deck-default-rules.md`
- `mind_map-default-architecture.md`

### 存放路径

`learning/<topic>/_nlm/<file>.md`

`_nlm/` 子目录把元信息文件与正式 `[LEARNING]_*.md` 区分开，便于 archive。

---

## 与 learning 子系统对齐

learning 子系统约束：

- ✅ markdown 学习文档进 git（团队共享）
- ❌ mp3 / mp4 / pdf 等二进制**永不入 git**（17–55MB / 单文件）
- ✅ NotebookLM 产物**全部在线托管**

本模板与该约束的对齐点：

| 学习子系统侧 | 本模板侧 |
|---|---|
| `learning/<topic>/_nlm/<artifact>.md` 路径 | studio Phase 4 record mode 默认输出位置 |
| record markdown frontmatter `type: nlm-artifact-record` | 本模板 `type` 字段固定值 |
| `related_learning_doc: [[../[LEARNING]_*]]` | 本模板对应字段 |
| `state: active / archived` | 本模板 `state` 字段 |

### 双向 wikilink

- record → learning：`[[../[LEARNING]_*]]`
- learning → record：`[[./_nlm/<artifact>]]`

---

## 完整可复制模板

```markdown
---
type: "nlm-artifact-record"
notebook_id: "<uuid>"
notebook_title: "<your-project-scope-topic-YYYYMMDD>"
artifact_id: "unknown"
artifact_type: "<audio | video | infographic | slide_deck | report | flashcards | quiz | data_table | mind_map>"
view: "<default | foundation | structural | challenge>"
notebook_url: "https://notebooklm.google.com/notebook/<id>"
artifact_url: "https://notebooklm.google.com/notebook/<id>"
sources_count: 0
focus_prompt_summary: "<1 行 prompt 主题>"
guardrails_enabled: true
created: "<YYYY-MM-DDTHH:MM:SSZ>"
expires: "unknown"
related_learning_doc: ""
state: "active"
version: "v1.0"
---

# <Notebook 标题> · <Artifact Type> (<view>)

## 主题

<2-3 行>

## 在线访问

- [打开 NotebookLM](<URL>)
- 在 notebook 内定位本制品：Studio 面板 → `<artifact_type>` → 标题 `<标题>`
- 若链接失效：搜 notebook 标题 `<notebook_title>`

## Focus Prompt（关键参数）

- 学习视角：<view>
- 锚定 source：<source 名>
- 防护约束：<enabled | disabled + 原因>
- 子参数：<...>

## 与项目的关系

- 解读对象：<link>
- 衍生学习文档：<link>
- 来源 sources 概要：
  - <...>

## 变更历史

- v1.0 / <YYYY-MM-DD>：初次记录
```

---

## 同步策略

notebooklm-kit 发布新版本（minor 或 major）后：

1. 检查上游 `notebooklm-kit/skills/_shared/artifact-metadata-template.md` 是否有 schema 字段变更
2. 如有变更：把上游内容覆盖本文件 schema / body 范式 / 完整可复制模板三段
3. 更新本文件 frontmatter `updated` 日期 + `version`（v0.1 → v0.2 等）

---

## 版本历史

- **v0.1**（2026-05-11）：通用模板初版（从 mj-system `learning/_meta/TEMPLATE_NLM_NOTEBOOK_RECORD.md` v1.2 剥离 MJ-specific 引用后通用化；改 mj-nlm 引用为 notebooklm-kit）
