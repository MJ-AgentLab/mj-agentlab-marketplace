# learn-kit

> Pedagogical kit: 8-stage manual authoring methodology + AI 3-tier learning doc generator + discovery skills. Independent plugin.

`learn-kit` 提供两条互补路径把枯燥的规则清单（RFC keyword lists、安全策略、API style guides、STANDARD/POLICY 文档）转化为可学习材料：

1. **手工流（METHODOLOGY 8 阶段）**：用户读方法论后自行抽框架、找比喻、写决策图，产出 `[LEARNING]_<topic>_Common.md` 类 framework 文档
2. **AI 流（generate-tier）**：给 user_question + 源文档，多选三档（零基础/结构/挑战）→ AI 直出 markdown，可选再渲染交互式 HTML

加上两个发现层 skills（locate 反查 + scan 枚举），learn-kit 形成「init → 发现 → 撰写（手工/AI 双路径）→ 渲染 HTML」完整闭环。

## 适用场景

当项目中存在以下材料，团队成员想"建立 mental model 而不是逐条死记"时：

- 编号或并列的规则清单（5–30 条最优）
- 同类型条款扎堆（"必须 / 不应"、"高 / 低"等二分结构）
- 条款之间有共性可归纳

→ 用本插件方法论产出 5 件套（**抽象框架 + 类别归类 + 比喻系统 + 决策图 + 记忆口诀**）的解读文档；或直接用 generate-tier AI 流产出三档学习材料 + HTML。

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

## 使用

### 1. 初始化项目的 learning 子系统骨架

在你的项目根目录运行：

```
/learn-kit:init
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
- 参考 worked example：`<plugin-root>/skills/init/references/rfc-2119-keywords-pedagogy.md`（应用 8 阶段到 RFC 2119 的完整示范）
- `mkdir learning/<topic-slug>/`
- 按 8 阶段方法论编写 `learning/<topic-slug>/[LEARNING]_<Source>_<Aspect>.md`

命名 / 路径 / frontmatter 规范见 `METHODOLOGY.md §9`。

### 3b. AI 流：用 generate-tier 一键产出三档学习文档

```
/learn-kit:generate-tier
```

skill 会按以下顺序与你交互：

1. **Source**（多选）：项目内文件路径 / 复用 scan-locate 发现 / 用户粘贴长文本 / 整目录扫描
2. **Tiers**（多选，默认全选）：零基础 foundation / 结构 structural / 挑战 challenge
3. **Topic**（单选 / 输入）：确认 topic 文件夹名 + 冲突策略
4. **Generate**：生成 `learning/<topic>/[LEARNING]_<topic>_<view>.md`
5. **HTML?**（单选 yes/no，默认 yes）：是否再为每档渲染交互式 HTML

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

`learn-kit` 完全独立运行：

- 8 阶段方法论由用户读 `METHODOLOGY.md` 后**手动**应用（手工流）
- generate-tier 提供 AI 生成三档学习文档 + HTML（AI 流）
- 验证用 `markdownlint` 等通用 markdown 工具
- 不依赖任何外部插件 / 服务 / API

## 与项目主治理框架的关系

`learning/` 子系统是**项目主治理框架的并行子系统**：

- 共享底层（markdown 语法 OB1-OB6 / heading / list / table 等）
- 自管上层（命名 `[LEARNING]_*` / 路径 `learning/<topic>/` / frontmatter schema 等）

详见 `METHODOLOGY.md §9` + `§11`。

## License

MIT — see `LICENSE`.

## 上游

本方法论原生于 [`mj-system`](https://github.com/MJ-AgentLab) 项目 v2.0 STANDARD-tier 学习子系统，经 N=5 跨域验证（rules 8–63 / dimensions 3–5 / 5 个独立比喻世界 / 全部 N 维 AND-gate 几何不变量）后稳定，剥离 MJ 引用通用化为 `learn-kit` v0.1.0。v0.3.0 起新增 generate-tier AI 生成 + HTML 渲染能力。
