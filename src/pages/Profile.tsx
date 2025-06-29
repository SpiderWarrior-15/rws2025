import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Star, Trophy, MessageCircle, Calendar, MapPin, Mail, Phone, Crown, Award, Target, Users, Zap, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSounds } from '../hooks/useSounds';
import { UserAccount, PuzzleAttempt, Mark, MarkingCriteria, ChatMessage } from '../types';

export const Profile: React.FC = () => {
  const { user, updateAccount } = useAuth();
  const { playSound } = useSounds();
  const [accounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [attempts] = useLocalStorage<PuzzleAttempt[]>('rws-puzzle-attempts', []);
  const [marks] = useLocalStorage<Mark[]>('rws-marks', []);
  const [criteria] = useLocalStorage<MarkingCriteria[]>('rws-marking-criteria', []);
  const [messages] = useLocalStorage<ChatMessage[]>('rws-chat-messages', []);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [editData, setEditData] = useState({
    name: '',
    whatsapp: '',
    city: '',
    country: '',
    interests: [] as string[],
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const userAccount = user ? accounts.find(acc => acc.id === user.id) : null;

  useEffect(() => {
    if (userAccount) {
      setEditData({
        name: userAccount.name,
        whatsapp: userAccount.whatsapp,
        city: userAccount.city,
        country: userAccount.country,
        interests: userAccount.interests,
        avatar: userAccount.avatar || ''
      });
    }
  }, [userAccount]);

  // Calculate user stats
  const userStats = React.useMemo(() => {
    if (!user) return null;

    const userAttempts = attempts.filter(a => a.userId === user.id);
    const correctAttempts = userAttempts.filter(a => a.isCorrect === true);
    const totalPoints = correctAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    
    const userMarks = marks.filter(m => m.warriorId === user.id);
    const markingPoints = userMarks.reduce((sum, mark) => sum + mark.score, 0);
    
    const userMessages = messages.filter(m => m.senderId === user.id);
    
    // Calculate rank based on total points
    const allUserPoints = accounts
      .filter(acc => acc.status === 'approved')
      .map(acc => {
        const accAttempts = attempts.filter(a => a.userId === acc.id && a.isCorrect === true);
        const accMarks = marks.filter(m => m.warriorId === acc.id);
        return {
          userId: acc.id,
          totalPoints: accAttempts.reduce((sum, a) => sum + a.score, 0) + accMarks.reduce((sum, m) => sum + m.score, 0)
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
    
    const userRank = allUserPoints.findIndex(u => u.userId === user.id) + 1;

    return {
      totalPoints: totalPoints + markingPoints,
      puzzlesSolved: correctAttempts.length,
      messagesPosted: userMessages.length,
      rank: userRank,
      markingScore: markingPoints,
      puzzleScore: totalPoints
    };
  }, [user, attempts, marks, messages, accounts]);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setEditData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!user || !userAccount) return;

    updateAccount(user.id, {
      name: editData.name.trim(),
      whatsapp: editData.whatsapp.trim(),
      city: editData.city.trim(),
      country: editData.country.trim(),
      interests: editData.interests,
      avatar: editData.avatar
    });

    setIsEditing(false);
    playSound('success');
  };

  const handlePasswordChange = () => {
    if (!user || !userAccount) return;

    // Validate current password (for admin account)
    if (userAccount.email === 'spiderwarrior15@gmail.com' && passwordData.currentPassword !== '2012_09_17') {
      alert('Current password is incorrect');
      playSound('error');
      return;
    }

    // Validate new password
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      playSound('error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      playSound('error');
      return;
    }

    // For the admin account, we'll store the new password in a special field
    // For other accounts, this is mainly for UI demonstration
    updateAccount(user.id, {
      customPassword: passwordData.newPassword // Store custom password
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
    playSound('success');
    alert('Password changed successfully!');
  };

  const handleCancel = () => {
    if (userAccount) {
      setEditData({
        name: userAccount.name,
        whatsapp: userAccount.whatsapp,
        city: userAccount.city,
        country: userAccount.country,
        interests: userAccount.interests,
        avatar: userAccount.avatar || ''
      });
    }
    setIsEditing(false);
    playSound('click');
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
    playSound('click');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplay = () => {
    if (!userAccount) return 'Warrior';
    
    if (userAccount.accountType === 'admin') {
      return userAccount.status === 'pending' ? 'Pending Commander (Warrior)' : 'Commander';
    }
    return 'Warrior';
  };

  const getRoleBadgeColor = () => {
    if (!userAccount) return 'bg-blue-500/20 text-blue-400';
    
    if (userAccount.accountType === 'admin') {
      return userAccount.status === 'pending' 
        ? 'bg-yellow-500/20 text-yellow-400' 
        : 'bg-yellow-500/20 text-yellow-400';
    }
    return 'bg-blue-500/20 text-blue-400';
  };

  if (!user || !userAccount) {
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <User className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Warrior Profile</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {user.username}'s Profile
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 text-center">
              <div className="relative mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {editData.avatar ? (
                      <img 
                        src={editData.avatar} 
                        alt={userAccount.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {userAccount.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Avatar Upload Button */}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 border-2 border-white dark:border-gray-900">
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {/* Role Badge */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                  {userAccount.accountType === 'admin' ? (
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
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-center"
                  />
                ) : (
                  userAccount.name
                )}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">{userAccount.email}</p>

              {/* Stats Grid */}
              {userStats && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                    <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-800 dark:text-white">#{userStats.rank}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Rank</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                    <Star className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{userStats.totalPoints}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Points</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                    <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{userStats.puzzlesSolved}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Puzzles Solved</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{userStats.messagesPosted}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Messages</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isEditing ? (
                  <>
                    <AnimatedButton
                      variant="primary"
                      icon={Edit}
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                      soundType="click"
                    >
                      Edit Profile
                    </AnimatedButton>
                    <AnimatedButton
                      variant="secondary"
                      icon={Lock}
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full"
                      soundType="click"
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
                      soundType="success"
                    >
                      Save
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      icon={X}
                      onClick={handleCancel}
                      soundType="click"
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
                      soundType="success"
                    >
                      Change Password
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      onClick={handleCancelPasswordChange}
                      soundType="click"
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
                    <div className="font-medium text-gray-800 dark:text-white">{userAccount.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</div>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.whatsapp}
                        onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })}
                        className="w-full px-3 py-1 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      />
                    ) : (
                      <div className="font-medium text-gray-800 dark:text-white">{userAccount.whatsapp}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={editData.city}
                          onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                          className="flex-1 px-3 py-1 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                          placeholder="City"
                        />
                        <input
                          type="text"
                          value={editData.country}
                          onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                          className="flex-1 px-3 py-1 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                          placeholder="Country"
                        />
                      </div>
                    ) : (
                      <div className="font-medium text-gray-800 dark:text-white">
                        {userAccount.city}, {userAccount.country}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Joined</div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {formatDate(userAccount.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Interests */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Battle Skills & Interests
              </h3>
              
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`p-3 rounded-lg border transition-all duration-300 text-sm ${
                        editData.interests.includes(interest)
                          ? 'border-purple-500 bg-purple-500/20 text-purple-600 dark:text-purple-400'
                          : 'border-gray-300 dark:border-gray-600 bg-white/5 dark:bg-gray-800/20 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userAccount.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full text-sm border border-purple-500/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Achievement Summary */}
            {userStats && (
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Achievement Summary
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Puzzle Points</span>
                      <span className="font-bold text-green-600">{userStats.puzzleScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Marking Points</span>
                      <span className="font-bold text-blue-600">{userStats.markingScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Points</span>
                      <span className="font-bold text-purple-600">{userStats.totalPoints}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Global Rank</span>
                      <span className="font-bold text-yellow-600">#{userStats.rank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Puzzles Solved</span>
                      <span className="font-bold text-teal-600">{userStats.puzzlesSolved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Messages Posted</span>
                      <span className="font-bold text-pink-600">{userStats.messagesPosted}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};