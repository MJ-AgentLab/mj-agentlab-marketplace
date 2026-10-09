---
type: guide
scope: marketplace
summary: "Two version authorities and transactional version preparation"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.0
---

# [GUIDE] Version management

两个权威来源：市场 VERSION 与 plugins/diagram-kit/plugin.json 的根 version。市场索引不携带版本；README badge 是市场版本的派生展示。

代理先执行 scripts/bump-version.ps1 的 -DryRun，使用 -Scope marketplace 或 diagram-kit，From 必须匹配真实版本，To 必须合法 semver。脚本在所有目标预检成功后写入；任何写入或校验失败恢复原字节，清理失败只保留备份并报告。历史正文不做全局版本替换。

完整验收后统一应用计划 8.0.0 / 0.3.0、CHANGELOG 和发布说明；learn-kit 不发布新版本。diagram-kit 的 0.x breaking 规则例外见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。develop 的发布后 pre-bump 保护继续运行。
