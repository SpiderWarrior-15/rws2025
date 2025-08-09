import { User } from '../types';
import { dataService } from './dataService';
import { v4 as uuidv4 } from 'uuid';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isInitialized = false;
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  private constructor() {}

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized || !this.clientId) return;

    return new Promise((resolve, reject) => {
      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: this.clientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true
          });
          this.isInitialized = true;
          resolve();
        } else {
          reject(new Error('Google Identity Services failed to load'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };

      document.head.appendChild(script);
    });
  }

  private async handleCredentialResponse(response: any) {
    try {
      const credential = response.credential;
      const payload = this.parseJwt(credential);
      
      const googleUser: GoogleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name
      };

      await this.processGoogleLogin(googleUser);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  private async processGoogleLogin(googleUser: GoogleUser): Promise<User> {
    // Check if user exists
    let existingUser = await dataService.getUserByEmail(googleUser.email);
    
    if (existingUser) {
      // Update existing user with Google info
      const updatedUser = {
        ...existingUser,
        avatar: {
          ...existingUser.avatar,
          imageUrl: googleUser.picture
        },
        lastActive: new Date().toISOString(),
        isOnline: true,
        provider: 'google',
        googleId: googleUser.id
      };
      
      await dataService.updateUser(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user from Google account
      const newUser: User = {
        id: uuidv4(),
        username: googleUser.given_name || googleUser.name.split(' ')[0],
        email: googleUser.email,
        password: '', // No password for Google users
        role: 'user',
        avatar: {
          mask: 'default',
          name: googleUser.name,
          badge: 'newcomer',
          color: '#3b82f6',
          imageUrl: googleUser.picture
        },
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isOnline: true,
        isBanned: false,
        bio: `Warrior joined via Google Sign-In`,
        location: '',
        level: 1,
        xp: 0,
        achievements: ['New Warrior'],
        activityLog: [{
          id: uuidv4(),
          description: 'Joined the Royal Warriors Squad via Google',
          timestamp: new Date().toISOString(),
          xpGained: 10,
          type: 'achievement'
        }],
        stats: {
          messagesCount: 0,
          formsSubmitted: 0,
          eventsAttended: 0,
          songsUploaded: 0,
          puzzlesSolved: 0,
          quizzesCompleted: 0,
          achievementsUnlocked: 1,
          totalPoints: 10
        },
        preferences: {
          darkMode: true,
          notifications: true,
          soundEffects: true,
          language: 'en'
        },
        provider: 'google',
        googleId: googleUser.id
      };

      await dataService.saveUser(newUser);
      return newUser;
    }
  }

  public async signIn(): Promise<User> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup
            this.signInWithPopup().then(resolve).catch(reject);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async signInWithPopup(): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      // Create a temporary callback for popup
      const tempCallback = async (response: any) => {
        try {
          const credential = response.credential;
          const payload = this.parseJwt(credential);
          
          const googleUser: GoogleUser = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            given_name: payload.given_name,
            family_name: payload.family_name
          };

          const user = await this.processGoogleLogin(googleUser);
          resolve(user);
        } catch (error) {
          reject(error);
        }
      };

      // Reinitialize with temporary callback
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: tempCallback,
        auto_select: false
      });

      window.google.accounts.id.prompt();
    });
  }

  public renderSignInButton(containerId: string): void {
    if (!this.isInitialized || !window.google) return;

    window.google.accounts.id.renderButton(
      document.getElementById(containerId),
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left'
      }
    );
  }

  public async signOut(): Promise<void> {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}

export const googleAuthService = GoogleAuthService.getInstance();