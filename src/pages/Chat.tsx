import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Plus, 
  Users, 
  Hash, 
  Lock, 
  Crown, 
  Shield,
  Smile,
  Image,
  Paperclip,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { fileService } from '../services/fileService';
import { socketService } from '../services/socketService';
import { Chat, Message, ApprovalRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string>('global');
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    type: 'group' as const
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isCommander = user?.role === 'commander' || user?.role === 'admin';

  useEffect(() => {
    loadChats();
    loadMessages();
    
    // Set up real-time listeners
    const unsubscribeMessage = socketService.on('message_sent', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      unsubscribeMessage();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      let allChats = await fileService.getChats();
      
      // Create global chat if it doesn't exist
      if (!allChats.find(c => c.id === 'global')) {
        const globalChat: Chat = {
          id: 'global',
          name: 'Global Chat',
          type: 'global',
          participants: [],
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          isActive: true,
          isVerified: true,
          description: 'Main chat for all warriors',
          unreadCount: {}
        };
        
        await fileService.saveChat(globalChat);
        allChats = [globalChat, ...allChats];
      }
      
      setChats(allChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const allMessages = await fileService.getMessages();
      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    const message: Message = {
      id: uuidv4(),
      senderId: user.id,
      senderUsername: user.username,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      chatId: activeChat,
      isEdited: false,
      reactions: []
    };

    try {
      await fileService.saveMessage(message);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update user stats
      await fileService.updateUser(user.id, {
        stats: {
          ...user.stats,
          messagesCount: user.stats.messagesCount + 1
        }
      });

      // Emit real-time event
      socketService.emit('message_sent', message);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroup.name.trim()) return;

    const chat: Chat = {
      id: uuidv4(),
      name: newGroup.name.trim(),
      type: 'group',
      participants: [user.id],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      isActive: true,
      isVerified: false,
      description: newGroup.description.trim(),
      unreadCount: {}
    };

    try {
      await fileService.saveChat(chat);
      
      // Create approval request
      const approvalRequest: ApprovalRequest = {
        id: uuidv4(),
        type: 'group',
        itemId: chat.id,
        requestedBy: user.id,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };

      await fileService.saveApprovalRequest(approvalRequest);
      
      setNewGroup({ name: '', description: '', type: 'group' });
      setIsCreatingGroup(false);
      
      toast.success('Group created! Waiting for commander verification.');
      loadChats();
      
      // Emit real-time event
      socketService.emit('approval_requested', approvalRequest);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleGroupApproval = async (chatId: string, approved: boolean) => {
    if (!isCommander) return;

    try {
      await fileService.updateChat(chatId, {
        isVerified: approved,
        verifiedBy: user!.id,
        verifiedAt: new Date().toISOString()
      });

      // Update approval request
      const approvals = await fileService.getApprovalRequests();
      const approval = approvals.find(a => a.itemId === chatId && a.type === 'group');
      if (approval) {
        await fileService.updateApprovalRequest(approval.id, {
          status: approved ? 'approved' : 'rejected',
          reviewedBy: user!.id,
          reviewedAt: new Date().toISOString()
        });
      }

      toast.success(`Group ${approved ? 'approved' : 'rejected'} successfully`);
      loadChats();
    } catch (error) {
      console.error('Group approval error:', error);
      toast.error('Failed to process approval');
    }
  };

  const currentChat = chats.find(c => c.id === activeChat);
  const chatMessages = messages.filter(m => m.chatId === activeChat);
  const verifiedChats = chats.filter(c => c.isVerified || c.type === 'global');
  const pendingGroups = chats.filter(c => !c.isVerified && c.type === 'group');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'commander': return Shield;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-yellow-500';
      case 'commander': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Join the Conversation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to chat with fellow warriors
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
          className="text-center mb-8"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 mb-6 shadow-lg shadow-blue-500/10">
            <MessageCircle className="w-6 h-6 text-blue-400 mr-3 animate-pulse" />
            <span className="text-lg font-semibold text-blue-400">Warrior Communications</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chat Hub
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <GlassCard className="p-4 h-full flex flex-col">
              {/* Create Group Button */}
              <AnimatedButton
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreatingGroup(true)}
                className="mb-4 w-full"
              >
                Create Group
              </AnimatedButton>

              {/* Pending Groups (Commander only) */}
              {isCommander && pendingGroups.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-yellow-400 mb-2">
                    Pending Groups ({pendingGroups.length})
                  </h4>
                  <div className="space-y-2">
                    {pendingGroups.map(group => (
                      <div key={group.id} className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {group.name}
                        </div>
                        <div className="flex space-x-1 mt-2">
                          <button
                            onClick={() => handleGroupApproval(group.id, true)}
                            className="flex-1 p-1 bg-green-500/20 text-green-400 rounded text-xs"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleGroupApproval(group.id, false)}
                            className="flex-1 p-1 bg-red-500/20 text-red-400 rounded text-xs"
                          >
                            ✗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {verifiedChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                      activeChat === chat.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-gray-800 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {chat.type === 'global' ? (
                        <Hash className="w-4 h-4" />
                      ) : chat.type === 'private' ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                      <span className="font-medium text-sm truncate">{chat.name}</span>
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {chat.participants.length} members
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <GlassCard className="h-full flex flex-col">
              {/* Chat Header */}
              {currentChat && (
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                        {currentChat.type === 'global' ? (
                          <Hash className="w-5 h-5 text-white" />
                        ) : currentChat.type === 'private' ? (
                          <Lock className="w-5 h-5 text-white" />
                        ) : (
                          <Users className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {currentChat.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {currentChat.participants.length} members
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map(message => {
                  const senderRole = user?.role || 'warrior';
                  const RoleIcon = getRoleIcon(senderRole);
                  
                  return (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <RoleIcon className={`w-4 h-4 text-white`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {message.senderUsername}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.timestamp), 'HH:mm')}
                          </span>
                        </div>
                        
                        <div className="p-3 bg-white/10 rounded-lg">
                          <p className="text-sm text-gray-800 dark:text-white">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder={`Message ${currentChat?.name || 'chat'}...`}
                    />
                  </div>
                  <AnimatedButton
                    variant="primary"
                    icon={Send}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
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
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
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
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                      rows={3}
                      placeholder="Describe your group..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <AnimatedButton
                    variant="primary"
                    onClick={handleCreateGroup}
                    disabled={!newGroup.name.trim()}
                    className="flex-1"
                  >
                    Create Group
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => {
                      setIsCreatingGroup(false);
                      setNewGroup({ name: '', description: '', type: 'group' });
                    }}
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