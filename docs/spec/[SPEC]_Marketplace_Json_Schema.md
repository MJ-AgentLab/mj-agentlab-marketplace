---
type: spec
scope: marketplace
summary: "Three candidate plugins, five public skills and exact local marketplace sources"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-12
state: active
version: v2.3
---

# [SPEC] Marketplace index

.agents/plugins/marketplace.json 含稳定 name mj-agentlab-marketplace、interface.displayName 与 plugins[]。当前开发数组包含以下三项：

| name | source.path | 公开技能 |
| --- | --- | --- |
| diagram-kit | ./plugins/diagram-kit | arch-diagram |
| learning-evidence-kit | ./plugins/learning-evidence-kit | pop-quiz、learning-record-check |
| explain-kit | ./plugins/explain-kit | glossary、concept |

每项 source 为 local，installation 为 AVAILABLE，authentication 为 ON_INSTALL，category 为 Developer Tools。path 相对仓库根解析，不能逃逸。市场索引和条目不含版本；版本从 VERSION 与各根 manifest 读取。候选集合按 [Learning Evidence Kit 迁移 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md) 直接替换 understanding-kit，没有过渡插件。两个学习技能都设置显式调用策略；共用脚本不成为第六个公开技能。

当前候选 marketplace 为未发布 8.1.2，learning-evidence-kit 为 0.1.0，diagram-kit 0.3.1 / explain-kit 0.1.1 保持。目标 8.2.0 在 PR5 准备；公开 v8.1.1 仍是 Understanding Kit 0.1.2 的旧集合，不能用该标签安装新包。

插件发布继续由 Git 仓库和版本标签分发，不在本索引绑定附加 wheel 或 checksum。

Explain Kit 新增边界见 [ADR](../adr/[ADR]_Explain_Kit_Addition.md)。严格验证拒绝缺失、重复、未知、错源条目；发布安装复查使用相同契约。
