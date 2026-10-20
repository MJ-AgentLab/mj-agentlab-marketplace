from pathlib import Path
import json,base64,re,hashlib,zipfile,datetime
D=Path(__file__).resolve().parent
raw=lambda n:json.loads((D/(n+'.stdout')).read_text(encoding='utf-8'))
blob=lambda n:base64.b64decode(raw(n)['content'])
sha=lambda b:hashlib.sha256(b).hexdigest()
M='5898a8192740b39f41263129a5f99efeba96a6cc';T='3a68976af95bb5948de17a6fccaabf892becaaca';B='f18aa09be0cc4a96b5005157566f7f4fd4947c95';H='f344d0a4a77f1bd974fd0ba4b0cb5659c06c462d'
assert not (D/'summary.json').exists()
pr=raw('pr291')['data']['repository']['pullRequest'];commit=raw('actual-merge-commit');suite=raw('matched-rule-suite-1');run=raw('release-run-second');jobs=raw('release-jobs-second');release=raw('release834-final');old=raw('release833-final');tag=raw('tag834-final');oldtag=raw('tag833-final');latest=raw('latest-release-final');repo=raw('repository-metadata');provenance=json.loads(blob('actual-provenance'))
versions={'marketplace':blob('actual-version').decode().strip()}
for name in ['diagram-kit','learning-evidence-kit','explain-kit','communication-kit','html-guide-kit']:versions[name]=json.loads(blob('actual-manifest-'+name))['version']
changelog=blob('actual-changelog').decode('utf-8');section=re.search(r'^## \[8\.3\.4\].*?\n(.*?)(?=^## \[|\Z)',changelog,re.M|re.S).group(1);normalize=lambda s:s.replace('\r\n','\n').strip()
log=(D/'release-run-terminal-log.stdout').read_text(encoding='utf-8-sig');archive=D/'release-run-terminal-archive.stdout';entries=[]
with zipfile.ZipFile(archive) as z:
 crc=z.testzip();assert crc is None
 for item in z.infolist():
  if not item.is_dir():
   data=z.read(item);entries.append({'path':item.filename,'bytes':len(data),'sha256':sha(data)})
 full=z.read('0_Create Release.txt').decode('utf-8-sig')
 milestones=['release: canonical: v8.3.4@5898a8192740  phase=initial','release: action=create-draft','release: created empty draft.','release: canonical Git tree installation verified.','release: published v8.3.4.']
 positions=[full.index(x) for x in milestones];assert positions==sorted(positions)
 resultline=next(line for line in full.splitlines() if '{"ok":true,"result":"published"' in line);result=json.loads(resultline[resultline.index('{"ok":true'):])
metadataConfig=repo.get('immutable_releases') if isinstance(repo.get('immutable_releases'),bool) else 'UNKNOWN'
checks={
 'actualPR291MergedAtObservedTime':pr['merged'] and pr['mergedAt']=='2026-10-20T15:13:30Z',
 'actualMainMergeExactAndTreeCandidate':pr['mergeCommit']['oid']==M and pr['mergeCommit']['tree']['oid']==T and commit['sha']==M and commit['tree']['sha']==T,
 'actualNormalMergeParents': [x['oid'] for x in pr['mergeCommit']['parents']['nodes']]==[B,H],
 'freshMainStillActualMerge':raw('actual-main-final')['object']['sha']==M,
 'completeReviewReadbackZero':pr['reviews']['totalCount']==0 and pr['reviews']['nodes']==[] and not pr['reviews']['pageInfo']['hasNextPage'],
 'threadReadbackCompleteZero':pr['reviewThreads']['totalCount']==0 and not pr['reviewThreads']['pageInfo']['hasNextPage'],
 'suiteExactRefBeforeAfter':suite['ref']=='refs/heads/main' and suite['before_sha']==B and suite['after_sha']==M,
 'suiteActualBypassNotGuessed':suite['result']=='bypass' and suite['actor_name']=='ranzuozhou',
 'suiteApprovalFailOtherFourPass':sum(x['rule_type']=='pull_request' and x['result']=='fail' and 'last pusher' in x.get('details','') for x in suite['rule_evaluations'])==1 and sum(x['result']=='pass' for x in suite['rule_evaluations'])==4,
 'allFivePackageVersionsAndMarketScopeExact':versions=={'marketplace':'8.3.4','diagram-kit':'0.3.1','learning-evidence-kit':'0.1.0','explain-kit':'0.1.1','communication-kit':'0.1.0','html-guide-kit':'0.1.39'},
 'initialNewTagRelease404ArePending':str(raw('tag834-initial').get('status'))=='404' and str(raw('release834-initial').get('status'))=='404',
 'releaseRunExactSHAPathPushAttempt1Success':run['head_sha']==M and run['path']=='.github/workflows/release.yml' and run['event']=='push' and run['run_attempt']==1 and run['status']=='completed' and run['conclusion']=='success',
 'releaseJobSingleTerminalSuccess':jobs['total_count']==1 and len(jobs['jobs'])==1 and jobs['jobs'][0]['id']==118709472250 and jobs['jobs'][0]['status']=='completed' and jobs['jobs'][0]['conclusion']=='success',
 'releaseLogAndArchiveTransportSuccess':all(json.loads((D/(n+'.receipt.json')).read_text())['exitCode']==0 for n in ['release-run-terminal-log','release-run-terminal-archive']),
 'releaseArchiveCRCAndEntries':crc is None and len(entries)==13,
 'draftBeforeVerifyBeforePublishActualLogs':positions==sorted(positions) and all(x in log for x in milestones),
 'releaseFinalJSONMatchesCanonical':result['ok'] is True and result['result']=='published' and result['canonical']['sha']==M and result['canonical']['version']=='8.3.4' and normalize(result['canonical']['notes'])==normalize(section),
 'realTagDirectCommitSameActualSHA':tag['object']['type']=='commit' and tag['object']['sha']==M,
 'releaseTagTargetPublishedExact':release['tag_name']=='v8.3.4' and release['target_commitish']==M and release['published_at']=='2026-10-20T15:16:38Z',
 'releaseNotDraftNotPrereleaseNoAssets':release['draft'] is False and release['prerelease'] is False and release['assets']==[],
 'releaseBodyMatchesActualChangelogNormalized':normalize(release['body'])==normalize(section),
 'releaseBody1677PinnedSHA':len(release['body'].encode())==1677 and sha(release['body'].encode())=='93f4459e8718b06eae19dc6aa82397eacce723470f8fd6e33214fb489d542d38',
 'latestReleaseActually834':latest['id']==release['id'] and latest['tag_name']=='v8.3.4',
 'releaseImmutableFalseConfigNotAssumed':release['immutable'] is False and metadataConfig=='UNKNOWN',
 'old833TagAndTargetPreserved':oldtag['object']['sha']=='fdede3cf5578dee8a41aef4310a9387d695c56bd' and old['target_commitish']=='fdede3cf5578dee8a41aef4310a9387d695c56bd',
 'old833Body2507PinnedSHA':len(old['body'].encode())==2507 and sha(old['body'].encode())=='11fc9f4c0231ba5aebda7a7d3add60ed8f506a943e2ff516d5c2c8b27c5b069c',
 'old833PublicAssetsAndImmutablePreserved':old['draft'] is False and old['prerelease'] is False and old['assets']==[] and old['immutable'] is False,
 'provenanceByteIdentityAndNoRuntimeResearch':sha(blob('actual-provenance'))=='8a6b1057794ba9aa6ca0fa9d76f7b63599b98b199a97018c765d2d1ae8248830' and provenance['runtime']=='Package-local resources only; source locators are provenance, never runtime inputs',
 'privateFullPromptRightsRemainUnestablishedSynthesisOnly':len(provenance['methodRevisions'])==1 and provenance['methodRevisions'][0]['sha256']=='2923fca7e6c77f618b84a3afb4dd05ff14f8777a22088c44a0f883b92217d15f' and 'no full research prompt redistributed' in provenance['methodRevisions'][0]['mode'] and 'not established' in provenance['methodRevisions'][0]['license'],
 'localSourcesNotRelicensedAndUpstreamIndependentApache':all('No distribution license found' in x['license'] and 'no verbatim research code or text redistributed' in x['mode'] for x in provenance['sources'] if x['kind']=='local-research') and all(x['license']=='Apache-2.0' and 'no upstream runtime or source text copied' in x['mode'] for x in provenance['sources'] if x['kind']=='upstream-reference')
}
assert all(checks.values()),checks
zipmeta={'path':archive.name,'bytes':archive.stat().st_size,'sha256':sha(archive.read_bytes()),'crcTest':crc,'entries':entries}
(D/'release-archive-verification.json').write_text(json.dumps(zipmeta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(D/'reader-method-notes.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'notes':[{'kind':'READ_PATH_METHOD_ERROR','detail':'An independent read-only rg command included nonexistent scripts/lib alongside existing scripts/run-release.mjs. rg printed path not found; the real source file read succeeded. This is not a product check or publication failure. Original stderr was not separately captured; the tool transcript retains its returned text. Later exact actual-SHA source API reads were used.','toolReturnedLine':'rg: C:/Users/Admin/.codex/worktrees/html-alignment-sync/develop/scripts/lib: The system cannot find the file specified. (os error 2)'},{'kind':'EXPECTED_PENDING_OBSERVATION','detail':'Initial new tag/Release HTTP404 and release run in_progress were retained. Second query after84.429794seconds observed actual publication; no workflow rerun or mutation by reviewer.'}]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
out={'schemaVersion':1,'reviewer':'/root/alignment_sync_contract_review','reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PUBLIC_IDENTITY_VERIFIED_WITH_HISTORICAL_PROTECTED_APPROVAL_NOT_MET','checkCount':len(checks),'allReadbackChecksTrue':True,'checks':checks,'actualMerge':{'sha':M,'tree':T,'parents':[B,H],'mergedAt':pr['mergedAt'],'mergedBy':pr['mergedBy']['login'],'reviews':[],'ruleSuite':suite['id'],'ruleResult':'bypass','protectedApproval':'NOT_MET','pullRequestRuleResult':'fail: approval from someone other than last pusher missing','otherRulePasses':4,'reviewerDidNotMerge':True},'published':{'tag':'v8.3.4','releaseId':release['id'],'publishedAt':release['published_at'],'sha':M,'tree':T,'draft':False,'prerelease':False,'assets':[],'latest':True,'bodyBytes':1677,'bodySha256':sha(release['body'].encode()),'bodyMatch':'Actual main CHANGELOG8.3.4 section, CRLF-to-LF and trim only','immutable':False,'repositoryImmutableConfiguration':'UNKNOWN','url':release['html_url']},'versions':versions,'releaseWorkflow':{'id':run['id'],'event':'push','head':M,'attempt':1,'conclusion':'success','job':jobs['jobs'][0]['id'],'draftFirstMilestones':milestones,'archiveVerification':'release-archive-verification.json','canonicalInstallationScope':'Workflow canonical Git tree verification observed in original logs; not this turn independent actualmain or realtag13/Python/15root acceptance. Original workflow logs do not enumerate those fresh run counts.','immutabilityLogLimit':'Workflow prints not-enabled because production probe defaults missing immutable_releases field to false; fresh metadata does not expose the setting. Keep configuration UNKNOWN; only Release immutable=false is actual observation.'},'old833':{'tagReleaseSHA':'fdede3cf5578dee8a41aef4310a9387d695c56bd','bodyBytes':2507,'bodySha256':sha(old['body'].encode()),'assets':[],'immutable':False,'preserved':True},'licensing':{'actualProvenanceSha256':sha(blob('actual-provenance')),'sourceRows':len(provenance['sources']),'methodRows':1,'mode':'Original local synthesis/independent implementation only. No redistribution permission inferred from research access; no private B2 full body copied. Existing generated-output notices/license gates inherit by exact complete tree identity.','candidateAndActualTreeEqual':True},'canStartFreshRealTagInstallation':True,'tagWorkerPinnedIdentity':{'ref':'v8.3.4','expectedSHA':M,'expectedTree':T,'marketplace':'8.3.4','html':'0.1.39'},'independentActualMainAndRealTagAcceptance':'PENDING_SEPARATE_WORKERS_NOT_BORROWED_FROM_RELEASE_WORKFLOW','sourceOrRemoteMutationsByReviewer':False,'gitOrProductTestsExecutedByReviewer':False,'requiredOwnerProductDecisions':[],'retainedLimits':['Current main merge actual bypass/reviews-empty approval NOT_MET remains historical fact and no future waiver.','D01 native persistent unanswered-window DEFERRED; effectsNOT_MEASURED; original OwnerACCEPTED_LIMITED0.1.37 core only; fullplanOPEN.','No new model/Matt/desktop/second client/Sites/window/productionrollback performed and no public webpage changed.','Old FAIL/UNKNOWN and source/license rights retained; successful publication does not cure prior failures or prove learning effects.'],'nextRecommendation':'Complete exact actualmain fresh acceptance and separately pinned real v8.3.4 tag13/Python/15ownedroot checks under parent inventory sequencing. Only their terminal independent PASS can unlock public installation navigation/record maintenance. Preserve actual bypass/approvalNOT_MET; no new Owner product decision.'}
(D/'summary.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(D/'REVIEW.md').write_text('''# PR291 / v8.3.4 实际发布独立审计

30/30回读判据通过。PR291于15:13:30Z实际合入main5898a8192740b39f41263129a5f99efeba96a6cc，tree3a68976af95bb5948de17a6fccaabf892becaaca，与已审候选完全同树；parents f18+f344。精确suite4622448549实际result=bypass，pull_request因缺latest-pusher外批准而FAIL、其他4规则PASS，reviews=[]，批准仍NOT_MET。本Agent未合并，后续不可复用bypass。

v8.3.4于15:16:38Z真实公开；tag/Release目标均5898，draft=false/prerelease=false/assets=[]/latest=true/immutable=false。正文1677B/SHA25693f4459e8718b06eae19dc6aa82397eacce723470f8fd6e33214fb489d542d38，在仅CRLF→LF/trim范围与actualmain CHANGELOG对应节一致。市场8.3.4，HTML0.1.39；其余四包0.3.1/0.1.0/0.1.1/0.1.0准确。初次tag/Release404与run进行中保留，隔84秒后再读取，属于阶段变化，不重跑。

Release run39446432726 exact5898、push/attempt1成功；单job118709472250、完整plain日志和ZIP已收，13个ZIP entry逐hash/CRC通过。原日志按序显示create-draft→empty draft→canonical Git tree installation verified→published→最终published JSON。该自动canonical不代替本轮独立actualmain或新真实tag十三安装；日志不提供后者新批次逐十三/Python/精确根计数。

旧v8.3.3/fdede tag与Release目标、2507B正文原SHA25611fc9f4c0231ba5aebda7a7d3add60ed8f506a943e2ff516d5c2c8b27c5b069c、空资产及immutable=false保持。仓库API没有immutable_releases字段，配置仍UNKNOWN；工作流默认false后的“not enabled”文字不构成配置已核实false。

实际来源许可元数据hash8a6b1057保持：研究无分发许可来源只作原始本地合成，Apache参考只作独立通用实现，私有完整提示词分发权未建立、只保metadata/hash/恢复指针。整树与已审候选相同，不复制B2全文、不重授材料许可。D01窗口延期、效果未测、完整计划OPEN、原.37核心有限接受与全部历史FAIL/UNKNOWN/批准缺口保持；没有新模型、桌面、窗口、Sites或网页更新。

下一步推荐：在父代理库存守卫要求的顺序内完成actualmain新验，再以v8.3.4/5898/tree3a68976a完成独立真实tag十三安装、实际Python及15精确根清理。两批终态证据通过后再准备同Issue的有界公开安装导航与真实交付记录维护；不提前称这些尚待运行项通过，不要求Owner常规构建审查。
''',encoding='utf-8')
print(json.dumps({'status':out['status'],'checks':len(checks),'allReadbackChecksTrue':True,'published':out['published'],'protectedApproval':'NOT_MET','canStartFreshRealTagInstallation':True,'actualMainAndTagAcceptance':'PENDING_SEPARATE_WORKERS'},ensure_ascii=False))
