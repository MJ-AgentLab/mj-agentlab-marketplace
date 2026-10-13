import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const repo='C:/Users/Admin/.codex/worktrees/html-guide-acceptance/develop',out=path.resolve(repo,'../reviewer/corrections/0-1-13/draft');if(fs.existsSync(out))throw Error('No overwrite');
const root=repo+'/plugins/html-guide-kit/skills/guide',files=['SKILL.md','references/guide-framework.md','references/interaction-design.md'];
const before=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')])),after={...before};
const start=after['SKILL.md'].indexOf('- 固定当前态'),end=after['SKILL.md'].indexOf('\n交付可复制指南',start);if(start<0||end<0)throw Error('method anchor');
after['SKILL.md']=after['SKILL.md'].slice(0,start)+`- 固定当前态及单个直接操作，匹配源允许/禁止/未覆盖；宽规则/排除/例外仍适用。改状态后路径另判，不以“甲或乙/再次”抹掉已知直接结果。
- 先整理完整源规则：当前前提/输入、操作、全部字段结果及动作/对象、条件/例外/定位，含源清除/恢复。未定义对象保留原称呼/未知。全篇概览/例子/图示/重试/恢复/自检只改写完整规则；就地写足或明示完整共同规则覆盖本处。初值/旁表/前情境不默补；写不全只指完整规则。
- 完整恢复含源全部动作/对象/字段，不只初值；或明示覆盖本处的完整共同恢复规则。源/构造逐项对应，新增展示/初值/提示/反馈及清除/失效就地标设计范围；源恢复与新增UI各标依据，不共用源引用。未说明不当没有，别处标签不补混合归因。
- 术语/类型/原变量/派生真假分清，事项不改人物前提。排他须源支持或完整局部枚举可证（含源恢复/例外），每处限范围，引用不代限定。初值/赋值/可达域非完整输入域，域未知不禁已覆盖输入；额外限定标构造/设计范围。
- 先定每轮进入/当前态来源/继续/重试/退出/复位，再写反馈。共享态每步取最新态重判；独立题设每次明示复位/范围/依据，改条件不默许复位。共同前提明示覆盖各分支；范围外查其他规则，缺口只阻相关结果，不造变化/保持/恢复。重复/同值/额外意义或路径未知不添有效性/限次前提、不撤销已知结果。
- 纯条件真假不附源操作/字段结果；“且”任一明确否即否，“或”任一明确是即是，未知只阻未决组合。分支互斥或明示优先，累计反馈合并适用项；宽行不盖已决定组合或漏项。
- 全篇回查源动作/对象、字段、前提/例外和彼此一致，别处正确不抵消错误。反馈有当前前提/理由/恢复，自检前提可定位、可靠答案不漏源结果；篇幅适配，全答复文本/只读。
`+after['SKILL.md'].slice(end);
const selfcheck='自检仅是指南设计，不在聊天启动测验。可靠判准有定位、理由、误区、边界并允许重试。每题明确所需当前状态/输入；共用默认须明确适用于该组题，不能从题名/上个案例默补。前提仍缺时只给有限参考；可补标局部题设假设，源规则足够才在假设范围内确定反馈，不补造源规则。无可靠判准不伪造标准答案/评分，不由点击、完成、答对或提示后改答推断能力/长期掌握。';
const compact='自检仅指南设计，不在聊天测验。可靠判准含定位/理由/误区/边界，允许重试。每题给必要当前态/输入；共用默认明示覆盖本组，不凭题名/上一例默补。可补标局部题设假设，源足够才限假设反馈，不造规则。前提缺或判准不可靠只给有限参考；无可靠判准不造标准答案/评分，不由点击/完成/答对/提示后改答推断能力或长期掌握。';
if(!after['SKILL.md'].includes(selfcheck))throw Error('selfcheck anchor');after['SKILL.md']=after['SKILL.md'].replace(selfcheck,compact);
after['SKILL.md']=after['SKILL.md'].replace('Create a text-only interactive HTML teaching guide from supplied material after explicit reader/task/question confirmation. Explicit requests only; no HTML production, guide revision, design comparison or HTML review.','Create a text-only interactive HTML teaching guide after explicit reader/task/question confirmation. Explicit requests; new guides only, no HTML production, revision, comparison or review.');
after['SKILL.md']=after['SKILL.md'].replace('每次新建给 2–3 套不同的 **读者＋使用任务＋理解问题**，说明取舍、推荐及理由。已有目标可列为一套，仍须等待，不推断能力。此时只展示材料范围、目标及待确认状态，不交付指南、章节/交互草稿或试做成品。','每次新建给2–3套不同的**读者＋使用任务＋理解问题**，含取舍/推荐/理由。已有目标可作一套，仍等确认，不推断能力。此时仅材料范围/目标/待确认，不给指南、章节/交互草稿或成品。');
after['SKILL.md']=after['SKILL.md'].replace('明确选择或修改目标并明确确认采用后才推进。推荐、预选、沉默、超时、无关回复、含糊赞同、窗口消失均非确认；“直接做”、一般授权或工具默认值不能跳过。歧义只澄清歧义。未答保留同一方案/待确认，可重述，不自行换套或生成；仅用户修改或材料实质改变目标才更新并再次等待。不能承诺锁住/保持/恢复宿主窗口；用户停止立即停止。','明确选择/修改目标并明确确认采用才推进。推荐/预选/沉默/超时/无关回复/含糊赞同/窗口消失非确认；“直接做”/一般授权/工具默认不跳过。歧义仅澄清；未答保留同一方案/待确认，可重述，不自换套/生成。仅用户修改或材料实质改变目标才更新并再等。不能承诺锁住/保持/恢复宿主窗口；用户停止立即停止。');
after['SKILL.md']=after['SKILL.md'].replace('区分原材料、已核验背景、教学构造与设计判断；保留版本/快照身份、定位、原文、条件、例外、冲突、缺口、未知及范围。可读不等于核验；必要背景用第一手来源。读/核验受限须说明，不推测或声称参照。缺口只阻相关部分。方法资源仅用户明确指定时作教材材料；缺用户材料/定位或明确主题快照先索取，不自定主题/目标。逐字段保留已有线索，缺完整目标/确认不等于字段未提供；拒绝理由也有据。','分原材料/已核验背景/教学构造/设计判断；保留版本/快照身份、定位/原文/条件/例外/冲突/缺口/未知/范围。可读不等核验，必要背景用第一手来源；读/核验受限如实说明，不猜或假参照。缺口只阻相关部分。方法资源仅用户明定才作教材；缺用户材料/定位或明确主题快照先索取，不自定主题/目标。已有线索逐字段保留，缺完整目标/确认不等于各字段缺；拒绝理由有据。');
after['SKILL.md']=after['SKILL.md'].replace('允许读文档、附件、可访问来源、明确快照及必要只读背景检索、shell 文件读取；来源动作不是执行授权。参考相对本次安装的 SKILL.md 定位，不依赖工作目录、个人路径、旧聊天或其他缓存。','可读文档/附件/可访问来源/明确快照，必要只读背景检索及shell文件读取；源动作不授权执行。参考相对本次安装SKILL.md定位，无工作目录/个人路径/旧聊天/其他缓存依赖。');
const old='材料有操作规则时，编排前先整理每条完整规则：必要当前状态与输入、单个操作、字段结果、条件、例外和来源。';
const next='材料有操作规则时，编排前先整理完整源规则单元：必要当前状态与输入、单个直接操作、全部明确字段结果、全部明确动作及其对象、条件、例外、局部范围和来源定位。清除、恢复、撤销等源动作与字段结果并列保留，不能只整理最终值而漏掉其他结果；保留关键原文及限定。源对象未定义时保留原称呼和缺口，不扩写成业务日志、审计记录、永久删除或外部系统行为。';
const recovery='恢复与重置逐字段分清原材料规则和教材界面设计。原文规定恢复的字段及其初值仍按原文保留；';
const fullRecovery='恢复与重置逐项分清原材料规则和教材界面设计。完整恢复保留源规定的全部动作、对象、字段结果、范围及现实保证边界，不以初值表代替其他源动作。每处重述可明确引用完整共同恢复规则，并声明覆盖本处情境、段落或题目；仅列初值或清教学反馈不等于保留全部源恢复。图示或小区域只展示部分字段时，明示局部视图并引导完整规则，不声称枚举完整恢复。原文规定恢复的字段及其初值仍按原文保留；';
const lifecycle=`
先设计尝试生命周期，再写分支反馈：说明进入、当前状态与输入的来源、继续操作、修改条件、重试、退出和复位的具体关系，区分共享连续模拟与独立固定情境。共享模拟每一步从上一步结果取得最新必要状态/输入，固定单个操作重匹配源规则，更新有依据的字段或动作并使旧反馈失效；修改条件不默认为重置当前状态。独立情境每次进入或重试明确恢复所需题设并标明依据和范围，不靠第一次的初始值假定后续复位。源规则缺口不编造变化、保持或清除；有依据的局部结果保留，依赖未决状态的后续路径待定。可返回明确题设或执行有依据的恢复后继续，不把未知操作静默当作已完成或未发生。

纯条件真假比较不附源操作或字段结果时可独立判断组合，无需强加材料不存在的业务状态；一旦给出操作后结果就按完整当前状态和操作规则判断。完整关系及排他判断覆盖影响同一字段的全部相关源规则，包括源恢复、重置和例外；没有源明示或完整局部枚举支持，只陈述有据的正向关系，不合成全局“只有/唯一/始终”。段落引用是依据，不能自动替排他断言限定范围。
`;
for(const f of files.slice(1)){if(!after[f].includes(old)||!after[f].includes(recovery))throw Error('reference anchor '+f);after[f]=after[f].replace(old,next).replace(recovery,fullRecovery);const anchor='共享互动会更新状态并允许继续或重试时，初始值只约束首步；';const index=after[f].indexOf(anchor);if(index<0)throw Error('lifecycle anchor');const finish=after[f].indexOf('\n\n',index);after[f]=after[f].slice(0,finish)+lifecycle+after[f].slice(finish);}
const bytes=Buffer.byteLength(after['SKILL.md']);if(bytes>6144)throw Error('Entry hard budget '+bytes);
fs.mkdirSync(out);const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),rows=files.map(f=>{const target=path.join(out,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,after[f],{flag:'wx'});return{relative:f,oldBytes:Buffer.byteLength(before[f]),oldSha256:hash(before[f]),newBytes:Buffer.byteLength(after[f]),newSha256:hash(after[f])};});
fs.writeFileSync(out+'/draft-control.json',JSON.stringify({recordedAt:new Date().toISOString(),baseCanonical:'5bce83410802b04c2d0c7fb0324610f87917a386',sourceVersion:'0.1.12',proposedVersion:'0.1.13',oldSourceUnmodified:files.every(f=>fs.readFileSync(path.join(root,f),'utf8')===before[f]),entryBudget:6144,rows,behavior:'NOT_RUN',applied:false},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({out,rows}));
