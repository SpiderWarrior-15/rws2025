import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Type, 
  Mail, 
  Hash, 
  Calendar, 
  CheckSquare, 
  Circle, 
  ChevronDown, 
  Upload,
  Eye,
  Save,
  Settings,
  Wand2,
  Copy,
  Download,
  GripVertical
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { ScrollableContainer } from './ScrollableContainer';
import { CustomForm, FormField } from '../types';
import toast from 'react-hot-toast';

interface FormBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: Omit<CustomForm, 'id' | 'createdAt' | 'createdBy'>) => void;
  editingForm?: CustomForm | null;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  editingForm
}) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'settings'>('builder');
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [formSettings, setFormSettings] = useState({
    title: '',
    description: '',
    category: 'survey' as const,
    deadline: '',
    isActive: true,
    requiresApproval: false,
    isApproved: true,
    allowMultipleSubmissions: false
  });

  useEffect(() => {
    if (editingForm) {
      setFormSettings({
        title: editingForm.title,
        description: editingForm.description,
        category: editingForm.category,
        deadline: editingForm.deadline || '',
        isActive: editingForm.isActive,
        requiresApproval: editingForm.requiresApproval,
        isApproved: editingForm.isApproved,
        allowMultipleSubmissions: editingForm.allowMultipleSubmissions
      });
      setFields(editingForm.fields);
    } else {
      setFormSettings({
        title: '',
        description: '',
        category: 'survey',
        deadline: '',
        isActive: true,
        requiresApproval: false,
        isApproved: true,
        allowMultipleSubmissions: false
      });
      setFields([]);
    }
  }, [editingForm]);

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: Type, description: 'Single line text input' },
    { value: 'textarea', label: 'Text Area', icon: Type, description: 'Multi-line text input' },
    { value: 'email', label: 'Email', icon: Mail, description: 'Email address input' },
    { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
    { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Multiple choice options' },
    { value: 'radio', label: 'Radio Button', icon: Circle, description: 'Single choice options' },
    { value: 'select', label: 'Dropdown', icon: ChevronDown, description: 'Dropdown selection' },
    { value: 'file', label: 'File Upload', icon: Upload, description: 'File upload field' }
  ];

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: type === 'text' || type === 'textarea' || type === 'email' ? `Enter ${type}...` : undefined,
      required: false,
      options: ['checkbox', 'radio', 'select'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
      validation: {
        minLength: type === 'text' || type === 'textarea' ? 1 : undefined,
        maxLength: type === 'text' ? 100 : type === 'textarea' ? 500 : undefined
      }
    };
    setFields([...fields, newField]);
    toast.success(`${type} field added`);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    toast.success('Field removed');
  };

  const duplicateField = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const duplicatedField = {
        ...field,
        id: `field_${Date.now()}`,
        label: `${field.label} (Copy)`
      };
      const index = fields.findIndex(f => f.id === fieldId);
      const newFields = [...fields];
      newFields.splice(index + 1, 0, duplicatedField);
      setFields(newFields);
      toast.success('Field duplicated');
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const handleSave = () => {
    if (!formSettings.title || !formSettings.description || fields.length === 0) {
      toast.error('Please fill in all required fields and add at least one form field');
      return;
    }

    onSave({
      ...formSettings,
      fields
    });
  };

  const renderFieldPreview = (field: FormField) => {
    const value = previewData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => setPreviewData({ ...previewData, [field.id]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setPreviewData({ ...previewData, [field.id]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            rows={4}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setPreviewData({ ...previewData, [field.id]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                  onChange={(e) => setPreviewData({ ...previewData, [field.id]: e.target.value })}
                  className="text-purple-600 focus:ring-purple-500"
                  required={field.required}
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
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
                    setPreviewData({ ...previewData, [field.id]: newValues });
                  }}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setPreviewData({ ...previewData, [field.id]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                setPreviewData({ ...previewData, [field.id]: file.name });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-7xl max-h-[95vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {editingForm ? 'Edit Form' : 'Form Builder'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create dynamic forms with drag-and-drop simplicity
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'builder', name: 'Builder', icon: Settings },
              { id: 'preview', name: 'Preview', icon: Eye },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-400 border-b-2 border-purple-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'builder' && (
              <div className="grid lg:grid-cols-3 gap-6 p-6 h-full">
                {/* Field Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Field Types
                  </h3>
                  <ScrollableContainer maxHeight="calc(100vh - 300px)">
                    <div className="space-y-2">
                      {fieldTypes.map(({ value, label, icon: Icon, description }) => (
                        <motion.button
                          key={value}
                          onClick={() => addField(value as FormField['type'])}
                          className="w-full flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 text-left group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <Icon className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">{label}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </ScrollableContainer>
                </div>

                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Form Fields ({fields.length})
                    </h3>
                    {fields.length > 0 && (
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setFields([])}
                        className="text-red-500"
                      >
                        Clear All
                      </AnimatedButton>
                    )}
                  </div>

                  <ScrollableContainer maxHeight="calc(100vh - 350px)">
                    {fields.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No fields added yet</p>
                        <p className="text-sm mt-2">Add fields from the left panel to start building your form</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <motion.div
                            key={field.id}
                            className="p-4 bg-white/5 rounded-lg border border-white/20"
                            layout
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                <span className="text-sm font-medium text-purple-400 capitalize">
                                  {field.type}
                                </span>
                                {field.required && (
                                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => duplicateField(field.id)}
                                  className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                                  title="Duplicate field"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeField(field.id)}
                                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                  title="Remove field"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm"
                                placeholder="Field label"
                              />

                              {(field.type === 'text' || field.type === 'textarea' || field.type === 'email') && (
                                <input
                                  type="text"
                                  value={field.placeholder || ''}
                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm"
                                  placeholder="Placeholder text"
                                />
                              )}

                              {(field.type === 'checkbox' || field.type === 'radio' || field.type === 'select') && (
                                <div>
                                  <label className="block text-xs text-gray-400 mb-2">Options (one per line)</label>
                                  <textarea
                                    value={field.options?.join('\n') || ''}
                                    onChange={(e) => updateField(field.id, { 
                                      options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                    })}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm resize-none"
                                    rows={3}
                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                  />
                                </div>
                              )}

                              <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                    className="text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="text-xs text-gray-400">Required</span>
                                </label>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollableContainer>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      {formSettings.title || 'Untitled Form'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formSettings.description || 'No description provided'}
                    </p>
                  </div>

                  <ScrollableContainer maxHeight="calc(100vh - 400px)">
                    <form className="space-y-6">
                      {fields.map((field) => (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {renderFieldPreview(field)}
                        </div>
                      ))}
                      
                      {fields.length > 0 && (
                        <div className="pt-6">
                          <AnimatedButton
                            variant="primary"
                            className="w-full"
                            disabled
                          >
                            Submit Form (Preview Mode)
                          </AnimatedButton>
                        </div>
                      )}
                    </form>
                  </ScrollableContainer>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Form Title
                      </label>
                      <input
                        type="text"
                        value={formSettings.title}
                        onChange={(e) => setFormSettings({ ...formSettings, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                        placeholder="Enter form title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={formSettings.category}
                        onChange={(e) => setFormSettings({ ...formSettings, category: e.target.value as any })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      >
                        <option value="event">Event</option>
                        <option value="survey">Survey</option>
                        <option value="feedback">Feedback</option>
                        <option value="registration">Registration</option>
                        <option value="quiz">Quiz</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formSettings.description}
                      onChange={(e) => setFormSettings({ ...formSettings, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                      rows={4}
                      placeholder="Describe the purpose of this form"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deadline (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formSettings.deadline}
                      onChange={(e) => setFormSettings({ ...formSettings, deadline: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white">Form Settings</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                        <input
                          type="checkbox"
                          checked={formSettings.isActive}
                          onChange={(e) => setFormSettings({ ...formSettings, isActive: e.target.checked })}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">Active Form</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Form is visible to users</p>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                        <input
                          type="checkbox"
                          checked={formSettings.allowMultipleSubmissions}
                          onChange={(e) => setFormSettings({ ...formSettings, allowMultipleSubmissions: e.target.checked })}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">Multiple Submissions</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Users can submit multiple times</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6 border-t border-white/10">
                    <AnimatedButton
                      variant="primary"
                      icon={Save}
                      onClick={handleSave}
                      className="flex-1"
                      disabled={!formSettings.title || !formSettings.description || fields.length === 0}
                    >
                      {editingForm ? 'Update Form' : 'Create Form'}
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      onClick={onClose}
                    >
                      Cancel
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};