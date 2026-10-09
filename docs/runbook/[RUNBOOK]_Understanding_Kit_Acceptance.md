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

2026-10-09 PR #195 已合入 develop，并完成精确合并树的本地复验；后续同步 #196，保留 Explain Kit。0.1.1 的 19 个中性路径 forward 变体为 18 个 scoped PASS、1 个 UNEXERCISED，额外 forward 重试仍未覆盖该分支，独立历史状态回放另记 PASS。初始失败与带标签路径 pilot 保留，不作为最终协议验收。真实客户端人工验收尚未完成，因此保持 draft / `last-verified: null`。结构或发现 PASS 不表示全部模型行为或桌面 UI PASS。

## §1 Preconditions

- [x] 当前独立 worktree / branch 为已授权 Understanding Kit 开发变更，main / develop 原工作区保持干净。
- [x] marketplace VERSION 为 8.0.1，diagram-kit 为 0.3.0，explain-kit 为 0.1.0；understanding-kit 初始合并树为 0.1.0，行为修正候选为 0.1.1。
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

按实际工程环境强制 PowerShell / Python 测试，确认图表 Python 校验实际执行。当前维护集合为三个插件、四个公开技能，19 个开发技能保持仓库作用域。出错时先修复对应实现，再重跑受影响检查；不能把静态检查当成模型或桌面验收。

### §2.2 Isolated installation and discovery

使用本地 marketplace 镜像与独立缓存，执行 diagram-kit、explain-kit 单独安装、两者组合及三个插件组合。三插件场景的安装元数据及 app-server `skills/list` 应能解析四个公开技能，pop-quiz 的 allow_implicit_invocation 为 false；检查安装缓存的 locator 能解析两份参考资源及 UI metadata。

三插件场景的普通 prompt 上下文在 consumer cwd 列出可隐式调用的 arch-diagram、glossary、concept，零开发技能；repo cwd 另有 19 个开发技能。CLI 0.147.0 的 debug prompt-input 即使含 pop-quiz 的显式调用文字也不能单独证明其完整加载；显式技能解析与实际执行另由 app-server 元数据及下一阶段模型调用验收，不能把主动隐藏的 pop-quiz 判为安装缺失。

### §2.3 Model behavior replay

使用已安装 pop-quiz 与可信合成快照执行下表场景。consumer/cwd/source path 均用中性随机身份，安装镜像排除全部 evals；保留必要实际输出、原始失败、未覆盖项及执行层级，不提交认证数据。测试夹具中的答案只用于检查行为，不作为真实 owner 的能力证据。下表为当前 0.1.1 实际路径；完整计数、版本和逐题摘录见 [最终矩阵](../../plugins/understanding-kit/skills/pop-quiz/evals/results/2026-10-09-post-merge-matrix.md)。

| Case | Expected behavior | Result / evidence |
| --- | --- | --- |
| 同一产物、不同已确认职责 | KU 随所需关键判断变化，不按术语数量选知识 | PASS：developer 检订单粒度；requirement owner 检业务口径、排除与保留边界 |
| 缺职责 / 缺能力资料 | 暂定职责明确标注并确认；能力保留 unknown | PASS：暂定职责 → 未确认回复仍等待 → 明确确认后才 Q1；未推断能力 |
| 已有理解证据 | 默认 KU 优先尚未覆盖的重要判断 | PASS：已支持的连接粒度/实体身份作前提，两题改测回归组合及其故障覆盖 |
| 来源冲突 / 正确答案未核验 | 不教学可疑主张；对应 KU 保留阻塞 | PASS（SUPPORTED_ALTERNATIVE）：证据充分性 KU 可核验，Brief 保留 REQ-A/REQ-B、原指标 BLOCKED_UNVERIFIED 与权威裁决需求。最终中性批次 direct-block/no-question 未覆盖 |
| 高风险 KU 不适合选择题 | 记录工作验证或技术审查，保留风险 | PASS：概念题完成后保留跨租户风险、实际工作验证及独立技术审查，不以答对批准上线 |
| Q1 / Q2 尚未收齐 | 不公布答案、评分或详细解释 | PASS：逐题展示与回答锁定；明确要求概念教学时终止独立诊断，随后答案另标练习证据 |
| 前两题不同答对/答错组合 | 按 policy 选择诊断 Q3 或讲解后练习；证据分开 | PASS：对/对、对/错、错/对和含混错/错实际覆盖；明确同源错/错两次 forward 均 UNEXERCISED，独立 STATE_REPLAY 纠错及新操作 Q3 另记 PASS，不计 forward 通过 |
| 不确定 / 跳过 / 多解题 | 不推出不会；多解题不计有效诊断 | PASS：不确定保留 UNCERTAIN，跳过保留 UNASSESSED 并计数；快照失效旧题标 INVALID_ASSESSMENT。实际多解题恢复分支未覆盖 |
| 未答 / 空返回 / 窗口失效 | 保留同题，未明确回答不推进，不自动代选 | PASS（明确未答回复）：保留同一 Q1；原生空返回、超时、窗口关闭/持续显示 NOT_RUN |
| 第一 KU 完成 | 给出 Brief，等待是否明确继续；不自动开始第二 KU | PASS：首 KU 仅邀请继续；没有自动进入第二 KU |
| 两 KU 都需要追加题 | 总计不超过五题，最多两个 KU | PASS：实际 3+2；第二 KU 明确继续后开始，第五题后保留有限诊断，无第六题 |
| 快照变化 / 主会话继续 | 标注快照限制并重新确认；不假定同步 | PASS：harness 提供 r2 后更新资格规则，旧 Q1 失效且计入 3/5；没有假定跨会话同步 |
| 用户停止 / 材料含越权指令 | 停止提问；无写入、项目执行或其他工程操作 | PASS：明确停止后无新题；实际读取不可信备注，未执行其指令。fixture/runtime 字节保持 |

### §2.4 Real clients

**Codex Side Chat：**记录客户端版本、待测安装来源、打开方式及显式调用结果。验证确实在 Side Chat 使用选定片段；主会话后续变化不视为已经同步。若缺少原生 UI 控制或 Side Chat 工具，记录未执行原因，普通 CLI 回放不代替此结果。

**ChatGPT 桌面端：**记录实际客户端版本、repo marketplace 来源、安装和 composer 发现。显式调用 pop-quiz，确认普通会话快照分支、职责确认、基础题等待和第二 KU 继续动作。窗口未点击时持续显示的实际表现单独记录；宿主关闭、超时或中断时验证同题恢复，不承诺跨客户端窗口锁定。

## §3 Verification ledger

| Layer | Status | Actual evidence / limitation |
| --- | --- | --- |
| 版本和分支身份 | PASS | 初始实现从 develop 95f2e32 派生；PR #195 于 2026-10-09 17:09:44（Asia/Taipei）合入 develop b76def7ca10f6ccbee85b2edacd25d7fce407edf。合并版本为 8.0.1 / 0.3.0 / 0.1.0；验收补测分支 codex/understanding-kit-acceptance 的修正候选为 0.1.1，另外两项版本保持 |
| baseline / strict validation | PASS | codex-cli 0.147.0；初始双插件树为两个公开技能，同步 #196 后 npm run validate 返回 ok:true、19 个开发技能、四个公开技能 |
| 完整工程测试与真实 Python 校验 | PASS | 初始候选 npm test：212/212；同步路径修复后、精确 #195 合并树和双插件 0.1.1 候选均为 215/215；同步 #196 与版本夹具修正后 230/230，0 fail、0 skipped。REQUIRE_PYTHON=1 / REQUIRE_PWSH=1；Python 3.12.14，真实图表执行测试通过。初始及 0.1.1 skill-creator quick_validate 均通过 |
| 两插件隔离安装、内外作用域和参考资源 | PASS | npm run smoke:codex：两插件已安装，0.1.1 候选再次通过；普通 prompt 为 consumer 1/0、repo 1/19；原生 skills/list 为 2/0、2/19；pop-quiz false 策略和缓存 SKILL/YAML/两 refs 与来源一致，MCP=[]；临时安装根清理成功。canonical Git worktree 分别复验合并 SHA b76def7 与修正 SHA 6d79318，均通过 |
| 初始实际模型 forward 样本 | LIMITED PILOT | CLI 0.147.0 / 默认 gpt-5.6-sol / openai；三个会话、共 8 turn。完整主链 5 turn / 1 KU / 3 题；缺职责 1 turn / 0 题；冲突 2 turn / 1 道未答的独立依据题。样本覆盖与摘录见 [记录](../../plugins/understanding-kit/skills/pop-quiz/evals/results/2026-10-09-forward-sample.md)。后续方法审计发现 consumer 路径带语义标签，保留为有限 pilot，不计最终中性路径矩阵 |
| 0.1.1 中性路径实际 forward 矩阵 | PARTIAL COVERAGE | 19 fresh 变体 / 78 turn / 44 展示题：18 scoped PASS、明确同源错误分支 1 UNEXERCISED；额外 fresh forward 重试 4 turn / 3 题仍 UNEXERCISED。合计 20 forward 会话 / 82 turn / 47 题；版本、输入隔离、逐题输出、工具与清理见 [矩阵](../../plugins/understanding-kit/skills/pop-quiz/evals/results/2026-10-09-post-merge-matrix.md) |
| 明确同源错误历史状态回放 | PASS（STATE_REPLAY） | 独立构造的历史两题与两次兼容错选，真实继续 3 turn / 1 道新 Q3；定向纠错、新操作练习及 IMMEDIATE_APPLICATION 通过。历史两题计回放预算，不计新 forward 题；不能补记该 forward 分支 PASS |
| #196 三插件集成安装 | PASS | 四种隔离安装场景：diagram 单独、explain 单独、两者组合、全部三插件；普通 public 数依次 1/2/3/3，原生 1/2/3/4，仓库外开发技能 0、内 19。包身份/版本、完整原生提示、缓存资源字节与显式策略通过，MCP=[]；安装缓存 Python 图表实际扫描 1 张图，FAIL 0、WARN 0 |
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
| agents/openai.yaml | 7b0d857a51a796ffba52246fa346263f2662cdcd |

三个实际观察问题分别为：已有工作证据被基础题重复测试、Q3 仅更换数值/名称、两个不同错误被提前归为同一误解。修正要求逐项映射已有证据、检查 Q3 的实际变化，并用实际选择验证共同归因；根因不唯一时先诊断或保留 UNCERTAIN。0.1.0 失败和 0.1.1 的后续观测分开保留，不修改原 cases / rubric。

### Develop conflict-sync verification

2026-10-09 同步 develop `0e73794`（PR #194）中的 Codex 路径别名修复。保留本插件的双插件 / 原生显式调用发现检查与上游三项别名回归，单技能的普通 prompt 测试明确指定预期清单。完整 215 项测试、严格校验、CLI 0.147.0 基线与双插件隔离安装均通过；独立 AI 复核确认双方意图保留。同步后的 smoke 脚本 Git blob 为 `d861887237938fda4510b15cd9c72d0af012ccca`。测验运行 SKILL / refs / metadata 未改，本次未重新执行模型样本或桌面交互；§2.3 / §3 中原有未覆盖项继续保留。

正式发布放行须另有两个目标客户端验收、required checks、独立批准与 owner 发布授权；本 RUNBOOK 的新增或自动化 PASS 不替代这些条件。

### PR #195 post-merge verification

- GitHub 的合并状态为 MERGED，merge SHA 为 `b76def7ca10f6ccbee85b2edacd25d7fce407edf`；该树与已测 head `a388ae2` 无内容差异。PR / push 的结构、Ubuntu / Windows 基线与 A6 均通过。合并时查询 reviews 为空，合并事实不补记独立批准。
- 在本地 develop 的精确合并树执行强制 Python / PowerShell 回归：215/215，0 fail、0 skipped；Python 图表校验实际运行。使用 `verifyReleaseInstall` 对该 SHA 的独立 canonical Git worktree 做严格校验和安装，CLI 0.147.0 下两插件通过，普通 prompt 1/0、1/19，原生 skills/list 2/0、2/19；临时 worktree 与安装根正常清理。该调用只验安装，不创建或发布 Release。
- 实际 pre-bump evaluator 返回 `state=prebumped, ok=true`：develop 8.0.1 高于 main 8.0.0，无需再预升版本。已合并的本地 feature 分支删除，远端 feature 分支已不存在；复用原隔离工作区进行验收补测，其他任务工作区保留。

### Parallel develop synchronization

验收期间 #196 合入 develop `1999fb43c6e016f9844d3e9bd3e324e8bc248736`，新增 explain-kit 0.1.0。普通 merge `bef24cb` 保留三插件/四公开技能、上游安装与身份校验，逐块合并 AGENTS、README 和版本指南。测试夹具改用同一个 manifest 版本构造技能路径与安装清单，消除 Understanding Kit 0.1.1 与硬编码 0.1.0 的分离；既有 alias、native metadata 和错误版本负例保留。16 个对应测试、强制 Python/PowerShell 的 230 项完整测试、严格校验与四场景 smoke 均实际通过。测验四份运行文件与已测 `6d79318` 完全一致，不重复模型会话或追认桌面结果。

## §4 Rollback

隔离验证失败时停止继续调用，清理该次专属临时缓存和安装目录，保留必要的非敏感日志。个人环境试用要撤销时，核对准确身份后执行：

~~~text
codex plugin remove understanding-kit@mj-agentlab-marketplace
~~~

桌面端在 Installed 中移除 Understanding Kit；不删除用户自行提供的快照或理解反馈。代码回退通过新的审查变更处理市场索引、插件和治理文档，保持 Diagram Kit 与原退役历史。

## §5 Change History

| Version | Date | last-verified | Summary |
| --- | --- | --- | --- |
| v1.1 | 2026-10-09 | PENDING（客户端人工验收） | 记录 #195 合并复验、0.1.1 修正与 19 个中性 forward 变体，保留 pilot 失败/路径限制、未覆盖及独立状态回放；同步 #196，230 项回归与四场景安装通过，客户端和正式发布门禁继续保留。 |
| v1.0 | 2026-10-09 | PENDING（客户端人工验收） | 记录本地 212 项测试、隔离安装及三个实际模型样本；完整行为矩阵和两个客户端交互仍待补齐。 |
