# CLAUDE.md — learn-kit Plugin

learn-kit 是一个通用 Claude Code 插件，提供把枚举型规则清单（RFC keyword lists、安全策略、API style guides、STANDARD/POLICY 文档）转化为人类可学习决策框架文档的 8 阶段方法论 + 模板 + scaffold 命令，并支持基于「用户问题 + 上传文档」AI 生成三档（零基础 / 结构 / 挑战）reading-tier 学习文档与配套交互式 HTML。

## 上下文

- **起源**：从 mj-system 项目的 `learning/_meta/[LEARNING]_Rule_List_Interpretation_Authoring.md` v2.0 STANDARD-tier 方法论（N=5 跨域验证）剥离 MJ 引用通用化而来
- **定位**：完全通用、独立运行，外部项目可独立采纳，无 MJ 上下文假设、无外部插件依赖

## 插件内容

- `skills/init/SKILL.md` — `/learn-kit:init` 命令（user-triggered scaffold，`disable-model-invocation: true`）
- `skills/init/templates/METHODOLOGY.md` — 完整 8 阶段方法论（de-MJ-ified）
- `skills/init/templates/INDEX.md` — learning/INDEX.md 模板
- `skills/init/references/rfc-2119-keywords-pedagogy.md` — worked example：RFC 2119 五关键词
- `skills/locate/SKILL.md` — `/learn-kit:locate <query>` 概念反查
- `skills/scan/SKILL.md` — `/learn-kit:scan` 项目枚举
- `skills/generate-tier/SKILL.md` — `/learn-kit:generate-tier` AI 生成三档学习文档（含可选 HTML 渲染）
- `skills/generate-tier/templates/{foundation,structural,challenge,html-renderer}.md` — 4 个 prompt 模板

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

## 治理边界

learn-kit 的 `learning/` 子系统是**项目主治理框架的并行子系统**：

- 共享底层（markdown 语法 OB1-OB6）
- 自管上层（命名 `[LEARNING]_*` / 路径 `learning/<topic>/` / frontmatter schema）
- 完全独立：不依赖任何外部插件 / 服务 / API

详见 `skills/init/templates/METHODOLOGY.md` §9（Subsystem Meta-Rules）+ §10（Optional Integrations）。
