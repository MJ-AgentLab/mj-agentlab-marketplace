import hashlib, importlib.util, json, pathlib, subprocess, sys
repo=pathlib.Path(sys.argv[1]); root=pathlib.Path(sys.argv[2]); scripts=repo/'plugins/html-guide-kit/skills/site/scripts'; bundle=root/'markdown-index-output'
subprocess.run(['node',str(scripts/'render-site.mjs'),'--input',str(root/'input'),'--output',str(bundle)],check=True,capture_output=True)
artifact=json.loads((bundle/'artifact.json').read_text('utf8')); artifact['markdown']='index.html'; (bundle/'artifact.json').write_text(json.dumps(artifact),'utf8')
(bundle/'index.html').write_text('<p>No complete document structure.</p>','utf8'); manifest=json.loads((bundle/'artifact-manifest.json').read_text('utf8')); manifest['sourceSha256']=hashlib.sha256((bundle/'artifact.json').read_bytes()).hexdigest()
for item in manifest['files']:
 data=(bundle/item['path']).read_bytes();item.update(sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))
(bundle/'artifact-manifest.json').write_text(json.dumps(manifest),'utf8')
result=subprocess.run([sys.executable,'-B',str(scripts/'check_artifact.py'),'--input',str(bundle),'--output',str(root/'markdown-index-report.json')],capture_output=True,text=True,encoding='utf8');report=json.loads(result.stdout);print(json.dumps({'exit':result.returncode,'status':report['status'],'summary':report['summary'],'failures':[i['code'] for i in report['checks'] if i['status']=='FAIL']},indent=2));assert result.returncode==1 and report['status']=='FAIL' and report['summary']['pages']==1
