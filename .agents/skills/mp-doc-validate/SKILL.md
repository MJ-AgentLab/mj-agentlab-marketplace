---
name: mp-doc-validate
description: "Use to validate marketplace documentation / 文档校验: frontmatter, state, naming, archive links, INDEX and root AGENTS.md A6 synchronization."
---

# mp-doc-validate

有 INTENT 或其模板/接线变更时按[INTENT 规范](../../../docs/rule/[STANDARD]_AI_Engineering_Intent.md)核对十字段、七行来源责任表、五部分、目录/ID/索引和包含退役归档的全正式集合；单文件仍查全局唯一性，不完整读取不得报通过。合法接受快照与正式正本分开，语义忠实/真实决定由独立证据判断。

运行 npm run validate，按[文档框架](../../../docs/rule/[STANDARD]_Documentation_Framework.md)检查 docs/plans 的九字段/layer、稳定 task/tracking、INDEX 主 PLAN/REPORT/正本链接、公共 working purpose 和显式兼容清单；旧缺 layer 不推定 canonical。核对 docs/INDEX 导航、archive 原始 Git blob/替代范围、具名来源清单及恢复快照。文件通过不替代完整资源闭包或独立阅读/交接验收；失败/未查/缺证如实登记。用 scripts/check-a6.mjs 的 isA6Trigger 确认触发面，不复制正则；根 AGENTS.md 只有添加或修改算同步，删除/类型变更不算。A6 例外须 PR title [skip a6] 与当前 head SHA 的有效非作者 APPROVED 签核同时成立。历史 CHANGELOG 披露仍须通过 documentation-contract 测试。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
