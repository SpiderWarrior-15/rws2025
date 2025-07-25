import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X, User, LogOut, UserCircle, Crown, Shield, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { AnimatedButton } from './AnimatedButton';
import { GlobalSearch } from './GlobalSearch';

export const Navigation: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setIsUserMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: 'Home', path: '/' },
    {
      name: 'Community',
      dropdown: [
        { name: 'Puzzles', path: '/puzzles', description: 'Brain challenges & competitions' },
        { name: 'Chat', path: '/chat', description: 'Connect with warriors' },
        { name: 'Events', path: '/events', description: 'Upcoming gatherings' },
        { name: 'Forms', path: '/forms', description: 'Surveys & registrations' },
      ]
    },
    {
      name: 'Content',
      dropdown: [
        { name: 'News', path: '/news', description: 'Latest tech updates' },
        { name: 'Announcements', path: '/announcements', description: 'Important updates' },
        { name: "Warriors' Picks", path: '/warriors-picks', description: 'Community favorites' },
      ]
    },
    { name: 'Tools', path: '/tools' },
    { name: 'Contact', path: '/contact' },
  ];

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

  const handleDropdownClick = (e: React.MouseEvent, dropdownName: string) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
              className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-sm border border-yellow-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="/image.png" 
                alt="Royal Warriors Squad" 
                className="w-full h-full object-contain filter drop-shadow-lg interactive rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-2xl"></div>
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
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div className="relative">
                    <button
                      onClick={(e) => handleDropdownClick(e, item.name)}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 dark:hover:bg-gray-800/50 ${
                        item.dropdown.some(subItem => location.pathname === subItem.path)
                          ? 'text-yellow-500 dark:text-yellow-400 bg-white/20 dark:bg-gray-800/50'
                          : 'text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl overflow-hidden"
                        >
                          {item.dropdown.map((subItem, index) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setActiveDropdown(null)}
                              className={`block px-4 py-3 transition-all duration-200 hover:bg-white/10 dark:hover:bg-gray-800/50 ${
                                location.pathname === subItem.path
                                  ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                  : 'text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400'
                              } ${index !== item.dropdown.length - 1 ? 'border-b border-white/10 dark:border-gray-700/30' : ''}`}
                            >
                              <div className="font-medium">{subItem.name}</div>
                              <div className="text-xs opacity-75 mt-1">{subItem.description}</div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div whileHover={{ y: -2 }}>
                    <Link
                      to={item.path}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 dark:hover:bg-gray-800/50 ${
                        location.pathname === item.path
                          ? 'text-yellow-500 dark:text-yellow-400 bg-white/20 dark:bg-gray-800/50'
                          : 'text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

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
                  onClick={handleUserMenuClick}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full interactive" />
                  ) : (
                    <RoleIcon className={`w-5 h-5 ${getRoleColor()}`} />
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg shadow-lg overflow-hidden"
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
                      
                      {/* Admin Panel - Only show for admin users */}
                      {user?.accountType === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors duration-300"
                        >
                          <Crown className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      
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
              onClick={handleMobileMenuToggle}
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
              className="lg:hidden fixed inset-x-0 top-20 bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-white/20 dark:border-gray-700/30 overflow-y-auto"
              style={{ 
                maxHeight: 'calc(100vh - 80px)',
                overscrollBehavior: 'contain'
              }}
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search */}
                <div className="mb-6">
                  <GlobalSearch />
                </div>
                
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <div>
                        <div className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          {item.name}
                        </div>
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={closeMobileMenu}
                            className={`block px-6 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                              location.pathname === subItem.path
                                ? 'text-yellow-500 dark:text-yellow-400 bg-white/20 dark:bg-gray-800/50'
                                : 'text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-white/10 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            <div>{subItem.name}</div>
                            <div className="text-sm opacity-75">{subItem.description}</div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                          location.pathname === item.path
                            ? 'text-yellow-500 dark:text-yellow-400 bg-white/20 dark:bg-gray-800/50'
                            : 'text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-white/10 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                
                {user && (
                  <>
                    <div className="border-t border-white/20 dark:border-gray-700/30 pt-4 mt-6">
                      <div className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Account
                      </div>
                      <Link
                        to="/profile"
                        onClick={closeMobileMenu}
                        className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300"
                      >
                        Profile
                      </Link>
                      
                      {/* Admin Panel for mobile - Only show for admin users */}
                      {user?.accountType === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={closeMobileMenu}
                          className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300"
                        >
                          Admin Panel
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMobileMenu();
                        }}
                        className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
                
                {!user && (
                  <div className="border-t border-white/20 dark:border-gray-700/30 pt-4 mt-6 space-y-3">
                    <Link to="/login" onClick={closeMobileMenu}>
                      <AnimatedButton variant="ghost" size="sm" className="w-full">
                        Sign In
                      </AnimatedButton>
                    </Link>
                    <Link to="/signup" onClick={closeMobileMenu}>
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