# learn-kit 01 · 定位与问题域

> 学习目标：用 5 分钟建立 learn-kit 的 mental model——它是干什么的、不是干什么的、什么时候用、什么时候别用。
>
> **版本说明**：本文反映 learn-kit v1.0.0 / marketplace v4.0.0（2026-05-14）状态。v0.x 时代曾把 learn-kit 定位为「只做一件事」（手工方法论 + scaffold）；v1.0.0 已扩展为「3 个模式 + 2 个 discovery skill」，定位重写。

---

## 0 TL;DR

learn-kit 是一个**把枚举型规则清单转化为多形态学习材料**的插件家族，提供 3 种产出模式：

| 模式 | 由谁主导 | 产出形态 |
|------|---------|---------|
| **手工流**（v0.1+ 原始能力）| 人 | 5 件套 `[LEARNING]_*.md`（方法论按 8 阶段手写）|
| **AI 流**（v0.3.0+）| AI（人指挥）| 三档 `[LEARNING]_<topic>_{F,S,C}.md` + 可选交互式 HTML |
| **多媒体流**（v1.0.0+）| AI（NLM 后端）| 至多 13 个在线 audio / video / slide / mind_map / infographic（不下载）|

外加 2 个 discovery skill（init / scan / locate）服务全部三种模式的「发现 → 进入」。

它不是 RAG、不是检索手册。它的核心承诺：**让源材料变成可建立 mental model 的学习产物**——手工流出"框架 + 比喻 + 口诀"决策文档；AI 流出三档分层教学文档 + 可挂代码的交互式 HTML；多媒体流出适合通勤 / 评审 / poster 等不同场景的多媒体形态。

---

## 1 一句话定位

> **从一堆"必须 / 不应"条款，到一份可读（markdown）/ 可看（HTML）/ 可听（NLM audio）/ 可演（slide / video）的学习产物。**

3 种模式各有交付承诺：

### 1.1 手工流（5 件套）

由人按 8 阶段方法论手工抽取：

1. **抽象框架**：N 个独立维度（3–7 个轴）
2. **类别归类**：每条规则按维度归位
3. **比喻系统**：统一比喻世界
4. **决策图**：ASCII 树 / Mermaid / 表
5. **记忆口诀**：轴名缩写 + 关键动作

任一缺失就不是手工流风格的解读文档。

### 1.2 AI 流（三档 + 可选 HTML）

由 `/learn-kit:generate-tier` AI 一键产出：

- `[LEARNING]_<topic>_foundation.md` —— 零基础（少术语 + 多类比 + 完整故事）
- `[LEARNING]_<topic>_structural.md` —— 结构（概念地图 + 关系表 + 适用边界）
- `[LEARNING]_<topic>_challenge.md` —— 挑战（反例 + 失败案例诊断 + 迁移题）
- 可选：每档配对的离线 HTML（含 SVG 图 / Tab / 暗亮主题 / 代码 grounding）

三档定位**与手工流互补**：手工流的产物是**单一 framework 文档**（一个比喻、一套口诀），AI 流的产物是**三档分层教学**（不同读者深度）。两者都可在同 `learning/<topic>/` 共存。

### 1.3 多媒体流（13 个 NLM artifact）

由 `/learn-kit:nlm-studio` 把已生成的三档 markdown 推到 NotebookLM，产出至多 13 个**在线可看不下载**的多媒体 artifact：

- 4 view-cycled 类型 × 3 view = 12（audio / video / slide_deck / infographic × foundation/structural/challenge）
- 1 shared mind_map（view-agnostic）

定位**与 AI 流互补**：AI 流交付的是**文字材料**（适合深读），多媒体流交付的是**多种学习模态**（通勤听 audio / 评审看 slide / poster 看 infographic）。

---

## 2 适用 vs 不适用（最关键的边界）

### 适用源材料

| 形态 | 例子 |
|------|------|
| 编号或并列的规则清单 | RFC keyword list、API style guide §"必须 / 不应"小节 |
| 5–30 条最优 | 少于 5 不需要框架；多于 30 需要先分组 |
| 同类型条款扎堆 | "必须 / 不应"二分、"高 / 低"二分 |
| 条款之间有共性可归纳 | 不是完全异质的散点信息 |

### 适用产出形态

- **手工流**：人类阅读用，建立 mental model，目标是**一份 framework 文档**
- **AI 流**：按读者深度切三档，目标是**学习课程式**分层教学
- **多媒体流**：同一主题多模态，目标是**适应不同学习场景**（通勤 / 评审 / poster）

### 不适用

| 不适用 | 应换的工具 |
|------|-----------|
| 顺序教程（Tutorial flow） | Tutorial 模板 |
| 查阅参考（Reference manual） | Lookup 模板 |
| 故障复盘 | POSTMORTEM 模板 |
| 架构图 / 数据流 / 代码逻辑 | 非规则枚举源材料，暂不适用本方法论 |
| 出考试题 / quiz / flashcards | v4.0.0 永久放弃（v3.x notebooklm-kit:learn-test 已退役）—— 用外部评估工具 |

**判别口诀**：源材料是"枚举型规则清单"且读者要建 mental model → 用 learn-kit；否则用别的。

---

## 3 起源与成熟度

- **上游**：从 `mj-system` 项目 v2.0 STANDARD-tier 学习子系统剥离而来
- **验证基础**：N=5 跨域 case 验证
  - 5 个独立行业（HITL 协作 / 服务架构 / SQL 语法 / DB 设计 / DB 命名）
  - rules 跨度 8–63 条
  - dimensions 跨度 3–5 维
  - 5 个独立比喻世界
  - 全部 N 维 AND-gate 几何不变量
- **通用化**：剥离 MJ 引用，保留方法论核心 + 子系统元规则 + 6 类失真自检
- **现行版本**：marketplace `v4.0.0` 中的 learn-kit `v1.0.0`，含 **5 个 skill**（init / scan / locate / generate-tier / nlm-studio）
- **演化里程碑**：
  - v0.1（2026-05-11）：init + METHODOLOGY scaffold
  - v0.2（2026-05-11）：加 scan + locate 两个 discovery skill
  - v0.3（2026-05-13）：加 generate-tier AI 三档生成 + 交互式 HTML；与 notebooklm-kit 解绑
  - v1.0（2026-05-14）：加 nlm-studio NLM 多媒体；吸收原 notebooklm-kit 核心场景；marketplace 收敛为 1 plugin

N=5 跨域验证是手工流方法论核心说服力的来源——方法论不是单一案例的产物，是 5 个独立域都验证通过后才稳定下来的。

---

## 4 与同类思路的差异

| 工具 | 输入 | 输出 | learn-kit 差异 |
|------|------|------|---------------|
| LLM auto-summarize | 任意文本 | 几段摘要 | 摘要无框架、无类别、不可复用学习；learn-kit 手工流交付 5 件套，AI 流交付**分层三档**（不是单一摘要）|
| RAG 检索 | 任意文本 + query | 相关片段 | 检索不建框架，每次查询都重做；learn-kit 产出物**持久化**到 `learning/`|
| 教程生成器 | 规则清单 | "1, 2, 3" 顺序教程 | 顺序教程是过程导向，learn-kit 是决策框架导向（手工流）或分层教学导向（AI 流）|
| 思维导图工具 | 任意主题 | 树状视觉化 | 思维导图只是 5 件套中的 1 件；learn-kit 手工流要求全 5 件，多媒体流 mind_map 只是 13 artifact 之一 |
| 干读 STANDARD 文档 | 30 条规则 | 记不住 | learn-kit 的存在前提：原始清单"密度太高人脑承不住" |
| 通用 LLM "把这个文档解释给我" | 文档 + 一次性 prompt | 一次性会话 | learn-kit AI 流**产出持久化文档**（写到 `learning/<topic>/`），可重复阅读、可挂代码 grounding、可推 NLM 出多媒体 |
| NotebookLM 直接用 | 自己丢 docs 进 NLM | NLM artifact | learn-kit 多媒体流的 source 是**精炼后的三档** markdown（已经分层 + 已经做过 view-purpose 设计），artifact 质量上限更高；且不用手工管 notebook |

**核心差异**：learn-kit 强制「**先把源材料消化成 mental-model-friendly 的结构，再多形态输出**」——而其他工具要么只做摘要、要么只做检索、要么不做结构化、要么直接吃原料丢 NLM。

---

## 5 何时不该用 learn-kit

刻意列出来，避免误用：

1. **规则少于 5 条**：3 条规则脑子直接记，强行抽象出 3 个轴反而扭曲
2. **规则之间完全异质**：归纳不出共性轴
3. **源材料是流程或时间序列**：那是工作流，用 BPMN / Mermaid sequence 即可
4. **源材料是代码 / 架构 / 数据流**：本方法论暂不适用
5. **读者只想 "查"，不想 "学"**：用查阅手册或检索引擎
6. **团队尚无项目治理框架**：learn-kit 的产物 `learning/` 是子系统，需要寄生在主治理上
7. **想要 quiz / flashcards / 跨 notebook 查询**：v4.0.0 永久放弃这些场景；用外部评估工具或 notebooklm.google.com web UI 直接跑
8. **完全离线环境**：手工流可离线；AI 流需 Claude Code 联网；多媒体流需 NotebookLM 在线账号 + `nlm login`

---

## 6 协同关系一图（v1.0.0 起内化 NLM 多媒体）

```text
                  ┌──────────────────────────────┐
                  │  source 枚举型规则清单        │
                  │  (STANDARD / POLICY / RFC)    │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  /learn-kit:scan / locate    │ ← 2 个 discovery skill
                  │  发现 / 锁定要解读哪份        │   服务三种产出模式
                  └──────────────┬───────────────┘
                                 │
                  ┌──────────────┴─────────────────┐
                  │      选哪种产出模式？           │
                  └────┬───────┬───────────┬───────┘
                       │       │           │
        ┌──────────────┘       │           └──────────┐
        ▼ 手工流               ▼ AI 流                ▼ 多媒体流
  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐
  │ 按 METHODOLOGY    │  │ /learn-kit:      │  │ /learn-kit:nlm-studio   │
  │ 8 阶段手写         │  │ generate-tier    │  │ （v1.0.0+ 内化）         │
  │                  │  │                  │  │                         │
  │ 产出：           │  │ 产出：           │  │ 产出：                  │
  │ [LEARNING]_<src> │  │ 三档 markdown +   │  │ ≤13 NLM artifact        │
  │ _<aspect>.md     │  │ 可选交互式 HTML    │  │ （audio / video / slide  │
  │ （5 件套 framework│  │ （foundation /     │  │  / mind_map /            │
  │  文档）          │  │  structural /     │  │  infographic）           │
  │                  │  │  challenge）      │  │ 在线浏览，不下载         │
  └──────────────────┘  └──────────────────┘  └─────────────────────────┘
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                                ▼
              ┌──────────────────────────────────┐
              │  通用工具（learn-kit 不重复发明）  │
              │  • markdownlint / prettier      │
              │  • git / PR review              │
              └──────────────────────────────────┘
```

**v0.x 旧版本对比**：v0.x 时代的协同关系图把 notebooklm-kit 画作独立 sibling plugin（"下游"），learn-kit 自己只负责中间的 `[LEARNING]_*.md`。v1.0.0 把多媒体流**内化为 `/learn-kit:nlm-studio`**，notebooklm-kit 整个退役。learn-kit 现在是「单一 plugin、3 种产出模式」的完整自洽工具。

---

## 7 关键源文件指针

| 想知道什么 | 读哪里 |
|----------|--------|
| 完整定位 + 安装 + 使用 | `plugins/learn-kit/README.md` |
| 内部架构 + 边界声明 | `plugins/learn-kit/CLAUDE.md` |
| 方法论全文 | `plugins/learn-kit/skills/init/templates/METHODOLOGY.md` |
| 范例（RFC 2119 解读） | `plugins/learn-kit/skills/init/references/rfc-2119-keywords-pedagogy.md` |
| 插件元数据 | `plugins/learn-kit/.claude-plugin/plugin.json` |
| AI 流 skill 定义 | `plugins/learn-kit/skills/generate-tier/SKILL.md`（10 步 workflow）|
| AI 流 4 prompt templates | `plugins/learn-kit/skills/generate-tier/templates/{foundation,structural,challenge,html-renderer}.md` |
| 多媒体流 skill 定义 | `plugins/learn-kit/skills/nlm-studio/SKILL.md`（5 步 workflow + composition contract）|
| 多媒体流 10 templates | `plugins/learn-kit/skills/nlm-studio/templates/*.md`（3 view + 5 artifact + interaction-overrides + language-directive）|
| v4.0.0 退役 notebooklm-kit 决策 | `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md` |
| v3.x → v4.0.0 迁移指引 | `docs/MIGRATION_GUIDE.md` §2 |

---

## 8 自检问题（学完本文应答得上）

1. learn-kit v1.0.0 的 3 种产出模式分别交付什么形态？分别由谁主导（人 vs AI vs NLM）？
2. 手工流的"5 件套"是哪 5 件？AI 流的"三档"是哪三档？多媒体流的 13 artifact 矩阵是怎么排布的（4×3+1）？
3. 适用源材料的规模区间是几条？为什么有下限和上限？
4. 不适用的源材料有哪些？分别应换用什么工具？
5. learn-kit 的方法论（手工流核心）经过几个独立域验证？为什么这点重要？
6. learn-kit 与 RAG 的核心差异在哪？与"通用 LLM 一次性 prompt 解释文档"的差异在哪？
7. learn-kit 与 NotebookLM 直接用的差异在哪？为什么走 learn-kit 多媒体流而不是直接丢源文档到 NotebookLM？
8. v0.x 时代 learn-kit 定位是「只做一件事」，v1.0.0 扩到「3 种模式」。这个扩展是收益更多还是承担更多？（提示：单一职责 vs 一站式工具的权衡）
9. v4.0.0 永久退役了 quiz / flashcards / cross-notebook 等场景。如果你的项目真的需要这些，怎么办？
