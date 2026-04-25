# Commit Rules Reference

## Commit Type 定义

| Type | 含义 | 何时使用 |
|------|------|---------|
| `feat` | 新功能 | 新增用户可感知的功能或能力 |
| `fix` | Bug 修复 | 修复已有功能的缺陷 |
| `perf` | 性能优化 | 以提升性能为目的的变更（查询优化、缓存、并发） |
| `refactor` | 重构 | 不改变外部行为的代码重组（目的是"更清晰"） |
| `test` | 测试相关 | 新增或修改测试用例 |
| `docs` | 文档变更 | 仅修改文档文件（`docs/`、`README.md`、`CHANGELOG.md` 等） |
| `infra` | 基础设施 | CI/CD、Docker、依赖更新、脚本、配置等不影响业务源码的变更 |

> `merge` 用于合并提交：`merge: 合并 develop 最新内容，解决冲突` — 由合并操作产生，不手动选择。

**判断辅助**：目的是"更快"→ `perf`；目的是"更清晰"→ `refactor`；改的是工具链/配置 → `infra`

## Branch × Commit Type Allowed Matrix

| 分支类型 | `feat` | `fix` | `perf` | `refactor` | `test` | `docs` | `infra` |
|---------|--------|-------|--------|------------|--------|--------|---------|
| `feature/*` | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `bugfix/*` | — | ✓ | — | — | ✓ | ✓ | — |
| `documentation/*` | — | — | — | — | — | ✓ | — |
| `maintain/*` | — | — | — | — | — | ✓ | ✓ |
| `hotfix/*` | — | ✓ | — | — | — | — | — |

> 与 mj-sys-git-push Step 2 和 branch-rules.md 完全一致。

## Branch Type vs Commit Type 命名区分

| 分支类型（全称/复合词） | Commit 类型（缩写/不同词） | 命名区分方式 |
|------------------------|--------------------------|------------|
| `feature` | `feat` | 全称 ≠ 缩写 |
| `bugfix` | `fix` | 复合词 ≠ 简称 |
| `documentation` | `docs` | 全称 ≠ 缩写 |
| `maintain` | `infra` | 完全不同的词 |
| `hotfix` | `fix` | 复合词 ≠ 简称 |

常见错误：用 `feature` 作 commit type，或 `feat` 作分支前缀。

## 文件排除模式

### 硬性阻断（绝不提交）

| 模式 | 原因 |
|------|------|
| `.env` | 数据库密码、邮箱凭据、API 密钥 |
| `n8n/credentials/*.json`（`*.template.json` 除外） | 真实 n8n 凭据 |
| `*.pem`, `*.key`, `*.p12`, `*.pfx` | 私钥/证书 |
| 明文包含 `password=`, `secret=`, `token=` 的文件 | 嵌入式密钥 |

### 软性阻断（提交前询问）

| 模式 | 原因 |
|------|------|
| 文件 > 10 MB | 大二进制应用 Git LFS 或排除 |
| `*.csv`, `*.xlsx`, `*.xls` | 数据文件——通常属于 `data/`（已 gitignore） |
| `*.zip`, `*.rar`, `*.7z` | 归档文件 |
| `*.sqlite`, `*.db` | 数据库文件 |

### 自动跳过（.gitignore 已覆盖）

- `__pycache__/`, `*.pyc`, `*.pyo`, `*.egg-info/`
- `.venv/`, `venv/`, `env/`
- `.idea/`, `.vscode/`, `*.swp`, `*.swo`
- `data/`, `staging_area/`, `docker/data/`
- `Thumbs.db`, `.DS_Store`, `desktop.ini`
- `.claude/settings.local.json`, `.serena/`

## Scope 推导规则

### 服务缩写表

| 服务 | 缩写 | 路径模式 |
|------|------|---------|
| AutoEmailCollector | `aec` | `src/CollectionNodes/AutoEmailCollector/` |
| DataQualityValidator | `dqv` | `src/CollectionNodes/DataQualityValidator/` |
| QueryVolumeLoader | `qvl` | `src/ProcessingNodes/QueryVolumeLoader/` |
| QueryCommonMetrics | `qcm` | `src/ComputationNodes/QueryCommonMetrics/` |
| StageAreaCleaner | `sac` | `src/CollectionNodes/StageAreaCleaner/` |
| FileCleaner | `fc` | `components/SysToolkit/FileCleaner/` |

### 基础设施 Scope 表

| 领域 | Scope | 路径模式 |
|------|-------|---------|
| 数据库 SQL | `db` | `sql/` |
| Docker | `docker` | `docker/`、`Dockerfile`、`docker-compose*.yml` |
| CI/CD | `ci` | `.github/workflows/` |
| 依赖管理 | `deps` | `pyproject.toml`、`uv.lock`、`requirements*.txt` |
| n8n | `n8n` | `n8n/` |
| 文档 | 按主题 | `docs/` |

### 多 Scope 处理

| 情况 | Scope 选择 |
|------|-----------|
| 所有文件在同一服务 | 使用服务缩写 |
| 跨服务但同一层 | 使用层 scope（如 `db`） |
| 基础设施 + 相关文档 | 使用基础设施 scope |
| 真正混合，无主导 | 省略 scope：`feat: <summary>` |

## 拆分决策指南

### 判断流程

```
                    暂存的变更
                         |
                 单一逻辑目的？
                    /         \
                  是            否
                   |              |
              整体提交     涉及几个领域？
                              /        \
                           2 个       3+ 个
                             |              |
                    拆分为 2 个       制定拆分方案
                    (询问用户)      (展示方案，询问用户)
```

### 领域边界定义

变更跨越领域边界的情况：
1. **不同服务**（如 AEC 代码 + QCM SQL）
2. **不同关注点**（如应用代码 + CI workflow）
3. **不同 commit 类型**（如新功能 + 重构旧代码）
4. **Schema + Application**（如 SQL 迁移 + Python 服务代码）

### 推荐提交顺序

| 顺序 | 内容 | 原因 |
|------|------|------|
| 1 | 数据库 schema / SQL | 其他代码可能依赖 DB 变更 |
| 2 | 核心应用代码（feat/fix/refactor） | 主要交付物 |
| 3 | 测试 | 验证步骤 2 的代码 |
| 4 | 文档 | 描述已完成的内容 |
| 5 | 基础设施（CI、Docker、config） | 支持性变更 |

### 不拆分的情况

- 功能代码 + 其单元测试（同一逻辑单元）
- SQL 建表 + ETL 函数 + Trigger（同一 DB 功能）
- 单个文档伴随代码变更（次要）
- <5 个文件，<100 行差异，单一 scope

## 常见 Commit Message 错误

| 错误类型 | 错误 | 正确 |
|---------|------|------|
| 大写 type | `Feat(aec): ...` | `feat(aec): ...` |
| 句号结尾 | `feat(aec): 新增功能.` | `feat(aec): 新增功能` |
| 缺少空格 | `feat(aec):新增功能` | `feat(aec): 新增功能` |
| 分支类型作 commit type | `feature(aec): ...` | `feat(aec): ...` |
| 模糊摘要 | `fix(dqv): fix bug` | `fix(dqv): 修复冷启动数据源文件名` |
| 过去时态 | `feat(aec): added sync` | `feat(aec): add sync` |
| 超过 72 字符 | `feat(aec): add incremental sync based on last_collect_at with fallback to full sync when timestamp is missing` | `feat(aec): add incremental sync based on last_collect_at` |
