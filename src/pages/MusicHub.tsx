import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Upload, Play, Pause, Volume2, Heart, Share2, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { fileService } from '../services/fileService';
import { socketService } from '../services/socketService';
import { SongUpload, ApprovalRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const MusicHub: React.FC = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState<SongUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artist: '',
    youtubeUrl: '',
    description: '',
    category: 'other' as const,
    tags: ''
  });

  const isAdmin = user?.role === 'admin';
  const isCommander = user?.role === 'commander' || user?.role === 'admin';

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const allSongs = await fileService.getSongUploads();
      setSongs(allSongs);
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !uploadForm.title || !uploadForm.artist) return;

    setIsUploading(true);
    try {
      const newSong: SongUpload = {
        id: uuidv4(),
        title: uploadForm.title.trim(),
        artist: uploadForm.artist.trim(),
        uploadedBy: user.id,
        uploaderUsername: user.username,
        youtubeUrl: uploadForm.youtubeUrl.trim() || undefined,
        description: uploadForm.description.trim(),
        uploadedAt: new Date().toISOString(),
        isApproved: false,
        category: uploadForm.category,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      await fileService.saveSongUpload(newSong);

      // Create approval request
      const approvalRequest: ApprovalRequest = {
        id: uuidv4(),
        type: 'song',
        itemId: newSong.id,
        requestedBy: user.id,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };

      await fileService.saveApprovalRequest(approvalRequest);

      // Emit real-time event
      socketService.emit('approval_requested', approvalRequest);

      setUploadForm({
        title: '',
        artist: '',
        youtubeUrl: '',
        description: '',
        category: 'other',
        tags: ''
      });

      toast.success('Song uploaded! Waiting for commander approval.');
      loadSongs();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload song');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproval = async (songId: string, approved: boolean, rejectionReason?: string) => {
    if (!isCommander) return;

    try {
      await fileService.updateSongUpload(songId, {
        isApproved: approved,
        approvedBy: user!.id,
        approvedAt: approved ? new Date().toISOString() : undefined,
        rejectionReason: rejectionReason
      });

      // Update approval request
      const approvals = await fileService.getApprovalRequests();
      const approval = approvals.find(a => a.itemId === songId && a.type === 'song');
      if (approval) {
        await fileService.updateApprovalRequest(approval.id, {
          status: approved ? 'approved' : 'rejected',
          reviewedBy: user!.id,
          reviewedAt: new Date().toISOString(),
          rejectionReason
        });
      }

      toast.success(`Song ${approved ? 'approved' : 'rejected'} successfully`);
      loadSongs();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to process approval');
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (url: string) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  const approvedSongs = songs.filter(song => song.isApproved);
  const pendingSongs = songs.filter(song => !song.isApproved);
  const userSongs = songs.filter(song => song.uploadedBy === user?.id);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 backdrop-blur-xl border border-pink-500/30 mb-8 shadow-lg shadow-pink-500/10">
            <Music className="w-6 h-6 text-pink-400 mr-3 animate-pulse" />
            <span className="text-lg font-semibold text-pink-400">Alan Warriors Music Hub</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
            Music Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Share your favorite Alan Walker tracks and original creations with fellow warriors
          </p>
        </motion.div>

        {/* Upload Section */}
        <GlassCard className="p-8 mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Upload className="w-6 h-6 mr-2 text-purple-500" />
            Upload Song
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Song Title
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="Enter song title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  value={uploadForm.artist}
                  onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="Enter artist name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                YouTube URL (Optional)
              </label>
              <input
                type="url"
                value={uploadForm.youtubeUrl}
                onChange={(e) => setUploadForm({ ...uploadForm, youtubeUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                >
                  <option value="alan_walker">Alan Walker</option>
                  <option value="original">Original</option>
                  <option value="remix">Remix</option>
                  <option value="cover">Cover</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="electronic, dance, chill"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                rows={3}
                placeholder="Tell us about this song..."
              />
            </div>

            <AnimatedButton
              type="submit"
              variant="primary"
              icon={Upload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Song'}
            </AnimatedButton>
          </form>
        </GlassCard>

        {/* Pending Approvals (Commander/Admin only) */}
        {isCommander && pendingSongs.length > 0 && (
          <GlassCard className="p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
              Pending Song Approvals ({pendingSongs.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {pendingSongs.map(song => (
                <div key={song.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">{song.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {song.artist}</p>
                      <p className="text-xs text-gray-500">Uploaded by {song.uploaderUsername}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs bg-${song.category === 'alan_walker' ? 'blue' : 'purple'}-500/20 text-${song.category === 'alan_walker' ? 'blue' : 'purple'}-400`}>
                      {song.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {song.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{song.description}</p>
                  )}
                  
                  <div className="flex space-x-2">
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleApproval(song.id, true)}
                      className="flex-1 bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      Approve
                    </AnimatedButton>
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      icon={XCircle}
                      onClick={() => {
                        const reason = prompt('Rejection reason (optional):');
                        handleApproval(song.id, false, reason || undefined);
                      }}
                      className="flex-1 bg-red-500/20 text-red-400 border-red-500/30"
                    >
                      Reject
                    </AnimatedButton>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Approved Songs */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {approvedSongs.map(song => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <GlassCard className="overflow-hidden">
                {/* Song Thumbnail */}
                {song.youtubeUrl && (
                  <div className="relative aspect-video">
                    <img
                      src={getThumbnailUrl(song.youtubeUrl)}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setCurrentlyPlaying(currentlyPlaying === song.id ? null : song.id)}
                        className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                      >
                        {currentlyPlaying === song.id ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        {song.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        by {song.artist}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{song.uploaderUsername}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{format(new Date(song.uploadedAt), 'MMM dd')}</span>
                      </div>
                    </div>
                  </div>

                  {song.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {song.description}
                    </p>
                  )}

                  {song.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {song.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {song.youtubeUrl && (
                      <button
                        onClick={() => setCurrentlyPlaying(currentlyPlaying === song.id ? null : song.id)}
                        className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {approvedSongs.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              No approved songs yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Be the first to upload and share your favorite tracks!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};