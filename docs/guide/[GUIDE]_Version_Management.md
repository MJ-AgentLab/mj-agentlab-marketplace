---
type: guide
scope: marketplace
summary: "Marketplace and independent plugin versions with transactional preparation"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.1
---

# [GUIDE] Version management

权威来源为市场 VERSION 与 diagram-kit、explain-kit 各自根 plugin.json 的 version。市场索引不携带版本；README badge 是市场版本的派生展示。

代理先执行 scripts/bump-version.ps1 的 -DryRun，使用 -Scope marketplace、diagram-kit 或 explain-kit，From 必须匹配真实版本，插件身份须匹配 Scope，To 必须合法 semver。脚本在所有目标预检成功后写入；任何写入或校验失败恢复原字节，清理失败只保留备份并报告。插件范围只修改自身根 manifest，历史正文不做全局版本替换。

新 explain-kit 初始化为已批准的 0.1.0，市场 8.0.1 pre-bump 与 diagram-kit 0.3.0 不连带变化。未来市场 8.1.0 是功能发布建议，转换及正式发布另需确认，见 [新增 ADR](../adr/[ADR]_Explain_Kit_Addition.md)。

owner 于 2026-10-09 授权先应用 8.0.0 / 0.3.0，并同步 CHANGELOG 和发布说明；版本准备不替代未完成的桌面端验收，正式发布仍需完整验收、检查、独立批准与发布授权。learn-kit 不发布新版本。阶段调整与 diagram-kit 的 0.x breaking 规则例外见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。develop 的发布后 pre-bump 保护继续运行。
