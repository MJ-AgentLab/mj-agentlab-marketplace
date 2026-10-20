import pathlib,subprocess,json,hashlib,datetime,base64,re
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-postmerge-audit/release-and-push');repo='MJ-AgentLab/mj-agentlab-marketplace';merge='62945150df984e2747684d1ea46b8772b56db2d9'
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def api(endpoint,name,jsonout=True):
    start=utc();p=subprocess.run(['gh','api',endpoint],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    (base/name).write_bytes(p.stdout)
    if p.stderr:(base/(name+'.stderr.txt')).write_bytes(p.stderr)
    rec={'endpoint':endpoint,'file':name,'started_at':start,'completed_at':utc(),'exit_code':p.returncode,'bytes':len(p.stdout),'sha256':hashlib.sha256(p.stdout).hexdigest(),'method':'gh api stdout byte buffer; close write before hash'}
    (base/(name+'.capture.json')).write_text(json.dumps(rec,indent=2)+'\n',encoding='utf8')
    if p.returncode:raise RuntimeError(p.stderr.decode('utf8',errors='replace'))
    return json.loads(p.stdout) if jsonout else rec
pages={};counts={};candidates={}
for kind in ['releases','tags']:
    collected=[];records=[];page=1
    while True:
        data=api(f'repos/{repo}/{kind}?per_page=100&page={page}',f'{kind}-page-{page:03d}.json')
        records.append({'page':page,'count':len(data),'file':f'{kind}-page-{page:03d}.json'});collected.extend(data)
        if not data:break
        page+=1
    pages[kind]=records;counts[kind]=len(collected)
    if kind=='releases':candidates[kind]=[{'id':r['id'],'tag_name':r['tag_name'],'name':r['name'],'draft':r['draft'],'prerelease':r['prerelease']} for r in collected if r['tag_name'].removeprefix('v')=='8.3.3' or '8.3.3' in (r['name'] or '')]
    else:candidates[kind]=[r for r in collected if r['name'].removeprefix('v')=='8.3.3']
    (base/f'{kind}-all-rows.json').write_text(json.dumps(collected,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
path='plans/274-html-learning-artifact/evidence/sources/postmerge/release278/publication/release-final.json'
content=api(f'repos/{repo}/contents/{path}?ref={merge}','frozen-release-final-content.json');frozenbytes=base64.b64decode(content['content']);(base/'frozen-v8.3.2-release-final.json').write_bytes(frozenbytes);frozen=json.loads(frozenbytes)
current=json.loads((base/'release-417390526.json').read_text(encoding='utf8'));cb=(current['body'] or '').encode('utf8');fb=(frozen['body'] or '').encode('utf8');(base/'v8.3.2-current-body.raw.txt').write_bytes(cb);(base/'v8.3.2-frozen-body.raw.txt').write_bytes(fb)
meta=api(f'repos/{repo}/git/commits/{merge}','actual-merge-git-commit.json')
jobrec=api(f'repos/{repo}/actions/jobs/118375345914/logs','push-job-118375345914.raw.log',False)
run=json.loads((base/'push-run.json').read_text(encoding='utf8'));wfpath=run['path'].split('@')[0]
wfcontent=api(f'repos/{repo}/contents/{wfpath}?ref={merge}','push-workflow-at-merge-content.json');wfbytes=base64.b64decode(wfcontent['content']);(base/'push-workflow-at-merge.raw.yml').write_bytes(wfbytes)
lines=[re.sub(r'^\d{4}-\d\d-\d\dT[^ ]+ ','',l) for l in (base/jobrec['file']).read_text(encoding='utf8').splitlines()]
result={'captured_at':utc(),'full_list_pages':pages,'list_counts':counts,'v8.3.3_list_matches':candidates,'release_body':{'current_bytes':len(cb),'current_sha256':hashlib.sha256(cb).hexdigest(),'frozen_bytes':len(fb),'frozen_sha256':hashlib.sha256(fb).hexdigest(),'exact_bytes_equal':cb==fb,'frozen_source_commit':merge,'frozen_source_path':path,'frozen_git_blob_sha':content['sha'],'frozen_release_id':frozen['id']},'actual_merge':{'sha':meta['sha'],'tree':meta['tree']['sha'],'parents':[p['sha'] for p in meta['parents']]},'push_log':jobrec,'push_checkout_next_lines':[{'command_line':i+1,'sha_line':i+2,'sha':lines[i+1]} for i,l in enumerate(lines[:-1]) if re.search(r'\blog -1 --format=%H$',l)],'push_workflow':{'path':wfpath,'source_ref':merge,'git_blob_sha':wfcontent['sha'],'bytes':len(wfbytes),'sha256':hashlib.sha256(wfbytes).hexdigest()}}
(base/'collection-summary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(result,ensure_ascii=False,indent=2))
