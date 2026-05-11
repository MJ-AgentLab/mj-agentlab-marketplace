# CLAUDE.md — learn-kit Plugin

learn-kit 是一个通用 Claude Code 插件，提供把枚举型规则清单（RFC keyword lists、安全策略、API style guides、STANDARD/POLICY 文档）转化为人类可学习决策框架文档的 8 阶段方法论 + 模板 + scaffold 命令。

## 上下文

- **起源**：从 mj-system 项目的 `learning/_meta/[LEARNING]_Rule_List_Interpretation_Authoring.md` v2.0 STANDARD-tier 方法论（N=5 跨域验证）剥离 MJ 引用通用化而来
- **定位**：完全通用，外部项目可独立采纳，无 MJ 上下文假设
- **协同**：与姊妹插件 `notebooklm-kit` 配套使用最佳（learn-kit 写 [LEARNING] 文档，notebooklm-kit 生成 NotebookLM 配套学习制品）

## 插件内容

- `skills/init/SKILL.md` — `/learn-kit:init` 命令（user-triggered scaffold，`disable-model-invocation: true`）
- `skills/init/templates/METHODOLOGY.md` — 完整 8 阶段方法论（de-MJ-ified）
- `skills/init/templates/NLM_RECORD_TEMPLATE.md` — NLM 制品元信息 schema（与 notebooklm-kit 上游同步）
- `skills/init/templates/INDEX.md` — learning/INDEX.md 模板
- `skills/init/references/rfc-2119-keywords-pedagogy.md` — worked example：RFC 2119 五关键词

## 触发 `/learn-kit:init`

在项目根运行 `/learn-kit:init`，会创建：

```
learning/
├── INDEX.md
├── _meta/
│   ├── METHODOLOGY.md
│   └── NLM_RECORD_TEMPLATE.md
└── _archive/.gitkeep
```

用户随后按 METHODOLOGY 8 阶段方法手动编写 `learning/<topic>/[LEARNING]_*.md`。

## 不带额外 skills（per Tier 1 决策）

- 8 阶段方法论是认知框架，用户读 METHODOLOGY.md 后**手动**应用
- 不提供交互式 8 阶段引导 skill（保留为 v0.2.0 候选 follow-up）
- 验证用 markdownlint 等通用 markdown 工具
- NLM 集成走 `notebooklm-kit`（独立安装）

## 治理边界

learn-kit 的 `learning/` 子系统是**项目主治理框架的并行子系统**：

- 共享底层（markdown 语法 OB1-OB6）
- 自管上层（命名 `[LEARNING]_*` / 路径 `learning/<topic>/` / frontmatter schema）

详见 `skills/init/templates/METHODOLOGY.md` §9（Subsystem Meta-Rules）+ §10（Optional Integrations）。
