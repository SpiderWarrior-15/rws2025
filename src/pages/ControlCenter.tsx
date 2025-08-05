import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Users, 
  MessageCircle, 
  Settings, 
  Shield,
  Activity,
  Bot,
  BarChart3,
  Zap,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Send,
  Trash2,
  UserPlus,
  UserMinus,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Monitor,
  Database,
  Wifi,
  Server
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
  PlatformSettings, 
  Activity as ActivityType,
  AITrainingData,
  GlobalStats,
  ApprovalRequest
} from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const ControlCenter: React.FC = () => {
  const { user, users, promoteUser, banUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages' | 'settings' | 'ai' | 'system'>('overview');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    id: 'main',
    darkModeEnabled: true,
    challengesEnabled: true,
    eventsEnabled: true,
    avatarsEnabled: true,
    uploadsEnabled: true,
    quizzesEnabled: true,
    aiAssistantEnabled: true,
    globalChatEnabled: true,
    registrationEnabled: true,
    maintenanceMode: false,
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiTraining, setAiTraining] = useState<AITrainingData[]>([]);
  const [isTrainingAI, setIsTrainingAI] = useState(false);
  const [trainingData, setTrainingData] = useState({ prompt: '', response: '', category: 'general' });
  const [globalMessage, setGlobalMessage] = useState('');
  const [stats, setStats] = useState<GlobalStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalForms: 0,
    totalEvents: 0,
    totalSongs: 0,
    totalPuzzles: 0,
    pendingApprovals: 0,
    totalAchievements: 0
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
      loadSettings();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    try {
      const [
        allMessages,
        allActivities,
        allApprovals,
        trainingData
      ] = await Promise.all([
        fileService.getMessages(),
        fileService.getActivities(),
        fileService.getApprovalRequests(),
        aiService.getTrainingData()
      ]);

      setMessages(allMessages);
      setActivities(allActivities);
      setApprovals(allApprovals);
      setAiTraining(trainingData);

      // Calculate stats
      const activeUsers = users.filter(u => u.isOnline && !u.isBanned).length;
      const pendingApprovals = allApprovals.filter(a => a.status === 'pending').length;

      setStats({
        totalUsers: users.length,
        activeUsers,
        totalMessages: allMessages.length,
        totalForms: 0, // Will be implemented
        totalEvents: 0, // Will be implemented
        totalSongs: 0, // Will be implemented
        totalPuzzles: 0, // Will be implemented
        pendingApprovals,
        totalAchievements: 0
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await fileService.readFile<PlatformSettings>('platform_settings.json', []);
      if (savedSettings.length > 0) {
        setSettings(savedSettings[0]);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key: keyof PlatformSettings, value: any) => {
    const updatedSettings = {
      ...settings,
      [key]: value,
      updatedBy: user!.id,
      updatedAt: new Date().toISOString()
    };
    
    setSettings(updatedSettings);
    await fileService.writeFile('platform_settings.json', [updatedSettings]);
    
    // Broadcast setting change
    socketService.emit('settings_updated', updatedSettings);
    toast.success(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleAICommand = async () => {
    if (!aiPrompt.trim()) return;

    try {
      const response = await aiService.processCommand(aiPrompt, user!.id);
      setAiResponse(response);
      setAiPrompt('');
      
      // Execute actual commands based on prompt
      const lowerPrompt = aiPrompt.toLowerCase();
      
      if (lowerPrompt.includes('approve all pending')) {
        const pendingApprovals = approvals.filter(a => a.status === 'pending');
        for (const approval of pendingApprovals) {
          await fileService.updateApprovalRequest(approval.id, {
            status: 'approved',
            reviewedBy: user!.id,
            reviewedAt: new Date().toISOString()
          });
        }
        toast.success(`Approved ${pendingApprovals.length} pending items`);
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

  const broadcastGlobalMessage = async () => {
    if (!globalMessage.trim()) return;

    try {
      const message = {
        id: Date.now().toString(),
        content: globalMessage,
        type: 'system' as const,
        timestamp: new Date().toISOString(),
        senderId: user!.id,
        senderUsername: 'System Admin',
        chatId: 'global'
      };

      await fileService.appendToFile('messages.json', message);
      socketService.emit('message_sent', message);
      
      setGlobalMessage('');
      toast.success('Global message broadcasted');
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('Failed to broadcast message');
    }
  };

  const tabItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'ai', name: 'AI Assistant', icon: Bot },
    { id: 'system', name: 'System', icon: Monitor }
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
            Only Spider Warrior can access the Control Center
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
            Control Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Ultimate command and control over the Alan Warriors platform
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
                <div className="text-sm text-gray-400">Total Warriors</div>
                <div className="text-xs text-green-400 mt-1">{stats.activeUsers} online</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-purple-500/20">
                <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-400 mb-1">{stats.totalMessages}</div>
                <div className="text-sm text-gray-400">Messages</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-yellow-500/20">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.pendingApprovals}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-green-500/20">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-400 mb-1">{activities.length}</div>
                <div className="text-sm text-gray-400">Activities</div>
              </GlassCard>
            </div>

            {/* Global Broadcast */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Global Broadcast
              </h3>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={globalMessage}
                  onChange={(e) => setGlobalMessage(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                  placeholder="Send a message to all warriors..."
                />
                <AnimatedButton
                  variant="primary"
                  icon={Send}
                  onClick={broadcastGlobalMessage}
                  disabled={!globalMessage.trim()}
                >
                  Broadcast
                </AnimatedButton>
              </div>
            </GlassCard>

            {/* Live Activity Feed */}
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
                Warrior Management ({users.length})
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(warrior => (
                <GlassCard key={warrior.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        {warrior.avatar ? (
                          <span className="text-white font-bold">
                            {warrior.avatar.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-white font-bold">
                            {warrior.username.charAt(0).toUpperCase()}
                          </span>
                        )}
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
                        warrior.role === 'admin' ? 'text-red-400' : 'text-blue-400'
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
                        {format(new Date(warrior.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {warrior.role === 'user' && (
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={UserPlus}
                        onClick={() => promoteUser(warrior.id, 'admin')}
                        className="flex-1"
                      >
                        Promote
                      </AnimatedButton>
                    )}
                    {warrior.role === 'admin' && warrior.id !== user?.id && (
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={UserMinus}
                        onClick={() => promoteUser(warrior.id, 'user')}
                        className="flex-1"
                      >
                        Demote
                      </AnimatedButton>
                    )}
                    {warrior.id !== user?.id && (
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        icon={Ban}
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Platform Settings
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(settings)
                .filter(([key]) => !['id', 'updatedBy', 'updatedAt'].includes(key))
                .map(([key, value]) => (
                  <GlassCard key={key} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {key === 'darkModeEnabled' && 'Allow users to toggle dark mode'}
                          {key === 'challengesEnabled' && 'Enable puzzle and quiz challenges'}
                          {key === 'eventsEnabled' && 'Allow event creation and participation'}
                          {key === 'avatarsEnabled' && 'Enable custom avatar creation'}
                          {key === 'uploadsEnabled' && 'Allow file and media uploads'}
                          {key === 'quizzesEnabled' && 'Enable quiz system'}
                          {key === 'aiAssistantEnabled' && 'Enable AI assistant for users'}
                          {key === 'globalChatEnabled' && 'Enable global chat system'}
                          {key === 'registrationEnabled' && 'Allow new user registration'}
                          {key === 'maintenanceMode' && 'Put platform in maintenance mode'}
                        </p>
                      </div>
                      <button
                        onClick={() => updateSetting(key as keyof PlatformSettings, !value)}
                        className={`p-2 rounded-lg transition-colors ${
                          value ? 'text-green-400' : 'text-gray-400'
                        }`}
                      >
                        {value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                      </button>
                    </div>
                  </GlassCard>
                ))}
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
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>AI Assistant ready for commands!</p>
                        <p className="text-xs mt-2">Try: "show me most active warriors" or "approve all pending"</p>
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
                      placeholder="Command the AI..."
                    />
                    <AnimatedButton
                      variant="primary"
                      icon={Send}
                      onClick={handleAICommand}
                      disabled={!aiPrompt.trim()}
                    >
                      Execute
                    </AnimatedButton>
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
                      Training data entries: {aiTraining.length}
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
                        Command/Prompt
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
                        Expected Response
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
                        <option value="alan_walker">Alan Walker</option>
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

        {/* System Tab */}
        {activeTab === 'system' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              System Monitoring
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard className="p-6 text-center">
                <Server className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-400 mb-1">Online</div>
                <div className="text-sm text-gray-400">Server Status</div>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <Database className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-400 mb-1">JSON</div>
                <div className="text-sm text-gray-400">Storage Type</div>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <Wifi className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-purple-400 mb-1">Active</div>
                <div className="text-sm text-gray-400">Real-time Sync</div>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-yellow-400 mb-1">Secure</div>
                <div className="text-sm text-gray-400">Security Status</div>
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                System Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Platform Version:</span>
                    <span className="text-gray-800 dark:text-white">Alan Warriors v2.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                    <span className="text-green-400">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Storage Used:</span>
                    <span className="text-blue-400">2.3 MB</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Active Sessions:</span>
                    <span className="text-purple-400">{stats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Data Files:</span>
                    <span className="text-yellow-400">12 JSON files</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Backup:</span>
                    <span className="text-gray-800 dark:text-white">Auto-sync</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};