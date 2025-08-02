// Core User Types
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Plaintext for now
  role: 'admin' | 'commander' | 'warrior';
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  isOnline: boolean;
  isBanned: boolean;
  stats: {
    messagesCount: number;
    formsSubmitted: number;
    eventsAttended: number;
    songsUploaded: number;
    puzzlesSolved: number;
  };
}

// Real-time Messaging System
export interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
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

// Song Upload System
export interface SongUpload {
  id: string;
  title: string;
  artist: string;
  uploadedBy: string;
  uploaderUsername: string;
  fileUrl?: string;
  youtubeUrl?: string;
  description: string;
  uploadedAt: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  category: 'alan_walker' | 'original' | 'remix' | 'cover' | 'other';
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
  category: 'gaming' | 'tech' | 'music' | 'social' | 'competition' | 'other';
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
}

export interface PuzzleAttempt {
  id: string;
  puzzleId: string;
  userId: string;
  username: string;
  answer: string;
  isCorrect: boolean;
  submittedAt: string;
  pointsEarned: number;
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
  category: string;
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
  type: 'user_joined' | 'message_sent' | 'form_submitted' | 'song_uploaded' | 'event_created' | 'puzzle_solved' | 'group_created';
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
  song_uploaded: SongUpload;
  puzzle_created: Puzzle;
}

// News and Announcements (Enhanced)
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: 'tech' | 'ai' | 'smartphone' | 'general' | 'alan_walker' | 'warrior_news';
  isPublished: boolean;
  views: number;
  tags?: string[];
  source?: string;
  imageUrl?: string;
  isAutoGenerated?: boolean;
  isExpanded?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent' | 'achievement' | 'news' | 'welcome';
  author: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  autoGenerated?: boolean;
  relatedData?: any;
  isExpanded?: boolean;
}