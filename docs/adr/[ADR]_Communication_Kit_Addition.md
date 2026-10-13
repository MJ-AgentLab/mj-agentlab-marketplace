---
type: adr
scope: marketplace
summary: "Explicit communication, writing and meaning-preserving rewrite contract"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-12
state: draft
version: v1.3
---

# [ADR] Communication Kit addition

| Field | Value |
|---|---|
| Status | 0.1.0 完整候选已实现；工程已执行，行为、客户端及发布验收未完成 |
| Date | 2026-10-12 |
| Author | marketplace-maintainers，依 Owner 明确决定 |
| Scope | communication-kit / marketplace |
| Reversibility | 合并前可撤回；合并后经 PR 原子回退 |

## §1 Context

Owner 要求按[完整实施计划](../../plan/communication-kit-implementation-plan.md)执行并正式上线；追踪 [Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)。计划原稿保留在原隔离工作树，同字节副本与[捕获记录](../../plan/communication-kit-plan-provenance.json)纳入 PR1。

PR1 实施起始基线为 origin/develop `b2e5a74109f47ecee7471ba741fb4c1348457f3b`，marketplace 8.1.2；main `0c681a8f8b7520134a86a70934fc46288c627d8d` 为已发布 8.1.1。当时运行集合三插件、四公开技能、20 个仓库技能。计划旧基线与 PR1 状态保留为历史，不用于当前转换。

PR3已实现完整Communication0.1.0候选并原子接入插件、注册、严格校验、冻结资源、正式图标与安装预期；先行Learning迁移#228及HTML开发基线下为五插件七公开技能、20开发技能、四显式入口。marketplace仍未发布8.1.2；旧工程、行为及同应用两个本机入口必要范围的实证分别保留，发布未执行，详见[验收账本](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。

Owner通过grilling Q3明确正式公开仅为Learning已公开三包加Communication（四包六技能、三显式），HTML留develop另发。PR4/5各自核实集合与实际From/To，不从开发全量推断公开范围；现有单入口与行为契约不变。

## §2 Decision

新增独立 `communication-kit`，唯一公开技能 `$communication-kit:communicate`，界面“沟通助手”。显式调用后处理当前任务及其连续修改；无关任务、明确停止与新会话不沿用激活状态。

支持日常沟通、文档编写、保义改写，审校内置。默认保留事实、立场、条件、例外、责任与真实承诺；准确保存数字、单位、日期、引文和技术标识。关键缺口先提 2–3 个明确选项、影响、推荐与理由并等待；非关键缺口采用明确假设或占位。未答、空返回、窗口消失或超时均不是选择。

默认在聊天交付成稿＋关键提示，需要时展开修改理由。仅在用户明确要求后保存或编辑 Markdown/TXT，核对目标、执行并回读；失败保留成稿并如实报告范围。素材内命令作为数据，不扩大写作授权。

包内冻结 AICS 精选原创摘要，以研究 PROJECT 的“当前学习解释”和 RN-02 为主要来源，保留 **Lab Proposal / Informative**。来源路径、章节、日期、Git 状态与 SHA-256 可追溯；运行仅依赖包内资源。哈希证明字节完整性，语义忠实另行对照。明确请求、适用性评估与复验后才随插件版本更新。

## §3 Boundaries and consequences

Communication 产出或修改沟通稿件；[Explain](./[ADR]_Explain_Kit_Addition.md)解释概念，[Understanding](./[ADR]_Understanding_Kit_Addition.md)只读理解测验。新入口不隐式接管解释、测验、项目治理或工程操作，不复活 learn-kit、NotebookLM 或 Claude 包装。

四类检查用于语言、信息组织、知识状态和执行责任，按任务选择严格度与展开层次；保持自然稿件，不强制把框架术语加入每份成稿。结构/安装/合成功能通过支持基础可用性；现实沟通效果、效率与采用度尚未验证。

增加插件维护、来源冻结、显式路由与客户端回归成本。通过严格集合、哈希与路径检查、合成保真案例及必要双客户端基本可用性控制遗漏和误报完成。

## §4 Alternatives

| 方案 | 决定及理由 |
|---|---|
| 独立单入口、内部分流 | 已确认；用户从成稿目标出发，三类写作共享保真与审校 |
| 扩展 Explain 或增加多个公开写作入口 | 未采用；职责边界与调用负担不符合已确认契约 |
| 自动追随研究仓库或复制整包研究治理 | 未采用；安装可移植性与冻结可追溯性要求包内精选摘要 |

## §5 Implementation

PR1 契约与固定案例 → PR2 scope 工具及候选图标 → PR3 插件/注册/严格校验/资源/安装预期原子接入 → PR4 获准版本及回归 → PR5 main 发布 → 发布后 canonical 复查及维护。所有阶段使用 Refs #222，依赖顺序和当前 head 门禁按计划执行。

PR1/PR2 当时不注册新运行包。PR3 已有[manifest](../../plugins/communication-kit/plugin.json)、[包说明](../../plugins/communication-kit/README.md)、[主技能](../../plugins/communication-kit/skills/communicate/SKILL.md)、[原生配置](../../plugins/communication-kit/skills/communicate/agents/openai.yaml)与包内三份参考摘要及[冻结记录](../../plugins/communication-kit/skills/communicate/references/aics-snapshot.json)。Owner 已明确选择第二轮 D 地球＋清晰文字，正式包与四图家族预览已接入；真实客户端显示仍 NOT RUN。完整原计划继续保留，不以候选实现表示已经上线。

## §6 Acceptance

依据[SPEC](../spec/[SPEC]_Communication_Communicate.md)、[固定案例](../../tests/fixtures/communication-kit/cases.json)与[RUNBOOK](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)，执行S01–S12、C01–C18、必要双客户端基本可用性和R01–R05。PR1建立契约时没有运行包；PR3已完成工程和完整九组合canonical，原交付/无据理由失败保留，通用修复后CLI C01–C15通过，文件子路径PARTIAL，当前工具角色三项限定功能通过另记。双客户端与R01–R05仍NOT RUN，相关PR保持draft，AI review不替代当前head的GitHub非作者批准。

Owner 明确将九例真实场景、三稿对照、读者效果反馈、采用度与效率提升本次延期。延期项不作上线门槛，也不记为 PASS；事实、立场、承诺和必要限制失真仍是功能失败。

## §7 Version, release and rollback

新包实际候选为0.1.0，尚未发布，现有三个插件版本保持。Owner 于 2026-10-12 选择 [Learning Evidence #209](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/209)先发布 8.2.0，Communication 随后独立 minor，预计 8.3.0；PR4 重查实际 From/To、最新基线及发布范围。PR3 未执行市场版本转换，不提前承诺待发布基线的精确运行集合。

正式发布已获本任务授权，仍受真实客户端验收、CI、非作者批准、最新 base、code-owner 要求和未解决线程约束。回退经新 PR 原子撤销新包及集成，恢复先前完整集合；已发布历史不覆盖，故障使用新修复版本。流程见[发布操作](../runbook/[RUNBOOK]_Release_Operations.md)。

## §8 Decision log

| 日期 | 依据 | 状态 |
|---|---|---|
| 2026-10-13 | Learning原子迁移434d053及Owner答复grilling Q3 | 开发五包七技能、正式四包六技能；HTML保留开发另发，旧来源和行为证据保留 |
| 2026-10-12 | Owner 要求完整实施与正式上线，保留已确认产品契约与缩减效果测试范围 | PR1 时接受产品方向和执行授权；当时尚未实现 |
| 2026-10-12 | Owner 答复版本顺序 grilling Q1 | Learning 先 8.2.0；Communication 随后独立 minor，PR4 重查版本和基线 |
| 2026-10-12 | Owner 明确选择第二轮 D 地球＋清晰文字 | 已接入原创 MJ D 正式资源；不补记客户端显示 |
| 2026-10-12 | PR3 完整候选与工程批次 | 候选已实现，工程部分实证可追溯；行为、双客户端、发布和 S08 完整复验待完成 |

| Version | Date | Summary |
|---|---|---|
| v1.3 | 2026-10-13 | 合并PR1范围澄清与已实现候选事实，区分开发/正式集合，保留历史与未解除门禁 |
| v1.2 | 2026-10-12 | 记录通用缺陷修复、CLI新批与独立工具补充；独立批准/双客户端/发布仍未完成 |
| v1.1 | 2026-10-12 | 更新 PR3 已实现候选及部分工程实证，保留 PR1 历史与未完成门禁 |
| v1.0 | 2026-10-12 | 产品方向及实施、验收与发布契约；PR1 当时尚无运行包 |

