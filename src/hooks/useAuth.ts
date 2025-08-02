import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';
import { fileService } from '../services/fileService';
import { socketService } from '../services/socketService';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  promoteUser: (id: string, role: 'commander' | 'warrior') => Promise<void>;
  banUser: (id: string) => Promise<void>;
  isLoading: boolean;
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

  // Initialize with default admin user
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        let allUsers = await fileService.getUsers();
        
        // Create default admin if no users exist
        if (allUsers.length === 0) {
          const adminUser: User = {
            id: uuidv4(),
            username: 'Spider Warrior',
            email: 'spiderwarrior15@gmail.com',
            password: '2012_09_17',
            role: 'admin',
            joinedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            isOnline: true,
            isBanned: false,
            stats: {
              messagesCount: 0,
              formsSubmitted: 0,
              eventsAttended: 0,
              songsUploaded: 0,
              puzzlesSolved: 0
            }
          };
          
          await fileService.saveUser(adminUser);
          allUsers = [adminUser];
        }
        
        setUsers(allUsers);
        
        // Check for saved session
        const savedUserId = localStorage.getItem('rws-current-user-id');
        if (savedUserId) {
          const savedUser = allUsers.find(u => u.id === savedUserId && !u.isBanned);
          if (savedUser) {
            setUser(savedUser);
            await fileService.updateUser(savedUser.id, { 
              isOnline: true, 
              lastActive: new Date().toISOString() 
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      const allUsers = await fileService.getUsers();
      const foundUser = allUsers.find(u => 
        (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
         u.email.toLowerCase() === usernameOrEmail.toLowerCase()) &&
        u.password === password &&
        !u.isBanned
      );

      if (foundUser) {
        const updatedUser = {
          ...foundUser,
          isOnline: true,
          lastActive: new Date().toISOString()
        };
        
        await fileService.updateUser(foundUser.id, { 
          isOnline: true, 
          lastActive: new Date().toISOString() 
        });
        
        setUser(updatedUser);
        localStorage.setItem('rws-current-user-id', foundUser.id);
        
        // Emit user online event
        socketService.emit('user_online', { userId: foundUser.id });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const allUsers = await fileService.getUsers();
      
      // Check if username or email already exists
      const existingUser = allUsers.find(u => 
        u.username.toLowerCase() === username.toLowerCase() || 
        u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (existingUser) {
        return false;
      }

      const newUser: User = {
        id: uuidv4(),
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        role: 'warrior',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isOnline: true,
        isBanned: false,
        stats: {
          messagesCount: 0,
          formsSubmitted: 0,
          eventsAttended: 0,
          songsUploaded: 0,
          puzzlesSolved: 0
        }
      };

      await fileService.saveUser(newUser);
      setUser(newUser);
      setUsers([...allUsers, newUser]);
      localStorage.setItem('rws-current-user-id', newUser.id);
      
      // Emit user joined event
      socketService.emit('user_joined', newUser);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    if (user) {
      await fileService.updateUser(user.id, { 
        isOnline: false, 
        lastActive: new Date().toISOString() 
      });
      
      socketService.emit('user_offline', { userId: user.id });
    }
    
    setUser(null);
    localStorage.removeItem('rws-current-user-id');
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    await fileService.updateUser(id, updates);
    const updatedUsers = await fileService.getUsers();
    setUsers(updatedUsers);
    
    if (user && user.id === id) {
      setUser({ ...user, ...updates });
    }
  };

  const promoteUser = async (id: string, role: 'commander' | 'warrior') => {
    await updateUser(id, { role });
  };

  const banUser = async (id: string) => {
    await updateUser(id, { isBanned: true, isOnline: false });
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
    isLoading
  };
};

export { AuthContext };