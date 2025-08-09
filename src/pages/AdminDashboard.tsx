import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Brain, 
  FileText, 
  Calendar, 
  Settings,
  Shield,
  Activity,
  BarChart3,
  Crown,
  Search,
  Filter,
  Edit,
  Trash2,
  Ban,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Eye,
  Mail,
  AlertTriangle,
  TrendingUp,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { ScrollableContainer } from '../components/ScrollableContainer';
import { FileUploadZone } from '../components/FileUploadZone';
import { FormBuilder } from '../components/FormBuilder';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { openaiService } from '../services/openaiService';
import { 
  User, 
  ContactMessage, 
  Puzzle, 
  PuzzleAttempt, 
  CustomForm, 
  FormSubmission, 
  Event,
  UploadSubmission,
  AdminAction,
  SystemSettings,
  Notification,
  AITrainingData
} from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages' | 'puzzles' | 'forms' | 'events' | 'uploads' | 'ai' | 'settings'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [puzzleAttempts, setPuzzleAttempts] = useState<PuzzleAttempt[]>([]);
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [uploads, setUploads] = useState<UploadSubmission[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [aiTrainingData, setAiTrainingData] = useState<AITrainingData[]>([]);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [newTrainingData, setNewTrainingData] = useState({
    prompt: '',
    response: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUploads: 0,
    unreadMessages: 0,
    pendingPuzzles: 0,
    totalEvents: 0,
    totalForms: 0,
    totalSubmissions: 0
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        allUsers,
        allMessages,
        allPuzzles,
        allAttempts,
        allForms,
        allSubmissions,
        allEvents,
        allUploads,
        settings,
        aiData
      ] = await Promise.all([
        dataService.getUsers(),
        dataService.getContactMessages(),
        dataService.getPuzzles(),
        dataService.getPuzzleAttempts(),
        dataService.getForms(),
        dataService.getFormSubmissions(),
        dataService.getEvents(),
        dataService.getUploadSubmissions(),
        dataService.getSystemSettings(),
        dataService.getAITrainingData()
      ]);

      setUsers(allUsers);
      setContactMessages(allMessages);
      setPuzzles(allPuzzles);
      setPuzzleAttempts(allAttempts);
      setForms(allForms);
      setFormSubmissions(allSubmissions);
      setEvents(allEvents);
      setUploads(allUploads);
      setSystemSettings(settings);
      setAiTrainingData(aiData);

      // Calculate stats
      setStats({
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.isOnline && !u.isBanned).length,
        pendingUploads: allUploads.filter(u => u.status === 'pending').length,
        unreadMessages: allMessages.filter(m => !m.isRead).length,
        pendingPuzzles: allAttempts.filter(a => a.isCorrect === null).length,
        totalEvents: allEvents.length,
        totalForms: allForms.length,
        totalSubmissions: allSubmissions.length
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const logAdminAction = async (action: string, targetType: string, targetId: string, details: string) => {
    if (!user) return;
    
    const adminAction: AdminAction = {
      id: uuidv4(),
      adminId: user.id,
      action,
      targetType: targetType as any,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    
    await dataService.logAdminAction(adminAction);
  };

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'promote' | 'demote' | 'delete') => {
    if (!user) return;
    
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const confirmed = window.confirm(`Are you sure you want to ${action} ${targetUser.username}?`);
    if (!confirmed) return;

    try {
      switch (action) {
        case 'ban':
          await dataService.updateUser(userId, { isBanned: true, isOnline: false });
          await logAdminAction('ban_user', 'user', userId, `Banned user ${targetUser.username}`);
          toast.success(`${targetUser.username} has been banned`);
          break;
        case 'unban':
          await dataService.updateUser(userId, { isBanned: false });
          await logAdminAction('unban_user', 'user', userId, `Unbanned user ${targetUser.username}`);
          toast.success(`${targetUser.username} has been unbanned`);
          break;
        case 'promote':
          await dataService.updateUser(userId, { role: 'admin' });
          await logAdminAction('promote_user', 'user', userId, `Promoted ${targetUser.username} to admin`);
          toast.success(`${targetUser.username} promoted to admin`);
          break;
        case 'demote':
          await dataService.updateUser(userId, { role: 'user' });
          await logAdminAction('demote_user', 'user', userId, `Demoted ${targetUser.username} to user`);
          toast.success(`${targetUser.username} demoted to user`);
          break;
        case 'delete':
          await dataService.deleteUser(userId);
          await logAdminAction('delete_user', 'user', userId, `Deleted user ${targetUser.username}`);
          toast.success(`${targetUser.username} account deleted`);
          break;
      }
      
      loadAllData();
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleUploadReview = async (uploadId: string, approved: boolean, reason?: string) => {
    if (!user) return;
    
    try {
      await dataService.updateUploadSubmission(uploadId, {
        status: approved ? 'approved' : 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user.id,
        rejectionReason: reason
      });

      const upload = uploads.find(u => u.id === uploadId);
      if (upload) {
        await logAdminAction(
          approved ? 'approve_upload' : 'reject_upload',
          'upload',
          uploadId,
          `${approved ? 'Approved' : 'Rejected'} upload: ${upload.title}`
        );

        // Notify user
        const notification: Notification = {
          id: uuidv4(),
          userId: upload.userId,
          title: `Upload ${approved ? 'Approved' : 'Rejected'}`,
          message: `Your upload "${upload.title}" has been ${approved ? 'approved' : 'rejected'}${reason ? `: ${reason}` : ''}`,
          type: 'upload_approved',
          read: false,
          timestamp: new Date().toISOString()
        };
        await dataService.saveNotification(notification);
      }

      toast.success(`Upload ${approved ? 'approved' : 'rejected'}`);
      loadAllData();
    } catch (error) {
      console.error('Error reviewing upload:', error);
      toast.error('Failed to review upload');
    }
  };

  const handleMessageReply = async (messageId: string, reply: string) => {
    if (!user || !reply.trim()) return;
    
    try {
      await dataService.updateContactMessage(messageId, {
        adminReply: reply.trim(),
        repliedAt: new Date().toISOString(),
        repliedBy: user.id,
        isRead: true
      });

      await logAdminAction('reply_message', 'message', messageId, `Replied to contact message`);
      toast.success('Reply sent successfully');
      loadAllData();
    } catch (error) {
      console.error('Error replying to message:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleSystemSettingUpdate = async (key: keyof SystemSettings, value: any) => {
    if (!systemSettings || !user) return;
    
    try {
      const updatedSettings = {
        ...systemSettings,
        [key]: value,
        updatedBy: user.id,
        updatedAt: new Date().toISOString()
      };
      
      await dataService.saveSystemSettings(updatedSettings);
      setSystemSettings(updatedSettings);
      
      await logAdminAction('update_settings', 'system', 'settings', `Updated ${key} to ${value}`);
      toast.success(`${key} updated successfully`);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const handleAICommand = async () => {
    if (!aiPrompt.trim()) return;

    try {
      const response = await openaiService.generateResponse(
        aiPrompt,
        `Admin: ${user?.username}, Platform: Royal Warriors Squad`,
        'You are an AI assistant helping an admin manage the Royal Warriors Squad platform. Provide helpful, actionable responses for admin tasks.'
      );
      setAiResponse(response);
      setAiPrompt('');
      toast.success('AI response generated');
    } catch (error) {
      console.error('AI command error:', error);
      toast.error('Failed to get AI response');
    }
  };

  const handleTrainAI = async () => {
    if (!newTrainingData.prompt || !newTrainingData.response) {
      toast.error('Please provide both prompt and response');
      return;
    }

    try {
      const trainingEntry: AITrainingData = {
        id: uuidv4(),
        prompt: newTrainingData.prompt,
        response: newTrainingData.response,
        category: newTrainingData.category,
        addedBy: user?.id || 'admin',
        addedAt: new Date().toISOString()
      };

      await dataService.saveAITrainingData(trainingEntry);
      setAiTrainingData([...aiTrainingData, trainingEntry]);
      setNewTrainingData({ prompt: '', response: '', category: 'general' });
      toast.success('AI training data added successfully');
    } catch (error) {
      console.error('AI training error:', error);
      toast.error('Failed to add training data');
    }
  };

  const handleSaveForm = (formData: Omit<CustomForm, 'id' | 'createdAt' | 'createdBy'>) => {
    if (editingForm) {
      const updatedForm = {
        ...editingForm,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      setForms(forms.map(f => f.id === editingForm.id ? updatedForm : f));
      toast.success('Form updated successfully!');
    } else {
      const newForm: CustomForm = {
        ...formData,
        id: uuidv4(),
        createdBy: user?.id || 'admin',
        createdAt: new Date().toISOString()
      };
      setForms([...forms, newForm]);
      toast.success('Form created successfully!');
    }
    
    setIsFormBuilderOpen(false);
    setEditingForm(null);
  };

  const handleDeleteForm = (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      setForms(forms.filter(f => f.id !== formId));
      setFormSubmissions(formSubmissions.filter(s => s.formId !== formId));
      toast.success('Form deleted successfully');
    }
  };

  const exportData = (data: any[], filename: string) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users, badge: stats.totalUsers },
    { id: 'messages', name: 'Messages', icon: MessageCircle, badge: stats.unreadMessages },
    { id: 'puzzles', name: 'Puzzles', icon: Brain, badge: stats.pendingPuzzles },
    { id: 'forms', name: 'Forms', icon: FileText, badge: stats.totalForms },
    { id: 'events', name: 'Events', icon: Calendar, badge: stats.totalEvents },
    { id: 'uploads', name: 'Uploads', icon: Upload, badge: stats.pendingUploads },
    { id: 'ai', name: 'AI Training', icon: Brain },
    { id: 'settings', name: 'Settings', icon: Settings }
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
            Only Spider Warrior can access the Admin Dashboard
          </p>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading admin dashboard...</p>
        </div>
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
            <span className="text-lg font-semibold text-red-400">Spider Warrior Command Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            Complete control and management of the Royal Warriors Squad platform
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
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-500 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
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
                <div className="text-sm text-gray-400">Total Warriors</div>
                <div className="text-xs text-green-400 mt-1">{stats.activeUsers} online</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-purple-500/20">
                <Upload className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-400 mb-1">{stats.pendingUploads}</div>
                <div className="text-sm text-gray-400">Pending Uploads</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-yellow-500/20">
                <MessageCircle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.unreadMessages}</div>
                <div className="text-sm text-gray-400">Unread Messages</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-green-500/20">
                <Brain className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.pendingPuzzles}</div>
                <div className="text-sm text-gray-400">Pending Reviews</div>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-8">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                  Urgent Actions Required
                </h3>
                <ScrollableContainer maxHeight="300px">
                  <div className="space-y-3">
                    {stats.pendingUploads > 0 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-yellow-400">Pending Uploads</h4>
                            <p className="text-sm text-gray-400">{stats.pendingUploads} uploads awaiting review</p>
                          </div>
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setActiveTab('uploads')}
                          >
                            Review
                          </AnimatedButton>
                        </div>
                      </div>
                    )}
                    
                    {stats.unreadMessages > 0 && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-blue-400">Unread Messages</h4>
                            <p className="text-sm text-gray-400">{stats.unreadMessages} messages need attention</p>
                          </div>
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setActiveTab('messages')}
                          >
                            View
                          </AnimatedButton>
                        </div>
                      </div>
                    )}

                    {stats.pendingPuzzles > 0 && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-purple-400">Puzzle Reviews</h4>
                            <p className="text-sm text-gray-400">{stats.pendingPuzzles} attempts to review</p>
                          </div>
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setActiveTab('puzzles')}
                          >
                            Review
                          </AnimatedButton>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollableContainer>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Platform Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">User Growth</span>
                    <span className="text-green-400 font-bold">+{Math.floor(stats.totalUsers * 0.1)} this week</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Active Rate</span>
                    <span className="text-blue-400 font-bold">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Submissions</span>
                    <span className="text-purple-400 font-bold">{stats.totalSubmissions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Platform Health</span>
                    <span className="text-green-400 font-bold">Excellent</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    placeholder="Search users by name or email..."
                  />
                </div>
                <AnimatedButton
                  variant="secondary"
                  icon={Download}
                  onClick={() => exportData(users, 'users')}
                >
                  Export
                </AnimatedButton>
              </div>
            </GlassCard>

            {/* Users List */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Warrior Management ({filteredUsers.length})
              </h3>
              <ScrollableContainer maxHeight="600px">
                <div className="space-y-4">
                  {filteredUsers.map(warrior => (
                    <div key={warrior.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: warrior.avatar?.color || '#3b82f6' }}
                        >
                          {warrior.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-gray-800 dark:text-white">
                              {warrior.username}
                            </h4>
                            {warrior.role === 'admin' && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                            {warrior.isBanned && (
                              <Ban className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {warrior.email} • Level {warrior.level} • {warrior.xp} XP
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${warrior.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            <span className="text-xs text-gray-500">
                              {warrior.isOnline ? 'Online' : `Last seen ${format(new Date(warrior.lastActive), 'MMM dd')}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <AnimatedButton
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedUser(warrior)}
                        >
                          View
                        </AnimatedButton>
                        
                        {warrior.role === 'user' && (
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            icon={UserPlus}
                            onClick={() => handleUserAction(warrior.id, 'promote')}
                            className="bg-green-500/20 text-green-400"
                          >
                            Promote
                          </AnimatedButton>
                        )}
                        
                        {warrior.role === 'admin' && warrior.id !== user?.id && (
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            icon={UserMinus}
                            onClick={() => handleUserAction(warrior.id, 'demote')}
                            className="bg-yellow-500/20 text-yellow-400"
                          >
                            Demote
                          </AnimatedButton>
                        )}
                        
                        {!warrior.isBanned ? (
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            icon={Ban}
                            onClick={() => handleUserAction(warrior.id, 'ban')}
                            className="text-red-500"
                          >
                            Ban
                          </AnimatedButton>
                        ) : (
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleUserAction(warrior.id, 'unban')}
                            className="bg-green-500/20 text-green-400"
                          >
                            Unban
                          </AnimatedButton>
                        )}
                        
                        {warrior.id !== user?.id && (
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleUserAction(warrior.id, 'delete')}
                            className="text-red-500"
                          >
                            Delete
                          </AnimatedButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollableContainer>
            </GlassCard>
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Contact Messages ({contactMessages.length})
                </h3>
                <AnimatedButton
                  variant="secondary"
                  icon={Download}
                  onClick={() => exportData(contactMessages, 'contact-messages')}
                >
                  Export
                </AnimatedButton>
              </div>
              
              <ScrollableContainer maxHeight="600px">
                <div className="space-y-4">
                  {contactMessages.map(message => (
                    <div key={message.id} className={`p-4 rounded-lg border ${
                      message.isRead 
                        ? 'bg-white/5 border-gray-500/30' 
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-gray-800 dark:text-white">
                              {message.name}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              message.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              message.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {message.priority.toUpperCase()}
                            </span>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                              {message.category.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {message.email} • {format(new Date(message.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        {!message.isRead && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <h5 className="font-medium text-gray-800 dark:text-white mb-2">
                        {message.subject}
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {message.message}
                      </p>
                      
                      {message.adminReply && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <h6 className="font-medium text-green-400 mb-1">Admin Reply:</h6>
                          <p className="text-sm text-gray-300">{message.adminReply}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Replied on {format(new Date(message.repliedAt!), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      )}
                      
                      {!message.adminReply && (
                        <div className="mt-4">
                          <textarea
                            placeholder="Type your reply..."
                            className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                            rows={3}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                const reply = (e.target as HTMLTextAreaElement).value;
                                if (reply.trim()) {
                                  handleMessageReply(message.id, reply);
                                  (e.target as HTMLTextAreaElement).value = '';
                                }
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">Press Ctrl+Enter to send</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollableContainer>
            </GlassCard>
          </motion.div>
        )}

        {/* Uploads Tab */}
        {activeTab === 'uploads' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Upload Management ({uploads.length})
              </h3>
              
              <ScrollableContainer maxHeight="600px">
                <div className="space-y-4">
                  {uploads.map(upload => (
                    <div key={upload.id} className={`p-4 rounded-lg border ${
                      upload.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      upload.status === 'approved' ? 'bg-green-500/10 border-green-500/30' :
                      'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-bold text-gray-800 dark:text-white">
                              {upload.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              upload.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              upload.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {upload.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            by {upload.artist} • {upload.category} • {(upload.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {upload.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {upload.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Submitted {format(new Date(upload.submittedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {upload.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
                              Rejection reason: {upload.rejectionReason}
                            </div>
                          )}
                        </div>
                        
                        {upload.status === 'pending' && (
                          <div className="flex space-x-2">
                            <AnimatedButton
                              variant="secondary"
                              size="sm"
                              icon={CheckCircle}
                              onClick={() => handleUploadReview(upload.id, true)}
                              className="bg-green-500/20 text-green-400"
                            >
                              Approve
                            </AnimatedButton>
                            <AnimatedButton
                              variant="secondary"
                              size="sm"
                              icon={XCircle}
                              onClick={() => {
                                const reason = prompt('Rejection reason (optional):');
                                handleUploadReview(upload.id, false, reason || undefined);
                              }}
                              className="bg-red-500/20 text-red-400"
                            >
                              Reject
                            </AnimatedButton>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollableContainer>
            </GlassCard>
          </motion.div>
        )}

        {/* AI Training Tab */}
        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* AI Command Interface */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  AI Command Interface
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
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>AI Assistant ready for commands!</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAICommand()}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder="Ask the AI assistant..."
                    />
                    <AnimatedButton
                      variant="primary"
                      onClick={handleAICommand}
                      disabled={!aiPrompt.trim()}
                    >
                      Ask AI
                    </AnimatedButton>
                  </div>
                </div>
              </GlassCard>

              {/* AI Training */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Train AI Assistant
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Training Prompt
                    </label>
                    <input
                      type="text"
                      value={newTrainingData.prompt}
                      onChange={(e) => setNewTrainingData({ ...newTrainingData, prompt: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder="Enter a question or command"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Response
                    </label>
                    <textarea
                      value={newTrainingData.response}
                      onChange={(e) => setNewTrainingData({ ...newTrainingData, response: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                      rows={4}
                      placeholder="Enter the expected response"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newTrainingData.category}
                      onChange={(e) => setNewTrainingData({ ...newTrainingData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    >
                      <option value="general">General</option>
                      <option value="alan_walker">Alan Walker</option>
                      <option value="platform">Platform Help</option>
                      <option value="moderation">Moderation</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                  
                  <AnimatedButton
                    variant="primary"
                    onClick={handleTrainAI}
                    disabled={!newTrainingData.prompt || !newTrainingData.response}
                    className="w-full"
                  >
                    Add Training Data
                  </AnimatedButton>
                </div>

                {/* Training Data List */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                    Training Data ({aiTrainingData.length})
                  </h4>
                  <ScrollableContainer maxHeight="200px">
                    <div className="space-y-2">
                      {aiTrainingData.slice(-10).map(data => (
                        <div key={data.id} className="p-2 bg-white/5 rounded text-sm">
                          <div className="font-medium text-gray-800 dark:text-white">
                            {data.prompt}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 truncate">
                            {data.response}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {data.category} • {format(new Date(data.addedAt), 'MMM dd')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollableContainer>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && systemSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                System Settings
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(systemSettings)
                  .filter(([key]) => !['id', 'updatedBy', 'updatedAt'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getSettingDescription(key)}
                          </p>
                        </div>
                        {typeof value === 'boolean' ? (
                          <button
                            onClick={() => handleSystemSettingUpdate(key as keyof SystemSettings, !value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-purple-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        ) : (
                          <input
                            type={typeof value === 'number' ? 'number' : 'text'}
                            value={value}
                            onChange={(e) => {
                              const newValue = typeof value === 'number' ? Number(e.target.value) : e.target.value;
                              handleSystemSettingUpdate(key as keyof SystemSettings, newValue);
                            }}
                            className="px-3 py-1 bg-white/10 border border-white/20 rounded text-gray-800 dark:text-white text-sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Form Builder Modal */}
        <FormBuilder
          isOpen={isFormBuilderOpen}
          onClose={() => {
            setIsFormBuilderOpen(false);
            setEditingForm(null);
          }}
          onSave={handleSaveForm}
          editingForm={editingForm}
        />
      </div>
    </div>
  );
};

const getSettingDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    darkModeDefault: 'Default theme for new users',
    maintenanceMode: 'Put platform in maintenance mode',
    registrationEnabled: 'Allow new user registrations',
    uploadsEnabled: 'Allow file uploads',
    puzzlesEnabled: 'Enable puzzle system',
    eventsEnabled: 'Enable event system',
    chatEnabled: 'Enable chat functionality',
    aiAssistantEnabled: 'Enable AI assistant',
    welcomeMessage: 'Message shown to new users',
    maxFileSize: 'Maximum file size in bytes',
    allowedFileTypes: 'Comma-separated file extensions'
  };
  return descriptions[key] || 'System setting';
};