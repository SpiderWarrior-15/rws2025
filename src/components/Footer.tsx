import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, Youtube, Heart, Crown, Shield, FileText } from 'lucide-react';
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

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy', icon: Shield },
    { name: 'License', path: '/license', icon: FileText },
  ];

  return (
    <footer className="bg-white/5 dark:bg-gray-900/20 backdrop-blur-md border-t border-white/10 dark:border-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-sm border border-yellow-500/30">
                <img 
                  src="/image.png" 
                  alt="Royal Warriors Squad" 
                  className="w-full h-full object-contain filter drop-shadow-lg rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-2xl"></div>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  ROYAL WARRIORS
                </span>
                <div className="text-sm font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  SQUAD
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              An elite brotherhood where passion meets purpose and legends are born through creativity and technology.
            </p>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Legal</h3>
            <div className="space-y-2">
              {legalLinks.map(({ name, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors duration-300"
                >
                  <Icon className="w-4 h-4" />
                  <span>{name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Connect</h3>
            <div className="flex space-x-4">
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
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-white/10 dark:border-gray-800/30">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
              <span>© {new Date().getFullYear()} All Rights Reserved</span>
              <span className="font-semibold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                Royal Warriors Squad
              </span>
              <span>— Created by</span>
              <span className="font-semibold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                Faizy
              </span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            </div>

            {/* Royal Tagline */}
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <p className="text-sm font-medium bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                {content.tagline}
              </p>
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};