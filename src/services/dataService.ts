import { User, CustomForm, Upload, Puzzle, Event, Notification, FriendRequest, Friendship, Message, ActivityEntry } from '../types';
import { fileService } from './fileService';

class DataService {
  private users: User[] = [];
  private forms: CustomForm[] = [];
  private uploads: Upload[] = [];
  private puzzles: Puzzle[] = [];
  private events: Event[] = [];
  private notifications: Notification[] = [];
  private friendRequests: FriendRequest[] = [];
  private friendships: Friendship[] = [];
  private messages: Message[] = [];

  constructor() {
    this.loadData();
  }

  private async loadData() {
    try {
      this.users = await fileService.loadUsers();
      this.forms = await fileService.loadForms();
      this.uploads = await fileService.loadUploads();
      this.puzzles = await fileService.loadPuzzles();
      this.events = await fileService.loadEvents();
      this.notifications = await fileService.loadNotifications();
      this.friendRequests = await fileService.loadFriendRequests();
      this.friendships = await fileService.loadFriendships();
      this.messages = await fileService.loadMessages();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private async saveData() {
    try {
      await fileService.saveUsers(this.users);
      await fileService.saveForms(this.forms);
      await fileService.saveUploads(this.uploads);
      await fileService.savePuzzles(this.puzzles);
      await fileService.saveEvents(this.events);
      await fileService.saveNotifications(this.notifications);
      await fileService.saveFriendRequests(this.friendRequests);
      await fileService.saveFriendships(this.friendships);
      await fileService.saveMessages(this.messages);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // User Management
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'activityLog'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      activityLog: []
    };

    this.users.push(newUser);
    await this.saveData();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    await this.saveData();
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    await this.saveData();
    return true;
  }

  async addUserActivity(userId: string, activity: Omit<ActivityEntry, 'id' | 'timestamp'>): Promise<void> {
    const user = this.getUserById(userId);
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

    await this.updateUser(userId, { activityLog: user.activityLog });
  }

  // Friend System
  getFriendRequests(): FriendRequest[] {
    return this.friendRequests;
  }

  getFriendRequestsForUser(userId: string): { incoming: FriendRequest[], outgoing: FriendRequest[] } {
    const incoming = this.friendRequests.filter(req => req.receiverId === userId && req.status === 'pending');
    const outgoing = this.friendRequests.filter(req => req.senderId === userId && req.status === 'pending');
    return { incoming, outgoing };
  }

  async sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest | null> {
    // Check if users exist
    const sender = this.getUserById(senderId);
    const receiver = this.getUserById(receiverId);
    if (!sender || !receiver) return null;

    // Check if already friends
    if (this.areFriends(senderId, receiverId)) return null;

    // Check if request already exists
    const existingRequest = this.friendRequests.find(req => 
      ((req.senderId === senderId && req.receiverId === receiverId) ||
       (req.senderId === receiverId && req.receiverId === senderId)) &&
      req.status === 'pending'
    );
    if (existingRequest) return null;

    const friendRequest: FriendRequest = {
      id: `friend_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      receiverId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.friendRequests.push(friendRequest);
    await this.saveData();

    // Add notification
    await this.addNotification(receiverId, {
      title: 'New Friend Request',
      message: `${sender.username} sent you a friend request`,
      type: 'friend_request',
      relatedId: friendRequest.id
    });

    return friendRequest;
  }

  async acceptFriendRequest(requestId: string): Promise<boolean> {
    const request = this.friendRequests.find(req => req.id === requestId);
    if (!request || request.status !== 'pending') return false;

    // Create friendship
    const friendship: Friendship = {
      id: `friendship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId1: request.senderId,
      userId2: request.receiverId,
      createdAt: new Date().toISOString()
    };

    this.friendships.push(friendship);

    // Remove friend request
    this.friendRequests = this.friendRequests.filter(req => req.id !== requestId);

    await this.saveData();

    // Add notifications
    const sender = this.getUserById(request.senderId);
    const receiver = this.getUserById(request.receiverId);
    
    if (sender && receiver) {
      await this.addNotification(request.senderId, {
        title: 'Friend Request Accepted',
        message: `${receiver.username} accepted your friend request`,
        type: 'friend_accepted',
        relatedId: friendship.id
      });
    }

    return true;
  }

  async rejectFriendRequest(requestId: string): Promise<boolean> {
    const requestIndex = this.friendRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return false;

    this.friendRequests.splice(requestIndex, 1);
    await this.saveData();
    return true;
  }

  async removeFriend(userId1: string, userId2: string): Promise<boolean> {
    const friendshipIndex = this.friendships.findIndex(friendship =>
      (friendship.userId1 === userId1 && friendship.userId2 === userId2) ||
      (friendship.userId1 === userId2 && friendship.userId2 === userId1)
    );

    if (friendshipIndex === -1) return false;

    this.friendships.splice(friendshipIndex, 1);
    await this.saveData();
    return true;
  }

  getFriends(userId: string): User[] {
    const userFriendships = this.friendships.filter(friendship =>
      friendship.userId1 === userId || friendship.userId2 === userId
    );

    const friendIds = userFriendships.map(friendship =>
      friendship.userId1 === userId ? friendship.userId2 : friendship.userId1
    );

    return this.users.filter(user => friendIds.includes(user.id));
  }

  areFriends(userId1: string, userId2: string): boolean {
    return this.friendships.some(friendship =>
      (friendship.userId1 === userId1 && friendship.userId2 === userId2) ||
      (friendship.userId1 === userId2 && friendship.userId2 === userId1)
    );
  }

  getFriendRequestStatus(currentUserId: string, targetUserId: string): 'none' | 'sent' | 'received' | 'friends' {
    if (this.areFriends(currentUserId, targetUserId)) return 'friends';

    const sentRequest = this.friendRequests.find(req =>
      req.senderId === currentUserId && req.receiverId === targetUserId && req.status === 'pending'
    );
    if (sentRequest) return 'sent';

    const receivedRequest = this.friendRequests.find(req =>
      req.senderId === targetUserId && req.receiverId === currentUserId && req.status === 'pending'
    );
    if (receivedRequest) return 'received';

    return 'none';
  }

  // Forms Management
  getForms(): CustomForm[] {
    return this.forms;
  }

  getFormById(id: string): CustomForm | undefined {
    return this.forms.find(form => form.id === id);
  }

  async createForm(formData: Omit<CustomForm, 'id' | 'createdAt'>): Promise<CustomForm> {
    const newForm: CustomForm = {
      ...formData,
      id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    this.forms.push(newForm);
    await this.saveData();
    return newForm;
  }

  async updateForm(id: string, updates: Partial<CustomForm>): Promise<CustomForm | null> {
    const formIndex = this.forms.findIndex(form => form.id === id);
    if (formIndex === -1) return null;

    this.forms[formIndex] = { ...this.forms[formIndex], ...updates };
    await this.saveData();
    return this.forms[formIndex];
  }

  async deleteForm(id: string): Promise<boolean> {
    const formIndex = this.forms.findIndex(form => form.id === id);
    if (formIndex === -1) return false;

    this.forms.splice(formIndex, 1);
    await this.saveData();
    return true;
  }

  // Uploads Management
  getUploads(): Upload[] {
    return this.uploads;
  }

  async createUpload(uploadData: Omit<Upload, 'id' | 'uploadedAt'>): Promise<Upload> {
    const newUpload: Upload = {
      ...uploadData,
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date().toISOString()
    };

    this.uploads.push(newUpload);
    await this.saveData();
    return newUpload;
  }

  async updateUpload(id: string, updates: Partial<Upload>): Promise<Upload | null> {
    const uploadIndex = this.uploads.findIndex(upload => upload.id === id);
    if (uploadIndex === -1) return null;

    this.uploads[uploadIndex] = { ...this.uploads[uploadIndex], ...updates };
    await this.saveData();
    return this.uploads[uploadIndex];
  }

  // Puzzles Management
  getPuzzles(): Puzzle[] {
    return this.puzzles;
  }

  async createPuzzle(puzzleData: Omit<Puzzle, 'id' | 'createdAt'>): Promise<Puzzle> {
    const newPuzzle: Puzzle = {
      ...puzzleData,
      id: `puzzle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    this.puzzles.push(newPuzzle);
    await this.saveData();
    return newPuzzle;
  }

  // Events Management
  getEvents(): Event[] {
    return this.events;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    this.events.push(newEvent);
    await this.saveData();
    return newEvent;
  }

  // Notifications Management
  getNotifications(userId: string): Notification[] {
    return this.notifications.filter(notification => notification.userId === userId);
  }

  async addNotification(userId: string, notificationData: Omit<Notification, 'id' | 'userId' | 'timestamp' | 'read'>): Promise<Notification> {
    const notification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.push(notification);
    await this.saveData();
    return notification;
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    await this.saveData();
    return true;
  }

  // Messages Management
  getMessages(): Message[] {
    return this.messages;
  }

  async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const newMessage: Message = {
      ...messageData,
      id: `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    this.messages.push(newMessage);
    await this.saveData();
    return newMessage;
  }

  // Utility Methods
  getXPForNextLevel(currentLevel: number): number {
    return currentLevel * 100; // Simple formula: level * 100 XP needed
  }

  async awardXP(userId: string, amount: number, reason: string): Promise<void> {
    const user = this.getUserById(userId);
    if (!user) return;

    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;

    await this.updateUser(userId, { xp: newXP, level: newLevel });
    
    await this.addUserActivity(userId, {
      type: 'xp_gained',
      description: `Gained ${amount} XP: ${reason}`,
      xpGained: amount
    });

    if (newLevel > user.level) {
      await this.addNotification(userId, {
        title: 'Level Up!',
        message: `Congratulations! You've reached level ${newLevel}`,
        type: 'level_up'
      });
    }
  }

  // Search functionality
  searchUsers(query: string): User[] {
    const lowercaseQuery = query.toLowerCase();
    return this.users.filter(user =>
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.bio?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Analytics
  getAnalytics() {
    const totalUsers = this.users.length;
    const activeUsers = this.users.filter(user => {
      const lastLogin = new Date(user.lastLogin);
      const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin <= 7;
    }).length;

    const totalUploads = this.uploads.length;
    const pendingUploads = this.uploads.filter(upload => upload.status === 'pending').length;
    const totalPuzzles = this.puzzles.length;
    const totalEvents = this.events.length;
    const totalMessages = this.messages.length;
    const unreadMessages = this.messages.filter(msg => !msg.read).length;

    return {
      totalUsers,
      activeUsers,
      totalUploads,
      pendingUploads,
      totalPuzzles,
      totalEvents,
      totalMessages,
      unreadMessages,
      totalFriendships: this.friendships.length,
      pendingFriendRequests: this.friendRequests.filter(req => req.status === 'pending').length
    };
  }

  // Real-time simulation
  subscribeToUpdates(callback: (data: any) => void) {
    // Simulate real-time updates
    const interval = setInterval(() => {
      callback({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
        analytics: this.getAnalytics()
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }
}

export const dataService = new DataService();