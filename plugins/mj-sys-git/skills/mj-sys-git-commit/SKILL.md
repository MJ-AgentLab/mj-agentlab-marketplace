---
name: mj-sys-git-commit
description: This skill should be used when the user asks to stage files, create commits, write commit messages, check commit format, split changes into logical commits, or prepare code before push in MJ System. Triggers on "git add", "git commit", "提交代码", "暂存文件", "commit message", "提交格式", "拆分提交", "准备提交", "stage files", "怎么写 commit", "提交规范". Enforces type(scope) summary format and branch-type discipline at commit time, preventing rework at push stage.
---

# MJ Git Commit

## Overview

暂存文件并创建符合项目规范的 Git 提交。6 步 Pre-Commit 工作流覆盖文件筛选、暂存策略、commit message 格式校验、type/branch 纪律、拆分指导。衔接 `mj-sys-git-branch`（创建分支）与 `mj-sys-git-push`（推送）之间的缺口。

## 前置条件

- 在 MJ System worktree 目录内执行（bare repo 根目录无 working tree）
- 当前分支为临时分支（feature/bugfix/documentation/maintain/hotfix），不在 `main` 或 `develop` 上直接提交

## 快速开始（交互模式）

用户触发此技能时，先判断已有信息是否充足，再决定直接执行还是追问。

### 信息充足性判断

| 已知信息 | 行动 |
|---------|------|
| 用户说「提交」但未说明提交什么 | 运行 `git status --short`，展示修改列表，询问：「以下是当前修改，全部提交还是选择部分文件？」 |
| 有修改文件，但不确定变更性质 | 询问：「这次修改是新功能、bug 修复、重构、文档更新、还是基础设施维护？」 |
| 变更性质明确，但用户未提供 scope | 从修改的文件路径推断 scope（见 Step 3），不追问 |
| 变更性质 + 文件均明确 | 直接生成 commit 命令 |

### 追问用语模板

- 文件不明确：「以下是当前所有修改，要全部提交还是选择部分？」+ `git status --short` 输出
- 性质不明确：「这次修改的性质是什么？新功能(feat) / bug 修复(fix) / 性能优化(perf) / 重构(refactor) / 文档(docs) / 测试(test) / 基础设施(infra)？」

---

## Pre-Commit Workflow (6 steps)

### Step 1 — Verify Working Location

```bash
# 确认在 worktree 内，不在 bare repo 根目录
git branch --show-current
# 必须返回分支名。若为 main 或 develop → STOP (H5)

git worktree list
# 确认当前目录在某个 worktree 内
```

### Step 2 — Review Changes & File Selection

```bash
# 查看所有变更
git status --short

# 查看未暂存的差异
git diff

# 查看已暂存的差异
git diff --cached
```

**文件排除规则**：

| 模式 | 原因 | 发现后行为 |
|------|------|----------|
| `.env` | 含数据库密码、邮箱凭据 | **H1**: 硬性阻断，不暂存 |
| `n8n/credentials/*.json`（非 template） | 含真实凭据 | **H1**: 硬性阻断 |
| `*.pem`, `*.key`, `*.p12` | 私钥/证书 | **H1**: 硬性阻断 |
| 文件 > 10 MB | 大文件不宜纳入 Git | **H2**: 询问用户 |
| `__pycache__/`, `*.pyc`, `.venv/` | 运行时文件 | 静默跳过 |
| `.claude/settings.local.json` | 个人配置 | 静默跳过 |

**暂存策略**：

```bash
# 推荐：按文件名逐个暂存（最安全）
git add src/CollectionNodes/AutoEmailCollector/application/service.py

# 可接受：按目录暂存（该目录所有文件都应提交时）
git add src/CollectionNodes/AutoEmailCollector/

# 可接受：仅暂存已追踪的修改文件（不含新文件）
git add -u

# 避免：git add -A 或 git add .（会暂存所有未追踪文件）
# 仅在确认所有新文件都应提交时使用
```

### Step 3 — Compose Commit Message

**格式**：`<type>(<scope>): <summary>`

**规则**：
1. `type` — 小写，见 Step 4 允许列表
2. `scope` — 小写，从文件路径推断（见下表）
3. `:` 后加一个空格
4. `summary` — 不以句号结尾，不超过 72 字符
5. 中英文均可

**Scope 推导**：

| 修改路径模式 | Scope |
|-------------|-------|
| `src/.../AutoEmailCollector/` | `aec` |
| `src/.../DataQualityValidator/` | `dqv` |
| `src/.../QueryVolumeLoader/` | `qvl` |
| `src/.../QueryCommonMetrics/` | `qcm` |
| `src/.../StageAreaCleaner/` | `sac` |
| `components/.../FileCleaner/` | `fc` |
| `sql/` | `db` |
| `docker/`, `docker-compose*.yml` | `docker` |
| `.github/workflows/` | `ci` |
| `pyproject.toml`, `uv.lock` | `deps` |
| `n8n/` | `n8n` |
| `docs/` | 按主题定 |
| 多领域无主导 | 省略 scope |

### Step 4 — Enforce Type/Branch Discipline

提交前验证 commit type 是否被当前分支允许：

```bash
git branch --show-current
# 提取分支类型前缀
```

| 分支类型 | 允许的 Commit 类型 | 常见误用 |
|---------|-------------------|---------|
| `feature/*` | `feat`, `perf`, `refactor`, `test`, `docs` | `fix`, `infra` |
| `bugfix/*` | `fix`, `test`, `docs` | `feat`, `perf`, `refactor`, `infra` |
| `documentation/*` | `docs` | 其他所有 |
| `maintain/*` | `infra`, `docs` | `feat`, `fix`, `perf`, `refactor` |
| `hotfix/*` | `fix` | 其他所有 |

> 此矩阵与 `mj-sys-git-push` Step 2 完全相同，提前到 commit 阶段执行，减少推送返工。

**若不匹配** → 触发 H3。

### Step 5 — Evaluate Split Necessity

提交前检查暂存内容是否应拆分为多个逻辑 commit。

**拆分信号**（任一触发即评估）：

| 信号 | 示例 | 动作 |
|------|------|------|
| 暂存文件跨 2+ 不相关服务 | AEC 代码 + QCM SQL | 按服务拆分 |
| 代码 + 文档涉及不同主题 | Python 服务 + Docker 文档 | 分开提交 |
| 混合 feat + refactor | 新端点 + 重构旧代码 | 按类型拆分 |
| SQL schema + 应用代码 | 建表脚本 + Python 服务 | DB 先提交 |
| 差异 >300 行跨 5+ 文件 | 大型重构 | 按逻辑单元拆分 |

**不应拆分**：功能代码 + 其测试；SQL 建表 + ETL + Trigger；<5 文件 <100 行单一 scope。

### Step 6 — Execute Commit

```bash
# 最终确认
git diff --cached --stat   # 确认暂存内容
git branch --show-current  # 确认分支

# 提交
git commit -m "<type>(<scope>): <summary>"

# 验证
git log --oneline -1       # 确认提交已创建
git status --short         # 确认工作目录状态
```

---

## 人工介入场景（STOP & ASK）

| # | 触发条件 | 技能行为 |
|---|---------|---------|
| **H1** | `.env`、凭据文件、私钥文件在暂存区 | 硬性阻断：展示文件名，警告含敏感信息，执行 `git reset HEAD <file>` |
| **H2** | 大文件（>10 MB）在暂存区 | 展示文件名和大小，询问是否确认提交 |
| **H3** | Commit type 与 branch type 不匹配 | 展示允许列表，提供：(1) 修改 type (2) 确认例外并继续 |
| **H4** | 暂存区为空但用户要求提交 | 告知暂存区为空，展示 `git status --short` |
| **H5** | 当前分支为 `main` 或 `develop` | 硬性阻断：拒绝提交，告知切换到工作分支 |
| **H6** | Commit message 不符合格式规范 | 展示格式要求，提供修正后的建议，询问是否采用 |
| **H7** | 检测到可拆分的大变更（见 Step 5） | 建议拆分方案，询问是否拆分 |

> **H1** 和 **H5** 是硬性阻断（不提供「继续」选项）。其他场景允许用户覆盖。

---

## Handoff to mj-sys-git-push

提交完成后输出提示：

```
提交完成
下一步：使用 mj-sys-git-push 执行 pre-push 检查。
  已验证项：commit message 格式、type/branch 纪律
  待检查项：CHANGELOG 更新、工作目录清洁、base branch 同步、双端推送
```

---

## 示例

### 示例 1：常规 feature 提交

```bash
# 当前在 feature/64-add-review-pr-skill worktree

# Step 1: 确认位置
git branch --show-current
# → feature/64-add-review-pr-skill ✓

# Step 2: 查看变更
git status --short
# M  src/CollectionNodes/AutoEmailCollector/application/service.py
# M  src/CollectionNodes/AutoEmailCollector/domain/model.py
# 无敏感文件 ✓

# Step 3-4: type=feat, branch=feature/* → 允许 ✓, scope=aec
# Step 5: 2 个文件，同一服务 → 无需拆分

# Step 6: 执行
git add src/CollectionNodes/AutoEmailCollector/application/service.py src/CollectionNodes/AutoEmailCollector/domain/model.py
git commit -m "feat(aec): add incremental sync based on last_collect_at"
```

### 示例 2：需要拆分的 maintain 提交

```bash
# 当前在 maintain/update-ci-workflow

git status --short
# M  .github/workflows/ci.yml
# M  docker-compose.yml
# M  docs/infrastructure/cicd/deploy-guide.md

# Step 5: CI + Docker + docs → 建议拆分为 3 个 commit
git add .github/workflows/ci.yml
git commit -m "infra(ci): update CI workflow checkout and caching"

git add docker-compose.yml
git commit -m "infra(docker): update test compose override"

git add docs/infrastructure/cicd/deploy-guide.md
git commit -m "docs(cicd): update deployment guide"
```

### 示例 3：H3 触发 — type/branch 不匹配

```bash
# 当前在 bugfix/25-date-parse-npe
# 用户想提交: feat(dqv): add new date parser
# Step 4 检测: feat 不在 bugfix/* 允许列表 [fix, test, docs] 中
# → H3 触发
# 技能输出：
# 「当前分支 bugfix/25-date-parse-npe 仅允许 fix/test/docs 类型。
#   你使用了 feat。选择：
#   (1) 修改为 fix(dqv): fix date parser for edge cases
#   (2) 确认例外并继续」
```

## Commit Rules Reference → commit-rules.md

完整的 type 定义、scope 推导表、文件排除模式、拆分决策流程图、更多示例见 `commit-rules.md`。
