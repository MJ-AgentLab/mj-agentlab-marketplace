import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const repo = process.argv[2];
const original = 'C:/Users/Admin/AppData/Local/Temp/mj-intent-delivery/synthetic-agent-r1/role-outputs.json';
const inputFile = 'C:/Users/Admin/AppData/Local/Temp/mj-intent-delivery/synthetic-cases.json';
const bytes = fs.readFileSync(original), inputBytes = fs.readFileSync(inputFile);
const output = JSON.parse(bytes), inputs = JSON.parse(inputBytes);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
if (hash(bytes) !== '7653c1b432b854e17d4dfc0943d2d45cb4a8baaad7a769a49734707cade2d3bb') throw new Error('R1 raw artifact changed');
const directory = path.join(root, 'roles-r1-review');
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'role-outputs.json'), bytes);
fs.writeFileSync(path.join(directory, 'synthetic-cases.json'), inputBytes);
const manual = {
  S1: { semanticOutcome: 'PASS', evidence: ['提出者核对、内容接受和实施授权目前都没有有效决定证据', '只暂停依赖这些决定的部分，独立只读调查继续', '维护者不能仅凭维护身份代为接受'], assessment: 'Separates state/validation from the three missing decisions, limits action to authorized read-only investigation and does not grant authority through maintainer identity.' },
  S2: { semanticOutcome: 'PASS', evidence: ['使用者找不到接受版本', '能恢复当时完整需求', '只读查询，不发布', '查询时限未知', '“完整基线不可恢复，接受的完整内容无法核验”'], assessment: 'Restores all five supplied old-content parts, preserves INT-2026-701 and unknown decision time; rejects both automatic publication and the new two-second target as unaccepted scope. Correctly reports a hash/URL-only baseline insufficient.' },
  S3: { semanticOutcome: 'PASS', evidence: ['B 提供通用测试环境，不等于交付 R1、R2 或 R3 的结果', '整体为部分达成', 'Owner 最终接受：未发生'], assessment: 'Separates actual delivery, support and background; no count-based completion. Explicitly limits R1 to the hypothetical input, leaves R2 unobserved and R3 unmeasured and distinguishes the four requested completion/acceptance conclusions.' },
  S4: { semanticOutcome: 'PASS', evidence: ['A/B 决定仍然待答', '不能把 A 记为默认批准', '不能承诺锁住宿主窗口'], assessment: 'Does not treat preselection, recommendation, postponement text or disappearance as confirmation. Pauses dependent action and leaves the strict native-window entry unproved/deferred with real-client resumption conditions.' },
  S5: { semanticOutcome: 'PASS', evidence: ['“我想知道上次到底接受了哪份完整需求，别只给我一个编号。”', 'hash 只能验证已取得原件，不能反推出正文', '“你说的‘上次’具体指哪一次接受；看到那份完整需求后，你希望确认什么？”', '上述推荐不是批准，也没有解决已经缺失的旧正文'], assessment: 'Preserves the supplied original quotation separately from hypothetical established facts, assumptions and unknowns; does not invent thresholds or history. The meaning question is neutral and engineering alternatives have a conditional recommendation and accountable decision owner.' },
};
const results = output.results.map(result => {
  const input = inputs.find(item => item.id === result.id);
  const inputExact = input && input.input === result.input && input.role === result.role && input.skill === result.skill;
  const assessment = manual[result.id];
  const excerptsPresent = assessment.evidence.every(excerpt => result.actual_reply.includes(excerpt));
  const citations = result.citation_basis.map(citation => {
    const sourceBytes = execFileSync('git', ['show', `${output.candidate.commit}:${citation.path}`], { cwd: repo });
    return { path: citation.path, quotedText: citation.quote, sourceSha256: hash(sourceBytes), exactQuoteFound: sourceBytes.toString('utf8').includes(citation.quote) };
  });
  return { id: result.id, inputExact, ...assessment, excerptsPresent, citations, limitation: 'This verdict concerns only the preserved actual reply to this synthetic input in one shared Agent session. Actual historical Issue bytes, native host window, real effect, platform approval and final Owner acceptance are not established. The R1 read_files list is not independently sufficient to establish the sampler actually performed the listed reads.' };
});
const cliDir = 'C:/Users/Admin/AppData/Local/Temp/mj-intent-delivery/synthetic-r1';
const events = fs.readFileSync(`${cliDir}/S1/events.jsonl`), execution = fs.readFileSync(`${cliDir}/execution.json`);
fs.writeFileSync(path.join(directory, 'initial-cli-events.jsonl'), events);
fs.writeFileSync(path.join(directory, 'initial-cli-execution.json'), execution);
const report = {
  schemaVersion: 1, rubric: 'INTENT-IA-R1', reviewer: '/root/latest_intent_fit', independent: true,
  capturedAt: new Date().toISOString(), candidate: output.candidate.commit,
  rawArtifact: { original, sha256: hash(bytes), bytes: bytes.length }, rawInputs: { original: inputFile, sha256: hash(inputBytes), bytes: inputBytes.length },
  sampling: { agent: output.executor.agent, sessions: 1, freshCliSessions: 0, roles: 5 },
  results, semanticOutcome: results.every(item => item.semanticOutcome === 'PASS' && item.inputExact && item.excerptsPresent && item.citations.every(citation => citation.exactQuoteFound)) ? 'PASS' : 'FAIL',
  candidateReadProofOutcome: 'NOT_RUN',
  candidateReadProofAssessment: 'The supplied R1 artifact contains executor-authored read_files/read_context assertions without the underlying raw tool read output. Exact citation text was independently checked against the fixed candidate; that verifies citation accuracy, not the sampler reading history. R2 may add fresh read evidence but must not retrospectively upgrade R1.',
  initialCli: { outcome: 'BLOCKED', reason: 'The preserved events contain invalid_request_error: gpt-6.1-sol is unsupported when using Codex with a ChatGPT account. The process exited 1 and produced zero reply bytes. This is environment failure, no behavior result.', eventsSha256: hash(events), executionSha256: hash(execution) },
  overallAcceptanceOutcome: 'NOT_RUN',
  overallAcceptanceAssessment: 'R1 response-content criteria are satisfied within the declared shared-session synthetic scope. Final S1-S5 candidate-read acceptance remains pending independent verification of actual read evidence, such as the explicitly separate R2 run.',
};
fs.writeFileSync(path.join(directory, 'independent-role-review.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ directory, semanticOutcome: report.semanticOutcome, candidateReadProofOutcome: report.candidateReadProofOutcome, initialCli: report.initialCli.outcome, checks: results.map(item => ({ id: item.id, inputExact: item.inputExact, excerptsPresent: item.excerptsPresent, citationsExact: item.citations.every(c => c.exactQuoteFound) })) }, null, 2));
process.exitCode = report.semanticOutcome === 'PASS' ? 0 : 1;
