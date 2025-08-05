import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuth } from '../hooks/useAuth';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setSignupError('Please fill in all fields');
      return;
    }

    if (formData.username.length < 3) {
      setSignupError('Username must be at least 3 characters long');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setSignupError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setSignupError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    try {
      const success = await register(formData.username, formData.email, formData.password);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setSignupError(error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSignupError('Registration failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Welcome to the Squad!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your warrior account has been created successfully! You're now logged in and ready to start your journey.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Redirecting to your dashboard...
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 backdrop-blur-lg border-2 border-yellow-500/40 relative"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img 
                  src="/image.png" 
                  alt="Royal Warriors Squad" 
                  className="w-full h-full object-contain filter drop-shadow-lg rounded-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-600/20 rounded-3xl"></div>
              </motion.div>
              
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Join the Alan Warriors
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Become part of our elite community
              </p>
            </div>

            {/* Error Display */}
            {(signupError || error) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{signupError || error}</p>
              </motion.div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Warrior Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                    placeholder="Choose your warrior name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                icon={UserPlus}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Join the Squad'}
              </AnimatedButton>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already a warrior?{' '}
                <Link
                  to="/login"
                  className="font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300 transition-colors duration-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};