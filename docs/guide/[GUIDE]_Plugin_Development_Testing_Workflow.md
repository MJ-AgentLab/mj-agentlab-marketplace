---
type: guide
scope: marketplace
summary: "Portable plugin development and isolated testing workflow"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.0
---

# [GUIDE] Plugin development and testing

在独立 worktree 修改根 manifest、skills 和资源。运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 与 npm run smoke:codex。测试覆盖合法/非法 YAML、单插件索引、版本原子更新与失败回滚、A6 防绕过、无资产发布状态机和 Python 校验器真实执行。

隔离安装使用独立 HOME、CODEX_HOME、cache、consumer cwd 和仓库镜像，验证 consumer 不发现 mp-*，repo 正确发现全部 19 个技能。用已安装的 arch-diagram 实际生成图与证据表，解析 Python 返回码。在 ChatGPT 桌面端另行完成市场、安装、composer 发现与调用；无原生 UI 控制能力时明确记录该限制，不能以 CLI 代替。
