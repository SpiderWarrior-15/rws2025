import { useState, useEffect } from 'react';

export const useAIBuddy = () => {
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    const saved = localStorage.getItem('rws-ai-buddy-intro-seen');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Show intro after 3 seconds if user hasn't seen it before
    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        setShowIntro(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasSeenIntro]);

  const markIntroAsSeen = () => {
    setHasSeenIntro(true);
    setShowIntro(false);
    localStorage.setItem('rws-ai-buddy-intro-seen', JSON.stringify(true));
  };

  const hideIntro = () => {
    setShowIntro(false);
  };

  return {
    showIntro,
    hasSeenIntro,
    markIntroAsSeen,
    hideIntro
  };
};