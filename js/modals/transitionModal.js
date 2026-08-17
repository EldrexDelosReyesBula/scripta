/*
 * Scripta - Room Transition & Finalization Modals
 * 
 * Manages explicit room transition confirmations and final manuscript checklist/export.
 */

import { storageEngine } from '../storage.js';
import { audioEngine } from '../audio.js';

export class TransitionModal {
  constructor(app) {
    this.app = app;
  }

  /**
   * Confirmation Modal when exiting Sandbox -> Cutting Room
   */
  showSandboxExitModal(onConfirm) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';

    const rawText = this.app.state.sandbox.rawText || '';
    const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

    backdrop.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-icon-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Leave the Sandbox?</span>
          </div>
        </div>
        <div class="modal-body">
          <p>You have generated <strong>${wordCount} words</strong> of raw material.</p>
          <p style="margin-top: 10px; color: var(--text-muted); line-height: 1.6;">
            Raw material is the bedrock of scholarship. Moving to The Cutting Room will lock direct text editing and allow you to organize these thoughts into structural cards.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-cancel">Stay in Sandbox</button>
          <button class="btn btn-primary btn-confirm">
            <span>Organize My Thoughts</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    audioEngine.playBlip();

    backdrop.querySelector('.btn-cancel').addEventListener('click', () => {
      audioEngine.playBlip();
      document.body.removeChild(backdrop);
    });

    backdrop.querySelector('.btn-confirm').addEventListener('click', () => {
      audioEngine.playBlip();
      document.body.removeChild(backdrop);
      if (onConfirm) onConfirm();
    });
  }

  /**
   * Confirmation Modal when exiting Cutting Room -> Sculptor
   */
  showCuttingExitModal(onConfirm) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';

    const cardCount = this.app.state.cuttingRoom.cards ? this.app.state.cuttingRoom.cards.length : 0;

    backdrop.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-icon-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>Proceed to The Sculptor?</span>
          </div>
        </div>
        <div class="modal-body">
          <p>You have structured <strong>${cardCount} labeled blocks of thought</strong>.</p>
          <p style="margin-top: 10px; color: var(--text-muted); line-height: 1.6;">
            Your thought structure is now defined. In The Sculptor, your manuscript is reassembled into a continuous document for sentence rhythm, Hemingway analysis, and read-aloud testing.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-cancel">Return to Cutting Room</button>
          <button class="btn btn-primary btn-confirm">
            <span>Refine Language</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    audioEngine.playBlip();

    backdrop.querySelector('.btn-cancel').addEventListener('click', () => {
      audioEngine.playBlip();
      document.body.removeChild(backdrop);
    });

    backdrop.querySelector('.btn-confirm').addEventListener('click', () => {
      audioEngine.playBlip();
      document.body.removeChild(backdrop);
      if (onConfirm) onConfirm();
    });
  }

  /**
   * Exit Ritual & Export Modal in Sculptor
   */
  showFinalizeModal(stats) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';

    backdrop.innerHTML = `
      <div class="modal-card modal-card-wide">
        <div class="modal-header">
          <div class="modal-icon-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Manuscript Finalized</span>
          </div>
        </div>
        <div class="modal-body">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; background: var(--bg-input); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid var(--border-color);">
            <div>
              <div style="font-family: var(--font-sandbox); font-size: 1.3rem; font-weight: 600; color: var(--accent-color);">${stats.readingTimeMins} min</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-top: 2px;">Reading Time</div>
            </div>
            <div>
              <div style="font-family: var(--font-sandbox); font-size: 1.3rem; font-weight: 600; color: var(--accent-color);">${stats.avgSentenceLength} words</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-top: 2px;">Avg Sentence</div>
            </div>
            <div>
              <div style="font-family: var(--font-sandbox); font-size: 1.3rem; font-weight: 600; color: var(--accent-color);">${stats.adverbDensity}%</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-top: 2px;">Adverb Density</div>
            </div>
          </div>

          <div style="margin-bottom: 22px;">
            <div style="font-size: 0.88rem; font-weight: 600; margin-bottom: 10px; color: var(--accent-color);">Self-Editing Ritual Checklist:</div>
            <label style="display: flex; align-items: center; gap: 10px; font-size: 0.88rem; margin-bottom: 8px; cursor: pointer;">
              <input type="checkbox" class="input-toggle" id="check-readaloud" ${this.app.state.sculptor.readAloudUsed ? 'checked' : ''} />
              Read the entire document aloud with the voice reader
            </label>
            <label style="display: flex; align-items: center; gap: 10px; font-size: 0.88rem; margin-bottom: 8px; cursor: pointer;">
              <input type="checkbox" class="input-toggle" id="check-hemingway" ${this.app.state.sculptor.hemingwayUsed ? 'checked' : ''} />
              Reviewed all highlighted passages in Hemingway Mode
            </label>
            <label style="display: flex; align-items: center; gap: 10px; font-size: 0.88rem; cursor: pointer;">
              <input type="checkbox" class="input-toggle" id="check-very" />
              Verified tone against the core working question
            </label>
          </div>

          <div style="font-size: 0.88rem; font-weight: 600; margin-bottom: 10px; color: var(--accent-color);">Export Manuscript:</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
            <button class="btn btn-secondary btn-export-md">Markdown (.md)</button>
            <button class="btn btn-secondary btn-export-txt">Plain Text (.txt)</button>
            <button class="btn btn-secondary btn-export-html">HTML Document</button>
            <button class="btn btn-primary btn-export-scripta">Project (.scripta)</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-close-modal">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    audioEngine.playChime();

    const text = this.app.state.sculptor.finalText || '';
    const title = (this.app.state.workingQuestion || 'manuscript').replace(/[^a-z0-9]/gi, '-').toLowerCase();

    backdrop.querySelector('.btn-export-md').addEventListener('click', () => {
      audioEngine.playBlip();
      storageEngine.downloadBlob(text, `${title}.md`, 'text/markdown');
    });

    backdrop.querySelector('.btn-export-txt').addEventListener('click', () => {
      audioEngine.playBlip();
      storageEngine.downloadBlob(text, `${title}.txt`, 'text/plain');
    });

    backdrop.querySelector('.btn-export-html').addEventListener('click', () => {
      audioEngine.playBlip();
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{max-width:720px;margin:40px auto;font-family:Georgia,serif;line-height:1.8;padding:0 20px;color:#222;}h1{font-size:1.6rem;margin-bottom:24px;}</style></head><body><h1>${this.app.state.workingQuestion || 'Manuscript'}</h1><p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p></body></html>`;
      storageEngine.downloadBlob(htmlContent, `${title}.html`, 'text/html');
    });

    backdrop.querySelector('.btn-export-scripta').addEventListener('click', () => {
      audioEngine.playBlip();
      storageEngine.saveProject(this.app.state);
    });

    backdrop.querySelector('.btn-close-modal').addEventListener('click', () => {
      audioEngine.playBlip();
      document.body.removeChild(backdrop);
    });
  }
}

