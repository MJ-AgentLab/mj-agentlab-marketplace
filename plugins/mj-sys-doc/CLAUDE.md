# CLAUDE.md — mj-doc Plugin

## Plugin 概述

mj-doc 是 MJ System 的文档工作流技能家族 Plugin，提供 6 个 skill + 1 个共享资源：

> **v2.0 破坏性变更**: mj-doc v2.0 仅支持已完成 Framework v5.0 迁移的仓库。混合模式仓库需先运行 `mj-doc-migrate`。

| Skill | 命令 | 职责 |
|-------|------|------|
| **author** | `/mj-doc:mj-doc-author` | 按模板编写指定类型文档（GUIDE/RUNBOOK/ADR/SPEC/POSTMORTEM/STANDARD/ISSUE/ASSESSMENT） |
| **migrate** | `/mj-doc:mj-doc-migrate` | 将旧格式文档（v4.5 或 `docs_old/`）迁移为 Framework v5.0 格式 |
| **plan** | `/mj-doc:mj-doc-plan` | 评估某主题/服务需要哪些文档，规划多文档工作（输出到 `plans/`） |
| **review** | `/mj-doc:mj-doc-review` | PR 文档质量审查（A1-A6 + OB1-OB5 质量门检查） |
| **sync** | `/mj-doc:mj-doc-sync` | 代码变更后同步更新关联文档，通过 validator 生成 INDEX 管理块 |
| **validate** | `/mj-doc:mj-doc-validate` | 校验文档是否符合 Framework v5.0（A1-A6 + OB1-OB5），返回 PASS/FAIL/WARN/SKIP |

## 三层治理模型

| 层级 | 路径 | 治理强度 |
|------|------|---------|
| Canonical | `docs/**` | 强治理（A1-A6 + OB检查） |
| Working | `plans/**` | 轻治理（简化 frontmatter） |
| Legacy | `docs/archive/legacy/**` | 不治理（仅保留可读性） |

## 共享资源

`skills/mj-doc-shared/question-patterns.md` 定义了所有 doc skill 共用的交互问题模板（Q-01 ~ Q-12）和破坏性操作确认（D-01 ~ D-04）。各 skill 通过相对路径 `../mj-doc-shared/question-patterns.md` 引用。

## Skill 调用约定

- 所有 skill 遵循 Phase 式工作流
- 用户交互统一使用 `AskUserQuestion` 工具（从不使用纯文本提问）
- 破坏性操作（覆盖文件、删除文档）需用户二次确认
- 内部调用链：`plan` → `author` → `validate`；`sync` / `review` 均调用 `validate`

## 文件结构

```
skills/
├── mj-doc-author/       # 编写技能 + template-patterns.md + type-decision-reference.md
├── mj-doc-migrate/      # 迁移技能 + migration-rules.md
├── mj-doc-plan/         # 规划技能 + plan-checklist.md
├── mj-doc-review/       # 审查技能 + quality-gate.md
├── mj-doc-shared/       # 共享资源（question-patterns.md）
├── mj-doc-sync/         # 同步技能 + code-doc-mapping.md
└── mj-doc-validate/     # 校验技能 + validation-rules.md + obsidian-rules.md + scripts/ + tests/
```
