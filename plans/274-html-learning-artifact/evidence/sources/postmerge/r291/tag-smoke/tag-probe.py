import datetime,hashlib,json,pathlib,re,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parent
REPO=pathlib.Path('C:/Users/Admin/.codex/worktrees/html-alignment-sync/develop')
REPOSITORY='MJ-AgentLab/mj-agentlab-marketplace'
REF='refs/tags/v8.3.4'
EXPECTED_SHA='5898a8192740b39f41263129a5f99efeba96a6cc'
EXPECTED_TREE='3a68976af95bb5948de17a6fccaabf892becaaca'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(b):return hashlib.sha256(b).hexdigest()
stage=sys.argv[1];assert stage in ['preflight','before','after']
directory=ROOT/('remote-tag-'+stage);directory.mkdir(exist_ok=False)
def capture(name,args):
    start=now();r=subprocess.run(args,cwd=REPO,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    for suffix,b in [('stdout',r.stdout),('stderr',r.stderr)]:
        with (directory/(name+'.'+suffix)).open('xb') as f:f.write(b)
    receipt={'args':args,'cwd':str(REPO),'startedAt':start,'finishedAt':now(),'exitCode':r.returncode,'stdout':{'bytes':len(r.stdout),'sha256':sha(r.stdout)},'stderr':{'bytes':len(r.stderr),'sha256':sha(r.stderr)}}
    with (directory/(name+'.receipt.json')).open('x',encoding='utf-8') as f:json.dump(receipt,f,indent=2)
    assert r.returncode==0,(name,r.returncode,r.stderr.decode(errors='replace'))
    return r.stdout
def api(name,path):return json.loads(capture(name,['gh','api','repos/'+REPOSITORY+'/'+path]))
url=capture('remote-url',['git','remote','get-url','origin']).decode().strip()
assert re.fullmatch(r'(https://github\.com/|git@github\.com:)MJ-AgentLab/mj-agentlab-marketplace(?:\.git)?',url),url
raw=capture('remote-ref',['git','ls-remote','--tags',url,REF,REF+'^{}'])
rows=dict(line.split('\t')[::-1] for line in raw.decode().splitlines())
assert REF in rows and set(rows)<={REF,REF+'^{}'},rows
ref=api('tag-ref','git/ref/tags/v8.3.4');obj=ref['object'];assert ref['ref']==REF and rows[REF]==obj['sha']
tag_object=obj['sha'];tag_type=obj['type'];chain=[]
while obj['type']=='tag':
    assert len(chain)<8
    tag=api('annotated-tag-'+str(len(chain)),'git/tags/'+obj['sha']);chain.append(tag);obj=tag['object']
assert obj['type']=='commit' and obj['sha']==EXPECTED_SHA
assert rows.get(REF+'^{}',rows[REF])==EXPECTED_SHA
commit=api('peeled-commit','git/commits/'+obj['sha']);assert commit['sha']==EXPECTED_SHA and commit['tree']['sha']==EXPECTED_TREE
local_commit=capture('local-commit-object',['git','cat-file','-p',EXPECTED_SHA]);assert local_commit.decode().splitlines()[0]=='tree '+EXPECTED_TREE
release=api('release','releases/tags/v8.3.4')
assert release['tag_name']=='v8.3.4' and release['name']=='v8.3.4' and release['draft'] is False and release['prerelease'] is False and release['published_at'] and release['target_commitish']==EXPECTED_SHA,release
body=release['body'].encode('utf-8')
assert len(body)==1677 and sha(body)=='93f4459e8718b06eae19dc6aa82397eacce723470f8fd6e33214fb489d542d38'
with (directory/'release-body.bin').open('xb') as f:f.write(body)
summary={'capturedAt':now(),'ref':REF,'remoteURL':url,'tagObject':tag_object,'tagObjectType':tag_type,'annotatedChain':chain,'peeledCommit':EXPECTED_SHA,'tree':EXPECTED_TREE,'releasePublished':True,'release':{k:release.get(k) for k in ['id','tag_name','name','target_commitish','draft','prerelease','published_at','created_at','immutable','html_url']},'releaseBody':{'bytes':len(body),'sha256':sha(body)},'rawDirectory':str(directory)}
if stage=='after':
    before=json.loads((ROOT/'tag-binding-before.json').read_bytes())
    for k in ['ref','remoteURL','tagObject','tagObjectType','peeledCommit','tree','release','releaseBody']:assert before[k]==summary[k],('public tag changed',k)
with (ROOT/('tag-binding-'+stage+'.json')).open('x',encoding='utf-8') as f:f.write(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False))
