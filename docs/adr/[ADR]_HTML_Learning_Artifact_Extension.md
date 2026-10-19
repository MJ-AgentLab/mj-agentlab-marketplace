---
type: adr
scope: html-guide-kit
summary: "Add an explicit local learning artifact workflow with actual Sites delivery"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: canonical
---

# [ADR] HTML learning artifact extension

| Field | Value |
|---|---|
| Status | 本次明确实施范围已授权；本文为 Agent 据来源的工程承接，不声称新稿逐字接受或成品接受 |
| Date | 2026-10-19；准确 Owner 消息时间未知 |
| Decision owner | 当前聊天的项目 Owner；完整决定正本见主 PLAN |
| Scope | 同一 html-guide-kit 新显式 site、包内资源/工具、Sites交付及对应工程合同 |
| Reversibility | 独立输出可重建；包级回退用新受保护PR；Sites按已知良好保存版本恢复或前向修复，历史不删除 |

## §1 Context

[原意 INT-2026-003](../intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md)承接从学习材料到可阅读、可操作、可追溯网页的需求。既有 guide 只交付聊天指南，不能承担制作。Owner 本轮要求实施[完整原计划](../../plans/274-html-learning-artifact/evidence/sources/HTML-Learning-Artifact-Plugin-Implementation-Plan.md)，并用七原则及最新 plan 机制约束执行。

实施核查 HTML 为 0.1.36，五包七公开/四显式/三自然；原计划较旧的0.1.0与HEAD仅保历史事实。旧[HTML新增ADR](./[ADR]_HTML_Guide_Kit_Addition.md)及[验收SPEC](../spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)继续保存 guide 和原验收历史。本文件单独承接新 site，不将旧 FAIL、双端缺证或批准缺项追认通过。

## §2 Decision

在原插件新增显式 `$html-guide-kit:site`，`allow_implicit_invocation: false`；复用插件身份和已批准图标。guide 原运行字节、Read聊天合同与历史接受保持；插件级能力增加 Write 不产生入口独立权限沙箱，site/guide边界由指令和行为核验维护。运行候选从0.1.36推进0.1.37，Marketplace与其他插件不自动升版。

site 使用六步方法、本地 AICS/术语与暖白陶土主题；Markdown与视图分离，首版包括样式注入、复制反馈、静态检查和通用渲染检查。方法/模板/主题/脚本/必要来源说明相对实际安装 SKILL locator 定位，不依赖研究仓库、个人绝对路径、历史聊天、其他插件缓存或运行时下载。Sites是唯一必需外部制作能力，认证/托管不复制。

网页阶段实际读取当前 Sites 工作流，处理明确新建/更新对象、精确源码、保存版本和部署；核对地址、版本、状态与访问范围。新站默认私有，更新保持原身份/受众；未知创建或部署结果先回读，避免重复。自有Marketplace安装后至少一个目标客户端实际完成全流程；不由当前工程会话的工具权限推定消费者成功，不编造依赖ID或公共目录资格。

上线门槛采用新[SPEC](../spec/[SPEC]_HTML_Learning_Artifact.md)四项最小检查。完整双客户端、视觉/扩展/可访问性与完整原生窗口体验可以后移；必要答案未取得不能自行推进，Sites核心未完成不能作为非核心延期。理解效果无表现测量则NOT_MEASURED，不阻工程上线，不宣称改善。

任务使用单Issue #274、同时一个活动主PR→develop、多子PR→任务集成分支；内部路径经实际规则核查为不受保护时，Agent在独立审查及Harness后可合并。最终保护批准/CI/线程仍须满足，不bypass。最新计划机制覆盖原计划旧子Issue/文档安排；旧任务拓扑与证据不追溯改写。

## §3 Consequences

安装包新增一个技能，开发五包八公开/五显式/三自然，仓库技能20不变。站点可带来写入、部署、认证和受众风险，须以有界交接包、私有默认、精确版本/输出、权限回读和发布监控控制。局部检查不能代替语义、真实客户端或Owner接受；脚本跳过浏览器检查必须报未检查。

guide保持现行产品边界；原历史矩阵不扩大成本次site最小门槛，也不因本次通过而关闭旧未完成项。延期逐项保存影响/责任/恢复条件，Owner体检与最终接受保留真实决定位置。

## §4 Alternatives

| 方案 | 实际取舍及本次方向 |
|---|---|
| 改写guide承担制作 | 混合原Read聊天边界；本次采用独立显式site并保guide字节 |
| 新建重复插件或复制Sites | 增加身份和托管/凭据维护；本次复用现有包及实际Sites |
| 全客户端/视觉/效果矩阵阻断首版 | 与来源采用最小上线检查相冲突；非核心后移，核心四门槛保持 |
| 只产本地HTML即宣布交付 | 缺Sites真实发布及安装后调用证据；只算本地成果，不算核心上线通过 |

## §5 Implementation

唯一[任务入口](../../plans/274-html-learning-artifact/INDEX.md)与[主PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md)承接P0–P5、完整来源、工程覆盖和恢复：文档bootstrap建立主PR，子PR1原子合成全部方法/工具/site/manifest/validator，子PR2承接真实安装/Sites独立验收与观测修复，必要后续子PR仍同Issue。真实PR链接与进度留[#274](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274)。逐项结果出现后由唯一REPORT报告，不增加平行计划。同步严格资源登记、manifest两入口提示及Unicode预算、安装字节比较/测试、A6和公共索引；不登记空资源或降低已有检查。

第三方迁入按实际文件/固定版本/路径/hash/改动/许可记录，来源方法摘要不冒充原始规范或自动转MIT；不迁入来源已延期工具或无用途vendor。所有运行输出独立于插件缓存与研究目录。

## §6 Acceptance

按[SPEC](../spec/[SPEC]_HTML_Learning_Artifact.md)执行安装闭包、代表材料语义、一个客户端真实Sites流程及当前工程/发布门禁。保留失败、修复重跑、未执行及延期，绑定实际SHA/tree/缓存字节。合成验收可无真人参与，但不能冒充GitHub非作者批准或Owner成品接受。

## §7 References

- [INTENT](../intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md)、[PLAN授权记录](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#accepted-baseline-and-authorization)、[完整来源清单](../../plans/274-html-learning-artifact/source-bindings.json)。
- [使用指南](../guide/[GUIDE]_HTML_Learning_Artifact.md)、[执行规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)、[文档框架](../rule/[STANDARD]_Documentation_Framework.md)、[发布操作](../runbook/[RUNBOOK]_Release_Operations.md)。

## §8 Decision Log

| 时间 | 性质/责任 | 来源及范围 |
|---|---|---|
| 消息时间未知；真实捕获时钟另记 | Owner明确实施指令 | 完整原计划与本轮七原则；不等同新文档逐字接受、当前工程通过或最终成品接受 |
| 2026-10-19 | Agent工程承接 | 据实际版本/最新机制细化，不改原计划/旧接受原件；差距只阻依赖部分 |
