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
      ${hover ? 'hover:bg-white/20 dark:hover:bg-gray-800/30 hover:border-white/30 dark:hover:border-gray-600/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10' : ''} 
      transition-all duration-500 ease-out
      shadow-lg hover:shadow-xl
      relative overflow-hidden
      ${className}
    `}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};