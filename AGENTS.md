# MJ AgentLab Marketplace

## 项目上下文

当前市场包含 learn-kit 与 diagram-kit；实施中的迁移将只保留 diagram-kit / arch-diagram，目标客户端为 ChatGPT 桌面端和 Codex 本地环境，Codex CLI 验收基线 0.147.0。运行信息以市场索引、manifest 和 VERSION 为准。

## 执行与决策

代理负责在已有授权范围内执行文件修改、环境检查、测试、隔离安装验证、提交、推送及 PR 准备。owner 作出决定后，由代理执行，不要求 owner 复制命令，不重复确认已授权的操作。CI、分支保护、独立审查及外部身份验证按实际约束处理；无法完成时说明具体原因，只请求最小必要参与。

需要 owner 决策时，提供 2–3 个明确选项，说明主要影响，标记推荐项及理由。常规实现细节由代理判断；必须由 owner 决定的事项等待答复。已有决定不重复询问，推荐项不视为默认批准。

## 开发流程

使用独立 worktree 分支实施，保持 main / develop 工作区干净。变更执行前读取受影响的规范：治理用 [AI 工程规范](docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)，文档用 [文档框架](docs/rule/[STANDARD]_Documentation_Framework.md)，提交用 [提交规范](docs/rule/[STANDARD]_Commit_Message_Convention.md)，发布用 [发布操作](docs/runbook/[RUNBOOK]_Release_Operations.md)。

A6 同步目标为根 AGENTS.md；过渡期覆盖旧清单、旧技能与新 portable manifest / .agents/skills。治理迁移 PR 暂时同时更新 CLAUDE.md，以兼容目标分支的旧检查器。保留 required checks 名称与独立签核规则。正式发布需独立的发布授权与验收证据。

## Codex 会话维护

用户明确请求会话归档、推荐标题或重命名当前任务时，读取并遵循 [会话维护规则](.agents/references/session-maintenance.md)。引用、示例、否定和机制讨论不触发；普通任务“收尾”按实际对象处理。
