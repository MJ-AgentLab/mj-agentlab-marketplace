---
type: guide
scope: marketplace
summary: "Portable plugin development and isolated testing workflow"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.1
---

# [GUIDE] Plugin development and testing

在独立 worktree 修改根 manifest、skills 和资源。代理运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 与 npm run smoke:codex。测试覆盖合法/非法 YAML、两插件精确索引、三公开技能和 UI、版本原子更新与失败回滚、A6 防绕过、无资产发布状态机和 Python 校验器真实执行。

隔离安装分别覆盖 diagram-kit、explain-kit 与组合，使用独立 HOME、CODEX_HOME、cache、consumer cwd 和仓库镜像。consumer 分别发现 1/2/3 个公开技能且不发现 mp-*；repo 另发现全部 19 个开发技能。核对每个 locator 的实际安装身份和版本。安装缓存中的 Python 校验器必须实际执行。

代理用已安装技能验证解释行为和绘图输出/证据表，在可用客户端自动化能力内执行 ChatGPT 桌面端市场、安装、composer 发现与调用。能力或身份受限时记录具体限制，不以 CLI 代替，也不把例行操作交给 owner。新技能的代表用例及实际状态见 [验收记录](../runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。
