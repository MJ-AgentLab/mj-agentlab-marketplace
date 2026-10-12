# AICS 冻结摘要来源

记录日期：2026-10-12（Asia/Taipei）。来源状态：**Lab Proposal / Informative**。communication-kit 把精选解释改编为原创运行摘要；插件发布不代表 AICS 已发布、Rule adopted 或现实沟通效果已验证。Refs #222。

运行资料只在本包内读取。以下本地路径是捕获时的追溯记录，不是消费者需要具有的目录，不授权运行时读取研究项目或自动同步。机器可核对的字节身份与摘要文件清单见 [aics-snapshot.json](aics-snapshot.json)；哈希证明字节身份，语义忠实仍需逐项对照来源。

## 实际来源

| 标识 | 捕获文件与选取章节 | 材料日期与版本状态 |
|---|---|---|
| PROJECT-current-learning | `D:/workspace/11-knowledge/01-AI-Communication-Research/PROJECT.md` 的“当前学习解释”：四类检查与 Evidence、Confirmed 与来源关系、Execution State 与完成声明；同时核对 §10.1 的适用项、强度、层次与 Correctness 边界 | 当前学习解释更新于 2026-10-08（Asia/Taipei）；§10.1 汇总更新于 2026-10-07（Asia/Shanghai）；整个文件在研究仓库中为 modified |
| RN-02 | `D:/workspace/11-knowledge/01-AI-Communication-Research/artifacts/RN-02-current-learning-reference.md` 的“当前速查”：四类检查、知识状态与来源关系、执行与完成、严格度与信息层次；核对 Source / Interpretation / Proposal 与核验范围 | created / updated 均为 2026-10-08；材料明确为 Lab Proposal / Informative；捕获时为 untracked |

来源仓库 HEAD 为 `474275b6d83d25bc5e8a23848b682df4a5199ff0`，工作区有未提交修改和未跟踪内容。该 HEAD 只是捕获环境身份，不声称来源两文件等于已提交版本。对实际文件字节重新计算的 SHA-256：

- PROJECT：`2f7cbd6883659673bb217b88f4bd8ff51cc292e904f3f491d86a1e8d2a6b7250`。
- RN-02：`6f2bf99fe5b126513fa21520874731219b5c4c5fe8175e19b6903f08e70030d3`。

未写入、提交或修正研究项目。未在本次独立核验其线上 Site；RN-02 的历史 Site、源码一致性和迁移结果只作为来源自述，不升级为本次客户端或效果证据。

## 选取、改编与排除映射

| 处理 | 来源定位与含义 | 包内落点与适配 |
|---|---|---|
| 选取并提炼 | PROJECT“当前学习解释 / 四类检查与 Evidence”；RN-02“当前速查 / 四类检查” | aics-policy 的四类审校表；保留 Evidence 跨项与 Provenance 来源关系，作为写作审校视角，非强制可见字段 |
| 选取并提炼 | PROJECT“Confirmed 与来源关系”；RN-02“知识状态与来源关系” | aics-policy 的具体 Claim、四种知识状态与来源报告边界；保留来源陈述、样本结果、因果与可推广效果各自需要依据 |
| 选取并提炼 | PROJECT“Execution State 与完成声明”；RN-02“执行与完成” | aics-policy 的四阶段 Execution State、Report Status、局部检查与整体完成；保留必要工作缺失时尚未完成的判断 |
| 选取并提炼 | PROJECT §10.1 的 Correctness、适用项与 Golden Rule；RN-02“严格度与信息层次” | aics-policy 的适用强度与分层；保留正确性约束和影响判断的失败、风险、例外可见性 |
| 插件适配 | 四类检查与 Correctness 对当前任务的适用含义 | task-patterns 的沟通、编写、改写模式；主技能的关键内容核对。连续修改保护、澄清选项等待、成稿加提示及 Markdown/TXT 回读来自本插件已确认产品契约，不宣称 AICS 原文逐项规定 |
| 排除 | PROJECT 的研究治理、启动与权威顺序、会话维护协议、完整研究 Workflow / 模板、Rule Lifecycle、Site 管理与 Harness metadata | 不进入运行指令，不复制研究项目的启动、归档、发布或治理责任 |
| 排除 | RN-02 的后续现实案例比较、研究 Evaluation 与历史文件核验结果 | 不要求消费者进行研究实验，不把历史检查或模型审校作为当前功能、客户端可用性或现实效果证据 |
| 排除 | v0.1 原文、旧图、线上 Field Guide 整包及外部标准全文 | 仅以已读当前解释与 RN-02 为直接来源；不机械搬用完整标准、第三方规则或历史分类 |

## 更新方式与证据边界

包内 aics-policy、task-patterns 和本来源记录均由冻结记录保存 SHA-256，避免摘要字节悄然漂移。运行时不追随研究项目更新。

后续仅在明确请求后重新读取来源、评估任务适用性、记录变化与排除项、重算哈希，并随插件版本更新完成受影响的基础功能复验。评估来源和功能适配不等于恢复本轮延期的现实效果实验。来源或摘要变动产生新的候选身份和验证批次，保留历史失败及复验记录。

本轮基础验收只支持其实际覆盖的结构、安装、功能、语义保真、操作边界和客户端基本可用性。九例个人试用、三稿对照、读者反馈、采用度和效率提升本轮不执行；稿件更自然或检查通过均不证明现实沟通收益。
