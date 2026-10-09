# Contributing

在独立 worktree 和 codex/ 任务分支实施，main/develop 通过 PR。已授权编辑、测试、提交、推送和 PR 由代理执行，owner 只负责未决决定；[AI 工程规范](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) 是权威规则。

提交遵循 [提交规范](docs/rule/[STANDARD]_Commit_Message_Convention.md) 的 type(scope): summary，使用实际 Codex 协作者署名。发布历史提交保留，不改写旧版本记录。

验证 npm run validate、npm test、npm run check:baseline-tools、npm run smoke:codex 和实际客户端调用。A6 同步根 AGENTS.md；required checks、独立审查与 resolved threads 均须满足，禁止绕过。VERSION 与 diagram-kit/explain-kit 各自的根 manifest 是版本权威，README badge 为派生。新插件边界及代理执行原则见 [Explain Kit ADR](docs/adr/[ADR]_Explain_Kit_Addition.md)。首次 explain-kit 0.1.0 不连带修改市场或 diagram-kit；正式发布仍需完整客户端验收、独立批准和发布授权，旧阶段调整见 [迁移 ADR](docs/adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。
