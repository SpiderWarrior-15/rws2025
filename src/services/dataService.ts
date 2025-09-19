import { User, CustomForm, FormSubmission, Event, Puzzle, Notification, FriendRequest, Friendship, Message, ActivityEntry, AlanWalkerTrack } from '../types';

class DataService {
  private getStorageKey(key: string): string {
    return `rws-${key}`;
  }

  // Generic storage operations
  private async readFromStorage<T>(key: string, defaultValue: T[] = []): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.getStorageKey(key));
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  private async writeToStorage<T>(key: string, data: T[]): Promise<void> {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
    }
  }

  // User Management
  async getUsers(): Promise<User[]> {
    return this.readFromStorage<User>('users', []);
  }

  async saveUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    await this.writeToStorage('users', users);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updates };
      await this.writeToStorage('users', users);
    }
  }

  async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    await this.writeToStorage('users', filtered);
  }

  // Friend System
  async getFriendRequests(): Promise<FriendRequest[]> {
    return this.readFromStorage<FriendRequest>('friend-requests', []);
  }

  async saveFriendRequest(request: FriendRequest): Promise<void> {
    const requests = await this.getFriendRequests();
    requests.push(request);
    await this.writeToStorage('friend-requests', requests);
  }

  async updateFriendRequest(id: string, updates: Partial<FriendRequest>): Promise<void> {
    const requests = await this.getFriendRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index >= 0) {
      requests[index] = { ...requests[index], ...updates };
      await this.writeToStorage('friend-requests', requests);
    }
  }

  async getFriendRequestById(id: string): Promise<FriendRequest | undefined> {
    const requests = await this.getFriendRequests();
    return requests.find(r => r.id === id);
  }

  async getFriendships(): Promise<Friendship[]> {
    return this.readFromStorage<Friendship>('friendships', []);
  }

  async saveFriendship(friendship: Friendship): Promise<void> {
    const friendships = await this.getFriendships();
    friendships.push(friendship);
    await this.writeToStorage('friendships', friendships);
  }

  async deleteFriendship(id: string): Promise<void> {
    const friendships = await this.getFriendships();
    const filtered = friendships.filter(f => f.id !== id);
    await this.writeToStorage('friendships', filtered);
  }

  // Forms Management
  async getForms(): Promise<CustomForm[]> {
    return this.readFromStorage<CustomForm>('forms', []);
  }

  async saveForm(form: CustomForm): Promise<void> {
    const forms = await this.getForms();
    const existingIndex = forms.findIndex(f => f.id === form.id);
    if (existingIndex >= 0) {
      forms[existingIndex] = form;
    } else {
      forms.push(form);
    }
    await this.writeToStorage('forms', forms);
  }

  async deleteForm(id: string): Promise<void> {
    const forms = await this.getForms();
    const filtered = forms.filter(f => f.id !== id);
    await this.writeToStorage('forms', filtered);
  }

  async getFormSubmissions(): Promise<FormSubmission[]> {
    return this.readFromStorage<FormSubmission>('form-submissions', []);
  }

  async saveFormSubmission(submission: FormSubmission): Promise<void> {
    const submissions = await this.getFormSubmissions();
    submissions.push(submission);
    await this.writeToStorage('form-submissions', submissions);
  }

  // Music Hub Management
  async getTracks(): Promise<AlanWalkerTrack[]> {
    return this.readFromStorage<AlanWalkerTrack>('alan-tracks', []);
  }

  async saveTrack(track: AlanWalkerTrack): Promise<void> {
    const tracks = await this.getTracks();
    const existingIndex = tracks.findIndex(t => t.id === track.id);
    if (existingIndex >= 0) {
      tracks[existingIndex] = track;
    } else {
      tracks.push(track);
    }
    await this.writeToStorage('alan-tracks', tracks);
  }

  async deleteTrack(id: string): Promise<void> {
    const tracks = await this.getTracks();
    const filtered = tracks.filter(t => t.id !== id);
    await this.writeToStorage('alan-tracks', filtered);
  }

  // Events Management
  async getEvents(): Promise<Event[]> {
    return this.readFromStorage<Event>('events', []);
  }

  async saveEvent(event: Event): Promise<void> {
    const events = await this.getEvents();
    const existingIndex = events.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }
    await this.writeToStorage('events', events);
  }

  async deleteEvent(id: string): Promise<void> {
    const events = await this.getEvents();
    const filtered = events.filter(e => e.id !== id);
    await this.writeToStorage('events', filtered);
  }

  // Messages Management
  async getMessages(): Promise<Message[]> {
    return this.readFromStorage<Message>('messages', []);
  }

  async saveMessage(message: Message): Promise<void> {
    const messages = await this.getMessages();
    messages.push(message);
    await this.writeToStorage('messages', messages);
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return this.readFromStorage<Notification>('notifications', []);
  }

  async saveNotification(notification: Notification): Promise<void> {
    const notifications = await this.getNotifications();
    notifications.push(notification);
    await this.writeToStorage('notifications', notifications);
  }

  // Activity Entries
  async addActivityEntry(userId: string, activity: Omit<ActivityEntry, 'id' | 'timestamp'>): Promise<void> {
    const users = await this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const activityEntry: ActivityEntry = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    if (!user.activityLog) user.activityLog = [];
    user.activityLog.unshift(activityEntry);
    
    // Keep only last 100 activities
    if (user.activityLog.length > 100) {
      user.activityLog = user.activityLog.slice(0, 100);
    }

    await this.saveUser(user);
  }

  // Utility methods
  async exportToCSV(data: any[], filename: string): Promise<void> {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Search functionality
  async searchUsers(query: string): Promise<User[]> {
    const users = await this.getUsers();
    const lowerQuery = query.toLowerCase();
    return users.filter(user =>
      user.username.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.bio?.toLowerCase().includes(lowerQuery)
    );
  }

  // Analytics
  async getAnalytics() {
    const [users, forms, submissions, events, tracks] = await Promise.all([
      this.getUsers(),
      this.getForms(),
      this.getFormSubmissions(),
      this.getEvents(),
      this.getTracks()
    ]);

    const activeUsers = users.filter(user => {
      const lastActive = new Date(user.lastActive);
      const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 7;
    }).length;

    return {
      totalUsers: users.length,
      activeUsers,
      totalForms: forms.length,
      totalSubmissions: submissions.length,
      totalEvents: events.length,
      totalTracks: tracks.length,
      adminUsers: users.filter(u => u.role === 'admin').length
    };
  }
}

export const dataService = new DataService();