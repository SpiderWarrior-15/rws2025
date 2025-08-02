import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Users, 
  MessageCircle, 
  FileText, 
  Music, 
  Calendar, 
  Brain, 
  Activity,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bot,
  Send,
  Trash2,
  UserPlus,
  UserMinus,
  Eye,
  Download,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { fileService } from '../services/fileService';
import { aiService } from '../services/aiService';
import { socketService } from '../services/socketService';
import { 
  User, 
  Message, 
  Chat, 
  CustomForm, 
  FormSubmission, 
  SongUpload, 
  Event, 
  ApprovalRequest,
  Activity as ActivityType,
  AITrainingData,
  GlobalStats
} from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AdminPanel: React.FC = () => {
  const { user, users, promoteUser, banUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages' | 'approvals' | 'ai' | 'analytics'>('overview');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [songs, setSongs] = useState<SongUpload[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiTraining, setAiTraining] = useState<AITrainingData[]>([]);
  const [isTrainingAI, setIsTrainingAI] = useState(false);
  const [trainingData, setTrainingData] = useState({ prompt: '', response: '', category: 'general' });
  const [stats, setStats] = useState<GlobalStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalForms: 0,
    totalEvents: 0,
    totalSongs: 0,
    totalPuzzles: 0,
    pendingApprovals: 0
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    try {
      const [
        allMessages,
        allChats,
        allForms,
        allSubmissions,
        allSongs,
        allEvents,
        allApprovals,
        allActivities,
        trainingData
      ] = await Promise.all([
        fileService.getMessages(),
        fileService.getChats(),
        fileService.getForms(),
        fileService.getFormSubmissions(),
        fileService.getSongUploads(),
        fileService.getEvents(),
        fileService.getApprovalRequests(),
        fileService.getActivities(),
        aiService.getTrainingData()
      ]);

      setMessages(allMessages);
      setChats(allChats);
      setForms(allForms);
      setSubmissions(allSubmissions);
      setSongs(allSongs);
      setEvents(allEvents);
      setApprovals(allApprovals);
      setActivities(allActivities);
      setAiTraining(trainingData);

      // Calculate stats
      const activeUsers = users.filter(u => u.isOnline && !u.isBanned).length;
      const pendingApprovals = allApprovals.filter(a => a.status === 'pending').length;

      setStats({
        totalUsers: users.length,
        activeUsers,
        totalMessages: allMessages.length,
        totalForms: allForms.length,
        totalEvents: allEvents.length,
        totalSongs: allSongs.length,
        totalPuzzles: 0, // Will be implemented
        pendingApprovals
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleAICommand = async () => {
    if (!aiPrompt.trim()) return;

    try {
      const response = await aiService.processCommand(aiPrompt, user!.id);
      setAiResponse(response);
      setAiPrompt('');
      
      // Execute actual commands based on prompt
      const lowerPrompt = aiPrompt.toLowerCase();
      
      if (lowerPrompt.includes('approve all pending songs')) {
        const pendingSongs = songs.filter(s => !s.isApproved);
        for (const song of pendingSongs) {
          await fileService.updateSongUpload(song.id, {
            isApproved: true,
            approvedBy: user!.id,
            approvedAt: new Date().toISOString()
          });
        }
        toast.success(`Approved ${pendingSongs.length} songs`);
        loadAllData();
      }
      
      if (lowerPrompt.includes('approve all pending groups')) {
        const pendingGroups = chats.filter(c => !c.isVerified && c.type === 'group');
        for (const group of pendingGroups) {
          await fileService.updateChat(group.id, {
            isVerified: true,
            verifiedBy: user!.id,
            verifiedAt: new Date().toISOString()
          });
        }
        toast.success(`Approved ${pendingGroups.length} groups`);
        loadAllData();
      }
      
    } catch (error) {
      console.error('AI command error:', error);
      toast.error('Failed to process AI command');
    }
  };

  const handleTrainAI = async () => {
    if (!trainingData.prompt || !trainingData.response) return;

    try {
      await aiService.trainModel(
        trainingData.prompt,
        trainingData.response,
        trainingData.category,
        user!.id
      );
      
      setTrainingData({ prompt: '', response: '', category: 'general' });
      setIsTrainingAI(false);
      toast.success('AI training data added successfully');
      
      const updatedTraining = await aiService.getTrainingData();
      setAiTraining(updatedTraining);
    } catch (error) {
      console.error('AI training error:', error);
      toast.error('Failed to train AI');
    }
  };

  const handleApproval = async (approvalId: string, approved: boolean, rejectionReason?: string) => {
    try {
      const approval = approvals.find(a => a.id === approvalId);
      if (!approval) return;

      await fileService.updateApprovalRequest(approvalId, {
        status: approved ? 'approved' : 'rejected',
        reviewedBy: user!.id,
        reviewedAt: new Date().toISOString(),
        rejectionReason
      });

      // Update the actual item based on type
      if (approval.type === 'song') {
        await fileService.updateSongUpload(approval.itemId, {
          isApproved: approved,
          approvedBy: user!.id,
          approvedAt: approved ? new Date().toISOString() : undefined,
          rejectionReason
        });
      } else if (approval.type === 'group') {
        await fileService.updateChat(approval.itemId, {
          isVerified: approved,
          verifiedBy: user!.id,
          verifiedAt: new Date().toISOString()
        });
      }

      toast.success(`${approval.type} ${approved ? 'approved' : 'rejected'} successfully`);
      loadAllData();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to process approval');
    }
  };

  const exportData = (data: any[], filename: string) => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'approvals', name: 'Approvals', icon: CheckCircle },
    { id: 'ai', name: 'AI Assistant', icon: Bot },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can access this panel
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600/20 to-purple-600/20 backdrop-blur-xl border border-red-500/30 mb-8 shadow-lg shadow-red-500/10">
            <Crown className="w-6 h-6 text-red-400 mr-3 animate-pulse" />
            <span className="text-lg font-semibold text-red-400">God Mode Activated</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Admin Command Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Ultimate control over the RWS: Alan Warriors Edition platform
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-lg min-w-max">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-500 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard className="p-6 text-center border-blue-500/20">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-400 mb-1">{stats.totalUsers}</div>
                <div className="text-sm text-gray-400">Total Users</div>
                <div className="text-xs text-green-400 mt-1">{stats.activeUsers} online</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-purple-500/20">
                <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-400 mb-1">{stats.totalMessages}</div>
                <div className="text-sm text-gray-400">Messages</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-green-500/20">
                <FileText className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.totalForms}</div>
                <div className="text-sm text-gray-400">Forms</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-yellow-500/20">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.pendingApprovals}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </GlassCard>
            </div>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Live Activity Feed
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activities.slice(-10).reverse().map(activity => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800 dark:text-white">
                        <strong>{activity.username}</strong> {activity.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                User Management ({users.length})
              </h2>
              <AnimatedButton
                variant="secondary"
                icon={Download}
                onClick={() => exportData(users, 'users')}
              >
                Export Users
              </AnimatedButton>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(warrior => (
                <GlassCard key={warrior.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {warrior.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {warrior.username}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {warrior.email}
                        </p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${warrior.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Role:</span>
                      <span className={`font-medium ${
                        warrior.role === 'admin' ? 'text-red-400' :
                        warrior.role === 'commander' ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {warrior.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Messages:</span>
                      <span className="text-gray-800 dark:text-white">{warrior.stats.messagesCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                      <span className="text-gray-800 dark:text-white">
                        {format(new Date(warrior.joinedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {warrior.role === 'warrior' && (
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={UserPlus}
                        onClick={() => promoteUser(warrior.id, 'commander')}
                        className="flex-1"
                      >
                        Promote
                      </AnimatedButton>
                    )}
                    {warrior.role === 'commander' && (
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={UserMinus}
                        onClick={() => promoteUser(warrior.id, 'warrior')}
                        className="flex-1"
                      >
                        Demote
                      </AnimatedButton>
                    )}
                    {warrior.id !== user?.id && (
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        icon={Shield}
                        onClick={() => banUser(warrior.id)}
                        className="text-red-500"
                      >
                        Ban
                      </AnimatedButton>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                All Messages ({messages.length})
              </h2>
              <AnimatedButton
                variant="secondary"
                icon={Download}
                onClick={() => exportData(messages, 'messages')}
              >
                Export Messages
              </AnimatedButton>
            </div>

            <GlassCard className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.slice(-50).reverse().map(message => (
                  <div key={message.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {message.senderUsername.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {message.senderUsername}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.timestamp), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {message.content}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this message?')) {
                          fileService.deleteFromFile('messages.json', message.id);
                          loadAllData();
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Pending Approvals ({approvals.filter(a => a.status === 'pending').length})
            </h2>

            <div className="space-y-4">
              {approvals.filter(a => a.status === 'pending').map(approval => (
                <GlassCard key={approval.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                        {approval.type.toUpperCase()} Approval Request
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Requested by user ID: {approval.requestedBy}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(approval.requestedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleApproval(approval.id, true)}
                        className="bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        Approve
                      </AnimatedButton>
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={XCircle}
                        onClick={() => {
                          const reason = prompt('Rejection reason (optional):');
                          handleApproval(approval.id, false, reason || undefined);
                        }}
                        className="bg-red-500/20 text-red-400 border-red-500/30"
                      >
                        Reject
                      </AnimatedButton>
                    </div>
                  </div>
                </GlassCard>
              ))}

              {approvals.filter(a => a.status === 'pending').length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">
                    All caught up!
                  </h3>
                  <p className="text-gray-500">No pending approvals at this time.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* AI Chat Interface */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-purple-500" />
                  AI Assistant
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg min-h-[200px]">
                    {aiResponse ? (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-purple-400">AI Response:</div>
                        <div className="text-gray-800 dark:text-white">{aiResponse}</div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        Ask me anything about platform management!
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAICommand()}
                      className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder="Ask AI assistant..."
                    />
                    <AnimatedButton
                      variant="primary"
                      icon={Send}
                      onClick={handleAICommand}
                      disabled={!aiPrompt.trim()}
                    >
                      Send
                    </AnimatedButton>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Try: "show me most active warriors", "approve all pending songs", "generate activity report"
                  </div>
                </div>
              </GlassCard>

              {/* AI Training */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Train AI Assistant
                </h3>
                
                {!isTrainingAI ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Current training data: {aiTraining.length} entries
                    </div>
                    <AnimatedButton
                      variant="secondary"
                      onClick={() => setIsTrainingAI(true)}
                      className="w-full"
                    >
                      Add Training Data
                    </AnimatedButton>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {aiTraining.slice(-5).map(data => (
                        <div key={data.id} className="p-2 bg-white/5 rounded text-sm">
                          <div className="font-medium text-gray-800 dark:text-white">
                            {data.prompt}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 truncate">
                            {data.response}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prompt
                      </label>
                      <input
                        type="text"
                        value={trainingData.prompt}
                        onChange={(e) => setTrainingData({ ...trainingData, prompt: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                        placeholder="Enter command or question"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Response
                      </label>
                      <textarea
                        value={trainingData.response}
                        onChange={(e) => setTrainingData({ ...trainingData, response: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                        rows={4}
                        placeholder="Enter expected response"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={trainingData.category}
                        onChange={(e) => setTrainingData({ ...trainingData, category: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      >
                        <option value="general">General</option>
                        <option value="moderation">Moderation</option>
                        <option value="analytics">Analytics</option>
                        <option value="communication">Communication</option>
                        <option value="reporting">Reporting</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-2">
                      <AnimatedButton
                        variant="primary"
                        onClick={handleTrainAI}
                        disabled={!trainingData.prompt || !trainingData.response}
                        className="flex-1"
                      >
                        Train AI
                      </AnimatedButton>
                      <AnimatedButton
                        variant="ghost"
                        onClick={() => {
                          setIsTrainingAI(false);
                          setTrainingData({ prompt: '', response: '', category: 'general' });
                        }}
                      >
                        Cancel
                      </AnimatedButton>
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Platform Analytics
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <GlassCard className="p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">User Growth</h3>
                <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalUsers}</div>
                <div className="text-sm text-gray-400">Total registered warriors</div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Engagement</h3>
                <div className="text-3xl font-bold text-green-400 mb-2">{stats.totalMessages}</div>
                <div className="text-sm text-gray-400">Messages exchanged</div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Content</h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {stats.totalForms + stats.totalEvents + stats.totalSongs}
                </div>
                <div className="text-sm text-gray-400">Total content items</div>
              </GlassCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <GlassCard className="p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Recent Form Submissions</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {submissions.slice(-10).reverse().map(submission => (
                    <div key={submission.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <span className="text-sm text-gray-800 dark:text-white">{submission.username}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(submission.submittedAt), 'MMM dd')}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Song Upload Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Approved:</span>
                    <span className="text-green-400">{songs.filter(s => s.isApproved).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                    <span className="text-yellow-400">{songs.filter(s => !s.isApproved).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="text-gray-800 dark:text-white">{songs.length}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};