export class FacilityAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private humGain: GainNode | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private environmentMode: 'facility' | 'memory' = 'facility';
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;
  private paused = false;
  private started = false;

  public unlockAndStart(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.85;
      this.masterGain.connect(this.ctx.destination);

      // Pre-build a 1-second white noise buffer for footsteps, clicks, and paper rustle
      const sampleRate = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, sampleRate, sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < sampleRate; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    if (!this.started && this.ctx && this.masterGain) {
      this.started = true;
      this.startAmbientHum();
    }
  }

  private startAmbientHum(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 145;
    filter.Q.value = 1.1;

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.0001, now);
    this.humGain.gain.exponentialRampToValueAtTime(
      this.paused ? 0.0001 : 0.042,
      now + 1.8
    );

    this.humOsc1 = this.ctx.createOscillator();
    this.humOsc1.type = 'sine';
    this.humOsc1.frequency.value = 54;

    this.humOsc2 = this.ctx.createOscillator();
    this.humOsc2.type = 'triangle';
    this.humOsc2.frequency.value = 108.4;

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.25;

    this.humOsc1.connect(filter);
    this.humOsc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.masterGain);

    this.humOsc1.start(now);
    this.humOsc2.start(now);

    // Pre-start soft low-passed ambient rain loop (silent while in facility)
    if (this.noiseBuffer) {
      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.value = 620;
      rainFilter.Q.value = 0.6;

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.0001, now);

      this.rainSource = this.ctx.createBufferSource();
      this.rainSource.buffer = this.noiseBuffer;
      this.rainSource.loop = true;

      this.rainSource.connect(rainFilter);
      rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);
      this.rainSource.start(now);
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : 0.85,
        this.ctx.currentTime,
        0.04
      );
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private syncAmbientGains(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const isMemory = this.environmentMode === 'memory';
    if (this.humGain) {
      const targetHum = this.paused
        ? 0.002
        : isMemory
          ? 0.0005
          : 0.042;
      this.humGain.gain.setTargetAtTime(targetHum, now, 0.25);
    }
    if (this.rainGain) {
      const targetRain = this.paused
        ? 0.001
        : isMemory
          ? 0.028
          : 0.0002;
      this.rainGain.gain.setTargetAtTime(targetRain, now, 0.28);
    }
  }

  public setPaused(paused: boolean): void {
    this.paused = paused;
    this.syncAmbientGains();
  }

  public setEnvironmentMode(mode: 'facility' | 'memory'): void {
    this.environmentMode = mode;
    this.syncAmbientGains();
  }

  public playFlashlightClick(on: boolean): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(on ? 1750 : 1280, now);
    osc.frequency.exponentialRampToValueAtTime(on ? 920 : 620, now + 0.028);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  public playFootstep(): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer || this.muted) {
      return;
    }
    const now = this.ctx.currentTime;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 0.92 + Math.random() * 0.16;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 210 + Math.random() * 45;
    filter.Q.value = 1.4;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    src.start(now);
    src.stop(now + 0.11);
  }

  public playTerminalBeep(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    const freqs = [660, 880];
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + idx * 0.075;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  public playPaperRustle(): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer || this.muted) {
      return;
    }
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.025, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
    src.stop(now + 0.18);
  }

  public playSightingCue(flickerOut: boolean): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    // Subtle electrical relay thump + low sub resonance (no loud jump scare)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(flickerOut ? 92 : 64, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.55);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.75);
  }

  public playObjectiveComplete(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + idx * 0.085;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.032, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  public playEvidenceCollected(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.09);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playAccessCardPickup(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const notes = [880, 1174.66];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.038, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.13);
    });
  }

  public playAccessDenied(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const notes = [190, 155];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.095);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.11);
    });
  }

  public playAccessGranted(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    // Electronic unlock chime
    const notes = [587.33, 880, 1174.66];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.15);
    });

    // Subtle mechanical pneumatic door slide noise
    if (this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(140, now + 0.85);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + 0.12);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      src.start(now + 0.12);
      src.stop(now + 0.92);
    }
  }

  public playMemoryTransition(entering: boolean): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(entering ? 110 : 220, now);
    osc.frequency.exponentialRampToValueAtTime(entering ? 240 : 72, now + 0.55);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.65);
  }

  public playClockTickSequence(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    // Unnatural 3-tick loop at identical cadence
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.22;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1180, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.025);
      gain.gain.setValueAtTime(0.048, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.045);
    }
  }

  public playPhotoShiftCue(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(185, now);
    osc.frequency.exponentialRampToValueAtTime(92, now + 0.45);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.052, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  public playPhoneRingStatic(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    // Short metallic ring pulse followed by cold line static
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(465, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);

    if (this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1450;
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.025, now + 0.25);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      src.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);
      src.start(now + 0.25);
      src.stop(now + 0.68);
    }
  }

  public playObserverShift(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + 0.75);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  public playMemoryCollapse(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    // Brief ambient stutter + resonant low drop
    if (this.rainGain) {
      this.rainGain.gain.setValueAtTime(0.002, now);
      this.rainGain.gain.setValueAtTime(0.032, now + 0.14);
      this.rainGain.gain.setValueAtTime(0.001, now + 0.28);
      this.rainGain.gain.setValueAtTime(0.0002, now + 0.45);
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(118, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 1.4);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.085, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.55);
  }

  public dispose(): void {
    try {
      this.humOsc1?.stop();
      this.humOsc2?.stop();
      this.rainSource?.stop();
    } catch {
      // Ignore already-stopped oscillators
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.started = false;
  }
}
