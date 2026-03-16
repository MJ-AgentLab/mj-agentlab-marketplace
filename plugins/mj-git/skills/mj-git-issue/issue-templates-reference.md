# Issue Templates Reference

## Template Location

All templates: `.github/ISSUE_TEMPLATE/<template>.md`

## feature.md — Field Guide

**When**: New feature, requirement change, refactor.

| Field | Required | Guidance | Example |
|-------|----------|----------|---------|
| **what** | Yes | One sentence: what to implement | "Add user authentication module with JWT" |
| **why** | Yes | Background or reason, keep it concise | "Current system has no access control, need role-based auth for multi-tenant" |
| **acceptance criteria** | Yes | Checklist of completion conditions | "- [ ] Login API returns JWT\n- [ ] Role middleware blocks unauthorized access" |
| **notes** | No | Related modules, known risks, dependency issues | "Depends on #11. Affects UserService and middleware layer" |

**Title prefix**: `[Feature] `
**Label**: `feature`

**Guidance prompts**:
- what: "Please describe in one sentence what needs to be implemented."
- why: "What is the background or reason for this feature?"
- acceptance criteria: "List the completion criteria (each as a checkbox item)."
- notes: "Any related modules, known risks, or dependency issues? (optional, press Enter to skip)"

**Complete example**:
```markdown
**what**
Add user authentication module with JWT token support.

**why**
Current system has no access control. Multi-tenant deployment requires role-based auth.

**acceptance criteria**
- [ ] Login API returns JWT token
- [ ] Role-based middleware blocks unauthorized requests
- [ ] Token refresh endpoint implemented
- [ ] Unit tests cover auth flow

**notes**
Depends on #11 (database user table). Affects UserService and middleware layer.
```

---

## bugfix.md — Field Guide

**When**: Bug found during development or testing (not production — use hotfix for production).

| Field | Required | Guidance | Example |
|-------|----------|----------|---------|
| **symptom** | Yes | One sentence: what the user sees | "DQV validation stage throws KeyError on submit-type files" |
| **reproduction** | Yes | Numbered steps to reproduce | "1. Upload submit_2025-03-01.xlsx\n2. Run POST /data-quality-validator/process\n3. See KeyError in logs" |
| **expected vs actual** | Yes | Two lines: expected behavior, actual behavior | "Expected: Validation passes\nActual: KeyError: 'submit_count'" |
| **environment** | Yes | Test or dev environment + version | "Test (192.168.0.179) v2.8.0" |

**Title prefix**: `[Bugfix] `
**Label**: `bugfix`

**Guidance prompts**:
- symptom: "Describe the problem in one sentence."
- reproduction: "List the steps to reproduce this bug (numbered list)."
- expected vs actual: "What did you expect to happen, and what actually happened?"
- environment: AskUserQuestion with options: "Dev (localhost)" / "Test (192.168.0.179)" / "Other (specify)"

**Complete example**:
```markdown
**symptom**
DQV validation stage throws KeyError when processing submit-type files.

**reproduction**
1. Upload `submit_2025-03-01.xlsx` to `staging_area/downloaded/`
2. Run `POST /data-quality-validator/process`
3. Observe KeyError in application logs

**expected vs actual**
- Expected: Validation completes and file moves to `staging_area/verified/`
- Actual: KeyError: 'submit_count' at line 142 of validation_strategy.py

**environment**: Test (192.168.0.179) v2.8.0
```

---

## documentation.md — Field Guide

**When**: Pure documentation changes, no code. If docs change alongside code, use the code's branch type instead.

| Field | Required | Guidance | Example |
|-------|----------|----------|---------|
| **change content** | Yes | What docs are being changed and how | "Add API architecture guide for DQV service" |
| **change reason** | Yes | Why this update is needed | "DQV API documentation is missing, new team members can't onboard" |
| **acceptance criteria** | Yes | Checklist of completion conditions | "- [ ] Guide covers all DQV endpoints\n- [ ] INDEX.md updated" |

**Title prefix**: `[Documentation] `
**Label**: `documentation`

**Guidance prompts**:
- change content: "Describe what documentation will be changed or created."
- change reason: "Why is this documentation change needed? (outdated, missing, restructure)"
- acceptance criteria: "List the completion criteria (each as a checkbox item)."

**Complete example**:
```markdown
**change content**
Add API architecture guide for DataQualityValidator service covering all endpoints and data flow.

**change reason**
DQV API documentation is missing. New team members cannot understand the three-stage pipeline without reading source code.

**acceptance criteria**
- [ ] Guide covers all DQV endpoints (process, data-types, health)
- [ ] Three-stage pipeline diagram included
- [ ] INDEX.md updated with new guide entry
```

---

## maintain.md — Field Guide

**When**: CI/CD, Docker, dependencies, tool scripts, config changes. No business logic.

| Field | Required | Guidance | Example |
|-------|----------|----------|---------|
| **change content** | Yes | What infrastructure is being changed | "Add GitHub Actions workflow for automated testing" |
| **impact assessment** | Yes | Scope of impact + downtime requirement | "Scope: CI pipeline. Downtime: No" |
| **acceptance criteria** | Yes | Checklist of completion conditions | "- [ ] CI runs on PR creation\n- [ ] Test results posted as PR comment" |

**Title prefix**: `[Maintain] `
**Label**: `maintain`

**Guidance prompts**:
- change content: "Describe what infrastructure change you want to make."
- impact assessment: "What is the scope of impact? Does this require downtime?" (for downtime, use AskUserQuestion: "Yes" / "No")
- acceptance criteria: "List the completion criteria (each as a checkbox item)."

**Complete example**:
```markdown
**change content**
Add GitHub Actions workflow for automated testing on PR creation.

**impact assessment**
- Scope: CI/CD pipeline, affects all future PRs
- Downtime: No

**acceptance criteria**
- [ ] Workflow triggers on PR to develop
- [ ] Runs Python tests with PostgreSQL service container
- [ ] Test results posted as PR comment
```

---

## hotfix.md — Field Guide

**When**: Production emergency bug. Branch from `main`, PR targets `main`.

> **Key difference from bugfix**: hotfix is for production issues. It creates a branch from `main` (not `develop`), and the PR target is also `main`. After merge, the fix must be synced back to `develop`.

| Field | Required | Guidance | Example |
|-------|----------|----------|---------|
| **symptom** | Yes | One sentence: production problem | "Email collector fails with IMAP timeout on production server" |
| **impact scope** | Yes | Affected users/features/services | "All automated email collection halted, affects daily data pipeline" |
| **reproduction** | Yes | Numbered steps to reproduce | "1. Trigger POST /auto-email-collector/collect\n2. IMAP connection times out after 30s" |
| **expected vs actual** | Yes | Expected behavior vs actual behavior | "Expected: Emails collected\nActual: ConnectionTimeout after 30s" |
| **environment** | Yes | Production environment + version | "Production (192.168.0.106) v2.8.0" |

**Title prefix**: `[Hotfix] `
**Label**: `hotfix`

**Guidance prompts**:
- symptom: "Describe the production problem in one sentence."
- impact scope: "What users, features, or services are affected?"
- reproduction: "List the steps to reproduce (numbered list)."
- expected vs actual: "What did you expect, and what actually happened?"
- environment: Pre-filled as "Production" — ask for version number only.

**Complete example**:
```markdown
**symptom**
Email collector fails with IMAP timeout on production server since 2026-03-10.

**impact scope**
All automated email collection halted. Daily benchmark data pipeline cannot proceed.

**reproduction**
1. Trigger `POST /auto-email-collector/collect`
2. IMAP connection attempts to connect to mail server
3. Connection times out after 30 seconds

**expected vs actual**
- Expected: Emails collected and attachments downloaded to staging area
- Actual: ConnectionTimeout error after 30s, no emails processed

**environment**: Production (192.168.0.106) v2.8.0
```

---

## Quick `gh` Command Reference

| Type | Command |
|------|---------|
| Feature | `gh issue create --title "[Feature] ..." --body-file <tmp> --label feature` |
| Bugfix | `gh issue create --title "[Bugfix] ..." --body-file <tmp> --label bugfix` |
| Documentation | `gh issue create --title "[Documentation] ..." --body-file <tmp> --label documentation` |
| Maintain | `gh issue create --title "[Maintain] ..." --body-file <tmp> --label maintain` |
| Hotfix | `gh issue create --title "[Hotfix] ..." --body-file <tmp> --label hotfix` |
