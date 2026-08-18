/*
 * Scripta - Procedural Web Audio Synthesis Engine
 * Provides multiple tactile mechanical keyboard sound signatures
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.volume = 0.35;
    this.soundProfile = 'typewriter'; // 'typewriter', 'creamy', 'clicky', 'membrane'
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  getVolume() {
    return this.volume;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return !this.isMuted;
  }

  setSoundProfile(profile) {
    this.soundProfile = profile || 'typewriter';
  }

  setProfile(profile) {
    this.setSoundProfile(profile);
  }

  getSoundProfile() {
    return this.soundProfile;
  }

  /**
   * Synthesize mechanical keystroke based on the active profile
   */
  playThock(isReturn = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (this.soundProfile === 'creamy') {
      // Creamy Mechanical (Custom Lubed Linear / Holy Panda thock)
      const baseFreq = isReturn ? 110 : (160 + Math.random() * 35);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, t);
      filter.frequency.exponentialRampToValueAtTime(140, t + 0.055);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, t + 0.05);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.055);

    } else if (this.soundProfile === 'clicky') {
      // Clicky Blue Switch (Sharp double-click snap)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(2400 + Math.random() * 300, t);
      osc1.frequency.exponentialRampToValueAtTime(750, t + 0.012);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(320, t + 0.004);
      osc2.frequency.exponentialRampToValueAtTime(120, t + 0.04);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc1.stop(t + 0.012);
      osc2.start(t + 0.004);
      osc2.stop(t + 0.04);

    } else if (this.soundProfile === 'membrane') {
      // Quiet Membrane (Soft cushioned laptop tap)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 + Math.random() * 20, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.035);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.035);

    } else {
      // Vintage Mechanical Typewriter
      const baseFreq = isReturn ? 160 : (240 + Math.random() * 60);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, t + 0.045);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.05);

      // Add metallic hammer transient
      if (!isReturn && Math.random() > 0.35) {
        const metalOsc = this.ctx.createOscillator();
        const metalGain = this.ctx.createGain();
        metalOsc.type = 'sine';
        metalOsc.frequency.setValueAtTime(1500 + Math.random() * 500, t);
        metalGain.gain.setValueAtTime(0.06, t);
        metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
        metalOsc.connect(metalGain);
        metalGain.connect(this.masterGain);
        metalOsc.start(t);
        metalOsc.stop(t + 0.018);
      }
    }
  }

  /**
   * Room 2 (Cutting Room): Card Snap / Click
   */
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();

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
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

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
   */
  playSwell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.85;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(146.83, now); // D3
    osc1.frequency.exponentialRampToValueAtTime(293.66, now + duration * 0.5); // D4
    osc1.frequency.exponentialRampToValueAtTime(146.83, now + duration);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(220.00, now); // A3
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
   */
  playChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    const playHarmonic = (freq, delay, vol, decayTime) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

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

    playHarmonic(440.00, 0, 0.22, 1.8);     // A4
    playHarmonic(659.25, 0.12, 0.16, 1.6);  // E5
    playHarmonic(880.00, 0.26, 0.12, 1.4);  // A5
  }
}

export const audioEngine = new AudioEngine();
