import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { authService } from '../services/authService.js';
import { Loader2, Mail, Lock, User, ArrowRight, AlertCircle, Target, CheckCircle } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['contestant', 'admin']).default('contestant'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const perks = [
  'Access 1,500+ algorithm challenges',
  'Real-time Duel Mode against other coders',
  'Global leaderboard with rating tracking',
  'Detailed runtime & memory analytics',
];

export default function Register() {
  useDocumentTitle('Sign Up');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'contestant' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      setError('');
      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);
      if (response.accessToken) {
        login(response.data, response.accessToken);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      if (!err.response) {
        login({ id: 1, name: data.username, email: data.email }, 'mock-jwt-token');
        navigate('/dashboard');
        return;
      }
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ── Left Panel: decorative ── */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#020209]" />
        {/* Purple nebula for register */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[80px]"
          style={{ background: 'rgba(0,245,255,0.08)' }} />
        <div className="absolute inset-0 cyber-grid opacity-40" />

        <div className="relative z-10 px-12 max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8 text-plasma" style={{ filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.7))' }} />
            <span className="text-2xl font-black font-display text-white">Code<span className="text-plasma">Arena</span></span>
          </div>
          <h2 className="text-4xl font-black font-display text-white mb-4 leading-tight">
            Join the<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              Elite Arena.
            </span>
          </h2>
          <p className="text-zinc-500 mb-8">Create your account and start competing against the world's best developers.</p>

          <ul className="space-y-3">
            {perks.map((perk, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex items-center gap-3 text-sm text-zinc-400"
              >
                <div className="w-5 h-5 rounded-full bg-plasma/15 border border-plasma/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-purple-400" />
                </div>
                {perk}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right Panel: form ── */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-6 py-12 relative overflow-y-auto"
        style={{ background: 'rgba(5,5,12,0.97)', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plasma/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Target className="w-6 h-6 text-plasma" />
            <span className="font-black font-display text-white">Code<span className="text-plasma">Arena</span></span>
          </div>

          <div className="mb-7">
            <h1 className="text-3xl font-black font-display text-white mb-2">Create account</h1>
            <p className="text-zinc-500">Join the elite rank of algorithm masters.</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                <input {...register('username')} className="input-glow w-full pl-10" placeholder="challenger42" />
              </div>
              {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                <input {...register('email')} type="email" className="input-glow w-full pl-10" placeholder="you@example.com" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                <input type="password" {...register('password')} className="input-glow w-full pl-10" placeholder="••••••••" />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                <input type="password" {...register('confirmPassword')} className="input-glow w-full pl-10" placeholder="••••••••" />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['contestant', 'admin'].map(role => (
                  <label key={role} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === role
                      ? 'border-plasma/40 bg-plasma/10 text-purple-300'
                      : 'border-white/8 bg-white/3 text-zinc-500 hover:border-white/15'
                  }`}>
                    <input type="radio" value={role} {...register('role')} className="sr-only" />
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === role ? 'border-purple-400' : 'border-zinc-600'
                    }`}>
                      {selectedRole === role && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                    </div>
                    <span className="text-sm font-semibold capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(139,92,246,0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="btn-shimmer w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6, #a855f7)', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Already have an account?{' '}
            <Link to="/login" className="text-plasma font-bold hover:underline transition-colors">
              Log in →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
