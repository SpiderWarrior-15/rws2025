import React, { useState, useEffect } from 'react';
import { X, Bell, Crown, Star, Calendar, Trophy, MessageCircle, AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSounds } from '../hooks/useSounds';
import { Notice, NoticeType, NoticePriority } from '../types';
import { getActiveNotices, markNoticeAsRead, shouldShowNotice } from '../utils/noticeManager';

export const NoticeBoard: React.FC = () => {
  const { user } = useAuth();
  const { playSound } = useSounds();
  const [notices, setNotices] = useLocalStorage<Notice[]>('rws-notices', []);
  const [readNotices, setReadNotices] = useLocalStorage<string[]>('rws-read-notices', []);
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotices, setCurrentNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (!user) return;

    // Get active notices for the current user
    const activeNotices = getActiveNotices(notices, user);
    
    // Filter notices that should be shown (not read, within time range, etc.)
    const noticestoShow = activeNotices.filter(notice => 
      shouldShowNotice(notice, readNotices, user)
    );

    if (noticestoShow.length > 0) {
      setCurrentNotices(noticestoShow);
      setIsVisible(true);
      playSound('success');
    }
  }, [user, notices, readNotices, playSound]);

  const handleMarkAsRead = (noticeId: string) => {
    const updatedReadNotices = markNoticeAsRead(noticeId, readNotices);
    setReadNotices(updatedReadNotices);
    
    // Remove from current notices
    setCurrentNotices(prev => prev.filter(n => n.id !== noticeId));
    
    // Hide if no more notices
    if (currentNotices.length <= 1) {
      setIsVisible(false);
    }
    
    playSound('click');
  };

  const handleDismissAll = () => {
    const allNoticeIds = currentNotices.map(n => n.id);
    const updatedReadNotices = [...readNotices, ...allNoticeIds];
    setReadNotices(updatedReadNotices);
    setCurrentNotices([]);
    setIsVisible(false);
    playSound('click');
  };

  const getNoticeIcon = (type: NoticeType) => {
    switch (type) {
      case 'announcement': return Bell;
      case 'event': return Calendar;
      case 'achievement': return Trophy;
      case 'update': return Star;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'success': return CheckCircle;
      case 'puzzle': return Zap;
      default: return Bell;
    }
  };

  const getNoticeColor = (priority: NoticePriority, type: NoticeType) => {
    if (priority === 'urgent') return 'border-red-500/50 bg-red-500/10';
    if (priority === 'high') return 'border-yellow-500/50 bg-yellow-500/10';
    
    switch (type) {
      case 'achievement': return 'border-green-500/50 bg-green-500/10';
      case 'event': return 'border-blue-500/50 bg-blue-500/10';
      case 'warning': return 'border-orange-500/50 bg-orange-500/10';
      case 'success': return 'border-green-500/50 bg-green-500/10';
      case 'puzzle': return 'border-purple-500/50 bg-purple-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getNoticeTextColor = (priority: NoticePriority, type: NoticeType) => {
    if (priority === 'urgent') return 'text-red-400';
    if (priority === 'high') return 'text-yellow-400';
    
    switch (type) {
      case 'achievement': return 'text-green-400';
      case 'event': return 'text-blue-400';
      case 'warning': return 'text-orange-400';
      case 'success': return 'text-green-400';
      case 'puzzle': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (!isVisible || currentNotices.length === 0 || !user) {
    return null;
  }

  // Sort notices by priority and creation time
  const sortedNotices = [...currentNotices].sort((a, b) => {
    const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Royal Notice Board
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sortedNotices.length} new {sortedNotices.length === 1 ? 'notice' : 'notices'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {sortedNotices.length > 1 && (
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissAll}
                  soundType="click"
                >
                  Dismiss All
                </AnimatedButton>
              )}
              <button
                onClick={handleDismissAll}
                className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Notices */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
          {sortedNotices.map((notice) => {
            const IconComponent = getNoticeIcon(notice.type);
            const colorClass = getNoticeColor(notice.priority, notice.type);
            const textColorClass = getNoticeTextColor(notice.priority, notice.type);
            
            return (
              <div
                key={notice.id}
                className={`p-4 rounded-lg border ${colorClass} transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                    <IconComponent className={`w-4 h-4 ${textColorClass}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        {notice.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {notice.priority === 'urgent' && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                            URGENT
                          </span>
                        )}
                        {notice.priority === 'high' && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                            HIGH
                          </span>
                        )}
                        <button
                          onClick={() => handleMarkAsRead(notice.id)}
                          className="p-1 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded transition-colors duration-300"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      {notice.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>
                        {new Date(notice.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      {notice.expiresAt && (
                        <span className={textColorClass}>
                          {formatTimeRemaining(notice.expiresAt)}
                        </span>
                      )}
                    </div>
                    
                    {notice.actionButton && (
                      <div className="mt-3">
                        <AnimatedButton
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (notice.actionButton?.onClick) {
                              notice.actionButton.onClick();
                            }
                            handleMarkAsRead(notice.id);
                          }}
                          soundType="success"
                        >
                          {notice.actionButton.text}
                        </AnimatedButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 dark:border-gray-700/30 bg-white/5 dark:bg-gray-800/20">
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            💡 Notices are shown based on your role, activity, and timing. Check back regularly for updates!
          </p>
        </div>
      </GlassCard>
    </div>
  );
};