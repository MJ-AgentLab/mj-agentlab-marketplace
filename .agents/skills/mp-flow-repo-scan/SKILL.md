---
name: mp-flow-repo-scan
description: "Use for marketplace repo scan / 事实核查 before implementation: inspect worktrees, plugin facts, versions, documentation and CI without changing files."
---

# mp-flow-repo-scan

只读核查当前 worktree、未提交改动、远端和目标分支；扫描 .agents/plugins/marketplace.json、plugins/diagram-kit/plugin.json、公开 arch-diagram 和 .agents/skills 下的 19 个开发技能。对照 VERSION、当前文档、历史归档和 CI。记录事实位置、漂移和受影响文件，不用历史 ADR 推断当前插件集合。输出可支持实施的事实与约束。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
