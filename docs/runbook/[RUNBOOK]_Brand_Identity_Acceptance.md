---
type: runbook
scope: marketplace
summary: "Brand icon source, merged-tree acceptance and client limitations"
owner: marketplace-maintainers
created: 2026-10-10
updated: 2026-10-12
state: draft
version: v1.3
---

# [RUNBOOK] Brand identity acceptance

## Communication PR3 当前候选 — 2026-10-12

Refs #222。Owner 已明确选择第二轮 D 地球＋清晰文字，原始选择见 [selection](../../assets/brand/communication-kit/candidates/revision-2/selection.json)。PR3 已将修复后已查看的原创 MJ D 资源接入完整 Communication 0.1.0 候选：[正式SVG](../../plugins/communication-kit/assets/icon.svg)、[1024 PNG](../../plugins/communication-kit/assets/icon.png)、manifest 的 logo/composerIcon、[exports](../../assets/brand/exports.json)和[来源账本](../../assets/brand/provenance.json)同时更新。研究来源冻结仍为 Lab Proposal / Informative，插件实现与设计接入不升级研究状态。

已实际查看[四插件家族总览](../../assets/brand/previews/plugin-family.png)：第四张图及各行32/48/64深浅预览完整可见；新包原生尺寸另见[32](../../assets/brand/previews/communication-kit-32.png)、[48](../../assets/brand/previews/communication-kit-48.png)、[64](../../assets/brand/previews/communication-kit-64.png)。此为实际资源及 Agent 视觉检查，不是两个桌面客户端中的图标显示结果。

固定已测候选 `2fa25486b68607335b3dcd6d0e8c99f1a97ecd7e` 和重分提交后的 `a046058b7a0aa0741082f8a8ce6ae377a482c428` 的 tree 均为 `37648de2fadd2603b2dbd867640bbc98276d1863`；后续修复的新tree须另记复验。候选四插件五公开技能、20开发技能、两显式入口；marketplace 保持未发布8.1.2，main / 最新 Release 8.1.1仍为前三插件，Communication 未发布。

| 项目 | 当前实际结果 | 证据及限制 |
|---|---|---|
| 正式D资源与四图布局 | 已接入／已查看 | 1024分发图、32/48/64实际预览和完整四图总览；首轮未选及第二轮首次失败仍保留 |
| PR3工程检查 | 已执行 | [engineering 01](evidence/communication-kit-2026-10-12-pr3-engineering-01.json)：npm test276/276、严格候选集合通过；不证明模型或桌面显示 |
| 九组合canonical安装 | PARTIAL | [canonical 01](evidence/communication-kit-2026-10-12-pr3-canonical-01.json)：现有比较范围9/9、四次缓存Python通过；发现manifest/SVG源缓存比较缺口，S08完整结果待修复复验 |
| 模型C01–C18 | NOT RUN（判定） | 尚无判定；准备或执行不能记PASS |
| ChatGPT／Codex真实图标及入口 | NOT RUN | 详情页、输入框、实际调用须绑定本候选；旧截图、CLI元数据、源PNG和视觉判断不能替代 |
| 正式发布及发布后R04 | NOT RUN | PR3保持draft；Release、当前head非作者批准与发布后复查未完成 |

详细功能、必要客户端清单、候选身份及S08缺口见 [Communication 验收](./[RUNBOOK]_Communication_Kit_Acceptance.md)。当前段是 PR3 进展；以下 PR2 与旧品牌阶段的三插件集合、PENDING、失败和当时限制继续按各自阶段保存，不作为当前集合或已通过客户端的结论。AI review 不替代 GitHub 非作者批准。现实场景沟通效果本轮延期，不因资源、安装或功能通过而宣称收益。

## Communication PR2 canonical 复验

Owner 于 2026-10-12 明确选择第二轮 D 地球＋清晰文字，原稿/初轮候选/失败导出保留。PR2仍不注册第四插件，不改变正式exports或真实版本。当前准备head04b664d（包含PR1 #223证据）已实际调用verifyReleaseInstall；[canonical记录](evidence/communication-kit-2026-10-12-foundation-canonical-01.json)的四组既有安装、图标字节比较和三次安装缓存Python检查通过。

PR1未正式合并、当前head独立批准及真实桌面显示仍是未完成条件；本记录不是Communication实际行为、客户端或发布后R04通过。

## Identity and approved design

日期：2026-10-10（Asia/Taipei）。基准 develop 77f4395；独立分支 codex/marketplace-brand-icons。市场保持 8.1.1（未发布），插件候选版本为 diagram-kit 0.3.1 / understanding-kit 0.1.2 / explain-kit 0.1.1。

Owner 选择 D 插件风格及仓库 A 斜向连接主标；原标与批准稿的来源和 SHA-256 见 [来源账本](../../assets/brand/provenance.json)。主标候选 [A/B/C 对比](../../assets/brand/previews/marketplace-candidates.png) 与 [D 图标对比](../../assets/brand/previews/plugin-family.png) 包含真实 32、48、64 像素及深浅背景。最终主标为 [SVG](../../assets/brand/marketplace/logo.svg) / [PNG](../../assets/brand/marketplace/logo.png)。

## Verification evidence

| 检查 | 实际结果 | 证据及限制 |
| --- | --- | --- |
| SVG / PNG 导出 | PASS | 7 个源（含候选历史）导出 28 个正式/尺寸 PNG；正式图标 1024×1024，原始参考哈希未改变 |
| npm run validate | PASS | 三插件、四公开技能、20 开发技能；含完整 PNG 解码与品牌主题/来源校验 |
| npm run check:baseline-tools | PASS | codex-cli 0.147.0 精确匹配 |
| npm run smoke:codex | PASS | 四种现有隔离安装，逐包核对 logo/composerIcon 引用和内容；消费者 0 个开发技能、仓库 20 个 |
| 实际安装 Python 校验 | PASS | 包含 Diagram 的三个安装场景均实际扫描 1 图、FAIL 0 |
| 新图标技能选择停点 | PASS | 新名称 workflow-kit 生成 3 候选、40 文件；正式 assets 未创建，manifest/README/导出清单/来源账本哈希保持 |
| 已批准图标复用 | PASS | 直接复用 Diagram D 稿，无重复选择或新候选，重新导出与原 PNG 哈希一致；5 个相关契约测试通过 |

安装明细见 [JSON](evidence/brand-install-results.json)，独立模型演练见 [JSON](evidence/brand-skill-forward-tests.json)。复用演练的首次全仓校验因隔离夹具缺少 workflow 和 session 指针失败；修正夹具后复验 PASS，失败与修正分别保留，不改写为首次通过。两次初始 shell 调用加载了宿主 profile，后续均关闭；实际主动读写限制在隔离目录。

插件版本工具三个转换均执行 dry-run 和实际应用；市场 VERSION / badge 保持 8.1.1。最终 npm test：240 项全部通过，0 失败、0 跳过；包含真实 Python 执行测试。图标和导出专用测试 10 项通过。

## Local self-review

基准固定为 develop 77f4395。diff 与批准范围一致：新增集中品牌资源、20 号开发技能、通用图标校验及安装比较，没有新增公开技能、MCP、市场索引 logo 字段或 CI workflow。历史 archive 和已发布 CHANGELOG 正文保持；A6 触发项伴随根 AGENTS.md 实质同步。Owner 在本地验收后授权提交、推送和创建 PR；合并与正式发布仍需各自授权。

## Visual review

查看实际尺寸预览：三个插件的节点图、气泡灯泡和问号卡片可区分，厚实轮廓及蓝青色系统一致。主标 A 的 MJ 清晰，斜向三个模块延续原标连接走向；owner 已选择 A。此项为设计审阅判断，自动检查不证明视觉风格。

## Client and delivery limits

本地 CLI 安装与资源检查不证明 ChatGPT 或 Codex 桌面列表和输入框已显示图标。当前原生应用控制不可用，两个桌面客户端的实际显示暂未验证。PR #203 最初按技能规则以 draft 创建，现已实际合并；合并不构成未执行的客户端验收或独立批准证据。本记录分别保存本地、远端 CI 和合并后安装结果，未执行正式发布。

## Post-merge verification

[PR #203](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/203) 于 2026-10-10 02:20:45 UTC 合入 develop。已测 head 为 75dbb96028c751152d01f55ea79229b4adc15ed1，实际 merge 为 261b5ead04c441d028fca4730cbd8a82b3b8ff88；两者 Git tree 都为 22abb753345d774e56f0bd7b571ef4590e72a41a。合并后四种安装从该 merge SHA 的临时 detached checkout 执行，不使用未提交文件。

| 检查 | 实际结果 | 证据及限制 |
| --- | --- | --- |
| PR 远端 CI | PASS | [结构与 Ubuntu/Windows baseline](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38016448392)、[A6](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38016448393)；[push CI](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/38016403841) 亦通过 |
| 合并提交 canonical 安装 | PASS | 四种隔离安装均成功，logo/composerIcon 引用、PNG 内容与源一致，消费者开发技能 0、仓库 20；[实际安装明细](evidence/brand-post-merge-install.json) |
| 合并后实际 Python 校验 | PASS | 三个含 Diagram 的安装场景均实际扫描 1 图、FAIL 0、WARN 0 |
| 分支与版本 | 已核实 | 本地 develop 已 fast-forward 到 merge 并保持干净；远端 main 65a05a8f8e1fc908cacd7d1bbb27f2510e93adf4 是 develop 的祖先，无需再次同步 main |
| GitHub 独立批准 | 未见记录 | PR reviews API 返回空数组，不能把成功 CI 或实际合并写成独立批准 |
| 桌面列表与输入框显示 | 未验证 | 原生应用控制不可用；CLI 安装结果不替代客户端显示验收 |

市场保持未发布 8.1.1，develop 插件版本为 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1。main 保持 8.1.0，最新公开 Release 为 v8.1.0（Release ID 407832742，published，非 prerelease），标签绑定 d8a12d612ee0907a919e302c76bca9f906353669。本次未创建标签或 Release，未执行下一补丁预升；下一次 pre-bump 只在正式发布后按既有流程进行。

Owner 已确认 #203 合并并要求继续后续工作；本轮仅完成合并后核验、开发工作区同步、已合并特性分支清理及文档收尾。正式发布仍需要客户端验收、独立批准、required checks 和单独的发布授权，现有缺项保持未完成状态。

## Communication PR2 preparation — 2026-10-12

Refs #222。隔离分支 `codex/communication-foundation`，基准 `b2e5a74109f47ecee7471ba741fb4c1348457f3b`。本批测试来自尚未提交的工作树，不将其称作 canonical 提交验证。marketplace 保持未发布 8.1.2；三个现有插件版本、注册、正式图标和导出/来源清单保持。

准备了三个 D 风格候选：[比较与真实尺寸](../../assets/brand/communication-kit/candidates/comparison.png)、[候选说明](../../assets/brand/communication-kit/candidates/README.md)、[选择状态](../../assets/brand/communication-kit/candidates/selection.json)。首轮 A 气泡与笔覆盖沟通及成稿，Agent 原建议选 A；B 双消息强调交流，C 文稿与箭头强调改写。已实际看图：32/48/64 深浅背景均可见功能形状，此项仅是 Agent 视觉检查；Owner 尚未选择，随后要求使用“ASD-STATE100的icon元素”；准确来源仍待同一 Q2 确认。首轮原稿保留，未制作或接入新方向正式资源。每个候选保留可编辑 SVG、1024 PNG、原生尺寸 PNG 和单独对比图，可运行候选目录 `render.mjs` 复现。

品牌比较布局从固定单行改为每行至多三图、按图数增加高度。临时四图 fixture 对每张大图以及两行 32/48/64 图逐像素检查，证明第四图完整可见且小图保持原生尺寸；实际运行集合依然只有三个插件。

| 检查 | 实际结果 | 证据及限制 |
| --- | --- | --- |
| 提交工具 scope | PASS | PowerShell / Shell 两验证器与隔离仓库中实际生成的 commit-msg hook 接受 communication-kit，拒绝错误 scope/type；保留历史 learn-kit |
| 合成新包版本工具 | PASS | 独立根版本更新、嵌套版本与其他包不动；DryRun 零写入；写失败、写后损坏均恢复原字节；identity / From 不符零写入失败 |
| 真实仓库缺目标预检 | PASS | apply-preflight / DryRun 都以缺 manifest 退出 1，261 个 tracked 文件哈希前后相同，无 manifest 创建；没有执行成功的真实 bump |
| 四图布局与候选导出 | PASS | 四图像素 fixture 通过；候选可编辑 SVG 与 1024/32/48/64 PNG 已实际导出；原正式导出可重复生成 |
| npm test | PASS | 249/249，失败 0、跳过 0；REQUIRE_PWSH / REQUIRE_PYTHON / REQUIRE_SHELL 均为 1；含实际 Python 图表执行 |
| npm run validate | PASS | 三插件、四公开技能、20 开发技能，未注册第四插件 |
| npm run check:baseline-tools | PASS | codex-cli 0.147.0 精确匹配 |
| npm run icons:export / icons:preview | PASS | 既有正式资源正常重导出；候选独立保存，不进入 exports |
| npm run smoke:codex | PASS | 四种既有隔离安装；包内资源/原生清单核对，三个含 Diagram 的场景实际运行安装缓存 Python 校验，均扫描 1 图、FAIL 0 |
| PR1 dependency / Owner selection | PENDING | PR1 尚未实际合并；Owner 已确认地球＋文字原创方向，新 D/E/F 候选尚未选择。PR2 保持 draft，刷新最新 develop 后仍需当前 head CI、独立批准及解决线程 |
| canonical / remote CI / clients | NOT RUN | 未提交、未推送或创建 PR，未做新包安装/模型行为/桌面显示；静态及既有安装结果不替代后续 PR3 验收 |

完整命令输出、候选哈希、缺目标预检与限制见 [本批 JSON](evidence/communication-kit-2026-10-12-foundation-01.json)。测试夹具初次使用 Windows `os.devNull` 作为 Git config，两个 scope 测试因 `fatal: unable to access '\\.\nul': Invalid argument` 失败；改用隔离目录内普通空配置文件后 2/2 复验通过，全量再通过 249/249，原失败保留。文字编辑辅助首次探测 `python` 不在 PATH，未发生写入；改用已有 Node。Python 图表实际回归通过仓库既有 uv 定位得到的 3.12 解释器执行。基础工具通过不代表现实沟通效果经过测试。

## Communication icon direction revision

Owner 于 2026-10-12 明确指 ASD-STE100，采用官方封面地球＋文字意象并以 MJ D 风格原创重绘。初轮 A/B/C 未选择并原样保留；新增 [D/E/F 比较](../../assets/brand/communication-kit/candidates/revision-2/comparison.png)，每个候选有可编辑 SVG、1024 PNG 与真实 32/48/64 深浅预览。推荐 D 的单一地球＋清晰文字，其余分别强调消息或文稿；具体选择仍 PENDING，未接入正式资源。

实际通过 Edge 只读查看了官方主页提供的封面展示图；web 获取主页/PDF均 403，研究 C01.local_copy 为 absent。只查看主页图片，没有取得或读过 Issue 9 PDF；该图片文件名含 2023，不能称其为 Issue 9 的准确 PDF 封面。候选仅使用地球、网格和清晰文字的通用意象，未复制官方标志、商标字样或位图。查看事实及排除内容见 [source record](../../assets/brand/communication-kit/candidates/revision-2/source-record.json)。

D 首次导出的第二行文字未显示，原 SVG、PNG 与比较图保留在第二轮 failed-first-export。将水平 gradient stroke 改为共享 cyan 实色后重新导出并实际看图，两行均显示。新候选 12 个尺寸 PNG 的完整解码/尺寸检查通过，实际小尺寸及深浅背景形状清楚；此为 Agent 视觉检查，不代替 Owner 选择或客户端显示。新批次与原失败见 [本批 JSON](evidence/communication-kit-2026-10-12-foundation-02.json)。仅候选资源变化，未重复全量工具测试；base 刷新后的必要回归另记新批次。

Refs #222。

## References

- [品牌规范](../rule/[STANDARD]_Brand_Identity.md)
- [品牌决定](../adr/[ADR]_Brand_Identity_And_Icon_Workflow.md)
- [设计入口](../../.agents/skills/mp-design-icon/SKILL.md)

## Selected Communication candidate

Owner 于 2026-10-12 明确选择第二轮 D 地球＋清晰文字，见 [selection](../../assets/brand/communication-kit/candidates/revision-2/selection.json)。选定 [SVG](../../assets/brand/communication-kit/candidates/revision-2/d.svg) 与 [1024 PNG](../../assets/brand/communication-kit/candidates/revision-2/d.png) 为修复后已查看的输出；初轮未选、D 首次失败导出与修复后的复验均保留。前段 PENDING 表格和第二批记录反映选择前的历史状态，本段记录明确的新决定。来源仍仅是官方主页实际展示图，未读 Issue 9 PDF；候选批准不补记客户端图标显示。PR2 不接正式插件、exports 或注册；PR1 实际合并、刷新后的当前 head CI、独立批准及线程门禁仍未满足。Refs #222。

## Communication preparation base refresh

Refs #222。PR2 合并 PR1 准备分支 `60548a256aa26eade4da7c419c85c83e3a20e922`，其中已纳入实际 develop `70267a5b91d759af09a8f1281a33e2d5a90fdbc9` 的 Learning Evidence / HTML Guide 契约。此为 feature 分支内的准备 merge，不是 PR1 或 PR2 正式合入受保护 develop。8 个实际冲突已逐项保留双方意图；提交与版本工具支持 HTML / Communication 两个候选 scope，v1.5 HTML 历史保留，Communication 规范推进 v1.6。新增 commit-convention 执行案例同时覆盖两个 scope、错误名称、类型和分隔格式；原 fixture / cleanup / tests 保留。

刷新后受影响 54/54、全量 261/261（失败 0、跳过 0）通过，validate 与 Codex 0.147.0 精确基线通过；四组既有隔离安装和三次实际缓存 Python 回归通过。真实缺 Communication manifest 的 apply-preflight / DryRun 均预检失败，417 个 tracked 文件哈希无变化，没有 manifest 创建或成功的真实 bump。已选 D 未接入正式包或 exports；客户端显示仍 NOT RUN。测试来自解决冲突后的工作树/index，具体 tree、源码哈希、命令与安装输出见 [第三批](evidence/communication-kit-2026-10-12-foundation-03.json)。最终 merge 身份与 canonical 提交复验由后续记录补充，不能用此工作树批次冒充。

| Version | Date | Summary |
|---|---|---|
| v1.3 | 2026-10-12 | 增补Communication正式D候选及四图实看、部分工程/安装证据与客户端和S08缺口；保留历史批次 |
