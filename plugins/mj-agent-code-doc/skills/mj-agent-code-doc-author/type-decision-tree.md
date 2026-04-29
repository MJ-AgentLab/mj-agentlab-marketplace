# 8 类 code-side canonical 决策树

> 用法：从 root 节点开始，按问题分支选 yes/no，到达叶子节点即得文档类型。

## 决策路径

```
START: 我要写一个文档，但不确定哪一类？
│
├── Q1: 是否需要记录"为什么这样选 / 决策依据"？
│   ├── YES → ADR
│   └── NO → 继续 Q2
│
├── Q2: 是否描述"如何操作 / 步骤序列"？
│   ├── YES → 继续 Q2.1
│   │   ├── Q2.1: 是否针对故障应对？
│   │   │   ├── YES → RUNBOOK（故障应对类）
│   │   │   └── NO → 继续 Q2.2
│   │   ├── Q2.2: 是否针对常规操作（部署 / 维护 / 测试）？
│   │   │   ├── YES → RUNBOOK（常规操作类）
│   │   │   └── NO → GUIDE（教程类）
│   └── NO → 继续 Q3
│
├── Q3: 是否描述"接口 / schema / 协议规范"？
│   ├── YES → SPEC
│   └── NO → 继续 Q4
│
├── Q4: 是否复盘"已经发生的事故 / 失败"？
│   ├── YES → POSTMORTEM
│   └── NO → 继续 Q5
│
├── Q5: 是否定义"跨多个领域 / 多个文档强制的规则"？
│   ├── YES → STANDARD
│   └── NO → 继续 Q6
│
├── Q6: 是否记录"已知问题 / 待解项 / blocking"？
│   ├── YES → ISSUE
│   └── NO → 继续 Q7
│
└── Q7: 是否做"技术选型 / 评估 / 对比"？
    ├── YES → ASSESSMENT
    └── NO → 重新审视：可能不是 canonical，应该是 PLAN（working layer，用 plan skill）
```

## 边界判定（容易混淆的对子）

### ADR vs SPEC

- **ADR**：决策的**理由 + 选择**。回答"为什么用 PostgreSQL 而非 MongoDB"
- **SPEC**：决策的**实现细节**。回答"PostgreSQL 数据库的 schema / 表 / 索引长什么样"

> **判断**：如果文档主要在"陈述选择 + 论证"，是 ADR；如果在"详细规定字段 / 接口形态"，是 SPEC。可以同时存在（先 ADR 决策、再 SPEC 实现）。

### GUIDE vs RUNBOOK

- **GUIDE**：教程性质，**面向初学者**或**第一次做某事的人**。"如何在本地跑 LangGraph Studio"
- **RUNBOOK**：操作手册，**面向已熟悉系统的运维 / 待命人员**。"production 数据库故障切换 SOP"

> **判断**：受众是新手 → GUIDE；受众是 oncall → RUNBOOK。RUNBOOK 通常更精炼、更动作导向（命令 + 验证），GUIDE 通常多解释。

### POSTMORTEM vs RUNBOOK

- **POSTMORTEM**：事故**已经发生**后写的复盘
- **RUNBOOK**：故障**应对前** / 应对中**的操作流程**

> **判断**：时间向 → POSTMORTEM 是过去时；RUNBOOK 是未来 / 现在时。

### STANDARD vs ADR

- **STANDARD**：跨多个领域 / 多个文档**强制**的规则。"所有 commit message 必须用 conventional format"
- **ADR**：单个**决策点**。"为某个具体问题选择某个方案"

> **判断**：如果规则会影响多个文档 / 多个 PR / 多个团队的行为，是 STANDARD；如果只是某个孤立决策，是 ADR。STANDARD 通常引用一组 ADR 作为决策依据。

### ISSUE vs POSTMORTEM

- **ISSUE**：**正在发生 / 待解决**的问题
- **POSTMORTEM**：**已经过去**的事故

> **判断**：状态不同。ISSUE 用 `status: open/in-progress/blocked`；POSTMORTEM 用 `status: closed`。

### ASSESSMENT vs ADR

- **ASSESSMENT**：评估对比**多个候选方案**，不一定有最终选择
- **ADR**：在多候选方案中**选定一个**

> **判断**：ASSESSMENT 通常是 ADR 的前置——先评估，再决策。ADR 应该引用 ASSESSMENT 作为依据。

## 判断不确定时的 fallback

- 如果 Q1-Q7 都 NO，且涉及跨多文档协调，应该是 **PLAN**（不是 canonical），用 `mj-agent-code-doc-plan` skill
- 如果不能在 8 类中归类，可能你写的不是 code-side 文档（譬如是 SKILL / PROMPT / EVAL / CONTRACT），应该用 `mj-agent-agent-doc` plugin（Phase 落地后）
- 如果 8 类都不像，可能本就不应该写文档；先想清楚"这个文档要解决什么问题"

## 反例（错误归类）

- ❌ 把"如何做某事的教程"写成 ADR → 应该是 GUIDE
- ❌ 把"接口字段定义"写成 GUIDE → 应该是 SPEC
- ❌ 把"事故复盘的根因分析"写成 RUNBOOK → 应该是 POSTMORTEM
- ❌ 把"团队 commit 规范"写成 ADR → 应该是 STANDARD（除非是单次"为什么选这个规范"的决策点；通常该决策点也独立写 ADR）
