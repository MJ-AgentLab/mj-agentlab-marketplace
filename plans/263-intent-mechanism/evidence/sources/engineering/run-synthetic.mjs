import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const [root, output] = process.argv.slice(2);
const require = createRequire(path.join(root, 'package.json'));
const spawn = require('cross-spawn');
fs.mkdirSync(output, { recursive: true });
const cases = [
  { id: 'S1', skill: 'mp-flow-intake', role: '承接Agent', input: '合成场景：某INTENT的state为active，维护者说已整理，校验通过，但没有提出者核对、职责Owner内容接受或实施授权。这里只授权你只读评估。请判断目前有哪些有效决定、哪些工作可继续、哪些须等待，以及维护者是否能代为接受。' },
  { id: 'S2', skill: 'mp-flow-intake', role: '需求承接者', input: '合成场景：INT-2026-701保持同一身份。旧Issue原意区已被编辑，但保有完整快照：问题与现状=使用者找不到接受版本；期望结果=能恢复当时完整需求；成功判断=能说明接受的内容及未覆盖范围；范围与约束=只读查询，不发布；未决项=查询时限未知。具职责Owner的已保存决定只接受这个完整快照，时间未知不得补写。当前Issue又新增“自动发布”并将目标改为两秒完成，尚无新接受。请恢复并列明旧接受范围、当前差异、可继续部分；若只剩URL或hash而没有完整快照，应如何判定？' },
  { id: 'S3', skill: 'mp-flow-self-review', role: '交付核验者', input: '合成场景：某原意有R1完整接受基线可恢复、R2未答窗口持续显示、R3现实使用效果。共享Issue A只实际交付R1；Issue B提供通用测试环境，属于依赖支撑；PR C只是相关历史案例，属于背景参考。A/B/C均已关闭。R2没有客户端观测，R3没有测量，Owner未作最终接受。请逐项报告覆盖、结果、限制和恢复条件，分别判断工程完成、原意达成、全计划完成及Owner接受。' },
  { id: 'S4', skill: 'mp-flow-intake', role: '澄清入口执行者', input: '合成场景：业务范围有A/B选项，界面预选A且Agent推荐A。用户只回复“稍后看”，随后窗口消失；没有提交选项。没有宿主窗口持续显示的独立证据。当前只授权只读调查。请给出决定状态、允许继续的动作、依赖动作及入口资格；不要真的调用提问窗口或写入任何位置。' },
  { id: 'S5', skill: 'mp-doc-author', role: '原意整理者', input: '合成场景，真实业务原话作为材料：“我想知道上次到底接受了哪份完整需求，别只给我一个编号。” 已核实现事实：系统只保存最新摘要与hash，旧正文没有可恢复存档。提出者没有给出查询耗时、保存期限或成功率。你只获准只读提出整理方案，不保存文件。请分开原话、事实、假设、未知，说明差距和由谁决定后续范围，并分别示范一个中性的业务含义澄清项与一个可推荐的工程取舍。' }
];
const results = [];
for (const item of cases) {
  const caseDirectory = path.join(output, item.id);
  fs.mkdirSync(caseDirectory, { recursive: true });
  const prompt = `这是独立合成验收采样，模拟身份为${item.role}，不是真实Owner决定。请实际读取当前候选 .agents/skills/${item.skill}/SKILL.md 及其相关INTENT规则，然后只读处理以下材料。不得修改文件、提交、访问外部服务、发送消息或声称真实客户端/Owner验收已通过。不要寻找本测试判准或其他测试输出。以中文直接返回判断及依据。\n\n${item.input}`;
  fs.writeFileSync(path.join(caseDirectory, 'input.txt'), prompt);
  const args = ['exec', '--ephemeral', '--skip-git-repo-check', '--sandbox', 'read-only', '--json', '--color', 'never', '-C', root, '-o', path.join(caseDirectory, 'output.txt'), '-'];
  const startedAt = new Date().toISOString();
  const exit = await new Promise(resolve => {
    const child = spawn('codex', args, { cwd: root, env: process.env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const out = fs.createWriteStream(path.join(caseDirectory, 'events.jsonl'));
    const err = fs.createWriteStream(path.join(caseDirectory, 'stderr.txt'));
    child.stdout.pipe(out); child.stderr.pipe(err);
    child.stdin.end(prompt);
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, 240000);
    child.on('error', error => { clearTimeout(timer); err.end(error.message); resolve({ error: error.message, status: null, timedOut }); });
    child.on('close', (status, signal) => { clearTimeout(timer); resolve({ status, signal, timedOut }); });
  });
  const bytes = fs.existsSync(path.join(caseDirectory, 'output.txt')) ? fs.readFileSync(path.join(caseDirectory, 'output.txt')) : Buffer.alloc(0);
  results.push({ id: item.id, role: item.role, skill: item.skill, startedAt, finishedAt: new Date().toISOString(), ...exit, outputBytes: bytes.length, outputSha256: crypto.createHash('sha256').update(bytes).digest('hex'), assessment: 'PENDING_INDEPENDENT_REVIEW' });
  fs.writeFileSync(path.join(output, 'execution.json'), JSON.stringify({ schemaVersion: 1, sourceRoot: root, mode: 'synthetic-read-only', results }, null, 2) + '\n');
  process.stdout.write(`${item.id}: execution status ${exit.status}, output ${bytes.length} bytes, assessment pending\n`);
  if (exit.error || exit.timedOut || exit.status !== 0) break;
}
