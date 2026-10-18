import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const REPO = process.argv[2];
const SHA = process.argv[3] ?? '748ac556d30cb086f4a505e22a5aa754f0dc52ae';
const RUN = path.join(ROOT, SHA.slice(0, 8));
const FIXED = path.join(RUN, 'fixed');
fs.mkdirSync(path.join(FIXED, 'scripts'), { recursive: true });
const pinned = {};
for (const rel of ['scripts/document-harness.mjs', 'scripts/intent-harness.mjs', 'scripts/frozen-evidence-resources.mjs']) {
  const bytes = execFileSync('git', ['show', `${SHA}:${rel}`], { cwd: REPO });
  fs.writeFileSync(path.join(FIXED, rel), bytes);
  pinned[rel] = crypto.createHash('sha256').update(bytes).digest('hex');
}
fs.mkdirSync(path.join(FIXED, 'node_modules'), { recursive: true });
fs.cpSync(fs.realpathSync(path.join(REPO, 'node_modules/yaml')), path.join(FIXED, 'node_modules/yaml'), { recursive: true });
const { validateDocumentation, collectNavigationResources } = await import(pathToFileURL(path.join(FIXED, 'scripts/document-harness.mjs')));
const compatPath = 'docs/_meta/document-layer-compatibility.json';
const compat = execFileSync('git', ['show', `${SHA}:${compatPath}`], { cwd: REPO });
const original = 'docs/intent/[INTENT]_INT-2026-001_Independent.md';
const archive = 'docs/archive/[DEPRECATED]_[INTENT]_INT-2026-001_Independent.md';
let n = 0;
const results = [];
function write(root, rel, bytes) { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), bytes); }
function ordinary(type, layer = 'canonical', extra = '', body = '# Independent fixture\n') {
  return `---\ntype: ${type}\nscope: marketplace\nsummary: Independent acceptance fixture\nowner: independent-agent\ncreated: 2026-10-19\nupdated: 2026-10-19\nstate: active\nversion: v1.0\nlayer: ${layer}\n${extra}---\n\n${body}`;
}
function intent({ id = 'INT-2026-001', state = 'draft', link = '', updated = '2026-10-19' } = {}) {
  return ordinary('intent', 'canonical', `intent-id: ${id}\n`, `# Original\n\n| 字段 | 内容 |\n|---|---|\n| 提出者 | Synthetic requester; no real decision |\n| 原始来源 | Complete synthetic input ${link} |\n| 接受责任人 | Unknown; fixture only |\n| 原意核对记录 | Not supplied |\n| 内容接受记录 | Not accepted |\n| 当前内容与适用基线 | Full fixture bytes, not a real accepted baseline |\n| 主跟踪 Issue | None; synthetic fixture |\n\n## 1. 问题与现状\n\nExisting behavior loses a required distinction.\n\n## 2. 期望结果\n\nPreserve the requirement's original meaning.\n\n## 3. 成功判断\n\nUnknown threshold; do not invent one.\n\n## 4. 范围与约束\n\nFixture only.\n\n## 5. 未决项\n\nNo business acceptance supplied.\n`).replace('state: active', `state: ${state}`).replace('updated: 2026-10-19', `updated: ${updated}`);
}
function fixture(name, { archived = false } = {}) {
  const root = path.join(RUN, `fixture-${String(++n).padStart(2, '0')}-${name}`);
  write(root, compatPath, compat);
  write(root, archived ? archive : original, intent({ state: archived ? 'archived' : 'draft' }));
  write(root, 'docs/intent/INDEX.md', ordinary('guide', 'canonical', '', `[Original](${archived ? '../archive/' : './'}${path.posix.basename(archived ? archive : original)})\n`));
  return root;
}
function test(name, expected, run) {
  try {
    const actual = run();
    const met = expected(actual);
    results.push({ name, expected: expected.toString(), met, actual });
  } catch (error) { results.push({ name, met: false, error: { name: error.name, message: error.message, stack: error.stack } }); }
}
const fail = value => value.ok === false;

test('S6-control-valid-draft', r => r.ok === true && r.intents.identities === 1, () => validateDocumentation(fixture('valid')));
test('S6-archive-id-reserved', fail, () => { const root = fixture('duplicate'); write(root, archive, intent({ state: 'archived' })); return validateDocumentation(root); });
test('S6-stable-archive-only', r => r.ok === true && r.intents.identities === 1, () => validateDocumentation(fixture('archive-only', { archived: true })));
test('S6-filename-id-mismatch', fail, () => { const root = fixture('mismatch'); write(root, original, intent({ id: 'INT-2026-002' })); return validateDocumentation(root); });
test('S6-unclosed-frontmatter-unmarked-archive', fail, () => { const root = fixture('unclosed'); write(root, 'docs/archive/unmarked.md', '---\ntype: intent\nintent-id: INT-2026-001\n'); return validateDocumentation(root); });
test('S6-uppercase-markdown-declaration', fail, () => { const root = fixture('uppercase'); write(root, 'docs/archive/unmarked.MD', intent()); return validateDocumentation(root); });
test('S6-bin-extension-declaration', fail, () => { const root = fixture('binary-extension'); write(root, 'docs/archive/unmarked.bin', intent()); return validateDocumentation(root); });
test('S6-index-omits-existing-original', fail, () => { const root = fixture('index-omission'); write(root, 'docs/intent/INDEX.md', ordinary('guide', 'canonical', '', '# Empty navigation\n')); return validateDocumentation(root); });
test('S7-single-file-sees-archive-duplicate', r => !r.ok && r.validationScope === 'complete-formal-collection' && r.errors.some(e => e.includes('duplicate INTENT identity')), () => { const root = fixture('single-file'); write(root, archive, intent({ state: 'deprecated' })); return validateDocumentation(root, { file: original }); });
test('S7-single-file-read-failure-is-incomplete', r => !r.ok && r.intents.uniqueness.complete === false && r.intents.uniqueness.checked === false, () => {
  const root = fixture('read-failure'); write(root, archive, intent({ state: 'deprecated' }));
  const read = fs.readFileSync;
  fs.readFileSync = (file, ...args) => { if (path.resolve(file) === path.join(root, archive)) throw new Error('independent synthetic EACCES'); return read(file, ...args); };
  try { return validateDocumentation(root, { file: original }); } finally { fs.readFileSync = read; }
});
test('S7-single-file-scan-failure-is-incomplete', r => !r.ok && r.intents.uniqueness.complete === false && r.intents.uniqueness.checked === false, () => {
  const root = fixture('scan-failure'); const scan = fs.readdirSync;
  fs.readdirSync = (file, ...args) => { if (path.resolve(file) === path.join(root, 'docs/intent')) throw new Error('independent synthetic scan EACCES'); return scan(file, ...args); };
  try { return validateDocumentation(root, { file: original }); } finally { fs.readdirSync = scan; }
});
test('S8-cli-structured-invalid-id-exits-one', r => r.status === 1 && r.parsed?.ok === false, () => {
  const root = fixture('cli-bad-id'); write(root, original, intent({ id: 'INT-2026-000' }));
  const proc = spawnSync(process.execPath, [path.join(FIXED, 'scripts/document-harness.mjs'), root, '--file', original], { encoding: 'utf8', windowsHide: true });
  return { status: proc.status, stdout: proc.stdout, stderr: proc.stderr, parsed: JSON.parse(proc.stdout) };
});
test('S8-cli-valid-exits-zero-with-no-acceptance-claim', r => r.status === 0 && r.parsed?.ok === true && !/accepted|approved/i.test(r.stdout), () => {
  const root = fixture('cli-good'); const proc = spawnSync(process.execPath, [path.join(FIXED, 'scripts/document-harness.mjs'), root], { encoding: 'utf8', windowsHide: true });
  return { status: proc.status, stdout: proc.stdout, stderr: proc.stderr, parsed: JSON.parse(proc.stdout) };
});
test('S8-current-link-missing-fails', fail, () => { const root = fixture('current-missing'); write(root, original, intent({ link: '[source](../spec/missing.md)' })); return validateDocumentation(root); });
test('S8-archived-link-missing-fails', fail, () => { const root = fixture('archive-missing', { archived: true }); write(root, archive, intent({ state: 'archived', link: '[source](../spec/missing.md)' })); return validateDocumentation(root); });
test('S8-archive-closure-retains-linked-source-bytes', r => r.before.ok && r.resources.includes('docs/spec/[SPEC]_Independent_Source.md') && r.copiedSource, () => {
  const root = fixture('archive-closure', { archived: true });
  const source = 'docs/spec/[SPEC]_Independent_Source.md';
  write(root, archive, intent({ state: 'archived', link: '[source](../spec/[SPEC]_Independent_Source.md)' }));
  write(root, source, ordinary('spec', 'canonical', '', '# Full original evidence\n\nRecovered exact content.\n'));
  write(root, 'AGENTS.md', '[Intent navigation](./docs/intent/INDEX.md)\n');
  const before = validateDocumentation(root), resources = collectNavigationResources(root, ['AGENTS.md']);
  const projection = path.join(RUN, 'archive-projection');
  for (const rel of resources) { const file = path.join(root, rel); if (fs.statSync(file).isDirectory()) fs.mkdirSync(path.join(projection, rel), { recursive: true }); else write(projection, rel, fs.readFileSync(file)); }
  write(projection, compatPath, compat);
  return { before, resources, copiedSource: fs.existsSync(path.join(projection, source)), after: validateDocumentation(projection) };
});
test('S8-full-snapshot-recovery-and-tamper', r => r.before.ok && !r.after.ok && r.unchanged && r.recovered === r.original, () => {
  const root = fixture('snapshot'); const task = 'plans/263-intent-independent'; const snap = `${task}/evidence/sources/accepted-original.txt`;
  const bytes = fs.readFileSync(path.join(root, original));
  const fields = 'task: 263-intent-independent\ntracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/263\n';
  write(root, `${task}/INDEX.md`, ordinary('guide', 'working', `${fields}plan: ./[PLAN]_Independent.md\ncanonical:\n  - ../../${original}\nsources: ./source-bindings.json\n`, '[Source bindings](./source-bindings.json)\n'));
  write(root, `${task}/[PLAN]_Independent.md`, ordinary('plan', 'working', fields));
  write(root, snap, bytes);
  const binding = { schemaVersion: 1, task: '263-intent-independent', sources: [{ id: 'old-issue-original', kind: 'snapshot', path: 'evidence/sources/accepted-original.txt', original: 'synthetic old Issue complete text; no real acceptance', sha256: crypto.createHash('sha256').update(bytes).digest('hex'), purpose: 'Recover complete old content after issue editing', scope: 'Independent fixture' }] };
  write(root, `${task}/source-bindings.json`, JSON.stringify(binding));
  write(root, original, intent({ updated: '2026-10-20' }).replace('Preserve the requirement', 'Changed requirement: preserve the requirement'));
  const before = validateDocumentation(root), recovered = fs.readFileSync(path.join(root, snap), 'utf8');
  const unchanged = recovered === bytes.toString('utf8');
  fs.appendFileSync(path.join(root, snap), '\nTAMPERED\n');
  return { before, after: validateDocumentation(root), original: bytes.toString('utf8'), recovered, unchanged };
});

test('S6-index-registers-original-exactly-once', fail, () => {
  const root = fixture('duplicate-registration');
  write(root, 'docs/intent/INDEX.md', ordinary('guide', 'canonical', '', `[Original](./${path.posix.basename(original)})\n[Again](./${path.posix.basename(original)})\n`));
  return validateDocumentation(root);
});
test('S6-identity-declaration-without-type-cannot-hide', fail, () => {
  const root = fixture('identity-no-type');
  write(root, 'docs/archive/unmarked.dat', intent().replace('type: intent\n', ''));
  return validateDocumentation(root);
});
test('S8-archived-complete-baseline-binding-projects-exact-source', r => r.before.ok && r.after.ok && r.resources.includes(r.snapshot) && r.equalBytes, () => {
  const root = fixture('archive-snapshot-closure', { archived: true });
  const task = 'plans/263-archive-independent';
  const snapshot = `${task}/evidence/sources/accepted-issue-body.txt`;
  const fullContent = 'Complete original Issue before later editing.\r\nTwo accepted criteria and one explicitly uncovered criterion.\r\n';
  const fields = 'task: 263-archive-independent\ntracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/263\n';
  write(root, `${task}/INDEX.md`, ordinary('guide', 'working', `${fields}plan: ./[PLAN]_Independent.md\ncanonical:\n  - ../../docs/rule/[STANDARD]_Independent.md\nsources: ./source-bindings.json\n`, '[Bound sources](./source-bindings.json)\n'));
  write(root, `${task}/[PLAN]_Independent.md`, ordinary('plan', 'working', fields, '# Plan\n\n[Accepted baseline](./source-bindings.json)\n'));
  write(root, 'docs/rule/[STANDARD]_Independent.md', ordinary('standard'));
  write(root, snapshot, fullContent);
  write(root, `${task}/source-bindings.json`, JSON.stringify({ schemaVersion: 1, task: '263-archive-independent', sources: [{ id: 'old-complete-issue', kind: 'snapshot', path: 'evidence/sources/accepted-issue-body.txt', original: 'synthetic edited Issue prior body', sha256: crypto.createHash('sha256').update(fullContent).digest('hex'), purpose: 'Complete recoverable baseline, not a hash-only acceptance', scope: 'Independent fixture' }] }));
  write(root, archive, intent({ state: 'archived', link: '[Full baseline](../../plans/263-archive-independent/source-bindings.json)' }));
  write(root, 'AGENTS.md', '[Navigation](./docs/intent/INDEX.md)\n');
  const before = validateDocumentation(root), resources = collectNavigationResources(root, ['AGENTS.md', `${task}/INDEX.md`, `${task}/[PLAN]_Independent.md`, compatPath]);
  const projection = path.join(RUN, 'archive-full-baseline-projection');
  for (const rel of resources) { const file = path.join(root, rel); if (fs.statSync(file).isDirectory()) fs.mkdirSync(path.join(projection, rel), { recursive: true }); else write(projection, rel, fs.readFileSync(file)); }
  return { before, after: validateDocumentation(projection), resources, snapshot, equalBytes: fs.existsSync(path.join(projection, snapshot)) && fs.readFileSync(path.join(projection, snapshot)).equals(Buffer.from(fullContent)) };
});

test('S6-unresolved-unrelated-alias-does-not-hide-type-alias', r => r.variants.every(v => !v.result.ok), () => {
  const variants = [];
  for (const [name, metadata] of [
    ['type-alias', 'kind: &kind intent\ntype: *kind\nunrelated: *missing\n'],
    ['merge-with-broken-alias', 'base: &base {type: intent}\n<<: *base\nunrelated: *missing\n'],
    ['broken-alias-first', 'unrelated: *missing\nkind: &kind intent\ntype: *kind\n'],
  ]) {
    const root = fixture(`alias-${name}`);
    write(root, 'docs/archive/unmarked.bin', `---\n${metadata}---\n`);
    variants.push({ name, input: metadata, result: validateDocumentation(root) });
  }
  return { variants };
});

const report = { rubric: 'INTENT-IA-R1', scenarioScope: ['S6', 'S7', 'S8'], implementation: SHA, capturedAt: new Date().toISOString(), probeAuthor: '/root/latest_intent_fit', independent: true, pinned, fixturesRetained: RUN, total: results.length, met: results.filter(r => r.met).length, failed: results.filter(r => !r.met).length, results };
fs.writeFileSync(path.join(RUN, 'probe-results.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, results: results.map(r => ({ name: r.name, met: r.met, error: r.error?.message, errors: r.actual?.errors, resources: r.actual?.resources })) }, null, 2));
process.exitCode = report.failed ? 1 : 0;
