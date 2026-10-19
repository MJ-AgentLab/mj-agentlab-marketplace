import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const output = path.resolve(process.argv[2]);
const host = 'C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop';
const canonicalSha = '65d756efd3024ac10d1d0e6ea189055fbe6f1545';
const git = args => execFileSync('git', args, {cwd:host,windowsHide:true,encoding:'utf8'}).trim();
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const snapshot = () => fs.readdirSync(os.tmpdir()).filter(name => /^(release-install-|marketplace-smoke-)/.test(name)).sort();
const startedAt = new Date().toISOString();
const beforeTemp = snapshot();
const beforeWorktrees = git(['worktree','list','--porcelain']);
const importedFiles = ['scripts/release-verify-install.mjs','scripts/smoke-codex-plugin.mjs','scripts/smoke-source.mjs','scripts/validate-portable.mjs','scripts/run-cli.mjs','scripts/perf-metrics.mjs','scripts/document-harness.mjs','scripts/plugin-icons.mjs'];
const importedHashes = importedFiles.map(file => {
 const bytes = fs.readFileSync(path.join(host,file));
 const canonical = execFileSync('git',['show',`${canonicalSha}:${file}`],{cwd:host,windowsHide:true});
 // Working-tree CRLF presentation differs from Git LF; only newline conversion is allowed here.
 const same = bytes.toString('utf8').replaceAll('\r\n','\n') === canonical.toString('utf8');
 if (!same) throw new Error(`Imported helper differs from canonical: ${file}`);
 return {file,workingSha256:hash(bytes),gitBlobSha256:hash(canonical),canonicalTextEqual:true};
});
process.env.PATH = 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python;' + process.env.PATH;
process.env.MJ_PERF_DIR = path.join(output,'perf');
const meta = {schema:1,role:'independent post-merge canonical installation verification',startedAt,host,hostHeadAtStart:git(['rev-parse','HEAD']),canonicalSha,canonicalTree:git(['rev-parse',`${canonicalSha}^{tree}`]),node:process.version,platform:process.platform,interpreter:'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',importedHashes,marketplaceVersion:git(['show',`${canonicalSha}:VERSION`]),pluginVersions:Object.fromEntries(['diagram-kit','learning-evidence-kit','explain-kit','html-guide-kit','communication-kit'].map(p => [p,JSON.parse(git(['show',`${canonicalSha}:plugins/${p}/plugin.json`])).version])),beforeTemp,beforeWorktrees};
fs.writeFileSync(path.join(output,'execution-metadata.json'),JSON.stringify(meta,null,2)+'\n');
let raw;
try {
 const {verifyReleaseInstall} = await import(pathToFileURL(path.join(host,'scripts/release-verify-install.mjs')).href);
 raw = await verifyReleaseInstall({canonicalSha,repoRoot:host});
 fs.writeFileSync(path.join(output,'raw-result.json'),JSON.stringify(raw,null,2)+'\n');
 const scenarios = raw.scenarios;
 const commands = scenarios.flatMap(s => s.commands);
 const last = scenarios.at(-1);
 const generated = scenarios.filter(s => s.siteValidation);
 const afterTemp = snapshot();
 const newRemainingTemp = afterTemp.filter(name => !beforeTemp.includes(name));
 const afterWorktrees = git(['worktree','list','--porcelain']);
 const allHashes = scenarios.flatMap(s => Object.entries(s.installedResources).map(([skill,resources]) => ({scenario:s.installed,skill,count:Object.keys(resources).length,hashes:resources})));
 const counts = {scenarios:scenarios.length,commands:commands.length,diagramInvocations:commands.filter(c=>c.args.some(a=>String(a).endsWith('validate_diagram.py'))).length,learningEvidenceInvocations:commands.filter(c=>c.args.some(a=>String(a).endsWith('lek.py'))).length,siteRenderInvocations:commands.filter(c=>c.args.some(a=>String(a).endsWith('render-site.mjs'))).length,siteStaticInvocations:commands.filter(c=>c.args.some(a=>String(a).endsWith('check_artifact.py'))).length};
 if (counts.scenarios!==13 || counts.diagramInvocations!==6 || counts.learningEvidenceInvocations!==18 || counts.siteRenderInvocations!==4 || counts.siteStaticInvocations!==4) throw new Error('Actual invocation counts differ from expected');
 if (last.nativeOutside.publicSkills!==8 || last.nativeOutside.repositorySkills!==0 || last.nativeRepository.repositorySkills!==20 || last.outside.publicSkills!==3 || last.explicitOnly.length!==5) throw new Error('Final all-package inventory differs');
 if (newRemainingTemp.length || afterWorktrees!==beforeWorktrees) throw new Error('Temporary verification cleanup incomplete');
 const summary = {status:'PASS',startedAt,completedAt:new Date().toISOString(),host,canonicalSha,canonicalTree:meta.canonicalTree,marketplaceVersion:meta.marketplaceVersion,pluginVersions:meta.pluginVersions,counts,commandStatuses:[...new Set(commands.map(c=>c.status))],allPackageInventory:{ordinary:last.outside,repository:last.repository,nativeOutside:last.nativeOutside,nativeRepository:last.nativeRepository,explicit:last.explicitOnly,publicSkills:Object.keys(last.publicSkillPaths)},hashResourceGroups:allHashes.length,siteResourceCounts:scenarios.filter(s=>s.installedResources['html-guide-kit:site']).map(s=>Object.keys(s.installedResources['html-guide-kit:site']).length),staticResults:generated.map(s=>({installed:s.installed,status:s.siteValidation.checked.status,summary:s.siteValidation.checked.summary})),cleanup:{defaultKeepRoot:false,newRemainingTemp,worktreeListRestored:true,afterTemp,afterWorktrees},limits:{model:'NOT_RUN',desktop:'NOT_RUN',browser:'NOT_RUN in this installation verification',ownerFinalAcceptance:'NOT_EVALUATED',githubNonAuthorApproval:'reviews=[] gap preserved separately; no approval inferred'}};
 fs.writeFileSync(path.join(output,'resource-hashes.json'),JSON.stringify(allHashes,null,2)+'\n');
 fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify(summary));
} catch(error) {
 const failure = {status:'FAIL',startedAt,completedAt:new Date().toISOString(),error:{name:error.name,message:error.message,stack:error.stack},afterTemp:snapshot(),afterWorktrees:git(['worktree','list','--porcelain'])};
 fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify(failure,null,2)+'\n');
 console.error(JSON.stringify(failure));
 process.exitCode=1;
}
