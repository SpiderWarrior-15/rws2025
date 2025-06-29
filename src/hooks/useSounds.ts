import { useEffect, useState } from 'react';
import { soundManager } from '../utils/sounds';

export const useSounds = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('rws-sounds-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('rws-sounds-enabled', JSON.stringify(isEnabled));
    soundManager.setEnabled(isEnabled);
  }, [isEnabled]);

  const toggleSounds = () => {
    setIsEnabled(!isEnabled);
  };

  const playSound = (soundName: string, volume?: number) => {
    if (isEnabled) {
      soundManager.playSound(soundName, volume);
    }
  };

  return {
    isEnabled,
    toggleSounds,
    playSound
  };
};