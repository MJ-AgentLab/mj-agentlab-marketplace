---
type: runbook
scope: html-guide-kit
summary: "HTML Guide Kit staged execution ledger and unperformed acceptance gaps"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-13
state: draft
version: v1.6
last-verified: null
related:
  - "../adr/[ADR]_HTML_Guide_Kit_Addition.md"
  - "../spec/[SPEC]_HTML_Guide_Kit_Acceptance.md"
---

# [RUNBOOK] HTML Guide Kit acceptance

本记录保存 HTML Guide Kit 三阶段实施的实际证据。PR1 #221 已合并并复验，PR2 #226 已合并；PR2 工程安装与六组指定连续模型行为见 §8–§10，实际 merge 与 PR3 进展从 §11 追加。阶段早期的未执行、失败与无效调用保留原身份，不追认 PASS。扩展与原生客户端验收尚未完成，保持 draft / `last-verified: null`；不能以产品合同、研究参考或 CLI 安装替代缺失的客户端与效果证据。

验收依据为 [SPEC](../spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)，产品与阶段决定见 [ADR](../adr/[ADR]_HTML_Guide_Kit_Addition.md)。本 RUNBOOK、SPEC 及后续评审证据都是 **reviewer-only**，从被测模型的镜像和 consumer 环境排除。模型只见原材料及逐轮输入。

Owner 于 2026-10-12 明确本次暂不需要实际场景效果测试，现实场景另测。理解改善、认知负荷及长期掌握的 `effect_status=NOT_MEASURED`，不阻断 develop 接入；安装、合成行为、双客户端交互与工程质量门禁继续保留。工程证据不能证明现实学习效果，Owner 最终接受独立于代理的合成验收。正式发布不在本次授权范围。

## §1 Preconditions and observed baseline

| 对象 | 2026-10-12 实际观察 | 层级与限制 |
| --- | --- | --- |
| 本阶段独立 worktree | 本地 `HEAD=b2e5a74109f47ecee7471ba741fb4c1348457f3b` | 是阶段 1 起点，尚非已测运行候选或 merge 身份；后续重新核对远端并记录实际 base |
| 市场 VERSION | 8.1.2 | 未发布开发预升；本任务保持市场版本 |
| 市场索引 | diagram-kit、understanding-kit、explain-kit | 三插件运行集合；阶段 1 不提前登记新插件或空包 |
| 现有根 manifest | diagram-kit 0.3.1、understanding-kit 0.1.2、explain-kit 0.1.1 | 来自实际文件读取；本任务保持其他插件版本 |
| 新插件合同 | html-guide-kit 0.1.0、唯一 guide、Read、显式调用 | 尚未分发/安装/行为验收，不写 PASS |
| 工作跟踪 | Epic #217；阶段子 Issue #218 / #219 / #220 | 过程计划在 Issue / PR；架构入 ADR、验收入本记录，不新增 plans/ |
| 脚本入口 | 起点提供 test、validate、check:baseline-tools、smoke:codex | 用户要求 check / smoke；阶段治理须核对并记录新增别名及实际执行入口，不能在入口尚不存在时声称执行 |

在当前阶段仅实际读取根 AGENTS、治理/文档/提交/品牌规范、模板、开发测试 GUIDE 及既有 Explain/Understanding 验收记录。该读取用于编写验收合同，不证明后续测试已经执行。研究材料与参考聊天的实际可访问性由主工程记录单独说明，不在这里推断已读取。

后续每一阶段在测试前重新记录远端 develop、并发变更、实际分支和完整 SHA；后一阶段从上一阶段实际 merge 后的最新 develop 派生。保持用户已有内容与研究项目未提交沉淀。

## §2 Execution steps

### §2.1 Freeze and isolate

1. 将本批次 SPEC 版本、材料原始字节及 reviewer-only 判准摘要冻结；保存评审环境中的控制文件和哈希。
2. 准备完整 canonical 候选的精确 Git worktree，用于严格安装和版本/资源检查。记录 head/tree、所有运行版本与 PR，不以工作区未提交内容替代 canonical 身份。
3. 从相同候选建立评审镜像，显式排除本 SPEC、本 RUNBOOK、全部 evals、结果、控制与证据目录；保存排除清单和镜像身份。镜像不要求与完整仓库 Git tree 相同。
4. 建立独立 HOME、CODEX_HOME、cache、consumer cwd 和中性随机材料目录。确认模型没有可读取的评审答案/判准，开发技能只在仓库作用域出现。
5. 比较源、镜像和安装缓存中的运行资源逐文件 SHA-256；不足或不同则停止模型批次，记录 INVALID_RUN 并修复，不能用失败批次追认 PASS。

### §2.2 Engineering and canonical installation

执行用户要求的 `npm test`、`npm run validate`、`npm run check`、`npm run smoke`；记录别名实际路由、执行时环境、返回码、测试数量与跳过项。保持 CLI 0.147.0 验收基线；必要 Python/PowerShell 环境须强制真实执行，不把缺失被跳过当成功。

按 SPEC §6.1 执行保留的四个安装场景与新增三个场景。正常基线全部组合应为四插件、五公开技能、三个自然启用技能；仓库外零开发技能、仓库内 20 项。存在实际批准的并发新增时保存该集合及本任务净增量，不覆盖上游。

逐场景核对安装身份/版本、manifest/Read、显式策略、实际资源与图标字节、缓存 locator、原生发现与普通提示范围。含 Diagram Kit 场景实际执行安装缓存中的 Python 图表校验，保存工具路径、输入图/证据、返回码和扫描结果。严格安装在完整 canonical 候选和最终 merge 身份上分别执行。

### §2.3 PR2 real continuous synthetic behavior

运行 SPEC §4 的 B1.1–B6.2 全部变体。每个 fresh 变体建立真实 UUID；未确认、修改确认、冲突追问与越界请求继续同一 UUID。输入仅含中性原材料及当轮用户话语，不含评审表。

记录实际安装缓存 SKILL/reference 读取事件、模型/提供方/reasoning、客户端版本、材料哈希、全部输入输出和工具返回。评审者逐项填写 PASS / FAIL / UNEXERCISED / NOT_RUN / INVALID_RUN；无需实际运行教材来评判指南中的演示设计，但必须检查操作、变化、结果、反馈、恢复和判准边界。任何组不完整都阻断 PR2 解除 draft 与合并。

失败由代理修复后重测，原始记录保留。阶段 2 首次合并前仍为初始 0.1.0；已合并运行资源被修正时按 SPEC §7 推进补丁、重新安装并复验六组阻断项。状态回放与真实 forward 另表保存。

### §2.4 PR3 expanded and client acceptance

完成 SPEC §5 的 E1–E18。两个目标客户端分别记录安装、显式入口、选择等待、明确确认和聊天指南交付。Codex CLI、Codex 应用 UI 和 ChatGPT 桌面分别说明执行对象；CLI 证据不能替代应用窗口或 ChatGPT 桌面交互。

原生空返回、超时、关闭/消失只以真实工具/UI 事件判定；文字“我还没答”仍属于文字等待。缺少可用控制能力或身份时写明具体缺口、已完成项目和最小必要参与，不要求 Owner 执行例行构建或复制命令，不把旧插件截图补成新证据。

### §2.5 Merge and closure

每个 PR 查询实际 CI、当前 head 的非作者批准和审查线程；不 bypass，不用多代理意见代替 GitHub 批准。三个主 PR 顺序合并后核对实际 merge SHA、版本和已测运行资源；按差异复验。

阶段 1、2 的子 Issue 只在各自 merge 复验完成后显式关闭。扩展、双客户端或最终 merge 证据缺失时 #220 和 #217 保持开放。只改评审资料/记录时运行版本保持并证明哈希未变；新增运行修改则推进本插件补丁并重新安装。无 Release、发布标签或 main 发布 PR。

## §3 PR1 initial verification snapshot

| 层次 / 集合 | 状态 | 当前证据 / 缺口 |
| --- | --- | --- |
| 起点仓库文件和版本读取 | OBSERVED | §1 所列本地 SHA、市场及三 manifest 直接读取；不是新插件验收 PASS |
| PR1 新增治理回归、版本工具负例 | PASS（工作树） | 252/252 测试、零跳过，严格校验和 0.147.0 基线通过；缺 manifest 的 dry-run / apply 均返回 1、零写入；完整 committed canonical 尚待记录 |
| 新插件完整 canonical 严格安装 | NOT_RUN | 阶段 2 完整包、已选图标与原子登记尚待实现 |
| 原四场景回归 | PASS（工作树） | 本任务实际重新安装 1/2/3/4 个公开技能，consumer 开发技能 0 / 仓库 20；见 §6 工作树证据，不等于新插件安装 |
| 新三场景安装 | NOT_RUN | 新插件尚未登记，不能用原集合安装通过推定 |
| 原集合本次安装缓存 Python 图表校验 | PASS（工作树） | 三个含 Diagram 场景实际扫描 1 张图，FAIL 0 / WARN 0；新插件及最终 canonical/merge 批次另记 |
| B1 未确认 / 修改确认 | NOT_RUN | 尚无真实 session UUID 和逐轮输出 |
| B2 语义、来源、关系 | NOT_RUN | 尚无真实连续合成样本 |
| B3 冲突 / 信息不足 | NOT_RUN | 尚无真实连续合成样本 |
| B4 完整 / 缺失规则模拟 | NOT_RUN | 尚无真实连续合成样本 |
| B5 可靠 / 不可靠教学判准 | NOT_RUN | 尚无真实连续合成样本 |
| B6 文本只读 / 首版范围 | NOT_RUN | 尚无真实连续合成样本及工具事件 |
| E1–E15 扩展行为 | NOT_RUN | 每个变体后续独立登记，不用六组通过外推 |
| E16 Codex 本地技能交互 | NOT_RUN | 尚无本插件实际安装、入口和连续交互证据 |
| E17 ChatGPT 桌面技能交互 | NOT_RUN | 尚无本插件实际安装、显式入口和连续交互证据；可操作性待实际核对 |
| E18 最终版本 / merge 复验 | NOT_RUN | 阶段尚未合并，无实际 merge 复验身份 |
| 现实场景理解改善 | NOT_MEASURED | 2026-10-12 Owner 决定此次不开展，现实场景另测；不阻断 develop 接入 |
| 现实场景认知负荷 | NOT_MEASURED | 同上；工程和合成行为不提供该效果结论 |
| 长期掌握效果 | NOT_MEASURED | 同上；不得生成能力评分或长期掌握推断 |

### §3.1 Identity and evidence entries to append

每批结果追加完整源 canonical SHA/tree、评审镜像 SHA/tree 或目录清单与排除项、安装来源/cache locator/版本及逐文件哈希对应。不得填虚构 session UUID、客户端版本或 merge SHA；没有被接口暴露的字段写 unknown 及原因。

逐变体结果至少含：ID、执行层次、fresh/resume/STATE_REPLAY、真实 UUID、输入输出定位、模型客户端、材料/cache 哈希、工具事件、逐判准结果、局限及失败恢复。原始失败、未覆盖、无效批次、回放和修正后真实调用分开追加，不能重写原 FAIL 或把 replay 计成 forward PASS。

纯文档后续批次复用行为时附运行资源清单比对，证明源候选/镜像/缓存字节对应；完整仓库包含评审文件，不能要求它与排除评审文件的镜像 tree 相等。最终 merge 的完整 canonical 安装与运行哈希另外登记。

## §4 Recovery and rollback

测试失败先定位来源/安装/模型行为/宿主限制，修复授权范围内缺陷，再重跑受影响项。清理只针对已确认的本次中性临时路径，保留日志和材料哈希，不更改用户日常插件配置或研究项目。

需要撤销已合并功能时，通过新的 develop PR 原子撤销完整插件包、市场登记及对应严格 runtime 合同。保留 ADR、验收、失败和后续回退事实；其他插件资源与版本按实际范围保留。该流程不授权 Release 或 main 发布变更。

## §5 Change history

| Version | Date | last-verified | Summary |
| --- | --- | --- | --- |
| v1.0 | 2026-10-12 | null | 初始化真实起点和三阶段流程；所有新插件工程/安装/行为/客户端/merge 项为未执行；现实效果按 Owner 决定暂不测量。 |
| v1.1 | 2026-10-12 | null | PR2 保存工程、真实调用缺陷与修正、六组指定行为和独立评审原始证据；原生客户端及扩展仍未完成。 |
| v1.2 | 2026-10-12 | null | 记录 PR2 实际 merge 和 PR3 扩展进展，区分历史快照、缺失批准与当前客户端操作限制；运行版本保持 0.1.0。 |
| v1.3 | 2026-10-12 | null | 保存 0.1.0 受众扩展实际状态反馈冲突与首次 0.1.1 修正候选；新安装、受影响扩展及六组复验另行记录。 |
| v1.4 | 2026-10-12 | null | 保存 0.1.1 新缓存上的 B4.2 组合条件 FAIL 和 0.1.2 局部判定修正候选；旧失败/容量错误与新复验分别登记。 |

## §6 PR1 engineering execution (2026-10-12)

阶段分支为 codex/html-guide-contract，起点 origin/develop `b2e5a74109f47ecee7471ba741fb4c1348457f3b`；完整远端 SHA 于实施前重新获取。Epic #217、子 Issue #218/#219/#220 已创建并通过 GitHub 原生 sub-issues 关联。过程计划和 Owner 现实效果另测决定均保存。研究项目按 AGENTS → PROJECT → STATE → SOURCES 只读恢复，读取实际 HTML 案例；通过 read_thread 实际取得最新修订 Sites 指南，仅作设计材料，不采用固定七章、具体制作步骤或个人路径为运行合同。研究项目及 main/develop 工作区保持。

工作树执行结果见 [工程检查与逐资源对应](evidence/html-guide-kit/pr1-engineering-checks.json)、[完整隔离安装输出](evidence/html-guide-kit/pr1-working-install.json)、[测试原始日志](evidence/html-guide-kit/pr1-npm-test.log)、[缺失 manifest 真实负例](evidence/html-guide-kit/pr1-missing-manifest.json)。npm test 强制 Python/PowerShell，252/252 PASS、0 skip；validate ok=true，基线检查确认实际 Codex 0.147.0。npm run check / smoke 兼容入口已实际执行，参数透传保留。

四组原安装分别为 Diagram、Explain、Diagram+Explain、原三插件全装；原生公开技能为 1/2/3/4，普通提示全装为 3，consumer 0 项开发技能、仓库 20。安装源、复制出的市场镜像、缓存中的 manifest/技能/UI/参考/图标/校验器逐文件 SHA-256 全部对应。三个含 Diagram 场景都实际执行缓存 Python，扫描 1 张图、FAIL 0 / WARN 0；Explain 单装无 Diagram 不执行图表校验。工作树测试没有 canonical SHA，不能写成严格 canonical 候选已验收；提交后的完整 canonical 验证另行登记。

版本工具虽接受 html-guide-kit scope，本仓库真实 manifest 不存在；dry-run 与 apply 都返回 1、报告 NOTHING was written，没有创建插件目录。临时 fixture 验证独立 0.1.0→0.1.1、其他版本/历史保持、身份/版本不匹配及写入/校验失败回滚。生成钩子、Shell 与 PowerShell 验证器实际接受新增及全部旧 scope，并拒绝未知 scope、chore 与缺空格；测试未写真实仓库 hooks 或远端。

保留阶段内失败：文档尚未落地时 validate 出现四项 SPEC 缺链；同期图标测试 9/10。SPEC 落地后重新 validate 通过，最终完整测试 252/252 通过；没有降低校验或将旧失败追认 PASS。第一轮图标未获选，Owner 要求结合 HTML 与教学后生成第二轮，历史保留，候选选择及正式接入分别记录。未来运行资源在仓库外独立暂存区完成，静态检查与独立代理审查无实质问题，但没有正式登记、安装或真实模型行为证据。

当前无阶段 merge、无新插件连续会话 UUID、无新插件双客户端证据；PR1 合并须等待实际 CI、当前 head 非作者批准及线程门禁。全部阶段子 Issue 和 Epic 保持开放，现实效果 NOT_MEASURED。

### §6.1 Committed canonical candidate

完整 canonical `803dba917218af3bf4072f05459e80eb4b4a2fcd`、tree `e1681aac4fbec8ddd620a78147b61c33282bba40` 已通过相同严格校验和四种实际隔离安装；结果见 [canonical 安装原始输出](evidence/html-guide-kit/pr1-canonical-install.json)。所有场景为 Codex CLI 0.147.0，原生公开技能 1/2/3/4、仓库外 0 / 仓库内 20 个开发技能；三个含 Diagram 场景缓存 Python 实际扫描 1、FAIL 0 / WARN 0。验证调用只使用既有 canonical 安装函数，没有运行发布状态机、创建 Release 或标签。

后续仅记录此结果的文档提交以 PR 正文保存最终 head、差异与运行身份对应；运行资源不变时可以复用上述行为与安装证据。新插件仍未登记，新的模型行为、客户端及实际 merge 验收为 NOT_RUN，不能以本节通过替代。

### §6.2 Round-2 icon selection

Owner 明确回复“A：HTML 教材（推荐）— 开放书页＋尖括号”。选择对象为第二轮 revision-2/a.svg 与 a.png，准确字节与会话依据见 [选择记录](../../assets/brand/html-guide-kit/candidates/revision-2/selection.json)。已在仓库外的 PR2 包暂存区导出 1024 PNG；SVG 仅把候选标题替换为正式标题，几何不变，导出 PNG SHA-256 与所选候选完全一致。第一轮和第二轮未选 B/C 保留。

本步骤不提前登记新插件，不修改现有插件或版本；正式包、图标、登记与严格合同将在 PR1 实际合并后的 PR2 原子接入。PR1 当前 GitHub 仍缺非作者批准，双客户端与模型行为状态保持 NOT_RUN，现实效果 NOT_MEASURED。


### §6.3 Develop governance synchronization

2026-10-12 重新获取 origin/develop，#216 已合入，目标为 `f64fc957b9fa595ac483724e2f60c1314b276574`。#221 原 head `1965fb54fe0d0204eb9f070e97c5f6b8b2782fd0` 在 CHANGELOG 的 Added 区与 INDEX 的当前事项区出现冲突。采用普通 merge，逐块同时保留 HTML Guide Kit 与 Learning Evidence Kit 的合同/索引条目；AGENTS 的两项实施授权各自限定作用域，未将另一 Epic 的发布授权扩展到本任务。INDEX 合并修订至 v2.14。

保留 #216 的三份专属契约/验收文档及回执原字节。HTML Guide Kit 的 A 图标选择和集中授权保持，运行包、登记及市场/插件版本均未变；没有空包或发布动作。同步后的工程检查、最新 head 与 GitHub 门禁由 PR 正文追加实际结果，不沿用旧 head 的 CI/批准状态。


同步工作树重新执行 npm test 252/252、0 skip，validate、Codex 0.147.0 基线和四组 smoke 全部通过；三个含 Diagram 场景缓存 Python 均扫描 1、FAIL 0 / WARN 0。43 项运行资源 SHA-256 与最初工程证据一致，四项 incoming 专属文件的 staged Git blob 与 origin/develop 完全一致，见 [同步检查](evidence/html-guide-kit/pr1-develop-sync-checks.json) 和 [本轮测试日志](evidence/html-guide-kit/pr1-sync-npm-test.log)。

同步 merge `6d40991e56829c406d911b550de5c0bb9bf2195e`、tree `37e0b24ec3559ce3aeaac2f19467363f42a90e9e` 的完整 canonical 严格校验和四种安装已通过，三个含 Diagram 场景实际缓存 Python 扫描 1、FAIL 0 / WARN 0；原始结果见 [同步后 canonical 安装](evidence/html-guide-kit/pr1-sync-canonical-install.json)。后续只保存此回执的文档提交不改变运行内容；最终 head 和字节等价关系由 PR 正文记录。独立只读双轴审查未见实质冲突，不能替代 GitHub 批准。

## §7 PR1 actual merge and PR2 start

#221于2026-10-12合入develop，实际merge `70267a5b91d759af09a8f1281a33e2d5a90fdbc9` 与已测head `385e6919c44cc280266f9fe8c7105f379d45872f` 的tree同为 `767ec5082451014eb224b6727b5955e6f56574a2`。合并后四组完整canonical严格安装及三个含Diagram场景的实际缓存Python复验通过，见 [原始结果](evidence/html-guide-kit/pr1-post-merge-install.json)。#218已显式关闭；GitHub reviews API未提供独立批准记录，保存历史缺口而不追认PASS。Owner要求继续后续工程。

PR2从实际最新origin/develop `70267a5` 派生，分支codex/html-guide-package。完整0.1.0包、两参考、显式策略和所选第二轮A在同一PR与登记/严格校验接入；marketplace8.1.2与原三插件版本保持。模型行为六组、评审镜像与源/缓存hash仍待实际批次，当前不可据结构通过宣称行为PASS。现实效果NOT_MEASURED，双客户端扩展和最终merge仍留PR3。

## §8 PR2 engineering candidate

候选基于实际 origin/develop 70267a5，完整 HTML Guide Kit 0.1.0 包、已选图标及市场/校验合同在本 PR 原子加入。marketplace VERSION 8.1.2、Diagram 0.3.1、Understanding 0.1.2、Explain 0.1.1 保持，既有包没有文件改动。A 图标 PNG 与候选哈希相同，正式 SVG 只修改标题；限定新包 LF 规则保留 raw bytes。

- [全测试](evidence/html-guide-kit/pr2-full-tests.log)：277/277 PASS、0 skip，REQUIRE_PWSH/REQUIRE_PYTHON=1。
- [结构](evidence/html-guide-kit/pr2-validate.log)与[CLI基线](evidence/html-guide-kit/pr2-check.log)：PASS，Codex CLI0.147.0，四插件/五公开技能/20仓库技能。
- [工作候选安装](evidence/html-guide-kit/pr2-working-install.json)：七种场景全部通过；自然启用1/2/3/3/0/2/3，原生公开1/2/3/4/1/3/5。四个含Diagram场景实际运行各自安装缓存Python，均扫描1、FAIL0、WARN0。manifest/icon/SKILL/native config/mandatory references的source/cache字节与SHA-256逐项对应。canonical提交验证仍需独立保存。
- 专项测试的[首轮失败](evidence/html-guide-kit/pr2-tests-first-run.json)与[修正重跑](evidence/html-guide-kit/pr2-tests-corrected-run.log)分别保留：首轮2项是测试模块import及fixture换行配置错误；修正后73/73、0 skip。未将首轮追认PASS。

六组真实连续模型行为仍 NOT_RUN；当前 draft 不解除。双客户端及完整扩展属于PR3待完成；现实效果NOT_MEASURED。安装通过不替代真实模型读取或客户端显示。

## §9 First canonical and actual invocation finding

完整canonical `4992d751d3a9e66a22c95a95ff08a351e75331a4` 的[七安装](evidence/html-guide-kit/pr2-canonical-install-4992d75.json)通过，四次实际缓存Python扫描1/FAIL0/WARN0。相同源运行七文件与独立中性mirror和HTML安装cache逐字节对应。镜像排除了reviewer-only文档、root上下文、tests/evals/证据/控制，目录清单与源tree分开，不宣称两树相同。

首次B1.1真实调用UUID `01a12f95-a121-7941-84aa-4d8ee0ae319c` 返回INVALID_RUN：默认桌面配置模型gpt-6.1-sol被CLI0.147.0/当前ChatGPT身份明确拒绝，没有模型指南输出、材料或技能读取事件；[准确输入输出与错误](evidence/html-guide-kit/pr2-first-model-invalid.json)保留。不能作为等待确认或任何行为PASS。stderr同时发现HTML interface.defaultPrompt超过128字符，被客户端忽略；这是真实分发缺陷，需修正、重新安装并建立新canonical批次。首版未合并，仍0.1.0。认证不写入证据，原用户配置不修改。

客户端启动后会从已登录账号云端发现其它curated插件，不能把prepare阶段的单独HTML安装命令表述为模型实际技能集合只有HTML；实际环境需再次核对并记录。六组仍未通过，draft保持。

示例提示修正候选 `1cd0f1c2a9395fd192260d06778e8489182516a8` 将唯一guide listing缩为123字符，保留新建及确认等待；严格HTML合同拒绝任意超过128的示例，不放宽校验。受影响[37测试](evidence/html-guide-kit/pr2-default-prompt-tests.log)与[修正后结构](evidence/html-guide-kit/pr2-default-prompt-validate-corrected.log)通过；[前置shell shim失败](evidence/html-guide-kit/pr2-default-prompt-validate.log)也保留，没有追认。修正后完整候选与真实模型重新安装验证另记。

修正后[完整测试](evidence/html-guide-kit/pr2-post-prompt-full-tests.log)279/279 PASS、0skip；[新canonical七安装](evidence/html-guide-kit/pr2-canonical-install-1cd0f1c.json)通过，四次实际缓存Python也通过。旧候选安装通过保持其原身份，不能覆盖真实CLI示例忽略的失败或被测模型未运行的缺口。

## §10 PR2 current blocking behavior outcome

[汇总](evidence/html-guide-kit/pr2-behavior-summary.json)记录指定14个fresh变体、30轮连续会话在canonical `1cd0f1c2a9395fd192260d06778e8489182516a8`、HTML Guide Kit0.1.0上逐项独立PASS，六组B1–B6全部通过。三个subset分别独立随机HOME/consumer/mirror/cache，避免共享批次并发覆盖；每组保存真实UUID、输入输出、工具事件、raw源/mirror/cache hash、准确CLI/模型身份和逐项评审。实际为CLI0.147.0/openai/gpt-5.6-sol/low，选型依据该baseline当前身份model/list的实际默认值；用户原6.1-sol/xhigh配置未改。originator字段Codex Desktop不代表桌面UI验收。

指定成功矩阵之外另保留一次原输入修订fresh重试，传输完成的模型会话共15 UUID/31轮（其中旧修订首attempt仍UNKNOWN，不称15个PASS会话）；最初不支持模型的UUID另为INVALID_RUN，共执行16 UUID/32输入轮次。旧修订首attempt保持UNKNOWN，不据新尝试追认其PASS；被拒读取、后台第三方缓存长路径及采样重试均保留。

安装缓存SKILL的真实读取可由成功工具返回或客户端native附入证明。比较范围拒绝的session line11含准确cache locator和完整SKILL正文，与canonical/mirror/cache字节对应，原stdin不含正文，发生在模型回复前；这是native_skill_attachment，不是模型自述或shell读取。工具列表为空仍保存。范围请求在正常新建流程前被明确拒绝时，未读取的两参考为NOT_APPLICABLE而不是已读；新建/生成cases两参考均有完整真实读取。该适用性解释遵循SPEC§2.1“按运行要求读取”及SKILL阶段，控制程序前后hash和依据保留，冻结SPEC/输入/运行资源不改。

B5.2有非阻断来源措辞note：读者/任务两项额外检查轴实际未在原文给出，但统括句将扩展检查轴都称为材料明确指出。独立评审按冻结B5.2判准通过，因为没有编造效果、唯一优劣或能力分数；该note完整保留，PR3针对原材料与设计判断归属进一步验证。

六组通过仅覆盖本批有限CLI合成行为。E1–E18完整扩展、Codex应用UI、ChatGPT桌面与宿主窗口事件仍未通过；现实效果NOT_MEASURED。#226可在当前工程证据及CI核验后准备独立GitHub审查；合并仍必须当前head非作者批准、required checks、最新base与resolved threads，不使用bypass。实际merge及复验前#219保持开放，#220和Epic#217亦开放。

完整原始证据的正式入口为[最终 lossless 索引](evidence/html-guide-kit/pr2-reviewer/final/index.json)，247原文件/7,057,848原字节封装为10 packets。每entry保留原绝对路径、相对映射、确切UTF8内容与SHA-256，复原逐字节校验及独立.NET复查通过；JSON格式避免改写原始输出的Markdown空白或JSONL换行。index提供所有评审绝对路径及JSONL行号到封存内容的映射，跨机复验需恢复新外部reviewer，而不是假定旧临时cache仍存在。controller/freeze/plan pin、实际models/list/skills/list诊断、前后控制解释、全部model输入输出/工具/stderr/会话快照/原评审及适配均封存。没有复制auth、临时home或原用户会话。早期243文件工程封装留为历史快照；当前验收仅引用final/index。

## §11 PR2 actual merge and PR3 execution

PR2 #226 于 2026-10-12T11:25:49Z 由 ranzuozhou 合入 develop，实际 merge `d106e76651d53cdf3f0cef2bb33ce47e8d7fda38`；与最终 head `72cdd08ed8d5a6665e2cedd5f3f2ed5c6dd06ab8` 的完整 Git tree 同为 `238d428b740d66069705a6208c17619cf97e338d`。GitHub reviews API 实际为空、reviewThreads 为空；缺失独立批准记录不能由合并事实追认 PASS。工程代理本轮仅查询合并事实，没有执行 bypass。后续 PR 继续核对当前 head 的非作者批准、CI、审查线程和最新 base。

PR3 从该实际最新 origin/develop 派生 `codex/html-guide-acceptance` 独立 worktree，用户 main/develop 与只读研究项目保持。三个 canonical Git 对象 plugins/ 下的 62 个跟踪文件（含 14 个 evals/评审文件）Git blob 原始字节相同：实际 merge、PR2 最终 head、已测行为候选 `1cd0f1c2a9395fd192260d06778e8489182516a8`。Windows checkout 的旧包可能有 CRLF 转换；这不是 checkout 全目录或剔除评审文件后镜像的等树声明。HTML 七项运行资源另有 source/mirror/cache raw SHA 对应。该对应只允许复用已有行为覆盖，不把 PR3 未执行项目推定通过。运行包保持 0.1.0，marketplace 仍未发布 8.1.2，其余插件版本保持；无新 Release、发布标签或 main 发布 PR。

合并后强制 REQUIRE_PYTHON/PWSH=1 的[工程汇总](evidence/html-guide-kit/pr3-post-merge/20261012-d106e766-engineering/checks-summary.json)记录 npm test 279/279 PASS、0 skip，validate/check PASS。第一轮 canonical 的新 detach 检出目录没有 node_modules，npm smoke 因 cross-spawn 缺失返回 1；[原始失败](evidence/html-guide-kit/pr3-post-merge/20261012-d106e766-engineering/canonical-failure.json)及 stdout/stderr 保留，不能按后续结果重写。新批次按 lock 在精确 canonical 检出目录 npm ci --ignore-scripts 后重新执行 npm run smoke，[完整原始安装结果](evidence/html-guide-kit/pr3-post-merge/20261012-d106e766-canonical-ready/canonical-installation.json)与[逐场景汇总](evidence/html-guide-kit/pr3-post-merge/20261012-d106e766-canonical-ready/canonical-summary.json)为 PASS：七场景、原生技能 1/2/3/4/1/3/5、自然启用 1/2/3/3/0/2/3，consumer 开发技能 0 / repo 20。四个含 Diagram 场景实际调用各自缓存 Python，均扫描 1、FAIL 0 / WARN 0；manifest、必需参考、调用策略、图标与源/cache raw bytes 严格对应。

[全 62 文件 Git blob 清单](evidence/html-guide-kit/pr3-post-merge/20261012-d106e766-engineering/plugin-distribution-inventory.json)证明三个 canonical plugins/ 对象字节一致；[行为运行资源对应](evidence/html-guide-kit/pr3-post-merge/20261012-d106e766-canonical-ready/behavior-runtime-correspondence.json)逐项保存三种本轮 HTML 安装与三批旧行为缓存之间七资源的 63 条对应。[远端事实](evidence/html-guide-kit/pr3-post-merge/20261012-d106e766-engineering/facts-summary.json)保存 main 8.1.1、最新 Release v8.1.1、无 v8.1.2 发布及 reviews 空记录；初 facts 读取不存在的顶层 capabilities 为 null，[准确 manifest 合同补记](evidence/html-guide-kit/pr3-post-merge/20261012-d106e766-engineering/manifest-contract-addendum.json)从 extensions.com.openai.interface.capabilities 保存实际 Read，不覆盖原始观察。完整证据与每项原 size/SHA 见[108 文件索引](evidence/html-guide-kit/pr3-post-merge/d106e766-final-verification-index.json)。此阶段工程与 merge 复验完成后显式关闭 #219，历史独立批准缺项不据此追认。#220 和 Epic 的最终条件继续保留。

本轮先复验 PR2 实际 merge 的工程与完整 canonical 安装，再逐项执行冻结 SPEC v1.0 的 E1–E15 可运行扩展。每个变体分别保留实际连续会话 UUID、输入输出、工具事件、源/镜像/cache 哈希与独立评审；仅准备输入或控制脚本不记 PASS。旧 B5.2 来源归因 note 在新扩展中复核，原先有限判准的结果及具体措辞均保留。原生客户端与最终 PR3 merge 尚未完成，#220 和 #217 保持开放。

2026-10-12 实际调用 `cua.getState()` 返回原生 apps 空集合，只提供 Edge、Codex In-app Browser 与 Codex MCP Apps 浏览器；本会话工具配置明确禁用 native computer APIs，见[准确能力观察](evidence/html-guide-kit/pr3-post-merge/host-capability-observation.json)。浏览器界面不能作为 Codex 应用 UI 或 ChatGPT 桌面的新插件证据。E10 原生无答案返回、E11 超时/关闭/消失、E16 Codex 应用 UI 与 E17 ChatGPT 桌面均为 NOT_RUN，没有合成对应工具事件，也没有以 CLI、旧插件截图或模型自述填补。所缺条件为两个真实应用的可用原生操作能力或本插件真实客户端过程证据；无需 Owner 复制构建命令。其余工程与模型扩展继续执行。

## §12 Expanded failure and first runtime correction

0.1.0 的 E1-staff 真实连续 session UUID `01a12ff7-e7ef-7b20-bce1-449a2976bbbe` 在第二轮指南中产生内部冲突：输出第 154 行将“已核验以外状态尝试归还”写为不可归还，包含原材料 §5 明确允许归还的“已领取”状态；第 36、56、148–150 行又写出正确条件。另一处正确描述不能抵消错误反馈，独立评审记 FAIL，原始输入、输出、工具事件及两侧证据保留。其余固定 0.1.0 独立变体继续执行，以发现更多实际问题；该旧 FAIL 不被新调用覆盖。

0.1.0 的 E9-recommended session UUID `01a12ffe-ba74-7d01-8748-e4f6fbd46494` 第二轮第 108 行把当前状态不是“未核验”写成“核验不可用、库存不变”，来源标为 §3；§3 仅描述未核验状态下的处理，没有规定其他状态的处理。明确推荐确认语义本身正确，但来源边界违例使整体变体 FAIL。该失败促使同一首个 0.1.1 修正候选另明确“原文禁止”与“原文未说明”的区别，局部正面规则不足以推导禁止、相反结果或不变值。旧错误和实际改进调用分别保留。

本插件首次修改已合并运行内容，先 dry-run 核对唯一根 manifest 目标，再实际推进 0.1.0→0.1.1；marketplace 和其他插件版本保持。修正 SKILL 与两参考，以通用方法逐操作核对源前置状态、必要条件、允许与不可用范围以及正文/演示/反馈/自检之间的一致性，另强化新增检查轴与原材料归因边界，不搬入验收材料的领域规则或评审答案。版本、包文档同步，不改变显式调用、Read、首版范围、图标或确认等待边界。

修正后须形成新 committed canonical、严格隔离安装，并重测受影响扩展及六组 PR2 全部指定变体。当前只记录已观察失败和修正实现，不将静态检查、修正意图或旧版本 PASS 写成 0.1.1 行为 PASS；原生客户端与最终 merge 条件仍未完成。

0.1.1 完整 canonical `62b4af8ecd443fe98484d8ac0fd9b7ca78e5d005` / tree `7f7632cb62b16f4fd32e7f279a2e1eb7772d7995` 的[严格安装](evidence/html-guide-kit/pr3-post-merge/engineering-62b4af8e/installation.json)与[汇总](evidence/html-guide-kit/pr3-post-merge/engineering-62b4af8e/summary.json)通过，七场景、四次实际 cache Python 均 PASS。修正工作候选[初轮全测试](evidence/html-guide-kit/pr3-post-merge/patch-checks/npm-test.log)四项失败为 CHANGELOG 未在正文注明自身版本、两个固定 0.1.0/0.1.1 版本预期与缓存负例撞到新正确版本；修改正文和负例、不放宽验证后，[受影响 57 项](evidence/html-guide-kit/pr3-post-merge/patch-checks/affected-corrected.log)、[全 279 项](evidence/html-guide-kit/pr3-post-merge/patch-checks/npm-test-corrected.log)均零 skip PASS，[基线](evidence/html-guide-kit/pr3-post-merge/patch-checks/npm-check.log)通过。当前 committed CI 同样通过，真实模型复验另记。

## §13 Partial-rule simulation correction

新 0.1.1 B4.2 原首次调用因模型服务 capacity 未完成，错误和 UUID 保留；一次相同输入 fresh retry 的 session UUID `01a13019-b6ca-7011-93eb-5ef936004d23` / attempt `8a8a4930-883f-41a0-860a-e920b97e83d3` 完成两轮，但第二轮第 75–76 行将“任意状态＋未知”统判信息不足，第 105–111 行又同时写任一明确不成立则不符合、任一未知则信息不足，分支重叠且无优先关系。原材料的合取必要条件允许在一项明确不满足时局部判定组合不满足；另一项未知不能撤销此结论。独立评审 FAIL；未知库存、取消与归还边界各自正确不抵消组合错误，旧 capacity 错误也不当作语义失败。

按后续补丁规则 dry-run 后推进 HTML Guide Kit 0.1.1→0.1.2。通用方法先区分已满足、明确不满足与信息未知，再依据原文“且／或”组合；保留足以决定的局部结论，核对分支互斥或优先，不能把组合结果扩成未规定的操作或数值。没有搬入材料中的预约、导览等领域规则或评审答案，其他插件及市场版本保持。

0.1.2 候选必须新 canonical 安装、受影响扩展与六组指定行为复验。0.1.0 和 0.1.1 的实际失败、未知、未执行、容量中断及显式 fresh retry 分别保留；不以工程 PASS 或前一版本的局部 PASS 追认新版本行为。原生客户端与最终 merge 仍待完整条件。

## §14 Historical sealing and 0.1.2 engineering verification

2026-10-13 从实际旧批次和独立评审形成[历史账本](evidence/html-guide-kit/pr3-post-merge/history-ledger.json)。0.1.0 扩展执行 17 fresh UUID / 37 轮：13 PASS、3 FAIL、1 UNEXERCISED；原先准备但未调用的批次另列，未覆盖不当通过。0.1.1 执行 29 个指定 fresh 变体 / 63 个完整轮次：28 PASS、B4.2 FAIL；另有 4 次模型服务中断，各自 UUID 与输入保留，故总计 33 UUID / 67 输入轮次，不能表述为 33 个通过会话。0.1.1 扩展中的其余 14 个变体未调用。E13 旧全中文材料没有实际触发双语路径，新 E13-bilingual 为独立真实调用，不能追认旧 UNEXERCISED。

[历史 lossless 索引](evidence/html-guide-kit/pr3-reviewer/history/index.json)封存 788 个原文件 / 25,528,480 原字节、18 packets，含冻结 SPEC、控制前后哈希、原材料、实际输入输出、JSONL 工具及 session、准确 UUID/身份、源/镜像/cache 对应和原始评审。每条原绝对定位映射到 packet entry；复原保持原始行号。Node 对原文件及复原字节的逐项校验和[独立 .NET 复原](evidence/html-guide-kit/pr3-post-merge/history-dotnet-verification.json)均通过。仅选择外部 reviewer 内的控制/证据目录，不跟随 TEMP/HOME/auth/cache 或原用户 session 定位；秘密模式扫描零发现。镜像排除 reviewer-only，不宣称其与完整 canonical tree 相同。

评审导入首轮因操作脚本误用参数退出 1，原日志与修正后的导入日志分别封存。导入不修改模型输入、输出、冻结判准或运行资源。E5 缺材料和 E12 确认前停止时，交互参考未到适用阶段；只允许独立引用依据的 NOT_APPLICABLE，正常流程仍须实际读取 SKILL/framework，已确认并交付指南仍须实际读取两参考。该 grade-only 适配不能安装或调用模型。原错误参数、条件读取旧拒绝及实际工具拒绝没有变成 PASS。

.NET 校验器首轮将零字节文件经 PowerShell 管道解包成 null 而失败，[准确观察](evidence/html-guide-kit/pr3-post-merge/history-dotnet-first-failure.json)保留；按类型直接保存空数组后重跑通过，packet 与原证据字节未改。[校验器](evidence/html-guide-kit/pr3-post-merge/history-dotnet-verifier.ps1)可对索引重复复原。

0.1.2 canonical `59c7aea91e51997a74870c730c260a4667b6470c` / tree `1bb4b82807a4029a9e8c46a5a9ca4f104702e96e` 的[完整严格安装](evidence/html-guide-kit/pr3-post-merge/engineering-59c7aea9/installation.json)和[汇总](evidence/html-guide-kit/pr3-post-merge/engineering-59c7aea9/summary.json)通过：七场景、四次实际缓存 Python，四插件/五公开技能/三个自然启用技能、consumer 开发技能 0 / repository 20。精确 detach、lock 依赖准备和源/cache 字节校验与身份见[原始文件索引](evidence/html-guide-kit/pr3-post-merge/engineering-59c7aea9/archive-index.json)。[工作候选测试](evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-2/npm-test.log)279/279、零 skip，validate/check 通过；该 head GitHub CI 当前全部通过。

新 0.1.2 六组 14 fresh / 30 轮、扩展 29 fresh / 59 轮分别用新中性 HOME/mirror/cache 实际执行，尚未形成完整通过结论。另准备 E7 确认后收到材料更新与 E12 停止后重新启动的 2 fresh / 9 连续轮次，补充原判准未执行分支，不改旧冻结输入或结果。原生客户端/E10/E11 与最终 merge 条件继续保留；现实效果 NOT_MEASURED。

## §15 Direct-operation and semantic correction

0.1.2 六组完成全部 14 指定 fresh / 30 连续轮次，独立结果 13 PASS、B4.1 FAIL。B4.2 的“明确否＋未知”与互斥分支已实际修复，不能抵消另一完整模拟中的错误。B4.1 session UUID `01a132eb-d8bb-7421-966b-0fe59c9f5aa9` / attempt `7a236861-60c3-413d-8f3a-e7d8070a35b9` 第二轮第 65、170 行正确写已归还不可领取，但第 207、323–324 行将已归还后的“再次核验或再次领取”统称未规定，不允许判允许或禁止。源 §4 已明确其他当前状态不可领取；未知的是再次核验及后续路径，原输出没有把未知限定到该路径。这是内部和来源冲突，独立 FAIL 保留。

0.1.2 E13 UUID `01a132f5-19a2-7fa3-88c4-a2d9ed111f0a` / attempt `3d850405-18ad-42a9-905f-49130c01268d` 与 E13-bilingual UUID `01a132f7-a70c-7ad2-a88c-bf42ac670373` / attempt `1c79c9fc-75aa-4648-b67f-28d5d4c76f25` 的第二轮第 29/28 行源规则表加入“仅在未核验状态操作”，§3 只给该状态下的处理而未排他禁止其他状态。bilingual 第 135 行还把原文 Inventory（库存）改为 Inventory（库存充足），由原变量变成派生真假条件；第 16 行的正确对照不能抵消它。分别独立 FAIL；原版未触发源材料双语路径另保留 UNEXERCISED 维度，不把新双语调用或其他格式正确追认旧结果。

发现上述问题后暂停新扩展调度。A 分区暂停外层进程时也中断了已启动的 E2 第二轮：UUID `01a132fb-de07-7a01-9c16-2ac00e0da8e0` 第一轮 COMPLETE，第二轮只有 partial/thread.started、原 batch RUNNING 保留，原因叠加为 OPERATOR_INTERRUPTED_OR_INCOMPLETE。这不是模型语义 FAIL 或 COMPLETE；不会据部分输出补写 PASS。后续纯操作 runner 改为变体边界读取 pause 标志并正常返回，不杀外层或模型子进程。B 分区已完成的 E14-html 保留完整两轮，其余未执行；补充 E12-restart 仅首轮完成后未继续，不是已测重启。所有旧记录待封存时保留准确实际计数和独立评审。

dry-run 后只将 HTML Guide Kit 推进 0.1.2→0.1.3，市场和其他插件版本不动。通用方法固定当前状态和单个操作，分开直接操作与多步路径；未知路径不覆盖源规则确定的直接禁止。检查全文排他量词和术语值类型，原变量与派生真假判断分别命名，不能由表头或压缩句新增原文没有的“仅”。不搬入验收领域规则、答案或案例身份，不改变 Read、显式调用、确认等待、文本交付和已选图标。

0.1.3 工作候选完整测试 279/279、零 skip，尚待 committed canonical、严格新安装及全部六组/受影响扩展真实复验。0.1.2 的安装、有限 PASS、FAIL、操作中断及未执行分别保持其真实身份；不据修正意图或工程检查宣称 0.1.3 行为通过。原生客户端、最终 head/merge 门禁与现实效果状态保持。
