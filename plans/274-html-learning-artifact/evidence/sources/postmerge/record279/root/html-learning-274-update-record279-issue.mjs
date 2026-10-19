import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const cwd='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop';
const gh=args=>execFileSync('gh',args,{cwd,encoding:'utf8',maxBuffer:4*1024*1024});
const issue=JSON.parse(gh(['issue','view','274','--json','body,state']));
const current=`<!-- HTML274_POSTMERGE_CURRENT -->
## 当前公开与续办（2026-10-19）

- 发布PR [#278](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/278)已于14:28:06Z实际合入main f906b1001a86d7b5415451bd973bea26e6cc3a1d/tree6e4bc9cc，source f68c与原CI merge4269同tree。主实现275及276/277子PR历史保持。
- [Marketplace v8.3.2](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.3.2) / Release417390526于14:30:16Z实际公开，main/direct tag/Release target同f906；自动workflow39269211915 attempt1 SUCCESS，正文与actualmain8.3.2节在明确CRLF→LF+trim范围内一致，assets=[]/immutable=false，仓库immutable配置未返回UNKNOWN。独立19项身份/正文/发布/规则观察全有证，不补造自动工作流内部逐十三/Python raw。
- 实际main suite4601606831为Owner bypass，pull_request fail缺最新推送者外批准、required checks pass，reviews=[]/批准NOT_MET。275/278历史缺口不因公开改写，也不为任何新记录/sync/prebump PR提供例外。
- 发布候选CI两系统终态PASS及原FAIL已冻结到唯一task：Windows642/642零skip、Linux641/642仅Windows专用skip；每端13安装/178命令、6Diagram18LEK4site生成4静态各89/89。额外物理字节QA首FAIL/24旧文本只LFCRLF及HTML guide/site同hash保留原件。
- 真实公开tag的新独立13安装于14:31:11.601–14:41:25.926Z完成：13/13、178命令全0、6Diagram18LEK Python、4site生成/4静态各89/89、site20/guide4资源一致，15精确自有根absence且canonical无注册残留。开始晚于公开55.601秒，不借65d/CI计数；本轮未运行model/desktop/browser，全部原件已回唯一REPORT。
- 接续原P5授权，正常main记录PR [#279](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/279)已创建，head315b5942a3a61c6bf7ab17513b8263496bd7a48a/treeae121f6b，base f906，merge-ref687b70ab同tree。修正默认main仍指v8.3.1且称site未发的导航；372冻结来源Git blob逐hash一致，原236条保持，插件/VERSION/工具/测试/工作流和已发正式节不变。本机642/642、strict/baseline/范围检查PASS，独立最终语义与来源372复核无阻断，服务端新head平台CI仍在跑。当前reviews=[]/REVIEW_REQUIRED、线程完整0未解，Agent不bypass。这是本轮产品导航收尾目的，非机械继承历史8.3.1三PR强制。其实际合入后正常同步完整main ancestry至develop，实际sync复验后才仅市场8.3.3先DryRun再Apply，不创建同号发行、插件版本不变。新PR均保真实批准/CI/线程，不重问已授权范围。
- 同一私有[代表Site](https://html-learning-artifact-274.zuozhouran.chatgpt.site)版本1，Owner体检/最终接受仍未提供；原生持续窗口/原生派发、第二客户端/全面可访问性延期，理解效果NOT_MEASURED。技术交付、公开、全计划和Owner接受分别记录，Issue保持OPEN。
<!-- END_HTML274_POSTMERGE_CURRENT -->`;
if(!issue.body.includes('<!-- HTML274_POSTMERGE_CURRENT -->'))throw new Error('Expected current progress marker');
const body=issue.body.replace(/<!-- HTML274_POSTMERGE_CURRENT -->[\s\S]*?<!-- END_HTML274_POSTMERGE_CURRENT -->/,current);
const p='C:/Users/Admin/AppData/Local/Temp/html-learning-274-issue-postpublication.md';fs.writeFileSync(p,body);
console.log(gh(['issue','edit','274','--body-file',p]).trim());
