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

在独立 worktree 修改各插件根 manifest、skills 和资源。运行 npm ci、npm run validate、npm test、npm run check:baseline-tools 与 npm run smoke:codex。测试覆盖合法/非法 YAML、两插件索引及独立版本、版本原子更新与失败回滚、A6 防绕过、无资产发布状态机和 Python 校验器真实执行。

隔离安装使用独立 HOME、CODEX_HOME、cache、consumer cwd 和仓库镜像，验证 consumer 不发现 mp-*，repo 正确发现全部 19 个技能。安装元数据应解析两公开技能；普通 prompt 仅含 arch-diagram，显式调用的 pop-quiz 主动隐藏，另查 app-server 元数据与实际模型加载。用已安装的 arch-diagram 实际生成图与证据表，解析 Python 返回码。在 ChatGPT 桌面端另行完成市场、安装、composer 发现与调用；无原生 UI 控制能力时明确记录该限制，不能以 CLI 代替。

pop-quiz 的静态结构和 CLI 发现只证明可安装和加载；使用已安装技能进行职责差异、可信答案、2+1 分支、无答不推进、题量边界与只读行为回放，再独立检查 Codex Side Chat 和 ChatGPT 桌面端快照分支。按 [Understanding Kit 验收记录](../runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md) 分层登记实际结果。工程开发代理可执行仓库测试；pop-quiz 在学习会话只读取已有证据，不运行项目代码或测试。
