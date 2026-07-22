# Interaction Overrides · view × artifact joint tuning

Most (view, artifact) cells work fine with `view-prefix + artifact-suffix` alone. This file lists the minority of cells where the joint effect needs an explicit tweak — because the medium and the pedagogical stance interact non-obviously.

**Scope**: This file applies only to the 3 view-cycled artifact types (audio / video / slide_deck) × 3 views = 9 possible cells. Mind_map is excluded entirely: connector v0.8.7 ignores `focus_prompt`/`language` for the mind_map type (see SKILL.md Step 5B), so it takes no prompt composition at all — it is generated once per topic (view-agnostic) from the selected source IDs plus a display title, with no view-prefix, no override, and no medium-constraints template. Infographic was removed in marketplace v6.0.0 (dogfood showed low user acceptance + visual density inferior for learning curve).

The `three-views` skill reads this file during Step 5B focus_prompt composition. If a row matches the current `(view, artifact)` pair, its `inject:` value is appended as the `===== INTERACTION OVERRIDE =====` section. If no row matches, that section is omitted entirely.

## Schema

```yaml
overrides:
  - view: <foundation | structural | challenge>
    artifact: <audio | video | slide_deck>
    inject: |
      <free-form text, will be injected verbatim>
```

## Overrides

```yaml
overrides:
  - view: challenge
    artifact: audio
    inject: |
      End each major segment with an explicit probing question
      directed at the listener — phrased as "what would you do
      if…", "how would you handle…", or "is X really always
      true?". Do NOT close segments with summary statements; the
      challenge tier's signature is productive doubt, and a
      summarized close defeats that. The 3+ probing questions
      across the artifact should be answerable only by going back
      to the source material, not by listening more carefully.

  - view: challenge
    artifact: slide_deck
    inject: |
      Reserve at least 70% of content slides for counter-examples
      and edge cases. Each major counter-example takes 2 slides:
        slide N   — "What it looks like" (the intuitive answer,
                    the surface read, what most people would do)
        slide N+1 — "Why it's actually different" (the principle
                    that distinguishes; the failure mode of the
                    intuitive answer)
      Never put both halves on a single slide — the visual
      separation IS the pedagogical tension. The remaining ≤ 30%
      of slides covers framing / intro / closing question.

  - view: foundation
    artifact: video
    inject: |
      Opening 30 seconds: a relatable scenario, NOT an abstract
      definition. Show a person doing something familiar; have
      the narrator name the problem they're solving in concrete
      terms. Closing 30 seconds: the TL;DR 5-pack must appear
      both as voice narration AND as on-screen text simultaneously
      — the audio reinforces the text, the text reinforces the
      audio. This dual-modal closing is what makes a foundation
      video memorable.
```

## What about the other 6 cells?

The remaining 6 (view, artifact) cells — foundation/audio, foundation/slide_deck, structural/audio, structural/video, structural/slide_deck, challenge/video — work correctly with view-prefix + artifact-suffix alone. Adding more overrides here without evidence (dogfood QA) of an actual joint effect would be over-engineering.

Should dogfood reveal a cell whose output drifts away from its tier, add a new override row here with a targeted injection. Do not adjust view-prefix or artifact-suffix files for single-cell fixes — they serve multiple combinations and changes there have wider blast radius.

## v6.0.0 dogfood-driven changes

- **Removed**: `(foundation, infographic)` override row — infographic artifact type permanently retired in marketplace v6.0.0 (see [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](../../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) §3.2). Users wanting infographic must generate via NotebookLM web UI manually.
- **Cartesian shrinks**: 9 cells (3 view-cycled types × 3 views) instead of 12 in v5.x or 15 in pre-v4.0. Overrides cover 3 of 9 cells (33%); the other 6 use base composition.

## v1.0.0 historical note

- **Earlier removed**: `(structural, mind_map)` override row. Mind_map is no longer view-cycled (one mind_map per topic, view-agnostic) and connector v0.8.7 ignores mind-map prompting entirely, so it carries no medium-constraints template or override; see SKILL.md Step 5B for the rationale.
