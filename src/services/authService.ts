import bcrypt from 'bcryptjs';
import { User } from '../types';
import { fileService } from './fileService';
import { v4 as uuidv4 } from 'uuid';

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async initializeDefaultAdmin(): Promise<void> {
    try {
      const users = await fileService.getUsers();
      
      // Check if Spider Warrior admin already exists
      const existingAdmin = users.find(u => u.username === 'Spider Warrior');
      if (existingAdmin) return;

      // Create default admin account
      const hashedPassword = await bcrypt.hash('2012_09_17', 10);
      const adminUser: User = {
        id: uuidv4(),
        username: 'Spider Warrior',
        email: 'spiderwarrior15@gmail.com',
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
        stats: {
          messagesCount: 0,
          formsSubmitted: 0,
          eventsAttended: 0,
          songsUploaded: 0,
          puzzlesSolved: 0,
          quizzesCompleted: 0,
          achievementsUnlocked: 0,
          totalPoints: 0
        },
        preferences: {
          darkMode: true,
          notifications: true,
          soundEffects: true,
          language: 'en'
        }
      };

      await fileService.saveUser(adminUser);
      console.log('Default admin account created: Spider Warrior');
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }

  public async register(username: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const users = await fileService.getUsers();
      
      // Check if username or email already exists
      const existingUser = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() || 
        u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (existingUser) {
        return { success: false, error: 'Username or email already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser: User = {
        id: uuidv4(),
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user',
        avatar: {
          mask: 'default',
          name: username.trim(),
          badge: 'newcomer',
          color: '#3b82f6'
        },
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isOnline: true,
        isBanned: false,
        stats: {
          messagesCount: 0,
          formsSubmitted: 0,
          eventsAttended: 0,
          songsUploaded: 0,
          puzzlesSolved: 0,
          quizzesCompleted: 0,
          achievementsUnlocked: 0,
          totalPoints: 0
        },
        preferences: {
          darkMode: true,
          notifications: true,
          soundEffects: true,
          language: 'en'
        }
      };

      await fileService.saveUser(newUser);
      this.currentUser = newUser;
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  public async login(usernameOrEmail: string, password: string, provider?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const users = await fileService.getUsers();
      
      // Find user by username or email
      const user = users.find(u => 
        u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
        u.email.toLowerCase() === usernameOrEmail.toLowerCase()
      );

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.isBanned) {
        return { success: false, error: 'Account has been banned' };
      }

      // Verify password (skip for Google users)
      if (provider !== 'google') {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return { success: false, error: 'Invalid password' };
        }
      }

      // Update user status
      await fileService.updateUser(user.id, {
        isOnline: true,
        lastActive: new Date().toISOString()
      });

      this.currentUser = { ...user, isOnline: true };
      
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  public async logout(): Promise<void> {
    if (this.currentUser) {
      await fileService.updateUser(this.currentUser.id, {
        isOnline: false,
        lastActive: new Date().toISOString()
      });
    }
    this.currentUser = null;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await fileService.updateUser(id, updates);
    if (this.currentUser && this.currentUser.id === id) {
      this.currentUser = { ...this.currentUser, ...updates };
    }
  }

  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = await fileService.getUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await fileService.updateUser(userId, { password: hashedNewPassword });
      
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }
}

export const authService = AuthService.getInstance();