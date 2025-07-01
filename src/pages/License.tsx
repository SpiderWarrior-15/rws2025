import React from 'react';
import { FileText, Code, Users, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const License: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <FileText className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Terms & Licensing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            License Agreement
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Terms of use and licensing information for Royal Warriors Squad
          </p>
        </div>

        <GlassCard className="p-8 space-y-8">
          {/* License Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Code className="w-6 h-6 mr-2 text-purple-500" />
              MIT License
            </h2>
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
              <pre className="text-green-400 text-sm leading-relaxed overflow-x-auto">
{`MIT License

Copyright (c) ${new Date().getFullYear()} Royal Warriors Squad

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
              </pre>
            </div>
          </section>

          {/* What This Means */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-500" />
              What This Means
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  You Can
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium text-gray-800 dark:text-white">Use</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Use the software for any purpose</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium text-gray-800 dark:text-white">Modify</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Change and adapt the code</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium text-gray-800 dark:text-white">Distribute</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Share copies with others</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-medium text-gray-800 dark:text-white">Sell</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Use in commercial projects</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  You Must
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <h4 className="font-medium text-gray-800 dark:text-white">Include License</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Include the original license in copies</p>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <h4 className="font-medium text-gray-800 dark:text-white">Include Copyright</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Include the copyright notice</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-yellow-500" />
              Platform Terms of Use
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Community Guidelines</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                  <li>• Be respectful to all community members</li>
                  <li>• No harassment, spam, or inappropriate content</li>
                  <li>• Follow fair play rules in puzzles and competitions</li>
                  <li>• Respect intellectual property rights</li>
                </ul>
              </div>
              
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Account Responsibilities</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                  <li>• Provide accurate information during registration</li>
                  <li>• Keep your account credentials secure</li>
                  <li>• Report any security issues promptly</li>
                  <li>• Use the platform in accordance with its intended purpose</li>
                </ul>
              </div>
              
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Content Policy</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                  <li>• You retain rights to content you create</li>
                  <li>• Grant us license to display your content on the platform</li>
                  <li>• No illegal, harmful, or offensive content</li>
                  <li>• Respect others' privacy and personal information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Third-Party Licenses */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Third-Party Licenses</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This project uses several open-source libraries and frameworks:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">React</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">MIT License - Facebook, Inc.</p>
              </div>
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Tailwind CSS</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">MIT License - Tailwind Labs</p>
              </div>
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Lucide React</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">ISC License - Lucide Contributors</p>
              </div>
              <div className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Vite</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">MIT License - Evan You</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Questions?</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about this license or need clarification on usage terms, 
              please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
              <p className="text-gray-800 dark:text-white font-medium">legal@royalwarriorssquad.com</p>
            </div>
          </section>
        </GlassCard>
      </div>
    </div>
  );
};