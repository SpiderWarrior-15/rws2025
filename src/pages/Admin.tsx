import React, { useState } from 'react';
import { Users, Settings, MessageSquare, Star, Crown, CheckCircle, XCircle, Clock, Edit, Save, X, Plus, Trash2, Eye, EyeOff, Shield, UserCheck, ToggleLeft, ToggleRight, Bell } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { WarriorCard } from '../components/WarriorCard';
import { MarkingModal } from '../components/MarkingModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useSounds } from '../hooks/useSounds';
import { UserAccount, MarkingCriteria, Mark, MarkingSummary, ContactMessage, HomepageContent, Notice, NoticeType, NoticePriority } from '../types';
import { initialMarkingCriteria, initialHomepageContent } from '../utils/initialData';
import { createNotice } from '../utils/noticeManager';

export const Admin: React.FC = () => {
  const { user, updateAccount } = useAuth();
  const { playSound } = useSounds();
  const [accounts, setAccounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [criteria, setCriteria] = useLocalStorage<MarkingCriteria[]>('rws-marking-criteria', initialMarkingCriteria);
  const [marks, setMarks] = useLocalStorage<Mark[]>('rws-marks', []);
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>('rws-messages', []);
  const [content, setContent] = useLocalStorage<HomepageContent>('rws-homepage-content', initialHomepageContent);
  const [notices, setNotices] = useLocalStorage<Notice[]>('rws-notices', []);
  
  const [activeTab, setActiveTab] = useState<'accounts' | 'warriors' | 'criteria' | 'marks' | 'messages' | 'homepage' | 'notices'>('accounts');
  const [selectedWarrior, setSelectedWarrior] = useState<UserAccount | null>(null);
  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [tempContent, setTempContent] = useState(content);
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    maxScore: 10,
    category: 'participation' as const
  });
  const [isAddingCriteria, setIsAddingCriteria] = useState(false);
  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    type: 'announcement' as NoticeType,
    priority: 'medium' as NoticePriority,
    targetAudience: 'all',
    expiresAt: '',
    showOnce: false
  });

  // Filter accounts
  const allAccounts = accounts.filter(acc => acc.email !== 'spiderwarrior15@gmail.com'); // Exclude admin
  const unreadMessages = messages.filter(msg => !msg.isRead);
  const activeNotices = notices.filter(n => n.isActive);

  // Calculate marking summaries
  const calculateMarkingSummary = (warriorId: string): MarkingSummary => {
    const warriorMarks = marks.filter(m => m.warriorId === warriorId);
    const totalScore = warriorMarks.reduce((sum, mark) => sum + mark.score, 0);
    const averageScore = warriorMarks.length > 0 ? totalScore / warriorMarks.length : 0;
    
    const categoryScores: Record<string, number> = {};
    warriorMarks.forEach(mark => {
      const criterion = criteria.find(c => c.id === mark.criteriaId);
      if (criterion) {
        categoryScores[criterion.category] = (categoryScores[criterion.category] || 0) + mark.score;
      }
    });

    return {
      warriorId,
      totalScore,
      averageScore,
      markCount: warriorMarks.length,
      categoryScores,
      lastMarked: warriorMarks.length > 0 ? warriorMarks[warriorMarks.length - 1].markedAt : ''
    };
  };

  const handleRoleToggle = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    const newRole = account.role === 'Warrior' ? 'Commander' : 'Warrior';
    updateAccount(accountId, { role: newRole });
    playSound('success');
  };

  const handleMarkWarrior = (warrior: UserAccount) => {
    setSelectedWarrior(warrior);
    setIsMarkingModalOpen(true);
  };

  const handleSubmitMark = (mark: Omit<Mark, 'id' | 'markedAt'>) => {
    const newMark: Mark = {
      ...mark,
      id: Date.now().toString(),
      markedAt: new Date().toISOString()
    };
    setMarks([...marks, newMark]);
    setIsMarkingModalOpen(false);
    setSelectedWarrior(null);
    playSound('success');
  };

  const handleMarkMessageAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
    playSound('error');
  };

  const handleSaveContent = () => {
    setContent({
      ...tempContent,
      lastUpdated: new Date().toISOString(),
      updatedBy: user?.id || 'admin'
    });
    setEditingContent(false);
    playSound('success');
  };

  const handleAddCriteria = () => {
    if (!newCriteria.name.trim() || !newCriteria.description.trim()) return;

    const criteria: MarkingCriteria = {
      id: Date.now().toString(),
      ...newCriteria,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setCriteria(prev => [...prev, criteria]);
    setNewCriteria({
      name: '',
      description: '',
      maxScore: 10,
      category: 'participation'
    });
    setIsAddingCriteria(false);
    playSound('success');
  };

  const handleToggleCriteria = (criteriaId: string) => {
    setCriteria(criteria.map(c => 
      c.id === criteriaId ? { ...c, isActive: !c.isActive } : c
    ));
    playSound('click');
  };

  const handleDeleteCriteria = (criteriaId: string) => {
    setCriteria(criteria.filter(c => c.id !== criteriaId));
    setMarks(marks.filter(m => m.criteriaId !== criteriaId));
    playSound('error');
  };

  const handleAddNotice = () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) return;

    const notice = createNotice(
      newNotice.title,
      newNotice.content,
      newNotice.type,
      newNotice.priority,
      newNotice.targetAudience,
      newNotice.expiresAt || undefined
    );

    notice.showOnce = newNotice.showOnce;

    setNotices([...notices, notice]);
    setNewNotice({
      title: '',
      content: '',
      type: 'announcement',
      priority: 'medium',
      targetAudience: 'all',
      expiresAt: '',
      showOnce: false
    });
    setIsAddingNotice(false);
    playSound('success');
  };

  const handleToggleNotice = (noticeId: string) => {
    setNotices(notices.map(n => 
      n.id === noticeId ? { ...n, isActive: !n.isActive } : n
    ));
    playSound('click');
  };

  const handleDeleteNotice = (noticeId: string) => {
    setNotices(notices.filter(n => n.id !== noticeId));
    playSound('error');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'accounts', label: 'Account Management', icon: Users, count: allAccounts.length },
    { id: 'warriors', label: 'Warriors', icon: Shield, count: allAccounts.length },
    { id: 'criteria', label: 'Marking Criteria', icon: Star, count: criteria.filter(c => c.isActive).length },
    { id: 'marks', label: 'Warrior Marks', icon: Crown, count: marks.length },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: unreadMessages.length },
    { id: 'notices', label: 'Notice Board', icon: Bell, count: activeNotices.length },
    { id: 'homepage', label: 'Homepage Content', icon: Settings, count: 0 }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 backdrop-blur-md border border-yellow-500/30 mb-6">
            <Crown className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-sm font-medium text-yellow-400">Commander Control Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage the Royal Warriors Squad kingdom
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white'
                  : 'bg-white/10 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-yellow-500/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-yellow-500/20 text-yellow-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notice Board Tab */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Notice Board Management</h2>
              <AnimatedButton
                variant="primary"
                icon={Plus}
                onClick={() => setIsAddingNotice(true)}
                soundType="click"
              >
                Create Notice
              </AnimatedButton>
            </div>

            {/* Add Notice Form */}
            {isAddingNotice && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Create New Notice</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newNotice.title}
                        onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                        placeholder="Notice title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={newNotice.type}
                        onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value as NoticeType })}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                      >
                        <option value="announcement">Announcement</option>
                        <option value="event">Event</option>
                        <option value="achievement">Achievement</option>
                        <option value="update">Update</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="puzzle">Puzzle</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={newNotice.priority}
                        onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as NoticePriority })}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Audience
                      </label>
                      <select
                        value={newNotice.targetAudience}
                        onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                      >
                        <option value="all">All Users</option>
                        <option value="new_users">New Users</option>
                        <option value="commanders">Commanders</option>
                        <option value="warriors">Warriors</option>
                        <option value="active_users">Active Users</option>
                        <option value="new_solvers">New Solvers</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expires At
                      </label>
                      <input
                        type="datetime-local"
                        value={newNotice.expiresAt}
                        onChange={(e) => setNewNotice({ ...newNotice, expiresAt: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <textarea
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white resize-none"
                      rows={4}
                      placeholder="Notice content..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showOnce"
                      checked={newNotice.showOnce}
                      onChange={(e) => setNewNotice({ ...newNotice, showOnce: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="showOnce" className="text-sm text-gray-700 dark:text-gray-300">
                      Show only once per user
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <AnimatedButton
                      variant="primary"
                      onClick={handleAddNotice}
                      disabled={!newNotice.title.trim() || !newNotice.content.trim()}
                      soundType="success"
                    >
                      Create Notice
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      onClick={() => {
                        setIsAddingNotice(false);
                        setNewNotice({
                          title: '',
                          content: '',
                          type: 'announcement',
                          priority: 'medium',
                          targetAudience: 'all',
                          expiresAt: '',
                          showOnce: false
                        });
                      }}
                      soundType="click"
                    >
                      Cancel
                    </AnimatedButton>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Notices List */}
            <div className="space-y-4">
              {notices.map((notice) => (
                <GlassCard key={notice.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          {notice.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notice.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          notice.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                          notice.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {notice.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                          {notice.type}
                        </span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          {notice.targetAudience.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {notice.content}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Created: {formatDate(notice.createdAt)}
                        {notice.expiresAt && (
                          <span className="ml-4">
                            Expires: {formatDate(notice.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleNotice(notice.id)}
                        className={`p-2 rounded-lg transition-colors duration-300 ${
                          notice.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {notice.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Account Management Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-500" />
                All User Accounts ({allAccounts.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allAccounts.map((account) => (
                  <GlassCard key={account.id} className="p-6 cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => setSelectedAccount(account)}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {account.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">{account.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{account.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Role:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          account.role === 'Commander' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {account.role}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Google:</span>
                        <span className={`text-xs ${account.googleLinked ? 'text-green-400' : 'text-gray-500'}`}>
                          {account.googleLinked ? 'Linked' : 'Not Linked'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                        <span className="text-xs text-gray-500">{formatDate(account.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Role Toggle:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleToggle(account.id);
                        }}
                        className="flex items-center space-x-2 text-sm"
                      >
                        {account.role === 'Commander' ? (
                          <ToggleRight className="w-6 h-6 text-yellow-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {account.role === 'Commander' ? 'Commander' : 'Warrior'}
                        </span>
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Details Modal */}
        {selectedAccount && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Account Details
                  </h2>
                  <button
                    onClick={() => setSelectedAccount(null)}
                    className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username
                      </label>
                      <p className="text-gray-800 dark:text-white font-medium">{selectedAccount.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <p className="text-gray-800 dark:text-white">{selectedAccount.email}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Google Status
                      </label>
                      <p className={`font-medium ${selectedAccount.googleLinked ? 'text-green-400' : 'text-gray-500'}`}>
                        {selectedAccount.googleLinked ? 'Linked' : 'Not Linked'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role
                      </label>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedAccount.role === 'Commander' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {selectedAccount.role}
                        </span>
                        <button
                          onClick={() => {
                            handleRoleToggle(selectedAccount.id);
                            setSelectedAccount({...selectedAccount, role: selectedAccount.role === 'Commander' ? 'Warrior' : 'Commander'});
                          }}
                          className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300"
                        >
                          Toggle Role
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        WhatsApp
                      </label>
                      <p className="text-gray-800 dark:text-white">{selectedAccount.whatsapp}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <p className="text-gray-800 dark:text-white">{selectedAccount.city}, {selectedAccount.country}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedAccount.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Joined Date
                    </label>
                    <p className="text-gray-800 dark:text-white">{formatDate(selectedAccount.createdAt)}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Marking Modal */}
        {selectedWarrior && (
          <MarkingModal
            isOpen={isMarkingModalOpen}
            onClose={() => {
              setIsMarkingModalOpen(false);
              setSelectedWarrior(null);
            }}
            warrior={selectedWarrior}
            criteria={criteria}
            onSubmitMark={handleSubmitMark}
          />
        )}
      </div>
    </div>
  );
};