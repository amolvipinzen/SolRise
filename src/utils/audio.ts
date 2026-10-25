// A tiny Web Audio synthesizer for soft, warm feedback sounds without loading audio assets.
const MUTE_KEY = 'solrise_muted';

class SoundEffects {
  private ctx: AudioContext | null = null;
  private muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      // storage blocked
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      // storage blocked
    }
  }

  private init() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  // One soft bell-like note with a gentle attack and long tail
  private tone(freq: number, start: number, duration: number, volume = 0.12, type: OscillatorType = 'sine') {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  // Task completed: a bright two-note "ding"
  playComplete() {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.tone(880, now, 0.35, 0.1);
    this.tone(1318.5, now + 0.07, 0.55, 0.09);
    this.tone(2637, now + 0.07, 0.25, 0.02);
  }

  // Task created: a soft bubbly pop
  playPop() {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Page turn: a short rustle of filtered noise sweeping across, like paper sliding
  playPageTurn() {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    const length = Math.floor(ctx.sampleRate * 0.45);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(4200, now + 0.32);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.45);
  }

  // Light UI tap
  playTap() {
    const ctx = this.init();
    if (!ctx) return;
    this.tone(1200, ctx.currentTime, 0.06, 0.04, 'triangle');
  }

  // Undo / un-complete: a gentle downward pair
  playUndo() {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.tone(660, now, 0.18, 0.06);
    this.tone(494, now + 0.08, 0.25, 0.05);
  }

  // Whole day done: a warm rising major arpeggio
  playDayComplete() {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(f, now + i * 0.11, 1.2 - i * 0.1, 0.08));
    this.tone(261.63, now, 1.6, 0.05, 'triangle');
  }

  // Level up: a sparkling fanfare
  playLevelUp() {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    [392, 523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, now + i * 0.08, 0.3, 0.08, 'triangle'));
    [1046.5, 1318.5, 1567.98].forEach(f => this.tone(f, now + 0.36, 1.1, 0.06));
  }

  // Streak milestone: quick rising shimmer
  playStreak() {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    [659.25, 783.99, 987.77, 1318.5, 1567.98, 1975.5].forEach((f, i) => this.tone(f, now + i * 0.045, 0.4, 0.06));
  }

  // Reminder: two soft chimes
  playAlert() {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.tone(784, now, 0.4, 0.09);
    this.tone(784, now + 0.25, 0.5, 0.09);
  }
}

export const soundEffects = new SoundEffects();

export const haptic = (pattern: number | number[] = 12) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // unsupported
  }
};
