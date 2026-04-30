#!/usr/bin/env python3
"""MJ System Documentation Validator — Framework v5.0

Checks: A1-A6 (blocking) + OB1-OB5 (non-blocking) + line count (advisory).

Usage:
    python validate_doc.py <file_or_dir> [--json]
    python validate_doc.py <file_or_dir> --repo-root <repo>
    python validate_doc.py <file_or_dir> --repo-root <repo> --write-managed-indexes
    python validate_doc.py <file_or_dir> --repo-root <repo> --pr-mode --base-ref <ref> [--head-ref <ref>]
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants — v5.0
# ---------------------------------------------------------------------------

REQUIRED_FRONTMATTER = {"type", "domain", "summary", "owner", "created", "updated", "state"}
WORKING_FRONTMATTER = {"summary", "owner", "created", "updated", "state"}
OPTIONAL_FIELDS = {"tags", "aliases", "supersedes"}

VALID_STATES = {"draft", "active", "deprecated"}
VALID_TYPES = {"guide", "spec", "standard", "adr", "runbook", "postmortem", "issue", "assessment"}
VALID_DOMAINS = {"AEC", "DQV", "QVL", "SVL", "QCM", "SAC", "FC", "DOCKER", "DB", "FLYWAY", "N8N", "CICD", "GIT", "NET", "SYS"}

ADR_DECISIONS = {"accepted", "superseded", "rejected"}
ISSUE_RESOLUTIONS = {"open", "fixed", "wontfix", "obsolete"}
ISSUE_PRIORITIES = {"P0", "P1", "P2", "P3"}

SPEC_EXTRA_FIELDS = {"version"}
STANDARD_EXTRA_FIELDS = {"version"}
ADR_EXTRA_FIELDS = {"decision"}
ISSUE_EXTRA_FIELDS = {"priority", "resolution"}
ASSESSMENT_EXTRA_FIELDS = {"dimensions", "period"}

# v4.5 detection fields (for migration-required message)
V45_SIGNATURE_FIELDS = {"status", "tags", "aliases", "date", "version"}

MANAGED_INDEX_START = "<!-- mj-doc:index:start -->"
MANAGED_INDEX_END = "<!-- mj-doc:index:end -->"

DOCS_FILENAME_RE = re.compile(
    r"^\[(?:GUIDE|ADR|SPEC|RUNBOOK|POSTMORTEM|STANDARD|ISSUE|ASSESSMENT)\]"
    r"(?:_[A-Za-z0-9]+)+"
    r"(?:_v\d+\.\d+)?\.md$"
)
PLAN_FILENAME_RE = re.compile(r"^\[PLAN\](?:_[A-Za-z0-9]+)+\.md$")
ROOT_FILENAME_RE = re.compile(r"^(README|CONTRIBUTING|CHANGELOG|GLOSSARY|CLAUDE)\.md$")
TEMPLATE_FILENAME_RE = re.compile(r"^(TEMPLATE_[A-Z]+|INDEX)\.md$")

LINE_RANGES: dict[str, tuple[int | None, int | None]] = {
    "README": (200, 500),
    "[GUIDE]": (100, 800),
    "[ADR]": (50, 200),
    "[SPEC]": (200, 1500),
    "CONTRIBUTING": (100, 500),
    "[RUNBOOK]": (50, 500),
    "[POSTMORTEM]": (100, 500),
    "[STANDARD]": (100, 1000),
    "[ISSUE]": (50, 200),
    "[ASSESSMENT]": (100, 1000),
    "GLOSSARY": (50, 500),
}

GITHUB_ANCHOR_RE = re.compile(r"\[([^\]]+)\]\(#[^)]+\)")
HEADING_RE = re.compile(r"^(#{1,6})\s*(.*?)\s*$")
UNORDERED_LIST_RE = re.compile(r"^(\s*)([*+\-])\s")
CODE_FENCE_RE = re.compile(r"^(`{3,})(.*)?$")
CALLOUT_RE = re.compile(r"^>\s*\[!(\w+)\]")

VALID_CALLOUT_TYPES = {
    "note", "info", "tip", "hint", "important",
    "warning", "caution", "attention",
    "danger", "error",
    "example", "quote", "cite",
    "abstract", "summary", "tldr",
    "success", "check", "done",
    "question", "help", "faq",
    "failure", "fail", "missing",
    "bug", "todo",
}

# Wikilink and Markdown link patterns for A4
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|[^\]]+)?\]\]")
MD_LINK_RE = re.compile(r"\[([^\]]*)\]\(<?([^)>]+)>?\)")

# A6 default allowlist patterns
A6_ALLOWLIST_PATTERNS = [
    "docs/rule/[STANDARD]_Documentation_Management_Framework_*",
    "docs/rule/[STANDARD]_SQL_*",
    "docs/INDEX.md",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _strip_yaml_quotes(value: str) -> str:
    """Strip one matching pair of surrounding double or single quotes from a YAML scalar.

    YAML quoted scalars (`"active"`, `'active'`) and plain scalars (`active`) all denote
    the same string `active` after parsing. This helper normalizes the two quoted forms
    so downstream enum/equality checks (A2/A3) compare against the unquoted value.

    Mismatched / unbalanced quotes are left untouched (defensive — prefer over-quoting
    surfacing as FAIL than silently rewriting unexpected input).
    """
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
        return value[1:-1]
    return value


def parse_frontmatter(lines: list[str]) -> tuple[dict[str, str], int]:
    """Extract YAML frontmatter fields (shallow key: value) and return end line index."""
    if not lines or lines[0].strip() != "---":
        return {}, 0
    fields: dict[str, str] = {}
    current_key = None
    for i, line in enumerate(lines[1:], start=1):
        stripped = line.strip()
        if stripped == "---":
            return fields, i
        m = re.match(r"^([a-zA-Z_-]+)\s*:", line)
        if m:
            current_key = m.group(1)
            value = line[m.end():].strip()
            if value:
                fields[current_key] = _strip_yaml_quotes(value)
            else:
                fields[current_key] = ""
        elif current_key and stripped.startswith("- "):
            fields[current_key] = fields.get(current_key, "") + stripped
    return {}, 0


def detect_doc_type(filepath: Path, frontmatter: dict[str, str]) -> str:
    """Detect document type from filename or frontmatter."""
    name = filepath.name
    for tag in ("[GUIDE]", "[ADR]", "[SPEC]", "[RUNBOOK]", "[POSTMORTEM]",
                "[STANDARD]", "[ISSUE]", "[ASSESSMENT]"):
        if name.startswith(tag):
            return tag
    if name.startswith("[PLAN]"):
        return "[PLAN]"
    for root_name in ("README", "CONTRIBUTING", "CHANGELOG", "GLOSSARY", "CLAUDE"):
        if name == f"{root_name}.md":
            return root_name
    if name.startswith("INDEX"):
        return "INDEX"
    if name.startswith("TEMPLATE_"):
        return "TEMPLATE"
    return "UNKNOWN"


def detect_layer(filepath: Path, repo_root: Path | None) -> str:
    """Detect which layer the file belongs to: canonical, working, legacy, root, or unknown."""
    if repo_root is None:
        return "unknown"
    try:
        rel = filepath.resolve().relative_to(repo_root.resolve())
    except ValueError:
        return "unknown"
    parts = rel.parts
    if len(parts) >= 3 and parts[0] == "docs" and parts[1] == "archive" and parts[2] == "legacy":
        return "legacy"
    if parts[0] == "docs":
        if len(parts) >= 2 and parts[1] == "_templates":
            return "templates"
        return "canonical"
    if parts[0] == "plans":
        return "working"
    if len(parts) == 1:
        return "root"
    return "unknown"


def is_v45_frontmatter(frontmatter: dict[str, str]) -> bool:
    """Detect if frontmatter looks like v4.5 schema."""
    v45_indicators = {"status", "date"}
    v50_indicators = {"state", "created", "type", "domain"}
    has_v45 = bool(v45_indicators & set(frontmatter.keys()))
    has_v50 = bool(v50_indicators & set(frontmatter.keys()))
    return has_v45 and not has_v50


def is_root_special(doc_type: str) -> bool:
    return doc_type in ("README", "CONTRIBUTING", "CHANGELOG", "GLOSSARY", "CLAUDE")


def is_governed(doc_type: str, layer: str) -> bool:
    """Check if this file should receive A1-A6 checks."""
    if layer in ("legacy", "templates"):
        return False
    if is_root_special(doc_type):
        return False
    if doc_type in ("INDEX", "TEMPLATE", "UNKNOWN"):
        return False
    return True


def slugify_heading(text: str) -> str:
    """Convert heading text to GitHub-style anchor slug."""
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug)
    return slug


def extract_headings(lines: list[str]) -> list[str]:
    """Extract all heading texts from markdown lines."""
    headings = []
    in_code = False
    for line in lines:
        stripped = line.strip()
        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = HEADING_RE.match(stripped)
        if m:
            headings.append(m.group(2))
    return headings


# ---------------------------------------------------------------------------
# A-Checks (blocking)
# ---------------------------------------------------------------------------

def check_a1(filepath: Path, doc_type: str, layer: str) -> dict:
    """A1: Path and filename legality."""
    if not is_governed(doc_type, layer):
        return {"id": "A1", "status": "SKIP", "message": f"Type '{doc_type}' in layer '{layer}' exempt from A1"}

    name = filepath.name

    # Check filename pattern
    if doc_type == "[PLAN]":
        if not PLAN_FILENAME_RE.match(name):
            return {"id": "A1", "status": "FAIL", "message": f"Filename '{name}' does not match [PLAN] pattern"}
    elif doc_type.startswith("["):
        if not DOCS_FILENAME_RE.match(name):
            return {"id": "A1", "status": "FAIL", "message": f"Filename '{name}' does not match canonical doc pattern"}
    else:
        if not (ROOT_FILENAME_RE.match(name) or TEMPLATE_FILENAME_RE.match(name)):
            return {"id": "A1", "status": "FAIL", "message": f"Filename '{name}' does not match any valid pattern"}

    # Check layer correctness
    if doc_type == "[PLAN]" and layer != "working":
        return {"id": "A1", "status": "FAIL", "message": f"[PLAN] doc must be in plans/, found in '{layer}' layer"}
    if doc_type.startswith("[") and doc_type != "[PLAN]" and layer == "working":
        return {"id": "A1", "status": "FAIL", "message": f"Canonical doc type '{doc_type}' must be in docs/, found in plans/"}

    return {"id": "A1", "status": "PASS", "message": f"Path and filename valid for {doc_type}"}


def check_a2(frontmatter: dict[str, str], doc_type: str, layer: str) -> dict:
    """A2: Frontmatter schema completeness."""
    if not is_governed(doc_type, layer):
        return {"id": "A2", "status": "SKIP", "message": f"Type '{doc_type}' in layer '{layer}' exempt from A2"}

    # v4.5 detection
    if is_v45_frontmatter(frontmatter):
        return {
            "id": "A2",
            "status": "FAIL",
            "message": "v4.5 frontmatter detected (has 'status'/'date', missing 'state'/'created'). "
                       "Run mj-sys-doc-migrate to upgrade to v5.0.",
        }

    # Determine required fields
    if layer == "working" or doc_type == "[PLAN]":
        required = set(WORKING_FRONTMATTER)
    else:
        required = set(REQUIRED_FRONTMATTER)
        fm_type = frontmatter.get("type", "").lower()
        if fm_type in ("spec", "standard"):
            required |= SPEC_EXTRA_FIELDS
        elif fm_type == "adr":
            required |= ADR_EXTRA_FIELDS
        elif fm_type == "issue":
            required |= ISSUE_EXTRA_FIELDS
        elif fm_type == "assessment":
            required |= ASSESSMENT_EXTRA_FIELDS

    missing = []
    empty = []
    for field in sorted(required):
        if field not in frontmatter:
            missing.append(field)
        elif not frontmatter[field].strip():
            empty.append(field)

    # ASSESSMENT dimensions must have ≥2 list items
    list_warn = ""
    if doc_type == "[ASSESSMENT]" and "dimensions" in frontmatter:
        dim_count = frontmatter["dimensions"].count("- ")
        if dim_count < 2:
            list_warn = f"; dimensions has {dim_count} items (need ≥2)"

    if missing or empty or list_warn:
        parts = []
        if missing:
            parts.append(f"missing: {', '.join(missing)}")
        if empty:
            parts.append(f"empty: {', '.join(empty)}")
        total = len(required)
        found = total - len(missing) - len(empty)
        return {
            "id": "A2",
            "status": "FAIL",
            "message": f"{found}/{total} frontmatter fields OK; {'; '.join(parts)}{list_warn}",
        }
    return {
        "id": "A2",
        "status": "PASS",
        "message": f"{len(required)}/{len(required)} required frontmatter fields present",
    }


def check_a3(frontmatter: dict[str, str], doc_type: str, layer: str) -> dict:
    """A3: State and enum validation."""
    if not is_governed(doc_type, layer):
        return {"id": "A3", "status": "SKIP", "message": f"Type '{doc_type}' in layer '{layer}' exempt from A3"}

    errors = []

    state = frontmatter.get("state", "").strip()
    if state and state not in VALID_STATES:
        errors.append(f"state '{state}' not in {sorted(VALID_STATES)}")

    if layer != "working" and doc_type != "[PLAN]":
        fm_type = frontmatter.get("type", "").strip().lower()
        if fm_type and fm_type not in VALID_TYPES:
            errors.append(f"type '{fm_type}' not in {sorted(VALID_TYPES)}")

        domain = frontmatter.get("domain", "").strip()
        if domain and domain not in VALID_DOMAINS:
            errors.append(f"domain '{domain}' not in {sorted(VALID_DOMAINS)}")

        if fm_type == "adr":
            decision = frontmatter.get("decision", "").strip()
            if decision and decision not in ADR_DECISIONS:
                errors.append(f"ADR decision '{decision}' not in {sorted(ADR_DECISIONS)}")

        if fm_type == "issue":
            resolution = frontmatter.get("resolution", "").strip()
            if resolution and resolution not in ISSUE_RESOLUTIONS:
                errors.append(f"ISSUE resolution '{resolution}' not in {sorted(ISSUE_RESOLUTIONS)}")
            priority = frontmatter.get("priority", "").strip()
            if priority and priority not in ISSUE_PRIORITIES:
                errors.append(f"ISSUE priority '{priority}' not in {sorted(ISSUE_PRIORITIES)}")

    if errors:
        return {"id": "A3", "status": "FAIL", "message": f"Enum violations: {'; '.join(errors)}"}
    return {"id": "A3", "status": "PASS", "message": "All enum values valid"}


def check_a4(lines: list[str], fm_end: int, filepath: Path, repo_root: Path | None) -> dict:
    """A4: Internal link target existence."""
    if repo_root is None:
        return {"id": "A4", "status": "SKIP", "message": "Requires --repo-root"}

    violations = []
    in_code = False
    doc_dir = filepath.parent
    headings = extract_headings(lines)
    heading_slugs = [slugify_heading(h) for h in headings]

    for i, line in enumerate(lines[fm_end:], start=fm_end + 1):
        stripped = line.strip()
        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code:
            continue

        # Check Wikilinks
        for m in WIKILINK_RE.finditer(line):
            target_file = m.group(1).strip()
            target_heading = m.group(2)

            if target_file == "":
                # Intra-doc heading link [[#Heading]]
                if target_heading:
                    slug = slugify_heading(target_heading)
                    if slug not in heading_slugs and target_heading not in headings:
                        violations.append(f"L{i}: heading '#{target_heading}' not found in document")
                continue

            # Search for target file
            candidates = list(repo_root.rglob(f"{target_file}.md"))
            if not candidates:
                candidates = list(repo_root.rglob(f"*/{target_file}.md"))
            if len(candidates) == 0:
                violations.append(f"L{i}: wikilink target '[[{target_file}]]' not found")
            elif len(candidates) > 1:
                violations.append(f"L{i}: wikilink '[[{target_file}]]' ambiguous ({len(candidates)} matches)")

        # Check Markdown links
        for m in MD_LINK_RE.finditer(line):
            href = m.group(2).strip()
            if href.startswith(("http://", "https://", "mailto:", "#")):
                continue
            if not href.endswith(".md"):
                continue
            target_path = (doc_dir / href).resolve()
            if not target_path.exists():
                violations.append(f"L{i}: link target '{href}' not found")

    if violations:
        return {
            "id": "A4",
            "status": "FAIL",
            "message": f"Broken links: {'; '.join(violations[:5])}{'...' if len(violations) > 5 else ''}",
        }
    return {"id": "A4", "status": "PASS", "message": f"{sum(1 for _ in WIKILINK_RE.finditer(''.join(lines[fm_end:])))} internal links checked"}


def check_a5(filepath: Path, repo_root: Path | None) -> dict:
    """A5: INDEX managed-block sync."""
    if repo_root is None:
        return {"id": "A5", "status": "SKIP", "message": "Requires --repo-root"}

    if filepath.name != "INDEX.md":
        return {"id": "A5", "status": "SKIP", "message": "Not an INDEX.md file"}

    text = filepath.read_text(encoding="utf-8")
    if MANAGED_INDEX_START not in text:
        return {"id": "A5", "status": "FAIL", "message": "INDEX.md missing managed block start marker"}
    if MANAGED_INDEX_END not in text:
        return {"id": "A5", "status": "FAIL", "message": "INDEX.md missing managed block end marker"}

    # Extract current managed block content
    start_idx = text.index(MANAGED_INDEX_START) + len(MANAGED_INDEX_START)
    end_idx = text.index(MANAGED_INDEX_END)
    current_block = text[start_idx:end_idx].strip()

    # Generate expected block
    expected_block = generate_index_block(filepath.parent, repo_root)

    if current_block != expected_block:
        return {"id": "A5", "status": "FAIL", "message": "INDEX managed block content is out of sync"}
    return {"id": "A5", "status": "PASS", "message": "INDEX managed block in sync"}


def check_a6(repo_root: Path | None, pr_mode: bool, base_ref: str | None, head_ref: str) -> dict:
    """A6: CLAUDE.md allowlist trigger."""
    if not pr_mode:
        return {"id": "A6", "status": "SKIP", "message": "Not in PR mode"}
    if repo_root is None:
        return {"id": "A6", "status": "SKIP", "message": "Requires --repo-root"}
    if base_ref is None:
        return {"id": "A6", "status": "FAIL", "message": "--pr-mode requires --base-ref"}

    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", f"{base_ref}...{head_ref}"],
            capture_output=True, text=True, cwd=repo_root, check=True,
        )
        changed_files = result.stdout.strip().splitlines()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return {"id": "A6", "status": "FAIL", "message": "Failed to run git diff"}

    # Check if any allowlist pattern matches changed files
    allowlist_changed = False
    for changed in changed_files:
        for pattern in A6_ALLOWLIST_PATTERNS:
            if _glob_match(changed, pattern):
                allowlist_changed = True
                break

    if not allowlist_changed:
        return {"id": "A6", "status": "PASS", "message": "No allowlist docs changed"}

    # Check if CLAUDE.md also changed
    claude_changed = any(f.endswith("CLAUDE.md") and "/" not in f for f in changed_files)
    if not claude_changed:
        return {
            "id": "A6",
            "status": "FAIL",
            "message": "Allowlist doc changed but CLAUDE.md was not updated",
        }
    return {"id": "A6", "status": "PASS", "message": "Allowlist doc changed and CLAUDE.md updated"}


def _glob_match(path: str, pattern: str) -> bool:
    """Simple glob matching for A6 allowlist."""
    import fnmatch
    return fnmatch.fnmatch(path, pattern)


# ---------------------------------------------------------------------------
# OB Checks (non-blocking WARN)
# ---------------------------------------------------------------------------

def check_ob1(lines: list[str], fm_end: int) -> dict:
    """OB1: No GitHub-style anchor links."""
    violations = []
    in_code = False
    for i, line in enumerate(lines[fm_end:], start=fm_end + 1):
        stripped = line.strip()
        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code:
            continue
        if GITHUB_ANCHOR_RE.findall(line):
            violations.append(f"L{i}")
    if violations:
        return {"id": "OB1", "status": "WARN", "message": f"GitHub-style anchor links at {', '.join(violations[:5])}"}
    return {"id": "OB1", "status": "PASS", "message": "No GitHub-style anchor links found"}


def check_ob2(lines: list[str], fm_end: int) -> dict:
    """OB2: Heading format."""
    violations = []
    in_code = False
    for i, line in enumerate(lines[fm_end:], start=fm_end + 1):
        stripped = line.strip()
        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code:
            continue
        if re.match(r"^#{1,6}[^#\s]", stripped):
            violations.append(f"L{i}: no space after #")
            continue
        m = HEADING_RE.match(stripped)
        if m:
            text = m.group(2)
            if re.match(r"^\d+\.\s", text):
                violations.append(f"L{i}: period after number")
            if text and text[-1] in ".?!。？！":
                violations.append(f"L{i}: trailing punctuation '{text[-1]}'")
    if violations:
        return {"id": "OB2", "status": "WARN", "message": f"Heading issues: {'; '.join(violations[:5])}"}
    return {"id": "OB2", "status": "PASS", "message": "All headings properly formatted"}


def check_ob3(lines: list[str], fm_end: int) -> dict:
    """OB3: Unordered lists use `-` only."""
    violations = []
    in_code = False
    for i, line in enumerate(lines[fm_end:], start=fm_end + 1):
        stripped = line.strip()
        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = UNORDERED_LIST_RE.match(line)
        if m and m.group(2) in ("*", "+"):
            violations.append(f"L{i}: uses '{m.group(2)}'")
    if violations:
        return {"id": "OB3", "status": "WARN", "message": f"Non-standard list markers: {'; '.join(violations[:5])}"}
    return {"id": "OB3", "status": "PASS", "message": "All unordered lists use '-'"}


def check_ob4(lines: list[str], fm_end: int) -> dict:
    """OB4: Code blocks have language identifiers."""
    violations = []
    in_code = False
    for i, line in enumerate(lines[fm_end:], start=fm_end + 1):
        stripped = line.strip()
        m = CODE_FENCE_RE.match(stripped)
        if m:
            if not in_code:
                lang = (m.group(2) or "").strip()
                if not lang:
                    violations.append(f"L{i}")
                in_code = True
            else:
                in_code = False
    if violations:
        return {"id": "OB4", "status": "WARN", "message": f"Code blocks without language tag at {', '.join(violations[:5])}"}
    return {"id": "OB4", "status": "PASS", "message": "All code blocks have language identifiers"}


def check_ob5(lines: list[str], fm_end: int) -> dict:
    """OB5: Callout types from valid list."""
    violations = []
    in_code = False
    for i, line in enumerate(lines[fm_end:], start=fm_end + 1):
        stripped = line.strip()
        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = CALLOUT_RE.match(stripped)
        if m:
            ctype = m.group(1).lower()
            if ctype not in VALID_CALLOUT_TYPES:
                violations.append(f"L{i}: unknown type '{ctype}'")
    if violations:
        return {"id": "OB5", "status": "WARN", "message": f"Invalid callout types: {'; '.join(violations[:5])}"}
    return {"id": "OB5", "status": "PASS", "message": "All callout types valid"}


# ---------------------------------------------------------------------------
# Advisory Checks
# ---------------------------------------------------------------------------

def check_line_count(lines: list[str], doc_type: str) -> dict:
    """Line count within type range (advisory WARN)."""
    if doc_type not in LINE_RANGES:
        return {"id": "LC", "status": "SKIP", "message": f"Type '{doc_type}' has no line count constraint"}
    min_lines, max_lines = LINE_RANGES[doc_type]
    count = len(lines)
    if min_lines is not None and count < min_lines:
        return {"id": "LC", "status": "WARN", "message": f"{count} lines < minimum {min_lines} for {doc_type}"}
    if max_lines is not None and count > max_lines:
        return {"id": "LC", "status": "WARN", "message": f"{count} lines > maximum {max_lines} for {doc_type}"}
    return {"id": "LC", "status": "PASS", "message": f"{count} lines within {min_lines}-{max_lines} range"}


# ---------------------------------------------------------------------------
# INDEX Generation
# ---------------------------------------------------------------------------

def generate_index_block(index_dir: Path, repo_root: Path) -> str:
    """Generate managed INDEX block content from governed docs in the directory."""
    entries = []
    for md_file in sorted(index_dir.rglob("*.md")):
        if md_file.name == "INDEX.md":
            continue
        if md_file.name.startswith("TEMPLATE_"):
            continue
        # Skip non-governed files
        rel = md_file.relative_to(repo_root)
        if "archive" in rel.parts and "legacy" in rel.parts:
            continue

        text = md_file.read_text(encoding="utf-8")
        fm, _ = parse_frontmatter(text.splitlines())
        summary = fm.get("summary", "").strip()
        if summary:
            entry = f"- [[{md_file.stem}]] — {summary}"
            if len(entry) > 80:
                entry = entry[:77] + "..."
            entries.append(entry)

    return "\n".join(entries)


def write_managed_indexes(repo_root: Path) -> list[str]:
    """Regenerate all managed INDEX blocks under repo_root/docs/."""
    updated = []
    docs_dir = repo_root / "docs"
    if not docs_dir.exists():
        return updated

    for index_file in docs_dir.rglob("INDEX.md"):
        text = index_file.read_text(encoding="utf-8")
        if MANAGED_INDEX_START not in text or MANAGED_INDEX_END not in text:
            continue

        new_block = generate_index_block(index_file.parent, repo_root)

        start_idx = text.index(MANAGED_INDEX_START) + len(MANAGED_INDEX_START)
        end_idx = text.index(MANAGED_INDEX_END)

        new_text = text[:start_idx] + "\n" + new_block + "\n" + text[end_idx:]
        if new_text != text:
            index_file.write_text(new_text, encoding="utf-8")
            updated.append(str(index_file))

    return updated


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def validate_file(filepath: Path, repo_root: Path | None = None,
                  pr_mode: bool = False, base_ref: str | None = None,
                  head_ref: str = "HEAD") -> list[dict]:
    """Run all checks on a single file."""
    text = filepath.read_text(encoding="utf-8")
    lines = text.splitlines()
    frontmatter, fm_end = parse_frontmatter(lines)
    doc_type = detect_doc_type(filepath, frontmatter)
    layer = detect_layer(filepath, repo_root)

    results = []

    # A-checks (blocking)
    if is_governed(doc_type, layer):
        results.append(check_a1(filepath, doc_type, layer))
        results.append(check_a2(frontmatter, doc_type, layer))
        results.append(check_a3(frontmatter, doc_type, layer))
        results.append(check_a4(lines, fm_end, filepath, repo_root))
        results.append(check_a5(filepath, repo_root))
        results.append(check_a6(repo_root, pr_mode, base_ref, head_ref))
    else:
        for aid in ("A1", "A2", "A3", "A4", "A5", "A6"):
            results.append({"id": aid, "status": "SKIP",
                            "message": f"Type '{doc_type}' in layer '{layer}' exempt"})

    # OB checks (non-blocking, run on all docs including root special)
    results.append(check_ob1(lines, fm_end))
    results.append(check_ob2(lines, fm_end))
    results.append(check_ob3(lines, fm_end))
    results.append(check_ob4(lines, fm_end))
    results.append(check_ob5(lines, fm_end))

    # Advisory
    results.append(check_line_count(lines, doc_type))

    return results


def format_text(results: list[dict], filepath: Path) -> str:
    """Format results as human-readable text."""
    lines = [f"=== {filepath.name} ==="]
    for r in results:
        lines.append(f"[{r['id']:3s}] {r['status']:4s} — {r['message']}")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="MJ Doc Validator — Framework v5.0")
    parser.add_argument("target", help="File or directory to validate")
    parser.add_argument("--json", action="store_true", help="JSON output")
    parser.add_argument("--repo-root", type=Path, help="Repository root (required for A4, A5, A6)")
    parser.add_argument("--pr-mode", action="store_true", help="Enable PR-mode checks (A6)")
    parser.add_argument("--base-ref", help="Base git ref for PR-mode diff")
    parser.add_argument("--head-ref", default="HEAD", help="Head git ref for PR-mode diff")
    parser.add_argument("--write-managed-indexes", action="store_true",
                        help="Regenerate managed INDEX blocks")

    args = parser.parse_args()
    target = Path(args.target)

    if args.pr_mode and not args.base_ref:
        print("Error: --pr-mode requires --base-ref", file=sys.stderr)
        sys.exit(1)

    if args.write_managed_indexes:
        if not args.repo_root:
            print("Error: --write-managed-indexes requires --repo-root", file=sys.stderr)
            sys.exit(1)
        updated = write_managed_indexes(args.repo_root)
        if updated:
            print(f"Updated {len(updated)} INDEX file(s):")
            for f in updated:
                print(f"  {f}")
        else:
            print("All INDEX managed blocks already in sync.")
        return

    files: list[Path] = []
    if target.is_dir():
        files = sorted(target.rglob("*.md"))
    elif target.is_file():
        files = [target]
    else:
        print(f"Error: '{target}' not found", file=sys.stderr)
        sys.exit(1)

    all_results: dict[str, list[dict]] = {}
    for f in files:
        all_results[str(f)] = validate_file(
            f, repo_root=args.repo_root,
            pr_mode=args.pr_mode, base_ref=args.base_ref, head_ref=args.head_ref,
        )

    if args.json:
        print(json.dumps(all_results, indent=2, ensure_ascii=False))
    else:
        for fpath, results in all_results.items():
            print(format_text(results, Path(fpath)))
            print()


if __name__ == "__main__":
    main()
