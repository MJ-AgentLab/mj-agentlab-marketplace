---
type: report
scope: communication-kit
summary: "Communication delivery references and plan-path migration facts"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: working
task: 222-communication-kit
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222
---

# [REPORT] Communication Kit

[任务入口](./INDEX.md) · [主 PLAN](./[PLAN]_Communication_Kit.md)

## Existing delivery and limits

固定 develop 91f982f7 的 [8.3.1 发行账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_1_Release_Readiness.md)记录五包七技能的 8.3.1 公开交付，Communication 包为 0.1.0；[原验收账本](../../docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)保存原 PR1–PR5、CLI C16–C18 PARTIAL、限定客户端实证、批准缺项、原失败和未覆盖。本文只导航这些有界事实，不以旧计划中“待执行”推翻实际交付，也不因目录整合补写任何缺证 PASS。

本批没有重新执行 Communication 模型行为、原生窗口或现实效果验收，没有发布操作，Owner 对最终成品的接受不由本文推定。

## Path migration facts

2026-10-19，#269 的 Agent 在隔离工作树中把原实施计划及 provenance 的固定 Git 原字节迁入本任务 evidence/sources，生成[来源清单](./source-bindings.json)，建立唯一主 PLAN/REPORT 和入口，删除当前根 plan/。当前规范/导航/消费者的迁移和后续拒绝旧目录门禁由 #269 主 REPORT 记录，内部 PR/最终 develop 合入及复验尚须各自真实证据，不在此提前写完成。

| 原件 | 固定 Git 来源 | SHA-256 / 本批复制后核对 |
|---|---|---|
| communication-kit-implementation-plan | 91f982f70552fc0bfdf4015da943e257a22d4c7b:plan/communication-kit-implementation-plan.md | 6d0de62b597ce2807278e165428cb28408fc774b3fba4059298f7a77b88e3fc3，复制后逐字节一致 |
| communication-kit-plan-provenance | 91f982f70552fc0bfdf4015da943e257a22d4c7b:plan/communication-kit-plan-provenance.json | 7d38da72b09311e255bdccd8d1ec7bffa6d4be17e3ff56de4115873658be545e，复制后逐字节一致 |

原件内历史路径只作当时来源事实，不提供旧路径 alias、回退或豁免；读者从本 INDEX 抵达唯一现行计划。原始 405 行计划及完整 provenance 都可由任务内快照或固定 Git 对象恢复；摘要不单独替代原件。
