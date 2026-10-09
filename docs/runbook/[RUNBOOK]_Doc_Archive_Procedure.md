---
type: runbook
scope: marketplace
summary: "代理执行文档归档、来源核对及历史链接验证"
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-10-09
state: active
version: v2.0
last-verified: 2026-10-09
---

# 文档归档流程

在授权的隔离 worktree 内由代理完成归档。当前正文大幅重写、拆分/合并、迁移或退役时保留旧版本；普通文字修正无需归档。常规引用分类由代理判断，只有范围或替代方案未决时才向 owner 提供 2–3 个选项及推荐，已有决定不重复确认。

1. 记录原路径、版本、Git 来源提交和原始 blob SHA-256；核对来源可复现。
2. 将历史副本保存到 docs/archive 的平面目录，保留正文和原版本，添加归档状态、日期、后继指针与说明。退役文档由 ADR 解释替代关系。
3. 修复正文及 related/supersedes 链接。当前说明指向后继；历史事实指向归档；已删除运行文件指向固定 Git 提交。检查模板中的示例不当成运行路径。
4. 更新 [文档索引](../INDEX.md) 和来源账本，验证没有断开的本地链接、版本漂移或丢失的历史段，再执行文档及 A6 检查。

[旧流程](../archive/[DEPRECATED]_[RUNBOOK]_Doc_Archive_Procedure_v1.1.md) 保留历史语义，当前执行以本流程和 [AI 工程规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) 为准。
