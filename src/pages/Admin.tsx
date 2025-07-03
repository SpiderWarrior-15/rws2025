import React, { useState } from 'react';
import {
  Users,
  Settings,
  MessageSquare,
  Star,
  Crown,
  Brain,
  Shield,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import {
  UserAccount,
  MarkingCriteria,
  Mark,
  MarkingSummary,
  ContactMessage,
  HomepageContent,
  PuzzleAttempt,
  Puzzle,
} from '../types';
import {
  initialMarkingCriteria,
  initialHomepageContent,
  getScoreByDifficulty,
} from '../utils/initialData';

export const Admin: React.FC = () => {
  const { user, updateAccount } = useAuth();
  const [accounts, setAccounts] = useLocalStorage<UserAccount[]>(
    'rws-accounts',
    []
  );
  const [criteria, setCriteria] = useLocalStorage<MarkingCriteria[]>(
    'rws-marking-criteria',
    initialMarkingCriteria
  );
  const [marks, setMarks] = useLocalStorage<Mark[]>('rws-marks', []);
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>(
    'rws-messages',
    []
  );
  const [content, setContent] = useLocalStorage<HomepageContent>(
    'rws-homepage-content',
    initialHomepageContent
  );
  const [attempts, setAttempts] = useLocalStorage<PuzzleAttempt[]>(
    'rws-puzzle-attempts',
    []
  );
  const [puzzles] = useLocalStorage<Puzzle[]>('rws-puzzles', []);

  const [activeTab, setActiveTab] = useState<
    | 'accounts'
    | 'warriors'
    | 'criteria'
    | 'marks'
    | 'messages'
    | 'homepage'
    | 'puzzle-correction'
  >('accounts');

  // Filter accounts
  const allAccounts = accounts.filter(
    (acc) => acc.email !== 'spiderwarrior15@gmail.com'
  );
  const unreadMessages = messages.filter((msg) => !msg.isRead);
  const pendingAttempts = attempts.filter((attempt) => attempt.isCorrect === null);

  const handleRoleToggle = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (!account) return;

    const newRole = account.role === 'Warrior' ? 'Commander' : 'Warrior';

    setAccounts(
      accounts.map((acc) =>
        acc.id === accountId ? { ...acc, role: newRole } : acc
      )
    );

    updateAccount(accountId, { role: newRole });
  };

  const handleMarkMessageAsRead = (messageId: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  const tabs = [
    {
      id: 'accounts',
      label: 'Account Management',
      icon: Users,
      count: allAccounts.length,
    },
    {
      id: 'warriors',
      label: 'Warriors List',
      icon: Shield,
      count: allAccounts.length,
    },
    {
      id: 'puzzle-correction',
      label: 'Puzzle Correction',
      icon: Brain,
      count: pendingAttempts.length,
    },
    {
      id: 'criteria',
      label: 'Marking Criteria',
      icon: Star,
      count: criteria.filter((c) => c.isActive).length,
    },
    { id: 'marks', label: 'Warrior Marks', icon: Crown, count: marks.length },
    {
      id: 'messages',
      label: 'Contact Messages',
      icon: MessageSquare,
      count: unreadMessages.length,
    },
    { id: 'homepage', label: 'Homepage Content', icon: Settings, count: 0 },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <nav className="flex space-x-4 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-md text-sm font-medium mb-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-blue-500 hover:text-white'
              } flex items-center space-x-2`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-1 text-xs bg-white text-blue-600 rounded-full px-2 py-0.5 font-semibold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="bg-white/10 rounded-lg p-6 shadow-lg min-h-[300px] text-white">
          {/* Accounts */}
          {activeTab === 'accounts' && (
            <div>
              {allAccounts.length === 0 && (
                <p className="text-gray-300">No accounts found.</p>
              )}
              {allAccounts.map((acc) => (
                <GlassCard
                  key={acc.id}
                  className="mb-3 p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-lg">{acc.name}</p>
                    <p className="text-sm text-gray-300">{acc.email}</p>
                    <p className="text-sm text-gray-400 italic">Role: {acc.role}</p>
                  </div>
                  <button
                    onClick={() => handleRoleToggle(acc.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Toggle Role
                  </button>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <div>
              {unreadMessages.length === 0 && (
                <p className="text-gray-300">No unread messages.</p>
              )}
              {unreadMessages.map((msg) => (
                <GlassCard
                  key={msg.id}
                  className="mb-3 p-4"
                >
                  <p>
                    <strong>From:</strong> {msg.name} ({msg.email})
                  </p>
                  <p className="mt-2">{msg.message}</p>
                  <div className="mt-3 space-x-3">
                    <button
                      onClick={() => handleMarkMessageAsRead(msg.id)}
                      className="text-green-500 hover:underline"
                    >
                      Mark as Read
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* TODO: Add other tabs UI similarly */}
          {(activeTab === 'warriors' ||
            activeTab === 'criteria' ||
            activeTab === 'marks' ||
            activeTab === 'homepage' ||
            activeTab === 'puzzle-correction') && (
            <p className="text-gray-300 italic">
              This section is under construction. Coming soon!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
