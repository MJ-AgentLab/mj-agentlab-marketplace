---
type: spec
scope: marketplace
summary: "Two-plugin local marketplace contract"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.1
---

# [SPEC] Marketplace index

.agents/plugins/marketplace.json 含稳定 name mj-agentlab-marketplace、interface.displayName 与 plugins[]。数组精确包含 diagram-kit 和 explain-kit，source 为 local，path 分别为 ./plugins/diagram-kit 和 ./plugins/explain-kit，installation 为 AVAILABLE，authentication 为 ON_INSTALL，category 为 Developer Tools。path 相对仓库根解析，不能逃逸。市场索引和条目不含版本。

插件发布继续由 Git 仓库和版本标签分发，不在本索引绑定附加 wheel 或 checksum。

新增解释插件的范围见 [ADR](../adr/[ADR]_Explain_Kit_Addition.md)；严格校验拒绝缺失、重复、未知或错源条目，发布安装复查使用相同契约。
