# Contributing

在独立 worktree 和 codex/ 任务分支实施，main/develop 通过 PR。已授权编辑、测试、提交、推送和 PR 由代理执行，owner 只负责未决决定；[AI 工程规范](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) 是权威规则。

提交遵循 [提交规范](docs/rule/[STANDARD]_Commit_Message_Convention.md) 的 type(scope): summary，使用实际 Codex 协作者署名。发布历史提交保留，不改写旧版本记录。

验证 npm run validate、npm test、npm run check:baseline-tools、npm run smoke:codex 和实际客户端调用；Python 图表校验必须实际执行。A6 同步根 AGENTS.md；required checks、独立审查与 resolved threads 均须满足，禁止绕过。VERSION 与各 plugins/*/plugin.json 的根 version 分别为市场及插件版本权威，README badge 为派生。新插件边界及代理执行原则见 [Explain Kit ADR](docs/adr/[ADR]_Explain_Kit_Addition.md)与 [Communication Kit ADR](docs/adr/[ADR]_Communication_Kit_Addition.md)。新包版本不连带修改其他插件；正式发布仍需完整客户端验收、独立批准和发布授权，旧阶段调整见 [迁移 ADR](docs/adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

Communication PR3 必须原子接入插件、注册、严格集合、冻结资源、图标及安装预期。候选五插件七技能、20 开发技能；pop-quiz / learning-record-check / guide / communicate 为四个显式入口，全量普通发现3/原生7，Communication 独装普通0/原生1。十三组合及 S01–S12 / C01–C18、双客户端基本可用性分别记实测结果；功能或真实客户端缺项保持 draft，静态检查、离线回放和模型自评不替代实际交互。源码目录用于来源追溯，安装运行使用包内三份冻结摘要及哈希。

[Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222) 的各阶段使用 Refs。Owner 已选择 Learning 先8.2.0、Communication 随后独立 minor（预计8.3.0）；PR4 重查实际 From/To 与基线范围。当前候选市场保持未发布8.1.2，新包0.1.0；main / 最新 Release 仍8.1.1。现实场景效果、个人试用、三稿对照、读者反馈、采用度与效率评价本轮延期；基础通过不代表现实效果已验证。

新增插件或品牌图标修改使用 `$mp-design-icon` 和 [品牌规范](docs/rule/[STANDARD]_Brand_Identity.md)。20 个开发技能仅用于仓库；每个插件只携带自己的图标和公开技能。
