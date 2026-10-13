import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root='C:/Users/Admin/.codex/worktrees/html-guide-acceptance';
const source=root+'/develop/plugins/html-guide-kit/skills/guide';
const draft=root+'/reviewer/corrections/0-1-10/draft';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const pins={'SKILL.md':'2fad3a6f4fe3ee2f0965437ee45274228ab621806a8669cfcdc689d30034c01f','references/guide-framework.md':'6a64cc9637d4fb6b9337a07652947cbb6812b3d395152e4125487a30bddd2f99','references/interaction-design.md':'16e170129921203c061e999bd4836630fb44a6a6abf28a24a16b2fba81ff4182'};
const oldDynamic='同一互动能切换操作、更新状态并继续或重试时，每个反馈分支写清该次操作的完整当前状态前提，不能只列其余条件。初始值只约束首步，操作后按真实新状态重新匹配源规则；别处的初始面板或独立规则表不为已改变状态提供默认前提。未覆盖的新状态组合必须保持待补，不能继续套首步的确定结果。若采用互相独立的固定情境，则明确每次操作使用的题设、如何复位及局部范围，不暗示共享前一情境的状态。只能将这些约束标为设计选择，不能声称已经实现或测试。';
const dynamic='先按单个操作及确定其结果所需的当前状态组织反馈，再展开其余条件。每个反馈块的标题、表首或紧邻说明必须明确共同前提及其覆盖的全部子分支；若没有这种声明，每个分支自行写足必要状态，不能凭前一行、默认初始面板、旁边的正确表或独立情境默补。条件真假表若给出状态或数值结果，也须有操作及当前状态前提；只有纯条件组合结论时，才可单独讨论组合满足、不满足或未决。\n\n共享互动会更新状态并允许继续或重试时，初始值只约束首步；每次操作取最新状态重新匹配源规则。共同前提范围外先检查其他源规则，已覆盖的结论仍保留，只有未覆盖结果待补；不满足本块前提不自动等于禁止、保持原值或全部未知。逐对代入状态不同但其他条件相同的情形，核对宽分支是否误套或与范围外分支重叠。\n\n若无法把动态反馈的覆盖范围写清，可采用互相独立的固定情境：在该情境处明示必要题设、适用分支、每次尝试如何复位及局部范围，不暗示继承上一情境状态。情境只能补齐标明的教学假设，不能补造源规则；既有源规则不足时仍给有边界参考或待定。设计选择不声称已经实现或测试，不要求固定表格、控件或无关字段。';
const missing='声明“材料未提供”前逐字段核对：已有内容、有限线索、未给出的细节与尚未确认分别说明。已有角色或任务线索不能因不足以组成完整目标而被否定；未确认也不等于来源没有提供。保留已有线索后仍给实际不同的目标并等待明确确认。范围拒绝用已确定的边界即可；若附加材料缺口理由，每项同样须有原文依据，不把缺任务或判准扩成读者、任务和判准全部缺失。';
const evidence=[];
for(const [name,pin] of Object.entries(pins)){
 const before=fs.readFileSync(path.join(source,name));
 if(hash(before)!==pin)throw Error('Exact 880fc8cc runtime required '+name);
 let text=before.toString('utf8');
 if(name==='SKILL.md'){
  const old='区分原材料、已核验背景、教学构造与设计判断；保留版本/快照身份、定位、关键原文、条件、例外、冲突、缺口、未知及范围。可读不等于主张已核验；必要背景核验适用第一手来源。无法读取/核验就说明限制，不推测或声称已参照。缺口只阻相关部分。入口/参考仅是方法，用户未指定为教材材料时不代用；缺用户材料/定位或明确主题快照先索取，不自定主题/目标。明确指定方法文档为教材材料时可用。';
  const next='区分原材料、已核验背景、教学构造与设计判断；保留版本/快照身份、定位、原文、条件、例外、冲突、缺口、未知及范围。可读不等于核验；必要背景用第一手来源。读/核验受限须说明，不推测或声称参照。缺口只阻相关部分。方法资源仅用户明确指定时作教材材料；缺用户材料/定位或明确主题快照先索取，不自定主题/目标。已有字段线索保留，缺完整目标/未确认不等于未提供读者或任务；拒绝理由也逐项有据。';
  if(!text.includes(old))throw Error('Evidence anchor');text=text.replace(old,next);
  const oldFeedback='固定当前状态与单个操作，按源前提/排除判断。宽规则覆盖即给已知字段结果；未单列特例、重复、字段已是结果值或动作意义未知不新增有效性/限次前提，保持原值仍是确定结果。每次按当前新状态重匹配；未知后续路径/额外提示不撤销已知直接操作。';
  const nextFeedback='确定反馈按单个操作及必要当前状态组织，共同前提须就地声明覆盖全部指定子分支；否则逐分支写足，不靠初值/旁表默补。改变状态后重匹配；范围外按其他源规则判断，缺口仅阻相关结果。可改独立固定情境，明示题设、每次复位及范围，不补源规则。宽规则已覆盖则保留已知字段结果；重复、结果同值、未知额外意义/后续路径不加有效性/限次前提或撤销已知操作。';
  if(!text.includes(oldFeedback))throw Error('Feedback anchor');text=text.replace(oldFeedback,nextFeedback);
 }else{
  if(!text.includes(oldDynamic))throw Error('Dynamic anchor '+name);text=text.replace(oldDynamic,dynamic);
  if(name==='references/guide-framework.md'){
   const anchor='## 目标选项';if(!text.includes(anchor))throw Error('Missing fields anchor');text=text.replace(anchor,missing+'\n\n'+anchor);
  }
 }
 const after=Buffer.from(text,'utf8');
 if(name==='SKILL.md'&&after.length>6144)throw Error('Same strict entry budget '+after.length);
 const destination=path.join(draft,name);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,after,{flag:'wx'});
 evidence.push({name,sourceVersion:'0.1.9',sourceSha256:pin,bytes:after.length,sha256:hash(after)});
}
fs.writeFileSync(path.join(path.dirname(draft),'draft-preparation.json'),JSON.stringify({createdAt:new Date().toISOString(),canonicalSource:'880fc8ccd8d28a75e84e8bfd0ec90c58f657356a',targetVersion:'0.1.10',sourceRuntimeUnmodified:true,modelStatus:'NOT_RUN',frozenInputsUnchanged:true,resources:evidence},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({draftOnly:true,resources:evidence}));
