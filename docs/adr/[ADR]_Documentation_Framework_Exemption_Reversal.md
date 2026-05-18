---
type: adr
scope: marketplace
summary: 取消 Documentation Framework v1.1 §1 单文件 + 教学系列模式豁免；收紧为外部规范不可绕过的 5 类 community/spec exclusion + INDEX.md 强制 frontmatter 特别条款
owner: marketplace-maintainers
created: 2026-05-18
updated: 2026-05-18
state: active
version: v1.1
domain: governance
tags:
  - documentation
  - framework
  - exemption
  - governance
related:
  - ../rule/[STANDARD]_Documentation_Framework.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../runbook/[RUNBOOK]_Doc_Archive_Procedure.md
  - ./[ADR]_Root_Level_Named_Files_Codification.md
supersedes:
  - ../archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md
revision: |
  2026-05-18 — v1.1: Decision 2 `docs/CONTRIBUTING.md` row 标注 partially reversed in v4.6.3 — content restored to repo-root `CONTRIBUTING.md` per [`[ADR]_Root_Level_Named_Files_Codification`](./[ADR]_Root_Level_Named_Files_Codification.md) v1.0 Decision 2 (Framework v1.6 §1.1 codifies CONTRIBUTING.md as root-level named special file)。Other v1.0 decisions (HITL workflow internalization / MIGRATION_GUIDE rename / INDEX special clause / teaching-series cancellation / nlm-shared cleanup) remain fully active. 非 archive trigger（单行表格修订 + revision block 追加，远小于 §2.3.1 阈值）；in-place 修订。
  2026-05-18 — v1.0: initial decision recording v1.5 framework exemption reversal; supersedes v1.0 of original Exemption Review ADR
---

# [ADR] Documentation Framework Exemption Reversal

## Status

**Accepted** (2026-05-18). Supersedes [`[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0`](../archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md) (2026-05-15, v1.0).

## Context

Marketplace Documentation Framework 在 v1.1（2026-05-15）引入了两类豁免机制：

1. **Single-file exemption** — 4 份具名文件不需要 frontmatter / `[TAG]_` 命名 / 标准子目录:
   - `docs/INDEX.md`（导航文件）
   - `docs/CONTRIBUTING.md`（社区约定）
   - `docs/MIGRATION_GUIDE.md`（release-cycle artifact）
   - `docs/ai_engineering_execution_hitl_workflow.md`（generic HITL 哲学文档，被视为可被外部项目 fork 的源文件）

2. **Pattern exemption** — `plugins/<name>/docs/<plugin>-NN-*.md` 教学系列（lowercase 数字前缀），用于保留教学排序信号。learn-kit 利用此豁免维护了 6 份 `learn-kit-01..05-*.md` + `learn-kit-使用手册.md`。

v1.3（2026-05-15）追加 normative blockquote 收紧豁免文件 frontmatter 纪律（禁止 legacy keys），并通过 v1.0 版的 `[ADR]_Documentation_Framework_Exemption_Review` 固化「保留 + 收紧」决策。

**触发本次推翻的两条新事实**:

- **Marketplace 独立性原则**: marketplace 文档体系完全独立，不引用 / 不依赖任何外部项目仓库，也不再担任任何外部项目（如 peer projects）的 fork-source。此原则使得 `ai_engineering_execution_hitl_workflow.md`「为外部项目保留 fork source」的论证基础失效。
- **豁免清单膨胀风险**: v1.1 → v1.3 一年内豁免规则积累 12 行表 + 2 个 normative blockquote；如继续按现状演进，长尾「特殊情况」会让 `/mp-doc-validate` 校验逻辑越来越分支化，最终丧失框架名实相符性。

依赖审计（marketplace 工作流功能层）发现：8 处对 `ai_engineering_execution_hitl_workflow.md` 的引用全部为「书目记账」（INDEX / MIGRATION_GUIDE 列表行、ADR exemption decision 文本、frontmatter `related` 链、CHANGELOG 历史 entry、mp-flow-intake skill reference doc 段、mp-doc-validate skill 豁免逻辑），无任何 skill / agent 把它当 source-of-truth 来读取。删除后无功能影响。

## Decision

**取消** Documentation Framework §1 全部 v1.1 / v1.3 豁免机制。新 v1.5 §1 仅保留**外部规范不可绕过**的 5 类 community/external-spec exclusion:

| Path Pattern | External Contract |
|------|--------|
| `README.md` (any depth) | GitHub public-facing entry point |
| `CHANGELOG.md` (any depth) | Keep-a-Changelog 格式 |
| `plugins/<name>/CLAUDE.md` | Claude Code plugin spec contract |
| `plugins/<name>/skills/<name>/SKILL.md` | plugin loader native frontmatter (`name` / `description` / `allowed-tools` / `disable-model-invocation`) |
| `plugins/<name>/skills/<name>/{templates,references}/*.md` | LLM-facing runtime assets (prompt templates / 参考资料) |

**INDEX.md special clause**: `docs/INDEX.md` 与 `plugins/<name>/docs/INDEX.md` **保留文件名**（所有 inbound link 稳定）+ **必须含 8 字段 frontmatter**；纳入 `/mp-doc-validate` 标准检查；不再视作 exempt。

**对应处理动作**（同 PR 完成）:

| 原豁免文件 | 处理 |
|-----------|------|
| `docs/ai_engineering_execution_hitl_workflow.md` | 删除；关键内容（universal stage skeleton + compression mapping + fork guidance）浓缩内化到 `[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` §0.1-§0.4 |
| `docs/CONTRIBUTING.md` | rename → `docs/guide/[GUIDE]_Contributing.md` + 加 8 字段 frontmatter **（partially reversed in v4.6.3 — 内容回归 repo-root `CONTRIBUTING.md` per [`[ADR]_Root_Level_Named_Files_Codification`](./[ADR]_Root_Level_Named_Files_Codification.md) Decision 2；guide 版本走 archive ceremony 至 `../archive/[DEPRECATED]_[GUIDE]_Contributing_v1.1.md`）** |
| `docs/MIGRATION_GUIDE.md` | rename → `docs/guide/[GUIDE]_Migration_From_v3_to_v4.md` + 加 frontmatter |
| `docs/INDEX.md` | 保留路径 + 加 8 字段 frontmatter（type: guide）|
| `plugins/learn-kit/docs/learn-kit-0{1..5}-*.md` (5 files) | 合并 + rename → `plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Pedagogy.md` + `[GUIDE]_LearnKit_Design.md` + 各加 frontmatter |
| `plugins/learn-kit/docs/learn-kit-使用手册.md` | 拆入 `plugins/learn-kit/README.md`（§中文 TL;DR + §Worked Cases + §Troubleshooting）+ `plugins/learn-kit/CLAUDE.md`（§Advanced Tips）|
| `plugins/notebooklm-kit/skills/nlm-shared/*.md` 行项 | 从 §1 删除（plugin 已在 v4.0.0 退役）|

## Alternatives Considered

1. **维持现状（v1.3「保留 + 收紧」路线，加 v1.4 + v1.5 patch 演进）** — **declined**
   - 拒绝理由：用户明确指示「取消豁免机制」；v1.3 的「保留 + 收紧」决策在 6 个月内即不再适用；继续 patch 累积只会让长尾分支更复杂。

2. **彻底取消（含 README / CHANGELOG / SKILL.md / CLAUDE.md / templates / references）** — **declined**
   - 拒绝理由：这 5 类受 GitHub UI 渲染 + Keep-a-Changelog 工具链 + Claude Code plugin spec + LLM runtime prompt 加载等 **外部规范刚性约束**，强制添加 marketplace 8 字段 frontmatter 会破坏渲染 / 加载 / 工具链。**技术不可行**。

3. **采纳三层治理模型（canonical / working / legacy）替代豁免概念** — **declined**
   - 拒绝理由：v2.0 级别 refactor，影响所有现有 doc 的 tier 归属；本 PR 范围已含 14 个文件改动 + 1 个 STANDARD 主版本 bump，再叠加治理模型变更会 review 失控。
   - 留作 future work（见下节）。

4. **保留 fork-source 单文件豁免（仅 `ai_engineering_execution_hitl_workflow.md` 一项）** — **declined**
   - 拒绝理由：与新确立的「marketplace 独立性原则」直接冲突；该文件的功能价值（universal stage skeleton + compression mapping）可被无损浓缩到 HITL STANDARD §0；功能层 0 依赖。

## Consequences

### Positive

- Framework v1.5 §1 名实相符：豁免规则从 12 行表 + 2 个 normative blockquote 收敛为 5 行只读 external-contract exclusion + 1 个 INDEX special clause
- `/mp-doc-validate` 检验逻辑简化（删除 Step 2.7 中针对 v1.1 / v1.3 豁免文件的 legacy-key warning 分支）
- 所有 marketplace docs（除 5 类外部规范文件外）走统一 tag-prefix + 8 字段 frontmatter + 标准子目录规则，可发现性 + 可校验性提升
- INDEX.md 纳入校验闭环，避免「索引漂移」隐患

### Negative

- 本 PR 涉及 14+ 文件 rename / edit / delete，单 PR 审查负担较重（已通过 9-commit 分层 + Phase Audit Checklist 缓解）
- 重命名 `CONTRIBUTING.md` → `[GUIDE]_Contributing.md` 后，部分外部工具可能不再自动识别（如某些 IDE 插件会高亮根级 CONTRIBUTING；marketplace 原本就放在 `docs/` 子目录不在根，影响有限）
- `ai_engineering_execution_hitl_workflow.md` 删除后，git history 仍保留全文，但作为 marketplace 顶级文档的 fork-source 角色终结（与独立性原则一致）

### Risks

- **学习系列内容损失**：6 份 lowercase 教学文件合并到 2 份 [GUIDE]_LearnKit_* 时可能遗漏内容。**Mitigation**: 20 项 Content Audit Checklist 在合并完成后强制勾选。
- **HITL §0 浓缩失真**：1216 行 generic HITL 文档浓缩到 150-200 行 §0 可能丢精髓。**Mitigation**: §0.1-§0.4 分四段保留 universal skeleton（verbatim 19 步骤）+ compression mapping 完整表 + fork guidance + 原 §0 Scope/working-doc 边界。
- **broken cross-references**：被删 / 改名文件的 inbound link 残留。**Mitigation**: Phase 7 强制 `git grep` 7 个文件名 + 改名前后路径，必须 0 hit；`/mp-doc-validate` 强制 0 Critical。

## Future Work (out of scope for this PR)

- **v2.0 候选**: 采纳三层治理模型（canonical / working / legacy）替代「exclusion list」概念。当 marketplace doc 数量增长到 ≥25 件、需要按 tier 差异化 validation 严格度时启动。
- **v2.0 候选**: 扩展 tag 类型 POSTMORTEM / ISSUE / ASSESSMENT；按 marketplace 实际事件 / 评估需要触发。
- **v2.0 候选**: INDEX.md 自动生成工具（脚本根据 `docs/**/*.md` frontmatter 重建）；目前依赖人工维护，纳入 §1 强制检查后可发现 INDEX 漂移但无法自动修正。
- **v1.6 候选**: 加入 `revision:` 字段到 §2.2 optional fields 表（本 PR 已在 3 份 STANDARD + 本 ADR 引入 revision block pattern，下次 framework patch 时正式纳入 schema）。

## References

- [`../rule/[STANDARD]_Documentation_Framework.md`](../rule/[STANDARD]_Documentation_Framework.md) v1.5（同 PR 产出 — §1 重写承载本决策）
- [`../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) v1.4（同 PR 产出 — §0 内化 universal skeleton）
- [`../runbook/[RUNBOOK]_Doc_Archive_Procedure.md`](../runbook/[RUNBOOK]_Doc_Archive_Procedure.md) v1.1（旧 ADR archive ceremony 走此 RUNBOOK 的 4-phase + 2-HITL-gate 流程）
- [`../archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md`](../archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md)（被本 ADR supersede 的前任决策）

## Decision Log

- **2026-05-18**: 用户在 plan 模式中四轮澄清后批准本决策（独立性 + silent borrow 两项指导原则确立）
- **2026-05-18**: v1.0 起草 + supersedes 链路建立
