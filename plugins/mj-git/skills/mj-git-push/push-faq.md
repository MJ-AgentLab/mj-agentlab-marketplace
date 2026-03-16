# Push FAQ & Troubleshooting

## Q1: Found a missing file after pushing — what to do?

Add it as a new commit and push again:

```bash
git add <missing file>
git commit -m "<type>(<scope>): 补充遗漏的文件"
git pushall
```

Prevention: always run `git status --short` before pushing.

## Q2: Commit message has a typo after pushing — what to do?

Only if you're the sole user of this branch:

```bash
git commit --amend -m "<type>(<scope>): corrected summary"
git push --force-with-lease   # safer than --force
```

> **Warning**: `--force-with-lease` is only safe on personal dev branches. NEVER use on `main` or `develop`.

## Q3: "no upstream branch" error on first push

Use `-u` to set upstream tracking:

```bash
git push -u gitee <branch> && git push -u origin <branch>
```

## Q4: Pushed to the wrong worktree directory

1. `git worktree list` — find which directory has which branch
2. Navigate to the correct directory: `cd ../<correct-dir>`
3. Push from the correct directory

Prevention: always run `git branch --show-current` before pushing.

## Q5: Forgot to push to Gitee — CI is using old code

Remediate immediately:

```bash
# Catch up Gitee (branch already has upstream set)
git push gitee HEAD

# If new branch without Gitee upstream:
git push -u gitee <branch>
```

After catch-up, CI will pull latest code on next trigger. To immediately trigger CI, re-run the failed workflow on GitHub.

Prevention: configure and always use `git pushall` alias.

## Q6: CI error `upload-pack: not our ref`

**Cause**: Gitee doesn't support SHA-based shallow fetch (`git fetch --depth=1 origin <sha>`). CI workflow is using `github.sha` or `pull_request.head.sha` to fetch from Gitee.

**Fix**: Update CI workflow to use branch name instead of SHA:

```yaml
# Correct: fetch by branch name
BRANCH="${{ github.event.pull_request.head.ref || github.ref_name }}"
git fetch --depth=1 origin "$BRANCH"
git checkout --force "origin/$BRANCH"

# Wrong: fetch by SHA (Gitee doesn't support this)
REF="${{ github.event.pull_request.head.sha || github.sha }}"
git fetch --depth=1 origin "$REF"
```

## Q7: Setting up pre-push hook (optional automation)

Install a hook that warns when uncommitted files are found before pushing.

Create `.git/hooks/pre-push` with:

```bash
#!/bin/bash
# .git/hooks/pre-push — pre-push check for uncommitted files

UNCOMMITTED=$(git status --porcelain)

if [ -n "$UNCOMMITTED" ]; then
    echo ""
    echo "======================================"
    echo "  Warning: 发现未提交的修改"
    echo "======================================"
    echo ""
    git status --short
    echo ""
    echo "请确认这些文件是否应纳入提交。"
    echo "继续推送？(y/N)"
    read -r answer < /dev/tty
    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
        echo "推送已取消。"
        exit 1
    fi
fi
```

Make it executable:

```bash
chmod +x .git/hooks/pre-push
```

**Windows notes**:
- Git for Windows uses MSYS2 — bash syntax works
- Hook path: `<repo-root>/.git/hooks/pre-push` (all worktrees share the main repo's hooks)
- Hook doesn't run with `git push --no-verify`

## Q8: Merge conflict during base sync (step 6)

```bash
# Step 6 produces conflicts:
git fetch origin && git merge origin/develop
# CONFLICT (content): Merge conflict in <file>

# Resolve:
git status                  # see conflict files
# Edit files to resolve conflicts (look for <<<, ===, >>> markers)
git add .                   # mark resolved
git commit -m "merge: 合并 develop 最新内容，解决冲突"

# Too complex to resolve? Abort and get help:
git merge --abort
```

## Q9: Why dual-push? What happens if I skip Gitee?

**Why**: CI/CD Runner server cannot access GitHub (HTTPS 443 times out, SSH KEX blocked by DPI). CI was reconfigured to checkout from **Gitee mirror**. Skipping Gitee push means CI builds from stale code.

**Impact of missing Gitee push**: CI runs against the version before your latest commit. Tests may pass but with wrong code. Deployments will be based on outdated state.

**Fix if forgotten**: `git push gitee HEAD` (or with `-u` for new branch). CI picks up latest on next trigger.

## Q10: Remote `gitee` not configured — how to add?

```bash
# Add Gitee as second remote
git remote add gitee https://gitee.com/ranzuozhou/mj-system.git

# Verify both remotes exist
git remote -v
# origin  https://github.com/MJ-AgentLab/mj-system.git (fetch)
# origin  https://github.com/MJ-AgentLab/mj-system.git (push)
# gitee   https://gitee.com/ranzuozhou/mj-system.git (fetch)
# gitee   https://gitee.com/ranzuozhou/mj-system.git (push)
```
