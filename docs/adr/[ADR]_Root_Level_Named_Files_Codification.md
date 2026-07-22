---
type: adr
scope: marketplace
summary: 正向编码 5 个 root-level named special files 责任 + CLAUDE.md sync allowlist 3 类 trigger + A6 CI gate triad（complements v1.0 Reversal ADR negative cancellation）
owner: marketplace-maintainers
created: 2026-05-18
updated: 2026-07-16
state: active
version: v1.1
domain: governance
tags:
  - documentation
  - framework
  - root-files
  - claude-md-sync
  - a6-gate
related:
  - ../rule/[STANDARD]_Documentation_Framework.md
  - ./[ADR]_Documentation_Framework_Exemption_Reversal.md
  - ../runbook/[RUNBOOK]_Doc_Archive_Procedure.md
  - ../../CONTRIBUTING.md
  - ../../GLOSSARY.md
  - ../../CLAUDE.md
  - ./[ADR]_Codex_Dual_Native_Plugin_Support.md
revision: |
  2026-07-16 — v1.1: amendment only（决策不变）。标注本 ADR 的 Implementation Plan 第 9 项与 Acceptance Criteria 中的「ci.yml A6 step」为 **historical** —— Framework v1.7 将 A6 实现迁至独立 `.github/workflows/a6.yml` + `scripts/check-a6.mjs`，并首次真正校验 `[skip a6]` 所宣称的 reviewer sign-off（v1.6 实现仅凭 PR title 即放行）。§2.7 trigger 亦由 3 类扩为 4 类（加 Codex dual-native surfaces）。本 ADR 的**决策**（编码 5 个 root-level named files 责任 + 建立 CLAUDE.md sync allowlist + 启用 A6 gate）完全不变；仅实现载体与 trigger 集演进，权威描述见 Framework §4.3.1 + [`[ADR]_Codex_Dual_Native_Plugin_Support`](./[ADR]_Codex_Dual_Native_Plugin_Support.md)
  2026-05-18 — v1.0: initial decision recording v4.6.3 framework v1.6 root-level named files codification + CLAUDE.md sync allowlist + A6 CI gate activation; complements v1.0 Reversal ADR negative cancellation with positive codification
---

# [ADR] Root-Level Named Files Codification & CLAUDE.md Sync Allowlist

## Status

**Accepted** (2026-05-18). **Complements** (does NOT supersede) [`[ADR]_Documentation_Framework_Exemption_Reversal`](./[ADR]_Documentation_Framework_Exemption_Reversal.md) v1.1（同 PR bump v1.0 → v1.1 with Decision 2 partial-reversal annotation）。

> [!NOTE]
> **v1.1 amendment (2026-07-16) — 决策不变，实现载体已迁移。** 本 ADR 的 Implementation Plan 第 9 项与 Acceptance Criteria 里的 **「ci.yml A6 step」是 v4.6.3 当时的史实**，现已不存在：Framework v1.7 把 A6 实现迁至独立 [`.github/workflows/a6.yml`](../../.github/workflows/a6.yml) + Node stdlib-only [`scripts/check-a6.mjs`](../../scripts/check-a6.mjs)（单测钉死），并**首次真正校验** `[skip a6]` 所宣称的 reviewer sign-off —— v1.6 实现仅凭 PR title 就 `exit 0`，AC 第 7 项的「`[skip a6]` bypass」smoke test 因此测的是一个未被校验的旁路。§2.7 trigger 同时由 3 类扩为 4 类（新增 Codex dual-native surfaces）。
>
> 本 ADR 的**决策本身**（5 个 root-level named files 责任编码 + CLAUDE.md sync allowlist + 启用 A6 gate）完全成立且未变。A6 的权威描述以 Framework §4.3.1 为准，实现变更理由见 [`[ADR]_Codex_Dual_Native_Plugin_Support`](./[ADR]_Codex_Dual_Native_Plugin_Support.md)。

## Context

Marketplace Documentation Framework v1.5 (2026-05-18) Reversal ADR 取消了 v1.1 / v1.3 全部豁免机制，收敛 §1 为 5 类 community/external-spec exclusion + INDEX.md special clause（参 Reversal ADR）。Reversal ADR 是**负向**决策（取消 v1.1 / v1.3 历史豁免）。它留下两个未明示的正向缺口:

1. **5 类 exclusion 文件各自的内容职责未编码** — v1.5 §1 解释「为什么这些文件不能装 marketplace 8 字段 frontmatter」（外部契约），但不解释「这个文件应该写什么、不应该写什么」。Reviewer 与 AI agent 没法依靠 STANDARD 单独判断 README vs CLAUDE.md 内容边界，被迫诉诸 tribal knowledge / 既有文件「样式」推断。Onboarding 新维护者时此边界尤其模糊。
2. **`CLAUDE.md` 内容与 global standards 的同步关系是隐式 expectation** — Framework v1.5 §4.3 列出 A6 placeholder「CLAUDE.md allowlist sync」但**无 trigger 集 + 无 enforcement 机制**。任何修改 `docs/rule/[STANDARD]_*` 的 PR 是否要同步 CLAUDE.md 由 reviewer 凭感觉判断；已发生过漂移（例如 v4.6.1 引入 develop pre-bump 时 CLAUDE.md「Key Conventions」段同步是 PR-time 临时想到的，没有强制 trigger 提示作者）。

参考 `mj-system` v5.2 framework 的 §3.1 Root-Level Named Special Files + §6.4 CLAUDE.md sync trigger + §7.1 A6 PR gate patterns，借鉴**概念架构**但不复用具体规则字面（marketplace 独立性原则 per HITL STANDARD §0.3：不引用 / 不依赖任何外部项目仓库）。Marketplace 实例化时使用 marketplace 自身的术语 + scope + trigger 范畴。

## Decision

**5 项决策同时生效（Framework v1.5 → v1.6 minor bump 承载；本 ADR 是决策记录，Framework v1.6 是规则承载体）**:

### Decision 1 — §1.1 正向 codification table

Framework v1.6 §1.1 新增 5-row table，编码 README/CONTRIBUTING/CHANGELOG/GLOSSARY/CLAUDE.md 各自固定责任，每行附带 "Source of exclusion" 列区分 §1 hard（外部规范）与 §1.1 editorial convention（编辑约定）。§1 本身保持 v1.5 原样不动 → §1（反向 exclusion 表）与 §1.1（正向 codification 表）互为正反两面，命名空间独立。

### Decision 2 — CONTRIBUTING.md 回归 repo root

**Partial reversal of Reversal ADR v1.0 Decision 2's CONTRIBUTING.md handling**: v4.5.0 时 Reversal ADR 把 `docs/CONTRIBUTING.md` rename 到 `docs/guide/[GUIDE]_Contributing.md` 以加 8 字段 frontmatter；副作用是 GitHub 原生 New Issue / New PR UI 不再自动探测 contributor prompt（GitHub 仅检测 root-level `CONTRIBUTING.md`，`docs/guide/` 子目录下不触发）。v4.6.3 反转此 rename：

- `docs/guide/[GUIDE]_Contributing.md` v1.1 走 RUNBOOK `[RUNBOOK]_Doc_Archive_Procedure` Phase 1-4 archive ceremony，落 `docs/archive/[DEPRECATED]_[GUIDE]_Contributing_v1.1.md`（§2.3.1 trigger #4 split-merge-rename；flat archive layout per §2.3.5）
- 全部 body 内容（~175 lines）回归 repo-root `CONTRIBUTING.md`，路径相对 1 级上调，drop frontmatter（per §1.1 editorial convention）
- Reversal ADR 同 PR bump v1.0 → v1.1，Decision 2 row 标注 partially reversed + 双向链回本 ADR（不 supersede Reversal ADR 整份）

### Decision 3 — 新建 repo-root `GLOSSARY.md`

让 §1.1 列出的 5 个名字都对应到真文件，避免 codification 出现「frame but no body」漏洞。Starter ~20 term × 1-line definition，按字母顺序排列；按需追加；无 enforcement (§2.7 故意不把 GLOSSARY.md 列入 trigger — 术语补充不应触发 CLAUDE.md sync overhead)。

### Decision 4 — §2.7 CLAUDE.md Sync Allowlist 3-category trigger

Framework v1.6 §2.7 新增 normative 段落定义 3 类 trigger:

- **Category 1 Global Standards**: `docs/rule/[STANDARD]_*.md` 4 件
- **Category 2 Runtime Info**: `VERSION` + `.claude-plugin/marketplace.json` + `plugins/<name>/.claude-plugin/plugin.json` major/minor
- **Category 3 Directory Entries**: `.claude/skills/mp-*/` 与 `plugins/<name>/skills/<name>/` 结构变更 + `docs/` 子目录结构变更

加非触发 clause（typo / 排版 / 注释级 / CHANGELOG 累加不触发；只有结构 / 规则 / 版本 / 条目变更触发）。

### Decision 5 — A6 三层 defense-in-depth enforcement

用户决策："Full stack" enforcement：

- **Layer 1 — PR template self-check** (`.github/PULL_REQUEST_TEMPLATE.md`)：A6 checkbox（soft 提醒；不阻塞）
- **Layer 2 — Pre-commit advisory** (`/mp-doc-validate` Step 3.5)：working-tree 检测 + Warning 输出（pre-commit reminder；非 Critical）
- **Layer 3 — CI authoritative blocker** (`.github/workflows/ci.yml` validate job)：PR-diff 检测 + `exit 1` 阻断 + `[skip a6]` PR-title bypass token + reviewer sign-off 要求

三层职责分明：Layer 1 reminder / Layer 2 pre-commit / Layer 3 authoritative。任一层失效不导致漂移。

## Alternatives Considered

### Alt 1 — Amend Reversal ADR in-place 加 v1.1 «Amendments» section（非 row 修订）

**Declined**. 用 `## Amendments (post-v1.0)` block 单独段落记录反转，比直接修 Decision 2 row 更耦合（决策语义不直接体现在 Decision 表内）；reviewer 阅读 Reversal ADR Decision 段时容易漏掉底部 Amendments 段。我们选择 in-place row 修订 + revision block 追加（用户决策 "Bump Reversal ADR to v1.1 with revised Decision 2 row"），双向链建立 row 与 row 之间直接 reference。

### Alt 2 — Archive Reversal ADR + supersede 全新 ADR

**Declined**. Reversal ADR 的 v1.5 §1 cancellation 决策仍 100% 有效；只是其 CONTRIBUTING handling 子项被本 ADR 局部反转。supersede 整份是杀鸡用牛刀，且会让 Reversal ADR Context / 4 项 Alternatives Considered / Negative consequences 评估都 frozen 到 archive 区，丢失「v1.5 → v1.6 是连续演进」的脉络。

### Alt 3 — CONTRIBUTING.md 留在 `docs/guide/` 仅在 root 加 1 行 stub pointer

**Declined**. GitHub UI 探测 root `CONTRIBUTING.md` 是「有内容」式探测（不是空文件 + redirect 探测），stub pointer 触发不出 native New Issue / New PR contributor prompt；只能完整内容回归 root 才能恢复 UI 集成。

### Alt 4 — A6 仅 PR template 不上 CI（轻量化）

**Declined**. 用户决策 #3 明确 "Full stack"；CI 是 authoritative blocker，单 PR template 容易被忽略（reviewer 与 author 都可能漏勾）。三层 defense 成本可控（CI step ~32 行 yaml + skill ~20 行 step 描述）。

### Alt 5 — A6 上 CI 但非 blocking（warn-only 跟 `verify-develop-prebumped.yml` 一致）

**Declined**. allowlist 漂移会让 AI agent 上下文与权威源失配，下游 cost（agent 误判 / 错误执行）远高于 CI 阻断 cost；blocking 更符合 §4.3 表 "Gate" 语义。`[skip a6]` bypass 已覆盖极罕见正当情境，不需要默认 warn-only。

## Consequences

### Positive

- **§1 + §1.1 互补对** → reviewer 与 AI agent 判断 root file 编辑边界有 STANDARD 单一来源；无需诉诸 tribal knowledge
- **CONTRIBUTING.md 回 root** → GitHub 原生 New Issue / New PR contributor prompt UI 恢复；外部贡献者发现路径短（直链 https://github.com/...//blob/main/CONTRIBUTING.md）
- **§2.7 + §4.3.1 A6** → CLAUDE.md 漂移风险结构化封堵；3 层 defense 相互独立
- **GLOSSARY.md 让 §1.1 5 个名字都有实体** → 框架名实相符；后续术语演化有锚点
- **5 项决策同 PR landing** → 一次性完成 codification + 反转 + 启用；避免分批 ship 引入中间不稳定状态

### Negative

- 多 1 个根级文件（GLOSSARY.md）+ 1 个 ADR + 1 个 archived doc → 维护面增加；通过 A6 CI 自动 enforcement 摊薄人工成本
- CI A6 阻断可能在罕见正当情境下误伤（如 docs-only typo fix 触及 §2.7 trigger 文件但 CLAUDE.md 无变更面）；通过 `[skip a6]` PR title token + reviewer sign-off bypass 缓解
- `[GUIDE]_Contributing` 又一次改路径（v4.5.0 移到 guide/，v4.6.3 移回 root）→ inbound link 二次失效；CHANGELOG / archived ADR 文本中的历史路径仍为 frozen reference 保留，不破坏 §2.3.4

### Risks

- **§2.7 trigger 边界模糊**：例如「plugin.json major bump」触发但「patch bump 仅 description 字符 trim」不触发；模糊 PR 可能误判 → mitigation: A6 step error message 输出命中文件清单 + 引用 §2.7 完整 trigger 列表 link；reviewer 与 author 在 PR comment 讨论判断
- **CI A6 实现 bug 误漏 / 误阻**：例如 regex 错配或 `git diff` 边界 case → mitigation: 4 scenario smoke test (Plan V.2) 覆盖 positive / negative / non-trigger / bypass case
- **GLOSSARY 维护代价**：~20 term 起步，但随项目演化 term set 增长。mitigation: term 添加无 enforcement，按需追加；§2.7 不把 GLOSSARY 列入 trigger（避免每次术语补充都触发 CLAUDE.md sync overhead）
- **Cross-reference fanout 漂移**：~13 living refs 升级 CONTRIBUTING 路径，少数误判 living/frozen 可能留 stale 链 → mitigation: `git grep '\[GUIDE\]_Contributing'` 全仓扫描 + RUNBOOK Phase 3.5 Gate D-02 HITL escalation

## Implementation Plan

详见 `~/.claude/plans/d-workspace-10-software-project-projects-cached-sun.md` 12-commit sequence + 15 files modified（Framework / Reversal ADR / 本 ADR / 4 + 5 root file + archive / cross-ref fanout / INDEX + CLAUDE / RUNBOOK / PR template / ci.yml / ISSUE_TEMPLATE / mp-doc-validate / CHANGELOG）。Order of Operations:

1. Framework v1.6（commit 1）
2. Reversal ADR v1.1 amend（commit 2）
3. **本 ADR v1.0 create**（commit 3 — 本 commit）
4. GLOSSARY.md（commit 4）
5. CONTRIBUTING + archive（commit 5 — **HITL Gate D-02 fires**）
6. Cross-reference fanout（commit 6）
7. INDEX + CLAUDE.md + RUNBOOK（commit 7）
8. PR template（commit 8）
9. ci.yml A6 step（commit 9 — **HITL CI/CD trigger fires**）
10. ISSUE_TEMPLATE fix（commit 10）
11. mp-doc-validate Step 3.5（commit 11）
12. CHANGELOG（commit 12）

## Acceptance Criteria

- [ ] Framework v1.6 §1.1 + §2.7 + §4.3.1 三段新增，`/mp-doc-validate` Critical=0
- [ ] Reversal ADR v1.1 Decision 2 row 标注 partially reversed；双向链回本 ADR
- [ ] 本 ADR v1.0 `state: active`；frontmatter 8 字段完整；`related:` 涵盖 5 个新文件
- [ ] `CONTRIBUTING.md` root rendered correctly on GitHub；`[GUIDE]_Contributing.md` archived with `archived:` ISO + `replaced-by:` + Archive Banner
- [ ] `GLOSSARY.md` root rendered correctly；H2 alphabetical sections；~20 term × 1-line definitions
- [ ] §2.7 allowlist 3 类 trigger 文件列表与 ci.yml regex 一致；非触发 clause 措辞清晰
- [ ] CI A6 step 4-scenario smoke test 全过（CLAUDE.md only / STANDARD-only / non-trigger / `[skip a6]` bypass）
- [ ] `/mp-doc-validate` Step 3.5 Warning posture 输出格式 OK；frontmatter description 提及 v1.6 §2.7
- [ ] PR template + ISSUE_TEMPLATE 文本更新；GitHub New Issue / PR UI auto-prompt 验证
- [ ] CHANGELOG `[Unreleased]` Added / Changed / Removed 三段对应 15 files
- [ ] 全仓 `git grep '\[GUIDE\]_Contributing'`（排除 archive 自身）：0 living references；frozen references 保留路径

## References

- [`../rule/[STANDARD]_Documentation_Framework.md`](../rule/[STANDARD]_Documentation_Framework.md) v1.6（同 PR 承载 §1.1 + §2.7 + §4.3.1）
- [`./[ADR]_Documentation_Framework_Exemption_Reversal.md`](./[ADR]_Documentation_Framework_Exemption_Reversal.md) v1.1（complementary precedent — negative cancellation；本 ADR 承担 positive codification）
- [`../runbook/[RUNBOOK]_Doc_Archive_Procedure.md`](../runbook/[RUNBOOK]_Doc_Archive_Procedure.md) v1.1（CONTRIBUTING archive ceremony 走此 RUNBOOK 4-phase + Gate D-02）
- [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)（restored at root per Decision 2）
- [`../../GLOSSARY.md`](../../GLOSSARY.md)（new per Decision 3）
- [`../../CLAUDE.md`](../../CLAUDE.md)（受 §2.7 sync allowlist + §4.3.1 A6 gate 约束的实体）
- [`../archive/[DEPRECATED]_[GUIDE]_Contributing_v1.1.md`](../archive/[DEPRECATED]_[GUIDE]_Contributing_v1.1.md)（archived; supersedes ↔ replaced-by 双向链）

## Decision Log

- **2026-05-18**: 用户在 plan 模式中 6 轮澄清后批准 5 项决策（CONTRIBUTING restore full content / GLOSSARY starter create / A6 full-stack enforcement / §1 keep untouched §1.1 own rule / Reversal ADR v1.0 → v1.1 row-revise）
- **2026-05-18**: v1.0 起草；complementary ADR 路线选定（非 amend Reversal / 非 supersede Reversal）
