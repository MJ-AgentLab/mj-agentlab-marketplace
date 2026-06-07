# CLAUDE.md — diagram-kit Plugin (v0.1.0)

diagram-kit 是一个通用 Claude Code 插件，把「一个代码库 / 系统的事实」转成「证据绑定的架构图（Mermaid）」。**v0.1.0 含 1 个 skill** `arch-diagram`。

它与 marketplace 另一个 plugin `learn-kit`（教学材料生成）**功能正交**——一个出架构图、一个出学习材料；两者无共享契约、互不内化。设计与「为何开第 2 个 plugin」的治理 reconcile 见 marketplace 层 [`docs/adr/[ADR]_Diagram_Kit_Addition.md`](../../docs/adr/[ADR]_Diagram_Kit_Addition.md)。

## 定位

- **通用、领域无关**：docker / python / postgreSQL / claude-code-plugin / … 任意域；外部项目可独立采纳。
- **事实先行**：每个进图的节点/边都可追到源码 `file:行号` 证据（**铁律：禁臆造**）。
- **零外部依赖**：无 `.mcp.json`、无网络；仅 Read / Glob / Grep / Bash / Write / AskUserQuestion。

## `arch-diagram` 工作流（5 步）

1. **Scope** — 定 target（cwd / 子目录 / 描述的系统）+ 领域自动探测（Glob 签名文件 → `domain-acquisition §4` 某域）+ 输出位置。
2. **Acquire facts L0–L3** — 读方法论基础 + bridge → L0 声明扫描出实体（带 `file:行号`）→ L1 推边/分层 → L2 命名归类成角色 → L3 仅对 L0–L2 挖不到的（同步/异步、可达性、why）问 HITL。
3. **Pick diagrams** — 按 `domain-acquisition §5.1 全局适用性矩阵`（项目类型 × 7 图，★ 密度 + ✗ pre-check）multiSelect 选高价值子集。
4. **Draft** — 逐选中类型懒载 `references/<type>-diagram.md` → 套 L0–L3 facts + `architecture-methodology §5 边语义 + §4.1 Mermaid 语法` + `§6 命名` → 出 Mermaid（` ```text ` 围栏）→ Write `.md`。
5. **Validate → fix → repeat** — 跑 bundled linter → 修 FAIL 到 exit 0 → 列 WARN 待人确认 → recap（文件 + slug + 证据表）。

## 插件内容

```
plugins/diagram-kit/
├── .claude-plugin/plugin.json    # version 0.1.0；8-field union；无 components
├── CLAUDE.md                     # 本文件
├── README.md                     # 用户指南
├── CHANGELOG.md                  # [Unreleased] + [0.1.0]
├── LICENSE                       # MIT
└── skills/arch-diagram/
    ├── SKILL.md                  # 5 步工作流；frontmatter name+description+allowed-tools
    ├── references/               # 9 份，一层深，progressive disclosure 懒载
    │   ├── architecture-methodology.md   # 绘图前必读：4+1 / C4 / §4.1 Mermaid 语法 / §5 边语义
    │   ├── domain-acquisition.md         # bridge + §2 画像 + §3 L0–L3 阶梯 + §5.1 矩阵 + §6 命名 SSOT
    │   ├── context-diagram.md  container-diagram.md  component-diagram.md  code-diagram.md
    │   └── sequence-diagram.md  state-machine-diagram.md  deployment-diagram.md
    └── scripts/
        └── validate_diagram.py   # 通用 Mermaid linter（纯 stdlib；泛化自 PG 版）
```

- **无 `.mcp.json`**：零 MCP 依赖（SPEC §3.3 optional；缺省最干净）。
- **无 plugin-internal `docs/`**：精简路径；设计 rationale 全在 marketplace 层 ADR（与 v6.2.0 加 glossary/concept 同款做法）。

## references bundle（领域无关，verbatim 引入）

9 份 markdown 构成自洽集合（architecture-methodology → domain-acquisition → 7 siblings，零仓外回链；外链仅 c4model.com / dbt / uml-diagrams.org）。命名/slug 唯一事实源 = `domain-acquisition §6`：

| 轴 | altitude | slug 基 | 提示词 |
|----|----------|---------|--------|
| 结构 | L1 | `struct-l1-context` | context-diagram.md |
| 结构 | L2 | `struct-l2-container` | container-diagram.md |
| 结构 | L3 | `struct-l3-component` | component-diagram.md |
| 结构 | L4 | `struct-l4-code-<簇>` | code-diagram.md |
| 行为 | — | `dyn-sequence-<用例>` | sequence-diagram.md |
| 行为 | — | `dyn-state-<owner>` | state-machine-diagram.md |
| 物理 | — | `phys-deployment-<env>` | deployment-diagram.md |

## validator 角色（`scripts/validate_diagram.py`）

纯 stdlib Mermaid linter（Py 3.7+），泛化自 PG 绘图手册版（`postgreSQL/validate_diagram.py`），去 PG 专属 role↔shape 映射（ROLE-03）、SLUG regex 放宽到通用基线（`struct-l[1234]|dyn|phys`，per §6）。两版自此**双源分叉**、各自演进。

- **机检规则**：NAME-01/02（命名门，类型无关，含 classDiagram）/ MM-01 / CLS-01·02·03 / LEG-01 / TXT-01·03 / STATE-01·02 / SEQ-02·03·04。
- **验证对象**：generated 图（真 slug），**不是** bundle 里带 `<占位符>` 的提示词骨架。
- **退出码**：0 = 无 FAIL（可含 WARN）/ 1 = FAIL / 2 = usage。
- **优雅降级**：无 Python 时不硬失败——产图 + 提示 "validator skipped" + 退回各模板自检清单。
- **已知 gap**（0.x → 1.0.0）：classDiagram 只过命名门，结构 lint（关系符号配对 / 类数 / 接口实现方向）未实现 → 退回 `code-diagram.md` 自检清单人工把关。

## 触发 `/diagram-kit:arch-diagram`

```
/diagram-kit:arch-diagram <target>
```

或自然语言：「画架构图」/「给这个项目画 C4 图」/「生成时序图 / 状态机图 / 部署图」/「diagram this codebase」。

## 与 learn-kit 的边界

双向干净：learn-kit `three-views` 已 disclaim "纯解释 / 架构图生成"；本 skill description 的 `Do not use for: …` 反向路由到 learn-kit 三 skill（three-views / glossary / concept）。
