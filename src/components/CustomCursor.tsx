import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const CustomCursor: React.FC = () => {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener('mousemove', updateMousePosition);
    
    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case 'royal':
        return 'bg-gradient-to-r from-purple-500 to-blue-500';
      case 'cyber':
        return 'bg-gradient-to-r from-cyan-400 to-green-400';
      case 'night-ops':
        return 'bg-gradient-to-r from-gray-600 to-gray-800';
      default:
        return 'bg-gradient-to-r from-purple-500 to-blue-500';
    }
  };

  return (
    <>
      <motion.div
        className={`fixed top-0 left-0 w-4 h-4 ${getThemeColors()} rounded-full pointer-events-none z-[9999] mix-blend-difference`}
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />
      <motion.div
        className={`fixed top-0 left-0 w-8 h-8 border-2 border-current rounded-full pointer-events-none z-[9998] ${
          theme === 'royal' ? 'text-purple-500' :
          theme === 'cyber' ? 'text-cyan-400' :
          'text-gray-600'
        }`}
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      />
    </>
  );
};