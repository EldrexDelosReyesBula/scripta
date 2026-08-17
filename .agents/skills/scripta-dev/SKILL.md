---
name: scripta-dev
description: >-
  Developer workflow, architectural guidelines, and design principles for Scripta —
  the local-first cognitive writing environment.
---

# Scripta Developer Skill

This skill provides an overview of Scripta's three-room spatial model, cognitive flow engineering, and file layout conventions.

## The Three-Room Spatial Architecture

1. **The Sandbox (Drafting)**:
   - *Goal*: Raw generation without self-correction.
   - *Key Mechanics*: Line opacity fading (100% active, 40% last 3 lines, 15% older), dead backspace/arrow keys, procedural mechanical typewriter *thock* sound, non-anxiety circular session timer.

2. **The Cutting Room (Organization)**:
   - *Goal*: Spatial structural editing.
   - *Key Mechanics*: Paragraphs converted into discrete reorderable cards, mandatory card labeling (up to 60 chars), split/merge/tag actions. Text body editing prohibited until labeled.

3. **The Sculptor (Refinement)**:
   - *Goal*: Polishing language and rhythm.
   - *Key Mechanics*: Reassembled continuous text, margin sticky subheadings, Web Speech API robotic read-aloud with sentence tracking, Hemingway Mode highlighting (>25 words, adverbs, passive voice, complex words).

## Key Files Summary

- `index.html`: Shell & room container views.
- `css/variables.css`: Design tokens per room (Sandbox navy, Cutting Room cream, Sculptor clean white).
- `js/audio.js`: Procedural Web Audio API sound generator.
- `js/storage.js`: Local-first File System Access API & `.scripta` project serializer.
- `js/modals/saveModal.js`: Save Ritual overlay requiring "Future Notes".
