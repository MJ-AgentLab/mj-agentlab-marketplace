const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = __dirname;
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const before = read('before-snapshot.json');
const after = read('after-snapshot.json');
const result = read('run-result.json');
const report = read('smoke-report.json');
const roots = read('owned-roots-absence.json');
const parse = raw => new Map(raw.trim().split(/\r?\n\r?\n/).map(block => {
  const lines = block.split(/\r?\n/);
  return [lines[0].slice('worktree '.length), { path: lines[0].slice('worktree '.length), head: lines.find(line => line.startsWith('HEAD '))?.slice(5), branch: lines.find(line => line.startsWith('branch '))?.slice(7), raw: block }];
}));
const initial = parse(before.worktrees), final = parse(after.worktrees);
const added = [...final.values()].filter(record => !initial.has(record.path));
const removed = [...initial.values()].filter(record => !final.has(record.path));
const changed = [...initial.values()].filter(record => final.has(record.path) && record.raw !== final.get(record.path).raw).map(record => ({ before: record, after: final.get(record.path) }));
const authorizedNewWorktree = 'C:/Users/Admin/.codex/worktrees/html-alignment-final/develop';
const commandRows = report.scenarios.flatMap((scenario, index) => scenario.commands.map(command => ({ scenario: index + 1, ...command })));
const pythonCommands = commandRows.filter(command => command.args.some(argument => /(?:validate_diagram|lek|check_artifact)\.py$/.test(argument)));
const interpreterNames = Object.fromEntries([...new Set(pythonCommands.map(command => command.command))].map(command => [command, pythonCommands.filter(row => row.command === command).length]));
const audit = {
  auditedAt: new Date().toISOString(),
  sourceCandidate: { head: result.beforeHead, tree: result.beforeTree, afterHead: result.afterHead, afterTree: result.afterTree, cleanBefore: before.status === '', cleanAfter: after.status === '', unchanged: result.headPreserved && result.statusPreserved },
  scope: 'Full npm run smoke:codex, default keepRoot=false, exact CLI 0.147.0; isolated installation/discovery/resource-byte comparison and actual installed scripts only. No model, desktop, Sites deployment, or browser-rendering acceptance.',
  worktreeInventory: { exactlySame: before.worktrees === after.worktrees, added, removed, changed, authorizedAddedPath: authorizedNewWorktree, onlyAuthorizedAddition: added.length === 1 && added[0].path.toLowerCase() === authorizedNewWorktree.toLowerCase() && removed.length === 0 && changed.length === 0, explanation: 'Root agent explicitly authorized a separate final worktree while this smoke source stayed frozen; it is preserved and is not smoke residue. Root announced initial final-worktree HEAD 42a8eb6439ece6d386e5e5897b5d33862315885a; the actual end snapshot above governs.' },
  observations: {
    scenarioCount: report.scenarios.length,
    passedScenarios: report.scenarios.filter(scenario => scenario.ok === true).length,
    commandCount: commandRows.length,
    zeroStatusCommands: commandRows.filter(command => command.status === 0).length,
    actualPythonCommands: pythonCommands.length,
    pythonCommandNames: interpreterNames,
    htmlScenarios: report.scenarios.filter(scenario => scenario.siteValidation).map(scenario => ({ installed: scenario.installed, siteSkill: scenario.siteValidation.skillPath, siteResourceFiles: Object.keys(scenario.installedResources['html-guide-kit:site']).length, guideResourceFiles: Object.keys(scenario.installedResources['html-guide-kit:guide']).length, staticStatus: scenario.siteValidation.checked.status, staticSummary: scenario.siteValidation.checked.summary, browserCheck: scenario.siteValidation.browserCheck })),
    finalFivePackageDiscovery: { ordinaryOutside: report.outside, repository: report.repository, nativeOutside: report.nativeOutside, nativeRepository: report.nativeRepository, explicitOnly: report.explicitOnly },
    rootAbsenceRecheck: roots.map(record => ({ root: record.root, kind: record.kind, boundaryVerified: record.boundaryVerified, existsAtAudit: fs.existsSync(record.root) })),
    noManualCleanup: result.cleanup.manualCleanupPerformed === false,
    rawStdoutStderrPreserved: true
  },
  limitations: ['The smoke output belongs to frozen b5b8300ae58e967e1d0013e66dc4f1208ac860ef/tree8ce86dbd47bc0187e0cae41a3d144479d4b41819, not subsequent test-only commits.', 'Four site checks use the installed representative fixture and static checker. Browser rendering is NOT_RUN in smoke.', 'No new grilling behavior, native question-window lifecycle, second desktop client, learning-effect result, protected approval, or Owner acceptance is inferred.']
};
fs.writeFileSync(path.join(root, 'independent-audit.json'), JSON.stringify(audit, null, 2) + '\n');
const inventoryFiles = (directory, relative = '') => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  if (entry.isSymbolicLink()) throw new Error('unexpected linked evidence resource');
  const name = path.posix.join(relative, entry.name);
  if (entry.isDirectory()) return inventoryFiles(path.join(directory, entry.name), name);
  if (name === 'evidence-sha256.json') return [];
  const bytes = fs.readFileSync(path.join(directory, entry.name));
  return [{ file: name, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') }];
});
const inventory = inventoryFiles(root).sort((left, right) => left.file.localeCompare(right.file));
fs.writeFileSync(path.join(root, 'evidence-sha256.json'), JSON.stringify(inventory, null, 2) + '\n');
process.stdout.write(JSON.stringify({ sourceCandidate: audit.sourceCandidate, worktreeInventory: audit.worktreeInventory, actualPythonCommands: audit.observations.actualPythonCommands, pythonCommandNames: audit.observations.pythonCommandNames, htmlScenarios: audit.observations.htmlScenarios, finalFivePackageDiscovery: audit.observations.finalFivePackageDiscovery, rootCount: roots.length, allObservedRootsAbsentAtAudit: audit.observations.rootAbsenceRecheck.every(record => !record.existsAtAudit), output: path.join(root, 'independent-audit.json') }, null, 2) + '\n');
