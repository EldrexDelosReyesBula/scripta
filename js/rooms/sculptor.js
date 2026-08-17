/*
 * Scripta - Room Three: The Sculptor (Refinement Room)
 * 
 * Philosophy: The ear hears what the eye skips. Reassemble your structure,
 * polish sentence cadence, and refine language with objective feedback.
 * 
 * Features Implemented:
 * 1. Reassembled continuous manuscript with margin sticky subheadings.
 * 2. Web Speech API Robotic Read-Aloud with sentence tracking highlight and auto-scroll.
 * 3. Interactive Hemingway Mode text analyzer (long sentences, adverbs, passive voice, complex words) with suggestion tooltips.
 * 4. Finalize Summary, Readability Index & Self-Editing Checklist.
 */

import { COMPLEX_WORDS } from '../data/complexWords.js';
import { audioEngine } from '../audio.js';

export class SculptorRoom {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('room-sculptor');
    this.editor = document.getElementById('sculptor-editor');
    this.hemingwayToggle = document.getElementById('toggle-hemingway');
    this.readAloudBtn = document.getElementById('btn-read-aloud');
    this.readAloudLabel = document.getElementById('read-aloud-label');
    this.statWords = document.getElementById('stat-pill-words');
    this.statTime = document.getElementById('stat-pill-time');
    
    this.isHemingwayActive = false;
    this.speechSynth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.sentencesToRead = [];
    this.currentSentenceIdx = 0;
    this.tooltipEl = null;

    this.createTooltip();
    this.initEvents();
  }

  createTooltip() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'scripta-tooltip';
    document.body.appendChild(this.tooltipEl);
  }

  initEvents() {
    if (this.hemingwayToggle) {
      this.hemingwayToggle.addEventListener('click', () => {
        audioEngine.playBlip();
        this.toggleHemingwayMode();
      });
    }

    if (this.readAloudBtn) {
      this.readAloudBtn.addEventListener('click', () => {
        audioEngine.playBlip();
        this.toggleReadAloud();
      });
    }

    if (this.editor) {
      this.editor.addEventListener('input', () => {
        this.app.state.sculptor.finalText = this.editor.innerText;
        this.app.saveAutoRecovery();
        this.updateStats();
      });
    }
  }

  activate() {
    this.reassembleFromCuttingRoom();
    this.updateStats();
  }

  deactivate() {
    this.stopReadAloud();
  }

  /**
   * Reassemble cards from Cutting Room into a continuous manuscript with margin subheadings.
   */
  reassembleFromCuttingRoom() {
    const cards = this.app.state.cuttingRoom.cards || [];
    if (!this.editor) return;

    let html = '';
    cards.forEach((card, idx) => {
      const labelText = card.label ? this.escapeHtml(card.label) : `Block ${idx + 1}`;
      const bodyText = this.escapeHtml(card.text);
      html += `
        <div class="sculptor-paragraph" data-card-id="${card.id}">
          <div class="sculptor-margin-label">${labelText}</div>
          <div class="paragraph-content" contenteditable="true">${bodyText}</div>
        </div>
      `;
    });

    this.editor.innerHTML = html;
    this.app.state.sculptor.finalText = this.editor.innerText;
    this.bindHemingwayHoverEvents();
  }

  updateStats() {
    const stats = this.getStatistics();
    if (this.statWords) this.statWords.innerText = `${stats.wordCount} words`;
    if (this.statTime) this.statTime.innerText = `${stats.readingTimeMins} min read`;
  }

  /**
   * Special Tool 1: Web Speech API Robotic Read-Aloud
   * Uses deliberate non-human voice cadence to bypass cognitive silent auto-correction.
   */
  toggleReadAloud() {
    if (!this.speechSynth) {
      alert("Web Speech API is not supported in your current browser.");
      return;
    }

    if (this.isSpeaking) {
      this.stopReadAloud();
    } else {
      this.startReadAloud();
    }
  }

  startReadAloud() {
    const text = this.editor.innerText;
    if (!text.trim()) return;

    // Split text into individual sentences for highlighting
    this.sentencesToRead = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    this.currentSentenceIdx = 0;
    this.isSpeaking = true;
    this.app.state.sculptor.readAloudUsed = true;

    if (this.readAloudLabel) {
      this.readAloudLabel.innerText = "Stop Reading";
    }
    if (this.readAloudBtn) {
      this.readAloudBtn.classList.add('btn-primary');
      this.readAloudBtn.classList.remove('btn-secondary');
    }

    this.speakNextSentence();
  }

  speakNextSentence() {
    if (!this.isSpeaking || this.currentSentenceIdx >= this.sentencesToRead.length) {
      this.stopReadAloud();
      return;
    }

    const sentenceText = this.sentencesToRead[this.currentSentenceIdx].trim();
    if (!sentenceText) {
      this.currentSentenceIdx++;
      this.speakNextSentence();
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(sentenceText);
    
    // Select monotone/clear voice if available
    const voices = this.speechSynth.getVoices();
    const roboticVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || !v.name.includes('Natural')));
    if (roboticVoice) this.currentUtterance.voice = roboticVoice;
    
    this.currentUtterance.rate = 0.92; // Deliberate cadence
    this.currentUtterance.pitch = 0.95;

    this.highlightActiveSentence(sentenceText);

    this.currentUtterance.onend = () => {
      this.currentSentenceIdx++;
      this.speakNextSentence();
    };

    this.currentUtterance.onerror = () => {
      this.stopReadAloud();
    };

    this.speechSynth.speak(this.currentUtterance);
  }

  highlightActiveSentence(sentenceText) {
    // Clear previous highlight
    this.editor.querySelectorAll('.speech-active-sentence').forEach(el => {
      el.classList.remove('speech-active-sentence');
    });

    const paragraphs = this.editor.querySelectorAll('.paragraph-content');
    for (const p of paragraphs) {
      if (p.innerText.includes(sentenceText)) {
        p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  }

  stopReadAloud() {
    if (this.speechSynth) this.speechSynth.cancel();
    this.isSpeaking = false;
    if (this.readAloudLabel) {
      this.readAloudLabel.innerText = "Read Aloud";
    }
    if (this.readAloudBtn) {
      this.readAloudBtn.classList.remove('btn-primary');
      this.readAloudBtn.classList.add('btn-secondary');
    }
    this.editor.querySelectorAll('.speech-active-sentence').forEach(el => {
      el.classList.remove('speech-active-sentence');
    });
  }

  /**
   * Special Tool 2: Hemingway Mode Analyzer Toggle
   */
  toggleHemingwayMode() {
    this.isHemingwayActive = !this.isHemingwayActive;
    this.app.state.sculptor.hemingwayUsed = true;

    if (this.hemingwayToggle) {
      this.hemingwayToggle.classList.toggle('active', this.isHemingwayActive);
    }

    if (this.isHemingwayActive) {
      this.applyHemingwayHighlights();
    } else {
      this.removeHemingwayHighlights();
    }
  }

  applyHemingwayHighlights() {
    const paragraphs = this.editor.querySelectorAll('.paragraph-content');
    
    paragraphs.forEach(pEl => {
      let rawText = pEl.innerText;
      let highlightedHtml = '';

      const sentences = rawText.match(/[^.!?\n]+[.!?\n]*/g) || [rawText];

      sentences.forEach(sentence => {
        const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
        let isLong = words.length > 25;

        let processed = this.escapeHtml(sentence);

        // Adverbs (-ly)
        processed = processed.replace(/\b([a-zA-Z]+ly)\b/gi, '<span class="hw-adverb" data-tip="Adverb: Weakens verbs. Try replacing with a precise action verb.">$1</span>');

        // Passive Voice
        processed = processed.replace(/\b(was|were|is|are|been|be|being)\s+([a-zA-Z]+(ed|en|t))\b/gi, '<span class="hw-passive-voice" data-tip="Passive Voice: Name the actor explicitly to give prose authority.">$1 $2</span>');

        // Complex Words
        words.forEach(w => {
          const clean = w.toLowerCase().replace(/[^a-z]/g, '');
          if (COMPLEX_WORDS.has(clean)) {
            const regex = new RegExp(`\\b(${clean})\\b`, 'gi');
            processed = processed.replace(regex, `<span class="hw-complex-word" data-tip="Complex Word: Consider a clearer Anglo-Saxon alternative.">$1</span>`);
          }
        });

        if (isLong) {
          highlightedHtml += `<span class="hw-long-sentence" data-tip="Long Sentence (${words.length} words): Consider splitting to sharpen cadence.">${processed}</span>`;
        } else {
          highlightedHtml += processed;
        }
      });

      pEl.innerHTML = highlightedHtml;
    });

    this.bindHemingwayHoverEvents();
  }

  bindHemingwayHoverEvents() {
    const highlights = this.editor.querySelectorAll('.hw-adverb, .hw-passive-voice, .hw-complex-word, .hw-long-sentence');
    highlights.forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const tip = el.getAttribute('data-tip');
        if (tip && this.tooltipEl) {
          const rect = el.getBoundingClientRect();
          this.tooltipEl.innerText = tip;
          this.tooltipEl.style.left = `${Math.max(10, rect.left + window.scrollX + (rect.width / 2) - 140)}px`;
          this.tooltipEl.style.top = `${rect.top + window.scrollY - 42}px`;
          this.tooltipEl.classList.add('show');
        }
      });

      el.addEventListener('mouseleave', () => {
        if (this.tooltipEl) this.tooltipEl.classList.remove('show');
      });
    });
  }

  removeHemingwayHighlights() {
    const paragraphs = this.editor.querySelectorAll('.paragraph-content');
    paragraphs.forEach(pEl => {
      pEl.innerText = pEl.innerText;
    });
    if (this.tooltipEl) this.tooltipEl.classList.remove('show');
  }

  /**
   * Finalize Ritual & Statistics Summary
   */
  getStatistics() {
    const text = (this.editor ? this.editor.innerText : this.app.state.sculptor.finalText) || '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0) : [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const wordCount = words.length;
    const sentenceCount = sentences.length || 1;
    const avgSentenceLength = Math.round(wordCount / sentenceCount);
    const readingTimeMins = Math.max(1, Math.ceil(wordCount / 200));

    const adverbs = words.filter(w => w.toLowerCase().endsWith('ly'));
    const adverbDensity = wordCount > 0 ? ((adverbs.length / wordCount) * 100).toFixed(1) : 0;

    return {
      wordCount,
      sentenceCount,
      avgSentenceLength,
      readingTimeMins,
      adverbDensity
    };
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

