import base64, hashlib, importlib.util, json, os, re, shutil, subprocess, tarfile, time
from pathlib import Path
from urllib.request import ProxyHandler, build_opener
root = Path(os.environ['TEMP']) / 'html-learning-274-postmerge283-site-review'
qa = Path(os.environ['TEMP']) / 'html-learning-274-postmerge283-site'
artifact = root / 'artifact'
checker_path = qa / 'installation/plugins/html-guide-kit/skills/site/scripts/check_renderings.py'
spec = importlib.util.spec_from_file_location('site_review_checker', checker_path)
checker = importlib.util.module_from_spec(spec); spec.loader.exec_module(checker)
archive = qa / 'site-v2.tar'
archive_bytes = archive.read_bytes()
expected = {p.relative_to(artifact).as_posix(): p.read_bytes() for p in artifact.rglob('*') if p.is_file()}
members = []
with tarfile.open(archive, mode='r:gz') as source:
    for item in source.getmembers():
        if item.isdir(): continue
        if not item.isfile() or item.name.startswith('/') or '..' in Path(item.name).parts: raise ValueError('Unexpected archive member type/path')
        data = source.extractfile(item).read()
        local = item.name.removeprefix('./')
        matched = local.startswith('dist/') and local[5:] in expected and data == expected[local[5:]]
        hosting = json.loads(data) if local == 'dist/.openai/hosting.json' else None
        members.append({'path': item.name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'matchesArtifact': matched, 'hosting': hosting})
hosting_original = json.loads((Path('C:/Users/Admin/.codex/worktrees/html-learning-artifact/site-repair283') / '.openai/hosting.json').read_bytes())
extra = [x for x in members if not x['matchesArtifact']]
archive_report = {'capturedAt': checker.datetime.now(checker.timezone.utc).isoformat(), 'path': str(archive), 'bytes': len(archive_bytes), 'sha256': hashlib.sha256(archive_bytes).hexdigest(), 'members': members, 'artifactMatchCount': sum(x['matchesArtifact'] for x in members), 'onlyExpectedHostingExtra': len(extra) == 1 and extra[0]['path'].removeprefix('./') == 'dist/.openai/hosting.json' and extra[0]['hosting'] == hosting_original, 'uniquePaths': len({x['path'] for x in members}) == len(members), 'archiveExtractionPerformed': False}
(root / 'archive-review.json').write_text(json.dumps(archive_report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
if not (archive_report['artifactMatchCount'] == 10 and archive_report['onlyExpectedHostingExtra'] and archive_report['uniquePaths']): raise ValueError('Archive identity failed')

def rgb(value): return [int(x) for x in re.findall(r'\d+', value)[:3]]
def luminance(values):
    values = [x / 255 for x in values]
    linear = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in values]
    return sum(a*b for a,b in zip(linear,[.2126,.7152,.0722]))
def contrast(a,b):
    a,b=sorted([luminance(a),luminance(b)])
    return (b+.05)/(a+.05)
chrome = Path('C:/Program Files/Google/Chrome/Application/chrome.exe')
lifecycle=[]; views=[]; process=None; connection=None
with checker.owned_workspace(lifecycle) as temporary:
    temporary=Path(temporary); page_root=temporary/'artifact'; shutil.copytree(artifact,page_root); profile=temporary/'browser-profile'
    command=[str(chrome),'--headless=new','--disable-gpu','--disable-background-networking','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+str(profile),'--allow-file-access-from-files','about:blank']
    try:
        process=subprocess.Popen(command,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        opener=build_opener(ProxyHandler({})); deadline=time.monotonic()+15
        while time.monotonic()<deadline:
            try:
                port=int((profile/'DevToolsActivePort').read_text().splitlines()[0])
                with opener.open(f'http://127.0.0.1:{port}/json/list',timeout=2) as response: targets=json.load(response)
                target=next(x for x in targets if x.get('type')=='page'); break
            except (OSError,ValueError,IndexError,StopIteration): time.sleep(.05)
        else: raise RuntimeError('No readable isolated Chrome endpoint')
        connection=checker.DevTools(target['webSocketDebuggerUrl'],20); connection.call('Page.enable'); version=connection.call('Browser.getVersion')
        for width,height in [(320,844),(1366,900)]:
            connection.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':False})
            connection.call('Page.navigate',{'url':(page_root/'index.html').as_uri()})
            deadline=time.monotonic()+20
            while True:
                state=connection.call('Runtime.evaluate',{'expression':'({url:location.href,ready:document.readyState})','returnByValue':True}).get('result',{}).get('value',{})
                if state.get('url')==(page_root/'index.html').as_uri() and state.get('ready')=='complete': break
                if time.monotonic()>deadline: raise TimeoutError('Navigation not ready')
                time.sleep(.05)
            expression="""(() => { const el=document.querySelector('#reflection'); el.scrollIntoView({block:'center'}); const css=getComputedStyle(el), body=getComputedStyle(document.body), r=el.getBoundingClientRect(); return { viewport:{width:innerWidth,height:innerHeight}, activeTag:document.activeElement.tagName, border:css.borderTopColor, borderWidth:css.borderTopWidth, background:css.backgroundColor, paper:body.backgroundColor, value:el.value, bounds:{left:r.left,top:r.top,right:r.right,bottom:r.bottom}, fullyVisible:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight }; })()"""
            observed=connection.call('Runtime.evaluate',{'expression':expression,'returnByValue':True}).get('result',{}).get('value',{})
            observed['borderToPaperContrast']=contrast(rgb(observed['border']),rgb(observed['paper']))
            observed['borderToWhiteContrast']=contrast(rgb(observed['border']),rgb(observed['background']))
            data=base64.b64decode(connection.call('Page.captureScreenshot',{'format':'png','fromSurface':True,'captureBeyondViewport':False})['data'])
            screenshot=root/'evidence'/f'control-{width}x{height}.png'; screenshot.write_bytes(data)
            observed.update({'screenshot':str(screenshot.relative_to(root)),'screenshotSha256':hashlib.sha256(data).hexdigest(),'status':'PASS' if observed['fullyVisible'] and observed['border']=='rgb(118, 118, 118)' and observed['borderToPaperContrast']>=3 and observed['borderToWhiteContrast']>=3 else 'FAIL'})
            views.append(observed)
    finally: checker.close_browser(process,connection,lifecycle)
report={'executedAt':checker.datetime.now(checker.timezone.utc).isoformat(),'status':'PASS' if len(views)==2 and all(x['status']=='PASS' for x in views) else 'FAIL','browser':str(chrome),'version':version,'views':views,'lifecycle':lifecycle,'scope':'Local initial blank reflection control only; programmatic scroll without focus, no claim of keyboard/copy interaction, native client, hosted deployment or full accessibility/effect evaluation.'}
(root/'control-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'archive':{k:v for k,v in archive_report.items() if k!='members'},'control':report},ensure_ascii=False,indent=2))
