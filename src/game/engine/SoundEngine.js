// ============================================================
// NULL//TRACE — Sound Engine
// Web Audio API procedural sounds — fully offline
// ============================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.enabled = true;
    this.musicEnabled = true;
    this.ambientOsc = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.7;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = 0.7;

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = 0.3;

      this.initialized = true;
    } catch (e) {
      console.warn('[SoundEngine] Web Audio not available');
    }
  }

  resume() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSfxVolume(v) {
    if (this.sfxGain) this.sfxGain.gain.value = v;
  }

  setMusicVolume(v) {
    if (this.musicGain) this.musicGain.gain.value = v;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) this.stopAmbient();
  }

  // ── SFX ──────────────────────────────────────────────────

  _playTone(freq, duration, type = 'square', gainValue = 0.15) {
    if (!this.initialized || !this.enabled) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playKeypress() {
    this._playTone(800 + Math.random() * 400, 0.04, 'square', 0.06);
  }

  playSubmit() {
    this._playTone(600, 0.08, 'square', 0.1);
    setTimeout(() => this._playTone(900, 0.08, 'square', 0.1), 80);
  }

  playSuccess() {
    this._playTone(523, 0.15, 'sine', 0.15);
    setTimeout(() => this._playTone(659, 0.15, 'sine', 0.15), 120);
    setTimeout(() => this._playTone(784, 0.2, 'sine', 0.15), 240);
  }

  playError() {
    this._playTone(200, 0.15, 'sawtooth', 0.12);
    setTimeout(() => this._playTone(150, 0.2, 'sawtooth', 0.12), 150);
  }

  playAlert() {
    this._playTone(880, 0.1, 'square', 0.1);
    setTimeout(() => this._playTone(880, 0.1, 'square', 0.1), 200);
    setTimeout(() => this._playTone(880, 0.1, 'square', 0.1), 400);
  }

  playAchievement() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      setTimeout(() => this._playTone(f, 0.2, 'sine', 0.12), i * 120);
    });
  }

  playPacket() {
    this._playTone(1200, 0.05, 'sine', 0.08);
  }

  playMissionComplete() {
    const melody = [523, 659, 784, 659, 784, 1047];
    melody.forEach((f, i) => {
      setTimeout(() => this._playTone(f, 0.25, 'sine', 0.15), i * 180);
    });
  }

  playClue() {
    this._playTone(440, 0.1, 'triangle', 0.1);
    setTimeout(() => this._playTone(550, 0.15, 'triangle', 0.1), 100);
  }

  playTimerWarning() {
    this._playTone(440, 0.3, 'square', 0.08);
  }

  // ── Ambient ──────────────────────────────────────────────

  startAmbient() {
    if (!this.initialized || !this.musicEnabled || this.ambientOsc) return;
    this.resume();

    // Low drone
    this.ambientOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.value = 55;
    gain.gain.value = 0.04;
    this.ambientOsc.connect(gain);
    gain.connect(this.musicGain);
    this.ambientOsc.start();

    // Very subtle modulation
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientOsc.frequency);
    lfo.start();

    this._ambientNodes = [this.ambientOsc, gain, lfo, lfoGain];
  }

  stopAmbient() {
    if (this.ambientOsc) {
      try { this.ambientOsc.stop(); } catch (e) {}
      this.ambientOsc = null;
    }
    this._ambientNodes = [];
  }

  // ── Cleanup ──────────────────────────────────────────────

  destroy() {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

// Singleton
export const soundEngine = new SoundEngine();
export default SoundEngine;
