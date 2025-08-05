import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Crown, Shield, Star, Zap, Save, RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { UserAvatar } from '../types';

interface AvatarCreatorProps {
  currentAvatar?: UserAvatar;
  onSave: (avatar: UserAvatar) => void;
  onClose: () => void;
}

export const AvatarCreator: React.FC<AvatarCreatorProps> = ({
  currentAvatar,
  onSave,
  onClose
}) => {
  const [avatar, setAvatar] = useState<UserAvatar>(
    currentAvatar || {
      mask: 'default',
      name: '',
      badge: 'newcomer',
      color: '#3b82f6'
    }
  );

  const masks = [
    { id: 'default', name: 'Default', icon: User },
    { id: 'spider', name: 'Spider', icon: Zap },
    { id: 'crown', name: 'Royal', icon: Crown },
    { id: 'shield', name: 'Guardian', icon: Shield },
    { id: 'star', name: 'Stellar', icon: Star }
  ];

  const badges = [
    { id: 'newcomer', name: 'Newcomer', color: '#3b82f6' },
    { id: 'warrior', name: 'Warrior', color: '#10b981' },
    { id: 'veteran', name: 'Veteran', color: '#f59e0b' },
    { id: 'legend', name: 'Legend', color: '#8b5cf6' },
    { id: 'founder', name: 'Founder', color: '#ef4444' }
  ];

  const colors = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ef4444', '#06b6d4', '#ec4899', '#84cc16'
  ];

  const generateRandomAvatar = () => {
    const randomMask = masks[Math.floor(Math.random() * masks.length)];
    const randomBadge = badges[Math.floor(Math.random() * badges.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    setAvatar({
      mask: randomMask.id,
      name: avatar.name,
      badge: randomBadge.id,
      color: randomColor
    });
  };

  const handleSave = () => {
    if (avatar.name.trim()) {
      onSave(avatar);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Create Your Avatar
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Avatar Preview */}
            <div className="text-center">
              <motion.div
                className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl"
                style={{ backgroundColor: avatar.color }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {avatar.name.charAt(0).toUpperCase() || '?'}
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {avatar.name || 'Unnamed Warrior'}
                </h3>
                <div className="flex justify-center">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: badges.find(b => b.id === avatar.badge)?.color }}
                  >
                    {badges.find(b => b.id === avatar.badge)?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Avatar Name
                </label>
                <input
                  type="text"
                  value={avatar.name}
                  onChange={(e) => setAvatar({ ...avatar, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="Enter your warrior name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Mask Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {masks.map(mask => {
                    const Icon = mask.icon;
                    return (
                      <button
                        key={mask.id}
                        onClick={() => setAvatar({ ...avatar, mask: mask.id })}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          avatar.mask === mask.id
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-gray-300 dark:border-gray-600 bg-white/5 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs">{mask.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Badge
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {badges.map(badge => (
                    <button
                      key={badge.id}
                      onClick={() => setAvatar({ ...avatar, badge: badge.id })}
                      className={`p-2 rounded-lg border transition-all duration-300 text-sm ${
                        avatar.badge === badge.id
                          ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                          : 'border-gray-300 dark:border-gray-600 bg-white/5 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {badge.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Color Theme
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setAvatar({ ...avatar, color })}
                      className={`w-12 h-12 rounded-lg border-2 transition-all duration-300 ${
                        avatar.color === color ? 'border-white scale-110' : 'border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <AnimatedButton
                  variant="secondary"
                  icon={RefreshCw}
                  onClick={generateRandomAvatar}
                  className="flex-1"
                >
                  Random
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  icon={Save}
                  onClick={handleSave}
                  disabled={!avatar.name.trim()}
                  className="flex-1"
                >
                  Save Avatar
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};