import React, { useState } from 'react';
import { Users, Settings, MessageSquare, Star, Crown, CheckCircle, XCircle, Clock, Edit, Save, X, Plus, Trash2, Eye, EyeOff, Shield, UserCheck, ToggleLeft, ToggleRight, ArrowUpDown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { WarriorCard } from '../components/WarriorCard';
import { MarkingModal } from '../components/MarkingModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useSounds } from '../hooks/useSounds';
import { UserAccount, MarkingCriteria, Mark, MarkingSummary, ContactMessage, HomepageContent } from '../types';
import { initialMarkingCriteria, initialHomepageContent } from '../utils/initialData';

export const Admin: React.FC = () => {
  const { user, updateAccount } = useAuth();
  const { playSound } = useSounds();
  const [accounts, setAccounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [criteria, setCriteria] = useLocalStorage<MarkingCriteria[]>('rws-marking-criteria', initialMarkingCriteria);
  const [marks, setMarks] = useLocalStorage<Mark[]>('rws-marks', []);
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>('rws-messages', []);
  const [content, setContent] = useLocalStorage<HomepageContent>('rws-homepage-content', initialHomepageContent);
  
  const [activeTab, setActiveTab] = useState<'accounts' | 'warriors' | 'criteria' | 'marks' | 'messages' | 'homepage'>('accounts');
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

  // Filter accounts
  const allAccounts = accounts.filter(acc => acc.email !== 'spiderwarrior15@gmail.com'); // Exclude admin
  const unreadMessages = messages.filter(msg => !msg.isRead);

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
    
    // Update in accounts array
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, role: newRole } : acc
    ));
    
    // Also update through auth context for real-time sync
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
    { id: 'warriors', label: 'Warriors List', icon: Shield, count: allAccounts.length },
    { id: 'criteria', label: 'Marking Criteria', icon: Star, count: criteria.filter(c => c.isActive).length },
    { id: 'marks', label: 'Warrior Marks', icon: Crown, count: marks.length },
    { id: 'messages', label: 'Contact Messages', icon: MessageSquare, count: unreadMessages.length },
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
                        {account.avatar ? (
                          <img src={account.avatar} alt={account.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white font-bold">
                            {account.name.charAt(0).toUpperCase()}
                          </span>
                        )}
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">Promote/Demote:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleToggle(account.id);
                        }}
                        className="flex items-center space-x-2 text-sm hover:scale-105 transition-transform duration-200"
                      >
                        <ArrowUpDown className="w-4 h-4 text-purple-500" />
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

        {/* Warriors List Tab */}
        {activeTab === 'warriors' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-purple-500" />
                Warriors List ({allAccounts.length})
              </h2>
              <GlassCard className="p-6">
                <div className="space-y-4">
                  {allAccounts.map((warrior) => (
                    <div key={warrior.id} className="flex items-center justify-between p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/30 transition-colors duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          {warrior.avatar ? (
                            <img src={warrior.avatar} alt={warrior.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-bold">
                              {warrior.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{warrior.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{warrior.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          warrior.role === 'Commander' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {warrior.role}
                        </span>
                        
                        <button
                          onClick={() => handleRoleToggle(warrior.id)}
                          className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors duration-300"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                          <span className="text-sm">Toggle</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Contact Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-green-500" />
              Contact Messages ({messages.length})
            </h2>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Messages from the contact form will appear here
                  </p>
                </GlassCard>
              ) : (
                messages.map((message) => (
                  <GlassCard key={message.id} className={`p-6 ${!message.isRead ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            {message.name}
                          </h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {message.email}
                          </span>
                          {!message.isRead && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                          {message.message}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Received: {formatDate(message.timestamp)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!message.isRead && (
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleMarkMessageAsRead(message.id)}
                            soundType="success"
                          >
                            Mark Read
                          </AnimatedButton>
                        )}
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-500 hover:text-red-600"
                          soundType="error"
                        >
                          Delete
                        </AnimatedButton>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
        )}

        {/* Marking Criteria Tab */}
        {activeTab === 'criteria' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Marking Criteria</h2>
              <AnimatedButton
                variant="primary"
                icon={Plus}
                onClick={() => setIsAddingCriteria(true)}
                soundType="click"
              >
                Add Criteria
              </AnimatedButton>
            </div>

            {/* Add Criteria Form */}
            {isAddingCriteria && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Add New Criteria</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newCriteria.name}
                        onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                        placeholder="Criteria name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Score
                      </label>
                      <input
                        type="number"
                        value={newCriteria.maxScore}
                        onChange={(e) => setNewCriteria({ ...newCriteria, maxScore: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newCriteria.category}
                      onChange={(e) => setNewCriteria({ ...newCriteria, category: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                    >
                      <option value="participation">Participation</option>
                      <option value="creativity">Creativity</option>
                      <option value="technical">Technical</option>
                      <option value="leadership">Leadership</option>
                      <option value="collaboration">Collaboration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newCriteria.description}
                      onChange={(e) => setNewCriteria({ ...newCriteria, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white resize-none"
                      rows={3}
                      placeholder="Describe this criteria..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <AnimatedButton
                      variant="primary"
                      onClick={handleAddCriteria}
                      disabled={!newCriteria.name.trim() || !newCriteria.description.trim()}
                      soundType="success"
                    >
                      Add Criteria
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      onClick={() => {
                        setIsAddingCriteria(false);
                        setNewCriteria({
                          name: '',
                          description: '',
                          maxScore: 10,
                          category: 'participation'
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

            {/* Criteria List */}
            <div className="space-y-4">
              {criteria.map((criterion) => (
                <GlassCard key={criterion.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          {criterion.name}
                        </h3>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                          {criterion.category}
                        </span>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                          Max: {criterion.maxScore}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {criterion.description}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Created: {formatDate(criterion.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleCriteria(criterion.id)}
                        className={`p-2 rounded-lg transition-colors duration-300 ${
                          criterion.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {criterion.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteCriteria(criterion.id)}
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

        {/* Warrior Marks Tab */}
        {activeTab === 'marks' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Warrior Marks</h2>
            <div className="space-y-4">
              {marks.map((mark) => {
                const warrior = allAccounts.find(w => w.id === mark.warriorId);
                const criterion = criteria.find(c => c.id === mark.criteriaId);
                
                return (
                  <GlassCard key={mark.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                          {warrior?.name || 'Unknown Warrior'}
                        </h3>
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                            {criterion?.name || 'Unknown Criteria'}
                          </span>
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold">
                            {mark.score} / {criterion?.maxScore || 0}
                          </span>
                        </div>
                        {mark.feedback && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {mark.feedback}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Marked: {formatDate(mark.markedAt)} by {mark.markedBy}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Homepage Content Tab */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Homepage Content</h2>
              {!editingContent ? (
                <AnimatedButton
                  variant="primary"
                  icon={Edit}
                  onClick={() => {
                    setEditingContent(true);
                    setTempContent(content);
                  }}
                  soundType="click"
                >
                  Edit Content
                </AnimatedButton>
              ) : (
                <div className="flex space-x-2">
                  <AnimatedButton
                    variant="primary"
                    icon={Save}
                    onClick={handleSaveContent}
                    soundType="success"
                  >
                    Save Changes
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    icon={X}
                    onClick={() => {
                      setEditingContent(false);
                      setTempContent(content);
                    }}
                    soundType="click"
                  >
                    Cancel
                  </AnimatedButton>
                </div>
              )}
            </div>

            <GlassCard className="p-6">
              <div className="space-y-6">
                {/* Hero Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Hero Section</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hero Title
                      </label>
                      {editingContent ? (
                        <input
                          type="text"
                          value={tempContent.heroTitle}
                          onChange={(e) => setTempContent({ ...tempContent, heroTitle: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">{content.heroTitle}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Welcome Badge Text
                      </label>
                      {editingContent ? (
                        <input
                          type="text"
                          value={tempContent.welcomeBadgeText}
                          onChange={(e) => setTempContent({ ...tempContent, welcomeBadgeText: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">{content.welcomeBadgeText}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hero Description
                    </label>
                    {editingContent ? (
                      <textarea
                        value={tempContent.heroDescription}
                        onChange={(e) => setTempContent({ ...tempContent, heroDescription: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white resize-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white">{content.heroDescription}</p>
                    )}
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Tagline</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Main Tagline
                      </label>
                      {editingContent ? (
                        <input
                          type="text"
                          value={tempContent.tagline}
                          onChange={(e) => setTempContent({ ...tempContent, tagline: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">{content.tagline}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tagline Subtext
                      </label>
                      {editingContent ? (
                        <input
                          type="text"
                          value={tempContent.taglineSubtext}
                          onChange={(e) => setTempContent({ ...tempContent, taglineSubtext: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">{content.taglineSubtext}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">About Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        About Title
                      </label>
                      {editingContent ? (
                        <input
                          type="text"
                          value={tempContent.aboutTitle}
                          onChange={(e) => setTempContent({ ...tempContent, aboutTitle: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">{content.aboutTitle}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        About Description
                      </label>
                      {editingContent ? (
                        <textarea
                          value={tempContent.aboutDescription}
                          onChange={(e) => setTempContent({ ...tempContent, aboutDescription: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white resize-none"
                          rows={4}
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">{content.aboutDescription}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
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