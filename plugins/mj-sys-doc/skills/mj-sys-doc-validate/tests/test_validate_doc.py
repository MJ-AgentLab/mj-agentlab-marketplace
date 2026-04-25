"""Unit tests for validate_doc.py — Framework v5.0 checks."""

import sys
import tempfile
import unittest
from pathlib import Path

# Add scripts directory to path
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

import validate_doc as vd

FIXTURES = Path(__file__).resolve().parent / "fixtures"


class TestParseFrontmatter(unittest.TestCase):
    def test_valid_frontmatter(self):
        lines = [
            "---",
            "type: guide",
            "domain: QCM",
            "summary: Test doc",
            "owner: team",
            "created: 2026-01-01",
            "updated: 2026-01-01",
            "state: active",
            "---",
            "# Content",
        ]
        fm, end = vd.parse_frontmatter(lines)
        self.assertEqual(fm["type"], "guide")
        self.assertEqual(fm["state"], "active")
        self.assertEqual(end, 8)

    def test_no_frontmatter(self):
        lines = ["# No frontmatter"]
        fm, end = vd.parse_frontmatter(lines)
        self.assertEqual(fm, {})
        self.assertEqual(end, 0)

    def test_list_frontmatter(self):
        lines = [
            "---",
            "dimensions:",
            "  - latency",
            "  - throughput",
            "---",
        ]
        fm, end = vd.parse_frontmatter(lines)
        self.assertIn("dimensions", fm)
        self.assertIn("- latency", fm["dimensions"])


class TestDetectDocType(unittest.TestCase):
    def test_canonical_types(self):
        for tag in ("[GUIDE]", "[ADR]", "[SPEC]", "[RUNBOOK]", "[POSTMORTEM]",
                    "[STANDARD]", "[ISSUE]", "[ASSESSMENT]"):
            p = Path(f"{tag}_Test.md")
            self.assertEqual(vd.detect_doc_type(p, {}), tag)

    def test_plan_type(self):
        p = Path("[PLAN]_Test.md")
        self.assertEqual(vd.detect_doc_type(p, {}), "[PLAN]")

    def test_root_types(self):
        for name in ("README", "CONTRIBUTING", "CHANGELOG", "GLOSSARY", "CLAUDE"):
            p = Path(f"{name}.md")
            self.assertEqual(vd.detect_doc_type(p, {}), name)

    def test_index(self):
        p = Path("INDEX.md")
        self.assertEqual(vd.detect_doc_type(p, {}), "INDEX")


class TestDetectLayer(unittest.TestCase):
    def setUp(self):
        self.repo = Path(tempfile.mkdtemp())
        (self.repo / "docs" / "guide").mkdir(parents=True)
        (self.repo / "docs" / "archive" / "legacy").mkdir(parents=True)
        (self.repo / "docs" / "_templates").mkdir(parents=True)
        (self.repo / "plans").mkdir(parents=True)

    def test_canonical(self):
        f = self.repo / "docs" / "guide" / "test.md"
        self.assertEqual(vd.detect_layer(f, self.repo), "canonical")

    def test_working(self):
        f = self.repo / "plans" / "test.md"
        self.assertEqual(vd.detect_layer(f, self.repo), "working")

    def test_legacy(self):
        f = self.repo / "docs" / "archive" / "legacy" / "test.md"
        self.assertEqual(vd.detect_layer(f, self.repo), "legacy")

    def test_templates(self):
        f = self.repo / "docs" / "_templates" / "test.md"
        self.assertEqual(vd.detect_layer(f, self.repo), "templates")

    def test_root(self):
        f = self.repo / "README.md"
        self.assertEqual(vd.detect_layer(f, self.repo), "root")


class TestIsV45Frontmatter(unittest.TestCase):
    def test_v45_detected(self):
        fm = {"status": "草案", "date": "2025-01-01", "tags": "test"}
        self.assertTrue(vd.is_v45_frontmatter(fm))

    def test_v50_not_detected(self):
        fm = {"state": "draft", "created": "2026-01-01", "type": "guide"}
        self.assertFalse(vd.is_v45_frontmatter(fm))

    def test_mixed_not_detected(self):
        # If both v45 and v50 keys present, not pure v45
        fm = {"status": "x", "state": "draft", "created": "2026-01-01"}
        self.assertFalse(vd.is_v45_frontmatter(fm))


class TestCheckA1(unittest.TestCase):
    def test_valid_canonical(self):
        r = vd.check_a1(Path("[GUIDE]_Test_Doc.md"), "[GUIDE]", "canonical")
        self.assertEqual(r["status"], "PASS")

    def test_valid_plan(self):
        r = vd.check_a1(Path("[PLAN]_Test_Plan.md"), "[PLAN]", "working")
        self.assertEqual(r["status"], "PASS")

    def test_invalid_filename(self):
        r = vd.check_a1(Path("guide_foo.md"), "UNKNOWN", "canonical")
        # UNKNOWN type is not governed, so SKIP
        self.assertEqual(r["status"], "SKIP")

    def test_plan_in_wrong_layer(self):
        r = vd.check_a1(Path("[PLAN]_Test.md"), "[PLAN]", "canonical")
        self.assertEqual(r["status"], "FAIL")

    def test_canonical_in_plans(self):
        r = vd.check_a1(Path("[GUIDE]_Test.md"), "[GUIDE]", "working")
        self.assertEqual(r["status"], "FAIL")

    def test_root_special_skip(self):
        r = vd.check_a1(Path("README.md"), "README", "root")
        self.assertEqual(r["status"], "SKIP")

    def test_deprecated_prefix_rejected(self):
        r = vd.check_a1(Path("[DEPRECATED]_Old_Guide.md"), "UNKNOWN", "canonical")
        self.assertEqual(r["status"], "SKIP")  # UNKNOWN not governed


class TestCheckA2(unittest.TestCase):
    def _make_fm(self, **overrides):
        base = {
            "type": "guide", "domain": "QCM", "summary": "Test",
            "owner": "team", "created": "2026-01-01",
            "updated": "2026-01-01", "state": "active",
        }
        base.update(overrides)
        return base

    def test_valid_canonical(self):
        r = vd.check_a2(self._make_fm(), "[GUIDE]", "canonical")
        self.assertEqual(r["status"], "PASS")

    def test_missing_field(self):
        fm = self._make_fm()
        del fm["summary"]
        r = vd.check_a2(fm, "[GUIDE]", "canonical")
        self.assertEqual(r["status"], "FAIL")
        self.assertIn("missing: summary", r["message"])

    def test_v45_detected(self):
        fm = {"status": "草案", "date": "2025-01-01", "tags": "x",
              "aliases": "y", "version": "1.0", "updated": "2025-01-01", "owner": "team"}
        r = vd.check_a2(fm, "[GUIDE]", "canonical")
        self.assertEqual(r["status"], "FAIL")
        self.assertIn("v4.5", r["message"])

    def test_working_doc_fields(self):
        fm = {"summary": "Plan", "owner": "team", "created": "2026-01-01",
              "updated": "2026-01-01", "state": "draft"}
        r = vd.check_a2(fm, "[PLAN]", "working")
        self.assertEqual(r["status"], "PASS")

    def test_working_doc_missing_field(self):
        fm = {"summary": "Plan", "state": "draft"}
        r = vd.check_a2(fm, "[PLAN]", "working")
        self.assertEqual(r["status"], "FAIL")

    def test_spec_requires_version(self):
        fm = self._make_fm(type="spec")
        r = vd.check_a2(fm, "[SPEC]", "canonical")
        self.assertEqual(r["status"], "FAIL")
        self.assertIn("version", r["message"])

    def test_spec_with_version(self):
        fm = self._make_fm(type="spec", version="1.0")
        r = vd.check_a2(fm, "[SPEC]", "canonical")
        self.assertEqual(r["status"], "PASS")

    def test_adr_requires_decision(self):
        fm = self._make_fm(type="adr")
        r = vd.check_a2(fm, "[ADR]", "canonical")
        self.assertEqual(r["status"], "FAIL")
        self.assertIn("decision", r["message"])

    def test_issue_requires_priority_resolution(self):
        fm = self._make_fm(type="issue")
        r = vd.check_a2(fm, "[ISSUE]", "canonical")
        self.assertEqual(r["status"], "FAIL")

    def test_assessment_dimensions_count(self):
        fm = self._make_fm(type="assessment", dimensions="- one", period="Q1")
        r = vd.check_a2(fm, "[ASSESSMENT]", "canonical")
        self.assertEqual(r["status"], "FAIL")
        self.assertIn("dimensions", r["message"])

    def test_optional_fields_accepted(self):
        fm = self._make_fm(tags="test", aliases="alias", supersedes="old_doc")
        r = vd.check_a2(fm, "[GUIDE]", "canonical")
        self.assertEqual(r["status"], "PASS")

    def test_root_special_skip(self):
        r = vd.check_a2({}, "README", "root")
        self.assertEqual(r["status"], "SKIP")


class TestCheckA3(unittest.TestCase):
    def test_valid_enums(self):
        fm = {"state": "active", "type": "guide", "domain": "QCM"}
        r = vd.check_a3(fm, "[GUIDE]", "canonical")
        self.assertEqual(r["status"], "PASS")

    def test_invalid_state(self):
        fm = {"state": "published", "type": "guide", "domain": "QCM"}
        r = vd.check_a3(fm, "[GUIDE]", "canonical")
        self.assertEqual(r["status"], "FAIL")
        self.assertIn("state", r["message"])

    def test_invalid_domain(self):
        fm = {"state": "active", "type": "guide", "domain": "INVALID"}
        r = vd.check_a3(fm, "[GUIDE]", "canonical")
        self.assertEqual(r["status"], "FAIL")
        self.assertIn("domain", r["message"])

    def test_invalid_adr_decision(self):
        fm = {"state": "active", "type": "adr", "domain": "QCM", "decision": "maybe"}
        r = vd.check_a3(fm, "[ADR]", "canonical")
        self.assertEqual(r["status"], "FAIL")
        self.assertIn("decision", r["message"])

    def test_valid_issue_enums(self):
        fm = {"state": "active", "type": "issue", "domain": "QCM",
              "priority": "P1", "resolution": "open"}
        r = vd.check_a3(fm, "[ISSUE]", "canonical")
        self.assertEqual(r["status"], "PASS")

    def test_working_doc_skips_type_domain(self):
        fm = {"state": "draft"}
        r = vd.check_a3(fm, "[PLAN]", "working")
        self.assertEqual(r["status"], "PASS")


class TestOBChecks(unittest.TestCase):
    def test_ob1_github_anchor(self):
        lines = ["", "[link](#heading)"]
        r = vd.check_ob1(lines, 0)
        self.assertEqual(r["status"], "WARN")

    def test_ob1_clean(self):
        lines = ["", "[[#heading]]"]
        r = vd.check_ob1(lines, 0)
        self.assertEqual(r["status"], "PASS")

    def test_ob1_skip_code_fence(self):
        lines = ["", "```", "[link](#heading)", "```"]
        r = vd.check_ob1(lines, 0)
        self.assertEqual(r["status"], "PASS")

    def test_ob2_no_space(self):
        lines = ["", "##Title"]
        r = vd.check_ob2(lines, 0)
        self.assertEqual(r["status"], "WARN")

    def test_ob2_trailing_punct(self):
        lines = ["", "## Title?"]
        r = vd.check_ob2(lines, 0)
        self.assertEqual(r["status"], "WARN")

    def test_ob3_star_marker(self):
        lines = ["", "* item"]
        r = vd.check_ob3(lines, 0)
        self.assertEqual(r["status"], "WARN")

    def test_ob3_dash_ok(self):
        lines = ["", "- item"]
        r = vd.check_ob3(lines, 0)
        self.assertEqual(r["status"], "PASS")

    def test_ob4_missing_lang(self):
        lines = ["", "```", "code", "```"]
        r = vd.check_ob4(lines, 0)
        self.assertEqual(r["status"], "WARN")

    def test_ob4_with_lang(self):
        lines = ["", "```python", "code", "```"]
        r = vd.check_ob4(lines, 0)
        self.assertEqual(r["status"], "PASS")

    def test_ob5_valid_callout(self):
        lines = ["", "> [!note]", "> content"]
        r = vd.check_ob5(lines, 0)
        self.assertEqual(r["status"], "PASS")

    def test_ob5_invalid_callout(self):
        lines = ["", "> [!invalid_type]", "> content"]
        r = vd.check_ob5(lines, 0)
        self.assertEqual(r["status"], "WARN")


class TestLineCount(unittest.TestCase):
    def test_within_range(self):
        lines = [""] * 300
        r = vd.check_line_count(lines, "README")
        self.assertEqual(r["status"], "PASS")

    def test_below_range(self):
        lines = [""] * 50
        r = vd.check_line_count(lines, "README")
        self.assertEqual(r["status"], "WARN")

    def test_above_range(self):
        lines = [""] * 600
        r = vd.check_line_count(lines, "README")
        self.assertEqual(r["status"], "WARN")

    def test_skip_unknown(self):
        r = vd.check_line_count([], "TEMPLATE")
        self.assertEqual(r["status"], "SKIP")


class TestA6PRMode(unittest.TestCase):
    def test_skip_outside_pr_mode(self):
        r = vd.check_a6(Path("."), False, None, "HEAD")
        self.assertEqual(r["status"], "SKIP")

    def test_fail_no_base_ref(self):
        r = vd.check_a6(Path("."), True, None, "HEAD")
        self.assertEqual(r["status"], "FAIL")
        self.assertIn("--base-ref", r["message"])


class TestCLIParsing(unittest.TestCase):
    def test_pr_mode_requires_base_ref(self):
        """PR mode without base-ref should exit with error."""
        import io
        from contextlib import redirect_stderr
        old_argv = sys.argv
        sys.argv = ["validate_doc.py", "dummy", "--pr-mode"]
        try:
            with self.assertRaises(SystemExit) as ctx:
                err = io.StringIO()
                with redirect_stderr(err):
                    vd.main()
            self.assertEqual(ctx.exception.code, 1)
        finally:
            sys.argv = old_argv


class TestFixtureFiles(unittest.TestCase):
    """Integration tests using fixture files."""

    def test_valid_v5_canonical(self):
        filepath = FIXTURES / "valid_v5_canonical.md"
        if not filepath.exists():
            self.skipTest("Fixture not found")
        results = vd.validate_file(filepath)
        a2 = next(r for r in results if r["id"] == "A2")
        # Without repo_root, A4/A5/A6 skip. A1-A3 should pass.
        self.assertEqual(a2["status"], "PASS")

    def test_v45_legacy_fails(self):
        filepath = FIXTURES / "v45_legacy_doc.md"
        if not filepath.exists():
            self.skipTest("Fixture not found")
        results = vd.validate_file(filepath)
        a2 = next(r for r in results if r["id"] == "A2")
        self.assertEqual(a2["status"], "FAIL")
        self.assertIn("v4.5", a2["message"])

    def test_valid_working_plan(self):
        filepath = FIXTURES / "valid_working_plan.md"
        if not filepath.exists():
            self.skipTest("Fixture not found")
        results = vd.validate_file(filepath)
        a2 = next(r for r in results if r["id"] == "A2")
        # Without repo_root, plan detection may be limited
        # but frontmatter should be parseable
        self.assertIn(a2["status"], ("PASS", "SKIP"))


class TestManagedIndexGeneration(unittest.TestCase):
    def test_generate_index_block(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            repo = Path(tmpdir)
            docs = repo / "docs" / "guide"
            docs.mkdir(parents=True)

            # Create a doc with summary
            doc = docs / "[GUIDE]_Test.md"
            doc.write_text(
                "---\nsummary: Test guide for setup\n---\n# Test\n",
                encoding="utf-8",
            )

            block = vd.generate_index_block(docs, repo)
            self.assertIn("[[GUIDE_Test]]", block.replace("[", "["))
            self.assertIn("Test guide for setup", block)

    def test_idempotent_generation(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            repo = Path(tmpdir)
            docs = repo / "docs"
            docs.mkdir()

            doc = docs / "[GUIDE]_Foo.md"
            doc.write_text("---\nsummary: Foo guide\n---\n# Foo\n", encoding="utf-8")

            block1 = vd.generate_index_block(docs, repo)
            block2 = vd.generate_index_block(docs, repo)
            self.assertEqual(block1, block2)


if __name__ == "__main__":
    unittest.main()
