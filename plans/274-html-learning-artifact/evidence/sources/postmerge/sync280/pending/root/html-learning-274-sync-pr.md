## 变更摘要

将已公开 v8.3.2 的完整 actual main 同步回 develop，包含 #278 正式发布和 #279 发布记录的全部 ancestry。同步分支从实际 main e3dc40f734fc972e05956da3e908091e09963675 派生，目标 develop65d756ef；该 develop 已是源 main 祖先，不作挑选式移植或历史重写。

保留市场8.3.2、默认公开安装v8.3.2、五包版本及全部运行资源。增补同一#274任务的实际#279合入/规则审计、该候选原CI、actual e3dc新复验与本轮文档检查原件；529来源绑定一致、原372身份与字节保持。相对e3dc只改10份文档/清单及冻结证据；相对develop还继承已发布的HTML README/CHANGELOG中性说明和原证据空白属性，未改工具、测试、工作流或插件运行。

## 原意、当前角色与后续依赖

Refs #274。复用 [INDEX/唯一PLAN和REPORT](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/codex/sync-main-8-3-2/plans/274-html-learning-artifact/INDEX.md)、INT-2026-003和原P5授权。实现主PR275、内部276/277、发布278与main记录279均已结束；本PR是该任务当前维护同步主PR，目标受保护develop，不新建Issue/PLAN/REPORT。

#279于2026-10-19T15:17:09Z实际合入main e3dc/treeae121f6b，parents精确f906+315；与已测315及CI merge-ref687同树。**当前main记录身份e3dc与公开tag/Release f906分开**，v8.3.2正式正文与历史未变。实际suite4602541728为Owner bypass：pull_request FAIL缺最新推送者外批准、required checks及其他规则PASS、reviews=[]；批准仍NOT_MET，不追认为以后例外。

当前develop真实保护为1个非作者/最新推送批准、dismiss stale、严格Validate Structure+A6、已解决线程及merge-only；code-owner=false。Agent按真实当前head/base核验，不self-approve或bypass。此同步实际合入并完成针对actualsync的新复验后，才先DryRun后Apply仅市场8.3.3 VERSION/badge/根AGENTS预升，不改插件、不创建同号tag/Release；当前尚未执行预升。

## 可复现验证

- 记录PR279原CI39272665913：Windows642/642零skip，Linux641/642仅Windows专用skip1；每端13安装/178命令全0、6Diagram18LEK实际Python、4site生成4静态各89/89，四browser工程case未skip。push39272636618只列成功状态，不另计验收。16清理名称TAP只证明用例范围，该CI未输出逐根absence。
- 实际e3dc新批次15:18:57.732–15:29:31.902Z：13安装/178命令全exit0；6Diagram18LEK/4生成4静态各89/89；site20/guide4资源一致；15精确自有根absence，hostHEAD与完整worktree清单复原。原件manifest ffa6def13cc8363878c07f96f2d0fb4f53e4e71c1fa372d3be45bbebc78ff77d；不借315/687或f906旧计数，未运行新model/desktop/browser或改变私有Site。
- 本机准备态全测642/642、零fail/cancel/skip；strict、CLI0.147.0精确基线、9项来源/ancestry/范围检查均PASS。随后仅补actuale3dc终态措辞及冻结原件，529来源后再次strict及空白检查PASS；最终head的新平台CI、真实批准和线程按本PR实时结果记录。
- 独立只读文档/原始来源审查有原件；历史失败、24文本LF/CRLF解释边界和各批源身份保持，AI审查不替代GitHubapproval或Owner接受。

## 自检结果

- [x] 配置/文档命名、九字段、canonical/working归属和内部链接按当前规则校验，唯一INTENT/PLAN/REPORT与完整接受基线复用。
- [x] 完整main ancestry、原372来源字节、各批验证与失败保持；未把同步候选当actualsync交付或Owner决定。
- [x] CI/工具/测试本体未改变，根AGENTS正常A6、docsINDEX/任务入口和Unreleased已同步，正式已发历史保持。
- [x] 未增加凭据、产品缓存或临时PR正文；Git只包含本次文档/来源和完整主线继承。
- [x] docs提交遵循约定，正常推送；最终当前head的服务端检查和保护批准据实际结果判定。
- [x] 原生窗口/第二客户端等延期仍非PASS，理解效果NOT_MEASURED、Owner体检/最终接受未提供，#274保持开放。

## AI判断与恢复

同步使develop完整继承已公开版本和真实发布记录，运行资源/版本保持。文档或同步问题通过正常修复PR处理；既有tag/Release/资产不覆盖或重打，私有代表Site身份/受众保持。actualsync交付、新验和后继预升分别依真实结果推进。
