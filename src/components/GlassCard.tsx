import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true 
}) => {
  return (
    <div className={`
      bg-white/10 dark:bg-gray-900/20 
      backdrop-blur-md 
      border border-white/20 dark:border-gray-700/30 
      rounded-2xl 
      ${hover ? 'hover:bg-white/20 dark:hover:bg-gray-800/30 hover:border-white/30 dark:hover:border-gray-600/50 hover:scale-105' : ''} 
      transition-all duration-300 
      shadow-lg hover:shadow-xl
      ${className}
    `}>
      {children}
    </div>
  );
};