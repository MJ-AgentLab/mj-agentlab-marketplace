from pathlib import Path
import datetime, hashlib, json, re
root=Path(__file__).resolve().parent
def sha(data): return hashlib.sha256(data).hexdigest()
summary=json.loads((root/'summary.json').read_text(encoding='utf-8'))
assert summary['status']=='PASS'
for receipt in summary['receipts']:
    assert receipt['exitCode']==0 and receipt['headBefore']==receipt['headAfter']
    assert receipt['headBefore']['head']=='fdede3cf5578dee8a41aef4310a9387d695c56bd'
    assert receipt['headBefore']['statusBytes']==0
    for stream in ['stdout','stderr']:
        data=Path(receipt[stream]['path']).read_bytes()
        assert len(data)==receipt[stream]['bytes'] and sha(data)==receipt[stream]['sha256']
test=(root/'npm-test.stdout.log').read_text(encoding='utf-8')
counts={key:int(re.search(r'^# '+key+r' (\d+)$',test,re.M).group(1)) for key in ['tests','pass','fail','cancelled','skipped','todo']}
assert counts=={'tests':647,'pass':646,'fail':0,'cancelled':0,'skipped':1,'todo':0}
skips=[line for line in test.splitlines() if re.match(r'^ok \d+.*# SKIP',line)]
assert len(skips)==1 and 'Linux exec capture' in skips[0]
validate=(root/'npm-validate.stdout.log').read_text(encoding='utf-8')
strict=json.loads(validate[validate.index('{'):])
assert strict['ok'] is True and strict['errors']==[] and strict['repositorySkills']==20 and len(strict['publicSkills'])==8
baseline=(root/'npm-check-baseline-tools.stdout.log').read_text(encoding='utf-8')
assert 'actual=0.147.0  (exact-match)' in baseline and '0 of 1 pin(s) failed' in baseline
versions={label:(root/(label+'.stdout.log')).read_text(encoding='utf-8').strip() for label in ['node-version','npm-version','python-version','git-version']}
derived=dict(scope='Actual post-merge main source; Windows local engineering checks only',head=summary['finalState']['head'],tree=summary['finalState']['tree'],status='PASS',startedAt=summary['receipts'][0]['startedAt'],completedAt=summary['completedAt'],versions=versions,testCounts=counts,platformSkips=skips,strict={'ok':True,'repositorySkills':20,'publicSkillCount':8},baseline='Codex 0.147.0 exact-match',checksRunOnce=['npm ci','npm test','npm run validate','npm run check:baseline-tools'],sourceUnchanged=all(r['headBefore']==r['headAfter'] for r in summary['receipts']),limitations=['Standalone tag installation/smoke evidence is produced independently by another agent. No duplicate standalone smoke command was run here.','No new model, desktop/Side Chat, actual Matt interview, native persistent-window or real-world learning-effect acceptance was run.','Windows skips the Linux-only exec-capture test. No zero-skip or cross-platform local-run claim.','Historical failures, root-cause UNKNOWN, review gaps and deferred entrances are not superseded by these source checks.'],methodObservation='Initial PowerShell tree argument parse error preserved in tooling-observation.md; no product retry.')
(root/'derived-result.json').write_text(json.dumps(derived,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
files=[]
for path in sorted(root.rglob('*')):
    if path.is_file() and path.name!='freeze-manifest.json':
        data=path.read_bytes(); files.append(dict(path=path.relative_to(root).as_posix(),bytes=len(data),sha256=sha(data)))
manifest=dict(schema='html-post284-actual-main-checks-frozen-v1',frozenAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),root=str(root),fileCount=len(files),files=files)
target=root/'freeze-manifest.json'
assert not target.exists(), 'Refuse to overwrite frozen manifest'
target.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(status='FROZEN',fileCount=len(files),manifest=str(target),sha256=sha(target.read_bytes()),derived=derived),ensure_ascii=False))
