# Obsidian Markdown Rules Reference

## OB1: Wikilink Syntax

**Use**: `[[name]]`, `[[name|display]]`, `[[name#heading]]`, `[[#heading]]`
**Never**: `[text](#anchor)`, `[text](file.md#anchor)` — these are GitHub-style

## OB2: Heading Format

- Space after `#`: `## 1 Title` ✅ / `##1 Title` ❌
- No period after number: `## 1 Title` ✅ / `## 1. Title` ❌
- No trailing punctuation: `## What is X` ✅ / `## What is X?` ❌

## OB3: List Consistency

- Unordered: `-` only (not `*` or `+`)
- Task lists: `- [ ]` / `- [x]`
- Ordered: `1.`, `2.`, etc.

## OB4: Code Block Language Tags

Every fenced code block must have a language identifier:
````
```python   ✅
```bash     ✅
```         ❌ (missing language)
````

Common tags: `bash`, `powershell`, `python`, `javascript`, `sql`, `json`, `yaml`, `markdown`, `mermaid`

## OB5: Valid Callout Types (13)

`note`, `info`, `tip` (hint/important), `warning` (caution/attention), `danger` (error), `example`, `quote` (cite), `abstract` (summary/tldr), `success` (check/done), `question` (help/faq), `failure` (fail/missing), `bug`, `todo`

Aliases in parentheses are also valid.

## OB6: Table Pipe Escaping

Wikilinks inside table cells must escape `|` as `\|`:
```markdown
| Column | Link |
|--------|------|
| data   | [[doc\|display text]] |
```

## Additional Rules

- `---` separator must have blank line above (prevents turning text into h1)
- `tags:` and `aliases:` in frontmatter must use list format (Obsidian 1.9+)
- Frontmatter must be at very top of file, wrapped in `---`

Full reference: `docs/rule/[STANDARD]_Obsidian_Markdown.md`
