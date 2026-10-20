from pathlib import Path
import datetime,hashlib,json,sys

ROOT=Path(__file__).resolve().parent
EXPECTED='5898a8192740b39f41263129a5f99efeba96a6cc'
TREE='3a68976af95bb5948de17a6fccaabf892becaaca'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda name:json.loads((ROOT/name).read_bytes())
def write(p,value):
    with p.open('x',encoding='utf-8') as f:f.write(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
launch=read('launch-result.json');result=read('run-result.json');audit=read('independent-audit.json');config=read('run-config.json')
before=read('tag-binding-before.json');after=read('tag-binding-after.json');report=read('smoke-report.json')
assert launch['finishedAt'] and launch['overall']=='PASS_LIMITED'
assert [launch[k] for k in ['outerExit','auditExit','tagProbeBeforeExit','tagProbeAfterExit']]==[0]*4
assert result['canonicalSha']==config['canonicalSha']==audit['sourceSha']==EXPECTED
assert result['canonicalTree']==config['canonicalTree']==audit['sourceTree']==TREE
assert result['startedAt'] and result['finishedAt'] and result['exitCode']==0 and result['signal'] is None
assert result['overall']=='PASS_PENDING_INDEPENDENT_AUDIT' and not result.get('evidenceAnalysisError')
expectedguards={'hostHeadTreePreserved','hostCleanPreserved','primaryPreserved','ownerOriginalPreserved','fullWorktreeInventoryPreserved','outerAndChildSameTemporaryRoot','shortTempEmpty','exactFifteenRootsAndAbsence'}
assert set(result['guards'])==expectedguards and all(result['guards'].values())
assert audit['status']=='PASS_LIMITED' and len(audit['checks'])==audit['checkCount']==26 and all(c['passed'] for c in audit['checks'])
for k in ['ref','remoteURL','tagObject','tagObjectType','peeledCommit','tree','release','releaseBody']:assert before[k]==after[k],k
assert before['ref']=='refs/tags/v8.3.4' and before['peeledCommit']==EXPECTED and before['tree']==TREE and before['releasePublished'] and after['releasePublished']
assert before['releaseBody']=={'bytes':1677,'sha256':'93f4459e8718b06eae19dc6aa82397eacce723470f8fd6e33214fb489d542d38'}
assert report['tagInstallationSource']['peeledCommit']==EXPECTED and report['tagInstallationSource']['ref']==before['ref']
assert launch['manualOwnedRootCleanupPerformed'] is False and result['cleanup']['manualRootCleanupPerformed'] is False
assert launch['shortTempContainer']['removed'] and launch['shortTempContainer']['existsAfter'] is False and not Path(config['shortTemp']).exists()
for name in ['stdout.log','stderr.log']:
    b=(ROOT/name).read_bytes();label=name.split('.')[0]
    assert result[label]=={'bytes':len(b),'sha256':sha(b)}
rawreceipts=[]
for p in ROOT.rglob('*.receipt.json'):
    r=json.loads(p.read_bytes());assert r['exitCode']==0,p
    if 'stdout' in r:
        stem=p.name.removesuffix('.receipt.json')
        for stream in ['stdout','stderr']:
            b=p.with_name(stem+'.'+stream).read_bytes()
            assert r[stream]=={'bytes':len(b),'sha256':sha(b)},p
    rawreceipts.append(p.relative_to(ROOT).as_posix())
summary={'schema':'html274-real-v834-tag-installation-v1','status':'PASS_LIMITED','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualTag':before,'afterTag':after,'startedAt':result['startedAt'],'finishedAt':launch['finishedAt'],'hostSha':config['expectedHead'],'hostTree':config['expectedTree'],'actualCounts':audit['actualCounts'],'auditChecks':audit['checkCount'],'guards':result['guards'],'cleanup':result['cleanup'],'temporaryContainer':launch['shortTempContainer'],'tools':read('tools.json'),'rawReceiptCount':len(rawreceipts),'rawReceipts':rawreceipts,'scope':'One new real remote v8.3.4 tag-bound installation batch. The existing repository Harness has only a canonicalSha argument: exact remote refs/tags/v8.3.4 is resolved and bound to its peeled commit/tree before installation and re-read afterward; that resolved SHA is passed to unchanged verifyReleaseInstall. Individual CLI calls are isolated local marketplace installs, not CLI --ref v8.3.4 calls. Installed cache metadata/resource hashes are retained in smoke-report.json.','limits':audit['limits'],'nextRecommendation':'Combine actual-main and published-tag independent evidence, update #274 release/closeout records, and retain all original failures, protected approval gaps, D01 deferral, unmeasured effects and limited Owner acceptance.'}
write(ROOT/'terminal-summary.json',summary)
paths=sorted((p for p in ROOT.rglob('*') if p.is_file()),key=lambda p:p.relative_to(ROOT).as_posix())
rows=[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in paths]
manifest=ROOT.with_name('real-tag-smoke-freeze.json')
write(manifest,{'schema':'html274-real-v834-tag-installation-freeze-v1','root':str(ROOT),'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fileCount':len(rows),'files':rows})
live=sorted(p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file())
assert live==[r['path'] for r in rows]
for row in rows:
    b=(ROOT/row['path']).read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256']
print(json.dumps({'status':summary['status'],'fileCount':len(rows),'freeze':str(manifest),'freezeSha256':sha(manifest.read_bytes()),'summarySha256':sha((ROOT/'terminal-summary.json').read_bytes())}))
