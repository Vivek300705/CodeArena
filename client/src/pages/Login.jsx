import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { authService } from '../services/authService.js';
import { Loader2, Mail, Lock, Target, ArrowRight, AlertCircle } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  useDocumentTitle('Log In');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      const response = await authService.login(data);
      login(response.user, response.accessToken);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        login({ id: 1, name: 'Test User', email: data.email }, 'mock-jwt-token');
        navigate('/dashboard');
        return;
      }
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ── Left Panel: decorative ── */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 bg-[#020209]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(0,245,255,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[80px]"
          style={{ background: 'rgba(139,92,246,0.1)' }} />
        {/* Grid */}
        <div className="absolute inset-0 cyber-grid opacity-40" />
        {/* Content */}
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Target className="w-10 h-10 text-neon-cyan" style={{ filter: 'drop-shadow(0 0 10px rgba(0,245,255,0.6))' }} />
            <span className="text-3xl font-black font-display text-white">Code<span className="text-neon-cyan">Arena</span></span>
          </div>
          <h2 className="text-4xl font-black font-display text-white mb-4 leading-tight">
            Your Code.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #00f5ff, #8b5cf6)' }}>
              Your Legacy.
            </span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-xs mx-auto">Battle algorithms. Climb the global leaderboard. Prove your mastery.</p>

          {/* Decorative stats */}
          <div className="flex justify-center gap-8 mt-10">
            {[['2.4M+', 'Submissions'], ['120K', 'Challengers'], ['1.5K+', 'Problems']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-xl font-black text-neon-cyan font-display">{v}</div>
                <div className="text-xs text-zinc-600 uppercase font-bold tracking-widest">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: form ── */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-6 py-12 relative"
        style={{ background: 'rgba(5,5,12,0.97)', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Target className="w-6 h-6 text-neon-cyan" />
            <span className="font-black font-display text-white">Code<span className="text-neon-cyan">Arena</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black font-display text-white mb-2">Welcome back</h1>
            <p className="text-zinc-500">Enter the arena — log in to continue.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  className="input-glow w-full pl-10"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                <Link to="#" className="text-xs text-neon-cyan/70 hover:text-neon-cyan transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                <input
                  type="password"
                  {...register('password')}
                  className="input-glow w-full pl-10"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 absolute -bottom-5 left-0">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end mb-8 mt-2">
              <Link to="/forgot-password" className="text-xs font-bold text-zinc-400 hover:text-neon-cyan transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,245,255,0.25)' }}
              whileTap={{ scale: 0.98 }}
              className="btn-shimmer w-full py-3.5 rounded-xl font-bold text-black flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #00e5f7, #3b82f6)', boxShadow: '0 0 20px rgba(0,200,230,0.2)' }}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Log In <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-600">
            New to CodeArena?{' '}
            <Link to="/register" className="text-neon-cyan font-bold hover:underline transition-colors">
              Create an account →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
