import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, User, LogOut, UserCircle, Crown, Shield } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { AnimatedButton } from './AnimatedButton';
import { SoundToggle } from './SoundToggle';

export const Navigation: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
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
    { name: "Warriors' Picks", path: '/warriors-picks' },
    { name: 'Puzzles', path: '/puzzles' },
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-b border-white/20 dark:border-gray-700/30' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-300">
              <img 
                src="/image.png" 
                alt="Royal Warriors Squad" 
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                ROYAL WARRIORS
              </span>
              <div className="text-sm font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                SQUAD
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-white/10 dark:hover:bg-gray-800/50 ${
                  location.pathname === item.path
                    ? 'text-yellow-500 dark:text-yellow-400 bg-white/20 dark:bg-gray-800/50'
                    : 'text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Sound Toggle */}
            <SoundToggle />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <RoleIcon className={`w-5 h-5 ${getRoleColor()}`} />
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg shadow-lg">
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
                        {user.googleLinked && (
                          <span className="text-xs text-green-400">Google</span>
                        )}
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
                  </div>
                )}
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
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/10 dark:bg-gray-900/20 backdrop-blur-md rounded-lg mt-2 mb-4 border border-white/20 dark:border-gray-700/30">
            <div className="px-2 pt-2 pb-3 space-y-1">
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
          </div>
        )}
      </div>
    </nav>
  );
};