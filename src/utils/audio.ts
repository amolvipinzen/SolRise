// A web-audio synthesizer helper to play nostalgic, 8-bit gamified sounds without loading heavy assets.
class SoundEffects {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      // Create audio context on user interaction
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a simple coin/chime sound (task completion)
  playChime() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5
    osc1.frequency.setValueAtTime(1046.50, now + 0.24); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(523.25, now);
    osc2.frequency.setValueAtTime(659.25, now + 0.08);
    osc2.frequency.setValueAtTime(783.99, now + 0.16);
    osc2.frequency.setValueAtTime(1046.50, now + 0.24);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  // Play an epic fanfare sound (level up!)
  playLevelUp() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    const noteDuration = 0.08;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

      // Final chord lingers
      const dur = idx === notes.length - 1 ? 0.6 : noteDuration;
      gainNode.gain.setValueAtTime(0.08, now + idx * noteDuration);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * noteDuration + dur);

      osc.connect(gainNode);
      gainNode.connect(this.ctx!.destination);

      osc.start(now + idx * noteDuration);
      osc.stop(now + idx * noteDuration + dur);
    });
  }

  // Play a cool streak sound (fast arpeggio rising up)
  playStreak() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51]; // G4, C5, E5, G5, C6, E6
    const noteDuration = 0.05;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

      const dur = idx === notes.length - 1 ? 0.45 : noteDuration;
      gainNode.gain.setValueAtTime(0.1, now + idx * noteDuration);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * noteDuration + dur);

      osc.connect(gainNode);
      gainNode.connect(this.ctx!.destination);

      osc.start(now + idx * noteDuration);
      osc.stop(now + idx * noteDuration + dur);
    });
  }

  // Play an alert sound (upcoming task deadline)
  playAlert() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.linearRampToValueAtTime(880, now + 0.15); // Slide to A5
    osc.frequency.linearRampToValueAtTime(440, now + 0.3); // Slide back

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

export const soundEffects = new SoundEffects();
