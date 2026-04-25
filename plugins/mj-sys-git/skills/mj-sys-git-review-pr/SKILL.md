---
name: mj-git-review-pr
description: This skill should be used when the user asks to review a Pull Request for architecture compliance, design consistency, or ops domain completeness in MJ System. It should also be invoked when the user pastes a PR URL, mentions a PR number, or asks about code structure issues in a branch. Triggers on "评审PR", "review PR", "审查PR", "PR评审", "review pull request", "这个PR能合吗", "可以merge吗", "帮我看看这个PR", "检查PR架构", "architecture review", "代码结构有没有问题", "检查一下这个分支", "PR review".
---

# MJ Git Review PR

## Overview

PR 架构评审与条件合并 skill。

**核心价值**：回答"这个 PR **应不应该**合"——检查架构合规、设计一致性、ops 域完整性。

与 `mj-git-check-merge`（回答"**能不能**合"——冲突、CI、审批）互补。

## 与现有 Skill 关系

| Skill | 关系 | 边界 |
|-------|------|------|
| mj-git-check-merge | 互补 | check-merge 做技术检查（冲突/CI/审批），review-pr 做架构评审 |
| mj-doc-review | 不重复 | review-pr 检测 docs/ 变更时提示运行 mj-doc-review，不自行做文档检查 |
| mj-git-sync | 不调用 | review-pr 只展示分支落后状态，不执行同步操作 |
| superpowers:code-reviewer | 不替代 | superpowers 做通用代码质量，review-pr 做 MJ 特有架构合规 |

## 前置条件

- `gh` CLI 已安装且已认证
- 当前在 worktree 目录中（可以是任意 worktree）
- 远端仓库可访问

## 快速开始

用户输入 → Skill 行为：

| 输入 | 行为 |
|------|------|
| `评审 PR #48` | 完整 5 阶段评审 |
| `帮我看看 feature/xxx` | 通过分支名定位 PR，完整评审 |
| `只看 SQL 变更的 PR #48` | 范围限定：只执行 F1-F2 + D4 |
| `PR #48 的变更概览` | 快速模式：只执行 Stage 1-2，不做架构评审 |

---

## 工作流

### Stage 1: 定位 PR

1. 解析用户输入（PR 编号 / 分支名 / PR URL）
2. 获取 PR 信息：
   ```bash
   gh pr view {input} --json number,title,state,baseRefName,headRefName,additions,deletions,changedFiles,commits
   ```
3. 验证 PR 状态为 OPEN
4. 识别分支类型（feature / bugfix / documentation / maintain / hotfix）

**STOP & ASK:**
- **H1**: PR 状态非 OPEN → 终止并提示："PR #{number} 当前状态为 {state}，无法评审"
- **H2**: 分支类型无法识别 → 使用 AskUserQuestion 询问用户确认分支类型

### Stage 2: 描述变更

1. 获取 PR 的 commit 列表：
   ```bash
   gh pr view {number} --json commits --jq '.commits[].messageHeadline'
   ```
2. 获取 diff stat：
   ```bash
   gh pr diff {number} --stat 2>/dev/null || gh api repos/{owner}/{repo}/pulls/{number}/files --jq '.[].filename'
   ```
3. 按类别统计变更文件（完整分类规则见 `scripts/classify_changes.py`，以下为摘要）：
   - **Code**: `src/**/*.py`, `components/**/*.py`, `main.py`, `scripts/**/*.py`, `test/**/*.py`
   - **SQL**: `sql/**/*.sql`, `sql/**/*.sh`, `sql/**/*.ps1`
   - **Config**: `*.yaml`, `*.yml`, `*.toml`, `.env*`, `docker-compose*`, `docker/**`, `Dockerfile*`
   - **Docs**: `docs/**/*.md`, `*.md`
   - **Other**: 不匹配以上任何模式的文件
4. 直接输出变更概览文本（不使用 AskUserQuestion）

> **快速模式中断点**: 如果用户只要求"变更概览"，到此结束。输出概览后直接进入 Handoff。

### Stage 3: 架构评审

读取 `review-checklist.md` 中的检查项定义，按以下流程执行。

#### 3.1 固定检查（每次必做）

按 `review-checklist.md` 中 F1-F3 的定义执行：

| 检查 | 方法 |
|------|------|
| **F1 分支同步** | `git log HEAD..origin/{base_branch} --oneline` 计算落后提交数 |
| **F2 变更概览** | 复用 Stage 2 的统计结果 |
| **F3 Commit 规范** | 提取所有 commit type，对照 Branch×Type 矩阵 |

#### 3.2 动态检查触发判断

根据 Stage 2 的文件分类结果，确定要触发的动态检查：

| 变更范围 | 触发的检查 |
|----------|-----------|
| `src/` 下有 **新** 服务目录 | D1（DDD 结构）+ D2（ops 完整性） |
| `main.py` 有变更 | D3（服务注册与中间件） |
| `sql/` 有变更 | D4（数据库变更合规） |
| `configuration/` 或 `.env*` 有变更 | D7（配置管理） |
| `docs/` 有变更 | 不触发动态检查，输出提示："建议运行 `/mj-doc-review` 检查文档质量" |

**范围限定模式**: 如果用户指定了评审范围（如"只看SQL"），只执行对应的动态检查 + F1-F2 信息展示。

#### 3.3 执行被触发的检查

读取 `review-checklist.md` 中对应检查项的定义（检查内容 + 通过标准），逐项执行。

**检查执行方式**：

- **D1 DDD 结构合规**: 列出新服务目录结构，对比 `[STANDARD]_Service_Architecture.md` §3 的三级架构模板
- **D2 ops 域完整性**: 检查 5 项配套组件（ODS 表、ETL 函数、触发器、中间件类、SYNC_MIDDLEWARE_CONFIG）
- **D3 服务注册与中间件**: 读取 `main.py`，确认路由注册、中间件顺序、path_prefix 一致性
- **D4 数据库变更合规**: 检查文件名格式、目录位置、COMMENT 注释；输出 `[STANDARD]_Database_Change_Review.md` 附录的快速检查清单
- **D7 配置管理**: grep 敏感模式（密码/IP）、检查 config_profile 使用、`.env.example` 同步

**STOP & ASK:**
- **H3**: 检查项判定模糊 → 标记为 ⚠️ 请人工判定，继续执行后续检查

#### 3.4 汇总

将所有检查结果汇总为结构化表格：

```
| # | 检查项 | 结果 | 说明 |
|---|--------|------|------|
| F1 | 分支同步 | ℹ️ | 同步 |
| F2 | 变更概览 | ℹ️ | Code 5 | SQL 2 | Config 1 |
| F3 | Commit 规范 | ✅ | 3 feat, 1 docs — 均在 feature/* 允许范围 |
| D3 | 服务注册与中间件 | ✅ | 路由已注册，中间件顺序正确 |
```

按严重程度分组发现的问题：Critical > Important > Suggestion。

### Stage 4: 人工确认 → 发布 comment

1. 使用 AskUserQuestion 展示评审结果摘要（结构化表格 + 发现的问题列表）
2. 提供选项：

```
options:
  - "发布到 PR — 将评审结果作为 comment 发布到 GitHub PR"
  - "修改后发布 — 我要调整部分内容后再发布"
  - "仅本地查看 — 不发布到 PR"
```

3. 如选择"发布到 PR"：
   - 按 `comment-template.md` 格式生成完整评审内容
   - 发布 comment：
     ```bash
     gh pr comment {number} --body "{review_comment}"
     ```
4. 如选择"修改后发布"：
   - 等待用户修改指示
   - 修改后重新确认
5. 如选择"仅本地查看"：
   - 跳过发布，直接进入 Handoff

### Stage 5: (可选) 合并

**仅在人工明确要求时触发**（"合并这个 PR" / "merge" / "合并"）。

**双重确认**：

- **H4**: 使用 AskUserQuestion："确认合并 PR #{number} `{head}` → `{base}`？"
  - 选项: "确认合并" / "取消"
- **H5**: 如确认，使用 AskUserQuestion："最终确认：执行 merge 后，PR 将被关闭，分支将被删除。继续？"
  - 选项: "执行合并" / "取消"

执行：
```bash
gh pr merge {number} --merge --delete-branch
```

合并成功后提示运行 `/mj-git-delete` 清理本地 worktree。

---

## 输出格式

- 评审结果的 GitHub Comment 格式见 `comment-template.md`
- 结果图标：✅ 通过 | ❌ 未通过 | ⚠️ 需人工判定 | ℹ️ 信息展示

---

## Handoff

评审完成后输出：

```
评审完成 ✓
  已完成项：架构评审 ✓ | 评审 comment {已发布到 PR #N / 未发布}
  建议下一步：
  - 文档变更 → /mj-doc-review
  - 技术合并检查 → /mj-git-check-merge
  - 直接合并 → 回复"合并"触发 Stage 5
```
