// External PREP_ONLY: exact copying, three literal guards, and syntax parsing only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(root, '../0-1-13');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const fail = s => { throw new Error(s); };
const json = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const guards = new Set(['prepare-correction.mjs', 'prepare-coverage.mjs', 'verify-canonical.mjs']);
const sourceInventoryFile = path.join(sourceRoot, 'frozen-copy-inventory.json');
const sourceInventoryBytes = fs.readFileSync(sourceInventoryFile);
const baseline = JSON.parse(sourceInventoryBytes);
const adaptationFile = path.join(sourceRoot, 'engineering-matrix-count-adaptation.json');
const adaptationBytes = fs.readFileSync(adaptationFile);
const adaptation = JSON.parse(adaptationBytes);
if (sha(sourceInventoryBytes) !== '1094019c88d5ce66ce3d805c24cf2aa674994137d4e44fdc9491095730e72b12') fail('Unexpected historical source inventory');
if (sha(adaptationBytes) !== '9aa67fc186c3f39723f415cf1fff4aea3d4bdd4aa8eccffb63b9e71c39fc8298') fail('Unexpected source adaptation authority');
if (baseline.files.length !== 33 || baseline.files.filter(r => !guards.has(r.relative)).length !== 30) fail('Expected frozen30 plus3 guards');
const exception = adaptation.allowedCurrentInventoryException;
if (exception.relative !== 'verify-canonical.mjs' || exception.afterSha256 !== 'd495615d5e722a08e49082317863e086189813368a3aab81a4df176cb1ba18e7') fail('Unexpected engineering-only inventory exception');
const targetInventory = path.join(root, 'frozen-copy-inventory.json');
if (fs.existsSync(targetInventory)) fail('Current preparation must not be overwritten');

const priorFiles = [];
function collect(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, ent.name);
    if (ent.isDirectory()) collect(f);
    else priorFiles.push({ relative: path.relative(root, f).replaceAll('\\', '/'), sha256: sha(fs.readFileSync(f)) });
  }
}
collect(root);
const effective = baseline.files.map(r => ({ ...r, historicalSha256: r.sha256,
  sha256: r.relative === exception.relative ? exception.afterSha256 : r.sha256 }));
const preflight = effective.map(r => {
  const source = path.join(sourceRoot, r.relative), bytes = fs.readFileSync(source), actual = sha(bytes);
  if (actual !== r.sha256) fail('Source invariant drift: ' + r.relative);
  if (fs.existsSync(path.join(root, r.relative))) fail('Destination already exists: ' + r.relative);
  return { ...r, source, bytes, actual };
});
const extraControlFile = path.join(sourceRoot, 'manual-extra-helper-copy-control.json');
const extraControlBytes = fs.readFileSync(extraControlFile);
const extraControl = JSON.parse(extraControlBytes);
if (extraControl.extraFiles.length !== 5) fail('Expected five extra controls');
const extraPreflight = extraControl.extraFiles.map(r => {
  const source = path.join(sourceRoot, r.name), bytes = fs.readFileSync(source), actual = sha(bytes);
  if (actual !== r.destinationSha256) fail('Extra source drift: ' + r.name);
  if (fs.existsSync(path.join(root, r.name))) fail('Extra destination already exists: ' + r.name);
  return { name: r.name, source, bytes, actual };
});
const write = (relative, bytes) => {
  const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes, { flag: 'wx' }); return file;
};
const save = (relative, value) => write(relative, JSON.stringify(value, null, 2) + '\n');
write('provenance/source13-inventory.json', sourceInventoryBytes);
write('provenance/source13-engineering-adaptation.json', adaptationBytes);
write('provenance/source13-extra-copy-control.json', extraControlBytes);
const sourceBuilder = path.join(sourceRoot, 'build-controls-prep-only-behavior-a.mjs');
const sourceBuilderBytes = fs.readFileSync(sourceBuilder);
write('provenance/source13-copier.mjs', sourceBuilderBytes);
const sourceExtraCopier = path.join(sourceRoot, 'copy-extra-manual-controls.mjs');
const sourceExtraCopierBytes = fs.readFileSync(sourceExtraCopier);
write('provenance/source13-extra-copier.mjs', sourceExtraCopierBytes);

const files = [], guardDiffs = [];
for (const r of preflight) {
  let output = r.bytes, operation = 'EXACT_COPY';
  if (guards.has(r.relative)) {
    const before = Buffer.from('0.1.13'), after = Buffer.from('0.1.14');
    const offsets = [], chunks = []; let cursor = 0;
    for (let at = r.bytes.indexOf(before, cursor); at >= 0; at = r.bytes.indexOf(before, cursor)) {
      chunks.push(r.bytes.subarray(cursor, at), after); cursor = at + before.length;
      offsets.push({ versionOffsetZeroBased: at, differingByteOffsetZeroBased: at + 5,
        beforeHex: '33', afterHex: '34', byteDelta: 0,
        line: r.bytes.subarray(0, at).toString('utf8').split('\n').length });
    }
    if (!offsets.length) fail('Missing version literal: ' + r.relative);
    chunks.push(r.bytes.subarray(cursor)); output = Buffer.concat(chunks);
    if (output.length !== r.bytes.length || !Buffer.from(output.toString('utf8').replaceAll('0.1.14', '0.1.13')).equals(r.bytes)) fail('Version-only restoration failure');
    const actualChanges = [];
    for (let i = 0; i < r.bytes.length; i++) if (r.bytes[i] !== output[i]) actualChanges.push(i);
    if (JSON.stringify(actualChanges) !== JSON.stringify(offsets.map(o => o.differingByteOffsetZeroBased))) fail('Non-version byte difference');
    const originalCopy = write('originals/' + r.relative, r.bytes);
    guardDiffs.push({ relative: r.relative, originalCopy, originalSha256: r.actual, newSha256: sha(output),
      beforeBytes: r.bytes.length, afterBytes: output.length, versionOccurrences: offsets.length, offsets,
      actualDifferingByteOffsets: actualChanges, change: 'Only literal 0.1.13 -> 0.1.14; each last byte 33 -> 34',
      collectionCountsUnchanged: { strictInstalls: 13, actualCachePython: 6 }, allOutsideVersionSegmentsOriginalBytes: true });
    operation = 'VERSION_GUARD_ONLY';
  }
  const destination = write(r.relative, output);
  files.push({ relative: r.relative, source: r.source, historicalSourceInventorySha256: r.historicalSha256,
    expectedSourceSha256: r.sha256, sourceSha256: r.actual, sha256: sha(output), bytes: output.length,
    operation, destination, sourceInventoryException: r.relative === exception.relative });
}
if (guardDiffs.reduce((n, r) => n + r.versionOccurrences, 0) !== 9) fail('Expected nine last-byte changes');
const extras = extraPreflight.map(r => ({ name: r.name, source: r.source, destination: write(r.name, r.bytes),
  sourceSha256: r.actual, destinationSha256: r.actual, bytes: r.bytes.length, operation: 'EXACT_COPY',
  originalControlVersionAndPathProvenancePreserved: r.name.endsWith('.json') }));
const syntax = baseline.syntax.map(r => {
  const file = path.join(root, r.relative), result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', shell: false, windowsHide: true });
  if (result.status !== 0 || result.error) fail('Syntax failure: ' + r.relative);
  return { relative: r.relative, sha256: sha(fs.readFileSync(file)), status: result.status, stdout: result.stdout,
    stderr: result.stderr, scope: r.scope, executed: false };
});
if (syntax.length !== 22) fail('Expected22 syntax checks');
const extraSyntax = extras.filter(r => r.name.endsWith('.mjs')).map(r => {
  const result = spawnSync(process.execPath, ['--check', r.destination], { encoding: 'utf8', shell: false, windowsHide: true });
  if (result.status !== 0 || result.error) fail('Extra syntax failure: ' + r.name);
  return { relative: r.name, sha256: r.destinationSha256, status: result.status, stdout: result.stdout, stderr: result.stderr, executed: false };
});
if (extraSyntax.length !== 3) fail('Expected3 extra syntax checks');
const exactInvariantChecks = files.filter(r => r.operation === 'EXACT_COPY').map(r => ({ relative: r.relative,
  sourceSha256: sha(fs.readFileSync(r.source)), destinationSha256: sha(fs.readFileSync(r.destination)),
  equal: fs.readFileSync(r.source).equals(fs.readFileSync(r.destination)) }));
if (!exactInvariantChecks.every(r => r.equal)) fail('Exact copy drift');
if (![...files, ...extras].every(r => sha(fs.readFileSync(r.source)) === r.sourceSha256)) fail('Original source control modified');
if (!priorFiles.every(r => sha(fs.readFileSync(path.join(root, r.relative))) === r.sha256)) fail('Existing draft/static destination modified');
const proofFile = path.resolve(root, '../../diagnostics/inherited-pr2-6ee40474/metadata-relocated.json');
const proofBytes = fs.readFileSync(proofFile);
if (sha(proofBytes) !== '112d6f63191c781df9d2ca6d99a2f228f299aae82e056e3bf1869ee70d50bb49') fail('Default proof drift');
const plans = ['blocking/plan.json', 'expanded/plan.json', 'expanded/repeated-plan.json', 'continuous-supplement/plan.json'].map(relative => {
  const bytes = fs.readFileSync(path.join(root, relative)), p = JSON.parse(bytes);
  return { relative, sha256: sha(bytes), sourceSha256: sha(fs.readFileSync(path.join(sourceRoot, relative))),
    freshVariants: p.freshVariants, plannedTurns: p.plannedTurns, variantCount: p.variants.length, specSha256: p.specSha256 };
});
const noRuns = ['blocking', 'expanded', 'continuous-supplement'].every(k => !fs.existsSync(path.join(root, k, 'runs')));
if (!noRuns) fail('Unexpected runs directory');
const report = {
  recordedAt: new Date().toISOString(), phase: 'PREP_ONLY_WAITING_ROOT_EXACT_COMMITTED_CANONICAL_AND_THIRTEEN_STRICT_INSTALLS_SIX_ACTUAL_CACHE_PYTHON',
  candidateVersion: '0.1.14', sourceRoot, sourceCanonical: '09c173a91e19c688a79420673ecc76ccd35c51f0', candidateCanonical: null,
  sourceInventory: { path: sourceInventoryFile, sha256: sha(sourceInventoryBytes), copy: 'provenance/source13-inventory.json', historicalVersionOnlyBaseline: true },
  sourceInventoryException: { ...exception, authorityFile: adaptationFile, authoritySha256: sha(adaptationBytes), carriedActualCurrentHelper: true },
  files, guardDiffs, extras, syntax, extraSyntax, exactInvariantChecks, plans,
  frozenCount: 30, versionGuardCount: 3, versionLastByteChanges: 9, extraCount: 5,
  previousDestinationFiles: priorFiles, previousDestinationUnchanged: true, draftFilesNotWrittenByCopier: true,
  oldInputsMaterialsPlansAndSpecUnchanged: true, sourceOldDirectoriesModified: false,
  collectionUnchanged: { plugins: 5, publicSkills: 7, explicit: 4, natural: 3, repoDevelopmentSkills: 20, strictInstallScenarios: 13, actualCachePythonRuns: 6 },
  defaultProof: { file: proofFile, sha256: sha(proofBytes), unchanged: true, copiedIntoControls: false },
  manualPolicy: 'Actual complete top-level heading plus one exact reader/task/question triplet; sourceTurn3 updated target and later selection history unchanged. No choose-first or nested-question ordinal inference.',
  chooseFirstPolicy: 'Historical helper preserved byte-for-byte and syntax parsed only. Never invoked for actual target selection.',
  pausePolicy: 'Normal turn/manual/variant boundary only; no kill, retry or resampling. Preserve any same-variant race chronologically.',
  fullReadPolicy: 'Require actual native full body or actual received successful full-file/chunk coverage; no prefix or self-report substitution.',
  intendedCoverage: baseline.intendedCoverage, behaviorStatus: 'NOT_RUN', clientUiStatus: 'NOT_RUN', effectStatus: 'NOT_MEASURED',
  installationInvoked: false, mirrorPrepared: false, cachePrepared: false, modelInvoked: false, gradeInvoked: false,
  repositoryModified: false, accountConfigReadOrWritten: false, noRunsDirectoryCreated: noRuns,
};
save('frozen-copy-inventory.json', report);
save('guard-version-diff.json', guardDiffs);
save('manual-extra-helper-copy-control.json', { recordedAt: new Date().toISOString(), phase: 'PREP_ONLY', sourceRoot,
  sourceOriginalControlSha256: sha(extraControlBytes), extraFiles: extras, extraSyntax, sourceProvenanceStringsPreserved: true });
save('copier-provenance.json', { recordedAt: new Date().toISOString(), phase: 'PREP_ONLY',
  method: 'New external byte copier following original13 copier; effective verify-canonical authority overlay explicitly carried before version substitution',
  sourceBuilder: { path: sourceBuilder, sha256: sha(sourceBuilderBytes), preservedCopy: 'provenance/source13-copier.mjs' },
  sourceExtraCopier: { path: sourceExtraCopier, sha256: sha(sourceExtraCopierBytes), preservedCopy: 'provenance/source13-extra-copier.mjs' },
  candidateCopierSha256: sha(fs.readFileSync(fileURLToPath(import.meta.url))), modelInputsOrHelperSemanticsChanged: false,
  sourceHistoricalInventoryUnmodified: sha(fs.readFileSync(sourceInventoryFile)) === sha(sourceInventoryBytes),
  sourceAdaptationUnmodified: sha(fs.readFileSync(adaptationFile)) === sha(adaptationBytes), outsideCoreVersionLiteralChanges: 0 });
save('preparation-verification.json', { recordedAt: new Date().toISOString(), phase: 'PREP_ONLY', candidateVersion: '0.1.14',
  frozenCopyCount: 30, versionGuardCount: 3, lastByteChanges: 9, syntaxCount: 22, extraFiles: 5, extraSyntaxCount: 3,
  syntaxPassed: true, exactFrozenAndExtraCopies: true, onlyVersionLiteralChanged: true, countsRemain13and6: true,
  priorDraftAndStaticFilesUnchanged: true, noInstallMirrorCacheModelGradeRepo: true, noRunsDirectoryCreated: true,
  inventorySha256: sha(fs.readFileSync(targetInventory)) });
write('README.md', '# 0.1.14 external reviewer controls\n\nPREP_ONLY. Thirty frozen controls and five supplemental manual controls are exact current0.1.13 byte copies. Only three guard files replace literal0.1.13 with0.1.14 (nine last-byte changes). The historical13 inventory remains preserved; its authorized engineering verifier exception is carried from actual d495615d source with13 strict installations and6 actual cache Python checks unchanged. All22 plus3 supplemental syntax checks pass.\n\nNo installation, mirror, cache, run, model or grade was invoked. Wait for Root exact committed14 canonical and actual13/6 strict engineering PASS. Inputs, criteria, default profile/proof, manual top-level target triplet selection, sourceTurn3 update and selection history remain unchanged. Never invoke choose-first. Stop normally at authorized boundaries; preserve raw failures/races without retry or process kill.\n\nCore14/30, affected6/12, repeated1/2 and continuous2/9 remain planned, then original remaining expanded paths. New behavior and UI NOT_RUN; real-world effect NOT_MEASURED. No inherited PASS.\n');
console.log(JSON.stringify({ root, phase: report.phase, inventorySha256: sha(fs.readFileSync(targetInventory)),
  frozenControls: 30, extraControls: 5, syntax: [22, 3], guardDiffs: guardDiffs.map(r => ({ relative: r.relative,
    originalSha256: r.originalSha256, newSha256: r.newSha256, actualDifferingByteOffsets: r.actualDifferingByteOffsets })),
  noInstallMirrorCacheModelGradeRepo: true }, null, 2));
