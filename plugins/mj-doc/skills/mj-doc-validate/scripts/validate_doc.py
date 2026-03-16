#!/usr/bin/env python3
"""MJ System Documentation Validator — Automated checks A1-A3 + OB1-OB5.

Usage:
    python validate_doc.py <file_path>
    python validate_doc.py <file_path> --json   # JSON output
    python validate_doc.py <directory>           # Validate all .md files in directory

Output: Per-check results with PASS/FAIL/WARN status.
"""

import json
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

REQUIRED_FRONTMATTER = {"tags", "aliases", "date", "updated", "version", "status", "owner"}
RUNBOOK_EXTRA_FIELDS = {"last-verified"}

DOCS_FILENAME_RE = re.compile(
    r"^\[(?:GUIDE|ADR|SPEC|RUNBOOK|POSTMORTEM|STANDARD|DEPRECATED)\]"
    r"(?:_\[[A-Z]+\])?"
    r"(?:_[A-Za-z0-9]+)+"
    r"(?:_v\d+\.\d+)?\.md$"
)
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


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

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
        # Simple key detection (handles both `key: value` and `key:` with list below)
        m = re.match(r"^([a-zA-Z_-]+)\s*:", line)
        if m:
            current_key = m.group(1)
            value = line[m.end():].strip()
            if value:
                fields[current_key] = value
            else:
                fields[current_key] = ""  # Will be filled by list items
        elif current_key and stripped.startswith("- "):
            # List item under current key — mark as non-empty
            fields[current_key] = fields.get(current_key, "") + stripped
    return {}, 0  # No closing ---


def detect_doc_type(filepath: Path, frontmatter: dict[str, str]) -> str:
    """Detect document type from filename or frontmatter tags."""
    name = filepath.name
    for tag in ("[GUIDE]", "[ADR]", "[SPEC]", "[RUNBOOK]", "[POSTMORTEM]", "[STANDARD]", "[DEPRECATED]"):
        if name.startswith(tag):
            return tag
    for root_name in ("README", "CONTRIBUTING", "CHANGELOG", "GLOSSARY", "CLAUDE"):
        if name == f"{root_name}.md":
            return root_name
    if name.startswith("INDEX"):
        return "INDEX"
    if name.startswith("TEMPLATE_"):
        return "TEMPLATE"
    return "UNKNOWN"


# ---------------------------------------------------------------------------
# Check functions
# ---------------------------------------------------------------------------

def check_a1(frontmatter: dict[str, str], doc_type: str) -> dict:
    """A1: Frontmatter field completeness."""
    if doc_type in ("INDEX", "TEMPLATE", "UNKNOWN"):
        return {"id": "A1", "status": "PASS", "message": f"Type '{doc_type}' exempt from frontmatter check (skip)"}

    required = set(REQUIRED_FRONTMATTER)
    if doc_type == "[RUNBOOK]":
        required = required | RUNBOOK_EXTRA_FIELDS

    missing = []
    empty = []
    for field in sorted(required):
        if field not in frontmatter:
            missing.append(field)
        elif not frontmatter[field].strip():
            empty.append(field)

    if missing or empty:
        parts = []
        if missing:
            parts.append(f"missing: {', '.join(missing)}")
        if empty:
            parts.append(f"empty: {', '.join(empty)}")
        total = len(required)
        found = total - len(missing) - len(empty)
        return {
            "id": "A1",
            "status": "FAIL",
            "message": f"{found}/{total} frontmatter fields OK; {'; '.join(parts)}",
        }
    return {
        "id": "A1",
        "status": "PASS",
        "message": f"{len(required)}/{len(required)} required frontmatter fields present",
    }


def check_a2(filepath: Path, doc_type: str) -> dict:
    """A2: Filename compliance."""
    name = filepath.name
    if DOCS_FILENAME_RE.match(name) or ROOT_FILENAME_RE.match(name) or TEMPLATE_FILENAME_RE.match(name):
        return {"id": "A2", "status": "PASS", "message": f"Filename '{name}' matches pattern"}

    return {"id": "A2", "status": "FAIL", "message": f"Filename '{name}' does not match any valid pattern"}


def check_a3(lines: list[str], doc_type: str) -> dict:
    """A3: Line count within type range."""
    if doc_type not in LINE_RANGES:
        return {"id": "A3", "status": "PASS", "message": f"Type '{doc_type}' has no line count constraint (skip)"}

    min_lines, max_lines = LINE_RANGES[doc_type]
    count = len(lines)
    if min_lines is not None and count < min_lines:
        return {
            "id": "A3",
            "status": "WARN",
            "message": f"{count} lines < minimum {min_lines} for {doc_type}",
        }
    if max_lines is not None and count > max_lines:
        return {
            "id": "A3",
            "status": "WARN",
            "message": f"{count} lines > maximum {max_lines} for {doc_type}",
        }
    return {
        "id": "A3",
        "status": "PASS",
        "message": f"{count} lines within {min_lines}-{max_lines} range for {doc_type}",
    }


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
        matches = GITHUB_ANCHOR_RE.findall(line)
        if matches:
            violations.append(f"L{i}")

    if violations:
        return {
            "id": "OB1",
            "status": "FAIL",
            "message": f"GitHub-style anchor links found at {', '.join(violations[:5])}",
        }
    return {"id": "OB1", "status": "PASS", "message": "No GitHub-style anchor links found"}


def check_ob2(lines: list[str], fm_end: int) -> dict:
    """OB2: Heading format — space after #, no trailing period."""
    violations = []
    in_code = False
    for i, line in enumerate(lines[fm_end:], start=fm_end + 1):
        stripped = line.strip()
        if CODE_FENCE_RE.match(stripped):
            in_code = not in_code
            continue
        if in_code:
            continue

        # Check for heading without space after #
        if re.match(r"^#{1,6}[^#\s]", stripped):
            violations.append(f"L{i}: no space after #")
            continue

        m = HEADING_RE.match(stripped)
        if m:
            text = m.group(2)
            # Check for period after number
            if re.match(r"^\d+\.\s", text):
                violations.append(f"L{i}: period after number")
            # Check for trailing punctuation (except for special chars)
            if text and text[-1] in ".?!。？！":
                violations.append(f"L{i}: trailing punctuation '{text[-1]}'")

    if violations:
        return {
            "id": "OB2",
            "status": "FAIL",
            "message": f"Heading format issues: {'; '.join(violations[:5])}",
        }
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
            violations.append(f"L{i}: uses '{m.group(2)}' instead of '-'")

    if violations:
        return {
            "id": "OB3",
            "status": "FAIL",
            "message": f"Non-standard list markers: {'; '.join(violations[:5])}",
        }
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
        return {
            "id": "OB4",
            "status": "WARN",
            "message": f"Code blocks without language tag at {', '.join(violations[:5])}",
        }
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
        return {
            "id": "OB5",
            "status": "FAIL",
            "message": f"Invalid callout types: {'; '.join(violations[:5])}",
        }
    return {"id": "OB5", "status": "PASS", "message": "All callout types valid"}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def validate_file(filepath: Path) -> list[dict]:
    """Run all automated checks on a single file."""
    text = filepath.read_text(encoding="utf-8")
    lines = text.splitlines()

    frontmatter, fm_end = parse_frontmatter(lines)
    doc_type = detect_doc_type(filepath, frontmatter)

    results = [
        check_a1(frontmatter, doc_type),
        check_a2(filepath, doc_type),
        check_a3(lines, doc_type),
        check_ob1(lines, fm_end),
        check_ob2(lines, fm_end),
        check_ob3(lines, fm_end),
        check_ob4(lines, fm_end),
        check_ob5(lines, fm_end),
    ]
    return results


def format_text(results: list[dict], filepath: Path) -> str:
    """Format results as human-readable text."""
    lines = [f"=== {filepath.name} ==="]
    for r in results:
        lines.append(f"[{r['id']}] {r['status']:4s} — {r['message']}")
    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_doc.py <file_or_directory> [--json]", file=sys.stderr)
        sys.exit(1)

    target = Path(sys.argv[1])
    use_json = "--json" in sys.argv

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
        all_results[str(f)] = validate_file(f)

    if use_json:
        print(json.dumps(all_results, indent=2, ensure_ascii=False))
    else:
        for fpath, results in all_results.items():
            print(format_text(results, Path(fpath)))
            print()


if __name__ == "__main__":
    main()
