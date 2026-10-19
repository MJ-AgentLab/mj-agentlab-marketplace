import hashlib, importlib.util, json, pathlib, shutil, subprocess, sys
repo=pathlib.Path(sys.argv[1]); root=pathlib.Path(sys.argv[2]); renderer=repo/'plugins/html-guide-kit/skills/site/scripts/render-site.mjs'
source=root/'input'; shutil.copytree(repo/'plugins/html-guide-kit/skills/site/examples/representative',source)
bundle=root/'output'; subprocess.run(['node',str(renderer),'--input',str(source),'--output',str(bundle)],check=True,capture_output=True)
checker=repo/'plugins/html-guide-kit/skills/site/scripts/check_artifact.py'
spec=importlib.util.spec_from_file_location('check_artifact',checker); module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
print('baseline',module.check_bundle(bundle)['status'])
artifact=json.loads((bundle/'artifact.json').read_text('utf8')); artifact['sources'].append({'id':'rendered','title':'Rendered HTML','locator':'whole output','path':'index.html'}); (bundle/'artifact.json').write_text(json.dumps(artifact),'utf8')
(bundle/'index.html').write_text('<p>Learning body removed: no doctype, title, html, head, body, h1, viewport, charset, language, local scripts or static exercise criteria.</p>','utf8')
manifest=json.loads((bundle/'artifact-manifest.json').read_text('utf8')); manifest['sourceSha256']=hashlib.sha256((bundle/'artifact.json').read_bytes()).hexdigest()
for item in manifest['files']:
 data=(bundle/item['path']).read_bytes(); item.update(sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))
(bundle/'artifact-manifest.json').write_text(json.dumps(manifest),'utf8')
report=module.check_bundle(bundle); (root/'excluded-html-report.json').write_text(json.dumps(report,indent=2),'utf8'); print('excluded HTML',report['status'],report['summary'])
