import { Song, Puzzle, Event, MarkingCriteria, HomepageContent, ChatGroup, ChatMessage } from '../types';
import { autoGeneratePuzzles } from './puzzleGenerator';

export const initialSongs: Song[] = [
  {
    id: '1',
    title: 'Faded',
    artist: 'Alan Walker',
    embedUrl: 'https://www.youtube.com/embed/60ItHLz5WEA',
  },
  {
    id: '2',
    title: 'Alone',
    artist: 'Alan Walker',
    embedUrl: 'https://www.youtube.com/embed/1-xGerv5FOk',
  },
  {
    id: '3',
    title: 'Darkside',
    artist: 'Alan Walker ft. Au/Ra and Tomine Harket',
    embedUrl: 'https://www.youtube.com/embed/M-P4QBt-FWw',
  },
  {
    id: '4',
    title: 'On My Way',
    artist: 'Alan Walker, Sabrina Carpenter & Farruko',
    embedUrl: 'https://www.youtube.com/embed/dhYOPzcsbGM',
  }
];

export const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
};

// Generate initial puzzles automatically
export const initialPuzzles: Puzzle[] = autoGeneratePuzzles([], getCurrentWeek(), new Date().getFullYear());

export const initialEvents: Event[] = [
  {
    id: '1',
    title: 'RWS Annual Meet',
    description: 'Join us for our annual community gathering with exciting activities, workshops, and networking opportunities.',
    date: '2024-12-15',
    place: 'Community Center, Downtown',
    time: '10:00 AM'
  },
  {
    id: '2',
    title: 'Gaming Tournament',
    description: 'Epic gaming tournament featuring multiple games and amazing prizes for winners.',
    date: '2024-12-20',
    place: 'Gaming Arena, Tech Hub',
    time: '2:00 PM'
  },
  {
    id: '3',
    title: 'Tech Workshop',
    description: 'Learn the latest technologies and development practices in our hands-on workshop.',
    date: '2025-01-05',
    place: 'Innovation Lab, University',
    time: '9:00 AM'
  }
];

export const initialMarkingCriteria: MarkingCriteria[] = [
  {
    id: '1',
    name: 'Event Participation',
    description: 'Active participation in community events and activities',
    maxScore: 10,
    category: 'participation',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Creative Contribution',
    description: 'Original ideas, creative solutions, and innovative thinking',
    maxScore: 15,
    category: 'creativity',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Technical Skills',
    description: 'Demonstration of technical expertise and problem-solving abilities',
    maxScore: 20,
    category: 'technical',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Leadership',
    description: 'Taking initiative, mentoring others, and leading by example',
    maxScore: 15,
    category: 'leadership',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Team Collaboration',
    description: 'Working effectively with others and contributing to team success',
    maxScore: 10,
    category: 'collaboration',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const initialHomepageContent: HomepageContent = {
  id: '1',
  heroTitle: 'ROYAL WARRIORS SQUAD',
  heroSubtitle: '',
  heroDescription: 'Unleashing Passion, Power & Purpose in an elite brotherhood where creativity meets technology and legends are born',
  welcomeBadgeText: 'Welcome to the Royal Court',
  primaryButtonText: 'Join the Squad',
  secondaryButtonText: 'Explore Missions',
  aboutTitle: 'The Royal Legacy',
  aboutDescription: 'Royal Warriors Squad is more than just a community – we\'re an elite brotherhood of creative minds, tech innovators, and passionate individuals united by our shared vision of conquering the digital realm.',
  missionTitle: 'Our Royal Mission',
  missionDescription: 'We believe in the power of royal collaboration, boundless creativity, and continuous evolution. Our mission is to forge a kingdom where young warriors can explore, create, and ascend together while building something truly legendary.',
  tagline: 'Unleashing Passion, Power & Purpose',
  taglineSubtext: 'Where legends are born and warriors unite for greatness',
  features: [
    {
      id: '1',
      title: 'Elite Community',
      description: 'Join a brotherhood of passionate warriors united by purpose',
      icon: 'Users'
    },
    {
      id: '2',
      title: 'Royal Power',
      description: 'Unleash your potential with cutting-edge resources and training',
      icon: 'Zap'
    },
    {
      id: '3',
      title: 'Noble Purpose',
      description: 'Find your mission and make a meaningful impact on the world',
      icon: 'Target'
    }
  ],
  stats: [
    {
      id: '1',
      value: '500+',
      label: 'Elite Warriors',
      color: 'from-yellow-500/10 to-yellow-600/10'
    },
    {
      id: '2',
      value: '50+',
      label: 'Royal Missions',
      color: 'from-blue-500/10 to-blue-600/10'
    },
    {
      id: '3',
      value: '25+',
      label: 'Legendary Projects',
      color: 'from-purple-500/10 to-purple-600/10'
    },
    {
      id: '4',
      value: '∞',
      label: 'Royal Passion',
      color: 'from-pink-500/10 to-pink-600/10'
    }
  ],
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
};

export const getScoreByDifficulty = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy': return 5;
    case 'medium': return 10;
    case 'hard': return 15;
    case 'super_hard': return 20;
    default: return 0;
  }
};

// Chat System Initial Data - Empty by default
export const initialChatGroups: ChatGroup[] = [
  {
    id: '1',
    name: 'General Discussion',
    description: 'Main chat for all warriors to discuss anything',
    type: 'public',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    members: [],
    admins: [],
    isActive: true,
    lastActivity: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Tech Warriors',
    description: 'For discussing technology, programming, and development',
    type: 'public',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    members: [],
    admins: [],
    isActive: true,
    lastActivity: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Gaming Squad',
    description: 'Gaming discussions, tournaments, and strategies',
    type: 'public',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    members: [],
    admins: [],
    isActive: true,
    lastActivity: new Date().toISOString()
  }
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    groupId: '1',
    senderId: 'system',
    senderName: 'Royal Warriors Squad',
    content: 'Welcome to the Royal Warriors Squad chat! 🎉 Join groups and start connecting with fellow warriors!',
    type: 'text',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    reactions: [],
    isDeleted: false
  }
];