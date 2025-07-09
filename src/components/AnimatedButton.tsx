import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
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
}) => {
  // Simplified single theme styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25';
      case 'secondary':
        return 'bg-white/10 dark:bg-gray-800/50 border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20';
      case 'ghost':
        return 'text-purple-600 dark:text-purple-400 hover:bg-purple-500/10';
      default:
        return 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25';
    }
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
        inline-flex items-center justify-center font-semibold rounded-2xl 
        transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
        disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group
        shadow-lg hover:shadow-xl
        ${getVariantStyles()} ${sizes[size]} ${className}
      `}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        y: disabled ? 0 : -2,
        boxShadow: disabled ? undefined : "0 10px 25px rgba(139, 92, 246, 0.3)"
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
    >
      {/* Shimmer effect for primary buttons */}
      {variant === 'primary' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </>
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