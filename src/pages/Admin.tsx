import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Settings,
  MessageSquare,
  Star,
  Crown,
  Brain,
  Shield,
  BarChart3,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Zap,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  AlertCircle,
  Target,
  Sparkles,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../contexts/RealtimeContext';
import {
  UserAccount,
  MarkingCriteria,
  Mark,
  ContactMessage,
  HomepageContent,
  PuzzleAttempt,
  Puzzle,
  ChatMessage,
  Event,
  Song
} from '../types';
import {
  initialMarkingCriteria,
  initialHomepageContent,
  getScoreByDifficulty,
} from '../utils/initialData';

export const Admin: React.FC = () => {
  const { user, updateAccount } = useAuth();
  const { broadcastUpdate } = useRealtime();
  const [accounts, setAccounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [criteria] = useLocalStorage<MarkingCriteria[]>('rws-marking-criteria', initialMarkingCriteria);
  const [marks] = useLocalStorage<Mark[]>('rws-marks', []);
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>('rws-messages', []);
  const [content] = useLocalStorage<HomepageContent>('rws-homepage-content', initialHomepageContent);
  const [attempts, setAttempts] = useLocalStorage<PuzzleAttempt[]>('rws-puzzle-attempts', []);
  const [puzzles, setPuzzles] = useLocalStorage<Puzzle[]>('rws-puzzles', []);
  const [chatMessages] = useLocalStorage<ChatMessage[]>('rws-chat-messages', []);
  const [events] = useLocalStorage<Event[]>('rws-events', []);
  const [songs] = useLocalStorage<Song[]>('rws-songs', []);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAttempts, setSelectedAttempts] = useState<string[]>([]);

  // AI Center states
  const [aiKnowledge, setAiKnowledge] = useLocalStorage<string[]>('rws-ai-knowledge', []);
  const [newKnowledge, setNewKnowledge] = useState('');
  const [systemLogs, setSystemLogs] = useLocalStorage<any[]>('rws-system-logs', []);
  const [errorLogs, setErrorLogs] = useLocalStorage<any[]>('rws-error-logs', []);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      broadcastUpdate('admin_refresh', { timestamp: Date.now() });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [broadcastUpdate]);

  // Filter accounts based on search and status
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         acc.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || acc.status === filterStatus;
    return matchesSearch && matchesStatus && acc.email !== 'spiderwarrior15@gmail.com';
  });

  // Get pending puzzle attempts
  const pendingAttempts = attempts.filter(attempt => attempt.isCorrect === null);
  const unreadMessages = messages.filter(msg => !msg.isRead);

  // Calculate statistics
  const stats = {
    totalUsers: accounts.filter(acc => acc.status === 'approved').length,
    pendingApprovals: accounts.filter(acc => acc.status === 'pending').length,
    totalPuzzles: puzzles.length,
    activePuzzles: puzzles.filter(p => p.isActive).length,
    totalAttempts: attempts.length,
    correctAttempts: attempts.filter(a => a.isCorrect === true).length,
    pendingReviews: pendingAttempts.length,
    unreadMessages: unreadMessages.length,
    totalEvents: events.length,
    totalSongs: songs.length,
    totalChatMessages: chatMessages.length,
    totalMarks: marks.length
  };

  // Device analytics (simulated)
  const deviceStats = {
    desktop: Math.floor(stats.totalUsers * 0.6),
    mobile: Math.floor(stats.totalUsers * 0.35),
    tablet: Math.floor(stats.totalUsers * 0.05)
  };

  // Handle role toggle
  const handleRoleToggle = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    const newRole = account.role === 'Warrior' ? 'Commander' : 'Warrior';
    const updatedAccounts = accounts.map(acc =>
      acc.id === accountId ? { ...acc, role: newRole } : acc
    );
    setAccounts(updatedAccounts);
    updateAccount(accountId, { role: newRole });
    broadcastUpdate('role_updated', { accountId, newRole });
  };

  // Handle account status change
  const handleStatusChange = (accountId: string, newStatus: 'approved' | 'rejected') => {
    const updatedAccounts = accounts.map(acc =>
      acc.id === accountId ? { 
        ...acc, 
        status: newStatus,
        approvedAt: newStatus === 'approved' ? new Date().toISOString() : undefined,
        approvedBy: newStatus === 'approved' ? user?.username : undefined
      } : acc
    );
    setAccounts(updatedAccounts);
    broadcastUpdate('account_status_updated', { accountId, newStatus });
  };

  // Handle puzzle attempt review
  const handleAttemptReview = (attemptId: string, isCorrect: boolean) => {
    const attempt = attempts.find(a => a.id === attemptId);
    if (!attempt) return;

    const puzzle = puzzles.find(p => p.id === attempt.puzzleId);
    if (!puzzle) return;

    const score = isCorrect ? getScoreByDifficulty(puzzle.difficulty) : 0;
    
    const updatedAttempts = attempts.map(a =>
      a.id === attemptId ? {
        ...a,
        isCorrect,
        score,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.username || 'admin'
      } : a
    );
    
    setAttempts(updatedAttempts);
    broadcastUpdate('attempt_reviewed', { attemptId, isCorrect, score });
  };

  // Handle bulk attempt review
  const handleBulkReview = (isCorrect: boolean) => {
    if (selectedAttempts.length === 0) return;

    const updatedAttempts = attempts.map(attempt => {
      if (selectedAttempts.includes(attempt.id)) {
        const puzzle = puzzles.find(p => p.id === attempt.puzzleId);
        const score = isCorrect && puzzle ? getScoreByDifficulty(puzzle.difficulty) : 0;
        
        return {
          ...attempt,
          isCorrect,
          score,
          reviewedAt: new Date().toISOString(),
          reviewedBy: user?.username || 'admin'
        };
      }
      return attempt;
    });
    
    setAttempts(updatedAttempts);
    setSelectedAttempts([]);
    broadcastUpdate('bulk_review_completed', { count: selectedAttempts.length, isCorrect });
  };

  // Handle message actions
  const handleMarkMessageAsRead = (messageId: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, isRead: true } : msg
    );
    setMessages(updatedMessages);
    broadcastUpdate('message_read', { messageId });
  };

  const handleDeleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    broadcastUpdate('message_deleted', { messageId });
  };
  
  // AI Center functions
  const handleAddKnowledge = () => {
    if (newKnowledge.trim()) {
      const knowledge = {
        id: Date.now().toString(),
        content: newKnowledge.trim(),
        addedAt: new Date().toISOString(),
        addedBy: user?.username || 'admin'
      };
      setAiKnowledge([...aiKnowledge, knowledge]);
      setNewKnowledge('');
      broadcastUpdate('ai_knowledge_added', knowledge);
    }
  };
  
  const handleDeleteKnowledge = (id: string) => {
    setAiKnowledge(aiKnowledge.filter(k => k.id !== id));
    broadcastUpdate('ai_knowledge_deleted', { id });
  };
  
  const handleClearLogs = (type: 'system' | 'error') => {
    if (type === 'system') {
      setSystemLogs([]);
    } else {
      setErrorLogs([]);
    }
    broadcastUpdate('logs_cleared', { type });
  };
  
  const handleSystemOptimization = () => {
    // Simulate system optimization
    const log = {
      id: Date.now().toString(),
      type: 'optimization',
      message: 'System optimization completed successfully',
      timestamp: new Date().toISOString(),
      details: 'Cleaned cache, optimized database, removed unused files'
    };
    setSystemLogs([log, ...systemLogs]);
    alert('System optimization completed!');
  };

  // Get user name
  const getUserName = (userId: string) => {
    const account = accounts.find(acc => acc.id === userId);
    return account?.name || 'Unknown User';
  };

  // Tab configuration
  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      count: 0,
      description: 'Overview and analytics'
    },
    { 
      id: 'accounts', 
      label: 'Account Management', 
      icon: Users, 
      count: filteredAccounts.length,
      description: 'Manage user accounts'
    },
    { 
      id: 'puzzle-correction', 
      label: 'Puzzle Correction', 
      icon: Brain, 
      count: pendingAttempts.length,
      description: 'Review puzzle submissions'
    },
    { 
      id: 'warriors', 
      label: 'Warriors List', 
      icon: Shield, 
      count: accounts.filter(acc => acc.status === 'approved').length,
      description: 'View all warriors'
    },
    { 
      id: 'criteria', 
      label: 'Marking Criteria', 
      icon: Star, 
      count: criteria.filter(c => c.isActive).length,
      description: 'Manage marking criteria'
    },
    { 
      id: 'marks', 
      label: 'Warrior Marks', 
      icon: Crown, 
      count: marks.length,
      description: 'View all marks'
    },
    { 
      id: 'messages', 
      label: 'Contact Messages', 
      icon: MessageSquare, 
      count: unreadMessages.length,
      description: 'Handle contact messages'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: TrendingUp, 
      count: 0,
      description: 'Platform analytics'
    },
    { 
      id: 'ai-center', 
      label: 'AI Center', 
      icon: Bot, 
      count: aiKnowledge.length,
      description: 'Manage AI assistant'
    },
    { 
      id: 'homepage', 
      label: 'Homepage Content', 
      icon: Settings, 
      count: 0,
      description: 'Manage homepage'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
                { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
                { label: 'Active Puzzles', value: stats.activePuzzles, icon: Brain, color: 'from-purple-500 to-purple-600' },
                { label: 'Unread Messages', value: stats.unreadMessages, icon: Mail, color: 'from-red-500 to-red-600' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Platform Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  Platform Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Attempts</span>
                    <span className="font-bold text-white">{stats.totalAttempts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Correct Answers</span>
                    <span className="font-bold text-green-400">{stats.correctAttempts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="font-bold text-blue-400">
                      {stats.totalAttempts > 0 ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Chat Messages</span>
                    <span className="font-bold text-purple-400">{stats.totalChatMessages}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-400" />
                  Device Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Desktop</span>
                    </div>
                    <span className="font-bold text-white">{deviceStats.desktop}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Mobile</span>
                    </div>
                    <span className="font-bold text-white">{deviceStats.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tablet className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">Tablet</span>
                    </div>
                    <span className="font-bold text-white">{deviceStats.tablet}</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {pendingAttempts.slice(0, 5).map(attempt => {
                  const puzzle = puzzles.find(p => p.id === attempt.puzzleId);
                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{getUserName(attempt.userId)}</div>
                        <div className="text-sm text-gray-400">
                          Submitted answer for {puzzle?.difficulty} puzzle
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(attempt.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        );

      case 'accounts':
        return (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white selectable"
                  placeholder="Search accounts..."
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Accounts List */}
            <div className="space-y-4">
              {filteredAccounts.map(account => (
                <GlassCard key={account.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        {account.avatar ? (
                          <img src={account.avatar} alt={account.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{account.name}</h3>
                        <p className="text-sm text-gray-400">{account.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            account.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            account.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {account.status}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            account.role === 'Commander' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {account.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {account.status === 'pending' && (
                        <>
                          <AnimatedButton
                            variant="primary"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleStatusChange(account.id, 'approved')}
                          >
                            Approve
                          </AnimatedButton>
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            icon={XCircle}
                            onClick={() => handleStatusChange(account.id, 'rejected')}
                            className="text-red-400"
                          >
                            Reject
                          </AnimatedButton>
                        </>
                      )}
                      {account.status === 'approved' && (
                        <AnimatedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRoleToggle(account.id)}
                        >
                          Toggle Role
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{account.whatsapp}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{account.city}, {account.country}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(account.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );

      case 'puzzle-correction':
        return (
          <div className="space-y-6">
            {/* Bulk Actions */}
            {selectedAttempts.length > 0 && (
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">{selectedAttempts.length} attempts selected</span>
                  <div className="flex space-x-2">
                    <AnimatedButton
                      variant="primary"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleBulkReview(true)}
                    >
                      Approve All
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleBulkReview(false)}
                      className="text-red-400"
                    >
                      Reject All
                    </AnimatedButton>
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedAttempts([])}
                    >
                      Clear
                    </AnimatedButton>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Pending Attempts */}
            <div className="space-y-4">
              {pendingAttempts.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">No pending reviews</h3>
                  <p className="text-gray-500">All puzzle attempts have been reviewed!</p>
                </GlassCard>
              ) : (
                pendingAttempts.map(attempt => {
                  const puzzle = puzzles.find(p => p.id === attempt.puzzleId);
                  const isSelected = selectedAttempts.includes(attempt.id);
                  
                  return (
                    <GlassCard key={attempt.id} className={`p-6 ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAttempts([...selectedAttempts, attempt.id]);
                              } else {
                                setSelectedAttempts(selectedAttempts.filter(id => id !== attempt.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-bold text-white">{getUserName(attempt.userId)}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                puzzle?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                puzzle?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                puzzle?.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {puzzle?.difficulty?.toUpperCase()} • {puzzle ? getScoreByDifficulty(puzzle.difficulty) : 0} PTS
                              </span>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-4 mb-4">
                              <h4 className="font-medium text-white mb-2">Question:</h4>
                              <p className="text-gray-300 mb-4 selectable">{puzzle?.question}</p>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium text-green-400 mb-1">Correct Answer:</h5>
                                  <p className="text-green-300 font-mono selectable">{puzzle?.answer}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-blue-400 mb-1">User Answer:</h5>
                                  <p className="text-blue-300 font-mono selectable">{attempt.userAnswer}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-400">
                              Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <AnimatedButton
                            variant="primary"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleAttemptReview(attempt.id, true)}
                          >
                            Correct
                          </AnimatedButton>
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            icon={XCircle}
                            onClick={() => handleAttemptReview(attempt.id, false)}
                            className="text-red-400"
                          >
                            Incorrect
                          </AnimatedButton>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'warriors':
        return (
          <div className="space-y-4">
            {accounts.filter(acc => acc.status === 'approved' && acc.email !== 'spiderwarrior15@gmail.com').map(account => (
              <GlassCard key={account.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      {account.avatar ? (
                        <img src={account.avatar} alt={account.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{account.name}</h3>
                      <p className="text-sm text-gray-400">{account.email}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        account.role === 'Commander' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {account.role}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Joined: {new Date(account.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        );

      case 'criteria':
        return (
          <div className="space-y-4">
            {criteria.map(criterion => (
              <GlassCard key={criterion.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{criterion.name}</h3>
                    <p className="text-sm text-gray-400 selectable">{criterion.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-purple-400">Max Score: {criterion.maxScore}</span>
                      <span className="text-blue-400">Category: {criterion.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        criterion.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {criterion.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        );

      case 'marks':
        return (
          <div className="space-y-4">
            {marks.map(mark => {
              const criterion = criteria.find(c => c.id === mark.criteriaId);
              return (
                <GlassCard key={mark.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{getUserName(mark.warriorId)}</h3>
                      <p className="text-sm text-gray-400">{criterion?.name}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-yellow-400">Score: {mark.score}/{criterion?.maxScore}</span>
                        <span className="text-blue-400">By: {mark.markedBy}</span>
                      </div>
                      {mark.feedback && (
                        <p className="text-sm text-gray-300 mt-2 selectable">{mark.feedback}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(mark.markedAt).toLocaleDateString()}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-4">
            {messages.map(message => (
              <GlassCard key={message.id} className={`p-6 ${!message.isRead ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{message.name}</h3>
                      <span className="text-sm text-gray-400">({message.email})</span>
                      {!message.isRead && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-4 selectable">{message.message}</p>
                    <div className="text-sm text-gray-400">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {!message.isRead && (
                      <AnimatedButton
                        variant="primary"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleMarkMessageAsRead(message.id)}
                      >
                        Mark Read
                      </AnimatedButton>
                    )}
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-red-400"
                    >
                      Delete
                    </AnimatedButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Content Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Events</span>
                    <span className="text-white font-bold">{stats.totalEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Music Tracks</span>
                    <span className="text-white font-bold">{stats.totalSongs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Marks</span>
                    <span className="text-white font-bold">{stats.totalMarks}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Engagement Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Chat Messages</span>
                    <span className="text-white font-bold">{stats.totalChatMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Puzzle Success Rate</span>
                    <span className="text-green-400 font-bold">
                      {stats.totalAttempts > 0 ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Active Users</span>
                    <span className="text-blue-400 font-bold">{stats.totalUsers}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        );

      case 'ai-center':
        return (
          <div className="space-y-6">
            {/* AI Knowledge Management */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-purple-400" />
                AI Knowledge Base
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Add Knowledge to AI Buddy
                  </label>
                  <textarea
                    value={newKnowledge}
                    onChange={(e) => setNewKnowledge(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
                    rows={4}
                    placeholder="Enter information for the AI to learn..."
                  />
                </div>
                <AnimatedButton
                  variant="primary"
                  onClick={handleAddKnowledge}
                  disabled={!newKnowledge.trim()}
                >
                  Add to Knowledge Base
                </AnimatedButton>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-white">Current Knowledge ({aiKnowledge.length} entries)</h4>
                {aiKnowledge.length === 0 ? (
                  <p className="text-gray-400 text-sm">No knowledge entries yet.</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {aiKnowledge.map((knowledge) => (
                      <div key={knowledge.id} className="p-3 bg-white/5 rounded-lg flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-white text-sm">{knowledge.content}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Added by {knowledge.addedBy} on {new Date(knowledge.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteKnowledge(knowledge.id)}
                          className="ml-2 p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
            
            {/* System Management */}
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-400" />
                  System Management
                </h3>
                
                <div className="space-y-4">
                  <AnimatedButton
                    variant="primary"
                    icon={RefreshCw}
                    onClick={handleSystemOptimization}
                    className="w-full"
                  >
                    Optimize System
                  </AnimatedButton>
                  
                  <AnimatedButton
                    variant="secondary"
                    icon={Trash2}
                    onClick={() => handleClearLogs('system')}
                    className="w-full"
                  >
                    Clear System Logs
                  </AnimatedButton>
                  
                  <AnimatedButton
                    variant="ghost"
                    icon={AlertCircle}
                    onClick={() => handleClearLogs('error')}
                    className="w-full text-red-400"
                  >
                    Clear Error Logs
                  </AnimatedButton>
                </div>
              </GlassCard>
              
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  System Status
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">AI Buddy Status</span>
                    <span className="text-green-400 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Database</span>
                    <span className="text-green-400 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Connected
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">News Service</span>
                    <span className="text-green-400 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">System Load</span>
                    <span className="text-yellow-400">Normal</span>
                  </div>
                </div>
              </GlassCard>
            </div>
            
            {/* Error Logs */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                Recent System Logs
              </h3>
              
              {systemLogs.length === 0 ? (
                <p className="text-gray-400">No system logs available.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {systemLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${
                          log.type === 'error' ? 'text-red-400' :
                          log.type === 'warning' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {log.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white text-sm">{log.message}</p>
                      {log.details && (
                        <p className="text-gray-400 text-xs mt-1">{log.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        );

      case 'homepage':
        return (
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Homepage Content</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Hero Title</h4>
                <p className="text-gray-300 selectable">{content.heroTitle}</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Description</h4>
                <p className="text-gray-300 selectable">{content.heroDescription}</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Tagline</h4>
                <p className="text-gray-300 selectable">{content.tagline}</p>
              </div>
              <div className="text-sm text-gray-400">
                Last updated: {new Date(content.lastUpdated).toLocaleString()}
              </div>
            </div>
          </GlassCard>
        );

      default:
        return <div className="text-white">Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <Crown className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Commander Control Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xl text-gray-400">
            Manage the Royal Warriors Squad platform with live updates
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-purple-500/20 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-1 text-xs bg-white/20 text-white rounded-full px-2 py-0.5 font-semibold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};