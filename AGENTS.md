# MJ AgentLab Marketplace

## 项目上下文

当前开发版本注册 diagram-kit / arch-diagram 、understanding-kit / pop-quiz 与 explain-kit / glossary、concept，目标客户端为 ChatGPT 桌面端和 Codex 本地环境，Codex CLI 验收基线 0.147.0。运行信息以市场索引、各插件 manifest 和 VERSION 为准；已发布 main 的范围与开发分支分别记录。

understanding-kit 是显式调用的只读理解测验，Codex 优先 Side Chat；其他会话使用明确的上下文快照，不假定持续同步。插件边界及对旧单插件约束的局部替代见 [新增决定](docs/adr/[ADR]_Understanding_Kit_Addition.md)，真实客户端证据见 [验收记录](docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md)。learn-kit、NotebookLM 与 Claude 退役规则继续有效。

Understanding Kit 0.1.1 已通过 #197 合入 develop，历史失败、中性路径重测、回放和未覆盖项分开记录。该合并树已有 230 项回归与四种隔离安装证据；实际模型行为不替代两个目标客户端交互验收。owner 已授权继续并发布，本分支准备 marketplace 8.1.0，插件版本为 diagram-kit 0.3.0 / understanding-kit 0.1.1 / explain-kit 0.1.0。当前候选检查、客户端缺口、独立批准和发布身份见 [8.1.0 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)；候选版本不表示已发布。

explain-kit 0.1.0 提供速解和深讲，默认中文、保留术语原文，按深度路由并适应用户格式。新增解释能力的 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md) 与 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 不改变测验策略。

## 执行与决策

代理负责在已有授权范围内执行文件修改、环境检查、测试、隔离安装验证、提交、推送及 PR 准备。owner 作出决定后，由代理执行，不要求 owner 复制命令，不重复确认已授权的操作。CI、分支保护、独立审查及外部身份验证按实际约束处理；无法完成时说明具体原因，只请求最小必要参与。

需要 owner 决策时，提供 2–3 个明确选项，说明主要影响，标记推荐项及理由。常规实现细节由代理判断；必须由 owner 决定的事项等待答复。已有决定不重复询问，推荐项不视为默认批准。

## 开发流程

使用独立 worktree 分支实施，保持 main / develop 工作区干净。变更执行前读取受影响的规范：治理用 [AI 工程规范](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)，文档用 [文档框架](docs/rule/[STANDARD]_Documentation_Framework.md)，提交用 [提交规范](docs/rule/[STANDARD]_Commit_Message_Convention.md)，发布用 [发布操作](docs/runbook/[RUNBOOK]_Release_Operations.md)。

A6 同步目标为根 AGENTS.md；过渡触发器继续识别旧路径，当前技能位于 .agents/skills，插件使用根 plugin.json。运行 npm test、npm run validate、npm run smoke:codex；Python 图表校验必须实际执行。正式发布需独立的发布授权与两个目标客户端的验收证据。

Codex latest canary 的技能路径须按同一提示文本的 Skill roots 表展开别名，再核对实际缓存与仓库作用域；缺失映射或路径越界须失败。兼容 canary 不改变 0.147.0 验收基线，实际复验见 [迁移验收记录](docs/runbook/[RUNBOOK]_ChatGPT_Codex_Migration_Acceptance.md)。

develop 与 main 已完成治理迁移；结构校验与发布安装复查使用相同的严格校验，项目指令只从根 AGENTS.md 加载。

v8.0.0 已经 #190 合入 main 并自动发布，实际状态和未完成的桌面验收见 [发布记录](docs/runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)。发布后按 [发布操作](docs/runbook/[RUNBOOK]_Release_Operations.md) 同步 main 到 develop 并准备下一补丁 pre-bump；只更新 marketplace VERSION 与派生 README badge，插件版本按自身变更推进。

## Codex 会话维护

用户明确请求会话归档、推荐标题或重命名当前任务时，读取并遵循 [会话维护规则](.agents/references/session-maintenance.md)。引用、示例、否定和机制讨论不触发；普通任务“收尾”按实际对象处理。
