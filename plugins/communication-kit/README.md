# Communication Kit

面向 ChatGPT 桌面端与 Codex 本地环境的沟通插件。唯一公开入口为 `$communication-kit:communicate`，界面名称为 **Communication Kit**，英文简介为 “Draft clear messages and documents while preserving meaning.”。包版本为 0.1.0；本次仅维护显示文案，尚未发布该变更。

显式调用后，可处理当前任务的日常沟通、文档编写和保义改写，以及这些稿件的连续修改。改写保留事实、立场、条件、例外、责任和真实承诺。关键缺口先给出明确选项、推荐及理由，等待选择；非关键缺口使用明确假设或占位。

默认在聊天中交付成稿和简短关键提示，按用户要求调整语言、语气、长度和格式。例如：

- `$communication-kit:communicate 帮我给项目组写一条协调消息：测试已通过，请各负责人明天下午三点前确认是否可以上线。`
- `$communication-kit:communicate 根据这些零散要点编写一份说明，保留未决事项，不新增数据或决议。`
- `$communication-kit:communicate 把这份说明改得更容易阅读，保留所有条件、例外和责任，不增强承诺。`

明确要求后才保存或编辑 Markdown/TXT 文件，并回读核对。其他格式按客户端实际能力处理并说明交付范围。稿件交付不自动授权发送消息、发布文档或修改外部系统。

运行只依赖本包内的精选 AICS 冻结摘要；来源保持 **Lab Proposal / Informative**。来源路径、实际字节哈希、选取和排除映射见 [来源记录](skills/communicate/references/source-provenance.md)；研究目录仅用于追溯。无 MCP、脚本、额外服务或认证依赖。

本轮只验证结构、安装、基础功能、语义保真、操作边界及必要客户端可用性。现实沟通效果另测，基础通过不代表采用度、效率或读者效果已验证。候选尚未发布，图标与原子集成由实施 PR 接入；本文件不声明安装或客户端验收已通过。
