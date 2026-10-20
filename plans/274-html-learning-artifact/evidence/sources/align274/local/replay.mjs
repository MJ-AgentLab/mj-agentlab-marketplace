import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

// Replay using the frozen source or a byte-equivalent checkout; each run needs a new output root.
const worktree = 'C:/Users/Admin/.codex/worktrees/html-prompt-alignment/develop';
const skill = path.join(worktree, 'plugins/html-guide-kit/skills/site');
const source = path.join(skill, 'examples/representative');
const parent = 'C:/Users/Admin/.codex/worktrees/html-prompt-alignment/alignment-evidence/local-delivery';
const python = 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const expectedHead = 'b5b8300ae58e967e1d0013e66dc4f1208ac860ef';
const run = process.argv[2] ? path.resolve(process.argv[2]) : path.join(parent, `run-${new Date().toISOString().replace(/[:.]/g, '-')}`);
if (!run.startsWith(path.resolve(parent) + path.sep) || fs.existsSync(run)) throw new Error('Run must be a new independent directory below local-delivery');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const inventory = root => fs.readdirSync(root, { withFileTypes: true }).flatMap(e => {
  const p = path.join(root, e.name);
  if (e.isSymbolicLink()) throw new Error('Symlink rejected: ' + p);
  return e.isDirectory() ? inventory(p).map(x => ({ ...x, path: e.name + '/' + x.path })) : [{ path: e.name, bytes: fs.statSync(p).size, sha256: hash(fs.readFileSync(p)) }];
}).sort((a, b) => a.path.localeCompare(b.path));
const git = (...args) => {
  const p = spawnSync('git', args, { cwd: worktree, maxBuffer: 20 * 1024 * 1024 });
  return { args, exitCode: p.status, stdout: p.stdout.toString('utf8'), stderr: p.stderr.toString('utf8') };
};
const head = git('rev-parse', 'HEAD');
if (head.exitCode !== 0 || head.stdout.trim() !== expectedHead) throw new Error('Frozen candidate changed');
fs.mkdirSync(run);
const writeJSON = (name, obj) => fs.writeFileSync(path.join(run, name), JSON.stringify(obj, null, 2) + '\n', { flag: 'wx' });
const input = path.join(run, 'input'), output = path.join(run, 'site');
const start = new Date().toISOString();
const sourceBefore = inventory(source), skillBefore = inventory(skill);
const commands = [];
writeJSON('source-before.json', sourceBefore);
writeJSON('skill-before.json', skillBefore);
fs.cpSync(source, input, { recursive: true, errorOnExist: true, force: false });
const configPath = path.join(input, 'artifact.json');
const original = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const config = { ...original, theme: 'neutral' };
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
writeJSON('selection.json', { requestedAt: start, role: '/root/alignment_independent_review', mode: 'Agent synthetic confirmed local delivery exercise', source, theme: 'neutral', delivery: 'local-only', originals: 'read-only; independent working copy only', reused: { audience: config.audience, task: config.task, goals: config.goals, activities: config.activities.map(a => ({ id: a.id, correctIndex: a.correctIndex, reference: a.reference })) }, onlyConfigSemanticChange: 'theme=neutral', priorChoicesReused: true, mattRequired: false, sitesUsed: false });
function command(id, executable, args, timeout = 60000) {
  const startedAt = new Date().toISOString();
  const p = spawnSync(executable, args, { cwd: run, timeout, maxBuffer: 20 * 1024 * 1024, windowsHide: true });
  fs.writeFileSync(path.join(run, `${id}.stdout.txt`), p.stdout ?? Buffer.alloc(0), { flag: 'wx' });
  fs.writeFileSync(path.join(run, `${id}.stderr.txt`), p.stderr ?? Buffer.alloc(0), { flag: 'wx' });
  const record = { id, executable, args, cwd: run, startedAt, endedAt: new Date().toISOString(), exitCode: p.status, signal: p.signal, error: p.error ? String(p.error) : null, stdout: `${id}.stdout.txt`, stderr: `${id}.stderr.txt` };
  commands.push(record);
  writeJSON(`${id}.command.json`, record);
  console.log(JSON.stringify({ id, exitCode: record.exitCode, error: record.error, run }));
  return record;
}
try {
  const generated = command('01-generate', process.execPath, [path.join(skill, 'scripts/render-site.mjs'), '--input', input, '--output', output]);
  if (generated.exitCode !== 0) throw new Error('Generation failed; preserve evidence');
  const statics = command('02-static', python, [path.join(skill, 'scripts/check_artifact.py'), '--input', output, '--output', path.join(run, 'static-report.json')]);
  if (statics.exitCode !== 0) throw new Error('Static checks failed; preserve evidence');
  const browser = command('03-renderings', python, [path.join(skill, 'scripts/check_renderings.py'), '--input', output, '--screenshots', path.join(run, 'screenshots'), '--output', path.join(run, 'browser-report.json')], 60000);
  writeJSON('execution-result.json', { status: browser.exitCode === 0 ? 'LOCAL_GENERATION_AND_CHECKERS_PASS_PENDING_HUMAN_AGENT_REVIEW' : 'BROWSER_CHECK_NOT_PASS', browserExitCode: browser.exitCode });
} catch (error) {
  writeJSON('execution-error.json', { error: String(error), recordedAt: new Date().toISOString() });
  process.exitCode = 1;
} finally {
  const sourceAfter = inventory(source), skillAfter = inventory(skill);
  const afterHead = git('rev-parse', 'HEAD'), status = git('status', '--short');
  const state = { schemaVersion: 1, reader: '/root/alignment_independent_review', startedAt: start, endedAt: new Date().toISOString(), expectedHead, head, afterHead, gitStatus: status, python, node: process.execPath, run, sourceBefore, sourceAfter, originalSourceUnchanged: JSON.stringify(sourceBefore) === JSON.stringify(sourceAfter), installedSkillUnchanged: JSON.stringify(skillBefore) === JSON.stringify(skillAfter), commands, limitations: ['No actual Matt interview or native question', 'No Sites, CLI model or desktop matrix', 'Browser checker is bounded layout only; screenshot review separately recorded', 'No answer/copy/export/reset/keyboard/touch operations performed by this script', 'Effects NOT_MEASURED; protected approval/Owner acceptance independent'] };
  writeJSON('source-after.json', sourceAfter);
  writeJSON('skill-after.json', skillAfter);
  writeJSON('execution.json', state);
  console.log(JSON.stringify({ execution: path.join(run, 'execution.json'), originalSourceUnchanged: state.originalSourceUnchanged, installedSkillUnchanged: state.installedSkillUnchanged }));
}
