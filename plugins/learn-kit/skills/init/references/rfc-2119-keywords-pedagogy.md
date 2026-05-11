---
type: "learning"
topic: "rfc"
summary: "RFC 2119 5 个 normative keyword 的决策框架解读 — Mandate × Polarity 2 维 AND-gate + 交通信号灯比喻 + MPN 口诀。Worked example demonstrating the 8-stage methodology end-to-end."
source: "[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119)"
methodology: "[METHODOLOGY](../templates/METHODOLOGY.md)"
tags:
  - "learning"
  - "rfc"
  - "rfc-2119"
  - "normative-keywords"
  - "worked-example"
aliases:
  - "RFC 2119 Keywords Interpretation"
  - "Normative Keywords Pedagogy"
created: "2026-05-11"
updated: "2026-05-11"
state: "active"
version: "v1.0"
---

# RFC 2119 Normative Keywords — 决策框架解读（worked example）

> **角色**：本文是 `learn-kit` 插件附带的 8 阶段方法论 worked example，演示如何把 [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) 的 5 个 normative keyword 解读成"决策框架文档"
> **源**：RFC 2119 全文 8 个 keyword：MUST / REQUIRED / SHALL / MUST NOT / SHALL NOT / SHOULD / RECOMMENDED / SHOULD NOT / NOT RECOMMENDED / MAY / OPTIONAL（合并同义后 5 个核心 + 1 个中性）
> **方法论**：本插件 `templates/METHODOLOGY.md` 8 阶段

---

## 0 TL;DR

RFC 2119 的 5 个核心 normative keyword 形成 **2 维布尔模型**（Mandate Level × Polarity），用**交通信号灯**比喻可视化：

- **MUST / MUST NOT** = 红灯（绝对强制 / 绝对禁止）—— 违反 = 不合规
- **SHOULD / SHOULD NOT** = 黄灯（强烈建议 / 强烈不建议）—— 偏离需理由
- **MAY** = 绿灯（任选）—— 实现者自由决定

口诀：**Mandate × Polarity = N**（强制度 × 极性 = Normative）

---

## 1 框架：Mandate Level × Polarity（2 维布尔模型）

### 1.1 轴 1 · Mandate Level（强制度）

| 强制度 | 含义 | 违反后果 |
|--------|------|---------|
| **Absolute** | 绝对要求 / 绝对禁止 | 不合规（non-compliant）|
| **Strong** | 强烈建议 / 强烈反对 | 需有充分理由 + 文档化偏离原因 |
| **Optional** | 真正可选 | 无后果 |

行业术语锚：RFC normative language（IETF 学派）；与 ISO 标准的 "shall / should / may" 一脉相承。

### 1.2 轴 2 · Polarity（极性）

| 极性 | 含义 |
|------|------|
| **Positive** | 要做（do X）|
| **Negative** | 不要做（don't do X）|
| **Neutral** | 任选（may do or not）|

行业术语锚：语言学 / 命题逻辑（affirmative / negative / neutral）。

### 1.3 笛卡尔积 → 5 keyword

| | Positive | Negative | Neutral |
|---|---|---|---|
| **Absolute** | MUST / REQUIRED / SHALL | MUST NOT / SHALL NOT | — |
| **Strong** | SHOULD / RECOMMENDED | SHOULD NOT / NOT RECOMMENDED | — |
| **Optional** | — | — | MAY / OPTIONAL |

笛卡尔积本应有 6 格，但 Optional 极性不分（语义上没有"必须可选地做"或"必须可选地不做"），合并为 1 格 → 5 个核心 keyword + 3 个同义词（合并后视作 alias）。

### 1.4 决策图（5 灯 AND-gate）

```text
你看到一个 normative 句子：
                            ↓
              ┌─────────────────────────┐
              │  Mandate Level 是什么？  │
              └─────────────────────────┘
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
    Absolute            Strong              Optional
        │                   │                   │
        ↓                   ↓                   ↓
    红灯：违反=不合规     黄灯：偏离需理由        绿灯：任选
        │                   │                   │
    ┌───┴───┐          ┌───┴───┐                │
    ↓       ↓          ↓       ↓                │
  MUST   MUST NOT   SHOULD  SHOULD NOT          MAY
```

---

## 2 §3.1 — 5 类（按 2 维笛卡尔积分类）

### 类别 A · Absolute / Positive · MUST · 红灯·必须做

含义：协议实现的**绝对要求**。
同义词：REQUIRED / SHALL。
判定：违反 = 实现不合规，无 exceptions。

示例：
- "The client **MUST** include a `User-Agent` header in every request."
- "Implementations **MUST** support TLS 1.2 or higher."

### 类别 B · Absolute / Negative · MUST NOT · 红灯·必须不做

含义：协议实现的**绝对禁止**。
同义词：SHALL NOT。
判定：违反 = 实现不合规。

示例：
- "The server **MUST NOT** include any sensitive data in error responses."
- "Implementations **SHALL NOT** use deprecated cipher suites."

### 类别 C · Strong / Positive · SHOULD · 黄灯·应该做

含义：**强烈建议**，但允许例外（需有充分理由 + 文档化）。
同义词：RECOMMENDED。
判定：偏离合规，但需说明 why。

示例：
- "Servers **SHOULD** support gzip compression for response bodies."
- "Clients **SHOULD** cache successful responses according to `Cache-Control`."

### 类别 D · Strong / Negative · SHOULD NOT · 黄灯·不应做

含义：**强烈反对**，但允许例外。
同义词：NOT RECOMMENDED。
判定：偏离合规，但需说明 why。

示例：
- "Implementations **SHOULD NOT** retry idempotent requests indefinitely."
- "Servers **SHOULD NOT** log full request bodies for debugging in production."

### 类别 E · Optional / Neutral · MAY · 绿灯·可任选

含义：完全可选。
同义词：OPTIONAL。
判定：实现者自由决定，无 normative force。

示例：
- "Servers **MAY** support HTTP/2 push notifications."
- "Implementations **MAY** include additional headers for debugging."

---

## 3 非对称处理：MAY 的极性中立

按 §4 Asymmetry Handling 原则，显式说明：

| 分类视角 | 强制部分（MUST / SHOULD）| 可选部分（MAY）|
|----------|------------------------|---------------|
| 分类问题 | "做这事的强制度？" | "做或不做都行" |
| 极性 | 明确（positive / negative）| 中立（neutral）|
| 类别数 | 4（2 强制 × 2 极性） | 1 |

MAY 不强制 Polarity 分类——一个 MAY 句子可以是"MAY do X" 也可以隐含 "MAY not do X"，本质上极性中立。

---

## 4 比喻系统：交通信号灯（统一比喻世界）

所有 5 类共用一个比喻世界——交通信号灯系统：

| 类别 | 信号灯 | 现实场景对应 |
|------|--------|-------------|
| A. MUST | 🔴 红灯（必须停 / 必须做某事）| 红灯禁止通行——必须停车 |
| B. MUST NOT | 🔴 红灯（禁止 X）| 红灯禁止右转——某操作被禁止 |
| C. SHOULD | 🟡 黄灯·正向 | 黄灯减速——强烈建议这样做 |
| D. SHOULD NOT | 🟡 黄灯·反向 | 黄灯警示——强烈不建议这样做 |
| E. MAY | 🟢 绿灯 | 绿灯通行——任选 |

**为什么选交通信号灯**：

1. 国际通用——任何文化都识别红黄绿三色
2. 三色对应 3 个强制度（Absolute / Strong / Optional）
3. 红灯有"必须"+"禁止"的双极性，恰好覆盖 MUST + MUST NOT 类
4. 黄灯有"减速"语义，对应"偏离需理由"

---

## 5 口诀

**MPN**（**M**andate × **P**olarity = **N**ormative）：

> "看红灯停（MUST），看红叉禁（MUST NOT），看黄灯让（SHOULD），看黄叉避（SHOULD NOT），看绿灯随你（MAY）。"

每读到 RFC 中的 normative keyword，第一反应是"信号灯什么颜色"：
- 红 → 不合规警报
- 黄 → 偏离要文档化
- 绿 → 实现者自由

---

## 6 §8 Quality Gates 自检

| # | 失真类型 | 本文是否中招？ |
|---|---------|-------------|
| 1 | 半体系化 | ❌ 全部统一在"交通信号灯"比喻世界 |
| 2 | 伪对称 | ❌ §3 显式声明 MAY 极性中立，未硬拉成 6 格 |
| 3 | 术语脱靶 | ❌ 每类挂行业术语（IETF RFC normative language） |
| 4 | 框架隐藏 | ❌ §0 TL;DR 前置 2 维布尔模型 |
| 5 | 悬空引用 | ❌ 无未解释引用 |
| 6 | 三段冗余 | ❌ 信息只在框架表 + ASCII 树 + 5 类细化中各表达一次（递进） |

✅ 6 类失真均不命中，可交付。

---

## 7 与方法论的对应

本文是 `learn-kit` 插件方法论 v0.1 的 worked example。完整方法论见 [`../templates/METHODOLOGY.md`](../templates/METHODOLOGY.md)。

| 方法论阶段 | 本文应用 |
|-----------|---------|
| §1 Source Intake | 8 个 keyword（5 unique + 3 同义） + 三分预存 |
| §2 Framework Induction | 2 轴：Mandate Level × Polarity |
| §3 Categorical Alignment | 5 类 = 2×2 + 1 neutral，类别数 = 维度积 |
| §4 Asymmetry Handling | MAY 极性中立，显式声明非对称 |
| §5 Terminology Pairing | Mandate / Polarity 都来自 IETF normative language + 语言学 |
| §6 Metaphor Unification | 交通信号灯单一比喻世界 |
| §7 Page Assembly | TL;DR → 框架 → 类别 → 比喻 → 口诀 |
| §8 Quality Gates | 6 类失真全部 pass |

---

## 8 改造为你自己的 [LEARNING] 文档

要把本 worked example 改成 RFC 2119 之外的解读：

1. 替换 §0 TL;DR 的核心模型名（"Mandate × Polarity"）和具体规则数
2. 替换 §1 框架的轴名 + 行业术语
3. 替换 §2 的 N 个类别（按你的 N 维笛卡尔积调整）
4. 如有非对称端，按 §3 模式显式声明
5. 选 1 个统一比喻世界（不一定是交通信号灯）
6. 设计 N 字母口诀（如 RFC 2119 的 MPN）
7. 跑一遍 §6 quality gates 自检

完整方法论步骤见 [`../templates/METHODOLOGY.md`](../templates/METHODOLOGY.md) §1-§8。

---

## 版本历史

- **v1.0**（2026-05-11）：初版 worked example。源：RFC 2119（1997-03，BCP 14，by Scott Bradner）。框架：Mandate × Polarity 2 维 AND-gate。5 keyword 解读完整覆盖。
