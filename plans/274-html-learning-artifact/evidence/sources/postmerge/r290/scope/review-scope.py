import datetime, hashlib, json, pathlib, subprocess

REPO=pathlib.Path(r'C:/Users/Admin/.codex/worktrees/html-alignment-sync/develop')
OUT=pathlib.Path(__file__).parent
ACTUAL='7c23f347c0725bdfa57ee1e0f5e9075a8d90babf'
TREE='5743c7974880ff5fa87c9294313ec9adc6abac40'
F3='f3e8ba322109e2a43dcdcd68fdd2f0c655c78240'
TASK='plans/274-html-learning-artifact/'
SOURCES=TASK+'evidence/sources/'

def git(*args):return subprocess.check_output(['git',*args],cwd=REPO,stderr=subprocess.PIPE)
def blob(path,ref=ACTUAL):return git('show',ref+':'+path)
def norm(b):return b.replace(b'\r\n',b'\n')
def sha(b):return hashlib.sha256(b).hexdigest()
def load(path):return json.loads(blob(path))
def meta(path,ref=ACTUAL):
    b=blob(path,ref)
    return {'path':path,'gitRef':ref,'bytes':len(b),'sha256':sha(b),'gitBlob':git('rev-parse',ref+':'+path).decode().strip()}

old=SOURCES+'consumer/run02/consumer-cwd/artifact/'
new=SOURCES+'align274/local/run-independent-r1/site/'
asset='plugins/html-guide-kit/skills/site/assets/warm-paper/learning.js'
comparison=[]
for name in ['index.html','learning.js','content.md','sources/renewal-rules.md']:
    a,b=blob(old+name),blob(new+name)
    comparison.append({'resource':name,'old':meta(old+name),'new':meta(new+name),'oldNewExact':a==b,'currentAsset':meta(asset) if name=='learning.js' else None,'currentAssetExact':a==blob(asset) if name=='learning.js' else None})
old_config,new_config=load(old+'artifact.json'),load(new+'artifact.json')
different=sorted(k for k in set(old_config)|set(new_config) if old_config.get(k)!=new_config.get(k))
consumer=load(SOURCES+'consumer/run02/consumer-report.json')
local=load(SOURCES+'align274/local/run-independent-r1/final-result.json')
theme=load(SOURCES+'align274/theme/verification-summary.json')
local_semantic=load(SOURCES+'align274/local/run-independent-r1/semantic-review.json')
checks={
 'actualHeadAndTreeObserved':git('rev-parse','HEAD').decode().strip()==ACTUAL and git('rev-parse',ACTUAL+'^{tree}').decode().strip()==TREE,
 'actualVersion834Html039':blob('VERSION').strip()==b'8.3.4' and load('plugins/html-guide-kit/plugin.json')['version']=='0.1.39',
 'runtimeAndHarnessUnchangedSinceF3':not git('diff','--name-only',F3,ACTUAL,'--','plugins','.agents','scripts','.github/workflows','tests'),
 'oldConsumer37TwelveActualPassCases':consumer['packageVersion']=='0.1.37' and consumer['status']=='PASS' and len(consumer['cases'])==12 and all(row['status']=='PASS' for row in consumer['cases']),
 'localArtifactOnlyThemeConfigDifference':different==['theme'] and new_config['theme']=='neutral',
 'oldNewHtmlJsMaterialSourceExact':all(row['oldNewExact'] for row in comparison),
 'currentLearningJsExactOldAndNew':next(row for row in comparison if row['resource']=='learning.js')['currentAssetExact'],
 'activitiesAndSourceMetadataExact':old_config['activities']==new_config['activities'] and old_config['sources']==new_config['sources'],
 'priorLocalActualBoundedGenerationStaticBrowserRecovery':local['result']=='PASS_BOUNDED_CONFIRMED_LOCAL_DELIVERY' and local['actualResults']['generateExit']==local['actualResults']['staticExit']==local['actualResults']['browserExit']==0 and local['actualResults']['staticChecks']['checks']==96 and local['actualResults']['exactRecovery']=='PASS_EXACT_REGENERATION',
 'priorNeutralTwoViewportsActuallyPass':theme['browser']['neutral']['status']=='PASS' and [row['viewport'] for row in theme['browser']['neutral']['viewports']]==[{'width':1366,'height':900},{'width':390,'height':844}] and all(row['status']=='PASS' for row in theme['browser']['neutral']['viewports']),
 'sameGuideAndFourOtherPackagesAsPublic833':not git('diff','--name-only','refs/tags/v8.3.3',ACTUAL,'--','plugins/html-guide-kit/skills/guide','plugins/diagram-kit','plugins/learning-evidence-kit','plugins/explain-kit','plugins/communication-kit'),
}
sources=[]
for path in [SOURCES+'owner-request.txt',SOURCES+'HTML-Learning-Artifact-Plugin-Implementation-Plan.md',SOURCES+'align274/owner-decision.txt',TASK+'[PLAN]_HTML_Learning_Artifact.md',TASK+'[REPORT]_HTML_Learning_Artifact.md','docs/intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md','docs/spec/[SPEC]_HTML_Learning_Artifact.md','docs/runbook/[RUNBOOK]_Release_Operations.md']:
    sources.append(meta(path))
proof={'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'/root/alignment_sync_contract_review','actualSha':ACTUAL,'actualTree':TREE,'checks':checks,'allChecksTrue':all(checks.values()),'checkCount':len(checks),'resources':comparison,'configuration':{'old':meta(old+'artifact.json'),'new':meta(new+'artifact.json'),'differentKeys':different,'oldTheme':old_config.get('theme'),'newTheme':new_config['theme'],'activitiesExact':old_config['activities']==new_config['activities'],'sourceMetadataExact':old_config['sources']==new_config['sources']},'oldConsumerReport':meta(SOURCES+'consumer/run02/consumer-report.json'),'oldConsumerExecution':{k:consumer[k] for k in ['role','executedAt','completedAt','packageVersion','browserVersion','status','limitations']},'oldTwelveCases':[{'id':row['id'],'status':row['status']} for row in consumer['cases']],'oldInteractionCasesEligibleForBoundedCodeInheritance':[row['id'] for row in consumer['cases'][4:]],'newLocalEvidence':meta(SOURCES+'align274/local/run-independent-r1/final-result.json'),'newNeutralEvidence':meta(SOURCES+'align274/theme/verification-summary.json'),'localSemanticEvidence':meta(SOURCES+'align274/local/run-independent-r1/semantic-review.json'),'authorizationAndContracts':sources,'notExecuted':['No model/desktop/native/Sites/CI/install/test execution','No Git/repository/worktree mutation','No new clipboard/feedback/export execution; exact unchanged-resource inheritance only','No private B2 full text copied'],'interpretation':'Old twelve cases belong to actual0.1.37 execution. Only unchanged relevant content/HTML/JS behavior is inherited within the same fixture scope. New local generation/static/neutral geometry/recovery are separately executed historical0.1.39 evidence, not newly performed by this reader.'}
f=OUT/'resource-inheritance-proof.json';assert not f.exists();f.write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
summary={
 'reviewedAt':proof['reviewedAt'],'reviewer':proof['reviewer'],'canPrepareReleasePR':all(checks.values()),'requiredOwnerDecisions':[],
 'scope':'Conditional same-Issue274 Marketplace8.3.4/HTML0.1.39 release through protectedmain after fresh actual290 verification; no new product/permission/audience scope',
 'actualDevelop':{'sha':ACTUAL,'tree':TREE,'marketplace':'8.3.4','html':'0.1.39','freshActualLocalAndCanonical13':'PENDING_SEPARATE_EXECUTORS_AT_THIS_REVIEW'},
 'formalReleaseReady':False,
 'authorization':[
  {'source':SOURCES+'owner-request.txt','nature':'Direct Owner instruction adopting full B1 plan; third-party/attached text alone is not authorization','shortQuote':'实施该计划，遵循最新的 plan 机制。'},
  {'source':SOURCES+'HTML-Learning-Artifact-Plugin-Implementation-Plan.md#10-implementation-phases','nature':'P5 explicitly included by U1 full-plan implementation','shortQuote':'P5 — Release and Owner Inspection；按项目规则上线；Owner 实际体检；修复并复验受影响部分'},
  {'source':TASK+'[PLAN]_HTML_Learning_Artifact.md#accepted-baseline-and-authorization','nature':'Single decision record of operative scope','shortQuote':'按 P4/P5 验收和正式发布控制推进'},
  {'source':SOURCES+'owner-request.txt §4','nature':'Owner concentrated authorization reuse condition','shortQuote':'目标、对象、环境、权限和风险边界未实质变化时复用授权'},
  {'source':SOURCES+'align274/owner-decision.txt','nature':'Direct same-Issue selective-alignment scope, not new final product acceptance','shortQuote':'按方案1选择性统一；保留本地生成器和工程检查；沿用 #274 推进'},
 ],
 'priorPrebumpBoundary':{'interpretation':'Previous turn covered actualdevelop verification and marketplace-only pre-bump and executed no formal release. Its self-issued inventory/stop statement and pre-bump version alone are neither a permanent Owner prohibition nor independent publication authorization. Current continuation reuses already adopted B1/P5 plus U2 within unchanged five boundaries.','originalNarrowUserSource':SOURCES+'postmerge/d289/continuation/owner-request.txt','doNotInfer':'Do not turn mere version preparation or a merge report into bypass/new-audience/unbounded publication permission.'},
 'coreGates':[
  {'gate':'A1 installation and local independence','existing':'Fresh actualf3 canonical13/178, actual installed0.1.39 resources/site20/guide4/Python and source closure; current runtime remains identical','requiredNow':'Fresh actual290 complete strict/local/CLI plus separate canonical13/Python/precise roots and host/original/inventory guards on exact7c23, then candidate/main/tag identities separately','status':'PENDING_FRESH_ACTUAL290'},
  {'gate':'A2 core content and design','existing':'Actual independent synthetic LIB1–LIB4 semantics; local inputs/source/control unchanged; conditional Matt/design agreement forward reading. No critical unresolved design decision requires a new Matt interview in this release maintenance task.','requiredNow':'Verify frozen evidence closure and list actual limited scope; never claim new Matt interview/model evaluation/full AICS or new Owner acceptance','status':'SUPPORTED_WITH_EXPLICIT_LIMITS'},
  {'gate':'A3 agreed delivery main flow','existing':'Actual0.1.39 confirmedlocal delivery with static96/96, neutral desktop/mobile and exact ten-file regeneration. Same fixture old/new artifact only theme differs; HTML, JS, content and source raw bytes match; current JS matches. Relevant old0.1.37 observed interactions may be inherited by this exact resource closure, not renamed a new0.1.39 run.','requiredNow':'Record resource-inheritance-proof with exact paths/bytes/hashes and keep prior original12 cases vs newer neutral checks separate. Old Sites saved/deployed v1/v2 identity remains its old scope; no new Site is needed just to publish an unchanged Sites route, no local-mode retroactive Sites PASS.','status':'SUPPORTED_BOUNDED_INHERITANCE_AND_NEW_LOCAL_EVIDENCE'},
  {'gate':'A4 engineering and release boundary','existing':'Same resource licensing/default compatibility/negative cases and historical checks available; history/by-pass/unknown maintained','requiredNow':'Fresh actual290 checks; current releasecandidate full applicable checks, source/privacy/license closure and current-head CI; genuine protectedmain nonauthor/latestpusher approval, threads/latestbase; actualmain canonical/source and draft-first controls; postpublish actualtag canonical13/Python/cleanup and readback','status':'PENDING_CURRENT_RELEASE_GATES'},
 ],
 'requiredBeforePreparingCandidate':['Fresh actual290 local full Harness/strict/exactCLI results terminal and guards valid','Fresh actual290 canonical13/178 actualPython/static and15precise root cleanup terminal and independently reviewed','Confirm actual source/version/ancestry and keep all other packages/guide unchanged; do not bump again'],
 'requiredBeforeProtectedMainMerge':['One active releasePR on sameIssue274 after current develop stage ends','Candidate current-head checks/CI, source/license/privacy closure and package-resource evidence relation','Qualified real independent nonauthor/latestpusher approval; resolvedthreads and latestbase; never bypass','Release description and CHANGELOG ledger disclose limited inheritance, deferrals and old FAIL/UNKNOWN/approvalNOT_MET'],
 'requiredBeforeAndAfterPublication':['Normal protectedmain merge then read actualSHA/tree and VERSION/CHANGELOG','Use shipped draft-first emptyassets state machine; exact tag/target/body/prerelease/currentmain identity before publish','No overwrite/delete existing published tag/assets/history; unexpectedassets failclosed','Read published status/tag/body/assets/audience-relevant state then fresh realtag canonical13/Python/cleanup','Preserve known goodv8.3.3/.38; stop new upgrades on issue, use new protected fix/rollback PR; no unrequested periodic automation'],
 'deferredOrNotMeasured':['D01 native persistent unanswered window/emptyreturn/timeout/close remainsDEFERRED_NOT_PASS','Desktop menu dispatch/second genuine client/fullvisual-accessibility/extensions retain original gaps','No new model/Matt interview/Sites creation-save-deploy/productionrollback performed by this release scope review','UnderstandingEffectsNOT_MEASURED','OriginalOwnerACCEPTED_LIMITED applies to delivered0.1.37 core only, not.38/Sitev2/.39/fullplan'],
 'evidenceInheritance':{'proof':'resource-inheritance-proof.json','old12Execution':'Actual0.1.37 consumer/run02 2026-10-19T10:13:54.947Z–10:13:58.316Z, not new0.1.39 execution','newLocalAndNeutral':'Actual0.1.39 align274 independent local and theme evidence, not repeated now','exactFixtureDifference':'artifact.json theme only; index.html/learning.js/content.md/renewalrules exact; current learning.js same','resourceHashesIncluded':True},
 'decisionIfBoundaryChanges':'Only if actual scope/object/environment/permission/risk changes, a core criterion cannot be met and the Owner must choose scope reduction, or publicSite audience/new goal is requested: pause only that dependency and request reasoned options. No such unresolved decision found now.',
 'nextRecommendation':'After independently confirmed fresh actual290 verification, prepare one8.3.4/HTML0.1.39 releasePR→protectedmain, no newbump/no Siteupdate/no acceptance rewrite. Complete actual current release gates before normal merge/draft-first publication.',
 'privateB2Handling':'No complete B2 text/API body copied. Capture metadata/hash/private restore pointer stays in existing canonical source binding.',
}
f=OUT/'summary.json';assert not f.exists();f.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'proofChecks':len(checks),'allTrue':all(checks.values()),'canPrepareReleasePR':summary['canPrepareReleasePR'],'requiredOwnerDecisions':summary['requiredOwnerDecisions'],'formalReleaseReady':False,'proof':str(OUT/'resource-inheritance-proof.json'),'summary':str(f)},ensure_ascii=False))
