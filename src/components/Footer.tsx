import React from 'react';
import { Github, Twitter, Instagram, Youtube, Heart, Crown } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { HomepageContent } from '../types';
import { initialHomepageContent } from '../utils/initialData';

export const Footer: React.FC = () => {
  const [content] = useLocalStorage<HomepageContent>('rws-homepage-content', initialHomepageContent);
  
  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-white/5 dark:bg-gray-900/20 backdrop-blur-md border-t border-white/10 dark:border-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10">
              <img 
                src="/image.png" 
                alt="Royal Warriors Squad" 
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <span>© All Rights Reserved</span>
              <span className="font-semibold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                Royal Warriors Squad
              </span>
              <span>— Created by</span>
              <span className="font-semibold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                Faizy
              </span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-yellow-500/20 dark:hover:bg-yellow-500/20 transition-all duration-300 hover:scale-110 group border border-transparent hover:border-yellow-500/30"
              >
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors duration-300" />
              </a>
            ))}
          </div>
        </div>

        {/* Royal Tagline */}
        <div className="mt-6 pt-6 border-t border-white/10 dark:border-gray-800/30 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <p className="text-xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              {content.tagline}
            </p>
            <Crown className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {content.taglineSubtext}
          </p>
        </div>
      </div>
    </footer>
  );
};