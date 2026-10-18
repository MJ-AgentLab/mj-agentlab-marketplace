import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const repo = process.argv[2];
const original = 'C:/Users/Admin/AppData/Local/Temp/mj-intent-delivery/synthetic-agent-r2';
const directory = path.join(root, 'roles-r2-review');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const bytes = fs.readFileSync(path.join(original, 'role-outputs.json'));
const readBytes = fs.readFileSync(path.join(original, 'read-transcript.json'));
if (hash(bytes) !== '1b07446ccf39b93d6e3f11a6079a34d407b6372c71622941aed1f8c67f86e2a6') throw new Error('R2 role artifact changed');
if (hash(readBytes) !== '7fc4b0d893b8555779e8dbbf9ace77d320d14dad6ddfb9e634d14838a8299ed1') throw new Error('R2 read transcript changed');
const output = JSON.parse(bytes), transcript = JSON.parse(readBytes);
const rawInputs = fs.readFileSync(transcript.input_read.raw_path);
const inputs = JSON.parse(rawInputs);
const inputMatches = hash(rawInputs) === transcript.input_read.sha256 && rawInputs.length === transcript.input_read.byte_length && rawInputs.equals(fs.readFileSync(output.input_source_file));
const wrapperBytes = fs.readFileSync(transcript.capture_script.path);
const wrapperHashMatches = hash(wrapperBytes) === transcript.capture_script.sha256;
const firstReply = Date.parse(output.results[0].started_at_utc);
// The aggregate transcript drops insignificant trailing zeroes when serializing
// UTC fractional seconds. Compare the exact same instant without changing raw files.
const normalTime = value => value.replace(/(\.\d*?[1-9])0+Z$/, '$1Z').replace(/\.0+Z$/, 'Z');
const normalRecord = value => ({ ...value, started_at_utc: normalTime(value.started_at_utc), ended_at_utc: normalTime(value.ended_at_utc) });
const reads = transcript.reads.map(record => {
  const stdout = fs.readFileSync(record.stdout.path), stderr = fs.readFileSync(record.stderr.path);
  const sourceBytes = execFileSync('git', ['show', `${record.commit}:${record.path}`], { cwd: repo });
  const individual = JSON.parse(fs.readFileSync(path.join(original, 'read-records', `${record.sequence}.json`)));
  return {
    sequence: record.sequence, source: `${record.commit}:${record.path}`, argv: record.argv, exit: record.exit_code,
    sourceBytes: sourceBytes.length, stdoutBytes: stdout.length, stderrBytes: stderr.length,
    hashesMatch: hash(stdout) === record.stdout.sha256 && hash(stderr) === record.stderr.sha256,
    exactSourceBytes: stdout.equals(sourceBytes), lengthsMatch: stdout.length === record.stdout.byte_length && stderr.length === record.stderr.byte_length,
    argvMatches: record.argv.length === 3 && record.argv[1] === 'show' && record.argv[2] === `${record.commit}:${record.path}`,
    originalReadRecordLexicallyMatches: JSON.stringify(individual) === JSON.stringify(record),
    originalReadRecordMatches: JSON.stringify(normalRecord(individual)) === JSON.stringify(normalRecord(record)),
    actualReadEndedBeforeReplies: Date.parse(record.ended_at_utc) < firstReply,
    startBeforeEnd: Date.parse(record.started_at_utc) <= Date.parse(record.ended_at_utc),
  };
});
const assessments = {
  S1: { evidence: ['没有证据表明已完成提出者原意核对、职责 Owner 内容接受或实施授权', '维护者不能仅凭维护身份代为接受', '不能因缺新决定停止所有独立调查'], assessment: 'Correct separation of lifecycle, validation, original-meaning confirmation, content acceptance and operation authorization; dependent work waits while independent read-only investigation may continue.' },
  S2: { evidence: ['INT-2026-701 保留同一 ID', '使用者找不到接受版本', '能恢复当时完整需求', '能说明接受的内容及未覆盖范围', '只读查询，不发布', '查询时限未知', '“完整接受基线不可恢复，不能确定/核验当时接受的完整内容”'], assessment: 'All five supplied old-content parts are preserved, identity and unknown decision time remain unchanged, publication and two seconds do not inherit old acceptance. The reply distinguishes simulated restoration from actual Issue-byte recovery and treats hash/URL-only evidence as insufficient.' },
  S3: { evidence: ['实际交付、依赖支撑、背景参考', '原意达成：部分达成', '全计划完成：不能认定', 'Owner 最终接受：没有发生'], assessment: 'Item coverage and evidence roles are distinct; R1 is bounded by hypothetical input, R2 remains unobserved and R3 unmeasured. Engineering, meaning, full plan and Owner acceptance are separately judged, with accountable resumption conditions.' },
  S4: { evidence: ['决定状态仍是待答', '不能默认为 A 获准', '文字 pending 或再次陈述问题不能证明原生窗口合格', '不能承诺锁住宿主'], assessment: 'No confirmation inferred from recommendation, preselection, postponement or disappearance. Read-only independent work is bounded; dependent choices wait; strict native persistence is unproved/deferred rather than passed.' },
  S5: { evidence: ['“我想知道上次到底接受了哪份完整需求，别只给我一个编号。”', 'hash 验证已有原件，不能反推出正文', '“你说的‘上次’具体指哪次接受，看到那份完整需求后要完成什么判断？”', '推荐不是批准'], assessment: 'Original words, input-supplied implementation facts, assumptions and unknowns are separately preserved; no thresholds or old content are invented. The meaning question is neutral and engineering options have a conditional recommendation.' },
};
const semantic = output.results.map(result => {
  const input = inputs.find(item => item.id === result.id), assessed = assessments[result.id];
  const inputExact = input && input.input === result.input && input.role === result.role && input.skill === result.skill;
  const excerptsPresent = assessed.evidence.every(excerpt => result.actual_reply.includes(excerpt));
  const citedSequencesValid = result.citation_basis.every(citation => transcript.reads.some(record => record.sequence === citation.sequence && `${record.commit}:${record.path}` === citation.source));
  const evidenceRecordsValid = result.read_evidence.every(evidence => transcript.reads.some(record => record.sequence === evidence.sequence && record.stdout.sha256 === evidence.stdout.sha256 && record.exit_code === evidence.exit_code));
  const skillRead = transcript.reads.some(record => result.read_record_sequences.includes(record.sequence) && record.path === `.agents/skills/${result.skill}/SKILL.md`);
  return { id: result.id, inputExact, ...assessed, excerptsPresent, citedSequencesValid, evidenceRecordsValid, skillRead, outcome: inputExact && excerptsPresent && citedSequencesValid && evidenceRecordsValid && skillRead ? 'PASS' : 'FAIL', limitation: 'One shared Agent context continued from R1, with prior answers visible. This is a guided synthetic policy-response scenario, not a fresh CLI session, actual historical Issue restore, real host window test, real-effect measurement, platform approval or final Owner acceptance.' };
});
const actualReadEvidenceMeets = inputMatches && wrapperHashMatches && reads.length === 16 && reads.every(read => read.exit === 0 && read.stderrBytes === 0 && read.hashesMatch && read.exactSourceBytes && read.lengthsMatch && read.argvMatches && read.originalReadRecordMatches && read.actualReadEndedBeforeReplies && read.startBeforeEnd);
const priorR1 = fs.readFileSync('C:/Users/Admin/AppData/Local/Temp/mj-intent-delivery/synthetic-agent-r1/role-outputs.json');
const priorR1Unchanged = hash(priorR1) === '7653c1b432b854e17d4dfc0943d2d45cb4a8baaad7a769a49734707cade2d3bb';
fs.mkdirSync(directory, { recursive: true });
fs.cpSync(original, path.join(directory, 'raw-sampling'), { recursive: true });
const report = {
  schemaVersion: 1, rubric: 'INTENT-IA-R1', reviewer: '/root/latest_intent_fit', independent: true, capturedAt: new Date().toISOString(), candidate: output.candidate.commit,
  rawArtifact: { original: path.join(original, 'role-outputs.json'), sha256: hash(bytes), bytes: bytes.length }, rawReadTranscript: { original: path.join(original, 'read-transcript.json'), sha256: hash(readBytes), bytes: readBytes.length },
  inputMatches, wrapperHashMatches, actualReadEvidenceMeets, reads, semantic, priorR1Unchanged,
  candidateReadProofOutcome: actualReadEvidenceMeets ? 'PASS' : 'FAIL', semanticOutcome: semantic.every(item => item.outcome === 'PASS') ? 'PASS' : 'FAIL',
  overallAcceptanceOutcome: actualReadEvidenceMeets && semantic.every(item => item.outcome === 'PASS') && priorR1Unchanged ? 'PASS' : 'FAIL',
  scope: 'S1-S5 independent review of 5 actual R2 Agent replies, complete original inputs, 16 contemporaneously captured fixed-source reads and exact raw bytes. No CLI or native-window/real-effect/approval/Owner acceptance claim.',
  evidenceBoundary: 'The process argv, original read records, captured stdout/stderr hashes/lengths, and exact fixed Git bytes were independently verified. Capture wrapper returns the entire decoded stdout to its tool output; runtime internal model attention cannot be independently observed and is not claimed. R2 does not upgrade the R1 missing-read-history evidence.',
  reviewerCorrection: 'The first review run compared aggregate metadata JSON lexically and reported FAIL because 8 timestamps were serialized without insignificant trailing fractional-second zeroes (.3298900Z versus .32989Z). No raw source/stdout/stderr byte mismatch occurred. The raw first receipt/script remain under lexical-timestamp-mismatch names; only the metadata comparison was corrected to accept that identical UTC instant. Source bytes/hashes/lengths still require exact equality.',
};
fs.writeFileSync(path.join(directory, 'independent-role-review.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ directory, actualReadEvidenceMeets, reads: reads.length, inputMatches, wrapperHashMatches, priorR1Unchanged, semantic: semantic.map(item => ({ id: item.id, outcome: item.outcome })), overallAcceptanceOutcome: report.overallAcceptanceOutcome }, null, 2));
process.exitCode = report.overallAcceptanceOutcome === 'PASS' ? 0 : 1;
