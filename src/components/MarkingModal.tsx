import React, { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { MarkingCriteria, WarriorMember, Mark } from '../types';

interface MarkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  warrior: WarriorMember;
  criteria: MarkingCriteria[];
  onSubmitMark: (mark: Omit<Mark, 'id' | 'markedAt'>) => void;
}

export const MarkingModal: React.FC<MarkingModalProps> = ({
  isOpen,
  onClose,
  warrior,
  criteria,
  onSubmitMark
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCriteria && score > 0) {
      onSubmitMark({
        warriorId: warrior.id,
        criteriaId: selectedCriteria,
        score,
        feedback: feedback.trim() || undefined,
        markedBy: 'admin'
      });
      setSelectedCriteria('');
      setScore(0);
      setFeedback('');
      onClose();
    }
  };

  const selectedCriteriaData = criteria.find(c => c.id === selectedCriteria);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Mark Warrior
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {warrior.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Criteria Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marking Criteria
              </label>
              <select
                value={selectedCriteria}
                onChange={(e) => setSelectedCriteria(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                required
              >
                <option value="">Select criteria...</option>
                {criteria.filter(c => c.isActive).map(criteria => (
                  <option key={criteria.id} value={criteria.id}>
                    {criteria.name} (Max: {criteria.maxScore})
                  </option>
                ))}
              </select>
              {selectedCriteriaData && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {selectedCriteriaData.description}
                </p>
              )}
            </div>

            {/* Score Input */}
            {selectedCriteriaData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Score (0 - {selectedCriteriaData.maxScore})
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max={selectedCriteriaData.maxScore}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="flex-1 h-2 bg-white/20 dark:bg-gray-700/50 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center space-x-1 min-w-[60px]">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                      {score}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>
            )}

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                rows={4}
                placeholder="Provide constructive feedback..."
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <AnimatedButton
                type="submit"
                variant="primary"
                icon={Star}
                className="flex-1"
                disabled={!selectedCriteria || score === 0}
              >
                Submit Mark
              </AnimatedButton>
              <AnimatedButton
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </AnimatedButton>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};