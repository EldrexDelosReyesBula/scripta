/*
 * Scripta - The Save Ritual Modal
 * 
 * Philosophy: Metacognitive reflection before archiving.
 * Scripta forces the writer to record a "Future Note" to their future self
 * describing where they left off and what their next step is.
 */

import { storageEngine } from '../storage.js';
import { audioEngine } from '../audio.js';

export class SaveModal {
  constructor(app) {
    this.app = app;
    this.backdrop = document.getElementById('modal-save');
    this.noteInput = document.getElementById('future-note-input');
    this.confirmBtn = document.getElementById('btn-confirm-save');
    this.cancelBtn = document.getElementById('btn-cancel-save');

    this.initEvents();
  }

  initEvents() {
    if (this.confirmBtn) {
      this.confirmBtn.addEventListener('click', () => this.executeSave());
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => {
        audioEngine.playBlip();
        this.close();
      });
    }
  }

  open() {
    if (!this.backdrop) return;
    audioEngine.playBlip();
    if (this.noteInput) {
      this.noteInput.value = this.app.state.metadata.futureNote || '';
    }
    this.backdrop.classList.add('open');
    if (this.noteInput) {
      setTimeout(() => this.noteInput.focus(), 150);
    }
  }

  close() {
    if (this.backdrop) this.backdrop.classList.remove('open');
  }

  async executeSave() {
    const futureNote = this.noteInput ? this.noteInput.value.trim() : '';
    this.app.state.metadata.futureNote = futureNote;

    this.close();
    const result = await storageEngine.saveProject(this.app.state);

    if (result && result.success) {
      audioEngine.playChime();
      this.app.showNotification("Project Saved", "Your work and Future Note have been safely archived.");
    }
  }

  /**
   * Display Future Note overlay when loading an existing .scripta project file.
   */
  static showFutureNoteNotice(metadata, onContinue) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    
    const formattedDate = new Date(metadata.modified || Date.now()).toLocaleDateString(undefined, {
      weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    backdrop.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-icon-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Welcome Back to Your Thinking</span>
          </div>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 12px; color: var(--text-muted); font-size: 0.9rem;">
            On <strong>${formattedDate}</strong>, you left this message for your future self:
          </p>
          <div style="padding: 16px; background: var(--bg-input); border-left: 3px solid var(--accent-color); border-radius: 8px; font-style: italic; color: var(--text-primary); line-height: 1.6;">
            "${metadata.futureNote || 'No specific future note provided.'}"
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary btn-continue-session">
            <span>Resume Work</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    audioEngine.playChime();

    const btn = backdrop.querySelector('.btn-continue-session');
    btn.addEventListener('click', () => {
      audioEngine.playBlip();
      document.body.removeChild(backdrop);
      if (onContinue) onContinue();
    });
  }
}

