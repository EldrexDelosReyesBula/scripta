# Scripta Code Quality & Philosophy Guidelines

This document outlines the coding standards, architecture principles, and human touch required for all code written within the Scripta workspace.

---

## 1. Core Principles for Code Crafting

1. **Human-Centric & Mindful Comments**:
   - Write code comments as if you are explaining the cognitive design decisions to another human developer.
   - Explain *why* a constraint or feature exists (e.g., *why* backspace is disabled in the Sandbox, *why* procedural Web Audio is used instead of static MP3s), not just *what* the code syntax does.

2. **Zero Dependency & High Portability**:
   - Write pure vanilla JavaScript (ES6+), HTML5, and CSS3.
   - Avoid external npm dependencies or heavy build steps to preserve offline-only, local-first integrity.

3. **Separation of Cognitive Rooms**:
   - Keep logic for the three rooms (**The Sandbox**, **The Cutting Room**, **The Sculptor**) clearly modularized in separate ES modules.
   - Ensure state transitions between rooms are explicit and clean.

4. **Tactile & Procedural Feedback**:
   - All auditory feedback must use procedural Web Audio API synthesis to ensure micro-second response time and zero asset loading overhead.

5. **Local-First & Data Ownership**:
   - Prioritize the standard File System Access API with progressive fallback to `localStorage` and standard download blobs.
   - Never send user text to external servers or APIs.

---

## 2. Code Aesthetics

- **Naming Conventions**: Clear, domain-specific names (`workingQuestion`, `sandboxDraft`, `cuttingRoomCards`, `futureNote`, `playThock`).
- **CSS Architecture**: Use CSS Custom Properties defined in `css/variables.css` for consistent color schemes per room.
- **Error Handling**: Graceful degradation when browser features (e.g., SpeechSynthesis or File System Access API) are restricted or unsupported.
