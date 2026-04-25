# mj-doc

MJ System 文档工作流技能家族 — 提供文档规划、编写、校验、迁移、同步和审查能力。

> **v2.0 破坏性变更**: 仅支持已完成 Framework v5.0 迁移的仓库。混合 v4.5/v5.0 仓库需先运行 `mj-doc-migrate`。

## Skills

| Skill | 命令 | 触发场景 |
|-------|------|---------|
| author | `/mj-doc:mj-doc-author` | 编写 GUIDE/RUNBOOK/ADR/SPEC/POSTMORTEM/STANDARD/ISSUE/ASSESSMENT |
| migrate | `/mj-doc:mj-doc-migrate` | v4.5 → v5.0 迁移，或 `docs_old/` 旧格式文档迁移 |
| plan | `/mj-doc:mj-doc-plan` | 评估文档需求、规划多文档工作（输出到 `plans/`） |
| review | `/mj-doc:mj-doc-review` | PR 文档质量审查（A1-A6 + OB1-OB5） |
| sync | `/mj-doc:mj-doc-sync` | 代码变更后同步文档，生成 INDEX 管理块 |
| validate | `/mj-doc:mj-doc-validate` | 校验文档格式合规性（PASS/FAIL/WARN/SKIP） |

## Validator

`validate_doc.py` 提供 A1-A6 阻断性检查 + OB1-OB5 非阻断性检查：

- **A1**: 路径和文件名合法性
- **A2**: Frontmatter 模式完整性
- **A3**: 状态和枚举值校验
- **A4**: 内部链接目标存在性
- **A5**: INDEX.md 管理块同步
- **A6**: CLAUDE.md 允许列表触发（PR 模式）

INDEX.md 管理块由 `--write-managed-indexes` 生成，确保校验和生成使用同一渲染逻辑。

## 安装

```bash
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install mj-doc@mj-agentlab-marketplace
```

## 依赖

无 MCP Server 依赖。纯指令型技能。

## 许可证

MIT
