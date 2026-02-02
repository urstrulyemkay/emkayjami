// Sound generation using Web Audio API
// Subtle, professional sounds aligned with "Truth Terminal" forensic aesthetic

export type SoundType = 
  | 'success' 
  | 'error' 
  | 'outbid' 
  | 'coin-earn' 
  | 'coin-spend' 
  | 'tick' 
  | 'notification' 
  | 'alert';

interface SoundConfig {
  frequencies: number[];
  durations: number[];
  type: OscillatorType;
  volume: number;
  attack: number;
  decay: number;
}

// Sound configurations - subtle, professional tones
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  // Success: Soft ascending two-tone (C5 -> E5)
  success: {
    frequencies: [523.25, 659.25],
    durations: [0.08, 0.12],
    type: 'sine',
    volume: 0.15,
    attack: 0.01,
    decay: 0.1,
  },
  
  // Error: Low descending tone (E4 -> C4)
  error: {
    frequencies: [329.63, 261.63],
    durations: [0.1, 0.15],
    type: 'sine',
    volume: 0.12,
    attack: 0.01,
    decay: 0.12,
  },
  
  // Outbid: Gentle warning pulse (lower tone)
  outbid: {
    frequencies: [293.66, 261.63, 233.08],
    durations: [0.08, 0.08, 0.12],
    type: 'sine',
    volume: 0.18,
    attack: 0.02,
    decay: 0.1,
  },
  
  // Coin earn: Quick metallic ascending tick
  'coin-earn': {
    frequencies: [880, 1108.73],
    durations: [0.05, 0.08],
    type: 'triangle',
    volume: 0.1,
    attack: 0.005,
    decay: 0.08,
  },
  
  // Coin spend: Quick metallic descending tick
  'coin-spend': {
    frequencies: [1108.73, 880],
    durations: [0.05, 0.08],
    type: 'triangle',
    volume: 0.1,
    attack: 0.005,
    decay: 0.08,
  },
  
  // Tick: Brief neutral click
  tick: {
    frequencies: [800],
    durations: [0.03],
    type: 'sine',
    volume: 0.08,
    attack: 0.001,
    decay: 0.03,
  },
  
  // Notification: Gentle two-tone ping
  notification: {
    frequencies: [698.46, 880],
    durations: [0.06, 0.1],
    type: 'sine',
    volume: 0.12,
    attack: 0.01,
    decay: 0.1,
  },
  
  // Alert: Soft pulse (for deadlines, warnings)
  alert: {
    frequencies: [440, 523.25, 440],
    durations: [0.08, 0.08, 0.1],
    type: 'sine',
    volume: 0.14,
    attack: 0.02,
    decay: 0.08,
  },
};

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
};

export const playSound = (type: SoundType): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const config = SOUND_CONFIGS[type];
  if (!config) return;
  
  let startTime = ctx.currentTime;
  
  config.frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(freq, startTime);
    
    // ADSR envelope for smooth sound
    const duration = config.durations[index];
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(config.volume, startTime + config.attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.01);
    
    startTime += duration * 0.7; // Slight overlap for smoothness
  });
};

// Pre-warm audio context on first user interaction
export const initSoundSystem = (): void => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
};
