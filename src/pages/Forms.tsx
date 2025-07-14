import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, Users, Calendar, BarChart3, Eye, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useSounds } from '../hooks/useSounds';
import { CustomForm, FormSubmission, FormField } from '../types';
import { format } from 'date-fns';

export const Forms: React.FC = () => {
  const { user } = useAuth();
  const { playSound } = useSounds();
  const [forms, setForms] = useLocalStorage<CustomForm[]>('rws-forms', []);
  const [submissions, setSubmissions] = useLocalStorage<FormSubmission[]>('rws-form-submissions', []);
  const [activeTab, setActiveTab] = useState<'available' | 'my-submissions'>('available');
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.accountType === 'admin';
  const availableForms = forms.filter(form => form.isActive);
  const userSubmissions = submissions.filter(sub => sub.userId === user?.id);

  const handleFormSubmit = async (form: CustomForm) => {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Validate required fields
      const missingFields = form.fields
        .filter(field => field.required && !formData[field.id])
        .map(field => field.label);

      if (missingFields.length > 0) {
        alert(`Please fill in required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Check if multiple submissions are allowed
      if (!form.allowMultipleSubmissions) {
        const existingSubmission = submissions.find(
          sub => sub.formId === form.id && sub.userId === user.id
        );
        if (existingSubmission) {
          alert('You have already submitted this form.');
          setIsSubmitting(false);
          return;
        }
      }

      const submission: FormSubmission = {
        id: Date.now().toString(),
        formId: form.id,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        responses: { ...formData },
        submittedAt: new Date().toISOString(),
      };

      setSubmissions([...submissions, submission]);
      setFormData({});
      setSelectedForm(null);
      playSound('success');
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Error submitting form. Please try again.');
      playSound('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
            rows={4}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  className="text-purple-600 focus:ring-purple-500"
                  required={field.required}
                />
                <span className="text-gray-800 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    setFormData({ ...formData, [field.id]: newValues });
                  }}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-800 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
            required={field.required}
          />
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFormData({ ...formData, [field.id]: file.name });
              }
            }}
            className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view and submit forms
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
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-md border border-green-500/30 mb-6">
            <FileText className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-400">Interactive Forms</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Warrior Forms
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Participate in surveys, register for events, and provide feedback
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-1">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'available'
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Available Forms
            </button>
            <button
              onClick={() => setActiveTab('my-submissions')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'my-submissions'
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              My Submissions
            </button>
          </div>
        </div>

        {/* Available Forms */}
        {activeTab === 'available' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableForms.map((form) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      form.category === 'event' ? 'bg-purple-500/20 text-purple-400' :
                      form.category === 'survey' ? 'bg-blue-500/20 text-blue-400' :
                      form.category === 'feedback' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {form.category.toUpperCase()}
                    </span>
                    {form.deadline && (
                      <div className="text-xs text-gray-500">
                        Due: {format(new Date(form.deadline), 'MMM dd')}
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                    {form.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1">
                    {form.description}
                  </p>

                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {form.fields.length} fields • Created {format(new Date(form.createdAt), 'MMM dd, yyyy')}
                  </div>

                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    icon={Eye}
                    onClick={() => setSelectedForm(form)}
                    className="w-full"
                    soundType="click"
                  >
                    Fill Form
                  </AnimatedButton>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* My Submissions */}
        {activeTab === 'my-submissions' && (
          <div className="space-y-6">
            {userSubmissions.map((submission) => {
              const form = forms.find(f => f.id === submission.formId);
              if (!form) return null;

              return (
                <GlassCard key={submission.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {form.title}
                    </h3>
                    <div className="text-sm text-gray-500">
                      Submitted {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(submission.responses).map(([fieldId, value]) => {
                      const field = form.fields.find(f => f.id === fieldId);
                      if (!field) return null;

                      return (
                        <div key={fieldId} className="p-3 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {field.label}
                          </div>
                          <div className="text-gray-800 dark:text-white">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              );
            })}

            {userSubmissions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                  No submissions yet
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Fill out some forms to see your submissions here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form Modal */}
        {selectedForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {selectedForm.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {selectedForm.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedForm(null);
                      setFormData({});
                    }}
                    className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
                  >
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleFormSubmit(selectedForm);
                }} className="space-y-6">
                  {selectedForm.fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFormField(field)}
                    </div>
                  ))}

                  <div className="flex space-x-4 pt-6">
                    <AnimatedButton
                      type="submit"
                      variant="primary"
                      icon={Send}
                      disabled={isSubmitting}
                      className="flex-1"
                      soundType="success"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Form'}
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      onClick={() => {
                        setSelectedForm(null);
                        setFormData({});
                      }}
                      soundType="click"
                    >
                      Cancel
                    </AnimatedButton>
                  </div>
                </form>
              </div>
            </GlassCard>
          </div>
        )}

        {availableForms.length === 0 && activeTab === 'available' && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              No forms available
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Check back later for new forms and surveys
            </p>
          </div>
        )}
      </div>
    </div>
  );
};