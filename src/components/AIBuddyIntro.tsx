import React, { useState, useEffect } from 'react';
import { Bot, X, Sparkles, MessageCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { useSounds } from '../hooks/useSounds';

interface AIBuddyIntroProps {
  onClose: () => void;
  onStartChat: () => void;
}

export const AIBuddyIntro: React.FC<AIBuddyIntroProps> = ({ onClose, onStartChat }) => {
  const { playSound } = useSounds();
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    "🧩 Ask me about puzzles and how to earn points!",
    "🎉 I can tell you about upcoming events and activities!",
    "💬 Need help with chat features? I'm your buddy!",
    "🎵 Curious about Warriors' Picks music? Just ask!",
    "🏆 Want to know about scoring and leaderboards? I've got you covered!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [tips.length]);

  const handleStartChat = () => {
    playSound('success');
    onStartChat();
  };

  const handleClose = () => {
    playSound('click');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 text-center">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="mb-6">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Meet Your AI Buddy! 🤖
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            I'm here to help you navigate the Royal Warriors Squad and answer any questions you might have!
          </p>
        </div>

        <div className="bg-white/5 dark:bg-gray-800/20 rounded-lg p-4 mb-6 min-h-[60px] flex items-center justify-center">
          <p className="text-sm text-gray-700 dark:text-gray-300 transition-all duration-500">
            {tips[currentTip]}
          </p>
        </div>

        <div className="space-y-4">
          <AnimatedButton
            variant="primary"
            size="lg"
            icon={MessageCircle}
            onClick={handleStartChat}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            soundType="success"
          >
            Start Chatting
          </AnimatedButton>
          
          <AnimatedButton
            variant="ghost"
            onClick={handleClose}
            className="w-full"
            soundType="click"
          >
            Maybe Later
          </AnimatedButton>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          You can always find me in the bottom-right corner! 👇
        </p>
      </GlassCard>
    </div>
  );
};