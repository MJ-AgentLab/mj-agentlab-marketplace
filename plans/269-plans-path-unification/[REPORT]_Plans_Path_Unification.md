---
type: report
scope: marketplace
summary: "Actual plan-path migration, failures, verification and remaining protected delivery"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: working
task: 269-plans-path-unification
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269
---

# [REPORT] Plans path unification

[任务入口](./INDEX.md) · [主 PLAN](./[PLAN]_Plans_Path_Unification.md) · [Issue #269](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269) · [主 PR #270](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/270)

## Actual scope and candidate A

Owner 明确要求实施后，Agent 建立 #269 与唯一主 PR #270，实际核对内部集成分支无保护、develop 仍要求当前 head 非作者批准/CI/线程。A 工作候选基于 bootstrap 7969d6f，迁移两原件、建立 222 唯一入口/PLAN/REPORT，同步当前规范/导航，原子移除 smoke/fixture 对旧目录的必需依赖。插件/版本、53 项兼容清单原字节未改；根 AGENTS 为 15952 字节。

两原件从固定 91f982f70552fc0bfdf4015da943e257a22d4c7b 的原 Git blob 恢复，迁入快照逐字节一致，身份与实际摘要见 [222 来源清单](../222-communication-kit/source-bindings.json)。原始完整计划及 provenance 只作历史恢复，未把当时接受转授给新主 PLAN。当前根 plan/ 已从 A 候选删除；B 将进一步删除解析豁免并拒绝重新引入，A 不独立宣称全部 S2 完成。

## Failures, repair and reproducible checks

| 实际轮次 | 输入 / 方法 | 结果与边界 |
|---|---|---|
| Bootstrap 格式检查 | 初始来源记录含真实 CRLF / 末尾空行，git diff --check 报告；PowerShell 未因该 native 非零自动停止，bootstrap 仍提交 | 保留这一过程失败。A 为精确来源文件补齐字节格式属性，普通 INTENT 多余 EOF 修复；未改 checker、CI 或旧路径兼容规则 |
| A 首轮严格校验 | 新 222 INDEX 的 canonical 数组含旧未显式分层 SPEC | FAIL；改为仅登记显式 canonical 的 ADR/Standard，正文 SPEC 相关链接保留，不扩大旧文档改造 |
| A 首轮完整测试 | npm test，597 项 | 595 PASS / 2 FAIL，来源为上述 canonical 登记，见[原始失败日志](./evidence/a-initial-tests.log) |
| A 独立来源/语义评审 | /root/inspect_plan_unification 只读检查实际 diff、Git 原件、链接/接受边界 | 首轮发现历史接受误指新 PLAN，修复为历史原件；第二轮明确无阻断。独立评审是 Agent 合成核验，不是 GitHub 非作者批准或 Owner 最终接受 |
| A 修复后严格校验 | npm run validate，实际工作候选 | PASS；所有公共技能/仓库技能登记保持。最后提交的 CI 仍须绑定真实 head |
| A 修复后完整测试 | npm test，实际工作候选，211361.0614ms | 597 PASS / 0 FAIL / 0 skip，见[原始修复日志](./evidence/a-fixed-tests.log)；不外推 B 或最终集成 |
| A 源身份 / 范围 | 两原件与固定 Git blob 逐字节、53 项兼容清单不变、插件/版本 diff 空、根预算/空白检查 | PASS，独立再次核对一致；具体 PR/CI 和合并 head 以实际发生追加 |

实际日志使用来源原字节，字段/时间只报告已观察值；运行未提供准确起止墙钟时不补造，消息捕获时间不替代实际决定时间。

## Remaining delivery and acceptance

- A 内部 PR、真实 head CI / 线程门禁和实际 merge 待发生；B 旧根/当前链接拒绝与负例待完成。
- 最终集成须执行全部单测、strict validate、13 组合 canonical 安装、实际缓存 Python、独立三角色阅读与恢复核验。
- 保护 develop 的当前 head 非作者批准、CI、线程、基线和实际合入/复验分别记录，不 bypass，不由 Agent 自检代替。
- 未答原生窗口持续显示仍缺客户端实证，保留对应延期，不标通过；插件模型/客户端/现实效果不在本批重测范围。
- 核心工程交付、完整计划完成、实际受保护合入及 Owner 最终成品接受分别判断，尚未发生不预写完成；无正式发布。
