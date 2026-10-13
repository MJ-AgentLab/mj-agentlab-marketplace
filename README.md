# MJ AgentLab Marketplace

<img src="assets/brand/marketplace/logo.svg" width="128" height="128" alt="MJ AgentLab Marketplace — MJ letters with connected modules">

![Version](https://img.shields.io/badge/version-8.3.0-blue)

面向 ChatGPT 桌面端与 Codex 本地环境的插件市场，CLI 验收基线为 0.147.0。此分支准备已获授权的 Communication 8.3.0 四包发行；实际已发布 main/Release 为 v8.2.0，仅包含前三个插件。8.3.0 与 Communication 0.1.0 的正式发布身份以 [Releases](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases) 为准。

| 插件 / 公开技能 | 用途 | 插件版本 |
| --- | --- | --- |
| **diagram-kit / arch-diagram** | 从源码事实生成七类 Mermaid 架构/UML 图，追溯文件行号并实际运行 Python 校验器 | 0.3.1 |
| **learning-evidence-kit / pop-quiz、learning-record-check** | 显式诊断和移交完整记录，保留本机原件；分开核验指定记录有效性与任务应用 | 0.1.0 |
| **explain-kit / glossary、concept** | 陌生术语速解与机制、反例、边界深讲，遵从受众、语言和长度要求 | 0.1.1 |
| **communication-kit / communicate** | 显式处理沟通、编写与保义改写；关键缺口先问并等待，交付成稿和关键提示 | 0.1.0，尚未发布 |

### 安装与调用

当前公开来源：

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref v8.2.0
codex plugin add diagram-kit@mj-agentlab-marketplace
codex plugin add learning-evidence-kit@mj-agentlab-marketplace
codex plugin add explain-kit@mj-agentlab-marketplace
codex plugin list --json
codex debug prompt-input '$diagram-kit:arch-diagram'
~~~

Communication 发布前验收使用固定候选 SHA，正式 v8.3.0 published 后再选择该标签并安装 `communication-kit@mj-agentlab-marketplace`。在 ChatGPT 桌面端的 repo marketplace 中核对实际来源、分支/标签及插件版本；客户端操作和 CLI 安装记录分别保存。

调用 `$diagram-kit:arch-diagram`，或请求“给这个仓库画架构图”。Explain 的 `$explain-kit:glossary` 与 `$explain-kit:concept` 默认中文、保留术语原文，按深度路由并遵从用户格式。见 [Explain ADR](docs/adr/[ADR]_Explain_Kit_Addition.md) 和 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。

### Communication Kit

显式调用 `$communication-kit:communicate`，提供沟通目标与已有事实，处理沟通、文档编写与保义改写。它保留事实、立场、条件、例外、责任和真实承诺；关键缺口先给选项、推荐及理由并等待明确答复。默认聊天交付成稿＋关键提示，明确要求后才保存或编辑指定 Markdown/TXT，并实际回读。见 [包说明](plugins/communication-kit/README.md)、[主技能](plugins/communication-kit/skills/communicate/SKILL.md) 和 [验收账本](docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。

包内精选原创 AICS 摘要冻结为 Lab Proposal / Informative，运行只读取包内资源。实际 CLI 行为为 15 PASS、3 PARTIAL；不同工具身份另有三项限定功能结果。同一桌面应用内 Codex 本地及 ChatGPT/Work 本机路线的安装、图标、三类任务、聊天等待及新 MD/TXT 保存回读已有限定证据；原生问题窗口、独立 classic/cloud 客户端与全部 Office 编辑等未覆盖项分别保留。

本轮不做真实场景效果测试、九例个人试用、三稿对照、读者反馈、采用度或效率评价。基础功能通过不代表现实沟通效果已验证。

### Learning Evidence Kit

`$learning-evidence-kit:pop-quiz` 与 `$learning-evidence-kit:learning-record-check` 均显式启动。Pop Quiz 只读诊断并输出完整记录，明确移交后结束诊断，由包内共用能力保存、关联和返回回执。Record Check 先核验选定原件及身份适用性，再根据本人解释和既有验证材料检查任务应用；保存不自动共享，材料补齐不自动核验。见 [指南](docs/guide/[GUIDE]_Learning_Evidence_Kit.md)、[迁移 ADR](docs/adr/[ADR]_Learning_Evidence_Kit_Migration.md) 和 [验收账本](docs/runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。

Codex 优先 Side Chat 的明确任务片段；其他会话采用明确上下文快照，不假定持续同步。所有启用提问入口严格待答，未提交、默认、关闭或超时不算答复；原生持续窗口缺项延期。完整原件保存在授权用户数据目录；更正和重测追加，手动授权共享及增量采集使用共用接口。工程运行不证明真实学习收益或长期保持。

### 开发、历史与发行门禁

Owner Q3 规定本次正式范围为 Diagram / Learning Evidence / Explain / Communication 四包六技能；HTML Guide 保留 develop 另行发行。五包开发矩阵和本分支四包九组合分别严格校验，历史 HTML [ADR](docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)、[指南](docs/guide/[GUIDE]_HTML_Guide_Kit.md) 与 [验收](docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)继续保留。

20 个仓库开发技能位于 `.agents/skills`。本分支原生清单为六个公开技能，三个显式入口是 pop-quiz、learning-record-check、communicate；普通发现为 arch-diagram、glossary、concept，Communication 独装普通发现为零、原生清单为一。代理执行 `npm ci`、`npm test`、`npm run validate`、`npm run check:baseline-tools` 和 `npm run smoke:codex`；实际缓存 Python、资源字节和固定提交 canonical 结果单独记录。

[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222) 管理 PR1–PR5。本正式 PR5 候选从实际 PR4 merge `c1fa458` 派生，接入已测四包投影并核对 main `ebc4bdc3` 基础。前四阶段已合并，未见独立 reviews 的历史缺项保留；本 PR5 仍须当前 head 的独立/代码所有者批准、required checks 与已解决线程门禁。版本工具已准备 8.3.0，插件版本保持；R01–R05 与实际 published、发布身份及上线后安装复查按 [8.3.0 账本](docs/runbook/[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)执行，完成前 Epic 保持开放。

Learning [v8.2.0](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.2.0) 于 2026-10-13 发布，实际 main/tag 为 ebc4bdc3。历史 [v8.1.1](docs/runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)仍含 Understanding；旧来源、失败及批准缺项不由后续发行追认。Claude、learn-kit 和 NotebookLM 退役规则见 [升级与卸载](docs/guide/[GUIDE]_ChatGPT_Codex_Upgrade.md)，旧包不会随索引移除自动卸载。

项目指令见 [AGENTS.md](AGENTS.md)，规范与历史见 [文档索引](docs/INDEX.md)，贡献见 [CONTRIBUTING.md](CONTRIBUTING.md)。品牌沿用 Owner 已批准的 A 主标及 D 插件风格；Communication 为原创地球＋清晰文字图标，见 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md) 与 [验收](docs/runbook/[RUNBOOK]_Brand_Identity_Acceptance.md)。
