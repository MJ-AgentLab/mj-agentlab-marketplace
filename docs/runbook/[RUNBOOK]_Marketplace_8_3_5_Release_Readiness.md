---
type: runbook
scope: marketplace
summary: "Prepare maintenance8.3.5 from verified develop while preserving protected publication and historical limits"
owner: marketplace-maintainers
created: 2026-10-21
updated: 2026-10-21
state: active
version: v1.0
layer: working
purpose: "Maintain Issue274 maintenance8.3.5 scope, exact source evidence, protected release gates and recovery"
---

# [RUNBOOK] Marketplace8.3.5 release readiness

## Candidate and authorization

2026-10-21（Asia/Taipei）：Owner明确[“执行发布”](../../plans/274-html-learning-artifact/evidence/sources/release835/continuation/owner-request.txt)，[捕获](../../plans/274-html-learning-artifact/evidence/sources/release835/continuation/capture.json)用实际捕获时钟，未知原消息ID/时间/URL为null。沿用Issue274/INT-2026-003 v1.2、32项＋A01–A08及同五授权边界，由[唯一PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#marketplace835-maintenance-publication-preparation)执行；发布授权不代替新head保护批准或Owner成品接受。

#294于2026-10-21T00:10:03Z实际合develop **6b4612b4968f5172944f61b180c032df913037f1/tree418e1493f4092d547860dc7fa0199a1e5b4f48cf**，市场8.3.5预升已交付，完整main **931e1214377357e9f94b6c5ca10029330c6ec0d6** 为祖先、main…develop=0/4。公开仍[8.3.4](./[RUNBOOK]_Marketplace_8_3_4_Release_Readiness.md)/HTML0.1.39，tag/Release target5898a8192740b39f41263129a5f99efeba96a6cc；835 tag/Release在post294实际终态为404，本轮仍须新鲜回读。

本轮835为纯维护发行：HTML0.1.39、Diagram0.3.1、LEK0.1.0、Explain0.1.1、Communication0.1.0，五包/八公开技能/五显式/三自然/20repo skills保持；plugins/scripts/.agents/workflow/package相对834无运行差异，不宣称新功能。VERSION及badge已由294交付，不再次bump；README六默认安装锚点继续固定真实v8.3.4，只有835真实tag新验通过后才更新。

## Evidence and pending release gates

历史actual6b与新候选分开。post294 canonical实际00:25:07.103Z–00:39:21.528Z为13/178全exit0、6Diagram＋18LEK实际Python、4site生成/4静态各96/96、15精确根双absence；独立STOP后本机00:40:51.041Z–00:45:24.022Z为652总/651PASS/0FAIL/1平台专用skip（Windows环境跳过Linux专项）、strict/CLI0.147.0/真实Python3.12.14及限定browser。两批完整9771地图/index/primary/Owner/worktree守卫、独立运行回读13/13通过；本机cache原absence=false及后续一次受控清理单列，不冒称自动清理或canonical根数。

必要原件与恢复路径见[REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#marketplace835-maintenance-publication-preparation)及[selection](../../plans/274-html-learning-artifact/evidence/sources/release835/selection.json)。作者已只读核post294 manifest固定SHA256 dda1e2de2cf4721e261521fc37fee0931749d5f75ae7765a926b83e3bea811af和629成员/71,581,464B；本任务仅选小必要原件，不归档大map/full raw log，不把历史PASS改名新执行。

| 阶段 | 本作者快照的事实与解锁条件 |
|---|---|
| 已交付预升/actualdevelop | actual6b/8.3.5与完整main祖先已有历史新验；不是835公开 |
| 新发行候选 | 最小文档/来源/A6准备；自身head工程检查及独立审查待实际，不能借历史计数 |
| protected main | 待当前head真实非作者且非最新推送者批准、CODEOWNER、全部required checks/Validate Structure、线程及latestbase；实际main SHA/tree待证，只允许正常merge |
| draft-first/公开 | 待actualmain核对、当前main tip/VERSION/CHANGELOG、draft/tag/正文/资产身份和紧邻publish回读；不得提前标公开 |
| 真实tag新验 | 待正式公开后的确切tag解析SHA、独立新十三安装/真实Python/精确自有根清理及独审；candidate/main/workflow计数分别保留 |
| 接受/延期/效果 | 原Owner ACCEPTED_LIMITED仅0.1.37；D01原生持续窗口及其他客户端/扩展DEFERRED，effects NOT_MEASURED，full plan OPEN |

actual294 suite4631204035为bypass、reviews=[]/保护批准NOT_MET，Agent未执行该合并；新发布授权不追认。通用ci.yml对actualdevelop未触发；专用prebump run39519647626自然成功但warn-only、无直接最新tag核验，不当通用CI或完整验收。原driver selector方法失败、fresh-state路径碰撞API前exit1、cache原absence=false和旧Linux启动FAIL/根因UNKNOWN分别保留。未新跑模型/Matt/原生/桌面/第二客户端/Sites、未扩大受众或Owner接受。

## Observation, stop and recovery

工程Agent/marketplace-maintainers在本轮有界发行及发布后验收窗口观察：候选CI/保护门禁、actualmain/tree、draft/tag/Release目标/正文/version/published/资产/immutable和真实tag新安装/Python/清理。未请求周期任务，不创建自动监控。任何目标/正文/版本错配、required gate缺失、凭据/非预期材料或真实运行失败均停止依赖公开/推广步骤，保留原失败并在权限内诊断；越出目标/对象/环境/权限/风险边界才请求Owner实质决定。

已知良好公开版本为 **v8.3.4 / 5898a8192740b39f41263129a5f99efeba96a6cc**，HTML0.1.39；Release418543870、正文1677B/SHA25693f4459e8718b06eae19dc6aa82397eacce723470f8fd6e33214fb489d542d38，assets=[]/immutable=false；仓库immutable配置UNKNOWN。旧833 tag/Release正文及资产保持。发行前可撤销未发布候选或用普通后继PR修正；发行后停止有问题版本推广，固定已知良好834供安装，按现有保护控制前向修复，不移动/重打公开tag、不覆盖旧Release/资产。实际故障恢复/生产回滚须其专门有界控制，本轮未冒称已演练。

完整main→develop同步及下一市场预升依赖真实后继合入和新验，不提前记完成、不机械制造纯证据PR。后继PR/CI/actualmain/tag/公开/新验身份接Issue274及外部不可变回执；本账本为发行候选准备快照。

下一步推荐：完成新候选独审及工程门禁后，提交Issue274唯一835发行PR→protected main；当前head真实批准和全部门禁满足才正常合入，再核actualmain、按draft-first公开和真实tag新十三安装。理由是835预升与actual6b已具证，新候选和正式发行仍需要各自证据；无需新增Owner产品决定。
