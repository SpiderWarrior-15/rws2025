import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, Users, Calendar, BarChart3, Eye, Send, CheckCircle, AlertCircle, Download, Filter } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { ScrollableContainer } from '../components/ScrollableContainer';
import { FormBuilder } from '../components/FormBuilder';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../contexts/RealtimeContext';
import { CustomForm, FormSubmission, FormField } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export const Forms: React.FC = () => {
  const { user } = useAuth();
  const { broadcastUpdate } = useRealtime();
  const [forms, setForms] = useLocalStorage<CustomForm[]>('rws-forms', []);
  const [submissions, setSubmissions] = useLocalStorage<FormSubmission[]>('rws-form-submissions', []);
  const [activeTab, setActiveTab] = useState<'available' | 'my-submissions' | 'admin'>('available');
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'admin';
  const availableForms = forms.filter(form => 
    form.isActive && 
    form.isApproved &&
    (selectedCategory === 'all' || form.category === selectedCategory) &&
    (searchQuery === '' || form.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const userSubmissions = submissions.filter(sub => sub.userId === user?.id);

  const categories = [
    { id: 'all', name: 'All Forms' },
    { id: 'event', name: 'Events' },
    { id: 'survey', name: 'Surveys' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'registration', name: 'Registration' },
    { id: 'quiz', name: 'Quizzes' },
    { id: 'other', name: 'Other' }
  ];

  const handleFormSubmit = async (form: CustomForm) => {
    if (!user) {
      toast.error('Please sign in to submit forms');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate required fields
      const missingFields = form.fields
        .filter(field => field.required && !formData[field.id])
        .map(field => field.label);

      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Check if multiple submissions are allowed
      if (!form.allowMultipleSubmissions) {
        const existingSubmission = submissions.find(
          sub => sub.formId === form.id && sub.userId === user.id
        );
        if (existingSubmission) {
          toast.error('You have already submitted this form.');
          setIsSubmitting(false);
          return;
        }
      }

      const submission: FormSubmission = {
        id: uuidv4(),
        formId: form.id,
        userId: user.id,
        username: user.username,
        responses: { ...formData },
        submittedAt: new Date().toISOString(),
        ipAddress: 'localhost' // In production, get real IP
      };

      setSubmissions([...submissions, submission]);
      setFormData({});
      setSelectedForm(null);
      
      // Update user stats
      const updatedUser = {
        ...user,
        stats: {
          ...user.stats,
          formsSubmitted: user.stats.formsSubmitted + 1
        },
        activityLog: [
          ...user.activityLog,
          {
            id: uuidv4(),
            description: `Submitted form: ${form.title}`,
            timestamp: new Date().toISOString(),
            xpGained: 5,
            type: 'form' as const
          }
        ]
      };

      // Broadcast update
      broadcastUpdate('form_submitted', { formId: form.id, userId: user.id });
      
      toast.success('Form submitted successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveForm = (formData: Omit<CustomForm, 'id' | 'createdAt' | 'createdBy'>) => {
    if (editingForm) {
      const updatedForm = {
        ...editingForm,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      setForms(forms.map(f => f.id === editingForm.id ? updatedForm : f));
      toast.success('Form updated successfully!');
    } else {
      const newForm: CustomForm = {
        ...formData,
        id: uuidv4(),
        createdBy: user?.id || 'admin',
        createdAt: new Date().toISOString()
      };
      setForms([...forms, newForm]);
      toast.success('Form created successfully!');
    }
    
    setIsFormBuilderOpen(false);
    setEditingForm(null);
    broadcastUpdate('form_created', { formId: editingForm?.id || 'new' });
  };

  const handleDeleteForm = (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      setForms(forms.filter(f => f.id !== formId));
      // Also remove related submissions
      setSubmissions(submissions.filter(s => s.formId !== formId));
      toast.success('Form deleted successfully');
      broadcastUpdate('form_deleted', { formId });
    }
  };

  const handleToggleForm = (formId: string) => {
    setForms(forms.map(f => 
      f.id === formId ? { ...f, isActive: !f.isActive } : f
    ));
    const form = forms.find(f => f.id === formId);
    toast.success(`Form ${form?.isActive ? 'deactivated' : 'activated'}`);
  };

  const exportSubmissions = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    const formSubmissions = submissions.filter(s => s.formId === formId);
    
    if (!form || formSubmissions.length === 0) {
      toast.error('No submissions to export');
      return;
    }

    const csvContent = [
      // Header
      ['Submitted At', 'Username', ...form.fields.map(f => f.label)].join(','),
      // Data rows
      ...formSubmissions.map(sub => [
        format(new Date(sub.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
        sub.username,
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
    toast.success('Submissions exported successfully!');
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
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
            rows={4}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
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
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
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
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
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
          <div className="flex bg-white/10 backdrop-blur-md rounded-lg p-1">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'available'
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-green-600'
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
                  : 'text-gray-700 dark:text-gray-300 hover:text-green-600'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              My Submissions ({userSubmissions.length})
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-600'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Admin Panel
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {activeTab === 'available' && (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-white text-sm"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-white text-sm"
              placeholder="Search forms..."
            />
          </div>
        )}

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

                  <div className="text-sm text-gray-500 mb-4">
                    {form.fields.length} fields • Created {format(new Date(form.createdAt), 'MMM dd, yyyy')}
                  </div>

                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    icon={Eye}
                    onClick={() => setSelectedForm(form)}
                    className="w-full"
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
                        <div key={fieldId} className="p-3 bg-white/5 rounded-lg">
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
                <p className="text-gray-500">
                  Fill out some forms to see your submissions here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Admin Panel */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Form Management
              </h2>
              <AnimatedButton
                variant="primary"
                icon={Plus}
                onClick={() => setIsFormBuilderOpen(true)}
              >
                Create Form
              </AnimatedButton>
            </div>

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
                          {form.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
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
                        icon={BarChart3}
                        className="flex-1"
                      >
                        Analytics
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
          </div>
        )}

        {/* Form Builder Modal */}
        <FormBuilder
          isOpen={isFormBuilderOpen}
          onClose={() => {
            setIsFormBuilderOpen(false);
            setEditingForm(null);
          }}
          onSave={handleSaveForm}
          editingForm={editingForm}
        />

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
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    ✕
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
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Form'}
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      onClick={() => {
                        setSelectedForm(null);
                        setFormData({});
                      }}
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
            <p className="text-gray-500">
              {searchQuery ? `No forms found matching "${searchQuery}"` : 'Check back later for new forms and surveys'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};