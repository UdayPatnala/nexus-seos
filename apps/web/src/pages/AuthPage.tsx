import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, fullName);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass rounded-2xl p-8 relative z-10 shadow-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-indigo-500/10">N</div>
            <span className="brand-flashy text-2xl font-extrabold">Nexus SEOS</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Software Engineering Operating System</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === m ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name</label>
              <input
                className="input-field shadow-sm bg-white"
                placeholder="Jane Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
            <input
              className="input-field shadow-sm bg-white"
              type="email"
              placeholder="you@nexus.dev"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Password</label>
            <input
              className="input-field shadow-sm bg-white"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
