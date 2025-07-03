import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  soundType?: 'click' | 'success' | 'error';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  type = 'button',
  soundType = 'click',
}) => {
  const { theme } = useTheme();

  // Define all possible styles per theme + variant
  const baseStyles = {
    royal: {
      primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25',
      secondary: 'bg-white/10 dark:bg-gray-800/50 border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20',
      ghost: 'text-purple-600 dark:text-purple-400 hover:bg-purple-500/10',
    },
    cyber: {
      primary: 'bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-black shadow-lg hover:shadow-cyan-500/25',
      secondary: 'bg-white/10 dark:bg-gray-800/50 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20',
      ghost: 'text-cyan-400 hover:bg-cyan-500/10',
    },
    'night-ops': {
      primary: 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white shadow-lg hover:shadow-gray-500/25',
      secondary: 'bg-white/10 dark:bg-gray-800/50 border border-gray-500/30 text-gray-300 hover:bg-gray-500/20',
      ghost: 'text-gray-300 hover:bg-gray-500/10',
    },
  };

  // Safely resolve style based on theme & variant
  const getThemeStyles = () => {
    const validTheme = baseStyles[theme] ? theme : 'royal';
    const style = baseStyles[validTheme][variant];
    return style || baseStyles[validTheme]['primary'];
  };

  // Sizes
  const sizes = {
    sm: 'px-4 py-2 text-sm space-x-2',
    md: 'px-6 py-3 text-base space-x-2',
    lg: 'px-8 py-4 text-lg space-x-3',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl 
        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group
        ${getThemeStyles()} ${sizes[size]} ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer effect for primary buttons */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      )}

      {/* Optional icon if provided */}
      {Icon && (
        <Icon
          className={
            size === 'lg'
              ? 'w-6 h-6'
              : size === 'sm'
              ? 'w-4 h-4'
              : 'w-5 h-5'
          }
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};