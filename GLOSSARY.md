# Marketplace 术语

- **A6**：检查触发路径变更是否同步根 [AGENTS.md](AGENTS.md)；过渡期保留新旧触发路径和独立审查约束。
- **AGENTS.md**：项目指令和按需会话维护入口。
- **arch-diagram**：diagram-kit 的唯一公开技能，生成可追溯到源码事实的 Mermaid 架构图。
- **diagram-kit**：架构绘图插件，使用根 plugin.json 和根 skills/ 的 portable 格式。
- **explain-kit**：独立解释插件，glossary 默认速解，concept 默认深讲；按解释深度路由，六要素允许适应。
- **glossary / concept**：explain-kit 的两个公开技能；glossary 技能与本文这份市场术语表是不同用途。
- **开发技能**：.agents/skills 中的 19 个 mp-* 技能，仅在本仓库作用域发现。
- **Marketplace**：.agents/plugins/marketplace.json 中的插件安装索引；VERSION 是市场版本权威来源。
- **owner 决策**：代理提出 2–3 个明确选项和推荐理由，等待必要决策；决定后由代理执行。
- **Portable manifest**：插件根 plugin.json；根 version 是插件版本权威来源，OpenAI 展示信息位于 extensions.com.openai。
- **历史归档**：保留旧版 learn-kit、NotebookLM、Claude 方案及验收记录，见 [文档索引](docs/INDEX.md)。
- **发布**：通过 Git 仓库与版本标签分发，采用草稿、验收、发布前复查及不可覆盖保护。
