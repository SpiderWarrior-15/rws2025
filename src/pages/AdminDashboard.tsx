import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
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
  Download,
  Music,
  Upload,
  Ban,
  UserPlus,
  UserMinus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { ScrollableContainer } from '../components/ScrollableContainer';
import { FormBuilder } from '../components/FormBuilder';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../contexts/RealtimeContext';
import { 
  User,
  CustomForm,
  FormSubmission,
  Event,
  AlanWalkerTrack,
  ContactMessage,
  Notification
} from '../types';
import { dataService } from '../services/dataService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export const AdminDashboard: React.FC = () => {
  const { user, users, updateUser, promoteUser, banUser } = useAuth();
  const { broadcastUpdate } = useRealtime();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'forms' | 'music' | 'events' | 'messages' | 'settings'>('overview');
  const [forms, setForms] = useLocalStorage<CustomForm[]>('rws-forms', []);
  const [submissions, setSubmissions] = useLocalStorage<FormSubmission[]>('rws-form-submissions', []);
  const [events, setEvents] = useLocalStorage<Event[]>('rws-events', []);
  const [tracks, setTracks] = useLocalStorage<AlanWalkerTrack[]>('rws-alan-tracks', []);
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>('rws-contact-messages', []);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [selectedFormSubmissions, setSelectedFormSubmissions] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userEditForm, setUserEditForm] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    role: 'user' as const
  });

  const isAdmin = user?.role === 'admin';

  // Calculate dashboard stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isOnline && !u.isBanned).length,
    totalForms: forms.length,
    totalSubmissions: submissions.length,
    totalEvents: events.length,
    totalTracks: tracks.length,
    pendingTracks: tracks.filter(t => !t.isVerified).length,
    unreadMessages: messages.filter(m => !m.isRead).length,
    adminUsers: users.filter(u => u.role === 'admin').length
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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserEditForm({
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      role: user.role
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, {
        username: userEditForm.username,
        email: userEditForm.email,
        bio: userEditForm.bio,
        location: userEditForm.location,
        role: userEditForm.role
      });
      
      setEditingUser(null);
      toast.success('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const exportSubmissions = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    const formSubmissions = submissions.filter(s => s.formId === formId);
    
    if (!form || formSubmissions.length === 0) {
      toast.error('No submissions to export');
      return;
    }

    const csvContent = [
      ['Submitted At', 'Username', ...form.fields.map(f => f.label)].join(','),
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

  const exportUsers = () => {
    const csvContent = [
      ['Username', 'Email', 'Role', 'Level', 'XP', 'Joined', 'Last Active', 'Status'].join(','),
      ...users.map(u => [
        u.username,
        u.email,
        u.role,
        u.level.toString(),
        u.xp.toString(),
        format(new Date(u.createdAt), 'yyyy-MM-dd'),
        format(new Date(u.lastActive), 'yyyy-MM-dd HH:mm'),
        u.isBanned ? 'Banned' : u.isOnline ? 'Online' : 'Offline'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('User data exported successfully!');
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = searchQuery === '' || 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const tabItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'forms', name: 'Forms', icon: FileText },
    { id: 'music', name: 'Music Hub', icon: Music },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'settings', name: 'Settings', icon: Settings }
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
            <span className="text-lg font-semibold text-red-400">Admin Command Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Complete platform management and control center
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-lg min-w-max">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-500 hover:bg-white/10'
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
              <GlassCard className="p-6 text-center border-blue-500/20">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-400 mb-1">{stats.totalUsers}</div>
                <div className="text-sm text-gray-400">Total Warriors</div>
                <div className="text-xs text-green-400 mt-1">{stats.activeUsers} online</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-purple-500/20">
                <FileText className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-400 mb-1">{stats.totalForms}</div>
                <div className="text-sm text-gray-400">Forms Created</div>
                <div className="text-xs text-blue-400 mt-1">{stats.totalSubmissions} submissions</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-green-500/20">
                <Music className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.totalTracks}</div>
                <div className="text-sm text-gray-400">Music Tracks</div>
                <div className="text-xs text-yellow-400 mt-1">{stats.pendingTracks} pending</div>
              </GlassCard>

              <GlassCard className="p-6 text-center border-yellow-500/20">
                <MessageCircle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-yellow-400 mb-1">{messages.length}</div>
                <div className="text-sm text-gray-400">Messages</div>
                <div className="text-xs text-red-400 mt-1">{stats.unreadMessages} unread</div>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-8">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                  Pending Approvals
                </h3>
                <div className="space-y-3">
                  {tracks.filter(t => !t.isVerified).slice(0, 5).map(track => (
                    <div key={track.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{track.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">by {track.artist}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-500" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800 dark:text-white">New user registered</div>
                      <div className="text-xs text-gray-500">2 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800 dark:text-white">Form submitted</div>
                      <div className="text-xs text-gray-500">5 minutes ago</div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                User Management ({filteredUsers.length})
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-white text-sm"
                    placeholder="Search users..."
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-white text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>
                <AnimatedButton
                  variant="secondary"
                  icon={Download}
                  onClick={exportUsers}
                >
                  Export CSV
                </AnimatedButton>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(warrior => (
                <GlassCard key={warrior.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: warrior.avatar?.color || '#3b82f6' }}
                      >
                        {warrior.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {warrior.username}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {warrior.email}
                        </p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${warrior.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Role:</span>
                      <span className={`font-medium ${
                        warrior.role === 'admin' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {warrior.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Level:</span>
                      <span className="text-gray-800 dark:text-white">{warrior.level}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">XP:</span>
                      <span className="text-gray-800 dark:text-white">{warrior.xp}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                      <span className="text-gray-800 dark:text-white">
                        {format(new Date(warrior.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditUser(warrior)}
                      className="flex-1"
                    >
                      Edit
                    </AnimatedButton>
                    {warrior.role === 'user' && (
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={UserPlus}
                        onClick={() => promoteUser(warrior.id, 'admin')}
                        className="bg-green-500/20 text-green-400"
                      >
                        Promote
                      </AnimatedButton>
                    )}
                    {warrior.role === 'admin' && warrior.id !== user?.id && (
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={UserMinus}
                        onClick={() => promoteUser(warrior.id, 'user')}
                        className="bg-yellow-500/20 text-yellow-400"
                      >
                        Demote
                      </AnimatedButton>
                    )}
                    {warrior.id !== user?.id && (
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        icon={Ban}
                        onClick={() => banUser(warrior.id)}
                        className="text-red-500"
                      >
                        Ban
                      </AnimatedButton>
                    )}
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
          </motion.div>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Music Hub Management
              </h2>
              <div className="flex space-x-4">
                <AnimatedButton
                  variant="secondary"
                  icon={Download}
                  onClick={() => {
                    const csvData = tracks.map(track => ({
                      title: track.title,
                      artist: track.artist,
                      category: track.category,
                      verified: track.isVerified ? 'Yes' : 'No',
                      uploadedAt: track.uploadedAt
                    }));
                    toast.success('Track data exported!');
                  }}
                >
                  Export Tracks
                </AnimatedButton>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map(track => (
                <GlassCard key={track.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      track.category === 'official' ? 'bg-blue-500/20 text-blue-400' :
                      track.category === 'remix' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {track.category.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          track.isVerified
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {track.isVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                      <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    {track.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    by {track.artist}
                  </p>

                  <div className="text-sm text-gray-500 mb-4">
                    Uploaded: {format(new Date(track.uploadedAt), 'MMM dd, yyyy')}
                  </div>

                  {track.youtubeUrl && (
                    <a
                      href={track.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      View on YouTube
                    </a>
                  )}
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Contact Messages ({messages.length})
            </h2>

            <div className="space-y-4">
              {messages.map(message => (
                <GlassCard key={message.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">{message.subject}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{message.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(message.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        message.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        message.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {message.priority.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        message.isRead ? 'bg-gray-500/20 text-gray-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {message.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {message.message}
                  </p>

                  {message.adminReply && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                      <h4 className="font-medium text-blue-400 mb-2">Admin Reply:</h4>
                      <p className="text-gray-800 dark:text-white text-sm">{message.adminReply}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Replied by {message.repliedBy} on {message.repliedAt && format(new Date(message.repliedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      Reply
                    </AnimatedButton>
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      icon={message.isRead ? Eye : EyeOff}
                    >
                      {message.isRead ? 'Mark Unread' : 'Mark Read'}
                    </AnimatedButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
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

        {/* User Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  Edit User: {editingUser.username}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={userEditForm.username}
                      onChange={(e) => setUserEditForm({ ...userEditForm, username: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userEditForm.email}
                      onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={userEditForm.role}
                      onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={userEditForm.bio}
                      onChange={(e) => setUserEditForm({ ...userEditForm, bio: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={userEditForm.location}
                      onChange={(e) => setUserEditForm({ ...userEditForm, location: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <AnimatedButton
                    variant="primary"
                    onClick={handleSaveUser}
                    className="flex-1"
                  >
                    Save Changes
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </div>
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
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                                    {submission.username}
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
      </div>
    </div>
  );
};