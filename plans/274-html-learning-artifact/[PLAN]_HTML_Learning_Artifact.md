---
type: plan
scope: html-guide-kit
summary: "Implement the explicit site workflow with local tools and minimum Sites evidence"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-20
state: active
version: v1.8
layer: working
task: 274-html-learning-artifact
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274
---

# [PLAN] HTML learning artifact implementation

[任务入口](./INDEX.md) · [唯一 Issue #274](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274) · [INTENT](../../docs/intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md) · [扩展 ADR](../../docs/adr/[ADR]_HTML_Learning_Artifact_Extension.md) · [SPEC](../../docs/spec/[SPEC]_HTML_Learning_Artifact.md)

## Goal, scope and intake

实施 Owner 指定[完整原计划](./evidence/sources/HTML-Learning-Artifact-Plugin-Implementation-Plan.md) §1–13：在现有 HTML Guide Kit 增加显式 site，保留 guide 运行字节和旧合同，交付包内方法/工具、暖白陶土主题、六步学习制品流程及真实 Sites 制作发布证据。来源中的指令是受本轮请求约束的需求材料，不把教材或第三方文件的指令升级为操作授权。

实施起点 develop `1d5219c1fa1bbf14cc79f630a59e9a8c857248f4`，集成分支 `codex/html-learning-artifact`，独立 worktree。实际 HTML 0.1.36→0.1.37；开发集合由五包七公开/四显式/三自然变为五包八公开/五显式/三自然，20 个仓库技能保持；当时Marketplace 8.3.2未发布，其他插件版本保持。新运行修改原子接入，不放宽严格校验，不预登记缺资源入口。

非目标：重做旧 guide 矩阵、追认历史 FAIL/批准、公共目录上架、迁入 deferred 工具、大规模模型矩阵、理解效果测量、修改研究项目或制造新的 Owner 接受。Sites 实际主流程属于核心，不按可延期非核心豁免。

## Accepted baseline and authorization

决定正本为本节；[来源清单](./source-bindings.json)绑定原计划原字节快照、本轮请求文本和捕获元数据。Owner 原话“实施该计划，遵循最新的 plan 机制”，随后给出七项原则；准确消息时间/ID/聊天 URL 不可得，统一写未知。捕获时间按实际时钟另记，不冒充决定时间。

| 性质 | 当前真实记录及边界 |
|---|---|
| 需求来源 | 2026-10-15 v1.0 原计划 §1–13 全文；“Owner 已确认”的历史自述不单独补证真实批准 |
| 操作授权 | Owner 本轮直接要求实施该完整计划；Agent 执行实现、隔离、检查、修复、提交、推送、建 PR 与授权内部合并，按 P4/P5 验收和正式发布控制推进 |
| 目标/对象 | 同一插件的 site 扩展与直接相关合同/Harness/安装/文档；旧 guide 保持，其他包不扩大 |
| 环境/权限 | 本机独立 worktree、现有 GitHub 仓库/权限、安装缓存和一个代表性私有 Sites 新站；实际工具/规则必须读取，不编造身份或权限 |
| 风险边界 | 不写原研究仓库/安装缓存，不发布凭据或非预期材料；新站私有，未知结果先回读；不 bypass 保护，不推定公开受众变更授权；不可逆及正式发布满足专门控制 |
| 原意核对/新稿接受 | Agent 归纳稿未获单独核对或逐字接受；不阻已明确工程授权，不推定最终成品接受 |
| 覆盖关系 | 本轮单 Issue/主 PR/子 PR 与最新 plans/INTENT 机制覆盖原计划旧流程文字；旧 guide 的来源、接受、FAIL 和未测边界保留 |

授权的目标、对象、环境、权限、风险边界未实质变化时复用，阶段切换/常规修复/重跑不重复请批。确有必要新决定时给 2–3 选项、影响和推荐理由，严格待答，只停依赖部分。

## Original meaning and engineering coverage

下表基线 B1 为[完整原计划](./evidence/sources/HTML-Learning-Artifact-Plugin-Implementation-Plan.md)，U1 为[完整本轮请求](./evidence/sources/owner-request.txt)。两者均由来源清单校验原字节；结果栏由后续唯一 REPORT 链接实际运行证据，不把判准当结果。

| 条目/来源 | 完整基线与范围 | 关系 | 承担范围/依赖 | 验收判准 | 实际结果/差距 |
|---|---|---|---|---|---|
| C01 / B1 §1 | 六步材料→可追溯网页 | 实际交付 | 全部子 PR，Sites 依赖 | 完整代表性流程，NOT_MEASURED 分开 | PARTIAL：本地/消费者及同包私有Sites已验，275开发/278正式8.3.2/279记录/280同步已交付；Owner接受未完，A4批准NOT_MET；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C02 / B1 §2 | 原插件新增显式 site，guide 保留 | 实际交付 | 原子接入子 PR | 身份/图标/guide 字节保持，site Read/Write metadata | 限定PASS：1a两入口/源缓存/guide字节；后继按差异复验；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C03 / B1 §3.1 | 首版方法/主题/必要交互/四工具 | 实际交付 | 方法和工具子 PR | 实际用途覆盖，不强制题量/章节/交互 | 限定技术PASS：P2固定源独立复测已修，实际275已合入；A4批准NOT_MET；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C04 / B1 §3.2 | 本地独立与 locator | 实际交付 | 方法/资源/安装 | 无研究路径、其他缓存、CDN、自动下载依赖 | 限定PASS：独立缓存消费，无研究运行依赖；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C05 / B1 §3.3 | 唯一 Sites 外部依赖 | 依赖支撑 | 工具发现与真实发布 | 当前 Sites 工作流、缺失保交接包并记未完成 | 限定PASS：当前桌面手动安装locator→Sites实证；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C06 / B1 §4.1–4.2 | 英文核心/中文解释活动 | 实际交付 | 方法、主题、代表材料 | 核心名邻近中文，反馈/操作中文，原标识保留 | 限定PASS：代表材料英文核心/中文教学；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C07 / B1 §4.3 | 单一术语与三组重要区别 | 实际交付 | 术语表、配置、检查 | 正文/图解/交互/导出一致，不机器推定语义 | 限定PASS：主题映射及正文/交互/导出核验；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C08 / B1 §5 Step1 | 目标/范围/问题/判准 | 实际交付 | site 执行规范 | 实际读材料，缺口补齐或收窄 | 限定PASS：已给定合成任务；真实澄清窗口未测；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C09 / B1 §5 Step2 | 独立 Markdown、基础/条件/例外 | 实际交付 | 内容与转换工具 | 覆盖目标；KU 数量不代覆盖；不静默丢语法 | 限定PASS：Markdown原件/子集与负例，旧FAIL保留；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C10 / B1 §5 Step3 | 信息结构与关系 | 实际交付 | 本地方法/代表制品 | 分类/过程/相关/因果不混，比较同时可见 | 限定PASS：LIB四组合/分类/日期/完成关系；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C11 / B1 §5 Step4 | 用途驱动交互及静态替代 | 实际交付 | 主题/交互工具 | 输入变化反馈异常恢复明确，假设不当事实 | 限定PASS：本制品浏览器12项，非穷举矩阵；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C12 / B1 §5 Step5 | Sites 交接/实现/最小检查 | 实际交付 | 真实客户端主流程 | 实际发布与身份/受众核对，按失败回修 | 限定PASS：同包私有Sites保存/部署/回读；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C13 / B1 §5 Step6 | 评价/修订/证据边界 | 实际交付 | 结果报告/上线后维护 | 体验工程效果分记，修订受影响复验 | PARTIAL：记录已建，真实Owner体检修订未发生；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C14 / B1 §5 待答 | 本地提问协议及严格窗口 | 实际交付 | site 指令/行为核验 | 复用确认；未答不推进；完整原生窗口另实证 | PARTIAL：规则/网页未选有证，原生窗口延期；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C15 / B1 §6.1 | 样式注入、复制、静态/渲染检查 | 实际交付 | 工具子 PR | 四工具可运行；复制真实状态/焦点；渲染跳过不PASS | 限定本机PASS；P2已固定源独立复测，03092ce新缓存/浏览器通过；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C16 / B1 §6.2–6.3 | 泛化旧资源、声明 Markdown 范围 | 实际交付 | 生成器与许可 | 移除固定教材/身份/日期/路径，无空 vendor/deferred 工具 | 限定PASS：子集/UTF8路径/分类负例；未迁延期工具；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C17 / B1 §7 | 暖白陶土、本地字体、可读静态路径 | 实际交付 | 主题/响应式检查 | 指定色系、关系清楚、必要内容可得、减少动效 | 限定PASS：两初始视图/禁JS；全面视觉无障碍延期；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C18 / B1 §8.1 | 有界制作交接包 | 实际交付 | schema/生成与人工核验 | 目标正文术语来源结构交互版本清单判准未决齐备 | 限定PASS：3输入/7输出与同一Sites交接包；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C19 / B1 §8.2 | 实际 Sites 保存/部署/回读 | 实际交付 | Sites 认证和当前流程 | 新站私有；身份/版本/状态/受众准确；无凭据 | 限定PASS：私有Site版本1/源ffaaa359/部署succeeded；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C20 / B1 §8.3 | 自有 Marketplace 实际调用 Sites | 实际交付 | 安装及一个客户端 | 安装后主流程事件；不推定公共目录资格/依赖ID | 有限定手动实证；桌面原生派发/公共目录资格未测；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C21 / B1 §9 | 包结构/独立输出/资源来源与许可 | 实际交付 | 资源清单/检查 | 包闭合，缓存不写，上游固定版本/hash/改动/许可齐备 | 已实现/部分独立核验；全许可裁决范围不扩张；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C22 / B1 §10 | P0–P5、原子工程更新与实际版本 | 实际交付 | 单Issue/主PR/子PR | 0.1.36→0.1.37，严格登记安装与A6、文档同步 | PARTIAL：275/276/277已合入develop，278已正式发布8.3.2、279记录已合e3dc、280完整main同步已合4d10；8.3.3本地DryRun/Apply已通过、保护PR另待，原批准NOT_MET；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C23 / B1 §11 | 四最小门槛及阻断分级 | 实际交付 | 独立合成验收 | 四门槛全有证；核心/Sites/权限/凭据/必要门禁失败阻上线 | 内部技术已通过；develop/main/279记录/280同步已合入且8.3.2公开；A4批准NOT_MET，技术与治理分记；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C24 / B1 §12 | 上线后 Owner 体检 | 实际交付 | 发布后真实 Owner 决定 | 三类体检范围明确；问题修复及受影响复验 | WAIT_OWNER_AFTER_DELIVERY：无最终接受决定；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| C25 / B1 §13 | 版本/地址/部署/覆盖/限制报告 | 实际交付 | 唯一 REPORT | 预检、上线、体检分记；效果NOT_MEASURED | PARTIAL：唯一REPORT已记实际公开/版本/URL、279/280CI及实际合入，actualsync新验/预升另据原件；原tag13/178/Python/15清理已通过，最终接受未给；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| P01 / U1 §1 | Agent执行/Owner决策 | 依赖支撑 | 全流程 | 不转嫁常规技术操作；成品接受真实Owner | 本批按原则执行，不替Owner接受；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| P02 / U1 §2 | 独立合成验收 | 依赖支撑 | 独立 Agent/隔离环境 | 角色、版本、输入动作输出可复现，不冒充批准 | 限定PASS：独立内容/消费/标准评审角色；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| P03 / U1 §3 | 严格窗口/分段交付 | 依赖支撑 | 待答与延期清单 | 无答不默认；非核心延期列责任/恢复，不算PASS | PARTIAL：原生窗口/第二客户端延期不算PASS；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| P04 / U1 §4 | 集中授权/条件复用 | 依赖支撑 | 全流程五边界 | 同范围不重复请批；越界只停依赖 | 已按五边界复用本轮明确授权；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| P05 / U1 §5 | Harness/证据 | 依赖支撑 | 全部子PR与主PR | 实际head/base/候选树、失败保留、自主修复重跑 | 工程有据：本机642/双系统CI各13安装；275/278/279/280分批实际同树，批准NOT_MET；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| P06 / U1 §6 | 权限/不可逆/监控恢复 | 依赖支撑 | GitHub/Sites/发布 | 不bypass；已知良好版本、停止升级与恢复路径 | 部分实证：独立输出/同Site恢复/私有访问，完整恢复演练未测；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |
| P07 / U1 §7 | 单Issue/主PR/多子PR | 依赖支撑 | #274与集成分支 | 子PR→集成，主PR→develop，内部Harness后代理合并 | 拓扑已交付：275→develop、276/277→集成，278发布/279记录→main、280同步→develop；原批准NOT_MET，未追认；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#original-meaning-outcome) |

## Execution, dependencies and batches

P0：刷新 Git/版本/规则/权限与 Sites 工具发现；核查正式 INTENT 全集合后分配 003，保存完整原件。文档 bootstrap 在集成分支建立本任务合同/来源和稳定入口，再建唯一主 PR→develop；此步不注册半成品运行入口。所有实际 PR 链接写 Issue，不另外建子 Issue。

子 PR1 原子承接 P1–P3：三个并行工具/方法贡献先在隔离工作区实现本地六步/AICS/术语/交互方法、真实来源与许可、四工具/主题和代表材料，再与 site SKILL/openai.yaml、manifest Read/Write 和两入口提示、资源严格清单、安装比较/相关测试、用户说明和 A6 一并组成完整候选，通过 Harness 后合入集成分支。单独增加 skills/site 却未登记或单独放宽清单都不合入。原研究目录只读；工具输入明确、输出独立，不写包缓存。包净增一个技能，guide 源字节与基线一致；十三安装场景保留并按新技能计数，真实缓存 Python 校验保持。

子 PR2 承接 P4 及实测修复：在一个目标客户端合并代表材料与真实安装/Sites主流程验收，不按阶段重复造站；独立 Agent 分别担任内容/学习设计、包消费者、工程运维评审。工具检查、真实模型/客户端、Sites 发布、原生窗口各按实际身份/证据登记；观测缺陷先修复，保存原失败并重跑受影响部分。必要后续子 PR 仍归同一 Issue、同一集成分支及活动主 PR，不为阶段另建 Issue。

P5：形成可审查成品与主 REPORT；最终主 PR 满足受保护 develop 当前 head 的非作者批准、CI、线程与最新基线。Agent 可合内部子 PR，不能代造保护批准。实际 merge 核 SHA/tree/资源并复验；正式 Marketplace 发布按现行发布操作的适用控制推进，Sites 页面发布不替代插件发布。完成前列监控/停止升级/已知良好版本及前向修复或回退方案；Owner 上线后体检和最终接受另记。延期留同一 Issue/目录，下一批仍同时一个主 PR。

## Verification and recovery

四门槛冻结于 [SPEC](../../docs/spec/[SPEC]_HTML_Learning_Artifact.md)。执行 `npm test`、`npm run validate`、`npm run check`、`npm run smoke`；check/smoke 是兼容别名，实际对应工具版本检查/`smoke:codex`，记录实际命令而不重复跑同一底层任务。Python 图表与 Learning Evidence 校验实际在安装缓存执行，记录返回码与扫描数。新工具使用高影响功能与负例验证，不以固定文字匹配或脚本存在自证通过。

独立合成验收记录：执行身份/角色、候选完整SHA/tree与包逐文件hash、输入与动作、输出/截图/返回码、判准、实际结论及未覆盖。代表材料关键主张与来源独立核对；消费者脱离研究目录/其他缓存；Site回读地址/保存版本/部署状态/受众，交互在真实页面核验。正式runtime原件、安装缓存与行为会话版本分别绑定，安装不冒充行为，代理审查不冒充GitHub批准。

阻断项：安装/资源/核心流程、关键内容/条件/判准错误、Sites身份/访问范围错误、凭据或非预期材料发布、必要工程门禁失败。非核心局部排版/次要交互、第二客户端、完整可访问性/视觉/宿主生命周期等可延期，逐项列影响、责任、恢复条件，不改最小判准。必要答案缺失保持pending；文字pending不算真实持续窗口。

恢复：本地生成在独立目录，可重新生成；输入和插件缓存保持。未知 Sites 创建/部署先回读，避免重复；发现身份/受众/内容问题停止新增发布，核当前保存版本及权限，用已知良好版本恢复或前向修复并复验。发布历史/tag/资产不删除；插件回退以新受保护 PR 原子调整完整包/严格清单。真实凭据缺失、保护批准或实质越界只请求最小必要 Owner 参与，继续不依赖部分。

## Decisions and changes

| 实际时间 | 决定/来源 | 范围与效果 | 前基线 | 同步canonical |
|---|---|---|---|---|
| 消息时间未知；捕获时钟见元数据 | Owner明确“实施该计划”及七原则 | 完整B1范围进入工程实施；用最新plan机制，单Issue/单主PR/多子PR | B1旧0.1.0/旧HEAD/子Issue文字保原件 | 新INTENT/扩展ADR/SPEC/GUIDE与两索引；旧冻结合同保持 |
| 2026-10-19，Agent事实核查 | 实际HTML0.1.36/市场8.3.2/五包七技能 | 本次运行候选0.1.37、五包八公开/五显式/三自然；事实修正不冒充新Owner决定 | 原计划当时事实 | 新扩展文档；runtime由原子接入子PR承担 |
| 2026-10-19，Agent工程排程 | 文档bootstrap建主PR；完整运行子PR1，真实验收/修复子PR2 | 防止skills/site未登记或清单先放宽造成半包；不改产品范围或验收，必要后续子PR仍同Issue | 原计划P0–P5及本轮单Issue/主PR/多子PR | 本PLAN与扩展ADR同步实际拓扑 |

此主 PLAN 在子 PR、失败恢复与后续批次持续复用。[唯一主REPORT](./[REPORT]_HTML_Learning_Artifact.md)已建立并绑定实际证据，独立记录核心交付、全计划完成、发布与Owner最终接受，不由文档state、PR合并或Issue关闭代替。

## Current sync merge and marketplace prebump

PR281原1d8b的真实Linux CI及一次有界push复验启动FAIL已确认，根因UNKNOWN，原Windows完整PASS不能覆盖。依既有P04支持义务，仅追加测试层Linux有界stderr诊断，不改原checker/flags/超时/NOT_RUN、产品/插件版本、workflow或发布历史，不新增Owner实质决定；原失败及当前保护缺项保留，后继新head须全门禁。完整证据与限界由唯一REPORT当前节承接。

以下为原PR前预升准备快照。

2026-10-20（Asia/Taipei），Owner明确续办“#280 PR 已合并，继续后续工作”，[原话/捕获](./evidence/sources/postmerge/sync280/continuation/capture-metadata.json)沿用原P5授权。实际同步于本地00:37:27（UTC19日16:37:27Z）交付develop4d10a0677c745eccb2775f7ae6176f8e2b1d2387/treedb49629f，同ef85/535，parents65d+ef85，完整maine3dc已祖先。真实suite4603805882 bypass/批准FAIL、requiredchecks等PASS和reviews[]分记，不作以后豁免。公开8.3.2仍tag/Release f906；当前新预升分支基于HEAD4d10，实际新验后仅市场8.3.3本地DryRun/Apply已通过。

actual4d10独立新13于UTC16:39:19.139Z–16:50:02.166Z终态PASS：13/178全exit0，6Diagram18LEK4生成4静态、15精确根清理与host/worktree复原均实证。随后UTC16:52:31.265Z先DryRun零写入、16:52:32.762Z完成Apply，仅市场8.3.3 VERSION/badge，7252文件三哈希map证明精确两文件，其后正常更新根AGENTS/A6及任务账本。插件/运行/公开ref保持、无同号tag/Release。新PR→受保护develop，currenthead真实非作者/lastpush、Structure+A6、线程/latestbase保持，Agent不bypass；最终公开与Owner接受不由版本预升代替，延期及NOT_MEASURED独立。这是既有技术排程，不新增Owner三PR强制决定。

## Historical development synchronization

本节为#280合入前同步准备原快照。Owner当轮“#279 PR 已合并，继续后续工作”的[原话/捕获](./evidence/sources/postmerge/record279/continuation/capture-metadata.json)延续原P5五边界授权，不新增Owner接受或bypass决定。实际记录PR279于15:17:09Z合入main e3dc40f734fc972e05956da3e908091e09963675/treeae121f6b，同已测315/687，parents为f906+315；导航/公开记录已交付。发布tag/Release仍f906，当前main记录merge e3dc另记；真实suite4602541728 bypass/reviews[]/批准NOT_MET保原结果。独立actualmain e3dc新验15:18:57.732–15:29:31.902Z已PASS：13场景/178命令全exit0、6Diagram18LEK Python、4site生成4静态各89/89，site20/guide4资源一致，15精确自有根absence且完整worktree清单及hostHEAD复原，新原件回唯一REPORT，不借旧结果。

Agent已从完整actualmain e3dc派生codex/sync-main-8-3-2，准备向受保护develop65d同步；保留全部main ancestry，当前VERSION8.3.2与插件原版本不变。新head必要Harness/CI/A6、真实非作者/最新推送批准、线程和latestbase均按实际新PR核；Agent不bypass。只有actualsync合入及新复验后才仅市场8.3.3先DryRun后Apply，不建发行；本轮未执行预升。延期/Owner最终接受/NOT_MEASURED独立，进度仍以同一Issue274为准。这是既有P5技术排程，不把历史8.3.1的三PR模式追加为Owner决定。

## Historical publication continuation

Owner续办“#278 PR 已合并，继续后续工作”，[本轮请求与捕获](./evidence/sources/postmerge/release278/continuation/capture-metadata.json)保存真实来源及未知消息身份/时间。本段为#278续办时点快照：当时actual main/tag/Release均f906b100/tree6e4bc9cc，8.3.2已于14:30:16Z公开；278实际Owner bypass/批准NOT_MET保原结果，不作未来例外。独立新验14:31:11.601–14:41:25.926Z已PASS：13/13场景、178命令全exit0、6Diagram+18LEK Python、4site生成/4静态各89/89，公开8/仓库20/显式5/自然3、site20/guide4资源摘要一致；15精确自有根均不存在、canonical无注册残留，真实原件接回唯一REPORT；原CI/65d未冒充新跑。

本轮技术排程：main默认README仍安装v8.3.1并称site未公开，故先通过正常main记录PR修正默认产品导航、补公开及新tag实证；该目标属于原P5文档/交付收尾，非新Owner三PR决定，也不把历史8.3.1三PR当最低强制条款。其实际交付后，正常同步包含该merge的完整main ancestry到develop，实际同步复验后再仅市场8.3.3先DryRun后Apply；插件/既有公开历史保持。保护条件、延期与Owner接受独立，原Issue/PLAN/REPORT复用。

## Historical post-merge continuation

2026-10-19，Owner明确“#275 PR 已合并，继续后续工作”，[来源及捕获](./evidence/sources/postmerge/owner-continue-capture.json)保留未知消息时间/ID/URL。主PR275于12:56:35Z实际合入develop65d756ef/tree d7de559f，同已测1a80 source tree；276/277两子PR均已合入。原保护批准NOT_MET，实际rule-suite4599887231 bypass不能转为以后豁免，详见[主REPORT当前结论](./[REPORT]_HTML_Learning_Artifact.md#current-conclusion-and-remaining-gaps)。P5正式发布授权沿用，当前隔离发布分支从actual65d派生，准备正常main发布PR；无需重开Issue/主PLAN/REPORT，原实现主PR已结束。正式公开及发布后真实tag新验、记录→main回同步→仅市场下一补丁预升依现行[发布操作](../../docs/runbook/[RUNBOOK]_Release_Operations.md)推进；Owner接受/延期/未测仍独立追踪。新的actual65d隔离十三安装/178命令、6Diagram+18LEK与4site生成/4静态Python已取得终态PASS，默认清理无新残留，原件与范围见主REPORT；正式候选及真实tag仍按各自身份新验。

原意覆盖表中的C01/C13/C22/C23/C25及P05/P07所列最终merge待办已由上述实际develop合入取代；C03早期P2阻断已由下述固定源复测关闭，原FAIL保持原轮结果。其余发布、Owner体检、原生窗口/第二客户端与NOT_MEASURED均未因此完成，详见主REPORT和[8.3.2账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md)。

## Historical batch and pull requests

2026-10-19，本批文档bootstrap已形成集成6c2f415与唯一主PR[#275](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/275)→develop；原子子PR[#276](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/276)→codex/html-learning-artifact，未另建子Issue。子PR2证据/报告仍由本task与本主PLAN承接，实际新PR编号待创建，不预造链接。

候选1a3ac5f5/tree8c579494的本地641/641、strict、修后13安装、12项独立消费者与同包私有Sites版本1已有实际证据。后续3507d3bb/tree23300ae0只变浏览器生命周期，新缓存/native/本机浏览器/9项PASS分别记录；独立Linux owned-session新进程组漏检P2仍开放，Agent修复中，不以随后CI绿消除反例。主PR真实非作者批准、当前head最终门禁、实际merge复验、Marketplace正式发布及Owner最终接受未齐。逐项结果/原FAIL/责任恢复条件见[REPORT](./[REPORT]_HTML_Learning_Artifact.md)，Issue仍为进度正本。

2026-10-19追加：P2修复源a02e204与整合03092ce checker Git blob及独立快照原字节一致；实现者WSL/Windows运行与standards_review独立原probe复测分开登记，P2在该范围修后PASS，非真实Chrome/最终CI替代。03092ce fresh缓存/native2/全包比对、本机两viewport/cleanup和9项通过；Site子树较1a只变checker，不重复12项不变交互。LinuxCI-r2因fixture缺SPEC有57前置FAIL；补SPEC后本地r3又因四技能本任务INDEX链接有57前置FAIL。root只保四复用技能canonical SPEC指针并补单一合成目标，判准不变，完整r4/新CI待证。全部原日志、Site三回执与角色归属见REPORT；早期无署名探针不猜作者。

2026-10-19最终本机stage：完整r4为642/642 PASS、零skip，strict-r4 PASS。最终候选acafc348/tree99837ab4仅在03092ce之后调整四repo技能canonical-only指针与一个fixture合成SPEC目标，plugins整个Git子树相同，已保存原Git对应回执。原03092ce WindowsCI-r2为585PASS/57fixture前置FAIL/0skip，另存原日志；最新acaf CI run39239107681仍待，276实际merge/最终主保护批准另记。Sites一次部署后原生metadata回读稳定，不是持续监控、浏览器或Owner接受。原FAIL均保，未提前关闭任务或提交。


2026-10-19最终LinuxCI：原job118015318754/run39239107681已success，raw独立提取unit641PASS/0FAIL/1 Windows大小写专用skip（总642），真实浏览器case通过；strict/baseline/smoke13/13成功，实际6Diagram+18LEK Python及4site生成/静态调用status0。potential merge20c911/parents6c2+acaf的tree99837ab4与已测head相同，只是候选不冒实际merge。Windows完整job仍待终态，后续保护1当前head非作者批准不由内部规则[]或独立审查替代。证据/提取脚本见REPORT。


2026-10-19T10:53:43Z：276已正常合入552b6e0a5d9e3d0a85e284406fe87e9508549028，实际tree99837ab45ddf36bde041efc88bf3784855d6aecb同已测acaf及20c候选。最终Windows原job独立提取642/642零skip、真实browser/strict/baseline及13安装/6Diagram+18LEK+4site生成静态成功；Linux原641/642仅Windows大小写skip1。内部规则[]、threads0、gate/merge原件齐；主275的1current-head非作者批准/最终门禁仍另待，不因内部reviews[]追认。证据原件与派生提取分别保，按授权先提交子PR2文档再正常继承origin集成运行基线复验，由root继续子PR2及授权内部合并。


2026-10-19，文档子PR [#277](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/277) 已实际创建，目标为同一集成分支。其7138d343/tree31f7fa21正常继承552b6e0，运行Git对象与552相同，197原来源已从Git blob独立逐hash核验。root实际文档/INTENT/契约116项与完整real-source原字节投影1项均PASS/零skip，见[范围检查回执](./evidence/sources/engineering/acceptance-scope-checks.json)。本次只补真实PR链接与这3份检查原件绑定，未改变运行、原197证据或接受判准；子PR完整平台矩阵与最终主PR检查按各自服务器终态记录，不将未完成项写成通过。内部实际merge和受保护275/发布/Owner接受的后续事实由Issue及PR回读，原FAIL保留。
