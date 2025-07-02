import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Crown, Zap, Moon } from 'lucide-react';
import { useTheme, Theme } from '../contexts/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { id: Theme; name: string; icon: React.ComponentType; colors: string[] }[] = [
    {
      id: 'royal',
      name: 'Royal',
      icon: Crown,
      colors: ['from-purple-600', 'to-blue-600']
    },
    {
      id: 'cyber',
      name: 'Cyber',
      icon: Zap,
      colors: ['from-cyan-400', 'to-green-400']
    },
    {
      id: 'night-ops',
      name: 'Night Ops',
      icon: Moon,
      colors: ['from-gray-700', 'to-gray-900']
    }
  ];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Palette className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute top-full right-0 mt-2 p-2 bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl min-w-[200px]"
          >
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <motion.button
                  key={themeOption.id}
                  onClick={() => handleThemeChange(themeOption.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    theme === themeOption.id
                      ? 'bg-gradient-to-r ' + themeOption.colors.join(' ') + ' text-white'
                      : 'hover:bg-white/10 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{themeOption.name}</span>
                  {theme === themeOption.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full ml-auto"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};