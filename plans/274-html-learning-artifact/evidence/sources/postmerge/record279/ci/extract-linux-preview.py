import json,pathlib,sys
root=pathlib.Path(sys.argv[1]);source=(root/'extract-ci.py').read_text(encoding='utf-8')
namespace={'__name__':'platform_preview'}
exec(source.split('\ntry:\n')[0],namespace)
result=namespace['extract']('linux',118128777317)
(root/'linux-summary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({key:result[key] for key in ['tap','executionCounts','commands','checkedOutSha','cleanupCases','cleanupScope']},ensure_ascii=False))
