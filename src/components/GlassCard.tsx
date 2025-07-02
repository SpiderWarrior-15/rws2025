import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  onClick
}) => {
  const { theme } = useTheme();

  const getThemeStyles = () => {
    switch (theme) {
      case 'royal':
        return 'bg-white/10 dark:bg-gray-900/20 border-purple-500/30 hover:border-purple-400/50 shadow-purple-500/10';
      case 'cyber':
        return 'bg-white/10 dark:bg-gray-900/20 border-cyan-500/30 hover:border-cyan-400/50 shadow-cyan-500/10';
      case 'night-ops':
        return 'bg-white/10 dark:bg-gray-900/20 border-gray-500/30 hover:border-gray-400/50 shadow-gray-500/10';
      default:
        return 'bg-white/10 dark:bg-gray-900/20 border-purple-500/30 hover:border-purple-400/50 shadow-purple-500/10';
    }
  };

  return (
    <motion.div
      className={`
        backdrop-blur-md 
        border 
        rounded-2xl 
        ${getThemeStyles()}
        ${hover ? 'hover:bg-white/20 dark:hover:bg-gray-800/30 hover:scale-[1.02] hover:shadow-2xl' : ''} 
        transition-all duration-500 ease-out
        shadow-lg hover:shadow-xl
        relative overflow-hidden
        ${className}
      `}
      onClick={onClick}
      whileHover={hover ? { y: -2 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        theme === 'royal' ? 'from-purple-500/5 via-transparent to-blue-500/5' :
        theme === 'cyber' ? 'from-cyan-500/5 via-transparent to-green-500/5' :
        'from-gray-500/5 via-transparent to-gray-700/5'
      } pointer-events-none`} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};