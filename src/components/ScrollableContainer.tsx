import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ScrollableContainerProps {
  children: React.ReactNode;
  maxHeight?: string;
  autoScroll?: boolean;
  className?: string;
}

export const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  maxHeight = '400px',
  autoScroll = false,
  className = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [children, autoScroll]);

  return (
    <motion.div
      ref={scrollRef}
      className={`overflow-y-auto overflow-x-hidden ${className}`}
      style={{ maxHeight }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        {children}
      </div>
      
      {/* Custom scrollbar styling */}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #a855f7, #2563eb);
        }
      `}</style>
    </motion.div>
  );
};