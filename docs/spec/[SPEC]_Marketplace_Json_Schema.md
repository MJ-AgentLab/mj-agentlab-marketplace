---
type: spec
scope: marketplace
summary: "Four-package Communication preparation with separate development and published scopes"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-13
state: active
version: v2.7
---

# [SPEC] Marketplace index

.agents/plugins/marketplace.json 含稳定 name mj-agentlab-marketplace、interface.displayName 与 plugins[]。本发行预备投影按Owner Q3严格包含以下四项；develop保留HTML为五包七技能，已发布main/v8.2.0仍为前三包五技能。

| name | source.path | 公开技能 |
| --- | --- | --- |
| diagram-kit | ./plugins/diagram-kit | arch-diagram |
| learning-evidence-kit | ./plugins/learning-evidence-kit | pop-quiz、learning-record-check |
| explain-kit | ./plugins/explain-kit | glossary、concept |
| communication-kit | ./plugins/communication-kit | communicate（显式调用） |

每项 source 为 local，installation 为 AVAILABLE，authentication 为 ON_INSTALL，category 为 Developer Tools。path 相对仓库根解析，不能逃逸。市场索引和条目不含版本；版本从 VERSION 与各根 manifest 读取。候选集合按 [Learning Evidence Kit 迁移 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md) 直接替换 understanding-kit，没有过渡插件。两个学习技能都设置显式调用策略；共用脚本不新增公开技能。

Learning8.2.0已公开，Learning Evidence0.1.0、Diagram0.3.1/Explain0.1.1保持。历史v8.1.1包含Understanding0.1.2，不能用旧标签安装Learning；Communication/HTML尚未公开；本预备源VERSION8.3.0，实际develop为8.2.1。

Owner 确认 8.2.0 独立公开候选只含 Diagram、Learning Evidence、Explain 三插件/五技能，HTML 保留在 develop 另行发行。开发与公开候选分别按各自精确登记验证。

插件发布继续由 Git 仓库和版本标签分发，不在本索引绑定附加 wheel 或 checksum。

Explain Kit 新增边界见 [ADR](../adr/[ADR]_Explain_Kit_Addition.md)。严格验证拒绝缺失、重复、未知、错源条目；发布安装复查使用相同契约。

Communication 的[新增 ADR](../adr/[ADR]_Communication_Kit_Addition.md)与[行为契约](./[SPEC]_Communication_Communicate.md)约束单入口、Read/Write 和冻结资源。插件、索引、严格白名单、资源及安装预期同 PR 原子接入；本预备候选四插件六公开技能、20 仓库开发技能，消费者作用域不含开发技能。索引不承担版本转换或验收结论：当前预备VERSION为未发布8.3.0，Communication 0.1.0 尚未发布，实际功能与双客户端基本可用性按[验收记录](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)登记。

| Version | Date | Summary |
|---|---|---|
| v2.3 | 2026-10-12 | Communication 候选原子注册契约；分开记录已发布三插件范围 |

HTML Guide Kit 的 [新增 ADR](../adr/[ADR]_HTML_Guide_Kit_Addition.md) 约束 Read 与 guide 显式调用；该develop基线和 Communication PR3候选共同形成五插件/七公开技能，main/v8.2.0已发布范围为三插件/五技能。严格验证拒绝缺失、重复、未知、错源或不完整包，不创建空注册；市场和既有插件版本保持。

| Version | Date | Summary |
|---|---|---|
| v2.4 | 2026-10-13 | 同步 HTML 开发基线，保留 Communication 合同并更新五插件集合与十三组合预期 |

| Version | Date | Summary |
|---|---|---|
| v2.5 | 2026-10-13 | 同步 Learning 原子替代与 Communication 完整集成，按当前集合验收，发行范围另核对 |
| v2.6 | 2026-10-13 | 同步已公开Learning8.2.0基线，保留Communication开发五包与正式四包范围及历史限制 |

| Version | Date | Summary |
| --- | --- | --- |
| v2.7 | 2026-10-13 | Owner Q3四包发行预备严格注册；develop五包、已发布三包与阶段门禁分别保留 |
