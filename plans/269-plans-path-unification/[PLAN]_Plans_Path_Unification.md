---
type: plan
scope: marketplace
summary: "Unify plan into plans and remove live legacy path compatibility"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: working
task: 269-plans-path-unification
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269
---

# [PLAN] Plans path unification

[任务入口](./INDEX.md) · [主 Issue #269](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269) · [唯一 INTENT](../../docs/intent/[INTENT]_INT-2026-002_Plans_Path_Unification.md)

## Goal, scope and intake

落实 INT-2026-002 已接受 B1：原 plan/ 两个文件进入 plans/222-communication-kit 的证据来源，建立 Communication 唯一任务入口/主 PLAN/实际 REPORT，撤除当前 plan/、旧路径别名/回退/重定向/校验豁免，同步直接依赖。既有 docs 历史兼容清单、插件运行、版本和发布不在范围。旧路径在真实历史原件或固定 Git 来源中出现属于追溯，不能作为当前依赖或并行计划入口。

核查起点为 develop 91f982f70552fc0bfdf4015da943e257a22d4c7b。该基线旧 plan/ 只有 Communication 原实施计划及 provenance；53 项 docs 历史兼容清单独立于 plan/ 路径豁免。develop 实际保护要求当前 head 非作者批准、Validate Structure、A6 / Check、线程解决及严格基线；本集成分支无有效保护。创建/合并时重读实际规则。

## Accepted baseline and authorization

完整原件由[来源清单](./source-bindings.json)逐项绑定：

| 决定 | 实际来源与效力 | 保留/后继范围 |
|---|---|---|
| B1 / Q1–Q2 | [完整 B1 与实际答复](./evidence/sources/accepted-baseline-b1.json)：Owner 核对并接受五项原意；Q1 限定本次路径兼容，不扩大至全仓历史文档兼容 | 当时操作限写需求；该旧决定按原范围保留 |
| 七项执行原则 | [P1 原文](./evidence/sources/execution-principles-p1.json)：Agent 执行/Owner 决策、独立合成、严格窗口分段、授权复用、Harness 证据、风险恢复、单 Issue/单主 PR/多子 PR | 原文保留；Agent 先前将其仅作 INTENT 扩写的解释被最新明确指令纠正，不能据旧解释阻断执行 |
| 实施授权与纠正 | [Owner 最新原话](./evidence/sources/implementation-authorization.json)：“不是将 将七条原则追加至 intent.md中，而是执行解决该需求，实施过程遵循上述七条原则” | 本批从写作阶段进入实施；原意/B1 不变，执行对象为路径整合及直接依赖；不据此推定已完成或 Owner 最终接受 |

提出/决定责任人为当前聊天的 Owner，账号、原消息准确时间/ID 未提供；JSON 真实捕获时间不替代决定时间。v1.0/v1.1 整理稿完整原字节分别由 P1 和实施授权原件保存。决定记录以本节及其原件为准，INTENT/Issue 链接，不复制另一套接受历史。

目标：满足 S1–S4。对象：旧 plan/、相关 task/docs、导航、Harness、fixtures 和直接测试。环境：独立 worktree、GitHub #269、集成分支及内部子分支、最终 develop。权限：Agent 自主编辑、验证修复、提交推送、PR 及门禁满足后的内部合并；主 PR 保持 develop 保护。风险：不改其他历史兼容/插件/版本，不发布，不伪造接受或测试；可用 Git revert 恢复，保留原件与失败。

## Original meaning and engineering coverage

| 原意 | 完整基线与范围 | 关系 | 子 PR 责任 | 验收与实际证据 |
|---|---|---|---|---|
| O2 / S1 / S3 | B1 唯一 plans 入口与主计划 | 实际交付 | A：迁移两原件、222 INDEX/主 PLAN/REPORT，修复现行导航与合同 | 当前无 plan/；独立阅读能定位唯一计划/实际结果/来源，REPORT 记录结果 |
| O3 / S2 | B1 本次旧路径不留兼容，非全仓历史改造 | 实际交付 | A 同步规范及删除所必需的 smoke/fixture/路径断言；B 删除豁免并拒绝旧根目录 | 当前引用/资源定位无旧路径依赖；旧目录重引入必须失败，其他历史兼容保留 |
| O4 / S4 | B1 可追溯原件、接受/失败事实真实 | 实际交付 | A 保留原始字节/绑定与历史读法；B 验证恢复和隔离闭包 | 新快照与固定 Git blob 逐字节/哈希一致；原件非第二现行计划 |
| 七执行原则 | 原文及最新明确实施授权 | 依赖支撑 | 全批：独立合成、Harness、授权复用、风险隔离、单主 PR 拓扑 | 内部与最终门禁分别记录，延期/未覆盖/Owner 接受不伪写 PASS |

## Execution, dependencies and batches

1. 建立本 #269 入口和单活动主 PR，集成分支 codex/plans-unification 指向 develop，初始保持 Draft；补正 INTENT 对当前执行阶段和决定来源的描述，移除误加的七原则展开。
2. 子 PR A：在独立子分支建立 plans/222-communication-kit；两历史原件按原字节迁到 evidence/sources，新增合规主 PLAN 解释其历史范围，REPORT 引用已存在事实并明确不重做插件验收。同步当前文档/规范和根 AGENTS，有限替代原 plan/ 路径保留规则；同一原子变更更新删除旧目录所必需的 smoke 输入树、fixture 及当前路径断言，避免将已知失败留给下一子 PR。
3. A 经独立语义阅读、当前文档/来源核验及适用 CI 后由 Agent 合入集成分支；A 的迁移/引用形成 B 的真实基准。
4. 子 PR B：从合入 A 的集成树派生；删除旧 plan 资源展开豁免，Harness 明确拒绝旧根 plan 普通目录、空目录、文件或链接，并验证旧路径不成为当前依赖；保留固定 Git 历史来源测试，不把历史字符串当兼容。
5. B 对实际候选运行相关测试和全部既有工程检查，独立核验后内部合并。最终集成执行 npm test、npm run validate、npm run smoke:codex；13 组合及实际缓存 Python 绑定真实候选，不外推前稿结果。
6. 独立合成阅读按管理者、产品维护者、开发运维三角色从 INDEX 开始核对：唯一入口/剩余事项；B1 与七原则/未覆盖；原件恢复/旧路径拒绝。记录输入、角色、内容 SHA、方法、输出与限制，模拟不替代 Owner 接受。
7. 主 PR 准备完整成品和证据后解除 Draft；当前 head 的真实 CI、非作者批准、线程和基线齐备才合 develop，不 bypass。合入后核对真实 SHA/tree 及受影响复验，再按证据处理 #269；缺保护批准时交付可审查成品并请求最小必要参与。

## Verification and recovery

验证分层：结构/唯一身份、原件与 snapshot 逐字节、导航/隔离来源闭包、真实 fixture/Harness 负例、完整单测、13 canonical 安装和实际 Python、独立合成阅读、内部/最终实际保护。原生窗口持续显示仍缺实证，保留对应延期，不影响本次目录治理自身验收；插件模型/客户端/现实效果不在本批，不借工程检查追认。

失败、工具拒绝、中断及重跑分开保存；不修改冻结接受降低门槛。旧 plan 重引入、来源丢失、并行主计划或当前引用悬空必须修复。内部候选变化复验受影响范围，主 PR 变化使旧 head 批准失效。恢复用普通 revert/后继提交；迁移原件和旧决定可恢复，不改已发布版本、资产或保护。

## Decisions and changes

| 记录 | 来源 / 真实范围 | 旧基线 / 正本同步 |
|---|---|---|
| 2026-10-19；原消息准确时间未知，捕获时间见原件 | Owner 最新明确要求执行需求并遵循七原则 | 保留 B1/P1 和先前误解稿；本次更新 INTENT 阶段、任务入口及后续受影响标准/导航。具体实施、验证、PR 与最终接受在 REPORT / Issue 按实际发生追加 |
