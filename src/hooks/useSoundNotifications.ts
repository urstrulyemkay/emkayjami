import { useCallback, useEffect } from 'react';
import { playSound as playSoundLib, initSoundSystem, SoundType } from '@/lib/sounds';

const SOUND_ENABLED_KEY = 'drivex-sound-enabled';

// Get sound preference from localStorage
const getSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === null ? true : stored === 'true';
};

// Set sound preference in localStorage
const setSoundEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
};

export const useSoundNotifications = () => {
  // Initialize audio context on mount (requires user interaction)
  useEffect(() => {
    const handleInteraction = () => {
      initSoundSystem();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!getSoundEnabled()) return;
    playSoundLib(type);
  }, []);

  const soundEnabled = getSoundEnabled();

  const toggleSound = useCallback(() => {
    const newValue = !getSoundEnabled();
    setSoundEnabled(newValue);
    // Play a tick sound to confirm when enabling
    if (newValue) {
      playSoundLib('tick');
    }
    return newValue;
  }, []);

  const setSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    if (enabled) {
      playSoundLib('tick');
    }
  }, []);

  return {
    playSound,
    soundEnabled,
    toggleSound,
    setSound,
  };
};

// Standalone function for use outside of React components (e.g., in hooks)
export const playSoundIfEnabled = (type: SoundType): void => {
  if (!getSoundEnabled()) return;
  playSoundLib(type);
};
