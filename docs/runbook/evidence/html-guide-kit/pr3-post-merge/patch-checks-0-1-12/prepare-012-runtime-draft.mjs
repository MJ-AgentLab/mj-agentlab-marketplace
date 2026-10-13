import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root='C:/Users/Admin/.codex/worktrees/html-guide-acceptance';
const source=root+'/develop/plugins/html-guide-kit/skills/guide',base=root+'/reviewer/corrections/0-1-12',draft=base+'/draft';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const pins={'SKILL.md':'c387703999390b0bae5cc62aeafd5b0ef1f8cec17f5638c72a5f727c02e5c728','references/guide-framework.md':'503bb710ef11671b61c6fb980470a592ca77c6f115bb6c11a9e88f78743ee69c','references/interaction-design.md':'90ca7ad788287b85682e6f402e8252081710043141c7a9fdedba6395125affed'};
const old='先整理原材料支持的完整操作规则，再组织呈现：逐项保留操作、必要当前状态与输入、结果字段、条件、例外和来源。每个操作结果断言都须在本处保留完整前提，或明确引用一个就地声明覆盖该处的完整共同规则；这一要求同时适用于概览、标题、常显结论、边界提示、重复操作、演示、反馈、恢复和自检。不能把条件在模拟表写全后，又在概览或重试说明中写成无条件结果；只有纯条件真假判断不附操作结果时，才可单谈组合满足与否。读者不能靠记住旁表、初始面板或上一情境补齐当前前提。压缩篇幅时删冗余，保留限定或明确缩小该结论范围。';
const method='材料有操作规则时，编排前先整理每条完整规则：必要当前状态与输入、单个操作、字段结果、条件、例外和来源。操作判断先固定本次当前状态与单个直接操作，分别匹配所有相关源规则，明确已允许、已禁止和未覆盖；源已有宽规则或排除条款仍适用，不因没有单列特例、重复或结果同值而变未知。先经过其他操作改变状态后的路径另行判断；路径未知不撤销固定当前状态下已知的直接操作结果。不把不同操作用“甲或乙”“再次操作”等合并成统一允许、禁止或未知。\n\n正文中的操作结论只由完整源规则组织，不在概览、情境例子、图示连接及其补充说明、重试提示或核对清单自由缩写。每处重述写足必要前提，或明确引用就地声明覆盖该处的完整共同规则；读者不能靠记住旁表、初始面板或上一情境补齐。无法在短句保留完整条件时，改为引导查阅完整规则，不另写省略条件的结果。只有源规则本就无条件时，才可给无条件操作结果；纯条件真假判断不附操作结果时可单谈组合满足与否。材料没有操作规则时不强造规则目录，仍按其概念、关系和证据组织；自然语言或适当表格均可，不要求固定章节、格式或条目数。';
const section=`## 4. 核对与交付

确认后依两参考核对源规则、编排并回查：

- 固定当前态及单个直接操作，匹配源允许/禁止/未覆盖。宽规则/排除/例外覆盖则保留结果；后续改状态路径另判，不用“甲或乙/再次”抹掉已知直接结果。
- 源规则含当前前提/输入、操作、结果字段、例外及定位。全文（含概览/例子/图示/重试/恢复/自检）从完整规则改写，就地写足前提或明确引用覆盖本处的完整共同规则。初值/旁表/前情境不默补；条件写不全则引导读规则，不复述结果。
- 源/构造逐项对应。新增展示字段/初值/提示/反馈及清除/失效就地标本指南设计；恢复/重置分源字段与新增界面行为，各标依据，不共用源引用。未说明不当没有，别处标签不补归因。
- 术语/类型一致，原变量与派生真假分开，事项范围不改成人物前提。排他性须源支持或完整枚举可证，就地限范围，含恢复/例外。初值/赋值/可达域非完整输入域，域未知不禁已覆盖输入；额外限定标构造/设计及范围。
- 共同前提明示覆盖本组各分支；状态变后重判，范围外查其他规则，缺口只阻相关结果。独立情境明示题设/每次复位/范围，不补源规则。重复/同值/未知额外意义或路径不添有效性/限次前提、不撤销已知结果。
- 条件分满足/不满足/未知：“且”任一明确否即否，“或”任一明确是即是；未知只阻未决组合，不扩成操作/数值结果。分支互斥或明确优先，累计反馈合并适用项；宽泛行不覆盖已决定组合或漏项。
- 全文与源及彼此一致，别处正确不抵消错误。反馈有当前前提/理由/恢复，自检前提可定位；篇幅适配材料，全答复文本/只读。

`;
const evidence=[];
for(const[name,pin]of Object.entries(pins)){
 const before=fs.readFileSync(path.join(source,name));if(hash(before)!==pin)throw Error('Exact e3a4daec 0.1.11 resource '+name);let text=before.toString('utf8');
 if(name==='SKILL.md'){const start=text.indexOf('## 4. 核对与交付'),end=text.indexOf('交付可复制指南，',start);if(start<0||end<0)throw Error('Section anchors');text=text.slice(0,start)+section+text.slice(end);}
 else{if(!text.includes(old))throw Error('Full source rule anchor '+name);text=text.replace(old,method);}
 const bytes=Buffer.from(text,'utf8');if(name==='SKILL.md'&&bytes.length>6144)throw Error('Same strict entry budget '+bytes.length);const file=path.join(draft,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes,{flag:'wx'});evidence.push({name,sourceVersion:'0.1.11',sourceBytes:before.length,sourceSha256:pin,bytes:bytes.length,sha256:hash(bytes)});
}
fs.writeFileSync(base+'/draft-preparation.json',JSON.stringify({createdAt:new Date().toISOString(),canonicalSource:'e3a4daecf4bd637d77d43329f0956ac06dac0cc5',targetVersion:'0.1.12',sourceRuntimeUnmodified:true,frozenInputsAndCriteriaUnchanged:true,modelStatus:'NOT_RUN',resources:evidence},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({draftOnly:true,resources:evidence}));
