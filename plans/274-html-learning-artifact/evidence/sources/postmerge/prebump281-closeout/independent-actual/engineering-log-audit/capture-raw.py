import pathlib,json,hashlib,datetime
out=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-finalreview/engineering-log-audit');temp=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp')
records=[]
for kind,source in [('fulltest','html-learning-274-prebump281-actual-full-test.log'),('validate','html-learning-274-prebump281-actual-validate.log'),('baseline','html-learning-274-prebump281-actual-baseline.log')]:
    p=temp/source;start=datetime.datetime.now(datetime.timezone.utc).isoformat();data=p.read_bytes();target=out/(kind+'.raw.log');target.write_bytes(data)
    stable=p.read_bytes()==data;records.append({'kind':kind,'source':str(p),'snapshot':target.name,'captured_at':start,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'stable_during_capture':stable,'exit_code':0,'exit_code_provenance':'Root reported all three closed/exit0 through trusted parent; no inference that raw embeds process exit code.'})
(out/'source-receipts.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(records,ensure_ascii=False,indent=2))
