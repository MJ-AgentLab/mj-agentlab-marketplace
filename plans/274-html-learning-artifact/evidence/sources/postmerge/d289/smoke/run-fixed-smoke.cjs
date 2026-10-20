const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const evidence = __dirname;
const config = JSON.parse(fs.readFileSync(path.join(evidence, 'run-config.json'), 'utf8'));
const { repository, primary, ownerOriginal, canonicalSha, canonicalTree, expectedHead, expectedTree, shortTemp, python } = config;
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const write = (name, value) => fs.writeFileSync(path.join(evidence, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
const normalized = value => path.resolve(value).replaceAll('\\', '/').toLowerCase();
const sameReal = (a, b) => normalized(fs.realpathSync.native(a)) === normalized(fs.realpathSync.native(b));
const git = (cwd, ...args) => {
  const result = cp.spawnSync('git', args, { cwd, windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw result.error || new Error(result.stderr.toString());
  return result.stdout;
};
function snapshot(prefix) {
  const result = {
    capturedAt: new Date().toISOString(),
    primaryHead: git(primary, 'rev-parse', 'HEAD').toString().trim(),
    primaryStatusBase64: git(primary, 'status', '--porcelain=v1', '--untracked-files=all', '-z').toString('base64'),
    ownerOriginalSha256: hash(fs.readFileSync(ownerOriginal)),
    head: git(repository, 'rev-parse', 'HEAD').toString().trim(),
    tree: git(repository, 'rev-parse', 'HEAD^{tree}').toString().trim(),
    statusBase64: git(repository, 'status', '--porcelain=v1', '--untracked-files=all', '-z').toString('base64'),
    worktreesBase64: git(repository, 'worktree', 'list', '--porcelain', '-z').toString('base64'),
    shortTemp: fs.realpathSync.native(shortTemp),
    shortTempChildren: fs.readdirSync(shortTemp).sort(),
  };
  fs.writeFileSync(path.join(evidence, prefix + '-worktrees.bin'), Buffer.from(result.worktreesBase64, 'base64'), { flag: 'wx' });
  write(prefix + '-snapshot.json', result);
  return result;
}
function ownedRootsFromMetrics(records) {
  const owned = new Map();
  const add = (root, kind, observedFrom, metric) => {
    const expectedPrefix = { canonical: 'release-install-', template: 'marketplace-smoke-source-', scenario: 'marketplace-smoke-' }[kind];
    const directChild = normalized(path.dirname(root)) === normalized(fs.realpathSync.native(shortTemp));
    const boundaryVerified = directChild && path.basename(root).startsWith(expectedPrefix);
    const previous = owned.get(normalized(root));
    if (previous && previous.kind !== kind) throw new Error('owned root kind collision');
    owned.set(normalized(root), { root, kind, observedFrom, metricStatus: metric.status, boundaryVerified, existsAfter: fs.existsSync(root), checkedAt: new Date().toISOString() });
  };
  for (const metric of records) {
    if (metric.phase !== 'copy' || !metric.details?.destinationRoot) continue;
    if (metric.details.stage === 'template') {
      const destination = path.resolve(metric.details.destinationRoot);
      if (path.basename(destination) !== 'template') throw new Error('template destination basename differs');
      add(path.dirname(destination), 'template', 'copy destinationRoot/template', metric);
      const canonicalDirectory = path.resolve(metric.details.sourceRoot);
      if (path.basename(canonicalDirectory) !== 'canonical') throw new Error('canonical source directory basename differs');
      add(path.dirname(canonicalDirectory), 'canonical', 'template copy original sourceRoot/canonical', metric);
    } else if (metric.details.stage === 'scenario') {
      const destination = path.resolve(metric.details.destinationRoot);
      if (path.basename(destination) !== 'src') throw new Error('scenario destination basename differs');
      add(path.dirname(destination), 'scenario', 'scenario copy destinationRoot/src', metric);
    }
  }
  return [...owned.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.root.localeCompare(b.root));
}
async function main() {
  if (fs.existsSync(path.join(evidence, 'run-result.json')) || fs.existsSync(path.join(evidence, 'stdout.log'))) throw new Error('refusing to overwrite prior smoke run');
  if (!sameReal(os.tmpdir(), shortTemp) || !sameReal(process.env.TEMP, shortTemp) || !sameReal(process.env.TMP, shortTemp)) throw new Error('outer process TEMP/TMP/os.tmpdir mismatch');
  if (fs.lstatSync(shortTemp).isSymbolicLink() || fs.readdirSync(shortTemp).length) throw new Error('dedicated short TEMP must be ordinary and empty');
  const before = snapshot('before');
  if (before.head !== expectedHead || before.tree !== expectedTree || before.statusBase64) throw new Error('fixed host identity/clean guard differs');
  if (before.ownerOriginalSha256 !== 'dc9d58437778093ae9b51d052908712a3bbb2624f16ff335f5210435ca2f0895') throw new Error('Owner original differs');
  if (git(repository, 'rev-parse', canonicalSha + '^{commit}').toString().trim() !== canonicalSha || git(repository, 'rev-parse', canonicalSha + '^{tree}').toString().trim() !== canonicalTree) throw new Error('fixed canonical identity/tree differs');
  if (!git(repository, 'rev-parse', 'HEAD:scripts').equals(git(repository, 'rev-parse', canonicalSha + ':scripts'))) throw new Error('host imported verification scripts differ from fixed canonical scripts');
  const spawn = createRequire(path.join(repository, 'package.json'))('cross-spawn');
  const cli = spawn.sync('codex', ['--version'], { cwd: repository, env: process.env, encoding: 'utf8', windowsHide: true });
  const py = cp.spawnSync(python, ['-c', 'import json,sys;print(json.dumps({"executable":sys.executable,"version":sys.version}))'], { cwd: repository, env: process.env, encoding: 'utf8', windowsHide: true });
  const pathPython = spawn.sync('python', ['-c', 'import sys;print(sys.executable)'], { cwd: repository, env: process.env, encoding: 'utf8', windowsHide: true });
  write('tools.json', { node: process.execPath, nodeVersion: process.version, cli: { status: cli.status, stdout: cli.stdout, stderr: cli.stderr }, python: { status: py.status, stdout: py.stdout, stderr: py.stderr }, pathPython: { status: pathPython.status, stdout: pathPython.stdout, stderr: pathPython.stderr } });
  if (cli.status !== 0 || cli.stdout.trim() !== 'codex-cli 0.147.0' || py.status !== 0 || pathPython.status !== 0 || !sameReal(pathPython.stdout.trim(), python)) throw new Error('actual CLI/Python baseline differs');
  const stdout = fs.openSync(path.join(evidence, 'stdout.log'), 'wx');
  const stderr = fs.openSync(path.join(evidence, 'stderr.log'), 'wx');
  const startedAt = new Date().toISOString();
  const command = { executable: process.execPath, args: [path.join(evidence, 'run-canonical.mjs')], cwd: repository, canonicalSha, canonicalTree, expectedHead, expectedTree, allowVersionDrift: false, keepRoot: false, processEnvironment: { TEMP: process.env.TEMP, TMP: process.env.TMP, outerOsTmpdir: os.tmpdir(), pathPython: pathPython.stdout.trim(), MJ_PERF_DIR: process.env.MJ_PERF_DIR }, startedAt, noModelBrowserGuiDesktopNativeWindowOrSitesRun: true };
  write('command.json', command);
  const child = spawn(process.execPath, command.args, { cwd: repository, env: process.env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  write('run-state-start.json', { status: 'RUNNING', startedAt, childPid: child.pid, parentPid: process.pid });
  child.stdout.on('data', bytes => fs.writeSync(stdout, bytes));
  child.stderr.on('data', bytes => fs.writeSync(stderr, bytes));
  child.once('error', error => fs.writeSync(stderr, Buffer.from('\nSPAWN ERROR: ' + error.stack + '\n')));
  const ending = await new Promise(resolve => child.once('close', (exitCode, signal) => resolve({ exitCode, signal })));
  fs.closeSync(stdout); fs.closeSync(stderr);
  const finishedAt = new Date().toISOString();
  const after = snapshot('after');
  const stdoutBytes = fs.readFileSync(path.join(evidence, 'stdout.log'));
  const stderrBytes = fs.readFileSync(path.join(evidence, 'stderr.log'));
  const result = { startedAt, finishedAt, canonicalSha, canonicalTree, ...ending, guards: { hostHeadTreePreserved: before.head === after.head && before.tree === after.tree, hostCleanPreserved: before.statusBase64 === '' && after.statusBase64 === '', primaryPreserved: before.primaryHead === after.primaryHead && before.primaryStatusBase64 === after.primaryStatusBase64, ownerOriginalPreserved: before.ownerOriginalSha256 === after.ownerOriginalSha256, fullWorktreeInventoryPreserved: before.worktreesBase64 === after.worktreesBase64, outerAndChildSameTemporaryRoot: sameReal(os.tmpdir(), shortTemp) && sameReal(process.env.TEMP, shortTemp) && sameReal(process.env.TMP, shortTemp), shortTempEmpty: after.shortTempChildren.length === 0 }, stdout: { bytes: stdoutBytes.length, sha256: hash(stdoutBytes) }, stderr: { bytes: stderrBytes.length, sha256: hash(stderrBytes) }, cleanup: { checked: false, manualRootCleanupPerformed: false } };
  try {
    if (ending.exitCode === 0) {
      const raw = stdoutBytes.toString('utf8');
      const report = JSON.parse(raw.slice(raw.indexOf('{')));
      write('smoke-report.json', report);
      const scenarios = report.scenarios;
      if (!Array.isArray(scenarios)) throw new Error('no scenario array');
      const commands = scenarios.flatMap((scenario, index) => scenario.commands.map(item => ({ scenario: index + 1, installed: scenario.installed, ...item })));
      write('commands.json', commands);
      result.summary = { scenarios: scenarios.length, scenariosPass: scenarios.filter(x => x.ok === true).length, commands: commands.length, commandsZero: commands.filter(x => x.status === 0).length, versions: [...new Set(scenarios.map(x => x.version))], diagram: scenarios.filter(x => x.diagramValidation).length, learningEvidence: scenarios.filter(x => x.learningEvidenceValidation).length, site: scenarios.filter(x => x.siteValidation).length, siteStatic: scenarios.filter(x => x.siteValidation).map(x => x.siteValidation.checked.summary) };
    }
    const performanceFiles = fs.existsSync(process.env.MJ_PERF_DIR) ? fs.readdirSync(process.env.MJ_PERF_DIR).filter(name => name.endsWith('.ndjson')) : [];
    const records = performanceFiles.flatMap(name => fs.readFileSync(path.join(process.env.MJ_PERF_DIR, name), 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)));
    const roots = ownedRootsFromMetrics(records);
    write('owned-roots-absence.json', roots);
    result.cleanup = { checked: roots.length > 0, roots: roots.length, canonical: roots.filter(x => x.kind === 'canonical').length, template: roots.filter(x => x.kind === 'template').length, scenarios: roots.filter(x => x.kind === 'scenario').length, allBoundariesVerified: roots.every(x => x.boundaryVerified), allAbsent: roots.every(x => !x.existsAfter), manualRootCleanupPerformed: false, performanceFiles };
    result.guards.exactFifteenRootsAndAbsence = roots.length === 15 && result.cleanup.canonical === 1 && result.cleanup.template === 1 && result.cleanup.scenarios === 13 && result.cleanup.allBoundariesVerified && result.cleanup.allAbsent;
  } catch (error) { result.evidenceAnalysisError = error.stack; }
  result.overall = ending.exitCode === 0 && !result.evidenceAnalysisError && Object.values(result.guards).every(Boolean) ? 'PASS_PENDING_INDEPENDENT_AUDIT' : 'FAIL';
  write('run-result.json', result);
  write('run-state-complete.json', { status: 'COMPLETE', finishedAt, ...ending, overall: result.overall });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.overall === 'PASS_PENDING_INDEPENDENT_AUDIT' ? 0 : 1;
}
main().catch(error => { if (!fs.existsSync(path.join(evidence, 'driver-failure.json'))) write('driver-failure.json', { failedAt: new Date().toISOString(), error: error.stack }); console.error(error.stack); process.exitCode = 1; });
