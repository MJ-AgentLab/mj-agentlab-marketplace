# Artifact: mind_map

This file is loaded as the `===== MEDIUM CONSTRAINTS =====` section of
`focus_prompt` when `artifact_type=mind_map`. Format only.

## Format

- **Depth**: ≤ 3 levels (center → category → leaf). Anything
  deeper turns into a tree no one can read.
- **Node count**: ≤ 50 total nodes. Above that the map becomes
  noise.
- **Node text length**: ≤ 40 characters per node (or ~12 English
  words). Long nodes break the visual.
- **Layout**: Radial. Center is the topic; categories radiate out;
  leaves attach to categories.

## Center node

The center is the `<topic>` name itself. Not a question, not a
sentence — just the noun phrase.

## Category nodes (depth 1)

- **Foundation view** → 5 categories that match the TL;DR 5-pack
  structure. Each leaf below a category should be one concrete
  example or analogy that supports that takeaway.
- **Structural view** → 5 categories that match the dimensions /
  layers / phases of the topic's structure. Leaves under each are
  components within that dimension. (See `interaction-overrides.md`
  — structural+mind_map uses an enforced 3-tier radial layout.)
- **Challenge view** → 5 categories of edge cases / anti-patterns
  / boundary conditions. Leaves under each are concrete examples
  that exhibit the pattern.

## Cross-links

Avoid cross-links between leaves of different categories — they
clutter the radial layout and don't add learning value at a
mind-map's level of granularity. If two concepts genuinely
cross-cut, reflect that by placing the concept at depth 1 (its
own category) rather than by drawing crossing edges.

## What NOT to do

- No more than 7 leaves under any single category — split if
  needed.
- No node that's a full sentence.
- No mind_map that's actually a tree of definitions (definition →
  child definition → child definition…); that's structural-tier
  noise compressed into a bad mind_map.
- No mention of the source documents by name.
