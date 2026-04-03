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

## v5.0 Link Formatting Scenarios

| Scenario | Format | Example |
|----------|--------|---------|
| Text cross-reference | Wikilink | `[[STANDARD_SQL_Style\|SQL Style]]` |
| Cross-file heading | Wikilink with heading | `[[STANDARD_Documentation_Management_Framework_v5.0#6.4 CLAUDE.md 同步策略\|CLAUDE Sync]]` |
| Intra-doc TOC | Header Wikilink | `[[#4 Naming and Frontmatter]]` |
| GitHub-facing index | Relative Markdown link | `[SQL Style](./[STANDARD]_SQL_Style.md)` |

### A4 Link Validation Scope

- External URLs (`http://`, `https://`, `mailto:`) are **ignored** by A4
- Links inside fenced code blocks are **ignored** by A4
- A4 checks link *target existence*; OB1 checks link *format* — they are complementary

## Additional Rules

- `---` separator must have blank line above (prevents turning text into h1)
- `tags:` and `aliases:` in frontmatter must use list format (Obsidian 1.9+)
- Frontmatter must be at very top of file, wrapped in `---`

Full reference: `docs/rule/[STANDARD]_Obsidian_Markdown.md`
