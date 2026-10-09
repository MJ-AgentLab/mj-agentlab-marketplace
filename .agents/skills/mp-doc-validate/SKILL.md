---
name: mp-doc-validate
description: "Use to validate marketplace documentation / 文档校验: frontmatter, state, naming, archive links, INDEX and root AGENTS.md A6 synchronization."
---

# mp-doc-validate

运行 npm run validate 检查当前文档链接与格式，核对 docs/INDEX.md 导航、历史 archive 来源与替代关系。用 scripts/check-a6.mjs 的 isA6Trigger 确认触发面，不复制正则；根 AGENTS.md 只有添加或修改算同步，删除/类型变更不算。A6 例外须 PR title [skip a6] 与当前 head SHA 的有效非作者 APPROVED 签核同时成立。历史 CHANGELOG 披露仍须通过 documentation-contract 测试。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
