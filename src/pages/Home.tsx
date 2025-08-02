import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Zap, Target, Sparkles, Crown, Star, Shield, Rocket, Search, ImageIcon, PhoneIcon as PhotoIcon, BookOpen } from 'lucide-react';

import { AnimatedButton } from '../components/AnimatedButton';
import { GlassCard } from '../components/GlassCard';
import { TypewriterText } from '../components/TypewriterText';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../contexts/ThemeContext';
import { HomepageContent, UserAccount } from '../types';
import { initialHomepageContent } from '../utils/initialData';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [content] = useLocalStorage<HomepageContent>('rws-homepage-content', initialHomepageContent);
  const [accounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [showTypewriter, setShowTypewriter] = useState(false);

  // Calculate actual stats
  const totalWarriors = accounts.filter(account => account.status === 'approved').length;

  useEffect(() => {
    const timer = setTimeout(() => setShowTypewriter(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Elite Community',
      description: 'Join a brotherhood of passionate warriors united by purpose',
      color:
        theme === 'royal'
          ? 'from-purple-600 to-blue-600'
          : theme === 'cyber'
          ? 'from-cyan-500 to-green-500'
          : 'from-gray-600 to-gray-800',
    },
    {
      icon: Zap,
      title: 'Royal Power',
      description: 'Unleash your potential with cutting-edge resources and training',
      color:
        theme === 'royal'
          ? 'from-blue-600 to-purple-600'
          : theme === 'cyber'
          ? 'from-green-500 to-cyan-500'
          : 'from-gray-700 to-gray-900',
    },
    {
      icon: Target,
      title: 'Noble Purpose',
      description: 'Find your mission and make a meaningful impact on the world',
      color:
        theme === 'royal'
          ? 'from-purple-600 to-pink-600'
          : theme === 'cyber'
          ? 'from-cyan-500 to-blue-500'
          : 'from-gray-600 to-black',
    },
  ];

  const stats = [
    { value: totalWarriors.toString(), label: 'Elite Warriors', icon: Shield },
    { value: '50+', label: 'Royal Missions', icon: Star },
    { value: '25+', label: 'Legendary Projects', icon: Rocket },
    { value: '∞', label: 'Royal Passion', icon: Crown },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div
          className={`absolute inset-0 ${
            theme === 'royal'
              ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900'
              : theme === 'cyber'
              ? 'bg-gradient-to-br from-black via-cyan-900 to-green-900'
              : 'bg-gradient-to-br from-black via-gray-900 to-gray-800'
          }`}
        >
          <div
            className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23FFD700%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"
            aria-hidden="true"
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-72 h-72 rounded-full blur-3xl ${
                theme === 'royal' ? 'bg-purple-500/20' : theme === 'cyber' ? 'bg-cyan-500/20' : 'bg-gray-500/20'
              }`}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 2,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8 inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-md border border-yellow-500/30"
          >
            <Crown className="w-6 h-6 text-yellow-400 mr-3 animate-pulse" />
            <span className="text-lg font-medium text-yellow-300">Welcome to the Royal Court</span>
          </motion.div>

          {/* Logo Integration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-8 flex justify-center relative"
          >
            <motion.div
              className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 backdrop-blur-lg border-2 border-yellow-500/40 relative"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 20px 40px rgba(234, 179, 8, 0.3)',
                  '0 25px 50px rgba(234, 179, 8, 0.5)',
                  '0 20px 40px rgba(234, 179, 8, 0.3)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <img src="/image.png" alt="Royal Warriors Squad" className="w-full h-full object-contain filter drop-shadow-2xl rounded-3xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-600/20 rounded-3xl"></div>
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-yellow-500/20"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-3xl blur opacity-20 animate-pulse"></div>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              ROYAL WARRIORS
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent">SQUAD</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            {showTypewriter ? (
              <TypewriterText
                text="Unleashing Passion, Power & Purpose in an elite brotherhood where creativity meets technology and legends are born"
                speed={30}
              />
            ) : (
              <span className="opacity-0">Loading...</span>
            )}
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <AnimatedButton
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/signup')}
              className={`bg-gradient-to-r ${
                theme === 'royal'
                  ? 'from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600'
                  : theme === 'cyber'
                  ? 'from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600'
                  : 'from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900'
              } text-black font-bold shadow-2xl`}
            >
              Join the Squad
            </AnimatedButton>

            <AnimatedButton
              variant="secondary"
              size="lg"
              onClick={() => navigate('/events')}
              className={`border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20`}
              icon={Sparkles}
            >
              Explore Missions
            </AnimatedButton>

            <AnimatedButton
              variant="secondary"
              size="lg"
              onClick={() => navigate('/music-hub')}
              className={`border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20 flex items-center gap-2`}
              icon={Music}
            >
              Music Hub
            </AnimatedButton>

            <AnimatedButton
              variant="secondary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className={`border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20 flex items-center gap-2`}
              icon={User}
            >
              Dashboard
            </AnimatedButton>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlassCard key={index} className="p-8 text-center border-yellow-500/20">
                  <motion.div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 shadow-2xl`}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-yellow-300 mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                </GlassCard>
              );
            })}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden="true"
        >
          <div
            className={`w-6 h-10 border-2 ${
              theme === 'royal' ? 'border-purple-400/50' : theme === 'cyber' ? 'border-cyan-400/50' : 'border-gray-400/50'
            } rounded-full flex justify-center`}
          >
            <motion.div
              className={`w-1 h-3 ${
                theme === 'royal' ? 'bg-purple-400/70' : theme === 'cyber' ? 'bg-cyan-400/70' : 'bg-gray-400/70'
              } rounded-full mt-2`}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-yellow-500/5 dark:to-yellow-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
              The Royal Legacy
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Royal Warriors Squad is more than just a community – we're an elite brotherhood of creative minds, tech innovators,
              and passionate individuals united by our shared vision of conquering the digital realm.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <GlassCard className="text-center p-6 border-yellow-500/20">
                    <Icon
                      className={`w-8 h-8 mx-auto mb-4 ${
                        theme === 'royal' ? 'text-purple-500' : theme === 'cyber' ? 'text-cyan-400' : 'text-gray-400'
                      }`}
                    />
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
