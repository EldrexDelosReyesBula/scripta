/*
 * Scripta - Room Two: The Cutting Room (Organization Room)
 * 
 * Philosophy: Structure emerges from material. Before you polish sentences,
 * you must understand the architecture of your thoughts.
 * 
 * Constraints & Features Implemented:
 * 1. Paragraphs converted into discrete reorderable cards.
 * 2. Mandatory Card Labeling (up to 60 chars) before unlocking Sculptor.
 * 3. Text Body Editing prohibited in this room (triggers guidance tooltip).
 * 4. Drag-and-drop & touch-friendly Move Up/Down reordering.
 * 5. Split, merge, and color tagging with procedural acoustic feedback.
 */

import { audioEngine } from '../audio.js';

export class CuttingRoom {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('room-cutting');
    this.cardsContainer = document.getElementById('cards-container');
    this.proceedBtn = document.getElementById('btn-proceed-sculptor');
    this.progressBadge = document.getElementById('label-progress-text');
    this.cards = [];
    this.draggedCardIndex = null;
    this.tooltipEl = null;

    this.createTooltip();
  }

  createTooltip() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'scripta-tooltip';
    this.tooltipEl.innerText = "Not yet. First, understand what you have. Label this block. Then decide where it belongs.";
    document.body.appendChild(this.tooltipEl);
  }

  activate() {
    this.loadCardsFromSandbox();
    this.render();
  }

  deactivate() {
    this.syncState();
  }

  /**
   * Split raw Sandbox text into card blocks by double newlines or non-empty paragraphs.
   */
  loadCardsFromSandbox() {
    if (this.app.state.cuttingRoom.cards && this.app.state.cuttingRoom.cards.length > 0) {
      this.cards = this.app.state.cuttingRoom.cards;
      return;
    }

    const rawText = this.app.state.sandbox.rawText || '';
    const paragraphs = rawText
      .split(/\n\s*\n|\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (paragraphs.length === 0) {
      paragraphs.push("Initial raw thought block. Click label above to describe this paragraph.");
    }

    this.cards = paragraphs.map((text, idx) => ({
      id: `card-${Date.now()}-${idx}`,
      text: text,
      label: '',
      tag: 'unclear'
    }));

    this.syncState();
  }

  syncState() {
    this.app.state.cuttingRoom.cards = this.cards;
    this.app.saveAutoRecovery();
    this.checkCompletionState();
  }

  /**
   * Enforce mandatory labeling for all cards before unlocking Sculptor exit.
   */
  checkCompletionState() {
    const labeledCount = this.cards.filter(c => c.label && c.label.trim().length > 0).length;
    const totalCount = this.cards.length;
    const allLabeled = totalCount > 0 && labeledCount === totalCount;

    if (this.progressBadge) {
      this.progressBadge.innerText = `${labeledCount} / ${totalCount} labeled`;
    }

    if (this.proceedBtn) {
      if (allLabeled) {
        this.proceedBtn.disabled = false;
        this.proceedBtn.classList.remove('btn-disabled');
      } else {
        this.proceedBtn.disabled = true;
        this.proceedBtn.classList.add('btn-disabled');
      }
    }
  }

  render() {
    if (!this.cardsContainer) return;
    this.cardsContainer.innerHTML = '';

    this.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'cutting-card';
      cardEl.draggable = true;
      cardEl.dataset.index = index;

      cardEl.innerHTML = `
        <div class="cutting-card-header">
          <div class="card-label-wrapper">
            <span class="card-drag-handle" title="Drag to reorder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="5" r="1"></circle>
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="9" cy="19" r="1"></circle>
                <circle cx="15" cy="5" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <circle cx="15" cy="19" r="1"></circle>
              </svg>
            </span>
            <input 
              type="text" 
              class="card-label-input" 
              placeholder="What is this block about? (Required, max 60 chars)"
              maxlength="60"
              value="${this.escapeHtml(card.label)}"
              data-index="${index}"
            />
          </div>

          <select class="card-tag-select" data-index="${index}">
            <option value="unclear" ${card.tag === 'unclear' ? 'selected' : ''}>Unclear</option>
            <option value="introduction" ${card.tag === 'introduction' ? 'selected' : ''}>Introduction</option>
            <option value="evidence" ${card.tag === 'evidence' ? 'selected' : ''}>Evidence</option>
            <option value="counterargument" ${card.tag === 'counterargument' ? 'selected' : ''}>Counterargument</option>
            <option value="conclusion" ${card.tag === 'conclusion' ? 'selected' : ''}>Conclusion</option>
          </select>

          <div class="card-actions">
            <!-- Mobile/Touch Reorder Buttons -->
            <button class="btn btn-secondary btn-sm btn-move-up" data-index="${index}" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button class="btn btn-secondary btn-sm btn-move-down" data-index="${index}" title="Move Down" ${index === this.cards.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Split & Merge Buttons -->
            <button class="btn btn-secondary btn-sm btn-split" data-index="${index}" title="Split into two cards">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
              <span>Split</span>
            </button>

            ${index > 0 ? `
              <button class="btn btn-secondary btn-sm btn-merge" data-index="${index}" title="Merge into card above">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <span>Merge</span>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="card-body-text" data-index="${index}" title="Text locked in Cutting Room">
          ${this.escapeHtml(card.text)}
        </div>
      `;

      // Event bindings for Label & Tag changes
      const labelInput = cardEl.querySelector('.card-label-input');
      labelInput.addEventListener('input', (e) => {
        this.cards[index].label = e.target.value;
        this.syncState();
      });

      const tagSelect = cardEl.querySelector('.card-tag-select');
      tagSelect.addEventListener('change', (e) => {
        this.cards[index].tag = e.target.value;
        audioEngine.playBlip();
        this.syncState();
      });

      // Intercept clicks on card text body to enforce editing prohibition rule
      const bodyEl = cardEl.querySelector('.card-body-text');
      bodyEl.addEventListener('click', (e) => this.showTooltip(e));

      // Drag and drop events
      cardEl.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
      cardEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        cardEl.classList.add('drag-over');
      });
      cardEl.addEventListener('dragleave', () => {
        cardEl.classList.remove('drag-over');
      });
      cardEl.addEventListener('drop', (e) => {
        cardEl.classList.remove('drag-over');
        this.handleDrop(e, index);
      });

      // Move Up / Down button handlers
      const moveUpBtn = cardEl.querySelector('.btn-move-up');
      if (moveUpBtn && index > 0) {
        moveUpBtn.addEventListener('click', () => this.moveCard(index, index - 1));
      }

      const moveDownBtn = cardEl.querySelector('.btn-move-down');
      if (moveDownBtn && index < this.cards.length - 1) {
        moveDownBtn.addEventListener('click', () => this.moveCard(index, index + 1));
      }

      // Split and Merge buttons
      const splitBtn = cardEl.querySelector('.btn-split');
      if (splitBtn) splitBtn.addEventListener('click', () => this.splitCard(index));

      const mergeBtn = cardEl.querySelector('.btn-merge');
      if (mergeBtn) mergeBtn.addEventListener('click', () => this.mergeCardUp(index));

      this.cardsContainer.appendChild(cardEl);
    });

    this.checkCompletionState();
  }

  showTooltip(e) {
    const rect = e.target.getBoundingClientRect();
    this.tooltipEl.style.left = `${Math.max(10, rect.left + window.scrollX + (rect.width / 2) - 140)}px`;
    this.tooltipEl.style.top = `${rect.top + window.scrollY - 45}px`;
    this.tooltipEl.classList.add('show');
    audioEngine.playBlip();

    setTimeout(() => {
      this.tooltipEl.classList.remove('show');
    }, 2800);
  }

  handleDragStart(e, index) {
    this.draggedCardIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  }

  handleDrop(e, targetIndex) {
    e.preventDefault();
    if (this.draggedCardIndex === null || this.draggedCardIndex === targetIndex) return;

    const movedCard = this.cards.splice(this.draggedCardIndex, 1)[0];
    this.cards.splice(targetIndex, 0, movedCard);
    this.draggedCardIndex = null;

    audioEngine.playClick();
    this.syncState();
    this.render();
  }

  moveCard(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= this.cards.length) return;
    const movedCard = this.cards.splice(fromIndex, 1)[0];
    this.cards.splice(toIndex, 0, movedCard);

    audioEngine.playClick();
    this.syncState();
    this.render();
  }

  splitCard(index) {
    const card = this.cards[index];
    const words = card.text.split(' ');
    if (words.length < 4) {
      alert("This block is too short to split further.");
      return;
    }

    const mid = Math.floor(words.length / 2);
    const firstHalf = words.slice(0, mid).join(' ');
    const secondHalf = words.slice(mid).join(' ');

    card.text = firstHalf;
    const newCard = {
      id: `card-${Date.now()}-split`,
      text: secondHalf,
      label: '',
      tag: card.tag
    };

    this.cards.splice(index + 1, 0, newCard);
    audioEngine.playClick();
    this.syncState();
    this.render();
  }

  mergeCardUp(index) {
    if (index <= 0) return;

    const prevCard = this.cards[index - 1];
    const currentCard = this.cards[index];

    prevCard.text += ' ' + currentCard.text;
    this.cards.splice(index, 1);

    audioEngine.playClick();
    this.syncState();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

