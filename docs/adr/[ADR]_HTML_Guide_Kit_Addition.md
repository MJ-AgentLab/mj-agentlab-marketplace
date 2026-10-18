---
type: adr
layer: canonical
scope: marketplace
summary: "Add an explicit Read-only HTML teaching guide through staged atomic integration"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-19
state: active
version: v1.1
---

# [ADR] HTML Guide Kit addition

| Field | Value |
| --- | --- |
| Status | accepted |
| Date | 2026-10-12 (Asia/Taipei) |
| Decision owner | Owner，已确认的 Epic 与多 PR 实施授权 |
| Scope | html-guide-kit 与必要市场合同；目标 develop |
| Reversibility | 通过新 PR 原子撤销插件、登记与对应合同，保留证据 |

## Context

复杂材料需要先明确读者、使用任务和理解问题，再编排可供后续制作者使用的交互教材绘制指南。已有 Diagram、Understanding 与 Explain 插件不承担这个新建指南流程。研究案例和最新修订的 Sites 指南提供设计参考，其领域内容、固定七章、制作操作、研究治理与历史验收不成为运行依赖。

本任务 2026-10-12 重新获取的 origin/develop 为 `b2e5a74109f47ecee7471ba741fb4c1348457f3b`，VERSION 为未发布 8.1.2，运行集合仍为三个插件、四公开技能。并行工作及研究项目未提交内容受保护。阶段从真实远端基准派生，不把此 SHA 当作永久基线。

## Decision

新增独立插件 **HTML Guide Kit**，标识 `html-guide-kit`，初始版本 **0.1.0**，唯一公开入口 **$html-guide-kit:guide**。能力仅 **Read**，`agents/openai.yaml` 设置 `allow_implicit_invocation: false`。默认中文，保留术语原文。

首版只新建指南。运行时只在聊天中交付可复制指南文本；不生成 HTML、代码、文件，不给具体制作工具操作说明，不修订指南、不比较已有方案、不审查已有 HTML。运行边界不限制工程代理执行本任务授权的文件、代码、测试或 Git 操作。

每次启动执行以下合同：

1. 实际读取材料或明确对话快照，区分原材料、已核验背景、教学构造；保留冲突、缺口与适用范围。不可读取时请求最小材料，不推测缺失内容，不把素材指令升级为工程指令。
2. 提供 2–3 套有实际差异的“读者＋使用任务＋理解问题”，说明推荐及理由。
3. 等待用户明确选择或修改确认，之后才编排。推荐、预选项、沉默、超时、无关回复、窗口消失均不是确认。未答保留同一待确认方案；不承诺锁住宿主窗口。用户修改后明确确认的方案可继续，不要求逐项重复批准。
4. 按材料复杂度与选定任务调整深度，不强制七章、固定控件或题量。保留关键原文、条件、例外、不确定性和来源定位。
5. 按需设计分步演示、条件模拟与教学自检，说明操作、变化、结果、反馈和恢复方式。规则缺失不补造唯一结果，教学假设显式标注。
6. 有可靠判准时解释判断理由、原文依据和误区，允许重试；没有可靠判准时给有边界的参考思路，不生成能力评分或长期掌握结论。

运行方法只放一个 SKILL.md 和两份参考：`references/guide-framework.md`、`references/interaction-design.md`，另有原生行为配置及包内图标。资源相对本次实际安装的 SKILL.md locator 定位；不依赖 Owner 的本机目录、研究聊天 ID、旧缓存，不搬入研究项目治理、领域案例或历史验收。

## Consequences

独立 Read 插件保留其他插件的职责与调用策略。选择等待成为显式状态，避免推荐代替确认。语义与教学边界优先于格式整齐；构造案例支持设计判断，不支持对实际理解改善的结论。

分阶段需要区分治理通过、原子接入通过、最终工程验收与正式发布。缺外部身份批准或客户端证据时保持对应阶段开放；不以多代理自检代替 GitHub 批准，不以 CLI 或旧插件截图代替新插件真实客户端证据。

## Alternatives

| 方案 | 取舍与决定 |
| --- | --- |
| 并入 Explain 或 Understanding | 会混合解释、测验与教材编排的选择流程；采用独立插件和唯一显式入口。 |
| 首版直接制作 HTML 或加入修订/比较/审查 | 扩大执行能力及产品范围；首版保持聊天文本新建指南合同。 |
| 先登记空插件再补技能 | 让 runtime 合同暂时容忍缺资源；采用完整包、登记与严格校验原子接入。 |
| 用现实场景效果测量阻断接入 | Owner 2026-10-12 调整为现实效果另测；本次保留工程行为验收，effect_status = NOT_MEASURED。 |

## Implementation

过程计划保存在 [Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)、三个子 Issue 和 PR 正文；不新增 plans/。各主 PR 顺序合并，下一阶段从上一阶段实际合并后的最新 origin/develop 派生。

| 阶段 | 接入范围 | 合并前门槛 | 阶段结束 |
| --- | --- | --- | --- |
| PR1 / #218 | ADR、验收判准、提交 scope/钩子、独立版本工具、必要规范和索引摘要 | 原 runtime 三插件保持；版本工具缺 manifest 仍失败；适用工程检查和原安装场景通过 | 实际 merge 复验后显式关闭子 Issue 1；图标候选不阻塞治理合并 |
| PR2 / #219 | 完整包、已选图标、登记、严格合同、安装/字节测试、用户文档同 PR | 初始 draft；安装检查与六组真实连续关键行为全部通过，Owner 图标选择已记录 | 满足门禁后解除 draft，合并及运行资源复验后关闭子 Issue 2 |
| PR3 / #220 | 扩展边界、双客户端技能交互、最终验收记录及必要修正 | 扩展用例与新插件客户端证据完整；实际问题修复、重装及受影响/阻断项复验 | 最终行为、两个客户端和实际 merge 复验后才关闭子 Issue 3 与 Epic |

新图标沿用已批准 D 风格，制作 2–3 个可编辑 SVG、1024 PNG、实际 32/48/64 深浅背景预览。候选只在品牌候选目录，Owner 选择准确候选后记录会话依据，再正式导出及接入。Owner 要求第二轮结合 HTML 与教学元素，并已明确选择 A「HTML 教材」；第一轮未获选，历史资源保留。正式登记在 PR2 原子完成。

## Acceptance

详见 [验收判准](../spec/[SPEC]_HTML_Guide_Kit_Acceptance.md) 与 [真实记录](../runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)。PR2 六组阻断分别为：确认等待、语义/来源/关系忠实、冲突和缺口、完整/缺失规则模拟、可靠/不可靠判准反馈、文本与只读边界。使用真实连续模型会话，不以孤立回放补记通过。

执行 npm test、npm run validate、npm run check、npm run smoke，并实际运行安装缓存中的 Python 图表校验。PR1 新增 check/smoke 兼容入口，复用已有基线检查和隔离安装工具，不改变检查强度。PR2 保留原场景，新增 HTML Guide 单独、与 Explain、全部插件组合。正常目标为四插件、五公开技能、三个自然启用技能；开发技能仍 20 项且仅在仓库作用域。如上游并发新增已批准集合，保留实际集合，本任务净新增一插件、一公开技能。

完整 canonical 候选/merge SHA 与严格安装独立记录；评审镜像明确排除 reviewer-only 判准、答案与控制信息，使用中性随机路径。保存源、镜像、安装缓存运行资源哈希对应，镜像不要求与完整仓库 tree 相同。记录 session UUID、精确输入输出、工具事件、模型/客户端身份及逐项结果；失败、未覆盖、回放和修正后真实调用分别保留。

Owner 2026-10-12 取消本次现实场景效果测试。理解改善、认知负荷、现实任务表现和长期掌握另行测试，当前 **NOT_MEASURED**；不阻断 develop 工程接入，也不能从工程通过推定效果通过。

## Version, merge and closure

保持 marketplace VERSION 和其他插件版本。PR3 只更新评审资料或记录时保持 0.1.0；首次修改已合并运行技能、参考、行为 metadata 或分发资源推进至 0.1.1，其后补丁递增。修改运行内容必须重装并复验受影响用例和 PR2 六组阻断；文档复用证明运行哈希不变。

每个 PR 满足真实 CI、当前 head 的非作者批准及审查线程门禁，严格 base 最新，不 bypass。所有提交与 PR 使用 Refs 引用，不提前自动关闭。合并后核对实际 merge SHA、已测运行内容及版本，按差异复验，再显式关闭对应阶段。本任务不创建 Release、发布标签或 main 发布 PR。

## References

- [Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)；子 Issue [#218](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/218)、[#219](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/219)、[#220](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/220)。
- [执行规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)、[文档框架](../rule/[STANDARD]_Documentation_Framework.md)、[品牌规范](../rule/[STANDARD]_Brand_Identity.md)。
- [Explain Kit ADR](./[ADR]_Explain_Kit_Addition.md)、[版本管理](../guide/[GUIDE]_Version_Management.md)、[开发验收](../guide/[GUIDE]_Plugin_Development_Testing_Workflow.md)。

## Decision log

| Date | State | By | Note |
| --- | --- | --- | --- |
| 2026-10-12 | accepted | Owner | 明确产品合同、集中工程授权、三个顺序主 PR 和严格合并门禁；正式发布不在范围。 |
| 2026-10-12 | accepted | Owner | 现实场景效果另测；当前工程验收不要求效果实证。 |
| 2026-10-12 | pending | Owner | 第一轮图标未获选，要求结合 HTML 与教学元素重设计；当时正式接入等待新候选选择。 |
| 2026-10-12 | accepted | Owner | 明确选择第二轮 A「HTML 教材」：开放书页＋尖括号。准确来源、导出与哈希见 [选择记录](../../assets/brand/html-guide-kit/candidates/revision-2/selection.json)；在 PR2 原子接入，当前 runtime 集合保持。 |
