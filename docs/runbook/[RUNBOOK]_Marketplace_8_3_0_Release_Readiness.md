---
type: runbook
scope: marketplace
summary: "Whole-develop 8.3.0 publication, accepted limits and exact installation evidence"
owner: marketplace-maintainers
created: 2026-10-13
updated: 2026-10-15
state: active
version: v2.0.1
---

# [RUNBOOK] Marketplace 8.3.0 release readiness

## Release task Owner decision — 2026-10-15

Owner 于 2026-10-15 明确要求将 develop 整体发布为 Marketplace 8.3.0，并选择按当前实现发布 HTML 0.1.36：保留 #239 的已知自检前提缺陷和未覆盖项，只执行发布必需的 CI、安装与 Python 检查，不重启模型或桌面验收，也不继续功能修正。此决定取代此前 Communication 四包发行、HTML 另发的范围；旧失败不改写为 PASS。

Owner subsequently explicitly requested implementation of this complete plan, including the preparation PR, develop-to-main publication, automatic draft-first Release and necessary post-publication verification. Existing authorization covers these operations; GitHub independent approvals and required checks remain external platform gates. No reviewer is designated. Refs #222, #215, #239.

## Complete development source and publication scope

- Starting origin/develop: `a0a9b1383d2b84a147ff67c5ffa656e8133a0554`; Git tree `acbbc8877357623b6d1cec61a77911552d3ab95b`.
- Published main baseline: `ebc4bdc3abc62c36348d9ba28de7161b04b3b466`, v8.2.0, three plugins. At intake no v8.3.0 tag/Release exists.
- Marketplace VERSION/badge already 8.3.0: no version-tool apply or repeat bump.
- Diagram 0.3.1 / Learning Evidence 0.1.0 / Explain 0.1.1 / Communication 0.1.0 / HTML Guide 0.1.36: five complete plugin packages, seven public skills, four explicit entries, three ordinary skills and twenty repository-only development skills. Existing thirteen installation combinations remain exact.
- This preparation changes documentation only. All plugin package bytes, versions, scripts, tests, catalog, icons, frozen plans and validation/approval rules remain those of the starting develop source; identities are recorded in the actual task receipt.

## Accepted limitations and evidence boundaries

HTML source36's recorded result is 9 UUID / 17 COMPLETE / 0 INVALID; whole 6 PASS / 1 FAIL / 2 UNEXERCISED / 5 NOT_RUN. The known B1.1 independent-self-check omits the current state needed for a definite conclusion. It remains FAIL in [#239](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/239); waiting/confirmation passes do not erase it. Current-version complete desktop/client and extended behavior are unverified; real effects remain NOT_MEASURED. External 0.1.37 is not included. #238 actually merged as the starting develop SHA; the unchanged source's historical engineering/install results are historical, not newly executed merge checks.

Communication keeps its original CLI 15 PASS / 3 PARTIAL and two limited local routes within one desktop application. Existing client results may be matched only to unchanged package resources; no new client interaction is claimed. Learning's deferred strict native entries, prior approval gaps and Owner final acceptance remain separate.

The release permission accepts these limits; it does not make semantic or desktop coverage PASS. This run executes only engineering checks, exact installation/resource checks and actual cached Python.

## Protected preparation and release sequence

1. In an isolated worktree, prepare these current scope/limitation documents and record actual checks. Submit a documentation preparation PR to develop; merge only after its current-head CI, real non-author approval and resolved threads satisfy actual protection.
2. Open a new release PR with head develop and base main, preserving the complete collection and ancestry. Once it exists, mark old four-package draft #237 superseded and close that draft; do not merge its filtered projection. Use Refs only.
3. Freeze the release head, compare full main differences and package identities. If either branch moves, reassess and refresh affected checks/approvals before ordinary merge. Require the current non-author latest-push approval, effective main code-owner rules, CI and resolved threads; no bypass.
4. Track the existing automatic draft-first workflow after main merge. Resolve real main/tag/Release identities, publish status, assets and immutability. Never race another same-version release, overwrite published history or infer immutable configuration from absent API fields.

## Actual verification ledger

| Item | Current status | Required actual evidence |
| --- | --- | --- |
| Preparation engineering | Prior CI successful, observed on #241; not re-executed here | npm test, validate, exact CLI 0.147.0 baseline, documentation/A6 and commit checks |
| Frozen candidate installation | Prior pre-publication run in #241; distinct from fresh R04 below | Its own strict verifier, thirteen canonical combinations, resources, six Diagram Python and six Learning save/replay/read checks |
| Protected develop preparation merge | #240 MERGED; reviews=[] remains an approval-evidence gap | Actual PR/current head checks, non-author approval, resolved threads and merge SHA |
| R01 main merge | PASS identity/tree; independent-review evidence missing | Fixed develop head and actual main merge/tree/package correspondence |
| R02 version identity | PASS | VERSION, badge, CHANGELOG, tag peel and Release target identity |
| R03 public Release | PASS published identity; immutability only observed | Actual workflow and published state; author, assets and immutability observed separately |
| R04 post-publication installation | PASS fresh tag run, 13/13 | New isolated thirteen-combination installation from the real published tag SHA, matching resources and actual cached Python |
| R05 client evidence boundary | ACCEPTED LIMITED COVERAGE / no fresh behavior run | Match unchanged resources to existing evidence; retain HTML full-client UNEXERCISED and all other original limitations |

Append real execution results in uniquely identified receipts; do not turn pre-publication installation into R04 or infer a review from a merge. Unknown outcomes require readback before a retry. Published failures use a new protected repair/version when needed.

## Actual publication and resumed follow-up — 2026-10-15

Refs [Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222). The Owner subsequently reported #241 merged and requested follow-up. This section records the completed publication and newly executed post-publication check, then prepares documentation and ordinary maintenance under the original task authorization. The earlier release task's stop boundary below remains its historical execution boundary. No new model, native-client or effects run is claimed; #215 and #239 are unchanged.

### R01–R03: actual public identity

- [#240](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/240) merged as `32e32c5b8ecc843435fe9643398135dd22ee8c9b`; prepared head `262597fb4bf7c647dfa7e6658f3923d883d389ac`. [#241](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/241) merged complete develop at `2026-10-15T07:50:32Z`, release head `32e32c5b8ecc843435fe9643398135dd22ee8c9b`, actual main merge `ae2754dbae2a9acaedf6965ecc4a7b3df7dadd64`. All three Git trees equal `b5a8bb915f917bd59ebc1e9fb3436847da69dc7e`. Package/runtime/script/test/catalog/export bytes match the complete starting source `a0a9b1383d2b84a147ff67c5ffa656e8133a0554`; this is not the earlier four-package projection.
- [#237](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/237) is closed **unmerged**, superseded by #241. Its original head and four-package evidence remain historical. #240/#241 API reviews are both `[]`: actual merges and successful checks are observed, but no independent approval or protection waiver is inferred. Subsequent merges still require actual current-head non-author approval, applicable code-owner checks and resolved threads.
- [v8.3.0 Release](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.3.0), id `413544930`, was published `2026-10-15T07:51:33Z`, author `github-actions[bot]`, draft=false, prerelease=false, assets=[]. Release target, lightweight tag commit and actual main merge all equal `ae2754dbae2a9acaedf6965ecc4a7b3df7dadd64`. VERSION/badge are 8.3.0; versions remain Diagram 0.3.1 / Learning Evidence 0.1.0 / Explain 0.1.1 / Communication 0.1.0 / HTML Guide 0.1.36.
- [Release workflow 38701485705](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38701485705) succeeded from that merge. Its push actor/triggering actor are `ranzuozhou`; the Release author is separately the bot. Release body equals the exact published 8.3.0 CHANGELOG section. API `immutable=false` is an observation, not an immutable-history guarantee. Historical workflow/approval limitations remain unchanged.

Primary observations: [GitHub snapshot](evidence/communication-8-3-0-postrelease-github-20261015-01.json). Independent identity/resource review: [report 01](evidence/communication-8-3-0-postrelease-review-20261015-01.json), generated before that reviewer assessed the new R04 run; its original R04 NOT ASSESSED is retained. The subsequent [report 02](evidence/communication-8-3-0-postrelease-review-20261015-02.json) independently assessed the complete new R04 artifacts, caller closure and post-publication timing; R01–R04 pass within the stated engineering/identity scope, while R05 stays limited. Its safe-restoration assessment is also recorded.

### R04: newly executed after publication

The real `v8.3.0^{commit}` was resolved and required to equal `ae2754dbae2a9acaedf6965ecc4a7b3df7dadd64`. Run start `2026-10-15T07:55:29.514710Z`, completion `07:56:54.141487Z`, both after publication. The unmodified five-package release verifier created a detached canonical worktree from that SHA and ran its real strict verifier and isolated CLI installer. The caller checkout's release-engine/dependency objects match the actual published tree. This is distinct from earlier candidate checks.

- **13/13 PASS**, actual `codex-cli 0.147.0`; installed all five expected packages, ordinary consumer discovery 3 / native skills 7 / repository development skills 0. Each scenario uses an isolated temporary cache and checks its exact expected packages/resources.
- Six actual installed Diagram Python validations plus six installed Learning save/replay/read/structure validations ran with Python **3.12.14**. Exit code 0; no R04 failure or repair occurred. This is installation/engineering evidence only.
- [Full result](evidence/communication-8-3-0-postrelease-canonical-20261015-01.json), [console](evidence/communication-8-3-0-postrelease-canonical-20261015-01.log), [timed receipt](evidence/communication-8-3-0-postrelease-canonical-20261015-01-receipt.json), [original JS caller](evidence/communication-8-3-0-postrelease-canonical-20261015-01.mjs), [original Python launcher](evidence/communication-8-3-0-postrelease-canonical-20261015-01.py). Original absolute paths identify that execution; these archived launchers are evidence, not portable repository entry points. Console 484 bytes, SHA-256 `a0747b302bd8b0156dc34b7f8efcc680891c7803d1969adf91fc076007eecba3`.
- [Evidence manifest](evidence/communication-8-3-0-postrelease-manifest-20261015-01.json) records exact archived byte counts and SHA-256. Frozen plan and its provenance are unchanged. One initial GitHub GraphQL metadata query had a TLS handshake timeout; a later read succeeded. It did not affect publication or the R04 install run.

### R05: existing client evidence matched to unchanged resources

**ACCEPTED LIMITED COVERAGE / no fresh behavior run.** Communication's eleven non-CHANGELOG runtime/resource files match the earlier actual client source `000e8033ce2f639c974c3953aadc06b9be21878c`; the full published package tree `170fcad82f33548c8d91b62984df4ff38635e69f` differs only in CHANGELOG from that earlier package. Raw installed-cache comparisons retain their own checkout/line-ending identities. No fresh GUI result or blanket raw-byte equivalence is inferred from Git identity.

The prior actual CLI remains 15 PASS / 3 PARTIAL; supplementary tool-role file results remain separately limited. The two actual UI routes are local Codex-backed routes inside the same `OpenAI.Codex 26.1007.2314.0` desktop application, not proof of two independent client implementations. Existing synthetic communication/writing/rewrite, chat waiting and explicit new MD/TXT save/readback results retain that source and identity. Existing-file UI edits, strict native-window lifetime/close/preselection/timeout, other classic/cloud routes and complete Office coverage remain unverified. HTML full-client/extended coverage remains unverified and #239 remains FAIL; Learning deferred entries remain separate. Real-world effects remain NOT_MEASURED.

### Maintenance status and safe next dependency

README was still a pre-publication snapshot pointing installations to v8.2.0; this follow-up updates it to the real five-package v8.3.0 tag and synchronizes current root instructions, INDEX and this ledger without changing published runtime/version/Release/tag history.

The remote `develop` ref and branch API both returned 404; `git ls-remote --heads origin develop` was empty. Repository `delete_branch_on_merge=true` is observed; deletion causation is not inferred from that setting alone. The last actual head is #241's `32e32c5b8ecc843435fe9643398135dd22ee8c9b`. The active protect-develop ruleset remains; the current actor has an always-bypass role. No protected-ref creation, direct update, force, rule change or bypass has been attempted. Without a non-bypass execution guarantee, restoration is deferred to a write-capable actor without bypass at that exact prior head. Only after safe restoration can the agent prepare normal protected main-to-develop synchronization and then a separate dry-run-first 8.3.1 development pre-bump; plugin versions remain fixed, no 8.3.1 tag/Release. This documentation PR itself is subject to current-head independent approval and CI. Epic #222 remains open while maintenance and its actual gates are pending; #215/#239 are not closed or expanded by this work.

## Prior release task stop boundary

Deliver the public Release URL, actual source/main/tag SHA, version inventory and reviewable result receipt after necessary post-publication checks. This run does not execute main-to-develop back-sync, next-patch pre-bump, closeout documentation PRs, Issue/Epic closure, worktree archival or deferred follow-up. #215 and #239 remain unchanged.

## Historical four-package preparation

The following body is preserved from starting develop a0a9b138 (ledger v1.4.2). Its earlier four-package scope, future-stage statements, dates and old NOT RUN snapshots are historical. The current five-package decision and verification boundary above take precedence; no old failure or raw evidence is rewritten.

Refs [Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)。本记录属于Communication PR4的并行准备，不是PR3实际合并后的验收或PR5发布成功记录。五份主PR按计划依赖顺序经保护门禁合并；Epic保持开放。

## Authorized scope and current identity

Owner已授权实施至正式上线、Release及上线后安装复查；Q1选定Learning先8.2.0、Communication随后独立minor，Q3选定正式只公开Learning三包＋Communication，HTML保留develop另发。已确认产品和上线目标继续复用，不新增发布范围。

当前develop已实际合入PR1 #223 / bca7b5c、未发布8.2.1；PR4普通继承PR3 10674c6并保留已准备8.3.0。此前Lookup/版本操作和各原始源身份按当时事实保留，较早预升同步见[pre-bump sync 01](evidence/communication-kit-2026-10-13-prebump-sync-01.json)，本轮来源与检查记录见本文末节。README分别标明上游develop8.2.1与本PR4已准备badge8.3.0。

Learning v8.2.0已于2026-10-13T05:00:19Z由`github-actions[bot]`公开，main/tag/Release目标均为`ebc4bdc3abc62c36348d9ba28de7161b04b3b466`。正式三包为Diagram0.3.1、Learning Evidence0.1.0、Explain0.1.1；此Release不是Communication交付。发布后同步#234实际develop为`2c0a83172507bcb77d105d9f9294fec2e6672ac1`，VERSION8.2.0；8.2.1预升#235当时未合并，不作为已生效基线。应用版本工具前查询v8.3.0 tag与Release均404，不覆写既有身份。

PR4从`7cfb59d35072a210c96973a0d0fd06b6da719d14`的8.2.0工作源准备8.3.0。版本工具日志与完整新候选检查见[version preparation 01](evidence/communication-kit-2026-10-13-version-prep-01.json)。版本工具DryRun对VERSION、README与五包manifest零写入；实际apply只改变VERSION/README badge两个锚点，五包根版本保持。正式CHANGELOG准备8.3.0/Comm0.1.0段并保留Unreleased；旧公开版本段保持。第一次同进程脚本调用未设置LASTEXITCODE，包装检查停止在apply之前，原输出保留；改用独立pwsh进程后实际exit0及七文件哈希核对通过。

| 集合 | 插件/技能与安装预期 | 状态 |
| --- | --- | --- |
| develop候选 | D/L/E/HTML/Comm五包七技能，普通3、显式4、开发20；十三snapshot/canonical组合 | 8.3.0工作树344/344、strict/CLI0.147.0、十三snapshot、六次图表Python/六组Learning保存重放回读通过；未冒充canonical |
| Owner正式8.3.0范围 | D/L/E/Comm四包六技能，普通3、显式3、开发20；原九组合按Learning双技能替换 | PR5原子移除HTML运行注册、白名单/资源/安装预期并严格复验，尚未完成 |
| 实际main/Release | v8.2.0三包五技能，Communication未公开 | 已核对依赖身份，不记本包完成 |

## Acceptance and remaining merge gates

详细S01–S12、C01–C18、失败/修复/复验与客户端身份见[Communication验收](./[RUNBOOK]_Communication_Kit_Acceptance.md)。Learning原子迁移工程与原始日志见[新批次](evidence/communication-kit-2026-10-13-learning-baseline-01.json)。不因总测试数量或模型自評补填未执行项。

实际CLI0.147.0行为批次15 PASS/3 PARTIAL；C16–C18由不同工具身份提供三项限定功能结果，CLI被宿主阻断的子路径仍PARTIAL。同一26.1007.2314.0桌面应用内的Codex本地及ChatGPT/Work本机两个实际入口已验证安装、图标/communicate、沟通/编写/改写、文字问题未答等待、聊天交付和明确新MD/TXT保存/回读。两个路线的线程、安装源及字节证据分别保留；独立classic ChatGPT/cloud、原生问题窗口关闭/预选/超时及全部Office编辑没有通过证据。这些基础结果不证明现实沟通效果。

此前四PR均draft；PR1现已实际合入，reviews缺项保留，后续阶段仍须当前head门禁。PR1 [#223](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/223)→PR2 [#225](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/225)→PR3 [#229](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/229)→PR4 [#233](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/233)必须依次满足最新develop、当前head required CI、非作者最新推送批准及已解决线程。此前reviews为空且A6因冲突未执行，不能把仅push Structure成功写成全部门禁通过；每次刷新后重新核对。聊天批准仅执行授权，Agent自检和独立AI审查不替代GitHub review。

PR3实际merge尚无，故PR4与该merge的tree/运行包比较NOT RUN；并行版本准备不解除依赖。PR4实际merge、正式发布候选SHA/tree与主分支差异均NOT RUN。PR5只从PR4经门禁合入的实际merge派生；main还须实际代码所有者与独立批准，不绕过保护。

## Draft-first release and post-publication verification

按[Release Operations](./[RUNBOOK]_Release_Operations.md)执行：门禁合入main后，现有VERSION触发自动发布；跟踪实际workflow，核对空draft、固定main tip、tag/正文/targetSHA、canonical安装及实际Python、publish和published/immutability/assets状态。不并行创建同号Release，不覆盖历史tag/正文/资产。未知结果先回读实际状态，故障保留并修复。

| ID | 当前状态 | 实际通过所需证据 |
| --- | --- | --- |
| R01 | NOT RUN | 实际main merge及与已测候选tree/包对照；差异和对应复验 |
| R02 | NOT RUN | VERSION、badge、CHANGELOG、tag peel和Release实际SHA/版本一致 |
| R03 | NOT RUN | 真实workflow成功，Release published，作者/immutability/资产符合流程 |
| R04 | NOT RUN | 发布后从真实tag解析SHA，在新隔离环境执行正式九组合canonical、资源字节及真实缓存Python |
| R05 | NOT RUN | 正式来源安装与实际显式入口基本调用对应；源或运行包变动时复查受影响真实路径 |

上述全部实际完成后才明确关闭Epic。上线后证据通过文档PR入库；随后按既有流程经PR同步main→develop并准备下一补丁pre-bump，仅VERSION/badge，不创建同号Release。HTML保持开发范围，需防止正式四包回同步误删开发HTML；按两个集合做原子完整校验。

## Deferred evaluation and recovery

本次不执行现实场景效果、九例个人试用、三稿对照、读者反馈、采用度或效率提升评价；不将基础通过表述为现实效果已验证，也不以延期效果测试阻塞上线。以后另有授权才开展独立任务。

合并前失败保留原日志并修复/复验；撤回或发布后修复使用新的受保护PR及适当新版本。版本准备可通过PR恢复权威锚点，发布历史保持不可覆盖。客户端或批准不可得保持对应draft，并继续独立工作。

| Version | Date | Summary |
| --- | --- | --- |
| v1.4 | 2026-10-13 | 精确归档文档收尾原始证据，不改变候选版本/运行或正式门禁状态 |
| v1.3 | 2026-10-13 | 普通继承最新980文档收尾，保持生产/正式CH身份与8.3目标，仅文档/A6复验 |
| v1.2 | 2026-10-13 | 实际8.2.1上游已合入，保持已准备8.3.0并限定沿用未变运行内容的既有检查 |
| v1.1 | 2026-10-13 | 纳入真实发布后基线及固定08cc开发canonical证据；正式四包与R01–R05不预填 |
| v1.0 | 2026-10-13 | 绑定已授权8.3.0准备；Learning已公开、四包正式范围、阶段批准和R01–R05待真实完成 |

### 已固定开发候选的canonical与同步复查

Refs #222。[Post-release sync 01](evidence/communication-kit-2026-10-13-postrelease-sync-01.json)保留四分支普通导入真实develop2c0a831的来源、20原始日志/审计和135/148/65/65受影响回归；PR3/4后续只改文档，生产/测试保持。PR4实际固定08cc006、tree859066f、VERSION8.3.0的[canonical 01](evidence/communication-kit-2026-10-13-pr4-canonical-01.json)通过严格校验、十三安装、六次图表Python/六组Learning保存重放回读，CLI0.147.0、Learning解释器3.12.14。Communication主技能/refs/manifest/icons与原000e803实际UI来源一致，完整Comm包仅首版CHANGELOG改变tree；Learning替换及其他包集合按新基线独立验证。该批为发布前五包开发候选，不能填正式四包验收、阶段保护合并或R04上线后复查；原模型/UI失败与PARTIAL继续保留。

### 实际8.2.1开发预升导入

Refs #222。#235于2026-10-13T06:10:55Z实际合入3af6837，仅AGENTS、VERSION与README badge变化，当前develop8.2.1；其reviews为空，历史缺项不追认。PR1/2/3普通继承8.2.1；PR4普通继承真实ancestry并保留已匹配目标8.3.0及根badge，不重复版本工具转换。原8.2.0→8.3.0的真实DryRun/apply与时间/源保持原记录。当前运行包/脚本/测试及8.3正式CH相对已测源保持；只做受影响文档/A6与strict复验，不将旧全量/canonical写为新执行。实际phase merge、非作者批准、正式四包和R仍未完成。

### #236文档收尾同步

Refs #222。PR4由原head `48437be`普通合入PR3 `c6d40a8`，包含实际develop `98068a8bd7060585b9915be9490a02a733fcb1a6`；当前VERSION/badge8.3.0已匹配，不重复bump。生产包/scripts/tests/catalog相对原head零差异，Comm包tree170fcad保持且除首版CHANGELOG外等于实际native UI来源000e803。开发五包与正式四包范围分开，main/v8.2.0仍Learning三包；上游收尾见[回执](evidence/learning-evidence-8-2-0-closeout.json)。本轮只检查文档/严格/A6/whitespace和提交规范，外部原日志 `C:/Users/Admin/.codex/worktrees/communication-closeout-sync-pr4-*.log` 与追加审计记录实际结果和hash，不把旧full/canonical/Python/UI改写为新执行。具体来源及冲突整合见[验收账本末节](./[RUNBOOK]_Communication_Kit_Acceptance.md)。预备四包projection仍是独立工作，不是正式PR5，阶段实际合入、当前head批准/线程、正式候选与R01–R05继续按实际证据处理。

### 文档收尾原始证据归档

Refs #222。[Closeout sync 01](evidence/communication-kit-2026-10-13-closeout-sync-01.json)绑定PR1 `6c0d609`、PR2 `c198f5c`、PR3 `c6d40a8`、PR4 `86a364e`实际head/tree、来源develop `98068a8`、各阶段生产零新增差异及65项受影响文档/A6范围，按raw manifest保存外部审计与43份原始日志。此前20份日志、两次只读审计helper失败及修复复验原字节保留，不覆盖旧record。当前归档基于86a364e，仅文档与evidence变化；五包开发、8.3.0及根/Comm正式CHANGELOG保持，不导入独立四包preview。AI独立核验和本地正常A6不替代GitHub当前head非作者批准、required checks或线程门禁，不补填正式PR5/Release/R01–R05，历史CLI PARTIAL、限定客户端及现实效果延期保持。

本批归档首轮whitespace exit2由四份原始Git diff日志的空白上下文触发；只为本批对应证据和失败回执设置精确属性，保留其原字节及其余空白检查。失败回执/hash与修复说明随主record保存，不修改生产规则或分支门禁。

第二次whitespace exit2进一步识别PR3原diff回执的末尾空行；只为该精确证据文件保留EOF字节，第二失败回执及修复说明同样追加，不改写原日志。

### 继承空白问题的完整范围复验

Refs #222。[Inherited whitespace 01](evidence/communication-kit-2026-10-13-inherited-whitespace-01.json)保留四阶段首轮真实full-range exit2、普通来源继承与最小修复；各固定实际head的`git diff --check origin/develop...HEAD`、staged、strict及65项documentation/A6均通过，未用parent/staged结果代替完整PR检查。非冻结guide/fixture和当时ADR/SPEC/验收仅收敛EOF，文档正文/案例解析值不变；计划405行/hash、来源记录和原Node失败日志各自磁盘/Git blob身份保持，只设置精确冻结属性。原日志、源身份、全部hash和证据文件的窄空白属性见manifest/audit。当前C4归档只补文档证据并保留开发五包/8.3.0及正式CH；不导入预备四包代码，不宣称GitHub批准、正式发布或新增full/install/Python/UI执行。

### 实际PR1合并后的下游同步

Refs #222。[PR1 merge sync 01](evidence/communication-kit-2026-10-13-pr1-merge-sync-01.json)绑定实际M1 merge `bca7b5c`/head `5a9d845`同tree、PR2 `7040dca`和PR3 `10674c6`的普通继承及PR4源输入，保留新的merge/检查/CRLF归档失败与窄修复原日志。M1固定postmerge六份完整原件由PR2先归档并原字节向后继承；不以摘要代替canonical result或GHfacts。此同步只更改文档/证据与精确原字节属性，运行/版本/正式CH保持，最终当前head检查与PR身份另记，不把M1reviews=[]推定批准，不计Communication或R04/R05；旧draft/NOT RUN及客户端/效果限制按原时间保留。
