---
type: postmortem
scope: marketplace
summary: Bulk branch cleanup (2026-05-18) 触发 3 个 trap — regex prefix / local-remote 对称性 / Windows gh api leading slash
owner: ranzuozhou
created: 2026-05-18
updated: 2026-05-18
state: active
version: v1.0
severity: P3
incident-date: 2026-05-18
resolved-at: 2026-05-18T05:10:00Z
related:
  - ../runbook/[RUNBOOK]_Release_Operations.md
---

# [POSTMORTEM] 2026-05-18 Bulk Cleanup Trap Analysis

| Field | Value |
|-------|-------|
| Severity | **P3** (recovered, no data loss, no user impact) |
| Incident date | 2026-05-18 |
| Detected at | 2026-05-18 04:55 UTC (mid-execution) |
| Resolved at | 2026-05-18 05:10 UTC |
| Duration | ~15 min (regex bug recovery + 2nd remote pass + Windows endpoint retry) |
| Affected | 1 maintainer (ranzuozhou) extra effort; local `main` ref briefly missing |

## §1 Summary

执行 marketplace 仓库一次性 bulk cleanup（PR #119-#124 cycle 后累积的 33 local + 38 remote merged 分支），过程中触发 3 个非显然的 trap：

1. `git branch --merged` filter regex 漏掉 `+ main` 前缀，导致 `main` 本地 ref 被 `xargs git branch -d` 误删（即刻 `git branch main origin/main` 恢复，remote 从未受影响）。
2. 原 Explore agent audit 用 "All 40 remote sync with local" 措辞，导致首次只 push --delete 5 个远端孤儿，遗漏 33 个，需第二轮补删。
3. Windows Git Bash 把 `gh api -X PATCH /repos/...` 中的 leading slash 改写成 `C:/Program Files/Git/repos/...`，端点失败 1 次。

所有 trap 立即恢复，**无数据丢失，无用户可见影响**，仅消耗维护者额外 ~15 min。Cleanup 任务本身成功完成（仓库现 local=2 / remote=3 refs + `delete_branch_on_merge=true` 已启用）。

## §2 Timeline

| Time (UTC) | Event | By |
|------|-------|-----|
| 2026-05-18 04:50 | 开始 bulk cleanup，执行 pre-flight 4-check 全过 | maintainer + Claude |
| 2026-05-18 04:52 | 执行 `git branch --merged develop \| grep -v ... \| xargs git branch -d` | Claude |
| 2026-05-18 04:53 | 输出含 `error: branch '+' not found` 与 `Deleted branch main (was 587cd12).` | observation |
| 2026-05-18 04:53 | 立即诊断：bare worktree 用 `+ main` prefix；原 regex `^\s*\*?\s*` 未匹配 `+` | Claude |
| 2026-05-18 04:54 | 恢复：`git branch main origin/main` | Claude |
| 2026-05-18 04:56 | 转向 remote 删除；首次 `git push origin --delete` 5 个分支（按 audit 列表） | Claude |
| 2026-05-18 04:57 | RPC 错误 + `git fetch --prune` 显示 5 个确实已删；但 `git branch -r` 仍 35 个 | observation |
| 2026-05-18 04:58 | 诊断：audit 把 "remote 与 local 同名" 等同 "remote 已同步删除"，实际两者独立 | Claude |
| 2026-05-18 04:59 | 第二轮 `xargs git push origin --delete` 删 33 个，全成功 | Claude |
| 2026-05-18 05:05 | 尝试 `gh api -X PATCH /repos/...`，Git Bash 报 `invalid API endpoint: "C:/Program Files/Git/repos/..."` | observation |
| 2026-05-18 05:06 | 诊断：MSYS 路径改写；去 leading slash 重试成功 | Claude |
| 2026-05-18 05:08 | `delete_branch_on_merge: true` 设置生效 | confirmation |
| 2026-05-18 05:10 | Final verify：local=2 / remote=3 refs / setting=true，incident closed | maintainer |

## §3 Root Cause

- **Immediate cause** (Trap #1)：filter regex `^\s*\*?\s*(main|develop)$` 字符类只覆盖 `*` 不含 `+`；bare repo + worktree 模式下 `main` 被 `.bare/` 占用，`git branch` 输出 `+ main`，未被过滤，泄漏到 `xargs`。
- **Immediate cause** (Trap #2)：`git branch -d` 是本地操作，不触发 `push --delete`；原 audit 报告语义不严谨（"sync with" 同时含 "都存在" 与 "保持同步" 两义）。
- **Immediate cause** (Trap #3)：MSYS2 path translation 把任何以 `/` 开头的 CLI 参数视为 POSIX 路径并改写为 Windows 路径，影响 `gh api`、`docker exec` 等 endpoint-style 参数。
- **Contributing factors**：
  - 项目内 `mp-git-cleanup` skill 是 single-PR oriented，无 bulk 场景；3 traps 均未在 SKILL.md 出现
  - Explore agent audit prompt 没要求显式区分 "local-only / remote-only / both" 三态
  - Windows Git Bash 是 maintainer 默认 shell，无 Linux/macOS 对比基线
- **Root cause**：marketplace project assets 未捕获 bare-repo + worktree + Windows 三件套特有 gotcha；首次大规模 bulk cleanup 暴露所有 3 个。

## §4 Impact

- **Users affected**: 0（marketplace 用户 / plugin 消费者 / GitHub PR reviewers 均无感知）
- **Plugins affected**: 0
- **Data affected**: local `main` ref 暂失 ~30s，从 `origin/main` 恢复完整。Commit 历史、PR 历史、tag、GitHub Release 全部不变
- **Public statement made**: no（severity P3 不触发）

## §5 Remediation

### §5.1 Immediate (during incident)

- `git branch main origin/main` 恢复本地 main ref
- 第二轮 `git push origin --delete <33 branches>` 完成 remote cleanup
- `gh api -X PATCH repos/...`（去 leading slash）启用 `delete_branch_on_merge=true`

### §5.2 Short-term (within 1 week — THIS PR)

- F1 ：`.claude/skills/mp-git-cleanup/SKILL.md` 加 Bulk Cleanup Mode 章节，3 traps inline
- F2: 本 POSTMORTEM 文档（首份 `docs/postmortem/*`）
- F3: `.claude/skills/mp-git-merge-gate/SKILL.md` 加 Windows gh api 1 行警告
- F4: `docs/guide/[GUIDE]_Contributing.md` "Bare Repo + Worktree" 段加 prefix 说明
- F5: `docs/runbook/[RUNBOOK]_Release_Operations.md` §2.6 + §3.7 cleanup callouts；v1.3.1 → v1.3.2
- F6: 新建 `scripts/safe-bulk-cleanup.ps1` — pre-flight + dry-run-default 安全脚本

### §5.3 Long-term (process / tooling changes)

- 已启用 GitHub repo `delete_branch_on_merge=true`（cycle 自动 cover Trap #2 99% 场景）
- 未来 explore agent prompt 设计：要求 "local-only / remote-only / both" 三态显式区分
- 维护者 onboarding checklist 可加 "Windows Git Bash gotcha 阅读" 一项（暂不强制）

## §6 Action Items

| # | Action | Owner | Due | Status |
|---|--------|-------|-----|--------|
| 1 | F1: mp-git-cleanup Bulk Mode + 3 traps | ranzuozhou | 2026-05-18 | in this PR |
| 2 | F2: 本 POSTMORTEM | ranzuozhou | 2026-05-18 | done (this file) |
| 3 | F3: merge-gate Windows warning | ranzuozhou | 2026-05-18 | in this PR |
| 4 | F4: Contributing GUIDE prefix note | ranzuozhou | 2026-05-18 | in this PR |
| 5 | F5: RUNBOOK cleanup callouts (v1.3.2) | ranzuozhou | 2026-05-18 | in this PR |
| 6 | F6: safe-bulk-cleanup.ps1 | ranzuozhou | 2026-05-18 | in this PR |
| 7 | 评估是否给 mp-doc-validate 加 POSTMORTEM 字段校验 | ranzuozhou | open | future |

## §7 Lessons Learned

- **Bare repo + worktree 模式有非 stock-git 行为**：`+` 前缀仅在该模式下出现，常规 git 教程不覆盖。任何过滤 `git branch` 输出的脚本都需用 `[ *+]` 字符类。
- **"Sync" 这个词在 cleanup 上下文要警惕**：local 与 remote 是两条独立 ref 命名空间，删 local 不动 remote。任何 audit / 计划文档涉及 "同步" 必须显式标注操作方向。
- **Windows Git Bash 的 MSYS 路径改写**是 `gh api` / `docker exec` / 任何带 leading-slash CLI 参数都会触发的隐藏陷阱；遇到 `invalid endpoint: "C:/Program Files/..."` 类错误立即检查参数前缀。
- **Cleanup 类任务看似 trivial 但失败模式非显然**：dry-run + 候选列表先 `cat` 验证（不要直接管道给 `xargs`）是低成本高收益的护栏，应成为默认习惯。
- **首次 exercise POSTMORTEM 模板的价值**：模板 8 段对 P3 事件略重，但跑通一次让团队对未来 P0-P1 事件文档化有清晰路径；本文档同时验证了 `docs/postmortem/` 目录从 placeholder 转 active 的可行性。

## §8 References

- Issue: 无（内部 incident，未开 GitHub Issue）
- PR (fix): 本 PR（待合后填）
- Related RUNBOOK: [`../runbook/[RUNBOOK]_Release_Operations.md`](../runbook/[RUNBOOK]_Release_Operations.md) §2.6 / §3.7
- Related SKILL: [`../../.claude/skills/mp-git-cleanup/SKILL.md`](../../.claude/skills/mp-git-cleanup/SKILL.md) §Bulk Cleanup Mode
- Related Script: [`../../scripts/safe-bulk-cleanup.ps1`](../../scripts/safe-bulk-cleanup.ps1)
- Memory (session-local lesson): `~/.claude/projects/.../memory/feedback_branch_cleanup_traps.md`
