/*
 * Scripta - Master Application Controller & Router
 * 
 * Orchestrates room transitions, spatial navigation, global keyboard shortcuts,
 * audio engine settings, auto-recovery, and modal interactions.
 */

import { audioEngine } from './audio.js';
import { storageEngine } from './storage.js';
import { SandboxRoom } from './rooms/sandbox.js';
import { CuttingRoom } from './rooms/cuttingRoom.js';
import { SculptorRoom } from './rooms/sculptor.js';
import { SaveModal } from './modals/saveModal.js';
import { TransitionModal } from './modals/transitionModal.js';
import { getRandomPrompt } from './data/prompts.js';

class ScriptaApp {
  constructor() {
    this.state = {
      workingQuestion: '',
      currentRoom: 'threshold',
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        futureNote: ''
      },
      sandbox: {
        rawText: '',
        sessionDuration: 900,
        sessionCount: 1
      },
      cuttingRoom: {
        cards: []
      },
      sculptor: {
        finalText: '',
        hemingwayUsed: false,
        readAloudUsed: false
      },
      settings: {
        fontSize: 18,
        soundEnabled: true,
        volume: 0.35,
        timerDuration: 900,
        highContrast: false,
        dyslexiaFont: false
      }
    };

    // Sub-module instances
    this.sandboxRoom = null;
    this.cuttingRoom = null;
    this.sculptorRoom = null;
    this.saveModal = null;
    this.transitionModal = null;
  }

  init() {
    // Load saved settings
    const savedSettings = storageEngine.loadSettings();
    if (savedSettings) {
      this.state.settings = { ...this.state.settings, ...savedSettings };
    }

    this.applySettings();

    this.sandboxRoom = new SandboxRoom(this);
    this.cuttingRoom = new CuttingRoom(this);
    this.sculptorRoom = new SculptorRoom(this);
    this.saveModal = new SaveModal(this);
    this.transitionModal = new TransitionModal(this);

    this.bindHeaderUI();
    this.bindThresholdUI();
    this.bindSettingsUI();
    this.bindShortcuts();
    this.checkAutoRecovery();
  }

  applySettings() {
    const s = this.state.settings;
    if (s.soundEnabled !== undefined) {
      if (s.soundEnabled !== !audioEngine.isMuted()) {
        audioEngine.soundEnabled = s.soundEnabled;
      }
    }
    if (s.volume !== undefined) {
      audioEngine.setVolume(s.volume);
    }
    if (s.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    if (s.dyslexiaFont) {
      document.body.classList.add('dyslexia-font');
    } else {
      document.body.classList.remove('dyslexia-font');
    }
    if (s.fontSize) {
      document.documentElement.style.setProperty('--font-size-base', `${s.fontSize}px`);
    }

    this.updateAudioIcons();
  }

  updateAudioIcons() {
    const isMuted = audioEngine.isMuted();
    const iconOn = document.getElementById('icon-audio-on');
    const iconOff = document.getElementById('icon-audio-off');
    const audioBtn = document.getElementById('btn-toggle-audio');

    if (iconOn && iconOff) {
      if (isMuted) {
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
        if (audioBtn) audioBtn.title = "Unmute Audio (Alt+M)";
      } else {
        iconOn.classList.remove('hidden');
        iconOff.classList.add('hidden');
        if (audioBtn) audioBtn.title = "Mute Audio (Alt+M)";
      }
    }
  }

  /**
   * Check for crash auto-recovery snapshot in localStorage.
   */
  checkAutoRecovery() {
    const recovered = storageEngine.getAutoRecovery();
    if (recovered && recovered.sandbox && recovered.sandbox.rawText) {
      if (confirm("Scripta detected a previous un-saved drafting session. Would you like to recover your work?")) {
        this.state = recovered;
        if (this.state.settings) {
          this.applySettings();
        }
        if (this.state.workingQuestion) {
          this.setWorkingQuestion(this.state.workingQuestion);
        }
        this.switchRoom(this.state.currentRoom || 'sandbox');
      } else {
        storageEngine.clearAutoRecovery();
      }
    }
  }

  saveAutoRecovery() {
    storageEngine.saveAutoRecovery(this.state);
  }

  /**
   * Bind Threshold Room UI (The First Launch Question & Warm-Up Prompt)
   */
  bindThresholdUI() {
    const questionInput = document.getElementById('threshold-question-input');
    const startBtn = document.getElementById('btn-start-session');
    const warmupPromptBox = document.getElementById('warmup-prompt-box');
    const warmupText = document.getElementById('warmup-text');

    if (startBtn && questionInput) {
      const handleStart = () => {
        const qText = questionInput.value.trim();
        if (!qText) {
          questionInput.focus();
          this.showNotification("Prompt Required", "Please state your core question or intent before entering the Sandbox.");
          return;
        }
        audioEngine.playBlip();
        this.setWorkingQuestion(qText);
        this.switchRoom('sandbox');
      };

      startBtn.addEventListener('click', handleStart);
      questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleStart();
      });
    }

    if (warmupPromptBox) {
      warmupPromptBox.addEventListener('click', () => {
        audioEngine.playBlip();
        const promptText = getRandomPrompt();
        if (warmupText) {
          warmupText.innerHTML = `<strong>Exercise:</strong> "${promptText}"`;
        }
      });
    }
  }

  setWorkingQuestion(questionText) {
    this.state.workingQuestion = questionText;
    const displayEl = document.getElementById('working-question-display');
    if (displayEl) {
      displayEl.innerText = `Q: ${questionText}`;
      displayEl.title = questionText;
    }
  }

  /**
   * Room Navigation Router
   */
  switchRoom(targetRoom) {
    if (this.state.currentRoom === targetRoom) return;

    // Deactivate previous room
    if (this.state.currentRoom === 'sandbox') this.sandboxRoom.deactivate();
    if (this.state.currentRoom === 'cutting') this.cuttingRoom.deactivate();
    if (this.state.currentRoom === 'sculptor') this.sculptorRoom.deactivate();

    // Play room transition swell sound
    audioEngine.playSwell();

    // Update body theme attribute
    document.body.setAttribute('data-room', targetRoom);
    this.state.currentRoom = targetRoom;

    // Toggle active container visibility
    document.querySelectorAll('.room-container').forEach(el => el.classList.remove('active-room'));
    const targetEl = document.getElementById(`room-${targetRoom}`);
    if (targetEl) targetEl.classList.add('active-room');

    // Update top header room tabs
    document.querySelectorAll('.room-tab').forEach(tab => {
      const tabRoom = tab.dataset.room;
      tab.classList.toggle('active', tabRoom === targetRoom);

      // Unlock tabs progressively
      if (targetRoom === 'cutting' && tabRoom === 'cutting') tab.classList.remove('disabled');
      if (targetRoom === 'sculptor') {
        if (tabRoom === 'cutting' || tabRoom === 'sculptor') tab.classList.remove('disabled');
      }
    });

    // Activate target room modules
    if (targetRoom === 'sandbox') this.sandboxRoom.activate();
    if (targetRoom === 'cutting') this.cuttingRoom.activate();
    if (targetRoom === 'sculptor') this.sculptorRoom.activate();

    this.saveAutoRecovery();
  }

  /**
   * Header UI Controls (Audio, Open/Save, Settings, Help)
   */
  bindHeaderUI() {
    const audioBtn = document.getElementById('btn-toggle-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isEnabled = audioEngine.toggleMute();
        this.state.settings.soundEnabled = isEnabled;
        storageEngine.saveSettings(this.state.settings);
        this.updateAudioIcons();
        if (isEnabled) audioEngine.playBlip();
      });
    }

    const saveBtn = document.getElementById('btn-save-project');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveModal.open());
    }

    const openBtn = document.getElementById('btn-open-project');
    if (openBtn) {
      openBtn.addEventListener('click', async () => {
        audioEngine.playBlip();
        const data = await storageEngine.openProject();
        if (data) {
          this.state = data;
          if (data.settings) {
            this.applySettings();
          }
          if (data.metadata && data.metadata.futureNote) {
            SaveModal.showFutureNoteNotice(data.metadata, () => {
              this.loadProjectState();
            });
          } else {
            this.loadProjectState();
          }
        }
      });
    }

    const brandLogo = document.getElementById('brand-logo');
    if (brandLogo) {
      brandLogo.addEventListener('click', () => {
        audioEngine.playBlip();
        if (this.state.currentRoom !== 'threshold') {
          if (confirm("Return to The Threshold? (Your drafting progress is preserved)")) {
            this.switchRoom('threshold');
          }
        }
      });
    }

    // Room tab direct click handlers (when enabled)
    document.querySelectorAll('.room-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('disabled')) return;
        const target = tab.dataset.room;
        if (target) this.switchRoom(target);
      });
    });

    // Room transition button triggers
    const leaveSandboxBtn = document.getElementById('btn-leave-sandbox');
    if (leaveSandboxBtn) {
      leaveSandboxBtn.addEventListener('click', () => {
        this.transitionModal.showSandboxExitModal(() => {
          this.switchRoom('cutting');
        });
      });
    }

    const proceedSculptorBtn = document.getElementById('btn-proceed-sculptor');
    if (proceedSculptorBtn) {
      proceedSculptorBtn.addEventListener('click', () => {
        this.transitionModal.showCuttingExitModal(() => {
          this.switchRoom('sculptor');
        });
      });
    }

    const finalizeBtn = document.getElementById('btn-finalize-sculptor');
    if (finalizeBtn) {
      finalizeBtn.addEventListener('click', () => {
        const stats = this.sculptorRoom.getStatistics();
        this.transitionModal.showFinalizeModal(stats);
      });
    }
  }

  bindSettingsUI() {
    const settingsModal = document.getElementById('modal-settings');
    const openSettingsBtn = document.getElementById('btn-open-settings');
    const closeSettingsBtn = document.getElementById('btn-close-settings');

    const volumeSlider = document.getElementById('setting-audio-volume');
    const volumeDisplay = document.getElementById('volume-val-display');
    const timerDurationSelect = document.getElementById('setting-timer-duration');
    const fontSizeSlider = document.getElementById('setting-font-size');
    const fontSizeDisplay = document.getElementById('fontsize-val-display');
    const dyslexiaToggle = document.getElementById('setting-dyslexia-font');
    const contrastToggle = document.getElementById('setting-high-contrast');

    const shortcutsModal = document.getElementById('modal-shortcuts');
    const openHelpBtn = document.getElementById('btn-open-help');
    const closeShortcutsBtn = document.getElementById('btn-close-shortcuts');

    if (openSettingsBtn && settingsModal) {
      openSettingsBtn.addEventListener('click', () => {
        audioEngine.playBlip();
        // Sync values to UI
        if (volumeSlider) volumeSlider.value = this.state.settings.volume || 0.35;
        if (volumeDisplay) volumeDisplay.innerText = `${Math.round((this.state.settings.volume || 0.35) * 100)}%`;
        if (timerDurationSelect) timerDurationSelect.value = this.state.settings.timerDuration || 900;
        if (fontSizeSlider) fontSizeSlider.value = this.state.settings.fontSize || 18;
        if (fontSizeDisplay) fontSizeDisplay.innerText = `${this.state.settings.fontSize || 18}px`;
        if (dyslexiaToggle) dyslexiaToggle.checked = !!this.state.settings.dyslexiaFont;
        if (contrastToggle) contrastToggle.checked = !!this.state.settings.highContrast;

        settingsModal.classList.add('open');
      });
    }

    if (closeSettingsBtn && settingsModal) {
      closeSettingsBtn.addEventListener('click', () => {
        audioEngine.playBlip();
        settingsModal.classList.remove('open');
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.settings.volume = val;
        audioEngine.setVolume(val);
        if (volumeDisplay) volumeDisplay.innerText = `${Math.round(val * 100)}%`;
        storageEngine.saveSettings(this.state.settings);
      });
      volumeSlider.addEventListener('change', () => {
        audioEngine.playThock();
      });
    }

    if (timerDurationSelect) {
      timerDurationSelect.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.settings.timerDuration = val;
        if (this.sandboxRoom) {
          this.sandboxRoom.timerDuration = val;
          this.sandboxRoom.timeRemaining = val;
        }
        storageEngine.saveSettings(this.state.settings);
        audioEngine.playBlip();
      });
    }

    if (fontSizeSlider) {
      fontSizeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.settings.fontSize = val;
        document.documentElement.style.setProperty('--font-size-base', `${val}px`);
        if (fontSizeDisplay) fontSizeDisplay.innerText = `${val}px`;
        storageEngine.saveSettings(this.state.settings);
      });
    }

    if (dyslexiaToggle) {
      dyslexiaToggle.addEventListener('change', (e) => {
        this.state.settings.dyslexiaFont = e.target.checked;
        document.body.classList.toggle('dyslexia-font', e.target.checked);
        storageEngine.saveSettings(this.state.settings);
        audioEngine.playBlip();
      });
    }

    if (contrastToggle) {
      contrastToggle.addEventListener('change', (e) => {
        this.state.settings.highContrast = e.target.checked;
        document.body.classList.toggle('high-contrast', e.target.checked);
        storageEngine.saveSettings(this.state.settings);
        audioEngine.playBlip();
      });
    }

    if (openHelpBtn && shortcutsModal) {
      openHelpBtn.addEventListener('click', () => {
        audioEngine.playBlip();
        shortcutsModal.classList.add('open');
      });
    }

    if (closeShortcutsBtn && shortcutsModal) {
      closeShortcutsBtn.addEventListener('click', () => {
        audioEngine.playBlip();
        shortcutsModal.classList.remove('open');
      });
    }
  }

  loadProjectState() {
    if (this.state.workingQuestion) {
      this.setWorkingQuestion(this.state.workingQuestion);
    }
    this.switchRoom(this.state.currentRoom || 'sandbox');
  }

  /**
   * Global Keyboard Shortcuts Engine
   */
  bindShortcuts() {
    window.addEventListener('keydown', (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;

      // Close any open modals on Escape
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(modal => {
          modal.classList.remove('open');
        });
        return;
      }

      // Show Shortcuts modal on '?'
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        const shortcutsModal = document.getElementById('modal-shortcuts');
        if (shortcutsModal) {
          shortcutsModal.classList.toggle('open');
          audioEngine.playBlip();
        }
        return;
      }

      // Alt+M: Toggle Audio Mute
      if (isAlt && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const isEnabled = audioEngine.toggleMute();
        this.state.settings.soundEnabled = isEnabled;
        storageEngine.saveSettings(this.state.settings);
        this.updateAudioIcons();
        if (isEnabled) audioEngine.playBlip();
        return;
      }

      // Ctrl+S: Save Ritual
      if (isCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.saveModal.open();
        return;
      }

      // Ctrl+O: Open Project
      if (isCtrl && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        document.getElementById('btn-open-project')?.click();
        return;
      }

      // Ctrl+E: Exit Sandbox
      if (isCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (this.state.currentRoom === 'sandbox') {
          this.transitionModal.showSandboxExitModal(() => this.switchRoom('cutting'));
        }
        return;
      }

      // Ctrl+L: Jump to card label in Cutting Room
      if (isCtrl && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (this.state.currentRoom === 'cutting') {
          const firstInput = document.querySelector('.card-label-input');
          if (firstInput) firstInput.focus();
        }
        return;
      }

      // Ctrl+R: Read Aloud in Sculptor
      if (isCtrl && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (this.state.currentRoom === 'sculptor') {
          this.sculptorRoom.toggleReadAloud();
        }
        return;
      }

      // Ctrl+H: Hemingway Mode in Sculptor
      if (isCtrl && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        if (this.state.currentRoom === 'sculptor') {
          this.sculptorRoom.toggleHemingwayMode();
        }
        return;
      }

      // F11: Fullscreen Focus Mode
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    });
  }

  showNotification(title, message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      background: var(--bg-surface); color: var(--text-primary);
      border: 1px solid var(--border-color); border-left: 4px solid var(--accent-color);
      padding: 14px 20px; border-radius: 10px; box-shadow: 0 12px 32px rgba(0,0,0,0.35);
      z-index: 2000; font-size: 0.9rem; max-width: 320px;
      transition: opacity 0.35s ease, transform 0.35s ease;
      transform: translateY(0);
    `;
    toast.innerHTML = `<strong>${title}</strong><div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 3px;">${message}</div>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (toast.parentNode) document.body.removeChild(toast);
      }, 350);
    }, 3500);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const app = new ScriptaApp();
  app.init();
});

