import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause, Volume2, Heart, Share2, Clock, User, CheckCircle, XCircle, AlertCircle, Upload, Crown, Star, Zap } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { fileService } from '../services/fileService';
import { socketService } from '../services/socketService';
import { AlanWalkerTrack, ApprovalRequest, WalkerLore } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AlanWalkers: React.FC = () => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<AlanWalkerTrack[]>([]);
  const [lore, setLore] = useState<WalkerLore[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'music' | 'lore' | 'upload'>('music');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artist: 'Alan Walker',
    album: '',
    youtubeUrl: '',
    spotifyUrl: '',
    category: 'official' as const,
    tags: '',
    lore: '',
    trivia: ''
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadTracks();
    loadLore();
    initializeOfficialTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const allTracks = await fileService.readFile<AlanWalkerTrack>('alan_tracks.json', []);
      setTracks(allTracks);
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  };

  const loadLore = async () => {
    try {
      const allLore = await fileService.readFile<WalkerLore>('walker_lore.json', []);
      setLore(allLore);
    } catch (error) {
      console.error('Error loading lore:', error);
    }
  };

  const initializeOfficialTracks = async () => {
    try {
      const existingTracks = await fileService.readFile<AlanWalkerTrack>('alan_tracks.json', []);
      
      if (existingTracks.length === 0) {
        const officialTracks: AlanWalkerTrack[] = [
          {
            id: uuidv4(),
            title: 'Faded',
            artist: 'Alan Walker',
            album: 'Different World',
            releaseDate: '2015-12-03',
            duration: '3:32',
            youtubeUrl: 'https://www.youtube.com/watch?v=60ItHLz5WEA',
            category: 'official',
            isVerified: true,
            uploadedBy: 'system',
            uploadedAt: new Date().toISOString(),
            approvedBy: 'system',
            approvedAt: new Date().toISOString(),
            tags: ['electronic', 'dance', 'vocal', 'emotional'],
            lore: 'The breakthrough hit that launched Alan Walker into global stardom. The song explores themes of isolation and finding one\'s way back home.',
            trivia: [
              'First song to reach 1 billion views on YouTube by a Norwegian artist',
              'Features vocals by Iselin Solheim',
              'The music video was filmed in multiple locations across Europe'
            ]
          },
          {
            id: uuidv4(),
            title: 'Alone',
            artist: 'Alan Walker',
            album: 'Different World',
            releaseDate: '2016-12-02',
            duration: '2:43',
            youtubeUrl: 'https://www.youtube.com/watch?v=1-xGerv5FOk',
            category: 'official',
            isVerified: true,
            uploadedBy: 'system',
            uploadedAt: new Date().toISOString(),
            approvedBy: 'system',
            approvedAt: new Date().toISOString(),
            tags: ['electronic', 'instrumental', 'energetic'],
            lore: 'A powerful instrumental track that showcases Alan Walker\'s signature sound without vocals.',
            trivia: [
              'Originally created as a gaming soundtrack',
              'Features the iconic Alan Walker melody progression',
              'Popular choice for workout playlists'
            ]
          },
          {
            id: uuidv4(),
            title: 'Sing Me to Sleep',
            artist: 'Alan Walker',
            album: 'Different World',
            releaseDate: '2016-06-03',
            duration: '3:07',
            youtubeUrl: 'https://www.youtube.com/watch?v=2i2khp_npdE',
            category: 'official',
            isVerified: true,
            uploadedBy: 'system',
            uploadedAt: new Date().toISOString(),
            approvedBy: 'system',
            approvedAt: new Date().toISOString(),
            tags: ['electronic', 'vocal', 'emotional', 'dreamy'],
            lore: 'A haunting melody about finding peace and escape through music and dreams.',
            trivia: [
              'Features vocals by Iselin Solheim',
              'The music video has a dreamlike, surreal quality',
              'Often used in meditation and sleep playlists'
            ]
          },
          {
            id: uuidv4(),
            title: 'Darkside',
            artist: 'Alan Walker feat. Au/Ra and Tomine Harket',
            album: 'Different World',
            releaseDate: '2018-07-27',
            duration: '3:14',
            youtubeUrl: 'https://www.youtube.com/watch?v=M-P4QBt-FWw',
            category: 'official',
            isVerified: true,
            uploadedBy: 'system',
            uploadedAt: new Date().toISOString(),
            approvedBy: 'system',
            approvedAt: new Date().toISOString(),
            tags: ['electronic', 'collaboration', 'dark', 'powerful'],
            lore: 'A collaboration exploring the darker aspects of human nature and the struggle between light and shadow.',
            trivia: [
              'Features Au/Ra and Tomine Harket',
              'Part of the Different World album',
              'The music video features stunning visual effects'
            ]
          },
          {
            id: uuidv4(),
            title: 'On My Way',
            artist: 'Alan Walker, Sabrina Carpenter & Farruko',
            album: 'Different World',
            releaseDate: '2019-03-21',
            duration: '3:14',
            youtubeUrl: 'https://www.youtube.com/watch?v=dhYOPzcsbGM',
            category: 'official',
            isVerified: true,
            uploadedBy: 'system',
            uploadedAt: new Date().toISOString(),
            approvedBy: 'system',
            approvedAt: new Date().toISOString(),
            tags: ['electronic', 'pop', 'collaboration', 'uplifting'],
            lore: 'An uplifting anthem about perseverance and moving forward despite challenges.',
            trivia: [
              'Created for the PUBG Mobile soundtrack',
              'Features Sabrina Carpenter and Farruko',
              'Became a global gaming anthem'
            ]
          }
        ];

        await fileService.writeFile('alan_tracks.json', officialTracks);
        setTracks(officialTracks);
      }
    } catch (error) {
      console.error('Error initializing official tracks:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !uploadForm.title) return;

    setIsUploading(true);
    try {
      const newTrack: AlanWalkerTrack = {
        id: uuidv4(),
        title: uploadForm.title.trim(),
        artist: uploadForm.artist.trim(),
        album: uploadForm.album.trim() || undefined,
        releaseDate: new Date().toISOString().split('T')[0],
        duration: '0:00',
        youtubeUrl: uploadForm.youtubeUrl.trim() || undefined,
        spotifyUrl: uploadForm.spotifyUrl.trim() || undefined,
        category: uploadForm.category,
        isVerified: user.role === 'admin',
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
        approvedBy: user.role === 'admin' ? user.id : undefined,
        approvedAt: user.role === 'admin' ? new Date().toISOString() : undefined,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        lore: uploadForm.lore.trim() || undefined,
        trivia: uploadForm.trivia ? uploadForm.trivia.split('\n').map(t => t.trim()).filter(Boolean) : undefined
      };

      await fileService.appendToFile('alan_tracks.json', newTrack);

      if (user.role !== 'admin') {
        // Create approval request
        const approvalRequest: ApprovalRequest = {
          id: uuidv4(),
          type: 'song',
          itemId: newTrack.id,
          requestedBy: user.id,
          requestedAt: new Date().toISOString(),
          status: 'pending'
        };

        await fileService.saveApprovalRequest(approvalRequest);
        socketService.emit('approval_requested', approvalRequest);
        toast.success('Track uploaded! Waiting for admin approval.');
      } else {
        toast.success('Track uploaded and approved!');
      }

      setUploadForm({
        title: '',
        artist: 'Alan Walker',
        album: '',
        youtubeUrl: '',
        spotifyUrl: '',
        category: 'official',
        tags: '',
        lore: '',
        trivia: ''
      });

      loadTracks();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload track');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproval = async (trackId: string, approved: boolean, rejectionReason?: string) => {
    if (!isAdmin) return;

    try {
      await fileService.updateInFile('alan_tracks.json', trackId, {
        isVerified: approved,
        approvedBy: user!.id,
        approvedAt: approved ? new Date().toISOString() : undefined
      });

      // Update approval request
      const approvals = await fileService.getApprovalRequests();
      const approval = approvals.find(a => a.itemId === trackId && a.type === 'song');
      if (approval) {
        await fileService.updateApprovalRequest(approval.id, {
          status: approved ? 'approved' : 'rejected',
          reviewedBy: user!.id,
          reviewedAt: new Date().toISOString(),
          rejectionReason
        });
      }

      toast.success(`Track ${approved ? 'approved' : 'rejected'} successfully`);
      loadTracks();
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

  const verifiedTracks = tracks.filter(track => track.isVerified);
  const pendingTracks = tracks.filter(track => !track.isVerified);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 mb-8 shadow-lg shadow-blue-500/10">
            <Music className="w-6 h-6 text-blue-400 mr-3 animate-pulse" />
            <span className="text-lg font-semibold text-blue-400">Alan Walker Universe</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
            Alan Walkers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Dive deep into the world of Alan Walker - official tracks, remixes, lore, and fan creations
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-lg">
            {[
              { id: 'music', name: 'Music Hub', icon: Music },
              { id: 'lore', name: 'Walker Lore', icon: Star },
              { id: 'upload', name: 'Upload Track', icon: Upload }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pending Approvals (Admin only) */}
        {isAdmin && pendingTracks.length > 0 && (
          <GlassCard className="p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
              Pending Track Approvals ({pendingTracks.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {pendingTracks.map(track => (
                <div key={track.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">{track.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {track.artist}</p>
                      <p className="text-xs text-gray-500">Category: {track.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs bg-${track.category === 'official' ? 'blue' : 'purple'}-500/20 text-${track.category === 'official' ? 'blue' : 'purple'}-400`}>
                      {track.category.toUpperCase()}
                    </span>
                  </div>
                  
                  {track.lore && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{track.lore}</p>
                  )}
                  
                  <div className="flex space-x-2">
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleApproval(track.id, true)}
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
                        handleApproval(track.id, false, reason || undefined);
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

        {/* Music Hub Tab */}
        {activeTab === 'music' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {verifiedTracks.map(track => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <GlassCard className="overflow-hidden">
                  {/* Track Thumbnail */}
                  {track.youtubeUrl && (
                    <div className="relative aspect-video">
                      <img
                        src={getThumbnailUrl(track.youtubeUrl)}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => setCurrentlyPlaying(currentlyPlaying === track.id ? null : track.id)}
                          className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                        >
                          {currentlyPlaying === track.id ? (
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
                          {track.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          by {track.artist}
                        </p>
                        {track.album && (
                          <p className="text-sm text-gray-500 mb-2">
                            Album: {track.album}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{track.duration}</span>
                          <span>•</span>
                          <span>{format(new Date(track.releaseDate), 'yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {track.category === 'official' && (
                          <Crown className="w-5 h-5 text-yellow-500" />
                        )}
                        {track.isVerified && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>

                    {track.lore && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
                        {track.lore}
                      </p>
                    )}

                    {track.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {track.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
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
                      
                      {track.youtubeUrl && (
                        <button
                          onClick={() => setCurrentlyPlaying(currentlyPlaying === track.id ? null : track.id)}
                          className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Trivia Section */}
                    {track.trivia && track.trivia.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2 flex items-center">
                          <Zap className="w-4 h-4 mr-1" />
                          Walker Trivia
                        </h4>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {track.trivia.slice(0, 2).map((fact, index) => (
                            <li key={index}>• {fact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && user && (
          <div className="max-w-2xl mx-auto">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-purple-500" />
                Upload Alan Walker Track
              </h2>
              
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Track Title
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder="Enter track title"
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
                      placeholder="Artist name"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={uploadForm.youtubeUrl}
                      onChange={(e) => setUploadForm({ ...uploadForm, youtubeUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    >
                      <option value="official">Official</option>
                      <option value="remix">Remix</option>
                      <option value="fan_creation">Fan Creation</option>
                      <option value="unreleased">Unreleased</option>
                    </select>
                  </div>
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
                    placeholder="electronic, dance, vocal, emotional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Walker Lore
                  </label>
                  <textarea
                    value={uploadForm.lore}
                    onChange={(e) => setUploadForm({ ...uploadForm, lore: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                    rows={3}
                    placeholder="Share the story behind this track..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trivia (one per line)
                  </label>
                  <textarea
                    value={uploadForm.trivia}
                    onChange={(e) => setUploadForm({ ...uploadForm, trivia: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                    rows={4}
                    placeholder="Interesting facts about this track..."
                  />
                </div>

                <AnimatedButton
                  type="submit"
                  variant="primary"
                  icon={Upload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? 'Uploading...' : 'Upload Track'}
                </AnimatedButton>
              </form>
            </GlassCard>
          </div>
        )}

        {/* Lore Tab */}
        {activeTab === 'lore' && (
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                Walker Lore Archive
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center py-12">
                The Walker Lore Archive is being compiled by our warriors. Check back soon for deep insights into Alan Walker's musical journey, production secrets, and hidden meanings behind the tracks.
              </p>
            </GlassCard>
          </div>
        )}

        {verifiedTracks.length === 0 && activeTab === 'music' && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              No tracks available
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Upload your first Alan Walker track to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};