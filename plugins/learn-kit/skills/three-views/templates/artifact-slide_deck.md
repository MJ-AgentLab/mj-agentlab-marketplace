# Artifact: slide_deck

This file is loaded as the `===== MEDIUM CONSTRAINTS =====` section of
`focus_prompt` when `artifact_type=slide_deck`. Format constraints
only.

## Format

- **Length**: 15–25 slides. Below 12 feels thin; above 30 is
  unviewable in one sitting.
- **Style**: Detailed deck — content slides have a clear
  hierarchy, not just title + image.
- **Each slide**: ONE key takeaway. If you can't reduce the slide
  to a single takeaway sentence, split it.

## Slide layout vocabulary

Use the visual layouts that suit the view's pedagogical purpose:
- **Foundation view** → analogy-first slides: relatable image /
  scenario on left, brief explanation on right. Final slide is the
  TL;DR 5-pack visualized.
- **Structural view** → structural slides: hierarchy diagrams,
  comparison tables, dimensional grids. Final slide is the
  self-check list.
- **Challenge view** → contrast slides: each major counter-example
  takes 2 slides — slide N "What it looks like (the intuitive
  answer)" → slide N+1 "Why it's actually different (the principle
  that distinguishes)". (See `interaction-overrides.md` for the
  explicit 70%+ rule.)

## Cover slide

- Slide 1: topic name + view tier in subtitle ("Foundation tier" /
  "Structural tier" / "Challenge tier"). This is the one place the
  artifact identifies its own tier — for downstream organization,
  not for the learner's mental model.
- Slide 2: agenda / table of contents.

## Closing slide

- For foundation: TL;DR 5-pack as a single dense visual.
- For structural: self-check question list + further reading.
- For challenge: open question + invitation to revisit assumptions.

## What NOT to do

- No slide that's purely text with no visual organization (use
  bullets, columns, callouts).
- No more than 5 bullets per slide; if you need more, split.
- No slide whose title repeats the previous slide's title with a
  "(continued)" — re-architect instead.
- No vendor / NotebookLM branding.
