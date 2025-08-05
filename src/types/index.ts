// Enhanced Types for RWS: Alan Warriors Edition
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Will be hashed with bcrypt
  role: 'user' | 'admin';
  avatar?: UserAvatar;
  createdAt: string;
  lastActive: string;
  isOnline: boolean;
  isBanned: boolean;
  stats: UserStats;
  preferences: UserPreferences;
}

export interface UserAvatar {
  mask: string;
  name: string;
  badge: string;
  color: string;
}

export interface UserStats {
  messagesCount: number;
  formsSubmitted: number;
  eventsAttended: number;
  songsUploaded: number;
  puzzlesSolved: number;
  quizzesCompleted: number;
  achievementsUnlocked: number;
  totalPoints: number;
}

export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  soundEffects: boolean;
  language: string;
}

// Real-time Messaging System
export interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: UserAvatar;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  chatId: string;
  isEdited: boolean;
  editedAt?: string;
  reactions: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  type: 'global' | 'private' | 'group';
  participants: string[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  description?: string;
  lastMessage?: Message;
  unreadCount: Record<string, number>;
}

// Dynamic Form System
export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'checkbox' | 'radio' | 'select' | 'file' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface CustomForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  category: 'event' | 'survey' | 'feedback' | 'registration' | 'quiz' | 'other';
  isActive: boolean;
  requiresApproval: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  deadline?: string;
  allowMultipleSubmissions: boolean;
}

export interface FormSubmission {
  id: string;
  formId: string;
  userId: string;
  username: string;
  responses: Record<string, any>;
  submittedAt: string;
  ipAddress?: string;
  files?: UploadedFile[];
}

// Alan Walker Music System
export interface AlanWalkerTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  releaseDate: string;
  duration: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  category: 'official' | 'remix' | 'fan_creation' | 'unreleased';
  isVerified: boolean;
  uploadedBy: string;
  uploadedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  tags: string[];
  lore?: string;
  trivia?: string[];
}

// Walker Lore System
export interface WalkerLore {
  id: string;
  title: string;
  content: string;
  category: 'biography' | 'song_meaning' | 'production' | 'trivia' | 'fan_theory';
  isUnlocked: boolean;
  unlockCondition: string;
  createdBy: string;
  createdAt: string;
  tags: string[];
}

// Event System
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  requiresApproval: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  maxParticipants?: number;
  participants: string[];
  category: 'gaming' | 'tech' | 'music' | 'social' | 'competition' | 'alan_walker' | 'other';
}

// Puzzle System
export interface Puzzle {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  requiresApproval: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  points: number;
  hints?: string[];
  weekNumber?: number;
  year?: number;
}

export interface PuzzleAttempt {
  id: string;
  puzzleId: string;
  userId: string;
  username: string;
  answer: string;
  isCorrect: boolean | null;
  submittedAt: string;
  pointsEarned: number;
  reviewedBy?: string;
  reviewedAt?: string;
}

// Quiz System
export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  requiresApproval: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  timeLimit?: number;
  category: 'alan_walker' | 'music' | 'general' | 'tech';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  username: string;
  answers: Record<string, string>;
  score: number;
  totalPoints: number;
  completedAt: string;
  timeSpent: number;
}

// AI Assistant System
export interface AIModel {
  id: string;
  name: string;
  description: string;
  trainingData: AITrainingData[];
  responses: AIResponse[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AITrainingData {
  id: string;
  prompt: string;
  response: string;
  category: string;
  addedBy: string;
  addedAt: string;
}

export interface AIResponse {
  id: string;
  prompt: string;
  response: string;
  confidence: number;
  timestamp: string;
  userId: string;
}

// Activity Feed
export interface Activity {
  id: string;
  type: 'user_joined' | 'message_sent' | 'form_submitted' | 'song_uploaded' | 'event_created' | 'puzzle_solved' | 'group_created' | 'achievement_unlocked';
  userId: string;
  username: string;
  description: string;
  timestamp: string;
  data?: any;
}

// Approval System
export interface ApprovalRequest {
  id: string;
  type: 'group' | 'song' | 'event' | 'form' | 'puzzle' | 'quiz';
  itemId: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// Control Center Settings
export interface PlatformSettings {
  id: string;
  darkModeEnabled: boolean;
  challengesEnabled: boolean;
  eventsEnabled: boolean;
  avatarsEnabled: boolean;
  uploadsEnabled: boolean;
  quizzesEnabled: boolean;
  aiAssistantEnabled: boolean;
  globalChatEnabled: boolean;
  registrationEnabled: boolean;
  maintenanceMode: boolean;
  updatedBy: string;
  updatedAt: string;
}

// Achievement System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'puzzle' | 'social' | 'music' | 'creative' | 'special';
  condition: string;
  points: number;
  isSecret: boolean;
  unlockedBy: string[];
}

// Global Stats
export interface GlobalStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  totalForms: number;
  totalEvents: number;
  totalSongs: number;
  totalPuzzles: number;
  pendingApprovals: number;
  totalAchievements: number;
}

// File Upload System
export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

// Real-time Socket Events
export interface SocketEvents {
  // User events
  user_joined: User;
  user_left: { userId: string };
  user_online: { userId: string };
  user_offline: { userId: string };
  
  // Message events
  message_sent: Message;
  message_edited: Message;
  message_deleted: { messageId: string };
  
  // Activity events
  activity_created: Activity;
  
  // Approval events
  approval_requested: ApprovalRequest;
  approval_processed: ApprovalRequest;
  
  // Content events
  form_created: CustomForm;
  event_created: Event;
  song_uploaded: AlanWalkerTrack;
  puzzle_created: Puzzle;
  
  // System events
  settings_updated: PlatformSettings;
  achievement_unlocked: { userId: string; achievementId: string };
}