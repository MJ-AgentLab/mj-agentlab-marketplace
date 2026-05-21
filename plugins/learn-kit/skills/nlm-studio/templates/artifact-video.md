# Artifact: video

This file is loaded as the `===== MEDIUM CONSTRAINTS =====` section of
`focus_prompt` when `artifact_type=video`. Format constraints only;
the view template carries pedagogical purpose.

## Format

- **Style**: NotebookLM "Video Overview" — a scripted, single-
  narrator explainer with on-screen visual cues. Not a dialogue.
- **Length target**: 8–12 minutes. Shorter than audio because video
  watching attention is more demanding.
- **Structure**: 4–6 "scenes", each one focused subtopic. Mark
  scene boundaries with visual transitions ("cut", "title card").

## Per-scene structure

Each scene contains:
- **Visual cue**: a short description of what's on screen
  (diagram, side-by-side comparison, animated callout, code snippet,
  poster-style summary).
- **Narration**: the spoken text that accompanies the visual.
- **Duration**: rough seconds estimate.

The visual is not decorative — it's load-bearing. A scene where
the visual could be replaced with a still title slide is a wasted
scene.

## Narration language

- 单一旁白（narrator）使用普通话发音；on-screen 文字使用简体中文。
- 不允许整段英文旁白；不允许 on-screen 文字主体为英文。如果源材料英文
  段落较多，旁白应当用中文复述（保留英文术语原词），on-screen 字幕用
  中文呈现要点。
- 行业标准技术术语保留英文原词：旁白按英文音节自然嵌入中文句子；
  on-screen 直接显示英文原词，无需中译注解。
- 视觉提示（visual cue）里的图示文字 / 代码片段 / 文件路径 / 命令行
  verbatim 显示，不翻译。
- 详细规则见 `===== LANGUAGE & TERMINOLOGY =====` 段；本节为视频媒介
  特化重申，最终规则以 LANGUAGE & TERMINOLOGY 为准。

## Opening 30 seconds

The opening's *content* is governed by the view template's §3 Style
mandate:
- Foundation → relatable scenario hook (NOT abstract definition).
- Structural → preview of the destination map.
- Challenge → provocation that creates productive doubt.

The opening's *form* (regardless of view) is: 1 visual hook + 1
sentence narration + setting up the rest.

## Closing 30 seconds

The closing's content is also view-determined:
- Foundation → on-screen 5-pack TL;DR with voice reinforcement.
- Structural → on-screen recap of the structural map; self-check
  question list.
- Challenge → unresolved probing question + invitation to keep
  thinking.

## What NOT to do

- No "click subscribe" framing — this is not a YouTube video.
- No host face / avatar — visuals are about content, not
  presenter.
- No scene that's just narration over a static title slide for
  more than 5 seconds.
- No claim of authorship — the video is anonymous.
