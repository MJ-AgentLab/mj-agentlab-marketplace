# Library Renewal · 续借判断学习制品 — 本次学习记录

- 材料版本：synthetic-1.0
- 记录时间：2026-10-19T10:13:57.286Z
- Audience：能够读懂基本日期，但尚未区分规则许可、申请提交与完成确认的学习者。
- Task：根据本页自编规则，解释续借是否允许、成功或失败后的日期，以及确认完成所需依据。
- 范围：当前会话的回答与核对；理解效果 NOT_MEASURED。

## permission-check · Rule Permission · 核对规则许可

- 题目：一本书尚未逾期，但已有其他读者预约。按 LIB2，本次是否允许续借？
- 当前选择：未选择
- 核对次数：0
- 本次判断：当前选择尚未核对
- 参考判断：本次不允许。LIB2 要求尚未逾期且没有其他读者预约，两项条件同时成立才规则允许；规则允许仍不等于已成功。
- 来源 ID：renewal-rules
- 页面回查：#source-renewal-rules

## date-check · Calendar Day · 核对跨月日期

- 题目：原到期日为 2026-10-29。按 LIB3，续借成功与失败后分别何时归还？
- 当前选择：未选择
- 核对次数：0
- 本次判断：当前选择尚未核对
- 参考判断：成功：2026-11-05；失败：2026-10-29。日期基准是原到期日，不是申请日；增加的是七个日历日。
- 来源 ID：renewal-rules
- 页面回查：#source-renewal-rules

## completion-check · Completion Confirmation · 核对完成依据

- 题目：已经点击申请，但尚未看到成功文字与更新后的归还日期。按 LIB4，此时能确认什么？
- 当前选择：未选择
- 核对次数：0
- 本次判断：当前选择尚未核对
- 参考判断：只能确认申请提交。完成确认需同时有续借成功文字和更新后的归还日期；结果未确认时保留未知，不补造失败或后台步骤。
- 来源 ID：renewal-rules
- 页面回查：#source-renewal-rules

## Sources · 来源

### renewal-rules · Synthetic Renewal Rules · 自编续借规则

- 来源 ID：renewal-rules
- 标题：Synthetic Renewal Rules · 自编续借规则
- 定位：LIB1–LIB4；本插件的合成验收材料，不是任何真实图书馆政策。
- 制品内相对路径：sources/renewal-rules.md

## 应用与意见

尚未填写。

记录未上传、未持久化；保存导出后由你自行保留。
