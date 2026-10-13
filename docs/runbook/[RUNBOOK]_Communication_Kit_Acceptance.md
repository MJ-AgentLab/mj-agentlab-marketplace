---
type: runbook
scope: marketplace
summary: "Communication acceptance procedures, evidence identity and release gates"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-13
state: draft
version: v1.7.2
---

# [RUNBOOK] Communication Kit acceptance

## §1 Preconditions and status

PR3已实现并原子接入完整Communication 0.1.0候选、注册、严格集合、冻结资源、正式D图标与安装预期。修复候选94c170d的278测试/九组合保留；HTML基线同步后工程源通过307/307，固定000e803的十三组canonical与六次缓存Python通过。S01–S12客观范围逐项核对。实际CLI批次C01–C15 PASS，C16–C18文件子路径PARTIAL；补充工具角色另有三项限定功能PASS，身份和覆盖分开。2026-10-13代理亲自完成统一桌面应用内Codex本地和ChatGPT/Work本机两个实际入口的必要基本功能，限定范围PASS，详见§4。原行为FAIL、CLI限制与原生选择窗口NOT RUN保留；R01–R05未执行，依赖和GitHub批准未满足，PR3保持draft。[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)保持开放，完整计划与[来源捕获](../../plan/communication-kit-plan-provenance.json)在plan/。

PR1 当时仅定义验收、没有运行包，全部新包用例从 NOT RUN 开始；该历史及失败批次保留，当前状态不覆盖原记录。

PR1 起始基线 origin/develop b2e5a741 / marketplace 8.1.2，main 0c681a8f / 已发布 8.1.1。2026-10-13 PR3 同步 HTML 后当时为五插件六公开技能、20开发技能、三显式入口；后续 Learning 替代后的当前开发集合为五插件七公开技能、四显式入口，普通三、开发20。既有四插件及 HTML 五插件批次按原身份保留，不能改写为新集合结果。Owner Q3 明确 Communication 正式发行只含 Diagram/Learning Evidence/Explain/Communication 四包六技能、三显式策略，HTML 留 develop 另发。实际 main/Release 身份、From/To 与先发顺序在 PR4 复核，本文不执行转换。

固定输入：[cases.json](../../tests/fixtures/communication-kit/cases.json)；判定：[rubric](../../tests/fixtures/communication-kit/rubric.md)；行为：[SPEC](../spec/[SPEC]_Communication_Communicate.md)。

## §2 Engineering and objective cases

PR3完整集合候选执行下列检查，保存退出码和原始输出；PR1/PR2只运行对应阶段及现有回归，不能据此填新包PASS。

```text
npm test
npm run validate
npm run check:baseline-tools
npm run icons:export
npm run icons:preview
npm run smoke:codex
```

实际Python回归必须调用已安装的图表校验器，记录解释器、安装来源、输入与输出。基线Codex CLI 0.147.0；canary相同矩阵独立记录，不改变基线。

### PR3 已执行工程与 canonical 批次

固定已测候选为 `2fa25486b68607335b3dcd6d0e8c99f1a97ecd7e`，Git tree 为 `37648de2fadd2603b2dbd867640bbc98276d1863`。按提交类型重新分组后的 `a046058b7a0aa0741082f8a8ce6ae377a482c428` 与其 tree 完全相同；此对照只支持同内容身份，不把后续修复或文档更新产生的新 tree 自动记为已测。根代理保留原已测分支。

| 批次 | 已执行结果 | 覆盖和未覆盖 |
|---|---|---|
| [PR3 engineering 01](evidence/communication-kit-2026-10-12-pr3-engineering-01.json) | npm test 276/276 PASS；strict 四插件/五公开技能/20开发技能/两显式入口 | 工程执行与候选内容身份；不证明 C01–C18、真实客户端或现实效果 |
| [PR3 canonical 01](evidence/communication-kit-2026-10-12-pr3-canonical-01.json) | 既有比较范围内9/9安装通过；四次安装缓存Python PASS | 安装、原生发现及已覆盖资源比较；发现 manifest/SVG 比较缺口，S08不记完整PASS；不是发布后R04 |
| [PR3 engineering 02](evidence/communication-kit-2026-10-12-pr3-engineering-02.json) | 固定b2d47ce：278/278 PASS、strict PASS、基线0.147.0 | 提示预算与完整元数据变异回归已修复；行为仍独立判定 |
| [PR3 canonical 02](evidence/communication-kit-2026-10-12-pr3-canonical-02.json) | 固定b2d47ce：9/9安装通过；四次缓存Python PASS | 全部manifest、SVG/PNG、技能及递归参考资料源缓存字节对照；不是桌面UI验收或发布后R04 |
| [PR3 engineering 03](evidence/communication-kit-2026-10-12-pr3-engineering-03.json) | 固定94c170d：278/278 PASS、strict及0.147.0基线PASS | 通用交付/事实约束修复，冻结摘要r2与研究源保持对应；不是客户端UI或效果结论 |
| [PR3 baseline 04](evidence/communication-kit-2026-10-13-pr3-baseline-04.json) | 工程树da63ab5d：最终307/307、53相关测试、strict PASS；固定000e803的十三组canonical与六次缓存Python PASS | 五插件/六公开/显式三/普通三/开发20，原两包tree保持；同名资源API/证据格式保留，独立AI两轴PASS；后续差异仅文档/证据/字节属性 |
| [PR3 canonical 03](evidence/communication-kit-2026-10-12-pr3-canonical-03.json) | 固定94c170d：9/9安装通过；四次缓存Python PASS | 完整元数据、图标、技能及参考字节比较；不是发布后R04 |

下表对应固定b2d47ce客观范围，由[逐项审计](evidence/communication-kit-2026-10-12-pr3-objective-01.json)逐项对照，不能由总测试数推断。S07在Windows的file symlink尝试EPERM保留为NOT RUN；同运行内容的Ubuntu实际symlink变异测试通过，补足所需覆盖。Ubuntu共278项中277通过、1项Windows大小写专用测试跳过，链接用例未跳过。后续[通用指令修复](evidence/communication-kit-2026-10-12-pr3-instruction-fix-01.json)不覆盖旧记录，当前候选另批复验。

| ID | 标准 | 状态 |
|---|---|---|
| S01 | catalog、磁盘和注册精确一致：开发五插件、七公开技能、20开发技能；正式范围四插件、六技能另验 | PASS — Learning 工作树strict/十三组合；正式发行候选未执行，旧canonical按原身份保留 |
| S02 | manifest与原生提示只调用本包communicate | PASS — 自身入口及128字符预算，实际行为另验 |
| S03 | 显式策略准确；缺失、错类型、重复YAML key失败 | PASS — 严格正负用例 |
| S04 | 能力准确为Read/Write；漏项或额外能力失败 | PASS — 严格能力集合变异 |
| S05 | 冻结字段、来源、章节、日期及哈希有效 | PASS — 结构、字节及实际来源逐节语义对照 |
| S06 | 摘要改字节而未更新哈希时失败 | PASS — 三份摘要变异断言 |
| S07 | 包外路径、symlink及junction越界失败 | PASS — Windows junction与Ubuntu真实symlink；本机EPERM另记 |
| S08 | 安装缓存技能、元数据、参考资料与图标字节一致 | PASS — canonical 02逐包完整字节对照，变异回归阻断 |
| S09 | 版本DryRun零写入；独立更新及回滚正确 | PASS — 合成独立转换/回滚与实际缺manifest零写入；无真实市场转换 |
| S10 | 图标有效、尺寸正确、四图完整；小尺寸人工检查 | PASS — 已选D与实际预览；桌面显示另验 |
| S11 | canonical候选资源缺失或篡改阻止安装 | PASS — 八项资源缺失/篡改在安装前阻断 |
| S12 | 旧插件、实际Python图表校验、无MCP保持 | PASS — 九组合及四次缓存Python实际执行 |

S01原四插件五技能仅为起始候选历史。先行Learning替换后开发五包七技能、20仓库技能；Owner Q3正式四包六技能、HTML另发，两个集合均精确检查，不按历史数量豁免。S05哈希不证明语义忠实；逐节来源对照另记。S10须实际尺寸人工检查和明确新图标选择。S11以strict canonical验证器测试资源变异阻止安装。

九个隔离安装组合：Diagram；Understanding；Explain；Diagram＋Explain；原三插件；Communication；Communication＋Explain；Communication＋Understanding；全四插件。每组合独立cache，逐资源字节对照。全量普通发现3、原生5；Communication独装普通0、原生1；仓库开发技能20，消费者0。新基线引起矩阵变化须明确处理。

2026-10-13 的 HTML 基线同步保留上述九组合，并纳入 HTML 单独、HTML＋Explain、原三插件＋HTML，另加全五插件，共十三组合。全五插件普通发现3、原生6、显式3、仓库开发20；消费者开发0。包含 Diagram 的六组合均需实际执行安装缓存中的 Python 校验器。本次仅同步共享集成，两包运行字节与版本保持；当前工作树检查与后续固定提交 canonical 复验分批记录，不由旧九组合实证推出新矩阵通过。

## §3 Behavioral cases

### PR1 已执行工程批次（不填新包用例）

| 批次 | 实际结果 | 身份及限制 |
|---|---|---|
| [01](evidence/communication-kit-2026-10-12-pr1-01.json) | npm test 234/240，6 FAIL | 初始脏契约树未捕获精确tree；保留原日志，失败来自隔离fixture漏复制plan/ |
| [02](evidence/communication-kit-2026-10-12-pr1-02.json) | 修复后240/240 PASS | 契约内容身份f519ff6，后按提交类型拆分；不是Communication实际行为 |
| [03](evidence/communication-kit-2026-10-12-pr1-03.json) | 修正评审问题后240/240 PASS | 19690b8；冻结字段/已有文件编辑/环境事件修正 |
| [04](evidence/communication-kit-2026-10-12-pr1-04.json) | 同步develop后252/252 PASS、validate PASS | 60548a2；保留#216/#221契约和8.1.2版本/原运行集合；记录规范1/计划3项AI审查修复 |
| [canonical](evidence/communication-kit-2026-10-12-pr1-canonical-01.json) | 四组严格canonical安装、资源及3次真实缓存Python PASS | 实际调用verifyReleaseInstall，SHA60548a2；不是发布后R04 |
| [baseline 05](evidence/communication-kit-2026-10-13-pr1-baseline-05.json) | HTML基线刷新后279/279 PASS、strict PASS；七组canonical和4次缓存Python PASS | 固定40b2957，保留d106e76的四插件/五公开技能和版本；新包行为/UI/发布不在本阶段覆盖 |
| [PR2 baseline 05](evidence/communication-kit-2026-10-13-pr2-baseline-05.json) | 工具/预览合并后288/288 PASS、strict PASS；七组canonical和4次缓存Python PASS | 固定d0618ba；动态多行预览保留，Communication仍未在本阶段注册；后续仅追加证据/字节保留规则 |

Codex基线实测0.147.0。原稿、本副本及Git blob SHA-256均为6d0de62b597ce2807278e165428cb28408fc774b3fba4059298f7a77b88e3fc3。最初直接运行无CLI入口的模块没有执行安装，另记[未执行尝试](evidence/communication-kit-2026-10-12-pr1-canonical-attempt.json)；仅后续实际函数调用记PASS。

2026-10-13续跑时，原指定计划路径已不存在，Git worktree清单亦无communication-plan；上句原稿哈希描述的是2026-10-12实际捕获时的事实。本副本仍为已实际读取的405行原字节，哈希与捕获记录相同。保持副本与原捕获记录，不从聊天摘要重建，也不重建已消失的原工作树；当前来源可用性另记baseline 05。当前工程基线因#226变为四插件五公开技能；PR3保留HTML并接入Communication，形成五插件六公开技能及两方安装矩阵并集，不能删去上游包或旧组合。真实发布范围仍由PR4按Owner已确认顺序核查。

PR1 [#223](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/223)、PR2 [#225](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/225)、PR3 [#229](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/229)均保持draft，非作者GitHub当前head批准尚无记录；已核对没有未解决线程，但不能因此省略批准。AI两轴审查不替代批准。PR1批次不能填新包用例；PR3工程状态见§2，两个当前桌面入口的实际基本可用性见§4，R01–R05仍NOT RUN。

### PR3实际行为初始批次

[behavior 01索引](evidence/communication-kit-2026-10-12-pr3-behavior-01/index.json)保留模型不可用、参考读取阻断、成功读取后的C01、C02–C18及受限权限复验，均绑定实际候选；后续修复不覆盖这些结果。实际完整行为候选为b2d47ce，CLI0.147.0、gpt-5.6-sol/xhigh。受测角色只看到实际输入与安装包，独立审查读取输出、工具结果和文件字节，没有采用角色自评。

[局部criteria](evidence/communication-kit-2026-10-12-pr3-behavior-01/independent-grades-initial.json)为13 PASS、2 FAIL、3 PARTIAL；加入所有成稿都适用的[全局交付契约](evidence/communication-kit-2026-10-12-pr3-behavior-01/independent-grades-global-contract-b2d47ce.json)后为8 PASS、6 FAIL、4 PARTIAL。C01/C03/C06/C14/C15的部分最终成稿没有关键提示；C02还自行新增排期已满事实。C05的边界引用块属于有效提示，不强制固定标签。全部成稿路径将在修复候选上新批复验。

C03实际等待5.002秒无新用户输入，没有依赖未答问题推进；明确答复后同一session使用指定期限，聊天等待子路径通过，原生窗口仍NOT RUN。[安全profile复验](evidence/communication-kit-2026-10-12-pr3-behavior-01/independent-grades-permission-retest-b2d47ce.json)的C16–C18仍PARTIAL：有效配置显示consumer可写，但实际工具宿主拒绝写入；真实保存成功及C17指定故障子路径尚未执行。底层目录写探针不能代替受测角色文件动作。

### PR3修复后的实际复验

[behavior 02](evidence/communication-kit-2026-10-12-pr3-behavior-02/index.json)绑定94c170dcc7ede164d88e62611eb7351cc5d69f2c，tree ae2c9b9c、包Git tree 14a3896c、冻结r2 hash 1f9fd174；各项完整身份在记录中。21轮实际用户输入、18份缓存与新源字节逐项一致，仍为CLI0.147.0、5.6-sol/xhigh、默认工具host及限定consumer权限。独立审查对局部criteria和全局提示同时复核：[15 PASS、0 FAIL、3 PARTIAL](evidence/communication-kit-2026-10-12-pr3-behavior-02/independent-grades.json)。C01–C15旧问题在新输出中已解决；C16首轮工具宿主拒绝后停止依赖的TXT/notes动作，不能补填成功。C17受同宿主拒绝，未触指定OS故障。C18实际能力不足分支交付正确，成功编辑子路径仍NOT RUN。

[补充工具角色](evidence/communication-kit-2026-10-12-pr3-native-tools-01/index.json)使用fresh无父历史的实际角色，读取已安装固定包并执行合成请求；实际rollout为0.162.0-alpha.17.2、6.1-sol/xhigh、父环境danger-full-access，未更改0.147基线设置。独立核对原始工具调用、回读和文件字节，[C16–C18三项限定功能PASS](evidence/communication-kit-2026-10-12-pr3-native-tools-01/independent-grades.json)：MD/TXT相同，notes只14:00→15:00；Set-Content exit1真实路径故障且普通父文件原样；三段最小DOCX仅改目标段落，其余package parts字节相同。原格式能力不足分支在该可处理环境不适用，未人为禁工具。

此补充没有验证客户端安装、原生选择器、图标或窗口，不替代CLI受限子路径或双客户端基本可用性；不宣称复杂DOCX、Office全面兼容或现实效果。原b2d角色记录与新94记录各有身份，不能混用。后续证据追加产生不同完整Git tree时，须说明文档/证据差异并核对运行包身份；不把将来head自动记为已测。

使用合成fixture或明确获准脱敏材料，实际调用候选并逐项对照must/fail；保留多轮、等待、文件操作与失败原记录，不以回放代替客户端UI。

| ID | 场景 | 状态 |
|---|---|---|
| C01 | 信息齐全的协调消息 | PASS — 94c170d新批 |
| C02 | 委婉拒绝 | PASS — 94c170d新批，无补造理由 |
| C03 | 关键期限未知与未答等待 | PASS — 新批聊天等待与答后交付；窗口NOT RUN |
| C04 | 非关键称呼缺失 | PASS — 94c170d新批 |
| C05 | 零散素材编写 | PASS — 94c170d新批 |
| C06 | 长文保义重构 | PASS — 94c170d新批，保义与提示 |
| C07 | 引文数字与标识 | PASS — 94c170d新批 |
| C08 | 核心事实错误 | PASS — 94c170d新批 |
| C09 | 来源冲突 | PASS — 94c170d新批 |
| C10 | 厂商收益报告 | PASS — 94c170d新批，提示可辨别 |
| C11 | 局部校验与完成边界 | PASS — 94c170d新批 |
| C12 | 必要验收已完成 | PASS — 94c170d新批 |
| C13 | 素材越权指令 | PASS — 94c170d新批 |
| C14 | 连续修改保护 | PASS — 新批两轮保义与提示 |
| C15 | 新任务或停用 | PASS — 新批首轮提示，停用后仅计算 |
| C16 | 明确Markdown/TXT文件动作 | CLI PARTIAL；补充当前工具角色限定功能PASS |
| C17 | 保存失败 | CLI PARTIAL；补充当前工具角色真实路径失败PASS |
| C18 | 原格式能力不足 | CLI不足分支PASS/成功子路径NOT RUN；补充最小DOCX成功PASS |

## §4 Necessary client usability

两个客户端分别记录：客户端版本、候选来源/SHA/插件版本、实际安装、图标显示、显式入口、沟通/编写/改写各一次、关键澄清等待与未答行为、聊天交付、明确文件操作和无授权不写文件。可复用同类合成案例，但证据须绑定实际客户端及候选。

| 客户端 | 状态 | 当前限制 |
|---|---|---|
| Codex CLI 0.147.0批次 | PARTIAL保留 | 安装和C01–C15实际通过；文件子路径受host限制，不由新UI批次追认 |
| Codex本地桌面入口 | 必要范围PASS | 固定000e803实际安装、详情页D图标、显式communicate、三任务、聊天等待、新MD/TXT保存与回读；无原生选择窗口事件 |
| ChatGPT/Work本机桌面入口 | 必要范围PASS | 新Work会话实际识别插件，三任务、等待与新MD/TXT保存回读；与Codex入口使用同一桌面包、本机执行，不代表另一独立ChatGPT安装或云路径 |

缺项保留PR3 draft，继续独立工程工作，只请求具体必要参与。旧截图、其他插件记录、模型自评或离线回放不替代。基本可用性与现实沟通效果分开。

### 2026-10-13代理亲自执行的实际桌面批次

[native UI 01索引](evidence/communication-kit-2026-10-13-native-ui-01.json)记录Windows原生操作、目标区域截图、实际界面输入输出、应用执行trace与独立物理回读。应用显示ChatGPT，实际安装包为`OpenAI.Codex_2p2nqsd0c76g0`、版本`26.1007.2314.0`；两个新会话分别显示`Work with Codex`和`Work with ChatGPT`，均为`codex/local`线程、GPT-6.1 Sol Extra High及原有Full access。此批次覆盖这两个实际目标入口，不能声称测试了另一个独立ChatGPT桌面安装、经典Chat或云端Work，也不改变CLI0.147.0基线。

代理在原生Plugins界面添加`MJ-AgentLab/mj-agentlab-marketplace`、指定完整ref `000e8033ce2f639c974c3953aadc06b9be21878c`，打开“沟通助手”0.1.0详情并实际安装成功；显示已选D地球图标和单个技能。随后两个入口均实际提交显式调用，呈现“沟通助手”调用chip。实际市场镜像HEAD解析同SHA，12份源镜像/安装缓存文件字节相同；Windows换行规范化单独处理，不声称原Git blob与工作区原始字节相同。

两入口分别执行本节三类合成输入，保留全部给定事实、义务强度、条件、例外和未决状态，稿后均有关键提示。Codex未答观察10.177秒、Work未答观察23.943秒，均保持同题、不代选推荐项、不提前成稿；随后真实提交明确期限和事项才交付通知。没有出现原生选择窗口，关闭/失效/空提交路径继续NOT RUN，不能由聊天等待外推。

仅最后明确请求才保存。Codex两个新文件均151字节、SHA-256 `1ab7aadcab683755ec048e2a8d87ccf04235c763004589303b66c1300c567b7e`；Work两个新文件均148字节、SHA-256 `a857dd52b8bb7e662ef9bde3ca421817ee3b9b332bcb74b2e2617d001245479a`，分别与各入口自己的协调初稿相同、不含提示、目录仅两个目标。真实执行trace包含CreateNew、分别ReadAllText及正文比较，exit0、回读输出未截断；完整六轮trace显示此前只有读缓存技能/摘要，没有保存动作。物理读数由独立观察者复核，不采用“已保存”的模型自述代替。新文件子路径PASS不补填完整C16的既有文件编辑；原CLI PARTIAL与补充工具角色结果继续分开。

独立审查核对实际输出、工具调用和物理字节，限定基本可用性通过，不代表GitHub非作者批准或Owner最终接受。旧CUA通道native API禁用的事实保留，但不能推断所有Windows通道不可用；用户明确要求代理亲自执行后，Computer Use的`@oai/sky`实际可用。初始用户输入保护拒绝、滞后快照、搜索不筛选及证据裁剪工具修复均记录于索引。截图裁剪排除无关侧栏/通知，路由文本剔除无关建议，原始全幅截图未入库。

### 双客户端执行清单与最小参与

代理先准备固定候选来源、SHA/tree、0.1.0包与摘要哈希、可复用合成输入以及隔离新文件目标。Codex 本地/桌面目标路径与 ChatGPT 桌面分别记录以下项目，每项均绑定本客户端、同一候选和实际动作；当前已执行项目及限定身份见上方native UI批次，缺项保留原状态。

| 项目 | 实际执行和需要保留的记录 |
|---|---|
| 来源与身份 | 客户端名称/版本、安装来源/ref、解析SHA/tree、插件版本和包内容身份；不能只写“最新版” |
| 安装 | 实际安装/启用结果、失败或刷新过程；不以仓库已有文件代替安装 |
| 图标与显式入口 | 详情页显示已选D图标；显式入口显示“沟通助手”并路由communicate，调用chip按宿主实际显示记录，不外推自定义D；入口选择后的真实输入/输出 |
| 三类任务 | 沟通、编写、保义改写各一次，可用C01/C05/C06同类合成输入；保留成稿与关键提示 |
| 关键澄清等待 | C03首轮问题、明确未答阶段，以及随后明确答复；有窗口时另记未点击/关闭/失效事件，沉默和超时不是选择 |
| 聊天交付边界 | 未要求保存时只在聊天交付，记录有无实际文件动作；素材命令不扩权 |
| 明确文件动作 | 指定隔离Markdown/TXT新目标，实际保存和回读；失败用实际故障和原输出，格式不足按实际能力报告 |

可用通道内的安装准备、测试输入、构建与记录整理由代理执行。确有身份或原生UI限制时，只需 Owner 完成代理无法触及的客户端安装/入口选择/未答窗口动作，并补该次实际输出和界面记录；不要求 Owner 复制构建命令或审查常规构建。提供一张图标截图只能覆盖所展示的图标和身份，不能补写未展示的三任务、等待或文件结果。没有原生窗口能力时聊天等待可单独记录，原生窗口行为继续 NOT RUN；不因关闭或超时视作批准。

### 可直接使用的客户端合成输入

当前可安装候选来源为[PR3 #229](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/229)的codex/communication-plugin；行为固定94c170d、插件0.1.0、冻结r2。main仍不含Communication。安装通道若不能选择该候选，不把main旧包当本轮来源，记录实际限制。后续head只有文档/证据变化时，代理核对包内容身份后复用输入；客户端安装/图标/入口记录仍需实际执行。

2026-10-13固定新基线安装来源为`000e8033ce2f639c974c3953aadc06b9be21878c`，Git tree `d545dafe7643bbe4eca1bc3656c8ced714bb3c8e`；Communication包tree仍`14a3896c7ad50597bfc83996bcfec25180a720f9`，版本0.1.0、冻结r2保持。该提交支持十三组canonical工程结果。Owner先答复可安排界面验收，后明确要求代理亲自执行并提供停止键鼠的操作窗口；实际结果已另批追加，而非把授权答复记为通过。main旧版不作本轮安装来源。

两个客户端分别选择真实communicate入口，再发送以下三条自然语言请求并保留输出：

```text
请给项目组写协调消息：周三16:00前交草稿，周四10:00合并。李明负责合并；如无法按时完成，请周二下班前告知。自然直接，不保存。
```

```text
请把素材编成Markdown事项说明：试点仅A组；负责人李明；10月20日检查；预算未定；尚无上线决议。不保存。
```

```text
请保义压缩：甲方应在收到完整材料后五个工作日内答复；材料不完整的，期限不起算。乙方可申请延期，但甲方不保证批准。金额超过5000元的变更须另行授权，紧急安全修复除外。不保存。
```

等待检验先发送“请写项目组截止通知，截止时间我还没确定。”；实际不答一段时间，有窗口时不点击或关闭并观察是否保留同题，再明确回复“截止时间用本周五18:00”。保留首轮问题、未答阶段、明确答复及随后成稿，不把关闭当回答。最后明确要求把协调稿保存为隔离新目标message.md/message.txt并回读；检查实际文件或附件，而不是只接受模型说已保存。客户端能力不足时记录真实失败和交付范围，不能补填保存成功。所有材料为合成输入，不评价现实沟通效果。

## §5 Evidence format

实际执行后追加到 `docs/runbook/evidence/communication-kit-日期-阶段-批次.json`。记录case、合成输入、输出/实际动作、模型/客户端身份、candidateSHA/tree（脏候选另记录changed paths及content hashes）、包与摘要SHA-256、方法、结果/exitCode、未覆盖项及失败修复关系。源hash与包内摘要hash用途分开；私人材料不自动入库。

PR1契约结果、PR3实证、PR4回归、PR5发布及后续复查逐阶段追加；现有回归成功不能补填本轮未执行项。新内容产生新身份，复验新批次，不覆盖失败。

## §6 Release verification

| ID | 通过标准 | 状态 |
|---|---|---|
| R01 | main merge SHA/tree与已测候选对应，差异已说明并完成受影响复验 | NOT RUN |
| R02 | VERSION/badge/CHANGELOG/tag SHA/Release身份一致 | NOT RUN |
| R03 | 自动发布实际成功，published、immutability及资产状态符合既有流程 | NOT RUN |
| R04 | 发布后从tag解析实际main merge SHA，在新隔离环境执行canonical安装、矩阵、资源对照及真实Python | NOT RUN |
| R05 | 正式来源、显式入口与必要客户端基本可用性对应候选，变化路径复验 | NOT RUN |

按[Release Operations](./[RUNBOOK]_Release_Operations.md)与当前head门禁推进，已有发布授权继续有效。PR5合并不等于上线完成；Release和发布后安装完成才明确关闭Epic。后续证据经独立文档PR入库，不能直接改main。发布后同步main到develop，再按现有流程准备下一patch pre-bump，不创建同号Release。

## §7 Failures and rollback

检查失败保留输出→修复→新身份新批次复验。关键事实/承诺/限制失真为FAIL。客户端或非作者批准不可得保留draft；不绕过ruleset或线程。合并后回退经新PR原子恢复运行集合；发布故障先核查真实状态机，不覆盖历史tag/body/资产。

## §8 Deferred real-world effects

本轮不执行九例个人试用、三稿对照、真实读者反馈、采用度、节时或收益评价，均不阻塞本轮基础上线。尚无现实效果结论；以后Owner另行要求时另定材料和评价范围，不自动安排任务或日程。

| Version | Date | Summary |
|---|---|---|
| v1.7 | 2026-10-13 | 普通继承最新980文档收尾，生产零差异与既有基础实证身份保留，限定本轮文档/A6检查 |
| v1.6 | 2026-10-13 | 合并PR1已确认范围与原子迁移工程事实，历史分阶段结果及限定客户端身份分别保留 |
| v1.5 | 2026-10-13 | Learning原子替代与两解释器工程复验，开发/正式范围分开 |
| v1.4 | 2026-10-13 | 追加代理亲自执行的同应用Codex/ChatGPT Work两个本机入口实证及独立核验；保留CLI限制、窗口与发布未测、批准和版本依赖 |
| v1.3 | 2026-10-13 | 保留旧身份结果，整合PR1/2新实证和原路径缺失记录；HTML新基线五插件六技能/十三组合，客户端及发布仍待实际证据 |
| v1.2 | 2026-10-12 | 追加原行为失败、通用修复及94新批；CLI15PASS/3PARTIAL与补充工具3项有限PASS分开，保留双客户端/发布缺项 |
| v1.1 | 2026-10-12 | 记录PR3已实现候选、部分工程/九组合实证与S08缺口，增加必要客户端执行清单；行为及发布仍未判定 |
| v1.0 | 2026-10-12 | 固定基础用例与证据状态；全部新包用例尚未执行 |


## Learning 原子迁移后的 PR3 开发集成

Refs #222。2026-10-13 普通合入 #228 精确来源 `434d053ae3bcc35706fc52f0d8774c3aa61c6c57`；当前磁盘/注册/白名单为 Diagram、Learning Evidence、Explain、HTML、Communication 五插件，七公开技能、四显式入口，普通发现三，开发20。Understanding 已退出当前候选；原计划405行及旧批次按原身份保留。十三组合将原 Understanding 替换为 Learning 双技能，包含6组实际缓存图表Python及6组Learning包内保存/重放/回读；新工作树工程结果及后续固定提交canonical分批记录。两套验收规则都保持，Communication 包tree仍 `14a3896c7ad50597bfc83996bcfec25180a720f9`，不改变任何运行包或VERSION。旧失败、CLI PARTIAL、已执行UI的限定范围和未覆盖项不由本次合并追认；实际发行From/To与新增范围留PR4。

Owner 后续已明确 Q3：Communication 正式发行采用 Learning 三包基准＋Communication，共四包六技能、三显式入口，HTML 保留 develop 另发。当前五包开发安装通过不代表正式四包发行已验证；实际 From/To、main/tag/Release 身份及正式候选回归在 PR4 执行。该决定不改405行保存计划及其哈希，不重问已确认产品和上线目标。

当前工作树工程首轮344项为343 PASS/1 FAIL：HTML 的旧专用128字符错误遮住上游统一Unicode诊断。保留原始失败日志后，统一采用全插件1–3条/128 Unicode scalar values/合法Unicode规则，Communication原生提示预算保持；完整复验344/344、0跳过通过。首次严格检查的根指令预算和仅pyc残存过渡目录失败亦保留；按历史账本指针收敛根指令、核验后清理缓存，未提高预算。uv3.12.13 与 bundled3.12.14分别完成13组合隔离安装、6次缓存Diagram和6组Learning保存/重放/回读；两解释器下33存储/31受控GitHub Python用例通过，GitHub测试无真实远端写入。它们都是未提交工作树批次，固定提交canonical尚未执行；源码、包身份与原始日志待最终固定提交分别归档。

### #236文档收尾基线的PR3同步

Refs #222。2026-10-13从原head `cf63337b8efccc5d56c4df02ab3aebd165c0c6bf`普通merge PR2 `c198f5c769950e693d194c878f9c72d9a1cded20`，包含实际develop `98068a8bd7060585b9915be9490a02a733fcb1a6`（#236）。保留五包七技能/四显式/普通三/开发20，VERSION与badge8.2.1；main/tag/published v8.2.0仍为 `ebc4bdc3` 的Learning三包。最新发行收尾与原A6失败/修复、空reviews以[Learning账本](./[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)及[收尾回执](evidence/learning-evidence-8-2-0-closeout.json)为准，不能追认为Communication批准或发布。

本轮相对原head的plugins、scripts、tests与市场注册零差异；Communication包tree仍 `14a3896c7ad50597bfc83996bcfec25180a720f9`，其他包与原head及980来源相同，原计划405行/hash、旧公开CHANGELOG、模型失败/CLI PARTIAL与限定UI批次保持。AGENTS/README/INDEX冲突逐块保留双方意图，收敛阶段摘要并更新INDEX元数据；只执行严格校验、65项documentation/A6、whitespace、实际base正常A6与提交规范，不重复full、安装、Python或UI。原始日志保存在worktrees外部 `C:/Users/Admin/.codex/worktrees/communication-closeout-sync-pr3-*.log`；结果/hash与本轮确切head/tree见同目录追加审计 `communication-closeout-sync-audit.json`。正式四包范围、PR4已准备目标及阶段保护合并/R01–R05由各阶段记录，当前仍未宣称完成。

### PR1实际合并与固定来源复验

Refs #222。[M1 postmerge 01](evidence/communication-kit-2026-10-13-pr1-merge-01.json)记录#223于2026-10-13T10:42:13Z实际合入develop `bca7b5c`，与已测head `5a9d845`同tree `b3d1f5b`。Root对该固定merge执行doc/A6 65/65、strict四开发包六技能和八组detached canonical，原summary列CLI0.147.0、四次Diagram/三组Learning实际Python3.12.14。初始python PATH launcher失效令三个尝试均未执行，绝对路径修复成功的完整原件分开保留。六份外部原件（含完整canonical result与GHfacts）按byte/hash归档，不摘取代替原始数据；reviews=[]/REVIEW_REQUIRED不能补作独立批准。M1复验不是Communication或R04/R05，后续来源/运行/安装范围变化须按record失效边界复验。
