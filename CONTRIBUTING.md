# Contributing

在独立 worktree 和 codex/ 任务分支实施，main/develop 通过 PR。已授权编辑、测试、提交、推送和 PR 由代理执行，owner 只负责未决决定；[AI 工程规范](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) 是权威规则。

提交遵循 [提交规范](docs/rule/[STANDARD]_Commit_Message_Convention.md) 的 type(scope): summary，使用实际 Codex 协作者署名。发布历史提交保留，不改写旧版本记录。

验证 npm run validate、npm test、npm run check:baseline-tools、npm run smoke:codex 和实际客户端调用。A6 同步根 AGENTS.md；required checks、独立审查与 resolved threads 均须满足，禁止绕过。VERSION/diagram-kit 根 manifest 是两个版本权威，README badge 为派生。完整客户端验收完成后再应用计划版本并准备 release PR。
