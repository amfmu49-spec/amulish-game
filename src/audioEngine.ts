// AudioEngine - music playback + synth SFX only
export class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private _currentTime = 0;
  private beatInterval: ReturnType<typeof setInterval> | null = null;
  private onTime: ((t: number) => void) | null = null;

  setOnTime(fn: (t: number) => void) { this.onTime = fn; }

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  loadMusic(url: string) {
    if (this.audio) { this.audio.pause(); this.audio.src = ''; }
    this.stopPresetBeat();
    this.audio = new Audio(url);
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this._currentTime = this.audio.currentTime * 1000;
        this.onTime?.(this._currentTime);
      }
    });
    this.audio.play().catch(() => {});
  }

  setPresetBeat(bpm: number) {
    if (this.audio) { this.audio.pause(); this.audio = null; }
    this.stopPresetBeat();
    this._currentTime = 0;
    const interval = (60 / bpm) * 1000;
    const start = performance.now();
    const tick = () => {
      this._currentTime = performance.now() - start;
      this.onTime?.(this._currentTime);
      this._beep(220 + Math.random() * 40, 0.05, 0.04);
    };
    this.beatInterval = setInterval(tick, interval);
  }

  stopPresetBeat() {
    if (this.beatInterval) { clearInterval(this.beatInterval); this.beatInterval = null; }
  }

  private _beep(freq: number, vol: number, dur: number) {
    try {
      const c = this.getCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g); g.connect(c.destination);
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      osc.start(); osc.stop(c.currentTime + dur);
    } catch {}
  }

  playShotSound() { this._beep(1400, 0.03, 0.018); }

  playHitSound() {
    try {
      const c = this.getCtx();
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.04), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * 0.6;
      const src = c.createBufferSource();
      const g = c.createGain();
      src.buffer = buf; src.connect(g); g.connect(c.destination);
      g.gain.value = 0.3; src.start();
    } catch {}
  }

  playExplodeSound() {
    try {
      const c = this.getCtx();
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.12), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = c.createBufferSource();
      const g = c.createGain();
      const f = c.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 700;
      src.buffer = buf; src.connect(f); f.connect(g); g.connect(c.destination);
      g.gain.value = 0.5; src.start();
    } catch {}
  }

  playComboSound(combo: number) {
    const freqs = [523, 659, 784, 1047, 1319];
    this._beep(freqs[Math.min(Math.floor(combo / 20), freqs.length - 1)], 0.12, 0.1);
  }

  resume() { this.getCtx().resume().catch(() => {}); }
  pause() { this.audio?.pause(); this.stopPresetBeat(); }
  seek(ms: number) { if (this.audio) this.audio.currentTime = ms / 1000; }
  currentTime() { return this._currentTime; }
}
