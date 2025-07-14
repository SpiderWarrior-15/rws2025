import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Type, Mail, Hash, Calendar, CheckSquare, Circle, ChevronDown, Upload } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { CustomForm, FormField } from '../types';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'survey' as const,
    isActive: true,
    allowMultipleSubmissions: false,
    deadline: ''
  });
  
  const [fields, setFields] = useState<FormField[]>([]);

  useEffect(() => {
    if (editingForm) {
      setFormData({
        title: editingForm.title,
        description: editingForm.description,
        category: editingForm.category,
        isActive: editingForm.isActive,
        allowMultipleSubmissions: editingForm.allowMultipleSubmissions,
        deadline: editingForm.deadline || ''
      });
      setFields(editingForm.fields);
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'survey',
        isActive: true,
        allowMultipleSubmissions: false,
        deadline: ''
      });
      setFields([]);
    }
  }, [editingForm]);

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: Type },
    { value: 'textarea', label: 'Text Area', icon: Type },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { value: 'radio', label: 'Radio Button', icon: Circle },
    { value: 'select', label: 'Dropdown', icon: ChevronDown },
    { value: 'file', label: 'File Upload', icon: Upload }
  ];

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      required: false,
      options: type === 'checkbox' || type === 'radio' || type === 'select' ? ['Option 1', 'Option 2'] : undefined
    };
    setFields([...fields, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSave = () => {
    if (!formData.title.trim() || fields.length === 0) {
      alert('Please provide a title and at least one field');
      return;
    }

    onSave({
      ...formData,
      fields
    });
  };

  const updateFieldOptions = (fieldId: string, options: string[]) => {
    updateField(fieldId, { options: options.filter(opt => opt.trim()) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {editingForm ? 'Edit Form' : 'Create New Form'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Settings */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Form Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  placeholder="Enter form title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                  rows={3}
                  placeholder="Describe the purpose of this form"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  >
                    <option value="event">Event</option>
                    <option value="survey">Survey</option>
                    <option value="feedback">Feedback</option>
                    <option value="registration">Registration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deadline (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Form is active</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.allowMultipleSubmissions}
                    onChange={(e) => setFormData({ ...formData, allowMultipleSubmissions: e.target.checked })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Allow multiple submissions</span>
                </label>
              </div>

              {/* Field Types */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Add Fields
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {fieldTypes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => addField(value as FormField['type'])}
                      className="flex items-center space-x-2 p-3 bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-700/30 rounded-lg transition-colors duration-300 text-sm"
                    >
                      <Icon className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-800 dark:text-white">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Form Fields ({fields.length})
              </h3>

              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No fields added yet. Add fields from the left panel.
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-white/5 dark:bg-gray-800/20 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <span className="text-sm font-medium text-purple-400 capitalize">
                            {field.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveField(field.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveField(field.id, 'down')}
                            disabled={index === fields.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeField(field.id)}
                            className="p-1 text-red-400 hover:text-red-600"
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
                          className="w-full px-3 py-2 bg-white/10 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/30 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm"
                          placeholder="Field label"
                        />

                        {(field.type === 'text' || field.type === 'textarea' || field.type === 'email') && (
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/30 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm"
                            placeholder="Placeholder text"
                          />
                        )}

                        {(field.type === 'checkbox' || field.type === 'radio' || field.type === 'select') && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">Options (one per line)</label>
                            <textarea
                              value={field.options?.join('\n') || ''}
                              onChange={(e) => updateFieldOptions(field.id, e.target.value.split('\n'))}
                              className="w-full px-3 py-2 bg-white/10 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/30 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm resize-none"
                              rows={3}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                          </div>
                        )}

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs text-gray-400">Required field</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 mt-8 pt-6 border-t border-white/10 dark:border-gray-700/30">
            <AnimatedButton
              variant="primary"
              onClick={handleSave}
              disabled={!formData.title.trim() || fields.length === 0}
              className="flex-1"
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
      </GlassCard>
    </div>
  );
};