import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Music, Calendar, MessageCircle, X, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import { UserAccount, Song, Event, ChatMessage } from '../types';
import { GlassCard } from './GlassCard';

interface SearchResult {
  id: string;
  type: 'user' | 'song' | 'event' | 'message';
  title: string;
  subtitle?: string;
  path?: string;
}

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [accounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [songs] = useLocalStorage<Song[]>('rws-songs', []);
  const [events] = useLocalStorage<Event[]>('rws-events', []);
  const [messages] = useLocalStorage<ChatMessage[]>('rws-chat-messages', []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search users
    accounts
      .filter(account => account.status === 'approved')
      .forEach(account => {
        if (account.name.toLowerCase().includes(lowerQuery) || 
            account.email.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            id: account.id,
            type: 'user',
            title: account.name,
            subtitle: account.role,
            path: '/profile'
          });
        }
      });

    // Search songs
    songs.forEach(song => {
      if (song.title.toLowerCase().includes(lowerQuery) || 
          song.artist.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: song.id,
          type: 'song',
          title: song.title,
          subtitle: `by ${song.artist}`,
          path: '/warriors-picks'
        });
      }
    });

    // Search events
    events.forEach(event => {
      if (event.title.toLowerCase().includes(lowerQuery) || 
          event.description.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: event.id,
          type: 'event',
          title: event.title,
          subtitle: event.date,
          path: '/events'
        });
      }
    });

    setResults(searchResults.slice(0, 8));
  }, [query, accounts, songs, events, messages]);

  const handleResultClick = (result: SearchResult) => {
    if (result.path) {
      navigate(result.path);
    }
    setIsExpanded(false);
    setQuery('');
    setResults([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return User;
      case 'song': return Music;
      case 'event': return Calendar;
      case 'message': return MessageCircle;
      default: return Search;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setQuery('');
      setResults([]);
    }
  };

  const handleSearchClick = () => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  };

  return (
    <div ref={searchRef} className="relative">
      <motion.div 
        className="relative overflow-hidden"
        animate={{ 
          width: isExpanded ? 320 : 48,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.4
        }}
      >
        <motion.div
          className="relative h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-500/30 rounded-full overflow-hidden group cursor-pointer"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 0 30px rgba(147, 51, 234, 0.4)"
          }}
          onClick={!isExpanded ? handleSearchClick : undefined}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-purple-600/30"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Enhanced Search icon with glow effect */}
          <motion.div
            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
            animate={{
              rotate: isExpanded ? 360 : 0,
              scale: isExpanded ? 1.1 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <Search className="w-5 h-5 text-purple-300" />
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 w-5 h-5"
                animate={{
                  boxShadow: isExpanded 
                    ? "0 0 20px rgba(147, 51, 234, 0.8), 0 0 40px rgba(147, 51, 234, 0.4)"
                    : "0 0 10px rgba(147, 51, 234, 0.4)"
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Input field */}
          <AnimatePresence>
            {isExpanded && (
              <motion.input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full pl-12 pr-12 bg-transparent text-white placeholder-purple-300 focus:outline-none text-sm font-medium selectable"
                placeholder="Search warriors, music, events..."
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
              />
            )}
          </AnimatePresence>

          {/* Close button */}
          <AnimatePresence>
            {isExpanded && query && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery('');
                  setResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors z-10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Enhanced pulsing border animation */}
          <motion.div
            className="absolute inset-0 border-2 border-purple-400/50 rounded-full"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5],
              borderColor: [
                "rgba(147, 51, 234, 0.5)",
                "rgba(59, 130, 246, 0.8)",
                "rgba(147, 51, 234, 0.5)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Sparkle effects */}
          <AnimatePresence>
            {isExpanded && (
              <>
                <motion.div
                  className="absolute top-1 right-8 w-1 h-1 bg-yellow-400 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                />
                <motion.div
                  className="absolute bottom-2 left-8 w-1 h-1 bg-cyan-400 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: -360
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {isExpanded && (query.length >= 2 || results.length > 0) && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-3 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="p-2 max-h-96 overflow-y-auto border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
              {results.length === 0 && query.length >= 2 ? (
                <motion.div 
                  className="p-6 text-center text-purple-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="relative mb-4">
                    <Search className="w-8 h-8 mx-auto opacity-50" />
                    <motion.div
                      className="absolute inset-0 w-8 h-8 mx-auto"
                      animate={{
                        rotate: 360
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Sparkles className="w-8 h-8 opacity-30" />
                    </motion.div>
                  </div>
                  <p>No results found for "{query}"</p>
                  <p className="text-xs mt-2 opacity-75">Try searching for warriors, music, or events</p>
                </motion.div>
              ) : (
                <div className="space-y-1">
                  {results.map((result, index) => {
                    const Icon = getIcon(result.type);
                    return (
                      <motion.button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-300 text-left group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <motion.div
                          className="p-2 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 relative"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          {/* Icon glow effect */}
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            whileHover={{
                              boxShadow: "0 0 20px rgba(147, 51, 234, 0.6)"
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate group-hover:text-purple-200 transition-colors">
                            {result.title}
                          </div>
                          {result.subtitle && (
                            <div className="text-xs text-purple-300 truncate">
                              {result.subtitle}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-purple-400 capitalize opacity-75 group-hover:opacity-100 transition-opacity">
                            {result.type}
                          </div>
                          <motion.div
                            className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100"
                            whileHover={{ scale: 2 }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};