---
type: adr
scope: marketplace
summary: "Add explicit read-only Understanding Kit without reviving retired Learn Kit"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.0
supersedes:
  - "./[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md"
---

# [ADR] Understanding Kit addition

| Field | Value |
| --- | --- |
| Status | accepted for implementation and develop PR preparation |
| Date | 2026-10-09 |
| Author | marketplace-maintainers, following owner decisions |
| Scope | marketplace / understanding-kit |
| Reversibility | reversible before release |

## §1 Context

Owner 提供 SDLC Understanding Pop Quiz v0.3 设计并通过 grill-me 确认实施边界：从当前职责及关键判断反推最小必要知识，选取单一可观察目标，以短测验发现理解缺口。AI 交付正确与 owner 理解充分是两类证据；测验不替代工程测试、审查或人员能力评价。

迁移 ADR 曾将市场收敛为单个 Diagram Kit 并退役 learn-kit。本次增加独立 Understanding Kit，局部替代该 ADR 的单插件集合与插件版本权威范围；其历史正文保留，客户端支持、portable 格式、退役、独立审查、发布授权和历史保护继续有效。`supersedes` 只表示上述局部替代，不撤销整份迁移决定。

## §2 Decision

新增 **understanding-kit 0.1.0**，唯一公开技能为 **pop-quiz**，采用纯指令与 `ku-selection.md` / `quiz-policy.md` 参考资源。

- 使用根 `plugin.json`、`skills/pop-quiz/SKILL.md` 和必要 UI metadata；显式调用，默认不自动触发。市场另保留 diagram-kit / arch-diagram。
- 以 Role / Responsibility → Decision → MNK → KU 的顺序选择知识。职责缺失时提出标注为推断的暂定职责，确认后使用；能力资料缺失保留 unknown，不从岗位、职责或答题信号推断稳定能力。
- 可信依据、反证和来源冲突先于教学。高风险但不适合测验的 KU 保留，并提示工作验证或技术审查；由相关工程流程执行，pop-quiz 不自行操作。
- Codex 优先在 Side Chat 使用明确上下文快照；ChatGPT 桌面端或普通会话使用快照降级。技能不自动创建/切换 Side Chat，不自动同步或写回主会话；版本改变后旧证据须重新确认。
- 允许读取文件与只读检索命令；不执行项目代码、测试、安装、修改文件、提交、PR 更新或其他工程操作。
- 默认检查 1 个 KU，候选最多 Top 3；第二个 KU 必须收到明确继续。每轮最多 2 个 KU / 5 道题，每个 KU 采用 2+1；总预算优先于追加题。
- 同一 KU 的前两题收齐前不公布答案、得分或解释。第三题按回答动态选择，教学前诊断与教学后即时练习分开记录。知识选项不标推荐答案。
- 窗口生命周期由宿主控制，技能不承诺锁定弹窗。未答、空返回、超时或窗口消失不代表选择或继续；保留当前题目，等待明确回答，必要时在聊天正文恢复同题。
- 结束一个 KU 后给出 Understanding Brief：可观察结果、可能误区、最小解释、工作关联、证据限制及必要后续项。无长期知识库、能力档案更新、定时测验或学习收益承诺。

本次授权范围为构建、验证及 develop PR 准备。marketplace VERSION 保持 **8.0.1**；diagram-kit 保持 **0.3.0**。各插件根 manifest 是各自版本权威。本次不创建标签、Release 或执行正式发布；正式发布仍需独立授权和两个目标客户端的验收证据。

## §3 Consequences

### §3.1 Positive

独立包名使新的理解测验与退役学习包清晰区分；复用已有文件和会话能力，无新增 MCP 服务、数据库或运行依赖。职责与决策约束选择范围，预算约束单次负担。

### §3.2 Negative

来源与会话快照需要使用者提供或确认；客户端交互不同，问题窗口不能由技能强制保持。选择题只能提供局部理解证据，真实学习收益须通过后续试点检验。

### §3.3 Risks

来源冲突时暂停对应 KU 的出题；缺失信息留为未判定。未答保留同题，第二 KU 等待明确继续。区分发现、模型回放和真实桌面 UI 证据，防止用自动化检查冒充客户端验收。

## §4 Alternatives Considered

1. **采用：独立纯指令插件。** 满足轻量测验和已有 marketplace 格式，新增运行依赖最少；交互遵循宿主能力。
2. **恢复 learn-kit 或旧学习技能。** 会重新引入已退役产品边界及历史运行链，与当前批准范围冲突，未采用。
3. **增加 MCP 服务或独立问卷 UI。** 可提供服务端状态或自定义交互，但会增加部署、认证及跨客户端验收负担，本轮未采用；仍不能据此保证宿主窗口永不消失。

## §5 Implementation Plan

1. 在独立 worktree 建立 Understanding Kit 包、公开技能和两份参考资源。
2. 扩展维护集合、独立版本工具、隔离安装/发现与行为测试；保留 diagram-kit 的真实 Python 校验和全部治理保护。
3. 同步根入口、当前 SPEC/GUIDE、文档索引和受影响开发技能；保持历史发布段与退役记录。
4. 执行检查、隔离安装、模型行为回放与可用客户端验收，按实际证据记录未执行项；准备 develop PR。

## §6 Acceptance Criteria

放行记录以 [Understanding Kit 验收 RUNBOOK](../runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md) 为准，本文的 accepted 不表示以下项目已执行。

- [ ] 两插件/两公开技能安装元数据正确，pop-quiz 显式调用；普通上下文仅含 arch-diagram，仓库外不泄露 19 个开发技能。
- [ ] 原有治理、版本事务、发布保护与 Python 图表校验继续通过。
- [ ] KU 来源、职责差异、反证处理、2+1 分支、题量、未答与停止行为完成实际回放。
- [ ] Codex Side Chat 与 ChatGPT 桌面端快照分支均有独立的版本、安装及调用证据。
- [ ] marketplace / diagram-kit 版本保持，未新建标签或 Release。

## §7 References

- [局部被替代的迁移 ADR](./[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)
- [Pop Quiz 契约](../spec/[SPEC]_Understanding_Pop_Quiz.md) / [使用指南](../guide/[GUIDE]_Understanding_Pop_Quiz.md)
- [发布操作](../runbook/[RUNBOOK]_Release_Operations.md)
- [官方技能工作流边界](https://developers.openai.com/plugins/concepts/skills)
- [官方 Side Chat 操作](https://learn.chatgpt.com/docs/developer-commands)
- [官方 App Server 待答请求生命周期](https://learn.chatgpt.com/docs/app-server)

## §8 Decision Log

| Date | State | By | Note |
| --- | --- | --- | --- |
| 2026-10-09 | accepted | owner | 确认新 understanding-kit / pop-quiz、显式只读、职责推断后确认、能力不推断、快照降级、第二 KU 明确继续及宿主窗口限制；授权构建并准备 develop PR，未授权正式发布。 |
