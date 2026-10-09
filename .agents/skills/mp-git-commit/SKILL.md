---
name: mp-git-commit
description: "Use to stage and commit reviewed marketplace changes / 提交; validate the commit convention and execute within existing authorization."
---

# mp-git-commit

审查 diff 并只暂存任务文件；检查凭据、生成缓存和临时 PR 正文。读取提交规范，使用 type(scope): summary 和实际协作署名。执行已授权提交，验证提交内容和工作区。新提交只包含修复或实现，不将无关历史重写混入；提交失败先诊断钩子和验证结果。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
