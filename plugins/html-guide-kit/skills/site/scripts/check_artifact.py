#!/usr/bin/env python3
"""Check one local learning-artifact bundle. Standard library; never fetch URLs."""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
IDENTIFIER = re.compile(r"[a-z][a-z0-9-]*\Z")
HASH = re.compile(r"[0-9a-f]{64}\Z")
PASSIVE_SUFFIXES = {".md", ".txt", ".csv", ".json", ".pdf"}
RESERVED_OUTPUTS = {"index.html", "theme.css", "learning.js", "artifact-manifest.json"}


def local_path(root: Path, name: str, base: Path | None = None) -> Path:
    if not isinstance(name, str) or not name or "\\" in name or "\0" in name:
        raise ValueError("local path must be a nonempty POSIX relative path")
    if name.startswith("/") or re.match(r"^[A-Za-z]:", name):
        raise ValueError("absolute local path is forbidden")
    target = (base or root) / name
    if any(part == ".." for part in Path(name).parts):
        raise ValueError("parent traversal is forbidden")
    if target.is_symlink() or any(p.is_symlink() for p in target.parents if p != root.parent):
        raise ValueError("symbolic links are forbidden")
    target = target.resolve()
    if not target.is_relative_to(root):
        raise ValueError("local path escapes the artifact")
    return target


def material_path(root: Path, name: str, markdown=False) -> Path:
    """Apply the renderer's passive-input contract before classifying a file."""
    target = local_path(root, name)
    if re.search(r"[\\:#?\x00-\x1f]", name) or any(part in ("", ".", "..") for part in name.split("/")):
        raise ValueError("material must use a normal relative file path")
    if Path(name).suffix.lower() not in PASSIVE_SUFFIXES or (markdown and not name.endswith(".md")):
        raise ValueError("Markdown must be .md; sources must be passive .md/.txt/.csv/.json/.pdf files")
    lowered = name.casefold()
    if any(lowered == reserved or lowered.startswith(reserved + "/") for reserved in RESERVED_OUTPUTS):
        raise ValueError("material conflicts with a reserved generated output")
    return target


class Document(HTMLParser):
    def __init__(self, path: Path):
        super().__init__(convert_charrefs=True)
        self.nodes = []
        self.declarations = []
        self.text = []
        self.stack = []
        self.styles = []
        self.inline_scripts = []
        self.script_type = ""
        self.raw = path.read_text(encoding="utf-8-sig")
        self.feed(self.raw)
        self.close()

    def handle_decl(self, decl):
        self.declarations.append(decl.lower())

    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))
        if tag == "script":
            self.script_type = dict(attrs).get("type", "").lower()
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in self.stack:
            self.stack = self.stack[:len(self.stack) - 1 - self.stack[::-1].index(tag)]

    def handle_data(self, data):
        if "style" in self.stack:
            self.styles.append(data)
        elif "script" in self.stack:
            if self.script_type in ("", "module", "text/javascript", "application/javascript"):
                self.inline_scripts.append(data)
        elif not any(t in self.stack for t in ("head", "template")):
            self.text.append(data)


def check_bundle(root: Path) -> dict:
    checks = []

    def check(code, ok, detail=""):
        checks.append({"code": code, "status": "PASS" if ok else "FAIL", "detail": detail})

    def read_json(name):
        try:
            value = json.loads(local_path(root, name).read_text(encoding="utf-8-sig"))
            if not isinstance(value, dict):
                raise ValueError("expected a JSON object")
            check(name + ":json", True)
            return value
        except (OSError, ValueError) as error:
            check(name + ":json", False, str(error))
            return {}

    artifact = read_json("artifact.json")
    manifest = read_json("artifact-manifest.json")
    for name in ("index.html", "theme.css", "learning.js"):
        check("required:" + name, (root / name).is_file())
    check("artifact:schema-version", type(artifact.get("schemaVersion")) is int and artifact.get("schemaVersion") == 1)
    for key in ("title", "version", "audience", "task", "markdown"):
        check("artifact:" + key, isinstance(artifact.get(key), str) and bool(artifact[key].strip()))
    check("artifact:goals", isinstance(artifact.get("goals"), list) and bool(artifact["goals"]) and all(isinstance(g, str) and g.strip() for g in artifact["goals"]))

    for label, name in [("markdown", artifact.get("markdown"))]:
        try:
            target = material_path(root, name, markdown=True)
            check("artifact:" + label + "-file", target.is_file())
        except (TypeError, ValueError) as error:
            check("artifact:" + label + "-file", False, str(error))
    sources = artifact.get("sources")
    check("artifact:sources", isinstance(sources, list) and bool(sources))
    source_ids = []
    for i, source in enumerate(sources if isinstance(sources, list) else []):
        valid = isinstance(source, dict) and all(isinstance(source.get(k), str) and source[k].strip() for k in ("id", "title", "locator"))
        check(f"source:{i}:metadata", valid)
        if not valid:
            continue
        source_ids.append(source["id"])
        check(f"source:{i}:id", bool(IDENTIFIER.fullmatch(source["id"])))
        check(f"source:{i}:location", bool(source.get("path") or source.get("url")))
        if "path" in source:
            try:
                target = material_path(root, source["path"])
                check(f"source:{i}:file", target.is_file())
            except (TypeError, ValueError) as error:
                check(f"source:{i}:file", False, str(error))
        if "url" in source:
            try:
                parts = urlsplit(source["url"]) if isinstance(source["url"], str) else None
            except ValueError:
                parts = None
            check(f"source:{i}:url", bool(parts and parts.scheme in ("http", "https") and parts.netloc and not parts.username and not parts.password))
    check("source:unique-ids", len(source_ids) == len(set(source_ids)))

    terms = artifact.get("terms")
    check("artifact:terms", isinstance(terms, list))
    english_terms = []
    for i, term in enumerate(terms if isinstance(terms, list) else []):
        valid = isinstance(term, dict) and all(isinstance(term.get(k), str) and term[k].strip() for k in ("english", "chinese"))
        check(f"term:{i}:mapping", valid)
        if valid:
            english_terms.append(term["english"].casefold())
            forbidden = term.get("forbidden", [])
            check(f"term:{i}:forbidden-list", isinstance(forbidden, list) and all(isinstance(t, str) and t.strip() and t not in (term["english"], term["chinese"]) for t in forbidden))
    check("term:unique-english", len(english_terms) == len(set(english_terms)))
    activities = artifact.get("activities")
    check("artifact:activities", isinstance(activities, list))
    activity_ids = []
    for i, activity in enumerate(activities if isinstance(activities, list) else []):
        valid = isinstance(activity, dict) and all(isinstance(activity.get(k), str) and activity[k].strip() for k in ("id", "title", "prompt", "reference", "sourceId"))
        check(f"activity:{i}:metadata", valid)
        if not valid:
            continue
        activity_ids.append(activity["id"])
        options = activity.get("options")
        check(f"activity:{i}:type-id-source", activity.get("type") == "choice" and bool(IDENTIFIER.fullmatch(activity["id"])) and activity["sourceId"] in source_ids)
        check(f"activity:{i}:options", isinstance(options, list) and len(options) >= 2 and all(isinstance(o, dict) and all(isinstance(o.get(k), str) and o[k].strip() for k in ("label", "feedback")) for o in options))
        check(f"activity:{i}:answer", type(activity.get("correctIndex")) is int and isinstance(options, list) and 0 <= activity["correctIndex"] < len(options))
    check("activity:unique-ids", len(activity_ids) == len(set(activity_ids)))

    check("manifest:schema-version", type(manifest.get("schemaVersion")) is int and manifest.get("schemaVersion") == 1)
    check("manifest:version", bool(artifact.get("version")) and manifest.get("version") == artifact.get("version"))
    check("manifest:artifact-path", manifest.get("artifactPath") == "artifact.json")
    try:
        artifact_hash = sha256(local_path(root, "artifact.json").read_bytes()).hexdigest()
    except (OSError, ValueError):
        artifact_hash = None
    check("manifest:source-hash", bool(artifact_hash) and manifest.get("sourceSha256") == artifact_hash)
    files = manifest.get("files")
    check("manifest:files", isinstance(files, list) and bool(files))
    listed = []
    for i, item in enumerate(files if isinstance(files, list) else []):
        try:
            if not isinstance(item, dict):
                raise ValueError("file entry must be an object")
            target = local_path(root, item.get("path"))
            name = target.relative_to(root).as_posix()
            listed.append(name)
            check(f"manifest:{i}:metadata", name != "artifact-manifest.json" and isinstance(item.get("sha256"), str) and bool(HASH.fullmatch(item["sha256"])) and type(item.get("bytes")) is int and item["bytes"] >= 0)
            data = target.read_bytes()
            check(f"manifest:{i}:bytes", sha256(data).hexdigest() == item.get("sha256") and len(data) == item.get("bytes"), name)
        except (OSError, TypeError, ValueError) as error:
            check(f"manifest:{i}:bytes", False, str(error))
    actual = set()
    for target in root.rglob("*"):
        relative = target.relative_to(root).as_posix()
        if target.is_symlink():
            check("bundle:no-symbolic-link", False, relative)
        elif target.is_file() and relative != "artifact-manifest.json":
            actual.add(relative)
    check("manifest:complete-unique-files", len(listed) == len(set(listed)) and set(listed) == actual, {"unlisted": sorted(actual - set(listed)), "missing": sorted(set(listed) - actual)})

    docs = {}
    # Output inspection never depends on the artifact's self-declared materials.
    # Even an invalid source/Markdown classification cannot hide the entry page.
    for name in sorted(actual | {"index.html"}):
        if Path(name).suffix.lower() in (".html", ".htm"):
            try:
                docs[name] = Document(local_path(root, name))
            except (OSError, UnicodeError, ValueError) as error:
                check(name + ":parse", False, str(error))

    def reference(value, owner, code, runtime=False):
        try:
            parts = urlsplit(value)
            if parts.scheme or parts.netloc:
                allowed = not runtime and parts.scheme in ("http", "https", "mailto") and (parts.scheme == "mailto" or bool(parts.netloc))
                check(code, allowed, value)
                return
            target = local_path(root, unquote(parts.path), (root / owner).parent) if parts.path else root / owner
            check(code + ":file", target.is_file(), value)
            if parts.fragment:
                target_name = target.relative_to(root).as_posix()
                target_doc = docs.get(target_name)
                ids = Counter(attrs.get("id") for _, attrs in target_doc.nodes if "id" in attrs) if target_doc else {}
                check(code + ":anchor", ids.get(unquote(parts.fragment)) == 1, value)
        except (TypeError, ValueError) as error:
            check(code, False, str(error))

    def css_references(text, owner, label):
        # Both url(...) and quoted @import are checked, including escaped tokens.
        decoded = re.sub(r"\\([0-9a-fA-F]{1,6})\s?", lambda m: chr(int(m[1], 16)), text)
        decoded = re.sub(r"\\([^\r\n])", r"\1", decoded)
        urls = re.findall(r"url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)", decoded, re.I)
        urls += re.findall(r"@import\s+['\"]([^'\"]+)['\"]", decoded, re.I)
        for i, value in enumerate(urls):
            reference(value.strip(), owner, f"{label}:{i}", runtime=True)

    def js_references(script, owner, label):
        imports = re.findall(r"(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*|\bimportScripts\s*\(\s*|\bnew\s+(?:Shared)?Worker\s*\(\s*)['\"]([^'\"]+)['\"]", script)
        for i, value in enumerate(imports):
            reference(value, owner, f"{label}:{i}", runtime=True)

    for name, doc in docs.items():
        tags = Counter(tag for tag, _ in doc.nodes)
        check(name + ":structure", doc.declarations == ["doctype html"] and all(tags[t] == 1 for t in ("html", "head", "body", "title", "h1")))
        html_attrs = next((attrs for tag, attrs in doc.nodes if tag == "html"), {})
        check(name + ":language", bool(html_attrs.get("lang")))
        check(name + ":viewport", any(tag == "meta" and attrs.get("name") == "viewport" and "width=device-width" in attrs.get("content", "") for tag, attrs in doc.nodes))
        check(name + ":charset", any(tag == "meta" and attrs.get("charset", "").lower() == "utf-8" for tag, attrs in doc.nodes))
        ids = Counter(attrs["id"] for _, attrs in doc.nodes if "id" in attrs)
        check(name + ":unique-ids", all(key and count == 1 for key, count in ids.items()))
        check(name + ":static-text", bool("".join(doc.text).strip()))
        check(name + ":no-base", tags["base"] == 0)
        for i, (tag, attrs) in enumerate(doc.nodes):
            for attr in ("href", "src", "poster", "action", "data"):
                if attr in attrs:
                    reference(attrs[attr], name, f"{name}:{tag}:{i}:{attr}", runtime=tag != "a" or attr != "href")
            if "srcset" in attrs:
                for j, candidate in enumerate(attrs["srcset"].split(",")):
                    reference(candidate.strip().split()[0] if candidate.strip() else "", name, f"{name}:srcset:{i}:{j}", runtime=True)
            if "style" in attrs:
                css_references(attrs["style"], name, f"{name}:style:{i}")
            if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh":
                check(name + ":no-refresh", False)
            if tag == "input" and attrs.get("type") == "radio":
                check(f"{name}:radio:{i}:no-default-answer", "checked" not in attrs)
        css_references("\n".join(doc.styles), name, name + ":inline-css")
        for i, script in enumerate(doc.inline_scripts):
            js_references(script, name, f"{name}:inline-script:{i}")
        text = " ".join(doc.text)
        for i, term in enumerate(terms if isinstance(terms, list) else []):
            if isinstance(term, dict) and isinstance(term.get("forbidden", []), list):
                for forbidden in term.get("forbidden", []):
                    if isinstance(forbidden, str) and forbidden:
                        pattern = (r"(?<![A-Za-z0-9_])" + re.escape(forbidden) + r"(?![A-Za-z0-9_])") if re.fullmatch(r"[A-Za-z0-9_ -]+", forbidden) else re.escape(forbidden)
                        check(f"{name}:term:{i}:known-forbidden", re.search(pattern, text, re.I) is None, forbidden)
    for name in sorted(actual):
        if name.endswith(".css"):
            try:
                css_references(local_path(root, name).read_text(encoding="utf-8"), name, name + ":resource")
            except (OSError, UnicodeError) as error:
                check(name + ":read", False, str(error))
        if name.endswith(".js"):
            try:
                script = local_path(root, name).read_text(encoding="utf-8")
                js_references(script, name, name + ":import")
            except (OSError, UnicodeError) as error:
                check(name + ":read", False, str(error))

    failed = sum(item["status"] == "FAIL" for item in checks)
    return {"schemaVersion": 1, "checker": "artifact-static", "status": "FAIL" if failed else "PASS", "executedAt": datetime.now(timezone.utc).isoformat(), "pythonVersion": sys.version.split()[0], "inputHashes": {name: sha256((root / name).read_bytes()).hexdigest() for name in ("artifact.json", "artifact-manifest.json", "index.html") if (root / name).is_file() and not (root / name).is_symlink()}, "summary": {"checks": len(checks), "failed": failed, "pages": len(docs), "files": len(actual)}, "checks": checks, "limitations": ["Known structural, file/hash, local link/anchor, explicit resource URL and forbidden-term checks only; not a full HTML/CSS/JavaScript security or conformance audit.", "Manifest consistency does not independently authenticate original materials. Review source fidelity, terminology meaning, conditions, exceptions and answer criteria against the actual originals.", "No browser interaction, visual/accessibility audit, external URL/deployment/access-scope check or learning-effect measurement. Understanding effects remain NOT_MEASURED."]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", type=Path, help="New JSON report outside the artifact; never overwritten")
    args = parser.parse_args()
    root = args.input.resolve()
    try:
        if not root.is_dir() or args.input.is_symlink():
            raise ValueError("input must be an existing ordinary artifact directory")
        if args.output and args.output.resolve().is_relative_to(root):
            raise ValueError("report must be outside the artifact")
        if args.output and args.output.exists():
            raise ValueError("report already exists; choose a new path")
        result = check_bundle(root)
    except (OSError, ValueError) as error:
        result = {"schemaVersion": 1, "checker": "artifact-static", "status": "NOT_RUN", "reason": str(error)}
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output and result["status"] != "NOT_RUN":
        try:
            with args.output.open("x", encoding="utf-8") as handle:
                handle.write(rendered)
        except OSError as error:
            print(json.dumps({"status": "NOT_RUN", "reason": str(error)}, ensure_ascii=False))
            return 2
    print(rendered, end="")
    return {"PASS": 0, "FAIL": 1, "NOT_RUN": 2}[result["status"]]


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
