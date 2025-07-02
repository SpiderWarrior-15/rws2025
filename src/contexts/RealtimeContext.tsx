import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface RealtimeContextType {
  isConnected: boolean;
  lastUpdate: Date | null;
  broadcastUpdate: (type: string, data: any) => void;
  subscribe: (callback: (type: string, data: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [subscribers, setSubscribers] = useState<((type: string, data: any) => void)[]>([]);

  const broadcastUpdate = (type: string, data: any) => {
    setLastUpdate(new Date());
    subscribers.forEach(callback => callback(type, data));
    
    // Store update in localStorage for cross-tab sync
    const update = { type, data, timestamp: Date.now() };
    localStorage.setItem('rws-realtime-update', JSON.stringify(update));
  };

  const subscribe = (callback: (type: string, data: any) => void) => {
    setSubscribers(prev => [...prev, callback]);
    return () => setSubscribers(prev => prev.filter(cb => cb !== callback));
  };

  // Listen for cross-tab updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rws-realtime-update' && e.newValue) {
        const update = JSON.parse(e.newValue);
        subscribers.forEach(callback => callback(update.type, update.data));
        setLastUpdate(new Date(update.timestamp));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [subscribers]);

  return (
    <RealtimeContext.Provider value={{ isConnected, lastUpdate, broadcastUpdate, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
};