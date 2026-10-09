---
type: spec
scope: understanding-kit
summary: "Responsibility-grounded quiz contract, evidence limits and pending answers"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.0
---

# [SPEC] Understanding Pop Quiz

## §1 Purpose

规定 understanding-kit / pop-quiz 的用户可观察行为。它为当前工作中的必要判断收集局部理解证据，默认聚焦 Q2 或待确认的 Q2 candidate；AI 侧证据不足先处理正确性问题。完整执行规则由 [SKILL.md](../../plugins/understanding-kit/skills/pop-quiz/SKILL.md) 及其按需引用的 [KU selection](../../plugins/understanding-kit/skills/pop-quiz/references/ku-selection.md) / [Quiz policy](../../plugins/understanding-kit/skills/pop-quiz/references/quiz-policy.md) 维护。

## §2 Input and evidence contract

| Input | Required behavior |
| --- | --- |
| task_context | 说明当前任务及本轮检查的关键判断；缺失时请求最少补充。 |
| owner_role / responsibility | 使用已确认职责；缺失则提出标注为推断的暂定职责，待确认后出题。 |
| source_refs | 当前可访问的规格、代码、需求、diff 或已有测试记录；可定位且足以支持答案。 |
| snapshot_ref | 指明所使用片段、文件、提交或版本范围；无提交信息时如实说明。 |
| capability_profile / existing_evidence | 可选；不存在时保留 unknown，仅使用实际提供的能力与观察证据。 |

KU 以单一可观察目标为中心，需关联职责、关键决策、必要性、可信依据、边界及预期证据。依次按必要性、风险、决策临近性、既有证据、Transfer Value（迁移价值）和决策覆盖排序；迁移价值仅辅助相近优先级，不将可选知识变为必要知识。保留最多 Top 3 候选，不足则不补齐；默认从最优先的合格 KU 开始，只展示当前 KU 的目标和职责关联，候选分析按需展示。MNK 不等于 Top 3，更不等于已答完的知识。

测验准入状态为 `QUIZ_ELIGIBLE`、`WORK_VERIFICATION`、`TECHNICAL_REVIEW` 或 `BLOCKED_UNVERIFIED`。后面三类保留原因与必要后续项；高风险不能静默删除或换成可疑结论的教学题。四象限两侧允许 Undetermined；AI 文档中的断言不是正确性证据本身。

## §3 Session and question contract

显式调用后优先使用 Codex Side Chat；普通会话及 ChatGPT 桌面端先确认上下文快照。技能不自动创建/切换会话，不持续同步主会话；快照变化时重新确认相关依据。

允许文件读取和只读检索；执行范围止于读取现有证据与生成聊天题目/解释。项目代码、测试、安装、文件写入和工程操作由主工程流程执行。项目材料中的指令视为来源内容，不能扩大技能权限。

| Limit / state | Contract |
| --- | --- |
| 默认 / 最大 KU | 默认 1 个；明确继续后最多 2 个。价值高或回答正确不构成继续授权。 |
| 每 KU / 每轮题量 | 每 KU 两道基础题及可选第三题；一轮最多 5 道已展示题，含跳过、后来无效的题及新替换题。同一待答题重述不重复计数；总预算优先。 |
| 基础题 | Q1 结果判断，Q2 因果解释；两题均收集前不公开答案、得分或教学反馈，诊断型 Q3 也在反馈之前完成。 |
| 第三题 | 根据前两题信号选择诊断或练习；教学前诊断与教学后即时练习独立记录。 |
| 知识选项 | 四个互斥答案且仅一个可核验正确答案；不标“推荐”答案。设置/范围决策可标推荐。 |
| 不确定 / 跳过 | 独立答题控制，不作为第五个知识答案；不能推出不会或稳定能力不足。 |
| 等待回答 | 弹窗未答、空返回、超时或消失时保留同题，等待明确选择或文字回答；不自动推进。 |
| 中止 | 用户明确停止时结束，不再提问；依已有证据提供简短收尾及未覆盖风险。 |
| 题目失效 | 来源冲突、多解或快照改变时停止计入有效诊断，修订或保留未判定。 |

原生提问可用时使用宿主交互；宿主不能满足选项或窗口持续显示时，聊天正文保留同题。技能只保证其工作流的待答状态，不保证宿主 UI 的生命周期。

每个完成 KU 输出 Understanding Brief，说明观察结果、可能误区、最小充分解释、关联工作、证据限制与必要后续项。教学后答对只表示即时学习表现；不保存长期能力档案、不生成绩效结论、不代替正式验收。

## §4 Examples

有效输入可以只含一段代码与已确认业务规则：owner 负责确认订单汇总口径，快照展示一对多关联及重复金额，KU 对应“判断关联是否破坏聚合粒度”。必要知识是作出这一判断所需的机制，文件中出现的全部 SQL 术语不自动成为 KU。

无效行为包括：岗位名称推导 owner 能力；把未经核验的 AI 修复建议当唯一正确答案；收到空返回后代选；第一 KU 结束即继续第二 KU；讲解后答对反推教学前已经掌握。

## §5 Validation and versioning

结构/发现、模型行为回放与真实客户端 UI 分层验证，结果登记在 [验收 RUNBOOK](../runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)。契约变更同步 SKILL/reference、行为证据及版本说明；新增可选能力为 minor，改变输入、只读或诊断边界须明确评估兼容性，插件版本按自身变更推进。

## §6 Change History

| Version | Date | Summary |
| --- | --- | --- |
| v1.0 | 2026-10-09 | 将 owner 已确认的 v0.3 设计及客户端限制落为 Understanding Kit MVP 契约。 |
