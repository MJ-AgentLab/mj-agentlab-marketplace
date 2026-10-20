const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const repository = 'C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop';
const evidence = __dirname;
const expectedHead = 'cfbeb1bbf3e254ea3b33f5abe9c3eb5207c605a7';
const canonicalSha = 'fdede3cf5578dee8a41aef4310a9387d695c56bd';
const expectedTag = 'v8.3.3';
const expectedTree = 'f71963c1d5640933e80fccfec3383681fb15333b';
const pythonDirectory = 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const write = (name, value) => fs.writeFileSync(path.join(evidence, name), JSON.stringify(value, null, 2) + '\n');
const git = (...args) => {
  const result = cp.spawnSync('git', args, { cwd: repository, encoding: 'utf8', windowsHide: true });
  if (result.error || result.status !== 0) throw result.error || new Error(result.stderr);
  return result.stdout;
};
const primary = 'D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop';
const ownerOriginal = path.join(primary, 'HTML-Learning-Artifact-Plugin-Implementation-Plan.md');
const primaryGit = (...args) => { const r = cp.spawnSync('git', args, { cwd: primary, encoding: 'utf8', windowsHide: true }); if (r.error || r.status !== 0) throw r.error || new Error(r.stderr); return r.stdout; };
const snapshot = prefix => {
  const result = { capturedAt: new Date().toISOString(), primaryHead: primaryGit('rev-parse', 'HEAD').trim(), primaryStatus: primaryGit('status', '--porcelain=v1'), ownerOriginalSha256: hash(fs.readFileSync(ownerOriginal)), head: git('rev-parse', 'HEAD').trim(), tree: git('rev-parse', 'HEAD^{tree}').trim(), status: git('status', '--porcelain=v1'), worktrees: git('worktree', 'list', '--porcelain') };
  fs.writeFileSync(path.join(evidence, prefix + '-worktrees.txt'), result.worktrees);
  write(prefix + '-snapshot.json', result);
  return result;
};

function scenariosCanonicalRoots(records) { return records.filter(record => record.phase === 'copy' && record.details?.stage === 'template' && record.details?.sourceRoot).map(record => path.dirname(record.details.sourceRoot)).filter(root => path.basename(root).startsWith('release-install-')); }
fs.mkdirSync(evidence, { recursive: true });
if (fs.existsSync(path.join(evidence, 'run-result.json')) || fs.existsSync(path.join(evidence, 'stdout.log'))) throw new Error('refusing to overwrite prior smoke evidence');
const before = snapshot('before');
if (before.head !== expectedHead || before.tree !== expectedTree || before.status) throw new Error('frozen candidate or clean-worktree precondition differs');
if (before.ownerOriginalSha256 !== 'dc9d58437778093ae9b51d052908712a3bbb2624f16ff335f5210435ca2f0895') throw new Error('Owner original source changed before smoke');
const observedTagSha = git('rev-parse', expectedTag + '^{commit}').trim();
const canonicalTree = git('rev-parse', canonicalSha + '^{tree}').trim();
if (observedTagSha !== canonicalSha || canonicalTree !== expectedTree) throw new Error('actual published tag identity/tree differs');
const env = { ...process.env, PATH: pythonDirectory + path.delimiter + process.env.PATH, MJ_PERF_DIR: path.join(evidence, 'perf') };
const requireAtRepository = createRequire(path.join(repository, 'package.json'));
const spawn = requireAtRepository('cross-spawn');
const stdout = fs.openSync(path.join(evidence, 'stdout.log'), 'wx');
const stderr = fs.openSync(path.join(evidence, 'stderr.log'), 'wx');
const startedAt = new Date().toISOString();
const command = { executable: process.execPath, args: [path.join(evidence, 'run-canonical.mjs')], observedTag: expectedTag, observedTagSha, canonicalTree, cwd: repository, keepRoot: false, allowVersionDrift: false, processEnvironmentChanges: { pathPrefix: pythonDirectory, MJ_PERF_DIR: env.MJ_PERF_DIR }, startedAt, expectedHead, expectedTree, noModelDesktopOrSitesRun: true };
write('command.json', command);
const child = spawn(process.execPath, [path.join(evidence, 'run-canonical.mjs')], { cwd: repository, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
write('run-state.json', { status: 'RUNNING', startedAt, childPid: child.pid, parentPid: process.pid });
child.stdout.on('data', chunk => fs.writeSync(stdout, chunk));
child.stderr.on('data', chunk => fs.writeSync(stderr, chunk));
child.once('error', error => fs.writeSync(stderr, Buffer.from('\nSPAWN ERROR: ' + error.stack + '\n')));
child.once('close', (exitCode, signal) => {
  fs.closeSync(stdout);
  fs.closeSync(stderr);
  const finishedAt = new Date().toISOString();
  const after = snapshot('after');
  const stdoutBytes = fs.readFileSync(path.join(evidence, 'stdout.log'));
  const stderrBytes = fs.readFileSync(path.join(evidence, 'stderr.log'));
  const result = { observedTag: expectedTag, observedTagSha, canonicalTree, startedAt, finishedAt, exitCode, signal, beforeHead: before.head, beforeTree: before.tree, afterHead: after.head, afterTree: after.tree, headPreserved: before.head === after.head && before.tree === after.tree, primaryPreserved: before.primaryHead === after.primaryHead && before.primaryStatus === after.primaryStatus, ownerOriginalPreserved: before.ownerOriginalSha256 === after.ownerOriginalSha256, statusPreserved: before.status === after.status, worktreeInventoryPreserved: before.worktrees === after.worktrees, stdout: { bytes: stdoutBytes.length, sha256: hash(stdoutBytes) }, stderr: { bytes: stderrBytes.length, sha256: hash(stderrBytes) }, cleanup: { checked: false } };
  try {
    if (exitCode === 0) {
      const raw = stdoutBytes.toString('utf8');
      const report = JSON.parse(raw.slice(raw.indexOf('{')));
      const scenarios = report.scenarios;
      if (!Array.isArray(scenarios)) throw new Error('smoke stdout lacks scenario array');
      write('smoke-report.json', report);
      const commands = scenarios.flatMap((scenario, index) => scenario.commands.map(command => ({ scenario: index + 1, installed: scenario.installed, ...command })));
      write('commands.json', commands);
      result.summary = {
        scenarios: scenarios.length,
        scenarioPasses: scenarios.filter(scenario => scenario.ok === true).length,
        commands: commands.length,
        commandsStatusZero: commands.filter(command => command.status === 0).length,
        versions: [...new Set(scenarios.map(scenario => scenario.version))],
        diagramValidationRuns: scenarios.filter(scenario => scenario.diagramValidation).length,
        diagramOutputs: scenarios.filter(scenario => scenario.diagramValidation).map(scenario => scenario.diagramValidation.output),
        learningEvidenceScenarios: scenarios.filter(scenario => scenario.learningEvidenceValidation).length,
        learningEvidenceCommands: commands.filter(command => command.args.some(argument => /[\\/]scripts[\\/]lek\.py$/.test(argument))).length,
        learningEvidenceResults: scenarios.filter(scenario => scenario.learningEvidenceValidation).map(scenario => scenario.learningEvidenceValidation),
        siteGenerations: scenarios.filter(scenario => scenario.siteValidation).length,
        siteStaticChecks: scenarios.filter(scenario => scenario.siteValidation?.checked?.status === 'PASS').length,
        siteCheckSummaries: scenarios.filter(scenario => scenario.siteValidation).map(scenario => scenario.siteValidation.checked.summary),
        installedHtmlVersions: [...new Set(scenarios.filter(scenario => scenario.siteValidation).map(scenario => scenario.siteValidation.skillPath.match(/[\\/]html-guide-kit[\\/]([^\\/]+)[\\/]/)?.[1]))],
        siteBrowserChecks: scenarios.filter(scenario => scenario.siteValidation).map(scenario => scenario.siteValidation.browserCheck)
      };
    }
    const performanceFiles = fs.existsSync(env.MJ_PERF_DIR) ? fs.readdirSync(env.MJ_PERF_DIR).filter(name => name.endsWith('.ndjson')) : [];
    const records = performanceFiles.flatMap(name => fs.readFileSync(path.join(env.MJ_PERF_DIR, name), 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)));
    const ownedRoots = new Map();
    for (const record of records) {
      if (record.phase !== 'copy' || !record.details?.destinationRoot) continue;
      const destination = path.resolve(record.details.destinationRoot);
      const kind = record.details.stage === 'template' ? 'template' : record.details.stage === 'scenario' ? 'scenario' : undefined;
      if (!kind) continue;
      const root = path.dirname(destination);
      const expectedPrefix = kind === 'template' ? 'marketplace-smoke-source-' : 'marketplace-smoke-';
      const temporary = fs.realpathSync.native(require('node:os').tmpdir());
      const relative = path.relative(temporary, root);
      const boundaryVerified = !!relative && relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative) && path.basename(root).startsWith(expectedPrefix) && path.basename(destination) === (kind === 'template' ? 'template' : 'src');
      ownedRoots.set(root, { root, kind, observedFrom: 'successful smoke copy metric destinationRoot', copyStatus: record.status, boundaryVerified, existsAfter: fs.existsSync(root), checkedAt: new Date().toISOString() });
    }
    for (const record of records) {
      if (record.phase !== 'worktree.create' || record.details?.scope !== 'canonical') continue;
    }
    const canonicalRoots = [...new Set(scenariosCanonicalRoots(records))];
    for (const root of canonicalRoots) {
      const temporary = fs.realpathSync.native(require('node:os').tmpdir());
      const relative = path.relative(temporary, root);
      const boundaryVerified = !!relative && relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative) && path.basename(root).startsWith('release-install-');
      ownedRoots.set(root, { root, kind: 'canonical', observedFrom: 'canonical smoke source copy original sourceRoot', boundaryVerified, existsAfter: fs.existsSync(root), checkedAt: new Date().toISOString() });
    }
    const roots = [...ownedRoots.values()];
    write('owned-roots-absence.json', roots);
    result.cleanup = { checked: roots.length > 0, roots: roots.length, templateRoots: roots.filter(root => root.kind === 'template').length, scenarioRoots: roots.filter(root => root.kind === 'scenario').length, canonicalRoots: roots.filter(root => root.kind === 'canonical').length, allBoundariesVerified: roots.every(root => root.boundaryVerified), allAbsent: roots.every(root => !root.existsAfter), manualCleanupPerformed: false, performanceFiles };
  } catch (error) {
    result.evidenceAnalysisError = error.stack;
  }
  write('run-result.json', result);
  write('run-state.json', { status: 'COMPLETE', startedAt, finishedAt, exitCode });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exitCode = exitCode === 0 && !result.evidenceAnalysisError ? 0 : 1;
});
