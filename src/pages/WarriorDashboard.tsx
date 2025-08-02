import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MessageCircle, 
  FileText, 
  Calendar, 
  Music, 
  Brain, 
  Trophy, 
  Star,
  Activity,
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle,
  Upload,
  Users
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { fileService } from '../services/fileService';
import { FormSubmission, Event, SongUpload, PuzzleAttempt, Message } from '../types';
import { format } from 'date-fns';

export const WarriorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [songs, setSongs] = useState<SongUpload[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        const [allSubmissions, allEvents, allSongs, allMessages] = await Promise.all([
          fileService.getFormSubmissions(),
          fileService.getEvents(),
          fileService.getSongUploads(),
          fileService.getMessages()
        ]);

        setSubmissions(allSubmissions.filter(s => s.userId === user.id));
        setEvents(allEvents.filter(e => e.participants.includes(user.id)));
        setSongs(allSongs.filter(s => s.uploadedBy === user.id));
        setMessages(allMessages.filter(m => m.senderId === user.id));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view your warrior dashboard
          </p>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Messages Sent', 
      value: user.stats.messagesCount, 
      icon: MessageCircle, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20'
    },
    { 
      label: 'Forms Submitted', 
      value: user.stats.formsSubmitted, 
      icon: FileText, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/20'
    },
    { 
      label: 'Events Attended', 
      value: user.stats.eventsAttended, 
      icon: Calendar, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20'
    },
    { 
      label: 'Songs Uploaded', 
      value: user.stats.songsUploaded, 
      icon: Music, 
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/20'
    },
    { 
      label: 'Puzzles Solved', 
      value: user.stats.puzzlesSolved, 
      icon: Brain, 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20'
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 mb-8 shadow-lg shadow-purple-500/10">
            <Trophy className="w-6 h-6 text-purple-400 mr-3 animate-pulse" />
            <span className="text-lg font-semibold text-purple-400">Warrior Command Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
            Welcome, {user.username}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Your personal command center for all warrior activities and achievements
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.bgColor} rounded-xl mb-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Submissions */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-500" />
              Recent Form Submissions
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {submissions.slice(-5).reverse().map(submission => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      Form Submission
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
              {submissions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No form submissions yet
                </div>
              )}
            </div>
          </GlassCard>

          {/* Uploaded Songs */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <Music className="w-5 h-5 mr-2 text-pink-500" />
              Your Song Uploads
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {songs.slice(-5).reverse().map(song => (
                <div key={song.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {song.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      by {song.artist}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    song.isApproved 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {song.isApproved ? 'Approved' : 'Pending'}
                  </div>
                </div>
              ))}
              {songs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No songs uploaded yet
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedButton
              variant="primary"
              className="h-24 flex-col space-y-2 bg-gradient-to-r from-blue-600 to-purple-600"
              onClick={() => window.location.href = '/chat'}
            >
              <MessageCircle className="w-6 h-6" />
              <span>Join Chat</span>
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              className="h-24 flex-col space-y-2 bg-gradient-to-r from-green-600 to-blue-600"
              onClick={() => window.location.href = '/forms'}
            >
              <FileText className="w-6 h-6" />
              <span>Fill Forms</span>
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              className="h-24 flex-col space-y-2 bg-gradient-to-r from-purple-600 to-pink-600"
              onClick={() => window.location.href = '/events'}
            >
              <Calendar className="w-6 h-6" />
              <span>View Events</span>
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              className="h-24 flex-col space-y-2 bg-gradient-to-r from-pink-600 to-red-600"
              onClick={() => window.location.href = '/music-hub'}
            >
              <Music className="w-6 h-6" />
              <span>Music Hub</span>
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
};