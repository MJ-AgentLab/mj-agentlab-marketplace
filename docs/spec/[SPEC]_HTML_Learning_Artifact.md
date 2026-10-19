---
type: spec
scope: html-guide-kit
summary: "Explicit site workflow, local resource contract and minimum prelaunch acceptance"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: canonical
---

# [SPEC] HTML learning artifact

## §1 Entry and preserved boundaries

本合同仅覆盖新显式 `$html-guide-kit:site` 与直接受影响的包级资源/能力。guide 保留已批准图标、运行字节和原只读聊天合同；旧[guide SPEC](./[SPEC]_HTML_Guide_Kit_Acceptance.md)、[历史验收](../runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)保持原范围。依据为[扩展 ADR](../adr/[ADR]_HTML_Learning_Artifact_Extension.md)及[INTENT](../intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md)，完整接受/操作来源见[主PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#accepted-baseline-and-authorization)。

site为显式调用，原生行为配置布尔false；插件Read/Write不等于技能权限隔离。manifest提示覆盖guide/site，只引用本包真实路由，最多3条，每条原值不超过128 Unicode scalar values。新增技能与全部必需资源/脚本/主题/来源及安装比较原子接入，候选HTML0.1.37；五包八公开/五显式/三自然，仓库技能20保持。

## §2 Six-step behavior and language

| 步骤 | 必需行为及可核判准 |
|---|---|
| Understanding Needs | 实际读取材料或明确快照，识别Audience、Task、Understanding Goals、边界、检查问题与判准；分清事实/推断/假设/未知，缺关键依据则补充或收窄 |
| Learning Materials | 编写可独立阅读Markdown，按目标补足基础、关系、条件、例外、练习；单一主题术语映射，KU只辅助复用，不用数量替代覆盖 |
| Information Structure and Relationships | 分组/层级/顺序/比较维度有理由；分类不画过程、相关不画因果；关键比较可同时看，关键限制与来源保持可见 |
| Interaction and UI/UX | 每项交互有理解用途、输入、变化、反馈、异常、恢复和静态替代；缺可靠规则不造确定结果，无用途使用静态表达 |
| HTML through Sites | 用有界交接包和本地资源实际调用当前Sites流程，检查关键内容/输出/主流程/访问范围，按原因回修前一步 |
| Evaluation and Revision | 工程/体验/理解效果分记；Owner体检发现问题后按影响修复复验；未测学习表现保持NOT_MEASURED |

步骤2–4允许往返，不固定六章/七章、题量或交互量；主题可用Overview→Necessary Foundations→Topic Explanation and Local Practice→Integrated Practice，并按实际材料调整。教材正文用适用AICS-Standard；制作、验证和报告按AICS-Strict核实际执行、异常与完成范围。

核心概念、阶段与主要章节使用稳定英文并给邻近中文解释；案例、概念推导、题干、操作、参考判断、反馈、误区、限制和学习者按钮默认中文。原技术标识/命令/文件名保留原文，不机械套英文词数。术语覆盖正文/图解/表格/交互/反馈/导出；Exhibit是展示、Evidence是证据，Source-supported不等于Confirmed，Verified不等于Completed；不同概念不为统一而合并。

保留关键原文、条件、例外、来源定位、冲突和缺口；原材料、实际核验背景、教学构造分别标注。无判准只给有界参考，不能力评分或长期掌握断言。反馈有依据/理由/误区和重试；改答后原核对状态失效，重置只恢复本轮声明范围，导出包括内容/状态版本与依据。

## §3 Clarification and strict pending

提问协议包内闭合，只问实质未决项，给实际不同的选项、推荐及理由；已有有效确认复用。必要答案未取得保同一pending，不生成依赖结论。默认、推荐、预选、未提交、沉默、超时、无关回复或窗口关闭/消失均非答复。用户明确选择或修改并确认后才推进受影响部分；明确停止则停止。

优先宿主实际支持的原生提问界面；插件不承诺锁窗口。持续显示/空返回/超时/关闭须真实客户端事件，文字重述不算窗口实证。完整弹窗体验可延期，必要回答不能用延期替代；不能因非核心入口缺失否定已独立通过核心，也不能把延期记PASS。

## §4 Local resources and tool contract

包内最少包含site SKILL/agents配置、六步/AICS/术语/交互/评价/Sites交接/来源参考、`render-site.mjs`、`check_artifact.py`、`check_renderings.py`及暖白主题shell/CSS/JS。实际精确文件清单由严格校验登记，方法资源从本次安装SKILL locator定位。输入材料目录明确，输出独立任务目录，禁止写入安装缓存/研究目录。

生成器明确支持Markdown范围；不支持结构必须报告，不能静默丢内容。内容和视图分离，结构化主题配置含术语/来源/交互/内容版本；输出保持关键内容静态可读。Node/Python标准库优先；浏览器与可选依赖单独报告，不运行时安装。无CDN/远程字体/脚本/样式、其他缓存、原研究路径或自动上游下载依赖。

| 首版工具 | 必查行为 |
|---|---|
| 样式注入/生成 | 本地暖白陶土主题，去固定教材/六章/题目/日期/个人路径/Site身份；独立输出，不带旧通过记录 |
| 复制反馈 | 真实成功与失败区分，手动复制回退、焦点处理、中文状态；不能未复制即报成功 |
| 静态检查 | 结构、链接/来源定位、资源、配置、术语映射及版本；负例失败非零；已知映射检查不宣称语义已证 |
| 通用渲染检查 | 实际浏览器覆盖横向溢出、严重裁切、异常换行和必要截图；中文/Windows/路径适配；浏览器缺失或跳过逐项UNVERIFIED/NOT_RUN，不写PASS |

主题默认`#faf9f5`底、`#252521`主文字、`#42423c`正文、`#b45a3b`强调、`#93442c`链接/深强调、`#f0ece2`辅底；衬线标题与系统无衬线正文、本地字体。检查实际背景对比度、舒适行宽/留白/层级、邻近说明、响应式，动效有解释用途且考虑减少动效。

来源清单逐项记录名称/地址/固定版本、上游路径与SHA256、本地落点、复制/修改/独立适配、改动及许可。实际第三方内容建立THIRD_PARTY_NOTICES，保留许可；不得把派生资料冒充原始规范或自动转MIT。原计划延期HTML Plan pack/runtime、Birch eval/vision/GEPA不迁入，不建空vendor。

## §5 Sites handoff and execution

交接包必须有：已确认Audience/Task/Goals/范围，Markdown/术语/必要来源，结构关系及交互说明，本地模板/主题/必要组件，检查问题/判准/依据，内容版本/精确文件清单/未决/最小验收。只交当前有界材料，不带整个工作区、其他研究目录、旧Site身份、凭据或历史PASS。

实际读取当前安装Sites技能/工作流并发现实际工具，不编造连接器ID、MCP地址或依赖字段。明确新建/更新，使用当前交接包实施，做适用本地/主流程检查，按Sites要求同步精确源码、保存版本、打包部署，回读实际地址/版本/部署状态/访问范围。新站私有；更新站保留身份与受众，实质变更另获决定。创建/部署结果不确定先核状态，凭据不入源码、参数、日志或制品。

Sites不可用时保留本地交接包，记制作/发布未完成，不声称核心上线通过。至少一次自有Marketplace安装后的技能实际发现并调用Sites，在一个目标客户端跑通流程；公共目录与本地/Git Marketplace资格分别判断，不由本次成功推定公共上架。

## §6 Minimum prelaunch acceptance

| 门槛 | 最低通过条件和证据 |
|---|---|
| A1 安装与本地独立 | 完整canonical严格安装；两显式入口发现/调用；逐文件源/缓存字节相符；脱离研究目录和其他缓存完成方法/工具主流程；guide字节保持 |
| A2 核心内容正确 | 独立合成内容/学习设计角色对代表材料关键结论、条件、例外、关系、练习判准与来源逐项核对；语言/术语一致；实际输入/动作/输出及结论可恢复 |
| A3 Sites主流程 | 一个目标客户端实际材料→六步→Sites发布；实际安装locator、会话/事件、可访问地址、保存版本、部署状态与正确受众；关键阅读/反馈/复制/导出等按该制品使用范围检查 |
| A4 工程与发布边界 | 当前npm检查/严格校验/十三隔离安装/实际缓存Python、必要CI/非作者批准/线程，精确候选及实际merge核对，许可/无凭据或非预期材料，发布监控恢复安排 |

命令使用`npm test`、`npm run validate`、`npm run check`、`npm run smoke`，记录check/smoke别名实际入口；Python图表必须实际执行，不以环境存在替代。新检查围绕真实能力和高影响错误，不以固定文案匹配充当验收。独立Agent可同时核产品/工程，但不假扮Owner或GitHub批准者；真实客户端/窗口不由模拟替代。

无法安装、资源缺失、核心不能完成、关键内容/条件/判准错、Sites身份/受众错误、凭据/非预期材料发布、必要门禁失败均阻上线。局部排版/次要交互/非关键术语呈现、第二客户端、完整视觉/可访问性/扩展场景可后移；列影响、责任、恢复条件和剩余接受义务。Sites核心不能套用非核心延期。

## §7 Evidence, completion and recovery

唯一任务REPORT绑定完整候选/实际merge SHA/tree、各包版本、资源逐文件hash、实际缓存与工具/客户端版本、输入/动作/输出/截图/返回码、时间与未覆盖。失败/拒绝/超时/中断/修复重跑分别保留；安装不代行为，文件检查不代资源闭包，合成验收不代保护批准或Owner接受。

上线前检查通过、插件已上线、Sites网页已发布、Owner体检完成各用自身证据；核心交付、全计划完成、正式发布和Owner最终接受分开。报告实际版本/源码版本、Sites地址/保存版本/部署状态、执行结果与限制；理解效果未测保持NOT_MEASURED。

Owner体检覆盖真实制作体验、页面阅读操作与扩展/异常；真实反馈后按影响修复复验，不默认重跑完整旧矩阵。已发布版本观测关键内容、访问与部署/资源异常；停止新增发布并升级责任Agent/Owner，先回读状态，选已知良好保存版本或前向修复，插件用新受保护PR恢复，历史与资产保留。原始范围及逐条覆盖见[主PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md#original-meaning-and-engineering-coverage)。
