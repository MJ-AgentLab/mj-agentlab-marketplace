# Branch Rules Reference

## Branch × Commit Type Allowed Matrix

| Branch Type | Allowed Commit Types | Note |
|-------------|---------------------|------|
| `feature/*` | `feat`, `perf`, `refactor`, `test`, `docs` | Feature dev often includes perf, refactor, tests, docs |
| `bugfix/*` | `fix`, `test`, `docs` | Bug fix often includes test supplements |
| `documentation/*` | `docs` only | Pure doc branch: no `feat` or `fix` commits |
| `maintain/*` | `infra`, `docs` | `infra`=CI/CD/Docker/deps/scripts/config |
| `hotfix/*` | `fix` only | Emergency fix: strictly no other types |

> Code Review can use this table to verify branch discipline. E.g., a `hotfix/*` branch must not contain `feat` commits.

## Branch Type vs Commit Type Naming Distinction

| Branch Type (full word) | Commit Type (abbreviation) |
|------------------------|---------------------------|
| `feature` | `feat` |
| `bugfix` | `fix` |
| `documentation` | `docs` |
| `maintain` | `infra` |
| `hotfix` | `fix` |

The two systems intentionally use different names to avoid confusion.

## Branch Model Overview

```
main              ← deployable versions (protected, PR-only)
│
├── develop       ← development mainline (protected, PR-only)
│   │
│   ├── feature/xxx         ← new features, new services, refactors
│   ├── bugfix/xxx          ← bugs found on develop
│   ├── documentation/xxx   ← standalone doc-only changes
│   └── maintain/xxx        ← CI/Docker/deps/scripts
│
└── hotfix/xxx    ← from main → PR to main → sync to develop
```

## Branch Lifecycle

### feature / bugfix / documentation / maintain

```
develop ─●──────────────────────●───
          │                     │
          └──●──●──●──●────────┘
          create  develop  push  PR merge + delete
```

5 steps: create from develop → develop locally → push → PR to develop → delete after merge

### hotfix

```
main    ─●──────────●──tag──●───
          │          │       │
          └──●──●───┘       │
          create  push→PR    sync to develop
                             │
develop ─────────────────────●───
                          merge main
```

6 steps: create from main → fix → push → PR to main → tag patch version → sync to develop → delete

## Naming Examples

| Scenario | Branch Name |
|----------|------------|
| Issue #12 new user auth | `feature/12-user-auth` |
| New QueryVolumeLoader service | `feature/add-query-volume-loader` |
| QCM migrate to PostgreSQL | `feature/qcm-pg-migration` |
| Issue #25 date parse NPE | `bugfix/25-date-parse-npe` |
| Fix DQV cold start filename | `bugfix/dqv-cold-start-filename` |
| Issue #15 update API docs | `documentation/15-update-api-guide` |
| Add DB naming convention | `documentation/add-db-naming-convention` |
| Issue #8 add PR template | `maintain/8-add-pr-template` |
| Update CI workflow | `maintain/update-ci-workflow` |
| Issue #20 fix production email timeout | `hotfix/20-email-timeout` |

## Quick Commands

| Action | Command |
|--------|---------|
| Create feature branch | `cd develop && git worktree add ../feature/<desc> -b feature/<desc> develop` |
| Create bugfix branch | `cd develop && git worktree add ../bugfix/<desc> -b bugfix/<desc> develop` |
| Create documentation branch | `cd develop && git worktree add ../documentation/<desc> -b documentation/<desc> develop` |
| Create maintain branch | `cd develop && git worktree add ../maintain/<desc> -b maintain/<desc> develop` |
| Create hotfix branch | `git worktree add main main && cd main && git worktree add ../hotfix/<desc> -b hotfix/<desc> main` |
| Push branch (first time) | `git push -u gitee <branch> && git push -u origin <branch>` |
| Delete local branch | `git -C develop branch -d <branch>` |
| Delete remote branch | `git push origin --delete <branch>` |
| View all worktrees | `git worktree list` |
| Add worktree | `git worktree add <type>/<desc> -b <type>/<desc> <base>` |
| Remove worktree | `git worktree remove <type>/<desc>` |

## Common Naming Mistakes

| Mistake | Wrong | Correct |
|---------|-------|---------|
| Using commit type abbreviation | `feat/user-auth` | `feature/user-auth` |
| Uppercase | `Feature/User-Auth` | `feature/user-auth` |
| Spaces | `feature/user auth` | `feature/user-auth` |
| Missing type prefix | `user-auth` | `feature/user-auth` |
| Using checkout on worktree branch | `git checkout develop` (if develop worktree exists) | `cd ../develop` |
