---
type: spec
scope: html-guide-kit
summary: "Explicit site workflow, confirmed design and mode-specific Sites or local acceptance"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-20
state: active
version: v1.3
layer: canonical
---

# [SPEC] HTML learning artifact

## §1 Entry and preserved boundaries

本合同仅覆盖显式 `$html-guide-kit:site` 与直接受影响的包级资源/能力。guide保留已批准图标、运行字节和原只读聊天合同；旧[guide SPEC](./[SPEC]_HTML_Guide_Kit_Acceptance.md)、[历史验收](../runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)保持原范围。依据为[扩展ADR](../adr/[ADR]_HTML_Learning_Artifact_Extension.md)及[INTENT](../intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md)。本次B2 Slack完整API正文及U2 Owner选择的唯一决定正本见[选择性统一基线](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#selective-alignment-baseline)；B1/U1的[旧授权](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#accepted-baseline-and-authorization)、固定Git a4892f51f4163fb5bd4457d99229eaf1a4683e8f中的修订前完整合同及原结果保留。旧核心ACCEPTED_LIMITED不扩张为新增能力通过或完整计划接受。

site为显式调用，原生行为配置布尔false；插件Read/Write不等于技能权限隔离。manifest提示覆盖guide/site，只引用本包真实路由，最多3条，每条原值不超过128 Unicode scalar values。全部必需资源/脚本/主题/来源及安装比较原子接入，公开首版HTML0.1.37，0.1.38承接许可传递与输入边界修复；当前公开为v8.3.3/HTML0.1.38，具体身份见[8.3.3账本](../runbook/[RUNBOOK]_Marketplace_8_3_3_Release_Readiness.md)。本批0.1.39仍为未发布候选，五包八公开/五显式/三自然、仓库技能20保持；市场VERSION8.3.3和其他插件版本不动。完整actualmain同步、唯一protected develop主PR的新headCI/真实批准及actualsync复验分别待证，不把内部集成当交付。

## §2 Six-step behavior and language

| 步骤 | 必需行为及可核判准 |
|---|---|
| Define Understanding Needs | 实际读取材料或明确快照，识别Audience、Task、Understanding Goals、边界、检查问题与判准，明确是否包括真实理解评价；分清事实/推断/假设/未知，缺关键依据则补充或收窄 |
| Develop Learning Materials | 编写可独立阅读Markdown，按目标补足基础、关系、条件、例外、练习；单一主题术语映射，KU只辅助复用，不用数量替代覆盖 |
| Design Information Structure and Relationship Representation | 先设计静态读取；分组/层级/顺序/比较维度有理由；分类不画过程、相关不画因果；展示紧邻主张，关键比较可同时看，限制与来源保持可见 |
| Design Interaction, Representation, and UI UX | 每项交互有理解用途、输入、变化、反馈、异常、恢复、操作成本和静态替代；缺可靠规则不造确定结果，无明确收益使用静态表达；视觉方向按任务决定 |
| Build and Verify HTML | 按约定Sites或本地模式制作，使用有界交接包和本地资源，核对关键内容/输出/主流程；Sites模式读取当前流程并核发布/访问范围，按原因回修前一步 |
| Evaluate and Revise | 内容正确、页面可用、发布成功与理解效果分记；真实反馈后按影响修复复验；未测学习表现保持NOT_MEASURED，给可实施评价方案但不写成已执行 |

步骤2–4允许往返，不固定六章/七章、题量或交互量；主题可用Overview→Necessary Foundations→Topic Explanation and Local Practice→Integrated Practice，并按材料调整。简单任务合并必要记录，不创建空文档或堆功能。采用B2的AICS原则：术语一致、表达明确、解释足够、结构表达关系、分层展开、依据与未知明确、执行责任明确；未读取完整AICS文本时不宣称已通过全部AICS检查。这些原则不构成理解效果证明。

核心概念、阶段与主要章节使用稳定英文并给邻近中文解释；案例、概念推导、题干、操作、参考判断、反馈、误区、限制和学习者按钮默认中文。原技术标识/命令/文件名保留原文，不机械套英文词数。术语覆盖正文/图解/表格/交互/反馈/导出；Exhibit是展示、Evidence是证据，Source-supported不等于Confirmed，Verified不等于Completed；不同概念不为统一而合并。

保留关键原文、条件、例外、来源定位、冲突和缺口；原材料、实际核验背景、教学构造分别标注。无判准只给有界参考，不能力评分或长期掌握断言。反馈有依据/理由/误区和重试；改答后原核对状态失效，重置只恢复本轮声明范围，导出包括内容/状态版本与依据。

## §3 Clarification and strict pending

先查材料、环境和已有决定，工具可查事实由Agent核实。已确认设计直接复用，不重复访谈或确认；普通实现细节由Agent判断。只有会实质影响读者、目标能力、材料范围、阅读路径或交付范围的关键未决，才读取并使用Matt Pocock Skills的grilling，按依赖分轮提问；每轮只问当前可答问题，编号并给2–3个实际不同选项、推荐和简短理由，等待时继续独立资料核查。关键问题解决后简述设计共识，取得确认，再开始依赖这些决定的实现；澄清界面不自动加入成品网站。

Matt为按需能力，不是运行时自动安装依赖。仅在关键澄清已触发且需要Matt时，缺失该技能才构成该阶段依赖缺口：如实记录、保持同一待答并继续不依赖工作；不得用包内问答冒称已执行Matt或已完成该澄清阶段。已有确认的设计不产生此依赖。包内严格提问规则始终有效，必要答案未取得不生成依赖结论。默认、推荐、预选、未提交、沉默、超时、无关回复或窗口关闭/消失均非答复；明确停止则停止。

使用宿主实际支持的原生结构化提问界面，行为以真实工具能力为准；插件不承诺锁窗口。持续显示/空返回/超时/关闭须真实客户端事件，文字重述或pending不算窗口实证。当前原生窗口仍DEFERRED，非PASS；必要回答不能用延期替代，只暂停其依赖部分。不能因非核心入口缺失否定已独立通过核心，也不能把延期记PASS。

## §4 Local resources and tool contract

包内最少包含site SKILL/agents配置、六步/AICS原则/术语/交互/评价/Sites交接/来源参考、`render-site.mjs`、`check_artifact.py`、`check_renderings.py`及本地主题shell/CSS/JS。实际精确文件清单由严格校验登记，方法资源从本次安装SKILL locator定位。保留现有生成器和工程检查。输入材料目录明确，既有材料/研究原件/安装缓存保持，禁止原地修订或覆盖来源；允许在独立任务目录生成约定产物，生成冲突须在写入前拒绝。

生成器明确支持Markdown范围；不支持结构必须报告，不能静默丢内容。内容和视图分离，结构化主题配置含术语/来源/交互/内容版本；输出保持关键内容静态可读。Node/Python标准库优先；浏览器与可选依赖单独报告，不运行时安装。无CDN/远程字体/脚本/样式、其他缓存、原研究路径或自动上游下载依赖。

| 首版工具 | 必查行为 |
|---|---|
| 样式注入/生成 | 按选定本地主题生成，去固定教材/六章/题目/日期/个人路径/Site身份；独立输出，不带旧通过记录 |
| 复制反馈 | 真实成功与失败区分，手动复制回退、焦点处理、中文状态；不能未复制即报成功 |
| 静态检查 | 结构、链接/来源定位、资源、配置、术语映射及版本；负例失败非零；已知映射检查不宣称语义已证 |
| 通用渲染检查 | 实际浏览器覆盖横向溢出、严重裁切、异常换行和必要截图；中文/Windows/路径适配；浏览器缺失或跳过逐项UNVERIFIED/NOT_RUN，不写PASS |

主题依内容、读者、任务及已确认偏好选择，暖白纸面/衬线标题/陶土色是候选方向，不强制所有网站套同一风格。本地生成器的`artifact.json`可选`theme`值`warm-paper`或`neutral`；省略保留warm-paper兼容，未知值或类型（含null）在生成前零写失败，静态检查也拒绝。warm-paper保留`#faf9f5`底、`#252521`主文字、`#42423c`正文、`#b45a3b`强调、`#93442c`链接/深强调、`#f0ece2`辅底；neutral以固定CSS覆盖生成同一输出theme.css，不增加资源或自定义CSS路径。两种预设均需实际核验，名称或兼容不代表本批已通过。其他已选视觉方向由Sites独立实现并验证，不虚称本地生成器支持任意主题。检查实际对比度、控件边界、行宽/留白/层级、邻近说明、键盘/焦点、响应式及减少动效；不使用远程字体。

来源清单逐项记录名称/地址/固定版本、上游路径与SHA256、本地落点、复制/修改/独立适配、改动及许可。实际第三方内容建立THIRD_PARTY_NOTICES，保留许可；生成的模板/运行资产携带包MIT LICENSE、Apache原文及带范围/原安装定位说明的完整notice尾部，全部入manifest，不重授权输入材料。安装器核根LICENSE原字节；生成前缺件或保留名/跨平台路径冲突均零写失败。通用checker只核声明清单自洽，不认证许可/原件真实性；不得把派生资料冒充原始规范或自动转MIT。可选外部代码只有决定采用时才核对固定版本、完整文件路径、许可、环境及用途，读取适配必要文件，不下载整个仓库。原计划延期HTML Plan pack/runtime、Birch eval/vision/GEPA不因本次统一自动迁入，不建空vendor。

## §5 Delivery choice, handoff and execution

默认新建并私有发布Sites；用户也可指定已有Site或仅本地制作，复用已明确的交付选择，不重复询问。交付模式写入范围和最小验收。Sites不可用不能自动改为本地完成，明确约定本地也不要求额外部署才能交付。

交接包必须有：已确认Audience/Task/Goals/范围，Markdown/术语/必要来源，结构关系及交互说明，本地模板/主题/必要组件，检查问题/判准/依据，内容版本/精确文件清单/未决/最小验收。只交当前有界材料，不带整个工作区、其他研究目录、旧Site身份、凭据或历史PASS。

实际读取当前安装Sites技能/工作流并发现实际工具，不编造连接器ID、MCP地址或依赖字段。明确新建/更新，使用当前交接包实施，做适用本地/主流程检查，按Sites要求同步精确源码、保存版本、打包部署，回读实际地址/版本/部署状态/访问范围。新站私有；更新站保留身份与受众，实质变更另获决定。创建/部署结果不确定先核状态，凭据不入源码、参数、日志或制品。

Sites模式不可用时保留本地交接包，记该模式制作/发布未完成，不声称核心上线通过。至少一次自有Marketplace安装后的技能实际发现并调用Sites，在一个目标客户端跑通流程的旧判准及证据保留；新本地模式不追认或抹去旧Sites义务。公共目录与本地/Git Marketplace资格分别判断，不由本次成功推定公共上架。

已约定本地模式时，在独立目录交付HTML、独立内容源、可追溯来源、必要术语/结构/交互理由、源码/恢复说明、版本/精确文件清单和实际检查记录。核对静态读取及该制品所用的操作、反馈、复制/导出/下载与内容源一致性；长篇材料按需提供完整阅读入口及下载。报告真实本地路径并明确未发布Sites，Sites地址/保存版本/部署状态记不适用，不能编造。仅文件存在仍不能替代内容审阅、浏览器操作或必要验收。

## §6 Minimum prelaunch acceptance

| 门槛 | 最低通过条件和证据 |
|---|---|
| A1 安装与本地独立 | 完整canonical严格安装；两显式入口发现/调用；逐文件源/缓存字节相符；脱离研究目录和其他缓存完成方法/工具主流程；guide字节保持 |
| A2 核心内容与设计 | 独立合成内容/学习设计角色对代表材料关键结论、条件、例外、关系、练习判准与来源逐项核对；语言/术语一致；已有确认直接复用，关键未决时有按需grilling及设计共识确认，缺Matt/答案只停依赖；实际输入/动作/输出及结论可恢复 |
| A3 约定交付主流程 | 一个目标客户端实际材料→六步→所选模式。Sites模式核安装locator、会话/事件、可访问地址、保存版本、部署状态与正确受众；已约定本地模式核独立HTML/内容源/来源/版本、必要静态读取/操作/恢复及输出位置，明确未发布Sites。两模式均按制品范围检查关键阅读/反馈/复制/导出等，并核既有材料未被覆盖、主题与已确认设计一致；按真实制品与已执行范围逐项取证，有限结果不覆盖未运行入口或完整矩阵 |
| A4 工程与发布边界 | 当前npm检查/严格校验/十三隔离安装/实际缓存Python、必要CI/非作者批准/线程，精确候选及实际merge核对，许可/无凭据或非预期材料，发布监控恢复安排 |

命令使用`npm test`、`npm run validate`、`npm run check`、`npm run smoke`，记录check/smoke别名实际入口；Python图表必须实际执行，不以环境存在替代。新检查围绕真实能力和高影响错误，不以固定文案匹配充当验收。独立Agent可同时核产品/工程，但不假扮Owner或GitHub批准者；真实客户端/窗口不由模拟替代。

本次A2/A3修订只适用于B2/U2新范围；旧A1–A4完整合同及各轮结果由固定Git恢复，不以本地规则、可选主题或设计确认补写旧PASS。无法安装、资源缺失、约定核心不能完成、关键内容/条件/判准错、既有材料被覆盖、Sites模式身份/受众错误、凭据/非预期材料发布、必要门禁失败均阻对应交付/上线。局部排版/次要交互/非关键术语呈现、第二客户端、完整视觉/可访问性/扩展场景可后移；列影响、责任、恢复条件和剩余接受义务。Sites模式核心不能套用非核心延期；原生窗口仍DEFERRED且不重启原模型/桌面测试。

## §7 Evidence, completion and recovery

唯一任务REPORT绑定完整候选/实际merge SHA/tree、各包版本、资源逐文件hash、实际缓存与工具/客户端版本、输入/动作/输出/截图/返回码、时间与未覆盖。失败/拒绝/超时/中断/修复重跑分别保留；安装不代行为，文件检查不代资源闭包，合成验收不代保护批准或Owner接受。

约定制品交付、上线前检查通过、插件已上线、Sites网页已发布、Owner体检完成各用自身证据；核心交付、全计划完成、正式发布和Owner最终接受分开。报告交付模式、真实本地位置或Sites地址/保存版本/部署状态、实际插件/源码版本、执行结果与限制；理解效果未测保持NOT_MEASURED。本批0.1.39仍为未发布候选，设计/主题/本地有限运行结果及其限制由同一REPORT逐项报告；不借公开0.1.38或旧核心接受补写未执行入口、完整计划或Owner接受通过。

Owner体检覆盖真实制作体验、页面阅读操作与扩展/异常；真实反馈后按影响修复复验，不默认重跑完整旧矩阵。已发布版本观测关键内容、访问与部署/资源异常；停止新增发布并升级责任Agent/Owner，先回读状态，选已知良好保存版本或前向修复，插件用新受保护PR恢复，历史与资产保留。原始范围及逐条覆盖见[主PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#original-meaning-and-engineering-coverage)。
