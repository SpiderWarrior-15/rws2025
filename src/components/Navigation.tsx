import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X, User, LogOut, UserCircle, Crown, Shield, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { AnimatedButton } from './AnimatedButton';
import { ThemeSwitcher } from './ThemeSwitcher';
import { GlobalSearch } from './GlobalSearch';

export const Navigation: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Puzzles', path: '/puzzles' },
    { name: 'News', path: '/news' },
    { name: 'Announcements', path: '/announcements' },
    { name: "Warriors' Picks", path: '/warriors-picks' },
    { name: 'Tools', path: '/tools' },
    { name: 'Events', path: '/events' },
    { name: 'Chat', path: '/chat' },
    { name: 'Contact', path: '/contact' },
  ];

  // Only add admin panel for admin users
  if (user?.accountType === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin' });
  }

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const getRoleIcon = () => {
    if (!user) return User;
    return user.role === 'Commander' ? Crown : Shield;
  };

  const getRoleColor = () => {
    if (!user) return 'text-gray-700 dark:text-gray-300';
    return user.role === 'Commander' ? 'text-yellow-500' : 'text-blue-500';
  };

  const RoleIcon = getRoleIcon();

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-b border-white/20 dark:border-gray-700/30' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="relative w-12 h-12"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="/image.png" 
                alt="Royal Warriors Squad" 
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </motion.div>
            <div className="hidden sm:block">
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                ROYAL WARRIORS
              </motion.span>
              <div className="text-sm font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                SQUAD
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <motion.div key={item.path} whileHover={{ y: -2 }}>
                <Link
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-white/10 dark:hover:bg-gray-800/50 ${
                    location.pathname === item.path
                      ? 'text-yellow-500 dark:text-yellow-400 bg-white/20 dark:bg-gray-800/50'
                      : 'text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400'
                  }`}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Dark Mode Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <RoleIcon className={`w-5 h-5 ${getRoleColor()}`} />
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg shadow-lg"
                    >
                      <div className="p-4 border-b border-white/10 dark:border-gray-700/30">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{user.username}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                            user.role === 'Commander' 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors duration-300"
                      >
                        <UserCircle className="w-4 h-4" />
                        <span>View Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <AnimatedButton variant="ghost" size="sm">
                    Sign In
                  </AnimatedButton>
                </Link>
                <Link to="/signup">
                  <AnimatedButton variant="primary" size="sm">
                    Sign Up
                  </AnimatedButton>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/10 dark:bg-gray-900/20 backdrop-blur-md rounded-lg mt-2 mb-4 border border-white/20 dark:border-gray-700/30"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile Search */}
                <div className="px-3 py-2">
                  <GlobalSearch />
                </div>
                
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'text-yellow-500 dark:text-yellow-400 bg-white/20 dark:bg-gray-800/50'
                        : 'text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-white/10 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {user && (
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300"
                  >
                    Profile
                  </Link>
                )}
                
                {!user && (
                  <div className="pt-4 border-t border-white/10 dark:border-gray-700/30 space-y-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <AnimatedButton variant="ghost" size="sm" className="w-full">
                        Sign In
                      </AnimatedButton>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <AnimatedButton variant="primary" size="sm" className="w-full">
                        Sign Up
                      </AnimatedButton>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};