# learn-kit 03 · RFC 2119 Worked Example

> 学习目标：通过 RFC 2119 这个完整 worked example，把抽象的 8 阶段方法论"贴着实例走一遍"。读完这份比读理论快得多。

---

## 0 为什么用 RFC 2119 作为范例

RFC 2119 是 IETF 1997 年发布的 BCP 14（Best Current Practice），定义了 5 个核心 normative keyword：

> **MUST / MUST NOT / SHOULD / SHOULD NOT / MAY**（外加 3 个同义词：REQUIRED / SHALL / RECOMMENDED 等）

它是 learn-kit 方法论的**完美靶子**：

| 特性 | 为什么适合范例 |
|------|--------------|
| 规则数 = 5（去同义后） | 在 5–30 适用区间内，刚好够诱出 2 维框架 |
| 同类型条款扎堆 | "必须 / 不应"+"绝对 / 强烈 / 可选"二分结构 |
| 跨文化通用 | 任何工程师都熟悉 |
| 已有原始三分 | 提供"伪框架陷阱"练习机会 |
| 验证全 6 项失真 | 本案例 6 类失真全部 pass，可作正向对照 |

---

## 1 Stage 1 · Source Intake（源材料入料）

**第一轮扫描**：

- 8 个 keyword（5 unique + 3 同义词）
- 源材料预存"绝对要求 / 强烈建议 / 可选"**三分**
- 这是源的**原始分组**，**不一定是最终框架**

**关键判断**：三分结构是分类起点，但隐含**双轴可挖**——强制度（mandate level）× 极性（positive / negative）。

> 如果停在三分，就会变成"按原始结构复述"——犯 §1 反例。

---

## 2 Stage 2 · Framework Induction（框架归纳）

**诱出 2 个独立轴**：

### 轴 1 · Mandate Level（强制度）

| 值 | 含义 | 违反后果 |
|----|------|---------|
| **Absolute** | 绝对要求 / 绝对禁止 | 不合规（non-compliant）|
| **Strong** | 强烈建议 / 强烈反对 | 需有充分理由 + 文档化偏离 |
| **Optional** | 真正可选 | 无后果 |

行业术语锚：**RFC normative language（IETF 学派）**；与 ISO 标准的 "shall / should / may" 一脉相承。

### 轴 2 · Polarity（极性）

| 值 | 含义 |
|----|------|
| **Positive** | 要做（do X）|
| **Negative** | 不要做（don't do X）|
| **Neutral** | 任选（may do or not）|

行业术语锚：**语言学 / 命题逻辑**（affirmative / negative / neutral）。

### 验证 4 条原则

| 原则 | 本例满足吗 |
|------|----------|
| 骨架先于细节 | ✅ 先有 2 轴，再让 5 keyword 归位 |
| 维度独立 | ✅ Mandate 与 Polarity 互不干扰 |
| 行业有词根 | ✅ RFC normative language + 语言学 |
| 轴的总数 3–7 | ✅ 2 轴（下限放宽到 2 因为本例只有 5 条规则）|

---

## 3 Stage 3 · Categorical Alignment（类别对仗）

**2×3 笛卡尔积 → 5 类**：

|  | Positive | Negative | Neutral |
|---|---|---|---|
| **Absolute** | MUST / REQUIRED / SHALL | MUST NOT / SHALL NOT | — |
| **Strong** | SHOULD / RECOMMENDED | SHOULD NOT / NOT RECOMMENDED | — |
| **Optional** | — | — | MAY / OPTIONAL |

笛卡尔积本应 6 格，但 **Optional 极性不分**（语义上没有"必须可选地做"或"必须可选地不做"），合并 1 格 → **5 类**。

5 类小标题格式（验证 §3 原则 2）：

```text
类别 A · Absolute / Positive · MUST · 红灯·必须做
类别 B · Absolute / Negative · MUST NOT · 红灯·必须不做
类别 C · Strong / Positive · SHOULD · 黄灯·应该做
类别 D · Strong / Negative · SHOULD NOT · 黄灯·不应做
类别 E · Optional / Neutral · MAY · 绿灯·可任选
```

每个类别 4 件齐备：字母 + 双轴值 + 英文 keyword + 比喻名（信号灯）。

---

## 4 Stage 4 · Asymmetry Handling（非对称处理）

MAY 是 **极性中立**——这是非对称：

| 分类视角 | 强制部分（MUST / SHOULD）| 可选部分（MAY）|
|----------|------------------------|---------------|
| 分类问题 | "做这事的强制度？" | "做或不做都行" |
| 极性 | 明确（positive / negative）| 中立（neutral）|
| 类别数 | 4（2 强制 × 2 极性） | 1 |

**显式声明**：MAY 不强制 Polarity 分类——一个 MAY 句子可以是 "MAY do X" 也可以隐含 "MAY not do X"，本质上极性中立。

如果硬把 MAY 拆成"MAY do / MAY not do"两类填满 6 格，就会犯 §4 反例（伪对称）。

---

## 5 Stage 5 · Terminology Pairing（术语成对）

每类挂的英文术语 + 本地比喻名：

| 类别 | 英文术语 anchor | 本地比喻名 |
|------|---------------|-----------|
| A | Absolute / Positive | 红灯·必须做 |
| B | Absolute / Negative | 红灯·必须不做 |
| C | Strong / Positive | 黄灯·应该做 |
| D | Strong / Negative | 黄灯·不应做 |
| E | Optional / Neutral | 绿灯·可任选 |

英文术语 anchor 是 IETF RFC normative language——可在 Wikipedia 查到，可挂行业知识网。

本地比喻名是"信号灯颜色 + 极性动作"，是**图像而非翻译**。

---

## 6 Stage 6 · Metaphor Unification（比喻统一）

**选定单一比喻世界**：**交通信号灯系统**。

| 类别 | 信号灯 | 现实场景对应 |
|------|--------|-------------|
| A. MUST | 🔴 红灯（必须停 / 必须做）| 红灯禁止通行——必须停车 |
| B. MUST NOT | 🔴 红灯（禁止 X）| 红灯禁止右转——某操作被禁止 |
| C. SHOULD | 🟡 黄灯·正向 | 黄灯减速——强烈建议这样做 |
| D. SHOULD NOT | 🟡 黄灯·反向 | 黄灯警示——强烈不建议这样做 |
| E. MAY | 🟢 绿灯 | 绿灯通行——任选 |

**为什么选交通信号灯**（4 个理由）：

1. **国际通用**——任何文化都识别红黄绿三色
2. **三色对应 3 个强制度**（Absolute / Strong / Optional）
3. **红灯有"必须"+"禁止"的双极性**——恰好覆盖 MUST + MUST NOT 两类
4. **黄灯有"减速"语义**——对应"偏离需理由"

✅ 5 个 sub-metaphor 全部落在同一域内——**完全统一**，无半体系化。

---

## 7 Stage 7 · Page Assembly（版式装订）

最终交付的版式：

```text
0 TL;DR (Mandate × Polarity = N, 5 keyword 形成 2 维布尔模型, 信号灯比喻)
1 框架 (轴 1 Mandate Level 表 + 轴 2 Polarity 表 + 2×3 笛卡尔积)
2 类别 A-E (每类 4 件齐备)
3 决策图 (5 灯 AND-gate ASCII 树)
4 非对称处理表 (MAY 中立)
5 比喻系统表 (5 类→信号灯)
6 口诀 (MPN)
7 §8 quality gates 自检 (6 类全 pass)
```

**5 灯 AND-gate 决策图**：

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

## 8 口诀 · MPN

**MPN**：**M**andate × **P**olarity = **N**ormative

```text
看红灯停（MUST），看红叉禁（MUST NOT），
看黄灯让（SHOULD），看黄叉避（SHOULD NOT），
看绿灯随你（MAY）。
```

**怎么用**：每读到 RFC 中的 normative keyword，第一反应是"信号灯什么颜色"：
- 🔴 红 → 不合规警报
- 🟡 黄 → 偏离要文档化
- 🟢 绿 → 实现者自由

5 字母绑 5 个具体动作，验证 §7 原则 4「口诀绑动作」。

---

## 9 §8 Quality Gates 自检

| # | 失真类型 | 本文是否中招？ | 论据 |
|---|---------|-------------|------|
| 1 | 半体系化 | ❌ | 全部统一在"交通信号灯"比喻世界 |
| 2 | 伪对称 | ❌ | §4 显式声明 MAY 极性中立，未硬拉成 6 格 |
| 3 | 术语脱靶 | ❌ | 每类挂行业术语（IETF RFC normative language） |
| 4 | 框架隐藏 | ❌ | §0 TL;DR 前置 2 维布尔模型 |
| 5 | 悬空引用 | ❌ | 无未解释引用 |
| 6 | 三段冗余 | ❌ | 信息在框架表 + ASCII 树 + 5 类细化中各表达一次（递进，非重复） |

✅ 6 类失真均不命中——本文是方法论的**正向标杆**。

---

## 10 方法论 8 阶段在本案例的映射

| 方法论阶段 | 本案例应用 |
|-----------|----------|
| §1 Source Intake | 8 keyword（5 unique + 3 同义） + 三分预存 |
| §2 Framework Induction | 2 轴：Mandate Level × Polarity |
| §3 Categorical Alignment | 5 类 = 2×2 + 1 neutral |
| §4 Asymmetry Handling | MAY 极性中立显式声明 |
| §5 Terminology Pairing | IETF normative language + 语言学 |
| §6 Metaphor Unification | 交通信号灯单一比喻世界 |
| §7 Page Assembly | TL;DR → 框架 → 类别 → 比喻 → 口诀 |
| §8 Quality Gates | 6 类失真全部 pass |

---

## 11 改造为你自己的 [LEARNING] 文档

要把本 worked example 改造成 RFC 2119 之外的解读：

1. **替换 §0 TL;DR**：换核心模型名（"Mandate × Polarity"）和具体规则数
2. **替换 §1 框架**：换轴名 + 行业术语
3. **替换 §2 类别**：按你的 N 维笛卡尔积调整
4. **§3 非对称端**：如有，按 MAY 模式显式声明
5. **§4 比喻世界**：选 1 个统一的（不一定是交通信号灯）
6. **§5 口诀**：设计 N 字母（如 MPN）+ 绑动作
7. **§6 自检**：跑一遍 6 类失真闸门

---

## 12 关键源文件指针

| 想读哪里 | 文件 |
|---------|------|
| 完整 worked example（249 行）| `plugins/learn-kit/skills/init/references/rfc-2119-keywords-pedagogy.md` |
| 对应方法论 | `plugins/learn-kit/skills/init/templates/METHODOLOGY.md` §1-§8 |
| RFC 2119 原文 | https://www.rfc-editor.org/rfc/rfc2119 |

---

## 13 自检问题

1. 为什么 RFC 2119 的 5 keyword 能用 2 维（而不是 3 维或 1 维）框架完整覆盖？
2. MAY 为什么是极性中立的？强行拆成 "MAY do / MAY not do" 会犯哪条失真？
3. 交通信号灯比喻为什么比"教师评分"或"医院分级"更适合？
4. MPN 口诀里的"N"代表什么？为什么不用"M"或"R"？
5. 把这套方法论改造去解读 OWASP Top 10 时，§1 Source Intake 应该数到几条？预期会诱出几个轴？
