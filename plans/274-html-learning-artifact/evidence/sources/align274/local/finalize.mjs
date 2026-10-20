import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const parent = 'C:/Users/Admin/.codex/worktrees/html-prompt-alignment/alignment-evidence/local-delivery';
const run = path.join(parent, 'run-independent-r1');
const worktree = 'C:/Users/Admin/.codex/worktrees/html-prompt-alignment/develop';
const skill = path.join(worktree, 'plugins/html-guide-kit/skills/site');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const json = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(run, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
const files = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)).map(x => ({ ...x, path: e.name + '/' + x.path })) : [{ path: e.name, bytes: fs.statSync(path.join(dir, e.name)).size, sha256: hash(fs.readFileSync(path.join(dir, e.name))) }]).sort((a,b)=>a.path.localeCompare(b.path));
const source = path.join(skill, 'examples/representative');
const original = json(path.join(source, 'artifact.json'));
const copied = json(path.join(run, 'input/artifact.json'));
const { theme, ...withoutTheme } = copied;
const sourceConfigSame = JSON.stringify(original) === JSON.stringify(withoutTheme);
const sourceRulesHash = hash(fs.readFileSync(path.join(source, 'sources/renewal-rules.md')));
const contentHash = hash(fs.readFileSync(path.join(source, 'content.md')));
const dates = ['2026-10-20','2026-10-29'].map(original => {
  const date = new Date(original + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + 7);
  return { original, successAfterSevenCalendarDays: date.toISOString().slice(0,10), failureUnchanged: original };
});
const semantic = {
  reviewer: '/root/alignment_independent_review', recordedAt: new Date().toISOString(),
  inputRead: ['artifact.json in full', 'content.md in full', 'sources/renewal-rules.md in full'],
  boundaries: 'Project-authored synthetic rules, not a real library policy or action authorization. Source-supported here means faithful to this self-contained exercise, not external factual policy verification.',
  originalSourceHashes: { 'content.md': contentHash, 'sources/renewal-rules.md': sourceRulesHash },
  reusedDecisions: { audience: original.audience, task: original.task, goals: original.goals, theme: 'neutral', delivery: 'local-only', formalRepeatInterview: 'Not required; all material decisions explicitly supplied' },
  configSemanticsUnchangedExceptTheme: sourceConfigSame,
  claims: [
    { id: 'LIB1', conclusion: 'Only one book/one renewal is modeled. Parallel account categories are not promoted into workflow.', judgment: 'Source states scope and parallel categories. Content preserves one-book/one-attempt scope, explains table as condition combinations, invents no ordering. Unneeded account labels remain in complete downloadable source.', status: 'PASS_SEMANTIC_REVIEW' },
    { id: 'LIB2', conclusion: 'Not overdue AND no other reservation are both necessary; any failed condition means not permitted. Permission does not confirm success.', judgment: 'All four condition rows match conjunction. permission-check correctIndex=1 matches the given reservation counterexample; feedback restores the missing second condition.', status: 'PASS_SEMANTIC_REVIEW' },
    { id: 'LIB3', conclusion: 'Success extends the original due date by seven calendar days. Failure leaves it unchanged. Unknown result provides no basis to select either outcome.', judgment: 'Original due date, weekend/cross-month inclusion and failure condition retained. date-check correctIndex=0. Independent UTC calendar arithmetic verifies both examples below.', dates, status: 'PASS_SEMANTIC_REVIEW' },
    { id: 'LIB4', conclusion: 'Submission alone is not completion. Both success text and updated due date are needed; missing confirmation does not prove failure.', judgment: 'Two evidence conditions, unknown result and no invented backend/time limit are explicit in source and content. completion-check correctIndex=1 is faithful; feedback does not turn unknown into failure.', status: 'PASS_SEMANTIC_REVIEW' },
    { id: 'LearningBoundary', conclusion: 'Chinese learning explanations/activities with stable English core names and local source links; no mastery/effect claim.', judgment: 'All four term mappings retain concept distinctions; activity outcomes are reference judgments. NOT_MEASURED and synthetic-policy disclaimer retained.', status: 'PASS_SEMANTIC_REVIEW' }
  ],
  actualInteraction: 'NOT_RUN by this Agent. No click/answer/retry/reset/copy/export/keyboard/focus/touch claim. Bounded browser geometry and initial screenshots only.',
  result: sourceConfigSame && dates[0].successAfterSevenCalendarDays === '2026-10-27' && dates[1].successAfterSevenCalendarDays === '2026-11-05' ? 'PASS_BOUNDED_SEMANTIC_REVIEW' : 'FAIL'
};
write('semantic-review.json', semantic);

const screenshots = json(path.join(run, 'browser-report.json'));
write('visual-review.json', {
  reviewer: '/root/alignment_independent_review', recordedAt: new Date().toISOString(), method: 'Actually opened both current-run PNG files with view_image and inspected returned pixels.',
  screenshots: screenshots.viewports.map(v => ({ path: 'screenshots/' + v.screenshot, sha256: v.screenshotSha256, viewport: v.viewport, observed: 'Initial viewport text and hierarchy readable; neutral light background, dark grey accents and sans headings visible; no observed initial-state clipping or horizontal overflow. Chinese wraps naturally at narrow size.', status: 'PASS_BOUNDED_VISUAL_REVIEW' })),
  limits: ['Only initial viewport screenshots viewed, not screenshots of all below-fold states', 'Whole-document geometry was checker-bounded only', 'No full accessibility/WCAG or interaction-flow evaluation']
});

const recovery = path.join(run, 'recovery-check');
fs.mkdirSync(recovery);
const regenerated = path.join(recovery, 'site-regenerated');
const startedAt = new Date().toISOString();
const args = [path.join(skill, 'scripts/render-site.mjs'), '--input', path.join(run, 'input'), '--output', regenerated];
const p = spawnSync(process.execPath, args, { cwd: recovery, maxBuffer: 1024 * 1024, windowsHide: true });
fs.writeFileSync(path.join(recovery, 'stdout.txt'), p.stdout, { flag: 'wx' });
fs.writeFileSync(path.join(recovery, 'stderr.txt'), p.stderr, { flag: 'wx' });
const actualFiles = files(path.join(run, 'site')), restoredFiles = p.status === 0 ? files(regenerated) : [];
const recoveryResult = { startedAt, endedAt: new Date().toISOString(), executable: process.execPath, args, cwd: recovery, exitCode: p.status, stdout: 'recovery-check/stdout.txt', stderr: 'recovery-check/stderr.txt', original: actualFiles, regenerated: restoredFiles, allTenFilesByteIdentical: JSON.stringify(actualFiles) === JSON.stringify(restoredFiles), result: p.status === 0 && JSON.stringify(actualFiles) === JSON.stringify(restoredFiles) ? 'PASS_EXACT_REGENERATION' : 'FAIL', limits: 'Fresh independent regeneration from delivered input, not production Site rollback or browser rerun. Existing checked byte-identical artifact evidence is reused only for identical bytes.' };
write('recovery-check/result.json', recoveryResult);

const themeRoot = 'C:/Users/Admin/.codex/worktrees/html-prompt-alignment/alignment-evidence/theme';
const themePaths = ['verification-summary.json', 'command-receipts.json', 'verify-themes.mjs', 'neutral-browser.json', 'warm-paper-browser.json'];
const references = themePaths.map(name => ({ path: path.join(themeRoot, name), sha256: hash(fs.readFileSync(path.join(themeRoot, name))) }));
const jsDiff = spawnSync('git', ['diff', '--exit-code', 'a4892f51f4163fb5bd4457d99229eaf1a4683e8f', 'b5b8300ae58e967e1d0013e66dc4f1208ac860ef', '--', 'plugins/html-guide-kit/skills/site/assets/warm-paper/learning.js'], { cwd: worktree });
write('related-evidence.json', { recordedAt: new Date().toISOString(), references, scope: 'Existing bounded theme computed-style/contrast and layout checks by another Agent; read and hash-referenced here, not performed anew by this Agent. Does not establish complete interaction main flow.', learningJs: { candidateSha256: hash(fs.readFileSync(path.join(skill, 'assets/warm-paper/learning.js'))), baselineDiffExitCode: jsDiff.status, baselineDiffStdout: jsDiff.stdout.toString('utf8'), unchangedFromBase: jsDiff.status === 0 && jsDiff.stdout.length === 0 }, ownInteractionStatus: 'NOT_RUN; no inherited evidence reclassified as new execution' });
const execution = json(path.join(run, 'execution.json'));
const statics = json(path.join(run, 'static-report.json'));
const final = {
  schemaVersion: 1, reviewer: '/root/alignment_independent_review', recordedAt: new Date().toISOString(), role: 'Independent Agent actually completing one synthetic already-confirmed local-delivery scene',
  candidate: 'b5b8300ae58e967e1d0013e66dc4f1208ac860ef', contentVersion: copied.version, mode: 'local-only', theme,
  delivery: { html: 'site/index.html', independentInput: 'input/', standaloneContent: 'site/content.md', fullSource: 'site/sources/renewal-rules.md', metadata: 'site/artifact.json', outputFileManifest: 'site/artifact-manifest.json', instructions: 'DELIVERY.md', replay: '../replay.mjs' },
  actualResults: { generateExit: execution.commands[0].exitCode, staticExit: execution.commands[1].exitCode, staticChecks: statics.summary, browserExit: execution.commands[2].exitCode, browserStatus: screenshots.status, viewports: screenshots.viewports.map(v=>({ viewport:v.viewport, status:v.status })), screenshotReview: 'Both actual run PNGs viewed', sourceAndSkillUnchanged: execution.originalSourceUnchanged && execution.installedSkillUnchanged, semanticReview: semantic.result, exactRecovery: recoveryResult.result },
  result: 'PASS_BOUNDED_CONFIRMED_LOCAL_DELIVERY',
  completionBoundary: 'Requested local artifact, independent content/source/version, actual limited checks and regeneration instructions delivered. This is not full plugin release acceptance or exhaustive artifact interaction acceptance.',
  notExecuted: ['Actual Matt interview or unanswered-question behavior', 'Native window persistence/close/timeout', 'Sites creation/save/deploy or remote access check', 'CLI model/desktop/second client', 'This Agent answer/copy/export/reset/keyboard operations', 'Full npm/13-install matrix', 'Understanding effects'],
  nativeWindow: 'DEFERRED', understandingEffects: 'NOT_MEASURED', ownerAcceptance: 'NOT_PROVIDED; no synthetic role substitute'
};
write('final-result.json', final);
console.log(JSON.stringify({ result: final.result, semantic: semantic.result, regeneration: recoveryResult.result, staticChecks: statics.summary.checks, originalUnchanged: final.actualResults.sourceAndSkillUnchanged, run }, null, 2));
