import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root='C:/Users/Admin/.codex/worktrees/html-guide-acceptance';
const source=root+'/develop/plugins/html-guide-kit/skills/guide';
const base=root+'/reviewer/corrections/0-1-11';
const draft=base+'/draft';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const pins={'SKILL.md':'f5451cc24ec3468553bf75c43c379ac1de75f5444347bcc27816ba4b5898fff9','references/guide-framework.md':'8dc9ea11dbd4abd0775110b1069cc997ef2c6b1b73f9cc1bc057d36c75e7cbfb','references/interaction-design.md':'f748144c39468991e21db6119305aab7f2de946f1608c2d72ee40d90451b8178'};
const ruleMethod='先整理原材料支持的完整操作规则，再组织呈现：逐项保留操作、必要当前状态与输入、结果字段、条件、例外和来源。每个操作结果断言都须在本处保留完整前提，或明确引用一个就地声明覆盖该处的完整共同规则；这一要求同时适用于概览、标题、常显结论、边界提示、重复操作、演示、反馈、恢复和自检。不能把条件在模拟表写全后，又在概览或重试说明中写成无条件结果；只有纯条件真假判断不附操作结果时，才可单谈组合满足与否。读者不能靠记住旁表、初始面板或上一情境补齐当前前提。压缩篇幅时删冗余，保留限定或明确缩小该结论范围。';
const attribution='恢复与重置逐字段分清原材料规则和教材界面设计。原文规定恢复的字段及其初值仍按原文保留；教材另设的展示状态、提示、反馈、默认值、清除或失效时机须在该条目处标明“本指南的设计判断”及局部范围。混合清单分别标注依据，不能以段末一个源章节把新增界面清理统称材料规定；别处的总标签或设计章节名也不为本处混合归因补证。教材设计只能管理演示与展示，不增加或撤销源操作结果。';
const section=`## 4. 核对与交付

依两参考逐处回查，目标已明确确认，冲突及不保证项可见：

- 先整理有来源的完整操作规则，再组织呈现。概览、标题、常显结论、重复提示及正文/演示/反馈/恢复/自检中的每个操作结果，均在本处写足必要当前状态/输入/条件，或明确引用就地声明覆盖本处的完整共同规则；旁表、初值和前一情境不默补前提。
- 来源/构造逐项对应。新增展示字段、初值、提示、反馈及清除/失效时机就地标本指南设计；恢复/重置清单分开源字段与新增界面行为，各列依据，不用统一源引用背书。未说明不写成没有，别处标签不补本处归因。
- 术语/值类型一致，原变量与派生真假分开，事项范围不改成人物前提。排他量词须源支持或完整枚举可证，就地限对象/操作范围，枚举含恢复/例外。初值/赋值/可达性质不定义输入域；类型/范围未知不禁止已有规则覆盖的输入。额外限制就地标构造及范围。
- 反馈按操作及完整当前前提分组，共同前提明示覆盖全部子分支；状态改变后重匹配，范围外检查其他源规则，缺口只阻相关结果。独立情境明示题设、每次复位及范围，不补源规则。重复、结果同值、未知额外意义/后续路径不加有效性/限次前提或撤销已知结果。
- 条件分满足/不满足/未知：“且”任一明确否即否，“或”任一明确是即是；未知只阻未决组合，不扩成未规定的操作/数值结果。操作分支互斥或明确优先，累计反馈合并适用项；逐对查宽泛行，不覆盖已决定组合或漏缺项。
- 全文与源及彼此一致，别处正确不抵消错误。反馈有当次前提/理由/恢复，自检前提完整可定位；篇幅适合材料，全答复守文本/只读边界。

`;
const evidence=[];
for(const [name,pin] of Object.entries(pins)){
 const before=fs.readFileSync(path.join(source,name));
 if(hash(before)!==pin)throw Error('Exact 0.1.10 runtime required '+name);
 let text=before.toString('utf8');
 if(name==='SKILL.md'){
  const start=text.indexOf('## 4. 核对与交付'),end=text.indexOf('交付可复制指南，',start);
  if(start<0||end<0)throw Error('Section anchors');
  text=text.slice(0,start)+section+text.slice(end);
 }else if(name==='references/guide-framework.md'){
  const anchor='## 从问题到内容';
  if(!text.includes(anchor))throw Error('Framework anchor');
  text=text.replace(anchor,ruleMethod+'\n\n'+attribution+'\n\n'+anchor);
 }else{
  const anchor='## 分步演示';
  if(!text.includes(anchor))throw Error('Interaction anchor');
  text=text.replace(anchor,ruleMethod+'\n\n'+attribution+'\n\n'+anchor);
 }
 const after=Buffer.from(text,'utf8');
 if(name==='SKILL.md'&&after.length>6144)throw Error('Same strict entry budget '+after.length);
 const target=path.join(draft,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,after,{flag:'wx'});
 evidence.push({name,sourceVersion:'0.1.10',sourceSha256:pin,sourceBytes:before.length,bytes:after.length,sha256:hash(after)});
}
fs.writeFileSync(base+'/draft-preparation.json',JSON.stringify({createdAt:new Date().toISOString(),canonicalSource:'7c1f230bee180dd4cf2edc72edc81b5d7b2380e3',currentSource:'6a9191665dd7e7abc0bfbe72c1a303e77f0a0da7',targetVersion:'0.1.11',sourceRuntimeUnmodified:true,modelStatus:'NOT_RUN',frozenInputsAndCriteriaUnchanged:true,resources:evidence},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({draftOnly:true,resources:evidence}));
