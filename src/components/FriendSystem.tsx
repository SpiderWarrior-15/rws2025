import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Users, 
  Check, 
  X, 
  MessageCircle, 
  Search,
  UserCheck,
  UserX,
  Clock,
  Heart
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { ScrollableContainer } from './ScrollableContainer';
import { useAuth } from '../hooks/useAuth';
import { friendService } from '../services/friendService';
import { dataService } from '../services/dataService';
import { User, FriendRequest } from '../types';
import toast from 'react-hot-toast';

interface FriendSystemProps {
  targetUser?: User;
  showFullInterface?: boolean;
}

export const FriendSystem: React.FC<FriendSystemProps> = ({ 
  targetUser, 
  showFullInterface = false 
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<{
    incoming: (FriendRequest & { sender: User })[];
    outgoing: (FriendRequest & { receiver: User })[];
  }>({ incoming: [], outgoing: [] });
  const [friendshipStatus, setFriendshipStatus] = useState<'friends' | 'pending_sent' | 'pending_received' | 'none'>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriendData();
    }
  }, [user]);

  useEffect(() => {
    if (targetUser && user) {
      loadFriendshipStatus();
    }
  }, [targetUser, user]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadFriendData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userFriends, requests] = await Promise.all([
        friendService.getUserFriends(user.id),
        friendService.getFriendRequests(user.id)
      ]);
      
      setFriends(userFriends);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend data:', error);
      toast.error('Failed to load friend data');
    } finally {
      setLoading(false);
    }
  };

  const loadFriendshipStatus = async () => {
    if (!user || !targetUser) return;
    
    const status = await friendService.getFriendshipStatus(user.id, targetUser.id);
    setFriendshipStatus(status);
  };

  const searchUsers = async () => {
    if (!user) return;
    
    try {
      const allUsers = await dataService.getUsers();
      const filtered = allUsers.filter(u => 
        u.id !== user.id && 
        !u.isBanned &&
        (u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
         u.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered.slice(0, 10));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    if (!user) return;
    
    const result = await friendService.sendFriendRequest(user.id, receiverId);
    if (result.success) {
      toast.success('Friend request sent!');
      if (targetUser && targetUser.id === receiverId) {
        setFriendshipStatus('pending_sent');
      }
      loadFriendData();
    } else {
      toast.error(result.error || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const result = await friendService.acceptFriendRequest(requestId);
    if (result.success) {
      toast.success('Friend request accepted!');
      loadFriendData();
      if (targetUser) {
        loadFriendshipStatus();
      }
    } else {
      toast.error(result.error || 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const result = await friendService.rejectFriendRequest(requestId);
    if (result.success) {
      toast.success('Friend request rejected');
      loadFriendData();
    } else {
      toast.error(result.error || 'Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    
    const confirmed = window.confirm('Are you sure you want to remove this friend?');
    if (!confirmed) return;
    
    const result = await friendService.removeFriend(user.id, friendId);
    if (result.success) {
      toast.success('Friend removed');
      loadFriendData();
      if (targetUser && targetUser.id === friendId) {
        setFriendshipStatus('none');
      }
    } else {
      toast.error(result.error || 'Failed to remove friend');
    }
  };

  const getFriendButtonContent = () => {
    switch (friendshipStatus) {
      case 'friends':
        return { text: 'Friends', icon: UserCheck, variant: 'secondary' as const, color: 'text-green-500' };
      case 'pending_sent':
        return { text: 'Requested', icon: Clock, variant: 'ghost' as const, color: 'text-yellow-500' };
      case 'pending_received':
        return { text: 'Accept Request', icon: UserPlus, variant: 'primary' as const, color: 'text-blue-500' };
      default:
        return { text: 'Add Friend', icon: UserPlus, variant: 'primary' as const, color: 'text-purple-500' };
    }
  };

  // If showing just the friend button for a target user
  if (targetUser && !showFullInterface) {
    const buttonContent = getFriendButtonContent();
    
    return (
      <AnimatedButton
        variant={buttonContent.variant}
        icon={buttonContent.icon}
        onClick={() => {
          if (friendshipStatus === 'none') {
            handleSendFriendRequest(targetUser.id);
          } else if (friendshipStatus === 'pending_received') {
            // Find the request and accept it
            const request = friendRequests.incoming.find(r => r.senderId === targetUser.id);
            if (request) {
              handleAcceptRequest(request.id);
            }
          } else if (friendshipStatus === 'friends') {
            handleRemoveFriend(targetUser.id);
          }
        }}
        className={`${buttonContent.color}`}
        disabled={friendshipStatus === 'pending_sent'}
      >
        {buttonContent.text}
      </AnimatedButton>
    );
  }

  // Full friend system interface
  if (!showFullInterface) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Friend System
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with fellow warriors and build your network
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-white/10 backdrop-blur-md rounded-lg p-1">
          {[
            { id: 'friends', name: 'Friends', icon: Users, count: friends.length },
            { id: 'requests', name: 'Requests', icon: UserPlus, count: friendRequests.incoming.length },
            { id: 'search', name: 'Find Warriors', icon: Search, count: 0 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'friends' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Your Friends ({friends.length})
              </h3>
              <ScrollableContainer maxHeight="400px">
                {friends.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {friends.map(friend => (
                      <div key={friend.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: friend.avatar?.color || '#3b82f6' }}
                        >
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {friend.username}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Level {friend.level} • {friend.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No friends yet. Start connecting with fellow warriors!</p>
                  </div>
                )}
              </ScrollableContainer>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Incoming Requests */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Incoming Requests ({friendRequests.incoming.length})
              </h3>
              <ScrollableContainer maxHeight="300px">
                {friendRequests.incoming.length > 0 ? (
                  <div className="space-y-3">
                    {friendRequests.incoming.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: request.sender.avatar?.color || '#3b82f6' }}
                          >
                            {request.sender.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {request.sender.username}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Level {request.sender.level} • Wants to be your friend
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            icon={Check}
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-green-500/20 text-green-400 border-green-500/30"
                          >
                            Accept
                          </AnimatedButton>
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            icon={X}
                            onClick={() => handleRejectRequest(request.id)}
                            className="text-red-500"
                          >
                            Reject
                          </AnimatedButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No incoming friend requests</p>
                  </div>
                )}
              </ScrollableContainer>
            </GlassCard>

            {/* Outgoing Requests */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Sent Requests ({friendRequests.outgoing.length})
              </h3>
              <ScrollableContainer maxHeight="200px">
                {friendRequests.outgoing.length > 0 ? (
                  <div className="space-y-3">
                    {friendRequests.outgoing.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: request.receiver.avatar?.color || '#3b82f6' }}
                          >
                            {request.receiver.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {request.receiver.username}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Request pending...
                            </p>
                          </div>
                        </div>
                        <Clock className="w-5 h-5 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No pending requests</p>
                  </div>
                )}
              </ScrollableContainer>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Find Warriors
              </h3>
              
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    placeholder="Search by username or email..."
                  />
                </div>
              </div>

              <ScrollableContainer maxHeight="400px">
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map(searchUser => {
                      const isFriend = friends.some(f => f.id === searchUser.id);
                      const hasPendingRequest = friendRequests.outgoing.some(r => r.receiverId === searchUser.id);
                      
                      return (
                        <div key={searchUser.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: searchUser.avatar?.color || '#3b82f6' }}
                            >
                              {searchUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 dark:text-white">
                                {searchUser.username}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Level {searchUser.level} • {searchUser.role}
                              </p>
                            </div>
                          </div>
                          
                          {isFriend ? (
                            <div className="flex items-center space-x-2 text-green-500">
                              <UserCheck className="w-5 h-5" />
                              <span className="text-sm">Friends</span>
                            </div>
                          ) : hasPendingRequest ? (
                            <div className="flex items-center space-x-2 text-yellow-500">
                              <Clock className="w-5 h-5" />
                              <span className="text-sm">Pending</span>
                            </div>
                          ) : (
                            <AnimatedButton
                              variant="primary"
                              size="sm"
                              icon={UserPlus}
                              onClick={() => handleSendFriendRequest(searchUser.id)}
                            >
                              Add Friend
                            </AnimatedButton>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No warriors found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Enter at least 2 characters to search for warriors</p>
                  </div>
                )}
              </ScrollableContainer>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};