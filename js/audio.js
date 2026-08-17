/*
 * Scripta - Procedural Web Audio Synthesis Engine
 * 
 * Scripta uses real-time Web Audio API synthesis for zero network overhead,
 * zero latency, organic micro-variations, and offline reliability.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.soundEnabled = true;
    this.volume = 0.35; // Default 35% volume
  }

  /**
   * Lazily initialize the WebAudio Context on user gesture.
   */
  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    } else if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  getVolume() {
    return this.volume;
  }

  toggleMute() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  isMuted() {
    return !this.soundEnabled;
  }

  /**
   * Room 1 (Sandbox): Multi-Layer Procedural Mechanical Typewriter "Thock"
   * Includes high-frequency tactile key click + low-frequency resonant wooden desk body + micro-pitch variance.
   */
  playThock(isReturn = false) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    // Micro-pitch variance (±6%) gives dynamic physical realism
    const pitchFactor = 0.94 + Math.random() * 0.12;

    // --- Component 1: High Frequency Mechanical Switch Click ---
    const clickDuration = isReturn ? 0.05 : 0.035;
    const clickBufferSize = Math.floor(this.audioCtx.sampleRate * clickDuration);
    const clickBuffer = this.audioCtx.createBuffer(1, clickBufferSize, this.audioCtx.sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    for (let i = 0; i < clickBufferSize; i++) {
      clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickBufferSize * 0.3));
    }

    const clickSource = this.audioCtx.createBufferSource();
    clickSource.buffer = clickBuffer;

    const clickFilter = this.audioCtx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime((isReturn ? 1800 : 2800) * pitchFactor, now);
    clickFilter.Q.setValueAtTime(3.5, now);

    const clickGain = this.audioCtx.createGain();
    clickGain.gain.setValueAtTime(isReturn ? 0.28 : 0.22, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + clickDuration);

    clickSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);

    clickSource.start(now);
    clickSource.stop(now + clickDuration);

    // --- Component 2: Low-Mid Resonant Body "Thump" ---
    const thumpOsc = this.audioCtx.createOscillator();
    const thumpGain = this.audioCtx.createGain();
    const thumpFilter = this.audioCtx.createBiquadFilter();

    const baseFreq = isReturn ? 95 : 145;
    thumpOsc.type = 'triangle';
    thumpOsc.frequency.setValueAtTime(baseFreq * pitchFactor, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(45 * pitchFactor, now + (isReturn ? 0.08 : 0.05));

    thumpFilter.type = 'lowpass';
    thumpFilter.frequency.setValueAtTime(350, now);

    thumpGain.gain.setValueAtTime(isReturn ? 0.35 : 0.25, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + (isReturn ? 0.08 : 0.05));

    thumpOsc.connect(thumpFilter);
    thumpFilter.connect(thumpGain);
    thumpGain.connect(this.masterGain);

    thumpOsc.start(now);
    thumpOsc.stop(now + (isReturn ? 0.08 : 0.05));
  }

  /**
   * Room 2 (Cutting Room): Card Snap / Paper Slide
   * Sharp crisp snap on card reorder, split, and merge.
   */
  playClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    
    // Quick paper friction snap
    const snapOsc = this.audioCtx.createOscillator();
    const snapGain = this.audioCtx.createGain();
    
    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(920, now);
    snapOsc.frequency.exponentialRampToValueAtTime(160, now + 0.025);

    snapGain.gain.setValueAtTime(0.25, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);

    snapOsc.start(now);
    snapOsc.stop(now + 0.025);
  }

  /**
   * UI Subtle Tap / Toggle Blip
   */
  playBlip() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.03);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Room Transitions: Ambient Dual-Harmonic Swell
   * Harmonious cross-fade sweep with rich warm body.
   */
  playSwell() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const duration = 0.85;

    // Dual harmonically related oscillators (Root + Fifth)
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(146.83, now); // D3
    osc1.frequency.exponentialRampToValueAtTime(293.66, now + duration * 0.5); // D4
    osc1.frequency.exponentialRampToValueAtTime(146.83, now + duration);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(220.00, now); // A3 (Fifth)
    osc2.frequency.exponentialRampToValueAtTime(440.00, now + duration * 0.5); // A4
    osc2.frequency.exponentialRampToValueAtTime(220.00, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(1200, now + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(400, now + duration);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + duration * 0.45);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * Session Completion & Inactivity: Resonant Zen Singing Bowl Chime
   * Pure harmonious chord (A4 + E5 + A5) with natural acoustic decay.
   */
  playChime() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    const playHarmonic = (freq, delay, vol, decayTime) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(vol, now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + decayTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + decayTime);
    };

    playHarmonic(440.00, 0, 0.22, 1.8);     // A4 Fundamental
    playHarmonic(659.25, 0.12, 0.16, 1.6);  // E5 Perfect Fifth
    playHarmonic(880.00, 0.26, 0.12, 1.4);  // A5 Octave
  }
}

export const audioEngine = new SoundEngine();

