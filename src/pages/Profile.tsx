import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Calendar, 
  Star, 
  Trophy, 
  MessageCircle, 
  UserPlus,
  Settings,
  Activity,
  Music,
  Brain,
  Award,
  Edit,
  Save,
  X,
  Crown,
  Shield
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { ScrollableContainer } from '../components/ScrollableContainer';
import { FriendSystem } from '../components/FriendSystem';
import { AvatarCreator } from '../components/AvatarCreator';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { User as UserType, ActivityEntry, UserAvatar } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarCreatorOpen, setIsAvatarCreatorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    bio: '',
    location: ''
  });

  useEffect(() => {
    loadProfile();
  }, [username, currentUser]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (!username) {
        // No username provided, show current user's profile
        if (currentUser) {
          setProfileUser(currentUser);
          setIsOwnProfile(true);
          setEditForm({
            bio: currentUser.bio || '',
            location: currentUser.location || ''
          });
        } else {
          navigate('/login');
          return;
        }
      } else {
        // Load specific user's profile
        const users = await dataService.getUsers();
        const foundUser = users.find(u => 
          u.username.toLowerCase() === username.toLowerCase() && !u.isBanned
        );
        
        if (foundUser) {
          setProfileUser(foundUser);
          setIsOwnProfile(currentUser?.id === foundUser.id);
          setEditForm({
            bio: foundUser.bio || '',
            location: foundUser.location || ''
          });
        } else {
          toast.error('User not found');
          navigate('/');
          return;
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileUser || !isOwnProfile) return;

    try {
      const updates = {
        bio: editForm.bio.trim(),
        location: editForm.location.trim()
      };

      await updateUser(profileUser.id, updates);
      setProfileUser({ ...profileUser, ...updates });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleSaveAvatar = async (avatar: UserAvatar) => {
    if (!profileUser || !isOwnProfile) return;

    try {
      await updateUser(profileUser.id, { avatar });
      setProfileUser({ ...profileUser, avatar });
      setIsAvatarCreatorOpen(false);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  const getNextLevelXP = (level: number): number => {
    return level * 100; // Simplified calculation
  };

  const getProgressPercentage = (currentXP: number, level: number): number => {
    const currentLevelXP = (level - 1) * 100;
    const nextLevelXP = level * 100;
    const progressXP = currentXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    return Math.min(100, Math.max(0, (progressXP / requiredXP) * 100));
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Crown : Shield;
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'text-yellow-500' : 'text-blue-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested profile could not be found.
          </p>
        </GlassCard>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(profileUser.role);
  const progressPercentage = getProgressPercentage(profileUser.xp, profileUser.level);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl cursor-pointer group"
                  style={{ backgroundColor: profileUser.avatar?.color || '#3b82f6' }}
                  onClick={() => isOwnProfile && setIsAvatarCreatorOpen(true)}
                >
                  {profileUser.avatar?.imageUrl ? (
                    <img 
                      src={profileUser.avatar.imageUrl} 
                      alt={profileUser.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profileUser.username.charAt(0).toUpperCase()
                  )}
                  {isOwnProfile && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Online Status */}
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${
                  profileUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {profileUser.username}
                  </h1>
                  <RoleIcon className={`w-6 h-6 ${getRoleColor(profileUser.role)}`} />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profileUser.role === 'admin' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {profileUser.role === 'admin' ? 'Admin' : 'Warrior'}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4" />
                    <span>Level {profileUser.level}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{profileUser.xp} XP</span>
                  </div>
                  {profileUser.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {format(new Date(profileUser.createdAt), 'MMM yyyy')}</span>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress to Level {profileUser.level + 1}</span>
                    <span>{profileUser.xp} / {getNextLevelXP(profileUser.level)} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  {isEditing && isOwnProfile ? (
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                      rows={3}
                      placeholder="Tell other warriors about yourself..."
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      {profileUser.bio || 'This warrior hasn\'t shared their story yet.'}
                    </p>
                  )}
                </div>

                {/* Location */}
                {isEditing && isOwnProfile && (
                  <div className="mb-6">
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder="Your location (optional)"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {isOwnProfile ? (
                    <>
                      {isEditing ? (
                        <>
                          <AnimatedButton
                            variant="primary"
                            icon={Save}
                            onClick={handleSaveProfile}
                          >
                            Save Changes
                          </AnimatedButton>
                          <AnimatedButton
                            variant="ghost"
                            icon={X}
                            onClick={() => {
                              setIsEditing(false);
                              setEditForm({
                                bio: profileUser.bio || '',
                                location: profileUser.location || ''
                              });
                            }}
                          >
                            Cancel
                          </AnimatedButton>
                        </>
                      ) : (
                        <AnimatedButton
                          variant="secondary"
                          icon={Edit}
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </AnimatedButton>
                      )}
                    </>
                  ) : (
                    <>
                      <FriendSystem targetUser={profileUser} />
                      <AnimatedButton
                        variant="secondary"
                        icon={MessageCircle}
                      >
                        Message
                      </AnimatedButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats & Achievements */}
          <div className="space-y-6">
            {/* Stats */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Warrior Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Messages</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {profileUser.stats.messagesCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">Songs Uploaded</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {profileUser.stats.songsUploaded}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Puzzles Solved</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {profileUser.stats.puzzlesSolved}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-600 dark:text-gray-400">Events Attended</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {profileUser.stats.eventsAttended}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-pink-500" />
                    <span className="text-gray-600 dark:text-gray-400">Achievements</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {profileUser.achievements.length}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Achievements */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Achievements ({profileUser.achievements.length})
              </h3>
              <ScrollableContainer maxHeight="300px">
                <div className="space-y-3">
                  {profileUser.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg"
                    >
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-800 dark:text-white font-medium">
                        {achievement}
                      </span>
                    </motion.div>
                  ))}
                  {profileUser.achievements.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No achievements yet
                    </p>
                  )}
                </div>
              </ScrollableContainer>
            </GlassCard>
          </div>

          {/* Activity & Friends */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Recent Activity
              </h3>
              <ScrollableContainer maxHeight="400px">
                <div className="space-y-3">
                  {profileUser.activityLog.slice(0, 20).map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 dark:text-white">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {activity.xpGained && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                              +{activity.xpGained} XP
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {profileUser.activityLog.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No activity recorded yet
                    </p>
                  )}
                </div>
              </ScrollableContainer>
            </GlassCard>

            {/* Friend System */}
            {!isOwnProfile && currentUser && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Connect with {profileUser.username}
                </h3>
                <FriendSystem targetUser={profileUser} />
              </GlassCard>
            )}

            {/* Full Friend System for Own Profile */}
            {isOwnProfile && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Your Friend Network
                </h3>
                <FriendSystem showFullInterface={true} />
              </GlassCard>
            )}
          </div>
        </div>

        {/* Avatar Creator Modal */}
        {isAvatarCreatorOpen && (
          <AvatarCreator
            currentAvatar={profileUser.avatar}
            onSave={handleSaveAvatar}
            onClose={() => setIsAvatarCreatorOpen(false)}
          />
        )}
      </div>
    </div>
  );
};