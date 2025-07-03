import React, { useState } from 'react';
import { Users, Settings, MessageSquare, Star, Crown, CheckCircle, XCircle, Clock, Edit, Save, X, Plus, Trash2, Eye, EyeOff, Shield, UserCheck, ToggleLeft, ToggleRight, ArrowUpDown, Brain, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { WarriorCard } from '../components/WarriorCard';
import { MarkingModal } from '../components/MarkingModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { UserAccount, MarkingCriteria, Mark, MarkingSummary, ContactMessage, HomepageContent, PuzzleAttempt, Puzzle } from '../types';
import { initialMarkingCriteria, initialHomepageContent, getScoreByDifficulty } from '../utils/initialData';

export const Admin: React.FC = () => {
  const { user, updateAccount } = useAuth();
  const [accounts, setAccounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [criteria, setCriteria] = useLocalStorage<MarkingCriteria[]>('rws-marking-criteria', initialMarkingCriteria);
  const [marks, setMarks] = useLocalStorage<Mark[]>('rws-marks', []);
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>('rws-messages', []);
  const [content, setContent] = useLocalStorage<HomepageContent>('rws-homepage-content', initialHomepageContent);
  const [attempts, setAttempts] = useLocalStorage<PuzzleAttempt[]>('rws-puzzle-attempts', []);
  const [puzzles] = useLocalStorage<Puzzle[]>('rws-puzzles', []);
  
  const [activeTab, setActiveTab] = useState<'accounts' | 'warriors' | 'criteria' | 'marks' | 'messages' | 'homepage' | 'puzzle-correction'>('accounts');
  const [selectedWarrior, setSelectedWarrior] = useState<UserAccount | null>(null);
  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [tempContent, setTempContent] = useState(content);
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    maxScore: 10,
    category: 'participation' as const
  });
  const [isAddingCriteria, setIsAddingCriteria] = useState(false);

  // Filter accounts
  const allAccounts = accounts.filter(acc => acc.email !== 'spiderwarrior15@gmail.com');
  const unreadMessages = messages.filter(msg => !msg.isRead);
  const pendingAttempts = attempts.filter(attempt => attempt.isCorrect === null);

  // Get user name from accounts
  const getUserName = (userId: string) => {
    const account = accounts.find(acc => acc.id === userId);
    return account?.name || 'Unknown User';
  };

  // Calculate marking summaries
  const calculateMarkingSummary = (warriorId: string): MarkingSummary => {
    const warriorMarks = marks.filter(m => m.warriorId === warriorId);
    const totalScore = warriorMarks.reduce((sum, mark) => sum + mark.score, 0);
    const averageScore = warriorMarks.length > 0 ? totalScore / warriorMarks.length : 0;
    
    const categoryScores: Record<string, number> = {};
    warriorMarks.forEach(mark => {
      const criterion = criteria.find(c => c.id === mark.criteriaId);
      if (criterion) {
        categoryScores[criterion.category] = (categoryScores[criterion.category] || 0) + mark.score;
      }
    });

    return {
      warriorId,
      totalScore,
      averageScore,
      markCount: warriorMarks.length,
      categoryScores,
      lastMarked: warriorMarks.length > 0 ? warriorMarks[warriorMarks.length - 1].markedAt : ''
    };
  };

  const handleRoleToggle = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    const newRole = account.role === 'Warrior' ? 'Commander' : 'Warrior';
    
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, role: newRole } : acc
    ));
    
    updateAccount(accountId, { role: newRole });
  };

  const handleMarkWarrior = (warrior: UserAccount) => {
    setSelectedWarrior(warrior);
    setIsMarkingModalOpen(true);
  };

  const handleSubmitMark = (mark: Omit<Mark, 'id' | 'markedAt'>) => {
    const newMark: Mark = {
      ...mark,
      id: Date.now().toString(),
      markedAt: new Date().toISOString()
    };
    setMarks([...marks, newMark]);
    setIsMarkingModalOpen(false);
    setSelectedWarrior(null);
  };

  const handleMarkMessageAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
  };

  const handleSaveContent = () => {
    setContent({
      ...tempContent,
      lastUpdated: new Date().toISOString(),
      updatedBy: user?.id || 'admin'
    });
    setEditingContent(false);
  };

  const handleAddCriteria = () => {
    if (!newCriteria.name.trim() || !newCriteria.description.trim()) return;

    const criteria: MarkingCriteria = {
      id: Date.now().toString(),
      ...newCriteria,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setCriteria(prev => [...prev, criteria]);
    setNewCriteria({
      name: '',
      description: '',
      maxScore: 10,
      category: 'participation'
    });
    setIsAddingCriteria(false);
  };

  const handleToggleCriteria = (criteriaId: string) => {
    setCriteria(criteria.map(c => 
      c.id === criteriaId ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleDeleteCriteria = (criteriaId: string) => {
    setCriteria(criteria.filter(c => c.id !== criteriaId));
    setMarks(marks.filter(m => m.criteriaId !== criteriaId));
  };

  const handlePuzzleCorrection = (attemptId: string, isCorrect: boolean) => {
    const attempt = attempts.find(a => a.id === attemptId);
    if (!attempt) return;

    const puzzle = puzzles.find(p => p.id === attempt.puzzleId);
    const score = isCorrect && puzzle ? getScoreByDifficulty(puzzle.difficulty) : 0;

    setAttempts(attempts.map(a => 
      a.id === attemptId 
        ? { 
            ...a, 
            isCorrect, 
            score,
            reviewedAt: new Date().toISOString(),
            reviewedBy: user?.id || 'admin'
          }
        : a
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'accounts', label: 'Account Management', icon: Users, count: allAccounts.length },
    { id: 'warriors', label: 'Warriors List', icon: Shield, count: allAccounts.length },
    { id: 'puzzle-correction', label: 'Puzzle Correction', icon: Brain, count: pendingAttempts.length },
    { id: 'criteria', label: 'Marking Criteria', icon: Star, count: criteria.filter(c => c.isActive).length },
    { id: 'marks', label: 'Warrior Marks', icon: Crown, count: marks.length },
    { id: 'messages', label: 'Contact Messages', icon: MessageSquare, count: unreadMessages.length },
    { id: 'homepage', label: 'Homepage Content', icon: Settings, count: 0 }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Rest of the component implementation... */}
      </div>
    </div>
  );
};