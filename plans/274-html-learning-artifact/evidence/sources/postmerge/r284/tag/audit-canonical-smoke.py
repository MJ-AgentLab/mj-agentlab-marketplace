import json,pathlib,hashlib,datetime
root=pathlib.Path(__file__).parent
read=lambda name:json.loads((root/name).read_text(encoding='utf8'))
result=read('run-result.json');before=read('before-snapshot.json');after=read('after-snapshot.json');report=read('smoke-report.json');command=read('command.json');roots=read('owned-roots-absence.json')
scenarios=report['scenarios'];commands=[dict(scenario=i+1,**c) for i,s in enumerate(scenarios) for c in s['commands']]
actualPython=[c for c in commands if any(str(arg).replace('\\','/').endswith(('/validate_diagram.py','/lek.py','/check_artifact.py')) for arg in c['args'])]
site=[s for s in scenarios if s.get('siteValidation')]
processTemp=pathlib.Path(command['processEnvironmentChanges']['TEMP']).resolve()
def childBoundary(record):
 p=pathlib.Path(record['root']).resolve()
 prefix={'canonical':'release-install-','template':'marketplace-smoke-source-','scenario':'marketplace-smoke-'}[record['kind']]
 return p.parent==processTemp and p.name.startswith(prefix)
recheck=[dict(record,existsAtAudit=pathlib.Path(record['root']).exists(),boundaryVerifiedAgainstProcessTemp=childBoundary(record)) for record in roots]
checks={
 'canonicalRealTagSha':result['observedTag']=='v8.3.3' and result['observedTagSha']=='fdede3cf5578dee8a41aef4310a9387d695c56bd',
 'canonicalTreeMatchesActualMainAndCandidate':result['canonicalTree']=='f71963c1d5640933e80fccfec3383681fb15333b',
 'hostHeadDistinctAndPreserved':result['beforeHead']=='cfbeb1bbf3e254ea3b33f5abe9c3eb5207c605a7' and result['headPreserved'],
 'hostCleanAndPreserved':before['status']=='' and after['status']=='' and result['statusPreserved'],
 'primaryAndOwnerOriginalPreserved':result['primaryPreserved'] and result['ownerOriginalPreserved'],
 'completeWorktreeInventoryRestored':before['worktrees']==after['worktrees'],
 'commandUsesCanonicalShippedVerifier':command['args'][0].endswith('run-canonical.mjs') and command['allowVersionDrift'] is False and command['keepRoot'] is False,
 'processOnlyShortTemporaryRoot':command['processEnvironmentChanges']['TEMP']=='D:/t274a' and command['processEnvironmentChanges']['TMP']=='D:/t274a',
 'runExitZero':result['exitCode']==0 and not result.get('evidenceAnalysisError'),
 'thirteenScenariosPass':len(scenarios)==13 and all(s.get('ok') is True for s in scenarios),
 'all178CommandsZero':len(commands)==178 and all(c['status']==0 for c in commands),
 'exactCliBaseline':all(s['version']=='codex-cli 0.147.0' for s in scenarios),
 'sixDiagramActualPython':sum(s.get('diagramValidation') is not None for s in scenarios)==6 and sum(any(str(a).replace('\\','/').endswith('/validate_diagram.py') for a in c['args']) for c in actualPython)==6,
 'eighteenLearningEvidenceActualPython':sum(any(str(a).replace('\\','/').endswith('/lek.py') for a in c['args']) for c in actualPython)==18,
 'fourSiteGenerationAndActualPython':len(site)==4 and sum(any(str(a).replace('\\','/').endswith('/check_artifact.py') for a in c['args']) for c in actualPython)==4,
 'fourSiteStatic95ChecksZeroFail':all(s['siteValidation']['checked']['status']=='PASS' and s['siteValidation']['checked']['summary']['failed']==0 and s['siteValidation']['checked']['summary']['checks']==95 for s in site),
 'htmlVersion0138':all('/html-guide-kit/0.1.38/' in s['siteValidation']['skillPath'].replace('\\','/') for s in site),
 'site20AndGuide4InstalledResources':all(len(s['installedResources']['html-guide-kit:site'])==20 and len(s['installedResources']['html-guide-kit:guide'])==4 for s in site),
 'browserNotRunPreserved':all(s['siteValidation']['browserCheck'].startswith('NOT_RUN') for s in site),
 'fifteenObservedOwnedRoots':len(roots)==15 and sum(r['kind']=='canonical' for r in roots)==1 and sum(r['kind']=='template' for r in roots)==1 and sum(r['kind']=='scenario' for r in roots)==13,
 'allRootBoundariesAndAbsence':len(roots)>0 and all(r['boundaryVerifiedAgainstProcessTemp'] and not r['existsAfter'] and not r['existsAtAudit'] for r in recheck),
 'noManualCleanup':result['cleanup']['manualCleanupPerformed'] is False,
 'dedicatedShortTempEmpty':pathlib.Path('D:/t274a').is_dir() and not any(pathlib.Path('D:/t274a').iterdir())
}
audit={'auditedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'result':('PASS_LIMITED_WITH_RAW_HELPER_GUARD_FAIL' if result['cleanup']['allBoundariesVerified'] is False else 'PASS_LIMITED') if all(checks.values()) else 'FAIL','checks':checks,'allChecksPass':all(checks.values()),'checkCount':len(checks),'startedAt':result['startedAt'],'finishedAt':result['finishedAt'],'canonicalSha':result['observedTagSha'],'hostSha':result['beforeHead'],'tree':result['canonicalTree'],'counts':{'scenarios':len(scenarios),'commands':len(commands),'actualPython':len(actualPython),'diagram':6,'learningEvidence':18,'site':4},'site':[{'installed':s['installed'],'skillPath':s['siteValidation']['skillPath'],'staticSummary':s['siteValidation']['checked']['summary'],'resourceFiles':{'site':len(s['installedResources']['html-guide-kit:site']),'guide':len(s['installedResources']['html-guide-kit:guide'])},'browserCheck':s['siteValidation']['browserCheck']} for s in site],'discovery':{k:report.get(k) for k in ['outside','repository','nativeOutside','nativeRepository','explicitOnly']},'roots':recheck,'rawDriverGuard':{'allBoundariesVerified':result['cleanup']['allBoundariesVerified'],'interpretation':'Original driver used outer host os.tmpdir while child used explicitly recorded TEMP/TMP; original false values retained, corrected independent boundary recheck uses processTemp and direct-child/prefix constraints. No original driver/output edited.','processTemp':str(processTemp)},'rawOutput':result['stdout'],'rawError':result['stderr'],'limits':['New batch belongs to actual real-tag fdede, not candidate, previous CI or first default-TEMP method failure.','The short-TEMP driver boundary helper used the outer host default TEMP and produced a false boundary guard; original values remain; this separate audit verifies all observed direct children against recorded process TEMP.','Default-TEMP canonical checkout failed before installation; its frozen original is retained separately and this batch does not make that attempt pass.','No model, browser rendering, desktop, native waiting-window lifecycle, second client, Site deployment or learning-effect acceptance.','No GitHub independent protected approval or Owner full-plan/new-artifact acceptance inferred.'],'sourceMethod':'Shipped release-verify-install.mjs creates canonical detached worktree at real tag SHA; shipped runSmoke performs 13 fresh isolated installs; process-only Python PATH and short TEMP/TMP, no repository/global Git/source/gate change.'}
(root/'independent-audit.json').write_text(json.dumps(audit,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print(json.dumps({'result':audit['result'],'checks':checks,'rootCount':len(roots),'counts':audit['counts'],'discovery':audit['discovery']},indent=2))
