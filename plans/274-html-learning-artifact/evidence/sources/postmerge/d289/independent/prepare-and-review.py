import ast,datetime,hashlib,json,pathlib

OUT=pathlib.Path(__file__).resolve().parent
ROOT=OUT.parent
source=ROOT/'execute-prebump.py'
data=source.read_bytes();text=data.decode('utf-8');ast.parse(text,filename=str(source))
review=OUT/'prebump-review-v1';review.mkdir(exist_ok=False)
(review/'execute-prebump-reviewed.py').write_bytes(data)
findings=[
 {'id':'R1','priority':'BEFORE_GO','title':'Bind finished prerequisite receipts to the actual develop identity and independent result','evidence':'Current code accepts aggregate smoke/local booleans but does not assert their recorded source SHA/tree or a completed independent audit.','recommendation':'Require smoke config/result canonicalSHA and tree f3e8/6daad, local launch and before/after source identity, terminal timestamps, and the new independent audit PASS before version writes.'},
 {'id':'R2','priority':'BEFORE_GO','title':'Check tracked key sets, HEAD and complete final status paths after DryRun and Apply','evidence':'Current changed list iterates only previous tracked names and has no final git status check; a leftover untracked .bump-backup from tool cleanup could escape the assertion of exactly two modified files.','recommendation':'Assert identical tracked-key sets and unchanged HEAD, DryRun no status changes, Apply exact two tracked modifications README.md and VERSION with no untracked/unmerged paths; verify VERSION bytes and exact README badge replacement.'},
 {'id':'R3','priority':'REPORTING','title':'Distinguish bounded command scope from externally observed absence of publication changes','evidence':'summary noReleaseTagOrSiteMutation=True is a hard-coded statement; this script does not read external publication or Site state.','recommendation':'Label it as no publish/tag/Sites mutation commands invoked, or separately retain fresh readbacks. Do not present a static code-scope assertion as live publication evidence.'}
]
summary={'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'READ_ONLY_REVIEW_CHANGES_RECOMMENDED_BEFORE_GO','reviewedPath':str(source),'reviewedBytes':len(data),'reviewedSha256':hashlib.sha256(data).hexdigest(),'authorization':'User authorized actualdevelop verification then marketplace-only8.3.4 preparation; no new product decision or publication authorization inferred.','positive':['Explicit --go required.','Frozen host HEAD f3e8 and clean tree precondition.','marketplace scope From8.3.3 To8.3.4; DryRun before Apply.','Actual bumped script marketplace targets are VERSION and README.md only; no plugin manifest target.','Tracked before/after hashes and plugin versions checked; exact README badge bytes checked.','No commit, push, merge, tag, release or Sites command in the reviewed execution path.'],'findings':findings,'actualPrerequisites':'RUNNING_OR_NOT_YET_INDEPENDENTLY_ATTESTED; no PASS claimed','newOwnerDecisionRequired':False,'nextRecommendation':'Strengthen these routine guards, finish the two current unique batches, and run independent terminal evidence audit before explicit version GO.'}
(review/'review.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
files=[]
for file in sorted(review.iterdir()):
    b=file.read_bytes();files.append({'path':file.name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
(OUT/'prebump-review-v1-freeze.json').write_text(json.dumps({'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'root':str(review),'files':files},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':summary['status'],'findings':len(findings),'sourceSha256':summary['reviewedSha256'],'noActualPrebumpExecutedByReviewer':True}))
