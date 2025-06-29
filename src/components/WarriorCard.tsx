import React from 'react';
import { User, Star, Calendar, Award, Chrome, Facebook, Github, Mail } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { WarriorMember, MarkingSummary } from '../types';

interface WarriorCardProps {
  warrior: WarriorMember;
  summary?: MarkingSummary;
  onMark: (warrior: WarriorMember) => void;
  showMarkButton?: boolean;
}

export const WarriorCard: React.FC<WarriorCardProps> = ({
  warrior,
  summary,
  onMark,
  showMarkButton = true
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPerformanceLevel = (averageScore: number) => {
    if (averageScore >= 80) return { label: 'Excellent', color: 'text-green-500' };
    if (averageScore >= 60) return { label: 'Good', color: 'text-blue-500' };
    if (averageScore >= 40) return { label: 'Average', color: 'text-yellow-500' };
    return { label: 'Needs Improvement', color: 'text-red-500' };
  };

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'google':
        return Chrome;
      case 'facebook':
        return Facebook;
      case 'github':
        return Github;
      default:
        return Mail;
    }
  };

  const getProviderColor = (provider?: string) => {
    switch (provider) {
      case 'google':
        return 'text-blue-500';
      case 'facebook':
        return 'text-blue-600';
      case 'github':
        return 'text-gray-700 dark:text-gray-300';
      default:
        return 'text-purple-500';
    }
  };

  const performance = summary ? getPerformanceLevel((summary.averageScore / 20) * 100) : null;
  const ProviderIcon = getProviderIcon(warrior.provider);

  return (
    <GlassCard className="p-6 relative overflow-hidden group">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-2xl"></div>
      
      <div className="relative">
        {/* Avatar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            {warrior.avatar ? (
              <img src={warrior.avatar} alt={warrior.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {warrior.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {warrior.email}
            </p>
            {/* Account Type Badge */}
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                warrior.accountType === 'admin' 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {warrior.accountType === 'admin' ? 'Commander' : 'Warrior'}
              </span>
              {/* Provider Badge */}
              <div className={`flex items-center space-x-1 px-2 py-1 bg-white/10 dark:bg-gray-800/20 rounded-full ${getProviderColor(warrior.provider)}`}>
                <ProviderIcon className="w-3 h-3" />
                <span className="text-xs capitalize">{warrior.provider || 'email'}</span>
              </div>
            </div>
          </div>
          {!warrior.isActive && (
            <div className="px-2 py-1 bg-gray-500/20 text-gray-500 rounded-full text-xs">
              Inactive
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
            <Calendar className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-800 dark:text-white">
              Joined
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {formatDate(warrior.joinDate)}
            </div>
          </div>
          
          {summary && (
            <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
              <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-sm font-medium text-gray-800 dark:text-white">
                {summary.totalScore}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Score
              </div>
            </div>
          )}
        </div>

        {/* Performance Level */}
        {performance && (
          <div className="flex items-center justify-center mb-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 dark:bg-gray-800/20`}>
              <Award className={`w-4 h-4 ${performance.color}`} />
              <span className={`text-sm font-medium ${performance.color}`}>
                {performance.label}
              </span>
            </div>
          </div>
        )}

        {/* Category Scores */}
        {summary && summary.categoryScores && Object.keys(summary.categoryScores).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Breakdown
            </h4>
            <div className="space-y-2">
              {Object.entries(summary.categoryScores).map(([category, score]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {category}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mark Button */}
        {showMarkButton && warrior.isActive && (
          <AnimatedButton
            variant="primary"
            size="sm"
            icon={Star}
            onClick={() => onMark(warrior)}
            className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            Mark Warrior
          </AnimatedButton>
        )}
      </div>
    </GlassCard>
  );
};