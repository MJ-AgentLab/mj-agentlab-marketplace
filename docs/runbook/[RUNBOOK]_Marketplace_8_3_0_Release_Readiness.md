---
type: runbook
scope: marketplace
summary: "Communication 8.3.0 preparation, protected phase gates and post-publication checks"
owner: marketplace-maintainers
created: 2026-10-13
updated: 2026-10-13
state: draft
version: v1.6
---

# [RUNBOOK] Marketplace 8.3.0 release readiness

Refs [Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)。本记录属于Communication PR4的并行准备，不是PR3实际合并后的验收或PR5发布成功记录。五份主PR按计划依赖顺序经保护门禁合并；Epic保持开放。

## Authorized scope and current identity

Owner已授权实施至正式上线、Release及上线后安装复查；Q1选定Learning先8.2.0、Communication随后独立minor，Q3选定正式只公开Learning三包＋Communication，HTML保留develop另发。已确认产品和上线目标继续复用，不新增发布范围。

当前最新develop为实际#236 merge98068a8（文档/evidence收尾）、未发布8.2.1；PR4普通继承PR3 c6d40a8并保留已准备8.3.0。此前Lookup/版本操作和各原始源身份按当时事实保留，较早预升同步见[pre-bump sync 01](evidence/communication-kit-2026-10-13-prebump-sync-01.json)，本轮来源与检查记录见本文末节。README分别标明上游develop8.2.1与本PR4已准备badge8.3.0。

Learning v8.2.0已于2026-10-13T05:00:19Z由`github-actions[bot]`公开，main/tag/Release目标均为`ebc4bdc3abc62c36348d9ba28de7161b04b3b466`。正式三包为Diagram0.3.1、Learning Evidence0.1.0、Explain0.1.1；此Release不是Communication交付。发布后同步#234实际develop为`2c0a83172507bcb77d105d9f9294fec2e6672ac1`，VERSION8.2.0；8.2.1预升#235当时未合并，不作为已生效基线。应用版本工具前查询v8.3.0 tag与Release均404，不覆写既有身份。

PR4从`7cfb59d35072a210c96973a0d0fd06b6da719d14`的8.2.0工作源准备8.3.0。版本工具日志与完整新候选检查见[version preparation 01](evidence/communication-kit-2026-10-13-version-prep-01.json)。版本工具DryRun对VERSION、README与五包manifest零写入；实际apply只改变VERSION/README badge两个锚点，五包根版本保持。正式CHANGELOG准备8.3.0/Comm0.1.0段并保留Unreleased；旧公开版本段保持。第一次同进程脚本调用未设置LASTEXITCODE，包装检查停止在apply之前，原输出保留；改用独立pwsh进程后实际exit0及七文件哈希核对通过。

| 集合 | 插件/技能与安装预期 | 状态 |
| --- | --- | --- |
| develop候选 | D/L/E/HTML/Comm五包七技能，普通3、显式4、开发20；十三snapshot/canonical组合 | 8.3.0工作树344/344、strict/CLI0.147.0、十三snapshot、六次图表Python/六组Learning保存重放回读通过；未冒充canonical |
| Owner正式8.3.0范围 | D/L/E/Comm四包六技能，普通3、显式3、开发20；九组合 | 独立预备投影已原子准备、318项工程与九snapshot通过；正式PR5仍须从实际PR4 merge派生并验收，尚未完成 |
| 实际main/Release | v8.2.0三包五技能，Communication未公开 | 已核对依赖身份，不记本包完成 |

## Acceptance and remaining merge gates

详细S01–S12、C01–C18、失败/修复/复验与客户端身份见[Communication验收](./[RUNBOOK]_Communication_Kit_Acceptance.md)。Learning原子迁移工程与原始日志见[新批次](evidence/communication-kit-2026-10-13-learning-baseline-01.json)。不因总测试数量或模型自評补填未执行项。

实际CLI0.147.0行为批次15 PASS/3 PARTIAL；C16–C18由不同工具身份提供三项限定功能结果，CLI被宿主阻断的子路径仍PARTIAL。同一26.1007.2314.0桌面应用内的Codex本地及ChatGPT/Work本机两个实际入口已验证安装、图标/communicate、沟通/编写/改写、文字问题未答等待、聊天交付和明确新MD/TXT保存/回读。两个路线的线程、安装源及字节证据分别保留；独立classic ChatGPT/cloud、原生问题窗口关闭/预选/超时及全部Office编辑没有通过证据。这些基础结果不证明现实沟通效果。

当前四PR仍draft。PR1 [#223](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/223)→PR2 [#225](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/225)→PR3 [#229](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/229)→PR4 [#233](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/233)必须依次满足最新develop、当前head required CI、非作者最新推送批准及已解决线程。此前reviews为空且A6因冲突未执行，不能把仅push Structure成功写成全部门禁通过；每次刷新后重新核对。聊天批准仅执行授权，Agent自检和独立AI审查不替代GitHub review。

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

### Owner Q3 四包发行预备投影

Refs #222。[预备工程01](evidence/communication-kit-2026-10-13-release-projection-01.json)固定最初tested index3643f2b6，实际318/318测试、strict、CLI0.147.0和九组snapshot安装通过，实际四次图表Python/四组Learning保存重放回读、解释器3.12.14。catalog、插件目录、严格资源/显式集合、品牌导出与安装预期原子限定四包六技能/三显式；四个保留插件完整Git tree及版本与48437源相同，主技能/refs/icons未变。新HTML混入三变体固定真实fixture commit，canonical strict先拒绝再installer零调用；[独立AI工程窄审](evidence/communication-kit-2026-10-13-release-projection-review-01.json)不是GitHub批准。

此codex/communication-release-preparation仅是独立预备分支，正式PR5未创建。最初检查后仅导入最新Learning文档收尾、纠正本预备源当前范围，并做受影响doc/A6/strict复验；固定canonical证据另追加。不得把本源准备记为PR4实际merge验收、正式PR5或R04上线后复查。正式PR5仍须从PR4经门禁合入的实际merge重新派生、刷新main，并比较本预备投影与最终候选；R01–R05和Epic关闭条件保持原要求。

| Version | Date | Summary |
| --- | --- | --- |
| v1.4 | 2026-10-13 | 记录Owner Q3四包独立预备工程；正式阶段merge/PR5/上线后检查保持未完成 |

Refs #222。固定cd7a9fbd/tree129cc599的[四包canonical01](evidence/communication-kit-2026-10-13-release-projection-canonical-01.json)实际执行detached strict和九组CLI0.147.0安装，四图表Python/四Learning保存重放回读通过，Python3.12.14；普通3/原生6/显式3/开发20。本批是发布前预备验证，R04上线后复查仍NOT RUN，正式PR5须从实际PR4 merge另派生并刷新main。

### 文档收尾原始证据归档

Refs #222。[Closeout sync 01](evidence/communication-kit-2026-10-13-closeout-sync-01.json)绑定PR1 `6c0d609`、PR2 `c198f5c`、PR3 `c6d40a8`、PR4 `86a364e`实际head/tree、来源develop `98068a8`、各阶段生产零新增差异及65项受影响文档/A6范围，按raw manifest保存外部审计与43份原始日志。此前20份日志、两次只读审计helper失败及修复复验原字节保留，不覆盖旧record。当前归档基于86a364e，仅文档与evidence变化；五包开发、8.3.0及根/Comm正式CHANGELOG保持，不导入独立四包preview。AI独立核验和本地正常A6不替代GitHub当前head非作者批准、required checks或线程门禁，不补填正式PR5/Release/R01–R05，历史CLI PARTIAL、限定客户端及现实效果延期保持。

本批归档首轮whitespace exit2由四份原始Git diff日志的空白上下文触发；只为本批对应证据和失败回执设置精确属性，保留其原字节及其余空白检查。失败回执/hash与修复说明随主record保存，不修改生产规则或分支门禁。

第二次whitespace exit2进一步识别PR3原diff回执的末尾空行；只为该精确证据文件保留EOF字节，第二失败回执及修复说明同样追加，不改写原日志。

| Version | Date | Summary |
| --- | --- | --- |
| v1.5 | 2026-10-13 | 合入PR4实际49036ad文档归档，保留四包预备canonical与五包开发来源；生产保持cd7未变 |

### 继承空白问题的完整范围复验

Refs #222。[Inherited whitespace 01](evidence/communication-kit-2026-10-13-inherited-whitespace-01.json)保留四阶段首轮真实full-range exit2、普通来源继承与最小修复；各固定实际head的`git diff --check origin/develop...HEAD`、staged、strict及65项documentation/A6均通过，未用parent/staged结果代替完整PR检查。非冻结guide/fixture和当时ADR/SPEC/验收仅收敛EOF，文档正文/案例解析值不变；计划405行/hash、来源记录和原Node失败日志各自磁盘/Git blob身份保持，只设置精确冻结属性。原日志、源身份、全部hash和证据文件的窄空白属性见manifest/audit。当前C4归档只补文档证据并保留开发五包/8.3.0及正式CH；不导入预备四包代码，不宣称GitHub批准、正式发布或新增full/install/Python/UI执行。

| Version | Date | Summary |
| --- | --- | --- |
| v1.6 | 2026-10-13 | 导入实际8a841a7完整范围空白修复及原日志，冻结原稿/运行包保持，正式发布门禁未完成 |
