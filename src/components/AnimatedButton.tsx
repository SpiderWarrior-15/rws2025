import React, { useState } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useSounds } from '../hooks/useSounds';

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
  soundType = 'click'
}) => {
  const { playSound } = useSounds();
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500',
    secondary: 'bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/50 focus:ring-gray-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50 focus:ring-gray-500'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm space-x-2',
    md: 'px-6 py-3 text-base space-x-2',
    lg: 'px-8 py-4 text-lg space-x-3'
  };

  const handleClick = () => {
    if (disabled) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    // Play sound effect
    playSound(soundType);
    
    if (onClick) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      playSound('hover');
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        isPressed ? 'scale-90' : ''
      }`}
    >
      {Icon && <Icon className={size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />}
      <span>{children}</span>
    </button>
  );
};