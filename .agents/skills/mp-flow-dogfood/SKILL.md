---
name: mp-flow-dogfood
description: "Use for marketplace installation and invocation acceptance / 本地验收: execute isolated tests and distinguish actual client results from static checks."
---

# mp-flow-dogfood

运行 npm run check:baseline-tools 和 npm run smoke:codex。冒烟使用隔离 HOME / CODEX_HOME / cache、consumer cwd 和市场镜像，按候选完整集合检查安装元数据与包内资源。全量普通 prompt 含 arch-diagram、glossary、concept 共3个，原生清单5个；pop-quiz 与 communicate 显式加载另查 app-server 元数据与实际调用，Communication 独装普通0/原生1。开发技能仅在仓库作用域发现，消费者不泄露20个 mp-*。基线 Codex CLI 0.147.0，canary同矩阵兼容结果单列。arch-diagram 检查图源、证据表、资源定位和 Python 实际执行；pop-quiz 按[验收记录](../../../docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)检查只读、快照、等待、诊断反馈和题量。静态、发现、模型行为、Side Chat 和两端 UI 结果分开记录，未执行写明具体原因。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。

Explain Kit 单独/组合安装与解释行为按 [Explain Kit 验收](../../../docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 执行，Python 必须实际运行；能力限制如实记录，不要求 owner 例行手工操作。

Communication 按[验收契约](../../../docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)执行十三个独立组合：Diagram、Understanding、Explain、Diagram＋Explain、原三插件、Communication、Communication＋Explain、Communication＋Understanding、原三插件＋Communication、HTML、HTML＋Explain、原三插件＋HTML、全五插件。逐资源比较源/安装字节和摘要哈希，确认无MCP，实际运行已安装 Python 图表校验器。执行 S01–S12、C01–C18，包括多轮未答等待、保义与来源声明、真实文件执行/回读/故障；两个目标客户端分别验证候选来源/版本、安装、图标、显式入口、三类写作、等待及聊天/文件边界。缺项保留 PR3 draft，继续独立工作；旧截图、离线回放和模型自评不能替代实际客户端。

每批记录候选 SHA/tree、包与摘要身份、方法、输入/输出/动作、结果和未覆盖项；失败保留原批次，修复后新身份复验。现实场景效果、个人试用、三稿对照、读者反馈、采用度与效率评价本轮延期，基础通过不证明现实效果。

图标变更检查各安装包的 logo/composerIcon 引用、PNG 内容及源/缓存一致；实际小尺寸视觉与客户端列表/composer 交互另记。

HTML Guide Kit 的新建只读文本和显式确认合同见 [ADR](../../../docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)。验证当前授权集合时，保留 Communication 九组合和 HTML 七组合的并集，并增加全五插件安装，共十三组合；guide、communicate 和 pop-quiz 仅显式调用，普通提示仍仅三个自然启用技能。合并后运行修正按插件自身补丁推进，评审/安装/模型/客户端结果分别记录。
