@@ .. @@
 import { 
   User, 
   Message, 
   Chat, 
   CustomForm, 
   FormSubmission, 
   Event, 
   Puzzle, 
   Quiz, 
   Activity, 
   ApprovalRequest, 
-  AIModel 
+  AIModel,
+  FriendRequest,
+  Friendship,
+  Notification,
+  AdminAction,
+  SystemSettings,
+  ContactMessage,
+  UploadSubmission,
+  ActivityEntry
 } from '../types';
 
 class DataService {
   private static instance: DataService;
   private storagePrefix = 'rws-data-';
 
   private constructor() {
     this.initializeDefaultData();
   }
 
   public static getInstance(): DataService {
     if (!DataService.instance) {
       DataService.instance = new DataService();
     }
     return DataService.instance;
   }
 
   private async initializeDefaultData() {
     // Initialize default admin if not exists
     const users = await this.getUsers();
     const adminExists = users.find(u => u.username === 'Spider Warrior');
     
     if (!adminExists) {
       const bcrypt = await import('bcryptjs');
       const hashedPassword = await bcrypt.hash('2012_09_17', 10);
       
       const defaultAdmin: User = {
         id: uuidv4(),
         username: 'Spider Warrior',
         email: 'spiderwarrior@rws.com',
         password: hashedPassword,
         role: 'admin',
         avatar: {
           mask: 'spider',
           name: 'Spider Warrior',
           badge: 'founder',
           color: '#8b5cf6'
         },
         createdAt: new Date().toISOString(),
         lastActive: new Date().toISOString(),
         isOnline: false,
         isBanned: false,
+        bio: 'The legendary Spider Warrior, founder and protector of the Royal Warriors Squad.',
+        location: 'Digital Realm',
+        level: 100,
+        xp: 999999,
+        achievements: ['Founder', 'Admin', 'Legend', 'Master', 'Guardian'],
+        activityLog: [],
         stats: {
           messagesCount: 0,
           formsSubmitted: 0,
           eventsAttended: 0,
           songsUploaded: 0,
           puzzlesSolved: 0,
           quizzesCompleted: 0,
           achievementsUnlocked: 5,
           totalPoints: 999999
         },
         preferences: {
           darkMode: true,
           notifications: true,
           soundEffects: true,
           language: 'en'
         }
       };
 
       await this.saveUser(defaultAdmin);
     }
+
+    // Initialize system settings
+    const settings = await this.getSystemSettings();
+    if (!settings) {
+      const defaultSettings: SystemSettings = {
+        id: 'main',
+        darkModeDefault: true,
+        maintenanceMode: false,
+        registrationEnabled: true,
+        uploadsEnabled: true,
+        puzzlesEnabled: true,
+        eventsEnabled: true,
+        chatEnabled: true,
+        aiAssistantEnabled: true,
+        welcomeMessage: 'Welcome to the Royal Warriors Squad!',
+        maxFileSize: 50 * 1024 * 1024, // 50MB
+        allowedFileTypes: ['.mp3', '.wav', '.ogg', '.mp4', '.mov', '.webm'],
+        updatedBy: 'system',
+        updatedAt: new Date().toISOString()
+      };
+      await this.saveSystemSettings(defaultSettings);
+    }
   }
 
   // Generic storage methods
   private getStorageKey(key: string): string {
     return `${this.storagePrefix}${key}`;
   }
 
   private async getData<T>(key: string): Promise<T[]> {
     try {
       const data = localStorage.getItem(this.getStorageKey(key));
       return data ? JSON.parse(data) : [];
     } catch (error) {
       console.error(`Error getting ${key}:`, error);
       return [];
     }
   }
 
   private async setData<T>(key: string, data: T[]): Promise<void> {
     try {
       localStorage.setItem(this.getStorageKey(key), JSON.stringify(data));
       this.broadcastUpdate(key, data);
     } catch (error) {
       console.error(`Error setting ${key}:`, error);
     }
   }
 
   private broadcastUpdate(type: string, data: any) {
     // Emit real-time update
     window.dispatchEvent(new CustomEvent('rws-data-update', {
       detail: { type, data, timestamp: Date.now() }
     }));
   }
 
+  // Friend Request methods
+  public async getFriendRequests(): Promise<FriendRequest[]> {
+    return this.getData<FriendRequest>('friend-requests');
+  }
+
+  public async saveFriendRequest(request: FriendRequest): Promise<void> {
+    const requests = await this.getFriendRequests();
+    requests.push(request);
+    await this.setData('friend-requests', requests);
+  }
+
+  public async getFriendRequestById(id: string): Promise<FriendRequest | null> {
+    const requests = await this.getFriendRequests();
+    return requests.find(r => r.id === id) || null;
+  }
+
+  public async updateFriendRequest(id: string, updates: Partial<FriendRequest>): Promise<void> {
+    const requests = await this.getFriendRequests();
+    const index = requests.findIndex(r => r.id === id);
+    if (index !== -1) {
+      requests[index] = { ...requests[index], ...updates };
+      await this.setData('friend-requests', requests);
+    }
+  }
+
+  // Friendship methods
+  public async getFriendships(): Promise<Friendship[]> {
+    return this.getData<Friendship>('friendships');
+  }
+
+  public async saveFriendship(friendship: Friendship): Promise<void> {
+    const friendships = await this.getFriendships();
+    friendships.push(friendship);
+    await this.setData('friendships', friendships);
+  }
+
+  public async deleteFriendship(id: string): Promise<void> {
+    const friendships = await this.getFriendships();
+    const filtered = friendships.filter(f => f.id !== id);
+    await this.setData('friendships', filtered);
+  }
+
+  // Notification methods
+  public async getNotifications(userId?: string): Promise<Notification[]> {
+    const notifications = await this.getData<Notification>('notifications');
+    return userId ? notifications.filter(n => n.userId === userId) : notifications;
+  }
+
+  public async saveNotification(notification: Notification): Promise<void> {
+    const notifications = await this.getNotifications();
+    notifications.push(notification);
+    await this.setData('notifications', notifications);
+  }
+
+  public async markNotificationRead(id: string): Promise<void> {
+    const notifications = await this.getNotifications();
+    const index = notifications.findIndex(n => n.id === id);
+    if (index !== -1) {
+      notifications[index].read = true;
+      await this.setData('notifications', notifications);
+    }
+  }
+
+  // Admin Action logging
+  public async logAdminAction(action: AdminAction): Promise<void> {
+    const actions = await this.getData<AdminAction>('admin-actions');
+    actions.push(action);
+    await this.setData('admin-actions', actions);
+  }
+
+  public async getAdminActions(): Promise<AdminAction[]> {
+    return this.getData<AdminAction>('admin-actions');
+  }
+
+  // System Settings
+  public async getSystemSettings(): Promise<SystemSettings | null> {
+    const settings = await this.getData<SystemSettings>('system-settings');
+    return settings[0] || null;
+  }
+
+  public async saveSystemSettings(settings: SystemSettings): Promise<void> {
+    await this.setData('system-settings', [settings]);
+  }
+
+  // Contact Messages
+  public async getContactMessages(): Promise<ContactMessage[]> {
+    return this.getData<ContactMessage>('contact-messages');
+  }
+
+  public async saveContactMessage(message: ContactMessage): Promise<void> {
+    const messages = await this.getContactMessages();
+    messages.push(message);
+    await this.setData('contact-messages', messages);
+  }
+
+  public async updateContactMessage(id: string, updates: Partial<ContactMessage>): Promise<void> {
+    const messages = await this.getContactMessages();
+    const index = messages.findIndex(m => m.id === id);
+    if (index !== -1) {
+      messages[index] = { ...messages[index], ...updates };
+      await this.setData('contact-messages', messages);
+    }
+  }
+
+  // Upload Submissions
+  public async getUploadSubmissions(): Promise<UploadSubmission[]> {
+    return this.getData<UploadSubmission>('upload-submissions');
+  }
+
+  public async saveUploadSubmission(submission: UploadSubmission): Promise<void> {
+    const submissions = await this.getUploadSubmissions();
+    submissions.push(submission);
+    await this.setData('upload-submissions', submissions);
+  }
+
+  public async updateUploadSubmission(id: string, updates: Partial<UploadSubmission>): Promise<void> {
+    const submissions = await this.getUploadSubmissions();
+    const index = submissions.findIndex(s => s.id === id);
+    if (index !== -1) {
+      submissions[index] = { ...submissions[index], ...updates };
+      await this.setData('upload-submissions', submissions);
+    }
+  }
+
+  // Activity Entry methods
+  public async addActivityEntry(userId: string, entry: ActivityEntry): Promise<void> {
+    const users = await this.getUsers();
+    const userIndex = users.findIndex(u => u.id === userId);
+    if (userIndex !== -1) {
+      if (!users[userIndex].activityLog) {
+        users[userIndex].activityLog = [];
+      }
+      users[userIndex].activityLog.unshift(entry);
+      
+      // Keep only last 50 entries
+      users[userIndex].activityLog = users[userIndex].activityLog.slice(0, 50);
+      
+      // Add XP if specified
+      if (entry.xpGained) {
+        users[userIndex].xp += entry.xpGained;
+        users[userIndex].level = this.calculateLevel(users[userIndex].xp);
+      }
+      
+      await this.setData('users', users);
+    }
+  }
+
+  // XP and Level calculation
+  public calculateLevel(xp: number): number {
+    return Math.floor(xp / 100) + 1; // Simple: 100 XP per level
+  }
+
+  public getXPForNextLevel(currentLevel: number): number {
+    return currentLevel * 100;
+  }
+
   // User methods
   public async getUsers(): Promise<User[]> {
     return this.getData<User>('users');
   }
 
   public async saveUser(user: User): Promise<void> {
     const users = await this.getUsers();
     users.push(user);
     await this.setData('users', users);
   }
 
   public async getUserById(id: string): Promise<User | null> {
     const users = await this.getUsers();
     return users.find(u => u.id === id) || null;
   }
 
   public async updateUser(id: string, updates: Partial<User>): Promise<void> {
     const users = await this.getUsers();
     const index = users.findIndex(u => u.id === id);
     if (index !== -1) {
       users[index] = { ...users[index], ...updates };
       await this.setData('users', users);
     }
   }
 
   public async deleteUser(id: string): Promise<void> {
     const users = await this.getUsers();
     const filtered = users.filter(u => u.id !== id);
     await this.setData('users', filtered);
   }

  // Puzzle Attempt methods
  public async getPuzzleAttempts(): Promise<PuzzleAttempt[]> {
    return this.getData<PuzzleAttempt>('puzzle-attempts');
  }

  public async savePuzzleAttempt(attempt: PuzzleAttempt): Promise<void> {
    const attempts = await this.getPuzzleAttempts();
    attempts.push(attempt);
    await this.setData('puzzle-attempts', attempts);
  }

  public async updatePuzzleAttempt(id: string, updates: Partial<PuzzleAttempt>): Promise<void> {
    const attempts = await this.getPuzzleAttempts();
    const index = attempts.findIndex(a => a.id === id);
    if (index !== -1) {
      attempts[index] = { ...attempts[index], ...updates };
      await this.setData('puzzle-attempts', attempts);
    }
  }

  // Form Submission methods
  public async getFormSubmissions(): Promise<FormSubmission[]> {
    return this.getData<FormSubmission>('form-submissions');
  }

  public async saveFormSubmission(submission: FormSubmission): Promise<void> {
    const submissions = await this.getFormSubmissions();
    submissions.push(submission);
    await this.setData('form-submissions', submissions);
  }

  // Event methods
  public async getEvents(): Promise<Event[]> {
    return this.getData<Event>('events');
  }

  public async saveEvent(event: Event): Promise<void> {
    const events = await this.getEvents();
    events.push(event);
    await this.setData('events', events);
  }

  public async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    const events = await this.getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates };
      await this.setData('events', events);
    }
  }

  // Form methods
  public async getForms(): Promise<CustomForm[]> {
    return this.getData<CustomForm>('forms');
  }

  public async saveForm(form: CustomForm): Promise<void> {
    const forms = await this.getForms();
    forms.push(form);
    await this.setData('forms', forms);
  }

  public async updateForm(id: string, updates: Partial<CustomForm>): Promise<void> {
    const forms = await this.getForms();
    const index = forms.findIndex(f => f.id === id);
    if (index !== -1) {
      forms[index] = { ...forms[index], ...updates };
      await this.setData('forms', forms);
    }
  }

  // Puzzle methods
  public async getPuzzles(): Promise<Puzzle[]> {
    return this.getData<Puzzle>('puzzles');
  }

  public async savePuzzle(puzzle: Puzzle): Promise<void> {
    const puzzles = await this.getPuzzles();
    puzzles.push(puzzle);
    await this.setData('puzzles', puzzles);
  }

  public async updatePuzzle(id: string, updates: Partial<Puzzle>): Promise<void> {
    const puzzles = await this.getPuzzles();
    const index = puzzles.findIndex(p => p.id === id);
    if (index !== -1) {
      puzzles[index] = { ...puzzles[index], ...updates };
      await this.setData('puzzles', puzzles);
    }
  }