#!/bin/sh
# validate-commits.sh — bulk validator for marketplace commit subjects
#
# Synopsis:
#   ./scripts/validate-commits.sh                       # default range: origin/develop..HEAD
#   ./scripts/validate-commits.sh origin/main..HEAD     # custom range
#   ./scripts/validate-commits.sh HEAD~5..HEAD          # last 5 commits
#
# Exit code: 0 = all pass; 1 = >=1 failure
#
# PATTERN is kept in sync with scripts/install-hooks.ps1 + .github/workflows/ci.yml
# + docs/rule/[STANDARD]_Commit_Message_Convention.md §3 / §4. Single-source
# consolidation is tracked as a future P2 refactor; for now, 4 sites must match.

set -u

RANGE="${1:-origin/develop..HEAD}"

# Canonical PATTERN — verbatim from install-hooks.ps1 line 52 + ci.yml line 32
PATTERN='^(feat|fix|perf|refactor|test|docs|infra)\((learn-kit|marketplace|ci|scripts|deps|infra|docs-rule|docs-adr|docs-guide|docs-runbook|docs-spec|release)\): .{1,72}$'
ALLOWED_TYPES='feat | fix | perf | refactor | test | docs | infra'
ALLOWED_SCOPES='learn-kit | marketplace | ci | scripts | deps | infra | docs-rule | docs-adr | docs-guide | docs-runbook | docs-spec | release'

# Fetch commits in range (skip merges per CI convention)
COMMITS=$(git log --no-merges --format='%H%x09%s' "$RANGE" 2>/dev/null || true)
if [ -z "$COMMITS" ]; then
  echo "validate-commits: no commits in range '$RANGE' (or range invalid)"
  exit 0
fi

TOTAL=0
FAILED=0
FAIL_OUTPUT=""

# Process each commit; portable while-read (works in /bin/sh + bash + git-bash)
while IFS=$(printf '\t') read -r SHA SUBJECT; do
  [ -z "$SHA" ] && continue
  TOTAL=$((TOTAL + 1))

  if echo "$SUBJECT" | grep -qE "$PATTERN"; then
    continue
  fi

  FAILED=$((FAILED + 1))
  SHORT="$(echo "$SHA" | cut -c1-7)"

  # Diagnose failure reason(s)
  REASONS=""
  # Reason 1: type not in allowed enum (parse leading word before paren)
  TYPE=$(echo "$SUBJECT" | sed -E 's/^([a-z]+)\(.*$/\1/')
  if ! echo "$TYPE" | grep -qE '^(feat|fix|perf|refactor|test|docs|infra)$'; then
    REASONS="$REASONS\n        Reason: type '$TYPE' not in allowed enum"
    REASONS="$REASONS\n                Allowed: $ALLOWED_TYPES"
    if [ "$TYPE" = "chore" ]; then
      REASONS="$REASONS\n                Suggest: 'chore' is NOT in marketplace's 7-type enum; use 'docs', 'refactor', or 'infra'"
    fi
  fi
  # Reason 2: scope not in whitelist (parse between parens)
  SCOPE=$(echo "$SUBJECT" | sed -E 's/^[a-z]+\(([^)]+)\):.*$/\1/')
  if [ -n "$SCOPE" ] && [ "$SCOPE" != "$SUBJECT" ]; then
    if ! echo "$SCOPE" | grep -qE '^(learn-kit|marketplace|ci|scripts|deps|infra|docs-rule|docs-adr|docs-guide|docs-runbook|docs-spec|release)$'; then
      REASONS="$REASONS\n        Reason: scope '$SCOPE' not in allowed whitelist"
      REASONS="$REASONS\n                Allowed: $ALLOWED_SCOPES"
      if [ "$SCOPE" = "docs" ]; then
        REASONS="$REASONS\n                Suggest: 'docs' is a TYPE not a SCOPE; pick 'docs-rule' / 'docs-adr' / 'docs-guide' / 'docs-runbook' / 'docs-spec' based on which subdir you're editing"
      fi
    fi
  fi
  # Reason 3: summary length (after ": ")
  SUMMARY=$(echo "$SUBJECT" | sed -E 's/^[a-z]+\([^)]+\): //')
  if [ -n "$SUMMARY" ] && [ "$SUMMARY" != "$SUBJECT" ]; then
    LEN=$(printf '%s' "$SUMMARY" | wc -m | tr -d ' ')
    if [ "$LEN" -gt 72 ]; then
      REASONS="$REASONS\n        Reason: summary length $LEN chars > 72 limit"
      REASONS="$REASONS\n                (PATTERN .{1,72} counts every char; Chinese / § / → each = 1 char)"
      REASONS="$REASONS\n                Suggest: shorten by $((LEN - 72)) chars; aim ≤ 60 when mixing Chinese for safety margin"
    fi
  fi
  # Fallback if no specific reason detected (e.g., missing parens, leading space, weird format)
  if [ -z "$REASONS" ]; then
    REASONS="\n        Reason: subject does not match overall '<type>(<scope>): <summary>' format"
    REASONS="$REASONS\n                Check: leading lowercase type, parens around scope, ': ' separator (colon + space), non-empty summary"
  fi

  FAIL_OUTPUT="$FAIL_OUTPUT\n  FAIL  $SHORT  $SUBJECT$REASONS\n"
done <<EOF
$COMMITS
EOF

# Final report
PASSED=$((TOTAL - FAILED))
if [ "$FAILED" -eq 0 ]; then
  echo "[OK] $TOTAL commit(s) validated in range '$RANGE'; 0 failures"
  exit 0
fi

echo "[FAIL] $FAILED of $TOTAL commit(s) failed PATTERN validation in range '$RANGE'"
printf "%b" "$FAIL_OUTPUT"
echo ""
echo "See docs/rule/[STANDARD]_Commit_Message_Convention.md §3 / §4 / §11 for canonical whitelists + common-mistakes guidance."
echo "Fix locally before push: 'git rebase -i <base> --reword <commit>' OR cherry-pick onto fresh branch."
exit 1
