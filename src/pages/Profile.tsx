import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Edit, Save, X, Star, Trophy, MessageCircle, Calendar, MapPin, Mail, Phone, Crown, Award, Target, Users, Zap, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { AvatarCreator } from '../components/AvatarCreator';
import { useAuth } from '../hooks/useAuth';
import { UserAvatar } from '../types';
import { format } from 'date-fns';

export const Profile: React.FC = () => {
  const { user, updateUser, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    interests: [] as string[],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username,
        email: user.email,
        bio: '',
        location: '',
        interests: [],
      });
    }
  }, [user]);

  const interestOptions = [
    'Technology', 'Gaming', 'Music', 'Art', 'Sports', 'Photography',
    'Programming', 'Design', 'Writing', 'Dancing', 'Cooking', 'Travel'
  ];

  const handleInterestToggle = (interest: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    await updateUser(user.id, {
      username: editData.username.trim(),
      email: editData.email.trim(),
    });

    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    // Validate new password
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    const success = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      alert('Password changed successfully!');
    }
  };

  const handleAvatarSave = async (avatar: UserAvatar) => {
    if (!user) return;
    
    await updateUser(user.id, { avatar });
    setIsCreatingAvatar(false);
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        username: user.username,
        email: user.email,
        bio: '',
        location: '',
        interests: [],
      });
    }
    setIsEditing(false);
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplay = () => {
    if (!user) return 'Warrior';
    return user.role === 'admin' ? 'Spider Warrior (Admin)' : 'Warrior';
  };

  const getRoleBadgeColor = () => {
    if (!user) return 'bg-blue-500/20 text-blue-400';
    return user.role === 'admin' 
      ? 'bg-yellow-500/20 text-yellow-400' 
      : 'bg-blue-500/20 text-blue-400';
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view your profile
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <User className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Warrior Profile</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {user.username}'s Profile
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 text-center">
              <div className="relative mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: user.avatar?.color || '#3b82f6' }}
                  >
                    <span className="text-4xl font-bold text-white">
                      {(user.avatar?.name || user.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Avatar Edit Button */}
                  <button
                    onClick={() => setIsCreatingAvatar(true)}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 border-2 border-white dark:border-gray-900"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                {/* Role Badge */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                  {user.role === 'admin' ? (
                    <Crown className="w-4 h-4 mr-1" />
                  ) : (
                    <User className="w-4 h-4 mr-1" />
                  )}
                  {getRoleDisplay()}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-center"
                  />
                ) : (
                  user.username
                )}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-center"
                  />
                ) : (
                  user.email
                )}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800 dark:text-white">{user.stats.totalPoints}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Points</div>
                </div>
                <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                  <Star className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800 dark:text-white">{user.stats.achievementsUnlocked}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Achievements</div>
                </div>
                <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                  <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800 dark:text-white">{user.stats.puzzlesSolved}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Puzzles Solved</div>
                </div>
                <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800 dark:text-white">{user.stats.messagesCount}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Messages</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isEditing ? (
                  <>
                    <AnimatedButton
                      variant="primary"
                      icon={Edit}
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      Edit Profile
                    </AnimatedButton>
                    <AnimatedButton
                      variant="secondary"
                      icon={Lock}
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full"
                    >
                      Change Password
                    </AnimatedButton>
                  </>
                ) : (
                  <div className="flex space-x-2">
                    <AnimatedButton
                      variant="primary"
                      icon={Save}
                      onClick={handleSave}
                      className="flex-1"
                    >
                      Save
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      icon={X}
                      onClick={handleCancel}
                    >
                      Cancel
                    </AnimatedButton>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Password Change Modal */}
            {isChangingPassword && (
              <GlassCard className="p-6 border-2 border-yellow-500/30">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <AnimatedButton
                      variant="primary"
                      onClick={handlePasswordChange}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="flex-1"
                    >
                      Change Password
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      onClick={handleCancelPasswordChange}
                    >
                      Cancel
                    </AnimatedButton>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Personal Information */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                    <div className="font-medium text-gray-800 dark:text-white">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Joined</div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Active</div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {format(new Date(user.lastActive), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                    <div className={`font-medium ${user.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Activity Summary */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Activity Summary
              </h3>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Messages Sent</span>
                  <span className="font-bold text-blue-600">{user.stats.messagesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Forms Submitted</span>
                  <span className="font-bold text-green-600">{user.stats.formsSubmitted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Events Attended</span>
                  <span className="font-bold text-purple-600">{user.stats.eventsAttended}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Songs Uploaded</span>
                  <span className="font-bold text-pink-600">{user.stats.songsUploaded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Puzzles Solved</span>
                  <span className="font-bold text-yellow-600">{user.stats.puzzlesSolved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Quizzes Completed</span>
                  <span className="font-bold text-teal-600">{user.stats.quizzesCompleted}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-4">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Total Points</span>
                  <span className="font-bold text-2xl text-purple-600">{user.stats.totalPoints}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Avatar Creator Modal */}
        {isCreatingAvatar && (
          <AvatarCreator
            currentAvatar={user.avatar}
            onSave={handleAvatarSave}
            onClose={() => setIsCreatingAvatar(false)}
          />
        )}
      </div>
    </div>
  );
};