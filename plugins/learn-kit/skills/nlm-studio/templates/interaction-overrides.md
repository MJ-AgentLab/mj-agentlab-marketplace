# Interaction Overrides · view × artifact joint tuning

Most (view, artifact) cells work fine with `view-prefix +
artifact-suffix` alone. This file lists the minority of cells
where the joint effect needs an explicit tweak — because the
medium and the pedagogical stance interact non-obviously.

**Scope**: This file applies only to the 4 view-cycled artifact
types (audio / video / slide_deck / infographic) × 3 views =
12 possible cells. Mind_map is excluded entirely because v1.0.0
dogfood showed NLM's mind_map type produces structural-hierarchy
output regardless of view-tier prompting; mind_map is therefore
generated once per topic (view-agnostic) and uses only its own
artifact-mind_map.md template, no view-prefix and no override.

The `nlm-studio` skill reads this file during focus_prompt
composition. If a row matches the current `(view, artifact)` pair,
its `inject:` value is appended as the `===== INTERACTION OVERRIDE
=====` section. If no row matches, that section is omitted entirely.

## Schema

```yaml
overrides:
  - view: <foundation | structural | challenge>
    artifact: <audio | video | slide_deck | mind_map | infographic>
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

  - view: foundation
    artifact: infographic
    inject: |
      Visual density constraint: each panel may contain at most 7
      numbers / digits / data points total — and prefer icons over
      digits wherever the meaning survives. Anchor each panel with
      one everyday object as the visual metaphor (a cup, a door,
      a traffic light, a key, a map pin). Foundation infographics
      that look like dashboards have failed their tier; they
      should look like illustrated children's posters.

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

## What about the other 8 cells?

The remaining 8 (view, artifact) cells — foundation/audio,
foundation/slide_deck, structural/audio, structural/video,
structural/slide_deck, structural/infographic, challenge/video,
challenge/infographic — work correctly with view-prefix +
artifact-suffix alone. Adding more overrides here without evidence
(dogfood QA) of an actual joint effect would be over-engineering.

Should dogfood reveal a cell whose output drifts away from its
tier, add a new override row here with a targeted injection. Do not
adjust view-prefix or artifact-suffix files for single-cell fixes —
they serve multiple combinations and changes there have wider
blast radius.

## v1.0.0 dogfood-driven changes

- **Removed**: `(structural, mind_map)` override row. Mind_map is
  no longer view-cycled (one mind_map per topic, view-agnostic). See
  `artifact-mind_map.md` for the rationale.
- **Cartesian shrinks**: 12 cells (4 view-cycled types × 3 views)
  instead of 15. Overrides cover 4 of 12 cells (33%); the other 8
  use base composition.
