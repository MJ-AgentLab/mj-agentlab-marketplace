import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const repo = process.argv[2];
const commit = 'def81915ed5fe70daf9129256b9fd816f0e4a79c';
const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const output = path.join(root, 'contract-def81915');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = relative => execFileSync('git', ['show', `${commit}:${relative}`], { cwd: repo });
const bindingPath = 'plans/263-intent-mechanism/source-bindings.json';
const bindingBytes = read(bindingPath);
const bindings = JSON.parse(bindingBytes);
const sourceEvidence = bindings.sources.map(source => {
  const relative = `plans/263-intent-mechanism/${source.path}`;
  const bytes = read(relative);
  fs.mkdirSync(path.dirname(path.join(output, relative)), { recursive: true });
  fs.writeFileSync(path.join(output, relative), bytes);
  return { id: source.id, relative, bytes: bytes.length, recordedSha256: source.sha256, actualSha256: sha256(bytes), hashMatches: source.sha256 === sha256(bytes), original: source.original, purpose: source.purpose, scope: source.scope };
});
const reviewedPaths = [
  'docs/rule/[STANDARD]_AI_Engineering_Intent.md',
  'docs/adr/[ADR]_Intent_Mechanism_Addition.md',
  'docs/intent/[INTENT]_INT-2026-001_Intent_Mechanism.md',
  'docs/intent/INDEX.md',
  'docs/_templates/TEMPLATE_INTENT.md',
  'plans/263-intent-mechanism/[PLAN]_Intent_Mechanism.md',
  'plans/263-intent-mechanism/INDEX.md',
  bindingPath,
];
const reviewed = reviewedPaths.map(relative => {
  const bytes = read(relative);
  fs.mkdirSync(path.dirname(path.join(output, relative)), { recursive: true });
  fs.writeFileSync(path.join(output, relative), bytes);
  return { relative, bytes: bytes.length, sha256: sha256(bytes) };
});
const checks = [
  { criterion: 'Preserve the accepted scheme and provenance', finding: 'The full eight-section B1 is retained. Q1-Q6 capture question text, alternatives, answer text and visible questionItemId; seven principles and later implementation authorization are separate complete captures.', result: 'PASS', limit: 'These are conversation-visible text captures, explicitly not host exports. Original request/principle escaping and layout were normalized and that is disclosed.' },
  { criterion: 'Distinguish earlier acceptance from the new rendering', finding: 'The new formal INTENT is draft; its own confirmation and verbatim acceptance are expressly not claimed. PLAN is the single decision-record original, with actual source and unknown exact message time; old accepted B1 remains engineering authority.', result: 'PASS', limit: 'No new real Owner acceptance is inferred or supplied by this review.' },
  { criterion: 'Preserve scope and current repository governance', finding: 'Nine current common fields plus intent-id are ten fields; existing canonical/working and stable INDEX/PLAN/REPORT are preserved. Twenty development skills remain; no interview skill, plugin runtime/version, release or branch-protection change is proposed.', result: 'PASS', limit: 'This is semantic review of the pinned contract; actual full integration checks are separately bound to the integration candidate.' },
  { criterion: 'Preserve source/implementation and outcome distinctions', finding: 'Standard and PLAN distinguish proposer meaning, actual repository evidence, confirmation, content acceptance, state, operation authorization and full/partial/deferred delivery; unknowns and unavailable timestamps stay unknown.', result: 'PASS', limit: 'Semantic rules require actual behavior evidence; document text alone does not prove future compliance.' },
  { criterion: 'Strict unanswered window and authorization', finding: 'The contract preserves non-answer cases and requires actual client evidence. Missing native-window/long-term-effect evidence is deferred rather than passed. Later implementation authorization supersedes the earlier read-only limit only within its explicit scope.', result: 'PASS', limit: 'No actual native-window persistence or long-term business outcome is established by these documents or this review.' },
];
const report = { implementation: commit, rubric: 'INTENT-IA-R1', reviewer: '/root/latest_intent_fit', independent: true, capturedAt: new Date().toISOString(), blockingFindings: [], reviewed, sourceEvidence, allSourceHashesMatch: sourceEvidence.every(source => source.hashMatches), checks, conclusion: 'No blocking semantic discrepancy found in the pinned contract. New wording remains explicitly draft; original accepted content, implementation authority and eventual final acceptance retain their own boundaries.' };
fs.writeFileSync(path.join(output, 'independent-contract-review.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ commit, output, allSourceHashesMatch: report.allSourceHashesMatch, sources: sourceEvidence.length, checks: checks.length, blockingFindings: report.blockingFindings }, null, 2));
process.exitCode = report.allSourceHashesMatch ? 0 : 1;
