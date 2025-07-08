import React, { useState, useEffect } from 'react';
import { Play, Plus, Edit, Trash2, Music, Volume2, VolumeX } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useSounds } from '../hooks/useSounds';
import { Song } from '../types';
import { initialSongs } from '../utils/initialData';

export const WarriorsPicks: React.FC = () => {
  const { user } = useAuth();
  const { playSound } = useSounds();
  const [songs, setSongs] = useLocalStorage<Song[]>('rws-songs', initialSongs);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [newSong, setNewSong] = useState({ title: '', artist: '', embedUrl: '' });
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const isAdmin = user?.accountType === 'admin';

  // Load Alan Walker songs from JSON and merge with local songs once
  useEffect(() => {
    const loadAlanWalkerSongs = async () => {
      try {
        const response = await fetch('/alan-walker-songs.json');
        if (!response.ok) throw new Error('Failed to fetch Alan Walker songs');
        const alanWalkerSongs: Song[] = await response.json();
        // Filter only new songs that aren't already in local storage
        const newSongs = alanWalkerSongs.filter(
          (newSong) => !songs.some((s) => s.id === newSong.id)
        );
        if (newSongs.length > 0) {
          setSongs([...songs, ...newSongs]);
        }
      } catch (error) {
        console.error('Error loading Alan Walker songs:', error);
      }
    };
    loadAlanWalkerSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSong = () => {
    if (newSong.title && newSong.artist && newSong.embedUrl) {
      const song: Song = {
        id: Date.now().toString(),
        ...newSong
      };
      setSongs([...songs, song]);
      setNewSong({ title: '', artist: '', embedUrl: '' });
      setIsAddingNew(false);
      playSound('success');
    }
  };

  const handleEditSong = (song: Song) => {
    if (editingSong?.id === song.id) {
      const updatedSongs = songs.map(s =>
        s.id === song.id ? { ...song, ...newSong } : s
      );
      setSongs(updatedSongs);
      setEditingSong(null);
      setNewSong({ title: '', artist: '', embedUrl: '' });
      playSound('success');
    } else {
      setEditingSong(song);
      setNewSong({ title: song.title, artist: song.artist, embedUrl: song.embedUrl });
    }
  };

  const handleDeleteSong = (id: string) => {
    setSongs(songs.filter(song => song.id !== id));
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    }
    playSound('error');
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1` : url;
  };

  const getThumbnailUrl = (url: string) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  const handlePlaySong = (songId: string) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(songId);
      playSound('success');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <Music className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Curated by Warriors</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Warriors' Picks
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover our favorite tracks that fuel creativity and inspire greatness
          </p>
        </div>

        {/* Add New Song Button - Admin Only */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <AnimatedButton
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddingNew(true)}
              soundType="click"
            >
              Add New Song
            </AnimatedButton>
          </div>
        )}

        {/* Add/Edit Song Form - Admin Only */}
        {isAdmin && (isAddingNew || editingSong) && (
          <GlassCard className="p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {editingSong ? 'Edit Song' : 'Add New Song'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Song Title
                </label>
                <input
                  type="text"
                  value={newSong.title}
                  onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="Enter song title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  value={newSong.artist}
                  onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="Enter artist name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={newSong.embedUrl}
                  onChange={(e) => setNewSong({ ...newSong, embedUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="flex space-x-4">
                <AnimatedButton
                  variant="primary"
                  onClick={editingSong ? () => handleEditSong(editingSong) : handleAddSong}
                  soundType="success"
                >
                  {editingSong ? 'Update Song' : 'Add Song'}
                </AnimatedButton>
                <AnimatedButton
                  variant="ghost"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingSong(null);
                    setNewSong({ title: '', artist: '', embedUrl: '' });
                  }}
                  soundType="click"
                >
                  Cancel
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Songs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {songs.map((song) => (
            <GlassCard key={song.id} className="overflow-hidden group">
              <div className="relative aspect-video">
                {currentlyPlaying === song.id ? (
                  <iframe
                    src={getEmbedUrl(song.embedUrl)}
                    title={song.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                    <img
                      src={getThumbnailUrl(song.embedUrl)}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <button
                        onClick={() => handlePlaySong(song.id)}
                        className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 group"
                      >
                        <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {song.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      by {song.artist}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handlePlaySong(song.id)}
                    className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors duration-300"
                  >
                    {currentlyPlaying === song.id ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {/* Admin Controls */}
                {isAdmin && (
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditSong(song)}
                      soundType="click"
                    >
                      Edit
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteSong(song.id)}
                      className="text-red-500 hover:text-red-600"
                      soundType="error"
                    >
                      Delete
                    </AnimatedButton>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {songs.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              No songs yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {isAdmin ? 'Add your first song to get started!' : 'Songs will appear here when added by commanders.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
