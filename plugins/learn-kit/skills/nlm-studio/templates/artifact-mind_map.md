# Artifact: mind_map (view-agnostic / shared per topic)

This file is loaded as the `===== MEDIUM CONSTRAINTS =====` section of
`focus_prompt` when `artifact_type=mind_map`. **Important**: unlike
the other 4 artifact types, mind_map is **view-agnostic** in this
skill — one mind_map per topic, not one per view.

## Why view-agnostic

Dogfood validation (v1.0.0 release) showed that NLM's `mind_map`
artifact type defaults to producing structural-hierarchy output
regardless of the focus_prompt's view-tier directives. When asked
for a foundation-tier mind_map with everyday metaphors and 5-panel
TL;DR style, NLM still produced a hierarchical category tree.
Generating 3 view-cycled mind_maps yielded near-duplicate JSON
structures with only minor depth differences — a poor cost/value
trade given each costs NLM Studio quota.

Therefore: **the mind_map represents the structural skeleton of the
topic across all three tiers** (foundation + structural + challenge
content combined), not any specific view's pedagogical stance.

## Format

- **Depth**: ≤ 3 levels (center → category → leaf). Anything
  deeper turns into a tree no one can read.
- **Node count**: ≤ 50 total nodes. Above that the map becomes
  noise.
- **Node text length**: ≤ 40 characters per node (or ~12 English
  words). Long nodes break the visual.
- **Layout**: Radial. Center is the topic name; categories radiate
  out; leaves attach to categories.

## Center node

The center is the topic name itself. Not a question, not a
sentence — just the noun phrase, possibly with a version suffix
if the source documents specify one (e.g., "documentation-framework
v2.2").

## Category nodes (depth 1)

Aim for **5–8 categories** that capture the topic's natural
dimensions — its layers, axes, phases, or functional areas. Don't
force exactly 5 if the topic has a natural 6-7-8 partition. Don't
inflate to 5 if a topic genuinely has 3–4 dimensions.

For a typical documentation-framework-style topic, expected
categories include things like: layer model, track model, type
taxonomy, lifecycle states, PR gates, naming/path rules, evolution
mechanics, governance boundary. Adapt to the actual topic.

## Leaf nodes (depth 2)

Each leaf is one concrete component, rule, or sub-concept within
its category. Leaves should be specific and lookup-able in the
source markdown.

Per-category leaf count: typically 3–7. Keep all categories roughly
balanced (don't have one category with 12 leaves and another with
1). If a category needs many sub-items, consider whether it should
be split into 2 categories instead.

## Cross-links

Avoid cross-links between leaves of different categories — they
clutter the radial layout. If two concepts genuinely cross-cut,
reflect that by placing the shared concept at depth 1 (its own
category) rather than by drawing crossing edges.

## What NOT to do

- No node that's a full sentence.
- No mind_map that's actually a tree of definitions (definition →
  child definition → child definition…); that's structural-tier
  noise compressed into a bad mind_map.
- No mention of the source documents by name.
- No view-tier styling (e.g., "everyday metaphors", "counter-example
  examples") — those got dropped in v1.0.0 because they don't survive
  NLM's mind_map generation pipeline regardless of how strongly you
  prompt them. The 4 other artifact types carry view-tier stance;
  mind_map handles the cross-tier structural overview.
