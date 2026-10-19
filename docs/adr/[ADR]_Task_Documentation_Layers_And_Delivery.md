---
type: adr
scope: marketplace
summary: "Adopt explicit document layers and reusable task records with staged Epic delivery"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.1
layer: canonical
supersedes:
  - ../archive/[DEPRECATED]_[STANDARD]_Documentation_Framework_v2.0.md
  - ../archive/[DEPRECATED]_[STANDARD]_AI_Engineering_Execution_HITL_Prompt_v2.1.md
related:
  - ./[ADR]_Develop_PreBump_Adoption.md
  - ./[ADR]_HTML_Guide_Kit_Addition.md
  - ../rule/[STANDARD]_Documentation_Framework.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
---

# [ADR] Task documentation layers and staged delivery

| Field | Value |
|---|---|
| Status | accepted design; implementation/acceptance separately tracked |
| Decision date | 2026-10-18 |
| Decision maker | Owner |
| Scope | marketplace governance, working task documents, engineering delivery |
| Reversibility | reversible; preserve accepted history and original sources |

## §1 Context

同一任务的计划、报告和验证材料平铺于领域目录，读者难以判断目标、阶段、剩余事项和责任；混合 RUNBOOK 携带规则、冻结判准与过程事实，完成状态不能说明用途。原框架仅六类型/八字段，计划技能沿用“不维护 plans”。

Owner 于 2026-10-18 在本会话确认 Q1–Q9：薄入口加主 PLAN、独立 layer、PLAN/REPORT、旧文档渐进、带日期短快照、HTML #217 PR1 有界映射、明确接受在范围内生效且同交付同步正本、按持续维护需要启用。后增加七执行原则，Q10 明确每个 Epic 同时一个活动主 PR，允许原 Epic 后续批次；随后授权独立 worktree 实施，先规范/模板/技能/Harness，再有界试行。

决定来源为上述会话和[本任务 Epic #257](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/257)所记录授权；接受基线见[主 PLAN](../../plans/257-task-documentation/[PLAN]_Task_Documentation.md)。本 ADR 记录日期与历史决定日期分开，不把事后整理写成原 HTML 接受。

## §2 Decision

采用 canonical/working 两层，显式 layer 与目录用途检查；type/state 独立表达用途/生命周期。docs 保持领域长期正本，plans 集中任务过程。草稿 SPEC 仍 canonical，完成 REPORT 仍 working；公共 working 按内容/责任留所属领域。

持续维护任务使用稳定目录、一个薄 INDEX、一个主 PLAN，发生结果后最多一个 REPORT；子 PR、会话、失败恢复及批次复用，完成不搬迁。入口导航并允许带日期/来源/责任的短快照，主 Issue/Epic 仍是进度正本。原意、接受、实施与验证分别追溯。

新文档九字段、旧文档逐项兼容，不把缺 layer 推定 canonical。按[文档框架](../rule/[STANDARD]_Documentation_Framework.md)和[执行规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)落实七原则、内部子 PR Harness 与受保护主 PR 门禁；五授权边界不实质变化时复用，越界 Owner 决定。

### Limited supersession

两个 v3.0 STANDARD 替代各自归档版本的当前治理要求，原正文/版本和 Git blob 来源先保存。另有限替代：

- [Develop pre-bump ADR](./[ADR]_Develop_PreBump_Adoption.md)以“不维护 plans”为前提的任务材料位置限制；不改变其预升/版本决定。
- [HTML ADR](./[ADR]_HTML_Guide_Kit_Addition.md)的“不新增 plans”后续组织限制；原 PR1–PR3 合同、实际顺序、接受、失败和评审封存绑定保持历史范围。

历史 ADR 原路径/正文保持，适用范围由本后继决定明确。原首批暂不迁移 Communication 原计划的路径限制，已由[INT-2026-002](../intent/[INTENT]_INT-2026-002_Plans_Path_Unification.md)及[#269](../../plans/269-plans-path-unification/INDEX.md)的 Owner 明确实施决定有限替代：两原件迁至 plans/222-communication-kit 的来源快照并保留原 Git 身份；根 plan/ 及当前兼容撤除。HTML 评审 plan.json、其他历史链和兼容范围、插件运行及版本不变。

## §3 Consequences

管理者从任务入口抵达目标、阶段、缺口/责任，产品读者区分原意/接受/变化/延期，工程读者找到执行链和现行规范；主文档复用控制新增材料量。代价为模板、技能、校验、索引、隔离镜像、CI 与具名来源必须协同适配。

快照可能过期，以日期/来源和 Issue 优先控制。混合旧账本有界映射，兼容不冒充分层完成。独立合成验收由 Agent 完成，保护批准及 Owner 最终接受各自独立。严格原生窗口须实证；非核心入口延期不视为通过，核心交付、全计划完成及最终接受分别记。

## §4 Alternatives

| 备选 | 决定与理由 |
|---|---|
| 主 PLAN 同时为入口、目录隐式判层 | 入口易膨胀/层次混淆，选薄入口与显式 layer |
| 增加 ASSESSMENT/DECISION/BASELINE 等全部类型 | 维护开销高，先用 PLAN/REPORT 有界章节，独立责任再拆 |
| 全量旧文档审定、所有变更建任务目录 | 初期范围和小任务负担高，选渐进/按需 |
| Epic 全生命周期只能一个 PR | 限制分段交付，选同时一个、每批独立绑定 |

## §5 Implementation

[任务入口](../../plans/257-task-documentation/INDEX.md)由 Epic 管理，[主 PR #258](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/258)指向 develop，子 PR 指向其集成分支。先交付规范/模板/技能和 Harness，再 HTML PR1 有界试行；实际候选、CI/独立审查、内部 merge 和最终 protected merge 分别记录。

HTML 只映射 Epic #217 的 PR1 #221 接受/交付/证据链，canonical 留原位置；PR2/PR3 链回原处、封存资源不动。不追溯应用新拓扑。试行后由 Owner 决定新任务推广与旧任务选择性迁移范围。

## §6 Acceptance

- [ ] layer/类型/目录/主文档/兼容范围实际可校验，合法公共 working 可保留，非法/缺资源失败。
- [ ] 入口能找到原意、接受、阶段、缺口、下一操作/责任，主 Issue 为进度正本。
- [ ] 模板/Agent/隔离镜像检查完整来源与资源，保留冻结原件及失败恢复。
- [ ] 子 PR 实际候选/集成有 Harness 证据，最终主 PR 满足 develop 保护。
- [ ] HTML PR1 独立合成角色实际核验阅读/交接，原意/接受/事实/结果可分辨，缺证如实记录。

上述为判准，写入不意味着通过。实际结果见[主 REPORT](../../plans/257-task-documentation/[REPORT]_Task_Documentation.md)；文件校验不替代完整资源/阅读体验，核心交付/全计划/Owner 接受分别登记。

## §7 References

- [文档框架](../rule/[STANDARD]_Documentation_Framework.md)、[执行规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)
- [历史来源账本](../archive/history-sources.json)
- [HTML 原始决定](./[ADR]_HTML_Guide_Kit_Addition.md)、[判准](../spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)、[验收账本](../runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)

## §8 Decision log

| 日期 | 事件 | 范围 |
|---|---|---|
| 2026-10-18 | Owner 确认 Q1–Q9 与七原则 | 机制设计 |
| 2026-10-18 | Q10 选同时一个活动主 PR | 同 Epic 后续批次复用 |
| 2026-10-18 | Owner 授权实施 | 独立 worktree，先适配再试行，实质决定再询问 |
