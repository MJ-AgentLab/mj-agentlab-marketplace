import json,pathlib,sys,tempfile
bundle=json.load(sys.stdin)
with tempfile.TemporaryDirectory(prefix='html-lifecycle-review-transfer-') as temporary:
 root=pathlib.Path(temporary);module=root/'check_renderings.py';module.write_text(bundle['module']);sys.argv=['session-probe.py',str(module),str(root/'report.json')];exec(compile(bundle['probe'],'session-probe.py','exec'))
