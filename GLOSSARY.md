# Marketplace 术语

- **A6**：检查触发路径变更是否同步根 [AGENTS.md](AGENTS.md)；过渡期保留新旧触发路径和独立审查约束。
- **AGENTS.md**：项目指令和按需会话维护入口。
- **arch-diagram**：diagram-kit 的唯一公开技能，生成可追溯到源码事实的 Mermaid 架构图。
- **diagram-kit**：架构图插件，使用根 plugin.json 和根 skills/ 的 portable 格式。
- **learning-evidence-kit**：当前 0.1.0 候选插件，直接替换 understanding-kit；公开 pop-quiz 与 learning-record-check 均显式启动，共用持久化和流转能力不是第三技能。
- **understanding-kit**：公开 v8.1.1 中的历史理解测验包 0.1.2；新候选替换其注册，历史版本和证据保留。
- **pop-quiz**：显式调用，从当前职责与关键决策反推 MNK 和 KU，通过 2+1 自适应选择题收集局部理解证据。
- **learning-record-check**：先核验指定学习记录的有效性，再根据本人解释和已有验证材料核验任务中的知识应用；两个结论分别记录。
- **evidence ID**：稳定学习事件标识；跨 PR 共享或关联不计为新增学习，更正、重测和应用核验形成关联记录。
- **可恢复需求基线**：保存学习时完整原意、需求内容和条目；摘要、hash 或持续变化的路径不能单独代替原件。
- **共用能力**：包内 Python JSON 接口，承接明确保存、关联、恢复、导入导出、保留归档、授权评论共享和手动历史采集。
- **严格待答**：未提交、默认、超时和关闭不构成回答；原生窗口提交前持续显示须独立验证，文字重述不能代替。
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
