import { Notice, NoticeType, NoticePriority, AuthUser } from '../types';

// Create sample notices for demonstration
export const createSampleNotices = (): Notice[] => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'welcome-warrior',
      title: '🎉 Welcome to Royal Warriors Squad!',
      content: 'Welcome, brave warrior! You\'ve successfully joined our elite brotherhood. Explore puzzles, chat with fellow warriors, and participate in events to earn points and climb the leaderboard!',
      type: 'announcement',
      priority: 'high',
      targetAudience: 'new_users',
      createdAt: now.toISOString(),
      expiresAt: nextWeek.toISOString(),
      isActive: true,
      showOnce: true,
      actionButton: {
        text: 'Start Exploring',
        onClick: () => window.location.href = '/puzzles'
      }
    },
    {
      id: 'weekly-puzzles',
      title: '🧩 New Weekly Puzzles Available!',
      content: 'Fresh brain-teasers have arrived! Test your wit with our latest collection of puzzles. Earn points based on difficulty: Easy (5pts), Medium (10pts), Hard (15pts), Super Hard (20pts).',
      type: 'puzzle',
      priority: 'medium',
      targetAudience: 'all',
      createdAt: now.toISOString(),
      expiresAt: nextWeek.toISOString(),
      isActive: true,
      showOnce: false,
      conditions: {
        dayOfWeek: [1], // Monday
        timeRange: { start: '00:00', end: '23:59' }
      },
      actionButton: {
        text: 'Solve Puzzles',
        onClick: () => window.location.href = '/puzzles'
      }
    },
    {
      id: 'commander-promotion',
      title: '👑 Congratulations, Commander!',
      content: 'You\'ve been promoted to Commander rank! You now have access to admin features including managing warriors, creating puzzles, and organizing events. Use your powers wisely!',
      type: 'achievement',
      priority: 'high',
      targetAudience: 'commanders',
      createdAt: now.toISOString(),
      expiresAt: nextMonth.toISOString(),
      isActive: true,
      showOnce: true,
      conditions: {
        userRole: ['Commander']
      }
    },
    {
      id: 'upcoming-event',
      title: '📅 RWS Annual Meet - This Weekend!',
      content: 'Don\'t miss our biggest event of the year! Join us for workshops, gaming tournaments, and networking with fellow warriors. Register now to secure your spot!',
      type: 'event',
      priority: 'high',
      targetAudience: 'all',
      createdAt: now.toISOString(),
      expiresAt: tomorrow.toISOString(),
      isActive: true,
      showOnce: false,
      conditions: {
        dayOfWeek: [5, 6], // Friday, Saturday
        timeRange: { start: '09:00', end: '18:00' }
      },
      actionButton: {
        text: 'View Events',
        onClick: () => window.location.href = '/events'
      }
    },
    {
      id: 'maintenance-warning',
      title: '⚠️ Scheduled Maintenance Tonight',
      content: 'The platform will undergo maintenance tonight from 2:00 AM to 4:00 AM UTC. Some features may be temporarily unavailable. We apologize for any inconvenience.',
      type: 'warning',
      priority: 'urgent',
      targetAudience: 'all',
      createdAt: now.toISOString(),
      expiresAt: tomorrow.toISOString(),
      isActive: true,
      showOnce: false,
      conditions: {
        timeRange: { start: '18:00', end: '23:59' }
      }
    },
    {
      id: 'chat-feature',
      title: '💬 New Chat Groups Available!',
      content: 'Connect with fellow warriors in our new chat groups! Join "Tech Warriors" for programming discussions, "Gaming Squad" for gaming strategies, or create your own group.',
      type: 'update',
      priority: 'medium',
      targetAudience: 'all',
      createdAt: now.toISOString(),
      expiresAt: nextWeek.toISOString(),
      isActive: true,
      showOnce: true,
      actionButton: {
        text: 'Join Chat',
        onClick: () => window.location.href = '/chat'
      }
    },
    {
      id: 'leaderboard-update',
      title: '🏆 You\'re Climbing the Ranks!',
      content: 'Great job! You\'ve moved up in the leaderboard. Keep solving puzzles and participating in activities to reach the top. Current warriors are competing for the #1 spot!',
      type: 'achievement',
      priority: 'medium',
      targetAudience: 'active_users',
      createdAt: now.toISOString(),
      expiresAt: nextWeek.toISOString(),
      isActive: true,
      showOnce: false,
      conditions: {
        minPoints: 50
      }
    },
    {
      id: 'first-puzzle-solved',
      title: '🎯 First Puzzle Solved!',
      content: 'Congratulations on solving your first puzzle! You\'ve earned your first points and taken your first step toward becoming a legendary warrior. Keep up the great work!',
      type: 'success',
      priority: 'medium',
      targetAudience: 'new_solvers',
      createdAt: now.toISOString(),
      expiresAt: nextMonth.toISOString(),
      isActive: true,
      showOnce: true
    }
  ];
};

// Check if a notice should be shown to the user
export const shouldShowNotice = (notice: Notice, readNotices: string[], user: AuthUser): boolean => {
  // Check if already read and should show only once
  if (notice.showOnce && readNotices.includes(notice.id)) {
    return false;
  }

  // Check if notice is active
  if (!notice.isActive) {
    return false;
  }

  // Check if notice has expired
  if (notice.expiresAt && new Date(notice.expiresAt) < new Date()) {
    return false;
  }

  // Check target audience
  if (!isTargetAudience(notice, user)) {
    return false;
  }

  // Check conditions
  if (notice.conditions && !checkConditions(notice.conditions, user)) {
    return false;
  }

  return true;
};

// Check if user is in target audience
const isTargetAudience = (notice: Notice, user: AuthUser): boolean => {
  switch (notice.targetAudience) {
    case 'all':
      return true;
    case 'new_users':
      // Consider users who joined in the last 7 days as new
      const joinDate = new Date(user.id); // Using ID as timestamp for demo
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return joinDate > weekAgo;
    case 'commanders':
      return user.role === 'Commander';
    case 'warriors':
      return user.role === 'Warrior';
    case 'active_users':
      // For demo, consider all logged-in users as active
      return true;
    case 'new_solvers':
      // This would need to check if user has solved puzzles recently
      return true;
    default:
      return false;
  }
};

// Check if conditions are met
const checkConditions = (conditions: any, user: AuthUser): boolean => {
  const now = new Date();

  // Check day of week
  if (conditions.dayOfWeek) {
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (!conditions.dayOfWeek.includes(currentDay)) {
      return false;
    }
  }

  // Check time range
  if (conditions.timeRange) {
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    if (currentTime < conditions.timeRange.start || currentTime > conditions.timeRange.end) {
      return false;
    }
  }

  // Check user role
  if (conditions.userRole && !conditions.userRole.includes(user.role)) {
    return false;
  }

  // Check minimum points (would need to be calculated from user data)
  if (conditions.minPoints) {
    // For demo, assume user meets the requirement
    return true;
  }

  return true;
};

// Get active notices for a user
export const getActiveNotices = (allNotices: Notice[], user: AuthUser): Notice[] => {
  return allNotices.filter(notice => notice.isActive);
};

// Mark a notice as read
export const markNoticeAsRead = (noticeId: string, readNotices: string[]): string[] => {
  if (!readNotices.includes(noticeId)) {
    return [...readNotices, noticeId];
  }
  return readNotices;
};

// Create a new notice (for admin use)
export const createNotice = (
  title: string,
  content: string,
  type: NoticeType,
  priority: NoticePriority,
  targetAudience: string,
  expiresAt?: string,
  conditions?: any,
  actionButton?: { text: string; onClick: () => void }
): Notice => {
  return {
    id: `notice_${Date.now()}`,
    title,
    content,
    type,
    priority,
    targetAudience,
    createdAt: new Date().toISOString(),
    expiresAt,
    isActive: true,
    showOnce: false,
    conditions,
    actionButton
  };
};

// Initialize notices in localStorage if they don't exist
export const initializeNotices = (): Notice[] => {
  const existingNotices = localStorage.getItem('rws-notices');
  if (!existingNotices) {
    const sampleNotices = createSampleNotices();
    localStorage.setItem('rws-notices', JSON.stringify(sampleNotices));
    return sampleNotices;
  }
  return JSON.parse(existingNotices);
};