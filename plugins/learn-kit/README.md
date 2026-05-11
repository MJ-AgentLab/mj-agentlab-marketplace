# learn-kit

> Pedagogical kit for converting enumerated rule lists into learnable knowledge artifacts.

`learn-kit` 提供一套从枚举型规则清单（如 RFC keyword lists、安全策略、API style guides、STANDARD/POLICY 文档）转化为人类可学习决策框架文档的 8 阶段方法论 + 模板 + 一键 scaffold 命令。

## 适用场景

当项目中存在以下材料，团队成员想"建立 mental model 而不是逐条死记"时：

- 编号或并列的规则清单（5–30 条最优）
- 同类型条款扎堆（"必须 / 不应"、"高 / 低"等二分结构）
- 条款之间有共性可归纳

→ 用本插件方法论产出 5 件套（**抽象框架 + 类别归类 + 比喻系统 + 决策图 + 记忆口诀**）的解读文档。

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
│   ├── METHODOLOGY.md           # 完整 8 阶段方法论
│   └── NLM_RECORD_TEMPLATE.md   # NotebookLM 元信息模板（可选）
└── _archive/
    └── .gitkeep
```

### 2. 阅读方法论 + worked example

- 通读 `learning/_meta/METHODOLOGY.md`（8 阶段方法）
- 参考 worked example：`<plugin-root>/skills/init/references/rfc-2119-keywords-pedagogy.md`（应用 8 阶段到 RFC 2119 的完整示范）

### 3. 写你自己的 [LEARNING] 文档

```
mkdir learning/<topic-slug>/
# 按 8 阶段方法论编写 learning/<topic-slug>/[LEARNING]_<Source>_<Aspect>.md
```

命名 / 路径 / frontmatter 规范见 `METHODOLOGY.md §9`。

### 4. （可选）配套 NotebookLM 集成

如果你想为解读文档生成 audio / video / slide / mind-map / quiz 等 NotebookLM 制品，安装姊妹插件 `notebooklm-kit`：

```bash
/plugin install notebooklm-kit@mj-agentlab-marketplace
/notebooklm-kit:learn-make <topic>
```

制品元信息自动落 `learning/<topic>/_nlm/<artifact>.md`（schema 见 `learning/_meta/NLM_RECORD_TEMPLATE.md`）。二进制（mp3 / mp4 / pdf）永不入 git。

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

`learn-kit` 不附带任何自动化 skill（除一个 `init` scaffold 命令）：

- 8 阶段方法论由用户读 `METHODOLOGY.md` 后**手动**应用
- 验证用 `markdownlint` 等通用 markdown 工具
- NotebookLM 集成走 `notebooklm-kit`（姊妹插件，独立安装）

本插件刻意保持轻量——只交付方法论 + 模板 + scaffold，不绑定额外自动化。

## 与项目主治理框架的关系

`learning/` 子系统是**项目主治理框架的并行子系统**：

- 共享底层（markdown 语法 OB1-OB6 / heading / list / table 等）
- 自管上层（命名 `[LEARNING]_*` / 路径 `learning/<topic>/` / frontmatter schema 等）

详见 `METHODOLOGY.md §9` + `§11`。

## License

MIT — see `LICENSE`.

## 上游

本方法论原生于 [`mj-system`](https://github.com/MJ-AgentLab) 项目 v2.0 STANDARD-tier 学习子系统，经 N=5 跨域验证（rules 8–63 / dimensions 3–5 / 5 个独立比喻世界 / 全部 N 维 AND-gate 几何不变量）后稳定，剥离 MJ 引用通用化为 `learn-kit` v0.1.0。
