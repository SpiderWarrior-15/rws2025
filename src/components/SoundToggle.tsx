import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSounds } from '../hooks/useSounds';

export const SoundToggle: React.FC = () => {
  const { isEnabled, toggleSounds } = useSounds();

  return (
    <button
      onClick={toggleSounds}
      className="p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
      title={isEnabled ? 'Disable sounds' : 'Enable sounds'}
    >
      {isEnabled ? (
        <Volume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <VolumeX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
};