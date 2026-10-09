# 治理过渡同步说明

项目指令唯一权威入口为 [AGENTS.md](AGENTS.md)。

本文件仅用于 #186 / #187 合并前的旧 A6 同步检查，不恢复 Claude 支持。当前市场仅 diagram-kit，公开技能仅 arch-diagram，19 个开发技能位于 .agents/skills；learn-kit 与 NotebookLM 已退役。

两个治理 PR 合并后，代理须在 #188 合并前删除本文件及 CI 的临时校验选项，重跑新版 A6、结构校验与完整测试。正式发布校验始终拒绝本文件。
