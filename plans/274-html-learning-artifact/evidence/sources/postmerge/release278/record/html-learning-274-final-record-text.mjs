import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop';
function edit(name,changes){const p=path.join(root,name),original=fs.readFileSync(p,'utf8'),nl=original.includes('\r\n')?'\r\n':'\n';let s=original.replaceAll('\r\n','\n');for(const [a,b] of changes){assert(s.includes(a),a);s=s.replace(a,b);}fs.writeFileSync(p,s.replaceAll('\n',nl));}
edit('docs/runbook/[RUNBOOK]_Release_Operations.md',[
 ['Marketplace v8.3.2已实际公开，独立发布审计已完成，当前新tag精确安装/缓存Python仍待终态。先保存本轮公开/复验记录；新tag新验通过后，本轮main记录PR将README默认公开安装ref从v8.3.1改为真实v8.3.2，并展示已公开site。','Marketplace v8.3.2已实际公开，独立发布审计和真实tag新13安装/178命令、实际Python及15根清理均已PASS。本轮main记录PR保存公开/复验原件，将README默认公开安装ref从v8.3.1改为真实v8.3.2，并展示已公开site。'],
 ['keep fresh real-tag checks pending, then record→actual main sync→Marketplace-only 8.3.3 preparation under ordinary protected gates.','record fresh real-tag verification PASS; the record PR, actual main sync and Marketplace-only 8.3.3 preparation remain dependent under ordinary protected gates.']
]);
edit('docs/runbook/[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md',[
 ['PR278实际合入/公开及在途新tag核验由本文件开头Actual publication新节接续。','PR278实际合入/公开及已完成的真实tag新核验由本文件开头Actual publication新节接续。'],
 ['pending fresh real-tag verification and ordered record→sync→8.3.3 preparation distinct.','fresh real-tag verification PASS, and dependent record→sync→8.3.3 preparation distinct.']
]);
edit('plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md',[
 ['本表引用其稳定条目，不另造需求。限定PASS只覆盖明示版本、材料和方法。','本表引用其稳定条目，不另造需求，当前状态已接续实际275/278合入和v8.3.2公开。限定PASS只覆盖明示版本、材料和方法；历史快照和原始失败保留原时点。'],
 ['| C01 | 六步本地方法、3输入/7输出、12项消费及同包私有Sites | PARTIAL：1a限定流程已验，最终保护交付/发布/Owner仍未完成 |','| C01 | 六步本地方法、3输入/7输出、12项消费及同包私有Sites；275/278已实际合入、v8.3.2已公开并新验 | PARTIAL：有界核心已交付；原保护批准NOT_MET、非核心延期和Owner最终接受独立未完成 |'],
 ['| C22 | P0主PR275；原子子PR276已正常合入552，同已测tree；0.1.37/旧市场和其他包保持 | PARTIAL；子PR2记录及最终主保护merge/发布未完 |','| C22 | 主PR275/子PR276/277及发布PR278已实际合入，v8.3.2交付HTML0.1.37；其他包版本/guide保持 | 开发拓扑及公开已执行；275/278实际Owner bypass及reviews=[]保留，记录/sync/prebump依真实前序推进 |'],
 ['| C23 | A1–A3及内部runtime A4检查/CI/实际merge已取；最终主保护门禁未齐 | NOT_MET于整体最终交付；不把内部通过当275批准/发布 |','| C23 | A1–A3及A4工程、双系统CI、实际merge/公开和新tag13安装已有证据 | A4整体仍NOT_MET：275/278保护批准缺项，四门槛未全通过；公开不追认批准或延期 |'],
 ['| C25 | 本REPORT保存版本/地址/状态/检查/限制 | PARTIAL；最终merge/发布和成品接受待补 |','| C25 | 本REPORT已接回实际main/tag/Release、双系统CI/真实tag新验与Site原生只读状态 | 有界交付报告已更新；后续维护实际合入、成品体检/最终接受及延期另待证 |'],
 ['| P05 | 原FAIL、641全测/strict、03092ce新缓存/9项与独立P2复测分别保留 | PARTIAL；最终CI/保护门禁与实际merge仍待 |','| P05 | 原FAIL/修后检查、最终双系统CI、275/278实际合入和公开后新13安装分别留证 | 工程有据；保护批准NOT_MET及Owner接受/延期独立，公开不抵消缺口 |'],
 ['| P06 | 独立输出/原件只读；Site同身份重试/私有回读，恢复计划保留 | 部分实证；无新Marketplace发布或完整恢复演练可认定 |','| P06 | 独立输出/原件只读；Site同身份/私有受众回读、v8.3.2真实公开及恢复计划留证 | 有界实证；完整恢复演练与持续监控未执行，不覆盖已公开历史或扩大受众 |'],
 ['| P07 | 275→develop、276→集成并已552正常merge；实际规则[]/threads0及完整CI已保存 | 内部拓扑/执行已实现；276 reviews[]不替主保护1个当前head非作者批准 |','| P07 | 275→develop、276/277→集成均已合入，278→main发布及实际规则/CI留证 | 单Issue/主子PR拓扑已执行；内部reviews[]与实际275/278 bypass不替当前保护批准，后续正常门禁保持 |']
]);
console.log('Updated four current-state phrases and current coverage rows; frozen sources untouched.');
