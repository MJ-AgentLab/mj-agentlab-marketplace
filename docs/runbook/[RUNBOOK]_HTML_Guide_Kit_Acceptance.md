---
type: runbook
scope: html-guide-kit
summary: "HTML Guide Kit staged execution ledger and unperformed acceptance gaps"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-12
state: draft
version: v1.0
last-verified: null
related:
  - "../adr/[ADR]_HTML_Guide_Kit_Addition.md"
  - "../spec/[SPEC]_HTML_Guide_Kit_Acceptance.md"
---

# [RUNBOOK] HTML Guide Kit acceptance

本记录于 2026-10-12 初始化。当前保存阶段 1 的实际仓库读取、前置治理检查和已定稿的验收流程；HTML Guide Kit 安装、模型行为、双客户端及 merge 复验尚未执行。保持 draft / `last-verified: null`，不能把产品合同、研究参考、现有插件通过记录或评审意见写成新插件 PASS。

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

## §3 Current verification ledger

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