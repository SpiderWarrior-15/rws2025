// ✅ Default export — don't use { Login } when importing
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Eye,
  EyeOff,
  Shield,
  Users,
  MessageSquare,
  Upload,
  Settings,
  BarChart3
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/users.json')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  }, []);

  const handleLogin = () => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      navigate('/dashboard'); // or wherever you want to go
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <Shield size={32} /> Warrior Login
      </h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="w-full max-w-md bg-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 rounded bg-black border border-white"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-2 rounded bg-black border border-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <LogIn className="inline mr-2" /> Log In
        </button>
      </div>

      {loading && <p className="mt-4 text-gray-400">Loading users...</p>}
    </motion.div>
  );
};

export default Login; // ✅ DEFAULT EXPORT ONLY
