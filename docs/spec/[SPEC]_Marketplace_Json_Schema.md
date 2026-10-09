---
type: spec
scope: marketplace
summary: "Maintained three-plugin local marketplace contract without version copies"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.2
---

# [SPEC] Marketplace index

.agents/plugins/marketplace.json 含稳定 name mj-agentlab-marketplace、interface.displayName 与 plugins[]。当前开发数组包含以下三项：

| name | source.path | 公开技能 |
| --- | --- | --- |
| diagram-kit | ./plugins/diagram-kit | arch-diagram |
| understanding-kit | ./plugins/understanding-kit | pop-quiz |
| explain-kit | ./plugins/explain-kit | glossary、concept |

每项 source 为 local，installation 为 AVAILABLE，authentication 为 ON_INSTALL，category 为 Developer Tools。path 相对仓库根解析，不能逃逸。市场索引和条目不含版本；版本从 VERSION 与各根 manifest 读取。集合扩展按 [新增 ADR](../adr/[ADR]_Understanding_Kit_Addition.md) 取代旧单插件约束，退役插件仍不注册。

插件发布继续由 Git 仓库和版本标签分发，不在本索引绑定附加 wheel 或 checksum。

Explain Kit 新增边界见 [ADR](../adr/[ADR]_Explain_Kit_Addition.md)。严格验证拒绝缺失、重复、未知、错源条目；发布安装复查使用相同契约。
