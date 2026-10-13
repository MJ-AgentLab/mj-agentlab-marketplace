---
name: mp-flow-dogfood
description: "Use for marketplace installation and invocation acceptance / 本地验收: execute isolated tests and distinguish actual client results from static checks."
---

# mp-flow-dogfood

运行 npm run check:baseline-tools 和 npm run smoke:codex。冒烟使用隔离 HOME / CODEX_HOME / cache、库和市场镜像，检查 Diagram / Learning Evidence / Explain / HTML / Communication 五个开发插件及七技能；独立 8.2.0 公开候选保持原三插件/五技能。普通 prompt 含 arch-diagram、glossary、concept，pop-quiz、learning-record-check、guide 与 communicate 四显式入口另查 app-server 元数据和实际调用；开发技能只在仓库作用域发现。候选来源为待测 branch/SHA，公开 v8.1.1 不含新包。实际执行安装缓存的 Python 图表与共用脚本，验证资源归属和无仓库过渡依赖。保存测试隔离库、GitHub 写入使用替身；独立合成角色覆盖诊断、移交保存、有效性与应用两阶段、共享及恢复。按 [新验收账本](../../../docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)记录两客户端的安装、调用和实际入口；所有启用提问入口严格待答，原生窗口持续显示须独立证据，文本 pending 或重述不能代替。不可达/失败入口延期，不写通过；结构、发现、模型、窗口、独立批准与 Owner 接受分开登记。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

Explain Kit 单独/组合安装与解释行为按 [Explain Kit 验收](../../../docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 执行，Python 必须实际运行；能力限制如实记录，不要求 owner 例行手工操作。

Communication 按[验收契约](../../../docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)执行十三个独立组合：Diagram、Learning Evidence、Explain、Diagram＋Explain、原三插件、Communication、Communication＋Explain、Communication＋Learning Evidence、原三插件＋Communication、HTML、HTML＋Explain、原三插件＋HTML、全五插件。逐资源比较源/安装字节和摘要哈希，确认无MCP，实际运行已安装 Python 图表校验器。执行 S01–S12、C01–C18，包括多轮未答等待、保义与来源声明、真实文件执行/回读/故障；两个目标客户端分别验证候选来源/版本、安装、图标、显式入口、三类写作、等待及聊天/文件边界。缺项保留 PR3 draft，继续独立工作；旧截图、离线回放和模型自评不能替代实际客户端。

每批记录候选 SHA/tree、包与摘要身份、方法、输入/输出/动作、结果和未覆盖项；失败保留原批次，修复后新身份复验。现实场景效果、个人试用、三稿对照、读者反馈、采用度与效率评价本轮延期，基础通过不证明现实效果。

图标变更检查各安装包的 logo/composerIcon 引用、PNG 内容及源/缓存一致；实际小尺寸视觉与客户端列表/composer 交互另记。

HTML Guide Kit 的新建只读文本和显式确认合同见 [ADR](../../../docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)。验证当前授权集合时，保留 Communication 九组合和 HTML 七组合的并集，并增加全五插件安装，共十三组合；guide、communicate、pop-quiz 和 learning-record-check 仅显式调用，普通提示仍仅三个自然启用技能。合并后运行修正按插件自身补丁推进，评审/安装/模型/客户端结果分别记录。

Communication 的旧九组合与当前 Learning/HTML 基线并集经 Understanding → Learning 替换后为十三组合；全五插件普通3/原生7/显式4。冻结包内容与摘要哈希保持，工程、行为和实际客户端证据分层记录，Refs #222。
