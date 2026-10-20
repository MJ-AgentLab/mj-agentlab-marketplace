import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = 'C:/Users/Admin/.codex/worktrees/html-prompt-alignment/develop';
const out = 'C:/Users/Admin/.codex/worktrees/html-prompt-alignment/alignment-evidence/independent';
const target = 'b5b8300ae58e967e1d0013e66dc4f1208ac860ef';
const base = 'a4892f51f4163fb5bd4457d99229eaf1a4683e8f';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const git = (...args) => {
  const p = spawnSync('git', args, { cwd: root, maxBuffer: 20 * 1024 * 1024 });
  return { args, exitCode: p.status, stdout: p.stdout?.toString('utf8') ?? '', stderr: p.stderr?.toString('utf8') ?? '' };
};
const rawGit = (...args) => {
  const p = spawnSync('git', args, { cwd: root, maxBuffer: 20 * 1024 * 1024 });
  if (p.status !== 0) throw new Error(p.stderr.toString('utf8'));
  return p.stdout;
};
const write = (name, data) => {
  const dest = path.join(out, name);
  if (fs.existsSync(dest)) throw new Error(`Refuse to overwrite ${dest}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, data);
};
const startedAt = new Date().toISOString();
const head = git('rev-parse', 'HEAD');
if (head.stdout.trim() !== target) throw new Error('Frozen candidate HEAD changed');
const siteFiles = rawGit('ls-tree', '-r', '--name-only', target, '--', 'plugins/html-guide-kit/skills/site').toString('utf8').trim().split(/\r?\n/);
const readFiles = [
  'AGENTS.md', '.agents/skills/mp-flow-self-review/SKILL.md',
  'docs/rule/[STANDARD]_Documentation_Framework.md', 'docs/rule/[STANDARD]_AI_Engineering_Intent.md',
  'plugins/html-guide-kit/plugin.json', 'plugins/html-guide-kit/README.md', 'plugins/html-guide-kit/CHANGELOG.md',
  'docs/spec/[SPEC]_HTML_Learning_Artifact.md', 'docs/guide/[GUIDE]_HTML_Learning_Artifact.md',
  'docs/adr/[ADR]_HTML_Learning_Artifact_Extension.md', 'docs/intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md',
  'docs/INDEX.md', 'docs/intent/INDEX.md', 'CHANGELOG.md',
  'plans/274-html-learning-artifact/INDEX.md', 'plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md',
  'plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md',
  'plans/274-html-learning-artifact/source-bindings.json',
  'plans/274-html-learning-artifact/evidence/sources/align274/owner-decision.txt',
  'plans/274-html-learning-artifact/evidence/sources/align274/baseline.json',
  'tests/html-site-checks.test.mjs', 'tests/html-site-render.test.mjs', 'tests/html-site-integration.test.mjs'
];
const selected = [...new Set([...siteFiles, ...readFiles])];
const fullReadSite = new Set(['SKILL.md', 'references/input-contract.md', 'references/execution-guide.md', 'references/sites-handoff.md', 'references/aics-principles.md', 'references/terminology.md', 'references/evidence-and-evaluation.md', 'references/checks.md', 'references/interaction-patterns.md', 'references/resource-provenance.json', 'agents/openai.yaml'].map(x => 'plugins/html-guide-kit/skills/site/' + x));
const resources = selected.map(relative => {
  const current = fs.readFileSync(path.join(root, relative));
  const blob = rawGit('show', `${target}:${relative}`);
  // Git source bytes and checkout bytes can differ by deterministic LF/CRLF.
  const normalized = b => b.toString('utf8').replace(/\r\n/g, '\n');
  const exact = current.equals(blob), checkoutEquivalent = normalized(current) === normalized(blob);
  if (!checkoutEquivalent) throw new Error('Not frozen candidate bytes: ' + relative);
  write('final-read-snapshot/' + relative, current);
  return { path: relative, bytes: current.length, sha256: sha(current), gitBlobBytes: blob.length, gitBlobSha256: sha(blob), exactGitBlobBytes: exact, deterministicCheckoutEquivalent: checkoutEquivalent, readingScope: fullReadSite.has(relative) ? 'Full actual text read' : relative.startsWith('plugins/html-guide-kit/skills/site/') ? 'Changed code read through diff or unchanged resource hash closure only; no runtime claim' : relative.includes('[REPORT]') || relative.endsWith('source-bindings.json') ? 'Relevant current sections/diff and source binding hashes; no claim to reread entire historical ledger' : 'Actual text or full affected diff read', snapshot: 'final-read-snapshot/' + relative };
});
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'plans/274-html-learning-artifact/evidence/sources/align274/baseline.json'), 'utf8'));
const checks = baseline.fullSourceLocalSnapshots.map(item => {
  const bytes = fs.readFileSync(item.path);
  return { name: 'Full source capture integrity', path: item.path, expectedBytes: item.bytes, actualBytes: bytes.length, expectedSha256: item.sha256, actualSha256: sha(bytes), status: item.bytes === bytes.length && item.sha256 === sha(bytes) ? 'PASS' : 'FAIL' };
});
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'plugins/html-guide-kit/skills/site/references/resource-provenance.json'), 'utf8'));
const prompt = fs.readFileSync(baseline.fullSourceLocalSnapshots[0].path);
checks.push({ name: 'Runtime provenance binds complete B2 capture', expectedSha256: provenance.methodRevisions[0].sha256, actualSha256: sha(prompt), status: provenance.methodRevisions[0].sha256 === sha(prompt) ? 'PASS' : 'FAIL' });
const guideDiff = git('diff', '--exit-code', base, target, '--', 'plugins/html-guide-kit/skills/guide');
checks.push({ name: 'Guide runtime preserved from fixed base', status: guideDiff.exitCode === 0 && !guideDiff.stdout ? 'PASS' : 'FAIL', raw: guideDiff });
const priorSpec = git('cat-file', '-e', `${base}:docs/spec/[SPEC]_HTML_Learning_Artifact.md`);
checks.push({ name: 'Old full SPEC recoverable at fixed base', status: priorSpec.exitCode === 0 ? 'PASS' : 'FAIL', raw: priorSpec });
const status = git('status', '--short');
checks.push({ name: 'Read-only candidate worktree clean at capture', status: status.exitCode === 0 && !status.stdout ? 'PASS' : 'FAIL', raw: status });
const promptSource = baseline.fullSourceLocalSnapshots[0];
const mattPath = 'C:/Users/Admin/.codex/plugins/cache/openai-curated-remote/mattpocock-skills/1.2.3/skills/grilling/SKILL.md';
const matt = fs.readFileSync(mattPath);
const externals = [{ path: promptSource.path, bytes: prompt.length, sha256: sha(prompt), readingScope: 'Complete B2 API text read; existing private source retained, not redistributed in this record' }, { path: mattPath, bytes: matt.length, sha256: sha(matt), readingScope: 'Actual current Matt SKILL read for compatibility review only, no interview' }];
const diff = git('diff', '--binary', base, target);
if (diff.exitCode !== 0) throw new Error('Diff capture failed');
write('candidate-base-to-final.patch', diff.stdout);
const endedAt = new Date().toISOString();
const report = { schemaVersion: 1, reviewer: '/root/alignment_independent_review', identity: 'Independent Agent synthetic reading reviewer; not actual Matt user interview, native UI, runtime, model or Sites acceptance', startedAt, endedAt, platform: process.platform, node: process.version, target, base, tree: git('rev-parse', `${target}^{tree}`), resources, externals, checks, finalHead: git('rev-parse', 'HEAD'), limitations: ['Initial findings were observed before root corrections; exact initial per-file hashes were not captured. Initial wording and report are preserved in review.json, not relabeled as final bytes.', 'These snapshots are frozen final-candidate bytes. Prior uncommitted tool outputs are not presented as final runtime evidence.', 'No generation, browser, full npm test, smoke, real interview, native window or external write executed by this reviewer.'] };
write('manifest.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ startedAt, endedAt, resources: resources.length, checks: checks.map(c => ({ name: c.name, status: c.status })), target, report: path.join(out, 'manifest.json') }, null, 2));
