import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ContactMessage } from '../types';

export const Contact: React.FC = () => {
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>('rws-messages', []);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      const newMessage: ContactMessage = {
        id: Date.now().toString(),
        ...formData,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      setMessages([...messages, newMessage]);
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      info: 'warriors@rws.com',
      description: 'Send us a message anytime'
    },
    {
      icon: Phone,
      title: 'Phone',
      info: '+1 (555) 123-4567',
      description: 'Call us during business hours'
    },
    {
      icon: MapPin,
      title: 'Location',
      info: 'Innovation District',
      description: 'Where creativity meets technology'
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <Mail className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Get In Touch</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Ready to join the Royal Warriors Squad or have questions? We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Send us a Message
            </h2>
            
            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Message sent successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white transition-all duration-300"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white transition-all duration-300"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none transition-all duration-300"
                  rows={6}
                  placeholder="Tell us about yourself or ask us anything..."
                  required
                />
              </div>

              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                icon={Send}
                className="w-full"
              >
                Send Message
              </AnimatedButton>
            </form>
          </GlassCard>

          {/* Contact Information */}
          <div className="space-y-6">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Get in Touch
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Join our community of passionate warriors who are shaping the future through 
                creativity, technology, and collaboration. Whether you're looking to connect, 
                contribute, or just curious about what we do, we're here to help.
              </p>

              <div className="space-y-6">
                {contactInfo.map((item) => (
                  <div key={item.title} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-purple-600 dark:text-purple-400 font-medium">
                        {item.info}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Community Stats */}
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Join Our Growing Community
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Warriors</div>
                </div>
                <div className="text-center p-4 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Events Hosted</div>
                </div>
                <div className="text-center p-4 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                  <div className="text-2xl font-bold text-teal-600 mb-2">25+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Projects Launched</div>
                </div>
                <div className="text-center p-4 bg-white/5 dark:bg-gray-800/20 rounded-xl">
                  <div className="text-2xl font-bold text-pink-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Community Support</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};