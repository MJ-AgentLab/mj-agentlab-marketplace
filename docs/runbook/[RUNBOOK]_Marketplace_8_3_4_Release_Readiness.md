---
type: runbook
scope: marketplace
summary: "Prepare8.3.4 with HTML0.1.39 and preserve bounded evidence, deferrals and protected gates"
owner: marketplace-maintainers
created: 2026-10-20
updated: 2026-10-20
state: active
version: v1.0
layer: working
purpose: "Maintain Issue274 release scope, actual source checks, protected publication identities and recovery for8.3.4"
last-verified: null
---

# [RUNBOOK] Marketplace8.3.4 release readiness

## Candidate and authorization

2026-10-20：#290已于14:16:36Z实际合入develop **7c23f347c0725bdfa57ee1e0f5e9075a8d90babf/tree5743c7974880ff5fa87c9294313ec9adc6abac40**，parents f3e8＋720540，完整main f18 ancestry保持。市场8.3.4预升已交付，HTML0.1.39及其他插件版本保持；公开仍v8.3.3/HTML0.1.38。实际7c23本机652总/651PASS/0FAIL/1平台skip、strict/CLI0.147及新13/178、实际Python/15精确根清理通过。

实际新验/授权短引/资源继承闭包见[唯一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#actual-pr290-verification-and-html0139-release-preparation)，任务[INDEX](../../plans/274-html-learning-artifact/INDEX.md)导航同一主PLAN、完整32项与A01–A08、唯一INTENT。旧公开[8.3.3账本](./[RUNBOOK]_Marketplace_8_3_3_Release_Readiness.md)保持；8.3.4市场已由290预升，本轮不再次bump。五包八公开/五显式/三自然/20repo skills；HTML0.1.39，Diagram0.3.1、LEK0.1.0、Explain0.1.1、Communication0.1.0保持。

复用U1完整实施/B1 P5上线及U2选择性统一的同五边界授权，独立scope审阅无新增Owner实质决定；上一仅预升阶段限定不永久阻本轮后续。将完整actualdevelop ancestry向受保护main准备单一发行PR，不另开并行实现主PR；本账本为候选快照，不证明自身后继commit/PR/CI/actualmain/公开。VERSION合main会触发已有draft-first，必须先满足实际main规则、当前head非作者/最新推送者以外真实批准、required checks/线程/latestbase。

## Evidence and release gates

| 项目 | 当前实际状态/剩余门槛 |
|---|---|
| 实际develop | 7c23/tree5743与已测720/tree同；本轮新652/651P/1平台skip及新13/178/实际Python/15精确根清理通过，不借旧计数 |
| .39新增/继承 | 新neutral/theme/default与本地规则的限定工程检查；原12项中的第5–12交互仅按相同index.html/learning.js/输入闭包继承，布局/主题另验，非新运行。scope原始路径/hash可恢复 |
| 当前候选 | 发行文档/来源/A6/新head相关检查及独立审查待自身实际结果；运行资源冻结同7c23 |
| main保护合入 | NOT_STARTED，当前新head真实批准/CI/线程/latestbase及actualmain SHA/tree待证；旧bypass/NOT_MET非豁免 |
| 正式公开 | NOT_STARTED；draft-first、tag/Release目标/正文/访问/published/资产/immutable状态待实际读数；不提前称公开 |
| 真实tag新验 | NOT_STARTED；公开后从确切tag新十三安装、实际Python及精确自有根清理，不借候选/main/CI计数 |
| 原生/客户端/效果 | D01等延期非PASS、扩展未覆盖保留、NOT_MEASURED；Owner接受仅原.37核心，完整计划OPEN |

实际suite4621294286为bypass、reviews=[]/批准NOT_MET，Agent未执行该保护合并。旧FAIL/UNKNOWN/历史批准缺口保留；D01持续窗口等延期非PASS、效果NOT_MEASURED、完整计划OPEN，原核心ACCEPTED_LIMITED仅0.1.37，不扩至0.1.38/Site v2/0.1.39。本轮未新跑模型/Matt/桌面/第二客户端/原生窗口/Sites或更新受众，无新增Owner产品决定。

## Observation, stop and recovery

责任人为工程Agent/marketplace-maintainers，在本次有界发布与发布后验收窗口检查：CI/保护门禁、实际main/tree、draft/tag/Release身份、版本正文/资产/published、真实tag安装/资源/实际Python及自有根清理。没有请求周期自动化，不创建后台监控。任一目标/正文/版本错配、required gate缺失、凭据/非预期材料或运行检查失败即停止依赖公开/后继步骤，保原始失败并自主诊断；只有实质越出五边界才请求Owner必要授权。

已知良好公开版本为v8.3.3/fdede3cf5578dee8a41aef4310a9387d695c56bd、HTML0.1.38，Release正文2507B/SHA25611fc9f4c0231ba5aebda7a7d3add60ed8f506a943e2ff516d5c2c8b27c5b069c，原immutable=false/仓库配置UNKNOWN保留。发行前可撤销未发布候选或通过普通后继PR修正；发行后停止有问题版本推广，明确固定已知良好tag供安装，并按现有保护控制做前向修复；不移动/重打已公开tag、不覆盖Release正文/资产或历史。实际生产回滚需必要故障或专门有界条件，不虚称本轮已演练。

默认公开安装继续固定v8.3.3，只有真实8.3.4公开并从真实tag新验后才更新指引；同一私有Site v2未更新、不扩大受众。发布后的完整main→develop与下一市场预升按实际后继工作推进，不提前宣告。

下一步推荐：完成本轮发行候选来源/文档/A6及独立复核，向受保护main提交唯一8.3.4发行PR；当前head CI、真实非作者且非latest-pusher批准、线程及最新base满足后才正常合入，核actualmain再按既有draft-first流程公开与真实tag新十三安装。理由是实际develop已完成市场预升和新验，HTML0.1.39的新增/继承/延期边界可分别恢复；正式公开与Owner接受不可由候选通过替代。
