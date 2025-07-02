import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Megaphone, Clock, User, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../contexts/RealtimeContext';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  author: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const Announcements: React.FC = () => {
  const { user } = useAuth();
  const { broadcastUpdate } = useRealtime();
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('rws-announcements', []);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    priority: 'medium' as const
  });

  const isAdmin = user?.accountType === 'admin';

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content || !user) return;

    const announcement: Announcement = {
      id: Date.now().toString(),
      ...newAnnouncement,
      author: user.username,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const updatedAnnouncements = [announcement, ...announcements];
    setAnnouncements(updatedAnnouncements);
    broadcastUpdate('announcement_added', announcement);
    
    setNewAnnouncement({ title: '', content: '', type: 'info', priority: 'medium' });
    setIsAddingNew(false);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    if (editingAnnouncement?.id === announcement.id) {
      const updatedAnnouncement = {
        ...announcement,
        ...newAnnouncement,
        updatedAt: new Date().toISOString()
      };
      
      const updatedAnnouncements = announcements.map(a => 
        a.id === announcement.id ? updatedAnnouncement : a
      );
      setAnnouncements(updatedAnnouncements);
      broadcastUpdate('announcement_updated', updatedAnnouncement);
      
      setEditingAnnouncement(null);
      setNewAnnouncement({ title: '', content: '', type: 'info', priority: 'medium' });
    } else {
      setEditingAnnouncement(announcement);
      setNewAnnouncement({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority
      });
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updatedAnnouncements = announcements.filter(announcement => announcement.id !== id);
    setAnnouncements(updatedAnnouncements);
    broadcastUpdate('announcement_deleted', { id });
  };

  const toggleAnnouncementStatus = (id: string) => {
    const updatedAnnouncements = announcements.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    setAnnouncements(updatedAnnouncements);
    broadcastUpdate('announcement_toggled', { id });
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'success': return CheckCircle;
      case 'urgent': return Megaphone;
      default: return Info;
    }
  };

  const getAnnouncementColors = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
      case 'success': return 'border-green-500/30 bg-green-500/10 text-green-400';
      case 'urgent': return 'border-red-500/30 bg-red-500/10 text-red-400';
      default: return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const sortedAnnouncements = announcements
    .filter(a => a.isActive)
    .sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-md border border-orange-500/30 mb-6">
            <Megaphone className="w-5 h-5 text-orange-400 mr-2" />
            <span className="text-sm font-medium text-orange-400">Important Updates</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Stay informed with the latest updates, events, and important information from the Royal Warriors Squad
          </p>
        </motion.div>

        {/* Add Announcement Button - Admin Only */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <AnimatedButton
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddingNew(true)}
            >
              Create Announcement
            </AnimatedButton>
          </motion.div>
        )}

        {/* Add/Edit Announcement Form */}
        {isAdmin && (isAddingNew || editingAnnouncement) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 dark:text-white"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newAnnouncement.type}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 dark:text-white"
                    >
                      <option value="info">Information</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 dark:text-white resize-none"
                    rows={6}
                    placeholder="Write your announcement content here..."
                  />
                </div>
                <div className="flex space-x-4">
                  <AnimatedButton
                    variant="primary"
                    onClick={editingAnnouncement ? () => handleEditAnnouncement(editingAnnouncement) : handleAddAnnouncement}
                  >
                    {editingAnnouncement ? 'Update Announcement' : 'Publish Announcement'}
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingAnnouncement(null);
                      setNewAnnouncement({ title: '', content: '', type: 'info', priority: 'medium' });
                    }}
                  >
                    Cancel
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Announcements List */}
        <div className="space-y-6">
          {sortedAnnouncements.map((announcement, index) => {
            const Icon = getAnnouncementIcon(announcement.type);
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <GlassCard className={`p-6 border-l-4 ${getAnnouncementColors(announcement.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-full ${getAnnouncementColors(announcement.type)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {announcement.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(announcement.priority)}`}>
                            {announcement.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                          {announcement.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{announcement.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(announcement.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                          {announcement.updatedAt && (
                            <span className="text-xs text-gray-400">
                              (Updated: {format(new Date(announcement.updatedAt), 'MMM dd, yyyy HH:mm')})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <AnimatedButton
                          variant="secondary"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEditAnnouncement(announcement)}
                        >
                          Edit
                        </AnimatedButton>
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </AnimatedButton>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {sortedAnnouncements.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              No announcements
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {isAdmin ? 'Create your first announcement to keep warriors informed!' : 'No announcements have been posted yet.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};