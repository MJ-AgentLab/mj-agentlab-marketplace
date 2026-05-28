---
type: guide
scope: learn-kit
summary: Manual recipes preserving the v2.x learn-kit locate/scan skill algorithms — Grep+Glob templates, confidence scoring, canonical doc enumeration, citation-frequency ranking — for users post-v3.0.0 consolidation
owner: marketplace-maintainers
created: 2026-05-28
updated: 2026-05-28
state: active
version: v1.0
domain: plugin-internal
tags:
  - discovery
  - locate
  - scan
  - manual-recipe
  - post-v3.0.0
related:
  - ../../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md
  - ../adr/[ADR]_LearnKit_Discovery_Skills.md
revision: |
  2026-05-28 — v1.0: 初版。从已删除的 v2.x `skills/locate/SKILL.md` (197 LOC) + `skills/scan/SKILL.md` (228 LOC) 提炼核心算法 + 启发式 + 输出格式；用户可在任意项目内用 Grep/Glob/Read 手动执行等价工作。
---

# learn-kit Discovery Recipes (manual)

> **Why this GUIDE exists**: marketplace v6.0.0 (learn-kit v3.0.0) 把 5 个 skill 收敛为 1 个 `three-views`，**删除了 v2.x 的 `/learn-kit:locate` 和 `/learn-kit:scan` 两个 discovery skill**。它们的算法（不只是 grep 一下）具有保留价值：locate 含项目识别 + frontmatter 解析 + 置信度评分；scan 含 canonical doc 枚举 + 交叉引用 + 引用频率 ranking。本 GUIDE 把这两个算法以 **manual recipes** 形式记录下来，用户可以在 Claude Code 内（或任意 shell）按本指南手动执行等价工作。
>
> **Why not a new skill**: v3.0.0 ADR §2 明确"用户实测中独立调用极少"是删 locate/scan 的主要理由；保留为 manual recipe 既不重新引入 skill-picker 噪音，又保留了核心知识资产，是 LOW-cost preservation。
>
> See [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](../../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) §2.3.10 + §3.2 取舍依据。

## §1 Locate Recipe — 反查具体概念 / 口诀 / 部分文档名到对应文档

**用途**：你脑子里有一个概念名（如 "DLSRS"、"5 维 HITL 规则"、"§3.3 of the HITL prompt"）但忘了在哪个 doc 里 —— 想反查到具体文档 + section anchor。

### §1.1 项目识别（先确定 confidence band）

不同项目布局，搜索策略不同。先识别项目结构：

| 信号 | 含义 | 影响 confidence |
|------|------|----------------|
| `learning/INDEX.md` 存在 | 项目用过 v2.x learn-kit scaffold-learning（或后续 manual / three-views 默认路径输出） | confidence +0.2 |
| `CLAUDE.md` 含 tag prefix 声明（如 `[STANDARD]_/[SPEC]_/[ADR]_`） | 项目用 marketplace doc framework | confidence +0.15 |
| `docs/` 目录含 ≥10 个 `[STANDARD]_*.md` / `[SPEC]_*.md` 类文件 | canonical doc 量足 | confidence +0.1 |
| 缺以上全部信号 | blank-project / 外部项目 | confidence -0.3，告诉用户结果可能不全 |

Confidence bands:
- ≥ 0.95: 项目识别 + 命中 [LEARNING] doc 准确 → 直接返回
- 0.85-0.95: 命中 canonical doc 但未匹配 learning 解读 → 标注 "uninterpreted"
- 0.7-0.85: heuristic 匹配 (partial slug / section number) → 标注 "fuzzy"
- < 0.7: 无置信结果 → 提示用户改用更具体 query 或读 README

### §1.2 搜索顺序（preferred → fallback）

**Step A. 先搜 `[LEARNING]_*.md`（v2.x learn-kit 解读文档优先级最高）：**

```bash
# 在 Claude Code 内用 Grep 工具
Grep "<query>" path="learning" type="md" output_mode="content" -i -n
# 或 (传统 grep)
grep -rni "<query>" learning/**/[LEARNING]_*.md
```

如命中 → 提取 (file path, line numbers, surrounding 5 lines) → 这是 confidence 最高的结果。

**Step B. 搜 frontmatter `aliases` 字段（query 可能是文档别名）：**

```bash
# 找含 query 的 aliases 行
Grep "aliases:.*<query>" path="learning" type="md" -i
Grep "aliases:.*<query>" path="docs" type="md" -i
```

如命中 → 对应 frontmatter 所在 file 即匹配。

**Step C. 搜 canonical doc tag prefix：**

```bash
# 项目 docs/ 里所有 tag-prefixed 文档
Grep "<query>" path="docs" glob="\[*\]_*.md" output_mode="content" -i -n
# 含: [STANDARD]_ / [SPEC]_ / [ADR]_ / [GUIDE]_ / [RUNBOOK]_ / [POSTMORTEM]_
```

如命中 → 标注 "canonical doc, uninterpreted by [LEARNING]"（提示用户：可考虑用 `/learn-kit:three-views` 为这个 canonical doc 生成 3 阶段学习材料）。

**Step D. 模糊匹配 (filename slug)：**

```bash
# 把 query kebab-case，搜 filename 含此 slug
Glob "**/*<query-slug>*.md"
```

如命中 → confidence 标 "fuzzy"，让用户人工确认。

### §1.3 §X.Y section anchor 查询

如果 query 形如 "§3.3 of HITL prompt" / "Step 5 of generate-tier"：

```bash
# 直接 grep section header
Grep "^## \\b<section-number>\\b" path="docs" type="md" -n -B 2
```

返回 (file, line) → 用户可直接 jump-to。

### §1.4 输出格式（推荐模板）

```markdown
## Locate Results for `<query>`

**Project recognition**: <confident / blank / external>  (confidence: <0.0-1.0>)

### Interpreted [LEARNING] candidates (preferred tier)

| Confidence | File | Section | Snippet |
|-----------|------|---------|---------|
| 0.95 | `learning/hitl/[LEARNING]_HITL_challenge.md` | §10 Migration | `...DLSRS 是 5 维 HITL...` |

### Canonical doc candidates (secondary, uninterpreted)

| Confidence | File | Section | Snippet |
|-----------|------|---------|---------|
| 0.85 | `docs/rule/[STANDARD]_HITL.md` | §3 | `...5 维 HITL 规则...` |

### Recommendation

考虑跑 `/learn-kit:three-views <topic-from-canonical-doc>` 为这个 canonical doc 生成 3 阶段学习材料。
```

## §2 Scan Recipe — 项目内 [LEARNING]/[STANDARD] 文档枚举 + ranking

**用途**：开放式探索 — "项目里有什么可学的？" 想看到全量 canonical doc 候选 + 标注哪些已解读 / 哪些未解读 + 引用频率排序。

### §2.1 枚举所有 canonical docs（按 tag prefix）

```bash
# 找全量 tag-prefixed 文档
Glob "docs/**/\[STANDARD\]_*.md"
Glob "docs/**/\[SPEC\]_*.md"
Glob "docs/**/\[ADR\]_*.md"
Glob "docs/**/\[GUIDE\]_*.md"
Glob "docs/**/\[RUNBOOK\]_*.md"
Glob "docs/**/\[POSTMORTEM\]_*.md"
```

**注意**：根据 marketplace [`[STANDARD]_Documentation_Framework`](../../../../docs/rule/[STANDARD]_Documentation_Framework.md) v1.6，docs 子目录是 `rule/` / `spec/` / `adr/` / `guide/` / `runbook/` / `postmortem/`，root-level named files (README/CONTRIBUTING/CHANGELOG/GLOSSARY/CLAUDE.md) 不带 tag prefix。

### §2.2 标注 interpreted vs uninterpreted

对于每个 canonical doc `[TAG]_<name>.md`，检查是否有对应 `[LEARNING]_<name>_*.md`：

```bash
# 找全量 [LEARNING] docs
Glob "learning/**/\[LEARNING\]_*.md"

# 对每个 canonical doc <name>，看是否存在对应 [LEARNING]_<name>_*
```

构建对照表：
- **interpreted**: canonical doc + ≥1 个 [LEARNING] view (foundation / structural / challenge)
- **uninterpreted**: canonical doc 但无 [LEARNING] view → **推荐生成候选**

### §2.3 按引用频率排序 (PageRank-lite)

对每个 canonical doc，统计被其他 docs 引用的次数（filename 或 wikilink）：

```bash
# 对每个 doc <name>，count 引用
Grep "<doc-filename-base>" path="docs" type="md" -c
Grep "\\b<doc-frontmatter-slug>\\b" path="docs" type="md" -c
```

引用次数越高 → ranking 越靠前（说明该 doc 是 "load-bearing" canonical material，优先解读价值大）。

### §2.4 输出格式（推荐模板）

```markdown
## Scan Results — <project-name>

**Project profile**: <doc count by tag prefix>, <interpreted count> / <canonical count> covered.

### Top Uninterpreted Canonical Docs (recommended for `/learn-kit:three-views`)

| Rank | Refs | File | Tag | Brief (from H1 / summary frontmatter) |
|------|------|------|-----|----------------------------------------|
| 1 | 12 | `docs/rule/[STANDARD]_HITL.md` | STANDARD | HITL 协作执行规范 |
| 2 | 8 | `docs/rule/[STANDARD]_Documentation_Framework.md` | STANDARD | 文档治理框架 |
| 3 | 5 | `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md` | ADR | NLM-kit 退场决策 |

### Interpreted Coverage

| Topic | Foundation | Structural | Challenge | HTML | NLM |
|-------|------------|------------|-----------|------|-----|
| hitl | ✓ | ✓ | ✓ | ✓ | (none) |
| docs-framework | ✓ | ✓ | — | — | — |

### Recommended Next Actions

- 跑 `/learn-kit:three-views STANDARD_HITL` 完成 challenge tier
- 跑 `/learn-kit:three-views STANDARD_Documentation_Framework` 完成 challenge + HTML
```

## §3 用法示例

### §3.1 完整 Locate 会话

```
User: "DLSRS 是什么？"

Step 1. 项目识别 (Glob learning/INDEX.md 存在 → 项目有 v2.x learn-kit 历史)
Step 2. Grep "DLSRS" in learning/ → 命中 learning/hitl/[LEARNING]_HITL_challenge.md §10
Step 3. 输出:
  ## Locate Results for `DLSRS`
  Project recognition: confident (0.95)
  ### Interpreted candidates
  - `learning/hitl/[LEARNING]_HITL_challenge.md` §10 — "DLSRS = 5 维 HITL 规则的助记..."
```

### §3.2 完整 Scan 会话

```
User: "项目里有什么可学的"

Step 1. Glob docs/**/[STANDARD]_*.md → 12 个
Step 2. Glob docs/**/[ADR]_*.md → 8 个
Step 3. Glob learning/**/[LEARNING]_*.md → 6 个文件覆盖 2 个 topic
Step 4. 交叉对照 → 10 个 canonical doc 未解读
Step 5. 对每个 canonical doc Grep filename → 引用次数
Step 6. 输出 ranking 表 (top 5) + recommended next actions
```

## §4 与 `/learn-kit:three-views` 的协作

本 GUIDE 的两个 recipe 都是 **discovery / 准备** 阶段；找到 candidate 后通常会接 `/learn-kit:three-views <topic>` 生成 3 阶段学习材料：

```
[GUIDE recipe]                          [/learn-kit:three-views]
Locate <query>                          ←──── 已找到的 candidate doc 作为 source
   ↓
Scan / Rank
   ↓
Pick top uninterpreted ─────────────────→  /learn-kit:three-views <topic>
                                              Step 1.2 选 "项目内文件路径"
                                              Step 1.2.input: 该 canonical doc path
                                              Step 2-5 生成 3 md (+ 可选 HTML/NLM)
```

## §5 与历史 ADR 的关系

[`[ADR]_LearnKit_Discovery_Skills.md`](../adr/[ADR]_LearnKit_Discovery_Skills.md)（v3.1.0 / learn-kit 0.2.0 时期的 plugin-internal ADR）记录了 v2.x locate + scan skill 设计的原始动机 + 启发式策略 + zero-state 识别。本 GUIDE 是该 ADR 决策内容的**实施层物化** —— ADR 决定了"用启发式 + 零配置"，本 GUIDE 把启发式具体化为可执行的 Grep/Glob 模板。

v3.0.0 删除 skill 后，ADR 本身仍保留为 historical record（state: active 不变；它说明了"为什么 v2.x 引入这些 skill"）；本 GUIDE 是其在 v3.0.0+ 的等价 manual 形态。

## §6 局限性 (manual vs automated skill 的代价)

- **无 caching**: 每次都重新 Grep/Glob；大项目 (>500 doc) 单次 scan 可能 5-10s
- **置信度评分需要人工应用**：本 GUIDE 给出公式但需要用户自己计算；原 v2.x skill 输出已含 confidence
- **无 cross-tier 智能推荐**：原 scan skill 会建议 "已有 foundation，下一步生成 challenge"；本 GUIDE 让用户自己判断
- **bash / Grep 工具直接调用**：在 Claude Code 内 Grep 工具友好；在外部 shell 用 `rg` 或 `grep -r` 即可

这些局限是 manual recipe 的预期代价。如果某个用户 / 团队高频用 locate/scan，可以考虑自己写 `.claude/skills/my-discovery/` 把本 recipe 封装成项目本地 skill（不依赖 learn-kit）。
