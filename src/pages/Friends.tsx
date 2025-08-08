import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Heart } from 'lucide-react';
import { FriendSystem } from '../components/FriendSystem';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '../components/GlassCard';

export const Friends: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access the friend system
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 backdrop-blur-xl border border-pink-500/30 mb-8 shadow-lg shadow-pink-500/10">
            <Heart className="w-6 h-6 text-pink-400 mr-3 animate-pulse" />
            <span className="text-lg font-semibold text-pink-400">Warrior Connections</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Friends
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            Connect with fellow warriors, build your network, and strengthen the brotherhood
          </p>
        </motion.div>

        {/* Friend System */}
        <FriendSystem showFullInterface={true} />
      </div>
    </div>
  );
};