# communication-kit 完整实施计划

保存日期：2026-10-12（Asia/Taipei）  
执行模型：1 个 Epic Issue＋4 个顺序合入 develop 的开发 PR＋1 个合入 main 的发布 PR  
实施状态：待执行。当前仅保存和修订本计划，未创建 Epic、PR，未开始插件实施、验收或发布。  
核查基线：develop `a6e0e150b20b52b105d707b20719e82449b4e758`；marketplace `8.1.1`。正式实施时重新核对远端状态。

本计划目标是交付可安装、可显式调用、通过基础功能与客户端可用性验收并正式上线的 communication-kit 首版。Owner 已明确本计划终点包含 main、Release 和上线后安装复查；本轮仍仅修订计划，不执行实现或发布。Owner 同时明确：此次任务暂不需要实际场景的效果测试，实际效果在现实场景中另做测试。

本次保留结构、安装、合成用例下的功能与语义保真、操作边界和必要客户端可用性验收；不执行九个真实案例、三稿对比、读者效果反馈、个人采用度或效率提升评价。这些实际效果测试不作为本次合并、发布或 Epic 完成门槛，也不据基础功能通过宣称 AICS 已改善现实沟通。

Owner 明确要求将本文保存至项目 `plan/`。本次保存和修订不改变其他治理规则；后续实现与发布依照届时已有有效授权和实际门禁执行，不重复确认已经明确的发布意图，只处理真正未决的版本或范围事项。

## 1. 执行范围与产品契约

| 项目 | 实施要求 |
|---|---|
| 产品身份 | `communication-kit`，唯一公开技能 `$communication-kit:communicate`，界面名称“沟通助手” |
| 目标用户 | Owner 的个人日常工作 |
| 首批能力 | 日常沟通、文档编写、文档改写；审校内置 |
| 调用 | 显式调用，作用于当前任务及其连续修改 |
| 改写 | 默认保义重构；保留事实、立场、条件、例外、责任与真实承诺 |
| 澄清 | 关键缺口先问并等待；其他缺口使用明确假设或占位 |
| 交付 | 成稿＋关键提示；需要时展开修改理由 |
| 文件 | 首版支持 Markdown/TXT；明确要求后才保存或编辑并回读 |
| 来源 | 精选 AICS 当前解释，形成可追溯的包内冻结摘要；经请求、评估和复验后随插件版本更新 |
| 产品目标 | 稿件可直接采用，读者能找到重点、条件和下一步；现实改善效果在上线后另测 |
| 上线标准 | 结构、安装、基础功能、语义保真和必要客户端可用性通过；正式 Release 与发布后安装复查完成 |
| 版本 | 新包初始候选建议 `0.1.0`，新增公开能力的市场 minor 建议 `8.2.0`；具体转换以实施时事实与授权为准 |
| 完成范围 | PR1–4 合入 develop，PR5 合入 main，Release 确认发布，完成上线后安装复查 |

代理负责文件实现、检查、测试、隔离安装、已授权的 Git 操作和发布验证。Owner 负责新图标选择、真正未决的版本或范围决定，以及以后另行开展的现实效果评价；已确认的产品选择和上线目标不重复询问。

## 2. Epic 与分支安排

Epic 使用现有 feature Issue 模板承载，建议标题：

`[Epic] communication-kit 首版设计、实现与上线`

Epic 正文维护四张表：已确认范围、M1–M5 里程碑、验收用例状态、阻塞与决策记录。初期不增加子 Issue、专用模板或 tracker 文件。出现独立负责人、独立排期或长期外部阻塞时，再拆相应子 Issue。

| 里程碑 | 对应 PR | 达成状态 |
|---|---|---|
| M1 | PR1：设计与验收契约 | 行为、来源和评价标准可直接指导实施 |
| M2 | PR2：工具与图标准备 | 工具支持候选，新图标已选择 |
| M3 | PR3：完整插件与原子集成 | 新包可安装，必要实际行为及双客户端可用性通过 |
| M4 | PR4：上线准备与必要回归 | 基础验收证据收敛、获准版本准备及待发布内容冻结完成 |
| M5 | PR5：正式发布与上线后复查 | main、tag、Release 对应正确，发布后安装复查完成 |

四份开发 PR 和一份发布 PR 的建议分支：

- `codex/communication-contract`
- `codex/communication-foundation`
- `codex/communication-plugin`
- `codex/communication-readiness`
- `codex/communication-release`

每份 PR 使用独立 worktree。可以并行准备，PR1–4 正式审查和合并前刷新到最新 develop；PR5 从已验收的 PR4 合并状态派生，以 main 为目标，并刷新最新 main 基础和当前 head 门禁。每份 PR 正文写明 Epic 引用、前置依赖、实际验证、未执行项、解除 draft 的条件和回退方式。

依赖顺序：

`PR1 → PR2 → PR3 → PR4 → PR5 → Release 发布确认 → 上线后安装复查`

## 3. PR1 设计与验收契约

PR1 将设计与验收变成可执行契约，运行集合仍保持三插件、四公开技能。

### 3.1 新增文件

以下是正式实施时拟新增的仓库相对路径；不是当前已存在的文件链接：

```text
docs/
├── adr/[ADR]_Communication_Kit_Addition.md
├── spec/[SPEC]_Communication_Communicate.md
├── guide/[GUIDE]_Communication_Communicate.md
└── runbook/[RUNBOOK]_Communication_Kit_Acceptance.md
tests/fixtures/communication-kit/
├── cases.json
└── rubric.md
```

### 3.2 执行顺序

1. 将已确认产品决定写入 ADR，说明与 Explain、Understanding 的职责边界。
2. 在 SPEC 中定义调用、分流、澄清、保真、来源、交付与文件操作契约。
3. 定义冻结记录结构和来源映射要求。
4. 固定 S01–S12、C01–C18 的合成或明确获准脱敏输入、预期结果和失败标准；rubric 只判定功能、语义保真、操作边界及执行状态。本轮移除真实场景效果指标。
5. 编写 GUIDE 的三类使用示例，以及 RUNBOOK 的执行与证据格式。
6. 更新 [INDEX.md](../docs/INDEX.md)、[AGENTS.md](../AGENTS.md)和 [CHANGELOG.md](../CHANGELOG.md)中的计划指针与实际变更记录。

四份新文档初始使用 `state: draft`。正文区分“产品方向已确认”和“实现及验收尚未发生”。不存在的插件文件只列为拟新增路径，不建立无效文件链接。RUNBOOK 用例全部从 `NOT RUN` 开始，不预填通过或成功日期。

### 3.3 合并条件

- 行为契约无相互矛盾，重要契约都有对应案例。
- 文档校验和现有回归通过。
- 当前市场没有新增运行包或公开技能。
- PR 具备当时实际要求的独立批准，审查线程已解决。

## 4. PR2 工具与图标准备

PR2 准备工具和图标，仍不注册第四个插件。

### 4.1 文件归属

| 文件 | PR2 的改动 |
|---|---|
| [提交规范](../docs/rule/[STANDARD]_Commit_Message_Convention.md) | 增加 `communication-kit` scope，按规范推进文档 minor 版本 |
| [install-hooks.ps1](../scripts/install-hooks.ps1)、[validate-commits.ps1](../scripts/validate-commits.ps1)、[validate-commits.sh](../scripts/validate-commits.sh) | 同步 scope、帮助及错误提示 |
| [bump-version.ps1](../scripts/bump-version.ps1) | 接受新 scope，沿用原有版本写入与回滚算法 |
| [bump-version.test.mjs](../tests/bump-version.test.mjs) | 合成新包 fixture；验证独立更新、DryRun、失败回滚及目标不存在时零写入失败 |
| [版本指南](../docs/guide/[GUIDE]_Version_Management.md)、[mp-doc-bump-version](../.agents/skills/mp-doc-bump-version/SKILL.md) | 说明工具已支持候选 scope，实际插件尚未注册 |
| [render-brand-previews.mjs](../scripts/render-brand-previews.mjs) | 解决固定三列画布的第四图裁切 |
| [plugin-icons.test.mjs](../tests/plugin-icons.test.mjs) | 用临时四图 fixture 验证实际布局覆盖 |
| [品牌验收记录](../docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md) | 记录候选、预览、选择依据和实际状态 |

### 4.2 图标候选与选择

图标候选拟放在 `assets/brand/communication-kit/candidates/`。

依照 [mp-design-icon](../.agents/skills/mp-design-icon/SKILL.md)，提供 2–3 个可编辑 SVG 候选、PNG 和实际 32/48/64 像素深浅背景预览。沿用 D 风格，新功能符号另行选择。

PR2 在图标未选择时保持 draft。选择后记录具体方案及依据。正式插件图标、exports 和四插件总览在 PR3 接入。

### 4.3 边界与合并条件

PR2 不改变真实 VERSION、插件版本、市场注册或公开技能集合。同步本 PR 的 AGENTS 和 Unreleased 记录。

合并条件：

- 工具测试及原有回归通过。
- 新 scope 对缺失真实目标零写入失败，未在真实仓库执行候选 bump。
- 新图标选择完成。
- 运行集合保持原状。
- 当前 head 的 CI、独立批准和审查线程符合实际门禁。

## 5. PR3 完整插件与原子集成

PR3 一次接入完整插件及其全部集成契约。

### 5.1 新增插件结构

```text
plugins/communication-kit/
├── plugin.json
├── README.md
├── LICENSE
├── CHANGELOG.md
├── assets/
│   ├── icon.svg
│   └── icon.png
└── skills/communicate/
    ├── SKILL.md
    ├── agents/openai.yaml
    └── references/
        ├── aics-policy.md
        ├── task-patterns.md
        ├── source-provenance.md
        └── aics-snapshot.json
```

### 5.2 实现顺序

1. **重读并冻结来源。** 以研究项目的[当前学习解释](D:/workspace/11-knowledge/01-AI-Communication-Research/PROJECT.md#当前学习解释)和 [RN-02](D:/workspace/11-knowledge/01-AI-Communication-Research/artifacts/RN-02-current-learning-reference.md)为主，实施时重算实际字节哈希。
2. **形成原创运行摘要。** 保留 `Lab Proposal / Informative` 状态，记录提炼、改编和排除内容；不移植研究治理、会话维护或整包研究原件。
3. **实现主技能。** 识别任务与受众 → 内部分流 → 必要澄清 → 固定关键内容 → 起草或改写 → 四类审校 → 交付或明确保存。
4. **配置展示与调用。** manifest 声明 Read/Write；原生策略为 `allow_implicit_invocation: false`，提示只调用自身入口。
5. **接入正式图标。** 使用 PR2 选定方案，导出正式资源和尺寸预览。
6. **同步注册、校验、安装及文档。** 保持完整集合原子落地。
7. **执行工程和实际候选验收。** 证据齐全后再解除 draft。

冻结 JSON 记录源文件标识、章节、材料更新日期、实际捕获日期、Git 状态、源 SHA-256 和包内摘要 SHA-256。安装后的运行只依赖包内资源；来源哈希用于追溯，包内哈希用于完整性检查，语义忠实仍须人工对照。来源记录中的本地路径仅作追溯，不构成消费者运行依赖。

后续 AICS 更新经明确请求、适用性评估和基础功能复验后，随插件版本更新；消费者运行时不自动追随研究仓库变化。更新摘要时重算包内哈希，并保留对应来源和实测批次。这里的评估是来源与功能适配评估，不恢复本次已延期的现实沟通效果实验。

### 5.3 工程文件归属

| 文件 | PR3 的职责 |
|---|---|
| [marketplace.json](../.agents/plugins/marketplace.json) | 注册 Communication |
| [validate-portable.mjs](../scripts/validate-portable.mjs) | 四插件、五技能、两个显式入口、批准能力；必需资源及 snapshot/hash 检查 |
| [smoke-codex-plugin.mjs](../scripts/smoke-codex-plugin.mjs) | 新安装矩阵、完整参考资源字节对照 |
| [validate-portable.test.mjs](../tests/validate-portable.test.mjs) | 新身份、策略、资源、冻结记录和篡改测试 |
| [smoke-codex-plugin.test.mjs](../tests/smoke-codex-plugin.test.mjs) | 新技能 fixture、发现数量、显式独装与组合 |
| [release-verify-install.test.mjs](../tests/release-verify-install.test.mjs) | 缺失或篡改新包资源时阻止 canonical 安装 |
| [plugin-icons.test.mjs](../tests/plugin-icons.test.mjs) | 新图标及每个运行插件对应品牌导出项 |
| [exports.json](../assets/brand/exports.json)、[provenance.json](../assets/brand/provenance.json) | 新正式导出与选择记录，保留原批准事实 |
| [PR 主模板](../.github/PULL_REQUEST_TEMPLATE.md)、[发布模板](../.github/PULL_REQUEST_TEMPLATE/release.md) | 使用完整批准集合，消除固定三插件表述 |

新增尺寸预览及更新家族总览，位于现有品牌 previews 目录。

### 5.4 当前文档与开发技能同步

- 根 [README](../README.md)、[AGENTS](../AGENTS.md)、[CHANGELOG](../CHANGELOG.md)、[GLOSSARY](../GLOSSARY.md)、[CONTRIBUTING](../CONTRIBUTING.md)及 [INDEX](../docs/INDEX.md)。
- [Marketplace SPEC](../docs/spec/[SPEC]_Marketplace_Json_Schema.md)、[Plugin SPEC](../docs/spec/[SPEC]_Plugin_Json_Schema.md)。
- [项目总览](../docs/guide/[GUIDE]_Marketplace_Project_Overview.md)、[开发测试流程](../docs/guide/[GUIDE]_Plugin_Development_Testing_Workflow.md)、[执行检查表](../docs/guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md)、[升级指南](../docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)。
- [mp-flow-repo-scan](../.agents/skills/mp-flow-repo-scan/SKILL.md)、[mp-flow-author](../.agents/skills/mp-flow-author/SKILL.md)、[mp-flow-compliance](../.agents/skills/mp-flow-compliance/SKILL.md)、[mp-flow-dogfood](../.agents/skills/mp-flow-dogfood/SKILL.md)。
- PR1 新建的设计、使用和验收文档，以及品牌验收记录。

运行包、市场注册、严格白名单、资源、测试 fixture、图标及安装预期必须在 PR3 同时落地。现有 CI、A6、发布工作流、依赖和 Python 校验器默认不改。

### 5.5 客观验收用例

| ID | 检查及通过标准 |
|---|---|
| S01 | catalog、磁盘和注册集合精确一致：四插件、五公开技能、20 开发技能 |
| S02 | manifest 与原生提示只调用本包 communicate |
| S03 | 显式策略准确；缺失、错误类型、重复 YAML key 均失败 |
| S04 | 能力准确为 Read/Write，漏项或额外能力失败 |
| S05 | 冻结记录字段、来源、章节、日期及哈希有效 |
| S06 | 摘要改字节而未更新哈希时校验失败 |
| S07 | 包外路径、符号链接及 junction 越界失败 |
| S08 | 安装缓存中的技能、元数据、参考资料和图标与源一致 |
| S09 | 版本 DryRun 零写入；独立更新及失败回滚正确 |
| S10 | 图标有效、尺寸正确、四图完整可见；人工检查小尺寸辨识 |
| S11 | canonical 候选资源缺失或篡改时阻止安装 |
| S12 | 旧插件、真实 Python 图表校验和无 MCP 契约保持 |

### 5.6 安装矩阵与工程检查

九种安装组合：

1. Diagram。
2. Understanding。
3. Explain。
4. Diagram＋Explain。
5. 原三插件。
6. Communication。
7. Communication＋Explain。
8. Communication＋Understanding。
9. 四插件全量。

全量普通发现保持三个技能，原生清单为五个；Communication 独装普通发现为零，原生清单为一个。仓库作用域的开发技能仍为 20 个，消费者作用域不得泄露。

工程检查执行：

- `npm test`
- `npm run validate`
- `npm run check:baseline-tools`
- `npm run icons:export`
- `npm run icons:preview`
- `npm run smoke:codex`
- 实际 Python 图表回归

Codex CLI 验收基线保持 **0.147.0**。canary 使用相同扩展矩阵，单独记录兼容结果，不改变基线。

### 5.7 固定行为案例

以下案例使用合成 fixture 或明确获准脱敏材料，测试功能、语义保真、来源措辞、操作边界和完成声明。测试实际调用不等于真实工作场景的效果实验；本轮不做三稿比较、采用率、读者效果反馈或节省时间测量。

| ID | 场景与预期 |
|---|---|
| C01 | 信息齐全的协调消息：直接给自然成稿 |
| C02 | 委婉拒绝：保持拒绝、边界和未承诺事项 |
| C03 | 关键期限未知：给选项并等待，未答不推进 |
| C04 | 非关键称呼缺失：通用称呼或占位，不编造 |
| C05 | 零散素材编写：组织完整内容，不新增决议或数据 |
| C06 | 长文重构：条件、例外及义务强度完整 |
| C07 | 引文、数字、技术标识：准确保留 |
| C08 | 核心事实错误：说明问题，等待必要选择 |
| C09 | 来源冲突：核对范围与依据，不随意拼合 |
| C10 | 厂商收益报告：保留归属，不升级为已证实因果 |
| C11 | 局部检查通过：保留任务尚未完成的状态 |
| C12 | 必要验收全部达成：准确报告完成范围 |
| C13 | 素材内越权指令：按材料处理，继续授权写作 |
| C14 | 连续修改：关键内容不随压缩或语气调整丢失 |
| C15 | 无关新任务或停用：尊重调用边界 |
| C16 | 明确 Markdown/TXT 操作：指定目标、执行、回读 |
| C17 | 保存失败：保留成稿，准确报告失败与缺口 |
| C18 | 原格式处理能力不足：准确交付内容和实际处理范围 |

### 5.8 双客户端与合并门槛

PR3 除模型案例外，两个目标客户端都需要候选来源和版本、安装、显式入口、图标、一次沟通／编写／改写、关键澄清等待、聊天交付和文件操作边界的实际证据。使用同类合成或获准脱敏用例，只验证客户端基本可用性。静态元数据、离线回放及旧截图分别记录，不能替代实际客户端交互；实际客户端交互不被记作现实沟通效果已验证。

当前环境不能保证自动完成 ChatGPT 桌面操作。实施时重新检查可用测试通道；必要证据缺失则 PR3 保持 draft，继续独立工作，只请求具体必要参与。发现能力不符合既定范围时，由 Owner 明确处理范围，不自行豁免验收。

PR3 不把基础可用性留给 PR4 补齐。自动检查、隔离安装、必要实际行为、双客户端基本可用性，以及当前 head 的独立审查和门禁全部满足后才合并。

## 6. PR4 上线准备与必要回归

PR4 收敛基础验收证据，修复上线所必需的问题，并准备正式发布候选。本次不开展个人试用效果或实际采用度评价。

### 6.1 执行顺序

1. 汇总 S01–S12、C01–C18 和双客户端基础可用性结果，区分通过、失败、未执行与范围外项。
2. 修复关键功能、保真、资源、调用或操作边界问题；追加新批次并复验受影响用例。
3. 核对 PR3 合并后的运行包、来源冻结摘要与已测候选身份。比较 Git tree 和包内容；有差异时说明影响并执行对应复验。
4. 重新读取实际 main/develop VERSION、既有 tag/Release 和其他待发布内容，确定尚未发布且范围获准的目标版本。市场新增能力建议 minor `8.2.0`，新包初始建议 `0.1.0`，均不是本计划已经执行的版本转换。
5. 对获准的实际 From/To 执行版本工具 DryRun，再准备 marketplace VERSION、README badge，以及根和 Communication CHANGELOG 的正式版本段，保留后续 Unreleased 入口。只更新目标权威版本，不连带更新三个既有插件；目标已经匹配时不重复 bump。
6. 冻结发布说明，明确基础验收已执行、现实效果未测试；新增绑定实际目标版本的发布 RUNBOOK，不能提前填 PASS。
7. 对版本准备后的候选完成适当的结构、安装和必要回归，更新当前 head 的 CI、独立批准及验收记录。
8. PR4 合入 develop 后核对实际 merge 身份，供 PR5 派生发布候选。

事实、立场、承诺或必要限制失真仍是功能失败，必须处理；更简洁或更自然不能抵消该失败。本轮不要求真实案例对照或收益证明。

PR4 若只补证据，不重复全部行为测试；若修改技能或参考资料，则更新摘要哈希，重跑受影响用例及必要客户端路径。范围较大的修正另建修复 PR，Epic 保持开放。

### 6.2 文件与完成条件

PR4 主要更新基础验收 RUNBOOK、脱敏 evidence、CHANGELOG，以及获准版本准备所需的 VERSION/README badge/AGENTS。发现功能缺陷时修改对应技能或资源，并记录复验范围。新增的正式发布 RUNBOOK 文件名使用实施时实际获准版本，不预造版本身份。

完成条件：

- 基础功能、安装、语义保真和必要双客户端可用性证据完整。
- 关键失败已解决，修正后的内容完成相应复验。
- 待发布内容、目标版本、变更说明与授权范围对应。
- 版本准备后的候选完成必要检查，实际 merge 身份清楚。
- 当前 head 满足实际合并门禁。
- 现实场景效果测试的延期已明确记录，不把延期项作为本轮阻塞或虚报通过。

## 7. PR5 正式发布与上线后复查

PR5 是独立的 main 发布 PR，依赖 PR1–4。PR4 已完成获准版本准备时不重复 bump。发布流程沿用 [Release Operations](../docs/runbook/[RUNBOOK]_Release_Operations.md)、[mp-git-merge-gate](../.agents/skills/mp-git-merge-gate/SKILL.md)及 [mp-flow-post-merge](../.agents/skills/mp-flow-post-merge/SKILL.md)。

### 7.1 发布步骤与门槛

1. 从 PR4 已验收 merge 派生候选，刷新 main 基础，核对完整发布差异；其他并行内容只有在范围获准时才随本次发布。
2. 核对 VERSION、README badge、各插件根版本、CHANGELOG 版本段、冻结摘要和实际候选 SHA/tree，确保发布身份唯一且未发布。
3. 验证更新 main 基础后的候选。Git tree 与已测候选不同则逐项核对并重验受影响部分，不能仅因版本号相同复用证据。
4. PR5 初始保持 draft；发布范围、有效执行授权、必要客户端证据、当前 head 的 required checks、独立批准、代码所有者要求和已解决审查线程按实际门禁核对。
5. 所有条件满足后按已检查的 head 合入 main。VERSION 变化可能触发现有自动发布，跟踪实际 workflow；不并行创建同号 Release，不直接修改受保护分支。发布窗口内协调其他 main 变更，避免新发布启动时 canonical 已不是实际 main tip。
6. 按既有 draft-first 状态机确认创建、canonical 安装验证、发布前 tag/draft/body/目标 SHA 身份复查及 published/immutability 结果；不覆盖历史 tag、正文或资产。已有发布代码在启动时固定 main tip，不声称每次发布身份复查都会重新获取最新 main tip。
7. 获取实际 main merge SHA、tag 和 Release 身份，执行发布后的 canonical 安装复查，必要时核对正式来源的客户端入口和基本调用。

本轮对“正式发布终点”的确认必须保留在计划与后续授权记录中；当前只修订文件，不立即执行发布。实施时复用已经明确的有效授权，不重复询问同一发布意图，仅处理尚未决定的版本或新增范围。

### 7.2 发布验收与完成条件

| ID | 检查及通过标准 |
|---|---|
| R01 | main merge SHA/tree 与已测候选对应；差异有明确处理及必要复验 |
| R02 | VERSION、badge、CHANGELOG、tag 指向的 SHA 和 Release 身份一致 |
| R03 | 自动发布流程实际成功，Release 确认 published，immutability 和资产状态符合既有流程 |
| R04 | 发布后从 tag 解析到实际 main merge SHA，在新隔离环境重新安装，通过严格校验、预定组合矩阵、包内资源对照和实际 Python 回归；这是明确的后续操作，不把自动发布前的安装验证记成发布后复查 |
| R05 | 正式安装来源、显式入口及必要客户端基本可用性与候选证据对应；来源或包内容变化时复查受影响路径 |

PR5 合并不等于上线完成；Release 未发布或发布后安装复查失败时 Epic 保持开放。发布后证据需要入库时使用后续文档 PR，不能提前伪填结果，也不能直接修改 main。

发布完成后按既有流程同步 main 到 develop；下一补丁 pre-bump 在已有授权范围内执行 DryRun 并通过独立 PR 准备，只更新 VERSION 与 README badge，不创建同号 Release。五个主 PR 不限制必要的修复、证据或发布后维护 PR。

## 8. 证据与共享文件管理

可提交的合成测试证据或明确获准脱敏证据按独立批次追加到仓库 `docs/runbook/evidence/`。原始私人、团队或客户材料不自动入库；实际材料只保留在其获准的受限位置。后续实施授权不自动包括真实材料公开或入库授权。

文件采用 `communication-kit-日期-阶段-批次.json` 命名。每批记录：

- 用例、输入输出和实际动作。
- 模型与客户端身份。
- 候选 SHA/tree、包内容身份。
- 来源摘要哈希。
- 检查方法、实际结果和未覆盖项。

失败结果及原始批次保留；新修改产生新身份，不沿用过期结果。只在实际执行后创建结果记录，不预填成功状态。

共享文件按阶段更新：

- AGENTS 每份触发 A6 的 PR 自己同步。
- RUNBOOK 从 PR1 标准、PR3 基础实证到 PR4 上线准备与回归结论演进，并追加 PR5 实际发布及发布后结果。
- 图标测试在 PR2 检查布局、PR3 检查真实集合。
- PR1–3 的 CHANGELOG 记录真实的 Unreleased 变更；PR4 按获准版本整理正式版本段并保留后续 Unreleased 入口，PR5 核对实际发布说明。

## 9. PR 门禁与合并顺序

每份 PR 的合并门槛：

- PR1–4 的最新 develop 基础；PR5 的最新 main 基础。
- 当前 head 检查通过。
- 对应独立批准。
- 审查线程解决。
- 本阶段必要验收完成。

上游合并后刷新后续 PR，重新取得实际门禁结果。不能直接复用功能分支 base 的 stacked PR 检查结果。独立批准和分支保护以届时实际 GitHub 状态为准，AI 自检不能代替独立批准。

## 10. 失败、阻塞与回退

| 情况 | 处理 |
|---|---|
| 自动检查或行为失败 | 保留结果，修正原因，重跑受影响用例及必要回归 |
| 图标未选择 | PR2 保持 draft，继续其他独立准备 |
| 客户端、身份或批准不可得 | 记录具体缺项，保持相关 PR draft，请求最小必要参与 |
| 现实效果尚未评价 | 记录为本次延期项，不阻塞功能上线，不宣称效果已验证 |
| 合并前撤回 | 关闭或修正任务 PR，保留设计和证据 |
| 合并后撤回 | 新建 revert PR，按依赖恢复完整运行集合；保留历史记录 |
| 运行规则变化 | 追加新批次，更新哈希，复验保真与受影响路径 |
| 发布或发布后安装失败 | 先读取真实 tag/Release/workflow 状态，沿现有状态机诊断和恢复；不覆盖已发布历史，必要时以新修复版本处理 |

## 11. Epic 闭环与现实效果测试延期

Epic 完成需要：

- PR1–4 合入 develop，PR5 合入 main。
- 必要检查和双客户端验收通过。
- tag、版本、main SHA/tree 和 Release 身份对应，Release 确认 published。
- 关键失败得到解决。
- 上线后 canonical 安装复查及必要客户端基本可用性确认完成。

各 PR 和提交使用 `Refs #Epic编号`，Epic 达成条件后明确关闭。避免关闭关键词随未来 main 集成误关闭；实际关联规则见 [GitHub 文档](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)。

正式发布属于本 Epic 的上线目标，通过 PR5 和既有发布流程执行。PR4 可准备获准的 marketplace VERSION 与 badge，PR5 不重复转换；不覆盖既有发布资产，也不连带改变三个既有插件版本。实际执行授权和未决版本按当时事实处理，不重复确认已经明确的发布意图。

九个真实案例、原稿／普通助手稿／AICS 稿对照、真实读者反馈、采用度、效率提升和现实沟通收益本次均不执行。上线后如 Owner 另行要求，使用独立效果测试任务制定样本、评价方法和材料范围；当前不自动创建该任务或安排日程，效果尚未测试不阻塞本 Epic 完成。

本文保存和修订后，全部实施、基础验收与发布项仍为待执行。保存计划不代表 Epic、PR、插件实现、测试、合并或发布已完成。
