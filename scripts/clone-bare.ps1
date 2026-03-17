# mj-agentlab-marketplace-clone-bare.ps1
# 克隆 MJ AgentLab Marketplace 为 Bare Repo + Worktree 结构
# 支持增量模式：项目目录已存在时，跳过初始化，仅添加新 worktree
#
# Usage:
#   .\clone-bare.ps1 -RepoUrl <url> [-Branches "develop"]
#
# Examples:
#   # 新成员入职（克隆 develop worktree）
#   powershell -ExecutionPolicy Bypass -File .\clone-bare.ps1 -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace
#
#   # 获取特定分支
#   powershell -ExecutionPolicy Bypass -File .\clone-bare.ps1 -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace -Branches "maintain/add-version-management"
#
#   # 同时创建多个 worktree
#   powershell -ExecutionPolicy Bypass -File .\clone-bare.ps1 -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace -Branches "develop,main"
#
#   # 增量添加新分支（项目已存在时自动跳过初始化）
#   powershell -ExecutionPolicy Bypass -File .\clone-bare.ps1 -RepoUrl https://github.com/MJ-AgentLab/mj-agentlab-marketplace -Branches "feature/12-add-release-skill"

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,

    [Parameter(Mandatory=$false)]
    [string]$Branches = "develop"
)

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
    Write-Host "WARNING: No worktree was created successfully" -ForegroundColor Red
    exit 0
}

# Return to project root (handle nested paths like feature/12-add-skill)
Set-Location $FirstBranch
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
Write-Host "  git push origin HEAD" -ForegroundColor White
