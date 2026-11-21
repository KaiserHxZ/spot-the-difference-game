// audio.js — every sound in the game, made by WebAudio oscillators.
//
// No audio files, no network: each effect is a short envelope over one or
// two sine/triangle waves. The game creates one Sounds object and calls its
// methods; nothing here touches the DOM.

export class Sounds {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  // Browsers only let audio start after a user gesture, so the context is
  // created lazily on the first call that follows a click or a keypress.
  ensureContext() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return true;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // One note: a sine or triangle wave that fades out over `duration`.
  note(frequency, startAt, duration, volume, type = 'sine') {
    if (this.muted || !this.ensureContext()) return;
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    const t0 = ctx.currentTime + startAt;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  // A found difference: a bright two-note chime, high note first.
  found() {
    this.note(880, 0, 0.22, 0.16, 'sine');
    this.note(1318.5, 0.09, 0.3, 0.14, 'sine');
  }

  // A wrong click: one soft low blip, gentle on purpose — no punishment sound.
  wrong() {
    this.note(196, 0, 0.18, 0.07, 'triangle');
  }

  // A hint: a quick shimmer upward.
  hint() {
    this.note(1046.5, 0, 0.12, 0.08, 'sine');
    this.note(1568, 0.07, 0.18, 0.07, 'sine');
  }

  // A round cleared: a small rising arpeggio.
  roundClear() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.note(f, i * 0.11, 0.28, 0.13, 'triangle'));
  }

  // The whole game won: a longer fanfare.
  win() {
    [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) =>
      this.note(f, i * 0.13, 0.32, 0.13, 'triangle'));
  }

  // The last ten seconds: a quiet tick each second.
  tick() {
    this.note(1200, 0, 0.05, 0.05, 'sine');
  }

  // Time ran out: a low two-note sigh.
  timeUp() {
    this.note(392, 0, 0.3, 0.1, 'triangle');
    this.note(311.13, 0.22, 0.45, 0.1, 'triangle');
  }
}
