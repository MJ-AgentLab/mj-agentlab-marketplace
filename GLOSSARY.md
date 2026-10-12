# Marketplace 术语

- **A6**：检查触发路径变更是否同步根 [AGENTS.md](AGENTS.md)；过渡期保留新旧触发路径和独立审查约束。
- **AGENTS.md**：项目指令和按需会话维护入口。
- **arch-diagram**：diagram-kit 的唯一公开技能，生成可追溯到源码事实的 Mermaid 架构图。
- **diagram-kit**：架构图插件，使用根 plugin.json 和根 skills/ 的 portable 格式。
- **understanding-kit**：当前开发版本新增的只读理解测验插件，初始版本 0.1.0，唯一公开技能为 pop-quiz；未恢复退役 learn-kit。
- **pop-quiz**：显式调用，从当前职责与关键决策反推 MNK 和 KU，通过 2+1 自适应选择题收集局部理解证据。
- **KU（Knowledge Unit）**：围绕单一可观察理解目标的知识单元，须有可信来源、关联决策和明确边界。
- **MNK（Minimum Necessary Knowledge）**：当前任务、职责和风险下，作出正确判断所需的最小充分知识集合；不等于 Top 3 候选或已完成测验的知识。
- **上下文快照**：本轮可访问的任务片段、文件版本与证据范围；Side Chat 或普通会话不假定持续同步主会话。
- **四象限**：Q1 双方证据达标、Q2 人类理解缺口、Q3 AI 侧证据缺口、Q4 双方未解决；证据不足保留 Undetermined，测验正确不证明长期独立能力。
- **2+1**：同一 KU 先收集结果判断与因果解释两题，按回答决定是否追加一题；教学前诊断与教学后即时练习分开记录。
- **开发技能**：.agents/skills 中的 20 个 mp-* 技能，仅在本仓库作用域发现。
- **Marketplace**：.agents/plugins/marketplace.json 中的插件安装索引；VERSION 是市场版本权威来源。
- **owner 决策**：代理提出 2–3 个明确选项和推荐理由，等待必要决策；决定后由代理执行。
- **Portable manifest**：插件根 plugin.json；根 version 是插件版本权威来源，OpenAI 展示信息位于 extensions.com.openai。
- **历史归档**：保留旧版 learn-kit、NotebookLM、Claude 方案及验收记录，见 [文档索引](docs/INDEX.md)。
- **发布**：通过 Git 仓库与版本标签分发，采用草稿、验收、发布前复查及不可覆盖保护。

- **explain-kit**：独立解释插件，初始 0.1.0；公开 glossary 与 concept。
- **glossary / concept**：术语速解 / 深入机制、反例和边界解释；本文件是市场术语表，不是 glossary 的运行技能。

- **communication-kit**：PR3 原子接入的未发布 0.1.0 候选插件，沟通、编写与保义改写共用[单入口](plugins/communication-kit/skills/communicate/SKILL.md)。main / v8.1.1 尚不包含本包。
- **communicate**：显式调用的“沟通助手”；关键缺口先问并等待，交付成稿＋关键提示，明确要求后才保存或编辑 Markdown/TXT 并回读。
- **保义改写**：调整表达、结构和详略，同时保留事实、立场、条件、例外、责任、义务强度和真实承诺。
- **AICS 冻结摘要**：包内精选原创运行资料，保留 Lab Proposal / Informative；源字节哈希和 Git 脏状态用于追溯，三份摘要哈希用于完整性检查，来源目录不是运行依赖。
- **基础可用性**：结构、安装、合成功能、语义保真、操作边界和必要客户端交互的实测范围；通过不证明现实沟通效果、采用度或效率收益。
