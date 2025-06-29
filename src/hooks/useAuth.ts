import { useState, useEffect, createContext, useContext } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AuthUser, UserAccount, LoginCredentials, SignUpData } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  signUp: (data: SignUpData) => Promise<boolean>;
  isLoading: boolean;
  accounts: UserAccount[];
  updateAccount: (id: string, updates: Partial<UserAccount>) => void;
  deleteAccount: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Initial admin account with correct password
const initialAdminAccount: UserAccount = {
  id: '1',
  name: 'Spider Warrior',
  email: 'spiderwarrior15@gmail.com',
  whatsapp: '+1234567890',
  dateOfBirth: '2012-09-17',
  gender: 'other',
  city: 'Tech City',
  country: 'Digital World',
  interests: ['Technology', 'Gaming', 'Music', 'Programming', 'Design'],
  accountType: 'admin',
  role: 'Commander',
  status: 'approved',
  createdAt: new Date().toISOString(),
  approvedAt: new Date().toISOString(),
  approvedBy: 'system',
  provider: 'email',
  avatar: '/image.png',
  customPassword: '2012_09_17'
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useLocalStorage<UserAccount[]>('rws-accounts', [initialAdminAccount]);

  // Initialize accounts if empty or missing admin
  useEffect(() => {
    const adminExists = accounts.find(acc => acc.email === 'spiderwarrior15@gmail.com');
    if (!adminExists) {
      setAccounts([initialAdminAccount, ...accounts]);
    } else {
      // Update existing admin account to ensure it has all required fields
      setAccounts(accounts.map(acc => 
        acc.email === 'spiderwarrior15@gmail.com' 
          ? { 
              ...initialAdminAccount, // Use the complete initial admin account
              ...acc, // Keep any existing data
              customPassword: '2012_09_17', // Ensure password is correct
              status: 'approved',
              accountType: 'admin',
              role: 'Commander'
            }
          : acc.role ? acc : { ...acc, role: 'Warrior' } // Ensure all accounts have a role
      ));
    }
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        // Check for remembered user first
        const rememberedUser = localStorage.getItem('rws-remembered-user');
        const sessionUser = sessionStorage.getItem('rws-current-user');
        const savedUser = rememberedUser || sessionUser;
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          // Verify the user still exists and is approved
          const accountExists = accounts.find(acc => 
            acc.id === parsedUser.id && 
            acc.status === 'approved'
          );
          
          if (accountExists) {
            // Update user object with latest account data
            const updatedUser: AuthUser = {
              id: accountExists.id,
              name: accountExists.name,
              email: accountExists.email,
              accountType: accountExists.accountType || 'user',
              role: accountExists.role || 'Warrior',
              avatar: accountExists.avatar,
              username: accountExists.name,
              googleLinked: accountExists.googleLinked || false
            };
            setUser(updatedUser);
            
            // Update both storages to keep them in sync
            if (rememberedUser) {
              localStorage.setItem('rws-remembered-user', JSON.stringify(updatedUser));
            }
            sessionStorage.setItem('rws-current-user', JSON.stringify(updatedUser));
          } else {
            // Remove invalid user
            localStorage.removeItem('rws-remembered-user');
            sessionStorage.removeItem('rws-current-user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('rws-remembered-user');
        sessionStorage.removeItem('rws-current-user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (accounts.length > 0) {
      loadUser();
    }
  }, [accounts]);

  const login = async (credentials: LoginCredentials, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Normalize email for comparison
      const normalizedEmail = credentials.email.toLowerCase().trim();
      
      // Find account by email
      const account = accounts.find(acc => 
        acc.email.toLowerCase() === normalizedEmail && 
        acc.status === 'approved'
      );

      if (!account) {
        console.log('Account not found or not approved:', normalizedEmail);
        setIsLoading(false);
        return false;
      }

      // Check password - simplified logic
      let isPasswordValid = false;
      
      if (account.email.toLowerCase() === 'spiderwarrior15@gmail.com') {
        // Admin account - check against the fixed password
        isPasswordValid = credentials.password === '2012_09_17';
        console.log('Admin login attempt:', { 
          provided: credentials.password, 
          expected: '2012_09_17', 
          valid: isPasswordValid 
        });
      } else if (account.customPassword) {
        // User with custom password
        isPasswordValid = credentials.password === account.customPassword;
      } else {
        // For demo purposes, accept any non-empty password for other accounts
        isPasswordValid = credentials.password.trim().length > 0;
      }

      if (!isPasswordValid) {
        console.log('Invalid password for account:', normalizedEmail);
        setIsLoading(false);
        return false;
      }

      // Create auth user object
      const authUser: AuthUser = {
        id: account.id,
        name: account.name,
        email: account.email,
        accountType: account.accountType || 'user',
        role: account.role || 'Warrior',
        avatar: account.avatar,
        username: account.name,
        googleLinked: account.googleLinked || false
      };
      
      // Set user and save to appropriate storage
      setUser(authUser);
      
      if (rememberMe) {
        // Save to localStorage for persistent login
        localStorage.setItem('rws-remembered-user', JSON.stringify(authUser));
        // Also save to sessionStorage for consistency
        sessionStorage.setItem('rws-current-user', JSON.stringify(authUser));
      } else {
        // Save only to sessionStorage for session-only login
        sessionStorage.setItem('rws-current-user', JSON.stringify(authUser));
        // Remove any existing remembered user
        localStorage.removeItem('rws-remembered-user');
      }
      
      console.log('Login successful for:', account.email, rememberMe ? '(remembered)' : '(session only)');
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signUp = async (data: SignUpData): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Check if email already exists
      const existingAccount = accounts.find(acc => 
        acc.email.toLowerCase() === data.email.toLowerCase().trim()
      );
      
      if (existingAccount) {
        console.log('Email already exists:', data.email);
        setIsLoading(false);
        return false;
      }

      // Create new account - ALL users are Warriors by default
      const newAccount: UserAccount = {
        id: Date.now().toString(),
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        whatsapp: data.whatsapp.trim(),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        city: data.city.trim(),
        country: data.country.trim(),
        interests: data.interests,
        accountType: 'user', // Always user, never admin
        role: 'Warrior', // Always Warrior by default
        status: 'approved', // Auto-approve all new users
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: 'auto-approval',
        provider: 'email',
        customPassword: data.password // Store the password for this user
      };

      // Add to accounts
      setAccounts([...accounts, newAccount]);

      // Automatically log in the new user
      const authUser: AuthUser = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        accountType: newAccount.accountType,
        role: newAccount.role,
        avatar: newAccount.avatar,
        username: newAccount.name,
        googleLinked: newAccount.googleLinked || false
      };

      // Set user and save to sessionStorage (not remembered by default)
      setUser(authUser);
      sessionStorage.setItem('rws-current-user', JSON.stringify(authUser));
      
      console.log('Account created and user logged in successfully:', newAccount.email);
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Sign up error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rws-remembered-user');
    sessionStorage.removeItem('rws-current-user');
    console.log('User logged out');
  };

  const updateAccount = (id: string, updates: Partial<UserAccount>) => {
    setAccounts(accounts.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    ));
    
    // Update current user if it's the same account
    if (user && user.id === id) {
      const updatedAccount = accounts.find(acc => acc.id === id);
      if (updatedAccount) {
        const updatedUser: AuthUser = {
          ...user,
          name: updates.name || user.name,
          email: updates.email || user.email,
          accountType: updates.accountType || user.accountType,
          role: updates.role || user.role,
          avatar: updates.avatar || user.avatar,
          username: updates.name || user.username,
          googleLinked: updates.googleLinked || user.googleLinked
        };
        setUser(updatedUser);
        
        // Update both storages if they exist
        const rememberedUser = localStorage.getItem('rws-remembered-user');
        if (rememberedUser) {
          localStorage.setItem('rws-remembered-user', JSON.stringify(updatedUser));
        }
        sessionStorage.setItem('rws-current-user', JSON.stringify(updatedUser));
      }
    }
  };

  const deleteAccount = (id: string) => {
    // Don't allow deleting the admin account
    if (id === '1') return;
    
    setAccounts(accounts.filter(acc => acc.id !== id));
    
    // If the deleted account is the current user, log them out
    if (user && user.id === id) {
      logout();
    }
  };

  return {
    user,
    login,
    logout,
    signUp,
    isLoading,
    accounts,
    updateAccount,
    deleteAccount
  };
};

export { AuthContext };