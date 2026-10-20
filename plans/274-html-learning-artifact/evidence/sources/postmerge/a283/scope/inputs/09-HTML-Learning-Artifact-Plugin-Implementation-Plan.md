---
type: guide
scope: html-guide-kit
summary: "HTML Learning Artifact 插件实施计划：本地工具、语言原则、Sites 交付与最小上线验收"
owner: marketplace-maintainers
created: 2026-10-15
updated: 2026-10-15
state: draft
version: v1.0
---

# HTML Learning Artifact 插件实施计划

更新日期：2026-10-15  
实施项目：[mj-agentlab-marketplace](https://github.com/MJ-AgentLab/mj-agentlab-marketplace)  
计划状态：Draft，尚未实施  
方法依据：**HTML Learning Artifact Execution Guide**，2026-10-14 修订版。

本版纳入 Owner 已确认的决定：

- 首版迁入**样式注入、复制反馈、静态检查和通用渲染检查**。
- 核心名称保留英文，解释与学习活动使用中文，并保持术语一致。
- 使用**上线前最小检查**作为上线门槛，其余验收由 Owner 上线后实际体检完成。
- 最终网页通过 [Sites](plugin://sites@openai-curated-remote) 制作与发布；其余方法、模板和脚本在插件本地闭合。

## 1. Implementation Goal

实施目标。

提供一套从学习材料到 HTML 学习制品的完整能力：

**Understanding Needs → Learning Materials → Information Structure and Relationships → Interaction and UI/UX → HTML through Sites → Evaluation and Revision**

插件围绕特定读者、任务和理解目标组织内容，生成可阅读、可操作、可追溯的学习网页。

六步流程用于指导制作。生成的教材按具体主题组织，不要求固定六章、固定题量或固定交互数量。

首版交付重点是可靠完成制作与发布。实际理解效果未测量时，明确保留 **NOT_MEASURED** 状态。

## 2. Repository Baseline and Plugin Design

仓库基线与插件设计。

### 2.1 Existing Baseline

本次只读核对的工作区：

```text
D:\workspace\10-software-project\projects\mj-agentlab-marketplace\develop
```

核对时本地 HEAD：

```text
98068a8bd7060585b9915be9490a02a733fcb1a6
```

该基线已包含 `html-guide-kit` 0.1.0，现有入口为：

```text
$html-guide-kit:guide
```

现有入口只在聊天中生成指南文本，能力为 `Read`，不制作 HTML、文件或调用制作工具。依据见[现有 manifest](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/98068a8bd7060585b9915be9490a02a733fcb1a6/plugins/html-guide-kit/plugin.json)与[现有技能](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/98068a8bd7060585b9915be9490a02a733fcb1a6/plugins/html-guide-kit/skills/guide/SKILL.md)。

实施开始时重新读取最新仓库指令、版本、远端基线和 Git 状态，保护并行工作。

### 2.2 Entry Points

在现有插件中新增显式制作入口：

```text
$html-guide-kit:site
```

| 入口 | 职责 | 交付物 |
|---|---|---|
| `guide` | 保留现有指南编排流程与只读边界 | 聊天中的指南文本 |
| `site` | 执行六步制作流程，调用 Sites 完成网页交付 | 学习网页、材料源文件、检查记录和实际发布地址 |

保留现有插件身份与已批准图标，不另建重复插件。

新增制作能力所需的 `Write` 等 metadata 与资源登记，在同一实施变更中更新。插件级 capability 不代表不同技能拥有独立权限沙箱，仍须通过入口指令和行为检查维持职责边界。

## 3. Scope and Dependency Boundary

范围与依赖边界。

### 3.1 First Release Scope

首版包括：

- 六步执行方法及适用的 AICS 原则。
- 英文核心名称、中文解释与活动、术语一致性规则。
- 本地 Markdown 内容与网页视图分离。
- 暖白纸面与陶土色主题。
- 必要的教学反馈、重试、重置、依据回链与本地导出。
- 样式注入、复制反馈、静态检查、通用渲染检查。
- Sites 制作与发布衔接。
- 上线前最小检查记录和上线后 Owner 体检记录。

交互按理解任务选用，不要求每个教材都包含上述所有功能。

### 3.2 Local Independence

以下资源随插件分发：

- 制作规范、术语表和参考材料。
- 页面模板、主题和交互脚本。
- 内容转换与检查脚本。
- 来源、版本、检查和评价记录格式。

运行时相对实际安装的 `SKILL.md` 定位资源，不依赖：

- 原研究仓库或其他工作目录。
- 个人绝对路径与历史聊天。
- 其他插件缓存。
- CDN、远程字体、远程脚本或样式。
- 自动下载上游源码或在线安装依赖。

上游链接可以保留为来源说明，但不作为自动加载的运行资源。

“本地独立”限定于方法与资源，不表示宿主模型或 Sites 托管可以离线运行。

### 3.3 External Production Dependency

唯一必需的外部制作能力是 Sites，包括其当前工作流要求的认证、源码同步、版本保存、打包和发布工具。

插件不复制 Sites 的托管、认证或凭据实现。

材料缺失时先说明影响，补充材料或收窄目标；不通过隐含增加外部服务来补全流程。

## 4. Language and Terminology Policy

语言与术语原则。

这项语言分工是本插件的产品约定，使用 AICS 的术语一致性原则检查，不将其描述为 AICS 对所有教材的强制要求。

### 4.1 English Core Names

核心概念、执行阶段和主要章节名称使用稳定的英文名称，并在邻近位置给出中文解释。

例如：

| English Name | 中文解释 |
|---|---|
| Audience | 目标读者及其相关背景 |
| Task | 读者需要完成的判断或行动 |
| Understanding Goals | 学习后应能展示的理解能力 |
| Information Structure | 信息的分组、层级与阅读安排 |
| Relationship Representation | 对分类、依赖、状态等关系的表达 |
| Semantic Fidelity | 对原材料含义、条件和边界的忠实保留 |

已有来源中的技术标识、代码名称、命令和文件名保留原文。

没有稳定英文名称时，建立本次材料的明确映射，避免每处临时翻译。

### 4.2 Chinese Explanation and Learning Activities

以下内容默认使用中文：

- 概念解释、推导和使用条件。
- 案例、反例和情境描述。
- 练习题干、操作说明和开放应用任务。
- 参考判断、反馈、误区及限制。
- 面向学习者的按钮与状态提示。

例如采用“查看依据”“核对判断”“重新开始”，不要求所有控件名称都使用英文。

### 4.3 Terminology Consistency

建立单一的本地术语参考，并在每次制品中维护本主题所需的术语映射。

检查范围包括正文、图解、表格、交互、反馈和导出记录。

必须保留以下区别：

- **Exhibit**：对应展示；**Evidence**：支持主张的证据。
- **Source-supported**：来源支持关系；**Confirmed**：具体主张在声明范围内已核实。
- **Verified**：指定检查已验证；**Completed**：约定任务及必要验收已完成。

同一概念使用同一名称；不同概念不为表面统一而合并。中文不机械套用英文词数限制。

## 5. Six-Step Workflow

六步执行流程。

教材正文按适用的 **AICS-Standard** 原则检查；制作、验证和报告按 **AICS-Strict** 核对实际执行及完成范围。

| 步骤 | 执行内容与产出 | AICS 原则 | HTML 方法与工具 | 检查及回退 |
|---|---|---|---|---|
| **Step 1 — Define Understanding Needs** | 实际读取材料；明确读者、任务、理解目标、材料边界、检查问题和判准，形成理解约定 | 主体与条件明确；事实、推断、假设和未知分开；重要主张有依据 | Task-shaped UI、Unknowns Discovery；本地需求记录 | 目标须能转为具体表现；关键答案须有依据。缺口阻断判断时先补足或收窄范围 |
| **Step 2 — Develop Learning Materials** | 编写可独立阅读的 Markdown，补足基础、关系、条件、例外与练习；建立术语映射 | One Concept, One Term；Condition Before Action；Explain Enough；Correctness Before Brevity | Content–View Separation；英文核心名称与中文教学内容 | 按目标覆盖检查完整性。KU 可辅助复用，不以数量代替覆盖 |
| **Step 3 — Design Information Structure and Relationship Representation** | 确定分组、层级、阅读顺序和比较维度，形成静态草图与关系说明 | Structure Represents Relationships；分层展开；限制可见 | Claim–Exhibit；文字、表格、图解和图表按关系选择 | 不把分类画成过程、相关画成因果；比较信息可同时查看。缺依据返回第 2 步 |
| **Step 4 — Design Interaction, Specialized Representation, and UI/UX** | 定义交互用途、输入、变化、反馈、异常、恢复及静态替代；应用本地主题 | 建议说明理由与取舍；假设、未知及例外明确 | Interactive Exploration、Contextual Feedback、Structured Export、Default State Tracking | 无明确理解用途时采用静态形式；缺失规则不补造确定结果 |
| **Step 5 — Build and Verify HTML through Sites** | 形成制作交接包，调用 Sites，使用本地材料、主题与脚本制作网页，完成最小检查与发布 | 区分计划、尝试、执行与验证；报告实际变化、异常和覆盖范围 | 本地生成、样式注入、复制反馈、静态检查、通用渲染检查；Sites 发布 | 核对关键内容、实际输出、主流程和访问范围；按原因返回第 2–4 步 |
| **Step 6 — Evaluate and Revise** | 上线后收集 Owner 体检结果，修复实际问题；任务需要时另行开展学习者评价 | Evidence Before Confidence；限制、负结果及完成依据明确 | 题目—反馈—来源回链；按需进行静态与交互对照 | 体验、工程表现与理解效果分别报告；修订后复验受影响部分 |

第 2–4 步允许往返。评价判准从第 1 步开始定义，可访问性从结构与控件选择时介入。

### Clarification and Pending Answers

澄清与待答处理。

提问协议保存在插件本地，不依赖其他访谈插件：

- 只询问会实质影响内容或方案的未定事项。
- 提供有实际差异的选项，标记推荐并说明理由。
- 当前任务已有有效确认时复用。
- 推荐、预选、沉默、超时和窗口关闭不计作回答。
- 必需回答未取得时保持同一待答状态。

优先使用宿主支持的原生提问界面。弹窗是否持续显示须实际验证，插件不能承诺锁住宿主窗口。完整弹窗体验可列入上线后体检；缺少必要回答时不得自行推进。

## 6. Tool Migration Plan

首版工具迁移计划。

### 6.1 Adopted Capabilities

| 首版能力 | 来源与迁入方式 | 本地落点 | 必要改动 |
|---|---|---|---|
| **样式注入** | 参考 [finish_birch_html.py](https://github.com/evalstate/birch-html/blob/e2ea9a3aca7e97f2b2a431cfa392aa4e99d8fa90/skill/scripts/finish_birch_html.py)，结合本项目生成器适配 | `render-site.mjs`、`theme.css` | 换成本地暖白／陶土主题；移除原仓库路径回退；输出到独立目录 |
| **复制反馈** | 参考 [birch-copy.js](https://github.com/evalstate/birch-html/blob/e2ea9a3aca7e97f2b2a431cfa392aa4e99d8fa90/skill/scripts/birch-copy.js)，优先复用本项目已有实现 | `learning.js` | 保留真实成功、失败、手动复制及焦点处理；名称和反馈使用中文 |
| **静态检查** | 泛化本项目 [static-check.py](D:/workspace/11-knowledge/02-Interactive-HTML-Understanding-Research/artifacts/HC-004-execution-guide/snapshot/qa/static-check.py:1) | `check_artifact.py` | 移除固定教材断言；检查结构、链接、资源、配置、术语映射及版本 |
| **通用渲染检查** | 从 [check_birch_renderings.py](https://github.com/evalstate/birch-html/blob/e2ea9a3aca7e97f2b2a431cfa392aa4e99d8fa90/scripts/check_birch_renderings.py) 提取通用部分 | `check_renderings.py` | 删除 Birch 专用配色、类名和阈值；适配中文、Windows 与浏览器路径；区分实际检查和跳过项 |

静态术语检查只能发现已知映射的不一致，不能自动证明内容语义正确。

渲染检查首版优先覆盖横向溢出、严重裁切、异常换行和必要截图，不建立复杂视觉评分体系。浏览器不可用时报告未检查范围；不能把跳过写成通过。

### 6.2 Existing Local Resources

| 现有资源 | 处理方式 |
|---|---|
| [build-site.mjs](D:/workspace/11-knowledge/02-Interactive-HTML-Understanding-Research/artifacts/HC-004-execution-guide/snapshot/build-site.mjs:1) | 泛化为 `render-site.mjs`，移除固定主题、六章、题目、日期、个人路径和 Site 身份 |
| [styles.css](D:/workspace/11-knowledge/02-Interactive-HTML-Understanding-Research/artifacts/HC-004-execution-guide/snapshot/dist/styles.css:1) | 提取本地主题，按生成页面复核排版与对比度 |
| [app.js](D:/workspace/11-knowledge/02-Interactive-HTML-Understanding-Research/artifacts/HC-004-execution-guide/snapshot/dist/app.js:1) | 提取反馈、改答失效、重置、导出和复制能力，删除案例绑定 |

生成器必须明确支持的 Markdown 范围。不支持的结构应报告，不能静默丢失内容。

### 6.3 Deferred Tools

首版不迁入以下运行工具：

- HTML Plan 的 [pack.mjs](https://github.com/anthropics/claude-plugins-community/blob/06ec7b6a0a82bdc4bec44bd82d4368c42f20d7c1/html-plan/skills/html-plan/runtime/pack.mjs)、[htmlplan.js](https://github.com/anthropics/claude-plugins-community/blob/06ec7b6a0a82bdc4bec44bd82d4368c42f20d7c1/html-plan/skills/html-plan/runtime/htmlplan.js)及[htmlplan.css](https://github.com/anthropics/claude-plugins-community/blob/06ec7b6a0a82bdc4bec44bd82d4368c42f20d7c1/html-plan/skills/html-plan/runtime/htmlplan.css)。有代码摘录、专用关系组件或单文件导出需求时再评估。
- Birch 的 [run_skill_evals.py](https://github.com/evalstate/birch-html/blob/e2ea9a3aca7e97f2b2a431cfa392aa4e99d8fa90/scripts/run_skill_evals.py)、[视觉模型审查](https://github.com/evalstate/birch-html/blob/e2ea9a3aca7e97f2b2a431cfa392aa4e99d8fa90/scripts/review_birch_screenshots_with_vision.py)与 [GEPA](https://github.com/evalstate/birch-html/blob/e2ea9a3aca7e97f2b2a431cfa392aa4e99d8fa90/scripts/optimize_birch_skill_with_gepa.py)。这些不属于首版制作链路。

不预建没有实际用途的 vendor 目录或空工具包装。

## 7. Visual and Learning Defaults

视觉与学习体验默认规范。

视觉采用“暖白纸面与陶土色，参考 Thariq 示例”，保留本插件自己的身份和组件。

参考：[Thariq 的 HTML 方法文章](https://claude.dev/blog/using-claude-code-the-unreasonable-effectiveness-of-html/)及[概念解释示例](https://github.com/ThariqS/html-effectiveness/blob/1787245d94aa680edf18b52027e3f859032776ba/15-research-concept-explainer.html)。

| 项目 | 默认方案 |
|---|---|
| 页面底色 | 暖白 `#faf9f5` |
| 主文字 | `#252521` |
| 正文文字 | `#42423c` |
| 强调色 | 陶土色 `#b45a3b` |
| 链接及深色强调 | `#93442c`，结合实际背景检查对比度 |
| 辅助底色 | `#f0ece2` |
| 字体 | 衬线标题、系统无衬线正文；不远程加载字体 |
| 布局 | 清晰层级、舒适行宽、留白、细分隔线及邻近说明 |
| 动效 | 有解释用途时采用，并考虑减少动效 |

学习内容按以下候选结构组织：

**Overview → Necessary Foundations → Topic Explanation and Local Practice → Integrated Practice**

其中文说明、案例与活动使用中文。章节专用概念就地解释，已有基础的读者可以跳过基础导读。

关键结论、限制及需要比较的信息保持易于发现。默认保留可取得必要内容的静态读取路径。

## 8. Sites Production Contract

Sites 制作与发布合同。

### 8.1 Production Handoff

第 1–4 步完成后形成范围明确的交接包，包含：

- 已确认的读者、任务、理解目标和完成范围。
- Markdown 正文、术语映射和必要来源材料。
- 信息结构、关系说明与交互说明。
- 本地模板、主题和必要组件。
- 检查问题、判准及其依据。
- 内容版本、文件清单、未决事项和最小验收要求。

不打包整个工作区，不携带其他研究目录、旧 Site 身份、凭据或历史通过记录。

### 8.2 Actual Sites Execution

网页制作阶段实际调用 Sites，并读取其当前安装版本的工作流：

1. 明确新建或更新对象。
2. 使用交接包和本地资源实现网页。
3. 执行适用的本地检查与主流程检查。
4. 按 Sites 要求准备精确源代码状态、保存版本并部署。
5. 核对实际返回的地址、版本、部署状态及访问范围。

新站默认私有；更新站点时保留现有身份和受众，除非用户要求变更。

凭据不进入源文件、命令参数、日志或制品。创建或部署结果不确定时先核对已有状态，避免重复创建。

Sites 不可用时保留本地交接包，明确制作或发布尚未完成。

### 8.3 Distribution Boundary

本计划以自有 Marketplace 为交付目标。安装后的技能能否实际发现并调用 Sites，必须通过一次真实主流程验证。

官方文档区分公共插件目录与本地／Git Marketplace；它们的可用范围不能互相推定。[官方插件打包说明](https://developers.openai.com/plugins/build/plugins)

[官方插件指南](https://developers.openai.com/plugins/plugin-guidelines)对公开 MCP 工具的跨插件依赖有约束，不能据此直接判定本技能方案不可用，也不能宣称已经具备公共目录上架资格。

不编造 Sites 的连接器 ID、MCP 地址或依赖字段；按实际可用机制接入。

## 9. Package Structure and Resource Governance

包结构与资源管理。

建议结构：

```text
plugins/html-guide-kit/
├── plugin.json
├── LICENSE
├── assets/                         # 保留现有插件图标
├── skills/
│   ├── guide/                      # 保留现有入口合同
│   └── site/
│       ├── SKILL.md
│       ├── agents/openai.yaml
│       ├── references/
│       │   ├── execution-guide.md
│       │   ├── aics-principles.md
│       │   ├── terminology.md
│       │   ├── interaction-patterns.md
│       │   ├── evidence-and-evaluation.md
│       │   ├── sites-handoff.md
│       │   └── resource-provenance.json
│       ├── scripts/
│       │   ├── render-site.mjs
│       │   ├── check_artifact.py
│       │   └── check_renderings.py
│       └── assets/
│           └── warm-paper/
│               ├── shell.html
│               ├── theme.css
│               └── learning.js
└── THIRD_PARTY_NOTICES.md           # 实际引入第三方内容时建立
```

脚本从明确的材料目录读取，输出到独立任务目录，不写入插件安装缓存。

运行依赖优先采用 Node.js 与 Python 标准库。浏览器与其他可选依赖单独记录，不在运行时自动安装。

来源清单记录：

- 来源名称、地址与固定版本。
- 上游文件路径和 SHA-256。
- 本地目标文件。
- 直接复制、修改或独立适配的方式。
- 修改说明及许可信息。

主要方法材料：

- [执行指南](D:/workspace/11-knowledge/02-Interactive-HTML-Understanding-Research/artifacts/HC-004-execution-guide/source.md)。
- [AICS v0.1](D:/workspace/11-knowledge/01-AI-Communication-Research/sources/cloud-learning/2026-10-07/site/dist/AICS-v0.1.md)与[当前修订解释](D:/workspace/11-knowledge/01-AI-Communication-Research/artifacts/RN-02-current-learning-reference.md)。
- [可访问性材料](D:/workspace/11-knowledge/02-Interactive-HTML-Understanding-Research/artifacts/learning-materials/RN-004-stage-3-ui-accessibility.md)。
- [评价材料](D:/workspace/11-knowledge/02-Interactive-HTML-Understanding-Research/artifacts/learning-materials/RN-006-stage-5-evaluation.md)。

外部代码使用遵循对应许可，保留来源及修改说明：

- [Birch 许可证](https://github.com/evalstate/birch-html/blob/e2ea9a3aca7e97f2b2a431cfa392aa4e99d8fa90/LICENSE)。
- [Thariq 示例许可证](https://github.com/ThariqS/html-effectiveness/blob/1787245d94aa680edf18b52027e3f859032776ba/LICENSE)。

不把派生阅读材料当作原始规范，也不将第三方文件自动改标为插件自身的 MIT。

## 10. Implementation Phases

实施阶段。

| 阶段 | 工作内容 | 阶段结果 |
|---|---|---|
| **P0 — Contract and Integration Check** | 读取最新仓库约定；确认入口、权限、Sites 工具发现路径和首版范围 | 扩展 ADR 与精简验收判准 |
| **P1 — Local Method and Language Migration** | 本地化六步指南、AICS、术语和交互方法；移除跨仓库运行依赖 | 可独立分发的方法资源 |
| **P2 — Tool Adaptation** | 实现样式注入、复制反馈、静态检查及通用渲染检查 | 本地工具、主题及代表性样例 |
| **P3 — Atomic Plugin Integration** | 接入 `site` 技能、manifest、资源登记、安装比较和文档 | 可安装的完整候选包 |
| **P4 — Minimum Prelaunch Checks** | 执行适用自动检查；在一个目标客户端完成代表性材料到 Sites 的真实主流程 | 最小检查记录和已知限制 |
| **P5 — Release and Owner Inspection** | 按项目规则上线；Owner 实际体检；修复并复验受影响部分 | 发布记录、体检结果及剩余待办 |

真实 Sites 主流程尽量与代表性样例检查合并，不为不同阶段重复建立同类测试站。

实施使用独立 worktree。过程计划放入 Epic、子 Issue 和 PR；文档遵守仓库现有 ADR、SPEC、GUIDE、RUNBOOK 格式。

原 HTML Guide Kit 的历史范围与记录保留，本次扩展另行记录。

### Required Repository Updates

需要同步的工程位置：

- `scripts/validate-portable.mjs`：登记新技能、能力和包内资源。
- `scripts/smoke-codex-plugin.mjs`：隔离安装及运行资源比较。
- `tests/html-guide-kit.test.mjs` 与必要新增测试。
- manifest 示例提示：覆盖两个本包入口，保持现有数量与字符预算。
- 根 `AGENTS.md`、相关规范、使用指南、验收记录与文档索引。

版本从实施时实际版本递增；按本次核对的当前约定，首次修改已合入的 0.1.0 运行内容推进至 0.1.1。Marketplace 与其他插件版本按各自规则处理。

## 11. Minimum Prelaunch Acceptance

上线前最小验收。

本次采用以下四项门槛，不要求完整双客户端体验、穷举交互分支或建立大规模模型评测矩阵。

| 项目 | 最低通过条件 |
|---|---|
| **安装与本地独立** | 插件可安装、入口可调用、包内资源完整；核心流程不依赖原研究仓库或其他插件缓存 |
| **核心内容正确** | 用代表性材料核对关键结论、条件、例外及练习判准；英文核心名称、中文解释与活动符合约定，关键术语一致 |
| **Sites 主流程可用** | 在一个目标客户端实际完成“材料输入 → 六步制作 → Sites 发布”，取得可访问网页；版本与访问范围正确 |
| **工程与发布边界** | 仓库现行 CI、合并门禁通过；许可记录齐备；发布包无凭据或非预期材料 |

按照项目现行入口执行：

```text
npm test
npm run validate
npm run check
npm run smoke
```

保持原有自动检查强度；新增检查围绕实际迁移能力及高影响错误，不编写只匹配固定文案的测试。

### Blocking and Nonblocking Findings

问题分级。

**阻断上线：**

- 无法安装、资源缺失或核心流程无法完成。
- 关键内容、条件或判准存在影响使用的错误。
- Sites 身份或访问范围错误。
- 凭据泄露、非预期材料发布。
- 必要工程门禁失败。

**允许上线后修正：**

- 局部排版与次要交互问题。
- 非关键文案、术语呈现和视觉一致性问题。
- 第二客户端及非核心边界场景尚未覆盖。
- 完整可访问性审查尚未实施。

非阻断问题登记影响和待办，不将尚未检查的项目写成通过。

## 12. Postlaunch Owner Inspection

上线后 Owner 体检。

| 项目 | 体检重点 |
|---|---|
| **真实制作体验** | 提问是否必要，六步流程是否顺畅，语言分工与术语是否清楚，内容深度及生成结果是否合适 |
| **网页阅读与操作** | 暖白／陶土风格、桌面与手机排版、反馈、复制、导出及基础可访问性 |
| **扩展与异常场景** | 第二客户端、复杂材料、冲突与缺失信息、弹窗体验及失败恢复 |

Owner 提交问题后，按影响修复并复验受影响部分，不默认重新执行完整矩阵。

本次将完整双客户端、视觉与扩展场景验收后移的决定，须写入实施 ADR、SPEC 和 RUNBOOK，避免继续按旧矩阵判断完成。

## 13. Completion and Reporting

完成判断与结果报告。

分别记录：

| 结果 | 使用条件 |
|---|---|
| **上线前检查通过** | 四项最小门槛取得相应证据 |
| **已上线，待 Owner 体检** | 实际发布成功，上线后体验验收仍开放 |
| **Owner 体检完成** | 已记录实际检查范围、接受结果和剩余问题 |

插件上线、Sites 网页发布和 Owner 体检分别记录，不互相替代。

完成报告至少包含：

- 实际插件版本与对应源代码版本。
- 实际 Sites 地址、保存版本和部署状态。
- 已执行检查及结果。
- 未检查范围、已知限制和后续待办。

Owner 体检可以验收使用体验与功能。若未开展学习者表现测量，理解效果继续标记为 **NOT_MEASURED**，不阻断此次上线，也不据页面美观、控件可用或单次答对宣称理解改善。
