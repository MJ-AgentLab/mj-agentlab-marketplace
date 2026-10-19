---
type: plan
scope: communication-kit
summary: "Current Communication task plan and historical accepted-source boundaries"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: working
task: 222-communication-kit
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222
---

# [PLAN] Communication Kit

[任务入口](./INDEX.md) · [主 REPORT](./[REPORT]_Communication_Kit.md) · [Issue #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)

## Scope and accepted sources

这是 2026-10-19 依 #269 整理的唯一现行主 PLAN，承接原 Communication 任务身份，不冒充 2026-10-12 原计划。产品范围以 [ADR](../../docs/adr/[ADR]_Communication_Kit_Addition.md)、[SPEC](../../docs/spec/[SPEC]_Communication_Communicate.md)和对应版本/Owner 决定为准：显式 communicate、保义写作/改写、明确文件请求后的操作及必要澄清。

完整旧接受基线由[来源清单](./source-bindings.json)绑定固定提交 91f982f70552fc0bfdf4015da943e257a22d4c7b 下的两个原始 Git 文件，任务内同字节快照可恢复。原计划内“待执行”、建议版本/PR 拓扑及原路径均属于当时，不能覆盖后续交付或被当作当前操作入口。原件不继续编辑，后续计划只维护本文；原捕获事实和 Owner 接受范围不重写。

## Current work and handoff

本次[整合任务 #269](../269-plans-path-unification/INDEX.md)负责路径/导航/来源及校验，不改变插件运行、版本或发布。原任务交付与历史未覆盖由 REPORT 链接既有证据；后续 Communication 开发须按真实新请求和适用原意/授权承接，不因搬迁自动重启旧未执行测试。

1. 阅读本入口及主 REPORT，先确认当前请求属于目录治理还是 Communication 运行工作。
2. 需要还原原接受时按来源清单的固定 commit:path 或任务内快照取得原字节，逐项核对摘要和声明用途。
3. 后续已授权工作复用本 PLAN/REPORT 与 #222，不为新会话或恢复创建第二主计划；真实范围、验证和延期追加，进度仍在 Issue。

## Verification, risks and recovery

目录整合验收由 #269 对实际候选执行：唯一入口/主 PLAN、旧当前路径撤除、两原件逐字节与哈希匹配、隔离阅读和恢复。插件历史 CLI、客户端、批准及现实效果范围沿用当时记录，不因本次工程检查变成通过。

缺原件/路径错误/并行计划时停止依赖操作并修复；保留原失败与接受。普通 Git revert 或后继修复恢复整合，不覆盖原件、不改发布资产；Owner 最终接受与技术检查分开。
