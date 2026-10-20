"""Supplement only: independently inspect original PR attempt1 Windows smoke resource/inventory/cleanup evidence. Does not rerun anything or modify frozen stage."""
import datetime,hashlib,json,pathlib,re
root=pathlib.Path('C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-ci');out=root/'attempt1-windows-supplement';out.mkdir(exist_ok=False)
s=json.loads((root/'windows-smoke.json').read_text());p=json.loads((root/'windows-parsed.json').read_text());resources={};differences=[]
for i,row in enumerate(s['scenarios']):
    for key,entries in row['installedResources'].items():
        if key in resources and entries!=resources[key]:differences.append({'scenario':i,'skill':key})
        resources[key]=entries
assert not differences and len(resources)==8 and len(resources['html-guide-kit:site'])==20
assert s['outside']=={'publicSkills':3,'repositorySkills':0} and s['repository']=={'publicSkills':3,'repositorySkills':20}
assert s['nativeOutside']=={'publicSkills':8,'repositorySkills':0} and s['nativeRepository']=={'publicSkills':8,'repositorySkills':20}
assert len(s['explicitOnly'])==5
assert all(row['ok'] for row in s['scenarios'])
raw=(root/'windows-job.log').read_bytes();text='\n'.join(re.sub(r'^\d{4}-\d\d-\d\dT\S+Z ', '', line)for line in raw.decode('utf-8-sig').splitlines())
cases=[{'status':a,'number':int(b),'name':c,'skipped':'# SKIP' in c}for a,b,c in re.findall(r'(?m)^(ok|not ok) (\d+) - ([^\n]+)$',text)]
summary={'schema':1,'extractedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'runId':39292125277,'attempt':1,'jobId':118195194932,'head':'1d8b6849ec7e398d65a949d204abe38bc64a4e0b','actualCheckout':p['actualCheckout'],'tree':'eefcaa0f1bd4201a38f9d46ff668c28b7d662e8c','rawSha256':hashlib.sha256(raw).hexdigest(),'resourceSkillCount':len(resources),'siteResourceCount':len(resources['html-guide-kit:site']),'allSameSkillResourcesStableAcrossScenarios':True,'installedResources':resources,'inventory':{k:s[k]for k in ['outside','repository','nativeOutside','nativeRepository','explicitOnly']},'sourceToCacheIdentity':'Harness succeeded within this actual Windows checkout; source/cache equality asserted by completed smoke. Cross-platform physical bytes not asserted.','cleanupCases':[c for c in cases if any(w in c['name'].lower()for w in ['cleanup','cleans','cleaning','temporary','finally','owned session'])],'smokeCleanup':{'keepRoot':False,'returnedOkAfterCleanup':s['ok'],'individualRootAbsence':'NOT_RECORDED'},'siteBrowserChecks':[r['siteValidation'].get('browserCheck')for r in s['scenarios']if r.get('siteValidation')],'limits':['This Windows supplement cannot replace original PR Linux failure or push failures.','Smoke browserCheck NOT_RUN is distinct from actual browser unit case328 success.']}
(out/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
method=pathlib.Path(__file__).read_bytes();(out/'extract-method.py').write_bytes(method)
manifest={'schema':1,'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceRaw':{'path':'../windows-job.log','bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()},'files':[{'path':f.name,'bytes':len(f.read_bytes()),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}for f in sorted(out.iterdir())]}
(out/'final-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8');print(json.dumps({'directory':str(out),'manifestSha256':hashlib.sha256((out/'final-manifest.json').read_bytes()).hexdigest(),'resources':len(resources),'siteResources':len(resources['html-guide-kit:site']),'cleanupCases':len(summary['cleanupCases']),'smokeBrowserStatus':[b.get('status')if isinstance(b,dict)else b for b in summary['siteBrowserChecks']]}))
