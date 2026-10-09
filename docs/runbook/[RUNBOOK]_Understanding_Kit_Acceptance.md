---
type: runbook
scope: understanding-kit
summary: "Separate structure, discovery, model behavior and desktop quiz acceptance"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: draft
version: v1.1
last-verified: null
---

# [RUNBOOK] Understanding Kit acceptance

2026-10-09 PR #195 已合入 develop，并完成精确合并树的本地复验。初始三个实际模型样本与后续行为矩阵分别记录。真实客户端人工验收尚未完成，因此保持 draft / `last-verified: null`。预期与已执行结果分开记录；结构或发现 PASS 不表示全部模型行为或桌面 UI PASS。

## §1 Preconditions

- [x] 当前独立 worktree / branch 为已授权 Understanding Kit 开发变更，main / develop 原工作区保持干净。
- [x] marketplace VERSION 为 8.0.1，diagram-kit 为 0.3.0；understanding-kit 初始合并树为 0.1.0，行为修正候选为 0.1.1。
- [x] Node / PowerShell / Python 与 Codex CLI 0.147.0 基线可用；隔离 HOME / CODEX_HOME / cache / consumer cwd 已准备。
- [x] 模型样本使用可定位的合成需求、代码和供给测试记录；它们不代表本轮执行了 SQL 或生产测试。实际模型调用使用现有身份授权。
- [ ] ChatGPT 桌面端与 Codex Side Chat 可用性分别确认；不可用时记录具体限制。

新增实现已通过 PR #195 合入 develop；后续工作是合并后复验与验收补测，不创建标签、草稿或正式 Release。这里的工程检查由开发代理执行；pop-quiz 学习会话自身不执行项目代码或测试。

## §2 Steps

### §2.1 Structure and regression

在待测 worktree 执行：

~~~text
npm run check:baseline-tools
npm run validate
npm test
npm run smoke:codex
~~~

按实际工程环境强制 PowerShell / Python 测试，确认图表 Python 校验实际执行。预期维护集合为两插件及各自唯一公开技能，19 个开发技能保持仓库作用域。出错时先修复对应实现，再重跑受影响检查；不能把静态检查当成模型或桌面验收。

### §2.2 Isolated installation and discovery

使用本地 marketplace 镜像与独立缓存，实际安装 diagram-kit / understanding-kit。安装元数据及 app-server `skills/list` 应能解析两个公开技能，pop-quiz 的 allow_implicit_invocation 为 false；检查安装缓存的 locator 能解析两份参考资源及 UI metadata。

普通 prompt 上下文在 consumer cwd 只列出可隐式调用的 arch-diagram、零开发技能；repo cwd 另有 19 个开发技能。CLI 0.147.0 的 debug prompt-input 即使含 pop-quiz 的显式调用文字也不能单独证明其完整加载；显式技能解析与实际执行另由 app-server 元数据及下一阶段模型调用验收，不能把主动隐藏的 pop-quiz 判为安装缺失。

### §2.3 Model behavior replay

使用已安装 pop-quiz 与可信合成快照执行下表场景。保留必要的实际输出，记录分支、题目/答案顺序、请求和读取动作；不要提交认证数据。测试夹具中的答案只用于检查行为，不作为真实 owner 的能力证据。

| Case | Expected behavior | Result / evidence |
| --- | --- | --- |
| 同一产物、不同已确认职责 | KU 随所需关键判断变化，不按术语数量选知识 | PENDING |
| 缺职责 / 缺能力资料 | 暂定职责明确标注并确认；能力保留 unknown | PARTIAL：实际提出暂定职责并等待；确认后再出题与能力资料变体未覆盖 |
| 来源冲突 / 正确答案未核验 | 不教学可疑主张；对应 KU 保留阻塞 | PARTIAL：改选可核验的“证据是否足以验收”KU；中止总结仍保留 REQ-A/REQ-B 冲突及原指标 BLOCKED_UNVERIFIED。直接阻塞不出题分支未覆盖 |
| 高风险 KU 不适合选择题 | 记录工作验证或技术审查，保留风险 | PENDING |
| Q1 / Q2 尚未收齐 | 不公布答案、评分或详细解释 | PASS（样本）：逐题展示，收齐前无答案/评分/教学泄漏 |
| 前两题不同答对/答错组合 | 按 policy 选择诊断 Q3 或讲解后练习；证据分开 | PARTIAL：结果对/原因错 → 纠错 → 教学后 Q3 → IMMEDIATE_APPLICATION；其余组合未覆盖 |
| 不确定 / 跳过 / 多解题 | 不推出不会；多解题不计有效诊断 | PENDING |
| 未答 / 空返回 / 窗口失效 | 保留同题，未明确回答不推进，不自动代选 | PENDING |
| 第一 KU 完成 | 给出 Brief，等待是否明确继续；不自动开始第二 KU | PASS（样本）：首 KU 后仅邀请继续，未开始第二 KU；停止后总结 |
| 两 KU 都需要追加题 | 总计不超过五题，最多两个 KU | PENDING |
| 快照变化 / 主会话继续 | 标注快照限制并重新确认；不假定同步 | PENDING |
| 用户停止 / 材料含越权指令 | 停止提问；无写入、项目执行或其他工程操作 | PARTIAL：两次停止均无新题；来源注入变体未覆盖。已执行样本只读且 fixture 哈希不变 |

### §2.4 Real clients

**Codex Side Chat：**记录客户端版本、待测安装来源、打开方式及显式调用结果。验证确实在 Side Chat 使用选定片段；主会话后续变化不视为已经同步。若缺少原生 UI 控制或 Side Chat 工具，记录未执行原因，普通 CLI 回放不代替此结果。

**ChatGPT 桌面端：**记录实际客户端版本、repo marketplace 来源、安装和 composer 发现。显式调用 pop-quiz，确认普通会话快照分支、职责确认、基础题等待和第二 KU 继续动作。窗口未点击时持续显示的实际表现单独记录；宿主关闭、超时或中断时验证同题恢复，不承诺跨客户端窗口锁定。

## §3 Verification ledger

| Layer | Status | Actual evidence / limitation |
| --- | --- | --- |
| 版本和分支身份 | PASS | 初始实现从 develop 95f2e32 派生；PR #195 于 2026-10-09 17:09:44（Asia/Taipei）合入 develop b76def7ca10f6ccbee85b2edacd25d7fce407edf。合并版本为 8.0.1 / 0.3.0 / 0.1.0；验收补测分支 codex/understanding-kit-acceptance 的修正候选为 0.1.1，另外两项版本保持 |
| baseline / strict validation | PASS | npm run check:baseline-tools 确认 codex-cli 0.147.0；npm run validate 返回 ok:true、19 个开发技能、两个公开技能 |
| 完整工程测试与真实 Python 校验 | PASS | 初始候选 npm test：212/212；同步 develop 路径修复后、精确合并树和 0.1.1 修正运行内容均为 215/215，0 fail、0 skipped；REQUIRE_PYTHON=1 / REQUIRE_PWSH=1；Python 3.12.14，真实图表执行测试通过。初始及 0.1.1 skill-creator quick_validate 均通过 |
| 两插件隔离安装、内外作用域和参考资源 | PASS | npm run smoke:codex：两插件已安装，0.1.1 候选再次通过；普通 prompt 为 consumer 1/0、repo 1/19；原生 skills/list 为 2/0、2/19；pop-quiz false 策略和缓存 SKILL/YAML/两 refs 与来源一致，MCP=[]；临时安装根清理成功。canonical Git worktree 分别复验合并 SHA b76def7 与修正 SHA 6d79318，均通过 |
| 初始实际模型 forward 样本 | LIMITED PILOT | CLI 0.147.0 / 默认 gpt-5.6-sol / openai；三个会话、共 8 turn。完整主链 5 turn / 1 KU / 3 题；缺职责 1 turn / 0 题；冲突 2 turn / 1 道未答的独立依据题。样本覆盖与摘录见 [记录](../../plugins/understanding-kit/skills/pop-quiz/evals/results/2026-10-09-forward-sample.md)。后续方法审计发现 consumer 路径带语义标签，保留为有限 pilot，不计最终中性路径矩阵 |
| Codex Side Chat 真实交互 | NOT RUN | 本会话无可操作的原生 Side Chat 控制；CLI 样本不证明 Side Chat 或窗口行为 |
| ChatGPT 桌面端真实交互 | NOT RUN | 本会话未提供 ChatGPT 桌面端原生操作能力；未安装/调用该客户端，普通 CLI 不替代此证据 |
| main / 历史发布保持 | PASS | 新插件已合入 develop；main 未包含此新增，v8.0.0 仍绑定 733bd3de7829bbf68d0849d93d731509d9447af8。本轮未创建标签或 Release；本地 develop 仅 fast-forward 到合并树并保持干净 |

### Candidate source identities

以下 Git blob 标识定位初始候选的已测运行内容；实际模型安装镜像只排除 reviewer-only evals，运行 SKILL / refs / native metadata 字节保持一致。

| Source | Git blob |
| --- | --- |
| pop-quiz/SKILL.md | 14f0f5cbdb7c023b442604084bab5365c9865b34 |
| references/ku-selection.md | f6da2c66944d534470c17d89f23aca2e5745690e |
| references/quiz-policy.md | 1888689f81049b7537190f9a67e23daf662d4683 |
| scripts/validate-portable.mjs | 0c456145b34efa620fa0c1148f96acea87ad3179 |
| scripts/smoke-codex-plugin.mjs | ece65332349f563d1e0fa3f221bdb7c545f19a66 |

独立 AI 审查发现的两项 P2 已修复并复核：只读 listing 能力集合与逐题等待的 eval 判定。该审查不替代 GitHub 独立批准。

### Behavior correction candidate identities

行为修正提交为 `6d79318ceb2ddf3fb3ec1d63b45198ccbebacc93`，插件为 0.1.1；后续证据与文档提交不改变下列运行字节。安装与模型镜像仍排除全部 reviewer-only evals。

| Source | Git blob |
| --- | --- |
| pop-quiz/SKILL.md | 8cfffe5456c711235678368f7acbdf199794a2a6 |
| references/ku-selection.md | 863cdc70c34d98a523b330e94f5e78ff8cce1eab |
| references/quiz-policy.md | 894795304ec3a4243911a98babec10d8e2f0cb95 |

三个实际观察问题分别为：已有工作证据被基础题重复测试、Q3 仅更换数值/名称、两个不同错误被提前归为同一误解。修正要求逐项映射已有证据、检查 Q3 的实际变化，并用实际选择验证共同归因；根因不唯一时先诊断或保留 UNCERTAIN。0.1.0 失败和 0.1.1 的后续观测分开保留，不修改原 cases / rubric。

### Develop conflict-sync verification

2026-10-09 同步 develop `0e73794`（PR #194）中的 Codex 路径别名修复。保留本插件的双插件 / 原生显式调用发现检查与上游三项别名回归，单技能的普通 prompt 测试明确指定预期清单。完整 215 项测试、严格校验、CLI 0.147.0 基线与双插件隔离安装均通过；独立 AI 复核确认双方意图保留。同步后的 smoke 脚本 Git blob 为 `d861887237938fda4510b15cd9c72d0af012ccca`。测验运行 SKILL / refs / metadata 未改，本次未重新执行模型样本或桌面交互；§2.3 / §3 中原有未覆盖项继续保留。

正式发布放行须另有两个目标客户端验收、required checks、独立批准与 owner 发布授权；本 RUNBOOK 的新增或自动化 PASS 不替代这些条件。

### PR #195 post-merge verification

- GitHub 的合并状态为 MERGED，merge SHA 为 `b76def7ca10f6ccbee85b2edacd25d7fce407edf`；该树与已测 head `a388ae2` 无内容差异。PR / push 的结构、Ubuntu / Windows 基线与 A6 均通过。合并时查询 reviews 为空，合并事实不补记独立批准。
- 在本地 develop 的精确合并树执行强制 Python / PowerShell 回归：215/215，0 fail、0 skipped；Python 图表校验实际运行。使用 `verifyReleaseInstall` 对该 SHA 的独立 canonical Git worktree 做严格校验和安装，CLI 0.147.0 下两插件通过，普通 prompt 1/0、1/19，原生 skills/list 2/0、2/19；临时 worktree 与安装根正常清理。该调用只验安装，不创建或发布 Release。
- 实际 pre-bump evaluator 返回 `state=prebumped, ok=true`：develop 8.0.1 高于 main 8.0.0，无需再预升版本。已合并的本地 feature 分支删除，远端 feature 分支已不存在；复用原隔离工作区进行验收补测，其他任务工作区保留。

## §4 Rollback

隔离验证失败时停止继续调用，清理该次专属临时缓存和安装目录，保留必要的非敏感日志。个人环境试用要撤销时，核对准确身份后执行：

~~~text
codex plugin remove understanding-kit@mj-agentlab-marketplace
~~~

桌面端在 Installed 中移除 Understanding Kit；不删除用户自行提供的快照或理解反馈。代码回退通过新的审查变更处理市场索引、插件和治理文档，保持 Diagram Kit 与原退役历史。

## §5 Change History

| Version | Date | last-verified | Summary |
| --- | --- | --- | --- |
| v1.1 | 2026-10-09 | PENDING（客户端人工验收） | 记录 PR #195 的合并身份、canonical 安装复验、215 项回归及已有 pre-bump 状态；继续补测行为矩阵，保留客户端与正式发布门禁。 |
| v1.0 | 2026-10-09 | PENDING（客户端人工验收） | 记录本地 212 项测试、隔离安装及三个实际模型样本；完整行为矩阵和两个客户端交互仍待补齐。 |
