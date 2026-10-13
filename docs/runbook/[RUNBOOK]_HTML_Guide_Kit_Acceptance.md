---
type: runbook
scope: html-guide-kit
summary: "HTML Guide Kit staged execution ledger and unperformed acceptance gaps"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-13
state: draft
version: v1.16
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

## §16 Candidate 0.1.2 preservation and 0.1.3 canonical verification

已停止的 0.1.2 控制与模型证据封存于 [candidate012 索引](evidence/html-guide-kit/pr3-reviewer/candidate012/index.json)：506 原文件 / 15,860,027 原字节、10 packets，inventory SHA-256 为 `8f639798108f4f6bd969ddac554ded33ac4e62bedffe8d7b19580b911d1dacc8`。Node 原文件/复原逐字节校验与[独立 .NET 复原](evidence/html-guide-kit/pr3-post-merge/candidate012-dotnet-verification.json)均通过，秘密模式扫描零发现。选择范围仅为外部 reviewer 的已停止 0.1.2 子树与封存控制；不跟随真实 HOME、auth、TEMP/cache 或原用户 session 定位，不纳入仍在运行的 0.1.3。

[0.1.2 账本](evidence/html-guide-kit/pr3-post-merge/candidate012-ledger.json)保留实际 28 UUID / 61 输入轮次，23 PASS、3 FAIL、2 UNKNOWN；传输 60 COMPLETE 与 1 原始 RUNNING。后一轮的独立操作中断叠加原因见 §15，不改原传输记录。选定批次另有 17 变体未调用，不能推定 PASS。完整六组 13 PASS / 1 FAIL 与两条 E13 失败、旧 E2 中断、E12-restart 仅首轮分别保留；修正候选不覆盖旧版本结果。

0.1.3 canonical `ffaa68f8998d3d0344b760492dd7169c13bee0a5` / tree `d97ea04a46b804588bdcd98efb94171e628aa6f9` 的[完整严格安装](evidence/html-guide-kit/pr3-post-merge/engineering-ffaa68f8/installation.json)及[汇总](evidence/html-guide-kit/pr3-post-merge/engineering-ffaa68f8/summary.json)通过：保留原四场景并加入 HTML、HTML + Explain、全部四插件，共七场景；四个含 Diagram 场景实际缓存 Python 均 PASS。源/cache 资源字节、manifest、版本、图标、引用及调用策略均严格校验，consumer 开发技能 0 / repository 20。原始命令、detached head/tree、依赖准备和各资源身份见[24 文件索引](evidence/html-guide-kit/pr3-post-merge/engineering-ffaa68f8/archive-index.json)。评审镜像排除 reviewer-only，不宣称与完整 canonical tree 相等。

新模型六组、29 个扩展变体及两条连续流程补证正在该 canonical 的独立中性路径/cache 上执行；仅完整真实输出及独立语义评审允许 PASS。首个 B4.1 选择了较窄理解目标，未触发归还/取消等全分支，独立 UNEXERCISED 保留；另以同候选和冻结原输入新增完整目标会话补覆盖。E7 操作侧自动选择误取嵌套问题编号的原调用保留选择出处缺陷，新会话从实际更新目标标题人工选择；这不是运行语义 FAIL，也不能作为有效选择来源证明。未完成的独立评审、原生客户端与实际窗口事件、最终 PR head/merge 和 GitHub 当前提交非作者批准继续保留，不以工程通过代替。

## §17 Repeated-operation correction and control provenance

0.1.3 的 E13 真实 session UUID `01a1331c-6de9-7633-af64-ca8cb6a7c01f` / attempt `16a88680-7f07-44b0-a5bb-9b833abc7b4b` 第二轮第 142 行将预约已无效时再次取消整体列为“材料未规定”。源 §6 的领取前允许条件没有当前预约有效或只能取消一次的限制；当前未核验、预约无效且仍在领取前时，操作及预约/状态赋值、导览/库存不变仍由原规则确定。额外重复提示文案可能未规定，不能因此把已知字段结果改为未知。第 80、120 行的正确一般规则不抵消第 142 行的矛盾，[独立 FAIL](evidence/html-guide-kit/pr3-post-merge/candidate013-e13-failure.json)保留；实际顶层 A、原输入、工具回传与七资源字节核验均有效，这不是操作控制无效。原始评审字节的来源与 SHA 见[索引](evidence/html-guide-kit/pr3-post-merge/candidate013-e13-failure-index.json)，完整历史会话封存待其余独立评审完成。

自动操作选择器的回退匹配接受嵌套理解题编号，原 A/B/C 目标可能被记录为 `1`。精确审计保存原 selector SHA `72aec6c283b98efb8fd5de25245be59757f15f5ebf5e3a65c9b058bd602c29d1`、代码第 12–14、18 行与实际输出定位。八个旧 B/E 调用存在选择出处缺口，原语义记录保留，控制有效性另记 INVALID_RUN，不能计入有效验收 PASS，也不能当成运行语义 FAIL。后续操作只人工读取实际目标标题和三元组摘录；不修改冻结 harness、原输入或旧结果。

人工 B1/B2 四变体 11 轮与 E7 确认后材料更新、E12 停止后重启两变体 9 轮已独立 PASS。完整 B4.1 新两轮 PASS；旧窄目标与选择缺口仍保存。E7 原输入补证合法要求材料范围澄清、仅两轮完成；另新增自然澄清的四轮完整真实会话，等待独立评审。发现 E13 语义失败后正常暂停后续调度：四项 E 补证只有前三项六轮及 E3 首轮，共七轮 COMPLETE，E3 第二轮未调用；准备的 B3.1 补证 attempts=0。没有杀进程或将未执行补写 PASS。

dry-run 后仅将本插件推进 0.1.3→0.1.4。通用方法按本次当前状态重新匹配重复操作的源条件，保留仍适用的字段结果，将未规定的额外提示限制在提示本身；不新增有效性、限次条件或验收领域答案。市场和其他插件版本、图标、显式 Read 与确认等待边界不变。新候选须完成严格 canonical 安装、受影响 E13/术语路径与重复操作补证，以及全部六组阻断项；未测试的新版本不能继承旧 PASS。0.1.3 其余独立评审继续保存历史实际结果，原生入口及最终 head/merge 门禁仍未完成。

0.1.4 工作修正的[完整测试](evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-4/npm-test.log)279/279、零 skip，[validate](evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-4/npm-validate.log)及[基线 check](evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-4/npm-check.log)通过；[原始索引](evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-4/archive-index.json)保留 dry-run/apply 唯一 manifest 目标。此处是工作候选工程检查，不是 committed canonical 安装或 0.1.4 模型行为通过。

## §18 Complete correction after remaining historical reviews

0.1.3 原 E 的另 19 变体 / 38 轮独立评审全部完成：15 PASS、4 FAIL。除 §17 E13 外，E15 UUID `01a13337-1b98-73a0-a188-d5b96433d819` / attempt `1c325816-e9e3-4194-a5ec-0072b022a19b` 第三轮第 70、140、142 行同样把重复取消统判未知，并新增预约必须有效的前提。缺材料索取、补件读取与确认正确，不抵消指南中的规则错误。人工维护者补证 UUID `01a13342-9be1-7161-8803-6611d9b596e1` / attempt `50ac9dbc-8fa4-4806-805b-88244b53b63e` 的第二轮第 118、122、335 行亦有同类错误；其实际顶层标题与摘录有效，独立 FAIL 不覆盖原误控维护者的 INVALID_RUN。

E14-review UUID `01a13331-3167-70d3-840e-13bb519e13ed` / attempt `25e727ff-7118-4c70-b998-4deef28d8d52` 首轮第 14–16 行在拒绝已有 HTML 审查后回显 fenced HTML。实际未审查、未写入，也不能抵消代码输出边界违例；这是独立 FAIL。E9-recommended UUID `01a13319-8863-7ad1-9440-bfc018d3b846` / attempt `5a5be555-a137-4866-947e-e592cc4d33e6` 第二轮第 151、153、155 行的宽泛条件覆盖具体条件，反馈没有互斥、优先或合并规则。条件真假本身正确、推荐后明确确认有效，失败限定为分支反馈可判定性，不写成已知否被未知覆盖。其余通过变体及提早读取参考的真实时序另存，不把限定路径或未触发维度外推成全部语义/读取顺序通过。

中间 0.1.4 canonical `1e715560e0e9023c64a88b2617baa5ab903ae46b` / tree `4a1ff40c6689d77f88e9475255e1dcaa8dd1c6f8` 的[严格安装](evidence/html-guide-kit/pr3-post-merge/engineering-1e715560/installation.json)与[汇总](evidence/html-guide-kit/pr3-post-merge/engineering-1e715560/summary.json)通过七场景、四次实际缓存 Python，[24 文件索引](evidence/html-guide-kit/pr3-post-merge/engineering-1e715560/archive-index.json)保持原始命令与资源字节。发现旧批其余失败后未开始 0.1.4 模型调用，行为状态为 NOT_RUN，不称其行为失败或通过。

按后续补丁规则 dry-run/apply 仅推进 HTML Guide Kit 0.1.4→0.1.5。完整修正保留重复操作的已知结果；拒绝与引用也不得回显 HTML/代码/伪代码/制作命令，必要来源语义以自然语言及定位保留；操作分支与累计反馈分别说明，逐对核对宽泛行覆盖关系及合并方式。无验收领域规则、答案或本机来源依赖。独立静态评审三运行资源无阻断、仅 STATIC_ONLY，不当作行为 PASS。

0.1.5 须新 committed canonical 严格安装、全部六组 14 指定变体 / 30 连续轮次，以及 E13、真实双语、HTML 拒绝回显、推荐确认、补件后交付、维护者和新增重复操作补证。新模型只见原材料与自然用户输入，控制/答案及评审仍隔离；选择从真实顶层目标与三元组摘录人工取得，旧模型和误控结果分别保留。原生入口、现实效果及最终 head/merge 门禁状态不变。

另四份 0.1.3 失败原评审的字节、UUID 与来源见[独立失败索引](evidence/html-guide-kit/pr3-post-merge/candidate013-additional-failures/archive-index.json)，完整会话仍随最终历史封存。0.1.5 工作候选[完整测试](evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-5/npm-test.log)279/279、零 skip、validate/check 通过；[独立静态评审](evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-5/static-review.json)三资源 SHA 与当前字节一致，无静态阻断，behavior NOT_RUN。[原始检查索引](evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-5/archive-index.json)记录唯一 manifest dry-run/apply 及实际检查，不代替 canonical 安装、模型或 GitHub 批准。

## 19. 原生入口截断与 0.1.6 精简候选

0.1.5 canonical 3bf1fe05184afaf56bba408eb3c09a45ee7d9197 / tree d5221a98db3d4677ee317260f87f9f5dc159c162 的七种严格安装与四次实际缓存 Python 通过。新 B6 四变体五轮真实调用发现基线 CLI 0.147.0 报入口 main prompt context limit exceeded；缓存 SKILL 为8828字节/3343字符，原生会话仅注入3064字符前缀，不能当作全文读取。B6.1/compare/review 通过成功只读工具取得缓存全文，各自独立 PASS；revise 没有补读，仅正确拒绝观察，整体 UNKNOWN、executionValidity INVALID_RUN。三项 PASS 不消除原生截断缺陷；原结果、事件、读取出处与独立评审保留，不追认通过。

各 0.1.5 writer 在真实轮次结束后正常暂停，不 kill，不继续新变体。完整变体、partial、未执行和实际读取分别保存；缺少完整模型证据不得推断为运行 FAIL。现实场景效果仍为 NOT_MEASURED，原生桌面入口仍按已记录能力缺口延期，Issue #220 / Epic #217 保持开放。

仅将 HTML Guide Kit 0.1.5→0.1.6；main/marketplace/其他插件版本不变。精简 SKILL 去除与两份参考重复的细化段落，保留产品边界、两阶段真实参考读取、严格确认及核心语义核对。详细方法仍在现有两份参考中，不增加运行文件或验收答案。新增仓库及安装共用的6144 UTF-8字节保守入口预算，拒绝相同但过长的源/缓存资源；此预算是本插件工程控制，不声称所有客户端有同一限制。必须新安装、新真实连续会话证实完整原生正文加载，并复验全部六组与受影响路径、重复操作补证；静态预算与旧 PASS 均不替代该实际证据。

## 20. 并发 develop 同步与新实际加载

0.1.6 行为源 canonical b5170b0eac2b624d7dff4a6da64b525a14d07c52 / tree9896663ba74746982a77a7478ea67cfc095b9bbd 已同步434d053的批准迁移：四插件、六公开技能、三个自然入口、三个显式入口、仓库20开发技能。完整319/319零skip、validate/check通过，精确canonical八安装/四次缓存Python通过；非HTML包相对434d053原Git blob相同。本任务仍净新增一个HTML插件/一个公开技能，未恢复退出集合。

开始的新0.1.6原会话中，完整 native SKILL 正文与本次缓存路径/正文逐字匹配，旧截断缺陷有受影响实际加载证据；这不替代每变体的独立语义判准、工具事件核查和完整矩阵结论。没有通过控制信息诱导补读，人工选择只来自实际顶层目标与单一三元组，冻结用户输入/原SPEC/原计划保持同字节。

随后远端又合入#230，实际6b5a19e将marketplace准备为未发布8.2.0并更新治理/验收资料与一个版本测试；434d053→6b5a19e全部插件及scripts没有变化。本分支普通同步该已批准状态，不自行bump市场或其他插件，也不创建发布。b5170b0的模型源、后续提交与安装缓存的HTML运行资源必须逐项哈希对应，不能宣称完整repo tree相同。#230同步后又实际运行319/319零skip、validate/check，通过；当前合并提交、严格安装及最终head/merge门禁另存精确身份。现实效果NOT_MEASURED，原生桌面及当前head独立批准缺项不据此取消，#220/Epic开放。
## 21. 新值域归因失败、0.1.7修正与完整历史封存

0.1.6 全部B14fresh/30轮及受影响E6/12已真实调用，native正文均有本次缓存全文匹配，读取/输出及全部语义仍须独立判准。B6.1 UUID01a1339d-3c3a-7d13-bfc1-bc43bcab430c / attempt7f660cce-a3f6-4c6d-8761-2ede3f1ec546的第二轮36–41行将初值和运算扩为库存的通用非负整数域，未标构造或限定可达状态集合。135–143的其他正整数构造标签不能抵消41的源事实归因。原B6范围/Read三个判准PASS仍保留；补充来源忠实判准FAIL、整体FAIL，不发明未调用负数/小数路径的结果。新0.1.7通用方法区分初值、单次赋值、可达性质与完整输入域，就地标额外教学限制，保留原流程已知局部操作和结果，无验收答案。只推进本插件补丁，不改变市场及其他运行包。

已停止0.1.3的完整控制、115输入输出/工具事件、53准确UUID与原评审已lossless封存：[919文件索引](evidence/html-guide-kit/pr3-reviewer/candidate-013/index.json)、[逐调用账本](evidence/html-guide-kit/pr3-post-merge/candidate013-ledger.json)、[独立Node/.NET校验](evidence/html-guide-kit/pr3-post-merge/candidate013-final-seal/archive-index.json)。原字节32,852,373，19包，sourceInventorySha25627f762d892e0613b82f97737da84ed1401a3a7f329c74305576c9a7599ef3af0；38PASS/5FAIL/8INVALID_RUN/2UNEXERCISED，另准备未调用NOT_RUN单列。原控制/原评审与补充控制归因分别保留；Rootarchive历史元信息不改，packer仅修正未使用的旧索引描述，不改变选文件/pins/扫描/还原范围。

[0.1.5精确安装](evidence/html-guide-kit/pr3-post-merge/engineering-3bf1fe05/archive-index.json)七场景/四Python；[0.1.6行为源b517工程](evidence/html-guide-kit/pr3-post-merge/engineering-b5170b0e/archive-index.json)与[同步后422工程](evidence/html-guide-kit/pr3-post-merge/engineering-422c3763/archive-index.json)各八场景/四Python通过。两份静态snapshot与旧281初次文档检查失败及修正、两次上游同步319完整检查的raw控制保存；不是行为或GitHub批准替代。

0.1.6连续补证在已启动轮次正常结束后停止：E7四轮COMPLETE；暂停标志晚于下一E12启动29.195秒，新增E12 T1真实UUID01a133b0-b346-7233-b2ba-da590300a3fd，原重连OS10054 error后虽有turn.completed，冻结transport仍FAILED_OR_INVALID，余四轮NOT_RUN。无kill/重试，不追写前序全未跑或COMPLETE。重复操作补证尚未prepare/调用，NOT_RUN。0.1.6其他独立结果随后继续封存，不因下一补丁覆盖历史。

0.1.7须新canonical严格八安装/四Python，全部六组14/30、受影响E6/12、重复操作1/2及连续流程S2/9重新独立验收；原有效失败、控制无效、partial/未跑与新修正调用分别记录。现实效果NOT_MEASURED，原生桌面延期、最终head批准/CI/threads及actualmerge门禁不据此取消，#220/Epic开放。

## 22. 停止0.1.6完整评审与0.1.8完整修正

停止0.1.6的22UUID/47实际输入全部独立评审，46COMPLETE和1重连运输无效分开。六组14/30为10PASS/4FAIL：B6.1未标数值域、B1.2-combined独立自检缺当前状态、B4.1取消自检缺领取前条件、B5.1无范围排他库存断言漏源重置。原目标确认/范围/主模拟/六可靠题等相应criterion PASS保留，不抵消补充源忠实与可靠判准FAIL。受影响E6/12为4PASS/2FAIL：E1-maintainer把新增UI反馈初值归§1，E9-recommended用任一未知宽泛句抹去AND中已否的局部结果。S2/5实际输入为E7完整四轮更新源FAIL（旧资格例外回流）、E12仅首轮UNKNOWN/INVALID_RUN，余四未跑；不虚构尚未调用的输入场景。每份精确独立JSON/源/上下文/工具/实际读取及正确局部结论保留，后续metadata导入和完整封存另存。

中间0.1.7 canonical af87bd99db17a0feb6c972ad70db03ce0e0189ae / tree5c4a9bf02c0b19194248c02ea69ee0397c68135b的八严格安装/四缓存Python通过，319/319零skip/validate/check通过；旧6余下评审收齐前没有发起0.1.7模型，MODEL_NOT_RUN。不能称其行为通过或失败。已封存13的919文件原字节在Git暂存再次核对，147个新raw证据文件及七运行资源均逐字等于工作候选，修正意图不代替新行为证据。

只推进本插件0.1.7→0.1.8，保留marketplace8.2.0（上游准备）和其他批准集合/版本。通用方法按行/字段归因新增展示默认，明确被替换源及其例外退出active；每处排他量词就地scope并回查恢复例外；未知仅阻未决组合，所有文字/表格/反馈一致；逐题明确必要状态/输入，共用默认仅在已明确范围有效。题设假设明确补齐且源规则足够时可给该假设范围内可靠反馈，不能补造源规则或事实。初值/可达值/完整输入域继续分开，主入口仍低于6144字节，没有测试领域答案/个人来源依赖。

完整候选须新canonical八安装/四Python、六组14/30、E6/12、重复操作1/2和S2/9全新真实cache会话；控制/判准/原用户输入不变，实际顶层目标/单triplet及sourceTurn3/history人工核对。运行资源与旧版本分别哈希，任何FAIL/无效/partial/未跑不追认。原生桌面/窗口延期、现实效果NOT_MEASURED、当前head非作者批准/CI/threads/最新base与实际merge门禁不变；Issue220/Epic开放。

## 23. 已发布上游 ancestry 同步

并发 #234 的 origin/develop 2c0a83172507bcb77d105d9f9294fec2e6672ac1 已接入实际 v8.2.0 发布 ancestry 与记录。相对前次上游6b5a19e，插件、scripts、tests及VERSION无差异；本任务普通merge解决根AGENTS和INDEX的文字冲突，保留上游发布事实及HTML阶段账本，不重写历史或修改其他运行包。HTML三份运行文本仍逐字等于0.1.8修正提交61cf52dc2da2e81d9d6f1389ecd65cabf9b1f6da。

实际main与latest Release为v8.2.0的三插件/五技能，HTML不在该发行集合；本分支四插件/六技能为develop候选。marketplace版本保持上游8.2.0，后续pre-bump如有实际合入再同步，不自行准备发行。0.1.8新的canonical安装、缓存实际加载与独立行为结果随后追加，尚未完成项不能由纯文档同步推定通过。

随后#235已于2026-10-13实际合入develop3af6837338478ef49a7cea6bb935c07c5c19400c，将VERSION和README badge预升为未发布8.2.1并同步A6摘要；插件、scripts及tests相对2c0a831完全不变。本分支正常merge接入，HTML版本仍0.1.8，正在运行的44703886源/cache会话保持原身份，不重新归为新版本。根摘要首次合成超预算被阻止，保留实际失败检查；缩短本任务历史摘要后15973字节，详细旧账本不删，文档/A6/pre-bump与validate再通过。当前市场开发版本为8.2.1，已发布main/latest Release仍8.2.0，本任务无发布动作。

0.1.8准确canonical44703886c3c409f5e748c6c4a0b0c310b9358635/tree a54c4c7fcdff09310fc799df00d6fbd8549b06bc的[八严格安装/四缓存Python](evidence/html-guide-kit/pr3-post-merge/engineering-44703886/archive-index.json)已通过。新B1–B6、受影响E、重复操作与连续流程仍在独立新cache实际调用；当前全文加载观察不代表整体语义通过，也不代原生UI。

停止的0.1.5/0.1.6共35UUID/72输入、原40评审与10schema失败及技术metadata投影完整封存：[1009文件lossless索引](evidence/html-guide-kit/pr3-reviewer/candidate-015-016/index.json)、[独立Node/.NET复原](evidence/html-guide-kit/pr3-post-merge/candidate015-016-final-seal/archive-index.json)。原字节31,051,481、18packet、sourceInventorySha25615dd9534a116b0b8a6f4c8e8f5fe78bf0310eb46c07f072c81142599008235d9。0.1.5为8PASS/2UNKNOWN/2INVALID_RUN/1UNEXERCISED；0.1.6为14PASS/7FAIL/1UNKNOWN，实际运输无效/未跑另列。全部原评审/模型/判准不改，技术投影只导入同一结果；0.1.3封存字节仍未变，任何旧PASS不自动覆盖0.1.8。

## 24. 0.1.8真实失败与完整边界修正

源44703886的B14/30全部真实COMPLETE，独立结果10PASS/4FAIL。B1.1确认等待通过；B1.2-delayed/combined与B5.1在会改状态、可继续的同一模拟中，核验反馈只判断其他条件而缺本次当前未核验前提，超出源覆盖范围。原修改/明确确认、自检等相应PASS仍保留。combined另将完整值域未知写成未标设计的输入禁令；B2.1当前状态重试正确，但核对清单的全局“只在归还时增加”漏源恢复例外，且把源排除物件事项改为人物身份前提。六份B3–B5与四份B6原及补充判准各自保存，不能以正确章节抵消本处错误。

受影响E6有五完整与E15两轮部分，共6UUID/11COMPLETE，独立4PASS/2FAIL。E1-maintainer把源宽规则已覆盖的预约无效时取消写成缺规则；E15 T1只有执行入口/参考，没有用户指定的教材材料，仍自定方法主题并称这些资源“三份材料”。T2真实材料到达后正确重整目标不能消除T1违例，T3未调用。允许用户明确指定方法文档为教材对象，修正不绝对禁止相关主题。

收到E15 blocker后全部writer正常边界停止，不kill或重采样。S E7 UUID01a133f9-e3a8-7a63-bff6-d5c3684f2a07的T3已在06:41:07.839Z启动，早于暂停标志06:41:21.157Z，06:41:37.643Z自然COMPLETE并返回sourceTurn3人工边界；共3/4实际轮，未选T4，E12五轮无attempt，保留UNEXERCISED/NOT_RUN。Root扩展另有E1-visitor首轮，未确认及未调用第二轮，其余八准备变体未跑；余十四扩展路径及重复操作尚未prepare。全源8总22真实UUID/45实际输入均COMPLETE，完整原评审/partial/未跑及后续技术grade封存另存，不追认完整验收。

仅推进本插件0.1.8→0.1.9，marketplace保持上游未发布8.2.1，其他插件版本及main/latest Release8.2.0不变。一个SKILL及两参考分别修正方法资源的教材角色、每条未知回查宽规则、动态反馈每次重匹配当前前提、未知完整值域不禁局部已覆盖输入、排他性须有完整依据及局部范围、事项范围不改为人物资格。没有领域答案或研究治理依赖。入口仍受同一6144 UTF-8预算；新0.1.9须准确canonical八安装/四缓存Python及全新六组、受影响与连续会话，旧静态/PASS不继承。原生桌面/窗口延期、现实效果NOT_MEASURED、Owner最终接受及GitHub当前head批准/CI/线程/实际merge门禁保持，#220/Epic开放。

0.1.8最终技术grade无adapter：22次成功/零失败，六summary齐，实际14PASS/6FAIL/2UNEXERCISED，九个已准备无attempt项目仍NOT_RUN。before504原文件仅六batch结果metadata预期改变，原输入/输出/events/session/量表与控制字节不变；22原判准/读取/结果逐份等价，42运行资源源/镜像/cache哈希稳定。完整[620文件封存](evidence/html-guide-kit/pr3-reviewer/correction-0-1-8/index.json)及[Node/.NET复原](evidence/html-guide-kit/pr3-post-merge/candidate018-final-seal/archive-index.json)通过，原字节16,632,204、10packet、inventorySHA a0a4be0d8e3eebebea53d5cf778108899ddbb167874b3dfd9ac1a54103a7f62b。镜像58源内容文件与18个初始化空Git metadata分开解释，原literal全文件比较false不改，不把空Git metadata当成隔离FAIL。

新0.1.9工作检查319/319零skip、validate/check通过；初次测试版本锚点仍0.1.8造成318/319，随后精确同步0.1.9锚点重新完整通过，原失败日志保留。独立[最终静态审查](evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-9/archive-index.json)对6143/14551/15925字节的三文本无新阻断，早期6136草稿snapshot和另一次reviewer容量中断不改写。静态/单元检查不代模型或原生加载，完整源9安装与真实会话在准确提交后新执行。
