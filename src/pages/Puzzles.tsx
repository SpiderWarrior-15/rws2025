import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Brain, Trophy, Crown, Star, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useSounds } from '../hooks/useSounds';
import { Puzzle, PuzzleAttempt, PuzzleScore, UserAccount } from '../types';
import { initialPuzzles, getScoreByDifficulty, getCurrentWeek } from '../utils/initialData';
import { autoGeneratePuzzles } from '../utils/puzzleGenerator';

export const Puzzles: React.FC = () => {
  const { user } = useAuth();
  const { playSound } = useSounds();
  const [accounts] = useLocalStorage<UserAccount[]>('rws-accounts', []);
  const [puzzles, setPuzzles] = useLocalStorage<Puzzle[]>('rws-puzzles', initialPuzzles);
  const [attempts, setAttempts] = useLocalStorage<PuzzleAttempt[]>('rws-puzzle-attempts', []);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<Puzzle | null>(null);
  const [activeTab, setActiveTab] = useState<'puzzles' | 'leaderboard'>('puzzles');
  const [newPuzzle, setNewPuzzle] = useState({ 
    question: '', 
    answer: '', 
    difficulty: 'medium' as const 
  });

  const isAdmin = user?.accountType === 'admin';

  // Auto-generate puzzles on component mount and weekly
  useEffect(() => {
    const currentWeek = getCurrentWeek();
    const currentYear = new Date().getFullYear();
    
    // Check if we have puzzles for the current week
    const currentWeekPuzzles = puzzles.filter(p => 
      p.weekNumber === currentWeek && p.year === currentYear
    );
    
    // If no puzzles for current week, generate some
    if (currentWeekPuzzles.length === 0) {
      console.log('No puzzles for current week, generating new ones...');
      const newPuzzles = autoGeneratePuzzles(puzzles, currentWeek, currentYear);
      if (newPuzzles.length > 0) {
        setPuzzles([...puzzles, ...newPuzzles]);
        playSound('success');
      }
    }
  }, [puzzles, setPuzzles, playSound]);

  // Get user name from accounts
  const getUserName = (userId: string) => {
    const account = accounts.find(acc => acc.id === userId);
    return account?.name || 'Unknown User';
  };

  // Calculate leaderboard
  const calculateLeaderboard = (): PuzzleScore[] => {
    const userScores: Record<string, PuzzleScore> = {};
    const currentWeek = getCurrentWeek();
    const currentYear = new Date().getFullYear();

    attempts.forEach(attempt => {
      if (attempt.isCorrect === true) {
        const puzzle = puzzles.find(p => p.id === attempt.puzzleId);
        if (!puzzle) return;

        const score = getScoreByDifficulty(puzzle.difficulty);
        const isCurrentWeek = puzzle.weekNumber === currentWeek && puzzle.year === currentYear;

        if (!userScores[attempt.userId]) {
          userScores[attempt.userId] = {
            userId: attempt.userId,
            userName: getUserName(attempt.userId),
            totalScore: 0,
            weeklyScore: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            lastActivity: attempt.submittedAt,
            rank: 0
          };
        }

        userScores[attempt.userId].totalScore += score;
        if (isCurrentWeek) {
          userScores[attempt.userId].weeklyScore += score;
        }
        userScores[attempt.userId].correctAnswers++;
        userScores[attempt.userId].lastActivity = attempt.submittedAt;
      }
    });

    // Count total attempts
    attempts.forEach(attempt => {
      if (userScores[attempt.userId]) {
        userScores[attempt.userId].totalAttempts++;
      }
    });

    // Convert to array and sort by total score
    const leaderboard = Object.values(userScores)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((score, index) => ({ ...score, rank: index + 1 }));

    return leaderboard;
  };

  const handleGenerateNewPuzzles = () => {
    const currentWeek = getCurrentWeek();
    const currentYear = new Date().getFullYear();
    
    const newPuzzles = autoGeneratePuzzles(puzzles, currentWeek, currentYear);
    if (newPuzzles.length > 0) {
      setPuzzles([...puzzles, ...newPuzzles]);
      playSound('success');
      alert(`Generated ${newPuzzles.length} new puzzles!`);
    } else {
      playSound('error');
      alert('No new puzzles available. All puzzles have been used!');
    }
  };

  const handleSubmitAnswer = (puzzleId: string) => {
    if (!user) return;

    const userAnswer = userAnswers[puzzleId]?.toLowerCase().trim();
    if (!userAnswer) return;

    const puzzle = puzzles.find(p => p.id === puzzleId);
    if (!puzzle) return;

    // Check if user already has a correct answer for this puzzle
    const existingCorrectAttempt = attempts.find(
      a => a.puzzleId === puzzleId && a.userId === user.id && a.isCorrect === true
    );

    if (existingCorrectAttempt) {
      playSound('error');
      alert('You have already solved this puzzle!');
      return;
    }

    const isAutoCorrect = userAnswer === puzzle.answer.toLowerCase().trim();
    const score = isAutoCorrect ? getScoreByDifficulty(puzzle.difficulty) : 0;

    const newAttempt: PuzzleAttempt = {
      id: Date.now().toString(),
      puzzleId,
      userId: user.id,
      userAnswer,
      isCorrect: isAutoCorrect ? true : null, // null means pending admin review
      submittedAt: new Date().toISOString(),
      score
    };

    setAttempts([...attempts, newAttempt]);
    setUserAnswers({ ...userAnswers, [puzzleId]: '' });

    if (isAutoCorrect) {
      playSound('success');
      alert(`Correct! You earned ${score} points!`);
    } else {
      playSound('click');
      alert('Answer submitted for admin review!');
    }
  };

  const handleAddPuzzle = () => {
    if (!newPuzzle.question || !newPuzzle.answer) return;

    const puzzle: Puzzle = {
      id: Date.now().toString(),
      ...newPuzzle,
      answer: newPuzzle.answer.toLowerCase().trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      weekNumber: getCurrentWeek(),
      year: new Date().getFullYear(),
      autoGenerated: false
    };

    setPuzzles([...puzzles, puzzle]);
    setNewPuzzle({ question: '', answer: '', difficulty: 'medium' });
    setIsAddingNew(false);
    playSound('success');
  };

  const handleEditPuzzle = (puzzle: Puzzle) => {
    if (editingPuzzle?.id === puzzle.id) {
      const updatedPuzzles = puzzles.map(p => 
        p.id === puzzle.id ? { 
          ...puzzle, 
          ...newPuzzle,
          answer: newPuzzle.answer.toLowerCase().trim()
        } : p
      );
      setPuzzles(updatedPuzzles);
      setEditingPuzzle(null);
      setNewPuzzle({ question: '', answer: '', difficulty: 'medium' });
      playSound('success');
    } else {
      setEditingPuzzle(puzzle);
      setNewPuzzle({ 
        question: puzzle.question, 
        answer: puzzle.answer, 
        difficulty: puzzle.difficulty 
      });
    }
  };

  const handleDeletePuzzle = (id: string) => {
    setPuzzles(puzzles.filter(puzzle => puzzle.id !== id));
    setAttempts(attempts.filter(attempt => attempt.puzzleId !== id));
    playSound('error');
  };

  const togglePuzzleStatus = (id: string) => {
    setPuzzles(puzzles.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
    playSound('click');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'hard': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'super_hard': return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
      default: return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'super_hard': return 'SUPER HARD';
      default: return difficulty.toUpperCase();
    }
  };

  const getUserAttemptStatus = (puzzleId: string) => {
    if (!user) return null;
    
    const userAttempts = attempts.filter(a => a.puzzleId === puzzleId && a.userId === user.id);
    const correctAttempt = userAttempts.find(a => a.isCorrect === true);
    const pendingAttempt = userAttempts.find(a => a.isCorrect === null);
    
    if (correctAttempt) return 'correct';
    if (pendingAttempt) return 'pending';
    return null;
  };

  const activePuzzles = puzzles.filter(p => p.isActive);
  const leaderboard = calculateLeaderboard();
  const userScore = user ? leaderboard.find(l => l.userId === user.id) : null;

  // Get current week puzzles and auto-generated count
  const currentWeek = getCurrentWeek();
  const currentYear = new Date().getFullYear();
  const currentWeekPuzzles = puzzles.filter(p => p.weekNumber === currentWeek && p.year === currentYear);
  const autoGeneratedCount = puzzles.filter(p => p.autoGenerated).length;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md border border-purple-500/30 mb-6">
            <Brain className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Weekly Brain Challenge</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Warrior Puzzles
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Test your wit in our weekly puzzle competition. Earn points and climb the leaderboard!
          </p>
          
          {/* Auto-generation Info */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="inline-flex items-center px-3 py-2 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              <Zap className="w-4 h-4 mr-2" />
              <span className="text-sm">Auto-Generated: {autoGeneratedCount} puzzles</span>
            </div>
            <div className="inline-flex items-center px-3 py-2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">Week {currentWeek}: {currentWeekPuzzles.length} puzzles</span>
            </div>
          </div>
        </div>

        {/* User Score Display */}
        {user && userScore && (
          <GlassCard className="p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Your Warrior Stats</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rank #{userScore.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">{userScore.totalScore}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-1">
            <button
              onClick={() => setActiveTab('puzzles')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'puzzles'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-2" />
              Puzzles
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && activeTab === 'puzzles' && (
          <div className="flex justify-center mb-8 space-x-4">
            <AnimatedButton
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddingNew(true)}
              soundType="click"
            >
              Add Manual Puzzle
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              icon={RefreshCw}
              onClick={handleGenerateNewPuzzles}
              soundType="success"
            >
              Generate New Puzzles
            </AnimatedButton>
          </div>
        )}

        {/* Add/Edit Puzzle Form */}
        {isAdmin && (isAddingNew || editingPuzzle) && (
          <GlassCard className="p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {editingPuzzle ? 'Edit Puzzle' : 'Add Manual Puzzle'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question
                </label>
                <textarea
                  value={newPuzzle.question}
                  onChange={(e) => setNewPuzzle({ ...newPuzzle, question: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                  rows={4}
                  placeholder="Enter your puzzle question..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer (one word)
                </label>
                <input
                  type="text"
                  value={newPuzzle.answer}
                  onChange={(e) => setNewPuzzle({ ...newPuzzle, answer: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="Enter the answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={newPuzzle.difficulty}
                  onChange={(e) => setNewPuzzle({ ...newPuzzle, difficulty: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                >
                  <option value="easy">Easy (5 points)</option>
                  <option value="medium">Medium (10 points)</option>
                  <option value="hard">Hard (15 points)</option>
                  <option value="super_hard">Super Hard (20 points)</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <AnimatedButton
                  variant="primary"
                  onClick={editingPuzzle ? () => handleEditPuzzle(editingPuzzle) : handleAddPuzzle}
                  soundType="success"
                >
                  {editingPuzzle ? 'Update Puzzle' : 'Add Puzzle'}
                </AnimatedButton>
                <AnimatedButton
                  variant="ghost"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingPuzzle(null);
                    setNewPuzzle({ question: '', answer: '', difficulty: 'medium' });
                  }}
                  soundType="click"
                >
                  Cancel
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Puzzles Tab */}
        {activeTab === 'puzzles' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {activePuzzles.map((puzzle) => {
              const attemptStatus = getUserAttemptStatus(puzzle.id);
              const score = getScoreByDifficulty(puzzle.difficulty);
              
              return (
                <div key={puzzle.id} className="relative group">
                  <GlassCard className="p-6 h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(puzzle.difficulty)}`}>
                          {getDifficultyLabel(puzzle.difficulty)} • {score} PTS
                        </span>
                        {puzzle.autoGenerated && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            <Zap className="w-3 h-3 inline mr-1" />
                            Auto
                          </span>
                        )}
                      </div>
                      
                      {attemptStatus && (
                        <div className="flex items-center space-x-1">
                          {attemptStatus === 'correct' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {attemptStatus === 'pending' && (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-800 dark:text-white text-lg leading-relaxed mb-6">
                      {puzzle.question}
                    </p>

                    {user && attemptStatus !== 'correct' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={userAnswers[puzzle.id] || ''}
                          onChange={(e) => setUserAnswers({ ...userAnswers, [puzzle.id]: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                          placeholder="Your one-word answer..."
                          disabled={attemptStatus === 'pending'}
                        />
                        <AnimatedButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleSubmitAnswer(puzzle.id)}
                          className="w-full"
                          disabled={!userAnswers[puzzle.id]?.trim() || attemptStatus === 'pending'}
                          soundType={attemptStatus === 'pending' ? 'click' : 'success'}
                        >
                          {attemptStatus === 'pending' ? 'Under Review' : 'Submit Answer'}
                        </AnimatedButton>
                      </div>
                    )}

                    {attemptStatus === 'correct' && (
                      <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-400 font-medium">Solved! +{score} points</p>
                      </div>
                    )}

                    {!user && (
                      <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400">Sign in to participate in puzzles</p>
                      </div>
                    )}
                  </GlassCard>

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                      <button
                        onClick={() => togglePuzzleStatus(puzzle.id)}
                        className={`p-2 rounded-lg transition-colors duration-300 ${
                          puzzle.isActive 
                            ? 'bg-green-500/80 hover:bg-green-600/80' 
                            : 'bg-gray-500/80 hover:bg-gray-600/80'
                        } text-white`}
                      >
                        {puzzle.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEditPuzzle(puzzle)}
                        className="p-2 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg transition-colors duration-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePuzzle(puzzle.id)}
                        className="p-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-lg transition-colors duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Warrior Leaderboard
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Week {getCurrentWeek()} • {new Date().getFullYear()}
                </div>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No scores yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Be the first to solve a puzzle and claim your spot!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((score, index) => (
                    <div
                      key={score.userId}
                      className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                        index < 3 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30' 
                          : 'bg-white/5 dark:bg-gray-800/20'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-purple-500'
                      }`}>
                        {index < 3 ? <Crown className="w-5 h-5" /> : score.rank}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-white">
                          {score.userName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {score.correctAnswers} solved • {score.totalAttempts} attempts
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {score.totalScore}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total Points
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {score.weeklyScore}
                        </div>
                        <div className="text-xs text-gray-500">
                          This Week
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {activePuzzles.length === 0 && activeTab === 'puzzles' && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              No active puzzles
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-4">
              Check back later for new weekly challenges!
            </p>
            {isAdmin && (
              <AnimatedButton
                variant="primary"
                icon={RefreshCw}
                onClick={handleGenerateNewPuzzles}
                soundType="success"
              >
                Generate Puzzles Now
              </AnimatedButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};