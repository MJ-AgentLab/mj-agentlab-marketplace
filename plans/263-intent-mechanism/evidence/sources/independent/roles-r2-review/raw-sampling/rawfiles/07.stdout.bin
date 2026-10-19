---
type: standard
scope: marketplace
summary: "Agent execution, owner decisions and marketplace workflow"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-19
state: active
version: v3.0
layer: canonical
supersedes:
  - ../archive/[DEPRECATED]_[STANDARD]_AI_Engineering_Execution_HITL_Prompt_v2.1.md
---

# [STANDARD] AI engineering execution

## §3 Execution and owner decisions

按[任务文档与交付 ADR](../adr/[ADR]_Task_Documentation_Layers_And_Delivery.md)落实七原则：

| 原则 | 要求 |
|---|---|
| Agent 执行，Owner 决策 | Agent 承担修改、环境、构建、测试、隔离安装、提交、推送、PR 和授权合并等技术操作。Owner 补必要信息、作实质决定与授权，默认从成品结果验收，不参与常规构建过程审查。 |
| 独立合成验收 | Agent 模拟相关角色，独立核验功能/工程质量并提供可复现运行证据，无须真人参与模拟。合成验收、独立 Agent 审查、GitHub 非作者批准及 Owner 最终接受分别记录。 |
| 严格窗口，分段交付 | 明确提交才算答复；未提交、默认、推荐、预选、沉默、超时、关闭/消失不算回答。非核心缺失延期对应入口，核心通过自身验收可先交付；延期列影响、责任与恢复条件，不视为通过。 |
| 集中授权，条件复用 | 明确范围可集中授权；目标、对象、环境、权限、风险边界未实质变化时复用，越界重授权。常规排程、修复、阶段切换及重跑由 Agent 执行。 |
| 可执行约束，证据驱动 | Harness 自动执行必要门禁；Agent 自主验证、诊断、修复，证据可复现可追溯。不足不称通过，修复不静默放宽冻结判准。 |
| 风险隔离，可控恢复 | 自主执行止于技术权限边界；不可逆操作满足专门控制；发布变更具备适配风险的观测信号、停止条件、责任和恢复能力。 |
| 单 Epic、单活动主 PR、多子 PR | 需要拆分的任务使用一个 Epic、同时一个活动主 PR、多子 PR；内部路径不设保护，Agent 在必要门禁后合并，最终主 PR 满足 develop 实际保护。 |

Owner 决策时给 2–3 个明确选项、影响和有理由的推荐，必须等待的决定保持待答。已决定不重复询问，推荐不视为批准，不要求 Owner 复制命令。原生持续显示须实证；文字重述/pending 不算窗口通过，宿主不满足则延期对应入口。

目标、对象、环境、权限或风险边界实质变化，必要外部身份缺失，或不可逆/发布动作尚无必要专门控制与授权时，暂停依赖部分并请求最小必要参与，继续独立工作。测试失败先自主诊断修复；集中授权不扩展技术权限，合成角色不能替代保护批准。

## Workflow

Intake → Repo Scan → Plan → ADR → Author → Compliance → Dogfood → Self-review → Commit/Push/PR → Review/Merge → Post-merge。使用独立 worktree，main/develop 工作区保持干净；阶段技能在 .agents/skills，工具受限时用可用能力完成并保留限制。

按[文档框架](./[STANDARD]_Documentation_Framework.md)启用稳定任务目录；先读 INDEX，再抵达主 Issue、PLAN、REPORT 和适用 canonical，分别读取原意/接受、实施、验证。复用主文件；小任务继续 Issue/PR。明确批准在范围内生效，PLAN 留决定原文/来源、实际时间、范围和待同步正本，同一项交付完成前同步 canonical；未同步列缺口，仅较新不改变合同。

## Epic and pull requests

需要拆分的任务由 Epic 维护接受范围、进度、批次、责任/下一操作、延期和关闭条件。主 PR 从任务集成分支指向受保护 develop，子 PR 的 base 指向集成分支；集成分支不是仓库 main。

创建前核对 rulesets、权限与自动化覆盖。子分支和集成分支采用实际允许的不受保护内部路径，不擅改 main/develop；全局规则阻断时提交最小必要事实及决定选项。Agent 独立审查并执行 Harness，绑定实际 head/base 与候选合并树，范围、必要检查和线程通过后可按已有授权合并，无须额外索取内部 GitHub 非作者批准。若实际规则保护该分支则仍须满足，不 bypass；内部 A6 例外仍遵守其专门签核。

集成分支变化后复验受影响范围；最终主 PR 满足 develop 实际 CI、当前 head 非作者批准、线程和基线门禁。合并后核对实际 merge SHA/tree、复验再认定批次交付。延期留原 Epic；恢复后创建下一批主 PR，复用目录，每批接受/验证分别绑定，同时最多一个活动主 PR。旧 HTML 等阶段合同和真实拓扑保留，小任务不强制 Epic/多层 PR。

## Verification and release

Agent 从实际候选执行相关角色的独立合成验收，记录角色、判准、执行身份、来源版本、输入/动作/输出和结论；可用独立 Agent 与隔离环境。管理阅读、产品边界、开发运维交接的模拟仅覆盖模拟范围，不冒充真人或 Owner 接受。

结构、资源闭包/具名来源、安装发现、模型行为、实际客户端/原生窗口、现实效果、独立批准及 Owner 接受分别登记。文件通过不代替完整资源，安装不代替行为，模拟不代替要求实证的客户端条件。失败、拒绝、超时、中断、未执行与重跑保留各自版本/原始证据。

核心交付、原计划完成、发布和 Owner 最终接受分别判断。非核心延期满足范围/风险边界，列入口、影响、责任、恢复条件及剩余接受义务，不删除判准包装完成。正式发布须已有范围明确的发布授权、当前适用验收、required checks 和保护批准。按[发布操作](../runbook/[RUNBOOK]_Release_Operations.md)核对 tag/Release 与安装；发布前明确适配风险的观测信号、责任人、停止/升级条件、已知良好版本及回退/前向修复路径。恢复保留发布历史与资产，按专门控制执行。

## History

旧 [v2.1](../archive/[DEPRECATED]_[STANDARD]_AI_Engineering_Execution_HITL_Prompt_v2.1.md) 和 [v1.5](../archive/[DEPRECATED]_[STANDARD]_AI_Engineering_Execution_HITL_Prompt_v1.5.md) 保留原范围/来源。旧“不维护 plans”等有限替代见新 ADR；版本政策和插件冻结合同继续在其适用范围有效。
