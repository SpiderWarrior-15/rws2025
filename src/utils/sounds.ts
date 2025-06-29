// Sound utility for button interactions
export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  private constructor() {
    this.initAudioContext();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private async createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          break;
      }

      // Apply envelope (fade in/out)
      const envelope = Math.min(1, Math.min(i / (sampleRate * 0.01), (length - i) / (sampleRate * 0.05)));
      data[i] = sample * envelope * 0.1; // Reduce volume
    }

    return buffer;
  }

  private async createClickSound(): Promise<AudioBuffer> {
    return this.createTone(800, 0.1, 'sine');
  }

  private async createHoverSound(): Promise<AudioBuffer> {
    return this.createTone(600, 0.05, 'sine');
  }

  private async createSuccessSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a pleasant success chord
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      frequencies.forEach(freq => {
        sample += Math.sin(2 * Math.PI * freq * t) / frequencies.length;
      });

      // Apply envelope
      const envelope = Math.exp(-t * 3) * Math.min(1, i / (sampleRate * 0.01));
      data[i] = sample * envelope * 0.08;
    }

    return buffer;
  }

  private async createErrorSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a descending error tone
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const frequency = 400 - (t * 200); // Descending from 400Hz to 200Hz
      const sample = Math.sin(2 * Math.PI * frequency * t);

      // Apply envelope
      const envelope = Math.exp(-t * 5) * Math.min(1, i / (sampleRate * 0.01));
      data[i] = sample * envelope * 0.08;
    }

    return buffer;
  }

  public async initSounds() {
    if (!this.audioContext || !this.enabled) return;

    try {
      const [click, hover, success, error] = await Promise.all([
        this.createClickSound(),
        this.createHoverSound(),
        this.createSuccessSound(),
        this.createErrorSound()
      ]);

      this.sounds.set('click', click);
      this.sounds.set('hover', hover);
      this.sounds.set('success', success);
      this.sounds.set('error', error);
    } catch (error) {
      console.warn('Failed to create sounds:', error);
    }
  }

  public async playSound(soundName: string, volume: number = 1) {
    if (!this.audioContext || !this.enabled) return;

    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const buffer = this.sounds.get(soundName);
    if (!buffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = Math.min(1, Math.max(0, volume));
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Convenience functions
export const soundManager = SoundManager.getInstance();

export const playClickSound = () => soundManager.playSound('click');
export const playHoverSound = () => soundManager.playSound('hover', 0.3);
export const playSuccessSound = () => soundManager.playSound('success');
export const playErrorSound = () => soundManager.playSound('error');

// Initialize sounds when module loads
soundManager.initSounds();