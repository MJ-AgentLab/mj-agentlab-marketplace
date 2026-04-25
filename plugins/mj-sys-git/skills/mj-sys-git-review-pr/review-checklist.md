# PR Architecture Review Checklist

> 本文件定义 review-pr skill 的检查项内容。触发条件和执行顺序见 SKILL.md Stage 3。

---

## 固定检查

### F1 — 分支同步状态（ℹ️ 信息展示）

- **检查**: base branch 落后提交数
- **方法**: `git log HEAD..origin/{base_branch} --oneline`
- **输出**: "同步" 或 "落后 N 个提交"

### F2 — 变更概览（ℹ️ 信息展示）

- **检查**: 变更文件统计与分类
- **方法**: `git diff {base}...HEAD --stat` + `git log {base}...HEAD --oneline`
- **分类**: 按 `scripts/classify_changes.py` 中的分类规则将文件归类为 Code / SQL / Config / Docs / Other
- **输出**: 分类统计表 + commit 列表

### F3 — Commit 规范（合规检查）

- **检查**: commit type 是否匹配分支类型
- **为什么**: commit type 不匹配分支类型意味着变更内容超出了分支职责范围——例如 bugfix 分支出现 feat 提交，说明修复和新功能混在一起，导致回滚困难
- **规范引用**: [[STANDARD]_Commit_Message_Convention|Commit Message 规范]] §5 Branch×Type 矩阵
- **通过标准**: 所有 commit 的 type 都在分支允许范围内

**Branch×Type 速查**:

| 分支类型 | 允许的 commit type |
|----------|-------------------|
| feature/* | feat, perf, refactor, test, docs |
| bugfix/* | fix, test, docs |
| hotfix/* | fix |
| documentation/* | docs |
| maintain/* | infra, docs |
| release (develop→main) | 所有 type |

---

## 动态检查

> **编号说明**: D5/D6 编号预留给未来的检查项（如测试覆盖、API 规范），当前跳过以保持编号稳定性。

### D1 — DDD 结构合规（Suggestion）

- **触发条件**: `src/` 下有新服务目录
- **检查**: 新服务目录结构是否符合三级架构之一
- **为什么**: 统一的分层结构让团队成员和 Claude Code 能快速理解服务内部组织方式，降低维护成本。但因各服务复杂度不同，这里只建议而非强制
- **规范引用**: [[STANDARD]_Service_Architecture|服务架构规范]] §3-4
- **检查内容**:
  1. 目录结构可归类到 Minimal / Light DDD / Full DDD 之一
  2. 层间 import 方向正确（Domain 不依赖其他层）
- **通过标准**: 目录结构可归类到三级之一

### D2 — ops 域完整性（Important）

- **触发条件**: `src/` 下有新服务目录
- **检查**: 新服务的 ODS 持久化链路是否完整
- **为什么**: 缺少任一组件（ODS 表、ETL 函数、触发器、中间件）会导致服务执行数据无法自动流转到 DWD 层，运维将无法追踪服务运行状态
- **规范引用**: [[STANDARD]_Database_Design_Principles|数据库设计原则]] §2-3 + [[STANDARD]_Service_Architecture|服务架构规范]] §5.2
- **检查内容**: 如服务需要 ODS 持久化，以下 5 项是否配套：
  1. `ops_ods.ods_{服务全名}` 表（`sql/10-ops/` 下）
  2. ETL 函数 `etl_{缩写}_{实体}`（`V*_07_create_etl_functions.sql`）
  3. 触发器 `trg_{时机缩写}_{源表简写}`（`V*_08_create_triggers.sql`）
  4. PersistenceMiddleware（`router/middlewares/persistence.py`）
  5. SYNC_MIDDLEWARE_CONFIG 条目（`main.py`）
- **通过标准**: 5 项全部存在，或明确说明不需要 ODS 持久化

### D3 — 服务注册与中间件（Important）

- **触发条件**: `main.py` 有变更
- **检查**: main.py 中的路由注册和中间件配置是否正确
- **为什么**: FastAPI 中间件是 LIFO 栈，注册顺序决定执行顺序。如果中间件在路由之后注册，持久化拦截将失效，ODS 数据不会被写入
- **规范引用**: [[STANDARD]_Service_Architecture|服务架构规范]] §5 + CLAUDE.md "Middleware"
- **检查内容**:
  1. 新增路由通过 `app.include_router()` 注册
  2. 如有新中间件: SYNC_MIDDLEWARE_CONFIG 包含完整配置（middleware / enabled / path_prefix / persist_paths）
  3. 中间件注册代码在路由注册代码 **之前**
  4. `path_prefix` 与 `router.py` 中的 prefix 一致
- **通过标准**: 路由已注册 + 中间件顺序正确

### D4 — 数据库变更合规（Important）

- **触发条件**: `sql/` 有变更
- **检查**: SQL 变更是否符合数据库变更 Review 标准
- **为什么**: 数据库变更（DDL/ETL/触发器）影响面广且难以回滚，不合规的变更可能导致数据丢失、ETL 失败或级联影响
- **规范引用**: [[STANDARD]_Database_Change_Review|数据库变更 Review 规范]] 附录
- **行为**: 输出 Database Change Review 快速检查清单（11 必查项 + 建议项）
- **可自动检查的部分**:
  1. 脚本文件名是否符合 `V{ver}_{seq}_{desc}.sql`
  2. 脚本是否在正确目录（`00-global` / `10-ops` / `20-biz`）
  3. 是否有 `COMMENT ON TABLE` / `COMMENT ON COLUMN`
- **通过标准**: 自动检查通过 + 人工确认清单

### D7 — 配置管理（Important）

- **触发条件**: `configuration/` 或 `.env*` 有变更
- **检查**: 配置变更是否符合三层配置体系
- **为什么**: 硬编码的密码/IP 会导致安全风险和环境迁移困难。config_profile 机制确保同一代码可在 dev/test/prod 间切换
- **规范引用**: [[GUIDE]_Configuration_Management|配置管理]] §1-3
- **检查内容**:
  1. 无硬编码密码/IP（grep 敏感模式）
  2. `db_config.yaml` 使用 `config_profile` 模式
  3. 新增环境变量已在 `.env.example` 中注册
- **通过标准**: 无硬编码 + config_profile 正确

---

## docs/ 变更处理

检测到 `docs/` 变更时，**不自行检查**，输出提示：

> 建议运行 `/mj-doc-review` 检查文档质量
