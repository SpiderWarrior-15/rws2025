import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Brain, 
  MessageCircle, 
  Calendar, 
  Star, 
  Settings, 
  Shield, 
  Activity,
  TrendingUp,
  Award,
  Crown,
  Zap,
  Target,
  BarChart3,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { WarriorCard } from '../components/WarriorCard';
import { MarkingModal } from '../components/MarkingModal';
import { FormBuilder } from '../components/FormBuilder';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { 
  UserAccount, 
  PuzzleAttempt, 
  MarkingCriteria, 
  Mark, 
  WarriorMember, 
  MarkingSummary,
  ChatMessage,
  Event,
  ContactMessage,
  CustomForm,
  FormSubmission
} from '../types';
import { initialMarkingCriteria } from '../utils/initialData';
import { format } from 'date-fns';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [accounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [attempts, setAttempts] = useLocalStorage<PuzzleAttempt[]>('rws-puzzle-attempts', []);
  const [criteria, setCriteria] = useLocalStorage<MarkingCriteria[]>('rws-marking-criteria', initialMarkingCriteria);
  const [marks, setMarks] = useLocalStorage<Mark[]>('rws-marks', []);
  const [messages] = useLocalStorage<ChatMessage[]>('rws-chat-messages', []);
  const [events] = useLocalStorage<Event[]>('rws-events', []);
  const [contactMessages] = useLocalStorage<ContactMessage[]>('rws-messages', []);
  const [forms, setForms] = useLocalStorage<CustomForm[]>('rws-forms', []);
  const [submissions] = useLocalStorage<FormSubmission[]>('rws-form-submissions', []);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'warriors' | 'puzzles' | 'marking' | 'forms'>('overview');
  const [selectedWarrior, setSelectedWarrior] = useState<WarriorMember | null>(null);
  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [selectedFormSubmissions, setSelectedFormSubmissions] = useState<string | null>(null);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    maxScore: 10,
    category: 'participation' as const
  });
  const [isAddingCriteria, setIsAddingCriteria] = useState(false);

  const isAdmin = user?.accountType === 'admin';

  // Calculate dashboard stats
  const stats = {
    totalWarriors: accounts.filter(acc => acc.status === 'approved').length,
    pendingApprovals: accounts.filter(acc => acc.status === 'pending').length,
    totalPuzzleAttempts: attempts.length,
    correctAttempts: attempts.filter(att => att.isCorrect === true).length,
    pendingReviews: attempts.filter(att => att.isCorrect === null).length,
    totalMessages: messages.length,
    totalEvents: events.length,
    unreadMessages: contactMessages.filter(msg => !msg.isRead).length,
    totalForms: forms.length,
    activeForms: forms.filter(f => f.isActive).length,
    totalSubmissions: submissions.length
  };

  // Get warrior members with marking summaries
  const getWarriorMembers = (): WarriorMember[] => {
    return accounts
      .filter(acc => acc.status === 'approved')
      .map(acc => ({
        id: acc.id,
        name: acc.name,
        email: acc.email,
        joinDate: acc.createdAt,
        avatar: acc.avatar,
        isActive: true,
        provider: acc.provider,
        accountType: acc.accountType,
        role: acc.role
      }));
  };

  const getMarkingSummary = (warriorId: string): MarkingSummary => {
    const warriorMarks = marks.filter(m => m.warriorId === warriorId);
    const totalScore = warriorMarks.reduce((sum, mark) => sum + mark.score, 0);
    const averageScore = warriorMarks.length > 0 ? totalScore / warriorMarks.length : 0;
    
    const categoryScores: Record<string, number> = {};
    criteria.forEach(c => {
      const categoryMarks = warriorMarks.filter(m => {
        const markCriteria = criteria.find(cr => cr.id === m.criteriaId);
        return markCriteria?.category === c.category;
      });
      if (categoryMarks.length > 0) {
        categoryScores[c.category] = categoryMarks.reduce((sum, mark) => sum + mark.score, 0);
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

  const handleApproveAccount = (accountId: string) => {
    // This would be handled by the auth system
  };

  const handleRejectAccount = (accountId: string, reason: string) => {
    // This would be handled by the auth system
  };

  const handleReviewPuzzleAttempt = (attemptId: string, isCorrect: boolean) => {
    setAttempts(attempts.map(att => 
      att.id === attemptId 
        ? { 
            ...att, 
            isCorrect,
            reviewedAt: new Date().toISOString(),
            reviewedBy: user?.username || 'admin'
          }
        : att
    ));
  };

  const handleMarkWarrior = (warrior: WarriorMember) => {
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

  const handleAddCriteria = () => {
    if (!newCriteria.name || !newCriteria.description) return;

    const criteria_item: MarkingCriteria = {
      id: Date.now().toString(),
      ...newCriteria,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setCriteria([...criteria, criteria_item]);
    setNewCriteria({ name: '', description: '', maxScore: 10, category: 'participation' });
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

  const handleSaveForm = (formData: Omit<CustomForm, 'id' | 'createdAt' | 'createdBy'>) => {
    if (editingForm) {
      setForms(forms.map(f => 
        f.id === editingForm.id 
          ? { ...f, ...formData, updatedAt: new Date().toISOString() }
          : f
      ));
    } else {
      const newForm: CustomForm = {
        ...formData,
        id: Date.now().toString(),
        createdBy: user?.username || 'admin',
        createdAt: new Date().toISOString()
      };
      setForms([...forms, newForm]);
    }
    setIsFormBuilderOpen(false);
    setEditingForm(null);
  };

  const handleDeleteForm = (formId: string) => {
    setForms(forms.filter(f => f.id !== formId));
  };

  const handleToggleForm = (formId: string) => {
    setForms(forms.map(f => 
      f.id === formId ? { ...f, isActive: !f.isActive } : f
    ));
  };

  const exportSubmissions = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    const formSubmissions = submissions.filter(s => s.formId === formId);
    
    if (!form || formSubmissions.length === 0) return;

    const csvContent = [
      // Header
      ['Submitted At', 'User Name', 'User Email', ...form.fields.map(f => f.label)].join(','),
      // Data rows
      ...formSubmissions.map(sub => [
        format(new Date(sub.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
        sub.userName,
        sub.userEmail,
        ...form.fields.map(f => {
          const value = sub.responses[f.id];
          return Array.isArray(value) ? value.join('; ') : String(value || '');
        })
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const warriors = getWarriorMembers();
  const pendingAttempts = attempts.filter(att => att.isCorrect === null);
  const pendingAccounts = accounts.filter(acc => acc.status === 'pending');

  const tabItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'warriors', name: 'Warriors', icon: Users },
    { id: 'puzzles', name: 'Puzzle Reviews', icon: Brain },
    { id: 'marking', name: 'Marking System', icon: Star },
    { id: 'forms', name: 'Form Management', icon: FileText }
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to access this panel.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600/20 to-purple-600/20 backdrop-blur-xl border border-red-500/30 mb-8 shadow-lg shadow-red-500/10">
            <Crown className="w-6 h-6 text-red-400 mr-3 animate-pulse" />
            <span className="text-lg font-semibold text-red-400">Command Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Admin Panel
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Command and control center for the Royal Warriors Squad
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-2 shadow-lg min-w-max">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard className="p-6 text-center border-blue-500/20 hover:border-blue-400/40 transition-all duration-500">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-400 mb-1">{stats.totalWarriors}</div>
                <div className="text-sm text-gray-400">Active Warriors</div>
                {stats.pendingApprovals > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    {stats.pendingApprovals} pending
                  </div>
                )}
              </GlassCard>

              <GlassCard className="p-6 text-center border-purple-500/20 hover:border-purple-400/40 transition-all duration-500">
                <Brain className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-400 mb-1">{stats.totalPuzzleAttempts}</div>
                <div className="text-sm text-gray-400">Puzzle Attempts</div>
                <div className="text-xs text-green-400 mt-1">
                  {stats.correctAttempts} correct
                </div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-green-500/20 hover:border-green-400/40 transition-all duration-500">
                <FileText className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.totalForms}</div>
                <div className="text-sm text-gray-400">Total Forms</div>
                <div className="text-xs text-blue-400 mt-1">
                  {stats.totalSubmissions} submissions
                </div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-500">
                <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.totalEvents}</div>
                <div className="text-sm text-gray-400">Events Created</div>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pending Reviews */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                  Pending Reviews ({stats.pendingReviews})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pendingAttempts.slice(0, 5).map(attempt => {
                    const warrior = accounts.find(acc => acc.id === attempt.userId);
                    return (
                      <div key={attempt.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {warrior?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Answer: {attempt.userAnswer}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReviewPuzzleAttempt(attempt.id, true)}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReviewPuzzleAttempt(attempt.id, false)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Recent Form Submissions */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-500" />
                  Recent Submissions ({stats.totalSubmissions})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {submissions.slice(-5).reverse().map(submission => {
                    const form = forms.find(f => f.id === submission.formId);
                    return (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {form?.title || 'Unknown Form'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            by {submission.userName}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(submission.submittedAt), 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Warriors Tab */}
        {activeTab === 'warriors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warriors.map(warrior => (
                <WarriorCard
                  key={warrior.id}
                  warrior={warrior}
                  summary={getMarkingSummary(warrior.id)}
                  onMark={handleMarkWarrior}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Puzzle Reviews Tab */}
        {activeTab === 'puzzles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Puzzle Attempt Reviews
              </h3>
              <div className="space-y-4">
                {pendingAttempts.map(attempt => {
                  const warrior = accounts.find(acc => acc.id === attempt.userId);
                  return (
                    <div key={attempt.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 dark:text-white mb-1">
                            {warrior?.name || 'Unknown Warrior'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                          </div>
                          <div className="text-gray-800 dark:text-white">
                            <strong>Answer:</strong> {attempt.userAnswer}
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleReviewPuzzleAttempt(attempt.id, true)}
                            className="bg-green-500/20 text-green-400 border-green-500/30"
                          >
                            Approve
                          </AnimatedButton>
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            icon={XCircle}
                            onClick={() => handleReviewPuzzleAttempt(attempt.id, false)}
                            className="bg-red-500/20 text-red-400 border-red-500/30"
                          >
                            Reject
                          </AnimatedButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {pendingAttempts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending puzzle reviews
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Marking System Tab */}
        {activeTab === 'marking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Add Criteria Button */}
            <div className="flex justify-center">
              <AnimatedButton
                variant="primary"
                icon={Plus}
                onClick={() => setIsAddingCriteria(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Add Marking Criteria
              </AnimatedButton>
            </div>

            {/* Add Criteria Form */}
            {isAddingCriteria && (
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Add New Marking Criteria
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newCriteria.name}
                      onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      placeholder="Criteria name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Score
                    </label>
                    <input
                      type="number"
                      value={newCriteria.maxScore}
                      onChange={(e) => setNewCriteria({ ...newCriteria, maxScore: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newCriteria.category}
                    onChange={(e) => setNewCriteria({ ...newCriteria, category: e.target.value as any })}
                    className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  >
                    <option value="participation">Participation</option>
                    <option value="creativity">Creativity</option>
                    <option value="technical">Technical</option>
                    <option value="leadership">Leadership</option>
                    <option value="collaboration">Collaboration</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCriteria.description}
                    onChange={(e) => setNewCriteria({ ...newCriteria, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                    rows={3}
                    placeholder="Describe this marking criteria..."
                  />
                </div>
                <div className="flex space-x-4">
                  <AnimatedButton
                    variant="primary"
                    onClick={handleAddCriteria}
                  >
                    Add Criteria
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => {
                      setIsAddingCriteria(false);
                      setNewCriteria({ name: '', description: '', maxScore: 10, category: 'participation' });
                    }}
                  >
                    Cancel
                  </AnimatedButton>
                </div>
              </GlassCard>
            )}

            {/* Criteria List */}
            <div className="grid md:grid-cols-2 gap-6">
              {criteria.map(criteriaItem => (
                <GlassCard key={criteriaItem.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        {criteriaItem.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {criteriaItem.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-purple-400">
                          Max Score: {criteriaItem.maxScore}
                        </span>
                        <span className="text-blue-400 capitalize">
                          {criteriaItem.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleCriteria(criteriaItem.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          criteriaItem.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {criteriaItem.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteCriteria(criteriaItem.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Add Form Button */}
            <div className="flex justify-center">
              <AnimatedButton
                variant="primary"
                icon={Plus}
                onClick={() => setIsFormBuilderOpen(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600"
              >
                Create New Form
              </AnimatedButton>
            </div>

            {/* Forms List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map(form => {
                const formSubmissions = submissions.filter(s => s.formId === form.id);
                return (
                  <GlassCard key={form.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        form.category === 'event' ? 'bg-purple-500/20 text-purple-400' :
                        form.category === 'survey' ? 'bg-blue-500/20 text-blue-400' :
                        form.category === 'feedback' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {form.category.toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleForm(form.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            form.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {form.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingForm(form);
                            setIsFormBuilderOpen(true);
                          }}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteForm(form.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                      {form.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {form.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{form.fields.length} fields</span>
                      <span>{formSubmissions.length} submissions</span>
                    </div>

                    <div className="flex space-x-2">
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedFormSubmissions(form.id)}
                        className="flex-1"
                      >
                        View Responses
                      </AnimatedButton>
                      {formSubmissions.length > 0 && (
                        <AnimatedButton
                          variant="secondary"
                          size="sm"
                          icon={Download}
                          onClick={() => exportSubmissions(form.id)}
                        >
                          Export
                        </AnimatedButton>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {forms.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                  No forms created yet
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Create your first form to start collecting responses from warriors
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Form Builder Modal */}
        {isFormBuilderOpen && (
          <FormBuilder
            isOpen={isFormBuilderOpen}
            onClose={() => {
              setIsFormBuilderOpen(false);
              setEditingForm(null);
            }}
            onSave={handleSaveForm}
            editingForm={editingForm}
          />
        )}

        {/* Form Submissions Modal */}
        {selectedFormSubmissions && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Form Submissions
                  </h2>
                  <button
                    onClick={() => setSelectedFormSubmissions(null)}
                    className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {(() => {
                  const form = forms.find(f => f.id === selectedFormSubmissions);
                  const formSubmissions = submissions.filter(s => s.formId === selectedFormSubmissions);
                  
                  if (!form) return null;

                  return (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {form.title} - {formSubmissions.length} submissions
                        </h3>
                        {formSubmissions.length > 0 && (
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            icon={Download}
                            onClick={() => exportSubmissions(form.id)}
                          >
                            Export CSV
                          </AnimatedButton>
                        )}
                      </div>

                      {formSubmissions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No submissions yet
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="text-left p-3 text-gray-300">Submitted</th>
                                <th className="text-left p-3 text-gray-300">User</th>
                                {form.fields.map(field => (
                                  <th key={field.id} className="text-left p-3 text-gray-300">
                                    {field.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {formSubmissions.map(submission => (
                                <tr key={submission.id} className="border-b border-gray-800">
                                  <td className="p-3 text-gray-400">
                                    {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                                  </td>
                                  <td className="p-3 text-gray-300">
                                    {submission.userName}
                                  </td>
                                  {form.fields.map(field => (
                                    <td key={field.id} className="p-3 text-gray-300">
                                      {(() => {
                                        const value = submission.responses[field.id];
                                        if (Array.isArray(value)) {
                                          return value.join(', ');
                                        }
                                        return String(value || '-');
                                      })()}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Marking Modal */}
        {selectedWarrior && (
          <MarkingModal
            isOpen={isMarkingModalOpen}
            onClose={() => {
              setIsMarkingModalOpen(false);
              setSelectedWarrior(null);
            }}
            warrior={selectedWarrior}
            criteria={criteria.filter(c => c.isActive)}
            onSubmitMark={handleSubmitMark}
          />
        )}
      </div>
    </div>
  );
};