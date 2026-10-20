# #274 完整 main 同步与 HTML0.1.39 独立合同审查

本批未提交候选的 **48 项只读检查通过**。没有发现需要新增 Owner 实质决定的问题，可以继续正常内部提交及子 PR 门禁。审查只覆盖当前候选、来源与历史保护，不代替当前提交的 CI、受保护 develop 的真实批准、实际合入复验或 Owner 最终接受。

审查者为 `/root/alignment_sync_contract_review`。实际审查于 2026-10-20T11:53:06Z–11:53:16Z 执行，工作目录为 `C:/Users/Admin/.codex/worktrees/html-alignment-sync/develop`。HEAD 为 `fe295a005e1659ea210a9768bbcce88d72ed64f4`，MERGE_HEAD 为 `f18aa09be0cc4a96b5005157566f7f4fd4947c95`。这是正常完整 main merge 尚未提交的候选，不能据此宣称集成分支或 protected develop 已收到实际 merge。

## 可复现证据

- [独立脚本 r2](./audit-candidate-r2.py)；[逐项结果与全部 2575 个文件的实际 SHA256](./candidate-review-20261020T115316Z.json)。脚本不写仓库、不 fetch、不创建 Git 对象、不执行测试或外部发布。
- actual main 的 tree 为 `6f921a482ba927b82e4c5d8d13ab9e1c8559edd6`，恰与旧预解映射的必要输入相等；当前 MERGE_HEAD 和无未解冲突状态得到独立核对。
- 当前来源清单 SHA256 为 `09985285d6819caafb3481cb6ed3a7625f4ad71f1149592057cc958272682fae`。全部 2575 个文件路径均在本任务 evidence/sources 下，实际字节符合各自声明 hash；2554 个原文件的 index blob 保持各自权威 Git 身份。
- main 的 2400 个完整来源对象保持前缀；后接原 alignment 的 154 个分叉增量，ID、hash、顺序不改；最后追加本轮 21 条。没有把两个分叉的完整来源集合同时宣称为前缀。
- PLAN、REPORT 各自 32 个 C/P 旧行前五列（REPORT 实际只有三列）与两分支原件相等；A01–A08 原表逐行相等，REPORT 合并物理行仍完整覆盖八个 ID。唯一选择决定正本区保留原字节。
- root CHANGELOG 从已公开 8.3.3 节起的全部历史，与 actual main 在换行表示归一后相等；插件 CHANGELOG 从已公开 0.1.38 节起全部历史同样保持。.39 节与原 alignment 相等。默认安装 README 与 actual main 相等。
- 市场 VERSION 仍 8.3.3，HTML manifest 为未发布候选 0.1.39。HTML 运行资源（除 README/CHANGELOG）及原 guide 四资源、其余四包、scripts/tests/workflows 全部保持原 alignment Git blob 及工作区内容。
- AGENTS 预算为 LF 16204 B、CRLF 16297 B，均低于不变的 16384 B 上限。Owner 原计划文件实际 SHA256 仍为 `dc9d58437778093ae9b51d052908712a3bbb2624f16ff335f5210435ca2f0895`。本次审查前后 index/status 相同。

首跑结果 [candidate-review-20261020T115224Z.json](./candidate-review-20261020T115224Z.json) 保留一项审查 helper 误判：原脚本只识别 PLAN 的 `C01 / ...` 行格式，REPORT 使用合法的 `C01 | ...`，三方 REPORT 都被提取为零行。r2 只扩展读取表达式接受两种既有格式，候选、判准与原件未改。原 [脚本](./audit-candidate.py) 和首跑结果均未覆盖。

## 语义与接受边界

INTENT v1.2 只刷新公开版本、已结束 PR 和后续工程阶段，并提供 v1.1 固定 Git 恢复点。O1–O6、S1–S5、R1/R3–R5 共十五个业务条目逐字不变；R2 的六步/B2/U2/AICS/旧接受业务部分也保持。唯一身份 `INT-2026-003`、draft 状态、十字段和既有接受边界维持，没有将更新工程时点解释成新的原意接受。

统一后的合同继续遵守 Owner 已明确选择：按需真实 Matt grilling、关键设计共识明确确认、主题可选、原材料只读而独立目录可生成产物、本地交付须明确约定、Sites 缺失不静默降级。原本地生成器、检查、许可和保护边界保留。本轮不增加 Site 对象、受众或外部发布动作，也没有新增产品选择需要 Owner 决定。

完整 B2 API 捕获及 Slack 返回全文没有进入公开来源集合；公开仍只保存必要捕获元数据、原始链接和私有恢复位置。没有将 API 文本捕获称作上传原文件字节。

原核心 `ACCEPTED_LIMITED` 不扩至 .38、Site v2、.39 或全计划；全计划保持 OPEN，新最终接受未提供。D01 持续窗口及空返回/超时/关闭仍 DEFERRED、非 PASS；理解效果 NOT_MEASURED。历史 Linux 启动 FAIL/UNKNOWN、版本预期 FAIL、长 TEMP checkout FAIL/未保存具体根、helper guard FAIL，以及保护合并的 bypass/批准 NOT_MET 均按原身份保留；本次没有模拟真人、重启模型/桌面/原生窗口或执行新浏览器测试。

新顶层阶段描述与实际候选相符：完整 main 正常 merge 已进入隔离候选，但未提交、未合入集成或 protected develop；后续新提交检查仍待自身证据。阶段信息附下一步推荐、理由和执行条件，没有把检查、合并或来源完整性当作 Owner 接受。

## 下一步推荐

固定本候选为正常双亲 merge 提交，完成本轮实际工程检查及子 PR 当前 head CI 后正常合入既有集成分支，再通过唯一主 PR 向 protected develop 交付完整 main ancestry 与 0.1.39。理由是候选的合同、来源和历史已可审查，剩余是实际提交与保护门禁。实际 develop 同步合入并复验后，才可对市场 8.3.4 执行 DryRun→Apply；本轮尚未预升或发布。

本报告没有运行 npm/CLI/smoke/浏览器/模型/桌面/原生/Sites，也没有核验尚未产生的新提交服务器 CI 或保护批准。工程验证由该批实际运行回执独立报告。
