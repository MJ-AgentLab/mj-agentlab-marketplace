import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const cwd='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop',gh=args=>execFileSync('gh',args,{cwd,encoding:'utf8',maxBuffer:8*1024*1024});
const issue=JSON.parse(gh(['issue','view','274','--json','body,state']));assert.equal(issue.state,'OPEN');assert(issue.body.includes('<!-- HTML274_POSTMERGE_CURRENT -->'));
const current=`<!-- HTML274_POSTMERGE_CURRENT -->
## 当前同步与续办（2026-10-19）

- 实现主PR275、内部276/277、发布278及记录279均已结束。[PR279](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/279)于15:17:09Z实际合入main e3dc40f734fc972e05956da3e908091e09963675/treeae121f6b，parents f906+315；与原已测315和CI merge687同树。默认公开安装v8.3.2/site导航已交付；完整main包含develop65d ancestry。
- 当前main记录身份e3dc与公开身份分开：[v8.3.2](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.3.2)仍绑定tag/Release target f906，14:30:16Z公开，assets=[]/immutable=false、仓库配置UNKNOWN，正式正文未变。实际279 suite4602541728匹配beforef906/aftere3dc为Owner bypass，pull_request FAIL缺last-pusher外批准、其他4规则PASS，reviews=[]/批准NOT_MET；275/278/279历史缺口不追认，不提供未来例外。
- 原279候选CI39272665913终态：Linux641/642仅Windows专用skip1、Windows642/642零skip，各13/178、6Diagram18LEK4生成4静态各89/89；4browser工程case未skip，16清理名TAP不替逐根absence，push只列成功不另计验收。原CI/方法/原失败全部冻结，不改名为actuale3dc新跑。
- 实际e3dc新复验15:18:57.732–15:29:31.902Z已PASS：13/178全exit0、6/18/4/4实际调用及4次89/89；site20/guide4资源一致，15精确根absence，hostHEAD与完整worktree清单复原。manifest ffa6def13cc8363878c07f96f2d0fb4f53e4e71c1fa372d3be45bbebc78ff77d，不借315/f906计数，未运行新model/desktop/browser或改动私有Site。
- 当前正常同步PR [#280](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/280) → develop65d，head ef85a2de6e39b1981d94d9d4cbc004fbdc71acee/treedb49629f，candidate merge535315f0同树，完整继承main e3dc。本机准备态642/642、strict/CLI0.147.0/9范围检查PASS；529来源Git原blob一致，旧372保持，独立529终态复核无阻断。新PR服务端CI39279114820及push39279043416目前PENDING，不借旧结果；线程完整未解0、reviews=[]/REVIEW_REQUIRED，Agent不bypass。
- develop真实保护为1个当前head非作者/最新推送批准、dismiss stale、严格Validate Structure+A6、已解决线程、merge only（code-owner=false）。本轮VERSION仍8.3.2，插件/运行/公开tag不变。仅actual280同步合入并新复验后，才DryRun→Apply仅市场8.3.3 VERSION/badge/正常根A6，不建同号发行；当前未执行预升。
- 继续原#274/P5五边界授权与唯一PLAN/REPORT，不新增三PR强制决定、不转交常规构建审查。同一私有[代表Site](https://html-learning-artifact-274.zuozhouran.chatgpt.site)版本1/身份/受众保持；Owner体检/最终接受NOT_PROVIDED，原生窗口/第二客户端等延期非PASS，理解效果NOT_MEASURED。核心交付、公开、维护闭环、全计划与最终接受分记，Issue保持OPEN。
<!-- END_HTML274_POSTMERGE_CURRENT -->`;
const body=issue.body.replace(/<!-- HTML274_POSTMERGE_CURRENT -->[\s\S]*?<!-- END_HTML274_POSTMERGE_CURRENT -->/,current),p='C:/Users/Admin/AppData/Local/Temp/html-learning-274-sync280-issue-current.md';fs.writeFileSync(p,body);console.log(gh(['issue','edit','274','--body-file',p]).trim());
