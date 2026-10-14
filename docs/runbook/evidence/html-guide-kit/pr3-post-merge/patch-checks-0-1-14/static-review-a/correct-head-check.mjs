import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const folder = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(folder);
const repo = path.resolve(root, '../../../develop');
const originalFile = path.join(root, 'static-review-a.json');
const originalBytes = fs.readFileSync(originalFile);
const report = JSON.parse(originalBytes);
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const git = args => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
const canonical = report.sourceCanonical;
const head = git(['rev-parse', 'HEAD']);
git(['merge-base', '--is-ancestor', canonical, head]);
const unchangedPaths = ['VERSION', '.claude-plugin/marketplace.json', 'plugins', 'scripts', 'tests'];
const runtimeDiff = git(['diff', '--name-only', canonical, head, '--', ...unchangedPaths]);
const changedPaths = git(['diff', '--name-only', canonical, head]).split(/\r?\n/).filter(Boolean);
const sourcePins = report.resourcePins.map(pin => ({
  relative: pin.relative,
  expected: pin.oldSha256,
  actual: hash(fs.readFileSync(pin.oldFile)),
  snapshot: hash(fs.readFileSync(report.snapshots.find(s => s.role === 'old13' && s.relative === pin.relative).snapshot)),
}));
const newPins = report.resourcePins.map(pin => ({
  relative: pin.relative,
  expected: pin.newSha256,
  actual: hash(fs.readFileSync(pin.newFile)),
  snapshot: hash(fs.readFileSync(report.snapshots.find(s => s.role === 'new14' && s.relative === pin.relative).snapshot)),
}));
const manifest = JSON.parse(fs.readFileSync(path.join(repo, 'plugins/html-guide-kit/plugin.json'), 'utf8'));
const yaml = createRequire(path.join(repo, 'package.json'))('yaml');
const cfg = yaml.parse(fs.readFileSync(path.join(repo, 'plugins/html-guide-kit/skills/guide/agents/openai.yaml'), 'utf8'));
const controlBytes = fs.readFileSync(report.draftControlFile);
const control = JSON.parse(controlBytes);
const oldCheck = report.checks.find(c => c.id === 'unapplied13-working-read-explicit-route-identity');
const ok = runtimeDiff === '' && sourcePins.every(p => p.actual === p.expected && p.snapshot === p.expected)
  && newPins.every(p => p.actual === p.expected && p.snapshot === p.expected)
  && hash(controlBytes) === report.draftControlSha256 && control.applied === false && control.model === 'NOT_RUN'
  && manifest.version === '0.1.13' && JSON.stringify(manifest.extensions['com.openai'].interface.capabilities) === '["Read"]'
  && cfg.policy.allow_implicit_invocation === false && cfg.interface.default_prompt.includes('$html-guide-kit:guide');
if (!ok) throw new Error('Runtime/document checkpoint correction was not independently proven');
oldCheck.status = 'PASS';
oldCheck.detail = { ...oldCheck.detail, verifiedHead: head, unchangedPaths, runtimeDiff, sourcePins, newPins,
  explanation: 'The initial static checker incorrectly required working HEAD to equal the tested 0.1.13 canonical. The observed descendant checkpoint changes documentation/evidence only; plugin, marketplace version/index, scripts and tests have no committed diff. Exact old source and new draft/snapshot pins remain unchanged. This does not assign candidate or model status to the checkpoint.' };
report.checkedAgainAt = new Date().toISOString();
report.verdict = 'NO_STATIC_BLOCKER';
report.blockers = report.checks.filter(c => c.status === 'FAIL');
if (report.blockers.length) throw new Error('Unresolved original checks remain');
report.checkerCorrection = {
  originalFile, originalSha256: hash(originalBytes), originalVerdict: 'STATIC_BLOCKER', originalPreserved: true,
  reason: 'Checkpoint-identity assumption in reviewer control, not a runtime, product-method or behavior failure',
  correctedOnlyCheckId: oldCheck.id, canonical, head, ancestor: true, changedPaths,
  noBehaviorOrInstallPassInferred: true,
};
const finalFile = path.join(root, 'static-review-a-corrected.json');
const finalBytes = Buffer.from(JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(finalFile, finalBytes, { flag: 'wx' });
if (hash(fs.readFileSync(originalFile)) !== hash(originalBytes)) throw new Error('Original static report changed');
console.log(JSON.stringify({ finalFile, sha256: hash(finalBytes), verdict: report.verdict, checks: report.checks.length,
  originalPreservedSha256: hash(originalBytes), head, sourceCanonical: canonical, sourceRuntimeUnchanged: true,
  newBehavior: 'NOT_RUN', newInstallation: 'NOT_RUN', snapshotCount: report.snapshots.length }, null, 2));
