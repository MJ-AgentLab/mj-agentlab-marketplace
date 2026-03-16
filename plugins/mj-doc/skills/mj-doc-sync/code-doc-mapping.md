# Code-Doc Mapping Reference (§9.4)

## Change Detection Table

| Changed Files (glob) | Affected Docs | Check Focus |
|---------------------|---------------|-------------|
| `src/*/presentation/router.py` | `docs/api/[GUIDE]_Router_*.md` + CLAUDE.md Service Endpoints | Endpoint signatures, HTTP methods, params |
| `src/{NodeType}/{Service}/**` | `docs/design/{Service}/[SPEC]_*` | Data flow, interface definitions, process steps |
| `src/*/configuration/*.yaml` | Service `[RUNBOOK]` + CLAUDE.md | Config parameters, defaults, env vars |
| `main.py` | README Architecture + CLAUDE.md Architecture | Service list, route prefixes, middleware order |
| `sql/**/*.sql` | `docs/infrastructure/database/` + CLAUDE.md Database | Table/schema names, ETL functions, triggers |
| `docker-compose*.yml` | `docs/infrastructure/docker/` + CLAUDE.md Docker | Service names, ports, images, volumes |
| `docker/*.Dockerfile` | `docs/infrastructure/docker/` | Base images, build stages |
| `.github/workflows/*.yml` | `docs/infrastructure/cicd/` | Pipeline steps, secrets, triggers |
| `scripts/*` | Corresponding `[RUNBOOK]` or `[GUIDE]` | Script params, usage, prerequisites |
| `.env` (new vars) | CLAUDE.md Env Vars + related `[RUNBOOK]` | New variable names and purposes |
| `n8n/workflows/**` | `docs/infrastructure/n8n/` | Workflow logic, triggers, connections |
| `pyproject.toml` | README tech stack | Dependencies added/removed |
| `docs/_templates/*` | Framework v4 §3.4 template table | Template availability |
| `[mj-agentlab-marketplace] plugins/mj-doc/skills/mj-doc-*/SKILL.md` | `docs/infrastructure/claude-code/mj-doc/[GUIDE]_MJ_Doc_Skills_Architecture.md` + `[RUNBOOK]_MJ_Doc_Workflow_Procedures.md` | 技能工作流步骤、人工交互节点列表、文件结构章节 |
<!-- skill 文件现由 mj-agentlab-marketplace 仓库管理 -->
| `[mj-agentlab-marketplace] plugins/mj-doc/skills/mj-doc-shared/**` | `docs/infrastructure/claude-code/mj-doc/[GUIDE]_MJ_Doc_Skills_Architecture.md` + `[RUNBOOK]_MJ_Doc_Workflow_Procedures.md` | Q/D 问题 ID 新增或删除时须同步 GUIDE 设计原则和 RUNBOOK 步骤 |
<!-- skill 文件现由 mj-agentlab-marketplace 仓库管理 -->
| `[mj-agentlab-marketplace] plugins/mj-git/skills/mj-git-*/SKILL.md` | `docs/infrastructure/claude-code/mj-git/[GUIDE]_MJ_Git_Skills_Architecture.md` + `[RUNBOOK]_MJ_Git_Workflow_Procedures.md` | 技能工作流步骤、人工介入场景列表、命令序列 |
<!-- skill 文件现由 mj-agentlab-marketplace 仓库管理 -->

## Cross-Reference Scan Patterns

When a doc is renamed from `OldName.md` to `NewName.md`, search for stale references:

```bash
# Search for Wikilinks to old name (without extension)
grep -r '[[OldName' docs/ CONTRIBUTING.md README.md .github/

# Also check with pipe syntax
grep -r '[[OldName|' docs/ CONTRIBUTING.md README.md
```

**Always check these high-traffic files**:
- `docs/guide/[GUIDE]_Developer_Onboarding.md`
- `docs/INDEX.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`

## CLAUDE.md §8.2 Mapping

| CLAUDE.md Section | Authority Source | Sync When |
|-------------------|-----------------|-----------|
| Project Overview | README | Structure change |
| Git Operations Rules | CONTRIBUTING | Rule change |
| Architecture Overview | `[SPEC]` per service | Service add/remove/arch change |
| Database Architecture | `[STANDARD]` database | Naming rule change |
| Development Commands | `[GUIDE]` Onboarding | Command change |
| Service Abbreviations | GLOSSARY | New/modified abbreviation |
| Docker Deployment | `docs/infrastructure/docker/` | Deploy config change |
| Multi-Env DB Config | `docs/infrastructure/database/` | Env config change |
| DQV/AEC/QVL details | `docs/design/{Service}/` | Interface/flow change |

**Sync granularity rule**: Only sync when the change would affect Claude Code's behavior decisions. Skip typo fixes and pure formatting adjustments.

## Frontmatter Update Rules

| Change Type | Update `updated`? | Update `version`? |
|-------------|-------------------|-------------------|
| Substantive (new section, rule change, code example update) | Yes | Minor bump (Y) |
| Non-substantive (typo, formatting, field fill) | No | No |
| Structural rewrite (major reorganization) | Yes | Major bump (X), status → 草案 |
