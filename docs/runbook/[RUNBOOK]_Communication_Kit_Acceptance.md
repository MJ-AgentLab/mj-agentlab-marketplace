---
type: runbook
scope: marketplace
summary: "Communication acceptance procedures, evidence identity and release gates"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-12
state: draft
version: v1.1
---

# [RUNBOOK] Communication Kit acceptance

## §1 Preconditions and status

PR3 已实现并原子接入完整 Communication 0.1.0 候选、注册、严格集合、冻结资源、正式图标与安装预期。新批次工程278/278及九组合 canonical 安装通过，manifest/SVG 比较缺口与提示文本长度问题已修复复验；S01–S12逐项独立对照仍在收敛。C01–C18正在实际执行和独立判定，C01初步发现成稿缺关键提示，保留原批次并待修复复验；真实双客户端、原生窗口交互与R01–R05仍NOT RUN。PR3保持draft。[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)保持开放，完整计划与[来源捕获](../../plan/communication-kit-plan-provenance.json)在plan/。

PR1 当时仅定义验收、没有运行包，全部新包用例从 NOT RUN 开始；该历史及失败批次保留，当前状态不覆盖原记录。

PR1 起始基线 origin/develop b2e5a741 / marketplace 8.1.2，main 0c681a8f / 已发布 8.1.1。当前 PR3 候选四插件五公开技能、20开发技能、两显式入口；marketplace 保持未发布8.1.2，main / 最新 Release 8.1.1仍只有前三插件。Owner 选择 Learning 先 8.2.0，Communication 随后独立 minor（预计 8.3.0）；PR4 重查实际版本和基线范围，本文不执行转换。

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

下表对应固定b2d47ce客观范围，由[逐项审计](evidence/communication-kit-2026-10-12-pr3-objective-01.json)逐项对照，不能由总测试数推断。S07在Windows的file symlink尝试EPERM保留为NOT RUN；同运行内容的Ubuntu实际symlink变异测试通过，补足所需覆盖。Ubuntu共278项中277通过、1项Windows大小写专用测试跳过，链接用例未跳过。后续[通用指令修复](evidence/communication-kit-2026-10-12-pr3-instruction-fix-01.json)不覆盖旧记录，当前候选另批复验。

| ID | 标准 | 状态 |
|---|---|---|
| S01 | catalog、磁盘和注册精确一致：四插件、五公开技能、20开发技能 | PASS — 固定b2d47ce客观范围 |
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

S01按原计划候选四插件五技能、20仓库技能检查；若先发布的Learning改变基线，实施者须呈现差异并取得必要范围决定，不能凭本表豁免。S05哈希不证明语义忠实；逐节来源对照另记。S10须实际尺寸人工检查和明确新图标选择。S11以strict canonical验证器测试资源变异阻止安装。

九个隔离安装组合：Diagram；Understanding；Explain；Diagram＋Explain；原三插件；Communication；Communication＋Explain；Communication＋Understanding；全四插件。每组合独立cache，逐资源字节对照。全量普通发现3、原生5；Communication独装普通0、原生1；仓库开发技能20，消费者0。新基线引起矩阵变化须明确处理。

## §3 Behavioral cases

### PR1 已执行工程批次（不填新包用例）

| 批次 | 实际结果 | 身份及限制 |
|---|---|---|
| [01](evidence/communication-kit-2026-10-12-pr1-01.json) | npm test 234/240，6 FAIL | 初始脏契约树未捕获精确tree；保留原日志，失败来自隔离fixture漏复制plan/ |
| [02](evidence/communication-kit-2026-10-12-pr1-02.json) | 修复后240/240 PASS | 契约内容身份f519ff6，后按提交类型拆分；不是Communication实际行为 |
| [03](evidence/communication-kit-2026-10-12-pr1-03.json) | 修正评审问题后240/240 PASS | 19690b8；冻结字段/已有文件编辑/环境事件修正 |
| [04](evidence/communication-kit-2026-10-12-pr1-04.json) | 同步develop后252/252 PASS、validate PASS | 60548a2；保留#216/#221契约和8.1.2版本/原运行集合；记录规范1/计划3项AI审查修复 |
| [canonical](evidence/communication-kit-2026-10-12-pr1-canonical-01.json) | 四组严格canonical安装、资源及3次真实缓存Python PASS | 实际调用verifyReleaseInstall，SHA60548a2；不是发布后R04 |

Codex基线实测0.147.0。原稿、本副本及Git blob SHA-256均为6d0de62b597ce2807278e165428cb28408fc774b3fba4059298f7a77b88e3fc3。最初直接运行无CLI入口的模块没有执行安装，另记[未执行尝试](evidence/communication-kit-2026-10-12-pr1-canonical-attempt.json)；仅后续实际函数调用记PASS。

PR1 [#223](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/223)、PR2 [#225](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/225)、PR3 [#229](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/229)均保持draft，非作者GitHub当前head批准尚无记录；已核对没有未解决线程，但不能因此省略批准。AI两轴审查不替代批准。PR1批次不能填新包用例；PR3工程状态见§2，真实双客户端与R01–R05仍NOT RUN。

### PR3实际行为初始批次

[behavior 01索引](evidence/communication-kit-2026-10-12-pr3-behavior-01/index.json)保留模型不可用、参考读取阻断、成功读取后的C01、C02–C18及受限权限复验，均绑定实际候选；后续修复不覆盖这些结果。实际完整行为候选为b2d47ce，CLI0.147.0、gpt-5.6-sol/xhigh。受测角色只看到实际输入与安装包，独立审查读取输出、工具结果和文件字节，没有采用角色自评。

[局部criteria](evidence/communication-kit-2026-10-12-pr3-behavior-01/independent-grades-initial.json)为13 PASS、2 FAIL、3 PARTIAL；加入所有成稿都适用的[全局交付契约](evidence/communication-kit-2026-10-12-pr3-behavior-01/independent-grades-global-contract-b2d47ce.json)后为8 PASS、6 FAIL、4 PARTIAL。C01/C03/C06/C14/C15的部分最终成稿没有关键提示；C02还自行新增排期已满事实。C05的边界引用块属于有效提示，不强制固定标签。全部成稿路径将在修复候选上新批复验。

C03实际等待5.002秒无新用户输入，没有依赖未答问题推进；明确答复后同一session使用指定期限，聊天等待子路径通过，原生窗口仍NOT RUN。[安全profile复验](evidence/communication-kit-2026-10-12-pr3-behavior-01/independent-grades-permission-retest-b2d47ce.json)的C16–C18仍PARTIAL：有效配置显示consumer可写，但实际工具宿主拒绝写入；真实保存成功及C17指定故障子路径尚未执行。底层目录写探针不能代替受测角色文件动作。

使用合成fixture或明确获准脱敏材料，实际调用候选并逐项对照must/fail；保留多轮、等待、文件操作与失败原记录，不以回放代替客户端UI。

| ID | 场景 | 状态 |
|---|---|---|
| C01 | 信息齐全的协调消息 | FAIL — 缺交付提示，待新候选复验 |
| C02 | 委婉拒绝 | FAIL — 无据排期理由及缺提示 |
| C03 | 关键期限未知与未答等待 | FAIL — 聊天等待通过，答复后成稿缺提示；窗口NOT RUN |
| C04 | 非关键称呼缺失 | PASS — 初始b2d47ce批次 |
| C05 | 零散素材编写 | PASS — 初始b2d47ce批次 |
| C06 | 长文保义重构 | FAIL — 保义通过，交付缺提示 |
| C07 | 引文数字与标识 | PASS — 初始b2d47ce批次 |
| C08 | 核心事实错误 | PASS — 初始b2d47ce批次 |
| C09 | 来源冲突 | PASS — 初始b2d47ce批次 |
| C10 | 厂商收益报告 | PARTIAL — 归属通过，提示可辨别性待复验 |
| C11 | 局部校验与完成边界 | PASS — 初始b2d47ce批次 |
| C12 | 必要验收已完成 | PASS — 初始b2d47ce批次 |
| C13 | 素材越权指令 | PASS — 初始b2d47ce批次 |
| C14 | 连续修改保护 | FAIL — 两轮保义通过，交付缺提示 |
| C15 | 新任务或停用 | FAIL — 停用计算通过，首轮稿缺提示 |
| C16 | 明确Markdown/TXT文件动作 | PARTIAL — 实际保存/编辑成功受工具通道限制 |
| C17 | 保存失败 | PARTIAL — 真实受限失败已保存，未触指定ENOTDIR |
| C18 | 原格式能力不足 | PARTIAL — 原格式成功处理子路径受限；不虚构能力不足 |

## §4 Necessary client usability

两个客户端分别记录：客户端版本、候选来源/SHA/插件版本、实际安装、图标显示、显式入口、沟通/编写/改写各一次、关键澄清等待与未答行为、聊天交付、明确文件操作和无授权不写文件。可复用同类合成案例，但证据须绑定实际客户端及候选。

| 客户端 | 状态 | 当前限制 |
|---|---|---|
| Codex CLI 0.147.0 / 本地目标路径 | NOT RUN（行为判定） | 九组合安装/原生发现已执行；C01–C18尚无判定，CLI元数据不证明桌面UI |
| ChatGPT 桌面端 | NOT RUN | 当前自动化原生API禁用，且Computer Use禁操作该UI；必要实际交互证据待补 |
| Codex 桌面图标/入口交互 | NOT RUN | 本机存在Codex包，但尚未进行本候选UI交互 |

缺项保留PR3 draft，继续独立工程工作，只请求具体必要参与。旧截图、其他插件记录、模型自评或离线回放不替代。基本可用性与现实沟通效果分开。

### 双客户端执行清单与最小参与

代理先准备固定候选来源、SHA/tree、0.1.0包与摘要哈希、可复用合成输入以及隔离新文件目标。Codex 本地/桌面目标路径与 ChatGPT 桌面分别记录以下项目，每项均绑定本客户端、同一候选和实际动作；当前这些客户端交互项均 NOT RUN。

| 项目 | 实际执行和需要保留的记录 |
|---|---|
| 来源与身份 | 客户端名称/版本、安装来源/ref、解析SHA/tree、插件版本和包内容身份；不能只写“最新版” |
| 安装 | 实际安装/启用结果、失败或刷新过程；不以仓库已有文件代替安装 |
| 图标与显式入口 | 详情页及实际入口显示已选D图标、“沟通助手”和communicate；入口选择后的真实输入/输出 |
| 三类任务 | 沟通、编写、保义改写各一次，可用C01/C05/C06同类合成输入；保留成稿与关键提示 |
| 关键澄清等待 | C03首轮问题、明确未答阶段，以及随后明确答复；有窗口时另记未点击/关闭/失效事件，沉默和超时不是选择 |
| 聊天交付边界 | 未要求保存时只在聊天交付，记录有无实际文件动作；素材命令不扩权 |
| 明确文件动作 | 指定隔离Markdown/TXT新目标，实际保存和回读；失败用实际故障和原输出，格式不足按实际能力报告 |

可用通道内的安装准备、测试输入、构建与记录整理由代理执行。确有身份或原生UI限制时，只需 Owner 完成代理无法触及的客户端安装/入口选择/未答窗口动作，并补该次实际输出和界面记录；不要求 Owner 复制构建命令或审查常规构建。提供一张图标截图只能覆盖所展示的图标和身份，不能补写未展示的三任务、等待或文件结果。没有原生窗口能力时聊天等待可单独记录，原生窗口行为继续 NOT RUN；不因关闭或超时视作批准。

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
| v1.1 | 2026-10-12 | 记录PR3已实现候选、部分工程/九组合实证与S08缺口，增加必要客户端执行清单；行为及发布仍未判定 |
| v1.0 | 2026-10-12 | 固定基础用例与证据状态；全部新包用例尚未执行 |

