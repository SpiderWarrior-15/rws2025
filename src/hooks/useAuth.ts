import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { fileService } from '../services/fileService';
import { socketService } from '../services/socketService';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  promoteUser: (id: string, role: 'admin' | 'user') => Promise<void>;
  banUser: (id: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth system
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize default admin
        await authService.initializeDefaultAdmin();
        
        // Load all users
        const allUsers = await fileService.getUsers();
        setUsers(allUsers);
        
        // Check for saved session
        const savedUserId = localStorage.getItem('rws-current-user-id');
        if (savedUserId) {
          const savedUser = allUsers.find(u => u.id === savedUserId && !u.isBanned);
          if (savedUser) {
            setUser(savedUser);
            await authService.updateUser(savedUser.id, { 
              isOnline: true, 
              lastActive: new Date().toISOString() 
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const result = await authService.login(usernameOrEmail, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('rws-current-user-id', result.user.id);
        
        // Emit user online event
        socketService.emit('user_online', { userId: result.user.id });
        
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed');
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const result = await authService.register(username, email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('rws-current-user-id', result.user.id);
        
        // Update users list
        const updatedUsers = await fileService.getUsers();
        setUsers(updatedUsers);
        
        // Emit user joined event
        socketService.emit('user_joined', result.user);
        
        return true;
      } else {
        setError(result.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed');
      return false;
    }
  };

  const logout = async () => {
    if (user) {
      await authService.logout();
      socketService.emit('user_offline', { userId: user.id });
    }
    
    setUser(null);
    localStorage.removeItem('rws-current-user-id');
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    await authService.updateUser(id, updates);
    const updatedUsers = await fileService.getUsers();
    setUsers(updatedUsers);
    
    if (user && user.id === id) {
      setUser({ ...user, ...updates });
    }
  };

  const promoteUser = async (id: string, role: 'admin' | 'user') => {
    await updateUser(id, { role });
  };

  const banUser = async (id: string) => {
    await updateUser(id, { isBanned: true, isOnline: false });
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    setError(null);
    try {
      const result = await authService.changePassword(user.id, currentPassword, newPassword);
      
      if (result.success) {
        return true;
      } else {
        setError(result.error || 'Password change failed');
        return false;
      }
    } catch (error) {
      console.error('Password change error:', error);
      setError('Password change failed');
      return false;
    }
  };

  return {
    user,
    users,
    login,
    register,
    logout,
    updateUser,
    promoteUser,
    banUser,
    changePassword,
    isLoading,
    error
  };
};

export { AuthContext };