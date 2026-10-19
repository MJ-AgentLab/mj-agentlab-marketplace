import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const repo='MJ-AgentLab/mj-agentlab-marketplace';
const actual='4d10a0677c745eccb2775f7ae6176f8e2b1d2387';
const before='65d756efd3024ac10d1d0e6ea189055fbe6f1545';
const source='ef85a2de6e39b1981d94d9d4cbc004fbdc71acee';
const potential='535315f035a5b7a8082a263fedaf9a07aa67e9d7';
const mainSha='e3dc40f734fc972e05956da3e908091e09963675';
const published='f906b1001a86d7b5415451bd973bea26e6cc3a1d';
const tree='db49629fe767d3584f6ce772ef7bf5cdb52094e1';
const read=name=>fs.readFileSync(path.join(root,name));
const json=name=>JSON.parse(read(name).toString('utf8').replace(/^\uFEFF/,''));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const write=(name,value)=>fs.writeFileSync(path.join(root,name),JSON.stringify(value,null,2)+'\n');
const normalize=value=>String(value).replace(/\r\n/g,'\n').trim();
const decoded=name=>Buffer.from(json(name).content,'base64');
const pr=json('pr280.json'), reviews=json('pr280-reviews.json'), rollup=json('pr280-rollup.json');
const commit=json('actual-develop-git-commit.json'), sourceCommit=json('source-git-commit.json'), tested=json('tested-potential-merge-git-commit.json');
const main=json('main-terminal.json'), develop=json('develop-terminal.json');
const compare=json('main-to-develop-compare.json');
const suite=json('pr280-rule-suite.json'), rules=json('develop-active-rules.json');
const tag=json('tag-v8.3.2-terminal.json'), release=json('release-v8.3.2-terminal.json'), repository=json('repository.json');
const absentTag=json('tag-v8.3.3-lookup.json'), absentRelease=json('release-v8.3.3-lookup.json'), absenceMetadata=json('v8.3.3-lookups-metadata.json'), releaseList=json('releases-list.json');
const checkRuns=json('head-check-runs.json');
const pullRule=suite.rule_evaluations.find(item=>item.rule_type==='pull_request');
const statusRule=suite.rule_evaluations.find(item=>item.rule_type==='required_status_checks');
const changelog=decoded('published-changelog-content.json').toString('utf8').split(/\r?\n/);
const start=changelog.findIndex(line=>/^## \[8\.3\.2\]/.test(line));
assert(start>=0,'published version section');
const end=changelog.findIndex((line,index)=>index>start&&/^## \[/.test(line));
const notes=normalize(changelog.slice(start+1,end<0?undefined:end).join('\n'));
const version=normalize(decoded('actual-develop-version-content.json'));
const publishedVersion=normalize(decoded('published-version-content.json'));
const reversed=(start,end)=>start&&end&&Number.isFinite(Date.parse(start))&&Number.isFinite(Date.parse(end))&&Date.parse(end)<Date.parse(start);
const rollupAnomalies=rollup.statusCheckRollup.filter(row=>reversed(row.startedAt,row.completedAt)).map(({name,status,conclusion,startedAt,completedAt,detailsUrl})=>({name,status,conclusion,startedAt,completedAt,detailsUrl}));
const restAnomalies=checkRuns.check_runs.filter(row=>reversed(row.started_at,row.completed_at)).map(({id,name,status,conclusion,started_at,completed_at,details_url})=>({id,name,status,conclusion,startedAt:started_at,completedAt:completed_at,detailsUrl:details_url}));
const queueManifestPath='C:/Users/Admin/AppData/Local/Temp/html-learning-274-sync280-queue-audit/evidence-manifest.json';
const queueSummaryPath='C:/Users/Admin/AppData/Local/Temp/html-learning-274-sync280-queue-audit/summary.json';
const priorQueue=JSON.parse(fs.readFileSync(queueSummaryPath,'utf8'));
const checks={
  actualMerge:pr.merged===true&&pr.merge_commit_sha===actual&&pr.merged_at==='2026-10-19T16:37:27Z',
  exactSourceBase:pr.head.sha===source&&pr.base.sha===before,
  actualParents:commit.parents.length===2&&commit.parents[0].sha===before&&commit.parents[1].sha===source,
  tripleTree:commit.sha===actual&&commit.tree.sha===tree&&sourceCommit.sha===source&&sourceCommit.tree.sha===tree&&tested.sha===potential&&tested.tree.sha===tree,
  potentialParents:tested.parents.length===2&&tested.parents[0].sha===before&&tested.parents[1].sha===source,
  currentRefs:main.commit.sha===mainSha&&develop.commit.sha===actual,
  completeCurrentMainAncestry:compare.status==='ahead'&&compare.behind_by===0&&compare.merge_base_commit.sha===mainSha,
  exactRuleSuite:suite.id===4603805882&&suite.before_sha===before&&suite.after_sha===actual&&suite.ref==='refs/heads/develop',
  actualBypass:suite.result==='bypass',
  actualApprovalFailure:pullRule?.result==='fail'&&pullRule?.details==='New changes require approval from someone other than the last pusher.',
  actualRequiredChecksPass:statusRule?.result==='pass',
  actualReviewsEmpty:Array.isArray(reviews)&&reviews.length===0,
  tagUnchanged:tag.object.type==='commit'&&tag.object.sha===published,
  releaseUnchanged:release.id===417390526&&release.tag_name==='v8.3.2'&&release.target_commitish===published&&release.published_at==='2026-10-19T14:30:16Z'&&release.draft===false&&release.prerelease===false,
  releaseBodyMatches:notes===normalize(release.body),
  currentAndPublishedVersion:version==='8.3.2'&&publishedVersion==='8.3.2',
  noReleaseAssets:Array.isArray(release.assets)&&release.assets.length===0,
  nextTagNotFound:absentTag.status==='404'&&absenceMetadata.tagLookupExitCode===1,
  nextReleaseNotFound:absentRelease.status==='404'&&absenceMetadata.releaseLookupExitCode===1&&!releaseList.some(row=>row.tag_name==='v8.3.3'),
  priorQueuePreserved:priorQueue.queueCause==='UNKNOWN'&&priorQueue.result==='OBSERVATION_ONLY_PENDING',
  inconsistentHelperTimesPreserved:rollupAnomalies.length===2&&restAnomalies.length===2&&restAnomalies.every(row=>row.conclusion==='skipped'&&rollupAnomalies.some(other=>other.detailsUrl===row.detailsUrl)),
};
for(const[name,passed]of Object.entries(checks))assert(passed,name);
const generatedAtUtc=new Date().toISOString();
const generatedAtTaipei=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',dateStyle:'short',timeStyle:'long',hour12:false}).format(new Date());
const fileTimes=fs.readdirSync(root).filter(name=>name.endsWith('.json')&&!['methods.json','summary.json','evidence-manifest.json'].includes(name)).map(name=>fs.statSync(path.join(root,name)).mtime.toISOString()).sort();
const methods={
  generatedAtUtc,generatedAtTaipei,userDate:'2026-10-20',userTimezone:'Asia/Taipei',
  captureRangeFromResponseFileMtimeUtc:{start:fileTimes[0],end:fileTimes.at(-1),limitation:'Local response-file write times, not exact Owner-message or server-response times.'},
  scope:'Independent read-only actual PR280 merge, ancestry, protection, publication and temporal-field audit. No Git writes/fetch/push, remote mutation, PR/release creation or merge, bypass or messages to other people.',
  calls:[
    `gh api repos/${repo}/pulls/280`,`gh api repos/${repo}/pulls/280/reviews`,
    `gh api 'repos/${repo}/rulesets/rule-suites?ref=refs/heads/develop&per_page=30'`,`gh api repos/${repo}/rulesets/rule-suites/4603805882`,
    ...['main','develop'].map(branch=>`gh api repos/${repo}/branches/${branch}`),`gh api repos/${repo}/rules/branches/develop`,
    ...[actual,source,potential].map(sha=>`gh api repos/${repo}/git/commits/${sha}`),
    `gh api repos/${repo}/compare/${mainSha}...${actual}`,
    ...['8.3.2','8.3.3'].flatMap(version=>[`gh api repos/${repo}/git/ref/tags/v${version}`,`gh api repos/${repo}/releases/tags/v${version}`]),
    `gh api 'repos/${repo}/releases?per_page=30'`,`gh api repos/${repo}`,
    `gh pr view 280 --repo ${repo} --json number,state,mergedAt,mergeCommit,headRefOid,baseRefOid,statusCheckRollup,reviews,reviewDecision`,
    `gh api 'repos/${repo}/commits/${source}/check-runs?per_page=100'`,
    `gh api 'repos/${repo}/contents/VERSION?ref=${actual}'`,`gh api 'repos/${repo}/contents/VERSION?ref=${published}'`,`gh api 'repos/${repo}/contents/CHANGELOG.md?ref=${published}'`
  ],
  authentication:'Existing gh authentication only; no credentials requested, printed or saved.',
  governance:'Match exact develop ref/before/after rule-suite, then read original individual rule results; reviews[] is separate and is never a reason to invent a bypass. Actual merge and technical success do not supply the failed latest-push approval.',
  versionAbsence:'Expected read-only 404 tag/release lookup outputs and exit codes are saved separately, and the authenticated releases list also has no v8.3.3 entry. This is a visibility/time-bound observation, not a promise about future state. No next-version object was created.',
  timeAnomalies:'Two skipped helpers have completedAt earlier than startedAt in both GraphQL rollup and REST check-runs. Preserve original fields; do not turn them into a negative duration, execution proof, queue explanation, clock repair, or a retroactive change to earlier queued observations.',
  priorQueueReference:{manifestPath:queueManifestPath,manifestSha256:hash(fs.readFileSync(queueManifestPath)),summaryPath:queueSummaryPath,summarySha256:hash(fs.readFileSync(queueSummaryPath)),result:priorQueue.result,cause:priorQueue.queueCause,capture:priorQueue.captureRangeFromResponseFileMtimeUtc},
  limitations:['No fresh actual4d10 installation, Python operation, full test or client run performed by this audit.','Same-tree linkage to tested source/potential merge is not renamed as a new actual-merge execution.','Owner acceptance/understanding effect and future protected PR approval remain separate.'],
};
write('methods.json',methods);
const summary={schemaVersion:1,generatedAtUtc,generatedAtTaipei,userDate:'2026-10-20',userTimezone:'Asia/Taipei',checks,
  actual:{pr:280,merge:actual,mergedAtUtc:pr.merged_at,mergedAtTaipei:'2026-10-20T00:37:27+08:00',tree,source,potential,parents:commit.parents.map(parent=>parent.sha),currentMain:main.commit.sha,currentDevelop:develop.commit.sha,version},
  ancestry:{mainSha,status:compare.status,ahead:compare.ahead_by,behind:compare.behind_by,mergeBase:compare.merge_base_commit.sha},
  governance:{status:'NOT_MET_BYPASS_OBSERVED',suite:suite.id,ref:suite.ref,before:suite.before_sha,after:suite.after_sha,pushedAt:suite.pushed_at,actor:suite.actor_name,result:suite.result,reviews:[],evaluations:suite.rule_evaluations.map(({rule_type,result,details,rule_source})=>({type:rule_type,result,details,source:rule_source})),activeRules:rules},
  release:{id:release.id,tag:release.tag_name,tagSha:tag.object.sha,target:release.target_commitish,publishedAt:release.published_at,draft:release.draft,prerelease:release.prerelease,assets:release.assets,immutable:release.immutable,immutableConfiguration:Object.hasOwn(repository,'immutable_releases')?repository.immutable_releases:'UNKNOWN',bodyMatches:true,normalizedBodySha256:hash(normalize(release.body)),url:release.html_url},
  nextVersion:{version:'8.3.3',tagStatus:absentTag.status,releaseStatus:absentRelease.status,visibleReleaseListMatch:false,lookupMetadata:absenceMetadata,createdByThisAudit:false},
  temporalObservations:{graphql:rollupAnomalies,rest:restAnomalies,conclusion:'Original inconsistent temporal fields retained; cause UNKNOWN and no elapsed-time claim.'},
  currentRollup:rollup.statusCheckRollup.map(({name,status,conclusion,startedAt,completedAt,detailsUrl})=>({name,status,conclusion,startedAt,completedAt,detailsUrl})),
  priorQueueReference:methods.priorQueueReference,limitations:methods.limitations};
write('summary.json',summary);
const files=fs.readdirSync(root).filter(name=>fs.statSync(path.join(root,name)).isFile()&&name!=='evidence-manifest.json').sort().map(name=>({path:name,bytes:read(name).length,sha256:hash(read(name))}));
write('evidence-manifest.json',{schemaVersion:1,generatedAtUtc,terminalIdentities:{currentDevelop:actual,currentDevelopTree:tree,currentMain:mainSha,publishedVersion:'8.3.2',publishedTagSha:tag.object.sha,publishedReleaseTarget:release.target_commitish,nextVersion:'8.3.3',nextTagObservedAbsent:true,nextReleaseObservedAbsent:true},files});
console.log(JSON.stringify({ok:true,checks:Object.keys(checks).length,governance:summary.governance.status,suite:suite.id,tripleTree:tree,mainAncestor:mainSha,releaseTarget:release.target_commitish,nextVersionAbsent:true,temporalAnomalies:rollupAnomalies.length,coveredFiles:files.length,generatedAtUtc,generatedAtTaipei}));
