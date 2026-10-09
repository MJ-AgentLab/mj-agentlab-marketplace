---
type: guide
scope: understanding-kit
summary: "Use explicit Pop Quiz with Side Chat or a confirmed context snapshot"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.2
---

# [GUIDE] Understanding Pop Quiz

## §1 Audience

参与 AI 辅助开发、需要判断规格、设计、实现或验收结果的 owner。Pop Quiz 检查当前职责需要的理解，默认一次一个知识单元；它提供理解反馈，不要求学习全部技术内容。

Understanding Kit 0.1.1 已随 Marketplace v8.1.0 通过 #198 合入 main 并发布，可从 main 或固定标签 v8.1.0 安装。历史 v8.0.0 仅包含 Diagram Kit，0.1.0 是未发布的初始开发身份。发布后安装复查与尚未执行的真实桌面交互见 [发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

## §2 Walkthrough

### §2.1 Install the package

从已发布市场安装，固定当前发布标签；开发验收可另将 source 替换为待测 worktree 的绝对根路径。

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref v8.1.0
codex plugin add understanding-kit@mj-agentlab-marketplace
codex plugin list --json
~~~

确认安装版本与根 manifest 一致（本次发布为 0.1.1），pop-quiz 的安装元数据可解析。它设为显式调用，在普通 prompt 的隐式技能列表中隐藏；CLI 0.147.0 的 debug prompt-input 不替代其显式加载/实际调用验收。个人环境中已添加的同名来源可能指向旧标签或本地候选，应先核对实际 source；代理的正式隔离验收流程见 [RUNBOOK](../runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)，它不修改个人插件配置。

ChatGPT 桌面端选择 main / v8.1.0 或待测 worktree 的 repo marketplace，刷新/重启后安装 Understanding Kit，在新会话显式选择或调用 SDLC Pop Quiz。安装与 composer 发现须在真实客户端检查，CLI 结果不能替代。

### §2.2 Choose the context

Codex 优先由使用者打开 `/side`，或选择主会话片段后 Ask in side chat，再显式调用技能。技能不自动创建/切换 Side Chat，也不会持续同步主会话后续消息。

ChatGPT 桌面端或普通会话直接提供同样的任务快照：当前任务、自己负责的判断、可访问材料及其版本/片段范围。例如：

~~~text
使用 $understanding-kit:pop-quiz 检查这份订单报表的理解。
我负责确认销售额指标和验收规则，不负责数据库性能优化。
以我刚提供的 SQL 和已确认业务规则为本轮快照，先检查一个最重要的 KU。
~~~

职责不明确时，技能提出暂定职责并等待确认；个人能力未知时保留未知，不要求填写能力档案。材料不足以核验正确答案时，先补充证据或记录阻塞。

### §2.3 Answer and review

技能从最多 Top 3 候选中选择最优先的合格 KU，并说明目标与职责关联。默认回答结果判断和因果解释两题，在两题结束前不公开答案；按表现可能追加一题，诊断追问仍在反馈之前。测验答案不标推荐选项，“不确定”和“跳过”是有效控制信号。

未回答时技能保持待答；宿主弹窗失效时在聊天正文保留同题，接受明确文字答案。客户端窗口不能由纯技能锁定，空返回或等待时间不表示答复。

每个 KU 完成后阅读 Understanding Brief，再明确选择是否继续。第二 KU 只有明确继续才开始；一轮最多两个 KU / 五题。主会话或文件发生变化时，更新快照后再检查新方案。

用户可以随时停止。需要把理解反馈用于工程工作的，由用户带回主工程流程；技能不会写回代码、项目文档或能力资料，也不执行项目测试。

## §3 Further Reading

- [行为契约](../spec/[SPEC]_Understanding_Pop_Quiz.md) — 证据、题量和待答状态。
- [新增 ADR](../adr/[ADR]_Understanding_Kit_Addition.md) — 已批准边界与历史决定的局部替代。
- [验收 RUNBOOK](../runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md) — 实际安装、行为及客户端结果。
- [官方 Side Chat 操作](https://learn.chatgpt.com/docs/developer-commands) — 支持面的操作方法。

## §4 Change History

| Version | Date | Summary |
| --- | --- | --- |
| v1.0 | 2026-10-09 | 初版开发试用指南，区分已发布安装与本地新插件验收。 |
