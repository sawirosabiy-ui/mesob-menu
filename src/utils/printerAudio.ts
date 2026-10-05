/**
 * Thermal Printer Web Audio API Synthesizer
 * Generates tactile, low-volume, realistic POS thermal printer sound effects
 * entirely client-side with zero external assets or network dependencies.
 */

export class ThermalPrinterAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private motorGain: GainNode | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorNoise: AudioBufferSourceNode | null = null;
  private isMotorRunning: boolean = false;

  constructor() {
    // Check if user previously muted
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('mesob_printer_muted');
      if (savedMute === 'true') {
        this.isMuted = true;
      }

      // Automatically unlock audio context on first mobile user interaction
      const unlock = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        } else if (!this.ctx) {
          this.getContext();
        }
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('touchend', unlock);
        window.removeEventListener('click', unlock);
      };

      window.addEventListener('touchstart', unlock, { passive: true, once: true });
      window.addEventListener('touchend', unlock, { passive: true, once: true });
      window.addEventListener('click', unlock, { passive: true, once: true });
    }
  }

  public unlockAudio() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    } else {
      this.getContext();
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mesob_printer_muted', muted ? 'true' : 'false');
    }
    if (muted && this.isMotorRunning) {
      this.stopMotorFeed();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * 1. Startup Click / Motor Engagement
   * Crisp mechanical relay snap + slight low-frequency motor pickup
   */
  public playStartupClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Relay impulse (high-frequency mechanical tick)
    const tickOsc = ctx.createOscillator();
    const tickGain = ctx.createGain();
    const tickFilter = ctx.createBiquadFilter();

    tickFilter.type = 'bandpass';
    tickFilter.frequency.setValueAtTime(2400, t);
    tickFilter.Q.setValueAtTime(4, t);

    tickOsc.type = 'triangle';
    tickOsc.frequency.setValueAtTime(1800, t);
    tickOsc.frequency.exponentialRampToValueAtTime(300, t + 0.035);

    tickGain.gain.setValueAtTime(0.09, t);
    tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    tickOsc.connect(tickFilter);
    tickFilter.connect(tickGain);
    tickGain.connect(ctx.destination);

    tickOsc.start(t);
    tickOsc.stop(t + 0.045);

    // Motor initial tension hum
    const motorSub = ctx.createOscillator();
    const subGain = ctx.createGain();

    motorSub.type = 'sine';
    motorSub.frequency.setValueAtTime(85, t);
    motorSub.frequency.linearRampToValueAtTime(120, t + 0.08);

    subGain.gain.setValueAtTime(0.04, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    motorSub.connect(subGain);
    subGain.connect(ctx.destination);

    motorSub.start(t);
    motorSub.stop(t + 0.095);
  }

  /**
   * 2 & 3. Start Motor Feed Sound (Thermal Stepper "brrrrrr")
   * Stepper motor pulse wave (140-160Hz) with gentle paper friction noise
   */
  public startMotorFeed() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    if (this.isMotorRunning) return;

    this.isMotorRunning = true;
    const t = ctx.currentTime;

    // Master motor gain for smooth attack/decay
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, t);
    // Smooth fade in over 25ms to avoid click
    masterGain.gain.linearRampToValueAtTime(0.085, t + 0.03);

    // 1. Stepper Motor Fundamental (Square/Sawtooth with filter)
    const stepperOsc = ctx.createOscillator();
    stepperOsc.type = 'sawtooth';
    stepperOsc.frequency.setValueAtTime(155, t); // Characteristic POS stepper pitch

    // Low-pass filter to give realistic plastic casing resonance
    const stepperFilter = ctx.createBiquadFilter();
    stepperFilter.type = 'lowpass';
    stepperFilter.frequency.setValueAtTime(950, t);
    stepperFilter.Q.setValueAtTime(2.5, t);

    // Subtle stepper pulse AM (Amplitude Modulation at 32Hz for stepper gear notches)
    const amOsc = ctx.createOscillator();
    const amGain = ctx.createGain();
    amOsc.type = 'square';
    amOsc.frequency.setValueAtTime(32, t);
    amGain.gain.setValueAtTime(0.025, t);

    amOsc.connect(amGain.gain);
    stepperOsc.connect(stepperFilter);
    stepperFilter.connect(masterGain);

    // 2. Paper sliding friction noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, t);
    noiseFilter.Q.setValueAtTime(2.0, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.035, t);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    stepperOsc.start(t);
    amOsc.start(t);
    noiseSource.start(t);

    this.motorOsc = stepperOsc;
    this.motorNoise = noiseSource;
    this.motorGain = masterGain;
  }

  /**
   * 4. Stop Motor Feed Sound (for pauses and finish)
   * Smoothly ramps down gain to prevent pops
   */
  public stopMotorFeed() {
    if (!this.isMotorRunning || !this.ctx || !this.motorGain) {
      this.isMotorRunning = false;
      return;
    }

    const ctx = this.ctx;
    const t = ctx.currentTime;

    // Smooth ramp down over 25ms
    this.motorGain.gain.setValueAtTime(this.motorGain.gain.value, t);
    this.motorGain.gain.linearRampToValueAtTime(0.001, t + 0.025);

    const osc = this.motorOsc;
    const noise = this.motorNoise;

    setTimeout(() => {
      try {
        osc?.stop();
        noise?.stop();
        osc?.disconnect();
        noise?.disconnect();
      } catch {
        // already stopped
      }
    }, 40);

    this.motorOsc = null;
    this.motorNoise = null;
    this.motorGain = null;
    this.isMotorRunning = false;
  }

  /**
   * 5. Mechanical Cutter Blade Sound ("SNIKT / CHUNK")
   * High-frequency blade shear + mechanical solenoid snap
   */
  public playCutterSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.stopMotorFeed();
    const t = ctx.currentTime;

    // 1. Solenoid mechanical thud (low impact)
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();

    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(160, t);
    thudOsc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    thudGain.gain.setValueAtTime(0.12, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);

    thudOsc.start(t);
    thudOsc.stop(t + 0.095);

    // 2. High-frequency metallic blade shear (sweep from 3400Hz to 1600Hz)
    const bladeBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate);
    const bladeData = bladeBuffer.getChannelData(0);
    for (let i = 0; i < bladeData.length; i++) {
      bladeData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
    }

    const bladeSource = ctx.createBufferSource();
    bladeSource.buffer = bladeBuffer;

    const bladeFilter = ctx.createBiquadFilter();
    bladeFilter.type = 'bandpass';
    bladeFilter.frequency.setValueAtTime(3200, t);
    bladeFilter.frequency.exponentialRampToValueAtTime(1400, t + 0.12);
    bladeFilter.Q.setValueAtTime(3.5, t);

    const bladeGain = ctx.createGain();
    bladeGain.gain.setValueAtTime(0.14, t);
    bladeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    bladeSource.connect(bladeFilter);
    bladeFilter.connect(bladeGain);
    bladeGain.connect(ctx.destination);

    bladeSource.start(t);
    bladeSource.stop(t + 0.15);

    // 3. Tiny return spring latch tick (at t + 110ms)
    setTimeout(() => {
      if (this.isMuted || !this.ctx) return;
      const tLatch = this.ctx.currentTime;
      const latchOsc = this.ctx.createOscillator();
      const latchGain = ctx.createGain();

      latchOsc.type = 'triangle';
      latchOsc.frequency.setValueAtTime(2200, tLatch);
      latchOsc.frequency.exponentialRampToValueAtTime(800, tLatch + 0.025);

      latchGain.gain.setValueAtTime(0.045, tLatch);
      latchGain.gain.exponentialRampToValueAtTime(0.001, tLatch + 0.03);

      latchOsc.connect(latchGain);
      latchGain.connect(ctx.destination);

      latchOsc.start(tLatch);
      latchOsc.stop(tLatch + 0.035);
    }, 110);
  }

  /**
   * 6. Paper Separation & Settle (Soft flutter/release)
   */
  public playPaperSettle() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const settleBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
    const data = settleBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    }

    const source = ctx.createBufferSource();
    source.buffer = settleBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(t);
    source.stop(t + 0.11);
  }

  /**
   * Clean shutdown of any active nodes
   */
  public cleanup() {
    this.stopMotorFeed();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close().catch(() => {});
      } catch {
        // ignore
      }
      this.ctx = null;
    }
  }
}

// Export singleton helper
export const printerAudio = new ThermalPrinterAudio();
