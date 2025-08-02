import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import {
  Eye,
  EyeOff,
  Shield,
  Users,
  MessageSquare,
  Upload,
  Settings,
  BarChart3
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/users.json')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
        setError('Error loading user data.');
        setLoading(false);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const foundUser = users.find(
      (user) =>
        user.email === email &&
        user.password === password &&
        user.approved === true
    );

    if (!foundUser) {
      setError('Invalid credentials or user not approved.');
      return;
    }

    localStorage.setItem('rws-user', JSON.stringify(foundUser));

    if (foundUser.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white p-4">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-2">RWS Login</h1>
        <p className="text-gray-400">Enter your credentials to access the squad</p>
      </motion.div>

      {loading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : (
        <motion.form
          onSubmit={handleLogin}
          className="bg-white/10 p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {error && (
            <div className="bg-red-500/20 text-red-400 p-2 rounded text-sm">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold block mb-1">Email</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-white/20 outline-none text-white"
              placeholder="you@rws.com"
            />
          </div>

          <div className="relative">
            <label className="text-sm font-semibold block mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-white/20 outline-none text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-2 top-8 text-gray-300 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg font-semibold transition"
          >
            <LogIn size={20} />
            Login
          </button>
        </motion.form>
      )}

      {/* Sidebar legend for UI purposes */}
      <div className="mt-12 max-w-md w-full text-sm text-gray-500 space-y-2">
        <div className="flex items-center gap-2">
          <Shield size={16} /> Admins go to the Admin Dashboard
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} /> Warriors go to their Dashboard
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 size={16} /> Realtime system in progress
        </div>
        <div className="flex items-center gap-2">
          <Upload size={16} /> User data loads from `users.json`
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare size={16} /> Error handling included
        </div>
        <div className="flex items-center gap-2">
          <Settings size={16} /> Extendable with Google Login, password hashing
        </div>
      </div>
    </div>
  );
}
