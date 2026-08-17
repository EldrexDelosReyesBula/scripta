/*
 * Scripta - Room One: The Sandbox (Drafting Room)
 * 
 * Philosophy: Writing and editing are distinct cognitive processes.
 * The inner critic must be silenced during raw material generation.
 * 
 * Mechanics Implemented:
 * 1. Dead Backspace Key & Disabled Arrow Navigation.
 * 2. Visual Line Fading (100% active, 42% last 3 lines, 16% older lines).
 * 3. Procedural Mechanical Typewriter "Thock" Audio (with carriage return sound on Enter).
 * 4. Non-Anxiety Circular Session Timer & Inactivity Detection.
 */

import { audioEngine } from '../audio.js';

export class SandboxRoom {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('room-sandbox');
    this.editor = document.getElementById('sandbox-editor');
    this.timerCircle = document.getElementById('timer-progress');
    this.timerContainer = document.getElementById('timer-container');
    this.timerStatus = document.getElementById('timer-sub-status');

    this.timerDuration = (app.state.settings && app.state.settings.timerDuration) || 900;
    this.timeRemaining = this.timerDuration;
    this.timerInterval = null;
    this.inactivitySeconds = 0;
    this.inactivityInterval = null;
    this.rawLines = [''];
    this.currentLineIndex = 0;
    this.isSessionActive = false;

    this.initEvents();
  }

  initEvents() {
    if (!this.editor) return;

    // Block non-drafting keystrokes & handle typing
    this.editor.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Prevent mouse selection outside the active draft line
    this.editor.addEventListener('mouseup', () => this.forceCursorToEnd());
    this.editor.addEventListener('click', () => this.forceCursorToEnd());
    this.editor.addEventListener('touchend', () => this.forceCursorToEnd());
  }

  activate() {
    this.isSessionActive = true;
    this.timerDuration = (this.app.state.settings && this.app.state.settings.timerDuration) || 900;
    if (this.timeRemaining === 0 || this.timeRemaining === 900) {
      this.timeRemaining = this.timerDuration;
    }

    // Load any existing raw text
    if (this.app.state.sandbox.rawText) {
      this.rawLines = this.app.state.sandbox.rawText.split('\n');
      if (this.rawLines.length === 0) this.rawLines = [''];
      this.currentLineIndex = this.rawLines.length - 1;
    }

    this.renderFadedLines();
    this.startTimer();
    this.startInactivityMonitor();
    
    setTimeout(() => {
      if (this.editor) {
        this.editor.focus();
        this.forceCursorToEnd();
      }
    }, 100);
  }

  deactivate() {
    this.isSessionActive = false;
    this.stopTimer();
    this.stopInactivityMonitor();
  }

  /**
   * Enforce Cognitive Discipline:
   * Block Backspace, Delete, Arrow navigation, Home/End, and PageUp/PageDown.
   */
  handleKeyDown(e) {
    if (!this.isSessionActive) return;

    const forbiddenKeys = [
      'Backspace', 'Delete', 
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown'
    ];

    if (forbiddenKeys.includes(e.key)) {
      e.preventDefault();
      // Optional subtle visual refusal hint or micro-thock
      return;
    }

    // Reset inactivity tracking on any valid keystroke
    this.resetInactivity();

    // Handle newline entry (Carriage Return)
    if (e.key === 'Enter') {
      e.preventDefault();
      audioEngine.playThock(true); // Heavier return sound
      this.rawLines.push('');
      this.currentLineIndex = this.rawLines.length - 1;
      this.renderFadedLines();
      return;
    }

    // Handle normal text input
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      audioEngine.playThock(false); // Standard key thock
      this.rawLines[this.currentLineIndex] += e.key;
      this.renderFadedLines();
    }
  }

  /**
   * Render text with 3-tier opacity fading:
   * Current line: 100%
   * Previous 3 lines: 42%
   * Older lines: 16%
   */
  renderFadedLines() {
    const totalLines = this.rawLines.length;
    let html = '';

    this.rawLines.forEach((lineText, idx) => {
      let fadeClass = 'faded-line'; // Default 16% opacity

      if (idx === totalLines - 1) {
        fadeClass = 'current-line'; // 100% opacity
      } else if (idx >= totalLines - 4) {
        fadeClass = 'recent-line'; // 42% opacity for previous 3 lines
      }

      // Preserve empty line height
      const safeText = lineText === '' ? '&nbsp;' : this.escapeHtml(lineText);
      html += `<div class="sandbox-line ${fadeClass}" data-line="${idx}">${safeText}</div>`;
    });

    this.editor.innerHTML = html;
    this.forceCursorToEnd();

    // Sync raw text with overall app state
    this.app.state.sandbox.rawText = this.rawLines.join('\n');
    this.app.saveAutoRecovery();
  }

  forceCursorToEnd() {
    const lastLineEl = this.editor.querySelector(`.sandbox-line[data-line="${this.currentLineIndex}"]`);
    if (lastLineEl) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(lastLineEl);
      range.collapse(false); // Move to end of text
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  /**
   * Non-Anxiety Circular Session Timer logic.
   */
  startTimer() {
    this.stopTimer();
    const circumference = 2 * Math.PI * 15.9155; // ~100 in SVG coordinates

    if (this.timerCircle) {
      this.timerCircle.style.strokeDasharray = `${circumference}`;
    }

    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
        const progress = this.timeRemaining / this.timerDuration;
        const offset = circumference * (1 - progress);

        if (this.timerCircle) {
          this.timerCircle.style.strokeDashoffset = `${offset}`;
        }

        if (this.timeRemaining === 0) {
          audioEngine.playChime();
          if (this.timerStatus) this.timerStatus.innerText = "Time Target Met";
          this.app.showNotification("Drafting Target Reached", "You completed your session time. You may continue writing or move to The Cutting Room.");
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  /**
   * Inactivity Monitor:
   * 12s: Gentle circle pulse
   * 30s: Dim screen slightly
   * 60s: Soft chime + prompt
   */
  startInactivityMonitor() {
    this.stopInactivityMonitor();
    this.inactivityInterval = setInterval(() => {
      this.inactivitySeconds++;

      if (this.inactivitySeconds >= 12 && this.timerContainer) {
        this.timerContainer.classList.add('pulse-warning');
        if (this.timerStatus) this.timerStatus.innerText = "Pause Detected";
      }

      if (this.inactivitySeconds >= 30) {
        document.body.classList.add('sandbox-dimmed');
      }

      if (this.inactivitySeconds >= 60) {
        audioEngine.playChime();
        this.app.showNotification("Drafting Paused", "60 seconds of stillness. Your thoughts are safely captured.");
        this.resetInactivity();
      }
    }, 1000);
  }

  resetInactivity() {
    this.inactivitySeconds = 0;
    if (this.timerContainer) this.timerContainer.classList.remove('pulse-warning');
    if (this.timerStatus) this.timerStatus.innerText = "Flow State Active";
    document.body.classList.remove('sandbox-dimmed');
  }

  stopInactivityMonitor() {
    if (this.inactivityInterval) clearInterval(this.inactivityInterval);
    this.resetInactivity();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

