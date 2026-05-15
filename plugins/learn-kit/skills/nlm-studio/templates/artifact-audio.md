# Artifact: audio （Deep Dive Audio Overview）

This file is loaded as the `===== MEDIUM CONSTRAINTS =====` section of
`focus_prompt` when `artifact_type=audio`. It carries format /
medium constraints only — the *purpose* is supplied by the view
template (loaded as VIEW PURPOSE).

## Format

- **Style**: NotebookLM "Deep Dive" two-host conversational format.
  Two AI hosts in genuine dialogue — questions, callbacks, gentle
  disagreements. Not narration with bullet points.
- **Length target**: 15–20 minutes. Under 12 = too thin; over 25
  = bloated.
- **Segment structure**: 3–5 segments separated by clear
  transitions ("OK, so the other thing to talk about is…"). Each
  segment is one tight subtopic.

## Voice & pacing

- Conversational, not lecturing. Hosts should ask each other
  clarifying questions, even rhetorical ones, to break up density.
- Avoid reading lists aloud — when you'd naturally say "there are
  three things: A, B, and C", instead let one host introduce the
  frame and the other host walk through them.
- Allow brief moments of host disagreement or "wait, but isn't
  that…?" — these create the listener's engagement hooks.

## Segment endings

The *style* of segment endings is governed by the view template's
§3 Style mandate. Audio inherits that style:
- Foundation audio → segment endings are mini-TL;DR recaps.
- Structural audio → segment endings explicitly call out where in
  the overall map the segment fit.
- Challenge audio → segment endings end with a probing question.
  (See `interaction-overrides.md` for the explicit injection.)

## Citations and lineage

Each segment must implicitly anchor to the source view's citation
tag (foundation/structural/challenge). NotebookLM's natural source
attribution behavior is sufficient — do not invent forced citation
moments that disrupt conversation flow.

## What NOT to do

- No music, no sound effects.
- No "Welcome back to the show!" framing — the listener is
  encountering this in isolation, not as part of a series.
- No host self-introduction ("I'm Alex" / "I'm Sarah"). The hosts
  are anonymous studio voices.
- No mention of NotebookLM or the source documents by name —
  speak as if naturally summarizing knowledge.
