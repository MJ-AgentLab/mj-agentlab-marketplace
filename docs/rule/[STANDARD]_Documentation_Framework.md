---
type: standard
scope: marketplace
summary: "Documentation metadata, history preservation and AGENTS A6 synchronization"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.0
---

# [STANDARD] Documentation framework

## Scope and formats

当前规范文档放 docs/rule、adr、guide、runbook、spec、postmortem，使用 [TAG]_ 名称和 type/scope/summary/owner/created/updated/state/version 八字段 frontmatter。状态为 draft、active、deprecated、archived。INDEX.md 保留名且带文档 metadata。根 README、CHANGELOG、CONTRIBUTING、GLOSSARY、AGENTS 和技能 SKILL.md 遵循各自外部格式，不增加八字段。SKILL.md 必须是严格 YAML。

## Historical preservation

替换或退役前先保存历史正文、版本和来源，归档放 docs/archive 的扁平目录。只修复移动导致的链接；运行代码被删除时链接指向其精确历史 Git 提交。保留旧 CHANGELOG 披露及已有发布资产。归档含 archived 日期、replaced-by 和 banner，后继文档用 supersedes 建立关系；无后继的退役说明原因。根历史 ADR 可保留原路径并明确属于历史记录。

## §2.7 A6 synchronization

根 AGENTS.md 是项目摘要、执行原则和按需读取规范的入口。PR 触及 scripts/check-a6.mjs 的 isA6Trigger 所定义的路径时，同一 PR 更新相关摘要或指针；运行版本与技能清单仍以权威文件为准，不在入口复制。触发覆盖 STANDARD、VERSION、市场索引、根 portable manifest、公开技能/UI、.agents/skills 及发布关键脚本。过渡期旧路径保持匹配，以检测退役和删除。

## §4.3.1 A6 / Check

根 AGENTS.md 的 A/M 算同步，D/T 不算；三点 diff、NUL 路径解析与 shell:false 保持。检查器由目标 base 提供，PR 不能选择自己的判定器。无实质同步内容时，title 中 [skip a6] 与当前 head SHA 上的非作者 OWNER/MEMBER/COLLABORATOR 最新 APPROVED review 必须同时成立，body 精确等于 A6 N/A confirmed。旧批准、撤销、作者自签或仅 token 不能开门；输入/读取失败 fail closed。required-check 名称保留 A6 / Check 与 Validate Structure。workflow YAML 自身仍来自 PR merge ref，独立审查是该层已知约束。

## Links and index

当前文档使用标准 Markdown 相对链接；验证所有实际文件目标。历史引用按新归档位置或固定 Git 来源修复。新增、归档与替代关系同步 docs/INDEX.md。旧 v1.9 正文保留在 [归档](../archive/[DEPRECATED]_[STANDARD]_Documentation_Framework_v1.9.md)。
