# Changelog

All notable changes to **Scripta** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-18

### Added
- **Initial Release of Scripta** — The local-first cognitive spatial writing space.
- **Three Specialized Cognitive Spatial Rooms**:
  - **The Threshold**: Core inquiry premise definition with time-adaptive procedural sky canvas.
  - **The Sandbox**: Uninterrupted generative drafting with locked backspace/arrows and 3-tier visual paragraph fading.
  - **The Cutting Room**: Structural thought block index cards with category labeling constraints and drag-and-drop ordering.
  - **The Sculptor**: Full manuscript reassembly, margin subheadings, robotic read-aloud sentence cadence tracking, and interactive Hemingway analyzer.
- **Progressive Web App (PWA) & 100% Offline Capability**:
  - Web App Manifest (`manifest.json`) for standalone mobile and desktop home-screen installation.
  - Service Worker (`sw.js`) pre-caching application shell, typography, and assets for offline writing anywhere.
- **Multi-Format Local Document Export Suite**:
  - Microsoft Word (`.docx` / `.doc`) formatted with publication metadata and clean paragraph structure.
  - PDF Document (`.pdf`) with custom `@media print` 1-inch margins and high-contrast typography.
  - Markdown (`.md`), Plain Text (`.txt`), HTML Web Page (`.html`), and Scripta Project (`.scripta`).
- **Document Analytics & Writing Provenance Colophon**:
  - Real-time tracking of active writing duration, session days, structural revisions, and deletions count.
  - Optional writing receipt / colophon footer attached to exported documents.
  - Optional custom writer context note.
- **Procedural Living Sky & Weather Engine (`AtmosphericSky.jsx`)**:
  - 60fps HTML5 canvas with time-of-day sky transitions (*Dawn*, *Day*, *Dusk*, *Midnight*).
  - 120+ uniformly scattered twinkling stars across the full viewport.
  - Weather moods: *Gentle Rain & Mist*, *Cozy Thunderstorm with lightning*, *Winter Snowfall*, *Starry Night*, and *Minimalist Off*.
  - Rolling nature hill silhouette with wind-swaying grass blades.
- **4 Tactile Mechanical Keyboard Audio Signatures**:
  - Procedural real-time Web Audio synthesis for *Vintage Typewriter*, *Creamy Lubed Linear*, *Clicky Blue Switch*, and *Quiet Membrane Tap* with live preview in Preferences.
- **Typography & Ergonomic Controls**:
  - Integrated native Marginalia package (`Marginalia Mono`, `Marginalia Serif`).
  - Interactive font size slider ($14\text{px}\text{--}26\text{px}$) with instant scaling.
  - Custom blinking typewriter caret that flows inline across multi-line wrapped sentences.
  - Auto-centering viewport scroll keeping writing in the ergonomic center.
  - Dyslexia-friendly font and High Contrast mode.
- **Mobile-Optimized Experience**:
  - Slide-out mobile navigation drawer with spring animations.
  - Native gesture-friendly bottom-sheet dialogs with touch drag-handle indicators.
  - Custom iOS/Mac-style animated pill toggle switches.
- **Personalized Scripta Geometric SVG Icons**:
  - Custom vector icon suite styled after Scripta's red diagonal folded-pen logo (`IconScriptaCompass`, `IconScriptaPen`, `IconScriptaGrid`, `IconScriptaChisel`).
- **Automated GitHub CI**:
  - Continuous integration workflow (`.github/workflows/ci.yml`) for automated build verification on push and pull requests.
