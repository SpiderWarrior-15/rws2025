import React from 'react';
import { motion } from 'framer-motion';

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
  return (
    <motion.div
      className={`
        backdrop-blur-xl 
        border 
        rounded-3xl 
        bg-white/10 dark:bg-gray-900/20 border-purple-500/30 hover:border-purple-400/50 shadow-purple-500/10
        ${hover ? 'hover:bg-white/20 dark:hover:bg-gray-800/30 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20' : ''} 
        transition-all duration-700 ease-out
        shadow-xl hover:shadow-2xl
        relative overflow-hidden
        ${className}
      `}
      onClick={onClick}
      whileHover={hover ? { y: -4, rotateX: 2 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none rounded-3xl" />
      
      {/* Enhanced border glow */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};