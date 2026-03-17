# 插件市场版本管理基础设施 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 mj-agentlab-marketplace 建立完整的版本管理基础设施，包括 bare repo + worktree 模式、独立版本管理、bump 脚本、CHANGELOG、CI/CD、分支策略和 PR/Issue 模板。

**Architecture:** 采用 mj-system 的 bare repo + worktree 模式，双远程（GitHub + Gitee），Git Flow 分支策略。Marketplace 整体和各插件独立版本管理，通过 bump-version.ps1 脚本统一升级。GitHub Actions 提供 CI 验证和自动发布。

**Tech Stack:** PowerShell (scripts), GitHub Actions (CI/CD), bash (git hooks), Keep a Changelog (format)

**Spec:** `docs/superpowers/specs/2026-03-17-version-management-design.md`

---

## File Structure

### New Files (24 in-repo + 1 external)

```
mj-agentlab-marketplace/
├── VERSION                                          # 市场整体版本（纯文本）
├── CHANGELOG.md                                     # 根级变更日志
├── scripts/
│   ├── bump-version.ps1                             # 多目标版本升级脚本
│   ├── install-hooks.ps1                            # Git hooks 安装器
│   └── clone-bare.ps1                               # 仓库内参考副本
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md                     # 默认 PR 模板
│   ├── PULL_REQUEST_TEMPLATE/
│   │   ├── feature.md
│   │   ├── bugfix.md
│   │   ├── documentation.md
│   │   ├── maintain.md
│   │   ├── hotfix.md
│   │   └── release.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── feature.md
│   │   ├── bugfix.md
│   │   ├── documentation.md
│   │   ├── maintain.md
│   │   ├── hotfix.md
│   │   └── config.yml
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── docs/
│   └── CONTRIBUTING.md
└── plugins/
    ├── mj-doc/CHANGELOG.md
    ├── mj-git/CHANGELOG.md
    ├── mj-n8n/CHANGELOG.md
    └── mj-ops/CHANGELOG.md

# External (sibling to project dir):
../mj-agentlab-marketplace-clone-bare.ps1
```

### Modified Files (2)

```
README.md        # 添加版本徽章、Contributing 链接
.gitignore       # 添加 *.bak, *.tmp
```

---

## Chunk 0: 前置准备

### Task 0: 创建工作分支 + 添加 Gitee 远程

- [ ] **Step 1: 确认 Gitee 仓库存在**

手动检查 `https://gitee.com/ranzuozhou/mj-agentlab-marketplace` 是否已创建。如不存在，在 Gitee 上创建空仓库。

- [ ] **Step 2: 添加 Gitee 远程**

```bash
cd "D:/workspace/10-software-project/projects/mj-agentlab-marketplace"
git remote add gitee https://gitee.com/ranzuozhou/mj-agentlab-marketplace.git
git config alias.pushall '!git push gitee HEAD && git push origin HEAD'
git remote -v
# Expected: origin (GitHub) + gitee (Gitee) 双远程
```

- [ ] **Step 3: 推送 main 到双远程**

```bash
git pushall
```

- [ ] **Step 4: 创建 develop 分支**

```bash
git checkout -b develop
git push -u origin develop
git push gitee develop
```

- [ ] **Step 5: 创建 maintain 工作分支**

```bash
git checkout -b maintain/add-version-management
```

后续所有 Task 1-11 的 commit 都在此分支上执行。

---

## Chunk 1: Version Foundation + CHANGELOGs

### Task 1: VERSION 文件 + 根 CHANGELOG

**Files:**
- Create: `VERSION`
- Create: `CHANGELOG.md`

- [ ] **Step 1: 创建 VERSION 文件**

```
1.0.0
```

注意：纯文本，无尾部换行符，内容仅为版本号。

- [ ] **Step 2: 创建根 CHANGELOG.md**

```markdown
# Changelog

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.0.0] - 2026-03-16

### Added
- 初始发布：4 个 Plugin（mj-doc, mj-git, mj-n8n, mj-ops），26 个 Skill
- Plugin Marketplace 元数据结构（marketplace.json）
- 各 Plugin 含 CLAUDE.md、README.md、plugin.json、SKILL.md
```

- [ ] **Step 3: 验证**

```bash
cat VERSION
# Expected: 1.0.0

head -15 CHANGELOG.md
# Expected: 显示完整的 CHANGELOG 内容
```

- [ ] **Step 4: Commit**

```bash
git add VERSION CHANGELOG.md
git commit -m "infra(marketplace): add VERSION file and root CHANGELOG"
```

---

### Task 2: 各插件 CHANGELOG

**Files:**
- Create: `plugins/mj-doc/CHANGELOG.md`
- Create: `plugins/mj-git/CHANGELOG.md`
- Create: `plugins/mj-n8n/CHANGELOG.md`
- Create: `plugins/mj-ops/CHANGELOG.md`

- [ ] **Step 1: 创建 mj-doc CHANGELOG**

```markdown
# Changelog — mj-doc

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.0.0] - 2026-03-16

### Added
- 初始发布：6 个 Skill + 1 个共享资源（mj-doc-shared）
- Skills: plan, author, validate, review, sync, migrate
- 共享资源: question-patterns（Q-01 ~ Q-09, D-01 ~ D-04）
```

- [ ] **Step 2: 创建 mj-git CHANGELOG**

```markdown
# Changelog — mj-git

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.0.0] - 2026-03-16

### Added
- 初始发布：9 个 Skill
- Skills: branch, check-merge, commit, delete, issue, pr, push, review-pr, sync
- MCP 依赖自动注册（github, serena）
```

- [ ] **Step 3: 创建 mj-n8n CHANGELOG**

```markdown
# Changelog — mj-n8n

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.0.0] - 2026-03-16

### Added
- 初始发布：7 个 Skill
- Skills: plan, author, template, config, doc, render, promote
- MCP 依赖自动注册（n8n-docs）
```

- [ ] **Step 4: 创建 mj-ops CHANGELOG**

```markdown
# Changelog — mj-ops

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [1.0.0] - 2026-03-16

### Added
- 初始发布：4 个 Skill
- Skills: env-setup, env-teardown, etl-ods-to-dwd, etl-dwd-to-dws
- MCP 依赖自动注册（postgres-dev, postgres-test, ssh-manager）
```

- [ ] **Step 5: 验证**

```bash
ls plugins/*/CHANGELOG.md
# Expected: 4 files listed
```

- [ ] **Step 6: Commit**

```bash
git add plugins/mj-doc/CHANGELOG.md plugins/mj-git/CHANGELOG.md plugins/mj-n8n/CHANGELOG.md plugins/mj-ops/CHANGELOG.md
git commit -m "infra(marketplace): add plugin CHANGELOGs"
```

---

## Chunk 2: bump-version 脚本

### Task 3: bump-version.ps1

**Files:**
- Create: `scripts/bump-version.ps1`

- [ ] **Step 1: 创建 scripts 目录**

```bash
mkdir -p scripts
```

- [ ] **Step 2: 创建 bump-version.ps1**

基于 `D:\workspace\10-software-project\projects\mj-system\develop\scripts\bump-version.ps1` 的模式，适配 marketplace 的多层版本管理。

```powershell
<#
.SYNOPSIS
    MJ AgentLab Marketplace version bump script

.DESCRIPTION
    Batch-replace version numbers across project files.
    Supports two scopes:
      - marketplace: updates VERSION, marketplace.json (metadata.version), README.md
      - plugin:      updates plugin.json (version), marketplace.json (plugins[name].version)

.PARAMETER From
    Current version (e.g. "1.0.0")

.PARAMETER To
    Target version (e.g. "1.1.0")

.PARAMETER Scope
    Target scope: "marketplace" (default), or plugin name ("mj-doc", "mj-git", "mj-n8n", "mj-ops")

.PARAMETER DryRun
    Preview mode: show what would change without modifying files

.EXAMPLE
    .\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -DryRun
    .\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0"
    .\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "mj-git" -DryRun
    .\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "mj-git"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$From,

    [Parameter(Mandatory = $true)]
    [string]$To,

    [Parameter(Mandatory = $false)]
    [ValidateSet("marketplace", "mj-doc", "mj-git", "mj-n8n", "mj-ops")]
    [string]$Scope = "marketplace",

    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Locate project root (script lives in scripts/)
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Build target file list based on scope
if ($Scope -eq "marketplace") {
    $TargetFiles = @(
        "VERSION",
        ".claude-plugin/marketplace.json",
        "README.md"
    )
    # For marketplace scope, we replace ALL occurrences of $From in VERSION and README,
    # but only metadata.version in marketplace.json
    $MarketplaceJsonMode = "metadata"
} else {
    $TargetFiles = @(
        "plugins/$Scope/.claude-plugin/plugin.json",
        ".claude-plugin/marketplace.json"
    )
    # For plugin scope, we replace version in plugin.json (simple),
    # and only the specific plugin entry in marketplace.json
    $MarketplaceJsonMode = "plugin:$Scope"
}

Write-Host ""
if ($DryRun) {
    Write-Host "[DryRun] Preview mode - no files will be modified" -ForegroundColor Yellow
} else {
    Write-Host "[Execute] Will modify files" -ForegroundColor Cyan
}
Write-Host "Scope: $Scope" -ForegroundColor White
Write-Host "Version: $From -> $To" -ForegroundColor White
Write-Host "Project root: $ProjectRoot" -ForegroundColor White
Write-Host ("-" * 60)

$TotalMatches = 0
$ModifiedFiles = 0

foreach ($RelPath in $TargetFiles) {
    $FilePath = Join-Path $ProjectRoot $RelPath

    if (-not (Test-Path $FilePath)) {
        Write-Host "  [SKIP] $RelPath - file not found" -ForegroundColor DarkGray
        continue
    }

    $Content = Get-Content -Path $FilePath -Raw -Encoding UTF8

    # Special handling for marketplace.json to avoid replacing wrong version fields
    if ($RelPath -eq ".claude-plugin/marketplace.json") {
        if ($MarketplaceJsonMode -eq "metadata") {
            # Only replace version in the metadata block
            $Pattern = '("metadata"\s*:\s*\{[^}]*"version"\s*:\s*")' + [regex]::Escape($From) + '"'
            $Replacement = '${1}' + $To + '"'
        } else {
            # Only replace version for the specific plugin entry
            $PluginName = $MarketplaceJsonMode -replace "^plugin:", ""
            $Pattern = '("name"\s*:\s*"' + [regex]::Escape($PluginName) + '"[^}]*"version"\s*:\s*")' + [regex]::Escape($From) + '"'
            $Replacement = '${1}' + $To + '"'
        }

        $MatchCount = ([regex]::Matches($Content, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)).Count

        if ($MatchCount -eq 0) {
            Write-Host "  [SKIP] $RelPath - no match for '$From' in scope '$Scope'" -ForegroundColor DarkGray
            continue
        }

        Write-Host ""
        Write-Host "  [MATCH] $RelPath ($MatchCount occurrences, scoped: $Scope)" -ForegroundColor Green

        # Show the specific line that will change
        $Lines = Get-Content -Path $FilePath -Encoding UTF8
        $EscapedFrom = [regex]::Escape($From)
        for ($i = 0; $i -lt $Lines.Count; $i++) {
            if ($Lines[$i] -match $EscapedFrom) {
                # For metadata mode, only show lines in metadata block
                # For plugin mode, show version lines near the plugin name
                $LineNum = $i + 1
                $Before = $Lines[$i].Trim()
                $After = $Before -replace $EscapedFrom, $To
                Write-Host "    L${LineNum}: $Before" -ForegroundColor Red
                Write-Host "      -> $After" -ForegroundColor Green
            }
        }

        $TotalMatches += $MatchCount

        if (-not $DryRun) {
            $NewContent = [regex]::Replace($Content, $Pattern, $Replacement, [System.Text.RegularExpressions.RegexOptions]::Singleline)
            Set-Content -Path $FilePath -Value $NewContent -Encoding UTF8 -NoNewline
            $ModifiedFiles++
        }
    } else {
        # Simple string replacement for VERSION, plugin.json, README.md
        $EscapedFrom = [regex]::Escape($From)
        $MatchCount = ([regex]::Matches($Content, $EscapedFrom)).Count

        if ($MatchCount -eq 0) {
            Write-Host "  [SKIP] $RelPath - no match for '$From'" -ForegroundColor DarkGray
            continue
        }

        Write-Host ""
        Write-Host "  [MATCH] $RelPath ($MatchCount occurrences)" -ForegroundColor Green

        # Show matching lines with context
        $Lines = Get-Content -Path $FilePath -Encoding UTF8
        for ($i = 0; $i -lt $Lines.Count; $i++) {
            if ($Lines[$i] -match $EscapedFrom) {
                $LineNum = $i + 1
                $Before = $Lines[$i].Trim()
                $After = $Before -replace $EscapedFrom, $To
                Write-Host "    L${LineNum}: $Before" -ForegroundColor Red
                Write-Host "      -> $After" -ForegroundColor Green
            }
        }

        $TotalMatches += $MatchCount

        if (-not $DryRun) {
            $NewContent = $Content -replace $EscapedFrom, $To
            Set-Content -Path $FilePath -Value $NewContent -Encoding UTF8 -NoNewline
            $ModifiedFiles++
        }
    }
}

Write-Host ""
Write-Host ("-" * 60)
if ($DryRun) {
    Write-Host "[DryRun] Found $TotalMatches matches in scope '$Scope'" -ForegroundColor Yellow
    Write-Host "[DryRun] Remove -DryRun to apply changes" -ForegroundColor Yellow
} else {
    Write-Host "[Done] Modified $ModifiedFiles files, replaced $TotalMatches occurrences" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host '  1. git diff  (review changes)' -ForegroundColor White
    Write-Host '  2. Update CHANGELOG.md (move [Unreleased] to [X.Y.Z])' -ForegroundColor White
    Write-Host '  3. git add ... then git commit' -ForegroundColor White
}
Write-Host ""
```

- [ ] **Step 3: 验证脚本语法**

```bash
pwsh -c "Get-Command -Syntax 'D:/workspace/10-software-project/projects/mj-agentlab-marketplace/scripts/bump-version.ps1'" 2>&1 || echo "Syntax check failed"
```

- [ ] **Step 4: DryRun 测试 marketplace scope**

```bash
cd "D:/workspace/10-software-project/projects/mj-agentlab-marketplace"
pwsh -File scripts/bump-version.ps1 -From "1.0.0" -To "1.1.0" -DryRun
# Expected: [MATCH] VERSION (1 occurrence), [MATCH] .claude-plugin/marketplace.json (1 occurrence), [MATCH] README.md (if version present)
```

- [ ] **Step 5: DryRun 测试 plugin scope**

```bash
pwsh -File scripts/bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "mj-git" -DryRun
# Expected: [MATCH] plugins/mj-git/.claude-plugin/plugin.json (1 occurrence), [MATCH] .claude-plugin/marketplace.json (1 occurrence, scoped: mj-git)
```

- [ ] **Step 6: Commit**

```bash
git add scripts/bump-version.ps1
git commit -m "infra(scripts): add bump-version script"
```

---

## Chunk 3: CI/CD Workflows

### Task 4: CI Validation Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: 创建 workflows 目录**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: 创建 ci.yml**

```yaml
name: CI — Validate Plugin Structure

on:
  push:
    branches:
      - 'feature/*'
      - 'bugfix/*'
      - 'documentation/*'
      - 'maintain/*'
      - 'hotfix/*'
  pull_request:
    branches: [develop, main]

jobs:
  sync-to-gitee:
    name: Sync to Gitee
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Push to Gitee mirror
        env:
          GITEE_USERNAME: ${{ secrets.GITEE_USERNAME }}
          GITEE_TOKEN: ${{ secrets.GITEE_TOKEN }}
        run: |
          git remote add gitee "https://${GITEE_USERNAME}:${GITEE_TOKEN}@gitee.com/ranzuozhou/mj-agentlab-marketplace.git"
          git push gitee HEAD --force

  validate:
    name: Validate Structure
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate plugin.json schema
        run: |
          ERRORS=0
          for pj in plugins/*/.claude-plugin/plugin.json; do
            PLUGIN_DIR=$(dirname "$(dirname "$pj")")
            PLUGIN_NAME=$(basename "$PLUGIN_DIR")
            for field in name description version author license skills; do
              if ! grep -q "\"$field\"" "$pj"; then
                echo "ERROR: $pj missing required field: $field"
                ERRORS=$((ERRORS + 1))
              fi
            done
            echo "OK: $PLUGIN_NAME plugin.json"
          done
          [ $ERRORS -gt 0 ] && exit 1
          echo "All plugin.json files valid"

      - name: Validate marketplace.json
        run: |
          ERRORS=0
          MJ="$(cat .claude-plugin/marketplace.json)"

          # Check required top-level fields
          for field in name owner metadata plugins; do
            if ! echo "$MJ" | grep -q "\"$field\""; then
              echo "ERROR: marketplace.json missing field: $field"
              ERRORS=$((ERRORS + 1))
            fi
          done

          # Check each plugin entry has matching directory
          PLUGIN_NAMES=$(echo "$MJ" | grep -oP '"name"\s*:\s*"mj-\K[^"]+' | sed 's/^/mj-/')
          for name in $PLUGIN_NAMES; do
            if [ ! -d "plugins/$name" ]; then
              echo "ERROR: marketplace.json references plugin '$name' but directory plugins/$name not found"
              ERRORS=$((ERRORS + 1))
            fi
          done

          [ $ERRORS -gt 0 ] && exit 1
          echo "marketplace.json valid"

      - name: Validate SKILL.md frontmatter
        run: |
          ERRORS=0
          for skill_dir in plugins/*/skills/*/; do
            # Skip shared resource directories (e.g., mj-doc-shared)
            DIR_NAME=$(basename "$skill_dir")
            if echo "$DIR_NAME" | grep -q "\-shared$"; then
              echo "SKIP: $skill_dir (shared resource, not a skill)"
              continue
            fi

            SKILL_FILE="${skill_dir}SKILL.md"
            if [ ! -f "$SKILL_FILE" ]; then
              echo "ERROR: $skill_dir missing SKILL.md"
              ERRORS=$((ERRORS + 1))
              continue
            fi

            # Check YAML frontmatter has name and description
            for field in name description; do
              if ! head -20 "$SKILL_FILE" | grep -q "^${field}:"; then
                echo "ERROR: $SKILL_FILE missing frontmatter field: $field"
                ERRORS=$((ERRORS + 1))
              fi
            done
          done
          [ $ERRORS -gt 0 ] && exit 1
          echo "All SKILL.md files valid"

      - name: Validate directory structure
        run: |
          ERRORS=0
          for plugin_dir in plugins/*/; do
            PLUGIN_NAME=$(basename "$plugin_dir")
            REQUIRED_FILES=(".claude-plugin/plugin.json" "CLAUDE.md" "README.md")
            REQUIRED_DIRS=("skills")

            for f in "${REQUIRED_FILES[@]}"; do
              if [ ! -f "${plugin_dir}${f}" ]; then
                echo "ERROR: plugins/$PLUGIN_NAME missing required file: $f"
                ERRORS=$((ERRORS + 1))
              fi
            done

            for d in "${REQUIRED_DIRS[@]}"; do
              if [ ! -d "${plugin_dir}${d}" ]; then
                echo "ERROR: plugins/$PLUGIN_NAME missing required directory: $d"
                ERRORS=$((ERRORS + 1))
              fi
            done
          done
          [ $ERRORS -gt 0 ] && exit 1
          echo "All plugin directory structures valid"

      - name: Validate version consistency
        run: |
          ERRORS=0

          # VERSION file vs marketplace.json metadata.version
          FILE_VERSION=$(cat VERSION | tr -d '[:space:]')
          MJ_VERSION=$(grep -oP '"version"\s*:\s*"\K[^"]+' .claude-plugin/marketplace.json | head -1)
          if [ "$FILE_VERSION" != "$MJ_VERSION" ]; then
            echo "ERROR: VERSION ($FILE_VERSION) != marketplace.json metadata.version ($MJ_VERSION)"
            ERRORS=$((ERRORS + 1))
          fi

          # Each plugin.json version vs marketplace.json plugins array
          for pj in plugins/*/.claude-plugin/plugin.json; do
            PLUGIN_DIR=$(dirname "$(dirname "$pj")")
            PLUGIN_NAME=$(basename "$PLUGIN_DIR")
            PJ_VERSION=$(grep -oP '"version"\s*:\s*"\K[^"]+' "$pj")

            # Extract version for this plugin from marketplace.json
            # Use Python for reliable JSON parsing
            MJ_PJ_VERSION=$(python3 -c "
import json, sys
with open('.claude-plugin/marketplace.json') as f:
    data = json.load(f)
for p in data['plugins']:
    if p['name'] == '$PLUGIN_NAME':
        print(p['version'])
        break
")
            if [ "$PJ_VERSION" != "$MJ_PJ_VERSION" ]; then
              echo "ERROR: $PLUGIN_NAME plugin.json ($PJ_VERSION) != marketplace.json ($MJ_PJ_VERSION)"
              ERRORS=$((ERRORS + 1))
            fi
          done

          [ $ERRORS -gt 0 ] && exit 1
          echo "All versions consistent"

      - name: Validate CHANGELOG presence
        run: |
          ERRORS=0

          if [ ! -f "CHANGELOG.md" ]; then
            echo "ERROR: Root CHANGELOG.md not found"
            ERRORS=$((ERRORS + 1))
          fi

          for plugin_dir in plugins/*/; do
            PLUGIN_NAME=$(basename "$plugin_dir")
            if [ ! -f "${plugin_dir}CHANGELOG.md" ]; then
              echo "ERROR: plugins/$PLUGIN_NAME/CHANGELOG.md not found"
              ERRORS=$((ERRORS + 1))
            fi
          done

          [ $ERRORS -gt 0 ] && exit 1
          echo "All CHANGELOGs present"
```

- [ ] **Step 3: 验证 YAML 语法**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" 2>&1 || echo "YAML syntax error"
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "infra(ci): add CI validation workflow"
```

---

### Task 5: Release Workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: 创建 release.yml**

```yaml
name: Release

on:
  push:
    branches: [main]
    paths: ['VERSION']

jobs:
  sync-to-gitee:
    name: Sync to Gitee
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Push to Gitee mirror
        env:
          GITEE_USERNAME: ${{ secrets.GITEE_USERNAME }}
          GITEE_TOKEN: ${{ secrets.GITEE_TOKEN }}
        run: |
          git remote add gitee "https://${GITEE_USERNAME}:${GITEE_TOKEN}@gitee.com/ranzuozhou/mj-agentlab-marketplace.git"
          git push gitee HEAD --force
          git push gitee --tags --force

  release:
    name: Create Release
    runs-on: ubuntu-latest
    needs: sync-to-gitee
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Extract version
        id: version
        run: |
          VERSION=$(cat VERSION | tr -d '[:space:]')
          if ! echo "$VERSION" | grep -qP '^[0-9]+\.[0-9]+\.[0-9]+$'; then
            echo "ERROR: Invalid version format '$VERSION'"
            exit 1
          fi
          echo "version=$VERSION" >> "$GITHUB_OUTPUT"

      - name: Check if tag exists
        id: check_tag
        run: |
          if git tag -l "v${{ steps.version.outputs.version }}" | grep -q .; then
            echo "exists=true" >> "$GITHUB_OUTPUT"
            echo "Tag v${{ steps.version.outputs.version }} already exists, skipping release"
          else
            echo "exists=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Create and push tag
        if: steps.check_tag.outputs.exists == 'false'
        env:
          GITEE_USERNAME: ${{ secrets.GITEE_USERNAME }}
          GITEE_TOKEN: ${{ secrets.GITEE_TOKEN }}
        run: |
          VERSION="v${{ steps.version.outputs.version }}"
          git tag "$VERSION"
          git push origin "$VERSION"
          git remote add gitee "https://${GITEE_USERNAME}:${GITEE_TOKEN}@gitee.com/ranzuozhou/mj-agentlab-marketplace.git" 2>/dev/null || true
          git push gitee "$VERSION"

      - name: Extract release notes from CHANGELOG
        if: steps.check_tag.outputs.exists == 'false'
        id: notes
        run: |
          VERSION="${{ steps.version.outputs.version }}"
          NOTES=$(awk "/^## \\[$VERSION\\]/{found=1; next} /^## \\[/{if(found) exit} found{print}" CHANGELOG.md)
          echo "$NOTES" > /tmp/release-notes.md
          echo "--- Release Notes ---"
          cat /tmp/release-notes.md

      - name: Create GitHub Release
        if: steps.check_tag.outputs.exists == 'false'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release create "v${{ steps.version.outputs.version }}" \
            --title "v${{ steps.version.outputs.version }}" \
            --notes-file /tmp/release-notes.md
```

- [ ] **Step 2: 验证 YAML 语法**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/release.yml'))" 2>&1 || echo "YAML syntax error"
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "infra(ci): add release workflow"
```

---

## Chunk 4: PR & Issue 模板

### Task 6: PR 模板

**Files:**
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/PULL_REQUEST_TEMPLATE/feature.md`
- Create: `.github/PULL_REQUEST_TEMPLATE/bugfix.md`
- Create: `.github/PULL_REQUEST_TEMPLATE/documentation.md`
- Create: `.github/PULL_REQUEST_TEMPLATE/maintain.md`
- Create: `.github/PULL_REQUEST_TEMPLATE/hotfix.md`
- Create: `.github/PULL_REQUEST_TEMPLATE/release.md`

参考源文件：`D:\workspace\10-software-project\projects\mj-system\develop\.github\PULL_REQUEST_TEMPLATE\` 下的所有模板。

适配要点（与 mj-system 的差异）：
- 移除 Docker/SQL 相关自检项
- 添加 plugin 相关自检项（plugin.json、SKILL.md frontmatter）
- 版本号引用改为 VERSION 文件
- Commit scope 列表改为：mj-git, mj-doc, mj-n8n, mj-ops, ci, deps, scripts, marketplace
- 分支指南链接改为 `docs/CONTRIBUTING.md`

- [ ] **Step 1: 创建默认 PR 模板**

`.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## 变更摘要
<!-- 简述本次变更的内容和目的 -->

## 关联 Issue
Closes #

## 影响范围
<!-- 受影响的 Plugin / Skill / 基础设施 -->

## 自检结果
- [ ] plugin.json 字段完整（name, description, version, author, license, skills）
- [ ] SKILL.md frontmatter 有效（name, description）
- [ ] 无残留调试代码
- [ ] Commit message 符合 `<type>(<scope>): <summary>` 规范

## 审核要点
<!-- 提示 Reviewer 重点关注的内容 -->
```

- [ ] **Step 2: 创建 feature PR 模板**

`.github/PULL_REQUEST_TEMPLATE/feature.md`:

```markdown
---
name: Feature PR
about: 新功能、新 Skill、重构等功能开发 (feature/*) 的 Pull Request
---

## 变更摘要
<!-- 简述本次变更的内容和目的 -->

## 影响范围
<!-- 列出受影响的 Plugin / Skill -->

## 审核要点
<!-- 提示审核者重点关注的内容 -->

## 自检结果
- [ ] plugin.json 字段完整（如涉及新增/变更 Plugin）
- [ ] SKILL.md frontmatter 有效（如涉及新增/变更 Skill）
- [ ] 无硬编码（IP、密码、路径、Token）
- [ ] 无残留调试代码
- [ ] Commit message 符合 `<type>(<scope>): <summary>` 规范（允许类型：`feat` / `refactor` / `test` / `docs`）
- [ ] CHANGELOG.md `[Unreleased]` 区块已更新
```

- [ ] **Step 3: 创建 bugfix PR 模板**

`.github/PULL_REQUEST_TEMPLATE/bugfix.md`:

```markdown
---
name: Bugfix PR
about: 常规 Bug 修复 (bugfix/*) 的 Pull Request
---

## Bug 描述
<!-- 一句话描述 Bug 现象 -->

## 根因分析
<!-- 简述问题的根本原因 -->

## 修复方案
<!-- 描述修复方法和关键改动 -->

## 影响范围
<!-- 列出受影响的 Plugin / Skill -->

## 自检结果
- [ ] Bug 已复现并验证修复
- [ ] 无引入新的回归问题
- [ ] 无残留调试代码
- [ ] Commit message 符合规范（仅含 `fix` / `test` / `docs` 类型）
- [ ] CHANGELOG.md `[Unreleased]` 区块已更新
```

- [ ] **Step 4: 创建 documentation PR 模板**

`.github/PULL_REQUEST_TEMPLATE/documentation.md`:

```markdown
---
name: Documentation PR
about: 纯文档变更 (documentation/*) 的 Pull Request
---

## 文档变更内容
<!-- 列出新增或修改的文档及变更摘要 -->

## 变更原因
<!-- 为什么需要这次文档更新 -->

## 自检结果
- [ ] 文件命名符合规范
- [ ] 内部链接有效
- [ ] CLAUDE.md 已同步更新（如涉及 Plugin 文档结构变更）
- [ ] Commit message 仅含 `docs` 类型
```

- [ ] **Step 5: 创建 maintain PR 模板**

`.github/PULL_REQUEST_TEMPLATE/maintain.md`:

```markdown
---
name: Maintain PR
about: CI/CD、脚本、依赖等基础设施维护 (maintain/*) 的 Pull Request
---

## 变更摘要
<!-- 简述本次维护变更的内容和目的 -->

## 影响评估
<!-- 列出受影响的环境、服务或工具链 -->

## 审核要点
<!-- 提示审核者重点关注的内容 -->

## 自检结果
- [ ] 配置文件语法正确
- [ ] CI/CD 流水线不受影响（或已同步更新）
- [ ] 无硬编码敏感信息（密钥、IP、密码）
- [ ] Commit message 符合规范（仅含 `infra` / `docs` 类型）
```

- [ ] **Step 6: 创建 hotfix PR 模板**

`.github/PULL_REQUEST_TEMPLATE/hotfix.md`:

```markdown
---
name: Hotfix PR
about: 紧急修复 (hotfix/*) 的 Pull Request，目标分支为 main
---

> [!warning] Hotfix PR 目标分支为 `main`，合并后需同步到 `develop`

## 问题描述
<!-- 一句话描述问题现象 -->

## 影响范围
<!-- 受影响的 Plugin / Skill / 用户 -->

## 根因分析
<!-- 简述问题的根本原因 -->

## 修复方案
<!-- 描述修复方法和关键改动 -->

## 回滚预案
<!-- 如修复引入新问题，如何快速回滚 -->

## 自检结果
- [ ] 问题已复现并验证修复
- [ ] 无引入新的回归问题
- [ ] 仅包含 `fix` 类型 commit
- [ ] 合并后已计划同步到 develop
```

- [ ] **Step 7: 创建 release PR 模板**

`.github/PULL_REQUEST_TEMPLATE/release.md`:

```markdown
---
name: Release PR
about: 版本发布 (develop → main) 的 Pull Request
---

## Release vX.Y.Z — <版本主题>

### Highlights
<!-- 核心变更列表 -->

### 审核要点
- [ ] CHANGELOG.md 完整性（`[Unreleased]` 已转为正式版本节）
- [ ] VERSION 文件与 marketplace.json 版本一致
- [ ] 各 plugin.json 版本号与 marketplace.json plugins 数组一致
- [ ] 无残留调试代码
- [ ] 无未关闭的阻塞性 Issue

### Details
See [CHANGELOG.md](CHANGELOG.md) for full release notes.
```

- [ ] **Step 8: 验证文件数量**

```bash
ls .github/PULL_REQUEST_TEMPLATE.md .github/PULL_REQUEST_TEMPLATE/*.md | wc -l
# Expected: 7 (1 default + 6 type-specific)
```

---

### Task 7: Issue 模板

**Files:**
- Create: `.github/ISSUE_TEMPLATE/feature.md`
- Create: `.github/ISSUE_TEMPLATE/bugfix.md`
- Create: `.github/ISSUE_TEMPLATE/documentation.md`
- Create: `.github/ISSUE_TEMPLATE/maintain.md`
- Create: `.github/ISSUE_TEMPLATE/hotfix.md`
- Create: `.github/ISSUE_TEMPLATE/config.yml`

参考源文件：`D:\workspace\10-software-project\projects\mj-system\develop\.github\ISSUE_TEMPLATE\` 下的所有模板。

适配要点：分支指南链接改为 `docs/CONTRIBUTING.md`，移除服务/模块相关字段，添加 Plugin/Skill 字段。

- [ ] **Step 1: 创建 feature Issue 模板**

`.github/ISSUE_TEMPLATE/feature.md`:

```markdown
---
name: 功能 / 需求
about: 新功能开发、新增 Skill 或需求变更
title: "[Feature] "
labels: feature
assignees: ""
---

**做什么**
一句话描述要实现的东西。

**为什么**
背景或原因，不废话。

**完成标准**
- [ ] 标准 1
- [ ] 标准 2

**备注**（可选）
涉及 Plugin、已知风险、依赖 Issue #xx

> **分支命名**：`feature/<本 Issue 编号>-<简述>`（例：`feature/12-add-release-skill`）
> 详见 [CONTRIBUTING.md](../../docs/CONTRIBUTING.md)
```

- [ ] **Step 2: 创建 bugfix Issue 模板**

`.github/ISSUE_TEMPLATE/bugfix.md`:

```markdown
---
name: Bug 报告
about: 报告一个 Skill 或 Plugin 的问题
title: "[Bugfix] "
labels: bugfix
assignees: ""
---

**现象**
一句话描述问题。

**复现**
1. 步骤一
2. 步骤二

**期望 vs 实际**
- 期望：
- 实际：

**环境**：Plugin 名称 · vX.Y.Z

> **分支命名**：`bugfix/<本 Issue 编号>-<简述>`（例：`bugfix/25-commit-scope-error`）
> 详见 [CONTRIBUTING.md](../../docs/CONTRIBUTING.md)
```

- [ ] **Step 3: 创建 documentation Issue 模板**

`.github/ISSUE_TEMPLATE/documentation.md`:

```markdown
---
name: 文档变更
about: 文档新增、修改或重组
title: "[Documentation] "
labels: documentation
assignees: ""
---

**变更内容**
一句话描述要变更的文档和内容。

**变更原因**
为什么需要这次变更。

**完成标准**
- [ ] 标准 1
- [ ] 标准 2

> **分支命名**：`documentation/<本 Issue 编号>-<简述>`（例：`documentation/15-update-readme`）
> 详见 [CONTRIBUTING.md](../../docs/CONTRIBUTING.md)
```

- [ ] **Step 4: 创建 maintain Issue 模板**

`.github/ISSUE_TEMPLATE/maintain.md`:

```markdown
---
name: 维护任务
about: CI/CD、脚本、依赖等非功能变更
title: "[Maintain] "
labels: maintain
assignees: ""
---

**变更内容**
一句话描述要做什么。

**影响评估**
- 影响范围：
- 是否需要停服：是 / 否

**完成标准**
- [ ] 标准 1
- [ ] 标准 2

> **分支命名**：`maintain/<本 Issue 编号>-<简述>`（例：`maintain/8-add-ci-workflow`）
> 详见 [CONTRIBUTING.md](../../docs/CONTRIBUTING.md)
```

- [ ] **Step 5: 创建 hotfix Issue 模板**

`.github/ISSUE_TEMPLATE/hotfix.md`:

```markdown
---
name: 紧急修复
about: 影响使用的紧急 Bug
title: "[Hotfix] "
labels: hotfix
assignees: ""
---

**现象**
一句话描述问题。

**影响范围**
受影响的 Plugin / Skill / 用户。

**复现**
1. 步骤一
2. 步骤二

**期望 vs 实际**
- 期望：
- 实际：

> **注意**：Hotfix 从 `main` 创建分支，PR 目标也是 `main`（合并后需同步到 `develop`）。
> **分支命名**：`hotfix/<本 Issue 编号>-<简述>`（例：`hotfix/20-push-skill-crash`）
> 详见 [CONTRIBUTING.md](../../docs/CONTRIBUTING.md)
```

- [ ] **Step 6: 创建 config.yml**

`.github/ISSUE_TEMPLATE/config.yml`:

```yaml
blank_issues_enabled: false
contact_links:
  - name: 贡献指南
    url: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/develop/docs/CONTRIBUTING.md
    about: 不确定选哪个模板？查看分支类型和贡献指引。
```

- [ ] **Step 7: 验证文件数量**

```bash
ls .github/ISSUE_TEMPLATE/ | wc -l
# Expected: 6 (5 templates + config.yml)
```

- [ ] **Step 8: Commit**

```bash
git add .github/PULL_REQUEST_TEMPLATE.md .github/PULL_REQUEST_TEMPLATE/ .github/ISSUE_TEMPLATE/
git commit -m "infra(marketplace): add PR and issue templates"
```

---

## Chunk 5: 文档 + README + .gitignore

### Task 8: CONTRIBUTING.md

**Files:**
- Create: `docs/CONTRIBUTING.md`

- [ ] **Step 1: 创建 CONTRIBUTING.md**

```markdown
# 贡献指南 — MJ AgentLab Marketplace

本文档面向人类贡献者，说明分支策略、提交规范、版本管理和发布流程。
Claude Code agent 行为规范请参考各 Plugin 的 SKILL.md（如 mj-git 的 commit-rules.md、branch-rules.md）。

## 分支策略

采用 Git Flow 模型，与 [mj-system](https://github.com/MJ-AgentLab/mj-system) 保持一致。

### 永久分支

| 分支 | 用途 | 保护 |
|------|------|------|
| `main` | 生产就绪 | PR-only |
| `develop` | 集成主线 | PR-only |

### 临时分支

| 类型 | 来源 | 用途 |
|------|------|------|
| `feature/*` | develop | 新功能、新 Skill |
| `bugfix/*` | develop | Bug 修复 |
| `documentation/*` | develop | 纯文档变更 |
| `maintain/*` | develop | CI/CD、脚本、依赖维护 |
| `hotfix/*` | main | 紧急修复（PR 目标也是 main，合并后需同步 develop） |

### 命名规范

```
<type>/<issue-id>-<description>    # 有 Issue 时
<type>/<description>               # 无 Issue 时
```

示例：
- `feature/12-add-release-skill`
- `bugfix/25-commit-scope-error`
- `maintain/add-ci-workflow`

## 提交规范

### 格式

```
<type>(<scope>): <summary>
```

### 类型

| Type | 用途 |
|------|------|
| `feat` | 新功能、新 Skill |
| `fix` | Bug 修复 |
| `perf` | 性能优化 |
| `refactor` | 重构 |
| `test` | 测试 |
| `docs` | 文档 |
| `infra` | CI/CD、脚本、基础设施 |

### Scope

| Scope | 范围 |
|-------|------|
| `mj-git` | mj-git Plugin |
| `mj-doc` | mj-doc Plugin |
| `mj-n8n` | mj-n8n Plugin |
| `mj-ops` | mj-ops Plugin |
| `marketplace` | Marketplace 整体（README、marketplace.json、release） |
| `ci` | CI/CD workflows |
| `scripts` | 脚本（bump-version 等） |
| `deps` | 依赖管理 |

### 规则

- summary 小写开头，不加句号，≤72 字符
- 示例：`feat(mj-git): add worktree cleanup to delete skill`
- 示例：`infra(ci): add SKILL.md frontmatter validation`

## 版本管理

### 语义化版本

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：`MAJOR.MINOR.PATCH`

### 双层版本

| 层级 | 权威源 | 说明 |
|------|--------|------|
| Marketplace 整体 | `VERSION` 文件 | 新增/删除 Plugin、跨 Plugin 变更 |
| 各 Plugin 独立 | `plugins/<name>/.claude-plugin/plugin.json` | Plugin 内部变更 |

两者独立升级，互不影响。

### 版本升级

```powershell
# 升级 marketplace 版本
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -DryRun
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0"

# 升级某个 plugin 版本
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "mj-git"
```

### 规则

- Feature/bugfix 分支**不**修改版本号
- 版本升级在 develop 分支上执行，合并到 main 时触发自动发布

## CHANGELOG 规范

格式：[Keep a Changelog](https://keepachangelog.com/zh-CN/)

- 根 `CHANGELOG.md`：Marketplace 级事件
- 各 Plugin `CHANGELOG.md`：Plugin 内部变更
- 所有变更先写入 `[Unreleased]`，发布时转为正式版本节
- 分类：Added / Changed / Fixed / Removed

## 发布流程

1. 在 develop 分支上 bump 版本号（marketplace 和/或各 plugin）
2. 更新 CHANGELOG.md：`[Unreleased]` → `[X.Y.Z] - YYYY-MM-DD`
3. Commit: `infra(marketplace): release v1.1.0`
4. 创建 PR：develop → main（使用 release PR 模板）
5. 合并后自动触发：创建 git tag → GitHub Release → Gitee 同步

## 回滚流程

如发布版本存在问题，按以下步骤回滚：

1. 从 main 创建 hotfix 分支修复问题
2. 修复后 bump 为 patch 版本（如 1.1.0 → 1.1.1）
3. 走正常的 hotfix PR 流程
4. 如需删除错误的 GitHub Release：`gh release delete vX.Y.Z --yes`
5. 如需删除错误的 tag：`git tag -d vX.Y.Z && git push origin --delete vX.Y.Z`

## Bare Repo + Worktree

本项目使用 bare repo + worktree 模式管理多分支：

```bash
# 首次克隆（使用专用脚本）
powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 \
  -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace

# 添加新分支 worktree
powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 \
  -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace \
  -Branches "feature/12-add-release-skill"
```

结构：
```
mj-agentlab-marketplace/
├── .bare/       # bare repo（共享对象库）
├── .git         # 指针文件 (gitdir: ./.bare)
├── develop/     # develop worktree
├── feature/     # feature 分支 worktree
└── main/        # main worktree
```

## 双远程推送

```bash
git pushall   # 同时推送到 GitHub + Gitee
```
```

- [ ] **Step 2: Commit**

```bash
git add docs/CONTRIBUTING.md
git commit -m "docs(marketplace): add contributing guide"
```

---

### Task 9: README 和 .gitignore 更新

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: 更新 README.md**

在标题后添加徽章，在插件表格添加 Version 列，添加贡献和版本管理章节：

```markdown
# MJ AgentLab Marketplace

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

MJ System 团队插件市场 — 提供文档、Git、n8n、运维等 Claude Code 插件。

## 插件目录

| Plugin | 描述 | Skills | Version |
|--------|------|--------|---------|
| **mj-doc** | 文档工作流：规划、编写、校验、迁移、同步、审查 | 7 | 1.0.0 |
| **mj-git** | Git 工作流：分支、提交、推送、PR、Review、同步、清理 | 9 | 1.0.0 |
| **mj-n8n** | n8n 工作流：设计、编写、模板、配置、文档、渲染、晋升 | 7 | 1.0.0 |
| **mj-ops** | 运维操作：环境搭建/清理、ETL 触发 | 4 | 1.0.0 |

## 安装

```bash
# 1. 注册 marketplace
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace

# 2. 安装所需 plugin
/plugin install mj-doc@mj-agentlab-marketplace
/plugin install mj-git@mj-agentlab-marketplace
/plugin install mj-n8n@mj-agentlab-marketplace
/plugin install mj-ops@mj-agentlab-marketplace
```

## 更新

```bash
/plugin update mj-doc@mj-agentlab-marketplace
```

## 版本管理

- Marketplace 和各 Plugin 独立版本管理
- 变更日志详见 [CHANGELOG.md](CHANGELOG.md)
- 发布流程和贡献指引详见 [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## 许可证

MIT
```

- [ ] **Step 2: 更新 .gitignore**

在文件末尾添加：

```gitignore
# Scripts output
*.bak
*.tmp
```

- [ ] **Step 3: Commit**

```bash
git add README.md .gitignore
git commit -m "docs(marketplace): update README with version info"
```

---

## Chunk 6: Git Hooks + Clone-Bare 脚本

### Task 10: Git Hooks 安装器

**Files:**
- Create: `scripts/install-hooks.ps1`

- [ ] **Step 1: 创建 install-hooks.ps1**

```powershell
<#
.SYNOPSIS
    Install git hooks for mj-agentlab-marketplace

.DESCRIPTION
    Installs commit-msg hook that validates commit message format.
    Format: <type>(<scope>): <summary>

    Handles both regular .git directory and bare repo + worktree
    setup (where .git is a pointer file).

.EXAMPLE
    .\scripts\install-hooks.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Resolve hooks directory (handle bare repo + worktree)
$GitPath = Join-Path $ProjectRoot ".git"
if (Test-Path $GitPath -PathType Leaf) {
    # .git is a file (pointer to bare repo)
    $GitDir = (Get-Content $GitPath).Trim() -replace "^gitdir:\s*", ""
    if (-not [System.IO.Path]::IsPathRooted($GitDir)) {
        $GitDir = Join-Path $ProjectRoot $GitDir
    }
    $HooksDir = Join-Path $GitDir "hooks"
} else {
    $HooksDir = Join-Path $GitPath "hooks"
}

if (-not (Test-Path $HooksDir)) {
    New-Item -ItemType Directory -Path $HooksDir -Force | Out-Null
}

$HookFile = Join-Path $HooksDir "commit-msg"

$HookContent = @'
#!/bin/sh
# commit-msg hook: validate commit message format
# Format: <type>(<scope>): <summary>

MSG=$(head -1 "$1")

# Allow merge commits
if echo "$MSG" | grep -qE "^Merge "; then
  exit 0
fi

PATTERN='^(feat|fix|perf|refactor|test|docs|infra)\((mj-git|mj-doc|mj-n8n|mj-ops|ci|deps|scripts|marketplace)\): .{1,72}$'

if ! echo "$MSG" | grep -qE "$PATTERN"; then
  echo ""
  echo "ERROR: Commit message does not match required format."
  echo ""
  echo "  Expected: <type>(<scope>): <summary>"
  echo ""
  echo "  Types:  feat | fix | perf | refactor | test | docs | infra"
  echo "  Scopes: mj-git | mj-doc | mj-n8n | mj-ops | ci | deps | scripts | marketplace"
  echo ""
  echo "  Your message: $MSG"
  echo ""
  exit 1
fi
'@

Set-Content -Path $HookFile -Value $HookContent -Encoding UTF8 -NoNewline

Write-Host "Installed commit-msg hook to: $HookFile" -ForegroundColor Green
Write-Host ""
Write-Host "Validation format: <type>(<scope>): <summary>" -ForegroundColor White
Write-Host "  Types:  feat | fix | perf | refactor | test | docs | infra" -ForegroundColor White
Write-Host "  Scopes: mj-git | mj-doc | mj-n8n | mj-ops | ci | deps | scripts | marketplace" -ForegroundColor White
```

- [ ] **Step 2: 验证脚本**

```bash
pwsh -File scripts/install-hooks.ps1
# Expected: "Installed commit-msg hook to: ..."
```

- [ ] **Step 3: 测试 hook（可选）**

```bash
# 故意使用错误格式提交，应被拒绝
echo "test" > /tmp/test-hook.txt
git add /tmp/test-hook.txt 2>/dev/null || true
git commit -m "wrong format" --allow-empty 2>&1
# Expected: ERROR: Commit message does not match required format.
```

- [ ] **Step 4: Commit**

```bash
git add scripts/install-hooks.ps1
git commit -m "infra(scripts): add git hooks installer"
```

---

### Task 11: Clone-Bare 脚本（仓库外）

**Files:**
- Create: `D:\workspace\10-software-project\projects\mj-agentlab-marketplace-clone-bare.ps1`

- [ ] **Step 1: 创建 clone-bare 脚本**

基于 `D:\workspace\10-software-project\projects\mj-system-clone-bare.ps1`，仅修改默认 GiteeUrl 和注释。

复制 `mj-system-clone-bare.ps1` 内容，做以下修改：
1. 文件头注释中的项目名改为 `mj-agentlab-marketplace`
2. 示例中的 URL 改为 `https://github.com/MJ-AgentLab/mj-agentlab-marketplace`
3. `$GiteeUrl` 默认值改为 `"https://gitee.com/ranzuozhou/mj-agentlab-marketplace.git"`

```powershell
# mj-agentlab-marketplace-clone-bare.ps1
# 克隆 MJ AgentLab Marketplace 为 Bare Repo + Worktree 结构，并自动配置 Gitee 镜像 remote
# 支持增量模式：项目目录已存在时，跳过初始化，仅添加新 worktree
#
# Usage:
#   .\mj-agentlab-marketplace-clone-bare.ps1 -RepoUrl <url> [-Branches "develop"] [-GiteeUrl <url>]
#
# Examples:
#   # 新成员入职（克隆 develop worktree）
#   powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace
#
#   # 获取特定分支
#   powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace -Branches "maintain/add-version-management"
#
#   # 同时创建多个 worktree
#   powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace -Branches "develop,main"
#
#   # 增量添加新分支（项目已存在时自动跳过初始化）
#   powershell -ExecutionPolicy Bypass -File .\mj-agentlab-marketplace-clone-bare.ps1 -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace -Branches "feature/12-add-release-skill"

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,

    [Parameter(Mandatory=$false)]
    [string]$Branches = "develop",

    [Parameter(Mandatory=$false)]
    [string]$GiteeUrl = "https://gitee.com/ranzuozhou/mj-agentlab-marketplace.git"
)

# --- 以下逻辑与 mj-system-clone-bare.ps1 完全一致 ---

$BranchList = @($Branches -split "," | ForEach-Object { $_.Trim() })
$ProjectName = ($RepoUrl -split "/")[-1]

if (Test-Path $ProjectName) {
    Write-Host ">>> Project directory '$ProjectName' already exists, entering incremental mode" -ForegroundColor Yellow
    Set-Location $ProjectName
} else {
    Write-Host ">>> Creating project directory: $ProjectName" -ForegroundColor Cyan
    mkdir $ProjectName | Out-Null
    Set-Location $ProjectName

    Write-Host ">>> Cloning bare repo..." -ForegroundColor Cyan
    git clone --bare $RepoUrl .bare
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: git clone --bare failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  - Network unreachable or unstable" -ForegroundColor Yellow
        Write-Host "  - SSL certificate verification failed (check proxy/VPN)" -ForegroundColor Yellow
        Write-Host "  - Repository URL is incorrect: $RepoUrl" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Cleaning up empty project directory..." -ForegroundColor Yellow
        Set-Location ..
        Remove-Item -Recurse -Force $ProjectName
        exit 1
    }

    Write-Host ">>> Creating .git pointer..." -ForegroundColor Cyan
    New-Item .git -ItemType File -Value "gitdir: ./.bare" | Out-Null
}

Write-Host ">>> Fixing refspec and fetching..." -ForegroundColor Cyan
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch origin
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: git fetch origin failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  - Network unreachable or unstable" -ForegroundColor Yellow
    Write-Host "  - SSL certificate verification failed (check proxy/VPN)" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

foreach ($Branch in $BranchList) {
    if (Test-Path $Branch) {
        Write-Host ">>> Worktree '$Branch' already exists, skipping" -ForegroundColor Yellow
    } else {
        Write-Host ">>> Adding worktree: $Branch" -ForegroundColor Cyan
        git worktree add $Branch $Branch
        if ($LASTEXITCODE -ne 0) {
            Write-Host "WARNING: Failed to add worktree '$Branch' (exit code: $LASTEXITCODE), skipping" -ForegroundColor Red
            continue
        }
    }
}

$FirstBranch = $BranchList[0]
if (-not (Test-Path $FirstBranch)) {
    Write-Host ""
    Write-Host "WARNING: Worktree directory '$FirstBranch' does not exist, skipping Gitee remote configuration" -ForegroundColor Red
    Write-Host "You can configure Gitee remote manually later:" -ForegroundColor Yellow
    Write-Host "  cd $ProjectName/$FirstBranch" -ForegroundColor White
    Write-Host "  git remote add gitee $GiteeUrl" -ForegroundColor White
    Write-Host ""
    exit 0
}
Set-Location $FirstBranch

$ExistingRemotes = @(git remote)
if ($ExistingRemotes -contains "gitee") {
    Write-Host ">>> Gitee remote already configured, skipping" -ForegroundColor Yellow
} else {
    Write-Host ">>> Configuring Gitee remote in worktree: $FirstBranch" -ForegroundColor Cyan
    git remote add gitee $GiteeUrl
}

git config alias.pushall '!git push gitee HEAD && git push origin HEAD'

Write-Host ">>> Verifying remotes..." -ForegroundColor Cyan
git remote -v

$Depth = ($FirstBranch -split "/").Count
Set-Location ("../" * $Depth)

Write-Host ""
Write-Host "Done! Directory structure:" -ForegroundColor Green
Get-ChildItem -Force | Select-Object Name
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  cd $ProjectName/$FirstBranch" -ForegroundColor White
Write-Host "  git pushall   # dual-push to GitHub + Gitee" -ForegroundColor White
```

- [ ] **Step 2: 复制到仓库内作为参考副本**

```bash
cp "D:/workspace/10-software-project/projects/mj-agentlab-marketplace-clone-bare.ps1" \
   "D:/workspace/10-software-project/projects/mj-agentlab-marketplace/scripts/clone-bare.ps1"
```

- [ ] **Step 3: 验证两份脚本存在**

```bash
ls -la "D:/workspace/10-software-project/projects/mj-agentlab-marketplace-clone-bare.ps1"
ls -la "D:/workspace/10-software-project/projects/mj-agentlab-marketplace/scripts/clone-bare.ps1"
# Expected: both files exist
```

- [ ] **Step 4: Commit 仓库内副本**

```bash
git add scripts/clone-bare.ps1
git commit -m "infra(scripts): add clone-bare script for bare repo setup"
```

---

## Chunk 7: 前置条件 + 最终验证

### Task 12: GitHub 设置 + 端到端验证

- [ ] **Step 1: 配置 GitHub Secrets**

手动在 GitHub repo Settings → Secrets and variables → Actions 中添加：
- `GITEE_USERNAME`: Gitee 用户名
- `GITEE_TOKEN`: Gitee Personal Access Token

- [ ] **Step 2: 设置分支保护**（在所有代码合并到 develop 后再设置）

手动在 GitHub repo Settings → Branches 中：
- `main`: Require PR, no direct push
- `develop`: Require PR, no direct push

- [ ] **Step 1: 版本升级 DryRun 验证**

```bash
pwsh -File scripts/bump-version.ps1 -From "1.0.0" -To "1.1.0" -DryRun
# Expected: VERSION [MATCH], marketplace.json [MATCH]

pwsh -File scripts/bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "mj-git" -DryRun
# Expected: plugins/mj-git/.claude-plugin/plugin.json [MATCH], marketplace.json [MATCH]
```

- [ ] **Step 2: CI 验证**

```bash
# 从 develop 创建 feature 分支
git checkout develop
git checkout -b feature/test-ci
echo "test" >> README.md
git add README.md
git commit -m "docs(marketplace): test CI validation"
git push -u origin feature/test-ci
# 在 GitHub 上创建 PR 到 develop，查看 CI 是否通过
```

- [ ] **Step 3: Clone-bare 验证（可选）**

在另一个目录测试：

```bash
cd /tmp
pwsh -File "D:/workspace/10-software-project/projects/mj-agentlab-marketplace-clone-bare.ps1" \
  -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace
# Expected: .bare/ + develop/ worktree + gitee remote configured
```

- [ ] **Step 4: 清理测试分支**

```bash
git checkout develop
git branch -D feature/test-ci
git push origin --delete feature/test-ci
```
