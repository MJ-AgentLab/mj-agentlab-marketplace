---
type: runbook
scope: marketplace
summary: "Communication acceptance procedures, evidence identity and release gates"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-13
state: draft
version: v1.1
---

# [RUNBOOK] Communication Kit acceptance

## §1 Preconditions and status

产品方向已确认；PR1 仅定义验收，插件实现及下表全部用例 **NOT RUN**。没有成功日期或预填结果。[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222)保持开放，完整计划与[来源捕获](../../plan/communication-kit-plan-provenance.json)在 plan/。

实施基线 origin/develop b2e5a741 / marketplace 8.1.2，main 0c681a8f / 已发布 8.1.1。Owner 选择 Learning 先 8.2.0，Communication 随后独立 minor（预计 8.3.0）；PR4 重查实际版本和基线范围，本文不执行转换。

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

| ID | 标准 | 状态 |
|---|---|---|
| S01 | catalog、磁盘和注册精确一致：四插件、五公开技能、20开发技能 | NOT RUN |
| S02 | manifest与原生提示只调用本包communicate | NOT RUN |
| S03 | 显式策略准确；缺失、错类型、重复YAML key失败 | NOT RUN |
| S04 | 能力准确为Read/Write；漏项或额外能力失败 | NOT RUN |
| S05 | 冻结字段、来源、章节、日期及哈希有效 | NOT RUN |
| S06 | 摘要改字节而未更新哈希时失败 | NOT RUN |
| S07 | 包外路径、symlink及junction越界失败 | NOT RUN |
| S08 | 安装缓存技能、元数据、参考资料与图标字节一致 | NOT RUN |
| S09 | 版本DryRun零写入；独立更新及回滚正确 | NOT RUN |
| S10 | 图标有效、尺寸正确、四图完整；小尺寸人工检查 | NOT RUN |
| S11 | canonical候选资源缺失或篡改阻止安装 | NOT RUN |
| S12 | 旧插件、实际Python图表校验、无MCP保持 | NOT RUN |

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
| [baseline 05](evidence/communication-kit-2026-10-13-pr1-baseline-05.json) | HTML基线刷新后279/279 PASS、strict PASS；七组canonical和4次缓存Python PASS | 固定40b2957，保留d106e76的四插件/五公开技能和版本；新包行为/UI/发布不在本阶段覆盖 |
| [PR2 baseline 05](evidence/communication-kit-2026-10-13-pr2-baseline-05.json) | 工具/预览合并后288/288 PASS、strict PASS；七组canonical和4次缓存Python PASS | 固定d0618ba；动态多行预览保留，Communication仍未在本阶段注册；后续仅追加证据/字节保留规则 |

Codex基线实测0.147.0。原稿、本副本及Git blob SHA-256均为6d0de62b597ce2807278e165428cb28408fc774b3fba4059298f7a77b88e3fc3。最初直接运行无CLI入口的模块没有执行安装，另记[未执行尝试](evidence/communication-kit-2026-10-12-pr1-canonical-attempt.json)；仅后续实际函数调用记PASS。

2026-10-13续跑时，原指定计划路径已不存在，Git worktree清单亦无communication-plan；上句原稿哈希描述的是2026-10-12实际捕获时的事实。本副本仍为已实际读取的405行原字节，哈希与捕获记录相同。保持副本与原捕获记录，不从聊天摘要重建，也不重建已消失的原工作树；当前来源可用性另记baseline 05。当前工程基线因#226变为四插件五公开技能；PR3须保留HTML并接入Communication，形成五插件六公开技能及两方安装矩阵并集，不能删去上游包或旧组合。真实发布范围仍由PR4按Owner已确认顺序核查。

PR1 [#223](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/223)保持draft，非作者GitHub当前head批准尚无记录。AI两轴审查不替代批准。S01–S12/C01–C18、真实客户端与R01–R05仍按下表NOT RUN。

使用合成fixture或明确获准脱敏材料，实际调用候选并逐项对照must/fail；保留多轮、等待、文件操作与失败原记录，不以回放代替客户端UI。

| ID | 场景 | 状态 |
|---|---|---|
| C01 | 信息齐全的协调消息 | NOT RUN |
| C02 | 委婉拒绝 | NOT RUN |
| C03 | 关键期限未知与未答等待 | NOT RUN |
| C04 | 非关键称呼缺失 | NOT RUN |
| C05 | 零散素材编写 | NOT RUN |
| C06 | 长文保义重构 | NOT RUN |
| C07 | 引文数字与标识 | NOT RUN |
| C08 | 核心事实错误 | NOT RUN |
| C09 | 来源冲突 | NOT RUN |
| C10 | 厂商收益报告 | NOT RUN |
| C11 | 局部校验与完成边界 | NOT RUN |
| C12 | 必要验收已完成 | NOT RUN |
| C13 | 素材越权指令 | NOT RUN |
| C14 | 连续修改保护 | NOT RUN |
| C15 | 新任务或停用 | NOT RUN |
| C16 | 明确Markdown/TXT文件动作 | NOT RUN |
| C17 | 保存失败 | NOT RUN |
| C18 | 原格式能力不足 | NOT RUN |

## §4 Necessary client usability

两个客户端分别记录：客户端版本、候选来源/SHA/插件版本、实际安装、图标显示、显式入口、沟通/编写/改写各一次、关键澄清等待与未答行为、聊天交付、明确文件操作和无授权不写文件。可复用同类合成案例，但证据须绑定实际客户端及候选。

| 客户端 | 状态 | 当前限制 |
|---|---|---|
| Codex CLI 0.147.0 / 本地目标路径 | NOT RUN | 有本机CLI，尚未执行候选；CLI元数据不证明桌面UI |
| ChatGPT 桌面端 | NOT RUN | 当前自动化原生API禁用，且Computer Use禁操作该UI；必要实际交互证据待补 |
| Codex 桌面图标/入口交互 | NOT RUN | 本机存在Codex包，但尚未进行本候选UI交互 |

缺项保留PR3 draft，继续独立工程工作，只请求具体必要参与。旧截图、其他插件记录、模型自评或离线回放不替代。基本可用性与现实沟通效果分开。

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
| v1.1 | 2026-10-13 | 追加HTML基线同步、279测试与七组canonical；如实记录原路径缺失和原字节副本身份 |
| v1.0 | 2026-10-12 | 固定基础用例与证据状态；全部新包用例尚未执行 |

