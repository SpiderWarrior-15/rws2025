import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, Plus, Send, Smile, MoreVertical, Search, Hash, Lock, Crown, Settings, UserPlus, Edit, Trash2, Reply, Heart } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useSounds } from '../hooks/useSounds';
import { ChatGroup, ChatMessage, DirectMessage, ChatReaction, UserAccount } from '../types';
import { initialChatGroups, initialChatMessages } from '../utils/initialData';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { playSound } = useSounds();
  const [accounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [groups, setGroups] = useLocalStorage<ChatGroup[]>('rws-chat-groups', initialChatGroups);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('rws-chat-messages', initialChatMessages);
  const [directMessages, setDirectMessages] = useLocalStorage<DirectMessage[]>('rws-direct-messages', []);
  
  const [activeGroupId, setActiveGroupId] = useState<string>('1');
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const groupMessages = messages.filter(m => m.groupId === activeGroupId).sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const isAdmin = user?.accountType === 'admin';
  const isGroupAdmin = activeGroup && user && activeGroup.admins.includes(user.id);

  // Get user name from accounts
  const getUserName = (userId: string) => {
    if (userId === 'system') return 'Royal Warriors Squad';
    const account = accounts.find(acc => acc.id === userId);
    return account?.name || 'Unknown User';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [groupMessages]);

  const handleSendMessage = () => {
    if (!user || !newMessage.trim() || !activeGroup) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      groupId: activeGroupId,
      senderId: user.id,
      senderName: user.username || user.name,
      senderAvatar: user.avatar,
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      reactions: [],
      isDeleted: false,
      replyTo: replyingTo?.id
    };

    setMessages([...messages, message]);
    setNewMessage('');
    setReplyingTo(null);
    playSound('success');

    // Update group last activity
    setGroups(groups.map(g => 
      g.id === activeGroupId 
        ? { ...g, lastActivity: new Date().toISOString() }
        : g
    ));
  };

  const handleCreateGroup = () => {
    if (!user || !newGroup.name.trim()) return;

    const group: ChatGroup = {
      id: Date.now().toString(),
      ...newGroup,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      members: [user.id],
      admins: [user.id],
      isActive: true,
      lastActivity: new Date().toISOString()
    };

    setGroups([...groups, group]);
    setNewGroup({ name: '', description: '', type: 'public' });
    setIsCreatingGroup(false);
    setActiveGroupId(group.id);
    playSound('success');
  };

  const handleJoinGroup = (groupId: string) => {
    if (!user) return;

    setGroups(groups.map(g => 
      g.id === groupId && !g.members.includes(user.id)
        ? { ...g, members: [...g.members, user.id] }
        : g
    ));
    playSound('success');
  };

  const handleLeaveGroup = (groupId: string) => {
    if (!user) return;

    setGroups(groups.map(g => 
      g.id === groupId
        ? { 
            ...g, 
            members: g.members.filter(m => m !== user.id),
            admins: g.admins.filter(a => a !== user.id)
          }
        : g
    ));

    if (activeGroupId === groupId) {
      const availableGroup = groups.find(g => g.members.includes(user.id) && g.id !== groupId);
      setActiveGroupId(availableGroup?.id || '1');
    }
    playSound('click');
  };

  const handleDeleteGroup = (groupId: string) => {
    if (!user || !isAdmin) return;

    setGroups(groups.filter(g => g.id !== groupId));
    setMessages(messages.filter(m => m.groupId !== groupId));
    
    if (activeGroupId === groupId) {
      const remainingGroup = groups.find(g => g.id !== groupId);
      setActiveGroupId(remainingGroup?.id || '1');
    }
    playSound('error');
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!user) return;

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const existingReaction = message.reactions.find(r => r.userId === user.id && r.emoji === emoji);
    
    if (existingReaction) {
      // Remove reaction
      setMessages(messages.map(m => 
        m.id === messageId
          ? { ...m, reactions: m.reactions.filter(r => r.id !== existingReaction.id) }
          : m
      ));
    } else {
      // Add reaction
      const reaction: ChatReaction = {
        id: Date.now().toString(),
        messageId,
        userId: user.id,
        emoji,
        timestamp: new Date().toISOString()
      };

      setMessages(messages.map(m => 
        m.id === messageId
          ? { ...m, reactions: [...m.reactions, reaction] }
          : m
      ));
    }
    playSound('click');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userGroups = user ? groups.filter(g => g.members.includes(user.id)) : [];
  const availableGroups = user ? groups.filter(g => !g.members.includes(user.id) && g.type === 'public') : [];

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Join the Conversation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to chat with fellow warriors and join groups
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <MessageCircle className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Warrior Communications</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Squad Chat
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Connect, collaborate, and conquer together with your fellow warriors
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <GlassCard className="p-4 h-full flex flex-col">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm"
                  placeholder="Search groups..."
                />
              </div>

              {/* Create Group Button */}
              <AnimatedButton
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreatingGroup(true)}
                className="mb-4 w-full"
                soundType="click"
              >
                Create Group
              </AnimatedButton>

              {/* Groups List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Your Groups
                </div>
                {userGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroupId(group.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                      activeGroupId === group.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-700/30 text-gray-800 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {group.type === 'private' ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Hash className="w-4 h-4" />
                      )}
                      <span className="font-medium text-sm truncate">{group.name}</span>
                    </div>
                    <div className="text-xs opacity-75 mt-1 truncate">
                      {group.members.length} members
                    </div>
                  </button>
                ))}

                {availableGroups.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 mt-4">
                      Available Groups
                    </div>
                    {availableGroups.map(group => (
                      <div key={group.id} className="p-3 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-sm text-gray-800 dark:text-white">
                              {group.name}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {group.description}
                        </p>
                        <AnimatedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleJoinGroup(group.id)}
                          className="w-full"
                          soundType="success"
                        >
                          Join
                        </AnimatedButton>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <GlassCard className="h-full flex flex-col">
              {/* Chat Header */}
              {activeGroup && (
                <div className="p-4 border-b border-white/10 dark:border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                        {activeGroup.type === 'private' ? (
                          <Lock className="w-5 h-5 text-white" />
                        ) : (
                          <Hash className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {activeGroup.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activeGroup.members.length} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(isGroupAdmin || isAdmin) && (
                        <button
                          onClick={() => setShowGroupSettings(true)}
                          className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
                        >
                          <Settings className="w-5 h-5 text-gray-500" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteGroup(activeGroup.id)}
                          className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300 text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleLeaveGroup(activeGroup.id)}
                        className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {groupMessages.map((message, index) => {
                  const prevMessage = groupMessages[index - 1];
                  const showDate = !prevMessage || 
                    formatDate(message.timestamp) !== formatDate(prevMessage.timestamp);
                  const showSender = !prevMessage || 
                    prevMessage.senderId !== message.senderId ||
                    new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000;

                  const replyMessage = message.replyTo ? 
                    messages.find(m => m.id === message.replyTo) : null;

                  // Get the actual user name from accounts
                  const senderName = getUserName(message.senderId);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="px-3 py-1 bg-white/10 dark:bg-gray-800/50 rounded-full text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex items-start space-x-3 group ${
                        message.senderId === user.id ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        {showSender && (
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            {message.senderAvatar ? (
                              <img 
                                src={message.senderAvatar} 
                                alt={senderName} 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-sm font-medium">
                                {senderName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className={`flex-1 max-w-xs md:max-w-md ${!showSender ? 'ml-11' : ''}`}>
                          {showSender && (
                            <div className={`flex items-center space-x-2 mb-1 ${
                              message.senderId === user.id ? 'justify-end' : ''
                            }`}>
                              <span className="text-sm font-medium text-gray-800 dark:text-white">
                                {senderName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          )}
                          
                          {replyMessage && (
                            <div className="mb-2 p-2 bg-white/5 dark:bg-gray-800/20 rounded border-l-2 border-purple-500">
                              <div className="text-xs text-purple-400 mb-1">
                                Replying to {getUserName(replyMessage.senderId)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {replyMessage.content}
                              </div>
                            </div>
                          )}
                          
                          <div className={`p-3 rounded-lg ${
                            message.senderId === user.id
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : 'bg-white/10 dark:bg-gray-800/50 text-gray-800 dark:text-white'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          
                          {/* Reactions */}
                          {message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(
                                message.reactions.reduce((acc, reaction) => {
                                  acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([emoji, count]) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(message.id, emoji)}
                                  className="px-2 py-1 bg-white/10 dark:bg-gray-800/50 rounded-full text-xs hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors duration-300"
                                >
                                  {emoji} {count}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Message Actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => handleReaction(message.id, '❤️')}
                              className="p-1 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded transition-colors duration-300"
                            >
                              <Heart className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="p-1 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded transition-colors duration-300"
                            >
                              <Reply className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-4 py-2 bg-white/5 dark:bg-gray-800/20 border-t border-white/10 dark:border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Reply className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-400">
                        Replying to {getUserName(replyingTo.senderId)}
                      </span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                    {replyingTo.content}
                  </p>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-white/10 dark:border-gray-700/30">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder={`Message ${activeGroup?.name || 'group'}...`}
                    />
                  </div>
                  <AnimatedButton
                    variant="primary"
                    icon={Send}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    soundType="success"
                  >
                    Send
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Create Group Modal */}
        {isCreatingGroup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  Create New Group
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder="Enter group name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                      rows={3}
                      placeholder="Describe your group..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Privacy
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setNewGroup({ ...newGroup, type: 'public' })}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          newGroup.type === 'public'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white/5 dark:bg-gray-800/20'
                        }`}
                      >
                        <Hash className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                        <div className="text-sm font-medium text-gray-800 dark:text-white">Public</div>
                      </button>
                      <button
                        onClick={() => setNewGroup({ ...newGroup, type: 'private' })}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          newGroup.type === 'private'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white/5 dark:bg-gray-800/20'
                        }`}
                      >
                        <Lock className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                        <div className="text-sm font-medium text-gray-800 dark:text-white">Private</div>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <AnimatedButton
                    variant="primary"
                    onClick={handleCreateGroup}
                    disabled={!newGroup.name.trim()}
                    className="flex-1"
                    soundType="success"
                  >
                    Create Group
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => {
                      setIsCreatingGroup(false);
                      setNewGroup({ name: '', description: '', type: 'public' });
                    }}
                    soundType="click"
                  >
                    Cancel
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};