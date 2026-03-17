---
name: mj-git-issue
description: This skill should be used when the user asks to create a GitHub Issue, select an issue template, fill issue fields, or start a new task or bug report in MJ System. Triggers on "创建issue", "新建issue", "提issue", "报bug", "新任务", "create issue", "new issue", "report bug", "file issue", "open issue". Uses gh CLI with --body-file and reads .github/ISSUE_TEMPLATE at runtime for title prefix and labels.
---

# MJ Git Issue

## Overview

Creates GitHub Issues for MJ System using the project's 5 issue templates. Template-driven: reads `.github/ISSUE_TEMPLATE/<type>.md` at runtime for title prefix and labels, uses `issue-templates-reference.md` for field guidance. Uses `gh` CLI with `--body-file` (same pattern as mj-git-pr).

**Workflow position**: optional pre-step before mj-git-branch.

```text
[mj-git-issue] -(optional)-> mj-git-branch -> mj-git-commit -> mj-git-push -> mj-git-pr
```

## Prerequisite Check

Before starting, verify `gh` is installed and authenticated:

```bash
gh auth status
```

If not installed or not logged in → output install/login guidance and **stop** (H1).

## Step 1: Identify Issue Type

### Step 1a: Urgency Check (AskUserQuestion)

Ask: "Is this a production emergency bug?"
- **Yes** → type = `hotfix`. Display reminder: "Hotfix branches are created from `main`, and the PR target is also `main`." (H4)
- **No** → proceed to Step 1b.

### Step 1b: Choose Regular Type (AskUserQuestion, 4 options)

| Option | Type | Template | Description |
|--------|------|----------|-------------|
| 1 | Feature | `feature.md` | New feature or requirement change |
| 2 | Bugfix | `bugfix.md` | Bug report or abnormal behavior |
| 3 | Documentation | `documentation.md` | Doc creation, update, or restructure |
| 4 | Maintain | `maintain.md` | CI/CD, Docker, dependencies, tool scripts |

## Step 2: Read Issue Template

Read the selected template file:

```bash
cat .github/ISSUE_TEMPLATE/<type>.md
```

Extract from the template (single source of truth):
- **YAML frontmatter**: `title` prefix (e.g. `[Feature] `), `labels` (e.g. `feature`)
- **Body structure**: field names marked by `**field_name**`

For field guidance details (fill examples, required vs optional), refer to `issue-templates-reference.md`.

## Step 3: Guide Title Input

1. Show the title prefix from the template frontmatter (e.g. `[Feature] `)
2. Use AskUserQuestion to ask user for the title description part
3. Combine: `<prefix><user_input>` (e.g. `[Feature] Add user authentication module`)

## Step 4: Guide Body Fields

Fill each field according to the issue type. Per-type field definitions and examples are in `issue-templates-reference.md`.

**Field summary by type**:

| Type | Required Fields | Optional Fields |
|------|----------------|-----------------|
| Feature | what, why, acceptance criteria | notes |
| Bugfix | symptom, reproduction, expected vs actual, environment | — |
| Documentation | change content, change reason, acceptance criteria | — |
| Maintain | change content, impact assessment, acceptance criteria | — |
| Hotfix | symptom, impact scope, reproduction, expected vs actual, environment | — |

**Guidance approach**:
- Short fields (what, symptom) → AskUserQuestion with open-ended input
- List fields (acceptance criteria, reproduction steps) → prompt for multi-line input
- Choice fields (environment, downtime) → AskUserQuestion with options

### Step 4b: Strip Template Footer

All issue templates end with a `> **...` blockquote footer (branch naming guidance for humans). When assembling the Issue body, **always strip this footer** — do not include it in the final content.

Specifically, remove any trailing lines starting with `> ` that contain branch naming or reference guidance.

## Step 5: Preview & Confirm

Assemble and display the complete Issue for user review:

```
## Issue Preview

**Title**: [Feature] Add user authentication module
**Labels**: feature
**Body**:
<filled template content without footer>
```

Use AskUserQuestion to confirm (3 options):
1. **Submit** → proceed to Step 5b
2. **Edit** → ask which field to modify, re-fill, return to preview
3. **Cancel** → clean up and stop (H2)

### Step 5b: Ask Assignee (Optional)

Use AskUserQuestion (3 options):
1. **Assign to me** → `--assignee @me`
2. **Assign to someone else** → ask for username → `--assignee <username>`
3. **Skip** → no assignee flag

## Step 6: Create Issue

```bash
# Write body to temp file
# Windows: $TEMP/issue-body-<type>.md
# Unix: /tmp/issue-body-<type>.md

# Create Issue
gh issue create \
  --title "<title>" \
  --body-file <tmp-file> \
  --label "<label>" \
  [--assignee <user>]    # optional
```

If `gh issue create` fails → display error message, suggest checking network/permissions (H3).

After successful creation, clean up the temp file.

## Step 7: Output & Handoff

Display creation result:

```
## Issue Created

- **URL**: https://github.com/MJ-AgentLab/mj-system/issues/<number>
- **Number**: #<number>
- **Title**: <title>
- **Labels**: <label>

### Next Step (optional)
To start development, use mj-git-branch to create the corresponding branch:
`<type>/<issue-number>-<description>`
```

The handoff is **suggestive, not mandatory** — mj-git-branch's issue-id is optional.

## Human Intervention Points

| # | Trigger | Skill Behavior |
|---|---------|----------------|
| H1 | `gh` not installed or not authenticated | Output install/login instructions, stop |
| H2 | User cancels at preview | Clean up temp file, stop |
| H3 | `gh issue create` fails | Display error, suggest checking network/permissions |
| H4 | User selects Hotfix (Step 1a) | Extra reminder: "Hotfix branch from `main`, PR target also `main`" |
| H5 | Issue body contains template footer | Auto-strip `> **...` blockquote footer, no user prompt |

## Detailed Fields -> issue-templates-reference.md

Complete field-by-field guidance for each issue type with examples in `issue-templates-reference.md`.
