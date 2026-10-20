import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(root,name));
const json = name => JSON.parse(read(name).toString('utf8').replace(/^\uFEFF/,''));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const write = (name,value) => fs.writeFileSync(path.join(root,name),JSON.stringify(value,null,2)+'\n');
const expectedHead = 'ef85a2de6e39b1981d94d9d4cbc004fbdc71acee';
const ids = { 'pr-ci':39279114820, a6:39279114746, push:39279043416 };
const runs = Object.entries(ids).map(([label,id]) => {
  const initial=json(`${label}-run.json`), terminal=json(`${label}-run-terminal.json`), jobs=json(`${label}-jobs-terminal.json`);
  assert(initial.id===id && terminal.id===id && terminal.head_sha===expectedHead,label+' source identity');
  return { label,id,event:terminal.event,head:terminal.head_sha,createdAt:terminal.created_at,initial:{status:initial.status,conclusion:initial.conclusion},terminal:{status:terminal.status,conclusion:terminal.conclusion,updatedAt:terminal.updated_at,runStartedAtField:terminal.run_started_at},jobs:jobs.jobs.map(job=>({id:job.id,name:job.name,status:job.status,conclusion:job.conclusion,startedAtField:job.started_at,completedAt:job.completed_at,runnerId:job.runner_id,runnerName:job.runner_name,runnerGroupId:job.runner_group_id,runnerGroupName:job.runner_group_name,labels:job.labels,stepCount:job.steps?.length ?? null})),pendingDeployments:json(`${label}-pending-deployments.json`),approvals:json(`${label}-approvals.json`) };
});
const permissions=json('repository-actions-permissions.json');
const workflows=['ci','a6'].map(name=>{const data=json(`${name}-workflow.json`);return {label:name,id:data.id,path:data.path,state:data.state,updatedAt:data.updated_at};});
const selfHosted=json('repository-self-hosted-runners.json');
const activeStates=Object.fromEntries(['in_progress','queued','waiting'].map(state=>{const data=json(`repository-runs-${state}.json`);return [state,{totalCount:data.total_count,runs:data.workflow_runs.map(run=>({id:run.id,name:run.name,event:run.event,head:run.head_sha,status:run.status,createdAt:run.created_at}))}];}));
const allLatest=json('repository-runs-terminal.json');
const pr=json('pr280-terminal.json'), initialPr=json('pr280.json');
assert(pr.head.sha===expectedHead && pr.base.sha==='65d756efd3024ac10d1d0e6ea189055fbe6f1545','PR head/base');
const status=json('github-status-summary.json'), components=json('github-status-components.json'), unresolved=json('github-status-incidents-unresolved.json'), history=json('github-status-incidents-history.json');
const actions=status.components.find(component=>component.name==='Actions');
const actionsSecond=components.components.find(component=>component.name==='Actions');
assert(actions?.id==='br0l2tvcx85d' && actionsSecond?.id===actions.id,'official Actions component identity');
const sameDayIncidents=history.incidents.filter(incident=>String(incident.created_at).startsWith('2026-10-19') || String(incident.resolved_at).startsWith('2026-10-19'));
const statusCapture=json('github-status-capture-method.json');
const historicalNonCauseExamples=history.incidents.slice(0,3).map(incident=>({id:incident.id,name:incident.name,status:incident.status,createdAt:incident.created_at,updatedAt:incident.updated_at,resolvedAt:incident.resolved_at}));
const filesAtCapture=fs.readdirSync(root).filter(name=>name.endsWith('.json')&&!['summary.json','methods.json','evidence-manifest.json'].includes(name)).map(name=>fs.statSync(path.join(root,name)).mtime.toISOString()).sort();
const runnerAssigned=runs.some(run=>run.jobs.some(job=>job.runnerId!==null||job.runnerName!==null));
const allQueued=runs.every(run=>run.terminal.status==='queued'&&run.jobs.every(job=>job.status==='queued'));
const summary={
  schemaVersion:1,generatedAt:new Date().toISOString(),
  result:'OBSERVATION_ONLY_PENDING',queueCause:'UNKNOWN',actionableCauseEstablished:false,
  captureRangeFromResponseFileMtimeUtc:{start:filesAtCapture[0],end:filesAtCapture.at(-1)},
  pr:{number:280,head:pr.head.sha,base:pr.base.sha,state:pr.state,draft:pr.draft,updatedAt:pr.updated_at,bodySha256:hash(String(pr.body)),bodyChangedBetweenTwoPrReads:String(pr.body)!==String(initialPr.body)},
  runs,runnerAssignedInObservedJobs:runnerAssigned,allObservedRunsAndJobsQueued:allQueued,
  permissions,workflows,selfHostedRunnerEndpoint:{totalCount:selfHosted.total_count,limitation:'This endpoint inventories self-hosted runners. It does not reveal GitHub-hosted pool allocation/capacity.'},
  repositoryRunStates:activeStates,
  officialStatus:{url:'https://www.githubstatus.com/',summaryEndpoint:'https://www.githubstatus.com/api/v2/summary.json',status:status.status,pageUpdatedAt:status.page.updated_at,actions:{id:actions.id,status:actions.status,lastComponentStatusChangeAt:actions.updated_at,secondEndpointStatus:actionsSecond.status},incidentsAtSummary:status.incidents,unresolvedIncidents:unresolved.incidents,scheduledMaintenances:status.scheduled_maintenances,sameDayIncidentsInRecentHistory:sameDayIncidents,actualHttpCapture:statusCapture,historicalNonCauseExamples},
  findings:[
    'No examined API provides a concrete queue-cause explanation or an actionable approval/environment blocker. Queue cause remains UNKNOWN; this is not a successful check result.',
    'Observed jobs have ubuntu-latest/windows-latest labels but null runner identity/group fields. Non-null run_started_at or job.started_at metadata, while status remains queued and runner identity is null, does not establish runner assignment or actual step execution.',
    'Repository Actions is enabled and the CI/A6 workflows are active. No repository setting change is justified by these reads.',
    'Pending-deployment and approval arrays for the three observed runs are empty. No run in waiting status is reported by the sampled repository endpoint.',
    'Official status was sampled on 2026-10-19 around 15:39 UTC with HTTP Date and Age retained: Actions was operational and no unresolved incident was listed. This neither proves this repository is unaffected nor identifies an external cause.',
    'Older resolved October 12/13/15 incident entries do not establish the cause of this October 19 queue. Component updated_at is its last status change, not the time this sample was captured.',
    'No cancellation, rerun, workflow/permission/billing change, repository edit, bypass or message to other people was performed.',
    'PR body edits can trigger another A6 run. A future final gate must reread latest current-head runs/reviews/base/threads after the last body edit; this snapshot cannot pre-approve all future checks.'
  ],
  latestFortyNonterminalRuns:allLatest.workflow_runs.filter(run=>run.status!=='completed').map(run=>({id:run.id,name:run.name,status:run.status,event:run.event,head:run.head_sha})),
};
write('summary.json',summary);
write('methods.json',{
  generatedAt:new Date().toISOString(),scope:'Read-only queue diagnosis for task 274 synchronization PR280; all output files are confined to this TEMP evidence directory.',
  methods:[
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/<39279114820|39279114746|39279043416>',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/<id>/jobs',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/<id>/pending_deployments',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/<id>/approvals',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/permissions',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/workflows/<ci.yml|a6.yml>',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/runners',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/runs?per_page=40',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/runs?status=<in_progress|queued|waiting>&per_page=100',
    'gh api repos/MJ-AgentLab/mj-agentlab-marketplace/pulls/280',
    'Public unauthenticated GET https://www.githubstatus.com/api/v2/<summary|components|incidents|incidents/unresolved>.json via Invoke-WebRequest, TimeoutSec20; HTTP Date/Age/cache-control and local capture clocks retained.',
    'Browse official https://www.githubstatus.com/ as an independent human-readable status source; the raw API snapshots provide recoverable primary evidence.'
  ],
  authorization:'Existing gh authentication only, never printed or saved. No credentials used for the public status endpoints. No external messages or state-changing API requests.',
  timeApplicability:'Run creation 2026-10-19T15:34:28Z to 15:35:01Z. Public status capture 15:39:49Z to 15:39:51Z with server Date 15:39:41Z/15:39:50Z and Age 2–10s; recent history capture separately retained. Old component last-change timestamps and old incidents are not substituted for current observations.',
  interpretation:'Observe status/runner IDs/review/environment arrays and actual repository/workflow settings. No claims about org/account concurrency, payment, GitHub-hosted pool capacity, or an unreported incident can be established from these endpoints; do not invent a cause or mutate settings to test guesses.',
  reproducibility:'Run summarize-queue-audit.mjs over the saved original JSON to regenerate the bounded observation summary. It performs no API calls or repository operations.',
  result:'UNKNOWN cause / queued observations, never PASS.'
});
const manifestFiles=fs.readdirSync(root).filter(name=>fs.statSync(path.join(root,name)).isFile()&&name!=='evidence-manifest.json').sort().map(name=>({path:name,bytes:read(name).length,sha256:hash(read(name))}));
write('evidence-manifest.json',{schemaVersion:1,generatedAt:new Date().toISOString(),head:expectedHead,runs:ids,result:summary.result,queueCause:summary.queueCause,files:manifestFiles});
console.log(JSON.stringify({ok:true,result:summary.result,cause:summary.queueCause,allObservedQueued:allQueued,runnerAssigned,actionsStatus:actions.status,repositoryInProgress:activeStates.in_progress.totalCount,repositoryQueued:activeStates.queued.totalCount,repositoryWaiting:activeStates.waiting.totalCount,bodyChanged:summary.pr.bodyChangedBetweenTwoPrReads,coveredFiles:manifestFiles.length}));
