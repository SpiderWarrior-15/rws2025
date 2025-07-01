import React from 'react';
import { Shield, Eye, Lock, Database, UserCheck, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <Shield className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Your Privacy Matters</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            How we protect and handle your personal information
          </p>
        </div>

        <GlassCard className="p-8 space-y-8">
          {/* Last Updated */}
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Last updated: {new Date().toLocaleDateString()}
          </div>

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-2 text-purple-500" />
              Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Welcome to Royal Warriors Squad. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-blue-500" />
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Personal Information</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Name and email address</li>
                  <li>• WhatsApp number for communication</li>
                  <li>• Date of birth and gender</li>
                  <li>• Location (city and country)</li>
                  <li>• Profile picture (optional)</li>
                </ul>
              </div>
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Activity Data</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Puzzle attempts and scores</li>
                  <li>• Chat messages and interactions</li>
                  <li>• Event participation</li>
                  <li>• Platform usage statistics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <UserCheck className="w-6 h-6 mr-2 text-green-500" />
              How We Use Your Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Platform Features</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                  <li>• Provide access to puzzles and leaderboards</li>
                  <li>• Enable chat and community features</li>
                  <li>• Track progress and achievements</li>
                </ul>
              </div>
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Communication</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                  <li>• Send event notifications</li>
                  <li>• Respond to support requests</li>
                  <li>• Share community updates</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-yellow-500" />
              Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We implement appropriate security measures to protect your personal information:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Encryption</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">All data is encrypted in transit and at rest</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-lg border border-blue-500/20">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Access Control</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Limited access to authorized personnel only</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-teal-500/10 to-green-500/10 rounded-lg border border-teal-500/20">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Regular Audits</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Continuous monitoring and security reviews</p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
              Your Rights
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Access</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Request a copy of your personal data</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Correction</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update or correct your information</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Deletion</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Request deletion of your account and data</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Portability</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Export your data in a readable format</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
              <p className="text-gray-800 dark:text-white font-medium">privacy@royalwarriorssquad.com</p>
            </div>
          </section>
        </GlassCard>
      </div>
    </div>
  );
};