import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, User, Lock, Shield, Crown, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!formData.usernameOrEmail.trim() || !formData.password) {
      setLoginError('Please fill in all fields');
      return;
    }

    try {
      const success = await login(formData.usernameOrEmail, formData.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setLoginError(error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    }
  };

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
                Welcome Back, Warrior
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to access the Alan Warriors Edition
              </p>
            </div>

            {/* Error Display */}
            {(loginError || error) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{loginError || error}</p>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.usernameOrEmail}
                    onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 dark:text-white"
                    placeholder="Enter username or email"
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
                    placeholder="Enter password"
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

              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                icon={LogIn}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </AnimatedButton>
            </form>

            {/* Demo Accounts */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Demo Accounts
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    <span className="text-gray-800 dark:text-white font-medium">Admin</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Spider Warrior / 2012_09_17
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center space-x-2">
                    <User className="w-3 h-3 text-blue-500" />
                    <span className="text-gray-800 dark:text-white font-medium">User</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Create new account
                  </div>
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New to the squad?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300 transition-colors duration-300"
                >
                  Join the Warriors
                </Link>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;