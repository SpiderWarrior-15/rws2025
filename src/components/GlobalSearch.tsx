import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Music, Calendar, MessageCircle, X } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
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

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
  }, [query, accounts, songs, events, messages]);

  const handleResultClick = (result: SearchResult) => {
    if (result.path) {
      navigate(result.path);
    }
    setIsOpen(false);
    setQuery('');
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
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-64 pl-10 pr-10 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm placeholder-gray-500"
          placeholder="Search warriors, songs, events..."
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <GlassCard className="p-2 max-h-96 overflow-y-auto">
            {results.length === 0 && query.length >= 2 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result) => {
                  const Icon = getIcon(result.type);
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors duration-200 text-left"
                    >
                      <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {result.type}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};