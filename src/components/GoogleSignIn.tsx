import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Chrome, Loader2 } from 'lucide-react';
import { googleAuthService } from '../services/googleAuthService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface GoogleSignInProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogle = async () => {
      try {
        await googleAuthService.initialize();
        setIsInitialized(true);
        
        // Render Google button if container exists
        if (buttonRef.current) {
          googleAuthService.renderSignInButton('google-signin-button');
        }
      } catch (error) {
        console.error('Google Sign-In initialization failed:', error);
        onError?.('Failed to initialize Google Sign-In');
      }
    };

    initializeGoogle();
  }, [onError]);

  const handleGoogleSignIn = async () => {
    if (!isInitialized) {
      toast.error('Google Sign-In not ready yet');
      return;
    }

    setIsLoading(true);
    try {
      const user = await googleAuthService.signIn();
      
      // Log the user in through our auth system
      const success = await login(user.email, '', 'google');
      
      if (success) {
        toast.success(`Welcome back, ${user.username}!`);
        onSuccess?.();
      } else {
        throw new Error('Failed to authenticate with platform');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google Sign-In failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSignIn = async () => {
    setIsLoading(true);
    try {
      await googleAuthService.signInWithPopup();
    } catch (error) {
      console.error('Custom Google Sign-In error:', error);
      toast.error('Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Custom Google Sign-In Button */}
      <motion.button
        onClick={handleCustomSignIn}
        disabled={isLoading || !isInitialized}
        className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
        ) : (
          <Chrome className="w-5 h-5 text-gray-600" />
        )}
        <span className="text-gray-700 font-medium">
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </span>
      </motion.button>

      {/* Official Google Button Container */}
      <div 
        id="google-signin-button" 
        ref={buttonRef}
        className="flex justify-center"
        style={{ display: isInitialized ? 'block' : 'none' }}
      />

      {!isInitialized && (
        <div className="text-center text-sm text-gray-500">
          Loading Google Sign-In...
        </div>
      )}
    </div>
  );
};