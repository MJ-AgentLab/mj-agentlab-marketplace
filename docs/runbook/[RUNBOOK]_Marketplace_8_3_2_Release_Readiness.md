---
type: runbook
scope: marketplace
summary: "Prepare 8.3.2 with HTML site delivery and retain actual approval gaps"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: working
purpose: "Maintain source-bound 8.3.2 release identities, gates, retained limits and ordered recovery/closeout for task 274"
last-verified: null
---

# [RUNBOOK] Marketplace 8.3.2 release readiness

## §1 Authorization, task and actual source

本账本承接 [#274 任务入口](../../plans/274-html-learning-artifact/INDEX.md)的唯一[主 PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md)与[主 REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md)，记录正式发行的身份、适用门禁和恢复，不建立第二份计划或报告。Owner 原实施指令已覆盖完整原计划及 P5 按项目规则上线；本轮又明确“#275 PR 已合并，继续后续工作”。目标、对象、环境、权限与风险边界未实质改变，沿用该授权准备正式发布，不另要求 Owner 审查常规构建；成品体检和最终接受另待真实决定。

[PR #275](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/275) 于 `2026-10-19T12:56:35Z` 实际合入 develop `65d756efd3024ac10d1d0e6ea189055fbe6f1545`，tree `d7de559f6563d8208098952f92495c1b7acca9cb` 与已测集成 `1a80bab5c85ae9b216f49a5d9c114770117ab2dd` 相同。实际合入、工程结果、保护批准与 Owner 接受分别判断；reviews=[]，非作者批准记 **NOT_MET**。真实规则执行列表的 suite `4599887231` 匹配 develop before `1d5219c1fa1bbf14cc79f630a59e9a8c857248f4` / after `65d756ef`，pushed_at为`2026-10-19T20:56:35+08:00`，result=bypass；[原始详情](../../plans/274-html-learning-artifact/evidence/sources/postmerge/pr275-rule-suite.json)确认pull_request fail：缺少最新推送者以外的批准；required_status_checks pass，不推造豁免授权。实际合入不成为后续发布保护的例外。

本次隔离发布分支为 `codex/release-html-learning-8-3-2`，保留上述 develop 完整 ancestry；准备时 main 为 `7615ca58f410876fc7393b0d93017250fe712091`。本账本v1.0准备时正式发布 PR 尚未创建；后续当前身份由原Issue/PR回读。实际 PR 号、最终 head/base/候选合并树和服务端门禁由真实回读补记，不预造未来身份。Marketplace VERSION/badge 已由既有预升准备为 `8.3.2`；本次不重复 bump。准备时无 v8.3.2 tag 或公开 Release，现行安装仍指向真实公开 v8.3.1；新版本公开前不将安装指引改为不存在的发行。

## §2 Release scope and inherited qualifications

| Package | Candidate version | Scope compared with main761 |
| --- | --- | --- |
| Diagram Kit | 0.3.1 | 无运行或版本差异 |
| Learning Evidence Kit | 0.1.0 | 无运行或版本差异 |
| Explain Kit | 0.1.1 | 无运行或版本差异 |
| Communication Kit | 0.1.0 | 无运行或版本差异 |
| HTML Guide Kit | 0.1.37 | 新增显式 site、包内方法/主题/工具、Read/Write 包级元数据、许可与相应检查；guide 和已批准图标保持 |

候选为五包八公开技能、五显式/三自然，仓库技能仍20项。main 已含公开 HTML 0.1.36；本次不再决定其首次发行，也不重启旧 guide 验收。guide 子树在 main/develop 均为 `e6561e75fcfebf13a98469f9035b334267998ec1`，不把未变字节等同全部历史行为通过。

完整 main→develop 差异还包括已交付的 [#257 文档分层与任务机制](../../plans/257-task-documentation/INDEX.md)、[#263 INTENT](../../plans/263-intent-mechanism/INDEX.md)、[#269 计划路径统一](../../plans/269-plans-path-unification/INDEX.md)，以及直接配套模板、20项既有仓库技能适配、完整来源/冻结证据校验与内部 PR 的 CI/A6 覆盖。这些是此次完整发行候选继承的既有治理交付，不改其他插件身份或运行范围；各任务的真实接受、历史批准缺口、失败和延期沿用原账本，不由本次发行追认。

新 site 的判准见 [SPEC](../spec/[SPEC]_HTML_Learning_Artifact.md)，实际有界结论见主 REPORT：内部候选已取得完整工程/安装闭包、独立代表材料内容核验、12项浏览器交互及一个目标客户端手动消费实际安装 locator→Sites 私有部署证据。实际65d的新安装复验已独立通过（§3），未运行新browser/model/desktop；本发布准备相对65d仅修改发行/任务文档、HTML README/CHANGELOG介绍及冻结证据的局部空白属性，不改技能/工具/包manifest字节。最终运行候选的 Windows 642/642、Linux 641 PASS/1 Windows 专属大小写 skip、各十三安装及实际缓存 Python，分别绑定其原 CI 身份；不换名为 actual65d 或本发布候选的新执行。浏览器生命周期修复、原失败和修复重跑保留各自原件。

代表性 Site 为 [Library Renewal · 续借判断](https://html-learning-artifact-274.zuozhouran.chatgpt.site)，保存版本1、源码 `ffaaa35965e7525b4f85036aa62e21b3c2095c73`，有界7文件制品与实际部署版本对应；原生回读 owner/custom/users1/groups0/externalVisitors0，匿名无凭据 GET 返回401。详细部署身份、访问回读及观察时钟见主 REPORT 和其中 Sites 原件；这些是该次实际观测，不是本次新网页交互、持续监控或 Owner 接受。既有私有站保持身份和受众，不因 Marketplace 正式公开扩大站点权限。

以下限制继续适用，不以新版公开抵消：

- **HTML guide**：保留 0.1.36/#239 已知 FAIL、完整双端和扩展未覆盖、原生空返回/关闭/超时及 Owner 接受缺项；旧 Work/Codex 限定结果不升级为当前完整通过，详见[历史验收](./[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)。
- **HTML site**：当前桌面手动按安装 locator 执行与 CLI 发现、原生桌面派发分开；原生持续窗口/完整生命周期、第二客户端、完整视觉/可访问性及扩展场景仍延期。必要答案缺失仍阻依赖部分，未提交/默认/预选/沉默/超时/关闭不算回答。Owner 体检与最终接受未提供，理解效果保持 **NOT_MEASURED**。
- **Learning Evidence**：沿用[入口资格账本](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)限定 CLI core，移交仍限已有本地 Git exclude；严格原生持续待答延期、桌面/Side Chat 和真实效果未测，#215/Epic 及 Owner 最终接受独立。
- **Communication**：保留[验收](./[RUNBOOK]_Communication_Kit_Acceptance.md) CLI 15 PASS/3 PARTIAL、同一桌面应用两个本机入口的限定结果；不冒充两个独立客户端、完整 Office 或所有窗口生命周期通过。
- **治理与批准**：各历史任务、#253/#254 的已证实治理缺口与 #245 仅限本 Issue 的历史例外保持；#275 空 reviews/批准 NOT_MET及匹配规则suite实际bypass分别披露，pull_request fail（缺最新推送者外批准）、required checks pass。任何历史接受、技术 PASS、实际合入或私有 Site 发布均不替代本次 main 当前 head 的真实保护批准。

## §3 Current gate ledger and execution order

| Item | Current preparation state | Required evidence / next action |
| --- | --- | --- |
| #275 actual develop identity | MERGED / SAME_TREE / APPROVAL_NOT_MET / BYPASS_OBSERVED | 已绑定65d/tree及1a80；空 reviews与实际suite4599887231分记，pull_request fail（缺最新推送者外批准）、required checks pass |
| Fresh actual65d verification | PASS / BOUNDED | 独立13:00:06.401–13:10:12.179Z新验：13场景/178命令全status0、6Diagram+18LEK Python、4site生成/4静态Python（各89项零错）；47资源组、site各20资源；自有新根无残留、worktree清单复原，见[原始汇总](../../plans/274-html-learning-artifact/evidence/sources/postmerge/canonical65d/summary.json) |
| Final release candidate | LOCAL_TECHNICAL_PASS / CI_PENDING | 发布准备本机642/642零skip、144相关与9site修后通过，旧FAIL保原件；最终head/tree与新服务CI/安装仍按实际PR冻结身份回读，见[阶段汇总](../../plans/274-html-learning-artifact/evidence/sources/postmerge/preparation/html-learning-274-release-final-checks.json) |
| Protected main PR | NOT_CREATED at this preparation snapshot | 从本隔离分支向最新main建正常release PR，真实编号与身份后补 |
| Current-head main approval/checks/threads | PENDING | 1个真实非作者批准、最新推送批准、适用code-owner要求、Validate Structure及其他required checks、最新base和已解决线程 |
| Actual main merge / tag / Release | NOT_PUBLISHED | 门禁满足后普通合并，由既有draft-first发布；回读实际SHA、正文、published/assets/immutability |
| Fresh real-tag verification | NOT_STARTED / DEPENDENT | 公开后从真实tag的新十三安装、6 Diagram+18 LEK Python、site生成/静态及清理结果按实际日志计数 |
| Owner inspection / final acceptance | NOT_PROVIDED | 上线后Owner从成品体验给真实范围/问题/决定；不让其承担常规构建审查 |

执行顺序：

1. Agent 核对 actual65d 合入身份并完成新复验，将原始证据与结果接回同一 #274 REPORT；冻结完整隔离发布候选，核对 VERSION=8.3.2、CHANGELOG 对应版本节、五包资源、来源/许可及无凭据或非预期材料。
2. 执行当前适用完整工程/严格校验、精确 CLI 0.147.0、十三隔离安装及实际缓存 Python；必要 CI、A6 和提交约定同样核验。check/smoke 别名不重复计作独立运行。已有内容/消费者证据只按实际资源差异继承，不重启完整旧模型或桌面矩阵。
3. 正式 PR→main 读取真实 rulesets、current head/base、最新服务端检查、批准、线程及候选合并树。所有本次适用保护条件真实满足后才普通合并；不 self-approve、不 bypass。分支移动则刷新受影响检查和最新推送批准。#275 已发生的历史缺口继续独立披露，不制造追溯批准。
4. VERSION 合入 main 会触发 [Release workflow](../../.github/workflows/release.yml)。按[现行发布操作](./[RUNBOOK]_Release_Operations.md)执行 draft-first：指定 SHA 属于 main，新发行绑定当前 main tip；空draft→canonical安装验证→紧邻publish重新核身份→publish→回读。未知结果先核状态，禁止重复创建同号发行或覆盖已公开历史。
5. 回读实际 main/tag/Release 同 SHA、版本/正文、工作流、draft=false、prerelease、assets 与 immutability；未返回的信息记 UNKNOWN。自动工作流的概括 canonical PASS 不补造逐十三场景/Python raw。
6. 从真实 tag SHA 新做十三 canonical 安装及实际缓存 Python/资源核对，保存真实工具版本、动作/返回码、清理与自有根 absence。新批次与候选/actual65d 分开，不借计数。只有此后才更新安装指引为真实 v8.3.2。
7. 先记录实际公开及复验→将完整实际main ancestry通过正常PR同步回develop并复验→才从实际同步结果先DryRun再Apply仅市场8.3.2→8.3.3预升，正常同步README badge/根AGENTS与A6；插件版本保持、不创建v8.3.3 tag或Release。后续PR各自满足真实批准、CI、最新base和线程，顺序与实际身份分别记录。

`last-verified: null` 表示本次正式发布闭环尚未完成，不否定既有候选技术验收，也不把它升级为main批准、公开或发布后新执行。只有实际事实发生后追加结果；完整计划完成与Owner最终接受仍分记。

## §4 Monitoring, stop conditions and recovery

责任为执行 Agent，Owner 处理实质决定/必要权限及成品接受。发行前、公开后即时复查与Owner问题反馈时观察 tag/Release 身份、canonical 安装/资源/Python失败、关键内容/交互错误及Sites部署/访问边界；本次没有创建持续监控自动化，不称一次回读为连续监控。

关键内容或资源缺失、核心不能完成、必要门禁失败、tag/Release错绑、身份/受众异常、凭据或非预期材料风险均停止新增发布/扩大受众，保留原始结果并升级责任Agent/必要Owner。未知远端结果先回读身份、保存版本和权限，确认实际状态后再修复，不盲目重复创建/部署。

插件已知良好公开基线为v8.3.1的实际tag `4e4d4172fb27c812d3be8847f792dae5313daec8`；Sites已知良好交接包为主REPORT对应7文件、manifest SHA256 `c4c445947180f77641512dee1de3732fbc7946fb53fce804f33677e6e037c16e`与真实保存版本1。恢复先核原始受众/身份，再选已知良好保存版本重新部署或前向修复，复验受影响部分。已公开插件问题以新受保护修复PR/版本前向处理或原子恢复完整包及严格清单，不删除、重打或覆盖历史tag/Release/资产；失败与重跑原件均保留。自有临时根只在证据保存后按精确路径安全清理，不触碰研究目录、原用户计划或其他任务缓存。

## §5 Revision history

| Version | Date | Scope |
| --- | --- | --- |
| v1.0 | 2026-10-19 | Prepare authorized full 8.3.2 from actual #275 merge; preserve exact package/governance scope, empty reviews and source-matched bypass observation with original per-rule failure/check facts, fresh actual65d checks, pending final candidate/main gates/publication, and ordered recovery/closeout. |
