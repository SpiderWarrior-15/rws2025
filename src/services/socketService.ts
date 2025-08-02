import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    // For now, we'll simulate real-time with localStorage events
    // In production, replace with actual Socket.IO server
    this.isConnected = true;
    this.setupLocalStorageSync();
  }

  private setupLocalStorageSync() {
    // Listen for localStorage changes to simulate real-time updates
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('rws-realtime-')) {
        const eventType = e.key.replace('rws-realtime-', '');
        const data = e.newValue ? JSON.parse(e.newValue) : null;
        this.emit(eventType as keyof SocketEvents, data);
      }
    });
  }

  public emit<K extends keyof SocketEvents>(event: K, data: SocketEvents[K]) {
    // Simulate real-time by storing in localStorage
    localStorage.setItem(`rws-realtime-${event}`, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
    
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent(`rws-${event}`, { detail: data }));
  }

  public on<K extends keyof SocketEvents>(event: K, callback: (data: SocketEvents[K]) => void) {
    const handler = (e: CustomEvent) => callback(e.detail);
    window.addEventListener(`rws-${event}` as string, handler as EventListener);
    
    return () => {
      window.removeEventListener(`rws-${event}` as string, handler as EventListener);
    };
  }

  public disconnect() {
    this.isConnected = false;
    this.socket?.disconnect();
  }

  public getConnectionStatus() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();